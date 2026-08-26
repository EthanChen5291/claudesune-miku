# Orchestration research: instrument families per musical function

**Status: CANDIDATE knowledge.** Everything below is standard-orchestration consensus
(Adler, *The Study of Orchestration*; Rimsky-Korsakov, *Principles of Orchestration*;
VSL/timbre references checked by web search) mapped onto this engine's part names and
GM palette. None of it is a fact about what sounds good in *this* engine until
ear-ratified — GM soundfonts are not orchestras (no dynamic swells, uneven loudness,
looped sustains), and several textbook rules have already been contradicted or
confirmed by Ethan's ear (flute inaudibility, music box register cap). Treat every
row as a proposal for audition, never as a verdict.

**Conventions used throughout**

- Octaves are *sounding* octaves, middle C = C4, matching Strudel note names and
  `instruments.js` (`piano lead at 5, piano accompaniment at 2-3`). GM voices play at
  sounding pitch, so orchestral transposition conventions (glockenspiel sounds 2
  octaves above written, etc.) are folded in — the octave written here is the octave
  you write in a pattern.
- Engine part names: `melody_takeover`, `alternate_melody`, `melody_backup`,
  `counter_melody`, `additional_harmony`, `harmony_support`. Register lanes:
  `low`=3, `mid`=4, `lead`=5, `high`=6 (proposal, clamped by instrument `range`,
  occupancy tracked by resulting octave — D46).
- The piano always carries accompaniment (oct 2-3) and, by default, the lead (oct 5).
  All layers are additive on top of that.

**Part ↔ classical function mapping** (so the textbook language lines up):

| Engine part | Classical function |
|---|---|
| `melody_takeover` | principal melody, solo voice |
| `melody_backup` | melody doubling (unison/octave) |
| `alternate_melody` | parallel voice in 3rds/6ths (rhythm-locked second voice) |
| `counter_melody` | countermelody / obbligato |
| `additional_harmony` | rhythmic figuration, inner motion (Alberti, arpeggio, comping) |
| `harmony_support` | sustained inner harmony ("pad", chord pillars) |
| piano LH / bass figures | bass |

---

## 1. Strings

Palette: `gm_violin`, `gm_viola`, `gm_cello`, `gm_contrabass`, `gm_string_ensemble_1`,
`gm_tremolo_strings`, `gm_pizzicato_strings`.

The owner's own example lives here: the violin is three different instruments
depending on function. Strings are the only family that is idiomatic in *every*
function — that is why the orchestral default is "strings do everything, winds and
brass are colors" (Rimsky-Korsakov's foundation principle).

### Per-function behavior

- **Solo melody (`melody_takeover`)** — *Violin*: full range G3–E7; the cantabile
  sweet spot is **A4–E6**; above E6 it turns glassy in GM. *Viola*: darker,
  throatier; melody sweet spot **C4–C5** (its top string); reads as "violin with a
  cold" — good for melancholy takeovers. *Cello*: the classic trap and the owner's
  example — cello **melody does not live in cello bass register**. Bass duty is
  C2–G3; cantabile melody lives on the A-string, **C4–A5**, an octave-plus above
  where the same instrument plays bass (Tchaikovsky/Elgar tenor-register cello).
  A cello takeover cast into the `low` lane will clamp to 3 and sound like a
  droning bass, not a tune — CANDIDATE rule: cello with `parts` containing
  `melody_takeover` should prefer lane `mid`/`lead` and clamp no lower than 4 for
  melodic parts. *Contrabass*: never melody in this palette (comic novelty at best).
- **Doubled melody (`melody_backup`)** — violin at unison with piano lead warms it;
  string ensemble at unison widens it (chorus of players = built-in width). Octave
  below (cello or viola) adds gravity to a climactic lead. Strings are the safest
  doubling family: they blend with everything (Adler: strings + anything works).
- **Countermelody (`counter_melody`)** — the single most idiomatic string function.
  Cello tenor register (**3–4**) singing underneath a piano lead at 5 is the
  textbook countermelody (an octave-plus of clear air between the lines). Viola at
  3–4 works the same but softer. Violin countermelody should sit *above* the lead
  (6) only in thin textures — above and busy fights the tune.
