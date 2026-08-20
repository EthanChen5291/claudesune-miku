# Design Addendum — motif-engine

Extends and amends `doc.md` (the base handoff spec). Status: pre-build design, agreed in brainstorm sessions through 2026-08-19. Where this document conflicts with `doc.md`, **this document wins**. Everything else in `doc.md` (verified ground truth, build order, deliverables, Strudel gotchas) still stands.

---

## A1. Resolved ambiguities in the base spec

### A1.1 Single source of truth: all edits are spec-level
The base spec left open which artifact an edit mutates. Resolved: **every edit mutates the JSON spec (or bindings); the Strudel file is compiled output and is never hand-edited.** The file is a build artifact, like `dist/` — edit source, rebuild.

### A1.2 Deterministic compiler (hard requirement)
Consequence of A1.1: containment must hold *across recompiles*, so the compiler must be hermetic:
- Same spec + same seed → **byte-identical** output.
- A spec change touching section B must leave the compiled code for every other section **byte-identical** — stable ordering, stable formatting, no incidental churn.
- Without this, the containment diff cannot distinguish a real leak from compiler noise. This is a stated acceptance criterion, not a nice-to-have.

### A1.3 Arrangement-aware metrics (anti-Goodhart)
Note-level metrics (density, register span, entropy) are Goodhart-able: an LLM told "chorus >1.4x density" will add notes, not excitement. Perceived lift is mostly arrangement and mix. Haps carry `gain` and effect params, so extend the metric suite:
- **gain-weighted onset density** (loudness proxy)
- **active-layer count** per section
- **register width across all layers** (not just per layer)
- brightness proxies where filter params are patterned
Relational assertions (e.g. "chorus lifts") should be expressed against these, not raw note counts.

---

## A2. Dimensional containment

The base spec's containment check is binary hap-signature equality per label. That is too coarse: a legitimate harmony edit changes pitches in *every* melodic label and would be falsely rejected.

**Decompose hap signatures into dimensions** — timing (onsets + durations), pitch, dynamics (gain), timbre/params (s, effects). A containment contract specifies, per label, which dimensions may change:

- Parameter tweak: one label, one dimension.
- Harmony change: `pitch` may change on all pitched labels; `timing` must change on **none**.
- Groove swap: `timing`+`dynamics` on one label; `pitch` frozen.

This is stronger and more musical than all-or-nothing, and it is the enabling mechanism for the edit planner (A3).

---

## A3. Edit planner — general/vague edit requests

Vague requests ("make it quieter", "less active", "different harmony") intentionally don't map to one source region. They are resolved by a **planner layer** that translates intent into declared, scoped, verifiable edits. Vagueness is resolved at the planning layer; precision is enforced at the same containment layer as always.

1. **Intent ontology.** A small taxonomy mapping adjectives to an ordered list of levers. "Quieter" → [lower gain, thin onsets, drop a layer, lower register, darker filter]. Genre-typical defaults; the ordering is data the system learns from Ethan's accept/reject history.
2. **Metrics as the addressing system.** The planner never reads the Strudel file. It reads (a) the per-label-per-section metrics table the harness already computes, and (b) per-label metadata in the spec: `role` (rhythmic/harmonic/melodic/textural), `foreground|background`, `energy_contribution`. "Less active" targets the labels contributing the most onset density/syncopation in the targeted sections.
3. **Declared plans.** A plan states upfront: which labels, which dimensions (A2), which lever. Containment enforces the declaration. A plan may touch at most N labels/regions (budget) — vague requests widen scope deliberately, but never silently.
4. **Intent assertions.** Post-edit, verify the requested quantity moved in the requested direction (e.g. gain-weighted density decreased ≥X%). A vague request becomes a measurable predicate.
5. **Interpretation in the report.** report.md always states the chosen reading and the alternatives: *"Read 'quieter' as −3dB on pads+lead in B sections; alternatives: thin hats, drop a layer."* This is what makes vague-edit iteration converge in two rounds instead of six.

---

## A4. Form as trajectory, not just relations

Pairwise relational edges ("B contrasts A") don't compose into a felt arc, and cannot express AAAAA-with-rising-tension (five identical letters, five different realizations). Two changes:

### A4.1 Material identity vs realization
Separate what the base spec conflates:
- **Material identity** — what makes A "A": motifs, harmony, groove.
- **Realization** — which layers are active at what intensity *at this instance* of A.

