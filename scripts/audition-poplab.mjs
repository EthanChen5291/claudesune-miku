// Generates audition/poplab.html — the r34 POP-PACK LABS page.
//
// HIS ASK (2026-09-12): "just like variations.html, create another extensive
// variation lab testing hypothesis combos, variations, etc. just like we did
// previously to affirm and help the engine learn" — this time from the "Top
// MIDI Tracks Pack (Free)" read-out (research/toppack-r34.md, 419 piano
// arrangements of pop / film / classical / anime / Zelda OoT).
//
// Same laws as the r33 labs page:
//   VARIATION LAW: "this variation does NOT mean randomly changing some notes,
//   it means like actually creating another flow bound within the sample that
//   works." Every variant on this page names its mechanism.
//   QUESTION LAW: "ask targeted questions when im verifying so u can prove
//   your hypothesis on what works, what doesnt work, what sounds off, what
//   fits the genre." Every card carries a falsifiable hypothesis + question.
//
// One card per experiment from src/lib/pop-labs.js. A card here answers a
// MEASURED FINDING from the pack (its `finding` field, with the songs it was
// read from) rather than a note of his — the pack is labeled by title, not
// annotated by ear — so the page is the ear test the analysis cannot settle.
// Renderers are a clone of audition-variations.mjs (house style: kept in
// lockstep by hand; a spec that renders on one page renders identically on
// the other). Every variant is evaluated at build time; a silent or throwing
// one REJECTS the build loudly. Export page id: poplab-r34.
//
// Usage: node scripts/audition-poplab.mjs

import { writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';
import { POP_LABS, POP_LAB_META } from '../src/lib/pop-labs.js';
import { CATALOG_CANDIDATES } from '../src/lib/catalog-candidates.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { keyUsesFlats } from '../src/binder/theory.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'audition/poplab.html');

