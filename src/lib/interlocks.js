// Interlock pairs (§3.5 — "the biggest musical risk in the whole design").
// Great grooves are co-designed: these pairs were chosen so each rhythm's onsets
// live in the partner's gaps (see scores in test/binder.test.js). Declaring a
// pair here tells checkInterlocks() the coincidences that DO exist are intended.

export const INTERLOCKS = [
  {
    name: 'house_pump',
    pair: ['four_floor', 'offbeat_bass_house'],
    rhythms: { a: 'four_floor', b: 'offbeat_8ths' },
    roles: { a: 'kick', b: 'bass' },
    character: 'Kick on the floor, bass breathing in every gap — 100% complementary. The house engine.',
  },
  {
    name: 'two_step_snap',
    pair: ['two_step_kick', 'backbeat_ghost'],
    rhythms: { a: 'two_step_kick', b: 'backbeat_ghost' },
    roles: { a: 'kick', b: 'snare' },
    character: 'UKG kick holes land exactly where the backbeat and its ghosts live. The ghosts drag, the kick shoves.',
  },
  {
    name: 'clave_push',
    pair: ['tresillo', 'anticipation_bass'],
    rhythms: { a: 'tresillo', b: 'anticipation_bass' },
    roles: { a: 'kick', b: 'bass' },
    character: 'Tresillo kick with a bass that anticipates the beats the kick skips. Shared downbeat is the anchor — everything else interlocks.',
  },
  {
    name: 'aksak_engine',
    pair: ['seven_pulse_223', 'seven_syncopated'],
    rhythms: { a: 'seven_pulse_223', b: 'seven_syncopated' },
    roles: { a: 'kick', b: 'melodic' },
    character: '7/8: the kick states 2+2+3, the line ghosts across the group boundaries. Together they make 7 feel inevitable.',
  },
  {
    name: 'dembow_ride',
    pair: ['dembow', 'sixteenth_drive'],
    rhythms: { a: 'dembow', b: 'sixteenth_drive' },
    roles: { a: 'composite', b: 'hat' },
    character: 'Dembow skeleton under continuous accented 16ths — the hats supply the grid the dembow syncopates against. Coincidences intended.',
  },
];

export function findInterlock(roleA, roleB) {
  return INTERLOCKS.filter((e) =>
    (e.roles.a === roleA && e.roles.b === roleB) || (e.roles.a === roleB && e.roles.b === roleA));
}

export function declaredPairsFor(labelsToRhythms) {
  // labelsToRhythms: { label: rhythmName } -> [[labelA, labelB], ...] for declared pairs
  const out = [];
  for (const e of INTERLOCKS) {
    const labels = Object.entries(labelsToRhythms);
    const a = labels.filter(([, r]) => r === e.rhythms.a).map(([l]) => l);
    const b = labels.filter(([, r]) => r === e.rhythms.b).map(([l]) => l);
    for (const la of a) for (const lb of b) if (la !== lb) out.push([la, lb]);
  }
  return out;
}
