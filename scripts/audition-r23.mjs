// audition/r23.html — the r23 STRESS TEST.
//
// His ask: "also, using the midi, show me what you learned by making new songs
// so i can stress test", "for the boss fights learn what makes them actually
// feel energetic with stakes on the line and epic through their layering
// patterns and what they do in each instrument and rhythm and intervals", and
// the constraint that shapes both: "lots of the techniques and intervals behind
// his layering should own be applied to applicable genres. not specific ones
// like jungle or desert or etc."
//
// Fourteen prompts drawn from the MIDI he hand-picked, each built twice from the
// SAME name-seed: A with the r23 devices, B without. The only variable in a pair
// is the device family. Six of the fourteen are battle/boss cues (where the
// measurements came from); the other eight exist to answer the "applicable
// genres" half — the two reel devices run on a casino, a festival, a cave, a
// campfire and a sky arena, and none of them keys on a lane.
//
// Build: R23=1 node scripts/audition-songs.mjs && node scripts/audition-r23.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const src = join(OUT, '.r23-stress.json');
if (!existsSync(src)) {
  console.error('missing audition/.r23-stress.json — run: R23=1 node scripts/audition-songs.mjs');
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
  honest: R.honest,
  // Every claim here was measured on the EMITTED NOTES of this page, both
  // variants through one probe — not read off a cast list. Three of these
  // numbers are corrections to my own first attempt.
  measured: [
    'BATTLE BASS \u2014 85.5% repeated notes at 8.25 onsets/bar against the control\u2019s 0.0% at 1.25/bar (solo probe, 16 bars, 3 songs). It OVERSHOOTS its own target: the reference battle basses average 62.2%, because they mix pedal bars with moving ones, and a pure eight-per-chord pedal is 87.5% by construction. Direction and mechanism right, magnitude hotter than the references.',
    'BATTLE KIT \u2014 toms 2.00/bar against the measured 1.887, crash on 25.0% of bars against 19.8%. Both rates were wrong on the first write (4.00/bar and 50.0%, i.e. 2.1x and 2.5x over) because I put 8 onsets in a 2-bar cell and 2 in a 4-bar cell while the comments claimed otherwise. Caught by the probe, not by reading the code.',
    'SUPPORT HAMMER \u2014 100% pure-repeat bars against the control\u2019s 0.0%. Also wrong on the first write: I wrote it as R-5-5 so that "the chord change stays audible", which holds TWO pitches and therefore scores 0% by construction. It is one pitch now, and `loopRoots` moves it when the chord moves.',
    'FROZEN SLOT \u2014 14 of 14 songs: every position in the frozen body carries exactly ONE distinct pitch across all bars while the moving slot carries 3 to 6. The device does what it says.',
    'COPRIME CELL \u2014 exactly 3 distinct bar-onset patterns over 6 bars, cycling [0, 3/8, 6/8] then [1/8, 4/8, 7/8] then [2/8, 5/8]. Textbook re-phasing on a period of 3, with no section boundary anywhere near it.',
    'OPEN SONORITY \u2014 the direction is right on 4 or 5 of the 5 battle songs for every interval class (octaves up ~3.4 points, fifths up, thirds down, tritones down, semitones down), but the MAGNITUDE is small and the target is not reached: 24.7% octaves against the reference 36.1%, thirds 23.7% against 15.5%. Our battle texture is still markedly more third-y than his battle references.',
  ],
  pairs: [...by.entries()].map(([key, v]) => ({
    key,
    prompt: v.r23?.promptText ?? v.r23base?.promptText ?? key,
    reference: v.r23?.reference ?? null,
    role: v.r23?.role ?? null,
    // exactly which devices differ between the two sides, COMPUTED from the two
    // cast lists rather than asserted — a card claiming a device is on when the
    // cast says otherwise is the "returned OK" failure this project keeps
    // re-learning, and the first build of this page did leak the battle devices
    // into its own control.
    added: (v.r23?.cast ?? []).filter((c) => !(v.r23base?.cast ?? []).includes(c)).map((c) => c.split(':')[0]),
    a: slim(v.r23), b: slim(v.r23base),
  })),
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r23 stress test — boss fights + reel layering</title>
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
    <h1>r23 stress test — boss fights + reel layering</h1>
    <span class="now" id="now">— click ▶ on either side —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim"><b style="color:var(--a)">A · r23 on</b> vs <b style="color:var(--b)">B · engine as it was</b>. Same name-seed, same harmony, same key, same form — the only difference is the r23 devices. Solo dropdown on A: <b>_battle_bass</b>, <b>_marcato</b> (the support ostinato), <b>_frozen_slot</b>, <b>_coprime_cell</b>. Nothing on audition/songs.html moved; all 47 judged songs are byte-identical.</span>
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
const LS = 'motif-engine:r23-verdicts';
const LSN = 'motif-engine:r23-notes';
const LSP = 'motif-engine:r23-pref';
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
    '<div class="ptxt">what a battle theme actually does \u2014 and two devices off the production reels</div>' +
    '<div class="meta">The battle numbers come from 13 battle files against 43 non-battle files, ALL from the two folders you hand-picked, so a difference is a battle property rather than a taste property. Measured inside each file\u2019s CORE WINDOW only (your \u201cjust analyze in terms of sections or the normal sections\u201d) \u2014 never over whole files.</div>' +
    '<h2>the devices, each with the number behind it</h2><ul>' +
      Object.keys(DATA.devices).map(function (k) { return '<li><b>' + esc(k) + '</b> \u2014 ' + esc(DATA.devices[k]) + '</li>'; }).join('') +
    '</ul>' +
    '<h2>what the probe measured after wiring them</h2><ul>' +
      DATA.measured.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul>' +
    '<h2>limits, and where I got it wrong</h2><ul>' +
      DATA.honest.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul></div>';
}

function render() {
  const rows = DATA.pairs.map(function (p) {
    const pf = pref[p.key];
    return '<div class="pair">' +
      '<div class="ptxt">\\u201c' + esc(p.prompt) + '\\u201d</div>' +
      '<div class="meta">' + esc(p.key) + (p.role ? ' \\u00b7 role <b>' + esc(p.role) + '</b>' : '') + (p.reference ? ' \\u00b7 from ' + esc(p.reference) : '') + '</div>' +
      '<div class="meta">A adds: ' + ((p.added && p.added.length) ? '<b>' + esc(p.added.join(', ')) + '</b>' : '(nothing)') + '</div>' +
      '<div class="cols">' + sideHtml(p.a, 'A') + sideHtml(p.b, 'B') + '</div>' +
      '<div class="pref"><span class="dim">which one:</span>' +
        '<button class="' + (pf === 'A' ? 'on' : '') + '" data-pref="A" data-key="' + p.key + '">A (r23 on)</button>' +
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
    page: 'r23-stress', generated: new Date().toISOString(),
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
writeFileSync(join(OUT, 'r23.html'), html);
console.log(`wrote audition/r23.html — ${DATA.pairs.length} prompts x 2 variants`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
