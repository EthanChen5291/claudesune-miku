// audition/compare.html — THE A/B PAGE (r21, his ask).
//
// Verbatim: "i feel like all of these are worse than what the midi was
// producing actually. it sounds much worse. can you revert the corpus back to
// what it was before the midi analysis temporarily and then regenerate the
// songs, with only notes you think are really necessary/important insights
// added? i want them side by side for comparison"
//
// The same sixteen natural-language prompts, two backends:
//
//   A · ENGINE   the pipeline that built audition/songs.html — vibe compile,
//                click-kept exemplar retrieval + variation, ratified foundation
//                figures, letter form with tone travel and treats, planner cast
//                on the ensemble dial, his vouched drums, dynamic curves, and
//                every taste-canon law from D63 through D102.
//
//   B · CORPUS   audition/corpus-suite.html as built: harmony, hand texture,
//                layer behaviour and percussion COMPOSED from the vgmusic
//                measurements instead of retrieved.
//
// Nothing was reverted in src/lib, because the MIDI work never wrote there —
// D95 held for the whole arc. The "revert" is a BACKEND swap.
//
// Build:  CS_COMPARE=1 node scripts/audition-songs.mjs   (writes the JSON)
//         node scripts/audition-compare.mjs              (writes the page)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const enginePath = join(OUT, '.compare-engine.json');
if (!existsSync(enginePath)) {
  console.error('missing audition/.compare-engine.json — run: CS_COMPARE=1 node scripts/audition-songs.mjs');
  process.exit(1);
}
const ENG = JSON.parse(readFileSync(enginePath, 'utf8'));

// the corpus page is read, not rebuilt — it is exactly what he listened to
const csHtml = readFileSync(join(OUT, 'corpus-suite.html'), 'utf8');
const csAt = csHtml.indexOf('const DATA = ');
const CS = JSON.parse(csHtml.slice(csAt + 13, csHtml.indexOf(';\n', csAt))).songs;

const csBy = new Map(CS.map((s) => [s.name.replace(/^cs_/, ''), s]));
const pairs = [];
for (const e of ENG.songs) {
  const key = e.name.replace(/^ce_/, '');
  const c = csBy.get(key);
  if (!c) { console.log(`  no corpus counterpart for ${e.name} — engine side only`); }
  pairs.push({ key, prompt: e.promptText, engine: e, corpus: c ?? null });
}

// ---- what is actually different, stated up front --------------------------
const PREAMBLE = {
  applied: ENG.insights,
  corrected: ENG.corrected,
  skipped: ENG.skipped,
  // measured this round, both sides through the same probe
  measurements: [
    'CONCURRENCY (distinct pitched voices sounding on a 1/16 grid, first 32 bars of the MIX): judged audition/songs.html 4.02 mean of per-song medians, median 4 — vgmusic corpus 4.16. No gap. The blanket voiceCap: 4 this build first shipped is GONE; it took these sixteen to 3.44, thinner than the corpus and thinner than the judged baseline. A NOTE count on the same judged songs gives 8.72, so D102\u2019s "ours is 5-7" measured neither quantity.',
    'COMPANION TIMBRE: control build with the split off separates lead and companion family on 10 of 11 songs already (91%, corpus 69.3%). Turning it on moved exactly ONE song — catacomb_action, whose cello lead had a viola companion and now has a church organ. Real, and small.',
    'This page loads sample-pack.js; audition/corpus-suite.html never did, so choir_female was silent on its shrine song when you heard it. Both sides here have the same samples available.',
    'Meter: two of the sixteen compiled to 3/4, which no judged song is (46 of 47 are 4/4, the 47th is the kept 2/4 exception). Pinned to 4/4 so the A/B is not confounded by a meter your ear has never ruled on.',
  ],
};

