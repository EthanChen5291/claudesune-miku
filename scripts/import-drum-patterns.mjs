// Saved-page importer for drum-patterns.com (D61).
//
// THIS SCRIPT NEVER FETCHES. The site's robots.txt disallows automated
// collection, so the input is pages a human saved by hand (browser "Save Page
// As" -> "Webpage, HTML Only") into audios/drum-patterns/. One saved page
// carries its own pattern fully structured in the markup — voices, 16-step
// banks, meter, swing flag, drum kit, style, BPM, and the bank PLAY ORDER
// (which bar is the groove, which is the fill) — plus several unrelated
// patterns the site embeds as recommendations. By default only the pattern the
// page is ABOUT is imported (the one Ethan chose to save); --all takes the
// embedded strangers too.
//
// What the grid cannot carry: velocity. Steps are on/off, so entries are
// accentless (accents: null, needsAccents) UNLESS the pattern used the drum
// machine's AC (accent) row — then hits on accented steps read 1.0 against a
// 0.85 base — or a GH (ghost) row, whose hits merge into the snare at 0.4.
// Either recovers a real, non-uniform profile the binder will accept.
//
// Run: node scripts/import-drum-patterns.mjs [--all] [--report] [--check]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'audios', 'drum-patterns');
const OUT = join(ROOT, 'src', 'lib', 'rhythms-drum-patterns.js');

const ALL = process.argv.includes('--all');
const REPORT = process.argv.includes('--report');
const CHECK = process.argv.includes('--check');

const slug = (s) => s.toLowerCase().replace(/&#?\w+;/g, ' ').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 54);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const frac = (n, d) => { const g = gcd(n, d) || 1; return `${n / g}/${d / g}`; };

// voice code -> [part name fallback, register band]. Titles in the markup win
// for the part name; the band is ours (rhythms.js band semantics: low/mid/high).
const VOICE_BAND = {
  bd: 'low', sd: 'mid', cp: 'mid', rs: 'mid', cb: 'mid', hc: 'mid',
  ch: 'high', oh: 'high', cy: 'high', lt: 'low', mt: 'mid', ht: 'mid',
};

const decode = (s) => s.replace(/&#8211;/g, '-').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ').trim();

/** Parse one saved drum-patterns.com page -> [{ title, url, main, meter, swing,
 *  kit, style, bpm, banks: [ {voice: steps[]} ], order }] */
export function parsePage(html, canonicalHint = null) {
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) ??
    html.match(/property="og:url" content="([^"]+)"/) ?? [null, canonicalHint])[1];
  const canonSlug = canonical ? canonical.replace(/\/+$/, '').split('/').pop() : null;

  const starts = [...html.matchAll(/<div class="(drumpattern [^"]*)"([^>]*)>/g)];
  const patterns = [];
  for (let i = 0; i < starts.length; i++) {
    const m = starts[i];
    const chunk = html.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined);
    const cls = m[1];
    const meter = (cls.match(/time-(\d+)-(\d+)/) ?? [null, '4', '4']).slice(1).join('/');
    const swing = /swing-[1-9]/.test(cls);
    const kit = (cls.match(/kit-([a-z0-9-]+)/) ?? [null, null])[1];
    const style = (cls.match(/style-([a-z0-9-]+)/) ?? [null, null])[1];
    const bankCount = Number((cls.match(/banks-(\d+)/) ?? [null, '1'])[1]);
    const orderAttr = (m[2].match(/data-order="([^"]+)"/) ?? [null, null])[1];
    const order = orderAttr ? orderAttr.split(',').map(Number)
      : Array.from({ length: bankCount }, (_, k) => k + 1);

    const anchor = chunk.match(/<h6[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*title="([^"]+)"/);
    const url = anchor ? anchor[1] : null;
    const title = anchor ? decode(anchor[2]) : `untitled_${i}`;
    const bpm = Number((chunk.match(/(\d+)\s*BPM/) ?? [null, 0])[1]) || null;

    const banks = [];
    for (const code of chunk.matchAll(/<code class="pattern[^"]*">([\s\S]*?)<\/code>/g)) {
      const bank = {};
      for (const row of code[1].matchAll(/<span class="voice voice-([a-z]+)"[^>]*title="([^"]+)"[^>]*>[^<]*<\/span><span class="beats">([\s\S]*?)<\/span><\/div>/g)) {
        const steps = (row[3].match(/<span[^>]*>/g) ?? []).map((s) => /class="on\b/.test(s) ? 1 : 0);
        bank[row[1]] = { title: decode(row[2]), steps };
      }
      if (Object.keys(bank).length) banks.push(bank);
    }
    if (!banks.length) continue;
    const urlSlug = url ? url.replace(/\/+$/, '').split('/').pop() : null;
    patterns.push({
      title, url, main: canonSlug != null && urlSlug === canonSlug,
      meter, swing, kit, style, bpm, banks: banks.slice(0, Math.max(bankCount, 1)), order,
    });
  }
  if (canonSlug == null && patterns.length) patterns[0].main = true; // best guess, reported
  // the page's own pattern shows its BPM in the header, above the first div
  const pageBpm = Number((html.slice(0, starts[0]?.index ?? 0).match(/(\d+)\s*BPM/) ?? [null, 0])[1]) || null;
  for (const p of patterns) if (p.main && p.bpm == null) p.bpm = pageBpm;
  return patterns;
}

