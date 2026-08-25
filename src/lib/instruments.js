// Instrument palette (D43) — the General MIDI voices the arranger may add ON
// TOP of the piano. The piano is never replaced: it carries the accompaniment
// (its own figuration) and, unless a layer explicitly takes the lead, the
// melody too. Everything here is additive.
//
// Each entry describes what the instrument IS, so a later edit pass can reason
// about it in words ("swap the pad for something warmer", "the bell is too
// bright") rather than about an opaque sound name. `character` is the human
// sentence; the rest are the properties the arranger ranks on.
//
//   family     bell | keys | pluck | wind | brass | string | pad | voice | synth
//   attack     how fast it speaks: 'quick' (percussive) | 'soft' | 'slow'
//   sustain    how long it rings unaided: 'short' | 'medium' | 'long'
//   cuts       0..1 — how well it is heard through a busy piano texture
//   weight     0..1 — how much sonic mass it adds (the arranger's budget unit)
//   range      [lo, hi] octaves it actually SOUNDS musical in (see below)
//   level      gain multiplier that brings this GM voice to parity (see below)
//   lanes      register lanes it sits well in, best first (see arrange.js)
//   parts      the arrangement parts it suits (arrange.js PART semantics)
//   moods      atlas vibe words it belongs with
//
// `range` (D46). A lane names a register in the arrangement — low/mid/lead/high
// — but an instrument has a tessitura of its own, and the two are not the same
// claim. Ethan's round-9 ear pass: "the musicbox should not be that high for
// melody — some songs it's too high, it sounds like a high pitch ring." It was
// landing on the 'high' lane, octave 6, in all 24 songs that cast it; a GM music
// box up there is a needle. The lane still proposes the octave, the instrument's
// range clamps it, and occupancy is then tracked by the OCTAVE THAT RESULTS
// rather than by the lane's name — otherwise two layers in nominally different
// lanes clamp onto the same octave and collide silently.
//
// `level` (D46). GM soundfonts are wildly uneven in absolute loudness, and
// `cuts` does not capture it: a flute has a bright, penetrating tone (cuts 0.75)
// and is still barely audible next to a piano sample. Ethan: "didn't really hear
// the flute" — it was in fact cast 34 times. This is the per-voice correction,
// measured by ear against the piano at the same gain: >1 means the soundfont is
// quiet and needs the level, <1 means it is loud and needs pulling back.
//
// Octave convention matches Strudel note names: 4 is the middle-C octave, the
// piano lead sits at 5, the piano accompaniment at 2-3.
//
// Availability: these are @strudel/soundfonts names, registered in the browser
// at runtime. If the soundfont module fails to load the audition runtime
// rewrites them to a bundled fallback rather than going silent.

