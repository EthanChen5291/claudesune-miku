# What game music actually does — technique compendium (r20)

Companion to `research/vgmusic-atlas-r20.md`. That document covers the corpus,
the categorisation and the lane profiles; this one is the **list of techniques**,
measured across 31,652 files and then adversarially re-measured.

**How to read this.** Eight technique areas were measured independently, then
every headline claim was handed to a separate agent whose default verdict was
REFUTED. **Seven of the claims came back WEAKENED, and several were substantially
wrong.** Both the claim and its correction are recorded below, because the
corrections are the most useful part — each one is a trap that a naive reading of
the corpus would have walked into.

Every rule below is stated as a **mechanism**, not a constant. The point is to
learn what the patterns *are*, not to hardcode any particular number.

**Standing caveat.** 31,652 files describe what game music *does*. They cannot say
what Ethan *likes*, and on at least two questions here the corpus-typical
behaviour is precisely what his ear rejected. Use these to find what the engine
has **never done**, and to calibrate ranges — never to overturn a verdict.

---

## 0. The corrections, first

These matter more than the findings they amend.

| Claimed | Verdict | Corrected |
|---|---|---|
| "A second independently-moving line is the norm — 90.9%" | WEAKENED | 90.9% carry a second *non-doubling part*, but **only 23.2% move freely**; 76.8% strike *with* the lead, 39.6% are chord blocks. Rhythmically-free: **54.5%** (38.9% strict) |
| "Lead/companion intervals are dominated by PERFECT intervals, not thirds" | **REFUTED** | The "perfect" bucket was inflated by folding in **octave doubling** (21–23%). Remove it and **thirds+sixths beat fourths+fifths in every cut, 43.1% vs 33.1%** |
| "A same-register shadow of the lead is close to absent (8.5%)" | **REFUTED** | Selection artifact — the extractor picks the part with the *most* co-onsets, i.e. the harmony hand. Scanning all pairs: **42.8% of files** carry one, 20.7% rhythm-locked, 12.2% in parallel thirds |
| "36.1% of second lines are more chromatic than the lead" | WEAKENED | **34.3%** post-bugfix, and **symmetric**: companion-shaped lines are 37.4% chromatic-over-lead vs **40.4% lead-chromatic-over-companion**. No real asymmetry |
| "Median 7 parts collapse to 5 independent layers" | WEAKENED | Median-of-two-marginals artifact. **Per-file median collapse is ZERO** (51.5% have no doubling). Among the 48.5% that do: 8 parts → 6 layers |
| "43.9% never assemble the full ensemble" | WEAKENED | Roster-gated: **12.2%** at ≤5 parts vs **64.0%** at ≥6. A *persistent core* of median 4 parts assembles in 99.0% of files |
| "Track length raises texture changes twentyfold" | WEAKENED | **Length tautology** (log-log elasticity 0.908 ≈ pure proportionality). Normalised, the change *rate falls*, in 9 of 10 systems |

Plus **a real bug in my own extractor**, caught by the same pass: out-of-key was
tested against *natural* minor, so an ordinary major/dominant V's leading tone
counted as chromatic by construction. Fixed and re-extracted; control confirms
major keys unchanged at 0.100 → 0.100 while minor moved 0.081 → **0.052**.

And **a method warning that applies corpus-wide**: any feature computed by picking
*one* member per file understates its prevalence by roughly the candidate count
(median 4 candidates here — the same-register shadow measured 8.5% by single-pick
and 43.5% by scanning all pairs).

---

## 1. Accompaniment — the engine's weakest area

**The alphabet.** {R, b3, 3, 5} is **65.2%** of accompaniment notes above the
sounding bass, not the whole vocabulary. Per-hand, the count of interval classes
carrying ≥2% of that hand's notes has median **9 of 12**. The engine uses 4.

> **Rule.** Treat the interval above the bass as a *weighted distribution over all
> twelve classes*, sampled per event, rather than a set membership test. A bound
> accompaniment over a section should sound high-single-digit distinct classes.

**The fourth is not an error.** Only **6.7%** of accompaniment hands never sound a
4th above the bass — a *lower* absence rate than the b3 (8.2%), the 3rd (8.5%),
the 9th (9.3%) or the 6th (9.9%). It is the single largest colour class. The
engine sounds it zero times.

> **Rule.** The 4th is first-class, reachable independently of whether the chord
> symbol is a suspension. Use scale-resolved tokens (`s4`) so it cannot spell a
> foreign pitch.

