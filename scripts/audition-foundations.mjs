// audition/foundations.html — the ear pass for the D61 foundational canon.
//
// Ethan (2026-08-25): "for all the foundation patterns, show me 5 example
// chord progressions where i can hear all the tones (buttons to click for
// each tone)". Five CLICK-KEPT progressions (so the harmonic context is
// already ratified taste, and what is on trial is the PATTERN), each carrying
// a button per fnd_ figuration, grouped by tradition. Verdicts are per
// PATTERN, not per progression — the same pattern is heard across all five
// contexts before it earns a keep. Export lands as FIGURE_VERDICTS via
// scripts/import-verdicts.mjs and overlays figurations-foundation.js.
//
// Everything renders in C (keyFor) like progressions.html — comparability.
// Each pattern plays at ITS OWN meter (a waltz card renders 3/4 bars); the
// client scales cpm so the felt pulse stays put across meters.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { VERDICTS } from '../src/lib/verdicts.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure } from '../src/binder/bind.js';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const keyFor = (family) => (family === 'minor' ? 'C:minor' : 'C:major');

// ---- the five example progressions: click-kept, spanning family and length.
const clickKept = Object.entries(VERDICTS)
  .filter(([n, v]) => v.verdict === 'keep' && !String(v.page ?? '').endsWith('-implied') && ALL_PROGRESSIONS[n])
  .map(([n]) => n).sort();
if (clickKept.length < 5) throw new Error(`only ${clickKept.length} click-kept progressions — the page wants 5`);
const lenOf = (n) => parseDegrees(ALL_PROGRESSIONS[n].degrees).length;
const famOf = (n) => ALL_PROGRESSIONS[n].family;
const picked = [];
const take = (pred) => {
  const c = clickKept.find((n) => !picked.includes(n) && pred(n));
  if (c) picked.push(c);
};
take((n) => famOf(n) === 'major' && lenOf(n) === 4);
take((n) => famOf(n) === 'minor' && lenOf(n) === 4);
take((n) => famOf(n) === 'modal');
take((n) => lenOf(n) >= 6);
take((n) => n.startsWith('ut_'));
while (picked.length < 5) take(() => true);

// same whole-bar 4/4 fitting as progressions.html (D60)
function barPlan(n) {
  const B = (n % 4 === 0 || n === 2) ? n : Math.ceil(n / 4) * 4;
  if (B === n) return null;
  const base = Math.floor(B / n), rem = B % n;
  return Array.from({ length: n }, (_, i) => (i < rem ? base + 1 : base));
}

const STYLE_ORDER = ['classical', 'jazz', 'latin', 'pop', 'folk', 'gospel', 'game'];
const PATTERNS = Object.entries(FIGURATIONS_FOUNDATION)
  .sort(([, a], [, b]) => STYLE_ORDER.indexOf(a.style) - STYLE_ORDER.indexOf(b.style));

const progs = [];
for (const name of picked) {
  const e = ALL_PROGRESSIONS[name];
  const key = keyFor(e.family);
  const symbols = renderProgression(e, key);
  const plan = barPlan(symbols.length);
  const barSyms = plan ? symbols.flatMap((sym, i) => Array(plan[i]).fill(sym)) : symbols;
  const ctx = { harmony: barSyms, barsPerChord: 1, key };
  const exprs = {};
  for (const [fn, fig] of PATTERNS) {
    exprs[fn] = bindFigure(fig, ctx, fig.meter_class, {
      sound: 'piano', fx: '.room(0.3)', rhythmName: fn,
    }).expr;
  }
  progs.push({
    name, family: e.family, numerals: e.numerals, symbols,
    bars: barSyms.length, song: e.song ?? null, exprs,
  });
}

// Every (progression, pattern) pair must evaluate under the REPL's own
// transpiler — 145 exprs, all checked, every build.
let checked = 0;
for (const p of progs) {
  for (const [fn] of PATTERNS) {
    const code = `setcpm(112/4)\np: stack(${p.exprs[fn]})`;
    const ev = await evaluateSong(code);
    const haps = hapsByLabel(ev, 0, 4).get('p');
    if (!haps || haps.error || !haps.haps.length) {
      throw new Error(`${p.name} × ${fn} produced no haps: ${haps?.error ?? 'empty'}`);
    }
    checked++;
  }
}

