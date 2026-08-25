#!/usr/bin/env node
// Fetches a bounded, reproducible sample of game MIDI from VGMusic (D52).
//
// Usage: node scripts/fetch-corpus.mjs [--limit N] [--system snes,nes,...] [--dry]
//        --dry   parse the indexes and report what WOULD be taken, download nothing
//
// WHY VGMUSIC AND NOT LAKH. Of everything on Ethan's awesome-midi-sources list,
// this is the one source whose format suits the job. These are SEQUENCED game
// MIDI: one instrument per track, parts kept separate, the melody usually alone
// on its own channel. That matters more than corpus size here, because the whole
// point is to separate melody from harmony and feed each to its own generator —
// and a scraped piano-roll performance (Lakh) has no part structure to recover.
// It is also the idiom the project already targets; the Undertale pipeline was
// built on exactly this kind of file.
//
// WHY A BOUNDED SAMPLE. D51 measured that the strongest predictor of Ethan
// rejecting a card was `coverage` — how well the chord labels explain what
// sounds — i.e. TRANSCRIPTION QUALITY, not music. VGMusic is amateur
// transcription of wildly varying quality. Pulling 6708 SNES files would scale
// the labeller's error rate along with everything else. So: few files per game
// (breadth of PROGRESSIONS beats depth of one soundtrack), a byte-range filter
// that drops stubs and monsters, and a hard cap.
//
// WHAT IS COMMITTED. The .mid files are NOT (they are third-party transcriptions
// of copyrighted music, and thousands of binaries do not belong in git history —
// audios/vgmusic/ is gitignored). The MANIFEST is, so the corpus is reproducible
// and every extracted entry can name the file and sequencer it came from.

import { writeFileSync, mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'audios', 'vgmusic');
const MANIFEST = join(ROOT, 'src/ingest/vgmusic-manifest.json');

// Systems whose sequencing convention suits part separation, and whose music is
// the idiom this engine writes in. Ordered by how clean their typical file is.
const SYSTEMS = [
  { id: 'snes', url: 'https://www.vgmusic.com/music/console/nintendo/snes/' },
  { id: 'nes', url: 'https://www.vgmusic.com/music/console/nintendo/nes/' },
  { id: 'gameboy', url: 'https://www.vgmusic.com/music/console/nintendo/gameboy/' },
  { id: 'genesis', url: 'https://www.vgmusic.com/music/console/sega/genesis/' },
];

// A stub has no harmony to extract; a 200KB file is a dense multi-part
// arrangement whose "melody" is a guess. Measured against the Undertale corpus,
// whose files run 6-60KB.
const MIN_BYTES = 8_000;
const MAX_BYTES = 90_000;
// Breadth over depth: more distinct games means more distinct progressions.
const PER_GAME = 2;

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(flag('limit', 400));
const DRY = args.includes('--dry');
const WANT = new Set((flag('system', SYSTEMS.map((s) => s.id).join(','))).split(','));

const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * VGMusic's index is one table per game: a header row carrying the game name,
 * then a row per file with its size and the handle of whoever sequenced it.
 * Both are worth keeping — size is the only quality proxy available before
 * download, and the sequencer is the attribution.
 */
function parseIndex(html, system) {
  const out = [];
  let game = null;
  // rows and headers interleaved; walk them in document order
  const re = /<tr[^>]*>([\s\S]*?)<\/tr>|<td[^>]*class="header"[^>]*>([\s\S]*?)<\/td>/gi;
  const rowRe = /<a href="([^"]+\.mid)"[^>]*>([^<]*)<\/a>[\s\S]*?<td align="right">\s*([\d,]+)\s*bytes[\s\S]*?<td align="center">\s*([^<\n]*)/i;
  const headerRe = /<td[^>]*colspan[^>]*>\s*(?:<[^>]+>)*\s*([^<]{2,80}?)\s*(?:<|$)/i;
  for (const m of html.matchAll(re)) {
    const chunk = m[1] ?? m[2] ?? '';
    const h = headerRe.exec(chunk);
    if (h && !/\.mid/i.test(chunk)) { game = h[1].trim(); continue; }
    const r = rowRe.exec(chunk);
    if (!r) continue;
    const bytes = Number(r[3].replace(/,/g, ''));
    out.push({
      system,
      game: game ?? 'unknown',
      title: r[2].trim(),
      file: r[1],
      bytes,
      sequencer: r[4].trim().replace(/\s+/g, ' ') || 'unknown',
    });
  }
  return out;
}

