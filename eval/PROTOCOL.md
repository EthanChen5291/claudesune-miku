# Before/After Evaluation Protocol

Purpose: measure what the Strudel Song Engine actually changes, versus the counterfactual
(an LLM writing/editing Strudel freehand), on identical prompts with replicates.

## Arms

- **B0 (default-Claude)** — *the primary "before"*: an agent gets only the musical brief and
  the change requests, phrased as a casual project ask, with **no format constraints and no
  engine knowledge**. It makes music however Claude naturally would (its choice of tools and
  formats — historically MIDI-via-script, synthesized audio, etc.). This is the true
  counterfactual: "what happens today if you randomly ask Claude to make music."
  Files: `eval/before-default/`.
- **B1 (freehand-Strudel)** — *format-matched ablation*: same prompts, but the agent must
  produce one `.strudel` file with labeled layers, written purely from its own knowledge —
  no engine, no verification, no code execution. Isolates what the engine adds *beyond*
  merely targeting Strudel, and makes containment numbers directly comparable to the engine
  arm. Files: `eval/before/`.
- **AFTER (engine)**: the same prompts flow through the engine: song spec JSON → compile →
  bind → verify; each edit is scoped, containment-gated, and re-verified.
  Files: `eval/after/`.

B0 and B1 were both generated **before** the engine was implemented, by agents never shown
the engine design. B0 outputs are scored with format-appropriate tooling (e.g. MIDI track
diffing for containment) where possible; what can't be measured automatically is reported
as such rather than silently skipped.

## Replicates

**3 replicates per case per arm** (r1, r2, r3), independently generated, so before/after
differences are separable from song-to-song variance. The same prompts are used in both arms
(paired design). 4 cases × 3 replicates × 2 arms = 24 songs; 9 edit specs × 3 reps × 2 arms
= 54 edit operations.

## Fairness notes

- Both arms use the same output-format contract (one file, labeled layers) because the
  measurement instrument needs labels; this is measurement scaffolding, not engine assistance.
- Both arms see the full edit list up front but are instructed to apply edits one at a time
  without anticipating later ones (symmetric across arms).
- Scoring runs ONCE, after the engine exists, with the same harness on both arms' frozen files.
- Containment is scored at the **instrument-stream level** (haps partitioned by label × sound
  family), not just the label level — otherwise a song with one monolithic `drums:` label would
  trivially "pass" a hats-only edit. This removes the labeling-granularity confound.

## Metrics (scored identically on both arms)

1. **eval-success**: does the file evaluate headlessly under the pinned Strudel packages
   (proxy for "runs when pasted into strudel.cc"). Parse/runtime failures are data, not
   exclusions.
2. **edit containment (leak rate)**: per edit, which instrument streams changed vs. the
   allowed set implied by the edit prompt (`eval/cases.json`). A leak = any non-allowed
   stream whose hap signature changed. Also aspect-level: an edit scoped to "sound only"
   must leave pitch+timing signatures unchanged.
3. **edit effectiveness**: did the targeted metric move in the requested direction
   (hat onset density up, chorus lift ratio up, harmonic rhythm halved, ...), measured on the
   targeted stream/section.
4. **structural quality**: chorus/verse density & register-span ratios where the prompt
   demands a lift; meter integrity for the 7/8 case (onsets on the 7-grid); accent variance
   (uniform velocity = 0); presence of transition material at section boundaries for C4.
5. **edit minimality**: within allowed streams, fraction of haps changed (an "edit" that
   rewrites the whole layer scores worse than a surgical one) — reported, not pass/fail.

Results: `eval/results/` (raw JSON per song/edit) and `eval/REPORT.md` (aggregate comparison).

## Scoring amendments (made during analysis, applied uniformly to all arms; see git history)

1. C3.E1 (halve harmonic rhythm): allowed streams widened to include harmony-following
   layers (bass/lead/melody/arp) — a harmony edit legitimately re-binds what tracks it
   (doc §3.3 binding-expansion semantics). Cleared one B1 "leak" and two AFTER "leaks".
2. Aspect judging when timing legitimately changed: locked aspects are judged by
   value-palette growth (new values appearing), not sequence identity — dropping onsets
   structurally shortens every sequence and must not count as a pitch/gain/sound change.
3. C2.E2 (sparser lead): gain allowed — a different rhythm entry carries its own accent
   profile (§3.4: accents are rhythm-intrinsic).
4. B0 sound-only no-ops (C1.E3) count as clean when the WAV changed: timbre is not
   representable in MIDI; the correct edit leaves the note data untouched.

## Review-driven scorer corrections (adversarial review, applied uniformly; see git)

5. MIDI parser: meta/sysex events now CLEAR running status per the SMF spec (they
   were being treated as running status, silently corrupting streams — one corrupt
   B0 file scored as valid). Malformed files now fail loudly as eval-success data.
6. Unnamed MIDI tracks are named by their GM program family, so instrument identity
   survives and unnamed-track edits are not automatic leaks.
7. C4.E1 allowed streams include drum voices (a drum fill IS transition material
   wherever it lands) — with the caveat that this loosens the scope for all arms.
8. Transition "energy" counts note durations as well as onsets (a LONGER riser is
   bigger even at equal onset count).
9. Leak-vs-aspect double-charging fixed (leaked streams were also counted as aspect
   violations due to an object-identity bug).
10. `fullyClean` aggregate: contained + no aspect violations + effect not failed,
    OR a sound-only no-op whose WAV changed (correct behavior in MIDI-land).
