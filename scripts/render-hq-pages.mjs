#!/usr/bin/env node
// D81: batch HQ renders for the audition pages.
//
//   node scripts/render-hq-pages.mjs [--videolab] [--songs] [--solos]
//
// Reads the built pages' embedded DATA and renders through render-hq.mjs:
//   videolab: every card's mix -> audition/hq/<name>.wav, and with --solos
//             every solo layer -> audition/hq/<name>.<solo>.wav
//   songs:    every song's mix -> audition/hq/<name>.wav
// Temp .strudel files (and their stems) live in the scratchpad; only the
// final wavs land in audition/hq/. Rebuild the pages afterwards so the HQ
// badges pick up the new files.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HQ = join(ROOT, 'audition', 'hq');
const TMP = join(tmpdir(), 'motif-hq-render');
mkdirSync(HQ, { recursive: true });
mkdirSync(TMP, { recursive: true });

const args = new Set(process.argv.slice(2));
const doVideolab = args.has('--videolab') || (!args.has('--songs'));
const doSongs = args.has('--songs') || (!args.has('--videolab'));
const doSolos = args.has('--solos');

const grab = (page) => JSON.parse(readFileSync(join(ROOT, 'audition', page), 'utf8').match(/const DATA = (\{.*?\});\n/s)[1]);

const jobs = []; // { file, cpmExpr, cycles, out, label }
if (doVideolab) {
  for (const c of grab('videolab.html').cards) {
    jobs.push({ expr: c.mix, cpm: `${c.bpm}/4`, cycles: c.totalBars, out: `${c.name}.wav`, label: `${c.name} mix` });
    if (doSolos) {
      for (const [k, expr] of Object.entries(c.solos)) {
        jobs.push({ expr, cpm: `${c.bpm}/4`, cycles: c.totalBars, out: `${c.name}.${k}.wav`, label: `${c.name} ${k}` });
      }
    }
  }
}
if (doSongs) {
  for (const s of grab('songs.html').songs) {
    jobs.push({ expr: s.mix, cpm: `${s.bpm}/${s.beats}`, cycles: s.totalBars, out: `${s.name}.wav`, label: `${s.name} mix` });
  }
}

console.log(`${jobs.length} renders`);
let done = 0, failed = 0;
for (const j of jobs) {
  const f = join(TMP, j.out.replace(/\.wav$/, '.strudel'));
  writeFileSync(f, `setcpm(${j.cpm});\n(stack(${j.expr})).p('song')\n`);
  try {
    const out = execFileSync('node', [join(ROOT, 'scripts', 'render-hq.mjs'), f, '--to', String(j.cycles), '--out', join(HQ, j.out)], { encoding: 'utf8', stdio: 'pipe' });
    // D83: a stem the balance stage could not lift, or notes it could not fold
    // into a patch's range, must not vanish into a piped child's stdout — that
    // silence is exactly how the piano-only mixes shipped.
    for (const line of out.split('\n')) {
      if (/CLAMPED|WARNING|SILENT/.test(line)) console.log(`  ${j.label}: ${line.trim()}`);
    }
    done++;
  } catch (e) {
    failed++;
    console.log(`  FAILED ${j.label}: ${String(e.stderr ?? e.message).slice(0, 200)}`);
  }
  if ((done + failed) % 10 === 0) console.log(`  ${done + failed}/${jobs.length} (${failed} failed)`);
}
console.log(`done: ${done} rendered, ${failed} failed -> audition/hq/`);
