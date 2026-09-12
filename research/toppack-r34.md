# r34 — the "Top MIDI Tracks Pack (Free)" read-out (421 piano arrangements)

Ethan unpacked `~/Downloads/Top MIDI Tracks Pack (Free)` on 2026-09-12 (00:23)
and asked: *"analyze the new folder, just like you analyzed all the previous
sample midi suites. extract all sorts of patterns, chord progressions, rhythms,
layers, and anything else we extracted in the past. since the names are
labeled, you can sort of figure out the vibes of the song. in-depth."* — and
then *"just like variations.html, create another extensive variation lab
testing hypothesis combos, variations, etc."*

**D95 holds in full.** Nothing here is counted into `src/lib`. The pack is
staged at `audios/toppack-r34/` (gitignored — third-party transcriptions of
copyrighted songs), read by `scripts/analyze-toppack-r34.mjs` into
`audios/toppack-r34/_analysis.json`, aggregated by
`scripts/report-toppack-r34.mjs`, and what came out is this document plus the
hand-authored lab cards in `src/lib/pop-labs.js` → `audition/poplab.html`
(`node scripts/audition-poplab.mjs`; export page id `poplab-r34`; importer
`scripts/import-poplab.mjs` → `src/lib/pop-lab-labels.js`).

## What the pack is

Not game MIDI. 420 readable files ("Yellow" arrived as a RIFF-wrapped RMID
and was unwrapped; "Rocket Man 41k" is not MIDI at all), of which **351 are two-track
piano arrangements with the hands on separate tracks** ("hands are divided" is
literally in 40 of the filenames), 46 single-track piano, 33 multi-track
(band/orchestral arrangements: Every Breath You Take, Forget You, Stairway,
Piano Man, Beethoven 7, Pink Panther…). 17 files carry a drum track. Sources
named in the filenames: Pianoitall, Rousseau covers, "Atlantic Lights
Arrangement + Tempo + Colors + Key" full MIDIs, MIDICollection.net, fonzi_m,
Animenz, Adrian Lee. Thirteen files declare a bogus meter (1/4, 1/8, 3/16 — a
sequencer export quirk); they are read as 4/4 and marked `4/4*`.

