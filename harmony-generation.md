# Harmony Generation — composing progressions instead of replaying them

Phase 1 of Ethan's stated order (harmony → layering → chronological editing).
Status: researched, measured, built (D49), then **redirected by Ethan and
rebuilt around exemplars (D50)** — §7 is the important section and the one to
read first if you only read one. §1–§6 are the counted model, which survives as
the verifier rather than as the generator.

Ethan pointed at
[awesome-midi-sources](https://github.com/albertmeronyo/awesome-midi-sources) as
a possible data source; §5 answers that, and the short version is that it is the
wrong list for this problem and §5 names the right one.

House rule as always: **measure the corpus before writing a rule down.** Almost
every textbook rule I would have hard-coded turned out to be something this
corpus breaks a hundred times.

---

## 1. What the corpus can and cannot teach

421 progressions across four packs (ldrolez 188, undertale 161, unison 72),
2190 chords, 1769 interior transitions.

**A joint model does not fit.** As `<degree>:<quality>` tokens that is 155
symbols and 729 distinct bigrams, **58% of them seen exactly once**. A table
that sparse memorizes; it does not generalize.

**A factored model fits comfortably.** Split into root motion and quality:

| model | symbols | cells seen | hapax |
|---|---|---|---|
| joint `degree:quality` | 155 | 729 | 58% |
| root degree only | 12 | 123 of 144 | 17% |
| quality given degree | — | ≥84 obs on every degree but 6 and 11 | — |

So the model is **root motion first, quality second**. That is not just a data
convenience — it matches D34's ruling that chord qualities come from the
accompaniment while the harmonic skeleton is its own object.

---

## 2. Which rules survived contact with the corpus

Every candidate hard rule, tested against all 421 entries before any of them was
written into code:

| candidate rule | holds for |
|---|---|
| every chord has a declared function | **100%** |
| the same degree keeps its third inside one loop | **97.2%** |
| no immediate root repeat | 96.4% |
| no D→S retrogression | 93.7% |
| the phrase starts on a tonic-function chord | 55.3% |
| the phrase ends on a tonic-function chord | 32.5% |
| vii° resolves to a tonic-function chord | 48.3% (of 29) |

**Only the top two are laws.** The rest are costs — and the bottom three are not
even that, for a reason worth stating plainly:

**Corpus loops have no canonical first chord.** The extractor cut each cycle
wherever it found the repetition, so "starts on the tonic" is a fact about
*where the cut landed*, not about the music. Array position teaches nothing
about phrase position, and any generator that learned a start prior from index 0
would be learning the extractor's behaviour.

**The third-flip rule is real, though.** Across 1513 (entry, degree) pairs with
a sounding third, only 43 flip major↔minor inside one loop — and every one of
those 43 is a named device: IV→iv (borrowed subdominant), v→V (raised leading
tone), I→i (parallel mixture). That is a closed set of idioms, not noise. So the
generator pins a degree's third for the cycle and requires `mixture: true` to
break it, while leaving colour (7ths, 9ths, 6ths, suspensions) free — which is
what the other 8.8% of within-loop quality variation actually is.

---

## 3. Where the cadence actually lives

If array position is meaningless, where does cadence come from? Not from theory
— from the **loop wrap**, the transition from a cycle's last chord back to its
first. That is a real musical position no matter where the extractor cut.

Landing on the tonic:

| family | at the wrap | inside the loop | top wrap motions |
|---|---|---|---|
| major | **41%** | 21% | IV→I, V→I |
| minor | **47%** | 22% | V→i, iv→i, bVII→i |
| modal | **68%** | 18% | V→I, IV→I, **bII→I** (Phrygian) |

A 2–4× enrichment, and the top motions are the textbook cadences — including the
Phrygian bII→I showing up exactly where a modal corpus should put it. The
cadence was in the data all along; it just was not at index `n-1`.

The generator therefore scores its final slot against a separate `wrap` table.
A caller who wants a specific cadence *type* declares it and gets a hard filter
on the final chord's function class; a caller who declares nothing gets the
corpus's own cadence habits, which is usually what you want.

---

## 4. Long loops are periodic, not long

Of the 54 eight-chord entries, **37 have halves differing in at most two of four
chords** (11 are exact repeats). This is the "rule of twos" the D47 form research
already found in Toby Fox's writing, showing up in the harmony too.

So a length-8 request is generated as a 4-cell plus a **varied answer**, with the
number of re-chosen slots drawn from the corpus's own distribution (exact 20%,
one changed 22%, two 26%, unrelated 31%) and the changes taken from the end —
same head, different tail, which is the antecedent/consequent shape
`melody-form.md` §1 describes.

