# Pattern Foundations Census — motif-engine

Census date: 2026-08-25. All counts computed by importing the live library modules (not by eyeballing).
Everything below marked CANDIDATE follows the project rule: libraries are candidate pools until ear-ratified; nothing here is a claim about what sounds good.

---

## 1. The figure grammar, AS IMPLEMENTED (`bindFigure`, src/binder/bind.js:547-678)

### 1.1 Token grammar (the validating regex, line 450)

```
FIGURE_TOKEN = /^(R|[34567]|9|~\d+)(\+*)$/
```

Applied **per member after splitting the token on `.`** (line 555). So the exact grammar is:

```
token       := member octave-marks ( '.' member octave-marks )*   ; '.' = struck together
member      := 'R' | '3' | '4' | '5' | '6' | '7' | '9' | '~' digits
octave-marks := '+'*                                              ; zero or more, unbounded
```

- `R` — the chord root (0 semitones above the cycle's root reference).
- `3 4 5 6 7 9` — the *sounding chord's* member, quality-blind. Resolved by `memberSemis()` (line 453) preferring what the chord actually carries, in this order:
  - `3` → 4, then 3 semitones
  - `4` → 5, then 6
  - `5` → 7, then 6, then 8 (diminished/augmented fifths included)
  - `6` → 9, then 8
  - `7` → 10, then 11, then 9
  - `9` → 2, then 1, then 3
  - If the chord carries none of the candidates: FALLBACK `{3:4, 4:5, 5:7, 6:9, 7:10, 9:2}` **with a warning** naming the chord.
- `~<n>` — a literal n semitones above the root, verbatim (`Number(member.slice(1))`), for colours the chord does not contain. `n` is any non-negative integer (`\d+`), so `~0` and `~13` are grammatically legal; the corpus uses `~1`–`~11`.
- `+` — one octave up per character (`+ 12 * plus.length`, line 645). Corpus goes up to `++++`.
- `a.b[.c...]` — simultaneity. Each member validated separately; emitted as a Strudel chord `[name1,name2,...]` (line 650). Note `3.5` is always "third struck with fifth" — there are no decimals.
- **No octave-down marker exists.** The only downward control is the entry/opts `octave` field. (The extractor `memberToken` in src/ingest/piano.js:473-479 clamps below-reference notes to `+0` — `'+'.repeat(Math.max(0, oct))` — so below-root voicing information is lost at import time.)
- **No rest token, no tie, no duration token** inside `figure[]`. Rests are the gaps between onsets; sustain is governed solely by the entry's `legato` flag.

### 1.2 Entry shape and validation

`figEntry: { onsets, accents, figure, bars?, microtiming?, legato?, octave?, name? }`
`opts: { octave = figEntry.octave ?? 3, sound = 'piano', fx = '', gainRange = [0.35, 1.0], rhythmName, stateExtensions = false }`

- `figure.length === onsets.length === accents.length` or throw. The accent check is **length-only** — a uniform profile (all 1s) passes despite the "uniform velocity is a bug" error text. 5 corpus entries are in fact uniform.
- `bars = floor(figEntry.bars ?? 1)`; onsets are **bar units** in `[0, bars)`, exact fractions via `toFrac` (strings `'3/16'`, arrays, or decimals snapped to dens 1..96; MAX_GRID = 192).
- `microtiming` (when length matches) shifts each onset **before** gridding, wraps modulo `bars` (a push past the last barline lands at the top), then re-sorts **keeping onset+accent+token paired** (lines 572-580 — deliberately not via `normalizeRhythm`, which would orphan the tokens).
- Per bar: `gridSize` = lcm of onset denominators, padded up to ≥4, capped at 192; onsets must be strictly increasing after the split or throw.
- `period = lcm(harmony.length * barsPerChord, bars)`, capped at MAX_PERIOD = 96 cycles.

### 1.3 Octave handling / root placement (lines 609-632)

The root does **not** sit in an octave box. `baseC = C<octave>`; each cycle's candidate root is the chord root pc placed at-or-above baseC, but the binder also tries ±12 and takes the candidate **nearest the previous cycle's root (tie → higher)**, seeding `prevRoot = baseC + 5`. So a descending progression walks down like a left hand (D3 C3 B2 Bb2) instead of snapping into one octave. Every member midi = `rootRef + memberSemis + 12 * (count of '+')`.

### 1.4 D56 extensions (opt-in, lines 490-540, 636-639)

`opts.stateExtensions` (only the judge page sets it) lets ONE onset per bar restate the chord's extension (7th/6th/9th from `chordCoreTones`, never the wider `chordTones` supply): only single-member tokens, only a member the bar plays more than once, the LAST such occurrence, never the only `3`. Count lands in `boundMeta.extendedChords`. Default off — existing bindings byte-identical.

### 1.5 Other bindFigure behaviors

- Accents map linearly to gain: `gain = gainRange[0] + accent * (gainRange[1] - gainRange[0])`, default [0.35, 1.0], emitted as a `.gain("...")` grid (gain grid always legato+fillLeading). `ACCENT_THRESHOLD = 0.7` sets only the `accented` flag in `boundMeta.notes` — **no snapping happens** (tokens are already chord-relative).
- `legato` comes from `figEntry.legato ?? false` — **opts cannot override it**. legato:true emits `value@gap` (hold to next onset); false emits the value on one grid step plus `~@rest`.
- **No swing**: bindFigure never calls `swingSuffix` (bind/bindComp/bindMelody do). A figuration entry's feel lives entirely in microtiming.
- Unknown chord symbol → warning, `rel` empty → every member takes the FALLBACK interval (also warned).
- `boundMeta`: `{ motif:null, rhythm, figure, onsets (post-microtiming), accents, bars, gains, period, notes[{cycle, step, t, note, midi, accented, voice:'main', token}], extendedChords }`. No `voices` field (figures have no bounce concept).

---

## 2. Per-file inventory

| file | entries | ratified | provenance | notes |
|---|---|---|---|---|
| figurations-undertale.js | **95** (+23 DEVELOPMENT_UNDERTALE moves, +DEVELOPMENT_STATS) | 0 | transcribed ×95 | generated by import-undertale.mjs; all style toby-fox, all `bars:1` |
| figurations-videos.js | **2** | 0 | video-transcribed ×2 | hand-written flourishes (D57); role 'flourish', extra `placement`/`function` fields; no fit/microtiming |
| rhythms-undertale.js | **46** | 0 | transcribed ×46 | onset/accent skeletons of the figurations (`figures` lists donors); role bass 6 / chords 40; band all 'mid'; no character lines |
| rhythms-unison.js | **12** | 0 | transcribed ×12 | percussion only; **9/12 have `accents: null`** (triage 'quantized-flat', needsAccents) → unbindable until an accent profile is authored (normalizeRhythm throws) |
| rhythms.js | **24** | 0 | hand-written 23, ethan-requested 1 | the only file where every entry carries a `character` line; 1 euclid entry (tresillo), 1 swing (swung_lofi_hats 0.55), 1 microtiming (lazy_dilla), 2 with voices, 4 multi-bar (bars:2) |
| contours.js | **12** | — | hand-written | degrees + shape/span/character; `findContours({shape,minSpan,maxSpan})` retrieval |
| melodies-tier2.js | **22** | 0 | authored-tier2 (claude) ×22 | hand-written specs for bindMelodySpec; all needsEar:true; octave 4 ×21, 3 ×1; 2–8 bars each |
| loops.js | n/a | — | — | **not a pattern library**: D56 loop-wrap machinery for HARMONY cycles (trimLoopWrap, loopIssues, wrapReplacements, resolveLoopWrap) |

needsEar in figurations-undertale: true 42 / false 53 (rule: `nonChordRatio > 0.2 || !accents`, set at import).

---

## 3. Distributions (figurations + rhythms)

### 3.1 FIGURATIONS_UNDERTALE class distribution (importer's `classify()`, import-undertale.mjs:158)

| class | n | classifier rule (as implemented) |
|---|---|---|
| block | 32 | chordness ≥ 0.6 (fraction of tokens containing '.') |
| oompah | 20 | low single tokens alternating with '.'-chords or '+' tokens |
| bass | 17 | single-note tokens, meanMidi < 48 |
| ostinato | 12 | all tokens `R+*` |
| arp | 9 | single-note, ≥2 direction changes |
| arp_down | 3 / arp_up 1 | monotone runs (≥3 notes) |
| figure | 1 | the residual class |

Videos add: run 1, walkup 1.

### 3.2 meter_class

- FIGURATIONS_UNDERTALE: **4/4 ×81, 3/4 ×6, 2/2 ×5, 6/8 ×3**
- class × meter off-4/4: arp 3/4 ×1; block 6/8 ×1, 3/4 ×3; oompah 3/4 ×1; ostinato 6/8 ×2, 3/4 ×1, 2/2 ×1; bass 2/2 ×4. Everything else is 4/4-only.
- RHYTHMS_UNDERTALE: 4/4 ×38, 3/4 ×3, 2/2 ×3, 6/8 ×2. RHYTHMS_UNISON: 4/4 ×12. RHYTHMS: 4/4 ×18, 7/8 ×4 (aksak), 3/4 ×1, any ×1.

### 3.3 grid values in use

- Figurations: **16 ×70**, 8 ×16, 6 ×4 (all the 3/4+6/8 triple grids), 12 ×4, 24 ×1. Videos: 16 ×2. Unison: 16 ×11, 24 ×1.
- Binder-side: grid is derived per bar (lcm of onset denominators, min 4, max 192); the entry `grid` field is importer metadata, not consumed by bindFigure.

### 3.4 Other figuration facts

- octave: 1 ×39, 2 ×35, 3 ×18, 4 ×3 (importer: `floor(rootRef/12)-1` clamped [1,4]).
- legato: true 43 / false 52. microtiming: 90/95 entries. fit: 95/95.
- 110 distinct figure tokens in use; heaviest use of `~n` literals: ~1 ~2 ~4 ~5 ~6 ~8 ~9 ~10 ~11, incl. clusters like `~4+.~1++.~4++.~8+++`.
- uniform-accent entries (all values equal): 5 — they pass bindFigure's length-only check.

---

## 4. How accents / microtiming / legato / octave flow through binding

- **accents** → linear gain map (`DEFAULT_GAIN_RANGE [0.35, 1.0]`) → `.gain("<grid>")` in every bind path; `ACCENT_THRESHOLD 0.7` additionally drives chord-tone **snapping** in bind()/bindMelody()/bindMelodySpec() (D14/D26: explicitly altered degrees exempt) but in bindFigure is metadata only. normalizeRhythm and bindFigure both enforce presence+length of a real accent profile, neither enforces non-uniformity.
- **microtiming** → exact fraction shifts applied BEFORE gridding, wrapped into [0,bars), re-sorted with pairing intact (bindFigure keeps tokens attached; normalizeRhythm keeps accents+voices attached). After binding it is indistinguishable from structure — it becomes finer grid positions, not a `.nudge`.
- **legato** → bindFigure: `figEntry.legato ?? false`, not overridable via opts; token emission `value@gap` vs hit+rests (`tokens()`, line 1332). bind(): `opts.legato`, default true when melodic. bindMelody/bindMelodySpec additionally emit `.clip("<grid>")` articulation ratios (D39, `articRatios`) — figurations get no clip.
- **octave** → bindFigure: `opts.octave ?? figEntry.octave ?? 3` sets baseC; per-cycle root voice-led to previous root (±12 candidates, tie → higher); `+` per token adds 12. bind(): `octave` places the key root for degree math; bounce onsets sound the chord root an octave below. bindComp(): `octave=3` is the bounce register.
- **swing** → `swingSuffix` appends `.swingBy(swing, subdiv)` with a static guard against Strudel silently deleting pushed-past-window onsets, and a warning when swing affects zero onsets. Wired in bind/bindComp/bindMelody; **absent from bindFigure**.

---

## 5. Fit metrics: what exists and where computed

- **Computed**: `src/ingest/piano.js` `barFigures()` (lines 491-541) per source bar: `nonChord` (count of non-chord-tone tokens), `count`, `meanMidi` (mean of the bar's note midis), `chordness` (fraction of tokens containing '.'), `rootRef`, `sig` (grid|steps|tokens portable signature).
- **Aggregated**: `scripts/import-undertale.mjs` `makeCandidate()` (lines ~199-212): means across occurrences; `nonChordRatio = Σ nonChord / Σ count`; written to each entry as `fit: { nonChord, chordness, meanMidi }` (line 533).
- **Consumed**: `classify()` (chordness/meanMidi decide class); `needsEar = nonChordRatio > 0.2 || !accents`; `role = bass | chords (chordness ≥ 0.5) | accompaniment`; relative-move classification (blockify/arpeggiate at |Δchordness| ≥ 0.34, octave_lift/drop at |ΔmeanMidi| ≥ 7, densify/sparsify at density ratio 1.5). Audition pages show `fit` in card tooltips. `scripts/build-atlas.mjs` recomputes chordness from figure tokens for the atlas speed facet. **The binder never reads fit.**
- Observed ranges: nonChord 0–0.67, chordness 0–1, meanMidi 31–73.

---

## 6. Variation machinery: harmony has it, figurations do not (CONFIRMED)

- `src/lib/harmony-vary.js` — `varyProgression(exemplar, {budget, intensity, allow, seed})` for **HARMONY only**: exemplar pool (ear-ratified entries first, unison-famous as fallback), typed operators from harmony-ops.js each declaring what it preserves, D49 counted prior as verifier (variation may not score below its exemplar; cadence gets a tighter slack). Plus `variationsOf`, `explainVariation`, `exemplarPool`. `resolveLoopWrap` (loops.js) yields a ranked wrap-replacement palette — again harmony.
- **Nothing comparable exists for figurations.** Grep across src+scripts for figuration variation operators: none. What exists instead, none of it runtime transformation:
  1. `DEVELOPMENT_UNDERTALE` (23 moves) + `DEVELOPMENT_STATS` in figurations-undertale.js — *observed* corpus development moves with counts: repitch_same_rhythm 59, blockify 23, arpeggiate 7, pattern_swap 7, sparsify 6, octave_drop 4, densify 4, octave_lift 2. Consumed only by tests/audition display — **no operator implementation applies any of them**.
  2. D56 `stateExtensions` in bindFigure — a single-onset extension restatement, opt-in, conservative; not a variation system.
  3. bind()'s `transform` opt (`applyTransform`, theory.js) — operates on **contour degrees**, not figures.
  4. bindMelody's repeat policy (vary/exact/rest) — melody-cell tail variation, not figurations.
- So the corpus already names the operator vocabulary (the development stats are literally a ranked op list with an in-corpus prior), but the varyProgression-analogue for figurations is **unbuilt**. CANDIDATE: that vocabulary (repitch is free under bindFigure since figures re-voice per chord; blockify/arpeggiate/densify/sparsify/octave shift are all mechanical on the token+onset schema) is the obvious spec for a `varyFiguration`, with the same exemplar-inherits-quality discipline.

---

## 7. Gap observations (all CANDIDATE reads of the data, not quality claims)

1. **Zero ratified entries anywhere.** Every library surveyed is 100% candidate pool. The only entries with character lines at all are the 24 hand-written RHYTHMS.
2. **Meter thinness**: figurations are 85% 4/4. 6/8 has NO arp/oompah/bass (only 1 block + 2 ostinato); 3/4 has exactly 1 oompah (the waltz habitat is nearly empty) and 1 arp; 2/2 is bass+ostinato only. No figurations at all in 2/4, 5/4, 7/8, 12/8 — 7/8 exists only as 4 hand-written aksak percussion rhythms.
3. **Class thinness**: arp_up 1, arp_down 3, figure 1; run/walkup exist only as the 2 unratified video flourishes. Directional arps and connective figures are the thinnest melodic-adjacent classes.
4. **All 95 figurations are `bars: 1`** although bindFigure fully supports multi-bar entries — no two-bar left-hand patterns exist despite the machinery being ready.
5. **Style monoculture**: figurations are 95/95 toby-fox; the video pack contributes 1 jazz-ballad + 1 neo-soul.
6. **Register**: octave-4 figurations are rare (3); high-register accompaniment barely exists. Also the grammar cannot say "below the root" (no `-` token; extraction clamps below-root notes), so wide left-hand voicings that dip under the root are unrepresentable.
7. **9/12 Unison rhythms are unbindable** (null accents) until profiles are authored+auditioned — dormant inventory.
8. **bindFigure has no swing path** — any swung figuration feel must be baked into microtiming, unlike every other bind path.
9. **rhythms-undertale band field is uninformative** (all 'mid'), so band-based retrieval can't discriminate within the pack.
10. 5 figuration entries carry uniform accents, which the §3.4 "uniform velocity is a bug" rule condemns but no validator catches (both accent checks are length-only).
