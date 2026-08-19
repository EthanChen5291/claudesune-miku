# House track — F minor, 122 BPM, form A B A' B (16-bar sections)

## Tools and format

- **Generator**: a single self-contained Python script (`track.py`, numpy only) per
  version. All musical content lives in pattern data (chord progression, bass
  pattern, hat pattern, melodies) that feeds both renderers, so note data and
  timbre are cleanly separated.
- **Deliverables per version** (each `vN/` is self-contained):
  - `house_f-minor_122.wav` — fully synthesized 16-bit/44.1kHz stereo audio
    (~2:08), directly listenable.
  - `house_f-minor_122.mid` — standard MIDI file (format 1), renderable/editable
    in any DAW.
  - `track.py` — the source; `python3 track.py` re-renders both files.
- **Synthesis**: additive band-limited saw/square oscillators (spectral-tilt
  "filter"), FFT-bandpassed noise percussion (kick/clap/hats/shaker/rim/crash),
  beat-synced sidechain pump on the harmonic bus, dotted-8th lead delay, tanh
  bus limiting. Per-drum-voice deterministic RNG streams so editing one voice's
  pattern never alters another voice's rendered noise.
- **Arrangement**: 4-on-the-floor kick, claps on 2/4, off-beat bass pump over
  Fm–Db–Ab–Eb. A = sparse mid-register lead (Db4–C5); B (chorus) = denser
  higher lead, sustained wide pads, 16th arp, extra stabs, shaker, crash, riser
  into it; A' = same melody as A with busier drums (16th shakers, rims, extra
  claps).

## v0 — initial version

- Full A B A' B arrangement (64 bars, 125.9 s + tail) built from scratch:
  drums, off-beat house bass, chord stabs, verse and chorus melodies in F minor.
- Chorus lift by design: measured RMS 0.305 (A) vs 0.339 (B), stereo side
  energy about 4x wider in B; B lead spans Bb4–Bb5 vs the verse's Db4–C5.
- A' verified to reuse the exact A melody while adding shaker 16ths, rim
  syncopation, and extra claps.

## v1 — change request 1: busier hi-hats (hats only)

- Replaced the 8th-note `HAT_PATTERN` with a full 16th-note closed-hat grid
  (accent scheme) plus a syncopated extra open hat on the 4-and-a-half; hat
  events doubled from 512 to 1024.
- Verified programmatically: every non-hat drum event and every pitched note
  event is identical to v0; per-voice RNG streams keep all other audio
  untouched.

## v2 — change request 2: bigger chorus lift (verses untouched)

- Chorus lead pushed up an octave (max pitch Bb5 → Bb6, mean pitch +6
  semitones) with a harmony line kept at the old register underneath — higher
  AND denser (B lead notes 184 → 368).
- More chorus density: arp now alternates one/two octaves up (top pitch
  80 → 92), an added high pad shimmer note, and an extra 16th stab pickup;
  B-section note events grew 1368 → 1680.
- Verified: all drum events and all verse (A/A') note events are bit-identical
  to v1.

## v3 — change request 3: darker bass sound (timbre only)

- `BASS_TIMBRE` only: spectral corner 1800 Hz → 380 Hz with steeper rolloff,
  saw layer pulled back (0.75 → 0.55), sine sub raised (0.55 → 0.85), slightly
  warmer drive — measured bass spectral centroid dropped 878 Hz → 299 Hz.
- MIDI patch mirrored: GM program 38 (Synth Bass 1) → 39 (Synth Bass 2).
- Verified: drum and note event lists (including every bass note and its
  rhythm) are identical to v2 — the change is purely timbral.
