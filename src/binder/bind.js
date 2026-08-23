// The binder (§3.4): rhythm entry × contour entry × harmonic context → a labeled
// layer's expression. Rules (D13/D14/D26):
//   - contour degrees land on MAIN onsets; 'bounce' onsets (rhythm.voices) get a
//     light low root to bounce off (Ethan's audition round 1)
//   - contour realization is SHAPE-PRESERVING (D26): a contour that doesn't fit
//     the onset count is resampled (extrema kept) or unfolded as a slow line —
//     never blindly cycled (cycling smeared arch_classic et al. in audition)
//   - accented onsets (accent ≥ 0.7) snap to the nearest chord tone of the chord
//     sounding AT THAT ONSET (per cycle over the harmony period); explicitly
//     ALTERED degrees ('b5') are exempt — the alteration is the point
//   - weak onsets keep their diatonic scale tone (deterministic passing policy)
//   - accents ALWAYS wire to .gain(); swing to .swingBy(); a uniform-velocity
//     rhythm is a bug, not a style
//   - rhythms may span multiple bars (entry.bars, onsets in bar units [0, bars))
//   - cadence targets override the final onset of the phrase
// Output is a resolved note("<[...]...>") grid + boundMeta for motif assertions.

import { noteToMidi } from '@strudel/core';
import { parseKey, degreeToMidi, midiToNoteName, snapToPcs, applyTransform, contourSigns, keyUsesFlats, parseDegree, degreeValue, chordScale, chordCoreTones } from './theory.js';
import { chordTones, chordRootPc } from '../harness/chords.js';
import { MELODY_PROFILES, MOVE_STEPS } from '../lib/melody-profiles.js';

const MAX_GRID = 192;
export const ACCENT_THRESHOLD = 0.7;
const DEFAULT_GAIN_RANGE = [0.35, 1.0];
const MAX_PERIOD = 96;

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
  return onsets.map((i) => norm(((i + rot) % n + n) % n, n)).sort((x, y) => x[0] / x[1] - y[0] / y[1]);
}

/** Normalize a rhythm entry -> { onsets: [[n,d]...] (bar units, [0,bars)), accents,
 *  voices ('main'|'bounce' per onset), bars, swing, swingSubdiv, name } */
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
  const bars = Math.max(1, Math.floor(entry.bars ?? 1));
  const count = onsets.length;
  let accents = entry.accents;
  if (!accents || accents.length !== count) {
    throw new Error(`rhythm entry must carry a real accent profile (${count} onsets, got ${accents ? accents.length : 0} accents) — uniform velocity is a bug (§3.4)`);
  }
  let voices = entry.voices ?? onsets.map(() => 'main');
  if (voices.length !== count) throw new Error(`voices[] must match onsets (${count} onsets, ${voices.length} voices)`);
  for (const v of voices) if (v !== 'main' && v !== 'bounce') throw new Error(`voice "${v}" must be 'main' or 'bounce'`);
  for (const [n, d] of onsets) {
    if (n < 0 || n / d >= bars) throw new Error(`onset ${n}/${d} outside [0, bars=${bars}) — multi-bar onsets are in bar units`);
  }
  if (entry.microtiming && entry.microtiming.length === count) {
    // shift each onset, wrap into [0,bars) (a push past the last barline lands at
    // the top of the pattern — review finding: out-of-range shifts silently
    // corrupted the grid), and re-sort keeping accent+voice attached
    const paired = onsets.map((f, i) => {
      const shift = toFrac(entry.microtiming[i] ?? 0);
      let [n, d] = norm(f[0] * shift[1] + shift[0] * f[1], f[1] * shift[1]);
      const span = d * bars;
      n = ((n % span) + span) % span;
      return { onset: norm(n, d), accent: accents[i], voice: voices[i] };
    }).sort((a, b) => a.onset[0] / a.onset[1] - b.onset[0] / b.onset[1]);
    onsets = paired.map((p) => p.onset);
    accents = paired.map((p) => p.accent);
    voices = paired.map((p) => p.voice);
  }
  return { onsets, accents: accents.slice(), voices: voices.slice(), bars, swing: entry.swing ?? 0, swingSubdiv: entry.swingSubdiv ?? null, name: entry.name ?? null };
}

function gridSize(onsets) {
  let g = 1;
  for (const [, d] of onsets) g = lcm(g, d);
  if (g > MAX_GRID) throw new Error(`rhythm needs grid ${g} > ${MAX_GRID}`);
  // musical readability: pad tiny grids up to at least 4 steps
  while (g < 4) g *= 2;
  return g;
}

