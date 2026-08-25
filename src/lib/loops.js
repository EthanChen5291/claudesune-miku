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

import { thirdClass, rootProbs, qualityProbs, degreeAttested } from './harmony-prior.js';
import { pinnedThirds } from './harmony-ops.js';

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

// ---------------------------------------------------------------------------
// D56 addendum: THE WRAP POLICY IS METER-FIRST (Ethan, 2026-08-25).
//
// "it depends on the desired time signature. time signature + other general
//  framework info is decided first before we pick chords. if it's even, we can
//  either keep that last chord or replace it (but leans towards replacing it ->
//  moreover, there can be multiple replacements as variations if they make
//  sense in the song). if it's odd (let's say 3/4 for the example), then it's
//  not necessarily needed"
//
// So trim-vs-replace is not a taste constant, it is a consequence of a decision
// made EARLIER in the pipeline. In an odd meter a 3-chord loop is at home, so
// the duplicate is simply dropped. In an even meter dropping it would leave an
// odd loop fighting the bar grid, so the duplicate is REPLACED — which keeps
// the bar count and, as a bonus Ethan named himself, yields a ranked list of
// alternates that are exactly the in-song variation material item 0c wants.
// ---------------------------------------------------------------------------

/**
 * Ranked replacement candidates for a loop's duplicated final chord.
 *
 * Scored under the counted prior WITH the ear folded in, on three terms: how the
 * candidate follows the chord before it (inner), how it resolves back to the top
 * of the loop (WRAP — this slot is the cadence, so the cadence table is the one
 * that judges it), and how usual its quality is on that degree.
 *
 * Exclusions: the first chord's root (recreating the doubled bar is the one
 * outcome this exists to prevent) and the exact chord before it (a substitution
 * whose result is its own neighbour has substituted nothing — D50). A candidate
 * ON the previous chord's root with a DIFFERENT third is allowed and exempt from
 * the pinned-third check: that is the named parallel-flip device (v -> V, the
 * harmonic-minor raise), it is one of the three flips the corpus itself endorses
 * (D49: every observed within-loop flip is a named device), and it is literally
 * Ethan's t23 proposal — `... Gm Cm` becoming `... Gm G`, the "Gm to G" ending
 * pair he called out in t20.
 *
 * `ctx.qualities`, when given, restricts candidates to qualities the caller can
 * actually voice (the audition pages pass their dictionary's coverage).
 */
export function wrapReplacements(cycle, ctx = {}) {
  const n = cycle.length;
  if (n < 3) return [];
  const prev = cycle[n - 2];
  const first = cycle[0];
  const fam = { family: ctx.family, home: ctx.home ?? 0, ear: ctx.ear };
  const pinned = pinnedThirds(cycle, n - 1);
  const out = [];
  for (let d = 0; d < 12; d++) {
    if (d === first.semis) continue;
    if (!degreeAttested(d, fam)) continue;
    const onPrevRoot = d === prev.semis;
    const quals = [...qualityProbs(d, fam)]
      .filter(([q]) => !ctx.qualities || ctx.qualities.has(q))
      .filter(([q]) => !(onPrevRoot && q === prev.quality))
      .filter(([q]) => {
        if (onPrevRoot) return thirdClass(q) !== thirdClass(prev.quality); // the flip device or nothing
        const k = thirdClass(q);
        return k === 'none' || !pinned.has(d) || pinned.get(d) === k;
      })
      .sort((a, b) => b[1] - a[1]);
    if (!quals.length) continue;
    const [quality, pq] = quals[0];
    const score = Math.log(rootProbs('inner', prev.semis, fam).get(d))
      + Math.log(rootProbs('wrap', d, fam).get(first.semis))
      + Math.log(pq);
    out.push({
      semis: d, quality, spell: null, score,
      note: onPrevRoot ? `parallel flip of the chord before it (${prev.semis} raised/lowered)` : null,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Apply the meter-first policy to a cycle. Returns
 * `{ cycle, action: 'none'|'trim'|'replace', replaced, options }`.
 *
 * `options` (even meter only) is the ranked alternates list — Ethan: "there can
 * be multiple replacements as variations if they make sense in the song" — so a
 * later arranger can rotate through them at section boundaries instead of
 * inventing variation material from nothing.
 */
export function resolveLoopWrap(cycle, ctx = {}) {
  if (!loopWraps(cycle)) return { cycle, action: 'none', replaced: null, options: [] };
  const numerator = Number(String(ctx.meter ?? '4/4').split('/')[0]) || 4;
  if (numerator % 2) {
    return { cycle: trimLoopWrap(cycle), action: 'trim', replaced: null, options: [] };
  }
  const options = wrapReplacements(cycle, ctx);
  if (!options.length) {
    // nothing legal to say instead — the trim is still better than the doubled bar
    return { cycle: trimLoopWrap(cycle), action: 'trim', replaced: null, options: [] };
  }
  const to = options[0];
  const out = [...cycle.slice(0, -1), { ...cycle.at(-1), semis: to.semis, quality: to.quality, spell: null }];
  // The options list is a VARIATION PALETTE, not a probability ranking, so the
  // parallel-flip device is always included when legal even if it scored below
  // the cut. The score is honest about it — flips are rare in the corpus (2.84%,
  // D49) so P(root->same root) buries it — but it is a named device, it carries
  // a direct ear endorsement (t20/t23: "Gm to G"), and a palette that omits the
  // one move Ethan has asked for by name is not his palette.
  const short = options.slice(0, 4);
  const flip = options.find((o) => o.note);
  if (flip && !short.includes(flip)) short.push(flip);
  return { cycle: out, action: 'replace', replaced: { from: cycle.at(-1), to }, options: short };
}
