# aurora-circuit — v2

**Edit:** transpose key A minor -> B minor; rhythms, sounds, gains untouched

_2026-08-20 01:09 · 4/4 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: arp, bass, lead, pads
- arp: 288→288 haps, timing unchanged, 288 pitches changed
- bass: 96→96 haps, timing unchanged, 96 pitches changed
- lead: 112→112 haps, timing unchanged, 112 pitches changed
- pads: 264→264 haps, timing unchanged, 74 pitches changed

| label | metric | before | after |
|---|---|---|---|
| arp | register top (midi) | 77 | 79 |
| bass | register top (midi) | 52 | 54 |
| lead | register top (midi) | 93 | 95 |
| pads | register span (semitones) | 26 | 36 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 51/55 pass, 4 warn

### relational
- ✅ `B.must.density` — "> 1.3x A": measured 55.81 vs target > 55.58 (A: 42.75)
- ✅ `B.must.register_span` — "wider than A": measured 71 vs target > 34 (A: 34)

### structural
- ✅ `C.withhold.kick` — kick silent in C as declared
- ✅ `C.payoff.kick->B` — kick returns in B (64 onsets) — the payoff exists
- ✅ `C.withhold.bass` — bass silent in C as declared
- ✅ `C.payoff.bass->B` — bass returns in B (64 onsets) — the payoff exists

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 16 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[C]` — 8 accented onsets (bound), 100% chord tones
- ✅ `pads.accented-chord-tones` — 196 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]
- ⚠️ `impact.accented-chord-tones` — 1 accented onsets, 0% chord tones [free material — exceptions allowed, listed for review] — violations: c1@24 vs G^7

### motif
- ✅ `bass.bass_root_five.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `arp.m2.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `arp.m2.contour` — contour shape 100% preserved after harmonic snapping (88 steps)
- ✅ `arp.m2.notes` — 192 emitted notes match the bound resolution exactly
- ✅ `arp.m2.contour` — contour shape 100% preserved after harmonic snapping (88 steps)
- ✅ `lead.m1.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to B6 (enforced at bind time, verified by exact-notes check)
- ✅ `lead.m1.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour(invert+octave_up)` — contour shape 100% preserved after harmonic snapping (8 steps) under transform "invert+octave_up"
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.48, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.35, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `arp.m2.interval-profile` — leap_ratio 0.59, repetition 0.02, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `arp.m2.interval-profile` — leap_ratio 0.59, repetition 0.03, range 9 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.49, repetition 0.09, range 13 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.47, repetition 0.00, range 12 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+hats` — complement joint=1 (hats in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `A.kick+arp` — complement joint=0.364 (arp in kick gaps: 0.727, reverse: 0) [texture grid — complement n/a]
- ⚠️ `A.hats+bass` — complement joint=0 (bass in hats gaps: 0, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity
- ✅ `A.hats+arp` — complement joint=0.318 (arp in hats gaps: 0.636, reverse: 0) [texture grid — complement n/a]
- ✅ `A.bass+arp` — complement joint=0.318 (arp in bass gaps: 0.636, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `B.kick+arp` — complement joint=0.364 (arp in kick gaps: 0.727, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+clap` — complement joint=0.417 (clap in kick gaps: 0.5, reverse: 0.333) [texture grid — complement n/a]
- ✅ `B.kick+lead` — complement joint=0.733 (lead in kick gaps: 0.8, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.hats+bass` — complement joint=0.367 (bass in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.hats+arp` — complement joint=0.133 (arp in hats gaps: 0, reverse: 0.267) [texture grid — complement n/a]
- ✅ `B.hats+clap` — complement joint=0.367 (clap in hats gaps: 0, reverse: 0.733) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.333 (lead in hats gaps: 0, reverse: 0.667) [texture grid — complement n/a]
- ✅ `B.bass+arp` — complement joint=0.318 (arp in bass gaps: 0.636, reverse: 0) [texture grid — complement n/a]
- ✅ `B.bass+clap` — complement joint=1 (clap in bass gaps: 1, reverse: 1)
- ✅ `B.bass+lead` — complement joint=0.55 (lead in bass gaps: 0.6, reverse: 0.5)
- ✅ `B.arp+clap` — complement joint=0.318 (clap in arp gaps: 0, reverse: 0.636) [texture grid — complement n/a]
- ✅ `B.arp+lead` — complement joint=0.273 (lead in arp gaps: 0, reverse: 0.545) [texture grid — complement n/a]
- ✅ `B.clap+lead` — complement joint=0.55 (lead in clap gaps: 0.6, reverse: 0.5)
- ✅ `C.hats+lead` — complement joint=0.429 (lead in hats gaps: 0, reverse: 0.857) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0 | 0.001719 | 0 |
| hats | 352 | 11 | 0 | 0.727273 | 0.040568 | 0.096774 |
| bass | 96 | 3 | 8 | 1 | 0.00315 | 0 |
| arp | 288 | 9 | 9 | 0.666667 | 0.000556 | 0 |
| pads | 264 | 8.25 | 36 | 0.325758 | 0.003317 | 0.043478 |
| clap | 64 | 2 | 0 | 0.5 | 0.03825 | 0 |
| lead | 112 | 3.5 | 24 | 0.571429 | 0.01981 | 0.086957 |
| riser | 36 | 1.125 | 0 | 0.666667 | 0.0307 | 0 |
| fill | 32 | 1 | 0 | 0.75 | 0.035071 | 0 |
| impact | 1 | 0.03125 | 0 | 0 | 0 | 0 |

## What to listen for

- The requested change: transpose key A minor -> B minor; rhythms, sounds, gains untouched
- Everything else (kick, hats, clap, riser, fill, impact) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
