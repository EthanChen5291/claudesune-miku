#!/usr/bin/env node
// Runs corpus-features over the whole vgmusic-full tree and writes one JSONL
// record per file. ANALYSIS-ONLY (D95): output feeds research/*.md, never src/.
//
// Usage: node scripts/corpus-extract.mjs [--out FILE] [--limit N] [--workers N]
//
// Parallel across cores via child processes. Failures are RECORDED, not dropped —
// a silent skip would make the surviving set look cleaner than the corpus is, and
// "the corpus does this zero times" has to be distinguishable from "we never read
// those files".

import { readFileSync, writeFileSync, createWriteStream, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import { cpus } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

if (process.env.CORPUS_WORKER) {
  // ---- worker: analyze a slice, stream JSON lines back to the parent
  const { analyzeFile } = await import('./corpus-features.mjs');
  const { label } = await import('./corpus-taxonomy.mjs');
  process.on('message', (msg) => {
    if (msg.done) process.exit(0);
    const out = [];
    for (const row of msg.rows) {
      const abs = join(ROOT, row.path);
      try {
        const L = label(row);
        const rec = analyzeFile(abs, {
          system: row.system, game: row.game, title: row.title,
          bytes: row.bytes, sequencer: row.sequencer,
          labels: L.labels, labelConfidence: L.confidence,
          labelAmbiguous: L.ambiguous, labelHits: L.hits.map((h) => `${h.axis}.${h.label}:${h.term}`),
        });
        out.push(JSON.stringify(rec));
      } catch (e) {
        out.push(JSON.stringify({
          file: row.file, system: row.system, game: row.game, title: row.title,
          ok: false, error: String(e.message || e).slice(0, 120),
        }));
      }
    }
    process.send({ lines: out, n: msg.rows.length });
  });
} else {
  // ---- parent
  const OUT = flag('out', join(ROOT, 'audios/vgmusic-full/features.jsonl'));
  const LIMIT = Number(flag('limit', Infinity));
  const NW = Number(flag('workers', Math.max(2, Math.min(10, cpus().length - 2))));

  const man = JSON.parse(readFileSync(join(ROOT, 'audios/vgmusic-full/manifest.json'), 'utf8'));
  const rows = man.files.filter((f) => existsSync(join(ROOT, f.path)));
  const todo = LIMIT === Infinity ? rows : rows.slice(0, LIMIT);
  console.log(`manifest=${man.files.length} present=${rows.length} analysing=${todo.length} workers=${NW}`);

  const CHUNK = 40;
  const chunks = [];
  for (let i = 0; i < todo.length; i += CHUNK) chunks.push(todo.slice(i, i + CHUNK));
  let next = 0, done = 0, okN = 0, failN = 0;
  const stream = createWriteStream(OUT);
  const t0 = Date.now();

  await new Promise((resolve) => {
    let live = 0;
    const spawn = () => {
      const w = fork(fileURLToPath(import.meta.url), [], { env: { ...process.env, CORPUS_WORKER: '1' } });
      live++;
      const feed = () => {
        if (next >= chunks.length) { w.send({ done: true }); return; }
        w.send({ rows: chunks[next++] });
      };
      w.on('message', (m) => {
        for (const l of m.lines) { stream.write(l + '\n'); if (l.includes('"ok":true')) okN++; else failN++; }
        done += m.n;
        if (done % 2000 < CHUNK) console.log(`  ${done}/${todo.length} ok=${okN} fail=${failN} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
        feed();
      });
      w.on('exit', () => { if (--live === 0) resolve(); });
      feed();
    };
    for (let i = 0; i < NW; i++) spawn();
  });
  stream.end();
  console.log(`DONE analysed=${done} ok=${okN} fail=${failN} in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${OUT}`);
}
