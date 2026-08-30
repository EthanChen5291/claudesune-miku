// audition/dissonance.html — THE r26 EAR TEST FOR "TOO MUCH DISSONANCE".
//
// Sixteen of his 28 r25 suite cards mention dissonance, and they name two
// different places: BETWEEN instruments ("lots of random dissonance between
// different instruments which I heavily dislike", "the harmonica or whatever
// sounds dissonant from the main melody", "they should have a different melody
// unless it's an intentional counter melody because then it just sounds like
// they're arguing") and INSIDE the piano ("random dissonance in the piano").
//
// WHY THIS PAGE EXISTS RATHER THAN A SHIPPED FIX. The r26 measurements found a
// real, mechanical cause and a real fix for part of it — but they also found
// that NO clash statistic predicts his song-by-song verdicts. Twenty different
// operationalisations of "dissonance" were tested against his 16 flagged / 12
// unflagged cards and every one came back |r| < 0.23, several slightly negative.
// The song he is a "big fan" of (su_mysterious_desert) is the WORST in the suite
// on the headline metric, because its rubs come from `opts.wobble` — a device he
// asked for and praised — at gain 0.11.
//
// So the measurements can say what CHANGED between the page he keeps songs on
// and the page he calls dissonant. They cannot say which of these four he will
// prefer. That is what ears are for, and this page asks.
//
// ---------------------------------------------------------------------------
// WHAT THE FOUR VARIANTS ARE
// ---------------------------------------------------------------------------
//   A · as you judged it   the r25 suite, unchanged — the build his cards describe
//   B · r26 fixes          the echo chord-guard + the frozen-slot coverage gate
//   C · no frozen slot     the single biggest measured source, removed outright
//   D · none of the three  frozen slot, echo and coprime cell all off — the floor
//
// A -> D is deliberately a ladder from "the least intervention that is defensible"
// to "the most". D is not proposed; it is the control that says how much of the
// complaint these three layers own.
//
// ---------------------------------------------------------------------------
// THE MEASUREMENTS BEHIND IT (all in mix, never solos — D100)
// ---------------------------------------------------------------------------
// Close semitone/tritone collisions with the melody, per bar, duration-weighted:
//   his 15 KEPT songs   0.15      <- the target
//   suite as shipped    1.48
//   B (r26 fixes)       1.30      -12%
//   C (no frozen slot)  0.69      -53%
//   D (all three off)   0.34      -77%
//
// 57% of every rub against the melody in the shipped suite comes from four
// layers the judged page does not carry at all: frozen_slot, echo, octave and
// coprime_cell. The frozen slot plus its own slot partner alone are 1007 of 2058.
//
// The echo fix is exact where it applies: echo notes sounding under a chord that
// was never chosen for them went 20.7% -> 0.0% on all 26 unpinned songs. It cost
// 626 of 3023 echo notes, which is the intended trade — the layer RESTS instead
// of clashing, which is what the reference set does anyway (57.5% of its parts
// stop for at least a bar).
//
// The frozen-slot gate is much weaker than the ablation, and that is the honest
// result: requiring a held pitch to be in >= 75% of the loop's chords dropped the
// device from 25 songs to 22, and moved the headline number by 12%, not 53%. The
// reason is now measured: most of its rubs are against the MELODY (which moves
// through non-chord tones by design), not against the loop. Fixing what it holds
// cannot fix that; only resting it under the tune, or not casting it, can.
//
// Build:  node scripts/audition-dissonance.mjs
// Inputs: the four suite builds under scratch/r26/ (gitignored, regenerable —
//         see the round notes; scripts/.ctl-r26.mjs writes the ablations).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const VARIANTS = [
  ['A', 'as you judged it', 'scratch/r26/suite.SNAP.html', 'the r25 suite, untouched'],
  ['B', 'r26 fixes', 'audition/suite.html', 'echo chord-guard + frozen-slot coverage gate'],
  ['C', 'no frozen slot', 'scratch/r26/v-nofrozen.html', 'the biggest single source, removed'],
  ['D', 'all three off', 'scratch/r26/v-none.html', 'frozen slot + echo + coprime cell off'],
];

