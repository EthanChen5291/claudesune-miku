# r21 (2026-08-29) — THE METRONOME TEST, AND A NUMBER THAT CHANGED MY PLAN

## The finding that matters most this round

A second session swept **31,652 vgmusic files** to answer a question I left open.
The result reframes an ask you've made on nine cards:

| | real game music | us |
|---|---|---|
| simultaneous voices (median) | **4.16** | **5–7** |
| files with a rhythmically-free second line | **54.5%** | **32.6%** (14 of 43) |

**"More layers with their own melody" is not a request for more voices** — we
already carry more than real game music. The gap is **independence**, not count.
I have spent four rounds answering that ask by casting another voice, which was
answering the wrong question.

*(Correction, same day: the first figure I was given for that second row was
88.8%. Their own verify pass found the extractor never tested rhythm — it was
counting any non-doubling second part. The real gap is roughly 6–22 points, not
56. The direction and the reframing hold; the magnitude was inflated about
fivefold, and I should not have written a fresh single-source number into the
docs the same hour I got it.)*

**And it turns out I fixed the wrong variable in r19.** I'd found that your
counterline and descant are really one layer because they strike together on one
instrument — and I answered it by changing their *rhythm*. The corpus says
striking with the lead is completely normal (76.8% do it); what separates a real
second voice is **register and instrument** (69.3% use a different instrument
family). Both of ours are still the same string ensemble at the same octave. That
is the actual fix and it is not yet built.

Same sweep, on the dissonance you keep hearing: we use **more** non-chord tones
than the corpus (22.8% vs 14.1%) and resolve them **7x less often** (6.1% vs
43.6%). So the fix is *fewer* colour notes that actually go somewhere.

## Your four notes

| song | what I found | what changed |
|---|---|---|
| **mysterious jungle** | the middle 16 bars bound a power-fifth pulse **on the marimba** — 124 attacks per 8 bars, the densest stretch in the song, 8-bar block repeating verbatim | new **metronome test** rejects it; middle is now 18 notes/8 bars |
| **scary cave** | you remembered right — it's `bgDissonance`, tremolo strings with the attack thrown away | lead moved to **tremolo strings**, quieter |
| **nostalgic casino** | the walk was 2 notes in a 4-slot hole | now **3 notes** (5th–3rd–2nd into the next root), plus a mid-range marcato and quieter drums |
| **calm shrine** | this was the **second round** on the same complaint — r20 fixed the intervals and left the dynamics | `padWaveCalm` + gain cuts |

**Casino's walk now plays E5→C#5→B4 into A^9, and C#5→A4→G#4 into F#m9.**

## Two things I got wrong, recorded

1. I first measured `solos._acc` and reported both songs repeat an 8-bar block
   for the whole track. That object is one *preview* binding — the real
   accompaniment swaps figure per section. That's my own "measure in the mix, not
   the solos" rule, broken two rounds after I wrote it.
2. I tried **four** variants of the `hold` rhythm form to fix jungle, and each
   traded repetition against density. All reverted. A monotonous *figure choice*
   can't be repaired by varying it — the fix belonged at selection.

## ⚠️ ONE THING TO LISTEN FOR

Jungle's middle went from **124 notes per 8 bars to 18** — that's the opposite
extreme. It may now sound *empty* rather than hammering. Tell me and I'll aim
between the two; I didn't want to tune it blind.

## STILL OPEN
- **Blending** (your TV-man note) is recorded, not built. It is *not* a reversal
  of dropping `melody_backup` from horror — that doubles at lead level and reads
  louder; blending needs a partner mixed well under. Needs its own cast slot.
- Passing tones *inside* a bar are still **0**; the walk only fixes boundaries.
- Corpus says resolution is only half the law — real practice brackets a
  dissonance with stepwise motion on **both** sides.
- The ambient↔narrative form axis and the jungle hi/lo percussion idea: still
  recorded, still unbuilt.

---

# r20 (2026-08-29) — WALKING, AND AN HONEST ANSWER ON "LEARNING vs HARDCODING"

**Your question:** *"is it possible to learn the good techniques without
hardcoding them? do you actually 'understand' what is good?"* — the honest
answer is in DECISIONS.md D101. Short version: partial. What generalises now is
real; what's still a hand-written list is named; and it isn't "learning" in any
machine sense, because 50 reels is not a training set. Your ear is the ranking
function and that loop is not built yet.

## The measurement that organised the round

Two of your complaints turned out to be ONE defect:
- *"the piano doesn't do any walking ... it's just chord bouncing"* (casino)
- *"bits of dissonance that you can't follow"* (mysterious jungle)

Walking IS passing tones. Unresolved dissonance IS a note you can't follow.
Measured on the accompaniment hand across all 47 songs: **2,620 non-chord tones,
66 of them resolving (2.5%), ZERO true passing tones, and 489 (18.7%) that
simply repeat in place.** nostalgic_casino's acc was literally one triad struck
twice with four empty slots after it.

## What changed

| fix | measured |
|---|---|
| **Walking into the next chord** — new `>` look-ahead token lets a figure target the chord it's *going to*, not the one it's on | **24 walk events on 4 songs → 122 on 13** |
| **Resolution law** — a non-chord tone must be a scale step from what follows it | resolved 66 → 100; repeats-in-place 489 → 391 |
| **scary_cave violin** (your note) | 60 notes → 55, held 882ms → 1324ms, gain ×0.6 |

Casino now plays **C#5 → B4 → A4** into A^9, and **A4 → G#4 → F#4** into F#m9 —
real descending walks into the next root.

## Your reel question is answered

`remainder+logs.MP4` is 86.8s = **1:26**. So "the scary key reel" and "desert
chord example" are the **same reel** — briancalli's Modo Mixolidio b9 b13.
Phrygian dominant is both your desert scale and your scary key.

