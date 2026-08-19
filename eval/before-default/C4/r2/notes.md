# Aurora — build notes

## Tools & format

- **Tools:** pure Python 3 + numpy only (no DAW, no external MIDI/audio
  libraries were available). One self-contained script per version,
  `make_track.py`, does everything.
- **Formats:** each version ships a listenable stereo **WAV** render
  (`aurora.wav`, 44.1 kHz / 16-bit, ~115 s) synthesized by a small numpy
  softsynth (supersaw pads/lead, filtered saw bass + sub, pluck arp,
  synthesized kick/snare/clap/hats/crash, noise + pitch risers, sidechain
  pump, ping-pong delay on the lead, FFT-convolution reverb), plus a
  **Standard MIDI File** (`aurora.mid`, format 1: pads / bass / lead / pluck
  arp / riser FX / GM drums) for DAW use, written by a from-scratch SMF
  writer.
- **Musical design:** 138 BPM, form A B C B with 16-bar sections.
  A = intro (kick/bass/arp/pads), B = chorus with supersaw lead melody over
  the i–VI–III–VII progression, C = breakdown (kick/bass out, pads + emotive
  lead, arp build) that sets up the final B. Riser + snare-fill transition
  material precedes each chorus. Fixed RNG seeds keep renders reproducible.

## v0 — initial version (A minor)

- Built the full arrangement: A (bars 0–15), B1 (16–31), C breakdown (32–47),
  B2 (48–63), ending hit + reverb tail; progression Am–F–C–G.
- Wrote the 8-bar chorus lead melody (played twice per chorus, rising
  variation ending) and a sparse long-note breakdown lead.
- Transitions into both choruses: 2-bar noise + pitch riser and a 1-bar
  accelerating snare fill (8ths → 16ths), crash + sub-drop impact on each
  chorus downbeat.

## v1 — bigger final transition (transition material only)

- Extended the riser into the final chorus from 2 bars to 4 (bars 44–47),
  with a wider upward pitch sweep (starts lower, still lands on E6).
- Replaced the 1-bar fill with a 2-bar accelerating drum fill (bars 46–47):
  snare roll stepping 8ths → 16ths → 32nds with a longer crescendo.
- Verified by per-bar audio diff vs v0: only bars 44–48 differ (the
  transition and its tail); the intro transition and all other material are
  untouched.

## v2 — key change A minor → B minor (pitch transposition only)

- Transposed every pitched part (+2 semitones): pads, bass, lead, arp, and
  the pitched riser tone; chords now Bm–G–D–A. MIDI key signature updated to
  B minor.
- Drums, all rhythms/timings, contours, sound design, and mix are exactly as
  in v1 — verified by MIDI diff (every pitched note exactly +2, drum track
  bit-identical) and a pitch-class histogram of the render (now B-minor
  weighted: B, D, F#, A, E).
