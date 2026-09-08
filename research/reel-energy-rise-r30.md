# r30 — the repeating-interval energy figure, measured off his example

**His ask:** *"i think you should try the synth/violin rise i mentioned in
energetic songs though. like some given intervals and it repeats those intervals
over and over to convey energy (changing chords as needed or repeating). i left an
example - it's in piano but look at the right side repeating chords - like that
kinda energy"*

**The example**: `Screen Recording 2026-08-30 at 1.55.40 PM.mov`, 23.1s, 60fps —
a YouTube Synthesia video, search bar reads *"demon slayer infinity castle midi"*,
watermark *"Entrance to Infinity Castle — Advanced Piano Version"*. Local only,
never committed.

## Method, and what it cannot see

Key-state tracking off the on-screen keyboard at 60 fps: 88 sample points (one per
piano key), lit-test `R−B>60 && R>120`, note-on = unlit→lit transition.

**Two honest limits.**
1. **The recording has NO AUDIO TRACK** (`ffprobe` shows one h264 stream and
   nothing else). So the r27 cross-check — video for pitch, audio onsets for
   re-strikes — is unavailable, and a note re-struck while its key is already lit
   is invisible. **Every count below is a LOWER BOUND.**
2. **Black-key phantoms.** A black key sampled at the boundary picks up the lit
   white key below it. Seven pitches (D#2 A#2 D#3 G#3 A#3 G#4 A#4) fired *only*
   ever alongside the white key a semitone down and are removed as artifacts;
   F#4 survives the test because it fires alone 3 times. 147 raw events → 120.

## The measurement

**Tempo.** Bass changes are evenly spaced: n=11, median **1.734s**, sd 0.078 —
one chord per bar at **138.4 BPM** in 4/4. The right hand's within-cell IOI is a
median **0.2160s** = exactly **1.00 eighth note** at that tempo (51 intervals).

**The figure.** A 3–4 note DESCENDING cell in the upper register, in straight
8ths, filling half a bar and repeating:

| | notes | shape | scale degrees (descending) |
|---|---|---|---|
| cell A | B4 G4 F#4 E4 | 4 notes, 4 consecutive 8ths | **5 – ♭3 – 2 – 1** in E minor |
| cell B | C5 G4 F4 | 3 notes + an 8th rest | **5 – 2 – 1** in F |

Both are the same idea: **walk the scale ladder down from the 5th to the root,
then jump back to the top and do it again.** In the engine's own dialect
(D101's ladder `R s2 3 s4 5 s6 s7`) that is `5 3 s2 R` and `5 s2 R`.

**THE CELL DOES NOT FOLLOW THE CHORD — this is the finding.**

| cell | plays over these basses | bars |
|---|---|---|
| `C5 G4 F4` | **D, C, F, D, C, F** | 3.4–6.4s, 16.3–19.3s |
| `B4 G4 F#4 E4` | **D, B, E** | 1.5–3.1s, 11.1–15.2s |

Five different bass notes under one unchanged three-note cell. The right hand is
**frozen** and the harmony moves underneath it — which is exactly his own
parenthesis, *"changing chords as needed or repeating"*, and exactly R2 from
`research/reel-layers-r22.md` (*"Freeze the body, move one slot"*), now confirmed
by a **completely independent source**: R2 was 4 reels / 1 producer, and this is
an anime OST piano arrangement by someone else entirely.

The cell switches when the harmony moves somewhere it no longer fits — the swap
at 15.67s happens mid-bar over a D bass, not on a section boundary.

**Two more details.**
- **Octave doubling on accents**: `F4+F5`, `C4+C5`, and once `F4+C5+F5`. 15 of 81
  instants are 2–3 note stacks — his *"repeating chords"*, literally.
- **The left hand is octave-doubled roots**, one per bar, held (`C2+C3`, `F2+F3`,
  `B1+B2`, `E1+E2`) — role A from r22, again independently.

## What this is NOT

- **It does not rise.** He called it "the synth/violin rise"; the reference figure
  DESCENDS every time. What rises is the re-attack — the line falls 5→1 then
  jumps back to the 5th, a sawtooth. Recorded as a conflict between his word and
  his example; his ear settles it, not me.
- **One source, 23 seconds, one arrangement.** Nothing here is "how game music
  works". It is one figure he pointed at.
- **The engine's existing `motorFall` is close but not this.** `motorFall`
  (r28, his own spec: *"8th 5th 2nd root repeated over and over again 8th note"*)
  is `R+ 5 s2 R` — the same descent — but it **re-pitches against every chord**.
  The new thing here is the freeze.
