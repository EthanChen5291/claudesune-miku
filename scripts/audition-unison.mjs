#!/usr/bin/env node
// Builds audition/unison.html — the ear-check pass over everything extracted from
// audios/ (D29). Deliberately a SEPARATE page from audition/progressions.html:
// these are a different corpus with different provenance, and mixing them would
// make it impossible to tell which pool a verdict was about.
//
// Three tabs, because three kinds of material came out of those packs:
//   progressions  72, click-to-play as piano comping. The ones where the filename's
//                 numerals disagree with the notes are flagged NEEDS EAR.
//   rhythms       12 drum-loop parts. Entries whose source has flat velocity are
//                 played from their ONSETS with no dynamics at all — the page never
//                 invents an accent profile the library does not have.
//   voicings      how these records actually voice each chord quality, against the
//                 library's current shape where one exists.
//
// As with the other page: every pattern is generated HERE by the real binder, and
// the browser only assembles strings.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { PROGRESSIONS_UNISON } from '../src/lib/progressions-unison.js';
import { RHYTHMS_UNISON, INTERLOCKS_UNISON } from '../src/lib/rhythms-unison.js';
import { VOICING_OBSERVATIONS } from '../src/lib/voicings-unison.js';
import { VOICINGS } from '../src/lib/voicings.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindComp, bind, normalizeRhythm } from '../src/binder/bind.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { midiToNoteName } from '../src/binder/theory.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const PIANO = 'github:felixroos/dough-samples/main/piano.json';
const FULL = process.argv.includes('--full');

// Auditioned in ireal, not a me_* shape: these packs use extended qualities
// (^9, 11, 13sus, 7b9, ^7#11) that the five library shapes have no offsets for,
// and the point of this pass is to hear the HARMONY, not a voicing workaround.
const TEXTURES = [
  { id: 'comp',  label: 'push comp', rhythm: 'pushed_comp_2bar', fx: '.room(0.25)' },
  { id: 'bossa', label: 'bossa',     rhythm: 'bossa_comp_2bar',  fx: '.room(0.3)' },
  { id: 'even',  label: 'even 8ths', rhythm: 'even_8ths',        fx: '.room(0.4)' },
];
const DRUM_SOUND = { kick: 'bd', snare: 'sd', clap: 'cp', 'rim shot': 'rim', perc: 'perc', hat: 'hh', hats: 'hh', 'hat 1': 'hh', 'hat 2': 'oh' };

