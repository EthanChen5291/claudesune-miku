// D35: the melody pipeline — chordScale() (per-chord scale assignment) and
// bindMelody() (cell-first generation through the guard hierarchy: anchors
// snap, approach tones resolve, weak beats draw from the chord-scale).

import test from 'node:test';
import assert from 'node:assert/strict';
import { chordScale, chordCoreTones, parseKey } from '../src/binder/theory.js';
import { MELODY_RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import { bindMelody, melodyReport, ACCENT_THRESHOLD } from '../src/binder/bind.js';
import { chordTones } from '../src/harness/chords.js';
import { MELODY_PROFILES } from '../src/lib/melody-profiles.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

test('D35: diatonic chords get their classical mode from the key parent', () => {
  assert.equal(chordScale('Dm', 'C:major').mode, 'dorian');
  assert.equal(chordScale('G7', 'C:major').mode, 'mixolydian');
  assert.equal(chordScale('F', 'C:major').mode, 'lydian');
  assert.equal(chordScale('C', 'C:major').mode, 'major');
  // Megalovania's maj7 color chord solves in its own key
  assert.equal(chordScale('Bb^7', 'D:minor').mode, 'lydian');
});

test('D35: borrowed chords get their source mode via the parallel parents', () => {
  const bb = chordScale('Bb', 'C:major'); // bVII from the parallel minor
  assert.equal(bb.parent, 'parallelMinor');
  assert.equal(bb.mode, 'mixolydian');
  const v7 = chordScale('G7', 'C:minor'); // V7 in minor via harmonic minor
  assert.equal(v7.parent, 'harmonicMinor');
  assert.equal(v7.mode, 'phrygianDominant');
});

test('D35: a chord no parent explains falls back to its quality default', () => {
  const a7 = chordScale('A7', 'C:major'); // secondary dominant
  assert.equal(a7.parent, 'quality');
  assert.equal(a7.mode, 'mixolydian');
});

test('D35: avoid notes derive from the b9 rule (and sus suspends its 3rd)', () => {
  // F over C ionian: the classic avoid (m2 above the 3rd)
  assert.ok(chordScale('C', 'C:major').avoid.has(5));
  // natural 11 over the dominant
  assert.ok(chordScale('G7', 'C:major').avoid.has(0));
  // sus: the major 3rd is what sus suspends
  assert.ok(chordScale('Csus', 'C:major').avoid.has(4));
  // dorian over m7 has no avoid at all
  assert.equal(chordScale('Dm7', 'C:major').avoid.size, 0);
});

const RHYTHM = { name: 'test_cell', onsets: ['0', '1/4', '7/16', '11/16', '3/4', '15/16'], accents: [1, 0.6, 0.65, 0.6, 0.9, 0.6] };
const CTX = { harmony: ['Dm', 'C', 'Bm', 'Bb^7'], barsPerChord: 1, key: 'D:minor' };

test('D35: bindMelody is deterministic given (seed, style)', () => {
  const a = bindMelody(RHYTHM, CTX, '4/4', { seed: 11 });
  const b = bindMelody(RHYTHM, CTX, '4/4', { seed: 11 });
  assert.equal(a.expr, b.expr);
  const c = bindMelody(RHYTHM, CTX, '4/4', { seed: 12 });
  assert.notEqual(a.expr, c.expr); // a different seed is a different melody
});

test('D35: the guard hierarchy holds — anchors on chord tones, approaches resolve', () => {
  const key = parseKey(CTX.key);
  const keyPcs = new Set(key.intervals.map((x) => (key.rootPc + x) % 12));
  for (const seed of [1, 2, 3, 4, 5]) {
    const { boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed });
    const rep = melodyReport(boundMeta);
    assert.equal(rep.anchorViolations, 0, `seed ${seed}: anchor off the chord`);
    assert.equal(rep.approachViolations, 0, `seed ${seed}: approach did not resolve`);
    assert.equal(rep.offKeyUnforced, 0, `seed ${seed}: unforced out-of-key note`);
    for (const n of boundMeta.notes) {
      if (n.accented) assert.ok(n.category === 'anchor' || n.category === 'cadence', `seed ${seed}: accented note not an anchor/cadence`);
      const pc = ((n.midi % 12) + 12) % 12;
      if (n.category === 'anchor') {
        const scale = chordScale(n.chord, CTX.key);
        assert.ok(chordCoreTones(n.chord).has(pc), `seed ${seed}: anchor ${n.note} not a core tone of ${n.chord}`);
        assert.ok(!scale.avoid.has(pc), `seed ${seed}: anchor ${n.note} sits on an avoid tone of ${n.chord}`);
      }
      if (n.category === 'scale' || n.category === 'chord') {
        // triadic supply: in the KEY, or a tone the chord itself forces
        assert.ok(keyPcs.has(pc) || chordCoreTones(n.chord).has(pc),
          `seed ${seed}: weak note ${n.note} outside the key and unforced by ${n.chord}`);
      }
    }
  }
});

