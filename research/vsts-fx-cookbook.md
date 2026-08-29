<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

# Environmental + Playful Sound Expansion — Research Report

Ground truth measured against this repo (paths verified on disk), `@strudel/web@1.1.0` (the exact bundle `audition/songs.html` loads — every function name below was grepped out of the minified bundle at that version), Surge XT **1.3.4** (`vendor/plugins/Surge XT.vst3/Contents/Resources/1.3.4.f7b97c6`), DawDreamer **0.9.0** (`vendor/pyenv`), ffmpeg **8.0.1** (`/opt/homebrew/bin/ffmpeg`, filter list probed).

---

## 0. What you already own (bigger than expected)

| Asset | Where | Relevant contents |
|---|---|---|
| **VCSL (CC0)** | `vendor/sfz/VCSL/` | Kalimba ×2, Mbira ×3, **Balafon, Marimba, Xylophone, Vibraphone**, Tubular Bells, Hand Chimes, **Wine Glasses (friction)**, **Bowed Psaltery**, Dan Tranh zither, Strumstick (drone dulcimer), **Didgeridoo**, Ocarina ×2, Recorders, Harmonicas, **Toy Train Whistle, Siren, Flexatone, Slapstick, Ratchet**, Ocean Drum, Darbuka, Frame Drum, Gongs, Bell Tree |
| **VSCO-2 CE (CC0)** | `vendor/sfz/VSCO-2-CE/` | Marimba/Xylo/Glock/Timpani folders, **bowed suspended cymbal** (`susCymb1-bow-*.wav`), cymbal crescendos (`susCymb1-cresc-*`), **gong scrapes**, log drums, congas/bongos, **`alien*.wav` / `zap*.wav` FX one-shots**, pizzicato in the string folders |
| **GeneralUser GS (GM)** | `vendor/soundfonts/` | fluid fallback already covers **Sitar (104), Music Box (10), Steel Drums (114), Slap Bass 1/2 (36/37), Kalimba (108), Banjo, Koto, Shamisen, Shanai, Reverse Cymbal (119), FX Goblins/Atmosphere, Bird Tweet, Seashore** |
| **@strudel/soundfonts@1.1.0** (browser) | CDN, already wired | same full GM set: `gm_sitar, gm_shanai, gm_koto, gm_shamisen, gm_steel_drums, gm_slap_bass_1/2, gm_music_box, gm_reverse_cymbal, gm_tremolo_strings, gm_pizzicato_strings, gm_fx_goblins, gm_fx_atmosphere, gm_bird_tweet, gm_seashore, gm_tinkle_bell, gm_ocarina, gm_whistle` — all verified in the package's name table |
| **dirt-samples** (browser) | already loaded via `strudel.json` on the audition pages | banks verified in the served JSON: `sitar, east, tabla, tabla2, birds, birds3, crow, insect, jungle, wind, space, toys, bubble, breath, hoover, casio, metal, noise, glasstap, stab, world` |
| **Owner-supplied horror WAVs** | `/Users/ethanchen/Downloads/videoswithtipsattached/*.wav` | 16 files: `horror-riser.wav` (4s), `horror-strings.wav` (4s stab), `haunting-ambience_A_minor` (23s) / `_D_major` (57s), `horror-atmo-pad` (105s), `scary-distorted-radio/tv`, `scary-evil-growl`, subs/rumbles with bpm+key in filenames. **License unknown (downloaded packs) — confirm with Ethan before shipping**; fine for audition experiments |

**Integration recipe for any one-shot WAV into the HQ tier**: the render has only `sfz|vst|fluid` backends (`src/lib/hq-instruments.js`), but `scripts/build-sfz.mjs` + a 5-line generated SFZ (`<region> sample=x.wav pitch_keycenter=60 loop_mode=one_shot`) makes sfizz play any wav folder — that is the path for dirt-sample banks, the Downloads horror wavs, and freesound one-shots. Browser side registers the same files with `samples({bank: 'file:///…'})` or keeps using the CDN dirt banks. **D-law reminder: new pool entries re-roll `fnv % pool.length` retrieval — gate additions `!priorKeep` and only ratify clicked entries.**

---

## 1. Per-genre sound plan

