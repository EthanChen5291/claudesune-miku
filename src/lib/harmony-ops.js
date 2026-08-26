// Harmony substitution operators (D50): the closed set of edits that are known
// to preserve what made a progression work.
//
// WHY A CLOSED TYPED SET AND NOT "change a chord a bit". Ethan's brief was to
// take progressions known to be successful and vary them. The trap in that plan
// is that a harmonic edit is not small: changing one chord of a four-chord loop
// is 25% of the harmony, and if it lands on the cadence it destroys the exact
// thing that made the loop work. So a variation here is never a perturbation —
// it is one of eight operations that music theory guarantees keeps the chord's
// FUNCTION while changing its colour, and every one declares what it preserves.
//
// This is the same shape as D32's octave-displacement ruling (a closed operator
// set over the existing representation, not an enumerated library of results)
// and the same shape as the atlas anti-copy-paste ruling: an exemplar is not the
// answer, it is the thing the declared operators are applied to.
//
// Each operator is a function `sites(cycle, ctx) -> [{ slot, to, note }]`
// listing every legal application. `cycle` is [{semis, spell, quality}] as
// parseDegrees returns; `to` is the replacement chord for that slot. Legality is
// checked against the counted corpus (`degreeAttested`), not asserted — an
// operator may not invent a degree the family has never played.
//
// `cost` is a declared AUDIBILITY ladder — how much this move changes what a
// listener hears, from 0 (barely) to 1 (unmistakable) — not how clever it is:
//   recolour .15  suspend .30  cadential_sus .35  rotate .45  third_sub .50
//   mixture .55  make_ii_V .70  secondary_dominant .80  tritone_sub 1.0
// The varier's `intensity` knob is expressed in these units, so asking for a
// gentle variation and asking for a bold one reach for different operators.

import { degreeAttested, qualityProbs, thirdClass } from './harmony-prior.js';

const mod12 = (n) => ((n % 12) + 12) % 12;

/** the third each slot already pins, so an operator cannot break D49's rule */
export function pinnedThirds(cycle, skipSlot = -1) {
  const t = new Map();
  cycle.forEach((c, i) => {
    if (i === skipSlot) return;
    const k = thirdClass(c.quality);
    if (k !== 'none' && !t.has(c.semis)) t.set(c.semis, k);
  });
  return t;
}

/** would putting `to` at `slot` contradict a third already pinned elsewhere? */
function thirdConflicts(cycle, slot, to) {
  const k = thirdClass(to.quality);
  if (k === 'none') return false;
  const pinned = pinnedThirds(cycle, slot).get(to.semis);
  return Boolean(pinned && pinned !== k);
}

/**
 * A replacement is legal if the family has played that degree, the third holds,
 * and it does not COLLAPSE INTO A NEIGHBOUR. That last one is not fussiness: a
 * third_sub turned Ab into its relative minor Cm in a cycle whose tonic was
 * already Cm, and the loop came out `Cm Cm Eb Bb`. The counted model cannot
 * catch it — the corpus does repeat chords, so P(0->0) is perfectly ordinary —
 * but a substitution whose result is its own neighbour has substituted nothing.
 * Only newly-introduced duplicates are barred; a cycle that already repeated a
 * chord there keeps the right to.
 *
 * `opts.resolvesInto` names ONE neighbour the duplicate is allowed against: the
 * chord a suspension exists to resolve into. `Cmsus -> Cm` duplicates a
 * neighbour by design, and calling that a collapse would ban the single most
 * common cadence in tonal music.
 *
 * The exemption is deliberately for that one index and not for the move as a
 * whole. Waving the guard entirely let cadential_sus turn `... bVII I7 bVII |`
 * into `... I7 Isus I7 |`, parking the harmony on one root for three slots: the
 * resolution ahead of the sus was the device, the duplicate BEHIND it was still
 * a collapse. Caught by the D50 adjacency test, which is why that test predates
 * this operator and outranks it.
 */
function legal(cycle, slot, to, ctx, opts = {}) {
  if (!degreeAttested(to.semis, ctx)) return false;
  if (to.semis === cycle[slot].semis && to.quality === cycle[slot].quality) return false;
  if (thirdConflicts(cycle, slot, to)) return false;
  const n = cycle.length;
  // A SUSPENSION MUST RESOLVE, and operators compose, so this cannot be checked
  // where the sus is created — it has to hold after every later edit too.
  // `cadential_sus` put a sus at the wrap resolving into the tonic, and a plain
  // `suspend` then suspended the tonic, leaving `Csus | Csus` across the seam:
  // both sites were individually legal and the pair resolves nothing.
  if (thirdClass(to.quality) === 'none') {
    for (const j of [(slot - 1 + n) % n, (slot + 1) % n]) {
      if (j === slot) continue;
      if (cycle[j].semis === to.semis && thirdClass(cycle[j].quality) === 'none') return false;
    }
  }
  for (const j of [(slot - 1 + n) % n, (slot + 1) % n]) {
    if (j === slot || j === opts.resolvesInto) continue;
    if (to.semis === cycle[j].semis && cycle[slot].semis !== cycle[j].semis) return false;
  }
  return true;
}

