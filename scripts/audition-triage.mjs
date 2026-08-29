// Generates audition/triage.html — the r15 ear-test page.
//
// Ethan's ask, verbatim: "if you have any uncertainties dont stay quiet,
// address them all with me or give me a ui interface to address them and
// answer and give an ear". This is that interface. Each card is one question
// the r15 analysis could not settle without his ear, carrying the measurement
// it came from, and — where an ear can settle it — playable audio:
//
//   demos   engine-generated Strudel A/B(/C) snippets, so what he hears is
//           what the engine would actually ship (src/lib/triage-demos-r15.json,
//           authored and adversarially verified by the r15 demo workflow)
//   clip    raw reference audio (decoded BRR one-shots, the Battle Cats rip)
//           from audition/triage-clips.js — local-only, see build-triage-clips
//
// Export format mirrors the other audition pages (clipboard JSON), so the
// answers can be imported the same way verdicts are.
//
// Usage: node scripts/audition-triage.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RUNTIME_JS } from './audition-runtime.js';
import { TRIAGE_CARDS, TRIAGE_SECTIONS } from '../src/lib/triage-r15.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS_PATH = join(ROOT, 'src/lib/triage-demos-r15.json');
const OUT = join(ROOT, 'audition/triage.html');

const raw = existsSync(DEMOS_PATH) ? JSON.parse(readFileSync(DEMOS_PATH, 'utf8')) : [];