Each section instance = `(material ref, realization params)`. ABAB-with-varying-transitions = same material, different realizations. The `recalls`/`vary` mechanism becomes a derived view of realization deltas.

### A4.2 Energy/tension curve (first-class spec element)
A target curve over the song timeline — per-section values for 2–3 macro-dimensions:
- **energy** ≈ gain-weighted density × active-layer count
- **tension** ≈ harmonic distance from tonic + syncopation
The compiler derives per-instance `vary` from curve deltas instead of hand-written per-section variation.

Consequences:
- **Transitions indexed by (Δenergy, duration)** in addition to (from_role → to_role). A riser is an upward-Δ device regardless of letters.
- **Boundary smoothness metric**: fraction of active labels shared across each section boundary. Near-zero shared labels + no transition material = the "playlist skipping" failure, now measurable and flagged.
- **Trajectory assertion**: measured section energy must correlate with the target curve; monotone where the curve says rising.

Honest caveat: symbolic energy ≠ perceived energy. The curve raises the floor; the ear owns the ceiling. Consistent with the design philosophy — ship it anyway.

---

## A5. Library: entry families, taxonomy, compatibility, style

### A5.1 Entry families
Three-plus families replace the base spec's flat rhythms/contours split. The core insight: **a melody's identity is the fusion of its rhythm and contour**; accompaniment's identity is rhythm alone. Extract accordingly.