/** Split a normalized multi-bar rhythm into per-bar {onsets (local), accents, voices, steps, G}. */
function splitByBar(r) {
  const out = Array.from({ length: r.bars }, () => ({ onsets: [], accents: [], voices: [] }));
  r.onsets.forEach((f, i) => {
    const [n, d] = f;
    const b = Math.floor(n / d);
    out[b].onsets.push(norm(n - b * d, d));
    out[b].accents.push(r.accents[i]);
    out[b].voices.push(r.voices[i]);
  });
  for (const bar of out) {
    bar.G = gridSize(bar.onsets);
    bar.steps = bar.onsets.map(([n, d]) => {
      const s = (n * bar.G) / d;
      if (!Number.isInteger(s)) throw new Error(`internal: onset ${n}/${d} off grid ${bar.G}`);
      return s;
    });
    for (let i = 1; i < bar.steps.length; i++) {
      if (bar.steps[i] <= bar.steps[i - 1]) throw new Error('rhythm onsets must be strictly increasing');
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Contour realization (D26): fit the SHAPE to the rhythm, don't smear it
// ---------------------------------------------------------------------------

/** degreesParsed × S (main onsets per rhythm statement) -> { mode, k, seq } */
export function realizeContour(degreesParsed, S) {
  const L = degreesParsed.length;
  if (S <= 0) throw new Error('contour needs at least one main onset');
  if (L === S) return { mode: 'exact', k: 1, seq: degreesParsed };
  if (L % S === 0) return { mode: 'phrase', k: L / S, seq: degreesParsed };
  if (S % L === 0) return { mode: 'tiled', k: 1, seq: Array.from({ length: S }, (_, i) => degreesParsed[i % L]) };
  // a contour at least twice the onsets is a slow line by intent — unfold across
  // statements (old cycling). Anything closer would repeat-with-drift: resample.
  if (L >= 2 * S) return { mode: 'unfold', k: null, seq: degreesParsed };
  return { mode: 'resampled', k: 1, seq: resampleShape(degreesParsed, S) };
}

/** Shape-preserving resample: first/last/global-extrema always survive. */
export function resampleShape(parsed, S) {
  const L = parsed.length;
  if (S === 1) return [parsed[0]];
  if (S >= L) return Array.from({ length: S }, (_, j) => parsed[Math.round(j * (L - 1) / (S - 1))]);
  const val = (o) => degreeValue(o);
  let maxI = 0, minI = 0;
  parsed.forEach((o, i) => {
    if (val(o) > val(parsed[maxI])) maxI = i;
    if (val(o) < val(parsed[minI])) minI = i;
  });
  const chosen = new Set([0, L - 1]);
  for (const f of [maxI, minI]) if (chosen.size < S) chosen.add(f);
  while (chosen.size < S) {
    const sorted = [...chosen].sort((a, b) => a - b);
    let bestGap = 1, insert = -1;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1];
      if (gap > bestGap) { bestGap = gap; insert = Math.floor((sorted[i] + sorted[i - 1]) / 2); }
    }
    if (insert < 0) break;
    chosen.add(insert);
  }
  return [...chosen].sort((a, b) => a - b).map((i) => parsed[i]);
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
  const B = r.bars;
  const bars = splitByBar(r);
  const melodic = contourEntry != null || archetype != null;
  const {
    octave = 4, sound = null, fx = '', gainRange = DEFAULT_GAIN_RANGE,
    cadence = null, transform = null, motifName = null, rhythmName = rhythmEntry.name ?? null,
    legato = melodic,
  } = opts;

  // per-(bar, onset) main-slot index within one rhythm statement; -1 for bounce
  const mainIdx = [];
  let S = 0;
  for (const bar of bars) {
    mainIdx.push(bar.voices.map((v) => (v === 'main' ? S++ : -1)));
  }

  // harmony period & per-cycle chords
  const harmony = harmonyContext?.harmony ?? null;
  const barsPerChord = harmonyContext?.barsPerChord ?? 1;
  const harmonyPeriod = melodic && harmony?.length ? harmony.length * barsPerChord : 1;
  const chordOfCycle = (c) => (harmony?.length ? harmony[Math.floor(c / barsPerChord) % harmony.length] : null);

  // degrees (transformed) — archetype binds derive pitches from harmony instead
  let real = null;
  let key = null;
  if (melodic) {
    key = parseKey(harmonyContext?.key ?? 'C:major');
    if (!archetype) {
      if (S === 0) throw new Error('contour bind needs at least one main-voice onset');
      const raw = applyTransform(contourEntry.degrees, transform, key.intervals.length);
      real = realizeContour(raw.map(parseDegree), S);
      if (real.mode === 'resampled') {
        warnings.push(`contour has ${raw.length} degrees for ${S} main onsets — resampled shape-preserving (extrema kept)`);
      } else if (real.mode === 'unfold') {
        warnings.push(`contour has ${raw.length} degrees for ${S} main onsets — unfolding as a slow multi-statement line`);
      }
    }
  }

  let period = melodic ? lcm(harmonyPeriod, B) : B;
  if (real?.mode === 'phrase') period = lcm(period, real.k * B);
  if (period > MAX_PERIOD) throw new Error(`bound pattern period ${period} cycles exceeds ${MAX_PERIOD} — shorten the contour phrase or the harmony period`);

  const degreeFor = (stmt, m) => {
    if (real.mode === 'phrase') return real.seq[(stmt % real.k) * S + m];
    if (real.mode === 'unfold') return real.seq[(stmt * S + m) % real.seq.length];
    return real.seq[m];
  };

  // per-cycle note grids
  const flats = keyUsesFlats(harmonyContext?.key ?? 'C:major');
  const rootMidi = melodic ? noteToMidi(key.rootName.toUpperCase().replace(/^([A-G])B$/, '$1b') + String(octave)) : null;
  const cycles = [];
  const boundNotes = [];
  for (let c = 0; c < period; c++) {
    const bar = bars[c % B];
    const stmt = Math.floor(c / B);
    const sym = chordOfCycle(c);
    const pcs = sym ? chordTones(sym) : null;
    if (sym && (!pcs || pcs.size === 0)) warnings.push(`unknown chord "${sym}" — no snapping applied in cycle ${c}`);
    if (archetype === 'anchor' && c % barsPerChord !== 0) { cycles.push({ bar, notes: bar.steps.map(() => null) }); continue; }
    const notes = [];
    for (let i = 0; i < bar.steps.length; i++) {
      if (!melodic) { notes.push(sound); continue; }
      const accented = bar.accents[i] >= ACCENT_THRESHOLD;
      if (archetype || mainIdx[c % B][i] === -1) {
        // archetype note, or a 'bounce' onset: a light low anchor — the chord
        // root (pedal: the section's first chord), an octave below for bounces
        const baseOct = archetype ? octave : octave - 1;
        const baseC = noteToMidi('C' + String(baseOct));
        const rootSym = archetype === 'pedal' ? harmony[0] : sym;
        const rootPc = (rootSym ? chordRootPc(rootSym) : null) ?? key.rootPc;
        const rootMidiA = baseC + ((rootPc - baseC % 12) + 12) % 12;
        let midi = rootMidiA;
        if (archetype === 'alternating' && i > 0 && i % 2 === 1) midi = rootMidiA + 7; // root–5th; beat 1 = root, non-negotiable
        const name = midiToNoteName(midi, { flats });
        notes.push(name);
        boundNotes.push({ cycle: c, step: bar.steps[i], t: fracStr(bar.steps[i], bar.G), note: name, midi, accented, degree: null, voice: archetype ? 'main' : 'bounce' });
        continue;
      }
      const deg = degreeFor(stmt, mainIdx[c % B][i]);
      let midi = degreeToMidi(deg.d, rootMidi, key.intervals, deg.alt);
      // snapping respects explicit alterations — 'b5' over a chord that would
      // snap it away is the composer overriding the default, so it stands
      if (accented && deg.alt === 0 && pcs?.size) midi = snapToPcs(midi, pcs);
      // cadence: final onset of the whole phrase
      if (cadence && c === period - 1 && i === bar.steps.length - 1) {
        const targetPc = cadence === 'tonic' ? key.rootPc : sym ? chordRootPc(sym) : key.rootPc;
        if (targetPc != null) midi = snapToPcs(midi, new Set([targetPc]));
      }
      const name = midiToNoteName(midi, { flats });
      notes.push(name);
      boundNotes.push({ cycle: c, step: bar.steps[i], t: fracStr(bar.steps[i], bar.G), note: name, midi, accented, degree: degreeValue(deg), voice: 'main' });
    }
    cycles.push({ bar, notes });
  }

  // token emission with legato (@k extends to next onset)
  const noteCycles = cycles.map(({ bar, notes }) => tokens(bar.steps, notes.map((n) => n ?? '~'), bar.G, { legato }));
  const gainBars = bars.map((bar) => {
    const gv = bar.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));
    return tokens(bar.steps, gv.map(String), bar.G, { legato: true, fillLeading: String(gv[0] ?? round2(gainRange[0])) });
  });
  const allGains = r.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));

  const noteBody = period === 1 ? noteCycles[0] : `<${noteCycles.map((t) => `[${t}]`).join(' ')}>`;
  const gainBody = B === 1 ? gainBars[0] : `<${gainBars.map((t) => `[${t}]`).join(' ')}>`;
  const headFn = melodic ? 'note' : 's';
  let expr = `${headFn}("${noteBody}")`;
  if (melodic && sound) expr += `.s("${sound}")`;
  expr += `.gain("${gainBody}")`;
  expr += swingSuffix(r, bars, meter, warnings);
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: motifName,
    rhythm: rhythmName,
    archetype,
    transform: transform ?? null,
    degrees: melodic && real ? real.seq.map(displayDegree) : null,
    contourRealization: real ? { mode: real.mode, k: real.k } : null,
    contourSignsExpected: melodic && real ? contourSigns(real.seq.map(displayDegree)) : null,
    onsets: r.onsets.map(([n, d]) => `${n}/${d}`),
    accents: r.accents,
    voices: r.voices.some((v) => v === 'bounce') ? r.voices : undefined,
    bars: B,
    gains: allGains,
    swing: r.swing || 0,
    period,
    notes: melodic ? boundNotes : null,
    cadence: cadence ?? null,
  };
  return { expr, period, boundMeta, warnings };
}

// ---------------------------------------------------------------------------
// bindComp(): a rhythm entry drives the HARMONY as comping — full voicing stabs
// on 'main' onsets, a light low root on 'bounce' onsets (Ethan's push-comp ask)
// ---------------------------------------------------------------------------

/**
 * bindComp(rhythmEntry, harmonyContext, meter, opts) -> { expr, period, boundMeta, warnings }
 * opts: { dict (voicing shape, required), sound='square', bounceSound='triangle',
 *         octave=3 (bounce register), gainRange, fx, rhythmName }
 */
