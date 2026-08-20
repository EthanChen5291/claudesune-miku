# ion-veil — session notes (eval/after/C4/r1)

Melodic trance, 4/4, 138 BPM, form A B C B (8-bar sections). All commands run from
the repo root `/Users/ethanchen/Documents/GitHub/motif-engine`.

## v0 — generate

```
node src/cli.js generate eval/after/C4/r1/spec.json --out eval/after/C4/r1
```

- A minor at 138 BPM; A = verse (kick/hats/bass/pads/arp), B = chorus adding lead
  (motif m1 = `rise_anthem`, cadence tonic) + clap + 16th hats, with declared
  `must` (density > 1.3x A, register_span wider) and `resolves: A`. C = breakdown
  with `sets_up: B` and `withhold: [kick, bass]` — the low end returning in the
  final B is the payoff (asserted). Separate labeled layers per voice: kick,
  hats, clap, bass, pads, arp, lead (+ transition labels riser/fill/impact).
- Transitions v0: `riser_hat_swell` + `fill_snare_roll` into B occurrence 1;
  `riser_noise_sweep` (2 bars) + `sub_drop` into B occurrence "last".
  Green on first run — all assertions PASS (WARN-level advisories only).

## v1 — edit 1: bigger transition into the final chorus

```
node src/cli.js edit eval/after/C4/r1 \
    --spec <scratchpad>/edit1-spec.json \
    --allow riser,fill \
    --note "bigger transition into final chorus: riser extended to 4 bars, snare-roll fill added"
```

- `riser_noise_sweep` into the last B lengthened from 2 to 4 bars, and a
  `fill_snare_roll` added into the last B (fill label: 16 -> 32 haps).
- Containment PASS with only `riser` and `fill` labels changed; all song layers,
  the first-chorus transitions, and the `sub_drop` impact untouched. ACCEPTED.

## v2 — edit 2: key change A minor -> B minor (pitch only)

```
node src/cli.js edit eval/after/C4/r1 \
    --spec <scratchpad>/edit2-spec.json \
    --allow bass,lead,pads,arp,chords --aspects pitch \
    --note "transpose A minor -> B minor: pitch only, rhythms/contours/sounds unchanged"
```

- Spec change: `key` A:minor -> B:minor and every harmony chord transposed +2
  semitones (A: Bm9 G^7 D^7 A7; B: G^7 A7 Bm9 Em7; C: G^7 A7).
- Containment PASS: timing unchanged on every label, zero sound/gain changes —
  only pitches moved (bass 96, lead 112, arp 288, pads 50). Cadence now resolves
  to B6; all relational/withhold/motif assertions still PASS. ACCEPTED.
  (One new WARN: the library `sub_drop` impact is a fixed c1 sample-note, now
  flagged against G^7 — free transition material, exceptions allowed.)
