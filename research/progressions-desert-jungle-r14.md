# Desert & Jungle Chord Progressions — round-14 research (D89/D91 follow-up)

Ethan's notes this round: "I still don't think the chord progression sounds like a
desert. look into other game desert chord progressions." and (jungle) "the chord
progression intervals don't really sound like jungle vibe."

Method: concrete chord data pulled from Hooktheory TheoryTab pages (crowdsourced
human transcriptions — the roman numerals below labeled [HT] come straight from
their per-section "About the Chord Progressions" tables), from machine
chord-detection sites (ChordU/Chordify, labeled [machine] — low-medium
confidence), from tabs/lead sheets [tab], and from by-ear forum/blog analyses
[ear]. Every claim carries its label. Where a source is machine-detected or
by-ear, treat the *device* as the finding, not the exact voicing.

Confidence key: [HT] = Hooktheory theorytab (medium-high) · [tab] = published
transcription (medium) · [ear] = by-ear analysis, forum/blog/video (medium) ·
[machine] = automated chord detection (low-medium).

---

## §1 Desert findings

| Track | Key / mode | Progression (roman numerals) | The desert device | Source |
|---|---|---|---|---|
| **Gerudo Valley** (Ocarina of Time) | F# minor (harmonic minor melody) | Verse AND chorus: **i – bVI – bVII7 – V7** (F#m – D – E7 – C#7), looped | Rotated **Andalusian cadence** (true Andalusian is i–bVII–bVI–V; Kondo swaps the middle two). The money chord is the **major V7** — the raised 3rd (E#) lives in the V chord and the melody's harmonic-minor aug-2nd (D→E#) over it. Melody is 78% diatonic F# harmonic minor [HT]. This is CHORD MOTION, not a drone. | [HT] hooktheory.com/theorytab/view/koji-kondo/gerudo-valley (+ nintendo/gerudo-valley-theme, identical numerals); [ear] ZeldaDungeon forum threads; wikipedia Andalusian cadence |
| **Arabian Nights** (Aladdin — the film song the SNES/Genesis games arrange) | A minor [HT analysis key] | **i – II4/2 – bII4/2 – i (– iii)** = Am – B7/A – Bb7/A – Am | **Tonic-pedal chromatic slide**: both seventh chords are in third inversion, i.e. the bass NEVER moves off A — dominant-7 colors slide down by half step *over a drone*. bII against a held tonic. This is the drone-plus-neighbor lane. | [HT] hooktheory.com/theorytab/view/disney/aladdin---arabian-nights |
| **NSMB Wii desert theme** | ~A tonal center | detected chord set: A, G, D, **Bb**, E | bII (Bb) and bVII (G) around a major-ish tonic; the DS/Wii desert themes are mostly **stab-and-drone** ("bah" brass hits + the marimba broken-fifth 16ths we already vendored) with the color carried by melody + bII neighbor stamps, not by a functional loop. | [machine] ChordU (Desert Theme NSMBW guitar arr.); [ear] structure widely described, e.g. mariowiki "Paah" |
| **Desert Hills** (Mario Kart Wii, Egyptian-styled course) | G **mixolydian** | Verse: **I – bVII** (G – F) oscillation | Sun-baked two-chord **whole-step oscillation** under an "exotic"-inflected melody. The lighter, comic-desert lane (fits our goofy/playful piano-territory carve-out). | [HT] hooktheory.com/theorytab/view/nintendo/desert-hills---mario-kart-wii |
| **Samasa Desert** (Zelda: Oracle of Seasons) | analyzed E locrian / D minor (odd crowd analysis — treat loosely) | Bridge: **VII6sus2 – VI6sus2 – bV6sus2 – #iii6sus2 – IV** | **Chromatic planing of sus2 shapes** under a snake-charmer melody — parallel chord-shape slides, again no functional cadence. | [HT] hooktheory.com/theorytab/view/nintendo/tlo-zelda---oracle-of-seasons---samasa-desert |
| **We Love Burning Town / Burning Town** (Shantae) | F minor-ish center (tunebat); scale claimed **double harmonic ("Byzantine")** | no reliable chord transcription found | Double harmonic = Hijaz-Kar: **b2 AND raised 3rd in the same scale**, i.e. the bII sits against a *major* tonic chord. Low confidence on specifics — by-ear claims only — but the scale claim matches how the tune reads. | [ear] search aggregators + listening claims; tunebat key |
| **Crash 3 Egypt theme** (Tomb Time/Sphynxinator) | tabbed in C | no trustworthy progression found | Tab sources show a **static tonic with a chromatic riff**; percussion-forward. Thin sourcing — device only. | [tab] Ultimate-Guitar (key C), unverified |
| **Venus Lighthouse** (Golden Sun) | F# minor / A minor | Verse: i – iiø4/2 – i – VI – VII; Chorus: **VI – VII** (– i) | Honest negative result: this is the **epic-dungeon VI–VII–i axis**, NOT a desert device. Included so we don't cargo-cult it into the desert lane. | [HT] hooktheory.com/theorytab/view/motoi-sakuraba/venus-lighthouse |
| **Calico Desert** (Stardew Valley) | C major | Verse: **I – vi** | Second honest negative: some deserts are just laid-back major. The trope is a choice, not a law. | [HT] hooktheory.com/theorytab/view/concernedape/calico-desert |
| **Birabuto Kingdom** (Super Mario Land, pyramid world) | major-key ragtime | I/IV/V ragtime changes [tab/machine, versions differ] | Third negative: the "Egypt" is 100% in the art; the music is ragtime. | [tab] keeper1st transcription; [machine] ChordU |
| **Serious Sam "Dunes"** | — | no transcription found | Ambient bed + maqam-flavored lead over drone; combat layer is rock. No chord data found — instrumentation/drone device only. | [ear] fan/wiki descriptions |