export function bindComp(rhythmEntry, harmonyContext, meter = '4/4', opts = {}) {
  const warnings = [];
  if (!harmonyContext?.harmony?.length) throw new Error('comp bind needs a harmony context (section.harmony)');
  if (!opts.dict) throw new Error(`comp bind needs {dict: "<voicing shape>"} (e.g. "drop2" or "ireal")`);
  const r = normalizeRhythm(rhythmEntry);
  const B = r.bars;
  const bars = splitByBar(r);
  const {
    dict, sound = 'square', bounceSound = 'triangle', octave = 3,
    gainRange = DEFAULT_GAIN_RANGE, fx = '', rhythmName = rhythmEntry.name ?? null,
  } = opts;
  const dictName = dict === 'ireal' ? 'ireal' : dict.startsWith('me_') ? dict : `me_${dict}`;
  const barsPerChord = harmonyContext.barsPerChord ?? 1;
  const period = lcm(harmonyContext.harmony.length * barsPerChord, B);
  const flats = keyUsesFlats(harmonyContext.key ?? 'C:major');
  const g = (a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0]));

  // chord part: struct on MAIN onsets (legato — the chord rings to the next hit)
  const structBars = [], chordGainBars = [];
  let bounceCount = 0;
  for (const bar of bars) {
    const main = bar.steps.map((s, i) => ({ s, i })).filter(({ i }) => bar.voices[i] === 'main');
    bounceCount += bar.steps.length - main.length;
    if (!main.length) { structBars.push('~'); chordGainBars.push(String(g(bar.accents[0] ?? 0.5))); continue; }
    structBars.push(tokens(main.map((m) => m.s), main.map(() => 'x'), bar.G, { legato: true }));
    chordGainBars.push(tokens(main.map((m) => m.s), main.map(({ i }) => String(g(bar.accents[i]))), bar.G, { legato: true, fillLeading: String(g(bar.accents[main[0].i])) }));
  }
  const wrap = (parts) => (B === 1 ? parts[0] : `<${parts.map((t) => `[${t}]`).join(' ')}>`);
  const seq = harmonyContext.harmony.join(' ');
  const slow = barsPerChord === 1 ? '' : `/${barsPerChord}`;
  let chordPart = `chord("<${seq}>${slow}").dict('${dictName}').voicing().struct("${wrap(structBars)}")`;
  if (sound) chordPart += `.s("${sound}")`;
  chordPart += `.gain("${wrap(chordGainBars)}")`;

  // bounce part: chord root of the sounding chord, low register, short
  let expr = chordPart;
  const bounceNotes = [];
  if (bounceCount > 0) {
    const noteCycles = [], gainBars2 = [];
    for (let c = 0; c < period; c++) {
      const bar = bars[c % B];
      const sym = harmonyContext.harmony[Math.floor(c / barsPerChord) % harmonyContext.harmony.length];
      const bounce = bar.steps.map((s, i) => ({ s, i })).filter(({ i }) => bar.voices[i] === 'bounce');
      if (!bounce.length) { noteCycles.push('~'); continue; }
      const baseC = noteToMidi('C' + String(octave));
      const rootPc = chordRootPc(sym) ?? 0;
      const midi = baseC + ((rootPc - baseC % 12) + 12) % 12;
      const name = midiToNoteName(midi, { flats });
      for (const { s, i } of bounce) bounceNotes.push({ cycle: c, step: s, t: fracStr(s, bar.G), note: name, midi, accented: bar.accents[i] >= ACCENT_THRESHOLD, degree: null, voice: 'bounce' });
      noteCycles.push(tokens(bounce.map((b) => b.s), bounce.map(() => name), bar.G, { legato: false }));
    }
    for (const bar of bars) {
      const bounce = bar.steps.map((s, i) => ({ s, i })).filter(({ i }) => bar.voices[i] === 'bounce');
      gainBars2.push(bounce.length
        ? tokens(bounce.map((b) => b.s), bounce.map(({ i }) => String(g(bar.accents[i]))), bar.G, { legato: true, fillLeading: String(g(bar.accents[bounce[0].i])) })
        : String(g(0.5)));
    }
    let bouncePart = `note("${period === 1 ? noteCycles[0] : `<${noteCycles.map((t) => `[${t}]`).join(' ')}>`}")`;
    if (bounceSound) bouncePart += `.s("${bounceSound}")`;
    bouncePart += `.gain("${wrap(gainBars2)}")`;
    expr = `stack(${chordPart}, ${bouncePart})`;
  }
  expr += swingSuffix(r, bars, meter, warnings);
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: null,
    rhythm: rhythmName,
    comp: true,
    dict: dictName,
    onsets: r.onsets.map(([n, d]) => `${n}/${d}`),
    accents: r.accents,
    voices: r.voices,
    bars: B,
    gains: r.accents.map((a) => g(a)),
    swing: r.swing || 0,
    period,
    notes: bounceNotes.length ? bounceNotes : null,
  };
  return { expr, period, boundMeta, warnings };
}

// ---------------------------------------------------------------------------
// bindFigure(): an Undertale-style figuration entry (D30) rendered against a
// harmony context. The entry's `figure` tokens are CHORD-RELATIVE — 'R' root,
// '3' the sounding chord's third (major or minor, whichever the chord carries),
// '5' its fifth (diminished/augmented included), '7'/'9'/'4'/'6' likewise,
// '~<n>' a literal n semitones above the root (a colour the chord does not
// contain), '+' an octave up, 'a.b' struck together. This is what makes the
// "movement of the fingers" portable: the same figure re-voices itself over any
// progression, any quality.
// ---------------------------------------------------------------------------

const FIGURE_TOKEN = /^(R|[34567]|9|~\d+)(\+*)$/;

/** the chord's own interval for a member, preferring what the chord actually carries */
function memberSemis(member, rel, warnings, sym) {
  const pick = (...cands) => cands.find((c) => rel.has(c));
  let out;
  switch (member) {
    case 'R': return 0;
    case '3': out = pick(4, 3); break;
    case '4': out = pick(5, 6); break;
    case '5': out = pick(7, 6, 8); break;
    case '6': out = pick(9, 8); break;
    case '7': out = pick(10, 11, 9); break;
    case '9': out = pick(2, 1, 3); break;
    default: return Number(member.slice(1)); // '~n' literal
  }
  if (out == null) {
    const FALLBACK = { 3: 4, 4: 5, 5: 7, 6: 9, 7: 10, 9: 2 };
    out = FALLBACK[member];
    warnings.push(`chord "${sym}" carries no ${member} — using the default interval ${out}`);
  }
  return out;
}

/**
 * bindFigure(figEntry, harmonyContext, meter, opts) -> { expr, period, boundMeta, warnings }
 * figEntry: { onsets, accents, figure, bars?, microtiming?, legato?, octave? }
 * opts: { octave=figEntry.octave??3, sound='piano', fx='', gainRange, rhythmName }
 */
