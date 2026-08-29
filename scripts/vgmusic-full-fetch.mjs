#!/usr/bin/env node
// Downloads the VGMusic corpus named by audios/vgmusic-full/manifest.json.
//
// ANALYSIS-ONLY (D95). Writes to audios/vgmusic-full/, which is gitignored and
// never read by src/lib/. Do NOT point import-vgmusic.mjs or
// build-harmony-model.mjs at this tree — the harmony model is COUNTED, and
// growing what it counts re-rolls the variation ops on judged songs.
//
// Owner permission for download/analysis: Ethan, 2026-08-28. Politeness:
// bounded concurrency, a per-request pacing floor, keep-alive connection reuse,
// an identifying User-Agent, and RESUMABILITY — an already-present file is never
// re-fetched, so re-running costs the site nothing.
//
// Usage: node scripts/vgmusic-full-fetch.mjs [--conc 6] [--rps 12] [--limit N]

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAN = join(ROOT, 'audios/vgmusic-full/manifest.json');
const LOG = join(ROOT, 'audios/vgmusic-full/_fetch.log');

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const CONC = flag('conc', 6);
const RPS = flag('rps', 12);          // aggregate request ceiling
const LIMIT = flag('limit', Infinity);
const UA = 'motif-engine-research/1.0 (owner-permitted MIDI corpus analysis; contact via site owner)';

const man = JSON.parse(readFileSync(MAN, 'utf8'));
for (const s of new Set(man.files.map((f) => f.system)))
  mkdirSync(join(ROOT, 'audios/vgmusic-full', s), { recursive: true });

// Resume: a present, non-empty file is done. Never re-hit the site for it.
const missing = man.files.filter((f) => {
  const p = join(ROOT, f.path);
  if (!existsSync(p)) return true;
  try { return statSync(p).size === 0; } catch { return true; }
});
const todo = LIMIT === Infinity ? missing : missing.slice(0, LIMIT);

console.log(`manifest=${man.files.length} already=${man.files.length - missing.length} todo=${todo.length} conc=${CONC} rps=${RPS}`);
if (!todo.length) { console.log('DONE nothing to fetch'); process.exit(0); }

const gap = 1000 / RPS;
let cursor = 0, ok = 0, fail = 0, bytes = 0, nextSlot = Date.now();
const failures = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function worker(id) {
  while (cursor < todo.length) {
    const f = todo[cursor++];
    // Global pacing: workers take numbered slots off one clock, so aggregate
    // request rate is RPS no matter how many workers are running.
    const slot = nextSlot; nextSlot += gap;
    const wait = slot - Date.now();
    if (wait > 0) await sleep(wait);

    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      try {
        const res = await fetch(f.url, { headers: { 'User-Agent': UA, 'Accept': '*/*' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (!buf.length) throw new Error('empty');
        writeFileSync(join(ROOT, f.path), buf);
        ok++; bytes += buf.length; done = true;
      } catch (e) {
        if (attempt === 2) { fail++; failures.push({ url: f.url, err: String(e.message || e) }); }
        else await sleep(1200 * (attempt + 1));   // back off, don't hammer
      }
    }
    const n = ok + fail;
    if (n % 500 === 0) console.log(`  ${n}/${todo.length} ok=${ok} fail=${fail} ${(bytes / 1e6).toFixed(0)}MB`);
  }
}

const t0 = Date.now();
await Promise.all(Array.from({ length: CONC }, (_, i) => worker(i)));
const mins = (Date.now() - t0) / 60000;
const line = `fetched ok=${ok} fail=${fail} ${(bytes / 1e6).toFixed(1)}MB in ${mins.toFixed(1)}min`;
console.log('DONE ' + line);
appendFileSync(LOG, line + '\n');
if (failures.length) {
  writeFileSync(join(ROOT, 'audios/vgmusic-full/_failures.json'), JSON.stringify(failures, null, 1));
  console.log(`failures written: ${failures.length} (re-run to retry them)`);
}
