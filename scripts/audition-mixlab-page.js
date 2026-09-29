// r43 — the COMBINATION LAB's page (audition/mixlab.html). HIS ASK, verbatim:
//
//   "next lab, allow me to combine different layers by enabling multiple at a
//    time, then press something to leave a note either individually for that
//    song or for the group, and i can do this multiple times with an extensive
//    list with a diversity of serious ones"
//
// Every other audition page renders a list of finished mixes. This one renders
// a MIXER: the bed picks the harmony, the checkboxes pick the layers, and the
// play button stacks whatever is ticked at that moment. Three things follow
// from that and each one is a deliberate choice rather than an omission:
//
//   * no keep/kill buttons. A verdict on "the mix I happened to have ticked"
//     is not a verdict on anything reproducible. Notes are the output here, and
//     every note RECORDS ITS SELECTION so it stays readable a round later.
//   * no HQ badge. There is nothing to pre-render; see the page header.
//   * notes accumulate in a LIST rather than overwriting one box — his "i can
//     do this multiple times". A note is never edited by the next one.
//
// The three note targets are his three words: "individually for that song" =
// COMBINATION (this bed + this exact selection), and "for the group" = GROUP
// (all the basses, all the cells...). LAYER sits between them because a layer
// is the thing actually being judged, and on the r42 page he had to type the
// same sentence onto four separate bass cards to say one thing about the group.
export const MIXLAB_PAGE_JS = String.raw`
const LS = 'motif-engine:mixlab-notes';
const LSSEL = 'motif-engine:mixlab-sel';
let store = { layer: {}, group: {}, combo: [] };
try { const j = JSON.parse(localStorage.getItem(LS) || 'null'); if (j) store = { layer: j.layer || {}, group: j.group || {}, combo: j.combo || [] }; } catch (e) {}
let sel = {};
try { sel = JSON.parse(localStorage.getItem(LSSEL) || '{}'); } catch (e) {}
let bedIx = 0, playing = false;
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }
const $ = function (id) { return document.getElementById(id); };
const bed = function () { return DATA.beds[bedIx]; };
function save() { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) {} }
function saveSel() { try { localStorage.setItem(LSSEL, JSON.stringify(sel)); } catch (e) {} }
// the selection is PER BED, because the same ticks over a different progression
// is exactly the comparison his notes asked for ("also depends on the chord
// progression") and losing it on every bed switch would make that comparison
// impossible to do twice the same way.
function selOf(b) { if (!sel[b.name]) sel[b.name] = b.preset.slice(); return sel[b.name]; }
function isOn(b, id) { return selOf(b).indexOf(id) >= 0; }
function toggle(id) {
  const b = bed(); const s = selOf(b); const i = s.indexOf(id);
  if (i >= 0) s.splice(i, 1); else s.push(id);
  saveSel(); render(); if (playing) play();
}
function setGroup(gname, on) {
  const b = bed(); const s = selOf(b);
  b.layers.forEach(function (l) {
    if (l.group !== gname) return;
    const i = s.indexOf(l.id);
    if (on && i < 0) s.push(l.id);
    if (!on && i >= 0) s.splice(i, 1);
  });
  saveSel(); render(); if (playing) play();
}
function setAll(on) {
  const b = bed();
  sel[b.name] = on ? b.layers.map(function (l) { return l.id; }) : [];
  saveSel(); render(); if (playing) play();
}
function preset() { const b = bed(); sel[b.name] = b.preset.slice(); saveSel(); render(); if (playing) play(); }
// r43 — HIS NOTE: "control dynamics - they're all pretty med-soft dynamics and
// as i combine them it balances so i can actually hear the combinations."
//
// Every layer's level is a fixed fraction of the lead, which is right for ONE
// arrangement and wrong for a page where the number of sounding layers is a
// checkbox. Seven ticked and it sits where it was designed to; thirty ticked and
// it is a wash, three ticked and it is too quiet to judge. So the stack is
// normalised by how many layers are ticked: equal-power (1/sqrt(n)) against the
// suggested stack, which holds the summed level roughly constant as he adds and
// removes. Clamped so a single layer cannot clip and a full tick is still
// audible. ".mul(gain())" and never ".gain()" — the second REPLACES every
// per-note accent underneath it, which is the bug r33 had to unpick.
var BAL_REF = 7, balance = true;
function balFactor(n) {
  if (!balance || !n) return 1;
  return Math.round(Math.min(2, Math.max(0.4, Math.sqrt(BAL_REF / n))) * 100) / 100;
}
// r43 — TWO KNOBS, because the fix for "it's held for so long and is really wet"
// had to be made without a browser to hear it in. Room and note length are the
// two things he described, so they are controls rather than my guess: the page
// ships dry with every layer clipped, and if that is too dry or too clipped it
// is a click instead of a round.
//
// NOTE LENGTH is an absolute .clip() and therefore REPLACES each layer's own
// articulation (a sustained pad and a sixteenth ostinato end up equal) — the
// button says so. "as built" appends nothing and leaves the per-layer values.
var ROOMS = [['dry', 0], ['a little', 0.1], ['more', 0.22], ['ambient / moody', 0.35]];
var LENS = [['shorter', 0.45], ['as built', null], ['longer', 1.2]];
// r43 SECOND PASS — ARTICULATION. The reason the labs sounded wet was never the
// reverb: MEASURED, the VSCO sustain banks barely decay (2.7-8.5 dB below their
// own peak half a second later, against 16.9-50.5 for the struck banks; the
// cello is LOUDER at +0.5 s than +0.25 s) and the HQ patch they render
// through declares ampeg_release=0.7, so a 0.107 s sixteenth rings for 0.8 s
// and one cello layer sounds about 8 notes at once. A struck sample decays by
// itself, at every pitch in the bank.
//
// It is a BUTTON and not just a new default because of his own next sentence:
// "although this level of reverb sounds good for really ambiant vibes actually
// and moody days - it does fit a genre". So the sustained banks stay reachable,
// and the wet end of the reverb control is now NAMED for that genre rather than
// being the thing to get away from.
var ARTICS = [['spiccato (struck)', 'spic'], ['pizzicato (plucked)', 'pizz'], ['sustained — the ambient one', 'sus']];
// r43 SECOND PASS — HIS ASK: "maybe just slow the tempo down by like 50%".
// Default 50%, because that is what he asked for, and the two faster settings
// are one click away. Slower is not just easier to follow: at half tempo a
// sixteenth is 0.21 s instead of 0.107, so consecutive notes of one cell stop
// overlapping at all and the layers separate for real rather than by taste.
var TEMPOS = [['50%', 0.5], ['75%', 0.75], ['100% (as written)', 1]];
var roomIx = 0, lenIx = 1, articIx = 0, tempoIx = 0;
// the STRING banks are the only sounds with three articulations; everything else
// (the trumpet theme, the guitar riffs, the horns, the piano) has one and is
// left exactly as built.
// NOT the theme's viola double: theme3 is the tune a third below at ~2.5
// notes a bar, a LINE, and a line is what a sustain is for. The wash was only
// ever the sixteenth-note layers. Switching a melody to spiccato would be
// answering a complaint nobody made.
var ARTIC_KEEP_SUSTAIN = ['theme3', 'theme8', 'pad'];
function articulate(expr, id) {
  const a = ARTICS[articIx][1];
  if (ARTIC_KEEP_SUSTAIN.indexOf(id) >= 0) return expr;
  return expr.replace(/"vsco_(cello|viola|violin|bass)(_spic|_pizz)?"/g, function (m, inst) {
    return '"vsco_' + inst + (a === 'sus' ? '' : '_' + a) + '"';
  });
}
function codeNow() {
  const b = bed(); const s = selOf(b);
  const parts = b.layers.filter(function (l) { return s.indexOf(l.id) >= 0; }).map(function (l) { return articulate(l.expr, l.id); });
  if (!parts.length) return null;
  const f = balFactor(parts.length);
  let body = 'stack(' + parts.join(',\n') + ')';
  const tail = (f === 1 ? '' : '.mul(gain(' + f + '))')
    + (LENS[lenIx][1] == null ? '' : '.clip(' + LENS[lenIx][1] + ')')
    + (ROOMS[roomIx][1] === 0 ? '' : '.room(' + ROOMS[roomIx][1] + ')');
  if (tail) body = '(' + body + ')' + tail;
  // the tempo scales cpm, so every layer slows together and nothing re-quantises
  const cpm = Math.round(b.bpm * TEMPOS[tempoIx][1] * 100) / 100;
  return 'setcpm(' + cpm + '/' + b.beats + ')\np: ' + body;
}
async function play() {
  const code = codeNow();
  if (!code) { $('now').textContent = 'nothing ticked'; return; }
  $('now').textContent = RT.ready ? '...' : 'starting audio...';
  const ok = await rtPlay(code);
  if (!ok) { playing = false; render(); return; }
  playing = true;
  const b = bed();
  $('now').textContent = '▶ ' + b.name + ' · ' + selOf(b).length + ' layers';
  render();
}
function stop() { rtStop(); playing = false; $('now').textContent = '— stopped —'; render(); }
// A note records WHAT WAS TICKED. A month later "the bass is too busy" is
// worth nothing without the eleven other layers that were playing under it.
function stamp() {
  const b = bed(); const s = selOf(b).slice();
  return { bed: b.name, bpm: b.bpm, key: b.key, loop: b.loopName, layers: s,
    labels: s.map(function (id) { const l = b.layers.filter(function (x) { return x.id === id; })[0]; return l ? l.label : id; }) };
}
function addNote(kind, key) {
  const box = $('notebox'); const text = (box.value || '').trim();
  if (!text) { $('notestatus').textContent = 'type a note first'; return; }
  const rec = { text: text, at: new Date().toISOString().slice(0, 16).replace('T', ' '), sel: stamp() };
  if (kind === 'combo') store.combo.push(rec);
  else { const bag = store[kind]; if (!bag[key]) bag[key] = []; bag[key].push(rec); }
  box.value = '';
  $('notestatus').textContent = 'saved ' + kind + (key ? ' · ' + key : '') + ' (' + count() + ' notes)';
  save(); render();
}
function count() {
  let n = store.combo.length;
  Object.keys(store.layer).forEach(function (k) { n += store.layer[k].length; });
  Object.keys(store.group).forEach(function (k) { n += store.group[k].length; });
  return n;
}
function delNote(kind, key, ix) {
  if (kind === 'combo') store.combo.splice(ix, 1);
  else { store[kind][key].splice(ix, 1); if (!store[kind][key].length) delete store[kind][key]; }
  save(); render();
}
function noteList(kind, key) {
  const recs = kind === 'combo' ? store.combo : (store[kind][key] || []);
  if (!recs.length) return '';
  return '<div class="notes">' + recs.map(function (r, i) {
    return '<div class="note"><button class="del" data-del="' + kind + '|' + (key || '') + '|' + i + '">×</button>'
      + '<span class="nt">' + esc(r.text) + '</span>'
      + '<span class="nm">' + esc(r.at) + ' · ' + esc(r.sel.bed) + ' · ' + r.sel.layers.length + ' layers: ' + esc(r.sel.labels.join(', ')) + '</span></div>';
  }).join('') + '</div>';
}
function render() {
  const b = bed();
  $('beds').innerHTML = DATA.beds.map(function (x, i) {
    return '<button class="bedb' + (i === bedIx ? ' on' : '') + '" data-bed="' + i + '">' + esc(x.name.replace('ml_', '')) + '<span class="bpm">' + x.bpm + '</span></button>';
  }).join('');
  $('bedhead').innerHTML = '<div class="bedtitle">' + esc(b.description) + '</div>'
    + '<div class="dim">' + esc(b.bedWhat) + '</div>'
    + '<div class="sym">' + esc(b.key) + ' · ' + b.bpm + ' bpm · ' + esc(b.numeralsLine || '') + ' · ' + esc(b.symbols || '') + '</div>'
    + '<div class="dim">loop source: ' + esc(b.loopSource || '') + '</div>';
  const groups = [];
  b.layers.forEach(function (l) { if (groups.indexOf(l.group) < 0) groups.push(l.group); });
  $('layers').innerHTML = groups.map(function (g) {
    const ls = b.layers.filter(function (l) { return l.group === g; });
    const on = ls.filter(function (l) { return isOn(b, l.id); }).length;
    const meta = DATA.groups[g] || {};
    return '<section class="grp">'
      + '<div class="grphead"><b>' + esc(g.toUpperCase()) + '</b>'
      + '<span class="dim">' + esc(meta.what || '') + '</span>'
      + '<span style="flex:1"></span>'
      + '<span class="dim">' + on + '/' + ls.length + '</span>'
      + '<button data-gon="' + g + '">all</button><button data-goff="' + g + '">none</button>'
      + '<button class="gn" data-gnote="' + g + '">note on this GROUP</button></div>'
      + (meta.voice ? '<div class="dim vc">one voice for the whole group: ' + esc(meta.voice) + ' — so swapping one for another is a pattern test, not a timbre test</div>' : '')
      + noteList('group', g)
      + '<div class="chips">' + ls.map(function (l) {
        return '<div class="chip' + (isOn(b, l.id) ? ' on' : '') + '">'
          + '<button class="tog" data-tog="' + l.id + '">' + (isOn(b, l.id) ? '✓ ' : '') + esc(l.label) + '</button>'
          + '<button class="ln" data-lnote="' + l.id + '" title="note on this layer, on every bed">note</button>'
          + '<div class="lw">' + esc(l.what) + '</div>'
          + '<div class="ls">' + esc(l.stat) + '</div>'
          + noteList('layer', l.id)
          + '</div>';
      }).join('') + '</div></section>';
  }).join('');
  const n = selOf(b).length;
  $('selline').textContent = n + ' of ' + b.layers.length + ' layers ticked' + (balance ? '  ·  balance x' + balFactor(n) : '  ·  balance OFF');
  $('balance').classList.toggle('on', balance);
  $('room').textContent = 'reverb: ' + ROOMS[roomIx][0];
  $('notelen').textContent = 'note length: ' + LENS[lenIx][0];
  $('artic').textContent = 'strings: ' + ARTICS[articIx][0];
  $('tempo').textContent = 'tempo: ' + TEMPOS[tempoIx][0];
  $('tally').textContent = count() + ' notes · ' + Object.keys(store.layer).length + ' layers, ' + Object.keys(store.group).length + ' groups, ' + store.combo.length + ' combinations';
  $('combonotes').innerHTML = noteList('combo');
  $('play').classList.toggle('on', playing);
}
document.addEventListener('click', function (e) {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.bed != null) { bedIx = +t.dataset.bed; render(); if (playing) play(); }
  else if (t.dataset.tog) toggle(t.dataset.tog);
  else if (t.dataset.gon) setGroup(t.dataset.gon, true);
  else if (t.dataset.goff) setGroup(t.dataset.goff, false);
  else if (t.dataset.gnote) addNote('group', t.dataset.gnote);
  else if (t.dataset.lnote) addNote('layer', t.dataset.lnote);
  else if (t.dataset.del) { const p = t.dataset.del.split('|'); delNote(p[0], p[1], +p[2]); }
});
$('play').onclick = play;
$('stop').onclick = stop;
$('all').onclick = function () { setAll(true); };
$('none').onclick = function () { setAll(false); };
$('preset').onclick = preset;
$('balance').onclick = function () { balance = !balance; render(); if (playing) play(); };
$('room').onclick = function () { roomIx = (roomIx + 1) % ROOMS.length; render(); if (playing) play(); };
$('notelen').onclick = function () { lenIx = (lenIx + 1) % LENS.length; render(); if (playing) play(); };
$('artic').onclick = function () { articIx = (articIx + 1) % ARTICS.length; render(); if (playing) play(); };
$('tempo').onclick = function () { tempoIx = (tempoIx + 1) % TEMPOS.length; render(); if (playing) play(); };
$('combonote').onclick = function () { addNote('combo'); };
$('export').onclick = async function () {
  const out = { page: 'r43-mixlab', generated: new Date().toISOString(),
    // r43 SECOND PASS: the playback settings go in the export. A note that says
    // "too wet" is unreadable a week later without knowing which articulation,
    // reverb, note length and tempo were on when it was written.
    playback: { strings: ARTICS[articIx][0], reverb: ROOMS[roomIx][0], noteLength: LENS[lenIx][0], tempo: TEMPOS[tempoIx][0], balance: balance },
    beds: DATA.beds.map(function (b) { return { name: b.name, bpm: b.bpm, key: b.key, loop: b.loopName, ticked: selOf(b) }; }),
    layerNotes: store.layer, groupNotes: store.group, comboNotes: store.combo };
  const ok = await rtCopy(JSON.stringify(out, null, 2));
  $('notestatus').textContent = ok ? 'copied ' + count() + ' notes to the clipboard' : 'copy failed — open the console';
};
render();
`;

