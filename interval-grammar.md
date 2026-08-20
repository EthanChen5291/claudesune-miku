# Interval Grammar — rough mockup

Companion to `design-addendum.md` (§A5.6). Status: rough mockup — the shapes and rules are real music practice; every number is a tunable default, not gospel. Ratified the same way as everything else: binder consults these tables mechanically, Ethan's ear tunes them.

**What this is.** The library so far says *what material exists* (entries) and *what coexists* (compatibility graph). This adds the third layer: **how each role is allowed to move** — the legal/preferred interval vocabulary per role per style. Same contour bound as melody vs. bass vs. inner voice produces different intervals, because the grammar differs.

Interval shorthand: `0`=repeated note, `m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8`. Weights: **core** (the style's bread and butter) / **common** / **expressive** (allowed, reads as an event) / **careful** (needs a justifying context) / **avoid**.

---

## 1. Two interval axes

- **Horizontal** — motion *within* a line: step/leap distribution, max leap, leap-recovery, chromaticism. Governed per role×style (§5).
- **Vertical** — relationship to the current chord and to *other sounding voices*: chord-tone policy, tensions, avoid rules, register spacing. Governed per chord quality (§6) + universal rules (§4).

The base spec's binder only did vertical-vs-chord (snap accents to chord tones). This adds horizontal legality and vertical-vs-*other-layers* (§8, "vertical interlock").

---

## 2. Role family tree — the types of harmony

"Harmony" is not one behavior. The family, each with its own grammar (grammars inherit: `harmony.*` base → specialization overrides):

| Role | What it is | Interval character |
|---|---|---|
| `melody` | foreground line | widest grammar; steps core, leaps as events with recovery |
| `harmony.counter` | counter-melody: independent secondary line | melody's grammar, subordinated: leaps ≤P4, moves in melody's gaps, prefers contrary/oblique motion vs melody |
| `harmony.parallel` | melody harmonized in parallel — a *dependent* line | intervals locked to melody: diatonic 3rds/6ths; "same info, slightly shifted" |
| `harmony.comp` | chordal punctuation (comping) | vertical-first; horizontal motion = voice leading between voicings |
| `harmony.inner` | voice-led inner voices | common tone `0` core; steps; leap ≥P4 = revoice instead |
| `harmony.pad` | sustained chordal bed | inner-voice grammar at whole-note speed; smoothest voice leading |
| `harmony.drone` | pedal tone / sustained single pitch | horizontal `0` only; tension comes from harmony moving around it |
| `support.arp` | broken-chord ostinato (Alberti, chip arps) | chord-interval cycling (m3/M3/P4/P5/P8); pattern fixed, pitches re-bind per chord |
| `bass.*` | see archetype catalog §3 | root-motion dominated (P4/P5), archetype-specific |

Design consequence: **`harmony.parallel` and `harmony.counter` are different entry types.** Parallel is derived from the melody at bind time (no library entry needed — a transform). Counter is real material (library entries / generation) with its own compatibility edge to the melody.

---

## 3. Bass archetype catalog

Bass varies more by *archetype* than by style — the archetype determines the interval grammar. Field on every bass entry: `archetype`.

| Archetype | Behavior | Horizontal intervals | Vertical policy | Style affinity |
|---|---|---|---|---|
| `anchor` | one attack per chord, held (whole/half notes) | `0` within chord; root motion (P4/P5/M2/m2) at changes | root priority; inversions = declared slash chords | ballads, pads-led sections |
| `pulse` | root repeated in a rhythm; next measure = next chord's note repeated | `0` core; changes by root motion | root on downbeat of each change | toby-fox (driving 8ths), pop |
| `pedal` | one pitch held/repeated **across** chord changes | `0` only | deliberately non-root vs changing chords = tension device; resolves at phrase end | build-ups, bridges, sets_up sections |
| `alternating` | root–5th (or root–octave) oscillation | P4/P5 core (root↔5th), P8 (disco/house variant) | beat 1 = root, non-negotiable | bossa (with anticipation), country, house |
| `walking` | quarter-note bass *melody* | steps m2/M2 core, chord-tone m3/M3 common, P4/P5 (root motion), **chromatic approach m2 into each change**, P8 free | chord tone on beat 1 of each chord; approach tone allowed on the beat before | jazz-swing, standards |
| `riff` | fixed melodic figure, re-bound per chord (Megalovania-class) | pentatonic/blues cells: m3, P4, P5, m7, P8; chromatic passing allowed | figure's anchor note tracks root (or stubbornly doesn't — declared) | toby-fox, funk |
| `sub` | fundamental only, follows harmonic rhythm | none (motion = root motion of the progression itself) | root only, mono, no voicing | electronic-leaning; coexistence rule §4.3 |

