---
name: motif-engine
description: Generate game/Vocaloid-style songs from a prompt and improve them iteratively by ear. Use when asked to compose, generate, or revise music — especially sung Vocaloid-style vocals with Japanese lyrics, or background music for a game scene. Covers the prompt vocabulary, the listen-and-revise loop, and the measured writing rules behind it.
---

# motif-engine

Prompts compile to whole songs: harmony, melody, accompaniment, drums, an
arrangement, and optionally a sung Vocaloid-style vocal with real Japanese
lyrics. Generation is deterministic — the same prompt and name always give the
same song — so revision is reproducible rather than a re-roll.

> **Naming:** this skill is being rebranded around its Vocaloid focus. The name
> above is the current invocation address; update it and this note together,
> since renaming changes how the skill is called.

## The one thing to understand first

**This engine is driven by ear, iteratively. That is the whole method, not a
nicety.** A prompt gets you a starting song; what makes it good is listening,
saying what is wrong in plain language, and changing one thing at a time.

So the loop is:

1. **Generate** a batch — not one song. Variety exposes which complaints are
   about the prompt and which are about the engine.
2. **Listen** in the browser. The audition page plays in-browser with no render
   step and no cost.
3. **Say what is wrong, concretely.** "The flute is too loud" is actionable.
   "It's bad" is not. Name the layer, the moment, or the feeling.
4. **Change one variable.** Then rebuild and compare against the previous build
   — if a song you liked moved, that is a regression, whatever the new one
   sounds like.
5. **Repeat.** Three rounds of this beats one perfect prompt, every time.

Never skip step 4's comparison. Most regressions in this engine are silent: a
rule meant for new songs reaches an old one and quietly removes something that
was already good.

## Setup

```bash
npm install motif-engine      # the engine: pure JS, no assets, ~9 MB
npx motif-engine              # usage
```

Three tiers, and only the first needs nothing:

| tier | needs | cost |
|---|---|---|
| **Compose + browser playback** | nothing — General MIDI loads from a CDN | ~3 s/song, free |
| **HQ render** (real samplers) | CC0 sample libraries, ffmpeg, sfizz | ~30 s/song |
| **Sung vocal** | a DiffSinger voicebank + a voice model, Python | ~2–3 min/song on CPU |

The engine is AGPL-3.0-or-later. **Sample libraries, voicebanks and voice models
are third-party, are not distributed with it, and keep their own terms.** The
vocal tier in particular needs a voicebank you are licensed to use — see
LICENSES.md. Do not assume a model found online is usable commercially; most
character-voice clones are not.

## Prompts

Two ways in. Both are deterministic.

**Structured** — an emotion and an environment:

- emotions (12): `happy sad calm excited tense scary mysterious triumphant
  nostalgic romantic somber goofy`
- environments (23): `shop fight boss construction stealth snow water desert
  cave lab casino festival kitchen training rest menu aftermath space jungle
  manor catacombs citadel shrine`

**Free text** — a scene description, parsed by `describePrompt(text)`:

> "a lighthouse keeper's last night shift, slow and a little sad"

Prefer free text when composing for a scene. It reads more of the intent
(tempo, instruments, mood shading) than a two-word pair can.

### The prompt is not the only input

**The song's NAME is hashed to pick its key, tempo and voices.** Five names
under one identical prompt gave C, G, A, D and A#, with tempo from 54 to 75.
Two consequences:

- To compare two settings fairly, build both **under one name** and rename
  afterwards. Otherwise you are testing the name.
- If a song is nearly right, do not re-roll it by renaming. Adjust the option
  you mean to adjust.

## Generating a batch

Write a set of scene prompts and generate them together. Ask for **diversity on
purpose** — a batch of twelve songs that are all "excited festival" teaches you
nothing, and the sameness will read as the engine's fault when it is the
prompt's.

Good batch shape: vary energy, tempo, instrumentation and whether a song is sung
at all. Include one or two you expect to fail; they locate the edges.

## The Vocaloid vocal line

The sung line is **composed from rules**, not the instrumental melody sung
as-is. That distinction was measured against 36 Vocaloid transcriptions, and it
is the single biggest quality difference in the vocal tier:

| | engine, before | Vocaloid corpus |
|---|---|---|
| syllables/s | 1.4 | **3.9** |
| stepwise motion | 18% | **48%** |
| phrases starting on the downbeat | 100% | **9%** |
| 2-bar cells returning at pitch | 0% | **31%** |

