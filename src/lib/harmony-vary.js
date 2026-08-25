// Exemplar-based harmony variation (D50).
//
// THE STRATEGY, AND WHY IT BEATS THE D49 SAMPLER. D49 composes a progression
// from counted transition statistics. That maximizes TYPICALITY, not quality:
// every move is locally likely and the whole can still add up to nothing, which
// is the classic failure of Markov music and is exactly what Ethan heard from
// the generated MIDI chord sets ("legal but didn't sound good"). Worse, the
// prior is fitted to what EXISTS in the corpus, not to what WORKS — 161 of the
// 421 entries are simply whatever repeated in an Undertale file. There is no
// quality signal anywhere in that data.
//
// So: start from a progression with outside evidence that it works, and change
// it with operations that are known to preserve what makes it work. Quality is
// INHERITED rather than synthesized. This is also what the atlas ruling already
// said — "an entry is an example of a family; the family is the unit of style" —
// and D49 drifted from it.
//
// THE HARD PART is that a harmonic edit is not small. One chord of a four-chord
// loop is 25% of the harmony. Hence harmony-ops.js: a closed set of typed
// substitutions, each declaring what it preserves, rather than a perturbation.
//
// D49 IS NOT WASTED — it becomes the verifier. After each operator the result is
// scored against the counted model, and the bar is set BY THE EXEMPLAR ITSELF:
// a variation may not be less idiomatic than the progression it came from. That
// is a non-arbitrary threshold, which a hand-picked constant would not be.

import { ALL_PROGRESSIONS, parseDegrees } from './progressions.js';
import { COVERAGE_FLOOR } from './taste.js';
import { OPS, OP_NAMES, ROTATE } from './harmony-ops.js';
import {
  cycleScore, fnv, mulberry32, weightedPick, toDegrees, toNumeral, thirdClass,
} from './harmony-prior.js';

// How many ranked-legal SITES the seeded pick draws from, once the operator is
// chosen. The operator is picked first and separately — see the two-stage note
// in varyProgression.
const TOPK = 5;
// How sharply `intensity` selects an operator, in audibility units. 0.35 means
// an operator half a step away from what was asked still gets real probability.
const OP_TEMP = 0.35;
// Applying the same operator twice, or editing a slot twice, is usually waste:
// the second edit overwrites the first. Discouraged, not forbidden.
const REPEAT_DISCOUNT = 0.35;
const RETOUCH_DISCOUNT = 0.2;
// A variation's worst transition may fall this far below the exemplar's worst
// before it is rejected (nats). Generous, because the exemplar's own worst move
// is often the interesting one and a substitution near it should not be barred.
const PLAUSIBILITY_SLACK = 1.2;
// The cadence is the one place a variation must not degrade at all, so it gets a
// tighter allowance than ordinary motion.
const CADENCE_SLACK = 0.7;
// The same bar for chord QUALITY: a colour-only operator moves no root, so
// without this the gate is blind to it entirely.
const QUALITY_SLACK = 1.0;

/**
 * Progressions with OUTSIDE evidence that they work — the only honest basis for
 * an exemplar pool, since nothing in the corpus records quality.
 *
 * Priority order:
 *  1. entries Ethan has ratified by ear (A6.1), via scripts/import-verdicts.mjs.
 *  2. the `unison-famous` pack, whose provenance IS commercial success — these
 *     are transcriptions of charting songs, so "known to be successful" is a
 *     property of the source rather than a taste claim of mine. Used alone
 *     while nothing is ratified, and as a supplement while the ear pool is thin.
 *
 * Returns { entries, basis, caveat } so a caller can report which it got.
 */
