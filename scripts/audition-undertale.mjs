#!/usr/bin/env node
// Builds audition/undertale.html — the ear-check pass over everything extracted
// from audios/Undertale MIDI (D30). A separate page from unison.html for the
// same reason that page is separate from progressions.html: different corpus,
// different provenance, and a verdict must be attributable to its pool.
//
// Four tabs:
//   progressions  166 chord loops solved from the songs, played as comping under
//                 the corpus's own figurations. NEEDS EAR marks low chord
//                 coverage or an ambiguous key solve.
//   figures       85 accompaniment figurations — the "movement of the fingers"
//                 with the chord factored out. THE point of this pass: each
//                 figure plays over ANY progression (its own song's, a minor
//                 axis, a major pop loop …) to hear that the movement survives
//                 re-harmonisation.
//   development   observed A->B figure moves (repitch, blockify, octave lift…),
//                 rendered as 4 bars of A then 4 bars of B over one progression.
//   melody        the observation notes (undertale-melody.md) — no entries, by
//                 design.
//
// As with the other pages: every pattern is generated HERE by the real binder,
// and the browser only assembles strings.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';
import { PROGRESSIONS_UNDERTALE } from '../src/lib/progressions-undertale.js';
import { FIGURATIONS_UNDERTALE, DEVELOPMENT_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure, bind } from '../src/binder/bind.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const PIANO = 'github:felixroos/dough-samples/main/piano.json';
const FULL = process.argv.includes('--full');

const KEY_FOR = (fam) => (fam === 'minor' ? 'C:minor' : 'C:major');

// ---- textures: the corpus's own figures, one per class ---------------------
const figList = Object.entries(FIGURATIONS_UNDERTALE);
function pickTexture(cls) {
  const ok = figList
    .filter(([, e]) => e.class === cls && e.meter_class === '4/4' && !e.needsEar)
    .sort((a, b) => b[1].seen - a[1].seen);
  return ok[0]?.[0] ?? null;
}
const TEXTURES = [
  { id: 'arp', label: 'arp', fig: pickTexture('arp') ?? pickTexture('arp_up') },
  { id: 'oompah', label: 'oom-pah', fig: pickTexture('oompah') },
  { id: 'block', label: 'block', fig: pickTexture('block') },
  { id: 'ostinato', label: 'ostinato', fig: pickTexture('ostinato') },
].filter((t) => t.fig);