**Thickness and colour are independent axes.** Across files binned by attack width
(1.02 → 3.65 notes), the {R,b3,3,5} share barely moves (61.9% → 66.4%) and
triad rate actually *rises*. Widening an attack does not add colour.

> **Rule.** Drive notes-per-attack and interval-colour from *separate* controls.
> Never implement "more colour" by stacking notes, or "thicker" by adding 7ths.

**Thickness comes from stacking thin parts, not widening one.** A single acc part
reaches ≥4 notes on 5.4% of its attacks; the whole hand reaches ≥4 on **21.2%**.
Half of all acc parts *never* exceed two notes, and those play a dyad on
three-quarters of their attacks.

> **Rule.** Reach four-note verticals by casting several thin parts with distinct
> registers and rhythms and letting them coincide — not by teaching one hand to
> strike four notes. The **dyad ostinato is the modal accompaniment shape.**

**The engine's one-note default is off the distribution.** At 74.3% single-note
attacks it sits at the **99.6th percentile** of corpus accompaniment parts.

**Dissonance: the problem is resolution, not rate.** The engine's 22.8% NCT rate
sits at the 85.5th percentile — high but unremarkable. Its **6.1% resolution rate
is at the 2.5th percentile**, and the rate/resolution *combination* it ships
occurs in **1.46%** of the corpus. Corpus: 14.1% NCT, 43.6% resolved.

**Resolution is mechanically produced by step approach.** Correlation between
step-approach share and resolution share is **0.601**; non-chord tones entered by
step resolve at more than twice the rate of ones leapt into (0.245 → 0.530 across
the approach range). Approach (48.7%) and resolution (43.6%) are near-equal —
real practice **brackets** a dissonance with stepwise motion on *both* sides.

> **Rule.** Make dissonance passing/neighbour motion *by construction*: a non-chord
> tone is reachable only from a neighbour within a whole step and departs to a
> chord tone within a whole step. Do not cap the count; attach the obligation.

**Tempo does not govern dissonance** — flat across the whole tempo range (1.4-point
spread). Density does, and it moves rate and resolution in *opposite* directions.

> **Rule.** Remove tempo from any dissonance budget. A slow section is not licence
> for unresolved colour.

**Under held harmony the hand keeps moving.** Median **7.2 onsets per held bar**;
**50.8%** of held bars introduce a pitch class outside the chord. Figuration is
*insertion of foreign tones*, not faster re-striking of chord tones. Note that
29.4% of all "chord changes" corpus-wide are the same root re-struck, so this path
carries a large share of the music.

**The hand is rhythmically stratified.** Median onsets/bar: pad 0.89, acc 2.88,
arp 7.81 — roughly a 9× spread.

> **Rule.** Two accompaniment layers must differ in onset density by a *multiple*,
> not an offset.

**"Support stays under the lead" is wrong as stated for the acc hand.** A quarter
of acc parts sit at or above the lead's median pitch, and two-thirds enter after
bar 0. The constraint that actually holds is about a support layer's own *top
voice*, not the hand's register.

---

## 2. Harmony and progression

- **The commonest harmonic move is not a chord change.** The root stays and the
  quality is re-spelled — **29.4%** of all change events, present in 94.9% of files.
  > **Rule.** Give the generator a **RECOLOUR** operation as a first-class peer of
  > the chord change: hold the root, re-spell the quality.
- **Plain-triad tracks are effectively absent.** Only 17 files of 24,392 (0.07%)
  reach a 90% triad rate. Median triad share **0.17**; ninth-family chords are the
  largest quality group. This confirms the existing taste canon at corpus scale.
  > **Rule.** Colour is the default *vocabulary*, not a post-pass. A retrieval pool
  > of mostly-triad tokens cannot produce corpus-like harmony however it is mixed.
- **The dominant is a minority approach to the tonic.** Major keys: V 27.6%, IV
  24.1%, II 13.5%, bVII 11.0%. In minor the flat-subtonic *beats* the dominant.
  > **Rule.** Select the pre-tonic chord from a mode-weighted set of approach
  > degrees, not from a single dominant-function rule.
- **Colour peaks *before* the tonic and is released *on* it.** Plain-triad rate:
  17.7% on the approach chord, **29.5% on the tonic arrival** (22.1% overall). The
  commonest dominant quality is a *suspension*, not a seventh.
  > **Rule.** Treat cadence as a colour **contour**: raise colour on the approach,
  > drop it on the arrival.