export function bindFigure(figEntry, harmonyContext, meter = '4/4', opts = {}) {
  const warnings = [];
  if (!harmonyContext?.harmony?.length) throw new Error('figure bind needs a harmony context (section.harmony)');
  const figure = figEntry.figure;
  if (!figure?.length) throw new Error('figuration entry needs figure[] tokens');
  if (!figEntry.onsets || figEntry.onsets.length !== figure.length) {
    throw new Error(`figure[] must match onsets[] (${figEntry.onsets?.length ?? 0} onsets, ${figure.length} tokens)`);
  }
  for (const tok of figure) for (const m of String(tok).split('.')) {
    if (!FIGURE_TOKEN.test(m)) throw new Error(`bad figure token "${tok}" (member R/3/4/5/6/7/9 or ~<semitones>, then '+' per octave)`);
  }
  const accents = figEntry.accents;
  if (!accents || accents.length !== figure.length) {
    throw new Error(`figuration entry must carry a real accent profile (${figure.length} onsets, got ${accents ? accents.length : 0}) — uniform velocity is a bug (§3.4)`);
  }
  const B = Math.max(1, Math.floor(figEntry.bars ?? 1));
  const {
    octave = figEntry.octave ?? 3, sound = 'piano', fx = '',
    gainRange = DEFAULT_GAIN_RANGE, rhythmName = figEntry.name ?? null,
  } = opts;

  // pair onsets with accent + token, apply microtiming with the pairing intact
  // (normalizeRhythm re-sorts after shifting and would orphan the tokens)
  let paired = figEntry.onsets.map((o, i) => ({ onset: toFrac(o), accent: accents[i], tok: String(figure[i]) }));
  if (figEntry.microtiming && figEntry.microtiming.length === paired.length) {
    paired = paired.map((p, i) => {
      const shift = toFrac(figEntry.microtiming[i] ?? 0);
      let [n, d] = norm(p.onset[0] * shift[1] + shift[0] * p.onset[1], p.onset[1] * shift[1]);
      const span = d * B;
      n = ((n % span) + span) % span;
      return { ...p, onset: norm(n, d) };
    }).sort((a, b) => a.onset[0] / a.onset[1] - b.onset[0] / b.onset[1]);
  }
  for (const p of paired) {
    if (p.onset[0] < 0 || p.onset[0] / p.onset[1] >= B) throw new Error(`onset ${p.onset.join('/')} outside [0, bars=${B})`);
  }

  // split per bar
  const bars = Array.from({ length: B }, () => ({ onsets: [], accents: [], toks: [] }));
  for (const p of paired) {
    const [n, d] = p.onset;
    const b = Math.floor(n / d);
    bars[b].onsets.push(norm(n - b * d, d));
    bars[b].accents.push(p.accent);
    bars[b].toks.push(p.tok);
  }
  for (const bar of bars) {
    bar.G = gridSize(bar.onsets);
    bar.steps = bar.onsets.map(([n, d]) => (n * bar.G) / d);
    for (let i = 1; i < bar.steps.length; i++) {
      if (bar.steps[i] <= bar.steps[i - 1]) throw new Error('figure onsets must be strictly increasing');
    }
  }

  const harmony = harmonyContext.harmony;
  const barsPerChord = harmonyContext.barsPerChord ?? 1;
  const period = lcm(harmony.length * barsPerChord, B);
  if (period > MAX_PERIOD) throw new Error(`bound pattern period ${period} cycles exceeds ${MAX_PERIOD}`);
  const flats = keyUsesFlats(harmonyContext.key ?? 'C:major');
  const legato = figEntry.legato ?? false;
  const baseC = noteToMidi('C' + String(octave));

  const noteCycles = [];
  const boundNotes = [];
  // Root placement follows the BASS LINE, not an octave box: each cycle's root
  // lands on the candidate nearest the previous cycle's root (tie → higher),
  // so a descending progression walks down the way a left hand does
  // (D3 C3 B2 Bb2), instead of every root snapping into [C, B] above baseC
  // (D3 C3 B3 Bb3 — audition round 3 heard exactly that jump).
  let prevRoot = baseC + 5;
  for (let c = 0; c < period; c++) {
    const bar = bars[c % B];
    const sym = harmony[Math.floor(c / barsPerChord) % harmony.length];
    const rootPc = chordRootPc(sym);
    const pcs = sym ? chordTones(sym) : null;
    if (sym && (!pcs || pcs.size === 0)) warnings.push(`unknown chord "${sym}" — figure members use default intervals in cycle ${c}`);
    const rel = new Set([...(pcs ?? [])].map((p) => ((p - (rootPc ?? 0)) % 12 + 12) % 12));
    const above = baseC + (((rootPc ?? 0) - baseC % 12) + 12) % 12;
    let rootRef = above;
    for (const cand of [above - 12, above + 12]) {
      const d = Math.abs(cand - prevRoot), dBest = Math.abs(rootRef - prevRoot);
      if (d < dBest || (d === dBest && cand > rootRef)) rootRef = cand;
    }
    prevRoot = rootRef;
    const values = [];
    for (let i = 0; i < bar.steps.length; i++) {
      const accented = bar.accents[i] >= ACCENT_THRESHOLD;
      const names = bar.toks[i].split('.').map((m) => {
        const [, member, plus] = FIGURE_TOKEN.exec(m);
        const midi = rootRef + memberSemis(member, rel, warnings, sym) + 12 * plus.length;
        const name = midiToNoteName(midi, { flats });
        boundNotes.push({ cycle: c, step: bar.steps[i], t: fracStr(bar.steps[i], bar.G), note: name, midi, accented, degree: null, voice: 'main', token: m });
        return name;
      });
      values.push(names.length === 1 ? names[0] : `[${names.join(',')}]`);
    }
    noteCycles.push(tokens(bar.steps, values, bar.G, { legato }));
  }

  const gainBars = bars.map((bar) => {
    const gv = bar.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));
    return tokens(bar.steps, gv.map(String), bar.G, { legato: true, fillLeading: String(gv[0] ?? round2(gainRange[0])) });
  });
  let expr = `note("${period === 1 ? noteCycles[0] : `<${noteCycles.map((t) => `[${t}]`).join(' ')}>`}")`;
  if (sound) expr += `.s("${sound}")`;
  expr += `.gain("${gainBars.length === 1 ? gainBars[0] : `<${gainBars.map((t) => `[${t}]`).join(' ')}>`}")`;
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: null,
    rhythm: rhythmName,
    figure: figure.slice(),
    onsets: paired.map((p) => `${p.onset[0]}/${p.onset[1]}`),
    accents: accents.slice(),
    bars: B,
    gains: accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0]))),
    period,
    notes: boundNotes,
  };
  return { expr, period, boundMeta, warnings };
}

// ---------------------------------------------------------------------------
// bindMelody(): the D35 melody pipeline — given ANY harmony context, generate a
// melody that works with it. Cell-first (the corpus rule: 73% of Undertale
// melody bars restate a cell — write ONE strong bar, repitch it through the
// progression the way ownFigure re-renders the accompaniment), with the guard
// hierarchy per onset:
//   anchors (accent ≥ .7)  snap to the chord's SAFE tones (D14, unchanged)
//   approach slots         the onset before an anchor may become a neighbor
//                          that resolves INTO it by half/whole step (the
//                          Impro-Visor note category D14 lacked)
//   everything else        drawn from the CHORD-SCALE (chordScale, theory.js)
//                          — 7 notes per chord, not 3-4: guarded but not
//                          chord-locked; avoid notes nudged off
// Deterministic given (seed, style): sampling uses a seeded PRNG, and every
// note's category lands in boundMeta for melodyReport()/tests to judge.
// ---------------------------------------------------------------------------

/** seeded PRNG (mulberry32) — bind-time determinism, no Math.random */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleWeighted(weights, rnd) {
  const entries = Object.entries(weights);
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let x = rnd() * total;
  for (const [k, w] of entries) { x -= w; if (x <= 0) return k; }
  return entries[entries.length - 1][0];
}

/** the next cell offset: leap-recovery (post-skip reversal, ~72% in corpora),
 *  step inertia (a step tends to CONTINUE stepping the same direction — the
 *  run-maker, Chiu & Temperley 2024), else a profile-weighted move */
function nextOffset(prevOffset, prevMove, profile, rnd) {
  let move;
  if (Math.abs(prevMove) >= MOVE_STEPS.fourth && rnd() < profile.leapRecovery) {
    move = -Math.sign(prevMove); // gap-fill: a leap settles back by step
  } else if (Math.abs(prevMove) === 1 && rnd() < (profile.stepInertia ?? 0)) {
    move = prevMove; // scale run
  } else {
    const steps = MOVE_STEPS[sampleWeighted(profile.moves, rnd)];
    move = steps === 0 ? 0 : (rnd() < profile.upBias ? steps : -steps);
  }
  let next = prevOffset + move;
  if (Math.abs(next) > profile.rangeSteps) next = prevOffset - move; // reflect at the range wall
  return next;
}

/** one bar-cell (the MOTIF) as scale-step offsets from the bar's anchor tone */
function generateCell(S, profile, rnd) {
  const offsets = [0];
  for (let i = 1; i < S; i++) {
    offsets.push(nextOffset(offsets[i - 1], i >= 2 ? offsets[i - 1] - offsets[i - 2] : 0, profile, rnd));
  }
  return offsets;
}

/** MeloForm's "transformation": keep the motif's head, re-sample its tail —
 *  the bar-level question/answer, and the restatement variation operator */
