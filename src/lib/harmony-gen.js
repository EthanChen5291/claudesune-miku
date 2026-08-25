// Harmony GENERATION (D49): compose a progression instead of replaying one.
//
// The output is an ordinary library entry — the same `degrees` grammar D28
// settled on — so everything downstream (renderProgression, the voicing lint,
// the arranger, the audition pages) works on a generated progression without
// knowing it was generated. What is added is `derivation`: every slot records
// the candidates it ranked and why the winner won, because the point of
// composing rather than retrieving is that the result can later be EDITED
// (phase 3), and an edit needs to know what the choice was.
//
// THE PROCEDURE IS D32'S, unchanged: hard filter -> deterministic cost ranking
// -> seeded choice among the ranked-legal. Nothing here rolls dice per chord.
//
// WHAT IS A LAW AND WHAT IS A COST. Candidate hard rules were tested against
// all 421 corpus entries before any of them was written down. Almost none
// survived: "starts on a tonic-function chord" holds for 55%, "ends on one" for
// 33%, "no D->S retrogression" for 94%, "vii resolves to tonic" for 48% of 29
// cases. A rule the corpus breaks a hundred times is not a law, so the only
// hard filters here are mechanical (a quality must have a voicing shape, a
// degree must be in range) plus whatever the CALLER declares. Every functional
// preference is a cost, and its price is counted from the corpus rather than
// asserted — see scripts/build-harmony-model.mjs.
//
// TWO STRUCTURAL FACTS the model exploits, both measured:
//  - A loop's cadence lives at its WRAP, not at its last array index. Corpus
//    loops are rotated arbitrarily by the extractor, but the transition from
//    last chord back to first lands on the tonic 41/47/68% of the time
//    (major/minor/modal) against 18-22% inside the loop, and its top motions
//    are V-I, IV-I, bVII-i, bII-I. So the final slot is scored against `wrap`.
//  - Long loops are PERIODIC, not long chains. Of the 54 eight-chord entries,
//    37 have halves differing in at most two of four chords (11 are exact
//    repeats). Generating 8 as "a 4-cell plus a varied answer" reproduces the
//    corpus's distinct-degree ratio (0.57 at length 8, 0.88 at length 4) as a
//    consequence of the structure instead of as a tuned penalty.

import { VOICINGS } from './voicings.js';
import { ALL_PROGRESSIONS, parseDegrees } from './progressions.js';
import {
  DEGREES, rootProbs, qualityProbs, thirdClass, fnv, mulberry32, weightedPick, toNumeral,
} from './harmony-prior.js';

export { thirdClass, toNumeral };

// --- tuning -----------------------------------------------------------------
// How hard the loop's return-to-home is weighted on the final slot, relative to
// ordinary inner motion. 1.0 = the cadence matters exactly as much as the step.
const CADENCE_W = 1.0;
// Log-space nudge toward plain triads (colour 0) or extensions (colour 1).
const COLOUR_W = 1.4;
// How many ranked-legal candidates the seeded pick draws from. Because scores
// are log-probabilities and the pick is weighted by exp(score), this is sampling
// from the TRUE distribution truncated to its top K, not a re-weighting.
// Swept 3/4/5/6/8 over 500 draws (distinct-degree ratio at length 4, share of
// cycles the corpus does not already contain, distinct qualities produced):
//   3 -> 0.768  34%   9      6 -> 0.803  51%  19
//   4 -> 0.802  41%  14      8 -> 0.826  53%  25
//   5 -> 0.803  47%  14
// K buys novelty, barely moves the repetition ratio, and past 5 buys it by
// reaching into the rare-quality tail (7alt, 7b13, 13sus) — which is a worse
// trade than staying slightly more repetitive than the corpus's 0.878.
const TOPK = 5;

/** ireal qualities that are bare triads — the colour knob's low end */
const TRIADS = new Set(['', 'm', 'sus', '2', '5', 'o', 'aug']);

/** Declared function classes. Used ONLY when a caller asks for a cadence type;
 *  never as a filter on ordinary motion, because the corpus does not obey one. */
const FUNCTION = {
  major: { 0: 'T', 3: 'T', 4: 'T', 9: 'T', 1: 'S', 2: 'S', 5: 'S', 8: 'S', 10: 'S', 6: 'D', 7: 'D', 11: 'D' },
  minor: { 0: 'T', 3: 'T', 4: 'T', 1: 'S', 2: 'S', 5: 'S', 8: 'S', 9: 'S', 10: 'S', 6: 'D', 7: 'D', 11: 'D' },
};
FUNCTION.modal = FUNCTION.minor;