**Chord motion vs drone — the actual split.** The canon has BOTH lanes and they
are distinct: (a) **motion lane** — Gerudo's harmonic-minor descent onto a major
V7 (flamenco borrowing, the most-loved "desert" track in VGM); (b) **drone
lane** — Arabian Nights / NSMB / Crash Egypt: tonic pedal, bII (and II) as
chromatic *neighbor colors over the pedal*, melody carrying Hijaz. Farya
Faraji's "Orientalism: Desert Level Music vs Actual Middle-Eastern Music" video
(chapter: "The OBSESSION with the Double Harmonic Major") confirms the trope's
core is the **double-harmonic/Hijaz scale + drone**, with Western chordal motion
layered on top; real maqam practice is essentially melodic/monophonic. For
Ethan's ear (trained on the game trope, not on authenticity) that means: the
desert read comes from **(raised 3rd against b2) + (V7 or pedal)**, and our
current all-over-minor i–bII–iv–III keeps the tonic minor the whole time — the
raised third never lands in a CHORD the listener hears against the bII. That is
the likely miss.

## §2 Ranked desert progressions to adopt

Semitone-degree notation per our dialect (offsets from tonic, default major,
`:m` minor, `:^7` maj7, `b` suffix = flat spelling). Where a dominant-7 color is
wanted I say so in prose (check dialect support before authoring — plain-triad
`7` figure falls back to b7).

1. **Gerudo lane (motion): `0:m 8b 10b 7`** — i–bVI–bVII–V, V ideally dominant-7
   colored, melody F#-harmonic-minor-style (see §5). Highest confidence: the
   single most-vouched desert progression in VGM, and it is REAL chord motion,
   which suits our engine. Serve raw (variation pass off, as the trope already
   demands). Bar-4 turnaround naturally = the V.
2. **True Andalusian descent: `0:m 10b 8b 7`** — i–bVII–bVI–V, the flamenco
   original (StudyBass/Wikipedia; ZeldaDungeon notes Gerudo is this with the
   middle chords swapped). Slightly more "Spanish", equally desert. Good as the
   B-letter/bridge partner of #1 so sections own their harmony.
3. **Tonic-pedal chromatic slide (drone lane): `0:m 2 1b 0:m`** — i–II–bII–i
   with the II and bII served as colors OVER A HELD TONIC PEDAL in the bass
   (Arabian Nights literally keeps A in the bass under B7→Bb7). If the binder
   can't pedal under foreign roots, a close substitute is `0:m 1b 0:m 1b` with
   the bass pinned to 0. This is the progression that makes bII read "desert"
   instead of "dark": the half-step slide is heard against a stationary root.