Re-read at full resolution, its voicings (which I'd flagged uncertain) are:
**C = C E G · Db = Db F Ab Bb (Db6) · Bbm = Bb Db F Ab (Bbm7)**. The Db6 already
contains Bb — the root of the next chord. They're the same stack re-rooted, which
is why that move sounds inevitable. Recorded, not yet built.

## `src/lib/techniques.js` — so analysis stops getting lost

Twelve techniques as DATA, each with the reel + second it came from, your exact
words, when it applies, and an honest status. **5 wired, 7 recorded-and-blocked**
— including your two new asks (percussion-style hi/lo jungle acc; the
ambient-loop ↔ narrative form axis). Adding a row can't re-roll any song, so
recording an analysis is now cheap.

## THREE THINGS I NEED FROM YOU

1. **Your three prose keeps are pinned but not clicked** — somber_space,
   scary_cave, calm_desert. Please click keep + export so they're locked.
2. **The mysterious_jungle percussion idea is recorded, not built.** Same for the
   ambient/narrative axis. Both are real work; say which you want first.
3. **soundcollider's "guitar + triangle + percussion"** — the engine has neither
   a guitar nor a triangle. Want me to add them to the palette?

## STILL OPEN
- Passing tones INSIDE a bar are still **0** — the walk only fixes the boundary.
- The variation forms are still a hand-written list picked by hash. That is the
  remaining hardcoding and where the technique library should absorb them.
- ~36 repo reels still unanalysed; `prodbyberke` was never opened on camera.
- The melody-tail A/B (`songs-tailkeep.html`) is still stale and unresolved.

---

# FOUR NEW SONGS FROM YOUR REELS (2026-08-28) — FOR ETHAN:

**Listen to these four first. Each one is built on a progression I read
note-by-note off a frame of your reels, plus a layering technique from the same
batch.** Chord content for all four matches the source exactly — I checked.

| song | progression | from |
|---|---|---|
| **vs_scary_cave** | `F5 – Gb5 – F5 – Gb5`, thirdless | your **"scary^"** reel (dantes.studio) |
| **vs_somber_space** | `Fm9 – Fm9 – Cm9 – Cm9`, five-note voicings planed intact | dantes.studio #2 |
| **vs_nostalgic_casino** | `Bm9 E9 A^9 D^9 G#m7b5 C#aug F#m9 F#7` | your **"walking bass (jazz, unique)"** reel |
| **vs_calm_desert** | `C Db C Db C Db Bbm C` | your **"desert chord example"** |

**The desert answer was not the scale.** "desert chord example" is briancalli's
"Modo Mixolidio b9 b13" — Phrygian dominant, which the engine has used since D93.
The new thing is the **Bbm**: every desert trope I'd built walks I–bII–**ivm**–bII,
and yours walks to the **b7 minor**. One relation, and it was the missing one.
vs_calm_desert serves it raw against the normal desert setup, so it's the only
new variable for your ear to judge.

**Your "scary^" reel is thirdless and that's the whole lesson.** Two perfect
fifths a semitone apart — F#–C# against G–D — then the second chord swaps the
semitone for a tritone. The scare is the gap BETWEEN two fifths, not a dissonance
stacked on a triad. Everything I write for horror is tertian; I'd literally just
given scary_citadel a **major seventh chord** and called it dark. That device is
now `fifthPincer` and vs_scary_cave is built around it.

**Three things went wrong silently and only measuring caught them:**
- Pinning a song to a new progression **did nothing at all** — the pin resolved
  against a filtered pool that excludes unrated entries, so all four songs built
  green on unrelated exemplars. vs_scary_cave came out on an Undertale shop tune.
- The variation pass then **diluted three of the four** — it put an **E minor
  triad** into the one progression whose entire point is that it has no thirds.
- Adding library entries forces a rebuild of the counted harmony model, which is
  the thing that flipped kept songs back in r15. I measured it: **nothing moved.**

**Your four listening notes are also in** (scary_citadel's organ was actually TWO
organs, the loud one being a layer I'd never looked at; the catacombs "heroic
strings" were the counterline+descant, and the counterline's own description in
my code reads "R-3-5 alternating" — you described my source code; and the static
marimba chord was my own fix from earlier today turning into a metronome).

**Reel atlas:** [research/reel-atlas-r19.md](research/reel-atlas-r19.md), keyed by
who posted each reel so you can find any row in your DMs. Uncertain readings are
marked — the briancalli voicings are the ones worth your eye.

**I still need from you:** which is the "scary key reel" near the end of
remainder+logs? I see thefakesnoritz, solobdomde, lyfe8k and maestro_sou — none
captioned scary. And the `prodbyberke` reel in the new bundle was never opened,
so its thumbnail is all I have.

---

# ROUND D100 (2026-08-28) — your re-listen pass. FOR ETHAN:

**Your export looked identical but wasn't — five notes changed and that was the
whole signal.** Same 15 keeps, same 33 notes, but you'd rewritten the front of
four of them and added one word ("again,") to a fifth. Everything I did this
round came from those five. The thirteen leftovers above the scary_manor line
stayed leftovers.

**LISTEN TO THESE FIRST:**

1. **excited_fight** — you were right, and it was measurable. "The new trumpet"
   is the clarinet companion (it's the only voice added to that song since you
   last judged it), and it *was* off key. I'd told it to play a chord tone under
   every single melody note, which sounds fine until the chord is foreign to the
   key: over the B major bar it sat on D# for 18 of its 22 notes, while your
   melody only touches that D# a quarter of the time. **It now leaves the key
   only where the melody already has, and rests otherwise.** Across all 21 songs
   with a companion, off-key notes went 16.3% → 6.1%, and it is no longer more
   chromatic than the melody in a single song (it was in 11 of 21).

2. **scary_catacombs / tense_catacombs / x_catacombs** — the offbeat piano is
   gone. You caught it twice and you were catching a real hole: last round I
   told the serious lanes which foundation types they're allowed, but I only
   wired that to two of the three places that pick one. The texture slot was
   still free to grab the offbeat pattern, and all three catacombs songs did.

3. **happy_jungle** — the piano lead and the flute/clarinet are out. Lead is now
   the kalimba (the lane's own voice, not a guess of mine), and the two winds
   went to vibraphone and harp. Also: its companion had been on the *same
   marimba as the accompaniment*, so a layer meant to be its own melody was
   hiding inside another one.

4. **mysterious_jungle** — kept its calliope (you said it's better, so I left
   what you liked alone), but the same companion/marimba collision is fixed
   there too.

**AND ONE I FOUND WITHOUT YOU ASKING — this is the big one.** You've now said
"more layers with their own melody" on nine separate cards. I went to count how
many each song really has and found that **two of the layers I was counting are
one layer.** In 25 of the 28 songs that carry both, the counterline and the
descant play the same instrument on exactly the same beats — mysterious_jungle's
first bars are D5-F#5-A5 against D4/F#4-A4-B4, four notes of one string chord
moving in parallel, not two melodies. They now interleave: one holds while the
other walks, sharing only the downbeat. That's on 21 songs.

**YOUR TWO ANSWERS — both found, both were my own doing:**

5. **scary_citadel's disco ball was the HARMONY, not the drums.** You said
   "groovy synth rhythm" and that's exactly it: the organ was hitting block
   chords on every single quarter of all 32 bars — four-on-the-floor, the most
   dance-shaped rhythm there is — with the choir stabbing 1-3-4 over it. **My
   r18 fix put it there.** I'd set the harmony to "block chords" chasing your
   "too harmonious" note, and block is on my serious-lane allow-list because
   it isn't *playful* — which says nothing about whether it *grooves*. Those
   are two different things and I'd only encoded one. It's sustained now.

6. **scary_catacombs' lead singer — two causes, both measured.** You said not
   dissonant, just too loud and too much like a soloist, and you were right
   twice over. (a) The violin part is called `melody_backup`, and its own
   description in my code says it "doubles the lead line so it reads louder and
   wider" — 36 of its 48 notes were the cello's exact pitch. That's gone from
   the horror lane. (b) The violin was also the **handoff partner**, so it took
   the whole tune on every non-A section — that's literally "the violin taking
   the melody" from your earlier note. Last round I moved the catacombs *lead*
   off the violin and left the handoff pool alone, so it kept happening. Viola
   now; the violin is out of the horror lane entirely.

   Removing the doubler then handed four horror songs a *violin companion* —
   the exact voice you'd rejected, arriving through the fix for it. Caught by
   re-measuring. Fixed.

**STILL OPEN:**

- **somber_citadel's "random spurts of violin"** — I found the pattern but not
  the cause. It plays bars 8-12, 14-20, 22-28, 30-31: a one-bar hole at 13, 21
  and 29, every eight bars. Your ear described that exactly.
- **happy_jungle's "look and do research into jungle"** — you heard the new
  planed-maj9 progression and the note survived. The jungle progressions aren't
  converging on your ear, so tell me a specific track and I'll work from that
  instead of from research summaries.

**Numbers:** 313/313 tests, 25 songs changed, 18 untouched, and all 17 frozen
songs (your 15 keeps + tense_lab + goofy_casino) verified byte-identical by
name. Accompaniment is still 0% off the beat grid.

---

# ROUND D99 (2026-08-28) — your 34-song pass. FOR ETHAN:

**YOUR SCOPING NOTE IS APPLIED.** scary_manor and below = live; above it, an
unchanged note is a leftover. Thirteen were leftovers, I had acted on six, and
all six are reverted: happy_festival's thinning, mysterious_desert's new
progression (it's back on the drone you asked for), calm_rest's quieter strings,
somber_snow's gentler pad, and the extra layer on goofy_casino and
nostalgic_shop. The four desert/casino notes ABOVE the line stay in scope
because those songs had no note at all before, so that text is necessarily new.
That revert also caught a second bug: goofy_casino was still moving because my
new intro rule didn't check the pin. Fixed — **it and every other keep are now
byte-identical.**


**27 songs changed, 16 untouched** (your 15 keeps + tense_lab). goofy_casino is
the one pinned song I moved, because your note asked me to.

- **YOUR NEW KEEP CAME WITH A TRAP.** calm_space's keep click flips it onto the
  "kept" code path, and that path would have stripped the bridge and breakdown
  you were hearing when you liked it. Pinned back to the exact build you judged.
  Same thing bit excited_space from the other side: it had never had a note
  before, and several features only turn on for songs you haven't spoken about
  yet — so the instant your note landed it **silently lost a layer and swapped
  its lead voice**. Pinned. The tests passed on both bugs; only the
  song-by-song byte compare caught them.
- **"THE FOUR NOTE ARPEGGIO IS OVERUSED AND NOT VARIED AT ALL"** — you wrote
  that about four different songs without being told what to listen for, and you
  were dead right. The same figure was the B-section destination in **8 of the
  10 horror songs**, and arpeggios were **55% of every section change in the
  suite**, over only 13 different figures total. Two bugs: the ban list missed
  that figure, and more embarrassingly every song was picking its section
  changes off the top of the same list in the same order. Now **32%, over 20
  different figures**, and no two sections of a song go to the same family.
- **THE HORROR LANE DOES NOT GET OOM-PAH.** Fixing the above immediately let
  four horror songs reach a wide oom-pah bass, which is worse. So serious lanes
  now say what they're ALLOWED to use instead of listing what they're banned
  from — the ban list has failed twice now for the same reason.
- **"I WANT MORE LAYERS WITH THEIR OWN MELODY MAN THAT'S WHAT IVE BEEN SAYING"**
  — you said this on five songs. I measured it: **29 of 43 songs had no such
  layer at all**, and nine of the eleven you asked about had exactly zero. So
  there's a new one. It plays your melody's exact rhythm on a different
  instrument with different notes — a chord tone under each melody note, thirds
  and sixths alternating by bar, and it goes silent where no note fits, so it
  breathes instead of shadowing. **14 songs → 33 songs.**
- **"THAT JUST SOUNDS OFF" (the split-second delays)** — found it, and it was
  real. **402 accompaniment hits were landing off the grid**, always exactly
  12.5% of a song's hits. My r16 variation was nudging notes by *half* a grid
  step — about 70ms at slow tempo, which is too small to hear as a rhythm and
  exactly the size that sounds like bad timing. Now it moves a whole step.
  **Zero off-grid hits.**
- **"NOT IN A RANDOM WAY, IN A CALCULATED WAY"** — you and the casino note were
  saying the same thing. My four-note chords were swapping in a canned shape,
  which threw the accompaniment's top voice around; that's the "moved some notes
  out of order" you heard. Now it keeps the top note where it was and stacks
  three notes UNDERNEATH — "adding extra stuff", as you put it. Four-note
  chords nearly doubled anyway (93 → 164).
- **THE GONG IS GONE.** It fired in all four citadel songs at the same bar. You
  killed it on three of them.
- **THE SHARP VIOLIN IS GONE**, replaced by what you actually described:
  "subtle dissonance by random instruments in the background". It holds the same
  two dissonant notes but sustained across two bars, on a background instrument,
  at a whisper. scary_citadel gets one too — it turned out the citadel lane had
  **no dissonance device at all**, which is why it kept sounding "too harmonious".
- **THE OBOE.** "The high oboe doesn't fit and is too loud" and "the flute
  started being the melody" were the SAME instrument — the manor's designated
  voice was an oboe, and there is no flute in that song. It's a cello now. In
  catacombs the solo violin was carrying the tune; that's the "giddy" one. Cello
  there too.
- **THE RISER** (you asked me to document this): the file is 4.56 seconds long
  but stops making sound at 4.22 — I was scheduling the silence. Fixed, and the
  measurement is written down.
- **"CUT THE MARIMBA INTRO IN HALF"** — it was 15.5 seconds of solo marimba, and
  it slipped past my 16-second intro limit by half a second. A bare intro now
  gets 9 seconds. **It's 7.7 seconds. Exactly half.**
- **JUNGLE + DESERT, both because you told me to go research them.** The
  jungle progression you called "just basic chords" is gone — three of its four
  chords were the tonic. Two replacements: parallel maj9 chords sliding
  downward that never resolve (the DKC move), and a thirdless open tonic. And
  yes — you asked "do we have any other jungle harmony besides jungle vamp?" —
  we didn't, both jungle songs used the identical figure. There's a second one
  now. For the desert: mysterious_desert was on the thirdless drone, which has
  **neither the flat-2 nor the raised third** — neither half of what makes the
  lane sound desert. That's exactly why it didn't. It's on a new one with real
  motion.
- **HYPER vs JITTERY are different problems and I measured them apart.**
  happy_festival really was too dense (3.75 notes/bar, notes lasting 0.75 of a
  beat — the songs you liked run 2.25-3.25 and 1.0-2.0). mysterious_space was
  NOT dense; it just had **the widest leaps in the suite, 83% of its steps
  bigger than a major third**. Thinning it would have been wrong. Both fixed to
  land in the range of the songs you praised. (Also: happy_festival is not in
  2/4 — it's been 4/4 since D92 remapped it. The density was the problem.)
- **somber_snow's loud string measures** — the solo hid it; in the full mix the
  pad was swinging 47% and peaking every fourth bar. Tightened.

**TWO THINGS I DIDN'T DO, ON PURPOSE:**

1. **x_construction** — "synths sound better than piano for this vibe". That
   song's melody is *already* a synth (square lead, and it alternates to a saw).
   The thing that probably sounds like piano to you is the electric-piano
   accompaniment. It's a keep, so I'm asking instead of guessing: **which layer
   did you mean?**
2. **scary_citadel's drums** — "sounds like a evening disco dance ball". The
   only drum playing is a war march, quietly. I don't know what you're hearing.
   Its harmony complaint IS fixed.

- **ONE THING I BROKE AND CAUGHT.** Switching catacombs to a cello put 160 notes
  past the top of the cello patch, because the range-limit rule is a list of
  instrument names and the cello wasn't on it — the *third* time that same kind
  of list failed this round, and this time inside my own fix for the second one.
  Then my first correction made it worse (98 bad notes on goofy_casino) before I
  fixed it properly. It's flat against baseline now (377 vs 375 out-of-range
  notes). The render log said "0 failed" the whole time; it doesn't report this.

**STILL OPEN FROM LAST ROUND:** the melody-tail A/B (songs.html vs
songs-tailkeep.html) — and note that tailkeep page is now stale, say the word
and I'll rebuild it. Also still not built: changes that don't land exactly on a
section boundary, which remains the biggest thing you've asked for that I
haven't done.

# ROUND D98 (2026-08-28) — your reels + the melody/voicing work. FOR ETHAN:

- I READ THE DM LOG. All eight of your messages are transcribed against the reel
  each one sits under, in `research/reels-feedback-r17.md`. (Method, so you can
  trust it: I pulled a frame a second and had the computer find the purple
  message bubbles, then read those frames. Nothing guessed.)
- "MELODY IS CHORD TOO NOT JUST ONE NOTE" — you were describing something the
  engine had **never done once**. I measured it: 8,137 melody notes across all
  43 songs, at 8,137 separate moments. Never two at the same time. Not rare —
  zero. Now the longest note in each bar sounds a second note from that bar's
  chord: **1,041 chord-melody moments across 25 songs.** It picks 3rds and 6ths,
  refuses 4ths (they stack weirdly against a pad) and refuses the octave (that's
  doubling, not a chord), and it drops the volume of those attacks so the
  thickening doesn't read as an accent.
- "HELD NOT VERY JITTERY" — two things were wrong. The melody-cell picker ranked
  cells by WHERE the notes fall and never by HOW LONG they are, so longer-noted
  cells at the same density were invisible to it. And nothing ever lengthened a
  note. Both fixed: **median note length 0.75 → 1.00 beats, short notes 38% →
  24%, notes lasting a full beat 39% → 61%.**
- "THE CHORD IS FOUR NOTES NOT YOUR TYPICAL CHORD" — the accompaniment struck
  four notes on **0.11% of its attacks** (18 out of 15,867) and a single note on
  74%. Its whole vertical vocabulary was 23 shapes. Strong beats now take a real
  four-voice chord: 0 → 93 four-note attacks. I'd call this the least finished
  of the three — say the word and I'll push it further.
- A nice thing fell out: **inversions were always possible, just not as chord
  names.** Writing the notes in order gets you the reference's own Dmaj7/F#
  exactly. Writing it as a slash chord silently does nothing (the engine reads
  the upper root and plays root position), so I avoided that trap.
- "DESERT CHORD EXAMPLE" — that reel's "Mixolydian b9 b13" is note-for-note the
  scale the desert lane already uses. Your ear and the engine agree.
- WHAT I DIDN'T DO, and it's the important one: **"changes not just in strict
  section bar"**. I measured it — **139 out of 139 layer entries in the engine
  land exactly on a section start.** There is no mid-section change anywhere.
  And what I built last round (each repeat of a section gets its own treatment)
  is itself keyed to section starts, so it's an example of the thing you're
  arguing against rather than an answer to it. Your reels show the actual
  mechanism: a repeated chord comes back with its notes ROTATED, and a top voice
  gets ADDED every second pass of a loop that never changes chords. Both happen
  inside the loop, nowhere near a section line. That's the next round.
- ALSO: I found 18 chord progressions in your Hyperbits pack that the engine
  genuinely doesn't have (`research/progressions-hyperbits-r17.md`) — things
  like a V7b9 in a minor loop, a 9sus that appears **zero** times in the current
  library, two secondary dominants in one turn. I did NOT add them yet, because
  I measured what adding them does: it re-counts the harmony model and moves 10
  songs including 5 of yours. There's a safe route and I'll take it next round.
- A REAL BUG found on the way: `grammarPin` — the thing that holds a song you
  praised in words but haven't clicked — protects the melody but **not the chord
  progression**. tense_lab, goofy_casino and calm_space would have re-rolled
  their harmony the moment I added anything. Pinned properly now.
- TWO REELS ARE MISSING: the reharmonization ladder (jayhmproject) and the mode
  visualiser (briancalli). They're only inside the screen recording, not among
  the 14 files. If you send those two directly I can read the whole ladder —
  it's the richest thing in the batch.
- 26 songs changed, 17 byte-identical (your keeps and pins). 313/313 tests.
  Nothing committed.

# ROUND D97 (2026-08-28) — your triage answers + the piano songs. FOR ETHAN:

- THE BIG ONE, and you said it three times without me asking: foundations were
  changing by ONE NOTE and that isn't variation. You were literally right. I
  measured the code: of the 66 accompaniment variations in the suite, **65
  changed exactly one thing** and one changed nothing, half of them fired the
  same device (bump the last note up an octave), and **76% never moved a single
  onset** — so the rhythm never varied at all. Worse: across every song the
  engine has ever written, **99.3% of accompaniment notes are the root, third
  or fifth. It has never once played a 4th, 6th, 7th or 9th above its own
  bass.** Your Spirited Away scores use 11 and 12 different intervals.
- FIXED. The accompaniment is now a FOUR-bar unit and each bar owes a real
  change, by category: bar 2 always moves the RHYTHM, bar 3 always rewrites the
  INTERVALS, bar 4 is a turnaround. If a form can't make its quota it escalates
  to a different one instead of falling back to the one-note edit. Measured
  after: changed events per bar went from "1, 65 times" to a median of 4 and a
  max of 16, and 4ths/6ths/9ths/scale tones now actually appear.
- AND SECTIONS CHANGE OVER TIME, your other point. A returning A section used
  to be byte-identical to the first one. It now gets its own treatment. (Ryuu
  no Shounen does exactly this — the same Bb-C-Am progression comes back three
  times as a broken arp, then block chords, then root-fifth 8ths.)
- YOU CAUGHT A BUG TWO OF MY AGENTS MISSED. You wrote "just another default
  Alberti" and "Alberti not match atmospheric" on two different jungle cards.
  You were right and it was worse than you knew: **every one of the nine jungle
  demos shared that same Alberti line**, so it was the one thing the A/B could
  never test. The lane law was supposed to ban it and the jungle branch of the
  code had simply been left out. Jungle now plays a written vamp instead —
  3+3+2, no thirds on the strong beats, dyads for body.
- BOILER MUSHI. The spooky part starts at 1:29 (a 0.85s silence, unmistakable).
  Here's the thing: **it isn't dissonant at all.** Those bars contain zero
  sustained minor 2nds, minor 9ths, 7ths or tritones — one of your CALM songs
  beats it on clashing notes. What makes it spooky is that the left hand keeps
  sliding by a half step: 51% of its steps are semitones, against 0-2% for
  every horror song the engine has written. And the proof is inside the file —
  the intro repeats a cell for 13 bars too, but that cell is octave leaps and
  it isn't spooky. It's not the repetition, it's the semitone inside it. That
  ostinato now plays on scary_manor (measured 35% semitone motion there now).
- EVERYTHING ELSE YOU ANSWERED: desert got the bII shuttle (with your "too
  harmonious" chord swapped for one that clashes with the tonic on both sides)
  and an opt-in drone section; the NSMB off-beat drum went in as a third floor
  (the real blocker was the drum picker, which silently capped at two); the
  string wobble ships as a texture, now usable outside desert and with more
  bite; :6 chords work (turns out `6` already did — `m6` was the actual gap);
  swing is built, and the "notes are really really short" was a real bug in my
  demo, not in the idea; the choir pincer is in, and it now switches OFF the
  other horror devices because the law is one per song and catacombs was
  quietly running two; the distorted guitars are in and the cackle/choir aren't.
- ONE THING I DIDN'T DO, and I need your word. **You clicked "actually keep the
  tail" — which reverses what you told me last round** ("it should just be
  removed because it just doesnt sound that good"). I didn't flip it on one
  synthetic demo. Both builds exist: `audition/songs.html` (tail removed, what
  ships) and `audition/songs-tailkeep.html` (tail kept). Play the same song in
  each. And a correction to what I told you on that card: I said the two paths
  "differ by a couple of notes" — on real songs the tail actually costs 13.7%
  of the melody notes, up to 31.7% on scary_citadel. Bigger than I said.
- A CORRECTION ABOUT YOUR TERRARIA FILE: the mp3 you sent is a RENDER OF YOUR
  OWN get_proto.mid, not the Terraria track. So the "jungle wanders, no
  repeating loop" evidence behind that card was measuring your sketch. It
  doesn't actually wander — its harmony moves in dotted quarters against a 4/4
  bar, so it only lines up with the barline every 3 bars, which is what fooled
  the loop finder. I did NOT build the wandering form (you said "uhh im not
  sure if it'd sound good", and now the premise is gone too). Also: get_proto-2
  is a completely different piece, not a version 2 — zero shared material.
- STILL WAITING ON YOU: the Egyptian song link (asked twice now), whether
  desert melodies should use the NSMB scale, and whether Andalusian/western
  counts as desert ("im not sure").
- 26 songs changed, 17 byte-identical — and those 17 are exactly your keeps and
  pinned songs. 313/313 tests. Nothing committed.

# ROUND D96 (2026-08-28) — the extractor repair. FOR ETHAN:

- YOU ASKED ME TO REPAIR THE EXTRACTOR. Done, and here's what was wrong. It
  was looking for chord loops that repeat EXACTLY. Real game music repeats a
  four-bar loop with a different last bar — a turnaround — and one differing
  half-bar was enough to make it reject the whole thing. It also never looked
  for one-bar loops at all, which is what most vamps are. Now a repeat needs
  85% of its slots to agree, one-bar loops are searched, and when a loop does
  repeat the engine takes a VOTE across the repetitions instead of trusting
  the first pass (so the odd turnaround bar gets outvoted by the plain ones).
- MEASURED: across 1,388 files, **72% → 87% now yield a loop. 217 files that
  extracted nothing before now work, and not one file lost a loop it already
  had.** Pokemon's champion battle and the ghost-house theme both work now.
- A SECOND BUG fell out of it: one Genesis file declares a nonsense time
  signature (0 beats per bar). That made the bar length zero, which made every
  bar number infinite, which CRASHED the entire import run instead of skipping
  one file. Fixed.
- I DID NOT let any of this touch your songs. Regenerating the libraries with
  the repaired extractor moves 33 of 43 songs including kept ones — the same
  trap as last round. So the two importers are now pinned, in writing at the
  call site, to the old behaviour; the repair is the default everywhere else.
  Even so the crash-fix leaked once (it made a new file readable, which
  re-counted the model and moved 4 songs, one of them a keep) — that file is
  now an explicit, documented exclusion. **All 43 songs are byte-identical to
  before the repair.** 313/313 tests, 3 of them new and pinning exactly this.
- WHAT I DIDN'T FIX, honestly: SMB2's overworld still comes back empty. Its
  loop recurs shifted by a pickup, and the search only looks for repeats that
  sit back-to-back — so a song shaped A-B-A-C, where A returns later rather
  than immediately, is still invisible. That's the next thing to fix here if
  you want it.
- SMW Central: thanks, noted as covered.
- The triage page is unchanged and still the main thing waiting on you.

# ROUND r15 (2026-08-28) — the reference round. FOR ETHAN:

**THE ONE THING TO DO: open `audition/triage.html`.** It's a new page — 34
questions I couldn't answer without your ear, each with the measurement it
came from, and (where an ear settles it) A/B demos generated by the ENGINE
plus the raw reference audio. Answer what you have an opinion on, skip the
rest, hit "copy answers JSON", paste it back. Those answers are what I'll
build next round. Two of them I genuinely can't proceed without:
  - **the Egyptian song link never arrived** ("egyptian-themed is very good
    for desert. like this song" — no link came through);
  - **what is get_proto.mid**, and which lane did you add it for?

- YOUR TAIL RULING IS IN. "it should just be removed" — the cadence tail is
  no longer thinned or held; the cadence bar keeps its full cell. (Replaces
  last round's rotation. The A/B is on the triage page under "grammar" if
  you want to confirm it by ear.)
- YOUR SCALE NOTE IS IN. "instead of purely thinking in chords, also think
  in scales" — the figure grammar now has chord-scale tokens (s2/s4/s6/s7)
  that resolve against the actual scale of the chord underneath, and the
  foundation variation palette grew two scale-shaped forms (a rising
  pickup, and a scale cluster) on top of the three it had.
- ALL 43 SONGS UNCHANGED by everything above (the new dials only fire on
  fresh material) — 17/17 kept byte-identical, 307/307 tests.
- I ANALYZED YOUR REFERENCES, note by note. Four reports in `research/`:
  - `midi-desert-analysis.md` — your NSMB Desert package, decoded from the
    .brr/.txt and measured. Correction worth knowing: **there is no 66bpm
    middle section** — the tempo never changes; the "slow" middle is a
    TEXTURE trick (drop the 16th floor, halve the bass, one chord a bar).
  - `jungle-language-r15.md` — all five jungle references. The headline:
    **your Battle Cats example leans major/mixolydian and the engine's
    jungle lock is minor-only**, and the 3-onset tumbao bass I gave you
    last round is contradicted by every single reference.
  - `brr-samples-r15.md` — all 24 BRR voices decoded and QC'd. The real
    NSMB sitar, tabla, low drum and "bah" stab are usable now; the
    sustaining voices lost their loop points in the decode and click.
  - `misc-refs-r15.md` — get_proto and "What's This" (the goofy-spooky
    fusion, measured).
- CORPUS: 1,790 MIDIs fetched and classified by a 15-agent fleet (hsmusic
  352, VGMusic 1,200 + 240 lane-keyword hits) plus SMW Central's full
  9,725-entry catalog WITH its author tags — atlas in
  `research/corpus-atlas-r15.md`. Where it leaves the lanes: desert 79
  tracks (41 usable), jungle 57 (23), space 97, catacombs 54, manor 43,
  **citadel only 8** — citadel may have to stay composed rather than mined.
  Eight of the fleet's taste calls are on the triage page under "corpus";
  two of them (is desert Hijaz-only, are dim chains ever allowed) move the
  desert pool more than any individual track would.
- THE CORPUS'S REAL HEADLINE, and it wasn't what I expected: **71% of those
  1,790 files have a data-quality problem and only 525 are clean.** 377
  returned NO chord loop at all despite having hundreds of melody notes
  (SMB2's overworld, Pokemon's champion battle, SMW's ghost house — all
  nothing), and the key detector's median confidence margin is 0.021 where
  0.05 is the bar. So the honest next move is repairing the extractor
  before mining anything, not hauling in more files. I have not touched it
  yet — it is the top of the next round unless you want something else.
- AN HONEST ONE: the adversarial pass on my own demo page found two of my
  card blurbs had wrong numbers in them (I had repeated a "~11 hits/bar"
  figure the source report itself got wrong — the real grid is ~22), and
  that four of the A/B pairs change more than one thing at once. Rather
  than quietly ship those, each such card now carries a yellow "what this
  A/B can't tell you" note. One of them is worth knowing up front: on the
  desert floor card, the engine ALREADY plays that figure and those accents
  almost exactly — if a and b sound the same to you, that is the finding.
- A TRAP I HIT AND BACKED OUT OF: importing the bigger corpus re-counts the
  harmony model, and that silently **changed 18 songs including kept ones**
  (sad_shop's treat flipped mixture→suspend). Reverted; `audios/vgmusic/`
  is now frozen at its judged 400-file manifest and research corpora are
  kept separate. Nothing you've judged moved.
- LICENSING FLAG: the BRR samples are rips of Nintendo audio. The sample
  pack commits audio into the repo, so I've committed none of it and the
  reference-audio file is gitignored. There's a card asking how you want it
  handled — it blocks the NSMB voices either way.
- SMW Central: I scraped it with a polite JSON-API fetcher, but you only
  mentioned permission from hsmusic and vgmusic. Say if that's covered.
- Nothing committed (say the word).

# ROUND D94 (2026-08-28) — the seriousness round. FOR ETHAN:

- (NOTE: todo.md was hand-edited in your editor at 23:19 during this round
  and the save overwrote the D93+D94 summary blocks — restored below. If
  todo.md is still open in a tab, RELOAD it before saving again.)
- LISTEN: 26 songs changed (your 18 noted genre songs + 8 unkept songs that
  absorbed the new engine laws). All 14 keeps + tense_lab/goofy_casino/
  calm_space byte-identical. Export verdicts as usual.
- CLICK KEEP for vs_calm_space ("I really like this! ... almost liminal")
  and vs_tense_lab ("love this ... amazing") — both are prose-pinned but
  still unclicked; the pin is a stopgap until the click lands.
- THE BIG FIX — "playful" horror/desert/jungle: your notes all traced to
  the same devices (music-box sparkle, slap-bass funk bounce, square-wave
  casts, boogie/bossa/alberti foundations) firing in serious lanes. They're
  lane-banned now; catacombs leads = solo violin, citadel = organ/
  harpsichord/trumpet, casts retint dark.
- YOUR STACCATO-STRINGS LAW is in: marcato is now a chordal ostinato
  (multiple notes per hit, its own rhythm, harmony role) — hear it on
  vs_excited_fight and vs_excited_training.
- DESERT: researched game desert progressions (report in research/
  progressions-desert-jungle-r14.md) — mysterious_desert now runs the
  GERUDO VALLEY progression (i-bVI-bVII-V7, harmonic-minor melody),
  happy_desert the double-harmonic HIJAZ vamp (major tonic against bII),
  somber/tense keep the bII trope; desert melodies now walk Hijaz/harmonic
  minor (the "too happy" melody fix); desert acc left the piano
  (bowed drone / marimba); somber_desert has the slow marimba floor +
  counterline + descant (the "bare" fix).
- JUNGLE: real modal vamps now (dorian i-IV-v-IV on happy, Stickerbush
  wash on mysterious), marimba acc, round tumbao bass replacing the slap.
- MELODY TAILS: the "overused last 4-6 notes" (your triumphant_citadel
  note + the mysterious_space conversation) — phrase tails now rotate
  four shapes per phrase per song, and giant chord-spelling leaps fold
  to the nearest octave. Every unkept song benefits.
- Foundations are no longer exact replicates: bar 2 of every unkept acc
  carries one embellishment (your "extra stuff" note).
- VERIFY PASS caught + fixed (details in D94 addendum): desert travel
  edges still walked into Alberti (regex gap); cast violin/trumpet/oboe
  lines composed 1-2 octaves above their instruments' real ranges
  (somber_citadel's violin counter folded 100% in HQ, contour inverted —
  now composed in range, folds 117→6); high-tonic songs seated the jungle
  bass and marcato a fifth high (pocket seating); violin stingers moved
  into range. All re-rendered; 307/307; 17/17 kept byte-identical.
- ASSUMED STALE (byte-identical re-exports, not re-fixed): your notes on
  casino/training/rest/somber_snow/festival/nostalgic_shop/goofy_casino/
  stealth/menu/lab/construction — those fixes shipped last round and are
  still unheard. If any was a REAL re-complaint, say so and I'll dig in.
- Nothing committed yet (say the word) — the D93 checklist below still
  applies, plus this round's engine/page/research changes.

# ROUND D93 (2026-08-27) — the genre-expansion round. FOR ETHAN:

- LISTEN: audition/songs.html now has 43 songs — 20 new (3 desert, 3 space,
  3 horror-ambience "manor", 3 horror-action "catacombs", 4 "citadel" incl.
  the ACTIVE BATTLE CHOIR song (vs_triumphant_citadel), the SOFT MAGICAL
  CHOIR song (vs_calm_shrine), and 3 reel demos: vs_excited_fight
  (busy-battle), vs_happy_jungle, vs_mysterious_jungle (abstract nature)).
  Click keeps/kills + notes as usual; export when done.
- FIXED per your notes: vs_mysterious_desert (sitar lead, hand-drum iqa',
  marimba desert floor, dry room — the "sounds like space" complaint);
  vs_mysterious_cave (+music-box riding the piano RH melody) and
  vs_nostalgic_snow (+celesta ditto) — additive only, measured.
- Your 16 horror files are wired: loops = background beds, short ones =
  one-shot stingers/risers (exactly your sorting). They sound in web AND
  HQ playback. Ambient beds appear on some horror songs only.
- Your promised loopable ambience noises (whispering etc.): drop the files
  in audios/horror-fx/, add rows to src/lib/sample-pack-def.js, run
  scripts/build-sample-pack.mjs — they become available as beds.
- HEADS-UP: note N5 ("sneaky heist vibe") matched NO video in
  videoswithtipsattached (11 reels for 10 notes; three read as battle/
  groove reels). If the heist reel exists, re-export it and I'll analyze.
- LICENSE flag: the horror wavs came from downloaded packs (license
  unknown) — fine for auditioning; confirm rights before shipping. The
  taiko ensemble lib worth adding is CC-BY-SA (needs your ok); VCSL/VSCO
  percussion + SSO choir now wired are CC0/CC-Sampling-Plus (fine).
- Answered from the reels: the Roblox "Elevator Jam" lead is a REAL
  TRUMPET (mocked on a JV-1080 rompler; MeowSynth only cameos). The
  "warp fade with the white lines" = exponential portamento entrances +
  per-layer fade-ins — browser tier can do it today (penv/accelerate);
  HQ needs pitch-bend stems (deferred, documented in the cookbook).
- COMMIT CHECKLIST (nothing committed yet — say the word and I'll commit):
  modified engine/test/page files + NEW UNTRACKED: audition/sample-pack.js
  (13MB — the page needs it or hx_/vc_/choir sounds are silent on a fresh
  clone), vendor/patches/*.fxp (15 new Surge patches), vendor/sfz/gen/
  choir-*.sfz + marimba.sfz, scripts/build-sample-pack.mjs,
  build-choir-sfz.mjs, src/lib/sample-pack-def.js, research/*.md, and
  audition/hq/*.wav for the new/changed songs. (vendor/sfz/SSO-Chorus
  samples + audios/horror-fx wavs stay local like VCSL, per repo policy.)
- Verify pass caught + fixed in D93 (details in D93 addendum): the choir
  sfz routes were being clobbered (choir rendered as GM PIANO in HQ for
  all five choir songs — fixed, re-rendered, stem-verified); somber
  desert's B section had lost its hand drums twice (percAllBars now rides
  through energy + breakdown masks); the music-box song grew an octave-2
  celesta bass (accOctave is now a bind-time floor); shrine's choir pad
  sang below the female register (padSound retint to the register-honest
  mixed sfz); two desert songs shared tonic C (keyHint — now C/G/B/D).
- PARKED: foundations.test races the verdicts round-trip test during npm
  test (pre-existing; reproduced at clean HEAD) — pages get rebuilt
  single-threaded after the final test run each round until fixed.

- research into how to improve and how to train melody
- expand to different genres (and mixing of genres)

- get .midi of toby fox and .wav of laufey
- [done, D30] Undertale MIDI (110 files) ingested — harmony/bass side only:
  166 chord loops (progressions-undertale.js), 85 accompaniment figurations as
  chord-relative tokens + bindFigure() (figurations-undertale.js), rhythm
  skeletons, 11 observed development moves; melody = notes only
  (undertale-melody.md). All ratified:false. Audition at audition/undertale.html
  (figures tab: switch the progression to hear the same movement re-voiced).
  NEXT: (a) listen + keep/kill — 47 progressions and 39 figures are needsEar
  (chord/key solved from notes with thin evidence), (b) promote kept figures'
  character lines, (c) consider 2-bar figuration mining (current entries are
  1-bar) once round 1 says the abstraction sounds right.
  [round 2, D33] "notes sound wrong" was: thirdless labels (D5/Csus for Dm/C —
  now diatonic-completed), figure octaves, and the page playing C@110 with
  flattened chord durations. Page now plays solved key + source bpm, has a
  "true chords" texture, and per-card VERBATIM SOURCE playback ('a' key) —
  A/B extraction vs the actual MIDI before killing an entry.
  [round 3, D34] melody-in-chords fixed (octave-double reassignment + acc-only
  quality + built-not-voted completion), and each progression now carries
  ownFigure — its own interval deployment, the DEFAULT texture ("own pattern").
  Megalovania round-trips note-for-note (regression-tested). 127/163 loops
  have own patterns; the rest fall back to true chords.
- [done, D29] Unison packs in audios/ ingested: 72 progressions + 12 drum-loop
  rhythms + 91 voicing observations (all ratified:false). Audition at
  audition/unison.html. NEXT: (a) listen + keep/kill, (b) 17 progressions are
  flagged needsEar because the filename label disagrees with the notes, (c) 6
  drum parts need an accent profile authored before they can bind, (d) promote
  observed voicings into src/lib/voicings.js to close the D28 gaps.
- NOT ingested: 124 WAV one-shots + FX from those packs. They are A7 instrument
  palette material and need sample hosting the engine has no story for yet.
- explore chord manipulation for variation (see ldrolez video)
- [done, D28] ldrolez/free-midi-chords: 188 progressions imported as a candidate
  pool (src/lib/progressions.js). NEXT: audition to promote ~20-30 into the library
  (that's when each gets a `character` line and ratified:true).
- MIDI Crate by phelpsiemusic.com — redistribution cleared. Use it as a
  VOICING/COMPING/ACCENT source, not a progression source (D28). Blocked on the A6
  extractor. First action on the subscription: A6.2 triage (velocity variance /
  grid deviation) to learn whether the files are humanized or quantized.
- 6 chord qualities have no voicing shapes yet (2 5 69 add9 m6 madd9) — 14 of the
  188 progressions can't be voiced until someone writes and auditions them.
- incorporate sound effects like fades for transition or emphasis.
- [done, D31] audio export: `cli.js export <songdir> --wav` = haps -> song.mid
  (@tonejs/midi, exact) -> song.wav (fluidsynth + GeneralUser GS in
  vendor/soundfonts/). NEXT if render quality matters: DAW finishing tier
  (import song.mid, real instruments per track; Reaper can render headlessly).
  OSC -> StrudelDirt deferred (realtime-only, SC install, one fixed palette).

- alan walker syntax incorporation

- [researched, D32] chord manipulation (octave displacement, chord-to-instrument
  distribution), instrument choice/doubling relations, loop-vs-rising-tension
  structure + controlling instruments over time, arpeggio types / traversal
  rhythms / staccato-vs-hold, bass-lowest rule -> arrangement-grammar.md.
  Decision procedure everywhere: hard rules -> cost ranking -> seeded choice,
  variation only at structural triggers (never per-chord dice); every choice a
  declared typed operator. NEXT: implement §1 voicing operators AS the queued
  D24 binder-revoicing pass (bass-note-integrity + bass-lowest lints first,
  verifier-side), then phrase grid + ramp policies (§4.2); thresholds in the
  doc are audition-tunable defaults.

- eventually apply midi to samples
- assessment of strudle for music representation

- [built, D36] pattern atlas + melody pipeline (design: atlas-and-melody.md,
  D35). Atlas: scripts/build-atlas.mjs -> src/lib/atlas.js (425 progressions /
  95 figures / 84 rhythms across all pools; vibe/speed features, sections by
  clustering, per-axis neighbor lists; neighborhood() returns FAMILIES, never
  one entry) + src/lib/undertale-context.js (hand-curated song context for the
  88 pool songs — role/character/leitmotif family/arc, documented sources
  only, uncurated tracks say so). Melody: chordScale() in theory.js
  (parent-scale search, b9-rule-derived avoids), bindMelody()+melodyReport()
  in bind.js (cell-first, anchors snap / approach tones resolve / weak beats
  from the chord-scale, seeded+deterministic), melody-profiles.js (toby-fox =
  the corpus numbers). Audition page: cards grouped by atlas section, context
  in tooltips, new "own + melody" texture = the pipeline audible per song.
  1676/1676 patterns green. [round 1, D36 addendum] "notes don't sound
  legal" = full jazz chord-scales (13% of notes out of key) -> triadic
  tension depth: supply = (chord-scale ∩ key) + the chord's own tones;
  offKeyUnforced now 0, machine-checked. [round 2, D37] "a layer, not the
  lead singer" -> melody-form.md research (MeloForm/MELONS/Huron/step
  inertia) -> bindMelody v2: phrase plan (motif·answer·motif·cadence),
  thinned+held cadence bars with a breath, antecedent/consequent landings,
  arch contour, step-inertia runs, restatement tail variation. 137/137
  tests. [round 3, D38] "still a gamble, no story" -> tier 2 BUILT:
  bindMelodySpec() = authored-melody guard (anchors snap loudly, altered
  degrees stand, off-supply notes resolve-or-snap) + melodies-tier2.js (6
  Claude-composed flagship melodies, reduction-first, A6.1 candidates) +
  "melody T2" audition texture for A/B vs the generated tier-1 line.
  [D38 addendum] authored set expanded to 22 songs spanning meters 2/4 2/2
  3/4 4/4 4/2 5/4 6/8, tempos 47-175, diatonic + chromatic; all 16 new specs
  passed the guard on first render (anchor tables computed before composing).
  Page has a blue "tier 2" flag + "only TIER 2" filter.
  [round 4, D39] verdict "clean but same-y/lifeless" -> MEASURED against the
  corpus's own melody streams and split in two: LIFELESS was the renderer
  (we emitted 100% legato; Toby is 24/25/51 staccato/detached/legato) ->
  articulation layer built (per-note duration ratio via .clip(), pitch-aware:
  steps connect, leaps lift, repeats re-articulate; now 22/30/48 at mean
  0.86). SAME-Y is the authoring (15 rhythms over 116 bars, top 5 = 82%;
  density 3.54/bar vs corpus 8.25, stdev 1.22 vs 5.08) — deliberately left
  as the tier-3 question, now isolated from the rendering confound.
  [round 5, D40] "it is actually much better" -> articulation confirmed as
  most of "lifeless". Remaining same-y attacked WITHOUT training: mined 37
  MELODY_RHYTHMS_UNDERTALE cells from the melody streams (rhythm + accents +
  artic only, no pitch — D30 ruling holds), stratified by density so the pool
  spans 2..16 notes/bar. Tier 1 now draws 26 distinct cells across 165 cards
  (was 1), density 7.25 vs the corpus's 8.25.
  [round 6, D41] His Theme + Gasters "own+melody" very good; rest good but
  style-mismatched ("hyper"). Analyzed the two praised cards -> five two-hand
  principles (density complementarity, register lanes, articulation contrast,
  interlock-at-anchors, thirdless-frame/melody-colour) recorded in D41 as the
  layering phase's starting rules. Built: ENERGY toggle (auto=tempo default
  unchanged | context=atlas role decides | calm/mid/hyper pin the band) +
  "+ counter (triangle)" background voice (calm cell, oct 4, own seed).
  [D42] soundfonts wired (@strudel/soundfonts, ~128 gm_* voices, lazy per
  instrument, graceful fallback); energy REMOVED from the UI and derived at
  generation time by density complementarity (activity budget - accompaniment
  density; praised cards bit-identical, Megalovania 8->3 fixes "hyper");
  counter instrument chosen by context role; playback bugs fixed (no overlap:
  generation-guarded + hush-before-evaluate; no JS error: stop on tab switch +
  codeFor tab guard; settings persist across refresh).
  [D43/D44] ARRANGER built: src/lib/instruments.js (15 gm voices described in
  words + properties) + src/binder/arrange.js (planArrangement/
  renderArrangement; situation -> headroom -> slate -> casting -> lanes; two
  costs: adds=new onsets vs mass=spectral weight; part-appropriate instrument
  fit; edit-ready metadata per layer). Audition: "full mix" texture + solo row
  (hear any single contribution alone) + full plan in the card tooltip.
  Melody: interlock-scored cell choice (hyper allowed when it counters) and a
  deterministic repeat policy (vary | exact | rest — loops and silence are
  legitimate). 165/165 cards arranged, 10 instruments in play.
  [D42 addendum] sample loading hardened after a live blackout: mirrors per
  map (raw.githubusercontent -> jsdelivr), piano degrades to gm_acoustic_piano
  when its map is unreachable, fatal only if NOTHING can sound; tested with a
  simulated dead host.
  NEXT (Ethan's stated order): (1) HARMONY GENERATION — compose progressions,
  not just replay extracted loops; (2) LAYERING — harmonies + lead + ~2 more
  instruments, engine-side instrument palette decision (load gm_* soundfonts
  or more dough-samples banks), encode the five D41 principles as layering
  lints; (3) CHRONOLOGICAL EDITING — prompt-driven song edits (add/change
  notes/instruments/vibe, escalation, drops). Tier 3 stays parked unless
  pitch same-y resurfaces.
  (b) if T2 wins by ear, author more specs + wire spec-authoring into song
  generation (LLM composes per song, guard renders); (c) tier 3 (train a
  scale-degree melody model on Hooktheory-style data; ~15k AWS credits
  cover compute many times over — data prep is the real cost) only if the
  T2 ceiling shows.

ALSO FIND MORE BOSSA NOVA / WALTZ / CINEMATIC STUFF. THEN SPECIFIALIZE IN SYNTH MUSIC (look on instagram)

pattern atlas

- further understanding of flow of sections in music


todo changes:
- modal numerals: tonic-relative degrees transcode to ionian-relative

____

CURRENT:

these are very good in the own + melody version. analyze the patterns here between the left and right hands that make it sound good (tell me). the other ones for both "own + melody" and (melody t2) are good but just different styles

in general, the "own + melody" is very hyper and sounds good music-wise but it's two different styles. i think keep this, but add like a variation toggle for the rhythm (not randomized of course) depending on what the user is building the song for and their context. moreover i think the current "own + melody" melodies could also be kept as like a background instrument in the harmony with a different instrument or something (what are strudle's other instruments we could use)? 

i think the music currently is up to an ok standard (still want to test actual harmony generation though rather than just using hardcoded harmonies). my next focus will be the harmony creation ofc and layering of different notes (like layering of different harmonies and a lead melody and instrument management with like 2 added instruments) and then after that, chrnological editing (like editing a song to add or change the notes/instruments/vibhe and/or adding stuff to it (like requesting escalation or drops etc via prompt)
____

ROUND 9 (2026-08-23) — done:
- D45 chord-label evidence gate. Dating Start's weird bar was an `A^7` invented
  over an Ab->A->Bb bass walk; the corpus audit found 75% of `^7` labels had no
  third sounding anywhere. Colour must now be heard in the accompaniment; a
  poorly-covered one-window segment is absorbed by a neighbour that explains it
  better. Corpus relabelled; 3 tier-2 specs rewritten to match.
- D46 instrument palette 15 -> 43, with `range` (music box no longer at oct 6)
  and `level` (the flute is now audible). Slates vary per song, so
  harmony_support fell from 54% of layers to 25%.

NEXT (Ethan's stated order):
1. HARMONY GENERATION — compose progressions rather than replay extracted loops
2. LAYERING — continue; encode the five D41 two-hand principles as lints
3. CHRONOLOGICAL EDITING — prompt-driven edits (escalation, drops, swaps);
   the D43/D46 layer metadata exists to serve this

Open questions for the next ear pass:
- 11 instruments are still never cast (glockenspiel, epiano1, nylon guitar,
  harp, ocarina, oboe, string ensemble, pad_halo, pad_new_age, choir_aahs,
  calliope). Dominated rather than excluded — worth checking whether the mood
  vocabulary or the tempo-fit curve is what shuts them out.
- melody_takeover silences the piano lead in 33 of 161 cards (20%). Ethan's
  brief was "keep piano the same and layer on top", so this may want capping.

ROUND 10 (2026-08-23) — done:
- D47 FORM. Songs are now sections, not one constant texture: ostinato → bed →
  statement → answer → full → breakdown/tag, chosen per role AND per roster,
  masked per bar. Mean layers 1.47 → 2.6; 161/161 cards have layers; 34
  instruments in play. Takeover is now a HANDOFF at a section boundary — cast
  43, leads 43, zero lead gaps after the tune arrives.

STILL OPEN after round 10:
- Transitions are hard cuts at phrase boundaries (correct for chiptune, and
  what horizontal resequencing does). Per-cycle .gain() is verified patternable
  if a swell is wanted for pads specifically.
- The piano accompaniment never drops out. A breakdown that strips IT would be
  the most dramatic move available and is not yet reachable.
- 9 instruments still never cast (glockenspiel is now 1×, so the tail is
  thinning): epiano1, nylon guitar, harp, ocarina, string_ensemble_1,
  choir_aahs, pizzicato, synth_bass_1, calliope.
- Section length is one loop/phrase. Real songs vary section LENGTH too
  (an 8-bar verse, a 4-bar pre-chorus); everything here is uniform.

ROUND 11 (2026-08-23) — done:
- D48: the GM soundfont bank had NEVER loaded. @strudel/soundfonts ships with
  bare import specifiers a browser cannot resolve, so every gm_* voice was
  silently rewritten to the triangle fallback — the whole 43-instrument palette
  was one oscillator. Fixed by rewriting the specifiers to blob shims bound to
  the RUNNING strudel instance (module identity matters: a second copy of
  @strudel/webaudio registers into a registry the scheduler never reads).
  Also: the banner no longer clears one subsystem's warning when another
  succeeds, which is why this was invisible.
- D48 addendum: sfumato's own dep (soundfont2) ships a UMD as its "module"
  entry, so no CDN autobuild of sfumato works. Now fetched and rewritten too,
  with the soundfont2 shim reading the global the UMD sets. Also found
  PIANO_FALLBACK named a sound the bank never registers (gm_piano, not
  gm_acoustic_piano). All 43 palette instruments confirmed registering.
- D48 addendum 2: pages now report "ready · N GM voices · build <stamp>" so a
  stale copy is visible without an ear. Real-Chrome probe harness documented in
  DECISIONS (headless --dump-dom against the page + an appended probe script).

ROUND 12 (2026-08-23) — done:
- D49 HARMONY GENERATION (phase 1). Progressions are now COMPOSED, not
  retrieved: a counted prior (root bigram + quality-given-degree + a separate
  loop-WRAP cadence table, per family and per family-split pack) ranked under
  D32's procedure. Research + the data-source answer in harmony-generation.md.
  96 composed progressions are on audition/progressions.html beside the 188
  imported ones behind a `source` filter — that A/B is the ear pass.
- Found and gated 6 corpus entries whose labels the source never supported
  (Rocket Man: all 9 chords `-#5`, match.agree 0, shipped needsEar:false).

NEXT:
1. EAR PASS on audition/progressions.html — filter to `generated`, A/B against
   `imported`. Nothing composed has been heard. Specifically worth judging:
   - is 0.80 distinct-degree (vs the corpus's 0.88) "solid" or "dull"?
   - the rare tail: `o` on degree 7, `bviim` in minor (corpus-attested at n=1-2)
   - do the composed CADENCES land, given they came from the wrap table?
2. Wire the generator into song generation (audition-undertale.mjs still binds
   extracted entries only). Deliberately not done until the ear pass passes.
3. LAYERING — continue; encode the five D41 two-hand principles as lints.
4. CHRONOLOGICAL EDITING — the D49 `derivation` exists to serve this.

STILL OPEN after round 12:
- Only CYCLES are generated. A through-composed phrase with a real ending is
  not expressible, and the corpus cannot teach it (the corpus is all loops).
- The unison importer RECORDS that it agreed with nothing (`match.agree: 0`) and
  ships the entry as `needsEar: false` anyway. The gate is currently in the
  model builder; it belongs in the importer.
- Style breadth is still the real data gap (bossa/waltz/cinematic/synth). If
  importing: When-in-Rome first (RomanText, CC BY-SA, transcoder not labeller),
  then CoCoPops/Billboard, then VGMusic. NOT Lakh.
- (carried) transitions are hard cuts; the piano accompaniment never drops out;
  9 instruments never cast; section length is uniform.

ROUND 13 (2026-08-24) — done:
- D50 EXEMPLAR VARIATION, after Ethan's pushback that D49 produced "valid" not
  "nice". Progressions with outside evidence of success are now the FOUNDATION,
  changed by a closed set of 8 typed substitutions that each declare what they
  preserve. D49's counted model survives as the VERIFIER, with the bar set by
  the exemplar itself. audition/progressions.html: 372 cards, foundations
  followed immediately by their own variations.

NEXT — and (1) is now blocking, not optional:
1. *** RATIFY SOME PROGRESSIONS. *** exemplarPool() wants entries Ethan has kept
   by ear; there are ZERO. The audition pages have been writing keep/kill to
   localStorage since D28 with no path back into the library, so the pool falls
   back to `unison-famous` and says so in a caveat. D50 is only as good as its
   foundations. Two jobs:
   (a) Ethan: open audition/progressions.html, keep/kill, hit "copy verdicts
       JSON". Filter source=foundation and source=varied first — that A/B is
       the fastest way to judge whether the strategy works at all.
   (b) then build scripts/import-verdicts.mjs so the JSON lands in the library
       and exemplarPool() returns ratified entries instead of a stand-in.
2. Global (whole-cycle) scoring — tension curve, voice-leading across the loop,
   cadential strength. Attacks "goodness is not local" head on and is the
   strongest complement to D50. Wait for the ear pass to say which variations
   landed before building it.
3. Wire harmony into song generation (audition-undertale.mjs still binds
   extracted entries only). Blocked on the ear pass.
4. LAYERING — the five D41 two-hand principles as lints.
5. CHRONOLOGICAL EDITING — D49 `derivation` and D50 `lineage` exist for this.

STILL OPEN after round 13:
- 9 of the 22 foundations cannot be voiced by any me_* dictionary (they need
  13sus, 6, ^7#5, add9 — D28's deferred, ear-gated tail). Those exemplars are
  unhearable on the audition page, so their variations cannot be judged.
- Only CYCLES. A through-composed phrase with a real ending is still not
  expressible, and the corpus (all loops) cannot teach it.
- The unison importer records `match.agree: 0` and ships the entry as
  `needsEar: false` anyway. Gate lives in the model builder; belongs upstream.
- (carried) transitions are hard cuts; the piano accompaniment never drops out;
  9 instruments never cast; section length is uniform.

ROUND 14 (2026-08-24) — done:
- D51: the ear loop is CLOSED. scripts/import-verdicts.mjs + src/lib/verdicts.js
  + an overlay in progressions-tail.js, so `ratified` finally means something.
  36 verdicts landed (11 keep / 25 kill); 1 was stale and is reported.
- Measured what the verdicts correlate with. HEADLINE: the strongest separator
  is label COVERAGE (0.95 keep vs 0.84 kill) — a transcription metric, not
  taste. Much of the first pass was Ethan rejecting bad D45 transcriptions.
  The real taste signal is PLAIN TRIADS (85% vs 59%, three independent measures
  agreeing). Cadence/plausibility/chords-per-bar predict NOTHING (|d|<0.1) —
  which is what D49's verifier measures. Recorded in src/lib/taste.js, derived
  from the verdict file, confidence: low.

NEXT:
1. Re-transcribe or drop the low-coverage Undertale entries. The ear pass says
   6+ of them are simply wrong, and they are polluting both the corpus and the
   counted model. Cheapest real win available.
2. MORE EXEMPLARS, and not via keep/kill — that channel measured transcription
   error. Ranked in harmony-generation.md §9: (a) Ethan drops MIDI of songs he
   likes into audios/ — highest bandwidth, machinery already exists; (b) he
   names songs; (c) he points at ONE moment and says what about it (this is
   what produced D41 and D47 — highest value per minute); (d) build A/B pair
   judging into the audition pages, which is easier to answer than keep/kill
   and yields a ranking.
3. Do NOT wire tasteProfile() into generator defaults yet — n=36, and the
   profile's strongest term is a transcription artifact.
4. Global (whole-cycle) scoring — still the strongest complement to D50, and
   now better motivated: the per-transition scoring D49 does predicts nothing
   about what Ethan keeps.
5. (carried) wire harmony into song generation; LAYERING lints; CHRONOLOGICAL
   EDITING.

STILL OPEN after round 14:
- The exemplar pool is 11 ratified + 22 famous. Want 20+ ratified, and from
  more than one idiom — every current keep is Undertale.
- (carried) 9 of 22 famous foundations are unvoiceable by any me_* dictionary;
  only cycles, no through-composed phrases; the unison importer ships
  `match.agree: 0` entries as needsEar:false; hard-cut transitions; the piano
  never drops out; 9 instruments never cast; uniform section length.

ROUND 15 (2026-08-24) — done:
- D52: VGMusic corpus (400 files / 354 games) + one shared ingest
  (src/ingest/corpus.js, proven byte-identical on the Undertale output) +
  audition/judge.html, a 36-trial A/B + layer + open-text instrument.
- Found: PERCUSSION was never filtered. 24% of game-MIDI notes are channel 10;
  it corrupted the melody split, the chord labelling AND the key solve. Yield
  33 -> 88 progressions. It also mis-solved both Amalgam entries' key, which
  is very likely why Ethan killed them.
- Ruling: a verdict judges the music that played. verdicts.js snapshots the
  degrees it judged; re-transcribed entries lose their verdict.
- Found: a third of "melodies" were arpeggio channels. Filtered.

FIXED IMMEDIATELY AFTER (D52 addendum): judge.html shipped with no
<script src> for the strudel bundle — declared the constant, never emitted the
tag. No test caught it because the DOM shim provides a stub `strudel` global,
so a page that never loads the bundle passes everything. Added an HTML-level
test, and gave the bundle the mirror fallback the sample maps have had since
D42 (unpkg + jsdelivr, version-matched, tried in turn).

- [done, D53] TASTE IS NOW RECORDED PER FACET, not per card. Ethan's notes
  ("Cm Bm is a pretty good transition ... i rejected the ones that had these
  simply because the progression itself sounded weird") showed one keep/kill bit
  averages over things he judges separately. Verdicts now name a facet: pair,
  wrap, chord, texture, cadence, cycle. A vote is EAR_COUNT=8 pseudo-observations
  on the family count row, so the ear speaks in the corpus's currency and
  `ctx.ear === false` still reproduces the old model exactly. `pairs` feeds the
  INNER table only — folding it into the wrap too took P(0->11) as a minor
  CADENCE from 0.07% to 19.8%. New `cadential_sus` operator puts a suspension
  only where something resolves it. audition/facets.html: 467 pair tiles ·
  31 harmonies × 7 formats multi-select · 20 harmonies × 3 endings.
  Seeds in src/lib/facet-seeds.js are hand-written and survive every import.

- [done, D56] FIRST REAL JUDGE PASS came back: 15 A/B, 177 tone votes, 14 notes.
  Three of the notes named mechanical defects, now all fixed and tested:
  (a) every figuration drew from {R,3,5} only, so G7/G6/G were the same notes —
  bindFigure gains opt-in `stateExtensions`; (b) the bass was a KEY-degree
  contour and played C natural under an A major chord — now a chord-relative
  figuration; (c) 54 library entries end on their own first chord, which loops
  as a doubled bar — src/lib/loops.js trims at render time and the lint
  reproduces Ethan's complaints by trial number. Also: background-tab audio
  slowdown fixed by moving strudel's scheduler tick to a Web Worker (with a
  watchdog that reverts to native if the worker never ticks); textureRanking()
  now reports EXPOSURE because block was judged on 1 of 37 harmonies and would
  otherwise rank last; new "wide oom-pah" tone per Ethan's t22 request.

NEXT:
0. [RESOLVED — D56 addendum] The wrap fork is METER-FIRST (Ethan): even meter
   -> replace the duplicate (keeps bar count; ranked alternates carried as
   variation material), odd meter -> trim. resolveLoopWrap() in loops.js; both
   4/4 audition pages replace now. The parallel-flip device (v->V, "Gm to G")
   always rides in the options palette even though the score honestly ranks it
   low. NEXT for this: song generation must pass its actual meter instead of
   assuming 4/4.
0b. RESEARCH — tone switching through the song. Corpus head start:
   DEVELOPMENT_UNDERTALE has 23 observed FROM->TO accompaniment transitions with
   counts, and 53 of 112 development moves (47%) change the texture. What is
   missing is WHERE in the form they land.
0c. [RESOLVED — D59] Harmony variation is placed at THE LAST REPRISE of the
   letter form: a variation is only audible as one against material already
   known, so it lands on the final return of an already-heard letter, and a
   no-reprise scheme (ABCD) gets none. One gentle root-preserving operator
   through the D50 gate; everything chord-reading rebinds in that section.
   Hear it: undertale.html, "mix" texture — 98/163 cards carry a treat (the
   form strip marks it A′/B′). Still open from 0c: variation OUTSIDE the loop
   wrap (mid-phrase substitutions in longer forms) belongs to chronological
   editing.
0d. [done, D57] TWELVE VIDEOS TRANSCRIBED BY EYE -> pack 'igvideo': 18 section
   entries (Fujii Kaze x3, jazz ballad in E, neo-soul in F, dim chain in C#,
   city-pop in C x3, modulation etude x3), 2 flourishes as placed events with
   placement+function, video-corpus.md research doc (8 missing harmony
   techniques + the layering doctrine + melody habits). All needsEar; Ethan
   endorsed the SOURCES (sourceEndorsed:true), not my transcriptions of them.
   Hear them: audition/progressions.html, source filter "from the videos".
   [done, D59] all three queued changes built: sus-then-alter + end-on-9sus4
   ride the facets cadence tab (with new 7sus/9sus/13sus/7b9/7alt dictionary
   shapes so they can play); OPS.alter_dominant is a placed operator (one per
   phrase, at the turn, must resolve; own gateSlack so the D50 gate cannot veto
   the device for being rare); the `dialogue` archetype does call & response as
   lead-lane turn-taking (2-bar call, 2-bar answer, never simultaneous).
0e. [done, D59] THE LETTER FORM — harmony+melody composed over time. Letters
   name melodies (ABAB/ABCA/AABA/... hash-picked per song); same letter = same
   seed, new letter = new line; lead-derived layers rebind to their section's
   letter. undertale.html "mix" is now the full letter-formed song. NEXT:
   letter schemes + dialogue + treats should reach SONG GENERATION (cli), not
   just the audition page; and the answer voice could eventually VARY its echo
   (video 10's answers are near-echoes, not exact).
0f. [done, D60] FIRST BIG VERDICT HARVEST imported: 237 library verdicts (104
   clicked + 133 implied by Ethan's unmarked-half rule), 85 page-local verdicts
   recovered into DERIVED_VERDICTS, 12 notes, mood corrections, the modal|10:m
   facet seed, vid_mod_etude_close_cell (his E7·2 F^7 E7 cell), and 4/4 plans
   for 6-chord loops. exemplarPool now runs on the ear alone (201 ratified);
   pages vary only the 74 click-kept. GEN-NAME COLLISION fixed (was: one name
   covered up to 6 cards; his 21 gen verdicts were unattributable and dropped —
   re-judge the generated arm when convenient). QUEUED RULINGS: octave as a
   section parameter (post-peak quiet section 1-2 octaves up, with variations —
   form phase); 'Mysterious' mood tags read too consonant (prompt→params note).
0g. [researched, D61] THE SCENARIO ROUND — four designs in research/ (README.md
   is the index + build order), all CANDIDATE, awaiting Ethan's go before the
   20-environmental + 20-emotion song batch:
   (a) KEYS: mode first, register second, tonic = corpus practice + hash
       variety (per-key "character" is 12-TET myth; Schubart = metadata only).
       Corpus practice found: G:minor generic battle, F:minor heavy boss,
       B:major emotional peak, A:major warmth, towns 3/3 major.
   (b) FOUNDATIONS THEN VARIATION: 29-pattern universal fnd_ canon (alberti/
       stride/habanera/bossa/travis/gospel...) lands and is auditioned FIRST;
       then varyFiguration (12 typed ops — swap positions = rotate/swap,
       change intervals = colour_sub/octave_token/neighbor_insert) in the D50
       idiom with fit-drift gates.
   (c) VIBE = EMOTION x ENVIRONMENT: 17 environments (shop, fight, boss,
       construction, stealth, snow, water, desert, cave, lab, casino,
       festival, kitchen, training, rest, menu, aftermath) x 12 emotions;
       compileVibe() -> situation patch; contradiction cells (gloomy shop,
       happy construction, calm fight) are the ratification test.
   (d) INSTRUMENTS: per-part orchestration rules ready to become lints; 15
       verified new GM voices drafted (timpani, taiko, brass section, steel
       drums, guitars, slap bass, koto...; levels UNMEASURED until his ear);
       82 of 125 gm_* names still unused; .n(i) render variants = cheapest
       expansion.
   (e) ENSEMBLE SHAPES (his add-on, D61 ruling): solo / duet / groove / bed /
       no_drums / no_bass / full — sparsity is a scenario decision, shapes cap
       the arranger's slate, the batch includes deliberately sparse cards.
0h. [built, D61 + addendum] drum-patterns.com pipeline:
   `node scripts/fetch-drum-patterns.mjs liked <pages>` (owner granted Ethan
   permission via email, 2026-08-25 — D61 addendum; polite: page budget,
   1.2s/request, honest UA, skips saved) then
   `node scripts/import-drum-patterns.mjs --report` -> rhythm entries per
   voice + DRUM_PATTERN_FORMS (bank play order = where the fill lands, the
   todo-0b placement data). Grids are velocity-less, so entries need accent
   profiles unless the pattern used AC/ghost rows (those recover a real
   profile). Hand-saved pages still work and import identically.
   HARVEST DONE 2026-08-25 (D62): 240 liked patterns fetched (0 failures)
   -> 1315 voice entries + 240 DRUM_PATTERN_FORMS in
   src/lib/rhythms-drum-patterns.js. 146 entries carry recovered accent
   profiles (AC/ghost rows) and can bind TODAY; 1169 need accent profiles
   authored (A6.2 discipline, same as unison's flat loops). 100 fills + 94
   intros detected from bank play orders; 37 long arrangements truncated to
   16-bar loops with the full order kept on the form. Kits: 808×115,
   909×26, 8-bit×18, 303×14, acoustic×14, linn×12, TAIKO×7 (8-bit + taiko
   = straight into the game/boss palette). bpm 70-202, median 110. NEXT:
   (a) audition surface for the 146 bindable ones, (b) style-default accent
   profiles for the flat 1169, (c) wire DRUM_PATTERN_FORMS fill/intro
   placement into the form phase (todo 0b).
0i. [built, D61 addendum] FOUNDATIONS EAR PASS: audition/foundations.html —
   29 fnd_ canon patterns (figurations-foundation.js) × 5 click-kept
   progressions, a chip per pattern per card, verdicts PER PATTERN with
   notes; export -> import-verdicts.mjs -> FIGURE_VERDICTS overlay (stale
   snapshots refused, D51 discipline). This is build-order step 1: the
   fnd_ ear pass gates figuration-vary.
   [D62] Ethan's prose verdict landed: "they work well ... for now they're
   good" -> all 29 provisionally ratified as from:'notes-blanket' (a later
   CLICK on the page outranks the blanket, per pattern). His caveat ("which
   chords don't work on certain tones") is measured in FND_QUALITY_COMPAT.
0j. [built, D62] FIGURATION RELATIONSHIP GRAPH (his ask): generated
   src/lib/figuration-graph.js via scripts/build-figuration-graph.mjs —
   FND_TRAVEL (190 cost-ranked section-transition edges, devices from the
   corpus's observed development moves; each declares what it preserves;
   meter hard-guarded), FND_LAYERS (71 floor+comment vertical pairs, D41
   principles as rules — his "combine multiple patterns when layering"),
   FND_QUALITY_COMPAT (binder fallback warnings per chord quality). ALL
   CANDIDATE — edges are smoothness hypotheses until heard. NEXT: wire
   travel edges into the D59 letter form (a section boundary picks a
   cheap edge; the audition surface for the graph IS the form), and layer
   pairs into the arranger's accompaniment stacking.
1. *** RE-RUN audition/facets.html AND audition/judge.html, plus
   audition/progressions.html filtered to "from the videos" (18 sections to
   keep/kill — they are eye-reads of videos you like, so a kill likely means I
   misread; notes welcome). EVERY card now has its own tone buttons — block /
   bossa / arpeggio / wide pad / wide oom-pah — the global row is the default,
   a card's buttons override it, and the export records which tone you judged
   (cardTones), and every card has a notes box — typed comments persist, ride
   the export, and land in verdicts.js as CARD_NOTES on import. Odd-length
   progressions are now fit to 4/4 by lengthening
   (3→4 bars, 5→8 as 2+2+2+1+1, ...; video cards honour their sectionBars) —
   the card shows the plan. The facets cadence tab now also offers the two D57
   devices per harmony: "sus, then altered V" and "end on 9sus4" (D59). *** facets first — it
   is where the two things Ethan already noticed by ear get generalised, and it
   is the only page whose votes reach the generator directly. Both export JSON;
   `node scripts/import-verdicts.mjs <file.json>` handles either format and
   prints the tally. judge.html (36 trials, ~10 min) settles whether D50
   exemplar variation beats D49 statistical composition by ear — and since D54
   every trial plays through SIX interval patterns switched in lockstep, so
   sweep at least two per trial or the tally is not texture-robust (the
   importer prints the median and warns when it is under 2). Notes box on every
   trial; it exports even on trials you skip.
   On facets.html, the highest-value clicks are the top of the leverage sort:
   thin corpus rows where one opinion actually moves the model.
1b. Open question the cadence tab exists to settle: is `Xsus -> X` at the loop
   wrap good in general, or was Ethan describing one specific case? Nothing is
   seeded there on purpose.
1c. `wraps` is empty and only the cadence tab fills it. Until it has votes, the
   ear has said nothing about endings at all.
2. [done, D59] melody-profiles-vgmusic.js is wired: 'game-midi' is a selectable
   bindMelody style (articulation defaults eased from measured shares; the
   saturated cellRepetitionFloor deliberately not carried). NOT yet used by any
   audition card — switch a page to it when the ear wants the comparison.
3. Re-transcribe or drop the remaining low-coverage Undertale entries (the
   percussion fix already repaired 2; the rest are genuinely thin).
4. Consider re-auditioning the two Amalgam entries now that their key is right.
5. (carried) global whole-cycle scoring; wire harmony into song generation;
   LAYERING lints; CHRONOLOGICAL EDITING.

STILL OPEN after round 15:
- Only 88 of 391 VGMusic songs yielded a progression. The gates are strict on
  purpose, but worth checking whether coverage>=0.9 is leaving good music out.
- vgmusic entries are all needsEar:true and unheard — same candidate-pool
  discipline as every other import.
- (carried) only cycles, no through-composed phrases; 9 of 22 famous
  foundations unvoiceable by me_*; the unison importer ships agree:0 entries as
  needsEar:false; hard-cut transitions; piano never drops out; uniform sections.


-----

MY PERSONAL TODO:

- listen to progressions.html

What you can do: reload undertale.html and play some mix cards — you'll hear melodies change by letter, dialogues trade phrases, and the harmony treat at the last reprise (hover the strip for exactly what varied). Then the standing re-run: facets.html (cadence tab has the two new devices; the wraps bag is still empty until you vote there) and the video cards with their new tone buttons.

ROUND 3 VERDICTS LANDED (D67): 10 keep / water's 3rd kill (mix-faulted —
harmony KEPT via keepBase) + 7 new notes, all actioned — CROSS-BAR repeats
now re-pitched (the gap that kept kitchen/sad-shop "hyper": within-bar
merge can't tie over a barline, so the note moves; zero repeats measured
across all 11 leads), pads BREATHE (per-bar gain waves, soft base rising
in the development, ×1.3 bump removed — "too loud" ×4), ENVIRONMENT PADS
START AT BAR 1 (your snow principle: the setting begins as it starts
playing — cave/snow/aftermath/water), aftermath un-uniformed (its AA
scheme never travelled → forced AB, alberti 8ths→16ths at B), construction
articFloor 0.9 (short notes lengthened), pedal piano wetter (room 0.7) +
softer (×0.55), happy shop intro halved (64→56) + dp_slowton, kitchen →
dp_boom_tap light, fight strings 0.3. NOTE: sad shop / boss / aftermath /
drop notes arrived verbatim from round 2 (the page keeps note boxes filled)
— actioned their remaining gaps; clear a box if a note no longer applies.
306/306. RE-LISTEN: audition/songs.html.

ROUND 2.5 (D66): your two scope fixes — string pads are now ROOTLESS
VOICE-LED REDUCTIONS (upper core tones, rotating inversions, fewer notes —
a variation of the chord, not its restatement; sus-safe), and the MERGE is
scoped to the melody only (lead + tune-carrying layers; alternate/counter
lines may repeat again). 306/306. Same page: audition/songs.html.

ROUND 2 VERDICTS LANDED (D65): 10 keep / 1 kill + 11 notes, all actioned —
THE MERGE (consecutive same-pitch notes combine into one held note — your
spec verbatim — on every lead), THE REACH (hold/merge now reaches arranger-
bound layers: the boss trumpet holds, finally), your STRINGS RULE (pads are
real chord voicings over a low frame, ×1.3 gain, swell at the peak;
cave/snow/aftermath demand the string ensemble), fight's texture layer
(fnd_offbeat_chords oct 4) + held guide-tone counterline, drums re-seated
(cymbal 0.22, busy-voice trim for the boss spam, lead boost 0.18, kitchen →
dp_tikoflow swing), pedal vibes softer (×0.65) + wetter (room 0.55) + no
melodic layer above the lead (cave's high flute drops), aftermath moves
(alberti arp + 3 voices), calm water rebuilt AGAIN (killed base banned from
retrieval, lead at octave 6): ut_once_upon_a_time_p3 "0 2 5:^7 0:7". Kept
songs now pin BASE + degrees. All 10 keeps verified stable. 306/306.
RE-LISTEN: same page — audition/songs.html.
STILL PARKED: melody-on-a-different-instrument (construction — you repeated
the staccato half, which the merge addresses; the instrument half waits on
the instrument-idiom build), busy-line-as-support (fight).

ROUND 1 VERDICTS LANDED (D64): 9 keep / 1 kill + 10 notes, all actioned —
held/sparser/softer leads on pedal + fast songs, consecutive-pitch cap,
intros halved on slow songs, drums seated (gains down, cymbal trim, lead up
vs foreground drums), strings support on snow/cave/aftermath, aftermath
2 voices, calm water rebuilt (plain-triad rule + octave floor), kitchen on
dp_nuevayol. KEPT SONGS PIN their judged harmony (drift measured; pin
tested). PARKED: melody-on-a-different-instrument (construction), busy-line-
as-support (fight) — both belong to the instrument-idiom build.
RE-LISTEN: same page, same links — audition/songs.html.

NEW (D63 + addendum) — LISTEN: audition/songs.html, now ELEVEN songs.
- 10 vibe songs: letter-form melody, varied kept harmony + last-reprise
  treat, foundation accompaniment that TRAVELS between letters,
  environment-cast instruments on the ensemble dial, articulation per vibe
  (staccato/legato/damper), and YOUR vouched drum patterns riding where
  your vibe note matches (each card quotes the note that let it in).
- #11 vs_excited_festival_drop: the b-52's buildup ask — 4 never-looped
  intro bars (drums → drone → accompaniment → riser), then the drop.
- Keep/kill + notes per song; export → import-verdicts.mjs.
DRUM GATE state after your first pass: 25 verdicts + 27 vibe notes in
verdicts.js (DRUM_VERDICTS/DRUM_NOTES); 4 patterns assigned into songs; 20
vouched-and-waiting; drums.html still has unjudged cards if you want more.
Parked from your notes: parapraxis first-4-bars as a standalone minimal
beat; cool_rock_1 minus "the synth thing" (voice-subset variant);
funky-bassline pairing for dp_to_go_with_funky_basslines.
Also standing: foundations.html per-pattern clicks outrank the D62 blanket;
remaining design approvals (keys policy module, instrument additions) in
research/README.md.


VIDEO BATCH 2 LANDED (D68): 23 new sources analyzed (17 reels + 5 screen
recordings + the Aquatic Ambience cover added mid-session). Your three asks
answered in video-corpus.md BATCH 2 (Tyler dyad = 3+b13 under the lifted
4+13; G#m9 climb = BLOCK RESTRIKES +1 octave/beat with 9->1->b7 walk-down
tags; bronik = fixed D-Eb-G cell over a descending bass, five octave-height
layers). 21+1 new vid_ progressions (needsEar), 6 new flourishes incl.
vid_tag_sus_melt, vid_climb_block_restrike, vid_arp_undershadow ("add a
note below every arp note" — direct fix for our robotic-arp complaints),
vid_ladder_quintal (the Aquatic Ambience water ladder — candidate DEFAULT
texture for the water vibe when you next audition it). None ear-ratified:
they will surface via progressions.html / future song builds.

NEW — LISTEN: audition/videolab.html (D69). Ten technique-lab cards from
the video corpus: keep/kill judges the TECHNIQUE AS RENDERED; notes say
what to combine next. Faithfuls (tyler melt, G#m9 climb, bronik build,
aquatic ladder, planing, gospel roll-in), a transplant (arp under-shadow on
your kept water harmony), combinations (dominant elevator modulation song,
city-pop enter-early/decorate-late, kpop pads + two-note sigh). Export →
import-verdicts.mjs as usual.

VIDEOLAB ROUND 1 IMPORTED (D71): 3 keeps (gsharp climb, aquatic ladder,
planing), 1 kill (tyler melt — vid_tyler_loop banned), 6 note-only cards.
Aquatic rule recorded: in songs the water ladder gets lots of reverb +
damper.

NEW — LISTEN: audition/videolab.html ROUND 2 (11 cards). Kept cards are
unchanged; every note-only card is rebuilt to your notes (bronik
rebalanced, elevator lands on the same theme a semitone up, undershadow
left hand rocks root-fifth, citypop/kpop falls only at phrase ends +
chord-rhythm variation, gospel middle now diatonic vi9-iii7). Two new
cards from your keep notes: vl_gsharp_vamp (just the two chords you
liked) and vl_planing_var (your Eb-for-A bass substitution). CLEAR STALE
NOTE BOXES before exporting — old notes persist between rounds.

NEW — RELISTEN: audition/songs.html — somber aftermath only (D70). The
cello + strings pads now carry their own slow held top-voice melodies
(varied durations, leaning into each chord change); every other song is
byte-identical. The padMelody switch is ready for any other song you name.

D72 UPDATE — the aftermath-only RELISTEN above is superseded: your
"change the generation, not the song" ruling made pad melodies POLICY.
RELISTEN the WHOLE songs page: every song's pad support now moves — slow
songs' top pad sings a planned phrase (contour arc, scale passing tones,
repeating rhythm motif, cadence home), fast songs (>140bpm: fight, boss,
kitchen, drop) and all lower pads move subtly per bar. Only pad exprs
changed; leads, accompaniment, drums untouched.

D73 — RELISTEN both pages:
- songs.html: water's loop is now C D F^7 Am (your C7 note; F^7-from-D
  banked as a taste seed), water pads trimmed 0.85; kitchen piano at HALF
  TIME with a sparse lead (-43% onsets, drums untouched); fight/boss/drop/
  kitchen top pads now sing the FREE phrase (your "more free, with
  variations"); fight + boss carry the new sine SUB-BASS under the beat.
  Chill songs (cave/snow/aftermath/sad shop/construction/happy shop) are
  byte-identical to what you just praised.
- videolab.html: the copy-JSON error is fixed (a stale round-1 verdict for
  the removed tyler card broke export — stale keys now prune on load).
  Re-export when ready; your pasted round-2 listen still needs its
  keep/kills.

D73 addendum — fight's sub-bass now DOUBLES the piano's low 8th-note roots
(your "low piano note can be support with the low synth bass" idea) —
re-listen tense fight; boss's held sub is unchanged.

D73 addendum 2 — fight's low pulse is now PLAYED BY gm_synth_bass_1
(replacing the piano part, per your note — the bare sine was inaudible);
boss's held sub also moved onto synth bass. Re-listen fight + boss.

D74 — videolab ROUND 3 up (11 cards): gospel is gone (killed twice over);
gsharp vamp grew into the 4-chord combo with melody + layers you asked
for; bronik bass now octave-doubled at full gain with the square
low-passed; undershadow left hand rises against the falling right;
citypop has per-bar chord treatments + ONE leap pickup; vl_kpop_split
plays your half-bar idea. TWO QUESTIONS when you listen: (1) does the
elevator's last section still sound strange, or was that note stale from
round 1? (2) your planing note ended mid-sentence ("...as a variant here.
also ") — what was the rest? Clear stale boxes before exporting.

D75 — videolab ROUND 4 up (11 cards, 3 of them SONGS): your three
"make it a full song" cards are built (gsharp A A' B A / citypop
chorus-verse-chorus with a royal-road verse / kpop with the split bar
announcing its new bridge). The vamp's wrong note was the pad's E# over
D#m7 — fixed to diatonic 7ths. Bronik's bass is now a filtered sawtooth
(the soundfont goes silent that low — that's why louder never helped).
Undershadow's left hand is down to held roots only. The elevator got a
17th bar — a held Eb7 pulling the loop home (your note came three times,
so the seam theory got built). Still owed: the rest of your planing
sentence ("...as a variant here. also ").

D76 — videolab ROUND 5 up (12 cards). You heard an ENGINE BUG: both "keeps
going upwards" (vamp) and citypop's dissonant later sections were the
walking bass spiralling one octave per loop pass — the binder now locks
loop roots, and the vamp's progressions were reshaped to arch home
(verse ends E^9 -> B^7 falling; bridge peaks then falls through v7).
Citypop is 24 bars on the 4-bar grid — chorus 8 (with breathing hold
bars), verse 8, chorus 8 — with the last chorus rendering IDENTICAL to
the first one you liked. Undershadow bars 1-2: the "weird" was a foreign
Bb (a fallback flat-7 on the plain C triad) and C-against-F# on the D bar
— those bars now waterfall added SIXTHS (C6, D6). Kpop split: the high
sighs AND the high chord re-strike go silent for the whole bridge — the
verify pass measured zero non-melody notes above A5 there now.
Bronik: your keep is untouched; vl_bronik_var grows it — octave echo
breathing in and out, and a second bass walk (Ab F Eb G) renaming the
same cell four new ways. STILL OWED: (1) the elevator's 17th-bar
turnaround is from LAST round — does the last section still sound
strange after a fresh listen? (2) the planing sentence still ends at
"...as a variant here. also " — what was the rest?

D77 — videolab ROUND 6 up (15 cards, 6 SONGS). Your four growth asks,
built: AQUATIC is a 40-bar song now (kept ladder untouched) — flute
melody over the wash, a bIII^7-recolored third cycle, harp echo joining
and staying, strings from bar 1, the source's falling cascade tag.
CITYPOP is the long one — 48 bars, each section its own instrument
(piano choruses, e-piano verses+bridge, vibraphone bridge melody), a new
colored-turnaround bridge, outro wrapping major->minor. KPOP is at 116
now (kept card still there at 98 to A/B) — 32 bars, the melody runs 16
bars through a new lament C section, e-piano, strings, celesta. The VAMP
melody actually leads now — moving entries, an F#6 climax, a breath
section over a third progression. LISTEN ORDER suggestion: vamp first
(tell me if "engaging" moved the right direction), then the three songs.

D78 — videolab ROUND 7 up (15 cards): the expressiveness pass on your four
kept songs. Dynamics are REAL now — the flat gains were erasing every
accent (that was the "slamming"); accents sound, sections swell and fade,
melodies breathe to their climaxes. Melodies change hands (vamp piano->
flute->piano; aquatic flute->vibes; citypop piano->vibes->flute; kpop
piano->vibes). Strings: much softer everywhere, own sung lines in vamp +
citypop, de-rooted in kpop. Kpop's second low voice (synth bass) is GONE
— say if you miss the floor. Aquatic: flute now dies away INTO the next
section under a fading-in harp; second celesta cascade on instrumental
cycles. NEXT (parked): VST/sample instrument tier — sfizz+SFZ libraries
(Salamander piano, VSCO-2 orchestra) swapping into render-wav.mjs, then
DawDreamer for true VSTs; wire gains->velocity/CC11 in the MIDI export.

D80 — HQ RENDER TIER LIVE + round-7 feedback landed. Listen two ways now:
(1) audition/videolab.html (browser, fast loop) — kpop melody is ONE
vibraphone voice for all 16 bars, the split chord rings with damper,
strings cut again everywhere. (2) audition/hq/*.wav — the four songs
through REAL instruments: Salamander piano (soft hammers = the "slammed"
fix), VSCO-2 strings/flute/harp, VCSL vibraphone, Surge XT synth bass.
`node scripts/render-hq.mjs <file.strudel|songdir> --to N` renders any
song. PARKED: curate Surge patches by ear (only bass exercised so far);
e-piano + celesta still fluidsynth (no free lib found — could go Surge);
drums still GM (Dirt samples later); CC11 expression lanes for sustained
swells; render-hq for the songs page.

D80 addendum — HQ MODE on videolab.html: toggle "HQ: off/ON" in the header
(next to stop); cards with a render show a green HQ badge; with HQ on,
play loops the wav, solos still use the browser synth. All four wavs
re-rendered with the fixed pipeline: absolute velocities (no more
max-dynamics hammering), measured per-stem balance (the citypop synth
got pulled DOWN 4dB), room-driven convolution reverb (aquatic finally
wet), high-flute auto-taper, -16 LUFS masters. Kpop melody section now
cycles four low-register accompaniment treatments instead of straight
chords. Re-listen both modes; the render re-runs in ~10s per song after
any page rebuild (scripts/render-hq.mjs audition/hq/<name>.strudel).

D81 — HQ EVERYWHERE: songs.html regenerated with the current engine
(loopRoots + audible accents on the fight bass / textures / sub / strings
counterline — only the 4 energetic songs changed, chill songs untouched)
and BOTH pages now have the HQ toggle: videolab plays per-SOLO wavs too
(your question was right — no reason solos couldn't be HQ), songs plays
mix wavs. Woodwinds joined the sampled set (bassoon/clarinet/oboe + cello
via the string sections). Re-render everything after any rebuild:
`node scripts/render-hq-pages.mjs` (add --solos for the lab solos).
GENERATOR GAP (parked, honest): handoffs/strings-lines/section-curves/
tapers are authored per-card in the lab, not yet planned by the songs
generator — that's the next engine milestone.

D82 — THE PLANNER LEARNED IT. songs.html regenerated by a generator that
now does, by default: section dynamic curves (each section's energy sets
a level — verified landing at exactly 0.85/0.95/1.05; the lead rides a
gentler arc) and transition ramps/tapers on support layers. Handoffs:
turns out the planner already had them (the cast's takeover/alternate
voices own complete letters — kitchen's recorder, festival's trumpet);
a new fallback path covers future castless songs. All notes byte-
identical to before except the dynamics — your judged material's PITCHES
didn't move. ONE QUESTION FOR YOU (pre-existing bug the sweep found):
6 of 11 songs play their melody PHASE-SHIFTED on the second loop pass
(the 8-bar melody cycle doesn't divide 36 bars). It's always been true —
you judged them with it. Fix it (melodies re-align, audible change) or
keep it (reads as variation)? Say the word either way.

D84/D85 — ROUND 8: your "it's fine" logged (the 6-song loop phase-shift
STAYS — reads as variation); then the synth round. THE BIG FIND: the VST
synth patches had NEVER loaded — DawDreamer's load_preset is a VST2-only
path that silently no-ops on the Surge XT VST3, so every synth stem in
every HQ wav so far (all 85, including the D83 re-renders) played Surge's
INIT SAW. Fixed (fxp wrapped into a constructed .vstpreset + warmup
render; load failures now fatal) and verified by spectra. NEW PALETTE
(probe-measured before wiring): Rubber Bass (the bouncy funk bass),
Tarnce supersaw, Trancy pluck, Magic Music Box sparkle, Juno-60 strings,
Soft Suitcase e-piano (gm_epiano1 finally off fluidsynth). 8 NEW VIDEOS
frame-read (batch 3 in video-corpus.md): five are the same creator's
layer-stack builds — patch names appear in NONE (UIs never opened), but
one build is entirely Surge XT, the synth we already vendor; Serum 2 and
Massive X are the others (commercial, can't auto-fetch — if you ever buy
Serum, render-vst.py hosts it the same way). LISTEN:
- videolab.html: TWO NEW CARDS — vl_layerstack (the five-lane formula:
  accent-line ostinato, bar-4 bass turnaround, beat-2 counter, sparkle
  pickups sequencing up to G8) and vl_funkbounce (the bouncy rubber
  bass + supersaw stabs + backbeat music-box walk). Kept cards
  byte-identical.
- songs.html: FOUR NEW GENERATOR DEFAULTS, purely additive (every acc +
  lead byte-identical, chill songs untouched): counterline on all
  3+-voice songs (held 3rd / beat-2 climb alternating, whisper band),
  music-box sparkle in busy sections (>=90bpm 4/4), funk bounce where
  the pocket fits (construction got it), synth pluck textures on
  energetic songs.
- HQ RE-RENDER DONE: 96/96 wavs (17 lab mixes + all solos + 11 songs),
  0 failures, clamp ledger identical to D83's 8 cosmetic lines; shipped
  spectra verified (bounce stem centroid 779 Hz = the Rubber Bass probe
  fingerprint). FOR YOUR EAR NEXT LISTEN: (a) trimDb on the four ORIGINAL
  synth voices (bass/leads/pad) was tuned against the wrong sound — say
  if any synth now sits too far back/forward in HQ; (b) should
  festival_drop get the D73 sub-bass floor (a latent gate gap keeps it
  out — adding it changes a judged song's floor); (c) the sparkle plays
  OVER melody bars (whisper, own lane 2 octaves up) — a deliberate
  extension of the high-silence rule per your ask; kill it if it clashes.

D86 — ROUND 9 (your synth-spread verdicts, all landed as ENGINE POLICY):
- ENERGETIC SONGS LEAVE THE PIANO: construction + boss accompaniment
  hands now play the Rhodes (same notes, new voice — measured); kitchen
  and festival stay piano by your own exception (playful/goofy vibes).
- TEXTURES SOUND NOW: fight has TWO (kalimba offbeat + supersaw arp) in
  an audible band (0.3-0.52, was 0.22-0.42) across energy>=3 bars; boss
  + construction each gained one. Fight's lead trimmed x0.85 ("piano
  (very loud)").
- FOUR FULLY-SYNTH SONGS (suite is 15 now): vs_calm_lab, vs_calm_menu
  (your calm ask), vs_tense_stealth, vs_excited_casino — full machinery
  (letters, travel, treats, curves), every voice on the synth palette,
  HQ all-Surge. calm_menu is the first castless song through the D82
  letter-handoff fallback.
- LISTEN: audition/songs.html (15 cards, both modes after re-render).

D87 — ROUND 10: your 12 keeps imported; BOTH new lab cards kept ("most
official song we've had so far") and grown into FULL SONGS
(vl_layerstack_song + vl_funkbounce_song: A B C A' — composed melodies
enter at B, breakdowns strip, returns peak; kept cards untouched). Your
harmony-melody directive is policy: the DESCANT (held 3+5 dyad / 5-6-5
walk, a 2-bar phrase riding beside the counterline + pad phrases) on
every 2+-voice song. Synth-acc songs carry SYNTH LEADS now (your
construction "learn this": square/saw). Stealth thinned + tension
descant + the accent-line device; menu got the singing synth-strings
pad; casino got its texture. fnd_funk_bounce entered the foundation
canon (ratified by your card keep). NOTE: export the videolab verdicts
JSON when you get a chance so the two card keeps land formally.
LISTEN: videolab.html (2 new SONG cards) + songs.html (15, all
re-rendered in HQ).

D88 — ROUND 11: your "less generic" question ANSWERED with measurements
(one loop+treat vs ~3 progression sections; 43% vs ~100% colored — the
old plainness rule was firing on almost every song and conflating
chromaticism with color; no breakdowns; no bar-4 grammar; weaker
inter-layer relationships) and TAKEN ACCOUNT as defaults: B-letter
BRIDGE progressions, real breakdowns (base acc + drums strip over a
held-root floor), bar-4 sub octave-drops, colored-half retrieval.
Kept songs byte-stable. EIGHT NEW SONGS (suite = 23): mysterious_desert,
excited_training, calm_rest, tense_lab (all-synth), goofy_casino,
somber_snow, happy_festival, nostalgic_shop. Bridges fire 11/11 on
unkept songs, breakdowns 11/11, colored rate 70%.
PARKED (your word first): bridges/breakdowns for KEPT songs (re-rolls
judged material); inter-layer call-answer scheduling; composed-statement
generator melodies. LISTEN: songs.html — 23 cards, both modes.

D89 — ROUND 12: your first ear on the eight. TWO PROSE KEEPS pinned
byte-stable (tense_lab "love this... amazing"; goofy_casino "I like
this a lot") — CLICK KEEP + export when you get a chance so the D64
pins take over (the videolab card export is still owed too). FIVE
FIXES, each abstracted: desert is PHRYGIAN now (researched: Gerudo
i-bVI-bVII-V harmonic minor, the bII trope) — plays Cm Gm Fm Db^7 raw,
desert environments retrieve bII-bearing exemplars; training's weird
bar-4 was the b7 hanging at the phrase seam — antecedent cadences now
exclude the 7th (engine-wide on unkept songs; casino moved 2 notes,
menu/stealth zero); festival's hyper RH was your 2/4 diagnosis
verbatim — per-bar density targets halve in 2/4 + a hard cell ceiling
(6.59 -> 3.66 notes/bar, cast unchanged); snow + rest DROP their
crawl-tempo intros whole-loop (melody opens the song) with the lead
up +2.6dB (x1.35, .gain 0.47 -> 0.63); rest's melody is a SOLO CELLO
now (whole song, tenor register, held bowing); snow gained the
singing synth-strings pad from bar 0. Verify workflow caught one miss
(desert's bridge calliope held a maj7 at a phrase-final — fixed) —
kept 12/12 + praised 2/2 byte-identical throughout, 306/306 tests,
six wavs re-rendered (0 clamps). LISTEN: songs.html — desert,
training, rest, snow, festival (+ casino's two-note cadence fix).

D90 — ROUND 13 (your two corrections): HANDOFFS RESTORED — rest's
letters hand off again (A = solo cello for 32 bars, B = flute answer);
string melodies are now a PALETTE capability decoupled from handoffs:
string-friendly vibes (slow, legato/pedal, chamber/somber) hand their
letters from a strings-first pool (violin/cello/flute), and a
history-less song (no verdict, no note of yours) can roll a solo
string lead outright — songs you've spoken about never swap voices
unless your note names it. gm_violin joined the HQ tier. / festival:
the funky Bb7/Bbm melody was the walk mixing key tones with the
borrowed chord's tones — over a foreign-root chord the melody now
SPELLS the chord (Bb7 bars play D/Bb/F only; menu's Bb^7 absorbed the
same fix; desert's Db^7 bars now arpeggiate the Hijaz chord). Jitter:
density ceiling tightened (avg 3.32/bar), melody HOLDS, articulation
floor 0.85 — duration was the lever, not just count. 14/14 protected
byte-identical, 306/306, five wavs re-rendered. LISTEN: festival
first, then rest (cello->flute handoff), menu, desert, snow.

D91 — ROUND 14, THE MILESTONE: 14 KEEPS (+ tense_stealth, calm_menu —
both pinned with their judged bridges/breakdowns/grammar: the new
keep-transition law). Your fixes: desert re-served as TRUE Phrygian
dominant (Cm Db Fm E vamp — bII against the tonic + the raised third;
ranked retrieval, ostinato by idiom); casino intro 25s->12s (new 16s
intro cap, any tempo) + calmer tighter melody + forced counterline (+
the planner dealt a counter-melody voice); training got the MARCATO
device (staccato string stabs with their own line + accents, busy
sections only); snow's pad wave calmed (no more sudden-loud measures);
rest: cello trimmed to +1.2, strings pad + low descant added; goofy
casino: mid comp texture (grammarPin holds the rest); nostalgic_shop:
the full stealth/menu/lab treatment (pad from bar 1, texture,
counterline, descant, lead up, intro capped — your liked breakdown
untouched). VARY-LEAD-VOICE: construction/fight/boss letters now swap
saw<->square — VOICE-ONLY (notes verified identical). CLAUDE.md
written: the whole doctrine, portable to any model/effort. STALE-NOTE
CALLS: construction/tense_lab/festival notes arrived verbatim from
last round — treated as persisted noteboxes; if festival's RH still
reads hyper after the D90 holds, re-note it. STILL OWED: keep clicks
for tense_lab + goofy_casino; the videolab export. LISTEN: desert,
casino, training, nostalgic_shop first.

patterns to master:
- various percussion (shaker, natural percussion like for desert (bongo) or jungle or war drums like the ones in trailer)
- various themes mastering in terms of chord progressions (jungle, desert, alien, SPACE)
- various