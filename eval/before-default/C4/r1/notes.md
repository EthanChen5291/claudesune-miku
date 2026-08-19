# Skyline Static — build notes

## Tools & format

- Single self-contained Python generator (`make_track.py`, numpy only) in each version folder.
  It composes the arrangement as note-event data, then writes:
  - `trance_track.mid` — standard MIDI file (SMF type 1, 480 PPQ, written by a built-in
    dependency-free MIDI writer; GM programs + channel-10 drums, so it opens in any DAW).
  - `trance_track.wav` — 44.1 kHz / 16-bit stereo render from a built-in numpy softsynth
    (synthesized kick/clap/snare/hats/toms/crash, sidechained saw bass, 16th pluck arp,
    supersaw lead, pads, sub, STFT noise-sweep risers, dotted-8th ping-pong delay,
    FFT-convolution reverb, soft-clip master).
  - `trance_track.mp3` — convenience encode via ffmpeg.
- Deterministic (fixed RNG seeds): re-running a version reproduces it exactly, and version
  diffs were machine-verified against the event lists.
- Spec: A minor, 138 BPM, 4/4, form A B C B with 16-bar sections (A verse, B chorus,
  C breakdown that strips the kick and sets up the final chorus). Harmony is the
  i–VI–III–VII loop (Am–F–C–G); one 8-bar lead phrase shared by choruses and breakdown.

## v0 — initial version (A minor)

- Full arrangement: A = kick/bass/arp verse (pads + light claps from bar 8); B = chorus with
  supersaw lead, 16th hats, open hats, claps; C = kickless breakdown (pads + washed lead,
  sub bass entering halfway); B = final chorus identical material to B1.
- Transition into chorus 1: 2-bar riser (bars 14–15) + half-bar 16th snare roll; transition
  into final chorus: 4-bar riser (bars 44–47) + 1-bar fill (16ths escalating to 32nds).
- Crashes on every section downbeat; outro hit at bar 64 rings out over a reverb tail.

## v1 — bigger transition into the final chorus (transition material only)

- Riser into the final chorus lengthened from 4 bars to 8 bars (bars 40–47), sweeping from
  deeper down for a longer climb.
- Drum fill expanded from 1 bar to 2 bars: bar 46 = 8th-note snares with high/mid/low tom
  accents and a launch crash; bar 47 = 16th snares into a 32nd roll, closing on an open hat;
  plus bar-downbeat kick thumps through bars 44–47.
- Verified unchanged: every pitched note, all other drums, and the chorus-1 riser are
  event-identical to v0 (checked programmatically).

## v2 — key change A minor → B minor (pitch transposition only)

- Global `TRANSPOSE = 2`: every pitched note (bass, arp, lead, pads, softlead, sub) moved up
  exactly 2 semitones; the risers' pitched uplifter now glides from the B tonic.
- Verified: identical part/start/duration/velocity on all 1380 notes with pitch exactly +2;
  drum events and riser timings byte-identical to v1 — no rhythm, contour, or sound changes.
- Same synth patches, mix gains, FX, and structure as v1; only the key differs.
