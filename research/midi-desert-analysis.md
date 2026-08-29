<!-- NSMB desert + GG Oasis Battle MIDI deep analysis, 2026-08-27 -->

# Desert Reference Analysis — NSMB Desert Theme + GG Oasis Battle
*(motif-engine research notes; all measurements from tick-grid analysis of the MIDI files, cross-checked against raw meta events. NSMB: ppq 96, bar = 384 ticks; GG: ppq 384, bar = 1536 ticks.)*

---

## 0. Corrections to the brief (measured, not assumed)

- **There is NO 66bpm middle section in the NSMB file.** Raw tempo meta events: track 1 has `tick 0: 110`, `tick 0: 66`, `tick 0: 66`, `tick 50: 110`. The 66bpm events all sit at tick 0 and govern only the first 50 ticks (~half a beat — they slow the opening sitar flourish into a rubato gesture). From tick 50 to the end the piece is **110bpm flat**. The "slow middle" impression at 26.4–43.8s is achieved **texturally** (see §1.6) — a lesson in itself.
- The "flute doubling choir" track at idx 12 is the **pan flute**; it is a *literal* double of the choir aahs (identical 108 notes, byte-equal onsets/durations). The separate flute (idx 18) is a different, answering voice.
- Both references are **4/4 throughout** — consistent with the D92 meter ruling.

---

## 1. NSMB Desert (110bpm, 22 bars + pickup, ~48.5s)

### 1.1 Form and arrangement map (bar → time)

| Bars | Time | Section | Active voices |
|---|---|---|---|
| 0–1 | 0.2–4.5s | Intro | sitar flourish → marimba ostinato + percussion |
| 2–11 | 4.5–26.4s | **A: drone groove** | marimba, muted gtr, bass, percussion; melody rotates: choir+pan flute (4–5), flute (6–7), sitar flourish (8) + choir (8–9), flute (10–11); shakuhachi punctuates odd bars |
| 12–19 | 26.4–43.8s | **B: maj7 shuttle** | sitar lead, string oscillation, lead-fifths countermelody, bass+gtr; **marimba TACET 13–19**; flute doubles 15–16 |
| 20–22 | 43.8–48.5s | Retransition + outro | planing resolves, marimba/drone return, sitar closing flourish (bar 21), choir final cadence |

**Tonal plan:** tonic **G** (A section, drone, *thirdless*) → **C** (B section, C^7 ↔ Db^7 Phrygian shuttle) → chromatic planing retransition → G. The pivot into B is a bass walkup **G1–A1–B1 → C2** (bar 12, offs 2/26/38/50) — a diatonic 5-6-7-8 run-up treating C as the new tonic.

### 1.2 The marimba ostinato — the "desert floor" (bars 0–12, 20–22)

**Constant 16th-note stream, 16 onsets/bar, every note staccato (18/24 ticks ≈ 75%), all onsets +2 ticks late (uniform humanize lag).** Per bar, by 16th index 0–15:

```
pitch: C4 F3 G3 D4 | D4 G3 D4 G3 | G3 D4 D4 G3 | G3 D4 D4 G3
vel:   68 43 110 43 | 68 74 68 110 | 43 68 43 68 | 110 43 110 43
```

- So: **broken open fifth G3/D4** (never together — an alternating "murky fifth"), except the **first two 16ths of every bar are C4→F3** — a b7+4 splash (relative to G) that resolves instantly back into the G/D drone. It is an oom-pah in spirit but at 16th-note speed and *one hand-width*: no octave leaps, range a major 6th (F3–D4).
- **Velocity cross-accent:** accents (v110) fall on 16ths **2, 7, 12, 14** — spacings 5+5+2 — a quasi-additive (3+3+2-family) accent cycle inside a flat 16th stream, restarting every bar. This is what makes the drone *shimmer* instead of ticking.
- Bar 12 plays only the first two 16ths (C4, F3) then stops — the ostinato "exhales" into the B section.

### 1.3 Bass + muted guitar (the harmonic floor, bars 2–11)

