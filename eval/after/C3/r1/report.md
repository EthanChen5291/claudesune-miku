# attic-light — v2

**Edit:** velocity contour for the drums: widen each drum's gainRange from flat so the library accent profiles express — backbeats accented, ghost 16ths and offbeat hats drop to ghost level; onsets and sounds untouched

_2026-08-20 01:11 · 4/4 · cycles 0–32_

## What changed

Containment: **PASS** — allowed: hats, kick, perc, snare
- hats: 256→256 haps, timing unchanged, pitches unchanged, 224 gains changed
- kick: 96→96 haps, timing unchanged, pitches unchanged, 96 gains changed
- perc: 80→80 haps, timing unchanged, pitches unchanged, 80 gains changed
- snare: 128→128 haps, timing unchanged, pitches unchanged, 128 gains changed

| label | metric | before | after |
|---|---|---|---|
| hats | accent variance | 0 | 0.010186 |
| kick | accent variance | 0 | 0.004289 |
| perc | accent variance | 0 | 0.001096 |
| snare | accent variance | 0 | 0.043369 |

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 37/41 pass, 4 warn

### relational
- ✅ `B.must.density` — "> 1.2x A": measured 45 vs target > 34.20 (A: 28.50)

### harmonic
- ✅ `bass.accented-chord-tones[A,B]` — 96 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[A]` — 16 accented onsets (bound), 100% chord tones
- ✅ `lead.accented-chord-tones[B]` — 48 accented onsets (bound), 100% chord tones
- ✅ `keys.accented-chord-tones` — 368 accented onsets, 100% chord tones [free material — exceptions allowed, listed for review]

### motif
- ✅ `bass.bass_root_five.notes` — 128 emitted notes match the bound resolution exactly
- ✅ `bass.bass_root_five.contour` — contour shape 100% preserved after harmonic snapping (24 steps)
- ✅ `lead.minimal_dyad.notes` — 32 emitted notes match the bound resolution exactly
- ✅ `lead.minimal_dyad.contour` — contour shape 100% preserved after harmonic snapping (8 steps)
- ✅ `lead.m1.notes` — 48 emitted notes match the bound resolution exactly
- ✅ `lead.m1.contour` — contour shape 100% preserved after harmonic snapping (16 steps)
- ✅ `bass.bass_root_five.interval-profile` — leap_ratio 0.52, repetition 0.48, range 7 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.minimal_dyad.interval-profile` — leap_ratio 1.00, repetition 0.00, range 5 semitones (measured; enforcement pending grammar policy)
- ✅ `lead.m1.interval-profile` — leap_ratio 0.83, repetition 0.17, range 12 semitones (measured; enforcement pending grammar policy)

### interlock
- ✅ `A.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `A.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `A.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ✅ `A.kick+lead` — complement joint=1 (lead in kick gaps: 1, reverse: 1)
- ✅ `A.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `A.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `A.snare+lead` — complement joint=0.375 (lead in snare gaps: 0, reverse: 0.75)
- ✅ `A.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A.hats+lead` — complement joint=0.429 (lead in hats gaps: 0, reverse: 0.857) [texture grid — complement n/a]
- ✅ `A.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1)
- ✅ `B.kick+snare` — complement joint=1 (snare in kick gaps: 1, reverse: 1) [declared pair]
- ✅ `B.kick+hats` — complement joint=0.357 (hats in kick gaps: 0.714, reverse: 0) [texture grid — complement n/a]
- ✅ `B.kick+bass` — complement joint=1 (bass in kick gaps: 1, reverse: 1)
- ✅ `B.kick+lead` — complement joint=0.5 (lead in kick gaps: 0.5, reverse: 0.5)
- ⚠️ `B.kick+perc` — complement joint=0.25 (perc in kick gaps: 0.5, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity
- ✅ `B.snare+hats` — complement joint=0.607 (hats in snare gaps: 0.714, reverse: 0.5) [texture grid — complement n/a]
- ✅ `B.snare+bass` — complement joint=0.417 (bass in snare gaps: 0.333, reverse: 0.5)
- ✅ `B.snare+lead` — complement joint=0.625 (lead in snare gaps: 0.5, reverse: 0.75)
- ✅ `B.snare+perc` — complement joint=0.75 (perc in snare gaps: 0.75, reverse: 0.75)
- ✅ `B.hats+bass` — complement joint=0.762 (bass in hats gaps: 0.667, reverse: 0.857) [texture grid — complement n/a]
- ✅ `B.hats+lead` — complement joint=0.357 (lead in hats gaps: 0, reverse: 0.714) [texture grid — complement n/a]
- ✅ `B.hats+perc` — complement joint=0.411 (perc in hats gaps: 0.25, reverse: 0.571) [texture grid — complement n/a]
- ✅ `B.bass+lead` — complement joint=1 (lead in bass gaps: 1, reverse: 1) [declared pair]
- ✅ `B.bass+perc` — complement joint=1 (perc in bass gaps: 1, reverse: 1)
- ⚠️ `B.lead+perc` — complement joint=0.25 (perc in lead gaps: 0.5, reverse: 0) — rhythms collide; use a declared interlock pair or raise complementarity

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| kick | 96 | 3 | 0 | 0.666667 | 0.004289 | 0 |
| snare | 128 | 4 | 0 | 0.5 | 0.043369 | 0 |
| hats | 256 | 8 | 0 | 0.5 | 0.010186 | 0 |
| bass | 128 | 4 | 7 | 0.5 | 0.007625 | 0 |
| keys | 368 | 11.5 | 21 | 0.5 | 0.00154 | 0.096774 |
| lead | 80 | 2.5 | 12 | 0.2 | 0.007336 | 0.096774 |
| perc | 80 | 2.5 | 0 | 0.6 | 0.001096 | 0 |
| riser | 32 | 1 | 0 | 0.75 | 0.029971 | 0 |
| sweep | 8 | 0.25 | 0 | 0.5 | 0.020508 | 0 |

## What to listen for

- The requested change: velocity contour for the drums: widen each drum's gainRange from flat so the library accent profiles express — backbeats accented, ghost 16ths and offbeat hats drop to ghost level; onsets and sounds untouched
- hats: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- snare: stronger accent contour — listen for louder/softer alternation instead of flat hits.
- Everything else (bass, keys, lead, riser, sweep) is bit-identical — if anything sounds different there, that's a bug to report.

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
