// Regression tests for Ethan's audition round 1 (2026-08-19):
//   - shape-preserving contour realization (D26) — no more cycling smear
//   - degree alterations ('b5') with mode clamp + snap exemption
//   - multi-bar rhythms (bars: N, onsets in bar units)
//   - main/bounce voices; bindComp() push-comping
//   - drop2 bass-note fix; quartal_9/power_sus killed

import test from 'node:test';
import assert from 'node:assert/strict';
import { bind, bindComp, realizeContour, resampleShape, normalizeRhythm } from '../src/binder/bind.js';
import { parseDegree, degreeToMidi, applyTransform, parseKey } from '../src/binder/theory.js';
import { RHYTHMS, rhythmProperties, findRhythms } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS, voicingRegistration } from '../src/lib/voicings.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const P = (a) => a.map(parseDegree);
const R6 = { onsets: ['0', '1/8', '1/4', '1/2', '5/8', '3/4'], accents: [0.6, 0.5, 0.6, 0.5, 0.6, 0.5], name: 'r6' };
const R8 = { onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'], accents: [0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5], name: 'r8' };

test('D26 realization: exact / phrase / tiled / unfold / resampled', () => {
  assert.equal(realizeContour(P([0, 1, 2]), 3).mode, 'exact');
  const ph = realizeContour(P([0, 1, 2, 3, 4, 5]), 3);
  assert.equal(ph.mode, 'phrase');
  assert.equal(ph.k, 2);
  const ti = realizeContour(P([0, 3]), 6);
  assert.equal(ti.mode, 'tiled');
  assert.deepEqual(ti.seq.map((o) => o.d), [0, 3, 0, 3, 0, 3]);
  // a contour at least twice the onsets unfolds as a slow line (neon-undertow's
  // C-section lead: 7 degrees over sparse_pedal's 2 onsets)
  assert.equal(realizeContour(P(CONTOURS.arch_classic.degrees), 2).mode, 'unfold');
  // near-miss lengths resample instead of smearing (the audition r1 complaint)
  assert.equal(realizeContour(P(CONTOURS.arch_classic.degrees), 6).mode, 'resampled');
});

test('D26 resample keeps first/last/extrema — the arch keeps its peak', () => {
  const six = resampleShape(P(CONTOURS.arch_classic.degrees), 6).map((o) => o.d);
  assert.equal(six[0], 0);
  assert.equal(six[six.length - 1], 0);
  assert.ok(six.includes(5), `peak degree 5 must survive: ${six}`);
  // upsampling repeats notes but never invents degrees
  const eight = resampleShape(P([0, 2, 4, 5, 4, 2, 0]), 8).map((o) => o.d);
  assert.equal(eight.length, 8);
  assert.ok(eight.every((d) => [0, 2, 4, 5].includes(d)));
});

test('alterations: fall_sigh gets its b6 in dorian, clamps in natural minor', () => {
  const dor = bind(R6, CONTOURS.fall_sigh, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:dorian' }, '4/4', { octave: 5 });
  assert.deepEqual(dor.boundMeta.notes.map((n) => n.note), ['C6', 'Ab5', 'G5', 'Eb5', 'D5', 'C5']);
  // C natural minor already has Ab — 'b5' must NOT double-flat into G
  const min = bind(R6, CONTOURS.fall_sigh, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:minor' }, '4/4', { octave: 5 });
  assert.equal(min.boundMeta.notes[1].note, 'Ab5');
});

test('alterations: explicitly altered degrees are EXEMPT from chord-tone snapping', () => {
  const accented = { onsets: ['0', '1/4', '1/2', '3/4', '7/8', '15/16'], accents: [1.0, 1.0, 0.6, 0.6, 0.6, 0.6], name: 'acc' };
  const res = bind(accented, CONTOURS.fall_sigh, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:dorian' }, '4/4', { octave: 5 });
  // onset 2 carries 'b5' with accent 1.0 — Cm7 tones would snap Ab5 away; it stands
  assert.equal(res.boundMeta.notes[1].note, 'Ab5');
});

test('alterations survive transforms and parse round-trips', () => {
  const inv = applyTransform([0, 'b5', 4], 'retrograde');
  assert.deepEqual(inv, [4, 'b5', 0]);
  const up = applyTransform(['b5'], 'octave_up');
  assert.deepEqual(up, ['b12']);
  const key = parseKey('C:dorian');
  const base = degreeToMidi(5, 60, key.intervals);
  assert.equal(degreeToMidi('b5', 60, key.intervals), base - 1);
});

test('audition r1 contour fixes: dorian_lift peaks on the raised 6th', () => {
  const res = bind(R8, CONTOURS.dorian_lift, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:dorian' }, '4/4', { octave: 5 });
  const midis = res.boundMeta.notes.map((n) => n.midi);
  const peak = res.boundMeta.notes[midis.indexOf(Math.max(...midis))];
  assert.equal(peak.note, 'A5', 'dorian arch must peak on the raised 6th (A in C dorian)');
});

test('multi-bar rhythms: bar-unit onsets, per-bar grids, <[b1] [b2]> emission', () => {
  const r = normalizeRhythm(RHYTHMS.pushed_comp_2bar);
  assert.equal(r.bars, 2);
  assert.equal(rhythmProperties(RHYTHMS.pushed_comp_2bar).density, 5); // per bar
  // percussion multi-bar: period = bars, angle-bracket alternation
  const perc = bind(RHYTHMS.call_response_2bar, null, null, '4/4', { sound: 'rim' });
  assert.equal(perc.period, 2);
  assert.match(perc.expr, /^s\("<\[.+\] \[.+\]>"\)/);
  // melodic multi-bar: 8-degree contour over 8 onsets = exact, period covers both bars
  const mel = bind(RHYTHMS.call_response_2bar, CONTOURS.question_answer, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:dorian' }, '4/4', { octave: 5 });
  assert.equal(mel.boundMeta.contourRealization.mode, 'exact');
  assert.equal(mel.period % 2, 0);
  assert.match(mel.expr, /note\("<\[.+\] \[.+\]>"\)/);
  assert.match(mel.expr, /gain\("<\[.+\] \[.+\]>"\)/);
});

test('bounce voices in a melodic bind: low root anchors, contour flows through mains only', () => {
  const res = bind(RHYTHMS.pushed_comp_2bar, CONTOURS.zigzag_narrow, { harmony: ['Cm7'], barsPerChord: 1, key: 'C:dorian' }, '4/4', { octave: 4 });
  const bounce = res.boundMeta.notes.filter((n) => n.voice === 'bounce');
  assert.equal(bounce.length, 3);
  assert.ok(bounce.every((n) => n.note === 'C3' && n.degree == null), 'bounce = chord root an octave down, no contour degree');
  const mains = res.boundMeta.notes.filter((n) => n.voice === 'main');
  assert.equal(mains.length, 7);
});

test('bindComp: main onsets stab the voicing, bounce onsets track the sounding chord root', () => {
  const hc = { harmony: ['Cm9', 'Ab^7', 'Fm7', 'G7'], barsPerChord: 1, key: 'C:minor' };
  const res = bindComp(RHYTHMS.pushed_comp_2bar, hc, '4/4', { dict: 'drop2', sound: 'square' });
  assert.equal(res.period, 4);
  assert.match(res.expr, /chord\("<Cm9 Ab\^7 Fm7 G7>"\)\.dict\('me_drop2'\)\.voicing\(\)\.struct\("<\[.+\] \[.+\]>"\)/);
  // bar 1 of statement 1 = Cm9 -> C3 bounces; bar 1 of statement 2 = Fm7 -> F3
  const roots = res.boundMeta.notes.map((n) => `${n.cycle}:${n.note}`);
  assert.ok(roots.every((r) => r.startsWith('0:C3') || r.startsWith('2:F3')), roots.join(' '));
  assert.throws(() => bindComp(RHYTHMS.pushed_comp_2bar, { harmony: [], key: 'C:minor' }, '4/4', { dict: 'drop2' }), /harmony/);
  assert.throws(() => bindComp(RHYTHMS.pushed_comp_2bar, hc, '4/4', {}), /dict/);
});

test('bindComp output evaluates headlessly and both voices sound', async () => {
  const hc = { harmony: ['Cm9', 'Fm7'], barsPerChord: 1, key: 'C:minor' };
  const { expr } = bindComp(RHYTHMS.pushed_comp_2bar, hc, '4/4', { dict: 'drop2' });
  const src = `${voicingRegistration('drop2')}\nkeys: ${expr}`;
  const ev = await evaluateSong(src);
  const haps = hapsByLabel(ev, 0, 2).get('keys');
  assert.ok(!haps.error, haps.error);
  assert.ok(haps.haps.length >= 10, `expected stabs + bounces, got ${haps.haps.length}`);
});

test('audition r1 voicing verdicts: drop2 bass note fixed, quartal_9/power_sus killed', () => {
  assert.equal(VOICINGS.quartal_9, undefined);
  assert.equal(VOICINGS.power_sus, undefined);
  for (const [q, off] of Object.entries(VOICINGS.drop2.shapes)) {
    const offsets = off.split(' ').map(Number);
    const lowest = Math.min(...offsets);
    // the dropped voice is the FIFTH (-5) or the b3 for diminished (-9) — never
    // the 7th/maj7 a step under the root (the "bass note sounds off" bug)
    assert.ok(lowest === -5 || lowest === -9 || lowest === 0, `drop2[${q}]: lowest offset ${lowest}`);
    assert.ok(!offsets.includes(-1) && !offsets.includes(-2), `drop2[${q}]: 7th dropped under the root`);
  }
});

test('audition r1 role verdicts: flagged rhythms demoted, retrieval honors role', () => {
  for (const name of ['anticipation_bass', 'push_pull_16s', 'gallop_arp', 'backbeat_ghost']) {
    assert.equal(RHYTHMS[name].role, 'percussion', name);
  }
  const noteRhythms = findRhythms({ meter: '4/4', role: 'melodic' });
  assert.ok(noteRhythms.length >= 2);
  assert.ok(!noteRhythms.some((r) => r.entry.role === 'percussion'));
  const comps = findRhythms({ meter: '4/4', role: 'chords' });
  assert.ok(comps.some((r) => r.name === 'pushed_comp_2bar'));
});
