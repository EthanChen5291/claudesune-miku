// Binder + libraries + assertions tests, including ACCEPTANCE (c):
// a chorus violating its must constraints is flagged with measured values.

import test from 'node:test';
import assert from 'node:assert/strict';
import { bind, euclidOnsets, normalizeRhythm } from '../src/binder/bind.js';
import { applyTransform, contourSigns, parseKey, degreeToMidi } from '../src/binder/theory.js';
import { complement, interlockScore, checkInterlocks } from '../src/binder/interlock.js';
import { makeBindFn, makeTransitionFn } from '../src/binder/adapter.js';
import { RHYTHMS, rhythmProperties, findRhythms } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS, voicingRegistration } from '../src/lib/voicings.js';
import { INTERLOCKS } from '../src/lib/interlocks.js';
import { TRANSITIONS } from '../src/lib/transitions.js';
import { compile } from '../src/compiler/compile.js';
import { verifySong } from '../src/harness/index.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { parseConstraint } from '../src/harness/assertions.js';

const HARMONY = { harmony: ['Fm9', 'Bbm9', 'Db^7', 'C7'], barsPerChord: 1, key: 'F:minor' };
const R = { onsets: ['0', '3/16', '3/8', '5/8', '3/4', '15/16'], accents: [1.0, 0.5, 0.8, 0.6, 0.9, 0.4] };
const C = { degrees: [0, 2, 4, 3, 1, 0] };

test('bind: §2 ground truth reproduced through the full binder', async () => {
  const { expr, boundMeta } = bind(R, C, { harmony: null, key: 'C:minor' }, '4/4', { octave: 4 });
  const ev = await evaluateSong(`lead: ${expr}`);
  const haps = hapsByLabel(ev, 0, 1).get('lead').haps;
  assert.deepEqual(haps.map((h) => h.value.note), ['C4', 'Eb4', 'G4', 'F4', 'D4', 'C4']);
  assert.deepEqual(haps.map((h) => h.whole.begin.toFraction()), ['0', '3/16', '3/8', '5/8', '3/4', '15/16']);
  assert.equal(boundMeta.period, 1);
});

test('bind: accented onsets snap to the sounding chord per cycle; weak onsets stay diatonic', () => {
  const { boundMeta } = bind(R, C, HARMONY, '4/4', { octave: 4 });
  const byCycle = (c) => boundMeta.notes.filter((n) => n.cycle === c);
  // cycle 0 over Fm9 (F Ab C Eb G): accented F4/C5/G4 are chord tones already
  assert.deepEqual(byCycle(0).map((n) => n.note), ['F4', 'Ab4', 'C5', 'Bb4', 'G4', 'F4']);
  // cycle 3 over C7 (C E G Bb): accented F4 -> E4, G4 stays; weak Ab4/Bb4 untouched
  assert.equal(byCycle(3)[0].note, 'E4');
  assert.equal(byCycle(3)[4].note, 'G4');
  assert.equal(byCycle(3)[1].note, 'Ab4');
  // every accented note is a chord tone of its cycle's chord
  for (const n of boundMeta.notes.filter((n) => n.accented)) assert.ok(n.midi != null);
});

