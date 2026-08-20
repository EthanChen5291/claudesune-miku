# copper-aksak — session notes (eval/after/C2/r1)

Instrumental groove, 7/8 @ 140 BPM, D dorian, form **A B C A**, 8-bar sections.
All commands run from the repo root `/Users/ethanchen/Documents/GitHub/motif-engine`.

## v0 — initial generation

```
node src/cli.js generate eval/after/C2/r1/spec.json --out eval/after/C2/r1
```

- Five labeled voices: `kick` (seven_pulse_223), `hats` (seven_hats_223), `bass`
  (seven_syncopated x pendulum_fifth, octave 2), `keys` (free voicing patterns),
  `lead` (dorian_lift motif — peaks on the raised 6th that names the mode); a `rim`
  perc layer enters only in B for the lift (B `must: density > 1.15x A`, measured 1.52x).
- C is the bridge: `withhold: ["bass"]` + `sets_up: "A"`, so the verifier proves bass
  is silent in C and returns in the final A (the payoff). impact_boom into C,
  fill_tom_run into the last A. All FAIL-level assertions green on first run (exit 0).

## v1 — edit 1: swing/shuffle on the hats only

```
node src/cli.js edit eval/after/C2/r1 --spec eval/after/C2/r1/edit1-spec.json \
    --allow-binding hats_A,hats_B,hats_C --aspects time \
    --note "swing the hats: delay the weak pulses (2nd of each 2-group, middle of the 3-group) by a half-pulse shuffle; accents/sounds/gains untouched"
```

- Replaced the hats' `seven_hats_223` with an inline shuffled variant: the weak pulses
  (1/7, 3/7, 5/7) delayed by 1/14 of a bar (onsets `0 3/14 2/7 1/2 4/7 11/14 6/7`);
  identical accents/sound/gainRange. Inline onsets were used instead of the binder's
  `swing`/`swingBy` because the hats sit exactly on the 7-pulse grid, where `swingBy(x, 7)`
  moves nothing and a fractional subdiv (3.5) would delay the downbeat every other bar.
- ACCEPTED under `--aspects time`: gate reports "hats: 224→224 haps, timing changed
  (+96/-96 onsets), pitches unchanged" — nothing but hat timing moved anywhere.

## v2 — edit 2: sparser lead, A sections only

```
node src/cli.js edit eval/after/C2/r1 --spec eval/after/C2/r1/edit2-spec.json \
    --allow-binding lead_A --sections A \
    --note "sparser A-section lead: rebind from seven_offbeat_lift (4 hits/bar) to sparse_pedal (2 anchors/bar); B and C leads untouched"
```

- Rebound only the A-section lead from `seven_offbeat_lift` (4 hits/bar) to the library's
  `sparse_pedal` (2 anchors/bar — "space is the material"); same dorian_lift motif,
  octave, sound, fx, and tonic cadence.
- `--allow-binding lead_A --sections A` confines the change to the lead label inside A's
  cycle windows (0-8, 24-32), mechanically proving B and C are untouched. Gate: "lead:
  144→112 haps". B's density margin over A grew (1.66x vs the required 1.15x); withhold
  + payoff still green; verify exits 0.

## Housekeeping

- A stray re-run of the edit-1 command (note "test") produced a no-op v2 with "no haps
  changed anywhere"; its `v2.strudel`/`v2.meta.json` were deleted and the session-log
  entry removed before applying the real edit 2, so v0/v1/v2 map 1:1 to
  generation / edit 1 / edit 2.
