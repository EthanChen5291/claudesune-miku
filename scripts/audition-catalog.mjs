// Generates audition/catalog.html — the r33 verification catalog.
//
// HIS ASK, verbatim: "first take everything you like whether it's a combo of
// instruments or a specific instrument, whether it's just that instrument
// sound or a set of notes or a rhythm or a combination, and ask me to verify
// them one by one so i can label what they contribute and which ones sound
// good together."
//
// One card per candidate from src/lib/catalog-candidates.js, presented ONE AT
// A TIME (queue mode; a list view exists for revisiting). Per card he gives:
//   verdict   sounds good / not for me / unsure
//   label     free text: what it contributes
//   pairs     which other candidates it sounds good with (chip picker)
// Export mirrors the other audition pages (clipboard JSON) so the labels can
// be imported like verdicts.
//
// Rendering is ENGINE-FAITHFUL where possible: library rows go through
// bindFigure against their own reel's progression; harmony candidates are
// voiced with the project's chord dialect (the quality set is CLOSED — the
// curator rejects anything else, so an unknown quality here is a build error,
// never a silent wrong voicing). Every snippet is evaluated at build time and
// a silent/throwing one is REJECTED loudly (the triage-page law: never trust
// "returned OK").
//
// Usage: node scripts/audition-catalog.mjs

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';
import { CATALOG_CANDIDATES, CATALOG_META } from '../src/lib/catalog-candidates.js';
// his imported labels (may not exist before the first import) — used ONLY to
// pin ticked pairs' transposition to what he judged (keep-transition law)
let CATALOG_LABELS = {};
let CATALOG_PAIR_PINS = {};
try { ({ CATALOG_LABELS, CATALOG_PAIR_PINS = {} } = await import('../src/lib/catalog-labels.js')); } catch { /* no labels yet */ }
import { computeLivePin } from '../src/lib/catalog-pins.js';
import { LAYER_PATTERNS, REEL_PROGRESSIONS } from '../src/lib/layer-patterns.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { RHYTHMS_DRUM_PATTERNS } from '../src/lib/rhythms-drum-patterns.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { bindFigure } from '../src/binder/bind.js';
import { keyUsesFlats } from '../src/binder/theory.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'audition/catalog.html');

// ---------------------------------------------------------------------------
// Chord dialect (render voicings). CLOSED SET — matches what the curator
// admits. 9ths render an octave up so the audition voicing is the spread one;
// madd9's semitone character still comes through wherever a row voices it
// tight (library rows carry their own voicing and don't come through here).
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

// mini-notation pitch token, e.g. midi 61 flats -> "db4"
function miniPitch(midi, flats) {
  const pc = ((midi % 12) + 12) % 12;
  const name = (flats ? PC_FLAT : PC_SHARP)[pc].toLowerCase();
  return `${name}${Math.floor(midi / 12) - 1}`;
}

function symbolFor(rootMidiPc, quality, flats) {
  return `${(flats ? PC_FLAT : PC_SHARP)[rootMidiPc]}${quality}`;
}

// ---------------------------------------------------------------------------
// Renderers — each returns { parts, bars, bpm, tpc } or throws.
//   parts  [{ expr, pitched }] — pitched parts can be transposed with
//          .add(note(d)); unpitched (sample) parts must NOT be (a note on a
//          sample repitches its playback rate).
//   tpc    tonic pitch class the candidate was rendered in, or null when it
//          has no key (pure rhythm). The page uses it to pull a ticked
//          partner into the CURRENT card's key, so a cross-key pair is heard
//          as it would bind in one song — not as a key-mismatch rub.
// The final `setcpm(...)` + labelled stack is assembled centrally below.
// ---------------------------------------------------------------------------

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
    if (!ivls) throw new Error(`quality "${t.quality}" not in the render dialect — curator should have rejected it`);
    const rootPc = (tpc + t.semis) % 12;
    const rootMidi = 48 + rootPc; // C3-based
    return {
      bass: miniPitch(rootMidi - 24, flats),
      notes: ivls.map((i) => miniPitch(rootMidi + i, flats)),
    };
  });
  if (chordBeats && chordBeats.length !== chords.length) {
    throw new Error(`chordBeats length ${chordBeats.length} != chords ${chords.length}`);
  }
  // pack chords into 4-beat bars
  const beats = chordBeats ?? chords.map(() => 4);
  const totalBeats = beats.reduce((a, b) => a + b, 0);
  if (totalBeats % 4 !== 0) throw new Error(`progression spans ${totalBeats} beats — not a whole number of 4/4 bars`);
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
    tpc,
    mode: family === 'major' ? 'major' : 'minor',
  };
}

function renderNoteMini(specJson) {
  const spec = JSON.parse(specJson);
  const { mini, sound = 'piano', bpm = 100, bars = 4, gain = 0.7 } = spec;
  // octaveShift: audition-register correction for parts transcribed below
  // browser audibility (e.g. a g1 synth-bass pedal) — the note field documents
  // the source register
  const shift = spec.octaveShift ? `.add(note(${12 * spec.octaveShift}))` : '';
  return {
    parts: [{ expr: `note("${mini}").s("${sound}")${shift}.gain(${gain})`, pitched: true }],
    bars,
    bpm,
    tpc: spec.tonic ? tonicPc(spec.tonic) : null,
  };
}

function renderStackMini(specJson) {
  const spec = JSON.parse(specJson);
  const { parts: specParts, bpm = 100, bars = 4 } = spec;
  if (!Array.isArray(specParts) || !specParts.length) throw new Error('stack_mini needs parts[]');
  const parts = specParts.map((p) => {
    const g = p.gain ?? 0.6;
    if (p.kind === 's' || /^(md_|vc_|hx_|dp_)/.test(p.sound ?? '')) {
      return { expr: `s("${p.mini}").gain(${g})`, pitched: false };
    }
    return { expr: `note("${p.mini}").s("${p.sound ?? 'piano'}").gain(${g})`, pitched: true };
  });
  return { parts, bars, bpm, tpc: spec.tonic ? tonicPc(spec.tonic) : null };
}

