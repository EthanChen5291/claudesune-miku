// r27 — the hand-authored city-pop / K-pop pack.
//
// His ask: "let's trying hardcoding a lot of chord progressions, tagging them
// with emtadata of when to apply, and then applying them in songs".
// His constraint, the same round: "note that engine changes as a result of this
// should not affect the niche genres".
//
// These tests pin the constraint first, because it is the one that silently
// breaks: a new entry that names 'desert' in its tags would leak the idiom into
// a lane with its own researched vocabulary and its own judged songs.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESSIONS_CITYPOP, NICHE_LANES, CASUAL_LANES, citypopFor, citypopEnvironments,
} from '../src/lib/progressions-citypop.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { exemplarPool } from '../src/lib/harmony-vary.js';

test('r27: the pack cannot reach a niche lane — his ruling, pinned', () => {
  // (a) no entry may TAG a niche lane
  for (const [name, e] of Object.entries(PROGRESSIONS_CITYPOP)) {
    for (const env of e.appliesWhen.environments) {
      assert.ok(!NICHE_LANES.has(env), `${name} claims the niche lane "${env}"`);
      assert.ok(CASUAL_LANES.has(env),
        `${name} claims "${env}", which is not in the permitted CASUAL_LANES set`);
    }
  }
  // (b) and the selector refuses one even if asked directly
  for (const env of NICHE_LANES) {
    assert.deepEqual(citypopFor({ environment: env }), [],
      `citypopFor returned entries for the niche lane "${env}"`);
    assert.deepEqual(citypopFor({ environment: env, emotion: 'calm', bpm: 90 }), [],
      `citypopFor leaked into "${env}" when given a full vibe`);
  }
  // (c) the two sets must not overlap, or (a) and (b) could both pass vacuously
  for (const l of CASUAL_LANES) assert.ok(!NICHE_LANES.has(l), `${l} is in both sets`);
});

test('r27: the pack stays OUT of ALL_PROGRESSIONS and out of every retrieval pool', () => {
  for (const name of Object.keys(PROGRESSIONS_CITYPOP)) {
    assert.equal(ALL_PROGRESSIONS[name], undefined, `${name} leaked into ALL_PROGRESSIONS`);
  }
  for (const family of ['major', 'minor', 'modal', null]) {
    const pool = exemplarPool({ family });
    assert.equal(pool.entries.filter(([n]) => n.startsWith('cp_')).length, 0,
      `citypop entry in the ${family} pool`);
  }
});

test('r27: every entry is honest, parses, and carries usable metadata', () => {
  const entries = Object.entries(PROGRESSIONS_CITYPOP);
  assert.ok(entries.length >= 12, `only ${entries.length} progressions — he asked for "a lot"`);
  for (const [name, e] of entries) {
    assert.equal(e.pack, 'citypop', `${name}: pack`);
    assert.equal(e.provenance, 'hand-authored', `${name}: provenance`);
    assert.equal(e.ratified, false, `${name}: ratified without an ear`);
    assert.equal(e.needsEar, true, `${name}: must still need an ear`);
    assert.ok(['major', 'minor'].includes(e.family), `${name}: family`);
    assert.ok(e.idiomName && e.idiomName.length > 8, `${name}: no idiom name`);
    const n = parseDegrees(e.degrees).length;
    assert.ok(n >= 3, `${name}: degrees do not parse to a progression`);
    assert.equal(e.voicedAs.length, n, `${name}: voicedAs length`);
    assert.equal(e.chordUnits.length, n, `${name}: chordUnits length`);
    const w = e.appliesWhen;
    assert.ok(w && Array.isArray(w.emotions) && w.emotions.length, `${name}: no emotions`);
    assert.ok(Array.isArray(w.environments) && w.environments.length, `${name}: no environments`);
    assert.ok(Array.isArray(w.bpm) && w.bpm.length === 2 && w.bpm[0] < w.bpm[1],
      `${name}: bpm must be [min, max]`);
    assert.ok(['low', 'mid', 'high'].includes(w.energy), `${name}: energy`);
    assert.ok(['city-pop', 'j-pop', 'k-pop'].includes(w.idiom), `${name}: idiom`);
    assert.ok(e.notes && e.notes.length > 40, `${name}: a row with no reasoning is not knowledge`);
  }
});

