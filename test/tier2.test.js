// D38: tier 2 — authored melody specs rendered through the bindMelodySpec
// guard. The spec is the trained model's output format; the guard is what
// makes model freehand safe (anchors snap, colors declared, off-supply notes
// resolve or get snapped loudly).

import test from 'node:test';
import assert from 'node:assert/strict';
import { bindMelodySpec, melodyReport } from '../src/binder/bind.js';
import { chordCoreTones } from '../src/binder/theory.js';
import { MELODIES_TIER2 } from '../src/lib/melodies-tier2.js';
import { PROGRESSIONS_UNDERTALE } from '../src/lib/progressions-undertale.js';
import { renderProgression } from '../src/binder/harmony.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

function barChords(symbols, bpc, loopBars) {
  const out = [];
  let i = 0, acc = 0;
  for (let b = 0; b < loopBars; b++) {
    while (i < bpc.length - 1 && acc + bpc[i] <= b) { acc += bpc[i]; i++; }
    out.push(symbols[i]);
  }
  return out;
}
function ctxFor(m) {
  const e = PROGRESSIONS_UNDERTALE[m.for];
  const symbols = renderProgression(e, e.sourceKey);
  return { e, ctx: { harmony: barChords(symbols, e.barsPerChord, e.loopBars), barsPerChord: 1, key: e.sourceKey } };
}

test('D38: every authored spec renders clean through the guard — no warnings, no violations', async () => {
  for (const [name, m] of Object.entries(MELODIES_TIER2)) {
    const { e, ctx } = ctxFor(m);
    const { expr, period, boundMeta, warnings } = bindMelodySpec(m, ctx, e.meter, { sound: 'piano' });
    assert.deepEqual(warnings, [], `${name}: the author must fix the spec, not lean on the snap`);
    const rep = melodyReport(boundMeta);
    assert.equal(rep.anchorViolations, 0, name);
    assert.equal(rep.approachViolations, 0, name);
    assert.equal(rep.offKeyUnforced, 0, name);
    const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
    const h = hapsByLabel(ev, 0, period).get('p');
    assert.ok(h && !h.error && h.haps.length > 0, `${name} produced no haps`);
  }
});

test('D38: specs carry the A6.1 discipline — model output is a candidate, not a ratified entry', () => {
  for (const [name, m] of Object.entries(MELODIES_TIER2)) {
    assert.equal(m.ratified, false, name);
    assert.equal(m.needsEar, true, name);
    assert.equal(m.character, null, name);
    assert.equal(m.provenance, 'authored-tier2', name);
    assert.ok(PROGRESSIONS_UNDERTALE[m.for], `${name} targets a real progression`);
  }
});

test('D38: the guard snaps an illegal accented note and says so', () => {
  const spec = {
    name: 'bad_anchor', octave: 4,
    bars: [{ onsets: ['0', '1/2'], degrees: [1, 0], accents: [0.9, 0.9] }], // D over C: not a core tone
  };
  const { boundMeta, warnings } = bindMelodySpec(spec, { harmony: ['C'], barsPerChord: 1, key: 'C:major' }, '4/4');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /snapped/);
  const pc = ((boundMeta.notes[0].midi % 12) + 12) % 12;
  assert.ok(chordCoreTones('C').has(pc));
});

test('D38: a declared alteration is color and survives the guard untouched', () => {
  const spec = {
    name: 'color', octave: 4,
    bars: [{ onsets: ['0', '1/2'], degrees: ['#3', 0], accents: [0.9, 0.9] }], // B natural in F major
  };
  const { boundMeta, warnings } = bindMelodySpec(spec, { harmony: ['F'], barsPerChord: 1, key: 'F:major' }, '4/4');
  assert.equal(boundMeta.notes[0].category, 'color');
  assert.equal(boundMeta.notes[0].note, 'B4');
  assert.equal(warnings.length, 0);
  assert.equal(melodyReport(boundMeta).offKeyUnforced, 0); // color is the author's call
});

test('D38: a weak note that resolves into its neighbor is an approach, not an error', () => {
  // over the chromatic Db in C major the supply is {C, Db, F, Ab}; a weak D
  // falling to an accented Db (snapped from D) resolves by half-step —
  // approach tone, no warning for it
  const spec = {
    name: 'approach', octave: 4,
    bars: [{ onsets: ['0', '1/4', '1/2'], degrees: [3, 1, 1], accents: [0.9, 0.4, 0.9] }],
  };
  const { boundMeta, warnings } = bindMelodySpec(spec, { harmony: ['Db'], barsPerChord: 1, key: 'C:major' }, '4/4');
  assert.equal(boundMeta.notes[1].category, 'approach');
  assert.equal(boundMeta.notes[1].resolvesTo, boundMeta.notes[2].midi);
  assert.equal(warnings.filter((w) => /onset 1:/.test(w)).length, 0, 'a resolving neighbor must pass silently');
});

test('D38: the spec is key-agnostic — same spec, any harmony, re-legalized', () => {
  const m = MELODIES_TIER2.ut_megalovania_p1;
  const a = bindMelodySpec(m, { harmony: ['Dm', 'C', 'Bm', 'Bb^7'], barsPerChord: 1, key: 'D:minor' }, '4/4');
  const b = bindMelodySpec(m, { harmony: ['Em', 'D', 'C#m', 'B^7'], barsPerChord: 1, key: 'E:minor' }, '4/4');
  assert.notDeepEqual(a.boundMeta.notes.map((n) => n.note), b.boundMeta.notes.map((n) => n.note));
  assert.equal(melodyReport(b.boundMeta).anchorViolations, 0);
});

test('D38: deterministic — no sampling anywhere in the tier-2 path', () => {
  const m = MELODIES_TIER2.ut_waterfall_p2;
  const { e, ctx } = ctxFor(m);
  assert.equal(bindMelodySpec(m, ctx, e.meter).expr, bindMelodySpec(m, ctx, e.meter).expr);
});

test('D39: articulation is real and varied — a melody that holds every note cannot phrase', () => {
  const ratios = [];
  for (const m of Object.values(MELODIES_TIER2)) {
    const { e, ctx } = ctxFor(m);
    const { expr, boundMeta } = bindMelodySpec(m, ctx, e.meter);
    assert.match(expr, /\.clip\("/, 'articulation must reach the emitted pattern');
    for (const n of boundMeta.notes) {
      assert.ok(n.artic > 0 && n.artic <= 1, 'every note carries a duration ratio');
      ratios.push(n.artic);
    }
  }
  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const sd = Math.sqrt(ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length);
  // the corpus's own melody streams: mean 0.88, and a real spread of touch
  assert.ok(sd > 0.1, `articulation must vary (stdev ${sd.toFixed(2)}) — uniform touch is the "lifeless" bug`);
  const frac = (f) => ratios.filter(f).length / ratios.length;
  assert.ok(frac((r) => r < 0.7) > 0.1, 'some notes must be genuinely short');
  assert.ok(frac((r) => r >= 0.95) > 0.25, 'some notes must be genuinely held');
});

test('D39: an authored spec can override articulation per note', () => {
  const spec = {
    name: 'artic', octave: 4,
    bars: [{ onsets: ['0', '1/2'], degrees: [0, 4], accents: [0.9, 0.9], artic: [0.25, 1] }],
  };
  const { boundMeta } = bindMelodySpec(spec, { harmony: ['C'], barsPerChord: 1, key: 'C:major' }, '4/4');
  assert.deepEqual(boundMeta.notes.map((n) => n.artic), [0.25, 1]);
});
