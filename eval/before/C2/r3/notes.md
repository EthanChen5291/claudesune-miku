# Notes — "Sevenfold" (7/8, D dorian, 140 BPM)

## v0 — initial song
- Full A B C A arrangement, 8 bars per section, built with `arrange()` per labeled voice (kick, snare, hats, ride, bass, chords, lead). `setcpm(140/3.5)` makes one cycle = one 7/8 bar (7 eighth-note slots, grouped 2+2+3) at quarter = 140 BPM; everything stays in D dorian.
- Bass is fully withheld in C (`silence` for all 8 bars) while a slow-attack sawtooth pad, rim clicks, and a sparse floaty lead carry the bridge; the final A brings the same A riff back brighter and louder (lpf 600 -> 900, gain .8 -> .95) as the payoff.
- Groove details: 2+2+3 kick (downbeat + beat 5 + alternating pickup), snare on the third eighth with an alternating extra hit, accented straight-eighth hats, offbeat ride in B, Dm7/G7 epiano stabs in A and Em7/G6/Cmaj7 stabs in B.

## v1 — swing on the hats only
- Rewrote the three hat patterns from straight sevens to weighted groups `[hh@2 hh]@2 ...` so each pair of eighths plays long-short (2:1 triplet shuffle); the lone 7th eighth of the bar stays straight, which suits the 2+2+3 grouping.
- Accent gain patterns still line up with the swung onsets, the open hat on the 7th slot in B and the hpf/speed treatment in C are preserved.
- No other layer was touched — kick, snare, ride, bass, chords, and lead are identical to v0.

## v2 — sparser lead in the A sections only
- Thinned `leadA` from ~20 notes per 4-bar phrase to 9, keeping the anchor tones (D5 pickup, F4/A4 resolutions, the C5 -> D4 cadence) on the same grid positions so the motif stays recognizable.
- Only the `leadA` binding changed; it applies to both A sections (opening and final) via the unchanged `arrange`.
- `leadB`, `leadC`, and every other layer are identical to v1.