async function get(url, { binary = false } = {}) {
  const res = await fetch(url, { headers: { 'user-agent': 'motif-engine/corpus-fetch (research; contact via repo)' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
}

// --- pick ------------------------------------------------------------------

const picked = [];
const stats = [];
for (const sys of SYSTEMS) {
  if (!WANT.has(sys.id)) continue;
  const html = await get(sys.url);
  const all = parseIndex(html, sys.id);
  const sized = all.filter((f) => f.bytes >= MIN_BYTES && f.bytes <= MAX_BYTES);

  // At most PER_GAME per game, chosen by a stable hash so re-running this
  // script downloads the same corpus rather than a new random one.
  const byGame = new Map();
  for (const f of sized.sort((a, b) => fnv(a.file) - fnv(b.file))) {
    const g = byGame.get(f.game) ?? [];
    if (g.length < PER_GAME) { g.push(f); byGame.set(f.game, g); }
  }
  const take = [...byGame.values()].flat().sort((a, b) => fnv(a.file) - fnv(b.file));
  stats.push({ system: sys.id, listed: all.length, sized: sized.length, games: byGame.size, take: take.length });
  picked.push(...take);
}

// interleave systems so a --limit cut stays balanced across them
picked.sort((a, b) => fnv(a.system + a.file) - fnv(b.system + b.file));
const final = picked.slice(0, LIMIT);

console.log(`VGMusic index:`);
for (const s of stats) {
  console.log(`  ${s.system.padEnd(9)} ${String(s.listed).padStart(5)} listed  ${String(s.sized).padStart(5)} in size range  ${String(s.games).padStart(4)} games  -> ${s.take}`);
}
console.log(`taking ${final.length} files (limit ${LIMIT}, <=${PER_GAME}/game, ${MIN_BYTES / 1000}-${MAX_BYTES / 1000}KB)`);
if (DRY) {
  for (const f of final.slice(0, 20)) console.log(`  ${f.system} · ${f.game} · ${f.title} (${f.bytes}b, ${f.sequencer})`);
  process.exit(0);
}

// --- fetch -----------------------------------------------------------------

const manifest = [];
let got = 0, cached = 0, failed = 0;
for (const [i, f] of final.entries()) {
  const dir = join(OUT, f.system);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, f.file);
  if (existsSync(path) && statSync(path).size > 0) {
    cached++;
  } else {
    try {
      const buf = await get(new URL(f.file, SYSTEMS.find((s) => s.id === f.system).url).href, { binary: true });
      writeFileSync(path, buf);
      got++;
      await sleep(250);          // be a guest on someone else's server
    } catch (e) {
      failed++;
      console.log(`  FAILED ${f.system}/${f.file}: ${e.message}`);
      continue;
    }
  }
  manifest.push({ ...f, path: `audios/vgmusic/${f.system}/${f.file}` });
  if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${final.length}...`);
}

manifest.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(MANIFEST, `${JSON.stringify({
  source: 'https://www.vgmusic.com/',
  note: 'Third-party transcriptions of game music, fetched for statistical extraction only. '
    + 'The .mid files are NOT committed (audios/vgmusic/ is gitignored); re-run '
    + 'scripts/fetch-corpus.mjs to reproduce them. Every entry credits its sequencer.',
  filters: { minBytes: MIN_BYTES, maxBytes: MAX_BYTES, perGame: PER_GAME, limit: LIMIT },
  count: manifest.length,
  files: manifest,
}, null, 2)}\n`);

console.log(`downloaded ${got}, cached ${cached}, failed ${failed}`);
console.log(`wrote ${MANIFEST} (${manifest.length} files, ${new Set(manifest.map((f) => f.game)).size} games)`);
