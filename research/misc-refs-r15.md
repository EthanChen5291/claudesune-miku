<!-- r15 misc reference mining: get_proto.mid + Whats This (Elfman), 2026-08-28 -->

# Misc Reference Analysis r15 — get_proto.mid + "What's This" (Elfman)

*(motif-engine research notes; all measurements from tick-grid analysis via
`src/ingest/midi.js` + custom scripts in the session scratchpad
(`r15/analysis/*.mjs`). get_proto: ppq 960, 4/4, bar = 3840 ticks. What's This:
ppq 120, mixed 2/4 / 3/4, 2/4 bar = 240 ticks, 8th = 60t, 16th = 30t.)*

---

## 0. Evidence quality (triage before trust)

| file | triage verdict | what that licenses |
|---|---|---|
| get_proto.mid | **performance** (75 distinct velocities, stdev 23.2; 39% off straight grid) | pitch + accents + timing all usable — the off-grid is *authored swing*, see §1.1 |
| Whats This.mid | **quantized-flat** (2 velocities, stdev 0.58; 98.5% on-grid) | **pitch-side evidence only** (A6.2). Durations are still authored (uniform 20-tick staccato is a choice), but every dynamics/microtiming claim below comes from note *placement*, not velocity |

The What's This file is a fan transcription at half tempo: quarter = 81 with
16th-note surface ≈ the film recording's ~162bpm with 8th-note surface (within
4%). All grids below are in the file's own units; "film rate" = double it.

---

## 1. get_proto.mid — identity UNKNOWN; an Online Sequencer export (E major swing-groove)

**Provenance (measured, not guessed):** track names are Online Sequencer's
instrument list verbatim — "Smooth Synth (Classic) | 3", "Cello (Classic) | 12",
"Ragtime Piano | 25", "Electric Drum Kit | 31", "Pizzicato | 20", "Vibraphone |
34" — the "(Classic)" suffix and `| <instrument-id>` are onlinesequencer.net's
export convention, and `get_proto` is that site's download endpoint name. So:
someone's OS sequence, possibly Ethan's own prototype (see UNCERTAINTIES).

**Globals:** 100bpm flat (one tempo event), 4/4 throughout (D92-safe), 34 bars,
~81s. Key: **E major** (KS r=0.909, margin 0.205). PC weights: E 27.2, B 18.9,
C# 14.9, G# 10.3, A 6.7 — plus **C natural 5.7, G natural 4.1, D 3.3** (b6, b3,
b7 mixture; F♮ and Bb near zero).

### 1.1 The swing grid (measured, not vibes)

8th-note phase histogram of all pitched onsets (ticks into each 480t 8th):
`0: 372, 281: 189, 449: 49, 240: 48…`. The off-16th sits at **~281/480 = 58.5%**
— a light 58/42 shuffle (written positions are 288/480 = exactly 0.6 minus a
~7-tick humanize). Phase 449 = grace-note flams (see §1.5), 240 = the few
straight-16th voices (cello runs). **The entire song rides swung 16ths.**

### 1.2 The 6th-chord identity: harmony, hook, and texture are all one sonority

- **Harmonic loop (bars 12–19, from vibraphone pitch-class sets, 53 notes per
  2-bar block):** `{E,G#,B,C#}` ×2 bars → `{C,E,G,A}` ×2 bars → repeat, then
  bar 19 `{B,D#,F#,G#}` = **E6 | E6 | C6 | C6 ×2, turnaround B6** — i.e.
  **I6 ↔ bVI6 (chromatic mediant shuttle), V6 in bar 8 of the 8-bar loop**.
  Engine degrees (6th color via figures, see §3): `0 0 8b 8b 0 0 8b 7`.
- **The melodic hook (Synth Bass trk, b6–9)** arpeggiates the same chord:
  E–G#–C#–B(–G#) = **R-3-6-5(-3)**, on swung offbeat 16ths 6.0 / 7.2 / 9.2 /
  11.2 / 14.0 (x.2 = the swing point).
- **Intro (cello octaves, b0–1):** roots E→D→F#→C at half-bar rate = I bVII II
  bVI, bare octaves — flat-side mixture stated before any triad sounds.