/** cadence name -> the function class its final chord must belong to */
const CADENCE_FUNCTION = { authentic: 'D', plagal: 'S', deceptive: 'D', modal: 'S' };


// --- hard filters ------------------------------------------------------------

/** the qualities a voicing shape can actually play; null shape = no restriction */
function playableQualities(shape) {
  if (!shape) return null;
  const shapes = VOICINGS[shape]?.shapes;
  if (!shapes) throw new Error(`unknown voicing shape "${shape}" (have: ${Object.keys(VOICINGS).join(', ')})`);
  return new Set(Object.keys(shapes));
}

// --- anti-copy ---------------------------------------------------------------

let FINGERPRINTS = null;
/**
 * Every corpus progression as its rotation-invariant root cycle, so a generated
 * cycle can be recognized as one the corpus already contains. Rotation matters:
 * the extractor cut these loops at arbitrary points, so `5 0 7 9` and
 * `0 7 9 5` are the same progression and a comparison by index would miss it.
 */
export function corpusFingerprints() {
  if (FINGERPRINTS) return FINGERPRINTS;
  FINGERPRINTS = new Map();
  for (const [name, e] of Object.entries(ALL_PROGRESSIONS)) {
    const rs = parseDegrees(e.degrees).map((t) => t.semis);
    const fp = canonicalCycle(rs);
    if (!FINGERPRINTS.has(fp)) FINGERPRINTS.set(fp, []);
    FINGERPRINTS.get(fp).push(name);
  }
  return FINGERPRINTS;
}

/** the lexicographically smallest rotation — one string per cycle */
export function canonicalCycle(roots) {
  let best = null;
  for (let r = 0; r < roots.length; r++) {
    const s = [...roots.slice(r), ...roots.slice(0, r)].join(',');
    if (best === null || s < best) best = s;
  }
  return best ?? '';
}

// --- generation --------------------------------------------------------------

/**
 * generateProgression({ family, length, ... }) -> a progression entry
 *
 *   family   'major' | 'minor' | 'modal'            which counted prior to use
 *   length   how many chords in the cycle           (>= 2)
 *   style    'undertale' | 'unison' | 'ldrolez'     mixes that pack's own table in
 *   home     tonic degree, default 0                the chord the cycle returns to
 *   shape    a src/lib/voicings.js shape name       HARD: every quality must be playable
 *   cadence  'authentic'|'plagal'|'deceptive'|'modal'|null
 *            HARD when given: the final chord must be of that function class.
 *            null lets the counted `wrap` table decide, which is the default
 *            because the corpus's own cadences are what we want to sound like.
 *   colour   0..1, plain triads .. extensions       biases quality choice only
 *   mixture  allow a degree's third to flip inside the cycle (default false —
 *            the corpus does it 2.84% of the time and only as a named device)
 *   bars     total bars the cycle spans (default = length, i.e. a chord a bar)
 *   seed     any string; the same seed always yields the same progression
 *
 * Returns an entry with `provenance: 'generated'`, `ratified: false` and
 * `needsEar: true` — A6.1 applies to machine output exactly as it applies to an
 * import. Nothing here has been heard.
 */
