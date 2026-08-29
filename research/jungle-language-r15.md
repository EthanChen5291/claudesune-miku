<!-- r15 jungle reference analysis: JP2 SNES + Sburban Jungle + Contra + Battle Cats (audio) + Terraria (audio), 2026-08-28 -->

# Jungle Reference Analysis — the r15 five-source jungle language
*(motif-engine research notes. MIDI: tick-grid measurements via `src/ingest/midi.js`/`corpus.js`. Audio: python3+numpy STFT chroma / band-split onset-flux folding — those are ESTIMATES and are marked with confidence. Engine baseline being tested: jungle law = dorian vamp `0:m7 5 7:m 5` / Stickerbush wash, marimba acc, round tumbao bass onsets 0·3/8·3/4 figure R/5/R+, tumbao_conga+martillo_bongo drums, bpm [100,132].)*

---

## 0. Identifications & corrections (measured, not assumed)

- **contra.mid is the NES Contra stage-1 "Jungle" theme** (confidence high): the bar-4 hook is the famous long-tonic + `5–4–5` turn into a held b7/b3 (`F4(2.5 beats) C5 Bb4 C5 D5 | Eb5 held`, answered `…A4 | Bb4`), preceded by the 16th-note intro run; a TabIt (guitar-tab) export — velocities near-flat (stdev 3.7), one channel literally programmed **Gunshot** playing FX stabs. It loops a ~34-bar cycle ×14 (501 bars).
- **jp2jungle.mid's tempo meta (255bpm, ppq 96) is bogus.** Every onset sits on an 8-tick quantum = 19.6ms ≈ one 50Hz SNES engine frame — a frame-quantized SPC rip. Drum autocorrelation puts the true beat at 200 ticks = 0.490s → **122.4bpm**, true bar 800 ticks (151 bars ≈ 296s). The 48/48/48/56-tick "limp" inside each beat is integer-frame rounding (a 16th = 6.25 frames → played 6,6,6,7), **not authored swing**. Track names self-identify: "The Chaos Continues" (the game's subtitle) / "-=-Jungle Theme-=-".
- **Sburban Jungle** (Homestuck; cookiefonster transcription, NoteWorthy 2015 export): clean 140bpm 4/4, usable accents (38 velocity levels).
- **Both audio references measure exactly 100.0bpm** (flux autocorr peaks at 0.300/0.600/1.200s in both, hop 11.6ms). My first coarse pass returned an identical bogus candidate list for both files — lag-resolution artifact, corrected.
- All five sources are **4/4** (D92 safe). No 3/4, no 6/8 detected anywhere.

---

## 1. Per-source findings

| Source | Tempo | Key/mode (evidence) | Harmony | Bass | Percussion | Melody |
|---|---|---|---|---|---|---|
| **JP2 SNES jungle** (MIDI) | 122.4 (measured, meta bogus) | Center **Gb**, KS margin 0.008 (weak — see §4); melody thirdless | **Gb pedal ~130 bars** (no progression); coda modulates to **G minor-pent** | none in body; coda: straight-8th minor-pent walk, octave-doubled 2 tracks | **16th conga/bongo carpet** 21→39 hits/bar, cowbell punctuation, NO kick/snare; 4-bar loop | pan flute calls, 1.4 onsets/bar, median hold 2 beats (p90 = 8), quartal 1-4-5-b7 |
| **Sburban Jungle** (MIDI) | 140 | **A minor** (KS r=.84, margin .22); dorian `D2` chords + aeolian F both present | 8-bar vamp cov .93: **Am7·Am7·Am7·Em·C6·C6·G6\|D2·C6** (i7–v–bIII6–bVII6/IV2) | constant 16ths ×84 bars, octave-doubled, 5-slot cell **[5 5 b7 5 1]**×3+1 — roots land 16ths 4/9/14, never beat 1 | 16th hats; kick 0,7,8,10; snare 4,12(+7); toms as fills | saw lead, aeolian-pent, octave-bounce cells at 0/6/12; xylophone riff = the acc (below) |
| **Contra Jungle** (MIDI) | 152 | **F mixolydian** + blue b3 (melody 92% mixo collection; KS "Bb major" = same pcs; F final + most frequent chord) | hook vamp **F·Gm·F·F7** (I–ii); chorus **Eb·F·Cm·Fsus** (bVII–I–v–Isus) | 9 onsets/bar stepwise 8th riffing (intervals 0/±2 dominate) | rock kit: ride quarters, snare backbeat 4/12 + 2-bar fill, kick double-stroke gallop 0,1,3,6,7,10,11,14,15 | two square leads in **parallel 4ths** (+5, diatonically bent), 7 onsets/bar |
| **Battle Cats jungle** (audio, HIS example) | **100.0** (high conf) | **C center** (KS C-major r=.67; chroma nearly flat — max pc 9.8% — percussion-heavy; conf LOW-MED) | bass C-stretches with 0.5s **Bb** touches = I↔bVII lean; **Am**-ish darker section ~60–88s; 1–2-bar chroma loop (self-sim peaks 2.5s/5.25s) | mostly tonic pedal + bVII neighbor (bass-register chroma; conf MED) | **kick four-on-floor 0/4/8/12**; mid perc **tresillo 0,3,6(+7)** + 12,14,15 pickups; shaker carpet, accents 6/8/14 | brighter B section 40–60s (centroid 3.1→4.0kHz); sub+bass = 58% of total energy |
| **Terraria Jungle** (audio) | **100.0** (high conf) | E-ish center (KS E-major r=.70, conf LOW) | **no repeating harmonic loop found** — chroma self-similarity decays monotonically = through-composed journey (E/Ab/B region mid, C/Bb late) | (not separable) | kick 0,2,8; snare 4,12 (clean backbeat) | quiet intro 0–10s (−16..−27dB) → peak −4dB at 28–46s → bright section 56–68s → fade |