export function exemplarPool({ family = null, minCount = 20 } = {}) {
  // D51: a low-coverage entry is a TRANSCRIPTION failure, not a musical one,
  // and it turned out to be the single strongest predictor of a kill (0.84 for
  // killed entries against 0.95 for kept). An exemplar should be a correct
  // reading of its source before it can be a good progression.
  //
  // BUT THE EAR OUTRANKS THE PROXY. Coverage is a stand-in for "is this
  // transcription right", and Ethan listening to the card is the real test. Two
  // entries he KEPT sit below the floor (Gaster's Theme 0.83, Alphys 0.84); the
  // gate excluded them and that was the gate overruling the evidence it exists
  // to approximate. It now applies only to entries nobody has judged.
  const pick = (test) => Object.entries(ALL_PROGRESSIONS)
    .filter(([, e]) => test(e) && (!family || e.family === family)
      && (e.verdict != null || e.coverage == null || e.coverage >= COVERAGE_FLOOR));

  const ratified = pick((e) => e.ratified);
  const famous = pick((e) => e.pack === 'unison-famous'
    // the entries whose labeller agreed with nothing are not exemplars of
    // anything (D49's evidence gate — Rocket Man's every chord came out `-#5`)
    && !(e.match && e.match.chords > 0 && e.match.agree === 0));

  if (!ratified.length) {
    return {
      entries: famous,
      basis: 'the unison-famous pack (provenance: charting songs)',
      caveat: 'NO entry in the library is ratified yet — this pool stands in for '
        + 'Ethan\'s ear. Run scripts/import-verdicts.mjs on an audition page\'s '
        + 'exported JSON and this function returns those instead.',
    };
  }
  // Ratified entries are the real answer but there are few of them and they all
  // come from one idiom, so the famous pack SUPPLEMENTS rather than disappears
  // until the ear pool is broad enough to stand alone. Ratified entries come
  // first, so a caller taking the head of the list gets the ear.
  if (ratified.length >= minCount) {
    return { entries: ratified, basis: `${ratified.length} entries ratified by ear (A6.1)`, caveat: null };
  }
  const have = new Set(ratified.map(([n]) => n));
  return {
    entries: [...ratified, ...famous.filter(([n]) => !have.has(n))],
    basis: `${ratified.length} ratified by ear + ${famous.length} from the unison-famous pack`,
    caveat: `only ${ratified.length} entries are ratified (want ${minCount}+), and all of them `
      + 'are one idiom — the famous pack supplements until the ear pool is broad enough. '
      + 'Ratified entries are listed first.',
  };
}

/**
 * varyProgression(exemplar, opts) -> a progression entry with a lineage
 *
 *   exemplar   a library entry, or its name
 *   budget     how many operators to apply (default 2)
 *   intensity  0..1. Low prefers operators that change colour and metric
 *              placement (recolour, suspend, rotate); high prefers ones that
 *              change chords (third_sub, secondary dominants, tritone subs).
 *   allow      restrict to these operator names
 *   seed       any string; same request, same variation
 *
 * Returns an ordinary library entry (so renderProgression, the lint, the
 * arranger and the audition pages all work on it) plus `lineage`: the exemplar
 * it came from and every operator applied, with what each one preserved.
 */