This reproduces the corpus's distinct-degree ratio as a *consequence of the
structure* rather than as a tuned repetition penalty:

| | corpus | generated |
|---|---|---|
| distinct degrees / length, at 4 | 0.878 | 0.803 |
| distinct degrees / length, at 8 | 0.574 | 0.494 |

The generator is slightly more repetitive than the corpus. That gap is the
model's, not the truncation's — see the TOPK sweep in `src/lib/harmony-gen.js`,
where widening the shortlist buys novelty but only by reaching into the
rare-quality tail (`7alt`, `7b13`, `13sus`), which is the worse trade.

---

## 5. Data sources — the answer on `awesome-midi-sources`

**That list is the wrong tree for harmony, and the right tree for style.**

Everything on it is *performance MIDI with no chord labels*: Lakh (176k files),
VGMusic, jsbach.net, MuseData, Josquin, midiworld, freemidi, an 800k-file drum
archive. To learn harmony from any of them, every file has to go through our own
chord labeller first — which means **the labeller's error rate becomes the
corpus's error rate**, and D45 was an entire round spent discovering that 75% of
our `^7` labels had no third sounding anywhere. Scaling a labelling pipeline by
1000× scales its mistakes by 1000× too.

D28 already ruled that MIDI is the wrong format for progressions. That ruling
still holds, with one nuance it did not have at the time: we now *do* have a
working labeller (110 Undertale files → 161 progressions), so MIDI→chords is a
real capability rather than a hypothetical. It is just an expensive and lossy way
to obtain something other people have already written down correctly.

**The measurement says we do not need more data for this model anyway.** The
root-transition table is already 123 of 144 cells at 17% hapax. Another 100k
files would not make it fit better; it would make it fit *pop* better, which is
a different thing.

### What more data would actually buy

**Style breadth.** The style tables are per-pack, and `todo.md` has been asking
for bossa nova / waltz / cinematic / synth for a while. That is a real gap and
more corpora fix it. From Ethan's list, **VGMusic** is the one entry worth
taking: it is the same idiom the project already targets, and the Undertale
pipeline works on exactly that kind of sequenced game MIDI. Quality varies
wildly (amateur transcriptions), so it needs the coverage/keyMargin gate turned
up, not down.

**Cadence statistics at scale.** The wrap tables are thin (n = 148/192/81). This
is the one number more data would clearly improve.

### The sources that actually carry harmony

None of these are on that list, and all of them ship Roman numerals rather than
notes to be guessed at:

