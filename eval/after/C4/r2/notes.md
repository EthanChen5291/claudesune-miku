# meridian-arc — eval C4 replicate 2 (session notes)

Melodic trance, form A B C B (8-bar sections), 4/4, 138 BPM. C is a breakdown
declared with `sets_up: "B"` and `withhold: ["kick", "bass", "clap"]` — the
withheld low end returning at the final chorus is the payoff, landed by a
`sub_drop` impact. Separate labeled layers per voice: kick, hats, clap, bass,
pads, arp, lead (+ transition labels riser, fill, impact).

## v0 — initial generation

```
node src/cli.js generate /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C4/r2/spec.json \
    --out /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C4/r2
```

- A minor, bound library material throughout: four_floor kick, offbeat_8ths
  hats/bass (the trance exhale), gallop_arp (pendulum_fifth in A, spiral_up in
  B/C), push_pull_16s lead on motif m1 = rise_anthem (cadence: tonic); free
  pads voicings per section (drop2 verse, power_sus chorus, cluster_upper
  breakdown).
- Transitions into each chorus: riser_hat_swell into both Bs + fill_snare_roll
  into B occ 1, fill_tom_run into the last B, sub_drop impact on the final
  drop. Verified green: exit 0, all FAIL-severity assertions pass (density
  1.36x A vs target 1.3x, register span 69 vs 31, withhold/payoff, 100%
  chord-tone accents on bound labels, motif notes/contour exact).

## v1 — edit 1: bigger transition into the final chorus (transition material only)

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C4/r2 \
    --spec <scratchpad>/spec-e1.json \
    --allow riser,fill \
    --note "bigger transition into the final chorus: 4-bar noise riser out of the breakdown + 2-bar snare-roll fill (transition labels only)"
```

- Last riser: riser_hat_swell (2 bars) -> riser_noise_sweep with `bars: 4` —
  the longer breakdown->chorus riser; last fill: fill_tom_run (1 bar) ->
  fill_snare_roll with `bars: 2`. First-chorus riser/fill and the sub_drop
  byte-identical.
- CONTAINMENT PASS: only labels `riser` and `fill` changed (riser 64->36 haps,
  fill 24->48 haps); every other label unchanged. No musical regressions.

## v2 — edit 2: key change A minor -> B minor (pitch only)

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C4/r2 \
    --spec <scratchpad>/spec-e2.json \
    --allow bass,pads,arp,lead --aspects pitch \
    --note "key change: A minor -> B minor. Pitch-only transposition; rhythms, contours, sounds untouched"
```

- Spec diff: `key` "A:minor" -> "B:minor" and every harmony chord transposed a
  whole step (Am9->Bm9, F^7->G^7, C^7->D^7, G7->A7, Em7->F#m7, E7->F#7).
  Nothing else touched.
- CONTAINMENT PASS under the `pitch` aspect contract: bass/arp/lead changed
  every pitch with timing/sound/gain signatures identical; pads changed 74
  pitches (voicing register wraps are still pitch-only); drums and transition
  labels untouched. Verify exit 0, zero FAILs.

(scratchpad = /private/tmp/claude-501/-Users-ethanchen-Documents-GitHub-motif-engine/adc11f0b-83e0-4b6a-ac5c-02772dba1d0a/scratchpad; the accepted spec is written back to eval/after/C4/r2/spec.json by the edit command.)
