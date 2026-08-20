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

/** degree (int) + root midi + intervals -> midi */
export function degreeToMidi(degree, rootMidi, intervals) {
  const len = intervals.length;
  const idx = ((degree % len) + len) % len;
  const oct = Math.floor(degree / len);
  return rootMidi + intervals[idx] + 12 * oct;
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

/** Motif transforms on degree arrays. Composable with '+': "invert+octave_up". */
export function applyTransform(degrees, transform, scaleLen = 7) {
  let out = degrees.slice();
  if (!transform) return out;
  for (const t of String(transform).split('+').map((x) => x.trim())) {
    switch (t) {
      case '': break;
      case 'invert': {
        const pivot = out[0];
        out = out.map((d) => pivot - (d - pivot));
        break;
      }
      case 'retrograde': out = out.slice().reverse(); break;
      case 'octave_up': out = out.map((d) => d + scaleLen); break;
      case 'octave_down': out = out.map((d) => d - scaleLen); break;
      case 'diminish': out = out.map((d, i) => i === 0 ? d : out[0] + Math.trunc((d - out[0]) / 2)); break;
      default: throw new Error(`unknown motif transform "${t}"`);
    }
  }
  return out;
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

/** Sign sequence of a pitch/degree sequence: 1 up, -1 down, 0 same. */
export function contourSigns(seq) {
  const out = [];
  for (let i = 1; i < seq.length; i++) out.push(Math.sign(seq[i] - seq[i - 1]));
  return out;
}
