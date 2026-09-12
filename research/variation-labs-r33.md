# Variation labs — the analyses behind audition/variations.html (r33)

His directive (export-5 message, verbatim): "variation labs should be a
different page. moreover there should be many many more variations. experiment
as much as you can with not just the samples and changing intervals/notes/order
in the samples but also combos of instruments and also trying to compose in
speicifc ways with respect to the samples and how mixing samples mixes their
genres/vibes and composing with respect to that. there's so many."

Every "analyze why" in his export-5 notes gets: the measurement, the extracted
rule, and the lab card that tests (and tries to falsify) the rule. Nothing here
feeds the engine — a rule is promoted only after his verdict on its card (D95).

## 1. The alignment finding — his "wrong key" is usually not the key

His notes: "sounds like wrong key, if aligned to key it sounds like it'd work"
(combo_r8), "would work if more aligned to the chord and key notes"
(shop_bounce), "the notes should be more aligned to the key?" (layerstack_rise),
"the notes clash" (gijoe), "the second variation sounds a bit off key" (airwolf).

Measured, per pair, after the page's best-seat transposition:

| pair | out-of-scale after seating | actual mechanism |
|---|---|---|
| rl_r2 + layerstack_rise (d −5) | **0 pitches** | chord-level: the rise runs an i–iv loop; its bar 4 is a b–f–d diminished shape against the host's Am/D6 region |
| rl_r3 + shop_bounce (d +4) | **0 pitches** | chord-level: the bounce spells its own 2-chord loop against a 6-chord circle |
| rl_r2 + combo_r8 (d 0) | 2 cells | the device core is a diatonic ii11; only two chromatic PLANING cells (eb/gb, c#) leave the key |
| rl_r2 + gijoe (d −5) | 3 cells | genuine foreign tones: two half-step neighbor planes + a c# arrival |
| rl_r2 + airwolf (d −6) | **1 pitch class** | bar 2's seated a# (the source's m3); bar 1 is fully diatonic — matches "first part fits" |

Rule extracted: **the catalog's best-seat mapping already solves SCALE
alignment; what his ear flags is (a) chord-track mismatch on fully-diatonic
partners and (b) a small countable set of chromatic cells on the rest.** So
"alignment" for the predict stage = per-chord conforming (or clash-cell
repair), not a better key formula.

Lab cards: `lab_align_layerstack_rise`, `lab_align_shop_bounce`,
`lab_align_combo_r8`, `lab_align_gijoe`, `lab_align_airwolf` — each offers
as-heard vs conform vs minimal-repair, so his verdicts decide which repair
grade the engine needs.

## 2. Why the shenightfall harpsi "fits all the vibes" (his ask, verbatim)

The pattern (G minor at home): a stepwise 1-2-3 pickup into a LONG anchor note
(f4), an answer bar that walks around the anchor, one mid register, low
density, and the anchor is the ♭7 — a common tone or mild color over EVERY
chord in its home loop.

Rule: **an add-on generalizes when its longest note is a common tone of the
whole progression, its motion is bare stepwise, and it owns one register at
low density.** Predict-forward: seated on the sus-pedal host (C-minor frame),
the anchor lands on b♭ = a #9 against the loop's closing G7 — the one chord
whose third fights it. The SAME rub sits in the andalusian pairing he already
passed ("fits") — because a ♭9/#9-against-dominant is the phrygian style there.

Lab card: `lab_compose_harpsi_rule` — naive seat (rub predicted) vs
rule-prescribed anchor (g, common to all four chords) vs the andalusian
control. If v1 rubs where v3 doesn't, both the rule and its phrygian exception
are confirmed and the fit of ANY future progression is predictable by checking
the anchor against each chord.

## 3. Why the morning hexarp fits (his "analyze just like for shenightfall harps")

