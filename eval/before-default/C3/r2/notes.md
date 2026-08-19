# Lo-fi beat — build notes

**Piece:** "Half Asleep in C Minor" — C minor, 84 BPM, 4/4, form A B A B
(verse/chorus, 8-bar sections) plus a 1-bar tonic tag so the track resolves.
~97 seconds.

## Tools & format

- One self-contained Python script per version (`vN/song.py`), depending only
  on numpy (plus ffmpeg for the mp3 encode). No DAW, no external libraries.
- The script composes the track as note data, then emits **both**:
  - `lofi-beat.mid` — standard MIDI format 1 (GM programs: E.Piano chords,
    fingered bass, vibraphone melody, channel-10 drums), so it can be opened
    or re-rendered in any DAW/sequencer;
  - `lofi-beat.wav` (+ `lofi-beat.mp3`) — rendered by a small numpy
    synthesizer built into the script (Rhodes-ish additive e-piano, sine
    bass, mellow vibrato lead, synthesized kick/snare/hats), through a lo-fi
    master chain: warm tape-style high rolloff, rumble highpass, vinyl
    crackle + hiss, soft clip.
- Swing is a single timing map (offbeat 8ths at 60% of the beat, 16ths
  interpolated) applied identically to the MIDI ticks and the audio render.
- Everything is deterministic (seeded noise), so versions differ only where
  a change request touched them. Each `vN/` is self-contained; re-running
  `python3 vN/song.py` regenerates that version's mid/wav/mp3 in place.

## v0 — initial version

- Harmony: verse loop Cm9 → Fm9 → Abmaj9 → G7b13, chorus loop Abmaj9 → Bb13
  → Ebmaj9 → G7b9; rootless 4-note e-piano voicings (7ths/9ths/13ths/altered
  tensions), one chord per bar, lazy two-hit comping pattern.
- Sleepy melody: sparse C-minor-pentatonic-plus-9th phrases with long notes
  and rests, one 8-bar line for the verse and one for the chorus; bass plays
  root/fifth with chromatic approach into each chord change.
- Drums: boom-bap kick (1 and the swung "and" of 3), backbeat snare with
  ghost-position hits, swung closed 8th hats with an open hat every 4th bar —
  all at uniform per-drum velocities in this version.

## v1 — change request 1: halve the harmonic rhythm

- `BARS_PER_CHORD` 1 → 2: every chord now lasts two bars, so chord changes
  drop from 32 to 16 across the piece; both 4-chord loops are preserved,
  just stretched (verse: Cm9 ×2 bars, Fm9 ×2, Abmaj9 ×2, G7b13 ×2, etc.).
- Bass roots/approach notes follow the new chord timeline (the bass is part
  of the harmony); its rhythmic pattern is unchanged.
- Verified nothing else changed: melody, drums, comping rhythm, and bass
  rhythm are byte-identical to v0; only which chord sounds on which bar
  differs.

## v2 — change request 2: drum velocity contour

- Replaced the uniform `drum_velocity()` with a contour: kick 114 on the
  downbeat / 98 on the swung pickup / 82 on the bar-4 lead-in; snare
  backbeats 104 and 110; the ghost-position snare hits drop to velocity 34
  (true ghost notes).
- Closed hats get an 8-step contour across the bar (96 down to 56, accents
  on the downbeat and beat 3, breathy swung offbeats) with a small
  alternating-bar lilt; open hat sits at 88.
- Verified timing and instrumentation are untouched: all 442 drum hits occur
  at identical times on identical drums as v1 (only velocities differ), and
  all non-drum tracks are byte-identical to v1.
