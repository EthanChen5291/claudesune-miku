// r30 — song applicability labels, his ruling: "label-wise for that song, x song
// could also be used given other various prompts rather than specific that one.
// so that instrument preset and pattern and what not works."

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SONG_LABELS, MOOD_CLASS_LANES, MOOD_CLASS_EMOTIONS, NICHE_LANES, songsFor, servesLine,
} from '../src/lib/song-labels.js';

test('r30: every label carries his note verbatim — no invented verdicts', () => {
  for (const [name, l] of Object.entries(SONG_LABELS)) {
    assert.ok(l.source && l.source.length > 60, `${name}: a label with no note behind it is an invented verdict`);
    assert.match(l.source, /card:/, `${name}: source must cite which export the note came from`);
    assert.ok(l.generatedFor?.emotion && l.generatedFor?.environment, `${name}: must record what it was generated for`);
    const hasClass = l.moodClass != null;
    const hasList = Array.isArray(l.servesEnvironments) && Array.isArray(l.servesEmotions);
    assert.ok(hasClass !== hasList || (hasClass && !hasList) || (!hasClass && hasList),
      `${name}: exactly one of moodClass / explicit lists`);
    if (hasClass) assert.ok(MOOD_CLASS_LANES[l.moodClass], `${name}: unknown moodClass "${l.moodClass}"`);
  }
});

test('r30: the class vocabulary is HIS — dark/calm/somber/epic, no bright', () => {
  assert.deepEqual(Object.keys(MOOD_CLASS_LANES).sort(), ['calm', 'dark', 'epic', 'somber']);
  assert.deepEqual(Object.keys(MOOD_CLASS_EMOTIONS).sort(), ['calm', 'dark', 'epic', 'somber']);
  // 'bright' has no card behind it; adding it here without one fails this test
});

test('r30: no label can reach a niche lane', () => {
  for (const [cls, lanes] of Object.entries(MOOD_CLASS_LANES)) {
    for (const l of lanes) assert.ok(!NICHE_LANES.has(l), `${cls} covers the niche lane "${l}"`);
  }
  for (const [name, l] of Object.entries(SONG_LABELS)) {
    for (const e of l.servesEnvironments ?? []) assert.ok(!NICHE_LANES.has(e), `${name} serves "${e}"`);
  }
  for (const env of NICHE_LANES) assert.deepEqual(songsFor({ environment: env }), []);
});

test('r30: selection works, is deterministic, and honours a re-label', () => {
  const dark = songsFor({ emotion: 'tense', environment: 'lab' });
  assert.ok(dark.some((x) => x.name === 'ls_stepwise_floor_mysterious'),
    'his "any dark environment" song must serve tense/lab');
  const a = songsFor({ emotion: 'somber', environment: 'aftermath' }).map((x) => x.name);
  const b = songsFor({ emotion: 'somber', environment: 'aftermath' }).map((x) => x.name);
  assert.deepEqual(a, b);
  // vr_moody_tense was RE-labelled ("doesn't convey tension or stealth") — it
  // must serve the somber lanes and NOT count stealth as home
  const re = songsFor({ emotion: 'somber', environment: 'aftermath' })
    .find((x) => x.name === 'vr_moody_tense');
  assert.ok(re, 're-labelled song missing from its new lanes');
  assert.equal(re.home, false);
});

test('r30: labels are read by name — the card line exists for the veto', () => {
  for (const name of Object.keys(SONG_LABELS)) {
    const line = servesLine(name);
    assert.ok(line && line.startsWith('also serves'), `${name}: no serves line`);
  }
  assert.equal(servesLine('no_such_song'), null);
});
