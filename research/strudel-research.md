# Strudel sound inventory — what the platform actually exposes

Research date: 2026-08-25. All names below were verified against source unless
flagged. Primary sources:

- `packages/soundfonts/gm.mjs` (codeberg.org/uzu/strudel, branch `main`) — the
  exported GM name table (downloaded to this scratchpad as `gm.mjs`)
- `packages/soundfonts/fontloader.mjs` — registration + loading mechanics
- `website/src/repl/prebake.mjs` — what the strudel.cc REPL registers by default
- CDN sample maps actually fetched: `tidal-drum-machines.json` (683 keys),
  `tidal-drum-machines-alias.json`, `vcsl.json` (128 keys), `uzu-drumkit.json`
  (16 keys), `uzu-wavetables.json` (7 keys), `mridangam.json` (13 keys),
  `piano.json`
- `packages/superdough/synth.mjs`, `helpers.mjs`, `zzfx.mjs` — synth names
- `packages/web/web.mjs` — what `@strudel/web` (the engine's runtime) registers
- Classic Dirt-Samples `strudel.json` (tidalcycles/dirt-samples, 218 keys) —
  the map the ENGINE's audition pages actually load (`audition/judge.html`)
- Docs: strudel.cc/learn/sounds/, `samples.mdx`, `synths.mdx`

Note on repos: `github.com/tidalcycles/strudel` is ARCHIVED ("MOVED TO
CODEBERG"); the live repo is `codeberg.org/uzu/strudel`. GitHub raw files for
the archived copy still resolve but are stale.

IMPORTANT FRAMING: everything in section 2 is a CANDIDATE. Nothing here is a
claim about what sounds good — that verdict belongs to Ethan's ear alone. This
document only establishes what names exist and will make sound.

---

## 1. The full `gm_*` list — 125 names, grouped by GM family

`registerSoundfonts()` registers exactly these 125 keys (the 128 GM programs,
with Acoustic Grand / Bright Acoustic / Electric Grand / Honky-tonk collapsed
into one `gm_piano`). `[USED]` = already in the engine's 43-voice palette.
`(n=K)` = number of underlying soundfont renders; `.n(i)` selects one (indexed
mod K), each a different source sf2 (JCLive, FluidR3_GM, Aspirin, Chaos,
GeneralUserGS…) with genuinely different tone and loudness.

Names like `gm_acoustic_piano` appear only in comments inside gm.mjs and are
NOT registered — the engine's judge.html already documents this trap
(`PIANO_FALLBACK = 'gm_piano'`, "NOT gm_acoustic_piano").

### Piano / keys
- gm_piano (n=32) — the merged piano bank (acoustic grand, bright, e-grand, honky-tonk renders)
- gm_epiano1 (n=11) [USED]
- gm_epiano2 (n=9)
- gm_harpsichord (n=8) [USED]
- gm_clavinet (n=4)

### Chromatic percussion / bells
- gm_celesta (n=6) [USED]
- gm_glockenspiel (n=5) [USED]
- gm_music_box (n=5) [USED]
- gm_vibraphone (n=6) [USED]
- gm_marimba (n=7) [USED]
- gm_xylophone (n=6) [USED]
- gm_tubular_bells (n=6) [USED]
- gm_dulcimer (n=5)

### Organ / reeds (free)
- gm_drawbar_organ (n=7)
- gm_percussive_organ (n=6)
- gm_rock_organ (n=5)
- gm_church_organ (n=5) [USED]
- gm_reed_organ (n=8)
- gm_accordion (n=7) [USED]
- gm_harmonica (n=6)
- gm_bandoneon (n=10)

### Guitar
- gm_acoustic_guitar_nylon (n=9) [USED]
- gm_acoustic_guitar_steel (n=10)
- gm_electric_guitar_jazz (n=9)
- gm_electric_guitar_clean (n=9)
- gm_electric_guitar_muted (n=10)
- gm_overdriven_guitar (n=10)
- gm_distortion_guitar (n=7)
- gm_guitar_harmonics (n=3)

### Bass
- gm_acoustic_bass (n=4) [USED]
- gm_electric_bass_finger (n=4)
- gm_electric_bass_pick (n=5)
- gm_fretless_bass (n=2)
- gm_slap_bass_1 (n=4)
- gm_slap_bass_2 (n=4)
- gm_synth_bass_1 (n=10) [USED]
- gm_synth_bass_2 (n=7)

### Strings (solo + orchestral)
- gm_violin (n=9) [USED]
- gm_viola (n=5) [USED]
- gm_cello (n=6) [USED]
- gm_contrabass (n=3) [USED]
- gm_tremolo_strings (n=6) [USED]
- gm_pizzicato_strings (n=6) [USED]
- gm_orchestral_harp (n=5) [USED]
- gm_timpani (n=6)

### Ensemble / choir / hit
- gm_string_ensemble_1 (n=11) [USED]
- gm_string_ensemble_2 (n=7)
- gm_synth_strings_1 (n=7)
- gm_synth_strings_2 (n=4)
- gm_choir_aahs (n=9) [USED]
- gm_voice_oohs (n=6) [USED]
- gm_synth_choir (n=5)
- gm_orchestra_hit (n=5)

### Brass
- gm_trumpet (n=4) [USED]
- gm_trombone (n=5) [USED]
- gm_tuba (n=4)
- gm_muted_trumpet (n=5) [USED]
- gm_french_horn (n=5) [USED]
- gm_brass_section (n=5)
- gm_synth_brass_1 (n=4)
- gm_synth_brass_2 (n=7)

### Reed (sax + double reeds)
- gm_soprano_sax (n=5)
- gm_alto_sax (n=6)
- gm_tenor_sax (n=4)
- gm_baritone_sax (n=6)
- gm_oboe (n=5) [USED]
- gm_english_horn (n=4)
- gm_bassoon (n=4) [USED]
- gm_clarinet (n=6) [USED]

### Pipe
- gm_piccolo (n=5)
- gm_flute (n=5) [USED]
- gm_recorder (n=5) [USED]
- gm_pan_flute (n=8) [USED]
- gm_blown_bottle (n=5)
- gm_shakuhachi (n=5)
- gm_whistle (n=4)
- gm_ocarina (n=4) [USED]

### Synth lead
- gm_lead_1_square (n=3) [USED]
- gm_lead_2_sawtooth (n=7) [USED]
- gm_lead_3_calliope (n=7) [USED]
- gm_lead_4_chiff (n=6)
- gm_lead_5_charang (n=10)
- gm_lead_6_voice (n=6)
- gm_lead_7_fifths (n=5)
- gm_lead_8_bass_lead (n=5)

### Synth pad
- gm_pad_new_age (n=12) [USED]
- gm_pad_warm (n=7) [USED]
- gm_pad_poly (n=7)
- gm_pad_choir (n=6)
- gm_pad_bowed (n=5) [USED]
- gm_pad_metallic (n=7)
- gm_pad_halo (n=8) [USED]
- gm_pad_sweep (n=7)

### Synth FX
- gm_fx_rain (n=6)
- gm_fx_soundtrack (n=5)
- gm_fx_crystal (n=10)
- gm_fx_atmosphere (n=13)
- gm_fx_brightness (n=12)
- gm_fx_goblins (n=9)
- gm_fx_echoes (n=10)
- gm_fx_sci_fi (n=9)

### Ethnic
- gm_sitar (n=7)
- gm_banjo (n=6)
- gm_shamisen (n=7)
- gm_koto (n=9)
- gm_kalimba (n=5) [USED]
- gm_bagpipe (n=5)
- gm_fiddle (n=9)
- gm_shanai (n=5)

### Percussive
- gm_tinkle_bell (n=5)
- gm_agogo (n=6)
- gm_steel_drums (n=6)
- gm_woodblock (n=9)
- gm_taiko_drum (n=10)
- gm_melodic_tom (n=9)
- gm_synth_drum (n=7)
- gm_reverse_cymbal (n=9)

### Sound effects
- gm_guitar_fret_noise (n=8)
- gm_breath_noise (n=8)
- gm_seashore (n=16)
- gm_bird_tweet (n=11)
- gm_telephone (n=13)
- gm_helicopter (n=24)
- gm_applause (n=15)
- gm_gunshot (n=11)

Tally: 125 registered, 43 in the engine palette, 82 unused.

---

## 2. CANDIDATE additions for game/environmental music

Every entry here is a CANDIDATE for audition — a hypothesis for Ethan's ear,
not a fact about what sounds good. Rationales say only what the voice IS and
what hole in the current palette it might fill. All names verified registered.

### Percussion-adjacent pitched voices (biggest structural gap — the palette has no drums at all)
- **gm_timpani** — the orchestral low-end punctuation voice; pitched, so it can land on chord roots; classic boss/tension device.
- **gm_taiko_drum** — deep unpitched-feeling hit playable at low notes; the "east" Dirt bank has real taiko too (see §3) but this one needs no extra sample map.
- **gm_melodic_tom** — pitched tom runs; classic JRPG battle fill material.
- **gm_synth_drum** — 80s sim-tom; retro game battle flavor.
- **gm_woodblock** — dry tick; a notes-only metronomic pulse layer that adds rhythm without a drum kit (aligned with the "notes > clicks" taste theme, but that is Ethan's call).
- **gm_agogo** — bright metal tick, similar role, brighter color.
- **gm_steel_drums** — pitched steel pan; instant beach/island/casino area color.
- **gm_tinkle_bell** — tiny bell dust; sparkle topping above music_box/celesta.
- **gm_reverse_cymbal** — riser/transition swell into section changes (arranger could place it at phrase boundaries).
- **gm_orchestra_hit** — the stab cliché; dramatic accent on downbeats, boss intros.

### Ensemble mass / dramatic weight
- **gm_brass_section** — full-section brass; the palette has only solo brass, nothing for triumphant/military tuttis.
- **gm_string_ensemble_2** — a second, darker/slower string ensemble to contrast with ensemble_1.
- **gm_synth_strings_1 / gm_synth_strings_2** — colder synthetic strings; sci-fi or retro-console string beds.
- **gm_synth_choir** — synthetic voices, more artificial than choir_aahs; eerie/ethereal.
- **gm_pad_choir** — choir-as-pad; sits behind textures rather than in front.
- **gm_tuba** — the missing brass bass; comedic or heavy low end, oom-pah roots (taste memory says wide oom-pah is a theme).

### Bass alternatives (currently only acoustic + synth_bass_1)
- **gm_fretless_bass** (n=2 only) — slidey, warm, lyrical bass.
- **gm_electric_bass_finger / gm_electric_bass_pick** — rounder / tighter electric bass.
- **gm_slap_bass_1 / gm_slap_bass_2** — funk punch; chase/minigame energy.
- **gm_synth_bass_2** — second synth bass color.

### Guitars (entirely absent beyond nylon)
- **gm_electric_guitar_clean** — clean electric; noir, lounge, town-at-night.
- **gm_electric_guitar_jazz** — darker hollow-body color.
- **gm_electric_guitar_muted** — palm-mute chug; rhythmic drive without drums.
- **gm_overdriven_guitar / gm_distortion_guitar** — battle/boss aggression; nothing in the current palette can do this at all.
- **gm_acoustic_guitar_steel** — brighter folk strum vs the nylon.
- **gm_guitar_harmonics** (n=3) — glassy chimes; sparse ambient punctuation.

### World color (region-theming levers)
- **gm_koto / gm_shamisen** — Japanese zone theming; pairs with the `east` Dirt bank percussion.
- **gm_sitar** — desert/mystic zones.
- **gm_banjo** — western/rural zones.
- **gm_dulcimer** — hammered-dulcimer folk shimmer, between harp and harpsichord.
- **gm_shakuhachi** — breathy bamboo flute; meditative, spacious.
- **gm_whistle** — plain human whistle; jaunty town/overworld lead.
- **gm_fiddle** — folk-inflected violin alternative.
- **gm_bagpipe / gm_shanai** — highly specific; niche zone flavor.
- **gm_harmonica / gm_bandoneon** — saloon / tango color; bandoneon has n=10 renders.

### Organs and keys
- **gm_drawbar_organ / gm_percussive_organ / gm_rock_organ** — secular organs (the palette only has church_organ); jazz/funk/villain flavors.
- **gm_reed_organ** — smaller, sadder pump organ; intimate scenes.
- **gm_epiano2** — DX7-style FM tine piano vs epiano1.
- **gm_clavinet** — funky bite.

### Winds not yet present
- **gm_piccolo** — above the flute; marches, birdsong height.
- **gm_english_horn** — darker oboe; melancholy solo.
- **gm_blown_bottle** — hollow, quirky; puzzle/curiosity scenes.
- **sax family (gm_soprano_sax .. gm_baritone_sax)** — lounge/city/night; a whole register family the palette skips.

### Synth leads/pads not yet present
- **gm_lead_4_chiff / gm_lead_5_charang / gm_lead_6_voice / gm_lead_7_fifths / gm_lead_8_bass_lead** — more chiptune-adjacent lead colors.
- **gm_pad_poly / gm_pad_metallic / gm_pad_sweep** — additional pad palettes (metallic = colder, sweep = filter-motion).

### Environmental / diegetic FX (the "environmental music" ask)
- **gm_seashore** (n=16) — wave/wind noise beds; beach and storm ambience.
- **gm_fx_rain** — rain-ish texture bed.
- **gm_bird_tweet** (n=11) — forest ambience punctuation.
- **gm_breath_noise** — human air; horror proximity.
- **gm_fx_atmosphere / gm_fx_echoes / gm_fx_soundtrack / gm_fx_sci_fi / gm_fx_goblins / gm_fx_crystal / gm_fx_brightness** — GM's ambient-texture programs; goblins is the classic horror shimmer, crystal a bell-cloud, soundtrack a dark fifth-pad.
- **gm_applause / gm_telephone / gm_helicopter / gm_gunshot** — diegetic one-shots; probably cue-level, not music-level.

---

## 3. Non-GM percussion and samples — two different worlds

### 3a. What the ENGINE currently loads (audition/judge.html)

The engine's pages load the CLASSIC Dirt-Samples map, not the REPL's newer
one: `https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/strudel.json`
(jsdelivr mirror as backup) plus `piano.json` from felixroos/dough-samples.
That map has **218 banks**; within a bank, `.n(i)` picks a sample. Names as
used in `s()` — highlights relevant to game music (full 218 preserved in
`dirt-strudel.json` in this scratchpad):

- Kits: `bd, sd, hh, cp, cr, ht, lt, mt, cb, rs, rm, sn, perc, drum, hand,
  click, tink, tok, glasstap`
- Machine-flavored: `808, 808bd, 808sd, 808hh?` (verified: 808, 808bd, 808cy,
  808hc, 808ht, 808lc, 808lt, 808mc, 808mt, 808oh, 808sd), `909, dr55,
  drumtraks, linnhats, kicklinn, sequential, electro1, techno, house, jazz`
- World: `east` (nipon wood block, ohkawa, shime, **taiko_1/2/3** — real taiko
  recordings), `tabla, tabla2, tablex, world, sitar` (sampled sitar phrases)
- Environmental: `wind` (10 wind recordings), `birds, birds3, crow, insect,
  fire, outdoor, pebbles, bubble, coins`
- Tonal/instrument: `casio` (high/low/noise), `arpy, newnotes, notes, gtr, sax,
  moog, juno, jvbass, bass0-3, pluck, pad, padlong, stab, hoover, metal`
- Voice/toys: `numbers, num, alphabet, speech, speakspell, yeah, baa, mouth`

### 3b. What the strudel.cc REPL loads by default (prebake.mjs) — NOT currently in the engine

- **tidal-drum-machines** (683 keys): `MachineName_voice`, e.g.
  `RolandTR808_bd`, `RolandTR909_hh`, `AkaiLinn_sd`, `KorgM1_perc`,
  `OberheimDMX_cp`, `YamahaRY30_ht`. Voice suffixes: `bd sd rim cp hh oh cr rd
  ht mt lt sh cb tb perc misc fx`. Used via `s("bd sd").bank("RolandTR808")` —
  `bank()` just prepends `Name_`. Alias file maps short names: `TR808 →
  RolandTR808`, `TR909, LinnDrum→?` (alias table: e.g. `RolandTR808: "TR808"`,
  `AkaiLinn: "Linn"`, `OberheimDMX: "DMX"`, `EmuSP12: "SP12"`, 67 machines).
- **uzu-drumkit** (the REPL's default `bd/sd/hh`): `bd, brk, cb, cp, cr, hh,
  ht, lt, misc, mt, oh, rd, rim, sd, sh, tb`.
- **VCSL** (Versilian Community Sample Library, CC0, 128 keys) — REAL sampled
  orchestral percussion and instruments, many pitched (note-mapped dicts,
  playable with `note()`): `timpani` (30 hits), `timpani_roll`, `timpani2`,
  `gong`, `gong2`, `tubularbells`, `handbells`, `handchimes`, `glockenspiel`,
  `marimba`, `vibraphone(_soft/_bowed)`, `xylophone_hard_ff` (+5 variants),
  `balafon(_hard/_soft)`, `kalimba`–`kalimba5`, `bongo, conga, darbuka,
  framedrum, cajon, bassdrum1/2, snare_modern/hi/low/rim, tom(_mallet/_stick/
  _rim)`, `woodblock, clave, guiro, cabasa, shaker_large/small, tambourine(2),
  sleighbells, belltree, marktrees, fingercymbal, sus_cymbal(2), triangles,
  anvil, brakedrum, flexatone, ratchet, slapstick, vibraslap, slitdrum,
  oceandrum, wineglass(_slow), clash(2)`, plus pitched instruments:
  `steinway, kawai, piano1, fmpiano, clavisynth, harp, folkharp, psaltery_*,
  dantranh(_tremolo/_vibrato), strumstick, didgeridoo, recorder_soprano/alto/
  tenor/bass (_stacc/_vib/_sus), ocarina(_small/_vib), pipeorgan_loud/quiet
  (_pedal), organ_4inch/8inch/full, harmonica(_soft/_vib), sax(_stacc/_vib),
  saxello, super64(_acc/_vib) (N64-style?), trainwhistle, ballwhistle, siren`.
- **mridangam** (13 keys): `mridangam_ta, mridangam_dhin, mridangam_thom` etc.
- **Inline Dirt banks** (from strudel.b-cdn.net/Dirt-Samples): `casio, crow,
  insect, wind, jazz, metal, east, space, numbers, num` — the curated 10-bank
  subset of the classic map.
- **piano** (Salamander-derived, via `piano.json`) + `.piano()` helper.

CANDIDATE (engine-level): loading `tidal-drum-machines.json` and/or `vcsl.json`
from strudel.b-cdn.net in the audition pages would open all of 3b to the
arranger; VCSL's `timpani`/`gong`/orchestral percussion are real recordings and
may outclass the GM equivalents — but only Ethan's ear can rank them.

### 3c. Synths (registered by `registerSynthSounds()` — ALWAYS available, even offline)

- Waveforms: `triangle` (default s), `square`, `sawtooth`, `sine`, `user`,
  `one`; aliases `tri, sqr, saw, sin`.
- Noises: `pink`, `white`, `brown`, `crackle` (with `density`).
- Extra synths: `supersaw` (unison/spread/detune params), `pulse` (pwrate/
  pwsweep), `sbd` (synth bass drum, pitch-env kick), `bytebeat`, `bus`.
- ZZFX (`registerZZFXSounds()` — REPL prebake only, NOT in @strudel/web init):
  `zzfx, z_sine, z_sawtooth, z_triangle, z_square, z_tan, z_noise` with params
  zrand/curve/slide/deltaSlide/pitchJump/lfo/znoise/zmod/zcrush/zdelay/tremolo.
  Classic 8-bit sound-effect territory.
- Wavetables: any sample name prefixed `wt_` plays as a looped single-cycle
  wavetable. REPL prebake loads `uzu-wavetables.json`: `wt_digital,
  wt_digital_bad_day, wt_digital_basique, wt_digital_crickets,
  wt_digital_curses, wt_digital_echoes, wt_vgame`. The docs (synths.mdx) claim
  ">1000 AKWF wavetables by default" and use `wt_flute` — that name is NOT in
  the current prebake maps: **unverified/stale-docs discrepancy**; the AKWF set
  appears to have been replaced by uzu-wavetables in current main.

---

## 4. How soundfonts load, offline behavior, loudness quirks

### Registration & loading (fontloader.mjs, verified)
- `registerSoundfonts()` iterates the gm.mjs table and calls
  `registerSound(name, onTrigger, {type:'soundfont', prebake:true, fonts})` for
  each of the 125 names. Registration is cheap — no audio is fetched.
- On first trigger of a voice, it lazily fetches
  `https://felixroos.github.io/webaudiofontdata/sound/<font>.js` (a
  webaudiofont-format JS file, e.g. `0730_FluidR3_GM_sf2_file.js`), extracts
  the data object with string-split + `eval`, decodes base64 sample zones via
  `decodeAudioData`, and caches per (font, pitch). `setSoundfontUrl()` can
  repoint the host.
- `n` selects among the renders: `getSoundIndex(value.n, fonts.length)` — so
  `s("gm_flute").n(3)` is a different sf2's flute. Default n=0. The engine
  currently never sets `n` on gm voices (CANDIDATE: auditioning n-variants of a
  voice Ethan already likes is the cheapest palette expansion of all — same
  name, different render).
- Zones carry sf2 loop points; if `loopStart < loopEnd` the source loops, so
  sustained voices (strings, pads, organs) hold as long as the event lasts, and
  release is governed by the ADSR (`getParamADSR(..., 0, 0.3, ...)`).
- `@strudel/web` (the engine's runtime, v1.1.0 pinned in judge.html) does NOT
  bundle or register soundfonts — its `registerSoundfonts` import is commented
  out in `packages/web/web.mjs`. The engine loads `@strudel/soundfonts@1.1.0`
  from unpkg/jsdelivr explicitly, with a shimmed `soundfont2` dependency
  (judge.html rebuilds the broken import against a UMD build).

### Offline / failure behavior (engine-side, judge.html, verified)
- If the soundfont module fails to load, judge.html rewrites every
  `.s("gm_xxx")` to `.s("triangle")` (`GM_FALLBACK`) before evaluation — the
  bundled fallback the instruments.js header mentions. Sound, not silence.
- If the piano sample map fails but soundfonts loaded, `.s("piano")` is
  rewritten to `.s("gm_piano")` (`PIANO_FALLBACK`).
- Even with registration succeeded, each voice's audio is a lazy network fetch
  at first trigger — first play of a voice can be late/silent while loading
  (documented in samples.mdx as the lazy-loading caveat, Codeberg issue #187).

### Loudness / quality quirks (verified in source; ear-verdicts are Ethan's)
- The soundfont trigger path hard-codes envelope max gain 0.3
  (`getParamADSR(node.gain, a, d, s, r, 0, 0.3, ...)`) — uniform across all
  gm voices, so RELATIVE loudness differences come from the source sf2 renders
  themselves, which are wildly uneven (this is exactly what the engine's D46
  per-voice `level` field corrects; Ethan's "didn't really hear the flute").
- Different `n` renders of the same voice differ in loudness AND character —
  gm.mjs itself comments out low-quality renders (`//0000_SBLive_sf2` etc.),
  i.e. the list is already a curation pass by the Strudel authors.
- Loop-point quality varies by render: bad loop points in some renders can
  produce audible loop seams on long sustains. **Unverified as a specific
  Strudel bug report** — inferred from the loop mechanism + webaudiofont data
  provenance; treat any specific voice's seam as an ear question.
- The GM data is generated from GeneralUserGS.sf2, FluidR3.sf2 and other free
  soundfonts via surikov/webaudiofont (per the Strudel blog / PR #139).

### Unverified names — do not use without checking
- `gm_acoustic_piano`, `gm_bright_acoustic_piano`, `gm_electric_grand_piano`,
  `gm_honky_tonk_piano` — comment-only in gm.mjs, NOT registered (use
  `gm_piano` + `n`).
- `wt_flute` (and any AKWF wavetable name) — in docs, not in current prebake
  maps.
- Short drum-machine aliases (`TR808` etc.) exist in the alias JSON but only
  apply after `aliasBank()` runs — the REPL runs it, the engine does not.
