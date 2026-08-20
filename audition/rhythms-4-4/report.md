# rhythms-4-4 — v0

_2026-08-20 03:43 · 4/4 · cycles 0–76_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 23/23 pass

### harmonic
- ✅ `hits.accented-chord-tones[offbeat_8ths]` — 8 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[sparse_pedal]` — 4 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[even_8ths]` — 8 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[pushed_comp_2bar]` — 56 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[charleston_2bar]` — 32 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[call_response_2bar]` — 10 accented onsets (bound), 100% chord tones

### motif
- ✅ `hits.zigzag_narrow.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `hits.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `hits.bass_root_five.notes` — 8 emitted notes match the bound resolution exactly
- ✅ `hits.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (4 steps)
- ✅ `hits.zigzag_narrow.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `hits.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (28 steps)
- ✅ `hits.pushed_comp_2bar.comp-bounce` — 6 bounce notes present under the comp stabs
- ✅ `hits.charleston_2bar.comp-bounce` — 2 bounce notes present under the comp stabs
- ✅ `hits.zigzag_narrow.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `hits.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `hits.zigzag_narrow.interval-profile` — leap_ratio 0.47, repetition 0.00, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `hits.bass_root_five.interval-profile` — leap_ratio 0.57, repetition 0.43, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `hits.zigzag_narrow.interval-profile` — leap_ratio 0.48, repetition 0.26, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `hits.bound.interval-profile` — leap_ratio 0.20, repetition 0.80, range 4 semitones (measured; enforcement pending grammar policy)
- ✅ `hits.zigzag_narrow.interval-profile` — leap_ratio 0.40, repetition 0.33, range 7 semitones (measured; enforcement pending grammar policy)

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| hits | 520 | 6.842105 | 31 | 0.515385 | 0.015292 | 0.386667 |

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
