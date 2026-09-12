// describe.js — the free-text prompt parser. Pure, deterministic, closed over
// the vibes.js vocabulary: every result names one of the 12 EMOTIONS and one of
// the 23 ENVIRONMENTS, with notes explaining which words drove each choice.

import test from 'node:test';
import assert from 'node:assert/strict';
import { describePrompt, describeMany, explain, DEFAULTS } from '../src/lib/describe.js';
import { EMOTIONS, ENVIRONMENTS } from '../src/lib/vibes.js';

const P1 = 'a frantic late-night city chase, synths everywhere, the singer breathless and furious';
const P2 = 'a soft bittersweet goodbye at a train station in the rain, piano and strings, sung gently';

const EMOTION_KEYS = new Set(Object.keys(EMOTIONS));
const ENVIRONMENT_KEYS = new Set(Object.keys(ENVIRONMENTS));

test('P1 (frantic city chase): tense × space, high, minor, electro, fullSynth', () => {
  // Emotion scoring: tense = furious 3 + frantic 2 = 5; excited = chase 2 +
  // frantic 1 + breathless 1 = 4. "furious" is the strongest emotional word in
  // the sentence and it is a tense word, so tense wins outright (no tie).
  // Environment: space = city 2 + night 1 + synth 1 + "late night" 1 = 5;
  // casino = city 1 + night 1 = 2; fight = chase 2; training = chase 1.
  // The synth lane (space) takes it — a city-at-night synth chase.
  const r = describePrompt(P1);
  assert.equal(r.emotion, 'tense');
  assert.equal(r.environment, 'space');
  assert.equal(r.energy, 'high');
  assert.equal(r.family, 'minor');
  assert.equal(r.genre, 'electro');
  assert.equal(r.bpm, null);
  assert.equal(r.hints.fullSynth, true);
  assert.equal(r.hints.guitar, undefined);
  assert.equal(r.hints.noDrums, undefined);
  assert.equal(r.hints.vocalDb, undefined); // "breathless" is not a loudness word
  assert.ok(r.notes.some((n) => n.startsWith('emotion: tense') && n.includes('furious')));
  assert.ok(r.notes.some((n) => n.startsWith('environment: space') && n.includes('city')));
  assert.equal(explain(r), 'tense × space (furious, frantic, city, night, synth, late night) · high · minor · electro');
});

test('P2 (bittersweet goodbye in the rain): sad × water, low, minor, ballad, quiet voice', () => {
  // sad = goodbye 3 + bittersweet 2 = 5 vs calm = soft 2 + gently 2 = 4;
  // water = rain 2 (no other environment word — "train station" is not training).
  const r = describePrompt(P2);
  assert.equal(r.emotion, 'sad');
  assert.equal(r.environment, 'water');
  assert.equal(r.energy, 'low');
  assert.equal(r.family, 'minor');
  assert.equal(r.genre, 'ballad');
  assert.equal(r.hints.vocalDb, -1.5); // "sung gently"
  assert.equal(r.hints.guitar, undefined);
  assert.equal(explain(r), 'sad × water (goodbye, bittersweet, rain) · low · minor · ballad');
});

test('explicit bpm parses ("at 128 bpm", "128bpm", "bpm of 96"); absent → null', () => {
  assert.equal(describePrompt('a bouncy shop tune at 128 bpm').bpm, 128);
  assert.equal(describePrompt('festival march, 140bpm, brass everywhere').bpm, 140);
  assert.equal(describePrompt('a lullaby with a bpm of 96').bpm, 96);
  assert.equal(describePrompt('a lullaby with no tempo given').bpm, null);
  assert.ok(describePrompt('at 128 bpm').notes.some((n) => n === 'bpm: 128 (explicit)'));
});

test('"no drums" → hints.noDrums; drums otherwise unset', () => {
  const r = describePrompt('a gentle piano piece by the lake, no drums');
  assert.equal(r.hints.noDrums, true);
  assert.ok(r.tags.includes('hint:noDrums'));
  assert.equal(describePrompt('a gentle piano piece by the lake').hints.noDrums, undefined);
  assert.equal(describePrompt('without percussion, just strings').hints.noDrums, true);
});

test('"no guitar" → guitar false; "guitar" → guitar true; neither → undefined', () => {
  assert.equal(describePrompt('a punk band song but no guitar').hints.guitar, false);
  assert.equal(describePrompt('a punk band song with crunchy guitars').hints.guitar, true);
  assert.equal(describePrompt('a punk band song').hints.guitar, undefined);
});

