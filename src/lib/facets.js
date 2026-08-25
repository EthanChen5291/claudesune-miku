// Facet verdicts (D53): taste recorded at the grain Ethan actually hears it.
//
// WHY THIS EXISTS. Until now the only ear signal was one bit per library entry —
// `keep` or `kill` on a whole card (D51). Ethan's notes of 2026-08-24 showed that
// bit is an AVERAGE over things he judges separately, and gave three examples in
// three sentences:
//
//   "Cm Bm is a pretty good transition. Cm B is also pretty good. i rejected the
//    ones that had these simply because the progression itself sounded weird but
//    these pairs themselves are good"
//        -> the PAIR is good; the CYCLE containing it is not. One bit destroyed
//           the pair evidence. (And the counted model agrees it is rare: 0->11
//           in minor is 3.4%, ranked 8th of 12 — so this is exactly the kind of
//           move the corpus alone will never propose.)
//
//   "the C sus followed by the resolved version of it could also be good as a
//    resolver last 2/4 measures"
//        -> the DEVICE is good AT A POSITION. `suspend` fired anywhere; a
//           suspension is a cadential move, not a uniformly-random one.
//
//   "some of the chords i rejected sound worse only in the format they were
//    delivered. there will also be different formats."
//        -> the verdict was on the TEXTURE, not the harmony. A kill in block
//           chords must not kill the harmony for the arpeggio.
//
// So a verdict here names WHICH FACET it judges. Five kinds:
//
//   pair     root motion from -> to, in a family      "Cm -> Bm works"
//   chord    a quality on a degree, in a family       "B major on the b7+1 works"
//   texture  a rendering format                       "this harmony works arped"
//   cadence  a device at the loop wrap                "sus resolving at the wrap"
//   cycle    the whole progression  (this is verdicts.js — kept there, D51)
//
// HOW A FACET BECOMES A PROBABILITY. Not by overriding the corpus. A facet
// verdict is folded in as PSEUDO-COUNTS on the family row, the same currency the
// rest of the model is denominated in, so it composes with the existing backoff
// instead of sitting beside it as a second opinion:
//
//   liked pair    +EAR_COUNT observations of that transition
//   disliked pair +EAR_COUNT observations of "something else happened from here",
//                 spread over the other attested destinations in proportion
//
// EAR_COUNT is 8, deliberately the same as BACKOFF_C: one click is worth exactly
// the evidence at which a table half-owns its own row. That makes the ear strong
// enough to promote a rare move (0->11 minor goes 3.4% -> 8.3% on one vote,
// 12% on two) and too weak to invent a first-class one from a single click. It
// also degrades correctly: on a row the corpus has 500 observations of, one vote
// moves almost nothing; on a thin row it moves a lot, which is right, because a
// thin row is where the corpus knows least.

import { FACET_VERDICTS } from './facet-verdicts.js';

/** one click is worth this many corpus observations — see the note above */
export const EAR_COUNT = 8;

export const FACET_KINDS = ['pair', 'wrap', 'chord', 'texture', 'cadence', 'cycle'];

// A PAIR VERDICT AND A WRAP VERDICT ARE DIFFERENT CLAIMS, and conflating them
// was a real bug caught by measurement rather than by argument. The minor wrap
// row out of the tonic holds 57 observations against the inner row's 287, so
// folding Ethan's two `Cm->Bm` votes into both tables took P(0->11) as a CADENCE
// from 0.07% to 19.8% — second-likeliest ending in the whole family, off the
// back of a side note about a transition. The inner table moved 3.4% -> 8.4%,
// which is the intended size of a nudge.
//
// So `pairs` is adjacency and feeds `inner` only. Wrap evidence lives in
// `wraps`, is collected by its own probe on the cadence tab, and never arrives
// as a side effect of liking a transition. D49 already ruled that a loop's
// cadence lives at last->first rather than at an index; this is the same ruling
// applied to the ear.

/** 'minor|0>11' — root motion is family-scoped: 0->11 in minor is not the same
 *  move as 0->11 in major, and the corpus counts them separately too. */
export const pairKey = (family, from, to) => `${family ?? 'any'}|${from}>${to}`;
export const chordKey = (family, degree, quality) => `${family ?? 'any'}|${degree}:${quality ?? ''}`;

const asVote = (v) => (v === 'good' || v === true ? 'good' : v === 'bad' || v === false ? 'bad' : null);

/**
 * Every pair verdict that applies in `family`, as Map(toDegree -> {good, bad}).
 *
 * A verdict recorded against a specific family applies only there; one recorded
 * with family `any` applies everywhere. There is no backoff between families on
 * purpose — "this works in minor" is not evidence that it works in major, and
 * the whole point of this file is to stop averaging over things Ethan hears
 * separately.
 */
