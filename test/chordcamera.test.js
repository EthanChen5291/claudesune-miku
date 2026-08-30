// r26 — the @ChordCamera pack: 19 progressions read off a screen recording
// Ethan handed over. These tests pin the two things that make the pack SAFE and
// the one thing that makes it HONEST.

import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRESSIONS_CHORDCAMERA } from '../src/lib/progressions-chordcamera.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { exemplarPool } from '../src/lib/harmony-vary.js';

test('r26: the pack stays OUT of ALL_PROGRESSIONS', () => {
  // Not a style preference — two consumers read ALL_PROGRESSIONS and neither
  // honours `ratified`: build-harmony-model.mjs counts every entry (so merging
  // restages the counted model and re-rolls `treat`, D95's documented failure),
  // and progressions.js is importer-generated (so the import line itself fails
  // `import-ldrolez.mjs --check`). Promotion is per-entry, by hand, after an ear.
  for (const name of Object.keys(PROGRESSIONS_CHORDCAMERA)) {
    assert.equal(ALL_PROGRESSIONS[name], undefined, `${name} leaked into ALL_PROGRESSIONS`);
  }
});

test('r26: nothing in the pack can reach a retrieval pool', () => {
  for (const family of ['major', 'minor', 'modal', null]) {
    const pool = exemplarPool({ family });
    assert.equal(pool.entries.filter(([n]) => n.startsWith('vid_cc_')).length, 0,
      `chordcamera entry in the ${family} pool`);
  }
});

test('r26: every entry is honest about what it is', () => {
  const entries = Object.entries(PROGRESSIONS_CHORDCAMERA);
  assert.equal(entries.length, 19);
  for (const [name, e] of entries) {
    // no MIDI behind these, ever
    assert.equal(e.coverage, null, `${name}: claims a coverage nothing computed`);
    assert.equal(e.ratified, false, `${name}: ratified without an ear`);
    assert.equal(e.needsEar, true, `${name}: must still need an ear`);
    assert.equal(e.provenance, 'video-transcribed', `${name}: provenance`);
    assert.equal(e.pack, 'chordcamera', `${name}: pack`);
    assert.equal(e.character, null, `${name}: character is written by the ear, never invented`);
    assert.ok(['major', 'minor'].includes(e.family), `${name}: family`);
    assert.ok(parseDegrees(e.degrees).length >= 3, `${name}: degrees parse`);
    // the published symbol is kept alongside the reduced degrees, chord for chord
    assert.equal(e.voicedAs.length, parseDegrees(e.degrees).length, `${name}: voicedAs length`);
    assert.equal(e.chordUnits.length, e.voicedAs.length, `${name}: chordUnits length`);
    assert.equal(e.bassNotes.length, e.voicedAs.length, `${name}: bassNotes length`);
    // every chord that the dialect could not spell must SAY so
    assert.ok(Array.isArray(e.dialectDrops), `${name}: dialectDrops missing`);
    assert.ok(e.chordUnits.every((u) => Number.isInteger(u) && u >= 1), `${name}: chordUnits`);
  }
});

test('r26: the excluded reel is absent', () => {
  // his ruling: "except for nonfuctional neo soul melodie, that one doesn't belong"
  const all = JSON.stringify(PROGRESSIONS_CHORDCAMERA);
  assert.ok(!/Non Functional/i.test(all), 'the excluded reel is in the pack');
  assert.ok(!/m11 m11/.test(all));
});

test('r26: duration is the structural signal — connectors are shorter than the chords around them', () => {
  // The finding the tracking produced: full length = structural, half = passing.
  // Pin the three entries whose own titles name the device.
  const passing = PROGRESSIONS_CHORDCAMERA.vid_cc_warm_passing;
  const dimIx = passing.voicedAs.indexOf('C#°7');
  assert.ok(dimIx > 0, 'the passing chord is present');
  assert.ok(passing.chordUnits[dimIx] < Math.max(...passing.chordUnits),
    'the passing chord is not shorter than the longest chord');

  const surprise = PROGRESSIONS_CHORDCAMERA.vid_cc_neosoul_essence;
  const ii = surprise.voicedAs.indexOf('Dm7b5');
  const V = surprise.voicedAs.indexOf('G7b13');
  assert.ok(ii >= 0 && V === ii + 1, 'the ii-V insert is adjacent');
  assert.ok(surprise.chordUnits[ii] < surprise.chordUnits[0]
    && surprise.chordUnits[V] < surprise.chordUnits[0],
    'both halves of the insert should be shorter than a structural chord');
});