Surge patch names below are **real factory patches verified in the `release_xt_1.3.4` tag listing** (`resources/data/patches_factory/…`), i.e. the exact tag D85 requires. Fetch pattern:
`https://raw.githubusercontent.com/surge-synthesizer/surge/release_xt_1.3.4/resources/data/patches_factory/<Category>/<Name>.fxp`

### Space
| Sound class | Verdict | Concrete pick |
|---|---|---|
| Wide detuned supersaw pad | **Surge (have it)** | vendored `supersaw.fxp` (“Tarnce”); wider option: Pads/“Computers In Space”, “Flux Capacitor”, “Distant”. Custom edit: 7-voice unison, detune ~0.35, scene-B osc −12 sine sub, LFO→cutoff 0.05 Hz |
| Sine blip w/ delay | **Surge** | Plucks/“Delay Pops 1–5”, “Sinus Verby Pops” — the delay lives **in the patch FX slots**, so per-note MIDI stems still carry the echo (key design note: bake time FX into the patch since HQ renders per-stem, not per-note-with-sends) |
| Shimmer arp | **Surge (have it)** | `sparkle.fxp` (“Magic Music Box”) or Plucks/“Mr. Sparkle”, “Diamonds”; Pads/“Sparkly” |
| Sub drone | **Surge** | Basses/“Sub 1–4”, “Rumble”, “Eighties Drone” (built-in slow movement). Doctrine: synth bass at octave 2, one low voice at a time |
| FM metallic | **Surge** | Plucks/“Metallic”, “FM Pluck”; FX/“Metal Pluck”; Leads/“Photon” |
| Space ambience | **sample** | browser: `s('space')` dirt bank (already loaded); HQ: wrap the same wavs in a gen SFZ |

### Horror
| Sound class | Verdict | Concrete pick |
|---|---|---|
| Dark evolving pad | **Surge** | Pads/“Ghost Pad”, “Semihaunt”, “Yeti Funeral”, “Moody Statement”, “Worried”, “Distorted Choir 1/2” |
| Detuned music box | **Surge patch variant, not a new sample** | clone vendored `sparkle.fxp` (“Magic Music Box”) → osc2 +9–14 cents, scene detune, chorus slow/deep, dark plate reverb, −1 octave. Sampled alternates already vendored: VCSL **Hand Chimes / Tubular Glockenspiel** played at low velocity + the browser `gm_music_box` with `.detune`. VCSL has **no** music box/toy piano (verified against the vendored tree; upstream is CC0 if a later drop adds one) |
| Drone w/ slow movement | **Surge + sampled** | Basses/“Eighties Drone”, “Doomsday”, “Evilous”; sampled gold already vendored: VSCO **bowed cymbal**, **gong scrape**, VCSL **Wine Glasses**, **Bowed Psaltery**, **Didgeridoo**, Ocean Drum |
| Distorted radio/TV, growls | **sample (owner already has them)** | the Downloads wavs (`scary-distorted-radio/tv`, `scary-evil-growl`) + Surge FX/“Radio Noise”, “Vinyl”, “Crackling”, “Geiger”, “Unsettler”, “Spooky Fish” |
| Stingers/risers | **sample + technique** | `horror-riser.wav`, `horror-strings.wav`; `gm_reverse_cymbal` (zero-work, both tiers); recipes in §3 |
| Horror color, no new asset | — | `gm_tremolo_strings`, `gm_fx_goblins`, `s('crow')` dirt bank. Doctrine note: horror dissonance = genre-justified chromaticism (same carve-out as desert Hijaz) — keep it in FX/texture layers first, melody grammar untouched |