- **Final chord (b33):** E+G#+C#(+C#6) = **E6(no5)** — tonic and relative-minor
  ambiguity held to the last note.

### 1.3 Written-out delay, twice (the production trick worth stealing)

- **Ragtime riff echo (b12–13):** the 3-note cell C#6–B5–E5 repeats at
  alternating gaps **761/679 ticks (avg 720 = exactly a dotted 8th on the swung
  grid)**; after the initial full-velocity statements each tap decays
  **×0.80, ×0.91, ×0.90, ×0.89 ≈ feedback 0.9**. The answering E4+G#4 dyad taps
  decay 101→92→85→78→71→64→56 (×0.905 steady). **Dotted-8th delay, ~0.9
  feedback, written as notes.**
- **Vibraphone cascade (b12–19):** a 6th-chord ladder climbing E3→B5 over 2
  bars on swung 16ths, where each rung is re-struck 1 and 2 sixteenths later at
  fixed velocity terraces **[101, 79, 54, 33]** (≈ ×0.75 per level) — an
  arpeggio carrying its own echo. In the breakdown (b20–23) only the ghost
  survives: C#7/B6/G#6 taps at v72 over pizz+drums — the delay tail *becomes*
  the section.

### 1.4 Drums (Electric Drum Kit, ch10; 34 bars, 21 distinct bar-sigs, flat v77)

Core grid (bars 12–19, per-instrument onset census, 16th positions):

```
16th:   0    2    4    6    8    10   11.2  12   13.2  14
shaker  x              .    x
             hat            .    hat              .    hat   <- off-8ths
        |    marac                marac (ghost x4)     marac
             |    CLAP                       CLAP            <- backbeat 2 & 4
(kick bars: K at 0, 8, 10 + swung ghost at 13.17)
```

Precisely: **shaker on all four quarters; closed hat on every off-8th; clap on
beats 2 and 4; maracas doubling off-8ths with a swung ghost at 11.2; kick only
in "full" bars (1, 3, and-of-3, ghost before 4.5)**. A laid-back shuffle-pop
kit — dp-candidate `dp_swing_chill`. Cymbals: none. Also a **sub-thud pizz
pedal at octave 1** (Db1 for 12 bars, then E1): onsets `0, 7.2/16, 8/16,
10/16, 13.2/16` — kick-like placement; at octave 1 the pitch is vestigial
(consistent with the "bare octave-1 is inaudible" law — here the pluck
transient IS the instrument).

### 1.5 Ornament grammar

- **Crush cell (Ragtime, b14–15):** repeated `E5 … A5+G5` where G5 lands ~24–48t
  (0.1–0.2 of a 16th) after A5 — a flammed **4-with-b3-crush over I6** (A=4,
  G♮=b3 in E), the file's one blues gesture, repeated with the echo decay.