function varyTail(offsets, profile, rnd) {
  const n = Math.max(1, Math.ceil(offsets.length / 3));
  const out = offsets.slice(0, offsets.length - n);
  for (let i = 0; i < n; i++) {
    const prev = out[out.length - 1] ?? 0;
    const prevMove = out.length >= 2 ? out[out.length - 1] - out[out.length - 2] : 0;
    out.push(nextOffset(prev, prevMove, profile, rnd));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Articulation (D39). Melody audition round 4: "clean but same-y/lifeless".
// Measured against the corpus's own melody streams, the renderer was the
// larger half of "lifeless": Toby's melodies are 24% staccato / 25% detached /
// 51% legato (dur/IOI mean 0.88, stdev 0.33) — ours were 100% legato, stdev 0,
// because every melodic note was emitted holding to the next onset. A note
// that never lets go cannot phrase. Fixed by giving each note a DURATION
// RATIO (its share of the gap to the next onset), rendered with .clip().
//
// The default rule is deterministic and musical rather than random: long
// notes ring, short notes pop, light notes lift, and a note before a breath
// is held full (phrase-final lengthening, D37). An authored spec may override
// any note with an explicit `artic` value — the composer's articulation is
// data like anything else.
// ---------------------------------------------------------------------------

const DEFAULT_ARTIC = { held: 1, quarter: 0.9, eighth: 0.68, short: 0.55, lightMul: 0.92 };

/** per-note duration ratios for one bar. Gap length sets the base; then the
 *  things a player's hand actually responds to: a step to the next note is
 *  CONNECTED, a leap is LIFTED (you let go to jump), an accent sustains, a
 *  light note lets go early. Gap alone would just be uniformity at a new
 *  value — the pitch context is what makes the spread bimodal like real
 *  playing (measured: Toby's melody streams sit at stdev 0.33). */
function articRatios(steps, accents, G, breath, profile, explicit, midis = null) {
  const a = { ...DEFAULT_ARTIC, ...(profile?.articulation ?? {}) };
  return steps.map((s, i) => {
    if (explicit && explicit[i] != null) return clamp01(explicit[i]);
    // the last note of a bar that breathes is held full — it IS the lengthening
    if (breath && i === steps.length - 1) return a.held;
    const next = i + 1 < steps.length ? steps[i + 1] : G;
    const gap = (next - s) / G; // in bar fractions
    let r = gap >= 0.5 ? a.held : gap >= 0.25 ? a.quarter : gap >= 0.125 ? a.eighth : a.short;
    const acc = accents[i] ?? 0.7;
    if (acc < 0.65) r *= a.lightMul;
    if (acc >= 0.85) r *= 1.06;
    if (midis && i + 1 < midis.length) {
      const leap = Math.abs(midis[i + 1] - midis[i]);
      if (leap === 0) r *= 0.85;        // a repeat must re-articulate
      else if (leap <= 2) r *= 1.1;     // step: connect the line
      else if (leap >= 5) r *= 0.86;    // leap: lift the hand
    }
    return clamp01(r);
  });
}
function clamp01(x) { return Math.max(0.05, Math.min(1, Math.round(x * 1000) / 1000)); }

/** per-chord scale + note SUPPLY, computed once per distinct symbol.
 *  'triadic' tension depth (§6, and the round-1 melody audition): the supply
 *  is the chord-scale ∩ THE KEY, plus the chord's own core tones — so a
 *  borrowed or chromatic chord contributes the notes it actually forces,
 *  never its whole source mode (full chord-scales sprayed out-of-key color
 *  that Ethan's ear rightly refused). 'full' keeps the whole chord-scale.
 *  Anchors sit on what the chord forces: core tones, avoid-notes excluded. */
function makeScaleOf(keyStr, keyParsed, tensions) {
  const keyPcs = new Set(keyParsed.intervals.map((x) => (keyParsed.rootPc + x) % 12));
  const scales = new Map();
  return (sym) => {
    if (!scales.has(sym)) {
      const scale = chordScale(sym, keyStr);
      const core = chordCoreTones(sym);
      const supply = tensions === 'full'
        ? new Set(scale.pcs)
        : new Set([...[...scale.pcs].filter((pc) => keyPcs.has(pc)), ...core]);
      const anchor = new Set([...core].filter((pc) => !scale.avoid.has(pc)));
      scales.set(sym, { ...scale, core, supply, anchor: anchor.size ? anchor : core });
    }
    return scales.get(sym);
  };
}

/** walk k scale steps from `midi` along the scale's pitch ladder */
function ladderStep(midi, k, scalePcs) {
  if (k === 0) return midi;
  const pcs = [...scalePcs].sort((a, b) => a - b);
  const ladder = [];
  for (let oct = Math.floor(midi / 12) - 4; oct <= Math.floor(midi / 12) + 4; oct++) {
    for (const pc of pcs) ladder.push(oct * 12 + pc);
  }
  // position: nearest ladder note at-or-below for upward walks, at-or-above for downward
  let i = 0;
  while (i + 1 < ladder.length && ladder[i + 1] <= midi) i++;
  if (k > 0 && ladder[i] < midi) i++; // start strictly above when between rungs going up
  if (k < 0 && ladder[i] >= midi && ladder[i] !== midi) i--;
  return ladder[Math.max(0, Math.min(ladder.length - 1, i + k))];
}

/**
 * bindMelody(rhythmEntry, harmonyContext, meter, opts) -> { expr, period, boundMeta, warnings }
 * harmonyContext: { harmony: [symbols], barsPerChord, key } (required)
 * opts: { style='toby-fox', seed=1, octave=5, cell=null (explicit scale-step offsets),
 *         approachProb (profile override), cadence=null, sound=null, fx='',
 *         gainRange, legato=true, rhythmName }
 */
export function bindMelody(rhythmEntry, harmonyContext, meter = '4/4', opts = {}) {
  const warnings = [];
  if (!harmonyContext?.harmony?.length) throw new Error('melody bind needs a harmony context (section.harmony)');
  if (!rhythmEntry) throw new Error('melody bind needs a rhythm entry (an atlas retrieval or an authored cell)');
  const r = normalizeRhythm(rhythmEntry);
  const B = r.bars;
  const bars = splitByBar(r);
  const {
    style = 'toby-fox', seed = 1, octave = 5, cadence = null,
    sound = null, fx = '', gainRange = DEFAULT_GAIN_RANGE, legato = true,
    rhythmName = rhythmEntry.name ?? null,
  } = opts;
  const profile = MELODY_PROFILES[style];
  if (!profile) throw new Error(`unknown melody style "${style}" (have: ${Object.keys(MELODY_PROFILES).join(', ')})`);
  const approachProb = opts.approachProb ?? profile.approachProb;
  const rnd = mulberry32(seed);

  const key = parseKey(harmonyContext.key ?? 'C:major');
  const flats = keyUsesFlats(harmonyContext.key ?? 'C:major');
  const harmony = harmonyContext.harmony;
  const barsPerChord = harmonyContext.barsPerChord ?? 1;

  // ---- phrase plan (D37, melody-form.md) — the layer→lead upgrade: bars get
  // ROLES (MeloForm's operators: motif · answer[transformation] · cadence
  // [ending]), the plan spans the harmony, and the whole plan restates with
  // varied answer tails — same melody, changed meaningfully over time.
  const harmonyBars = Math.max(1, Math.round(harmony.length * barsPerChord));
  const phraseBars = opts.phraseBars ?? (harmonyBars <= 3 ? Math.max(2, harmonyBars) : 4);
  const planBars = lcm(lcm(harmonyBars, B), phraseBars);
  const restatements = opts.restatements ?? (planBars * 2 <= MAX_PERIOD ? 2 : 1);
  const period = planBars * restatements;
  if (period > MAX_PERIOD) throw new Error(`bound pattern period ${period} cycles exceeds ${MAX_PERIOD}`);
  const roleOf = (b) => {
    const i = b % phraseBars;
    if (i === phraseBars - 1) return 'cadence';
    if (i === 0 || (phraseBars === 4 && i === 2)) return 'motif';
    return 'answer';
  };
  const phraseCount = period / phraseBars;
  // antecedent/consequent: odd phrases (and always the last) land STABLE
  const stablePhrase = (b) => { const p = Math.floor(b / phraseBars); return p % 2 === 1 || p === phraseCount - 1; };
  // Huron's melodic arch, in semitones over the phrase: rise, peak past the
  // middle, fall into the cadence
  const ARCH = { 2: [0, -1], 3: [0, 3, -1], 4: [0, 2, 4, -1] }[phraseBars]
    ?? Array.from({ length: phraseBars }, (_, i) => (i === phraseBars - 1 ? -1 : Math.round(4 * Math.sin(Math.PI * i / (phraseBars - 1)))));

  const scaleOf = makeScaleOf(harmonyContext.key ?? 'C:major', key, profile.tensions ?? 'triadic');

  // THE cell (one bar of scale-step offsets); bars with a different onset
  // count get a shape-preserving resample of the same cell (D26 machinery)
  const S0 = bars[0].steps.length;
  if (S0 === 0) throw new Error('melody bind needs at least one onset in the first bar');
  const cell = opts.cell ? opts.cell.slice() : generateCell(S0, profile, rnd);
  if (opts.cell && opts.cell.length !== S0) throw new Error(`explicit cell has ${opts.cell.length} offsets for ${S0} first-bar onsets`);
  const cellFor = (S) => (S === cell.length ? cell
    : resampleShape(cell.map((d) => ({ d, alt: 0 })), S).map((o) => o.d));

  // per-cycle bar shapes: cadence bars are THINNED to the cell's first-half
  // onsets plus one held note cut off before the barline — phrase-final
  // lengthening + a breath (Huron; the lead singer breathes, the layer never did)
  const cycleBars = [];
  for (let c = 0; c < period; c++) {
    const src = bars[c % B];
    const role = roleOf(c);
    if (role === 'cadence') {
      const keep = src.steps.map((s, i) => ({ s, i })).filter(({ s }) => s <= src.G / 2);
      const ks = keep.length ? keep : [{ s: src.steps[0], i: 0 }];
      cycleBars.push({
        G: src.G, role, breath: true,
        steps: ks.map((k) => k.s),
        accents: ks.map((k, j) => (j === ks.length - 1 ? Math.max(0.9, src.accents[k.i]) : src.accents[k.i])),
        srcIdx: ks.map((k) => k.i),
      });
    } else {
      cycleBars.push({
        G: src.G, role, breath: false, steps: src.steps.slice(), accents: src.accents.slice(),
        srcIdx: src.steps.map((_, i) => i),
      });
    }
  }

  // per-cycle offsets: motif bars restate the cell EXACTLY (the theme must
  // recur recognizably), answer bars vary its tail per restatement, cadence
  // bars resample the head to the thinned onset count
  const answerTails = new Map();
  const offsetsFor = (c, S) => {
    const role = cycleBars[c].role;
    if (role === 'answer') {
      const kk = `${Math.floor(c / planBars)}|${S}`;
      if (!answerTails.has(kk)) answerTails.set(kk, varyTail(cellFor(S), profile, rnd));
      return answerTails.get(kk);
    }
    return cellFor(S);
  };

  // pass 1: realize every note (cell offsets on the note-supply ladder,
  // anchors snapped to core tones), centers riding the phrase arch
  const rootMidi = noteToMidi(key.rootName.toUpperCase().replace(/^([A-G])B$/, '$1b') + String(octave));
  let baseCenter = null;
  const flat = []; // every note of the whole period, in time order
  for (let c = 0; c < period; c++) {
    const bar = cycleBars[c];
    const sym = harmony[Math.floor(c / barsPerChord) % harmony.length];
    const scale = scaleOf(sym);
    if (baseCenter == null) baseCenter = snapToPcs(rootMidi, scale.anchor);
    const center = snapToPcs(baseCenter + ARCH[c % phraseBars], scale.anchor);
    const offsets = offsetsFor(c, bar.steps.length);
    for (let i = 0; i < bar.steps.length; i++) {
      const accented = bar.accents[i] >= ACCENT_THRESHOLD;
      // weak beats walk the SUPPLY ladder (avoid tones stay in the geometry —
      // they may pass on weak slots, they just never get sat on)
      let midi = ladderStep(center, offsets[i], scale.supply);
      let category;
      if (bar.role === 'cadence' && i === bar.steps.length - 1) {
        // the ending operator's landing: consequents on the chord root,
        // antecedents on the 3rd/5th — the question stays open
        const root = chordRootPc(sym);
        const target = stablePhrase(c)
          ? new Set([root ?? key.rootPc])
          : new Set([...scale.core].filter((pc) => pc !== root));
        midi = snapToPcs(midi, target.size ? target : scale.core);
        category = 'cadence';
      } else if (accented) {
        midi = snapToPcs(midi, scale.anchor);
        category = 'anchor';
      } else {
        category = scale.core.has(((midi % 12) + 12) % 12) ? 'chord' : 'scale';
      }
      flat.push({ cycle: c, barIdx: c % B, i, step: bar.steps[i], G: bar.G, accented, midi, category, cellIndex: i, chord: sym, role: bar.role });
    }
  }

  // pass 2: approach slots — the onset directly before an anchor may re-pitch
  // to a neighbor resolving into it (seeded, ~approachProb per opportunity)
  for (let n = 0; n < flat.length - 1; n++) {
    const cur = flat[n], next = flat[n + 1];
    if (cur.category === 'anchor' || cur.category === 'cadence') continue;
    if (next.category !== 'anchor' && next.category !== 'cadence') continue;
    if (rnd() >= approachProb) continue;
    const target = next.midi;
    const dir = Math.sign(cur.midi - target) || (rnd() < 0.5 ? -1 : 1); // approach from the side we're on
    const scale = scaleOf(cur.chord);
    let midi;
    if (rnd() < profile.chromaticApproach) {
      midi = target + dir;
    } else {
      midi = ladderStep(target, dir, scale.supply);
      if (Math.abs(midi - target) > 2) midi = target + dir; // diatonic neighbor too far → chromatic
    }
    cur.midi = midi;
    cur.category = 'approach';
    cur.resolvesTo = target;
  }

  // cadence: final onset of the phrase lands on the tonic (or chord root)
  if (cadence && flat.length) {
    const last = flat[flat.length - 1];
    const targetPc = cadence === 'tonic' ? key.rootPc : chordRootPc(last.chord) ?? key.rootPc;
    last.midi = snapToPcs(last.midi, new Set([targetPc]));
    last.category = 'anchor';
    delete last.resolvesTo;
  }

  // emission — per-cycle note AND gain grids (cadence bars differ), with the
  // breath rendered as an explicit rest before the barline
  const boundNotes = [];
  const noteCycles = [];
  const gainCycles = [];
  const clipCycles = [];
  for (let c = 0; c < period; c++) {
    const bar = cycleBars[c];
    const notes = flat.filter((n) => n.cycle === c);
    // a mined melodic rhythm (D40) carries the SOURCE's articulation per onset;
    // cadence bars keep the D37 held-note rule instead (they are re-shaped)
    const srcArtic = (rhythmEntry.artic && !rhythmEntry.microtiming && rhythmEntry.artic.length === r.onsets.length && bar.role !== 'cadence')
      ? bar.srcIdx.map((i) => rhythmEntry.artic[i]) : null;
    const ratios = articRatios(bar.steps, bar.accents, bar.G, bar.breath, profile, srcArtic, notes.map((n) => n.midi));
    const values = notes.map((n, i) => {
      const name = midiToNoteName(n.midi, { flats });
      boundNotes.push({
        cycle: c, step: n.step, t: fracStr(n.step, n.G), note: name, midi: n.midi,
        accented: n.accented, degree: null, voice: 'main',
        category: n.category, cellIndex: n.cellIndex, chord: n.chord, role: n.role,
        artic: ratios[i],
        ...(n.resolvesTo != null ? { resolvesTo: n.resolvesTo } : {}),
      });
      return name;
    });
    let steps = bar.steps, vals = values;
    if (bar.breath) {
      const holdTo = bar.G - Math.max(1, Math.round(bar.G / 8));
      if (holdTo > steps[steps.length - 1]) { steps = [...steps, holdTo]; vals = [...values, '~']; }
    }
    noteCycles.push(tokens(steps, vals, bar.G, { legato }));
    const gv = bar.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));
    gainCycles.push(tokens(bar.steps, gv.map(String), bar.G, { legato: true, fillLeading: String(gv[0] ?? round2(gainRange[0])) }));
    clipCycles.push(tokens(bar.steps, ratios.map(String), bar.G, { legato: true, fillLeading: String(ratios[0] ?? 1) }));
  }
  const wrapCycles = (xs) => (period === 1 ? xs[0] : `<${xs.map((t) => `[${t}]`).join(' ')}>`);
  let expr = `note("${wrapCycles(noteCycles)}")`;
  if (sound) expr += `.s("${sound}")`;
  expr += `.gain("${wrapCycles(gainCycles)}")`;
  if (opts.articulation !== false) expr += `.clip("${wrapCycles(clipCycles)}")`;
  expr += swingSuffix(r, bars, meter, warnings);
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: null,
    rhythm: rhythmName,
    melody: { style, seed, cell: cell.slice(), approachProb, key: harmonyContext.key ?? 'C:major', tensions: profile.tensions ?? 'triadic' },
    phrase: { phraseBars, planBars, restatements, roles: cycleBars.map((b) => b.role) },
    onsets: r.onsets.map(([n, d]) => `${n}/${d}`),
    accents: r.accents,
    bars: B,
    gains: r.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0]))),
    swing: r.swing || 0,
    period,
    notes: boundNotes,
    cadence: cadence ?? null,
  };
  return { expr, period, boundMeta, warnings };
}

