#!/usr/bin/env node
// HQ render tier (D80): song -> per-instrument stems -> sampled/synth render -> mix.
//
//   node scripts/render-hq.mjs <songdir | file.strudel> [--from a --to b]
//        [--out out.wav] [--stems] [--gain 1.0]
//
// Pipeline: evaluate the song's haps (the same queryArc ground truth the
// harness verifies), split them PER-HAP by sound name (so a single-label
// stack() still separates into piano/strings/flute stems), remap each stem's
// gains into its instrument's musical velocity band (the engine's mix balance
// is re-applied as the stem's mix volume), write per-stem MIDI, render each
// stem through its backend (sfizz / DawDreamer+Surge / fluidsynth fallback),
// and mix with ffmpeg. Deterministic given the same libraries and plugins.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { songHaps } from '../src/harness/evaluate.js';
import { songToMidi } from '../src/emit/midi.js';
import { renderWav } from './render-wav.mjs';
import { HQ_INSTRUMENTS, HQ_DEFAULTS } from '../src/lib/hq-instruments.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SFIZZ = join(ROOT, 'vendor', 'build', 'sfizz_render');
const PYTHON = join(ROOT, 'vendor', 'pyenv', 'bin', 'python');
const RENDER_VST = join(ROOT, 'scripts', 'render-vst.py');

const { values, positionals } = parseArgs({
  args: process.argv.slice(2), allowPositionals: true,
  options: {
    out: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' },
    stems: { type: 'boolean', default: false }, gain: { type: 'string' },
    meta: { type: 'string' },
  },
});
const target = positionals[0];
if (!target) { console.error('usage: render-hq <songdir|file.strudel> [--from a --to b] [--out out.wav] [--stems]'); process.exit(1); }

const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => (existsSync(p) ? JSON.parse(read(p)) : null);
let source, meta = null, outBase;
if (existsSync(target) && !target.endsWith('.strudel')) {
  const versions = readdirSync(target).map((f) => /^v(\d+)\.strudel$/.exec(f)).filter(Boolean).map((m) => Number(m[1]));
  if (!versions.length) { console.error(`no versions in ${target}`); process.exit(1); }
  const n = Math.max(...versions);
  source = read(join(target, `v${n}.strudel`));
  meta = readJson(join(target, `v${n}.meta.json`));
  outBase = join(target, 'song-hq');
} else {
  source = read(target);
  if (values.meta) meta = readJson(values.meta);
  outBase = target.replace(/\.strudel$/, '') + '-hq';
}
const from = values.from ? Number(values.from) : 0;
let to = values.to ? Number(values.to) : meta?.totalCycles;
if (to == null) { to = 16; console.log('warning: no --to and no meta totalCycles — rendering 16 cycles'); }
const meter = meta?.meter ?? '4/4';

const { evaluated, haps } = await songHaps(source, from, to);
const cpm = evaluated.cpm ?? 30;
const seconds = ((to - from) * 60) / cpm;

// ---- split haps per sound ---------------------------------------------------
const pitchOfV = (v) => (v && typeof v === 'object' && typeof v.note !== 'undefined' ? v.note : v?.n);
const stems = new Map(); // key -> { inst|null, labelMap: Map(label -> haps[]) }
const put = (key, inst, label, h) => {
  if (!stems.has(key)) stems.set(key, { inst, labelMap: new Map() });
  const s = stems.get(key);
  if (!s.labelMap.has(label)) s.labelMap.set(label, []);
  s.labelMap.get(label).push(h);
};
for (const [label, entry] of haps) {
  if (entry.error || entry.muted) continue;
  for (const h of entry.haps) {
    if (!h.whole || h.whole.begin.valueOf() < from - 1e-9) continue;
    const s = h.value?.s ?? 'piano';
    const inst = HQ_INSTRUMENTS[s];
    const patchOk = inst && ((inst.backend === 'sfz' && existsSync(join(ROOT, inst.sfz)))
      || (inst.backend === 'vst' && existsSync(join(ROOT, inst.plugin))));
    if (patchOk) put(`hq:${s}`, { ...HQ_DEFAULTS, ...inst, sound: s }, label, h);
    else put('__fluid', null, label, h);
  }
}
if (!stems.size) { console.error('no renderable haps'); process.exit(1); }