/** the whole page. `DATA` carries the beds, their layers and the group blurbs. */
export function mixlabPage(DATA, RUNTIME_JS, WEB_BUNDLE) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r43 — the combination lab (tick any layers, note the combination)</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --on:#37b24d; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:8px 14px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:3px 9px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:12px 18px 260px; max-width:1180px; margin:0 auto; }
  .bedb { margin:0; padding:3px 9px; } .bedb .bpm { color:var(--dim); font-size:11px; margin-left:5px; }
  #bedhead { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:10px 13px; margin:10px 0 14px; }
  .bedtitle { font-size:16px; font-weight:700; }
  .sym { font-family: ui-monospace, Menlo, monospace; font-size:12.5px; margin:4px 0; color:#c9c9dd; }
  .grp { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:10px 12px; margin-bottom:12px; }
  .grphead { display:flex; gap:9px; align-items:center; flex-wrap:wrap; }
  .grphead b { letter-spacing:.06em; }
  .vc { margin:3px 0 0; font-style:italic; }
  .chips { display:grid; grid-template-columns:repeat(auto-fill,minmax(255px,1fr)); gap:8px; margin-top:9px; }
  .chip { border:1px solid #2e2e3c; border-radius:7px; padding:6px 8px; background:#191921; }
  .chip.on { border-color:var(--on); background:#16241a; }
  .chip .tog { width:calc(100% - 52px); text-align:left; font-weight:600; }
  .chip .ln { float:right; font-size:11px; padding:2px 6px; }
  .lw { font-size:11.5px; color:var(--dim); margin-top:5px; clear:both; }
  .ls { font-size:11px; color:#7f7f96; margin-top:3px; font-family: ui-monospace, Menlo, monospace; }
  .notes { margin:5px 0 2px; }
  .note { border-left:2px solid #d8a657; padding:2px 0 2px 7px; margin:3px 0; font-size:12px; }
  .note .del { float:right; font-size:11px; padding:0 5px; border-color:#5a3a3a; }
  .note .nt { display:block; color:#f0d8a8; }
  .note .nm { display:block; color:#70708a; font-size:10.5px; }
  .gn { border-color:#5a4a2a; color:#e0c07a; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:9px 18px; max-height:250px; overflow:auto; }
  #notebox { width:100%; min-height:46px; padding:5px 8px; font:inherit; font-size:12.5px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.14); border-radius:5px; color:inherit; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>r43 — the combination lab</h1>
    <span class="now" id="now">— tick some layers and press play —</span>
    <button id="play">▶ play the ticked layers</button>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">Every layer below is bound separately over this bed’s harmony and they all play the whole 32 bars — <b>what you tick is exactly what you hear</b>, in any combination. Nine beds, nine progressions, nine tempos.
    Within a group every layer shares ONE voice so swapping them is a pattern test; across groups the voices differ so a combination stays legible. The ACC group is the exception — there it is one figure on four voices, because that is your “the pitched percussion in the harmony should be replaced with another instrument”.
    <b>There is no HQ button here and there cannot be</b> — 64 togglable layers is more combinations than can be pre-rendered. So instead of rendering the mixes, the STRINGS have been moved onto the renderer’s own samples: every cello, violin, viola and bass layer plays the VSCO sections straight from the sample pack, de-swelled by the same measurement sfizz uses. 44 of the 64 layers are those. The brass, guitar and keyboards are still the browser soundfont — if any of those is what sounds wrong, say which and it can have the same treatment.</span>
  </div>
  <div class="row" style="margin-top:7px" id="beds"></div>
</header>
<main>
  <div id="bedhead"></div>
  <div class="row" style="margin-bottom:10px">
    <span class="dim" id="selline"></span>
    <button id="preset">reset to the suggested stack</button>
    <button id="all">tick everything</button>
    <button id="none">untick everything</button>
    <button id="balance" class="on" title="equal-power normalise the stack by how many layers are ticked, so adding a layer does not just make everything louder. Off = every layer at its own fixed level.">auto-balance</button>
    <button id="room" title="the page ships DRY on purpose — a reverb send outlives the stop button, which is why it kept ringing after you hit stop. Click to add some back.">reverb: dry</button>
    <button id="notelen" title="how long each note is held. 'as built' keeps each layer's own articulation (a pad sustains, an ostinato is detached); 'shorter' and 'longer' OVERRIDE all of them with one value.">note length: as built</button>
    <button id="artic" title="which string samples play. Spiccato and pizzicato are STRUCK — they decay on their own, which is what a sixteenth-note cell needs; the sustains do not decay at all (measured: the violin bank holds full level for its whole length), which is what was filling everything up. 'Sustained' is that sound, kept because you said it fits ambient and moody.">strings: spiccato (struck)</button>
    <button id="tempo" title="scales the bed's tempo. At 50% a sixteenth is 0.21 s rather than 0.107, so notes of one cell stop overlapping and the layers separate.">tempo: 50%</button>
  </div>
  <div id="layers"></div>
</main>
<footer>
  <div class="row" style="margin-bottom:5px">
    <span class="dim">write once, then file it where it belongs — the note records which layers were ticked either way:</span>
    <button id="combonote">note on THIS COMBINATION</button>
    <span class="dim">· or use the <b>note</b> button on a layer / the <b>note on this GROUP</b> button in a group header</span>
    <span style="flex:1"></span>
    <span class="dim" id="tally"></span>
    <button id="export">copy notes JSON</button>
  </div>
  <textarea id="notebox" placeholder="what you hear — then press one of the three buttons to say whether it is about this exact combination, one layer, or the whole group"></textarea>
  <div class="dim" id="notestatus"></div>
  <div id="combonotes"></div>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script src="sample-pack.js"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
${MIXLAB_PAGE_JS}
</script>
</body>
</html>
`;
}
