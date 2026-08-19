# Lo-fi hip-hop beat — C minor, 84 BPM — build notes

## Tools & format

- **One self-contained Python script per version** (`compose.py`, stdlib + numpy only).
  The composition lives as note-event data; the same event list drives two outputs:
  - **`lofi_cminor_84.mid`** — hand-written Format-1 Standard MIDI File (tempo track +
    EP chords / bass / vibraphone melody / ch-10 drums), for editing in any DAW.
  - **`lofi_cminor_84.wav`** — 44.1 kHz stereo render from a small numpy softsynth
    (additive EP, sine-stack bass, vibes-style melody with vibrato, synthesized
    kick/snare/hats, plus lo-fi mastering: 8.2 kHz lowpass, vinyl crackle + hiss,
    tape-ish saturation).
  - **`lofi_cminor_84.mp3`** — ffmpeg encode of the WAV for easy listening.
- Rendering is deterministic (fixed RNG seed); re-running any version's script
  reproduces its outputs exactly.
- Musical spec honored across all versions: C minor, 84 BPM, A B A B with 8-bar
  sections (32 bars, ~94 s), swung 8th hats (~63% swing applied to all offbeat 8ths),
  extended jazz harmony (m9 / maj9 / 7b9 / m7b5 / 13 chords), sparse behind-the-beat
  melody in the G4–Eb5 range.

## v0 — initial version

- A section: Cm9 · Fm9 · Abmaj9 · G7b9 · Cm9 · Ebmaj9 · Dm7b5 · G7b9 (one chord per
  bar); B section: circle-of-fifths run Fm9 · Bb13 · Ebmaj9 · Abmaj9 · Dm7b5 · G7b9 ·
  Cm9 · Cm9. Two lazy EP stabs per bar; bass plays roots/fifths with chromatic
  approach notes into changes.
- Two distinct sleepy melodies (verse and chorus), long tones entering behind the
  beat, chord-tone targets (9ths/7ths emphasized), swung where they land on offbeats.
- Drums: boom-bap two-bar loop (kick 1 & 2-and, extra 3-and kick every other bar;
  snares on 2 & 4; swung closed 8th hats; open hat closing each 4-bar phrase) at
  uniform per-instrument velocities.

## v1 — change request 1: halve the harmonic rhythm

- `HARMONIC_RHYTHM` 1 → 2: chords now change every **two** bars instead of every bar;
  each change-bar's chord is held through the following bar (A becomes Cm9 · Abmaj9 ·
  Cm9 · Dm7b5, B becomes Fm9 · Ebmaj9 · Dm7b5 · Cm9, two bars each).
- Bass note choices follow the held harmony (roots/fifths/approach targets update),
  since they are derived from the chords — the bass *rhythm* pattern is unchanged.
- Verified nothing else changed: melody, drums, comping rhythm, durations and
  velocities are event-for-event identical to v0; chord-change count across the song
  dropped 29 → 15, and every differing event differs only in pitch.

## v2 — change request 2: drum velocity contour

- Closed hats get an 8-slot accent/ghost contour per bar (92/48/68/52/86/50/72/56):
  strong on beats 1 and 3, ghost notes on the swung offbeat 8ths; the second bar of
  each 2-bar loop plays 6 ticks softer for a breathing feel.
- Kicks differentiated: downbeat accent 114, syncopated 2-and kick 96, the 3-and
  pickup kick 82; snares get a backbeat lean — 102 on beat 2, accented 112 on beat 4;
  open hats sit at 78.
- Verified scope: exactly the same 400 drum hits at the same (swung) times on the
  same instruments; all non-drum events byte-identical to v1 — only drum velocities
  changed (4 distinct values → 20-value contour).
