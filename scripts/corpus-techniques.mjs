// Corpus-derived technique library.
//
// WHAT THIS IS. Every mechanism here was measured on the 31,652-file VGMusic
// analysis corpus (research/vgmusic-atlas-r20.md, research/vgmusic-techniques-r20.md)
// and is implemented as a PARAMETERISED MECHANISM WITH VARIETY, never as a fixed
// value. Each technique exposes a weighted pool and takes a seed, so two songs
// asking for the same technique get different realisations, and techniques
// compose with each other rather than overriding.
//
// D95 COMPLIANCE. Nothing here is imported by src/. This is the hand-authored
// path the doctrine requires: the corpus informed these RULES, but no count from
// it feeds a retrieval pool or the harmony model. The measured number lives in a
// comment next to the rule it justifies, which is how a corpus finding is
// allowed to reach the engine.
//
// THE STANDING CAVEAT. The corpus says what game music DOES, not what Ethan
// LIKES. Where his ear has already ruled (D100's companion, D92's 4/4, D98's
// held melody) the ear wins and the corpus number is recorded as context only.

const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
/** deterministic 0..1 from a seed string */
export const rnd = (seed) => (fnv(seed) % 100000) / 100000;
/** deterministic weighted pick: pool = [[value, weight], ...] */
export function pick(pool, seed) {
  const tot = pool.reduce((a, [, w]) => a + w, 0);
  let t = rnd(seed) * tot;
  for (const [v, w] of pool) { t -= w; if (t <= 0) return v; }
  return pool[pool.length - 1][0];
}
/** n distinct picks */
export function pickN(pool, n, seed) {
  const out = [], used = new Set();
  for (let i = 0; i < n * 6 && out.length < n; i++) {
    const v = pick(pool.filter(([x]) => !used.has(x)), `${seed}|${i}`);
    if (v == null || used.has(v)) continue;
    used.add(v); out.push(v);
  }
  return out;
}

// ============================================================ HARMONY

/**
 * ROOT MOTION. Measured pooled over 2,591,616 events: static 29.8%, step axis
 * 26.2%, fourth/fifth axis 22.9%, third axis 19.4%. Circle-of-fifths is NOT the
 * backbone — step motion plus static motion together outweigh fifth motion.
 */
export const ROOT_MOTION = [
  ['static', 29.8], ['step', 26.2], ['fifth', 22.9], ['third', 19.4],
];
const STEP_INTERVALS = [[1, 1], [2, 4], [10, 4], [11, 1]];
const FIFTH_INTERVALS = [[5, 6], [7, 4]];
const THIRD_INTERVALS = [[3, 3], [4, 3], [8, 3], [9, 2]];

export function nextRoot(root, seed) {
  const axis = pick(ROOT_MOTION, `${seed}|axis`);
  if (axis === 'static') return root;
  const pool = axis === 'step' ? STEP_INTERVALS : axis === 'fifth' ? FIFTH_INTERVALS : THIRD_INTERVALS;
  return (root + pick(pool, `${seed}|iv`)) % 12;
}

/**
 * QUALITY VOCABULARY. Measured quality mix over 2.6M chord slots. Plain-triad
 * tracks are effectively ABSENT (0.07% of files reach a 90% triad rate) and the
 * ninth family is the largest group — so colour is the default spelling and the
 * plain triad is the marked exception. Weights below are the measured shares.
 */
// DIALECT: these are the symbols the voicing library actually knows. `sus4`,
// `sus2`, `7sus4`, `dim`, `dim7` and `m13` are NOT among them — they return an
// EMPTY tone set, which means "figure members use default intervals", i.e.
// silently wrong notes rather than an error. That is the exact trap CLAUDE.md
// warns about ("unknown symbols silently get WRONG default intervals"), and it
// hit 3 of the first 16 songs. The legal spellings are `sus` (= sus4) and
// `2` (= sus2). assertChordSymbol() below makes a recurrence loud.
export const QUALITIES = [
  ['', 13.6], ['m9', 10.9], ['^9', 10.8], ['sus', 8.4], ['m7', 8.1], ['m', 7.6],
  ['5', 7.2], ['6', 6.9], ['2', 5.5], ['^7', 5.4], ['7', 3.8], ['9', 3.7],
  ['m6', 2.4], ['^', 2.1], ['m11', 1.8], ['add9', 1.8],
];
/** qualities that read as COLOUR (median colour share is 0.70 corpus-wide) */
const COLOUR_Q = new Set(['m9', '^9', 'sus', 'm7', '6', '2', '^7', '7', '9', 'm6', 'm11', 'add9']);
const PLAIN_Q = new Set(['', 'm']);
const THIRDLESS_Q = new Set(['5', 'sus', '2']);