The run is a-b-c#-e-f#-g#-a-b: **the A-major scale minus scale degree 4** —
1 2 3 5 6 7. Degree 4 is the one tone that rubs the tonic chord (suspended
4th) and leans a half step against the tonic's third. Everything left is
chord tone or 9/13 color over every diatonic chord; that is the whole trick
(it is the major-pentatonic idea, plus 7).

Lab card: `lab_compose_hexarp_rule` — the ticked pairing vs the same run WITH
the 4th restored (falsification: predicts rub exactly on tonic bars) vs a
no-4th run composed fresh in C minor over the nightfall loop (transfer). If v2
breaks and v3 carries, "omit degree 4 and an arp fits its whole key" becomes a
generator law.

## 4. Why raining-jazz relaxes (his "analyze why its relaxing... left hand could
be learned structurally and rhythm wise")

LH: one attack per ~2 beats in a fixed order — chord (tenth-wide spread), then
root motion, then fifth/approach; RH: only neighbor-rocking (a tone trading
with its upper neighbor) with falling phrase tails; swung 8ths, slow harmonic
rhythm. The relax = sparse LH + rocking-only RH + falling tails.

Lab card: `lab_compose_rainingjazz_lh` — source LH alone (melody removed, per
his "separate this, dont use the melody"), the LH structure transferred to new
D-minor changes, and the transfer plus a NEW rocking RH. His verdict says
which half carries the relax, i.e. which half the generator should learn.

## 5. The premonition swell — clash localized, then re-framed

Export-5 confirms the r33 localization on nine more hosts: every clash note
names the SECOND swell ("second chord doesn't fit", "slightly dissonant when
the second rolled swell comes", "second swell doesn't match", "clash on the
second swell" ×6). The second swell's pitch set (d#/a#/b/f# against an A
frame) is the entire problem; the repetition never was.

