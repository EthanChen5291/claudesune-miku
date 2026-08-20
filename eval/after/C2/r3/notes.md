# seven-currents — session notes (eval/after/C2/r3, replicate 3)

Brief: instrumental groove, 7/8 @ 140 BPM, D dorian, form A B C A, 8-bar sections.
C is a bridge that withholds the bass (`withhold: ["bass"]` + `sets_up: "A"`), so the
bass returning in the final A is the payoff. Separate labeled layers per voice:
kick / hats / bass / keys / lead (+ perc in B, transition labels impact & fill).

## v0 — generate

```
node src/cli.js generate eval/after/C2/r3/spec.json --out eval/after/C2/r3
```

- All-library-bound core: kick `seven_pulse_223`, hats `seven_hats_223`, bass
  `seven_syncopated` + `bass_root_five`, lead = motif m1 (`dorian_lift` — peaks on the
  raised 6th that names the mode) on `seven_offbeat_lift` (A), `seven_syncopated` (B),
  inverted on `seven_offbeat_lift` (C). Free-pattern quartal keys per section.
- Green on first run: B density must (40 vs >31.05), C.withhold.bass silent,
  C.payoff.bass->A (96 onsets) — the withhold/payoff structure the brief asked for.

## v1 — edit 1: swing/shuffle on the hats only

```
node src/cli.js edit eval/after/C2/r3 \
  --spec <scratchpad>/spec-edit1-swing-hats.json \
  --allow-binding hats_A,hats_B,hats_C --aspects time \
  --note "shuffle feel on the hats only: microtimed 2+2+3 variant delays the second pulse of each group by 1/28 (offbeat at 62.5% of the pair)"
```

- Implemented as a microtimed inline variant of `seven_hats_223` (same onsets/accents,
  `microtiming` delays pulses 2, 4, 6 — the "and" of each 2+2+3 group — by 1/28, i.e. the
  offbeat lands at 62.5% of its pair, between straight and triplet shuffle).
- Two rejected attempts used the binder's `swing`/`swingSubdiv` (`.swingBy()`): in 7/8 the
  hats haps straddle swing-window halves, so Strudel's swingBy re-sampling duplicated
  haps and leaked into the gain/sound aspects. The microtiming route shifts the onsets in
  the emitted grid itself: gate result "timing changed (+96/-96 onsets), pitches
  unchanged" — hats/time only, everything else provably untouched.

## v2 — edit 2: sparser lead, A sections only

```
node src/cli.js edit eval/after/C2/r3 \
  --spec <scratchpad>/spec-edit2-sparse-lead-A.json \
  --allow-binding lead_A --sections A \
  --note "sparser lead in the A sections only: seven_offbeat_lift (4 onsets/bar) -> sparse_pedal (2 onsets/bar); B and C leads untouched"
```

- `lead_A` rhythm swapped `seven_offbeat_lift` (4 onsets/bar) → `sparse_pedal`
  (2 onsets/bar, "space is the material"); motif m1 and tonic cadence kept, so the melody
  identity survives (contour 100% preserved, cadence still resolves to D4).
- Scope: binding `lead_A` + `--sections A` — lead went 144→112 haps, all inside A's
  cycles; B/C lead assertions byte-identical (m1.notes 48/32 unchanged). B's density
  must got easier (40 vs >28.75) — no musical regression.

Final state: `verify` exit 0, all assertions PASS (WARN-level b9/low-interval/interlock
notes only, none declared). Versions: v0, v1, v2.
