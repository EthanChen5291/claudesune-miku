# Notes — C3/r2 ("Sleepwalk Season")

## v0 — initial song
- Lo-fi hip-hop in C minor at 84 BPM (`setcpm(84/4)`, 1 cycle = 1 bar); ABAB form built with `arrange([8,...],[8,...],...)` per voice — verse: Cm9 / Abmaj9 / Fm7 / G7b9, chorus: Fm9 / Bb13 / Ebmaj9 / Abmaj7 (jazzy 7th/9th voicings via `chord().voicing()`, one chord per bar).
- Separate labeled drum voices: boom-bap kick (two alternating bars), backbeat snare with an occasional 16th drag, 8th-note hats swung with `.swingBy(1/3, 4)`, chorus-only open hat, verse-only rimshot, plus vinyl crackle.
- Sleepy vibraphone melody (sparse, held notes, played `.late(.01)` behind the beat), upright acoustic bass locked to the kick via a shared `struct`, chorus-only sawtooth pad, everything lowpassed and roomy.

## v1 — Edit 1: halved harmonic rhythm
- Appended `/2` to both chord-symbol sequences (`<Cm9 Ab^9 Fm7 G7b9>/2`, `<Fm9 Bb13 Eb^9 Ab^7>/2`), so each chord now lasts 2 bars and one full progression spans an 8-bar section.
- Also slowed the bass root sequences (`/2` on `verseRoots`/`chorusRoots`) since they carry the same harmony — the bass keeps its exact rhythm (roots are separated from `struct`), it just changes root half as often, in sync with the chords. The chorus pad halves automatically via the shared `chorusChords` binding.
- No other change: chord/bass rhythm patterns, melody, drums, mix all identical to v0.

## v2 — Edit 2: drum velocity contour
- Replaced flat drum gains with gain patterns aligned to the existing hits: kick `gain("0.9 [0.9 0.68] [0.9 0.78] [0.62 0.9]")` (downbeat accented, syncopated hits softer, bar-B pickup softest), snare `gain("0.8 0.78 0.8 [0.85 0.32]")` (beat 4 accented over beat 2, the 16th drag becomes a true ghost note at 0.32).
- Hats get an accent/ghost cycle `gain("[0.62 0.32 0.5 0.38]*2")` — onbeats accented, swung offbeats ghosted (gain applied before `swingBy` so values ride the swung hits); open hat and rim alternate loud/soft bars (`"<0.5 0.36>"`, `"<0.42 0.28>"`).
- Timing and hit placement untouched: only `.gain(...)` values changed on drum voices; gain patterns use full-coverage segments (no rests) so no events are added or dropped. Non-drum voices identical to v1.