// ---- progressions -------------------------------------------------------
const KEY_FOR = (fam) => (fam === 'minor' ? 'C:minor' : 'C:major');
const progressions = Object.entries(PROGRESSIONS_UNISON).map(([name, e]) => {
  const key = KEY_FOR(e.family);
  const symbols = renderProgression(e, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const exprs = {};
  for (const t of TEXTURES) {
    exprs[t.id] = bindComp(RHYTHMS[t.rhythm], ctx, '4/4', {
      dict: 'ireal', sound: 'piano', bounceSound: 'piano', fx: t.fx,
    }).expr;
  }
  const bass = bind(RHYTHMS.offbeat_8ths, CONTOURS.bass_root_five, ctx, '4/4', {
    octave: 2, sound: 'piano', fx: '.gain(0.7)',
  }).expr;
  return {
    name, pack: e.pack, family: e.family, song: e.song ?? null,
    numerals: e.numerals, symbols, moods: e.moods,
    length: parseDegrees(e.degrees).length,
    needsEar: !!e.needsEar, match: e.match, sourceKey: e.sourceKey, dirAgrees: e.dirAgrees,
    exprs, bass,
  };
});

// ---- rhythms ------------------------------------------------------------
function structFromOnsets(onsets, bars, grid) {
  const cells = Array.from({ length: bars }, () => Array(grid).fill('~'));
  for (const o of onsets) {
    const [n, d] = String(o).split('/').map(Number);
    const abs = Math.round((n / d) * grid);
    cells[Math.floor(abs / grid)][abs % grid] = 'x';
  }
  return bars === 1 ? cells[0].join(' ') : `<${cells.map((c) => `[${c.join(' ')}]`).join(' ')}>`;
}
const rhythms = Object.entries(RHYTHMS_UNISON).map(([name, r]) => {
  const sound = DRUM_SOUND[r.part.toLowerCase()] ?? 'rim';
  let expr, mode;
  if (r.accents) {
    expr = bind(r, null, null, r.meter_class, { sound }).expr;
    mode = 'accents from the source velocities';
  } else {
    // No dynamics exist in the source, so none are played. Inventing a profile to
    // make it "sound better" is the exact circularity A6.1 forbids (D29).
    expr = `s("${sound}").struct("${structFromOnsets(r.onsets, r.bars, r.grid)}")`;
    mode = 'onsets only — source has flat velocity, nothing invented';
  }
  return {
    name, part: r.part, loop: r.loop, bpm: r.bpm, bars: r.bars, grid: r.grid,
    onsets: r.onsets.length, triage: r.triage, needsAccents: !!r.needsAccents,
    microtiming: r.microtiming ?? null, mode, expr,
    partners: INTERLOCKS_UNISON.filter((i) => i.pair.includes(name)).map((i) => i.pair.find((x) => x !== name)),
  };
});
// each loop stacked whole — the co-designed pairs are only judgeable together
const loops = [...new Set(rhythms.map((r) => r.loop))].map((loop) => {
  const parts = rhythms.filter((r) => r.loop === loop);
  return {
    name: `loop_${loop.replace(/[^A-Za-z0-9]+/g, '_')}`, loop,
    bpm: parts[0].bpm, parts: parts.map((p) => p.part),
    expr: `stack(${parts.map((p) => p.expr).join(', ')})`,
  };
});

// ---- voicings -----------------------------------------------------------
const voicings = [];
for (const [quality, list] of Object.entries(VOICING_OBSERVATIONS)) {
  list.forEach((v, i) => {
    const notes = v.offsets.map((o) => midiToNoteName(48 + o, { flats: true }));
    const libShapes = Object.entries(VOICINGS).filter(([, s]) => quality in s.shapes);
    voicings.push({
      name: `voi_${quality || 'maj'}_${i}`.replace(/[^A-Za-z0-9_]/g, '_'),
      quality: quality || '(major triad)', offsets: v.offsets, seen: v.count, sources: v.sources,
      fillsGap: libShapes.length === 0,
      expr: `note("${notes.join(' ')}").s("piano").room(0.3)`,
      libraryExpr: libShapes.length
        ? `note("${String(libShapes[0][1].shapes[quality]).split(/\s+/).map((o) => midiToNoteName(48 + Number(o), { flats: true })).join(' ')}").s("piano").room(0.3)`
        : null,
      libraryShape: libShapes.length ? libShapes[0][0] : null,
    });
  });
}

// ---- verify every generated pattern actually evaluates -------------------
const all = [
  ...progressions.flatMap((p) => TEXTURES.map((t) => [`${p.name}/${t.id}`, `stack(${p.exprs[t.id]}, ${p.bass})`])),
  ...rhythms.map((r) => [r.name, r.expr]),
  ...loops.map((l) => [l.name, l.expr]),
  ...voicings.flatMap((v) => [[v.name, v.expr]].concat(v.libraryExpr ? [[v.name + '_lib', v.libraryExpr]] : [])),
];
const sample = FULL ? all : all.filter((_, i) => i % Math.ceil(all.length / 24) === 0);
let checked = 0;
for (const [id, expr] of sample) {
  const code = `setcpm(112/4)\np: ${expr}`;
  const ev = await evaluateSong(code);
  const h = hapsByLabel(ev, 0, 4).get('p');
  if (!h || h.error || !h.haps.length) throw new Error(`${id} produced no haps: ${h?.error ?? 'empty'}`);
  checked++;
}

const DATA = {
  progressions, rhythms, loops, voicings,
  textures: TEXTURES.map(({ id, label, rhythm }) => ({ id, label, rhythm })),
  packs: [...new Set(progressions.map((p) => p.pack))].sort(),
  piano: PIANO,
};

const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'unison.html'), html);

