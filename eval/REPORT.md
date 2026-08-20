# Before/After Evaluation — Results

Three arms, identical briefs and edit chains, 4 cases × 3 replicates × 2–3 edits each
(27 edit operations per arm), all scored by the same instrument (`eval/score.js`,
raw records in `eval/results/`). Protocol: `eval/PROTOCOL.md`. Cases: `eval/cases.json`.

- **B0 — default-Claude** (the true counterfactual): casual project ask, no format
  constraints. All 12 replicates chose Python/numpy synthesis → WAV + MIDI mirror.
- **B1 — freehand Strudel**: same briefs, one labeled `.strudel` file, written from
  model knowledge, no verification or execution allowed.
- **AFTER — engine**: spec JSON → compile → bind → verify; every edit scoped and
  containment-gated by the engine.

**Integrity note (A6.1):** the engine arm ran on *unratified, hand-written* library
entries (`ratified: false`) — every claim below is about the **mechanism**
(containment, binding, verification), not about curated-library quality.

## Headline table

| measure (27 edits/arm) | B0 default | B1 freehand-Strudel | AFTER engine |
|---|---|---|---|
| edits stream-contained | 15 | **27** | **27** |
| leaking edits | **8** | 0 | 0 |
| no-op edits | 4 (3 legitimately¹) | 0 | 0 |
| aspect violations (scope letter broken) | 0¹ | 1 | 0 |
| requested effect achieved | 18 | **27** | 22 |
| **edits fully clean** | **17 (63%)** | **26 (96%)** | **22 (81%)** |
| mean changed-fraction within target² | 0.72 | 0.77 | 0.72 |
| v0 generations evaluable | 12/12 | 12/12 | 12/12 |
| v0 drum velocity variance (0 = robotic) | 0.034 | 0.059 | 0.035 |

¹ B0's three C1.E3 no-ops are *correct* (a timbre swap lives in the synth, not the
MIDI; the WAV changed, the notes didn't) and are counted clean. Sound-aspect scoring
is not observable in MIDI, so B0's aspect row is structurally lenient.
² Fraction of the targeted stream's haps changed; lower = more surgical. Roughly
equal across arms — an edit like "hats 8ths→16ths" legitimately rewrites the layer.

## Per-edit outcome matrix (3 replicates per cell)

| edit | B0 | B1 | AFTER |
|---|---|---|---|
| C1.E1 hats busier | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| C1.E2 chorus lifts, verse untouched | **LLL** | ✓✓✓ | ✓✓✓ |
| C1.E3 darker bass, sound only | ✓✓✓¹ | a✓✓ | ✓✓✓ |
| C2.E1 swing the hats (7/8) | ✓✓✓ | ✓✓✓ | **e**✓✓ |
| C2.E2 sparser lead, A sections only | **nLL** | ✓✓✓ | ✓✓✓ |
| C3.E1 halve harmonic rhythm | **e**✓✓ | ✓✓✓ | ✓✓✓ |
| C3.E2 drum velocity contour | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| C4.E1 bigger final transition | **LLL** | ✓✓✓ | ✓**e**✓ |
| C4.E2 key change, pitch only | ✓✓✓ | ✓✓✓ | **eee** |

L = leaked into untargeted streams · a = broke the scope's aspect letter ·
n = nothing changed · e = requested effect not measurably achieved

## What the numbers say

**1. The true default (B0) fails the edit task.** 10 of 27 edit requests failed
outright: every "chorus lifts, verse must not change" leaked into the verse; every
"only transition material may change" rewrote other layers; "sparser lead in A only"
leaked or did nothing. This is the failure mode the engine exists for — and in the
default workflow it is *silent*: nothing tells you the verse changed.

**2. Freehand Strudel (B1) was far more precise than expected** — 26/27 clean.
Read this carefully rather than triumphantly:
- These are ~30–60-line files the same frontier model wrote minutes earlier, with
  edits stated with unusual scoping precision. Favorable conditions for freehand.
- B1's precision is **measured post-hoc by this harness; nothing guaranteed it at
  edit time.** The one aspect violation shipped without anyone knowing. The engine's
  27/27 is **by construction** — a leak is rejected before it becomes a version
  (demonstrated in `songs/neon-undertow/EDIT_SESSION.md`, exit code 4, nothing written).
- B1 has no verification loop at all: no chorus-lift assertion, no withhold/payoff
  check, no harmonic-anchor check, no report, no A/B listen page. Its generation
  quality claims are unfalsifiable; the engine's are measured per version.

**3. The engine's five effect misses are legible, concentrated, and diagnosable —
because everything is measured:**
- **C4.E2 (0/3):** a spec-level key change *re-derives* the song in the new key —
  ireal re-voices chords in new shapes rather than literally shifting every pitch
  +2 (82–89% of pitches moved exactly +2). Musically defensible, but it violates
  the letter of "transposition only". Fix path: a literal-transpose edit operator
  that bypasses re-binding. Known limitation, now on record.
- **C2.E1 (1 miss):** `swingBy(x, 7)` on a rhythm whose onsets all sit at slice
  starts moves nothing — swing over straight 7/8 pulses silently no-ops. Fix path:
  binder warns when a swing affects zero onsets. (The other two replicates chose
  finer rhythms and swung correctly.)
- **C4.E1 (1 miss):** the agent lengthened the riser; onsets-per-bar as an energy
  proxy slightly dropped. Metric limitation as much as engine limitation.

**4. Scoring amendments made during analysis (uniform across arms, all in git):**
harmonic-rhythm edits legitimately re-bind harmony-following layers (C3.E1 scope
widened; also cleared B1's one such "leak"); when timing legitimately changes,
locked aspects are judged by value-palette growth instead of sequence identity;
a sparser rhythm carries its own accent profile, so C2.E2 allows gain movement.

## Bottom line

Against the **actual default** (B0), the engine turns a 63%-clean, silently-failing
edit process into a 100%-contained, 81%-effective one with named leaks, per-edit
reports, and A/B listening. Against a **skilled freehand Strudel writer** (B1), the
engine's containment advantage on small songs is a guarantee rather than an outcome
delta — the eval's honest finding is that the engine's remaining gap is *effect
fidelity on two specific edit types*, both now precisely characterized, while the
freehand path's gap is that **nothing in it can ever tell you when it fails.**

Replicates: n=3 per cell; treat per-cell differences as directional, not significant.
