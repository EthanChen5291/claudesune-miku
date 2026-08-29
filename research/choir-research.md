<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

All research verified. Composing the final brief.

# Choir for motif-engine — idiom, sourcing, writing rules

## 1. Idiom guide: when game music uses choir

Four established roles, each with a distinct voicing type, syllable, register, and mix position:

**A. Epic/war — male chant** (Skyrim "Dragonborn", God of War, Two Steps From Hell)
- Voicing: **unison or octave-doubled unison** (basses + tenors an octave up), occasionally open 5ths. NOT block chords — chant power comes from mass on one line.
- Rhythm: syllabic, marcato, quarter-note-driven, locked to drums; slow harmonic rhythm (1 chord/bar or slower). Real chant uses hard consonant onsets (rah/dov); with aah-only samples, approximate via detached re-attacked quarters (small gap between notes, no merge).
- Register: chant core **C3–C4 (MIDI 48–60)**; profundo drone octave **G2–G3 (43–55)**. Below G2 free samples don't exist (see sourcing).
- Role/gain: **featured**, foreground on chorus letters — lead-adjacent gain (0.5–0.8), not whisper. Modal minor/dorian/phrygian; pairs naturally with the desert Hijaz canon.

**B. Sacred/ethereal — female aahs/oohs, boy-soprano color** (Journey, Ori, LOTR)
- Voicing: single high line or **parallel 3rds/dyads**, long tones; steps only, no leaps > 4th.
- Syllables: **ah** = bright/open, **oo** = distant/darker/softer; mm = intimate (rarely sampled).
- Register: soprano sweet spot **C5–A5 (72–81)**; above A5 = strain/soaring, reserve for one climax. Alto support G4–D5.
- Role/gain: pad-top/descant — the engine's support-top law applies verbatim: **under the lead (D77), whisper gains ≤ ~0.1** like strings, silent during dense melody bars.

**C. Horror — cluster/whisper choir** (Bloodborne, dies irae topos)
- Two routes. **Route 1 (diatonic-safe, use first): low male unison plainchant** on phrygian/dorian — reads as dread with zero chromaticism, so it doesn't collide with the taste canon. **Route 2 (chromatic, horror-vibe-gated only): clusters** — build as two semitone-adjacent dyads split across male (low) and female (high) sections, not 4 adjacent semitones in one section; semitone oscillation; slow sforzando swells. This is the genre-justified chromaticism exception, same shape as the desert Hijaz ruling.
- No free whispered-choir samples exist; whisper texture = synth route (Surge breathy pad) or omit.

**D. Wordless emotional — mixed aah** (Journey finale, ICO)
- Voicing: **SATB homophonic block chords** (the one role where block chords are correct), whole/half-note harmonic rhythm, maximal common tones.
- Role: **pad replacement** on the emotional peak letter — inherits pad laws: per-bar breathing waves, gradual transitions (padWaveCalm), no 1.6× band jumps.

**SATB ranges (MIDI, C4=60):** Bass E2–C4 (40–60) · Tenor C3–G4 (48–67) · Alto F3–D5 (53–74) · Soprano C4–A5 (60–81), ethereal extension to C6 (84).

## 2. Sourcing for the sfz render tier (verified findings)

**Negative findings first (measured, not assumed):** **VCSL has NO vocals** — verified against the upstream GitHub tree (top level = Aerophones/Chordophones/Electrophones/Idiophones/Membranophones only, same as the vendored copy at `vendor/sfz/VCSL`). **VSCO-2 CE has no voices** (verified local tree). **FreePats has no modern choir set** (site categories checked; only legacy GM GUS-quality patches). The task's assumption that VCSL might carry choir is false.