test('D36: melodies stay key-legal over borrowed and chromatic chords', () => {
  // the round-1 melody audition finding: full chord-scales put 13% of notes
  // out of key ("doesn't sound legal"). Triadic tension depth: a borrowed bVII
  // contributes ONLY its chord tones; the rest of the line stays in the key.
  const ctx = { harmony: ['C', 'Bb', 'F', 'G'], barsPerChord: 1, key: 'C:major' };
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const { boundMeta } = bindMelody(RHYTHM, ctx, '4/4', { seed });
    assert.equal(melodyReport(boundMeta).offKeyUnforced, 0, `seed ${seed}`);
    for (const n of boundMeta.notes) {
      if (n.chord !== 'Bb' || n.category === 'approach') continue;
      const pc = ((n.midi % 12) + 12) % 12;
      // over the borrowed chord: key tones or Bb's own tones — never the
      // source mode's other colors (no Ab/Eb spice from the parallel minor)
      assert.ok(pc !== 8 && pc !== 3, `seed ${seed}: ${n.note} imports the parallel minor over Bb`);
    }
  }
});

test('D35: cell-first — the SAME cell repitches through any progression', () => {
  const a = bindMelody(RHYTHM, CTX, '4/4', { seed: 7 });
  const b = bindMelody(RHYTHM, { harmony: ['F', 'C', 'Gm', 'Bb'], barsPerChord: 1, key: 'F:major' }, '4/4', { seed: 7 });
  assert.deepEqual(a.boundMeta.melody.cell, b.boundMeta.melody.cell);
  assert.notDeepEqual(
    a.boundMeta.notes.map((n) => n.note),
    b.boundMeta.notes.map((n) => n.note),
  ); // same identity, different harmony -> different pitches
});

test('D35: an explicit cell renders literally on the chord-scale ladder', () => {
  const { boundMeta } = bindMelody(
    { name: 'x', onsets: ['0', '1/4', '1/2', '3/4'], accents: [1, 0.5, 0.5, 0.5] },
    { harmony: ['C'], barsPerChord: 1, key: 'C:major' }, '4/4',
    { cell: [0, 1, 2, 4], seed: 1, approachProb: 0 },
  );
  // the MOTIF bar (cycle 0): anchor C5, then stepwise up the C-ionian ladder
  const motif = boundMeta.notes.filter((n) => n.cycle === 0);
  assert.deepEqual(motif.map((n) => n.note), ['C5', 'D5', 'E5', 'G5']);
});

test('D37: the phrase plan makes a lead, not a layer', () => {
  const { boundMeta, expr } = bindMelody(RHYTHM, CTX, '4/4', { seed: 7 });
  const { roles } = boundMeta.phrase;
  // MeloForm roles over the 4-bar harmony, stated twice
  assert.deepEqual(roles.slice(0, 4), ['motif', 'answer', 'motif', 'cadence']);
  assert.equal(roles.length, 8);
  // cadence bars: thinned + held (phrase-final lengthening) + a breath rest
  const cad = boundMeta.notes.filter((n) => n.cycle === 3);
  const motif = boundMeta.notes.filter((n) => n.cycle === 0);
  assert.ok(cad.length < motif.length, 'cadence bar must be thinner than the motif bar');
  assert.match(expr, /~@\d+\]/, 'the breath rest must reach the emitted pattern');
  // motif restates EXACTLY across restatements (the theme recurs recognizably)
  const bar = (c) => boundMeta.notes.filter((n) => n.cycle === c).map((n) => n.note).join(' ');
  assert.equal(bar(0), bar(4));
  // antecedent asks, consequent answers: first cadence never lands on the
  // chord root, the final one always does
  const cadLand = (c) => boundMeta.notes.filter((n) => n.cycle === c).at(-1);
  const pc = (n) => ((n.midi % 12) + 12) % 12;
  assert.notEqual(pc(cadLand(3)), 10, 'antecedent must stay open (not the Bb root)');
  assert.equal(pc(cadLand(7)), 10, 'final consequent lands on the chord root');
});

