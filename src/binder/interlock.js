// Interlock scoring (§3.5): great grooves are co-designed. complement(a, b) =
// fraction of b's onsets that fall in a's gaps (i.e. NOT coinciding with a's
// onsets). The binder-level check runs over every pair of rhythmic layers in a
// section; pairs below threshold are flagged unless they came from a declared
// interlock pair in the library.

import { toFrac } from './bind.js';

function keyOf(f) { const [n, d] = toFrac(f); return `${n}/${d}`; }

/** fraction of b's onsets in a's gaps. 1 = fully complementary, 0 = fully coincident */
export function complement(aOnsets, bOnsets) {
  if (!bOnsets.length) return 1;
  const aSet = new Set(aOnsets.map(keyOf));
  const inGaps = bOnsets.filter((o) => !aSet.has(keyOf(o))).length;
  return inGaps / bOnsets.length;
}

/** symmetric summary of how two rhythms sit against each other */
export function interlockScore(aOnsets, bOnsets) {
  const ab = complement(aOnsets, bOnsets);
  const ba = complement(bOnsets, aOnsets);
  return { bInAGaps: round(ab), aInBGaps: round(ba), joint: round((ab + ba) / 2) };
}

export const DEFAULT_INTERLOCK_THRESHOLD = 0.34;

/**
 * Check all pairs of bound rhythmic layers in a section.
 * layers: [{ label, onsets: ['0','3/16',...] }], declaredPairs: [['kick','bass'],...]
 * Coincidence on the downbeat is expected and excluded from blame.
 */
export function checkInterlocks(layers, { threshold = DEFAULT_INTERLOCK_THRESHOLD, declaredPairs = [] } = {}) {
  const results = [];
  const declared = new Set(declaredPairs.map((p) => [...p].sort().join('+')));
  for (let i = 0; i < layers.length; i++) {
    for (let j = i + 1; j < layers.length; j++) {
      const a = layers[i], b = layers[j];
      const dropDownbeat = (os) => os.filter((o) => keyOf(o) !== '0/1');
      const score = interlockScore(dropDownbeat(a.onsets), dropDownbeat(b.onsets));
      const pairKey = [a.label, b.label].sort().join('+');
      results.push({
        pair: [a.label, b.label],
        ...score,
        declared: declared.has(pairKey),
        ok: score.joint >= threshold || declared.has(pairKey),
      });
    }
  }
  return results;
}

function round(x) { return Math.round(x * 1000) / 1000; }
