// Transition library (§3.5 — first-class, non-optional). Indexed by
// (from_role → to_role); '*' matches any. Two placements:
//   'before' — occupies the last `bars` cycles of the outgoing section (risers, fills)
//   'at'     — occupies the first `bars` cycles of the incoming section (impacts, subs, sweeps)
// Templates emit 1.1.0-safe, paste-ready expressions using only ubiquitous sample
// names (bd sd hh oh cp rim ht mt lt) and core signals (saw).

export const TRANSITIONS = {
  riser_hat_swell: {
    from: '*', to: 'chorus', kind: 'riser', label: 'riser', placement: 'before', bars: 2,
    make: (bars) => `s("hh*16").gain(saw.range(0.12, 0.72).slow(${bars})).lpf(saw.range(1500, 9000).slow(${bars})).pan(0.5)`,
    character: 'Hat roll that opens up — gain and filter climb together over the approach. The polite lift.',
  },
  riser_noise_sweep: {
    from: 'breakdown', to: 'chorus', kind: 'riser', label: 'riser', placement: 'before', bars: 4,
    make: (bars) => `s("white").gain(saw.range(0.04, 0.5).slow(${bars})).lpf(saw.range(300, 9000).slow(${bars})).attack(0.05).release(0.1)`,
    character: 'The EDM noise riser: four bars of white noise swelling out of a breakdown. Shameless, effective.',
  },
  fill_snare_roll: {
    from: '*', to: 'chorus', kind: 'fill', label: 'fill', placement: 'before', bars: 1,
    make: () => `s("sd*16").gain(saw.range(0.3, 0.95)).lpf(4000)`,
    character: 'One-bar 16th snare roll, strict crescendo. Says "here it comes" in every genre since disco.',
  },
  fill_tom_run: {
    from: '*', to: '*', kind: 'fill', label: 'fill', placement: 'before', bars: 1,
    make: () => `s("[ht ht] [mt mt] [lt lt] [sd sd]").gain(saw.range(0.55, 0.95)).speed("1 1 1 1.02")`,
    character: 'Descending tom run ending on doubled snares — the acoustic-kit answer to the snare roll.',
  },
  impact_boom: {
    from: '*', to: '*', kind: 'impact', label: 'impact', placement: 'at', bars: 1,
    make: () => `s("bd, oh").speed("0.6, 0.45").gain("0.95, 0.6").room(0.5)`,
    character: 'Downbeat punctuation: pitched-down kick boom plus a splashy open hat. Lands the arrival.',
  },
  sweep_downlifter: {
    from: 'chorus', to: '*', kind: 'sweep', label: 'sweep', placement: 'at', bars: 1,
    make: () => `s("oh*8").gain(saw.range(0.55, 0.05)).lpf(saw.range(7000, 500)).pan(saw.range(0.3, 0.7))`,
    character: 'Energy exhaust after a chorus — everything falls (gain, filter) across the first bar of the calmer section.',
  },
  sub_drop: {
    from: 'breakdown', to: 'chorus', kind: 'impact', label: 'impact', placement: 'at', bars: 1,
    make: () => `note("<c1>").s("sine").gain(0.85).release(0.4).lpf(150)`,
    character: 'Sub boom on the drop downbeat. Felt more than heard; the reward for the withheld low end.',
  },
};

/** Find transition entries for a role boundary. Exact role match beats wildcard. */
export function findTransitions(fromRole, toRole) {
  const score = (e) => (e.from === fromRole ? 2 : e.from === '*' ? 0 : -1)
    + (e.to === toRole ? 2 : e.to === '*' ? 0 : -1);
  return Object.entries(TRANSITIONS)
    .map(([name, e]) => ({ name, entry: e, score: score(e) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
}
