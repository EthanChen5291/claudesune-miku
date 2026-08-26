# figuration-vary — variation operators over accompaniment figurations (DESIGN, all CANDIDATE)

**Status.** Everything below is a CANDIDATE design. No operator, cost, bound, or "safe default"
here is a claim about what sounds good — the owner's ear is the only quality signal (A6.1).
The design's one hard commitment is *structural*: it follows the D50 harmony-vary idiom
exactly (typed closed operator set + declared audibility costs + exemplar-relative
verification gate + budget/intensity/seed API + honest lineage/provenance), because that
idiom is already ratified as engineering practice in this repo (harmony-vary.js, harmony-ops.js,
D50/D53/D59) and the owner's brief — "use existing patterns as foundations, then vary;
swap positions and change intervals or such" — is the same brief that produced D50.

Sources read: `scratchpad/patterns-census.md` (the grammar as implemented, fit metrics,
§6 "harmony has variation machinery, figurations do not"), `scratchpad/accomp-research.md`
(the `fnd_` canon pack + §2 variation-device rankings), `src/lib/harmony-vary.js`,
`src/lib/harmony-ops.js`, `test/harmony-vary.test.js`, `src/lib/figurations-undertale.js`,
`scripts/audition-undertale.mjs`, `src/binder/bind.js` (bindFigure, FIGURE_TOKEN, memberSemis).

---

## 0. What is being varied — the exact substrate

A figuration entry (census §1.2):

```
{ onsets: ['0/1','1/8',...],     // bar fractions, strictly increasing per bar
  figure: ['R','3+.5+','~10+',...], // chord-relative tokens, FIGURE_TOKEN grammar
  accents: [1, 0.7, ...],        // same length; linear gain map
  microtiming?: [...], legato?, octave?, bars?, meter_class, grid, fit, ... }
```

Token grammar (bind.js:450): `member := R | 3|4|5|6|7|9 | ~<n>`, `+` per octave up,
`a.b` struck together. No octave-down marker, no rests inside `figure[]`.

