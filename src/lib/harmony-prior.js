// The counted harmony prior, shared by the two things that need it (D49/D50):
// the from-scratch generator (harmony-gen.js) and the exemplar varier
// (harmony-vary.js). Extracted so there is exactly ONE opinion about how likely
// a chord move is — a varier that judged plausibility differently from the
// generator would be a second, invisible model.
//
// Everything here reads src/lib/harmony-model.js, which is raw counts. Smoothing
// and backoff live here so the evidence n stays visible in the data file.

import { HARMONY_MODEL } from './harmony-model.js';
import { pairVotes, chordVotes, foldVotes } from './facets.js';

// The observation count at which a table half-owns its own row. A style row with
// 8 observations of "what follows degree 5" is trusted half as much as the
// family row behind it; the leftover falls through to the whole corpus and
// finally to uniform, so no motion is ever impossible.
export const BACKOFF_C = 8;

export const DEGREES = Array.from({ length: 12 }, (_, i) => i);

const sumRow = (row) => Object.values(row).reduce((a, b) => a + b, 0);

/**
 * Interpolate count rows, most specific first, each taking n/(n+C) of what is
 * left, the remainder falling to a uniform floor over `keys`. One constant, no
 * magic, and an unseen move keeps a small non-zero probability rather than
 * being silently illegal.
 */
export function blend(rows, keys) {
  const p = new Map(keys.map((k) => [k, 0]));
  let rest = 1;
  for (const counts of rows) {
    const n = sumRow(counts);
    if (!n) continue;
    const w = rest * (n / (n + BACKOFF_C));
    for (const k of keys) p.set(k, p.get(k) + w * ((counts[k] ?? 0) / n));
    rest -= w;
  }
  for (const k of keys) p.set(k, p.get(k) + rest / keys.length);
  return p;
}

/** the style's own table for this family, or null — packs are family-split so a
 *  minor-key style prior cannot be outvoted by the pack's major-key songs */
function styleTable({ family, style }) {
  return style ? (HARMONY_MODEL.packs[style]?.[family] ?? null) : null;
}

/**
 * P(next root | from) under `table` ('inner' | 'wrap'), style -> family -> all.
 *
 * D53: ear votes are folded into the FAMILY row as pseudo-counts before the
 * blend, not applied to the result afterwards. That placement is the whole
 * design — a vote is evidence of the same kind as a corpus observation, so it
 * competes with the style row above it and gets diluted by the corpus row below
 * it exactly as a real observation would. Pass `ear: false` in ctx to reproduce
 * the pre-D53 model, which is how the A/B on the page is built.
 */
export function rootProbs(table, from, ctx) {
  const fam = HARMONY_MODEL.families[ctx.family] ?? HARMONY_MODEL.families.all;
  const sty = styleTable(ctx);
  const rows = [];
  if (sty) rows.push(sty[table][from] ?? {});
  const famRow = fam[table][from] ?? {};
  rows.push(ctx.ear === false ? famRow : foldVotes(famRow, pairVotes(from, ctx.family, table), DEGREES));
  rows.push(HARMONY_MODEL.families.all[table][from] ?? {});
  return blend(rows, DEGREES);
}

/** P(quality | degree), same backoff, over the qualities actually observed */
export function qualityProbs(degree, ctx) {
  const fam = HARMONY_MODEL.families[ctx.family] ?? HARMONY_MODEL.families.all;
  const sty = styleTable(ctx);
  const votes = ctx.ear === false ? new Map() : chordVotes(degree, ctx.family);
  const rows = [];
  if (sty) rows.push(sty.qual[degree] ?? {});
  rows.push(fam.qual[degree] ?? {}, HARMONY_MODEL.families.all.qual[degree] ?? {});
  // A liked quality the corpus has never put on this degree still has to be
  // reachable, so the ear's keys join the domain before the fold.
  const keys = [...new Set([...rows.flatMap((r) => Object.keys(r)), ...votes.keys()])];
  if (votes.size) rows[sty ? 1 : 0] = foldVotes(rows[sty ? 1 : 0], votes, keys);
  // A degree nobody ever played (degree 6 has only 20 observations corpus-wide)
  // still needs a quality: fall back to the family's tonic triad.
  if (!keys.length) return new Map([[ctx.family === 'major' ? '' : 'm', 1]]);
  return blend(rows, keys);
}

