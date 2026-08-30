# where things stand — r29

## Your r28 verdicts are in, and the layering landed

Seven of your twelve notes are positive and four name the layering directly —
*"love the melody and this song as a whole! and the harmony extra stuff, and the
chord progression, and the layering"*, *"love the melody and the layering"*,
*"like this! no complaints, love the layering"*, *"I like the layering ... of all
the instruments"*. That is the first time your ear has praised **layering** by
name, so the seven reel rules are worth keeping.

## What I fixed from your notes

**The offbeat strum in every song — you understated it.** Measured:
`fnd_offbeat_chords` on `gm_kalimba` was **14 of 14 here, 3 of 3 on the r27 page,
13 of 22 on the judged suite — 30 of 39**. The class was hard-coded to `offbeat`,
and that class has exactly ONE ratified figure, so the hash rotation the engine
uses everywhere else was doing nothing. Now **9 distinct figure/voice
combinations, max 4**.

**"Too loud" was one layer, four times.** The texture ran at 0.481 on all 14 songs
and was **louder than the lead on 11** — and all four of your "too loud" cards are
in that 11, while the three where it sat under the lead drew none. It was using
the *energetic* gain band on every all-synth song regardless of energy. Capped
relative to the lead: **louder than the lead on 0 of 14 now**. Same fix over the
cast — `melody_takeover` was running 1.91x, 1.60x, 1.53x the tune it supports.

**"Sounds like a 16th note off beat".** That layer's cell put 64 of 64 onsets on
an odd 16th with a lone 16th closing every bar. The lead already drops that note;
its copies did not, because `minNoteLast` was never forwarded to the arranger —
my omission from last round. Fixing it exposed a **bug in my own r28 change**: a
guard meant to stop a bar being emptied was instead abandoning the thinning
entirely, which nearly **tripled** that layer's density. Both fixed.

**Your one rejected song.** You judged the same progression twice — "unsettling
casino ... something is obviously wrong" (good) and "not a very good song" (lab).
I measured: the casino one has **38.53** harsh pairs per bar, the lab one **20.84**
— the friction runs *backwards* from your verdict, and three songs you praised sit
between them. So it is not how much dissonance but whether the lane wants it. That
progression is retagged to lanes where unease is the point, and the row moved to
stealth.

## Your praise deleted a layer

Importing your notes moved 2 of the 14 songs **before I changed any code** — both
by deleting the marcato. On `ls_vi_v_three_tense` your note is *"no complaints ...
I like the synth that has like a percussive part (low high high low low repeat)"*.
That IS the marcato. The gate that stops new features landing on songs you have
written about also strips features you already heard. Same trap as last round, now
closed on all three pages: **songs.html 0/47, vanriver.html 0/23, layerstack 0/14.**

## What you asked for

*"make a song suite learning and applying patterns and layering and everything
from the synth guy from earlier, in the genre his songs are (think layer stack
vibe). i feel like not enough of his techniques were applied fully."*

**You were right, and here is the count.** The research on those reels ends with
seven rules. **Two were wired — and both were switched off in every song.**

The dissonance budget charges the frozen slot 1.00 rub/bar. A casual lane's
budget is 0.35. So it never cast. `cp_sus_float_calm` — one of your `layerStack`
cards — literally says `devices: layerStack` on one line and
**`NOT CAST: coprimeCell, echo, frozenSlot`** on the next. The card you said you
liked the layers on has been playing without its own defining device.

## The new page

