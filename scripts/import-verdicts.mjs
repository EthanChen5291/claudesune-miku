#!/usr/bin/env node
// Feeds an audition page's keep/kill verdicts back into the library (D51).
//
// Usage: node scripts/import-verdicts.mjs <exported.json> [--page <name>] [--check]
//        the JSON is what the audition pages' "copy verdicts JSON" button emits,
//        either {generated, texture, verdicts:{name:'keep'|'kill'}} or a bare
//        {name: 'keep'|'kill'} map.
//
// WHY THIS EXISTS. The audition pages have written verdicts to localStorage
// since D28 and nothing ever read them back, so `ratified` was false on all 421
// entries and A6.1's "a character line is earned by ear" had no mechanism. D50's
// exemplarPool() wants ratified entries and had to fall back to a stand-in.
// This closes the loop.
//
// KILLS ARE KEPT, not discarded. A rejected progression is the only negative
// evidence this project has ever collected, and "what Ethan does not want" is at
// least as useful for ranking as what he does.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROGRESSIONS } from '../src/lib/progressions.js';
import { FACET_VERDICTS as FACETS_PRIOR } from '../src/lib/facet-verdicts.js';
import { FACET_SEEDS } from '../src/lib/facet-seeds.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/verdicts.js');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const pageIx = args.indexOf('--page');
const page = pageIx >= 0 ? args[pageIx + 1] : null;
const file = args.find((a) => !a.startsWith('--') && a !== page);

/** what is already recorded, so a second page's verdicts merge rather than replace.
 *  The file spells the snapshot `judged`; in here it is `degrees`. Normalizing on
 *  READ matters — without it a --check run re-emitted every snapshot as null and
 *  reported the file stale against itself. */
async function existing() {
  if (!existsSync(OUT)) return {};
  const raw = (await import(OUT)).VERDICTS ?? {};
  return Object.fromEntries(Object.entries(raw)
    .map(([n, v]) => [n, { ...v, degrees: v.degrees ?? v.judged ?? null }]));
}

const merged = { ...(await existing()) };
// per-card free-text notes (D59 addendum): a separate bag keyed by entry name,
// merged like the verdicts so a session that leaves the box empty cannot erase
// what an earlier session said. Notes are evidence with or without a verdict —
// the judge page's strayNotes taught that lesson (t16/t20/t23 arrived as notes).
const mergedNotes = Object.fromEntries(Object.entries((existsSync(OUT) ? (await import(OUT)).CARD_NOTES : null) ?? {})
  // the file spells the snapshot `judged` (same normalization as existing()) —
  // without this, a note with a real snapshot re-emitted as null on --check
  .map(([n, v]) => [n, { ...v, degrees: v.degrees ?? v.judged ?? null }]));
// Verdicts on PAGE-LOCAL cards (D60): the progressions page auditions varied
// and generated entries that exist only on the page, so their verdicts cannot
// key into ALL_PROGRESSIONS — they land here instead, with the degrees the
// page actually rendered (derived from its symbols: pitch-exact, spelling-
// lossy) and the exemplar they came from. Built by a session's derived-import
// file, not by the raw export.
const mergedDerived = { ...((existsSync(OUT) ? (await import(OUT)).DERIVED_VERDICTS : null) ?? {}) };
// Verdicts on FOUNDATION FIGURATIONS (D61): audition/foundations.html judges
// accompaniment patterns, not progressions — separate bag, keyed by fnd_ name,
// snapshotting the figure tokens that played (a verdict judges the music that
// played; figurations-foundation.js refuses a stale one, same as degrees).
const mergedFig = { ...((existsSync(OUT) ? (await import(OUT)).FIGURE_VERDICTS : null) ?? {}) };
const mergedFigNotes = { ...((existsSync(OUT) ? (await import(OUT)).FIGURE_NOTES : null) ?? {}) };
// Vibe notes on harvested drum patterns (D63, audition/drums.html) — the
// confidence gate: a dp_* pattern enters song generation only once a note or
// keep has vouched for its vibe.
const mergedDrum = { ...((existsSync(OUT) ? (await import(OUT)).DRUM_VERDICTS : null) ?? {}) };
const mergedDrumNotes = { ...((existsSync(OUT) ? (await import(OUT)).DRUM_NOTES : null) ?? {}) };
// r43 — the COMBINATION LAB (audition/mixlab.html) emits a different SHAPE of
// evidence, and flattening it into CARD_NOTES would destroy the part that makes
// it useful. His ask was "leave a note either individually for that song or for
// the group, and i can do this multiple times": a note there is addressed at a
// LAYER, a GROUP of layers, or one exact COMBINATION, and every note records
// which layers were sounding when he wrote it. A note about a bass is worth
// nothing without the eleven other layers that were playing under it.
//
// Three bags, merged like everything else so a second session's export cannot
// erase the first's, and each note keyed by name -> a LIST (the whole point is
// that he says several things about one layer over several sittings).
const mergedLayerNotes = { ...((existsSync(OUT) ? (await import(OUT)).LAYER_NOTES : null) ?? {}) };
const mergedGroupNotes = { ...((existsSync(OUT) ? (await import(OUT)).GROUP_NOTES : null) ?? {}) };
const mergedComboNotes = [...((existsSync(OUT) ? (await import(OUT)).COMBO_NOTES : null) ?? [])];
let mixlabN = 0;
let added = 0, changed = 0, unknown = [], newNotes = [], derivedN = 0, impliedN = 0, figN = 0;