`walking` and `riff` are **bass melodies** — stored fused (rhythm+contour) like melodic phrases, per addendum A5.1/A5.2. The rest are **bass rhythms** — rhythm + archetype, pitches fully derived from harmony at bind time. This is why "bass varies on the song a lot" costs the library almost nothing: 5 of 7 archetypes need no pitch material at all.

---

## 4. Universal vertical rules (all styles)

### 4.1 The b9 rule
Any vertical **minor-9th interval between two sounding voices is illegal**, *except* root-to-b9 on a dominant chord. One rule covers most classic avoid-note cases (the 11 over a major chord's 3rd, b13 over a m7's 5th, etc.). Verifier lint: check all simultaneous voice pairs across all layers.

### 4.2 Low-interval limits (the mud check)
A simultaneous interval is muddy below its limit (bottom note of the pair). Rough defaults (tunable):

| Interval | Lowest bottom note |
|---|---|
| m2/M2 | ~E3 |
| m3 | ~C3 |
| M3 | ~Bb2 |
| P4/TT | ~Bb2 |
| P5 | ~C2 |
| m6/M6 | ~C2 |
| m7/M7 | ~B1 |
| P8 | ~Eb1 |

Verifier lint: warn on any simultaneous cross-layer interval below its limit.

### 4.3 Sub-bass exclusion zone
When `bass.sub` is present: no other pitched voice below ~E2; the bass role sits above the sub or octave-doubles it exactly. Sub is mono — never two simultaneous sub pitches.

### 4.4 Voice crossing / register lanes
Each active pitched layer declares a register lane (from its instrument-palette patch + band). Lanes may touch, not cross, within a section (crossing = declared event). Counter-melody takes a different lane than melody by default.

---

## 5. Horizontal grammar — role × style tables

