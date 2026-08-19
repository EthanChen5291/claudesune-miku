# Demonstrated edit session — neon-undertow

Six sequential scoped edits, each gated by containment; plus one deliberately leaky
edit shown being rejected, and one musical regression caught by the relational
assertions and fixed. All commands are real and reproducible; outputs are captured
verbatim in `edits/e*.out`. Deliverable required by doc.md §5 (≥5 sequential scoped
edits, each passing containment, with before/after metrics).

Every version vN below has its own paste-ready `vN.strudel`; `listen.html` always
holds the latest before/after A-B with per-label mutes.

---

## Edit 1 — "make the verse hats busier"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e1.json \
  --allow-binding hats_A --note "make the verse hats busier"
```

Spec change: `A.hats` rhythm `offbeat_8ths` → `sixteenth_drive` (gain range 0.25–0.75).
`--allow-binding hats_A` expands through static analysis to exactly the `hats` label.

- **CONTAINMENT: PASS** — only `hats` changed; kick/bass/pads/lead/transitions bit-identical.
- hats density (song-wide): **12.67 → 14.67** onsets/cycle; verse hats 4 → 16 per bar.

## Edit 2 — "the chorus should lift more"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e2.json \
  --allow-binding lead_B --note "the chorus should lift more — lead up an octave"
```

Spec change: `B.lead` bind octave 4 → 5 (motif m1 re-binds an octave up).

- **CONTAINMENT: PASS** — `lead: 160→160 haps, timing unchanged, 144 pitches changed`.
  The verse is untouched because `lead_B` only sounds in B (the mask does the scoping).
- lead register top: **midi 77 → 85**; register span **13 → 18** semitones.

## Edit 3 — "swap the bass sound to something darker; notes and rhythm must not change"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e3.json \
  --allow-binding bass_A,bass_B --aspects sound \
  --note "swap the bass sound to something darker (notes+rhythm locked)"
```

Spec change: bass sound `sawtooth` → `square`, lpf 650/900 → 420/520.
`--aspects sound` means even the ALLOWED label may only change timbre.

- **CONTAINMENT: PASS** — `bass: 160→160 haps, timing unchanged, pitches unchanged,
  160 sounds changed`. The aspect lock proves the notes/rhythm invariant mechanically.

## Edit 4 — "swing the verse hats"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e4.json \
  --allow-binding hats_A --aspects time --note "swing the verse hats (timing only)"
```

Spec change: `A.hats` bind gains `swing: 0.45` (binder emits `.swingBy(0.45, 4)`).

- **CONTAINMENT: PASS** — `hats: timing changed (+64/-64 onsets), pitches unchanged`;
  gain/sound sequences intact. A pure micro-timing edit, verified as exactly that.

## Edit 5 — "make the transition into the final chorus bigger"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e5.json \
  --allow riser --note "make the transition into the final chorus bigger (4-bar riser)"
```

Spec change: the riser into the last B goes from 2 bars to 4 (transitions are
first-class layers; each occurrence has its own binding, so only `riser_B5` moved).

- **CONTAINMENT: PASS** — `riser: 96→128 haps`; the risers into the first two
  choruses are bit-identical, everything else untouched.
- riser onsets: **96 → 128** (the final approach now starts at cycle 36, not 38).

## ⚠ Interlude — the metrics caught a musical regression

`verify` had been flagging since Edit 1:

```
[FAIL] B.must.density: "> 1.3x A": measured 39.79 vs target > 53.95 (A: 41.50)
```

Making the verse hats 16ths raised the verse's density so much that the chorus no
longer lifts 1.3× over it — the edit was perfectly contained, but it broke the
declared section relationship. This is exactly the failure §1 says must be caught:
"a chorus that doesn't lift." (The `edit` command now prints a MUSICAL REGRESSION
banner when a contained edit newly breaks an assertion.)

## Edit 6 — "restore the chorus lift"

```
node src/cli.js edit songs/neon-undertow --spec edits/spec.e6.json \
  --allow-binding hats_A --allow clap \
  --note "restore the chorus lift: verse hats to swung 8ths, add chorus clap backbeat"
```

Spec change: verse hats pulled back to `swung_lofi_hats` (still busier + swung vs the
original offbeats), and the chorus gains a `clap` backbeat (`backbeat_ghost` on `cp`).

- **CONTAINMENT: PASS** — `clap: layer added (96 haps)`, `hats` changed, nothing else.
- **`[PASS] B.must.density: measured 43.79 vs target > 43.55 (A: 33.50)`** — the lift holds again.

## ✗ Rejection demo — a leaky edit is refused

A hand edit to `v5.strudel` doubled a kick hit but claimed hats scope:

```
node src/cli.js edit songs/neon-undertow --file edits/sneaky.strudel \
  --allow hats --note "hats tweak (actually touches the kick)"
```

```
EDIT REJECTED (containment): kick: 160→176 haps, timing changed (+16/-0 onsets), ...
  leaks:
    ✗ kick: 160→176 haps, timing changed (+16/-0 onsets), 16 pitches changed, ...
exit code 4 — no version written
```

The gate is mechanical, not conventional: it applies to the engine's own edits and
to hand edits alike.

---

## Final state

| version | edit | containment | key metric movement |
|---|---|---|---|
| v0 | initial generation | — | all assertions pass |
| v1 | verse hats busier | PASS (hats only) | hats 12.7→14.7 /cyc; ⚠ chorus lift broken |
| v2 | chorus lead up an octave | PASS (lead only) | lead top 77→85, span 13→18 |
| v3 | darker bass, sound-only | PASS (bass, sound aspect) | 160 sounds changed, 0 notes/onsets |
| v4 | swing verse hats | PASS (hats, time aspect) | ±64 onsets moved, values intact |
| v5 | bigger final riser | PASS (riser only) | riser 96→128 haps |
| v6 | restore chorus lift | PASS (hats + new clap) | B.must.density passes: 43.79 > 43.55 |