| Source | Contents (verified) | Format | License | URL | Assessment |
|---|---|---|---|---|---|
| **SSO — Sonatina Symphonic Orchestra v4.0** (Westlund/Eastman) | **Male chorus aahs G2–F#4 (MIDI 43–66), female chorus aahs G4–C6 (67–84)** — every semitone sampled, looped (loop points in sfz, verified in repo); ships `Mixed Chorus.sfz` (male low/female high split) and `Large Chorus.sfz` (overlapped detuned+panned regions = bigger ensemble); "Notation" and "Performance" variants. Sustain aah ONLY — no staccato, no ooh | SFZ + WAV/FLAC 16/44.1 | CC Sampling Plus 1.0 | [github.com/peastman/sso/releases](https://github.com/peastman/sso/releases) | **The recommendation.** Real recorded choir, the de-facto free standard; slightly lo-fi but sits well in a mix. Male and female are separate sample sets → all three choirs from one library |
| **GeneralUser GS** (already vendored, `vendor/soundfonts/GeneralUser-GS.sf2`) | "Concert Choir" multisample **A2–C6, ~13 stereo zones** (verified via `strings` on the local sf2) behind preset 52 Choir Aahs; preset 53 Voice Oohs (OohVoice sample); 54 Synth Voice. Mixed only | SF2 | GeneralUser License v2 (free, commercial OK) | already local | Decent-for-sf2, darker, mild loop shimmer. **Zero-work fallback** — the fluidsynth tier can play it today. Not featured-quality |
| **KBH Real and Swelling Choirs V2.5** | Mixed choir **aah + ooh**, with **immediate and slow-attack ("swelling") variants** — the two articulations SSO lacks | SF2 | CC-BY 4.0 | [musical-artifacts.com/artifacts/387](https://musical-artifacts.com/artifacts/387) · [polyphone.io mirror](https://www.polyphone.io/en/soundfonts/vocals/226-kbh-real-choir) | Warm/wide, the best-known free choir sf2. Optional add-on for the ooh vowel and swell attacks (fluidsynth tier, or extract to sfz with attribution) |
| VCSL / VSCO-2 CE / FreePats | — | — | — | — | **No choir content** (verified above) |
| Spitfire LABS Choir, Decent Sampler choirs | free but closed plugin / wrong format | VST3 / dspreset | proprietary | — | Skip: LABS preset state is opaque for headless DawDreamer (a D85-shaped trap); DecentSampler isn't sfizz-loadable |

**Concrete recommended set** (one library, three instruments):
1. Vendor SSO's `Samples-looped/Chorus/` (42 wavs, small) into `vendor/sfz/`.
2. Author `vendor/sfz/gen/choir-male.sfz` — the male regions only (43–66), copied verbatim from `includes/mixed-chorus.sfz` (per-note regions with tuned loop points already provided).
3. `choir-female.sfz` — female regions only (67–84).
4. `choir-mixed.sfz` — the provided Mixed Chorus mapping; use the **Large Chorus** mapping instead for epic/war vibes (its overlapped ±pan/detune regions read as a doubled ensemble).
5. Out-of-range notes fold by octaves per D83 — male floor G2 and female floor G4 are the numbers to watch in the render log.
6. Optional: KBH sf2 via the fluidsynth path for ooh/swell articulations; GeneralUser 52 stays the GM fallback.
7. Synth-choir for energetic/synth-register songs: Surge XT factory bank carries wavetable voice/choir material — wrap one as `vendor/patches/choir-pad.fxp` through the existing D85 VST3-preset flow (from the release tag matching the vendored build), and measure the spectrum before trusting it loaded.

## 3. WebAudio/audition tier

**Strudel's default soundmap includes choir — verified in the source** (`packages/soundfonts/gm.mjs`, codeberg `uzu/strudel`, lines 739–1246):
- `gm_choir_aahs` — **9 variants** (`n 0–8`): Aspirin, Chaos, FluidR3, GeneralUserGS, JCLive, Soul Ahhs ×3, FluidR3-b. The Soul Ahhs variants (n 5, 7, 8) are the warmest.
- `gm_voice_oohs` — 6 variants; `gm_synth_choir` — 5; `gm_pad_choir` (Pad 4) also present.

The audition page already uses `gm_*` names, so `.s("gm_choir_aahs").n(5)` works with **zero plumbing** and full keyboard range (WebAudioFont stretches; no D83 folding in browser). Caveat: every GM variant is a **mixed** choir — male vs female on this tier is approximated by register (voicing ≤C4 reads male, ≥G4 reads female), which conveniently matches the SSO split so audition/HQ agree perceptually. For true parity later, `samples()` can register the actual SSO wavs as a custom pitched map (~40 small wavs of page weight) — defer until choir earns keeps.

## 4. Writing rules for sampled/synth choir

- **Max 4 real voices (SATB); 3 is often cleaner.** Octave doubling only for epic chant. More voices = mud with ensemble samples (each sample is already many singers).
- **Voice-leading:** maximize common tones; each inner voice moves ≤2 semitones; no voice crossing; adjacent upper voices ≤ an octave apart (bass–tenor may exceed). Homophonic chords change all voices on the same instant.
- **Chord/syllable change rate ≤ 1 per 2 beats** at moderate tempi; minimum note length ~1s at sustain. No runs faster than 8ths at ~90bpm — vowel samples smear on fast lines; choir never takes ornament figures.
- **Merge repeated pitches** (the engine's existing melody-merge law is mandatory here — re-attacked same-pitch aahs read as machine-gun choir). Exception: epic chant, where deliberate detached re-attacks ARE the idiom.
- **Breath gaps:** a 1/8–1/4-bar rest at phrase ends every 2–4 bars; never hold one voice >~8s (the loop becomes audible). Phrase like a singer or it reads as an organ.
- **Vowels:** aah-only libraries can't morph — phrase with dynamics and gaps, not vowel changes. Where ooh exists (KBH/GM 53), switch vowel only at section boundaries (verse=oo, chorus=ah), never mid-phrase.
- **Register honesty:** SSO's mixed sfz switches male→female timbre at G4 — an alto line crossing G4 audibly changes gender mid-line; keep any single line entirely on one side of the split, or use the gender-specific sfz.
- **Dynamics per engine law:** support choir = pad rules (breathing waves, padWaveCalm gradualism, ≤~0.1 measured gains under the lead per the strings whisper precedent, D77 support-top ceiling); featured chant = lead rules (≤1.0 formula ceiling). Choir melody finals follow cadenceNo7 (land 3rd/5th).
- **Engine gating:** choir is a new capability — default-roll it only on HISTORY-LESS songs, gate `!priorKeep`, 4/4 only (D92).

Sources: [peastman/sso](https://github.com/peastman/sso/releases) · [SFZ Instruments SSO page](https://sfzinstruments.github.io/orchestra/sso/) · [Musical Artifacts SSO](https://musical-artifacts.com/artifacts/81) · [KBH Real and Swelling Choirs](https://musical-artifacts.com/artifacts/387) · [KBH on Polyphone](https://www.polyphone.io/en/soundfonts/vocals/226-kbh-real-choir) · [FreePats](https://freepats.zenvoid.org/) · [sgossner/VCSL](https://github.com/sgossner/VCSL) · [Strudel gm.mjs (codeberg uzu/strudel)](https://codeberg.org/uzu/strudel/src/branch/main/packages/soundfonts/gm.mjs) · [Sonatina Choir (bigcat, evidence of M/F split)](https://plugins4free.com/plugin/2310) · [BPB SSO writeup](https://bedroomproducersblog.com/2011/01/28/440mb-of-free-orchestral-samples-in-sonatina-symphonic-orchestra/)