- **Sustained inner harmony (`harmony_support`)** — `gm_string_ensemble_1` is the
  family's pad: divisi-style sustained chords centered **3–4**, top voice below the
  lead. `gm_tremolo_strings` is the same function plus tension — use it as a
  *dramatic* harmony_support (battles, dread), never as a neutral bed; tremolo is
  an effect and fatigues fast. Solo violin/viola sustained double-stops read as
  thin in GM — prefer the ensemble patch for pads.
- **Bass** — cello **C2–G3**, contrabass **E1–G3** (real double bass sounds an
  octave below written; in sounding octaves keep GM contrabass at **1–2**, above
  G1 for pitch legibility). Contrabass doubling cello an octave below is the
  classical bass default. In this engine the piano LH owns the bass, so string
  bass is reinforcement: root-and-fifth long notes or pizzicato roots on the beat.
- **Rhythmic figuration (`additional_harmony`)** — `gm_pizzicato_strings` is the
  string family's figuration voice: dies instantly, so it is pure rhythm — off-beat
  chords at 3–4, walking roots at 2, staccato ostinati. Bowed-string ostinato
  (repeated 8ths/16ths on `string_ensemble`) is the film-score engine-room figure:
  works, but it is an onset-heavy bed — budget it like a second accompaniment.

### Register sweet spots (sounding)

| Voice | Bass | Harmony | Countermelody | Melody |
|---|---|---|---|---|
| violin | — | 4–5 | 5–6 | **4–6** (A4–E6 best) |
| viola | — | 3–4 | 3–4 | **4** (C4–C5 best) |
| cello | 2–3 | 2–3 | **3–4** | **4–5** (A-string) |
| contrabass | **1–2** | — | — | — |
| ensemble/tremolo | — | **3–4** | — | 4–5 (unison tutti only) |
| pizzicato | 2 | 3–4 (offbeats) | 4 (staccato) | — |

---

## 2. Woodwinds

Palette: `gm_flute`, `gm_oboe`, `gm_clarinet`, `gm_bassoon`, `gm_recorder`,
`gm_ocarina`, `gm_pan_flute`.

Winds are *register-personality* instruments: unlike strings, each wind has strong
and weak octaves, and the same instrument in a different octave is a different
color. Function assignment must be register-aware or the part vanishes or honks.

### Per-function behavior

- **Solo melody** — *Flute*: sweet spot **5–6**; its low octave (4) is breathy and
  disappears against any texture — this is exactly Ethan's confirmed "didn't really
  hear the flute" finding; CANDIDATE rule: flute melodic parts clamp no lower
  than 5. *Oboe*: the plaintive soloist, **A4–C6** (octaves 4–5); most penetrating
  wind per note — a little goes far. *Clarinet*: two usable personalities —
  chalumeau (**3–4**, dark, liquid) and clarion (**5**, singing); the throat notes
  around G4–Bb4 are weak; most agile wind, happily takes leaps and runs.
  *Bassoon*: tenor register **3–4** is a real melody voice (plaintive or comic);
  below that it is a bass instrument. *Recorder/ocarina/pan flute*: melody-only
  voices — recorder **5**, ocarina **5–6**, pan flute **4–5**; all soft-spoken,
  suited to sparse, exposed textures (shops, quiet water), not to cutting through
  a busy piano.
- **Doubled melody** — flute one octave *above* a string/piano lead is the
  classical brightener (the most common doubling in the repertoire). Clarinet or
  oboe at the unison thickens without brightening. CANDIDATE: for `melody_backup`,
  bright winds go +1 octave, reedy winds stay at unison.
- **Countermelody** — clarinet chalumeau (3–4) under a lead at 5 is idiomatic and
  stays out of the way; oboe countermelody works but steals attention — only when
  the lead rests (its enters-in-gaps behavior must be strict). Bassoon at 3 is the
  quiet workhorse counterline. Flute countermelody only above the lead (6) and
  only in thin textures.