Bass, per bar (16th positions): `0: C2 | 2: G1 | 5: G1 | 6: D2 | 8: G1 | 12: G1 | 14: F1` → the **F1 at beat 3.5 leads across the barline into the C2 downbeat** (bVII walking into the 4-over-drone splash). Bar 8 variant: **F1–Gb1–G1** chromatic 16th walkup (offs 26/34/50) — a 3-note chromatic slide into the drone. The bass G-hits at 16ths 2/5/12 **lock exactly with the surdo "doum"** (see §1.7). Muted guitar: quarter-note dyads — beat 1: **C3+F3**, beats 2/3/4: **D3+G3**. Same two sonorities as the marimba: the whole A-floor is only 4 pitch classes **{G, D, C, F}** — *no third anywhere*. The mode of the A section is stated entirely by the melodies above it.

### 1.4 Sitar grammar

- **The flourish** (bars 0, 8, 21 — identical): `Ab4(48t)–G4–Gb4–E4–Eb4 → D4 held 300t`, onsets 0/14/24/28/34/44 — six notes crammed into ~half a beat, heavily **overlapping** (slide/meend imitation, not discrete grace notes). A near-chromatic descent of a tritone **landing on the 5th of the drone (D)**, and its top note **Ab = b9/bII over G** — the bII sting is delivered as ornament, not chord. Used as bookends + section punctuation.
- **B-section melody** (bars 12–19, register B3–G5): long-note lyrical phrasing (holds of 90–192 ticks against 14–22-tick ornaments — extreme duration contrast). Grammar observed:
  - **Semitone-wobble ornament**: `E–Eb–E` (bar 12, 3rd vs b3) and `G–Gb–G` (bar 12, 5th vs b5) — a degree oscillating with its chromatic lower neighbor in even 8ths/16ths.
  - **Augmented-2nd rock**: bar 13 `C5–B–Ab–B–Ab–G` — B natural ↔ Ab (aug 2nd), the upper tetrachord of **C double harmonic (G–Ab–B–C)**.
  - **Turn cells**: bar 14 `G–Ab–G–F–E(held)` — 4-note chromatic turn into a long chord tone.
  - **Double stops** (bars 16–17): parallel 3rd/4th dyads on the ornament cells (`C+E`, `B+Eb`, `G+C`, `C5+G5`) — self-accompanied lead.
  - **Tremolo run** (bars 19–20): every note doubled at 16-tick spacing (double-pick tremolo), descending **Ab5–G–Gb–F–E–Eb–D–Db** — a fully chromatic octave-topped descent riding the retransition.
- Melodic scale over the B shuttle = **C double harmonic / Hijaz-Kar: C Db E F G Ab B** (both Db and B natural measured), with b3 (Eb) as blue neighbor only inside wobble cells.

### 1.5 The choir-aahs + pan-flute melody (A section) — vs the sitar

- **Exact unison doubling** (choir = pan flute, both internally octave-doubled: every pitch sounds in two octaves, D6+D5, 2 ticks apart). One melody, three octaves of it (D5/D6 + G4-region chord tones at cadences).
- It is a **section-rotation scheme, not simultaneous counterpoint**: choir+flute own bars 4–5 and 8–9; flute answers bars 6–7 and 10–11; sitar interjects only its flourish (bar 8, first 1.5 beats — the choir enters *after* it at beat 1.5: an interlock, not a collision). **2-bar call, 2-bar response, four times, then the sitar takes an 8-bar B section.** This is the D90 handoff law in the wild.
- The melody itself (bars 4–5, degrees vs G): `5 b5 5 b5 5 6 b7 6 5 | 8 b7 6 b7 6 5 b5 b3 b5 b3 2 1(held 3 beats)`. Scale = **G minor/Dorian pentatonic body (G A Bb D E F) + Db as pure chromatic wobble on the 5th** — the "snake-charmer" semitone oscillation **5↔b5**, phrase arched down to a long tonic. Note: the A-section melody is **not** Phrygian dominant — the exotic markers in section A live in the sitar flourish (Ab=b2) and the b5 wobble; it reads desert by *ornament*, not by scale.
- Variation on repeat (bars 8–9): same phrase compressed, cadence decorated with **Gb+Db → G** (leading tone approached from below with its own fifth) — semitone-from-below final cadence. Final cadence of the piece (bars 21–22) repeats the phrase head and lands G6/G5 on the downbeat of bar 22.

