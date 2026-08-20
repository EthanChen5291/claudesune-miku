// Progression rendering (D28): a library progression is semitones-above-the-tonic
// + quality; a song's `key` turns it into the chord symbols the compiler emits.
//
// This is the ONLY place numerals become notes. The library never stores a key,
// and nothing downstream re-parses a Roman numeral against a mode.

import { parseKey, keyUsesFlats, pcToNoteName } from './theory.js';
import { PROGRESSIONS, parseDegrees } from '../lib/progressions.js';

/**
 * renderProgression('min_i_VII_VI_III', 'C:minor') -> ['Cm', 'Bb', 'Ab', 'Eb']
 * Accepts an entry name or the entry object.
 */
export function renderProgression(entryOrName, key) {
  const entry = typeof entryOrName === 'string' ? PROGRESSIONS[entryOrName] : entryOrName;
  if (!entry) {
    throw new Error(`unknown progression "${entryOrName}" — see src/lib/progressions.js (findProgressions() to search by mood/length/shape)`);
  }
  if (!key) throw new Error(`rendering progression "${entry.numerals}" needs a key (spec.key, e.g. "C:minor")`);
  const { rootPc, intervals } = parseKey(key);
  const keyFlats = keyUsesFlats(key);
  const diatonic = new Set(intervals.map((i) => (rootPc + i) % 12));
  return parseDegrees(entry.degrees).map(({ semis, spell, quality }) => {
    const pc = (rootPc + semis) % 12;
    return pcToNoteName(pc, { flats: spellFlats(pc, spell, diatonic, keyFlats) }) + quality;
  });
}

/**
 * Which accidental to spell a chord root with. Most specific wins:
 *  1. the source spelled it (`bVI` wants Ab, `#IV` wants F#) — that IS the answer,
 *     and the semitone count alone cannot recover it: both sit one chromatic step
 *     from a diatonic neighbour.
 *  2. the pitch is chromatic in this key — spell it as the LOWERED neighbour when
 *     the note a semitone above is diatonic. Borrowed roots are overwhelmingly
 *     flats (bII bIII bVI bVII outnumber sharps 137:3 in the corpus), and the
 *     signature alone gets this wrong: D dorian carries no flats, so the b7 of a
 *     borrowed minor progression came out "A#" instead of "Bb".
 *  3. otherwise follow the key signature.
 */
function spellFlats(pc, spell, diatonic, keyFlats) {
  if (spell) return spell === 'b';
  if (diatonic.has(pc)) return keyFlats;
  if (diatonic.has((pc + 1) % 12)) return true;
  if (diatonic.has((pc + 11) % 12)) return false;
  return keyFlats;
}

/**
 * A section's `harmony` field -> a plain array of chord symbols.
 *   ["Dm7","G7"]                 -> unchanged (hand-written stays hand-written)
 *   { lib: "min_i_VII_VI_III" }  -> rendered into `key`
 * Returns { harmony, lib } so the compiler can record provenance in meta.
 */
export function resolveHarmony(harmony, key) {
  if (harmony == null) return { harmony: null, lib: null };
  if (Array.isArray(harmony)) return { harmony, lib: null };
  if (typeof harmony === 'object' && harmony.lib) {
    return { harmony: renderProgression(harmony.lib, key), lib: harmony.lib };
  }
  throw new Error(`section harmony must be an array of chord symbols or { lib: "<progression>" }, got ${JSON.stringify(harmony)}`);
}