Two directions, two cards:
- `lab_flow_swell` (safe-swell + rhythm/structure variants — his "should be
  varied in rhythm or structure").
- `lab_mix_mysterious_desert`: his own note "mysterious desert vibe" suggests
  the clash tones are the desert ♭II pincer (D93) waiting for a modal frame —
  over a bare tonic drone + desert groove the same pitches should read as
  style, not error. If confirmed: **a device's clash tones can be re-framed as
  modal color instead of being fixed** — reframe vs repair becomes a choice
  the generator can make per target vibe.

And his new label is its own finding: "when paired with more harmonic layers…
it actually makes it less scary and strengthens its other vibes" — harmonic
bedding NEUTRALIZES fear and re-channels the device (energy/mystery/etc.).
That is vibe algebra with a sign flip, and the mix lane leans on it.

## 6. The echo cascade (his "carried after analyzing why it sounds refreshing")

The hmsummer cascade is a UNISON CANON: one line, four copies at one-slot
delays, gains 0.5/0.3/0.2/0.13. It stays crystalline because the line is
arpeggio-shaped — delayed copies land on chord tones of the same slow harmony,
so overlaps are consonant. Rule: **echo-cascade transfers to any chord-tone
line; a stepwise line under the same cascade collides with itself in seconds.**
Lab card: `lab_compose_echo_rule` (new chord-tone line vs stepwise
falsification, identical delay/decay scheme).

## 7. Vibe algebra — his deltas, composed (mix lane)

From his per-host notes, each add-on's contribution on the premonition core:
walking bass → "playful", catchy pluck → "playful", nightfall drums →
"determination", layerstack rise → "energy + tech-like", on/off pad →
"increases the significance of the atmosphere" (but "too loud" at 0.85),
desert groove → "mysterious desert", steam/taiko → energy but "too loud".
On other hosts: pendulum → "stakes" (royalroad), airpirate bass + energetic
pizzicato → his OWN energy recipe (hexarp note), indie/lofi backbeat →
"relaxing and old classic".

Cards compose these literally: `lab_mix_his_energy_recipe` (his recipe
verbatim), `lab_mix_playful_mysterious` (do two same-direction deltas add or
saturate?), `lab_mix_determined_mysterious` (pad at half gain — was "too loud"
purely a level note?), `lab_mix_royalroad_stakes` (opposing deltas: blend or
cancel?), `lab_mix_timelapse_dial` (his "any layer can be on or off" as a
4-position energy dial), `lab_mix_tech_mystery` (delta + align rule together).

## 8. The texture budget (his law, his example)

"most of the time if you play them all at once they're not gonna resonate too
well due to being too textured.. for example moving hexarp and panflute
nocturnal would def clash" — plus "evaluate this in its parts not a whole".

`lab_mix_texture_budget` renders his named example as the control (predicted
clash), a TIME-SEPARATED version (panflute only in the hexarp's rest bars —
is the budget about simultaneity?), and the role-spread contrast built from
three of his actual rl_r3 ticks. His three verdicts calibrate the budget rule
the predict stage needs: how many textured layers, in which arrangement, before
resonance dies.

## 9. Standing corrections to card material (flow lane)

Every remaining flow/perc card follows a note of his verbatim: the pendulum
regrouping (his literal 3213232123232), hexarp/lattice/snowy/horn-echo
variation asks, rush's "same speed and a different note... and softer",
walking-bass/lb3/steel/daydreamer-bass interval-order asks, dq-pizz's
non-incrementing variant, pkmn's alignment + "go up a note instead of back
down", bkmansion's four LH behaviors, grief "played slower if it's just the
chord", congas/shaker "varied to create variation", lofi+indie "could be
combined", the tutorial-cluster "layered over time", and the percussion
energy ladder from his tier labels (7thsaga low → gradius 6/10 → ballad
6-7/10 → yukon high).

## Bookkeeping

- Page: `audition/variations.html` (`node scripts/audition-variations.mjs`),
  data `src/lib/variation-labs.js`, export page id `variations-r33`
  (verdicts / labels / variant_marks / variant_notes).
- The 13 first-generation `cand_b6_vl_*` cards left the catalog (his ruling)
  and are superseded by the flow lane's multi-variant cards; catalog is 219
  cards, first-192 byte-identical, all 75 tick pins verbatim.
- Melody-sample law (three notes this export): a MELODY sample is reference
  only — "since it's a melody you should only take inspiration not hardcode"
  (panflute lead, garden horn, airvoyage melody). Recorded for the promote
  stage: melody cards never transplant verbatim into songs.

## 10. His first labs export (2026-09-05) — what the verdicts settled

34 experiments good, 0 rejected; 150 variant marks "works", 4 "off" (his
literal 3213232123232, snowy's original and its third-lower transposition,
and the scale-climb no-arrival control — which was SUPPOSED to fail).

**Settled:**
- The flow lane's bold variations are the model: "I like this! these
  variations are nice. definitely make more of these... could also vary rhythm
  too to test hypothesis" (walkbass, dq-pizz). Bkmansion's section studies,
  the horn-echo own-melody/continuation, hexarp arch/answer, all four steel
  flows, all four daydreamer-bass flows, all grief tempos: works.
- The align lane's surgical repairs are BELOW his hearing threshold: seven
  cards labeled "very minimal changes, I can barely tell a difference". He
  marked every as-heard variant works too (airwolf as_heard included) — so
  the catalog-era "wrong key" complaints were mild, and pitch surgery is not
  where variation lives. His prescription: "more intentional variations over
  time", "more changes in the rhythm and intervals".
- Transposition is not variation ("still the same melody"); inversion, tail
  rewrite and arch are. "Inverted pickup or to rise will almost always work".
- Placement rule confirmed by falsification: the climb before a drop works,
  the climb before nothing is OFF.
- The reframe hypothesis won: safe-swell solo "sounds off because its chord is
  much more harmonic than the first" (repair kills the device), while the
  desert drone floor is "I like the tonic drone floor a lot actually! could be
  expanded to many ambient songs" (reframe keeps it).
- The nocturne grammar transfer: "I like it! learn how to make melodies like
  these. very nice, very good!!! ... sounds human" — BOTH falling and rising
  answers passed, so direction is not load-bearing; batch 2 isolates rocking /
  sparseness / frame.
- Texture budget: his own hexarp × panflute clash prediction was REFUTED at
  page seats ("sounds like a lively song but fits"); the real risk he named is
  reuse-without-variation across songs ("infirm"). Time-separation did not
  rescue anything ("feels like it's being cut off").
- Percussion: lofi+indie groomed "very nice"; stacking = "more powerful and
  thus more energetic". Buildups loop ONCE: "dont loop the buildup each time.
  loop the main bar that'll be used unless there's a change later".
- Host rhythm: pulse anchor "I like it!"; evened spans "if you plan to layer.
  if it's not many layers do the uneven spans since it's more flow".
- Voice→vibe deltas on the offbeat role: nylon "relaxing", koto "asian-y";
  the role is instrument-agnostic (all four work).

**Fixes he named (batch 2 cards):** royalroad's pendulum "second chord
sounds darker ish" (= the seated f#); the dial's pizz "one note in the middle
that doesn't work" (= the seated e-natural); raining-jazz RH second half
dissonant + too similar; the minor hexarp run "strange... I see the vision";
chaotix strings legato/staccato + trumpet "much softer"; airwolf "should be
separated... changing the second chord"; rush recipe "still slower" (felt
speed = same-pitch repetition density, not onset count); grief "same
durations feels robotic" (recorded, not yet carded).

