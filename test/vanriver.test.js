// r27 — the @vanrivermusic pack: 8 progressions read off the screen recording
// Ethan handed over on 2026-08-29, together with the vibe labels he wrote in the
// DM thread. Same safety shape as the r26 chordcamera pack, plus the two
// measurements this pack exists to carry: chord LENGTH and chord SUBDIVISION.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESSIONS_VANRIVER, VANRIVER_SUBDIVISION, VANRIVER_LENGTH_LAW,
} from '../src/lib/progressions-vanriver.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { exemplarPool } from '../src/lib/harmony-vary.js';

test('r27: the pack stays OUT of ALL_PROGRESSIONS', () => {
  // Same reason as r26: build-harmony-model.mjs counts every entry regardless of
  // `ratified`, so merging restages the counted model and re-rolls `treat` on
  // judged songs (D95). Promotion is per-entry, by hand, after an ear.
  for (const name of Object.keys(PROGRESSIONS_VANRIVER)) {
    assert.equal(ALL_PROGRESSIONS[name], undefined, `${name} leaked into ALL_PROGRESSIONS`);
  }
});

test('r27: nothing in the pack can reach a retrieval pool', () => {
  for (const family of ['major', 'minor', 'modal', null]) {
    const pool = exemplarPool({ family });
    assert.equal(pool.entries.filter(([n]) => n.startsWith('vid_vr_')).length, 0,
      `vanriver entry in the ${family} pool`);
  }
});

test('r27: every entry is honest about what it is', () => {
  const entries = Object.entries(PROGRESSIONS_VANRIVER);
  assert.equal(entries.length, 8);
  for (const [name, e] of entries) {
    assert.equal(e.coverage, null, `${name}: claims a coverage nothing computed`);
    assert.equal(e.ratified, false, `${name}: ratified without an ear`);
    assert.equal(e.needsEar, true, `${name}: must still need an ear`);
    assert.equal(e.provenance, 'video-transcribed', `${name}: provenance`);
    assert.equal(e.pack, 'vanriver', `${name}: pack`);
    assert.equal(e.character, null, `${name}: character is written by the ear, never invented`);
    assert.ok(['major', 'minor'].includes(e.family), `${name}: family`);
    assert.ok(parseDegrees(e.degrees).length >= 3, `${name}: degrees parse`);
    // the printed symbol is kept alongside the reduced degrees, chord for chord
    const n = parseDegrees(e.degrees).length;
    assert.equal(e.voicedAs.length, n, `${name}: voicedAs length`);
    assert.equal(e.chordUnits.length, n, `${name}: chordUnits length`);
    assert.equal(e.attacksPerChord.length, n, `${name}: attacksPerChord length`);
    // every chord the dialect could not spell must SAY so
    assert.ok(Array.isArray(e.dialectDrops), `${name}: dialectDrops missing`);
    // a voicing is either read off printed labels or absent — never guessed
    assert.ok(e.voicingRead === null || typeof e.voicingRead === 'string',
      `${name}: voicingRead must be a read or null`);
  }
});

test('r27: chordUnits are RELATIVE and the pack is not metrically even', () => {
  // The whole point of the pack. If a future edit flattens these to all-1s the
  // length finding is gone and the entries are worth no more than a chord list.
  const UNITS = new Set([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
  let uneven = 0, total = 0;
  for (const [name, e] of Object.entries(PROGRESSIONS_VANRIVER)) {
    for (const u of e.chordUnits) {
      assert.ok(UNITS.has(u), `${name}: chordUnits value ${u} is off the measured grid`);
      total += 1;
      if (u !== 1) uneven += 1;
    }
  }
  assert.ok(uneven / total > 0.5,
    `the pack must stay majority-uneven (measured 63.2%); got ${(100 * uneven / total).toFixed(1)}%`);
});

test('r27: the three short-slot devices, counted', () => {
  // The finding stated as a test, and the test is why the finding is honest.
  // The pack's first draft claimed the shortest chord is ALWAYS an unstable one.
  // This assertion refuted it TWICE — on vid_vr_cloudy (two half-length Cm7
  // re-voicings of one stable chord) and then on vid_vr_funky (a chromatic
  // descent that holds the BORROWED chord and shortens the diatonic ones).
  // All three devices are named and counted here so none can be quietly dropped
  // and no future edit can restore the tidier, wrong version.
  const UNSTABLE = /dim|b5|#5|b9|#9|#11|\/|sus/;
  let unstable = 0, split = 0, inverted = 0, even = 0;
  for (const [name, e] of Object.entries(PROGRESSIONS_VANRIVER)) {
    const min = Math.min(...e.chordUnits);
    if (min >= 1) { even += 1; continue; }
    const shortest = e.chordUnits
      .map((u, i) => [u, e.voicedAs[i]])
      .filter(([u]) => u === min)
      .map(([, sym]) => sym);
    if (shortest.some((sym) => UNSTABLE.test(sym))) unstable += 1;
    else if (new Set(shortest).size < shortest.length) split += 1;
    else {
      inverted += 1;
      assert.equal(name, 'vid_vr_funky',
        `${name}: a SECOND reel shortens only stable chords — the counterexample ` +
        'is no longer a single case and the note in the pack header must be rewritten');
    }
  }
  assert.equal(unstable, VANRIVER_LENGTH_LAW.shortSlotIsUnstableChord);
  assert.equal(split, VANRIVER_LENGTH_LAW.shortSlotIsRevoicingSplit);
  assert.equal(inverted, VANRIVER_LENGTH_LAW.shortSlotIsStableChord);
  assert.equal(even, VANRIVER_LENGTH_LAW.shortSlotNotApplicable);
});

test('r27: the subdivision constants match what was measured', () => {
  // These numbers are quoted in DECISIONS.md and CLAUDE.md. Pinning them means a
  // later edit cannot quietly restate the finding.
  assert.equal(VANRIVER_SUBDIVISION.chordsMeasured, 155);
  assert.equal(VANRIVER_SUBDIVISION.meanAttacksPerChord, 5.91);
  assert.ok(VANRIVER_SUBDIVISION.singleStrikeSlots < 0.2,
    'the "only 17% of chords are one block strike" finding');
  assert.ok(VANRIVER_SUBDIVISION.overlayShowsFractionOfAttacks < 0.35,
    'the "video alone cannot see repeats" finding');
  assert.equal(VANRIVER_LENGTH_LAW.chords, 155);
  assert.ok(VANRIVER_LENGTH_LAW.notModalUnit > 0.6);
  const s = Object.values(VANRIVER_LENGTH_LAW.ratios).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(s - 1) < 0.02, `ratio distribution sums to ${s}, not 1`);
});

test('r27: his own vibe labels survive verbatim', () => {
  // hisLabel is the most valuable field in the pack — a direct emotion mapping
  // from his ear. A paraphrase would destroy it.
  const labelled = Object.values(PROGRESSIONS_VANRIVER).filter((e) => e.hisLabel);
  assert.equal(labelled.length, 6);
  const reflective = PROGRESSIONS_VANRIVER.vid_vr_reflective;
  assert.match(reflective.hisLabel, /pinky to thumb/,
    'his one compositional instruction must stay attached to the reel he wrote it on');
  assert.match(PROGRESSIONS_VANRIVER.vid_vr_cloudy.hisLabel, /cloudy\/moody day/);
  assert.match(PROGRESSIONS_VANRIVER.vid_vr_hotel.hisLabel, /hotel/);
});
