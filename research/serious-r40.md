# r40 — the SERIOUS set, read out layer by layer

**His ask (2026-09-13), verbatim in the parts that decide things:**

> "all of our energetic songs sound like 'light energetic'. they're good songs
> though so i dont want to change it, i just want more serious prompts to have
> more serious vibes (like romantic waters / nolstalgic snow, or the layerstack
> song, that was serious calm which i really liked, and then there are serious
> fight or adventure themes that have their more epic and serious vibes to be
> more serious. you can do some research to how serious fight/adventure songs
> sound serious. i will attach a few files you should analyze for trends in the
> melody for how it sounds serious, and all the different layers (in attack on
> titan you can literally see them come in one by one). some of my observations,
> the main theme/voice has a very strong, slow ish theme when it's the main
> thing, but it has a lot of layered support (analyze the layers and the layerred
> support) also, the left hand chord that plays by itself after the main theme
> plays at the beginning of attack on titan is really good you should learn that
> (like where the top left hand note hits and then is raised by a note then
> repeat - that pattern when it's just by itself, and then bear in mind the
> layers like the octave left hand low and the other layers in all the songs).
> … like strings work, staccato if needed or as harmony for the voice, many
> serious serum-like synths work, brass works, guitar works, piano works, etc.
> just try to later more. even if it's virtually the same notes or with just a
> interval tweak or octave tweak or slightly different notes, add it! typically
> the more layers the better but just make sure to balance out dynamics. also
> look online for some orchestration techniques too and do some research! for
> where the voice belongs, it's just the melody - bear in mind some parts may
> just be instrumental only though, vocals arent constant, and the harmony
> (non-vocal) does more like sometimes they have their own harmony melody that
> supports the main melody, either by repeating it in a harmony or down an octave
> or its own melody that supports it and is harmonic etc. all the songs ive
> attached aren't just 'energetic serious' but just 'serious songs'. … moreover
> when the vocals arent singing, i notice that the songs give other instruments
> (sometimes) another melody or something"

Also, separately: **"with vocaloids there can be more creative uses (reference to
nyan cat or llevan polka) where it's more of an instrument than a singing. of
course, stick to the current system for majority but just letting you know that's
also an option."**

## What was read, and what these files can and cannot say

Ten MIDI files, all **piano transcriptions** of orchestral / band pieces:
`attack on titan (1)`, `Homura`, `Muzan vs Hashiras`, `Zoltraak` (Frieren),
`The raising fighting spirit` (Naruto), `Solo Leveling S2 OP - ReawakeR`,
`A world where the sun never rises`, `Detach Piano and Organ`, and the two
Interstellar arrangements from the r34 pack (`Interstellar`, `Hans Zimmer -
First Step`).

