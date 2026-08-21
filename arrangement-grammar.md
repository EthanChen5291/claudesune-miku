# Arrangement Grammar — voicing manipulation, orchestration, structure over time

Companion to `design-addendum.md` (A4/A5/A7) and `interval-grammar.md`. Status:
research mockup, same contract as the interval grammar — the shapes and rules
are real practice; every number is a tunable default; nothing here enters the
engine un-eargated. Covers Ethan's 2026-08-20 asks: (§1) varying specific chord
notes by octave and (§2) moving chords across instruments *"in a controlled way
without it being random but ensuring it's expressive"*; (§3) how instruments
get chosen and related (same melody / slightly different / counter / chorus);
(§4) loop vs rising-tension structure and controlling instruments over time;
(§5) arpeggio types, traversal rhythms, staccato vs hold.

**The thesis, once, up front — how anything here is "decided":** every choice
below runs the same three-stage procedure, which is the whole answer to
"controlled but expressive, not random":

1. **HARD filter** — the universal vertical rules (interval-grammar §4: b9
   rule, low-interval mud limits, sub exclusion, register lanes), the patch's
   A7 register/attack metadata, and the invariants in §1.3. Violators are not
   options.
2. **COST ranking** of the survivors — voice-leading distance, energy-curve
   fit, top-line coherence, style prior (§1.2). Deterministic arithmetic.
3. **SEEDED tie-break**, and the winner is **declared** — a typed operator in
   the spec/boundMeta (the A3.6 pattern), so containment scopes it, the report
   names it, and an edit can target it. Randomness is replaced by *seeded
   choice among ranked-legal options, triggered by structure* (§4), never by
   per-chord dice.

---

## 1. Voicing manipulation — octave displacement as typed operators

### 1.1 The operator set

Practice first: what players actually do to "the same chord" is a small closed
vocabulary — inversion, open/close position, drop voicings, octave doubling,
omission, spread. Encode each as a deterministic rewrite of a voicing's offset
list (the `src/lib/voicings.js` representation — semitones from the root — is
already the right substrate; `drop2` in that file is one of these operators
frozen into a shape):

| Operator | Rewrite | Musical meaning | Practice anchor |
|---|---|---|---|
| `inv(n)` | rotate the bottom n members up an octave | inversion; bass note changes → must agree with the declared slash/root (§1.3) | keyboard inversions |
| `drop(2)` / `drop(3)` / `drop(2,4)` | kth-from-top member down an octave | close → warm open jazz spacing | drop-2/drop-3/drop-2&4 guitar & big-band voicings |
| `open` | widen adjacent intervals ≤ M3 by octave-lifting alternate members | close position → spread | "open position" |
| `close` | inverse of `open` (pull outliers inside one octave) | maximum blend, disappears into the mix | `closed_stack`'s character line |
| `lift_top(n)` | top member up n octaves | soprano emphasis; the voicing grows a head | chorus lift; D30 corpus `octave_lift` moves |
| `floor_bass(n)` | bottom member down n octaves | weight; Ethan's "bass down an octave" | stride LH, piano tenths |
| `double(m, ±1)` | add member m an octave up/down | thickness without new pitch classes | octave doubling; toby-fox idiom (interval-grammar §5.2) |
| `omit(m)` | remove member m (5th first, root if a bass layer holds it) | declutter; rootless comping | shell/rootless voicings (`shell_37`) |

Composable left-to-right like motif transforms (`drop(2)+floor_bass(1)`).
Operators apply to ANY shape, so the library keeps a few *shape ideas* and the
operators generate the register variants — shapes × operators, not shapes ×
every spacing.

### 1.2 The decision procedure (stage 2 costs, in rank order)

Given the legal candidates for a chord instance:

- **Voice-leading cost** (dominant term *within* a phrase): sum over voices of
  semitone motion from the previous sounding voicing, common tones free. This
  is interval-grammar §5.4's `harmony.inner` grammar ("≥P4 → revoice instead")
  turned into arithmetic. Effect: inside a phrase, voicings crawl; the chord
  changes, the hand barely moves.
