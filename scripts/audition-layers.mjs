// audition/layers.html — the r22 LAYERING A/B.
//
// Sixteen prompts drawn from the 26 MIDI files he hand-imported on 2026-08-29,
// each built twice from the SAME name-seed: once with the four layering devices
// read off those files, once without. The only variable in a pair is the
// layering, so his ear is ruling on the devices and not on two different songs.
//
// Build: R22_LAYERS=1 node scripts/audition-songs.mjs && node scripts/audition-layers.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const src = join(OUT, '.r22-layers.json');
if (!existsSync(src)) {
  console.error('missing audition/.r22-layers.json — run: R22_LAYERS=1 node scripts/audition-songs.mjs');
  process.exit(1);
}
const R = JSON.parse(readFileSync(src, 'utf8'));
const by = new Map();
for (const s of R.songs) { if (!by.has(s.pairKey)) by.set(s.pairKey, {}); by.get(s.pairKey)[s.variant] = s; }

const slim = (s) => s && ({
  name: s.name, bpm: s.bpm, beats: s.beats, meter: s.meter, key: s.key,
  totalBars: s.totalBars, scheme: s.scheme, symbols: s.symbols,
  accompaniment: s.accompaniment, cast: s.cast, drums: s.drums,
  mix: s.mix, solos: s.solos,
});

