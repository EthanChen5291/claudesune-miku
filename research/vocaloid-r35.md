# The Vocaloid set (r35) — how a sung line is written, and what the engine's voice was not doing

**His ask (2026-09-12):** "analyze the new files i added. they're specifically
vocaloid. learn from the songs as a whole just as you would from a normal
sample analysis (including chord progressions, patterns, intervals, melodies,
accompaniments, harmonies, layering, etc for the vibe. the vocaloid part is
also piano but is its own instrument/section i believe. this section will be
playing one note at a time for most of the songs. notice how some songs have
harmony directly supporting the voice though, whether that's another voice or
another instrument. currently, our voices are good and the melody is good but
it's relatively uniform. it fits calm songs and a range of mid/high-energy
songs but should be expanded. learn from vocaloid patterns and agreements with
harmony and ranges and speeds that can be done (and the choruses to support)
with a deep analysis, once again, test variations that you're unsure about and
ask me questions if needed. once done, generate a suite of songs with these
vibes, with a more diverse range of prompts that are actual descriptions …
with vocaloids"

## What the set is

41 MIDI files dropped into `~/Downloads` (and copied into the Top MIDI Tracks
Pack folder) between 01:50 and 02:29 on 2026-09-12, staged at
`audios/vocaloid-r35/` (gitignored — copyrighted transcriptions, D95:
analysis-only, nothing here is counted into `src/lib`). Of the 41:

- **36 analyzed** — 33 Vocaloid originals (DECO*27, wowaka, ryo, kemu, MARETU,
  Neru, Kikuo, Giga, mikitoP, sasakure.UK, Kanzaki Iori, Kurousa-P, Kairiki
  Bear, chouchou-P, surii, Hachioji P …), four J-pop songs sung by humans in
  the identical arrangement style (YOASOBI's Monster and Yoru ni Kakeru, Ado's
  Usseewa and New Genesis — four files, one lane), and Coldplay's Yellow, kept
  as a **western control**;
- 1 skipped — "Hatsune Miku - Senbonzakura" is a two-hand piano arrangement
  with no voice track (the other Senbonzakura file is analyzed);
- 4 excluded — `get_proto-3..6.mid` are his own reel prototypes, not part of
  this set.

**Every file is the same three-track reduction:** `NOTE` (the accompaniment's
right hand — chords, counter-figures, the instrumental hooks), `VOCAL` / `MIKU`
/ `SING` / `RIN` (the sung line, one note at a time — 100% monophonic in 33 files, 96–99% in
two, and 50% in Mind Brand whose VOCAL track carries stacked effects), `BASS` (the left hand), and in two files a `VOCAL 2`. Roles were assigned
by NAME where the track is named (86%) and by BEHAVIOUR otherwise (the most
monophonic mid-register part is the voice; the lowest part is the bass) — never
by GM program, because most files declare none.

**Labels** (`LABELS` in `scripts/analyze-vocaloid-r35.mjs`) are inferred from the
TITLE — producer, genre lane, the song's reputation — the way the r34 pack was
labelled. They are not his verdicts. Lanes: rock 16, pop 7, electro/dance 5,
j-pop (human) 4, ballad 3, control 1.

**Method.** `scripts/analyze-vocaloid-r35.mjs` → `audios/vocaloid-r35/_analysis.json`;
`scripts/report-vocaloid-r35.py [--songs]` prints the tables below;
`scripts/baseline-vocal-r35.py` measures the ENGINE's own sung lines (every
`audition/hq/*.vocal-score.json`, 17 scores) with the same yardsticks;
`scripts/probe-vocal-harmony-r35.mjs audition/vocal.html` measures the engine's
voice against its harmony IN THE MIX (16 songs), labelling chords with the same
`chordTimeline` the corpus analyzer uses. Chords in the corpus are labelled from
`NOTE + BASS` at half-bar resolution (the voice is not consulted, as in every
earlier read-out); key by Krumhansl–Schmuckler over all notes.

**Population.** One, unless a table says otherwise: the 36 analyzed files. The
verse/chorus tables use the 36 songs whose sung 4-bar windows number ≥ 4 (all
36). The second-voice table is the two files that carry one.

**Caveats found while measuring (each fixed or bounded):**
- Velocity is a flat 127 on the voice in 35 of 36 files (Binomi carries 19
  values) — the transcriptions carry NO dynamics; nothing below says anything
  about loudness.
