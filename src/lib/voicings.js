// Voicing-shape library (§3.5): offset strings compatible with Strudel's
// addVoicings format, so a shape drops straight into .dict(). Offsets are
// semitones from the chord root; each quality maps to one spatial SHAPE idea.
//
// Quality keys are the IREAL dialect (D28) — 'sus' not 'sus4', 'o' (dim triad)
// and 'o7' (dim seventh), not 'dim'. The same chord symbol reaches BOTH the
// harmony timeline (.dict('ireal')) and a comp bind's .dict('me_*'), so a shape
// keyed 'sus4'/'dim' voiced fine while verification saw an empty chord set, and
// a symbol spelled for ireal made the shape emit silence. One dialect, both
// paths. Renaming those keys changed no shape VALUES.
//
// Qualities covered = what the compiler emits: m7 m9 7 ^7 m 6 sus o o7. The
// progression library needs 7 more (2 add9 5 69 madd9 m6) — adding them is
// ear-gated work (D28); lint names the missing quality when a song hits one.

export const VOICINGS = {
  closed_stack: {
    range: ['C3', 'C6'],
    shapes: {
      '': '0 4 7', m: '0 3 7', 7: '0 4 7 10', '^7': '0 4 7 11',
      m7: '0 3 7 10', m9: '0 3 7 10 14', 6: '0 4 7 9', sus: '0 5 7', o: '0 3 6', o7: '0 3 6 9',
    },
    character: 'Plain close position. The reference voicing — use when the pad should disappear into the mix.',
  },
  drop2: {
    range: ['C3', 'C6'],
    shapes: {
      '': '-5 0 4', m: '-5 0 3', 7: '-5 0 4 10', '^7': '-5 0 4 11',
      m7: '-5 0 3 10', m9: '-5 0 3 10 14', 6: '-5 0 4 9', sus: '-5 0 5', o: '-9 0 6', o7: '-9 0 6 9',
    },
    character: 'True drop-2: the FIFTH (second-from-top of the close core) dropped an octave — jazz warmth, solid bass note. Audition r1 caught the old shapes dropping the 7th, which put the leading tone / b7 a step under the root.',
  },
  shell_37: {
    range: ['C3', 'C5'],
    shapes: {
      '': '4 7', m: '3 7', 7: '4 10', '^7': '4 11',
      m7: '3 10', m9: '3 10 14', 6: '4 9', sus: '5 7', o: '3 6', o7: '3 6',
    },
    character: 'Rootless 3-and-7 shells (+9 on ninths). Lo-fi Rhodes language — the bass owns the root, stay out of its way.',
  },
  // quartal_9 and power_sus REMOVED — killed by ear in audition r1 (2026-08-19).
  spread_tenth: {
    range: ['C2', 'C6'],
    shapes: {
      '': '0 7 16', m: '0 7 15', 7: '0 10 16', '^7': '0 11 16',
      m7: '0 10 15', m9: '0 10 15 26', 6: '0 9 16', sus: '0 7 17', o: '0 6 15', o7: '0 6 15',
    },
    character: 'Root, 7th/5th, 10th — wide open spread. Cinematic pads; leaves a canyon for the lead.',
  },
  cluster_upper: {
    range: ['C4', 'C6'],
    shapes: {
      '': '7 11 14', m: '7 10 14', 7: '7 10 14', '^7': '7 11 14',
      m7: '7 10 14', m9: '10 14 15', 6: '7 9 14', sus: '5 7 12', o: '6 9 12', o7: '6 9 12',
    },
    character: 'Upper-structure cluster (5-7-9 region), no root, seconds allowed to rub. Dreamy; needs reverb.',
  },
};

/** Emit the addVoicings(...) source line that registers a shape in-song.
 *  Dictionary values must be ARRAYS of voicing strings (verified at 1.1.0 —
 *  string values register fine but .voicing() then reports "unknown chord"). */
export function voicingRegistration(name) {
  const v = VOICINGS[name];
  if (!v) throw new Error(`unknown voicing shape "${name}" (have: ${Object.keys(VOICINGS).join(', ')})`);
  const dict = Object.entries(v.shapes).map(([q, off]) => `'${q}': ['${off}']`).join(', ');
  return `addVoicings('me_${name}', { ${dict} }, ['${v.range[0]}', '${v.range[1]}'])`;
}
