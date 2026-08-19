# neon-undertow — v0

_2026-08-19 22:51 · 4/4 · cycles 0–48_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 34/34 pass

### relational
- ✅ `B.must.density` — "> 1.3x A": measured 39.79 vs target > 38.35 (A: 29.50)
- ✅ `B.must.register_span` — "wider than A": measured 49 vs target > 32 (A: 32)

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
- ✅ `lead.cadence` — cadence target "tonic" resolved to F4 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m1.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour(invert+octave_up)` — contour shape 100% preserved after harmonic snapping (8 steps) under transform "invert+octave_up"

### interlock
- ✅ `A.kick+hats` — complement joint=1 (hats in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A.hats+bass` — complement joint=1 (bass in hats gaps: 1, reverse: 1)
- ✅ `A'.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `A'.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `A'.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `B.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `B.kick+lead` — complement joint=0.733 (lead in kick gaps: 0.8, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.hats+bass` — complement joint=0.367 (bass in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.333 (lead in hats gaps: 0, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=0.55 (lead in bass gaps: 0.6, reverse: 0.5)
- ✅ `C.hats+lead` — complement joint=0.429 (lead in hats gaps: 0, reverse: 0.857) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 160 | 3.333333 | 0 | 0 | 0.001719 | 0 |
| hats | 608 | 12.666667 | 0 | 0.736842 | 0.025839 | 0.06383 |
| bass | 160 | 3.333333 | 8 | 0.8 | 0.005666 | 0.078947 |
| pads | 456 | 9.5 | 31 | 0.328947 | 0.00338 | 0.025641 |
| lead | 160 | 3.333333 | 13 | 0.6 | 0.019801 | 0.066667 |
| riser | 96 | 2 | 0 | 0.75 | 0.029971 | 0 |
| fill | 16 | 0.333333 | 0 | 0.75 | 0.035071 | 0 |
| impact | 1 | 0.020833 | 0 | 0 | 0 | 0 |

## What to listen for

- Section B (chorus, cycles [[8,16],[24,32],[40,48]]) should lift relative to its verse.
- Section C withholds kick, bass — their return is the payoff.
- Transition "riser_hat_swell" (riser) into B at cycles 6–8.
- Transition "riser_hat_swell" (riser) into B at cycles 22–24.
- Transition "riser_hat_swell" (riser) into B at cycles 38–40.
- Transition "fill_snare_roll" (fill) into B at cycles 39–40.
- Transition "sub_drop" (impact) into B at cycles 40–41.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
