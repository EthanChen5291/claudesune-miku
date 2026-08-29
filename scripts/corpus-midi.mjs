// Extended Standard MIDI File reader for the ANALYSIS corpus (vgmusic-full).
//
// WHY THIS IS NOT src/ingest/midi.js. That reader feeds the COMMITTED importers
// (import-vgmusic / import-undertale -> the counted harmony model). Touching it
// risks moving judged material, which is exactly the D95/D96 trap. This file is
// standalone, lives in scripts/, and nothing under src/ imports it. Blast radius
// of a bug here is a research number, never a song.
//
// What it reads that the ingest reader deliberately does not:
//   - PROGRAM CHANGE per channel over time  -> GM instrument, i.e. WHO plays what
//   - channel 10 percussion, kept not dropped -> the percussion vocabulary
//   - CC1/7/10/11 + pitch bend               -> dynamics, pan, detune/vibrato
//   - the full TEMPO MAP and time-sig changes -> ritardando/accel as a device
//   - key signature meta                      -> a labelling cross-check
//
// Timing: everything is exposed in TICKS plus a quarter-note-normalised `beat`.

import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------- GM tables

export const GM_NAMES = [
  'Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano',
  'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavi',
  'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone',
  'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer',
  'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ',
  'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion',
  'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)',
  'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar harmonics',
  'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass',
  'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2',
  'Violin', 'Viola', 'Cello', 'Contrabass',
  'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani',
  'String Ensemble 1', 'String Ensemble 2', 'SynthStrings 1', 'SynthStrings 2',
  'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orchestra Hit',
  'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet',
  'French Horn', 'Brass Section', 'SynthBrass 1', 'SynthBrass 2',
  'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax',
  'Oboe', 'English Horn', 'Bassoon', 'Clarinet',
  'Piccolo', 'Flute', 'Recorder', 'Pan Flute',
  'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina',
  'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)',
  'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)',
  'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)',
  'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)',
  'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)',
  'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)',
  'Sitar', 'Banjo', 'Shamisen', 'Koto',
  'Kalimba', 'Bag pipe', 'Fiddle', 'Shanai',
  'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock',
  'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal',
  'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet',
  'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot',
];

/** GM family of a program number (0-127) */
export const GM_FAMILY = (p) => [
  'piano', 'chromatic_perc', 'organ', 'guitar', 'bass', 'strings', 'ensemble', 'brass',
  'reed', 'pipe', 'synth_lead', 'synth_pad', 'synth_fx', 'ethnic', 'percussive', 'sfx',
][Math.floor(p / 8)] ?? 'unknown';

/** GM percussion key map (channel 10), the notes that actually get used */
export const GM_DRUM = {
  27: 'High Q', 28: 'Slap', 29: 'Scratch Push', 30: 'Scratch Pull', 31: 'Sticks',
  32: 'Square Click', 33: 'Metronome Click', 34: 'Metronome Bell',
  35: 'Acoustic Bass Drum', 36: 'Bass Drum 1', 37: 'Side Stick', 38: 'Acoustic Snare',
  39: 'Hand Clap', 40: 'Electric Snare', 41: 'Low Floor Tom', 42: 'Closed Hi Hat',
  43: 'High Floor Tom', 44: 'Pedal Hi-Hat', 45: 'Low Tom', 46: 'Open Hi-Hat',
  47: 'Low-Mid Tom', 48: 'Hi-Mid Tom', 49: 'Crash Cymbal 1', 50: 'High Tom',
  51: 'Ride Cymbal 1', 52: 'Chinese Cymbal', 53: 'Ride Bell', 54: 'Tambourine',
  55: 'Splash Cymbal', 56: 'Cowbell', 57: 'Crash Cymbal 2', 58: 'Vibraslap',
  59: 'Ride Cymbal 2', 60: 'Hi Bongo', 61: 'Low Bongo', 62: 'Mute Hi Conga',
  63: 'Open Hi Conga', 64: 'Low Conga', 65: 'High Timbale', 66: 'Low Timbale',
  67: 'High Agogo', 68: 'Low Agogo', 69: 'Cabasa', 70: 'Maracas',
  71: 'Short Whistle', 72: 'Long Whistle', 73: 'Short Guiro', 74: 'Long Guiro',
  75: 'Claves', 76: 'Hi Wood Block', 77: 'Low Wood Block', 78: 'Mute Cuica',
  79: 'Open Cuica', 80: 'Mute Triangle', 81: 'Open Triangle', 82: 'Shaker',
  83: 'Jingle Bell', 84: 'Belltree', 85: 'Castanets', 86: 'Mute Surdo', 87: 'Open Surdo',
};

