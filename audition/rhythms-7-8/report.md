# rhythms-7-8 — v0

_2026-08-20 03:43 · 7/8 · cycles 0–16_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 10/10 pass

### harmonic
- ✅ `hits.accented-chord-tones[seven_syncopated]` — 16 accented onsets (bound), 100% chord tones
- ✅ `hits.accented-chord-tones[seven_offbeat_lift]` — 8 accented onsets (bound), 100% chord tones

### motif
- ✅ `hits.zigzag_narrow.notes` — 24 emitted notes match the bound resolution exactly
- ✅ `hits.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (20 steps)
- ✅ `hits.zigzag_narrow.notes` — 16 emitted notes match the bound resolution exactly
- ✅ `hits.zigzag_narrow.contour` — contour shape 100% preserved after harmonic snapping (12 steps)
- ✅ `hits.zigzag_narrow.interval-profile` — leap_ratio 0.65, repetition 0.00, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `hits.zigzag_narrow.interval-profile` — leap_ratio 0.47, repetition 0.00, range 7 semitones (measured; enforcement pending grammar policy)

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| hits | 80 | 5 | 7 | 0.4 | 0.015248 | 0.2 |

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