test('D37: step inertia produces runs the old sampler could not', () => {
  // with inertia forced high, cells contain same-direction step chains
  const profileRun = { seed: 5, cell: null };
  let runs = 0, cells = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const { boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed });
    const cell = boundMeta.melody.cell;
    cells++;
    for (let i = 2; i < cell.length; i++) {
      const a = cell[i - 1] - cell[i - 2], b = cell[i] - cell[i - 1];
      if (Math.abs(a) === 1 && a === b) { runs++; break; }
    }
  }
  assert.ok(runs >= 5, `expected scale runs in a fair share of cells, got ${runs}/${cells}`);
});

test('D35: cadence pins the final onset to the tonic', () => {
  const { boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed: 3, cadence: 'tonic' });
  const last = boundMeta.notes[boundMeta.notes.length - 1];
  assert.equal(((last.midi % 12) + 12) % 12, 2); // D
});

test('D35: profile floors are honest — toby-fox numbers come from the corpus', () => {
  const p = MELODY_PROFILES['toby-fox'];
  assert.ok(p.leapRecovery === 0.79 && p.approachProb >= 0.1 && p.approachProb <= 0.2);
  assert.ok(Math.abs(p.moves.step - 0.34) < 1e-9); // 34% stepwise, measured
});

test('D35: bound melody evaluates green through the harness', async () => {
  const { expr, period } = bindMelody(RHYTHM, CTX, '4/4', { seed: 9, sound: 'piano' });
  const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
  const h = hapsByLabel(ev, 0, period).get('p');
  assert.ok(h && !h.error && h.haps.length > 0);
});

test('D35: accent threshold still gates anchors (D14 continuity)', () => {
  const { boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed: 2 });
  // motif/answer bars keep the source rhythm's accent profile verbatim;
  // cadence bars re-shape it (D37), so they are checked structurally instead
  for (const n of boundMeta.notes) {
    if (n.role === 'cadence') continue;
    const acc = RHYTHM.accents[n.cellIndex];
    assert.equal(n.accented, acc >= ACCENT_THRESHOLD);
  }
});

test('D40: mined melodic rhythm cells are rhythm-only and span the corpus density range', () => {
  const cells = Object.entries(MELODY_RHYTHMS_UNDERTALE);
  assert.ok(cells.length >= 20, `expected a real pool, got ${cells.length}`);
  const densities = [];
  for (const [name, e] of cells) {
    assert.equal(e.role, 'melodic', name);
    assert.equal(e.pack, 'undertale', name);
    assert.equal(e.ratified, false, name);
    assert.equal(e.character, null, name);
    assert.equal(e.onsets.length, e.accents.length, name);
    assert.equal(e.onsets.length, e.artic.length, name);
    // the D30 melody ruling: rhythm is a habit, pitch would be a tune
    for (const k of ['degrees', 'figure', 'notes', 'midi', 'contour']) {
      assert.ok(!(k in e), `${name} must carry no pitch content (found "${k}")`);
    }
    for (const a of e.artic) assert.ok(a > 0 && a <= 1, name);
    densities.push(e.density);
  }
  const mean = densities.reduce((a, b) => a + b, 0) / densities.length;
  const sd = Math.sqrt(densities.reduce((a, b) => a + (b - mean) ** 2, 0) / densities.length);
  // the point of stratified selection: the pool must NOT be uniformly sparse
  assert.ok(sd > 2.5, `density must span sparse..busy (stdev ${sd.toFixed(2)})`);
  assert.ok(Math.max(...densities) >= 12 && Math.min(...densities) <= 3, 'both extremes must be represented');
});

test('D40: a mined cell drives bindMelody and carries the source articulation through', () => {
  const busy = Object.values(MELODY_RHYTHMS_UNDERTALE)
    .filter((e) => e.meter_class === '4/4' && e.artic.some((a) => a < 0.7))
    .sort((a, b) => b.density - a.density)[0];
  assert.ok(busy, 'expected a 4/4 cell with short notes');
  const { boundMeta, warnings } = bindMelody(
    { name: 'mined', onsets: busy.onsets, accents: busy.accents, artic: busy.artic },
    CTX, '4/4', { seed: 3 },
  );
  assert.deepEqual(warnings, []);
  assert.equal(melodyReport(boundMeta).offKeyUnforced, 0);
  const motif = boundMeta.notes.filter((n) => n.cycle === 0);
  assert.deepEqual(motif.map((n) => n.artic), busy.artic.map((a) => Math.max(0.05, Math.min(1, a))));
});

