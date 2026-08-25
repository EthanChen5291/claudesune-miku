// Facet verdicts Ethan gave in conversation rather than through the page (D53).
//
// HAND-WRITTEN AND NEVER GENERATED. scripts/import-verdicts.mjs merges this file
// UNDER every import, so a fresh export can add to these and can overrule them
// key-by-key, but deleting src/lib/facet-verdicts.js and re-importing cannot
// silently lose them. That separation matters because these carry the only thing
// a click cannot: the sentence Ethan actually said, and why it was read the way
// it was.

export const FACET_SEEDS = {
  source: 'ethan notes 2026-08-24',

  pairs: {
    // "Cm Bm is a pretty good transition / Cm B is also pretty good ... i
    //  rejected the ones that had these simply because the progression itself
    //  sounded weird but these pairs themselves are good (perhaps by themselves
    //  or in a different progression)"
    //
    // The counted corpus puts P(0 -> 11) in minor at 3.4%, 8th of 12 possible
    // destinations — a move the corpus alone would essentially never propose.
    // n is 2 because he named two different chords over the same motion, which
    // is the evidence that it is the MOTION he likes and not one chord; two
    // votes take it to 8.4%, reachable without being common.
    'minor|0>11': {
      verdict: 'good', n: 2, at: '2026-08-24', from: 'notes',
      note: 'Cm->Bm and Cm->B both good as PAIRS; the cycles containing them were killed for other reasons',
    },
  },

  // The same motion AS A CADENCE. Deliberately empty. The minor wrap row out of
  // the tonic holds 57 observations against the inner row's 287, so folding the
  // Cm->Bm votes in here too would have taken P(0->11) as an ending from 0.07%
  // to 19.8% — second-likeliest in the family, off a side note about a
  // transition. A move Ethan likes mid-loop is not yet an ending he likes, and
  // the cadence tab asks that question on its own.
  wraps: {},

  chords: {
    'minor|11:m': { verdict: 'good', n: 1, at: '2026-08-24', from: 'notes', note: 'the Bm of Cm->Bm' },
    'minor|11:': { verdict: 'good', n: 1, at: '2026-08-24', from: 'notes', note: 'the B of Cm->B' },
  },

  // Nothing recorded. "the C sus followed by the resolved version of it COULD
  // ALSO BE good as a resolver last 2/4 measures" is a hypothesis, not a
  // verdict, and the honest response is to build the probe rather than bank the
  // guess. The cadence tab plays every exemplar three ways so it can be settled
  // by ear at the position the device lives in.
  textureDetail: {},
  cadenceDetail: {},
};
