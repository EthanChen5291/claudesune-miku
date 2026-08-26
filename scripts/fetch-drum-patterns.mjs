// Fetch drum-patterns.com pattern pages into audios/drum-patterns/ (D61).
//
// AUTHORIZATION: the site's robots.txt disallows automated collection, so this
// script exists only because Ethan asked the site owner and was granted
// permission by email for this project (Ethan, 2026-08-25 — recorded in D61).
// It stays deliberately polite regardless: ~1.2s between requests, an honest
// User-Agent, an explicit page budget (never "all"), and it skips anything
// already saved so re-runs cost the site nothing.
//
// Usage: node scripts/fetch-drum-patterns.mjs [liked|popular|recent] [pages]
//        default: liked 3   (~40 patterns; each listing page links ~13)
// Then:  node scripts/import-drum-patterns.mjs --report

import { writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'audios', 'drum-patterns');
const BASE = 'https://drum-patterns.com';
const UA = 'motif-engine corpus fetch (owner-permitted; contact: Ethan Chen)';

const sort = ['liked', 'popular', 'recent'].includes(process.argv[2]) ? process.argv[2] : 'liked';
const pages = Math.max(1, Math.min(20, Number(process.argv[3]) || 3));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// curl, not fetch(): node's own fetch does not pick up this environment's
// network path and hangs; curl demonstrably works here.
async function get(url) {
  await wait(1200);
  const out = execFileSync('curl', ['-sf', '--max-time', '30', '-A', UA, url], {
    encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  if (!out) throw new Error(`empty response on ${url}`);
  return out;
}

mkdirSync(DIR, { recursive: true });
const have = new Set(readdirSync(DIR).map((f) => f.replace(/\.html$/, '')));

const urls = [];
for (let p = 1; p <= pages; p++) {
  const listing = await get(p === 1 ? `${BASE}/${sort}/` : `${BASE}/${sort}/page/${p}/`);
  // pattern detail links: same-host, single path segment, not a browse route
  const skip = /^(liked|popular|recent|discussed|random|about|bpm|style|drumkit|page|wp-|feed|comments)/;
  for (const m of listing.matchAll(/href="https:\/\/drum-patterns\.com\/([a-z0-9-]+)\/"/g)) {
    if (!skip.test(m[1]) && !urls.includes(m[1])) urls.push(m[1]);
  }
}
console.log(`${sort} pages 1-${pages}: ${urls.length} pattern links, ${urls.filter((u) => have.has(u)).length} already saved`);

let saved = 0, failed = 0;
for (const slug of urls) {
  if (have.has(slug)) continue;
  try {
    const html = await get(`${BASE}/${slug}/`);
    writeFileSync(join(DIR, `${slug}.html`), html);
    saved++;
    if (saved % 10 === 0) console.log(`  …${saved} saved`);
  } catch (err) {
    failed++;
    console.log(`  FAILED ${slug}: ${err.message}`);
  }
}
console.log(`saved ${saved} new pages into audios/drum-patterns/ (${failed} failed)`);
console.log('next: node scripts/import-drum-patterns.mjs --report');