export function varyProgression(exemplar, {
  budget = 2, intensity = 0.4, allow = null, seed = 'vary',
} = {}) {
  const src = typeof exemplar === 'string' ? ALL_PROGRESSIONS[exemplar] : exemplar;
  const srcName = typeof exemplar === 'string' ? exemplar
    : Object.keys(ALL_PROGRESSIONS).find((k) => ALL_PROGRESSIONS[k] === exemplar) ?? '(inline)';
  if (!src) throw new Error(`unknown exemplar "${exemplar}" — see exemplarPool()`);
  if (!Number.isInteger(budget) || budget < 1) throw new Error(`budget must be an integer >= 1 (got ${budget})`);

  const family = src.family === 'major' ? 'major' : src.family === 'minor' ? 'minor' : 'modal';
  const ctx = { family, style: null, home: 0 };
  const names = allow ? OP_NAMES.filter((n) => allow.includes(n)) : OP_NAMES;
  const wantRotate = !allow || allow.includes('rotate');

  const start = parseDegrees(src.degrees);
  const floor = cycleScore(start, ctx);
  const rand = mulberry32(fnv(`${srcName}|${budget}|${intensity}|${seed}`));

  let cycle = start;
  const lineage = [];
  const rejected = [];
  const usedOps = new Set();
  let touched = new Set();
  // Every cycle this variation has been through, so an operator cannot undo an
  // earlier one: a third_sub round-tripped Cm7 -> Eb -> Cm, spending the whole
  // budget to drop a seventh.
  const seenCycles = new Set([toDegrees(start)]);
  // `intensity` is a per-step target in the operators' audibility units, so a
  // budget of 3 at intensity 0.8 asks for three bold moves rather than for 2.4
  // units spread thin.
  const stepWant = intensity;

  for (let step = 0; step < budget; step++) {
    const cands = [];

    for (const name of names) {
      const op = OPS[name];
      for (const site of op.sites(cycle, ctx)) {
        const next = cycle.map((c, i) => (i === site.slot ? { ...c, ...site.to } : c));
        cands.push({ op: name, next, site, cost: op.cost, preserves: op.preserves });
      }
    }
    if (wantRotate) {
      for (const site of ROTATE.sites(cycle)) {
        cands.push({
          op: 'rotate', next: ROTATE.apply(cycle, site.by), site,
          cost: ROTATE.cost, preserves: ROTATE.preserves,
        });
      }
    }

    // HARD: the verification gate. A variation may not be less idiomatic than
    // the exemplar it came from — on root motion, on the cadence, OR on chord
    // quality — and may not undo itself.
    const legal = [];
    for (const c of cands) {
      const where = `${c.op}@${c.site.slot ?? `rot${c.site.by}`}`;
      if (seenCycles.has(toDegrees(c.next))) {
        rejected.push(`${where}: returns to a cycle this variation already passed through`);
        continue;
      }
      const s = cycleScore(c.next, ctx);
      if (s.worst < floor.worst - PLAUSIBILITY_SLACK) {
        rejected.push(`${where}: worst transition ${s.worst.toFixed(2)} vs exemplar ${floor.worst.toFixed(2)}`);
        continue;
      }
      if (s.cadence < floor.cadence - CADENCE_SLACK) {
        rejected.push(`${where}: cadence ${s.cadence.toFixed(2)} vs exemplar ${floor.cadence.toFixed(2)}`);
        continue;
      }
      if (s.worstQual < floor.worstQual - QUALITY_SLACK) {
        rejected.push(`${where}: chord quality ${s.worstQual.toFixed(2)} vs exemplar ${floor.worstQual.toFixed(2)}`);
        continue;
      }
      legal.push({ ...c, score: s });
    }
    if (!legal.length) break;

    // TWO-STAGE PICK, and the reason matters. Ranking every (operator, site)
    // pair in one flat pool makes an operator's chance proportional to how many
    // sites it happens to have — `recolour` offers a site on nearly every chord
    // and `tritone_sub` offers one only when a dominant is already resolving by
    // semitone, so a flat pool is a popularity contest between operators that
    // has nothing to do with what was asked for. First choose the OPERATOR from
    // `intensity`, then choose WHERE to apply it.
    const byOp = new Map();
    for (const c of legal) {
      if (!byOp.has(c.op)) byOp.set(c.op, []);
      byOp.get(c.op).push(c);
    }
    const opChoices = [...byOp.entries()].map(([op, sites]) => ({
      op,
      sites,
      weight: Math.exp(-Math.abs(sites[0].cost - stepWant) / OP_TEMP)
        * (usedOps.has(op) ? REPEAT_DISCOUNT : 1),
    }));
    const pickedOp = weightedPick(opChoices, (o) => o.weight, rand);

    // within the operator, prefer the site that leaves the result most idiomatic
    const sites = pickedOp.sites
      .map((c) => ({
        ...c,
        rank: (c.score.mean - floor.mean)
          + Math.log(touched.has(c.site.slot) ? RETOUCH_DISCOUNT : 1),
      }))
      .sort((a, b) => b.rank - a.rank)
      .slice(0, TOPK);
    const chosen = weightedPick(sites, (c) => Math.exp(2 * c.rank), rand);

    usedOps.add(chosen.op);
    if (chosen.op === 'rotate') {
      // every slot index now means a different chord, so nothing is "touched"
      touched = new Set();
    } else touched.add(chosen.site.slot);
    cycle = chosen.next;
    seenCycles.add(toDegrees(cycle));
    lineage.push({
      op: chosen.op,
      where: chosen.op === 'rotate' ? `by ${chosen.site.by}` : `slot ${chosen.site.slot}`,
      note: chosen.site.note,
      preserves: chosen.preserves,
      idiom: Number(chosen.score.mean.toFixed(3)),
      quality: Number(chosen.score.meanQual.toFixed(3)),
      cadence: Number(chosen.score.cadence.toFixed(3)),
    });
  }

  const degrees = toDegrees(cycle);
  const changed = degrees !== src.degrees;
  const final = cycleScore(cycle, ctx);

  return {
    family: src.family, pack: 'varied', role: 'harmony', style: src.style ?? 'universal',
    provenance: 'varied', source: `${srcName} + ${lineage.map((l) => l.op).join(' + ') || 'nothing'}`,
    ratified: false,
    song: src.song ?? null,
    numerals: cycle.map((c) => toNumeral(c.semis, c.quality)).join('-'),
    degrees,
    moods: src.moods ?? [],
    barsPerChord: 1, loopBars: cycle.length,
    needsEar: true,
    ownFigure: null,
    character: null,
    request: { exemplar: srcName, budget, intensity, allow, seed },
    // The whole point: what it came from, and what each edit guaranteed.
    lineage: {
      exemplar: srcName,
      exemplarDegrees: src.degrees,
      exemplarSong: src.song ?? null,
      ops: lineage,
      changed,
      // how the result compares to its own exemplar on the counted model
      idiom: { exemplar: Number(floor.mean.toFixed(3)), result: Number(final.mean.toFixed(3)) },
      quality: { exemplar: Number(floor.meanQual.toFixed(3)), result: Number(final.meanQual.toFixed(3)) },
      cadence: { exemplar: Number(floor.cadence.toFixed(3)), result: Number(final.cadence.toFixed(3)) },
      rejected: rejected.slice(0, 8),
    },
  };
}

