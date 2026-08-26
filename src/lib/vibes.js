// Vibe = EMOTION × ENVIRONMENT (D63; design: research/design-vibes.md).
//
// EMOTION is a TRANSFORM (mode, tempo multiplier, register shift, percussion
// scaling, chromaticism pull); ENVIRONMENT is the MATERIAL (role, tempo range,
// timbre bias, figuration classes, percussion profile, ensemble size). The
// model's proof case is Undertale's genocide shops: same environment material,
// the sad transform applied (×0.65 tempo, −1 octave, percussion stripped).
//
// Every entry is a CANDIDATE (A6.1): `ratified: false`, `character: null`
// until generated songs pass the ear. Vocabulary discipline (D46): every leaf
// word here already exists elsewhere — moods ⊆ instruments.js words, tags ⊆
// the ldrolez tag set, roles ⊆ arrange.js roles, figClasses ⊆ the figuration
// class vocabulary (foundation pack included), percussion.patterns ⊆
// rhythms.js `role:'percussion'` names. Nothing is renamed; this file only
// REFERENCES. test/vibes.test.js enforces closure.
//
// ENSEMBLE (D62): size is a DIAL, not an enum — `layers: [lo, hi]` is the
// range of ADDED voices (beyond the piano accompaniment + lead) a section may
// carry; compileVibe hash-picks a count in range. Named anchors (solo/duet/
// groove/bed/full) survive as requestable configurations.

const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };

export const EMOTIONS = {
  happy: {
    family: 'major', tempoMul: 1.0, registerDelta: 0, percMul: 1, colorBias: 0,
    artic: 'detached', pedal: false,
    moods: ['warm', 'bright', 'playful', 'hopeful'], tags: ['Joyful', 'Hopeful', 'Playful'],
    ratified: false, character: null,
  },
  sad: {
    // the genocide transform: slower, lower, percussion stripped
    family: 'minor', tempoMul: 0.65, registerDelta: -1, percMul: 0, colorBias: 0,
    artic: 'legato', pedal: true,
    moods: ['sad', 'plaintive', 'lonely', 'tender'], tags: ['Sad', 'Lonely'],
    ratified: false, character: null,
  },
  calm: {
    family: null, tempoMul: 0.85, registerDelta: 0, percMul: 0.5, colorBias: 0,
    artic: 'legato', pedal: true,
    moods: ['calm', 'relaxed', 'gentle', 'spacious'], tags: ['Peaceful', 'Relaxed'],
    ratified: false, character: null,
  },
  excited: {
    family: 'major', tempoMul: 1.15, registerDelta: 0, percMul: 1.25, colorBias: 0,
    artic: 'staccato', pedal: false,
    moods: ['driving', 'bright', 'playful', 'epic'], tags: ['Excited', 'Joyful'],
    ratified: false, character: null,
  },
  tense: {
    family: 'minor', tempoMul: 1.05, registerDelta: 0, percMul: 1, colorBias: 0.3,
    artic: 'detached', pedal: false,
    moods: ['tense', 'ominous', 'dark', 'driving'], tags: ['Dark', 'Fearful'],
    ratified: false, character: null,
  },
  scary: {
    family: 'minor', tempoMul: 0.9, registerDelta: -1, percMul: 0.5, colorBias: 0.5,
    artic: 'legato', pedal: true,
    moods: ['eerie', 'ominous', 'grave', 'dark'], tags: ['Dark', 'Fearful', 'Mysterious'],
    ratified: false, character: null,
  },
  mysterious: {
    // MOOD CALIBRATION (D60): the Mysterious tags read too consonant — this
    // row must pull MORE chromaticism than the tag delivers, hence the 0.6
    family: 'modal', tempoMul: 0.9, registerDelta: 0, percMul: 0.5, colorBias: 0.6,
    artic: 'legato', pedal: true,
    moods: ['eerie', 'dreamy', 'magical', 'sly'], tags: ['Mysterious'],
    ratified: false, character: null,
  },
  triumphant: {
    family: 'major', tempoMul: 1.05, registerDelta: 0, percMul: 1.25, colorBias: 0,
    artic: 'detached', pedal: false,
    moods: ['triumphant', 'heroic', 'epic', 'noble'], tags: ['Triumphant', 'Empowered'],
    ratified: false, character: null,
  },
  nostalgic: {
    family: null, tempoMul: 0.9, registerDelta: 0, percMul: 0.75, colorBias: 0,
    artic: 'legato', pedal: true,
    moods: ['nostalgic', 'tender', 'retro', 'warm'], tags: ['Nostalgic'],
    ratified: false, character: null,
  },
  romantic: {
    family: 'major', tempoMul: 0.85, registerDelta: 0, percMul: 0.5, colorBias: 0.2,
    artic: 'legato', pedal: true,
    moods: ['tender', 'intimate', 'warm', 'dreamy'], tags: ['Romantic'],
    ratified: false, character: null,
  },
  somber: {
    family: 'minor', tempoMul: 0.6, registerDelta: -1, percMul: 0, colorBias: 0.1,
    artic: 'legato', pedal: true,
    moods: ['grave', 'sad', 'plaintive', 'sacred'], tags: ['Sad', 'Anguished', 'Dramatic'],
    ratified: false, character: null,
  },
  goofy: {
    family: 'major', tempoMul: 1.1, registerDelta: 1, percMul: 1, colorBias: 0.2,
    artic: 'staccato', pedal: false,
    moods: ['comic', 'quirky', 'playful', 'baroque'], tags: ['Playful', 'Surprised'],
    ratified: false, character: null,
  },
};