function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DATA = {
  generated: new Date().toISOString(),
  preamble: PREAMBLE,
  pairs: pairs.map((p) => ({
    key: p.key,
    prompt: p.prompt,
    engine: p.engine && {
      name: p.engine.name, bpm: p.engine.bpm, beats: p.engine.beats, meter: p.engine.meter,
      key: p.engine.key, totalBars: p.engine.totalBars, scheme: p.engine.scheme,
      symbols: p.engine.symbols, accompaniment: p.engine.accompaniment, accClass: p.engine.accClass,
      cast: p.engine.cast, drums: p.engine.drums, travel: p.engine.travel,
      exemplar: p.engine.exemplar, ops: p.engine.ops, treat: p.engine.treat,
      parsed: p.engine.parsed, engineNote: p.engine.engineNote, optsApplied: p.engine.optsApplied,
      vibeNotes: p.engine.vibeNotes,
      mix: p.engine.mix, solos: p.engine.solos,
    },
    corpus: p.corpus && {
      name: p.corpus.name, bpm: p.corpus.bpm, beats: p.corpus.beats, meter: p.corpus.meter,
      key: p.corpus.key, totalBars: p.corpus.totalBars, symbols: p.corpus.symbols,
      log: p.corpus.log, measured: p.corpus.measured,
      mix: p.corpus.mix, solos: p.corpus.solos ?? {},
    },
  })),
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A/B — engine vs corpus, same sixteen prompts</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0;
          --a:#4c6ef5; --b:#c2703a; --keep:#37b24d; --kill:#e03131; }
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
  .ptxt { font-size:15px; font-weight:650; margin-bottom:2px; }
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
  select { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:3px 7px; font:inherit; max-width:190px; }
  .acts { display:flex; gap:6px; margin-top:8px; align-items:center; flex-wrap:wrap; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .pref { display:flex; gap:6px; align-items:center; margin-top:9px; }
  .pref button.on { background:var(--a); border-color:var(--a); color:#fff; }
  .pref button.bwin.on { background:var(--b); border-color:var(--b); }
  .notebox { width:100%; margin-top:7px; padding:4px 7px; font-size:12px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  details { margin-top:5px; font-size:12px; color:var(--dim); }
  details pre { white-space:pre-wrap; font-size:11.5px; line-height:1.45; margin:5px 0 0; color:#b8b8cc; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>A/B — same sixteen prompts, two backends</h1>
    <span class="now" id="now">— click ▶ on either side —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim"><b style="color:var(--a)">A · engine</b> = the pipeline that built audition/songs.html (pre-MIDI, everything your ear ruled on) &nbsp;·&nbsp; <b style="color:var(--b)">B · corpus</b> = audition/corpus-suite.html exactly as you heard it, composed from the vgmusic measurements. Play them back to back; the A/B row under each pair records which one won.</span>
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
const LS = 'motif-engine:compare-verdicts';
const LSN = 'motif-engine:compare-notes';
const LSP = 'motif-engine:compare-pref';
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

function codeFor(s) {
  const which = solo[s.name] || 'mix';
  const expr = which === 'mix' ? s.mix : (s.solos || {})[which];
  if (!expr) return null;
  // NO stripping. Both backends hand out a stack(...)-wrapped mix, but the
  // SOLOS are bare note(...).s(...).gain(...) chains that end in ')' — a
  // /^stack\\(|\\)$/ strip eats that closing paren and the solo will not
  // transpile. songs.html wraps without stripping; so does this.
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

function sideHtml(s, tag, extra) {
  if (!s) return '<div class="side ' + tag + '"><span class="tag ' + tag + '">' + tag + '</span><div class="meta">no counterpart built</div></div>';
  const v = verdicts[s.name];
  const keys = Object.keys(s.solos || {});
  const opts = ['mix'].concat(keys).map(function (k) {
    return '<option' + ((solo[s.name] || 'mix') === k ? ' selected' : '') + '>' + k + '</option>';
  }).join('');
  return '<div class="side ' + tag + (playing === s.name ? ' playing' : '') + (v ? ' ' + v : '') + '">' +
    '<div class="row"><span class="tag ' + tag + '">' + (tag === 'A' ? 'A \\u00b7 engine' : 'B \\u00b7 corpus') + '</span>' +
    '<button data-play="' + s.name + '">\\u25b6 play</button>' +
    (keys.length ? '<select data-solo="' + s.name + '">' + opts + '</select>' : '<span class="dim">mix only</span>') +
    '</div>' +
    '<div class="meta">' + esc(s.key) + ' \\u00b7 ' + s.bpm + 'bpm ' + esc(s.meter) + ' \\u00b7 ' + s.totalBars + ' bars' +
      (s.scheme ? ' \\u00b7 form ' + esc(s.scheme) : '') + '</div>' +
    '<div class="sym">' + esc((s.symbols || []).join(' ')) + '</div>' +
    extra +
    '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-n="' + s.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-n="' + s.name + '">kill</button>' +
    '</div>' +
    '<input class="notebox" data-note="' + s.name + '" placeholder="notes on this version\\u2026" value="' + esc(notes[s.name] || '') + '">' +
    '</div>';
}

function introHtml() {
  const P = DATA.preamble;
  return '<div class="intro">' +
    '<div class="ptxt">what is different between the two sides</div>' +
    '<div class="meta">Nothing was reverted in src/lib \\u2014 the MIDI work never wrote there. The revert is a BACKEND swap: A is the engine that built every song you have judged; B is the corpus-statistics generator.</div>' +
    '<h2>MIDI insights kept in A</h2><ul>' +
      Object.keys(P.applied).map(function (k) { return '<li><b>' + esc(k) + '</b> \\u2014 ' + esc(P.applied[k]) + '</li>'; }).join('') +
      '<li><b>D93 lane pin</b> \\u2014 not a corpus finding but the engine\\u2019s own law, and a raw prompt has no per-song hand to apply it: horror lanes pin family minor unless the emotion is triumphant. Without it "fighting undead in the catacombs" compiled to E major.</li>' +
      '<li><b>prompt modifiers</b> \\u2014 what you typed, honoured: drums / choir / strings / synth / tempo / sparse / groove / music-box. Not an insight; the baseline the comparison needs.</li>' +
    '</ul>' +
    '<h2>dropped after measuring \\u2014 I acted on this one before checking it</h2><ul><li>' + esc(P.corrected) + '</li></ul>' +
    '<h2>measured this round, both sides through the same probe</h2><ul>' +
      P.measurements.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul>' +
    '<h2>deliberately not applied, and why</h2><ul>' +
      P.skipped.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
    '</ul></div>';
}

function render() {
  const rows = DATA.pairs.map(function (p) {
    const e = p.engine, c = p.corpus;
    const eExtra = e ? '<div class="meta">acc ' + esc(e.accompaniment) + ' (' + esc(e.accClass) + ')' +
        (e.travel && e.travel.length ? ' \\u00b7 travel ' + esc(e.travel.join(' \\u00b7 ')) : '') +
        (e.drums && e.drums.length ? ' \\u00b7 drums ' + esc(e.drums.join(' + ')) : ' \\u00b7 no drums') + '</div>' +
      '<details><summary>cast, lineage, and what this prompt compiled to</summary>' +
        esc('parsed: ' + (e.parsed.emotion || '(no emotion word)') + ' / ' + (e.parsed.environment || '(no environment word)') +
            '  mods ' + JSON.stringify(e.parsed.mods)) + '<br>' +
        (e.engineNote ? esc('built as: ' + e.engineNote) + '<br>' : '') +
        esc('opts: ' + JSON.stringify(e.optsApplied)) + '<br>' +
        esc('exemplar ' + e.exemplar + (e.ops && e.ops.length ? ' \\u2192 ' + e.ops.join(', ') : ' (unvaried)')) + '<br>' +
        esc('cast: ' + (e.cast || []).join(' | ')) + '</details>' : '';
    const cExtra = c ? '<div class="meta">' + (c.measured
        ? esc(c.measured.voices + ' voices \\u00b7 ' + Math.round(c.measured.singleShare * 100) + '% single-note attacks \\u00b7 ' +
              Math.round(c.measured.fourPlusShare * 100) + '% four-plus')
        : '') + '</div>' +
      (c.log ? '<details><summary>the experiment trace for this song</summary><pre>' + esc(c.log) + '</pre></details>' : '') : '';
    const pf = pref[p.key];
    return '<div class="pair">' +
      '<div class="ptxt">\\u201c' + esc(p.prompt) + '\\u201d</div>' +
      '<div class="meta">' + esc(p.key) + '</div>' +
      '<div class="cols">' + sideHtml(e, 'A', eExtra) + sideHtml(c, 'B', cExtra) + '</div>' +
      '<div class="pref"><span class="dim">which one:</span>' +
        '<button class="' + (pf === 'A' ? 'on' : '') + '" data-pref="A" data-key="' + p.key + '">A (engine)</button>' +
        '<button class="bwin ' + (pf === 'B' ? 'on' : '') + '" data-pref="B" data-key="' + p.key + '">B (corpus)</button>' +
        '<button class="' + (pf === 'neither' ? 'on' : '') + '" data-pref="neither" data-key="' + p.key + '">neither</button>' +
      '</div></div>';
  }).join('');
  $('cards').innerHTML = introHtml() + rows;

  const prefN = Object.keys(pref).length;
  const a = Object.keys(pref).filter(function (k) { return pref[k] === 'A'; }).length;
  const b = Object.keys(pref).filter(function (k) { return pref[k] === 'B'; }).length;
  $('tally').textContent = prefN + '/' + DATA.pairs.length + ' compared \\u00b7 A ' + a + ' \\u00b7 B ' + b +
    ' \\u00b7 ' + Object.keys(verdicts).length + ' keep/kill \\u00b7 ' +
    Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes';

  document.querySelectorAll('[data-play]').forEach(function (btn) {
    btn.onclick = function () {
      const n = btn.dataset.play;
      let found = null;
      DATA.pairs.forEach(function (p) {
        if (p.engine && p.engine.name === n) found = p.engine;
        if (p.corpus && p.corpus.name === n) found = p.corpus;
      });
      if (found) play(found);
    };
  });
  document.querySelectorAll('[data-solo]').forEach(function (sel) {
    sel.onchange = function () {
      solo[sel.dataset.solo] = sel.value;
      if (playing === sel.dataset.solo) {
        let found = null;
        DATA.pairs.forEach(function (p) {
          if (p.engine && p.engine.name === playing) found = p.engine;
          if (p.corpus && p.corpus.name === playing) found = p.corpus;
        });
        if (found) play(found);
      }
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
    page: 'compare', generated: new Date().toISOString(),
    preference: pref,
    verdicts: verdicts,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    pairs: DATA.pairs.map(function (p) {
      return { key: p.key, prompt: p.prompt,
        engine: p.engine ? p.engine.name : null, corpus: p.corpus ? p.corpus.name : null };
    }),
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
writeFileSync(join(OUT, 'compare.html'), html);
console.log(`wrote audition/compare.html — ${pairs.length} prompts, both backends`);
console.log(`  engine side: ${ENG.songs.length} songs · corpus side: ${CS.length} songs`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
void esc;
