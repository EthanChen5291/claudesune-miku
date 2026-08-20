// Scale/degree math for the binder. Degrees are scale indices (0 = root);
// beyond the scale length they wrap with octave shifts, negatives go down.

import { noteToMidi } from '@strudel/core';

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

/** midi -> note name, flats for flat-ish keys */
export function midiToNoteName(midi, { flats = true } = {}) {
  const names = flats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${names[pc]}${oct}`;
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

/** Sign sequence of a pitch/degree sequence: 1 up, -1 down, 0 same.
 *  Accepts plain numbers (midi, degrees) or altered-degree strings. */
export function contourSigns(seq) {
  const vals = seq.map((x) => (typeof x === 'number' ? x : degreeValue(x)));
  const out = [];
  for (let i = 1; i < vals.length; i++) out.push(Math.sign(vals[i] - vals[i - 1]));
  return out;
}
