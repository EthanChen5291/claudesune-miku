// D43/D44: the arranger — which instruments join a song, what each plays, and
// whether the plan carries enough about every choice to be edited later.

import test from 'node:test';
import assert from 'node:assert/strict';
import { planArrangement, renderArrangement, PARTS } from '../src/binder/arrange.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { bindMelody, melodyReport } from '../src/binder/bind.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const CTX = { harmony: ['Am', 'Bb', 'Am', 'Bb'], barsPerChord: 1, key: 'D:minor' };
const RHYTHM = { name: 'lead', onsets: ['0', '1/4', '1/2', '3/4'], accents: [1, 0.6, 0.85, 0.6], artic: [1, 0.7, 0.9, 0.7] };
const SITUATION = {
  name: 'test_song', song: 'Test', family: 'minor', role: 'cutscene',
  bpm: 112, meter: '4/4', loopBars: 4,
  accDensity: 5, accOctave: 3, leadDensity: 4, palette: INSTRUMENTS,
};
const renderCtx = {
  harmonyContext: CTX, meter: '4/4', style: 'toby-fox',
  leadRhythm: RHYTHM, leadSeed: 42,
  counterRhythmFor: () => ({ name: 'counter', onsets: ['0', '1/2'], accents: [0.8, 0.6] }),
  figureFor: () => ({ name: 'fig', bars: 1, onsets: ['0', '1/2'], figure: ['R', '5'], accents: [0.8, 0.6], octave: 3, legato: false }),
};

test('D43: planning is deterministic — same song, same plan, forever', () => {
  const a = planArrangement(SITUATION);
  const b = planArrangement(SITUATION);
  assert.deepEqual(a, b);
});

test('D43: every layer records what it is and what it contributes (edit-ready)', () => {
  const plan = planArrangement(SITUATION);
  assert.ok(plan.layers.length > 0, 'this situation should cast at least one layer');
  for (const l of plan.layers) {
    for (const field of ['id', 'part', 'instrument', 'instrumentCharacter', 'contributes',
      'lane', 'octave', 'gain', 'derives', 'addsDensity', 'mass', 'seed', 'why']) {
      assert.ok(l[field] != null && l[field] !== '', `layer is missing ${field} — a later edit pass could not reason about it`);
    }
    assert.ok(INSTRUMENTS[l.instrument], `${l.instrument} is not in the palette`);
    assert.ok(PARTS[l.part], `${l.part} is not a declared part`);
    assert.ok(INSTRUMENTS[l.instrument].parts.includes(l.part), `${l.instrument} does not play ${l.part}`);
  }
  assert.ok(plan.notes.length > 0, 'the plan must explain its own reasoning');
});

test('D43: layers never double up on an instrument or a register lane', () => {
  for (const role of ['boss', 'cutscene', 'town', 'joke', null]) {
    for (const bpm of [70, 112, 175]) {
      const plan = planArrangement({ ...SITUATION, role, bpm, name: `s_${role}_${bpm}` });
      const instruments = plan.layers.map((l) => l.instrument);
      const lanes = plan.layers.map((l) => l.lane);
      assert.equal(new Set(instruments).size, instruments.length, 'an instrument was cast twice');
      assert.equal(new Set(lanes).size, lanes.length, 'two layers claim the same lane');
      assert.ok(!lanes.includes('lead') || plan.base.lead.silenced,
        'nothing may sit in the piano lead lane unless the lead was taken over');
    }
  }
});

test('D43: a lane may only be shared with the piano when the touch contrasts', () => {
  for (const bpm of [70, 112, 175]) {
    for (const accOctave of [2, 3, 4]) {
      const plan = planArrangement({ ...SITUATION, bpm, accOctave, name: `sh_${bpm}_${accOctave}` });
      for (const l of plan.layers.filter((x) => x.sharesLaneWithPiano)) {
        assert.ok(l.attack === 'slow' || l.sustain === 'long',
          `${l.instrument} shares the piano's lane with a ${l.attack} attack and ${l.sustain} sustain — that is mud`);
      }
    }
  }
});