export function generateProgression({
  family = 'major', length = 4, style = null, home = 0, shape = null,
  cadence = null, colour = 0.35, mixture = false, bars = null, seed = 'gen',
} = {}) {
  if (!Number.isInteger(length) || length < 2) throw new Error(`length must be an integer >= 2 (got ${length})`);
  if (home < 0 || home > 11) throw new Error(`home must be 0-11 semitones above the tonic (got ${home})`);
  if (cadence && !(cadence in CADENCE_FUNCTION)) {
    throw new Error(`unknown cadence "${cadence}" (have: ${Object.keys(CADENCE_FUNCTION).join(', ')})`);
  }
  const ctx = { family, style };
  const playable = playableQualities(shape);
  // Two independent streams. Roots are drawn first and must not shift when a
  // quality-side knob moves, or "the same progression, richer chords" is
  // impossible to ask for — so `colour` and `mixture` are seeded into the
  // quality stream only.
  const randRoot = mulberry32(fnv(`roots|${family}|${style}|${length}|${home}|${cadence}|${seed}`));
  const randQual = mulberry32(fnv(`quals|${family}|${style}|${length}|${home}|${colour}|${mixture}|${seed}`));
  const rand = randRoot;
  const derivation = [];

  // --- roots -----------------------------------------------------------------
  // Length > 4 and even is generated as a cell plus an answer, because that is
  // what the corpus does (see the header). Everything else is a direct chain.
  const periodic = length > 4 && length % 2 === 0;
  const cellLen = periodic ? length / 2 : length;

  const cell = growCell(cellLen, { ctx, home, cadence, rand, derivation, tag: periodic ? 'cell' : 'chain' });
  let roots = cell;
  if (periodic) {
    const answer = varyCell(cell, { ctx, home, cadence, rand, derivation });
    roots = [...cell, ...answer];
  }

  // --- qualities -------------------------------------------------------------
  // Slot order matters: the FIRST time a degree appears it fixes that degree's
  // third for the rest of the cycle, so slot 0 (home) establishes the mode.
  // The home chord's third IS the family — `family: 'major'` with a minor tonic
  // is not a mixture, it is a mislabelled progression — so it is pinned before
  // anything is chosen rather than left to a 4%-probability tail.
  const thirds = new Map();
  if (family === 'major') thirds.set(home, 'maj');
  else if (family === 'minor') thirds.set(home, 'min');
  // `mixture` never applies to slot 0, and slot 0 must SOUND its third (a cycle
  // whose tonic is only ever a suspension never establishes a mode at all):
  // the cycle commits to a key before it is allowed to borrow against it.
  const qualities = roots.map((d, i) => pickQuality(d, i, {
    ctx, playable, colour, thirds, derivation,
    mixture: mixture && i > 0, needsThird: i === 0, rand: randQual,
  }));

  // --- the entry -------------------------------------------------------------
  const degrees = roots.map((d, i) => `${d}${qualities[i]}`).join(' ');
  const fp = canonicalCycle(roots);
  const matches = corpusFingerprints().get(fp) ?? [];
  const perChord = (bars ?? length) / length;

  return {
    family, pack: 'generated', role: 'harmony', style: style ?? 'universal',
    provenance: 'generated', source: 'src/lib/harmony-gen.js', ratified: false,
    numerals: roots.map((d, i) => toNumeral(d, qualities[i])).join('-'),
    degrees,
    moods: [],
    barsPerChord: perChord, loopBars: bars ?? length,
    needsEar: true,
    ownFigure: null,
    character: null,
    // What was asked for, so a later edit can re-generate under a changed brief.
    request: { family, length, style, home, shape, cadence, colour, mixture, bars, seed },
    // Whether this cycle already exists in the corpus, up to rotation. Reported,
    // NOT forbidden: `I-V-vi-IV` is the vernacular, and refusing to compose it
    // would be a worse failure than composing it. A caller who wants novelty
    // filters on this field.
    novel: matches.length === 0,
    matches,
    derivation,
  };
}

/** the whole cycle as one chain; slot 0 is home, the last slot cadences back */
function growCell(n, { ctx, home, cadence, rand, derivation, tag }) {
  const roots = [home];
  derivation.push({ slot: 0, kind: tag, chosen: home, why: 'home (the chord the cycle returns to)', candidates: [] });
  for (let i = 1; i < n; i++) {
    const last = i === n - 1;
    roots.push(pickRoot(roots[i - 1], { ctx, home, last, cadence, rand, derivation, slot: i, kind: tag }));
  }
  return roots;
}

/**
 * The answer half: the cell again with a seeded number of slots re-chosen,
 * drawn from the corpus's own distribution of how much an eight-chord loop's
 * second half differs from its first (exact 20%, one changed 22%, two 26%,
 * unrelated 31% — measured over the 54 length-8 entries). Changes are taken
 * from the END, which is the shape those entries overwhelmingly have: the
 * answer restates and then goes somewhere else.
 */
function varyCell(cell, { ctx, home, cadence, rand, derivation }) {
  const r = rand();
  const changes = r < 0.20 ? 0 : r < 0.42 ? 1 : r < 0.68 ? 2 : cell.length;
  const answer = [...cell];
  const from = Math.max(1, cell.length - changes);
  // One derivation record per CHORD, restatements included — the edit phase
  // needs to know that a slot was a restatement just as much as it needs to
  // know why a re-chosen slot went where it did.
  for (let i = 0; i < from; i++) {
    derivation.push({
      slot: cell.length + i, kind: 'restate', chosen: answer[i],
      why: `answer restates cell slot ${i}`, candidates: [],
    });
  }
  for (let i = from; i < cell.length; i++) {
    const last = i === cell.length - 1;
    answer[i] = pickRoot(answer[i - 1], {
      ctx, home, last, cadence, rand, derivation, slot: cell.length + i, kind: 'answer',
    });
  }
  return answer;
}

