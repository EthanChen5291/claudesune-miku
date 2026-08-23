# Pattern Atlas & Melody Pipeline

Companion to `design-addendum.md`, `interval-grammar.md`, `arrangement-grammar.md`.
Status: research + design (D35), from Ethan's 2026-08-21 asks with online
research (sources at bottom). **§1 and §2 tiers 1 are BUILT — see DECISIONS
D36** (chordScale in theory.js, bindMelody/melodyReport in bind.js,
melody-profiles.js, build-atlas.mjs → atlas.js, undertale-context.js, and the
audition page's section grouping + "own + melody" texture). Two asks, one
system:

1. **The atlas** — extracted patterns must not be a flat copy-paste pool; they
   organize into *sections of similar patterns* by "vibe" (via the chord
   progression) and "speed" (tempo + rhythm), with rich metadata — including
   background knowledge of the soundtrack and the specific song.
2. **Alignment + abstraction** — given ANY harmony/bass, generate a melody
   that works with it: notes guarded, but not locked to the chord's own
   intervals. "Find a chord progression, determine the key, create a melody
   with a rhythm pattern" — as a pipeline.

They connect: the melody pipeline's rhythm and device choices are atlas
retrievals. Same decision philosophy as everything since D32: hard rules →
weighted ranking → seeded choice, every decision declared, everything ear-gated.

---

## 1. The Pattern Atlas

### 1.1 What the research says

MIR rhythm-similarity work converges on a small feature set: metrical/onset
profiles + syncopation + tempo, compared per-dimension (and edit-distance for
pattern-shape similarity across tempi). Emotion-of-harmony research converges
on: mode is the primary valence cue; progression *context* (stability of the
termination, tension) modulates it; borrowed chords are the color/darkness
lever. Both map directly onto properties the engine already computes
(`rhythmProperties`, degrees grammar) — the atlas is mostly *organizing* what
exists, plus one genuinely new axis (context, §1.3).

### 1.2 The feature record (per entry, computed at import)

Three axis groups. Everything numeric is normalized corpus-wide; everything is
data on the entry, so `find*()` filters keep working and similarity is a view
over the same record.

**Vibe (harmonic) — from the progression:**

| Feature | Definition | Why |
|---|---|---|
| family | major/minor (exists) | primary valence cue (research) |
| modal_color | count + identity of non-diatonic root degrees (bVII, bVI, bII, #IV…) | borrowed chords = the darkness/color lever |
| quality_mix | % minor-family, % 7th-bearing, dim/aug present | triadic-pop vs jazz-tension feel |
| harmonic_rhythm | chords per bar (from barsPerChord) | stately vs churning |
| root_motion | histogram: 5ths / steps / 3rds / chromatic | functional vs planing vs lament |
| cadence_class | authentic / plagal / deceptive / none-loop | does it resolve or cycle |
| tension_curve | per-chord distance-from-tonic sequence (shape: flat/arch/rising) | the loop's internal arc |

**Speed (temporal) — from rhythm entries / figures / bpm:**

| Feature | Definition |
|---|---|
| bpm_band | slow <90 / mid 90-130 / fast >130 (source bpm) |
| density | onsets per bar (exists) |
| subdivision | 8ths / 16ths / triplet (from grid) |
| syncopation | off-grid onset ratio (exists) |
| chordness | struck-together ratio (exists, D30) |
| articulation | legato/staccato axis (arrangement-grammar §5.3) |
| accent_spread, microtiming | exists (D29/D30) |
| onset_shape | the onset set itself, for edit-distance nearest-pattern matching |

**Context (semantic/provenance) — the user's addition, and the axis no
computation can produce:**

```js
context: {
  soundtrack: 'undertale',
  song: 'Hopes and Dreams',
  role: 'final-battle',            // battle | boss | town | overworld | character | cutscene | menu
  character: 'Asriel',
  motifs: ['once-upon-a-time', 'snowy'],   // leitmotif families (documented)
  arc: 'climax',                   // where in the game's arc the song sits
  notes: 'the save-the-world reprise of the opening theme',
}
```

Undertale is unusually well suited to this: its leitmotif structure is
*documented* (the community Leitmotif Index and published analyses map which
songs share which motifs — e.g. the "Once Upon a Time" family spans Undertale,
Hopes and Dreams, SAVE the World; Undyne's motif appears in seven songs).
Motif families are REAL similarity ground truth: two progressions from the
same motif family are related in a way no feature vector would discover.
Ruling: context blocks are **curated from documented sources, cited, never
invented** (the A6.1 spirit — a hallucinated character association is worse
than an empty field). Authoring is a one-time pass over the 110 songs against
the index; `notes` is free text for exactly the "background knowledge of the
specific song" Ethan asked to keep.

### 1.3 Sections and neighborhoods (the anti-copy-paste mechanism)

- **Sections** (browse level): agglomerative clustering over the normalized
  vibe+speed vector (deterministic: fixed linkage, stable ordering, seeded
  tie-breaks), cut at ~8-15 clusters per pool. Each section gets a computed
  label ("minor · planing · 16ths · fast") — the audition pages group cards by
  section instead of a flat grid, which IS the "organized into sections of
  patterns similar to them" ask.
- **Neighbors** (retrieval level): per entry, k nearest by weighted distance,
  with the weighting selectable by axis: `similar(entry, 'vibe')`,
  `similar(entry, 'speed')`, `similar(entry, 'context')` (same motif family /
  same role), or blended. Onset-shape neighbors use edit distance on the onset
  sets (the standard MIR move), so a pattern's rhythmic siblings are found even
  across meters and tempi.
- **The ruling that prevents copy-paste**: retrieval returns a NEIGHBORHOOD,
  never a single entry as "the answer". The binder samples within the
  neighborhood (seeded) and is free to apply the declared variation operators
  (arrangement-grammar §1, motif transforms). An entry is an *example of a
  family*; the family is the unit of style. This also keeps A6.6's scale
  discipline honest — the library stays small because entries stand for
  regions, not moments.
- Emission: `src/lib/atlas.js`, generated — feature records + section ids +
  neighbor lists for every entry across all pools (ldrolez / unison /
  undertale), so one query spans corpora exactly like `findProgressions`.

---

## 2. The Melody Pipeline ("alignment and abstraction")

### 2.1 What the research says, in one paragraph

The exact "guarded but not chord-locked" middle ground Ethan is asking for has
fifty years of practice behind it. **Chord-scale theory** (Berklee): each chord
*in context* maps to a scale — improvise from the scale and you get chord tones
plus colorful-but-consonant tensions; put chord tones on downbeats to stay
anchored; avoid-notes are the exceptions. **Impro-Visor** (Keller, Harvey Mudd)
made this generative: a probabilistic grammar whose terminals are note
CATEGORIES — chord tones, color tones, approach tones, scale tones — filled in
over any chord sequence, with rule weights controlling style; listeners matched
its output to the imitated soloist 85-95% of the time. Deep-learning systems
(MidiNet, MelodyDiffusion, JazzGAN, GenJam; Anticipatory Music Transformer for
accompaniment-conditioned infilling) attack the same conditioning problem
statistically. And **Hooktheory's TheoryTab/HLSD** — 40k+ human analyses storing
melody as SCALE DEGREES relative to the key with Roman-numeral chords — is
external validation that the engine's degree-relative representation is the
right abstraction: melody encoded that way transposes to any key and any
progression *by construction*, which is Ethan's "abstraction" in one sentence.

The engine already holds most of the pieces: key solve from arbitrary MIDI
(D30), degree-relative progressions (D28), D14's anchor-snapping (chord tones
on accents, diatonic passing on weak beats — literally the Berklee downbeat
rule), the §5/§6 grammars and tension tables, contour/device families (A5.1),
and the corpus's measured melodic habits (undertale-melody.md). What is MISSING
is one layer: **per-chord scale assignment** (D14 uses one global key scale)
and **approach-tone slots** (chromatic motion INTO anchors — the thing
chord-scale theory itself famously lacks and Impro-Visor added as a category).

### 2.2 The pipeline

`bindMelody(harmonyContext, opts)` — same contract shape as bind()/bindFigure():
deterministic given seed, boundMeta explains every note, verifier can check it.

1. **Intake** — a progression however it arrives: authored symbols, a library
   entry, or raw MIDI (chordTimeline + solveKeyKS already turn any file into
   labeled chords + key). Output: chords + key + barsPerChord. *This is the
   literal "find a chord progression, determine the key" — built, tested.*
2. **Chord-scale assignment** (new, small): per chord, in key context, assign
   its scale — diatonic function → mode (ii→dorian, V→mixolydian, iv in
   major→borrowed aeolian…), secondary dominants → mixolydian/altered per
   resolution target, borrowed chords → their source mode. The §6 tension
   tables already say which scale members are Safe/Careful/Avoid per quality;
   chord-scales give the *pitch supply*, tension tables give the *pecking
   order*. This is what unlocks "not stuck to the harmony's intervals":
   the melody's vocabulary is 7 notes per chord, not 3-4.
3. **Rhythm** — an atlas retrieval: melodic-role rhythm from the neighborhood
   matching the harmony's vibe/speed features (a dark fast 16th progression
   pulls dark fast melodic rhythms), or the rhythm half of a melodic device.
   *This is the atlas and the pipeline meeting.*
4. **Note choice — the guard hierarchy** (per onset, in priority order; each
   note's category recorded in boundMeta):
   - **anchors** (accent ≥ .7, phrase heads): chord tone or Safe tension —
     D14's snap, unchanged;
   - **approach slots** (the subdivision directly before an anchor, chosen by
     the grammar with ~10-20% probability): chromatic or diatonic neighbor
     that resolves INTO the next anchor by half/whole step — the Impro-Visor
     category D14 lacks, and the single biggest "sounds like a player, not a
     scale" upgrade;
   - **everything else**: chord-scale tones, weighted by the §5 horizontal
     grammar (steps core, leaps as events with §5's recovery rule) and by the
     section's §7 interval profile;
   - **cadence targets** override the phrase end (exists).
5. **Shape** — the cell-first principle, straight from the corpus: 73% of
   Undertale melody bars repeat an interval pattern already stated. So the
   pipeline generates ONE strong bar-cell (from a device entry, a contour, or
   grammar sampling), then REPITCHES it through the progression exactly the
   way ownFigure re-renders the accompaniment (D34) — the melody's identity is
   the cell; the harmony re-colors it per chord. Variation at phrase
   boundaries only (arrangement-grammar §4 triggers): last-beat vary, octave
   throw, the gap-fill leap habits — the undertale-melody.md numbers become
   sampling weights for the toby-fox style profile.
6. **Verify** — existing harmonic assertions judge anchors; new cheap checks:
   every approach note resolves as declared; interval histogram meets the §7
   profile; cell-repetition floor met (a melody with no repeated cell fails
   toby-fox style, per the corpus).

### 2.3 Where models fit (three tiers, so "the models" stay accountable)

- **Tier 1 — grammar pipeline (build this)**: the LLM decides at the SPEC
  level (which device family, which profile, which atlas neighborhood, which
  seed), the pipeline renders notes. Deterministic, verifiable, cheap, and the
  Impro-Visor evidence says grammar-over-changes is *sufficient for
  style-convincing lines*.
- **Tier 2 — LLM freehand through the guard**: the LLM proposes degree
  sequences directly (it is good at cells and shapes); the guard hierarchy
  legalizes them (anchor snap, approach validation, grammar filter) instead of
  generating. This is today's "free generation constrained by harmonic
  anchors" (A9) with the new layers as the safety net.
- **Tier 3 — trained models (explicitly deferred)**: an Anticipatory-Music-
  Transformer-style infilling model conditioned on the accompaniment, or a
  scale-degree melody model trained on Hooktheory's HLSD (its relative
  notation matches ours, so its output would bind key-free). Heavy, and the
  non-circularity rule stands: model output enters the library only through
  the audition gate. Revisit only if Tiers 1-2 plateau by ear.

---

## 3. Build hooks (respecting the existing queues)

1. **Atlas emitter** — `scripts/build-atlas.mjs` → `src/lib/atlas.js`:
   feature records (mostly existing computations), sections, neighbors;
   audition pages grow section grouping + a "similar" action. Context blocks
   authored for the Undertale 110 against the Leitmotif Index (one curation
   pass, cited).
2. **Chord-scale layer** — `theory.js` gains chordScale(sym, key) consulting
   §6; D14 upgraded: weak onsets draw from the chord-scale instead of the one
   global key scale (behavior-compatible where the chord is diatonic).
3. **bindMelody v1** — cell-first + guard hierarchy + approach slots, devices
   from A5.1 as cell sources; boundMeta categories; verifier checks.
4. **Style profiles** — undertale-melody.md numbers as the toby-fox sampling
   weights; jazz-bossa profile from interval-grammar §5 when Laufey material
   lands.
5. **Tier 3** — parked in A11 (deferred/open) with the two candidate routes
   named above.

Every threshold (10-20% approach probability, cluster counts, distance
weights) is an audition-tunable default, not a claim.

---

## Sources

- Impro-Visor grammar approach: [A Grammatical Approach to Automatic
  Improvisation](https://www.academia.edu/3128822/A_Grammatical_Approach_to_Automatic_Improvisation);
  [Machine Learning of Jazz Grammars](http://ai.stanford.edu/~kdtang/papers/cmj10-jazzgrammar.pdf);
  [Impro-Visor](https://en.wikipedia.org/wiki/Impro-Visor)
- Chord-scale theory: [Open Music Theory — Chord-Scale
  Theory](https://viva.pressbooks.pub/openmusictheory/chapter/chord-scale-theory/);
  [Berklee — Chord-Tone vs Chord-Scale Soloing](https://www.berklee.edu/berklee-today/summer-2000/Chord-Tone);
  [Chord-scale system](https://en.wikipedia.org/wiki/Chord-scale_system)
- Conditioned symbolic generation: [A Survey on Deep Learning for Symbolic
  Music Generation](https://dl.acm.org/doi/full/10.1145/3597493);
  [MelodyDiffusion](https://www.mdpi.com/2227-7390/11/8/1915);
  [Anticipatory Music Transformer](https://arxiv.org/abs/2306.08620)
  ([Stanford CRFM writeup](https://crfm.stanford.edu/2023/06/16/anticipatory-music-transformer.html?idx=1))
- Melody-harmony data in relative notation: [Hooktheory
  TheoryTab](https://www.hooktheory.com/theorytab); [HookTheory Lead Sheet
  Dataset](https://www.emergentmind.com/topics/hooktheory-dataset);
  [Melody transcription via generative pre-training](https://arxiv.org/pdf/2212.01884)
- Harmony & emotion: [Music emotion recognition using chord
  progressions](https://yonsei.elsevierpure.com/en/publications/music-emotion-recognition-using-chord-progressions/);
  [Moderating effects of chord progressions on emotional experience of
  major/minor chords](https://pubmed.ncbi.nlm.nih.gov/39793277/)
- Rhythm similarity: [Rhythmic Similarity Methods in
  MIR](https://indusedu.org/pdfs/IJREISS/IJREISS_2896_57449.pdf);
  [Multidimensional Similarity Modelling of Complex Drum
  Loops](https://archives.ismir.net/ismir2020/paper/000211.pdf)
- Undertale leitmotif structure: [Leitmotif
  Index](https://jcoxeye.github.io/leitmotif-index/main.html);
  [Jason M. Yu — Leitmotifs in UNDERTALE, parts 1-2](https://jasonyu.me/undertale-part-1/);
  [Undertale Wiki — Leitmotifs](https://undertale.fandom.com/wiki/Leitmotifs)