- **Stepwise root motion outweighs fourth/fifth motion.** Static 29.8%, step axis
  26.2%, fourth/fifth axis 22.9%, third axis 19.4%. Circle-of-fifths is not the
  backbone. **Planing** — sliding the same quality to a new root — occurs in three
  quarters of files.
- **Modal degrees are structural furniture, not accents.** In minor: bVI in 79.1%
  of files, bVII in 77.4%, iv in 60.0%. The natural-minor dominant is slightly
  *more* common than the raised leading tone.
  > **Rule.** Put modal degrees in the base vocabulary for every lane, not behind a
  > "dark vibe" gate.
- **Harmonic practice is invariant.** Change rate, colour level and recolour share
  barely move across tempo, density, scene or mood. **Only MODE tracks the vibe.**
  > **Rule.** Set harmonic rhythm per *bar* and hold it across tempo. Never scale
  > chord duration by seconds.
- **Vocabulary keeps growing late**, and the late novelty is new *qualities* on
  already-used roots. Median 7 distinct roots, ~2 qualities each.
  > **Rule.** Size harmony as roots × qualities-per-root; grow the quality axis when
  > a section needs interest.
- **Most tracks have no detectable repeating harmonic loop** in their first 48
  changes (only 15.4% repeat ≥75% at the best lag). Where a loop exists it is an
  8- or 16-bar plan, not a short vamp.
  > **Rule.** A section's harmony is a multi-bar *plan*; the default is to continue,
  > not to return to the head.
- **Thirdless voicings are a momentary hollowing of the tonic**, weighted to the
  tonic and primary degrees, typically right after a chord that stated a third —
  not a sustained texture and not a hardware artifact.

---

## 3. Melody

- **The corpus lead is 97.44% monophonic.** Two-note attacks 2.21%, four-plus
  **0.065%**. 77% of leads *never* strike two notes at once.
  > **Rule.** "Melody is chord too" is a per-note **dyad accent on a minority of
  > notes**, capped at one added note — not a chord texture.
- **When thickened, the corpus commits to ONE interval class and holds it in
  parallel** rather than re-voicing per attack. Below the melody note: 3rd 26.7%,
  **octave-class 19.0%**, **4th 14.3%**, 6th 8.6%, 2nd 8.1%, 5th 7.x%.
  > **Rule.** Choose the thickening interval **once per song or per letter** and
  > apply it in parallel. A blanket ban on fourths *and* octave doubling forbids the
  > 2nd and 3rd most common devices.
- **Thickened notes are chosen by weight, not by rank.** A chordal attack is 1.69×
  likelier to be long and 1.29× likelier to be on a downbeat — but **70% of
  thickened attacks are not long notes**.
  > **Rule.** Weighted sample over candidates (weight rising with duration and
  > metric strength), not "thicken the bar's longest note".
- **"Held" is a coordinated profile, not a duration knob.** As the median note
  lengthens, per-bar count, range, repeated-pitch rate and rest rate all fall
  together — and **tempo does not move at all**. Only 10.4% of files have a median
  lead note ≥1 beat.
  > **Rule.** Drive held-vs-jittery from one latent profile parameter that moves
  > duration, density, range and repetition together.
- **Most gaps are articulation, not breath.** 65.8% of gaps are shorter than an
  eighth of a bar; **71% of leads are effectively legato**.
  > **Rule.** Model articulation (duration ÷ inter-onset interval) as a separate
  > voice-level parameter from rests, held constant within a section.
- **Real breaths are rare and phrases are short.** Gaps of a beat or more occur on a
  median 1.5% of onsets; 25.2% of leads never leave one. Where leads do breathe,
  the median phrase is **2.0 bars / 11 notes**.
- Median stepwise share 0.60; median leaps beyond an octave **0.00**.

---

## 4. Counterpoint, companion and call-and-response

- **The normal second part is rhythm-locked to the lead** (76.8% strike with it on
  >half their onsets). A rhythmically-free line is present in ~54.5% of files but
  is *not* universal, and is a **minority behaviour on 2–3-voice chip-era
  material** (Master System 20.3%, Game Boy 33.8%, NES 35.2% vs PS1 69.9%,
  DS 71.4%).
  > **Rule.** The corpus norm is ONE locked companion, plus — in about half of files
  > — one further free line. Not a general free-counterpoint texture.