// ---------------------------------------------------------------------------
// bindMelodySpec(): TIER 2 (D35 §2.3 / D38) — a trained model (an LLM, or
// later a fine-tuned melody model) AUTHORS the melody as an explicit spec —
// reduction-first, with intention — and this function is the GUARD it must
// pass through. The spec is key-agnostic (scale degrees, D28 grammar), so an
// authored melody transposes to any key and re-legalizes over any harmony.
// Guard rules: accented unaltered notes snap to the chord's core tones (D14);
// explicitly altered degrees ('#5', 'b3') are declared color and exempt
// (D26); weak notes outside the note supply either resolve into the next
// note by ≤2 semitones (approach — left alone) or are snapped in, with a
// warning naming the note (never silently).
// ---------------------------------------------------------------------------

/**
 * bindMelodySpec(spec, harmonyContext, meter, opts) -> { expr, period, boundMeta, warnings }
 * spec: { name?, octave=4, style='toby-fox', bars: [
 *          { onsets, accents, degrees, breath? } ] }
 *   — degrees: one scale degree per onset (int or 'b<n>'/'#<n>', relative to
 *   the key root at `octave`); `breath: true` cuts the bar's last note off
 *   before the barline (phrase-final rest).
 * opts: { octave, style, sound=null, fx='', gainRange, legato=true, rhythmName }
 */