**They carry no instrument information** (his own "i know you cant see the
instrument info") — every track is a concert grand, so nothing below names a
timbre as a measurement. A LAYER here is a register band plus an onset stream,
and "layers come in one by one" is measured as the active-band / polyphony /
onset arc over 4-bar windows. Analysis only (D95): `scripts/analyze-serious-r40.mjs`
→ `audios/serious-r40/_analysis.json` (gitignored, like every research corpus);
`scripts/dump-serious-r40.mjs "<file>" <from> <to>` prints any span bar by bar.

One methodological correction made during the read: the Krumhansl-Schmuckler key
solver returned the RELATIVE MAJOR on three files (attack on titan read as C
major, Homura as D major, First Step as B minor). The tonic is now taken as the
diatonic pitch class most often struck as the LOWEST note on a bar downbeat, and
its mode from the solved scale. AoT → E minor, Homura → B minor, First Step →
G major. Everything below uses the corrected labels.

## 1. THE MEASURED TABLE

Theme statistics are over THEME BARS only — bars where the upper hand plays a
held note (≥ 1 beat) or ≤ 6 onsets. Measuring the whole upper hand instead mixes
the tune with the 16th ostinato that is often in the same hand, and reports a
"melody" that is neither.

| file | bpm | key | poly | theme bars | theme notes/bar | dur median (beats) | ≥1 beat | dotted | step | leap ≥7st | on a beat | RH support | interval below | LH octave dyads | chords/bar | leading tone |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| attack on titan | 125 | E minor | 3.53 | 51% | 2.66 | 0.66 | 42% | 15% | 45% | 9% | 64% | 63% | oct 58, 5th 14 | 27% | 1.49 | 9% |
| Homura | 80 | B minor | 3.71 | 30% | 1.64 | 1.43 | 59% | 51% | 30% | 45% | 32% | 88% | 3rd 29, 4th 6 | 12% | 1.63 | 2% |
| Muzan vs Hashiras | 138 | E minor | 3.33 | 65% | 2.42 | 0.90 | 37% | 16% | 34% | 32% | 98% | 100% | oct 166, 3rd 7 | 22% | 1.43 | 3% |
| Zoltraak | 142 | G minor | 2.89 | 39% | 1.97 | 0.84 | 33% | 54% | 13% | 39% | 95% | 68% | 3rd 15, oct 14 | 32% | 1.44 | 0% |
| Raising Fighting Spirit | 140 | E minor | 3.79 | 62% | 3.19 | 0.54 | 30% | 17% | 46% | 2% | 54% | 100% | 4th 55, 3rd 22 | 42% | 1.54 | 1% |
| Solo Leveling ReawakeR | 129 | F# minor | 3.70 | 85% | 2.17 | 0.91 | 22% | 37% | 16% | 12% | 15% | 87% | oct 36, 3rd 20 | 21% | 1.47 | 0% |
| A world where the sun… | 140 | A minor | 3.54 | 93% | 2.00 | 1.45 | 54% | 29% | 59% | 10% | 53% | 77% | 3rd 79, 4th 17 | 9% | 1.32 | 2% |
| Interstellar (main) | 95 | E minor | 3.95 | 65% | 3.71 | 0.99 | 96% | 0% | 28% | 32% | 98% | 39% | 5th 10, 4th 8 | — | 1.60 | 0% |
| First Step | 100 | G major | 3.78 | 85% | 4.45 | 0.47 | 1% | 71% | 17% | 40% | 34% | 42% | oct 70, 4th 25 | 32% | 1.06 | 0% |
| Detach (piano+organ) | — | C major | 5.94 | 49% | 2.16 | 1.99 | 93% | 3% | 33% | 10% | 96% | 88% | oct 54, 6th 14 | 9% | 1.35 | 3% |

**The engine, measured the same way on `audition/vocarock.html` (his current
suite, the one he says is good):**

| song | lead notes/bar | dur median | ≥1 beat | dotted | leap ≥7st | on a beat | poly | voices/bar |
|---|---|---|---|---|---|---|---|---|
| vr_rooftop | 5.21 | 0.50 | 26% | **0%** | 5% | 44% | 8.68 | 6 |
| vr_boss | 5.00 | 0.50 | 22% | **0%** | 2% | 47% | 9.15 | 6 |
| vr_station | 7.00 | 0.25 | 11% | **0%** | 2% | 29% | 7.46 | 5 |
| vr_snow | 6.43 | 0.25 | 17% | **0%** | 5% | 36% | 1.96 | 3 |
| (all ten) | 5.0–7.5 | 0.25–0.5 | 11–35% | **0% on every song** | 2–8% | 29–55% | 1.96–9.31 | 3–6 |

## 2. THE SIX FINDINGS

### 2.1 THE ENGINE IS ALREADY DENSER THAN THE REFERENCES. "More layers" is not more notes.

Simultaneous sounding notes: the references run **2.89–5.94**, the engine's
vocarock songs **6.18–9.31** (snow excepted at 1.96). We already play MORE at
once than Attack on Titan does. What separates them is not count:

1. the theme is **slow** — 1.6–3.2 notes a bar against our 5.0–7.5, and a median
   note of 0.54–1.99 beats against our 0.25–0.5;
2. layers **enter one at a time and stay**, so each one is individually audible;
3. the support is **locked to the theme's own onsets** (63–100% of theme strikes
   carry another note struck with them) rather than running its own rhythm.

