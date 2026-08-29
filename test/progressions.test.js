// D28: the imported progression library, its renderer, the compiler's { lib }
// harmony, and the chord-resolution lint rule that made importing safe.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PROGRESSIONS, parseDegrees, progressionQualities, playableWith, findProgressions } from '../src/lib/progressions.js';
import { VOICINGS } from '../src/lib/voicings.js';
import { renderProgression, resolveHarmony } from '../src/binder/harmony.js';
import { KEPT } from '../src/lib/verdicts.js';
import { chordTones } from '../src/harness/chords.js';
import { lintSong } from '../src/harness/lint.js';
import { compile } from '../src/compiler/compile.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const KEYS = ['C:minor', 'Db:major', 'D:dorian', 'Eb:major', 'E:minor', 'F:minor',
  'Gb:major', 'G:major', 'Ab:major', 'A:minor', 'Bb:major', 'B:minor'];

test('D28: progressions.js is exactly what the importer produces (no hand edits)', () => {
  execFileSync('node', ['scripts/import-ldrolez.mjs', '--check'], { cwd: ROOT });
});

test('D28: every entry carries family/provenance and is UNRATIFIED with no invented character', () => {
  const names = Object.keys(PROGRESSIONS);
  assert.equal(names.length, 188);
  for (const [name, e] of Object.entries(PROGRESSIONS)) {
    assert.ok(['major', 'minor', 'modal'].includes(e.family), `${name}: family`);
    assert.equal(e.role, 'harmony', `${name}: role`);
    assert.equal(e.provenance, 'transcribed', `${name}: provenance`);
    assert.match(e.source, /ldrolez/, `${name}: source pointer`);
    // A6.1: an imported corpus is a candidate pool. Nothing is ratified at
    // import; the D51 overlay ratifies at load exactly where a keep verdict
    // exists, and `character` is written by the ear — never generated.
    assert.equal(e.ratified, e.verdict === 'keep', `${name}: ratified without a keep verdict`);
    assert.equal(e.character, null, `${name}: character must not be invented at import`);
    assert.ok(e.moods.length, `${name}: source mood tags`);
    assert.ok(parseDegrees(e.degrees).length >= 3, `${name}: degrees`);
  }
});

test('D28: degrees are semitones above the TONIC — one representation for all three source notations', () => {
  // minor family: source spells "VII" for the b7 (10 semitones)
  assert.equal(PROGRESSIONS.min_i_VII_VI_III.degrees, '0:m 10 8 3');
  // modal family: source spells the same chord "bVIIM" — same semitones, and the
  // source's accidental rides along because spelling can't be recovered from the
  // number alone (bVI and #V are one pitch, two spellings)
  assert.equal(PROGRESSIONS.mod_im_bIIIM_bVIIM_IV.degrees, '0:m 3b 10b 5');
  assert.deepEqual(parseDegrees('10b')[0], { semis: 10, spell: 'b', quality: '' });
  assert.deepEqual(parseDegrees('6#:o')[0], { semis: 6, spell: '#', quality: 'o' });
  assert.throws(() => parseDegrees('12'), /out of range/);
  assert.throws(() => parseDegrees('Bb'), /bad degree token/);
  // major family: diatonic 7th resolves per-degree, dom7 is explicit
  assert.equal(PROGRESSIONS.maj_I_I7_Idom7_IV.degrees, '0 0:^7 0:7 5');
});

