# aurora-circuit — session notes (eval/after/C4/r3)

Melodic trance, 4/4, 138 BPM, form A B C B (8-bar sections). C is a breakdown that
`sets_up` the final B, withholding kick + bass so their return IS the drop.

## v0 — generate

```
node src/cli.js generate eval/after/C4/r3/spec.json --out eval/after/C4/r3
```

- Labeled layers per voice: kick (four_floor), hats (offbeat_8ths / sixteenth_drive),
  clap (backbeat_ghost, chorus only), bass (offbeat_8ths x bass_root_five), arp
  (gallop_arp x spiral_up), lead (push_pull_16s x rise_anthem, cadence tonic), pads
  (free chord pattern). Key A:minor, i–VI–III–VII verse harmony, VI–VII–i–V chorus.
- Transitions into each chorus: riser_hat_swell + fill_snare_roll into B occurrence 1;
  riser_noise_sweep (2 bars) + sub_drop into the last B out of the breakdown.
  All assertions green first run (density > 1.3x A, register span wider, withhold/payoff).

## v1 — edit 1: bigger transition into the final chorus

```
node src/cli.js edit eval/after/C4/r3 \
    --spec <scratchpad>/edit1-spec.json --allow riser,fill \
    --note "bigger transition into final chorus: last riser 2->4 bars, add snare-roll fill"
```

- riser_noise_sweep into the last B lengthened from 2 bars to 4; fill_snare_roll added
  into the last B (was only on the first chorus).
- Containment PASS with only riser + fill labels allowed — every other label byte-identical
  (changelog: riser 34->36 haps, fill 16->32 haps; nothing else moved).

## v2 — edit 2: key change A minor -> B minor

```
node src/cli.js edit eval/after/C4/r3 \
    --spec <scratchpad>/edit2-spec.json --allow bass,arp,lead,pads --aspects pitch \
    --note "transpose key A minor -> B minor; rhythms, sounds, gains untouched"
```

- key A:minor -> B:minor; every chord symbol transposed a whole step (Am9->Bm9, F^7->G^7,
  C^7->D^7, G7->A7, E7->F#7). Nothing else in the spec touched.
- Gate proves pitch-only: arp 288, bass 96, lead 112 pitches changed, pads 74 —
  "timing unchanged", no sound/gain deltas; drums and transition labels untouched.
  (The sub_drop impact keeps its fixed c1 sub boom — transition material, out of scope,
  flagged only as a free-material WARN.)

Final state: 3 versions (v0..v2), verify exit 0, no FAIL-level assertions at any step.
