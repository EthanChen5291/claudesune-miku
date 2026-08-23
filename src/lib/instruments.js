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
//   family     bell | keys | pluck | wind | string | pad | voice
//   attack     how fast it speaks: 'quick' (percussive) | 'soft' | 'slow'
//   sustain    how long it rings unaided: 'short' | 'medium' | 'long'
//   cuts       0..1 — how well it is heard through a busy piano texture
//   weight     0..1 — how much sonic mass it adds (the arranger's budget unit)
//   lanes      register lanes it sits well in, best first (see arrange.js)
//   parts      the arrangement parts it suits (arrange.js PART semantics)
//   moods      atlas vibe words it belongs with
//
// Availability: these are @strudel/soundfonts names, registered in the browser
// at runtime. If the soundfont module fails to load the audition runtime
// rewrites them to a bundled fallback rather than going silent.

export const INSTRUMENTS = {
  gm_music_box: {
    gm: 'gm_music_box', family: 'bell', attack: 'quick', sustain: 'medium',
    cuts: 0.85, weight: 0.25, lanes: ['high', 'lead'],
    parts: ['counter_melody', 'melody_backup', 'alternate_melody'],
    moods: ['tender', 'eerie', 'nostalgic', 'innocent'],
    character: 'a wind-up music box: bright, fragile, slightly out of reach — the sound of a memory rather than a statement.',
  },
  gm_celesta: {
    gm: 'gm_celesta', family: 'bell', attack: 'quick', sustain: 'medium',
    cuts: 0.8, weight: 0.25, lanes: ['high', 'lead'],
    parts: ['counter_melody', 'melody_backup', 'alternate_melody'],
    moods: ['tender', 'magical', 'innocent'],
    character: 'a celesta: sweeter and rounder than a music box, bell-like without the clockwork.',
  },
  gm_vibraphone: {
    gm: 'gm_vibraphone', family: 'bell', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.4, lanes: ['mid', 'high'],
    parts: ['counter_melody', 'additional_harmony', 'harmony_support', 'melody_backup'],
    moods: ['warm', 'relaxed', 'jazzy', 'nostalgic'],
    character: 'a vibraphone: warm struck metal that blooms and hangs — soft attack, long tail, easy to sit under a piano.',
  },
  gm_glockenspiel: {
    gm: 'gm_glockenspiel', family: 'bell', attack: 'quick', sustain: 'short',
    cuts: 0.95, weight: 0.2, lanes: ['high'],
    parts: ['melody_backup', 'counter_melody'],
    moods: ['bright', 'playful', 'triumphant'],
    character: 'a glockenspiel: piercing and short — it decorates a line rather than carrying one.',
  },
  gm_kalimba: {
    gm: 'gm_kalimba', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.6, weight: 0.2, lanes: ['mid', 'high'],
    parts: ['counter_melody', 'alternate_melody'],
    moods: ['playful', 'quirky', 'gentle'],
    character: 'a kalimba: small plucked tines, dry and round — friendly, never grand.',
  },
  gm_epiano1: {
    gm: 'gm_epiano1', family: 'keys', attack: 'quick', sustain: 'medium',
    cuts: 0.65, weight: 0.45, lanes: ['mid', 'lead'],
    parts: ['melody_takeover', 'alternate_melody', 'additional_harmony', 'melody_backup'],
    moods: ['warm', 'driving', 'retro'],
    character: 'an electric piano: bell-tinged and percussive, close enough to the piano to blend and different enough to be heard.',
  },
  gm_acoustic_guitar_nylon: {
    gm: 'gm_acoustic_guitar_nylon', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.6, weight: 0.35, lanes: ['mid'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['warm', 'intimate', 'folk'],
    character: 'a nylon-string guitar: soft plucked warmth, intimate at low volume.',
  },
  gm_flute: {
    gm: 'gm_flute', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.75, weight: 0.35, lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'alternate_melody', 'counter_melody'],
    moods: ['airy', 'pastoral', 'gentle', 'hopeful'],
    character: 'a flute: breathy sustained air on top — sings a line the piano can only strike.',
  },
  gm_oboe: {
    gm: 'gm_oboe', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.85, weight: 0.4, lanes: ['lead', 'high'],
    parts: ['melody_takeover', 'counter_melody'],
    moods: ['plaintive', 'lonely', 'nostalgic'],
    character: 'an oboe: reedy and vocal, cuts through anything, carries grief well.',
  },
  gm_cello: {
    gm: 'gm_cello', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.55, weight: 0.5, lanes: ['low'],
    parts: ['counter_melody', 'harmony_support'],
    moods: ['grave', 'warm', 'sad', 'noble'],
    character: 'a cello: a bowed low line with a slow swell — weight underneath without mud.',
  },
  gm_string_ensemble_1: {
    gm: 'gm_string_ensemble_1', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.4, weight: 0.7, lanes: ['low', 'mid'],
    parts: ['harmony_support', 'additional_harmony'],
    moods: ['epic', 'sweeping', 'noble', 'sad'],
    character: 'a string section: broad sustained bed — the cheapest way to make something feel large, and the easiest way to make it mud.',
  },
  gm_pad_warm: {
    gm: 'gm_pad_warm', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.3, weight: 0.6, lanes: ['low', 'mid'],
    parts: ['harmony_support'],
    moods: ['dreamy', 'calm', 'spacious', 'eerie'],
    character: 'a warm synth pad: no attack at all, pure sustain — atmosphere, never a line.',
  },
  gm_pad_halo: {
    gm: 'gm_pad_halo', family: 'pad', attack: 'slow', sustain: 'long',
    cuts: 0.35, weight: 0.55, lanes: ['mid', 'high'],
    parts: ['harmony_support'],
    moods: ['ethereal', 'eerie', 'sacred', 'dreamy'],
    character: 'a halo pad: glassy and high, hovering — unearthly rather than warm.',
  },
  gm_choir_aahs: {
    gm: 'gm_choir_aahs', family: 'voice', attack: 'slow', sustain: 'long',
    cuts: 0.45, weight: 0.65, lanes: ['mid'],
    parts: ['harmony_support'],
    moods: ['sacred', 'epic', 'eerie', 'tender'],
    character: 'a wordless choir: human sustain — instantly raises the stakes, tiring if it never stops.',
  },
  gm_synth_bass_1: {
    gm: 'gm_synth_bass_1', family: 'keys', attack: 'quick', sustain: 'short',
    cuts: 0.7, weight: 0.5, lanes: ['low'],
    parts: ['additional_harmony'],
    moods: ['driving', 'retro', 'dark'],
    character: 'a synth bass: dry and punchy underneath — reinforces the root without pedalling over it. Not a pad: it has no sustain to give.',
  },
};

/** instruments whose `parts` include this part */
export function instrumentsFor(part) {
  return Object.entries(INSTRUMENTS)
    .filter(([, e]) => e.parts.includes(part))
    .map(([name, e]) => ({ name, ...e }));
}