- Three files (Monster, Senbonzakura, Tondemo Wonders) were laid down off the
  bar line — Monster and Senbonzakura by a 16th; Tondemo by a 32nd for bars
  0–95 and a 16th+32nd from bar 96 (one rotation per file leaves its last 48
  bars a 16th off — its odd-16th and phrase-start figures are unreliable);
  and four files (Gimme×Gimme, Iya Iya Yo, Love Me×3, Mind Brand) sit on
  TRIPLET grids, so their "odd 16ths" are triplet subdivisions snapped to
  16ths (they supply about a third of the corpus's odd-16th onsets; the odd16
  p90 falls from 56% to 28% without them); the analyzer measures the rotation that puts the most
  bass+acc onsets on the 8th grid and shifts the file (`gridShift16ths`). Before
  the fix Monster read 100% odd-16th onsets and 0% chord tones on beat 1.
- Two MARETU files carry non-vocal material on the VOCAL track (Jigsaw Puzzle
  39–96, Mind Brand 36–107: a growled octave-down section and synth screeches);
  they stay in the population — every range figure below is a median over
  songs and both are outliers, not the middle.
- Two Breaths Walking's voice sits at median 78 (F#5) — the transcriber's octave
  choice; kept.
- A first "does the accompaniment sound the voice's pc" measure was ABANDONED:
  in a dense mix every chord tone the voice sings is doubled by some layer, so
  excluding the doubling excluded exactly the agreements (0% on every engine
  downbeat), and in a piano reduction the verse accompaniment is a bass note
  plus one counter-note, so the population collapsed. Chord-LABEL agreement is
  the like-for-like number and is what both sides report.

## The headline — twelve laws of a sung Vocaloid line (and where the engine stands)

