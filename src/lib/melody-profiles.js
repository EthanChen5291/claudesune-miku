// Melody style profiles (D35 §2.2 steps 4-5): sampling weights for bindMelody's
// cell generation and guard hierarchy. A profile is a STYLE'S measured habits,
// not a rule set — every number here is an audition-tunable default, and the
// toby-fox numbers are corpus measurements, not taste (undertale-melody.md,
// 37,464 melodic intervals from the D30 import's --report).
//
// Fields:
//   moves           relative weights over cell moves, in SCALE STEPS
//                   (repeat 0, step ±1, third ±2, fourth ±3, fifth ±4,
//                    sixth ±5, octave ±7)
//   upBias          P(a non-repeat move goes up)
//   leapRecovery    P(the move after a leap ≥ a fourth reverses by step) —
//                   the gap-fill rule (post-skip reversal ≈ 72% in corpora)
//   stepInertia     P(a step continues stepping the SAME direction) — the
//                   run-maker (Chiu & Temperley 2024: style-differentiating;
//                   these values are audition-tunable defaults, D37)
//   rangeSteps      cell offsets clamped to ±rangeSteps scale steps
//   approachProb    P(the onset before an anchor becomes an approach tone)
//   chromaticApproach  P(an approach tone is chromatic rather than diatonic)
//   cellRepetitionFloor  fraction of bars that must restate the cell —
//                   checked by melodyReport(), not enforced at generation
//   articulation    per-note duration ratios by gap length (D39): {held,
//                   quarter, eighth, short, lightMul}. Long notes ring, short
//                   notes pop, light notes lift. Measured target (the corpus's
//                   own melody streams): ~24% staccato, 25% detached, 51%
//                   legato — a melody that holds every note cannot phrase.
//   tensions        'triadic' | 'full' — the §6 tension-depth axis. 'triadic'
//                   (toby-fox, pop-ballad): weak-beat notes come from the
//                   chord-scale INTERSECTED WITH THE KEY, plus the chord's own
//                   core tones — a borrowed/chromatic chord contributes its
//                   chord tones, never its whole source mode (audition round:
//                   full chord-scales put 13% of notes out of key — "not
//                   legal"). 'full' (future jazz-bossa): the whole chord-scale.

export const MELODY_PROFILES = {
  // undertale-melody.md: 34% stepwise, 40% leaps ≥ P4 (P4 11.3% > P5 7.0% >
  // M3 6.5%, 6ths/7ths ~2.4%), octaves 6.6%, direct repeats 8.6%; 79% of
  // leaps immediately reverse; up 48% / down 43%; range ≤ P8+m3 typical;
  // 73% of bars repeat a stated cell; chromatic passing "careful" (§5.1).
  'toby-fox': {
    moves: { repeat: 0.09, step: 0.34, third: 0.13, fourth: 0.12, fifth: 0.07, sixth: 0.025, octave: 0.066 },
    upBias: 0.53,
    leapRecovery: 0.79,
    stepInertia: 0.55,
    rangeSteps: 9, // ≈ P8+m3 in scale steps
    approachProb: 0.15,
    chromaticApproach: 0.25,
    cellRepetitionFloor: 0.5,
    articulation: { held: 1, quarter: 0.98, eighth: 0.62, short: 0.46, lightMul: 0.9 },
    tensions: 'triadic',
  },
  // step-dominated generic profile (interval-grammar §5.1 pop-ballad column):
  // leap-recovery strict, chromaticism ≈ 0
  default: {
    moves: { repeat: 0.12, step: 0.52, third: 0.18, fourth: 0.08, fifth: 0.05, sixth: 0.02, octave: 0.03 },
    upBias: 0.5,
    leapRecovery: 0.9,
    stepInertia: 0.65,
    rangeSteps: 7,
    approachProb: 0.1,
    chromaticApproach: 0,
    cellRepetitionFloor: 0.4,
    articulation: { held: 1, quarter: 0.95, eighth: 0.8, short: 0.68, lightMul: 0.95 },
    tensions: 'triadic',
  },
};

/** scale-step size of each named move */
export const MOVE_STEPS = { repeat: 0, step: 1, third: 2, fourth: 3, fifth: 4, sixth: 5, octave: 7 };