- **Outro noodle (b30):** chromatic turn descent A5–G#5–A5–G#5–F#5–E5–C#5… —
  4↔3 semitone wobble opening a stepwise fall to the 6th-chord tones, over a
  Db(C#) pedal.
- **Section-boundary "?!" stamp (Xylophone b7 and b19, identical):** quartal
  cluster D+G+A → Bb4 → A+B+C#+E resolution — a two-beat interjection at the
  end of each hook statement.

### 1.6 Form (2-bar windows, active tracks)

intro cello (0–1) → drums alone (2–3) → E-octave 16th pulse + thud (4–5) →
hook ×2 (6–11) → **full: cascade + echo riff + crush cell (12–19)** →
breakdown: drums + thud + echo-ghost only (20–23) → sparse Am7 stabs (24–27)
→ reprise (28–31) → outro, ends E6(no5) (32–33). Breakdown = strip everything
but percussion and the delay tail — same "texture, not tempo" law as the NSMB
B-section finding.

### 1.7 Lane verdict

**Not desert, not jungle, not horror.** It's the **goofy/quirky-playful ⇄
chill-groove** axis: swing + toy timbres (vibes/xylophone/"ragtime") + 6th
chords + flat-side major mediants. Shares a mechanism with the Elfman file
(§2.8): major-key floor, borrowed flat-side MAJOR triads as the color.

---

## 2. "What's This" (Danny Elfman) — the goofy-spooky fusion, measured

**Globals:** 88 real bars once the meter map is applied (the fixed-barTicks
pipeline miscounts this file — it alternates 2/4 and 3/4 in blocks):

```
b0:2/4x5  b5:3/4x3  b8:2/4x6  b14:3/4x7  b21:2/4x4  b25:3/4x3  b28:2/4x14
b42:3/4x8 b50:2/4x9 b59:3/4x3 b62:2/4x14 b76:3/4x3  b79:2/4x9
```

Tempo: bars 0–1 at **40bpm** (a half-tempo music-box preamble — bells state the
hook alone), then 81 flat, with **three authored ritardandi** (81→30→81 at
tick 11160 into the first waltz; 75→33→81 at 18292 into the chorus return;
33→20→81 at 20880 into the D-major waltz) — every section-gear-change gets a
fermata brake. Key signature sf=0; actual centers modulate constantly (§2.2).
**No percussion channel at all** — the pulse engine is pizzicato (§2.4).
Ensemble: clarinet (the tune, 732 notes), bass, pizz (806), bells, flute,
oboe, harp.

### 2.1 The melody is dyads: parallel 3rds/6ths, staccato

451 onset clusters: **208 single / 210 dyads / 28 triads / 5 four-note = 54%
harmonized**. Dyad interval census: m3 73 + M3 38 = **111 thirds**, m6 26 + M6
29 = **55 sixths**, P5 30, everything else ≤6. Durations: **610 of ~975 melody
notes are exactly 20 ticks = 2/3 of a 16th** — uniform authored staccato; holds
(40–160t) are reserved for phrase heads and landings.

### 2.2 Tonal plan and the half-step engine

Measured centers: **Dm (via Bb↔A) → Em (via C↔B) → C verse → Db↔C waltz → Db
chorus → verse at Db → D↔Db waltz → finale ends on A MAJOR (V of D)**. Three
independent instances of the same device:

| bars | shuttle | reading |
|---|---|---|
| 3–7 | **Bb ↔ A** (pizz Bb3+D4+F4 ↔ A3+C#4+E4) → Dm at b8 | bVI ↔ V of d minor |
| 18–20, 23–27 | **C ↔ B** (C4+E4+G4 ↔ B3+D#4+F#4) around the Em verse | VI ↔ V of e minor |
| 42–50, 59–61 | **Db ↔ C**, one triad per 3/4 bar | I ↔ VII half-step planing |
| 76–78, 83 | **D ↔ Db** (waltz; at b83 the planing accelerates to half-bar rate) | same, a step up |

**Two root-position major triads a half step apart, alternated per bar, is THE
harmonic signature** — the same object whether it spells bVI↔V of a minor key
or I↔VII of a major one. (This is the desert bII-shuttle's cousin: there the
pair is maj7 and the *upper* neighbor; here plain triads and the *lower*.)

### 2.3 Chromatic bass machinery (three distinct devices, all measured)

1. **Lament oom-pah (b10–16):** bass 16ths alternate low-note/A3 while the low
   note descends chromatically bar by bar: `Eb | D | Db | C | Bb…A | G` —
   harmonized F7/Eb → Bb/D → A7/C# → F/C → Gm/Bb → D/A → Eb/G → G arpeggio,
   then **frozen a full 3/4 bar on C–Eb–Gb–A = a held dim7** (the single
   harmonic-dissonance stamp of the passage) → G pedal → Em verse. A goofy-fied
   lament bass: chromatic descent wearing an oom-pah costume.
2. **Walkup under the verse (b21–30):** B2→C3→Db3→Eb3→E2 (octave-doubled from
   b28), i.e. **5–b6–6–7–8 of Em in half-bar steps**, under the tune's 3rds.
   Verse-figure bass (b34–37): `A | C D | E | F# G` — beats 1, 2, and-of-2 —
   a diatonic-plus-chromatic 6th-span climb.
3. **Static-vs-moving swap (b51–53, b62–64):** bass freezes (F octaves in a
   gallop rhythm — onsets at 8ths 0, 1.5, 2, 3.5 = long-short "dum…da-dum"),
   while the *inner voice* walks up chromatically C–Db–D–E–F (one step per
   beat) under a constant C5/Ab4 16th oscillation. Same wallpaper, swapped
   mover. At b79–82 the bass version returns at half-note rate (Db–D–Eb–F–Gb–
   G–A–Ab) under a frozen Gb+Db/A oscillation.

### 2.4 The pulse engine: pizz chug, no drums

Pizzicato = **the same triad repeated every 16th, all 806 notes exactly 20t
(2/3-16th duty), root position, 8 hits per 2/4 bar / 12 per 3/4 bar**, running
bars 3–50 continuously. At film rate this is the classic Elfman 8th-note pizz
chug. Percussion channel: empty. **The playful floor is articulation + repeated
attacks, not a kit** — a goofy-lane alternative to drums that the engine
already half-knows (staccato comp), here in its pure form.

### 2.5 The signature melody cells (engine-ready shapes)

- **Neighbor-oscillation verse cell (b34, C):** 16th dyads in parallel 6ths,
  upper `C5 B A B | C5 B A C5`, lower `E D C D | E D C E` — oscillation around
  the triad's R and 3, byte-identical on repeat (b34==b36 verified).
- **Chromatic-3rds cell (b35):** upper `B A G A B(hold)`, lower `G F# E F# G`
  — a diatonic upper line over a **chromatic lower neighbor (F# against C
  harmony)**, parallel 3rds; the "wrong-note wink" that makes it read impish
  rather than dark. Same shape at b69 in Db (G♮ inside Db = the same trick).
- **Pedal-and-climb pickup (every 3/4 bar of the verse-question, e.g. b18):**
  dyad hold on beat 1 (R+3), silence, then 8th pickup `R, R+3, 4, R+5, 6` on
  8th-positions 3.5–5.5 crossing the barline — the root re-struck UNDER each
  climb note. Over the planed chord (b6, A major inside d-minor) the climb
  keeps the HOME scale (F♮, G♮ over A) but lands chord tones on the strong
  16ths — a softer cousin of chromCore.
- **Afterbeat internalized oom-pah (b21–22, b28–30):** melody holds R while
  5–3–5–3 sound on the off-8ths — accompaniment grammar living inside the
  tune.
- **Fall-off (b32–33, bells b64–65):** a written-out tumble down the triad
  (C5–G4–E4–C4) after a phrase ends.

### 2.6 Dissonance dosing (the horror-law crossover, counted)

Over 88 bars, the *entire* harmonic-dissonance budget is **~6 one-moment
stamps**: one held dim7 bar (b16), one dim7 harp cascade (b31: A–F#–Eb–C
rolled), two augmented-triad cadence chords (b56 A+Db+F; b84 Gb+Bb+D), two
tritone-dyad pickups (Gb4+C5 into the Db chorus, b56→57 and b65→66), and a
final-cadence B°7 (b86, rolled over two octaves) resolving to an **A-major
final chord — the piece ends on V**, eyebrow raised. Everything else is plain
major/minor triads at 67%-duty staccato. **This CONFIRMS the D93 horror dosing
law from the goofy side: one harmonic device at a time over a consonant floor
— the difference between "spooky-fun" and "scary" is that here the floor
bounces.**

### 2.7 Structure devices

- **Key ratchet, verified to the byte:** the verse figure at C (b34) reappears
  at b68 **transposed exactly +1 semitone (Db)** — every tick and pitch — and
  the waltz then lands at D (b76). Sections repeat a half step up.
- **Music-box preamble:** bells state the hook in 6ths, alone, at literally
  half tempo (40 vs 81), for 2 bars.
- **Handoffs (D90 in the wild):** tune moves clarinet → flute (b12–17 answer,
  b25–27 doubling) → bells take the waltz-climb figure verbatim +1 octave
  (b59–61) → clarinet returns.
- **Meter elasticity:** the 3/4 bars are 2/4 bars STRETCHED to fit the pickup
  climb (the "question" bars); waltz sections then commit to 3/4 in 3–8 bar
  blocks. See §4 — this is the one device the engine must adapt, not adopt.

### 2.8 What makes it playful AND spooky at once (the measured answer)

Playful layer (the floor): major triads, 16th staccato chug at 2/3 duty,
oom-pah, arpeggio-climb pickups, parallel 3rds/6ths, toy timbres
(bells/pizz/clarinet). Spooky layer (the accents): half-step major-triad
planing, chromatic lament bass, dim7/aug/tritone stamps ≤1 per passage,
minor-key framing of major material (Bb↔A *is* d minor), ending on V, bells
first. **Neither layer is diluted — they are separated by role: consonant
bouncy FLOOR, chromatic one-shot ACCENTS.** The same split the desert canon
found (thirdless floor / Hijaz lead), transposed to comedy/horror.

---

## 3. Engine-ready artifacts

1. **Half-step major-triad shuttle** (What's This; goofy-spooky + manor-horror
   preamble): local-tonic form degrees `0 11` alternating per bar (Db↔C, D↔Db,
   C↔B measured); functional form against a minor tonic `8b 7` resolving to
   `0:m` (Bb↔A→Dm measured). Plain triads, root position, one per bar.
2. **6th-chord mediant shuttle** (get_proto; goofy/chill): degrees
   `0 0 8b 8b 0 0 8b 7` (8-bar loop, bar-8 turnaround), the 6th color from
   figures — acc figure `R 3 5 6` / cascade `R 3 5 6 R+ 3+ 5+ 6+` (the `6`
   token, not `7` — plain-triad `7` falls back to b7).
3. **Lament oom-pah** (What's This b10–16): 16th-grid oom-pah `bass, fixed-A,
   alt-bass, fixed-A` where the bass note descends chromatically each bar:
   vs the arrival tonic C: roots `3b 2 2b 1 7b 6 5` then ONE held dim7 bar
   (`0:dim7` cluster) → V pedal. 7 bars + freeze + release.
4. **Verse dyad cells** (vs local chord): oscillation `[R' 7~ 6 7~ | R' 7~ 6
   R']` in parallel 6ths (lower voice `3 2 R 2 | 3 2 R 3`), 16ths, 2/3 duty;
   chromatic variant upper `7~ 6 5 6 7~(hold)` lower `5 5b 3 5b 5` in parallel
   3rds. (`~` marking the non-member literals: over C the B is `~11`, F# is
   `~6`.)
5. **Pedal-and-climb pickup**: last 5 8ths of the bar, onsets 3.5–5.5 (of 6)
   → 4/4 adaptation: onsets `5/8, 3/4, 13/16…` no — cleanest: 8ths at
   `1/2 5/8 3/4 7/8` + next-bar landing; tokens `R R.3 4 R.5 6 → (3rd)`.
6. **Dotted-8th written echo** (get_proto): repeat any riff cell at +3 16ths
   (swing-adjusted), gain ×0.9 per tap; arpeggio-cascade variant re-strikes
   each tone at +1 and +2 16ths at ×0.75/×0.55. Free ornament for synth/mallet
   voices; the GG "velocity echo" finding generalized from repeated notes to
   transposed cells.
7. **dp_swing_chill drum grid** (get_proto, needs swing support): shaker
   quarters / closed-hat off-8ths / clap 2+4 / kick {1, 3, 3.5} sparse, ghosts
   on the swing point (11.2, 13.2 of 16). Swing ratio 58.5/41.5.
8. **Pizz-chug percussion substitute** (What's This): repeated root-position
   triad, every 8th (film rate), duty ~2/3, NO kit — a legitimate goofy floor
   the current drum system could treat as a "drums: none, comp: chug" preset.
9. **Dissonance stamps for the goofy lane** (dosing law import): per song
   budget ≈ one of {held dim7 bar, aug triad at ONE cadence, tritone dyad
   pickup into a chorus, dim7 harp/bell cascade, end-on-V final}. Never two at
   once.
10. **Key ratchet**: restate a judged-good section +1 semitone later in the
    song (byte-exact transposition measured in the reference).

## 4. Doctrine scorecard (CONFIRMS / EXTENDS / CONTRADICTS)

- **CONFIRMS horror dosing (D93)**: 88 Elfman bars, ~6 single-moment harmonic
  stamps, consonant everywhere else — the playful-spooky king uses *exactly*
  the one-device rule.
- **CONFIRMS the floor/accent color-split** (desert §9 analogue): playful
  consonant floor, chromatic accents; mode lives in placement, not saturation.
- **CONFIRMS D90 handoffs** (clarinet→flute→bells verbatim figure transfer)
  and the goofy piano-territory register law (toy timbres, no synth wall).
- **EXTENDS the goofy lane**: parallel-3rds/6ths dyad melody (54% of onsets
  harmonized), chromatic lower-neighbor "wrong-note wink", pedal-and-climb
  pickups, lament oom-pah, pizz chug instead of drums, music-box preamble,
  end-on-V. None of these exist in the engine today.
- **EXTENDS via get_proto**: swung 16ths (58.5%), written dotted-8th echo,
  6th-chord harmony as a lane identity, I↔bVI mediant shuttle.
- **CONTRADICTS D92 (4/4 only)**: What's This alternates 2/4 and 3/4
  structurally; get_proto is 4/4 flat. Adaptation, not adoption: in 4/4 the
  "stretched question bar" becomes a pickup starting at beat 3.5 of a normal
  bar (the climb fits without a meter change); the waltz blocks have no 4/4
  equivalent — skip them.
- **CONTRADICTS nothing in the desert/jungle canons** — neither file speaks
  their language (no iqa, no tumbao, no Hijaz). The half-step shuttle is the
  *lower*-neighbor mirror of the desert bII device; keep them distinct
  (planed plain triads/goofy-spook vs planed maj7s/desert).
- **Tempo machinery gap**: Elfman's three ritardando gear-changes and the
  half-tempo preamble have no engine equivalent (fixed cpm); the fake-slow
  texture trick (NSMB lesson) is the available substitute.

## 5. UNCERTAINTIES (explicit, per Ethan's standing ask)

1. **get_proto's identity is UNKNOWN.** Confirmed only: an onlinesequencer.net
   export (instrument-name convention + endpoint filename). The musical
   content (E major, swung 16ths, E6↔C6, dotted-8th echo, vibes/xylophone) did
   not match any tune I could name with confidence; the hook contour
   1-3-6-5 over I6 is generic enough that guessing would be vibes. **Ask
   Ethan: what is this, and which lane did he add it for?** (If it's his own
   prototype, the devices in §1 are presumably the ASK list itself.)
2. **What's This transcription fidelity**: quantized-flat (2 velocities), so
   every dynamics claim in the film recording is unverifiable here; pitch
   level may be transposed relative to the film (the film's verse is commonly
   cited in D; this file's first verse sits in C). Degrees-relative findings
   are safe; absolute-key ones are not. The pizz track also stops at b50 while
   the song continues — the transcriber thinned the arrangement's back half,
   so "chug bars 3–50" is a floor, not a ceiling.
3. **The 16th-vs-8th frame**: I read the file as a half-tempo transcription
   (its 16ths = film 8ths, 4% error). If Ethan wants the chug/oom-pah grids at
   the file's literal 81bpm instead, halve every rate claim in §2.
4. **`:6` chord quality**: the degrees dialect has no documented 6th-chord
   quality; §3's artifacts route the 6th through figure tokens. If a `:6`
   quality is worth adding to the chord grammar, that's an engine change to
   ratify, not a finding.
5. **Swing**: the engine has no swing/shuffle concept; artifact 7 is
   unimplementable until one exists (a `swing: 0.585` opt applying to 16th
   offbeats would cover both this file and future shuffle references).
6. **chordLoops on both files returned thin/empty** (get_proto: none above
   gates — the texture is arpeggio-led; What's This: one spurious loop from the
   broken fixed-barTicks bar map). All loops reported here were derived
   manually from pitch-class sets + bass roots; treat the pipeline's meter
   handling as a known limitation for mixed-meter MIDI, not a verdict on the
   music.