test('D28: renderProgression lands the right symbols in the right key', () => {
  assert.deepEqual(renderProgression('min_i_VII_VI_III', 'C:minor'), ['Cm', 'Bb', 'Ab', 'Eb']);
  assert.deepEqual(renderProgression('min_i_VII_VI_III', 'A:minor'), ['Am', 'G', 'F', 'C']);
  assert.deepEqual(renderProgression('maj_I_V_vi_IV', 'G:major'), ['G', 'D', 'Em', 'C']);
  // Ionian-relative numerals are tonic-anchored: bIII over D is F, not E.
  assert.deepEqual(renderProgression('mod_im_bIIIM_bVIIM_IV', 'D:dorian'), ['Dm', 'F', 'C', 'G']);
  // sharp keys spell sharp
  assert.deepEqual(renderProgression('maj_I_V_vi_IV', 'A:major'), ['A', 'E', 'F#m', 'D']);
  assert.throws(() => renderProgression('nope_not_real', 'C:minor'), /unknown progression/);

  // Spelling: the key signature alone is not enough. D dorian carries no flats,
  // so a borrowed b7/b6 came out "A#"/"G#" — nonsense to read in a dorian song.
  // A chromatic root spells as the LOWERED neighbour...
  assert.deepEqual(renderProgression('min_i_VII_VI_III', 'D:dorian'), ['Dm', 'C', 'Bb', 'F']);
  // ...unless the source said otherwise: #IV is F#, not Gb.
  assert.deepEqual(renderProgression('mod_vi_viim_V_vi_sIVdim_V', 'C:major'), ['Am', 'Bm', 'G', 'Am', 'F#o', 'G']);
  assert.throws(() => renderProgression('maj_I_V_vi_IV', null), /needs a key/);
});