// The page plays through rtPlay, which wants the same shape the songs page
// builds: `setcpm(...)` then a LABELLED stack (`p: stack(...)`). Demo authors
// write plain `stack(...)`; normalise here rather than trusting either side.
const labelled = (code) => (/^\s*[a-z]\w*\s*:\s*stack\(/m.test(code)
  ? code
  : code.replace(/^(\s*)stack\(/m, '$1p: stack('));

// "Never trust returned OK — measure." Every snippet is evaluated at build
// time; one that throws or falls silent never reaches a play button.
const demos = [];
const silent = [];
for (const d of raw) {
  const code = labelled(d.code);
  try {
    const ev = await evaluateSong(code);
    const entry = hapsByLabel(ev, 0, d.bars ?? 4).get('p');
    const n = entry ? entry.haps.length : 0;
    if (!n) { silent.push(`${d.id}: evaluated to 0 haps`); continue; }
    demos.push({ ...d, code, measuredHaps: n });
  } catch (e) {
    silent.push(`${d.id}: ${e && e.message ? e.message.split('\n')[0] : e}`);
  }
}
const byId = new Map(demos.map((d) => [d.id, d]));

// A card's demo list may name snippets the demo pass could not verify; drop
// those rather than shipping a play button that throws, and say so on stdout.
const dropped = [];
const cards = TRIAGE_CARDS.map((c) => {
  const have = (c.demos ?? []).filter((id) => {
    if (byId.has(id)) return true;
    dropped.push(`${c.id}: ${id}`);
    return false;
  });
  return { ...c, demos: have, demoData: have.map((id) => byId.get(id)) };
});

const DATA = {
  built: new Date().toISOString().slice(0, 16).replace('T', ' '),
  sections: TRIAGE_SECTIONS,
  cards,
  counts: {
    cards: cards.length,
    withDemos: cards.filter((c) => c.demos.length).length,
    withClips: cards.filter((c) => c.clip).length,
    demos: cards.reduce((n, c) => n + c.demos.length, 0),
  },
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r15 ear-test — open questions</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --done:#37b24d; --warn:#f59f00; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.55 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  h2 { font-size:13px; margin:26px 0 8px; color:var(--dim); text-transform:uppercase; letter-spacing:.08em; font-weight:700; }
  h2 span { text-transform:none; letter-spacing:0; font-weight:400; font-size:12px; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 90px; max-width:900px; margin:0 auto; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:13px 15px; margin-bottom:12px; }
  .card.playing { border-color:var(--accent); background:#1e2438; }
  .card.answered { border-left:3px solid var(--done); }
  .card.open { border-left:3px solid var(--warn); }
  .t { font-size:15px; font-weight:700; }
  .q { margin:6px 0 4px; }
  .why { font-size:12px; color:var(--dim); margin:2px 0 0 14px; text-indent:-14px; }
  .why::before { content:"— "; }
  .caveat { font-size:12px; color:#f0c674; background:rgba(245,159,0,.08); border-left:2px solid var(--warn);
    border-radius:0 4px 4px 0; padding:5px 9px; margin:8px 0 2px; }
  .caveat b { color:#ffd479; font-weight:600; }
  .demos { display:flex; flex-wrap:wrap; gap:7px; margin:10px 0 2px; align-items:center; }
  .demos .lbl { font-size:12px; color:var(--dim); margin-right:2px; }
  button.demo { background:#1a2436; border-color:#2f4468; }
  button.demo.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .clip { display:flex; flex-wrap:wrap; gap:7px; margin:9px 0 2px; align-items:center; }
  audio { height:30px; vertical-align:middle; }
  .cliprow { display:flex; gap:8px; align-items:center; margin:3px 0; font-size:12px; color:var(--dim); }
  .acts { display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; align-items:center; }
  .acts button.on { background:var(--done); border-color:var(--done); color:#fff; }
  .notebox { width:100%; margin-top:7px; padding:5px 8px; font-size:12.5px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.45; }
  .src { font-size:11.5px; color:#6f6f88; margin-top:6px; font-family: ui-monospace, Menlo, monospace; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>r15 ear-test — the questions I could not answer without you</h1>
    <span class="now" id="now">— click a demo to play —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">every card carries the measurement it came from. demos are generated by the ENGINE (what you hear is what it would ship); clips are the raw references. answer what you have an opinion on, skip the rest, then copy the JSON.</span>
  </div>
</header>
<main id="cards"></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy answers JSON</button>
</footer>
<script src="https://unpkg.com/@strudel/web@1.1.0/dist/index.js"></script>
<script src="sample-pack.js"></script>
<script src="triage-clips.js"></script>
<script>
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:triage-r15';
const LSN = 'motif-engine:triage-r15-notes';
let answers = {};
try { answers = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let notes = {};
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
const save = () => {
  try { localStorage.setItem(LS, JSON.stringify(answers)); localStorage.setItem(LSN, JSON.stringify(notes)); } catch {}
};
const CLIPS = window.TRIAGE_CLIPS || {};
let playing = null;
const $ = (id) => document.getElementById(id);
// Plain string escaping rather than the createElement/textContent round-trip
// the older pages use: this page escapes thousands of strings per render, and
// a pure function also survives being executed headless by the test suite.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; }); }

${RUNTIME_JS}

// The reference clips are real <audio controls> elements, so starting a demo
// (or hitting stop) has to silence whichever one is mid-playback. Guarded:
// the page is also executed headless by test/audition.test.js.
function pauseClips() {
  try { (document.querySelectorAll('audio') || []).forEach(function (a) { a.pause(); }); } catch (e) {}
}
async function playDemo(id) {
  const d = DATA.cards.flatMap(function (c) { return c.demoData; }).find(function (x) { return x && x.id === id; });
  if (!d) return;
  pauseClips();
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(d.code);
  if (!ok) { playing = null; render(); return; }
  playing = id;
  $('now').textContent = '\\u25b6 ' + d.label;
  render();
}
function stop() { rtStop(); pauseClips(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }

function cardHTML(c) {
  const a = answers[c.id];
  const multi = !!c.multi;
  const answered = multi ? (Array.isArray(a) && a.length) : !!a;
  const hasNote = !!(notes[c.id] && notes[c.id].trim());
  const demoBtns = c.demoData.length
    ? '<div class="demos"><span class="lbl">listen:</span>' + c.demoData.map(function (d, i) {
        return '<button class="demo' + (playing === d.id ? ' on' : '') + '" data-demo="' + esc(d.id) + '">'
          + '\\u25b6 ' + esc(String.fromCharCode(97 + i)) + ' \\u00b7 ' + esc(d.label) + '</button>';
      }).join('') + '</div>'
      + (c.demoData.some(function (d) { return d.note; })
        ? '<div class="why">' + c.demoData.filter(function (d) { return d.note; }).map(function (d, i) {
            return esc(d.label + ' — ' + d.note); }).join('<br>') + '</div>' : '')
    : '';
  const rows = (c.clip && CLIPS[c.clip]) || [];
  const clipHTML = rows.length
    ? '<div class="clip"><span class="lbl dim">reference audio:</span></div>'
      + rows.map(function (r) {
          return '<div class="cliprow"><audio controls preload="none" src="' + r.src + '"></audio><span>' + esc(r.label) + '</span></div>';
        }).join('')
    : (c.clip ? '<div class="why">reference audio not built — run <code>node scripts/build-triage-clips.mjs</code></div>' : '');
  const opts = c.options
    ? '<div class="acts">' + c.options.map(function (o) {
        const on = multi ? (Array.isArray(a) && a.indexOf(o.v) > -1) : a === o.v;
        return '<button class="' + (on ? 'on' : '') + '" data-a="' + esc(o.v) + '" data-c="' + esc(c.id) + '">' + esc(o.label) + '</button>';
      }).join('') + (multi ? '<span class="dim">(pick any)</span>' : '') + '</div>'
    : '';
  return '<div class="card' + (playing && c.demos.indexOf(playing) > -1 ? ' playing' : '')
    + (answered || hasNote ? ' answered' : ' open') + '">'
    + '<div class="t">' + esc(c.title) + '</div>'
    + '<div class="q">' + esc(c.question) + '</div>'
    + c.why.map(function (w) { return '<div class="why">' + esc(w) + '</div>'; }).join('')
    + demoBtns
    + (c.caveat ? '<div class="caveat"><b>what this A/B can\\'t tell you:</b> ' + esc(c.caveat) + '</div>' : '')
    + clipHTML + opts
    + '<input class="notebox" data-note="' + esc(c.id) + '" placeholder="' + esc(c.askText || 'anything else you want to say about this \\u2014 your words beat my options') + '" value="' + esc(notes[c.id] || '') + '">'
    + '<div class="src">' + esc(c.id) + '</div>'
    + '</div>';
}

function render() {
  $('cards').innerHTML = DATA.sections.map(function (s) {
    const mine = DATA.cards.filter(function (c) { return c.section === s.id; });
    if (!mine.length) return '';
    return '<h2>' + esc(s.title) + ' <span>' + esc(s.blurb) + '</span></h2>' + mine.map(cardHTML).join('');
  }).join('');
  const done = DATA.cards.filter(function (c) {
    const a = answers[c.id];
    return (Array.isArray(a) ? a.length : !!a) || (notes[c.id] && notes[c.id].trim());
  }).length;
  $('tally').textContent = done + ' of ' + DATA.cards.length + ' answered \\u00b7 ' + DATA.counts.demos + ' demos \\u00b7 built ' + DATA.built;
}

$('cards').addEventListener('click', function (ev) {
  const d = ev.target.closest('[data-demo]');
  if (d) { playDemo(d.dataset.demo); return; }
  const b = ev.target.closest('[data-a]');
  if (!b) return;
  const id = b.dataset.c, v = b.dataset.a;
  const card = DATA.cards.find(function (c) { return c.id === id; });
  if (card && card.multi) {
    const cur = Array.isArray(answers[id]) ? answers[id].slice() : [];
    const i = cur.indexOf(v);
    if (i > -1) cur.splice(i, 1); else cur.push(v);
    answers[id] = cur;
  } else {
    answers[id] = answers[id] === v ? undefined : v;
    if (!answers[id]) delete answers[id];
  }
  save(); render();
});
$('cards').addEventListener('input', function (ev) {
  const n = ev.target.closest('[data-note]');
  if (!n) return;
  notes[n.dataset.note] = n.value;
  save();
});
$('cards').addEventListener('keydown', function (ev) { if (ev.target.closest('[data-note]')) ev.stopPropagation(); });
$('stop').onclick = stop;
$('export').onclick = function () {
  const out = {
    page: 'triage-r15', generated: new Date().toISOString(),
    answers: answers,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    unanswered: DATA.cards.filter(function (c) {
      const a = answers[c.id];
      return !(Array.isArray(a) ? a.length : !!a) && !(notes[c.id] && notes[c.id].trim());
    }).map(function (c) { return c.id; }),
  };
  navigator.clipboard.writeText(JSON.stringify(out, null, 2));
  $('export').textContent = 'copied!';
  setTimeout(function () { $('export').textContent = 'copy answers JSON'; }, 1200);
};
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') stop(); });
render();
</script>
</body>
</html>
`;

// Same guard the songs generator uses: a syntax error in the inline script
// renders as a blank page with nothing in the console worth reading, so parse
// it here where the failure is loud.
acorn.parse(html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>')), { ecmaVersion: 'latest' });

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`  ${DATA.counts.cards} cards · ${DATA.counts.withDemos} with demos (${DATA.counts.demos} snippets) · ${DATA.counts.withClips} with reference clips`);
if (!raw.length) console.log(`  NOTE: ${DEMOS_PATH} missing — page has no playable demos yet`);
if (silent.length) console.log(`  REJECTED at build (did not evaluate / silent):\n    ${silent.join('\n    ')}`);
if (dropped.length) console.log(`  cards missing a demo: ${dropped.join(', ')}`);