### 1.6 The B section (bars 12–19) — the bII engine, and the fake tempo drop

- **Progression (from bass roots + guitar guide-tone dyads):**
  - Bars 12–17: **C^7 | Db^7 | C^7 | Db^7 | C^7 | Db^7** — bass `C2/G2` vs `Db2/Ab2` (root+5th, low-high octave bounce), guitar dyads `B3+E4` (3rd+7th of C^7) vs `C4+F4` (7th+3rd of Db^7). A **I^7 ↔ bII^7 maj7 shuttle** — the bII sounded as a *chord*, planed a semitone, both chords maj7. Union = **C double harmonic**.
  - Bar 18: **Eb^7** (bass Eb/Bb, guitar D+G) — bIII^7, same maj7 planing logic.
  - Bar 19–20: **chromatic planing of bare fifths rising E5 → F5 → Gb5** (bass E+B, F+C, Gb+Db in even 8ths) stalling a semitone under G — then the G drone simply re-enters at bar 21. Retransition = *approach the tonic from a half-step below with parallel fifths*.
- **Why it feels like 66bpm:** the 16th-note marimba floor is *removed*, bass halves its activity into root–fifth long tones, harmony moves once per bar, the sitar sings in half/whole notes. Harmonic rhythm and surface rhythm halve while the clock never changes. **A breakdown by texture: strip the ostinato, hold the shuttle, let the lead sing.**
- Supporting layers unique to B:
  - **String oscillation** (bars 12–20): staccato 8th-note dyads alternating between **a guide-tone fourth and its semitone neighbor** (`Bb3+Eb4 ↔ B3+E4` over C^7; `C4+F4 ↔ Db4+G4` over Db^7; major-3rd pairs `Eb+G ↔ E+Ab` over Eb^7) — the semitone-wobble device promoted from ornament to *texture*, 8 hits/bar, whisper-dynamics.
  - **Lead-fifths countermelody** (bars 12–18): slow 2–4 notes/bar; contains the pure Phrygian descent **F5–Eb5–Db5–C5** (4–b3–b2–1 on C) and the double-harmonic turn **Eb–Db–C–B–C** (b3–b2–1–7–1).
  - **Shakuhachi**: one dyad `G4+D4` at **beat 3.5 of every odd bar** in A; one note **Ab4** at beat 3.5 of odd bars in B (b6 over C / 5th of Db). A single-note pre-barline punctuation instrument.

### 1.7 Percussion — hand drums only

Histogram (GM): **low timbale 66 ×190, cabasa 69 ×120, open surdo 87 ×54, open hi conga 63 ×54, maracas 70 ×44, open triangle 81 ×22. No kick, no snare, no hi-hat.** A darbuka *doum-tak* ensemble built from GM Latin percussion, ~11–12 hits/bar, in a **2-bar loop** (identical across A and B — percussion never changes, sections change around it):

```
16th:      0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
even bar:  ct .  Sc .  mt St cC t  t  .  ct t  Sm t  cTC .     
odd bar:   ct t  Sc t  mt S  ct .  C  C  ct .  cC mt cT t
(S=open surdo DOUM (always accented, v>100), t=lo timbale, c=cabasa,
 m=maracas, C=open hi conga, T=triangle)
```

- **Doum placement is fully syncopated: 16ths 2 and 5 every bar (beats 0.5 and 1.25), plus 16th 12 (beat 3) in even bars — never the downbeat.** The downbeat is a light cabasa+timbale "tak". Bass G-notes double the doum slots.
- **Triangle rings at beat 3.5 of every bar** — same pre-barline slot as the shakuhachi.

---

## 2. GG Oasis Battle (148bpm chiptune, 4/4, 320 bars = 8.6 min)

### 2.1 Global structure