4. **Double-harmonic Hijaz vamp: `0 1b 5:m 1b`** — MAJOR tonic, bII major, iv
   minor (all triads native to double harmonic major: 0,1,4,5,7,8,11). The
   raised third finally lives in the TONIC CHORD, hard against the bII root a
   semitone up (Burning Town's scale; Farya's "obsession" chapter). Riskiest of
   the four (least VGM transcription evidence) but the purest Hijaz-in-chords.
5. **Comic-desert oscillation: `0 10b`** — mixolydian I–bVII rocking vamp
   (Desert Hills) with the Hijaz color pushed entirely into the melody/ornament
   layer. Reserve for goofy/playful desert vibes.

Do NOT adopt: VI–VII–i (epic-dungeon, Venus Lighthouse), i–v–iv–bII all-minor
(our own faulted base — "dark, not desert", now confirmed against the canon:
no famous desert track stays all-minor).

## §3 Jungle findings

| Track | Key / mode | Progression (roman numerals) | The jungle device | Source |
|---|---|---|---|---|
| **DK Island Swing / Jungle Hijinx** (DKC1) | A minor (rel. C) [HT] | Intro: **isus4 – VIIsus4** (Asus4 – Gsus4) | **Whole-step sus-chord planing vamp** — no thirds, no cadence, groove carries it. Wise cites Glenn Miller-era swing for the horn-ish melody; harmony itself is near-static. | [HT] hooktheory.com/theorytab/view/david-wise/dk-island-swing---donkey-kong-country; [ear] VGMO David Wise interview |
| **Jungle Hijinxs** (DKC Returns) | **A dorian** [HT] | Verse: **i(no5) – VII(no5) – V7** stamp (Am–G dyads, E7 stinger) | Dorian **i–bVII dyad vamp** + a single dominant stamp as punctuation, not cadence. | [HT] hooktheory.com/theorytab/view/nintendo/jungle-hijinxs---donkey-kong-country-returns |
| **Stickerbush Symphony** (DKC2 bramble; instructive) | A minor [HT] (arrangements float — Chordify says C at 99bpm) | Intro vamp: **i7 – III7** (Am7 – Cmaj7). Verse/pre-chorus: **VI7 – VII6 – v7 – i7** (Fmaj7 – G6 – Em7 – Am7) | **All-natural-minor seventh-chord wash**: minor v (no leading tone ever), maj7/6 colors on every chord, two-chord dream vamp for whole sections. | [HT] hooktheory.com/theorytab/view/david-wise/stickerbush-symphony; [machine] Chordify/ChordU agree on the Am7/Cmaj7/Fmaj7/G set |
| **Crash Bandicoot Theme** | **C dorian** [HT] | **i – IV – v – IV – i** (Cm – F – Gm – F) | The dorian **i–IV vamp** (minor tonic, MAJOR IV — the "jungle funk" move), over didgeridoo + tribal percussion (Mancell interviews confirm the didgeridoo). | [HT] hooktheory.com/theorytab/view/josh-mancell/crash-bandicoot-theme; [ear] crashmania.net Mancell article |
| **Mumbo's Mountain** (Banjo-Kazooie) | G-centered | detected set: **G – C – F – D** = I – IV – bVII – V | Mixolydian mixture (I, IV, bVII) + V; marimba/log-drum + chant orchestration ("African tribal" per reviews). Machine-detected — device over detail. | [machine] Chordify; [ear] TV Tropes / reviews on orchestration |
| **Jungle Falls** (Diddy Kong Racing, David Wise) | F / G **mixolydian** [HT] | Verse: **I – IV**; chorus: **I – IV6/4** | Mixolydian **two-chord I–IV vamp**, IV in second inversion = IV over tonic-ish bass (pedal again). | [HT] hooktheory.com/theorytab/view/nintendo/jungle-falls---diddy-kong-racing |
| **Monsoon Jungle** (Wario Land 4) | C major [HT] | I – ii – IV – vi4/2 – V; also **IV – I6 – IV – iii – IV** | IV-centric floaty major — subdominant loops that never cadence hard. | [HT] hooktheory.com/theorytab/view/ryoji-yoshitomi/monsoon-jungle---wario-land-4 |
| **Secret of Mana "Into the Thick of It"** (forest travel) | — | detected set: **G#sus4 – Fsus4 – Gsus4 – F** | **Parallel sus4 planing over a repeating vamp** — same family as DKC's sus intro; blog analysis stresses vamp + re-orchestration over harmonic change. | [machine] ChordU/Chordify; [ear] signifyingsoundandfury.com Secret of Mana post |
| **Monkey Island opening theme** | E minor [HT] | **i – VII – VI – III – iv** (Em – D – C – G – Am) | Honest cross-check: harmonically this is nearly the Andalusian descent WITHOUT the major V — and it reads pirate/Caribbean, not desert, because the groove (reggae comping) and the plagal iv ending own the read. Proof that the desert read needs the V7/raised-3rd, and the jungle/tropic read needs the groove. | [HT] hooktheory.com/theorytab/view/michael-land/the-secret-of-monkey-island---opening-theme |
| **Jungle Japes** (DK64) | — | detected set: A, E, C, G, Am | Machine-only, inconclusive; swung marimba-led groove. Not load-bearing. | [machine] ChordU; [tab] CSGuitar89 |