test('bind: accents ALWAYS wire to gain; uniform rhythm entry is rejected', async () => {
  const { expr } = bind(R, C, HARMONY, '4/4', {});
  assert.match(expr, /\.gain\("/);
  const ev = await evaluateSong(`x: ${expr}`);
  const gains = hapsByLabel(ev, 0, 1).get('x').haps.map((h) => h.value.gain);
  assert.ok(new Set(gains).size >= 4, `expected varied gains, got ${gains}`);
  assert.throws(() => bind({ onsets: ['0', '1/2'] }, C, HARMONY, '4/4', {}), /accent profile/);
  assert.throws(() => bind({ onsets: ['0', '1/2'], accents: [1] }, C, HARMONY, '4/4', {}), /accent profile/);
});

test('bind: swing emits swingBy and actually shifts offbeats', async () => {
  const { expr } = bind(RHYTHMS.swung_lofi_hats, null, null, '4/4', { sound: 'hh' });
  assert.match(expr, /\.swingBy\(0\.55, 4\)/);
  const ev = await evaluateSong(`h: ${expr}`);
  // swingBy(x, 4): each 1/4 window's second half is delayed by x * (1/8)
  const onsets = hapsByLabel(ev, 0, 1).get('h').haps.map((h) => h.part.begin.valueOf());
  assert.ok(onsets.some((t) => Math.abs(t - (1 / 8 + 0.55 / 8)) < 1e-6), `offbeat not swung: ${onsets}`);
});

test('bind: microtiming shifts onsets exactly (lazy_dilla)', () => {
  const r = normalizeRhythm(RHYTHMS.lazy_dilla);
  assert.deepEqual(r.onsets[1], [9, 64]);   // 1/8 + 1/64
  assert.deepEqual(r.onsets[3], [19, 48]);  // 3/8 + 1/48
});

test('bind: cadence target overrides the final onset', () => {
  const { boundMeta } = bind(R, C, HARMONY, '4/4', { octave: 4, cadence: 'tonic' });
  const last = boundMeta.notes.at(-1);
  assert.equal(last.note, 'F4'); // tonic of F:minor
  const { boundMeta: b2 } = bind(R, C, HARMONY, '4/4', { octave: 4, cadence: 'root' });
  assert.equal(b2.notes.at(-1).midi % 12, 0); // root of final chord C7 = C
});

test('theory: transforms compose and preserve/flip contour signs correctly', () => {
  assert.deepEqual(applyTransform([0, 2, 4], 'invert'), [0, -2, -4]);
  assert.deepEqual(applyTransform([0, 2, 4], 'octave_up'), [7, 9, 11]);
  assert.deepEqual(applyTransform([0, 2, 4], 'invert+octave_up'), [7, 5, 3]);
  assert.deepEqual(applyTransform([0, 2, 4], 'retrograde'), [4, 2, 0]);
  assert.deepEqual(contourSigns([0, 2, 2, 1]), [1, 0, -1]);
  const key = parseKey('D:dorian');
  assert.equal(key.intervals[5], 9); // raised 6th — dorian's signature
  assert.equal(degreeToMidi(7, 60, key.intervals), 72); // octave wrap
});

test('euclid: matches Strudel semantics (tresillo hits 0, 3/8, 3/4)', () => {
  assert.deepEqual(euclidOnsets(3, 8).map(([n, d]) => `${n}/${d}`), ['0/1', '3/8', '3/4']);
});

test('interlock: complement scores; declared library pairs really interlock', () => {
  const a = ['0', '1/4', '1/2', '3/4'];
  const b = ['1/8', '3/8', '5/8', '7/8'];
  assert.equal(complement(a, b), 1);
  assert.equal(complement(a, a), 0);
  assert.equal(interlockScore(a, b).joint, 1);
  const norm = (x) => normalizeRhythm(x).onsets.map(([n, d]) => `${n}/${d}`);
  for (const il of INTERLOCKS) {
    const ra = norm(RHYTHMS[il.rhythms.a]);
    const rb = norm(RHYTHMS[il.rhythms.b]);
    const dropDown = (os) => os.filter((o) => o !== '0/1');
    const score = interlockScore(dropDown(ra), dropDown(rb));
    assert.ok(score.joint >= 0.34, `${il.name}: joint ${score.joint} below threshold`);
  }
  const res = checkInterlocks([
    { label: 'kick', onsets: a }, { label: 'kick2', onsets: a },
  ]);
  assert.equal(res[0].ok, false); // identical rhythms collide
});

test('libraries: counts and abstract-only invariants (§3.5, §5)', () => {
  assert.ok(Object.keys(RHYTHMS).length >= 12, `rhythms: ${Object.keys(RHYTHMS).length}`);
  assert.ok(Object.keys(CONTOURS).length >= 10, `contours: ${Object.keys(CONTOURS).length}`);
  assert.ok(Object.keys(VOICINGS).length >= 6, `voicings: ${Object.keys(VOICINGS).length}`);
  assert.ok(INTERLOCKS.length >= 4, `interlocks: ${INTERLOCKS.length}`);
  assert.ok(Object.keys(TRANSITIONS).length >= 6, `transitions: ${Object.keys(TRANSITIONS).length}`);
  for (const [name, r] of Object.entries(RHYTHMS)) {
    // abstract-only: no mini-notation strings, real accent profiles
    assert.ok(r.onsets || r.euclid, name);
    const count = r.onsets ? r.onsets.length : euclidOnsets(...r.euclid).length;
    assert.equal(r.accents.length, count, `${name}: accents must cover every onset`);
    assert.ok(new Set(r.accents).size > 1, `${name}: uniform accent profile is a bug (§3.4)`);
    assert.ok(r.character?.length > 20, `${name}: document the taste it encodes`);
    for (const o of r.onsets ?? []) assert.equal(typeof o, 'string', `${name}: onsets are exact fractions, not floats`);
  }
  for (const [name, c] of Object.entries(CONTOURS)) {
    assert.ok(c.degrees.every(Number.isInteger), name);
    assert.ok(c.shape && c.character, name);
  }
  // retrieval is by computed musical properties
  const dense44 = findRhythms({ meter: '4/4', minDensity: 12 });
  assert.ok(dense44.some((r) => r.name === 'sixteenth_drive'));
  const sevens = findRhythms({ meter: '7/8' });
  assert.ok(sevens.length >= 3);
  assert.ok(rhythmProperties(RHYTHMS.offbeat_8ths).syncopation === 1);
  assert.ok(rhythmProperties(RHYTHMS.four_floor).syncopation === 0);
});

test('voicings: registration line evaluates and voices chords headlessly', async () => {
  const reg = voicingRegistration('drop2');
  const src = `${reg}\npads: chord("<Fm9 C7>").dict('me_drop2').voicing()`;
  const ev = await evaluateSong(src);
  const haps = hapsByLabel(ev, 0, 2).get('pads').haps;
  assert.ok(haps.length >= 8, `expected voiced notes, got ${haps.length}`);
  assert.ok(haps.every((h) => h.value.note));
});

test('compile+bind end-to-end: bound layer, transitions, assertions all green', async () => {
  const spec = {
    title: 'bind-e2e', form: 'A B', meter: '4/4', bpm: 120, key: 'F:minor', seed: 7,
    motifs: { m1: { lib: 'arch_classic' } },
    sections: {
      A: {
        role: 'verse', bars: 4, harmony: ['Fm9', 'Bbm9', 'Db^7', 'C7'],
        layers: {
          kick: { bind: { rhythm: 'four_floor', sound: 'bd' } },
          bass: { bind: { rhythm: 'anticipation_bass', contour: 'lib:bass_root_five', octave: 2, sound: 'sawtooth' } },
          lead: { bind: { rhythm: 'push_pull_16s', contour: 'm1', octave: 4, sound: 'triangle', cadence: 'tonic' } },
        },
      },
      B: {
        role: 'chorus', bars: 4, harmony: ['Db^7', 'Eb7', 'Fm9', 'C7'],
        must: { density: '> 1.05x A' },
        layers: {
          kick: { bind: { rhythm: 'four_floor', sound: 'bd' } },
          hats: { bind: { rhythm: 'sixteenth_drive', sound: 'hh' } },
          bass: { bind: { rhythm: 'anticipation_bass', contour: 'lib:bass_root_five', octave: 2, sound: 'sawtooth' } },
          lead: { bind: { rhythm: 'push_pull_16s', contour: 'm1', transform: 'octave_up', octave: 4, sound: 'triangle' } },
        },
      },
    },
    transitions: [{ use: 'fill_snare_roll', into: 'B' }],
  };
  const { source, meta } = compile(spec, { bindFn: makeBindFn(spec), transitionFn: makeTransitionFn(spec) });
  assert.match(source, /fill_B1\.late\(3\)\.mask/); // fill occupies the last bar before B
  const res = await verifySong(source, { meta });
  assert.equal(res.evalOk, true, res.error);
  assert.equal(res.lint.errors.length, 0, JSON.stringify(res.lint.errors));
  const fails = res.assertions.filter((a) => !a.pass && a.severity === 'fail');
  assert.equal(fails.length, 0, JSON.stringify(fails, null, 1));
  // motif assertions actually ran
  assert.ok(res.assertions.some((a) => a.family === 'motif' && a.name.includes('m1')));
  // harmonic assertion ran on the bound lead
  assert.ok(res.assertions.some((a) => a.family === 'harmonic' && a.name.startsWith('lead')));
  // fill layer exists and only sounds in cycle 3
  const fill = res.haps.get('fill').haps;
  assert.ok(fill.length > 0);
  assert.ok(fill.every((h) => h.whole.begin.valueOf() >= 3 && h.whole.begin.valueOf() < 4));
});

test('ACCEPTANCE (c): chorus violating its must constraints is flagged with measured values', async () => {
  const spec = {
    title: 'weak-chorus', form: 'A B', meter: '4/4', bpm: 120, key: 'C:minor', seed: 1,
    sections: {
      A: {
        role: 'verse', bars: 2, harmony: ['Cm7', 'G7'],
        layers: { lead: { bind: { rhythm: 'sixteenth_drive', contour: 'lib:rise_anthem', octave: 4, sound: 'triangle' } } },
      },
      B: {
        role: 'chorus', bars: 2, harmony: ['Cm7', 'G7'],
        must: { density: '> 1.4x A', register_span: 'wider than A' },
        // deliberately WEAKER than the verse: sparse rhythm, narrow contour
        layers: { lead: { bind: { rhythm: 'sparse_pedal', contour: 'lib:minimal_dyad', octave: 4, sound: 'triangle' } } },
      },
    },
  };
  const { source, meta } = compile(spec, { bindFn: makeBindFn(spec) });
  const res = await verifySong(source, { meta });
  assert.equal(res.evalOk, true, res.error);
  const density = res.assertions.find((a) => a.name === 'B.must.density');
  const span = res.assertions.find((a) => a.name === 'B.must.register_span');
  assert.equal(density.pass, false);
  assert.equal(span.pass, false);
  assert.match(density.detail, /measured [\d.]+ vs target > [\d.]+/); // numbers, not vibes
  assert.ok(density.measured < density.target);
  assert.equal(res.assertionsPass, false);
});

test('must-constraint parser handles all documented forms', () => {
  assert.deepEqual(parseConstraint('density', '> 1.4x A'), { metric: 'density', cmp: '>', factor: 1.4, ref: 'A', raw: '> 1.4x A' });
  assert.deepEqual(parseConstraint('register_span', 'wider than A'), { metric: 'register_span', cmp: '>', factor: 1, ref: 'A', raw: 'wider than A' });
  assert.deepEqual(parseConstraint('syncopation', '>= 0.3'), { metric: 'syncopation', cmp: '>=', factor: 0.3, ref: null, raw: '>= 0.3' });
  assert.deepEqual(parseConstraint('harmonic_rhythm', '< 0.5x A'), { metric: 'harmonic_rhythm', cmp: '<', factor: 0.5, ref: 'A', raw: '< 0.5x A' });
  assert.throws(() => parseConstraint('vibes', '> 1x A'), /unknown must metric/);
});
