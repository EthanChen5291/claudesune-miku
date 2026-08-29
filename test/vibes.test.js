// D63: the vibe model — vocabulary closure and compile determinism.
// Closure is the design's core discipline: vibes.js only REFERENCES existing
// vocabularies; a word with no consumer cannot enter the system.

import test from 'node:test';
import assert from 'node:assert/strict';
import { EMOTIONS, ENVIRONMENTS, KEY_POOLS, compileVibe, vibeNames } from '../src/lib/vibes.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { PROGRESSIONS } from '../src/lib/progressions.js';

const INSTRUMENT_MOODS = new Set(Object.values(INSTRUMENTS).flatMap((i) => i.moods));
const LDROLEZ_TAGS = new Set(Object.values(PROGRESSIONS).flatMap((e) => e.moods ?? []));
const PERC_NAMES = new Set(Object.entries(RHYTHMS).filter(([, e]) => e.role === 'percussion').map(([n]) => n));
const FND_CLASSES = new Set(Object.values(FIGURATIONS_FOUNDATION).map((e) => e.class));
const ROLES = new Set(['boss', 'battle', 'chase', 'cutscene', 'character', 'credits', 'ending', 'town', 'overworld', 'shop', 'diegetic', 'menu', 'joke']);

test('emotions: 12 rows, words ⊆ instrument moods, tags ⊆ ldrolez tags', () => {
  assert.equal(Object.keys(EMOTIONS).length, 12);
  for (const [name, e] of Object.entries(EMOTIONS)) {
    for (const m of e.moods) assert.ok(INSTRUMENT_MOODS.has(m), `${name}: mood "${m}" has no instrument consumer`);
    for (const t of e.tags) assert.ok(LDROLEZ_TAGS.has(t), `${name}: tag "${t}" is not an ldrolez tag`);
    assert.equal(e.ratified, false);
    assert.equal(e.character, null);
  }
  // MOOD CALIBRATION (D60): mysterious must out-pull every other emotion's chromaticism
  assert.ok(Object.entries(EMOTIONS).every(([n, e]) => n === 'mysterious' || e.colorBias < EMOTIONS.mysterious.colorBias));
});

test('environments: 23 rows, every leaf word references an existing vocabulary', () => {
  assert.equal(Object.keys(ENVIRONMENTS).length, 23);
  for (const [name, env] of Object.entries(ENVIRONMENTS)) {
    assert.ok(ROLES.has(env.role), `${name}: unknown role "${env.role}"`);
    for (const m of env.envMoods) assert.ok(INSTRUMENT_MOODS.has(m), `${name}: mood "${m}" has no instrument consumer`);
    for (const c of env.figClasses) assert.ok(FND_CLASSES.has(c), `${name}: class "${c}" not in the foundation pack`);
    for (const p of env.percussion.patterns) assert.ok(PERC_NAMES.has(p), `${name}: percussion "${p}" not a rhythms.js percussion entry`);
    for (const i of [...env.instBias.boost, ...env.instBias.avoid]) {
      assert.ok(INSTRUMENTS[i], `${name}: instrument "${i}" not in the palette`);
    }
    const [lo, hi] = env.ensemble.layers;
    assert.ok(lo >= 0 && hi >= lo, `${name}: bad ensemble range`);
    assert.equal(env.ratified, false);
  }
});

test('compileVibe: deterministic, override precedence, null axes legal', () => {
  const a = compileVibe({ emotion: 'happy', environment: 'shop', name: 'demo' });
  const b = compileVibe({ emotion: 'happy', environment: 'shop', name: 'demo' });
  assert.deepEqual(a, b);
  assert.equal(a.role, 'shop');
  assert.equal(a.family, 'major');
  assert.ok(a.bpm >= 90 && a.bpm <= 120);
  assert.ok(a.moods[0] === 'warm', 'emotion words lead the mood list');
  // override wins
  assert.equal(compileVibe({ environment: 'construction', role: 'overworld', name: 'x' }).role, 'overworld');
  // null axes
  const envOnly = compileVibe({ environment: 'construction', name: 'x' });
  assert.equal(envOnly.vibe.emotion, null);
  assert.equal(envOnly.role, 'chase');
  const emoOnly = compileVibe({ emotion: 'sad', name: 'x' });
  assert.equal(emoOnly.role, null);
  assert.equal(emoOnly.family, 'minor');
});

test('the genocide transform: sad shop is slower, lower, drum-stripped', () => {
  const happy = compileVibe({ emotion: 'happy', environment: 'shop', name: 'pair' });
  const sad = compileVibe({ emotion: 'sad', environment: 'shop', name: 'pair' });
  assert.equal(sad.role, happy.role, 'environment material survives the transform');
  assert.ok(sad.bpm < happy.bpm * 0.75);
  assert.equal(sad.register.leadOctave, happy.register.leadOctave - 1);
  assert.equal(sad.percussion.presence, 'none');
  assert.equal(sad.family, 'minor');
});

test('ensemble dial: count always lands inside the environment range', () => {
  for (const environment of Object.keys(ENVIRONMENTS)) {
    for (let i = 0; i < 8; i++) {
      const v = compileVibe({ environment, name: `probe-${i}` });
      const [lo, hi] = ENVIRONMENTS[environment].ensemble.layers;
      assert.ok(v.ensemble.count >= lo && v.ensemble.count <= hi, `${environment}: ${v.ensemble.count} outside [${lo},${hi}]`);
    }
  }
});

test('key pools cover the three families and pick deterministically', () => {
  for (const fam of ['major', 'minor', 'modal']) assert.ok(Object.keys(KEY_POOLS[fam]).length >= 6);
  const names = vibeNames();
  assert.equal(names.emotions.length, 12);
  assert.equal(names.environments.length, 23);
  const picks = new Set(Array.from({ length: 40 }, (_, i) => compileVibe({ environment: 'fight', name: `k${i}` }).keyHint));
  assert.ok(picks.size >= 3, 'tonic variety over 40 hashed names');
});