### 1.1 The Sburban xylophone riff (the "marimba acc" of this corpus) — byte-identical ×84 bars

```
16th:  0     2      4      6    7      9    10   11   12    14
       A3    E4+G4  A4+C5  A3   G4+C5  C5   B4   A4   A3    E4+A4
```
Low-root skeleton at 16ths **0, 6, 12 = 3+3+2** (the additive bar). Dyads are 5+b7, 1+b3, b7+b3; then a b3–2–1 step walk; cadence 5+1. Pitch classes rel A: **1 (41.6%), b3 (20.8), 5 (16.7), b7 (16.7), 2 (4.1)** — minor pentatonic, no 4th, no 6th.

### 1.2 The 3+3+2 skeleton runs through THREE Sburban layers at once

- xylo low roots: 16ths 0, 6, 12 (above);
- saw-lead octave-bounce cells start at 16ths 0, 6, 12 (`A3 A4 A3 A2` per cell);
- bass 5-slot cell `[5 5 b7 5 1]` cycled ×3+pad per bar — roots at 16ths **4, 9, 14** (spacing 5+5+6, a second additive layer rotated against the first).

### 1.3 JP2 percussion carpet (the pure "jungle floor" — 4 minutes of flute + drums only)

Voices (GM): **LoConga ×1096, LoBongo ×1088, Maracas ×554, Cowbell ×391, Ride2 ×226, Splash ×80, OpenHiConga ×44** — no kick/snare/hat. Every 16th slot carries a conga or bongo (they interleave, never double), velocity-accented; cowbell fixed at 16ths **1, 4, 13**; splash/open-conga decorate slot 3, china/ride decorate slots 11–15 on alternate bars. Bar-signature Jaccard: lag 1 = 42%, lag 2 = 90%, **lag 4 = 100% → a 4-bar loop of two alternating 2-bar variants.** Density ramps across the piece 21 → 27 → 39 hits/bar (the arrangement builds by percussion density, not layer count). Measured bar (phase-aligned, `!`=vel≥115):

```
16th:  0    1     2    3    4    5    6    7    8    9    10   11   12   13   14   15
       bng  cwb   bng! oCg! cwb  bng! cga! bng  bng! cga! bng! bng  cga! cwb! bng! cga!
            +cga             +cga            (bar B: slot3=splash, 11=china, 13/14=ride)
```

### 1.4 JP2 pan-flute call grammar

