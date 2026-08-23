# Melody Form — from layer to lead singer

Companion to `atlas-and-melody.md` §2 (the pipeline this upgrades). Status:
research + design (D37), from Ethan's melody-audition round 2 (2026-08-21):
melodies were key-legal (after the D36 addendum) but "repeat over and over…
almost function as harmonies, a layer, not the lead singer"; wanted stories,
longer notes, stepwise runs ("Mary had a little lamb"), and restatements that
are "slightly different BUT the same melody". Researched before hard-coding;
sources at bottom.

---

## 1. What the research says

**The diagnosis is exact.** A melody that states one bar-cell identically
every bar IS an ostinato — accompaniment by definition. The structure-aware
generation literature exists precisely because sequence models had this
failure: Museformer was built because prior models "have shortcomings in
generating musical repetition structures… not only exact repetitions but also
variations"; Theme Transformer conditions the whole generation on a theme so
it RECURS rather than loops; MELONS factors melody generation into structure
generation (a graph of eight bar-level relations — repetition, transposition,
sequence, rhythm-preserving variation…) then melody-under-structure.

**MeloForm is the blueprint** (Microsoft, 97.79% form control): an expert
system develops a MOTIF into a PHRASE into a SECTION using three operators —
**sequence** (repeat/transpose the motif), **transformation** (alter its
melodic or rhythmic character), **ending** (cadential material) — e.g. an
8-bar phrase = motif (1-2), sequence (3-4), transformation (5-6), ending
(7-8). Phrases relate by copying motifs or borrowing ONLY their rhythm;
sections repeat phrases with variations per the declared form. That is
engine-shaped: deterministic operators, declared plans, a neural pass only
for polish. Tier-1 of the D35 model ladder can do all of it.

**Phrase theory names the "story".** The classic period: an **antecedent**
phrase asks (ends inconclusively — unstable scale degree, half cadence), the
**consequent** answers (same opening, stronger ending on the tonic). Pop
sections: "the two halves begin the same but have different endings,
antecedent–consequent (weak → strong)". A story = same head, different tail,
resolution last.

**Huron gives the physics of a phrase** (Essen corpus, 6000+ folksongs):
phrases are **arch-shaped** (rise, peak past the middle, fall to the
cadence), and exhibit **phrase-final lengthening** — note durations INCREASE
toward phrase ends, in notation and in performance. Ethan's "sometimes longer
notes rather than the longest being a quarter" is this, measured. A lead
also breathes: phrase boundaries carry rests, which a wall-to-wall legato
layer never has.

**Step inertia is the "Mary" observation** (von Hippel/Huron; Chiu &
Temperley 2024): after a STEP, melodies tend to continue stepping in the SAME
direction (runs) — and the tendency's strength is a style fingerprint; after
a LEAP, ~72% reverse (post-skip reversal — the gap-fill rule already built).
v1 sampled every move independently, so it could never produce a scale run;
runs are what make a line sing rather than hop.

---

## 2. The design (bindMelody v2)

The generation unit changes from a bar-cell to a **phrase plan**. The cell
stays (it is the motif — the corpus's 73% bar-repetition still holds); what's
new is that bars get ROLES, MeloForm-style, and restatements get scheduled
variation:

- **Phrase plan** (default 4 bars): `motif · answer · motif · cadence`
  (2-bar harmony: `motif · cadence`). The answer bar keeps the motif's rhythm
  and head, re-samples its tail (bar-level question/answer). The plan spans
  `lcm(harmonyPeriod, phraseBars)`, then the whole plan is stated TWICE with
  differences (below) — same melody, changed meaningfully over time.
- **Cadence bars** (the ending operator): rhythm THINNED to the cell onsets
  in the first half-bar plus one held note — phrase-final lengthening — cut
  off before the barline for a **breath** (rest). Pitch: antecedent phrases
  land UNSTABLE (the chord's 3rd/5th, never the root — the "question");
  consequent phrases and the final phrase land STABLE (chord root/tonic).
- **Arch contour**: the per-bar melodic center follows an arch over the
  phrase (rise toward a peak past the middle, fall into the cadence) instead
  of pure nearest-tone voice-leading — Huron's shape, applied at the level
  v1 lacked entirely.
- **Step inertia** in cell generation: after a step, continue stepping the
  same direction with probability `stepInertia` (new profile knob) — this is
  what produces runs; the existing leap-recovery (0.79, corpus) keeps
  handling leaps. Profile numbers stay audition-tunable.
- **Restatement variation** (the Theme Transformer lesson — the theme recurs
  RECOGNIZABLY): motif bars repeat exactly; answer bars re-sample their tails
  per restatement; only the FINAL cadence is forced stable, so early
  restatements keep asking and the last one answers — antecedent/consequent
  across the whole strudel period, not just within a phrase.

What deliberately does NOT change: the guard hierarchy (anchors/approach/
key-locked supply, D36), determinism per seed, boundMeta explainability, and
the rule that all thresholds are defaults for the ear to tune.

---

## Sources

- [MeloForm: Generating Melody with Musical Form based on Expert Systems and
  Neural Networks](https://arxiv.org/abs/2208.14345v1)
  ([project page](https://ai-muzic.github.io/meloform/)) — the
  motif→phrase→section operators (sequence / transformation / ending)
- [MELONS: generating melody with long-term structure using transformers and
  structure graph](https://arxiv.org/abs/2110.05020) — eight bar-level
  relations; structure first, melody under structure
- [Theme Transformer](https://arxiv.org/pdf/2111.04093) — theme-conditioned
  generation so the theme recurs rather than loops
- [Museformer](https://ai-muzic.github.io/museformer/) — fine/coarse
  attention aimed at repetition-with-variation structures
- [Motifs, Phrases, and Beyond: The Modelling of Structure in Symbolic Music
  Generation](https://arxiv.org/pdf/2403.07995) — survey of the structure
  problem
- [The Melodic Arch in Western Folksongs](https://www.researchgate.net/publication/239063783_The_Melodic_Arch_in_Western_Folksongs)
  (Huron 1996) — arch contours; phrase-final lengthening per Huron 2006 (see
  also [transmission-chain replication](https://www.sciencedirect.com/science/article/pii/S1090513824000953))
- [Melodic Differences Between Styles: Modeling Music With Step
  Inertia](https://journals.sagepub.com/doi/full/10.1177/20592043231225731)
  (Chiu & Temperley 2024) — step inertia as a style parameter;
  [Why Do Skips Precede Reversals?](https://www.researchgate.net/publication/224982434_Why_Do_Skips_Precede_Reversals_The_Effect_of_Tessitura_on_Melodic_Structure)
  (von Hippel & Huron) — post-skip reversal ≈ 72%
- [Open Music Theory — Melody and Phrasing](https://viva.pressbooks.pub/openmusictheory/chapter/melody-and-phrasing/);
  [antecedent/consequent in pop writing](https://flypaper.soundfly.com/write/7-melody-writing-and-motivic-development-techniques-for-songwriters/)
