// Unified instrument-stream extraction for all three eval arms, so containment
// and effectiveness are scored identically (PROTOCOL.md: stream level, not label
// level — a monolithic drums track still gets per-voice streams).

import { evaluateSong, hapsByLabel } from '../../src/harness/evaluate.js';
import { pitchOf, gainOf, soundOf } from '../../src/harness/signature.js';
import { midiStreams } from './midi.js';

const S_FAMILY = [
  [/^(bd|kick)/, 'kick'],
  [/^(sd|snare)/, 'snare'],
  [/^(cp|clap|hc)/, 'clap'],
  [/^(rim|rs)/, 'rim'],
  [/^(hh|oh|ch|hat)/, 'hat'],
  [/^(lt|mt|ht|tom)/, 'tom'],
  [/^(cr|crash|rd|ride|cy)/, 'cymbal'],
  [/^(white|pink|brown|noise)/, 'noise'],
];

function sFamily(s) {
  if (!s) return null;
  const x = String(s).toLowerCase();
  for (const [re, fam] of S_FAMILY) if (re.test(x)) return fam;
  return null;
}

/** Strudel arm: { streams, error }. Stream = label, split by sound family when a label mixes families. */
export async function strudelStreams(source, { cycles = 64 } = {}) {
  let ev;
  try { ev = await evaluateSong(source); } catch (e) { return { streams: null, error: e.message }; }
  const haps = hapsByLabel(ev, 0, cycles);
  const streams = {};
  for (const [label, entry] of haps) {
    if (entry.error) return { streams: null, error: `${label}: ${entry.error}` };
    const fams = new Set(entry.haps.map((h) => sFamily(h.value?.s)).filter(Boolean));
    const split = fams.size > 1;
    for (const h of entry.haps) {
      const fam = sFamily(h.value?.s);
      const name = split && fam ? `${label}:${fam}` : label;
      (streams[name] ??= []).push({
        t: round6(h.whole.begin.valueOf()),
        pitch: pitchOf(h.value),
        vel: gainOf(h.value),
        sound: JSON.stringify(soundOf(h.value)),
        muted: entry.muted || undefined,
      });
    }
    if (!entry.haps.length) streams[label] ??= [];
  }
  for (const evs of Object.values(streams)) evs.sort((a, b) => a.t - b.t || (a.pitch ?? 0) - (b.pitch ?? 0));
  return { streams, error: null };
}

/** MIDI arm wrapper (already stream-shaped). */
export function midiArmStreams(path, barQuarters) {
  try {
    const { streams } = midiStreams(path, { barQuarters });
    return { streams, error: null };
  } catch (e) {
    return { streams: null, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Stream-name matching for the cases.json allowed_streams patterns
// ---------------------------------------------------------------------------

const SYNONYMS = {
  hat: ['hat', 'hh', 'hihat', 'hi_hat', 'hats', 'shaker'],
  kick: ['kick', 'bd', 'fourfloor'],
  snare: ['snare', 'sd', 'backbeat'],
  clap: ['clap', 'cp'],
  drum: ['drum', 'kick', 'snare', 'hat', 'clap', 'rim', 'tom', 'perc', 'cymbal', 'beat'],
  perc: ['perc', 'rim', 'tom', 'shaker', 'cymbal'],
  bass: ['bass', 'sub', '808'],
  lead: ['lead', 'melody', 'melodic', 'theme', 'hook', 'arp'],
  melody: ['melody', 'lead', 'melodic', 'theme'],
  chord: ['chord', 'chords', 'keys', 'pad', 'pads', 'piano', 'rhodes', 'epiano', 'harmony', 'stab'],
  keys: ['keys', 'piano', 'rhodes', 'epiano', 'chord', 'chords'],
  pad: ['pad', 'pads'],
  piano: ['piano', 'rhodes', 'epiano', 'keys'],
  rhodes: ['rhodes', 'epiano'],
  arp: ['arp', 'arpeggio'],
  riser: ['riser', 'rise', 'sweep', 'uplifter', 'noise', 'fx', 'transition', 'build'],
  fill: ['fill', 'roll', 'tom'],
  fx: ['fx', 'riser', 'sweep', 'impact', 'transition', 'noise', 'crash'],
  transition: ['transition', 'riser', 'fill', 'sweep', 'impact', 'fx', 'build', 'crash', 'boom'],
  sweep: ['sweep', 'downlifter'],
};

export function streamMatches(streamName, pattern) {
  if (pattern === '*') return true;
  const name = streamName.toLowerCase();
  const words = SYNONYMS[pattern] ?? [pattern];
  return words.some((w) => name.includes(w));
}

export function matchAllowed(streamName, allowedPatterns) {
  return allowedPatterns.some((p) => streamMatches(streamName, p));
}

function round6(x) { return Math.round(x * 1e6) / 1e6; }
