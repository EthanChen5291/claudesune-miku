// Standard MIDI File reader — no dependencies (A6.6: ingest tooling stays small).
// Reads only what extraction needs: note events with tick, duration, pitch and
// VELOCITY (velocity is the whole reason to prefer MIDI over a chord chart), plus
// tempo and time signature. Format 0 and 1; SMPTE division is rejected rather
// than silently mis-timed.

import { readFileSync } from 'node:fs';

class Reader {
  constructor(buf) { this.b = buf; this.p = 0; }
  u8() { return this.b[this.p++]; }
  u16() { const v = this.b.readUInt16BE(this.p); this.p += 2; return v; }
  u32() { const v = this.b.readUInt32BE(this.p); this.p += 4; return v; }
  str(n) { const s = this.b.toString('latin1', this.p, this.p + n); this.p += n; return s; }
  bytes(n) { const s = this.b.subarray(this.p, this.p + n); this.p += n; return s; }
  /** variable-length quantity */
  vlq() {
    let v = 0, c;
    do { c = this.b[this.p++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80);
    return v;
  }
}

/**
 * readMidi(path) -> {
 *   ppq, format, tracks: [{ name, notes: [{ tick, dur, midi, velocity, channel }] }],
 *   tempoBpm, timeSig: [num, den], notes (all tracks, sorted), endTick
 * }
 */
export function readMidi(path) {
  const r = new Reader(readFileSync(path));
  if (r.str(4) !== 'MThd') throw new Error(`${path}: not a MIDI file (no MThd)`);
  const headerLen = r.u32();
  const format = r.u16();
  const ntrks = r.u16();
  const division = r.u16();
  r.p += headerLen - 6;
  if (division & 0x8000) throw new Error(`${path}: SMPTE time division is not supported (need ticks-per-quarter)`);
  const ppq = division;

  const tracks = [];
  let tempoBpm = null, timeSig = null, endTick = 0;

  for (let t = 0; t < ntrks; t++) {
    if (r.p >= r.b.length) break;
    const id = r.str(4);
    const len = r.u32();
    const end = r.p + len;
    if (id !== 'MTrk') { r.p = end; continue; }

    const notes = [];
    const open = new Map(); // `${channel}:${midi}` -> { tick, velocity }
    let tick = 0, status = 0, name = null;

    while (r.p < end) {
      tick += r.vlq();
      let b = r.b[r.p];
      if (b & 0x80) { status = b; r.p++; } // else: running status, reuse `status`
      const type = status & 0xf0;
      const channel = status & 0x0f;

      if (status === 0xff) {
        const meta = r.u8();
        const mlen = r.vlq();
        const data = r.bytes(mlen);
        if (meta === 0x03 && name == null) name = data.toString('latin1').trim();
        else if (meta === 0x51 && mlen === 3) {
          const usPerQuarter = (data[0] << 16) | (data[1] << 8) | data[2];
          if (tempoBpm == null && usPerQuarter > 0) tempoBpm = 60000000 / usPerQuarter;
        } else if (meta === 0x58 && mlen >= 2 && timeSig == null) {
          timeSig = [data[0], 2 ** data[1]];
        }
        continue;
      }
      if (status === 0xf0 || status === 0xf7) { r.bytes(r.vlq()); continue; }

      if (type === 0x90 || type === 0x80) {
        const midi = r.u8();
        const vel = r.u8();
        const k = `${channel}:${midi}`;
        if (type === 0x90 && vel > 0) {
          open.set(k, { tick, velocity: vel });
        } else {
          const on = open.get(k);
          if (on) { notes.push({ tick: on.tick, dur: Math.max(1, tick - on.tick), midi, velocity: on.velocity, channel }); open.delete(k); }
        }
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) { r.p += 2; }
      else if (type === 0xc0 || type === 0xd0) { r.p += 1; }
      else { r.p = end; break; } // unrecognized status: bail out of this track
    }
    // notes still held at end-of-track get the track's length
    for (const [k, on] of open) {
      const midi = Number(k.split(':')[1]);
      notes.push({ tick: on.tick, dur: Math.max(1, tick - on.tick), midi, velocity: on.velocity, channel: Number(k.split(':')[0]) });
    }
    notes.sort((a, b) => a.tick - b.tick || a.midi - b.midi);
    endTick = Math.max(endTick, tick);
    tracks.push({ name, notes });
    r.p = end;
  }

  const notes = tracks.flatMap((t) => t.notes).sort((a, b) => a.tick - b.tick || a.midi - b.midi);
  return { ppq, format, tracks, notes, tempoBpm, timeSig: timeSig ?? [4, 4], endTick };
}

/**
 * A6.2 ingest triage. Quantized MIDI (velocity variance ~0 OR every onset dead on
 * the grid) is VALID FOR PITCH-SIDE EXTRACTION ONLY — its accents and microtiming
 * are the sequencer's, not a performance's. Returns the verdict plus the numbers
 * behind it, so a file is never silently trusted for feel it does not carry.
 */
export function triage({ notes, ppq }, { grid = 16 } = {}) {
  if (!notes.length) return { velocities: 0, velocityStdev: 0, offGridRatio: 0, verdict: 'empty', pitchOnly: true };
  const vels = notes.map((n) => n.velocity);
  const uniqueVels = new Set(vels).size;
  const mean = vels.reduce((a, b) => a + b, 0) / vels.length;
  const stdev = Math.sqrt(vels.reduce((a, v) => a + (v - mean) ** 2, 0) / vels.length);
  const step = (ppq * 4) / grid; // ticks per grid subdivision
  const dev = notes.map((n) => Math.min(n.tick % step, step - (n.tick % step)));
  const offGrid = dev.filter((d) => d > step * 0.02).length;
  const offGridRatio = offGrid / notes.length;
  const flatVelocity = stdev < 1 || uniqueVels === 1;
  const onGrid = offGridRatio < 0.02;
  // A6.2 splits into TWO independent questions, because a file can carry one kind
  // of feel and not the other: a hat line with authored swing but every note at
  // velocity 127 has real microtiming and no dynamics. Collapsing both into one
  // "quantized" flag would throw away the half that IS faithful.
  return {
    velocities: uniqueVels, velocityMean: round(mean), velocityStdev: round(stdev),
    offGridRatio: round(offGridRatio), flatVelocity, onGrid,
    accentsUsable: !flatVelocity,
    timingUsable: !onGrid,
    pitchOnly: flatVelocity && onGrid,
    verdict: flatVelocity && onGrid ? 'quantized-flat' : flatVelocity ? 'timing-only' : onGrid ? 'accents-only' : 'performance',
  };
}

const round = (x) => Math.round(x * 1000) / 1000;

/**
 * Smallest number of bars after which the pattern repeats (A6.5 repetition
 * detection — "the most repeated bar-level segment is almost always the riff").
 * A 16-bar export of a 2-bar loop should enter the library as 2 bars, not 16.
 */
export function loopPeriod(notes, barTicks, totalBars) {
  const sig = (n) => `${n.tick % barTicks}:${n.midi}:${n.velocity}`;
  const byBar = Array.from({ length: totalBars }, () => []);
  for (const n of notes) {
    const b = Math.floor(n.tick / barTicks);
    if (b < totalBars) byBar[b].push(sig(n));
  }
  const key = byBar.map((b) => b.sort().join('|'));
  for (let p = 1; p <= totalBars; p++) {
    if (totalBars % p !== 0) continue;
    let ok = true;
    for (let i = p; i < totalBars && ok; i++) if (key[i] !== key[i % p]) ok = false;
    if (ok) return p;
  }
  return totalBars;
}

/** notes grouped into simultaneity clusters (chords), by onset tick within tolerance */
export function chordEvents(notes, ppq, tolerance = 1 / 32) {
  const tol = ppq * 4 * tolerance;
  const out = [];
  for (const n of notes) {
    const last = out[out.length - 1];
    if (last && n.tick - last.tick <= tol) { last.notes.push(n); last.endTick = Math.max(last.endTick, n.tick + n.dur); }
    else out.push({ tick: n.tick, endTick: n.tick + n.dur, notes: [n] });
  }
  return out;
}
