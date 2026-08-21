// D30: material extracted from audios/Undertale MIDI — the piano-arrangement
// analysis (hand split, chord solve, key solve), the figuration abstraction and
// its binder, and the three generated candidate libraries.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readMidi } from '../src/ingest/midi.js';
import { splitHands, chordTimeline, solveKeyKS, barFigures, pickGrid, memberToken } from '../src/ingest/piano.js';
import { PROGRESSIONS_UNDERTALE } from '../src/lib/progressions-undertale.js';
import { FIGURATIONS_UNDERTALE, DEVELOPMENT_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import { parseDegrees, findProgressions, ALL_PROGRESSIONS } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { chordTones } from '../src/harness/chords.js';
import { bindFigure, normalizeRhythm } from '../src/binder/bind.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const GENERATED = ['src/lib/progressions-undertale.js', 'src/lib/figurations-undertale.js', 'src/lib/rhythms-undertale.js'];

test('D30: the generated libraries are exactly what the importer produces (no hand edits)', () => {
  const before = GENERATED.map((f) => readFileSync(join(ROOT, f), 'utf8'));
  execFileSync('node', ['scripts/import-undertale.mjs'], { cwd: ROOT });
  GENERATED.forEach((f, i) => {
    assert.equal(readFileSync(join(ROOT, f), 'utf8'), before[i],
      `${f} drifted from scripts/import-undertale.mjs — it is generated, do not hand-edit`);
  });
});

test('D30: hand split — multi-track files split by track, single-track by pitch', () => {
  const two = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Snowdin Town.mid'));
  const barTicks2 = two.ppq * 4;
  const s2 = splitHands(two, barTicks2);
  assert.match(s2.method, /^tracks/);
  // the accompaniment sits below the melody
  const meanOf = (ns) => ns.reduce((a, n) => a + n.midi, 0) / ns.length;
  assert.ok(meanOf(s2.acc) < meanOf(s2.mel));

  const one = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Megalovania.mid'));
  const s1 = splitHands(one, one.ppq * 4);
  assert.match(s1.method, /^pitch-split/);
  assert.ok(meanOf(s1.acc) < meanOf(s1.mel));
});

test('D30: key solve lands on the famous keys', () => {
  const mega = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Megalovania.mid'));
  const k = solveKeyKS(mega.notes);
  assert.equal(k.tonicPc, 2); // D
  assert.equal(k.mode, 'minor');
});

test('D30: chord timeline reads the Megalovania descent from the notes', () => {
  const m = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Megalovania.mid'));
  const barTicks = m.ppq * 4;
  const totalBars = Math.max(1, Math.round(m.endTick / barTicks));
  const { mel } = splitHands(m, barTicks);
  const tl = chordTimeline(m.notes, barTicks, totalBars, { melody: mel });
  // bars 4..7 carry the D C B Bb pedal bass; sample the chord at each bar start
  const rootAtBar = (b) => tl.find((s) => b * 2 >= s.start && b * 2 < s.end)?.rootPc;
  assert.deepEqual([rootAtBar(4), rootAtBar(5), rootAtBar(6), rootAtBar(7)], [2, 0, 11, 10]);
});

test('D30: memberToken abstracts chord tones and keeps literal colours', () => {
  // over a C major chord rooted at C3 (48): E3 is the third, Bb3 a literal ~10
  const rel = new Set([0, 4, 7]);
  assert.equal(memberToken(52, 48, rel).token, '3');
  assert.equal(memberToken(55, 48, rel).token, '5');
  assert.equal(memberToken(60, 48, rel).token, 'R+');
  const bb = memberToken(58, 48, rel);
  assert.equal(bb.token, '~10');
  assert.equal(bb.chordTone, false);
});

test('D30: bindFigure re-voices one figure across qualities (the portability contract)', async () => {
  const entry = {
    name: 'test_fig', bars: 1, onsets: ['0', '1/4', '1/2', '3/4'],
    figure: ['R', '3', '5', 'R+'], accents: [1, 0.8, 0.9, 0.8], octave: 3, legato: false,
  };
  const { expr, boundMeta } = bindFigure(entry, { harmony: ['Dm', 'F'], barsPerChord: 1, key: 'F:major' }, '4/4');
  const notes = boundMeta.notes.map((n) => n.note);
  // Dm: minor third F; F: major third A — same token '3', different interval
  assert.deepEqual(notes.slice(0, 4), ['D3', 'F3', 'A3', 'D4']);
  assert.deepEqual(notes.slice(4, 8), ['F3', 'A3', 'C4', 'F4']);
  const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
  const h = hapsByLabel(ev, 0, 2).get('p');
  assert.ok(!h.error);
  assert.equal(h.haps.length, 8);
});

test('D30: bindFigure renders literal colours and octave marks', async () => {
  const entry = {
    name: 'test_colour', bars: 1, onsets: ['0', '1/2'],
    figure: ['~10', '5.R+'], accents: [1, 0.8], octave: 3, legato: false,
  };
  const { boundMeta } = bindFigure(entry, { harmony: ['C'], barsPerChord: 1, key: 'F:major' }, '4/4');
  const notes = boundMeta.notes.map((n) => n.note);
  assert.deepEqual(notes, ['Bb3', 'G3', 'C4']); // literal b7 (spelled for the key), then fifth + octave-root together
});

test('D30: every figuration entry binds green over a progression', async () => {
  const ctx = { harmony: ['Cm', 'Ab', 'Eb', 'Bb'], barsPerChord: 1, key: 'C:minor' };
  for (const [name, e] of Object.entries(FIGURATIONS_UNDERTALE)) {
    const { expr, period } = bindFigure(e, ctx, e.meter_class);
    const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
    const h = hapsByLabel(ev, 0, period).get('p');
    assert.ok(h && !h.error && h.haps.length > 0, `${name} produced no haps`);
  }
});

test('D30: figuration entries carry the discipline fields', () => {
  for (const [name, e] of Object.entries(FIGURATIONS_UNDERTALE)) {
    assert.equal(e.ratified, false, `${name} must land unratified (A6.1)`);
    assert.equal(e.character, null, `${name} character is earned by ear, not import`);
    assert.equal(e.pack, 'undertale', name);
    assert.equal(e.onsets.length, e.figure.length, name);
    assert.equal(e.onsets.length, e.accents.length, name);
    for (const tok of e.figure) for (const m of tok.split('.')) {
      assert.match(m, /^(R|[34567]|9|~\d+)\+*$/, `${name}: bad token "${tok}"`);
    }
  }
});

test('D30: undertale progressions render in any key and every quality resolves', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_UNDERTALE)) {
    assert.equal(e.pack, 'undertale', name);
    assert.equal(e.ratified, false, name);
    const chords = parseDegrees(e.degrees);
    assert.ok(chords.length >= 2, `${name} has ${chords.length} chords`);
    assert.equal(chords.length, e.barsPerChord.length, `${name}: barsPerChord shape`);
    for (const key of ['C:minor', 'A:major']) {
      for (const sym of renderProgression(e, key)) {
        const pcs = chordTones(sym);
        assert.ok(pcs && pcs.size > 0, `${name}: chord "${sym}" resolves to no pitch classes`);
      }
    }
  }
});

