#!/usr/bin/env node
// Builds audition/facets.html — the page that collects taste AT THE GRAIN ETHAN
// HEARS IT (D53).
//
// WHY A NEW PAGE AND NOT ANOTHER COLUMN ON THE OLD ONE. Every audition page so
// far asks one question: is this card good? Ethan's notes of 2026-08-24 showed
// that question destroys information, in three ways, and each one gets a tab:
//
//   "Cm Bm is a pretty good transition ... i rejected the ones that had these
//    simply because the progression itself sounded weird"
//        -> TAB 1, pairs. Every attested root motion, as a two-chord loop, with
//           the destination offered under the two qualities the corpus puts
//           there — because Ethan liked the motion under BOTH `Bm` and `B`, and
//           a page that only played one of them could not have learned that.
//
//   "the C sus followed by the resolved version of it could also be good as a
//    resolver last 2/4 measures"
//        -> TAB 3, cadences. The loop played three ways: as written, with the
//           wrap suspended, with the penultimate suspended. A suspension is a
//           delayed arrival, so it is judged where the arrival is.
//
//   "some of the chords i rejected sound worse only in the format they were
//    delivered ... perhaps also do different intervals (like arpeggio, or other
//    common variations) and I click which ones I like ... select all of the
//    above style"
//        -> TAB 2, textures. One harmony, seven renderings, MULTI-SELECT. Not
//           A/B: A/B forces a ranking where the honest answer is often "these
//           three work and those four don't".
//
// SELECTED IS NOT THE OPPOSITE OF REJECTED, and the page keeps them apart on
// purpose. A tile has three states — unjudged, ✓ works, ✗ doesn't — because in a
// select-all-that-applies grid the unclicked tiles are overwhelmingly "didn't
// get to it", and reading those as dislikes would manufacture negative evidence
// out of Ethan's attention span.
//
// Nothing musical is invented in the browser: every expression is produced here
// by the real bind()/bindComp()/bindFigure() against the real library.
//
// Run: node scripts/audition-facets.mjs   (then open audition/facets.html)

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

import { parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindComp, bind, bindFigure } from '../src/binder/bind.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS, voicingRegistration } from '../src/lib/voicings.js';
import { FIGURATIONS_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { HARMONY_MODEL } from '../src/lib/harmony-model.js';
import { qualityProbs, rootProbs, toNumeral, toDegrees } from '../src/lib/harmony-prior.js';
import { exemplarPool } from '../src/lib/harmony-vary.js';
import { OPS } from '../src/lib/harmony-ops.js';
import { FACET_VERDICTS } from '../src/lib/facet-verdicts.js';
import { EAR_COUNT } from '../src/lib/facets.js';
import { trimLoopWrap, loopIssues } from '../src/lib/loops.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

// ---------------------------------------------------------------------------
// The seven formats. Four are library figurations rather than voicing-dictionary
// comps, which is the point of the tab: an arpeggio distributes the same chord
// across time instead of stacking it, and Ethan's claim is that some harmony
// only fails under stacking. `seen` is how many bars of the corpus each was
// extracted from, so these are the formats the source material actually uses.
// ---------------------------------------------------------------------------
const TEXTURES = [
  { id: 'block', label: 'block comp', kind: 'comp', rhythm: 'pushed_comp_2bar', dict: 'shell_37', fx: '.room(0.25)' },
  { id: 'bossa', label: 'bossa', kind: 'comp', rhythm: 'bossa_comp_2bar', dict: 'drop2', fx: '.room(0.3)' },
  { id: 'pad', label: 'wide pad', kind: 'comp', rhythm: 'even_8ths', dict: 'spread_tenth', fx: '.room(0.45)' },
  { id: 'arp', label: 'arpeggio', kind: 'figure', fig: 'ut_arp_tem_shop', fx: '.room(0.3)' },
  { id: 'arpwide', label: 'wide arp', kind: 'figure', fig: 'ut_arp_spooktune_spookwave', fx: '.room(0.35)' },
  { id: 'oompah', label: 'oom-pah', kind: 'figure', fig: 'ut_oompah_dogsong', fx: '.room(0.2)' },
  { id: 'ostinato', label: 'octave ostinato', kind: 'figure', fig: 'ut_ostinato_core', fx: '.room(0.2)' },
];
// The pair grid uses two formats only. 144 motions x 3 families x 7 formats is a
// page nobody finishes; block and arpeggio bracket the range that matters here
// (stacked vs distributed), which is the distinction Ethan actually named.
const PAIR_TEXTURES = ['block', 'arp'];
const BASS = { rhythm: 'offbeat_8ths', contour: 'bass_root_five', octave: 2, fx: '.gain(0.7)' };
const SOUND = 'piano';

const SAMPLE_NAMES = new Set(JSON.parse(readFileSync(join(ROOT, 'src/ingest/sample-names.json'), 'utf8')).names);
if (!SAMPLE_NAMES.has(SOUND)) throw new Error(`sound "${SOUND}" is not in any loaded sample map`);
for (const t of TEXTURES) {
  if (t.kind === 'comp') {
    if (!RHYTHMS[t.rhythm]) throw new Error(`texture "${t.id}" names unknown rhythm "${t.rhythm}"`);
    if (!VOICINGS[t.dict]) throw new Error(`texture "${t.id}" names unknown voicing "${t.dict}"`);
  } else if (!FIGURATIONS_UNDERTALE[t.fig]) {
    throw new Error(`texture "${t.id}" names unknown figuration "${t.fig}"`);
  }
}
for (const id of PAIR_TEXTURES) {
  if (!TEXTURES.some((t) => t.id === id)) throw new Error(`PAIR_TEXTURES names unknown texture "${id}"`);
}

const keyFor = (family) => (family === 'minor' ? 'C:minor' : 'C:major');
const FAMILIES = ['major', 'minor', 'modal'];
/** the qualities every voicing dictionary on this page can actually shape */
const VOICEABLE = new Set(Object.keys(VOICINGS.shell_37.shapes));

/** one texture's expression for a harmony, or null when it cannot voice it */
function render(t, ctx, quals) {
  if (t.kind === 'comp') {
    if ([...quals].some((q) => !(q in VOICINGS[t.dict].shapes))) return null;
    return bindComp(RHYTHMS[t.rhythm], ctx, '4/4', {
      dict: t.dict, sound: SOUND, bounceSound: SOUND, fx: t.fx,
    }).expr;
  }
  // A figuration names CHORD MEMBERS (R/3/5/7), so it voices any quality the
  // chord parser understands — no dictionary gap to check.
  return bindFigure(FIGURATIONS_UNDERTALE[t.fig], ctx, '4/4', { sound: SOUND, fx: t.fx }).expr;
}

const bassFor = (ctx) => bind(RHYTHMS[BASS.rhythm], CONTOURS[BASS.contour], ctx, '4/4', {
  octave: BASS.octave, sound: SOUND, fx: BASS.fx,
}).expr;

/** [{semis,quality}] -> {symbols, exprs, bass} in `family`'s key */
function build(cycle0, family, textures) {
  const key = keyFor(family);
  // D56: a written progression that ends by repeating its first chord doubles
  // that bar every time the loop comes round. Trim for playback; the entry's own
  // degrees are untouched.
  const cycle = trimLoopWrap(cycle0);
  const symbols = renderProgression({ degrees: toDegrees(cycle), numerals: '?' }, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const quals = new Set(cycle.map((c) => c.quality));
  const exprs = {};
  for (const t of textures) exprs[t.id] = render(t, ctx, quals);
  return { symbols, exprs, bass: bassFor(ctx), trimmed: cycle.length !== cycle0.length };
}

// ---------------------------------------------------------------------------
// TAB 1 — pairs. Every root motion the family has actually played, offered under
// the destination qualities the family actually puts there.
// ---------------------------------------------------------------------------
const pairTextures = TEXTURES.filter((t) => PAIR_TEXTURES.includes(t.id));
const pairs = [];
for (const family of FAMILIES) {
  const fam = HARMONY_MODEL.families[family];
  const ctx = { family, home: 0 };
  for (let from = 0; from < 12; from++) {
    const row = fam.inner[from] ?? {};
    const n = Object.values(row).reduce((a, b) => a + b, 0);
    if (!n) continue;
    // the source chord is the family's most ordinary chord on that degree, so
    // the tile is about the MOVE and not about an exotic starting colour
    const fromQ = topQualities(from, ctx, 1)[0];
    if (fromQ == null) continue;
    for (let to = 0; to < 12; to++) {
      if (to === from) continue;
      const seen = row[to] ?? 0;
      if (!seen) continue;
      const p = rootProbs('inner', from, { ...ctx, ear: false }).get(to);
      for (const toQ of topQualities(to, ctx, 2)) {
        const cycle = [{ semis: from, quality: fromQ }, { semis: to, quality: toQ }];
        const built = build(cycle, family, pairTextures);
        if (!Object.values(built.exprs).some(Boolean)) continue;
        pairs.push({
          family,
          from, to, fromQ, toQ,
          motion: `${from}>${to}`,
          chord: `${to}:${toQ}`,
          label: `${built.symbols[0]} → ${built.symbols[1]}`,
          numerals: `${toNumeral(from, fromQ)} → ${toNumeral(to, toQ)}`,
          seen,
          p,
          // How much one ✓ would move the model. EAR_COUNT pseudo-counts against
          // a row of n observations: thin rows are where a vote earns its keep,
          // and the page can sort by it.
          leverage: EAR_COUNT / (n + EAR_COUNT),
          ...built,
        });
      }
    }
  }
}

/** the k most likely qualities on `degree` that every dictionary here can voice */
function topQualities(degree, ctx, k) {
  return [...qualityProbs(degree, { ...ctx, ear: false })]
    .filter(([q, p]) => VOICEABLE.has(q) && p >= 0.08)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([q]) => q);
}

// ---------------------------------------------------------------------------
// TAB 2 — textures, and TAB 3 — cadences. Both run over the exemplar pool: the
// progressions already believed to work, so the question on the page is only
// about the format or the ending and not smuggling in a harmony judgment.
// ---------------------------------------------------------------------------
const harmonies = [];
for (const [name, e] of exemplarPool().entries) {
  const cycle = parseDegrees(e.degrees);
  if (cycle.length < 3) continue;
  const built = build(cycle, e.family, TEXTURES);
  if (!built.exprs.block && !built.exprs.arp) continue;

  // the three endings, built by the real operator rather than spelled by hand
  const ctx = { family: e.family, home: cycle[0].semis };
  const cadences = [{
    id: 'as_written', label: 'as written', note: 'the loop\'s own ending',
    ...build(cycle, e.family, TEXTURES.filter((t) => t.id === 'block')),
    degrees: toDegrees(cycle),
  }];
  for (const s of OPS.cadential_sus.sites(cycle, ctx)) {
    const out = cycle.map((c, i) => (i === s.slot ? { ...c, ...s.to } : c));
    const b = build(out, e.family, TEXTURES.filter((t) => t.id === 'block'));
    if (!b.exprs.block) continue;
    cadences.push({
      id: s.note.startsWith('wrap') ? 'wrap_sus' : 'penultimate_sus',
      label: s.note.startsWith('wrap') ? 'suspend the wrap' : 'suspend the penultimate',
      note: s.note, degrees: toDegrees(out), ...b,
    });
  }

  harmonies.push({
    name, family: e.family, numerals: e.numerals, degrees: e.degrees,
    song: e.song ?? null,
    missing: Object.fromEntries(TEXTURES.filter((t) => t.kind === 'comp')
      .map((t) => [t.id, [...new Set(cycle.map((c) => c.quality))].filter((q) => !(q in VOICINGS[t.dict].shapes))])),
    // the loop's own wrap motion, votable on its own — this is the ONLY thing
    // that writes to the `wraps` bag, which is why it is not on the pairs tab
    wrap: {
      motion: `${cycle.at(-1).semis}>${cycle[0].semis}`,
      label: `${built.symbols.at(-1)} → ${built.symbols[0]}`,
    },
    cadences,
    ...built,
  });
}

// ---------------------------------------------------------------------------
// Self-check: the emitted code must evaluate under the transpiler the REPL uses.
// ---------------------------------------------------------------------------
const preamble = [...new Set(TEXTURES.filter((t) => t.kind === 'comp').map((t) => t.dict))]
  .map(voicingRegistration).join('\n');
const FULL = process.argv.includes('--full');
const sample = [];
for (const family of FAMILIES) {
  for (const t of pairTextures) {
    const p = pairs.find((x) => x.family === family && x.exprs[t.id]);
    if (p) sample.push([`pair ${p.numerals}`, p.exprs[t.id], p.bass]);
  }
  for (const t of TEXTURES) {
    const h = harmonies.find((x) => x.family === family && x.exprs[t.id]);
    if (h) sample.push([`${h.name}/${t.id}`, h.exprs[t.id], h.bass]);
  }
  const h = harmonies.find((x) => x.family === family);
  for (const c of h?.cadences ?? []) sample.push([`${h.name}/${c.id}`, c.exprs.block, c.bass]);
}
const toCheck = FULL
  ? [...pairs.flatMap((p) => pairTextures.filter((t) => p.exprs[t.id]).map((t) => [p.numerals, p.exprs[t.id], p.bass])),
    ...harmonies.flatMap((h) => TEXTURES.filter((t) => h.exprs[t.id]).map((t) => [h.name, h.exprs[t.id], h.bass])),
    ...harmonies.flatMap((h) => h.cadences.filter((c) => c.exprs.block).map((c) => [h.name + '/' + c.id, c.exprs.block, c.bass]))]
  : sample;
let checked = 0;
for (const [what, expr, bassExpr] of toCheck) {
  if (!expr) continue;
  const ev = await evaluateSong(`setcpm(120/4)\n${preamble}\np: stack(${expr}, ${bassExpr}).transpose(0)`);
  const haps = hapsByLabel(ev, 0, 4).get('p');
  if (!haps || haps.error || !haps.haps.length) {
    throw new Error(`generated code for ${what} produced no haps: ${haps?.error ?? 'empty'}`);
  }
  checked++;
}

const DATA = {
  pairs, harmonies, preamble,
  textures: TEXTURES.map(({ id, label, kind, rhythm, dict, fig }) => ({
    id, label, kind, detail: kind === 'comp' ? `${rhythm} × me_${dict}` : `${fig} (${FIGURATIONS_UNDERTALE[fig].seen} bars seen)`,
  })),
  pairTextures: PAIR_TEXTURES,
  bassLabel: `${BASS.rhythm} × ${BASS.contour}`,
  earCount: EAR_COUNT,
  // what is already believed, so the page opens with Ethan's notes already on it
  // rather than asking him to re-enter what he has told me
  // `textures` and `cadences` seed from the per-harmony DETAIL the importer keeps
  // alongside the aggregate, because the aggregate cannot be un-summed back into
  // the clicks that produced it.
  seed: {
    pairs: FACET_VERDICTS.pairs, wraps: FACET_VERDICTS.wraps, chords: FACET_VERDICTS.chords,
    textures: FACET_VERDICTS.textureDetail ?? {}, cadences: FACET_VERDICTS.cadenceDetail ?? {},
  },
  // family per harmony, so the importer can aggregate cadence devices by family
  familyOf: Object.fromEntries(harmonies.map((h) => [h.name, h.family])),
};

const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
if (!/<script src="[^"]*@strudel\/web@/.test(html)) throw new Error('page emits no strudel bundle tag');

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'facets.html'), html);
console.log(`wrote audition/facets.html`);
console.log(`  ${pairs.length} pair tiles across ${FAMILIES.length} families (${PAIR_TEXTURES.join(' + ')})`);
console.log(`  ${harmonies.length} harmonies × ${TEXTURES.length} textures`);
console.log(`  ${harmonies.reduce((a, h) => a + h.cadences.length, 0)} cadence treatments`);
console.log(`  ${checked}${FULL ? '' : ' sampled'} patterns evaluated green through the engine's own transpiler${FULL ? ' (ALL)' : ' (--full checks all)'}`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);

