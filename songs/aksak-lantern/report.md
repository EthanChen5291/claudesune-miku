# aksak-lantern — v0

_2026-08-19 22:51 · 7/8 · cycles 0–32_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 29/29 pass

### relational
- ✅ `B.must.density` — "> 1.15x A": measured 27.50 vs target > 26.45 (A: 23)

### structural
- ✅ `C.withhold.bass` — bass silent in C as declared
- ✅ `C.payoff.bass->A` — bass returns in A (96 onsets) — the payoff exists

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 64 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 16 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[C]` — 16 accented onsets (bound), 100% chord tones
- ✅ `keys.accented-chord-tones` — 122 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `bass.bass_root_five.notes` — 48 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `lead.m2.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `lead.m2.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to D4 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m2.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `lead.m2.contour(invert)` — contour shape 100% preserved after harmonic snapping (24 steps) under transform "invert"

### interlock
- ✅ `A.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=0.65 (bass in kick gaps: 0.8, reverse: 0.5) [declared pair]
- ✅ `A.hats+bass` — complement joint=0.817 (bass in hats gaps: 0.8, reverse: 0.833) [texture grid — complement n/a]
- ✅ `B.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=0.65 (bass in kick gaps: 0.8, reverse: 0.5) [declared pair]
- ✅ `B.kick+lead` — complement joint=1 (lead in kick gaps: 1, reverse: 1)
- ✅ `B.hats+bass` — complement joint=0.817 (bass in hats gaps: 0.8, reverse: 0.833) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=1 (lead in hats gaps: 1, reverse: 1) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=0.775 (lead in bass gaps: 0.75, reverse: 0.8)
- ✅ `C.kick+hats` — complement joint=0.333 (hats in kick gaps: 0.667, reverse: 0) [texture grid — complement n/a]
- ✅ `C.kick+lead` — complement joint=1 (lead in kick gaps: 1, reverse: 1)
- ✅ `C.hats+lead` — complement joint=1 (lead in hats gaps: 1, reverse: 1) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0 | 0.028089 | 0 |
| hats | 224 | 7 | 0 | 0 | 0.045862 | 0 |
| bass | 144 | 4.5 | 7 | 0.666667 | 0.013222 | 0 |
| keys | 178 | 5.5625 | 21 | 0 | 0.00143 | 0.043478 |
| lead | 64 | 2 | 12 | 1 | 0.002369 | 0 |
| fill | 8 | 0.25 | 0 | 0.875 | 0.013125 | 0 |
| impact | 8 | 0.25 | 0 | 0 | 0.030625 | 0 |

## What to listen for

- Section C withholds bass — their return is the payoff.
- Transition "fill_tom_run" (fill) into A at cycles 23–24.
- Transition "impact_boom" (impact) into C at cycles 16–17.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
