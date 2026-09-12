#!/usr/bin/env node
// Vocal tier orchestrator: song -> score -> sung (DiffSinger) -> converted
// (RVC target timbre) -> measured -> laid over the song's HQ mix.
//
//   node scripts/render-vocal.mjs <song> [--page audition/songs.html]
//        [--syllable la|na|ah|oo|auto] [--speaker tiger_fresh] [--octave auto|N]
//        [--model <rvc .pth>] [--pitch 0] [--index-rate 0.66] [--protect 0.33]
//        [--gpu] [--vocal-db -3] [--no-mix] [--force]
//
// Outputs (audition/hq/, gitignored like every render):
//   <song>.vocal-score.json   the score (stage 0)
//   <song>.vocal-dry.wav      the free voice singing it (stage 1)
//   <song>.vocal.wav          the converted vocal, 44.1k, with the lead's room (stage 2)
//   <song>.withvocal.wav      HQ mix + vocal, -16 LUFS (only if <song>.wav exists)
//   *.verify.json             pitch-vs-score measurements for both wavs
//
// Stage 2 runs with KMP_DUPLICATE_LIB_OK=TRUE and OMP_NUM_THREADS=1: faiss and
// torch each bundle an OpenMP runtime on macOS and the RMVPE constructor
// segfaults (exit 139) when both are live. CPU by default — MPS works with
// the same env but is not faster on this pipeline; --gpu opts in.
//
// Balance: the vocal is levelled by GATED loudness (EBU R128, the D83 rule)
// to `--vocal-db` relative to the HQ mix's integrated loudness, then the sum
// is normalised to -16 LUFS like every HQ render. Support stays under the
// lead (D77): the vocal IS the lead here, so it sits a little under the full
// mix's level rather than on top of it.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HQ = join(ROOT, 'audition', 'hq');
const PY = join(ROOT, 'vendor', 'vocal', 'env', 'bin', 'python');
const VOCAL_DIR = join(ROOT, 'vendor', 'vocal');
const IR_PATH = join(ROOT, 'vendor', 'build', 'room-ir.wav');

const { values, positionals } = parseArgs({
  args: process.argv.slice(2), allowPositionals: true,
  options: {
    page: { type: 'string', default: 'audition/songs.html' },
    syllable: { type: 'string', default: 'la' },
    speaker: { type: 'string', default: 'tiger_fresh' },
    octave: { type: 'string', default: 'auto' },
    model: { type: 'string' },
    pitch: { type: 'string', default: '0' },
    'index-rate': { type: 'string', default: '0.66' },
    protect: { type: 'string', default: '0.33' },
    gpu: { type: 'boolean', default: false },
    'vocal-db': { type: 'string' }, // vocal over the band in the sung spans, dB; default: the song's own `vocalDb` pin on the page, else +3
    'no-mix': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    lyrics: { type: 'string', default: 'ja' },   // r34: ja | none
    'render-hq': { type: 'boolean', default: true }, // render the HQ mix from the page if missing
    // r35: re-render the HQ mix even when one exists (the page's mix or an HQ
    // patch changed); render-hq's stem cache keeps the unchanged stems
    rehq: { type: 'boolean', default: false },
    // r35: a second SUNG voice. `--line _vocal_harmony --tag .harmony --no-mix`
    // sings the harmony solo into <song>.harmony.vocal.wav; the plain run then
    // mixes that stem under the lead vocal when it exists (his poplab note:
    // "by chorus I meant like the harmony for voice — … singing multiple voices")
    line: { type: 'string', default: '_lead_mix' },
    tag: { type: 'string', default: '' },
    'harmony-db': { type: 'string', default: '-4' }, // the harmony voice under the lead voice, dB
  },
});
const NAME = positionals[0];
if (!NAME) { console.error('usage: render-vocal <song> [options]'); process.exit(1); }
if (!existsSync(PY)) { console.error(`no vocal env at ${PY} — see scripts/vocal-sing.py header for setup`); process.exit(1); }

const TAG = values.tag ?? '';
const score = join(HQ, `${NAME}${TAG}.vocal-score.json`);
const dry = join(HQ, `${NAME}${TAG}.vocal-dry.wav`);
const raw = join(HQ, `${NAME}${TAG}.vocal-raw.wav`);
const vocal = join(HQ, `${NAME}${TAG}.vocal.wav`);
const harmonyStem = join(HQ, `${NAME}.harmony.vocal.wav`); // a second sung voice, if rendered
const mixIn = join(HQ, `${NAME}.wav`);
const out = join(HQ, `${NAME}.withvocal.wav`);
const t0 = Date.now();
const secs = () => `${((Date.now() - t0) / 1000).toFixed(0)}s`;
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'], ...opts });

