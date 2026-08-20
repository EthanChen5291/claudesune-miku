// Contour library (§3.5). ABSTRACT ONLY: scale-degree sequences + shape metadata.
// Degrees are scale indices (0 = root, 7 = octave in heptatonic); 'b5'/'#3'
// strings request a chromatic alteration (clamped to the mode — see theory.js).
// No note names, no keys — binding gives them harmony. `character` documents
// the taste. `revised: 'audition-r1'` marks entries reworked after Ethan's
// 2026-08-19 listen (the binder's old degree-cycling also smeared several of
// these — realization is shape-preserving now, D26).

export const CONTOURS = {
  arch_classic: {
    degrees: [0, 2, 4, 5, 4, 2, 0],
    shape: 'arch', span: 5,
    character: 'The textbook arch — up to the 6th degree and home again. Safe, singable, resolves itself. (Audition r1 heard it smeared by the old cycling realization; the data was always the arch.)',
  },
  rise_anthem: {
    degrees: [0, 2, 3, 4, 5, 7],
    shape: 'rise', span: 7,
    character: 'Straight climb to the octave. Wants a chorus; pair with dense rhythm for lift.',
  },
  fall_sigh: {
    degrees: [7, 'b5', 4, 2, 1, 0],
    shape: 'fall', span: 7, revised: 'audition-r1',
    character: 'Descending sigh from the octave through a FLAT 6th (Ethan: "flat the second note") — the darkened submediant is the sigh. In modes already carrying a b6 the alteration clamps off.',
  },
  zigzag_narrow: {
    degrees: [0, 2, 1, 3, 2, 4],
    shape: 'zigzag', span: 4,
    character: 'Two steps up, one back — motion that never leaves the pocket. Good under a vocal-like lead.',
  },
  pendulum_fifth: {
    degrees: [0, 4, 0, 4, 2, 0],
    shape: 'oscillation', span: 4,
    character: 'Root–fifth pendulum with a 3rd-degree passing exit. Bassline-shaped but works an octave up.',
  },
  spiral_up: {
    degrees: [0, 3, 1, 4, 3, 6, 5, 7],
    shape: 'rise', span: 7, revised: 'audition-r1',
    character: 'Climb with shrinking backsteps (-2, then -1s) that lands ON the octave — the old data never gained real ground and got killed in audition r1. Tension climber with a summit.',
  },
  hook_drop: {
    degrees: [7, 7, 7, 4, 5, 4, 2, 0],
    shape: 'peak-fall', span: 7, revised: 'audition-r1',
    character: 'The hook IS the repeated top note (octave ×3), then the drop: down to the 5th, a turn, and a stepwise tumble home. Audition r1 killed the old arpeggio-shaped version.',
  },
  valley: {
    degrees: [4, 2, 0, 0, 2, 4],
    shape: 'valley', span: 4,
    character: 'Inverse arch — descends into the root, sits, climbs out. The held root in the middle is the point.',
  },
  bass_root_five: {
    degrees: [0, 0, 4, 0],
    shape: 'static', span: 4,
    character: 'Root-root-fifth-root. The most boring line in music, which is why it works under everything.',
  },
  dorian_lift: {
    degrees: [0, 2, 3, 4, 5, 4, 2, 0],
    shape: 'arch', span: 5, revised: 'audition-r1',
    character: 'Arch that peaks on degree 5 — the actual 6th scale degree, dorian\'s raised 6th, the one note that names the mode. (Old data was off by one and peaked on the 7th; audition r1 caught it.)',
  },
  minimal_dyad: {
    degrees: [0, 3, 0, 3],
    shape: 'oscillation', span: 3,
    character: 'Root–fourth-degree seesaw. Hypnotic; for breakdowns and lo-fi where less is the material.',
  },
  question_answer: {
    degrees: [0, 2, 4, 2, 4, 5, 4, 0],
    shape: 'arch', span: 5,
    character: 'Two four-note halves: the first ends open (on the 3rd), the second answers home. Phrase logic built in.',
  },
};

/** Retrieval by shape/span, not by name. */
export function findContours({ shape = null, minSpan = 0, maxSpan = Infinity } = {}) {
  const out = [];
  for (const [name, entry] of Object.entries(CONTOURS)) {
    if (shape && entry.shape !== shape) continue;
    if (entry.span < minSpan || entry.span > maxSpan) continue;
    out.push({ name, entry });
  }
  return out;
}
