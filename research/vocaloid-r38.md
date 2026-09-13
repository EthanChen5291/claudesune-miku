# The Vocaloid set, second read (r38) — the ARRANGEMENT: progressions per section, piano and bass figures, form, hooks, layering, instruments, and why it is more harmonious than ours

**His ask (2026-09-12, after listening to `audition/band.html`):** "in band.html,
it fits but doesnt really sound good or catchy. analyze all the vocaloid songs i
gave you last time and learn from their chord progressions and patterns and
what they play and how they support vocaloid and the piano patterns and voice
patterns and layering, and just what makes the song 'sound good' … take note of
instruments they use too … understand how it's more harmonious than ours and
sounds better."

r35 (`research/vocaloid-r35.md`) measured the VOICE and stated twelve laws. This
read measures the SONG around the voice, on the same 36 files, and then measures
OUR pages with the same yardsticks. The short version is at the end
(§10: what "sounds good" is, as rules the engine can follow).

## 0. Population, method, caveats

- **Population:** the same 36 analyzed files as r35 (33 Vocaloid originals + 4
  human-sung J-pop in the identical style + Coldplay's Yellow as a control;
  `Hatsune Miku - Senbonzakura.mid` skipped — a two-hand piano cover with no
  voice track; `get_proto-*.mid` excluded). Every table says "36" unless it
  says otherwise. Lane / emotion labels are inferred from titles (r35), and
  VocaDB genre tags were looked up per song (§7) as an independent anchor.
