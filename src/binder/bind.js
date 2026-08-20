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
import { parseKey, degreeToMidi, midiToNoteName, snapToPcs, applyTransform, contourSigns, keyUsesFlats, parseDegree, degreeValue } from './theory.js';
import { chordTones, chordRootPc } from '../harness/chords.js';

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