## 11. His second labs export (2026-09-06) — batch 2 settled

17 of 17 batch-2 experiments good, 0 rejected (page totals: 51 judged, 150+
works marks, 4 off). What it settled, with the law each verdict states:

- **Bold flows keep winning**: pkmn_diverse "pretty good variations!", rise
  "good variations!", walkbass pushed/restpunct/tresillo all groovier, dq
  tresillo "there could also be variations of this. it works!", lattice rolled
  "like it", steel doubled16 "very energetic".
- **Development by ADDING OCTAVES is inaudible**: gijoe's addition arc "barely
  different I feel like". Development must change rhythm, harmony or add a
  voice (≥ a third of a block's events). walkbass/dq development "depends on
  the chord progression and song direction but a development does work" — so
  batch 3 states the progression under the development.
- **Groove regroupings are wrong for nature material**: hexarp dotted "sounds
  kinda off because it's like really groovy for a relatively serious/natural
  vibe" (triplets and anticipation passed). The nature-compatible rhythm axis
  is DURATION SHAPING inside one direction — batch 3 tests breath / rit /
  peak-echo against dotted.
- **Density is not a main beat**: on the loop-form card he heard the roles
  reversed — "the high tier looping is the buildup and bars1-2 and 3-4 are like
  the main beat". A main beat is a kick/snare IDENTITY with space; an
  undifferentiated dense tier reads as a build however long it loops.
- **Rush "third and fourth ones are still slower"** on all three variants,
  including the one whose bass is IDENTICAL in every statement — so the bass is
  not the cause; the only thing that changes in statements 3-4 is the pad
  falling c4 → a#3 → g3. Hypothesis carded: a falling sustained voice reads as
  deceleration.
- **Melody**: removing rocking, sparseness or the frame one at a time did NOT
  break human-ness ("good!" ×3); the grammar over the nightfall loop on piano
  and flute "sounds good!"; at 128 bpm "energetic! I like it"; the hammered
  control only "a bit more off (but very slightly)". Directive: "do more and
  experiment with much more! these are really good". So the load-bearing
  property is not among the ones tested — batch 3 isolates duration variety,
  breath, question/answer, arch, density, velocity, tails, anticipation, and
  8-bar form, and tests reproducibility with an algorithm (§13).
- **Fixes confirmed**: dial level "better!" / reseat "more personality";
  raining-jazz new RH "sounds really good!"; hexarp minor without b6 "sounds
  good!" while the dorian 6th "sounds off" (the minor hexarp is the minor
  pentatonic + 9: no 4th, no 6th of either kind); royalroad regroup "less calm
  and more groovy — a style direction".