- **Melody identification, his question ("are you able to do that reliably?"):
  yes.** 32 of 37 files NAME the vocal track (VOCAL / MIKU / SING / RIN / Miku).
  The other three with voices (Ievan Polkka, Monster, USSEEWA — tracks named
  "MIDI Out #n") were assigned by behaviour and re-verified this round: the
  chosen track is 100% monophonic in all three and sits at midi 61–73 / 54–77 /
  56–84 (the singer's range), while the other two tracks are 36–67% monophonic
  and sit at 73+/41-. No direction from him is needed.
- **Scripts:** `scripts/analyze-vocaloid-r38.mjs` (→
  `audios/vocaloid-r35/_analysis-r38.json`, gitignored), sharing roles and grid
  shift with the r35 JSON so both reads describe one population;
  `scripts/figure-classes-r38.mjs` (ONE figure classifier used for the corpus
  AND for our songs); `scripts/probe-harmony-density-r38.mjs` (harmonic
  density, both sides collapsed to sounding pitch classes on an 8th grid);
  `scripts/probe-figures-r38.mjs` (our acc/bass classed by the same rule);
  `scripts/probe-vocal-harmony-r35.mjs` and `scripts/baseline-vocal-r35.py`
  re-run on band.html. ANALYSIS ONLY (D95): nothing here is counted into
  `src/lib`.
- **Sections** are a WINDOW classifier, not the songs' true form: 4-bar windows;
  sung windows ranked by the r35 composite (voice register + voice density + acc
  density + acc thickness + bass density); top third = chorus, bottom third =
  verse, middle third = "mid" (pre-chorus, B-verse, post-chorus); unsung runs =
  intro / interlude / outro; 4-bar islands between two windows of one label take
  that label. It gets the CONTRASTS right (both r35 selectors agreed on every
  direction) and fragments long sections; treat section LENGTHS as lower bounds.
- **Chord labels** are the half-bar labeller over NOTE+BASS (r35's). "Loop"
  strings below are the labeller's chord sequence in a section with repeats
  collapsed — they are noisier than a hand transcription and are shown to make
  the SHAPES visible (which degree the section opens on, whether the chorus has
  its own progression), not as authoritative charts.
- **Instruments cannot be measured from these files** (§7 says why). The
  instrument table is knowledge of the released recordings plus VocaDB tags, and
  it says which is which.
- **Figure classes** are decided from onset/cluster/duration profiles, never
  from names (D100's list law): `sustain` (held ≥ 1.8 beats, ≤ 2.5 onsets/bar),
  `arp16` (single notes, ≥ 10/bar), `arp8` (single notes, ≥ 5/bar),
  `counterline` (single notes ≥ 5/bar with ≥ 40% stepwise tops), `syncopated`
  (≥ 25% of onsets are tie-overs: an off-8th strike with no strike on the next
  beat), `block8` (chords, ≥ 6 strikes/bar), `block4` (chords on beats),
  `stab` (chords, ≥ 60% under half a beat), `line` (single notes, < 5/bar),
  `sparse` (< 1 onset/bar), `silent`. Bass: `held`, `quarters`, `octave` (≥ 30%
  octave alternation), `root5-8ths` (≥ 6/bar with ≥ 35% root↔fifth motion),
  `pump8` (≥ 6/bar, ≥ 60% repeated pitch), `pump16`, `walk` (≥ 30% steps),
  `syncopated`, `riff` (≥ 6/bar, none of the above). A first cut classed every
  straight-8th block figure as "syncopated" because half its onsets are
  off-8ths; the tie-over definition fixed that (chorus `syncopated` 52% → 11%).

## 1. THE HEADLINE — "how is it more harmonious than ours": measured three ways, and the answer is NOT density

Like for like: both sides collapsed to the set of PITCH CLASSES sounding in
each 8th note. Corpus = NOTE + BASS + VOICE (the whole reduction). Ours = the
mix haps, masks applied (`probe-harmony-density-r38.mjs`). A first pass
counted SUSTAIN-inclusive (a held note counts in every 8th it spans) and read
a large gap; motif-engine-b4 (the band page's owner) re-measured ONSET-only
and could not reproduce it, so both rules were run on both sides, plus a
gain filter (drop haps under 0.25 — the 0.45 guide lead, the string/pad beds
at 0.16–0.26, the sparkle) on ours:

| rule | corpus (36) pcs/8th · rubs/bar · spells-a-chord · out-of-key | band.html (12) same |
|---|---|---|
| sustain-inclusive, all layers | 3 (p90 4) · 1.63 · 88% · 7.9% | **5 (p90 6) · 4.13 · 61% · 8.5%** (7 layers) |
| onset-only, all layers | 2 (p90 4) · 1.09 · 91% · 7.5% | 3 (p90 5) · 1.69 · 81% · 10.9% |
| sustain-inclusive, gain ≥ 0.25 | (n/a — velocity is flat 127) | **3 (p90 4) · 1.28 · 90% · 13.3%** (5 layers) |
| onset-only, gain ≥ 0.25 | | 2 (p90 3) · 0.47 · 98% · 14.1% |
| held notes ≥ 2 beats that go stale against the bar's chord | — | **0 of 1,271** |

**So: what is LOUD in our mix is as thin and as consonant as the corpus
reduction** (3 pcs per 8th, 1.3 rubs a bar, 90% of 8ths spelling one chord —
the same numbers), and no held note ever sits against a chord change. The
sustain-inclusive gap is the QUIET beds: the guide lead, the string ensemble,
the pad, the music-box sparkle — five to seven layers whose held chord tones
and colour tones add up to 5 pcs on paper at levels the ear reads as texture.
Whether those beds read as "less harmonious" at their gain is his ear's call;
the corpus reduction has no beds at all, so it cannot say. Out-of-key rates
are the same order on both sides (8–11% whole-mix; per-layer outliers are
real: bd_garage's guitar 50% and accordion 36%, bd_rival's marimba 43% and
cello 31% — those four layers are the worst pitch-discipline on the page).

What DOES differ, and is not a counting rule:

- **Vocabulary.** Corpus chord labels are triads 26% · minor 25% · **sus 16%**
  · m7 12% · ^7 10% · 6 6% · 7 3% — no 9ths, no 13ths — and **47% of its
  half-bars are THIRDLESS** in acc+bass (r35): the chord is implied by bass
  root + one or two notes + the voice. Ours: `Am9 D13 G^7 Db9 C^9 F13 Em9`
  (bd_market and bd_airship — a tritone-substitution city-pop chain in a
  "night market chase" and an "airship at dawn"), `G#13 A^9 G#7 C#sus`,
  `B7 C^9 F^9 E^9`. Even played thinly, a 13th chord and a `Db9` in G are a
  different idiom from the songs he gave me.
- **One loop vs two** (§3): every band song carries one progression; the
  corpus chorus has its own in 35 of 36.
- **Texture** (§2, §8): verse line vs chorus block; a bass on 8ths; the
  octave double only in the chorus.
- **Form** (§4, §8): 16–48-bar songs with 4-bar sections against 137-bar
  songs whose first chorus lands at bar 36.

The harmony answer, then: **not fewer wrong notes and not fewer notes — a
plainer vocabulary, a second progression for the chorus, and a bass.** The
"sounds better" answer is the form and the textures below.

## 2. What the accompaniment PLAYS — figures by section (36 songs, 4-bar windows)

| section | acc (piano RH) figure, share of windows | bass figure |
|---|---|---|
| intro | block8 30% · line 16% · counterline 14% · syncopated 12% · **arp16 12%** · block4 10% | root5-8ths 30% · held 17% · octave 16% · quarters 16% · walk 9% |
| **verse** | **line 26%** · **silent 17%** · arp8 11% · block4 11% · counterline 10% · syncopated 9% · block8 7% · sparse 6% | root5-8ths 30% · **quarters 27%** · **octave 18%** · riff 9% · walk 6% |
| mid (pre / B) | block4 24% · block8 20% · line 13% · syncopated 13% · arp8 12% · counterline 9% | root5-8ths 34% · quarters 21% · octave 17% · riff 12% |
| **chorus** | **block8 43% · block4 26%** · syncopated 11% · line 8% · arp8 5% | **root5-8ths 56%** · quarters 16% · riff 10% · walk 8% · octave 5% |
| interlude | block8 28% · arp16 16% · block4 15% · syncopated 14% · counterline 12% | (as intro) |

Measured profiles of the main classes (medians over windows of that class):

| class (section) | n | strikes/bar | notes/strike | strike length | on-beat share | top note p90 | top-voice steps |
|---|---|---|---|---|---|---|---|
| verse `line` | 85 | 3 | 1.0 | an 8th | 61% | 71 (B4) | 27% |
| verse `arp8` | 36 | 6.25 | 1.1 | an 8th | 44% | 68 | 13% |
| verse `block4` | 36 | 5 | 1.7 | an 8th | 64% | 76 | 21% |
| chorus `block8` | 140 | 7.25 | **2.1** | an 8th | 45% | **86 (D6)** | 39% |
| chorus `block4` | 87 | 5 | 2.2 | an 8th | 63% | 84 | 40% |
| intro `block8` | 21 | 8.5 | 1.6 | an 8th | 35% | 79 | 44% |
| intro `counterline` | 10 | 8 | 1.0 | an 8th | 43% | 78 | 58% |
| bass verse `quarters` | 88 | 4.75 | — | 2/3 beat | — | midi 41 (F2) | root 60% |
| bass verse `octave` | 59 | 7.75 | — | an 8th | — | 39 | root 75%, octave 65% |
| bass chorus `root5-8ths` | 185 | 7.5 | — | an 8th | — | 40 (E2) | root 48%, fifth motion 59% |

**Read it as a recipe.** The VERSE piano is a single-note LINE — three strikes
a bar, one note each, under the voice (top p90 = B4 while the voice sits at
G#4 median), and in **18 of 36 songs the piano DROPS OUT of at least one verse
window entirely** (bass + voice only: Melt, Rolling Girl, Senbonzakura,
USSEEWA, Roki, Monster, Six Trillion Years, Two Breaths Walking …). The CHORUS
piano is CHORDS ON 8THS — 7 strikes a bar, 2 notes a strike, top note at D6:
the sung tune an octave up sitting on top of a two-note chord (r35 law 9,
re-measured with the new section labels: the acc doubles the voice's pitch
class at 16% of verse onsets and **92% of chorus onsets**). Every strike is an
8th long — the piano never sustains (`sustain` is 1% of windows); "held" in
this idiom is the bass and the (unrecorded) pad, never the keys. The acc's
2-bar rhythm repeats inside a 4-bar window at a median of **0%** — the figure
is not a loop cell; it follows the voice's rhythm (77% homorhythm, r35).

**The bass is the other constant.** Root–fifth alternation on straight 8ths
is the chorus bass in 56% of windows (quarters 16%, walking 8%); the verse
bass is quarters (27%) or octave-alternating 8ths (18%) at midi 39–41 (D#2–F2);
strikes are 8ths in the chorus and two-thirds of a beat in the verse. A bass
that HOLDS (`held`) is 3% of sung windows. Our songs, same classifier (§8):
the bass is SILENT in 50–85% of windows.

## 3. Harmony: sections OWN their progressions (36 songs)

- **The chorus has its own chord loop in 35 of 36 songs** (the exception is
  Binomi, a one-chord chiptune song). Chords per bar do not change (verse 1.66,
  chorus 1.69 — r35 law 10 from the other side); the CHORDS do.
- **The chorus opens off the tonic in 22 of 36; the verse in 20 of 36.**
  Minor songs (24): the chorus opens on i 33%, then **bIII 13% · v 13% · bVI
  13%**, bVIIsus / bII^7 / bII7 / iv7 / Isus 4% each. Major songs (12): I
  33%, **vi 25%** (vi + vi7), IV^7 / IV6 / Vsus / bVII / iii7 8% each. The
  verse opens on i/I 33–42%, otherwise bVI^7 / v / vi.
- **The pre-chorus (the window before a chorus) ends on the TONIC more than on
  the dominant** — i/I 21–25%, v 8%, vi 25% (major), bIII^7 / Isus / IV^7 8%
  each; a literal V→I into the chorus is rare (Vsus 3%). The lift into the
  chorus is texture and register, not a cadence.
- **Skeletons that recur** (labeller output; the r35 loop table stands):
  minor = the andalusian / bVI–bVII family — `i v bVI bVII` (Six Trillion
  Years' verse, ×3), `i bVI bVII` (Senbonzakura, Super Superhero, Lost One's),
  `i iv bVI v` (New Darling), `i bIII^7 bVI^7` (Roki), `bVI^7 i v i` (Hibikase),
  `i bVIIsus` two-chord vamps (Gimme×Gimme, Toosenbo), `i bVI^7 iv6 bIII^7 v`
  (Iya Iya Yo); major = the royal road and its rotations — `IV^7 Vsus iii7 I`
  (Looking for the Moon's chorus), `vi I6 vi7 IV6 IV V iii` (Melt's chorus),
  `vi IV` (Rolling Girl's verse, a two-chord vamp for 32 bars), `I ii v vi`
  (Eh? Ah, Sou.), `vi7 IV^7 IV ii` (Yellow). The **sus chord** is the
  turnaround in both modes (bVIIsus, Vsus, Isus, IVsus).
- **Key changes.** Measured robustly (pc-histogram of voice+acc+bass, best
  transposition by correlation, only when it beats no-shift by 0.08). A
  semitone or whole-tone LIFT of the final chorus: **8 of 36** (+1: Darling
  Dance, Monster, Uminaoshi, Tondemo Wonders, USSEEWA; +2: Ghost Rule,
  Senbonzakura, Yoru ni Kakeru). Mid-song ±1/±2 shifts between sung sections
  (a bridge in a new key, a chorus a tone up): Android Girl, Darling Dance,
  Monster (three), Looking for the Moon, Jigsaw Puzzle, Tondemo, Usseewa, Yoru
  ni Kakeru. Shifts of a fourth/fifth that the same test reports are chord
  EMPHASIS (a section living on the dominant) and are not counted. So: **the
  last-chorus lift is a device in ~1 in 4 songs, not a default.**

## 4. Form: the song is long, the sections are long, the chorus comes late

| measure (36) | median | note |
|---|---|---|
| song length | 137 bars (122–191) | at 162 bpm ≈ 3:20 |
| intro (instrumental, before the voice) | 8 bars (0–24) | 11 of 36 have none; 9 have 16+ |
| first chorus starts at bar | **36** (0–124) | Ievan Polkka, Iya Iya Yo, Vampire and Yoru ni Kakeru OPEN on the chorus |
| verse run (classifier, lower bound) | 16 bars | runs of 4 26% · 8 24% · 12 16% · 16 13% · 20 12% · 24+ 9% |
| chorus run | 16 bars | |
| interludes ≥ 2 bars | 2 per song, 7 bars each (r35) | |
| outro | 8.5 bars (r35) | |

**The layering arc.** Density (acc + bass notes per bar, normalised to the
song's maximum) rises verse → chorus and then DROPS: in **30 of 36 songs a
sung window after the first chorus falls under 40% of the song's peak** — the
second verse strips back to bass + voice (the 18 silent-acc songs above) or a
bridge thins. The final chorus is NOT louder by count than the first
(density ratio 1.03) — its lift, where there is one, is the key (§3) or the
register; the corpus does not pile on a last layer.

**The intro is its OWN hook, not the chorus tune.** Of 23 intros with ≥ 2
two-bar cells in the piano top line, **0** match a sung chorus cell exactly,
0 by intervals alone, 0 by contour; 3 match SOME sung cell by contour. The
intro is a piano/synth RIFF (block8 26%, counterline 13%, arp16 4% …; 6.5 top
notes a bar, 62% single notes) — Rolling Girl's 24-bar piano riff, USSEEWA's,
Senbonzakura's 20 bars, Yoru ni Kakeru's — that the interludes bring back
(interludes restate the chorus melody 0 of 54 times). CAVEAT: the NOTE track
is a reduction; a lead synth that doubles the chorus tune in the recording
may have been left out. What the files show is that the piano's intro
material is not the vocal hook.

## 5. The chorus cell — the shape of the first sung phrase of the chorus (33 songs)

| feature | value |
|---|---|
| starts BEFORE the downbeat (a pickup into bar 1 of the chorus) | **94%** |
| first interval | repeat 39% · step 39% · 4th–5th 9% · wide 6% · 3rd 6% |
| repeated notes among the first four | median 1 |
| position of the highest note within the phrase | 43% of the way (an arch, peak before the middle) |
| onsets off the beat | 50% |
| distinct pitches in the first two bars | 6 |
| starting degree against the chorus's first chord | root 18% · 5th 18% · 6th/13th 18% · 3rd 12% · 9th 9% · b7 9% |

So the hook is: a pickup, a repeated or stepwise opening (never a leap), six
pitches over two bars, the peak just before the middle, half the notes
off-beat, and it starts as often on the 6th or 9th above the chord as on the
root. The voice against the BASS at shared onsets: octave/unison 21% · 5th 17%
· 3rd 16% · 6th 13% · 7th 11% · 4th 10% · 2nd 10% · tritone 2% — the sung note
is a chord tone over the bass two-thirds of the time and a 7th/9th the rest.

## 6. Layering, stated as a cast

The reduction has three parts, and it is worth saying what they ARE in the
recording, because our mixes have seven:

| part in the file | what it is in the recording | what it does |
|---|---|---|
| BASS | electric bass (rock/pop lanes) or synth bass (electro) | root/fifth 8ths, octave 8ths, quarters; ALWAYS present when drums are |
| NOTE, verse | piano single-note line / clean guitar arpeggio / a synth counter-line / nothing | 3 strikes a bar under the voice; often silent |
| NOTE, chorus | piano block chords (2 notes) with the tune on top + distorted guitar power chords (not transcribed) | the octave double, 7 strikes a bar |
| NOTE, intro/interlude | the piano or synth RIFF | the instrumental hook |
| not in the file | drums; a pad/strings bed in ballads; a lead synth in electro | rhythm; sustain |

The corpus norm is therefore **ONE harmonic hand + bass + drums + (in the
chorus) the tune doubled an octave up on that same hand** — plus timbral
doublings (a distorted guitar playing the same power chords as the piano
block, a synth in unison with the riff). It is not five chordal layers each
with its own colour tones. r21/D102 measured game music at 4.16 concurrent
voices; this idiom is thinner still in pitch-class terms (3 pcs per 8th).

## 7. Instruments (his "take note of instruments they use too")

**What the files declare — measured:** a GM program change exists in **2 of 36**
files (both "Acoustic Grand Piano" on every track, i.e. meaningless); **7 of 36**
carry more than one velocity on any part (the rest are a flat 127); every file
carries CC/pitch-bend events but they are the transcriber's, not the
arrangement's. The set is a three-track piano-roll reduction from
aregan.net-style transcriptions (his files' titles match that site's naming),
so instruments **cannot be measured from these files.** The public sources
checked this round do not fix that: aregan.net posts the same piano
reductions; BitMidi has two Miku files (piano); onlinesequencer.net has
multi-instrument Vocaloid covers but its robots.txt disallows Claude and its
download path, so nothing was taken from it; the Internet Archive
"Vocaloid Songs Archive 2007-2020" is 442 MP3s (audio, no part structure,
uncleared); VocaDB's public API returns Instruments-category tags but they
are set on 11 of the 35 originals only. **The table below is knowledge of the
released recordings** (marked K) with VocaDB's genre tags as the measured
anchor (marked V); treat the K column as a listening note, not a count.

| song | producer · year | lane (V = VocaDB genre tags) | instruments (K = knowledge; V = VocaDB instrument tag) |
|---|---|---|---|
| Android Girl | DECO*27 (arr. Rockwell) 2019 | alt-rock / J-rock / pop punk (V) | synth intro, distorted guitars, piano, synth bass, kit (K) |
| Binomi | MARETU 2024 | chiptune / experimental rock (V) | chip pulse leads, distorted guitar, kit (K) |
| Darling Dance | Kairiki Bear 2020 | rock / math rock (V) | piano riff, distorted guitar, synth, kit (K) |
| Eh? Ah, Sou. | chouchou-P 2010 | soft rock / jazz fusion / piano-rock (V) | piano lead, electric piano, bass, kit (K) |
| Ghost Rule | DECO*27 2016 | alt-rock / punk / nu metal (V) | distorted guitars, synth bass, kit, piano; scratching (V) |
| Gimme×Gimme | Hachioji-P × Giga 2019 | electro-pop (K) | saw/pluck synths, synth bass, electronic kit, sidechained pad, vocal chops (K) |
| Hated by Life Itself | Kanzaki Iori 2017 | alt-rock / power pop (V) | piano (V), violin (V), guitar, bass, kit (K) |
| Hibikase | Giga 2014 | electro-house / EDM (V) | saw leads, synth bass, electronic kit, piano stabs (K) |
| Toosenbo | wowaka 2009 | digital rock / new wave (V) | synthesizer (V), electric guitar (V), bass, kit (K) |
| Ievan Polkka | trad. (Otomania arr.) | polka (V) | synth accordion/lead, bass, electronic kit (K) |
| Iya Iya Yo | MARETU 2024 | chiptune / metal (V) | chip square, distorted guitar, kit (K) |
| Jigsaw Puzzle | mafumafu 2018 | rock / J-rock (V) | guitars, piano, strings, bass, kit (K) |
| Looking for the Moon | koyori 2016 | pop rock / digital rock (V) | guitar, piano, synth, bass, kit (K) |
| Love Me ×3 | Kikuo 2013 | experimental / waltz / jazz fusion (V) | piano, bass guitar, drums, accordion, cello, marimba, xylophone, glockenspiel (all V) |
| Love is War | ryo 2008 | alt-rock / nu metal (V) | distorted guitars, bass, kit, strings, piano (K) |
| Melt | ryo 2007 | pop rock / power pop (V) | acoustic + electric guitar, piano, strings, bass, kit (K) |
| Mind Brand | MARETU 2015 | alt-rock (V) | distorted guitar, piano, synth, kit (K) |
| Monster | YOASOBI 2021 | (human) funk-pop (K) | piano, synth bass, electronic kit, synth brass (K) |
| Mousou Kanshou Daishou Renmei | DECO*27 (arr. emon) 2016 | dance-pop / RnB / electro (V) | electric piano, synths, bass, kit (K) |
| New Darling | MARETU 2021 | chiptune / drum and bass / rock (V) | chip leads, distorted guitar, breakbeat kit (K) |
| New Genesis | Ado (Nakata) 2022 | (human) electro / synth-pop (K) | synths, electronic kit, synth bass (K) |
| Uminaoshi | MARETU 2017 | chiptune / digital rock (V) | chip leads, guitar, kit; level-crossing bell (V) |
| Roki | mikitoP 2018 | funk rock / pop rock (V) | slap bass (V), guitar, piano, kit (K) |
| Rolling Girl | wowaka 2010 | alt-rock / emo / piano-rock (V) | piano (V) riff, distorted guitars, bass, kit, synth (K) |
| Senbonzakura | Kurousa-P 2011 | hard rock / wa-fū / folk rock (V) | rock band + shamisen/koto-style synth, brass hits, guitar solo (V) |
| Six Trillion Years | kemu 2012 | rock / digital rock (V) | guitars, piano riff, synth, bass, kit (K) |
| Super Superhero | Pinocchio-P 2025 | electropop (V) | synths, piano, electronic kit, bass (K) |
| Telecaster B-Boy | surii 2019 | pop rock / J-rock (V) | electric guitar (a Telecaster), bass, kit, piano (K) |
| Telepathy | DECO*27 (arr. tepe) 2025 | denpa / pop (V) | bass guitar with slapping (V), otamatone (V), synths, kit (K) |
| The Lost One's Weeping | Neru 2013 | alt-rock / pop punk (V) | electric guitar (V), bass, kit, piano (K) |
| Tondemo Wonders | sasakure.UK 2021 | chiptune / technopop (V) | chip synths, electronic kit, piano (K) |
| Two Breaths Walking | DECO*27 2009 | alt-rock / rock ballad (V) | guitar, piano, bass, kit (K) |
| USSEEWA | syudou / Ado 2020 | (human) punk rock (V) | piano riff, distorted guitar, bass, kit (K) |
| Vampire | DECO*27 (arr. Rockwell) 2021 | pop rock / math rock (V) | synthesizer (V), electric guitar (V), marimba (V), bass, kit (K) |
| Yoru ni Kakeru | YOASOBI 2019 | (human) dance-pop / house / piano-rock (V) | piano riff, synth bass, electronic kit, synth strings (K) |
| Yellow (control) | Coldplay 2000 | western pop | guitars, bass, kit (K) |

**By lane (VocaDB genres, 35 originals): rock-family 22, electro/dance/chiptune
10, pop/ballad/other 3.** The casts collapse to three templates:

- **ROCK (the majority):** kit + electric bass + 1–2 distorted guitars (power
  chords / octave riffs — the chorus block) + piano (verse line, intro riff,
  chorus block with the tune on top) + a synth lead or pad; strings only in
  the ballads (Melt, Hated by Life Itself, Jigsaw Puzzle).
- **ELECTRO / CHIPTUNE:** electronic kit + synth bass (saw or sub) + saw/pluck
  or chip-square leads + piano stabs + a sidechained pad; MARETU's chip lane
  swaps the guitar for pulse leads.
- **POP / BALLAD:** kit (brushed or soft) + bass + piano or electric piano +
  clean guitar + strings / brass hits.

In every template there is ONE chordal keyboard-or-guitar hand, one bass, one
kit, and the rest is unison doubling or a single line. Our casts
(`gm_music_box` + `gm_vibraphone` + `gm_string_ensemble_1` + `gm_marimba` +
piano + a pad on most band cards) are five chordal timbres.

## 8. OUR songs by the same yardsticks (band.html 12, vocaloid.html 14)

**Harmony:** §1. Add: every band song carries ONE progression for the whole
song (`degrees` is one loop; A and B share it; the B* letter is a variation of
it) — the corpus has a different chorus loop in 35 of 36 songs.

**Figures** (`probe-figures-r38.mjs`, the `_acc` solo and the lowest mix layer
under midi 52, same classifier):

| | corpus verse | corpus chorus | OUR verse (26 songs) | OUR chorus |
|---|---|---|---|---|
| acc | line 26% · silent 17% · arp8 11% · block4 11% | **block8 43% · block4 26%** | **block4 40% · arp8 33%** · syncopated 12% | **arp8 38% · block4 33%** · block8 13% |
| bass | root5-8ths 30% · quarters 27% · octave 18% | root5-8ths 56% | **silent 55%** · held 19% · pump8 12% | **silent 50%** · pump8 16% · held 14% |

Our accompaniment plays ONE figure for the whole song (`fnd_wide_oompah`,
`fnd_stride_4`, `fnd_ballad_8ths_arch`, `fnd_broken_tenths` …) — the same
class in verse and chorus on 25 of 26 songs — so the chorus is never a
TEXTURE change; and the corpus's signature chorus figure (chords on 8ths with
the tune on top) appears in 13% of our chorus windows. Our bass is absent
in half the windows: 15 of 26 songs have no layer with a median under midi
52; on the band page the "bass" the probe finds is the guitar (bd_garage), a
marimba (bd_credits) or nothing (8 of 12).

**Doubling:** the acc doubles the voice at the octave in 53% of onsets on
band.html with NO verse/chorus difference (the r35 chorus double is on, but the
`_octave` partner and the acc top voice double everywhere); corpus 16% → 92%.

**Form** (band.html): total 16–48 bars; sections i4 v4 c4 v4 (garage, rival,
ruins, lasttrain, tavern), i8 v8 c8 v8 (airship, credits, victory), v8 c8 v8 c8
(market), i12 v12 c12 v12 (undercity). The whole song is shorter than one
corpus VERSE; the "chorus" arrives at bar 4–12 against the corpus's 36; there
is no second verse to drop out in, no interlude, no pre-chorus, no outro.
Intros are a bar-count of the same accompaniment, not a riff.

**Voice** (`baseline-vocal-r35.py`, the 12 bd_ scores): syllable rate right
(3.1–3.9/s on the fast songs), steps 40–61%, repeats 13–39%, no long notes,
hook cells 0–40% exact repeats — the r35 writer holds. Three gaps: (a)
**breaths of 1.0–2.0 beats** on 11 of 12 (corpus 0.5); (b) **the slow songs
sing 16ths** — bd_lighthouse (70 bpm) 67% 16ths and 6.6 notes/bar,
bd_credits (82) 66%, where the corpus's under-100 band sings 3% 16ths and
6.5 notes/bar at 2.2 syl/s; the syllable law applied below ~100 bpm writes
runs a singer would not; (c) 4–23 phrases a song (corpus 71) because the song
is short.

**Drums:** the r37 kit writer is on and is the one part of band.html the
corpus does not contradict; it is not measured here (the corpus files carry
no drums).

## 9. What "sounds good" is, as far as it can be measured — the rules

1. **THIN HARMONY, IMPLIED CHORDS.** 3 pitch classes per 8th (p90 4); ≤ 1.6
   semitone rubs a bar; 88% of 8ths spell one triad/7th. One chordal hand.
   Colour = sus / m7 / ^7 / 6 on a triad vocabulary; no 9ths/13ths/tritone
   subs. Bass root + two notes + voice, and half the time no third at all.
2. **THE CHORUS OWNS ITS PROGRESSION**, opens off the tonic in 22 of 36 (minor:
   bIII / v / bVI; major: vi / IV^7), a sus chord for the turnaround, the
   same harmonic rate as the verse.
3. **VERSE = LINE, CHORUS = BLOCK.** Verse piano: one note, 3 strikes a bar,
   or nothing. Chorus piano: two-note chords on 8ths with the tune on top
   (the 92% octave double). The figure follows the voice's rhythm; it is not a
   loop cell.
4. **A BASS, ALWAYS, ON 8THS**: root–fifth alternation (chorus), quarters or
   octaves (verse), midi 39–41, strikes an 8th long.
5. **A FORM WITH ROOM**: intro riff 8 (or 16) bars → verse 16 → pre 8 → chorus
   16 → verse 2 THINNED (bass + voice) → chorus → interlude (the riff) → bridge
   → final chorus (lifted a semitone in 1 of 4) → outro. First chorus around
   bar 36; ~140 bars at ~160 bpm.
6. **THE INTRO IS A RIFF OF ITS OWN**, brought back by the interludes; it is
   not the chorus melody on an instrument.
7. **THE CHORUS HOOK STARTS ON A PICKUP** (94%), opens with a repeat or a step,
   peaks before its middle, six pitches over two bars, half its onsets off the
   beat, and often starts on the 6th or 9th of the chord.
8. **THE ARC DROPS AFTER THE FIRST CHORUS** (30 of 36) and the last chorus is
   not thicker than the first — it is higher (key or register) or it is the
   same.
9. **CAST BY LANE:** rock = kit + bass + distorted guitar block + piano +
   one synth; electro = kit + synth bass + saw/chip lead + piano stabs + pad;
   ballad = soft kit + bass + piano/EP + strings. One chordal hand each.
10. **THE VOICE** (r35's twelve laws stand): 8ths, steps and repeats, 8th-note
    breaths, pickups, the hook returning at pitch, a +3–5 chorus register
    lift, one mora per note; and BELOW ~100 BPM the corpus halves the count
    (6.5 notes a bar, 3% 16ths) — the syllable law needs a slow-tempo floor.

## 10. Verification and caveats

- The figure classifier was run on both populations by ONE rule; its first
  version mis-classed straight-8th blocks as syncopated (fixed by the
  tie-over definition); a class table is only as good as its thresholds and
  they are stated in §0.
- The window classifier's verse/chorus split is the r35 composite; both r35
  selectors agreed on every contrast's direction, and the doubling law
  re-measured 16% / 92% here vs 9% / 92% there.
- The "no bass" finding on our pages is a REGISTER test (a mix layer with
  median pitch under midi 52); an accompaniment figure that reaches octave 1–2
  in its own left hand (bd_tavern's oompah spans octaves 1–4) is counted as
  acc, not bass. The corpus has a separate bass part by construction.
- The hook test compares 2-bar cells of the piano top line to sung cells at
  three strictnesses and found nothing at any of them; an octave-shifted
  instrumental double would still match by intervals, so the zero is real for
  what the NOTE track holds. What the NOTE track omits is unknown.
- The key-change test's ±5/±7 shifts are reported and discounted as chord
  emphasis; a hand check on Ghost Rule (labelled +2 final lift) is consistent
  with the recording's final-chorus modulation.
- Populations everywhere are the 36 files; engine-side populations are the 12
  band + 14 vocaloid songs, measured IN THE MIX (D137's trap) except the acc
  figure, which is the `_acc` solo unmasked (the figure class does not depend
  on the mask).

## 11. What this round built from it, and what it measured on the build (D143)

`opts.vocaloidForm` (scripts/audition-songs.mjs) + `src/lib/vocaloid-form.js`
(20 loops, 10 figures, 4 forms — by name only) + `VOCAROCK=1` →
`audition/vocarock.html` (10 songs, 52–80 bars). Rules 1–9 of §9 are wired as
one preset: verse loop (basePin, raw) / chorus loop (the B letters' ctxBarV) /
verse line–chorus block8–bridge block4 figures per letter / intro riff on the
letter-less bars / one silent verse / a bass through varySplit (verse and
chorus figures) / 8-bar sections after the intro caps / the discretionary cast
stood down. Rule 10's slow-tempo floor is `vocalWriter.slowFloor`.

Measured in the MIX (`_acc_mix` — the `_acc` solo cannot show per-letter
figures, the D137 trap caught again on this page's first probe):

| | corpus | vocarock (10) |
|---|---|---|
| acc verse | line 26 · silent 17 · arp8 11 · block4 11% | line 45 · silent 34 · arp8 21% |
| acc chorus | block8 43 · block4 26% | block8 91 · block4 9% |
| acc intro | block8 30 · line 16 · counterline 14% | counterline 100% |
| bass verse / chorus | quarters 27 · octave 18 / root5-8ths 56% | quarters 66 · octave 21 / root5-8ths 81% |
| octave doubling verse / chorus | 16% / 92% | 26% / 100% |
| pcs per 8th · rubs/bar · spells-a-chord (sustain) | 3 · 1.6 · 88% | 3 · 2.4 · 81% (gain ≥ 0.25: 2 · 0.7 · 96%) |
| out of key (mix) | 7.9% | 0% |
| voice syl/s · steps · exact 2-bar repeats | 3.9 · 48% · 31% | 3.8 · 38–53% · 21–50% |
| acc median vs lead median | line top p90 71 under a voice at 68 | 57–65 under 65–71 (first build: 65–77 ABOVE — fixed by seating at octave 3) |
| bass median | 40 (p10–p90 40–48) | 33–50 (seated by tonic; still wider than the corpus — open) |

Open after the build: breath 1.0 beat on 8 of 10 (the writer's phrase-final
quarter + 8th rest; corpus 0.5); vr_snow (84 bpm) holds the 6.5-note floor but
writes 56% 16th pairs for the same reason; the bass register spread; the
writer-path accent envelope (4 distinct lead gains on 7 of 10, pre-existing).

## 12. His first export on the page, and what r39 changed (D144)

Ten cards (2026-09-13). Three themes, then two per-song notes, then a second
message: "none of our songs are actually 'intense, catchy, energetic' … no song
that spews energy yet … add more layers/instruments … lower reverb by default,
increase autotune if you can … more synths when you can with energy and
interesting harmonies that ARE ALIGNED and are harmonic".

| his words | measured on the judged page | r39 |
|---|---|---|
| "the exact same beginning progression used for all the songs???" (7 of 10; "very similar" on an 8th) | every intro = `vf_intro_riff` on the acc voice over the bass — 2 layers, 12–16 onsets/bar; 19 of 45 song pairs shared ≥80% of their 8th-by-8th contour over the first 4 bars; rooftop and lantern identical (same verse loop, same riff). The loops differed; the riff, voice, rhythm and register did not | six intro figures, each row names figure + VOICE + loop (5 rows sit the intro on the chorus loop, which opens off the tonic); lantern's verse loop → `i bVII bVI v`; ghost opens on bass + kit alone. After: **1 of 45** pairs |
| "voice a bit too loud and too much reverb" (9 of 10) | vocal took the LEAD LAYER's room: 0.25 on eight songs (tail 19–21 dB under the sung level), 0.7 on station/snow (10.6 dB under); level at the r36 table (+0 / +1.5 / −1.5 / −4) | `vocalRoom` 0.1 on every row (render default 0.1, no longer the lead's room); every row −3 dB from the r36 table (festival rows pinned −4, not −7); `vocalTune` 0.7 (§ A/B below) |
| "more layers should be added in all the songs"; "no song that spews energy" — then his correction: "doesnt mean a bunch of fast notes. it means good, catchy harmonies with full, energetic, active layers" | the r38 preset stood the whole cast down: 4 layers median in the mix | the energy tier: high = phrased synth HOOK line (B+C, 6 notes/bar with rests) + four-note pad with a rotating voicing + marcato (rock) / synthRise (electro) + seam crash; mid = lighter hook (B) + held pad + chorus descant; low = pad + descant (a 16th-arpeggio first cut was reverted). **7 layers median**; density at gain ≥ 0.25: 3 pcs/8th · 1.56 rubs/bar · fits-a-chord 92% · out-of-key 0% (corpus 3 · 1.28 · 90%) |
| sugar "too casual for a rush" | 128 bpm, 'high' parse but the thinnest chorus | stays 128; high tier, root-fifth bass in the verse too (energy from layers and loop, not tempo) |
| arcade / bike "vocals / melody not as good" | — | `leadSeedSalt: 1` (a different rule-composed line; not measured better) |

His third message: "the descriptions are too 'musical'. make it just regular
users - less descriptive/specific than that but also more energetic scenes on
average" — the row texts are plain player scenes now, instruments moved to
row fields; parse-checked each ("high score" → orchestral, "hot chocolate" →
casino were caught). Six songs moved on mix/cast from the emotion re-parse.

His fourth message named the calm references (romantic waters, somber
citadel, nostalgic snow). Measured: no drums, no bass instrument, single-note
piano arpeggio 14.4 strikes/bar across 55–86, four-note pad at 0.23–0.30 ×
lead, strings counterline + descant across the tune at 0.45 ×, sevenths on
nearly every chord. The calm tier now reproduces that (D144 §5).

Registers after the build (medians in the mix): synth hook 60–67 under leads
at 64–71 (the first cut seated it at octave 4 → 72–79 ABOVE the voice on four
songs — D118 again; now octave 3, saw only, range [3,5]); pad 57–69; marcato
strings 55–67, **77 on boss** (the r15 rule's `tonicPc >= 5 ? 3 : 4` puts D
minor at 4 — open); every new layer 0.32–0.67 × the lead solo's gain.