export function bindMelodySpec(spec, harmonyContext, meter = '4/4', opts = {}) {
  const warnings = [];
  if (!harmonyContext?.harmony?.length) throw new Error('melody spec bind needs a harmony context (section.harmony)');
  if (!spec?.bars?.length) throw new Error('melody spec needs bars[]');
  const {
    octave = spec.octave ?? 4, style = spec.style ?? 'toby-fox',
    sound = null, fx = '', gainRange = DEFAULT_GAIN_RANGE, legato = true,
    articulation = true, rhythmName = spec.name ?? null,
  } = opts;
  const profile = MELODY_PROFILES[style];
  if (!profile) throw new Error(`unknown melody style "${style}"`);
  const key = parseKey(harmonyContext.key ?? 'C:major');
  const flats = keyUsesFlats(harmonyContext.key ?? 'C:major');
  const harmony = harmonyContext.harmony;
  const barsPerChord = harmonyContext.barsPerChord ?? 1;
  const scaleOf = makeScaleOf(harmonyContext.key ?? 'C:major', key, profile.tensions ?? 'triadic');

  // validate + normalize the spec's bars
  const bars = spec.bars.map((b, bi) => {
    if (!b.onsets?.length || b.onsets.length !== b.degrees?.length) {
      throw new Error(`spec bar ${bi}: onsets[] and degrees[] must match`);
    }
    if (!b.accents || b.accents.length !== b.onsets.length) {
      throw new Error(`spec bar ${bi}: a real accent profile is required (§3.4)`);
    }
    const onsets = b.onsets.map(toFrac);
    for (const [n, d] of onsets) if (n < 0 || n / d >= 1) throw new Error(`spec bar ${bi}: onset ${n}/${d} outside [0,1) — spec onsets are bar-local`);
    const G = gridSize(onsets);
    const steps = onsets.map(([n, d]) => (n * G) / d);
    for (let i = 1; i < steps.length; i++) if (steps[i] <= steps[i - 1]) throw new Error(`spec bar ${bi}: onsets must be strictly increasing`);
    if (b.artic && b.artic.length !== b.onsets.length) throw new Error(`spec bar ${bi}: artic[] must match onsets[]`);
    return { G, steps, accents: b.accents.slice(), degrees: b.degrees.map(parseDegree), breath: !!b.breath, artic: b.artic ?? null };
  });
  const specBars = bars.length;
  const harmonyBars = Math.max(1, Math.round(harmony.length * barsPerChord));
  const period = lcm(harmonyBars, specBars);
  if (period > MAX_PERIOD) throw new Error(`bound pattern period ${period} cycles exceeds ${MAX_PERIOD}`);

  // pass 1: realize + anchor snapping (altered degrees exempt, D26)
  const rootMidi = noteToMidi(key.rootName.toUpperCase().replace(/^([A-G])B$/, '$1b') + String(octave));
  const flat = [];
  for (let c = 0; c < period; c++) {
    const bar = bars[c % specBars];
    const sym = harmony[Math.floor(c / barsPerChord) % harmony.length];
    const scale = scaleOf(sym);
    for (let i = 0; i < bar.steps.length; i++) {
      const deg = bar.degrees[i];
      const accented = bar.accents[i] >= ACCENT_THRESHOLD;
      let midi = degreeToMidi(deg.d, rootMidi, key.intervals, deg.alt);
      let category;
      if (deg.alt !== 0) {
        category = 'color'; // declared alteration — the author's call stands
      } else if (accented) {
        const snapped = snapToPcs(midi, scale.anchor);
        if (snapped !== midi) warnings.push(`spec ${rhythmName ?? ''} cycle ${c} onset ${i}: accented ${midiToNoteName(midi, { flats })} is not a core tone of ${sym} — snapped to ${midiToNoteName(snapped, { flats })}`);
        midi = snapped;
        category = 'anchor';
      } else {
        category = 'pending'; // judged against the next note in pass 2
      }
      flat.push({ cycle: c, i, step: bar.steps[i], G: bar.G, accented, midi, category, chord: sym });
    }
  }
  // pass 2 (right-to-left, so `next` is final): weak out-of-supply notes are
  // approach tones when they resolve; otherwise they get snapped in, loudly
  for (let n = flat.length - 1; n >= 0; n--) {
    const cur = flat[n];
    if (cur.category !== 'pending') continue;
    const scale = scaleOf(cur.chord);
    const pc = ((cur.midi % 12) + 12) % 12;
    if (scale.supply.has(pc)) {
      cur.category = scale.core.has(pc) ? 'chord' : 'scale';
      continue;
    }
    const next = flat[n + 1];
    if (next && next.midi !== cur.midi && Math.abs(next.midi - cur.midi) <= 2) {
      cur.category = 'approach';
      cur.resolvesTo = next.midi;
      continue;
    }
    const snapped = snapToPcs(cur.midi, scale.supply);
    warnings.push(`spec ${rhythmName ?? ''} cycle ${cur.cycle} onset ${cur.i}: ${midiToNoteName(cur.midi, { flats })} is outside the supply of ${cur.chord} and resolves nowhere — snapped to ${midiToNoteName(snapped, { flats })}`);
    cur.midi = snapped;
    cur.category = scale.core.has(((snapped % 12) + 12) % 12) ? 'chord' : 'scale';
  }

  // emission — per-cycle grids, breath as an explicit rest, articulation as clip
  const boundNotes = [];
  const noteCycles = [];
  const gainCycles = [];
  const clipCycles = [];
  for (let c = 0; c < period; c++) {
    const bar = bars[c % specBars];
    const notes = flat.filter((n) => n.cycle === c);
    const ratios = articRatios(bar.steps, bar.accents, bar.G, bar.breath, profile, bar.artic, notes.map((n) => n.midi));
    const values = notes.map((n, i) => {
      const name = midiToNoteName(n.midi, { flats });
      boundNotes.push({
        cycle: c, step: n.step, t: fracStr(n.step, n.G), note: name, midi: n.midi,
        accented: n.accented, degree: null, voice: 'main', category: n.category, chord: n.chord,
        artic: ratios[i],
        ...(n.resolvesTo != null ? { resolvesTo: n.resolvesTo } : {}),
      });
      return name;
    });
    let steps = bar.steps, vals = values;
    if (bar.breath) {
      const holdTo = bar.G - Math.max(1, Math.round(bar.G / 8));
      if (holdTo > steps[steps.length - 1]) { steps = [...steps, holdTo]; vals = [...values, '~']; }
    }
    noteCycles.push(tokens(steps, vals, bar.G, { legato }));
    const gv = bar.accents.map((a) => round2(gainRange[0] + a * (gainRange[1] - gainRange[0])));
    gainCycles.push(tokens(bar.steps, gv.map(String), bar.G, { legato: true, fillLeading: String(gv[0] ?? round2(gainRange[0])) }));
    clipCycles.push(tokens(bar.steps, ratios.map(String), bar.G, { legato: true, fillLeading: String(ratios[0] ?? 1) }));
  }
  const wrapCycles = (xs) => (period === 1 ? xs[0] : `<${xs.map((t) => `[${t}]`).join(' ')}>`);
  let expr = `note("${wrapCycles(noteCycles)}")`;
  if (sound) expr += `.s("${sound}")`;
  expr += `.gain("${wrapCycles(gainCycles)}")`;
  if (articulation) expr += `.clip("${wrapCycles(clipCycles)}")`;
  if (fx) expr += fx.startsWith('.') ? fx : '.' + fx;

  const boundMeta = {
    motif: null,
    rhythm: rhythmName,
    melody: { tier: 2, style, spec: rhythmName, key: harmonyContext.key ?? 'C:major', tensions: profile.tensions ?? 'triadic' },
    bars: specBars,
    period,
    notes: boundNotes,
  };
  return { expr, period, boundMeta, warnings };
}

