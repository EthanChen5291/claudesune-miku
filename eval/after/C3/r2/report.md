# attic-glow — v2

**Edit:** drum velocity contour: library accent profiles wired to gain — backbeats ring, ghost notes whisper; timing and onsets untouched

_2026-08-20 01:04 · 4/4 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: hats, kick, snare
- hats: 256→256 haps, timing unchanged, pitches unchanged, 256 gains changed
- kick: 96→96 haps, timing unchanged, pitches unchanged, 96 gains changed
- snare: 128→128 haps, timing unchanged, pitches unchanged, 128 gains changed

| label | metric | before | after |
|---|---|---|---|
| hats | accent variance | 0 | 0.010825 |
| kick | accent variance | 0 | 0.006067 |
| snare | accent variance | 0 | 0.058 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 31/33 pass, 2 warn

### relational
- ✅ `B.must.density` — "> 1.15x A": measured 31.75 vs target > 28.75 (A: 25)

### harmonic
- ✅ `bass.accented-chord-tones[A]` — 48 accented onsets (bound), 100% chord tones
- ✅ `bass.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 80 accented onsets (bound), 97.50% chord tones — violations: C4@63/4 vs G7, C4@127/4 vs G7
- ✅ `keys.accented-chord-tones` — 148 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `bass.bass_root_five.notes` — 64 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `lead.m1.notes` — 80 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (32 steps)
- ✅ `lead.cadence` — cadence target "tonic" resolved to C4 (enforced at bind time, verified by exact-notes check)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.39, range 8 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.56, repetition 0.15, range 13 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `A.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ✅ `A.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `A.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `A.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `B.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `B.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ⚠️ `B.kick+lead` — complement joint=0.25 (lead in kick gaps: 0.5, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity
- ✅ `B.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `B.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `B.snare+lead` — complement joint=0.75 (lead in snare gaps: 0.75, reverse: 0.75)
- ✅ `B.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.411 (lead in hats gaps: 0.25, reverse: 0.571) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1)

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0.666667 | 0.006067 | 0 |
| snare | 128 | 4 | 0 | 0.5 | 0.058 | 0 |
| hats | 256 | 8 | 0 | 0.5 | 0.010825 | 0 |
| bass | 128 | 4 | 8 | 0.5 | 0.002119 | 0 |
| keys | 188 | 5.875 | 17 | 0.191489 | 0.001919 | 0.096774 |
| dust | 32 | 1 | 0 | 0 | 0 | 0 |
| lead | 80 | 2.5 | 13 | 0.6 | 0.00116 | 0 |

## What to listen for

- The requested change: drum velocity contour: library accent profiles wired to gain — backbeats ring, ghost notes whisper; timing and onsets untouched
- hats: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- kick: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- snare: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- Everything else (bass, keys, dust, lead) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