const DATA = {
  progs,
  patterns: PATTERNS.map(([n, f]) => ({
    name: n, short: n.replace(/^fnd_/, ''), style: f.style, class: f.class,
    meter: f.meter_class, grid: f.grid, octave: f.octave,
    proposal: f.proposal, tags: f.tags, sig: f.figure.join(' '),
  })),
  styles: STYLE_ORDER,
};

const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'foundations.html'), html);
console.log(`wrote audition/foundations.html — ${progs.length} progressions × ${PATTERNS.length} foundation patterns`);
console.log(`  contexts: ${progs.map((p) => `${p.name} (${p.family}, ${p.bars} bars)`).join(' · ')}`);
console.log(`  ${checked}/${progs.length * PATTERNS.length} patterns evaluated green through the engine's own transpiler`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>foundations — audition</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  input[type=range] { accent-color:var(--accent); width:110px; vertical-align:middle; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 120px; max-width:1200px; margin:0 auto; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:11px 13px 10px; margin-bottom:12px; }
  .card.playing { border-color:var(--accent); background:#1e2438; }
  .sym { font-weight:650; font-size:14.5px; margin:2px 0 6px; letter-spacing:.02em; }
  .stylegrp { margin-top:6px; }
  .stylegrp .lbl { font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:#6b6b84; margin:4px 0 2px; }
  .chips { display:flex; flex-wrap:wrap; gap:4px; }
  .chips .tone { padding:2px 8px; font-size:11px; opacity:.88; }
  .chips .tone.on { background:var(--accent); border-color:var(--accent); color:#fff; opacity:1; }
  h2 { font-size:14px; margin:20px 0 8px; }
  .vgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:8px; }
  .vrow { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:8px 10px; }
  .vrow.keep { border-left:3px solid var(--keep); }
  .vrow.kill { border-left:3px solid var(--kill); opacity:.6; }
  .vrow .nm { font-weight:600; }
  .vrow .meta { font-size:11px; color:var(--dim); }
  .acts { display:flex; gap:5px; margin-top:5px; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .notebox { width:100%; margin-top:5px; padding:3px 6px; font-size:11.5px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12);
    border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>foundation patterns — audition</h1>
    <span class="now" id="now">— click a pattern chip inside any progression —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">click any chip to start audio</span>
  </div>
  <div class="row" style="margin-top:7px">
    <label class="ctl">bpm <input type="range" id="bpm" min="60" max="170" value="112"><span id="bpmv">112</span></label>
    <label class="ctl">transpose <input type="range" id="tr" min="-6" max="6" value="0"><span id="trv">0</span></label>
    <span class="dim">a chip plays THAT pattern on THAT progression, at the pattern's own meter — verdicts are per pattern, below the cards</span>
  </div>
</header>
<main>
  <div id="cards"></div>
  <h2>verdicts — one per pattern, after hearing it across the contexts</h2>
  <div class="vgrid" id="vgrid"></div>
</main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:foundation-verdicts';
const LSN = 'motif-engine:foundation-notes';
let verdicts = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let notes = {};
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
let playing = null; // { prog, pat }
const $ = (id) => document.getElementById(id);
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };

// felt pulse per meter: numerator beats, except compound meters count dotted beats
const BPB = { '4/4': 4, '3/4': 3, '2/4': 2, '2/2': 2, '6/8': 2, '12/8': 4 };

function codeFor(progName, patName) {
  const p = DATA.progs.find((x) => x.name === progName);
  const pat = DATA.patterns.find((x) => x.name === patName);
  if (!p || !pat || !p.exprs[patName]) return null;
  const bpm = Number($('bpm') && $('bpm').value) || 112;
  const tr = Number($('tr') && $('tr').value) || 0;
  const bpb = BPB[pat.meter] || 4;
  return 'setcpm(' + bpm + '/' + bpb + ')\\np: stack(' + p.exprs[patName] + ')' + (tr ? '.transpose(' + tr + ')' : '');
}

async function play(progName, patName) {
  const code = codeFor(progName, patName);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio (first play loads the piano)…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = { prog: progName, pat: patName };
  const p = DATA.progs.find((x) => x.name === progName);
  const pat = DATA.patterns.find((x) => x.name === patName);
  $('now').textContent = '\\u25b6 ' + pat.short + ' (' + pat.meter + ')  on  ' + p.symbols.join(' ');
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }

// r24 — see audition-songs.mjs: textContent -> innerHTML does not escape the
// double quote, and a note goes back into a value="..." attribute, so his notes
// truncated at their first quote character.
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(s) { return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }

function render() {
  const cards = DATA.progs.map(function (p) {
    const on = playing && playing.prog === p.name;
    const groups = DATA.styles.map(function (st) {
      const pats = DATA.patterns.filter(function (x) { return x.style === st; });
      if (!pats.length) return '';
      const chips = pats.map(function (x) {
        const sel = on && playing.pat === x.name;
        return '<button class="tone' + (sel ? ' on' : '') + '" data-prog="' + p.name + '" data-pat="' + x.name + '" title="' + esc(x.proposal) + ' \\u00b7 ' + x.meter + ' \\u00b7 oct ' + x.octave + '">' + esc(x.short) + '</button>';
      }).join('');
      return '<div class="stylegrp"><div class="lbl">' + st + '</div><div class="chips">' + chips + '</div></div>';
    }).join('');
    return '<div class="card' + (on ? ' playing' : '') + '">' +
      '<span class="dim">' + esc(p.name) + (p.song ? ' \\u00b7 ' + esc(p.song) : '') + ' \\u00b7 ' + p.family + ' \\u00b7 ' + p.bars + ' bars</span>' +
      '<div class="sym">' + esc(p.numerals) + ' \\u2014 ' + esc(p.symbols.join(' ')) + '</div>' +
      groups + '</div>';
  }).join('');
  $('cards').innerHTML = cards;

  $('vgrid').innerHTML = DATA.patterns.map(function (x) {
    const v = verdicts[x.name];
    return '<div class="vrow' + (v ? ' ' + v : '') + '">' +
      '<span class="nm">' + esc(x.short) + '</span> <span class="meta">' + x.style + ' \\u00b7 ' + x.class + ' \\u00b7 ' + x.meter + '</span>' +
      '<div class="meta">' + esc(x.proposal) + '</div>' +
      '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-pat="' + x.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-pat="' + x.name + '">kill</button>' +
      '</div>' +
      '<input class="notebox" data-note="' + x.name + '" placeholder="notes\\u2026" value="' + esc(notes[x.name] || '') + '">' +
      '</div>';
  }).join('');

  const done = Object.keys(verdicts).length;
  $('tally').textContent = done + '/' + DATA.patterns.length + ' patterns judged \\u00b7 ' +
    Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes';

  document.querySelectorAll('#cards .tone').forEach(function (b) {
    b.onclick = function () { play(b.dataset.prog, b.dataset.pat); };
  });
  document.querySelectorAll('#vgrid .acts button').forEach(function (b) {
    b.onclick = function () {
      const n = b.dataset.pat;
      verdicts[n] = verdicts[n] === b.dataset.v ? undefined : b.dataset.v;
      if (!verdicts[n]) delete verdicts[n];
      save(); render();
    };
  });
  document.querySelectorAll('#vgrid .notebox').forEach(function (inp) {
    inp.oninput = function () { notes[inp.dataset.note] = inp.value; save(); const t = $('tally'); if (t) t.textContent = Object.keys(verdicts).length + '/' + DATA.patterns.length + ' patterns judged \\u00b7 ' + Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes'; };
    inp.onkeydown = function (ev) { ev.stopPropagation(); };
  });
}

$('stop').onclick = stop;
$('bpm').oninput = function () { $('bpmv').textContent = $('bpm').value; if (playing) play(playing.prog, playing.pat); };
$('tr').oninput = function () { $('trv').textContent = $('tr').value; if (playing) play(playing.prog, playing.pat); };
$('export').onclick = function () {
  const sig = {};
  DATA.patterns.forEach(function (x) { sig[x.name] = x.sig; });
  const out = {
    figurations: true, page: 'foundations', generated: new Date().toISOString(),
    verdicts: verdicts,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    judged: sig,
  };
  navigator.clipboard.writeText(JSON.stringify(out, null, 2));
  $('export').textContent = 'copied!';
  setTimeout(function () { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') stop(); });
render();
</script>
</body>
</html>
`;
}