console.log(`wrote audition/unison.html`);
console.log(`  progressions ${progressions.length} (${progressions.filter((p) => p.needsEar).length} flagged NEEDS EAR)`);
console.log(`  rhythms      ${rhythms.length} parts + ${loops.length} whole loops (${rhythms.filter((r) => r.needsAccents).length} play onsets-only)`);
console.log(`  voicings     ${voicings.length} observed (${voicings.filter((v) => v.fillsGap).length} for qualities the library has no shape for)`);
console.log(`  ${checked}${FULL ? '' : ' sampled'} of ${all.length} patterns evaluated green${FULL ? '' : ' (--full checks all)'}; page script parses (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>unison packs — audition</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#d9822b; --keep:#37b24d; --kill:#e03131; --warn:#e8a33d; }
  * { box-sizing:border-box; }
  body { font:13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  select, input[type=search] { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:4px 8px; font:inherit; }
  input[type=range] { accent-color:var(--accent); width:100px; vertical-align:middle; }
  input[type=checkbox] { accent-color:var(--accent); }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#1a1208; font-weight:600; }
  .tabs button { padding:5px 14px; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 60px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(232px,1fr)); gap:9px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:9px 11px 8px; cursor:pointer; position:relative; }
  .card:hover { border-color:#4a4a5e; }
  .card.sel { border-color:var(--accent); }
  .card.playing { background:#2a2114; border-color:var(--accent); }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.5; }
  .num { font-family:ui-monospace, Menlo, monospace; font-size:12px; color:var(--dim); word-break:break-all; }
  .sym { font-weight:650; font-size:14px; margin:2px 0 4px; }
  .tags { font-size:11.5px; color:var(--dim); min-height:15px; }
  .flag { display:inline-block; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#1a1208; background:var(--warn); border-radius:3px; padding:0 5px; margin-right:5px; font-weight:700; }
  .badge { position:absolute; top:8px; right:10px; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#6b6b84; }
  .acts { display:flex; gap:5px; margin-top:7px; flex-wrap:wrap; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#252531; border:1px solid #3a3a4a; border-radius:4px; padding:0 5px; font:11.5px ui-monospace,monospace; }
  .note { background:#1b1b24; border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:0 8px 8px 0; padding:9px 13px; margin-bottom:12px; font-size:12.5px; color:#c9c9dc; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>unison packs — audition</h1>
    <div class="tabs" id="tabs"></div>
    <span class="dim" id="count"></span>
    <span class="now" id="now">— click a card to play —</span>
    <button id="stop">■ stop</button>
  </div>
  <div class="row" style="margin-top:7px" id="controls"></div>
</header>
<main>
  <div class="note" id="blurb"></div>
  <div class="grid" id="grid"></div>
</main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <span class="dim"><kbd>&larr;&rarr;&uarr;&darr;</kbd> move <kbd>space</kbd> play <kbd>k</kbd> keep <kbd>x</kbd> kill <kbd>a</kbd> A/B lib <kbd>esc</kbd> stop</span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:unison-verdicts';
let verdicts = {}; try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let tab = 'progressions', texture = 'comp', playing = null, sel = 0, started = false, visible = [];
const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(LS, JSON.stringify(verdicts));

const BLURB = {
  progressions: 'Numerals came from the filenames; every chord was checked against the notes in the MIDI. NEEDS EAR marks the ones where the two disagree — those are the entries whose labels I could not confirm. Voiced with the full ireal dictionary because these packs use extensions the library has no shapes for.',
  rhythms: 'Drum-loop parts. Cards marked ONSETS ONLY come from files with flat velocity: you are hearing the pattern with no dynamics, because the source has none and nothing was invented to fill it in. Play a whole loop to judge the parts together — they are co-designed.',
  voicings: 'How these records actually voice each quality, rooted at C3. GAP means the library has no shape for that quality at all. Where it does, press a to A/B the library shape against the record.',
};

function codeFor(e) {
  const bpm = $('bpm') ? $('bpm').value : 112;
  let body;
  if (tab === 'progressions') body = ($('bass') && $('bass').checked) ? 'stack(' + e.exprs[texture] + ', ' + e.bass + ')' : e.exprs[texture];
  else body = e.expr;
  return 'setcpm(' + bpm + '/4)\\np: ' + body;
}
async function play(e, useLib) {
  if (!started) { await window.initStrudel(); await strudel.samples(DATA.piano); started = true; }
  const code = useLib && e.libraryExpr ? 'setcpm(112/4)\\np: ' + e.libraryExpr : codeFor(e);
  await strudel.evaluate(code);
  playing = e.name;
  $('now').textContent = '▶ ' + (useLib ? '[library shape] ' : '') + labelOf(e);
  render();
}
function stop() { if (started) strudel.hush(); playing = null; $('now').textContent = '— stopped —'; render(); }
function labelOf(e) {
  if (tab === 'progressions') return (e.song ? e.song + '  —  ' : '') + e.numerals + '   ' + e.symbols.join(' ');
  if (tab === 'rhythms') return e.loop ? (e.part ? e.loop + ' · ' + e.part : e.loop + ' (whole loop)') : e.name;
  return e.quality + '  [' + e.offsets.join(' ') + ']';
}

function items() {
  if (tab === 'progressions') return DATA.progressions;
  if (tab === 'rhythms') return DATA.loops.concat(DATA.rhythms);
  return DATA.voicings;
}
function matches(e) {
  const q = ($('q') ? $('q').value : '').trim().toLowerCase();
  if (q && !JSON.stringify([labelOf(e), e.moods || '', e.pack || '']).toLowerCase().includes(q)) return false;
  if (tab === 'progressions') {
    if ($('pack').value && e.pack !== $('pack').value) return false;
    if ($('fam').value && e.family !== $('fam').value) return false;
    if ($('ear').checked && !e.needsEar) return false;
  }
  if (tab === 'voicings' && $('gap') && $('gap').checked && !e.fillsGap) return false;
  return true;
}

function controls() {
  const c = $('controls');
  if (tab === 'progressions') {
    c.innerHTML = '<label class="ctl">texture <span id="tex"></span></label>' +
      '<label class="ctl"><input type="checkbox" id="bass" checked> bass</label>' +
      '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="170" value="112"><span id="bpmv">112</span></label>' +
      '<label class="ctl">pack <select id="pack"><option value="">all</option>' + DATA.packs.map((p) => '<option>' + p + '</option>').join('') + '</select></label>' +
      '<label class="ctl">mode <select id="fam"><option value="">all</option><option>major</option><option>minor</option></select></label>' +
      '<label class="ctl"><input type="checkbox" id="ear"> only NEEDS EAR</label>' +
      '<input type="search" id="q" placeholder="search song / numerals">';
    const tw = $('tex');
    DATA.textures.forEach((t) => {
      const b = document.createElement('button');
      b.textContent = t.label; b.title = t.rhythm; b.className = t.id === texture ? 'on' : '';
      b.onclick = () => { texture = t.id; controls(); render(); if (playing) { const e = DATA.progressions.find((x) => x.name === playing); if (e) play(e); } };
      tw.appendChild(b);
    });
    $('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  } else if (tab === 'rhythms') {
    c.innerHTML = '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="170" value="106"><span id="bpmv">106</span></label>' +
      '<input type="search" id="q" placeholder="search loop / part">';
    $('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  } else {
    c.innerHTML = '<label class="ctl"><input type="checkbox" id="gap" checked> only qualities the library lacks</label>' +
      '<input type="search" id="q" placeholder="search quality">';
  }
  for (const id of ['pack', 'fam', 'ear', 'gap', 'q', 'bass']) if ($(id)) $(id).oninput = render;
  $('blurb').textContent = BLURB[tab];
}

function render() {
  visible = items().filter(matches);
  if (sel >= visible.length) sel = Math.max(0, visible.length - 1);
  const grid = $('grid'); grid.innerHTML = '';
  visible.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (i === sel ? ' sel' : '') + (playing === e.name ? ' playing' : '') + (verdicts[e.name] ? ' ' + verdicts[e.name] : '');
    let head = '', body = '', tags = '', badge = '';
    if (tab === 'progressions') {
      badge = e.pack.replace('unison-', '');
      head = e.needsEar ? '<span class="flag">needs ear</span>' : '';
      body = '<div class="num">' + e.numerals + '</div><div class="sym">' + e.symbols.join(' ') + '</div>';
      tags = (e.song ? e.song + ' · ' : '') + (e.moods.join(' · ') || e.family) + ' · ' + e.length + ' chords';
      card.title = e.name + '\\nlabel vs notes: ' + JSON.stringify(e.match) + '\\nsource key solved as ' + e.sourceKey + (e.dirAgrees ? '' : ' (pack filed it under a different key)');
    } else if (tab === 'rhythms') {
      const whole = !e.part;
      badge = whole ? 'loop' : e.triage;
      head = e.needsAccents ? '<span class="flag">onsets only</span>' : '';
      body = '<div class="sym">' + (whole ? e.loop : e.part) + '</div><div class="num">' + (whole ? e.parts.join(' + ') : e.bars + ' bar · 1/' + e.grid + ' · ' + e.onsets + ' onsets') + '</div>';
      tags = whole ? 'whole loop · ' + e.bpm + ' bpm' : (e.mode + (e.microtiming ? ' · microtiming' : ''));
      card.title = e.name + (e.partners ? '\\nco-designed with: ' + e.partners.join(', ') : '');
    } else {
      badge = e.fillsGap ? 'gap' : e.libraryShape;
      head = e.fillsGap ? '<span class="flag">no library shape</span>' : '';
      body = '<div class="sym">' + e.quality + '</div><div class="num">offsets [' + e.offsets.join(' ') + ']</div>';
      tags = 'seen ' + e.seen + '× · ' + e.sources.map((s) => s.replace(/\\.mid$/, '').slice(0, 26)).join(', ');
    }
    card.innerHTML = '<div class="badge">' + badge + '</div>' + head + body + '<div class="tags">' + tags + '</div>';
    const acts = document.createElement('div'); acts.className = 'acts';
    for (const [cls, verd] of [['k', 'keep'], ['x', 'kill']]) {
      const b = document.createElement('button');
      b.className = cls + (verdicts[e.name] === verd ? ' on' : ''); b.textContent = verd;
      b.onclick = (ev) => { ev.stopPropagation(); mark(e, verd); };
      acts.appendChild(b);
    }
    if (e.libraryExpr) {
      const b = document.createElement('button'); b.textContent = 'A/B library';
      b.onclick = (ev) => { ev.stopPropagation(); play(e, true); };
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
async function toClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
}
async function copy(e, btn) {
  const ok = await toClipboard(codeFor(e));
  const t = btn.textContent; btn.textContent = ok ? '✓' : '✗'; setTimeout(() => { btn.textContent = t; }, 900);
}
const tw = $('tabs');
for (const t of ['progressions', 'rhythms', 'voicings']) {
  const b = document.createElement('button');
  b.textContent = t; b.className = t === tab ? 'on' : '';
  b.onclick = () => { tab = t; sel = 0; [...tw.children].forEach((c) => c.className = c.textContent === tab ? 'on' : ''); controls(); render(); };
  tw.appendChild(b);
}
$('stop').onclick = stop;
$('export').onclick = async () => {
  const ok = await toClipboard(JSON.stringify({ verdicts }, null, 2));
  $('export').textContent = ok ? 'copied ✓' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.onkeydown = (ev) => {
  if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
  const cols = Math.max(1, Math.floor($('grid').clientWidth / 241));
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
  if (move) { sel = Math.max(0, Math.min(visible.length - 1, sel + move)); render(); document.querySelectorAll('.card')[sel]?.scrollIntoView({ block: 'nearest' }); ev.preventDefault(); return; }
  if (ev.key === ' ') { const e = visible[sel]; if (e) (playing === e.name ? stop() : play(e)); ev.preventDefault(); return; }
  if (ev.key === 'Escape') return stop();
  if (ev.key === 'k' && visible[sel]) return mark(visible[sel], 'keep');
  if (ev.key === 'x' && visible[sel]) return mark(visible[sel], 'kill');
  if (ev.key === 'a' && visible[sel]?.libraryExpr) return play(visible[sel], true);
};
controls(); render();
</script>
</body>
</html>`;
}