- **Energy fit**: the section's A4.2 energy value maps to a target register
  span and top-note height; distance from target is cost. Rising energy
  *prefers* `open`/`lift_top`/`double`; falling prefers `close`/`omit`. This
  is what makes displacement *expressive*: it tracks the declared curve, and
  A1.3's `cross_register_width`/`gw_density` verify the result moved.
- **Top-line coherence**: successive voicing TOPS form a mini-melody
  (§5.4 note). Cost per top-note leap > M3 unless the leap lands a phrase
  boundary. (This single term is most of why good comping sounds "arranged".)
- **Style prior**: per-style operator affinity — jazz-bossa: `drop(2)`,
  `omit(root)` (bass owns it); toby-fox: `close`, `double(R,+1)`, plain
  triads; cinematic/pad: `open`+`floor_bass` (the `spread_tenth` sound).

**Variation triggers** (when the operator chain is allowed to CHANGE — the
anti-random rule): only at structural events — section boundary (realization
params, A4.1), phrase boundary within a section (§4.2), Nth recurrence of a
loop (2nd pass may `lift_top`, 4th may `open` — "same material, one notch
more"), cadence approach (`open` outward into the cadence: bass down, top up,
the classic contrary-motion expansion), or a declared development move (§4.3 /
D30 vocabulary). Between triggers the chain is frozen — variation reads as
intent because it lands where the ear expects change.

### 1.3 Invariants (new HARD rules, joining interval-grammar §4)

- **Bass-note integrity**: a voicing's lowest sounding member must be the
  chord's declared bass (root, unless a slash chord declares otherwise).
  `inv()` changes the bass only by *declaring* the slash. This is the D26
  drop2 bug ("the maj7 landed a step under the root") promoted from
  ear-finding to lint.
- **Bass-lowest**: when a `bass.*` role is active, the bass label owns the
  lowest sounding pitch at every instant (sub-bass below it exempt per §4.3);
  it renders the chord's bass note, by default one octave below the harmony
  layer's bottom (`floor_bass(1)` relative to the comp). Verifier: warn-level
  sweep over simultaneous cross-label pitches, same machinery as the §4
  vertical sweep. Other layers wanting a lower note must displace up or the
  bass declines to be present (role absence is legal, A5.2).
- **Melody lid**: the comp/pad top stays below the concurrent melody lane
  (§4.4 lanes; crossing = declared event). `lift_top` candidates that breach
  the lid are filtered at stage 1, which is how "expressive" never becomes
  "ate the melody".
- **Mud repair direction**: a §4.2 low-interval violation is repaired by
  displacement UP of the upper note or a §2 `bass_split` — never by deleting
  the pitch class (the D23 ruling: revoice/octave-displace, never drop).

---

## 2. Chord distribution — moving a chord across instruments

One chord source, several typed ways to sound it. The split is a realization
param per (section × harmony stream); the compiler emits **one label per
target patch**, so instrument-stream containment (D4) and per-label mutes keep
working untouched.

| Policy | Who plays what | When it earns its place |
|---|---|---|
| `stacked` | one patch, whole voicing | default; verses, small textures |
| `bass_split` | bottom member → bass patch (an octave down, §1.3); rest → comp | the standard mud repair; any time a bass role exists — this IS "bass is the lowest note, down an octave" made mechanical |
| `layer_split(k)` | bottom k → low patch, top n−k → high patch | piano-LH/RH textures; low pad + EP sparkle |
| `top_split` | top member → lead-adjacent patch; rest → comp | soprano doubling — the voicing grows a singable head; pairs with §1.2 top-line coherence |
| `hocket` | strikes alternate between two patches | rhythmic interest without new material; complement-scored like any interlock pair (A5.3) |
| `halo` | sustained patch holds the voicing; plucked patch arpeggiates the same members | the pad+arp texture (game/EDM staple). Note the D30 corpus documents exactly this pair as a *development move* (`blockify`/`arpeggiate` between `block` and `arp`/`ostinato` classes) — halo is both-at-once |