function renderRhythmOnsets(specJson) {
  const spec = JSON.parse(specJson);
  const { onsets, sounds, bpm = 110 } = spec;
  if (!Array.isArray(onsets) || !onsets.length) throw new Error('rhythm_onsets needs onsets[]');
  const onsetVals = onsets.map((o) => {
    const [n, d] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
    return n / d;
  });
  // onsets are bar-relative fractions across [0, bars) — infer bars when unstated
  const bars = spec.bars ?? Math.max(1, Math.floor(Math.max(...onsetVals) + 1e-9) + 1);
  const snd = Array.isArray(sounds)
    ? (sounds.length === 1 ? onsets.map(() => sounds[0]) : sounds)
    : onsets.map(() => sounds ?? 'md_stick');
  if (snd.length !== onsets.length) throw new Error('sounds[] must match onsets[]');
  // place on a common grid per bar
  const GRID = 48; // covers 16ths + triplets
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
    tpc: null,
  };
}

function reelHarmonyContext(reel) {
  const entry = Object.entries(REEL_PROGRESSIONS).find(([, p]) => p.reel === reel);
  if (!entry) return null;
  const [, prog] = entry;
  const keyStr = String(prog.key ?? 'C:minor');
  const tonic = keyStr.split(':')[0];
  const mode = keyStr.split(':')[1] ?? 'minor';
  const family = ['major', 'minor'].includes(mode) ? mode : 'minor';
  // the progression rows carry their own SYMBOLS (transcribed) — prefer them
  // over a reconstruction from degrees
  let harmony = Array.isArray(prog.symbols) ? prog.symbols : null;
  if (!harmony) {
    const flats = keyUsesFlats(`${tonic}:${family}`);
    const tpc = tonicPc(tonic);
    harmony = parseDegrees(prog.degrees).map((t) => symbolFor((tpc + t.semis) % 12, t.quality, flats));
  }
  return {
    harmony,
    barsPerChord: 1,
    key: `${tonic}:${family}`,
    ...(Array.isArray(prog.chordBeats) ? { chordBeats: prog.chordBeats } : {}),
    bpm: prog.bpm ?? 110,
  };
}

function renderLibraryRows(specJson) {
  const names = JSON.parse(specJson);
  if (!Array.isArray(names) || !names.length) throw new Error('library_rows needs a row-name array');
  const parts = [];
  let bars = 1;
  let bpm = 110;
  let tpc = null;
  let harmonyBed = null;
  for (const name of names) {
    const lp = LAYER_PATTERNS[name];
    const dr = RHYTHMS[name] ?? RHYTHMS_DRUM_PATTERNS[name];
    if (lp) {
      const hc = reelHarmonyContext(lp.reel);
      if (!hc) throw new Error(`row ${name}: reel ${lp.reel} has no progression`);
      bpm = hc.bpm;
      if (tpc == null) tpc = tonicPc(hc.key.split(':')[0]);
      const fig = {
        name,
        figure: lp.intervals,
        onsets: lp.rhythm.onsets,
        accents: lp.rhythm.accents,
        bars: lp.rhythm.bars ?? 1,
        ...(lp.rhythm.microtiming ? { microtiming: lp.rhythm.microtiming } : {}),
      };
      const octave = 4 + (lp.octaveVsLead ?? -1);
      const bound = bindFigure(fig, hc, '4/4', {
        octave,
        sound: lp.sound,
        gainRange: [0.45, 0.65],
        scaleTokensInKey: true,
      });
      parts.push({ expr: bound.expr, pitched: true });
      bars = Math.max(bars, (lp.rhythm.bars ?? 1), hc.harmony.length);
      if (!harmonyBed && (lp.role === 'chords' || lp.role === 'bass')) harmonyBed = 'row';
    } else if (dr) {
      const spec = JSON.stringify({
        onsets: dr.onsets,
        sounds: dr.sounds ?? dr.onsets.map(() => dr.sound ?? 'md_stick'),
        bpm,
        bars: dr.bars ?? 1,
      });
      const r = renderRhythmOnsets(spec);
      parts.push(r.parts[0]);
      bars = Math.max(bars, dr.bars ?? 1);
    } else {
      throw new Error(`unknown library row "${name}" (not in LAYER_PATTERNS or RHYTHMS)`);
    }
  }
  // a stack with no harmony-carrying row gets a whisper root pedal for context
  const firstLp = names.map((n) => LAYER_PATTERNS[n]).find(Boolean);
  if (!harmonyBed && firstLp) {
    const hc = reelHarmonyContext(firstLp.reel);
    if (hc) {
      const flats = keyUsesFlats(hc.key);
      const tpc = tonicPc(hc.key.split(':')[0]);
      const toks = parseDegrees(REEL_PROGRESSIONS[Object.keys(REEL_PROGRESSIONS).find((k) => REEL_PROGRESSIONS[k].reel === firstLp.reel)].degrees);
      const bassBars = toks.map((t) => `[${miniPitch(24 + ((tpc + t.semis) % 12), flats)}]`);
      parts.push({ expr: `note("<${bassBars.join(' ')}>").s("gm_synth_bass_1").gain(0.3)`, pitched: true });
    }
  }
  return { parts, bars, bpm, tpc };
}

function renderFigureKind(specJson) {
  const spec = JSON.parse(specJson);
  const { figure, onsets, bpm = 110, octave = 3, sound = 'piano' } = spec;
  if (!Array.isArray(figure) || !Array.isArray(onsets)) throw new Error('figure kind needs figure[] + onsets[]');
  const accents = spec.accents ?? onsets.map((_, i) => (i === 0 ? 0.85 : 0.65));
  const h = spec.harmony ?? { degrees: '0:m7 8:^7 10:^7 5:m7', family: 'minor', tonic: 'C' };
  const flats = keyUsesFlats(`${h.tonic}:${h.family}`);
  const tpc = tonicPc(h.tonic);
  const harmony = parseDegrees(h.degrees).map((t) => symbolFor((tpc + t.semis) % 12, t.quality, flats));
  const onsetVals = onsets.map((o) => {
    const [n, d] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
    return n / d;
  });
  const bars = spec.bars ?? Math.max(1, Math.floor(Math.max(...onsetVals) + 1e-9) + 1);
  const bound = bindFigure(
    { name: 'catalog_fig', figure, onsets, accents, bars },
    { harmony, barsPerChord: 1, key: `${h.tonic}:${h.family}` },
    '4/4',
    { octave, sound, gainRange: [0.45, 0.65], scaleTokensInKey: true },
  );
  return {
    parts: [{ expr: bound.expr, pitched: true }],
    bars: Math.max(bars, harmony.length),
    bpm,
    tpc,
    mode: h.family === 'major' ? 'major' : 'minor',
  };
}