// his own words, per song, so he is judging against what he said
const CARDS = {
  su_calm_water: 'overall there’s a too much dissonance in places that dont make sense … also too much dissonance between instruments',
  su_happy_shop: 'the harmonica or whatever sounds dissonant from the main melody … too dissonant, especially in the second section',
  su_excited_training: 'this song just sucks. lots of dissonance, piano too loud. feels like a messy jumbo of random stuff',
  su_calm_menu: 'I also dont like the random dissonance in the piano, and the harmonic or whatever is too dissonant and sounds like its arguing with the main melody',
  su_nostalgic_snow: 'sometimes it has dissonant which doesn’t sound good. it’s a bit too active',
  su_happy_festival: 'sometimes it gets a bit too messy between the various woodwind chips — they should have a different melody unless it’s an intentional counter melody because then it just sounds like they’re arguing',
  su_excited_space: 'there also is lots of random dissonance between different instruments which I heavily dislike',
  su_mysterious_cave: 'the random low note piano slam doesn’t sound good … too much dissonance?',
};
const PICK = Object.keys(CARDS);

const load = (p) => {
  const full = join(ROOT, p);
  if (!existsSync(full)) return null;
  const html = readFileSync(full, 'utf8');
  const i = html.indexOf('const DATA = ');
  return JSON.parse(html.slice(i + 13, html.indexOf(';\n', i))).songs;
};

const builds = [];
for (const [tag, label, path, why] of VARIANTS) {
  const songs = load(path);
  if (!songs) { console.error(`missing ${path} — variant ${tag} will be absent`); continue; }
  builds.push({ tag, label, why, by: new Map(songs.map((s) => [s.name, s])) });
}
if (builds.length < 2) { console.error('need at least two variants'); process.exit(1); }

// strip solos: this page is about the mix, and four copies of every solo would
// quadruple a page that is already megabytes
const slim = (s) => ({
  name: s.name, bpm: s.bpm, beats: s.beats, meter: s.meter, key: s.key,
  totalBars: s.totalBars, symbols: s.symbols, scheme: s.scheme, mix: s.mix,
  layers: (s.cast || []).length,
});

const DATA = { generated: new Date().toISOString(), songs: [] };
for (const name of PICK) {
  const row = { name, card: CARDS[name], variants: [] };
  for (const b of builds) {
    const s = b.by.get(name);
    if (s) row.variants.push({ tag: b.tag, label: b.label, why: b.why, song: slim(s) });
  }
  if (row.variants.length) DATA.songs.push(row);
}
console.log(`${DATA.songs.length} songs x ${builds.length} variants`);