- **Separation is by REGISTER, and it is two devices, not one.** (i) The melody is
  separated from its *harmony hand* by about an octave (median −12, 76.0% below on
  register-unconstrained roles). (ii) Separately, a companion runs in the **same
  register a third-to-fourth away** — present in 42.8% of files, rhythm-locked in
  20.7%, in parallel thirds in 12.2%. The gap between the two highest non-bass
  parts has median **5 semitones**, not 12.
  > **Rule.** Do not place the companion an octave down on the strength of the −12
  > median — that is the gap to the harmony hand. Build both devices.
- **Thirds and sixths beat fourths and fifths** (43.1% vs 33.1%) once octave
  doubling is removed — but **P4 (17.3%) individually exceeds m3 (15.1%)**.
  > **Rule.** Keep a thirds/sixths preference; **drop the categorical ban on the
  > fourth**, which is the single largest individual harmonising class.
- **Chromaticism is not bought by rhythmic independence** — out-of-key rate is flat
  across the whole independence range.
  > **Rule.** Never grant a companion extra chromatic licence for having its own
  > rhythm or timbre. One line-level budget, applied identically.
- **The chromatic drone is near-absent**: a barely-moving line parked on out-of-key
  pitches occurs **26 times in 15,813 files (0.16%)**, and narrow-range lines have
  a **median out-of-key rate of exactly zero**.
  > **Rule.** Scale chromatic licence by realised **motion**: a line that repeats or
  > holds must be diatonic; a line that moves freely may not be. *This is the
  > corpus's own version of the r19 fix, and it reaches it by a better mechanism
  > than a blanket key-gate.*
- **The second line inverts its density against the lead's activity.** Lead resting
  → companion denser (ratio 1.57, denser in 63.9%); lead continuous → sparser
  (0.88, denser in 29.4%).
  > **Rule.** Drive companion density from the lead's measured per-bar activity, not
  > a constant fraction. Where the melody mask is silent, *raise* the companion.
- **Call-and-response is two different devices.** 45.6% of files contain a pair
  sharing **zero** active bars (sequential occupancy / handoff); 25.5% contain a
  pair that genuinely trades while co-present.
  > **Rule.** Budget handoff and trading separately; detect by shared-active-bar
  > count, not by any single alternation ratio.
- **Trading partners contrast in timbre** — 85.9% different GM program, 76.2%
  different family — and **59.7% of trading pairs do not involve the lead at all.**
  > **Rule.** Require a different *declared* family (not a name test), and schedule
  > alternation between support layers, not only lead-vs-other.
- **The second line enters with the lead** — 83.5% at or before the lead's first
  bar; only 9.9% enter 4+ bars later. It is not a late texture add.

---

## 5. Layering and doubling

- **Doubling is a discrete decision, not a gradient.** 67.2% of part-pairs share
  under 5% of their pitches and 3.5% share 99–100%; only 4.3% sit in the ambiguous
  50–90% band. 48.5% of files carry at least one doubled pair —
  **unison 41.6%, echo 42.6%, octave 15.8%** — and echo is overwhelmingly a
  same-instrument delay at a **half or quarter beat**.
  > **Rule.** Make doubling an explicit binary mode with its own parameters. "Add a
  > layer" is very often answered in real music by *doubling an existing one at an
  > offset*, which costs no new material — a device the engine does not have.
- **But most files double nothing**: the per-file median collapse is **zero**.
  Doubling is a *device used by about half the corpus*, not a universal tax.
- **14.0% of all part-pairs are homorhythmic but non-unison** — parallel harmony
  that a naive layer counter reads as two independent lines; 34.2% of files contain
  a pair striking together on ≥95% of onsets *on the same GM program*.
  > **Rule.** Before crediting N own-melody layers, collapse any pair whose onset
  > coincidence is high **and** whose sound is the same. This is the corpus-scale
  > confirmation of the existing law that *"two layers that always strike together
  > on one instrument are one layer"* — found by ear on 43 songs, here on 31,652.
- **The full ensemble is roster-gated.** Files with ≤5 parts assemble everything
  88% of the time; files with ≥6 parts fail to assemble **64%** of the time. What
  is constant is a **persistent core of about 4 parts**, present in 99% of files,
  which grows only 3→6 as the roster grows 3→14.
  > **Rule.** Hold out a fraction of the roster that *scales with roster size*. A
  > large cast should rarely, if ever, sound at once; a small one usually should.
- **Track length buys roster and boundaries, not density.** Concurrency rises only
  weakly with length (elasticity 0.099) while the *fraction* of the roster sounding
  falls 0.917 → 0.584. Normalised texture-change *rate* falls with length.

