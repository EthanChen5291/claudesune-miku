// The binder (§3.4): rhythm entry × contour entry × harmonic context → a labeled
// layer's expression. Rules (D13/D14):
//   - contour degrees land on onsets
//   - accented onsets (accent ≥ 0.7) snap to the nearest chord tone of the chord
//     sounding AT THAT ONSET (per cycle over the harmony period)
//   - weak onsets keep their diatonic scale tone (deterministic passing policy)
//   - accents ALWAYS wire to .gain(); swing to .swingBy(); a uniform-velocity
//     rhythm is a bug, not a style
//   - cadence targets override the final onset of the phrase
// Output is a resolved note("<[...]...>") grid + boundMeta for motif assertions.

import { noteToMidi } from '@strudel/core';
import { parseKey, degreeToMidi, midiToNoteName, snapToPcs, applyTransform, contourSigns } from './theory.js';
import { chordTones, chordRootPc } from '../harness/chords.js';

const MAX_GRID = 96;
export const ACCENT_THRESHOLD = 0.7;
const DEFAULT_GAIN_RANGE = [0.35, 1.0];

// ---------------------------------------------------------------------------
// Fractions (exact, small): [num, den] normalized
// ---------------------------------------------------------------------------
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function lcm(a, b) { return a / gcd(a, b) * b; }

export function toFrac(x) {
  if (Array.isArray(x)) return norm(x[0], x[1]);
  if (typeof x === 'string' && x.includes('/')) {
    const [n, d] = x.split('/').map(Number);
    return norm(n, d);
  }
  const v = Number(x);
  for (const den of [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96]) {
    const n = v * den;
    if (Math.abs(n - Math.round(n)) < 1e-9) return norm(Math.round(n), den);
  }
  throw new Error(`onset ${x} not representable on a grid ≤ ${MAX_GRID}`);
}
function norm(n, d) { const g = gcd(Math.abs(n), Math.abs(d)) || 1; return [n / g, d / g]; }

// ---------------------------------------------------------------------------
// Rhythm entries
// ---------------------------------------------------------------------------

/** True Bjorklund euclidean onsets (matches Strudel's .euclid): k hits over n steps. */
export function euclidOnsets(k, n, rot = 0) {
  if (k <= 0 || n <= 0 || k > n) throw new Error(`bad euclid [${k},${n}]`);
  let a = Array.from({ length: k }, () => [1]);
  let b = Array.from({ length: n - k }, () => [0]);
  while (b.length > 1) {
    const m = Math.min(a.length, b.length);
    const na = [], nb = [];
    for (let i = 0; i < m; i++) na.push([...a[i], ...b[i]]);
    if (a.length > m) nb.push(...a.slice(m));
    else nb.push(...b.slice(m));
    a = na; b = nb;
  }
  const bits = [...a.flat(), ...b.flat()];
  const onsets = [];
  bits.forEach((bit, i) => { if (bit) onsets.push(i); });
  return onsets.map((i) => norm(((i - rot) % n + n) % n, n)).sort((x, y) => x[0] / x[1] - y[0] / y[1]);
}

/** Normalize a rhythm entry -> { onsets: [[n,d]...], accents: [...], swing, swingSubdiv, microtiming } */
export function normalizeRhythm(entry) {
  let onsets;
  if (entry.euclid) {
    const [k, n, rot = 0] = entry.euclid;
    onsets = euclidOnsets(k, n, rot);
  } else if (entry.onsets) {
    onsets = entry.onsets.map(toFrac);
  } else {
    throw new Error('rhythm entry needs onsets[] or euclid[k,n,rot]');
  }
  const count = onsets.length;
  let accents = entry.accents;
  if (!accents || accents.length !== count) {
    throw new Error(`rhythm entry must carry a real accent profile (${count} onsets, got ${accents ? accents.length : 0} accents) — uniform velocity is a bug (§3.4)`);
  }
  if (entry.microtiming && entry.microtiming.length === count) {
    onsets = onsets.map((f, i) => {
      const shift = toFrac(entry.microtiming[i] ?? 0);
      return norm(f[0] * shift[1] + shift[0] * f[1], f[1] * shift[1]);
    });
  }
  return { onsets, accents: accents.slice(), swing: entry.swing ?? 0, swingSubdiv: entry.swingSubdiv ?? null, name: entry.name ?? null };
}