**What makes jungle "jungle" (the pattern across every strong source):**
1. **Two-chord modal vamps** — dorian i–IV, minor/dorian i–bVII, mixolydian
   I–bVII or I–IV. Never a functional four-chord pop loop, never V→I drive.
2. **Sus/quartal planing** — parallel sus4/sus2 shapes sliding by whole step
   (DKC intro, Into the Thick of It, Samasa's cousin device).
3. **Seventh-chord color when lush** — m7 tonic, maj7 on bIII/bVI, minor v
   (Stickerbush). No leading tones.
4. **Pedal points** — IV or bVII sounded OVER the tonic bass (Jungle Falls
   IV6/4, DKCR's E7-over-A).
5. The groove/percussion ostinato is the identity; harmony is a colored floor.
Our rejected city-pop/major block-chord accompaniment violated all five: it
moved functionally, block-voiced, with no vamp, no mode.

## §4 Ranked jungle progressions to adopt

1. **Dorian funk vamp: `0:m 5 7:m 5`** — i–IV–v–IV (Crash). Voice tonic as m7
   where possible. The major IV against the minor tonic is the "jungle" bite;
   the minor v keeps it modal. One-chord-per-bar, loop it.
2. **Sus-planing vamp: `0:m 10b`** — the DKC i–bVII whole-step vamp; voice both
   as sus4/no-3rd shapes (R.5 + the 4th in an upper voice — our figure grammar
   has no `4` token, so either land the 4ths in the acc's upper voice via a
   dedicated sus figure or lean on R/5 dyads and let melody supply the 4ths).
   Groove-dependent: pair with the jungle percussion floor, not block chords.
3. **Natural-minor 7th wash: `0:m 3b:^7`** vamp (Am7–Cmaj7) for A-letters,
   opening to **`8b:^7 10b 7:m 0:m`** (Fmaj7–G6–Em7–Am7) for B-letters —
   Stickerbush's two sections verbatim. The lush/canopy lane (slower jungle,
   dusk jungle). Minor v, never V.
4. **Mixolydian vamp: `0 5`** (I–IV, Jungle Falls; serve IV over a tonic pedal
   for the 6/4 color) with **`0 5 10b 7`** (Mumbo blend I–IV–bVII–V) as the
   brighter goofy-jungle variant.
5. **Tropic descent: `0:m 10b 8b 3b 5:m`** (Monkey Island i–bVII–bVI–bIII–iv) —
   for jungle-village / pirate-adjacent vibes; the plagal iv ending (no V) is
   what keeps it out of desert territory.

## §5 Melody-scale guidance

**Desert.** The trope's identity is MELODIC as much as chordal — the augmented
2nd must be audible in the tune (Farya: the double-harmonic obsession IS the
trope; Gerudo's melody is pure harmonic minor [HT 78% diatonic]).
- Motion lane (#1/#2 above): F#-harmonic-minor model — degrees `0 2 3 5 7 8 11`;
  the aug-2nd is `8→11` and belongs OVER the V chord; phrase-finals on 0/7
  (consistent with our cadenceNo7 law). Never natural b7 (10) over the V.
- Drone/Hijaz lanes (#3/#4): Phrygian dominant on tonic — `0 1 4 5 7 10` (+8);
  double harmonic swaps 10→11. Emphasize the `1↔0` half-step sigh and the
  `4→1` aug-2nd fall; sit long notes on 0 and 7; ornament the b2 (our slide-off
  flourish stamps already fit here). Melody must sound the natural 3 (4
  semitones) against any bII chord — that clash-by-a-half-step-root is the
  desert bite our all-minor loop never produced.
- Comic lane (#5): major/mixolydian tune, Hijaz only as ornament inflection.

**Jungle.** Minor pentatonic `0 3 5 7 10` over the dorian/minor vamps, with the
dorian 2 and 9 (=2 an octave up) as passing/extension color — never the 6th
against a minor v. Major pentatonic `0 2 4 7 9` over the mixolydian lanes with
b7 (10) as the blue note at phrase ends. Short syncopated riff-calls answered
by percussion (call-and-response), then a long held note across the vamp change
— matches our jitter-vs-holds doctrine. Extensions (m9/maj9) live in the ACC
voicings (Stickerbush lane), not as melody landing tones.

## §6 Jungle bass-style guidance (the "slap-funk doesn't work" fix)

What the canon actually uses:
- **DKC (DK Island Swing)**: round SYNTH bass, root-focused with walking
  approaches and a double-time syncopated section — but legato/round, custom
  synth patches per Wise (VGMO interview), not slap articulation. Root, 5th,
  walking step-up into the next root [tab: BigBassTabs arr.].
- **Crash**: no bass guitar at all in the tribal lane — **didgeridoo-style
  drone pedal** + hand percussion carries the low end (crashmania/Mancell).
- **Mumbo's Mountain / DK64**: **marimba–log-drum ostinato bass** — the bass
  IS a mallet pattern (broken roots/5ths), same family as our NSMB desert
  marimba device.
- **Monkey Island**: reggae **one-drop** — bass sits out beat 1, lands root/5
  on the offs.
Engine translation: keep synth bass at octave 2 (our audibility law), ROUND
tone (triangle/soft saw, no slap transient), patterns = (a) root–5–b7 riff with
a walking approach into each vamp change, (b) mallet broken-fifth ostinato as
the bass voice for lighter jungles, (c) drone pedal + percussion-only floor for
tribal/dark jungle. Avoid: slap articulation, busy 16th ghost-note funk, and
functional root motion every two beats — the vamp's bass should move when the
vamp moves (1–2 chords/bar max, mostly per-bar).

---

## Sources (main)

- Hooktheory TheoryTab pages (crowdsourced transcriptions), fetched 2026-08-27:
  koji-kondo/gerudo-valley, nintendo/gerudo-valley-theme,
  disney/aladdin---arabian-nights, nintendo/desert-hills---mario-kart-wii,
  nintendo/tlo-zelda---oracle-of-seasons---samasa-desert,
  motoi-sakuraba/venus-lighthouse, concernedape/calico-desert,
  david-wise/dk-island-swing---donkey-kong-country,
  david-wise/stickerbush-symphony,
  nintendo/jungle-hijinxs---donkey-kong-country-returns,
  josh-mancell/crash-bandicoot-theme,
  nintendo/jungle-falls---diddy-kong-racing,
  ryoji-yoshitomi/monsoon-jungle---wario-land-4,
  michael-land/the-secret-of-monkey-island---opening-theme
- Wikipedia: "Andalusian cadence"; StudyBass Andalusian lesson
- ZeldaDungeon forum: "Analyzing the Music of Zelda Part I: Gerudo Valley" [ear]
- Farya Faraji, "Orientalism: Desert Level Music vs Actual Middle-Eastern
  Music" (YouTube LR511iAedYU) — double-harmonic trope framing [ear]
- VGMO David Wise interview (vgmonline.net/davidwiseinterview) — synth bass,
  swing inspiration
- crashmania.net "Creators of Crash: Josh Mancell" — didgeridoo/tribal kit
- signifyingsoundandfury.com Secret of Mana post — vamp structure [ear]
- ChordU / Chordify machine detections (flagged [machine] throughout)
- BigBassTabs DK Island Swing bass tab [tab]
