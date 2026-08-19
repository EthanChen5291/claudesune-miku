# Notes — "Attic Light" (lo-fi hip-hop, C minor, 84 BPM)

## v0.strudel — initial song
- Full A B A B form (8 bars per section, 1 cycle = 1 bar) built per-voice with `arrange`; tempo via `setcpm(84/4)` = 84 quarter-note BPM. Nine labeled voices: kick, snare, hats, openhat, rim, bass, chords, lead, vinyl.
- Jazzy extended harmony as explicit voicings, one chord per bar: A = Cm9 · Fm9 · Abmaj7 · G7b9, B = Fm9 · Bb9 · Ebmaj9 · G7b9; epiano comps on beat 1 and the and-of-3 via `.struct("x ~ [~ x] ~")`, acoustic bass walks roots/fifths underneath.
- Swung 8th-note hats (`swingBy(1/3, 4)`, also applied to open hats), boom-bap kick/snare in 2-bar patterns, sleepy sparse vibraphone melody with delay, and a crackle layer for vinyl noise. All drum voices at uniform per-voice gain.

## v1.strudel — Edit 1: halve the harmonic rhythm
- Appended `.slow(2)` to `chordsA` and `chordsB`, so each chord now lasts 2 bars instead of 1 (the 4-chord progression fills the full 8-bar section once instead of twice). Section lengths are multiples of the slowed pattern period, so chords stay aligned across the A B A B arrangement.
- The epiano comping rhythm (`.struct` after `arrange`) is untouched — same hits per bar, just half as many chord changes.
- Nothing else changed: bass, melody, drums, arrangement, and effects are identical to v0 (per the stated scope, only the chord layer was slowed).

## v2.strudel — Edit 2: drum velocity contour
- Replaced the uniform scalar `.gain(...)` on kick, snare, hats, and rim with mini-notation gain patterns that mirror each hit grid: accents on strong hits, low values as ghost notes, and mid filler values on rest positions so no event is dropped or moved. Timing and which drums hit are unchanged.
- Contours: kick beat-1 accents (1.0) with soft syncopated pickups (.5–.55) and medium mid-bar hits (.85–.9); snare backbeats accented (.9/.95) with the extra 16th-note snares turned into ghosts (.3–.35); hats accent the swung offbeats (.75–.85) with quiet downbeats (.45–.5) and ghosted doubled 16ths (.3–.35); rim gets one accent (.7) and one ghost (.4). Gains are applied before `swingBy`, so they align with the unswung grid.
- Open hat A kept its scalar gain (it hits once per 2 bars, so a single velocity is its contour); open hat B alternates .6 / .45 across its two hits. Non-drum voices (bass, chords, lead, vinyl) untouched.
