# fathom-line — session notes (eval/after/C1/r2, replicate 2)

House in F minor, 122 BPM, form A B A' B, 8-bar sections. Labeled voices: kick,
hats, clap, bass, pads, lead. B declares `must: density > 1.3x A` and
`register_span wider than A`. A' recalls A (same melody — lead_A/bass_A/pads_A
bindings are shared across A and A') and varies only the drums (hats to swung
8ths at v0, plus an added clap backbeat). Motifs: m1 = `zigzag_narrow` (verse
lead, pocket-sized), m2 = `rise_anthem` (chorus lead, climbs to the octave).
Transitions: hat-swell risers into both choruses, snare-roll fill into the last.

## v0 — initial generation

```
node src/cli.js generate eval/after/C1/r2/spec.json --out eval/after/C1/r2
```

- All assertions green on first run (exit 0). `B.must.density`: 44.50 vs
  target > 39 (A: 30); `B.must.register_span`: 37 vs A's 32.
- Only WARN-level notes (b9-rule / low-interval voicing rubs in the free pads
  material) — no FAILs.

## v1 — Edit 1: "make the hats busier — only the hats"

```
node src/cli.js edit eval/after/C1/r2 --spec eval/after/C1/r2/edits/spec.e1.json \
  --allow-binding hats_A,hats_Ap \
  --note "make the hats busier (verse hats to swung 8ths, A' hats to driving 16ths)"
```

- hats_A: `offbeat_8ths` (4/bar) -> `swung_lofi_hats` (8/bar, swung);
  hats_Ap: `swung_lofi_hats` -> `sixteenth_drive` (16/bar). hats_B was already
  at 16ths, untouched.
- CONTAINMENT: PASS — only `hats` changed (352->448 haps); kick/clap/bass/pads/
  lead/riser/fill bit-identical. Chorus lift still holds: `B.must.density`
  44.50 vs new target > 44.20 (A rose to 34) — no musical regression.

## v2 — Edit 2: "the chorus should lift more; verse must not change"

```
node src/cli.js edit eval/after/C1/r2 --spec eval/after/C1/r2/edits/spec.e2.json \
  --allow-binding lead_B \
  --note "chorus lifts more: lead up an octave and denser (gallop arp 16ths)"
```

- lead_B: octave 4 -> 5 and rhythm `push_pull_16s` (6/bar) -> `gallop_arp`
  (12/bar). B density 44.50 -> 50.50; B register span 37 -> 49 semitones.
- CONTAINMENT: PASS — only `lead` changed (176->272 haps), and lead_B is masked
  to B's cycles, so the verse (A and A') is bit-identical by construction.

## v3 — Edit 3: "darker bass sound; notes and rhythm must not change"

```
node src/cli.js edit eval/after/C1/r2 --spec eval/after/C1/r2/edits/spec.e3.json \
  --allow-binding bass_A,bass_B --aspects sound \
  --note "darker bass: square + lower lpf (notes and rhythm locked)"
```

- bass sound `sawtooth` -> `square`; lpf 750 -> 420 (A/A'), 950 -> 520 (B).
- CONTAINMENT: PASS — `bass: 128->128 haps, timing unchanged, pitches
  unchanged, 128 sounds changed`; the `--aspects sound` lock proves the
  notes/rhythm invariant mechanically. All musts still green.

Final: `node src/cli.js verify eval/after/C1/r2` -> exit 0.
