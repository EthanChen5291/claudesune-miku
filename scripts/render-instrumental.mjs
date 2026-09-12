#!/usr/bin/env node
// r37 — THE INSTRUMENTAL TWIN of a sung song (his ruling: "two mixes per song").
//
//   node scripts/render-instrumental.mjs --page audition/band.html [song ...]
//
// WHY. A song built with `opts.vocalLead` ducks its melody instrument to a 0.45
// GUIDE, because the VOICE carries the tune. Mute the vocal and you do not get
// an instrumental — you get a karaoke backing track with a hole where the
// melody goes. He had assumed the opposite ("all sung because i can just turn
// vocals off to hear instrumental"), and eleven of his twelve band-page cards
// were written against that hole: "the piano melody too sounds off and too
// quiet", "the synth is way too loud and drowns out everything else", "volume
// levels aren't balanced".
//
// The generator emits `mixInstrumental` beside `mix`: the SAME parts with the
// guide never applied. Verified by evaluation, not by reading the string —
// identical hap counts and identical (time, sound, pitch) events on all twelve
// songs, differing only in gain, with a maximum ratio of 2.222 = exactly 1/0.45.
//
// Output: audition/hq/<song>.instrumental.wav, beside <song>.wav (the sung
// mix's backing) and <song>.withvocal.wav (the sung mix with the voice).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values, positionals } = parseArgs({
  args: process.argv.slice(2), allowPositionals: true,
  options: { page: { type: 'string', default: 'audition/band.html' }, force: { type: 'boolean', default: false } },
});

const html = readFileSync(join(ROOT, values.page), 'utf8');
const di = html.indexOf('const DATA = ');
const data = JSON.parse(html.slice(di + 13, html.indexOf(';\n', di)));
const all = (data.songs ?? data.cards).filter((s) => s.mixInstrumental);
const songs = positionals.length ? all.filter((s) => positionals.includes(s.name)) : all;
if (!songs.length) {
  console.error(`no songs with an instrumental twin on ${values.page}`
    + ` (a twin exists only where the song is sung — opts.vocalLead)`);
  process.exit(1);
}

const HQ = join(ROOT, 'audition', 'hq');
const TMP = join(ROOT, 'vendor', 'vocal');
mkdirSync(HQ, { recursive: true });
mkdirSync(TMP, { recursive: true });

console.log(`${songs.length} instrumental twin(s) from ${values.page}`);
let done = 0, skipped = 0, failed = 0;
for (const s of songs) {
  const out = join(HQ, `${s.name}.instrumental.wav`);
  if (existsSync(out) && !values.force) { console.log(`  ${s.name.padEnd(16)} exists (--force to redo)`); skipped++; continue; }
  const tmp = join(TMP, `${s.name}.instrumental.strudel`);
  writeFileSync(tmp, `setcpm(${s.bpm}/${s.beats ?? 4});\n(stack(${s.mixInstrumental})).p('song')\n`);
  const t0 = Date.now();
  try {
    execFileSync('node', [join(ROOT, 'scripts', 'render-hq.mjs'), tmp, '--to', String(s.totalBars), '--out', out, '--reuse-stems'],
      { stdio: 'pipe' });
    console.log(`  ${s.name.padEnd(16)} ${((Date.now() - t0) / 1000).toFixed(0)}s  -> ${out.replace(ROOT + '/', '')}`);
    done++;
  } catch (e) {
    console.log(`  ${s.name.padEnd(16)} FAILED — ${String(e.stderr ?? e.message).trim().split('\n').pop()}`);
    failed++;
  }
}
console.log(`${done} rendered, ${skipped} skipped, ${failed} failed`);
if (failed) process.exit(1);
