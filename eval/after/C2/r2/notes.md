# verdigris-seven — session notes (eval/after/C2/r2, replicate 2)

7/8 instrumental groove, 140 BPM, D dorian, form A B C A (8-bar sections).
C is the bridge: `withhold: ["bass"]` + `sets_up: "A"`, so the bass returning in
the final A is the declared payoff (asserted green: `C.withhold.bass`,
`C.payoff.bass->A`). Separate labels per voice: kick / hats / bass / lead / keys
(+ clap in B, impact/fill transition labels). All melodic/drum material is bound
library entries (seven_pulse_223, seven_hats_223, seven_syncopated,
seven_offbeat_lift, sparse_pedal; contours dorian_lift, pendulum_fifth); only the
keys comping is free-pattern voicings.

## v0 — initial generation

```
node src/cli.js generate /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C2/r2/spec.json \
    --out /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C2/r2
```

- Green on first run: lint clean, eval ok, 0 FAIL-level assertions
  (B.must.density "> 1.15x A" measured 40 vs 35.07; withhold/payoff pass;
  100% chord tones on all accented bound onsets; motif m1 = dorian_lift,
  inverted in C). Remaining WARNs are advisory (b9/low-interval limits,
  B bass+lead rhythmic unison — an intentional chorus doubling).
- Transitions: impact_boom into C (marks the bridge), fill_tom_run into the
  last A (sets up the bass payoff).

## v1 — Edit 1: swing/shuffle feel on the hats only

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C2/r2 \
    --spec <edited spec: added "swing": 0.12, "swingSubdiv": 3.5 to the hats bind in A, B and C> \
    --allow-binding hats_A,hats_B,hats_C --aspects time \
    --note "swing/shuffle feel on the hats (swingBy 0.12 over 3.5 windows — delays the odd 8ths of the 2+2+3)"
```

- `swingSubdiv: 3.5` was chosen deliberately: with hats on all seven 8th-note
  pulses, the default `swingBy(x, 7)` moves nothing (every onset sits at a window
  start — verified headlessly first). 3.5 windows per cycle delays pulses
  2, 4 and 6 (1/7, 3/7, 5/7) — a true shuffle inside the 2+2+3.
- CONTAINMENT PASS: hats 224→224 haps, timing changed (+112/-112 onsets),
  pitches/sounds/gains unchanged; every other label byte-identical. No new FAILs.
- (Process note: a re-run of the same command to read its output produced a
  duplicate no-op v2 — "no haps changed anywhere", content-identical to v1;
  its files were deleted and the log entry removed so the version history stays
  v0 → v1 → v2 as intended.)

## v2 — Edit 2: sparser lead, A sections only

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C2/r2 \
    --spec <edited spec: A-section lead bind rhythm "seven_offbeat_lift" -> "sparse_pedal"> \
    --allow-binding lead_A \
    --note "sparser lead in the A sections only: seven_offbeat_lift (4 onsets/bar) -> sparse_pedal (2 anchors/bar); B and C leads untouched"
```

- A-section lead drops from 4 offbeat onsets/bar to 2 anchors/bar
  (lead label: 144→112 haps overall). `lead_A` feeds both A occurrences, so both
  A sections got sparser; diff of v1 vs v2 shows `lead_A` is the ONLY changed
  line — lead_B and lead_C byte-identical, B/C untouched.
- No musical regression: withhold/payoff still green, and B.must.density margin
  over A widened. The dorian_lift motif now unfolds across four bars instead of
  two — more space, same identity (tonic cadence on D4 preserved).
