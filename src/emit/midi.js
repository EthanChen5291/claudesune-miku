// MIDI export: queried haps -> Standard MIDI File via @tonejs/midi.
//
// The haps are the same events the harness verifies (queryArc ground truth), so
// time/pitch/velocity are exact — including baked-in feel like swingBy offsets
// and continuous-signal gains (a saw-driven riser exports as a velocity ramp).
// What does NOT survive is timbre/FX (s, bank, lpf, room, delay, attack...):
// MIDI carries notes; sound is re-applied at render time (soundfont/DAW).
//
// Layout: one track per label (drum haps and pitched haps of the same label get
// separate tracks — a MIDI track has one channel, and drums must sit on ch 10).
// 1 cycle = 1 bar (D7): tempo and time signature are derived from cpm + meter so
// the DAW's bar grid lines up with the engine's cycle grid.

import tonejsMidi from '@tonejs/midi'; // CJS module: no named ESM exports
const { Midi } = tonejsMidi;
import { pitchOf, gainOf } from '../harness/signature.js';
import { parseMeter } from '../harness/metrics.js';

// Strudel/Dirt drum names -> General MIDI percussion (channel 10). Both the
// engine's spellings (rim, oh) and the Dirt-Samples spellings (rs, ho) appear
// in songs (DECISIONS: sample-name audit), so both are mapped.
const GM_DRUM = {
  bd: 36, sd: 38, rim: 37, rs: 37, cp: 39, hh: 42, oh: 46, ho: 46,
  ht: 50, mt: 47, lt: 45, cr: 49, crash: 49, rd: 51, ride: 51,
  sh: 70, shaker: 70, cb: 56, cowbell: 56, tb: 54, tambourine: 54,
  perc: 63, click: 37, misc: 76, fx: 55,
};

// Best-effort GM program per synth waveform, for soundfont preview renders only
// (a DAW render assigns real instruments per track and ignores this).
const GM_PROGRAM = {
  square: 80, pulse: 80, sawtooth: 81, saw: 81, supersaw: 81,
  triangle: 73, tri: 73, sine: 79,
  piano: 0, epiano: 4, rhodes: 4, organ: 16, bass: 33,
};

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function isDrum(value) {
  return value != null && typeof value === 'object'
    && typeof value.s === 'string' && GM_DRUM[value.s] !== undefined
    && pitchOf(value) == null;
}

/**
 * Build a MIDI file from per-label haps (the Map produced by hapsByLabel).
 *
 * opts: cpm (from evaluateSong; null -> strudel default 30 with a warning),
 *       meter '4/4', from (cycle offset subtracted so the export starts at tick
 *       0), title, includeMuted (default false).
 *
 * Returns { bytes: Uint8Array, midi, bpm, warnings, tracks: [{label, kind,
 * channel, program, notes}], skipped: [{label, reason}] }.
 */
export function songToMidi(haps, { cpm = null, meter = '4/4', from = 0, title = null, includeMuted = false } = {}) {
  const { num, den } = parseMeter(meter);
  const quartersPerCycle = (4 * num) / den;
  const warnings = [];
  if (cpm == null) {
    cpm = 30; // strudel default cps = 0.5
    warnings.push('song sets no tempo (setcpm); assuming strudel default 30 cpm');
  }
  const bpm = cpm * quartersPerCycle;

  const midi = new Midi();
  midi.header.setTempo(bpm);
  midi.header.timeSignatures.push({ ticks: 0, timeSignature: [num, den] });
  if (title) midi.header.name = title;
  midi.header.update();
  const ticksPerCycle = midi.header.ppq * quartersPerCycle;
  const ticksOf = (frac) => Math.round((frac.valueOf() - from) * ticksPerCycle);

  // Pitched tracks get distinct channels so multitimbral players keep labels
  // apart; 9 is reserved for percussion. More labels than channels just wrap.
  const pitchedChannels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
  let nextChannel = 0;
  const takeChannel = () => {
    if (nextChannel === pitchedChannels.length) warnings.push('more than 15 pitched labels: reusing channels');
    return pitchedChannels[nextChannel++ % pitchedChannels.length];
  };

  const tracks = [];
  const skipped = [];
  const unknownSounds = new Set();

  const addNotes = (track, hs, kind) => {
    for (const h of hs) {
      const v = h.value;
      const startTicks = ticksOf(h.whole.begin);
      let durationTicks = ticksOf(h.whole.end) - startTicks;
      const clip = typeof v?.clip === 'number' ? v.clip : typeof v?.legato === 'number' ? v.legato : null;
      if (clip != null && clip > 0) durationTicks = Math.round(durationTicks * clip);
      track.addNote({
        midi: kind === 'drums' ? GM_DRUM[v.s] : clamp(Math.round(pitchOf(v)), 0, 127),
        ticks: Math.max(startTicks, 0),
        durationTicks: Math.max(durationTicks, 1),
        velocity: clamp(gainOf(v), 1 / 127, 1),
      });
    }
  };

  for (const [label, entry] of haps) {
    if (entry.error) { skipped.push({ label, reason: `query error: ${entry.error}` }); continue; }
    if (entry.muted && !includeMuted) { skipped.push({ label, reason: 'muted' }); continue; }
    const onsets = entry.haps.filter((h) => h.whole && h.whole.begin.valueOf() >= from - 1e-9);
    if (!onsets.length) { skipped.push({ label, reason: 'no haps in range' }); continue; }

    const drums = [], pitched = [], unmapped = [];
    for (const h of onsets) {
      if (isDrum(h.value)) drums.push(h);
      else if (pitchOf(h.value) != null) pitched.push(h);
      else unmapped.push(h);
    }
    for (const h of unmapped) if (h.value?.s) unknownSounds.add(h.value.s);
    if (unmapped.length) warnings.push(`${label}: ${unmapped.length} hap(s) have neither a pitch nor a known drum sound — dropped`);

    if (pitched.length) {
      const track = midi.addTrack();
      track.name = label;
      track.channel = takeChannel();
      // program: the label's most common sound name, else piano
      const counts = new Map();
      for (const h of pitched) { const s = h.value?.s; if (s) counts.set(s, (counts.get(s) ?? 0) + 1); }
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      track.instrument.number = GM_PROGRAM[top] ?? 0;
      addNotes(track, pitched, 'pitched');
      tracks.push({ label, kind: 'pitched', channel: track.channel, program: track.instrument.number, notes: pitched.length });
    }
    if (drums.length) {
      const track = midi.addTrack();
      track.name = pitched.length ? `${label} (drums)` : label;
      track.channel = 9;
      addNotes(track, drums, 'drums');
      tracks.push({ label: track.name, kind: 'drums', channel: 9, program: 0, notes: drums.length });
    }
  }

  if (unknownSounds.size) warnings.push(`unmapped sound names: ${[...unknownSounds].sort().join(', ')}`);
  if (!tracks.length) warnings.push('no exportable notes found');

  return { bytes: new Uint8Array(midi.toArray()), midi, bpm, warnings, tracks, skipped };
}