const DATA = {
  generated: new Date().toISOString(),
  devices: R.devices,
  // measured this round, both sides through one probe — stated on the page so
  // he is judging against the numbers rather than against my description
  measured: [
    'ECHO — a constant-lag copy of the lead now lands on 15 of 16 songs, at the intended lag (0.5-2 beats, 50-93% of its onsets matching). It emitted .late(NaN) at first and produced silence on all 16; the vibe carries `meter`, not `beats`.',
    'BREATHING — layers now rest more than their control on 15 of 16 songs (20-75% fewer sounding bars per voice). The first version only reached the 2-3 planner layers and moved 3 of 16; the density that reads as a wall is in the support layers.',
    'OBLIQUE COMPANION — the control was ALREADY at 27.7% oblique motion against a reference of 27.8%, so the premise that the engine could not make oblique motion was wrong. Holding unconditionally overshot to 45.8%; conditioned on stepwise lead motion it sits at 31.3%.',
    'OCTAVE PARTNER — the weakest of the four. Unison/octave is 34.8% of reference simultaneities; ours went 21.9% -> 24.3%. It plays, and it moves the number the right way, but it does not close the gap.',
    'CONCURRENCY — 2.81 voices -> 3.75 (reference set 4.85, judged songs.html 4.02).',
  ],
  notApplied: [
    'Our vertical writing is far more consonant than the reference and this round did not change it: thirds+sixths 39.2% against 23.3%, seconds+sevenths 9.1% against 18.9%. That is a harmony finding, not a layering one, so it is recorded and not wired.',
    'Density inversion (a partner getting busier when the lead rests) could not be measured here — inside a 16-bar steady window the lead rarely rests, so the split is degenerate. The 31k sweep says 1.57; this set says 0.17 on 4.1% of pairs. Underpowered, not contradictory.',
  ],
  pairs: [...by.entries()].map(([key, v]) => ({
    key,
    prompt: v.r22?.promptText ?? v.r22base?.promptText ?? key,
    reference: v.r22?.reference ?? null,
    a: slim(v.r22), b: slim(v.r22base),
  })),
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r22 layering — with vs without</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0;
          --a:#2f9e6e; --b:#6b6b80; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  .now { font-variant-numeric:tabular-nums; color:var(--a); font-weight:600; }
  main { padding:14px 18px 96px; max-width:1400px; margin:0 auto; }
  .intro { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:12px 16px; margin-bottom:16px; }
  .intro h2 { font-size:13.5px; margin:12px 0 4px; }
  .intro ul { margin:4px 0 0; padding-left:18px; }
  .intro li { margin-bottom:5px; color:#cfcfe0; }
  .pair { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:12px 14px; margin-bottom:14px; }
  .ptxt { font-size:15px; font-weight:650; }
  .cols { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:9px; }
  @media (max-width: 900px) { .cols { grid-template-columns:1fr; } }
  .side { border:1px solid var(--line); border-radius:8px; padding:10px 11px; background:#191921; }
  .side.A { border-top:3px solid var(--a); }
  .side.B { border-top:3px solid var(--b); }
  .side.playing { background:#1e2438; border-color:var(--a); }
  .side.keep { box-shadow: inset 3px 0 0 var(--keep); }
  .side.kill { box-shadow: inset 3px 0 0 var(--kill); opacity:.75; }
  .tag { font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; }
  .tag.A { color:var(--a); } .tag.B { color:var(--b); }
  .meta { font-size:12px; color:var(--dim); margin:3px 0; }
  .sym { font-family: ui-monospace, Menlo, monospace; font-size:12.5px; margin:4px 0; }
  select { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:3px 7px; font:inherit; max-width:200px; }
  .acts { display:flex; gap:6px; margin-top:8px; align-items:center; flex-wrap:wrap; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .pref { display:flex; gap:6px; align-items:center; margin-top:9px; flex-wrap:wrap; }
  .pref button.on { background:var(--a); border-color:var(--a); color:#fff; }
  .notebox { width:100%; margin-top:7px; padding:4px 7px; font-size:12px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  details { margin-top:5px; font-size:12px; color:var(--dim); }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>r22 layering — with vs without</h1>
    <span class="now" id="now">— click ▶ on either side —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim"><b style="color:var(--a)">A · layers on</b> vs <b style="color:var(--b)">B · engine as it was</b>. Same name-seed, same harmony, same cast, same drums — the only difference is the four devices. Use the solo dropdown on A to hear <b>_echo</b>, <b>_octave</b> and <b>_companion</b> on their own.</span>
  </div>
</header>
<main id="cards"></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script src="sample-pack.js"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:r22-verdicts';
const LSN = 'motif-engine:r22-notes';
const LSP = 'motif-engine:r22-pref';
let verdicts = {}, notes = {}, pref = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
try { pref = JSON.parse(localStorage.getItem(LSP) || '{}'); } catch {}
let playing = null;
const solo = {};
const $ = (id) => document.getElementById(id);
function save() {
  try {
    localStorage.setItem(LS, JSON.stringify(verdicts));
    localStorage.setItem(LSN, JSON.stringify(notes));
    localStorage.setItem(LSP, JSON.stringify(pref));
  } catch {}
}
// r24 — HIS BUG REPORT: "when i put notes in and click play button on another
// song, some text gets capped and after the cap it just disappears".
// div.textContent -> innerHTML escapes &, < and > but NOT the double quote, and
// every note is written back into a value="..." attribute on re-render. His own
// writing style is full of quotes — "somber aftermath", "forceful", "relaxed",
// "tip toe-y" — so the attribute closed at his first quote and the rest of the
// note was parsed as markup and dropped. It bit 7 of the 8 audition pages
// (audition-triage.mjs was the one that escaped quotes correctly).
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }
function findSong(n) {
  let f = null;
  DATA.pairs.forEach(function (p) { if (p.a && p.a.name === n) f = p.a; if (p.b && p.b.name === n) f = p.b; });
  return f;
}
function codeFor(s) {
  const which = solo[s.name] || 'mix';
  const expr = which === 'mix' ? s.mix : (s.solos || {})[which];
  if (!expr) return null;
  return 'setcpm(' + s.bpm + '/' + s.beats + ')\\np: stack(' + expr + ')';
}
async function play(s) {
  const code = codeFor(s);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = s.name;
  $('now').textContent = '\\u25b6 ' + s.name + ' (' + (solo[s.name] || 'mix') + ')';
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }

function sideHtml(s, tag) {
  if (!s) return '<div class="side ' + tag + '"><span class="tag ' + tag + '">' + tag + '</span><div class="meta">not built</div></div>';
  const v = verdicts[s.name];
  const keys = Object.keys(s.solos || {});
  const opts = ['mix'].concat(keys).map(function (k) {
    return '<option' + ((solo[s.name] || 'mix') === k ? ' selected' : '') + '>' + k + '</option>';
  }).join('');
  return '<div class="side ' + tag + (playing === s.name ? ' playing' : '') + (v ? ' ' + v : '') + '">' +
    '<div class="row"><span class="tag ' + tag + '">' + (tag === 'A' ? 'A \\u00b7 layers on' : 'B \\u00b7 as it was') + '</span>' +
    '<button data-play="' + s.name + '">\\u25b6 play</button>' +
    '<select data-solo="' + s.name + '">' + opts + '</select></div>' +
    '<div class="meta">' + esc(s.key) + ' \\u00b7 ' + s.bpm + 'bpm \\u00b7 ' + s.totalBars + ' bars \\u00b7 form ' + esc(s.scheme || '(none)') + '</div>' +
    '<div class="sym">' + esc((s.symbols || []).join(' ')) + '</div>' +
    '<div class="meta">acc ' + esc(s.accompaniment) + (s.drums && s.drums.length ? ' \\u00b7 drums ' + esc(s.drums.join(' + ')) : ' \\u00b7 no drums') + '</div>' +
    '<details><summary>cast (' + (s.cast || []).length + ' entries)</summary>' + esc((s.cast || []).join(' | ')) + '</details>' +
    '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-n="' + s.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-n="' + s.name + '">kill</button>' +
    '</div>' +
    '<input class="notebox" data-note="' + s.name + '" placeholder="notes on this version\\u2026" value="' + esc(notes[s.name] || '') + '">' +
    '</div>';
}

function introHtml() {
  return '<div class="intro">' +
    '<div class="ptxt">four layering devices, read off your 26 files</div>' +
    '<div class="meta">Measured inside each file\\u2019s STEADY SECTION only \\u2014 the longest stretch where the set of sounding parts holds still at full strength \\u2014 because whole-file averages made the Sm4sh menu (a 15-part medley, each part covering 3% of the file) read like a sparse arrangement.</div>' +
    '<h2>the devices</h2><ul>' +
      Object.keys(DATA.devices).map(function (k) { return '<li><b>' + esc(k) + '</b> \\u2014 ' + esc(DATA.devices[k]) + '</li>'; }).join('') +
    '</ul>' +
    '<h2>what the measurement said after wiring them</h2><ul>' +
      DATA.measured.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul>' +
    '<h2>found but not wired</h2><ul>' +
      DATA.notApplied.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul></div>';
}

function render() {
  const rows = DATA.pairs.map(function (p) {
    const pf = pref[p.key];
    return '<div class="pair">' +
      '<div class="ptxt">\\u201c' + esc(p.prompt) + '\\u201d</div>' +
      '<div class="meta">' + esc(p.key) + (p.reference ? ' \\u00b7 from ' + esc(p.reference) : '') + '</div>' +
      '<div class="cols">' + sideHtml(p.a, 'A') + sideHtml(p.b, 'B') + '</div>' +
      '<div class="pref"><span class="dim">which one:</span>' +
        '<button class="' + (pf === 'A' ? 'on' : '') + '" data-pref="A" data-key="' + p.key + '">A (layers on)</button>' +
        '<button class="' + (pf === 'B' ? 'on' : '') + '" data-pref="B" data-key="' + p.key + '">B (as it was)</button>' +
        '<button class="' + (pf === 'neither' ? 'on' : '') + '" data-pref="neither" data-key="' + p.key + '">no difference</button>' +
      '</div></div>';
  }).join('');
  $('cards').innerHTML = introHtml() + rows;

  const a = Object.keys(pref).filter(function (k) { return pref[k] === 'A'; }).length;
  const b = Object.keys(pref).filter(function (k) { return pref[k] === 'B'; }).length;
  $('tally').textContent = Object.keys(pref).length + '/' + DATA.pairs.length + ' compared \\u00b7 A ' + a + ' \\u00b7 B ' + b +
    ' \\u00b7 ' + Object.keys(verdicts).length + ' keep/kill \\u00b7 ' +
    Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes';

  document.querySelectorAll('[data-play]').forEach(function (btn) {
    btn.onclick = function () { const s = findSong(btn.dataset.play); if (s) play(s); };
  });
  document.querySelectorAll('[data-solo]').forEach(function (sel) {
    sel.onchange = function () {
      solo[sel.dataset.solo] = sel.value;
      if (playing === sel.dataset.solo) { const s = findSong(playing); if (s) play(s); }
    };
  });
  document.querySelectorAll('.acts button').forEach(function (btn) {
    btn.onclick = function () {
      const n = btn.dataset.n;
      verdicts[n] = verdicts[n] === btn.dataset.v ? undefined : btn.dataset.v;
      if (!verdicts[n]) delete verdicts[n];
      save(); render();
    };
  });
  document.querySelectorAll('[data-pref]').forEach(function (btn) {
    btn.onclick = function () {
      const k = btn.dataset.key;
      pref[k] = pref[k] === btn.dataset.pref ? undefined : btn.dataset.pref;
      if (!pref[k]) delete pref[k];
      save(); render();
    };
  });
  document.querySelectorAll('.notebox').forEach(function (inp) {
    inp.oninput = function () { notes[inp.dataset.note] = inp.value; save(); };
    inp.onkeydown = function (ev) { ev.stopPropagation(); };
  });
}
$('stop').onclick = stop;
$('export').onclick = function () {
  const out = {
    page: 'r22-layers', generated: new Date().toISOString(),
    preference: pref, verdicts: verdicts,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    pairs: DATA.pairs.map(function (p) { return { key: p.key, prompt: p.prompt, reference: p.reference }; }),
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

const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
writeFileSync(join(OUT, 'layers.html'), html);
console.log(`wrote audition/layers.html — ${DATA.pairs.length} prompts x 2 variants`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
