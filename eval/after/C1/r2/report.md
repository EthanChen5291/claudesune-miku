# fathom-line — v3

**Edit:** darker bass: square + lower lpf (notes and rhythm locked)

_2026-08-20 01:02 · 4/4 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: bass
- bass: 128→128 haps, timing unchanged, pitches unchanged, 128 sounds changed

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 46/48 pass, 2 warn

### relational
- ✅ `B.must.density` — "> 1.3x A": measured 50.50 vs target > 44.20 (A: 34)
- ✅ `B.must.register_span` — "wider than A": measured 49 vs target > 32 (A: 32)

### harmonic
- ✅ `bass.accented-chord-tones[A,A']` — 48 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[A,A']` — 80 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 64 accented onsets (bound), 100% chord tones
- ✅ `pads.accented-chord-tones` — 240 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `lead.m1.notes` — 80 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (32 steps)
- ✅ `lead.m2.notes` — 192 emitted notes match the bound resolution exactly
- ✅ `lead.m2.contour` — contour shape 100% preserved after harmonic snapping (88 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to F6 (enforced at bind time, verified by exact-notes check)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.35, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.62, repetition 0.13, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m2.interval-profile` — leap_ratio 0.49, repetition 0.00, range 13 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+hats` — complement joint=0.286 (hats in kick gaps: 0.571, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A.kick+lead` — complement joint=0.708 (lead in kick gaps: 0.75, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A.hats+lead` — complement joint=0.411 (lead in hats gaps: 0.25, reverse: 0.571) [texture grid — complement n/a]
- ✅ `A.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1)
- ✅ `A'.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `A'.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A'.kick+lead` — complement joint=0.708 (lead in kick gaps: 0.75, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A'.kick+clap` — complement joint=0.417 (clap in kick gaps: 0.5, reverse: 0.333) [texture grid — complement n/a]
- ✅ `A'.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `A'.hats+lead` — complement joint=0.367 (lead in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `A'.hats+clap` — complement joint=0.367 (clap in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `A'.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1)
- ✅ `A'.bass+clap` — complement joint=0.417 (clap in bass gaps: 0.5, reverse: 0.333)
- ✅ `A'.lead+clap` — complement joint=0.75 (clap in lead gaps: 0.75, reverse: 0.75)
- ✅ `B.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `B.kick+lead` — complement joint=0.364 (lead in kick gaps: 0.727, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+clap` — complement joint=0.417 (clap in kick gaps: 0.5, reverse: 0.333) [texture grid — complement n/a]
- ✅ `B.hats+bass` — complement joint=0.367 (bass in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.133 (lead in hats gaps: 0, reverse: 0.267) [texture grid — complement n/a]
- ✅ `B.hats+clap` — complement joint=0.367 (clap in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=0.318 (lead in bass gaps: 0.636, reverse: 0) [texture grid — complement n/a]
- ✅ `B.bass+clap` — complement joint=1 (clap in bass gaps: 1, reverse: 1)
- ✅ `B.lead+clap` — complement joint=0.318 (clap in lead gaps: 0, reverse: 0.636) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 128 | 4 | 0 | 0 | 0.001719 | 0 |
| hats | 448 | 14 | 0 | 0.714286 | 0.012424 | 0.032258 |
| bass | 128 | 4 | 8 | 0.75 | 0.006144 | 0.096774 |
| pads | 312 | 9.75 | 31 | 0.179487 | 0.001963 | 0.096774 |
| lead | 272 | 8.5 | 25 | 0.647059 | 0.014907 | 0.096774 |
| clap | 96 | 3 | 0 | 0.5 | 0.03825 | 0 |
| riser | 64 | 2 | 0 | 0.75 | 0.029971 | 0 |
| fill | 16 | 0.5 | 0 | 0.75 | 0.035071 | 0 |

## What to listen for

- The requested change: darker bass: square + lower lpf (notes and rhythm locked)
- bass: same notes, same rhythm, new timbre — ONLY the tone color should differ.
- Everything else (kick, hats, pads, lead, clap, riser, fill) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
