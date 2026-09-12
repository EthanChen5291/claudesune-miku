## NEW — your first Vocaloid-page export is in (14 cards, 3 keeps, 13 notes) — D140 (r36, 2026-09-12)

Every note measured and fixed; the three keeps (reflection, lullaby, march)
are pinned and byte-identical on their music. **Open `audition/vocaloid.html`
with HQ ON + Vocal ON** once the re-render finishes (every card now has
⬇ wav / ⬇ vocal wav download links; `npm run listen` serves the pages at
http://localhost:8765 if your browser opens the wav instead of saving it).

What your ear found, and what it was:
- **"Indian fluctuation … held and different notes" (villain, cafe, sugar,
  march)** = MELISMA. Short notes after another note continued the previous
  vowel on a new pitch (an r34 rule for instrumental ornaments); the writer's
  16th pairs triggered it on 46–66% of those songs' notes, 0% on the ones you
  liked. Now every note takes its own mora (a 16th pair is two syllables).
  March is re-sung under the law with its music untouched.
- **"multiple voices should say the same lyrics" (chase)** — the harmony voice
  now copies the lead's syllable at every shared onset (168/168 on villain).
- **"flute/woodwind off key" (android, cafe, sugar) and "violin too loud"
  (corridor)** were all the CHORUS DOUBLE: a clarinet/flute an octave over the
  voice, in key but exposing the converted singer's pitch drift. It now plays
  on the accompaniment's own piano/e-piano at half the lead, as the corpus
  does; string support under a sung lead is ×0.6.
- **"too loud" voice (rooftop, corridor, kitchen)** — per-song levels −5/−3/−4
  dB; festival lane −4 by default ("for energy like festivals … much softer").
- **"vocals as a layer/whisper for scary"** — `vocalStyle: 'layer'` on villain
  and corridor: low-passed, wetter room, quieter. A true whisper timbre is not
  in this voicebank.
- **"excited but in minor" (fireworks) / "doesn't fit excited" (opening)** —
  both had hashed onto the same ii-m9 city-pop loop. A bright-pool rule
  (major tonic, no foreign roots, ≤⅓ minor) exists now, but only TWO clicked
  major exemplars pass it, so these two are pinned on I V vi IV and IV I V vi
  served raw. **Clicking keeps on bright major progressions grows that pool.**
- **"Alberti too quick at 176 … too fast" (chase)** — 152 bpm, acc pool runs
  the metronome test (now broken tenths).
- A keep click on this page CRASHED the build (an r34 index under the old
  gate) — fixed and guarded.

Renders are DONE (every vo_ song sung once with the real lyrics from the
parallel session's writer — D141; the harmony voice sings the same words).
`audition/vocalab.html` is retired on your overrule ("i want a diversity of
other vibes") — its remaining renders were stopped; listen to vocaloid.html
and the r37 session's `audition/band.html` instead.

Still open: kitchen "more serious than goofy" (only the voice level was asked
for; the block-chord acc is the other half), the lab page re-render, the
fluid tempo, chorus acc thickening. A peer session is replacing the random
moras with real lyrics; the re-sing of both pages waits for it.

## NEW — the Vocaloid read-out, the vocal writer, `audition/vocalab.html` + `audition/vocaloid.html` (r35, 2026-09-12)

Your 37 Vocaloid MIDIs (staged at `audios/vocaloid-r35/`, gitignored) are read
out in `research/vocaloid-r35.md` — twelve laws of a sung line, each with the
engine's own number beside it. The short version: our voice had the RANGE
right and nothing else — 1.4 syllables/s vs 3.9, leaps where the corpus
steps, every phrase on the downbeat (corpus 9%), no returning hook, 15% out
of key vs 4%, no chorus lift, no chorus double.

What to listen to (HQ on, Vocal on):
1. **`audition/vocalab.html`** — 27 sung A/B variants on 10 cards, ONE
   variable each (rate/starts/breath also nudge the drum level ≤7%; the tempo
   card moves everything the tempo moves). The first card (`vl_writer_lead` vs `vl_writer_writer`) is
   the whole round: the old lead sung as-is vs the new rule-written line.
   Then: syllable rate 2.4/3.9/5.2 · phrase starts · breath length · chorus
   lift 0/+4/+8 · chorus octave double off/0.7/1.0 · companion · 120 vs 180 ·
   hook fixed/varied/fresh · **a second SUNG voice a third below: none /
   chorus / all** (your "by chorus I meant the harmony for voice"). Each card's `why` states its hypothesis and
   question — answer the question, not the song.
2. **`audition/vocaloid.html`** — 14 songs from one-sentence DESCRIPTIONS,
   every chorus with the second sung voice a third below
   (the card shows the sentence and how `describe.js` parsed it). If a parse
   reads wrong to you, say so — the parser is a synonym table, easy to fix.
3. Export both pages' JSON when done (`page: r35-vocalab` / `r35-vocaloid`).

Not built (measured, deliberately left): a FLUID tempo (your "human isn't
just a constant static tempo" — a render-tier question, next round) and the
chorus's accompaniment THICKENING (verse 1 note per strike / chorus 2, ×2.5 strikes) — it needs a
per-letter figure change in the travel machinery and is a round of its own.

# where things stand — r35

## NEW — your first vocal-page export is in (16 cards, 1 keep, 15 notes) — D138

Everything your cards named is measured and fixed; **open `audition/vocal.html`
with HQ ON + Vocal ON** — all 16 mixes and vocals are re-rendered (the
"too loud" voices now sit 0.3–3.0 dB over the band where they sat 3.5–5.2;
the six you praised are untouched at their judged level).

What your ear found, and what it was:
- **"screaming" notes** (boss #8, space-vg #5) — both were A5 held 0.7 s.
  The singer now folds any note from A5 up that is held ≥ 0.5 s (short A#5/B5
  passes in romantic_rest and shop-vg's held G#5 were fine and stay).
- **"random cymbal in the middle of the section"** — two bugs: the crash was
  an 8-bar cell that ignored the form, AND the crescendo sample peaks 1.4 /
  3.6 / 7.1 s after it starts (three lengths, picked at random by the render)
  so it peaked bars into the next section. Now one short crash per drop,
  started 1.44 s early so its PEAK lands on the downbeat (boss: bars 16 and
  48; tense_fight and fight-vg: 8 and 16).
- **guitar "sustaining → white noise" (5 cards)** — every part you disliked was
  the ringing open chorus; every part you liked was palm-muted. Unpinned
  songs are muted throughout: octave chug on B, a 3+3+2 push on the bridge
  letters (your "spamming the same chords"), drier room. Casino and
  festival-vg keep the open chorus you liked. Guitar removed from happy_shop
  and excited_festival ("doesn't fit"), trimmed x0.75 on space-vg and water.
- **"voice too loud"** — no measurement separated your too-loud cards from
  your loved ones (both ≈ 5 dB over the band), so it is your law as data:
  energetic songs 0 dB over the band, calm +1.5; fight-vg −1.5 ("still"),
  shop-vg −1 ("way"), water 0; the +3 songs you praised stay at +3.
- **jungle "random fast off-beat synth"** — the kalimba takeover was playing at
  0.89 under the voice because the guide wrapped the wrong layer (an index
  bug). 0.40 now.
- **festival-vg "really high woodwind"** — the C-section handoff put the tune on
  an electric piano at C6–C7 for 8 bars, with the clarinet companion at 84
  beside it. Handoff off, companion an octave down (max 72).
- **training-vx "spamming piano"** — the acc hand ran at 0.9–1.0 against a 0.45
  guide. Electric piano at 0.6x.
- **snow (your keep) "piano a bit too loud"** — acc x0.8, everything else
  byte-identical to what you kept (a new `keepFresh` pin makes a keep click
  on this page stop retracting what you heard).
- **shop-vg "strings start soft and get loud … a vst thing"** and **water
  "violin much too loud"** — you were right that it is the instrument: VSCO's
  soft string layer is RECORDED as a crescendo (half its level at 1–3 s,
  full at 5–7 s). The patch now skips into each sample past the swell
  (0.92 s → 0.04 s to half level). Also found: the string patch had **no
  violin samples at all** since D80 — every "violin" was a stretched viola.
  Fixed. The horn (shop-vg's sustained support) is on VSCO now too.
- **training-vg "melody doesn't sound good"** — re-rolled the tune (eight
  candidates measured; the most stepwise, least zigzagging one is pinned).
- **rest "glitch at the very beginning"** — nothing measurable in the first
  1.5 s; a 20 ms head fade is on every vocal mix. If it persists, tell me
  which tier (HQ off / on).
- **guitar "white noise", second cause** — the amp was lifting the guitar's
  silent gaps to about −35 dB (hiss between notes); a gate keyed on the dry
  guitar now shuts them (−59 → −68 dB on training-vg, notes untouched).
- **horn chords in HQ** — the VSCO horn stops at B4 and the octave fold was
  collapsing its dyads into unisons; chords now fold as a whole (boss 22 → 10
  unison events, training-vx 40 → 20). A write-side ceiling is next.
- **HQ drums "way too loud" (your poplab axis card)** — measured cause: the
  HQ mix levels each stem to the same gated loudness per written gain, and
  for a one-shot that puts its HITS ~5 dB over the piano's loudest moment
  (kick −18.9 vs piano −23.5 dB, 100 ms). PROPOSED, not shipped: level
  percussion by its momentary peak instead. It would move every drum song's
  HQ mix, so it wants a page for your ear first.
- **festival-vx "can't hear the accordion in HQ"** — OPEN. Measured: the HQ
  mix levels each stem to its written gain (accordion ≈ 4 dB under the
  piano, as written). The guitar is gone from it; the browser tier's own
  per-patch loudness is what differs and I have no measurement of it yet.

Nothing on `audition/songs.html` moved (0 of 47). Nothing committed.

## NEW — your poplab export is in (16 "good", 14 cards marked, 6 labels)

Imported to `src/lib/pop-lab-labels.js` (D138 addendum 5). Three of your
lines change what gets built next: "chorus" = vocal HARMONY (a second sung
voice), not a section; "human" includes a fluid TEMPO, not just accents;
genre is layers/voices, not the chords. Your hi-hat "way too loud with HQ
on" is measured below. 19 cards unseen, 15 of them in the answered-by-
default tail; the four still worth your ear: 13 breakdown grades, 38
melody anticipation, 41 melody thickness, 7 tresillo comp.

## NEW — `audition/poplab.html` trimmed to what needs your ear (your "filter the problems after question 9")

18 cards ask for your ear (1–9 as before, plus 13 breakdown grades, 14 intro
length, 17 layer entry pickup, 24 axis rotation, 25 colour dose, 35 hook
repeat, 38 anticipation, 41 melody thickness, 44 frozen tresillo). The other
26 now sit LAST on the page under an "answered by default — skip unless you
disagree" banner, the expected answer behind a click so it cannot anchor you — they are
music knowledge the engine already acts on (LH class = genre, terrace =
build, backbeat = pop, borrowed chords by parent mode, cadence closes, …)
or near-duplicates of an earlier card. All 44 stay playable and markable, so
a disagreement is still one click.



## NEW — the Top MIDI Tracks Pack read-out + `audition/poplab.html` (your 2026-09-12 ask)

The new folder was `Top MIDI Tracks Pack (Free)`: 421 piano arrangements of
pop / film / classical / anime / Zelda OoT, labeled by title. All 420
readable files were read (`research/toppack-r34.md`, ~1,800 lines — four
lane sections: progressions, left hand + rhythm, melody, form + layers +
vibe mixing), every song hand-labeled by lane / emotion / energy from its
title (NOT your verdicts — say where a label is wrong and the numbers recut).
What it says, in one breath: pop piano is PLAIN (colour on one chord per
loop), the loop's ROTATION carries the emotion (I-start = sad/happy, vi-start
= calm/romantic), the left hand lives on the 8th grid and the chorus drops it
an OCTAVE rather than thickening it, the melody repeats a 2-bar cell and
varies it by re-fitting the landing (never by transposing — the pack agrees
with you), the tune starts at bar 0, a real pop breakdown thins the left hand
and keeps the tune, and every pop drum groove has a snare on 2 and 4.

**Open `audition/poplab.html`** — 44 experiments, 208 variants, each a
measured finding + a hypothesis + a question for you, separate playable
variants with ✓/✗ marks and note boxes, HQ toggle like the other labs. Play
the reference first, then the variants; mark ✓/✗ on each; the card verdict
is for the experiment. Copy the labels JSON → I import it with
`node scripts/import-poplab.mjs <file.json>`. Every hook on the page is new
material written from the pack's rules (no copyrighted tune is transplanted).
The questions your ear settles: is the loop rotation audible; at what dose
does colour leave pop; does the left-hand class alone name the genre; is the
chorus the octave drop or the class change; is one anticipation a lean; 8th
vs 16th vs the old final-slot 16th; is one landing-note change audible at
all; which breakdown grade is "the piano disappears"; does a class change at
constant loudness read as a chorus.


## Real Japanese lyrics (r36, your "it should actually produce real japanese lyrics, of course with parts bound to the melody")

The random-syllable pool is gone. Every sung line is now a Japanese SENTENCE
written from grammar (23 clause shapes over ~200 words, verbs conjugated) and
bound to the tune: a word never crosses a rest, a long note gets a word
boundary or a held vowel, every note keeps exactly one mora, the chorus sings
the same words on every return, verse 2 gets new words over verse 1's tune,
and the vocabulary follows the prompt (a rainy goodbye sings ame / eki /
namida, the cafe sings koohii / asa / mado, the corridor sings gakkou /
ashioto / kage). Each vocal card gets a **lyrics** fold-out (kana / romaji /
English gloss per line, ↻ marks the chorus returning) once the songs are
re-rendered — the other session's render loop re-sings all of them with the
new words; until then the old wavs still sing the old syllables. Nothing
stored is a line from any song (a test enforces "words, not lines"); the
lines are J-pop fragments, not a story across verses — say if you want that.
`--lyrics pool` on export-vocal reproduces the old lines for any song.

**It doesn't have to be words (your follow-up).** A vocalise is now a mode,
not a failure: **la / na / oh / hum / nyan / meow / doo-bi-doo / pa-ra-pa /
nonsense babble**. Three ways it gets picked, in order: you pin it on the song
(`lyrics: 'meow'`, `'la:mixed'`, `'none'`); the description says so ("meow
instead of words", "humming", "a scat chorus", "tongue-twister" → nonsense);
or the emotion's own pool decides, at a genre rate — goofy songs 60% of the
time, happy/excited 35%, calm/sad 20%, tense/scary 10%. The default is MIXED:
words through the song with a wordless tag on the **last line of the chorus**,
returning every time the chorus does, never more than a third of the song. As
it stands 10 of the 30 sung songs carry one. Say "all meow" or "no la la" on
any song and it does that instead. The lyrics fold-out on each card names the
plan and tints the wordless lines gold.

## The vocal suite — `audition/vocal.html` (your "suite ... mostly energetic" + "vary the lyrics")

Ten new songs, each sung: eight energetic (excited festival, triumphant
boss, happy jungle, excited space, excited casino, tense fight, happy shop,
excited training) and two ballads (nostalgic snow, romantic rest). Open the
page, **HQ: ON**, **Vocal: ON**. What changed to make them "primarily vocal":

- the instrumental lead and anything that doubles it play at 0.45 as a
  guide under the voice; the companion and any alternate melody stay full —
  a second independent line beside a singer is the corpus norm, a double is
  not;
- the voice sings the lead AS THE MIX PLAYS IT (later letters, varied
  returns, handoffs) — the first pass sang from the solo loop and lost 54 of
  96 notes on tense fight;
- the energetic eight get a kit with a snare (backbeat) under the voice.

The lyrics are now generated Japanese, one mora per note, built from the
words Miku songs lean on (kimi / boku / sekai / koe / sora / yume / hikari /
kokoro / mirai / namida …) with particles and verb endings so a line scans,
set phrases (arigatou, sayonara, daisuki, doki doki, kira kira) and the odd
"ra ra ra". A returning phrase sings the same words (keyed by contour, so a
varied return still gets its hook): calm water's 16 lines collapse to 5.
Lines are two bars long with a breath between, and each line is placed by
octave into a singer's range. They are words, not sentences — if you want
real lyrics that mean something, that is a prompt field and a proper
phrasebook, not a pool.

**Your verdict noted:** "guitar fits pretty well as a subtle layer i like
it actually" — the quiet rhythm guitar under the voice stays the default on
vocal songs (CLAUDE.md, D137). The louder guitar-MAIN mode is separate and
genre-gated. **Six guitar-main songs** are on the page (vg_*): anime-opening
J-rock (fight), power pop (festival), sports-anthem rock (training),
Vocaloid electro-rock (space), city pop (shop), a guitar ballad (water) —
guitar intro riff, louder rhythm guitar, and the guitar in unison with the
voice for the last chorus; five of six on the hand-authored J-pop / city-pop
idiom progressions. The other session's toppack-r34 analysis is not written
up yet; when research/toppack-r34.md lands, I take notes and generate again.

**Electric guitar (your ask):** we had none, now we do. Every suite song
carries a J-rock guitar layer under the voice: palm-muted 8ths or a 16th
gallop in the verse letters, open power chords with the octave in the
chorus, a clean arpeggio on the two ballads — figures over the song's own
chords at octave 2. HQ tier: Unreal Instruments' free "Standard Guitar" (a
Japanese DI library) through a Neural Amp Modeler crunch capture, headless
(D136). With HQ off you hear the browser's GM guitars instead. If the
verse chug is too much under the voice, the gains are per-figure in the
guitar block and the amp capture is one path in hq-instruments.js — say
which song.

Levels: the voice sits +3 dB over the band in its sung spans by default;
your two notes are pinned on the page (training 0 dB, romantic rest +1.5).
Rendering: `node scripts/render-vocal.mjs <name> --page audition/vocal.html`. Every score, dry vocal, converted vocal and mix is measured
(pitch within 50 cents, onset lag by pitch arrival, octave errors) — the
table is in D135's addendum.

## Vocal tier: vs_calm_water sings (your "compose with hatsune miku")

`node scripts/render-vocal.mjs <song>` now sings a song's tune and lays it
over the HQ render. Open `audition/songs.html`, turn **HQ: ON** and
**Vocal: ON**, and play **vs_calm_water** (it carries a VOCAL badge). What
you are hearing, stage by stage, all measured (D134):

- the tune is the piano lead shifted down an octave (its median was C6),
  sung only in the 30 bars where the mix actually plays it — the 4-bar
  intro and the two breakdown bars stay wordless;
- a free DiffSinger voice (Tiger) sings it on "la" per note, breaths at
  phrase starts, the engine's own accent envelope as dynamics; its pitch
  model writes the portamento and vibrato (0.13 semitones median deviation
  from the score — ornaments, not a new tune);
- a community Miku RVC model replaces the timbre (pitch survives: 95.5% of
  notes on pitch, 0 octave errors, onsets on the beat to within 11 ms,
  presence band +3.2 dB);
- the vocal sits 3 dB over the band in its sung spans (your "i dont hear
  the vocals" — it had been mixed under it) and gets the lead's room.

Not the real Miku: every free "Miku" is trained on Vocaloid output and
Crypton has no public position on it — fine to audition locally, not to
release. Real lyrics are the next input if you want them (right now it is
"la"; `--syllable ah|na|oo|auto` are the other options). If the register
is wrong for a song, `--octave N` pins it. Other songs: same command; each
needs its HQ render first. Rendering takes ~7 min a song on CPU.

## Batch-2 verdicts in (17/17 good) — batch 3 is on the page: 33 new experiments, positions 72–104

Your second export: every batch-2 experiment good, none rejected. What it
settled: development by adding octaves is inaudible (gijoe "barely
different"), groove regroupings are wrong for nature material (hexarp
dotted "really groovy for a relatively serious/natural vibe"), density is
not a main beat (you heard the dense tier as the buildup and the kick-snare
groove as the main beat), rush's "third and fourth still slower" survives an
identical bass so the falling pad is the suspect, and removing rocking /
sparseness / frame from the human melody broke nothing — so batch 3 hunts
the load-bearing property with an ALGORITHM instead of my hand.

**The sad-shop strings (your question, corrected for "I listened with HQ
on"):** with HQ on, sad shop's strings are the VSCO cello/viola sections
rendered through sfizz — real bowed recordings with a 0.7 s release on
every note, the SOFT velocity layer selected by the whisper gain (0.21), and
the room rendered as convolution reverb. The labs page played the browser
soundfont, which cuts every note 10 ms after it ends. On top of the tier,
the writing differs: sad shop holds every note at least a beat, two attacks
a bar, eight velocities, five interlocking string layers under the piano;
the robotic ones were dry, 0.40–0.45, four or five equal attacks a bar,
alone or as the lead. So the labs page now has the same **HQ: off/on**
toggle as songs.html, and every batch-3 variant has an HQ render — judge
the strings cards with HQ on to hear the tier you compared against, and
with HQ off to hear the level/reverb/envelope variables cleanly (the HQ mix
levels stems by loudness, so level differences are compressed there). Full
numbers in research/variation-labs-r33.md §12.

Batch 3 (positions 72–104), judged 71 byte-frozen:
- **melody generation (14 cards)** — the gesture grammar as a program
  (seed + rule switches on every card): three seeds vs the melody you
  called human; one switch off at a time (equal durations / no breath /
  every bar on the tonic / no arch); density 1-2-4; velocity shapes; tail
  types; anticipation by an 8th and by a 16th; 8-bar form (free / return /
  exact); and the grammar over seven more hosts — major keys for the first
  time (allstar, royalroad, lb3, pendulum), blues at 150, jazz at 110,
  mystery at 78 — on piano, flute, ocarina, clarinet, vibraphone, square,
  saw, muted trumpet, treated strings. If the seeds pass, this becomes an
  engine rule; if one fails, your note on it names the missing rule.
- **strings (4)** — the chaotix line with level only / reverb only /
  attack-release only / all three; the strings lead treated / re-attacks
  removed / strings under a piano lead (the sad-shop role); durations at
  fixed treatment; your "different notes".
- **your fixes** — harpsi pickup NOTES (triadic / from the 5th / falling /
  new anchor), gijoe bolder (rhythm → harmony → added voice, with controls),
  dq tresillo variations, walkbass over a stated C7-F7-G7-C7, lattice bass
  and pluck levels, grief re-authored (long-short / rolled / top line), rush
  pad hypothesis, the loop form with the roles as you heard them, hexarp
  nature-compatible rhythm (breath / rit / peak echo vs dotted).
- **development (5)** — pkmn / rise / steel-event / lattice-layered /
  harpsi-layered arcs with static controls.

Page 104 experiments / 382 variants; suite 394/394. D133. Nothing committed.

## Your first labs verdicts are in — and batch 2 is on the page (23 new experiments, positions 49–71)

34 good, 0 rejected, 150 variant marks work, 4 off. What you settled: the
bold flows are the model ("definitely make more of these"), the surgical
align repairs are below your ear ("can barely tell a difference" ×7 — the
mechanism analysis stands, the repair grade is not worth building),
transposition is not variation ("still the same melody"), the climb needs its
drop (no-arrival marked off), safe-swell "too harmonic" while the desert drone
floor "could be expanded to many ambient songs", your hexarp×panflute clash
prediction refuted ("lively song but fits" — the real risk is reuse without
variation), and the rule-composed melody passed as human on BOTH the falling
and rising versions ("learn how to make melodies like these").

Batch 2 answers every note, appended after the judged 48 (byte-frozen):
- **melody generation** — the human melody with one rule removed at a time
  (rocking / sparseness / empty middle: which one kills it?), the grammar as
  a lead over the nightfall loop on piano/flute/strings, and at 128 bpm over a
  driving bed with a hammered "machine" control.
- **over time** — walkbass in three pacings (every 2 / every 4 / late turn),
  dq with the falling cell as PRIMARY (your ask), gijoe developed by addition
  vs static vs late-fill.
- **rhythm axis** ("could also vary rhythm too") — 9 cards: walkbass, dq,
  lattice (bold this time), pkmn (diverse this time), the rise (rhythm AND
  intervals), harpsi (rhythm AND notes), hexarp, offbeat, steel.
- **your fixes** — royalroad's dark pendulum chord (= the seated f♯: bright
  third or regroup bar), the dial's misfit pizz note (= the seated e♮: level
  or re-seat), raining-jazz RH recomposed + flute split, the minor hexarp run
  without b6 / with dorian 6, chaotix legato/staccato + softer trumpet,
  airwolf separated with the second chord re-noted, rush's "still slower"
  (felt speed is same-pitch re-attack density — fixed by block transposition),
  and your looping law as a percussion form (buildup once → main loop → late
  event).

Recorded, not yet carded: grief's "same durations feels robotic" (solo
progressions need roll/rhythm variety), the pluck "a bit too loud" on the
mysterious mixes, tech-mystery's second-bar rub. D132.

## audition/variations.html — the variation labs (batch 1: 48 experiments, 170 variants)

Per your ruling the labs left the catalog and got their own page. Every card
is one EXPERIMENT: your words that motivated it, a falsifiable hypothesis, a
targeted question, and SEPARATE play buttons per variant (your "evaluate this
in its parts not a whole") — mark each ✓ works / ✗ off, note anything, then
give the experiment a verdict. Export button is the same flow as the catalog.

Six lanes, in page order:
- **flow (17)** — every sample your notes asked to vary, with real alternate
  flows: the pendulum incl. your literal 3213232123232 and an enters-later
  demo; hexarp (strings untouched); lattice "go up a note"; snowy with its
  rhythm frozen + the tail fixed; horn echo repaired then developed into an
  own melody; offbeat pizz third-note-up occasionally; the walkbass/harpsi/
  lb3/steel/daydreamer-bass interval-order asks; dq pizz incl. a NON-rising
  version (your rl_r6 note); pkmn dyads as-transcribed vs barline-aligned vs
  your up-ending; the swell in new rhythms; rush rebuilt to your exact
  recipe (same speed, different notes, softer); bkmansion's four left-hand
  behaviors as separate studies; grief at 100/72/60 (tempo only).
- **perc (5)** — congas/shaker flows, lofi+indie combined (incl. a groomed
  version that resolves their colliding hits), your "layered over time"
  tutorial cluster staged vs all-at-once, and an energy ladder built from
  your own tier labels — does percussion alone carry the arc?
- **combo (5)** — bkmansion pixel vs saw-stack vs piano ("serum-like"
  direction), airwolf's timbre over the piano host, soncha's vibraphone
  flat vs rising, chaotix determination across four instruments, the
  offbeat role on four voices.
- **align (6)** — your five "wrong key" notes, MEASURED first: rise and
  shop-bounce are already 100% in-key after seating (the clash is
  chord-level); airwolf's "second variation off key" is literally ONE
  pitch; gijoe/attack-hold have 2–3 chromatic cells. Each card: exactly
  what you heard vs conformed vs minimal repair — your pick decides the
  pairing fix the engine builds. Plus the host-rhythm card ("tempo should
  be a bit more constant"): bare uneven changes vs +root pulse vs evened.
- **mix (8)** — your vibe algebra composed: YOUR energy recipe verbatim
  (air-pirate bass + energetic pizzicato over the calm core), mysterious
  desert (hypothesis: the second swell's clash tones are the desert bII
  pincer over a drone — reframe instead of repair), playful+playful,
  determination + the pad at half the "too loud" gain, the timelapse DIAL
  (your "any layer can be on or off" as four positions), stakes vs
  relaxed, and your hexarp×panflute clash prediction as a control with two
  rescue attempts (time-separation, role-spread).
- **compose (7)** — your analyze-why asks turned into rules and tested on
  NEW material with falsification arms: the harpsi common-tone-anchor rule
  (+ why the same rub passes on the andalusian), hexarp = scale minus
  degree 4 (the f restored should break it), nocturne's falling-answer calm
  (rising-answer control), raining-jazz left hand transferred, the allstar
  V→v(add9) resolver grafted twice, scale-climb placed before a real drop
  vs before nothing, and the echo-cascade canon rule (stepwise line =
  predicted mud).

All 170 variants build-verified; every "as you heard it" variant reproduces
the exact combo the catalog played (stored pins / judged-page values). The
analyses live in research/variation-labs-r33.md. D131.

## Catalog: 219 cards now (labs moved out), batch 6 tail = 27

Your queue and numbering through 192 are untouched, byte-verified. The b6
tail keeps: the "can't hear"/silence fixes (topgear, ctr-credits, ctr-boss
respec'd to sound from bar 1; hgss boosted), the 9 splits you asked for, and
the two mining lanes — dev patterns (return-after-contrast 62.5%, +layer =
#1 return transform, support rewrites almost never) and your perception
categories with recipe-hypothesis questions. D130.

## Your fifth export is in — and it ratified batch 5

New in it: four b5 reactions, all positive — daydreamer guitar ("I like this
vibe") and bass ("happy bass", now ticked + frozen at what you heard),
garden horn ("a reference to inspire, not hardcoded"), gijoe rhythm ("sounds
happy. I like it!"). Topgear unticked pending its split — its judged pin
stays stored for a re-tick. 78 prior pins carried byte-verbatim. Three new
laws recorded: tick lists are OPTION MENUS (your "listing all applicable...
all at once won't resonate"), melody samples are reference-only (you said it
three times), and harmonic layers make a scary device less scary (your
premonition label). D131.

## Your third labels export is in (8 cards, 76 ticks, ~150 pair notes)

**Every ticked pair is now FROZEN at exactly what you heard** — a stored pin
per pair (shift/gain/tempo), corrected only where your note asked: magus,
taiko and trip-hop pinned quieter ("way too loud"), versus-bass and the
string pluck pinned louder ("cant hear"). Thirteen add-ons got new loudness
readings for everywhere else (steam engine, trip-hop, magus, garden horn,
swing-arp "really soft", rush "softer", infinity slap and desert groove
boosted...). The "can't hear" diagnosis: the bass cards were genuinely too
quiet (fixed); the hand-drum beds and the string pluck vanish only under
DENSE cards — that's texture/same-family masking, not level, so they stay as
judged where you said they fit.

**Your two laws are recorded** (D129): calm-is-not-a-cage (a vibe label
describes the unlayered core; foundations + layers reach other vibes), and
variation = "another flow bound within the sample" — a coherent alternate
line (your 321232123 → 3213232123232 example), never random note changes.

**Your analysis asks, measured** — the mechanisms in plain terms:
- **nocturne bed's calm**: slow attacks, hands ~3.5 octaves apart with the
  middle EMPTY, answers that fall stepwise while the bass rises, then the
  whole call dissolves into a semitone rocking figure over whisper strings.
- **mir sadness floating**: I–iii–IV^7–ii7 with NO dominant anywhere — it
  floats because resolution pressure never forms; the bass only speaks on
  beat 4, as a pickup into the next chord.
- **the echo cascades' refreshing**: a decaying canon (same phrase, one 8th
  apart, 4 fading voices) whose triadic steps make every self-overlap a
  3rd/4th/5th — written-out reverb that can only be consonant. And your new
  premonition label ("harmonic layers make it less scary") is the same
  mechanism from the other side: register + level + harmonic context re-read
  a semitone as glitter or as threat.
- **airship carousel**: four locally-functional sus→resolve cells joined by
  chromatic-mediant/tritone seams — keep each cell intact and put the seams
  at phrase boundaries and it stays smooth.
- **the allstar resolver you liked**: D → Dm(add9) — the major V softening to
  minor on the same root before landing on C^7. A learnable end-of-phrase
  rest gesture.
- (harpsi/hexarp fit-everything and premonition's second chord were answered
  last round — the line-fits-the-KEY law and the bar-2 A♮/D semitone rubs.)

**4 new cards at the end of the queue (189–192)**: the gijoe RHYTHM as a
template with key-aligned notes (your "take the rhythm" ask), daydreamer
split into bass + guitar with the first guitar note moved to the root as you
asked, and the garden horn answer isolated.

## Batch 4: the deep-mining pass (47 new cards, positions 142–188)

**Your sad_shop question answered**: yes — the strings are
`gm_string_ensemble_1`, and the "really good VST" is the **VSCO-2-CE string
section** (real cello/violin section samples, round-robins, velocity layers)
rendered through sfizz in the HQ tier. Still the default strings voice: 29 of
the songs.html suite carry it. The praised layer itself is now a card
(`cand_b4_q_sadshop_strings` — hold a bar, climb beats 2-3-4 in dyads to an
octave, transcribed byte-exact from the frozen mix) posed as a transplant
experiment: tick it onto other-genre cards to find where the flow survives.

**The exemplar you named, fully read (7 cards, your sentences on each)**:
SM-MiniBoss decoded — the LH is a tripled-unison E blues walk (piano + both
basses); its "variation" is 8 bars on a B-pedal octave gallop + a chromatic
climb home; the growth is octave-COPIES (strings +12/+24 at bar 5, melody
born doubled at +24); the trumpets are chords on 90 of 90 attacks; the
descending synth is an Eb-augmented waterfall in 48ths, bars 13-15 only; the
percussion is a 24-bar arc played twice with the clap+slap LAYERED backbeat;
the intro is one unison chromatic planing bar. Title-as-prior confirmed.

**Four corpus lanes (35 cards, ~20k+ files measured)** — headline laws:
- Growth: 83.9% of late-entering layers add ZERO new pitch classes (the
  octave-double is a device, 5.1%, not the norm); half of entries land
  mid-phrase — your r17 "changes not just in strict section bar" has corpus
  backing and a card.
- Percussion: song types separate by VOICE SET not density (victory = pure
  kit, snow = four-floor+tamb, desert = latin, dance = the CLAP); 70% of
  songs change their kit mid-song; a second hand-percussion deck is a
  standing arrangement in environments (desert 48%) — your "drums can be
  layered" is corpus law (61% of clap songs layer clap WITH snare).
- Layers: complementary rhythm is the corpus MINORITY — your zero-overlap
  reels are a distinctive choice; victory fanfares LOCK (79%). Plus 4
  RHYTHM-TEMPLATE cards (your "just the rhythm + info to fill it"):
  backbeat-chords, frozen offbeat stabs, gallop bass, pickup-run.
- Variation: 85.1% of real variation keeps rhythm IDENTICAL and varies pitch
  only; octave-shift is the RAREST mechanism (1.1%) — the mechanism bank for
  your melodies-vary-per-song law.

**Producer questions (your ask "up to you")**: 32 of the 47 cards carry a
direct "Q for you:" — the big ones: should theme arrivals STRIP a support
layer (CTR does); staircase vs pillar octave growth; may layers enter
mid-phrase; is a frozen one-pitch layer genre-FREE; can offbeat chords carry
spook (Sonic Heroes says maybe — tests your r19 law); should the metronome
test be role-aware for gallop bass; second percussion deck under the kit at
D77 levels; drum-layering as a standard trick. 27 cards carry explicit
"claimed scope" lines — your label ratifies the scope claim too.

All 188 build-verified; combo probe 188/188; your first 141 positions
unmoved; FULL suite 391/391; nothing committed; research/deep-mining-b4.md
has the full analysis; D128 in the ledger.

**Heads-up before your next songs.html listen**: the page had been one
rebuild behind the session's r33 code since Sep 1; the full-suite run
rebuilt it, and **11 unkept songs you have notes on absorbed the r33 fixes**
(excited_casino, excited_training, calm_rest, somber_snow, happy_festival,
nostalgic_shop, mysterious_space, excited_space, calm_shrine, excited_fight,
nostalgic_casino — mix/cast moved, drums on three). Every KEPT song is
byte-identical to its judged state (verified against the pre-import
snapshot; D64 pins green). Those 11 songs' HQ wavs are stale until
re-rendered.

## Your second labels batch is in (5 cards, 113 pair notes) + batch 3 built

**Your three "analyze why" asks, measured:**
- **Why shenightfall-harpsi and hexarp fit everything**: after key-seating,
  EVERY pitch class they sound is diatonic to the card's key. They're only
  ~41–44% inside the sounding CHORD — and that's the finding: a single LINE
  fits through the KEY, not the chord (its non-chord tones read as passing
  tones). Predictive rule for future chords: a line-shaped add-on fits any
  progression whose key contains its pitch classes; what kills a pairing is
  out-of-KEY notes, especially a semitone against the sounding chord.
- **Why premonition's second chord doesn't fit**: measured — its bar-2
  content lands d–a–bb–f against the card's Ab bar. A-natural and D are both
  outside C minor AND both a semitone against the Ab chord's tones — two
  simultaneous semitone rubs. Bar 1's content maps fully into the key, which
  is why the first chord fits. (Same mechanism as the r33 dissonance
  predictor.)

**Your laws, recorded for the engine round:** strong melodies vary over the
song AND per-song (no two songs share a melody, but stay "safe enough to keep
the appeal of the original"); drums layer and mix like any other tier;
continuous layers sit soft in the background while sporadic ones ride normal
(the page's combo preview now does this for un-judged add-ons); layers
COMPOSE vibes — one progression becomes energetic or calm, x or y, purely by
its cast. And your sad-shop-era question: **vs_sad_shop, vs_somber_aftermath
and vs_x_construction are keeps — byte-frozen exactly as you praised them,
verified every round since.** "Replicate those layers across a higher range"
is now the standing design goal for the next engine round.

**Batch 3 (18 lab cards + mined seeds, after your position):**
- **The pizz lab (your ask, 6 cards)**: each a variation HYPOTHESIS bound to
  the chords by construction (scale tokens can't leave the key): your
  up-a-note-on-the-third verbatim, a chord walk-up, a 2-bar call/answer, a
  lower-neighbor dip, double-stop dyads, and an on-beat 3+3+2 — label which
  variations earn a place.
- **The percussion-voice lab (6)**: your triangle→snow reading made literal
  (sleigh-bell clock), an agogo/woodblock percussion melody, tuned log-drum
  duet, offbeat finger cymbals, a soft→hard shaker staircase, a woodblock
  town clock.
- **The timbre lab (6)**: accordion, harmonica, koto, steel drums, ocarina,
  fiddle — all playing the IDENTICAL neutral phrase, so your label is purely
  about the voice (first cards of the instrument-for-vibe type).
- Your "can't hear" on the slap riff fixed (same sub-audible-register bug as
  the air-pirate bass — raised an octave + boosted).
- Every pair you ticked is now pinned to the delta/gain/tempo it was judged
  under — batch-1 ticks under the old mapping, this batch's under the
  current one; no future rule change can move an approved combo.

## Batch 2 mined (your "scrounge more patterns" ask) — 45 new cards, appended AFTER your place

Four mining lanes over the ~2,050 curated files (+ research-doc finds never
carded): **14 drum grooves** (boss x2, water, flying, town, victory,
sad/march, stealth, cave x2, desert, haunted, festival), **12 progressions**
(9 with real sub-bar chord changes; sad x2, boss, flying x2, victory x3,
water, town, sports, lounge), **10 layer devices** (echo cascades, arp
engines with built-in variation, walking-bass tissue, a call-and-answer
trade), **9 from your own packs** (6 carry the pack annotations verbatim —
they lead batch 2; NOTE: Miraleste's filename notes read as the producer's,
not yours — tell me if they're actually yours). Catalog is now 113 cards;
your position, numbering, ticks and notes are untouched (batch 2 strictly
appends). Full analysis: research/catalog-mining-b2.md. Nothing enters any
pool until your labels.

## Catalog batch 1 imported (your 3 labels + 69 pair notes) — page upgraded from them

- **Piano rule built (your ask):** a piano-main card no longer offers other
  piano-main add-ons (measured flag: dominant piano/epiano voice carrying
  harmony — every chord bed, chordal comp, and two-hand accompaniment; melodic
  piano lines stay). 29 of 68 candidates flagged; none of your ticked/praised
  partners is among them. Hidden ones still show if ticked, and their note
  rows stay.
- **Key alignment now mode-aware (your "wrong key / would work if aligned",
  x4):** a minor-flavored add-on on a major card now lands on the card's
  RELATIVE minor (and vice versa), so its colors sit diatonic instead of
  fighting the card's third. r8 attack-hold, layerstack rise, gijoe comp,
  shop bounce all remap; same-mode pairs (pendulum, hexarp, snowy, horn echo)
  are byte-unchanged.
- **"can't hear the drums" was real silence:** shenightfall/desert-groove
  specs named sounds that were never registered anywhere (kick/snare/cabasa…)
  — remapped to your local pack (md_kick, vc_riq, vc_conga_mute…). The
  airpirate bass was a g1 pedal below browser audibility — auditioned an
  octave up now. String-pluck boosted 1.6x.
- **Your loudness readings applied per add-on:** steam engine + trip-hop 0.5x,
  taiko + harp zigzag 0.65x, magus 0.6x, reflection duet 0.75x.
- **"way too fast" fixed:** an add-on authored at half the card's tempo (dq
  stack at 50bpm under the 140bpm card) now halves its rate; it does NOT fire
  on r6 where you said it fits.
- **Split as asked:** magus motor and choir are now separate cards (motor
  quieter per "high part way way too loud"); dq pizz and flute separate;
  panflute nocturne lead and bed separate. 68 cards total; your progress and
  notes are untouched.
- **Recorded for the engine round (not page fixes):** your variation asks
  (pizz "up a note on the third occasionally", lattice bell vary, pendulum
  321→3213232 interval-vary, hexarp "vary the melody", snowy "vary while
  keeping the rhythm", horn echo "vary this to make an own melody"), the
  chord-safety ask ("rounding more risky notes to safer alternatives"), and
  the reel-render rhythm notes (r2/r3 "rhythm should be more aligned / hard
  to follow", r6 "tempo should be a bit more constant").

## The headline: your three issues were three specific bugs, all measured

**"certain instruments too loud once again"** — ten of your sixteen cards were
ONE mechanism: the engine hands the melody to a flute → vibraphone → e-piano
chain in the later sections, at 1.01–1.04x the lead you calibrated your ear to,
and a bug had FLATTENED every melody layer's dynamics (an authored per-note
envelope was being overwritten by a later flat gain — so every "loud" layer was
also playing every note at max). Three things you should know:
- **"glockenspiel" = the vibraphone** (there is no glockenspiel on the page),
- r1's **"sawtooth synth"** = the flute handoff (no sawtooth in that mix),
- r3's **"flute doesn't really match"** — there is NO flute in that song at
  all; the best candidate for what you heard is the vibraphone lead (42% of its
  notes clash with the true chords). Point again if it's still there.
The handoff chain is now OFF on reel cards (a reel plays one instrument per
role), the dynamics bug is fixed everywhere fresh, drums/acc are capped against
what the lead actually plays (not a paper number), and the melody can never get
louder than its own opening sections any more.

**"notes shifted off by like a sixteenth"** — not swing, not the drums: the
melody cells themselves write onsets one 16th before beats 2 and 3 (65% of all
off-grid notes were exactly those two slots), and every copy (octave partner,
handoff) repeats them. Your references almost never do this — their off-grid
16ths are pickups INTO a note. New law: an odd-16th melody note survives only
as a pickup; everything else snaps to the 8th grid or merges into the note
beside it. On your named cards: 33–73% off-grid → **1.2–3.0%**. The "really
short duration" notes were exactly 10 events on rise_up and every one was also
off-grid — one fix cleared both halves of your sentence.

**"dissonance / doesn't match"** — four separate causes, none of them "too many
notes":
1. frozen reel rows were being pitched against the WRONG chord (the loop's
   first chord instead of the key) — r3's pluck went from 71% clashing to 14%;
2. the melody was tracking chords one bar at a time while your reels change
   chords mid-bar — it now reads the chord sounding at each note;
3. r1's "major for some reason" was my bridge-variation machinery recolouring
   your madd9s into MAJOR triads for exactly bars 12–19 — reel harmony now
   plays as transcribed, untouched;
4. both "notes right next to each other" cards are reel 1's madd9 cluster
   device crossed onto happy/excited songs — on the calm card ZERO of its notes
   are out of key; it's the exposed in-chord semitone you're hearing. Which
   vibes that device may cross onto is a question for your catalog labels
   (below) rather than a rule I invented.

**The stick, fifth complaint** — you were right to be annoyed: the r32 fix
added two better stick patterns and the hash picked the OLD one again on the
exact song you judged. The old row is out of the rotation; construction now
gets the stick AS the backbeat, interlocked with the kit. Also found: the drum
compiler has been silently deleting the snare wherever snare+clap share a beat
— on every page, always. Fixed.

## The catalog — this is where I need you (audition/catalog.html)

Your ask: *"take everything you like ... and ask me to verify them one by one
so i can label what they contribute and which ones sound good together."*

**62 candidates**, one at a time: the 8 reels' progressions/layers/combos, the
best of the vgmusic 400, Undertale, the Unison packs, your own annotated files
(the Cottonwood MIDIs where you wrote "love the melody" in the filename — those
lead the queue), Miraleste, and the research back-catalog. 43 carry your own
words back to you. Every card plays through the engine. Keyboard: space =
play, g = good, x = no, u = unsure, arrows to move; the free-text box is for
what it CONTRIBUTES in your words. **The pair chips are live now (your ask):
while a card is playing, ticking "sounds good together with" ADDS that
candidate to the mix — on the playing card's tempo grid, its pitched material
pulled into the playing card's key (drums untouched), at 0.85x so the card
you're judging stays the reference. Untick to drop it. And every chip has a
small ✎: it opens a note line for THAT partner — why you included it (ticked
ones get a note line automatically) or why you left it out (✎ on an unticked
chip, without ticking it).** Export with the button when done — nothing
enters any pool until your labels come back.

## The melody study (research/melody-grammar-r33.md)

Measured your reels + all four MIDI populations against the engine. The
engine's melody was missing exactly one thing everywhere: **connective tissue**
— real melodies walk between their chord tones (28–57% stepwise, engine 16%),
leave the chord constantly but resolve by step, and put big leaps once a
phrase (engine: 19% of all intervals). First mechanism is in: one leap per
phrase, and passing tones that are approached AND left by step. The full gap
table and what's still to build are in the doc.

## Rebuilt / retested

- reels.html: all 16 (all your notes were live). rise_down ("love this vibe")
  is PINNED — only the trim you asked for. r5 lost the boogie (your
  "sneaky/goofy") + gained a companion; the two "more layers" cards got them;
  your ambient-strings ask is built (`ambientSwell`) and defaults on reel pages.
- songs.html: exactly 11 unkept songs moved; **0 kept songs, 0 pinned songs, 0
  desert/jungle/horror songs** — their HQ wavs re-rendered.
- vanriver: your two prose keeps ("no complaints" / "really good") are pinned —
  music byte-identical.
- npm test: 390/391 + the known suite race (passes alone); the 3 new catalog
  tests green. A six-agent adversarial verify pass ran on everything and
  REFUTED four of my own fixes; all four were re-fixed and re-measured in a
  second iteration (the full honesty ledger is the D123 addendum — headline:
  the drum cap was still being defeated by two later multipliers and by my own
  collision fix, now genuinely 0.73–0.77x on the worst offenders).
- New standing process (your "create a verification process and iterate"):
  `.claude/workflows/verify-round.js` runs the whole check battery every round.

## Three of your notes need YOUR call (surfaced, not guessed)

- **r6 "vary the violin"**: that violin is your reel 6's own transcribed
  scale-climb, played exactly as transcribed. Varying it breaks the
  play-as-transcribed law you set in r32. Want it varied anyway on that card?
- **r8 "the piano should just support the synth"**: I fixed the piano's clash
  (it now tracks the true chords) but did NOT demote it from the lead role —
  point again if it still fights the synth.
- **rise_up vs rise_down are no longer a clean A/B**: rise_down is pinned as
  you loved it (only the trim), rise_up carries every live fix — the pair now
  differs by much more than the up/down device.

## Open (deliberate, measured, waiting)

- cluster-arp cross rules → your catalog labels decide. Same family, now
  explicit: the r7 bell crossed onto the happy/snow card (your "shouldn't be
  applied as a copy to every happy song"), the E-pedal-vs-maj7 rub on the
  bright cross, and cross_holiday's harmony-synth chromaticism against a
  crossed pedal — all "which devices may cross onto which vibes" questions.
- r6's transcribed piano ROLLS render as separate staccato 16th voices (a
  binder limitation — the roll needs held voices); that's part of why that
  card's piano reads "offbeat". Recorded, needs its own binder work.
- songs.html still has NO snare anywhere (mid-band default) — one round, ~27
  songs' drums + HQ re-render, when you say go.
- r2 "disco not snow": that's a serving-label question — the catalog card for
  the r2 stack is where to say what it should serve.
- tailOff conflict still unsettled; r26 chordcam verdicts still unimported.

**Nothing committed.**
