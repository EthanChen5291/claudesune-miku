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

import { execFileSync } from 'node:child_process';
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
  let volume = 1;
  if (key === '__fluid') {
    stemMap = new Map([...stem.labelMap].map(([label, hs]) => [label, { muted: false, haps: hs }]));
  } else {
    // velocity remap: stem gains -> the instrument's velocity band; the mean
    // gain becomes the stem's mix volume so the engine's balance survives
    const all = [...stem.labelMap.values()].flat();
    const gains = all.map((h) => (typeof h.value?.gain === 'number' ? h.value.gain : 0.8));
    const gmin = Math.min(...gains), gmax = Math.max(...gains);
    const mean = gains.reduce((a, x) => a + x, 0) / gains.length;
    const [vLo, vHi] = stem.inst.velRange;
    const remap = (g) => (gmax - gmin < 1e-6 ? (vLo + vHi) / 2 : vLo + ((g - gmin) / (gmax - gmin)) * (vHi - vLo));
    volume = mean * dbToLin(stem.inst.trimDb ?? 0);
    stemMap = new Map([...stem.labelMap].map(([label, hs]) => [
      `${label}/${name}`,
      { muted: false, haps: hs.map((h) => ({ ...h, value: { ...h.value, gain: remap(typeof h.value?.gain === 'number' ? h.value.gain : 0.8) } })) },
    ]));
  }

  const res = songToMidi(stemMap, { cpm, meter, from, title: name });
  writeFileSync(midPath, res.bytes);
  const notes = res.tracks.reduce((a, t) => a + t.notes, 0);

  if (key === '__fluid') {
    renderWav(midPath, wavPath, { gain: 0.7 });
    console.log(`  ${name.padEnd(22)} fluidsynth  ${String(notes).padStart(4)} notes`);
  } else if (stem.inst.backend === 'sfz') {
    execFileSync(SFIZZ, ['--sfz', join(ROOT, stem.inst.sfz), '--midi', midPath, '--wav', wavPath, '--samplerate', '44100'], { stdio: 'pipe' });
    console.log(`  ${name.padEnd(22)} sfizz       ${String(notes).padStart(4)} notes  vol ${volume.toFixed(2)}  (${basename(stem.inst.sfz)})`);
  } else {
    const args = [RENDER_VST, '--plugin', join(ROOT, stem.inst.plugin), '--midi', midPath, '--out', wavPath, '--duration', String(seconds + 3)];
    if (stem.inst.preset && existsSync(join(ROOT, stem.inst.preset))) args.push('--preset', join(ROOT, stem.inst.preset));
    execFileSync(PYTHON, args, { stdio: 'pipe' });
    console.log(`  ${name.padEnd(22)} surge/vst   ${String(notes).padStart(4)} notes  vol ${volume.toFixed(2)}${stem.inst.preset && existsSync(join(ROOT, stem.inst.preset)) ? `  (${basename(stem.inst.preset)})` : '  (init patch)'}`);
  }
  mixInputs.push({ wav: wavPath, volume });
}

// ---- mix --------------------------------------------------------------------
const outWav = values.out ?? `${outBase}.wav`;
const master = values.gain ? Number(values.gain) : 1.0;
const inputs = mixInputs.flatMap((m) => ['-i', m.wav]);
const chains = mixInputs.map((m, i) => `[${i}:a]volume=${(m.volume * master).toFixed(4)}[a${i}]`);
const amix = `${mixInputs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${mixInputs.length}:duration=longest:normalize=0,alimiter=limit=0.97`;
execFileSync('ffmpeg', ['-y', ...inputs, '-filter_complex', `${chains.join(';')};${amix}`, '-ar', '44100', outWav], { stdio: 'pipe' });
console.log(`wrote ${outWav} (${(to - from)} cycles @ ${cpm} cpm = ${seconds.toFixed(1)}s + tails)`);
if (!values.stems) {
  // keep the stems dir only on request
  for (const f of readdirSync(stemsDir)) { /* keep midis? no — tidy all */ }
}
console.log(values.stems ? `stems kept in ${stemsDir}` : `stems in ${stemsDir} (pass --stems to advertise; dir is left in place)`);
