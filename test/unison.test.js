// D29: material extracted from the Unison packs in audios/ — the MIDI reader, the
// A6.2 triage that decides what may be taken from a file, and the three generated
// candidate libraries.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readMidi, triage, loopPeriod, chordEvents } from '../src/ingest/midi.js';
import { parseNumeral, numeralsFromFilename, parseKeyDir, bestQuality } from '../src/ingest/numerals.js';
import { KEPT } from '../src/lib/verdicts.js';
import { PROGRESSIONS_UNISON } from '../src/lib/progressions-unison.js';
import { RHYTHMS_UNISON, INTERLOCKS_UNISON } from '../src/lib/rhythms-unison.js';
import { VOICING_OBSERVATIONS, FILLS_GAPS } from '../src/lib/voicings-unison.js';
import { VOICINGS } from '../src/lib/voicings.js';
import { parseDegrees, findProgressions, ALL_PROGRESSIONS } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { chordTones } from '../src/harness/chords.js';
import { normalizeRhythm } from '../src/binder/bind.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const KEYS = ['C:minor', 'D:dorian', 'Eb:major', 'F:minor', 'A:major', 'Bb:major'];

const GENERATED = ['src/lib/progressions-unison.js', 'src/lib/rhythms-unison.js', 'src/lib/voicings-unison.js'];

test('D29: the generated libraries are exactly what the importer produces (no hand edits)', () => {
  const before = GENERATED.map((f) => readFileSync(join(ROOT, f), 'utf8'));
  execFileSync('node', ['scripts/import-unison.mjs'], { cwd: ROOT });
  GENERATED.forEach((f, i) => {
    assert.equal(readFileSync(join(ROOT, f), 'utf8'), before[i],
      `${f} drifted from scripts/import-unison.mjs — it is generated, do not hand-edit`);
  });
});

test('D29: MIDI reader gets tempo-independent structure and real velocities', () => {
  const f = 'audios/Unison Free LoFi Drum Kit/Drum Loops/Hip-Hop/1 - Combination Loops/MIDI/Major (106 BPM)/UNISON_DRUMLOOP_Major - Hats (106 BPM).mid';
  const m = readMidi(join(ROOT, f));
  assert.equal(m.ppq, 96);
  assert.deepEqual(m.timeSig, [4, 4]);
  assert.ok(m.notes.length > 100);
  assert.ok(m.notes.every((n) => n.dur > 0 && n.velocity > 0 && n.midi > 0));
  // a 16-bar export of a 4-bar loop must enter the library as 4 bars (A6.5)
  assert.equal(loopPeriod(m.notes, m.ppq * 4, 16), 4);
});

test('D29 (A6.2): triage separates what a file can teach about accents from timing', () => {
  const pathOf = (f) => join(ROOT, f);
  const hats = triage(readMidi(pathOf('audios/Unison Free LoFi Drum Kit/Drum Loops/Hip-Hop/1 - Combination Loops/MIDI/Major (106 BPM)/UNISON_DRUMLOOP_Major - Hats (106 BPM).mid')));
  assert.equal(hats.verdict, 'performance');
  assert.equal(hats.accentsUsable, true);

  const kick = triage(readMidi(pathOf('audios/Unison Free LoFi Drum Kit/Drum Loops/House/1 - Combination Loops/MIDI/Saver (124 BPM)/UNISON_DRUMLOOP_Saver - Kick (124 BPM).mid')));
  assert.equal(kick.verdict, 'quantized-flat');
  assert.equal(kick.accentsUsable, false);

  // The chord packs are all sequenced: valid for pitch, never for feel.
  const chords = triage(readMidi(pathOf('audios/Unison Essential Famous MIDI Chord Progressions/01 - C Major - A Minor /Post Malone - Circles (Imaj7-iii-IV-iv-Imaj7-V-IVmaj7-V6) .mid')));
  assert.equal(chords.pitchOnly, true);
  assert.equal(chords.velocityStdev, 0);
});