// ---- impulse response for the room reverb -----------------------------------
// Deterministic stereo IR: seeded exponential-decay noise, energy-normalized
// so convolution preserves loudness. Regenerated only when absent.
const IR_PATH = join(ROOT, 'vendor', 'build', 'room-ir.wav');
function makeIR() {
  const sr = 44100, secs = 2.2, n = Math.floor(sr * secs);
  let s = 0x9e3779b9;
  const rnd = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5; };
  const ch = [new Float64Array(n), new Float64Array(n)];
  for (let c = 0; c < 2; c++) {
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const env = Math.exp((-3.2 * i) / n) * (i < 40 ? i / 40 : 1);
      lp = lp * 0.72 + rnd() * 0.28; // soften highs like a real room tail
      ch[c][i] = lp * env;
    }
  }
  const energy = Math.sqrt(ch[0].reduce((a, x) => a + x * x, 0));
  const pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) {
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round((ch[c][i] / energy) * 32767 * 3))), (i * 2 + c) * 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  writeFileSync(IR_PATH, Buffer.concat([hdr, pcm]));
}
if (!existsSync(IR_PATH)) makeIR();

// ---- patch key coverage -----------------------------------------------------
// D83: a note outside an SFZ's sampled range renders as SILENCE — sfizz has no
// fallback region and no error. festival_drop's trumpet played keys 79-98
// against a patch that stops at 78: all 172 notes vanished from the mix. Notes
// outside the range are folded back by octaves instead of disappearing.
const keyRanges = new Map();
function sfzKeyRange(sfzRel) {
  if (!keyRanges.has(sfzRel)) {
    const src = readFileSync(join(ROOT, sfzRel), 'utf8');
    const los = [...src.matchAll(/\blokey=(\d+)/g)].map((m) => Number(m[1]));
    const his = [...src.matchAll(/\bhikey=(\d+)/g)].map((m) => Number(m[1]));
    keyRanges.set(sfzRel, los.length && his.length ? [Math.min(...los), Math.max(...his)] : [0, 127]);
  }
  return keyRanges.get(sfzRel);
}

// wet/dry per stem from its mean .room(): wav is replaced by the wet mix
function applyRoom(wavPath, room) {
  if (room < 0.15) return;
  const wet = Math.min(1.2, room * 1.1);
  const tmp = wavPath.replace(/\.wav$/, '-wet.wav');
  execFileSync('ffmpeg', ['-y', '-i', wavPath, '-i', IR_PATH,
    '-filter_complex', `[0:a][1:a]afir=dry=10:wet=10[rv];[0:a][rv]amix=inputs=2:weights=1 ${wet.toFixed(3)}:duration=longest:normalize=0`,
    '-ar', '44100', tmp], { stdio: 'pipe' });
  execFileSync('mv', [tmp, wavPath]);
}

// ---- build + render each stem ----------------------------------------------
const stemsDir = `${outBase}-stems`;
mkdirSync(stemsDir, { recursive: true });
const mixInputs = []; // { wav, volume }
const dbToLin = (db) => Math.pow(10, db / 20);

