// audition/drums.html — the drum-pattern CONFIDENCE GATE (D63).
//
// Ethan: "if you're not confident, give me a list of drum MIDIs you're not
// confident with so I can play them and then leave a note about what vibe it
// gives". The honest position: NONE of the 240 harvested dp_* patterns has
// been heard through the engine — their style tags are community folksonomy,
// not evidence. So the 10 vibe songs use only the engine's own characterized
// percussion, and THIS page is the shortlist of harvested patterns the songs
// WOULD want (battle/boss/construction/lab/casino material, plus every taiko
// and 8-bit kit pattern) so his notes can let them in.
//
// Playback maps drum-machine voices to the loaded sample banks. Voices whose
// source grid carried no velocity play FLAT at 0.7 here — this page is for
// VIBE listening, not accent ratification; the library entries keep their
// needsAccents flag regardless of what happens here.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RHYTHMS_DRUM_PATTERNS, DRUM_PATTERN_FORMS } from '../src/lib/rhythms-drum-patterns.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };

// drum-machine voice -> loaded sample name (oh/cy/rs have no direct sample —
// nearest voice, chosen by ear-plausibility, still a CANDIDATE mapping)
const VOICE_SOUND = {
  bd: 'bd', sd: 'sd', ch: 'hh', oh: 'hh', cy: 'cr', cp: 'cp', cb: 'cb',
  rs: 'click', hc: 'perc', lt: 'lt', mt: 'mt', ht: 'ht',
};

const entriesOf = (base) => Object.entries(RHYTHMS_DRUM_PATTERNS)
  .filter(([n]) => n.startsWith(`${base}_`) && VOICE_SOUND[n.slice(base.length + 1)])
  .map(([n, e]) => ({ voice: n.slice(base.length + 1), ...e }));

function voiceExpr(voice, e) {
  const G = e.grid;
  const bars = e.bars;
  const slots = Array(G * bars).fill('~');
  const gains = Array(G * bars).fill('0');
  e.onsets.forEach((o, i) => {
    const [n, d] = o.split('/').map(Number);
    const ix = Math.round((n / d) * G);
    if (ix >= slots.length) return;
    slots[ix] = VOICE_SOUND[voice];
    const a = e.accents ? e.accents[i] : 0.78; // flat: vibe listening only
    gains[ix] = String(Math.round(a * 0.9 * 100) / 100);
  });
  let expr = `s("${slots.join(' ')}").gain("${gains.join(' ')}")`;
  if (bars > 1) expr += `.slow(${bars})`;
  return expr;
}

// ---- the shortlist ---------------------------------------------------------
// every taiko + a spread of 8-bit (game palette), then per-style picks that
// serve the vibe environments; within a style prefer recovered accents and a
// detected fill, then hash for the rest.
const forms = Object.entries(DRUM_PATTERN_FORMS).map(([name, f]) => ({ name, ...f }));
const hasAccents = (f) => entriesOf(f.name).some((e) => !e.needsAccents);
const score = (f) => (hasAccents(f) ? 2 : 0) + (f.fill ? 1 : 0);
const taiko = forms.filter((f) => f.kit === 'taiko');
const eightBit = forms.filter((f) => f.kit === '8-bit')
  .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name)).slice(0, 5);
const styles = [...new Set(forms.map((f) => f.style))].sort();
const perStyle = styles.flatMap((st) => forms
  .filter((f) => f.style === st && f.kit !== 'taiko' && f.kit !== '8-bit')
  .sort((a, b) => score(b) - score(a) || fnv(a.name) % 97 - fnv(b.name) % 97)
  .slice(0, 2));
const shortRaw = [...taiko, ...eightBit, ...perStyle];
const seen = new Set();
const shortlist = shortRaw.filter((f) => !seen.has(f.name) && seen.add(f.name));

const cards = shortlist.map((f) => {
  const voices = entriesOf(f.name);
  const exprs = voices.map((e) => voiceExpr(e.voice, e));
  const expr = exprs.length === 1 ? exprs[0] : `stack(${exprs.join(', ')})`;
  return {
    name: f.name, title: f.title, url: f.url, kit: f.kit, style: f.style,
    bpm: f.bpm ?? 110, banks: f.banks, order: f.order.join(','),
    fill: f.fill, intro: f.intro,
    flat: !voices.some((e) => !e.needsAccents),
    voices: voices.map((e) => `${e.voice}→${VOICE_SOUND[e.voice]}`),
    expr,
  };
});