| # | law (median over the 36 songs) | corpus | engine (17 sung scores / 16 mixes) |
|---|---|---|---|
| 1 | **The voice sings 8ths.** IOI median 0.5 beat; 55% of intervals-between-onsets are 8ths, 21% quarters, 5% 16ths | 3.9 syllables/s, 5.5 notes per sung bar | **1.4 syl/s, 2.8 notes/bar, IOI 1 beat, 3% 8ths** |
| 2 | **Speed is tempo-invariant.** Faster songs sing FEWER notes per bar (7.2 at 100–139 bpm → 4.9 at 170+) so the syllable rate holds at ~3.7–4.0/s | 3.7–4.0 syl/s in every band ≥100 bpm | 0.8–2.0 syl/s |
| 3 | **Steps and repeats, not thirds.** Within-phrase intervals: step 48%, repeat 25%, third 13%, 4th–5th 9%, 6th+ 2%; mean \|interval\| 2.0 semis | leaps ≥P4 recovered by a step 24% | **step 18%, third 36%, 4th–5th 26%, 6th+ 10%; mean 4.4** |
| 4 | **Short phrases, 8th-note breaths.** A phrase is 3.5 beats / 6 notes; the breath between phrases is one 8th (0.5 beat); 71 phrases a song | p90 phrase 8.5 beats | **7 phrases of 15.5 beats / 11 notes; breath 0.75** |
| 5 | **Phrases start off the downbeat.** Downbeat 9%; the three off-8ths 23%, beat 4 11%, the & of 4 10%, beat 2 12%, beat 3 10% (a first cut lumped the & of 4 into a 26% "beat-4 pickup" — the verify pass split it) | | **100% downbeat** |
| 6 | **The tune repeats — exactly.** 32% of 2-bar cells repeat an earlier cell's shape and 31% repeat its PITCHES too (the hook returns verbatim); 42% repeat the rhythm; 52% of 1-bar cells | 35 distinct 2-bar shapes a song | **0% (p90 25%)** |
| 7 | **Range: a 21-semitone span, an 11-semitone home.** Lowest 58 (A#3), highest 80 (G#5), median 68 (G#4); 80% of notes inside 11 semitones | lanes agree within 2 semis | 55–78, median 67, tessitura 13 — the range is already right |
| 8 | **Chord tones on the beat, tissue between — a small gradient.** Chord-tone rate beat 1 64%, beat 3 67%, off-8th 59%, off-16th 54% under the author's labeller (an independent template labeller gives 66 / 64 / 61 / 60 — the beat-3-over-beat-1 ordering does not survive it; a 5–6 point strong-to-weak gradient does); 62% of sung TIME on chord tones; non-chord tones 39% of onsets, 57% resolved by step, 58% approached by step | out of key 4% (0% p10, 22% p90); pentatonic 83% | CT beat 1 63% / beat 3 83% / off-8th 87% (flat, inverted); NCT 29% resolved **34%**; **out of key 15%** |
| 9 | **The chorus lifts the voice ~3–5 semitones and the accompaniment doubles it an octave UP.** Chorus − verse voice median +5.2 (register in the selector) / **+3.1 with the chorus chosen by the accompaniment alone**; 19 of 36 lift ≥ 3 under the accompaniment-only selector (31 under the register-inclusive one) | acc doubles the voice's pitch class at its onsets **9% in verses → 92% in choruses**; 83% of doublings above, 89% are the acc's top note, 89% inside a chord | the guide + `_octave` double 95% of notes everywhere (by construction), 97% above |
| 10 | **Verse thin, chorus thick — by count and by strike.** Acc onsets/bar 2.6 → 6.4 (×2.5), notes per strike 1.06 → 2.08 (×2), acc top +11 semis, voice notes/bar ×1.00, chords/bar ×1.00 | the harmony does not change rate; the TEXTURE does | acc thickness is a per-letter travel choice, unrelated to verse/chorus |
| 11 | **The second voice TRADES, it never stacks.** Both files with a VOCAL 2 (Gimme×Gimme, Roki): 0% of its onsets strike with the voice, 0% sound while it sounds; Gimme's answers fall in the voice's silent bars (76%), Roki's inside the same bars (91%) | the "harmony under the voice" is the ACCOMPANIMENT's doubling (law 9), not a harmony singer | no second voice exists |
| 12 | **Minor, fast, plain-ish.** 67% minor keys; bpm median 162 (77–210), 16 of 36 at 170+; 1.53 chords/bar; colour 35% (sus 13% of half-bar TIME — 16% of labelled segments; m7 13%, ^7 10%); 47% of half-bars are THIRDLESS in acc+bass, so the "plain triad" labels are mostly key-completed; diatonic 85%; loops 4 or 8 bars, 21 of 35 start OFF the tonic | quality shares below | the vocal page is 68–176 bpm, 4 of 16 minor |

The three laws that reach the engine's voice hardest are 1, 3 and 5–6 together:
the engine's sung line is a quarter-note instrumental lead with leaps, starting
every phrase on the downbeat and never repeating a cell. That is exactly "good
but uniform" — it is one shape.

## LANE 1 — the voice

### Range and tessitura (population: all 36)

| metric | median | p10–p90 across songs |
|---|---|---|
| lowest note | 58 (A#3) | 53–64 |
| highest note | 80 (G#5) | 75–85 |
| median note | 68 (G#4) | 64–74 |
| tessitura width (p10–p90 of the song's notes) | 11 semis | 8–14 |
| full range | 21 semis | 14–27 |
| sung share of bars | 74% | 61–88% |

By lane the medians agree within two semitones (rock 58.5–80 / median 69; pop
60–78 / 68; electro 60–81 / 68; human j-pop 54.5–78 / 64; ballad 55–79 / 66).
The human singers sit ~4 semitones lower and use a wider tessitura (12.5 vs
8–10) — a synthesized voice is written in a narrower home.

**Against the engine:** 55–78, median 67, tessitura 13. The range is right;
export-vocal's A3–E5 target and the D138 ceiling need no change.

### Speed (population: all; then by tempo band)

| bpm band | files | syl/s | 16th share | 8th share | notes / sung bar | IOI median |
|---|---|---|---|---|---|---|
| <100 | 2 | 2.19 | 3% | 70% | 6.5 | 0.42 |
| 100–139 | 9 | 3.73 | 34% | 54% | 7.2 | 0.5 |
| 140–169 | 9 | 4.04 | 10% | 56% | 6.0 | 0.5 |
| 170+ | 16 | 3.91 | 1% | 52% | 4.9 | 0.5 |

**The syllable rate is the constant, not the note value.** At 110–130 bpm the
line is 16ths a third of the time (Uminaoshi 5.0 syl/s, 53% 16ths; Mousou
Kanshou 44%; Toosenbo 34%); at 170–210 it is 8ths and quarters and the count per
bar halves. Long notes (≥ 2 beats) are 1% of notes (p90 5%); the note-duration
median is 0.5 beat; 85% legato (a note reaches the next onset). The longest run
of consecutive 16ths is 2 (p90 11).

**Against the engine:** 1.4 syl/s (0.8–2.0), 2.8 notes/bar, IOI 1 beat, 13%
long notes. The engine's voice is 2.8× too slow and holds 13× more.

### Intervals (population: all; within-phrase)

repeat 25% · step 48% · third 13% · 4th–5th 9% · 6th–8ve 2% · wider 0%.
Mean |interval| 2.0 semis. A leap of a 4th or more is recovered by a step back
24% of the time (the rest continue or repeat). Songs at the repeat-heavy end are
the chant-like ones (Binomi 81% repeats, Hated by Life Itself 50%, Ievan Polkka
48%, Roki 45%); the step-heavy end is the ballads and rock (Love is War 67%,
Yellow 66%, Eh? Ah, Sou. 62%, Ghost Rule 62%, New Genesis 62%).

**Against the engine:** repeat 3%, step 18%, third 36%, 4th–5th 26%, 6th+ 10%;
mean 4.4. The engine's line is an arpeggio; the corpus line is a scale walk with
repeated notes.

### Phrases and breath (population: all; a phrase ends at a rest ≥ one 8th)

| metric | median | p10–p90 |
|---|---|---|
| phrases per song | 71 | 43–123 |
| phrase length (beats) | 3.5 | 1.5–6.5 |
| phrase length p90 (beats) | 8.5 | 6–16 |
| notes per phrase | 6 | 3–11 |
| breath between phrases (beats) | 0.5 | 0.5–1 |
| phrase-final note (beats) | 0.5 | 0.5–1 |

Gaps between consecutive voice notes, pooled: 17% under a 16th, 56% a 16th to an
8th, 16% an 8th to a quarter, 6% 1–2 beats, 2% 2–4 beats, 4% over a bar. The
breath is an 8th rest, and a rest of a beat or more is a LINE boundary (the
1-beat split gives 19.5 lines of 9.5 beats a song).

**Where a phrase starts** (median share): downbeat 9%, the three off-8ths
23%, beat 4 11%, the & of 4 10%, beat 2 12%, beat 3 10%, off-16th 0%. Songs are consistent
internally and differ from each other — Ghost Rule 49% beat-4 pickups, Love is
War 48%, Senbonzakura 65%; Hibikase 70% off-8th, Android Girl 65%; Toosenbo
60% beat 3, Super Superhero 54%; Melt 40% downbeats, Iya Iya Yo 42%. The
downbeat start is the minority everywhere but Melt.

**Contour** (phrases ≥ 4 notes): arch 30%, flat 35%, ascend 17%, descend 14%.
**Landing** (the phrase-final note against the chord): root 25%, 3rd 17%, 5th
18%, 7th 9%, 9th 4%, other 18%; lands on the key tonic 29%.

**Against the engine:** 7 phrases of 15.5 beats (11 notes), breath 0.75 beat,
100% downbeat starts. The engine writes lines, not phrases, and every line
starts on 1.

### Repetition (population: all; cell = rhythm slots + interval string)

| metric | median | p10–p90 |
|---|---|---|
| 1-bar cells repeating an earlier shape | 52% | 30–64% |
| 2-bar cells repeating a shape | 32% | 13–49% |
| 2-bar cells repeating EXACTLY (pitches too) | 31% | 5–48% |
| 2-bar rhythm repeating (any pitches) | 42% | 20–57% |
| distinct 2-bar shapes per song | 35 | 19–50 |
| odd-16th onsets | 8% | 0–56% |
| anticipations (& of 2, & of 4) | 25% | 18–30% |
| short note in the bar's final 16th | 0% | 0–5% |

Shape repeats and exact repeats are nearly the same number: when a 2-bar cell
comes back it comes back at pitch (the hook), not transposed. This matches the
r34 pop finding ("varied by landing re-fit, never transposition") from the
other side. The D118 final-slot short note does not exist here either (0%).

**Against the engine:** 0% 2-bar repeats (p90 25%) — the r24 anti-repetition
work made every statement different; a sung hook needs the opposite for the
returning cell.

## LANE 2 — the voice against the harmony (population: all; chord = half-bar label from NOTE+BASS)

| metric | median | p10–p90 |
|---|---|---|
| chord tone on beat 1 | 64% | 41–85% |
| chord tone on beat 3 | 67% | 52–84% |
| chord tone on beats 2/4 | 63% | 34–80% |
| chord tone on off-8ths | 59% | 46–74% |
| chord tone on off-16ths | 54% | 38–74% |
| chord-tone share by DURATION | 62% | 55–74% |
| non-chord tones (onsets) | 39% | 27–46% |
| NCT resolved by step | 57% | 38–69% |
| NCT approached by step | 58% | 39–71% |
| out of key (natural scale) | 4% | 0–22% |
| out of key (raised 7th admitted) | 4% | 0–16% |
| pentatonic share | 83% | 64–96% |

The non-chord tones are the diatonic neighbours: 5 (the 4th, 21%), 9 (the
6th, 19%), 2 (the 9th, 18%), 10 (the b7, 13%) above the chord root. This is
the r33 melody-grammar picture again (a strong-beat gradient with stepwise
tissue between), with a shallower gradient than the pop pack: a sung line at 8th
speed passes through neighbours on every weak 8th.

**Against the engine (16 vocal-page songs, in the mix, same labeller):** chord
tone beat 1 63%, beat 3 83%, beats 2/4 74%, off-8th 87% — the gradient is
INVERTED (the weak onsets are the most consonant), NCT 29% with only 34%
resolved (corpus 57%), **out of key 15% against the corpus's 4%** (vg_excited_fight
23%, vx_tense_fight 21%, vg_happy_festival 20%). The engine's tissue rules
(D123) reach the piano lead; the sung score inherits a line whose weak notes
are chord tones and whose strong notes are not.

## LANE 3 — what plays WITH the voice (population: all)

| metric | median | p10–p90 | reading |
|---|---|---|---|
| voice onsets struck with an acc onset (homorhythm) | 77% | 49–88% | the acc is on the 8th grid with the voice |
| acc doubles the voice at pitch | 0% | 0–0% | never the same note |
| acc doubles the voice at another octave | 49% | 26–67% | **9% in verses, 92% in choruses** |
| … doubling above the voice | 83% | | the tune an octave UP |
| … the doubling is the acc's TOP note | 89% | | melody on top of the chord |
| … the doubling is inside a chord strike | 89% | | chord + tune, one hand |
| acc top note above the voice (sounding) | 55% | 4–87% | D77 does not hold in a reduction — the acc's top is the doubled tune |
| nearest acc note UNDER the voice | 4.5 semis | 3–5 | 3rd 39% · 4th 29% · 2nd 8% · 8ve 5% |
| acc notes / bar | 8.3 | 5.3–12.9 | × 1.62 notes per strike |
| acc on the 8th grid | 85% | 48–99% | |
| acc notes / bar, sung bars vs voice-rest bars | 8.2 vs 12.0 | | the interlude FILLS: the acc plays 46% more when the voice rests |
| bass onsets / bar | 9.7 | 7.5–13.8 | 8ths (rock) to 16ths |
| bass on the chord root | 55% | 39–69% | |
| bass median | 43 (G2) | 40–48 | |
| bass strikes that are clusters | 37% | 30–48% | 38% of those octaves |

**The chorus support, stated as a recipe:** in the verse the accompaniment is a
bass line plus ONE counter-note a 3rd or 4th under the voice (1.06 notes per
strike, 2.6 strikes a bar); in the chorus it becomes chords (2.1 notes per
strike, 6.4 a bar) whose TOP note is the sung tune an octave up. The
"harmony directly supporting the voice" he heard is that octave doubling, and it
is the chorus's marker — Mind Brand and Ievan Polkka (the two "verse" doublings
above 25%) are the songs with no real verse.

**The second voice** (2 files): a TRADE. Gimme×Gimme's VOCAL 2 (198 notes,
median 61 under the voice's 70) answers in the bars the lead voice leaves empty
(76% of its notes in unsung bars, 0% overlap); Roki's (89 notes, median 67 over
the voice's 64) interleaves inside the same bars (91%) and never overlaps
either. Neither ever stacks a third. A harmony singer is not in this set.

## LANE 4 — form: verse, chorus, intro, interlude

Two selectors, so the lift is not selected on itself. (a) chorus = the top
third of a song's sung 4-bar windows by voice register + voice density + acc
density + acc thickness, verse = the bottom third; (b) chorus/verse by the
ACCOMPANIMENT ALONE (acc onsets + notes per strike + bass onsets).

| measure | verse (a) | chorus (a) | Δ (a) | verse (b) | chorus (b) | Δ (b) |
|---|---|---|---|---|---|---|
| voice median pitch | 66.0 | 71.2 | +5.2 | 66.9 | 70.0 | **+3.1** |
| voice top | 70.6 | 77.5 | +6.8 | 72.0 | 75.2 | +3.2 |
| voice bottom | 60.9 | 65.1 | +4.2 | 61.8 | 65.0 | +3.2 |
| voice notes / bar | 5.5 | 5.6 | ×1.02 | 5.5 | 5.5 | ×1.00 |
| acc doubles the voice pc | | | | 9% | 92% | +83 pts |
| acc onsets / bar | 3.2 | 6.2 | ×1.92 | 2.6 | 6.4 | ×2.50 |
| acc notes per strike | 1.09 | 1.97 | ×1.81 | 1.06 | 2.08 | ×1.96 |
| acc top (p90 midi) | 71.6 | 83.6 | +12.0 | 71.4 | 82.9 | +11.4 |
| bass onsets / bar | 6.3 | 7.6 | ×1.21 | | | |
| bass median | 42.7 | 44.0 | +1.3 | 43.0 | 44.1 | +1.1 |
| chords / bar | 1.58 | 1.65 | ×1.04 | 1.61 | 1.61 | ×1.00 |

Register lift under selector (b): ≤0 in 3 songs, 0–2 in 14, 3–4 in 10, 5–7 in 7,
8+ in 2 (a first print of this line had mislabeled bins; 19 songs lift ≥ 3). **The chorus is a register and a texture, not a speed and not a
harmonic rate.** The voice sings the same number of syllables; the accompaniment
doubles its count, doubles its strike, and takes the tune on top.

**Intro / interludes / outro** (bars): intro before the voice median 6 (0–18;
11 s, 0–30 s); 2 instrumental interludes of ≥ 2 bars a song (0–4), 7 bars long
(2–9); outro 8.5 (1–28). Eleven of 36 have no intro at all (the voice at bar 0).
The pop pack's "tunes start at bar 0" holds for a third of these; the rest give
the hook to an instrument first (Rolling Girl 24 bars, Senbonzakura 20).

## LANE 5 — harmony (population: all)

| metric | median | p10–p90 |
|---|---|---|
| chords per bar | 1.53 | 1.25–1.83 |
| colour share (7ths / 9ths / sus / 6) | 35% | 17–49% |
| diatonic share | 85% | 59–100% |

Quality shares (pooled labelled SEGMENTS; by half-bar time: sus 13%, minor 29%, triad 26%, m7 13%): plain major 26%, minor 25%, **sus 16%**,
m7 12%, ^7 10%, 6 6%, 7 3%, dim 1%. The sus share is the Vocaloid signature —
Vsus and bVIIsus as the loop's turnaround (Iya Iya Yo `Vsus bVI^7 Vsus i`, Monster
`Vsus i bVI^7 v i`, Ghost Rule `IV^7 Vsus Isus …`). Borrowed devices carried in
≥ 2 half-bars: bII (15 songs), the leading-tone vii° (13), the parallel major I
in a minor key (12), a chromatic III (10), II (9), the harmonic-minor V (8),
bVII in major (8), bVI (6).

Keys: 67% minor (E minor 5, F minor 4, C# minor 3, B minor 3 …); tempo median
162 (77–210): <100 → 2, 100–139 → 9, 140–169 → 9, 170+ → 16.

**Loops** (top loop per song by coverage, repaired extractor; 35 songs — Tondemo
Wonders yields none): 4 bars in 18 songs, 8 bars in 13, 6 in 2, 1 and 2 in one each; 21 of 35 start OFF the tonic (iv-, bVI-, V-,
bVII-starts); cadence class: ends on the tonic 12, authentic V–I 3, the rest
open. The skeletons that recur:

- minor axis / andalusian family: `i bIII bVI^7 V` (Mind Brand ×3), `i iv bVI V`
  (New Darling), `i7 iv bVI bVIIsus` (Darling Dance ×7), `bVII i v bVI` (Six
  Trillion Years), `i bVI bIIIsus` (Senbonzakura), `iv v bVI bVIIsus` (Lost
  One's Weeping), `i v bVI^7 i` (Vampire), `i iv v7` (Telecaster B-Boy);
- the royal road and its relatives in major: `IV V I^7 IV vi I6 vi7` (Melt),
  `IV^7 Vsus Isus iv vi IV Vsus …` (Ghost Rule), `vi I IV^7 Vsus I6 vi I IV …`
  (Hated by Life Itself), `Vsus IV^7 iii vi7` (Yoru ni Kakeru), `vi IV` (Rolling
  Girl, 8 reps of a two-chord vamp), `vi I IV IIsus V` (Two Breaths Walking);
- two-chord vamps: `i bVIIsus` (Gimme×Gimme), `i Vsus` (Hibikase), `bVI^7 bVII6`
  (Toosenbo), `vi IV` (Rolling Girl), `I6 IV` (Melt's B).

The full per-song table is in the report (`--songs`).

## The engine, side by side (like-for-like)

| | corpus (36) | engine sung lines (17) / mixes (16) |
|---|---|---|
| syllables / s | 3.9 | 1.4 |
| notes per sung bar | 5.5 | 2.8 |
| IOI median (beats) | 0.5 | 1.0 |
| 8th / quarter / 16th IOI share | 55% / 21% / 5% | 3% / 44% / 0% |
| long notes ≥ 2 beats | 1% | 13% |
| step / third / 4th–5th / repeat | 48 / 13 / 9 / 25% | 18 / 36 / 26 / 3% |
| mean \|interval\| | 2.0 | 4.4 |
| phrases · length · breath | 71 · 3.5 beats · 0.5 | 7 · 15.5 beats · 0.75 |
| phrase starts on the downbeat | 9% | 100% |
| 2-bar cell exact repeat | 31% | 0% |
| range lo–hi · median · tessitura | 58–80 · 68 · 11 | 55–78 · 67 · 13 |
| chord tone beat 1 / beat 3 / off-8th | 64 / 67 / 59% | 63 / 83 / 87% |
| NCT share · resolved | 39% · 57% | 29% · 34% |
| out of key | 4% | 15% |
| acc doubles the voice (8ve) verse / chorus | 9% / 92% | 95% everywhere (guide + octave partner) |
| acc strikes with the voice | 77% | 100% |
| chorus register lift | +3 (acc-selected) | none by design |

The engine has the RANGE and roughly the chord-tone rate; it has none of the
motion, the phrasing, the repetition, the chorus, or the key discipline.

## What this round built from it (measured on the built pages)

Each law is either a lab hypothesis (`audition/vocalab.html`, sung), an engine
capability (opt-in, page-only, `ruleFresh(35)`-gated — `audition/songs.html`
and `audition/vocal.html` re-built under the new code move 0 of 47 and 0 of 16
songs by DATA compare), or both.

- **`src/lib/vocal-line.js` — a rule-composed sung line** (laws 1, 3, 4, 5, 6,
  7, 8). Per letter (A = verse, B = chorus at +4 semitones, others = bridge
  +2) it authors a 4-bar spec — a cyclic 2-bar HOOK cell + an ANSWER cell on
  the same rhythm — for `bindMelodySpec` (the D38 guard: accented notes snap
  to chord cores, weak out-of-supply notes must resolve or are snapped), from
  rule tables only: the syllable budget `3.9 × 240/bpm` notes a bar (16th
  pairs when the budget exceeds what 8ths hold), the corpus's phrase-start
  table, phrases of 3–8 syllables with an 8th (sometimes quarter) breath
  written as an EXPLICIT REST (a null degree — `bindMelodySpec`'s r35
  extension, because export-vocal reads hap gaps and legato emission fills
  every onset to the next), a mean-reverting scale walk with the corpus's
  interval table (repeat 20 / step 50 / third 14 / 4th–5th 9 / wider 4, in
  degrees), strong beats and phrase finals on the nearest chord tone, a
  three-repeat cap, and the hook returning at pitch with the answer re-rolled
  from the third statement (r24's restate-then-depart). `opts.vocalWriter`
  (`true` or `{ rate, lift: {chorus, bridge}, targetMidi, span, startBias,
  breathBias, hookVary, roles }`). Every line that RIDES the lead — the
  companion (now the writer's line a diatonic THIRD below, the corpus's verse
  counter-note), the melody double, the octave partner — takes the same spec,
  so they stay rhythm-locked. A cast `melody_takeover` layer is excluded from
  the sung line under the writer (measured: it put a calliope at midi 99 into
  `_lead_mix`).
- **`opts.chorusDouble`** (law 9): the writer's B line an octave above the
  lead on a voice from another family (epiano / vibraphone / flute / square,
  synth pool under `fullSynth`), masked to the B letter's bars, at 0.7 × lead
  (`{ gainMul, sound, octave }`). Measured on vl_double: sounds in bars 4–7 and
  12–15 of 16 (the B bars), mean gain 0.51 vs 0.73 at gainMul 1.0.
- **`opts.vocalHarmony` — a second SUNG voice** (his clarification via the
  poplab export: "by chorus I meant like the harmony for voice — instead of
  voices just singing one note they're singing multiple voices"): the writer's
  line a diatonic third below in the B bars (or the whole song), a guide on
  the page, sung as a second stem by `render-vocal.mjs --line _vocal_harmony
  --tag .harmony` and mixed 4 dB under the lead voice. The corpus's own second
  voice trades (law 11); the stack is his ask, and the lab asks where it
  belongs (`vl_harmony`: none / chorus / all).
- **Measured on the built lines AFTER the engine verify pass** (D139 addendum;
  `_lead_mix`, 41 songs): chorus double +12 on 100% of shared onsets (a first
  build sang it in UNISON — the writer's absolute re-centring made the octave
  parameter a no-op); companion −3/−4 on 87%; suite chorus lift median +6, none
  ≤ 0 (first build: 10 of 36 ≤ 0 — the walk parked at its clamp); no voice
  collisions (first build: 17); phrase starts downbeat 11% / beat 2 14% / beat
  3 14% / beat 4 4% / & of 4 11% / off-8ths 45% (the off-8th share stays double
  the corpus's — a quarter final plus an 8th breath lands on an odd slot);
  syllables/s 3.75 median (the 8-a-bar cap holds slow songs at 2.0–2.8, as the
  corpus's own <100 band does); out of key 1% median / 8% max; chord tones beat
  1 91% / beat 3 94% / off-8th 50%.
- **Measured on the first build** (`_lead_mix`, 38 songs): notes per bar track
  the law — 7.5 at 120 bpm, 5.5 at 168, 5.0 at 180, 4.9 at 190 (3.3–4.0
  syllables/s); phrase starts are pickups / off-8ths (downbeat 0–2 of ~16
  phrases a song); rests present (vl_breath: 6 → 15 → 9 phrases as the breath
  goes none → 8th → quarter); steps 42–67%, repeats 9–35%, leaps ≥5 semis
  4–20% (higher than the corpus's 2–9% — phrase entries and the guard's snaps);
  range 57–79, medians 63–73. The r34 lead sung as-is on the same prompt:
  2.76 notes/bar, 1.9 syl/s, step 14%, leap 37% (vl_writer_lead).
- **What a first build measured and I changed:** (a) the cell filled to 4
  notes a bar whatever the target because a pickup start ate the cell — the
  rhythm is now CYCLIC over the 2-bar cell; (b) rate 5.2 and tempo 120 could
  not exceed ~5.5 notes a bar on an 8th grid — the 16th-pair share now rises
  with the budget; (c) a `span` card (walk home width 2/3/5) moved NOTHING
  (all three 60–77): the tessitura is set by the walk's dynamics and the
  letter lifts, not by the clamp — dropped, replaced by the hook card; (d) a
  hook card whose variants differed only from the THIRD statement was
  identical on a 16-bar ABAB form — `hookVary: 'answer1' | 'all'` re-roll from
  the second.
- **`src/lib/describe.js`** — a deterministic FREE-TEXT prompt parser
  (`describePrompt(text) → { emotion, environment, energy, bpm, family, genre,
  hints, notes }`; synonym tables + each vibe's own mood words; an emotion /
  environment / genre KEY WORD scores 4; energy is a weighted tally so
  "whispered verses … belted chorus" reads mid). No retrieval pool, no
  randomness. Tested on 19 cases.
- **The suite** (`VOCALOID=1 node scripts/audition-songs.mjs` →
  `audition/vocaloid.html`, page id `r35-vocaloid`): 14 `vo_*` songs, each from
  a one-sentence DESCRIPTION shown on the card with its parse, at a stated
  tempo in the corpus's bands (76–195), the family from the description (9 of
  14 minor), writer + chorus double + companion + `noteBlind` + the r35 vocal
  balance law, all sung (`render-vocal.mjs <name> --page audition/vocaloid.html`).
- **The lab** (`VOCALAB=1` → `audition/vocalab.html`, `r35-vocalab`): 10 cards
  × 2–3 variants = 27 `vl_*` songs, each card's variants built under ONE name
  (D120) and renamed, all sung: writer vs the r34 lead · syllable rate 2.4 /
  3.9 / 5.2 · phrase starts downbeat / pickup / mixed · breath none / 8th /
  quarter · chorus lift 0 / +4 / +8 · chorus double off / 0.7 / 1.0 ·
  companion none / third · the same prompt at 120 vs 180 (the syllable law) ·
  the hook corpus / answer-varies / everything-fresh · the harmony voice none /
  chorus / all. A test pins that every card's variants share a key and realize
  distinct mixes (no fake A/B). Honest caveat: rate / starts / breath also move
  the drum level by ≤7% (the r33 kit cap reads the lead's realized mean), the
  writer card's control plans 28 bars vs 16, and the tempo card moves bass /
  counterline / drums with the bpm.

## Open questions for his ear (the lab's, in one place)

1. Is 3.9 syllables/s the sweet spot for an energetic song, or does he want
   fewer (his r34 songs sang 1.4 and he called the melody "good")?
2. Do off-downbeat phrase starts read as "sung", or as "off"?
3. Which breath — none / 8th / quarter?
4. Chorus lift +4 (the corpus) or +8 (drama) — and does the octave double
   make the chorus, or crowd the voice?
5. Does the third-below companion support or muddy?
6. Hook fixed + answer varied (the corpus) vs every return new?
7. A second sung voice a third below — in the chorus, everywhere, or not at all?

## Caveats

- The corpus is piano-roll REDUCTIONS: no dynamics (velocity 127 throughout),
  no articulation, no lyrics; every "phrase" is inferred from rests the
  transcriber wrote. The syllable rate is onsets per second — melisma is
  invisible.
- Chord labels are the half-bar labeller over NOTE+BASS; 36 songs is a small
  population for the borrowed-chord table; the loops table trusts the
  repaired extractor.
- The verse/chorus split is a WINDOW classifier, not the songs' form; both
  selectors agree on the direction of every contrast and disagree on the size
  of the lift (+5.2 vs +3.1), so the doc reports both.
- The labels (lane / emotion) are inferred from titles by someone who knows
  these songs, not measured and not his.
- Populations: every table above is the 36 analyzed files unless it says
  otherwise; the engine side is 17 sung scores (baseline) and 16 mixes (the
  harmony probe) from `audition/vocal.html` + one songs.html render.
