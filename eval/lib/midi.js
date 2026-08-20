// Minimal Standard MIDI File parser — enough to score the B0 (default-Claude)
// eval arm: notes with absolute times, velocities, track names, channels,
// time signature, tempo. Format 0/1, running status supported.

import { readFileSync } from 'node:fs';

export function parseMidi(path) {
  const buf = readFileSync(path);
  let pos = 0;
  const readStr = (n) => { const s = buf.toString('latin1', pos, pos + n); pos += n; return s; };
  const readU32 = () => { const v = buf.readUInt32BE(pos); pos += 4; return v; };
  const readU16 = () => { const v = buf.readUInt16BE(pos); pos += 2; return v; };
  const readU8 = () => buf[pos++];
  const readVar = () => {
    let v = 0;
    for (;;) { const b = readU8(); v = (v << 7) | (b & 0x7f); if (!(b & 0x80)) return v; }
  };

  if (readStr(4) !== 'MThd') throw new Error('not a MIDI file');
  const hlen = readU32();
  const format = readU16();
  const ntrks = readU16();
  const division = readU16();
  pos += hlen - 6;
  if (division & 0x8000) throw new Error('SMPTE division unsupported');

  const tracks = [];
  let tempo = 500000; // us per quarter
  let timeSig = null;

  for (let t = 0; t < ntrks; t++) {
    if (pos >= buf.length) break;
    if (readStr(4) !== 'MTrk') throw new Error(`bad track ${t}`);
    const len = readU32();
    const end = pos + len;
    let tick = 0;
    let running = null;
    const track = { name: null, notes: [], programs: [], channels: new Set() };

    // pending note-ons: key ch:note -> {tick, vel}
    const pending = new Map();
    while (pos < end) {
      tick += readVar();
      let status = buf[pos];
      if (status & 0x80) {
        pos++;
        // meta/sysex CLEAR running status (SMF spec) — treating them as running
        // status turned parse errors into silent stream corruption (review finding)
        running = status < 0xf0 ? status : null;
      } else {
        if (running == null) throw new Error(`running status with no prior status at ${pos}`);
        status = running;
      }
      const type = status >> 4;
      const ch = status & 0x0f;
      if (type === 0x9 || type === 0x8) {
        const note = readU8(); const vel = readU8();
        const key = `${ch}:${note}`;
        if (type === 0x9 && vel > 0) {
          pending.set(key, { tick, vel });
          track.channels.add(ch);
        } else {
          const on = pending.get(key);
          if (on) {
            track.notes.push({ tick: on.tick, dur: tick - on.tick, note, vel: on.vel, ch });
            pending.delete(key);
          }
        }
      } else if (type === 0xa || type === 0xb || type === 0xe) { pos += 2; }
      else if (type === 0xc) { track.programs.push({ tick, program: readU8(), ch }); track.channels.add(ch); }
      else if (type === 0xd) { pos += 1; }
      else if (status === 0xff) {
        const metaType = readU8(); const mlen = readVar();
        if (metaType === 0x03 && !track.name) track.name = buf.toString('latin1', pos, pos + mlen).trim();
        else if (metaType === 0x51) tempo = (buf[pos] << 16) | (buf[pos + 1] << 8) | buf[pos + 2];
        else if (metaType === 0x58) timeSig = { num: buf[pos], den: 2 ** buf[pos + 1] };
        pos += mlen;
      } else if (status === 0xf0 || status === 0xf7) { pos += readVar(); }
      else { throw new Error(`unknown status 0x${status?.toString(16)} at ${pos}`); }
    }
    // close any hanging notes at track end
    for (const [key, on] of pending) {
      const [ch2, note] = key.split(':').map(Number);
      track.notes.push({ tick: on.tick, dur: 0, note, vel: on.vel, ch: ch2 });
    }
    pos = end;
    tracks.push(track);
  }
  return { format, division, tempo, timeSig, tracks };
}

const DRUM_FAMILY = new Map([
  [35, 'kick'], [36, 'kick'],
  [37, 'rim'], [38, 'snare'], [40, 'snare'], [39, 'clap'],
  [42, 'hat'], [44, 'hat'], [46, 'hat'],
  [41, 'tom'], [43, 'tom'], [45, 'tom'], [47, 'tom'], [48, 'tom'], [50, 'tom'],
  [49, 'cymbal'], [51, 'cymbal'], [52, 'cymbal'], [53, 'cymbal'], [55, 'cymbal'], [57, 'cymbal'], [59, 'cymbal'],
]);

const GM_FAMILY = [
  [0, 7, 'keys'], [8, 15, 'chromatic'], [16, 23, 'organ'], [24, 31, 'guitar'],
  [32, 39, 'bass'], [40, 47, 'strings'], [48, 55, 'ensemble'], [56, 63, 'brass'],
  [64, 71, 'reed'], [72, 79, 'pipe'], [80, 87, 'lead'], [88, 95, 'pad'],
  [96, 103, 'fx'], [104, 111, 'ethnic'], [112, 119, 'perc'], [120, 127, 'fx'],
];
function gmFamily(program) {
  for (const [lo, hi, name] of GM_FAMILY) if (program >= lo && program <= hi) return name;
  return null;
}

/**
 * Streams from a MIDI file: { streamName: [{t (bars), pitch, vel, dur}] }.
 * Drum channel (10) splits by GM family; other tracks keyed by track name/channel.
 * barQuarters: quarter notes per bar (4/4 → 4, 7/8 → 3.5) — from the CASE meter so
 * all arms share the same time base.
 */
export function midiStreams(path, { barQuarters = 4 } = {}) {
  const midi = parseMidi(path);
  const streams = {};
  const push = (name, ev) => { (streams[name] ??= []).push(ev); };
  for (let i = 0; i < midi.tracks.length; i++) {
    const tr = midi.tracks[i];
    if (!tr.notes.length) continue;
    // unnamed tracks: fall back to the GM program family so instrument identity
    // is not discarded (review finding: unnamed-track edits were automatic leaks)
    const fallback = tr.programs.length ? gmFamily(tr.programs[0].program) : null;
    const base = (tr.name || fallback || `track${i}`).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `track${i}`;
    for (const n of tr.notes) {
      const t = round6(n.tick / midi.division / barQuarters);
      if (n.ch === 9) {
        const fam = DRUM_FAMILY.get(n.note) ?? 'perc';
        push(`${base}:${fam}`, { t, pitch: null, drumNote: n.note, vel: round6(n.vel / 127), dur: n.dur / midi.division / barQuarters });
      } else {
        push(base, { t, pitch: n.note, vel: round6(n.vel / 127), dur: n.dur / midi.division / barQuarters });
      }
    }
  }
  for (const evs of Object.values(streams)) evs.sort((a, b) => a.t - b.t || (a.pitch ?? a.drumNote ?? 0) - (b.pitch ?? b.drumNote ?? 0));
  return { streams, timeSig: midi.timeSig, tempo: midi.tempo };
}

function round6(x) { return Math.round(x * 1e6) / 1e6; }
