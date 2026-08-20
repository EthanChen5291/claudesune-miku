# contours — v0

_2026-08-20 03:43 · 4/4 · cycles 0–24_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 38/38 pass

### motif
- ✅ `lead.arch_classic.notes` — 14 emitted notes match the bound resolution exactly
- ✅ `lead.arch_classic.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `lead.rise_anthem.notes` — 12 emitted notes match the bound resolution exactly
- ✅ `lead.rise_anthem.contour` — contour shape 100% preserved after harmonic snapping (10 steps)
- ✅ `lead.fall_sigh.notes` — 12 emitted notes match the bound resolution exactly
- ✅ `lead.fall_sigh.contour` — contour shape 100% preserved after harmonic snapping (10 steps)
- ✅ `lead.zigzag_narrow.notes` — 12 emitted notes match the bound resolution exactly
- ✅ `lead.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (10 steps)
- ✅ `lead.pendulum_fifth.notes` — 12 emitted notes match the bound resolution exactly
- ✅ `lead.pendulum_fifth.contour` — contour shape 100% preserved after harmonic snapping (10 steps)
- ✅ `lead.spiral_up.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.spiral_up.contour` — contour shape 100% preserved after harmonic snapping (14 steps)
- ✅ `lead.hook_drop.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.hook_drop.contour` — contour shape 100% preserved after harmonic snapping (14 steps)
- ✅ `lead.valley.notes` — 12 emitted notes match the bound resolution exactly
- ✅ `lead.valley.contour` — contour shape 100% preserved after harmonic snapping (10 steps)
- ✅ `lead.bass_root_five.notes` — 8 emitted notes match the bound resolution exactly
- ✅ `lead.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (6 steps)
- ✅ `lead.dorian_lift.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.dorian_lift.contour` — contour shape 100% preserved after harmonic snapping (14 steps)
- ✅ `lead.minimal_dyad.notes` — 8 emitted notes match the bound resolution exactly
- ✅ `lead.minimal_dyad.contour` — contour shape 100% preserved after harmonic snapping (6 steps)
- ✅ `lead.question_answer.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `lead.question_answer.contour` — contour shape 100% preserved after harmonic snapping (14 steps)
- ✅ `lead.arch_classic.interval-profile` — leap_ratio 0.62, repetition 0.08, range 9 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.rise_anthem.interval-profile` — leap_ratio 0.45, repetition 0.00, range 12 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.fall_sigh.interval-profile` — leap_ratio 0.45, repetition 0.00, range 12 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.zigzag_narrow.interval-profile` — leap_ratio 0.64, repetition 0.00, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.pendulum_fifth.interval-profile` — leap_ratio 0.91, repetition 0.09, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.spiral_up.interval-profile` — leap_ratio 0.73, repetition 0.00, range 12 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.hook_drop.interval-profile` — leap_ratio 0.47, repetition 0.27, range 12 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.valley.interval-profile` — leap_ratio 0.73, repetition 0.27, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.bass_root_five.interval-profile` — leap_ratio 0.57, repetition 0.43, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.dorian_lift.interval-profile` — leap_ratio 0.40, repetition 0.07, range 9 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.minimal_dyad.interval-profile` — leap_ratio 1.00, repetition 0.00, range 5 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.question_answer.interval-profile` — leap_ratio 0.67, repetition 0.07, range 9 semitones (measured; enforcement pending grammar policy)

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| lead | 154 | 6.416667 | 12 | 0.545455 | 0.001932 | 0.304348 |

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
