// HQ render tier (D80): engine sound name -> offline render backend + patch.
//
// Three backends:
//   sfz    sampled instruments via sfizz_render (vendor/build/sfizz) playing
//          free SFZ libraries in vendor/sfz/ (Salamander piano, VSCO-2 CE
//          orchestra). Velocity carries the engine's gains, so the D78
//          accent/curve dynamics select real velocity layers.
//   vst    synth voices via DawDreamer (vendor/pyenv) hosting the local
//          Surge XT VST3 (vendor/plugins/, extracted from the plugins-only
//          zip — no system install). `preset` is a Surge .fxp patch path.
//   fluid  anything unmapped falls back to the D31 fluidsynth+GM path —
//          including drums, which keep General MIDI channel-10 mapping.
//
// velScale: MIDI velocity = the hap's ABSOLUTE gain x velScale (clamped) — the
// engine's ear-tuned mix balance maps straight onto the samplers' velocity
// curves (D80 addendum: stem-relative normalization stretched narrow gain
// bands to the top of the range — the aquatic flute complaint).
// trimDb: per-instrument balance nudge applied at the mix stage.
//
// Paths are repo-root-relative; scripts/render-hq.mjs existence-checks every
// patch at startup and falls back to fluid with a warning, so a missing
// library degrades instead of failing.

export const HQ_DEFAULTS = { velScale: 1, trimDb: 0 };

export const HQ_INSTRUMENTS = {
  // --- sampled (tier 1: sfizz + SFZ libraries) ---
  piano: {
    backend: 'sfz',
    sfz: 'vendor/sfz/SalamanderGrandPiano-SFZ+FLAC-V3+20200602/SalamanderGrandPiano-V3+20200602.sfz',
    velScale: 0.85,
  },
  gm_string_ensemble_1: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/strings-sections.sfz',
    velScale: 1, trimDb: -2,
  },
  gm_flute: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/flute.sfz',
    velScale: 0.8, trimDb: -3,
    // "on really high flute notes it should automatically be a bit softer
    // otherwise it hurts the ears" — taper velocity above E5
    highSoft: { above: 76, per: 0.02 },
  },
  gm_orchestral_harp: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/harp.sfz',
    velScale: 0.9,
  },
  gm_vibraphone: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/vibraphone.sfz',
    velScale: 1,
  },
  gm_celesta: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/celesta.sfz',
    velScale: 1,
  },
  gm_glockenspiel: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/glockenspiel.sfz',
    velScale: 1,
  },
  gm_xylophone: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/xylophone.sfz',
    velScale: 1,
  },
  gm_trumpet: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/trumpet.sfz',
    velScale: 0.9,
  },
  gm_bassoon: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/bassoon.sfz',
    velScale: 0.9,
  },
  gm_clarinet: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/clarinet.sfz',
    velScale: 0.9,
  },
  gm_oboe: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/oboe.sfz',
    velScale: 0.9,
  },
  gm_cello: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/strings-sections.sfz',
    velScale: 0.9, trimDb: -1,
  },

  // --- synths (tier 2: DawDreamer + Surge XT) ---
  // preset paths are Surge .fxp patches (fetched into vendor/patches/); an
  // absent preset renders Surge's init patch — functional, not curated.
  gm_synth_bass_1: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/bass.fxp', velScale: 1, trimDb: -1,
  },
  sawtooth: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/bass.fxp', velScale: 1, trimDb: -1,
  },
  gm_lead_1_square: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-square.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_lead_2_sawtooth: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-saw.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_pad_warm: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-warm.fxp', velScale: 0.9, trimDb: -3,
  },
  square: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-square.fxp', velScale: 0.9, trimDb: -4,
  },
};
