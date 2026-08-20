# verdigris-seven — v2

**Edit:** sparser lead in the A sections only: seven_offbeat_lift (4 onsets/bar) -> sparse_pedal (2 anchors/bar); B and C leads untouched

_2026-08-20 01:05 · 7/8 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: lead
- lead: 144→112 haps, timing changed (+32/-64 onsets), 86 pitches changed, 80 sounds changed, 128 gains changed

| label | metric | before | after |
|---|---|---|---|
| lead | density (onsets/cycle) | 4.5 | 3.5 |
| lead | syncopation | 0.888889 | 0.714286 |
| lead | accent variance | 0.010342 | 0.014721 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 44/47 pass, 3 warn

### relational
- ✅ `B.must.density` — "> 1.15x A": measured 40 vs target > 32.77 (A: 28.50)

### structural
- ✅ `C.withhold.bass` — bass silent in C as declared
- ✅ `C.payoff.bass->A` — bass returns in A (96 onsets) — the payoff exists

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 64 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[A]` — 16 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[C]` — 16 accented onsets (bound), 100% chord tones
- ✅ `keys.accented-chord-tones` — 146 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.pendulum_fifth.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `bass.pendulum_fifth.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `bass.pendulum_fifth.notes` — 48 emitted notes match the bound resolution exactly
- ✅ `bass.pendulum_fifth.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `lead.m1.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (8 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to D4 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m1.notes` — 48 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to D5 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m1.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour(invert)` — contour shape 100% preserved after harmonic snapping (24 steps) under transform "invert"
- ✅ `bass.pendulum_fifth.interval-profile` — leap_ratio 0.85, repetition 0.15, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.pendulum_fifth.interval-profile` — leap_ratio 0.85, repetition 0.15, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.53, repetition 0.13, range 10 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.51, repetition 0.09, range 10 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.48, repetition 0.00, range 10 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=0.65 (bass in kick gaps: 0.8, reverse: 0.5) [declared pair]
- ✅ `A.kick+lead` — complement joint=1 (lead in kick gaps: 1, reverse: 1)
- ✅ `A.hats+bass` — complement joint=0.817 (bass in hats gaps: 0.8, reverse: 0.833) [texture grid — complement n/a]
- ✅ `A.hats+lead` — complement joint=1 (lead in hats gaps: 1, reverse: 1) [texture grid — complement n/a]
- ✅ `A.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1)
- ✅ `B.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=0.65 (bass in kick gaps: 0.8, reverse: 0.5) [declared pair]
- ✅ `B.kick+lead` — complement joint=0.65 (lead in kick gaps: 0.8, reverse: 0.5) [declared pair]
- ✅ `B.kick+clap` — complement joint=1 (clap in kick gaps: 1, reverse: 1)
- ✅ `B.hats+bass` — complement joint=0.817 (bass in hats gaps: 0.8, reverse: 0.833) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.817 (lead in hats gaps: 0.8, reverse: 0.833) [texture grid — complement n/a]
- ✅ `B.hats+clap` — complement joint=1 (clap in hats gaps: 1, reverse: 1) [texture grid — complement n/a]
- ⚠️ `B.bass+lead` — complement joint=0 (lead in bass gaps: 0, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity
- ✅ `B.bass+clap` — complement joint=0.775 (clap in bass gaps: 0.75, reverse: 0.8)
- ✅ `B.lead+clap` — complement joint=0.775 (clap in lead gaps: 0.75, reverse: 0.8)
- ✅ `C.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `C.kick+lead` — complement joint=1 (lead in kick gaps: 1, reverse: 1)
- ✅ `C.hats+lead` — complement joint=1 (lead in hats gaps: 1, reverse: 1) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0 | 0.035025 | 0 |
| hats | 224 | 7 | 0 | 0.5 | 0.039203 | 1 |
| bass | 144 | 4.5 | 7 | 0.666667 | 0.013222 | 0 |
| lead | 112 | 3.5 | 22 | 0.714286 | 0.014721 | 0.096774 |
| keys | 286 | 8.9375 | 22 | 0 | 0.003152 | 0.086957 |
| clap | 32 | 1 | 0 | 1 | 0.000719 | 0 |
| impact | 8 | 0.25 | 0 | 0 | 0.030625 | 0 |
| fill | 8 | 0.25 | 0 | 0.875 | 0.013125 | 0 |

## What to listen for

- The requested change: sparser lead in the A sections only: seven_offbeat_lift (4 onsets/bar) -> sparse_pedal (2 anchors/bar); B and C leads untouched
- lead: sparser (4.5 → 3.5 onsets/cycle) — more air between notes.
- Everything else (kick, hats, bass, keys, clap, impact, fill) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