/** a variation's lineage as readable lines (audition tooltips, debugging) */
export function explainVariation(entry) {
  const L = entry?.lineage;
  if (!L) return [];
  const out = [`from ${L.exemplarSong ?? L.exemplar}:  ${L.exemplarDegrees}`];
  for (const o of L.ops) {
    out.push(`  ${o.op.padEnd(18)} ${o.where.padEnd(9)} ${o.note}`);
    out.push(`  ${''.padEnd(18)} ${''.padEnd(9)} preserves ${o.preserves}`);
  }
  out.push(`idiom ${L.idiom.exemplar} -> ${L.idiom.result}   quality ${L.quality.exemplar} -> ${L.quality.result}   cadence ${L.cadence.exemplar} -> ${L.cadence.result}`);
  if (!L.changed) out.push('NO CHANGE — every operator was rejected by the verification gate');
  return out;
}

/**
 * A batch of variations across one exemplar, deduplicated. Useful for the
 * audition page (hear the foundation, then hear what it becomes) and for song
 * generation once the ear pass has run.
 */
export function variationsOf(exemplar, { count = 3, ...opts } = {}) {
  const seen = new Set();
  const out = [];
  for (let i = 0; out.length < count && i < count * 6; i++) {
    const v = varyProgression(exemplar, { ...opts, seed: `${opts.seed ?? 'v'}${i}` });
    if (!v.lineage.changed || seen.has(v.degrees)) continue;
    seen.add(v.degrees);
    out.push(v);
  }
  return out;
}
