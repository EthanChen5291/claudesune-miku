// r30 — the repeating-interval energy figure (opts.synthRise), his ask:
// "try the synth/violin rise i mentioned in energetic songs ... like some given
// intervals and it repeats those intervals over and over to convey energy
// (changing chords as needed or repeating). i left an example"
//
// Measured off that example in research/reel-energy-rise-r30.md. These tests pin
// the two properties that ARE the device, and the gate that keeps it off the
// niche lanes.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');

test('r30: the gate — niche lanes cannot receive it', () => {
  assert.match(SRC, /const r30 = \(round = 30\) => ruleFresh\(round\) && !nicheLane;/,
    'the r30 gate must combine freshness AND the niche exclusion');
  assert.doesNotMatch(SRC, /ruleFresh\(30\)/,
    'an r30 rule is using a bare ruleFresh(30) and would fire on desert/jungle/horror');
  // r31: the gate accepts a CONFIG OBJECT too. It was `=== true`, so
  // `synthRise: { direction: 'up' }` silently did nothing — and because the
  // empty case had no else branch, the card said nothing either way.
  assert.match(SRC, /if \(\(opts\.synthRise === true \|\| \(opts\.synthRise && typeof opts\.synthRise === 'object'\)\) && r30\(\)\)/,
    'synthRise must accept a config object AND go through the niche gate');
  // a device that asks to cast and does not must say why
  assert.match(SRC, /synth rise: NOT CAST \\u2014 no section reached the energy floor/,
    'the silent-fallthrough branch is gone — an uncast device must report itself');
});

test('r30: THE FREEZE is the device — bound per SECTION, not per bar', () => {
  // The finding: in his example one three-note cell plays unchanged over FIVE
  // different bass notes. That freeze is the only thing separating this from
  // `motorFall`, which plays the same descent but rebinds on every chord.
  assert.match(SRC, /const ctxRise = riseFrozen\s*\n\s*\? \{ harmony: \[frozenSym\], barsPerChord: 1, key \}\s*\n\s*: ctxBar;/,
    'the cell must be able to bind against a CONSTANT chord or it is just motorFall again');
  // r31: the freeze is DEFAULT-ON for the descending form and DEFAULT-OFF for the
  // ascending one, because his two asks differ on exactly that. r30's reference
  // holds one cell over five chords; his r31 aside says "then repeat for another
  // chord", i.e. re-pitch.
  assert.match(SRC, /const riseFrozen = cfg\.frozen \?\? !riseUp;/,
    'frozen must default from the direction — down=frozen (r30), up=re-pitched (r31)');
  assert.match(SRC, /const riseUp = cfg\.direction === 'up';/,
    'the ascending variant is gone');
  assert.match(SRC, /const frozenSym = barSyms\[start % barSyms\.length\];/,
    "the frozen chord must be the SECTION's first, not the song's");
  // ...and per section, because a song-long freeze is the drone D100 rejected
  assert.match(SRC, /form\.sections\.forEach\(\(sec\) => \{[\s\S]{0,600}?const frozenSym/,
    'the freeze must be re-derived per section');
});

test('r30: the figure is the measured one — a scale-ladder descent 5..1', () => {
  assert.match(SRC, /riseMinor \? \['5', '3', 's2', 'R'\] : \['5', 's2', 'R'\];/,
    'the cell must be the measured descent (5-b3-2-1 minor, 5-2-1 major)');
  // r31: his "D F F# A#" was one sharp short. The reel he was quoting spells it
  // D# F F# A# = 0-2-3-7 = ROOT, 9th, b3, 5th, with the 9 BELOW the b3 so a minor
  // 2nd sits inside the chord. That semitone-inside-a-consonant-stack is the
  // trick, and it is the shape the ascending variant must arpeggiate.
  assert.match(SRC, /riseUp \? \['R', 's2', '3', '5'\]/,
    'the r31 ascending variant must be R-9-b3-5, the minor add9 the reel actually shows');
  // scale tokens only: a bare 4 or 7 consults neither key nor chord-scale and
  // wrote out-of-key pitches in r22. Measured 0.0% out-of-key on all four songs.
  const block = SRC.slice(SRC.indexOf('opts.synthRise === true'), SRC.indexOf('L4 · LAYERS THAT BREATHE'));
  assert.doesNotMatch(block, /'\['?4'|'7'/, 'the rise must use scale tokens, never bare 4/7');
  // the 3-note cell leaves the 4th eighth EMPTY, as the reference does
  assert.match(SRC, /onsets: \['0', '1\/8', '2\/8', '4\/8', '5\/8', '6\/8'\]/,
    'the major cell must rest on the 4th eighth');
});

test('r30: it is checked against the metronome test and capped under the lead', () => {
  // D102: 8 onsets/bar passes only because the cell has 3-4 distinct shapes.
  // Checked in code rather than assumed — that rule exists because a
  // single-shaped 8th figure bound the jungle marimba for sixteen bars.
  assert.match(SRC, /const riseMetronomic = \(risePerBar >= 6 && riseShapes <= 1\) \|\| risePerBar >= 12;/,
    'the metronome test must be computed from the figure, not asserted');
  assert.match(SRC, /if \(riseParts\.length && !riseMetronomic\)/,
    'a metronomic rise must not cast');
  // r29/D77: support level stays under the lead. Measured 0.20-0.23x.
  assert.match(SRC, /Math\.round\(0\.62 \* leadGain \* 100\) \/ 100/,
    'the gain ceiling must be relative to the lead');
  assert.match(SRC, /const riseWant = cfg\.octave \?\? \(leadOctave - 1\);/,
    'the register must sit a band under the lead — measured 7-12 semitones ABOVE it at leadOctave');
});

test('r30: the energy page pairs each core under ONE hash name', () => {
  // keyHint is fnv(`${name}|tonic`), so building base and energised under two
  // names would give them different KEYS and the A/B would test the name.
  assert.match(SRC, /const name = row\.label;/,
    'both cards must build under the judged song name');
  assert.match(SRC, /if \(lift\) S\.name = `\$\{row\.label\}_energised`;/,
    'the energised card is renamed AFTER building, not before');
  assert.match(SRC, /motorFall: row\.motor === true/,
    'the base card must carry the layerstack row options or it is not the judged song');
});
