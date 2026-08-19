// Chord-symbol → pitch-class resolution, via the SAME dictionary the songs use
// (ireal, through chord().dict('ireal').voicing()), so harmonic assertions judge
// against exactly what the player would sound. Cached per symbol.

import { chord, pure, noteToMidi } from '@strudel/core';
import { rootNotes } from '@strudel/tonal';

const toneCache = new Map();
const rootCache = new Map();

/** Pitch classes (0-11) of a chord symbol like "Fm9", "Db^7", "Eb7". Empty set if unknown. */
export function chordTones(symbol) {
  if (toneCache.has(symbol)) return toneCache.get(symbol);
  let pcs = new Set();
  try {
    const haps = chord(pure(symbol)).dict('ireal').voicing().queryArc(0, 1).filter((h) => h.hasOnset());
    for (const h of haps) {
      const m = noteToMidi(h.value.note);
      if (typeof m === 'number' && !Number.isNaN(m)) pcs.add(((Math.round(m) % 12) + 12) % 12);
    }
  } catch { /* unknown chord */ }
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