- **Still live**: harpsi "try exploring making the notes of the initial rise
  different"; chaotix "could also experiment with different notes too";
  lattice sparse "background synth is a bit too loud"; grief "same durations
  feels robotic" (batch 1); and the strings note below.

## 12. The sad-shop strings — why they are smooth and the labs strings robotic (measured)

His note, twice: "these sound more robotic than the strings you used in
songs.html sad shop. the fluid and smooth ones" / "the strings are really
robotic -> use the sad shop strings". Both pages play the SAME voice —
`gm_string_ensemble_1`, the same soundfont at the same Strudel version — so
the difference is entirely in how the notes are written and mixed. Measured
with `evaluateSong` on the sad-shop mix (strings only, masks applied) against
the labs' string variants:

| | sad shop (in the mix) | chaotix legato (judged) | nightfall strings lead (judged) |
|---|---|---|---|
| mean gain | 0.21 (piano lead 0.71 → 30%) | 0.40 | 0.45 |
| room | 0.45–0.5 | none | none |
| attacks per active bar | 2 | 4 | 5 |
| median note length | 0.92 s (max 3.69 s) | 0.60 s | 0.38 s |
| notes ≥ a beat | 100% | 100% | 25% |
| distinct velocities | 8 | 1 | 1 |
| register (median midi) | 61, range 55–73 | 64 | 77, up to 84 |
| rests between attacks | 26% | 0% | 16% |
| role | 5 interlocking layers under a piano lead | the only sustained voice | the lead |

The soundfont player's envelope (Strudel 1.1.0 `getADSRValues` default
`[0.001, 0.001, 1, 0.01]`): attack 1 ms, release 10 ms — every note ends in a
hard cut unless `.release()` is set. Sad shop hides the cut three ways at once:
legato holds so the next attack starts exactly where the cut lands, `room`
smears the seam, and whisper level keeps the ensemble sample's bow onset
below the piano. The robotic variants expose it: an isochronous grid of
equal-length notes at 2x the level, dry, each ending in a 10 ms cut — and on
the lead variant the 8th-note rocks re-strike the bow onset five times a bar
at 0.38 s, before the recording's own swell has finished. The nocturne bed's
strings (gain 0.16, whole-bar holds, dry) were never called robotic — level and
hold length suffice for a PAD role; the lead role needs the envelope and the
re-attacks removed.