test('D43: a full bar buys sustain and doubling, never a new busy line', () => {
  // piano already spending everything: parts that introduce new onsets must not
  // be cast, but zero-onset parts still may be
  const crowded = planArrangement({ ...SITUATION, accDensity: 10, leadDensity: 9, name: 'crowded' });
  for (const l of crowded.layers) {
    assert.equal(l.addsDensity, 0, `${l.part} adds ${l.addsDensity} onsets/bar into a full bar`);
  }
  // and a sparse one is allowed the busier parts
  const sparse = planArrangement({ ...SITUATION, accDensity: 1, leadDensity: 3, name: 'sparse' });
  assert.ok(sparse.headroomStart > crowded.headroomStart);
});

test('D43: the whole arrangement renders green through the harness', async () => {
  for (const role of ['boss', 'cutscene', 'town']) {
    const plan = planArrangement({ ...SITUATION, role, name: `r_${role}` });
    const { layers, warnings } = renderArrangement(plan, renderCtx);
    assert.deepEqual(warnings.filter((w) => /failed to render/.test(w)), []);
    assert.equal(layers.length, plan.layers.length);
    for (const l of layers) {
      const ev = await evaluateSong(`setcpm(110/4)\np: ${l.expr}`);
      const h = hapsByLabel(ev, 0, 8).get('p');
      assert.ok(h && !h.error && h.haps.length > 0, `${l.id} produced no haps`);
      assert.ok(l.expr.includes(`.s("${l.instrument}")`), `${l.id} did not reach its instrument`);
    }
  }
});

test('D43: a sustained pad never invents a third the chord does not have', async () => {
  // sus chords have no third; a pad that supplied one would contradict the piano
  const plan = planArrangement({ ...SITUATION, role: 'credits', name: 'sus_test' });
  const pad = plan.layers.find((l) => l.derives === 'chords');
  if (!pad) return;
  const { warnings } = renderArrangement(plan, {
    ...renderCtx, harmonyContext: { harmony: ['C2', 'Csus'], barsPerChord: 1, key: 'C:major' },
  });
  assert.deepEqual(warnings.filter((w) => /carries no 3/.test(w)), [],
    'the pad asked a thirdless chord for a third');
});

test('D44: repeat policy — a restatement may repeat exactly, vary, or fall silent', () => {
  const bars = (bm) => Array.from({ length: bm.period }, (_, c) =>
    bm.notes.filter((n) => n.cycle === c).map((n) => n.note).join(' '));

  const vary = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'vary' }).boundMeta;
  const exact = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'exact' }).boundMeta;
  const rest = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'rest' }).boundMeta;

  const [vb, eb, rb] = [bars(vary), bars(exact), bars(rest)];
  // exact: the restatement is the statement, bar for bar — EXCEPT the final
  // cadence, which still resolves (an antecedent asks, the last consequent
  // answers; that is D37's phrase rule and it outranks the repeat policy)
  assert.deepEqual(eb.slice(4, 7), eb.slice(0, 3));
  assert.notEqual(eb[7], eb[3], 'the last cadence should close where the first stayed open');
  // vary: the answer bar is what changes on restatement
  assert.notEqual(vb[5], vb[1]);
  assert.equal(vb[4], vb[0], 'motif bars restate exactly even under vary');
  // rest: the repeated answer bar is genuinely silent
  assert.equal(rb[5], '');
  assert.ok(rb[4].length > 0 && rb[6].length > 0, 'only the answer bar rests');
  assert.equal(melodyReport(rest).offKeyUnforced, 0);
});

test('D44: the repeat policy is derived deterministically and reported', () => {
  const a = bindMelody(RHYTHM, CTX, '4/4', { seed: 21 });
  const b = bindMelody(RHYTHM, CTX, '4/4', { seed: 21 });
  assert.equal(a.expr, b.expr);
  assert.ok(['vary', 'exact', 'rest'].includes(a.boundMeta.phrase.repeat));
  // a two-bar phrase is a riff: it must never mutate
  const short = bindMelody(RHYTHM, { harmony: ['Am', 'Bb'], barsPerChord: 1, key: 'D:minor' }, '4/4', { seed: 5 });
  assert.equal(short.boundMeta.phrase.repeat, 'exact');
});

test('D44: a silent bar still evaluates and still holds the guard', async () => {
  const { expr, boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'rest', sound: 'piano' });
  assert.equal(melodyReport(boundMeta).anchorViolations, 0);
  const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
  const h = hapsByLabel(ev, 0, boundMeta.period).get('p');
  assert.ok(h && !h.error && h.haps.length > 0);
});
