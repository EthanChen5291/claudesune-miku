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
