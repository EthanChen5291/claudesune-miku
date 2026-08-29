#!/usr/bin/env node
// Parses the 56 cached VGMusic system indexes into one master manifest.
//
// ANALYSIS-ONLY CORPUS (D95/D96). This feeds audios/vgmusic-full/, which is
// gitignored and never read by src/lib/. It is NOT audios/vgmusic/ — that stays
// pinned to its 400-file D52 manifest, because the harmony model is COUNTED and
// growing what gets counted re-rolls the variation ops on judged songs.
// Never point import-vgmusic.mjs or build-harmony-model.mjs at this tree.
//
// Owner permission for vgmusic.com download/analysis: Ethan, 2026-08-28.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IDX = join(ROOT, 'audios/vgmusic-full/_index');
const OUT = join(ROOT, 'audios/vgmusic-full/manifest.json');

const ent = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&([a-z]+);/gi, ' ').replace(/\s+/g, ' ').trim();

const strip = (s) => ent(s.replace(/<[^>]*>/g, ' '));

const files = readdirSync(IDX).filter((f) => f.endsWith('.html')).sort();
const rows = [];
let noGame = 0;

for (const f of files) {
  const slug = f.replace(/\.html$/, '');
  const parts = slug.split('__');            // e.g. console__nintendo__snes
  const system = parts[parts.length - 1];
  const family = parts.slice(0, -1).join('/');
  const html = readFileSync(join(IDX, f), 'utf8');
  const urlBase = 'https://www.vgmusic.com/music/' + slug.replace(/__/g, '/') + '/';

  // Walk <tr> blocks in document order. A game-header row carries the game name
  // in a colspan cell; a file row carries the .mid anchor, byte count, sequencer.
  let game = null;
  for (const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)(?=<tr\b|<\/table)/gi)) {
    const block = m[1];
    const hdr = block.match(/<td[^>]*class="header"[^>]*colspan[^>]*>([\s\S]*?)(?:<\/td>|<\/tr>|$)/i);
    if (hdr) { const g = strip(hdr[1]); if (g && g !== '&nbsp;') game = g; continue; }
    const a = block.match(/<a\s+href="([^"]+\.mid)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) continue;
    const bytes = block.match(/<td[^>]*align="right"[^>]*>\s*([\d,]+)\s*bytes/i);
    const seq = block.match(/<td[^>]*align="center"[^>]*>([\s\S]*?)(?=<td|<\/tr|$)/i);
    if (!game) noGame++;
    rows.push({
      system, family, game: game || '(unfiled)',
      title: strip(a[2]) || decodeURIComponent(a[1]).replace(/\.mid$/i, ''),
      file: a[1],
      url: urlBase + a[1],
      bytes: bytes ? Number(bytes[1].replace(/,/g, '')) : 0,
      sequencer: seq ? (strip(seq[1]) || 'unknown') : 'unknown',
      path: `audios/vgmusic-full/${system}/${decodeURIComponent(a[1]).replace(/[/\\]/g, '_')}`,
    });
  }
}

// Report, don't silently dedupe: same basename can legitimately recur per system.
const byKey = new Map();
for (const r of rows) { const k = r.system + '/' + r.file; if (!byKey.has(k)) byKey.set(k, r); }

const manifest = {
  source: 'https://www.vgmusic.com/',
  note: 'Full-site sweep. Owner permission (Ethan, 2026-08-28). ANALYSIS-ONLY corpus per D95 — .mid gitignored, never feeds src/lib/, never counted into harmony-model.js.',
  indexedAt: process.env.VGM_STAMP || 'unstamped',
  systems: files.length,
  count: byKey.size,
  files: [...byKey.values()],
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 1));

const bySys = {};
for (const r of manifest.files) { const s = bySys[r.system] ||= { n: 0, bytes: 0, games: new Set() }; s.n++; s.bytes += r.bytes; s.games.add(r.game); }
console.log(`rows=${rows.length} unique=${byKey.size} noGameHeader=${noGame}`);
console.log(`total bytes=${(manifest.files.reduce((a, r) => a + r.bytes, 0) / 1e9).toFixed(2)} GB`);
console.log(`games=${new Set(manifest.files.map((r) => r.system + '|' + r.game)).size}`);
console.log('\nsystem            files   games      MB');
for (const [k, v] of Object.entries(bySys).sort((a, b) => b[1].n - a[1].n))
  console.log(k.padEnd(16), String(v.n).padStart(6), String(v.games.size).padStart(7), (v.bytes / 1e6).toFixed(1).padStart(8));