// stage 0: score (+ generated lyrics)
// r35: a score whose SUNG NOTES changed (a re-rolled tune, a folded ceiling,
// a handoff removed) forces stages 1-2 by itself — the kept .dry/.raw would
// otherwise be a recording of the old line under the new mix
const prevNotes = existsSync(score) ? JSON.stringify(JSON.parse(readFileSync(score, 'utf8')).notes.map((n) => [n.start, n.dur, n.midi, n.syl ?? null])) : null;
run('node', [join(ROOT, 'scripts', 'export-vocal.mjs'), NAME, '--page', values.page, '--out', score, '--octave', values.octave, '--lyrics', values.lyrics, '--line', values.line]);
const sc = JSON.parse(readFileSync(score, 'utf8'));
if (!sc.notes.length) { console.error(`${NAME}: no sung notes (the mix never plays the tune?)`); process.exit(1); }
const nowNotes = JSON.stringify(sc.notes.map((n) => [n.start, n.dur, n.midi, n.syl ?? null]));
if (prevNotes != null && prevNotes !== nowNotes && !values.force) { values.force = true; console.log('  score changed since the last render — stages 1-2 will re-run'); }

// the HQ mix, rendered from the page's own mix string when absent (the same
// job render-hq-pages.mjs does for songs.html; other pages have no batch)
if ((values.rehq || !existsSync(mixIn)) && values['render-hq'] && !values['no-mix']) {
  const html = readFileSync(join(ROOT, values.page), 'utf8');
  const di = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(di + 13, html.indexOf(';\n', di)));
  const song = (data.songs ?? data.cards).find((s) => s.name === NAME);
  const tmp = join(VOCAL_DIR, `${NAME}.strudel`);
  writeFileSync(tmp, `setcpm(${song.bpm}/${song.beats ?? 4});\n(stack(${song.mix})).p('song')\n`);
  run('node', [join(ROOT, 'scripts', 'render-hq.mjs'), tmp, '--to', String(song.totalBars), '--out', mixIn, '--reuse-stems']);
  console.log(`  HQ mix rendered (${secs()})`);
}

// stage 1: sing
if (values.force || !existsSync(dry)) {
  run(PY, [join(ROOT, 'scripts', 'vocal-sing.py'), score, dry, '--syllable', values.syllable, '--speaker', values.speaker]);
  console.log(`  stage 1 sung (${secs()})`);
} else console.log(`  stage 1 kept ${dry} (pass --force to re-sing)`);

// stage 2: convert (kept, like stage 1, unless --force — so a song whose HQ
// mix changed can be re-mixed without re-singing or re-converting)
if (values.force || !existsSync(raw)) {
  const env = { ...process.env, KMP_DUPLICATE_LIB_OK: 'TRUE', OMP_NUM_THREADS: '1' };
  const convArgs = [join(ROOT, 'scripts', 'vocal-convert.py'), dry, raw,
    '--pitch', values.pitch, '--index-rate', values['index-rate'], '--protect', values.protect];
  if (values.model) convArgs.push('--model', values.model);
  if (!values.gpu) convArgs.push('--cpu');
  run(PY, convArgs, { cwd: VOCAL_DIR, env });
  console.log(`  stage 2 converted (${secs()})`);
} else console.log(`  stage 2 kept ${raw} (pass --force to re-convert)`);

// resample to 44.1k + the lead's room (the same IR and wet law as render-hq's applyRoom)
const room = sc.room ?? 0;
if (room >= 0.15 && existsSync(IR_PATH)) {
  const wet = Math.min(1.2, room * 1.1);
  run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-i', IR_PATH, '-filter_complex',
    `[0:a]aresample=44100,aformat=channel_layouts=stereo[v];[v]asplit[d][w];[w][1:a]afir=dry=10:wet=10[rv];[d][rv]amix=inputs=2:weights=1 ${wet.toFixed(3)}:duration=longest:normalize=0`,
    '-ar', '44100', vocal]);
} else {
  run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-ar', '44100', '-ac', '2', vocal]);
}

// measure both
const verify = (wav) => {
  const r = spawnSync(PY, [join(ROOT, 'scripts', 'vocal-verify.py'), score, wav, '--json', wav.replace(/\.wav$/, '.verify.json')], { encoding: 'utf8' });
  process.stdout.write(`  ${r.stdout.trim().replace(HQ + '/', '')}\n`);
};
// pitch is measured BEFORE the room: a 0.7 room's tail reads as unvoiced /
// off-pitch frames to the tracker (measured: 83.6% -> 73.6% within 50 cents,
// 0 -> 22 "unvoiced" notes on the identical conversion) — that is the
// reverb, not the singer
verify(dry); verify(raw);

