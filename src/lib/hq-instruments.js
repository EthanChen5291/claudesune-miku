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

// r34 ELECTRIC GUITAR: Unreal Instruments "Standard Guitar" (vendor/sfz/unreal,
// licence-free per its notice) is a DI library — the raw pickup signal, with
// keyswitched articulations (sw_last: C1 sustain-down, D1 sustain-alternate,
// D#1 palm-mute-down; sw_default is F0 = SILENT, so every stem's MIDI must
// open with its keyswitch, which render-hq injects from `keyswitch`). The
// amp is a Neural Amp Modeler capture (vendor/nam-models, GPL v3) applied
// after sfizz by scripts/guitar-amp.py through `fx.nam`; captures named
// "Cab" carry their speaker cabinet. Playable range B1-D6 (35-86).
const UI_GUITAR = 'vendor/sfz/unreal/UI_Standard_Guitar/Programs/01-Standard Guitar KSOP.sfz';

export const HQ_INSTRUMENTS = {
  gm_electric_guitar_clean: {
    // velScale 1.6: the clean arpeggio is written soft (0.29-0.38) and the
    // library's velocity curve + fil_veltrack close down hard below ~45/127
    backend: 'sfz', sfz: UI_GUITAR, keyswitch: 26, velScale: 1.6, trimDb: -2,
    fx: { nam: 'vendor/nam-models/Phillipe_P_Bug333-Clean-Cab-ESR0.007.nam', inGainDb: 6 },
  },
  gm_electric_guitar_muted: {
    backend: 'sfz', sfz: UI_GUITAR, keyswitch: 27, velScale: 1, trimDb: -1,
    fx: { nam: 'vendor/nam-models/Phillipe_P_Bug6262-Crunch-NoDrive-Cab-ESR0.004.nam', inGainDb: 12 },
  },
  gm_overdriven_guitar: {
    backend: 'sfz', sfz: UI_GUITAR, keyswitch: 26, velScale: 1, trimDb: -1,
    fx: { nam: 'vendor/nam-models/Phillipe_P_Bug6262-Crunch-NoDrive-Cab-ESR0.004.nam', inGainDb: 12 },
  },
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
  // r35: VSCO F Horn sustains (scripts/build-sfz.mjs) — off the fluidsynth
  // fallback, whose GM horn swells into every note (vg_nostalgic_shop's
  // "strings ... starts really soft and then becomes really loud", on a song
  // whose sustained support at that gain is the french horn harmony_support).
  gm_french_horn: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/horn.sfz',
    velScale: 0.9, trimDb: -2,
  },
  gm_cello: {
    backend: 'sfz',
    sfz: 'vendor/sfz/gen/strings-sections.sfz',
    velScale: 0.9, trimDb: -1,
  },
  // D90 (his string-melody directive): the violin voice rides the same VSCO
  // section patch — the browser tier has its own GM violin; in HQ, walks above
  // the patch's G#5 ceiling fold down an octave (D83) rather than vanish.
  gm_violin: {
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

  // --- D85 synth palette (his "serum vst synths" ask; Surge factory patches
  // fetched from the release_xt_1.3.4 tag — patches from main are streamed by
  // a NEWER Surge and load as silence-vs-init on our 1.3.4 build). Browser
  // side plays the GM soundfont / native synth of the same name; each patch
  // below was probe-rendered and its envelope/centroid verified to match the
  // category before wiring (scratchpad probe3, 2026-08-27).
  gm_slap_bass_2: {
    // the bouncy funk bass: Surge "Rubber Bass" — punchy hold, fast release
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/rubber-bass.fxp', velScale: 0.95, trimDb: -1,
  },
  supersaw: {
    // Surge "Tarnce" — bright unison saws (browser: native supersaw synth)
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/supersaw.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_kalimba: {
    // synth pluck motor/hook voice: Surge "Trancy" (decays ~-20dB by 1s)
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pluck.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_music_box: {
    // high sparkle/chime layer: Surge "Magic Music Box"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/sparkle.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_synth_strings_1: {
    // synth-strings cushion: Surge "Juno-60 Strings" (slow attack, long tail);
    // strings support stays whisper-quiet in the mix (the four "too loud" notes)
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/juno-strings.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_epiano1: {
    // upgraded from the fluid GM fallback: Surge "Soft Suitcase" Rhodes
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/epiano.fxp', velScale: 0.9, trimDb: -2,
  },
  // D86: the fully-synth songs cast GM synth pads the fluid fallback would
  // have rendered — both now play real Surge pads (probe-verified)
  gm_pad_new_age: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-bell.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_pad_bowed: {
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-warm.fxp', velScale: 0.9, trimDb: -3,
  },

  // --- genre-expansion round (2026-08-27): patches fetched from the
  // release_xt_1.3.4 tag (the D85 law) and probe-verified — every one
  // rendered a measured spectrum distinct from the init patch before wiring.
  gm_pad_halo: {
    // space pad: Surge "Computers In Space"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-space.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_pad_metallic: {
    // horror dread bed: Surge "Ghost Pad"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-ghost.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_pad_sweep: {
    // evolving low drone: Surge "Eighties Drone" (built-in slow movement)
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/drone-eighties.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_fx_echoes: {
    // sensor blips w/ delay baked into the patch: Surge "Delay Pops 1"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/blip-delay.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_fx_sci_fi: {
    // alien FM metallic: Surge "Metallic"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pluck-metallic.fxp', velScale: 0.9, trimDb: -4,
  },
  gm_church_organ: {
    // epic-horror organ: Surge "Church"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/organ-church.fxp', velScale: 0.9, trimDb: -2,
  },
  gm_pad_choir: {
    // synth-choir pad: Surge "Synth Choir MW O-Ah"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/pad-choir-synth.fxp', velScale: 0.9, trimDb: -3,
  },
  gm_lead_5_charang: {
    // playful chip PWM: Surge "Crisp PWM"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-pwm.fxp', velScale: 0.85, trimDb: -2,
  },
  gm_lead_6_voice: {
    // talky meme lead: Surge "Talky 1 MW"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-talky.fxp', velScale: 0.85, trimDb: -2,
  },
  gm_slap_bass_1: {
    // playful FM slap: Surge "FM Slap"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/bass-fmslap.fxp', velScale: 0.9, trimDb: -1,
  },
  gm_shanai: {
    // desert double reed: Surge "Shanai" (a factory patch by that name)
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/lead-shanai.fxp', velScale: 0.85, trimDb: -2,
  },
  gm_pan_flute: {
    // breathy ethno wind: Surge "Fake Ethno"
    backend: 'vst', plugin: 'vendor/plugins/Surge XT.vst3',
    preset: 'vendor/patches/wind-ethno.fxp', velScale: 0.85, trimDb: -3,
  },
  // gm_sitar stays on the fluid fallback intentionally: GeneralUser GS 104 is
  // a real sitar sample; the Surge "East" pluck (vendored as pluck-east.fxp)
  // is available if his ear rejects it.

  // --- SSO chorus (CC Sampling Plus 1.0, vendored to vendor/sfz/SSO-Chorus;
  // gen/*.sfz built by scripts/build-choir-sfz.mjs, probe-rendered non-silent)
  gm_choir_aahs: {
    backend: 'sfz', sfz: 'vendor/sfz/gen/choir-mixed.sfz',
    velScale: 0.9, trimDb: -3,
  },
  choir_male: {
    backend: 'sfz', sfz: 'vendor/sfz/gen/choir-male.sfz',
    velScale: 0.9, trimDb: -2,
  },
  choir_female: {
    backend: 'sfz', sfz: 'vendor/sfz/gen/choir-female.sfz',
    velScale: 0.9, trimDb: -3,
  },
  gm_marimba: {
    // the jungle/desert-floor voice — VSCO-2 CE marimba (gen sfz this round)
    backend: 'sfz', sfz: 'vendor/sfz/gen/marimba.sfz',
    velScale: 0.9, trimDb: -1,
  },
};

// --- wav backend: the local sample pack (hx_* horror fx, vc_* percussion) ---
// render-hq places the ORIGINAL wav at each hap time (full sample per
// trigger, mirroring the browser sampler's play-through semantics), with
// deterministic round-robin over variants. Derived from the same definition
// the audition pack is built from, so both tiers play the same audio.
import { SAMPLE_PACK } from './sample-pack-def.js';
for (const [name, e] of Object.entries(SAMPLE_PACK)) {
  // D93 verify-pass catch: pitched pack entries (the SSO choir) have no srcs
  // — merging them here CLOBBERED the choir sfz routes above with a
  // samples-less wav backend, and all five choir songs' HQ stems fell to
  // fluid GM piano. Never overwrite an explicit route; skip srcs-less rows.
  if (!e.srcs || HQ_INSTRUMENTS[name]) continue;
  HQ_INSTRUMENTS[name] = {
    backend: 'wav', samples: e.srcs, kind: e.kind,
    ...(e.keyNote ? { keyNote: e.keyNote } : {}),
    velScale: e.velScale ?? 1, trimDb: e.trimDb ?? 0,
  };
}