Signature call: `Gb3(1 beat)–B3(½)–Db4(6½ beats held)` = **1–4–5, land LONG on the 5th**; answers climb `1–4–5–b7` (quartal stack complete) or descend `5–4–b2–1`. Top bigrams: Gb→B ×14 (1→4), **G→Gb ×11 (b2→1 upper-neighbor resolution)**, B→Db ×9 (4→5), E→Gb ×9 (b7→1). Scale rel Gb = {1, b2, 4, b5, 5, b6, 6, b7} — **no 2nd, NO THIRD of any kind** (b3 = 0.5%); minor-pent share 80% only because the set is 1-4-5-b7 + colors. Onset habit: 16ths 2, 6, 8 (and-of-1, and-of-2, beat 3) then hold 6–15 beats. 40% of all notes are ≥2 beats.

---

## 2. THE SHARED LANGUAGE (what the five agree on)

1. **No leading tone, anywhere.** Every source is modal with b7: Sburban G-naturals (bVII6 chords), Contra Eb chords + Eb in the lead (mixolydian), JP2 E-vs-Gb (b7 = 16% of flute duration), Battle Cats bass I↔bVII, Terraria (weakly, est.). **Jungle = modal**, split across BOTH thirds:
   - minor side (Sburban vamp, JP2 coda) — our current law;
   - **major side: MIXOLYDIAN (Contra measured; Battle Cats — HIS example — estimated)** — currently missing from the jungle lock.
2. **The quartal core 1-4-5-b7.** JP2's flute is literally this set (thirdless); Sburban's 16-onset ostinato is 100% {1,4,5,b7} (E 38%, G 37%, A/D 12% each); Battle Cats' strongest per-bar chroma triple is C/G/D (stacked 5ths). The mode-defining third lives in the CHORDS and lead cadences, not in the ostinato layer — same color-split law as desert (midi-desert-analysis §3.9), jungle flavor.
3. **Pentatonic melody confirmed**: JP2 80% (minus the third), Sburban lead/xylo minor-pent, Contra 73% major-pent / 92% mixo collection. Chromaticism appears only as the b2→1 upper-neighbor ornament (JP2) and blue b3 (Contra).
4. **A continuous 16th-level top layer in 4 of 5** (JP2 conga carpet, Sburban hats, BC shaker, Contra gallop kick), with the syncopation in an ADDITIVE low/mid layer: 3+3+2 (Sburban, three layers at once) or tresillo 0,3,6 (Battle Cats mid percussion). Backbeat snare exists only on the action side (Contra, Terraria, Sburban lightly).
5. **Ostinato-first, stack-in form.** Byte-identical 1-bar cells repeated for dozens of bars (xylo ×84, bass ×84); Sburban stacks layers in two-bar steps (xylo solo → bass @2 → quartal ostinato @4 → pads @6 → drums @14 → lead @29); JP2 builds by percussion density instead (21→39 hits/bar). Percussion never leads the entry in either MIDI — a pitched riff or a call enters first, drums join within ~2–14 bars.
6. **Busy floor, long-call lead** (contrast): JP2 flute holds 6–15 beats over 27 hits/bar; BC's harmonic layer moves in 2–4.5s strokes over four-on-floor. The lead does NOT compete in density with the floor.
7. **Tempo: groove jungle ≈ 100–122** (both audio refs exactly 100; JP2 122), **action jungle 140–152** (Sburban, Contra). Engine band [100,132] covers the groove side; the action side overshoots it.

---

## 3. Verdicts on the current jungle law + engine-ready deltas

### CONFIRMED
- **Modal vamp harmony** — the dorian trope's shape (i7 + v:m, no leading tone) is exactly Sburban's spine; static-vamp psychology confirmed everywhere except Terraria.
- **Marimba/xylophone acc** — Sburban's acc IS a xylophone playing a 1-bar riff; JP2's floor is mallet-adjacent hand percussion. (Engine `gm_marimba` default: right.)
- **Hand-drum conga/bongo palette** — JP2 is literally LoConga+LoBongo+maracas+cowbell, nothing else. `tumbao_conga`+`martillo_bongo` are the right FAMILY.
- **bpm [100,132]** for groove jungle; **4/4 only**; percussion-forward presence.
- **The tumbao's 0 · 3/8 · 3/4 slots** — that IS the 3+3+2 skeleton measured in Sburban and BC. The skeleton is right; the fill is what's thin (below).

### EXTEND (new engine-ready material)

