# neon-undertow — v7

**Edit:** engine round: audition-r1 library fixes (drop2 bass note, shape-preserving contour realization — lead_B arch no longer smears) + review-cycle emission fixes (3-decimal gains, stable orbits, transition binding names)

_2026-08-20 03:45 · 4/4 · cycles 0–48_

## What changed

Containment: **PASS** — allowed: bass, clap, fill, hats, impact, kick, lead, pads, riser
- bass: 160→160 haps, timing unchanged, pitches unchanged, 96 gains changed
- clap: 96→96 haps, timing unchanged, pitches unchanged, 96 sounds changed, 48 gains changed
- hats: 640→640 haps, timing unchanged, pitches unchanged, 296 gains changed
- kick: 160→160 haps, timing unchanged, pitches unchanged, 120 gains changed
- lead: 160→160 haps, timing unchanged, 90 pitches changed, 160 sounds changed, 48 gains changed

| label | metric | before | after |
|---|---|---|---|
| bass | accent variance | 0.005666 | 0.005567 |
| clap | accent variance | 0.03825 | 0.038297 |
| hats | accent variance | 0.025607 | 0.025596 |
| kick | accent variance | 0.001719 | 0.001598 |
| lead | accent variance | 0.019801 | 0.019815 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 42/44 pass, 2 warn

### relational
- ✅ `B.must.density` — "> 1.3x A": measured 43.79 vs target > 43.55 (A: 33.50)
- ✅ `B.must.register_span` — "wider than A": measured 61 vs target > 32 (A: 32)

### structural
- ✅ `C.withhold.kick` — kick silent in C as declared
- ✅ `C.payoff.kick->B` — kick returns in B (96 onsets) — the payoff exists
- ✅ `C.withhold.bass` — bass silent in C as declared
- ✅ `C.payoff.bass->B` — bass returns in B (96 onsets) — the payoff exists

### harmonic
- ✅ `bass.accented-chord-tones[A,A']` — 48 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 72 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[C]` — 8 accented onsets (bound), 100% chord tones
- ✅ `pads.accented-chord-tones` — 312 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]
- ✅ `impact.accented-chord-tones` — 1 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `bass.bass_root_five.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `lead.m1.notes` — 144 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to F5 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m1.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour(invert+octave_up)` — contour shape 100% preserved after harmonic snapping (8 steps) under transform "invert+octave_up"
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.35, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.51, repetition 0.11, range 9 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.60, repetition 0.07, range 10 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+hats` — complement joint=0.286 (hats in kick gaps: 0.571, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A'.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `A'.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A'.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `B.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `B.kick+lead` — complement joint=0.733 (lead in kick gaps: 0.8, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.kick+clap` — complement joint=0.417 (clap in kick gaps: 0.5, reverse: 0.333) [texture grid — complement n/a]
- ✅ `B.hats+bass` — complement joint=0.367 (bass in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.333 (lead in hats gaps: 0, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.hats+clap` — complement joint=0.367 (clap in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=0.55 (lead in bass gaps: 0.6, reverse: 0.5)
- ✅ `B.bass+clap` — complement joint=1 (clap in bass gaps: 1, reverse: 1)
- ✅ `B.lead+clap` — complement joint=0.55 (clap in lead gaps: 0.5, reverse: 0.6)
- ✅ `C.hats+lead` — complement joint=0.429 (lead in hats gaps: 0, reverse: 0.857) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 160 | 3.333333 | 0 | 0 | 0.001598 | 0 |
| hats | 640 | 13.333333 | 0 | 0.7 | 0.025596 | 0.06383 |
| bass | 160 | 3.333333 | 8 | 0.8 | 0.005567 | 0.078947 |
| pads | 456 | 9.5 | 31 | 0.328947 | 0.00338 | 0.025641 |
| lead | 160 | 3.333333 | 18 | 0.6 | 0.019815 | 0.066667 |
| clap | 96 | 2 | 0 | 0.5 | 0.038297 | 0 |
| riser | 128 | 2.666667 | 0 | 0.75 | 0.029982 | 0 |
| fill | 16 | 0.333333 | 0 | 0.75 | 0.035071 | 0 |
| impact | 1 | 0.020833 | 0 | 0 | 0 | 0 |

## What to listen for

- The requested change: engine round: audition-r1 library fixes (drop2 bass note, shape-preserving contour realization — lead_B arch no longer smears) + review-cycle emission fixes (3-decimal gains, stable orbits, transition binding names)
- clap: same notes, same rhythm, new timbre — ONLY the tone color should differ.
- Everything else (pads, riser, fill, impact) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