/** coarse percussion role — what the hit DOES, independent of its GM name */
export const DRUM_ROLE = (k) => {
  if ([35, 36].includes(k)) return 'kick';
  if ([37, 38, 40, 39].includes(k)) return 'snare';
  if ([42, 44, 46].includes(k)) return 'hat';
  if ([49, 52, 55, 57].includes(k)) return 'crash';
  if ([51, 53, 59].includes(k)) return 'ride';
  if ([41, 43, 45, 47, 48, 50].includes(k)) return 'tom';
  if ([60, 61, 62, 63, 64, 65, 66, 78, 79, 86, 87].includes(k)) return 'hand_drum';
  if ([54, 69, 70, 82, 83, 84, 85, 58].includes(k)) return 'shaker';
  if ([56, 67, 68, 75, 76, 77, 80, 81].includes(k)) return 'wood_metal';
  if ([27, 28, 29, 30, 31, 32, 33, 34, 71, 72, 73, 74].includes(k)) return 'fx';
  return 'other';
};

// ---------------------------------------------------------------- reader

class Reader {
  constructor(buf) { this.b = buf; this.p = 0; }
  u8() { return this.b[this.p++]; }
  u16() { const v = this.b.readUInt16BE(this.p); this.p += 2; return v; }
  u32() { const v = this.b.readUInt32BE(this.p); this.p += 4; return v; }
  str(n) { const s = this.b.toString('latin1', this.p, this.p + n); this.p += n; return s; }
  bytes(n) { const s = this.b.subarray(this.p, this.p + n); this.p += n; return s; }
  vlq() { let v = 0, c, g = 0; do { c = this.b[this.p++]; v = (v << 7) | (c & 0x7f); } while ((c & 0x80) && ++g < 6); return v; }
}

/**
 * readCorpusMidi(path) -> rich event record. Throws on anything it cannot time
 * correctly rather than guessing — a mis-timed file poisons every statistic it
 * lands in, and at 31k files nobody is listening to spot it.
 */