So the *editable dimensions* are exactly: (a) which token sits at which onset
(**positions** — the owner's "swap positions"), (b) which member a token names and how
many `+` it carries (**intervals** — the owner's "change intervals"), (c) how many onsets
exist and where (**density**), (d) the accent profile, (e) `legato`, (f) the entry `octave`.
Everything else (meter_class, bars, role, microtiming pairing) is carried through unchanged.

**Operator interface.** Harmony ops return `{slot, to, note}` because every edit is a slot
replacement. Figuration edits change array lengths (insert/merge), so the uniform interface
is the one ROTATE already uses — each site carries the fully-applied result:

```js
// figuration-ops.js
FIG_OPS[name] = {
  blurb, preserves, cost,           // same fields as harmony OPS
  gateSlack?: { meanMidi?: n },     // D59 precedent: an op may declare extra slack
                                    // on ONE gate term when its own rule is the guard
  sites(entry, ctx) -> [{ where, next, note }]
  // `next` = a complete varied figEntry: onsets/figure/accents/microtiming re-paired,
  // lengths equal, onsets sorted. The gate scores `next`; nothing is applied twice.
}
```

`ctx` = `{ probes }` — the two probe harmony contexts (§2) so ops that need real pitches
(octave span guards) can bind cheaply.

---

## 1. The operator set (CANDIDATE names, costs, edits)

Costs are a declared **audibility ladder** in the same 0..1 units as harmony-ops — how much
the move changes what a listener hears, not how clever it is. Anchors: harmony's
`recolour .15 … tritone_sub 1.0`. Ranking rationale comes from accomp-research §2
(very-common devices priced low, rare/high-salience devices priced high — commonality
rankings are historical observation, whether the ear accepts them is open).

| op | cost | edits | owner's phrase / research device |
|---|---|---|---|
| `accent_reshape` | .10 | accents only | research #8 accent remapping |
| `articulation_flip` | .15 | `legato` only | research #5 articulation flip |
| `colour_sub` | .25 | one member: 5↔6, 3↔4, 7↔9 | "change intervals"; research #6/#11-adjacent |
| `octave_token` | .30 | one token ±`+` | "change intervals"; D32 octave displacement |
| `neighbor_insert` | .35 | one repeated token → `~n` | research #7 neighbor/passing decoration |
| `rotate_figure` | .40 | token array rotated k vs fixed onsets | "swap positions"; harmony ROTATE analogue |
| `swap_tokens` | .40 | tokens at i,j exchanged | "swap positions" |
| `bass_sub` | .45 | onset-0 token R→3 / R→5 (and back) | research #11 bass-note substitution |
| `split_onset` | .55 | one onset → two (density up) | research #2 density change |
| `merge_onsets` | .55 | adjacent pair → one (density down) | research #2 / #3 thinning |
| `register_shift` | .60 | entry `octave` ±1 | research #1 register shift; corpus octave_lift/drop |
| `retrograde` | .80 | token array reversed over same onsets | research #12 contour inversion family — "heard as a new figure", spend deliberately |

Details, each with its `preserves` declaration:

### accent_reshape (.10) — preserves: every note, every onset, the meter
Sites are **named profiles**, not perturbations (a jiggled accent array is the "change a
chord a bit" trap D50 names): `downbeat` (peak on 1), `backbeat`, `tresillo` (peaks at 0,
3/8, 3/4 — only for 4/4 grid-8/16 figures), `swell` (monotone rise to last onset),
`afterbeat` (offbeats over onbeats — the "pah swelling over the oom"). Profile values are
scaled into `[0.6, 1.0]`; a site is offered only when the result differs from the current
accents and is non-uniform. This op is also the only *repair* for the 5 corpus entries with
uniform accents (census §7.10).

### articulation_flip (.15) — preserves: every sounded pitch and onset
Toggles `legato`. One site, offered only when the figure has ≥ 2 onsets (flipping a 1-onset
drone to detached guts it). Note: bindFigure's legato is entry-owned, not opts-overridable
(census §1.5), so the flip must live in the entry — which is exactly what a variant is.

### colour_sub (.25) — preserves: the rhythm, the register, every other token
At ONE position, substitute one member inside the token (simultaneities `a.b` edited
member-wise): the owner's literal "change intervals 5->6, 3->4". Directed pairs:
`5→6, 6→5, 3→4, 4→3, 7→9, 9→7`. Guards local to the op:
- never create a duplicate member inside one `.` simultaneity (`5.6` + 5→6 = `6.6` — no site);
- never touch the token at onset 0 when it is R-family (that is `bass_sub`'s job);
- never remove the figure's **last** `3` (the chord's third is what makes the figuration
  state the quality; a 3→4 that leaves no 3 anywhere turns the accompaniment quality-blind —
  legal in the grammar, but it is a different *device* (sus-wash), not a variation).
`+` marks on the edited member are kept (`5+` → `6+`). memberSemis is quality-blind by
design, so every substitution binds against any chord.

### octave_token (.30) — preserves: pitch classes, rhythm, all other registers
Append one `+` (member has < 4) or strip one (member has ≥ 1) on ONE member of ONE token —
the owner's "change intervals … or such", and the same shape as D32's ruling: a closed
displacement operator over the existing representation, not an enumerated library of
displaced results. Op-local guard (the mean-drift gate is too blunt for a single spike):
under both probes, the variant's total midi span (max − min) may exceed the parent's by at
most 12, and the displaced note must stay within 24 semitones of both its temporal
neighbours. No octave-down below the reference exists in the grammar (census §1.1), so
"down" is only ever removing an existing `+`.

### neighbor_insert (.35) — preserves: rhythm, accents, every other pitch
The `~n` device. Site: an onset `i` whose token (single-member) **repeats** the token at
`i+1` — replace occurrence `i` with a neighbour of the *following* note: lower chromatic
`~(s−1)` or upper `~(s+2)`, where `s` = the next token's semis via the FALLBACK map
`{R:0, 3:4, 4:5, 5:7, 6:9, 7:10, 9:2}` + 12·plus (approximate is fine — `~n` is literal by
definition). Editing only a *repetition* means the figure's original pitch content is still
all present once; the move adds motion, not new harmony. Dosage is controlled by the
nonChord gate (§2), which admits ~one insertion per variation on a typical 8-onset figure.

### rotate_figure (.40) — preserves: the onset skeleton, the accent profile, the token multiset
The owner's "swap positions", whole-figure form: rotate `figure[]` by k against FIXED
onsets/accents/microtiming — the same pitches land on different beats; the rhythm and feel
stay put. Direct analogue of harmony ROTATE (which D49 established as real, free variation).
Sites: k = 1..len−1, skipping k where the rotated array equals the original (all-`R` figures
like `fnd_drive_8th_root` offer none). Rotating tokens rather than onsets is deliberate:
rotating onsets would move the downbeat (metric displacement — research #9 calls that rare
in half the traditions; not in v1).

### swap_tokens (.40) — preserves: the onset skeleton, the token multiset minus order at two slots
Exchange tokens at positions i, j (tokens must differ). Position 0 is excluded whenever its
token is R-family — the downbeat bass root is the identity of oompah/waltz/stride figures
and `bass_sub` is the only op allowed to move it. Site enumeration: all unordered pairs
(≤ 16 onsets ⇒ ≤ 120 sites; the two-stage pick already neutralises site-count popularity).

### bass_sub (.45) — preserves: the rhythm, everything after the bass note
Only the token at onset 0, only when single-member: `R→3`, `R→5`, `3→R`, `5→R` (`+` marks
kept). The first-inversion / alternating-bass restatement (research #11: "common, and cheap
in this grammar — swap the first token"). Priced well above colour_sub because the bass is
the most audible voice in an accompaniment.

### split_onset (.55) — preserves: every existing pitch and its accent, the downbeat
Density up: onset `i` with gap `d` to the next onset becomes two onsets at `t` and `t+d/2`,
second one repeating the same token at accent `0.75 × a_i` (microtiming: first keeps the
parent's, second gets '0'). Legality local to the op: the resulting onset's denominator must
keep the bar's lcm ≤ 96 (bindFigure grids at lcm of denominators, MAX_GRID 192 — staying at
half the cap leaves microtiming headroom), and the new inter-onset gap must be ≥ 1/24 bar
(the corpus's finest grid is 24; census §3.3).

### merge_onsets (.55) — preserves: the stronger note of the pair, the downbeat
Density down: delete the weaker-accented onset of an adjacent pair whose gap is < 1/4 bar
(merging across a beat boundary is phrase surgery, not thinning). Never deletes onset 0
(downbeat parity is a gate invariant, §2). Never offered when the figure has ≤ 2 onsets.

### register_shift (.60) — preserves: everything except the octave
Entry `octave` ± 1, clamped to [1, 4] (the importer's own clamp). This is corpus move
octave_lift/octave_drop (DEVELOPMENT_STATS: 6 observed occurrences) and research device #1.
Declares `gateSlack: { meanMidi: 12 }` — its entire point is to exceed the 7-semitone drift
bound, and per the D59 precedent the op's own rule (exactly ±12, whole figure, clamp [1,4])
is the real guard, so it buys slack on that one term only; every other gate still applies.
Absolute pitch rails (§2 G6) still bind it: a shift that pushes notes out of range offers
no site.

### retrograde (.80) — preserves: the token multiset, the onset skeleton, the accents
Reverse `figure[]` over the SAME onsets/accents (pitch retrograde, not rhythmic — reversing
onsets would demolish the meter). One site, iff the reversed array differs. Priced at the
top of the ladder because research §2 ranks contour reversal "rare — listeners hear it as a
new figure, not a variation"; at default intensities it should almost never fire, which is
the correct behaviour for a high-salience device (same logic that put tritone_sub at 1.0).

### Deliberately OUT of v1 (and why)
- **blockify / arpeggiate / densify-to-new-class** — the corpus's own top development moves
  (DEVELOPMENT_STATS: blockify 23, arpeggiate 7), but they *cross the class boundary by
  definition*: the importer classifies |Δchordness| ≥ 0.34 as blockify/arpeggiate and
  density ratio ≥ 1.5 as densify/sparsify. The §2 gate is built precisely to keep a variant
  *inside* its parent's class, so these are a different species — "development moves"
  (A-section → B-section), to be designed as a separate layer with its own audition arm.
  Encoding them as gate exceptions would hollow out the gate on day one.
- **onset displacement / anticipation** (research #9) — moves the downbeat; violates
  downbeat parity; genre-conditional. Phase 2 at the earliest.
- **repitch_same_rhythm** (corpus's #1 move, 59×) — under bindFigure this is FREE: figures
  are chord-relative, so binding the same figure to different harmony *is* repitching.
  No operator needed; worth saying in the module docstring so nobody adds one.

---

## 2. Gates — bounding fit drift so a variant stays playable (CANDIDATE numbers)

Harmony-vary's gate is exemplar-relative ("a variation may not be less idiomatic than the
progression it came from") with slacks justified by the counted prior. Figurations have no
counted prior — but they have `fit: { nonChord, chordness, meanMidi }` (census §5), and
crucially the importer's **relative-move classifier already defines the boundary between
"the same figure varied" and "a different figure"**: |Δchordness| ≥ 0.34 ⇒ blockify/
arpeggiate, |ΔmeanMidi| ≥ 7 ⇒ octave_lift/drop, density ratio ≥ 1.5 ⇒ densify/sparsify
(import-undertale.mjs, census §5). Those thresholds were fitted to what the corpus itself
does between statements — so the gate bounds drift **strictly inside them**, and the
numbers are inherited from the corpus rather than invented. That is the same non-arbitrary-
threshold discipline as D50's "the bar is set by the exemplar itself".

Fit is **recomputed** for every candidate (never copied from the parent — the parent's fit
is a transcription statistic, the variant's is a computed property): nonChord = fraction of
members that are `~n`; chordness = fraction of tokens containing `.`; meanMidi = mean midi
of `boundMeta.notes` when bound against the two probes. Probes: one major and one minor
4-chord loop at the entry's own octave/meter (reuse the audition page's CONTEXTS axes,
e.g. C-major axis + A-minor axis) — two probes because memberSemis resolves differently per
chord quality and a variant must be playable on both sides.

**G1 — structural (hard, no slack).** Lengths equal across onsets/figure/accents
(/microtiming); onsets strictly increasing in [0, bars); every token matches FIGURE_TOKEN;
per-bar lcm of onset denominators ≤ 96; `bindFigure(next, probe)` throws on neither probe
and emits **no warning the parent didn't emit** (the fallback-interval warning on an exotic
chord is the parent's property, not the variant's fault).

**G2 — root anchor.** If the parent contains any R-family token, the variant keeps ≥ 1.
An accompaniment that loses its root is a different job description.

**G3 — downbeat parity.** The variant sounds an onset at 0 iff the parent does. Losing the
downbeat turns a pulse into an offbeat skank (a class change); gaining one turns an offbeat
figure into a pulse.

**G4 — nonChord: `variant ≤ parent + 0.15`, and absolute ceiling 0.5.**
Why 0.15: one neighbor insertion on the modal 8-member figure moves nonChord by 1/8 = 0.125
— the slack admits exactly one `~n` step per variation with a little headroom, and blocks
compounding into chromatic soup across a budget-3 run. Why the 0.5 ceiling: the importer
flags nonChordRatio > 0.2 as needsEar and the corpus maxes at 0.67; 0.5 keeps every variant
below the corpus's own heaviest usage. No lower bound — *removing* colour is always safe.

**G5 — chordness: `|Δ| ≤ 0.30`.** Strictly inside the importer's 0.34 class boundary
(blockify/arpeggiate). No v1 operator moves chordness at all except merge/split in edge
cases, so this gate is cheap insurance that operator composition can't drift a broken-chord
figure into a block figure by accident.

**G6 — meanMidi: `|Δ| ≤ 7` + op gateSlack (register_shift: +12); absolute rails.**
7 is the importer's own octave_lift/drop boundary — below it the corpus calls two bars "the
same pattern", at or above it "a register move". Absolute rails, both probes: every bound
note midi in **[24, 88]** (corpus meanMidi spans 31–73 with individual notes below/above;
24 = C1, the importer's lowest octave clamp; 88 = E6, above the highest observed
accompaniment mean +12 — accompaniment above that is fighting the melody register); and
total span may not grow by more than 12 over the parent's (single-token spike guard,
duplicated in octave_token's own legality so most violations never reach the gate).

**G7 — density: `2/3 ≤ variant.onsetCount / parent.onsetCount ≤ 1.5`** (inclusive — one
merge on a 3-onset figure is exactly 2/3). 1.5 is again the importer's densify/sparsify
class boundary. One split or merge per step moves an 8-onset figure by 1.125×; a budget of
3 can not double the density.

**G8 — accents: values in [0.35, 1.0]; spread(variant) ≥ min(spread(parent), 0.05).**
0.35 floor = the default gainRange minimum (below it the note is barely a note). The spread
rule is exemplar-relative on purpose: a variant may not be MORE uniform than its parent
(uniform velocity is the documented bug, census §3.4/§7.10), but the 5 uniform-parent
corpus entries don't make their variants ungateable — and accent_reshape is allowed to fix
them.

**G9 — anti-undo.** Portable signature `grid|onsets|figure|accents(2dp)|legato|octave`
(the census §5 `sig` idea) collected in a `seenFigs` set; a candidate whose signature was
already visited is rejected with the same "returns to a figure this variation already
passed through" message shape harmony-vary uses.

Rejections are collected into `lineage.rejected` (first 8), exactly as harmony-vary does.

---

## 3. API — `varyFiguration` mirroring `varyProgression`

New files: `src/lib/figuration-ops.js` (FIG_OPS, FIG_OP_NAMES, the fit recomputers),
`src/lib/figuration-vary.js` (the varier + pool). Constants carried over verbatim from
harmony-vary unless measurement says otherwise: `TOPK 5`, `OP_TEMP 0.35`,
`REPEAT_DISCOUNT 0.35`, `RETOUCH_DISCOUNT 0.2` (retouch keyed on the onset index an op
edited; whole-figure ops — rotate_figure, retrograde, register_shift, articulation_flip —
clear the touched set the way harmony's rotate does, since positions renumber or the whole
surface changed).

```js
export function varyFiguration(fig, {
  budget = 2,          // integer >= 1, ops to apply
  intensity = 0.35,    // 0..1 in audibility units; low reaches for accent/colour,
                       // high for density/register/retrograde
  allow = null,        // restrict to these operator names
  seed = 'vary',       // same request -> same variation (mulberry32(fnv(...)))
} = {}) -> figEntry-with-lineage
```

- `fig` is a library entry or its name; names resolve through an `ALL_FIGURATIONS`
  aggregate (FIGURATIONS_UNDERTALE + the video pack + the `fnd_` pack once landed) —
  unknown name throws `unknown exemplar`, budget < 1 throws, matching harmony-vary's
  loud failures.
- Seed string: `` fnv(`${srcName}|${budget}|${intensity}|${seed}`) `` — identical recipe.
- Per-step flow is a transliteration of varyProgression's loop: enumerate
  `FIG_OPS[name].sites(current, ctx)` for allowed names → gate each candidate's `next`
  (§2, always against the PARENT's fit, not the previous step's — drift bounds must not
  ratchet) → two-stage pick (operator first by `exp(-|cost - intensity| / OP_TEMP)` with
  repeat discount, then site by rank; site rank = how little fit drifted, i.e.
  `-(|ΔnonChord|/0.15 + |Δchordness|/0.30 + |ΔmeanMidi|/7)` normalised, plus the retouch
  log-discount) → apply, record lineage, add signature to seenFigs.
- Returns an ordinary figuration entry (so bindFigure, the audition pages, and the atlas
  all work on it unchanged) plus `request` and `lineage` (§4).

Companions, mirroring harmony-vary exports one-for-one:

```js
export function figurationPool({ klass = null, meter = null, minCount = 20 } = {})
  // -> { entries, basis, caveat }
```
Priority: (1) ear-ratified figurations (none exist yet — the pool must SAY so);
(2) fallback while nothing is ratified: `needsEar: false` transcribed entries (53 of 95 —
clean-transcription evidence, the figuration analogue of the coverage floor: a correct
reading of its source before it can be a good figure) **plus** the `fnd_` canon pack
(provenance `'canon'` — centuries of pedagogical attestation standing in the same
structural role unison-famous plays for harmony: evidence about the SOURCE, not a taste
claim of mine). Caveat text mandatory whenever ratified < minCount, ratified-first ordering
when supplemented — copy the three-state honesty contract the D50 pool test defends.

```js
export function variationsOfFiguration(fig, { count = 3, ...opts } = {})  // dedupe by signature, 6x oversampling
export function explainFigVariation(entry)                                // lineage -> readable lines
```

---

## 4. Provenance — a variant is never its parent

Returned entry fields (the exact analogue of varyProgression's return):

```js
{
  role: src.role, pack: 'varied', style: src.style ?? 'universal', class: src.class,
  provenance: 'varied',
  source: `${srcName} + ${ops.join(' + ') || 'nothing'}`,
  ratified: false,          // NEVER inherited. The parent's verdict judged the parent.
  needsEar: true,
  character: null,          // written only when an ear ratifies (A6.1)
  seen: 0, songs: [],       // a variant was seen nowhere; corpus stats do not transfer
  bars, grid, meter_class, onsets, figure, accents, microtiming?, legato, octave,  // varied
  fit: { nonChord, chordness, meanMidi },   // RECOMPUTED for the variant (probe-bound)
  request: { exemplar: srcName, budget, intensity, allow, seed },
  lineage: {
    exemplar: srcName, exemplarFigure: src.figure.join(' '), exemplarSong: src.songs?.[0] ?? null,
    ops: [{ op, where, note, preserves, fit: {nonChord, chordness, meanMidi} }],  // per step
    changed,                                    // false when every candidate was gated
    fit: { exemplar: src.fit, result: newFit },  // the before/after comparison
    rejected: [...].slice(0, 8),
  },
}
```

Rules (all enforced by tests, §7): `ratified` is hard-coded `false`; `needsEar` hard-coded
`true`; `character` hard-coded `null`; a variant of a variant chains lineage (exemplar =
the immediate parent; the grand-parent is reachable through the parent's own lineage) but
in v1 `figurationPool` never offers `provenance:'varied'` entries as exemplars — quality is
inherited from evidence, and an unheard variant has none to pass on. If a variant is later
ratified by ear it enters the pool like any other ratified entry; ratification through the
verdict-import flow, never at generation.

---

## 5. Where variants surface for the ear

Extend the existing judge page (audition/undertale.html via scripts/audition-undertale.mjs)
rather than a new page — the owner already lives there and the verdict export → 
`import-verdicts.mjs` → D-entry loop (memory: judge-export-import-flow) already works.

- New card kind **`figvary`** in the figures arm (own section id + filter option, like the
  atlas sections): each card = one parent + its `variationsOfFiguration(parent, {count: 2})`,
  bound over the SAME progression contexts, laid out parent-first — "hear the foundation,
  then hear what it becomes" is literally the documented purpose of `variationsOf`.
- First wave of parents: the `fnd_` pack (once landed, §6) + the `needsEar:false`
  transcribed figures, capped (~20 parents × 2 variants ≈ 40 variant cards) so a judge pass
  stays a sitting, not a slog.
- Lineage in the tooltip via `explainFigVariation` (the page already shows harmony
  `explainVariation` output in the form tooltip — same affordance).
- **Deterministic names** so verdicts survive regeneration: `fv_<parent>__b<budget>i<intensity*100>_<seed>`
  (the request IS the identity; the D53 self-heal test pattern needs a stable `judged`
  snapshot — store `judged: figure.join(' ')` alongside, mirroring how harmony verdicts
  record degrees and void themselves when the music changes).
- Intensity spread on the page: one gentle (0.2) and one bolder (0.55) variant per parent,
  so the first harvest also measures WHERE on the cost ladder the owner's tolerance sits —
  that harvest is the data the ladder's prices get corrected with.

---

## 6. Foundation-first sequencing (the owner's explicit ordering)

The owner asked for existing patterns as FOUNDATIONS first, then variation. Concretely:

1. **`fnd_` pack lands first**, unratified: `src/lib/figurations-foundation.js`, the 29
   candidates from accomp-research §1, `provenance: 'canon'`, `ratified: false`,
   `needsEar: true`, `character: null`, pack `'foundation'`. Registered in the audition
   figures arm like any figuration.
2. **Audition wave 1**: the fnd pack + remaining unheard undertale figures get an ear pass
   BEFORE any variant is shown. Rationale is D50's own doctrine: variation *inherits*
   quality — varying an unheard foundation manufactures candidates whose parent may itself
   be a kill, which doubles the judging load for nothing. (Engine work on
   figuration-ops/vary can proceed in parallel — tests don't need verdicts — but the
   *audition surface* for variants waits for wave 1's verdicts.)
3. **figurationPool prefers ratified wave-1 entries** the moment they exist; until then the
   caveat machinery (§3) tells every caller it is running on stand-in evidence.
4. **Audition wave 2**: `figvary` cards over the ratified (or, if the harvest is thin,
   needsEar:false + canon) parents.
5. Verdicts on variants feed back through the same import flow; a ratified variant becomes
   an ordinary library citizen (and a legitimate exemplar).

---

## 7. Tests — `test/figuration-vary.test.js`, in the harmony-vary.test.js style

Same architecture: a sweeping `everyVariation()` generator over the pool ×
intensities [0.15, 0.4, 0.75] × budgets [1, 2, 3] × seeds ['a','b'], plus targeted
per-operator contract tests. Candidate list:

1. **pool honesty** — `figurationPool()` declares basis; with 0 ratified figurations the
   caveat names it; entries ≥ 20; killed entries never appear; `klass`/`meter` filters hold.
2. **the gate holds everywhere** (the D50 "never less idiomatic" analogue) — for every
   variation: recomputed fit vs parent fit satisfies G4–G7 with the op-declared slack
   honoured the way the harmony test honours gateSlack (`register_shift` gets 12 on
   meanMidi); count > 300 variations exercised.
3. **variants bind and are honest** — bindFigure succeeds on both probes, no new warnings;
   `provenance:'varied'`, `ratified:false`, `needsEar:true`, `character:null`,
   `seen:0`; meter_class/bars/role match the parent.
4. **every operator preserves what it declares** — a rich synthetic figure that gives every
   op a site (like harmony's `'0:m 5:m 7:7 3'`); rotate_figure/swap_tokens/retrograde
   preserve the token multiset and the exact onset/accent arrays; colour_sub changes exactly
   one member and never the bass-R; octave_token changes one member's `+` count by exactly 1;
   neighbor_insert replaces only a repetition and adds exactly one `~`; bass_sub touches
   only position 0; split preserves all parent pitches; merge deletes exactly one; 
   register_shift changes only `octave`; articulation_flip only `legato`.
5. **root anchor & downbeat parity** (G2, G3) — swept over every variation.
6. **no self-undo** — seenFigs; budget-3 runs never end at the parent signature when
   `lineage.changed` is true.
7. **determinism + request carried** — same seed same output, different seed different,
   `request.exemplar`/`seed` present. 
8. **`allow` restricts** — ops outside the list never fire.
9. **intensity reaches for different operators** — gentle favours accent_reshape/colour_sub
   share, bold favours split/merge/register/retrograde share by ≥ 0.1 (the exact harmony
   test shape).
10. **no flat-pool dominance** — no op takes > 45% of applications across the sweep;
    ≥ 6 distinct ops fire (swap_tokens has O(n²) sites — this is the regression that
    proves the two-stage pick neutralised it).
11. **grid cap** — after any split, per-bar lcm of denominators ≤ 96 and bindFigure's
    derived grid ≤ 192.
12. **accent sanity** — no variation is more uniform than its parent (G8); accent_reshape
    output spread ≥ 0.05, values in bounds; a uniform-accent parent (one of the 5) can
    still be varied and its accent_reshape variant is non-uniform.
13. **degenerate figures fail soft** — a 1-onset drone (fnd_drone_fifth shape): most ops
    offer no sites, `varyFiguration` returns `changed:false` with a populated `rejected`
    rather than throwing; `variationsOfFiguration` returns fewer than count without looping
    forever.
14. **bad requests fail loudly** — unknown exemplar throws, budget 0 throws.
15. **variationsOfFiguration dedupes** — distinct signatures, all `changed`.
16. **retrograde is rare at default intensity** — across the sweep at intensity ≤ 0.4,
    retrograde's share < 5% (the price is the placement rule; this test is its regression).

---

## 8. Numbered implementation steps

1. **Land the foundation pack**: write `src/lib/figurations-foundation.js` from
   accomp-research §1 (29 entries, pack `'foundation'`, provenance `'canon'`, ratified
   false, needsEar true, character null); register it in the audition figures arm and in an
   `ALL_FIGURATIONS` aggregate (new, in a small `src/lib/figurations.js` or wherever the
   aggregate naturally lives); smoke-test every entry binds on both probe contexts.
2. **Extract shared fit recomputation**: a `figFit(entry, probes)` helper (nonChord/
   chordness from tokens, meanMidi via bindFigure boundMeta over the two probes) in
   `figuration-ops.js`, unit-tested against the corpus entries' stored fit (approximate
   agreement, since stored fit is a transcription statistic — assert correlation, not
   equality).
3. **Write `src/lib/figuration-ops.js`**: FIG_OPS (12 ops, §1) + FIG_OP_NAMES, each op
   `sites(entry, ctx) -> [{where, next, note}]` with its local guards; the §2 gate as
   `gateFig(candidate, parent, probes) -> {ok, why}` so ops and varier share it.
4. **Write `src/lib/figuration-vary.js`**: `varyFiguration`, `figurationPool`,
   `variationsOfFiguration`, `explainFigVariation` (§3, §4) — transliterate
   varyProgression's loop, constants, and two-stage pick.
5. **Write `test/figuration-vary.test.js`** (§7, 16 tests) and run the full suite
   (`npm test`) — existing binder/audition tests must stay green (nothing existing is
   touched except the aggregate registration).
6. **Audition wave 1**: regenerate audition/undertale.html with the fnd pack cards; owner
   judges foundations (+ any unheard undertale figures he wants); import verdicts via the
   established flow; record the D-entry.
7. **Surface variants**: add the `figvary` card kind to scripts/audition-undertale.mjs
   (§5 — parent + 2 variants at intensities 0.2/0.55, deterministic `fv_` names carrying a
   `judged` snapshot of the varied figure string); regenerate the page.
8. **Audition wave 2 + calibration**: owner judges variants; import verdicts; use the
   kept/killed split BY OPERATOR to correct the cost ladder and gate bounds (every number
   in §1–§2 is a CANDIDATE awaiting exactly this data); record the D-entry, including any
   re-pricing.
9. **Only after wave 2**: consider phase-2 ops (blockify/arpeggiate as a separate
   "development move" layer, onset displacement, hemiola) — each is a class-crossing device
   the current gate rightly refuses.