// The judge page (D52) emits TRIAL results, not per-entry verdicts, so it takes
// a different path: the answers are written to src/lib/judgments.js and, more
// to the point, TALLIED HERE. The whole reason for a controlled A/B is that the
// answer settles a question, and a question is only settled if somebody counts.
if (!CHECK && file) {
  const raw0 = JSON.parse(readFileSync(file, 'utf8'));
  // The facets page (D53) emits FACET verdicts — votes on pairs, wraps, chords,
  // textures and cadences rather than on whole entries. Different bags, different
  // output file, and a MERGE rather than a replace: the hand-seeded notes in
  // facet-verdicts.js are evidence too, and an export from a session where Ethan
  // never opened the cadence tab must not erase what the cadence tab knows.
  if (raw0.page === 'facets') { writeFacets(raw0); process.exit(0); }
  // r43 — the combination lab's notes. A note is identified by its TEXT plus
  // its selection, so re-pasting the same export twice cannot double it.
  if (raw0.page === 'r43-mixlab' || raw0.layerNotes || raw0.groupNotes || raw0.comboNotes) {
    const key = (r) => `${r.at}|${r.text}|${(r.sel?.layers ?? []).join('+')}`;
    const mergeList = (bag, name, recs) => {
      const have = new Set((bag[name] ?? []).map(key));
      for (const r of recs) if (!have.has(key(r))) { (bag[name] ??= []).push(r); mixlabN++; }
    };
    for (const [n, recs] of Object.entries(raw0.layerNotes ?? {})) mergeList(mergedLayerNotes, n, recs);
    for (const [n, recs] of Object.entries(raw0.groupNotes ?? {})) mergeList(mergedGroupNotes, n, recs);
    const haveC = new Set(mergedComboNotes.map(key));
    for (const r of raw0.comboNotes ?? []) if (!haveC.has(key(r))) { mergedComboNotes.push(r); mixlabN++; }
  }
  if (raw0.page === 'judge' || raw0.answers) {
    reportJudge(raw0.answers ?? {}, raw0.strayNotes ?? {});
    writeFileSync(join(ROOT, 'src/lib/judgments.js'),
      '// Trial answers from audition/judge.html (D52, patterns added D54).\n'
      + '//\n'
      + '// GENERATED by scripts/import-verdicts.mjs — do not hand-edit.\n'
      + '//\n'
      + '// Each key is a trial id; `asks` is the question that trial was built to\n'
      + '// settle, and `a`/`b` name which ARM each side came from, so a tally over\n'
      + '// these answers is a controlled comparison rather than a vibe.\n'
      + '//\n'
      + '// `pattern` is the interval pattern that was SOUNDING when the answer was\n'
      + '// given and `heard` is every pattern auditioned on that trial (D54). A\n'
      + '// preference that flips between block chords and an arpeggio is a finding\n'
      + '// about texture; one that holds across six is a finding about harmony.\n\n'
      + `export const JUDGMENTS = ${JSON.stringify(raw0.answers ?? {}, null, 2)};\n`
      + '\n// Notes typed on trials that were never answered — a sentence is worth more\n'
      + '// than the verdict it came with, so skipping past one does not discard it.\n'
      + `export const STRAY_NOTES = ${JSON.stringify(raw0.strayNotes ?? {}, null, 2)};\n`);
    console.log(`\nwrote src/lib/judgments.js (${Object.keys(raw0.answers ?? {}).length} answers)`);
    // The tone votes are the same kind of evidence audition/facets.html collects,
    // so they go to the same place rather than sitting in judgments.js where
    // nothing reads them. writeFacets() merges, so this cannot clobber the
    // facets page's own texture votes.
    if (Object.keys(raw0.tones ?? {}).length) {
      console.log('');
      writeFacets({ page: 'facets', generated: raw0.generated, tones: raw0.tones });
    }
    process.exit(0);
  }
}
// Regenerate facet-verdicts.js from the seeds plus what is already recorded, with
// no new export. Needed after editing facet-seeds.js, and it is what the test
// suite runs to prove the generated file is not hand-edited.
if (args.includes('--facets')) {
  writeFacets({ page: 'facets', generated: FACET_SEEDS.source });
  process.exit(0);
}