- **Sustained inner harmony** — winds *can* pad (chorale spacing, 3–4), but solo GM
  winds exposed on long notes sound static (no vibrato bloom). Oboe is a poor
  blender — **never oboe as pad**. Clarinet + bassoon long tones at 3–4 is the
  usable wind pad in this palette; still, prefer real pads/strings for
  `harmony_support` and keep winds for lines. CANDIDATE: winds get
  `harmony_support` only when no pad/string/horn is available in the slate.
- **Bass** — bassoon **Bb1–F3** doubling the piano LH or cello line at pitch;
  staccato bassoon bass is the classic comic walk. No other wind plays bass.
- **Figuration** — clarinet arpeggios across the break (3–5) are idiomatic;
  flute 16th filigree at 6 decorates; bassoon staccato 8ths at 2–3 is
  accompaniment character. Winds need breath: figuration should phrase in 2–4 bar
  spans with rests, not run wall-to-wall.

### Register sweet spots

| Voice | Weak | Harmony | Countermelody | Melody |
|---|---|---|---|---|
| flute | 4 (inaudible) | 5 | 6 (thin textures) | **5–6** |
| oboe | below A4 (honky) | avoid | 4–5 (lead resting) | **4–5** |
| clarinet | G4–Bb4 throat | 3–4 | **3–4** (chalumeau) | 5 (clarion) or 3–4 (dark) |
| bassoon | top 5th | 2–3 | **3** | 3–4 (tenor) |
| recorder/ocarina/pan | — | — | 5 sparse | **5(–6)** |

---

## 3. Brass

Palette: `gm_french_horn`, `gm_trumpet`, `gm_muted_trumpet`, `gm_trombone`.