// mix over the HQ render
const lufs = (p) => {
  const lu = spawnSync('ffmpeg', ['-nostats', '-i', p, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /Integrated loudness[\s\S]*?I:\s*(-?[\d.]+) LUFS/.exec(lu.stderr);
  return m ? Number(m[1]) : null;
};
if (values['no-mix']) { console.log(`wrote ${vocal} (${secs()}); no mix requested`); process.exit(0); }
if (!existsSync(mixIn)) { console.log(`wrote ${vocal} (${secs()}); no HQ mix at ${mixIn} to lay it over — run render-hq first`); process.exit(0); }
// BALANCE IN THE SUNG SPANS, NOT BY WHOLE-SONG LOUDNESS. His "i dont hear the
// vocals": levelling the vocal's gated integrated LUFS to the mix's put it
// 1-3 dB UNDER the band where it actually sings (fit of withvocal = a*mix +
// b*vocal over the sung spans: calm_water vocal -24.5 dB vs band -21.7,
// festival -21.2 vs -20.2, tense_fight -22.2 vs -19.8) — a vocal's breaths,
// tails and rests drag its integrated level down, and a lead that sits under
// a full band is masked. Both signals are now measured over the score's own
// sung spans (RMS of the 44.1k PCM), and the vocal is set `--vocal-db` ABOVE
// the band there (default +3: a lead, not a pad).
const readWav = (p) => {
  const buf = readFileSync(p);
  const ch = buf.readUInt16LE(22), sr = buf.readUInt32LE(24), bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1, dataLen = 0;
  while (off + 8 <= buf.length) { const id = buf.toString('ascii', off, off + 4); const len = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataLen = len; break; } off += 8 + len + (len % 2); }
  if (dataOff < 0 || bits !== 16) throw new Error(`unsupported wav ${p} (${bits}-bit)`);
  const frames = Math.floor(Math.min(dataLen, buf.length - dataOff) / (2 * ch));
  return { sr, ch, frames, sample: (i) => { let s = 0; for (let c = 0; c < ch; c++) s += buf.readInt16LE(dataOff + (i * ch + c) * 2); return s / ch / 32768; } };
};
const sungRmsDb = (p) => {
  const w = readWav(p);
  let sum = 0, n = 0;
  for (const nt of sc.notes) {
    const a = Math.max(0, Math.floor(nt.start * w.sr)), b = Math.min(w.frames, Math.floor((nt.start + nt.dur) * w.sr));
    for (let i = a; i < b; i += 4) { const x = w.sample(i); sum += x * x; n++; }
  }
  return n ? 10 * Math.log10(sum / n + 1e-12) : -99;
};
const bandDb = sungRmsDb(mixIn), vocDb = sungRmsDb(vocal);
// per-song pin (his notes on a card become data on the page: `vocalDb`)
const pageSong = (() => {
  const html = readFileSync(join(ROOT, values.page), 'utf8');
  const di = html.indexOf('const DATA = ');
  return (JSON.parse(html.slice(di + 13, html.indexOf(';\n', di))).songs ?? []).find((s) => s.name === NAME) ?? {};
})();
const vocalDbUsed = values['vocal-db'] != null ? Number(values['vocal-db']) : (pageSong.vocalDb ?? 3);
values['vocal-db'] = String(vocalDbUsed);
const target = bandDb + vocalDbUsed;
const gain = Math.pow(10, (target - vocDb) / 20);
// r35: the harmony voice (a second sung stem, the writer's line a third below
// in the chorus bars) rides `--harmony-db` under the LEAD voice's level
const withHarmony = !TAG && existsSync(harmonyStem);
const hGain = withHarmony ? gain * Math.pow(10, Number(values['harmony-db']) / 20) * Math.pow(10, (vocDb - sungRmsDb(harmonyStem)) / 20) : 0;
if (withHarmony) console.log(`  harmony voice: ${harmonyStem} mixed ${values['harmony-db']} dB under the lead voice (x${hGain.toFixed(2)})`);
run('ffmpeg', ['-v', 'error', '-y', '-i', mixIn, '-i', vocal, ...(withHarmony ? ['-i', harmonyStem] : []), '-filter_complex',
  // r35: a 20 ms fade-in on the head. His vx_romantic_rest card: "at the very
  // beginning, there's a bit of a glitch" — the mix opens on a piano chord at
  // sample 0 (measured: -18 dB RMS in the first 50 ms, first sample non-zero),
  // which is a hard edge for any player to start on; nothing else in the
  // first 1.5 s measured as a discontinuity (max sample step 0.023).
  withHarmony
    ? `[1:a]volume=${gain.toFixed(4)}[v];[2:a]volume=${hGain.toFixed(4)}[h];[0:a][v][h]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=13,afade=t=in:st=0:d=0.02`
    : `[1:a]volume=${gain.toFixed(4)}[v];[0:a][v]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=13,afade=t=in:st=0:d=0.02`,
  '-ar', '44100', out]);
const outL = lufs(out);
console.log(`  balance (sung spans): band ${bandDb.toFixed(1)} dB, vocal ${vocDb.toFixed(1)} -> ${target.toFixed(1)} dB (x${gain.toFixed(2)}, ${Number(values['vocal-db']) >= 0 ? '+' : ''}${values['vocal-db']} dB over the band); sum ${outL?.toFixed(1)} LUFS`);
console.log(`wrote ${out} (${secs()})`);
