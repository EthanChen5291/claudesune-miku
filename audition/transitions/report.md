# transitions — v0

_2026-08-20 03:43 · 4/4 · cycles 0–56_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 82/82 pass

### harmonic
- ✅ `bass.accented-chord-tones[leadin_riser]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[chorus_riser]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[chorus_noise]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[leadin_fill]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[chorus_fill]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[leadin_tom]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[any_tom]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[leadin_impact]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[any_impact]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[chorus_before_sweep]` — 12 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[chorus_drop]` — 12 accented onsets (bound), 100% chord tones
- ✅ `pads.accented-chord-tones` — 117 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]
- ✅ `impact.accented-chord-tones` — 1 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.53, repetition 0.27, range 8 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `leadin_riser.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `leadin_riser.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `leadin_riser.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `chorus_riser.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_riser.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `chorus_riser.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `chorus_noise.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_noise.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `chorus_noise.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `leadin_fill.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `leadin_fill.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `leadin_fill.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `chorus_fill.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_fill.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `chorus_fill.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `leadin_tom.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `leadin_tom.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `leadin_tom.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `any_tom.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `any_tom.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `any_tom.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `leadin_impact.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `leadin_impact.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `leadin_impact.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `any_impact.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `any_impact.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `any_impact.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `chorus_before_sweep.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_before_sweep.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `chorus_before_sweep.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]
- ✅ `after_sweep.kick+hats` — complement joint=0.286 (hats in kick gaps: 0.571, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_drop.kick+hats` — complement joint=0.4 (hats in kick gaps: 0.8, reverse: 0) [texture grid — complement n/a]
- ✅ `chorus_drop.kick+bass` — complement joint=0.667 (bass in kick gaps: 0.667, reverse: 0.667) [texture grid — complement n/a]
- ✅ `chorus_drop.hats+bass` — complement joint=0.4 (bass in hats gaps: 0, reverse: 0.8) [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 192 | 3.428571 | 0 | 0 | 0.001598 | 0 |
| hats | 800 | 14.285714 | 0 | 0.72 | 0.027833 | 0.072727 |
| bass | 176 | 3.142857 | 8 | 0.5 | 0.007642 | 0 |
| pads | 117 | 2.089286 | 17 | 0 | 0.000325 | 0 |
| riser | 36 | 0.642857 | 0 | 0.666667 | 0.0307 | 0 |
| fill | 24 | 0.428571 | 0 | 0.666667 | 0.031228 | 0 |
| impact | 9 | 0.160714 | 0 | 0 | 0.027778 | 0 |
| sweep | 8 | 0.142857 | 0 | 0.5 | 0.020508 | 0 |

## What to listen for

- Section chorus_riser (chorus, cycles [[4,8]]) should lift relative to its verse.
- Section chorus_noise (chorus, cycles [[12,16]]) should lift relative to its verse.
- Section chorus_fill (chorus, cycles [[20,24]]) should lift relative to its verse.
- Section any_impact (chorus, cycles [[36,40]]) should lift relative to its verse.
- Section chorus_before_sweep (chorus, cycles [[40,44]]) should lift relative to its verse.
- Section chorus_drop (chorus, cycles [[52,56]]) should lift relative to its verse.
- Transition "riser_hat_swell" (riser) into chorus_riser at cycles 2–4.
- Transition "riser_noise_sweep" (riser) into chorus_noise at cycles 8–12.
- Transition "fill_snare_roll" (fill) into chorus_fill at cycles 19–20.
- Transition "fill_tom_run" (fill) into any_tom at cycles 27–28.
- Transition "impact_boom" (impact) into any_impact at cycles 36–37.
- Transition "sweep_downlifter" (sweep) into after_sweep at cycles 44–45.
- Transition "sub_drop" (impact) into chorus_drop at cycles 52–53.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