/**
 * The facets page's export -> src/lib/facet-verdicts.js (D53).
 *
 * MERGES into what is already recorded. Two reasons, both learned the hard way
 * elsewhere in this script: the hand-seeded notes are real evidence and must
 * survive an import, and an export from a session where Ethan only worked the
 * pairs tab carries empty texture/cadence bags that would otherwise wipe them.
 *
 * `pairs` and `wraps` land as-is. `textures` and `cadences` arrive keyed per
 * harmony and are TALLIED into per-format and per-family-device aggregates,
 * with the raw clicks kept beside them under `*Detail` — an aggregate cannot be
 * un-summed, so throwing the detail away would make the next import lossy.
 */
function writeFacets(raw) {
  // Three layers, least authoritative first: the hand-written seeds, then what
  // the last import produced, then this export. The seeds live in their own
  // never-generated file so that deleting the output and re-importing cannot
  // lose the notes Ethan gave in conversation.
  const bags = ['pairs', 'wraps', 'chords', 'textureDetail', 'cadenceDetail', 'toneDetail'];
  const prior = Object.fromEntries(bags.map((b) => [b, { ...(FACET_SEEDS[b] ?? {}), ...(FACETS_PRIOR[b] ?? {}) }]));
  const famOf = raw.familyOf ?? {};
  const merge = (bag) => {
    const out = { ...(prior[bag] ?? {}) };
    for (const [k, v] of Object.entries(raw[bag] ?? {})) {
      if (v !== 'good' && v !== 'bad') continue;
      out[k] = { verdict: v, n: 1, at: (raw.generated ?? '').slice(0, 10) || 'unknown', from: 'facets' };
    }
    return out;
  };
  const pairs = merge('pairs');
  const wraps = merge('wraps');
  const chords = merge('chords');

  // A pair vote gets its WEIGHT from how many chord colours agree with it. Two
  // tiles — `Cm->Bm` and `Cm->B` — write the same motion key, so the page cannot
  // record that the motion was liked twice; the agreeing chord verdicts can.
  // This is exactly how the seeded n=2 was derived by hand.
  for (const [key, rec] of Object.entries(pairs)) {
    const [fam, motion] = key.split('|');
    const to = Number(motion.split('>')[1]);
    const agree = Object.entries(chords).filter(([ck, cv]) => {
      const [cf, rest] = ck.split('|');
      return cf === fam && Number(rest.slice(0, rest.indexOf(':'))) === to && cv.verdict === rec.verdict;
    }).length;
    rec.n = Math.max(1, agree);
  }

  const textureDetail = { ...(prior.textureDetail ?? {}), ...pickVotes(raw.textures) };
  const cadenceDetail = { ...(prior.cadenceDetail ?? {}), ...pickVotes(raw.cadences) };
  // TONE VOTES FROM THE JUDGE PAGE (D55) land in their own detail bag and then
  // aggregate into the SAME per-format tally. Two pages, one opinion about which
  // renderings work. They are kept apart at the detail level only because the
  // key spaces differ — facets.html keys by library name, judge.html by the
  // harmony's `degrees` string, since a generated progression has no name.
  const toneDetail = { ...(prior.toneDetail ?? {}), ...pickVotes(raw.tones) };
  const lastBar = (k) => k.slice(k.lastIndexOf('|') + 1);
  const textures = tally({ ...textureDetail, ...toneDetail }, lastBar);
  const cadences = tally(cadenceDetail, (k) => `${famOf[k.slice(0, k.lastIndexOf('|'))] ?? 'any'}|${lastBar(k)}`);

  const S = (o) => JSON.stringify(o, null, 2).replace(/\n/g, '\n  ');
  const body = `// Facet-level ear verdicts (D53).
//
// GENERATED by scripts/import-verdicts.mjs from audition/facets.html — do not
// hand-edit; re-run the importer with a fresh export. The importer MERGES, so
// earlier sessions and the original hand-seeded notes survive.
//
// See src/lib/facets.js for what each bag means and how a vote becomes a
// probability. A \`good\` vote is worth EAR_COUNT pseudo-observations on the
// family's count row, so the ear speaks in the corpus's own currency.
//
// \`pairs\` feeds the INNER transition table only; \`wraps\` feeds the cadence
// table. They are separate because folding a liked transition into both took
// P(0->11) as a minor cadence from 0.07% to 19.8% on two votes.

export const FACET_VERDICTS = {
  source: ${JSON.stringify(raw.generated ?? 'facets export')},
  pairs: ${S(pairs)},
  wraps: ${S(wraps)},
  chords: ${S(chords)},
  textures: ${S(textures)},
  cadences: ${S(cadences)},

  // raw clicks behind the two aggregates above, so the next import is not lossy
  textureDetail: ${S(textureDetail)},
  cadenceDetail: ${S(cadenceDetail)},

  // per-(harmony, tone) votes from audition/judge.html; keyed by degrees
  toneDetail: ${S(toneDetail)},
};
`;
  writeFileSync(join(ROOT, 'src/lib/facet-verdicts.js'), body);
  const n = (o) => Object.keys(o).length;
  console.log(`wrote src/lib/facet-verdicts.js`);
  console.log(`  pairs    ${n(pairs)}  (${good(pairs)} good)`);
  console.log(`  wraps    ${n(wraps)}  (${good(wraps)} good)`);
  console.log(`  chords   ${n(chords)}  (${good(chords)} good)`);
  console.log(`  textures ${n(textures)} formats from ${n(textureDetail) + n(toneDetail)} clicks`
    + (n(toneDetail) ? ` (${n(toneDetail)} from the judge page)` : ''));
  for (const [id, t] of Object.entries(textures).sort((a, b) => b[1].good - a[1].good)) {
    console.log(`     ${id.padEnd(16)} ${String(t.good).padStart(3)} good  ${String(t.bad).padStart(3)} bad`);
  }
  console.log(`  cadences ${n(cadences)} devices from ${n(cadenceDetail)} clicks`);
  for (const [id, t] of Object.entries(cadences).sort((a, b) => b[1].good - a[1].good)) {
    console.log(`     ${id.padEnd(22)} ${String(t.good).padStart(3)} good  ${String(t.bad).padStart(3)} bad`);
  }
  const total = n(pairs) + n(wraps) + n(chords) + n(textureDetail) + n(cadenceDetail) + n(toneDetail);
  if (total < 40) console.log(`\n  ${total} votes total — LOW confidence, and every one is visible in the counts`);
}