const html = `<!doctype html><meta charset="utf-8"><title>r26 · dissonance A/B/C/D</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#0e1116;--fg:#e6edf3;--dim:#8b949e;--line:#222a33;--a:#e8985a;--b:#5ac8e8;--c:#7ee08a;--d:#c98ae0}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{position:sticky;top:0;z-index:5;background:#0e1116ee;backdrop-filter:blur(6px);border-bottom:1px solid var(--line);padding:12px 16px}
h1{margin:0 0 4px;font-size:16px}
.dim{color:var(--dim)}
main{padding:16px;max-width:1100px;margin:0 auto}
.song{border:1px solid var(--line);border-radius:10px;padding:14px;margin:0 0 18px;background:#121820}
.card{border-left:3px solid var(--a);padding:6px 10px;margin:6px 0 12px;color:#d8c9b0;font-style:italic;background:#181d24;border-radius:0 6px 6px 0}
.vars{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.v{border:1px solid var(--line);border-radius:8px;padding:10px;background:#0f141b}
.v.playing{outline:2px solid var(--b)}
.tag{display:inline-block;font-weight:700;border-radius:4px;padding:1px 7px;margin-right:6px;color:#0e1116}
.tag.A{background:var(--a)}.tag.B{background:var(--b)}.tag.C{background:var(--c)}.tag.D{background:var(--d)}
button{background:#1b2530;color:var(--fg);border:1px solid #2b3948;border-radius:6px;padding:5px 11px;cursor:pointer;font:inherit}
button:hover{background:#243040}
button.on{background:#2f6f3f;border-color:#3f8f52}
.acts{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
textarea{width:100%;margin-top:8px;background:#0b0f14;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:7px;font:inherit;min-height:52px}
.sym{color:var(--dim);font-family:ui-monospace,Menlo,monospace;font-size:12px;margin-top:4px;overflow-x:auto;white-space:nowrap}
.bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#now{color:var(--b)}
.note{color:var(--dim);font-size:12.5px;margin:2px 0 0}
</style>
<header>
  <h1>r26 &middot; where is the dissonance coming from?</h1>
  <div class="dim">Eight songs you flagged, four builds each. <b>A</b> is exactly what you judged. <b>B</b> is the two targeted fixes. <b>C</b> and <b>D</b> remove layers outright so you can hear how much of it they own. Pick the one that sounds right &mdash; no metric here predicts your ear, so yours decides.</div>
  <div class="bar" style="margin-top:8px">
    <button id="stop">■ stop</button>
    <button id="exp">copy verdicts JSON</button>
    <span id="now" class="dim">—</span>
  </div>
</header>
<main id="main"></main>
<script src="${WEB_BUNDLE}"></script>
<script src="sample-pack.js"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:r26-dissonance';
let picks = {}, notes = {};
try { const o = JSON.parse(localStorage.getItem(LS) || '{}'); picks = o.picks || {}; notes = o.notes || {}; } catch {}
let playing = null;
const $ = (id) => document.getElementById(id);
function save() { try { localStorage.setItem(LS, JSON.stringify({ picks: picks, notes: notes })); } catch {} }
// r25: the double quote MUST be escaped — every note is written back into a
// value/textContent and his writing is full of quotes. This is the bug that ate
// his notes on seven pages.
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }
async function play(row, v) {
  const s = v.song;
  const code = 'setcpm(' + s.bpm + '/' + s.beats + ')\\np: stack(' + s.mix + ')';
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = row.name + '|' + v.tag;
  $('now').textContent = '▶ ' + row.name + '  ·  ' + v.tag + ' ' + v.label;
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '— stopped —'; render(); }
function render() {
  $('main').innerHTML = DATA.songs.map(function (row, ri) {
    const vs = row.variants.map(function (v, vi) {
      const id = row.name + '|' + v.tag;
      const on = picks[row.name] === v.tag;
      return '<div class="v' + (playing === id ? ' playing' : '') + '">' +
        '<div><span class="tag ' + v.tag + '">' + v.tag + '</span><b>' + esc(v.label) + '</b></div>' +
        '<div class="note">' + esc(v.why) + '</div>' +
        '<div class="acts">' +
          '<button data-p="' + ri + '" data-v="' + vi + '">▶ play</button>' +
          '<button class="' + (on ? 'on' : '') + '" data-pick="' + ri + '" data-t="' + esc(v.tag) + '">' + (on ? '✓ best' : 'best') + '</button>' +
        '</div></div>';
    }).join('');
    const s = row.variants[0].song;
    return '<div class="song"><h2 style="margin:0 0 2px;font-size:15px">' + esc(row.name) + '</h2>' +
      '<div class="dim">' + esc(s.key) + ' · ' + s.bpm + 'bpm · ' + s.totalBars + ' bars</div>' +
      '<div class="sym">' + esc((s.symbols || []).join('  ')) + '</div>' +
      '<div class="card">“' + esc(row.card) + '”</div>' +
      '<div class="vars">' + vs + '</div>' +
      '<textarea data-note="' + esc(row.name) + '" placeholder="what you hear — which one, and why">' + esc(notes[row.name] || '') + '</textarea>' +
      '</div>';
  }).join('');
}
document.addEventListener('click', function (e) {
  const p = e.target.closest('[data-p]');
  if (p) { const row = DATA.songs[+p.dataset.p]; play(row, row.variants[+p.dataset.v]); return; }
  const k = e.target.closest('[data-pick]');
  if (k) { const row = DATA.songs[+k.dataset.pick]; picks[row.name] = picks[row.name] === k.dataset.t ? null : k.dataset.t; save(); render(); return; }
  if (e.target.id === 'stop') stop();
  if (e.target.id === 'exp') {
    const out = { page: 'r26-dissonance', generated: new Date().toISOString(), picks: picks, notes: notes };
    navigator.clipboard.writeText(JSON.stringify(out, null, 1));
    $('now').textContent = 'verdicts copied to clipboard';
  }
});
document.addEventListener('input', function (e) {
  const t = e.target.closest('[data-note]');
  if (t) { notes[t.dataset.note] = t.value; save(); }
});
render();
</script>`;

const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
try { acorn.parse(inline, { ecmaVersion: 2022 }); } catch (e) { console.error('inline script parse FAILED:', e.message); process.exit(1); }
writeFileSync(join(OUT, 'dissonance.html'), html);
console.log(`wrote audition/dissonance.html (${Math.round(html.length / 1024)} KB) — inline script parses clean`);
