// r28 — the Serum producer's own loops, and the safety shape every video-read
// pack in this project carries.
//
// The pack exists because his ask was "make a song suite ... in the genre his
// songs are". The research it comes from is explicit that these progressions
// are ONE PRODUCER'S HABIT and not a finding (reel-layers-r22.md §5.3), so the
// tests below pin that the pack cannot leak into anything that would treat it
// as one — the counted harmony model, or a retrieval pool.

import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRESSIONS_SERUM, NICHE_LANES, serumFor, SERUM_TEMPI } from '../src/lib/progressions-serum.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { exemplarPool } from '../src/lib/harmony-vary.js';

test('r28: the pack stays OUT of ALL_PROGRESSIONS and every retrieval pool', () => {
  // D95: build-harmony-model.mjs counts every entry regardless of `ratified`,
  // so merging restages the counted model and re-rolls `treat` on judged songs.
  for (const name of Object.keys(PROGRESSIONS_SERUM)) {
    assert.equal(ALL_PROGRESSIONS[name], undefined, `${name} leaked into ALL_PROGRESSIONS`);
  }
  for (const family of ['major', 'minor', 'modal', null]) {
    const pool = exemplarPool({ family });
    assert.equal(pool.entries.filter(([n]) => n.startsWith('sr_')).length, 0,
      `serum entry in the ${family} pool — every unpinned song's fnv % pool.length just moved`);
  }
});

test('r28: the pack cannot reach a niche lane — his standing ruling', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_SERUM)) {
    for (const env of e.appliesWhen.environments) {
      assert.ok(!NICHE_LANES.has(env), `${name} claims the niche lane "${env}"`);
    }
  }
  for (const env of NICHE_LANES) {
    assert.deepEqual(serumFor({ environment: env }), [], `serumFor leaked into "${env}"`);
    assert.deepEqual(serumFor({ environment: env, emotion: 'somber', bpm: 80 }), [],
      `serumFor leaked into "${env}" on a full vibe`);
  }
});

test('r28: every entry is honest about what it is and where it was read', () => {
  const entries = Object.entries(PROGRESSIONS_SERUM);
  assert.equal(entries.length, 6);
  for (const [name, e] of entries) {
    assert.equal(e.pack, 'serum', `${name}: pack`);
    assert.equal(e.provenance, 'video-transcribed', `${name}: provenance`);
    assert.equal(e.ratified, false, `${name}: ratified without an ear`);
    assert.equal(e.needsEar, true, `${name}: must still need an ear`);
    // ALL NINE REELS ARE MINOR. The research refuses to transfer anything from
    // them to a major or modal context, so a major entry here would be inventing
    // evidence that does not exist.
    assert.equal(e.family, 'minor', `${name}: the reel set contains no major-key evidence`);
    assert.ok(e.source && /MP4|mp4/.test(e.source), `${name}: no source file named`);
    assert.ok(e.read && e.read.length > 8, `${name}: no transcription reading quoted`);
    assert.ok(e.notes && e.notes.length > 60, `${name}: a row with no reasoning is not knowledge`);
    const n = parseDegrees(e.degrees).length;
    assert.ok(n >= 3, `${name}: degrees do not parse to a progression`);
    assert.equal(e.voicedAs.length, n, `${name}: voicedAs length`);
    assert.equal(e.chordUnits.length, n, `${name}: chordUnits length`);
    const w = e.appliesWhen;
    assert.ok(w.emotions?.length && w.environments?.length, `${name}: no tags`);
    assert.ok(Array.isArray(w.bpm) && w.bpm[0] < w.bpm[1], `${name}: bpm must be [min,max]`);
  }
});

test('r28: the idiom is COLOURED, not triadic — D88', () => {
  let coloured = 0, total = 0;
  for (const [name, e] of Object.entries(PROGRESSIONS_SERUM)) {
    for (const tok of e.degrees.split(/\s+/)) { total += 1; if (tok.includes(':')) coloured += 1; }
    assert.ok(e.degrees.includes(':'), `${name}: not one coloured chord`);
  }
  assert.equal(coloured, total, 'a plain triad entered a pack whose reels show 4-6 note voicings');
});

test('r28: every entry is reachable by its own tags, and the selector is deterministic', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_SERUM)) {
    const w = e.appliesWhen;
    const mid = Math.round((w.bpm[0] + w.bpm[1]) / 2);
    const hit = serumFor({ emotion: w.emotions[0], environment: w.environments[0], bpm: mid });
    assert.ok(hit.some((r) => r.name === name), `${name} cannot be selected by its own tags`);
  }
  const a = serumFor({ emotion: 'somber', environment: 'space', bpm: 80 }).map((r) => r.name);
  const b = serumFor({ emotion: 'somber', environment: 'space', bpm: 80 }).map((r) => r.name);
  assert.deepEqual(a, b, 'selection is not deterministic');
  assert.deepEqual([...a].sort(), [...new Set(a)].sort(), 'duplicate entries returned');
  assert.deepEqual(serumFor({ emotion: 'calm', environment: 'rest', bpm: 200 }), [],
    'a 200bpm prompt should match nothing — the genre is 63-127');
});

test('r28: the tempo band is the reels’ own', () => {
  assert.ok(SERUM_TEMPI.length >= 6);
  assert.equal(Math.min(...SERUM_TEMPI), 63, 'the slowest reel is 63 BPM');
  assert.equal(Math.max(...SERUM_TEMPI), 127, 'the fastest reel is 127 BPM');
});
