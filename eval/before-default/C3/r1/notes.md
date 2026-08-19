# Lo-fi beat — build notes

## Tools & format

- **Format:** each version ships a standard MIDI file (`lofi_cm_84.mid`, format 1,
  480 tpqn — EP/bass/vibraphone tracks + channel-10 drums) and a rendered,
  directly listenable WAV (`lofi_cm_84.wav`, 44.1 kHz stereo, ~93 s).
- **Tools:** one self-contained Python script per version (`generate_beat.py`,
  stdlib + numpy, no external synths/DAWs). A single note list is the source of
  truth for both the MIDI writer and a small built-in numpy synth (sine-stack EP,
  tanh-saturated sine bass, tremolo "vibraphone", swept-sine kick, noise
  snare/hats, vinyl hiss + crackle bed, gentle lowpass for warmth).
- Re-render any version with `python3 generate_beat.py` inside its folder.
- Verified between versions by diffing the generated note lists per track
  (timing / pitch / velocity / duration).

## v0 — initial version

- C minor, 84 BPM, A B A B with 8-bar sections (32 bars). Swung 8th hats
  (offbeats at 2/3 of the beat), two-bar boom-bap kick/snare loop, open hat
  every 4th bar.
- Jazzy extended harmony, one chord per bar: verse **Cm9 Fm9 Abmaj9 G7b9 Cm9
  Ebmaj9 Dm7b5 G7b9**, chorus **Abmaj9 Bb13 Gm9 Cm9 Fm9 Bb9 Ebmaj9 G7b9** —
  rootless EP voicings with a slight upward roll, upright-style bass on roots/fifths.
- Sleepy vibraphone melody: sparse, mostly stepwise, long held resolutions,
  one 8-bar phrase per section. Drums intentionally uniform (all velocity 96).

## v1 — change request 1: halve the harmonic rhythm

- `BARS_PER_CHORD` 1 → 2: each chord now holds for two bars, so chords change
  half as often (verse loop becomes Cm9–Fm9–Abmaj9–G7b9, chorus
  Abmaj9–Bb13–Gm9–Cm9, each chord ×2 bars).
- Bass pitches follow the chord roots (bass is derived from the harmony), so the
  harmonic layer as a whole moves at the halved rate; its rhythm is unchanged.
- Everything else is bit-identical to v0: drums, melody, comping rhythm, all
  timings/velocities/durations (verified 31 → 14 chord changes across the 32 bars).

## v2 — change request 2: drum velocity contour

- `DRUM_VELOCITY_CONTOUR` on: flat velocity-96 hits replaced with accents and
  ghosts — kick accented on beat 1 (114), mid-bar kick ghosted (76); backbeat
  snares accented (106/104) with the 4-& snare as a true ghost (44); hats accent
  the downbeats (92/86) with swung offbeats as ghosts (56/62); open hat 84.
- Placement untouched: all 416 drum hits keep identical times and drum
  assignments; only velocities changed (verified — 416/416 velocity-only diffs).
- EP, bass, and melody tracks are bit-identical to v1.