**`audition/layerstack.html`** — 14 songs, 24–32 bars, in his genre: all minor,
all synth, 63–127 BPM (the reels' own tempi), drumless except the two rows whose
source reels have drums. Built on six loops read off the reels themselves.

All seven rules now fire. Measured on the built page, not assumed:

| | measured |
|---|---|
| **R1** a new layer is old material re-registered | the floor plays the TUNE's own notes, one a bar, held — 0.67–1.00/bar against a lead at 2.4–4.5, and it cannot carry a pitch the tune doesn't have |
| **R2** freeze the body, move one slot | now casts (this is the budget lift) |
| **R3** hold a bar, move a bar | 100% of hold bars hold one note, 100% of move bars move, 100% of moves are a step — all 14 songs |
| **R4** disjoint octave bands | the lead is the top layer on **14 of 14**. Before this, one support layer sat *two octaves above the tune* |
| **R5** one layer at double the period | exact octave on 100% of bars; statement 2 is higher than statement 1 in 100% of 4-bar groups |
| **R6** a cell length coprime with the bar | fires on 9 of 14 — the other 5 are under its 80 BPM gate, which is where the evidence stops |
| **the last bar breaks the pattern** | 100% of checked bars, all 14 songs |

**Your stealth request is built.** *"repeated four-note falling synths ... 8th 5th
2nd root repeated over and over again 8th note"* — that's `R+ 5 s2 R` in eighths,
running with no rests on four of the songs. 0.0% out-of-key.

## Your erratic notes — found

Five cards said it. I measured all 23 songs of the page you just judged:

> **1185 notes are a 16th or shorter. 1003 of them (84.6%) are the bar's LAST
> note — and all 1003 sit in the bar's final 16th.** Not most. Every one.

It's one line of code: the minimum-note rule exempts the last note of every bar,
so a 16th hanging off the barline is the one short note it can never remove. The
accompaniment contributes **zero** of them — when you said "in the left hand" you
were hearing the octave partner, which is the tune an octave *down*.

Fixed on the new page: **204 → 84** of that gesture, same songs, that flag the
only difference. It does *not* change overall short-note density — there's other
16th activity in the mix and that's still open.

## Two things I need your ear on

1. **The budget lift.** To let the frozen slot cast I raised the page's rub
   budget. Priced exactly: **with it 3.98 close semitone/tritone hits per bar,
   without it 2.89, and last round's page was 2.51.** So the reels' motor device
   costs +38% friction. I turned the echo layer off to pay for part of it. If it
   sounds dissonant, that's the trade and I'd rather you kill it than have it
   hidden.
2. **The hold/move layer isn't chord-snapped.** Snapping collapsed its walk to
   three onsets on one pitch. Un-snapped it's *half* as out-of-key as the lead
   (4.6% vs 9.5%) but 41% of its notes are non-chord — which is what a neighbour
   turn is. Tell me if it rubs.

## Your notes moved 15 songs — before I changed anything

Importing your 23 vanriver notes **rewrote 15 of the 23 songs on their own page**,
14 of them in the harmony itself. Six gates in the engine read "has he written
about this card?" to decide whether a *new* feature may land — and the moment your
note exists they also strip features the song **already had when you judged it**.
`cp_royal_road_nostalgic` ("no complaints") and `cp_planing_maj7_mysterious`
("really good") both lost their colour upgrade.

Fixed with one flag. **`songs.html` 0 of 47 moved, `vanriver.html` 0 of 23 moved.**

## Still open

- **Your abstraction ask, three times**: "could also be abstracted to any dark
  environment", "any environment that's calm", "can be abstracted to anything
  epic ... if it's energetic just add the percussive strings I mentioned with
  their repeated intervals + percussion". That is a real design change — songs
  keyed to an ENERGY + MOOD class rather than a named environment, with the
  environment adding instruments on top. It wants its own round; say the word.
- **The e-piano** peaks at 0.892 and is the loudest voice on every song. You did
  not name it and you praised the layering, so I left it. Say if it is too much.
- A lone 16th at the end of a **3-onset** bar still cannot be removed — dropping
  it would leave one note. That needs a merge, not a drop.
- Two songs did not fit their environment ("doesn't really fit snow", "more like
  a high tech facility") — the progressions are fine, the lane tags are not.

- **16th activity elsewhere in the mix** — the melody-family fix doesn't reach it.
- **R4's limit**: an octave *parameter* isn't a register, so layers on different
  bands can still land within a 6th. Fixing it properly means allocating on
  emitted pitch, which the generator can't see.
- Your other live notes from last round, unaddressed here: the vibraphone playing
  36 notes below its own declared range; `vr_cloudy_nostalgic`'s advertised flute
  layer that has 48 notes in its solo and **0 in the mix**; strings/oohs/clarinet
  too loud; "snow should be higher on the piano".
- The mid-band drum bug: `audition/songs.html` still has **no snare in any of its
  33 drum songs**. Correction to what I told you before — it is not unreachable,
  `percBackbeat` gets there; the judged suite just never asks for it.
- `tailOff` still unsettled; the r26 chordcam verdicts still not imported.
- Nothing committed.

## npm test — 353/353
