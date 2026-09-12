# r37 — the drum archive read out (his "i want to explore drums … how to make good beats on top of it, like more complex ones as well that flow with the song")

**Source.** `800000_Drum_Percussion_MIDI_Archive[6_19_15].zip` (934 MB), which he
attached on 2026-09-12. Extracted to `~/Downloads/drumarchive` — **3.1 GB,
696k–1.19M `.mid` files** depending on how you count (the walker sees 1,192,762
paths; `find -iname '*.mid'` on the settled tree says 696,206; the difference is
files that were still being written when the first count ran). Genre-foldered:
Superior Drummer 2 (369k), a GM MIDI Pack (332k), Studio Drummer, per-decade
packs (50s/60s/70s/80s/Modern/Vintage), and ~30 small curated folders that carry
the useful vibe labels — Funk / Blues / Linear / Odd Meter / Fills Unlimited /
Classic Beats / Rock:Indie / Electronic Dance / L.A.Riot / Long Loops / Reggae /
Samba / Africa / Asia / Europe / Middle East / South America / World.

**ANALYSIS ONLY (D95).** It lives outside the repo, is never imported, and
nothing in `src/lib/` is produced by counting it. Anything that ships is authored
by hand from the findings, addressed by NAME, the way `LAYER_PATTERNS` and
`techniques.js` are.

**POPULATION — stated up front (D137's law).** Every number below is over
**718,475 files that parsed with ≥4 drum events**, out of 774,268 walked
(55,793 skipped: unparseable, or fewer than 4 events). A first pass skipped
**845,779 of 1,192,762** because the drum-track test was `channel === 9` only;
files that put the kit on another channel vanished, and they were concentrated
in exactly the small curated folders whose labels matter most (Funk Drums
returned 0 rows, Linear Drums 0, Fills Unlimited 0). The fixed test — channel 10,
or a track named drum/perc/kit, or, when the file has no channel-10 track at
all, a track whose notes are ≥90% inside MIDI 27–87 — takes the skip rate from
**70.9% to 7.2%**. The corpus numbers in this file are the SECOND pass.

## 1. The gap, measured in one table

Our side is **68 songs carrying drums** across `songs.html` + `vocaloid.html` +
`vocalab.html`, measured on the `_drums` solo in the same metrics.

| | corpus (718,475) | motif-engine (68) |
|---|---|---|
| kick present | 91.6% | **25.0%** |
| snare present | 85.8% | **7.4%** |
| closed hat | 59.0% | 17.6% |
| open hat | 29.4% | **0.0%** |
| ride | 24.4% | **0.0%** |
| crash | 18.7% | 1.5% |
| tom | 51.6% | 4.4% |
| hand percussion | 35.1% | **79.4%** |
| grooves that are ONE piece class | 3.0% | **82.4%** |
| median piece classes per groove | **4** | **1** |
| median distinct velocities | **28** | 7 |
| grooves with ≥8 velocities | 93.6% | 33.8% |
| simultaneity (share of slots with >1 piece sounding) | **0.447** | **0.000** |
| any onset off the 16th grid (swing / triplet / flam) | 50.4% | **0.0%** |
| any odd-16th onset (the "e"/"a") | 73.2% | 76.5% |
| multi-bar loops where EVERY bar differs | **89.4%** | **0.0%** |
| multi-bar loops where every bar is identical | 1.8% | **66.2%** |

**Read the three bold rows together and the finding states itself: the engine is
not writing a drum kit. It is writing one-class hand percussion that repeats.**
82.4% of our songs carry exactly one piece class, 79.4% of them carry hand
percussion, 7.4% have a snare at all, and nothing ever sounds at the same instant
as anything else (simultaneity 0.000 — a real kit is 0.447, because a kick and a
hat land together on nearly every downbeat). Two thirds of our loops repeat one
identical bar for the whole song; nine tenths of the corpus's loops never repeat
a bar at all.

This is the measured form of his "drums can totally be better and more complex/
immersive", and of the `CLAUDE.md` entry that has been standing open since r22:
the default selector is `[byBand('low') ?? pats[0], byBand('high')]`, capped at
two, so the 12 mid-band patterns — the snare, the backbeat — cannot be chosen.
The archive says the cap is the wrong shape, not just the wrong band: the corpus
median is **four** classes and 32.8% of files carry exactly four.

The one row where we already match is the odd-16th rate (76.5% vs 73.2%) — we
syncopate as often as real drummers do. What we never do is hit two things at
once, vary a bar, or leave the grid.

## 2. Technique rows — what the corpus does that we do not

Each row is a candidate for `src/lib/techniques.js` (addressed by name, never
iterated, so adding one cannot re-roll a song — D95/D101).

**T1 · THE KIT IS A CHORD, NOT A MELODY.** Simultaneity 0.447: at nearly half of
all sounding instants, two or more pieces strike together. Ours is 0.000 — the
compiler's own `drumExpr` "last writer wins" defect (D123) was the same fact in a
different place, and even after that fix the SELECTOR never picks two pieces that
would collide. A kit part is authored as a stack of independent piece-lanes, and
the lanes are supposed to overlap.

**T2 · EVERY BAR IS DIFFERENT (89.4%).** Not a variation pass over a repeated
bar — the corpus's default unit is a 2- or 4-bar phrase (23.1% two-bar, 50.2%
four-bar) in which each bar is written differently: a kick displaced, a ghost
added, an open hat on the last 8th. Only 1.8% of real loops repeat a bar exactly.
Our 66.2% identical-bar rate is the same defect D97 fixed for the accompaniment
("no changing like 1 interval randomly doesn't change it") and never applied to
drums.