// figClasses reference the FOUNDATION class vocabulary (figurations-foundation.js)
// — the ratified accompaniment pool generation draws from.
export const ENVIRONMENTS = {
  shop: {
    role: 'shop', bpm: [90, 120], meters: ['4/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['jazzy', 'playful', 'folk', 'retro', 'quirky', 'relaxed'],
    instBias: {
      boost: ['gm_marimba', 'gm_vibraphone', 'gm_accordion', 'gm_kalimba', 'gm_epiano1', 'gm_acoustic_guitar_nylon', 'gm_pizzicato_strings', 'gm_muted_trumpet', 'gm_acoustic_bass', 'gm_xylophone'],
      avoid: ['gm_church_organ', 'gm_tubular_bells', 'gm_choir_aahs', 'gm_string_ensemble_1', 'gm_lead_2_sawtooth', 'gm_tremolo_strings'],
    },
    figClasses: ['oompah', 'block', 'comp'],
    percussion: { presence: 'light', patterns: ['tresillo', 'swung_lofi_hats'] },
    ensemble: { layers: [1, 3] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  fight: {
    role: 'battle', bpm: [140, 180], meters: ['4/4'], family: 'minor',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'foreground',
    envMoods: ['epic', 'driving', 'dark', 'tense', 'triumphant'],
    instBias: {
      boost: ['gm_lead_2_sawtooth', 'gm_lead_1_square', 'gm_synth_bass_1', 'gm_string_ensemble_1', 'gm_trumpet', 'gm_tremolo_strings'],
      avoid: ['gm_music_box', 'gm_celesta', 'gm_kalimba', 'gm_recorder', 'gm_pan_flute'],
    },
    figClasses: ['pulse', 'riff', 'broken_octave'],
    percussion: { presence: 'driving', patterns: ['sixteenth_drive', 'dembow', 'gallop_arp'] },
    ensemble: { layers: [2, 5] }, loopHint: [15, 30],
    ratified: false, character: null,
  },
  boss: {
    role: 'boss', bpm: [150, 185], meters: ['4/4'], family: 'minor',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'foreground',
    envMoods: ['epic', 'driving', 'dark', 'ominous', 'tense', 'heroic'],
    instBias: {
      boost: ['gm_church_organ', 'gm_choir_aahs', 'gm_tubular_bells', 'gm_lead_2_sawtooth', 'gm_tremolo_strings', 'gm_trombone', 'gm_string_ensemble_1'],
      avoid: ['gm_kalimba', 'gm_recorder', 'gm_music_box', 'gm_accordion'],
    },
    figClasses: ['oompah', 'pulse', 'broken_octave'],
    percussion: { presence: 'foreground', patterns: ['sixteenth_drive', 'gallop_arp', 'four_floor'] },
    ensemble: { layers: [3, 6] }, loopHint: [15, 30],
    ratified: false, character: null,
  },
  construction: {
    // role chase, NOT overworld — overworld's words are pastoral/airy/calm,
    // the opposite of a machine floor (CANDIDATE; override is first-class)
    role: 'chase', bpm: [100, 140], meters: ['4/4'], family: 'minor',
    register: { accOctave: 2, leadOctave: 4 }, salience: 'background',
    envMoods: ['driving', 'dark', 'retro', 'tense'],
    instBias: {
      boost: ['gm_synth_bass_1', 'gm_lead_2_sawtooth', 'gm_lead_1_square', 'gm_xylophone', 'gm_marimba', 'gm_harpsichord'],
      avoid: ['gm_orchestral_harp', 'gm_ocarina', 'gm_recorder', 'gm_pad_new_age', 'gm_choir_aahs', 'gm_voice_oohs'],
    },
    figClasses: ['pulse', 'riff'],
    percussion: { presence: 'foreground', patterns: ['four_floor', 'sixteenth_drive', 'anticipation_bass'] },
    ensemble: { layers: [1, 3], anchor: 'groove' }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  stealth: {
    role: 'chase', bpm: [70, 110], meters: ['4/4'], family: 'minor',
    register: { accOctave: 2, leadOctave: 4 }, salience: 'background',
    envMoods: ['sneaking', 'tense', 'ominous', 'sly'],
    instBias: {
      boost: ['gm_pizzicato_strings', 'gm_contrabass', 'gm_synth_bass_1', 'gm_pad_bowed', 'gm_muted_trumpet'],
      avoid: ['gm_trumpet', 'gm_glockenspiel', 'gm_xylophone'],
    },
    figClasses: ['dance_bass', 'walk', 'sustain'],
    percussion: { presence: 'light', patterns: ['two_step_kick', 'seven_pulse_223'] },
    ensemble: { layers: [1, 2] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  snow: {
    role: 'overworld', bpm: [60, 110], meters: ['4/4', '3/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['magical', 'innocent', 'bright', 'gentle', 'tender'],
    instBias: {
      boost: ['gm_celesta', 'gm_glockenspiel', 'gm_vibraphone', 'gm_music_box', 'gm_flute', 'gm_pad_halo'],
      avoid: ['gm_lead_2_sawtooth', 'gm_trombone', 'gm_synth_bass_1'],
    },
    figClasses: ['arp', 'oompah'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [1, 3] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  water: {
    role: 'overworld', bpm: [60, 90], meters: ['4/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['dreamy', 'spacious', 'calm', 'airy', 'ethereal'],
    instBias: {
      boost: ['gm_orchestral_harp', 'gm_epiano1', 'gm_pad_warm', 'gm_pad_halo', 'gm_voice_oohs', 'gm_vibraphone', 'gm_lead_3_calliope'],
      avoid: ['gm_xylophone', 'gm_glockenspiel', 'gm_trumpet', 'gm_harpsichord'],
    },
    figClasses: ['arp', 'sustain'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [1, 3] }, loopHint: [60, 120],
    ratified: false, character: null,
  },
  desert: {
    role: 'overworld', bpm: [80, 120], meters: ['4/4', '2/4'], family: 'modal',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'background',
    envMoods: ['lonely', 'spacious', 'eerie', 'questing'],
    instBias: {
      boost: ['gm_oboe', 'gm_acoustic_guitar_nylon', 'gm_contrabass', 'gm_pad_bowed', 'gm_kalimba'],
      avoid: ['gm_epiano1', 'gm_lead_1_square', 'gm_celesta'],
    },
    figClasses: ['dance_bass', 'sustain', 'walk'],
    percussion: { presence: 'light', patterns: ['tresillo', 'son_clave_3'] },
    ensemble: { layers: [1, 2] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  cave: {
    role: 'overworld', bpm: [50, 90], meters: ['4/4'], family: 'modal',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'background',
    envMoods: ['eerie', 'spacious', 'lonely', 'grave', 'dark'],
    instBias: {
      boost: ['gm_pad_warm', 'gm_kalimba', 'gm_orchestral_harp', 'gm_contrabass', 'gm_choir_aahs', 'gm_pan_flute'],
      avoid: ['gm_trumpet', 'gm_xylophone', 'gm_glockenspiel'],
    },
    figClasses: ['sustain', 'arp'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [0, 2], anchor: 'duet' }, loopHint: [60, 120],
    ratified: false, character: null,
  },
  lab: {
    role: 'character', bpm: [100, 140], meters: ['4/4'], family: 'minor',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['quirky', 'retro', 'eerie', 'driving'],
    instBias: {
      boost: ['gm_lead_1_square', 'gm_synth_bass_1', 'gm_lead_3_calliope', 'gm_epiano1', 'gm_harpsichord', 'gm_xylophone'],
      avoid: ['gm_accordion', 'gm_orchestral_harp', 'gm_cello'],
    },
    figClasses: ['arp', 'pulse'],
    percussion: { presence: 'driving', patterns: ['push_pull_16s', 'four_floor'] },
    ensemble: { layers: [1, 3] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  casino: {
    role: 'diegetic', bpm: [120, 160], meters: ['4/4'], family: 'major',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'background',
    envMoods: ['jazzy', 'sly', 'retro', 'playful'],
    instBias: {
      boost: ['gm_muted_trumpet', 'gm_vibraphone', 'gm_acoustic_bass', 'gm_epiano1', 'gm_clarinet', 'gm_trumpet'],
      avoid: ['gm_pad_warm', 'gm_church_organ', 'gm_ocarina'],
    },
    figClasses: ['oompah', 'comp', 'walk'],
    percussion: { presence: 'driving', patterns: ['swung_lofi_hats', 'backbeat_ghost', 'lazy_dilla'] },
    ensemble: { layers: [2, 4] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  festival: {
    role: 'town', bpm: [100, 140], meters: ['4/4', '2/4'], family: 'major',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'foreground',
    envMoods: ['folk', 'warm', 'bright', 'playful', 'triumphant'],
    instBias: {
      boost: ['gm_accordion', 'gm_trumpet', 'gm_recorder', 'gm_marimba', 'gm_xylophone', 'gm_acoustic_bass'],
      avoid: ['gm_pad_halo', 'gm_tremolo_strings', 'gm_music_box'],
    },
    figClasses: ['oompah', 'block', 'offbeat'],
    percussion: { presence: 'foreground', patterns: ['four_floor', 'son_clave_3', 'seven_hats_223'] },
    ensemble: { layers: [3, 6] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  kitchen: {
    role: 'joke', bpm: [110, 150], meters: ['4/4', '2/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'foreground',
    envMoods: ['comic', 'quirky', 'playful', 'baroque'],
    instBias: {
      boost: ['gm_xylophone', 'gm_pizzicato_strings', 'gm_bassoon', 'gm_trombone', 'gm_kalimba', 'gm_recorder'],
      avoid: ['gm_choir_aahs', 'gm_string_ensemble_1', 'gm_pad_bowed'],
    },
    figClasses: ['oompah', 'offbeat', 'block'],
    percussion: { presence: 'light', patterns: ['two_step_kick', 'tresillo'] },
    ensemble: { layers: [1, 3] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  training: {
    role: 'chase', bpm: [120, 150], meters: ['4/4'], family: 'major',
    register: { accOctave: 2, leadOctave: 5 }, salience: 'background',
    envMoods: ['driving', 'heroic', 'retro', 'bright'],
    instBias: {
      boost: ['gm_lead_1_square', 'gm_synth_bass_1', 'gm_trumpet', 'gm_epiano1', 'gm_marimba'],
      avoid: ['gm_music_box', 'gm_pad_warm', 'gm_orchestral_harp'],
    },
    figClasses: ['pulse', 'riff', 'broken_octave'],
    percussion: { presence: 'driving', patterns: ['four_floor', 'backbeat_ghost'] },
    ensemble: { layers: [2, 4] }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  rest: {
    role: 'cutscene', bpm: [50, 80], meters: ['4/4', '3/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['tender', 'calm', 'gentle', 'intimate', 'nostalgic'],
    instBias: {
      boost: ['gm_music_box', 'gm_celesta', 'gm_acoustic_guitar_nylon', 'gm_pad_warm', 'gm_voice_oohs', 'gm_vibraphone'],
      avoid: ['gm_trumpet', 'gm_lead_2_sawtooth', 'gm_xylophone', 'gm_glockenspiel'],
    },
    figClasses: ['arp', 'fingerpick', 'block'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [0, 1], anchor: 'duet' }, loopHint: [30, 60],
    ratified: false, character: null,
  },
  menu: {
    role: 'menu', bpm: [60, 120], meters: ['4/4'], family: 'major',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'background',
    envMoods: ['bright', 'magical', 'calm'],
    instBias: {
      boost: ['gm_celesta', 'gm_pad_new_age', 'gm_epiano1', 'gm_orchestral_harp', 'gm_lead_3_calliope'],
      avoid: ['gm_trombone', 'gm_tremolo_strings'],
    },
    figClasses: ['arp', 'block'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [0, 2] }, loopHint: [60, 120],
    ratified: false, character: null,
  },
  aftermath: {
    role: 'cutscene', bpm: [50, 75], meters: ['4/4'], family: 'minor',
    register: { accOctave: 3, leadOctave: 5 }, salience: 'foreground',
    envMoods: ['sad', 'plaintive', 'grave', 'intimate', 'tender'],
    instBias: {
      boost: ['gm_cello', 'gm_violin', 'gm_viola', 'gm_music_box', 'gm_oboe', 'gm_voice_oohs'],
      avoid: ['gm_lead_1_square', 'gm_lead_2_sawtooth', 'gm_xylophone', 'gm_glockenspiel', 'gm_trumpet', 'gm_synth_bass_1'],
    },
    figClasses: ['block', 'arp'],
    percussion: { presence: 'none', patterns: [] },
    ensemble: { layers: [0, 1], anchor: 'solo' }, loopHint: [30, 60],
    ratified: false, character: null,
  },
};

// tonic practice pools per family (keys census, research/keys-census.md —
// margin-weighted per-song counts; full policy module comes with design-keys)
export const KEY_POOLS = {
  major: { C: 9, G: 6, A: 5, 'A#': 5, D: 4, B: 4, E: 4, F: 4 },
  minor: { C: 11, E: 9, F: 8, G: 8, A: 8, 'A#': 6, D: 5, B: 5 },
  modal: { C: 9, G: 6, A: 5, 'A#': 5, D: 4, B: 4, E: 4, F: 4 },
};

const PRESENCE = ['none', 'light', 'driving', 'foreground'];
// how the accompaniment speaks when NO emotion says otherwise: wet spaces and
// tender scenes get the damper pedal; kinetic floors play short (D63)
const ENV_ARTIC = {
  water: ['legato', true], cave: ['legato', true], rest: ['legato', true],
  menu: ['legato', true], aftermath: ['legato', true], snow: ['legato', true],
  fight: ['staccato', false], training: ['staccato', false], kitchen: ['staccato', false],
  construction: ['detached', false], lab: ['detached', false], boss: ['detached', false],
  shop: ['detached', false], casino: ['detached', false], festival: ['detached', false],
  desert: ['legato', false], stealth: ['detached', false],
};
const weightedPick = (pool, h) => {
  const entries = Object.entries(pool);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = h % total;
  for (const [k, w] of entries) { if ((r -= w) < 0) return k; }
  return entries[0][0];
};

/** compileVibe({ emotion?, environment?, name, ...overrides }) → params patch.
 *  Environment material → emotion transform → explicit overrides. All picks
 *  hash on `name` (D32: no dice). Either axis may be null. */
export function compileVibe(spec = {}) {
  const { emotion = null, environment = null, name = 'song' } = spec;
  const emo = emotion ? EMOTIONS[emotion] : null;
  const env = environment ? ENVIRONMENTS[environment] : null;
  if (emotion && !emo) throw new Error(`unknown emotion "${emotion}"`);
  if (environment && !env) throw new Error(`unknown environment "${environment}"`);
  const notes = [];

  // 1. environment material
  const role = spec.role ?? env?.role ?? null;
  if (env) notes.push(`environment ${environment} → role ${env.role}${spec.role ? ` (overridden to ${spec.role})` : ''}`);
  let family = env?.family ?? 'major';
  const bpmRange = env?.bpm ?? [90, 130];
  let bpm = bpmRange[0] + (fnv(`${name}|bpm`) % (bpmRange[1] - bpmRange[0] + 1));
  const meters = env?.meters ?? ['4/4'];
  const meter = spec.meter ?? meters[fnv(`${name}|meter`) % meters.length];
  const register = { ...(env?.register ?? { accOctave: 2, leadOctave: 5 }) };
  let presence = env?.percussion.presence ?? 'none';
  const patterns = env?.percussion.patterns ?? [];
  const layersRange = env?.ensemble.layers ?? [1, 4];
  let moods = [...(env?.envMoods ?? [])];

  // 2. emotion transform
  if (emo) {
    if (emo.family) { family = emo.family; notes.push(`emotion ${emotion}: family → ${family}`); }
    bpm = Math.round(bpm * emo.tempoMul);
    if (emo.tempoMul !== 1) notes.push(`emotion ${emotion}: tempo ×${emo.tempoMul} → ${bpm} (env range may be escaped — that is the transform)`);
    register.leadOctave = Math.max(4, Math.min(6, register.leadOctave + emo.registerDelta));
    register.accOctave = Math.max(1, Math.min(3, register.accOctave + emo.registerDelta));
    const pIx = PRESENCE.indexOf(presence);
    const shifted = emo.percMul === 0 ? 0
      : emo.percMul < 1 ? Math.max(pIx > 0 ? 1 : 0, pIx - 1)
      : emo.percMul > 1 ? Math.min(PRESENCE.length - 1, pIx + (pIx > 0 ? 1 : 0)) : pIx;
    if (shifted !== pIx) notes.push(`emotion ${emotion}: percussion ${presence} → ${PRESENCE[shifted]}`);
    presence = PRESENCE[shifted];
    moods = [...emo.moods, ...moods.filter((m) => !emo.moods.includes(m))];
  }
  bpm = Math.max(50, Math.min(190, spec.bpm ?? bpm));

  // 3. remaining picks + overrides
  family = spec.family ?? family;
  const keyHint = spec.keyHint ?? weightedPick(KEY_POOLS[family] ?? KEY_POOLS.major, fnv(`${name}|tonic`));
  const figClasses = spec.figClasses ?? env?.figClasses ?? ['arp', 'block', 'oompah'];
  const lo = layersRange[0], hi = layersRange[1];
  const count = spec.ensembleCount ?? (lo + (fnv(`${name}|ensemble`) % (hi - lo + 1)));
  notes.push(`ensemble dial: ${count} added voice(s) in [${lo},${hi}]${env?.ensemble.anchor ? ` (anchor ${env.ensemble.anchor})` : ''}`);

  return {
    vibe: { emotion, environment },
    role, family, bpm, bpmRange, meter,
    keyHint,
    register,
    salience: env?.salience ?? 'background',
    moods,
    progTags: emo?.tags ?? [],
    colorBias: emo?.colorBias ?? 0,
    instBias: env?.instBias ?? null,
    figClasses,
    percussion: { presence, patterns: presence === 'none' ? [] : patterns },
    ensemble: { count, range: [lo, hi], anchor: env?.ensemble.anchor ?? null },
    articulation: emo
      ? { style: emo.artic, pedal: emo.pedal }
      : { style: (ENV_ARTIC[environment] ?? ['detached', false])[0], pedal: (ENV_ARTIC[environment] ?? ['detached', false])[1] },
    loopHint: env?.loopHint ?? [30, 60],
    notes,
  };
}

export function vibeNames() {
  return { emotions: Object.keys(EMOTIONS), environments: Object.keys(ENVIRONMENTS) };
}