/** One parsed pattern -> per-voice rhythm entries + a form record. */
export function buildEntries(p, sourceFile) {
  const grid = Math.max(...p.banks.flatMap((b) => Object.values(b).map((v) => v.steps.length)));
  const bars = p.order.length;
  const played = p.order.map((k) => p.banks[k - 1]).filter(Boolean);

  // fill = a bank used exactly once, in final position; intro likewise at the top
  const uses = (k) => p.order.filter((x) => x === k).length;
  const last = p.order[p.order.length - 1];
  const fill = bars > 1 && uses(last) === 1 ? last : null;
  const intro = bars > 1 && p.order[0] !== last && uses(p.order[0]) === 1 ? p.order[0] : null;

  const voiceCodes = [...new Set(played.flatMap((b) => Object.keys(b)))]
    .filter((v) => v !== 'ac' && v !== 'gh');

  const entries = [];
  for (const v of voiceCodes) {
    const onsets = [], accents = [];
    played.forEach((bank, bar) => {
      const row = bank[v]; if (!row) return;
      const ac = bank.ac?.steps ?? [];
      row.steps.forEach((on, i) => {
        if (!on) return;
        onsets.push(frac(bar * grid + i, grid));
        accents.push(ac[i] ? 1 : 0.85);
      });
      if (v === 'sd' && bank.gh) bank.gh.steps.forEach((on, i) => {
        if (!on || bank.sd?.steps[i]) return;
        onsets.push(frac(bar * grid + i, grid));
        accents.push(0.4);
      });
    });
    if (!onsets.length) continue;
    // re-sort after ghost merge (onsets are per-bar appended, ghosts out of order)
    const idx = onsets.map((o, i) => i).sort((a, b) => {
      const [an, ad] = onsets[a].split('/').map(Number), [bn, bd] = onsets[b].split('/').map(Number);
      return an / ad - bn / bd;
    });
    const sortedOn = idx.map((i) => onsets[i]), sortedAcc = idx.map((i) => accents[i]);
    const uniform = new Set(sortedAcc).size < 2;
    const part = played.find((b) => b[v])[v].title;
    entries.push({
      name: `dp_${slug(p.title)}_${v}`,
      role: 'percussion', band: VOICE_BAND[v] ?? 'mid',
      style: p.style ?? 'unknown', provenance: 'transcribed', ratified: false,
      pack: 'drum-patterns', pattern: p.title, part, kit: p.kit, bpm: p.bpm,
      bars, grid,
      onsets: sortedOn,
      accents: uniform ? null : sortedAcc,
      meter_class: p.meter,
      ...(p.swing ? { swing: 0.55 } : {}), // site flag is binary; amount is an audition-tunable default
      tags: [p.style, part.toLowerCase().replace(/\s+/g, '-'), p.kit].filter(Boolean),
      triage: uniform ? 'grid-flat' : 'grid-accent', needsAccents: uniform,
      source: `${sourceFile} <- ${p.url ?? 'unknown url'}`,
      character: null,
    });
  }
  const form = {
    name: `dp_${slug(p.title)}`, title: p.title, url: p.url, kit: p.kit,
    style: p.style, bpm: p.bpm, meter_class: p.meter, banks: p.banks.length,
    order: p.order, fill, intro,
  };
  return { entries, form };
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const lit = (v) => v === null ? 'null'
  : Array.isArray(v) ? `[${v.map(lit).join(', ')}]`
  : typeof v === 'string' ? q(v)
  : typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${/^[a-z_][a-z0-9_]*$/i.test(k) ? k : q(k)}: ${lit(x)}`).join(', ')} }`
  : String(v);

function emit(allEntries, forms, fileCount) {
  const L = [
    '// Drum-machine patterns from drum-patterns.com pages SAVED BY HAND (D61).',
    '//',
    '// GENERATED by scripts/import-drum-patterns.mjs — do not hand-edit; re-run the',
    '// importer. Every entry is `ratified: false` with `character: null`: an',
    '// extracted corpus is a CANDIDATE POOL, not a library (A6.1).',
    '//',
    '// `accents` is null wherever the source grid had no AC/GH row to read dynamics',
    '// from — those entries carry the groove and still need an accent profile',
    '// authored and auditioned before they can bind (same rule as rhythms-unison).',
    '// DRUM_PATTERN_FORMS records each pattern’s bank play order: which bar is',
    '// the groove, which is the fill — development-placement data (todo 0b).',
    `// Source: ${fileCount} saved page(s) in audios/drum-patterns/.`,
    '',
    'export const RHYTHMS_DRUM_PATTERNS = {',
  ];
  for (const e of allEntries) {
    const { name, ...rest } = e;
    L.push(`  ${name}: {`);
    L.push(`    role: ${q(rest.role)}, band: ${q(rest.band)}, style: ${q(rest.style)}, provenance: ${q(rest.provenance)}, ratified: false,`);
    L.push(`    pack: ${q(rest.pack)}, pattern: ${q(rest.pattern)}, part: ${q(rest.part)}, kit: ${lit(rest.kit)}, bpm: ${lit(rest.bpm)},`);
    L.push(`    bars: ${rest.bars}, grid: ${rest.grid},`);
    L.push(`    onsets: ${lit(rest.onsets)},`);
    L.push(`    accents: ${lit(rest.accents)},`);
    L.push(`    meter_class: ${q(rest.meter_class)},${rest.swing ? ` swing: ${rest.swing},` : ''}`);
    L.push(`    tags: ${lit(rest.tags)},`);
    L.push(`    triage: ${q(rest.triage)}, needsAccents: ${rest.needsAccents},`);
    L.push(`    source: ${q(rest.source)},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('};', '', 'export const DRUM_PATTERN_FORMS = {');
  for (const f of forms) {
    const { name, ...rest } = f;
    L.push(`  ${name}: ${lit(rest)},`);
  }
  L.push('};', '');
  return L.join('\n');
}

function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`no ${SRC_DIR} — save pattern pages there first:`);
    console.log('  browse drum-patterns.com, open a pattern you like, and use the');
    console.log('  browser "Save Page As" (HTML Only) into audios/drum-patterns/.');
    console.log('  Then re-run. (The importer never fetches: robots.txt there');
    console.log('  disallows automated collection, so the hand-saved page IS the consent.)');
    return;
  }
  const files = readdirSync(SRC_DIR).filter((f) => /\.html?$/i.test(f)).sort();
  const seen = new Set(); const allEntries = []; const forms = []; let skipped = 0;
  for (const f of files) {
    const html = readFileSync(join(SRC_DIR, f), 'utf8');
    for (const p of parsePage(html)) {
      if (!p.main && !ALL) { skipped++; continue; }
      const key = p.url ?? p.title;
      if (seen.has(key)) continue;
      seen.add(key);
      const { entries, form } = buildEntries(p, `audios/drum-patterns/${f}`);
      allEntries.push(...entries); forms.push(form);
    }
  }
  allEntries.sort((a, b) => a.name.localeCompare(b.name));
  forms.sort((a, b) => a.name.localeCompare(b.name));
  const out = emit(allEntries, forms, files.length);
  if (CHECK) {
    const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if (cur !== out) { console.error('rhythms-drum-patterns.js is stale — re-run the importer'); process.exit(1); }
    console.log('ok'); return;
  }
  writeFileSync(OUT, out);
  const withAcc = allEntries.filter((e) => !e.needsAccents).length;
  console.log(`${forms.length} patterns -> ${allEntries.length} voice entries (${withAcc} with recovered accents, ${allEntries.length - withAcc} needsAccents)`);
  console.log(`${skipped} embedded related patterns skipped (use --all to take them)`);
  if (REPORT) for (const f of forms) console.log(`  ${f.name}: ${f.style ?? '?'} @${f.bpm ?? '?'}bpm ${f.meter_class} banks=${f.banks} order=${f.order.join(',')}${f.fill ? ` fill=#${f.fill}` : ''}${f.intro ? ` intro=#${f.intro}` : ''}`);
}

if (process.argv[1] && basename(process.argv[1]) === 'import-drum-patterns.mjs') main();
