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
import { VERDICTS } from '../src/lib/verdicts.js';
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
    // D51: ratified iff Ethan kept it. An entry he has not heard stays false.
    assert.equal(e.ratified, VERDICTS[name]?.verdict === 'keep', name);
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

test('D34: a progression\'s ownFigure round-trips to the source notes', async () => {
  // The harmony of these songs IS its deployment (Ethan, audition round 3):
  // rendering the extracted interval pattern over the extracted chords must
  // reproduce the source accompaniment — including the bass line's register
  // walk (D3 C3 B2 Bb2, not roots snapped into one octave) and mid-bar chord
  // arrivals (captured as literal '~n' intervals).
  const e = PROGRESSIONS_UNDERTALE.ut_megalovania_p1;
  assert.ok(e.ownFigure, 'megalovania should carry its own figure');
  const symbols = renderProgression(e, e.sourceKey);
  const bars = [];
  let ci = 0, acc = 0;
  for (let b = 0; b < e.loopBars; b++) {
    while (ci < e.barsPerChord.length - 1 && acc + e.barsPerChord[ci] <= b) { acc += e.barsPerChord[ci]; ci++; }
    bars.push(symbols[ci]);
  }
  const { boundMeta } = bindFigure(e.ownFigure, { harmony: bars, barsPerChord: 1, key: e.sourceKey }, e.meter);
  const cyc = (c) => boundMeta.notes.filter((n) => n.cycle === c).map((n) => n.note);
  assert.deepEqual(cyc(0), Array(10).fill('D3'));
  assert.deepEqual(cyc(1), Array(10).fill('C3'));
  assert.deepEqual(cyc(2), Array(10).fill('B2')); // walks DOWN to B2, no octave snap
  assert.deepEqual(cyc(3), ['Bb2', 'Bb2', 'Bb2', 'Bb2', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3']);
});

test('D34: chord qualities come from the accompaniment, not the melody riff', () => {
  const e = PROGRESSIONS_UNDERTALE.ut_megalovania_p1;
  // the riff (D-A-Ab-G-F over each pedal) used to dress these labels as
  // D5/Csus/Do/Co7; accompaniment-only voting + octave-double reassignment +
  // diatonic completion must yield the plain famous descent.
  // The last chord is Bb, NOT Bb^7 (D45): the accompaniment sounds only Bb and
  // C there — no A anywhere — so the major 7th was never earned. The riff's F
  // likewise may not turn the bare B pedal into B-diminished: colour is the
  // accompaniment's word, and the melody's only vote is the binary third.
  assert.deepEqual(renderProgression(e, e.sourceKey).slice(0, 4), ['Dm', 'C', 'Bm', 'Bb']);
});

// ---------------------------------------------------------------------------
// D45: a chord label is a claim, and .voicing() will PLAY every tone it names.
// ---------------------------------------------------------------------------

// one bar of notes at a fixed grid; `spans` is [[startBeat, endBeat, midis]]
function bar(spans, { ppq = 96 } = {}) {
  const notes = [];
  for (const [b0, b1, midis] of spans) {
    for (const midi of midis) notes.push({ midi, tick: Math.round(b0 * ppq), dur: Math.round((b1 - b0) * ppq), vel: 100 });
  }
  return notes;
}
const C_MAJOR = { tonicPc: 0, mode: 'major' };

test('D45: a colour the accompaniment never sounds is not part of the label', () => {
  // one bar of a fully voiced Cmaj7 (C E G B), then one bar of bare F octaves.
  // The first has earned its seventh; the second has not, and the old labeller
  // handed it one anyway — a root plus one tone can out-score a plain triad on
  // the missing-tone penalty alone, and .voicing() then plays the invention.
  const notes = bar([[0, 4, [48, 52, 55, 59]], [4, 8, [53, 65]]]);
  const tl = chordTimeline(notes, 96 * 4, 2, { key: C_MAJOR });
  assert.deepEqual(tl.map((s) => `${s.rootPc}${s.quality}`), ['0^7', '5'],
    'a bare octave claimed a colour it never plays');
});

test('D45: colour is the accompaniment’s word — a melody sweep cannot alter a chord', () => {
  // bare C pedal in the left hand; the right hand runs C-D-E-Gb over it. Let
  // the melody vote on colour and that Gb makes the bar C-diminished. It is a
  // run: the melody's only vote is the binary third (D34), never the fifth.
  const acc = bar([[0, 4, [36, 48]]]);
  const riff = bar([[0, 1, [72]], [1, 2, [74]], [2, 3, [76]], [3, 4, [78]]]);
  const tl = chordTimeline([...acc, ...riff], 96 * 4, 1, { key: C_MAJOR, melody: new Set(riff) });
  assert.deepEqual(tl.map((s) => `${s.rootPc}${s.quality}`), ['0'],
    'the riff dressed a bare C pedal as something exotic');
});

test('D45: a bass walk under a ringing harmony is not a chord of its own', () => {
  // Dating Start, bars 36-38: Ab -> A -> Bb walking into the tonic. The A got
  // labelled A^7 in a Bb major song — an A, a C#, an E and a G# where the
  // accompaniment sounded Ab/D/Eb/F/A. This is the card Ethan heard go wrong.
  const e = PROGRESSIONS_UNDERTALE.ut_dating_start_p3;
  const syms = renderProgression(e, e.sourceKey);
  assert.ok(!syms.some((s) => /^A(?![b#])/.test(s)), `an A chord survived in Bb major: ${syms.join(' ')}`);
  // ...but a bass walk that IS the harmony still reads as chords: Megalovania's
  // D-C-B-Bb is four bare octave pedals and must stay four chords (D30 above).
  // The two are told apart by coverage, not by chromaticism — the A in Bb major
  // is diatonic, and the B in D minor is not.
  const m = PROGRESSIONS_UNDERTALE.ut_megalovania_p1;
  assert.equal(new Set(renderProgression(m, m.sourceKey).slice(0, 4)).size, 4);
});

test('D45: coverage describes the label the entry actually carries', () => {
  for (const [name, entry] of Object.entries(PROGRESSIONS_UNDERTALE)) {
    assert.ok(entry.coverage > 0 && entry.coverage <= 1, `${name}: coverage ${entry.coverage}`);
    // `needsEar` is a REQUEST for a listen, so an entry that has been listened
    // to is answered whichever way the verdict went (D51). Only unjudged
    // entries still follow the automatic honesty numbers.
    const v = VERDICTS[name];
    // ...unless the verdict was voided by a re-transcription (D52), in which
    // case the entry is back to its automatic honesty numbers.
    if (v && (v.judged == null || v.judged === entry.degrees)) {
      assert.equal(entry.needsEar, false, `${name}: judged, but still asking for an ear`);
      continue;
    }
    assert.equal(entry.needsEar, entry.coverage < 0.62 || entry.keyMargin < 0.05,
      `${name}: needsEar disagrees with its own honesty numbers`);
  }
});

test('D30: grid picking prefers the musical grid over absorbing the humanization', () => {
  const m = readMidi(join(ROOT, 'audios/Undertale MIDI/Undertale - Fallen Down.mid'));
  const barTicks = m.ppq * 4 * (3 / 4);
  const { acc } = splitHands(m, barTicks);
  const g = pickGrid(acc, barTicks, 3);
  assert.ok([6, 12].includes(g.grid), `expected a triple grid, got 1/${g.grid}`);
});