test('D28: no rendered symbol is ever spelled with a double accidental or wrong case', () => {
  for (const name of Object.keys(PROGRESSIONS)) {
    for (const key of KEYS) {
      for (const sym of renderProgression(name, key)) {
        assert.match(sym, /^[A-G][b#]?/, `${name} @ ${key}: ${sym}`);
        assert.doesNotMatch(sym, /^[A-G][b#]{2}/, `${name} @ ${key}: ${sym}`);
      }
    }
  }
});

test('D28: EVERY progression renders to symbols that resolve, in every key', () => {
  // The whole point of canonicalizing to the ireal dialect: no imported entry can
  // produce a symbol that silently drops out of harmonic verification.
  const bad = [];
  for (const name of Object.keys(PROGRESSIONS)) {
    for (const key of KEYS) {
      for (const sym of renderProgression(name, key)) {
        if (chordTones(sym).size === 0) bad.push(`${name} @ ${key}: ${sym}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('D28: every voicing-shape quality key is a spelling ireal also understands', () => {
  // The bug this closes: shapes keyed 'sus4'/'dim' voiced correctly while the
  // harmony timeline resolved them to nothing (and vice versa for 'sus'/'o').
  for (const [shape, v] of Object.entries(VOICINGS)) {
    for (const q of Object.keys(v.shapes)) {
      assert.ok(chordTones(`C${q}`).size > 0, `voicing "${shape}" key "${q}" does not resolve under ireal`);
    }
  }
});

test('D28: retrieval filters by family, mood, length and playable shape', () => {
  // scoped to the ldrolez pack — the pool now spans both corpora (D29)
  assert.equal(findProgressions({ pack: 'ldrolez', family: 'minor' }).length, 58);
  assert.equal(findProgressions({ length: 4, family: 'major' }).every((r) => r.length === 4), true);
  assert.ok(findProgressions({ moods: 'Cadence' }).length >= 6);
  assert.ok(findProgressions({ moods: ['nostalgic'] }).length > 20); // case-insensitive
  // D51: ratification is real now — it comes from Ethan's keep verdicts, via
  // scripts/import-verdicts.mjs, and nothing else may set it.
  const ratified = findProgressions({ ratifiedOnly: true });
  assert.equal(ratified.length, KEPT.length);
  assert.ok(ratified.every((r) => KEPT.includes(r.name)));
  assert.equal(findProgressions({ pack: 'ldrolez' }).length, 188);

  // 176 of 188 are playable with the shapes that exist today; the rest need one
  // of five qualities nobody has auditioned yet. (r16: 174 -> 176 and six -> five
  // because m6 gained a shape in all five voicings when he ruled "add :6 to the
  // dialect" — 6 was already there, m6 was the real gap.)
  assert.equal(findProgressions({ pack: 'ldrolez', shape: 'shell_37' }).length, 176);
  const missing = new Set();
  for (const e of Object.values(PROGRESSIONS)) {
    for (const q of progressionQualities(e)) if (!(q in VOICINGS.shell_37.shapes)) missing.add(q);
  }
  assert.deepEqual([...missing].sort(), ['2', '5', '69', 'add9', 'madd9']);
  assert.equal(playableWith(PROGRESSIONS.min_i_VII_VI_III, 'shell_37'), true);
  assert.throws(() => playableWith(PROGRESSIONS.min_i_VII_VI_III, 'no_such_shape'), /unknown voicing shape/);
});

test('D28 lint: a chord symbol that resolves to nothing is an ERROR, not a silent skip', () => {
  // Before this rule these bound and played while chord-tone snapping and every
  // harmonic assertion skipped them (assertions.js: `if (seg.pcs.size === 0)`).
  const bad = lintSong(`let h = chord("<Dsus4 Cdim Fsus2>").dict('ireal')`);
  assert.equal(bad.errors.length, 3);
  assert.match(bad.errors[0].msg, /does not resolve/);
  assert.equal(lintSong(`let h = chord("<Dsus Co F2>").dict('ireal')`).errors.length, 0);
  // mini-notation operators are stripped, not mistaken for part of the symbol
  assert.equal(lintSong(`let h = chord("<Dm7!2 G7 [Cm7 Ab^7]>/2").dict('ireal')`).errors.length, 0);
});

test('D28 lint: a chord with no shape in the bound me_* dict is an ERROR (the layer would go silent)', () => {
  const gap = lintSong(`let k = chord("<Cadd9 Fm7>").dict('me_shell_37').voicing().s("square")`);
  assert.equal(gap.errors.length, 1);
  assert.match(gap.errors[0].msg, /no "add9" shape in voicing "me_shell_37"/);
  assert.match(gap.errors[0].msg, /findProgressions/); // tells you how to avoid it
  assert.equal(lintSong(`let k = chord("<Csus Fm7>").dict('me_shell_37').voicing()`).errors.length, 0);
  // ireal is the full dictionary — no shape check applies
  assert.equal(lintSong(`let k = chord("<Cadd9 Fm7>").dict('ireal').voicing()`).errors.length, 0);
});

test('D28 compiler: harmony { lib } renders into the key and records provenance', () => {
  const spec = {
    title: 't', form: 'A B', key: 'C:minor', bpm: 100,
    sections: {
      A: { role: 'verse', bars: 4, harmony: { lib: 'min_i_VII_VI_III' }, harmonicRhythm: 1, layers: { keys: `chords.dict('ireal').voicing().s("square")` } },
      B: { role: 'chorus', bars: 4, harmony: ['Cm7', 'Ab^7', 'Bb7', 'Cm7'], harmonicRhythm: 1, layers: { keys: `chords.dict('ireal').voicing().s("square")` } },
    },
  };
  const { source, meta } = compile(spec);
  assert.match(source, /let harmony_A = chord\("<Cm Bb Ab Eb>"\)\.dict\('ireal'\)/);
  assert.deepEqual(meta.sections.A.harmony, ['Cm', 'Bb', 'Ab', 'Eb']);
  assert.equal(meta.sections.A.harmonyLib, 'min_i_VII_VI_III');
  assert.equal(meta.sections.B.harmonyLib, null); // hand-written harmony stays hand-written
  assert.equal(lintSong(source).errors.length, 0);
});

test('D28 compiler: a lib harmony without a key, or an unknown lib name, fails loudly', () => {
  const base = (harmony, key) => ({
    title: 't', form: 'A', ...(key ? { key } : {}),
    sections: { A: { bars: 4, harmony, harmonicRhythm: 1, layers: { keys: `chords.dict('ireal').voicing()` } } },
  });
  assert.throws(() => compile(base({ lib: 'min_i_VII_VI_III' }, null)), /needs spec\.key/);
  assert.throws(() => compile(base({ lib: 'not_a_progression' }, 'C:minor')), /unknown progression/);
  assert.throws(() => compile(base({ nope: 1 }, 'C:minor')), /array of chord symbols or \{ lib/);
  assert.deepEqual(resolveHarmony(['Cm7'], 'C:minor'), { harmony: ['Cm7'], lib: null });
  assert.deepEqual(resolveHarmony(null, 'C:minor'), { harmony: null, lib: null });
});
