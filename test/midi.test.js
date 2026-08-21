// MIDI export (src/emit/midi.js): haps -> .mid must be exact w.r.t. the same
// queried events the harness verifies. Every assertion round-trips through a
// re-parse of the emitted bytes — we test the FILE, not the builder object.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import tonejsMidi from '@tonejs/midi';
const { Midi } = tonejsMidi;
import { songHaps } from '../src/harness/evaluate.js';
import { songToMidi } from '../src/emit/midi.js';
import { pitchOf, gainOf } from '../src/harness/signature.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

async function exportSource(source, opts = {}) {
  const to = opts.to ?? 4;
  const { evaluated, haps } = await songHaps(source, opts.from ?? 0, to);
  const res = songToMidi(haps, { cpm: evaluated.cpm, ...opts });
  return { res, reparsed: new Midi(res.bytes), haps };
}

test('neon-undertow round-trips: tempo, meter, drums on ch10, exact pitches/velocities', async () => {
  const dir = join(ROOT, 'songs', 'neon-undertow');
  const source = readFileSync(join(dir, 'song.strudel'), 'utf8');
  const meta = JSON.parse(readFileSync(join(dir, 'v7.meta.json'), 'utf8'));
  const { evaluated, haps } = await songHaps(source, 0, meta.totalCycles);
  const res = songToMidi(haps, { cpm: evaluated.cpm, meter: meta.meter, title: meta.title });
  const midi = new Midi(res.bytes);

  // SMF stores tempo as integer microseconds per quarter -> ~1e-4 bpm quantization
  assert.ok(Math.abs(midi.header.tempos[0].bpm - meta.bpm) < 0.001, `bpm ${midi.header.tempos[0].bpm} != ${meta.bpm}`);
  assert.deepEqual(midi.header.timeSignatures[0].timeSignature, [4, 4]);

  const kick = midi.tracks.find((t) => t.name === 'kick');
  assert.ok(kick, 'kick track exists');
  assert.equal(kick.channel, 9);
  assert.ok(kick.notes.every((n) => n.midi === 36), 'kick is all GM bass drum');
  assert.equal(kick.notes.length, haps.get('kick').haps.length);
  assert.equal(kick.notes[0].ticks, 0, 'first kick lands on tick 0');

  const bass = midi.tracks.find((t) => t.name === 'bass');
  assert.ok(bass && bass.channel !== 9);
  const bassHaps = haps.get('bass').haps;
  assert.equal(bass.notes.length, bassHaps.length);
  assert.equal(bass.notes[0].midi, Math.round(pitchOf(bassHaps[0].value)));
  assert.ok(Math.abs(bass.notes[0].velocity - gainOf(bassHaps[0].value)) <= 1 / 127 + 1e-9, 'velocity == gain within MIDI quantization');

  // every label with exportable haps became at least one track
  for (const label of ['kick', 'hats', 'bass', 'pads', 'lead', 'clap', 'riser', 'fill', 'impact']) {
    assert.ok(midi.tracks.some((t) => t.name.startsWith(label)), `track for ${label}`);
  }
  // continuous-gain riser exports a velocity ramp, not a constant
  const riser = midi.tracks.find((t) => t.name === 'riser');
  const vs = new Set(riser.notes.map((n) => n.velocity));
  assert.ok(vs.size > 4, 'riser keeps its gain ramp as velocities');
});

test('muted labels are skipped (includeMuted exports them)', async () => {
  const src = 'setcpm(120/4)\nx: s("bd*4")\n_y: s("hh*8")';
  const { reparsed, res } = await exportSource(src);
  assert.deepEqual(reparsed.tracks.map((t) => t.name), ['x']);
  assert.ok(res.skipped.some((s) => s.label === 'y' && s.reason === 'muted'));

  const { evaluated, haps } = await songHaps(src, 0, 4);
  const withMuted = songToMidi(haps, { cpm: evaluated.cpm, includeMuted: true });
  assert.deepEqual(new Midi(withMuted.bytes).tracks.map((t) => t.name).sort(), ['x', 'y']);
});

test('odd meter: 7/8 derives bpm and bar-aligned ticks from the meter', async () => {
  const src = 'setcpm(30)\nm: note("c3 c3 c3 c3 c3 c3 c3")';
  const { reparsed } = await exportSource(src, { meter: '7/8' });
  // 1 cycle = 1 bar of 7/8 = 3.5 quarters -> 30 cpm = 105 quarter-bpm
  assert.ok(Math.abs(reparsed.header.tempos[0].bpm - 105) < 0.001);
  assert.deepEqual(reparsed.header.timeSignatures[0].timeSignature, [7, 8]);
  const notes = reparsed.tracks[0].notes;
  const ticksPerCycle = reparsed.header.ppq * 3.5;
  assert.equal(notes[1].ticks, Math.round(ticksPerCycle / 7), 'second eighth lands on the 7-grid');
  assert.equal(notes[7].ticks, Math.round(ticksPerCycle), 'cycle 1 starts exactly at bar 2');
});

test('drum alias spellings (oh/rs) and unknown sounds', async () => {
  const src = 'setcpm(120/4)\nd: s("oh rs")\nu: s("nosuchsound")';
  const { reparsed, res } = await exportSource(src, { to: 1 });
  assert.deepEqual(reparsed.tracks[0].notes.map((n) => n.midi), [46, 37]);
  assert.ok(res.warnings.some((w) => w.includes('nosuchsound')), 'unknown sound warned');
  assert.ok(!reparsed.tracks.some((t) => t.name === 'u'), 'unmappable label emits no track');
});

test('clip shortens duration; gain maps to velocity; from-offset rebases to tick 0', async () => {
  const src = 'setcpm(120/4)\np: note("c3").clip(0.5).gain(0.5)';
  const { reparsed } = await exportSource(src, { to: 2, from: 1 });
  const n = reparsed.tracks[0].notes[0];
  assert.equal(n.ticks, 0, 'from-offset: first exported cycle starts at 0');
  assert.equal(n.durationTicks, Math.round(reparsed.header.ppq * 4 * 0.5));
  assert.ok(Math.abs(n.velocity - 0.5) <= 1 / 127 + 1e-9);
  assert.equal(n.midi, 48); // strudel c3
});

test('a label mixing drums and pitch splits into two tracks', async () => {
  const src = 'setcpm(120/4)\nmix: stack(s("bd*2"), note("e4 g4"))';
  const { reparsed } = await exportSource(src, { to: 1 });
  const names = reparsed.tracks.map((t) => t.name).sort();
  assert.deepEqual(names, ['mix', 'mix (drums)']);
  const drums = reparsed.tracks.find((t) => t.name === 'mix (drums)');
  assert.equal(drums.channel, 9);
});
