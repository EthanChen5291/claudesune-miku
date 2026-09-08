// Song applicability labels — r30, from HIS RULING this round.
//
// Verbatim: "no i mean label-wise for that song, x song could also be used
// given other various prompts rather than specific that one. so that
// instrument preset and pattern and what not works."
//
// The correction matters as much as the feature: his four r28 "could be
// abstracted to any dark/calm/epic environment" notes were first read as an
// engine-redesign ask (core(mood,energy) x tint(environment)) and planned as
// one. They are not. A song he likes is a FINISHED OBJECT — preset, patterns,
// mix — and what he wants widened is its LABEL: the set of prompts it may be
// served for. This file is that label, and nothing else.
//
// RULES (each one is load-bearing):
// - A label exists ONLY where one of his notes justifies it, and carries the
//   note verbatim in `source`. A song he has not spoken about has no entry —
//   inventing a label is inventing a verdict.
// - Labels are read BY NAME, never iterated or length-indexed (the
//   techniques.js rule, D101/D95): adding one can never re-roll a song.
// - Serving a labelled song for a new prompt means serving THE SONG — same
//   notes, same preset. If higher energy is wanted, parts are ADDED ON TOP
//   ("if it's energetic just add the percussive strings ... + percussion and
//   boom"); the base is never regenerated.
// - Niche lanes never receive a served song (his r27 ruling; nicheLane gate).
//
// moodClass vocabulary is HIS, from the r28 export: dark / calm / epic /
// somber. No 'bright' — no card justifies it yet.

/** Lanes a served song must never reach. Same set as the generator's gate. */
export const NICHE_LANES = new Set(['desert', 'jungle', 'manor', 'catacombs', 'citadel']);

/** The environments each mood class covers. CASUAL lanes only, enumerated —
 *  "any dark environment" cannot mean desert (it has its own researched
 *  language), so 'any' resolves against this closed set. */
export const MOOD_CLASS_LANES = {
  dark: ['space', 'lab', 'stealth', 'cave', 'aftermath', 'boss'],
  calm: ['water', 'menu', 'rest', 'snow', 'shrine', 'shop'],
  somber: ['rest', 'snow', 'aftermath', 'space', 'menu'],
  epic: ['boss', 'fight', 'festival', 'training', 'construction', 'space'],
};

export const MOOD_CLASS_EMOTIONS = {
  dark: ['mysterious', 'tense', 'scary'],
  calm: ['calm', 'serene', 'nostalgic'],
  somber: ['somber', 'nostalgic'],
  epic: ['triumphant', 'excited', 'tense'],
};

export const SONG_LABELS = {
  ls_stepwise_floor_mysterious: {
    page: 'r28-layerstack', generatedFor: { emotion: 'mysterious', environment: 'space' },
    moodClass: 'dark', energy: 'low',
    source: 'r28 card: "I like the layering, the main synth is sometimes too loud but I like the melody and the layering of all the instruments. could also be abstracted to any dark environment, and if high energy, ithe appropriate instruments and parts can be added"',
  },
  ls_stepwise_floor_calm: {
    page: 'r28-layerstack', generatedFor: { emotion: 'calm', environment: 'water' },
    moodClass: 'calm', energy: 'low',
    source: 'r28 card: "it fits the vibe but is more of a \\"calm\\" environment and can be abstracted beyond calm water to any environment that\'s calm (it fits water but if anything the sawtooth synth doesn\'t fit too well but its fine)"',
  },
  ls_iii_vi_v_mysterious: {
    page: 'r28-layerstack', generatedFor: { emotion: 'mysterious', environment: 'space' },
    moodClass: 'epic', energy: 'mid',
    source: 'r28 card: "this song melody and harmony is really good. it can be abstracted to anything epic though and if it\'s energetic just add the percussive strings I mentioned with their repeated intervals + percussion and boom"',
  },
  ls_descend_iv_v_somber: {
    page: 'r28-layerstack', generatedFor: { emotion: 'somber', environment: 'snow' },
    moodClass: 'somber', energy: 'low',
    source: 'r28 card: "this is a good song but doesn\'t really fit snow. more like somber in general but snow may be like a semi-niche area. it moreso works for like x somber environment"',
  },
  // r27 multi-lane notes — he named the extra lanes himself, so these carry an
  // explicit lane list instead of a class.
  cp_komuro_triumphant: {
    page: 'r27-vanriver', generatedFor: { emotion: 'triumphant', environment: 'festival' },
    servesEnvironments: ['festival', 'water', 'snow'], servesEmotions: ['triumphant', 'nostalgic', 'calm'],
    energy: 'mid',
    source: 'r27 card: "I like this vibe a lot actually ... fits triumphant festival but also like rainy festival or sunset environment or something"',
  },
  vr_moody_tense: {
    page: 'r27-vanriver', generatedFor: { emotion: 'tense', environment: 'stealth' },
    servesEnvironments: ['aftermath', 'rest', 'snow'], servesEmotions: ['somber', 'mysterious'],
    energy: 'low',
    source: 'r27 card: "doesn\'t convey tension or stealth, more like somber aftermath or sad haunting theme or rainy/moody day theme" — a RE-label: it serves those lanes INSTEAD of stealth, not as well',
    replacesOriginal: true,
  },
};

/** Songs whose label covers a prompt. Never a niche lane; deterministic order. */
export function songsFor({ emotion, environment } = {}) {
  if (environment && NICHE_LANES.has(environment)) return [];
  const out = [];
  for (const [name, l] of Object.entries(SONG_LABELS)) {
    const envs = l.servesEnvironments ?? MOOD_CLASS_LANES[l.moodClass] ?? [];
    const emos = l.servesEmotions ?? MOOD_CLASS_EMOTIONS[l.moodClass] ?? [];
    if (environment && !envs.includes(environment)) continue;
    if (emotion && !emos.includes(emotion)) continue;
    // unless it re-labels, the original prompt is served too
    const home = !l.replacesOriginal
      && (!environment || environment === l.generatedFor.environment)
      && (!emotion || emotion === l.generatedFor.emotion);
    out.push({ name, label: l, home });
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : 1));
}

/** Every prompt-pair a song's label covers — for the audition card's
 *  "also serves" line, so he can veto a widening he did not intend. */
export function servesLine(name) {
  const l = SONG_LABELS[name];
  if (!l) return null;
  const envs = l.servesEnvironments ?? MOOD_CLASS_LANES[l.moodClass] ?? [];
  const emos = l.servesEmotions ?? MOOD_CLASS_EMOTIONS[l.moodClass] ?? [];
  return `also serves (his label${l.moodClass ? `: "${l.moodClass}"` : ''}): `
    + `${emos.join('/')} × ${envs.join(', ')}`
    + `${l.replacesOriginal ? ' — INSTEAD of its original prompt (his re-label)' : ''}`;
}
