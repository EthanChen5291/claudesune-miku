# Melodic Trance Track — Build Notes

## Tools & format

- **Generator**: a single self-contained Python script (`trance_track.py`, pure
  numpy + stdlib, no external audio dependencies), copied into each version
  directory and edited only in its CONFIG block, then re-run.
- **Outputs per version**: `melodic_trance.wav` (44.1 kHz 16-bit stereo,
  fully synthesized and directly listenable) and `melodic_trance.mid`
  (format-1 General MIDI with tempo/key metadata, one track per instrument,
  drums on channel 10) — importable into any DAW.
- **Synthesis**: additive band-limited saws with per-harmonic decay
  (pluck/supersaw/pad tones), sine-sweep kick, seeded-noise percussion,
  noise+tonal-sweep riser, kick-driven sidechain pump, dotted-eighth
  ping-pong delay on the lead, tanh soft-clip master. Noise generators are
  seeded so renders are deterministic across versions.
- **Musical design**: 138 BPM, A minor, form A B C B at 16 bars each
  (A = groove intro, B = chorus, C = breakdown that strips the kick and sets
  up the final chorus). Harmony i–VI–III–VII (Am–F–C–G), offbeat bass,
  rolling 16th plucks/arp, 8-bar lead phrase; riser + snare-fill transition
  material precedes each chorus.

## v0 — initial version

- Full 64-bar arrangement: A (kick/bass/hats, plucks + arp layering in),
  B1 chorus (lead melody, claps, open hats, crash), C breakdown (kick-free
  pads + emotive lead line, arp velocity build), B2 final chorus with the
  lead doubled an octave up; closing crash/chord hit at bar 64.
- Transitions into both choruses: 2-bar noise/tonal riser plus a 1-bar
  eighth-note snare fill with rising velocity (bars 15 and 47).
- Rendered WAV verified for section dynamics (breakdown quietest, choruses
  loudest) and MIDI verified structurally (8 well-formed tracks).

## v1 — change request 1 (bigger transition into final chorus)

- Final-chorus riser lengthened from 2 bars to 4 bars (bars 44–47) with a
  deeper swell.
- Drum fill enlarged from one bar of eighth-note snares to a 2-bar
  escalating fill: eighth-note snares (bar 46) into a sixteenth-note snare
  roll plus a driving kick roll (bar 47).
- Scope check: rendered audio is bit-identical to v0 everywhere outside the
  transition zone (only bars 44–48 differ, plus ~0.11 s of the last fill
  snare's natural decay ringing over the bar-48 downbeat). The first
  chorus's transition is untouched.

## v2 — change request 2 (key change to B minor)

- All pitched material (bass, plucks, arp, lead, pads, riser tonal sweep)
  transposed up 2 semitones from A minor to B minor; MIDI key signature
  updated to 2 sharps (minor).
- Unpitched material (kick, snares, claps, hats, crashes, riser noise) and
  every rhythm, duration, velocity, and sound patch left untouched —
  verified event-by-event against v1 (identical timing/velocity, pitched
  notes exactly +2) and spectrally (first chorus lead peak moves
  444 Hz → 498 Hz, exactly a 2-semitone ratio).
- No other changes: same arrangement, same big final transition from v1.
