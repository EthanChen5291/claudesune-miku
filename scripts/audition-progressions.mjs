#!/usr/bin/env node
// Builds audition/progressions.html — a CLICK-TO-PLAY grid for the 188 imported
// progressions (D28). The existing scripts/audition.mjs lays entries out left to
// right in one timeline, which is right for a dozen rhythms and unusable for 188
// progressions (~25 minutes of forced linear listening). Here every entry is a
// card: click it and the pattern HOT-SWAPS under a running transport, so you can
// A/B two progressions in tempo instead of scrubbing.
//
// Nothing musical is invented in the browser. Every chord expression on the page
// is produced HERE by the real bindComp()/bind() against the real library, so what
// you hear is what the engine emits. The page only assembles strings.
//
// Run: node scripts/audition-progressions.mjs   (then open audition/progressions.html)

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROGRESSIONS, ALL_PROGRESSIONS, parseDegrees, progressionQualities } from '../src/lib/progressions.js';
import { generateProgression, explainProgression } from '../src/lib/harmony-gen.js';
import { exemplarPool, variationsOf, explainVariation } from '../src/lib/harmony-vary.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindComp, bind } from '../src/binder/bind.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS, voicingRegistration } from '../src/lib/voicings.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js'; // UMD: works over file://

// Three textures, so an entry is judged as music rather than as block chords
// (A6.5: "each bound against 2-3 harmonic contexts"). Rhythm + voicing shape are
// library entries; nothing here is a new musical decision.
// Everything pitched plays PIANO (Ethan, 2026-08-20): a real multisampled piano
// judges harmony far better than a square wave, which colours every progression
// with its own character. Drums stay drums. The samples come from strudel's own
// piano set, registered at page load.
const TEXTURES = [
  { id: 'comp',  label: 'push comp',  rhythm: 'pushed_comp_2bar', dict: 'shell_37',     sound: 'piano', fx: '.room(0.25)' },
  { id: 'bossa', label: 'bossa',      rhythm: 'bossa_comp_2bar',  dict: 'drop2',        sound: 'piano', fx: '.room(0.3)' },
  { id: 'pad',   label: 'wide pad',   rhythm: 'even_8ths',        dict: 'spread_tenth', sound: 'piano', fx: '.room(0.45)' },
];
const BASS = { rhythm: 'offbeat_8ths', contour: 'bass_root_five', octave: 2, sound: 'piano', fx: '.gain(0.7)' };

const SAMPLE_NAMES = new Set(JSON.parse(readFileSync(join(ROOT, 'src/ingest/sample-names.json'), 'utf8')).names);
for (const t of TEXTURES) {
  if (!RHYTHMS[t.rhythm]) throw new Error(`texture "${t.id}" names unknown rhythm "${t.rhythm}"`);
  if (!VOICINGS[t.dict]) throw new Error(`texture "${t.id}" names unknown voicing "${t.dict}"`);
  // a sound name absent from every loaded map plays silence, not an error
  if (!SAMPLE_NAMES.has(t.sound)) throw new Error(`sound "${t.sound}" is not in any loaded sample map`);
}
if (!SAMPLE_NAMES.has(BASS.sound)) throw new Error(`bass sound "${BASS.sound}" is not in any loaded sample map`);

const keyFor = (family) => (family === 'minor' ? 'C:minor' : 'C:major');

// D49: composed progressions sit on the SAME page as the imported ones, playing
// through the same three textures, so the judgment on offer is "does this belong
// next to the corpus" rather than "does this sound like anything". The `source`
// filter is how you A/B them. Every voicing dictionary here covers the same 10
// qualities, so generating against one makes a card playable in all three.
const GEN_SHAPE = 'shell_37';
const generated = [];
for (const family of ['major', 'minor', 'modal']) {
  for (const length of [4, 8]) {
    for (const style of [null, 'undertale', 'unison', 'ldrolez']) {
      for (const colour of [0.2, 0.6]) {
        for (const seed of ['a', 'b']) {
          const e = generateProgression({ family, length, style, colour, shape: GEN_SHAPE, seed });
          const tag = `${family[0]}${length}${style ? style[0] : '-'}${colour === 0.2 ? 'p' : 'c'}${seed}`;
          generated.push([`gen_${tag}`, e]);
        }
      }
    }
  }
}