**E1 — a mixolydian major-side trope** (Contra measured; BC, his own example, leans the same way). Add to JUNGLE_TROPES so the lock isn't minor-only:
```
mod_jungle_mixo_hook:   degrees '0 2:m 0 0:7'          scale mixolydian   (F·Gm·F·F7 hook vamp, 1 chord/bar)
mod_jungle_mixo_chorus: degrees '10b 0 7:m 0:sus'      scale mixolydian   (Eb·F·Cm·Fsus, 1 chord/bar)
```

**E2 — the Sburban vamp as a third minor trope** (differs from both current tropes by its bIII6/bVII6 SIXTH chords — diatonic color, D88-compatible):
```
mod_jungle_sburban: degrees '0:m7 0:m7 0:m7 7:m 3b:6 3b:6 10b:6 3b:6'   (half-bar units, 4-bar loop)
                    answer phrase swaps half-bar 7 to '5:2' (the dorian IV2)
```

**E3 — the xylo/marimba riff figure** (Sburban, transcribed §1.1; over a m7 chord all tokens legal, acc octave 3):
```
onsets:  ['0','1/8','1/4','3/8','7/16','9/16','5/8','11/16','3/4','7/8']
figure:  ['R', '5.7', 'R+.3+', 'R', '7.3+', '3+', '9', 'R+', 'R', '5.R+']
accents on the 0 / 3/8 / 3/4 roots (the 3+3+2 spine)
```

**E4 — quartal wash layer**: a constant-16th two-note oscillation on 5↔b7 with 1/4 placed sparsely (Sburban track 3: E-G alternation, 16/bar, pcs {1,4,5,b7} only). As a support layer it is the jungle analogue of the desert string-oscillation — whisper gain, silent during melody bars per standing law.

**E5 — atmospheric-jungle lead grammar** (JP2): 1–2 onsets/bar, pickup onsets at 1/8 · 3/8 · 1/2 of the bar, land on 4th/5th and HOLD ≥2 beats (median 2, p90 8); pitch set 1-4-5-b7 (thirdless); one b2→1 upper-neighbor ornament per phrase. This is a new sparse-calls mode, far below current melody density targets.

**E6 — JP2 percussion carpet as a vouchable pattern** (calm/deep jungle floor; per-onset sounds from the vc_* pack):
```
grid 16, 4-bar loop = bars A B A B'; every 16th filled, conga/bongo interleaved:
slot:    0        1              2        3        4        5        6        7
sound:   bongo_lo agogo+conga    bongo_lo conga    agogo    bongo_lo conga    bongo_lo
accent:  .        .              !        !        .        !        !        .
slot:    8        9              10       11       12       13       14       15
sound:   bongo_lo conga+conga    bongo_lo bongo_lo conga    agogo+conga bongo_lo conga
accent:  !        !              !        .        !        !        !        !
bar B:   slot 3 → vc_quinto (open tone); slots 11,13 → woodblock/log decorations
+ vc_shaker on 8ths (maracas layer, flat vel)
```
(agogo standing in for GM cowbell; vc_bongo_lo / vc_conga / vc_conga_mute / vc_quinto / vc_shaker all exist in sample-pack-def.) Density note: ~21–27 hits/bar — about 3× the current even-8th tumbao_conga+martillo_bongo pair.

**E7 — Battle Cats groove-jungle kit** (his example; energetic-but-groovy lane):
```
kick (four-on-floor):   0, 1/4, 1/2, 3/4          (lo-band fold: 1.00/.81/1.00/.81 — unambiguous)
mid perc (conga/tom):   0, 3/16, 3/8(+7/16), 3/4, 7/8, 15/16    (tresillo + beat-4 pickup doubles)
shaker: continuous 16ths, accents at 3/8, 1/2, 7/8
```

**E8 — jungle bass, two measured modes** (see CONTRADICTED below):
```
stream (action):  grid 16, all 16 slots, figure = [5 5 7 5 R 5 5 7 5 R 5 5 7 5 R 5]  (Sburban, ×84 bars)
                  octave-doubled (R and R+ together); roots land at 4/9/14 — never beat 1
pedal (groove):   long tonic holds with a b7 lower-neighbor touch each bar-end (Battle Cats, est.)
walk (coda/energy): straight-8th minor-pent walk 4–b7–1–b3–5, octave-doubled pair (JP2 coda)
```