const minorish = (q) => q.startsWith('m');
export function qualityFor(root, keyMode, seed, { colourBias = 0, thirdless = false } = {}) {
  // diatonic sense: which qualities are plausible on this scale degree
  const majDeg = { 0: 'maj', 2: 'min', 4: 'min', 5: 'maj', 7: 'maj', 9: 'min', 11: 'dim' };
  const minDeg = { 0: 'min', 2: 'dim', 3: 'maj', 5: 'min', 7: 'min', 8: 'maj', 10: 'maj' };
  const table = keyMode === 'minor' ? minDeg : majDeg;
  const want = table[root] ?? (keyMode === 'minor' ? 'min' : 'maj');
  let pool = QUALITIES.filter(([q]) => {
    if (thirdless) return THIRDLESS_Q.has(q);
    if (want === 'min') return minorish(q) || THIRDLESS_Q.has(q);
    if (want === 'dim') return q === 'm7b5' || minorish(q) || THIRDLESS_Q.has(q);
    return !minorish(q);
  });
  if (!pool.length) pool = QUALITIES;
  if (colourBias) pool = pool.map(([q, w]) => [q, COLOUR_Q.has(q) ? w * (1 + colourBias) : w * Math.max(0.1, 1 - colourBias)]);
  return pick(pool, seed);
}

/**
 * RECOLOUR — the single most common harmonic move in the corpus, and one the
 * engine does not have. The root stays put and the quality is re-spelled:
 * 29.4% of all harmonic change events, present in 94.9% of files. It is a
 * first-class peer of the chord change, not an ornament.
 */
