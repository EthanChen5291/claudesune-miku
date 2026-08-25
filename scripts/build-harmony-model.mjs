// Counts the harmony corpus into src/lib/harmony-model.js — the prior the
// progression GENERATOR ranks against (D49).
//
// Usage: node scripts/build-harmony-model.mjs [--check]
//        --check  recount and diff against the committed model (CI guard)
//
// WHY COUNTS AND NOT A JOINT MODEL. Measured over all 421 entries: the corpus
// holds 2190 chords / 1769 transitions. As joint `<degree>:<quality>` tokens
// that is 155 symbols and 729 distinct bigrams of which 58% are seen exactly
// once — a table that memorizes rather than generalizes. Factored into a
// 12-symbol ROOT bigram it is 123 of 144 cells with 17% hapax, and
// quality-given-degree is separately well populated (>=84 observations on every
// degree but 6 and 11). So the model is factored: root motion, then quality.
//
// WHY A `wrap` TABLE. Every entry in this corpus is a LOOP, and a loop has no
// canonical first chord — 45% of entries do not begin on a tonic-function chord
// purely because the extractor found the cycle at a different rotation. Array
// position therefore teaches nothing about phrase position. What a loop DOES
// have is the transition from its last chord back to its first, and that turns
// out to carry the cadence: landing on the tonic is 41% (major) / 47% (minor) /
// 68% (modal) at the wrap versus 18-22% inside the loop, and the top wrap
// motions are the textbook cadences (V-I, IV-I, bVII-i, bII-I). `wrap` is that
// distribution, counted separately from `inner`.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/harmony-model.js');

/** major | minor | modal — the three families the library uses */
const famOf = (e) => (e.family === 'major' ? 'major' : e.family === 'minor' ? 'minor' : 'modal');
/** unison-dark / unison-emotional / unison-famous all count as one style */
const packOf = (e) => (String(e.pack ?? 'ldrolez').startsWith('unison') ? 'unison' : e.pack);

const blank = () => ({ inner: {}, wrap: {}, qual: {}, first: {} });
const bump = (tbl, a, b) => { (tbl[a] ??= {}); tbl[a][b] = (tbl[a][b] ?? 0) + 1; };

/**
 * An evidence gate, the same principle as D45's: a label the source material
 * never supported is not evidence and does not get to vote. Two conditions,
 * both already recorded on the entries by their own importers:
 *  - `match.agree === 0` — the unison importer checked the filename's claimed
 *    quality against the notes and agreed on NOT ONE chord (Rocket Man's every
 *    chord came out `-#5`, a minor-#5 triad, over a filename reading I-IV-I-IV
 *    and a key the directory contradicts).
 *  - `coverage < 0.6` — under 60% of what sounds is explained by the labels.
 */
function evidenceGate(e) {
  if (e.match && e.match.chords > 0 && e.match.agree === 0) return 'labeller agreed on no chord';
  if (e.coverage != null && e.coverage < 0.6) return `coverage ${e.coverage}`;
  return null;
}

const families = { major: blank(), minor: blank(), modal: blank(), all: blank() };
const packs = {};
const excluded = [];
let entries = 0, chords = 0, transitions = 0;

for (const [name, e] of Object.entries(ALL_PROGRESSIONS)) {
  const toks = parseDegrees(e.degrees);
  if (toks.length < 2) continue;
  const why = evidenceGate(e);
  if (why) { excluded.push(`${name} — ${why}`); continue; }
  const rs = toks.map((t) => t.semis);
  const pack = (packs[packOf(e)] ??= { major: blank(), minor: blank(), modal: blank() });
  const targets = [families[famOf(e)], families.all, pack[famOf(e)]];

  entries++;
  chords += toks.length;
  transitions += rs.length; // inner + the wrap

  for (const t of targets) {
    for (const { semis, quality } of toks) bump(t.qual, semis, quality);
    for (let i = 0; i < rs.length - 1; i++) bump(t.inner, rs[i], rs[i + 1]);
    bump(t.wrap, rs.at(-1), rs[0]);
    // Kept for provenance, NOT used as a phrase-start prior: see the header —
    // rotation makes index 0 arbitrary. A reader who reaches for it should see
    // the counts and the caveat in the same place.
    bump(t.first, rs[0], '');
  }
}