/** one root: hard filter, cost rank, seeded pick from the top K */
function pickRoot(prev, { ctx, home, last, cadence, rand, derivation, slot, kind }) {
  const inner = rootProbs('inner', prev, ctx);
  const fn = FUNCTION[ctx.family] ?? FUNCTION.major;
  const wantFn = last && cadence ? CADENCE_FUNCTION[cadence] : null;

  const scored = [];
  for (const d of DEGREES) {
    if (wantFn && fn[d] !== wantFn) continue;                 // HARD (caller-declared)
    let score = Math.log(inner.get(d));
    const parts = { inner: score };
    if (last) {
      // the cadence: how often does a loop go from d back to home?
      const back = rootProbs('wrap', d, ctx).get(home);
      parts.wrap = CADENCE_W * Math.log(back);
      score += parts.wrap;
    }
    scored.push({ degree: d, score, parts });
  }
  if (!scored.length) throw new Error(`no legal root for a "${cadence}" cadence in ${ctx.family}`);
  scored.sort((a, b) => b.score - a.score);

  const shortlist = scored.slice(0, TOPK);
  const chosen = weightedPick(shortlist, (c) => Math.exp(c.score), rand);
  derivation.push({
    slot, kind, chosen: chosen.degree,
    why: last
      ? `cadence back to ${home}: P(inner|${prev})=${Math.exp(chosen.parts.inner).toFixed(3)}, P(wrap->${home})=${Math.exp(chosen.parts.wrap / CADENCE_W).toFixed(3)}`
      : `P(${chosen.degree}|${prev})=${Math.exp(chosen.parts.inner).toFixed(3)}`,
    candidates: shortlist.map((c) => ({ degree: c.degree, score: Number(c.score.toFixed(3)) })),
  });
  return chosen.degree;
}

/** one quality: playable-shape and fixed-third hard filters, prior, colour nudge */
function pickQuality(degree, slot, { ctx, playable, colour, mixture, needsThird, thirds, rand, derivation }) {
  const probs = qualityProbs(degree, ctx);
  const fixed = thirds.get(degree) ?? null;
  const scored = [];
  for (const [q, p] of probs) {
    if (playable && !playable.has(q)) continue;               // HARD (D28's lint, at generation)
    const t = thirdClass(q);
    if (needsThird && t === 'none') continue;                 // HARD: the home chord states the mode
    // HARD unless the caller allowed mixture: a degree keeps its third. 'none'
    // (sus/2/5) never fixes or violates one — a suspension is not a mode change.
    if (!mixture && fixed && t !== 'none' && t !== fixed) continue;
    const nudge = COLOUR_W * (TRIADS.has(q) ? 1 - colour : colour);
    scored.push({ quality: q, score: Math.log(p) + nudge, p, third: t });
  }
  if (!scored.length) {
    throw new Error(`no quality on degree ${degree} is both playable in the requested voicing and compatible with that degree's ${fixed} third — widen the shape, or pass mixture: true`);
  }
  scored.sort((a, b) => b.score - a.score);
  const shortlist = scored.slice(0, TOPK);
  const chosen = weightedPick(shortlist, (c) => Math.exp(c.score), rand);
  if (chosen.third !== 'none' && !thirds.has(degree)) thirds.set(degree, chosen.third);
  derivation.push({
    slot, kind: 'quality', chosen: chosen.quality || 'maj',
    why: `P(${chosen.quality || 'maj'}|deg ${degree})=${chosen.p.toFixed(3)}, colour ${colour}`
      + (fixed ? `, third pinned ${fixed}` : ''),
    candidates: shortlist.map((c) => ({ quality: c.quality || 'maj', score: Number(c.score.toFixed(3)) })),
  });
  return chosen.quality ? `:${chosen.quality}` : '';
}

/** a generated entry's derivation as readable lines (audition tooltips, debugging) */
export function explainProgression(entry) {
  if (!entry?.derivation) return [];
  return entry.derivation.map((d) => {
    const cands = d.candidates.length
      ? `   [${d.candidates.map((c) => `${c.degree ?? c.quality} ${c.score}`).join(' | ')}]`
      : '';
    return `${String(d.slot).padStart(2)} ${d.kind.padEnd(8)} ${String(d.chosen ?? '—').padEnd(5)} ${d.why}${cands}`;
  });
}
