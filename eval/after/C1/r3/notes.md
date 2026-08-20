# glasshouse-current — session notes (eval/after/C1/r3)

House in F minor, 122 BPM, form A B A' B, 8-bar sections. Labeled layers per voice:
kick, hats, clap, bass, pads, lead. Chorus lift declared as `must` on B:
`density > 1.25x A` and `register_span wider than A`. A' = `recalls: A` with `vary`
on hats only (busier drums, identical melody).

## v0 — generate

```
node src/cli.js generate eval/after/C1/r3/spec.json --out eval/after/C1/r3
```

- First attempt FAILED `B.must.density` (47 vs target 48.13): the riser transition
  into B occurrence 1 lands inside A's cycle range and inflated verse density, and
  A's pads struct was too thick. Fixed the spec (sparser A pads `x ~ ~ ~ x ~ ~ ~`,
  denser B pads `x ~ x ~ x ~ x x`, occurrence-1 riser swapped for a light snare
  fill), deleted the failed v0 files, regenerated — green (this v0 is the first
  green version).
- Result: verse A = four-floor kick, offbeat 8th hats, ghosted clap, anticipation
  bass (root-five), drop2 pads, son-clave lead on `question_answer` at octave 4.
  Chorus B = 16th hats, offbeat-8th bass, spread-tenth pads, `rise_anthem` lead at
  octave 5. Musts: density 50.25 vs A 32 (1.57x), span 49 vs 33.

## v1 — edit 1: make the hats busier (only the hats)

```
node src/cli.js edit eval/after/C1/r3 --spec eval/after/C1/r3/spec.json \
    --allow-binding hats_A \
    --note "make the hats busier: verse hats offbeat_8ths -> swung_lofi_hats (4 -> 8 onsets/bar, swung)"
```

- Verse hats binding `hats_A`: `offbeat_8ths` (4/bar) -> `swung_lofi_hats`
  (8/bar, swing 0.55). B and A' hats were already `sixteenth_drive` (the densest
  hat entry), so the verse was the only headroom.
- Containment: only label `hats` changed (416 -> 448 haps); chorus musts still
  green (50.25 vs target 45).

## v2 — edit 2: chorus lifts more; verse must not change

```
node src/cli.js edit eval/after/C1/r3 --spec eval/after/C1/r3/spec.json \
    --allow-binding lead_B \
    --note "chorus lifts more: chorus lead push_pull_16s -> gallop_arp (6 -> 12 onsets/bar) and octave 5 -> 6; verse untouched"
```

- Chorus lead binding `lead_B`: rhythm `push_pull_16s` -> `gallop_arp`
  (6 -> 12 onsets/bar) and octave 5 -> 6. B density 50.25 -> 56.25, B register
  span 49 -> 61 (A unchanged at 36 / 33), so the lift widened on both axes.
- Verse bit-identical: scope was the section-B lead binding only; containment
  confirmed changes confined to `lead` in B's cycles.

## v3 — edit 3: darker bass, sound/timbre only

```
node src/cli.js edit eval/after/C1/r3 --spec eval/after/C1/r3/spec.json \
    --allow-binding bass_A,bass_B --aspects sound \
    --note "darker bass: sawtooth -> square, lpf 600/700 -> 300/340; same notes and rhythm"
```

- Both bass bindings: `sawtooth` -> `square`, `.lpf(600)`/`.lpf(700)` ->
  `.lpf(300)`/`.lpf(340)`.
- Aspect gate proved it: "bass: 128 -> 128 haps, timing unchanged, pitches
  unchanged, 128 sounds changed". All assertions green (`verify` exit 0).
