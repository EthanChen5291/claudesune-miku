// Scale/degree math for the binder. Degrees are scale indices (0 = root);
// beyond the scale length they wrap with octave shifts, negatives go down.

import { noteToMidi } from '@strudel/core';
import { chordRootPc, chordQuality } from '../harness/chords.js';

export const SCALES = {
  major:        [0, 2, 4, 5, 7, 9, 11],
  ionian:       [0, 2, 4, 5, 7, 9, 11],
  minor:        [0, 2, 3, 5, 7, 8, 10],
  aeolian:      [0, 2, 3, 5, 7, 8, 10],
  dorian:       [0, 2, 3, 5, 7, 9, 10],
  phrygian:     [0, 1, 3, 5, 7, 8, 10],
  lydian:       [0, 2, 4, 6, 7, 9, 11],
  mixolydian:   [0, 2, 4, 5, 7, 9, 10],
  locrian:      [0, 1, 3, 5, 6, 8, 10],
  harmonicMinor:[0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
};

const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/** "F:minor" / "F3:minor" / "D:dorian" -> { rootPc, rootName, scaleName, intervals } */
export function parseKey(key) {
  const m = /^([A-Ga-g][#b]?)(-?\d+)?:(\w+)$/.exec(String(key).trim());
  if (!m) throw new Error(`unparseable key "${key}" (expected e.g. "F:minor", "D:dorian")`);
  const [, root, , scaleRaw] = m;
  const scaleName = normalizeScale(scaleRaw);
  const intervals = SCALES[scaleName];
  if (!intervals) throw new Error(`unknown scale "${scaleRaw}" (known: ${Object.keys(SCALES).join(', ')})`);
  const rootMidi = noteToMidi(root.toUpperCase().replace(/^([A-G])B$/, '$1b') + '3');
  return { rootPc: ((rootMidi % 12) + 12) % 12, rootName: root, scaleName, intervals };
}

function normalizeScale(s) {
  const k = s.replace(/[\s_-]/g, '').toLowerCase();
  for (const name of Object.keys(SCALES)) if (name.toLowerCase() === k) return name;
  return s;
}

/** Contour degrees may be plain integers or altered: 'b5' lowers the 6th scale
 *  degree a semitone, '#3' raises the 4th. -> { d, alt } */
export function parseDegree(x) {
  if (typeof x === 'number') {
    if (!Number.isInteger(x)) throw new Error(`degree ${x} must be an integer (use 'b<n>'/'#<n>' for chromatic alteration)`);
    return { d: x, alt: 0 };
  }
  if (x && typeof x === 'object' && Number.isInteger(x.d)) return { d: x.d, alt: x.alt ?? 0 };
  const m = /^([b#])(-?\d+)$/.exec(String(x).trim());
  if (!m) throw new Error(`bad degree "${x}" (expected an integer or 'b<n>'/'#<n>')`);
  return { d: Number(m[2]), alt: m[1] === 'b' ? -1 : 1 };
}

/** Numeric stand-in for sign/shape math: alteration counts as half a step. */
export function degreeValue(x) { const { d, alt } = parseDegree(x); return d + alt * 0.5; }

/** degree (int or 'b<n>'/'#<n>') + root midi + intervals -> midi.
 *  Alterations are CLAMPED to the mode: 'b5' means "darken the 6th degree IF the
 *  mode hasn't already" — in dorian/major it lowers a semitone; in natural minor
 *  (already b6) it collides with the 5th degree and stays put. Same idea for '#'. */
export function degreeToMidi(degree, rootMidi, intervals, altArg = null) {
  const { d, alt } = altArg == null ? parseDegree(degree) : { d: degree, alt: altArg };
  const len = intervals.length;
  const idx = ((d % len) + len) % len;
  const oct = Math.floor(d / len);
  const base = rootMidi + intervals[idx] + 12 * oct;
  if (!alt) return base;
  const neighbor = degreeToMidi(d + alt, rootMidi, intervals, 0);
  const altered = base + alt;
  if (alt < 0) return altered > neighbor ? altered : base;
  return altered < neighbor ? altered : base;
}

/** pitch class (0-11) -> bare note name, spelled for the key */
export function pcToNoteName(pc, { flats = true } = {}) {
  const names = flats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return names[((pc % 12) + 12) % 12];
}

/** midi -> note name, flats for flat-ish keys */
export function midiToNoteName(midi, { flats = true } = {}) {
  return `${pcToNoteName(midi, { flats })}${Math.floor(midi / 12) - 1}`;
}

/** nearest midi to `midi` whose pitch class is in pcs; tie -> lower (D14) */
export function snapToPcs(midi, pcs) {
  if (!pcs || pcs.size === 0) return midi;
  let best = midi, bestDist = Infinity;
  for (let d = 0; d <= 11; d++) {
    for (const cand of [midi - d, midi + d]) {
      const pc = ((cand % 12) + 12) % 12;
      if (pcs.has(pc)) {
        const dist = Math.abs(cand - midi);
        if (dist < bestDist || (dist === bestDist && cand < best)) { best = cand; bestDist = dist; }
      }
    }
    if (bestDist <= d) break;
  }
  return best;
}

/** Motif transforms on degree arrays. Composable with '+': "invert+octave_up".
 *  Altered degrees ('b5') keep their alteration through every transform (the
 *  color travels with the note; under inversion this is an approximation). */
export function applyTransform(degrees, transform, scaleLen = 7) {
  let out = degrees.map(parseDegree);
  if (transform) {
    for (const t of String(transform).split('+').map((x) => x.trim())) {
      switch (t) {
        case '': break;
        case 'invert': {
          const pivot = out[0].d;
          out = out.map(({ d, alt }) => ({ d: pivot - (d - pivot), alt }));
          break;
        }
        case 'retrograde': out = out.slice().reverse(); break;
        case 'octave_up': out = out.map(({ d, alt }) => ({ d: d + scaleLen, alt })); break;
        case 'octave_down': out = out.map(({ d, alt }) => ({ d: d - scaleLen, alt })); break;
        case 'diminish': out = out.map(({ d, alt }, i) => i === 0 ? { d, alt } : { d: out[0].d + Math.trunc((d - out[0].d) / 2), alt }); break;
        default: throw new Error(`unknown motif transform "${t}"`);
      }
    }
  }
  return out.map(({ d, alt }) => alt === 0 ? d : (alt < 0 ? 'b' : '#') + d);
}

/** Does this key's signature use flats? Mode-aware via the relative major. */
const MODE_TO_MAJOR_OFFSET = { major: 0, ionian: 0, dorian: 10, phrygian: 8, lydian: 7, mixolydian: 5, aeolian: 3, minor: 3, locrian: 1, harmonicMinor: 3, melodicMinor: 3, majorPentatonic: 0, minorPentatonic: 3 };
const FLAT_MAJORS = new Set([5, 10, 3, 8, 1, 6]); // F Bb Eb Ab Db Gb
export function keyUsesFlats(key) {
  try {
    const { rootPc, scaleName, rootName } = parseKey(key);
    if (/b/.test(rootName)) return true;
    if (/#/.test(rootName)) return false;
    const majorPc = (rootPc + (MODE_TO_MAJOR_OFFSET[scaleName] ?? 0)) % 12;
    return FLAT_MAJORS.has(majorPc);
  } catch { return true; }
}

// ---------------------------------------------------------------------------
// Chord-scale assignment (D35 §2.2 step 2). Per chord IN KEY CONTEXT, the
// 7-note (or symmetric) scale that supplies melody pitches over it — chord
// tones plus consonant tensions, the "guarded but not chord-locked" vocabulary.
//
// Algorithm: PARENT-SCALE SEARCH. Try, in order, the key's own scale, then the
// borrowed-chord sources (the parallel mode, harmonic minor, melodic minor);
// the first parent containing the chord's core tones is rotated to the chord
// root and IS the chord-scale. A diatonic chord thus gets its classical mode
// (ii → dorian, V → mixolydian) with zero special-casing; a borrowed chord gets
// its source mode (bVII in major → mixolydian via the parallel minor); V7 in
// minor gets phrygian dominant via harmonic minor. Only a chord no parent
// explains (secondary dominants, true chromatic planing) falls back to its
// QUALITY's default scale. Avoid notes are derived, not listed: a scale tone a
// semitone above a chord tone (the b9 rule, interval-grammar §4.1/§6) — plus
// the major 3rd over sus, which is what sus suspends.
// ---------------------------------------------------------------------------

// core tones per ireal quality — the SHELL only, no auto-extensions (the
// documented-exception colors chordTones() adds would break the subset test)
const QUALITY_CORE = {
  '': [0, 4, 7], m: [0, 3, 7], 5: [0, 7], 2: [0, 2, 7], sus: [0, 5, 7],
  6: [0, 4, 7, 9], 69: [0, 2, 4, 7, 9], add9: [0, 2, 4, 7],
  m6: [0, 3, 7, 9], madd9: [0, 2, 3, 7],
  7: [0, 4, 7, 10], 9: [0, 2, 4, 7, 10], 13: [0, 4, 7, 9, 10],
  '^7': [0, 4, 7, 11], '^9': [0, 2, 4, 7, 11],
  m7: [0, 3, 7, 10], m9: [0, 2, 3, 7, 10], 'm^7': [0, 3, 7, 11],
  o: [0, 3, 6], o7: [0, 3, 6, 9], h: [0, 3, 6, 10], m7b5: [0, 3, 6, 10],
  '+': [0, 4, 8], aug: [0, 4, 8], '7sus': [0, 5, 7, 10],
};

// named scale rotations beyond SCALES, for a readable `mode` label
const EXTRA_MODE_NAMES = {
  '0,1,4,5,7,8,10': 'phrygianDominant', // harmonic minor mode 5
  '0,2,4,6,7,9,10': 'lydianDominant',   // melodic minor mode 4
  '0,1,3,4,6,8,10': 'altered',          // melodic minor mode 7
  '0,2,3,5,6,8,10': 'locrianNat2',      // melodic minor mode 6
  '0,2,3,5,6,8,9,11': 'wholeHalfDim',
  '0,1,3,4,6,7,9,10': 'halfWholeDim',
  '0,2,4,6,8,10': 'wholeTone',
  '0,2,4,5,7,8,11': 'harmonicMajor',
  '0,3,4,5,7,8,11': 'harmonicMinorM3',  // harmonic minor mode 3 shifted — rare
};

const DEFAULT_SCALE_BY_FAMILY = {
  major: SCALES.ionian, dominant: SCALES.mixolydian, minor: SCALES.dorian,
  halfdim: SCALES.locrian, dim: [0, 2, 3, 5, 6, 8, 9, 11], aug: [0, 2, 4, 6, 8, 10],
  sus: SCALES.mixolydian,
};

function qualityFamily(q) {
  if (/^(m7b5|h)/.test(q)) return 'halfdim';
  if (/^o/.test(q)) return 'dim';
  if (/^(\+|aug)/.test(q)) return 'aug';
  if (/sus/.test(q)) return 'sus';
  if (/^m(?!aj)/.test(q)) return 'minor';
  if (/\^/.test(q)) return 'major';
  if (/^(7|9|11|13)/.test(q)) return 'dominant';
  return 'major';
}

function modeName(rel) {
  const key = rel.join(',');
  for (const [name, ivls] of Object.entries(SCALES)) if (ivls.join(',') === key) return name;
  return EXTRA_MODE_NAMES[key] ?? 'custom';
}

/** The chord's CORE tones (triad/7th shell, pcs) — no auto-extensions.
 *  What "the chord forces" for melody purposes: an anchor set, and the tones
 *  a chromatic chord legitimately adds to a key-locked note supply. */
export function chordCoreTones(symbol) {
  const rootPc = chordRootPc(symbol);
  if (rootPc == null) return new Set();
  const core = QUALITY_CORE[chordQuality(symbol) ?? ''] ?? QUALITY_CORE[''];
  return new Set(core.map((s) => (rootPc + s) % 12));
}

/**
 * chordScale(symbol, key) -> {
 *   root, quality, mode, parent ('key'|'parallelMinor'|'parallelMajor'|
 *   'harmonicMinor'|'melodicMinor'|'quality'), rel (intervals above the chord
 *   root), pcs (absolute Set), avoid (absolute Set), safe (pcs minus avoid) }
 * Throws on an unresolvable chord root; unknown qualities use the major shell.
 */
export function chordScale(symbol, key) {
  const { rootPc: keyPc, scaleName, intervals } = parseKey(key);
  const rootPc = chordRootPc(symbol);
  if (rootPc == null) throw new Error(`chordScale: unresolvable chord "${symbol}"`);
  const quality = chordQuality(symbol) ?? '';
  const core = QUALITY_CORE[quality] ?? QUALITY_CORE[''];
  const corePcs = core.map((s) => (rootPc + s) % 12);

  const abs = (ivls) => new Set(ivls.map((x) => (keyPc + x) % 12));
  const majorish = ['major', 'ionian', 'lydian', 'mixolydian', 'majorPentatonic'].includes(scaleName);
  const parents = [{ id: 'key', pcs: abs(intervals) }];
  if (majorish) {
    parents.push({ id: 'parallelMinor', pcs: abs(SCALES.minor) });
    parents.push({ id: 'harmonicMinor', pcs: abs(SCALES.harmonicMinor) });
    parents.push({ id: 'melodicMinor', pcs: abs(SCALES.melodicMinor) });
  } else {
    parents.push({ id: 'harmonicMinor', pcs: abs(SCALES.harmonicMinor) });
    parents.push({ id: 'melodicMinor', pcs: abs(SCALES.melodicMinor) });
    parents.push({ id: 'parallelMajor', pcs: abs(SCALES.major) });
  }

  let rel = null, parent = 'quality';
  for (const p of parents) {
    if (corePcs.every((pc) => p.pcs.has(pc))) {
      rel = [...p.pcs].map((pc) => ((pc - rootPc) % 12 + 12) % 12).sort((a, b) => a - b);
      parent = p.id;
      break;
    }
  }
  if (!rel) rel = DEFAULT_SCALE_BY_FAMILY[qualityFamily(quality)].slice();

  const pcs = new Set(rel.map((s) => (rootPc + s) % 12));
  const chordPcSet = new Set(corePcs);
  const avoid = new Set();
  for (const pc of pcs) {
    if (chordPcSet.has(pc)) continue;
    if (chordPcSet.has(((pc - 1) % 12 + 12) % 12)) avoid.add(pc); // b9 above a chord tone
  }
  if (qualityFamily(quality) === 'sus') {
    const third = (rootPc + 4) % 12;
    if (pcs.has(third)) avoid.add(third);
  }
  const safe = new Set([...pcs].filter((pc) => !avoid.has(pc)));
  return { root: rootPc, quality, mode: modeName(rel), parent, rel, pcs, avoid, safe };
}

/** Sign sequence of a pitch/degree sequence: 1 up, -1 down, 0 same.
 *  Accepts plain numbers (midi, degrees) or altered-degree strings. */
export function contourSigns(seq) {
  const vals = seq.map((x) => (typeof x === 'number' ? x : degreeValue(x)));
  const out = [];
  for (let i = 1; i < vals.length; i++) out.push(Math.sign(vals[i] - vals[i - 1]));
  return out;
}