That is the same shape as D102 ("more layers with their own melody is not a
request for more voices") arriving from his own reference material.

### 2.2 THE SLOW THEME, and the four numbers that define it

- **Density 1.6–3.2 notes a bar** whatever the tempo. Zoltraak at 142 bpm sings
  1.97; Muzan at 138 sings 2.42. The engine's syllable law (r35) writes 4.9–7.2
  and is correct for a Vocaloid VOICE; it is wrong for a theme.
- **Held: 22–96% of theme notes last a beat or longer**; median 0.54–1.99 beats.
- **DOTTED VALUES ARE THE SIGNATURE: 15–54% of theme notes** (First Step 71%,
  Zoltraak 54%, Homura 51%, Solo Leveling 37%). **The engine writes 0% on every
  song on the page.** This is the single largest melodic gap in the read.
- **Phrases start ON a beat**: AoT 22 of 24 phrases at 8th-slots 0 or 8, Muzan 19
  of 23 on the downbeat, Zoltraak 18 of 35. The engine's corpus start table is
  deliberately off-beat (23% on the three off-8ths) because that is what a
  Vocaloid VOICE does — again right for the voice, wrong for a theme.
- **Leaps are large and common**: intervals ≥ a fifth are 9–45% of theme
  intervals (Homura 45%, First Step 40%, Zoltraak 39%, Muzan 32%). Ours: 2–8%.
  Muzan opens 14 of its 23 phrases with a downward leap of −7 or −9 semitones.
- **The peak comes EARLY**: mean peak position 15–43% into the phrase (AoT 15%,
  First Step 18%, Homura 20%, Zoltraak 29%). Our walk arches at the midpoint.

### 2.3 "THE LEFT HAND CHORD THAT PLAYS BY ITSELF" — his named figure, measured exactly

Attack on Titan, **bars 9–20, the left hand alone** (the upper hand is silent for
twelve bars; the analysis's `aloneRuns` finds exactly this span):

```
bar 9:  E2 E2 G2 B2 | E2 E2 G2 B2 | E2 E2 G2 B2 | E2 E2 G2 B2     (16ths, one cell per beat)
bar 10: E2 E2 G2 C3 | E2 E2 G2 C3 | E2 E2 G2 C3 | E2 E2 G2 C3
bar 11: …B2 again    bar 12: …C3 again, alternating to bar 20
```

Relative to E minor that is **R R b3 5** in 16ths, four times a bar, and **the
top note of the cell is raised one scale step on alternate bars, 5 → b6** — his
"where the top left hand note hits and then is raised by a note then repeat",
exactly. Two properties make it work and both are measurable: the bass note never
moves (a twelve-bar tonic pedal, harmonic rhythm 1.0), and the ONLY thing that
changes across those twelve bars is one 16th slot.

At bar 21 the tune enters over it, and the identical cell continues an octave up
(E3 E3 G3 B3 / E3 E3 G3 C4) for sixteen more bars while a second left hand plays
a moving bass line (E2 G2 F#2 G2 E2 …). The cell is the song's floor for 28 bars.

### 2.4 LAYERS ENTER ONE BY ONE — the two clean examples

**Interstellar "First Step" (3/4, G major/E-ish modal), the additive build:**

| bar | what enters | register | what it plays |
|---|---|---|---|
| 0 | ostinato ALONE | C4–E4 | 8ths alternating E4/C4, six a bar, four bars |
| 4 | theme, in OCTAVES | A3+A4 | one held whole note per bar |
| 5 | — | | the ostinato's LOWER note follows the chord (C→D); its top note E4 never moves |
| 7 | theme moves; bass enters in octaves | A2+A3 | theme in quarters A–B–C over a doubled bass |
| 11 | low bass | F1+F2 | two octaves below, held; theme reaches E5 held two beats |

Five distinct events in eleven bars, each adding ONE thing, the harmony never
changing under it. This is the "cathartic ostinato" of the orchestration
literature (Lehman: a 4-bar cell repeated N times, each repeat adding
instruments, never varying the tonal organisation).

**Attack on Titan:** bars 0–7 theme + bass only (2 onsets a bar in each hand) →
bars 8–20 the pedal cell ALONE → bar 21 theme enters over it → bar 29 the theme
is doubled at the octave (G5+G4) and the bass splits into an octave pair →
bars 68+ the chorus: the tune in octave pairs on 8ths over a pushed octave bass →
bars 76+ the same material lifted a further octave (G6+G5) with sustained
four-note chords added underneath → bar 84 strips back to one voice + held
chords. The layer-event timeline the analyser prints for it has **20 changes over
104 bars**, i.e. one texture event every ~5 bars.

### 2.5 THE SUPPORT UNDER THE THEME: same onsets, a fixed interval below

`RH support` in the table is the share of theme strikes that carry at least one
more note struck at the same instant, and the interval histogram says what that
note is:

- **Octave doubling dominates the loud songs**: Muzan 100% of theme strikes, 166
  of 177 at exactly −12. AoT 63% with 58 octaves. Solo Leveling 87%, 36 octaves.
- **Thirds dominate the lyrical ones**: A world where the sun never rises 77%
  with 79 thirds; Homura 88% with 29 thirds.
- **Quartal for the Naruto theme**: 100% support, 55 of 99 at a fourth below.
- The left hand doubles ITSELF at the octave on 9–42% of its strikes (Naruto 42%,
  Zoltraak 32%, First Step 32%, AoT 27%).

So his "even if it's virtually the same notes or with just an interval tweak or
octave tweak" is the literal mechanism: the second layer is the SAME LINE at a
fixed interval, not a new rhythm. The orchestration literature agrees and adds
the balance rule: *"the doubling must be quieter than the main line"* (Belkin),
and octave pairs should be two different colours rather than one instrument
doubling itself (Rimsky's blend pairs: violin+trumpet, viola+horn, cello+horn).

### 2.6 THE HARMONY IS AEOLIAN AND SLOW

- **The leading tone is essentially absent**: 0–3% of pitch weight on the raised
  7th on nine of ten files (AoT 9% is the outlier, and it is the V7 at bars
  88–99). The subtonic b7 carries 4–17%. The literature's rule matches: natural
  minor is "nearly obligatory", with emphasis on the minor v and bVII (Lehman).
- **Harmonic rhythm 1.06–1.63 distinct chords a bar** — mostly one chord a bar,
  and AoT holds ONE chord for twelve bars in the pedal section.
- **Measured loops** (as the labeller reads them, relative to the corrected key):
  AoT `i bVII bVI bVI` and `I i bIII bIII^7` and `bVI bVI Vsus V7`; Naruto
  `i i i bVI` (four times) and `i bVII i bVII`; Zoltraak `i i i i` and
  `IVsus bVI2 IVsus bVI2`; Muzan `vi7 iv7 v7 v` and `bVII i V bVII`; Solo Leveling
  `bVII bVII bVI^7 i7` and `bVII iv i7 bVI^7`; Interstellar `i7 bIII6 iv bVIIsus`.
- **Caveat, stated because it would otherwise mislead**: the quality histogram
  reports plain minor triads as the most common label on every file. That is
  partly an artefact — an auto-labeller reading a two-hand reduction with a
  moving top voice under-reports extensions. It is evidence for pedal-and-open-
  fifth writing, NOT evidence against the taste canon's "colour is the norm".

## 3. THE ORCHESTRATION RESEARCH (web, his "look online for some orchestration techniques")

Full notes with URLs in the round's scratch file; the load-bearing items:

1. **The additive unit is one 4-bar cell repeated, layers added per repeat, the
   harmony unchanged.** Inception "Time": thirteen repeats, peak at 9–10, then
   "yanked abruptly back to an exposed piano texture" for the last three.
   Interstellar "Cornfield Chase": five repeats. (Lehman; Tholin 2024.)
2. **Rhythmic layers subdivide progressively as they enter** — whole notes →
   quarters → staccato 8ths → 16ths — and the harmony layer is the first and
   last thing heard. (Tholin's transcription of "Time".)
3. **Crescendo order**: strings/winds → brass → percussion; never all the brass
   at once; end on the extreme registers. (Belkin.)
4. **The big tune is three octaves** — high violins / violas an octave down /
   horns an octave below that — and it "will become wearing if continued too
   long", i.e. it is a climax device, not a default. (Sound On Sound / Rimsky.)
5. **Doublings must be quieter than the main line** (Belkin); a sustained line
   dominates a staccato line at equal dynamics; brass is foreground by nature.
6. **Ostinato practice**: rhythm and contour fixed, pitches nudged to fit the
   chord; the 3+3+2 8th cell; harmony-independent cells are attested in Zimmer
   (Interstellar's Phrygian ostinato "neither follows the base chord nor the
   melody"), which is the same freeze the r22 reels and the r30 rise both show.
7. **Serious calm = Interstellar**: a 16th arpeggio cell, three chords stepping
   up and resolving on the root, four-bar cell × 5 with a layer per repeat, a
   4-note slow theme over it, and **no drums anywhere in that score**.
8. **Heroic theme traits**: rising 4th/5th opening, dotted rhythms, anacrusis, a
   4-bar cell repeated; apex on b6 harmonised by bVI; bVI–bVII–i cadence.

## 4. WHAT WAS BUILT FROM THIS (r40)

`src/lib/serious-layers.js` — named rows, addressed by name only (D95/D119):

- `SERIOUS_FIGURES` — `sr_pedal_cell` (§2.3, his AoT figure, with the raised top
  note on alternate bars), `sr_osc_third` (First Step's frozen-top oscillation),
  `sr_motor16_dyad` (Naruto's syncopated 16th root-fifth motor),
  `sr_answer_stabs` (Naruto's four-note block chords answering the theme on beats
  3–4), `sr_octave_bass_hold` / `sr_bass_push` (the measured octave basses),
  `sr_gallop_octaves` (AoT's chorus riff in octave pairs), `sr_chorale_hold`.
- `SERIOUS_LOOPS` — Aeolian four-bar loops with no leading tone, each carrying
  the file it was measured from.
- `SERIOUS_STACKS` — the ENTRY SCHEDULE as data: which layer enters at which
  tune section, in which register, at what fraction of the lead's gain.

Generator: `opts.serious` (opt-in, page-only, `ruleFresh(40)`-gated) adds the
stack's layers one at a time, switches the melody writer to THEME mode
(`vocalWriter: { theme: true }` — 2–3 notes a bar, dotted values, beat starts,
early peak, big leaps), doubles the theme an octave below on a contrasting
family at 0.55 × the lead and a third/sixth below at 0.45 ×, and hands the theme
to an INSTRUMENT in the sections where the voice rests (his "when the vocals
arent singing, i notice that the songs give other instruments another melody").

Page: `SERIOUS=1 node scripts/audition-songs.mjs` → `audition/serious.html`.
