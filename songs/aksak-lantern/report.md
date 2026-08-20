# aksak-lantern — v1

**Edit:** engine round: audition-r1 — keys voicing me_quartal_9 killed by ear, swapped to me_shell_37; dorian_lift redesigned (peaks on the raised 6th now); bass line resampled shape-preserving; review-cycle emission fixes

_2026-08-20 03:45 · 7/8 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: bass, fill, hats, impact, keys, kick, lead
- bass: 144→144 haps, timing unchanged, 60 pitches changed, 96 gains changed
- hats: 224→224 haps, timing unchanged, pitches unchanged, 144 gains changed
- keys: 178→102 haps, timing unchanged, 48 pitches changed, 50 sounds changed
- kick: 96→96 haps, timing unchanged, pitches unchanged, 64 gains changed
- lead: 64→64 haps, timing unchanged, 31 pitches changed, 64 sounds changed, 64 gains changed

| label | metric | before | after |
|---|---|---|---|
| bass | accent variance | 0.013222 | 0.013411 |
| hats | accent variance | 0.045862 | 0.04582 |
| keys | density (onsets/cycle) | 5.5625 | 3.1875 |
| keys | register span (semitones) | 21 | 17 |
| keys | register top (midi) | 71 | 72 |
| keys | accent variance | 0.00143 | 0.001385 |
| kick | accent variance | 0.028089 | 0.027831 |
| lead | accent variance | 0.002369 | 0.002398 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 35/35 pass

### relational
- ✅ `B.must.density` — "> 1.15x A": measured 24 vs target > 23 (A: 20)

### structural
- ✅ `C.withhold.bass` — bass silent in C as declared
- ✅ `C.payoff.bass->A` — bass returns in A (96 onsets) — the payoff exists

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 64 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 32 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 16 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[C]` — 16 accented onsets (bound), 100% chord tones
- ✅ `keys.accented-chord-tones` — 70 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

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
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.34, repetition 0.66, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.34, repetition 0.66, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m2.interval-profile` — leap_ratio 0.48, repetition 0.10, range 10 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m2.interval-profile` — leap_ratio 0.58, repetition 0.03, range 10 semitones (measured; enforcement pending grammar policy)

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
| kick | 96 | 3 | 0 | 0 | 0.027831 | 0 |
| hats | 224 | 7 | 0 | 0 | 0.04582 | 0 |
| bass | 144 | 4.5 | 7 | 0.666667 | 0.013411 | 0 |
| keys | 102 | 3.1875 | 17 | 0 | 0.001385 | 0.043478 |
| lead | 64 | 2 | 12 | 1 | 0.002398 | 0 |
| fill | 8 | 0.25 | 0 | 0.875 | 0.013125 | 0 |
| impact | 8 | 0.25 | 0 | 0 | 0.030625 | 0 |

## What to listen for

- The requested change: engine round: audition-r1 — keys voicing me_quartal_9 killed by ear, swapped to me_shell_37; dorian_lift redesigned (peaks on the raised 6th now); bass line resampled shape-preserving; review-cycle emission fixes
- keys: sparser (5.5625 → 3.1875 onsets/cycle) — more air between notes.
- Everything else (fill, impact) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
