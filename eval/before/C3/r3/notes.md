# Notes — C3/r3 "Sleep Signals"

## v0 (initial song)
- Lo-fi hip-hop in C minor at 84 BPM (`setcpm(84/4)`, 1 cycle = 1 bar), A B A B form built with `arrange()` in 8-bar sections: verse Cm9-Fm9-Abmaj9-G7b9, chorus Fm9-Bb13-Ebmaj9-G7b9, all rootless 7th/9th/13th voicings on `gm_epiano1`.
- Separate labeled voices: kick / snare / hats / ohat / bass / chords / lead / crackle. Hats are swung 8ths via `.swingBy(1/6, 4)`; boom-bap kick with syncopated 16ths, snare on 2 and 4, vinyl `crackle` layer for texture.
- Sleepy vibraphone melody in lazy 4-bar phrases (mostly rests, offbeat entries, `.clip(2)` + delay/room), upright-style bass (`gm_acoustic_bass`) holding roots with small chromatic pickups.

## v1 (edit 1: halve the harmonic rhythm)
- Added `.slow(2)` to each chord pattern inside the `chords:` arrange, so each chord now lasts 2 bars instead of 1 (the 4-chord progression fills the 8-bar section once instead of twice).
- Nothing else changed — bass, lead, drums, structure, tempo, and the per-bar chord re-strike rhythm (`.struct("x@5 x@3")`) are untouched; only the rate of chord *change* was halved.

## v2 (edit 2: drum velocity contour)
- Replaced the flat drum gains with patterned gains: hats get an accent/ghost cycle `".7 .3 .5 .35 .65 .3 .55 .4"` (accents on beats 1/3, ghosted offbeats); gain is applied before `.swingBy` so it maps to the pre-swing grid.
- Kick uses a duration-matched gain pattern (`1` on beat 1, `.75` ghost on the "a" of 2, `.9` on the 3.5 hit, `.6` ghost on the bar-2 pickup); snare accents beat 2 (`.95`) over beat 4 (`.8`).
- No timing or hit changes: all gain patterns are continuous-value patterns sampled by the existing drum events, so every hit lands exactly where it did in v1 — only loudness varies. The single open hat keeps its fixed level.