// D50: the exemplar arm. Every foundation is followed IMMEDIATELY by its own
// variations, so the page reads as "here is the thing that works, here is what
// it became" rather than as two unrelated piles. The `source` filter separates
// `foundation` from `varied`, but the default ordering is the comparison.
const EXEMPLARS = exemplarPool();
const varied = [];
for (const [name, e] of EXEMPLARS.entries) {
  varied.push([name, e, 'foundation']);
  for (const [i, intensity] of [0.2, 0.5, 0.85].entries()) {
    for (const v of variationsOf(name, { count: 1, intensity, budget: intensity > 0.6 ? 3 : 2, seed: `p${i}` })) {
      varied.push([`${name}__v${i}`, v, 'varied']);
    }
  }
}

const entries = [];
// D57: the video pack rides on this page too — Ethan asked to hear transcribed
// progressions "in different tones", and this is the page with the textures.
const VIDEO_ENTRIES = Object.entries(ALL_PROGRESSIONS).filter(([, e]) => e.pack === 'igvideo');
for (const [name, e, arm] of [
  ...Object.entries(PROGRESSIONS).map(([n, x]) => [n, x, null]),
  ...VIDEO_ENTRIES.map(([n, x]) => [n, x, 'video']),
  ...generated.map(([n, x]) => [n, x, null]),
  ...varied,
]) {
  const key = keyFor(e.family);
  const symbols = renderProgression(e, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const exprs = {};
  const missing = {};
  for (const t of TEXTURES) {
    // A texture can only voice an entry whose qualities it has shapes for; the
    // rest are greyed out and say WHICH quality is missing, rather than silently
    // playing nothing the way .voicing() would (D28).
    const gaps = [...progressionQualities(e)].filter((q) => !(q in VOICINGS[t.dict].shapes));
    missing[t.id] = gaps;
    exprs[t.id] = gaps.length ? null : bindComp(RHYTHMS[t.rhythm], ctx, '4/4', {
      dict: t.dict, sound: t.sound, bounceSound: t.sound, fx: t.fx,
    }).expr;
  }
  const bass = bind(RHYTHMS[BASS.rhythm], CONTOURS[BASS.contour], ctx, '4/4', {
    octave: BASS.octave, sound: BASS.sound, fx: BASS.fx,
  }).expr;
  entries.push({
    name, family: e.family, numerals: e.numerals, moods: e.moods,
    symbols, length: parseDegrees(e.degrees).length,
    qualities: [...progressionQualities(e)].sort(),
    exprs, missing, bass,
    song: e.song ?? null,
    source: arm ?? (e.provenance === 'generated' ? 'generated' : 'imported'),
    // D50: what this came from and what each substitution guaranteed
    vary: e.lineage
      ? {
        exemplar: e.lineage.exemplarSong ?? e.lineage.exemplar,
        from: e.lineage.exemplarDegrees,
        ops: e.lineage.ops.map((o) => o.op),
        why: explainVariation(e),
      }
      : null,
    // What the generator was asked for and how it answered, so a card that
    // sounds wrong can be traced to the slot that made it wrong.
    gen: e.provenance === 'generated'
      ? {
        brief: `${e.request.family} · ${e.request.length} chords · style ${e.request.style ?? 'none'} · colour ${e.request.colour}`,
        novel: e.novel,
        matches: e.matches.slice(0, 3),
        why: explainProgression(e),
      }
      : null,
  });
}

// Self-check: the generated code must actually evaluate under the SAME transpiler
// the REPL uses, or the page would fail silently in the browser. Sample across
// families and textures rather than all 564 (that would take minutes).
const preamble = [...new Set(TEXTURES.map((t) => t.dict))].map(voicingRegistration).join('\n');
const sample = [];
for (const fam of ['major', 'minor', 'modal']) {
  for (const src of ['imported', 'generated', 'foundation', 'varied']) {
    const of = entries.filter((e) => e.family === fam && e.source === src);
    for (const t of TEXTURES) {
      const e = of.find((x) => x.exprs[t.id]);
      if (e) sample.push([e, t.id]);
    }
    if (of.length) sample.push([of.at(-1), TEXTURES[0].id]);
  }
}
const FULL = process.argv.includes('--full');
const toCheck = FULL
  ? entries.flatMap((e) => TEXTURES.filter((t) => e.exprs[t.id]).map((t) => [e, t.id]))
  : sample;
let checked = 0;
for (const [e, tid] of toCheck) {
  if (!e?.exprs[tid]) continue;
  const code = `setcpm(120/4)\n${preamble}\np: stack(${e.exprs[tid]}, ${e.bass}).transpose(0)`;
  const ev = await evaluateSong(code);
  const haps = hapsByLabel(ev, 0, 4).get('p');
  if (!haps || haps.error || !haps.haps.length) {
    throw new Error(`generated code for ${e.name}/${tid} produced no haps: ${haps?.error ?? 'empty'}`);
  }
  checked++;
}

const DATA = {
  entries,
  textures: TEXTURES.map(({ id, label, rhythm, dict }) => ({ id, label, rhythm, dict })),
  preamble,
  moods: [...new Set(entries.flatMap((e) => e.moods))].sort(),
  lengths: [...new Set(entries.map((e) => e.length))].sort((a, b) => a - b),
  bassLabel: `${BASS.rhythm} × ${BASS.contour}`,
};

const html = page(DATA);
// The inline <script> is the one part of this that Node never executes, so parse
// it here: a syntax error would otherwise surface as a silently blank page.
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'progressions.html'), html);
console.log(`wrote audition/progressions.html — ${entries.length} entries × ${TEXTURES.length} textures`);
console.log(`  ${checked}${FULL ? '' : ' sampled'} patterns evaluated green through the engine's own transpiler${FULL ? ' (ALL of them)' : ' (--full checks all)'}`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
for (const t of TEXTURES) {
  const n = entries.filter((e) => e.exprs[t.id]).length;
  console.log(`  ${t.label.padEnd(10)} (${t.rhythm} × me_${t.dict}): ${n}/${entries.length} voiceable`);
}

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>progressions — audition</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  select, input[type=search] { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:4px 8px; font:inherit; }
  input[type=range] { accent-color:var(--accent); width:110px; vertical-align:middle; }
  input[type=checkbox] { accent-color:var(--accent); }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  #stop { border-color:#5a3a3a; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 60px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(215px,1fr)); gap:9px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:9px 11px 8px; cursor:pointer; position:relative; transition:border-color .1s, background .1s; }
  .card:hover { border-color:#4a4a5e; }
  .card.sel { border-color:var(--accent); }
  .card.playing { background:#1e2438; border-color:var(--accent); }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.5; }
  .card.unvoiceable { opacity:.4; cursor:not-allowed; }
  .num { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12.5px; color:var(--dim); }
  .sym { font-weight:650; font-size:14.5px; margin:2px 0 4px; letter-spacing:.02em; }
  .tags { font-size:11.5px; color:var(--dim); min-height:16px; }
  .fam { position:absolute; top:8px; right:10px; font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#6b6b84; }
  .acts { display:flex; gap:5px; margin-top:7px; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#252531; border:1px solid #3a3a4a; border-radius:4px; padding:0 5px; font:11.5px ui-monospace,monospace; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>progressions — audition</h1>
    <span class="dim" id="count"></span>
    <span class="now" id="now">— click a card to play —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">click any card to start audio</span>
  </div>
  <div class="row" style="margin-top:7px">
    <label class="ctl">texture <span id="tex"></span></label>
    <label class="ctl"><input type="checkbox" id="bass" checked> bass <span class="dim" id="bassLabel"></span></label>
    <label class="ctl">bpm <input type="range" id="bpm" min="60" max="170" value="112"><span id="bpmv">112</span></label>
    <label class="ctl">transpose <input type="range" id="tr" min="-6" max="6" value="0"><span id="trv">0</span></label>
  </div>
  <div class="row" style="margin-top:7px">
    <label class="ctl">source <select id="fSrc"><option value="">all</option><option value="imported">imported</option><option value="generated">composed (D49)</option><option value="foundation">foundations (D50)</option><option value="varied">variations (D50)</option><option value="video">from the videos (D57)</option></select></label>
    <label class="ctl">family <select id="fFam"><option value="">all</option><option>major</option><option>minor</option><option>modal</option></select></label>
    <label class="ctl">mood <select id="fMood"><option value="">all</option></select></label>
    <label class="ctl">chords <select id="fLen"><option value="">all</option></select></label>
    <label class="ctl">verdict <select id="fVerd"><option value="">all</option><option value="none">unjudged</option><option value="keep">kept</option><option value="kill">killed</option></select></label>
    <label class="ctl"><input type="checkbox" id="fVoice" checked> only voiceable by this texture</label>
    <input type="search" id="fText" placeholder="search numerals / chords">
  </div>
</header>
<main><div class="grid" id="grid"></div></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <span class="dim"><kbd>&larr;&rarr;&uarr;&darr;</kbd> move <kbd>space</kbd> play <kbd>k</kbd> keep <kbd>x</kbd> kill <kbd>c</kbd> copy code <kbd>esc</kbd> stop</span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:progression-verdicts';
let verdicts = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let texture = DATA.textures[0].id, playing = null, sel = 0, visible = [];

const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(LS, JSON.stringify(verdicts));

function codeFor(e) {
  const expr = e.exprs[texture];
  if (!expr) return null;
  const layers = ($('bass') && $('bass').checked) ? expr + ', ' + e.bass : expr;
  const tr = Number($('tr') && $('tr').value) || 0;
  // Never interpolate a missing/blank control into the source: 'setcpm(' + '' +
  // '/4)' is a syntax error, and a pattern that fails to parse is indistinguishable
  // from a dead page.
  const bpm = Number($('bpm') && $('bpm').value) || 112;
  return 'setcpm(' + bpm + '/4)\\n' + DATA.preamble +
    '\\np: stack(' + layers + ')' + (tr ? '.transpose(' + tr + ')' : '');
}

async function play(e) {
  const code = codeFor(e);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio (first play loads the piano)…';
  // rtPlay() hot-swaps under the running transport — the whole point of the grid:
  // two progressions compared in tempo, not by scrubbing. It also reports WHY
  // nothing happened when nothing happens.
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = e.name;
  $('now').textContent = '▶ ' + e.numerals + '   —   ' + e.symbols.join(' ');
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '— stopped —'; render(); }

function matches(e) {
  if ($('fSrc').value && e.source !== $('fSrc').value) return false;
  if ($('fFam').value && e.family !== $('fFam').value) return false;
  if ($('fMood').value && !e.moods.includes($('fMood').value)) return false;
  if ($('fLen').value && String(e.length) !== $('fLen').value) return false;
  if ($('fVoice').checked && !e.exprs[texture]) return false;
  const v = $('fVerd').value;
  if (v === 'none' && verdicts[e.name]) return false;
  if ((v === 'keep' || v === 'kill') && verdicts[e.name] !== v) return false;
  const q = $('fText').value.trim().toLowerCase();
  if (q && !(e.numerals + ' ' + e.symbols.join(' ') + ' ' + e.moods.join(' ')).toLowerCase().includes(q)) return false;
  return true;
}

function render() {
  visible = DATA.entries.filter(matches);
  if (sel >= visible.length) sel = Math.max(0, visible.length - 1);
  const grid = $('grid');
  grid.innerHTML = '';
  visible.forEach((e, i) => {
    const voiceable = !!e.exprs[texture];
    const card = document.createElement('div');
    card.className = 'card' + (i === sel ? ' sel' : '') + (playing === e.name ? ' playing' : '') +
      (verdicts[e.name] ? ' ' + verdicts[e.name] : '') + (voiceable ? '' : ' unvoiceable');
    let tip = voiceable ? e.name
      : e.name + ' — this texture has no voicing shape for: ' + e.missing[texture].join(', ') +
        '. Try another texture, or add the quality to src/lib/voicings.js (ear-gated, D28).';
    if (e.vary) {
      tip += '\\n\\nVARIED FROM A FOUNDATION (D50)\\n' + e.vary.why.join('\\n');
    }
    if (e.gen) {
      tip += '\\n\\nCOMPOSED (D49)\\n  brief: ' + e.gen.brief
        + '\\n  ' + (e.gen.novel ? 'this root cycle is not in the corpus'
          : 'same root cycle as: ' + e.gen.matches.join(', '))
        + '\\n\\n' + e.gen.why.join('\\n');
    }
    card.title = tip;
    card.innerHTML =
      '<div class="fam">' + e.family +
        (e.source === 'generated' ? ' · composed'
          : e.source === 'foundation' ? ' · FOUNDATION'
            : e.source === 'varied' ? ' · varied' : '') + '</div>' +
      '<div class="num">' + e.numerals + '</div>' +
      '<div class="sym">' + e.symbols.join(' ') + '</div>' +
      '<div class="tags">' + (e.vary ? '↳ ' + e.vary.ops.join(' + ')
        : e.gen ? e.gen.brief
          : (e.song ? e.song + ' · ' : '') + e.moods.join(' · ')) + '</div>';
    const acts = document.createElement('div');
    acts.className = 'acts';
    for (const [cls, verd, txt] of [['k', 'keep', 'keep'], ['x', 'kill', 'kill']]) {
      const b = document.createElement('button');
      b.className = cls + (verdicts[e.name] === verd ? ' on' : '');
      b.textContent = txt;
      b.onclick = (ev) => { ev.stopPropagation(); mark(e, verd); };
      acts.appendChild(b);
    }
    const cp = document.createElement('button');
    cp.textContent = 'copy';
    cp.onclick = (ev) => { ev.stopPropagation(); copy(e, cp); };
    acts.appendChild(cp);
    card.appendChild(acts);
    if (voiceable) card.onclick = () => { sel = i; play(e); };
    grid.appendChild(card);
  });
  $('count').textContent = visible.length + ' of ' + DATA.entries.length + ' shown';
  const k = Object.values(verdicts).filter((v) => v === 'keep').length;
  const x = Object.values(verdicts).filter((v) => v === 'kill').length;
  $('tally').innerHTML = '<b style="color:var(--keep)">' + k + ' kept</b> · <b style="color:var(--kill)">' + x +
    ' killed</b> · ' + (DATA.entries.length - k - x) + ' unjudged';
}

function mark(e, verd) {
  verdicts[e.name] = verdicts[e.name] === verd ? undefined : verd;
  if (!verdicts[e.name]) delete verdicts[e.name];
  save(); render();
}
const toClipboard = rtCopy;
async function copy(e, btn) {
  const ok = await toClipboard(codeFor(e) ?? e.symbols.join(' '));
  const t = btn.textContent; btn.textContent = ok ? '✓' : '✗';
  setTimeout(() => { btn.textContent = t; }, 900);
}

const texWrap = $('tex');
DATA.textures.forEach((t) => {
  const b = document.createElement('button');
  b.textContent = t.label;
  b.title = t.rhythm + ' × me_' + t.dict;
  b.className = t.id === texture ? 'on' : '';
  b.onclick = () => { texture = t.id; [...texWrap.children].forEach((c, i) => c.className = DATA.textures[i].id === texture ? 'on' : ''); render(); if (playing) { const e = DATA.entries.find((x) => x.name === playing); if (e) play(e); } };
  texWrap.appendChild(b);
});
DATA.moods.forEach((m) => $('fMood').add(new Option(m, m)));
DATA.lengths.forEach((n) => $('fLen').add(new Option(n + ' chords', n)));
$('bassLabel').textContent = '(' + DATA.bassLabel + ')';
for (const id of ['fSrc', 'fFam', 'fMood', 'fLen', 'fVerd', 'fVoice', 'fText']) $(id).oninput = render;
$('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; if (playing) play(DATA.entries.find((e) => e.name === playing)); };
$('tr').oninput = () => { $('trv').textContent = $('tr').value; if (playing) play(DATA.entries.find((e) => e.name === playing)); };
$('bass').onchange = () => { if (playing) play(DATA.entries.find((e) => e.name === playing)); };
$('stop').onclick = stop;
$('export').onclick = async () => {
  const out = { generated: new Date().toISOString(), texture, verdicts };
  const ok = await toClipboard(JSON.stringify(out, null, 2));
  $('export').textContent = ok ? 'copied ✓' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.onkeydown = (ev) => {
  if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
  const cols = Math.max(1, Math.floor($('grid').clientWidth / 224));
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
  if (move) { sel = Math.max(0, Math.min(visible.length - 1, sel + move)); render(); document.querySelectorAll('.card')[sel]?.scrollIntoView({ block: 'nearest' }); ev.preventDefault(); return; }
  if (ev.key === ' ') { const e = visible[sel]; if (e) (playing === e.name ? stop() : play(e)); ev.preventDefault(); return; }
  if (ev.key === 'Escape') return stop();
  if (ev.key === 'k' && visible[sel]) return mark(visible[sel], 'keep');
  if (ev.key === 'x' && visible[sel]) return mark(visible[sel], 'kill');
  if (ev.key === 'c' && visible[sel]) return copy(visible[sel], { textContent: '' });
};
render();
</script>
</body>
</html>`;
}