// Function declarations, not consts: writeFacets() runs at module top level and
// a `const` arrow declared below it is in its temporal dead zone.
function good(bag) { return Object.values(bag).filter((r) => r.verdict === 'good').length; }
function pickVotes(bag) {
  return Object.fromEntries(Object.entries(bag ?? {})
    .filter(([, v]) => v === 'good' || v === 'bad')
    .map(([k, v]) => [k, { verdict: v, from: 'facets' }]));
}

function tally(detail, keyOf) {
  const out = {};
  for (const [k, rec] of Object.entries(detail)) {
    const g = keyOf(k);
    out[g] ??= { good: 0, bad: 0 };
    out[g][rec.verdict]++;
  }
  return out;
}

function reportJudge(answers, strayNotes = {}) {
  const rows = Object.values(answers);
  console.log(`${rows.length} answers from the judging page\n`);
  const byAsk = new Map();
  for (const r of rows) {
    if (r.type !== 'ab') continue;
    if (!byAsk.has(r.asks)) byAsk.set(r.asks, new Map());
    const tally = byAsk.get(r.asks);
    const winner = r.value === 'A' ? r.a : r.value === 'B' ? r.b : r.value;
    tally.set(winner, (tally.get(winner) ?? 0) + 1);
  }
  for (const [ask, tally] of byAsk) {
    const total = [...tally.values()].reduce((a, b) => a + b, 0);
    console.log(`  ${ask}`);
    for (const [arm, n] of [...tally].sort((a, b) => b[1] - a[1])) {
      console.log(`     ${String(n).padStart(3)}/${total}  ${arm}`);
    }
    // With this few trials, say so rather than letting a 4-2 read as a result.
    console.log(`     ${total < 8 ? 'TOO FEW TRIALS to call — indicative only' : 'n is usable'}\n`);
  }

  // D54: THE SAME QUESTION, SPLIT BY WHAT WAS SOUNDING. This is the whole reason
  // the patterns switch in lockstep — if an arm wins under block chords and
  // loses under an arpeggio, the answer is about texture, and reading the pooled
  // tally as a harmony result would be exactly D51's mistake again.
  const abRows = rows.filter((r) => r.type === 'ab' && r.pattern);
  if (abRows.length) {
    console.log('  the same contrasts, split by the pattern that was playing:');
    const byPat = new Map();
    for (const r of abRows) {
      const winner = r.value === 'A' ? r.a : r.value === 'B' ? r.b : r.value;
      if (!byPat.has(r.pattern)) byPat.set(r.pattern, new Map());
      const t = byPat.get(r.pattern);
      t.set(winner, (t.get(winner) ?? 0) + 1);
    }
    for (const [pat, t] of byPat) {
      const total = [...t.values()].reduce((a, b) => a + b, 0);
      console.log(`     ${String(pat).padEnd(10)} ${[...t].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(' · ')}   (n=${total})`);
    }
    const depends = rows.filter((r) => r.value === 'depends').length;
    if (depends) console.log(`     ${depends} answered "depends on the pattern" outright`);
    // How hard was the format actually swept? An answer given after hearing one
    // pattern says nothing about whether it would survive another.
    const spread = abRows.map((r) => (r.heard ?? []).length).sort((a, b) => a - b);
    const med = spread.length ? spread[Math.floor(spread.length / 2)] : 0;
    console.log(`     patterns auditioned per trial: median ${med}`
      + (med < 2 ? '  <- MOSTLY ONE PATTERN: these are not texture-robust results' : ''));
    console.log('');
  }

  const layers = rows.filter((r) => r.type === 'layer');
  if (layers.length) {
    console.log('  which layer was wrong:');
    const t = new Map();
    for (const r of layers) t.set(r.value, (t.get(r.value) ?? 0) + 1);
    for (const [k, n] of [...t].sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(3)}  ${k}`);
    console.log('');
  }
  const notes = rows.filter((r) => r.note);
  if (notes.length) {
    console.log('  what Ethan said (this is the part that generalizes):');
    for (const r of notes) console.log(`     [${r.name ?? r.type}${r.pattern ? ' · ' + r.pattern : ''}] ${r.note}`);
  }
  const stray = Object.entries(strayNotes);
  if (stray.length) {
    console.log('\n  notes on trials that were skipped rather than answered:');
    for (const [id, text] of stray) console.log(`     [${id}] ${text}`);
  }
}

if (!CHECK) {
  if (!file) {
    console.error('usage: node scripts/import-verdicts.mjs <exported.json> [--page <name>]');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  // A foundations export (D61) judges FIGURATIONS, not progressions — its
  // verdicts go to the FIGURE bags and never touch the progression merge.
  if (raw.figurations === true || raw.page === 'foundations') {
    const { FIGURATIONS_FOUNDATION } = await import('../src/lib/figurations-foundation.js');
    const at = (raw.generated ?? new Date().toISOString()).slice(0, 10);
    for (const [name, verdict] of Object.entries(raw.verdicts ?? {})) {
      if (!verdict) continue;
      if (!['keep', 'kill'].includes(verdict)) throw new Error(`${name}: bad verdict "${verdict}"`);
      if (!FIGURATIONS_FOUNDATION[name]) { unknown.push(name); continue; }
      // `from` marks a PROSE verdict (a blanket sentence like "they're good",
      // imported on Ethan's behalf) as opposed to a page click. A prose
      // verdict never overwrites a click — same rank rule as implied verdicts.
      if (raw.from && mergedFig[name] && !mergedFig[name].from) continue;
      const judged = raw.judged?.[name] ?? FIGURATIONS_FOUNDATION[name].figure.join(' ');
      if (!mergedFig[name]) figN++;
      mergedFig[name] = { verdict, at, judged, ...(raw.from ? { from: raw.from } : {}) };
    }
    for (const [name, text] of Object.entries(raw.notes ?? {})) {
      const t = String(text).trim();
      if (!t) continue;
      if (!FIGURATIONS_FOUNDATION[name]) { unknown.push(`${name} (note)`); continue; }
      if (mergedFigNotes[name]?.note !== t) newNotes.push([name, t]);
      mergedFigNotes[name] = { note: t, at, judged: raw.judged?.[name] ?? FIGURATIONS_FOUNDATION[name].figure.join(' ') };
    }
  } else if (raw.drums === true || raw.page === 'drums') {
    const { DRUM_PATTERN_FORMS } = await import('../src/lib/rhythms-drum-patterns.js');
    const at = (raw.generated ?? new Date().toISOString()).slice(0, 10);
    for (const [name, verdict] of Object.entries(raw.verdicts ?? {})) {
      if (!verdict) continue;
      if (!['keep', 'kill'].includes(verdict)) throw new Error(`${name}: bad verdict "${verdict}"`);
      if (!DRUM_PATTERN_FORMS[name]) { unknown.push(name); continue; }
      mergedDrum[name] = { verdict, at, url: DRUM_PATTERN_FORMS[name].url ?? null };
    }
    for (const [name, text] of Object.entries(raw.notes ?? {})) {
      const t = String(text).trim();
      if (!t) continue;
      if (!DRUM_PATTERN_FORMS[name]) { unknown.push(`${name} (note)`); continue; }
      if (mergedDrumNotes[name]?.note !== t) newNotes.push([name, t]);
      mergedDrumNotes[name] = { note: t, at, url: DRUM_PATTERN_FORMS[name].url ?? null };
    }
  } else {
  // An implied-verdicts file carries POSITIONAL inferences (Ethan's rule:
  // unmarked top half = good, unmarked second half = not good) — tagged so
  // later analysis can tell an inference from a click, and NEVER allowed to
  // overwrite a click from any session.
  const implied = raw.impliedVerdicts != null;
  // r43 — ...and a combination-lab export is NOT a verdict map either. The bare
  // fallback treats the whole object as {name: verdict}, so without this clause
  // the page tag itself is read as a verdict and the import dies on `bad verdict
  // "r43-mixlab"`. That lab has no keep/kill by design: a verdict on whatever
  // happened to be ticked is not a verdict on anything reproducible.
  const mixlabShape = raw.layerNotes || raw.groupNotes || raw.comboNotes;
  const verdicts = raw.verdicts ?? raw.impliedVerdicts ?? ((raw.derived || mixlabShape) ? {} : raw);
  const pageTag = implied ? `${page ?? raw.page ?? 'unknown'}-implied` : page;
  const at = (raw.generated ?? new Date().toISOString()).slice(0, 10);

  for (const [name, verdict] of Object.entries(verdicts)) {
    if (!verdict) continue;
    if (!['keep', 'kill'].includes(verdict)) throw new Error(`${name}: bad verdict "${verdict}"`);
    if (implied && merged[name]) continue; // a click outranks an inference, always
    // A verdict on an entry that no longer exists is a STALE verdict from an
    // older build of the page. Reported, not silently dropped — it means the
    // listener judged something the library has since renamed or regenerated.
    if (!ALL_PROGRESSIONS[name]) { unknown.push(name); continue; }
    const prior = merged[name];
    if (!prior) added++;
    else if (prior.verdict !== verdict) changed++;
    // Snapshot WHAT WAS JUDGED. A verdict is a judgment on the music that
    // played, and re-transcribing an entry can change that music entirely: the
    // percussion fix (D52) moved both Amalgam entries from B:minor to D:major,
    // so the two kills recorded against them were kills of a different piece.
    // The overlay refuses to honour a verdict whose degrees no longer match.
    merged[name] = { verdict, page: pageTag ?? prior?.page ?? 'unknown', at, degrees: ALL_PROGRESSIONS[name].degrees };
    if (implied) impliedN++;
  }
  for (const [name, rec] of Object.entries(raw.derived ?? {})) {
    if (!['keep', 'kill'].includes(rec.verdict)) throw new Error(`derived ${name}: bad verdict "${rec.verdict}"`);
    mergedDerived[name] = {
      verdict: rec.verdict, family: rec.family ?? null, degrees: rec.degrees ?? null,
      base: rec.base ?? null, page: pageTag ?? 'unknown', at,
    };
    derivedN++;
  }
  for (const [name, text] of Object.entries(raw.notes ?? {})) {
    const t = String(text).trim();
    if (!t) continue;
    // a note may name a PAGE-LOCAL card (D63: the songs page) — its degrees
    // come from the export's own derived record rather than the library.
    // D71: a card judged by NOTE ALONE (no keep/kill click) has no derived
    // record either — the videolab export describes every card in `cards`,
    // and the strayNotes lesson says the note is evidence regardless.
    const src = ALL_PROGRESSIONS[name] ?? raw.derived?.[name]
      ?? (Array.isArray(raw.cards) ? raw.cards.find((c) => c.name === name) : null)
      ?? (Array.isArray(raw.songs) ? raw.songs.find((c) => c.name === name) : null);
    if (!src) { unknown.push(`${name} (note)`); continue; }
    if (mergedNotes[name]?.note !== t) newNotes.push([name, t]);
    mergedNotes[name] = { note: t, at, degrees: src.degrees };
  }
  }
}