**T3 · VELOCITY IS THE INSTRUMENT.** Median 28 distinct velocities per groove,
93.6% carry ≥8, and only 0.7% are flat. Ghost notes are explicit: 23.5% of
grooves have snare hits under 64, and where they exist they are **37.5% of that
groove's snare hits** — the ghost is not an ornament, it is a third of the snare
part. Our median is 7 distinct gains, and those are mostly the section curve, not
articulation.

**T4 · HALF OF ALL DRUMMING IS OFF THE 16th GRID (50.4%).** Swing, triplets,
flams and push/pull. By genre: Swing 0.58 of onsets off-grid, Blues 0.33, 60s
0.27, 50s 0.26, Vintage 0.24. The engine is at **0.000 on every song ever built**
— `opts.swing` exists (r16) and is opt-in and essentially unused. This is the
single largest categorical absence in the table.

**T5 · THE OPEN HAT IS AN ACCENT, AND IT MARKS THE PHRASE.** 29.4% of grooves
carry one; in the loop-oriented folders it is near-universal (L.A.Riot 0.97,
Nothing But Three 0.72, Long Loops 0.67, Drumatic 0.51). We have no open hat
sound at all. Same for the ride (24.4% / 0%) — the ride is how a corpus groove
changes section without changing pattern.

**T6 · THE FILL IS THE LAST BAR OF THE PHRASE.** `Fills Unlimited` is its own
folder (96 files, 3 piece classes, tom share 0.49, ride 0.47) and the decade
packs interleave fills with grooves by filename. A fill is tom-and-crash-heavy,
one bar, and it lands where the form turns — which is exactly where our engine
currently does nothing.

**T7 · HAND PERCUSSION IS A SEPARATE VOCABULARY, AND IT IS OURS BY ACCIDENT.**
The world folders (Africa, Asia, Europe, Middle East, South America) are
single-class hand percussion at 7.0–7.8 onsets/bar with simultaneity 0.00 — and
that is a precise description of the motif-engine's drums on 79.4% of its songs.
We have been writing world percussion for every prompt, including the rock and
festival ones. The vocabulary is legitimate; the default is not.