Rules worth knowing when you ask for changes:

- **One mora per note.** A vowel carried onto a new pitch reads as warbling, not
  expression — it was described as "sounds Indian" by the ear that judged it.
  Melisma is off by default; leave it off unless asked.
- **The chorus is a register and a texture, not a speed.** Up 3–5 semitones,
  with the accompaniment doubling the tune an octave up. It is never a faster
  syllable rate and never a faster harmonic rhythm.
- **Phrases start off the downbeat** most of the time. Pickups are the norm.
- **Every voice sings the same words.** Harmony and doubling parts copy the
  lead's syllable at shared onsets; they never generate their own.
- **A ceiling around G#5.** Above it, held notes read as screaming.
- **A wordless hook is a mode, not a fallback.** `la/na/oh/hum/nyan/meow/doo`
  are legitimate choices where the genre wants them — ask for one.

Lyrics are real Japanese: templates × a tagged lexicon × verb conjugation, one
clause per 2-bar phrase, with clause boundaries kept off rests and long notes
given a word end. The prompt's own words steer the vocabulary.

Three per-song pins decide how the voice sits in the render, and they are
**page pins, never renderer defaults** — a judged song re-renders as it was
heard: `vocalDb` (the voice over the band in its sung spans), `vocalRoom` (0.1
is "a touch of room";
without a pin the voice takes the lead layer's room), `vocalTune` (0 = the
pitch model as it comes, 0.7 pulls the sung pitch 70% of the way to the score
inside each note, 1.0 is a hard-tuned Vocaloid line). The same three exist as
`--vocal-db`, `--vocal-room`, `--tune` on `scripts/render-vocal.mjs`.

**There is no single right `vocalDb`, and that is the finding, not a gap.** It
was set by ear per song, and the pins across the judged pages disagree on
purpose: the common default is **0**, calm songs sit **+1.5**, the energetic
songs on the older vocal page sit **+3**, the rock-lane songs sit **−3 to −4**
with the lower room, and individual songs go to −5. A loudness measurement did
not separate "too loud" from "love this" when it was tried — K-weighted
vocal-over-band put a complained song at 5.2 dB and a praised one at 5.7. So
pin it per song from listening, and do not carry one lane's number to another.

**Vocaloid-form songs** (`opts.vocaloidForm`, the vocarock page): a row names
its verse loop, chorus loop, intro figure + intro voice + intro loop, and an
energy tier. The tier is not a speed: `high` adds a phrased synth hook line,
a four-note pad whose voicing rotates every bar, marcato or a synth rise and a
crash on the seams; `mid` the lighter hook, a held pad and a chorus descant;
`low` is the calm setup measured off the liked ballads — no kit, no bass, a
flowing single-note piano arpeggio, a soft low pad, strings across the tune,
a seventh on every chord. Write the row's TEXT as a player would ("one coin
left at the arcade and the place is about to close"), never as an
instrument list — instruments go on the row's fields.

## Serious music: the slow theme and the layer stack

"Serious" is not "energetic". It is measured, and three numbers separate a
serious theme from a pop one — read off ten anime-battle, adventure and film
themes (Attack on Titan, Demon Slayer, Frieren, Naruto, Solo Leveling,
Interstellar):

| | a pop/Vocaloid line | a serious theme |
|---|---|---|
| notes per bar | 4.9–7.5 | **1.6–3.2**, whatever the tempo |
| median note length | 0.25–0.5 beats | **0.54–1.99 beats** |
| dotted values | ~0% | **15–54%** |
| leaps of a 5th or more | 2–8% | **9–45%** |
| phrases starting on a beat | off-beat by design | **32–98% on a beat** |

The theme is slow because the layers under it need room. Three more rules, all
measured:

- **Layers enter one at a time and stay.** Attack on Titan changes texture
  about every five bars; Interstellar's "First Step" adds five layers over
  eleven bars and never changes the harmony while it does. Plan the entry
  schedule as data — which layer enters at which section, in which register, at
  what fraction of the lead's gain.
- **The support is the SAME LINE at a fixed interval.** 63–100% of theme
  strikes carry another note struck with them, and it is an octave below or a
  third below — not a new rhythm. Octave doubling is 100% of one file's theme
  strikes. The doubling must be quieter than the line it doubles, and an octave
  pair should be two different colours rather than one instrument doubling
  itself.