### CONTRADICTED
- **The 3-onset tumbao bass is in NO reference.** All five basses are either constant streams (Sburban 32 onsets/bar incl. octave doubles; Contra 9/bar), pedals (BC, JP2 body — which has NO bass at all for 130 bars), or 8th walks (JP2 coda). The R/5/R+ slot skeleton survives (it's the 3+3+2 spine) but as the ACCENT map of a busier line, not as the whole line. (happy_jungle was JUDGED with the tumbao — keep-law protects it; this delta is for unkept/future jungle only.)
- **Drum density**: current tumbao_conga/martillo_bongo are even-8th (density 8); every reference floor is 16th-level (12–27 hits/bar). The patterns are the right family at half the measured density.
- **"family: major" + minor-only tropes is exactly backwards by the corpus**: the corpus is split minor/mixolydian, and the trope lock currently permits only the minor side while the env declares major. E1 resolves both.
- **No bare son clave found.** BC's mid layer is tresillo(0,3,6)+pickups, Sburban is 3+3+2 — `son_clave_3` as a named jungle pattern has no direct witness in these five (weak contradiction: clave is tresillo-family).
- **Percussion does NOT lead the form.** In both MIDIs a pitched layer or a call enters first and drums stack in after 2–14 bars — the current "percussion-forward" presence is right for the MIX, but an intro that opens with drums alone is unsupported here.

---

## 4. UNCERTAINTIES (for Ethan — each answerable)

1. **Battle Cats key**: the chroma is nearly flat (percussion swamps it; best guess C-center, I↔bVII, Am middle section — LOW-MED confidence). Does C-mixolydian-over-four-on-floor match what your ear hears in your example, or do you hear it minor?
2. **Four-on-floor kick**: your example (BC) runs a dance kick under hand percussion; no other reference does. Should energetic jungle get the four-on-floor + tresillo kit (E7), or is that too "dance" for the jungle lane?
3. **Bass replacement**: r14's round tumbao (R/5/R+) is contradicted by all five references (streams/pedals instead). Replace the default for UNKEPT jungle songs with the Sburban 16th stream + BC pedal split (E8), keeping tumbao only where judged? (happy_jungle stays pinned either way.)
4. **Action vs groove tempo**: groove refs sit at 100–122, action at 140–152 (outside the [100,132] band). Should the jungle env widen to [100,152] with energy choosing the half, or stay groove-only?
5. **Contra's rock kit**: it's a jungle STAGE but a run-and-gun rock arrangement (backbeat, ride, gallop kick, parallel-4th leads). Do you want its sound in the jungle palette (an "action jungle" lane) or filed as action-generic, not jungle?
6. **Terraria is through-composed** (no vamp found at any lag). Is wandering, journey-style harmony something you want jungle songs to be allowed to do, or should the engine stay vamp-based (Sburban/JP2/BC model)?
7. **JP2 tonic**: KS margin is 0.008 (Gb vs E essentially tied — the material is a thirdless quartal field). I read it as Gb-centered by duration (29.6%). Fine to treat "thirdless quartal field over a pedal" as the intended calm-jungle sound?
8. **Sixth ambiguity in Sburban**: dorian D2 chords (F#) and aeolian F naturals both measured (3.4% vs 7.8% duration). I encoded the vamp with the D2 in the answer phrase only (E2). Keep both sixths, or normalize to dorian?
9. **Audio grid phase**: the folded drum grids (E7, Terraria) chose bar-phase by maximizing kick on beat 1 — a half-bar phase error is possible (would swap 4↔12 slots). The kick/snare ROLES are solid; the absolute beat labels are the estimate.
10. **Terraria track identity**: I analyzed the file as given ("Terraria_ Jungle.mp3", 82.5s); Terraria has multiple jungle variants (surface/underground). If this is the underground variant the through-composed verdict may not represent the surface theme.

---

*Scratch scripts: `/private/tmp/claude-501/-Users-ethanchen-Documents-GitHub-motif-engine/7c400b2d-0406-4e06-b7a6-74d15ba16673/scratchpad/r15/analysis/` (probe-midi.mjs, jp2-deep2.mjs, audio-probe.py, audio-probe2.py — rerunnable).*