let checked = 0;
for (const c of cards) {
  const code = `setcpm(${c.bpm}/4)\np: stack(${c.expr})`;
  const ev = await evaluateSong(code);
  const haps = hapsByLabel(ev, 0, 4).get('p');
  if (!haps || haps.error || !haps.haps.length) throw new Error(`${c.name} produced no haps: ${haps?.error ?? 'empty'}`);
  checked++;
}

const DATA = { cards };
const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'drums.html'), html);
console.log(`wrote audition/drums.html — ${cards.length} shortlisted patterns (${taiko.length} taiko, ${eightBit.length} 8-bit, ${cards.length - taiko.length - eightBit.length} across ${styles.length} styles)`);
console.log(`  ${cards.filter((c) => !c.flat).length} play with recovered accents, ${cards.filter((c) => c.flat).length} flat (vibe listening only)`);
console.log(`  ${checked}/${cards.length} patterns evaluated green`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>drum patterns — vibe notes</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { color:var(--accent); font-weight:600; }
  main { padding:14px 18px 90px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:9px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:10px 12px; }
  .card.playing { border-color:var(--accent); background:#1e2438; }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.6; }
  .nm { font-weight:650; }
  .meta { font-size:11.5px; color:var(--dim); }
  .flat { color:#b8891f; font-size:11px; }
  .acts { display:flex; gap:5px; margin-top:6px; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .notebox { width:100%; margin-top:6px; padding:3px 6px; font-size:11.5px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  a { color:#7a9bff; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>drum patterns — what vibe does each give?</h1>
    <span class="now" id="now">— click a card to play —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus"></span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">the harvested patterns the vibe songs WANT but nothing has vouched for. Play, then write the vibe in the box ("factory", "boss phase 2", "beach"…) — the notes gate these into song generation. Amber cards play FLAT (source grid had no velocity).</span>
  </div>
</header>
<main><div class="grid" id="grid"></div></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:drum-verdicts';
const LSN = 'motif-engine:drum-notes';
let verdicts = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let notes = {};
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
let playing = null;
const $ = (id) => document.getElementById(id);
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };

async function play(c) {
  const code = 'setcpm(' + c.bpm + '/4)\\np: stack(' + c.expr + ')';
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = c.name;
  $('now').textContent = '\\u25b6 ' + c.title + ' @' + c.bpm;
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }
function esc(t) { const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

function render() {
  $('grid').innerHTML = DATA.cards.map(function (c) {
    const v = verdicts[c.name];
    return '<div class="card' + (playing === c.name ? ' playing' : '') + (v ? ' ' + v : '') + '" data-n="' + c.name + '">' +
      '<div class="nm">' + esc(c.title) + '</div>' +
      '<div class="meta">' + esc(c.style) + ' \\u00b7 ' + esc(c.kit) + ' \\u00b7 ' + c.bpm + 'bpm \\u00b7 banks ' + c.banks + (c.fill ? ' \\u00b7 fill #' + c.fill : '') + (c.intro ? ' \\u00b7 intro #' + c.intro : '') + '</div>' +
      '<div class="meta">' + esc(c.voices.join(' ')) + ' \\u00b7 <a href="' + esc(c.url) + '" target="_blank" rel="noreferrer">original</a></div>' +
      (c.flat ? '<div class="flat">plays flat \\u2014 source grid carried no velocity</div>' : '') +
      '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-n="' + c.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-n="' + c.name + '">kill</button>' +
      '</div>' +
      '<input class="notebox" data-note="' + c.name + '" placeholder="what vibe does it give\\u2026" value="' + esc(notes[c.name] || '') + '">' +
      '</div>';
  }).join('');
  $('tally').textContent = Object.keys(verdicts).length + '/' + DATA.cards.length + ' judged \\u00b7 ' + Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' vibe notes';
  document.querySelectorAll('.card').forEach(function (el) {
    el.onclick = function (ev) {
      if (ev.target.closest('button') || ev.target.closest('input') || ev.target.closest('a')) return;
      play(DATA.cards.find(function (c) { return c.name === el.dataset.n; }));
    };
  });
  document.querySelectorAll('.acts button').forEach(function (b) {
    b.onclick = function () {
      const n = b.dataset.n;
      verdicts[n] = verdicts[n] === b.dataset.v ? undefined : b.dataset.v;
      if (!verdicts[n]) delete verdicts[n];
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
    drums: true, page: 'drums', generated: new Date().toISOString(),
    verdicts: verdicts,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
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