// ---- progressions ---------------------------------------------------------
const progressions = Object.entries(PROGRESSIONS_UNDERTALE).map(([name, e]) => {
  const key = KEY_FOR(e.family);
  const symbols = renderProgression(e, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const exprs = {};
  for (const t of TEXTURES) {
    exprs[t.id] = bindFigure(FIGURATIONS_UNDERTALE[t.fig], ctx, '4/4', { sound: 'piano', fx: '.room(0.25)' }).expr;
  }
  const bass = bind(RHYTHMS.offbeat_8ths, CONTOURS.bass_root_five, ctx, '4/4', {
    octave: 2, sound: 'piano', fx: '.gain(0.7)',
  }).expr;
  return {
    name, song: e.song, family: e.family, numerals: e.numerals, symbols,
    length: parseDegrees(e.degrees).length,
    barsPerChord: e.barsPerChord, loopBars: e.loopBars, reps: e.reps, atBar: e.atBar,
    meter: e.meter, bpm: e.bpm, sourceKey: e.sourceKey, keyMargin: e.keyMargin,
    coverage: e.coverage, needsEar: !!e.needsEar,
    exprs, bass,
  };
});

// ---- figures --------------------------------------------------------------
// Test progressions the figures are re-applied to. 'own' resolves per figure.
const CONTEXTS = [
  { id: 'own', label: 'own song' },
  { id: 'axis', label: 'i VI III VII', degrees: '0:m 8 3 10', family: 'minor' },
  { id: 'pop', label: 'I V vi IV', degrees: '0 7 9:m 5', family: 'major' },
  { id: 'epic', label: 'i III VII VI', degrees: '0:m 3 10 8', family: 'minor' },
];
function ctxHarmony(c) {
  const key = KEY_FOR(c.family);
  return { harmony: renderProgression({ degrees: c.degrees, numerals: c.label }, key), barsPerChord: 1, key };
}
const progBySong = new Map(); // best loop per song: trusted first, then coverage
for (const p of progressions) {
  const cur = progBySong.get(p.song);
  if (!cur || (cur.needsEar && !p.needsEar) || (cur.needsEar === p.needsEar && p.coverage > cur.coverage)) {
    progBySong.set(p.song, p);
  }
}
const figures = figList.map(([name, e]) => {
  const topSong = (e.songs[0] ?? '').replace(/ \(\d+\)$/, '');
  const own = progBySong.get(topSong);
  const exprs = {};
  const labels = {};
  for (const c of CONTEXTS) {
    if (c.id === 'own') {
      if (own) {
        const key = KEY_FOR(own.family);
        const ctx = { harmony: own.symbols, barsPerChord: 1, key };
        exprs.own = bindFigure(e, ctx, e.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr;
        labels.own = `${own.numerals} (${topSong})`;
      }
      continue;
    }
    exprs[c.id] = bindFigure(e, ctxHarmony(c), e.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr;
    labels[c.id] = c.label;
  }
  return {
    name, cls: e.class, role: e.role, meter: e.meter_class, grid: e.grid,
    figure: e.figure, onsets: e.onsets.length, octave: e.octave, legato: e.legato,
    seen: e.seen, songs: e.songs, fit: e.fit, needsEar: !!e.needsEar,
    micro: !!e.microtiming, exprs, labels,
  };
});

// ---- development ----------------------------------------------------------
// A move plays as 4 bars of the FROM figure, then 4 bars of the TO figure, over
// one progression — the octave difference between the two entries is preserved
// by raising the higher side's tokens.
function stretchTokens(figure, delta) {
  if (delta <= 0) return figure;
  return figure.map((t) => t.split('.').map((m) => m + '+'.repeat(delta)).join('.'));
}
function concatMove(a, b, barsEach = 4) {
  const octave = Math.min(a.octave, b.octave);
  const parts = { onsets: [], figure: [], accents: [], microtiming: [] };
  const add = (e, offset) => {
    const fig = stretchTokens(e.figure, e.octave - octave);
    for (let k = 0; k < barsEach; k++) {
      for (let i = 0; i < e.onsets.length; i++) {
        const [n, d] = e.onsets[i].split('/').map(Number);
        parts.onsets.push(`${n + (k + offset) * d}/${d}`);
        parts.figure.push(fig[i]);
        parts.accents.push(e.accents[i]);
        parts.microtiming.push(e.microtiming ? (e.microtiming[i] ?? '0') : '0');
      }
    }
  };
  add(a, 0);
  add(b, barsEach);
  const hasMicro = parts.microtiming.some((m) => m !== '0');
  return {
    bars: barsEach * 2, onsets: parts.onsets, figure: parts.figure, accents: parts.accents,
    ...(hasMicro ? { microtiming: parts.microtiming } : {}),
    octave, legato: a.legato && b.legato,
  };
}
const development = DEVELOPMENT_UNDERTALE.map((m, i) => {
  const a = FIGURATIONS_UNDERTALE[m.from];
  const b = FIGURATIONS_UNDERTALE[m.to];
  const combined = concatMove(a, b);
  const ctx = ctxHarmony(CONTEXTS[1]); // minor axis
  return {
    name: `move_${i}_${m.from}__${m.to}`,
    from: m.from, to: m.to, relation: m.relation, seen: m.seen, examples: m.examples,
    expr: bindFigure(combined, ctx, a.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr,
  };
});

// ---- melody notes ---------------------------------------------------------
const melodyMd = readFileSync(join(ROOT, 'undertale-melody.md'), 'utf8');
function mdToHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  for (const line of lines) {
    const b = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
    if (/^# /.test(line)) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h2>${b(line.slice(2))}</h2>`); }
    else if (/^## /.test(line)) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h3>${b(line.slice(3))}</h3>`); }
    else if (/^- /.test(line)) { if (!inList) { out.push('<ul>'); inList = true; } out.push(`<li>${b(line.slice(2))}</li>`); }
    else if (/^\s+/.test(line) && inList && line.trim()) { out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, ' ' + b(line.trim()) + '</li>'); }
    else if (!line.trim()) { if (inList) { out.push('</ul>'); inList = false; } }
    else out.push(`<p>${b(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

// ---- verify every generated pattern actually evaluates --------------------
const all = [
  ...progressions.flatMap((p) => TEXTURES.map((t) => [`${p.name}/${t.id}`, `stack(${p.exprs[t.id]}, ${p.bass})`])),
  ...figures.flatMap((f) => Object.entries(f.exprs).map(([c, x]) => [`${f.name}/${c}`, x])),
  ...development.map((d) => [d.name, d.expr]),
];
const sample = FULL ? all : all.filter((_, i) => i % Math.ceil(all.length / 24) === 0);
let checked = 0;
for (const [id, expr] of sample) {
  const code = `setcpm(110/4)\np: ${expr}`;
  const ev = await evaluateSong(code);
  const h = hapsByLabel(ev, 0, 8).get('p');
  if (!h || h.error || !h.haps.length) throw new Error(`${id} produced no haps: ${h?.error ?? 'empty'}`);
  checked++;
}

const DATA = {
  progressions, figures, development,
  textures: TEXTURES.map(({ id, label, fig }) => ({ id, label, fig })),
  contexts: CONTEXTS.map(({ id, label }) => ({ id, label })),
  classes: [...new Set(figures.map((f) => f.cls))].sort(),
  melodyHtml: mdToHtml(melodyMd),
  piano: PIANO,
};

const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'undertale.html'), html);

console.log(`wrote audition/undertale.html`);
console.log(`  progressions ${progressions.length} (${progressions.filter((p) => p.needsEar).length} flagged NEEDS EAR)`);
console.log(`  figures      ${figures.length} (${figures.filter((f) => f.needsEar).length} flagged) — textures: ${TEXTURES.map((t) => t.fig).join(', ')}`);
console.log(`  development  ${development.length} moves`);
console.log(`  ${checked}${FULL ? '' : ' sampled'} of ${all.length} patterns evaluated green${FULL ? '' : ' (--full checks all)'}; page script parses (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>undertale — audition</title>
<style>
  :root { color-scheme: dark; --bg:#12141a; --panel:#191c24; --line:#292d3a; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#e0503c; --keep:#37b24d; --kill:#e03131; --warn:#e8a33d; }
  * { box-sizing:border-box; }
  body { font:13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  select, input[type=search] { background:#1e212b; color:var(--fg); border:1px solid #3a3f52; border-radius:6px; padding:4px 8px; font:inherit; max-width:220px; }
  input[type=range] { accent-color:var(--accent); width:100px; vertical-align:middle; }
  input[type=checkbox] { accent-color:var(--accent); }
  button { font:inherit; border-radius:6px; border:1px solid #3a3f52; background:#1e212b; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5f76; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; font-weight:600; }
  .tabs button { padding:5px 14px; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 60px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(248px,1fr)); gap:9px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:9px 11px 8px; cursor:pointer; position:relative; }
  .card:hover { border-color:#4a5066; }
  .card.sel { border-color:var(--accent); }
  .card.playing { background:#2b1a17; border-color:var(--accent); }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.5; }
  .num { font-family:ui-monospace, Menlo, monospace; font-size:12px; color:var(--dim); word-break:break-all; }
  .sym { font-weight:650; font-size:13.5px; margin:2px 0 4px; }
  .fig { font-family:ui-monospace, Menlo, monospace; font-size:12.5px; color:#ffd7ae; margin:2px 0 4px; word-break:break-all; }
  .tags { font-size:11.5px; color:var(--dim); min-height:15px; }
  .flag { display:inline-block; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#1a1208; background:var(--warn); border-radius:3px; padding:0 5px; margin-right:5px; font-weight:700; }
  .badge { position:absolute; top:8px; right:10px; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#6b7086; }
  .acts { display:flex; gap:5px; margin-top:7px; flex-wrap:wrap; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#232734; border:1px solid #3a3f52; border-radius:4px; padding:0 5px; font:11.5px ui-monospace,monospace; }
  .note { background:#191c24; border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:0 8px 8px 0; padding:9px 13px; margin-bottom:12px; font-size:12.5px; color:#c9c9dc; }
  .prose { max-width:820px; }
  .prose h2 { font-size:18px; margin:6px 0 10px; }
  .prose h3 { font-size:14.5px; margin:18px 0 6px; color:var(--accent); }
  .prose li { margin:6px 0; }
  .prose code { background:#232734; border-radius:4px; padding:0 4px; font-size:12px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>undertale — audition</h1>
    <div class="tabs" id="tabs"></div>
    <span class="dim" id="count"></span>
    <span class="now" id="now">— click a card to play —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">click any card to start audio</span>
  </div>
  <div class="row" style="margin-top:7px" id="controls"></div>
</header>
<main>
  <div class="note" id="blurb"></div>
  <div class="grid" id="grid"></div>
  <div class="prose" id="prose" style="display:none"></div>
</main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <span class="dim"><kbd>&larr;&rarr;&uarr;&darr;</kbd> move <kbd>space</kbd> play <kbd>k</kbd> keep <kbd>x</kbd> kill <kbd>esc</kbd> stop</span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:undertale-verdicts';
let verdicts = {}; try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let tab = 'progressions', texture = DATA.textures[0] ? DATA.textures[0].id : 'arp', context = 'axis', playing = null, sel = 0, visible = [];
const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(LS, JSON.stringify(verdicts));

const BLURB = {
  progressions: 'Chord loops these songs actually cycle. NO labels existed: the key is solved from the notes (keyMargin = confidence) and every chord label carries a coverage score — NEEDS EAR marks thin evidence. Played at 1 bar per chord even where the source moved faster (barsPerChord shows the truth), voiced by the corpus\\u2019s own figurations.',
  figures: 'The left hand with the chord factored out — R=root, 3/5/7/9 the sounding chord\\u2019s members, ~n a literal colour, + an octave, a.b together. Switch the progression to hear the SAME movement re-voice itself over different harmony: that portability is what is being auditioned. \\u201cown song\\u201d plays it over a loop extracted from the song it came from.',
  development: 'Observed A\\u2192B moves between figures: 4 bars of A, then 4 bars of B, over i VI III VII. The relation tag says what changes (repitch keeps the rhythm and moves the pitches; blockify fuses an arp into chords; …). This is how the corpus develops an accompaniment without abandoning it.',
  melody: 'Notes only — no entries were extracted from the melodies, by design (see the bottom of the page).',
};

function codeFor(e) {
  const bpm = Number($('bpm') && $('bpm').value) || 110;
  let body;
  if (tab === 'progressions') body = ($('bass') && $('bass').checked) ? 'stack(' + e.exprs[texture] + ', ' + e.bass + ')' : e.exprs[texture];
  else if (tab === 'figures') body = e.exprs[context] || e.exprs.axis;
  else body = e.expr;
  return 'setcpm(' + bpm + '/4)\\np: ' + body;
}
async function play(e) {
  const code = codeFor(e);
  $('now').textContent = RT.ready ? '…' : 'starting audio (first play loads the piano)…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = e.name;
  $('now').textContent = '▶ ' + labelOf(e);
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '— stopped —'; render(); }
function labelOf(e) {
  if (tab === 'progressions') return (e.song || '?') + '  —  ' + e.numerals;
  if (tab === 'figures') return e.name + '  over  ' + (e.labels[context] || context);
  return e.from + ' → ' + e.to;
}

function items() {
  if (tab === 'progressions') return DATA.progressions;
  if (tab === 'figures') return DATA.figures;
  if (tab === 'development') return DATA.development;
  return [];
}
function matches(e) {
  const q = ($('q') ? $('q').value : '').trim().toLowerCase();
  if (q && !JSON.stringify([e.name, e.song || '', e.numerals || '', (e.songs || []).join(' '), e.cls || '', e.from || '', e.to || '']).toLowerCase().includes(q)) return false;
  if (tab === 'progressions') {
    if ($('fam').value && e.family !== $('fam').value) return false;
    if ($('ear').checked && !e.needsEar) return false;
  }
  if (tab === 'figures') {
    if ($('cls').value && e.cls !== $('cls').value) return false;
    if ($('ear').checked && !e.needsEar) return false;
  }
  return true;
}

function controls() {
  const c = $('controls');
  if (tab === 'progressions') {
    c.innerHTML = '<label class="ctl">texture <span id="tex"></span></label>' +
      '<label class="ctl"><input type="checkbox" id="bass" checked> bass</label>' +
      '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<label class="ctl">mode <select id="fam"><option value="">all</option><option>major</option><option>minor</option></select></label>' +
      '<label class="ctl"><input type="checkbox" id="ear"> only NEEDS EAR</label>' +
      '<input type="search" id="q" placeholder="search song / numerals">';
    const tw = $('tex');
    DATA.textures.forEach((t) => {
      const b = document.createElement('button');
      b.textContent = t.label; b.title = t.fig; b.className = t.id === texture ? 'on' : '';
      b.onclick = () => { texture = t.id; controls(); render(); if (playing) { const e = DATA.progressions.find((x) => x.name === playing); if (e) play(e); } };
      tw.appendChild(b);
    });
  } else if (tab === 'figures') {
    c.innerHTML = '<label class="ctl">progression <span id="ctxb"></span></label>' +
      '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<label class="ctl">class <select id="cls"><option value="">all</option>' + DATA.classes.map((x) => '<option>' + x + '</option>').join('') + '</select></label>' +
      '<label class="ctl"><input type="checkbox" id="ear"> only NEEDS EAR</label>' +
      '<input type="search" id="q" placeholder="search figure / song">';
    const cw = $('ctxb');
    DATA.contexts.forEach((x) => {
      const b = document.createElement('button');
      b.textContent = x.label; b.className = x.id === context ? 'on' : '';
      b.onclick = () => { context = x.id; controls(); render(); if (playing) { const e = DATA.figures.find((f) => f.name === playing); if (e) play(e); } };
      cw.appendChild(b);
    });
  } else if (tab === 'development') {
    c.innerHTML = '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<input type="search" id="q" placeholder="search move">';
  } else {
    c.innerHTML = '';
  }
  if ($('bpm')) $('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  for (const id of ['fam', 'ear', 'q', 'bass', 'cls']) if ($(id)) $(id).oninput = render;
  $('blurb').textContent = BLURB[tab];
}

function render() {
  const prose = tab === 'melody';
  $('grid').style.display = prose ? 'none' : '';
  $('prose').style.display = prose ? '' : 'none';
  if (prose) { $('prose').innerHTML = DATA.melodyHtml; $('count').textContent = ''; return; }
  visible = items().filter(matches);
  if (sel >= visible.length) sel = Math.max(0, visible.length - 1);
  const grid = $('grid'); grid.innerHTML = '';
  visible.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (i === sel ? ' sel' : '') + (playing === e.name ? ' playing' : '') + (verdicts[e.name] ? ' ' + verdicts[e.name] : '');
    let head = '', body = '', tags = '', badge = '';
    if (tab === 'progressions') {
      badge = e.meter + (e.bpm ? ' · ' + e.bpm : '');
      head = e.needsEar ? '<span class="flag">needs ear</span>' : '';
      body = '<div class="num">' + e.numerals + '</div><div class="sym">' + e.symbols.join(' ') + '</div>';
      tags = e.song + ' · ' + e.loopBars + '-bar loop ×' + e.reps + ' · cov ' + e.coverage;
      card.title = e.name + '\\nsolved key ' + e.sourceKey + ' (margin ' + e.keyMargin + ')\\nbars per chord: ' + e.barsPerChord.join(', ') + '\\nfound at bar ' + e.atBar;
    } else if (tab === 'figures') {
      badge = e.cls + ' · ' + e.meter;
      head = e.needsEar ? '<span class="flag">needs ear</span>' : '';
      body = '<div class="fig">' + e.figure.join(' ') + '</div>';
      tags = e.seen + ' bars · ' + e.songs.slice(0, 2).join(', ') + (e.micro ? ' · feel' : '');
      card.title = e.name + '\\nrole ' + e.role + ' · octave ' + e.octave + (e.legato ? ' · legato' : '') + '\\nfit: ' + JSON.stringify(e.fit) + '\\nsongs: ' + e.songs.join(', ');
    } else {
      badge = '×' + e.seen;
      body = '<div class="sym">' + e.from.replace(/^ut_/, '') + ' → ' + e.to.replace(/^ut_/, '') + '</div>' +
        '<div class="num">' + e.relation.join(' + ') + '</div>';
      tags = e.examples.join(' · ');
      card.title = e.name;
    }
    card.innerHTML = '<div class="badge">' + badge + '</div>' + head + body + '<div class="tags">' + tags + '</div>';
    const acts = document.createElement('div'); acts.className = 'acts';
    for (const [cls, verd] of [['k', 'keep'], ['x', 'kill']]) {
      const b = document.createElement('button');
      b.className = cls + (verdicts[e.name] === verd ? ' on' : ''); b.textContent = verd;
      b.onclick = (ev) => { ev.stopPropagation(); mark(e, verd); };
      acts.appendChild(b);
    }
    const cp = document.createElement('button'); cp.textContent = 'copy';
    cp.onclick = (ev) => { ev.stopPropagation(); copy(e, cp); };
    acts.appendChild(cp);
    card.appendChild(acts);
    card.onclick = () => { sel = i; play(e); };
    grid.appendChild(card);
  });
  $('count').textContent = visible.length + ' shown';
  const k = Object.values(verdicts).filter((v) => v === 'keep').length;
  const x = Object.values(verdicts).filter((v) => v === 'kill').length;
  $('tally').innerHTML = '<b style="color:var(--keep)">' + k + ' kept</b> · <b style="color:var(--kill)">' + x + ' killed</b>';
}
function mark(e, verd) {
  if (verdicts[e.name] === verd) delete verdicts[e.name]; else verdicts[e.name] = verd;
  save(); render();
}
async function copy(e, btn) {
  const ok = await rtCopy(codeFor(e));
  const t = btn.textContent; btn.textContent = ok ? '✓' : '✗'; setTimeout(() => { btn.textContent = t; }, 900);
}
const tw = $('tabs');
for (const t of ['progressions', 'figures', 'development', 'melody']) {
  const b = document.createElement('button');
  b.textContent = t; b.className = t === tab ? 'on' : '';
  b.onclick = () => { tab = t; sel = 0; [...tw.children].forEach((c) => c.className = c.textContent === tab ? 'on' : ''); controls(); render(); };
  tw.appendChild(b);
}
$('stop').onclick = stop;
$('export').onclick = async () => {
  const ok = await rtCopy(JSON.stringify({ verdicts }, null, 2));
  $('export').textContent = ok ? 'copied ✓' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.onkeydown = (ev) => {
  if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
  if (tab === 'melody') return;
  const cols = Math.max(1, Math.floor($('grid').clientWidth / 257));
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
  if (move) { sel = Math.max(0, Math.min(visible.length - 1, sel + move)); render(); document.querySelectorAll('.card')[sel]?.scrollIntoView({ block: 'nearest' }); ev.preventDefault(); return; }
  if (ev.key === ' ') { const e = visible[sel]; if (e) (playing === e.name ? stop() : play(e)); ev.preventDefault(); return; }
  if (ev.key === 'Escape') return stop();
  if (ev.key === 'k' && visible[sel]) return mark(visible[sel], 'keep');
  if (ev.key === 'x' && visible[sel]) return mark(visible[sel], 'kill');
};
controls(); render();
</script>
</body>
</html>`;
}
