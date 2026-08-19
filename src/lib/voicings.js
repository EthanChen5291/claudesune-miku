// Voicing-shape library (§3.5): offset strings compatible with Strudel's
// addVoicings format, so a shape drops straight into .dict(). Offsets are
// semitones from the chord root; each quality maps to one spatial SHAPE idea.
// Qualities covered = what the compiler emits: m7 m9 7 ^7 m 6 sus4 dim o.

export const VOICINGS = {
  closed_stack: {
    range: ['C3', 'C6'],
    shapes: {
      '': '0 4 7', m: '0 3 7', 7: '0 4 7 10', '^7': '0 4 7 11',
      m7: '0 3 7 10', m9: '0 3 7 10 14', 6: '0 4 7 9', sus4: '0 5 7', dim: '0 3 6', o: '0 3 6 9',
    },
    character: 'Plain close position. The reference voicing — use when the pad should disappear into the mix.',
  },
  drop2: {
    range: ['C3', 'C6'],
    shapes: {
      '': '-5 0 4', m: '-5 0 3', 7: '-2 0 4 10', '^7': '-1 0 4 11',
      m7: '-2 0 3 10', m9: '-2 0 3 10 14', 6: '-3 0 4 9', sus4: '-5 0 5', dim: '-6 0 3', o: '-6 0 3 9',
    },
    character: 'Second-from-top dropped an octave — the jazz piano warmth trick. Wider without mud.',
  },
  shell_37: {
    range: ['C3', 'C5'],
    shapes: {
      '': '4 7', m: '3 7', 7: '4 10', '^7': '4 11',
      m7: '3 10', m9: '3 10 14', 6: '4 9', sus4: '5 7', dim: '3 6', o: '3 6',
    },
    character: 'Rootless 3-and-7 shells (+9 on ninths). Lo-fi Rhodes language — the bass owns the root, stay out of its way.',
  },
  quartal_9: {
    range: ['C3', 'C6'],
    shapes: {
      '': '0 5 10', m: '3 8 13', 7: '4 9 14', '^7': '4 9 14',
      m7: '3 8 13', m9: '3 8 13 18', 6: '2 7 12', sus4: '0 5 10', dim: '3 6 11', o: '3 6 11',
    },
    character: 'Stacked fourths off the 3rd — the modern modal sound. Ambiguous on purpose; melts genre.',
  },
  spread_tenth: {
    range: ['C2', 'C6'],
    shapes: {
      '': '0 7 16', m: '0 7 15', 7: '0 10 16', '^7': '0 11 16',
      m7: '0 10 15', m9: '0 10 15 26', 6: '0 9 16', sus4: '0 7 17', dim: '0 6 15', o: '0 6 15',
    },
    character: 'Root, 7th/5th, 10th — wide open spread. Cinematic pads; leaves a canyon for the lead.',
  },
  power_sus: {
    range: ['C3', 'C6'],
    shapes: {
      '': '0 7 12', m: '0 7 12', 7: '0 7 12 17', '^7': '0 7 12 17',
      m7: '0 7 12 17', m9: '0 7 14 19', 6: '0 7 12', sus4: '0 5 12', dim: '0 6 12', o: '0 6 12',
    },
    character: 'Roots, fifths, octaves (+sus color on 7ths). Thirdless trance/supersaw fuel — huge and neutral.',
  },
  cluster_upper: {
    range: ['C4', 'C6'],
    shapes: {
      '': '7 11 14', m: '7 10 14', 7: '7 10 14', '^7': '7 11 14',
      m7: '7 10 14', m9: '10 14 15', 6: '7 9 14', sus4: '5 7 12', dim: '6 9 12', o: '6 9 12',
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