| Family | Contents | Fusion |
|---|---|---|
| **Accompaniment rhythms** | comping figures, grooves, bass patterns, arps/ostinati | rhythm-only; binds to any harmony |
| **Melodic phrases** | rhythm + contour + accents stored **fused**; decomposable for variation, applied whole by default | fused |
| **Harmonic rhythm patterns** | *when chords change* (chord-change rate, anticipations) — distinct from comping strikes (bossa restates one chord in syncopation) | — |
| **Melodic devices** | sub-phrase grammar: opening gambits, cadence formulas, question/answer pairing, sequence patterns, 3–7-note contour cells; tagged by function (opener/continuation/cadence) | fused, short |
| **Contour-only entries** | for generative variation (base spec's contours) | — |
| **Voicing shapes** | per base spec; `addVoicings`-compatible offsets | — |
| **Transitions** | per base spec + A4.2 (Δenergy, duration) indexing | — |

### A5.2 Rhythm role taxonomy × register bands
Two **orthogonal axes** on every rhythm-bearing entry:

**Role**: `percussion` | `harmony` | `support` | `bass` | (melodic rhythm never stands alone — it stays fused in melodic phrases)

- **Percussion** — drums/perc; onsets + accents, no pitch dimension.
- **Harmony** — when chord instruments strike (comping), plus `chord_change_rate` field.
- **Support** — arps, ostinati, textural figures: pitched, patterned, not melody, not bass.
- **Bass** — first-class, not lumped into support. Bass uniquely spans both worlds: **bass rhythms** (root-anchor patterns, locked grooves) and **bass melodies** (walking lines — fused entries like melodic phrases, register/function-tagged bass).

**Register band**: `sub` | `low` | `mid` | `high`

- **Sub-bass** = `role: bass, band: sub` — a genuinely different function, not "lower bass": typically mono, sustained, fundamental-only, follows *harmonic rhythm* rather than the groove. Different style conventions (electronic-leaning).
- **High end** (hats/shimmer/air) — deferred (A11), but the band axis means adding it later is metadata, not schema redesign.

**Roles are optional and functional, not instrumental.** Not every song (or section) has every role — bass in particular. A role can be *absent* (many Fox tracks; sparse ballads) or *carried* by another instrument (solo-piano left hand carrying the bass role in a walking line). Consequences: (a) the extractor must never force-find a role a source lacks — role detection allows absence, and functional carriage is tagged (`carried_by: piano-LH`); (b) the spec declares which roles each section realizes, and absence is expressive (`withhold` in the base spec — the withheld bass returning IS the payoff); (c) compatibility edges and relational assertions apply only among roles actually present — the verifier never demands a role exist.

### A5.3 Compatibility graph
Generalizes the base spec's kick+bass interlock pairs to all role pairs. Two edge types:

- **`co-designed`** — entries extracted from the same section of the same song. Free ground truth from batch extraction, and the strongest musical data in the library. Key pairs: percussion×bass (kick lock), harmony×melody (comping strikes in the melody's gaps), bass×harmony (roots anchor changes while comp syncopates).
- **`scored`** — computed complement score for novel pairings. Mix-and-match stays legal (it's the point); a pairing below the complement threshold gets a **warning in the report**, not a rejection.

Retrieval prefers co-designed edges within the song's style palette.

### A5.4 Style containment
- Every entry carries a `style` tag from provenance (`jazz-bossa`, `toby-fox`, `standards`, …).
- Every song spec declares a **style palette**: `styles: [...]`.
- **Lint rule (mechanical, in verify)**: binding an entry outside the palette fails unless the spec carries an explicit `mix` declaration on that binding. Mixing is never prevented — it is impossible to do *silently*.
- Mix declarations are graded: `surface` (timbres, grooves, voicings — highly audible) vs `device` (abstract melodic/structural devices — barely detectable, universal anyway). report.md calls out every cross-style use with what to listen for. Policy loosens later from Ethan's accept/reject data, not from guesses.

### A5.5 Interval grammars (see `interval-grammar.md`)
A third library layer beside entries and the compatibility graph: **how each role is allowed to move**, per role × style. Key decisions (full mockup in `interval-grammar.md`):
- **Harmony is a family, not one behavior**: `melody`, `harmony.counter` (independent counter-line, real material), `harmony.parallel` (derived transform — diatonic 3rds/6ths tracking the melody, no entries needed), `harmony.comp`/`inner`/`pad`/`drone`, `support.arp`, `bass.*`.
- **Bass archetype catalog**: `anchor` (held per chord), `pulse` (repeated root per measure), `pedal` (held across changes), `alternating` (root–5th/octave), `walking`, `riff`, `sub`. Walking/riff are fused bass *melodies*; the other five derive all pitches from harmony at bind time — most bass costs the library nothing.
- **Universal vertical rules**: the b9 rule (no vertical minor 9th between voices except root→b9 on dominants), low-interval limits (mud check), sub-bass exclusion zone, register lanes.
- **Vertical interlock**: new binder/verifier check class — the harmonic sibling of the rhythmic complement score, enforced between concurrently active layers.
- **Per-section interval profiles + variation floor**: each section instance targets an interval histogram (leap ratio, range, chromaticism, repetition), modulated by the energy curve; a `recalls` section must measurably differ in ≥1 dimension or declare `copy: true`.

### A5.6 Entry schema sketch
```json
{ "id": "bossa-comp-1", "family": "accompaniment",
  "role": "harmony", "band": "mid", "style": "jazz-bossa",
  "onsets": [0, 0.1875, 0.5, 0.8125], "accents": [0.7, 1.0, 0.6, 0.9],
  "swing": 0, "chord_change_rate": "1/bar", "meter_class": "4/4",
  "compat": [{ "with": "bossa-bass-1", "kind": "co-designed" }],
  "provenance": { "kind": "transcribed", "source": "<song/section>",
                  "stem": "piano", "split_verified": true } }
```

---

## A6. Curation & the extraction pipeline

### A6.1 Curation policy (the non-circularity rule)
If the LLM generates the library, the library is cached LLM output and the quality claim is circular. Therefore: **no entry enters the library without Ethan's ear ratifying it** in the audition loop. Generation isn't the sin; skipping the listen is. Selection is where curation lives.

Every entry records provenance: `transcribed` | `generated-auditioned` | `hand-written`. This enables a real experiment later: do transcribed entries survive keep/kill at a higher rate?

### A6.2 Sources: extraction, not training
No model training. A deterministic MIR pipeline: parse → analyze → abstract → candidates → audition. MIDI and WAV fail in opposite directions:

- **MIDI = perfect *what*, often fake *how*.** Exact pitches/harmony; but quantized internet MIDI has flat velocities and grid timing — valid for contours/harmony/voicings, **invalid for accent/microtiming extraction**. Performance MIDI (MAESTRO piano, Groove MIDI drums) is the best input format that exists.
- **WAV = real *how*, noisy *what*.** Ground truth feel; transcription tax. Solo piano transcription is near-lossless (pitch, timing, velocity). Drums good. Full mixes: stem-separate first (rhythm survives well, dense voicings shakily).

**Automatic MIDI triage on ingest**: velocity variance ≈ 0 or grid deviation ≈ 0 → classify as quantized/robotic → mark valid for pitch-side extraction only. Exception: sequencer-native styles (Toby Fox composes quantized) — there, quantized MIDI *is* faithful; the triage flag is per-style-configurable.

| Extracting | Best source |
|---|---|
| Contours, harmony, voicings | any accurate MIDI, even quantized |
| Accents, swing, microtiming | performance MIDI or the actual recording (WAV) |
| Interlock/co-designed pairs | multi-track MIDI or WAV → stems |
| Solo piano anything | either — WAV transcribes near-losslessly |

### A6.3 Faithful melody/harmony split (verified, per-source confidence)
The split into melody vs harmony must be faithful before any entry derives from it.

- **Game-music MIDI**: near-free — lead/harmony/bass/drums on separate tracks.
- **WAV → stems**: physically separated (vocal stem = melody; piano stem = harmony+comping).
- **Solo piano** (hard case): skyline heuristic (top note = melody) + melody-continuity smoothing; fails on inner voices, arpeggiated textures, left-hand melodies — so:
- **Ear-verification of splits**: the extraction tool renders each claimed split as two solo-able tracks (melody alone / accompaniment alone) into the audition UI. A rejected split kills all entries derived from it. `split_verified` recorded in provenance.
- **Suspicion heuristics** (auto-flag for ears-first): "melody" stream >~40% simultaneous notes; "harmony" stream with high-variety monophonic runs.
- **No forced bass extraction — especially from solo piano.** Piano sources default to melody / harmony / voicing / comping extraction only. A bass entry may derive from piano only when a left-hand line demonstrably *functions* as bass (e.g. a walking line — tagged `carried_by: piano-LH`) and survives audition, or when the source is explicitly `role_hint: "bass"`. The extractor proposes bass candidates conservatively; it never invents a bass role to fill the taxonomy.

### A6.4 Role-hinted sources
The manifest may declare a source's role explicitly (`role_hint: "bass"` for a bass-only .wav/.midi, or any x-only stem Ethan supplies). Role-hinted sources bypass stem separation and skyline entirely and route straight to the right family/role — the highest-confidence input the pipeline accepts.

### A6.5 Batch pipeline
Human listens; machine does everything else.

1. **Wishlist manifest** (`sources.json`): per song — name, what to mine (family/role), optional target part, optional `role_hint`, style tag. Claude researches canonical tracks per slot; Ethan gathers files.
2. **Batch run** (`extract batch ./sources`): triage → (stems/transcribe if WAV) → segmentation. **Repetition detection** finds "the riff" unattended: the most-repeated bar-level segment is almost always the hook/groove.
3. **Cross-batch dedup + gap ranking**: cluster near-duplicates across all sources (half of pop shares the same claves/progressions), keep representatives, rank by what fills holes in the library's computed-property space. Ethan should see ~40 representatives, never 400 candidates.
4. **Bulk audition UI**: culling interface (photo-triage style) — grid of candidates, each bound against 2–3 harmonic contexts, spacebar to play, one key keep / one key kill. Realistic throughput 40–60/hour. Also hosts split-verification (A6.3) and instrument-palette approval (A7).
5. Keep raw sources + extraction params per entry — re-extractable when the schema evolves.

### A6.6 Scale discipline
Target ~30–60 excellent entries, ever. The batch machinery is a few scripts, not a data platform — if a step takes longer to build than the listening it saves, cut it. Retrieval sophistication (property-indexed scoring) is deferred until the library is large enough that a human can't eyeball it (~100+). Extraction tooling may be a Python sidecar (music21/pretty_midi are richer than JS equivalents) — it's offline tooling, separate from the Node engine.

Library stores **abstractions only** (onset fractions, degrees, offsets) + provenance pointers — never audio; contours kept short/fragmentary.

---

## A7. Instrument palette (third curated library)

Instruments are decoupled from source material — a Laufey vocal contour may land on EP, vibes, or a soft square lead. "Ensure they sound good" is made mechanical + ear-gated:

- The palette is a small curated set of Strudel patches (sample set or synth + effect chain + **orbit assignment**, respecting the one-delay/one-reverb-per-orbit gotcha). A patch enters the palette only after Ethan approves its sound in the audition loop.
- Each patch carries metadata the binder checks mechanically:
  - **register range** — bound material must fit or be transposed/rejected
  - **role tags** — lead / comp / bass / pad / perc
  - **attack class** — slow-attack pads cannot articulate dense figures; rhythm entries above a density threshold require fast-attack patches
- Source instrument is recorded as provenance only; it never constrains binding.

---

## A8. Initial style palette & sourcing

**Starting styles: `jazz-bossa` (Laufey-adjacent) + `toby-fox` (Undertale/Deltarune).** Deliberately complementary:
- Laufey side teaches **harmony**: extended chords, ii–V–I grammar, rootless voicings, comping rhythms, walking bass, bossa anticipations.
- Fox side teaches **melody + rhythm**: short narrow-range fused motifs, driving basslines, chip arps — and his leitmotif recontextualization is a real-world proof of the motif-renovation architecture.

Happy accidents: Strudel's square/pulse/triangle synths are *authentic* for the Fox palette (no sample-pack work needed); `.dict('ireal')` already speaks jazz chord dictionaries.

**Sourcing split**:
- Fox: MIDI-native (abundant, accurate fan transcriptions; quantized-is-faithful applies).
- Laufey: WAV → stems → transcription (vocal stem → melodic phrases; piano stem → voicings/comping/harmonic rhythm), supplemented by the **jazz standards corpus** (lead sheets, iReal-style data) for the underlying harmonic grammar at 100× the sample count.

**Adjacent expansions when ready**: jazz standards proper, Jobim/bossa canon, melody-first game composers (Uematsu, Mitsuda), Joe Hisaishi (the single best bridge between the two poles).

**Known limitation, accepted**: Laufey-style *rubato* is out of scope — Strudel is cycle-locked; ballads will be in-time, breathing via microtiming and swing, not tempo bend.

**First-pass library sketch (~30 entries covering both worlds)**: rootless A/B voicings, shells, drop-2, one quartal; major/minor ii–V–I, turnarounds, a bossa cycle, 3–4 Fox loop progressions; bossa comp, ballad arpeggiation, Charleston figure; appoggiatura-resolution openers (Laufey), pentatonic riff cells + step-sequences (Fox); walking-bass×comping and driving-8ths-bass×lead co-designed pairs; fills/risers per transition slot.

---

## A9. Melody strategy (honest expectations)

Harmony is grammatical — twenty progressions generalize forever. Melody is not: reuse a whole one and it's a quotation; over-abstract it and it dies. Therefore the melody library stores **devices** (A5.1), and a wide corpus exists to let the same device appear ten times so it can be *recognized as a device* — not to collect melodies to replay.

Expectation setting: the library gets harmony ~80% of the way and melody ~40%. Free generation — constrained by harmonic anchors, seeded with devices, judged by ear — remains the melody path. The library raises the floor; it will not write a Toby Fox melody.

---

## A10. Playback engines & the quality ceiling

The symbolic layer (engine, binder, verifier — everything that operates on haps) is engine-independent. Ceiling questions are all about the last inch of playback:

1. **Default / iteration path: in-browser** with curated sample packs. Strudel is not synths-only — `samples()` loads arbitrary .wav; a good sample pack alone moves the ceiling dramatically. **Sample-your-VSTs**: render favorite VST sounds once (notes across pitches at 2–3 velocities, one-shots) into packs. Keeps the one-click listen.html loop intact; harness unaffected.
2. **Final-render path (later): MIDI out** (`.midi()`, WebMIDI) → DAW hosting VSTs. Maximum quality; breaks one-click verification, so never the iteration path.
3. **Last resort: OSC → SuperDirt** (SuperCollider; can host VSTs via VSTPlugin). Most setup-heavy; only if 1+2 prove insufficient.

Real ceiling gaps in-browser: no deep multisampled instruments (fake 2–3 velocity layers via gain-range → sample-set mapping) and almost no mix bus (no real sidechain/glue/mastering). Accepted for the mission.

---

## A11. Deferred / open

- **High-end register band** (hats/shimmer/air taxonomy) — schema-ready via the band axis (A5.2); content deferred until Ethan calls it.
- **Rubato / continuous tempo** — out of scope (A8).
- **Retrieval scoring** — deferred until the library outgrows eyeballing (~100+ entries).
- **Style-mix policy loosening** — driven by Ethan's accept/reject data on graded mix declarations, not decided upfront.
- **Genre expansion + genre mixing** (todo.md) — expansion is additive (new style tags + wishlist rounds); mixing gated by A5.4.
- **Intent-ontology defaults** — seeded by hand, tuned from the accept/reject history.