Decision inputs, same three-stage procedure: A7 metadata is most of stage 1
(each sub-voicing must fit the patch's register range; strike density vs
attack class — a slow pad cannot articulate the hocket), §4 rules across the
now-separate labels (the b9 rule applies *between* the split parts exactly as
before), energy at stage 2 (`active_layers` rises with splits — splitting IS
an energy lever, measurable via A1.3), style prior (toby-fox: `bass_split` +
`halo`; jazz-bossa: `stacked` rootless over walking bass; cinematic:
`layer_split`).

---

## 3. Instrument choice — the doubling/relation taxonomy

How added instruments RELATE to existing material (Ethan's "some the same
melody, some slightly different, some harmony/counter, chorus"). Standard
orchestration relations, each with its engine mechanism:

| Relation | Plays | Engine mechanism | Risk / cost |
|---|---|---|---|
| `solo` | the line, alone | the bound label itself | — |
| `unison_double` | same notes, same octave, second timbre | same bound notes → second label, different patch | timbral fusion; attack mismatch reads as flam — stage-1 filter on A7 attack class |
| `chorus_double` | same notes, detuned/delayed copy | same label duplicated with `.detune`/micro-`.late` | thickness only; never counts as a new voice |
| `octave_double(±1)` | same line ±12 | pitch-shifted rebind of the same material | brightness/weight; it is `harmony.parallel`, not a counter (interval-grammar §5.2 ruling) |
| `reduction` | the line's long tones / phrase peaks only | derived: filter bound notes to accents + phrase heads (heterophony — "slightly different" made precise) | almost free; the pad singing the melody's skeleton |
| `parallel(3rd/6th)` | diatonic parallel | derived transform at bind time (§5.3, no entries) | b9-rule dodges via 3↔6 switch, already specified |
| `counter` | independent line in the melody's gaps | real material: `harmony.counter` entries + co-designed edges | the expensive one; foreground budget below |
| `antiphonal` | call/response — the line alternates carriers | section-level: melody label masked per phrase across two patches | needs phrase grid (§4.2) |
| `chordal` | comp/pad/arp under it all | §2 policies | — |

**Foreground budget** (the rule that keeps this from becoming soup): at most
ONE foreground carrier at a time — melody, or the counter in melody's gaps;
doubles/reductions/parallels never count as foreground. Verifier proxy:
onset-overlap ratio between labels tagged foreground stays under a threshold.
This is the orchestration-textbook "one conversation at a time" rule.

**How many relations are active = an energy lever.** The doubling count per
section comes from the A4.2 curve (intro: `solo`; verse: +`chordal`; chorus:
+`octave_double` +`reduction`). `active_layers` (A1.3) is its verifier. Which
PATCH takes which relation: stage-1 A7 fit (register lane free? attack fast
enough for the figure's density?), then style prior, then seeded pick — and
the assignment is spec-declared per section, so "give the counter to the
vibes" is a one-line scoped edit.

---

## 4. Structure over time — loop, ramp, and the phrase grid

### 4.1 The default is a loop for a reason

4/8-bar loop periodicity is the shared convention of pop/EDM/game writing
(the "rule of 8"), and the D30 corpus agrees: chord loops were found at 2/4/8
bars, figures hold for 2–8-bar spans. So: **default structure = 4- or 8-bar
harmonic loop per section, varied at phrase boundaries** — rising tension is
not a different structure, it is a *policy over the same grid*.

### 4.2 The phrase grid + one-change budget

Sections subdivide into phrases (default `section bars / 4`, so a 16-bar
section = 4 phrases). Per phrase boundary, a **delta budget of ONE change**
drawn from a typed move list:

`add_layer` | `drop_layer` | `swap_figure` (development move, §4.3) |
`octave_lift` (§1's `lift_top`/`double(+1)`) | `open_voicings` |
`densify_perc` | `fill` (transition material at phrase tail) | `hold`

One change per boundary is the practice heuristic ("change something every 8
bars, change ONE thing"), and it makes ramps *legible*: the listener tracks
each addition. The D30 development data backs the grid — observed moves land
at 4/8-bar span boundaries (Gasters Theme every 4, Death Report every 4,
Megalovania at 8s).

**Ramp policies** per section role (a realization param; the compiler derives
per-phrase masks from it, extending A4.2's curve to phrase resolution):

| Policy | Shape | Typical role |
|---|---|---|
| `plateau` | all phrases equal; `fill` at the last phrase tail | chorus, drop |
| `terrace` | +1 move per phrase, monotone | build / `sets_up` sections; verse 2 |
| `saw` | terrace, then reset at section top | long verses (the "breathe" reset) |
| `subtractive` | −1 move per phrase | breakdown, outro |
| `withhold` | one layer absent until the LAST phrase | the base-spec payoff device, now grid-addressable |

Verifier hooks, all on existing machinery: per-phrase metrics are just
cycle-range metrics; assertions — `terrace` ⇒ `gw_density`/`active_layers`
monotone nondecreasing across phrases; one-change budget ⇒ count of labels
whose hap signature changes at each phrase boundary ≤ 1 (containment diff
already computes this); boundary smoothness (A4.2) stays the section-level
check.

### 4.3 Entrance/exit ordering + the development vocabulary

- **Entrances** follow a style-prior order, not chance: pop/EDM — rhythm
  section first (drums+bass, then chords, then lead); cinematic — pad first,
  pulse later; toby-fox — melody may open solo (corpus: many intros are the
  figure alone or melody alone). Stored per style as an ordering, overridable
  per spec.
- **Exits** are asymmetric: drop background before foreground; a foreground
  exit is an event (antiphonal handoff or a `withhold` setup, declared).
- **`swap_figure` uses the D30 move vocabulary** — `repitch_same_rhythm`
  (dominant in the corpus, 26×), `arpeggiate`, `blockify`, `densify`,
  `sparsify`, `octave_lift`, `pattern_swap` — so "develop the accompaniment"
  means choosing a move type, and the corpus's tallies are the style prior
  for which move a toby-fox song would make next.

---

## 5. Harmonic texture — arpeggio types, traversal rhythms, articulation

### 5.1 Arpeggio/figuration taxonomy — encoded in the D30 token grammar

Ruling: the figuration grammar (`R 3 5 7 9 ~n`, `+` octave, `a.b` together)
is the **canonical encoding** for all of these — hand-written arp types become
figuration entries (provenance `hand-written`, auditioned like anything else),
not a new schema. The taxonomy, with corpus witnesses where they exist:

| Type | Token sketch | Character / anchor |
|---|---|---|
| up | `R 3 5 R+` | the default lift; `ut_arp_dont_give_up` = `R 5 R+ 5 R 5` (3/4) |
| down | `R+ 5 3 R` | sighing; `ut_arp_down_dummy` (`R+ R+ 7 ~1 R` — with the chromatic color kept) |
| pendulum (up-down) | `R 3 5 3` / `R 5 R+ 5` | Alberti's family; `ut_arp_tem_shop` class |
| Alberti proper | `R 5 3 5` | classical LH; low-high-mid-high |
| 1-5-8-5 | `R 5 R+ 5` | toby core (interval-grammar §5.5), the Sans-song figure |
| 1-5-10 spread | `R 5 3+` | ballad LH, wide; pairs with `floor_bass` |
| stride / oom-pah | `R  3.5  R  3.5` (bass on 1/3, chord on 2/4) | `ut_oompah_dogsong` = exactly this; bounce voices in `bindComp` are its rhythm-only shadow |
| octave pump | `R R+ R R+ …` | `ut_ostinato_core`; drives without harmony motion |
| pedal ostinato | `R R R R …` | Megalovania class; tension from harmony moving over it (= `bass.pedal` at 16ths) |
| rolled block | whole voicing, onsets spread ~1/32 apart | strum/arpeggiato attack — an ARTICULATION of block, not a new figure (§5.3) |
| planing blocks | `~n.~m` parallel literals | chromatic push; `ut_block_dummy_2` = `R.5 ~1.~7 ~2.~8` |

### 5.2 Traversal rhythm — how a figure moves through time and chords

Orthogonal to the member pattern:

- **Even grids** (8ths/16ths; triple 6ths in 3/4-6/8) — the corpus default.
- **Dotted-chain push** — 3+3+3+3+4 sixteenths (`[0,3,6,9,12]`-ish onsets) and
  the 3+4+5 cell; the same figure gains urgency with zero new pitches. The
  melody stats found these as THE hook cells; they apply to accompaniment
  identically.
- **Rotation (3-against-4)** — a 3-member pattern cycled over a 16th grid so
  it drifts across the beat (chip/trance staple). **Engine note:** today
  `bindFigure` ties tokens 1:1 to onsets per bar; rotation needs figure-length
  ≠ onset-count realization — the exact sibling of D26's contour modes
  (`tiled`/`unfold`). Queue it as `figure realization modes`; do not fake it
  with 12 hand-unrolled tokens.
- **Chord-change interaction** — when harmony moves mid-pattern: `rebind`
  (members re-resolve at the change — current bindFigure behavior, correct
  default) vs `carry` (finish the pattern statement on the old chord's tones,
  re-bind at the pattern top — the "arp doesn't flinch" sound). One flag,
  declared.

### 5.3 Articulation — staccato vs hold as data

New per-entry (later per-onset) field, rendered mechanically by note duration
in the emitted grid (`@k` gaps / `.clip`):

| Value | Duration vs gap to next onset | Default for |
|---|---|---|
| `staccato` | ~0.4 | oom-pah chords (the "chick"), block stabs at speed |
| `detached` | ~0.7 | bass `pulse`, ostinati |
| `tenuto` | ~0.95 | melodic figures |
| `legato` | ring to next onset | arps meant to blur (current `legato: true`), comp (current bindComp behavior) |
| `let_ring` | overlap past next onset (pedal) | pads, `halo` sustains |

Couplings: accent + `staccato` = marcato (the accent profile already carries
the gain half); D30 entries already learned `legato` empirically from source
durations — this field just names the full axis. Style priors: toby-fox
staccato/detached bias (chip attack), jazz-bossa legato comping, pads always
`let_ring`.

### 5.4 Density × register guardrails

Two rules of thumb that prevent the classic texture failures, both stage-1:
figures ≥ 8 onsets/bar require a fast-attack patch (A7) and want harmonic
rhythm ≤ 1 chord/bar (busy pattern × busy harmony = churn); figures below C3
obey the §4.2 mud table *per struck simultaneity* — which in practice forces
low-register figures monophonic (`bass` class) or `bass_split`.

---

## 6. Build-order hook (respects the D24 queue)

Nothing above jumps the queue; it extends items already sequenced:

1. **Binder revoicing** (queued as D24 item 1, interval-grammar §8 step 3) —
   implement WITH the §1 operator set as its vocabulary, since a revoicing
   pass needs exactly these rewrites anyway. Bass-note integrity + bass-lowest
   lints land here (cheap, verifier-side first).
2. **Phrase grid + ramp policies** (§4.2) — compiler realization params +
   per-phrase assertions; unlocks `withhold` addressing and the one-change
   check. Pure compiler/verifier work, no new library data.
3. **Distribution policies** (§2) `stacked`/`bass_split` first (the invariant
   pair), `halo` second (it is two existing binds sharing a source).
4. **Articulation field** (§5.3) — small binder emission change; entries adopt
   it lazily.
5. **Figure realization modes** (§5.2 rotation) — after audition round 2 says
   the 1-bar figures earn it.
6. **Doubling relations** (§3) — `octave_double`/`reduction` are derived
   transforms (cheap); `counter` waits for library material, as A9 already
   says.

Every threshold above (M3 top-leap cost, 0.4 staccato, one-change budget,
phrase = 4 bars) is a default for the audition loop to tune, not a claim.