for (const [key, stem] of stems) {
  const name = key === '__fluid' ? 'fluid' : stem.inst.sound;
  const midPath = join(stemsDir, `${name}.mid`);
  const wavPath = join(stemsDir, `${name}.wav`);

  let stemMap;
  const allHaps = [...stem.labelMap.values()].flat();
  // room -> reverb wet amount for this stem (the page's .room() survives
  // into hap values; the render finally honors it — D80 addendum, "it's
  // supposed to be water yet the piano is still very dry")
  const rooms = allHaps.map((h) => (typeof h.value?.room === 'number' ? h.value.room : 0));
  const meanRoom = rooms.length ? rooms.reduce((a, x) => a + x, 0) / rooms.length : 0;
  const gainsAll = allHaps.map((h) => (typeof h.value?.gain === 'number' ? h.value.gain : 0.8));
  const meanGain = gainsAll.reduce((a, x) => a + x, 0) / gainsAll.length;
  if (key === '__fluid') {
    stemMap = new Map([...stem.labelMap].map(([label, hs]) => [label, { muted: false, haps: hs }]));
  } else {
    // velocity = ABSOLUTE gain x velScale: the engine's ear-tuned balance
    // maps straight onto the sampler's velocity curve (stem-relative
    // normalization stretched narrow bands to the top — the loud flute,
    // the "hammered at max dynamics" vamp piano). highSoft tapers very
    // high notes ("on really high flute notes it should automatically be
    // a bit softer otherwise it hurts the ears").
    const velScale = stem.inst.velScale ?? 1;
    const hs = stem.inst.highSoft ?? null;
    const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const midiOfV = (v) => {
      const n = v?.note ?? v?.n;
      if (typeof n === 'number') return n;
      const m = /^([a-gA-G])([#bsf]*)(-?\d+)$/.exec(String(n ?? ''));
      if (!m) return null;
      let pc = PC[m[1].toLowerCase()];
      for (const ch of m[2]) pc += (ch === '#' || ch === 's') ? 1 : -1;
      return pc + (Number(m[3]) + 1) * 12;
    };
    const remap = (g, m) => {
      let out = g * velScale;
      if (hs && m != null && m > hs.above) out -= (m - hs.above) * hs.per;
      return Math.min(0.98, Math.max(0.04, out));
    };
    // fold out-of-range pitches by octaves (D83); highSoft then reads the
    // pitch the sampler will actually play
    const [kLo, kHi] = stem.inst.backend === 'sfz' ? sfzKeyRange(stem.inst.sfz) : [0, 127];
    let folded = 0, unfoldable = 0;
    const fold = (m) => {
      if (m == null || m >= kLo && m <= kHi) return m;
      let out = m;
      while (out < kLo) out += 12;
      while (out > kHi) out -= 12;
      if (out < kLo || out > kHi) { unfoldable++; return m; } // range under an octave
      folded++;
      return out;
    };
    stemMap = new Map([...stem.labelMap].map(([label, hls]) => [
      `${label}/${name}`,
      { muted: false, haps: hls.map((h) => {
        const m = fold(midiOfV(h.value));
        return { ...h, value: {
          ...h.value,
          ...(m == null ? {} : { note: m }),
          gain: remap(typeof h.value?.gain === 'number' ? h.value.gain : 0.8, m),
        } };
      }) },
    ]));
    if (folded) console.log(`  ${name.padEnd(22)} folded ${folded} note(s) into the patch range ${kLo}..${kHi} (would have been silent)`);
    if (unfoldable) console.log(`  ${name.padEnd(22)} WARNING ${unfoldable} note(s) outside ${kLo}..${kHi} and unfoldable — they will be silent`);
  }

  const res = songToMidi(stemMap, { cpm, meter, from, title: name });
  writeFileSync(midPath, res.bytes);
  const notes = res.tracks.reduce((a, t) => a + t.notes, 0);

  if (key === '__fluid') {
    renderWav(midPath, wavPath, { gain: 0.7 });
    console.log(`  ${name.padEnd(22)} fluidsynth  ${String(notes).padStart(4)} notes  room ${meanRoom.toFixed(2)}`);
  } else if (stem.inst.backend === 'sfz') {
    execFileSync(SFIZZ, ['--sfz', join(ROOT, stem.inst.sfz), '--midi', midPath, '--wav', wavPath, '--samplerate', '44100'], { stdio: 'pipe' });
    console.log(`  ${name.padEnd(22)} sfizz       ${String(notes).padStart(4)} notes  gain ${meanGain.toFixed(2)}  room ${meanRoom.toFixed(2)}  (${basename(stem.inst.sfz)})`);
  } else {
    const args = [RENDER_VST, '--plugin', join(ROOT, stem.inst.plugin), '--midi', midPath, '--out', wavPath, '--duration', String(seconds + 3)];
    if (stem.inst.preset && existsSync(join(ROOT, stem.inst.preset))) args.push('--preset', join(ROOT, stem.inst.preset));
    execFileSync(PYTHON, args, { stdio: 'pipe' });
    console.log(`  ${name.padEnd(22)} surge/vst   ${String(notes).padStart(4)} notes  gain ${meanGain.toFixed(2)}  room ${meanRoom.toFixed(2)}${stem.inst.preset && existsSync(join(ROOT, stem.inst.preset)) ? `  (${basename(stem.inst.preset)})` : '  (init patch)'}`);
  }
  applyRoom(wavPath, meanRoom);
  mixInputs.push({ wav: wavPath, meanGain, trimDb: stem.inst?.trimDb ?? 0 });
}

// ---- mix --------------------------------------------------------------------
// D80 addendum: cross-stem balance by MEASURED loudness, not hope — a synth
// patch can render 20 dB hotter than a sample library at the same velocity
// ("absolutely drowned out by some synth"). Each stem is normalized to a
// target level derived from the engine's own mean gain for that stem:
// targetDb = -20 dBFS at gain 1.0, scaling with 20*log10(meanGain) + trimDb.
// D83: level a stem by its GATED loudness (EBU R128 integrated), not by
// whole-file RMS. Rests are part of a stem's file but not part of how loud it
// sounds: mysterious_cave's flute measured -50.4 dB RMS and -42.1 LUFS, an
// 8 dB error that pushed every sparse voice under the always-playing piano.
// R128's own gate returns exactly -70 LUFS for silence, which is the
// "unmeasurable, leave it alone" case below.
const loudnessDb = (p) => {
  const lu = spawnSync('ffmpeg', ['-nostats', '-i', p, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /Integrated loudness[\s\S]*?I:\s*(-?[\d.]+) LUFS/.exec(lu.stderr);
  if (m) return Number(m[1]);
  const r = spawnSync('ffmpeg', ['-i', p, '-af', 'astats', '-f', 'null', '-'], { encoding: 'utf8' });
  const rm = /Overall[\s\S]*?RMS level dB: (-?[\d.]+)/.exec(r.stderr) ?? /RMS level dB: (-?[\d.]+)/.exec(r.stderr);
  return rm ? Number(rm[1]) : null;
};
const outWav = values.out ?? `${outBase}.wav`;
const master = values.gain ? Number(values.gain) : 1.0;
// D83: the ceiling was x6 (+15.6 dB) and 9 of the 11 songs hit it — the stage
// computed the right correction and then declined to apply it. x12 (+21.6 dB)
// clears every measured case, and a clamp is now LOUD rather than silent.
const MAX_BOOST = 12;
for (const m of mixInputs) {
  const actual = loudnessDb(m.wav);
  if (actual == null || actual <= -69.9) { m.volume = 1; console.log(`  balance ${basename(m.wav).padEnd(26)} SILENT — nothing to level`); continue; }
  const targetDb = -20 + 20 * Math.log10(Math.max(m.meanGain, 0.02)) + m.trimDb;
  const want = dbToLin(targetDb - actual);
  m.volume = Math.min(MAX_BOOST, want);
  console.log(`  balance ${basename(m.wav).padEnd(26)} ${actual.toFixed(1)} LUFS -> ${targetDb.toFixed(1)} (x${m.volume.toFixed(2)})`
    + (want > MAX_BOOST ? `  CLAMPED — wanted x${want.toFixed(1)}, stem stays ${(20 * Math.log10(want / MAX_BOOST)).toFixed(1)} dB low` : ''));
}
const inputs = mixInputs.flatMap((m) => ['-i', m.wav]);
const chains = mixInputs.map((m, i) => `[${i}:a]volume=${(m.volume * master).toFixed(4)}[a${i}]`);
const amix = `${mixInputs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${mixInputs.length}:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=13`;
execFileSync('ffmpeg', ['-y', ...inputs, '-filter_complex', `${chains.join(';')};${amix}`, '-ar', '44100', outWav], { stdio: 'pipe' });
console.log(`wrote ${outWav} (${(to - from)} cycles @ ${cpm} cpm = ${seconds.toFixed(1)}s + tails)`);
if (!values.stems) {
  // keep the stems dir only on request
  for (const f of readdirSync(stemsDir)) { /* keep midis? no — tidy all */ }
}
console.log(values.stems ? `stems kept in ${stemsDir}` : `stems in ${stemsDir} (pass --stems to advertise; dir is left in place)`);