Per-role core tables with style deltas (full N×M matrix deferred until data says it's needed).

### 5.1 `melody`
| Weight | jazz-bossa | toby-fox | pop-ballad | lofi-neosoul |
|---|---|---|---|---|
| core | m2 M2, m3 M3 (arpeggio) | `0` (repetition is signature), M2, m3 (pentatonic step) | m2 M2, m3 | m2 M2, m3 M3 |
| common | P4 P5, `0` | P4, P5, m7 (pentatonic gap), **P8 (signature leap)** | P4, P5, `0` | P4, `0`, chromatic m2 runs |
| expressive | **m6 M6 (vocal-jazz leap)**, P8 | M6 | m6, P8 (chorus device) | m6, m7 |
| careful | TT, m7 (only as chord outline resolving) | m2 (chromatic passing only), TT (menace, deliberate) | TT, M7 | TT |
| rules | leap > P4 → recover by step, opposite direction; appoggiatura landings (9→8, 6→5, 4→3) encouraged; enclosures + chromatic approach allowed | narrow total range (≤ P8+m3 typical); high repetition; leap-recovery relaxed for the signature octave | leap-recovery strict; chromaticism ≈ 0 | behind-the-beat feel handled by rhythm layer; grammar ≈ jazz-bossa minus enclosures |

### 5.2 `harmony.counter`
All styles: melody's table minus expressive leaps; **max leap P4** (P5 careful); motion preference contrary > oblique > similar vs melody; rhythmic rule = move in melody's gaps (compatibility edge, kind `co-designed` when extracted together). Vertical vs melody: 3rds/6ths core; P4/P5 passing; parallel P5/P8 **avoid** in jazz-bossa/pop-ballad, **tolerated** in toby-fox (where sustained octave doubling is idiomatic — but then tag it `harmony.parallel`, it's no longer a counter-line).

### 5.3 `harmony.parallel`
Derived transform, not stored material: diatonic 3rds (below) or 6ths (above) tracking the melody; switch 3↔6 mid-phrase to dodge b9-rule violations; toby-fox additionally allows exact P8 doubling. Never runs during melody rests (it has no independent life — that's the counter's job).

### 5.4 `harmony.inner` / `harmony.comp` / `harmony.pad`
All styles: `0` (common tone) core; m2/M2 core; m3/M3 careful; ≥P4 avoid — **revoice instead of leaping**. Comp adds: top note of the voicing may act as a mini-melody (steps only). Jazz-bossa voicings are rootless (3-7-9-5 families) since bass owns the root; toby-fox voicings are plain triads/7ths, root allowed (often no independent bass present — addendum A5.2 role-optionality).

### 5.5 `support.arp`
Chord-interval cycling: m3 M3 P4 P5 P8 between consecutive notes, pattern shape fixed. toby-fox core patterns: 1-5-8-5, 1-3-5-8; jazz-bossa: broken-voicing rolls (bottom→top of the comp voicing); pop-ballad: 1-5-10 spreads (Alberti-adjacent).

### 5.6 `bass.*`
Grammar comes from the archetype (§3), style only selects archetype affinity + feel: jazz-bossa → `alternating` (anticipated), `walking`; toby-fox → `pulse`, `riff`; pop-ballad → `anchor`, `pulse`; lofi-neosoul → `anchor`, `riff` (sparse), occasional `sub`.

---

## 6. Vertical tension policy — per chord quality

Which scale degrees are safe *above* each chord quality. (jazz-bossa / lofi-neosoul use the full table; toby-fox / pop-ballad use chord tones + add9/sus4, tensions rare.)

| Chord | Safe | Careful | Avoid |
|---|---|---|---|
| maj7 / 6 | 1 3 5 7(6) 9 13 #11 | — | 11 (b9 vs the 3rd — the b9 rule) |
| dom7 | 1 3 b7 9 13 | #11, and the altered set b9 #9 b13 (as a *set* — don't mix natural and altered tensions) | natural 11, M7 |
| m7 | 1 b3 5 b7 9 11 | 13 (dorian yes, aeolian no) | b13 (b9 vs 5th) |
| m7b5 | 1 b3 b5 b7 11 | 9 | b9-vs-anything per rule |
| dim7 | chord tones + the whole-step-above extensions (dim scale) | — | — |
| sus | 1 4 5 b7 9 | 13 | 3 (it's what sus suspends) |

Binder use: accented onsets snap to **Safe**; weak onsets may pass through anything not in **Avoid**; cadence targets (base spec §3.4) override.

---

## 7. Per-section interval differentiation

Sections must not carry identical melodic information unless declared. Two mechanisms:

**Interval profile** (realization param, per section instance, per melodic-family label):
```json
"interval_profile": { "leap_ratio": 0.15, "range_semitones": 10,
                      "chromaticism": 0.05, "repetition": 0.30 }
```
The verifier computes the actual interval histogram per label per section and checks it against the target. Curve integration (addendum A4.2): the energy curve modulates profiles — e.g. chorus = wider `range`, higher `leap_ratio` than its verse. "Chorus melody opens up" becomes a measured assertion.

**Variation floor**: a section that `recalls` another must differ by ≥ ~15% in at least one profile dimension (or in register/density), **or** explicitly declare `copy: true` (intros/outros legitimately copy). "Recall, don't copy" — made measurable. Motif transforms (invert, octave-up) satisfy the floor naturally: same contour identity, different realized intervals — "slightly different info" by construction.

---

## 8. Binder consultation order (+ vertical interlock)

At bind time, per layer, deterministic and seeded:

1. **Horizontal filter** — the role×style grammar (§5) legalizes the contour's intervals: illegal interval → adjust to nearest legal (preserving contour direction), never silently drop the note.
2. **Vertical snap vs chord** — §6 policy: accents → Safe degrees; weak onsets pass; cadence targets win.
3. **Vertical interlock vs other layers** — NEW check class, the harmonic sibling of the rhythmic complement score: against all concurrently active labels, enforce the b9 rule (§4.1), low-interval limits (§4.2), sub exclusion (§4.3), lane crossing (§4.4). Violation → revoice/octave-displace (bass octave displacement is always free), retry seeded.
4. **Profile shaping** — §7 targets bias step-vs-leap choices where the grammar allows either.

Failures at any stage are reported with the rule that fired — same philosophy as containment: never silently "fixed."

---

## 9. Grammar object mockup (how it lives in the relational structure)

```json
{ "grammar": { "style": "jazz-bossa", "role": "melody",
  "horizontal": {
    "core": ["m2","M2","m3","M3"], "common": ["P4","P5","0"],
    "expressive": ["m6","M6","P8"], "careful": ["TT","m7"],
    "max_leap": "P8", "leap_recovery": "step_opposite",
    "chromatic_passing": true, "enclosures": true },
  "vertical": { "policy": "tension_table_full", "b9_rule": true },
  "inherits": null } }

{ "grammar": { "style": "jazz-bossa", "role": "bass",
  "archetype_affinity": ["alternating","walking"],
  "inherits": "harmony.base",
  "overrides": { "vertical": { "root_priority": "chord_changes+downbeats",
                               "octave_displacement": "free" } } } }
```

Retrieval/binding key: `(style, role[, archetype])` with inheritance fallback `role → harmony.base → global`. Adding a style ("AND MORE") = answering five questions: step/leap balance of its melodies? signature expressive interval? tension depth (triadic ↔ full extensions)? default bass archetypes? parallel-motion tolerance? — one table row each, then tune by ear.

---

## Open questions (for the build, not for now)
- Are grammars *hard* filters or *soft* weights the generator samples from? (Lean: hard for Avoid, soft weights for the rest — deterministic given seed.)
- Does `harmony.counter` need its own extracted entries at seed time, or is generation + grammar + compatibility edges enough until the library grows?
- Profile-dimension thresholds for the variation floor — 15% is a guess; tune from the first demo song's edit sessions.