const names = Object.keys(merged).sort();
const L = [];
L.push('// Ear verdicts (D51): what Ethan kept and what he killed, per library entry.');
L.push('//');
L.push('// GENERATED by scripts/import-verdicts.mjs from an audition page\'s exported');
L.push('// JSON — do not hand-edit; re-run the importer with a fresh export.');
L.push('//');
L.push('// This is the ONLY quality signal the project has. Everything else in the');
L.push('// corpus records what a progression IS, never whether it is any good. A6.1');
L.push('// says a character line is earned by ear and never generated at import; this');
L.push('// file is where that ear is written down.');
L.push('//');
L.push('// `kill` entries are kept deliberately. Negative evidence is scarcer than');
L.push('// positive here and at least as useful for ranking.');
L.push('//');
L.push('// CAVEAT ON WHAT A VERDICT MEANS. These came from audition/undertale.html,');
L.push('// which plays a FULL ARRANGEMENT — so a verdict mixes the harmony with the');
L.push('// instruments, the form and the mix. It is a judgment on the card, not');
L.push('// cleanly on the progression. See D51 for what the verdicts turned out to');
L.push('// correlate with.');
L.push('');
L.push('export const VERDICTS = {');
for (const n of names) {
  const v = merged[n];
  L.push(`  ${n}: { verdict: '${v.verdict}', page: '${v.page}', at: '${v.at}',`);
  L.push(`    judged: ${JSON.stringify(v.degrees ?? null)} },`);
}
L.push('};');
L.push('');
L.push('export const KEPT = Object.keys(VERDICTS).filter((n) => VERDICTS[n].verdict === \'keep\');');
L.push('export const KILLED = Object.keys(VERDICTS).filter((n) => VERDICTS[n].verdict === \'kill\');');
L.push('');
if (Object.keys(mergedDerived).length) {
  L.push('// Verdicts on PAGE-LOCAL cards (D60) — varied/generated entries that exist');
  L.push('// only on an audition page. `degrees` is what the page rendered (derived');
  L.push('// from its symbols: pitch-exact, spelling-lossy); `base` is the exemplar a');
  L.push('// variation came from; a page tag ending in -implied marks a POSITIONAL');
  L.push('// inference (Ethan\'s unmarked-half rule), never a click.');
  L.push('export const DERIVED_VERDICTS = {');
  for (const n of Object.keys(mergedDerived).sort()) {
    const v = mergedDerived[n];
    L.push(`  ${JSON.stringify(n)}: { verdict: '${v.verdict}', page: '${v.page}', at: '${v.at}', base: ${JSON.stringify(v.base)},`);
    L.push(`    family: ${JSON.stringify(v.family)}, degrees: ${JSON.stringify(v.degrees)} },`);
  }
  L.push('};');
  L.push('');
}
if (Object.keys(mergedNotes).length) {
  L.push('// Free-text notes per card (D59 addendum) — evidence with or without a');
  L.push('// verdict; `judged` snapshots the degrees the note was about (same rule');
  L.push('// as the verdicts: a note judges the music that played).');
  L.push('export const CARD_NOTES = {');
  for (const n of Object.keys(mergedNotes).sort()) {
    const v = mergedNotes[n];
    L.push(`  ${n}: { note: ${JSON.stringify(v.note)}, at: '${v.at}',`);
    L.push(`    judged: ${JSON.stringify(v.degrees ?? null)} },`);
  }
  L.push('};');
  L.push('');
}
if (Object.keys(mergedFig).length) {
  L.push('// Verdicts on FOUNDATION FIGURATIONS (D61) from audition/foundations.html —');
  L.push('// keyed by fnd_ name; `judged` snapshots the figure tokens that played.');
  L.push('// figurations-foundation.js overlays these at load and refuses stale ones.');
  L.push('export const FIGURE_VERDICTS = {');
  for (const n of Object.keys(mergedFig).sort()) {
    const v = mergedFig[n];
    L.push(`  ${n}: { verdict: '${v.verdict}', at: '${v.at}',${v.from ? ` from: '${v.from}',` : ''} judged: ${JSON.stringify(v.judged ?? null)} },`);
  }
  L.push('};');
  L.push('');
}
if (Object.keys(mergedFigNotes).length) {
  L.push('// Free-text notes per foundation figuration (D61).');
  L.push('export const FIGURE_NOTES = {');
  for (const n of Object.keys(mergedFigNotes).sort()) {
    const v = mergedFigNotes[n];
    L.push(`  ${n}: { note: ${JSON.stringify(v.note)}, at: '${v.at}', judged: ${JSON.stringify(v.judged ?? null)} },`);
  }
  L.push('};');
  L.push('');
}
if (Object.keys(mergedDrum).length || Object.keys(mergedDrumNotes).length) {
  L.push('// The drum confidence gate (D63): verdicts + vibe notes on harvested');
  L.push('// dp_* patterns from audition/drums.html. A dp pattern may enter song');
  L.push('// generation only once something here vouches for its vibe.');
  L.push('export const DRUM_VERDICTS = {');
  for (const n of Object.keys(mergedDrum).sort()) {
    const v = mergedDrum[n];
    L.push(`  ${n}: { verdict: '${v.verdict}', at: '${v.at}', url: ${JSON.stringify(v.url)} },`);
  }
  L.push('};');
  L.push('export const DRUM_NOTES = {');
  for (const n of Object.keys(mergedDrumNotes).sort()) {
    const v = mergedDrumNotes[n];
    L.push(`  ${n}: { note: ${JSON.stringify(v.note)}, at: '${v.at}', url: ${JSON.stringify(v.url)} },`);
  }
  L.push('};');
  L.push('');
}

