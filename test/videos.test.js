// D57: the hand-transcribed video pack. These entries have NO MIDI behind them
// (transcribed by eye from igexport-*.mp4), so the tests defend the honesty of
// the record rather than agreement with a source that cannot be checked.

import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRESSIONS_VIDEOS } from '../src/lib/progressions-videos.js';
import { FIGURATIONS_VIDEOS } from '../src/lib/figurations-videos.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure } from '../src/binder/bind.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

test('D57: every video entry is honest about what it is', () => {
  const entries = Object.entries(PROGRESSIONS_VIDEOS);
  assert.ok(entries.length >= 15, `only ${entries.length} entries`);
  for (const [name, e] of entries) {
    // no MIDI behind these -> the coverage claim must be null, never a number
    assert.equal(e.coverage, null, `${name} claims a coverage no labeller computed`);
    assert.equal(e.provenance, 'video-transcribed', name);
    // Ethan endorsed the SOURCES; that must not leak into ratification (A6.1)
    assert.equal(e.sourceEndorsed, true, name);
    assert.equal(e.ratified, false, `${name}: endorsement of the source pre-ratified the transcription`);
    assert.equal(e.needsEar, true, name);
    // sections must say where they came from and how long they ran
    assert.ok(e.song && e.section && e.sectionBars > 0, `${name} has no section identity`);
    assert.ok(e.source?.startsWith('igexport-'), `${name} does not name its video`);
    // the display labels survive even where the grammar simplified them
    assert.ok(Array.isArray(e.voicedAs) && e.voicedAs.length === parseDegrees(e.degrees).length,
      `${name}: voicedAs does not match the degrees chord-for-chord`);
  }
});

test('D57: the pack is registered, parseable, and renders in both keys', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_VIDEOS)) {
    assert.ok(ALL_PROGRESSIONS[name], `${name} not in the registry`);
    assert.equal(ALL_PROGRESSIONS[name].pack, 'igvideo');
    const cyc = parseDegrees(e.degrees);
    assert.ok(cyc.length >= 3, `${name}: a section of ${cyc.length} chords is a pair, not a section`);
    for (const key of ['C:major', 'C:minor']) {
      const syms = renderProgression(e, key);
      assert.equal(syms.length, cyc.length);
      for (const s of syms) assert.match(s, /^[A-G][#b]?/);
    }
  }
});

test('D57: sections of one song are linked so they can be recombined', () => {
  // Ethan: "note that they can be mixed" — mixing needs the link
  const bySong = new Map();
  for (const [name, e] of Object.entries(PROGRESSIONS_VIDEOS)) {
    bySong.set(e.song, (bySong.get(e.song) ?? 0) + 1);
  }
  const multi = [...bySong.values()].filter((n) => n > 1).length;
  assert.ok(multi >= 4, `only ${multi} songs carry multiple sections — the section cutting was lost`);
});

test('D57: flourishes are placed events, and they play', async () => {
  for (const [name, e] of Object.entries(FIGURATIONS_VIDEOS)) {
    // a flourish without a stated placement is just another loop — the whole
    // point of the record is WHERE and WHY ("this shouldnt be included in the
    // chord progression but should be noted ... where they placed it")
    assert.equal(e.role, 'flourish', name);
    assert.ok(e.placement && e.function, `${name} does not say where it goes or what it is for`);
    assert.ok(e.seen > 0 && e.songs.length, name);
    const ctx = { harmony: ['Bbo7', 'Am7', 'F^7', 'G7'], barsPerChord: 1, key: 'C:major' };
    const r = bindFigure(e, ctx, '4/4', { sound: 'piano' });
    const ev = await evaluateSong(`setcpm(110/4)\np: ${r.expr}`);
    const haps = hapsByLabel(ev, 0, 4).get('p');
    assert.ok(haps && !haps.error && haps.haps.length > 0, `${name} does not play: ${haps?.error ?? 'empty'}`);
  }
});

test('D57: the dim run is all chord tones — fast but consonant, as observed', async () => {
  // The reason the run works at speed is that every note is a member of the o7.
  const e = FIGURATIONS_VIDEOS.vid_run_dim_ascent;
  for (const tok of e.figure) assert.match(tok, /^(R|3|5|7)\+*$/, `${tok} is not a chord member`);
  // ascending throughout, spanning > 1.5 octaves as seen in the video
  const ctx = { harmony: ['Bo7'], barsPerChord: 1, key: 'C:major' };
  const r = bindFigure(e, ctx, '4/4', { sound: 'piano' });
  const midis = r.boundMeta.notes.map((n) => n.midi);
  for (let i = 1; i < midis.length; i++) assert.ok(midis[i] > midis[i - 1], 'the run must ascend');
  assert.ok(midis.at(-1) - midis[0] >= 18, `span ${midis.at(-1) - midis[0]} semitones — the video shows over 1.5 octaves`);
});
