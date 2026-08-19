# "Undertow" — build notes

## Tools & format

- **Generator:** a single self-contained Python script (`track.py`, Python 3 + numpy only)
  per version. It synthesizes every voice from scratch (no samples, no external synths)
  and is deterministic — seeded noise, so re-running reproduces the WAV bit-for-bit.
- **Deliverables per version:**
  - `undertow.wav` — 44.1 kHz / 16-bit stereo render (~2:08). The listenable artifact.
  - `undertow.mid` — Standard MIDI File (type 1, hand-rolled writer: tempo/key meta,
    GM drums on ch 10, bass/stab/pad/lead/arp on GM programs) for editing or
    re-rendering elsewhere.
  - `track.py` — the source; run `python3 track.py` to re-render both files.
- **Music:** F minor, 122 BPM, form **A B A′ B**, 16-bar sections (64 bars).
  Chord loop i–VI–III–VII (Fm7 · Dbmaj7 · Abmaj7 · Eb7), four-on-the-floor kick,
  clap on 2/4, rolling offbeat house bass, sidechain-style pump on the tonal busses.
- Each `vN/` is a complete snapshot; every change was applied on top of the previous
  version and scope-checked by diffing the generated event lists between versions.

## v0 — initial version

- A (verse): sparse mid-register lead (F4–C5), 8th-note hats, offbeat chord stabs.
- B (chorus) lifts: melody moves up to C5–Bb5 and doubles in rhythmic density, plus a
  wide detuned pad, a two-octave 16th-note arp, and denser stabs — measurably denser
  (higher RMS) and wider (L/R correlation 0.86 vs 0.98 in A).
- A′: identical melody/bass/chords to A, busier drums — 16th-note closed hats, rimshot
  and shaker patterns, and a tom fill every 4 bars.

## v1 — busier hi-hats (hats only)

- A: closed hats upgraded from downbeat 8ths to accented 16ths.
- B: added a 32nd-note closed-hat flourish into each bar plus a late open hat (3.75).
- A′: two 32nd flourishes per bar plus the extra late open hat. Verified: only the
  closed/open-hat event lists changed (640→832 CH, 256→304 OH); every other part is
  event-identical to v0.

## v2 — bigger chorus lift (B only; A untouched)

- Chorus melody pushed up in register: range C5–Bb5 → F5–Eb6, mean pitch up ~4.6
  semitones, top note Bb5 → Eb6.
- Chorus made denser: 8 notes/bar instead of 6, plus a second harmony voice (diatonic
  thirds/sixths under the main line) — B-section lead notes 192 → 384.
- Verified: verse (A/A′) lead events and all non-lead parts are byte-identical to v1.

## v3 — darker bass (timbre only)

- Bass voice swapped from a bright saw/square pluck (lowpass ~950 Hz) to a round
  filtered sub: sine + soft triangle + gentle 2nd harmonic, lowpass ~330 Hz, softer
  attack. Spectral centroid of the bass voice: 460 Hz → 126 Hz.
- MIDI bass program updated to match (Synth Bass 1 → Synth Bass 2) — timbre label only.
- Verified: the full event data (all notes, rhythms, velocities — bass included) is
  identical to v2; only the bass synthesis changed.