Brass is the *loudness* family: one brass voice balances two or more of anything
else (Adler's balance ratios). In a GM mix this means level discipline, and it means
brass entries should coincide with everyone else thinning.

### Per-function behavior

- **French horn = harmonic glue.** Its defining orchestral job is sustained
  mid-register chords (**C3–C5**, sweet spot 3–4) that bind strings to winds — it
  blends with both families better than any other instrument (verified: "blending
  imperceptibly… merging seamlessly into softly pulsing winds or strings").
  CANDIDATE: horn's *first* part preference should be `harmony_support` at lane
  `mid`/`low`, ahead of melody. Horn melody is the second personality: noble,
  slow-moving lines **3–4**, wide intervals fine, fast runs not — reject horn for
  melodic parts when the line exceeds ~2 notes/beat.
- **Trumpet** — melody sweet spot **4–5** (G4–G5 core); heroic takeovers,
  fanfare figuration (repeated-note triplets, arpeggio calls). As harmony it
  dominates — sustained open-trumpet chords swallow the mix; avoid trumpet
  `harmony_support` unless the section *is* a brass moment.
- **Muted trumpet** — a different instrument: thin, nasal, quiet. Idiomatic as
  wry `counter_melody` at **4–5**, or comping stabs (`additional_harmony`,
  short off-beat chords, jazz-adjacent). Never as a sustained pad — the nasal
  band beams straight through everything at any level.
- **Trombone** — chord pillar and bass reinforcement: **Bb2–Bb3** sustained
  (harmony_support in the `low` lane), noble tenor melody **2–4** at slow speeds.
  The slide is the constraint: **no fast diatonic runs, no rapid figuration** —
  legato trombone 16ths is a top-tier anti-pattern. Trombone + horn long tones at
  2–4 is the classic brass bed under a climax.
- **Bass** — trombone can double the bass at 2; horn pedal at 2 is soft glue.
  Neither replaces a bass instrument.
- **Doubling** — trumpet doubling a lead at unison = the lead becomes a trumpet
  line (it annexes anything it doubles). Horn doubling cello/viola melody at
  unison is the classic warm reinforcement that *doesn't* annex.

### Register sweet spots

| Voice | Bass/pedal | Harmony | Countermelody | Melody |
|---|---|---|---|---|
| horn | 2 | **3–4** (the glue) | 3–4 slow | 3–4 noble, ≤2 notes/beat |
| trumpet | — | 4 (loud sections only) | 4–5 sparse | **4–5** |
| muted trumpet | — | stabs 4 | **4–5** | 4–5 (wry, thin) |
| trombone | 2 | **2–3** | 3 slow | 2–4 slow only |

---

## 4. Bells & mallets

Palette: `gm_glockenspiel`, `gm_celesta`, `gm_vibraphone`, `gm_tubular_bells`,
`gm_marimba`, `gm_xylophone`, `gm_music_box`, `gm_kalimba`.

The family rule: these are **attack** instruments — the transient is the message and
the decay is unearned. High metal (glock, xylo, celesta top) *decorates* lines;
wood and low metal (marimba, vibes) can *carry* function.

### Per-function behavior

- **Glockenspiel: decoration, never the whole melody.** Its orchestral job
  (verified) is doubling melody peaks in other instruments at 1–2 octaves above —
  flute/celesta/harp partnerships. Sounding register **5.5–7**; every note is a
  needle. A glockenspiel carrying a full 16th-note melody alone is the canonical
  anti-pattern: piercing, fatiguing, no line. CANDIDATE mechanical rule for
  `melody_backup` on glock/xylophone: **thin the doubled line to accents** —
  first onset of each beat group / phrase peaks only, never 1:1. (Engine already
  holds glock to `melody_backup`/`counter_melody`, level 0.7 — consistent.)
- **Xylophone** — same thinning rule; additionally idiomatic as staccato comic
  melody at **5–6** in *short bursts* (2–4 bars), and as dry rhythmic doubling of
  a figuration's accents.
- **Celesta** — the gentle one: real melody at **5–6** in delicate textures,
  arpeggio figuration 4–6, blends where glock cuts. Good `melody_takeover` for
  music-box moods without music-box shrillness.
- **Vibraphone** — the family's harmony voice: soft attack + long ring makes it
  the only mallet that does true `harmony_support` (sustained chords **3–5**) and
  slow countermelody. Sits under a piano naturally (engine character note agrees).
- **Marimba** — the family's figuration voice: dry broken-chord ostinati **3–4**
  keep busy lines legible where piano smears (engine agrees); round melody 4–5.
- **Tubular bells** — punctuation only: one stroke on a downbeat / chord change,
  **3–5**. Never melodic lines, never more than ~1 stroke/bar (engine agrees).
- **Music box / kalimba** — music box: fragile melody/counter at **4–5** (Ethan's
  ratified cap: shrill above 5). Kalimba: ostinato figuration **4–5**, soft
  countermelody; decays too fast for harmony.
- **Bass** — none. Marimba's low octave (2) is a special effect, not a bass.

### Register sweet spots

| Voice | Figuration | Harmony | Counter/decoration | Melody |
|---|---|---|---|---|
| glockenspiel | — | — | **6** accents only | never alone |
| xylophone | accent doubling 5–6 | — | 5–6 staccato | 5–6 short bursts |
| celesta | 4–6 arps | — | 5–6 | **5–6** delicate |
| vibraphone | — | **3–5** | 4–5 slow | 4–5 |
| marimba | **3–4** | rolls 3–4 | 4 | 4–5 |
| tubular bells | — | 1 stroke/bar 3–5 | — | never |
| music box | 4–5 | — | 4–5 | **4–5** (capped) |
| kalimba | **4–5** | — | 4–5 | 4–5 thin texture |

---

## 5. Keys & organ

Palette: `gm_epiano1`, `gm_harpsichord`, `gm_church_organ`, `gm_accordion`.

These live closest to the piano, so their differentiator is *touch contrast* with it
(the engine's lane-sharing rule already encodes this).

- **Electric piano** — the natural `melody_takeover` at **4–5**: same touch family
  as the piano so the handoff is seamless, different enough in timbre to register
  as a new voice (engine character agrees). Also comping `additional_harmony` at
  3–4 (off-beat chords). Weak as pad — its sustain decays.
- **Harpsichord** — pure figuration: broken chords and continuo motion **3–5**
  (`additional_harmony`, `counter_melody`). Zero dynamics means it can never fight
  for lead in a loud texture; in quiet eerie textures its melody reads. Never
  sustained harmony (no sustain to give).
- **Church organ** — maximal `harmony_support`: unwavering sustained weight
  **2–4**, plus true pedal bass at 1–2. Two cautions: (1) it never breathes, so it
  erases the phrase-shape of anything it pads under — reserve for sacred/grave/
  epic; (2) it is a mass budget hog — organ + any pad = wash. Never agile
  figuration on full organ.
- **Accordion** — wind-like sustain in a keyboard: sustained chords **3–4**
  (`harmony_support` with folk color), melody **4–5** (tango/folk/waltz
  character). Its vibrato-less GM sustain reads flat on very long notes — prefer
  re-attacked chords on the harmonic rhythm.

---

## 6. Plucks, harp & guitar (+ bass voices)

Palette: `gm_orchestral_harp`, `gm_acoustic_guitar_nylon`, `gm_acoustic_bass`,
`gm_synth_bass_1` (with `gm_pizzicato_strings` shared from strings).

- **Harp — two different instruments by register** (the owner's violin point,
  restated). *Figuration harp*: arpeggios and broken chords sweeping **3–6** — the
  defining role, `additional_harmony`. *Bass harp*: plucked low octaves **1–3**,
  resonant single notes on chord changes — a soft bass that rings; needs space
  (nothing else attacking the same beat down there). Harp *melody* is real but
  niche: bell-like single line **4–5** in thin textures only. Harp glissando =
  section-boundary punctuation, once. **Key conflict rule**: harp figuration and
  piano accompaniment do the same job in the same registers — CANDIDATE: harp
  `additional_harmony` must land ≥1 octave away from the piano accompaniment's
  octave (piano at 2-3 → harp at 4–5), or only sound when the piano figure thins.
- **Nylon guitar** — accompaniment first: fingerstyle arpeggio **3–4**, bass+chord
  patterns (self-contained oom-pah), off-beat chords. Intimate melody **4–5** in
  sparse textures. As `harmony_support` it fails (plucked decay) — keep it on
  `additional_harmony` / `counter_melody`.
- **Acoustic bass** — bass lane only, **1–2**: root motion, walking lines
  (`additional_harmony` in the low register is "walking bass" here). Never melody,
  never above 3. One bass voice at a time — if the piano LH is already playing
  low-register bass figures, the acoustic bass either doubles that line at pitch
  (mass, no new onsets) or stays out.
- **Synth bass** — same lane discipline, **1–2**; sustained roots (bed) or driving
  8ths (motion). Brighter than acoustic bass, so it tolerates busier lines.

---

## 7. Pads & choir

Palette: `gm_pad_warm`, `gm_pad_halo`, `gm_pad_new_age`, `gm_pad_bowed`,
`gm_choir_aahs`, `gm_voice_oohs`.

- **Pads are `harmony_support` and nothing else.** Slow attack means a pad never
  *speaks* — give one a moving line or short notes and you get smeared silence.
  Mechanical rule: pads take notes ≥ 1 beat, ideally ≥ 1 bar, re-attacked only at
  chord changes. Center octave **3–4**, top voice below the lead's octave.
- **The low-interval limit is the family's cliff**: closely voiced pad chords below
  ~C3 are mud in any timbre. CANDIDATE mechanical rule: below C3 permit only
  octaves and perfect fifths; thirds live above C3, and complete close triads
  above G3. (This rule is family-independent — it applies to organ, strings and
  trombones too — but pads hit it hardest because they sustain continuously.)
- **How many sustained voices before mud**: classical practice keeps the sustained
  bed to one coherent choir of sound. CANDIDATE: at most **2 sustained layers**
  total above the piano (e.g. pad + horn, or strings + choir) and they must occupy
  different octave regions; a third sustained layer replaces one of the first two,
  never joins them.
- **Choir aahs — pad vs melody are different instruments.** As pad: **3–5**,
  instant emotional weight, the most human bed in the palette. As melody: only on
  slow lines (notes ≥ half a beat at moderate tempo, ideally longer) — fast vowel
  melisma is GM choir at its worst. The strongest choir move is *doubling* the
  lead at unison on a climactic section (`melody_backup`) — instant "finale" —
  reserve it for arc peaks or it cheapens.
- **Voice oohs** — the darker, softer sibling: inner harmony **3–4**, subliminal
  doubling of a pad's top voice. Rarely melody.
- **Pad differentiation** (CANDIDATE, by GM character): `pad_warm` = neutral bed;
  `pad_bowed` = string-adjacent (pairs with orchestral moods); `pad_halo` =
  airy/high, can sit at 4–5; `pad_new_age` = glassy, thinner, tolerates 4–5.

---

## 8. Synth leads

Palette: `gm_lead_1_square`, `gm_lead_2_sawtooth`, `gm_lead_3_calliope`.

- **Square** — the chiptune soloist: melody **4–5**; thin enough that it also works
  as `counter_melody` at **5–6** (the NES two-pulse texture: lead + echo/counter
  voice an octave up). Idiomatic doubles: square +1 octave above its own line
  (classic 2A03 sound). Sustains without decay, so it can hold long notes a piano
  can't — good takeover on sustained-note melodies.
- **Sawtooth** — broadband: commanding `melody_takeover` at **4–5**, but it eats
  spectrum — while a saw lead plays, sustained harmony should thin (its overtones
  already fill the pad's band). Never stack saw as chords (`harmony_support`):
  detuned-saw walls belong to a different genre and bury everything here.
- **Calliope** — soft flute-adjacent synth: melody/counter **5–6**; the gentle
  alternative when a real flute is too breathy (it does not share GM flute's
  low-level problem). Good `alternate_melody` above an epiano or piano lead.
- All three are electronic against an acoustic palette: CANDIDATE — they read best
  either fully owned (chiptune-flavored song) or as a single deliberate color, not
  mixed two-at-a-time with orchestral voices.

---

## 9. Doubling conventions (cross-family)

1. **Unison doubling** thickens and re-colors without brightening: strings+winds
   blend best (Adler); brass at unison annexes the line; keep the backup's gain
   below the lead's.
2. **Octave-above doubling** brightens: flute, celesta, glockenspiel (accents
   only), xylophone (accents only), square. Use when the lead needs lift —
   choruses, final sections.
3. **Octave-below doubling** adds gravity: cello, viola, bassoon, horn, epiano.
   Use at climaxes; muddy in already-thick low textures.
4. **3rds and 6ths** (= `alternate_melody`): the parallel voice sits **below** the
   lead, snapped to the scale/chord (the engine's diatonic-snap rule applies).
   6ths are safer than 3rds when the texture is wide; 3rds sweeter when close.
   Parallel voice above the lead only if its timbre is *lighter* than the lead's.
5. **Bass doubles at the root**: octave doubling (cello+bass model) is standard;
   never double a bass line in 3rds — the low-interval limit forbids it.
6. **When doubling muddies**: (a) unison doubling *in the same octave as a
   sustained pad* — the line drowns in its own harmony; (b) doubling the piano's
   *accompaniment figure* with a sustaining instrument — smears the figuration;
   (c) three or more timbres on the melody — it stops being a voice and becomes an
   organ stop (RK's warning); CANDIDATE cap: lead + 2 doublings maximum, and only
   at arc peaks.

## 10. Balance & yielding rules

- **Salience order**: melody > countermelody > bass > inner harmony. Any conflict
  is resolved downward — the less salient part thins, drops an octave away, or
  rests.
- **One moving line per octave region.** If two parts articulate at the same time
  in the same resulting octave, one must move (engine already tracks occupancy by
  resulting octave — extend it from "same octave collision" to "same octave +
  simultaneous onsets").
- **Counter yields to lead**: `counter_melody` sustains or rests whenever the lead
  is active in an adjacent octave; it *moves* in the lead's rests (complementary
  rhythm — enforceable as anti-correlated onset density per beat).
- **Brass entry ducks everyone**: when trumpet/trombone/horn enter forte,
  sustained strings/winds/pads drop level (in-engine: level trims or thinner
  voicing on the bed while brass sounds).
- **High cutters are rationed**: any voice with `cuts ≥ 0.8` (glock, xylo, music
  box, oboe-like) gets sparse material by construction — high salience must be
  paid for with low onset count.
- **Sustained-layer budget**: ≤ 2 sustained layers above the piano, in different
  octave regions (see §7). The pad's top note stays below the lead's octave.
- **Exactly one bass owner** at a time; a second low voice doubles at the octave
  or waits its turn.

## 11. Anti-patterns (each is a mechanical rejection candidate)

1. Glockenspiel/xylophone carrying a full melody 1:1 (decoration voices — thin to
   accents).
2. Trombone (or horn) fast runs / 16th figuration — slide and valve physics say no;
   also reads absurd in GM.
3. Low closely-voiced pads/organ/strings: thirds below C3, close triads below G3.
4. Flute melodic material at octave 4 against any active texture (ratified by ear:
   inaudible).
5. Oboe as sustained pad (non-blending timbre beams through).
6. Pizzicato/harp/guitar asked to *sustain* (`harmony_support` on plucked decay).
7. Pads asked to *move* (figuration or fast melody on slow attack).
8. Choir on fast melisma (vowel mush).
9. Harp/guitar figuration in the piano accompaniment's octave at the same time.
10. `counter_melody` articulating in the lead's octave while the lead moves.
11. Muted trumpet as pad (nasal beam), open trumpet as casual pad (annexes mix).
12. Contrabass or acoustic bass melody; music box above octave 5 (ratified).
13. Sawtooth chord stacks; two synth leads at once against acoustic voices.
14. Everything doubling the tune at a non-climax (organ-stop effect).
15. Tubular bells playing lines, or more than ~1 stroke/bar.
16. Cello melodic part clamped into its bass octaves (melody lives at 4–5, an
    octave+ above its bass register).

## 12. Per-part mechanical checklist (keyed to `PARTS`)

All CANDIDATE rules, phrased for enforcement in `arrange.js`/audition passes.

### `melody_takeover` (adds 0, canLead, entry 'lead')
- [ ] Instrument's melodic sweet-spot octaves (tables above) contain the lane's
      *clamped* octave; if the clamp pushes the line outside the sweet spot,
      reject the cast (cello→lane low, flute→oct 4 are the known failures).
- [ ] `cuts ≥ 0.7` (engine already) AND agility check: horn, trombone, choir,
      accordion, tubular bells rejected when the lead line exceeds ~2 onsets/beat.
- [ ] Piano lead actually yields for the span; no other part occupies the
      resulting octave with simultaneous onsets.
- [ ] Handoff at a section boundary, starting on a phrase head (engine D-intent).
- [ ] Saw/trumpet takeover ⇒ thin the sustained bed underneath for the span.

### `melody_backup` (adds 0, derives lead, entry 'double')
- [ ] Bright/percussive voices (flute, celesta, glock, xylo, square) double at
      **+1 octave**; warm voices (strings, choir, epiano, horn) at **unison**.
- [ ] Glockenspiel/xylophone: thin to accents — first onset per beat group and
      phrase peaks only, never 1:1 with a 16th-note lead.
- [ ] Never a slow-attack instrument (pads) doubling a moving lead.
- [ ] Backup gain < lead gain; at most one backup active; +choir unison reserved
      for arc peaks.
- [ ] Reject if a sustained layer occupies the same resulting octave as the
      doubled line.

### `alternate_melody` (adds 0, derives lead-rhythm, entry 'motion')
- [ ] Interval: 3rd or 6th **below** the lead, snapped diatonic (existing snap
      rules apply); above the lead only if instrument weight < lead's timbre
      weight.
- [ ] Same-octave placement is legal (rhythm-locked), but instrument `weight`
      must be ≤ the lead voice's — the parallel voice supports, never competes.
- [ ] Reject bass-register instruments (contrabass, basses, trombone low) — a
      parallel 3rd that dips below C3 violates the low-interval limit.

### `counter_melody` (adds 3, independent, entry 'motion')
- [ ] Complementary rhythm, enforced: enters where the lead rests; when the lead
      moves, it holds or rests; onset density anti-correlated with the lead per
      beat.
- [ ] Register: resulting octave ≥ 1 octave from the lead's center (the classic
      cast: cello/bassoon/viola at 3–4 under a lead at 5; square/flute at 6 above
      a lead at 5 in thin textures).
- [ ] Sparse: ≤ 3 new onsets/bar (engine's `adds: 3` already encodes this).
- [ ] Phrase ends *before* the lead re-enters (leaves the doorway clear).
- [ ] High-cuts voices (glock, xylo, muted trumpet) get the sparsest lines.

### `additional_harmony` (adds 4, figuration, entry 'bed')
- [ ] Quick-attack, short/medium-sustain instruments only (engine `wants:'quick'`):
      harp, guitar, marimba, pizzicato, harpsichord, kalimba, epiano, xylo-accents.
- [ ] Resulting octave ≥ 1 octave away from the piano accompaniment's octave
      (piano at 2-3 ⇒ figure at 4–5), OR the piano figure provably thins there.
- [ ] Two broken-chord figures never share the same subdivision grid — offset the
      pattern or reject the second.
- [ ] Chord tones on strong steps; pattern re-locks at every chord change.
- [ ] Low-register figuration (walking bass) allowed only for bass voices, at 1–2.

### `harmony_support` (adds 0, sustain, entry 'bed')
- [ ] Long-sustain instruments only (engine `wants:'sustain'`): pads, choir,
      strings ensemble, organ, horn, accordion, vibraphone, tremolo strings.
- [ ] Center octave 3–4; **voicing floor**: below C3 only octaves/P5; thirds above
      C3; close triads above G3.
- [ ] Top pad note strictly below the lead's resulting octave; the pad never
      crosses above the lead.
- [ ] Sustained-layer census: counting this part, ≤ 2 sustained layers above the
      piano, in distinct octave regions; a third replaces, never joins.
- [ ] Re-attacks only at chord changes; zero independent rhythm.
- [ ] Horn preferred as the glue voice when strings/winds both sound; organ
      reserved for sacred/grave and never together with another pad.

### Register lanes (low 3 / mid 4 / lead 5 / high 6)
- [ ] `low`: cello, bassoon, trombone, organ; true bass voices (acoustic/synth
      bass, contrabass) sound at 1–2 below the lane floor — bass is its own region.
- [ ] `mid`: horn, viola, clarinet, vibraphone, pads, choir, guitar, marimba.
- [ ] `lead`: shared with the piano melody only on touch contrast (existing rule)
      — sustaining voices contrast with piano attack; a second percussive-attack
      voice at 5 must wait for the piano to yield.
- [ ] `high`: flute, glock, xylo, celesta, square-echo, calliope — decorative and
      sparse by construction; melody-capable only for flute/celesta/calliope/
      square, and clamped occupancy (D46) remains the collision authority.

## Sources

- Samuel Adler, *The Study of Orchestration* (register characteristics, balance
  ratios, doubling practice) — background knowledge, specifics cross-checked.
- Rimsky-Korsakov, *Principles of Orchestration* (melody doubling limits, strings
  as foundation, brass balance) — background knowledge.
- [Range of the French Horn — wagner-tuba.com](https://www.wagner-tuba.com/brass-section-overview/french-horn-introduction/french-horn-range/)
- [Orchestration Tip: Horn Middle Register — Orchestration Online](https://orchestrationonline.com/orchestration-tip-horn-middle-register/)
- [Horn Family — Timbre and Orchestration Resource](https://timbreandorchestration.org/isfee/extreme-orchestration/brass/horn-family)
- [Glockenspiel — Vienna Symphonic Library](https://www.vsl.co.at/academy/percussion/glockenspiel)
- [Orchestral Instrument Range Chart — compositionteaching.com](https://compositionteaching.com/instrument-ranges/)
- [Celesta — Wikipedia](https://en.wikipedia.org/wiki/Celesta)
- Engine ground truth read for this doc: `src/lib/instruments.js` (D43/D46 palette,
  lanes, level corrections), `src/binder/arrange.js` (PARTS semantics, LANE_OCTAVE,
  slates, D46/D47 notes).