function gridSize(onsets) {
  let g = 1;
  for (const [, d] of onsets) g = lcm(g, d);
  if (g > MAX_GRID) throw new Error(`rhythm needs grid ${g} > ${MAX_GRID}`);
  // musical readability: pad tiny grids up to at least 4 steps
  while (g < 4) g *= 2;
  return g;
}

// ---------------------------------------------------------------------------
// bind()
// ---------------------------------------------------------------------------

/**
 * bind(rhythmEntry, contourEntry, harmonyContext, meter, opts) -> { expr, period, boundMeta, warnings }
 *
 * harmonyContext: { harmony: [symbols], barsPerChord, key: "F:minor" } (harmony may be null)
 * contourEntry:   { degrees: [...] } or null (percussive bind: opts.sound gives the hit)
 * opts: { octave=4, sound=null, fx='', gainRange, cadence=null, transform=null,
 *         legato=(melodic?true:false), motifName=null, rhythmName=null }
 */
export function bind(rhythmEntry, contourEntry, harmonyContext, meter = '4/4', opts = {}) {
  const warnings = [];
  const archetype = opts.archetype ?? null; // bass archetypes (interval-grammar §3): anchor|pulse|pedal|alternating
  if (archetype && !['anchor', 'pulse', 'pedal', 'alternating'].includes(archetype)) {
    throw new Error(`unsupported bass archetype "${archetype}" (derived: anchor, pulse, pedal, alternating; walking/riff are fused library entries)`);
  }
  if (archetype && !harmonyContext?.harmony?.length) throw new Error(`archetype "${archetype}" needs a harmony context`);
  if (archetype === 'anchor' && !rhythmEntry) rhythmEntry = { onsets: ['0'], accents: [0.9], name: 'derived:anchor' };
  if (!rhythmEntry) throw new Error('rhythm entry required (only the anchor archetype derives its own onsets)');
  const r = normalizeRhythm(rhythmEntry);
  const G = gridSize(r.onsets);
  const melodic = contourEntry != null || archetype != null;
  const {
    octave = 4, sound = null, fx = '', gainRange = DEFAULT_GAIN_RANGE,
    cadence = null, transform = null, motifName = null, rhythmName = rhythmEntry.name ?? null,
    legato = melodic,
  } = opts;

  // steps: index on grid per onset
  const steps = r.onsets.map(([n, d]) => {
    const s = (n * G) / d;
    if (!Number.isInteger(s)) throw new Error(`internal: onset ${n}/${d} off grid ${G}`);
    return s;
  });
  for (let i = 1; i < steps.length; i++) {
    if (steps[i] <= steps[i - 1]) throw new Error('rhythm onsets must be strictly increasing within the cycle');
  }

  // harmony period & per-cycle chords
  const harmony = harmonyContext?.harmony ?? null;
  const barsPerChord = harmonyContext?.barsPerChord ?? 1;
  const period = melodic && harmony?.length ? harmony.length * barsPerChord : 1;
  const chordOfCycle = (c) => (harmony?.length ? harmony[Math.floor(c / barsPerChord) % harmony.length] : null);

  // degrees (transformed) — archetype binds derive pitches from harmony instead
  let degrees = null;
  let key = null;
  if (melodic) {
    key = parseKey(harmonyContext?.key ?? 'C:major');
    if (!archetype) {
      degrees = applyTransform(contourEntry.degrees, transform, key.intervals.length);
      if (degrees.length !== steps.length) {
        // contour and rhythm lengths may differ: cycle the contour across onsets (documented)
        warnings.push(`contour has ${degrees.length} degrees for ${steps.length} onsets — cycling contour`);
      }
    }
  }

  // per-cycle note grids
  const flats = /b|m|dim|F|Bb|Eb|Ab|Db|Gb/.test(harmonyContext?.key ?? '');
  const rootMidi = melodic ? noteToMidi(key.rootName.toUpperCase().replace(/^([A-G])B$/, '$1b') + String(octave)) : null;
  const cycles = [];
  const boundNotes = [];
  for (let c = 0; c < period; c++) {
    const sym = chordOfCycle(c);
    const pcs = sym ? chordTones(sym) : null;
    if (sym && (!pcs || pcs.size === 0)) warnings.push(`unknown chord "${sym}" — no snapping applied in cycle ${c}`);
    if (archetype === 'anchor' && c % barsPerChord !== 0) { cycles.push(steps.map(() => null)); continue; }
    const notes = [];
    for (let i = 0; i < steps.length; i++) {
      if (!melodic) { notes.push(sound); continue; }
      if (archetype) {
        const baseC = noteToMidi('C' + String(octave));
        const rootSym = archetype === 'pedal' ? harmony[0] : sym;
        const rootPc = chordRootPc(rootSym) ?? key.rootPc;
        const rootMidiA = baseC + ((rootPc - baseC % 12) + 12) % 12;
        let midi = rootMidiA;
        if (archetype === 'alternating' && i > 0 && i % 2 === 1) midi = rootMidiA + 7; // root–5th; beat 1 = root, non-negotiable
        const name = midiToNoteName(midi, { flats });
        notes.push(name);
        boundNotes.push({ cycle: c, step: steps[i], t: fracStr(steps[i], G), note: name, midi, accented: r.accents[i] >= ACCENT_THRESHOLD, degree: null });
        continue;
      }
      // global index: the contour continues ACROSS cycles, so a contour longer
      // than one cycle's onsets unfolds as a multi-cycle phrase instead of truncating
      const deg = degrees[(c * steps.length + i) % degrees.length];
      let midi = degreeToMidi(deg, rootMidi, key.intervals);
      const accented = r.accents[i] >= ACCENT_THRESHOLD;
      if (accented && pcs?.size) midi = snapToPcs(midi, pcs);
      // cadence: final onset of the whole phrase
      if (cadence && c === period - 1 && i === steps.length - 1) {
        const targetPc = cadence === 'tonic' ? key.rootPc : sym ? chordRootPc(sym) : key.rootPc;
        if (targetPc != null) midi = snapToPcs(midi, new Set([targetPc]));
      }
      const name = midiToNoteName(midi, { flats });
      notes.push(name);
      boundNotes.push({ cycle: c, step: steps[i], t: fracStr(steps[i], G), note: name, midi, accented, degree: deg });
    }
    cycles.push(notes);
  }

  // token emission with legato (@k extends to next onset)
  const gainVals = r.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));
  const noteCycles = cycles.map((notes) => tokens(steps, notes.map((n) => n ?? '~'), G, { legato }));
  const gainCycle = tokens(steps, gainVals.map(String), G, { legato: true, fillLeading: String(gainVals[0]) });

  const noteBody = period === 1 ? noteCycles[0] : `<${noteCycles.map((t) => `[${t}]`).join(' ')}>`;
  const headFn = melodic ? 'note' : 's';
  let expr = `${headFn}("${period === 1 && !melodic ? noteCycles[0] : noteBody}")`;
  if (period === 1 && melodic) expr = `${headFn}("${noteCycles[0]}")`;
  if (melodic && sound) expr += `.s("${sound}")`;
  expr += `.gain("${gainCycle}")`;
  if (r.swing) expr += `.swingBy(${r.swing}, ${r.swingSubdiv ?? defaultSubdiv(meter)})`;
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: motifName,
    rhythm: rhythmName,
    archetype,
    transform: transform ?? null,
    degrees: melodic ? degrees : null,
    contourSignsExpected: melodic && degrees ? contourSigns(degrees) : null,
    onsets: r.onsets.map(([n, d]) => `${n}/${d}`),
    accents: r.accents,
    gains: gainVals,
    swing: r.swing || 0,
    period,
    notes: melodic ? boundNotes : null,
    cadence: cadence ?? null,
  };
  return { expr, period, boundMeta, warnings };
}

function tokens(steps, values, G, { legato, fillLeading = null } = {}) {
  const toks = [];
  if (steps[0] > 0) toks.push(fillLeading != null ? at(fillLeading, steps[0]) : at('~', steps[0]));
  for (let i = 0; i < steps.length; i++) {
    const next = i + 1 < steps.length ? steps[i + 1] : G;
    const gap = next - steps[i];
    if (legato) {
      toks.push(at(values[i], gap));
    } else {
      toks.push(values[i]);
      if (gap > 1) toks.push(at('~', gap - 1));
    }
  }
  return toks.join(' ');
}
function at(v, k) { return k === 1 ? String(v) : `${v}@${k}`; }
// swingBy(x, n) slices the cycle into n windows and delays each window's second
// half — so n = beats per bar swings the OFFBEAT 8ths (verified at 1.1.0).
function defaultSubdiv(meter) { return Number(String(meter).split('/')[0]); }
function fracStr(step, G) { const g = gcd(step || G, G); return step === 0 ? '0' : `${step / g}/${G / g}`; }
function round2(x) { return Math.round(x * 100) / 100; }
