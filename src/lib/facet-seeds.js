// Facet verdicts Ethan gave in conversation rather than through the page (D53).
//
// HAND-WRITTEN AND NEVER GENERATED. scripts/import-verdicts.mjs merges this file
// UNDER every import, so a fresh export can add to these and can overrule them
// key-by-key, but deleting src/lib/facet-verdicts.js and re-importing cannot
// silently lose them. That separation matters because these carry the only thing
// a click cannot: the sentence Ethan actually said, and why it was read the way
// it was.

export const FACET_SEEDS = {
  source: 'ethan notes 2026-08-24 + progressions notes 2026-08-26',

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
    // D73, on calm water's `C D F^7 C7`: "C D F^7 -> good in calm water. I
    // especially like the F^7 from D." The II -> IV^7 motion named on its
    // own, mid-loop — a pair vote, not an ending.
    'major|2>5': {
      verdict: 'good', n: 1, at: '2026-08-26', from: 'notes',
      note: '"I especially like the F^7 from D" — II walking up into IVmaj7',
    },
  },

  // Motion AS A CADENCE — a separate bag from `pairs` on purpose. The minor wrap
  // row out of the tonic holds 57 observations against the inner row's 287, so
  // folding the Cm->Bm votes in here too would have taken P(0->11) as an ending
  // from 0.07% to 19.8%, second-likeliest in the family, off a side note about a
  // transition. A move Ethan likes mid-loop is not yet an ending he likes.
  // Nothing lands here except a verdict that named an ENDING.
  wraps: {
    // t20, on `Cm Ab Gm G`: "love the Gm to G as an ending pair". The loop ends
    // on G and wraps back to Cm, so this is a vote on V -> i AS A CADENCE, which
    // is the only thing that writes to this bag (see facets.js). The corpus
    // already rates it highly, so this is confirmatory rather than corrective —
    // recorded anyway, because a cadence he named is worth more than one he
    // merely did not object to.
    'minor|7>0': {
      verdict: 'good', n: 1, at: '2026-08-25', from: 'notes',
      note: 'the G of "Gm to G as an ending pair" resolving back to Cm',
    },
  },

  chords: {
    'minor|11:m': { verdict: 'good', n: 1, at: '2026-08-24', from: 'notes', note: 'the Bm of Cm->Bm' },
    'minor|11:': { verdict: 'good', n: 1, at: '2026-08-24', from: 'notes', note: 'the B of Cm->B' },
    // t20: "love the Gm to G as an ending pair" (the card was `Cm Ab Gm G`).
    // The raised V in a minor key — the harmonic-minor leading tone, reached by
    // the `mixture` operator v -> V. The counted prior puts a major triad on
    // degree 7 in minor at only 15% against 47% for the minor one, so this is a
    // move the corpus alone under-proposes and Ethan singled out unprompted.
    'minor|7:': {
      verdict: 'good', n: 1, at: '2026-08-25', from: 'notes',
      note: 'the G of "Gm to G as an ending pair" — raised V in minor, v->V mixture',
    },
    // progressions.html note on gen_m4lpa (D60): "Cm to Bbm is very off". The
    // colliding gen names were disambiguated by symbols — the card with that
    // transition is the MODAL one (Cm Bbm Cm Db). The root motion 0->10 is
    // corpus-common (bVII); what he flagged is the MINOR QUALITY on it, so this
    // is a chord vote, not a pair vote. (His same-session "Cm to Ebm sounds
    // kinda off but it's stylistic" — modal 3:m — is ambivalent and stays a
    // CARD_NOTE, not a seed.)
    'modal|10:m': {
      verdict: 'bad', n: 1, at: '2026-08-26', from: 'notes',
      note: '"Cm to Bbm is very off" — the bvii minor triad in a modal cycle',
    },
    // D73, calm water: "however C7 following F^7 doesnt fit too well. I
    // don't like the C7." The root motion 5>0 (IV -> I) is unremarkable;
    // what he rejects is the DOMINANT QUALITY on the tonic — the b7 smear
    // on home in a calm major loop. A chord vote, not a pair vote.
    'major|0:7': {
      verdict: 'bad', n: 1, at: '2026-08-26', from: 'notes',
      note: '"I don\'t like the C7" — tonic with a b7 closing a calm major loop',
    },
  },

  // Nothing recorded. "the C sus followed by the resolved version of it COULD
  // ALSO BE good as a resolver last 2/4 measures" is a hypothesis, not a
  // verdict, and the honest response is to build the probe rather than bank the
  // guess. The cadence tab plays every exemplar three ways so it can be settled
  // by ear at the position the device lives in.
  textureDetail: {},
  cadenceDetail: {},
};
