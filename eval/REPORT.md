# Before/After Evaluation — Results (corrected)

> **Correction notice:** an adversarial review of the scorer found four bugs that
> systematically disadvantaged the B0 arm (MIDI running-status corruption, discarded
> instrument identity on unnamed tracks, synonym asymmetry on drum fills, and
> duration-blind energy metrics). All are fixed; every arm is re-scored below with
> the same corrected instrument. An earlier revision of this report overstated B0's
> failures — the corrected numbers change the headline, and we keep the honest one.

Three arms, identical briefs and edit chains, 4 cases × 3 replicates × 2–3 edits
(27 edit operations per arm), one scoring instrument (`eval/score.js`, raw records
in `eval/results/`). Protocol + amendments: `eval/PROTOCOL.md`.

- **B0 — default-Claude** (the true counterfactual): casual ask, no constraints.
  All replicates chose Python/numpy → WAV + MIDI.
- **B1 — freehand Strudel**: one labeled `.strudel` file from model knowledge,
  no verification, no execution.
- **AFTER — engine**: spec → compile → bind → verify; edits scoped and gated.

**Integrity notes:** the engine arm ran on *unratified hand-written* library entries
(`ratified: false`) — claims are about the mechanism, not curated-library quality.
Section-scoped containment ("the verse must not change") is verified inside the
engine's own gate but is NOT independently measured by this scorer for any arm.

## Headline table (corrected)

| measure | B0 default | B1 freehand | AFTER engine |
|---|---|---|---|
| v0 generations valid | 11/12¹ | 12/12 | 12/12 |
| edits stream-contained | 21/25 scored | **27/27** | **27/27** |
| leaking edits | 1 (+2 unscoreable¹) | 0 | 0 |
| aspect violations | 0² | 1 | 0 |
| requested effect achieved | 24/25 | **27/27** | 22/27 |
| **edits fully clean** | **23/27 (85%)** | **26/27 (96%)** | **22/27 (81%)** |
| v0 drum velocity variance | 0.034 | 0.059 | 0.035 |

¹ One B0 replicate (C2/r1) wrote a structurally corrupt MIDI file — its whole edit
chain is unlistenable as MIDI, and **nothing in the B0 workflow noticed**.
² The sound aspect is unobservable in MIDI, so B0's aspect row is structurally lenient.

## What the corrected numbers actually say

**1. A frontier model editing small, self-authored files is already precise.**
On ~30–60-line songs it wrote minutes earlier, with unusually well-scoped edit
requests, the freehand arms rarely leak (B0: 1 leak; B1: 0). The engine's containment
advantage on THIS eval is therefore **not a raw outcome delta — it is a guarantee
plus a reject path**. The differences that remain are qualitative and they all
point the same direction:

- B0 shipped a **corrupt deliverable** (C2/r1) and an **organ leak** (C1/r3) with
  zero indication anything was wrong. B1 shipped its one aspect violation silently.
  The engine *rejected* equivalent mistakes before they became versions
  (demonstrated live in `songs/neon-undertow/EDIT_SESSION.md`: leak → exit 4,
  nothing written).
- Neither baseline can verify structure: no chorus-lift measurement, no
  withhold/payoff check, no harmonic-anchor policing, no report, no A/B page.
  The engine emits all of these on every accepted version — including catching its
  own musical regression mid-session (edit 1 broke the chorus lift; the metrics
  said so; edit 6 fixed it).
- Expect the freehand arms' precision to degrade with song size, edit-chain length,
  and time-since-authoring; the guarantee doesn't. n=3 per cell cannot show that
  scaling story — it is the design argument, stated as such, not a measured result.

**2. The engine's five effect misses are real, concentrated, and now designed for:**
- **C4.E2 ×3:** spec-level key change re-derives voicings in the new key (82–89%
  of pitches move exactly +2, the rest re-voice). Violates the letter of
  "transposition only". → design-addendum **A3.6** (typed edit operators:
  `literal_transpose` vs `rederive_key`, declared, never silently chosen).
- **C2.E1 ×1:** swing over straight 7/8 pulses moved zero onsets. The binder now
  **warns at bind time** when swing affects no onsets, and hard-errors when swing
  would push an onset past its window (strudel silently deletes those). → also
  generalized as design-addendum **A3.7** (universal no-op detection).
- **C4.E1 ×1:** one replicate's "bigger transition" measured flat (3.0 → 2.97
  energy) — a genuine execution miss by the engine-arm agent, visible because it
  is measured.

**3. What the eval cannot show yet** — flagged rather than implied: section-scoped
independence ("verse untouched") is unmeasured by the scorer; B1's strong numbers
come with zero mechanical assurance behind them; all arms were driven by the same
model under favorable conditions; n=3 per cell is directional only.

## Per-edit outcome matrix (3 replicates per cell)

| edit | B0 | B1 | AFTER |
|---|---|---|---|
| C1.E1 hats busier | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| C1.E2 chorus lifts, verse untouched | ✓✓**L** | ✓✓✓ | ✓✓✓ |
| C1.E3 darker bass, sound only | ✓✓✓ | **a**✓✓ | ✓✓✓ |
| C2.E1 swing the hats (7/8) | **uu**✓ | ✓✓✓ | **e**✓✓ |
| C2.E2 sparser lead, A only | **u**✓✓ | ✓✓✓ | ✓✓✓ |
| C3.E1 halve harmonic rhythm | **e**✓✓ | ✓✓✓ | ✓✓✓ |
| C3.E2 drum velocity contour | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| C4.E1 bigger final transition | ✓✓✓ | ✓✓✓ | ✓**e**✓ |
| C4.E2 key change, pitch only | ✓✓✓ | ✓✓✓ | **eee** |

✓ clean · L leak · a aspect violation · e effect not achieved · u unscoreable (corrupt MIDI)
(C2 columns: r1 is the corrupt-MIDI replicate for B0.)

## Bottom line

The engine did what it was designed to do — 27/27 contained **by construction**,
with named leaks on rejection, measured musical structure, and per-version listening
artifacts — and this eval also measured, honestly, that on small fresh songs a
skilled freehand pass gets close on outcomes while offering none of the assurance.
The engine's real deficits surfaced with numbers attached (transposition fidelity,
swing semantics) and are already folded into the design (A3.6/A3.7). The baselines'
deficits surfaced only because *this eval's instrument* exists — inside their own
workflows, nothing would ever have said a word.