// ---------------------------------------------------------------------------

const num = (o) => `{${Object.keys(o).sort((a, b) => Number(a) - Number(b))
  .map((k) => `${k}:${o[k]}`).join(',')}}`;
const str = (o) => `{${Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([k, v]) => `${JSON.stringify(k)}:${v}`).join(',')}}`;

function emitTable(name, t, indent) {
  const p = ' '.repeat(indent);
  const L = [`${p}${name}: {`];
  for (const [key, fmt] of [['inner', num], ['wrap', num], ['qual', str], ['first', str]]) {
    const rows = Object.keys(t[key]).sort((a, b) => Number(a) - Number(b));
    L.push(`${p}  ${key}: {`);
    for (const r of rows) L.push(`${p}    ${r}: ${fmt(t[key][r])},`);
    L.push(`${p}  },`);
  }
  L.push(`${p}},`);
  return L;
}

const L = [];
L.push('// Counted harmony prior (D49): what the 421-entry progression corpus actually');
L.push('// does, as raw counts. The GENERATOR (src/lib/harmony-gen.js) ranks against');
L.push('// this; nothing here is a rule, and nothing here is normalized — smoothing and');
L.push('// backoff are the generator\'s job, so a reader can see the evidence n.');
L.push('//');
L.push('// GENERATED by scripts/build-harmony-model.mjs — do not hand-edit; re-run it.');
L.push('//');
L.push('//   inner[a][b]  transitions from root degree a to b INSIDE a loop');
L.push('//   wrap[a][b]   the loop\'s last chord a back to its first b — the cadence');
L.push('//                (landing on 0 is 2-4x likelier here than inside; see the');
L.push('//                 builder header for why this is the only honest cadence');
L.push('//                 evidence a corpus of rotated loops can offer)');
L.push('//   qual[d][q]   chord quality q observed on root degree d ("" = major triad)');
L.push('//   first[d]     how often degree d happened to be written first. PROVENANCE');
L.push('//                ONLY — a loop has no canonical first chord, and 45% of');
L.push('//                entries open off-tonic purely from where the extractor cut');
L.push('//                the cycle. Do not use as a phrase-start prior.');
L.push('//');
L.push('// Style tables are keyed pack -> FAMILY, not pack alone: a pack lumps major');
L.push('// and minor songs together, so an unsplit undertale table put a major triad on');
L.push('// 40% of minor-key tonics and the style prior overrode the mode.');
L.push('');
L.push('export const HARMONY_MODEL = {');
L.push(`  built: { entries: ${entries}, chords: ${chords}, transitions: ${transitions}, excluded: ${excluded.length} },`);
L.push('  families: {');
for (const f of ['major', 'minor', 'modal', 'all']) L.push(...emitTable(f, families[f], 4));
L.push('  },');
L.push('  packs: {');
for (const p of Object.keys(packs).sort()) {
  L.push(`    ${p}: {`);
  for (const f of ['major', 'minor', 'modal']) L.push(...emitTable(f, packs[p][f], 6));
  L.push('    },');
}
L.push('  },');
L.push('};');
L.push('');

const out = L.join('\n');
if (process.argv.includes('--check')) {
  if (readFileSync(OUT, 'utf8') !== out) {
    console.error(`${OUT} is stale — re-run: node scripts/build-harmony-model.mjs`);
    process.exit(1);
  }
  console.log(`harmony-model.js up to date (${entries} entries, ${transitions} transitions)`);
} else {
  writeFileSync(OUT, out);
  console.log(`wrote ${OUT}: ${entries} entries, ${chords} chords, ${transitions} transitions`);
  console.log(`  families: ${Object.keys(families).join(', ')}`);
  console.log(`  packs: ${Object.keys(packs).sort().join(', ')}`);
  console.log(`  excluded by the evidence gate: ${excluded.length}`);
  for (const x of excluded) console.log(`    ${x}`);
}
