# r23 — what makes a battle theme feel like one

His ask, verbatim: *"for the boss fights learn what makes them actually feel
energetic with stakes on the line and epic through their layering patterns and
what they do in each instrument and rhythm and intervals"* — with *"feel free to
copy some if needed"*.

Analyser: `scripts/analyze-boss-r23.mjs`. Raw per-file records:
`research/boss-r23.json`.

## Read this before using any of it

**The contrast is HIS OWN SET, not a corpus.** 13 battle files against 43
non-battle files, all from `audios/manual-r22` and `audios/manual-r22b` — the two
folders he hand-picked and annotated. Both sides are music he chose, so a
difference between them is a **battle property** rather than a taste property.
That is the whole reason for this design, and it is also its limit: n is small,
and nothing here is counted into `src/lib` (D95 holds).

**Every statistic is taken inside the CORE WINDOW.** His scoping instruction —
*"some songs are abstract or have specific quirks - just analyze in terms of
sections or the 'normal' sections where it's a good part of the song basically"*
— is enforced by picking the longest stretch where the set of sounding parts
holds still at full strength (`stability × 0.6 + strength × 0.4`). Whole-file
averages are what made the Sm4sh menu, a 15-part medley, read like a sparse
arrangement in the previous round.

**THE FIRST PASS OF THIS ANALYSIS WAS WRONG.** It reported *"minor share: battle
100.0%, other 0.0%"* and a flat 0.0% for every chord quality. Cause: a **median
taken over a 0/1 indicator**, which is not a statistic — it says "more than half"
versus "fewer than half" and prints it as a percentage. Rates and shares are now
reported as MEANS; magnitudes stay medians. The real minor share is 69.2% vs
46.5%. Project law: a suspiciously clean number is a bug until proven otherwise.

**Assignment is by filename and printed for review.** `battle|boss|miniboss|
combat|army|airman|eggreverie|hand_combat`. Chase/chaos/challenge files go to a
separate TENSION bucket (n=3, too small to report) so a chase cue cannot silently
carry the battle claim.

---

## 1. THE MECHANISM: repetition, not motion

This is the finding. Both the bass and the support layer separate from
non-battle music on the same axis — **how often they repeat a pitch** — and in
both cases they play FEWER notes, not more.

### The bass is a pedal, not a walk

| | battle | other |
|---|---|---|
| repeated-note rate | **62.2%** | 36.8% |
| stepwise rate | 19.8% | 31.5% |
| onsets / bar | **5.38** | 6.71 |
| pitch economy | 9.9% | 13.9% |

Onset grid, per battle file — `x.x.x.x.x.x.x.x.` (straight 8ths) in **6 of 10**:

```
Grandia2_BattleVersion3     x.x.x.x.x.x.x.x.  sub=8.0  maxRun=17  range=3
SSBWU-Megaman2_AirMan       x.x.x.x.x.x.x.x.  sub=8.0  maxRun=14  range=16
Hand_combat                 x.x.x.x.x.x.x.x.  sub=8.0  maxRun=13  range=15
soabattlev12                x.x.x.x.x.x.x.x.  sub=10.7 maxRun=144 range=0
AFOArmy                     xx.xx.xx.xx.....  sub=8.0  maxRun=48  range=5
EggReverie                  xxxxxxxxxxxxxxxx  sub=16.0 maxRun=13  range=14
```

`maxRun` is the longest run of identical consecutive pitches: **13 to 144**.
`soabattlev12` holds ONE pitch for its entire core window. Non-battle basses in
the same set run `maxRun` 2-7.

### The support layer hammers one pitch

Support ostinato bar shapes, as intervals from the bar's lowest note:

| shape | battle | other |
|---|---|---|
| `0-0-0` | 16.1% | 1.5% |
| `0-0-0-0` | 7.5% | 2.5% |
| `0-0-0-0-0` | 4.7% | — |
| **all pure repeats** | **34.2%** | **7.0%** |
| `0-3-2-5-7-6-5-3` | 11.2% | — |