test('other hints: fullSynth, marcato, swing, duet, vocalDb up/down', () => {
  const r = describePrompt('electro boss fight, strings stabbing, swing feel, a duet with the voice up front');
  assert.equal(r.hints.fullSynth, true);
  assert.equal(r.hints.marcato, true);
  assert.equal(r.hints.swing, 0.585);
  assert.equal(r.hints.duet, true);
  assert.equal(r.hints.vocalDb, 1.5);
  assert.equal(describePrompt('two voices, call and response').hints.duet, true);
  assert.equal(describePrompt('keep the vocals soft and behind the band').hints.vocalDb, -1.5);
  assert.equal(describePrompt('a plain instrumental').hints.vocalDb, undefined);
});

test('determinism: same input → deep-equal output, and describeMany maps', () => {
  const a = describePrompt(P1);
  const b = describePrompt(P1);
  assert.deepEqual(a, b);
  assert.notEqual(a, b); // fresh objects, not a shared cache
  const many = describeMany([P1, P2, P1]);
  assert.equal(many.length, 3);
  assert.deepEqual(many[0], a);
  assert.deepEqual(many[2], a);
  assert.deepEqual(many[1], describePrompt(P2));
});

test('nonsense prompt → defaults (happy × shop) with an explaining note', () => {
  const r = describePrompt('xyzzy plugh quux');
  assert.equal(r.emotion, DEFAULTS.emotion);
  assert.equal(r.environment, DEFAULTS.environment);
  assert.equal(r.emotion, 'happy');
  assert.equal(r.environment, 'shop');
  assert.equal(r.energy, 'mid');
  assert.equal(r.family, null);
  assert.equal(r.genre, null);
  assert.equal(r.bpm, null);
  assert.ok(r.notes.some((n) => n.includes("default 'happy'")));
  assert.ok(r.notes.some((n) => n.includes("default 'shop'")));
  assert.equal(explain(r), 'happy × shop (defaults) · mid · — · —');
  // Empty / non-string input is also safe.
  assert.equal(describePrompt('').emotion, 'happy');
  assert.equal(describePrompt(undefined).environment, 'shop');
});

test('every returned emotion/environment is a valid vibes.js key', () => {
  const prompts = [
    P1, P2, 'xyzzy', '',
    'a haunted manor at midnight, cello and ghostly choir, whisper quiet',
    'sneaking through the castle guards, stealthy and tense, no drums',
    'a goofy kitchen cooking show polka with accordion',
    'a mysterious crystal cave, dripping water and echoing kalimba',
    'triumphant victory fanfare after the final boss, orchestra and choir',
    'nostalgic summer festival at school, fireworks, a catchy pop idol song',
    'a lonely desert caravan under the sun, sitar and hand drums, at 92 bpm',
    'happy winter snow day, sled and hot chocolate, bright and playful',
    'a cozy cafe on a rainy afternoon, jazz lounge, brushes on the kit',
    'the ruins after the war, somber and empty, a slow requiem for strings',
    'lab experiment gone wrong, glitchy robots, techno at 150bpm',
    'romantic sunset by the ocean, a love song sung gently',
  ];
  for (const r of describeMany(prompts)) {
    assert.ok(EMOTION_KEYS.has(r.emotion), `emotion ${r.emotion}`);
    assert.ok(ENVIRONMENT_KEYS.has(r.environment), `environment ${r.environment}`);
    assert.ok(['low', 'mid', 'high'].includes(r.energy));
    assert.ok([null, 'major', 'minor'].includes(r.family));
    assert.ok([null, 'rock', 'electro', 'pop', 'ballad', 'folk', 'jazz', 'orchestral'].includes(r.genre));
    assert.ok(r.bpm === null || Number.isInteger(r.bpm));
    assert.ok(Array.isArray(r.tags) && Array.isArray(r.notes) && r.notes.length >= 5);
    assert.ok(r.tags.includes(`emotion:${r.emotion}`) && r.tags.includes(`environment:${r.environment}`));
  }
});

test('vocabulary scoring reaches the entries own moods/envMoods (weight 1)', () => {
  // "sneaking" is only in stealth's envMoods; "sly" is a mysterious mood and a
  // stealth/casino envMood. Whole-word matching: "sneakingly" must NOT match.
  const r = describePrompt('sneaking around');
  assert.equal(r.environment, 'stealth');
  assert.equal(describePrompt('sneakingly weird').environment, 'shop');
  // Simple plurals fold: "synths" → synth, "memories" → memory.
  assert.equal(describePrompt('faded memories of home').emotion, 'nostalgic');
  assert.equal(describePrompt('synths and stars').environment, 'space');
});

test('ties are broken by vibes.js key order and say so in the notes', () => {
  // "epic" is a triumphant synonym (2) and an excited MOOD (1): triumphant wins
  // outright. "driving" alone is a mood of both excited and tense (1 each) —
  // excited comes first in key order.
  assert.equal(describePrompt('epic').emotion, 'triumphant');
  const r = describePrompt('driving');
  assert.equal(r.emotion, 'excited');
  assert.ok(r.notes.some((n) => n.includes('tie with tense broken by key order')));
});