export function pairVotes(from, family, table = 'inner') {
  const bag = table === 'wrap' ? FACET_VERDICTS.wraps : FACET_VERDICTS.pairs;
  const out = new Map();
  for (const [key, rec] of Object.entries(bag ?? {})) {
    const vote = asVote(rec.verdict);
    if (!vote) continue;
    const [fam, motion] = key.split('|');
    if (fam !== 'any' && fam !== family) continue;
    const [f, t] = motion.split('>').map(Number);
    if (f !== from) continue;
    const cur = out.get(t) ?? { good: 0, bad: 0 };
    cur[vote] += rec.n ?? 1;
    out.set(t, cur);
  }
  return out;
}

/** every chord verdict that applies on `degree` in `family`, as Map(quality -> {good,bad}) */
export function chordVotes(degree, family) {
  const out = new Map();
  for (const [key, rec] of Object.entries(FACET_VERDICTS.chords ?? {})) {
    const vote = asVote(rec.verdict);
    if (!vote) continue;
    const [fam, rest] = key.split('|');
    if (fam !== 'any' && fam !== family) continue;
    const ix = rest.indexOf(':');
    if (Number(rest.slice(0, ix)) !== degree) continue;
    const q = rest.slice(ix + 1);
    const cur = out.get(q) ?? { good: 0, bad: 0 };
    cur[vote] += rec.n ?? 1;
    out.set(q, cur);
  }
  return out;
}

/**
 * Fold ear votes into a count row. Returns the row UNCHANGED when there is
 * nothing to say, so the no-verdicts case costs nothing and — more usefully —
 * so `ear: false` reproduces the pre-D53 model exactly for comparison.
 *
 * `keys` is the domain to spread a dislike over (degrees, or observed qualities).
 */
export function foldVotes(row, votes, keys) {
  if (!votes.size) return row;
  const out = { ...row };
  let spread = 0;
  for (const [k, v] of votes) {
    if (v.good) out[k] = (out[k] ?? 0) + EAR_COUNT * v.good;
    if (v.bad) spread += EAR_COUNT * v.bad;
  }
  if (spread) {
    // A dislike is not a veto — it is EAR_COUNT more observations of "from here,
    // something else happened", distributed over what the corpus already plays.
    // Proportional rather than uniform so a dislike cannot smuggle in a boost
    // for a destination nobody uses.
    const others = keys.filter((k) => (out[k] ?? 0) > 0 && !(votes.get(k)?.bad));
    const tot = others.reduce((a, k) => a + out[k], 0);
    if (tot > 0) for (const k of others) out[k] += spread * (out[k] / tot);
  }
  return out;
}

/** how much ear evidence exists, and of what — every consumer should be able to
 *  say whether it is acting on 2 clicks or 200 */
export function earStats() {
  // Two record shapes live in this file and both have to be countable: per-key
  // verdicts ({verdict, n}) for pairs/wraps/chords, and pre-tallied aggregates
  // ({good, bad}) for textures/cadences, which are sums over many clicks and
  // cannot be stored per key.
  const count = (bag) => {
    const rs = Object.values(bag ?? {});
    const good = rs.reduce((a, r) => a + (r.good ?? (asVote(r.verdict) === 'good' ? 1 : 0)), 0);
    const bad = rs.reduce((a, r) => a + (r.bad ?? (asVote(r.verdict) === 'bad' ? 1 : 0)), 0);
    const weight = (r) => (r.n != null ? r.n : Math.max(1, (r.good ?? 0) + (r.bad ?? 0)));
    return { n: rs.reduce((a, r) => a + weight(r), 0), good, bad };
  };
  return {
    pairs: count(FACET_VERDICTS.pairs),
    wraps: count(FACET_VERDICTS.wraps),
    chords: count(FACET_VERDICTS.chords),
    textures: count(FACET_VERDICTS.textures),
    cadences: count(FACET_VERDICTS.cadences),
    source: FACET_VERDICTS.source ?? 'unknown',
  };
}

export function explainEar() {
  const s = earStats();
  const total = s.pairs.n + s.wraps.n + s.chords.n + s.textures.n + s.cadences.n;
  if (!total) return ['no facet verdicts yet — run audition/facets.html'];
  const line = (name, c) => `  ${name.padEnd(9)} ${String(c.good).padStart(3)} good  ${String(c.bad).padStart(3)} bad`;
  return [
    `${total} facet votes (${s.source}) — each liked pair is worth ${EAR_COUNT} corpus observations`,
    line('pairs', s.pairs),
    line('wraps', s.wraps),
    line('chords', s.chords),
    line('textures', s.textures),
    line('cadences', s.cadences),
    total < 40 ? '  confidence: LOW — indicative only, and every vote is visible in the counts'
      : '  confidence: usable',
  ];
}

/** what the ear says about each texture, best first — for the arranger, once the
 *  matrix has been run. `share` is good/(good+bad) with a Laplace floor so one
 *  vote does not read as 100%. */
export function textureRanking() {
  const bag = FACET_VERDICTS.textures ?? {};
  return Object.entries(bag)
    .map(([id, r]) => ({
      id,
      good: r.good ?? 0,
      bad: r.bad ?? 0,
      share: ((r.good ?? 0) + 1) / ((r.good ?? 0) + (r.bad ?? 0) + 2),
    }))
    .sort((a, b) => b.share - a.share || b.good - a.good);
}