**4.9x, the largest single separation in the whole analysis.** The modal battle
support bar is THREE onsets, all the same note. Non-battle support is varied
(`0-7-0-7`, `0-4-2-9-0-4-2-9`, `0-3-0-3`).

His own note predicted this from the other direction: *"in battle themes the
violins can go root third fifth or root fifth 8th repeatedly 8th note style ...
to make it sound more 'action' and 'high stakes'."* The three shapes he names
all MOVE; the measurement says the dominant one does not. Both are now in the
engine and the page lets his ear pick.

---

## 2. THE HARMONY IS OPEN — AND LESS DISSONANT

This runs opposite to intuition and it is the most useful corrective here. An
engine reaching for "stakes" would add tension intervals. His battle references
go the other way.

| vertical interval class | battle | other |
|---|---|---|
| octave / unison | **36.1%** | 28.3% |
| perfect fifth | **15.3%** | 13.0% |
| thirds (m+M) | **15.5%** | 20.2% |
| tritone | **1.7%** | 2.3% |
| semitone | **1.0%** | 1.8% |

| chord quality | battle | other |
|---|---|---|
| bare power fifth `5` | **11.7%** | 4.9% |
| min9 | **21.8%** | 15.9% |
| maj9 | 9.9% | 16.6% |
| dom7 | 0.8% | 3.2% |
| dom9 | 1.2% | 5.0% |
| dim | 0.8% | 1.5% |
| dim7 | 0.3% | 1.1% |

Open intervals up, thirds down, **every dissonance class down**, dominant
function down, minor-9 colour up. Battle harmony is thirdless-leaning, power-
fifth-heavy, and more consonant than his non-battle picks.

---

## 3. DRUMS — the answer to "bare minimum"

His note: *"the drums don't feel too solid yet, they feel very bare minimum."*

| | battle | other |
|---|---|---|
| **tom hits / bar** | **1.887** | 0.313 (6.0x) |
| files using toms | 5/12 | 11/39 |
| crash-covered bars | 19.8% | 13.8% |
| files using a crash | 8/12 | 26/39 |
| hats / bar | **5.2** | 6.7 |
| hats on 16th positions | **8.8%** | 21.9% |
| kick / bar | 4.00 | 3.43 |
| four-on-the-floor share | **34.2%** | 42.8% |
| fill bars | 9.4% | 6.0% |
| quiet bars | 9.2% | 4.3% |
| distinct drum voices | 7 | 6 |
| hand drums / bar | **0.000** | 0.926 |

**A battle kit is not a busier kit.** Its hats are fewer and plainer; its kick is
less four-on-the-floor. What it has that the others don't is TOMS, a CRASH, and
more variation at both ends — more fill bars AND more quiet bars.

Hand drums are a non-battle voice (0.000 vs 0.926), which independently supports
the desert/jungle exclusion.

---

## 4. THE MELODY — his own note, confirmed from a second direction

| | battle | other |
|---|---|---|
| onsets / bar | 3.50 | 2.81 |
| repeated-note rate | **24.8%** | 16.3% |
| mid leaps (3rd-5th) | **19.9%** | 32.7% |
| range (semitones) | **20** | 14 |
| median pitch | 79 | 76 |