test('D29: numerals parse out of filenames, including nested 6(9) groups', () => {
  assert.deepEqual(numeralsFromFilename('Minor Prog 06 (VImaj9-VII6(9)-vm7add11-im7-IIImaj7).mid').tokens,
    ['VImaj9', 'VII6(9)', 'vm7add11', 'im7', 'IIImaj7']);
  assert.equal(numeralsFromFilename('Post Malone - Circles (Imaj7-iii-IV-iv) .mid').label, 'Post Malone - Circles');
  assert.equal(parseNumeral('bIImaj7#11').quality, '^7#11');
  assert.equal(parseNumeral('bIImaj7#11').semis, 1);
  assert.equal(parseNumeral('iim7b5').quality, 'm7b5');   // the minor third lives in the suffix
  assert.equal(parseNumeral('ivm6(9)').quality, 'm69');
  assert.equal(parseNumeral('iii').quality, 'm');         // case carries it when the suffix is bare
  assert.equal(parseNumeral('III').quality, '');
  assert.equal(parseNumeral('maj7sus'), null);            // not a numeral at all
  assert.equal(parseNumeral('IVmaj7sus').quality, null);  // unmapped -> resolved from notes
  assert.deepEqual(parseKeyDir('04 - Eb Major - C Minor'), { majorRoot: 'Eb', minorRoot: 'C', majorPc: 3, minorPc: 0 });
});

test('D29: bestQuality names a chord from its pitch classes', () => {
  assert.equal(bestQuality([0, 4, 7]).quality, '');
  assert.equal(bestQuality([0, 3, 7]).covers, true);
  assert.equal(bestQuality([0, 4, 7, 11]).quality, '^7');
});