- **The harmony is Aeolian and slow.** The leading tone carries 0–3% of pitch
  weight on nine of the ten files; the subtonic carries 4–17%. One chord a bar,
  and a pedal that holds one chord for twelve bars is normal.

Counter-intuitive result worth keeping: a well-built pop arrangement already
plays MORE simultaneous notes than these serious themes do (6–9 against 3–6).
"More layers" means more distinct, individually audible entries — not more
notes.

### The ostinato and the bass are a small inventory of one-bar patterns

Counted by how many bars of a file repeat each one-bar signature (onsets in
16ths, pitches as intervals above the bar's lowest note), the whole low end of
these scores is about ten shapes. Attack on Titan alone plays **six different
bass patterns** across 104 bars, and its most repeated bar — sixteen of them —
is an octave pair pushing on 1, the & of 2, 3 and the & of 4.

The ones worth stealing, each with the file that repeats it most:

| shape | what it is |
|---|---|
| the rising cell | R R b3 5 in 16ths, four to a bar, the top note raised a step on alternate bars (AoT, 12 bars) |
| the neighbour cell | R b3 2 b3 R, a half-bar REST, then the same five landing a step higher (AoT) |
| octave 8ths | octave pairs on every 8th, the same bar eight times (AoT) |
| the wandering opening | two octave strikes a bar, the second on beat 4, then 2, then 3, then 3 — still, but never the same bar twice (AoT) |
| 3+3+2 | octave on 1, root-fifth dyads on the two pushes (Demon Slayer, 8 bars) |
| the fifth pump | root on the beat, the fifth on every other 8th (Frieren, 4 bars) |
| the walk down | root, b7, root, b7, b6 inside the bar (Frieren, 9 bars — the file's most repeated) |
| octave alternation | low-high-low-high on 8ths (A world where the sun never rises, 7 bars) |
| no downbeat | enters on the & of 1 and syncopates across the bar (Solo Leveling, 5 bars) |
| pairs | every chord tone struck twice, which is what lets an octave doubling above it read as one voice rather than a flurry (AoT chorus, 85% of that section's pair heads) |
| the frozen riff | four notes that do NOT follow the chord, repeating over a bass that moves underneath them (AoT's odd chorus bars — the same device a Synthesia energy reference plays, from a completely independent source) |

**Varying one of these is a pitch edit, not a rhythm edit.** Mirror it (the
falling cell is the rising one backwards), return to the root on the last
sixteenth instead of doubling it at the start, walk it in scale steps instead of
chord thirds, open it to fifths and the octave, or strike each tone twice. Keep
the ONSETS and the ACCENTS identical and the variations stay comparable — change
the rhythm too and you are no longer varying the pattern, you are replacing it.
One caution, learned by getting it wrong: **verify a transcription against the
file before you build a card on it.** "That riff descends" survived a first pass
and did not survive re-measurement — the bars in question repeat a FROZEN cell
whose contour turns, and the descent was mine. A card that tells someone a shape
came from a particular piece, when it did not, poisons the verdict it exists to
collect.

### Check the GRID before you check the notes

Two separate defects in this library produced the same complaint from a listener —
*"I feel like it's not 4/4"*, *"the next chord shouldn't come in like a half step
early"* — and neither was about pitch.

**A figure transcribed onto the wrong grid is wrong everywhere except the
downbeat.** One ostinato here was written as eight sixteenths; re-measured at the
source's own tick resolution its onsets are exact multiples of a TRIPLET eighth.
Five of the eight were a third of a sixteenth out, and the last was pushed to the
final sixteenth of the bar — hard against the barline, where the source leaves a
gap. Quantize to the grid the file is actually on: check whether the onset ticks
divide evenly by a triplet subdivision before assuming binary. When mining a corpus,
count on a grid that is the **lowest common multiple** of the subdivisions you might
find (48 covers sixteenths and triplet eighths); a miner that can only see sixteenths
will silently turn every shuffle in the corpus into a lie. In one 52-file set,
**8.5% of all repeated one-bar cells were triplet-grid** — and the library built from
that set contained none.

**A figure that does not tile its bar is usually half of a texture.** The other
ostinato above rests across four sixteenths and resumes a sixteenth after beat 3; on
its own the bar reads as 5 + rest + 5 + rest with no anchor. In the source, a second
hand plays all sixteen sixteenths over it and fills every hole. Transcribing one hand
and playing it alone is not a smaller version of the texture, it is a different and
worse one. So: make a row that cannot tile its own bar **name the partner that fills
it**, and enforce it — for a continuously running ostinato, a rest of a quarter bar or
more must be followed by an onset ON A BEAT. Scope that rule to running figures only:
applied to accent patterns it flags the 3+3+2 tresillo, which is among the most
legible rhythms there is.

### When a page cannot have the good audio tier, give it the good tier's samples

A lab whose whole point is that the listener recombines layers at listen time cannot
have pre-rendered audio: sixty toggles is more mixes than exist to render. The obvious
workaround — render one stem per layer and play the selected stems together as media
elements — reaches arbitrary combinations but buys a start-skew and drift risk between
independent audio clocks, on top of a large render and a large download.

The cheaper answer is to stop treating the two tiers as different instruments. A
sampled orchestral patch is a folder of note-named wavs; a browser sampler wants a
note-keyed map of the same files. Build the browser map **from the renderer's own
patch definition** rather than from the folder by hand, so the file, the velocity layer
and any per-sample trim are the same in both places — re-deriving any of those
separately is how two tiers drift apart while both look correct.

Two things that decide whether this works:

- **Carry the corrections, not just the samples.** These libraries' section sustains
  often *swell* — half peak more than a second into the note — and the renderer's
  patch already encodes a measured start offset per sample to skip it. Ship the raw
  files to the browser and you reproduce, on the samples you added to fix a timbre
  complaint, the exact defect the offset exists to remove.
- **Give them page-scoped names.** A shared sample pack is loaded by every page, so
  registering the new samples under the existing instrument names re-timbres every
  previously-judged piece of work at once. New names, marked so the automatic
  instrument-chooser can never select them, plus a test that counts *assignments* of
  those names and fails if one appears outside the page that asked for them. Then
  byte-compare every other page and confirm zero movement.

### Changing a sample set changes how long the notes are

A better-sounding library is usually a LONGER-sounding one: orchestral section
sustains run seconds, where a general-MIDI substitute decays in a fraction of one. If
the player is not told when to stop a note, it plays the sample to the end — so
swapping in the good samples can turn a crisp sixteenth-note ostinato into a smear of
forty overlapping copies, and it will be described as "there's a damper pedal on
everything". Check the note-length limit on every layer the moment the sample set
changes; the two are one change, not two.

The same listening note usually contains a reverb complaint, and it is worth
separating: long notes and a wet room sound alike in a dense mix, and only one of them
is usually the fault. **Usually neither is — see below.**

### The articulation is the fix; reverb and note length are what it gets mistaken for

When a fast pattern sounds like a wash, there are three candidate causes and they are
not equally likely:

1. **The sample has no decay.** Orchestral sustain libraries record a note that SWELLS:
   measure one and the peak can be five seconds in, holding for eight. Every de-swelling
   trick starts the sample past the swell, which hands you a flat-topped block — full
   level until it is cut. Shortening such a sample does not make it decay, because there
   is no decay in it to keep. Measure it as **dB below the note's own peak at a fixed
   offset** (say +0.5 s), never as time-to-a-threshold: a threshold measure returns
   "never reached" for a short file and for a silent one alike, and you cannot tell those
   apart.
2. **The instrument patch holds the note after it ends.** A sampled-instrument definition
   carries a release time, and an orchestral one is commonly 0.5–1.0 s. Against a
   sixteenth note at a normal tempo — about 0.1 s — that is **seven or eight notes of one
   layer sounding at once** before a second layer exists. It is arithmetic, and no mix
   control can reach it.
3. Only then, reverb.

**Check the encoder before you believe any of it.** Trimming a sample usually means a
seek plus a fade, and a seek that happens on the OUTPUT while the fade is computed on the
SOURCE timeline will fade the audio out before the surviving audio begins — silence, with
no error anywhere. This produced 20 silent notes out of 88 in one pack, an entire
instrument among them, and the silence then measured as "this bank never decays", which
became the headline finding of the round until a verify pass decoded the bytes. A test
that asserts declarations will not catch it; **decode one sample per bank and assert
non-zero RMS.** And treat an extreme measurement as a bug report about the measurement:
"never decays" is not a plausible property of a recorded note.

**The fix for 1 and 2 is a different articulation, not a different mix.** Every serious
string library ships spiccato and pizzicato alongside the sustains; they are struck, so
they decay on their own — typically 20 dB down in 0.25–0.55 s against a sustain's never.
Use the sustains for the lines that sustain (a pad, a slow theme) and the struck
articulations for anything rhythmic — and check it at the BOTTOM of the range, where a
struck sample is least convincing and where a shared pitch-split patch is most likely to
be substituting a different instrument. The verification is a **gap-depth** measurement on
the rendered audio: envelope the file finely, and compare the 10th percentile to the
median. A layer that clears between notes shows a gap of 10 dB or more; one that has
become a wash shows 3–4 dB, and a picture of the envelope makes it obvious at a glance.

And when the articulation is wrong for the passage, do not delete the setting — it is
usually right for some other music. The wash that ruins a battle ostinato is a good
ambient pad. Keep it as a named mode and record the condition under which it fits.

### Ask WHICH TIER before diagnosing a sound, and fix the one being listened to

A project with both a live browser tier and a pre-rendered high-quality tier has two
different sound paths, and a complaint about timbre usually belongs to exactly one.
They fail differently: the live tier typically stops each note at its written length
(so it is thin and short), while the rendered tier applies the instrument patch's own
release and the page's reverb (so it is long and wet). A listener who says *"is it just
HQ? with HQ off it sounds bad"* has done the diagnosis for you — they have separated the
tiers and told you which one is broken and that the other is not a substitute.

Two practical consequences. **A page-level setting should drive the renderer, never the
other way round** — if the renderer derives its reverb from the page's own values, taking
the page dry makes the render dry with no renderer change, and no other page moves.
And when a listening note names a page (*"even when I just play one cell"* is a
one-cell-per-card page), **fix that page** — not the one most recently worked on.

**One patch per named instrument.** A sampled-instrument table that maps several names
(cello, viola, violin) to one patch split by PITCH ignores the name: measured, a layer
declared as the violin played cello samples on 93% of its onsets, and no patch in the set
used a viola sample at all. A pitch split is right for an ensemble name and wrong wherever
the name already says which instrument plays. Check the same table for RANGE: notes past a
patch's top fold by octaves silently, which turns a doubling into a unison — 1,338 notes
in one round, found by comparing realized pitch against each patch's declared key span.

### Check that a written dynamic survives into the mix, not just that it exists

A pattern can carry a perfectly good accent profile — say 0.55 to 1.0 across the beat
— and still arrive flat, because accents are usually mapped into a per-layer gain BAND
and the band is narrower than the profile. Mapping `lo + accent*(hi-lo)` with a band of
`[0.78g, g]` turns a 1.8:1 written accent into a **1.14:1** realized one, about a
decibel: audible as "everything is one medium-soft level". Measure the realized min and
max per layer, not the profile in the data.

When widening it, **move the floor down and leave the ceiling where it is.** The
loudest note is what every support-versus-lead rule is measured against, so raising the
top to get dynamic range is a balance regression dressed as a dynamics fix.

### When the number of sounding layers is a user control, the mix needs normalising

Fixed per-layer levels are correct for one arrangement. On a page where the listener
toggles layers, the same levels make three layers too quiet to judge and thirty a wash
— so adding a layer reads as "louder" rather than as a change of texture. Normalise the
sum by the count (equal-power, `sqrt(ref/n)`, clamped at both ends) and let them switch
it off. Multiply the gain; never *set* it, or the per-note accents underneath vanish.

### A layer can be wrong for six rounds and only become audible when something else gets quieter

The single most-repeated complaint in this project's history — six cards across two
rounds — was one accompaniment instrument. It was never found because on a dense page
it is one of seventeen sounds; the moment a sparse lab bed dropped the density it
became the second-loudest thing in the mix and the listener named it immediately.
Two lessons. **Build a sparse bed on purpose when you are hunting a complaint you
cannot locate** — density hides defects, and an A/B lab is also a diagnostic.
And when a complaint SURVIVES a fix, the fix was probably on the wrong layer: check
what the words literally describe (*"the one in the harmony that does the chord
repeats, not the one that plays the melody"* is an accompaniment hand, not a
countermelody) before changing anything else.

### Scoping a fix is harder than making it, and a pin can destroy what it protects

Three attempts at the same one-line change. Keyed on the LANE, it moved nine songs
instead of six — three of them things the listener had already praised, plus every
card of a lab page he had just judged. Switched to the project's standard "pin this
song at round N" mechanism, it was **worse**: that flag is read by other gates as
"this song is pinned", and several capabilities switch themselves off when they see
it, so the pin moved two of the songs it was added to protect — one of them on its
harmony. What shipped is a single opt set on exactly the rows whose feedback names
the layer, which can reach nothing else by construction.

The general rule: **prefer a scope that is impossible to widen by accident over one
that is merely correct today**, and always byte-compare the pages you did not intend
to touch. The build is green either way.

## Craft rules that generalize

These came from ear verdicts but hold as general practice:

- **Support stays under the lead.** Check the *ratio* to the lead, never an
  absolute number. A cap like "no louder than 0.9" does not enforce it.
- **Uniform anything reads as an exercise** — repeated chords, repeated
  ornaments, flat velocity. If a 20-note layer realizes one dynamic value,
  something has overwritten its envelope.
- **Colour is the norm; chromaticism is not.** Diatonic 7ths, 9ths, sus and 6
  chords everywhere. Unresolved chromatic motion reads as a mistake.
- **A non-chord tone needs a step on both sides.** Substituting one note for
  another changes the note but not the line; a passing tone is defined by what
  follows it.
- **A line that holds or repeats must be diatonic.** One that moves may leave
  the key. Parking on an out-of-key pitch is the one shape to avoid.
- **Sparsity is a real ensemble shape.** More voices is not more music — four
  to five simultaneous parts is typical of the reference material, and adding a
  sixth usually costs clarity.
- **Sections should own their harmony.** A real bridge, a real turnaround. One
  loop plus a variation reads generic.

## Traps that cost real time

- **A selection that looks varied may have a pool of one.** Variety comes from
  `hash % pool.length`; where the pool has one member, every song gets the same
  thing. Count the pool before concluding a choice was deliberate.
- **A page generator that emits browser code in a raw template is one stray
  backtick from silence.** Writing the page's JavaScript inside a `String.raw`
  template means a backtick anywhere — including inside an explanatory COMMENT —
  ends the template early, and the failure surfaces as a syntax error pointing at
  ordinary prose. Quote identifiers in those comments instead. (Cost this twice
  in one round.) Have the generator parse its own emitted script before writing
  the file, so the build says so rather than the browser.
- **Measure in the mix, not in solos.** Solo layers are unmasked, so they
  over-report density and overlap. Any claim about how loud or busy something is
  must be checked on the full mix.
- **A clean number is a bug until proven otherwise.** A beautiful 0.0% is
  usually a swallowed error, not a result.
- **A suspiciously BAD number is a bug too.** The same round that measured a
  layer at "55% out of chord" found the layer plays only chord roots — the
  probe was reading a solo (unmasked, bound to the verse harmony) against a
  mix-accurate reference. Both directions of implausible deserve the same
  suspicion.
- **Forbidding things by name does not work.** Lists of banned instrument or
  pattern names have failed repeatedly — the set of bad names is open-ended.
  State what is *permitted*, or clamp by declared data (an instrument's range,
  a part's role).
- **Re-rendering after an engine change will sound different.** If a song was
  judged good, note what it was judged with. A default that changed since then
  reaches it on its next render.

## Reference

```js
import { compileVibe, evaluateSong, hapsByLabel } from 'motif-engine';

// inspect what a prompt compiles to
const vibe = compileVibe({ emotion: 'nostalgic', environment: 'shop' });

// measure a generated song — the probe behind every claim above
const ev = await evaluateSong(`setcpm(120/4)\np: stack(${mix})`);
const haps = hapsByLabel(ev, 0, totalBars).get('p').haps;
// h.value.note is a STRING like "c5"/"eb4"; h.whole.begin may be a Fraction.
// One cycle = one bar.
```

Subpaths: `motif-engine/harness`, `/evaluate`, `/binder`, `/compiler`, `/vibes`.

When something sounds wrong, **measure before changing code.** Nearly every
wrong fix in this engine's history came from guessing which layer was at fault.