Wider range, but FEWER leaps and more repeated notes — the battle melody covers
more ground by stepwise motion and hammered repetitions rather than by jumping.
That is his r22 note (*"the melody doesnt really jump or 'jitter' around except
for very intentional fast sections"*) arriving from an independent measurement,
and it agrees with the production reels' *"largest leap a 4th"*.

---

## 5. WHAT IS **NOT** THE MECHANISM

- **Harmonic rhythm.** 1.31 chord changes/bar battle vs 1.38 other. Battle music
  does not change chords faster. Do not reach for this.
- **Dynamics — and this is a LIMIT OF THE SOURCE, not a finding.** Velocity
  stdev 9.2 vs 9.3; snare ghost-notes in 2 of 12 battle files and 3 of 39
  others. His reference MIDIs are near-uniform, so **this set cannot teach
  dynamics at all**. The "bare minimum" complaint is answered here with toms and
  a crash, not with velocity shaping, and that gap is open.
- **Register overlap** (38.3% vs 36.4%) and **unison downbeats** (23.1% vs
  21.6%) — flat.
- **Tempo (150 vs 120) and concurrency (6 vs 5)** are real but modest, and both
  are already engine defaults for these vibes.

---

## 6. WHAT WAS WIRED, AND WHAT THE PROBE SAID AFTERWARDS

All four are gated on `v.role` (the vibe's declared dramatic GENRE), never on a
lane — his instruction this round: *"applied to applicable genres. not specific
ones like jungle or desert or etc."* They additionally EXCLUDE horror, desert and
jungle, because a role gate does not outrank a lane law: five of the seven
battle/boss songs on the judged page are citadel, and D93/D100 already settled
that a dread lane wants its harmony sustained.

| device | claim | measured on the emitted notes |
|---|---|---|
| `driveBass` | repeated-root pedal | **85.5%** repeated at 8.25 onsets/bar vs control **0.0%** at 1.25. **Overshoots** the 62.2% reference — a pure eight-per-chord pedal is 87.5% by construction, while the references mix pedal bars with moving ones. |
| `support-hammer` | pure-repeat ostinato | **100%** pure-repeat bars vs control **0.0%**. |
| `support-open5` | open sonority | Direction right on 4-5 of 5 songs for every class (octaves +3.4pts, fifths up, thirds down, TT down, m2 down) but **the target is not reached**: 24.7% octaves vs 36.1%, thirds 23.7% vs 15.5%. |
| `battleKit` | toms + crash | **2.00** toms/bar vs target 1.887; crash on **25.0%** of bars vs 19.8%. |

### Three things I got wrong, all caught by the probe rather than by reading

1. **`support-hammer` was `R-5-5`** — written that way "so the chord change stays
   audible". A bar holding two pitches scores 0% pure-repeat **by construction**,
   and it measured exactly 0.0% on all 10 songs carrying it. It is one pitch now.
2. **Both drum rates were 2x over.** 8 onsets in a 2-bar cell is 4.0/bar, not the
   2.0 the comment claimed; 2 onsets in a 4-bar cell is 50%, not 25%. Measured
   4.00 and 50.0%. Now 4-bar and 8-bar cells.
3. **My first bass probe reported a beautiful "4 notes, 0.0% repeated"** — it
   took notes at or below `min + 7`, and the octave-1 turnaround drop IS the
   minimum, so the window excluded the octave-2 pedal entirely. Re-run on the
   solo.

Plus one design gate corrected by its own source: `frozenSlot` shipped with
`bpm >= 90` on the assumption it was a pulse device. **The six reels it comes
from run at 63, 69, 75, 80, 91 and 102 — four of them under 90.** Four of the
fourteen stress-test pairs came out byte-identical because of it.

---

## 7. A PARSER BUG FOUND ON THE WAY

`src/lib/prompt-parse.js` tested `t.includes(' ' + w) || t.includes(w + ' ')` —
an OR, so the leading-space form anchored only the START of a word and the
trailing-space form only its END. **Any word beginning or ending with a keyword
matched.** Symptom: *"warm nostalgic morning music, heartfelt piano and strings"*
compiled to environment `fight` at 156bpm with a battle drum kit, because
`ENV_WORDS.fight` contains `'war'`. The same shape reaches `'sub'` inside
`'subtle'` and `'lab'` inside `'elaborate'`. Both boundaries are now required,
with an inflection tail so `battles`/`caves`/`sneaking` still match.