export function readCorpusMidi(path) {
  const buf = readFileSync(path);
  const r = new Reader(buf);
  if (r.str(4) !== 'MThd') throw new Error('not a MIDI file (no MThd)');
  const headerLen = r.u32();
  const format = r.u16();
  const ntrks = r.u16();
  const division = r.u16();
  r.p += Math.max(0, headerLen - 6);
  if (division & 0x8000) throw new Error('SMPTE division unsupported');
  if (!division) throw new Error('zero ppq');
  const ppq = division;

  const tracks = [];
  const tempos = [];      // {tick, bpm}
  const timeSigs = [];    // {tick, num, den}
  const keySigs = [];     // {tick, sf, minor}
  const markers = [];     // {tick, text}
  let endTick = 0;

  for (let t = 0; t < ntrks && r.p < buf.length; t++) {
    const id = r.str(4);
    const len = r.u32();
    const end = Math.min(r.p + len, buf.length);
    if (id !== 'MTrk') { r.p = end; continue; }

    const notes = [];
    const programs = [];   // {tick, channel, program}
    const ccs = [];        // {tick, channel, cc, value}
    const bends = [];      // {tick, channel, value}
    const open = new Map();
    let tick = 0, status = 0, name = null;

    while (r.p < end) {
      tick += r.vlq();
      if (r.p >= end) break;
      let b = r.b[r.p];
      if (b & 0x80) { status = b; r.p++; }
      const type = status & 0xf0;
      const channel = status & 0x0f;

      if (status === 0xff) {
        const meta = r.u8();
        const mlen = r.vlq();
        const data = r.bytes(mlen);
        if (meta === 0x03 && name == null) name = data.toString('latin1').trim();
        else if (meta === 0x06) markers.push({ tick, text: data.toString('latin1').trim() });
        else if (meta === 0x51 && mlen === 3) {
          const us = (data[0] << 16) | (data[1] << 8) | data[2];
          if (us > 0) tempos.push({ tick, bpm: 60000000 / us });
        } else if (meta === 0x58 && mlen >= 2) {
          if (data[0] > 0 && data[1] <= 8) timeSigs.push({ tick, num: data[0], den: 2 ** data[1] });
        } else if (meta === 0x59 && mlen >= 2) {
          keySigs.push({ tick, sf: (data[0] << 24) >> 24, minor: data[1] === 1 });
        }
        continue;
      }
      if (status === 0xf0 || status === 0xf7) { r.bytes(r.vlq()); continue; }

      if (type === 0x90 || type === 0x80) {
        const midi = r.u8(), vel = r.u8();
        const k = `${channel}:${midi}`;
        if (type === 0x90 && vel > 0) {
          // A re-attack on a still-open key closes the previous one. Without
          // this, held-note sequencing produces one giant note and every
          // duration statistic in the corpus skews long.
          const prev = open.get(k);
          if (prev) notes.push({ tick: prev.tick, dur: Math.max(1, tick - prev.tick), midi, velocity: prev.velocity, channel });
          open.set(k, { tick, velocity: vel });
        } else {
          const on = open.get(k);
          if (on) { notes.push({ tick: on.tick, dur: Math.max(1, tick - on.tick), midi, velocity: on.velocity, channel }); open.delete(k); }
        }
      } else if (type === 0xc0) { programs.push({ tick, channel, program: r.u8() }); }
      else if (type === 0xd0) { r.p += 1; }
      else if (type === 0xb0) { const cc = r.u8(), v = r.u8(); if ([1, 7, 10, 11, 64, 91, 93].includes(cc)) ccs.push({ tick, channel, cc, value: v }); }
      else if (type === 0xe0) { const lo = r.u8(), hi = r.u8(); bends.push({ tick, channel, value: ((hi << 7) | lo) - 8192 }); }
      else if (type === 0xa0) { r.p += 2; }
      else { r.p = end; break; }
    }
    for (const [k, on] of open) {
      const [ch, midi] = k.split(':').map(Number);
      notes.push({ tick: on.tick, dur: Math.max(1, tick - on.tick), midi, velocity: on.velocity, channel: ch });
    }
    notes.sort((a, b) => a.tick - b.tick || a.midi - b.midi);
    endTick = Math.max(endTick, tick);
    tracks.push({ index: t, name, notes, programs, ccs, bends });
    r.p = end;
  }

  const allNotes = tracks.flatMap((t) => t.notes).sort((a, b) => a.tick - b.tick || a.midi - b.midi);
  if (!allNotes.length) throw new Error('no notes');

  tempos.sort((a, b) => a.tick - b.tick);
  timeSigs.sort((a, b) => a.tick - b.tick);

  return {
    path, ppq, format, ntrks, tracks, notes: allNotes,
    tempos, timeSigs, keySigs, markers, endTick,
    bpm: tempos.length ? tempos[0].bpm : 120,
    timeSig: timeSigs.length ? [timeSigs[0].num, timeSigs[0].den] : [4, 4],
  };
}

// ---------------------------------------------------------------- parts

/**
 * A "part" is one instrumental voice: a (track, channel) pair, which is how
 * sequenced game MIDI keeps its parts separate — the property that made VGMusic
 * the right source in the first place (D52). Format-0 files put everything on
 * one track, so channel alone carries the split there.
 */
export function extractParts(mid) {
  const parts = new Map();
  for (const tr of mid.tracks) {
    // program per channel on this track, as of each tick
    const progOf = (ch, tick) => {
      let p = null;
      for (const pc of tr.programs) { if (pc.channel === ch && pc.tick <= tick) p = pc.program; else if (pc.tick > tick) break; }
      return p;
    };
    for (const n of tr.notes) {
      const key = `${tr.index}:${n.channel}`;
      let part = parts.get(key);
      if (!part) {
        part = {
          key, track: tr.index, channel: n.channel, name: tr.name,
          isDrum: n.channel === 9, notes: [], programs: new Set(),
          ccs: tr.ccs.filter((c) => c.channel === n.channel),
          bends: tr.bends.filter((c) => c.channel === n.channel),
        };
        parts.set(key, part);
      }
      const pg = progOf(n.channel, n.tick);
      if (pg != null) part.programs.add(pg);
      part.notes.push(n);
    }
  }
  for (const p of parts.values()) {
    p.programs = [...p.programs];
    p.program = p.programs.length ? p.programs[0] : null;
    p.instrument = p.isDrum ? 'DRUMS' : (p.program != null ? GM_NAMES[p.program] : 'unspecified');
    p.family = p.isDrum ? 'drums' : (p.program != null ? GM_FAMILY(p.program) : 'unknown');
  }
  return [...parts.values()].filter((p) => p.notes.length);
}

export const PC_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