### Desert
Owner: "synth doesn't matter much". No free sitar/oud **SFZ** exists in the community index (sfzlab instrument catalog checked — none listed).
- **Melodic sitar today, zero work**: browser `gm_sitar` (@strudel/soundfonts) + HQ fluid fallback (GeneralUser GS 104). Same for `gm_shanai` (double-reed — Phrygian-dominant native).
- **Color/one-shots**: dirt banks `sitar`, `east`, `tabla`, `tabla2` (browser now; SFZ-wrap for HQ).
- **Vendored plausibles**: VCSL **Dan Tranh** (zither with bends), **Strumstick** (drone pluck), Darbuka/Frame Drum (already there for rhythm).
- **Surge**: Leads/“Shanai” (yes, a factory patch by that name), Winds/“Fake Ethno”, Plucks/“East”. Custom `oud.fxp` design: String-exciter osc (Surge's String osc), short comb, fast pitch-grace via pitch-bend range 2, dry.
- Serve trope progressions RAW per doctrine; the instrument is secondary to bII + raised 3rd.

### Jungle
All sampled, all vendored: VCSL **Marimba, Balafon, Kalimba (Kenya/Tanzania), Mbira ×3, Slit Drum** + VSCO **log drums, congas/bongos** — build `gen/*.sfz` entries the way glockenspiel/xylophone already were. Browser: `gm_marimba`/`gm_kalimba` (note: `gm_kalimba` is currently hijacked as a synth-pluck alias in `hq-instruments.js` — a real VCSL kalimba SFZ would want a **new** engine name, e.g. `kalimba_real`, to avoid re-voicing judged songs; keep-transition law applies). Ambience: dirt `birds`, `birds3`, `insect`, `jungle`, `wind` + `gm_bird_tweet`.

### Playful / meme
| Sound class | Verdict | Concrete pick |
|---|---|---|
| Toy piano | **Surge custom + GM layer** (no free SFZ found in the sfz community index; VCSL lacks it) | patch design: FM 2-op, ratio ~3.5 inharmonic partial + short mallet-click (filtered noise transient), fast exp decay, +1 octave, light detune. Browser fallback: `gm_celesta` + `gm_music_box` layered. Or sample freesound CC0 toy-piano multisamples → build-sfz (verify license per pack) |
| 8-bit square/PWM chip lead | **Surge trivially** | Leads/“Crisp PWM”, “µcomputer”, “Quick Basic”, Plucks/“Pure Square”, “Square Blinks”; or 2-min custom: classic osc, PW 0.25, no filter, +vibrato LFO. Browser: native `square` or `.s('zzfx')`-family (zzfx synths with `zcrush`/`zdelay` are in 1.1.0) |
| Slap bass | **have both tiers** | `gm_slap_bass_2` already maps to `rubber-bass.fxp`; more snap: Basses/“FM Slap” (factory). Browser `gm_slap_bass_1/2` are real GM samples |
| Pizzicato | **have** | `gm_pizzicato_strings` (browser) + VSCO pizz samples for a gen SFZ |
| Kazoo | **sample or skip** | no GM kazoo; freesound CC0 one-shots → SFZ-wrap; Surge parody: saw → comb filter → `vowel`-ish waveshaper (Leads/“Talky 1/2 MW” get close). Low priority |
| Steel drum | **GM now, Surge later** | `gm_steel_drums` both tiers today; custom FM steel-pan patch (2-op, ratio 2.76, pitch-blip env +2st→0 over 30ms) if GM reads cheap |
| 'Duck' quack | **Surge** | Leads/“Talky 1/2 MW” (formant morph), “Duck and Cover”; or Twist/Plaits speech mode in a custom patch; add fast down `penv` in-engine |
| Comic percussion | **vendored already** | VCSL **Flexatone, Slapstick, Ratchet, Siren, Toy Train Whistle**, Agogo, Vibraslap; dirt `toys`, `bubble`, `casio`, `hoover` |
| Circus keys | **Surge** | Keys/“Circus 1/2” (factory, literally) |

---

## 2. New-VST verdicts (constraint: VST3, free, headless DawDreamer on macOS ARM, preset save/load)

**Recommendation: zero required.** Surge XT 1.3.4 + the factory tag + SFZ/sample tier fills every hole above. Specific verdicts:

- **Dexed** — the only one worth the slot, and only if you want authentic DX7 `.syx` cartridge sounds (music boxes, DX EPs, lap-harp bells). Evidence: DawDreamer's own compatibility table lists **Dexed macOS VST3 as working** (Windows VST3 marked failing). It's JUCE, so the D85 fxp→vstpreset FUID wrap generalizes (recompute the FUID from Dexed's manufacturer/plugin codes in `render-vst.py`; the `SURGE_CID` constant is the only Surge-specific line). Note Surge's own FM + the vendored **VCSL TX81Z FM Piano samples** already cover most of this. Verdict: optional, deferred.
- **Vital** — **reject.** Free tier exists, but: `.vital` presets are JSON, not fxp — DawDreamer can't load them (`load_preset` incompatibility reported, DawDreamer #131 territory); mod-matrix state is not exposed as parameters (DawDreamer issue #212); community reports of `engine.render()` silently exiting (#167-style flakiness). Headless loading is possible (synth-galaxy project does it) but only with a custom JSON→parameter bridge — fails the preset constraint.
- **Odin2 / OB-Xd / Zebralette** — absent from DawDreamer's tested-compatibility table; Odin2 presets are its own JSON, OB-Xd v2/Zebralette unproven for programmatic preset load. Nothing they make that Surge can't. Skip unless a specific patch demands them, then probe with the D85 measured-difference habit before trusting.
- General macOS caveat from the DawDreamer docs: VST3 on macOS is the flakiest format-platform combo (e.g. Valhalla FreqEcho VST3 outputs NaN) — one more reason to stay on the proven Surge path.

---

## 3. Techniques cookbook

### 3a. Browser tier — Strudel (every control verified present in the `@strudel/web@1.1.0` bundle)

Available and confirmed: `room/roomsize/size`, `delay/delaytime/delayfeedback`, `lpf/hpf/bandf` + **filter envelopes** `lpenv/lpattack/lpdecay/lpsustain/lprelease` (and `hpenv…`), `ftype`, `vowel`, `crush`, `coarse`, `distort`, `shape`, `drive`, `squiz`, `speed` (negative reverses — `reverseBuffer` confirmed in bundle), `begin/end/loopBegin/stretch/fit/loopAt/slice/splice/chop/striate`, `accelerate`, **pitch envelope** `penv/pattack/pdecay/psustain/prelease/pcurve/panchor`, `detune/unison/spread` (supersaw), `fm/fmi/fmh`, `noise`, `vib/vibrato + vibmod`, `tremolo/tremolodepth/tremolorate` (aliases `tremdp/tremr`), `phaser/phaserrate/phaserdepth/phasersweep/phasercenter`, `pan`, `gain`, `postgain`, `compressor`, `attack/decay/sustain/release/legato/clip`, `xfade`, zzfx (`zcrush/zdelay/zrand`), signals `sine/cosine/saw/isaw/tri/square/perlin/rand/irand` + `.range().slow()/.fast()`, pattern ops `rev/jux/palindrome/iter/ply/off/superimpose/degradeBy/sometimesBy/swingBy`. **NOT in 1.1.0: `duckorbit` sidechain (landed in a later Strudel) — fake it with gain patterns.**

Recipes (one-liners to drop into generated mixes):
- **Riser/uplifter**: `note("c2").s("supersaw").unison(7).detune(0.4).penv(24).pattack(4).gain(saw.range(0.1,0.8).slow(4)).lpf(saw.range(400,9000).slow(4))` — pitch+cutoff+gain all climb over the 4-bar cycle. Noise variant: `s("white").attack(3).lpf(saw.range(600,12000).slow(4)).hpf(200)`.
- **Reverse-cymbal transition**: `s('gm_reverse_cymbal')` (zero work) or any sample reversed: `s('crash').speed(-1)`; granular-reverse: `.chop(16).rev`.
- **LPF build into drop**: `.lpf(sine.range(300,4000).slow(8))` on the acc stack for the build bars, drop bar removes the control entirely (full open) — pattern-gated per section the way `padWaveCalm` gains already are.
- **Tape-stop / warp-fade**: samples → `.accelerate(-4)` (playback-rate ramp over the event) + `.gain(isaw.slow(1))`; synth notes → `penv` (see §4).
- **Sidechain-style pump** (no duckorbit in 1.1.0): `.gain(saw.range(0.35,1).fast(4))` — dips at each beat, recovers across it; shape the knee with `.gain(saw.range(0.35,1).fast(4).pow(2))`.
- **Detune/width**: `.s('supersaw').unison(5).detune(0.3).spread(0.8)`; any voice fattened via `superimpose(x=>x.detune(0.1).pan(0.8))`.
- **Vibrato**: `.vib(5).vibmod(0.4)` (5 Hz, ±0.4 st); delayed vibrato = pattern the depth `.vibmod(saw.range(0,0.5).slow(1))`.
- **Tremolo**: `.tremolodepth(0.6).tremolorate(4)`. **Autopan**: `.pan(sine.slow(2))`. **Phaser pad motion**: `.phaser(0.4).phaserdepth(0.6)`.
- **Lo-fi/meme**: `.crush(6)`, `.coarse(8)`, `.vowel("<a e i o>")` (talking-synth meme staple), `.distort(1.2)`.
- **Shimmer-ish tail**: `.delay(0.5).delaytime(0.375).delayfeedback(0.65).room(0.9).roomsize(8)` + a quiet `superimpose(x=>x.add(note(12)).gain(0.15))` octave ghost (true pitch-shift feedback isn't available).

### 3b. HQ tier — ffmpeg 8.0.1 (filters probed: `areverse asetrate atempo afade acrusher aecho aeval aevalsrc afreqshift aphaser apulsator chorus flanger vibrato tremolo compand firequalizer lowpass highpass sidechaincompress sendcmd/asendcmd adelay volume` all present; **no rubberband**)

Hook point: stems render individually then mix at `scripts/render-hq.mjs` (`chains` → `amix` → `loudnorm`, line ~279; a convolution reverb send via `afir` + `vendor/build/room-ir.wav` already exists at line 140). Per-stem effects slot into `chains`.

- **Riser (synthesized from nothing)** — exact quadratic chirp: 
  `ffmpeg -f lavfi -i "aevalsrc='0.25*sin(2*PI*(80*t+220*t*t))':d=4:s=44100" -af "afade=t=in:d=3:curve=qua,afade=t=out:st=3.5:d=0.5" riser.wav` 
  Noise riser: `-f lavfi -i "anoisesrc=color=pink:d=4" -af "volume='(t/4)^2':eval=frame,highpass=f=300"` + swept lowpass via asendcmd (below).
- **Reversed swell from any stem**: `ffmpeg -ss 12 -t 2 -i stem.wav -af "areverse,afade=t=in:d=0.1" swell.wav`, then `adelay` it into the mix ending ON the downbeat.
- **Reverse reverb (pre-verb, the horror-reel staple)** — uses the vendored IR: reverse → convolve → reverse: 
  `ffmpeg -i hit.wav -af areverse r.wav && ffmpeg -i r.wav -i vendor/build/room-ir.wav -filter_complex "[0:a][1:a]afir=dry=10:wet=10" rv.wav && ffmpeg -i rv.wav -af areverse preverb.wav`
- **LPF build automation** (time-varying cutoff): `asendcmd` stepping a `lowpass` every 250 ms reads as continuous: 
  `-af "asendcmd=c='0.0 lowpass f 300; 0.25 lowpass f 380; … 7.75 lowpass f 16000',lowpass=f=300"` — generate the command string from the bar map in `render-hq.mjs` (32 steps over 8 s is inaudibly stepped).
- **Tape-slow warp fade (outro)**: fixed drop is one filter — `asetrate=44100*0.85,aresample=44100` (pitch+speed together = tape). A *ramped* stop without rubberband = stepwise: slice the last beat into 8×60 ms segments, `asetrate=44100*k` with k stepping 1.0→0.4, `concat`, `afade=t=out` — reads as a genuine tape stop. (Segment loop is 6 lines of shell/JS.) Cheap alternative for a single bent tail: `vibrato=f=0.4:d=1` trimmed to the falling half-period.
- **Sidechain pump (real)**: duck the pad stem under the kick stem: 
  `ffmpeg -i pad.wav -i kick.wav -filter_complex "[0:a][1:a]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=180[out]"` — or synthetic pump with no key: `apulsator=hz=2 (at 120bpm)` or `volume='0.4+0.6*min(1,mod(t,0.5)*6)':eval=frame`.
- **Detune/chorus thicken**: `chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3`; or the dual-rate trick: split, `asetrate=44100*1.003` / `*0.997` + `aresample=44100` + `adelay=12`, `amix` — a true ±5-cent detune spread.
- **Distortion**: waveshaper `aeval=exprs='tanh(3*val(0))|tanh(3*val(1))'`; digital meme-crush `acrusher=bits=8:mode=log:aa=1`; radio/TV horror: `highpass=f=500,lowpass=f=2800,acrusher=bits=10,afreqshift=shift=5` (the freq-shift detunes partials inharmonically — instant "wrong radio").
- **Tremolo/vibrato/wow**: `tremolo=f=4:d=0.6`, `vibrato=f=5:d=0.3`; tape wow on a whole song: `vibrato=f=0.7:d=0.04`.

---

## 4. The warp fade (pitch-drop fade) — both tiers, concretely

- **Browser, samples**: `.accelerate(-6)` — SuperDirt-semantics playback-rate ramp across the event (confirmed in bundle); pair with `.gain(isaw)` and `.legato(1.2)` so the fall completes.
- **Browser, synth notes**: pitch envelope, all controls in 1.1.0: `note("g4").s("sawtooth").penv(-24).pattack(1.5).pcurve(2).release(1.2).gain(isaw.slow(2))` — depth −24 st with a slow attack sweeps the pitch away while the gain dies; `panchor` flips whether the sweep starts at or arrives at the written pitch. **Polarity/anchor semantics should be probe-verified by ear once (5-min check on the judge page) before an engine rule hardcodes them — doctrine: measure, don't trust.**
- **HQ**: the stepwise `asetrate` concat above for tape-stops; for a *musical* per-note bend, better to do it upstream of ffmpeg: emit a MIDI **pitch-bend ramp** into the stem `.mid` (render-vst.py passes `all_events=True`, Surge default bend range ±2 — set the patch's bend range to 24 in the .fxp for full tape-drop depth). That keeps the warp deterministic and per-note rather than per-stem.
- **Zero-effort horror variant**: `horror-riser.wav` played `.speed(-1)` is a fall; any sustained stem sliced + `areverse` + `afade` gives the "swallowed" ending.

---

## 5. Priority order (effort vs. payoff)

1. **Free wins, no new assets**: `gm_reverse_cymbal`, `gm_tremolo_strings`, `gm_sitar`/`gm_shanai`, `gm_steel_drums`, `gm_slap_bass_1`, dirt banks (`crow/birds/insect/space/east/tabla/toys`) — browser-ready today, GeneralUser covers HQ fallback.
2. **Surge patch fetches from `release_xt_1.3.4`** (existing D85 pipeline, ~1 hr incl. probe-verification): space (Delay Pops, Computers In Space, Sub 2, Metallic), horror (Ghost Pad, Eighties Drone, Radio Noise, detuned-music-box clone of sparkle.fxp), playful (Circus 1, Crisp PWM, FM Slap, Talky 1 MW), desert (Shanai, Fake Ethno, East).
3. **gen-SFZ builds from vendored CC0 samples** (extend `build-sfz.mjs`): VCSL kalimba/balafon/marimba(VCSL)/hand-chimes/wine-glasses/flexatone/slapstick; VSCO bowed cymbal + gong scrape + log drums; SFZ-wrap the Downloads horror wavs (license check first).
4. **Technique pass**: Strudel recipes into the generator behind `!priorKeep` gates; ffmpeg per-stem chain hooks in `render-hq.mjs`.
5. **Optional, deferred**: Dexed VST3 (only for DX7-cartridge authenticity; DawDreamer-mac-VST3 listed working). **Do not adopt Vital** (JSON presets, matrix params unreachable, flaky headless renders).

Sources: [Surge factory patches @ release_xt_1.3.4](https://github.com/surge-synthesizer/surge/tree/release_xt_1.3.4/resources/data/patches_factory) · [DawDreamer plugin compatibility](https://dirt.design/DawDreamer/compatibility.html) · [DawDreamer PluginProcessor docs](https://github.com/DBraun/DawDreamer/wiki/Plugin-Processor) · [Vital matrix params issue #212](https://github.com/DBraun/DawDreamer/issues/212) · [DawDreamer render flakiness #167](https://github.com/DBraun/DawDreamer/issues/167) · [preset format issue #131](https://github.com/DBraun/DawDreamer/issues/131) · [synth-galaxy headless Vital bridge](https://github.com/s0hfia/synth-galaxy) · [VCSL (CC0)](https://github.com/sgossner/VCSL) · [sfz community instrument index](https://sfzlab.github.io/sfz-website/instruments/) · [dirt-samples strudel.json](https://cdn.jsdelivr.net/gh/tidalcycles/dirt-samples@master/strudel.json) · [@strudel/web@1.1.0 bundle](https://unpkg.com/@strudel/web@1.1.0/dist/index.js) · [@strudel/soundfonts@1.1.0](https://unpkg.com/@strudel/soundfonts@1.1.0/dist/index.mjs) · [FreePats (CC0 pianos etc.)](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html)