/**
 * melodyReport(boundMeta): the D35 §2.2 step-6 checks, as MEASUREMENTS the
 * caller/tests judge (violations should be zero by construction):
 *   anchorViolations    accented notes not on a chord tone of their chord
 *   approachViolations  approach notes not resolving into the next note ≤2 semis
 *   intervalHistogram   |semitone| move counts (the §7 profile check's input)
 *   leapRecovery        fraction of leaps ≥5 semis followed by a reversal
 *   cellRepetition      fraction of cycles whose realized contour signs match
 *                       the most common cycle contour (the "cells, not lines" floor)
 *   offKeyUnforced      notes outside the key whose chord does NOT force them
 *                       (not a core chord tone, not a declared approach) — the
 *                       "doesn't sound legal" measurement; 0 for triadic styles
 */
export function melodyReport(boundMeta) {
  const notes = boundMeta.notes ?? [];
  const key = parseKey(boundMeta.melody?.key ?? 'C:major');
  const keyPcs = new Set(key.intervals.map((x) => (key.rootPc + x) % 12));
  let anchorViolations = 0, approachViolations = 0, offKeyUnforced = 0;
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const pc = ((n.midi % 12) + 12) % 12;
    if ((n.category === 'anchor' || n.category === 'cadence') && !chordTones(n.chord).has(pc)) anchorViolations++;
    if (n.category === 'approach') {
      const next = notes[i + 1];
      if (!next || next.midi !== n.resolvesTo || Math.abs(n.midi - next.midi) > 2 || n.midi === next.midi) approachViolations++;
    } else if (n.category !== 'color' && !keyPcs.has(pc) && !chordCoreTones(n.chord).has(pc)) {
      offKeyUnforced++; // declared alterations ('color') are the author's call (D26)
    }
  }
  const intervalHistogram = {};
  let leaps = 0, recovered = 0;
  for (let i = 1; i < notes.length; i++) {
    const d = notes[i].midi - notes[i - 1].midi;
    intervalHistogram[Math.abs(d)] = (intervalHistogram[Math.abs(d)] ?? 0) + 1;
    if (i >= 2) {
      const prev = notes[i - 1].midi - notes[i - 2].midi;
      if (Math.abs(prev) >= 5) { leaps++; if (Math.sign(d) === -Math.sign(prev)) recovered++; }
    }
  }
  const signatures = new Map();
  for (let c = 0; c < (boundMeta.period ?? 1); c++) {
    const cyc = notes.filter((n) => n.cycle === c).map((n) => n.midi);
    if (cyc.length < 2) continue;
    const sig = contourSigns(cyc).join(',');
    signatures.set(sig, (signatures.get(sig) ?? 0) + 1);
  }
  const cycles = [...signatures.values()].reduce((a, b) => a + b, 0);
  const cellRepetition = cycles ? Math.max(...signatures.values()) / cycles : 1;
  return {
    anchorViolations, approachViolations, offKeyUnforced, intervalHistogram,
    leapRecovery: leaps ? recovered / leaps : 1,
    cellRepetition,
  };
}

// ---------------------------------------------------------------------------

function swingSuffix(r, bars, meter, warnings) {
  if (!r.swing) return '';
  const subdiv = r.swingSubdiv ?? defaultSubdiv(meter);
  // swingBy delays each 1/subdiv window's second half by swing * (1/(2*subdiv)).
  // At 1.1.0 an onset delayed past its window end is silently DELETED (review
  // finding) — check statically (bar-local positions) and fail loudly instead.
  const halfW = 1 / (2 * subdiv);
  let affected = 0;
  for (const bar of bars) {
    for (const [n, d] of bar.onsets) {
      const pos = n / d;
      const inWindow = pos - Math.floor(pos * subdiv) / subdiv;
      if (inWindow >= halfW - 1e-9) {
        affected++;
        const windowEnd = (Math.floor(pos * subdiv) + 1) / subdiv;
        if (pos + r.swing * halfW >= windowEnd - 1e-9) {
          throw new Error(`swing ${r.swing} pushes the onset at ${n}/${d} past its 1/${subdiv} window — strudel would silently delete it; reduce swing or subdiv`);
        }
      }
    }
  }
  if (affected === 0) warnings.push(`swing ${r.swing} affects ZERO onsets (all sit at window starts on the 1/${subdiv} grid) — it will be inaudible`);
  return `.swingBy(${r.swing}, ${subdiv})`;
}

function displayDegree(o) { return o.alt === 0 ? o.d : (o.alt < 0 ? 'b' : '#') + o.d; }

function tokens(steps, values, G, { legato, fillLeading = null } = {}) {
  if (!steps.length) return fillLeading != null ? fillLeading : '~';
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
function round2(x) { return Math.round(x * 1000) / 1000; }