export function recolour(sym, keyMode, seed) {
  const m = String(sym).match(/^([A-G][b#]?)(.*)$/);
  if (!m) return sym;
  const [, root, q] = m;
  const alt = QUALITIES.filter(([x]) => x !== q && (minorish(x) === minorish(q) || THIRDLESS_Q.has(x)));
  return root + pick(alt.length ? alt : QUALITIES, seed);
}

/**
 * COLOUR CONTOUR. Measured: plain-triad rate is 17.7% on the chord APPROACHING a
 * tonic return and 29.5% ON the tonic arrival (22.1% overall). Colour peaks
 * before the tonic and is RELEASED on it — the arrival is the plainest position
 * in the progression. Returns a per-chord colour bias for a rendered symbol list.
 */
export function colourContour(symbols, tonicPc, pcOf) {
  return symbols.map((s, i) => {
    const nextIsTonic = i + 1 < symbols.length && pcOf(symbols[i + 1]) === tonicPc;
    const isTonic = pcOf(s) === tonicPc;
    if (isTonic) return -0.35;      // release: plainer on arrival
    if (nextIsTonic) return +0.45;  // peak: richest on the approach
    return 0;
  });
}

/**
 * PRE-TONIC APPROACH. The dominant is a MINORITY approach in major and LOSES to
 * the flat-subtonic in minor. Major: V 27.6, IV 24.1, II 13.5, bVII 11.0, VI 9.1,
 * III 4.1. Minor is flatter still. So the approach chord is drawn from a
 * mode-weighted set, never from a single dominant-function rule.
 */
export const APPROACH = {
  major: [[7, 27.6], [5, 24.1], [2, 13.5], [10, 11.0], [9, 9.1], [4, 4.1]],
  minor: [[10, 24.0], [7, 21.0], [5, 18.0], [8, 15.0], [3, 12.0], [2, 10.0]],
};
export const approachRoot = (keyMode, seed) => pick(APPROACH[keyMode] ?? APPROACH.major, seed);

/**
 * MODAL FURNITURE. In minor keys bVI appears in 79.1% of files, bVII in 77.4%,
 * iv in 60.0% — these are STRUCTURAL, not chromatic spice, and belong in the base
 * vocabulary for every lane rather than behind a "dark vibe" gate.
 */
export const MODAL_DEGREES = { minor: [8, 10, 5, 3], major: [10, 8, 5, 3] };

/**
 * PLANING — sliding the SAME quality to a new root. A routine device in about
 * three quarters of files, and one the engine has no operator for.
 */
export function plane(sym, semis) {
  const m = String(sym).match(/^([A-G][b#]?)(.*)$/);
  if (!m) return sym;
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  let pc = PC[m[1][0]] + (m[1][1] === '#' ? 1 : m[1][1] === 'b' ? -1 : 0);
  return NAMES[(((pc + semis) % 12) + 12) % 12] + m[2];
}

// ============================================================ ACCOMPANIMENT

/**
 * INTERVAL ABOVE THE SOUNDING BASS. The engine plays 99.3% within {R,b3,3,5}.
 * The corpus plays 65.2% there and spreads the remaining 34.8% over eight other
 * classes, NONE negligible — a typical hand sounds 9 of 12 classes at >=2%.
 * Weights are the measured distribution (n=21,670 files).
 *
 * NOTE ON THE FOURTH: only 6.7% of hands never sound a 4th above the bass — a
 * LOWER absence rate than the b3 (8.2%) or the 3rd (8.5%). The engine's ban on
 * it is unsupported. Emitted as a SCALE token (s4) so it cannot spell a foreign
 * pitch, per the dialect trap in CLAUDE.md.
 */
// EXPRESSED IN THE LEGAL FIGURE GRAMMAR: /^(R|[34567]|9|s[2467]|~\d+)(\+*)$/.
// Flat tokens (b3, b6, b7...) are NOT members of it and throw — an earlier draft
// used them and silently lost ~30 layers across the suite, which is why six songs
// measured 0% four-note attacks.
// The mapping preserves the SHAPE of the measurement while staying in-key by
// construction, which is what the dialect requires:
//   - the chord-member tokens already adapt: `3` yields the chord's OWN third
//     (minor third over a minor chord), `5`/`6`/`7`/`9` likewise. So the measured
//     3rd + b3 shares (8.8 + 7.4) fold into one `3`.
//   - `s2/s4/s6/s7` resolve against the chord-scale and CANNOT spell a foreign
//     pitch, whereas bare `4`/`7` fall back to fixed intervals consulting neither
//     key nor chord-scale (CLAUDE.md). So the colour classes use the s-forms.
//   - the measured b5 (2.5%) and b2 (1.8%) are dropped rather than forced: they
//     are only reachable as literal `~6`/`~1`, which is exactly the foreign-pitch
//     writing the doctrine warns against.
export const IV_ABOVE_BASS = [
  ['R', 31.0], ['5', 17.9], ['3', 16.2], ['s4', 7.2], ['s2', 6.2],
  ['s6', 8.7], ['s7', 8.5], ['9', 4.3],
];
/** token pool for a figure member, biased toward colour when asked */
export function figureMember(seed, { colour = 0 } = {}) {
  const core = new Set(['R', '5', '3']);
  const pool = IV_ABOVE_BASS.map(([t, w]) => [t, core.has(t) ? w * Math.max(0.15, 1 - colour) : w * (1 + colour * 1.6)]);
  return pick(pool, seed);
}

/**
 * DYAD OSTINATO — the modal accompaniment shape. HALF of all acc parts never
 * play more than two notes at once, and those parts play a dyad on ~75% of their
 * attacks. The two-note attack is the DEFAULT, not a step between one note and a
 * triad. (The engine strikes one note on 74.3% of attacks — the 99.6th
 * percentile of corpus accompaniment parts.)
 */
export function dyadTokens(n, seed, { colour = 0.3 } = {}) {
  return Array.from({ length: n }, (_, i) => {
    const lo = figureMember(`${seed}|lo${i}`, { colour: colour * 0.4 });
    const hi = figureMember(`${seed}|hi${i}`, { colour });
    return lo === hi ? `${lo}.${hi}+` : `${lo}.${hi}`;
  });
}

/**
 * NOTES-PER-ATTACK for the aggregated hand. Corpus: 1 note 43.1%, 2 25.5%,
 * 3 13.7%, 4 8.1%, 5+ 9.5% — >=4 on 17.7% of attacks against the engine's 0.11%.
 * CRITICAL MECHANISM: thickness comes from STACKING THIN PARTS, not from widening
 * one. A single acc part reaches >=4 notes on 5.4% of attacks while the whole
 * hand reaches >=4 on 21.2%, and half the thickest textures contain no part that
 * ever exceeds three notes.
 */
export const ATTACK_WIDTH = [[1, 43.1], [2, 25.5], [3, 13.7], [4, 8.1], [5, 5.5], [6, 4.1]];

/**
 * DENSITY STRATIFICATION. Median onsets per bar: pad 0.89, acc 2.88, arp 7.81 —
 * roughly a 9x spread. Two accompaniment layers must differ by a MULTIPLE, not an
 * offset; a second hand at the same rate as the first is the corpus's minority case.
 */
export const HAND_DENSITY = { pad: 0.89, acc: 2.88, arp: 7.81 };
export const densityFor = (role, seed) => HAND_DENSITY[role] * (0.7 + rnd(`${seed}|dens`) * 0.6);

/**
 * NON-CHORD TONES. The engine's problem is RESOLUTION, not rate: its 22.8% rate
 * sits at the 85.5th percentile (unremarkable) but its 6.1% resolution is at the
 * 2.5th, and the combination it ships occurs in 1.46% of the corpus. Corpus:
 * 14.1% rate, 43.6% resolved, 48.7% step-APPROACHED — approach and resolution are
 * near-equal, so real practice BRACKETS a dissonance with stepwise motion on both
 * sides. Correlation between step-approach and resolution is 0.601.
 *
 * Returns a 3-token bracket: approach -> dissonance -> resolution, all stepwise.
 */
export function nctBracket(seed) {
  const target = pick([['R', 3], ['3', 3], ['5', 3], ['b3', 2]], `${seed}|t`);
  const approach = pick([['s2', 3], ['s7', 3], ['s4', 2], ['s6', 2]], `${seed}|a`);
  return [approach, target];
}
/** measured targets, for reporting against */
export const NCT_TARGET = { rate: 0.141, resolved: 0.436, stepApproached: 0.487 };

/**
 * HELD-HARMONY FIGURATION. Under an unchanged chord the corpus hand does NOT sit
 * still: median 7.2 onsets per held bar, and 50.8% of held bars introduce a pitch
 * class OUTSIDE the chord. Figuration is insertion of foreign tones, not faster
 * re-striking of chord tones. Relevant because 29.4% of all "changes" are the
 * same root re-struck.
 */
export const HELD_BAR = { onsets: 7.2, foreignShare: 0.508 };

// ============================================================ MELODY

/**
 * MELODY DYAD ACCENT. The corpus lead is 97.44% monophonic — two-note attacks are
 * 2.21% and four-plus are 0.065%. 77% of leads NEVER strike two notes. So "melody
 * is chord too" is a per-note DYAD ACCENT on a minority of notes, capped at ONE
 * added note, not a chord texture.
 *
 * And when a melody IS thickened the corpus commits to ONE interval class held in
 * parallel rather than re-voicing per attack: 3rd 26.7%, octave-class 19.0%,
 * 4th 14.3%, 6th 8.6%, 2nd 8.1%, 5th 7.x%. A blanket ban on fourths AND octave
 * doubling forbids the 2nd and 3rd most common devices.
 */
export const THICKEN_INTERVAL = [['3rd', 26.7], ['octave', 19.0], ['4th', 14.3], ['6th', 8.6], ['5th', 7.4], ['2nd', 8.1]];
export const thickenChoice = (seed) => pick(THICKEN_INTERVAL, `${seed}|thicken`);
/** measured accent rate; thickened notes are weighted toward long + downbeat
 *  (1.69x and 1.29x lift) but 70% of them are NOT long — so weight, never rank. */
export const DYAD_ACCENT_RATE = 0.0221;

/**
 * HELD-vs-JITTERY IS A COORDINATED PROFILE, not a duration knob. As the median
 * lead note lengthens, per-bar count, pitch range, repeated-pitch rate and rest
 * rate ALL fall together — and tempo does not move at all. Only 10.4% of files
 * have a median lead note >= 1 beat. One latent parameter drives all of them.
 */
export function heldProfile(t) {
  const k = Math.max(0, Math.min(1, t));
  return {
    medDurBars: 0.06 + k * 0.30,          // 8th note -> ~1.5 beats
    notesPerActiveBar: 8.5 - k * 5.5,     // busy -> sparse
    range: Math.round(24 - k * 11),       // wide -> narrow
    repeatRatio: 0.12 - k * 0.07,
    restRatio: 0.18 - k * 0.10,
  };
}

/**
 * ARTICULATION IS NOT REST. 65.8% of inter-note gaps are shorter than an eighth
 * of a bar and 71% of leads are effectively legato — most gaps are articulation,
 * not breath. Real breaths are rare (median 1.5% of onsets) and phrases are
 * short: median 2.0 bars / 11 notes where a lead breathes at all.
 * Model articulation as a voice-level parameter separate from rests, held
 * constant within a section rather than re-randomised per note.
 */
export const ARTIC = [['legato', 71], ['detached', 20], ['staccato', 9]];
export const articRatio = { legato: 0.97, detached: 0.72, staccato: 0.48 };
export const PHRASE = { bars: 2.0, notes: 11, breathRate: 0.015 };

// ============================================================ COUNTERPOINT

/**
 * TWO SEPARATE REGISTER DEVICES, not one. The verify pass refuted the single-pick
 * reading that put the companion an octave down:
 *   (i)  the melody is separated from its HARMONY HAND by about an octave
 *        (median -12, 76.0% below on register-unconstrained roles)
 *   (ii) SEPARATELY, a companion runs in the SAME register a third-to-fourth away
 *        — present in 42.8% of files, rhythm-locked in 20.7%, in parallel thirds
 *        in 12.2%. The gap between the two highest non-bass parts has median 5
 *        semitones, NOT 12.
 * Build both. Do not place the companion an octave down on the strength of -12.
 */
export const COMPANION_INTERVAL = [[-3, 22], [-4, 22], [-5, 16], [-7, 12], [-8, 8], [-9, 8], [3, 6], [4, 6]];
export const companionInterval = (seed) => pick(COMPANION_INTERVAL, `${seed}|comp`);

/**
 * THIRDS AND SIXTHS BEAT FOURTHS AND FIFTHS (43.1% vs 33.1%) once octave doubling
 * is removed from the "perfect" bucket — the raw reading that said otherwise was
 * REFUTED. But the perfect FOURTH individually (17.3%) does exceed the minor third
 * (15.1%), so the categorical no-fourths ban is what is unsupported, not the
 * thirds-first preference. Keep thirds first; permit the fourth.
 */
export const HARMONISING_CLASS = [['3rd', 27.5], ['6th', 15.6], ['4th', 17.3], ['5th', 15.8], ['2nd', 8.0], ['7th', 6.0]];

/**
 * DENSITY INVERSION. The second line inverts against the lead's activity: when
 * the lead rests through most bars the companion is DENSER (median ratio 1.57,
 * denser in 63.9%); when the lead plays continuously it is sparser (0.88, denser
 * in 29.4%). Drive companion density from the lead's measured per-bar activity,
 * never from a constant fraction.
 */
export const companionDensity = (leadActiveBarRatio) =>
  leadActiveBarRatio < 0.3 ? 1.57 : leadActiveBarRatio < 0.5 ? 1.23 : leadActiveBarRatio < 0.7 ? 1.0 : 0.88;

/**
 * CHROMATIC LICENCE SCALES WITH MOTION — the corpus's own version of the D100
 * fix, reached by a better mechanism than a blanket key-gate. A barely-moving
 * line parked on out-of-key pitches occurs 26 times in 15,813 files (0.16%), and
 * narrow-range second lines have a MEDIAN out-of-key rate of exactly ZERO.
 * A line that repeats or holds must be diatonic; one that moves freely need not
 * be. Also measured: chromaticism is NOT bought by rhythmic independence — the
 * out-of-key rate is flat across the whole independence range, so no rule may
 * trade rhythm for chromatic allowance.
 */
export function chromaticLicence(realisedRange, leadOutOfKey = 0.07) {
  if (realisedRange <= 4) return 0;                      // static line: diatonic, full stop
  const scaled = Math.min(1, (realisedRange - 4) / 20);
  return Math.min(0.05, leadOutOfKey * scaled);          // cap near the corpus upper quartile
}

/**
 * CALL AND RESPONSE IS TWO DEVICES. 45.6% of files contain a pair sharing ZERO
 * active bars (sequential occupancy / handoff); 25.5% contain a pair that
 * genuinely TRADES while co-present. Budget them separately.
 * Trading partners CONTRAST: 85.9% different GM program, 76.2% different family,
 * and 59.7% of trading pairs do not involve the lead at all.
 */
export const CR_MODE = [['handoff', 45.6], ['trade', 25.5], ['none', 28.9]];

// ============================================================ LAYERING

/**
 * DOUBLING IS A DISCRETE MODE, not a gradient: 67.2% of pairs share under 5% of
 * their pitches and 3.5% share 99-100%; only 4.3% sit in the ambiguous middle.
 * 48.5% of files carry at least one doubled pair — unison 41.6%, ECHO 42.6%,
 * octave 15.8% — and echo is overwhelmingly a same-instrument delay at a HALF or
 * QUARTER beat. "Add a layer" is very often answered by doubling an existing one
 * at an offset, which costs no new musical material. The engine has no such device.
 */
export const DOUBLE_MODE = [['none', 51.5], ['echo', 20.7], ['unison', 20.2], ['octave', 7.6]];
export const ECHO_OFFSET = [[0.5, 40], [0.25, 30], [1.0, 10], [0.75, 10], [0.125, 6], [1 / 3, 4]];

/**
 * ROSTER GATING. The full ensemble is not the norm and the effect is roster-gated:
 * files with <=5 pitched parts assemble everything ~88% of the time, files with
 * >=6 fail to assemble 64% of the time. What is constant is a PERSISTENT CORE of
 * about 4 parts present in 99% of files, which grows only 3->6 as the roster grows
 * 3->14. So the fraction held out of any given bar scales UP with roster size.
 */
export function holdoutFraction(rosterSize) {
  if (rosterSize <= 3) return 0.02;
  if (rosterSize <= 5) return 0.12;
  if (rosterSize <= 7) return 0.30;
  return 0.42;
}
export const PERSISTENT_CORE = 4;

// ============================================================ FORM

/**
 * ENTRY JITTER — the answer to the standing unbuilt ask, "changes not just in
 * strict section bar, and also changes in a unique way".
 *
 * Measured over 127,754 layer entries: only 43.1% land on a 4-bar grid, 21.0% on
 * an 8-bar grid, 16.5% on a harmonic boundary; 60.0% of files put ZERO entries on
 * a harmonic boundary and only 3.3% behave the way the engine does (every entry
 * on a boundary).
 *
 * The MECHANISM is a bounded symmetric displacement around a 4-bar boundary, not
 * free placement: signed offset -1 -> 20.4%, 0 -> 43.1%, +1 -> 20.6%, +2 -> 15.8%,
 * with 84.2% within one bar of a multiple of 4.
 *
 * AND IT IS NOT 2-BAR-PERIODIC — the +2 slot is the RAREST non-zero position and
 * in strongly-looping files the loop midpoint attracts entries BELOW chance. This
 * refutes the standing hypothesis that the mechanism is a faster periodic grid.
 * It is displacement FROM the phrase grid, not subdivision OF it.
 */
export const ENTRY_OFFSET = [[0, 43.1], [-1, 20.4], [1, 20.6], [2, 15.8]];
export function jitterEntry(nominalBar, seed, { min = 1, max = Infinity } = {}) {
  const off = pick(ENTRY_OFFSET, `${seed}|entry`);
  return Math.max(min, Math.min(max, nominalBar + off));
}

/**
 * STAGGERED OPENING. The single most common entry bar in the whole corpus is
 * BAR 1 (20.4% of all entries), and 29.5% of entries occur by bar 2. 60.2% of
 * parts enter after bar 0. Openings are a one-bar staggered build, not a wait for
 * the phrase boundary and not a whole-cast admission at bar 0.
 */
export function staggerOpening(layerIds, seed) {
  const held = Math.round(layerIds.length * 0.6);
  const order = [...layerIds].sort((a, b) => fnv(`${seed}|${a}`) - fnv(`${seed}|${b}`));
  const out = {};
  order.forEach((id, i) => {
    if (i < layerIds.length - held) { out[id] = 0; return; }
    const step = 1 + Math.floor(rnd(`${seed}|st${id}`) * 2);   // 1-2 bar spacing
    out[id] = Math.min(8, 1 + (i - (layerIds.length - held)) * step);
  });
  return out;
}

/**
 * SECTION LENGTH is centred but NOT quantised: only 44.0% of files have a median
 * section length that is a multiple of 4 and 34.3% are ODD. The hard
 * 4/8-bar-multiple constraint is stricter than the corpus practises.
 * (Kept as a weighted preference so 4 and 8 remain the modes.)
 */
export const SECTION_LEN = [[4, 20.6], [8, 12.6], [6, 5.3], [5, 7.4], [2, 5.6], [3, 3.5], [7, 3.3], [16, 5.0]];

/**
 * THE CONCURRENCY ARCH. ~45% of the cast is absent at the start and ~42% has left
 * by the end, with a long flat plateau across the middle. The characteristic
 * gesture is a thinning TAIL, not an interior breakdown — deep mid-track
 * strip-downs are rare (median interior dip 8.3% of peak).
 */
export function archEnvelope(pos) {
  if (pos < 0.12) return 0.55 + pos / 0.12 * 0.25;
  if (pos > 0.80) return 0.93 - (pos - 0.80) / 0.20 * 0.35;
  return 0.80 + Math.min(0.15, (pos - 0.12) * 0.4);
}

/**
 * REMOVAL IS A FIRST-CLASS EVENT. 40.6% of texture-change events are removals and
 * 3.8% move parts both ways at once — roughly 0.6 removals per addition, not
 * something that only happens at a designated breakdown.
 */
export const CHANGE_KIND = [['add', 55.6], ['remove', 40.6], ['swap', 3.8]];

/**
 * INTRO LENGTH IS GOVERNED IN BARS, NOT SECONDS — so slow songs get the LONGEST
 * intros in real time, the opposite of a seconds-based cap. 47.4% of intros exceed
 * 16 seconds; below 70bpm, 61.9% do. And intros are NOT whole-loop quantised:
 * 38.5% are an ODD number of bars, and 1-, 2- and 3-bar intros together outnumber
 * 8-bar intros. 48.0% of files have no intro at all.
 */
export const INTRO_BARS = [[0, 48.0], [4, 11.6], [1, 10.6], [8, 9.8], [2, 8.4], [3, 5.3], [16, 5.2], [12, 3.6]];

// ============================================================ RHYTHM

/**
 * THE DRUM LOOP'S PERIOD IS 2 AND 4 BARS, NOT 1. A bar is 1.6x more likely to be
 * identical to the bar FOUR back than to the bar immediately before it, and only
 * 5.8% of tracks repeat one identical bar throughout. Author drums as a multi-bar
 * cell with a small closed set of variants (~one per 8 bars), not one bar + fills.
 */
export const DRUM_PERIOD = [[4, 50], [2, 35], [8, 15]];

/**
 * SYNCOPATION IS A PER-SONG LATCH, BIMODAL, NOT AN AVERAGE. 45.0% of tracks put
 * under 5% of kick onsets on an odd 16th while 30.7% put over 30% there; 11.9%
 * have ZERO odd-16th drum onsets anywhere. Draw once per song and apply
 * consistently to every percussion role.
 */
export const SYNC_LATCH = [['straight', 45.0], ['light', 24.3], ['syncopated', 30.7]];

/**
 * SYNCOPATION IS A MONOTONE GRADIENT BY ROLE — the more structural the role, the
 * more it sits on the beat. Measured odd-16th share: crash 11.3%, kick 21.8%,
 * snare 25.0%, hat 32.0%, tom 33.3%, hand drum 36.0%. Each role carries its own
 * onset-position distribution; they do not share one rhythm generator.
 */
export const ROLE_SYNC = { crash: 0.113, kick: 0.218, snare: 0.250, hat: 0.320, tom: 0.333, hand: 0.360, shaker: 0.34, wood: 0.33 };

/**
 * COLOUR PERCUSSION IS ONE CO-FIRING GROUP that layers OVER an unchanged straight
 * kit rather than replacing it (hand<->wood lift 3.15, shaker<->wood 2.42), and it
 * is conditioned by ENVIRONMENT, not energy: hand drums in 40.3% of jungle and
 * 26.9% of forest against a 12.5% baseline, but only 8.6% of battle and 5.9% of
 * boss. Two independent dials — environment permits colour percussion, energy
 * weights cymbals and toms.
 */
export const COLOUR_PERC_BY_ENV = {
  jungle: 0.403, forest: 0.269, desert: 0.255, water: 0.234, cave: 0.209,
  festival: 0.30, shrine: 0.22, casino: 0.20,
  battle: 0.086, boss: 0.059, fight: 0.086, space: 0.09, lab: 0.06,
};

/**
 * PERCUSSION ACCENT IS CARRIED BY INSTRUMENT SWAP, NOT VELOCITY. 55.8% of tracks
 * use <=2 distinct drum velocities and the median on-beat-minus-off-beat velocity
 * difference is EXACTLY 0.00 — while the open hi-hat does the accenting (50.6% of
 * its onsets on offbeat 8ths against the closed hat's 30.0%).
 */
export const ACCENT_BY_ARTICULATION = true;

/**
 * DRUMLESS IS A WHOLE-ENSEMBLE STATE, NOT A MUTE. 20.6% of the corpus. Those
 * tracks also drop from 8 parts to 5, from 28 to 17.7 pitched notes per bar, and
 * from a 69% to a 22% chance of carrying a bass-family part. Firing "no
 * percussion" must fire the whole preset.
 *
 * THIS IS THE DESERT/SPACE TRAP. Only 5% of confirmed desert tracks have no
 * percussion (against 21% baseline) but 69% of SOMBER tracks do — so a somber
 * desert prompt whose emotion zeroes the floor deletes the 34%-hand-drum signal
 * that IS the lane, and what remains is the space profile almost exactly.
 * An emotion may THIN a lane's floor; it must never ZERO it.
 */
export const DRUMLESS_PRESET = { parts: 5, notesPerBar: 17.7, bassChance: 0.22, heldLift: 0.35 };
export const PERC_FLOOR_LANES = new Set(['desert', 'jungle', 'festival', 'fight', 'boss', 'battle']);

/** FILLS ARE CLOSE TO ABSENT: only 2.4% of active drum bars are fills, 76.2% of
 *  tracks contain NONE, and where one occurs it is snare-led (62.4%) not tom-led
 *  (21.0%). Do not model phrase-end as a routine tom fill. */
export const FILL_RATE = 0.024;

/** THE CRASH IS A STRUCTURAL MARKER, not a texture: 2.3% of all hits, 37.8% of its
 *  onsets on the bar's first 16th. Fire it where the groove or section changes. */
export const CRASH_ON_CHANGE = 2.0;

export const TECHNIQUE_INDEX = [
  'recolour', 'colourContour', 'approachRoot', 'plane', 'modalFurniture', 'nextRoot',
  'figureMember', 'dyadTokens', 'nctBracket', 'heldBar', 'densityStratify',
  'thickenChoice', 'heldProfile', 'articulation', 'phrase',
  'companionInterval', 'companionDensity', 'chromaticLicence', 'callResponse',
  'doubleMode', 'echoOffset', 'holdoutFraction',
  'jitterEntry', 'staggerOpening', 'sectionLen', 'archEnvelope', 'changeKind', 'introBars',
  'drumPeriod', 'syncLatch', 'roleSync', 'colourPerc', 'accentByArticulation', 'drumlessPreset',
];


/**
 * DIALECT GUARD. An unknown chord symbol does not throw in this engine — it
 * yields an empty tone set and the figure binder falls back to FIXED default
 * intervals, so the song plays wrong notes and nothing complains. Every symbol a
 * generator emits must be checked. Returns the offending symbols.
 */
export function badSymbols(symbols, chordTones) {
  return symbols.filter((s) => { const t = chordTones(s); return !t || t.size === 0; });
}


/**
 * DRUM PATTERN POOLS. Selection is by the song's measured SYNCOPATION LATCH and
 * energy, not by name — and every pool has several members so two songs asking
 * for the same character get different beats. The latch is what picks the pool
 * (corpus syncopation is bimodal per track, not an average), and the environment
 * only adds a colour-percussion layer OVER the chosen kit rather than replacing
 * it (hand/shaker/wood co-fire with lift 2.3-3.2x and leave the kick unchanged).
 */
export const DRUM_POOLS = {
  straight_low:  [['dp_basic', 3], ['dp_keep_it_simple', 3], ['dp_simple_beat', 2], ['dp_basic_smooth', 2], ['dp_relaxing_drums', 2], ['dp_2_step_chill', 2]],
  straight_mid:  [['dp_pop', 3], ['dp_clasic', 2], ['dp_base', 2], ['dp_stepping_beat', 2], ['dp_boom_tap', 2], ['dp_slowton', 2]],
  straight_high: [['dp_cool_rock_1', 3], ['dp_32nd_based_rock_beat', 2], ['dp_upbeat_16th_note_based', 3], ['dp_crunch', 2], ['dp_killswitch_i', 2]],
  light_low:     [['dp_breezey', 3], ['dp_chill_dance', 3], ['dp_basic_smooth', 2], ['dp_misty', 2], ['dp_2_step_chill', 2]],
  light_mid:     [['dp_boom_tap', 3], ['dp_chill_dance', 2], ['dp_pop', 2], ['dp_two_step_with_turnaround', 2], ['dp_nice_jam', 2]],
  light_high:    [['dp_hypegroove', 3], ['dp_bouncy_beat_2', 2], ['dp_jumpy', 2], ['dp_upbeat_16th_note_based', 2]],
  sync_low:      [['dp_chill_syncopated', 3], ['dp_trip_hop', 3], ['dp_weird_hiphop', 2], ['dp_hip_hop_basics', 2]],
  sync_mid:      [['dp_funky_breaks', 3], ['dp_funky_brek', 2], ['dp_wee_funk', 2], ['dp_skip_break', 2], ['dp_nu_jazz_electronic', 2]],
  sync_high:     [['dp_amen_break', 3], ['dp_funky_breaks', 2], ['dp_drill_uk', 2], ['dp_get_rekd', 2], ['dp_broken_circuit', 2]],
  electronic:    [['dp_house_128_v1', 3], ['dp_idm', 2], ['dp_neon_pulse', 3], ['dp_static_voltage', 2], ['dp_electrosequence_1', 2], ['dp_broken_circuit', 2]],
  industrial:    [['dp_steam_engine_1', 2], ['dp_steam_engine_3', 2], ['dp_steam_engine_5', 2], ['dp_trash_compactor', 3], ['dp_work_day', 2], ['dp_working', 2]],
  world:         [['dp_indian_dance', 3], ['dp_bamboo_houses_1', 2], ['dp_bamboo_houses_2', 2], ['dp_afrobeat_01_electrowerk66', 3], ['dp_jungle_drummy', 3], ['dp_easy_reggaeton', 2]],
};

/** choose a kit: environment first (it permits a character), then latch x energy */
export function drumPattern(env, latch, energy, seed) {
  const ENV_POOL = {
    jungle: 'world', desert: 'world', festival: 'world', shrine: 'world',
    construction: 'industrial', lab: 'electronic', space: 'electronic', casino: 'sync_mid',
  };
  const envPool = ENV_POOL[env];
  if (envPool && rnd(`${seed}|envpool`) < 0.7) return pick(DRUM_POOLS[envPool], `${seed}|dp`);
  const tier = energy >= 1.6 ? 'high' : energy <= 0.8 ? 'low' : 'mid';
  const key = latch === 'syncopated' ? `sync_${tier}` : latch === 'light' ? `light_${tier}` : `straight_${tier}`;
  return pick(DRUM_POOLS[key] ?? DRUM_POOLS.straight_mid, `${seed}|dp`);
}