**Correction (his reply: "wait i listed with HQ on"):** the sad-shop strings
he compared against were the HQ TIER, not the browser voice. With HQ on,
songs.html plays the pre-rendered wav, where `gm_string_ensemble_1` is
`vendor/sfz/gen/strings-sections.sfz` — the VSCO-2 CE cello and viola
sections (sustain-vibrato recordings) through sfizz, with `ampeg_release=0.7`
(a 700 ms release on every note end instead of the soundfont's 10 ms cut),
`amp_veltrack=50` and TWO velocity layers split at 64: the engine's gains
export as absolute MIDI velocity, so sad shop's 0.21 lands on the SOFT layer
(a gently bowed sample) while 0.4–0.45 sits at the top of the same layer.
`.room()` becomes a convolution reverb per stem in the HQ mix (applyRoom,
wet ≈ 1.1 × room). So four things separated the two: the sample library
(real sections vs a GM soundfont), the release (0.7 s vs 10 ms), the velocity
layer the whisper level selects, and the convolution room — on top of the
writing differences measured above, which hold on either tier. The labs page
could not offer that tier; it now does: every batch-3 variant is rendered
through the same pipeline (`audition/hq/lab.<card>.<variant>.wav`) and the
page has the same "HQ: off/on" toggle as songs.html, so the strings cards can
be judged on the strings he actually heard. Short cards render as 8 cycles so
the loop seams less often. The HQ balance stage levels each stem by gated
loudness with a +21.6 dB cap: a soft, sparse string stem can hit that cap
(the chaotix as_judged strings were clamped 4.8 dB low), so the LEVEL axis
is compressed in HQ and the browser tier is the cleaner test of it. Of the
127 batch-3 renders, 16 hit the cap on one stem: strings_treatment
as_judged / reverb / envelope (not whisper, whose lower target needs less
boost), strings_lead_smooth as_judged / treated / held_only,
strings_durations as_judged / treated_iso / long_short / velocity,
mystery_harpsi gen_s1_strings_treated, bright_lb3 gen_s1_vibes / gen_s1_dense,
pedal_pendulum all three. Two further HQ caveats: the VSCO section SFZ tops
out at G#5, so the nightfall strings lead's bar-2 peak (bb5, c6) FOLDS down
an octave in HQ (D83 — logged on the four strings-lead renders), and
`.attack()`/`.release()` are browser-only (sfizz uses the SFZ's own
envelope), so the "envelope" variant differs from "as_judged" only on the
browser tier.

The STRINGS LAW for authored material (in BRIEF-BATCH3.md rule 5): support
strings at gain ≤ 0.25, room ≥ 0.45, notes ≥ a beat, release ≥ 0.3; a string
lead is an experiment, not a default. Batch 3's four strings cards isolate the
variables: level alone / reverb alone / envelope alone / all three (S1); the
lead treated / re-attacks removed / strings as the shadow under a piano lead
(S2); equal vs long-short vs interlocked vs velocity-varied durations at fixed
treatment (S3); and his "different notes" ask at fixed treatment (S4).

## 13. The gesture grammar as an ALGORITHM (batch 3, scratchpad/melody-gen.mjs)

Everything he called human so far was composed by hand from rules named
afterwards. Batch 3 makes the rules an algorithm so a verdict lands on the
RULES, not on my hand. Scratchpad only (D95): generated melodies are pasted
into cards as literal specs with seed, switches and stats on each card.

Rules as switches — G1 a bar = breath + gesture, a gesture = ROCK (X,
neighbour, X) or a stepwise RUN → a chord-tone LANDING held ≥ a quarter → an
optional TAIL (upper-neighbour return / hanging step below); G2 landings
voice-lead, one wide move at the peak; G3 question/answer (open bars avoid the
tonic, the last bar lands on it and holds longest); G4 a 4-bar arch; G5 bar 3
reuses bar 1's rhythm skeleton; G6 varied durations. Hosts are REALIZED chords
(the page renders degrees hosts in the C frame): nightfall Cm9|Ab^7|Gm7|Ab^7,
allstar A7|Dsus|D|Dm(add9), royalroad F|G|Em7|Am, raining-jazz Dm|Bb|Gm7|A7,
walkbass C7 blues, harpsi Gm9|Eb^7, lb3 C^7|Eb^7, pendulum Bb pedal.

Generated stats across the 33 melodies: stepwise 49–90% (density-1 median
~75%), leaps 0–2 per 4 bars, landings 100% chord tones, 0 out-of-scale, 3–4
duration values, 9–22% rest. The cards: reproducibility (three seeds vs the
hand-composed reference), rule isolation (iso durations / no breath /
all-tonic / no arch), density 1-2-4, velocity flat/landings-loud/rocks-loud,
tail types, anticipation by an 8th and by a 16th (the D123 shape on purpose),
8-bar form (free / return / exact), and the grammar over seven other hosts —
major keys for the first time (allstar, royalroad, lb3, pendulum), blues at
150, jazz at 110, mystery at 78 — on piano, flute, ocarina, clarinet,
vibraphone, square, saw, muted trumpet and treated strings.

Promotion path if the seeds pass: a `gesture` grammar option in bindMelody
(cell = breath + rock/run + held chord-tone landing + tail; Q/A + arch across
the phrase), gated `!priorKeep && ruleFresh` like every r33 rule. If a seed
fails, his words on it name the missing rule.
