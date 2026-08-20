# eval/after/C1/r1 — session notes (undertow-lift)

House, F minor, 122 BPM, form A B A' B (8-bar sections). Six labeled layers per
voice: kick, hats, clap, bass, pads, lead. B declares `must` constraints
(`density > 1.3x A`, `register_span wider than A`); A' `recalls` A and varies
only the drums (hats + clap), so the melody (`lead_A`) is inherited unchanged.

## v0 — initial generation

```
node src/cli.js generate eval/after/C1/r1/spec.json --out eval/after/C1/r1
```

- All assertions green. Chorus lift measured: density 51.50 vs A 33.50
  (1.54x, target > 1.3x); cross-layer register span 37 vs A 32 semitones.
- Design detail: two earlier drafts were discarded before the first green v0 was
  kept — chorus pads were densified (4 -> 5 stabs/bar) to leave density headroom
  for the coming hats edit, and the chorus lead was seeded at octave 4 so
  edit 2 could lift it an octave without going shrill.

## v1 — Edit 1: "make the hats busier (only the hats)"

```
node src/cli.js edit eval/after/C1/r1 --spec eval/after/C1/r1/edits/spec.e1.json \
  --allow-binding hats_A \
  --note "make the hats busier (verse hats offbeat 8ths -> swung 8ths; chorus/A' hats already at 16ths)"
```

- Verse hats `offbeat_8ths` (4/bar) -> `swung_lofi_hats` (8/bar, swing 0.55);
  chorus and A' hats were already at 16th-note density, so `hats_A` is the whole edit.
- CONTAINMENT: PASS — hats 416->448 haps; every other label bit-identical.
  Chorus lift must still holds: 51.50 vs new target > 48.75 (A rose to 37.50).

## v2 — Edit 2: "the chorus should lift more; verse must not change"

```
node src/cli.js edit eval/after/C1/r1 --spec eval/after/C1/r1/edits/spec.e2.json \
  --allow-binding lead_B \
  --note "chorus lifts more: lead up an octave (4->5) and denser (push_pull_16s -> gallop_arp)"
```

- `lead_B` octave 4 -> 5 and rhythm `push_pull_16s` (6/bar) -> `gallop_arp` (12/bar).
- CONTAINMENT: PASS — lead 176->272 haps, 232 pitches changed; the verse is
  bit-identical because `lead_B` only sounds in B sections (the section mask
  scopes it). B density 51.50 -> 57.50; register span 37 -> 49 semitones.

## v3 — Edit 3: "swap the bass sound to something darker (sound only)"

```
node src/cli.js edit eval/after/C1/r1 --spec eval/after/C1/r1/edits/spec.e3.json \
  --allow-binding bass_A,bass_B --aspects sound \
  --note "darker bass: sawtooth -> square, lpf 800/900 -> 420/500 (notes+rhythm locked)"
```

- Bass sound `sawtooth` -> `square`, lpf 800/900 -> 420/500 (verse/chorus).
- CONTAINMENT: PASS — `bass: 128->128 haps, timing unchanged, pitches unchanged,
  128 sounds changed`: the `--aspects sound` lock proves notes+rhythm invariant
  mechanically. All musts and assertions still green (verify exit 0).

## Final state

| version | edit | containment | key movement |
|---|---|---|---|
| v0 | initial generation | — | B/A density 1.54x, span 37 vs 32 |
| v1 | busier hats | PASS (hats only) | verse hats 4 -> 8/bar, swung |
| v2 | chorus lifts more | PASS (lead_B only) | B density 51.5 -> 57.5, span 37 -> 49 |
| v3 | darker bass | PASS (bass, sound aspect) | 128 sounds changed, 0 notes/onsets |