- **[When-in-Rome](https://github.com/MarkGotham/When-in-Rome)** — ~2000
  analyses of ~1500 works in RomanText (`.rntxt`), CC BY-SA. Tonic-anchored
  functional analysis, which is *exactly* the shape of our `degrees` grammar.
  This is the highest-value single import available. Repertoire is classical
  (quartets, sonatas, lieder, chorales, early music), so it teaches functional
  harmony and cadence, not pop.
- **[CoCoPops](https://archives.ismir.net/ismir2023/paper/000027.pdf)** and the
  **McGill Billboard** corpus — popular music, Roman numerals with timing. The
  right complement to When-in-Rome for the idiom Ethan actually writes in.
- **[ChoCo](https://www.researchgate.net/publication/374059285)** — an
  aggregator that has already harmonized many chord corpora into one schema.
  Worth reading before writing any importer, because it may have done the work.
- **EWLD / Wikifonia** — 5000+ leadsheets with chord symbols.
- **Hooktheory** — the largest pop chord-label set, but the licensing is
  restrictive; not worth the trouble unless it becomes the bottleneck.

**Recommendation, in order:** (1) ear-pass what is built before importing
anything — the model may already be good enough; (2) When-in-Rome, for cadence
and functional depth, since its format needs a transcoder and not a labeller;
(3) VGMusic or a genre pack for the style breadth `todo.md` keeps asking about.
Lakh is last and probably never.

---

## 6. What was built (D49)

- `scripts/build-harmony-model.mjs` → `src/lib/harmony-model.js` — the counted
  prior (`inner`, `wrap`, `qual` per family, and per pack **split by family**,
  because an unsplit style table put a major triad on 40% of minor-key tonics
  and the style prior overrode the mode). `--check` guards it like the ldrolez
  importer.
- `src/lib/harmony-gen.js` — `generateProgression(request)`. D32's procedure
  unchanged: hard filter → cost ranking → seeded choice. Output is an ordinary
  library entry, so `renderProgression`, the voicing lint, the arranger and the
  audition pages all work on it without knowing it was generated.
- `derivation` — a per-slot record of what was ranked and why the winner won.
  This exists for phase 3: an edit needs to know what the choice *was*.
- 96 composed progressions now sit on `audition/progressions.html` beside the
  188 imported ones, behind a `source` filter, playing through the same three
  textures. The question on offer is "does this belong next to the corpus".

### An evidence gate, found on the way

Six entries are now excluded from the counted model, by the same principle as
D45: a label the source material never supported is not evidence.

- `un_famous_elton_john_rocket_man_…` — `match.agree: 0`. Every one of its nine
  chords came out `-#5` (a minor triad with a raised fifth) over a filename
  reading `I-IV-I-IV` and a key the directory contradicts. It was marked
  `needsEar: false`.
- `un_famous_the_verve_bitter_sweet_symphony_…` — also `match.agree: 0`.
- Four Undertale entries with coverage below 0.6.

Worth noting the shape of this bug: the unison importer *recorded* that it
agreed with nothing and then shipped the entry as though it had not.

---

## 7. Ethan's pushback, and D50

Ethan, reading §6: *"i wanted like nice harmonies, not just 'valid' ones… the
idea is that we use popular ones we know to be successful as foundations then
edit the rhythm / patterns a tiny bit and blend them accordingly. is this a
valid strategy or are there possibly better ones?"*

**It is the better strategy, and §1–§6 drifted from a ruling this project had
already made.** The atlas says *"retrieval returns a NEIGHBORHOOD, never a
single entry as the answer; an entry is an example of a family"* — and D49
built a from-scratch sampler anyway.

**Why the counted sampler cannot get there.** It maximizes TYPICALITY, not
quality. Three separate problems, and none is fixable by better counting:

1. **Goodness is not local.** A bigram model can chain individually-common moves
   into a progression with no arc. This is the classic Markov-music failure and
   it is exactly what Ethan heard from the generated MIDI chord sets.
2. **The prior is fitted to what EXISTS, not what WORKS.** 161 of the 421 entries
   are simply whatever repeated inside an Undertale file.
3. **There is no quality signal in the data at all.** Nothing in the corpus
   records that one progression is better than another. 0 of 421 are ratified.

Exemplar variation sidesteps all three: quality is **inherited** from a
progression that already works, rather than synthesized from statistics.

**The one correction to the brief.** "Edit a tiny bit" is doing a lot of work —
a harmonic edit is not small. One chord of a four-chord loop is 25% of the
harmony, and if it lands on the cadence it destroys the thing that made the loop
work. So a variation here is never a perturbation. It is one of eight
operations that music theory guarantees preserve function, each declaring what
it keeps:

| operator | audibility | preserves |
|---|---|---|
| `recolour` | .15 | root, third, function |
| `suspend` | .30 | root, function, every pinned third |
| `rotate` | .45 | every chord and every transition — only the downbeat moves |
| `third_sub` | .50 | two of three chord tones, and the function |
| `mixture` | .55 | the root and the whole root-motion shape |
| `make_ii_V` | .70 | the dominant and its resolution |
| `secondary_dominant` | .80 | the target chord and the rest of the cycle |
| `tritone_sub` | 1.0 | the tritone, and therefore the resolution |

`intensity` is expressed in those audibility units, so asking for a gentle
variation and a bold one reach for different operators.

**D49 is not wasted — it becomes the verifier.** After every operator the result
is scored against the counted model, and **the bar is set by the exemplar
itself**: a variation may not be less idiomatic than the progression it came
from, on root motion, on chord quality, or on the cadence. That is a
non-arbitrary threshold, which a hand-picked constant would not be.

### The exemplar pool is the real dependency

`exemplarPool()` wants entries Ethan has ratified by ear. **There are none** —
and the audition pages have been collecting keep/kill verdicts into
`localStorage` this whole time with no path back into the library. Until that
loop is closed the pool falls back to the `unison-famous` pack, whose provenance
IS commercial success, and says so in a `caveat` field the tests assert on.

**This is the thing to do next, and it is Ethan's to do, not mine.** The
strategy is only as good as the foundations, and right now the engine cannot
tell a good progression from a present one.

### Other strategies considered

- **Rank generated candidates by a learned quality score.** The right long game,
  and blocked on the same missing data — there are no quality labels. The
  keep/kill verdicts are the bootstrap.
- **Global optimization over a whole progression** (tension curve, voice-leading
  across the cycle, cadential strength) instead of chord-by-chord. This attacks
  "goodness is not local" head on and is the strongest complement to D50. Not
  built; worth doing after the ear pass says which variations landed.
- **A neural chord LM.** Needs data we do not have and gives up the
  explainability every other decision in this engine keeps. No.

---

## 9. How to give the engine "good songs"

Ethan: *"just to clarify, how am i supposed to give you 'good songs' outside of
this?"* Fair question, and the first ear pass proves the point behind it —
keep/kill on cards is the narrowest channel available, and the strongest thing
it measured was **transcription error**, not taste.

Ranked by bandwidth, best first:

**1. Drop MIDI files in `audios/`.** Highest bandwidth by a wide margin, and the
machinery already exists: D30/D45 turn a folder of MIDI into progressions,
figurations, key, tempo and form. That is exactly how the 110 Undertale files
became 161 progressions. A folder of songs Ethan loves becomes a pool of
exemplars in one importer run — and unlike a verdict on a card, it carries the
*voicings and the rhythm* too.

**2. Name songs or artists.** Zero effort, lower reliability — MIDI has to be
found and its quality varies. Still much faster than clicking through cards.

**3. Point at ONE moment and say what about it.** *"The chorus of X, the way the
bass moves under the held chord."* Lowest volume, **highest value per minute** —
this is what produced D41's five two-hand principles and D47's whole form model.
A principle generalizes to every song; a verdict applies to one card.

**4. A/B pairs instead of keep/kill.** "A or B" is far easier to answer than
"good or bad", produces a *ranking* rather than a binary, and is not confounded
by mood on the day. Not built; cheap to build, and the natural next iteration of
the audition pages.

**5. Keep/kill on generated songs** (what happened here). Most realistic, since
it judges the actual product — but confounded: a verdict on a full arrangement
mixes harmony, instruments, form and mix, and there is no way to tell from the
click which one was wrong.

**Recommendation: (1) and (3).** Drop a folder of MIDI, and when something in
the output is wrong, say what about it rather than just killing the card.

---

## 10. What the first ear pass measured (D51)

36 verdicts, 11 keep, 25 kill, all from `audition/undertale.html`.

| feature | keep | kill | Cohen's d |
|---|---|---|---|
| **label coverage** | 0.95 | 0.84 | **0.96** |
| quality fit under the model | -0.81 | -1.94 | **0.94** |
| share of plain triads | 0.84 | 0.59 | **0.84** |
| source bpm | 111 | 127 | -0.70 |
| distinct chord qualities | 2.1 | 2.8 | -0.64 |
| chords per loop | 5.6 | 6.6 | -0.33 |
| cadence strength | -1.78 | -1.73 | -0.06 |
| chords per bar | 1.14 | 1.15 | -0.03 |
| worst transition | -2.49 | -2.51 | 0.02 |

**The top row is not a taste finding.** Coverage measures how well the chord
labels explain what actually sounds — a transcription metric. Six kills sit
below 0.80. A good share of the first pass was Ethan rejecting **bad
transcriptions**, and those are the D45 labeller's problem; no amount of
generator work fixes them.

**The real signal is simplicity of chord quality**, showing up three independent
ways (quality fit, plain-triad share, distinct-quality count). The kills are
full of m6, diminished, 6ths and ^7 on chromatic degrees; the keeps are mostly
bare triads. Three separate measures of one underlying thing moving together is
what makes this credible — n = 36 cannot carry the effect sizes alone.

**The bottom three rows are the uncomfortable part.** Cadence strength,
transition plausibility and chords-per-bar predict nothing at all — and they are
exactly what D49's verifier measures. **The verifier is orthogonal to the only
taste data that exists.** That is a reason to keep collecting verdicts before
trusting it, and a reason the taste profile is *not* wired into the generator
defaults yet.

---

## 12. The VGMusic corpus, and the judging instrument (D52)

Ethan: *"can you extract midi from here then build the necessary ui to improve
our music generation... since these are complete songs, feel free to separate
harmony from melody and leverage each to improve its corresponding thing"*

### What was taken, and why VGMusic

400 files, 354 games, from SNES / NES / Game Boy / Genesis. Of everything on the
awesome-midi-sources list this is the source whose FORMAT suits the job: these
are sequenced game MIDI with one instrument per track and the melody usually
alone on its own channel. A scraped piano-roll performance (Lakh) has no part
structure to recover, and separating melody from harmony was the whole point.

Bounded on purpose — §10 measured that transcription quality is what an ear
rejects, and this corpus is amateur transcription. So: at most 2 files per game
(breadth of progressions beats depth of one soundtrack), an 8–90KB size filter,
and a deterministic hash so re-running fetches the same corpus. The `.mid` files
are **not committed**; `src/ingest/vgmusic-manifest.json` is, and it credits
every sequencer by name.

### Three bugs the new corpus exposed

**Percussion was never filtered.** GM channel 10 is drums, and nothing in the
pipeline excluded it. The Undertale corpus is piano arrangements (0.3% of notes)
so it never mattered; game MIDI is **24% percussion across 52 of 60 files**, and
it broke the ingest three ways at once — `splitHands()` picks the highest-mean-
pitch track and a hi-hat pattern wins that, so the "melody" was a drum part; the
chord labeller counted drum-slot pitch classes as harmony, which pushed coverage
under the gate and left **33 progressions out of 391 songs**; and the
Krumhansl-Schmuckler key solve had drums voting in it.

That last one reaches backwards: **both Amalgam entries, which Ethan killed,
had their key mis-solved as B:minor when it is D:major.** He was rejecting a
wrong transcription, exactly as §10 predicted.

**A verdict is only valid for the music that played.** Which means those two
kills are now void. `verdicts.js` records the `degrees` it judged, and the
library overlay refuses to honour a verdict whose entry has since been
re-transcribed — the entry goes back to needing an ear rather than silently
keeping a stale label.

**A third of the "melodies" were arpeggio channels.** After the percussion fix
the profile still read 9 onsets a bar and 90% bar-rhythm repetition — an
ostinato's fingerprint. Game MIDI routinely puts a fast broken-chord part above
the tune. `looksLikeArpeggio()` catches it on three signatures together (bar
rhythm repeats nearly every bar, ≥6 onsets a bar, >35% leaps); 123 of 364 songs
dropped.

### What came out

**Harmony:** 88 progressions, gated far harder than any other pack (coverage
≥ 0.90 against the Undertale pack's 0.48 floor, keyMargin ≥ 0.06, 3–8 chords,
one loop per song). Mean coverage 0.951. Real game-music harmony — Zelda II's
`I-VII-VI-V`, `im-VI-VII-im`, `I-V-vim-iiim-IV-I-IV-V`.

**Melody:** a measured PROFILE, not tunes — D30's ruling stands. And the check
that it worked: two corpora measured independently now agree closely.

| | vgmusic | toby-fox |
|---|---|---|
| step | 0.323 | 0.34 |
| third | 0.214 | 0.13 |
| fourth | 0.091 | 0.12 |
| octave | 0.061 | 0.066 |
| upBias | 0.533 | 0.53 |
| stepInertia | 0.559 | 0.55 |
| leapRecovery | 0.71 | 0.79 |

Before the two filters, `octave` read 0.137 and `step` 0.193 — the divergence
was the contamination, not a stylistic difference.

### The judging instrument

`audition/judge.html` — 36 trials, one question per screen, keyboard-driven.
Three types, one per thing §10 found broken about keep/kill:

- **22 A/B pairs.** Two candidates over the *same* texture, tempo and key. Which
  side is A is decided by a hash of the pair, so an arm never sits on one side
  and a side bias cannot read as a preference. Every pair is a controlled
  contrast answering a stated question: does exemplar variation beat statistical
  composition (6); does a typed substitution help or hurt (8); is composed
  harmony competitive with the pool (4); which corpus is worth mining (4).
- **10 layer trials.** "If something is wrong here, what is it?" — chords /
  chord rhythm / voicing / sound / nothing. The direct fix for §10's confound.
- **4 open trials.** Free text. Lowest volume, highest value per minute.

`scripts/import-verdicts.mjs` detects the judge format and **tallies it** —
answers come back as "varied beat generated 5–1", with a `TOO FEW TRIALS to
call` line whenever n < 8, so a 4–2 cannot read as a result.

---

## 13. Open, for the ear pass

- **Nothing here has been heard.** A6.1 applies to machine output exactly as to
  an import: every generated entry is `ratified: false`, `needsEar: true`.
- The generator is measurably more repetitive than the corpus (0.80 vs 0.88 at
  length 4). Whether that reads as "solid" or "dull" is an ear question.
- Rare qualities from the tail (`o` on degree 7, `bviim` in minor) surface
  occasionally. They are all corpus-attested, but attested at n = 1–2.
- Only cycles are generated. **A progression that does not loop** — a through-
  composed 8-bar phrase with a genuine ending — is not expressible yet, and the
  corpus cannot teach it because the corpus is entirely loops.
- Nothing yet connects a generated progression to a *song*: the audition page
  composes 96 of them, but `scripts/audition-undertale.mjs` still binds
  extracted entries. Wiring the generator into song generation is the next step
  and is deliberately not taken until the ear pass says the harmony is good.