---

## 6. Form, sections and transitions

This section answers the standing unbuilt ask — *"changes not just in strict
section bar, and also changes in a unique way."*

- **Layer entries are not section-locked.** Only 43.1% land on a 4-bar grid, 21.0%
  on an 8-bar grid, 16.5% on a harmonic boundary. **60.0% of files put zero entries
  on a harmonic boundary**, and only 3.3% behave the way the engine does.
- **The mechanism is a bounded ±1-bar displacement, not free placement.** Signed
  offset to the nearest multiple of 4: **−1 → 20.4%, 0 → 43.1%, +1 → 20.6%,
  +2 → 15.8%**; 84.2% sit within one bar of a 4-bar boundary.
  > **Rule.** Implement off-boundary change as a **jitter drawn from {−1, 0, +1, +2}
  > with weights ≈ {0.20, 0.43, 0.21, 0.16}** around the nominal boundary — not as
  > randomness, and not as a second grid.
- **It is NOT 2-bar-periodic.** The +2 slot is the *rarest* non-zero position, and
  in strongly-looping files the loop midpoint attracts entries at *below* chance.
  This **refutes the standing hypothesis** that the mechanism is a faster periodic
  grid.
- **Off-grid entry is not reserved for decoration.** Primary layers (lead, acc, pad)
  enter off-grid at the same rate as ornaments; 75.6% of files with any mid-piece
  entry make at least one off-grid.
- **Openings are a one-bar staggered build.** The single most common entry bar in
  the corpus is **bar 1** (20.4%); 29.5% of entries occur by bar 2. 60.2% of parts
  enter after bar 0.
  > **Rule.** Hold back roughly 60% of the cast past bar 0 and space the held-back
  > entries a bar or two apart, rather than admitting everything at bar 0 or at the
  > first section start.
- **Removal is a first-class event.** 40.6% of texture-change events are removals;
  3.8% move parts both ways at once.
- **The concurrency envelope is a shallow arch** — ~45% of the cast absent at the
  start, ~42% gone by the end, long flat plateau across the middle.
- **The characteristic gesture is a thinning TAIL, not an interior breakdown.**
  Deep mid-track strip-downs are rare (median interior dip 8.3% of peak).
  > **Rule.** Budget contrast toward the ending: a thinning tail over roughly the
  > last fifth, shedding ~40% of the cast one or two parts at a time.
- **Intro length is governed in BARS, not seconds** — so slow songs get the longest
  intros in real time. 47.4% of intros exceed 16 seconds; below 70 bpm, **61.9%**
  do. **38.5% of intros are an odd number of bars**, and 1-, 2- and 3-bar intros
  together outnumber 8-bar intros.
  > **Rule.** Specify intros in bars and let seconds fall out of tempo. A
  > seconds-based cap *inverts* the corpus relationship, and whole-loop shrinking is
  > stricter than the corpus practises.
- **Section length is centred but not quantised**: only 44.0% of files have a median
  section length that is a multiple of 4; **34.3% are odd**. Texture boundaries run
  slightly faster than harmonic ones in 51.2% of files.

---

## 7. Rhythm and percussion

- **The drum loop's period is 2 and 4 bars, not 1.** A bar is 1.6× likelier to match
  the bar four back than the bar immediately before. Only 5.8% of tracks repeat one
  identical bar throughout.
  > **Rule.** Author drums as a multi-bar cell with a small closed set of variants
  > (roughly one per 8 bars), not as a one-bar pattern plus fills.
- **Groove changes ignore the section grid**: 73.8% of bar-to-bar drum changes land
  on a bar that is neither a 4- nor an 8-bar boundary. The section boundary acts as
  a ~1.3× probability *boost*, not a gate.
- **The snare is stereotyped, the kick is free.** 44.4% of tracks put the snare
  exactly on 2 and 4; the commonest kick pattern covers only 14.6%.
  > **Rule.** Split freedom asymmetrically by role — backbeat from a small weighted
  > set, low drum from a wide pool.
- **Syncopation is a monotone gradient by role**: crash 11.3% odd-16th, kick 21.8%,
  snare 25.0%, hat 32.0%, tom 33.3%, **hand drum 36.0%**. The more structural the
  role, the more it sits on the beat.
- **Per-track syncopation is bimodal, not average.** 45.0% of tracks put under 5%
  of kick onsets on an odd 16th while 30.7% put over 30% there; **11.9% have zero
  odd-16th drum onsets anywhere**.
  > **Rule.** Draw a per-song straight/syncopated latch once and apply it
  > consistently to every percussion role — never an independent per-onset
  > probability.