function page(D) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>facets — audition</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  h2 { font-size:13px; margin:20px 0 7px; color:var(--dim); font-weight:600; letter-spacing:.03em; }
  .dim { color:var(--dim); font-size:12.5px; }
  .hint { color:var(--dim); font-size:12px; max-width:78ch; margin:2px 0 12px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  select, input[type=search] { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:4px 8px; font:inherit; }
  input[type=range] { accent-color:var(--accent); width:100px; vertical-align:middle; }
  input[type=checkbox] { accent-color:var(--accent); }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:12px 18px 70px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(196px,1fr)); gap:8px; }
  .tile { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:8px 10px 7px; cursor:pointer; position:relative; }
  .tile:hover { border-color:#4a4a5e; }
  .tile.playing { background:#1e2438; border-color:var(--accent); }
  .tile.good { border-left:3px solid var(--keep); }
  .tile.bad { border-left:3px solid var(--kill); opacity:.45; }
  .tile.dead { opacity:.3; cursor:not-allowed; }
  .big { font-weight:650; font-size:15px; letter-spacing:.02em; }
  .sub { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11.5px; color:var(--dim); }
  .acts { display:flex; gap:5px; margin-top:6px; }
  .acts button { padding:1px 9px; font-size:11.5px; }
  .acts button.g.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.b.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:11px 13px; margin-bottom:9px; }
  .card h3 { margin:0 0 2px; font-size:14.5px; }
  .strip { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
  .chip { border:1px solid var(--line); background:#1e1e28; border-radius:7px; padding:5px 9px; cursor:pointer; font-size:12.5px; display:flex; gap:7px; align-items:center; }
  .chip:hover { border-color:#5a5a6e; }
  .chip.playing { background:#1e2438; border-color:var(--accent); }
  .chip.good { border-color:var(--keep); background:#15281a; }
  .chip.bad { border-color:var(--kill); background:#2a1616; opacity:.55; }
  .chip.dead { opacity:.3; cursor:not-allowed; }
  .chip .x { color:var(--dim); font-size:11px; padding:0 2px; border-radius:4px; }
  .chip .x:hover { color:var(--kill); }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#252531; border:1px solid #3a3a4a; border-radius:4px; padding:0 5px; font:11.5px ui-monospace,monospace; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>facets — audition</h1>
    <button class="tab on" id="tab-pairs" data-tab="pairs">1 · pairs</button>
    <button class="tab" id="tab-textures" data-tab="textures">2 · textures</button>
    <button class="tab" id="tab-cadences" data-tab="cadences">3 · cadences</button>
    <span class="now" id="now">— click anything to play —</span>
    <button id="stop">■ stop</button>
  </div>
  <div class="row" style="margin-top:7px">
    <label class="ctl">format <span id="tex"></span></label>
    <label class="ctl"><input type="checkbox" id="bass"> bass <span class="dim" id="bassLabel"></span></label>
    <label class="ctl"><input type="checkbox" id="withBlock"> + block chords under figures</label>
    <label class="ctl">bpm <input type="range" id="bpm" min="60" max="170" value="104"><span id="bpmv">104</span></label>
  </div>
  <div class="row" style="margin-top:7px" id="pairCtl">
    <label class="ctl">family <select id="fFam"><option>minor</option><option>major</option><option>modal</option></select></label>
    <label class="ctl">order <select id="fSort">
      <option value="leverage">leverage — where a vote moves the model most</option>
      <option value="rare">rarest in the corpus first</option>
      <option value="common">commonest first</option>
      <option value="degree">by starting degree</option>
    </select></label>
    <label class="ctl">from <select id="fFrom"><option value="">any chord</option></select></label>
    <label class="ctl"><input type="checkbox" id="fUnjudged"> hide what I've judged</label>
    <input type="search" id="fText" placeholder="search chords / numerals">
  </div>
</header>
<main>
  <div id="pairs"></div>
  <div id="textures" hidden></div>
  <div id="cadences" hidden></div>
</main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <span class="dim"><kbd>space</kbd> replay <kbd>esc</kbd> stop</span>
  <button id="export">copy facet JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(D)};
const LS = 'motif-engine:facet-verdicts';

// Three states everywhere: undefined (not judged), 'good', 'bad'. The seeds are
// what Ethan has already said in conversation, pre-loaded so the page never asks
// him to repeat himself; localStorage wins over a seed once he touches a tile.
let V = { pairs:{}, wraps:{}, chords:{}, textures:{}, cadences:{} };
for (const bag of Object.keys(V)) {
  for (const [k, rec] of Object.entries(DATA.seed[bag] || {})) V[bag][k] = rec.verdict;
}
try {
  const saved = JSON.parse(localStorage.getItem(LS) || '{}');
  for (const bag of Object.keys(V)) Object.assign(V[bag], saved[bag] || {});
} catch {}

let tab = 'pairs', texture = 'block', playing = null;
const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(LS, JSON.stringify(V));
const texOf = (id) => DATA.textures.find((t) => t.id === id);

function codeFor(expr, bassExpr, opts) {
  if (!expr) return null;
  const parts = [expr];
  if (opts && opts.block) parts.push(opts.block);
  if ($('bass').checked && bassExpr) parts.push(bassExpr);
  const bpm = Number($('bpm').value) || 104;
  return 'setcpm(' + bpm + '/4)\\n' + DATA.preamble + '\\np: stack(' + parts.join(', ') + ')';
}

async function play(id, expr, bassExpr, label, opts) {
  const code = codeFor(expr, bassExpr, opts);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio (first play loads the piano)…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = id;
  $('now').textContent = '▶ ' + label;
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '— stopped —'; render(); }

function vote(bag, key, val) {
  V[bag][key] = V[bag][key] === val ? undefined : val;
  if (!V[bag][key]) delete V[bag][key];
  save(); render();
}

/** a ✓ / ✗ pair; 'bags' is [[bag,key], ...] so one click can record a motion AND
 *  the chord that motion landed on, which is how "Cm->Bm good, Cm->B bad" stays
 *  two separate facts instead of cancelling out into nothing. */
function acts(bags) {
  const el = document.createElement('div');
  el.className = 'acts';
  const state = V[bags[0][0]][bags[0][1]];
  for (const [cls, val, txt] of [['g', 'good', '✓ works'], ['b', 'bad', '✗ no']]) {
    const b = document.createElement('button');
    b.className = cls + (state === val ? ' on' : '');
    b.textContent = txt;
    b.onclick = (ev) => {
      ev.stopPropagation();
      const next = state === val ? undefined : val;
      for (const [bag, key] of bags) {
        if (next) V[bag][key] = next; else delete V[bag][key];
      }
      save(); render();
    };
    el.appendChild(b);
  }
  return el;
}

// ---------------------------------------------------------------------------
function renderPairs() {
  const host = $('pairs');
  host.innerHTML = '';
  const fam = $('fFam').value;
  const q = $('fText').value.trim().toLowerCase();
  const fromSel = $('fFrom').value;
  // The pair grid is only precomputed in two formats (see PAIR_TEXTURES). Silently
  // falling back beats showing an empty grid, but it must SAY so — a page that
  // quietly plays something other than the selected format is worse than one that
  // plays nothing, because you would trust the verdict.
  const pt = DATA.pairTextures.includes(texture) ? texture : DATA.pairTextures[0];
  let rows = DATA.pairs.filter((p) => p.family === fam && p.exprs[pt]);
  if (fromSel !== '') rows = rows.filter((p) => String(p.from) === fromSel);
  if (q) rows = rows.filter((p) => (p.label + ' ' + p.numerals).toLowerCase().includes(q));
  if ($('fUnjudged').checked) rows = rows.filter((p) => !V.pairs[p.family + '|' + p.motion] && !V.chords[p.family + '|' + p.chord]);
  const sort = $('fSort').value;
  rows = rows.slice().sort((a, b) =>
    sort === 'leverage' ? b.leverage - a.leverage || a.p - b.p
      : sort === 'rare' ? a.seen - b.seen || a.from - b.from
        : sort === 'common' ? b.seen - a.seen
          : a.from - b.from || b.seen - a.seen);

  const h = document.createElement('p');
  h.className = 'hint';
  h.innerHTML = 'Each tile is a <b>two-chord loop</b>, so you hear the move and the way back. '
    + 'A ✓ records the <b>root motion</b> and <b>the chord it landed on</b> as two separate facts — '
    + 'so ✓ on <code>Cm → Bm</code> and ✗ on <code>Cm → B</code> means "the move works, that colour doesn\\'t", '
    + 'and neither cancels the other. Skipping a tile is <b>not</b> a rejection; only ✗ is. '
    + 'One ✓ is worth ' + DATA.earCount + ' corpus observations, so the <i>leverage</i> ordering puts the '
    + 'thin rows first — those are the moves where your ear actually changes what the generator reaches for.'
    + (pt === texture ? ''
      : '<br><b style="color:#e8a33d">Playing these in ' + texOf(pt).label + '</b> — the pair grid is only '
        + 'built in ' + DATA.pairTextures.map((x) => texOf(x).label).join(' and ') + ', so your verdict is about '
        + 'that format, not about ' + texOf(texture).label + '.');
  host.appendChild(h);

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const p of rows) {
    const pk = p.family + '|' + p.motion, ck = p.family + '|' + p.chord;
    const st = V.pairs[pk] || V.chords[ck];
    const el = document.createElement('div');
    el.className = 'tile' + (playing === 'p:' + pk + ck ? ' playing' : '') + (st ? ' ' + st : '');
    el.innerHTML = '<div class="big">' + p.label + '</div>'
      + '<div class="sub">' + p.numerals + '</div>'
      + '<div class="sub">' + p.seen + ' in corpus · ' + (100 * p.p).toFixed(1) + '%'
      + (V.pairs[pk] && !V.chords[ck] ? ' · move judged' : '') + '</div>';
    el.appendChild(acts([['pairs', pk], ['chords', ck]]));
    el.onclick = () => play('p:' + pk + ck, p.exprs[pt], p.bass, p.label + '   (' + p.numerals + ')');
    grid.appendChild(el);
  }
  host.appendChild(grid);
  if (!rows.length) host.appendChild(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'nothing matches — try another family or clear the filters' }));
}

// ---------------------------------------------------------------------------
function renderTextures() {
  const host = $('textures');
  host.innerHTML = '';
  const h = document.createElement('p');
  h.className = 'hint';
  h.innerHTML = 'One harmony, every format, <b>select all that work</b> — not a ranking. '
    + 'These are progressions already believed good, so a ✗ here is a verdict on the <i>rendering</i>, '
    + 'not on the chords. That is the whole point: "some of the chords i rejected sound worse only in '
    + 'the format they were delivered."';
  host.appendChild(h);
  for (const H of DATA.harmonies) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>' + H.symbols.join(' ') + '</h3>'
      + '<div class="sub">' + H.numerals + ' · ' + H.family + (H.song ? ' · ' + H.song : '') + '</div>';
    const strip = document.createElement('div');
    strip.className = 'strip';
    for (const t of DATA.textures) {
      const expr = H.exprs[t.id];
      // Keyed per HARMONY, not per format. A format's overall standing is an
      // aggregate the importer computes; storing only the aggregate here would
      // mean judging the next harmony silently overwrote the last one's opinion,
      // and "the arpeggio works for this progression but not that one" is
      // exactly the distinction the tab exists to capture.
      const key = H.name + '|' + t.id;
      const st = V.textures[key];
      const chip = document.createElement('div');
      chip.className = 'chip' + (expr ? '' : ' dead') + (playing === 'h:' + H.name + t.id ? ' playing' : '')
        + (st ? ' ' + st : '');
      chip.title = expr ? t.detail
        : t.detail + ' — no voicing shape for: ' + (H.missing[t.id] || []).join(', ');
      chip.innerHTML = '<span>' + (st === 'good' ? '✓ ' : st === 'bad' ? '✗ ' : '') + t.label + '</span>';
      const x = document.createElement('span');
      x.className = 'x'; x.textContent = '✗'; x.title = 'this format does not work here';
      x.onclick = (ev) => { ev.stopPropagation(); vote('textures', key, 'bad'); };
      chip.appendChild(x);
      if (expr) {
        chip.onclick = () => {
          vote('textures', key, 'good');
          play('h:' + H.name + t.id, expr, H.bass, H.symbols.join(' ') + '   ' + t.label,
            { block: (t.kind === 'figure' && $('withBlock').checked) ? H.exprs.block : null });
        };
      }
      strip.appendChild(chip);
    }
    card.appendChild(strip);
    host.appendChild(card);
  }
}

// ---------------------------------------------------------------------------
function renderCadences() {
  const host = $('cadences');
  host.innerHTML = '';
  const h = document.createElement('p');
  h.className = 'hint';
  h.innerHTML = 'The same loop ending three ways. <b>suspend the wrap</b> turns the last chord into a sus '
    + 'on the first chord\\'s root, so the seam is <code>Xsus → X</code>; <b>suspend the penultimate</b> is '
    + 'the literal last-two-measures reading. Both cost the chord they replace. '
    + 'The <b>wrap chip</b> underneath votes on the loop\\'s own last→first motion as a <i>cadence</i>, '
    + 'which is a separate question from whether that move works mid-loop — the corpus rates the two '
    + 'very differently and this page keeps them apart.';
  host.appendChild(h);
  for (const H of DATA.harmonies) {
    if (H.cadences.length < 2) continue;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>' + H.symbols.join(' ') + '</h3><div class="sub">' + H.numerals + ' · ' + H.family + '</div>';
    const strip = document.createElement('div');
    strip.className = 'strip';
    for (const c of H.cadences) {
      const key = H.name + '|' + c.id; // per harmony; the importer aggregates by family × device
      const st = V.cadences[key];
      const chip = document.createElement('div');
      chip.className = 'chip' + (c.exprs.block ? '' : ' dead') + (playing === 'c:' + H.name + c.id ? ' playing' : '')
        + (st ? ' ' + st : '');
      chip.title = c.note + '   ' + c.symbols.join(' ');
      chip.innerHTML = '<span>' + (st === 'good' ? '✓ ' : st === 'bad' ? '✗ ' : '') + c.label
        + ' <span class="sub">' + c.symbols.slice(-2).join(' ') + '</span></span>';
      const x = document.createElement('span');
      x.className = 'x'; x.textContent = '✗';
      x.onclick = (ev) => { ev.stopPropagation(); vote('cadences', key, 'bad'); };
      chip.appendChild(x);
      if (c.exprs.block) {
        chip.onclick = () => {
          vote('cadences', key, 'good');
          play('c:' + H.name + c.id, c.exprs.block, c.bass, c.symbols.join(' ') + '   — ' + c.label);
        };
      }
      strip.appendChild(chip);
    }
    const wk = H.family + '|' + H.wrap.motion;
    const wst = V.wraps[wk];
    const w = document.createElement('div');
    w.className = 'chip' + (wst ? ' ' + wst : '');
    w.innerHTML = '<span>wrap: ' + H.wrap.label + '</span>';
    w.title = 'does this ending WORK as an ending? separate from the same move mid-loop';
    w.onclick = () => vote('wraps', wk, 'good');
    const wx = document.createElement('span');
    wx.className = 'x'; wx.textContent = '✗';
    wx.onclick = (ev) => { ev.stopPropagation(); vote('wraps', wk, 'bad'); };
    w.appendChild(wx);
    strip.appendChild(w);
    card.appendChild(strip);
    host.appendChild(card);
  }
}

function render() {
  $('pairs').hidden = tab !== 'pairs';
  $('textures').hidden = tab !== 'textures';
  $('cadences').hidden = tab !== 'cadences';
  $('pairCtl').style.display = tab === 'pairs' ? '' : 'none';
  if (tab === 'pairs') renderPairs(); else if (tab === 'textures') renderTextures(); else renderCadences();
  const n = (b) => Object.keys(V[b]).length;
  const g = (b) => Object.values(V[b]).filter((x) => x === 'good').length;
  $('tally').innerHTML = ['pairs', 'wraps', 'chords', 'textures', 'cadences']
    .map((b) => b + ' <b style="color:var(--keep)">' + g(b) + '</b>/' + n(b)).join(' · ');
}

// ---------------------------------------------------------------------------
const texWrap = $('tex');
for (const t of DATA.textures) {
  const b = document.createElement('button');
  b.textContent = t.label; b.title = t.detail;
  b.className = t.id === texture ? 'on' : '';
  b.dataset.tex = t.id;
  b.onclick = () => {
    texture = t.id;
    for (const c of texWrap.children) c.className = c.dataset.tex === texture ? 'on' : '';
    render();
  };
  texWrap.appendChild(b);
}
// Wired by id rather than by class so the DOM shim in test/helpers/dom.mjs can
// reach them — its querySelectorAll() returns nothing, which would have left the
// tabs untested and untestable.
const TABS = ['pairs', 'textures', 'cadences'];
for (const name of TABS) {
  $('tab-' + name).onclick = () => {
    tab = name;
    for (const o of TABS) $('tab-' + o).className = 'tab' + (o === name ? ' on' : '');
    render();
  };
}
{
  const seen = new Set();
  for (const p of DATA.pairs) {
    const k = p.family + '|' + p.from + '|' + p.fromQ;
    if (seen.has(k)) continue;
    seen.add(k);
  }
  for (let d = 0; d < 12; d++) $('fFrom').add(new Option('degree ' + d, String(d)));
}
$('bassLabel').textContent = '(' + DATA.bassLabel + ')';
// Set every control explicitly rather than leaning on the browser's implicit
// "first <option> wins" — a page whose initial state depends on that renders
// nothing at all under a DOM that does not implement it, which is exactly how
// the first version of this page came up with zero tiles.
$('fFam').value = 'minor';
$('fSort').value = 'leverage';
$('fFrom').value = '';
$('fText').value = '';
for (const id of ['fFam', 'fSort', 'fFrom', 'fUnjudged', 'fText']) $(id).oninput = render;
$('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; };
$('stop').onclick = stop;
$('export').onclick = async () => {
  const out = { page: 'facets', generated: new Date().toISOString(), texture, ...V };
  const ok = await rtCopy(JSON.stringify(out, null, 2));
  $('export').textContent = ok ? 'copied ✓' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy facet JSON'; }, 1200);
};
document.onkeydown = (ev) => {
  if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
  if (ev.key === 'Escape') stop();
};
render();
</script>
</body>
</html>`;
}