test('D30: the undertale pool is queryable next to the others', () => {
  const ut = findProgressions({ pack: 'undertale' });
  assert.equal(ut.length, Object.keys(PROGRESSIONS_UNDERTALE).length);
  assert.ok(ut.every(({ entry }) => entry.song && entry.sourceKey));
  // merged registry keeps all pools
  assert.ok(Object.keys(ALL_PROGRESSIONS).length > 400);
});

test('D30: development moves reference emitted figures', () => {
  for (const m of DEVELOPMENT_UNDERTALE) {
    assert.ok(FIGURATIONS_UNDERTALE[m.from], `${m.from} missing from figurations`);
    assert.ok(FIGURATIONS_UNDERTALE[m.to], `${m.to} missing from figurations`);
    assert.ok(m.relation.length >= 1 && m.seen >= 1 && m.examples.length >= 1);
  }
});

test('D30: rhythm skeletons normalize through the standard binder path', () => {
  for (const [name, e] of Object.entries(RHYTHMS_UNDERTALE)) {
    const r = normalizeRhythm(e);
    assert.ok(r.onsets.length >= 2, name);
    assert.equal(r.accents.length, r.onsets.length, name);
  }
});

test('D30: grid picking prefers the musical grid over absorbing the humanization', () => {
  const m = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Fallen Down.mid'));
  const barTicks = m.ppq * 4 * (3 / 4);
  const { acc } = splitHands(m, barTicks);
  const g = pickGrid(acc, barTicks, 3);
  assert.ok([6, 12].includes(g.grid), `expected a triple grid, got 1/${g.grid}`);
});
