# Notes — C2/r1 ("Sevenwater", 7/8 groove in D dorian)

## v0.strudel (initial song)
- 7/8 at quarter = 140 via `setcpm(140/3.5)` (one cycle = one 7/8 bar, 40 cpm). Form A B C A built per voice with `arrange([8, ...] x4)`; 10 labeled layers: kick, snare, hats, openhh, perc, clap, crash, bass, chords, lead.
- D dorian throughout: A sections vamp Dm7/G6 (B-natural = dorian color) with epiano stabs; B lifts to F–G6–Am7–G7 with a busier lead; C is the bridge — bass fully silent, kick reduced to a downbeat heartbeat, snare out, sustained saw pads and a floating long-tone lead.
- Payoff engineering: final A brings the bass back louder (gain 1.05 vs 0.85) with a sub-octave `superimpose` layer and adds a clap on the snare hit; kick grouping is 2+2+3 in A vs 3+2+2 in B for sectional contrast.

## v1.strudel (edit 1: swing the hats only)
- Hats-only change: the ghost 16th copies moved from the straight halfway position `.off(1/14, ...)` to the triplet-shuffle position `.off(2/21, ...)` — i.e. each offbeat 16th now lands 2/3 of the way through its eighth note, the classic shuffle placement.
- Ghost gain raised 0.28 -> 0.35 so the swung offbeats are actually audible as a shuffle (still within the hats layer).
- Every other line is byte-identical to v0.

## v2.strudel (edit 2: sparser lead in A sections only)
- Thinned the `leadA` binding from 14 notes per 4-bar phrase to 8, keeping the anchor tones (a4, d5 / e5, c5 / a4, b4 / c5, a4) so the motif identity survives with more air.
- Both A sections reference the same `leadA` binding, so the change hits exactly the two A sections; `leadB` and `leadC` (and all other layers) are untouched from v1.
