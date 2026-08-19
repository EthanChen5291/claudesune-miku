// Chord-symbol → pitch-class resolution, via the SAME dictionary the songs use
// (ireal, through chord().dict('ireal').voicing()), so harmonic assertions judge
// against exactly what the player would sound. Cached per symbol.

import { chord, pure, noteToMidi } from '@strudel/core';
import { rootNotes, voicingRegistry } from '@strudel/tonal';

const toneCache = new Map();
const rootCache = new Map();

// interval string like '3m', '7M', '9M', '13M', '5P', '11A' -> semitones (mod 12)
const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
function intervalToPc(ivl) {
  const m = /^(\d+)([PMmAd])$/.exec(ivl.trim());
  if (!m) return null;
  const num = Number(m[1]);
  const deg = ((num - 1) % 7) + 1;
  let semis = DEGREE_SEMITONES[deg];
  const q = m[2];
  if (q === 'm') semis -= 1;
  else if (q === 'A') semis += 1;
  else if (q === 'd') semis -= [1, 4, 5].includes(deg) ? 1 : 2;
  return ((semis % 12) + 12) % 12;
}

const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function parseSymbol(symbol) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(String(symbol).trim());
  if (!m) return null;
  let pc = NOTE_PC[m[1]];
  if (m[2] === '#') pc += 1;
  if (m[2] === 'b') pc -= 1;
  return { rootPc: ((pc % 12) + 12) % 12, quality: m[3] ?? '' };
}

/**
 * Pitch classes (0-11) of a chord symbol like "Fm9", "Db^7", "Eb7".
 * Unions ALL of the ireal dictionary's voicings for the quality, so legitimate
 * extensions (the 9th over a 7 chord, 13ths, ...) count as chord tones — a
 * single sampled voicing was too strict (flagged F over Eb7). Falls back to
 * querying one voicing when the quality is not in the dictionary.
 */
export function chordTones(symbol) {
  if (toneCache.has(symbol)) return toneCache.get(symbol);
  let pcs = new Set();
  const parsed = parseSymbol(symbol);
  const dict = voicingRegistry?.ireal?.dictionary;
  if (parsed && dict?.[parsed.quality]) {
    pcs.add(parsed.rootPc);
    for (const voicing of [].concat(dict[parsed.quality])) {
      for (const ivl of String(voicing).split(/\s+/)) {
        const rel = intervalToPc(ivl);
        if (rel != null) pcs.add((parsed.rootPc + rel) % 12);
      }
    }
    // Documented-exceptions policy (§3.3): conventional diatonic extensions count
    // as chord tones — the 9th everywhere, the 11th on minor family, the 13th on
    // dominant/major family. These are consonant colors, not wrong notes.
    const q = parsed.quality;
    pcs.add((parsed.rootPc + 2) % 12); // 9th
    if (/^m(?!aj)/.test(q)) pcs.add((parsed.rootPc + 5) % 12); // 11th (minor family only — it's an avoid note over major)
    if (/7|9|13|\^/.test(q) && !/^m/.test(q)) pcs.add((parsed.rootPc + 9) % 12); // 13th (dom/major 7ths)
  } else {
    try {
      const haps = chord(pure(symbol)).dict('ireal').voicing().queryArc(0, 1).filter((h) => h.hasOnset());
      for (const h of haps) {
        const m = noteToMidi(h.value.note);
        if (typeof m === 'number' && !Number.isNaN(m)) pcs.add(((Math.round(m) % 12) + 12) % 12);
      }
    } catch { /* unknown chord */ }
  }
  toneCache.set(symbol, pcs);
  return pcs;
}

/** Root pitch class (0-11) of a chord symbol, or null. */
export function chordRootPc(symbol) {
  if (rootCache.has(symbol)) return rootCache.get(symbol);
  let pc = null;
  try {
    // standalone registered functions take the pattern LAST: rootNotes(octave, pat)
    const haps = rootNotes(2, chord(pure(symbol))).queryArc(0, 1).filter((h) => h.hasOnset());
    const m = noteToMidi(haps[0]?.value?.note);
    if (typeof m === 'number' && !Number.isNaN(m)) pc = ((Math.round(m) % 12) + 12) % 12;
  } catch { /* ignore */ }
  rootCache.set(symbol, pc);
  return pc;
}

/**
 * Build a chord timeline [{from, to, symbol, pcs}] from a harmony stream's haps
 * (values carrying .chord, or plain strings).
 */
export function chordTimeline(haps) {
  const out = [];
  for (const h of haps) {
    const symbol = typeof h.value === 'string' ? h.value : h.value?.chord;
    if (!symbol) continue;
    out.push({
      from: h.whole.begin.valueOf(),
      to: h.whole.end.valueOf(),
      symbol,
      pcs: chordTones(symbol),
    });
  }
  out.sort((a, b) => a.from - b.from);
  return out;
}

export function chordAt(timeline, t) {
  for (const seg of timeline) if (t >= seg.from - 1e-9 && t < seg.to - 1e-9) return seg;
  return null;
}
