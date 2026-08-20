# attic-glow — v2

**Edit:** drum velocity contour: accents and ghost notes from the library accent profiles instead of uniform hits

_2026-08-20 01:12 · 4/4 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: hats, kick, snare
- hats: 256→256 haps, timing unchanged, pitches unchanged, 256 gains changed
- kick: 96→96 haps, timing unchanged, pitches unchanged, 96 gains changed
- snare: 128→128 haps, timing unchanged, pitches unchanged, 128 gains changed

| label | metric | before | after |
|---|---|---|---|
| hats | accent variance | 0 | 0.010636 |
| kick | accent variance | 0 | 0.004289 |
| snare | accent variance | 0 | 0.058 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 39/41 pass, 2 warn

### relational
- ✅ `B.must.density` — "> 1.1x A": measured 31.75 vs target > 30.25 (A: 27.50)

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 48 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `melody.accented-chord-tones[A]` — 16 accented onsets (bound), 100% chord tones
- ✅ `melody.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `keys.accented-chord-tones` — 148 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `melody.m1.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `melody.m1.contour` — contour shape 100% preserved after harmonic snapping (8 steps)
- ✅ `melody.m1.notes` — 96 emitted notes match the bound resolution exactly
- ✅ `melody.m1.contour` — contour shape 100% preserved after harmonic snapping (40 steps)
- ✅ `melody.cadence` — cadence target "tonic" resolved to C4 (enforced at bind time, verified by exact-notes check)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `melody.m1.interval-profile` — leap_ratio 0.67, repetition 0.13, range 12 semitones (measured; enforcement pending grammar policy)
- ✅ `melody.m1.interval-profile` — leap_ratio 0.53, repetition 0.04, range 12 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `A.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ✅ `A.kick+melody` — complement joint=1 (melody in kick gaps: 1, reverse: 1)
- ✅ `A.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `A.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `A.snare+melody` — complement joint=0.375 (melody in snare gaps: 0, reverse: 0.75)
- ✅ `A.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A.hats+melody` — complement joint=0.429 (melody in hats gaps: 0, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A.bass+melody` — complement joint=1 (melody in bass gaps: 1, reverse: 1)
- ✅ `B.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `B.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ⚠️ `B.kick+melody` — complement joint=0.3 (melody in kick gaps: 0.6, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity
- ✅ `B.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `B.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `B.snare+melody` — complement joint=0.55 (melody in snare gaps: 0.6, reverse: 0.5)
- ✅ `B.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `B.hats+melody` — complement joint=0.486 (melody in hats gaps: 0.4, reverse: 0.571) [texture grid — complement n/a]
- ✅ `B.bass+melody` — complement joint=0.733 (melody in bass gaps: 0.8, reverse: 0.667)

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0.666667 | 0.004289 | 0 |
| snare | 128 | 4 | 0 | 0.5 | 0.058 | 0 |
| hats | 256 | 8 | 0 | 0.5 | 0.010636 | 0 |
| bass | 128 | 4 | 8 | 0.5 | 0.00485 | 0 |
| keys | 188 | 5.875 | 17 | 0.191489 | 0.001272 | 0.096774 |
| melody | 128 | 4 | 12 | 0.5 | 0.010794 | 0.096774 |
| fill | 16 | 0.5 | 0 | 0.5 | 0.013125 | 0 |
| sweep | 8 | 0.25 | 0 | 0.5 | 0.020508 | 0 |

## What to listen for

- The requested change: drum velocity contour: accents and ghost notes from the library accent profiles instead of uniform hits
- hats: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- snare: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- Everything else (bass, keys, melody, fill, sweep) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