The pack is labeled by TITLE, not by his ear. So every song carries a
hand-authored label in `scripts/toppack-labels-r34.mjs` — LANE (the genre the
arrangement came from), EMOTION (the engine's prompt vocabulary where it fits),
ENERGY 1–5 — inferred from the song, not from a verdict. Duplicates (four
Fadeds, three All of Mes, two Still Dres…) collapse to one canonical song, the
fullest non-"easy" version representing it; **n = 312 distinct songs** (311 in the lane agents' reads, which ran before Yellow was unwrapped).

| lane | songs | files | bpm (median) | major | 4/4 | bars (median) | hands on separate tracks |
|---|---|---|---|---|---|---|---|
| ballad | 78 | 114 | 89 | 71% | 82% | 82 | 92% |
| pop | 64 | 70 | 120 | 72% | 95% | 96 | 89% |
| game (Zelda OoT + a few) | 41 | 44 | 101 | 59% | 76% | 23 | 100% |
| rock | 40 | 60 | 120 | 50% | 90% | 99 | 95% |
| film | 28 | 44 | 110 | 21% | 75% | 76 | 79% |
| classical | 21 | 36 | 117 | 67% | 62% | 119 | 81% |
| edm | 16 | 22 | 120 | 63% | 100% | 82 | 94% |
| hiphop | 11 | 16 | 92 | 18% | 100% | 36 | 100% |
| anime / jazz / folk / holiday / latin | 12 | 13 | — | — | — | — | — |

Lane × emotion cells with ≥ 5 songs: ballad/sad 29, ballad/romantic 13,
pop/excited 12, pop/happy 11, rock/dark 8, pop/nostalgic 7, game/calm 7,
pop/playful 6, ballad/calm 6, game/mysterious 6, rock/epic 5,
ballad/nostalgic 5, pop/dramatic 5, edm/excited 5, classical/playful 5,
film/epic 5. Film is the minor-key lane (21% major); hiphop is 18% major;
pop and ballad are ~72% major.

Keys (KS-solved on the pitched notes): C major 32, A major 24, D major 22,
D minor 22, G minor 20, Bb major 18, A minor 18, F/G major 17, Ab major 14,
E minor 14, Eb major 13, C# minor 10 — 186 major / 125 minor. Meter: 4/4 253,
3/4 15 (nine of them Zelda), 6/8 14, 12/8 6, 2/4 9 (D92: the engine is
4/4-only; the 6/8 ballads — A Thousand Years, Can't Help Falling, Golden Hour,
Traitor, Solas — are described, not carded).

## Method (what each number means)

Everything is measured per file inside `analyze-toppack-r34.mjs`, whose
definitions mirror the engine's own probes so a pack number lands as a target:

- **Hands** — the ingest split (`splitHands`: highest-mean-pitch track =
  right hand when tracks are separate, two-means pitch split otherwise).
- **Harmony** — the ingest half-bar `chordTimeline` (duration-weighted,
  hysteresis, bass-root prior); loops from `chordLoops` under
  `LOOP_PROFILES.repaired` (D96), a loop that is a k-fold repeat of a shorter
  cycle collapsed, a loop that starts mid-chord rotated to start on the next
  chord. Loops are written in the LABS DIALECT (`0 7 9:m 5` + `chordBeats`) so
  a card can paste them verbatim; the ingest's `2` (sus2), `5` (power) and
  `aug` are folded to `sus` / `''` / `''` and noted.
- **Left hand** — per bar a BEHAVIOURAL class (never a name): `pedal`,
  `block` (≥ 2.5 notes per attack, ≤ 4 attacks), `comp` (chords, ≥ 5
  attacks), `stride`, `octaves`, `fifths`, `alberti` (single notes returning
  to one pivot every other note), `arp_up/down/updown/mixed`,
  `broken_octave`, `walk`; the 16-slot onset histogram; and the most common
  bar as chord-relative figure tokens (`R 5 3+ 5 …` + grid onsets + accents),
  exactly the `figurations-*.js` format.
- **Right hand** — the TOP VOICE (highest note per onset cluster) measured
  with the r33 melody-grammar definitions: stepwise / leap > P5 / repeat
  shares, non-chord-tone rate against the HALF-BAR chord (D123: consonance
  with a stale chord is dissonance) with step-resolution and step-approach,
  the strong-beat chord-tone GRADIENT, odd-16th onset share, short notes in
  the bar's final 16th (the D118 shape), pentatonic share, phrase
  segmentation (gap ≥ a beat or a note ≥ 2 beats ends a phrase) with contour,
  bar-rhythm repetition, the most repeated 2-bar cell ("hook"), and the
  chordal THICKNESS under the top voice (dyad / triad+ share — D98).
- **Form** — sections from the texture state (LH class, RH density, RH
  register, velocity; a change persisting ≥ 4 bars), intro = bars before the
  top voice runs ≥ 2 onsets/bar for 2 bars, lift = max section RH register −
  first section's, velocity arc, sustain-pedal (CC64) and tempo-map use.
- **Layers** (multi-track only) — the r22 read: behavioural roles
  (`classifyParts`), concurrency, entry bars, pair relations (co-onset rate,
  motion classes, echo lag), drum grooves as the dominant one-bar
  role@slot signature.

**Populations (the verify pass found 17 cross-lane number drifts, none
flipping a conclusion, all from this):** the header and `report-toppack-r34.mjs`
use ONE representative file per song (312; 311 before Yellow was unwrapped);
lane 2 (left hand) restricts to the 249 songs in 4/4 (its film odd-16th 19%
is 12% and classical 37% is 31.6% under the report's cut; its pop notes per
attack 1.95 is 1.85); lane 4 (form) dedups by the MOST-PARTS file for the
multi-track read (28 songs / 14 drum parts vs 24 / 13 under the report's
rule) and quotes "5% > 16 s" for ballad/pop where the pool is 3.5–3.8%; lane
3 (melody) measured on a 311-song cut and conditions its chorus-lift table on
lifts of 5–19 st (so its "pop +8.5 st" is a selection, and the form lane's
"pop lift 2, hook-first 37%" is the population number); lane 1's "19 axis
loops" counts any loop, the header's 17 counts primary loops. Where two
numbers differ below, the header/report figure is the reproducible one.

Every aggregate is a median over SONGS with its n. The lane sections below
each carry raw-note spot checks; a number that was refuted by its own spot
check is reported as refuted, not deleted.

## Headline numbers (cross-lane, from `report-toppack-r34.mjs`)

**Harmony.** Median 0.98–1.22 chords per bar (classical 1.22, film and
hiphop 0.98); the pooled span histogram says 49% of labelled segments last
HALF a bar — the harmony lane below audits how much of that is genuine
sub-bar harmony and how much is the labeller flapping. Colour (7/9/sus/6) is
**9–14% of half-bars in ballad/pop/rock/edm, 4% in hiphop, 33% classical,
60% jazz** — pop piano is PLAIN by the engine's colour-is-the-norm law, and
that is the first thing the labs test. Diatonic share 98–100% in
ballad/pop/rock/edm/hiphop, 77% game and classical, 90% film. Inversions (LH
bass ≠ chord root, bass a chord tone) 6–12% of half-bars in pop lanes, 19%
classical; the most common are I/III (54 songs), I/V (91), V/VII (44), IV/VI
(38), vi/III (43) — the walkdown vocabulary. Root motion pooled: down a 4th
20.5%, down a 3rd 20.2%, up a 4th 14.9%, up a 3rd 13.6%, up a step 12.1%,
down a step 10.4%, semitone 7.4%.

**Loops (once per song, rotation-insensitive).** I V vi IV **17 songs** (9
ballads, 5 pop, 2 film, 1 edm); I IV 11; I vi IV 9; I iii vi IV 6; I V 6;
I V IV 5; I vi IV V 4; minor V i 5, i iv 4, bIII i 4, bVI i bVII 3 (all pop),
i bVI bIII bVII / i iv bVI bVII 2 each. Primary-loop cadence classes: ends on
the tonic 70, plagal IV–I 34, half-cadence turnaround 23, authentic V–I 19,
bVII–I 14, deceptive V–vi 12.

**Left hand.** Ballad: broken-chord 8ths (`arp_mixed` 28 of 78 songs,
alberti 8) at **5.3 attacks a bar, 1.4 notes per attack, lowest note median
midi 41 (F2), spread 15 st, on-beat 53%**. Pop: `comp` 15 / `block` 12 —
chords, 1.85 notes per attack, **33% of attacks on the off-8th** (the
anticipation). EDM: 6.2 attacks a bar, 43% off-8th. Game (Zelda): 3.6 attacks
a bar, notes 0.95 beats long, 13% off-8th — the sparsest, holding hand. Film
and classical run 28–32% odd-16th onsets (triplet/6-8 sources and runs); pop
lanes 1–3%. Pooled over 25,352 bars: arp_mixed 19%, mixed 17%, comp 15%,
alberti 11%, block 9%, pedal 7%, octaves 5%.

**Right hand (top voice), against the r33 reference bands.** Stepwise
**32–43%** (pop 32, ballad 38, game 42, film 43) — the engine's in-mix leads
measured 16.3%. Leaps > P5 6–7% (film 12, classical 14, anime 23). NCT
**31–44%** (hiphop 31, engine ~2%), step-resolved 31–48% (engine 8.3%), strong-beat
chord-tone gradient +2 to +11 points (edm +11, ballad/film +6, pop +3). Odd
16ths: **pop/rock 9%, ballad 20%, edm 19%, game 30%, film/classical 41%**.
Final-slot shorts: per-song median 3–8% of a song's short notes, pooled 6.4%
of pop's 6,193 short notes (uniform = 6.25%; the engine's 32%/71% shape
appears nowhere here either). Pentatonic share 82–91% in ballad/pop/rock/edm/hiphop,
67–69% game/classical. Bars repeating an earlier bar's rhythm: pop 70%, rock
66%, edm 71%, hiphop 81%, game 50%. Phrases 1.7–1.9 bars in the pop lanes (classical 1.5, film 1.6, hiphop 2.4); contours pooled
flat 41% / arch 38% / fall 12% / rise 10%. Under the top voice: dyads on
20–28% of pop/rock/hiphop onsets, triads+ on 6–19%.

**Form.** Intro median **0–1 bars** in every lane (81–100% of songs start the
tune within one loop — edm 81%, pop 88%, classical/hiphop 100%; 3.5–3.8% of
songs pooled exceed the engine's 16-second cap, 5% in ballad/pop, 11% film). RH lift
from the first section to the highest: ballad 8 st, rock/film/edm 10,
classical 16, pop 2, game 0. Velocity values per file: ballad 23, pop 29,
rock 39, film 37, classical 52, edm 46, game **2** (the Zelda set is a
flat-velocity export). Sustain pedal in 24–71% of songs by lane (game 24%); tempo-map
changes (rit.) in 28–71%.

**Layers (24 multi-track songs).** Concurrency mean 2–9 parts (Every Breath
5.0/8, Forget You 5.1/8, Drops of Jupiter 8.0/12, Love Song 8.9/11), entry
bars spread through the form (Stairway 1,4,16,40,41,83,118,138), same-family
pairs 0–27% in the band arrangements (67% in the two classical ones),
echo pairs on 9 of 24. Drum grooves: the pop kit is kick on 1 and the "and
of 2"/3 with snare on 2 and 4 and 8th hats — a SNARE in every pop groove,
against the engine's kick+hat default (the D-entry "known bug").

The lane sections follow; each ends with the rules extracted and the cards
that test them.

---

# LANE 1 — HARMONY / PROGRESSIONS (agent read, spot-checked against raw notes)


Lane `prog`. Source: `audios/toppack-r34/_analysis.json` (419 files → 311 distinct songs, one
representative file per song exactly as `scripts/report-toppack-r34.mjs` picks it: the fullest
non-"easy" version). Every number below says what it counts. Probes are in the scratchpad
(`probe-prog.mjs`, `probe-rekey.mjs`, `sweep-prog.mjs`, `raw-probe.mjs`, `probe-canon.mjs`,
`verify-cards-prog.mjs`); outputs in `out-*.txt`.

**Definitions that matter for everything here** (from `scripts/analyze-toppack-r34.mjs` and
`src/ingest/piano.js`):

- A *chord* is a HALF-BAR label: duration-weighted pitch-class profile of the accompaniment,
  bass-note root prior (+0.3), hysteresis (the incumbent keeps the window unless beaten by 12%),
  diatonic-root prior, and a curated template set (`'' m 7 ^7 m7 o o7 m7b5 sus 2 5 6 m6 aug`).
  Thirdless labels (`5`/`sus`/`2`) are completed to the key's diatonic triad unless the LH
  voices the colour against the root — so `5` never survives (0 songs) and `2` survives only
  when a 9th is struck against the root.
- A *loop* is the repaired extractor's vote (tolerance 0.85, consensus) over ≥2 repetitions of
  2/4/6/8/12/16 bars; the analysis keeps the top 4 loops per song. Unless stated, I use the top
  2 loops of ≤8 bars with ≥2 reps ("primary loops"), and count each SONG once per loop shape.
- Loops are keyed *rotation-free* (`rot(strip(numerals))`: qualities stripped, the
  lexicographically smallest rotation) exactly as the report does, so `I V vi IV`, `vi IV I V`,
  `IV I V vi` and `V vi IV I` pool into one row — and §1.3 then un-pools them.
- *Colour* = share of half-bars whose quality is not `''`, `m` or `5` (so `2`, `6`, `sus`, `7`,
  `^7`, `m7`, `o`, `aug` all count).
- *Inversion* = the LH's lowest note in a half-bar is a chord member other than the root.
  *Pedal* = the same bass pc across ≥3 half-bars while the root changes. *Descending run* = ≥3
  consecutive downward steps of 1–2 semitones in the half-bar bass sequence.
- Key = Krumhansl-Schmuckler over all notes (`key`, `keyMargin`). §4 shows this is the single
  largest source of wrong harmonic labels in the pack.

Two accounting defects in `report.md` that this section corrects: (a) the **borrowed-chord
table counts LABELS, not songs** — its loop does `bor[tag].n++` once per spelling, so a song
with `bIIx22, bII^7x8, bII2x4` counts three times; "bII 55" is 42 distinct songs; (b) the
**chord-span histogram is segment-weighted**, so short segments dominate: "0.5b 49%" is 49% of
segments but 20–38% of the music's bars (§3). Also two duplicate-song misses in the dedup:
`set_fire_to_the_rain`/`rain_piano` are the same Adele file twice, and `moonlight_1`/`moonlight_3`
extract byte-identical loops (the "3rd movement" file is the 1st movement).

---

## 1. Loop vocabulary by lane, emotion and mode

### 1.1 By lane (songs carrying the shape in a primary loop; rotation-free)

| lane | n (with loop) | top shapes (songs) |
|---|---|---|
| ballad | 78 (76) | **I V vi IV 9** · I IV 5 · I vi IV 5 · I iii vi IV 4 · axis ×2 (8-bar) 3 · I IV V vi 2 · I IV vi 2 · minor: i bIII6 bVII i…iv (Adele) 2* · bVII i 2 |
| pop | 64 (63) | **I V vi IV 5** · I IV 4 · **bVI i bVII 3** (minor) · I iii vi IV 2 · I V vi V IV 2 · I vi V IV 2 · IV V 2 · I IV vi V 2 · I IV V 2 · I V IV 2 · I ii 2 |
| game | 41 (28) | I IV 2 (lost_woods, lon_lon); everything else a singleton. **4 of 28 loops are two chords**: I bVII (kokiri), bii i (hyrule_field), i iv (farewell), i v (potion_shop), bIII i (fairy_fountain), IV V (oot_opening) |
| rock | 40 (40) | I vi IV 2 · I vi IV V 2 · then singletons: i bVI bIII iv (adams_song), bVI vii i (believer), IV i v (clocks), I bVII IV (hey_jude), I vi V IV (pompeii) |
| film | 28 (25) | **V i bVI 2** (potc ×2) · I V vi IV 2 (Einaudi ×2, vi-start) · **V i 2** · singletons |
| classical | 21 (21) | I V 3 · V i 2 · bIII i 2 · V ii 2 · I IV ×4 2 · (moonlight dup) |
| edm | 16 (16) | V vi 2 · singletons: axis (i_need_your_love), I vi IV (wake_me_up), bVI iv i (children), IV V vi iii (alone) |
| hiphop | 11 (9) | all singletons; 5 of 9 are minor two/three-chord beds: bVI i (still_dre), i iv (ice_ice_baby), i bII (baby_got_back — see §4), bVI i iv |
| anime | 4 (3) | gurenge IV^7 Vsus vi V (the "royal road" family), unravel bVI bVII i v |

\* one song counted twice by the dedup miss.

Spot checks on raw notes (see §3 and §5 for the bars): `someone_you_loved` C# G# A#m F# 4-4-4-4 ×13
(I V vi IV, plagal close); `wake_me_up` Bm G | D (vi IV I at 2-2-4); `happier` Am F | C (2-2-4);
`right_place_right_time` Dm . | Dm Bb | F . | F C (vi IV I V at 6-2-6-2); `stay_laroi` Gb Ab Bbm
Fm ×n (labelled bII bIII iv i in F minor — it is bVI bVII i v in Bb minor, §4).

Reading: **the loop vocabulary is a pop/ballad vocabulary.** Ballad and pop share the same
five shapes; game, film, hiphop and rock share almost nothing with them and almost nothing
with each other — the game lane's only recurring shape is a two-chord shuttle, film's is the
harmonic-minor `V i (bVI)`, hiphop's a minor two-chord bed.

### 1.2 By emotion (cells with ≥4 songs)

| cell | n | major | loops |
|---|---|---|---|
| ballad/sad | 29 | 72% | axis 4 · I IV 3 · I vi IV 3 · I iii vi IV 3 — the four ballad shapes, all major |
| ballad/romantic | 13 | 92% | axis 2 (both vi-start) |
| pop/happy | 11 | 100% | axis 2 (both I-start), I vi V IV, 8-chord IV V vi loops |
| pop/excited | 12 | 58% | no shared shape; half minor (bIII bVI i v, i iv i v i bII) |
| pop/nostalgic | 7 | 71% | I IV 2 (two-chord) |
| game/calm | 7 | 86% | I-V-IV-vi family, bIII i; colour 39.6% (the only "calm" cell with colour) |
| game/mysterious | 6 | 33% | minor with bVI/bII/v: bVI v iv v (song_of_storms), bII bVI i (spirit temple) |
| rock/dark | 8 | 50% | minor bVI/bIII/iv/V, I bVII (atlas) |
| rock/aggressive | 4 | 0% | all minor; bIII bVI vii i (believer), V bVI, bIII bVI bVII i |
| film/epic | 5 | 40% | bVII i v, bIII iv i bVI, I v bVII IV |
| edm/melancholic | 4 | 100% | V vi, I V ii vi, alone_pt2 — melancholy in edm is MAJOR with vi-heavy loops |

Reading: "sad" in the ballad lane is major (72%) and lives on the same four loops as "happy";
what separates them is not the loop skeleton (§1.3 says it is the rotation, §2 says colour is
flat across both). Minor keys carry excited/dark/aggressive/mysterious — energy and menace,
not sadness. This matches CLAUDE.md's horror note ("its unease is mode … not thirdlessness").

### 1.3 The axis and its rotations — rotation tracks the emotion label

All 17 songs whose primary loop is the I-V-vi-IV skeleton, by the chord the extracted loop
STARTS on (the extractor starts a loop where its earliest repetition begins, after merging a
straddled chord):

| start | n | emotions | cadence class |
|---|---|---|---|
| **I** (I V vi IV) | 8 | sad 3 (someone_you_loved, jar_of_hearts, someone_like_you), happy 2 (made_in_the_usa, good_time), tender, somber, dreamy | plagal IV→I, 8/8 |
| **vi** (vi IV I V) | 8 | calm 3 (Einaudi ×2, try_colbie), romantic 2 (fall_for_you, let_me_love_you), hopeful, dramatic, sad (drivers_license) | deceptive V→vi, 8/8 |
| IV (IV I V vi) | 1 | excited (i_need_your_love, edm) | vi→IV |

Every 4-chord major loop over the set {I, IV, V, vi} by exact order (33 songs): the axis
rotations are 19 (I V vi IV 8, vi IV I V 8, V vi IV I 2, IV I V vi 1); the doo-wop order
I vi IV V is 4 (daybreak, perfect, viva_la_vida, + IV V I vi); I IV V vi 3; I vi V IV 3
(pompeii, safe_and_sound, james_blunt_1973); I IV vi V 2; I V IV vi 2. **58% of the pack's
{I,IV,V,vi} loops are one axis in four rotations**, and the rotation is not noise: I-start is
sad/happy (energy either way, home on I, plagal close), vi-start is calm/romantic (home on vi,
deceptive close). A loop has no start in a block-chord render — the card marks the phrase with
a drum fill (`pl_prog_axis_rotation`).

Caveat: n = 8 vs 8 with hand-authored emotion labels (`toppack-labels-r34.mjs`), and the label
was written from the TITLE. The split is clean but it is a hypothesis for his ear, not a fact.

---

## 2. Colour

### 2.1 By lane and emotion (median of song colour share; half-bar weighted)

| lane | n | median | mean | songs ≤2% | quality mix (pooled half-bars) |
|---|---|---|---|---|---|
| hiphop | 11 | **4.2%** | 11.1% | 5 | m 63.7 · maj 26.2 · ^7 5.0 · m7 2.9 |
| rock | 40 | 9.1% | 12.8% | 9 | maj 54.9 · m 32.8 · m7 3.7 · ^7 3.2 · sus 2.8 |
| ballad | 78 | 9.4% | 11.8% | **19** | maj 56.6 · m 32.7 · ^7 3.2 · m7 2.3 · 6 2.1 · sus 1.7 |
| game | 41 | 10.0% | 18.9% | 11 | maj 52.4 · m 31.3 · m7 4.2 · ^7 3.3 · sus 2.7 · 7 1.9 |
| film | 28 | 12.0% | 16.0% | 7 | maj 45.4 · m 37.1 · m7 3.4 · sus 3.4 · ^7 3.2 · 6 3.1 |
| pop | 64 | 13.2% | 17.0% | 17 | maj 57.3 · m 26.4 · 6 3.9 · ^7 3.2 · m7 3.0 · **2 2.7** · sus 2.5 |
| edm | 16 | 13.5% | 19.6% | 2 | maj 41.5 · m 39.5 · sus 4.7 · ^7 4.4 · m7 4.0 |
| anime | 4 | 23.2% | 27.0% | 0 | ^7 8.7 · m7 8.0 · sus 4.6 |
| classical | 21 | **33.3%** | 30.8% | 1 | **7 10.0** · m7 6.9 · 6 3.8 · ^7 3.6 · o 2.0 |

Confirmed: jazz/anime/classical high, pop/hiphop low — with one correction: **the dominant
seventh is the classical marker.** `7` is 10.0% of classical half-bars against 0.4–0.7% in
ballad/pop/rock. Pop's colour is `6`, `^7`, `m7`, `2`, `sus` — never V7.

By emotion: pop/happy 4.7%, pop/excited 6.5%, ballad/sad 9.4%, ballad/nostalgic 4.0%,
film/epic 4.4%, hiphop/cool 4.2% — vs pop/hopeful 28.5%, pop/nostalgic 18.3%, pop/uplifting
22.1%, game/calm **39.6%**, classical/playful 29.2%. Colour rises with "hopeful/nostalgic/calm"
and falls with "happy/excited/epic/sad". Sad ballads are PLAIN (9.4%, and 19 of 78 ballads
are under 2%).

### 2.2 Where in the loop, and on which chord

517 primary loops, 199 carry colour (38%). Position of the coloured chord in 4-chord loops:
slot 1 10, slot 2 15, slot 3 13, slot 4 12 — **flat; there is no favoured slot.** What is
concentrated is the NUMERAL: ii7 39 · vi7 30 · IV^7 27 · bIII6 27 · bVI^7 23 · Vsus 21 ·
I^7 16 · V7 14 · IV2 13 · Isus 12 · V2 12 · v7 11 · iv7 11. Colour goes on the pre-dominant
and the minor chords (ii7, vi7, IV^7) and V is softened with a `sus`, not sharpened with a 7th.
Per coloured loop: pop 20 of 46 have exactly one coloured chord, median coloured share 1/3 of
the chords (ballad 27/51, 1/4). Colour in this pack is one or two chords, never a texture.

### 2.3 Extractor audit (`2`, `5`, `6`, `aug`) against raw notes

- `2` (sus2): 77 songs, 2.7% of pop half-bars. **Genuine where checked.** `payphone` (B major)
  LH strikes E3 B3 F#4 (IV2) and B2 F#3 C#4 (I2): root–5th–9th, no 3rd, 73 of 156 half-bars;
  `this_kiss` loops IV2 V2 (36 of 100). **The labs dialect has no sus2 and `DIALECT_FOLD`
  turns `2` into `sus` (R 4 5) — every pasted `2` loop renders a sus4, a different chord.**
  Card `pl_prog_sus2_voicing` tests whether his ear hears them as the same; the fix is a real
  `sus2`/`add9` quality or explicit voicings.
- `5`: 0 songs (the diatonic completion removes every bare fifth). Correct by design.
- `6`: 105 songs, 1434 half-bars, 2.5% pooled. **35% (502) sit adjacent to the relative minor
  chord** (a m/m7 a minor third below), i.e. the relative-chord ambiguity: `blinding_lights`
  LH holds D#3 G3 C4 (Eb6 with no 5th = Cm/Eb) between Fm bars; `stay_rihanna` "bIII6" is
  Am/E with the inner voice A→G (E3 A3 C4 → E3 G3 C4) — the i chord, not a bIII; `faded` "I6"
  is D#m with F# put in the bass; `summertime_sadness` "bVI6" is A C# F# under a held C#3 bass
  (A6/C#, genuinely a 6th voicing). Rule: **a `6` next to its relative minor is that minor
  chord (its 7th or an inversion) and does not change the loop skeleton; a `6` with the major
  root in the bass and the 6th voiced (`summertime_sadness`, `blinding_lights`) is real colour.**
  The labeller's bass prior is doing the right thing for the sound and the wrong thing for the
  progression.
- `aug`: 17 songs. `golden_hour` Gaug (G B D#) is a passing chord between G#m and F#m on a
  chromatic bass — genuine. `oot_lon_lon` 16/114 unverified.

Engine comparison: CLAUDE.md's law is "colour is the norm — diatonic colour (m7/^7/9/sus/6)
everywhere; plain triad runs read generic". The pack's pop/ballad/rock lanes run 9–13%
colour with a third of songs under 2%, and their colour is one chord per loop. Either his law
is a taste that exceeds the genre (possible — "31,652 files can say what game music DOES,
never what Ethan LIKES") or it was calibrated on citypop/jazz reels. `pl_prog_colour_dose`
puts the doses side by side.

---

## 3. Harmonic rhythm — how much of "49% half-bar" is real

### 3.1 Segment-weighted vs bar-weighted, by lane

| lane | segments | 0.5b seg% / **bar%** | 1b | 1.5b | 2b | ≥4b |
|---|---|---|---|---|---|---|
| ballad | 7696 | 50% / **27%** | 35 / 39 | 7 / 11 | 7 / 15 | 1 / 3 |
| pop | 6265 | 46% / **24%** | 41 / 43 | 3 / 6 | 7 / 15 | 2 / 8 |
| rock | 4147 | 41% / **20%** | 41 / 41 | 7 / 10 | 8 / 16 | 1 / 7 |
| film | 2268 | 42% / **21%** | 38 / 38 | 9 / 13 | 8 / 16 | 1 / 6 |
| game | 1398 | 55% / **31%** | 34 / 39 | 5 / 9 | 3 / 8 | 1 / 10 |
| edm | 1846 | 49% / **29%** | 43 / 51 | 4 / 7 | 3 / 7 | 0 / 3 |
| classical | 3691 | 63% / **38%** | 26 / 31 | 4 / 7 | 4 / 9 | 1 / 8 |
| hiphop | 517 | 67% / **33%** | 18 / 18 | 10 / 14 | 4 / 7 | 1 / 23 |

So a quarter of pop/ballad/rock/film BARS sit under a half-bar chord — and part of that is the
labeller. Two proxies: (a) of 730 two-beat chords inside primary loops, 53% share ≥2 pitch
classes with a neighbour (an UPPER bound on flaps — vi→IV also shares two); classical is the
lowest at 26% (real cadential 6/4s and ii–V), edm the highest at 70%; (b) the raw reads:

| song | extracted | raw notes | verdict |
|---|---|---|---|
| wake_me_up | vi IV I 2-2-4 | Bm(2) G(2) \| D(4), C# under D on beat 4 ("D^7") | **genuine 2-2-4**; the C# is a walking bass, not a chord |
| happier | vi IV I 2-2-4 | Am(2) F(2) \| C(4); 2nd pass Am7 (LH A E G E) | **genuine**; colour arrives on the repeat |
| right_place_right_time | vi IV I V 6-2-6-2 | Dm . \| Dm Bb \| F . \| F C | **genuine 6-2**: the pre-cadential chord gets 2 beats |
| jar_of_hearts | I Vsus vi IV 2-6-4-4 | Eb octaves, Bb dropped under on the and-of-2, then G#/D# on the 2nd half of bar 56 | **flap**: 5th-in-bass under a static chord; the song is 4-4-4-4 |
| faded | vi I6 IV I V 2-2-4-4-4 | D#m then D#m/F# (LH F#3 A#3 D#4); B then B/D# | **flap**: first-inversion read as I6; 4-4-4-4 |
| viva_la_vida | IV V I vi7 4-4-2-6 | Db Eb Ab Fm, one chord a bar, RH Ab/C over F | **flap**: Fm7 ≈ Ab6 relative pair; 4-4-4-4 |
| someone_you_loved (bar 60) | IV I V vi 2-6-4-4 | bar 60.0 has a lone C4 over a held D#3, coverage 0.48 | **flap**: section seam |

Rule for reading an extracted loop: **2-2-4 is a real pop shape (two chords in the first bar
of a two-bar group, one in the second); 6-2 is a real anticipation only where the ROOT moves
(right_place); any 2-6 or x-2-6 whose short chord is a relative/inversion of its neighbour is
the LH figure, not harmony.** `pl_prog_harmonic_rhythm` puts 2-2-4, 4-4-8, 6-2, 2-2-2-2 and the
suspect 2-6 at one tempo.

### 3.2 Genuine harmonic-rhythm shapes per lane (primary loops; checked ones marked ✓)

| lane | shapes (songs) |
|---|---|
| ballad | even 4s 18 · 2-2-4 family: happier ✓, enough_for_you (vi IV I ×2 at 2-2-4), hello (vi7 I IV 2-2-4), the_a_team (2-2-2-4) · long-short 8-8-8-2-6 (jealous) · Adele's 2-2-4-2-2-2-2-8-8 |
| pop | even 4s 13 · 4-4-2-2 / 4-2-2 (never_gonna_give_you_up ii bVII I 4-2-2, call_me_maybe, catch_my_breath IV V vi 4-2-2) · 2-2-4 (maps bVI bVII i, good_riddance IV V I) · 6-2-6-2 (right_place ✓) · 2-2-2-2 (lego_house, good_time) |
| edm | 2-2-4 (wake_me_up ✓, children bVI iv i) · anticipations 4-6-2-4 (i_need_your_love), 2-4-4-6 (break_free) · 2-2-2-2 (alone_pt2) |
| rock | whole-bar mixed 9 (6-4-6 every_breath, 16-8-4-4 nothing_else_matters) · 2-2-4 (hymn 4-2-2, lithium 2-2-4-8, wonderwall IV V I 2-2-4) |
| game | 2-2 everywhere: smb 8-4-4-2-2-4-4-2-2, ganondorf 2-2×8, kaepora 8-2-4-2-2-2; 2-6 (spirit temple 4-6-4-6, inside_house 6-2-6-2-6-2-8) |
| film | 4-2-2-4 (my_heart_will_go_on, requiem 4-2-2 ×4) · 2-4-10 (potc_drink_up), 2-14 (httyd) — film holds |
| classical | 2-2 cadential everywhere (canon_in_d 2-2×8, mozart 2-2-2-6, nocturne 2-6-2-2…) |
| hiphop | 2-2 beds (gangstas_paradise 2-2-2-2, baby_got_back 2-2) |

Engine comparison: D122 made chords resolve per onset (`chordBeats`), fixed for reels where
"6 of 8" change sub-bar. The pack says the POP default is whole bars (pop 43% of bars at 1b,
15% at 2b, 8% at ≥4b) with the 2-2-4 pickup as the one sub-bar idiom; sub-bar harmony as a
texture is classical/game.

---

## 4. Borrowed chords and cadences

### 4.1 The bII audit — mostly a key-detector artefact

42 distinct songs carry ≥2 half-bar bII segments (the report's 55 counted spellings). Loop-level
re-key (`probe-rekey.mjs`: all loops, beat-weighted diatonic share under every tonic × mode
against the detected key), plus raw reads:

| verdict | n | songs |
|---|---|---|
| **key artefact, fully diatonic under another tonic** | 8 | stay_laroi (F:m → C#/Bbm: Gb Ab Bbm Fm = bVI bVII i v), let_me_down_slowly (G#:m → C#:m: C#m B G#m A = i bVII v bVI), titanium (G:m → Eb/Cm), interstellar (E:m → A:m: Am C Bm F = i bIII ii bVI), africa_toto (C#:m → F#:m), save_your_tears, baby_got_back*, oot_spirit_temple* |
| probably artefact (alt key more diatonic) | 7 | la_calin (A:m → D:m: Dm C Bb A = **i bVII bVI V, the Andalusian**), paparazzi, 5_beautiful_songs, oot_hyrule_field, oot_inside_house, oot_nocturne_shadow, chopin_nocturne |
| genuine bII inside a repeated loop | 10 | potc_black_pearl (i bII i bII), the_final_countdown, my_heart_will_go_on, oot_windmill_hut, how_you_like_that, ut_fallen_down (bii), les_adieux, liebestraum_3, brahms_op1, ses_death |
| segments only (never in a loop) / no loops | 17 | moonlight ×2, tempest_3, clementi, hedwigs_theme, jealous, bohemian_rhapsody, … |

\* both are a semitone bass riff whose tonic the loop cannot settle: baby_got_back's LH is
C C C Eb | Db Db Eb Db (bII in C minor, or v–bVI in F minor where it is 100% diatonic);
spirit_temple is a G#/Gm shuttle with G as 60% of the bass (Phrygian bII in G minor, or bVI–v
in C minor). The SOUND is a semitone shuttle either way.

Corpus-wide (`sweep-prog.mjs`, 312 songs): **34 songs (11%) have a tonic/mode under which ≥2
points more of their half-bars are diatonic than under the detected key** — shift +5 (a fourth
up: the detector parked on the v/iv chord) 10 songs, relative-mode swap (+2/+3 with mode) 14,
+7 2. The failure shape is consistent: an aeolian loop that dwells on or ends on its v chord
(Fm in Gb Ab Bbm Fm) gets that chord as tonic, and then bVI reads as bII and i as iv.

**Rule for believing a `bII` label**: it must (a) sit inside a repeated loop, (b) survive the
re-key test (no tonic shift makes the loop fully diatonic), and (c) show a semitone bass move
into or out of the tonic in the raw notes. Corrected count: ~10–12 songs of 311, and the lanes
are **game 3 (windmill_hut, fallen_down, spirit_temple), film 2 (black_pearl, my_heart),
classical 3, pop 2, rock 1, ballad 1** — the Neapolitan/Phrygian bII is a game/film/classical
device, not a pop one. This also downgrades "other chromatic 199": with per-song counting and
a ≥4-segment threshold it is 95, and the bulk is classical/ballad passing labels.

### 4.2 Devices that define a vibe (counted only INSIDE repeated loops, songs once)

| device | n | lanes | reading |
|---|---|---|---|
| major V in a minor loop | 23 | ballad 7, **film 6**, rock 3, hiphop 2, classical 2, game 2, pop 1 | the film/classical minor (potc, a_whole_new_world, skyfall); pop minor avoids it |
| bVII in a major loop | 22 | ballad 7, **game 5**, pop 4, rock 3, classical 2, film 1 | the shared borrow; game (smb, kokiri, goron, hyrule_field) and rock (hey_jude, atlas, paradise) per his canon, but ballads too (jealous, heaven, sign_of_the_times, mad_world) |
| ii in a minor loop (dorian ii) | 16 | ballad 5, film 3, classical 3, game 3 | Skyfall, moonlight, relocating_the_lights |
| vii (minor triad on 7) in major | 13 | ballad 6, pop 3 | a_thousand_years I vii vi V, alone_pt2, 50_ways — a passing chord the labeller spells as a triad |
| II (V of V) in major | 9 | pop 3, classical 2, rock 2 | wonderwall vi I V II7, what_ive_done, rocket_man |
| i (parallel minor) in major | 8 | ballad 3, game 2 | hello, jealous |
| IV (dorian) in minor | 6 | **film 3, rock 3** | clocks IV i v, hotel_california, good_bad_ugly, a_whole_new_world |
| bIII in major | 6 | classical 3 | |
| **iv (minor plagal) in major** | **3** | game 1, rock 1, classical 1 | **ZERO of 55 major ballads and ZERO of 46 major pop songs** carry iv in a loop (≥4 segments: 9 songs, 6 classical). The "sad" minor iv is not a pop-ballad move in this pack |
| I (Picardy) in minor | 5 (≥4 segs: 8) | film 2/…, classical 4 | film + classical only |

Minor songs, by lane (loop content): pop bVI **16/18**, iv 10/18, bVII 8/18, **V 1/18**;
edm bVI 6/6, V 0/6; rock bVI 17/20, bIII 17/20; film V **9/20**, bVI 12/20; classical
major-V-by-segments 7/7; game iv 7/12, V 5/12, v 5/12.

### 4.3 Cadence class of the primary loop, by lane

| lane | classes (songs) |
|---|---|
| ballad | ends on tonic 22 · **plagal IV→I 14** · authentic V→I 6 · deceptive V→vi 5 · half V→x 4 |
| pop | ends on tonic 15 · **half V→x 8** · plagal 6 · bVI→I 4 · IV→V open 4 · bVII→I 3 |
| rock | **plagal 7** · half 6 · ends on tonic 4 · **bVII→I 4** |
| game | ends on tonic 5 · authentic 4 · **bVII→I 3** · plagal 2 |
| film | ends on tonic 5 · **deceptive 3** · plagal 3 · bVI→I 2 |
| classical | **authentic 6** · ends on tonic 6 · half 3 |
| edm | ends on tonic 5 · deceptive 2 |
| hiphop | ends on tonic 3 · IV→V 2 · bII→I 2 (both artefact/riff, §4.1) |

The pop/ballad world closes plagally or leaves V hanging; V→I leads only in classical; bVII→I
is rock/game; V→vi (deceptive) is film — and it is exactly the vi-start axis rotation (§1.3).
`pl_prog_cadence_close` closes one loop five ways; `pl_prog_borrowed_ladder` adds bVII, iv,
bVI+bVII one at a time.

---

## 5. Bass line: inversions, slashes, walkdowns, pedals

### 5.1 By lane

| lane | inv median / mean | songs ≥25% | pedal >0 | desc runs ≥1 | top slashes (songs) |
|---|---|---|---|---|---|
| classical | **18.9% / 17.5%** | 5/21 | 19 | **13** | I/V 11 · i/V 10 · I/III 10 · bIII/V 8 · V7/IV 8 |
| ballad | 12.2 / 15.9 | 16/78 | 38 | 12 | **I/V 39 · IV/I 27 · vi/III 22 · V/II 21 · I/III 18** · iii/VII 16 |
| edm | 11.8 / 14.2 | 3/16 | 11 | 3 | V/II 7 · I/V 6 · IV/VI 6 |
| film | 10.5 / 11.0 | 2/28 | 15 | 6 | i/V 10 · bVI/I 7 · IV/I 6 |
| game | 9.5 / 15.1 | 11/41 | 15 | 4 | I/V 7 · V/VII 5 · IV/VI 5 · I/III 5 |
| rock | 8.5 / 10.6 | 5/40 | 25 | 4 | I/V 12 · V/II 12 · i/V 11 · bIII/bVII 8 |
| pop | 6.4 / 9.9 | 7/64 | 26 | 5 | IV/I 14 · V/II 13 · I/V 11 · I/III 9 |
| hiphop | 3.4 / 6.8 | 1/11 | 4 | 1 | i/V 3 |

Corpus top slashes (songs): I/V 91 · IV/I 68 · V/II 66 · i/V 60 · I/III 54 · V/VII 44 ·
vi/III 43 · IV/VI 38 · bVI/I 37 · iv/I 36 · bIII/bVII 35 · **I^7/VII 34** (= I/VII: C/B read
as Cmaj7 over B).

**Two different things produce these numbers**, and the raw notes separate them:

1. **The walkdown** (bass steps down under a fixed RH): `piano_man` bars 6–8: bass C2 B1 A1 G1
   F1 (E1 D2 G1) under C · G/B · Am · C/G · F · C/E · Dm · G — 35 descending runs, the whole
   song is the device. `wake_me_up`: D with C#2 under it on beat 4 to walk into Bm (labelled
   D^7). `how_to_save_a_life`: Bb/F → F/A alternating bass (I → V/VII). `golden_hour` (6/8):
   A G#m G+ F#m E, bass A G# G F# E — a CHROMATIC walkdown in major, the aug is the passing
   chord. `skyfall`, `stairway`, `all_i_want` (bVI bVII i), `my_life_is_going_on` 10 runs.
2. **The rocking-fifth figure** (a static chord whose LH dips to the 5th on beat 3):
   `someone_you_loved` bars 24–27: C#2 C#3 · G#3 · F4 · G#3 | F4 G#3 G#3 — root octave on beat 1,
   the 5th as the lowest note in the second half → I/V, V/II, vi/III, IV/I on every chord
   (39% "inversions"). `the_a_team` bars 17–19: E over G#3 (V/VII), A over E3 (I/V) — first-
   and second-inversion block chords as the voicing, root in the RH. `enough_for_you` 75%,
   `stay_rihanna` 60% (Am/E throughout). **Four of the six top slashes (I/V, IV/I, vi/III,
   V/II) come from this figure, not from a bass line.**

Transcribed devices (degrees + bass pc, for the canon):

| device | source | degrees | bass (scale degree) |
|---|---|---|---|
| diatonic walkdown | piano_man, wake_me_up (bar 2), how_to_save_a_life | `0 7 9:m 0 5 0 2:m 7` at 2 beats each | 1 7 6 5 4 3 2 5 |
| chromatic walkdown (major) | golden_hour | `5 4:m 3:aug 2:m 0` (`aug` is not in the labs dialect — card voices it) | 4 3 ♭3 2 1 |
| rocking fifth | someone_you_loved, the_a_team, jar_of_hearts | any loop | root on 1, 5th under on 3 (reads as I/V etc.) |
| walk into vi | wake_me_up | `9:m 5 0 0` [2,2,2,2] | 6 4 1 **7** |

### 5.2 Pedal points

Median 0% in every lane; >5% in 20 songs; the top four are pop/film: `daylight` **42%**
(bass-pc D on 91% of half-bars; the LH holds D F# A under IV and I for whole sections),
`we_cant_stop` 41%, `summertime_sadness` 25% (C#3 held under A6), `comptine_dun_autre_ete`
25%, `a_thousand_miles` 22%, `beethoven_7` 19%, `oot_opening` 19%. No pedal in the pack
covers a whole song; the bass moves again at the cadence. `pl_prog_pedal_point` tests the held
tonic, the dominant pedal, the release at V and the inverted (top-voice) pedal.

---

## 6. Minor-key loops

Rotation-free, minor songs, songs once (top of `out-q6.txt`):

| loop | n | lanes | examples |
|---|---|---|---|
| V i | 5 | classical 2, film 2, ballad 1 | fur_elise 2-2, httyd 2-14, tempest_3 i V7 2-10, les_choristes 2-2 |
| i iv | 4 | film, game, classical, hiphop | a_whole_new_world 2-2, ww_farewell 22-2, ice_ice_baby |
| bIII i | 4 | classical 2, ballad, game | flood_time, daydream_tears, oot_fairy_fountain (i6 bIII6 = the relative pair again) |
| **bVI i bVII** | 3 | **pop 3** | bts_i_need_u i bVII bVI 4-4-8, summertime_sadness bVII bVI6 i, dj_got_us_falling |
| i v | 3 | film, game, jazz | potc_black_pearl 14-2, oot_potion_shop 12-4 |
| bVII i (bVII iv i …) Adele | 2+2 | ballad | set_fire_to_the_rain (i bIII6 bVII i … iv), die_for_you, this_unknown |
| bVI i bVI i | 2 | pop, rock | africa_toto (re-keyed: IV I in A), my_songs_know |
| bVI bVII i iv | 2 | pop, rock | shape_of_you, nothing_else_matters i iv bVI bVII |
| bVI bVII i | 2 | pop, ballad | maps 2-2-4, all_i_want 4-4-8 |
| bVI iv i bVII i | 2 | ballad, rock | die_for_you, lithium |
| V i bVI | 2 | **film 2** | potc_drink_up, potc_hes_a_pirate |
| bVII i iv | 2 | rock, edm | hymn_for_the_weekend, strobe |
| i bVI bIII iv | 1 | rock | adams_song (the "i bVI bIII bVII" family with iv) |
| i bVII bVI V (Andalusian) | 1 | hiphop (la_calin, re-keyed) | the only true Andalusian in the pack |

How minor pop differs from minor game/film:

- **Pop/rock/edm minor is aeolian and bVI-led**: bVI in 16/18 pop, 6/6 edm, 17/20 rock loops;
  the shapes are `bVI bVII i`, `i iv bVI bVII`, `i bVII bVI`, `bVI i bVII` — the same three
  chords in every rotation, plus iv. **The major V is absent** (pop 1/18, edm 0/6).
- **Film/classical minor is harmonic-minor**: `V i`, `V i bVI`, `i V7`; V inside 9/20 film
  loops and by segments in 7/7 classical songs; Picardy 3 film + 3 classical, ≤1 elsewhere.
- **Game minor is short and modal**: 4 of 12 minor game loops are two chords (i iv, i v,
  bIII i, bII i); bII survives the re-key on windmill_hut and spirit_temple (Phrygian); bVI 5/12
  only — game minor does not lean on bVI the way pop does.
- **Hiphop minor is a bed**: bVI i, i iv, i bII (semitone riff), 2–3 chords, 8-bar loops.
- The "lament"/Andalusian (i bVII bVI V) and the descending-bass minor (bVI bVII i with a
  walking bass, all_i_want) exist but are rare; the Adele family (i bIII6 bVII … iv with the
  relative-pair `6`) is the ballad-lane minor.

`pl_prog_minor_family` puts pop-aeolian, Andalusian-with-V, bare i iv, the epic bVI bIII bVII
rotation and a pop loop with its bVII swapped for V7 side by side.

---

## 7. What the engine's canon already carries

`probe-canon.mjs`: 605 entries across `progressions.js` (ldrolez) + 8 packs, 201 ratified, 509
distinct rotation-free skeletons. Looked up by the pack's top shapes per lane:

| pack shape (lane) | canon entries | ratified | missing? dialect degrees |
|---|---|---|---|
| I V vi IV (ballad 9, pop 5, film 2, edm 1) | 5 (4 ldrolez rotations + cp_kpop_bright_hook) | 4 | carried |
| I IV (ballad 5, pop 4, game 2) | 4 | 1 | carried |
| **I vi IV** (ballad 5, rock 2, edm 1 — 2-2-4) | **0** | — | `9:m 5 0` chordBeats [2,2,4] |
| I iii vi IV (ballad 4, pop 2) | 2 | 2 | carried |
| I V (classical 3, folk, game) | 3 | 0 | carried, unratified |
| **V i** (classical 2, film 2, ballad) | **0** | — | `7 0:m` [4,4] (fur_elise 2-2) |
| **i iv** (film, game, classical, hiphop) | **0** | — | `0:m 5:m` [8,8] |
| I V IV (film, pop 2, rock) | 1 (maj_IV_IV_I_V) | 1 | near |
| I vi IV V (rock 2, classical, ballad) | 1 | 1 | carried |
| bIII i (classical 2, ballad, game) | 3 | 0 | carried, unratified |
| bVI i bVII / bVI bVII i (pop 3+2, ballad) | 2 + 5 | 2 | carried |
| I vi V IV (rock, pop 2) | 2 (unison) | 0 | carried, unratified |
| IV V (pop 2, game) | 3 | 1 | carried |
| I IV V (pop 2, rock) | 3 | 2 | carried |
| i v (film, game, jazz) | 3 | 0 | carried, unratified |
| **I V vi V IV** (pop 2) | **0** | — | `0 7 9:m 7 5` |
| I IV V vi (ballad 2) | 1 | 0 | carried |
| **I IV vi** (ballad 2) | **0** | — | `0 5 9:m` [2,2,4] (hello vi7 I IV) |
| bVII i (ballad 2) | 2 | 0 | carried, unratified |
| **V i bVI** (film 2, potc) | **0** | — | `7 0:m 8` [4,4,4] |
| **I vi** (ballad, anime) | **0** | — | `0 9:m` [8,8] |
| bVI bVII i iv (pop, rock) | 1 | 1 | carried |
| I bVII (rock, game) | 4 | 0 | carried, unratified |
| **IV iii** (rock, jazz) | **0** | — | `5 4:m` [8,8] |
| **V vi** (edm 2) | **0** | — | `7 9:m` [8,8] |
| IV V vi iii (edm, ballad) | 2 | 0 | carried, unratified |
| **I V ii vi** (edm, rock) | **0** | — | `0 7 2:m 9:m` |
| **I ii** (pop 2) | **0** | — | `0 2:m` [8,8] |
| **I bVII IV** (hey_jude) | **0** | — | `0 10 5` [16,8,8] |
| **bVI iv i bVII i** (die_for_you, lithium) | **0** | — | `8 5:m 0:m 10 0:m` [4,4,2,4,2] |
| **bVI bVII i v** (unravel, stay_laroi re-keyed) | **0** | — | `8 10 0:m 7:m` |
| bVI iv i v | 3 | 2 | carried |
| I IV ii V | 4 | 2 | carried |

Pattern: the canon (ldrolez is a pop-loop compendium) **has every famous 4-chord major loop
and the bVI-bVII-i minor loops**, and **misses the pack's SHORT shapes** — the two- and
three-chord shuttles (I vi IV, I IV vi, V vi, I vi, I ii, IV iii, i iv, V i, V i bVI, I bVII IV)
that carry the game, film, hiphop and edm lanes — plus the pop `I V vi V IV` and `I V ii vi`.
Most of what IS carried for the non-pop lanes is unratified (undertale/vgmusic). Two dialect
gaps surfaced by the pack: no `sus2`/`add9` quality (§2.3) and no `aug` (golden_hour's passing
chord). The 2-2-4 harmonic rhythm of the three-chord loops must travel with them
(`chordBeats`), or `I vi IV` at 4-4-4 is a different loop.

---

## Rules extracted (each with its measurement)

1. **Rotation is meaning.** Of 19 axis loops, I-start (8) is sad/happy/tender with a plagal
   close, vi-start (8) is calm/romantic with a deceptive close; 58% of all {I,IV,V,vi} loops
   are this one axis. → card `pl_prog_axis_rotation`.
2. **Pop is plain and colours one chord.** Median colour 9–13% in ballad/pop/rock, 17–19 of
   64–78 songs under 2%; coloured numerals are ii7/vi7/IV^7/Vsus; V7 is 0.4–0.7% of pop/ballad
   half-bars vs 10% classical. Colour has no favoured slot. → `pl_prog_colour_dose`.
3. **Sub-bar harmony is a quarter of the bars, and 2-2-4 is its pop shape.** 0.5-bar chords:
   49% of segments, 20–38% of bars; raw: 2-2-4 genuine (wake_me_up, happier), 6-2 genuine
   only where the root moves (right_place), 2-6 flaps in jar_of_hearts/faded/viva.
   → `pl_prog_harmonic_rhythm`, `pl_prog_inversion_as_change`.
4. **Believe `bII` only after re-keying.** 42 flagged songs → 15 key artefacts (the detector
   on the v/iii chord), 10 genuine, 17 segment-only; 11% of the corpus has a better key.
   The genuine bII is game/film/classical. (No card — a labeller rule, not an ear question.)
5. **The major V is the minor-lane switch.** V inside the loop: pop 1/18, edm 0/6, film 9/20,
   classical 7/7 by segments; pop minor is bVI-led aeolian (16/18). → `pl_prog_minor_family`.
6. **bVII is the shared major borrow; iv is not pop.** bVII in 22 major loops (ballad 7, game
   5, pop 4, rock 3); iv in 0/55 ballads and 0/46 pop. → `pl_prog_borrowed_ladder`.
7. **The bass line is the device, and the fifth-figure is not a line.** Top slashes I/V 91,
   IV/I 68, V/II 66, I/III 54, V/VII 44, I^7/VII 34; piano_man/wake_me_up/how_to_save walk
   1-7-6-5-4-3, golden_hour walks 4-3-♭3-2; someone_you_loved's 39% is a rocking fifth.
   → `pl_prog_walkdown`.
8. **Pedals are rare, pop, ≤42%, and release at the cadence.** → `pl_prog_pedal_point`.
9. **Cadence class is lane.** Plagal = ballad (14), half = pop (8), V→I = classical (6),
   bVII→I = rock/game (4/3), V→vi = film (3). → `pl_prog_cadence_close`.
10. **Two-chord shuttles are the game lane; I V is never game.** 4 of 28 game loops are two
    chords (I bVII, I IV, i iv, i v, IV V); I V shuttles are classical/folk (3/21, 0 game).
    → `pl_prog_game_shuttles`.
11. **`2` is a real voicing (R-5-9) and the dialect fold to `sus` is wrong.** payphone 73/156,
    this_kiss 36/100 half-bars, 2.7% of pop. → `pl_prog_sus2_voicing`.
12. **A `6` next to its relative minor is that minor chord** (35% of 1434 `6` half-bars);
    the label follows the bass, the skeleton should not. Also: the report's borrowed table
    counts spellings, the span histogram counts segments — both overstate by ~1.3–2×.

## Open questions only an ear can settle (the cards)

- Is the rotation heard as home-on-I vs home-on-vi, or is a looping bed rotation-blind?
- At what dose does colour leave pop — one ^7, three, or only V7?
- Does 2-2-4 read as energy or fuss; does a 2-6 sound like anything a song would do?
- Is the walking bass the song, and does the same line in the top voice carry it?
- Is the major V what makes minor "film", or the bVI→bVII descent what makes it "pop"?
- Does I bVII read as a Zelda field where I V reads as a nursery rhyme?
- Does the minor iv read sad-pop (his instinct) or old (the pack's absence)?
- Does a held tonic under IV/V read dreamy or muddy; should it release at V?
- Which close is a ballad and which is an anthem; does V7 sound old?
- Is R-5-9 the modern pop sound, and is sus4 the same idea to him or a suspension?
- Which of bass-to-3rd, bass-to-5th, inner-voice-to-7th is a chord CHANGE to his ear?

## What I could not measure

- Emotion labels are hand-authored from titles (`toppack-labels-r34.mjs`); every "by emotion"
  cut inherits that. The rotation split is 8 vs 8.
- The half-bar labeller has no bass-independent voice-leading model, so "inversion vs new chord"
  is undecidable from the labels; the 53% relatedness figure is an upper bound and the raw
  reads (7 songs) are the evidence.
- 6/8 and 3/4 sources (golden_hour, interstellar, 15 Zelda tracks) were read but their loops
  are re-cast into 4/4 on the cards, per the brief.
- The engine's own colour share and cadence distribution have no comparable measurement in
  CLAUDE.md; the comparison in §2 is against the law's wording, not a number.

---

# LANE 2 — THE LEFT HAND AND ITS RHYTHM


Lanes: `lh` (what the accompaniment hand plays, and how it flows) and `rhythm` (comping, anticipation, tresillo, pulse). Source: `audios/toppack-r34/_analysis.json` (built by `scripts/analyze-toppack-r34.mjs`) plus raw-note probes via `loadSong` (`src/ingest/corpus.js`) — probe scripts are in this scratchpad (`lh-census.mjs`, `lh-raw.mjs`, `lh-raw2.mjs`, `lh-open2.mjs`, `lh-rawbar.mjs`, `lh-sections.mjs`, `probe-cards-lh.mjs`).

**Population.** 419 readable files → 311 songs after collapsing duplicates (per `song` id: prefer a non-"easy" file, then the most bars). Unless a table says otherwise, every number below is over the **249 songs in 4/4** (the engine is 4/4-only, D92), pooled over bars where the pooled unit is a bar and medians over songs where it is a song. The LH is the analyzer's `acc` hand (track split in 89% of files, pitch split otherwise).

**Definitions used throughout** (from `analyze-toppack-r34.mjs` / `src/ingest/piano.js`):
- *onset* = a cluster of LH notes within ±1/48 bar; *onsets/bar* counts clusters; *notes per attack* = cluster size.
- `lhClass(bar)` is behavioural (`scripts/analyze-toppack-r34.mjs` L163): 1 onset → `pedal` (longest note ≥ 3/4 bar) or `single_hit`; mean cluster ≥ 2.5 and ≤ 4 onsets → `block`; mean cluster ≥ 2 and ≥ 5 onsets → `comp`; alternating single/cluster → `stride`; ≥ 60% octave dyads → `octaves` (`octave_pulse` at ≥ 6 onsets); ≥ 60% fifth dyads → `fifths`; single-note figures by contour → `broken_octave` / `alberti` (every 2nd note the same pitch) / `arp_up` / `arp_down` / `arp_updown` / `walk` / **`arp_mixed`** (anything else with ≥ 2 ups and ≥ 2 downs, or fewer than 3 same-direction moves); everything left → **`mixed`**. So `arp_mixed` and `mixed` are residuals, not shapes — §1.3 opens them.
- Figure tokens are chord-relative (`R/3/5/7/9`, `~n` for non-chord semitones, `+` per octave, `.` = simultaneous), onsets on the bar's `pickGrid` (8/16/12/24). `hist16` = LH onset histogram over 16 slots; `on-beat` = slots 0/4/8/12, `off-8th` = 2/6/10/14, `odd-16th` = odd slots, the analyzer's `tresillo` = slots 0+6+12 (**note: slot 12 is beat 4, so that field is not a syncopation measure — the diagnostic slot is 6, the and-of-2, and 14, the and-of-4; both are reported separately below**).

---

## 1. The figure taxonomy by vibe

### 1.1 By lane (4/4 songs, medians over songs)

| lane | n | onsets/bar | notes/attack | low note (midi) | spread (st) | note len (beats) | on-beat | off-8th | odd-16th | and-of-2 (slot 6) | and-of-4 (slot 14) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ballad | 62 | 5.3 | 1.36 | 41 (F2) | 15 | 0.47 | 54% | 31% | 1% | 10% | 7% |
| pop | 60 | 4.8 | 1.95 | 42 | 14 | 0.68 | 56% | 33% | 1% | 13% | 6% |
| game | 31 | 3.8 | 1.27 | 45 (A2) | 12 | 0.95 | 66% | 22% | 0% | 7% | 4% |
| rock | 35 | 6.2 | 1.58 | 39 | 15 | 0.47 | 51% | 39% | 0% | 10% | 8% |
| film | 18 | 5.6 | 1.54 | 42 | 14 | 0.50 | 51% | 26% | 19% | 7% | 6% |
| classical | 7 | 7.9 | 1.18 | 42 | 12 | 0.25 | 35% | 28% | 37% | 6% | 7% |
| edm | 16 | 6.2 | 1.50 | 44 | 13 | 0.50 | 51% | 43% | 1% | 12% | 10% |
| hiphop | 11 | 5.4 | 1.45 | 36 (C2) | 12 | 0.49 | 43% | 35% | 14% | 8% | 9% |
| jazz | 3 | 3.8 | 1.88 | 41 | 26 | 0.90 | 77% | 20% | 2% | 5% | 4% |

Pooled LH onset histogram (mean of per-song normalised `hist16`, %, slots 0..15):

```
ballad  20  1  7  1 13  1 10  1 13  1  6  1 13  2  7  1
pop     24  1  6  3  9  1 13  1 13  1  6  2 13  1  6  1
game    34  1  5  1  8  1  7  1 17  1  7  0 11  1  4  1
rock    18  2  8  2 10  2 10  2 13  2  8  2 11  2  8  1
edm     16  1  9  2 11  2 12  2 11  1  9  1 11  2 10  1
film    16  2  7  3 11  3  7  3 12  3  7  3 11  3  6  3
```

Readings: the pop/ballad/rock/EDM left hand lives on the **8th grid** — odd 16ths are 0–1% of its onsets (the r33 melody-grid law holds on the accompaniment side too, and harder). Film (19%) and classical (37%) are the only lanes with 16th-level LH movement, and it is *alberti/broken-octave 16ths* (Einaudi, Moonlight), not syncopation. **Game is the sparsest lane** — 3.8 onsets/bar, a note nearly a beat long, a third of all onsets on beat 1 — and its LH sits a fourth higher than the ballad's (A2 vs F2). Hip-hop sits lowest (C2) with a real and-of-4 presence (9%). Pop's and-of-2 (13%) is the strongest off-beat slot in any lane: the pop LH is a comp that answers on the and-of-2.

### 1.2 Class share (pooled bars, 4/4) and the lane/emotion cells

| lane | bars | classes (share of bars) |
|---|---|---|
| ballad | 4983 | arp_mixed 23 · mixed 17 · alberti 14 · pedal 10 · block 9 · comp 7 · arp_up 5 · octaves 4 |
| pop | 5422 | comp 20 · block 19 · arp_mixed 14 · mixed 12 · pedal 8 · alberti 7 · fifths 6 · octaves 5 |
| game | 792 | mixed 25 · arp_mixed 23 · comp 13 · alberti 13 · pedal 12 · arp_up 4 · block 3 · octaves 3 |
| rock | 3403 | mixed 23 · comp 20 · arp_mixed 17 · alberti 13 · block 6 · octaves 5 · pedal 4 |
| film | 1495 | arp_mixed 25 · alberti 16 · mixed 16 · comp 12 · pedal 10 · block 6 |
| edm | 1537 | arp_mixed 18 · comp 18 · mixed 17 · alberti 12 · block 9 · octaves 7 · single_hit 7 |
| hiphop | 485 | **octaves 25** · alberti 13 · comp 11 · mixed 8 · arp_mixed 8 · walk 7 · fifths 6 |

Pop is the only lane where **chordal** classes (comp + block = 39%) beat the single-note arps; the ballad is single-note (arp_mixed + alberti + arp_up = 42%); hip-hop is octaves. The lane/emotion cells with ≥ 3 songs (4/4) show density tracking the emotion inside a lane:

| cell | n | onsets/bar | notes/attack | low | dur (beats) | off-8th | bpm | top classes |
|---|---|---|---|---|---|---|---|---|
| ballad/sad | 23 | 4.0 | 1.51 | 44 | 0.52 | 27% | 104 | mixed 5, block 5, arp_mixed 5 |
| ballad/romantic | 8 | 5.5 | 1.23 | 45 | 0.49 | 36% | 120 | arp_mixed 5, pedal 2 |
| ballad/calm | 6 | 6.8 | 1.32 | 41 | 0.47 | 47% | 120 | arp_mixed 2, alberti 2 |
| ballad/somber | 3 | 3.2 | 1.36 | 39 | 0.75 | 18% | 96 | mixed / alberti / octaves |
| pop/excited | 12 | 4.8 | **2.51** | 49 | 0.98 | 22% | 130 | block 5 |
| pop/happy | 10 | 4.4 | 1.72 | 39 | 0.50 | 37% | 130 | mixed / comp / fifths |
| pop/dramatic | 5 | 6.5 | 1.21 | 39 | 0.52 | 48% | 120 | arp_mixed 2, comp 2 |
| rock/dark | 7 | 6.4 | 1.64 | 38 | 0.47 | 36% | 106 | mixed 3 |
| rock/aggressive | 3 | 7.4 | 1.29 | **30** | 0.18 | 47% | 132 | alberti 2 |
| edm/excited | 5 | 5.5 | 2.02 | 48 | 0.55 | 49% | 130 | comp 2 |
| edm/melancholic | 4 | 7.2 | 1.37 | 41 | 0.40 | 48% | 120 | mixed 3 |
| game/mysterious | 3 | **1.8** | 1.27 | 41 | **1.94** | 0% | 80 | octaves / pedal / mixed |
| game/playful | 4 | 6.0 | 1.01 | 48 | 0.95 | 49% | 140 | mixed 2, arp_mixed 2 |
| hiphop/dark | 3 | 8.4 | 1.44 | 32 | 0.13 | 37% | 80 | — |

So: a **sad ballad LH is sparse and chordal** (4 attacks a bar, blocks/held chords, ballad/somber 3.2), **romantic is the 8th wave** (5.5, single-note arps), **calm is the busiest** (6.8, alberti-type flow) — density goes UP from sad to calm, not down. **Excited pop is thick, not fast** (2.5 notes per attack, 4.8 attacks, note length ≈ a beat — block chords). **Dark rock is dense and low** (6.4/bar at midi 38; aggressive at midi 30). **Mysterious game is one or two attacks a bar held two beats.**

### 1.3 What the catch-all classes actually are (opened files)

`arp_mixed` (19% of bars) and `mixed` (17%) together are more than a third of the pack. Opening bars of that class (`lh-open2.mjs`):

| song | class | what the hand does | proposed class |
|---|---|---|---|
| someone_like_you (chorus) | arp_mixed | `R 5 R+ 5 R+ 5+ R++ 5+` 16ths — a rocking fifth that climbs an octave at the half-bar | **two_register_arp** |
| yesterday, hall_of_fame, talking_to_the_moon | arp_mixed | the same shape in 8ths | two_register_arp |
| pompeii, lithium, hold_on, enya_only_time | arp_mixed | `R 5 R+ 5 3+ 5 R+ 5` 8ths — the wave (peak on the 10th at beat 3) | **wave** |
| alone_alan_walker, alone_pt2, bts_i_need_u, save_your_tears | arp_updown/arp_mixed | `R 5 R+ 3+ 5+ 3+ R+ 5` — the arch (the engine's `fnd_ballad_8ths_arch` exactly) | arch |
| hotel_california | arp_mixed | 15-onset runs mixing `R 5 R+ 3+ 5+` with `~2+` passing tones — a written line, not a figure | line |
| let_me_down_slowly | arp_mixed | `R.5.R+ 5 R+ 5 R+.5+.R++ 5+ R++ 5+` @0,3,4,6,8,11,12,14/16 — a two-register wave with an octave-dyad on 1 and a 16th pickup | two_register_arp + pickup |
| the_final_countdown | arp_mixed | `R+ 5+ 3++ R` @0,2,4,12 — three-note climb then a low root on beat 4 | climb_and_drop |
| another_love, alone_pt2 | mixed | `R.5.R+` on 1, `3+.5+` answers on 6/16 and 12/16 — bass + two chord answers on the tresillo slots | **bass_answers (0/6/12)** |
| gurenge | mixed | `R.R+ 5 R+.3+ R` @0,3,6,12 — the same shape with a 16th pickup | bass_answers |
| counting_stars, clocks, this_kiss | mixed | `R.R+ 5 R.R+ 5 …` — octave dyad on every beat, single fifth/octave between | **octave_pump** |
| shake_it_off | mixed | `R R+ R+` @0,2,4/8 — root then two octave hits, then air | hit_and_air |
| oot_ganondorf, oot_requiem_spirit, let_her_go | mixed | `R R+` at 0 and 4/8 — half-note octave alternation | **half_octaves** |
| deja_vu | arp_mixed (100%) | `R 5 5 R 5 5` @0,3,6,8,11,14/16 — a doubled tresillo | tresillo_double |
| faded, lovely, chi_mai, paradise_coldplay | arp_mixed/mixed | sparse `R`, `R 5 R+` on a **24-grid** — see the caveat in §3.3: these are lagged, not triplet | (grid artefact) |

Missing classes, then: **wave**, **arch**, **two_register_arp**, **bass_answers** (the pop comp), **octave_pump**, **half_octaves**, **climb_and_drop**, and a **line** bucket for written bars. The behavioural classifier cannot see any of these because it looks at contour direction counts only; a token-level match (§2) would.

---

## 2. The recurring figures as engine tokens

Method: exact `tokens @ steps` per bar (`barFigures`), counted per song where the song carries the bar ≥ 4 times; songs listed only for ≥ 3 songs. **Verified against raw ticks/velocities (`lh-rawbar.mjs`) on pompeii, alone_alan_walker, i_need_your_love, heartbreak_girl, somewhere_only_we_know** — every onset, pitch and velocity matched the token line (pompeii bar 8: 38 45 50 45 54 45 50 45 at 0/8..7/8, all velocity 80; alone bar 22: 41 48 53 57 60 57 53 48 at velocities 88 65 64 70 60 57 56 54; i_need_your_love: 36+48 dyads on each beat, upper note 67–75 vs lower 55–59; heartbreak_girl: 58/62/65 triads on each beat, top note 90–93 vs bass 82–85; somewhere_only_we_know: 45/52/57 triads on every 8th, all velocity 80).

| figure (tokens @ onsets) | songs (≥4 bars) | lanes | register (root octave) | accents (measured) | holds across the chord change? |
|---|---|---|---|---|---|
| **octave pedal** `R.R+` @ 0 (whole note) | **29** (17 on 16-grid + 12 on 8-grid) | ballad 11, film 4, game 2, edm 2, pop 4, hiphop 3, rock 2, anime 1 | 2 (oot_potion_shop 43+55; oot_deku 36+48) | one attack | re-rooted per chord, rhythm identical |
| **root pedal** `R` @ 0 | 19 | ballad 10, film 2, game 3, pop 2, rock 1, jazz 1 | 3–4 (all_of_me 92 bars at midi 51) | — | same |
| **held R.5.R+** @ 0 | 17 | rock 5, ballad 6, film 2, pop 2, edm 2, game 1 | 2–3 (city_of_angels 14 bars, get_you_the_moon 22) | — | same |
| **held R.5** @ 0 | 7 (+3 on 16-grid) | pop 3, ballad 5, rock 1 | 3 (safe_and_sound 20, steal_my_girl 25, shallow 15) | — | same |
| **block R.3.5** @ 0 | 8 (+4) | pop 5, ballad 2, folk 1 | 3 | — | same |
| **wave** `R 5 R+ 5 3+ 5 R+ 5` @ 0..7/8 | 7 | rock 2, ballad 4, pop 1 | 2 (pompeii low 38) | pompeii flat 80; hold_on/lithium flat | rhythm held; pitch shape re-rooted |
| **arch** `R 5 R+ 3+ 5+ 3+ R+ 5` @ 0..7/8 (or 2/16 spacing) | 6 (3+3) | edm 2, pop 2, ballad 1, rock 1 | 2 (alone low 41) | alone: 88 65 64 70 60 57 56 54 — bass-loud, decaying | held |
| **octave quarters** `R.R+ ×4` @ 0,2,4,6/8 | 7 | edm 1, ballad 2, rock 2, pop 2 | 2 (i_need_your_love 36+48; viva_la_vida 39–41) | i_need_your_love upper note louder (67–75 vs 55–59); mean accents 1.00 .95 .96 .96 | held; viva_la_vida plays it on 92 of 136 bars |
| **broken octave 8ths** `R R+ ×4` @ 2/16 spacing | 6 | classical 2, latin 1, ballad 1, film 1, pop 1 | 2 (despacito 68 bars) | despacito 1.00 .93 .98 .93 .98 .93 .98 .89 | held |
| **block halves** `R.3.5 R.3.5` @ 0,4/8 | 6 | pop 5, ballad 1 | 3 (heart_attack 73 bars, summertime_sadness 38) | 0.96 / 1.00 | held |
| **block quarters** `R.3.5 ×4` | 5 | pop 3, ballad 2 | 3 (heartbreak_girl 66 bars) | top note loudest (90–93 vs 82–85), beat 1 slightly up | held |
| **1st-inversion halves** `5.R+.3+ ×2` @ 0,4/8 | 5 | pop 4, ballad 1 | 2–3 | — | held (the inversion is the point: bass on the 5th) |
| **half-bar climb** `R 5 R+ 3+ R++` @ 0..4/8 then rest | 5 | ballad 3, rock 2 | 2 (follow_you 21 bars) | — | held |
| **9th climb** `R 5 R+ ~2+ R++` @ 0..4/8 | 3 | pop 1, ballad 2 | 3 (call_me_maybe 17, mad_world 12) | — | held; the `~2+` is the 9th |
| **two-register 16ths** `R 5 R+ 5 R 5 R+ 5 R+ 5+ R++ 5+ R+ 5+ R++ 5+` | 3 (+3 in 8ths) | film 1, ballad 2 | 2 (einaudi_experience 13 bars, someone_like_you) | flat 80 (someone_like_you) | held |
| **power 8ths** `R.5.R+ ×8` / `R.5 ×8` | 3 / (all_the_small_things 77 bars) | rock 2, ballad 1 | 2 (final_countdown 26 bars, in_the_end 16) | 1.00 .96 .99 .96 .97 .99 .99 .97 — flat | held |
| **tresillo dyads** `R.5 R.5 R.5` @ 0,3,6/8 | 3 | pop 1 (shape_of_you **167 bars**), hiphop 1, ballad 1 | 2 | — | held |
| **root quarters** `R ×4` | 3 (+ my_songs_know 21 bars) | pop, ballad, edm, rock | 3 | strobe .95 .98 .98 1.00 | held |
| **hip-hop octaves** `R.R+` @ 0, `5.5+` @ 12/16 | still_dre 25 bars (+ rap_god `R.R+ R.R+` @ 0,6/8 68 bars) | hiphop | **1–2 (still_dre low 33, rap_god 31)** | flat 80 / 71–75 | held |
| **bass + answers** `R.5.R+` @ 0, `3+.5+` @ 6/16, 12/16 | another_love 37 bars, alone_pt2 (57% `R 3+.5+ R+`), gurenge | ballad, edm, anime | 2–3 | another_love 54 35 30 (bass-loud) | held |

Points the brief asked for that the pack does NOT support: (a) **"R.5 held then 3+" ballad shape** — searched as `R.5(.R+)` on 1 followed by a 3/3+ answer within ≤ 4 onsets: **2 songs** in 249 (1 rock, 1 ballad) carry it ≥ 4 bars. What exists instead is the bass + two-chord-answers shape above (`R.5.R+` then `3+.5+` twice). (b) The **Mozart alberti `R 5 3 5`** is rare on this material; the pack's "alberti" class is mostly the **pivot-on-the-fifth** `R.3+ 5 3+ 5 3+ 5 3+ 5` (someone_you_loved, 63 of 79 bars, velocities 44–76 varying by hand) and the 16th `R 5 R+ 5` (einaudi). I did not tally the token content of every alberti-class bar — open question below.

**Does the figure change at the chord change or hold?** Bar-to-bar, the LH **rhythm** (onset grid) is identical to the previous bar in 51–53% of ballad/pop/edm bar pairs (44% rock, 34% film, 60% classical), and **at a chord change the rate is the same** (52% ballad, 50% pop, 45% rock, 59% classical). The exact pitch shape (tokens) holds in only 17–21% — but tokens are chord-relative with the octave reference seated on the bar's lowest note, so an inversion, a bass on the 5th, or a wider spread all read as a "new shape". The honest statement: **the rhythm is the invariant; the pitch content re-roots and re-voices under it.** Whole-song single figures are common (shape_of_you 167 bars, all_of_me 92, heart_attack 73, despacito 68, pompeii 62, someone_you_loved 63/79).

---

## 3. Rhythm

### 3.1 Shares by lane

See §1.1. Summary: on-beat 51–56% of LH onsets in ballad/pop/rock/edm (66% game, 35% classical); off-8th 31–43% (edm highest at 43%, game lowest at 22%); odd-16th 0–1% except film 19%, classical 37%, hiphop 14%. The and-of-2 (slot 6) carries 10–13% in ballad/pop/edm/rock — the one syncopated slot every pop lane uses; the and-of-4 (slot 14) 6–10% (edm 10%, hiphop 9%, rock 8%).

### 3.2 Anticipations — genuine ones are a per-song device

Definition (`lh-raw.mjs`): a bar whose last LH onset sits on the final 8th (7/8), where the next bar's downbeat chord DIFFERS from the current one, and the notes struck fit the NEXT chord and do not all fit the current one. This separates a real anticipation from a repeat of the current chord on the and-of-4.

| lane | bars ending on the last 8th | of which next chord differs | genuine anticipations | songs with ≥ 4 |
|---|---|---|---|---|
| ballad | 33% of bars | 1295 | 41 (3%) | 4 |
| pop | 32% | 1363 | 105 (8%) | 7 |
| rock | 46% | 1148 | 63 (5%) | 3 |
| edm | 47% | 632 | 44 (7%) | 3 |
| film | 34% | 319 | 9 (3%) | 1 |
| hiphop | 40% | 142 | 9 (6%) | 1 |
| game | 17% | 115 | 8 (7%) | 1 |

So the LH lands on the and-of-4 in a third to a half of bars, but it is almost always the *current* chord (a repeat/pickup); the chord arriving early is **3–8% of chord-change bars**. Where it happens it is the song's habit: viva_la_vida **14 of 14** eligible bars, stay_with_me **13 of 13**, maps 26 of 48, listen_to_your_heart 30 of 44 (a multi-track bass part), every_breath_you_take 28 of 56 (multi-track), clarity 23 of 85, stay_the_night 16 of 74, forget_you 14 of 95, drops_of_jupiter 6 of 15, heartbreak_girl 4 of 4. **10 of 249 songs carry ≥ 4.** Raw spot-check: viva_la_vida bar 0's last 8th is 39+51 (Eb) under a Db bar, resolving to Eb on the next downbeat; stay_with_me bar 0's last 8th is 55/60/64 (C) under an F bar.

### 3.3 Swing / shuffle — none verified in 4/4; the triplet grids are a lag artefact

15 songs in 4/4 came out of `pickGrid` on a 12- or 24-grid with 50–100% of onsets off the 8th positions (faded 68%, paradise_coldplay 100%, lovely 68%, this_is_war 71%, good_time 73%, …). **Opened four of them: none is triplet.** paradise_coldplay's bar 21 sits at 0.031, 0.281, 0.531 of the bar — straight quarters played 1/32 late; this_is_war at 0.262/0.372/0.482 (8ths, +1/96 late); good_time at 0.172/0.547; lovely's chord at 0.274/0.281/0.288 (a rolled chord). `pickGrid` is coarsest-first with a residual budget, and a constant lag over the budget makes it fall through to 24, which then "explains" the lag as triplet positions. **Treat `grid: 12/24` on a 4/4 file as "lagged", not "swung", until the residual is inspected.** Real compound-meter sources are the 20 files the report lists under 6/8 and 12/8 (a_thousand_years, cant_help_falling_in_love, hallelujah-type material) — no card was written from them (4/4-only law).

### 3.4 Tresillo

The analyzer's `tresillo` field (slots 0+6+12) is 38–45% in every lane, but slot 12 is beat 4, so the field mostly measures "beat 1 + beat 4". The genuine 3+3+2 shapes are in §1.3/§2: shape_of_you's `R.5 R.5 R.5` @ 0,3,6/8 (167 bars — the engine's `fnd_tresillo_bass` slots exactly, as dyads), another_love's bass + answers @ 0,6,12/16, alone_pt2's `R 3+.5+ R+` on the same slots, deja_vu's doubled tresillo, good_riddance/skyfall's `R R R+ R+` @ 0,3,4,7/8 (charleston + push). These are chordal/dyadic figures; **no flowing 8th arp in the pack is regrouped 3+3+2** — which is consistent with his ruling that groove regroupings are wrong for flowing/calm material.

---

## 4. How the LH varies over a song

**Caveat first.** The analyzer's `form.sections` are cut where ≥ 2 of {LH class, RH pitch ≥ 5 st, RH density ≥ 3, velocity ≥ 12} change over a 4-bar window, so "78% of section boundaries change LH class" is partly the definition talking, and many of those changes are `arp_mixed ↔ mixed` (residual ↔ residual). The transition tables in `lh-census.txt` are kept for reference but the finding below is re-measured on raw bars with the sections used only as boundaries.

**First section → loudest later section** (the chorus proxy; raw per-bar LH stats, medians over songs):

| lane | n | Δ onsets/bar | Δ notes/attack | Δ low note (st) | Δ velocity | class change | songs ≥ 3 st LOWER | ≥ 3 st higher | ≥ +1 onset denser | ≥ +0.5 thicker |
|---|---|---|---|---|---|---|---|---|---|---|
| ballad | 54 | +1.2 | +0.05 | **−8** | +22 | 83% | **67%** | 9% | 52% | 11% |
| pop | 47 | +0.6 | +0.07 | −2 | +4 | 77% | 49% | 19% | 45% | 23% |
| rock | 31 | +0.6 | +0.08 | −3 | +16 | 81% | 58% | 16% | 42% | 23% |
| edm | 15 | −0.2 | +0.05 | **−12** | +18 | 87% | **73%** | 7% | 20% | 33% |
| film | 17 | +0.1 | +0.02 | 0 | +25 | 65% | 24% | 18% | 47% | 18% |
| classical | 7 | 0.0 | +0.23 | 0 | +42 | 86% | 43% | 43% | 29% | 29% |
| hiphop | 7 | +2.3 | 0.00 | 0 | 0 | 57% | 14% | 29% | 57% | 0% |
| game | 9 | −0.5 | 0.00 | 0 | 0 | 100% | 33% | 22% | 22% | 22% |

**The chorus lift in the left hand is REGISTER, not density and not thickness.** In ballads the loudest section's LH sits a median 8 semitones lower than the opening's (two thirds of songs drop ≥ 3 st; the RH median pitch moves only +2 st), onsets rise by about one per bar and notes-per-attack do not move. EDM is the same shape (−12). Spot checks (`lh-sections.mjs`): let_me_down_slowly low 47 → 44 → 35 → 35 across its sections with onsets 6.0 → 5.7 → 7.6 → 12.1; someone_like_you verse alberti at 44–50, chorus 16ths at 38–40; alone_alan_walker 51 → 41 → 38 at a constant 8 onsets/bar; viva_la_vida's climaxes sit at low 37 vs the verse's 39–41 with the class unchanged (octave quarters throughout, velocity 64 → 83). A pedal song (all_of_me) never moves anything. Pop's velocity delta is small (+4) because 44% of pop files carry a flat velocity arc; the register drop is there anyway (49% lower).

The "verse arp → chorus block/octaves" cliché is real but minor as a class change: among ballads that change class, the top pairs are pedal → alberti/arp_up (the intro pedal opening into a figure) and arp_mixed ↔ mixed; in pop, arp_mixed → alberti and arp_mixed → octaves. **The class stays and the octave drops** describes more songs than **the class changes**.

For D97: the pack varies its accompaniment by (1) holding the rhythm and re-rooting (§2), (2) dropping the register at the loud section, (3) changing the figure at section boundaries (not inside a 4-bar loop — the bar-to-bar rhythm-hold rate is ~50% and the song-long single figures above are common), and (4) the occasional 4th-bar turnaround which is a **hold** of the figure's first half (pompeii's `R 5 R+ 3+` @ 0..3/8 then ring, 4 bars; final_countdown's `R+ 5+ 3++ R` climb-and-drop). It does not vary by substituting intervals inside a bar.

---

## 5. Accents inside the figure

Definition: bars with ≥ 4 onsets and a velocity spread ≥ 8 (the "velocity-varied" bars; their share of all bars is the first column).

| lane | velocity-varied bars | loudest on beat 1 | loudest = bar's LOWEST note | loudest = bar's highest note | loudest on an off-beat | loudest = last onset |
|---|---|---|---|---|---|---|
| ballad | 33% | 50% | **57%** | 32% | 20% | 9% |
| pop | 26% | 44% | 53% | 43% | 32% | 11% |
| rock | 40% | **60%** | **63%** | 25% | 23% | 7% |
| edm | 46% | 51% | **65%** | 47% | 28% | 10% |
| film | 35% | 23% | 49% | 45% | **53%** | 17% |
| classical | 27% | 14% | 47% | 47% | **56%** | 33% |
| hiphop | 35% | 50% | 52% | 23% | 29% | 6% |
| game | **2%** | — | — | — | — | — |

The pop/rock/edm/ballad accent is **bass-loud on beat 1** (alone_alan_walker's 88-then-decay is the modal shape; another_love 54 35 30). Film and classical put the loudest attack **off the beat** in more than half of varied bars — the Einaudi/Moonlight 16th figures lean on the upper notes of the arp. Block comps put the **top note** loudest (heartbreak_girl 90–93 over 82–85; i_need_your_love's octave dyads 67–75 over 55–59). Flat velocity is common and lane-blind (pompeii, somewhere_only_we_know, someone_like_you, viva_la_vida, all_of_me at 80). **Game files carry no velocity at all** (1 of 31 songs with ≥ 30% varied bars) — the OoT rips are quantised velocities, so nothing about game accents can be read from this pack.

---

## 6. Against the engine

### 6.1 `src/lib/figurations-foundation.js` vs the pack (by shape)

| engine entry | pack equivalent | verdict |
|---|---|---|
| `fnd_ballad_8ths_arch` `R 5 R+ 3+ 5+ 3+ R+ 5` | the arch, 6 songs (alone_alan_walker 17 bars) | **present, correct** |
| `fnd_power_fifth_8ths` `R.5 ×8` | all_the_small_things 77 bars (+ `R.5.R+ ×8` in 3 songs) | present (rock) |
| `fnd_block_quarters` `R.3.5 ×4` | 5 songs (pop 3) | present; pop plays it at octave 3 with the top note loudest |
| `fnd_charleston_comp` `R.3.5` @ 0, 3/8 | the pack adds a third hit on beat 4 (`@ 0,6,12/16`, another_love 37 bars) | half-present — the pop comp is charleston + beat-4 answer |
| `fnd_tresillo_bass` `R R R` @ 0,3/8,3/4 | shape_of_you `R.5 R.5 R.5` on the same slots, 167 bars | present as dyads |
| `fnd_murky_octaves` `R R+ ×4` 8ths | broken octaves, 6 songs (despacito 68 bars) | present |
| `fnd_drone_fifth` `R.5` held | 7–10 songs | present |
| `fnd_alberti_8ths/16ths` `R 5 3 5` | rare; the pack's alberti is pivot-on-5th `R.3+ 5 3+ 5…` or `R 5 R+ 5` 16ths | shape mismatch (see open question) |
| `fnd_broken_tenths` `R 5 3+ 5 ×2` | the wave is `R 5 R+ 5 3+ 5 R+ 5` — one climb to the 10th per bar, not two | near miss |
| `fnd_drive_8th_root` `R ×8` | not in the piano pack's top figures (root quarters ×4 in 3 songs) | absent on piano |
| `fnd_octave_bounce_16ths` | classical only (moonlight `R R+ ×8` 16ths, chop_suey) | absent from pop/game |
| `fnd_pedal_root_ostinato` `R R R R+ R R R+ R` | good_riddance/skyfall `R R R+ R+` @ 0,3,4,7/8 is the nearest | absent as written |
| `fnd_stride_4`, `fnd_wide_oompah`, `fnd_montuno_skel`, `fnd_boogie_shuffle`, `fnd_travis_skel` | stride 1.8% of bars; none of the others | absent |

### 6.2 Missing figures, in the figurations format (accents = measured where a raw velocity line exists, else the pack's bass-loud default)

```js
fnd_pack_octave_pedal:  { bars: 1, grid: 4,  onsets: ['0/1'], figure: ['R.R+'], accents: [1], legato: true, octave: 2 },                                  // 29 songs; oot_potion_shop, another_love, no_time_to_die
fnd_pack_half_octaves:  { bars: 1, grid: 2,  onsets: ['0/1','1/2'], figure: ['R','R+'], accents: [1, 0.95], legato: true, octave: 2 },                     // oot_ganondorf 10/15 bars, oot_requiem_spirit, let_her_go
fnd_pack_wave:          { bars: 1, grid: 8,  onsets: ['0/1','1/8','1/4','3/8','1/2','5/8','3/4','7/8'], figure: ['R','5','R+','5','3+','5','R+','5'], accents: [1,0.8,0.85,0.8,0.9,0.8,0.85,0.8], legato: true, octave: 2 }, // 7 songs; pompeii plays it flat
fnd_pack_arch_measured: { ...fnd_ballad_8ths_arch, accents: [1, 0.74, 0.73, 0.8, 0.68, 0.65, 0.64, 0.61] },                                                   // alone_alan_walker 88 65 64 70 60 57 56 54
fnd_pack_two_register:  { bars: 1, grid: 8,  onsets: ['0/1','1/8','1/4','3/8','1/2','5/8','3/4','7/8'], figure: ['R','5','R+','5','R+','5+','R++','5+'], accents: [1,0.8,0.85,0.8,0.9,0.8,0.85,0.8], legato: true, octave: 2 }, // yesterday, hall_of_fame; 16th form in someone_like_you / einaudi
fnd_pack_bass_answers:  { bars: 1, grid: 16, onsets: ['0/1','3/8','3/4'], figure: ['R.5.R+','3+.5+','3+.5+'], accents: [1, 0.65, 0.55], legato: false, octave: 2 }, // another_love 54 35 30; alone_pt2 'R 3+.5+ R+'
fnd_pack_octave_quarters: { bars: 1, grid: 4, onsets: ['0/1','1/4','1/2','3/4'], figure: ['R.R+','R.R+','R.R+','R.R+'], accents: [1, 0.95, 0.96, 0.96], legato: false, octave: 2 }, // i_need_your_love, viva_la_vida 92 bars
fnd_pack_octave_pump:   { bars: 1, grid: 8,  onsets: ['0/1','1/8','1/4','3/8','1/2','5/8','3/4','7/8'], figure: ['R.R+','5','R.R+','5','R.R+','5','R.R+','5'], accents: [1,0.7,0.9,0.7,0.95,0.7,0.9,0.7], legato: false, octave: 2 }, // counting_stars (flat 85), clocks, this_kiss
fnd_pack_hiphop_octaves:{ bars: 1, grid: 4,  onsets: ['0/1','3/4'], figure: ['R.R+','5.5+'], accents: [1, 0.9], legato: true, octave: 1 },                  // still_dre (low 33); rap_god 'R.R+ R.R+' @0,3/4
fnd_pack_block_halves_inv: { bars: 1, grid: 2, onsets: ['0/1','1/2'], figure: ['5.R+.3+','5.R+.3+'], accents: [0.96, 1], legato: false, octave: 2 },       // 5 pop songs — bass on the fifth
fnd_pack_half_climb:    { bars: 1, grid: 8,  onsets: ['0/1','1/8','1/4','3/8','1/2'], figure: ['R','5','R+','3+','R++'], accents: [1,0.8,0.85,0.85,0.9], legato: true, octave: 2 }, // follow_you 21 bars; with '~2+' for '3+' = call_me_maybe's 9th climb
fnd_pack_tresillo_double: { bars: 1, grid: 16, onsets: ['0/1','3/16','3/8','1/2','11/16','7/8'], figure: ['R','5','5','R','5','5'], accents: [1,0.75,0.75,0.9,0.75,0.75], legato: false, octave: 2 }, // deja_vu, every bar
fnd_pack_pivot_alberti: { bars: 1, grid: 8,  onsets: ['0/1','1/8','1/4','3/8','1/2','5/8','3/4','7/8'], figure: ['R.3+','5','3+','5','3+','5','3+','5'], accents: [1,0.85,0.9,0.9,1,0.9,1,0.8], legato: true, octave: 2 }, // someone_you_loved 63/79 bars, velocities 44–76
```

### 6.3 The metronome test on real material

Definition (D102): a bar is rejected when `onsets ≥ 6 && distinct token shapes ≤ 1` (a pulse) or `onsets ≥ 12` (a gear change). Applied per bar to the pack (4/4):

| lane | metronome-fail bars | straight-8 bars (share of all bars) | of those: ONE shape | two+ shapes | bars with > 8 onsets |
|---|---|---|---|---|---|
| ballad | 6% | 15% | 5% | 95% | 7% |
| pop | 4% | 11% | 3% | 97% | 5% |
| rock | **11%** | 24% | **22%** | 78% | 11% |
| edm | 4% | 25% | 8% | 92% | 9% |
| film | 8% | 20% | 0% | 100% | 11% |
| classical | **25%** | 33% | 1% | 99% | **25%** |
| hiphop | 11% | 11% | 4% | 96% | 18% |
| game | 5% | 9% | 0% | 100% | 3% |

Verdict: **in ballad and pop the single-shape straight-8th LH is genuinely rare (3–5% of straight-8 bars) — the test's first clause matches the idiom there.** In rock it is the idiom: 22% of straight-8 bars are one shape (all_the_small_things 77 bars of `R.5` 8ths, my_songs_know 36, the_final_countdown 30, somewhere_only_we_know 27), so a rock lane that applies the first clause to its texture selection rejects the chug. **The second clause (≥ 12 onsets) rejects a quarter of classical bars and ~10% of film/rock/hip-hop bars** — Moonlight's 16th broken octaves, Einaudi's 16th alberti, someone_like_you's chorus — so it encodes "not a piano-ballad texture", not "not music". Also measured on this section's own card: the engine's D97 `fill` form produced a 12-onset bar (card 1, `rhythm_block`, bar 3), i.e. the composite can trip the engine's own gate.

---

## Rules extracted (each with the measurement behind it)

1. **The pop LH is on the 8th grid.** Odd-16th onsets are 0–1% of LH onsets in ballad/pop/rock/edm (n = 173 songs); only film (19%) and classical (37%) move at the 16th, and as figures, not syncopation.
2. **Density follows emotion inside a lane, and calm is busier than sad.** ballad/sad 4.0 onsets/bar (block/held), romantic 5.5 (8th wave), calm 6.8 (alberti flow), somber 3.2. Excited pop is thick (2.5 notes/attack, 4.8 onsets, block chords), not fast.
3. **The octave pedal `R.R+` is the pack's most-shared figure** (29 songs), followed by the root pedal (19) and the held `R.5.R+` (17). Game's LH is one attack a bar held (3.8 onsets/bar, 0.95 beats, mysterious 1.8 / 1.94).
4. **The wave `R 5 R+ 5 3+ 5 R+ 5` and the arch `R 5 R+ 3+ 5+ 3+ R+ 5` are the two shared broken-chord 8ths** (7 and 6 songs), both at root octave 2; the pack's other flowing shape is the two-register rocking fifth.
5. **The pop comp answers on the and-of-2:** slot 6 carries 10–13% of LH onsets in every pop lane, and the 3-attack bass + answers on 0/6/12 is the most common chordal shape hidden in the catch-alls (another_love 37 bars, alone_pt2 57%).
6. **The rhythm is the invariant across the chord change** — identical onset grid in 50–52% of ballad/pop chord-change pairs; the pitch shape re-roots/re-voices (17–21% identical tokens).
7. **A genuine anticipation is a song-level device, not a bar-level decoration:** 3–8% of chord-change bars overall, but 14/14 in viva_la_vida and 13/13 in stay_with_me; 10 of 249 songs carry ≥ 4.
8. **The chorus drops the LH an octave; it does not thicken it.** Loudest-section LH low note −8 st median in ballads (67% ≥ 3 st lower), −12 in EDM (73%), notes/attack +0.05, onsets +1.2; RH pitch +2 st.
9. **Accent = bass-loud on beat 1** in pop/rock/edm/ballad (loudest note is the lowest note in 53–65% of velocity-varied bars, on beat 1 in 44–60%); film/classical accent the off-beat (53–56%); block comps put the top note loudest (heartbreak_girl 90–93 over 82–85).
10. **The single-shape straight-8th LH is a rock idiom (22% of rock straight-8 bars) and rare in ballad/pop (3–5%);** the ≥ 12-onset clause rejects 25% of classical and ~10% of film/rock/hip-hop bars.
11. **Tresillo LH figures are chordal or dyadic** (shape_of_you 167 bars of `R.5` on 0/3/6 of 8; deja_vu's doubled `R 5 5`); no flowing arp is regrouped 3+3+2 anywhere in the pack.
12. **Register by lane:** LH lowest note F2 (41) in ballad/pop, C2 (36) in hip-hop, A2 (45) in game, 39 in rock, down to 24–33 in sign_of_the_times / still_dre / rap_god — the piano is played at octave 1 on this material.

## Open questions an ear must settle (the cards)

- Is the class change (arp → block octaves) audible as a lift on its own, or is it the octave drop that reads as the chorus? (card `pl_lh_chorus_register_drop`)
- Is a one-shape rock chug a defect under a backbeat, or the idiom — and is the engine's octave-pop repair better or merely different? (`pl_lh_rock_chug_metronome`)
- Does the pack's bass-loud decaying accent read as "played", and does the film/classical off-beat accent read wrong on a pop figure? (`pl_lh_accent_placement`)
- Does one and-of-4 anticipation read as a lean, and does a re-strike of the current chord on the same slot read as a stutter? (`pl_rhythm_anticipation_ladder`)
- Where the groove is right (a pop loop), which tresillo shape is the groove, and does the regrouped wave stumble? (`pl_rhythm_tresillo_comp`)
- Does the LH class alone name the genre with no melody? (`pl_lh_class_names_the_vibe`)
- Is the D97 rhythm block / interval block audible as "the same accompaniment developing", and is the surgical edit audible at all? (`pl_lh_wave_three_flows`)
- Which register is the ballad LH on a piano — C1 muddy or dark? Is a synth bass under a C2 wave mud? (`pl_lh_register_octaves`)
- Does the per-bar figure swap read as "a different speed each iteration"? Is the held half-bar turnaround the better variation? (`pl_lh_hold_vs_swap`)
- Are the engine's game staples (root 8ths, octave-bounce 16ths) the wrong idiom for the calm/mysterious game cell? (`pl_lh_zelda_pedal_vs_pulse`)
- Does LH density alone move sad → romantic → calm, and does contour-less density read as an exercise? (`pl_lh_ballad_emotion_density`)
- Not carded, needs a count: what share of `alberti`-class bars are Mozart `R 5 3 5` vs pivot-on-5th `R.3+ 5 3+ 5` vs `R 5 R+ 5` 16ths? (I opened files, I did not tally the class.)
- Not carded: velocity accents in the game lane — unreadable from this pack (quantised velocities).

## The cards (`cards-lh.json`, 11 cards, 50 variants, validator: 0 problems, no out-of-scale tones)

All on one fixed loop (I V vi IV in C = C G Am F; the Zelda card on i bVI bVII i in A minor) so the LH is the only variable; `piano` for the LH, an ORIGINAL 2-bar flute/ocarina line where a lead is needed (gain 0.62–0.72, above every LH peak — verified by `probe-cards-lh.mjs`: no variant has its lead at or below the LH's maximum gain). Reference variant first; every card has a falsification variant. Probe numbers per card:

| card | lane | variants | what the probe confirmed |
|---|---|---|---|
| pl_lh_wave_three_flows | lh | as_measured / rhythm_block / interval_block / surgical | rhythm block changes 37.5% of LH events, interval block 35.9%, surgical 6% (2 of 32) — the verify pass's re-measurement; the agent's own probe said 45/44 — the boldness law's ≥ ⅓ line is met by the two flows and missed by the repair; the `fill` bar lands on 12 onsets |
| pl_lh_class_names_the_vibe | lh | wave / pop comp 0-6-12 / EDM octave quarters / hip-hop octaves / Zelda pedal / film 16th alberti | onsets/bar 8 / 3 / 4 / 2 / 1 / 16; the 16th alberti fails the metronome test on all 4 bars |
| pl_rhythm_anticipation_ladder | rhythm | straight / antic_1 / antic_2 / restrike_current (falsification) | antic_1 and restrike share the identical rhythm (3 onsets, 33% of events changed vs straight); only the chord on the last 8th differs |
| pl_lh_chorus_register_drop | lh | as_measured / class change in place / density only / LH unchanged (falsification) | LH median midi 62 (bars 1-4) → 50 (bars 5-8) in as_measured = a 12 st drop; class-change variant 62 → 53 at 4 onsets/bar; density variant 8 → 16 onsets same register; lead low 72 never under the LH |
| pl_lh_accent_placement | lh | flat / bass-loud decay / top-loud / off-beat loud (falsification) / engine default | pitch content identical across all five (0 events changed); distinct realized gains 1 / 7 / 4 / 2 / 5 |
| pl_lh_rock_chug_metronome | lh | R.5 ×8 / R.5.R+ ×8 / two-shape octave pops / R.5 ×16 (falsification) — with a kick/snare/hat bed | 8/8/8/16 onsets a bar; by the engine's token count the pops variant has 2 shapes (my probe's pitch-class signature cannot see an octave pop) |
| pl_rhythm_tresillo_comp | rhythm | straight quarters / bass + answers 0-6-12 / doubled tresillo / R.5 dyads 0-3-6 / regrouped wave (falsification) | tresillo-slot onset share 60% / 100% / 33% / 100% / 33% |
| pl_lh_register_octaves | lh | C2 / C1 / C3 / two-register / C2 + synth bass at C1 (falsification) | LH span 36-60 / 24-48 / 48-72 / 36-69; the C3 variant's top (72) meets the lead's low (72) |
| pl_lh_hold_vs_swap | lh | hold / swap per bar (falsification, D62) / swap per 2 bars / hold + half-bar turnaround | onsets 8,8,8,8 / 8,8,2,4 / 8,8,3,3 / 8,8,8,4; turnaround changes 19% of events |
| pl_lh_zelda_pedal_vs_pulse | lh | whole-note octave pedal / half-note R-R+ / engine root 8ths / engine octave-bounce 16ths (falsification) | 1 / 2 / 8 / 16 onsets; the two engine staples fail the metronome test on every bar |
| pl_lh_ballad_emotion_density | lh | held block / 8th wave / pivot alberti / two-register 16ths / 16 block chords (falsification) | 1 / 8 / 8 / 16 / 16 onsets; the block-16ths variant is 1 shape × 16 |

## Measurement caveats (things that would have been wrong without the raw check)

- Triplet grids in 4/4 are lag, not swing (§3.3) — 4 of 4 opened.
- The section builder keys on LH class, so class-change-at-boundary rates are circular; the register finding was re-measured on raw bars.
- `tresillo` in the analysis includes beat 4; use slot 6 / slot 14.
- Token-shape "holds" undercount because inversions and spread re-seat the octave reference; the rhythm-hold number is the trustworthy one.
- `arp_mixed`/`mixed` are residual buckets; every headline about "arps" was checked by opening the bars.
- Game-lane velocities are quantised — the accent table has nothing to say about game.

---

# LANE 3 — THE MELODY (the right hand's top voice as a hook grammar)

**CORRECTION FROM THE VERIFY PASS (the r33 solo-vs-mix trap, again).** This
lane's engine comparison ("the engine already repeats MORE than pop: 84%
bar-rhythm repeat, 78% pitch, lag-1/2/4 56%") was measured on the judged
songs' `_lead` SOLOS. Re-measured IN THE MIX (the lead sound inside the solo's
register, first 32 sounding bars) the engine is **59% rhythm / 30% pitch /
35% lag-1/2/4 — UNDER pop's 70% / 57%**. So rule 1 below reads the wrong way:
the engine does not over-repeat; in the mix it repeats less than pop AND
never returns a hook after contrast. The missing-mechanism list in §7 stands
(a 2-bar cell with frozen body + landing re-fit, the non-local return, the
barline anticipation, the dotted-member exemption, a pentatonic supply, the
chorus device, a restruck-pitch mode); the premise that the engine's
repetition is already sufficient does not.


Scope: the RH's top voice — the highest note per onset of the RH track (`topVoice()` in
`scripts/analyze-toppack-r34.mjs`, onsets grouped at a 1/48-bar tolerance). For a chordal RH
this is the tune PLUS its own peaks, so every number below is "the top of the right hand",
not a vocal transcription; where that matters (thickness, phrases on legato arrangements) it
is said. Cards at the end are ORIGINAL hooks composed from the extracted rules — no pack tune is
transcribed (copyright), exactly as the r33 labs composed from the nocturne rules.

Populations and n:
- `_analysis.json` medians by lane: one file per song, the fullest non-easy version (311 songs).
- Raw-note sweep (`mel-sweep.mjs` in this scratchpad): the same dedupe, **4/4 songs only** (264;
  grid measures are meaningless in 3/4 and 6/8), and for the odd-16th classification a further
  exclusion of 54 off-grid files (odd-16th share > 40%: swung / 12-8-in-4/4 / tempo-drifted
  arrangements — paradise_coldplay is 90% "odd 16th", good_time's onsets sit 2.4 sixteenths
  apart) → **210 on-grid songs**. The first pass reported per-song MEDIANS of the odd-16th classes,
  which gave 0.0% for classes most songs have none of; the pooled numbers replaced them.
- Engine side: the 47 `songs.html` leads (`_lead` solo, first ≤ 32 bars; `mel-engine.mjs`) for
  the repetition numbers, and the r33 in-mix numbers (research/melody-grammar-r33.md) for the rest.

Definitions used throughout (the analyzer's, verbatim where it has one): step = |Δ| ≤ 2 st;
leap > P5 = |Δ| > 7; NCT = top-voice pc not in the HALF-BAR chord's pcs; NCT step-resolved = next
note within 2 st AND a chord tone; strong-beat gradient = chord-tone rate on beats 1/3 minus overall;
odd-16th = onset slot (of 16) is odd; final-slot short = a note ≤ a 16th in slot 15, as a share
of all ≤-16th notes; pentatonic = pc in the key's major/minor pentatonic; phrase = broken by a
gap ≥ a beat or a note ≥ 2 beats; `rhythmRepeatShare` = bars whose 16-slot onset skeleton equals
ANY earlier bar's; `hook` = the most repeated 2-bar (rhythm + interval) cell.

## 1. The pop hook grammar vs game, film, the r33 bands and the engine

| cell | n | step | leap>P5 | repeat | NCT | NCT step-res | gradient | odd16 | final-slot short | pent | rhythm-rep | pitch-rep | hook x | phrase bars | rest | range | dyad / 3+ | onsets/bar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pop | 64 | 32% | 6% | 28% | 40% | 35% | +3 | 9% | 3% | 89% | 70% | 57% | 6 | 1.74 | 11% | 26 | 24% / 6% | 5.1 |
| ballad | 78 | 38% | 6% | 23% | 37% | 41% | +5 | 19% | 4% | 82% | 62% | 39% | 4 | 1.94 | 10% | 28 | 21% / 10% | 5.3 |
| rock | 41 | 30% | 6% | 28% | 34% | 32% | +5 | 8% | 3% | 83% | 66% | 49% | 6 | 1.82 | 14% | 29 | 28% / 15% | 5.2 |
| edm | 16 | 32% | 6% | 25% | 37% | 30% | +8 | 19% | 2% | 85% | 71% | 55% | 5.5 | 1.69 | 15% | 31 | 21% / 2% | 4.7 |
| hiphop | 11 | 21% | 10% | 36% | 31% | 26% | 0 | 21% | 3% | 91% | 81% | 70% | 6 | 2.42 | 17% | 22 | 28% / 19% | 6.1 |
| **game** (Zelda OoT etc.) | 41 | 40% | 9% | 3% | 44% | 39% | +2 | 30% | 5% | 69% | 50% | 19% | 2 | 1.69 | 3% | 24 | 11% / 0% | 4.3 |
| **film** | 28 | 42% | 13% | 12% | 35% | 47% | +6 | 42% | 6% | 76% | 69% | 26% | 4 | 1.55 | 5% | 29 | 16% / 5% | 5.0 |
| classical | 21 | 40% | 14% | 7% | 41% | 44% | +4 | 41% | 7% | 67% | 79% | 29% | 4 | 1.50 | 10% | 43 | 13% / 3% | 7.1 |
| r33 reference bands | — | 28–57% | 1.7–6.5% | — | 25–52% | 41–52% | +6..+17 | 10–27% | 2.6–7.5% | — | 73–82% cell reuse | 17–28% | — | — | — | — | — | — |
| **engine** (songs.html, in mix) | 47 | **16%** | **19%** | — | **~2%** | **8%** | ~0 | **30%** | **32%** (companion 71%) | — | **84%** | **78%** | 4 | — | — | — | 27% | — |

Emotion cells (n ≥ 5, medians): the pop family is flat across emotions on the grammar numbers —
ballad/sad (29) 36% step / 40% NCT / 88% pent / 63% rhythm-rep; pop/excited (12) 33 / 39 / 92 / 71;
pop/happy (11) 29 / 39 / 87 / 72; rock/dark (8) 35 / 41 / 84 / 67; edm/excited (5) 34 / 45 / 91 / 76.
What emotion moves is not the grammar but repeat share (pop/excited 36% repeated pitches vs
ballad/romantic 18%), phrase length (ballad/calm 3.3 bars, ballad/nostalgic 3.7 vs pop/nostalgic
1.1) and thickness (rock/dark 33%/17% vs edm/excited 0%/0% — synth-style single lines).
game/calm (7) is the one cell with a NEGATIVE strong-beat gradient (−15 pts) and 28.5% final-slot
shorts — the OoT files, thin 2-voice transcriptions.

Where POP differs from GAME and FILM:
- **Repetition of pitch**: pop repeats the same pitch 28% of moves, game 3%, film 12%. Pop hooks
  restrike; game and film tunes walk.
- **Pitch-repeat share** (a bar identical in rhythm AND pitch to an earlier bar): pop 57%, game
  19%, film 26%. Game repeats rhythm as much as pop (50–69%) but re-pitches it.
- **Stepwise**: pop 32% vs game 40% / film 42%; pop is the LEAST stepwise lane after hiphop, yet
  every lane is 2–2.6x the engine's 16%.
- **Odd 16ths**: pop 9%, game 30%, film 42% (film/classical are the pickup-run populations, see
  §1.1). Pop's few odd 16ths are a different animal (dotted 3+3+2 members).
- **Thickness**: pop 24% dyads / 6% triads under the top; game 11% / 0%.
- **Rest**: pop 11%, game 3% — pop hooks breathe; game loops do not.
- **Climax**: pop's highest note sits at 34% of the song (verse→first chorus), game 44%, film 57%.

Spot checks against raw notes (named files):
- counting_stars (pop/excited, E major, 120): bars 0–3 = |0 4 8 12| |0 2 4 6 8(held 10/16)|
  |2 4 6 8 10 12 14| |0 4 8(held 8/16)|; bars 4–6 identical, bar 7 varies only the approach into
  the same held e5 (`[0:G#5/2 2:F#5 4:F#5 6:C#5 8:E5/8]` vs `[0:G#5/4 4:C#5/4 8:E5/8]`).
- call_me_maybe (pop/happy, G major): chorus (bar 13+) is one 2-bar cell, skeleton
  `|4 8 9 11 14|6 8 9 11 14|`, 6 statements; slots 9 and 11 are a 16th run member and a dotted
  member (8–11–14 = 3+3+2) — the probe classifies them exactly so.
- shape_of_you (pop, C#m, 190): bars 0–2 `[0:C#4/6 6:E4/6 12:C#4/4]` frozen over C#m, F#m, A;
  bar 3 `[0:D#4 6:C#4 12:B3]` over B. Verse (bar 8+): e4 restruck 5–6 times a bar.
- faded (Rousseau cover, F#): the chorus at bar 78 is the tune doubled in octaves on 16th chords.

### 1.1 The D123 grid law on pop: what the odd 16ths ARE (pooled, 210 on-grid songs)

Classification per odd-16th onset, in order: **pickup** = next onset within a 16th (D123's
pickup/run pair); **run** = previous onset within a 16th; **dotted** = the previous or next onset
exactly 3 sixteenths away (a dotted-8th / 3+3+2 member); **anticipation-tied** = none of those
and the note sounds through the next 8th-grid point (≥ 3/16); **isolated short** = the rest.

| lane | songs | odd16 share of onsets | pickup | run | dotted 3+3+2 | anticip-tied | isolated short | isolated as % of ALL onsets |
|---|---|---|---|---|---|---|---|---|
| pop | 49 | 8.7% | 48% | 17% | **28%** | 2% | 4% | **0.4%** |
| ballad | 56 | 14.6% | 67% | 16% | 13% | 1% | 3% | 0.4% |
| rock | 29 | 8.8% | 64% | 13% | 16% | 2% | 4% | 0.4% |
| edm | 14 | 19.5% | 47% | 29% | 14% | 1% | 9% | 1.7% |
| hiphop | 10 | 18.4% | 60% | 19% | 18% | 0% | 3% | 0.6% |
| game | 24 | 19.6% | 75% | 13% | 11% | 1% | 0% | 0.1% |
| film | 13 | 7.8% | **90%** | 6% | 4% | 0% | 1% | 0.1% |
| classical | 6 | 29.0% | **97%** | 3% | 0% | 0% | 0% | 0.0% |

Verdict on the grid law: **borne out on game/film/classical** (75–97% of odd 16ths are
pickup/run pairs, isolated shorts ≤ 0.1% of onsets), and **borne out on pop with one amendment**:
28% of pop's odd 16ths are DOTTED-8TH members — call_me_maybe's 8-11-14, piano_man (256 of 704),
sky_full_of_stars (101 of 101), a_thousand_miles (71 of 315). `gridSnapMelodyEntry` would snap
slot 11 to 10 and slot 3 to 2, straightening the pop syncopation. Tied anticipations by a 16TH are
rare everywhere (≤ 2%); the pop anticipation is by an EIGHTH: slots 14/15 carry 12–13% of all
onsets in every pop-family lane (game 10%, film 11%), and of the slot-15 onsets 19–28% sustain
across the barline (edm 49%). The D118 shape — a short note in the bar's final 16th — is 2.9% of
pop's short notes (pack column "final-slot short") and 0.4% of all pop onsets; the engine's lead
puts 32% of its shorts there. Nothing in this pack does that.

## 2. Repetition IS the hook — cell mechanics

`rhythmRepeatShare` (bars repeating ANY earlier skeleton): pop 70%, rock 66%, edm 71%, hiphop 81%,
ballad 62%; game 50%; classical 79% — but classical's median song carries **47 distinct
skeletons over 133 bars** while pop carries 25 over 91 and game 8 over 16. Pop's repetition is a
small vocabulary restated; classical's is a large vocabulary with local echoes.

Where the repeat sits (raw sweep, 4/4, medians per song; `lag k` = the bar k earlier has the same
skeleton):

| lane | distinct skeletons / bars | = lag 1 | = lag 2 | = lag 4 | = any of 1/2/4/8 | 2-bar pair = previous pair | 2-bar pair = 4 bars ago |
|---|---|---|---|---|---|---|---|
| pop | 25 / 91 | 10% | 16% | **22%** | 43% | 4% | 11% |
| ballad | 31 / 78 | 9% | 13% | 18% | 37% | 2% | 8% |
| rock | 22 / 95 | 12% | 25% | 24% | 44% | 12% | 12% |
| hiphop | 9 / 33 | 38% | 48% | 29% | 75% | 25% | 13% |
| game | 8 / 16 | 13% | 29% | 15% | 47% | 13% | 0% |
| film | 18 / 70 | 18% | 23% | 17% | 44% | 7% | 7% |
| **engine leads** | **5 / 32** | 56% (lag 1/2/4 combined) | | | | | |

So in pop the strongest single period is **4 bars** (22%) and 70% − 43% = **27 points of the
repetition is non-local** — the hook RETURNS after contrasting material (verse → chorus →
verse), it does not loop. Hiphop is the loop lane (lag-1 38%, lag-2 48%). The engine's leads sit
at the hiphop end: 84% rhythm repeat, 78% pitch repeat, 5 distinct skeletons in 32 bars, lag
1/2/4 in 56% of bars — **the engine already repeats MORE than pop; what it lacks is the
VARIATION of the repeat and the non-local return**.

How the repeat varies (pooled over bars whose skeleton equals one 1/2/4/8 bars earlier):

| lane | bars | identical pitches | ONE note differs | chromatically transposed | same contour, re-fit | free re-fit |
|---|---|---|---|---|---|---|
| pop | 2,271 | **57%** | 11% | 6% | 7% | 20% |
| ballad | 1,845 | 49% | 15% | 6% | 9% | 21% |
| rock | 1,664 | 44% | 12% | 4% | 15% | 25% |
| hiphop | 289 | 56% | 2% | 7% | 8% | 27% |
| game | 388 | 30% | 11% | 10% | 26% | 24% |
| film | 670 | 19% | 19% | 7% | 24% | 32% |
| classical | 713 | 6% | 2% | 11% | 36% | 45% |

The hook cell of pop, in words: a 2-bar rhythm+interval cell (the `hook` field: pop median 6
statements; the_scientist 14, steal_my_girl 26, rain_piano 65) whose second bar ends on a held
note; stated with identical pitches over the 4-bar loop's first chords, with the pitches re-fit
(chord-tone landing changes, body kept) on the chord that does not accept them, and returning
across sections. Literal transposition is 6% — the pack agrees with his "transposition is not
variation". Per lane the chorus uses about 4 distinct skeletons (call_me_maybe chorus: 3 —
`|4 8 9 11 14|`, `|6 8 9 11 14|` and `|6 8 10 12 14|`).

Four pop RHs read bar by bar (cell mechanics in words + skeleton strings):
- **call_me_maybe** (chorus bars 13–24): cell A `|4 8 9 11 14|` + cell B `|6 8 9 11 14|`, a 4-bar
  unit A B C B′ (C = `|6 8 10 12 14|` b5 c6 b5 g5) restated over 8 bars; on the restatement only
  cell A's last two pitches change (`14:D5` → `14:E5`, `13:G5` → held `12:B5/6`). Grade: one-note.
  Verse (bars 2–9): 2-bar comp cells `|2 4 6 8 10 12 14|` in 3rds/6ths repeated exactly x2, x2.
- **shape_of_you**: 3+3+2 (`|0 6 12|`) frozen in pitch over three chords, re-pitched over the
  fourth; the verse is one pitch restruck (rep = 36% for the hiphop-adjacent lane). Grade: identical
  x3, free re-fit x1 — per 4 bars.
- **counting_stars**: a 4-bar phrase stated twice; bar 4 of the restatement fills the approach
  (2 → 5 onsets) into the same held landing. Grade: identical x3 + free re-fit x1 per 4 bars, at
  the phrase level.
- **faded** (Rousseau cover): intro bars 0–5 a 2-bar cell `|6 12|2 7 13|` etc. over D#m B F# C#
  with pitches re-fit; the chorus (bar 78+) is the same tune in octaves on 16th chords, 11 onsets
  a bar — the top-voice measure there counts the RH's rhythmic chords, not the sung line (the
  chordal-RH caveat).

## 3. Pentatonic with passing tones

| lane | n | pent (median) | non-pent share (raw) | of which in-scale | on a beat | on beats 1/3 | resolved by step | ≤ an 8th |
|---|---|---|---|---|---|---|---|---|
| pop | 61 | 89% | 11% | 100% | 44% | 24% | 75% | 65% |
| ballad | 64 | 82% | 18% | 100% | 44% | 23% | 75% | 67% |
| rock | 37 | 83% | 17% | 100% | 42% | 23% | 61% | 68% |
| hiphop | 11 | 91% | 9% | 100% | 41% | 27% | 80% | 86% |
| game | 31 | 69% | 31% | 71% | 58% | 33% | 64% | 64% |
| film | 21 | 76% | 25% | 87% | 42% | 26% | 57% | 76% |
| classical | 13 | 67% | 35% | 62% | 32% | 15% | 42% | 89% |

Which degrees (pooled non-pentatonic notes, semitones above the tonic): major-key pop (43 songs,
2,610 notes): **4 (5 st) 58%, 7 (11 st) 31%**, then #4 4%, b7 3%; major ballad: 7 44%, 4 41%,
b7 8%. Minor-key pop (18 songs, 1,360): **b6 (8 st) 56%, 2 (2 st) 32%**, b2 8%; minor ballad 2 52%,
b6 37%. Game major spreads: 4 29%, 7 21%, b7 18%, b2 13%, b3 9% — the modal/chromatic lane.

So yes: pop melody IS pentatonic-with-passing-tones. The non-pentatonic notes are in-scale (100%
median in every pop-family lane), land on 4 and 7 (major) / 2 and b6 (minor), sit on any beat
about uniformly (44% on a beat is what 8th-note writing gives) but avoid beats 1/3 (24%, vs a
uniform 25% of slots — i.e. no avoidance beyond uniform; the strong-beat gradient of +3..+5 pts is
the whole story), are short (65% ≤ an 8th) and three-quarters step-resolved. Spot: counting_stars
bar 2 `8:A5/2` (degree 4, beat 3, an 8th, over B, → g#5 step); perfect bar 4 `11:C#5` (4, slot 11,
under a 16th, → d#5), bar 15 `6:C#5` (4, off-beat, → c5 step).

## 4. Chordal thickness under the top voice ("melody is chord too", D98)

Raw thick share (2+ notes at the onset, medians): pop 35%, ballad 39%, rock 53%, hiphop 68%,
edm 28%; game 21%, film 23%, classical 15%.

| lane | thick share | phrase-final thick | phrase-first thick | downbeat thick | on-beat thick | off-beat thick | thick note ≥ a beat |
|---|---|---|---|---|---|---|---|
| pop | 35% | 43% | 34% | **46%** | 41% | 28% | 20% |
| ballad | 39% | 54% | 48% | 62% | 51% | 30% | 36% |
| rock | 53% | 65% | 59% | 67% | 61% | 42% | 17% |
| hiphop | 68% | 100% | 100% | 79% | 63% | 64% | 23% |
| game | 21% | 33% | 15% | 29% | 21% | 14% | 36% |
| film | 23% | 22% | 23% | 25% | 28% | 6% | 49% |

Interval directly under the top (pooled thick onsets): pop (11,060) **3rd 30%, 4th/5th 30%,
octave 23%, 6th 13%**, 2nd 3%; ballad (9,996) octave 33%, 3rd 31%, 4/5 22%; rock 4/5 35%; edm
octave 44%; game 3rd 42%, 6th 24%, octave 9%. Where: downbeats and phrase landings are the thick
places (pop 46% / 43% vs off-beats 28%); the chorus is the thick section (§6: 17% → 59%).
Spot: how_to_save_a_life bar 40–42 every note `A#5+A#4`, `C6+C5` (octaves, ivl 12); you_say bar 39
`A5+E5+C5+A4` four-note chords under every 8th; call_me_maybe verse comps `D5(G4,D4)` in 4ths/5ths
and `B4(G4)` 3rds on the off-8ths.

## 5. Phrases

| lane | phrases/song | median bars | pickup start | held landing ≥ 2 beats | answer ends lower | higher | same | even-phrase ends on tonic | odd-phrase | bar 2 lower than bar 1 | higher |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pop | 26 | 1.74 | 11% | **56%** | 35% | 38% | 29% | 25% | 30% | 36% | 35% |
| ballad | 22 | 1.93 | 17% | 67% | 39% | 33% | 25% | 26% | 25% | 37% | 38% |
| rock | 24 | 1.82 | 8% | 68% | 42% | 32% | 25% | 15% | 17% | 37% | 37% |
| edm | 32 | 1.69 | 17% | 79% | 45% | 35% | 20% | 30% | 30% | 40% | 42% |
| hiphop | 8 | 2.42 | 0% | 11% | 50% | 40% | 25% | 33% | 38% | 39% | 25% |
| game | 13 | 1.75 | 0% | **100%** | 29% | 48% | 14% | 25% | 13% | 40% | 50% |
| film | 26 | 1.50 | 10% | 84% | 35% | 44% | 17% | 25% | 22% | 45% | 35% |

Contours pooled (all lanes): flat 41%, arch 38%, fall 12%, rise 10%. Range pop 26 st, ballad
28, film 29; climax at 34% (pop) / 49% (ballad) of the song.

- **Question/answer by DIRECTION does not exist**: the answer ends lower 35%, higher 38%, same
  29% (pop) — matching his nocturne verdict that both falling and rising answers passed. The
  bar-pair version (last note of bar 2 vs bar 1) is 36/35 too.
- **The bar-4 close is weak but real**: last onset of bar 4 of a 4-bar unit on the tonic 26% vs
  bar 2 23% (pop); on the sounding chord's root 13% vs 10%; held ≥ 2 beats 7% vs 6% (ballad 13%
  vs 9%, game 44% vs 33%).
- **The held landing is the phrase device**: 56% of pop phrases (game 100%, film 84%) end on a
  note ≥ 2 beats; hiphop 11% (rhythmic hooks run on).
- **Pickups** (phrase starts in the last quarter of the previous bar): pop 11%, ballad 17%, game
  0%. Rarer than I expected; the pop pickup is the 8th-anticipation of §1.1, not a phrase pickup.
- Caveat: on legato piano arrangements the gap/hold phrase rule under-segments — faded's first
  "phrase" runs 6.9 bars because nothing rests a beat; counting_stars segments cleanly (2.13 /
  1.88 / 2.13 / 1.88 bars, endings held 2.5 / 2.0 beats).

## 6. Verse vs chorus — what changes at the lift

Method: `form.sections` (a texture state persisting ≥ 4 bars); verse = the first section with
RH density ≥ 2 onsets/bar and ≥ 4 bars, chorus = the highest-register later such section, lift
between 5 and 19 st (the first pass compared against RH-silent intros and produced "+93 st";
fixed). 117 of 264 songs qualify.

| lane | n | register | RH onsets/bar ratio | RH note length ratio | thick share | rhythm-repeat inside the section | LH onsets ratio | velocity Δ |
|---|---|---|---|---|---|---|---|---|
| pop | 22 | **+8.5 st** | 1.04 | **1.00** | 36% → 54% | 29% → 28% | **x1.39** | +0.3 |
| ballad | 35 | +12 | 0.95 | 1.00 | 20% → 54% | 41% → 25% | x1.52 | +8.6 |
| rock | 23 | +12 | 0.89 | 1.00 | 47% → 81% | 54% → 38% | x1.35 | +11 |
| edm | 9 | +12 | 0.93 | 0.94 | 8% → 69% | 44% → 33% | x0.71 | +7.8 |
| film | 14 | +10 | 1.13 | 1.00 | 18% → 22% | 58% → 36% | x1.22 | +16 |
| all | 117 | +10 | 0.98 | 1.00 | 17% → 59% | 44% → 29% | x1.32 | +6.4 |

The surprise: **the chorus does not slow down and does not thin out** (note length ratio 1.00 in
every lane, density ~1.0), and **repetition FALLS** inside the chorus rather than rising. The lift
is REGISTER (+8.5–12 st, i.e. the tune an octave up more often than not), THICKNESS (17% → 59%
thick onsets: octaves and 3rds/6ths under the tune, §4), and a DENSER LEFT HAND (x1.3–1.5), with
velocity up in ballads/rock/film and flat in pop/edm (which lift by texture, not touch).

Ten named pop/ballad lifts (verse bars → chorus bars; RH onsets/bar; note length in beats;
thick; rhythm-repeat; LH class(onsets/bar); velocity):
- you_say (ballad): 0 → 39, +19 st, 15.8 → 5.4 onsets (the RH-density exception: a 16th intro),
  0.24 → 0.47 beats, thick 0% → 100%, LH pedal(2.5) → arp_mixed(14.5), vel 64 → 95
- how_to_save_a_life (ballad): 0 → 39, +19, 4.7 → 3.8, 0.47 → 0.95, thick 0% → 93% (octaves), LH
  alberti(5.3) → alberti(6.9), vel 64 → 79
- sign_of_the_times (ballad/epic): 0 → 69, +17, 5.9 → 6.7, 0.24 → 0.31, thick 20% → 100%, LH
  block(9.2) → arp_mixed(14), vel 64 → 96
- wheres_my_love (ballad): 0 → 59, +16, 9.7 → 2.5, 0.24 → 0.95, thick 0% → 92%, LH pedal(1) →
  alberti(6.8), vel 64 → 93
- battle_scars (pop): 0 → 7, +17, 6.4 → 8.0, 0.49 → 0.49, thick 44% → 100%, rep 14% → 80%, LH
  pedal(4) → stride(10.8)
- hard_out_here (pop): 0 → 18, +15, 6.6 → 5.7, 0.49 → 0.50, thick 0% → 79%, LH mixed(12.5) →
  comp(19.3)
- safe_and_sound (pop): 0 → 16, +14, 4.1 → 6.5, 0.50 → 0.50, thick 0% → 50%, LH pedal(4.9) →
  pedal(3.8), vel 90 → 90
- heaven_bryan_adams (ballad): 0 → 33, +13, 5.7 → 6.3, 0.47 → 0.47, thick 35% → 80%, LH
  arp_mixed(7.5) → arp_mixed(13.2), vel 64 → 96
- somewhere_only_we_know (ballad): 0 → 74, +16, 8.0 → 4.3, 0.47 → 0.47, thick 100% → 65%, LH
  comp(20.6) → pedal(10), vel 80 → 81
- no_time_to_die (ballad/dark): 0 → 56, +15, 6.8 → 4.2, 0.47 → 0.95, thick 2% → 84%, LH
  pedal(1.1) → alberti(9.4), vel 49 → 88

Read as a rule: a ballad chorus doubles the tune in octaves over an arpeggio that runs twice as
many notes; a pop chorus stacks 3rds/6ths (or full chords: you_say) under the tune over a comp
that is ~40% busier; the melody's rhythm is the verse's rhythm.

## 7. What the engine already has, and what it does not

Read against `src/binder/bind.js` (bindMelody) and `scripts/audition-songs.mjs` (melodyRhythm):

| pop property (measured) | engine knob | status |
|---|---|---|
| a rhythm cell restated every bar (pop 70% bars repeat) | the cell is ONE bar of scale-step offsets; `bars[c % B]` re-uses the retrieved rhythm entry every bar; motif bars restate the cell exactly | **has it — too much**: 84% rhythm / 78% pitch repeat, 5 skeletons per 32 bars, period 4–8 |
| pitches re-fit to the chord under a kept rhythm (pop 20% + 11% one-note) | `ladderStep(center, offset, supply)` per chord + `ARCH` centers; answer bars `varyTail` | **partial**: the ladder re-fits, but from a moving center (the arch), not from a frozen body with a chord-tone landing; there is no "freeze the body, change the landing" grade |
| a 2-bar cell whose bar 2 differs from bar 1 | none — bars with a different onset count get `resampleShape` of the SAME offsets | **missing**: the engine's cell is 1 bar; a 2-bar identity with a contrasting second bar is not expressible |
| non-local return of the hook after contrast (27 pts of pop repetition) | `letterCellMemo` gives each LETTER its own cell; `restatements`/`repeatMode` | **partial**: A returns at its statement, but the hook's cell is not re-cited inside B/C |
| held landing ≥ 2 beats on 56% of phrases | `hold`, `minNote`, `heldFirst` (rhythm retrieval by min IOI), cadence-bar thinning (`tailOff`) | **has it** (D64/D98); the r33 grammar's "landing held ≥ a quarter" is looser than pop's 2 beats |
| pentatonic body, 4/7 short + weak + step-bracketed | supply ladder is the full key scale (`makeScaleOf` tensions `triadic`), `tissue` writes between-neighbour passing tones, `approachProb` | **partial**: no pentatonic supply option; `tissue`'s passing tones are step-bracketed by construction but their DURATION/beat placement is whatever the cell slot is |
| strong-beat gradient +3..+8 | anchors snap to chord tones on accented slots (`ACCENT_THRESHOLD`) | has it (the gradient came out flat only because NCT ≈ 0 everywhere) |
| stepwise 30–40%, leaps > P5 ≤ 6% | `leapFold`, `tissue` leap budget (one > P5 per phrase) | **has the knobs**, r33-gated; measured 16% / 19% before them |
| odd 16ths = pickups/runs OR dotted 3+3+2 members | `gridSnapMelodyEntry` exempts pickup/run pairs only | **amendment needed**: a slot 3 sixteenths from its neighbour (dotted member) must also pass, or pop syncopation snaps straight |
| 8th anticipation tied over the barline (12–13% of onsets at slots 14/15) | `tokens()` is legato within the bar; nothing ties ACROSS the bar | **missing**: the engine cannot write a note that starts on the last 8th and sustains into the next bar (mini-notation `<>` bars end at the barline; the cards use a `/8`-slowed flat sequence to do it) |
| final-slot short 2.9% of shorts | `minNoteLast` + L2 merge (r33 default `noJitter`) | fixed for fresh songs; judged songs still 32% |
| thickness on downbeats/landings, 3rds/6ths (D98) | `chordTop` (the bar's LONGEST note ≥ `chordMinBeats`, 3rds/6ths, floor G3) | **partial**: one note per bar; pop thickens 35% of onsets, the chorus 54% |
| chorus = +8–12 st, dyads, LH x1.4, same note lengths | `LEAD_CURVE`, section letters, `varyLeadVoice`, breakdown | **missing as a device**: nothing moves the tune up an octave with dyads at a section while keeping its rhythm; the engine's sections change VOICE and gain, not register-plus-thickness |
| repeated-pitch hooks (pop 28% of moves, hiphop 36%) | `mergeRepeats` MERGES consecutive same pitches; `maxRepeat` caps them | **actively removed**: D65's merge law makes the restruck-pitch hook (shape_of_you verse, rap_god) unwritable for the lead |

The missing mechanisms, named: (1) **the 2-bar cell with a frozen body and a re-fit landing**
(grades identical / one-note / re-fit chosen per statement, not a re-seeded walk); (2) **the
non-local hook return** (cite the A cell inside later letters); (3) **the barline anticipation**
(a note beginning on the last 8th that sustains into the next bar); (4) **dotted-member exemption
in the grid law**; (5) **a pentatonic supply with 4/7 confined to short weak slots**; (6) **the
chorus device** (register + thickness + LH density with the rhythm held); (7) **a restruck-pitch
mode** that bypasses `mergeRepeats` for hook cells.

## 8. Rules extracted (each with the measurement behind it)

1. **Repeat a 2-bar cell, do not loop a bar.** Pop repeats a skeleton in 70% of bars, but at lag
   1 only 10%, lag 4 22%; hiphop is the lag-1/2 lane (38%/48%). Engine: 84% repeat, lag 1/2/4 56%.
2. **Vary the repeat by grade, never by transposition.** Pooled pop repeats: identical 57%, one
   note 11%, re-fit 20% + 7%, chromatic transposition 6%.
3. **Freeze the body over the chords that accept it, re-fit only where they do not**
   (shape_of_you 3 + 1; call_me_maybe's last-two-notes change).
4. **Pentatonic body; 4 and 7 (2 and b6 in minor) short, weak, step-bracketed.** 89% pent; 100%
   of the rest in-scale; 65% ≤ an 8th; 24% on beats 1/3; 75% step-resolved.
5. **Anticipate by an 8th, on the last 8th of the bar, and let it ring.** 12–13% of onsets at
   slots 14/15; 19–28% of slot-15 onsets tied over. A 16th anticipation is rare (≤ 2%).
6. **Odd 16ths are pickups, runs, or dotted 3+3+2 members — never isolated** (pop 48/17/28%;
   isolated 0.4% of onsets). Amend the grid law for dotted members.
7. **End the phrase on a note held ≥ 2 beats** (pop 56%, ballad 67%, game 100%); direction of
   the answer is free (35/38/29 lower/higher/same); bar 4 closes slightly more than bar 2
   (tonic 26% vs 23%).
8. **Thicken the downbeats and the landings with 3rds/6ths or octaves** (pop downbeat 46% vs
   off-beat 28%; 3rd 30%, 4/5 30%, octave 23%, 6th 13% under the top).
9. **The chorus lifts by register (+8.5–12), thickness (17 → 59%) and LH density (x1.3–1.5) — the
   melody's rhythm and note lengths stay** (ratio 1.00, 117 songs).
10. **The pop interval mix is a third steps, a quarter repeats, leaps ≤ a 5th** (32 / 28 / 6%);
    film is the stepwise lane (42%), hiphop the restruck lane (36% repeats).
11. **Rest is part of the hook**: pop 11% rest vs game 3%.

## 9. Open questions an ear must settle (the cards)

- Is the frozen cell's sus4/6th over the moving chord a hook or a clash? (`pl_melody_hook_repeat`
  frozen vs refit; `pl_melody_tresillo_frozen`)
- Is the one-note landing change audible as variation, or is it below his threshold like the r33
  surgical repairs? (`hook_repeat/last_note`)
- Which period reads as a sung hook — 1, 2 or 4 bars? (`pl_melody_cell_period`)
- Do short weak 4/7 read as smoother than pure pentatonic, and do held strong-beat 4/7 read as
  colour (sus, maj7) or as mistakes? (`pl_melody_pent_passing`)
- 8th anticipation tied over vs on-beat vs 16th push vs the D118 final-slot 16th vs the dotted
  head. (`pl_melody_anticipation`)
- Is interval SIZE (not harmony) what makes the engine's lines unsingable? (`pl_melody_step_leap`
  engine_leaps: same rhythm, all in key, 40% leaps > P5)
- Is the held landing load-bearing? Is a higher-ending answer as good as a tonic one?
  (`pl_melody_phrase_qa`)
- Dyads where — landings only, everywhere in 3rds, octaves, 4ths/5ths? (`pl_melody_thickness`)
- Does the chorus land in the as-measured shape, and which variable carries it: octave, dyads,
  or the LH? Does a longer-note chorus feel bigger or slower? (`pl_melody_chorus_lift`)
- Does the grammar transfer to a sad minor loop at 76 on flute; is the transplanted major hook
  wrong or just less sad; does rules-off sound like the engine? (`pl_melody_transfer_loops`)

## 10. Cards (`cards-melody.json`, 10 cards, 44 variants, validator: 0 problems)

Every hook is original; beds are C G Am F (I V vi IV, the pack's most common loop) with a piano
broken-8th LH at 0.45 and a kick/hat/snare at 0.3 under a lead at 0.55–0.75 (D77 holds by
construction; the probe puts the hook's lowest note above the LH's top (c4) on every variant
except three: `thickness/octaves_throughout` (the doubled octave dips to b3), and card 8's
verse hook, which is written an octave down so the chorus can lift — its landing c4 MEETS the
LH's c4 and the `thick_lh_only` chorus dyads reach a3; a register collision by design of the
verse, stated here so it is not mistaken for a support layer sitting over the tune).
Measured properties of the hooks (scratchpad `mel-cards-probe.mjs`, run on the final JSON):

| card | reference variant (measured) | falsification(s) (measured) |
|---|---|---|
| hook_repeat | 2-bar cell x4 re-fit: 2 skeletons, 75% rhythm repeat, 4 held landings, 0 leaps > P5 | transposed (c#/f# declared, 28% non-pent); no_repeat: 8 skeletons, 0% repeat |
| cell_period | 4-bar x2: 4 skeletons, 50% repeat, lag-4 only | one_bar_x8: 1 skeleton, 88% repeat, no held landing (caveat stated on the card) |
| pent_passing | 8/40 non-pent, all short, 0 on beats 1/3, all step-resolved | strong_held: 16/16 on beats 1/3, 0 short; by_leap: 0/16 step-resolved |
| anticipation | slot-14 note sustained 0.375 bar across the barline (`/8` flat sequence) | d118_final_slot: 4 slot-15 16ths + a 10-st leap; dotted_head 13% odd16 with 0 big leaps |
| step_leap | pop_mix 29% step / 34% repeat / 0 big | engine_leaps 6% step / 40% > P5; film 62% step; rap 57% repeats |
| phrase_qa | 4 landings ≥ 2 beats, Q on a5 (3rd of IV), A on c5 | no_held_landing: 0 holds, 6 onsets/bar |
| thickness | single 0% thick | ends_and_downbeats 38%; thirds/octaves/fourths 100% |
| chorus_lift | verse→chorus: +12 st, 4.5→4.5 onsets/bar, note length 0.188→0.188, thick 0→44%, LH 8→12/bar | longer_notes: 4.5→3.0, 0.188→0.375; register_only; thick_lh_only (+0 st) |
| transfer_loops | minor hook 60% step, 6% > P5, 4 held landings, flute low g4 above the LH top e4 | rules_off: 0% step, 67% > P5, 6 skeletons, 0 holds, 4 final-slot 16ths |
| tresillo_frozen | frozen `0 6 12` x3 + re-pitched 4th bar, 1 skeleton | straight_quarters (same note lengths, rest on beat 4); one_pitch 87% repeats; d118_tail 8 slot-15 16ths |

## 11. Honesty ledger — what was corrected and what could not be measured

- Per-song MEDIANS of the odd-16th classes read 0.0% for anticipation and isolated shorts (most
  songs have none); replaced by pooled counts, and 54 off-grid files (odd16 > 40%) excluded —
  before the exclusion "isolated short" was 13% of pop odd-16ths, driven by swung/12-8 files.
- The first lift table compared against RH-silent intros (+93 st); now verse = first ACTIVE
  section, lift bounded 5–19 st.
- My own cards: the first anticipation reference was built from a mangled string (136 grid units
  over 8 bars, grid skewed); the one-bar cell had a 9-st leap over F; the dotted and D118 variants
  carried a 10-st leap the on-beat variant lacked (leap confound; fixed on dotted, kept and
  declared on D118 because the leap IS the engine's shape); card 6's falsification still held two
  landings; card 8's chorus was 22% thick against the pack's 54% (now 44%); card 9's LH arpeggio
  reached the flute's lowest note; card 10's quarters variant had a 2-beat hold the tresillo did
  not. All found by the probe, none by the validator.
- Not measured: the SUNG melody where the RH is chordal (faded's chorus top voice is the comp's
  peaks); microtiming/swing (grid-quantised at 16ths; the excluded files are exactly the swung
  ones); whether pop's 12% rest is breath or piano-arrangement gaps; the hook's return ACROSS
  sections was inferred from 70% − 43% (any-earlier minus local), not traced section by section;
  the ear's verdict on all of §9.
- The pack is piano arrangements labelled by title; 33 multi-track files carry a separate melody
  track that this lane did not use (the `layers` field), so "top voice of the RH" is the
  arranger's reading of the tune, not the record's.

---

# LANE 4 — FORM, LAYERS, DYNAMICS, VIBE MIXING


Source: `audios/toppack-r34/_analysis.json` (419 files, 311 distinct songs after the report's dedup rule — one file per `song`, the fullest non-`easy` version), definitions from `scripts/analyze-toppack-r34.mjs`. Every number below is computed over the dedup'd songs unless it says "files". Probes: scratchpad `probe-form.mjs`, `probe-build.mjs`, `probe-build2.mjs`, `probe-lift-layers.mjs`, `probe-dyn.mjs`, `probe-dyn2.mjs`, `probe-spot.mjs`, `probe-phase.mjs`, `probe-cards-form.mjs`. Companion cards: `cards-form.json` (12 cards, 59 variants, validator: 0 problems, no out-of-scale tones).

## 0. What the segmenter measures, and how far to trust it (audit)

`form.sections` splits when the 4-bar texture state before bar *b* differs from the 4 bars after it on **≥ 2 of**: LH class, RH median pitch (≥ 5 st), RH onsets/bar (≥ 3), mean velocity (≥ 12), with a new section needing ≥ 4 bars. It does NOT snap to a grid: section starts sit at offset 0 / +1 / +2 / −1 from the 4-bar grid in 575 / 421 / 448 / 486 of 1930 boundaries (n = all dedup songs) — i.e. **uniformly**, so the "section lengths are 4/8 multiples" question cannot be answered from this field (see §7 for the measure that can). Listened-to-the-numbers audit on four files:

| song | segmenter | real form (my reading of the sections' numbers + raw notes) | verdict |
| --- | --- | --- | --- |
| call_me_maybe (pop, 95 bars) | 7 sections: comp 13 / block 16 / comp 14 / block 17 / arp_up 7 / block 17 / arp_up 11 | verse 1 (+ intro) / chorus 1 / verse 2 / chorus 2 / bridge / final chorus / outro | **1:1** — boundaries ±1 bar (pickups) |
| viva_la_vida (rock, 136) | 11: comp 14 / octaves 10 / comp 16 / octaves 23 / comp 8 / comp 4 / octaves 21 / comp 8 / octaves 21 / mixed 4 / arp 7 | verse (comp) / chorus (octaves) alternation, bridge, outro | matches; the 4- and 8-bar comp pieces are pre-choruses |
| someone_like_you (ballad, 81) | 13 sections of 4–17 bars | intro+verse 1 (17) / pre (4) / chorus (7) / verse 2 (9) / pre (5) / chorus (8+6) / bridge (4+4) / pre (4) / chorus (5+4) / outro (4) | **over-segmented ~1.6x** (13 vs ~8): every real boundary is found, and a section is often split at the register/velocity peak |
| heart_attack (pop, 100) | 13 sections, and sections 1–6 == 7–12 exactly | intro hook (7) / verse / pre / chorus / post / … twice | matches; a bar-exact repeat form |

So: a "section" ≈ a real section or half of one; boundaries are real to ±1–2 bars; section COUNTS are inflated ~1.5x for ballads/classical (which move velocity and register inside sections) and near-exact for pop/rock. `lift` (raw) is `max(rhPitch) − sections[0].rhPitch` and is **inflated when the first section has no RH** (rhPitch 0): payphone 76, listen_to_your_heart 80, africa_toto 81, just_give_me_a_reason 79, let_me_love_you 93 — 5 songs; the fixed lift below is max − first section WITH ≥ 1 RH onset/bar. Medians barely move (ballad 8→8, pop 2→2, film 10→8.5, edm 7.5→5).

## 1. FORM by lane

| lane | n | sections (med) | sec len med | intro bars med | intro = 0 | intro ≤ 1 bar | intro ≥ 4 | intro sec (med / p75 / max) | > 16 s | lift FIXED med | lift ≥ 10 | register RANGE across sections (med) | first section is the register MAX | vel arc r/f/flat (raw) | arc with a < 8-bar outro dropped | vel-peak position | sustain used | tempo events > 1 | distinct velocities (med) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ballad | 78 | 7 | 8 | 0 | 56% | 69% | 19% | 0 / 5.6 / 31 | 5% | 8 | 45% | 13 | 18% | 18/23/37 | 27/12/39 | 0.6 | 46% | 36% | 23 |
| pop | 64 | 4 | 9 | 1 | 47% | 64% | 19% | 1.9 / 6 / 28 | 5% | 2 | 25% | 11.5 | **37%** | 15/5/44 | 14/5/45 | 0.6 | 30% | 28% | 29 |
| rock | 40 | 8 | 8 | 0 | 63% | 78% | 10% | 0 / 3.5 / 11.5 | 0% | 9 | 48% | 14 | 11% | 14/7/19 | 17/5/18 | 0.7 | 55% | 35% | 38 |
| edm | 16 | 5 | 8 | 1 | 44% | 56% | 38% | 2 / 12.4 / 16.4 | 6% | 5 | 38% | 13 | 13% | 4/3/9 | 5/0/11 | **0.8** | 31% | 50% | 42 |
| film | 28 | 7 | 6 | 0 | 61% | 75% | 18% | 0 / 4.4 / 69 | 11% | 8.5 | 46% | 12 | 23% | 12/5/11 | 12/7/9 | 0.6 | 43% | 64% | 35.5 |
| game | 41 | 1 | 9 | 0 | 63% | 66% | 27% | 0 / 8.4 / 34 | 2% | 0 | 7% | 11 (of the 15 with ≥ 2 sections) | 53% | 3/0/38 | 4/0/37 | 0.5 | 24% | 66% | 2 |
| classical | 21 | 11 | 5 | 0 | 71% | 86% | 10% | 0 / 2 / 10 | 0% | 10 | 52% | 16 | 10% | 12/3/6 | 10/2/9 | 0.5 | 71% | 71% | 52 |
| hiphop | 11 | 5 | 7.5 | 0 | 64% | 73% | 0% | 0 / 4.1 / 6.5 | 0% | 0 | 36% | 14 | 29% | 0/1/10 | 2/2/7 | 0.7 | 36% | 45% | 26 |

Definitions: intro = first bar where the RH top voice has ≥ 2 onsets/bar for two consecutive bars (`rh.introBars`); seconds = bars × 4 × 60 / bpm; velocity arc = last vs first section mean ± 6; "register range" = max − min of section RH medians over sections with ≥ 1 RH onset/bar; vel-peak position = (start + bars/2)/totalBars of the loudest section.

**Intros.** The pack starts the tune almost at once: median 0 bars in every lane but pop/edm (1 bar), 88% within one loop, and in SECONDS the p75 is ≤ 6 s in every lane but edm (12.4 s). Only 5% of songs wait longer than the engine's 16-second cap (ballad 5%, pop 5%, film 11%, rock/classical/hiphop 0%). Songs with ≥ 8-bar intros are a short list: try_colbie 8, relocating_the_lights 8, jealous 11, traitor 8, inception_time 18, get_you_the_moon 9, stay_with_me 10, summertime_sadness 14, pink_panther 9, oot_spirit_temple 10, oot_windmill_hut 8, listen_to_your_heart 9 (12 of 311). The engine's cap is a TAIL value, not a centre.

**The pop lift of 2 explained (spot-checked).** 31 of 64 pop songs have fixed lift 0; 12 of those are single-section songs (the segmenter found no texture change at all — sky_full_of_stars has 12 sections but velDistinct 1, pompeii is ONE 112-bar section at one velocity), and 16 of the 52 multi-section pop songs open ON their register maximum. Raw notes: **a_thousand_miles** bar 0 is a one-note pickup, bars 1–3 are the riff at midi 71–83 over single LH notes, bar 5 the verse drops to 71–78 over LH octave dyads (52/59); **heart_attack** bar 0 = the hook at 85 over 16th LH octaves, bar 7 a run to 101, bar 8 the verse at 49–61 over a pedal LH (25/37 held); **catch_my_breath** opens at 97 then 81 → 69. Pop piano arrangements state the HOOK first, at the chorus register, then drop to the verse — so measured "lift from the first section" is ~0 while the register RANGE across sections is 11.5 st, close to the other lanes (ballad 13, rock 14, film 12). The register peak of a pop song sits at position 0.3 (first third in 62% of pop songs; ballad 35%, rock 24%, edm 33%), while its VELOCITY peak sits at 0.6 (last third 46%) — pop lifts register early and loudness late.

**Velocity arcs.** Raw: ballads read 18 rising / 23 falling / 37 flat. Dropping a final section shorter than 8 bars flips it to 27 / 12 / 39 — **half of the "falling" ballads fall only because of an outro** (someone_like_you: 13 sections, last = 4 bars "rest" at vel 33; let_her_go: last 5 sections 75 → 47 → 46 → 39 → 43; all_of_me: last at 27). Whole-form crescendos (rising with the outro dropped) are the plurality in rock (17/40), edm (5/16), film (12/28) and classical (10/21); pop is FLAT (45/64) — see §4 for why. Sustain pedal (CC64) is used in 46% of ballads, 55% rock, 71% classical, 30% pop, 24% game; `tempoEvents > 1` is 28–71% by lane but is mostly tempo MAPS (heart_attack carries 244 set-tempo events at one tempo): a measured final ritardando (last-2-bar tempo < 90% of the median, over the 151 velocity-rich 4/4 files) exists in 14 of 18 files that have a tempo event there — 12% of files rit. at the end, and when they do it is deep (median 0.8x, half of them ≤ 0.75x).

## 2. THE BUILD — twelve songs with clear form

Sections as the segmenter cut them (LH class / LH onsets per bar / RH onsets per bar / RH median midi / mean velocity). Full tables in `probe-build.mjs` output; the shape:

| song | verse | pre / lift | chorus | breakdown / bridge | final |
| --- | --- | --- | --- | --- | --- |
| call_me_maybe (pop 120) | comp 5.7 / RH 6.0 @71 v64 | — | **block 12.0** / 5.1 @79 v62 | arp_up 5.0 / 6.0 @74 v64 | block 10.5 @79 |
| viva_la_vida (rock 138) | comp 9 / 4.9 @67 v64 | comp 12.1 @82 v78 | **octaves 8.2–8.5** @68–79 v64→83 | mixed 5.8 @79 v71 | arp 5.1 @77 v64 (outro) |
| faded (edm 90) | alberti 8 (intro) → block 10.6 @80 | block 10.4 @70 | **comp 26.0** (block 16ths = the drop) @78 | — | block 9.7 @70 |
| roar (pop 112) | fifths 6 / 8 @74 v62 | arp_mixed 5.8 @82 v83 | **octaves 5.8** @77 v81 → arp @82 v96 | arp 7.4 @70 v67 | stride 7.3 @79 **v108** |
| hello (ballad 79) | fifths 3.8 / 6.2 @58 v55 | block 5.3 @68 v63 | **stride 9.5 / mixed 9** @68–80 v98 | fifths 4.0 @58 v59 | block 6.6 @80 v61 → fifths 3.4 v38 |
| someone_like_you (ballad 67) | alberti 15.9 @73 v49 | block 10 / 9.8 @71 v68 | **arp_mixed 16** @68 v80 | comp 5.5 → block 10.3 @85 v44 | arp 15.4 @69 v80 → rest |
| all_of_me (ballad 120) | single_hit 1.7 → pedal 1.2 → mixed 6.2 @70 v55 | mixed 9.3 v84 | comp 8 v65 / arp 5.6 | rest 0.25 → single_hit 0.75 @84–89 v40 | mixed 3.0 @75 v37 (outro) |
| let_her_go (ballad 143) | arp_mixed 6.1 @81 v59 → single_hit 3.4 | arp 4.2 v61→83 | **mixed 5.5** @79 v92 | arp 4.2 @69 v76 | mixed 5.7 @86 v95 → pedal → rest |
| dj_got_us_falling (pop 120) | rest → mixed 4.3 @72 v62 | — | **arp_mixed 7.8** @81 v87–95 | arp 6.8 @72 v78 | arp 6.8 @79 v79 → mixed 2.5 v55 |
| sky_full_of_stars (pop 120, vel flat) | comp 10.9 @70 | alberti 8 @78 | mixed 6.5 @82 | broken_octave 5 @70 | arp 4.3 @77 → mixed 4 @70 |
| alone_alan_walker (edm 97) | mixed 11.3 / 3.5 @75 v57 | arp_updown 8.4 / 8 @72 v71 | mixed 12 @87 v69 → comp 12.4 v66 | arp_updown 9.3 / 1.5 @75 | arp_up 4.8 @79 v63 → 4.2 @69 v44 |
| pompeii (rock 120) | one section: alberti 7.3 / 4.6 @71 v80 for 112 bars | | | | |

**The verse → chorus transition, measured over every song with ≥ 2 sections** (verse = first section with ≥ 4 bars and ≥ 1 RH onset/bar; chorus = the later such section with the highest velocity, or the highest register when velocity is flat):

| lane | n | LH class changes | to block/octaves/fifths | LH density ratio (med) | ratio ≥ 1.3 | RH density ratio | RH pitch Δ (st, med) | velocity Δ (med) | Δ ≥ +10 | verse LH (top 4) | chorus LH (top 4) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ballad | 71 | 80% | 15% | 1.64 | 63% | 1.02 | +4 | **+23.6** | 69% | pedal 15, arp_mixed 12, mixed 9, single_hit 7 | arp_mixed 19, mixed 13, alberti 7, octaves 7 |
| pop | 52 | 75% | 13% | 1.40 | 50% | 1.08 | +3.5 | **+2.5** | 35% | arp_mixed 11, mixed 10, block 7, comp 6 | comp 11, arp_mixed 10, block 8, mixed 7 |
| rock | 37 | 81% | 5% | 1.38 | 62% | 0.96 | +6 | +15.4 | 62% | mixed 10, arp_mixed 6, pedal 5, single_hit 4 | mixed 10, comp 9, arp_mixed 6, alberti 5 |
| edm | 15 | 87% | 33% | 1.17 | 40% | 1.12 | +2 | +18.6 | 53% | alberti 5, single_hit 2, arp_mixed 2, octaves 2 | block 4, mixed 3, comp 3, arp_updown 2 |
| film | 26 | 69% | 8% | 1.09 | 42% | 0.98 | +3.5 | +21.1 | 58% | alberti 5, pedal 4, arp_mixed 3, single_hit 3 | arp_mixed 6, alberti 4, block 3, single_hit 3 |
| classical | 21 | 71% | 10% | 1.03 | 33% | 0.85 | +3 | +26.1 | 81% | comp 6, alberti 5, arp_mixed 5, mixed 2 | arp_mixed 6, mixed 6, comp 5, block 2 |

Top transitions pooled: arp_mixed→arp_mixed 14, mixed→comp 10, mixed→arp_mixed 10, arp_mixed→mixed 10, comp→comp 9, block→block 7, pedal→alberti 6, alberti→arp_mixed 6, single_hit→mixed 5, comp→octaves 4, pedal→arp_up 4.

**The canonical pop-piano build** (call_me_maybe raw notes, bars 10–13): verse LH = bass root on 1 (midi 36–40), a 4-note chord on the and-of-2 (52–64), one note on the 3-and; RH = dyads/triads 67–74 under the tune. Chorus (bar 13) = 4-note LH chords on every 8th (50/54/57/62), RH triads on every 8th (74/76/79) — **both hands go to the block-8th pulse, the RH rises a 4th–5th, and each note is played SOFTER (v44–59 vs v56–71)**: density and register carry the chorus, not velocity. That is the pop signature in the table: 75% change LH class, 50% raise LH density ≥ 1.3x, register +3.5, velocity only +2.5 (35% ≥ +10) — against ballads (+23.6, 69%) and classical (+26). Ballads build by LOUDNESS and by thickening a sparse verse (pedal / single_hit → arp / mixed, density 1.64x); pop builds by CLASS and register at constant loudness.

**How many LH classes per song (D97's "vary by class")**: classes covering ≥ 10% of bars — ballad median 3 (62% have ≥ 3, 14% only 1), pop 2 (30% ≥ 3, 25% one class), rock 2, edm 3 (69% ≥ 3), film 3, classical 3, game 2 (66% of game songs have ONE section-dominant class — they are short loops, median 23 bars). The pack's pop verse/chorus pair alone is two classes; the bridge usually adds a third (call_me_maybe: comp / block / arp_up).

**Breakdowns — what real pop does.** Definition: an interior section (≥ 4 bars, not first/last) whose LH or RH onsets/bar fall to ≤ 50% of the previous section's.

| lane | songs with one | LH thins, RH keeps | RH thins, LH keeps | both halve | position in form (med, p25–p75) |
| --- | --- | --- | --- | --- | --- |
| ballad | 35% of 78 | 27 | 14 | 4 | 0.5 (0.3–0.7) |
| pop | **17%** of 64 | 11 | 5 | **0** | 0.6 (0.5–0.8) |
| rock | 30% of 40 | 14 | 7 | 3 | 0.6 |
| edm | 44% of 16 | 6 | 4 | 0 | 0.7 (0.7–0.8) |
| film | 46% of 28 | 9 | 18 | 3 | 0.5 |
| classical | 67% of 21 | 32 | 33 | 3 | 0.7 |

In pop the breakdown is rare, late (the bridge), the **LH is what thins and the tune stays**, and NOTHING stops: call_me_maybe bars 60–62 = LH from 12 block 8ths to a 5-note rising arpeggio (55 62 67 69 71) under a held RH; someone_like_you bars 57–58 = both hands to 2 attacks a bar (fifths on 1 and 3, RH chords on beats) with velocity 80 → 49, then bar 59 the bridge climax at midi 78–81 played **pp (v33)**; faded's "drop" (bar 36) is the opposite device — LH block chords doubled to 16ths (26 onsets/bar). The engine's D122 breakdown (acc + drums stripped to a held root ≤ C3, 34 of 47 songs before the hash gate) has the wrong SHAPE for pop twice over: it fires ~2x too often even at 1-in-3, and it removes the hand that the pack keeps. D122's own gain-envelope fix (decay in, swell out) matches what someone_like_you does with velocity.

## 3. LAYERS — the 28 songs with ≥ 3 pitched parts or a drum track

(One file per song, the most-parts version; 14 carry drums. `classifyParts` roles.) 172 pitched parts: acc 56, counter 42, lead 27, bass 24, pad 21, descant 2. Families: piano 46, guitar 25, ensemble 25, bass 12, unknown 12, pipe 11, synth_pad 9, organ 6, reed 5, strings 5, percussive 5, synth_lead 4, chromatic_perc 4.

| role | coverage of the song (med) | onsets / active bar | polyphonic onsets | note length (beats) | median midi |
| --- | --- | --- | --- | --- | --- |
| lead | 59% | 5.4 | 0% | 0.48 | 71 |
| descant (2) | 32% | 4.0 | 0% | 0.44 | 74 |
| counter | 69% | 4.3 | 0% | 0.49 | 60.5 |
| acc | 65% | 4.8 | 53% | 0.63 | 61 |
| pad | 43% | 1.5 | 100% | 3.0 | 66 |
| bass | 89% | 3.2 | 0.4% | 0.77 | 38.5 |

These are the r22 shapes again (lead 4.8/0.50 mono; acc 4.4 polyphonic; pad 1.4 onsets / 2 beats; bass holds) with two differences worth carrying: the pad here sits at 66 — UNDER the lead (71) and OVER the acc (61) — and covers only 43% of bars, i.e. it is the layer that arrives mid-song (just_give_me_a_reason strings enter bar 22 of 97; every_breath_you_take strings 26 of 115; listen_to_your_heart choir 16 of 104). The bass plays 3.2 onsets/bar where the solo-piano LH plays 4.9 — a band bass is SPARSER than the pianist's left hand.

**Concurrency.** Mean simultaneous pitched parts: median over the 28 songs 3.05 (mean 3.78; median max 4.5) — but 15 of the 28 are 3-part files (LH / RH / one extra). Over the 13 songs with ≥ 6 declared parts the mean is **5.19** (max median 8): love_song_bareilles 8.9/11, drops_of_jupiter 8.0/12, beethoven_7 6.5/11, listen_to_your_heart 5.65/8, love_story 5.6/6, forget_you 5.1/8, every_breath 5.0/8. That brackets r22's 4.85 and sits at the low end of the engine's 4–7. It also repeats r22's lesson that a 12-part file sounds 8 at once (drops_of_jupiter has the strings and guitars entering at bar 17 and the overdriven pair at 48).

**Entry bars — the r17 "changes not section-locked" ask, measured.** 138 entries after bar 0 across the 28 songs: only **7% coincide with a segmenter section start**, 18% sit on the raw 4-bar grid, and the raw `entryBar mod 4` histogram is {0: 25, 1: 57, 2: 44, 3: 12} — the "1" spike is the files' count-in: the earliest part enters at bar 1 in every pop multi-track. Relative to each song's EARLIEST entry (121 entries): **36% on the 4-bar grid, 18% exactly one bar EARLY (a pickup into the grid), 45% mid-phrase**; the mid share is carried by classical/film (beethoven_7 entries at 2, 26, 50, 73, 74; stairway 3, 15, 39, 40, 82, 117, 137). In the five pop multi-tracks (43 entries): **24 on the grid (56%), 10 one bar early (23%), 9 mid (21%)** — listen_to_your_heart enters parts at 3, 15, 31 before its 4/16/32, drops_of_jupiter at 47 before 48, love_song_bareilles at 19 before 20. So the "not section-locked" device the pack actually uses is the ONE-BAR-EARLY pickup entry; genuinely mid-phrase entries are a fifth of pop entries.

**Pairs** (226 pairs among each song's six busiest parts): same GM family **26%** (r22: 9.9% — this pack's files double guitars and pianos: drops_of_jupiter has two pianos and two jazz guitars on identical notes, still_dre two muted guitars), strike together on > 50% of onsets **69%** (r22 62.6%), echo pairs (constant-lag copy, rate > 0.6) **11%** (r22 13.5%; lags 0.5 beat x 9 pairs, 2 beats x 8, 1 x 5, 1.5 x 4), median |top-voice gap| 13 st. Pair motion pooled: oblique 31%, contrary 24%, similar 21%, parallel 19% — oblique the plurality, as in r22 (27.8%). Echo spot checks: every_breath bass ↔ muted guitar at half a beat (0.90), love_story piano ↔ steel guitar at half a beat (0.91), les_choristes vibraphone ↔ lead at 2 beats (0.70, parallel 1.0 = a doubling an octave up).

**Drum grooves.** `layers.drums[].groove` = the most common one-bar (role@16th-slot) signature. Twelve of the 14 drum parts are 4/4 with a snare (piano_man's dominant bar is a 3-bar 6/8 pattern; beethoven_7 is timpani only). Of those 12: snare on beat 4 (slot 12) in **12/12**, on beats 2 AND 4 in **10/12** (pink_panther and les_choristes: beat 4 only); kick on beat 1 in 11/12, on the and-of-2 (slot 6) in 5, on beat 3 in 8; 8th-note hats or shaker in 6, 16th hats in 2 (drops_of_jupiter, the_way_it_is), ride / hand-drum / none in 4. The six shapes, as `rhythm_onsets` specs (48-grid fractions; bars = 1):

| # | groove | serves | onsets → sounds |
| --- | --- | --- | --- |
| G1 | pop-rock 8th backbeat: hat 8ths, kick 1 / and-of-2 / 3, snare 2 & 4 | pop, rock, ballad at 100–130 (every_breath_you_take 39 bars, love_song_bareilles 26, listen_to_your_heart 34, les_choristes with kick 1/and-of-4) | `{"onsets":["0/1","1/8","1/4","3/8","1/2","5/8","3/4","7/8","0/1","3/8","1/2","1/4","3/4"],"sounds":["md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_kick","md_kick","md_kick","md_snare","md_snare"],"bpm":117,"bars":1}` |
| G2 | 16th-hat pop: hat 16ths, kick 1 / e-of-1 / and-of-2 / 3 / a-of-4, snare 2 & 4 (+ a-of-2 ghost in drops) | mid-tempo pop 80–105 (the_way_it_is 98 bars, drops_of_jupiter 15) | `{"onsets":["0/1","1/16","1/8","3/16","1/4","5/16","3/8","7/16","1/2","9/16","5/8","11/16","3/4","13/16","7/8","15/16","0/1","3/16","3/8","1/2","7/8","1/4","3/4"],"sounds":["md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_hat","md_kick","md_kick","md_kick","md_kick","md_kick","md_snare","md_snare"],"bpm":102,"bars":1}` |
| G3 | four-on-the-floor: kick every beat, snare 2 & 4 | edm (faded 8 bars) | `{"onsets":["0/1","1/4","1/2","3/4","1/4","3/4"],"sounds":["md_kick","md_kick","md_kick","md_kick","md_snare","md_snare"],"bpm":90,"bars":1}` |
| G4 | ballad half-time with tom/ghost drag: kick 1 / and-of-2 / a-of-3 / 4 / and-of-4, snare drag on the e-and of 1 into beat 2, snare 4, tom doubling the kick, ride on 1 | slow ballads (just_give_me_a_reason 67 bars) | `{"onsets":["0/1","3/8","5/8","3/4","7/8","1/8","3/16","1/4","3/4","0/1","3/8","5/8","7/8"],"sounds":["md_kick","md_kick","md_kick","md_kick","md_kick","md_snare","md_snare","md_snare","md_snare","vc_tom_lo","vc_tom_lo","vc_tom_lo","vc_tom_lo"],"bpm":100,"bars":1}` (ghost snares at gain ≤ 0.2) |
| G5 | shaker train: shaker 8ths, kick 1 & 3, snare 2 & 4 | film / easy-listening ballad (love_story_where_do_i_begin 80 bars) | `{"onsets":["0/1","1/8","1/4","3/8","1/2","5/8","3/4","7/8","0/1","1/2","1/4","3/4"],"sounds":["vc_shaker","vc_shaker","vc_shaker","vc_shaker","vc_shaker","vc_shaker","vc_shaker","vc_shaker","md_kick","md_kick","md_snare","md_snare"],"bpm":80,"bars":1}` |
| G6 | soul/hand-drum: kick 1 / 3 / and-of-3 / and-of-4, snare 2 & 4 + a-of-2, shaker & conga 16ths | uptempo soul-pop (forget_you 18 bars); pink_panther's swung hat 1 / 2 / a-of-2 / 3 / 4 / a-of-4 with snare 4 is the jazz cousin | `{"onsets":["0/1","1/2","5/8","7/8","1/4","7/16","3/4","0/1","1/8","1/4","3/8","1/2","5/8","3/4","7/8"],"sounds":["md_kick","md_kick","md_kick","md_kick","md_snare","md_snare","md_snare","vc_conga_mute","vc_conga_mute","vc_conga_mute","vc_conga_mute","vc_conga_mute","vc_conga_mute","vc_conga_mute","vc_conga_mute"],"bpm":130,"bars":1}` |

Against the engine: its default selector is `[byBand('low') ?? pats[0], byBand('high')]` — kick + hat, 0 mid-band picks on the 33 judged drum songs — and the pack has NO 4/4 groove without a backbeat snare. The and-of-2 kick (5 of 12) and the a-of-4 kick (drops, the_way_it_is, stairway) are the pack's two syncopations; everything else is on the beat.

## 4. DYNAMICS inside a bar (151 4/4 files with ≥ 20 distinct velocities; the pack is 36 songs at ONE velocity, 49 at 2–4, 49 at 5–19, 178 at ≥ 20)

Deltas in velocity units, median over files (share of files > +3 / < −3):

| accent | med Δ | > +3 | < −3 | by lane (med Δ) |
| --- | --- | --- | --- | --- |
| on-beat vs off-8th (all notes) | +1.8 | 35% | 11% | film +3.8, hiphop +3.0, classical +2.9, edm +1.7, pop +1.5, ballad +1.2, rock +1.0 |
| on-beat vs off-16th | +0.9 | 29% | 24% | edm **−5.4** (the off-16th is the accent: alone_alan_walker −6.9), rock +1.1, film +1.7 |
| downbeat vs beat 3 | +0.9 | 23% | 23% | edm +2.6, film +1.7 |
| downbeat vs beats 2 & 4 | +1.9 | 41% | 20% | film +4.8, edm +3.4, hiphop +2.7, pop +2.2 |
| melody local peak vs its neighbours (top voice) | **+2.9** | **49%** | 6% | edm +4.5, classical +3.1, rock +2.8, pop +2.8, film +2.3 |
| top 10% highest melody notes vs all | +2.5 | 48% | 17% | ballad +4.5, rock +3.9 |
| long (≥ 1 beat) vs short (< ½ beat) melody notes | +2.2 | 46% | 22% | film +5.1, rock +3.2, pop +3.0 |
| LH vs RH (mean) | **−3.6** | 11% | **54%** | film −7.3, classical −6.2, edm −4.8, ballad −4.8, rock −3.9, pop −2.1 |
| per-bar velocity RANGE (max − min, all notes) | 27 | — | — | film 36, rock 30.5, ballad 29, pop 26.5, edm 24 |
| per-bar DISTINCT velocities | 10 | — | — | 8–10.5 in every lane with data |

Verse vs chorus (132 files with both): mean velocity **63.6 → 85.7** (+22; 64% of files ≥ +8) while the within-section p10–p90 spread is **24 in the verse and 22.5 in the chorus** — the dynamic RANGE is a constant of the performance, the LEVEL is what moves between sections. Reading: (i) the metrical accent exists but is small (+1–2 units on the beat; the pattern-driven lanes pop/rock/ballad barely have it), (ii) the reliable accents are MELODIC — peaks (+2.9, 49% of files) and long notes (+2.2) — and the LH sits 3–7 units under the RH, (iii) per bar there are ~10 distinct velocities over a 27-unit range even in a flat section. Against D123: the engine realized one velocity per layer until r33; the pack's own flat-velocity files (27% of songs at ≤ 4 values — sky_full_of_stars 1, pompeii 1, a_thousand_miles 2, faded 1) are the transcriptions, not the performances.

## 5. VIBE MIXING — what separates the labels (dedup songs, lane/emotion cells n ≥ 3)

| lane/emotion | n | bpm | major | LH class (songs) | LH on/bar | RH on/bar | lift | vel arc r/f/flat | vel values | sections | intro | colour | chords/bar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ballad/sad | 29 | 88 | **72%** | block 7, mixed 5, arp_mixed 5 | **3.8** | 4.9 | 8 | 4/8/17 | 23 | 6 | 1 | 9.4% | 1.2 |
| ballad/romantic | 13 | 100 | 92% | **arp_mixed 8**, comp 2 | 5.5 | 5.6 | 10 | 2/5/6 | 17 | 6 | 0 | 12.9% | 1.1 |
| ballad/nostalgic | 5 | 86 | 100% | arp_mixed 2, pedal 1, comp 1 | 3.5 | 4.7 | 4 | 1/2/2 | 18 | 8 | 0 | 4.0% | 1.2 |
| ballad/calm | 6 | 114 | 50% | arp_mixed 2, alberti 2 | 6.5 | 4.9 | 4.5 | 2/0/4 | 13.5 | 7.5 | 0.5 | 6.8% | 0.9 |
| ballad/somber | 3 | 96 | 67% | mixed / alberti / octaves | 3.2 | 3.5 | 12 | 1/2/0 | 28 | 8 | 2 | 2.3% | 1.1 |
| pop/excited | 12 | 130 | **58%** | **block 4**, mixed 2, comp 2 | 4.7 | 4.5 | 0 | 1/1/10 | 31.5 | 5 | 0 | 5.9% | 1.0 |
| pop/happy | 11 | 130 | **100%** | comp 3, mixed 2, fifths 2 | 4.4 | 5.1 | 0 | 1/2/8 | 30 | 4 | 1 | 4.7% | 1.1 |
| pop/nostalgic | 7 | 120 | 71% | comp 3, octaves 1, block 1 | 6.3 | 5.5 | **15** | 3/1/3 | 36 | 11 | 1 | **18.3%** | 1.0 |
| pop/playful | 6 | 128 | 100% | alberti 2, comp 2, pedal 1 | 5.5 | 4.7 | 5 | 2/0/4 | 10 | 3.5 | 0.5 | 13.1% | 1.1 |
| pop/dramatic | 5 | 120 | 60% | arp_mixed 2, comp 2 | 6.5 | 4.7 | 6 | 2/0/3 | 42 | 6 | 1 | 17.9% | 1.3 |
| pop/hopeful | 4 | 114 | 100% | block 2, octaves 1, comp 1 | 4.0 | 5.4 | 0 | 0/0/4 | 27 | 3.5 | 3 | 19.3% | 1.3 |
| pop/uplifting | 4 | 106 | 75% | arp_mixed 2 | 5.6 | 6.7 | 1 | 3/0/1 | 43 | 5 | 0 | 16.7% | 1.1 |
| rock/dark | 8 | 113 | 50% | mixed 3, arp_mixed 2 | 6.3 | 5.1 | 11 | 4/2/2 | 57.5 | 8.5 | 0 | 6.6% | 1.2 |
| rock/epic | 5 | 114 | 80% | comp 2, pedal 1 | 4.3 | 4.7 | 7 | 0/2/3 | 64 | 11 | 0 | 13.2% | 1.1 |
| rock/aggressive | 4 | 128.5 | **0%** | **alberti 3** | 7.0 | 5.7 | 8 | 3/0/1 | 81.5 | 11 | 1.5 | 5.1% | 1.1 |
| rock/uplifting | 4 | 127.5 | 50% | mixed 2, stride, arp_up | 3.2 | 5.4 | 4.5 | 2/0/2 | 44 | 11.5 | 2.5 | 6.0% | 1.3 |
| edm/excited | 5 | 130 | 80% | comp 2, octaves, block | 5.5 | 4.3 | 3 | 0/1/4 | 36 | 4 | 0 | 20% | 1.1 |
| edm/melancholic | 4 | 93.5 | 100% | mixed 3, block 1 | 6.4 | 5.3 | 8.5 | 2/1/1 | 64 | 6.5 | 3 | 5% | 1.2 |
| edm/dreamy | 3 | 82 | 0% | arp_mixed 2, alberti | 6.0 | 6.6 | 5 | 0/1/2 | 79 | 9 | 4 | 13.5% | 1.4 |
| film/epic | 5 | 92 | 40% | alberti 2, comp, octaves | **8.6** | 3.9 | 10 | 0/2/3 | 58 | 2 | 0 | 4.4% | 1.1 |
| film/mysterious | 3 | 120 | 0% | mixed / alberti / block | 4.1 | 4.6 | 7 | 3/0/0 | 24 | 4 | 0 | 3.7% | 0.8 |
| game/calm | 7 | 95 | 86% | arp_mixed 2, stride, comp | 4.5 | **2.9** | 0 | 0/0/7 | 2 | 1 | 0 | **39.6%** | 1.2 |
| game/mysterious | 6 | 104 | 33% | mixed 3, octaves, pedal | **1.9** | 3.8 | 0 | 2/0/4 | 2.5 | 1.5 | 2 | 9% | 1.5 |
| hiphop/cool | 4 | 104.5 | 25% | alberti 2, octaves, arp_up | 5.6 | 5.6 | 0 | 0/1/3 | 25.5 | 1.5 | 0 | 2.1% | 0.9 |

By energy label (pop + ballad + rock + edm, n = 198): energy 1 → bpm 96, LH 5.7 on/bar, cluster 1.1 notes/attack, 79% major; 2 → 86 bpm, 5.6, 1.4, 71%; 3 → 108, 5.0, 1.6, 62%; 4 → 120, 4.8, 1.6, 67%; 5 → 135, 6.4, 1.5, 29% major, alberti 3 of 7. **Energy is tempo and chord thickness, not LH onset count** — the slowest label has as many LH onsets as the fastest (arpeggiated ballads).

What separates the ballads: **sad** is the sparsest LH (3.8 onsets/bar, BLOCK chords the top class — 7 of 29) at 88 bpm and, surprisingly, 72% MAJOR keys (someone_like_you A major, hello Ab major, let_her_go G) with a falling-or-flat arc (8 falling of 29, the most of any cell); **romantic** is faster (100), 92% major, and ARPEGGIATED (arp_mixed 8 of 13, 5.5 onsets/bar) with the biggest lift (10); **nostalgic** is the slowest (86), 100% major, sparse (3.5) and the flattest in register (lift 4) with almost no colour (4%). Sad = block + sparse + falling; romantic = arpeggio + lift; nostalgic = slow + plain + flat. What separates the pops: **excited** and **happy** share the tempo (130) and the flat arc; excited is **42% minor** with BLOCK LH (4 of 12) and 0 lift; happy is **100% major** with comp/fifths LH and RH busier (5.1 vs 4.5). Mode is the separator, not tempo. **nostalgic pop** is the odd one: the most colour (18.3%), the most sections (11) and the biggest lift (15) — piano_man / james_blunt_1973 / rocket_man are the through-composed songs of the pack.

## 6. Against the engine

| question | engine | pack | verdict |
| --- | --- | --- | --- |
| intro length | pre-melody intros cap at ~16 s, whole-loop shrinks, one-loop floor, ≤ 60 bpm drops | median 0 bars / 0 s; p75 ≤ 6 s; 5% > 16 s; pop opens with the hook AT the chorus register 37% of the time | the cap is the pack's p95; the pack's centre is "tune at bar 0 or one loop later"; the hook-first opening is a device the engine does not have |
| breakdown (D122) | acc + drums stop, held root ≤ C3, ~1 in 3 songs after the hash gate (34/47 before) | pop 17% of songs; LH thins and the RH keeps the tune (11 vs 5 vs 0 both); density halves, nothing stops; velocity halves | shape and rate both off for pop; ballads 35% / edm 44% are closer to 1-in-3 |
| section lengths 4/8-bar multiples | every section start and length divides by 4 (D97) | the segmenter cannot answer (its boundaries are uniform on the 4-grid); layer entries relative to the form's first entry: 56% on the 4-grid, 23% one bar early, in pop | keep the grid; add the one-bar-early pickup entry as a legal offset |
| LEAD_CURVE / gain arcs | section multipliers clamped at 1.0 on fresh songs (r33); one velocity per layer before r33 | +22 velocity verse → chorus in ballad/rock/film/classical, +2.5 in pop; per-bar range 27 units / 10 values; melody peaks +2.9; LH −3.6 under RH; velocity peak at 0.6–0.8 of the form | pop must build by CLASS, not level; non-pop terraces one step; per-note peak/long-note accents are the "human" half |
| companion / counterline norms (D102) | one companion locked to the lead's rhythm, separated by register and family | 69% of pairs strike together > 50%; 26% same family (this pack doubles); oblique 31% plurality; pad UNDER the lead at 66 vs 71; echo pairs 11% at 0.5 / 2 beats | D102 holds; add: the pad is the mid-song ENTRANT (43% coverage), not a floor |
| drum default | kick + hat, no snare (0 mid picks on 33 songs) | 12/12 4/4 grooves have a snare on beat 4, 10/12 on 2 and 4; hats 8ths | the pack has no pop groove without a backbeat; the default is a metronome |
| concurrency | 4–7 (songs.html measured 4.02 in r22's doc) | 5.19 in the ≥ 6-part songs, max median 8; 3.05 over all multi-tracks | in range; the pack's 12-part files still sound ~8 |

## 7. RULES EXTRACTED (each with its measurement)

1. **Tune at bar 0 or after ONE loop; never wait two.** Intro median 0 bars; 88% ≤ 1 loop; 5% > 16 s. (`pl_form_intro_length_hook_first`)
2. **Pop may open with the HOOK at the chorus register and then drop to the verse.** 37% of pop songs open on their register maximum (ballad 18%); a_thousand_miles / heart_attack / catch_my_breath raw bars. (same card)
3. **A pop chorus is a CLASS change + register lift at constant loudness.** LH class changes 75%, density 1.4x, RH +3.5 st, velocity +2.5; call_me_maybe's chorus is softer per note than its verse. (`pl_form_pop_build_verse_chorus`)
4. **Ballads/rock/film build by LEVEL (+15 to +26 velocity) after thickening a sparse verse (pedal / single_hit → arp, 1.64x).** (`pl_form_velocity_arc_terrace`)
5. **A pop breakdown keeps the tune and thins the LEFT hand; nothing stops; it is rare (17%) and late (0.6).** (`pl_form_breakdown_grades`)
6. **Two to three LH classes per song** (ballad 3, pop 2, edm 3); a one-class song is 10–25% of the lanes (and 66% of the short game loops). (`pl_mix_lh_class_flips_lane` tests whether the class alone carries a lane)
7. **Layers enter on the 4-bar grid or ONE BAR EARLY with a pickup** (pop: 56% / 23% / 21% mid). (`pl_form_layer_entry_grid_or_pickup`)
8. **Every pop groove has the snare on 2 and 4** (10/12; beat 4 in 12/12); kick on 1 always, and-of-2 in 5/12, beat 3 in 8/12; hats in 8ths. (`pl_form_drum_groove_ladder`)
9. **The pad enters mid-song, under the lead and over the acc** (pitch 66 between 71 and 61; 43% coverage; 1.5 onsets/bar; 3-beat notes). (`pl_combo_strings_pad_levels`)
10. **A band bass is sparser than a piano LH** (3.2 vs 4.9 onsets/bar, monophonic, midi 38.5). (`pl_combo_band_split_bass_epiano`)
11. **Inside a bar: ~10 distinct velocities over 27 units; the accents are the melody's peaks (+2.9) and long notes (+2.2), the LH −3.6 under the RH; metrical accent is ≤ +2.** (`pl_form_velocity_arc_terrace` variant 5)
12. **Sad ≠ nostalgic ≠ romantic in the numbers**: sad = block LH 3.8 on/bar, 88 bpm, falling arc; romantic = arp 5.5 on/bar, 100 bpm, lift 10; nostalgic = 86 bpm, lift 4, colour 4%. **Excited ≠ happy by MODE** (42% minor vs 0%) and LH class (block vs comp), not tempo (both 130). (`pl_mix_film_ostinato_under_sad_ballad`, `pl_mix_edm_pulse_under_ballad`)
13. **Film's driver is a frozen cell (28% odd-16th LH onsets, minor 79%), edm's is 6.2 onsets/bar at 120 with 43% off-8ths** — the same loops as the ballads (I V vi IV: 9 ballads, 1 edm). (`pl_mix_film_ostinato_under_sad_ballad`, `pl_mix_edm_pulse_under_ballad`)

## 8. OPEN QUESTIONS an ear must settle (the cards)

- Does a class change at constant loudness read as a chorus, or does he hear "no build" until the level moves? (build card, gain_only vs class_change)
- Is the one-bar-early layer entry musical or sloppy to his ear? (entry card)
- Which breakdown grade is "a section" and which is "the piano disappears"? (breakdown card — D122's device is variant 3)
- Is 8 bars of accompaniment before the tune (the engine's cap) tolerable at all at 120? (intro card)
- Does the LH class alone move the lane label (pedal → Zelda, octave 8ths → EDM, frozen cell → film)? (mix cards)
- Does the pop pattern survive a marimba, and does the band split need the bass simplified? (combo cards)
- Is the pad's mid-song entry heard as a section opening? (strings card)

Not measurable here: fills (the groove field keeps only the dominant bar; fill bars are the minority signatures and were not extracted), sustain-pedal DEPTH (CC64 counts only), the true 4/8-bar section grid (the segmenter does not snap — a chord-loop-aligned segmenter would), and any per-file listening (the pack is labeled by title, not by ear).

## 9. Cards (`cards-form.json`)

| id | lane | what it answers |
| --- | --- | --- |
| pl_form_pop_build_verse_chorus | form | rule 3 — class change + lift vs octave-add vs gain-only |
| pl_form_breakdown_grades | form | rule 5 — LH-thins / LH-class-change / D122 held root / melody-alone cut / none |
| pl_form_intro_length_hook_first | form | rules 1–2 — 0 / 1 loop / 2 loops / hook-first-at-the-top |
| pl_form_drum_groove_ladder | form | rule 8 — none / engine kick+hat / G1 / G2 / G3 / G4 |
| pl_form_velocity_arc_terrace | form | rules 4, 11 — flat / terrace / ramp / falling outro / within-bar accents |
| pl_form_layer_entry_grid_or_pickup | form | rule 7 — grid / pickup / late / bar 2 |
| pl_mix_lh_class_flips_lane | mix | rule 6 — comp / pedal / quarter octaves / 8th octaves / frozen cell under one pop loop |
| pl_mix_film_ostinato_under_sad_ballad | mix | rules 12–13 — block / frozen cell / re-pitched / 16ths / cell on strings |
| pl_mix_edm_pulse_under_ballad | mix | rule 13 — arp 88 / octave 8ths 88 / 124 / 124 + kick / block 8ths 88 |
| pl_combo_pop_pattern_voice_swap | combo | piano / epiano / nylon / marimba / pad+bass |
| pl_combo_band_split_bass_epiano | combo | rule 10 — solo / simplified bass + epiano / literal LH on bass / + pad / + backbeat |
| pl_combo_strings_pad_levels | combo | rule 9 — none / law from bar 1 / enter bar 5 / loud-dry / octave up |

Measured on the cards (`probe-cards-form.mjs`): every support part's median register sits under the tune's (lead 64–76, LH 45–57, pads 62, bass 41; the only support at the tune's register is the deliberate `pad_octave_up` falsification), every support gain ≤ 0.55 against a lead of 0.65–0.7 (D77), drums ≤ 0.45; the build card's chorus changes 33–47% of the reference's events, the octave-add variant adds 44 events at 69–81; the masks realize (intro variants lose exactly the 22 / 44 RH haps of 4 / 8 bars; the entry variants carry 6–14 counter haps); the gain patterns realize 2–16 distinct gains where declared. All tunes are new material written to the measured grammar (5–6 onsets/bar, 8th-note base, pentatonic-leaning, 2-bar phrases, held chord-tone landings); no pack melody is transplanted.

---

# WHAT THE FOUR LANES SAY TOGETHER (synthesis, with the cross-lane corrections)

Four agents read one JSON; where they disagree the raw-note check wins, and
three of my own headline numbers above were corrected by the lanes:

- **"49% of segments are half a bar" is 20–38% of BARS** (lane 1 §3): the
  span histogram counts segments, so a bar with two chords weighs twice. The
  genuine sub-bar shapes are 2-2-4 (vi IV | I in wake_me_up, happier) and
  6-2 where the root moves; the 2-6 splits in jar_of_hearts / faded / viva
  are the LH dropping the 5th or 3rd under a static chord.
- **The borrowed-chord table counts spellings and inherits the key
  detector** (lane 1 §4.1): "bII in 55 songs" is 42 songs, of which 15 are
  the KS solver parked on the loop's v or iii chord (stay_laroi is Bb minor
  bVI bVII i v, not F minor bII bIII iv i), 10 genuine (Zelda Phrygian,
  POTC), 17 single-segment flaps. 11% of the corpus has a better key than
  the one the analysis used; every "by key" number carries that.
- **The pop drum groove has a snare** — but the claim in the header was a
  guess from the signature strings; lane 4 §3 read the 12 dominant 4/4
  grooves: snare on beat 4 in 12/12, on 2 AND 4 in 10/12, kick on 1 in
  11/12 and on the and-of-2 in 5/12, hats in 8ths.

The rules that survive all four lanes, each with the card that tests it:

| rule | lanes | measurement | card |
|---|---|---|---|
| Rotation is meaning: the axis loop starting on I is sad/happy/tender with a plagal close, starting on vi is calm/romantic with a deceptive close | 1 | 8 vs 8 of the 19 axis loops | `pl_prog_axis_rotation` |
| Pop harmony is PLAIN and colours one chord; the dominant 7th is a classical marker | 1, 4 | colour 9–13% pop/ballad, 33% classical; V7 0.4–0.7% vs 10% | `pl_prog_colour_dose`, `pl_prog_cadence_close` |
| The pop LH lives on the 8th grid; its one syncopated slot is the and-of-2; a genuine anticipation is a SONG-level device (viva_la_vida 14/14, stay_with_me 13/13) | 2 | odd-16th 0–1%; slot 6 10–13%; ≥ 4 anticipations in 10 of 249 songs | `pl_rhythm_anticipation_ladder`, `pl_rhythm_tresillo_comp` |
| The chorus is a REGISTER drop of the LH (−8 st ballad, −12 st edm) and a class change at constant loudness in pop; ballads/rock/film build by level (+15–26 velocity) | 2, 4 | 67%/73% of songs drop ≥ 3 st; pop velocity +2.5, ballad +23.6 | `pl_lh_chorus_register_drop`, `pl_form_pop_build_verse_chorus`, `pl_form_velocity_arc_terrace` |
| The melody's chorus lift is register + thickness + LH density with the RHYTHM held (note-length ratio 1.00 over 117 songs) | 3 | +8.5–12 st, thickness 17% → 59% | `pl_melody_chorus_lift` |
| Repeat a 2-bar cell and vary it by grade, never by transposition; IN THE MIX the engine repeats LESS than pop (59% vs 70% rhythm, 30% vs 57% pitch — the lane's "84%" was a solo artefact, corrected by the verify pass) and never returns a hook after contrast | 3 | lag-1 10% pop; re-fit 27%, transposition 6% | `pl_melody_hook_repeat`, `pl_melody_cell_period` |
| Pentatonic body (89%), passing 4/7 short, weak, step-bracketed; odd 16ths are pickups (48%), runs (17%) or dotted 3+3+2 members (28%) — amend the D123 grid law for dotted members | 3 | isolated shorts 0.4% of onsets; final-slot shorts 2.9% of shorts | `pl_melody_pent_passing`, `pl_melody_anticipation` |
| Tune at bar 0 or after ONE loop; pop may open with the hook at the chorus register (37%) | 4 | intro median 0; 5% > 16 s | `pl_form_intro_length_hook_first` |
| A pop breakdown thins the LEFT hand and keeps the tune; nothing stops; 17% of pop songs, late | 4 | 11 LH-thins / 5 RH / 0 both | `pl_form_breakdown_grades` |
| Layers enter on the 4-bar grid or ONE BAR EARLY with a pickup (56% / 23% / 21% mid) | 4 | 43 pop multi-track entries | `pl_form_layer_entry_grid_or_pickup` |
| Sad ≠ nostalgic ≠ romantic: sad = block LH 3.8 on/bar at 88 bpm, falling arc, 72% MAJOR; romantic = arp 5.5 on/bar at 100, lift 10; nostalgic = 86 bpm, lift 4, colour 4%. Excited ≠ happy by MODE (42% minor vs 0%) not tempo | 4, 2 | lane/emotion cells n ≥ 3 | `pl_lh_ballad_emotion_density`, `pl_mix_*` |
| Game (Zelda) is two-chord shuttles (I bVII, i iv, i v, IV V) over a held one-attack LH; I V is never game | 1, 2 | 4 of 28 game loops two chords; game LH 0.95-beat notes | `pl_prog_game_shuttles`, `pl_lh_zelda_pedal_vs_pulse` |
| Accent = bass-loud on beat 1 in pop lanes, off-beat in film/classical; inside a bar the accents are the melody's peaks (+2.9) and long notes (+2.2), LH −3.6 under the RH | 2, 4 | 53–65% / 53–56%; 151 velocity-rich files | `pl_lh_accent_placement`, `pl_form_velocity_arc_terrace` |
| The single-shape straight-8th LH is a ROCK idiom (22% of rock's straight-8 bars) and the engine's ≥ 12-onset metronome clause rejects 25% of classical bars that are the idiom | 2 | 3–5% in ballad/pop | `pl_lh_rock_chug_metronome` |

## Against the engine, in one place

- **Colour.** The taste canon says colour is the norm (D88). The pack says
  pop piano is plain and colours one chord per loop. Both can be true — his
  ear judged game music — but `pl_prog_colour_dose` puts the doses side by
  side so the law gets a pop-lane verdict.
- **Sub-bar harmony.** `chordBeats` (D122) exists; the pack's real pop shape
  is 2-2-4 and the anticipated V on the last 8th. Nothing in the canon
  carries the 2–3-chord shuttles of game/film/hiphop/edm (lane 1 §7 lists
  them with dialect degrees).
- **Melody.** The engine's judged leads in the mix: 16% stepwise, ~2% NCT,
  59% bar-rhythm repetition (30% pitch), 32% final-slot shorts. Pop: 32% /
  40% / 70% (57%) at lag 2–4 with a non-local return / 2.9%. The missing mechanisms (lane 3 §7): a
  2-bar cell with a frozen body and per-statement landing re-fit; the
  non-local hook return; a barline anticipation (bindMelody cannot tie
  across a bar); the dotted-member exemption in `gridSnapMelodyEntry`; a
  pentatonic supply; the chorus device; a restruck-pitch mode (D65's
  `mergeRepeats` makes a restruck hook unwritable).
- **Left hand.** 13 missing figures in the figurations format (lane 2 §6.2),
  the octave pedal `R.R+` first among them; the D97 composite's `fill` form
  wrote a 12-onset bar on the very first card; the metronome test's second
  clause is wrong for 16th alberti/broken-octave idioms.
- **Form.** The 16-second intro cap is the pack's p95, not its centre; D122's
  breakdown strips the hand the pack keeps and fires ~2x the pop rate; the
  drum default (kick+hat, no snare) matches zero of twelve pack grooves; the
  one-bar-early pickup entry is the "not section-locked" device the pack
  actually uses.

## The labs page

`audition/poplab.html` — 44 experiments, 208 variants, all evaluated at
build: prog 11 / lh 9 / rhythm 2 / melody 10 / form 6 / mix 3 / combo 3 (208 variants after the verify pass added one falsifier).
Every card shows the measured finding and its source songs, a falsifiable
hypothesis, a targeted question, and separate playable variants with
works/off marks and a note box; the card verdict is for the experiment as a
whole. HQ renders (`audition/hq/poplab.<card>.<variant>.wav`, made by
`render-hq.mjs` from the exact page code, ≤ 4-bar cards as two loops) play
when HQ is on. Export → `node scripts/import-poplab.mjs <file.json>` →
`src/lib/pop-lab-labels.js`. Nothing on the page feeds retrieval (D95); a
rule is promoted by hand after his verdict on its card.

Every hook on the page is ORIGINAL material composed from the extracted
rules over two beds (C G Am F, Am F C G); the pack's songs are copyrighted
and their tunes were never transplanted — patterns yes, tunes no. The verify
pass compared every hook's (interval, gap) pairs against every pack RH: one
card (`pl_melody_tresillo_frozen`) had reproduced Shape of You's hook cell
(+3/−3 at 6-6-4, transposed) and was re-composed to a +2/−5 cell on the same
tresillo before the page shipped; every other hook shares ≤ 7 pairs with any
pack song.

## Caveats that travel with every number here

- The labels (lane / emotion / energy) are hand-authored from the TITLES in
  `scripts/toppack-labels-r34.mjs`; every "by emotion" cut inherits that.
  They are not his verdicts.
- 36 songs are single-velocity transcriptions and the whole Zelda set is a
  flat-velocity export; the dynamics numbers come from the 151 velocity-rich
  4/4 files only.
- The half-bar labeller flaps on passing tones (a chromatic label needs ≥ 2
  segments to count) and the KS key solver parks on a loop's v/iii chord in
  11% of songs; the loops table is rotation-insensitive and skeleton-only.
- The texture segmenter's boundaries are uniform on the 4-bar grid, so it
  cannot say whether sections are 4/8-bar multiples; it over-segments
  ballads ~1.6x.
- 15 "triplet-grid" 4/4 files are a `pickGrid` lag artefact (straight 8ths
  played ~1/32 bar late), not swing; no swing was verified in any 4/4 file.
- 6/8, 12/8 and 3/4 sources are described, and their loops re-cast into 4/4
  on the cards (D92).