const push = (out, cycle, ctx, slot, to, note, opts = {}) => {
  if (legal(cycle, slot, to, ctx, opts)) out.push({ slot, to: { spell: null, ...to }, note });
};

// ---------------------------------------------------------------------------
// The operators
// ---------------------------------------------------------------------------

export const OPS = {
  /**
   * Swap a chord for the diatonic triad a third away that shares two of its
   * three tones. THE classic substitution: C -> Am or Em, Cm -> Eb or Ab.
   * Preserves: two of three pitches, and therefore the harmonic function.
   */
  third_sub: {
    blurb: 'chord -> its third-relative (shares two tones, same function)',
    preserves: 'two of three chord tones, and the function',
    cost: 0.5,
    sites(cycle, ctx) {
      const out = [];
      cycle.forEach((c, i) => {
        const k = thirdClass(c.quality);
        if (k === 'maj') {
          push(out, cycle, ctx, i, { semis: mod12(c.semis + 9), quality: 'm' }, `${c.semis} -> its relative minor`);
          push(out, cycle, ctx, i, { semis: mod12(c.semis + 4), quality: 'm' }, `${c.semis} -> its mediant minor`);
        } else if (k === 'min') {
          push(out, cycle, ctx, i, { semis: mod12(c.semis + 3), quality: '' }, `${c.semis} -> its relative major`);
          push(out, cycle, ctx, i, { semis: mod12(c.semis + 8), quality: '' }, `${c.semis} -> its submediant major`);
        }
      });
      return out;
    },
  },

  /**
   * Borrow the parallel third: IV -> iv, v -> V, I -> i. The three devices that
   * account for every within-loop third flip in the corpus (D49). Never on the
   * home chord — a loop states its mode before it borrows against it.
   * Preserves: the root, so the bass line and the root motion are untouched.
   */
  mixture: {
    blurb: 'borrow the parallel third (IV->iv, v->V)',
    preserves: 'the root and the whole root-motion shape',
    cost: 0.55,
    sites(cycle, ctx) {
      const out = [];
      cycle.forEach((c, i) => {
        if (c.semis === (ctx.home ?? 0)) return;
        const k = thirdClass(c.quality);
        if (k === 'maj') push(out, cycle, ctx, i, { semis: c.semis, quality: 'm' }, `${c.semis} borrowed minor`);
        else if (k === 'min') push(out, cycle, ctx, i, { semis: c.semis, quality: '' }, `${c.semis} raised to major`);
      });
      return out;
    },
  },

  /**
   * Make a slot the dominant seventh OF THE CHORD THAT FOLLOWS IT. Adds pull
   * without changing where the progression goes.
   * Preserves: the target chord and everything after it.
   */
  secondary_dominant: {
    blurb: 'slot -> V7 of the next chord',
    preserves: 'the target chord and the rest of the cycle',
    cost: 0.8,
    sites(cycle, ctx) {
      const out = [];
      for (let i = 0; i < cycle.length; i++) {
        const next = cycle[(i + 1) % cycle.length];
        if (next.semis === cycle[i].semis) continue;
        const root = mod12(next.semis + 7);
        if (root === next.semis) continue;
        push(out, cycle, ctx, i, { semis: root, quality: '7' }, `V7 of ${next.semis}`);
      }
      return out;
    },
  },

  /**
   * Replace a dominant seventh with the one a tritone away. Both share the
   * tritone that does the resolving, so the pull is identical while the bass
   * walks down a semitone instead of a fifth.
   * Preserves: the tritone, and therefore the resolution.
   */
  tritone_sub: {
    blurb: 'V7 -> bII7 of the same target (same tritone, chromatic bass)',
    preserves: 'the tritone and the resolution',
    cost: 1.0,
    sites(cycle, ctx) {
      const out = [];
      for (let i = 0; i < cycle.length; i++) {
        if (cycle[i].quality !== '7') continue;
        const next = cycle[(i + 1) % cycle.length];
        const sub = mod12(cycle[i].semis + 6);
        // it must still resolve DOWN A SEMITONE into what follows, or it is not
        // a substitution, just a different chord
        if (mod12(sub - 1) !== next.semis) continue;
        push(out, cycle, ctx, i, { semis: sub, quality: '7' }, `tritone sub into ${next.semis}`);
      }
      return out;
    },
  },

  /**
   * Turn the chord before a dominant into that dominant's ii. Builds the single
   * most idiomatic approach in tonal music out of material already there.
   * Preserves: the dominant and its resolution.
   */
  make_ii_V: {
    blurb: 'the chord before a dominant becomes its iim7',
    preserves: 'the dominant and what it resolves to',
    cost: 0.7,
    sites(cycle, ctx) {
      const out = [];
      for (let i = 0; i < cycle.length; i++) {
        const dom = cycle[(i + 1) % cycle.length];
        if (dom.quality !== '7' && !(dom.semis === mod12((ctx.home ?? 0) + 7) && thirdClass(dom.quality) === 'maj')) continue;
        push(out, cycle, ctx, i, { semis: mod12(dom.semis + 7), quality: 'm7' }, `ii of ${dom.semis}`);
      }
      return out;
    },
  },

  /**
   * Suspend the third. Costs nothing harmonically — the chord keeps its root
   * and its place — and buys a lot of motion when it resolves into the next.
   * Preserves: the root, the function, and every third pinned in the cycle
   * (a suspension is not a mode change; see thirdClass).
   */
  suspend: {
    blurb: 'triad -> sus (root and function untouched)',
    preserves: 'the root, the function, and every pinned third',
    cost: 0.3,
    sites(cycle, ctx) {
      const out = [];
      cycle.forEach((c, i) => {
        if (thirdClass(c.quality) === 'none') return;
        push(out, cycle, ctx, i, { semis: c.semis, quality: 'sus' }, `${c.semis} suspended`);
      });
      return out;
    },
  },

  /**
   * The suspension AT THE PLACE IT BELONGS: immediately before the chord it
   * resolves into, at the end of the loop.
   *
   * WHY THIS IS A SEPARATE OPERATOR FROM `suspend`. Ethan, 2026-08-24: "the C
   * sus followed by the resolved version of it could also be good as a resolver
   * last 2/4 measures resolving chords perhaps as it's usually done in the music
   * industry." `suspend` treats every slot as equally suspendable, which is how
   * you get a sus floating in the middle of a loop doing nothing — a suspension
   * is not a colour, it is a delayed arrival, and it only means anything when
   * the arrival follows it. So this operator does not choose a slot from the
   * whole cycle; it chooses one of the two positions where a resolution can
   * actually land.
   *
   *   wrap        the LAST chord becomes a sus on the FIRST chord's root, so the
   *               loop seam is Xsus -> X. D49 established that a loop's cadence
   *               lives at last->first, not at index n-1, so this is the real
   *               cadential 6-4 for a cycle.
   *   penultimate slot n-2 becomes a sus on slot n-1's root: `... Ysus Y |`.
   *               The literal "last two measures" reading.
   *
   * Both cost a chord — the slot they take over is gone — which is why this sits
   * above `suspend` on the ladder despite sounding gentler.
   * Preserves: the arrival chord, and every pinned third (a sus has none).
   */
  cadential_sus: {
    blurb: 'sus resolving into the chord after it, at the loop\'s cadence',
    preserves: 'the chord it resolves into, and every pinned third',
    cost: 0.35,
    sites(cycle, ctx) {
      const out = [];
      const n = cycle.length;
      if (n < 3) return out;
      // A suspension needs something to resolve TO. Resolving into another sus,
      // or into a chord with no sounding third, suspends nothing.
      const target = (c) => thirdClass(c.quality) !== 'none';
      if (target(cycle[0])) {
        push(out, cycle, ctx, n - 1, { semis: cycle[0].semis, quality: 'sus' },
          `wrap: ${cycle[0].semis}sus resolving into the top of the loop`, { resolvesInto: 0 });
      }
      if (target(cycle[n - 1])) {
        push(out, cycle, ctx, n - 2, { semis: cycle[n - 1].semis, quality: 'sus' },
          `penultimate: ${cycle[n - 1].semis}sus resolving into the last chord`, { resolvesInto: n - 1 });
      }
      return out;
    },
  },

  /**
   * Sharpen ONE dominant into an altered dominant (7b9 / 7alt), at the turn.
   *
   * FROM THE VIDEO CORPUS (D57), where the sources annotate it themselves:
   * videos 1/4/9/11 render plain chords in white and altered dominants in
   * gold/rainbow, and the pattern is uniform — a diatonic frame, ONE altered
   * dominant per phrase, at the turn, never two in a row. That makes this an
   * operator WITH A PLACEMENT RULE rather than a colour knob: `recolour` would
   * offer 7b9 on any dominant anywhere, which is exactly the "thrown in
   * randomly" failure Ethan's variation ruling names.
   *
   * So the placement is enforced structurally:
   *   - no sites at all if the cycle already contains an altered dominant
   *     (once per phrase, and "never two in a row" follows for free);
   *   - only a dominant that actually RESOLVES — down a fifth or down a
   *     semitone into the next chord (the wrap counts; D49 puts the cadence
   *     there), because the alteration is tension and tension unresolved is
   *     just wrong notes;
   *   - only the LAST such dominant in the cycle — "at the turn". A mid-phrase
   *     alteration is not the device the videos show.
   *
   * The colour picked is whichever of 7alt / 7b9 the family plays more on that
   * degree (both are counted, thinly, from the ldrolez import). Preserves: the
   * root, the third, the resolution — only the tension on top changes.
   */
  alter_dominant: {
    blurb: 'the phrase\'s last resolving dominant -> 7b9/7alt (one per phrase, at the turn)',
    preserves: 'the root, the third and the resolution — only the tension changes',
    cost: 0.4,
    // The verification gate scores chord quality against the counted corpus,
    // and an altered dominant is RARE there by definition — that rarity is the
    // whole device (the sources render it in gold because it is the marked
    // event). Measured: V7 -> V7alt in minor drops worstQual by ~1.7 nats,
    // which the default QUALITY_SLACK (1.0) rejects every time, making the
    // operator dead on arrival. So it declares its own extra allowance; the
    // gate's other terms (root motion, cadence) still apply in full, and the
    // placement rule above — one per phrase, at the turn, must resolve — is
    // the guard that a corpus-frequency check cannot be for a device whose
    // point is to be infrequent.
    gateSlack: { quality: 2.5 },
    sites(cycle, ctx) {
      // a dominant already carrying an alteration ('^7#11' and 'm7b5' are not
      // dominants, so the leading 7/9/13 is part of the test)
      const altered = (q) => /^(7|9|13)(b9|b13|b5|#5|#9|#11|alt)/.test(q);
      if (cycle.some((c) => altered(c.quality))) return [];
      const n = cycle.length;
      let turn = -1;
      for (let i = 0; i < n; i++) {
        if (!['7', '9', '13'].includes(cycle[i].quality)) continue;
        const next = cycle[(i + 1) % n];
        const drop = mod12(cycle[i].semis - next.semis);
        if (drop !== 7 && drop !== 1) continue; // down a fifth, or the semitone slide
        turn = i;
      }
      if (turn < 0) return [];
      const out = [];
      const probs = new Map(qualityProbs(cycle[turn].semis, ctx));
      const q = (probs.get('7alt') ?? 0) >= (probs.get('7b9') ?? 0) ? '7alt' : '7b9';
      push(out, cycle, ctx, turn, { semis: cycle[turn].semis, quality: q },
        `${cycle[turn].semis} altered at the turn (${q}), resolving into ${cycle[(turn + 1) % n].semis}`);
      return out;
    },
  },

  /**
   * Change only the colour — add or drop a seventh, sixth, ninth — staying on
   * the same root with the same third. The options come from what the corpus
   * actually plays on that degree, so this cannot invent a quality the family
   * has never used.
   * Preserves: root, third, function. The safest operator there is.
   */
  recolour: {
    blurb: 'same root, same third, different extension',
    preserves: 'the root, the third and the function',
    cost: 0.15,
    sites(cycle, ctx) {
      const out = [];
      cycle.forEach((c, i) => {
        const k = thirdClass(c.quality);
        if (k === 'none') return;
        const probs = qualityProbs(c.semis, ctx);
        for (const [q, p] of probs) {
          if (q === c.quality || thirdClass(q) !== k) continue;
          // only colours the corpus actually put on THIS degree, not the tail
          if (p < 0.04) continue;
          push(out, cycle, ctx, i, { semis: c.semis, quality: q }, `${c.semis} recoloured ${q || 'plain'}`);
        }
      });
      return out;
    },
  },
};

/**
 * Rotation is the one operator that touches no chord at all — it changes where
 * the loop STARTS, so a different chord lands on the downbeat. D49 established
 * that the corpus's own entries are rotated arbitrarily by the extractor and
 * that a cycle is the same cycle at any rotation; what changes is entirely
 * where the metric weight falls, which is a real and free variation.
 * Kept separate from OPS because it is a whole-cycle move, not a slot edit.
 */
export const ROTATE = {
  name: 'rotate',
  blurb: 'start the loop on a different chord (no chord changes at all)',
  preserves: 'every chord and every transition',
  cost: 0.45,
  sites(cycle) {
    return Array.from({ length: cycle.length - 1 }, (_, k) => ({
      by: k + 1, note: `loop now starts on chord ${k + 1}`,
    }));
  },
  apply(cycle, by) {
    return [...cycle.slice(by), ...cycle.slice(0, by)];
  },
};

export const OP_NAMES = Object.keys(OPS);
