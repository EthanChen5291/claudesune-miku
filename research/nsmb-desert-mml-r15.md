<!-- NSMB Desert AddmusicK port + Cloud S.C.A.R.Y. MML deep analysis, r15, 2026-08-28 -->

# NSMB Desert (AMK port) — the definitive desert reference, note-level
*(motif-engine research notes. All measurements from a purpose-built AMK MML
parser (scratchpad r15/analysis/amk-parse.mjs) run over the full channel data
of `New Super Mario Bros - Desert Theme.txt` (port by matheoba) and
`Cloud - S.C.A.R.Y..txt`. Tick unit = AMK tick, 192/whole-note. Cross-checked
against `research/midi-desert-analysis.md` (the official-MIDI ground truth)
throughout. Ethan's note: "egyptian-themed is very good for desert".)*

---

## 0. Method, verification, and corrections to the brief

- **Parser verification:** all 8 channels sum to **8304 ticks total, loop
  point at 1776, loop body 6528 ticks = exactly 17 bars** — byte-level channel
  sync (a porter error would desync; my first parse had #3 short by 768 ticks,
  traced to an AMK ambiguity: `(1)` recall followed by `[...]3` is a recall +
  anonymous loop, NOT a redefinition — AMK forbids duplicate loop labels; with
  that fix #3 matches the other 7 exactly).
- **Tempo:** `t92` → notated-quarter BPM = 92 × 2.44140625 = **224.6**; the
  port is written in doubled note values (notated 8th = real 16th), so the
  real bar = 384 ticks = 2.137 s → **112.3 bpm real** (official MIDI: 110 —
  porter rounding). Cross-check: SPC id666 play-length tag = 81 s; intro
  (1776 t = 9.88 s) + 2 × loop (36.33 s) = 82.5 s ✓ (~2%).
- **First pass ≈ 21.4 bars ≈ 46.2 s** (MIDI: 22 bars + pickup, 48.5 s ✓).
  The `/` loop point sits MID-BAR (16th 7 of bar 4, inside the flute phrase)
  — a splice point, not a musical boundary; the loop = bars 4.4→21.4.
- **THE PORT'S BARLINE IS ROTATED −2 SIXTEENTHS vs the official MIDI.**
  Proof: rotating every port grid by +2 reproduces the MIDI grids EXACTLY —
  bass (port `0:G 3:G 4:D 6:G 10:G 12:F 14:C` → MIDI `0:C 2:G 5:G 6:D 8:G
  12:G 14:F` ✓ note-for-note), kalimba (§5), low drum (port 0,3,10 → MIDI
  surdo doums 2,5,12 ✓), bell (port 12 → MIDI triangle 14 = beat 3.5 ✓).
  The porter heard the C–F splash as a pickup INTO beat 1; the official MIDI
  puts it ON beat 1. Both are internally consistent; **official grid used for
  all engine-ready artifacts below** (it's the convention our floor already
  uses).
- **Instrument-comment error in the file:** `"Bah.brr" ;@42` is wrong —
  sequential assignment makes **Bah = @37** (used as `@37` throughout the
  channels); @42 is a second **Sitar** definition (ADSR $FC $F6 vs @39's
  $FC $F2 — two envelope variants of the same sample).

---

## 1. The harmonic loop — which desert lane is NSMB actually in?

Measured tonal plan (17-bar loop, bars numbered from the port's bar 0):

| Bars | Harmony (bass roots + guitar guide tones + melody spelling) |
|---|---|
| 0–11 (+20–21) | **G drone, thirdless** — entire floor = {G, D, C, F} (bass 1/5/b7/4, kalimba G/D + C–F splash, guitar offbeat D/C). No third anywhere in the floor. |
| 11 (beat 4) | bass walk-up **G–A–B → C** (5-6-7-8 into the new local tonic) |
| 12–17 | **C^7 ↔ Db^7 shuttle**, one chord/bar (bass `$FA $02` channel-transpose +0/+1 confirms: +1 at bars 13/15/17) |
| 18 | **Eb^7** (`$FA $02` +3) |
| 19 | chromatic planing of root+5th pairs **E→F→F#** (bass e4+b4, f4+c5, f#4+c#5) stalling a semitone under G |
| 20 | drone re-entry: kalimba returns (octave up), **B natural held 10 16ths** over it + Eb↔F string oscillation |

**In G-relative degrees:** `0 0 0 0 0 0 0 0 | 5:^7 6b:^7 5:^7 6b:^7 5:^7 6b:^7
8b:^7 (planing) | 0 0` — i.e. the "B section" is a **bII^7 planing pair
built on the 4th degree**, or locally: `0:^7 1b:^7 0:^7 1b:^7 0:^7 1b:^7
3b:^7` in C.

**Lane verdict:** NSMB is **none of our three tropes verbatim**; it is a
**two-section hybrid**: (a) a *thirdless tonic drone* A section whose desert
color lives entirely in ornaments (flourish b2, melody b5-wobble) — closest
in spirit to the legacy-bII lane but with the bII delivered as ornament, not
chord; (b) a **Hijaz-vamp-family B section** — I^7↔bII^7 — that CONFIRMS our
hijaz trope's bII motion but **EXTENDS it: both chords are maj7** (`0:^7
1b:^7`, not our `0 1b 5:m 1b` — no 5:m anywhere, plain-triad version
unattested here), and the vamp sits **a 4th above the home drone**, not on
the home tonic. The Gerudo lane (0:m 8b 10b 7:7) is absent from this piece.
Engine-ready full loop (G tonic, 16 bars):
`0 0 0 0 0 0 0 0 5:^7 6b:^7 5:^7 6b:^7 5:^7 6b:^7 8b:^7 0` (the bar-19
planing is a retransition device, not a chord slot — see §4).

Two structural laws it demonstrates: **breakdown-by-texture** (the "slow
middle" = ostinato stripped + harmonic rhythm halved, clock unchanged — MIDI
§1.6, reproduced here: kalimba tacet bars 12–20), and **sections own their
harmony** (the A drone never states the shuttle; the shuttle never states G).

---

## 2. The bass figure

One cell, kept through BOTH sections (pitch set changes, rhythm doesn't).
Official grid, 16th indices, one bar (A section, concert G1 region):

```
idx:   0    2    5    6    8    12   14
note:  C2   G1   G1   D2   G1   G1   F1
dur16: 0.5  2    1    0.5  0.5  0.5  2
```

- Degrees vs G: **4 1 1 5 1 1 b7** — the b7 (F1, 2 16ths long) walks across
  the barline into the 4 (C2) splash, which resolves instantly to the drone.
  Root G on 5 of 7 onsets. The G hits at 2/5/12 lock with the low-drum doums
  (§3) exactly as in the MIDI.
- **B section keeps the identical onset grid**, pitches become root+5th with
  octave bounce: `C(2) C G↑ G↓ G↑ G↓ G↑` per bar (then ×(+1) for Db bars,
  ×(+3) for Eb — the port literally channel-transposes the same notes).
- Bar 11 variant: last beat replaced by `12:G(2) 14:G(1) 15:A(.5) 15.5:B(.5)`
  — the 5-6-7 run-up into C.
- **Engine-ready tokens** (root-G figure, octave 2 per doctrine): onsets
  `['0','1/8','5/16','3/8','1/2','3/4','7/8']`. The pitch cell needs the
  **subtone pair below the root** (F and C *below* G): figure tokens can't go
  negative, so bind as main figure `['R','R','5','R','R']` at
  `1/8,5/16,3/8,1/2,3/4`… plus a companion octave-lower figure for the
  `0:'~5'` (C) and `7/8:'~10'` (F) splash notes — same workaround the floor's
  `~10` already needs (§5).

---

## 3. Percussion grids (Tabla / Low Drum / Bell) vs our iqa'at

Three voices, roles cleanly split (all single-sample, pitched c4/g4):

**Low Drum (@36, ch #4) = the DOUM.** Official grid: **16ths 2 and 5 every
bar; +16th 12 every second bar** — identical to the MIDI surdo. Durations
3/1/2 16ths (first doum longest). **No downbeat doum, ever.**

**Bell (@32, ch #4) = the ring.** One hit per bar at **16th 14 = beat 3.5**,
4 16ths long — the MIDI triangle slot (= the shakuhachi/Bah slot, §6).

**Tabla (@41, ch #6) = the tak stream.** A strict **2-bar cycle**, 11–13
hits/bar (MIDI: ~11–12 ✓), official 16th indices:

```
bar A (even): 0 2 4 5 6 7 8 10 11 13 14        (11 hits; gaps 1,3,9,12,15)
bar B (odd):  0 1 2 3 4 5 6 8 9 10 12 13 15    (13 hits; gaps 7,11,14)
```

On Bah bars (§6) the tabla **drops its own 14/15-region hits** — it yields
the beat-3.5 slot to the stab.

**vs our iqa'at:** our maqsum (`0,2,6,8,12`), ayyub (`0,3,4,6,8,11,12,14`)
and masmoudi_slow (`0,4,12`) all put a dum ON the downbeat. NSMB (official
grid) **contradicts** that: the doum pair sits at 2,5 — syncopated, with the
kalimba splash + bass owning beat 1. BUT in the **porter's hearing** (grid
−2) the doums fall on `0,3(,10)` — dum on the downbeat, close kin to ayyub's
`0,3` head. So: our iqa'at are consistent with one legitimate hearing of the
same music; the official-grid **doums-at-2-and-5** pattern is a genuinely
different, floatier flavor worth adding as a fourth pattern
(`nsmb_dum: onsets ['1/8','5/16'] (+['3/4'] every 2nd bar)`, dum on
vc_darbuka, with the bell/`7/8` ring as its companion). 12-hit tak stream =
optional vc_darbuka_tak layer using the 2-bar cycle above.

---

## 4. Melody: scale per chord, phrase shapes, ornaments

Duration-weighted pitch-class shares (channels #0/#1/#2, loop body):

| Region | Measured PCs | Reading |
|---|---|---|
| Flute bars (4–5, 8–9, 21) | D 38, G 30, C# 10, F 8, E 6, Bb 5, A 2 | **G–A–Bb–C#–D–E–F = G Dorian ♯4 (Nikriz)** — NOT Phrygian dominant, NOT harmonic minor. The C# only ever neighbors D (5↔b5 wobble) or rocks against Bb (b3↔♯4 aug-2nd). |
| Oboe bars (6–7, 10–11) | G 30, D 24, E 7, F# 7, Bb 6, G# 5, C# 5, B 5, D# 4 | same scale + **cadence chromatics: B♮, G#, D#** (see below) |
| C^7 bars (12,14,16) | **G 35, E 34, B 13, C 9** (=91% chord tones), F# 7, D# 3 | melody **SPELLS C^7** — chromCore confirmed measured; F#/D# only as wobble lower-neighbors |
| Db^7 bars (13,15,17) | G 27, F 21, Bb 15, C 9, Ab 9, E 6, Db 4 | chord tones F/Ab/C/Db + **G♮ = ♯11 rings through the bII chord** (Ens holds G a half-bar over Db^7 — the tonic pedal persists INSIDE the shuttle) |
| Eb bar (18) | G 55, Bb 20, C 17, Eb 5 | Eb6 spelling, melody parked on the 3rd |
| Retransition (19–20) | B 28, D# 17, G 16, F 14 | held **B♮** + planing |

**Where the raised 3rd lands:** never in the running A line. It lands at
**cadences**: (a) bars 8–9 cadence `F#+C# → G+D` (leading tone approached
with its own fifth — the MIDI's Gb+Db→G, confirmed note-for-note); (b) bar
11, the oboes' final dyads `G5+B5 → G#5(+D#5) → C#5+F#5 → D5+G5` — a real
**Hijaz cadence: major 3rd ON the tonic, then a b2-colored dyad, resolve to
1+5**; (c) bar 20: **B♮ held 10 16ths over the returning G floor** with
Eb↔F oscillating above = one bar of pure G Phrygian-dominant field as the
retransition's climax. **Engine reading: desert melody = Nikriz body +
Hijaz cadences; the raised 3rd is a cadence/climax event, not wallpaper.**

**Phrase anatomy (flute A phrase, note-exact, degrees vs G):**
`5(3) b5(1) 5(3) b5(1) 5 6 b7 6 5(1s) 8 | b7(2) 6-b7-6(triplet) 5 b5 b3 b5
b3 2 1(held 12)` — long–short front (dotted-8th+16th real), even-16th run,
**triplet trill on 6-b7-6** (`e12f12e12` = real 16th-triplet), and an
aug-2nd rock `b3↔b5` (Bb↔C#) falling to a 3-beat tonic hold. Identical to
the MIDI degrees, so both sources pin the same tune.

**Handoffs (D90 in the wild):** flute phrase (2.5 bars, octave-doubled,
panned hard L/R — y6 vs y14) → oboe answer (2 bars, harmonized in parallel
4ths/5ths at cadences) → flute → oboe → sitar takes the whole 8-bar B
section. Call/response ×2, then a full section handoff.

**Ornament/slide grammar (sitar):**
- **Opening flourish** = a 3-note descending chromatic SMEAR spread across
  three channels: Ab4 (3 16ths) / G4 (+0.5, held 10) / F#4 (+0.75, held 9) —
  all overlapping (meend), landing D4 held 8. Placed as a **pickup before
  the downbeat** (engine stamp places it at A-starts — same shape, `~13→~7`
  descent confirmed; the port adds cross-voice overlap and pre-barline
  placement).
- **Mid-song stamp** (end of bar 7): five staggered notes Ab-G-F#-E-Eb at
  0.5-16th intervals across #0/#1/#2, durations 0.75–2.5 (overlap).
- **Semitone wobbles** `E-Eb-E` (3↔b3 over C), `F-E-F`; **aug-2nd rock**
  `C5-B-Ab-B-Ab-G` over Db^7 (MIDI bar 13, byte-identical here); **turn
  cells** `C-B-C-D` into long chord tones (4th-oboe, bars 15–16).
- **Retransition descent** (bar 19): triplet-8th chromatic run
  `D#-D-C#-G-F#-F-E-D#-D-C#` with **quarter-tone detunes** (`$EE $80` = +½
  semitone on D and C#, `$EE $70` on E) — the slide-off rendered as literal
  microtuning — **doubled 2 octaves down at a 0.5-16th lag** (slide echo),
  landing the bar-20 held B (det $C0).
- Duration contrast: ornament notes 0.5–1.33 16ths vs holds of 6–16 16ths —
  the D75 "holds cure hyper" law, measured again.

**B-section texture** (#7 strings, v50 = whisper, 16 16ths/bar): the wobble
promoted to texture — over C bars `C↔B` (root↔maj7); over Db bars **`C↔D` =
maj7↔b9 PINCERING the Db root from both semitones**; over Eb `D↔Eb`; bar 19
`Eb↔F`, bar 20 (ch #1) `Eb↔F` 16ths — the b6↔b7 shimmer over the returning
drone. (Same pincer device SCARY uses for horror — §9. Dose and voicing
decide whether it reads exotic or evil.)

---

## 5. The Kalimba ostinato vs our engine floor

Port bar (16 × notated-8th = real 16ths, port grid), velocity nibble from q:

```
G3 D4 D4 G3 | D4 G3 G3 D4 | D4 G3 G3 D4 | D4 G3 C4 F3
v3 v2 v3 v3 | v2 v5 v2 v4 | v2 v3 v5 v2 | v5 v2 v4 v2
```

Rotated +2 to the official grid: **`C4 F3 | G3 D4 D4 G3 | D4 G3 G3 D4 | D4
G3 G3 D4 | D4 G3` = the MIDI marimba bar EXACTLY** (C-F splash on the
downbeat, broken fifth never simultaneous). Our engine figure
`['~5','~10','R','5','5','R','5','R','R','5','5','R','R','5','5','R']`
reproduces this pitch sequence ✓ **CONFIRMED note-for-note by both sources**,
with one register nit: both references play the second splash note as **F3
below the root** (b7 *below* G3); our `'~10'` puts F4 above (tokens can't go
negative — if it ever reads muddy/wrong, bind the splash pair as a
1-onset octave-lower companion figure).
Accents: engine 1.0s at 2,7,12,14 = MIDI v110 slots ✓. The port's own
accents (official grid): v5 at 7,12,14, v4 at 0,9, downbeat demoted to v3 —
a softer cousin; keep the MIDI/engine cycle.
Details worth stealing: **bar 20 the ostinato returns AN OCTAVE UP for one
bar** (deliberate: explicit `<` restores it for bar 21) — a re-entry
sparkle; and the kalimba is **tacet through the entire shuttle (bars
12–20)** — the floor is an A-section identity, not a constant.

---

## 6. The "Bah" hits

@37 (the SMW brass-stab sample, 3134-byte BRR ≈ 174 ms one-shot), fired from
two channels at once:

- **Grid: 16th 14 = beat 3.5 (official grid), 8th-note length, every OTHER
  bar** — A section bars 3,5,7,9,11 (port numbering): **dyad D4 (#3) + G4
  (#6)** — root+5th of the drone, exactly the MIDI shakuhachi dyad G4+D4 in
  the same slot ✓.
- B section bars 13,15,17 (the **Db bars**): single **Ab** = the 5th of the
  sounding Db^7 (= b6 of C — the MIDI shakuhachi's Ab, confirmed). Bar 20:
  single G before the final bar.
- So the NSMB "BAH" law: **a pre-barline beat-3.5 stab, alternate bars,
  voiced root(+5th) of the CURRENT chord; the tak stream mutes around it;
  the bell shares the same slot on non-Bah bars.** Our engine's beat-3.5
  punctuation stamp is this slot — CONFIRMED; extend it to a root+5th dyad
  on a stab voice for energetic desert, alternating bars, not every bar.
- Caveat: in the port the B-section Bah rises Ab4→Ab5→Ab6 across bars
  13/15/17 — an octave-state drift in a `[...]3` loop (`>` uncompensated).
  The MIDI holds Ab4 static; I read the port's rise as a port bug (see §8).

---

## 7. Instrumentation / register map

| @ | Sample | Channels | Notated range | Tuning bytes | Concert anchor (MIDI) |
|---|---|---|---|---|---|
| @35 | Kalimba | #7 | G3–D4 (bar 20: G4–D5) | $07.81 | = G3/D4 marimba ✓ notation ≈ concert |
| @31 | Bass | #5 | G3–C#5 | $07.7B | G1/C2 — sounds ~2 oct BELOW notation |
| @34 | Flute | #0,#1,#2 | D4–G5 (two chan., octave-doubled, panned y6 vs y14 hard L/R) | $03.D1 | melody D5/D6 — sounds ~1 oct above notation |
| @38/@43 | Oboe / 4th Oboe | #0,#1,#2 | G4–C6 | $03.D0 | answers; deep delayed vibrato `$DE $20 $06 $90` = the wail |
| @39/@42 | Sitar ×2 envelopes | #0,#1,#2 | B2–G5 | $02.DC | ≈ concert (MIDI sitar B3–G5); @42 = brighter release for the lead, @39 = softer for flourishes/holds |
| @30 | 4th Guitar | #3,#5 | c4/d4 (A), b4→c7 (B, drifting) | $09.61 | MIDI muted gtr C3–G3 — sounds well below notation. **Quarter-note comp: official 16ths 0,4,8,12 = C on beat 1, D on beats 2/3/4 over the drone (port grid 2,6,10,14 — the same rotation as §0); B/C guide tones in the shuttle** |
| @33 | Ensemble | #1 | G3–C5 | $02.90 | B-section countermelody (holds the tonic-G ♯11 over Db^7) |
| @40 | 4th Strings | #7,#1 | Bb3–F4 | $03.D8 | v50/v80 whisper wobble texture (our ≤0.1 strings law, confirmed again) |
| @36 | Low Drum | #4 (+fills #0/#2 bar 20) | c4 | $07.92 | doum |
| @41 | Tabla | #6 | c4 | $07.6F | tak stream |
| @32 | Bell | #4 | c2 notated | $07.96 | beat-3.5 ring |
| @37 | Bah | #3,#6 | d4+g4 / g#4 | $03.00 | beat-3.5 stab dyad |

One low voice at a time throughout (bass alone owns the bottom; guitar comp
is mid); floor center-panned (y10), doubles split wide — matches our
register doctrine.

---

## 8. UNCERTAINTIES (explicitly unresolved)

1. **Absolute concert pitch per voice** is not derivable from MML alone: the
   `#instruments` tuning bytes scale each BRR sample's unknown native pitch.
   I anchored octaves to the official-MIDI analysis instead of decoding the
   BRR sample fundamentals; per-voice "sounds N octaves from notation" rows
   in §7 are anchored inferences, not measurements. Pitch CLASSES and all
   intervals/degrees are exact.
2. **The barline rotation (§0):** I take the official MIDI's grid as truth
   (splash ON beat 1). The porter's hearing (splash as pickup) is equally
   self-consistent; nothing in the SPC disambiguates. Our iqa comparison
   flips with the choice (§3) — I reported both.
3. **The B-section guitar octave climb** (B4/C5 → B5/C6 → B6/C7 over bars
   12–17, Bah Ab4→Ab6): real in the token stream (net `>` per loop
   iteration), and AMK loops do carry octave state — but the official MIDI
   holds these static. Deliberate crescendo or port bug — undecided; I did
   NOT fold the climb into any engine recommendation.
4. **`$EE` detune sign:** $80/$70 read naturally as +½/+0.44 semitone; $C0
   on the held B could be +0.75 or (if AMK treats it signed) −0.25. The
   quarter-tone *presence* on the retransition is certain; exact direction
   of the $C0 one is not.
5. **AMK default note-length = 8th** (assumed where no `l` given): every
   channel-length checksum (8×8304) validates it indirectly.
6. SCARY: bass notated D vs guitars notated C (§9) assumes both samples are
   same-rooted (all SCARY instruments share tuning $02.00). If Bass1.brr's
   native root differs from the guitars', the D-vs-C grind interval would
   shift; the choir-vs-guitar semitone pincer (the headline device) is safe
   either way only if choir/guitar roots match. No MIDI ground truth exists
   for this track — unverified.

---

## 9. Cloud "S.C.A.R.Y." — what makes it scary (horror lane check)

t51 → **124.5 bpm**, 4/4, bar = 192 ticks/1.93 s. **16-bar choir-only intro
(30.8 s!) + 40-bar loop**; SPC tag 181 s. Layer-block form in 8-bar units
over a riff that NEVER changes pitch: choir+riff / laugh lead / laugh+square
riff ×3 / chug-swap / choir returns. Drums enter with a bar of 16th kicks
(count-in), then a plain **backbeat**: K@0 S@4 K@8 S@12 (+16th kick/snare
pickups at 14–15), 32 bars; final 8 bars: half-time-ish fill pattern
(K@0,2 + rolled S/K turnarounds) = the re-entry riser slot.

- **Floor (consonant, percussive):** bass = **one pitch**, D×11 16th-chug +
  C tail (`0,2,3,4,6,7,8,10,11,12,13,14` grid, two alternating bass samples
  = double-tracked picking; final riff bar fades v212→58 = a performed
  decay). Guitars = **gallop cells** (16th-pair+8th: `0,1,2 | 4,5,6 |
  8,9,10 | 12,13`) on C with Bb/Eb 2-bar tails; the later chug = quarter-note
  C's with Eb-Eb / F-F 16th pickups. PC totals: gtr C 87–88%, bass D 85%.
- **THE one harmonic device (measured, dominant):** the **AngelicalChoir
  whole-bar oscillation C#↔B, planted a semitone ABOVE and BELOW the
  guitars' C** (and maj7/b9 against the bass D). Overlap-weighted
  simultaneity table is unambiguous: top rows are Gtr C vs choir C# (ic1)
  and vs B (ic11), then bass D vs C# (ic11). It is the NSMB string-pincer
  device (§4: C↔D around Db) **slowed to whole bars, sung loud (v224), and
  never resolved** — that is the entire harmonic horror budget. Intro =
  the same C#/B pair alone for 16 bars (with a quiet octave-descending
  double: C#5-B4-C#4-B3), i.e. the device is ESTABLISHED before any floor
  exists.
- **Everything else is timbral:** the Laugh sample used AS the lead
  (pitched: `F F | Eb Eb-E` half-note pairs, then 8th interjections),
  detuned-square descents (`Eb C#-B-Bb-G# → E` — semitone-stack run), the
  angelic-vs-distortion irony, echo `$F4$01` legato smears.
- **Catacombs-lane verdict: VALIDATED.** Near-consonant single-pitch
  ostinato ✓, driving backbeat ✓, ONE harmonic dissonance device over the
  consonant floor ✓ (D93 dosing law, measured), fills as re-entry ✓, the
  rest of the budget timbral ✓. **EXTENDS the lane** with a concrete device:
  *sustained choral semitone-pincer* — a choir pad oscillating maj7↔b9
  around the riff root, one bar per pitch (fits opts.choirPad + the SSO
  chorus; chant-register, merged repeats, no runs — consistent with D93
  choir writing rules). Also NB: 16-bar single-device intro before the drop
  is itself a horror form worth keeping (manor-style bed → catacombs body).
