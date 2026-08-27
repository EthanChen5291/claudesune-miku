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
// velRange: engine gains remap into this MIDI-velocity band per stem (the
// engine's mix balance is re-applied as the stem's mix volume instead), so
// soft pads still strike the samplers in their musical velocity range.
// trimDb: per-instrument balance nudge applied at the mix stage.
//
// Paths are repo-root-relative; scripts/render-hq.mjs existence-checks every
// patch at startup and falls back to fluid with a warning, so a missing
// library degrades instead of failing.

export const HQ_DEFAULTS = { velRange: [0.35, 0.9], trimDb: 0 };

export const HQ_INSTRUMENTS = {
  // --- sampled (tier 1: sfizz + SFZ libraries) ---
  piano: {
    backend: 'sfz',
    sfz: 'vendor/sfz/SalamanderGrandPiano-SFZ+FLAC-V3+20200602/SalamanderGrandPiano-V3+20200602.sfz',
    velRange: [0.25, 0.95],
  },
  gm_string_ensemble_1: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/strings-sections.sfz',
    velRange: [0.4, 0.85], trimDb: -2,
  },
  gm_flute: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/flute.sfz',
    velRange: [0.45, 0.85],
  },
  gm_orchestral_harp: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/harp.sfz',
    velRange: [0.35, 0.9],
  },
  gm_vibraphone: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/vibraphone.sfz',
    velRange: [0.35, 0.9],
  },
  gm_celesta: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/celesta.sfz',
    velRange: [0.35, 0.9],
  },
  gm_glockenspiel: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/glockenspiel.sfz',
    velRange: [0.35, 0.9],
  },
  gm_xylophone: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/xylophone.sfz',
    velRange: [0.35, 0.9],
  },
  gm_trumpet: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/trumpet.sfz',
    velRange: [0.45, 0.85],
  },

  // --- synths (tier 2: DawDreamer + Surge XT) ---
  // preset paths are Surge .fxp patches (fetched into vendor/patches/); an
  // absent preset renders Surge's init patch — functional, not curated.
  gm_synth_bass_1: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/bass.fxp', velRange: [0.5, 0.9],
  },
  sawtooth: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/bass.fxp', velRange: [0.5, 0.9],
  },
  gm_lead_1_square: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-square.fxp', velRange: [0.4, 0.85], trimDb: -4,
  },
  gm_lead_2_sawtooth: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-saw.fxp', velRange: [0.4, 0.85], trimDb: -4,
  },
  gm_pad_warm: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-warm.fxp', velRange: [0.4, 0.8], trimDb: -3,
  },
  square: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-square.fxp', velRange: [0.4, 0.85], trimDb: -4,
  },
};