/**
 * Has this degree ever been played in this family? A data legality check, and
 * the one hard gate every operator passes through.
 *
 * D53: the EAR counts as attestation. If Ethan has vouched for a chord on a
 * degree the corpus never used, refusing to let an operator reach it would be
 * the model telling him he did not hear what he heard — which is the exact
 * failure this whole layer exists to prevent.
 */
export function degreeAttested(degree, ctx) {
  const fam = HARMONY_MODEL.families[ctx.family] ?? HARMONY_MODEL.families.all;
  if (fam.qual[degree] && sumRow(fam.qual[degree]) > 0) return true;
  if (ctx.ear === false) return false;
  return [...chordVotes(degree, ctx.family).values()].some((v) => v.good > 0);
}

/**
 * Which third a quality sounds: 'min', 'maj', or 'none' when it is suspended or
 * omitted. This is the one genuinely hard harmonic rule the corpus supports:
 * across 1513 (entry, degree) pairs with a sounding third, only 2.84% flip
 * major<->minor on the same degree inside one loop — and every one of those 43
 * is a named device (IV->iv borrowed subdominant, v->V raised leading tone,
 * I->i parallel mixture), not an accident.
 */
export function thirdClass(quality) {
  const q = String(quality).replace(/^:/, '');
  if (q === '5' || q === '2' || /sus/.test(q)) return 'none';
  if (/^(m(?!aj)|o)/.test(q)) return 'min';
  return 'maj';
}

/** seeded choice: fnv-1a, the same hash arrange.js and bind.js use */
export function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** seeded weighted choice — one rand() draw, so the stream stays reproducible */
export function weightedPick(items, weightOf, rand) {
  const w = items.map(weightOf);
  const total = w.reduce((a, b) => a + b, 0);
  let x = rand() * total;
  for (let i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; }
  return items[items.length - 1];
}

const NUMERAL = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];

/** 9 + 'm7' -> 'vim7'; display only, the degrees string is the data */
export function toNumeral(degree, quality) {
  const q = String(quality).replace(/^:/, '');
  const minorish = /^(m(?!aj)|o)/.test(q);
  const base = minorish ? NUMERAL[degree].replace(/[IV]+/, (s) => s.toLowerCase()) : NUMERAL[degree];
  return base + q;
}

/** [{semis, quality}] -> the `degrees` grammar string */
export function toDegrees(cycle) {
  return cycle.map((c) => `${c.semis}${c.spell ?? ''}${c.quality ? `:${c.quality}` : ''}`).join(' ');
}

/**
 * How idiomatic is this cycle under the counted model? Returns the per-
 * transition log-probabilities, the cadence (last -> first, the WRAP, which is
 * where a loop's cadence actually lives — see D49), and the QUALITY fit.
 *
 * The quality term is not decoration. A substitution that changes only a
 * chord's colour — `mixture`, `recolour`, `suspend` — moves no root at all, so
 * a score built from root motion alone cannot see it, and an operator could put
 * a quality on a degree the family essentially never uses while the verifier
 * reported no change whatsoever. Found exactly that way: `mixture` turned bIII
 * minor in a minor key and the gate waved it through.
 */
export function cycleScore(cycle, ctx) {
  const rs = cycle.map((c) => c.semis);
  const inner = [];
  for (let i = 0; i < rs.length - 1; i++) inner.push(Math.log(rootProbs('inner', rs[i], ctx).get(rs[i + 1])));
  const cadence = Math.log(rootProbs('wrap', rs.at(-1), ctx).get(rs[0]));
  const qual = cycle.map((c) => Math.log(qualityProbs(c.semis, ctx).get(c.quality) ?? 1e-6));
  const mean = inner.length ? inner.reduce((a, b) => a + b, 0) / inner.length : 0;
  return {
    inner,
    cadence,
    qual,
    worst: inner.length ? Math.min(...inner) : 0,
    worstQual: qual.length ? Math.min(...qual) : 0,
    mean,
    meanQual: qual.length ? qual.reduce((a, b) => a + b, 0) / qual.length : 0,
  };
}