test('D29: every extracted progression resolves to playable symbols in every key', () => {
  assert.equal(Object.keys(PROGRESSIONS_UNISON).length, 72);
  const bad = [];
  for (const [name, e] of Object.entries(PROGRESSIONS_UNISON)) {
    assert.equal(e.provenance, 'transcribed', `${name}: provenance`);
    // A6.1: nothing is ratified AT IMPORT — but the D51 verdict overlay ratifies
    // kept entries at load, so ratified must equal exactly "the ear kept it"
    assert.equal(e.ratified, e.verdict === 'keep', `${name}: ratified without a keep verdict`);
    assert.equal(e.character, null, `${name}: character is earned by ear, never generated`);
    assert.ok(e.pack.startsWith('unison-'), `${name}: pack`);
    assert.ok(parseDegrees(e.degrees).length >= 2, `${name}: degrees`);
    for (const key of KEYS) for (const sym of renderProgression(e, key)) {
      if (chordTones(sym).size === 0) bad.push(`${name} @ ${key}: ${sym}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('D29: entries whose label disagrees with the notes are FLAGGED, not silently trusted', () => {
  const flagged = Object.values(PROGRESSIONS_UNISON).filter((e) => e.needsEar);
  assert.ok(flagged.length > 0 && flagged.length < 30, `expected a minority flagged, got ${flagged.length}`);
  for (const e of flagged) {
    // every flag is justified by a number, not a vibe
    assert.ok(e.match.conflict > 0 || e.match.rootMiss > 0 || e.match.repeats === null, e.numerals);
  }
  // and an unflagged entry really did check out — except where the EAR heard
  // it (the overlay clears needsEar on judged entries, and a keep on a
  // label-conflicted card is the ear overruling the proxy, which outranks it)
  for (const e of Object.values(PROGRESSIONS_UNISON).filter((x) => !x.needsEar && x.verdict == null)) {
    assert.equal(e.match.conflict, 0);
    assert.equal(e.match.rootMiss, 0);
  }
  const packs = ['unison-famous', 'unison-dark', 'unison-emotional'];
  assert.equal(findProgressions({ needsEar: true, pack: packs }).length, flagged.length);
});

test('D29: rhythms carry accents only where the source has dynamics to carry', () => {
  assert.equal(Object.keys(RHYTHMS_UNISON).length, 12);
  let bindable = 0;
  for (const [name, r] of Object.entries(RHYTHMS_UNISON)) {
    assert.equal(r.provenance, 'transcribed');
    assert.equal(r.ratified, false);
    assert.equal(r.character, null);
    assert.ok(r.onsets.length > 0);
    if (r.accents) {
      assert.equal(r.needsAccents, false);
      assert.ok(new Set(r.accents).size > 1, `${name}: a uniform profile is a bug (§3.4)`);
      normalizeRhythm(r);   // must survive the real binder, microtiming included
      bindable++;
    } else {
      // A6.2: flat velocity means the file cannot teach accents. Nothing invented.
      assert.equal(r.needsAccents, true, `${name}`);
      assert.equal(r.triage === 'quantized-flat' || r.triage === 'timing-only', true);
    }
  }
  assert.equal(bindable, 3);
});

test('D29: microtiming is representable by the binder (grid <= 192)', () => {
  for (const [name, r] of Object.entries(RHYTHMS_UNISON)) {
    if (!r.microtiming) continue;
    assert.equal(r.microtiming.length, r.onsets.length, `${name}`);
    for (const m of r.microtiming) assert.match(String(m), /^-?\d+(\/\d+)?$/, `${name}: ${m}`);
  }
});

test('D29: parts of one loop are declared co-designed (A5.3)', () => {
  assert.ok(INTERLOCKS_UNISON.length >= 12);
  for (const i of INTERLOCKS_UNISON) {
    assert.equal(i.kind, 'co-designed');
    assert.ok(RHYTHMS_UNISON[i.pair[0]] && RHYTHMS_UNISON[i.pair[1]], i.name);
    assert.equal(RHYTHMS_UNISON[i.pair[0]].loop, RHYTHMS_UNISON[i.pair[1]].loop);
  }
});

test('D29: observed voicings cover qualities the library has no shape for', () => {
  const gaps = new Set(FILLS_GAPS);
  assert.ok(gaps.size >= 4, `expected the records to fill several D28 gaps, got ${[...gaps]}`);
  for (const q of gaps) {
    assert.ok(!(q in VOICINGS.shell_37.shapes), `${q} is supposedly a gap but shell_37 already has it`);
    assert.ok(VOICING_OBSERVATIONS[q]?.length, `${q} has no observation`);
  }
  for (const [q, list] of Object.entries(VOICING_OBSERVATIONS)) {
    for (const v of list) {
      assert.ok(v.offsets.length >= 2, `${q}: a voicing needs notes`);
      assert.equal(v.offsets[0], Math.min(...v.offsets), `${q}: offsets are sorted from the bass`);
      assert.ok(v.seen >= 1 && v.sources.length >= 1, `${q}: provenance`);
    }
  }
});

test('D29: both corpora share one retrieval entry point, distinguishable by pack', () => {
  // 188 ldrolez + 72 unison + the undertale pool (D30) + the vgmusic pool (D52)
  // + the video pool (D57), each counted by its own tests
  assert.equal(Object.keys(ALL_PROGRESSIONS).length,
    260 + findProgressions({ pack: 'undertale' }).length + findProgressions({ pack: 'vgmusic' }).length
      + findProgressions({ pack: 'igvideo' }).length);
  assert.equal(findProgressions({ pack: 'ldrolez' }).length, 188);
  assert.equal(findProgressions({ pack: ['unison-famous', 'unison-dark', 'unison-emotional'] }).length, 72);
  assert.equal(findProgressions({ pack: 'unison-dark' }).every((r) => r.entry.moods.includes('Dark')), true);
  // D51: every ratified entry came from a keep verdict —
  // KEPT minus any whose verdict a re-transcription voided (D52)
  assert.ok(findProgressions({ ratifiedOnly: true }).length <= KEPT.length);
  assert.ok(findProgressions({ ratifiedOnly: true }).length > 0);
  const kept = new Set(KEPT);
  for (const r of findProgressions({ ratifiedOnly: true })) {
    assert.ok(kept.has(r.name), `${r.name} is ratified with no keep verdict behind it`);
  }
});