function renderCandidate(c) {
  const { kind, spec } = c.render ?? {};
  switch (kind) {
    case 'degrees': return renderDegrees(spec);
    case 'note_mini': return renderNoteMini(spec);
    case 'stack_mini': return renderStackMini(spec);
    case 'rhythm_onsets': return renderRhythmOnsets(spec);
    case 'library_rows': return renderLibraryRows(spec);
    case 'figure': return renderFigureKind(spec);
    default: throw new Error(`unknown render kind "${kind}"`);
  }
}

// ---------------------------------------------------------------------------
// Build + verify every candidate
// ---------------------------------------------------------------------------
const TYPE_ORDER = ['harmony', 'melody_pattern', 'accomp_pattern', 'rhythm', 'instrument_for_vibe', 'instrument_combo', 'device'];
const CONF_ORDER = { high: 0, medium: 1, low: 2 };

// HIS RULE (batch-1 labels): "for piano samples, it shouldn't show other main
// piano add-ons because they'll almost always contradict." A candidate is
// piano-MAIN when its dominant pitched voice is piano-family AND it carries
// harmony (a full chord bed, or a measurably chordal comp). Melodic
// piano-family lines are exempt — he liked reflection_duet and the layerstack
// motor, and his negatives/ignores were all chordal (every other harmony
// card, shop_bounce, gijoe, jazz_walk). Measured from the evaluated haps,
// never from a name list.
const PIANO_FAMILY = new Set(['piano', 'gm_epiano1']);
function pianoMainOf(c, haps) {
  if (c.type === 'melody_pattern' || c.type === 'rhythm') return false;
  const pitched = haps.filter((h) => h.value?.note != null);
  if (!pitched.length) return false;
  const fam = pitched.filter((h) => PIANO_FAMILY.has(h.value.s));
  if (fam.length <= pitched.length * 0.5) return false;
  if (c.type === 'harmony') return true;
  // chordality: share of the piano-family voice's attack instants striking
  // two or more notes at once
  const byT = new Map();
  for (const h of fam) {
    const t = Number(h.whole?.begin ?? h.part.begin).toFixed(5);
    byT.set(t, (byT.get(t) || 0) + 1);
  }
  const insts = [...byT.values()];
  if (insts.filter((n) => n >= 2).length / insts.length >= 0.4) return true;
  // a rolled two-hand accompaniment is main piano too: piano-family material
  // reaching from the bass register across 2+ octaves (nocturne-bed shape) —
  // single melodic piano lines stay exempt
  const NOTE_PC_L = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const midis = fam.map((h) => {
    const v = h.value.note;
    if (typeof v === 'number') return v;
    const m = /^([a-g])([#b]*)(-?\d+)$/.exec(String(v).toLowerCase());
    if (!m) return null;
    let pc = NOTE_PC_L[m[1]];
    for (const ch of m[2]) pc += ch === '#' ? 1 : -1;
    return pc + (Number(m[3]) + 1) * 12;
  }).filter((x) => x != null);
  if (!midis.length) return false;
  const lo = Math.min(...midis);
  return lo < 48 && Math.max(...midis) - lo >= 24;
}

const built = [];
const rejected = [];
for (const c of Object.values(CATALOG_CANDIDATES)) {
  try {
    const r = renderCandidate(c);
    // A candidate-level key_tonic (the key its mini was AUTHORED in — reel
    // renders inherit their progression's key, the rest are documented in the
    // entry's own prose) beats the renderer's inference. tonicPc throws on a
    // bad tonic, so a typo rejects the candidate loudly instead of silently
    // mistransposing every pair it joins.
    const tpc = c.key_tonic != null ? tonicPc(c.key_tonic) : r.tpc;
    // pitched/unpitched halves stored separately so the page can transpose a
    // ticked partner's pitched material into the current card's key without
    // repitching its drum samples. The verified solo code is assembled from
    // the SAME halves the client stacks, so they cannot drift.
    const pitch = r.parts.filter((p) => p.pitched).map((p) => p.expr).join(', ');
    const drums = r.parts.filter((p) => !p.pitched).map((p) => p.expr).join(', ');
    const body = [pitch && `stack(${pitch})`, drums && `stack(${drums})`].filter(Boolean).join(', ');
    if (!body) throw new Error('rendered to zero parts');
    const code = `setcpm(${r.bpm}/4)\np: stack(${body})`;
    const ev = await evaluateSong(code);
    const entry = hapsByLabel(ev, 0, Math.max(2, r.bars)).get('p');
    const n = entry ? entry.haps.length : 0;
    if (!n) { rejected.push(`${c.id}: evaluated to 0 haps`); continue; }
    // mode: candidate-level key_mode beats the renderer's family inference
    const mode = c.key_mode ?? r.mode ?? null;
    // realized pitch-class histogram — drives the page's measured best-seat
    // transposition (a pattern's own chromatics decide its best diatonic seat)
    const pcs = Array(12).fill(0);
    const PC_L = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    for (const h of entry.haps) {
      const v = h.value?.note;
      if (v == null) continue;
      let midi = null;
      if (typeof v === 'number') midi = v;
      else {
        const m = /^([a-g])([#b]*)(-?\d+)$/.exec(String(v).toLowerCase());
        if (m) {
          let pc = PC_L[m[1]];
          for (const ch of m[2]) pc += ch === '#' ? 1 : -1;
          midi = pc + (Number(m[3]) + 1) * 12;
        }
      }
      if (midi != null) pcs[((midi % 12) + 12) % 12] += 1;
    }
    // continuous = busy on most beats (his mixing law: continuous layers sit
    // in the background; sporadic ones may ride at normal add-on level)
    const instants = new Set(entry.haps.map((h) => Number(h.whole?.begin ?? h.part.begin).toFixed(5)));
    const cont = instants.size / Math.max(1, r.bars) >= 6;
    built.push({
      ...c, code, pitch, drums, cpm: r.bpm, tpc, mode, pcs, cont,
      // candidate-level piano_main overrides the measurement — for the cases
      // the heuristic misreads (e.g. a staggered UNISON echo of one line
      // co-attacks like a chord but is a melodic device, not a harmony bed)
      pianoMain: c.piano_main != null ? c.piano_main : pianoMainOf(c, entry.haps),
      again: c.addon_gain ?? 1,
      bars: r.bars, measuredHaps: n,
    });
  } catch (e) {
    rejected.push(`${c.id}: ${e && e.message ? e.message.split('\n')[0] : e}`);
  }
}

// queue order: BATCH first (later mining batches strictly APPEND, so his
// saved queue position and the numbering he has already seen never shift
// mid-labeling), then his-own-words, then confidence, then type variety
built.sort((a, b) => {
  const abatch = a.batch ?? 1;
  const bbatch = b.batch ?? 1;
  if (abatch !== bbatch) return abatch - bbatch;
  const aw = a.his_prior_words ? 0 : 1;
  const bw = b.his_prior_words ? 0 : 1;
  if (aw !== bw) return aw - bw;
  const ac = CONF_ORDER[a.confidence] ?? 1;
  const bc = CONF_ORDER[b.confidence] ?? 1;
  if (ac !== bc) return ac - bc;
  return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
});

// KEEP-TRANSITION LAW for pair ticks (D125 addendum, extended D127): a tick
// is a judgment under the rules live at the time, so each ticked pair pins
// ALL THREE combiner outputs — delta, gain, timeFx — to their judged values.
// Batch-1 ticks (the LEGACY set below) were judged under tonic-only mapping;
// every later tick was judged under the current mode-aware/best-seat rule,
// so its pin records what THAT rule produces today. No future rule change
// can move an approved combination.
const byIdB = Object.fromEntries(built.map((c) => [c.id, c]));
const nearestD = (x) => { let d = x % 12; if (d > 6) d -= 12; if (d < -6) d += 12; return d; };
// exact (card, partner) ticks from the batch-1 import (judged pre-D125-addendum)
const LEGACY_TONIC_ONLY = new Set([
  'cand_rl_r2_e_major_happy|cand_cw_airvoyage_pendulum',
  'cand_rl_r2_e_major_happy|cand_lp_r5_offbeat_pizz',
  'cand_rl_r2_e_major_happy|cand_cw_morning_hexarp',
  'cand_rl_r2_e_major_happy|cand_combo_pizz_onoff_bright',
  'cand_rl_r2_e_major_happy|cand_lp_r2_string_pluck_hole',
  'cand_rl_r2_e_major_happy|cand_lp_r1_onoff_pad',
  'cand_rl_r2_e_major_happy|cand_un_lofi_backbeat',
  'cand_rl_r2_e_major_happy|cand_un_indie_backbeat',
  'cand_rl_r2_e_major_happy|cand_vg_threed_horn_echo',
  'cand_rl_r3_circle_dotted|cand_combo_808_cluster_task',
  'cand_rl_r3_circle_dotted|cand_un_indie_backbeat',
  'cand_rl_r3_circle_dotted|cand_un_lofi_backbeat',
  'cand_rl_r3_circle_dotted|cand_lp_r3_catchy_pluck',
  'cand_rl_r3_circle_dotted|cand_cw_morning_hexarp',
  'cand_rl_r3_circle_dotted|cand_vg_magus_frozen_motor',
  'cand_rl_r3_circle_dotted|cand_lp_r1_onoff_pad',
]);
// builder-side replica of the client keyDelta (kept in lockstep)
function builderKeyDelta(cur, part) {
  if (cur.tpc == null || part.tpc == null) return 0;
  const cm = cur.mode;
  const pm = part.mode;
  const crossMode = (cm === 'major' || cm === 'minor') && (pm === 'major' || pm === 'minor') && cm !== pm;
  if (!crossMode) return nearestD(cur.tpc - part.tpc);
  const seats = pm === 'minor' ? [9, 2, 4] : [3, 8, 10];
  const scalePcs = cm === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const cands = seats.map((s) => nearestD((cur.tpc + s) % 12 - part.tpc));
  const total = part.pcs ? part.pcs.reduce((a, b) => a + b, 0) : 0;
  if (!total) return cands[0];
  const inScale = {};
  scalePcs.forEach((x) => { inScale[(x + cur.tpc) % 12] = 1; });
  let best = cands[0];
  let bestScore = -1;
  cands.forEach((k) => {
    let hit = 0;
    for (let pc = 0; pc < 12; pc++) if (inScale[(pc + k + 24) % 12]) hit += part.pcs[pc];
    const score = hit / total;
    if (score > bestScore + 1e-9) { bestScore = score; best = k; }
  });
  return best;
}
// r33/D129: a ticked pair's {d,g,t} is FROZEN at import time in
// CATALOG_PAIR_PINS (catalog-labels.js) — the value the client actually
// played when he judged, note-corrected where his words named a change. The
// builder uses stored pins VERBATIM so no later rule or gain change can move
// an approved combo. The live formula below only covers a tick that somehow
// has no stored pin (it should not happen after an import; computeLivePin
// mirrors the client exactly, cont-0.7 base included — the old inline formula
// baked a flat 0.85 and would have pinned continuous partners 21% louder
// than he heard them).
const PIN_DELTA = {};
for (const [cardId, lab] of Object.entries(CATALOG_LABELS)) {
  const card = byIdB[cardId];
  if (!card || !Array.isArray(lab.pairs)) continue;
  for (const pid of lab.pairs) {
    const p = byIdB[pid];
    if (!p) continue;
    const stored = CATALOG_PAIR_PINS?.[cardId]?.[pid];
    (PIN_DELTA[cardId] ??= {})[pid] = stored
      ? { ...stored }
      : computeLivePin(card, p, { tonicOnly: LEGACY_TONIC_ONLY.has(`${cardId}|${pid}`) });
  }
}

const DATA = {
  built: new Date().toISOString().slice(0, 16).replace('T', ' '),
  round: CATALOG_META.round,
  pinDelta: PIN_DELTA,
  candidates: built.map((c) => ({
    id: c.id,
    type: c.type,
    source: c.source,
    why: c.why,
    his: c.his_prior_words || '',
    vibes: c.vibes ?? [],
    pairsGuess: c.pairs_with ?? [],
    code: c.code,
    pitch: c.pitch,
    drums: c.drums,
    cpm: c.cpm,
    tpc: c.tpc,
    mode: c.mode,
    pcs: c.pcs,
    cont: c.cont,
    pianoMain: c.pianoMain,
    again: c.again,
    bars: c.bars,
    scope: c.scope,
    question: c.question,
  })),
};

const TYPE_LABELS = {
  harmony: 'chord progression',
  rhythm: 'rhythm / groove',
  accomp_pattern: 'accompaniment pattern',
  melody_pattern: 'melody pattern',
  instrument_for_vibe: 'instrument for a vibe',
  instrument_combo: 'instrument combination',
  device: 'device / technique',
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r33 catalog — label what you like</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --good:#37b24d; --bad:#e03131; --meh:#f59f00; }
  * { box-sizing: border-box; }
  body { font: 14px/1.6 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:5px 12px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  main { padding:18px; max-width:1100px; margin:0 auto 90px; }
  .progress { height:6px; background:var(--line); border-radius:3px; margin:8px 0 0; overflow:hidden; }
  .progress i { display:block; height:100%; background:var(--accent); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:18px 20px; }
  .card.playing { border-color:var(--accent); }
  .typ { display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:.08em; padding:2px 8px; border-radius:10px; background:#26263a; color:#aab; }
  .t { font-size:17px; font-weight:700; margin:8px 0 2px; font-family: ui-monospace, Menlo, monospace; }
  .why { margin:8px 0; }
  .scope { margin:6px 0; color:var(--meh); font-size:13px; }
  .q { margin:6px 0; padding:6px 8px; border-left:3px solid var(--accent); background:#1e2233; font-size:13px; }
  .his { margin:8px 0; padding:7px 11px; background:rgba(76,110,245,.1); border-left:3px solid var(--accent); border-radius:0 5px 5px 0; font-size:13px; }
  .his b { color:#9db4ff; }
  .src { font-size:11.5px; color:#6f6f88; font-family: ui-monospace, Menlo, monospace; margin:4px 0 10px; }
  .play { font-size:16px; padding:9px 22px; background:#1a2436; border-color:#2f4468; }
  .play.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .verdicts { display:flex; gap:8px; margin:14px 0 4px; }
  .verdicts button.good.on { background:var(--good); border-color:var(--good); color:#fff; }
  .verdicts button.bad.on { background:var(--bad); border-color:var(--bad); color:#fff; }
  .verdicts button.meh.on { background:var(--meh); border-color:var(--meh); color:#111; }
  .notebox { width:100%; margin-top:10px; padding:7px 10px; font-size:13.5px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:5px; color:inherit; }
  .notebox::placeholder { opacity:.45; }
  .pairs { margin-top:12px; }
  .pairs .lbl { font-size:12.5px; color:var(--dim); }
  .pairwrap { display:flex; gap:16px; align-items:flex-start; margin-top:6px; }
  .playcol { flex:none; }
  .playcol .play { padding:16px 18px; line-height:1.5; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; flex:1; min-width:0; max-height:60vh; overflow-y:auto; align-content:flex-start; }
  @media (max-width: 900px) { .pairwrap { flex-direction:column; } .pnrows { width:100% !important; } }
  .chip { font-size:12px; padding:3px 9px; border-radius:11px; }
  .chip.sel { background:var(--good); border-color:var(--good); color:#fff; }
  .chip.guess { border-color:#5b74d8; }
  .chip .pn { margin-left:5px; opacity:.35; }
  .chip .pn:hover { opacity:1; }
  .chip.noted .pn { opacity:1; color:#ffd43b; }
  .pnrows { width:340px; flex:none; display:flex; flex-direction:column; gap:9px; max-height:60vh; overflow-y:auto; padding:8px 10px; background:rgba(255,255,255,.025); border:1px solid var(--line); border-radius:8px; }
  .pnrow { display:flex; flex-wrap:wrap; gap:4px 8px; align-items:center; }
  .pnwho { font-size:11px; color:var(--bad); border:1px solid currentColor; border-radius:9px; padding:0 6px; white-space:nowrap; }
  .pnwho.in { color:var(--good); }
  .pnid { font-size:11.5px; font-family:ui-monospace, Menlo, monospace; color:var(--dim); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pnrow input { flex:1 1 100%; padding:4px 8px; font-size:12.5px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .pnrow input::placeholder { opacity:.4; }
  .pnhint { font-size:12px; color:var(--dim); opacity:.7; }
  .chipfilter { width:100%; margin-top:6px; padding:4px 8px; font-size:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
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
  kbd { background:#26263a; border-radius:3px; padding:0 5px; font-size:11px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>r33 catalog — everything I like, for your labels</h1>
    <span class="dim" id="now">— press play —</span>
    <button id="stop">■ stop</button>
    <button id="viewtoggle">list view</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">one candidate at a time: play it, say if it sounds good, label what it contributes (your words), and tick which other candidates it pairs with. <kbd>space</kbd> play · <kbd>g</kbd> good · <kbd>x</kbd> no · <kbd>u</kbd> unsure · <kbd>←</kbd><kbd>→</kbd> move</span>
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
const LSV = 'motif-engine:catalog-r33-verdicts';
const LSL = 'motif-engine:catalog-r33-labels';
const LSP = 'motif-engine:catalog-r33-pairs';
const LSN = 'motif-engine:catalog-r33-pairnotes';
const LSI = 'motif-engine:catalog-r33-pos';
let verdicts = {}; let labels = {}; let pairs = {}; let pairNotes = {}; let pos = 0; let listMode = false;
try { verdicts = JSON.parse(localStorage.getItem(LSV) || '{}'); } catch {}
try { labels = JSON.parse(localStorage.getItem(LSL) || '{}'); } catch {}
try { pairs = JSON.parse(localStorage.getItem(LSP) || '{}'); } catch {}
try { pairNotes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
try { pos = Math.min(Number(localStorage.getItem(LSI) || 0), DATA.candidates.length - 1); } catch {}
// note rows opened via a chip's pencil but not yet typed into — kept in memory
// only, so an abandoned empty row disappears on the next visit
const noteOpen = {};
const known = {};
const byId = {};
DATA.candidates.forEach(function (c) { known[c.id] = 1; byId[c.id] = c; });
Object.keys(verdicts).forEach(function (k) { if (!known[k]) delete verdicts[k]; });
Object.keys(pairs).forEach(function (k) {
  if (!known[k]) { delete pairs[k]; return; }
  if (Array.isArray(pairs[k])) pairs[k] = pairs[k].filter(function (w) { return known[w]; });
});
Object.keys(pairNotes).forEach(function (k) {
  if (!known[k]) { delete pairNotes[k]; return; }
  Object.keys(pairNotes[k] || {}).forEach(function (w) { if (!known[w]) delete pairNotes[k][w]; });
});
const save = () => { try {
  localStorage.setItem(LSV, JSON.stringify(verdicts));
  localStorage.setItem(LSL, JSON.stringify(labels));
  localStorage.setItem(LSP, JSON.stringify(pairs));
  localStorage.setItem(LSN, JSON.stringify(pairNotes));
  localStorage.setItem(LSI, String(pos));
} catch {} };
let playing = null;
const $ = (id) => document.getElementById(id);
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; }); }

${RUNTIME_JS}

// HIS ASK: "if i turn one on, it should turn on for that song, synced with
// what's playing." A ticked pair chip JOINS the playing card's stack, under
// the card's own tempo grid. The partner's PITCHED half is transposed to the
// card's tonic (a cross-key pair should be heard as it would bind in one
// song, not as a key-mismatch rub); its drum half stacks untransposed (a
// note on a sample repitches it). Partners ride at 0.85x so the card being
// judged stays the reference level; .mul composes with authored gains (r33).
// KEY ALIGNMENT (his batch-1 ask, four cards: "sounds like wrong key, if
// aligned to key it sounds like it'd work"). Same/unknown mode maps tonic to
// tonic — always: a same-key partner's chromaticism is COLOR, never an error
// to relocate (an unconstrained best-fit scored a card against itself at +5).
// A cross-mode partner is the genuinely ambiguous case: it may seat on any
// diatonic root of the card's scale that carries its mode (minor on major:
// ii/iii/vi; major on minor: bIII/bVI/bVII). The seat is chosen by MEASURED
// fit — the partner's realized pitch-class histogram scored against the
// card's scale (a Dm7 pattern's own chromatics decide whether it sits best
// as ii, iii or vi of C). Ties keep the relative seat (listed first).
function nearestD(x) {
  let d = x % 12;
  if (d > 6) d -= 12;
  if (d < -6) d += 12;
  return d;
}
function keyDelta(cur, part) {
  if (cur.tpc == null || part.tpc == null) return 0;
  const cm = cur.mode, pm = part.mode;
  const crossMode = (cm === 'major' || cm === 'minor') && (pm === 'major' || pm === 'minor') && cm !== pm;
  if (!crossMode) return nearestD(cur.tpc - part.tpc);
  const seats = pm === 'minor' ? [9, 2, 4] : [3, 8, 10]; // relative seat first
  const scalePcs = cm === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const cands = seats.map(function (s) { return nearestD((cur.tpc + s) % 12 - part.tpc); });
  const total = part.pcs ? part.pcs.reduce(function (a, b) { return a + b; }, 0) : 0;
  if (!total) return cands[0];
  const inScale = {};
  scalePcs.forEach(function (x) { inScale[(x + cur.tpc) % 12] = 1; });
  let best = cands[0];
  let bestScore = -1;
  cands.forEach(function (k) {
    let hit = 0;
    for (let pc = 0; pc < 12; pc++) if (inScale[(pc + k + 24) % 12]) hit += part.pcs[pc];
    const score = hit / total;
    if (score > bestScore + 1e-9) { bestScore = score; best = k; }
  });
  return best;
}
function activePairs(c) {
  return (pairs[c.id] || []).filter(function (w) { return byId[w]; });
}
function comboCode(c) {
  const ids = activePairs(c);
  if (!ids.length) return c.code;
  // key reference = the playing card's tonic. A keyless card (pure rhythm)
  // borrows the FIRST keyed partner's tonic instead, so multiple pitched
  // partners agree with each other rather than clashing in their own
  // transcription keys.
  let ref = c;
  if (c.tpc == null) {
    const k = ids.map(function (id) { return byId[id]; }).find(function (o) { return o.tpc != null; });
    if (k) ref = k;
  }
  const parts = [];
  if (c.pitch) parts.push('stack(' + c.pitch + ')');
  if (c.drums) parts.push('stack(' + c.drums + ')');
  ids.forEach(function (id) {
    const o = byId[id];
    // a TICKED pair is pinned to the delta/gain/timeFx it was judged under
    // (keep-transition law — the verify fleet caught rule upgrades moving
    // ticked pairs, D125 addendum / D127)
    const pin = DATA.pinDelta && DATA.pinDelta[c.id] ? DATA.pinDelta[c.id][id] : null;
    var d, timeFx, g;
    if (pin) {
      d = pin.d; timeFx = pin.t; g = pin.g;
    } else {
      d = keyDelta(ref, o);
      // tempo fit (his "way too fast for the song what"): a partner authored
      // at roughly half the card's tempo or slower halves its rate.
      // SLOW-DIRECTION ONLY (D125 addendum).
      const tr = c.cpm / o.cpm;
      timeFx = tr >= 1.75 ? '.slow(2)' : '';
      // 0.85 base x his per-candidate loudness reading, and a CONTINUOUS
      // add-on (busy, always sounding) sits further back than a sporadic one
      // — his mixing law: "some layers should be softer... if it's continuous
      // whereas sporadic ones are fine at a normal (not lead) dynamic"
      const base = o.cont && (o.again || 1) === 1 ? 0.7 : 0.85;
      g = Math.round(base * (o.again || 1) * 1000) / 1000;
    }
    if (o.pitch) parts.push('stack(' + o.pitch + ')' + (d ? '.add(note(' + d + '))' : '') + timeFx + '.mul(gain(' + g + '))');
    if (o.drums) parts.push('stack(' + o.drums + ')' + timeFx + '.mul(gain(' + g + '))');
  });
  return 'setcpm(' + c.cpm + '/4)\\np: stack(' + parts.join(', ') + ')';
}
async function play(id) {
  const c = DATA.candidates.find(function (x) { return x.id === id; });
  if (!c) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(comboCode(c));
  if (!ok) { playing = null; render(); return; }
  playing = id;
  const n = activePairs(c).length;
  $('now').textContent = '\\u25b6 ' + c.id + (n ? ' + ' + n + ' ticked pair' + (n > 1 ? 's' : '') : '');
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }

const TYPE_LABELS = ${JSON.stringify(TYPE_LABELS)};

function chipRow(c) {
  const sel = pairs[c.id] || [];
  const notes = pairNotes[c.id] || {};
  const filterId = 'pf_' + c.id;
  const others = DATA.candidates.filter(function (o) { return o.id !== c.id; });
  // every ticked partner gets a note row (why it's IN); the pencil on any
  // chip opens a row without ticking (why it's OUT) — his ask: "notes for
  // each individual one for why i included or didnt include it"
  const noteRows = others.filter(function (o) {
    return sel.indexOf(o.id) > -1 || (notes[o.id] || '').trim() || noteOpen[c.id + '|' + o.id];
  });
  return '<div class="pairs"><span class="lbl">sounds good together with (tick any \\u2014 my guesses have a blue edge). While this card plays, a tick ADDS that candidate to the mix, in key and in time; untick to drop it. The \\u270e on a chip opens a note for why that one is in or out:</span>'
    + '<input class="chipfilter" id="' + filterId + '" data-pf="' + esc(c.id) + '" placeholder="filter\\u2026">'
    + '<div class="pairwrap">'
    + '<div class="playcol"><button class="play' + (playing === c.id ? ' on' : '') + '" data-play="' + esc(c.id) + '">\\u25b6<br>play</button></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="chips" data-chips="' + esc(c.id) + '">'
    + others.filter(function (o) {
        // HIS RULE: a piano-main card never offers another piano-main add-on
        // (a second main piano almost always contradicts) — unless he ticked it
        return !(c.pianoMain && o.pianoMain && sel.indexOf(o.id) === -1);
      }).map(function (o) {
        const on = sel.indexOf(o.id) > -1;
        const guess = (c.pairsGuess || []).indexOf(o.id) > -1;
        const noted = (notes[o.id] || '').trim();
        return '<button class="chip' + (on ? ' sel' : '') + (guess ? ' guess' : '') + (noted ? ' noted' : '') + '" data-pair="' + esc(c.id) + '" data-with="' + esc(o.id) + '" title="' + esc(o.why) + '">' + esc(o.id.replace(/^cand_/, ''))
          + '<span class="pn" data-notefor="' + esc(c.id) + '" data-notewith="' + esc(o.id) + '" title="note why this one is in or out (does not tick it)">\\u270e</span></button>';
      }).join('')
    + '</div>'
    + (function () {
        if (!c.pianoMain) return '';
        const hid = others.filter(function (o) { return o.pianoMain && sel.indexOf(o.id) === -1; }).length;
        return hid ? '<div class="dim" style="font-size:11.5px;margin-top:5px">' + hid + ' main-piano add-ons hidden \\u2014 a second main piano contradicts this card (your rule)</div>' : '';
      })()
    + '</div>'
    + '<div class="pnrows" data-pnrows="' + esc(c.id) + '">'
    + (noteRows.length ? noteRows.map(function (o) {
        const on = sel.indexOf(o.id) > -1;
        return '<div class="pnrow"><span class="pnwho' + (on ? ' in' : '') + '">' + (on ? '\\u2713 in' : '\\u2717 out') + '</span>'
          + '<span class="pnid">' + esc(o.id.replace(/^cand_/, '')) + '</span>'
          + '<input id="pi_' + esc(c.id) + '__' + esc(o.id) + '" data-pn="' + esc(c.id) + '" data-pw="' + esc(o.id) + '" placeholder="why ' + (on ? 'this works here' : 'you left this one out') + ' \\u2014 your words" value="' + esc(notes[o.id] || '') + '"></div>';
      }).join('') : '<span class="pnhint">notes live here \\u2014 tick a chip, or click a chip\\u2019s \\u270e, and its why-in / why-out line appears</span>')
    + '</div>'
    + '</div>'
    + '</div>';
}

function cardHTML(c, i) {
  const v = verdicts[c.id];
  return '<div class="card' + (playing === c.id ? ' playing' : '') + '" data-card="' + esc(c.id) + '">'
    + '<span class="typ">' + esc(TYPE_LABELS[c.type] || c.type) + '</span>'
    + ' <span class="dim">' + (i + 1) + ' / ' + DATA.candidates.length + '</span>'
    + '<div class="t">' + esc(c.id) + '</div>'
    + '<div class="src">' + esc(c.source) + '</div>'
    + '<div class="why">' + esc(c.why) + '</div>'
    + (c.his ? '<div class="his"><b>you said:</b> ' + esc(c.his) + '</div>' : '')
    + (c.scope ? '<div class="scope"><b>claimed scope:</b> ' + esc(c.scope) + '</div>' : '')
    + (c.question ? '<div class="q"><b>Q for you:</b> ' + esc(c.question) + '</div>' : '')
    + (c.vibes.length ? '<div class="dim">plausible vibes: ' + esc(c.vibes.join(' \\u00b7 ')) + '</div>' : '')
    + '<div class="verdicts">'
    + '<button class="good' + (v === 'good' ? ' on' : '') + '" data-v="good" data-c="' + esc(c.id) + '">sounds good</button>'
    + '<button class="bad' + (v === 'no' ? ' on' : '') + '" data-v="no" data-c="' + esc(c.id) + '">not for me</button>'
    + '<button class="meh' + (v === 'unsure' ? ' on' : '') + '" data-v="unsure" data-c="' + esc(c.id) + '">unsure</button>'
    + '</div>'
    + '<input class="notebox" data-label="' + esc(c.id) + '" placeholder="what does this contribute? which prompts/vibes should it serve? your words" value="' + esc(labels[c.id] || '') + '">'
    + chipRow(c)
    + '</div>';
}

function idxHTML() {
  return '<div class="idx">' + DATA.candidates.map(function (c, i) {
    const v = verdicts[c.id];
    const cls = (v === 'good' ? 'done-good' : v === 'no' ? 'done-bad' : v === 'unsure' ? 'done-meh' : '') + (i === pos && !listMode ? ' cur' : '');
    return '<button class="' + cls + '" data-jump="' + i + '" title="' + esc(c.id) + '">' + (i + 1) + '</button>';
  }).join('') + '</div>';
}

function applyChipFilter(f) {
  const q = f.value.toLowerCase();
  const chips = document.querySelector('[data-chips="' + f.dataset.pf + '"]');
  if (chips) chips.querySelectorAll('.chip').forEach(function (ch) {
    ch.style.display = ch.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
  });
}
function render() {
  const main = $('main');
  if (!DATA.candidates.length) { main.innerHTML = '<p class="dim">no candidates built \\u2014 the mining round has not landed yet.</p>'; return; }
  // render replaces the DOM, which would reset every scroll position and
  // filter box — capture them (keyed per card, so navigation still starts a
  // fresh card at the top) and restore after the rebuild
  const winY = window.scrollY;
  const chipScroll = {};
  document.querySelectorAll('[data-chips]').forEach(function (el) { chipScroll[el.dataset.chips] = el.scrollTop; });
  const noteScroll = {};
  document.querySelectorAll('[data-pnrows]').forEach(function (el) { noteScroll[el.dataset.pnrows] = el.scrollTop; });
  const filterText = {};
  document.querySelectorAll('[data-pf]').forEach(function (el) { if (el.value) filterText[el.dataset.pf] = el.value; });
  if (listMode) {
    main.className = 'listview';
    main.innerHTML = idxHTML() + DATA.candidates.map(cardHTML).join('');
  } else {
    main.className = '';
    const c = DATA.candidates[pos];
    main.innerHTML = idxHTML() + cardHTML(c, pos)
      + '<div class="nav">'
      + '<button data-nav="-1">\\u2190 back</button>'
      + '<span class="spacer"></span>'
      + '<button data-nav="1">next \\u2192</button>'
      + '</div>';
  }
  document.querySelectorAll('[data-pf]').forEach(function (el) {
    if (filterText[el.dataset.pf]) { el.value = filterText[el.dataset.pf]; applyChipFilter(el); }
  });
  document.querySelectorAll('[data-chips]').forEach(function (el) {
    if (chipScroll[el.dataset.chips] != null) el.scrollTop = chipScroll[el.dataset.chips];
  });
  document.querySelectorAll('[data-pnrows]').forEach(function (el) {
    if (noteScroll[el.dataset.pnrows] != null) el.scrollTop = noteScroll[el.dataset.pnrows];
  });
  window.scrollTo(0, winY);
  const done = DATA.candidates.filter(function (c) { return verdicts[c.id] || (labels[c.id] || '').trim(); }).length;
  $('bar').style.width = (100 * done / DATA.candidates.length).toFixed(1) + '%';
  $('tally').textContent = done + ' of ' + DATA.candidates.length + ' labeled \\u00b7 built ' + DATA.built;
  $('viewtoggle').textContent = listMode ? 'one-by-one view' : 'list view';
}

$('main').addEventListener('click', function (ev) {
  const p = ev.target.closest('[data-play]');
  if (p) { play(p.dataset.play); return; }
  const j = ev.target.closest('[data-jump]');
  if (j) { pos = Number(j.dataset.jump); listMode = false; save(); render(); return; }
  const n = ev.target.closest('[data-nav]');
  if (n) { pos = Math.max(0, Math.min(DATA.candidates.length - 1, pos + Number(n.dataset.nav))); save(); render(); return; }
  // the pencil sits INSIDE the chip button — check it first so a note click
  // never toggles the tick
  const nf = ev.target.closest('[data-notefor]');
  if (nf) {
    noteOpen[nf.dataset.notefor + '|' + nf.dataset.notewith] = 1;
    render();
    const inp = document.getElementById('pi_' + nf.dataset.notefor + '__' + nf.dataset.notewith);
    if (inp) inp.focus();
    return;
  }
  const pr = ev.target.closest('[data-pair]');
  if (pr) {
    const id = pr.dataset.pair; const w = pr.dataset.with;
    const cur = Array.isArray(pairs[id]) ? pairs[id].slice() : [];
    const i = cur.indexOf(w);
    if (i > -1) cur.splice(i, 1); else cur.push(w);
    pairs[id] = cur; save();
    // ticking while this card plays swaps the combo in live, on its grid
    if (playing === id) { play(id); return; }
    render(); return;
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
  const pn = ev.target.closest('[data-pn]');
  if (pn) {
    if (!pairNotes[pn.dataset.pn]) pairNotes[pn.dataset.pn] = {};
    pairNotes[pn.dataset.pn][pn.dataset.pw] = pn.value;
    save(); return;
  }
  const f = ev.target.closest('[data-pf]');
  if (f) applyChipFilter(f);
});
$('main').addEventListener('keydown', function (ev) { if (ev.target.closest('input')) ev.stopPropagation(); });
$('stop').onclick = stop;
$('viewtoggle').onclick = function () { listMode = !listMode; render(); };
document.addEventListener('keydown', function (ev) {
  if (ev.target.closest('input')) return;
  if (ev.key === 'Escape') { stop(); return; }
  if (listMode) return;
  const c = DATA.candidates[pos];
  if (!c) return;
  if (ev.key === ' ') { ev.preventDefault(); if (playing === c.id) stop(); else play(c.id); }
  if (ev.key === 'g') { verdicts[c.id] = 'good'; save(); render(); }
  if (ev.key === 'x') { verdicts[c.id] = 'no'; save(); render(); }
  if (ev.key === 'u') { verdicts[c.id] = 'unsure'; save(); render(); }
  if (ev.key === 'ArrowRight') { pos = Math.min(DATA.candidates.length - 1, pos + 1); save(); render(); }
  if (ev.key === 'ArrowLeft') { pos = Math.max(0, pos - 1); save(); render(); }
});
$('export').onclick = function () {
  const out = {
    page: 'catalog-r33', generated: new Date().toISOString(),
    verdicts: verdicts,
    labels: Object.fromEntries(Object.entries(labels).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    pairs: Object.fromEntries(Object.entries(pairs).filter(function (kv) { return kv[1] && kv[1].length; })),
    pair_notes: (function () {
      const out = {};
      Object.keys(pairNotes).forEach(function (cid) {
        const m = {};
        Object.keys(pairNotes[cid] || {}).forEach(function (w) {
          if ((pairNotes[cid][w] || '').trim()) m[w] = pairNotes[cid][w].trim();
        });
        if (Object.keys(m).length) out[cid] = m;
      });
      return out;
    })(),
    unseen: DATA.candidates.filter(function (c) { return !verdicts[c.id] && !(labels[c.id] || '').trim(); }).map(function (c) { return c.id; }),
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
console.log(`  ${built.length} candidates built and verified (of ${Object.keys(CATALOG_CANDIDATES).length})`);
if (rejected.length) console.log(`  REJECTED at build:\n    ${rejected.join('\n    ')}`);
