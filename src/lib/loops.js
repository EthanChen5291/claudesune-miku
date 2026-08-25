// Cycle-shape rules: what goes wrong when a chord list is played as a LOOP
// rather than read as a list (D56).
//
// WHY THIS EXISTS. Three of Ethan's judge-pass notes are the same complaint:
//
//   t23 "I think the last Cm should be replaced with something else ... because
//        the double Cm back to back doesn't sound too good"
//   t27 "fourth Cm should be replaced with something else - back to back Cm is
//        ok sometimes but sounds uniform"
//   t30 "another G added to the end is strange because it makes it 5 chords and
//        it's back to back G"
//
// He was hearing a transcription convention, not a musical choice. A person
// writing a progression down ends it where it resolves — `Cm Eb Fm Cm` means
// "and back to Cm". Played as a LOOP that final chord is already there, so the
// seam sounds `... Fm Cm | Cm Eb ...`: a doubled bar of the tonic, every time
// round, forever. It is also why several loops came out an odd number of chords
// (t30's "it makes it 5 chords"), which then fights a 4/4 bar grid.
//
// MEASURED, not assumed: 77 of the 511 library entries have last.root ==
// first.root. Broken down —
//
//     54  same root AND same quality      the defect. A doubled bar.
//     20  same root, different quality    `I ... I^7`, a colour change. Fine.
//      3  a sus resolving into the tonic  the cadential figure (D53). Keep.
//
// So the rule has to be narrow: trim only when the repeat says nothing new.
//
// WHY THIS IS A RENDERING RULE AND NOT A DATA FIX. Rewriting the 54 entries
// would rename them (`min_i_iv_VII_i` is not `min_i_iv_VII`), change the music
// they name, and void every verdict recorded against them under D52's rule that
// a verdict judges the music that played. The entry keeps recording what the
// source said; the loop is what gets trimmed.

import { thirdClass } from './harmony-prior.js';

/**
 * Drop a trailing chord that duplicates the first, so a loop does not double it
 * across the seam. Returns the cycle unchanged when the repeat carries
 * information.
 *
 * Kept: a different quality on the same root (a colour change), a suspension
 * resolving into the opening chord, and any cycle short enough that trimming
 * would leave less than two chords.
 */
export function trimLoopWrap(cycle) {
  if (!Array.isArray(cycle) || cycle.length < 3) return cycle;
  const last = cycle.at(-1);
  const first = cycle[0];
  if (last.semis !== first.semis) return cycle;
  if (last.quality !== first.quality) return cycle;
  // a sus resolving into its own triad is the device, but that needs DIFFERENT
  // qualities, so it is already excluded above; this is belt and braces for a
  // future quality vocabulary where two sus spellings compare equal
  if (thirdClass(last.quality) === 'none' && thirdClass(first.quality) !== 'none') return cycle;
  return cycle.slice(0, -1);
}

/** did trimLoopWrap have anything to do? */
export const loopWraps = (cycle) => trimLoopWrap(cycle).length !== cycle.length;

/**
 * Every shape problem a cycle has as a loop, as plain strings. Reported rather
 * than fixed — `oddLength` in particular has no automatic answer (Ethan, t26:
 * "five chords - sounds awkward in timing but the chords work", and then
 * proposed splitting it into two phrases rather than deleting anything).
 */
export function loopIssues(cycle) {
  const out = [];
  if (!Array.isArray(cycle) || !cycle.length) return out;
  if (loopWraps(cycle)) {
    out.push(`the last chord repeats the first — as a loop that is a doubled bar of ${cycle[0].semis} every time round`);
  }
  const n = cycle.length;
  for (let i = 0; i < n - 1; i++) {
    if (cycle[i].semis === cycle[i + 1].semis && cycle[i].quality === cycle[i + 1].quality) {
      out.push(`slots ${i} and ${i + 1} are the same chord`);
    }
  }
  const trimmed = trimLoopWrap(cycle).length;
  if (trimmed % 2) out.push(`${trimmed} chords — an odd loop against a 4/4 bar grid`);
  return out;
}