// ---------------------------------------------------------------------------
// Renderers — clones of the catalog page's (kept in lockstep by hand; a spec
// that renders on one page renders identically on the other).
// ---------------------------------------------------------------------------
const QUALITY_INTERVALS = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  '^7': [0, 4, 7, 11],
  m9: [0, 3, 7, 10, 14],
  madd9: [0, 3, 7, 14],
  9: [0, 4, 7, 10, 14],
  sus: [0, 5, 7],
  '7sus': [0, 5, 7, 10],
  6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  o: [0, 3, 6],
  o7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
};
const PC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function tonicPc(name) {
  const m = /^([A-Ga-g])([#b]?)$/.exec(String(name).trim());
  if (!m) throw new Error(`bad tonic "${name}"`);
  let pc = NOTE_PC[m[1].toUpperCase()];
  if (m[2] === '#') pc += 1;
  if (m[2] === 'b') pc -= 1;
  return ((pc % 12) + 12) % 12;
}
function miniPitch(midi, flats) {
  const pc = ((midi % 12) + 12) % 12;
  const name = (flats ? PC_FLAT : PC_SHARP)[pc].toLowerCase();
  return `${name}${Math.floor(midi / 12) - 1}`;
}

function renderDegrees(specJson) {
  const spec = JSON.parse(specJson);
  const { degrees, family = 'minor', tonic = 'C', bpm = 100 } = spec;
  const chordBeats = Array.isArray(spec.chordBeats) ? spec.chordBeats : null;
  const toks = parseDegrees(degrees);
  const key = `${tonic}:${family}`;
  const flats = keyUsesFlats(key);
  const tpc = tonicPc(tonic);
  const chords = toks.map((t) => {
    const ivls = QUALITY_INTERVALS[t.quality];
    if (!ivls) throw new Error(`quality "${t.quality}" not in the render dialect`);
    const rootPc = (tpc + t.semis) % 12;
    const rootMidi = 48 + rootPc;
    return {
      bass: miniPitch(rootMidi - 24, flats),
      notes: ivls.map((i) => miniPitch(rootMidi + i, flats)),
    };
  });
  if (chordBeats && chordBeats.length !== chords.length) {
    throw new Error(`chordBeats length ${chordBeats.length} != chords ${chords.length}`);
  }
  const beats = chordBeats ?? chords.map(() => 4);
  const totalBeats = beats.reduce((a, b) => a + b, 0);
  if (totalBeats % 4 !== 0) throw new Error(`progression spans ${totalBeats} beats — not whole 4/4 bars`);
  const bars = totalBeats / 4;
  const chordBars = [];
  const bassBars = [];
  let cur = [];
  let curBass = [];
  let used = 0;
  chords.forEach((c, i) => {
    let left = beats[i];
    while (left > 0) {
      const take = Math.min(left, 4 - used);
      cur.push(`[${c.notes.join(',')}]@${take}`);
      curBass.push(`${c.bass}@${take}`);
      used += take;
      left -= take;
      if (used === 4) {
        chordBars.push(`[${cur.join(' ')}]`);
        bassBars.push(`[${curBass.join(' ')}]`);
        cur = [];
        curBass = [];
        used = 0;
      }
    }
  });
  return {
    parts: [
      { expr: `note("<${chordBars.join(' ')}>").s("piano").gain(0.5)`, pitched: true },
      { expr: `note("<${bassBars.join(' ')}>").s("gm_acoustic_bass").gain(0.55)`, pitched: true },
    ],
    bars,
    bpm,
  };
}

// r33 batch 3 — optional TREATMENT fields on a part (all absent on every
// judged card, so their output is byte-identical): `add` (semitones),
// `gainPattern` (a mini-notation gain string, replaces the flat gain — the
// D123 lesson: a flat .gain() is a clobbered envelope), `room`, `clip`,
// `attack`, `release`, `mask` (0/1 mini-notation). Motivated by his sad-shop
// strings note: the same gm_string_ensemble_1 sample read "smooth" at gain
// 0.21 / room 0.45 / whole-beat holds and "robotic" at 0.45 / no room / 8ths.
function treatment(p) {
  let fx = '';
  if (p.add) fx += `.add(note(${p.add}))`;
  fx += p.gainPattern ? `.gain("${p.gainPattern}")` : `.gain(${p.gain ?? 0.6})`;
  if (p.room != null) fx += `.room(${p.room})`;
  if (p.clip != null) fx += `.clip(${p.clip})`;
  if (p.attack != null) fx += `.attack(${p.attack})`;
  if (p.release != null) fx += `.release(${p.release})`;
  if (p.mask) fx += `.mask("${p.mask}")`;
  return fx;
}

function renderNoteMini(specJson) {
  const spec = JSON.parse(specJson);
  const { mini, sound = 'piano', bpm = 100, bars = 4, gain = 0.7 } = spec;
  const shift = spec.octaveShift ? `.add(note(${12 * spec.octaveShift}))` : '';
  return {
    parts: [{ expr: `note("${mini}").s("${sound}")${shift}${treatment({ ...spec, gain })}`, pitched: true }],
    bars,
    bpm,
  };
}

function renderStackMini(specJson) {
  const spec = JSON.parse(specJson);
  const { parts: specParts, bpm = 100, bars = 4 } = spec;
  if (!Array.isArray(specParts) || !specParts.length) throw new Error('stack_mini needs parts[]');
  const parts = specParts.map((p) => {
    if (p.kind === 's' || /^(md_|vc_|hx_|dp_)/.test(p.sound ?? '')) {
      return { expr: `s("${p.mini}")${treatment({ ...p, add: 0 })}`, pitched: false };
    }
    return { expr: `note("${p.mini}").s("${p.sound ?? 'piano'}")${treatment(p)}`, pitched: true };
  });
  return { parts, bars, bpm };
}

function renderRhythmOnsets(specJson) {
  const spec = JSON.parse(specJson);
  const { onsets, sounds, bpm = 110 } = spec;
  if (!Array.isArray(onsets) || !onsets.length) throw new Error('rhythm_onsets needs onsets[]');
  const onsetVals = onsets.map((o) => {
    const [n, d] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
    return n / d;
  });
  const bars = spec.bars ?? Math.max(1, Math.floor(Math.max(...onsetVals) + 1e-9) + 1);
  const snd = Array.isArray(sounds)
    ? (sounds.length === 1 ? onsets.map(() => sounds[0]) : sounds)
    : onsets.map(() => sounds ?? 'md_stick');
  if (snd.length !== onsets.length) throw new Error('sounds[] must match onsets[]');
  const GRID = 48;
  const slots = Array.from({ length: bars * GRID }, () => []);
  onsets.forEach((o, i) => {
    const [n, d] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
    const pos = (n / d) * GRID;
    if (Math.abs(pos - Math.round(pos)) > 1e-6) throw new Error(`onset ${o} not on a ${GRID}-grid`);
    if (Math.round(pos) >= bars * GRID) throw new Error(`onset ${o} outside [0, bars=${bars})`);
    slots[Math.round(pos)].push(snd[i]);
  });
  const barStrs = [];
  for (let b = 0; b < bars; b += 1) {
    const cells = slots.slice(b * GRID, (b + 1) * GRID)
      .map((xs) => (xs.length === 0 ? '~' : xs.length === 1 ? xs[0] : `[${xs.join(',')}]`));
    barStrs.push(`[${cells.join(' ')}]`);
  }
  return {
    parts: [{ expr: `s("<${barStrs.join(' ')}>").gain(0.8)`, pitched: false }],
    bars,
    bpm,
  };
}

// lab_stack: authored parts + CATALOG cards pulled as bed/partner material.
//   { refs: [{ id, gain?, add?, slow?, drop? ('pitch'|'drums') }],
//     parts: [stack_mini-style parts], bpm, bars }
// A ref renders the catalog card through the SAME renderer family the catalog
// page uses, then wraps its pitched half .add(note(add)).mul(gain(gain)) —
// exactly the catalog pair player's shape — so an experiment against a host
// is heard the way the host actually plays.
function renderCatalogCard(id) {
  const c = CATALOG_CANDIDATES[id];
  if (!c) throw new Error(`lab_stack ref "${id}" is not a catalog candidate`);
  const { kind, spec } = c.render ?? {};
  switch (kind) {
    case 'degrees': return renderDegrees(spec);
    case 'note_mini': return renderNoteMini(spec);
    case 'stack_mini': return renderStackMini(spec);
    case 'rhythm_onsets': return renderRhythmOnsets(spec);
    default: throw new Error(`lab_stack ref "${id}": render kind ${kind} not supported here`);
  }
}
function renderLabStack(specJson) {
  const spec = JSON.parse(specJson);
  const parts = [];
  let bars = spec.bars ?? 4;
  const bpm = spec.bpm ?? 100;
  for (const ref of spec.refs ?? []) {
    const r = renderCatalogCard(ref.id);
    const g = ref.gain ?? 0.85;
    const add = ref.add ?? 0;
    const slow = ref.slow ? `.slow(${ref.slow})` : '';
    const pitch = r.parts.filter((p) => p.pitched).map((p) => p.expr).join(', ');
    const drums = r.parts.filter((p) => !p.pitched).map((p) => p.expr).join(', ');
    if (pitch && ref.drop !== 'pitch') {
      parts.push({ expr: `stack(${pitch})${add ? `.add(note(${add}))` : ''}${slow}.mul(gain(${g}))`, pitched: true });
    }
    if (drums && ref.drop !== 'drums') {
      parts.push({ expr: `stack(${drums})${slow}.mul(gain(${g}))`, pitched: false });
    }
    if (!spec.bars) bars = Math.max(bars, r.bars);
  }
  if (Array.isArray(spec.parts)) {
    const inline = renderStackMini(JSON.stringify({ parts: spec.parts, bpm, bars }));
    parts.push(...inline.parts);
  }
  if (!parts.length) throw new Error('lab_stack rendered to zero parts');
  return { parts, bars, bpm };
}

function renderVariant(v) {
  const { kind, spec } = v.render ?? {};
  switch (kind) {
    case 'degrees': return renderDegrees(spec);
    case 'note_mini': return renderNoteMini(spec);
    case 'stack_mini': return renderStackMini(spec);
    case 'rhythm_onsets': return renderRhythmOnsets(spec);
    case 'lab_stack': return renderLabStack(spec);
    default: throw new Error(`unknown render kind "${kind}"`);
  }
}

// ---------------------------------------------------------------------------
// Build + verify every variant of every card
// ---------------------------------------------------------------------------
const LANE_ORDER = ['prog', 'lh', 'melody', 'rhythm', 'form', 'mix', 'combo'];
const LANE_LABELS = {
  prog: 'progressions — the pack\'s loops, colour, harmonic rhythm, borrowed chords',
  lh: 'left hand — the accompaniment figures the pack plays, and their flows',
  melody: 'melody — hooks and grammar measured on the pack, generated back',
  rhythm: 'rhythm — comping, anticipation, tresillo, pulse',
  form: 'form — intros, lift, build over time',
  mix: 'vibe mixing — a pop loop under a game figure, a ballad LH under an EDM loop',
  combo: 'instrument combinations & swaps',
};

const cards = [];
const rejected = [];
for (const lab of Object.values(POP_LABS)) {
  const variants = [];
  for (const v of lab.variants ?? []) {
    try {
      const r = renderVariant(v);
      const pitch = r.parts.filter((p) => p.pitched).map((p) => p.expr).join(', ');
      const drums = r.parts.filter((p) => !p.pitched).map((p) => p.expr).join(', ');
      const body = [pitch && `stack(${pitch})`, drums && `stack(${drums})`].filter(Boolean).join(', ');
      if (!body) throw new Error('rendered to zero parts');
      const code = `setcpm(${r.bpm}/4)\np: stack(${body})`;
      const ev = await evaluateSong(code);
      const entry = hapsByLabel(ev, 0, Math.max(2, r.bars)).get('p');
      const n = entry ? entry.haps.length : 0;
      if (!n) throw new Error('evaluated to 0 haps');
      // r33: an HQ render (audition/hq/lab.<card>.<variant>.wav, made by
      // render-hq.mjs from this exact code) flags the variant; the key is only
      // present when the file exists so judged cards without renders stay
      // byte-identical.
      const hq = existsSync(join(ROOT, 'audition', 'hq', `poplab.${lab.id}.${v.id}.wav`));
      variants.push({ id: v.id, name: v.name, note: v.note ?? '', code, bars: r.bars, haps: n, ...(hq ? { hq: true } : {}) });
    } catch (e) {
      rejected.push(`${lab.id}/${v.id}: ${e && e.message ? e.message.split('\n')[0] : e}`);
    }
  }
  if (!variants.length) { rejected.push(`${lab.id}: no variants survived`); continue; }
  if (variants.length !== (lab.variants ?? []).length) {
    // a card with a missing variant is a broken experiment — reject wholesale
    rejected.push(`${lab.id}: ${(lab.variants ?? []).length - variants.length} variant(s) failed — card dropped`);
    continue;
  }
  cards.push({
    id: lab.id,
    lane: lab.lane,
    batch: lab.batch ?? 1,
    source: (lab.source_songs ?? []).join(' + '),
    finding: lab.finding ?? '',
    his: lab.his_words ?? '',
    hypothesis: lab.hypothesis ?? '',
    question: lab.question ?? '',
    variants,
  });
}
if (rejected.length) {
  console.error(`REJECTED at build:\n  ${rejected.join('\n  ')}`);
  process.exit(1);
}

// queue order: batch first (append-only across batches — his queue position
// never shifts), then lane, then authored order within the lane
const laneIdx = (l) => { const i = LANE_ORDER.indexOf(l); return i < 0 ? LANE_ORDER.length : i; };
const authored = Object.keys(POP_LABS);
cards.sort((a, b) => (a.batch - b.batch) || (laneIdx(a.lane) - laneIdx(b.lane)) || (authored.indexOf(a.id) - authored.indexOf(b.id)));

const DATA = {
  built: new Date().toISOString().slice(0, 16).replace('T', ' '),
  round: POP_LAB_META.round,
  page: POP_LAB_META.page,
  cards,
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r34 pop-pack labs — experiments for your ear</title>
<style>
  :root { color-scheme: dark; --bg:#10161a; --panel:#161f25; --line:#27353d; --fg:#e8f0f2; --dim:#93aab5; --accent:#2fa4c9; --good:#37b24d; --bad:#e03131; --meh:#f59f00; }
  * { box-sizing: border-box; }
  body { font: 14px/1.6 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3f3650; background:#231c2e; color:#d8cfe4; cursor:pointer; padding:5px 12px; }
  button:hover { border-color:#635680; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  main { padding:18px; max-width:1100px; margin:0 auto 90px; }
  .progress { height:6px; background:var(--line); border-radius:3px; margin:8px 0 0; overflow:hidden; }
  .progress i { display:block; height:100%; background:var(--accent); }
  .lanehead { margin:26px 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:.1em; color:var(--dim); border-bottom:1px solid var(--line); padding-bottom:4px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:18px 20px; }
  .card.playing { border-color:var(--accent); }
  .typ { display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:.08em; padding:2px 8px; border-radius:10px; background:#2d2440; color:#bba8d8; }
  .t { font-size:17px; font-weight:700; margin:8px 0 2px; font-family: ui-monospace, Menlo, monospace; }
  .src { font-size:11.5px; color:#7d6f90; font-family: ui-monospace, Menlo, monospace; margin:4px 0 10px; }
  .his { margin:8px 0; padding:7px 11px; background:rgba(47,164,201,.1); border-left:3px solid var(--accent); border-radius:0 5px 5px 0; font-size:13px; }
  .his b { color:#9ad9ee; }
  .hyp { margin:8px 0; font-size:13px; color:#cfc4e0; }
  .hyp b { color:#e8ddf8; }
  .q { margin:6px 0 12px; padding:6px 8px; border-left:3px solid var(--accent); background:#241d33; font-size:13px; }
  .vrow { display:flex; flex-wrap:wrap; gap:6px 10px; align-items:center; padding:7px 8px; border:1px solid var(--line); border-radius:7px; margin-top:7px; background:rgba(255,255,255,.02); }
  .vrow.playing { border-color:var(--accent); }
  .vname { font-weight:600; min-width:180px; }
  .vnote { flex-basis:100%; font-size:12px; color:var(--dim); margin-top:2px; }
  .vplay { padding:5px 14px; font-size:14px; background:#241d36; border-color:#41336a; }
  .vplay.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .vmark.works.on { background:var(--good); border-color:var(--good); color:#fff; }
  .vmark.off.on { background:var(--bad); border-color:var(--bad); color:#fff; }
  .vni { flex:1 1 220px; padding:5px 9px; font-size:12.5px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; min-width:160px; }
  .vni::placeholder { opacity:.4; }
  .verdicts { display:flex; gap:8px; margin:14px 0 4px; }
  .verdicts button.good.on { background:var(--good); border-color:var(--good); color:#fff; }
  .verdicts button.bad.on { background:var(--bad); border-color:var(--bad); color:#fff; }
  .verdicts button.meh.on { background:var(--meh); border-color:var(--meh); color:#111; }
  .notebox { width:100%; margin-top:10px; padding:7px 10px; font-size:13.5px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:5px; color:inherit; }
  .notebox::placeholder { opacity:.45; }
  .nav { display:flex; gap:8px; margin-top:16px; align-items:center; }
  .nav .spacer { flex:1; }
  .listview .card { margin-bottom:12px; }
  .idx { display:flex; flex-wrap:wrap; gap:3px; margin:10px 0 14px; }
  .idx button { width:26px; height:22px; padding:0; font-size:10.5px; border-radius:4px; }
  .idx button.done-good { background:rgba(55,178,77,.35); border-color:var(--good); }
  .idx button.done-bad { background:rgba(224,49,49,.3); border-color:var(--bad); }
  .idx button.done-meh { background:rgba(245,159,0,.3); border-color:var(--meh); }
  .idx button.cur { outline:2px solid var(--accent); }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:8px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#2d2440; border-radius:3px; padding:0 5px; font-size:11px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>r34 pop-pack labs — experiments, one hypothesis each</h1>
    <span class="dim" id="now">— press play —</span>
    <button id="stop">■ stop</button>
    <button id="hqmode" title="play the pre-rendered HQ wav where one exists (VSCO strings, Salamander piano — the same tier as songs.html HQ)">HQ: off</button>
    <button id="viewtoggle">list view</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">each card is one experiment: play its variants separately, mark each ✓ works / ✗ off, note anything in your words. The card verdict is for the experiment as a whole. <kbd>space</kbd> play first variant · <kbd>1</kbd>–<kbd>9</kbd> play variant n · <kbd>g</kbd> good · <kbd>x</kbd> no · <kbd>u</kbd> unsure · <kbd>←</kbd><kbd>→</kbd> move</span>
  </div>
  <div class="progress"><i id="bar" style="width:0%"></i></div>
</header>
<main id="main"></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy labels JSON</button>
</footer>
<script src="https://unpkg.com/@strudel/web@1.1.0/dist/index.js"></script>
<script src="sample-pack.js"></script>
<script>
const DATA = ${JSON.stringify(DATA)};
const LSV = 'motif-engine:poplab-r34-verdicts';
const LSL = 'motif-engine:poplab-r34-labels';
const LSM = 'motif-engine:poplab-r34-marks';
const LSN = 'motif-engine:poplab-r34-vnotes';
const LSI = 'motif-engine:poplab-r34-pos';
let verdicts = {}; let labels = {}; let marks = {}; let vnotes = {}; let pos = 0; let listMode = false;
try { verdicts = JSON.parse(localStorage.getItem(LSV) || '{}'); } catch {}
try { labels = JSON.parse(localStorage.getItem(LSL) || '{}'); } catch {}
try { marks = JSON.parse(localStorage.getItem(LSM) || '{}'); } catch {}
try { vnotes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
try { pos = Math.min(Number(localStorage.getItem(LSI) || 0), DATA.cards.length - 1); } catch {}
const known = {};
DATA.cards.forEach(function (c) { known[c.id] = {}; c.variants.forEach(function (v) { known[c.id][v.id] = 1; }); });
Object.keys(verdicts).forEach(function (k) { if (!known[k]) delete verdicts[k]; });
Object.keys(marks).forEach(function (k) {
  if (!known[k]) { delete marks[k]; return; }
  Object.keys(marks[k] || {}).forEach(function (v) { if (!known[k][v]) delete marks[k][v]; });
});
Object.keys(vnotes).forEach(function (k) {
  if (!known[k]) { delete vnotes[k]; return; }
  Object.keys(vnotes[k] || {}).forEach(function (v) { if (!known[k][v]) delete vnotes[k][v]; });
});
const save = () => { try {
  localStorage.setItem(LSV, JSON.stringify(verdicts));
  localStorage.setItem(LSL, JSON.stringify(labels));
  localStorage.setItem(LSM, JSON.stringify(marks));
  localStorage.setItem(LSN, JSON.stringify(vnotes));
  localStorage.setItem(LSI, String(pos));
} catch {} };
let playing = null; // 'cardId|variantId'
const $ = (id) => document.getElementById(id);
// r33 (his "wait i listened with HQ on"): the sad-shop strings he compared
// against were the HQ tier (VSCO sections via sfizz), so the labs page offers
// the same tier — a variant with audition/hq/lab.<card>.<variant>.wav plays
// that file when HQ is on; every other variant stays on the browser voice.
const LSHQ = 'motif-engine:poplab-hq';
let hqMode = false;
try { hqMode = localStorage.getItem(LSHQ) === '1'; } catch {}
const HQ_AUDIO = new Audio();
HQ_AUDIO.loop = true;
function hqButton() { $('hqmode').textContent = 'HQ: ' + (hqMode ? 'ON' : 'off'); $('hqmode').className = hqMode ? 'on' : ''; }
$('hqmode').onclick = function () {
  hqMode = !hqMode;
  try { localStorage.setItem(LSHQ, hqMode ? '1' : '0'); } catch {}
  hqButton();
  if (playing) { const p = playing.split('|'); play(p[0], p[1]); }
};
hqButton();
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; }); }

${RUNTIME_JS}

async function play(cardId, variantId) {
  const c = DATA.cards.find(function (x) { return x.id === cardId; });
  if (!c) return;
  const v = c.variants.find(function (x) { return x.id === variantId; }) || c.variants[0];
  if (hqMode && v.hq) {
    rtStop();
    HQ_AUDIO.src = 'hq/poplab.' + c.id + '.' + v.id + '.wav';
    HQ_AUDIO.currentTime = 0;
    try { await HQ_AUDIO.play(); } catch (e) { $('now').textContent = 'HQ playback failed: ' + e.message; return; }
    playing = c.id + '|' + v.id;
    $('now').textContent = '\\u25b6 ' + c.id + ' \\u00b7 ' + v.name + ' (HQ wav)';
    render();
    return;
  }
  HQ_AUDIO.pause();
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(v.code);
  if (!ok) { playing = null; render(); return; }
  playing = c.id + '|' + v.id;
  $('now').textContent = '\\u25b6 ' + c.id + ' \\u00b7 ' + v.name + (hqMode && !v.hq ? ' \\u00b7 no HQ render (browser voice)' : '');
  render();
}
function stop() { rtStop(); HQ_AUDIO.pause(); HQ_AUDIO.currentTime = 0; playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }

const LANE_LABELS = ${JSON.stringify(LANE_LABELS)};

function variantRow(c, v, vi) {
  const mk = (marks[c.id] || {})[v.id];
  const isPlaying = playing === c.id + '|' + v.id;
  return '<div class="vrow' + (isPlaying ? ' playing' : '') + '">'
    + '<button class="vplay' + (isPlaying ? ' on' : '') + '" data-vplay="' + esc(c.id) + '" data-vid="' + esc(v.id) + '">\\u25b6 ' + (vi + 1) + '</button>'
    + '<span class="vname">' + esc(v.name) + '</span>'
    + (v.hq ? '<span class="dim" style="background:#1d3a2a;color:#9fdcb0;padding:0 6px;border-radius:3px" title="has an HQ render (VSCO/Salamander tier)">HQ</span>' : '')
    + '<button class="vmark works' + (mk === 'works' ? ' on' : '') + '" data-vmark="works" data-c="' + esc(c.id) + '" data-vid="' + esc(v.id) + '">\\u2713 works</button>'
    + '<button class="vmark off' + (mk === 'off' ? ' on' : '') + '" data-vmark="off" data-c="' + esc(c.id) + '" data-vid="' + esc(v.id) + '">\\u2717 off</button>'
    + '<input class="vni" data-vn="' + esc(c.id) + '" data-vid="' + esc(v.id) + '" placeholder="notes on this variant \\u2014 your words" value="' + esc((vnotes[c.id] || {})[v.id] || '') + '">'
    + (v.note ? '<span class="vnote">' + esc(v.note) + '</span>' : '')
    + '</div>';
}

function cardHTML(c, i) {
  const v = verdicts[c.id];
  return '<div class="card' + (playing && playing.indexOf(c.id + '|') === 0 ? ' playing' : '') + '" data-card="' + esc(c.id) + '">'
    + '<span class="typ">' + esc(c.lane) + '</span>'
    + ' <span class="dim">' + (i + 1) + ' / ' + DATA.cards.length + '</span>'
    + '<div class="t">' + esc(c.id) + '</div>'
    + '<div class="src">' + esc(c.source) + '</div>'
    + (c.finding ? '<div class="his"><b>measured in the pack:</b> ' + esc(c.finding) + '</div>' : '')
    + (c.his ? '<div class="his"><b>you said:</b> ' + esc(c.his) + '</div>' : '')
    + (c.hypothesis ? '<div class="hyp"><b>hypothesis:</b> ' + esc(c.hypothesis) + '</div>' : '')
    + (c.question ? '<div class="q"><b>Q for you:</b> ' + esc(c.question) + '</div>' : '')
    + c.variants.map(function (vv, vi) { return variantRow(c, vv, vi); }).join('')
    + '<div class="verdicts">'
    + '<button class="good' + (v === 'good' ? ' on' : '') + '" data-v="good" data-c="' + esc(c.id) + '">experiment works</button>'
    + '<button class="bad' + (v === 'no' ? ' on' : '') + '" data-v="no" data-c="' + esc(c.id) + '">not for me</button>'
    + '<button class="meh' + (v === 'unsure' ? ' on' : '') + '" data-v="unsure" data-c="' + esc(c.id) + '">unsure</button>'
    + '</div>'
    + '<input class="notebox" data-label="' + esc(c.id) + '" placeholder="overall: what did this prove/disprove? your words" value="' + esc(labels[c.id] || '') + '">'
    + '</div>';
}

function idxHTML() {
  return '<div class="idx">' + DATA.cards.map(function (c, i) {
    const v = verdicts[c.id];
    const cls = (v === 'good' ? 'done-good' : v === 'no' ? 'done-bad' : v === 'unsure' ? 'done-meh' : '') + (i === pos && !listMode ? ' cur' : '');
    return '<button class="' + cls + '" data-jump="' + i + '" title="' + esc(c.id) + '">' + (i + 1) + '</button>';
  }).join('') + '</div>';
}

function render() {
  const main = $('main');
  if (!DATA.cards.length) { main.innerHTML = '<p class="dim">no experiments built.</p>'; return; }
  const winY = window.scrollY;
  if (listMode) {
    main.className = 'listview';
    let lane = null;
    let htmlStr = idxHTML();
    DATA.cards.forEach(function (c, i) {
      if (c.lane !== lane) { lane = c.lane; htmlStr += '<div class="lanehead">' + esc(LANE_LABELS[lane] || lane) + '</div>'; }
      htmlStr += cardHTML(c, i);
    });
    main.innerHTML = htmlStr;
  } else {
    main.className = '';
    const c = DATA.cards[pos];
    main.innerHTML = idxHTML()
      + '<div class="lanehead">' + esc(LANE_LABELS[c.lane] || c.lane) + '</div>'
      + cardHTML(c, pos)
      + '<div class="nav">'
      + '<button data-nav="-1">\\u2190 back</button>'
      + '<span class="spacer"></span>'
      + '<button data-nav="1">next \\u2192</button>'
      + '</div>';
  }
  window.scrollTo(0, winY);
  const done = DATA.cards.filter(function (c) { return verdicts[c.id] || (labels[c.id] || '').trim(); }).length;
  $('bar').style.width = (100 * done / DATA.cards.length).toFixed(1) + '%';
  $('tally').textContent = done + ' of ' + DATA.cards.length + ' judged \\u00b7 built ' + DATA.built;
  $('viewtoggle').textContent = listMode ? 'one-by-one view' : 'list view';
}

$('main').addEventListener('click', function (ev) {
  const p = ev.target.closest('[data-vplay]');
  if (p) { play(p.dataset.vplay, p.dataset.vid); return; }
  const j = ev.target.closest('[data-jump]');
  if (j) { pos = Number(j.dataset.jump); listMode = false; save(); render(); return; }
  const n = ev.target.closest('[data-nav]');
  if (n) { pos = Math.max(0, Math.min(DATA.cards.length - 1, pos + Number(n.dataset.nav))); save(); render(); return; }
  const m = ev.target.closest('[data-vmark]');
  if (m) {
    const cid = m.dataset.c; const vid = m.dataset.vid;
    if (!marks[cid]) marks[cid] = {};
    marks[cid][vid] = marks[cid][vid] === m.dataset.vmark ? undefined : m.dataset.vmark;
    if (!marks[cid][vid]) delete marks[cid][vid];
    save(); render(); return;
  }
  const b = ev.target.closest('[data-v]');
  if (b) {
    const id = b.dataset.c;
    verdicts[id] = verdicts[id] === b.dataset.v ? undefined : b.dataset.v;
    if (!verdicts[id]) delete verdicts[id];
    save(); render();
  }
});
$('main').addEventListener('input', function (ev) {
  const l = ev.target.closest('[data-label]');
  if (l) { labels[l.dataset.label] = l.value; save(); return; }
  const vn = ev.target.closest('[data-vn]');
  if (vn) {
    if (!vnotes[vn.dataset.vn]) vnotes[vn.dataset.vn] = {};
    vnotes[vn.dataset.vn][vn.dataset.vid] = vn.value;
    save(); return;
  }
});
$('main').addEventListener('keydown', function (ev) { if (ev.target.closest('input')) ev.stopPropagation(); });
$('stop').onclick = stop;
$('viewtoggle').onclick = function () { listMode = !listMode; render(); };
document.addEventListener('keydown', function (ev) {
  if (ev.target.closest('input')) return;
  if (ev.key === 'Escape') { stop(); return; }
  if (listMode) return;
  const c = DATA.cards[pos];
  if (!c) return;
  if (ev.key === ' ') { ev.preventDefault(); if (playing && playing.indexOf(c.id + '|') === 0) stop(); else play(c.id, c.variants[0].id); }
  if (/^[1-9]$/.test(ev.key)) { const v = c.variants[Number(ev.key) - 1]; if (v) play(c.id, v.id); }
  if (ev.key === 'g') { verdicts[c.id] = 'good'; save(); render(); }
  if (ev.key === 'x') { verdicts[c.id] = 'no'; save(); render(); }
  if (ev.key === 'u') { verdicts[c.id] = 'unsure'; save(); render(); }
  if (ev.key === 'ArrowRight') { pos = Math.min(DATA.cards.length - 1, pos + 1); save(); render(); }
  if (ev.key === 'ArrowLeft') { pos = Math.max(0, pos - 1); save(); render(); }
});
$('export').onclick = function () {
  const out = {
    page: 'poplab-r34', generated: new Date().toISOString(),
    verdicts: verdicts,
    labels: Object.fromEntries(Object.entries(labels).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    variant_marks: (function () {
      const o = {};
      Object.keys(marks).forEach(function (cid) {
        const m = {};
        Object.keys(marks[cid] || {}).forEach(function (v) { if (marks[cid][v]) m[v] = marks[cid][v]; });
        if (Object.keys(m).length) o[cid] = m;
      });
      return o;
    })(),
    variant_notes: (function () {
      const o = {};
      Object.keys(vnotes).forEach(function (cid) {
        const m = {};
        Object.keys(vnotes[cid] || {}).forEach(function (v) { if ((vnotes[cid][v] || '').trim()) m[v] = vnotes[cid][v].trim(); });
        if (Object.keys(m).length) o[cid] = m;
      });
      return o;
    })(),
    unseen: DATA.cards.filter(function (c) { return !verdicts[c.id] && !(labels[c.id] || '').trim() && !Object.keys(marks[c.id] || {}).length; }).map(function (c) { return c.id; }),
  };
  navigator.clipboard.writeText(JSON.stringify(out, null, 2));
  $('export').textContent = 'copied!';
  setTimeout(function () { $('export').textContent = 'copy labels JSON'; }, 1200);
};
render();
</script>
</body>
</html>
`;

acorn.parse(html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>')), { ecmaVersion: 'latest' });

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`  ${cards.length} experiments, ${cards.reduce((n, c) => n + c.variants.length, 0)} variants, all build-verified`);