// r43 — the combination lab's three bags. Read by nothing in the generator on
// purpose: these are notes about LAYERS and COMBINATIONS, which is design
// evidence for the next round rather than a per-song pin, and a bag the engine
// reads is a bag that can re-roll a judged song (D95).
if (Object.keys(mergedLayerNotes).length || Object.keys(mergedGroupNotes).length || mergedComboNotes.length) {
  L.push('// Notes from audition/mixlab.html (r43) — the COMBINATION lab. Each note');
  L.push('// carries `sel`: the bed, the tempo, the loop and the exact list of layers');
  L.push('// that were sounding when it was written. Without that a note about "the');
  L.push('// bass" names one of sixteen basses under one of fifty other layers.');
  L.push('// LAYER_NOTES / GROUP_NOTES are keyed by the slot and group ids in');
  L.push('// SERIOUS_STACKS.sr_stack_mixlab; COMBO_NOTES is a flat list.');
  L.push(`export const LAYER_NOTES = ${JSON.stringify(mergedLayerNotes, null, 2)};`);
  L.push('');
  L.push(`export const GROUP_NOTES = ${JSON.stringify(mergedGroupNotes, null, 2)};`);
  L.push('');
  L.push(`export const COMBO_NOTES = ${JSON.stringify(mergedComboNotes, null, 2)};`);
  L.push('');
}