- **Grid resolution scales inversely with tempo while events per bar barely move**
  (odd-16th share 42.0% → 5.3% from <90 to >175 bpm; onsets/bar only 15 → 10).
- **Fills are close to absent as a routine device.** Only 2.4% of active drum bars
  are fills; **76.2% of tracks contain none at all**, and when one occurs it is
  snare-led (62.4%), not tom-led (21.0%).
  > **Rule.** Do not model phrase-end as a routine tom fill. Phrase-end emphasis is
  > mostly an extra snare event inside the existing pattern.
- **The crash is a structural marker, not a texture** — 2.3% of hits, 37.8% of its
  onsets on the bar's first 16th.
  > **Rule.** Fire the crash on the downbeat of a bar where the groove or section
  > changes, at roughly double baseline rate.
- **Percussion accent is carried by INSTRUMENT SWAP, not velocity.** 55.8% of tracks
  use ≤2 distinct drum velocities and the median on-beat-minus-off-beat velocity
  difference is **exactly 0.00** — while the open hi-hat does the accenting (50.6%
  of its onsets on offbeat 8ths vs the closed hat's 30.0%).
  > **Rule.** Express accent by selecting a different articulation of the same
  > timekeeper, not by raising gain.
- **Drum variation is substitution, not addition.** 67.4% of changed bars both add
  and remove onsets; a constant timekeeper over a varying kick is 3.6× commoner
  than the reverse.
- **Colour percussion is one co-firing group** (hand drum ↔ wood/metal lift 3.15,
  shaker ↔ wood 2.42) that layers *over* an unchanged straight kit rather than
  replacing it — and it is conditioned by **environment, not energy**: hand drums
  in 40.3% of jungle and 26.9% of forest against 12.5% baseline, but only 8.6% of
  battle and 5.9% of boss.
  > **Rule.** Two independent dials — environment permits colour percussion; energy
  > weights cymbals and toms.
- **Drumless is a whole-ensemble state, not a mute.** 20.6% of the corpus. Those
  tracks also drop from 8 parts to 5, from 28 to 17.7 pitched notes per bar, and
  from 69% to 22% likelihood of carrying a bass-family part.
  > **Rule.** "No percussion" fires a coordinated preset — fewer parts, no dedicated
  > bass, longer melody notes, flatter dynamics — not a drum mute.
- **The timekeeper is a track-level constant**: hat-only 52.3%, ride-only 5.5%,
  both 14.8%; only 3.8% of tracks change timekeeper mid-track.

---

## 8. What the corpus does NOT do

Absences are facts about a mechanism, and were reported explicitly rather than as
shortfalls.

- Tracks that are **mostly plain triads**: 0.07% of files.
- **Four-plus-note melody attacks**: 0.065% of lead attacks.
- **The chromatic drone** (static line parked out of key): 0.16% of files.
- **Routine tom fills**: 76.2% of tracks have no fill at all.
- **Velocity-based percussion accent**: median on-beat/off-beat difference 0.00.
- **2-bar-periodic off-grid change**: the +2 slot is the *rarest* position.
- **Tempo-driven dissonance**: no effect across the full tempo range.
- **A short harmonic vamp as the default**: 84.6% have no detectable repeating loop.
- **Castle, sky and vigilante as sonic categories**: cluster lift 1.30–1.50, i.e.
  no measurable identity. Those titles describe the screen, not the sound.
- **Horror as thirdless harmony**: zero lift over baseline.
- **Jungle as harmonically distinctive**: zero lift on change rate or root count.
- **Desert as minor-leaning**: zero lift (52% vs 54% baseline).

---

## 9. Reproducing

```
node scripts/corpus-extract.mjs      # -> features.jsonl (31,652 records, ~100s)
node scripts/corpus-cluster.mjs      # -> clusters.json
node scripts/corpus-lanes.mjs        # -> lane-profiles.json
node scripts/corpus-report.mjs       # the full numeric report
```

Two limits on that contract, stated rather than implied: the `.mid` inputs are not
in the repo, so a clone must re-fetch ~900 MB from a live third-party site (the
gzipped manifest makes that exact, but not free or guaranteed); and **do not run
the extractor while another process is reading `features.jsonl`** — it truncates
and regrows the file, and a concurrent reader gets silently wrong answers. That
happened once during this round and was caught only because a system filter
returned zero rows.
