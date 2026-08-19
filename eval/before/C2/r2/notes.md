# Notes — "Sevenfold" (7/8 groove in D dorian, form A B C A)

## v0.strudel — initial song
- setcpm(40) so one cycle = one 7/8 bar (eighth = 280/min, quarter = 140 BPM); form built per voice with `arrange([8, A], [8, B], [8, C], [8, A])` = 32 bars.
- A rides a 2+2+3 Dm7 vamp (kick 1 & 5, snare on 3); B shifts to a 3+2+2 feel walking F^7 -> G7 -> Am7 -> C^7; separate labels for kick, snare, hats, perc, crash, bass, chords, pad, lead.
- C is the bridge: bass and piano chords fully silenced, drums thinned to rim/offbeat hats/ride (kick even disappears in bars 6-7 with a pickup in bar 8), and a rising sawtooth pad + sparse lead calls set up the bass returning in the final A as the payoff.

## v1.strudel — Edit 1: swing on hats only
- Added `.late("[0 .025 0 .025 0 .025 0]")` to the hats chain: offbeat eighths (slots 2, 4, 6 of the bar) are pushed ~1/42 cycle late, i.e. triplet-shuffle placement; the 7th eighth (pickup of the 3-group) stays straight.
- Applied at the layer level so it swings hats in every section, including the offbeat-only bridge hats.
- No other voice, pattern, or effect was touched.

## v2.strudel — Edit 2: sparser lead, A sections only
- Rewrote the `leadA` binding: removed the 16th-note pickup runs ([10 9], [12 11]) and thinned bars 1 and 4 (14 attacks per 4-bar phrase down to 9), keeping the D-A-up / C-down contour.
- Since both A sections reference the same `leadA` in the arrange, the first and final A both get the sparser melody.
- `leadB` and `leadC` (and everything else) are byte-identical to v1, so B and C are unchanged.