const out = L.join('\n');
if (CHECK) {
  if (!existsSync(OUT)) { console.error(`${OUT} does not exist — run the importer`); process.exit(1); }
  if (readFileSync(OUT, 'utf8') !== out) {
    console.error(`${OUT} is stale — re-run: node scripts/import-verdicts.mjs <export.json>`);
    process.exit(1);
  }
  console.log(`verdicts.js up to date (${names.length} verdicts)`);
} else {
  writeFileSync(OUT, out);
  const keeps = names.filter((n) => merged[n].verdict === 'keep').length;
  console.log(`wrote ${OUT}: ${names.length} verdicts (${keeps} keep, ${names.length - keeps} kill)`);
  console.log(`  ${added} new, ${changed} changed`);
  if (impliedN) console.log(`  ${impliedN} implied verdicts (positional rule) — tagged, and none overwrote a click`);
  if (derivedN) console.log(`  ${derivedN} page-local verdicts into DERIVED_VERDICTS (${Object.keys(mergedDerived).length} total)`);
  if (Object.keys(mergedFig).length) console.log(`  figuration verdicts: ${Object.keys(mergedFig).length} total (${figN} new) — foundations overlay live`);
  if (Object.keys(mergedDrum).length || Object.keys(mergedDrumNotes).length) console.log(`  drum gate: ${Object.keys(mergedDrum).length} verdicts, ${Object.keys(mergedDrumNotes).length} vibe notes`);
  if (Object.keys(mergedNotes).length) {
    console.log(`  ${Object.keys(mergedNotes).length} card notes carried (${newNotes.length} new this import)`);
    for (const [n, t] of newNotes) console.log(`     [${n}] ${t}`);
  }
  if (mixlabN) console.log(`  ${mixlabN} new combination-lab notes (${Object.keys(mergedLayerNotes).length} layers, ${Object.keys(mergedGroupNotes).length} groups, ${mergedComboNotes.length} combinations)`);
  for (const n of unknown) console.log(`  STALE: "${n}" is not in the library — verdict dropped`);
}