**T8 · TEMPO IS CARRIED IN THE FILENAME.** The curated folders name tempo and
often the source song (`82_TheJoker_SteveMillerBand2.mid`,
`117_EveryBreathYouTake1.mid`), so a groove can be retrieved BY TEMPO — median
bpm 120 (Superior), 128 (GM pack), 95 (Rock/Indie), 122–123 (Blues/Funk), 160
(Nothing But Three), 148 (Swing). "Flows with the song" starts with picking a
groove written at the song's tempo instead of stretching one.

## 3. Per-genre table (medians)

Full table: the scratchpad's `genre-table.txt`. The columns that separate the
lanes:

| folder | n | bpm | on/bar | classes | vels | off16 | off8 | stack | ride | openHH | tom |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Superior Drummer 2 | 368757 | 120 | 18.5 | 4 | 32 | 0.000 | 0.174 | 0.50 | .25 | .38 | .45 |
| GM MIDI Pack | 331749 | 128 | 15.0 | 4 | 24 | 0.169 | 0.056 | 0.40 | .24 | .20 | .60 |
| Linear Drums | 338 | — | 9.5 | 4 | 12 | 0.000 | 0.318 | **0.00** | .20 | .44 | .86 |
| Funk Drums | 268 | 123 | 15.0 | 4 | 15 | 0.000 | 0.300 | 0.29 | .17 | .45 | .32 |
| Rock:Indie | 268 | 95 | 12.5 | 3 | 10 | 0.000 | 0.083 | 0.44 | .32 | .25 | .50 |
| Odd Meter | 217 | 95 | 17.0 | 3 | 15 | 0.000 | 0.355 | 0.25 | .33 | .37 | .36 |
| Blues Drums | 135 | 122 | 14.5 | 3 | 17 | 0.333 | 0.000 | 0.69 | .29 | .04 | .13 |
| Swing | 39 | 148 | 12.0 | 3 | 15 | **0.580** | 0.000 | 0.23 | .64 | .13 | .56 |
| Samba | 24 | 115 | 28.0 | 6 | 7 | 0.000 | 0.414 | 0.64 | .50 | .38 | .96 |
| L.A.Riot loops | 108 | 91 | 12.7 | 5 | 37 | 0.155 | 0.164 | 0.51 | .53 | **.97** | .25 |
| Africa / Asia / Europe / M.East / S.America | 786 | 130 | 7.0–7.8 | **1** | 10–18 | ~0 | .12–.25 | **0.00** | 0 | 0 | 0 |

**"Linear Drums" is a named technique with a measured signature**: simultaneity
**0.00** with FOUR classes — no two pieces ever strike together, which is what
"linear" means, and it is the one folder whose shape our engine already
accidentally has. It is also the folder with the highest odd-16th rate outside
jazz (0.318). If we want one lane that keeps the current sparse feel while
sounding deliberate, this is its name and its rule.

## 4. What this does not settle

- **Fill placement inside a real arrangement** — the archive is loops, not songs,
  so it says what a fill IS, not how often a drummer plays one across a 3-minute
  form. That has to come from his ear.
- **Whether he wants the density.** Corpus median is 16.5 onsets/bar against our
  10.4. His standing note is "the drums a bit too loud" and D77 caps the kit at
  0.72 × lead. More PIECES at lower velocity is not the same as more volume, and
  the first build must hold the measured kit/lead ratio while the vocabulary
  triples — otherwise the fix arrives as a "too loud" card.
- **Velocity → our gain.** The render tier exports gain as MIDI velocity
  (absolute, never stem-normalised), so 28 distinct velocities is reachable; but
  D123's clobbered-envelope trap (`.gain(x)` replacing `.gain("<env>")`) is
  exactly the shape that would silently flatten a new drum envelope. Count
  DISTINCT REALIZED values on every new drum layer before believing it.