test('r27: the idiom is SEVENTHS, not triads — the thing that makes it the idiom', () => {
  // His standing note (D88): plain triad runs read "generic". Measured on the
  // reels, the triad is essentially absent from this vocabulary. If a future
  // edit strips the qualities off these degrees the pack stops being city-pop.
  let coloured = 0, total = 0;
  for (const [name, e] of Object.entries(PROGRESSIONS_CITYPOP)) {
    for (const tok of e.degrees.split(/\s+/)) {
      total += 1;
      if (tok.includes(':')) coloured += 1;
    }
    assert.ok(e.degrees.includes(':'), `${name}: not one coloured chord`);
  }
  assert.ok(coloured / total > 0.9,
    `only ${(100 * coloured / total).toFixed(0)}% of chords carry a quality — the pack has gone triadic`);
});

test('r27: chordUnits are on the measured grid and the pack is majority-uneven overall', () => {
  const GRID = new Set([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
  let uneven = 0, total = 0;
  for (const [name, e] of Object.entries(PROGRESSIONS_CITYPOP)) {
    for (const u of e.chordUnits) {
      assert.ok(GRID.has(u), `${name}: chordUnits value ${u} is off the grid`);
      total += 1;
      if (u !== 1) uneven += 1;
    }
  }
  // Not every entry is uneven — the royal road and the Komuro genuinely are not,
  // and forcing them would be inventing a finding. But the pack as a whole must
  // carry the length device, or it is just a chord list.
  assert.ok(uneven / total > 0.25,
    `only ${(100 * uneven / total).toFixed(0)}% of chords are off the modal length`);
  const unevenEntries = Object.values(PROGRESSIONS_CITYPOP)
    .filter((e) => new Set(e.chordUnits).size > 1).length;
  assert.ok(unevenEntries >= 6, `only ${unevenEntries} entries carry an uneven length shape`);
});

test('r27: citypopFor actually selects, and is deterministic', () => {
  // a lobby prompt gets the lobby entries
  const lobby = citypopFor({ emotion: 'calm', environment: 'menu', bpm: 85, energy: 'low' });
  assert.ok(lobby.length >= 2, 'no progression for a calm menu at 85bpm');
  assert.ok(lobby.every((r) => r.entry.appliesWhen.emotions.includes('calm')));
  assert.ok(lobby.every((r) => r.entry.appliesWhen.environments.includes('menu')));

  // an action prompt gets the k-pop minor one, not a lounge entry
  const action = citypopFor({ emotion: 'tense', environment: 'boss', bpm: 120 });
  assert.ok(action.length >= 1, 'no progression for a tense boss');
  assert.equal(action[0].name, 'cp_kpop_minor_anthem');

  // tempo is a hard filter: the lounge entries do not survive a fast prompt
  const fast = citypopFor({ emotion: 'calm', environment: 'menu', bpm: 200 });
  assert.deepEqual(fast, [], 'a 200bpm lounge prompt should match nothing');

  // deterministic
  const a = citypopFor({ emotion: 'nostalgic', environment: 'shop', bpm: 100 }).map((r) => r.name);
  const b = citypopFor({ emotion: 'nostalgic', environment: 'shop', bpm: 100 }).map((r) => r.name);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort(), [...new Set(a)].sort(), 'duplicate entries returned');
});

test('r27: the tag vocabulary is reachable — no entry is dead', () => {
  // An entry whose tags no prompt can satisfy is knowledge nobody will ever hear.
  const seen = new Set();
  for (const [name, e] of Object.entries(PROGRESSIONS_CITYPOP)) {
    const w = e.appliesWhen;
    const mid = Math.round((w.bpm[0] + w.bpm[1]) / 2);
    const hit = citypopFor({ emotion: w.emotions[0], environment: w.environments[0], bpm: mid });
    assert.ok(hit.some((r) => r.name === name),
      `${name} cannot be selected by its own tags`);
    seen.add(name);
  }
  assert.equal(seen.size, Object.keys(PROGRESSIONS_CITYPOP).length);
  // and every environment the pack claims is a real casual lane
  for (const env of citypopEnvironments()) assert.ok(CASUAL_LANES.has(env), `unknown lane ${env}`);
});