- **80-bar form looped exactly 4× byte-identically** (bar-signature match at period 80: 100%). Bar = 1.622s; one loop = 129.7s.
- **Tonal plan: F (32 bars, 0–51.9s) → Ab (40 bars, 51.9–116.8s) → F (8-bar riff coda, 116.8–129.7s).** The Ab material is the F material **transposed up a minor 3rd** (near-exact: bass/harmony strictly; the lead's mordent chains get small diatonic adjustments, e.g. `Bb–B–A` → `C–D–C`). **Modulation by wholesale minor-3rd transposition is the entire modulation scheme.**
- Internal phrase blocks (8-bar units): F section = melody A / melody B / riff / riff; Ab section = riff / melody A' / riff / melody B' / riff; coda = riff. **Alternation of 8-bar "sung" blocks and 8-bar "riff-lock" blocks.**

### 2.2 Key/mode — Phrygian dominant markers (measured PC weights)

Lead, F-section (duration-weighted): **F 49.4, Ab 9.4, Gb 9.3, Bb 8.1, C 6.6, A 5.6, Db 4.6, Eb 4.2, E 2.5, B 1.x** — i.e. **F, b2 (Gb!), 3 (A) AND b3 (Ab), 4, 5, b6 (Db), b7/7**. Core vocabulary = **F Phrygian dominant (F Gb A Bb C Db Eb)** enriched to **double harmonic (E natural)** at phrase heads, with b3 (Ab) as the blues/riff third. Ab-section identical shifted +3 (Ab 52.9, A[=Bbb, b2] 7.5, B[=Cb, b3] 11.3, C[3] 4.7 …). **Direct confirmation of the D89 Hijaz doctrine: b2 against the tonic + the raised 3rd, both heavily used.**

### 2.3 The bassline (square 3, ch2) — the battle floor

**Unbroken straight 8ths, 8 notes/bar, full-value (no gaps), for all 320 bars.** One 4-note cell twice per bar:

```
F section:  F3  C3  Db3 C3  | F3  C3  Db3 C3    (1 – 5 – b6 – 5)
Ab section: Ab3 Eb3 E3  Eb3                      (same, +3; E = Fb = b6 of Ab)
```

Not an oom-pah: it is a **rocking 1–5–b6–5 ostinato whose b6→5 half-step sting recurs twice a bar, eight-to-the-bar, hypnotically**. The b6 is the *only* non-chord tone in it — the desert flavor is baked into the bass cell itself. Root motion otherwise: none for 32–40 bars at a stretch (drone psychology at battle tempo). Harmony is a static **i(♮6?) no — static minor-with-b6 field**; there is no functional progression inside a section at all — sections ARE the harmony.

### 2.4 Lead phrase grammar (square 1, ch0)

8-bar melody block = two 4-bar phrases; the melody **never rests more than a beat** (one continuous 32-bar stream — relentless-pursuit energy). Phrase anatomy (bars 16–19, F):

```
b16: Gb4(1 beat) F4 E4 Db4(1.5) E4        ← OPEN ON b2; descend b2–1–7–b6 (Hijaz cell)
b17: Db–E–C(turn) Bb C(2-beat hold) Db–E   ← b6↔7 AUG-2ND ROCK (Db↔E)
b18: Db(E)Db · Db(Eb)C · Bb(C)Bb · Bb(B)A  ← MORDENT-CHAIN DESCENT
b19: Gb(A)Gb · F held 3 BEATS              ← …5→4→3→b2→1, land LONG TONIC
```

- **Mordent cell** = `main(64t) neighbor(64t) main(256t)` — two sixteenth-*triplets* + a held note (64 ticks = 1/6 beat at ppq 384). The chain walks the Phrygian-dominant scale stepwise down to the tonic, **every step ornamented**, including an **aug-2nd mordent Gb–A–Gb** at the b2.
- Phrase B (bars 20–23) answers an octave up: opens **F–Gb–A–Gb** (1–b2–3–b2: the complete Hijaz lower tetrachord as the *hook*), climbs Gb–A–Bb–C5, then the same mordent-chain descent home.
- **Riff blocks**: lead drops two octaves to a straight-8ths riff `F3×3 Eb3 F3×3 | Ab3 F3 Ab3 Bb3 Ab3 F3×3` (**1–b7–1 / b3–4–b3 minor-pentatonic** — the exotic color *leaves* with the melody register) while square 2 plays **the identical riff a perfect 5th up** (`C4/Bb3/Eb4/F4`) — parallel-5th riff lock. Square 2 otherwise rests (it breathes in 8-bar on/off spans).
- **Velocity echo**: repeated riff notes decay **96 → 64 → 32** (built-in pseudo-delay on held tonic 8ths); melody notes flat v96.

### 2.5 Drums

One bar, never varied, all 320 bars (v96 hats / v112 kicks): kick (35) on beats 1 and 3; closed hat (42) filling a **gallop**: per beat `[hit · hit hit]` (16ths 1,3,4 of each beat — the "e" always silent):

```
16th:  1 e & a 2 e & a 3 e & a 4 e & a
       K . h h h . h h K . h h h . h h
```

12 hits/bar. **What makes it read "desert battle": the horse-gallop hat cell + kick 1&3 under a b6–5 straight-8th bass and a b2-opening ornamented lead.** The groove contributes drive; ALL of the desert is in pitch material.

---

## 3. DISTILLED: ranked desert-idiom devices for motif-engine

Ranked by (a) how strongly the device carries "desert" in these references, (b) implementability in the current grammar. Each with the doctrine verdict vs D89/D91 (Phrygian dominant canon).

1. **The bII maj7 shuttle: `0:^7 1b:^7` alternating per bar.** (NSMB B section, bars 12–17: C^7|Db^7 ×3, then `3b:^7` once before the return.) Both chords maj7, roots a semitone apart, bass root+5th, guide-tone dyads (3rd+7th) in the accompaniment. **REFINES doctrine:** the bII "hard against the tonic" is strongest as a *planed maj7 chord pair*, not only a melodic b2 — and it's diatonic color (^7) at the same time, satisfying the color-is-the-norm law. Union scale = double harmonic (Hijaz + natural 7): natural-7 is in-canon for desert, not a violation.
2. **Bass b6→5 sting cell: straight-8th ostinato `1 5 b6 5` (root, 5th below-octave, b6, 5th), two cells/bar, unbroken.** (GG, 320/320 bars.) Energetic-desert floor; implementable as a figure `R ~7 ~8 ~7` at octave 2. **CONFIRMS** Hijaz-fragment-in-the-bass; the semitone lives in the *floor*, not just the lead.
3. **Semitone-wobble ornament ("snake trill"): a melody degree oscillates with its chromatic lower neighbor in even 8ths/16ths — 5↔b5, 3↔b3, and as full texture: accompaniment dyad ↔ its semitone transposition.** (NSMB choir D–Db–D on the 5th; sitar E–Eb–E, G–Gb–G; string 8th-note dyad oscillation `Bb+Eb ↔ B+E`.) Rule: *one wobble per phrase, on a held chord tone*; as a support texture it is the strings-whisper layer (≤0.1 gains per standing law). **REFINES:** desert color can be *injected* into an otherwise minor/pentatonic melody by ornament alone — cures "dark, not desert" without rewriting the scale.
4. **Mordent-chain cadence: stepwise Phrygian-dominant descent 5→4→3→b2→1, each step a `main–neighbor–main` triplet-16th mordent, landing on a ≥3-beat tonic hold.** (GG, every phrase.) Maps to the melody walker as a cadence formula (cadenceNo7-compatible: final is the root; antecedent could stop the chain at 3). The aug-2nd mordent at the b2 step (b2–3–b2) is the signature moment.
5. **Chromatic slide-off flourish (sitar meend): ~6 near-chromatic overlapping notes falling a tritone in half a beat, landing ON THE 5TH, used as intro/section-boundary punctuation (identical every time — a stamp, not a variation).** (NSMB bars 0/8/21: Ab–G–Gb–E–Eb→D held.) Top note = b2-over-tonic. Implement as a fixed pickup figure gated to section boundaries.
6. **Desert floor ostinato: constant-16th broken open fifth (G3↔D4 alternation, never simultaneous), staccato ~75%, with (a) a b7+4 two-16th splash on each downbeat (C4–F3 resolving into the drone) and (b) a velocity cross-accent on 16ths 3/8/13/15 (5+5+2 spacing) restarting per bar.** (NSMB marimba.) This is the calm-desert analogue of #2 — same drone-fifth doctrine at 16th-note granularity; marimba/plucked voice; range kept inside a 6th.
7. **Hand-percussion kit, doum-tak grammar: NO kick/snare/hat for calm-desert.** Voices: deep drum (surdo/low conga) = "doum" **only on syncopated slots (&-of-1 and e-of-2 every bar, +beat 3 alternate bars, never the downbeat)**, always accented; timbale/conga "tak" filling; cabasa+maracas as the shaker layer; **triangle ping fixed at beat 3.5 every bar**; 2-bar loop, ~11 hits/bar, and the loop NEVER changes across sections. For battle-desert: kick 1&3 + hat gallop `x·xx` per beat (GG). Two dp_-style patterns worth vouching: `dp_desert_doumtak` and `dp_desert_gallop`.
8. **Aug-2nd rock: b6↔7 (or the tetrachord's Ab↔B) oscillation on adjacent 8ths/16ths mid-phrase.** (GG Db–E–Db–E; NSMB sitar B–Ab–B–Ab.) The interval itself is the marker; grammar-wise it needs the double-harmonic pitch set from #1. **REFINES:** this is legal chromatic-*sounding* color that is fully scalar — never conflate with dim-chain chromaticism (D88 lesson holds).
9. **Color-split law: the floor is THIRDLESS (bare fifths/fourths, no 3rd anywhere in bass/ostinato/guitar), the LEAD carries the Hijaz color; riff/low-register passages relax to minor pentatonic.** (NSMB A floor = {G,D,C,F} only; GG riff blocks = 1–b7–b3–4.) **REFINES D89 directly:** "all-minor Phrygian read dark, not desert" — the fix observed in commercial practice is *not* PD in every voice; it's a neutral open-fifth drone with PD/double-harmonic concentrated in the lead and its ornaments. Serve the trope raw in the lead; keep the floor empty enough to let the b2 sting.
10. **Rotation + punctuation ensemble: melody handed between voices in 2-bar call/response pairs (choir+flute unison-doubled = call; solo flute = response), with a one-note punctuation instrument at beat 3.5 before odd barlines (shakuhachi dyad on 1+5 in A; single b6 in B).** (NSMB.) Slots straight into the D90 handoff law; the beat-3.5 punctuation is a new, cheap device (one note/2 bars) that reads strongly ethnic.
11. **Sectional breath instead of tempo change: for the "slow" middle, keep bpm, DROP the 16th ostinato, halve bass activity to root+5th long tones, one chord/bar (the #1 shuttle), lead switches to long-note phrasing with ornament bursts.** (NSMB B; the fake-66bpm effect.) This is the desert *breakdown* recipe — compatible with the existing breakdown machinery (strip acc+drums… here: strip ostinato, keep hand percussion).
12. **Battle-loop modulation: transpose the ENTIRE texture up a minor 3rd for the middle section (32→40 bars), return for an 8-bar riff coda; alternate 8-bar sung blocks with 8-bar parallel-5th riff-lock blocks (lead drops 2 octaves, partner voice locks a 5th above, counter-voice rests in 8-bar on/off spans).** (GG.) Also: **velocity echo 96→64→32 on repeated riff notes** as a free chiptune-idiom ornament for synth leads.
13. **Approach-from-below retransitions: (a) enter the shuttle via diatonic bass walkup 5–6–7–8; (b) exit via parallel bare fifths planing chromatically up to a semitone below the tonic, then drop the drone back in; (c) cadence a phrase with leading-tone+its-5th dyad → tonic (F#/Db → G).** (NSMB bars 12, 19–21, 9.) All three are one-bar devices; (b) pairs naturally with a tremolo chromatic descent in the lead (sitar bars 19–20).

**Doctrine scorecard:** Phrygian dominant **CONFIRMED** as the desert lead vocabulary (GG measures b2 at 9.3% and major-3 alongside b3; NSMB's whole B section is built on the bII). Refinements: (1) bII arrives as a *maj7 chord shuttle* as much as a melodic b2; (2) natural 7 (double harmonic) is inside the desert canon, especially at phrase heads and in the b6↔7 rock; (3) the accompaniment should be *thirdless drone-fifth*, not PD-harmonized — the mode lives in the lead + ornaments; (4) both references are 4/4 (D92 safe); (5) percussion for calm desert is a hand-drum doum-tak kit with a syncopated deep-drum, not a rock kit.