export const INSTRUMENTS = {
  // ---- bell / struck metal ------------------------------------------------
  gm_music_box: {
    gm: 'gm_music_box', family: 'bell', attack: 'quick', sustain: 'medium',
    cuts: 0.85, weight: 0.25, range: [4, 5], level: 1.0, lanes: ['high', 'lead', 'mid'],
    parts: ['counter_melody', 'melody_backup', 'alternate_melody', 'melody_takeover'],
    moods: ['tender', 'eerie', 'nostalgic', 'innocent'],
    character: 'a wind-up music box: bright, fragile, slightly out of reach — the sound of a memory rather than a statement. Thin and shrill above the octave over middle C, so it is capped there.',
  },
  gm_celesta: {
    gm: 'gm_celesta', family: 'bell', attack: 'quick', sustain: 'medium',
    cuts: 0.8, weight: 0.25, range: [4, 6], level: 1.0, lanes: ['high', 'lead'],
    parts: ['counter_melody', 'melody_backup', 'alternate_melody'],
    moods: ['tender', 'magical', 'innocent'],
    character: 'a celesta: sweeter and rounder than a music box, bell-like without the clockwork.',
  },
  gm_vibraphone: {
    gm: 'gm_vibraphone', family: 'bell', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.4, range: [3, 5], level: 1.1, lanes: ['mid', 'high'],
    parts: ['counter_melody', 'additional_harmony', 'harmony_support', 'melody_backup'],
    moods: ['warm', 'relaxed', 'jazzy', 'nostalgic'],
    character: 'a vibraphone: warm struck metal that blooms and hangs — soft attack, long tail, easy to sit under a piano.',
  },
  gm_glockenspiel: {
    gm: 'gm_glockenspiel', family: 'bell', attack: 'quick', sustain: 'short',
    cuts: 0.95, weight: 0.2, range: [5, 6], level: 0.7, lanes: ['high'],
    parts: ['melody_backup', 'counter_melody'],
    moods: ['bright', 'playful', 'triumphant'],
    character: 'a glockenspiel: piercing and short — it decorates a line rather than carrying one, and it is loud, so it is held back.',
  },
  gm_tubular_bells: {
    gm: 'gm_tubular_bells', family: 'bell', attack: 'quick', sustain: 'long',
    cuts: 0.8, weight: 0.55, range: [3, 5], level: 0.85, lanes: ['mid', 'high'],
    parts: ['counter_melody', 'harmony_support'],
    moods: ['grave', 'sacred', 'ominous', 'epic'],
    character: 'tubular bells: a struck church bell — enormous, slow to die, ceremonial. One stroke a bar is usually all a song can carry.',
  },
  gm_marimba: {
    gm: 'gm_marimba', family: 'bell', attack: 'quick', sustain: 'short',
    cuts: 0.6, weight: 0.3, range: [3, 5], level: 1.15, lanes: ['mid', 'low'],
    parts: ['counter_melody', 'additional_harmony', 'alternate_melody'],
    moods: ['warm', 'playful', 'folk', 'relaxed'],
    character: 'a marimba: dry struck wood, round and quick — busy lines stay legible on it where a piano would smear.',
  },
  gm_xylophone: {
    gm: 'gm_xylophone', family: 'bell', attack: 'quick', sustain: 'short',
    cuts: 0.9, weight: 0.25, range: [5, 6], level: 0.8, lanes: ['high'],
    parts: ['counter_melody', 'melody_backup'],
    moods: ['quirky', 'playful', 'comic', 'bright'],
    character: 'a xylophone: hard, dry and comic — bones and skeletons, a marching toy. Cuts through anything and knows it.',
  },

  // ---- keys ---------------------------------------------------------------
  gm_epiano1: {
    gm: 'gm_epiano1', family: 'keys', attack: 'quick', sustain: 'medium',
    cuts: 0.65, weight: 0.45, range: [3, 5], level: 0.9, lanes: ['mid', 'lead'],
    parts: ['melody_takeover', 'alternate_melody', 'additional_harmony', 'melody_backup'],
    moods: ['warm', 'driving', 'retro'],
    character: 'an electric piano: bell-tinged and percussive, close enough to the piano to blend and different enough to be heard.',
  },
  gm_harpsichord: {
    gm: 'gm_harpsichord', family: 'keys', attack: 'quick', sustain: 'short',
    cuts: 0.75, weight: 0.35, range: [3, 5], level: 1.0, lanes: ['mid', 'lead'],
    parts: ['additional_harmony', 'counter_melody', 'alternate_melody'],
    moods: ['eerie', 'baroque', 'quirky', 'ominous'],
    character: 'a harpsichord: brittle plucked wire with no dynamics at all — courtly, and faintly sinister when the tempo is wrong for it.',
  },
  gm_church_organ: {
    gm: 'gm_church_organ', family: 'keys', attack: 'soft', sustain: 'long',
    cuts: 0.5, weight: 0.75, range: [2, 5], level: 0.85, lanes: ['low', 'mid'],
    parts: ['harmony_support', 'additional_harmony'],
    moods: ['sacred', 'grave', 'ominous', 'epic'],
    character: 'a pipe organ: unwavering sustained weight from the floor up — sacred or funereal, and it never breathes.',
  },
  gm_accordion: {
    gm: 'gm_accordion', family: 'keys', attack: 'soft', sustain: 'long',
    cuts: 0.65, weight: 0.5, range: [3, 5], level: 1.0, lanes: ['mid'],
    parts: ['harmony_support', 'counter_melody', 'additional_harmony'],
    moods: ['folk', 'quirky', 'nostalgic', 'warm'],
    character: 'an accordion: a wheezing reed chord that sustains and sags — village square, travelling show, slightly out of tune with the world.',
  },

  // ---- plucked ------------------------------------------------------------
  gm_acoustic_guitar_nylon: {
    gm: 'gm_acoustic_guitar_nylon', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.6, weight: 0.35, range: [3, 5], level: 1.1, lanes: ['mid'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['warm', 'intimate', 'folk'],
    character: 'a nylon-string guitar: soft plucked warmth, intimate at low volume.',
  },
  gm_orchestral_harp: {
    gm: 'gm_orchestral_harp', family: 'pluck', attack: 'quick', sustain: 'long',
    cuts: 0.55, weight: 0.4, range: [3, 5], level: 1.15, lanes: ['mid', 'high'],
    parts: ['additional_harmony', 'counter_melody', 'harmony_support'],
    moods: ['tender', 'dreamy', 'magical', 'sacred'],
    character: 'a harp: plucked but ringing, so a run of notes turns into a wash — the one plucked voice that can also be a pad.',
  },
  gm_pizzicato_strings: {
    gm: 'gm_pizzicato_strings', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.7, weight: 0.35, range: [3, 5], level: 1.1, lanes: ['low', 'mid'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['playful', 'quirky', 'tense', 'sneaking'],
    character: 'plucked strings: short, dry, conspiratorial — tiptoeing. All the section’s weight with none of its sustain.',
  },
  gm_kalimba: {
    gm: 'gm_kalimba', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.6, weight: 0.2, range: [4, 5], level: 1.2, lanes: ['mid', 'high'],
    parts: ['counter_melody', 'alternate_melody'],
    moods: ['playful', 'quirky', 'gentle'],
    character: 'a kalimba: small plucked tines, dry and round — friendly, never grand.',
  },

  // ---- wind ---------------------------------------------------------------
  gm_flute: {
    gm: 'gm_flute', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.75, weight: 0.35, range: [4, 5], level: 1.5, lanes: ['high', 'lead', 'mid'],
    parts: ['melody_takeover', 'alternate_melody', 'counter_melody', 'melody_backup'],
    moods: ['airy', 'pastoral', 'gentle', 'hopeful'],
    character: 'a flute: breathy sustained air on top — sings a line the piano can only strike. The GM sample is quiet and thins out high, so it is kept in its singing register and given the level to be heard.',
  },
  gm_recorder: {
    gm: 'gm_recorder', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.3, range: [4, 5], level: 1.35, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['innocent', 'pastoral', 'folk', 'gentle'],
    character: 'a recorder: a plain wooden whistle — childlike and slightly artless, which is exactly its charm.',
  },
  gm_pan_flute: {
    gm: 'gm_pan_flute', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.35, range: [4, 5], level: 1.3, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['lonely', 'spacious', 'pastoral', 'nostalgic'],
    character: 'a pan flute: breath you can hear, hollow and far away — distance and open country.',
  },
  gm_ocarina: {
    gm: 'gm_ocarina', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.75, weight: 0.3, range: [4, 5], level: 1.3, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['hopeful', 'magical', 'lonely', 'questing'],
    character: 'an ocarina: a pure round tone with no edge to it — a small instrument carrying a large feeling.',
  },
  gm_oboe: {
    gm: 'gm_oboe', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.85, weight: 0.4, range: [4, 5], level: 1.2, lanes: ['lead', 'high', 'mid'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['plaintive', 'lonely', 'nostalgic'],
    character: 'an oboe: reedy and vocal, cuts through anything, carries grief well.',
  },
  gm_clarinet: {
    gm: 'gm_clarinet', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.4, range: [3, 5], level: 1.25, lanes: ['mid', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody', 'harmony_support'],
    moods: ['warm', 'jazzy', 'quirky', 'relaxed'],
    character: 'a clarinet: woody and even across its whole range — the wind that blends instead of announcing itself.',
  },
  gm_bassoon: {
    gm: 'gm_bassoon', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.6, weight: 0.45, range: [2, 4], level: 1.25, lanes: ['low'],
    parts: ['counter_melody', 'harmony_support'],
    moods: ['comic', 'quirky', 'grave', 'dark'],
    character: 'a bassoon: a low reed that waddles — comic when it moves quickly, funereal when it does not.',
  },

  // ---- brass --------------------------------------------------------------
  gm_trumpet: {
    gm: 'gm_trumpet', family: 'brass', attack: 'quick', sustain: 'long',
    cuts: 0.9, weight: 0.55, range: [4, 5], level: 0.85, lanes: ['lead', 'high'],
    parts: ['melody_takeover', 'melody_backup', 'counter_melody'],
    moods: ['triumphant', 'heroic', 'epic', 'bright'],
    character: 'a trumpet: a bright declaration — nothing sits on top of it, so it either leads or stays out.',
  },
  gm_muted_trumpet: {
    gm: 'gm_muted_trumpet', family: 'brass', attack: 'quick', sustain: 'medium',
    cuts: 0.75, weight: 0.4, range: [4, 5], level: 1.1, lanes: ['mid', 'lead'],
    parts: ['counter_melody', 'alternate_melody', 'melody_takeover'],
    moods: ['jazzy', 'sly', 'retro', 'quirky'],
    character: 'a muted trumpet: the same declaration with a hand over it — sly, nocturnal, a smaller room.',
  },
  gm_french_horn: {
    gm: 'gm_french_horn', family: 'brass', attack: 'soft', sustain: 'long',
    cuts: 0.65, weight: 0.6, range: [3, 4], level: 1.1, lanes: ['mid', 'low'],
    parts: ['harmony_support', 'counter_melody', 'melody_takeover'],
    moods: ['noble', 'epic', 'hopeful', 'grave'],
    character: 'a french horn: round brass warmth from the middle of the orchestra — nobility without brightness.',
  },
  gm_trombone: {
    gm: 'gm_trombone', family: 'brass', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.6, range: [2, 4], level: 1.0, lanes: ['low'],
    parts: ['harmony_support', 'counter_melody'],
    moods: ['comic', 'grave', 'noble', 'dark'],
    character: 'a trombone: weight and slide — solemn held tones, or the single most comic instrument in the orchestra, depending entirely on tempo.',
  },

  // ---- bowed strings ------------------------------------------------------
  gm_violin: {
    gm: 'gm_violin', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.7, weight: 0.45, range: [4, 6], level: 1.2, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody', 'melody_backup'],
    moods: ['sad', 'sweeping', 'noble', 'plaintive'],
    character: 'a solo violin: a single singing line with a bow behind it — it swells where a piano decays, which is why it can take a melody over one.',
  },
  gm_viola: {
    gm: 'gm_viola', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.5, weight: 0.45, range: [3, 5], level: 1.25, lanes: ['mid'],
    parts: ['counter_melody', 'harmony_support', 'alternate_melody'],
    moods: ['warm', 'sad', 'grave', 'intimate'],
    character: 'a viola: the darker middle voice — it fills the space between a cello and a violin and rarely draws attention to itself.',
  },
  gm_cello: {
    gm: 'gm_cello', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.55, weight: 0.5, range: [2, 4], level: 1.2, lanes: ['low', 'mid'],
    parts: ['counter_melody', 'harmony_support', 'melody_takeover', 'alternate_melody'],
    moods: ['grave', 'warm', 'sad', 'noble'],
    character: 'a cello: a bowed low line with a slow swell — weight underneath without mud. It sings as readily as it supports, so it is allowed the tune and not only the floor.',
  },
  gm_contrabass: {
    gm: 'gm_contrabass', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.4, weight: 0.6, range: [1, 3], level: 1.3, lanes: ['low'],
    parts: ['harmony_support', 'counter_melody'],
    moods: ['dark', 'grave', 'ominous', 'sneaking'],
    character: 'a double bass: the floor of the arrangement — felt more than heard, and the cheapest way to make a room feel bigger.',
  },
  gm_tremolo_strings: {
    gm: 'gm_tremolo_strings', family: 'string', attack: 'soft', sustain: 'long',
    cuts: 0.5, weight: 0.6, range: [3, 5], level: 1.0, lanes: ['mid', 'low'],
    parts: ['harmony_support'],
    moods: ['tense', 'ominous', 'eerie', 'epic'],
    character: 'tremolo strings: a shivering held chord — pure suspense, and exhausting if it never resolves.',
  },
  gm_string_ensemble_1: {
    gm: 'gm_string_ensemble_1', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.4, weight: 0.7, range: [3, 5], level: 0.9, lanes: ['low', 'mid'],
    parts: ['harmony_support', 'additional_harmony'],
    moods: ['epic', 'sweeping', 'noble', 'sad'],
    character: 'a string section: broad sustained bed — the cheapest way to make something feel large, and the easiest way to make it mud.',
  },

  // ---- pads ---------------------------------------------------------------
  gm_pad_warm: {
    gm: 'gm_pad_warm', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.3, weight: 0.6, range: [2, 4], level: 1.0, lanes: ['low', 'mid'],
    parts: ['harmony_support'],
    moods: ['dreamy', 'calm', 'spacious', 'eerie'],
    character: 'a warm synth pad: no attack at all, pure sustain — atmosphere, never a line.',
  },
  gm_pad_halo: {
    gm: 'gm_pad_halo', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.35, weight: 0.55, range: [4, 6], level: 1.0, lanes: ['high', 'mid'],
    parts: ['harmony_support'],
    moods: ['ethereal', 'eerie', 'sacred', 'dreamy'],
    character: 'a halo pad: glassy and high, hovering — unearthly rather than warm.',
  },
  gm_pad_new_age: {
    gm: 'gm_pad_new_age', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.35, weight: 0.55, range: [3, 5], level: 1.0, lanes: ['mid', 'low'],
    parts: ['harmony_support'],
    moods: ['dreamy', 'spacious', 'calm', 'magical'],
    character: 'a new-age pad: a soft bell-tinged wash that sits in the middle — the pad that does not commit to warm or cold.',
  },
  gm_pad_bowed: {
    gm: 'gm_pad_bowed', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.4, weight: 0.6, range: [3, 5], level: 1.0, lanes: ['mid', 'low'],
    parts: ['harmony_support'],
    moods: ['tense', 'ominous', 'eerie', 'grave'],
    character: 'a bowed-glass pad: a swell with an edge on it — unease that grows rather than sits.',
  },

  // ---- voice --------------------------------------------------------------
  gm_choir_aahs: {
    gm: 'gm_choir_aahs', family: 'voice', attack: 'slow', sustain: 'long',
    cuts: 0.45, weight: 0.65, range: [3, 5], level: 0.9, lanes: ['mid'],
    parts: ['harmony_support'],
    moods: ['sacred', 'epic', 'eerie', 'tender'],
    character: 'a wordless choir: human sustain — instantly raises the stakes, tiring if it never stops.',
  },
  gm_voice_oohs: {
    gm: 'gm_voice_oohs', family: 'voice', attack: 'slow', sustain: 'long',
    cuts: 0.4, weight: 0.6, range: [3, 5], level: 1.0, lanes: ['mid', 'high'],
    parts: ['harmony_support', 'melody_backup'],
    moods: ['tender', 'dreamy', 'nostalgic', 'sacred'],
    character: 'rounded wordless voices: softer and further back than the aahs — presence without ceremony.',
  },

  // ---- synth --------------------------------------------------------------
  gm_lead_1_square: {
    gm: 'gm_lead_1_square', family: 'synth', attack: 'quick', sustain: 'long',
    cuts: 0.85, weight: 0.4, range: [4, 6], level: 0.8, lanes: ['lead', 'high'],
    parts: ['melody_takeover', 'melody_backup', 'counter_melody', 'alternate_melody'],
    moods: ['retro', 'driving', 'playful', 'bright'],
    character: 'a square-wave lead: the chiptune voice — flat, unwavering and instantly nostalgic for a machine that never existed.',
  },
  gm_lead_2_sawtooth: {
    gm: 'gm_lead_2_sawtooth', family: 'synth', attack: 'quick', sustain: 'long',
    cuts: 0.9, weight: 0.5, range: [3, 5], level: 0.8, lanes: ['lead', 'mid'],
    parts: ['melody_takeover', 'counter_melody'],
    moods: ['driving', 'dark', 'epic', 'retro'],
    character: 'a sawtooth lead: buzzing and aggressive — the sound of a boss deciding to stop being polite.',
  },
  gm_lead_3_calliope: {
    gm: 'gm_lead_3_calliope', family: 'synth', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.4, range: [4, 6], level: 1.1, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody', 'melody_backup'],
    moods: ['dreamy', 'airy', 'magical', 'gentle'],
    character: 'a calliope lead: a soft synthetic flute — breathy like a wind but perfectly steady, which no wind is.',
  },
  gm_synth_bass_1: {
    gm: 'gm_synth_bass_1', family: 'synth', attack: 'quick', sustain: 'short',
    cuts: 0.7, weight: 0.5, range: [1, 3], level: 0.85, lanes: ['low'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['driving', 'retro', 'dark'],
    character: 'a synth bass: dry and punchy underneath — reinforces the root without pedalling over it. Not a pad: it has no sustain to give.',
  },
  gm_acoustic_bass: {
    gm: 'gm_acoustic_bass', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.6, weight: 0.45, range: [1, 3], level: 1.15, lanes: ['low'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['jazzy', 'relaxed', 'warm', 'retro'],
    character: 'an upright bass: plucked wood with a little growl — walks rather than pedals, and swings where a synth bass drives.',
  },
};

/** instruments whose `parts` include this part */
export function instrumentsFor(part) {
  return Object.entries(INSTRUMENTS)
    .filter(([, e]) => e.parts.includes(part))
    .map(([name, e]) => ({ name, ...e }));
}