test('D59: the measured game-midi profile is a selectable melody style', () => {
  const p = MELODY_PROFILES['game-midi'];
  assert.ok(p, 'game-midi missing from MELODY_PROFILES');
  // the measured numbers arrive verbatim from the vgmusic import (D52)
  assert.equal(p.moves.step, 0.323);
  assert.equal(p.upBias, 0.533);
  assert.equal(p.leapRecovery, 0.71);
  // the fields bindMelody needs beyond what interval statistics can measure
  // are present as audition-tunable defaults
  for (const f of ['articulation', 'approachProb', 'chromaticApproach', 'tensions', 'cellRepetitionFloor', 'rangeSteps']) {
    assert.ok(p[f] != null, `game-midi profile is missing ${f}`);
  }
  // and the vgmusic file's saturated cellRepetitionFloor did NOT leak in (its
  // 0.9 counts a different thing — see melody-profiles-vgmusic.js)
  assert.equal(p.cellRepetitionFloor, 0.5);
});

test('D59: bindMelody binds under the game-midi style and stays key-legal', () => {
  const cell = { name: 'c', onsets: ['0', '1/4', '1/2', '3/4'], accents: [1, 0.6, 0.85, 0.6], artic: [1, 0.7, 0.9, 0.7] };
  const ctx = { harmony: ['Cm', 'Ab', 'Fm', 'G7'], barsPerChord: 1, key: 'C:minor' };
  const a = bindMelody(cell, ctx, '4/4', { style: 'game-midi', seed: 7 });
  const b = bindMelody(cell, ctx, '4/4', { style: 'toby-fox', seed: 7 });
  assert.equal(a.warnings.length, 0, a.warnings.join('; '));
  assert.ok(a.expr.length > 100);
  // a different profile is a different line, same seed
  assert.notEqual(a.expr, b.expr, 'the style knob changed nothing');
  const rep = melodyReport(a.boundMeta);
  assert.equal(rep.offKeyUnforced, 0, 'game-midi produced unforced out-of-key notes');
  assert.equal(rep.anchorViolations, 0, 'game-midi broke an anchor');
});

test('D90: chromCore spells a borrowed chord and is inert on in-key roots', () => {
  const cell = { name: 'c', onsets: ['0', '1/4', '1/2', '3/4'], accents: [1, 0.6, 0.85, 0.6], artic: [1, 0.7, 0.9, 0.7] };
  // Bb7 in E major — the festival case: a FOREIGN-ROOT chord
  const foreign = { harmony: ['E', 'A', 'Bb7', 'E'], barsPerChord: 1, key: 'E:major' };
  const BB7 = new Set([10, 2, 5, 8]); // Bb D F Ab
  const on = bindMelody(cell, foreign, '4/4', { style: 'toby-fox', seed: 3, chromCore: true });
  // every melody note sounding in a Bb7 bar (bar index 2 mod 4) is a chord tone
  for (const n of on.boundMeta.notes ?? []) {
    if (n.chord !== 'Bb7') continue;
    assert.ok(BB7.has(((n.midi % 12) + 12) % 12),
      `chromCore let a non-chord tone through on Bb7: midi ${n.midi} (${n.category})`);
  }
  // the flag actually bites: some seed differs from the uncollapsed bind
  const seeds = [1, 2, 3, 5, 7];
  const differs = seeds.some((s) =>
    bindMelody(cell, foreign, '4/4', { style: 'toby-fox', seed: s, chromCore: true }).expr
    !== bindMelody(cell, foreign, '4/4', { style: 'toby-fox', seed: s, chromCore: false }).expr);
  assert.ok(differs, 'chromCore never changed a foreign-root bind across 5 seeds');
  // and it is INERT when every chord root is in the key (the training control)
  const inKey = { harmony: ['F', 'E7', 'Am7', 'G'], barsPerChord: 1, key: 'C:major' };
  for (const s of seeds) {
    assert.equal(
      bindMelody(cell, inKey, '4/4', { style: 'toby-fox', seed: s, chromCore: true }).expr,
      bindMelody(cell, inKey, '4/4', { style: 'toby-fox', seed: s, chromCore: false }).expr,
      `chromCore altered an in-key-root bind (seed ${s})`);
  }
});
