<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

I have enough sourced material. Composing the report now as my final output.

# Desert & Jungle Game-Music Idiom — Research Report

**Context.** The somber-desert song "sounds more like space than desert." Harmony doctrine (Phrygian dominant / Hijaz: bII against tonic + raised 3rd) already exists in the engine. This report supplies what's missing: instrumentation, texture, rhythm, and ornament idiom — as implementable rules. All onset grids are written bar-relative in 16ths of a 4/4 bar (slot k → onset `k/16`), matching engine conventions. Native 2/4 patterns are notated per half-bar and played twice per 4/4 bar (per D92, never author 2/4).

---

## 1. The desert canon — what the classics actually do

| Track | Instrumentation | Rhythm section | Texture / what sells "desert" |
|---|---|---|---|
| **Gerudo Valley** (OoT, Kondo) | Flamenco (nylon) guitar strumming 16ths, solo trumpet lead, hand claps | Clap backbeat + strummed 16th motor | F♯ minor, Andalusian cadence (i–bVII–bVI–V); the *dry plucked 16th-note motor* under a singing brass lead. TheoryTab logs the chorus at 120 BPM, 4/4. Desert-as-frontier, not Arabia — but the lesson is the **relentless dry attack grid**. |
| **NSMB Desert Theme** (Kondo) | Sitar, flute + cor anglais mid-register, electric bass, congas + **darabukka** | Heavy hand-drum groove, "moderate and funky," 4/4 | G harmonic minor; sitar opens with a **descending chromatic passage**; guitar stabs root/7th chords **off the beat**; enemies hop on the beat. Desert = sitar timbre + hand drums + aug-2nd scale. |
| **Shantae series** (Jake Kaufman) | Chip/FM synths voicing "Persian/Arabic" leads with comedic flavor; disco-funk bass | Four-on-floor + darbuka-style fills | Proves the idiom survives full synthesis: it's the **scale + ornament + drum pattern**, not acoustic samples, that reads Arabian. |
| **Aladdin** (Genesis, Tallarico) | Trumpet ensemble, **solo flute with glissando endings in tremolo**, jazz cymbals | Light percussion ("Camel Jazz," "Turban Jazz") | "Arabian jazz": ornamented solo wind over harmonic-minor changes. The **flute gliss/tremolo phrase-ending** is a reusable ornament. |
| **Crash 3 Egypt** (Tomb Time / Sphynxinator, Mancell) | Per-level MIDI samples: reedy leads, plucked ostinati, deep toms | Mid-tempo tom/frame-drum loop | Low drone + snaky chromatic-neighbor lead + dry percussion in a big "stone" reverb — tomb, not open sky. |
| **Sphinx and the Cursed Mummy** (Duckworth) | Western orchestra + "Arabian feel" (reed winds, hand perc) | Orchestral perc + darbuka layers | The standard hybrid recipe: orchestra carries harmony, **ethnic solo instrument carries identity**. |
| **Spyro Cliff Town / Dry Canyon** (Copeland) | Drummer's score: hand perc forward, guitar/synth plucks | Groove-first | Even "canyon desert" = percussion-forward and dry. |
| **Film trope anchor: duduk** (Gladiator "To Zucchabar," Gasparyan; Last Temptation, Gabriel) | Solo duduk (Armenian double-reed) over low drone | Often free/rubato over drone | THE "lonely desert" sound of modern media: **one mournful, heavily-ornamented reed voice over a sustained low open-5th drone**. This — not a pad wash — is what somber-desert should emulate. |

**Farya Faraji's critique** (Orientalism: Desert Level Music vs Actual Middle-Eastern Music): game "desert music" is a hodgepodge (Indian sitar + Arab drums + Spanish cadences), but it *works as a genre of its own* because audiences expect it. Takeaway for the engine: don't chase authenticity, chase the **trope's load-bearing elements** — Hijaz scale, hand-drum iqa', ornamented monophonic lead, drone.

**What separates DESERT from merely dark/exotic:** the raised 3rd (Hijaz), an audible *dance* rhythm under it, and a plucked/reedy timbre. All-minor + slow + washy = "dark" (or space). Ethan's ear already ruled this: all-minor Phrygian read "dark, not desert."

---

## 2. Rhythm signatures — the iqa'at as onset grids

Two strokes: **D = dum** (bassy, drum center → map to low conga / floor tom / low taiko hit, vel ~1.0) and **T = tak** (dry, sharp rim → rimshot / woodblock / high bongo, vel ~0.7); **k** = ghost tak (vel ~0.4). Grids verified against [Wikipedia Maqsoum](https://en.wikipedia.org/wiki/Maqsoum) and [Baba Yaga's rhythm diagrams](https://babayagamusic.com/Music/oriental-dance-rhythm-diagrams-and-descriptions.htm); MaqamWorld confirms meters.

### 4/4 iqa'at (one bar = 16 slots)

```
slot:      0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
MAQSUM     D  .  T  .  .  .  T  .  D  .  .  .  T  .  .  .    "most common rhythm in Arabic music"
BALADI     D  .  D  .  .  .  T  .  D  .  .  .  T  .  .  .    earthy/folk; = maqsum with D on slot 2
SAIDI      D  .  T  .  .  .  D  .  D  .  .  .  T  .  .  .    Upper-Egypt stomp; double-dum center
```
Onset fractions — maqsum: D `0`, T `1/8`, T `3/8`, D `1/2`, T `3/4`. Baladi: same slots, slot-2 becomes D. Saidi: D `0`, T `1/8`, D `3/8`, D `1/2`, T `3/4`.

### 2/4 iqa'at (half-bar = 8 slots; repeat both halves of the 4/4 bar)

```
slot:      0  1  2  3  4  5  6  7
AYYUB      D  .  .  k  D  .  T  .    the "camel walk" — galloping swagger
MALFUF     D  .  .  T  .  .  T  .    3+3+2; rolling travel rhythm
FALLAHI    D  t  .  t  D  .  t  .    fast peasant shimmy (busy maqsum)
```
Full-bar fractions — ayyub: D `0`, k `3/16`, D `1/4`, T `3/8`, D `1/2`, k `11/16`, D `3/4`, T `7/8`. Malfuf: D `0`, T `3/16`, T `3/8`, D `1/2`, T `11/16`, T `7/8`.

### Slow floors (span 2 bars of 4/4; for somber/mystery)

```
CHIFTETELLI  bar1: D . . . . . T . . . . . T . . .   bar2: D . . . D . . . T . . . . . . .
MASMOUDI     bar1: D . . . D . . . . . . . T . . .   bar2: D . . . . . . . T . . . . . . .
```
Masmoudi kabir: dums at `0` and `1/4` of bar 1, lone tak at `3/4` of each bar — vast, processional. ("Silence is a note!" — Baba Yaga.) Karsilama is 9/8 — excluded by the 4/4-only ruling.

### Which reads what, in game terms

- **AYYUB = desert caravan/travel.** Its gallop is literally described as "a camel walking" ([khafif.com FAQ](http://www.khafif.com/rhy/) tradition, echoed by [Arab Instruments](https://www.arabinstruments.com/blogs/arabinstruments-blog/darbuka-rhythms-malfuf-maksum-and-baladi)). 100–130 BPM. This is the first pattern to reach for on any *moving* desert vibe.
- **MALFUF** = urgent travel / chase / entrance; its 3+3+2 propels. 110–140 BPM.
- **MAQSUM/BALADI** = desert town, bazaar, inhabited warmth. 90–115 BPM.
- **SAIDI** = festival/stomp, martial folk (stick-dance). 100–120 BPM.
- **MASMOUDI/CHIFTETELLI at 60–85 BPM, or drone-only** = somber/mystic desert, ruins, night. For somber-desert keep the dums — a lone D at `0` and `1/4` every 2 bars over a drone is still *desert*; deleting all percussion is what tips it into space.
- Velocity law: dum ≫ tak (~1.0 vs 0.7); fills are ghost taks (k) never added dums — adding dums changes which iqa' it *is*.

---

## 3. Desert ornament grammar (lead-voice rules)

From maqam performance practice (trills, mordents, grace notes, glissandi are core, not decorative — "specific trills, slides, and vibratos belong to specific maqamat the way a dialect belongs to a place," per Fiveable's maqam/taksim study guides; Tallarico's Aladdin flute gliss-tremolo endings are the game-idiom version):

1. **Long-note rule**: any lead note ≥ 1/2 bar gets an ornament — either a trill onset (upper-neighbor alternation in 16ths for the first ~1/4 of the note) or a late "bloom" (start plain, add upper-neighbor turn at ~60% of duration). Never a bare held note AND never a synth-pad swell — held tones must *move*.
2. **Grace-note approach**: structural downbeat notes take a single short grace from the **upper neighbor** (scale-wise). In Hijaz specifically: b2 leans down onto 1; 4 leans down onto 3. Grace duration ≤ 1/16, stealing from the previous note.
3. **The augmented 2nd is walked, never leapt in ornaments**: fills between b2 and 3 run stepwise THROUGH the gap (1–b2–3–4 up, 4–3–b2–1 down) in even 16ths. This run IS the desert sound; use it as the standard pickup and the standard descent.
4. **Qafla (cadence) rule**: phrase-finals approach the tonic by **stepwise descent** (4–3–b2–1, fast, e.g. four 16ths) landing on a held tonic. Never end a desert phrase with an upward leap. (This coexists with cadenceNo7 — the qafla descent is *how* you arrive at the 3rd/5th/root.)
5. **Mordent openings**: phrase-initial notes may take a lower mordent (note–lower-neighbor–note as a 16th-triplet or two 32nds; approximate as 16th–16th–rest of value).
6. **Slide approximation**: no pitch bends in the engine — approximate a slide with a chromatic passing grace (one semitone below, 1/16). *Genre-justified chromaticism*, same license as Hijaz itself; keep it to graces, never runs.
7. **Density cap**: 1–2 ornament events per bar; ornaments live on the lead ONLY; and phrases breathe — leave ≥ 1 beat of lead silence between phrases (taqsim phrasing). Support voices never ornament (consistent with high-ornaments-silent-during-melody law).
8. **Tremolo lead option**: an oud/sitar-style lead can render a held note as a repeated-note tremolo (16ths, same pitch, decaying velocity 1.0→0.6). Note: this is exempt from the melody merge-same-pitch rule by design — it's an *articulation*, flag it as such if implemented.

---

## 4. Jungle canon & idiom

| Track | Instrumentation | What sells "jungle" |
|---|---|---|
| **DK Island Swing / "Jungle Groove"** (DKC, David Wise) | Synth brass, sax, trombones, clarinet, hi/lo strings, **marimba, melodic tom, bongos**, drums | Swing-jazz over jungle percussion; **melodic tom fills** answer the horn melody; danceable ~120–140 swung ([Greatest Game Music](https://www.greatestgamemusic.com/soundtracks/donkey-kong-country-soundtrack/) instrument list). |
| **Jungle Hijinxs** (DKC Returns) | Starts **bare percussion**, adds rhythm layers + bass, then melody | The canonical jungle *form*: percussion-first build. Intro = drums alone. |
| **Jungle Japes** (DK64, Kirkhope) | "Synthesized big band… **boisterous percussion and animal sound effects** bring the jungle to life" ([VGMO](https://vgmonline.net/donkeykong64/)) | Animal-call flourishes as punctuation between phrases. |
| **Mumbo's Mountain** (Banjo-Kazooie, Kirkhope) | **Reed flutes, drums, chanting** | Tribal-flute lead + chant pads: breathy short-note leads, vocables as pad timbre. |
| **N. Sanity Beach** (Crash, Mancell/Mutato) | "Heavily drum oriented with natural & tribal sounds"; funky, zany | Percussion IS the song; melody is short riffs poking through. |

### Jungle percussion recipes (onset grids, one 4/4 bar = 16 slots unless noted)

**Conga tumbao** (8 eighth-slots; per [Rhythm Notes](https://rhythmnotes.net/tumbao-rhythm-on-congas/): heel–tip–**slap**–tip–heel–tip–**open–open**):
```
8th slot:  0    1    2    3    4    5    6    7
stroke:    heel tip  SLAP tip  heel tip  OPEN OPEN
```
Engine reduction (audible strokes only, ghost the rest): **slap at `1/4`** (muted/high timbre, vel .9), **open tones at `3/4` and `7/8`** (low conga pitch, vel 1.0), optional ghosts (vel .3) on remaining 8ths. The "empty 1, loaded 4" shape is the groove.

**Bongo martillo** (8 eighth-slots, constant ticking; sequence per [MusicRadar](https://www.musicradar.com/tuition/tech/how-to-program-a-basic-latin-rhythm-with-congas-and-bongos-634917): slap–fingers–open–thumb–slap–fingers–**open hembra (low)**–thumb): every 8th sounds on high bongo (vel .5–.7), with the **low bongo accent at slot 6 = `3/4`**. Reads as insect-tick + answer.

**Son clave 3–2** (2-bar cycle, 16th fractions): bar 1 hits `0, 3/8, 3/4`; bar 2 hits `1/4, 1/2`. Map to claves/woodblock. Use sparingly — clave + tumbao + martillo together is the full Latin bed (DKC leans jazz-Latin, not Afro-Cuban-strict).

**Shaker/maracas**: straight 8ths or 16ths, downbeat accents (vel .6 on beats, .35 off). **Guiro**: long scrape at `0`, short at `1/4` and `3/4`.

**Log drum / melodic tom** (the DKC signature): a 2–4 note **pentatonic tom melody** as a fill in the last bar of a 4/8-bar phrase — e.g. onsets `1/2, 5/8, 3/4, 7/8` playing 5–4–b3–1 of the key, low register (C2–C3).

### Jungle pitched-layer recipes

- **Marimba ostinato** (the engine-ready shape): 1-bar loop in 8ths, two-voice rocking — low anchor on beats 1 and 3 (root, then 5th below octave), upper voice walking a **minor-pentatonic cell** between: e.g. degrees `1 . 5 6 | 1' . b7 5` or dorian `1 b3 5 6` rocking (the raised 6 is the dorian brightness). Keep it ≤ vel .5 under the lead; it is the jungle analogue of the oom-pah.
- **Kalimba** (GM patch 108 in GeneralUser GS): arpeggiated 16th cell with holes — slots `0,1,3,4,6,8,9,11,12,14` off a pentatonic broken chord, soft (vel .4), octave 4–5. Holes matter; full 16ths reads as music-box.
- **Melody**: minor pentatonic or dorian. Short calls (1 bar), then **response**: answer by a *different* voice — melodic toms, marimba, or flute echo — in the next bar (call-and-response is structural, not decorative).
- **Animal-call flourish**: at section boundaries only, a fast 3–5-note upward flutter on flute/high synth (grace-note cluster, pentatonic, top note falls off), ≤ 1 per 8 bars — the DK64 "sound effects as orchestration" trick.
- **Form**: percussion-first intro (drums alone 2–4 bars, add bass, then melody) is idiomatic jungle and directly maps to the engine's intro machinery.
- **Tempo**: 96–140; swing feel optional but strongly canonical (DKC); straight-16th funk also valid (Crash).

---

## 5. Desert vs Space — the failure checklist

Space reads as: shimmering pads, slow attacks, long reverbs, "expansive soundscapes, slow-evolving drones… spatial depth created by long reverbs" (space-ambient genre description, [Melodigging](https://www.melodigging.com/genre/space-ambient)); high pitched-up reverb tails; near-zero percussion; pure/sine timbres. Desert is almost point-by-point the opposite. Audit a somber-desert song against this:

| Axis | SPACE (reject) | DESERT (require) |
|---|---|---|
| **Attack density** | < 2 note-onsets/bar, slow-attack swells | ≥ 6 onsets/bar from SOME layer (drum grid or plucked ostinato), fast attacks |
| **Percussion** | none / sub-boom | hand-drum iqa' present — even somber: masmoudi dums every 2 bars minimum |
| **Lead** | washy pad melody, unornamented | monophonic reed/pluck lead WITH ornament grammar (§3); phrases breathe then speak |
| **Drone** | wide hi+lo shimmer, evolving | LOW static open 5th (root+5, C2–C3), dry, reedy/stringy timbre; top of drone ≤ C4 |
| **Register spread** | huge gaps, high sustained tones > C6 | compressed: drone C2–C3, lead C4–C6, nothing sustained above C6 |
| **Timbre** | sine/glass/shimmer, chorused | plucked (oud/sitar-ish), double-reed (duduk/ney-ish), struck wood; noise-attack transients |
| **Harmonic rhythm** | static suspended ambiguity | Hijaz with the b2 *rubbing* the drone — the drone holds the tonic so bII is heard AGAINST it |
| **Scale color** | ambiguous/lydian/quartal | raised 3rd sounding early and often (the Hijaz major 3rd over the b2 is the identity interval) |
| **Reverb/space** | long tails, shimmer | short-mid, dry-forward percussion |

**Most likely single fix for the current song**: the accompaniment is pads. Replace the pad floor with (a) a low open-5th drone (sustained, static, octave 2), (b) a plucked ostinato or maqsum/masmoudi drum layer for attack density, and (c) give the lead the §3 ornament grammar on a reed/pluck voice. Density before timbre: a duduk-ish lead over a *pad* still reads space; a plain lead over a *drone + dum grid* already reads desert.

---

## 6. Sound sourcing for this engine (practical order)

1. **GeneralUser GS (already vendored, fluidsynth)**: Sitar (GM 104), Kalimba (108), Marimba (12), Woodblock (115), Melodic Tom (117), Taiko (116); drum-kit keys: bongos 60/61, congas 62–64, cabasa 69, maracas 70, claves 75, woodblocks 76/77. Dum/tak mapping today: dum = low conga 64 or low tom, tak = claves 75 or high bongo 60.
2. **WAV one-shots** (audition tier via `samples()`, HQ via a tiny SFZ wrapper): a 3-sample darbuka set (dum/tak/ka) and a frame-drum dum would upgrade the desert floor more than any harmony change.
3. **VSCO-2 CE (vendored)**: pizzicato strings ≈ oud stand-in for accompaniment plucks; solo oboe/clarinet ≈ poor-man's duduk (low register, soft dynamic).
4. **Surge XT patches (vendored)**: pluck-category patches for sitar-ish leads (short exciter + damped resonance); avoid pad-category presets on desert songs entirely.

---

## Sources

- [Zelda Dungeon — Gerudo Valley analysis](https://www.zeldadungeon.net/forum/threads/analyzing-the-music-of-zelda-part-i-the-gerudo-valley-theme-from-ocarina-of-time.66465/) · [Scribd Gerudo Valley analysis](https://www.scribd.com/document/550490834/Gerudo-Valley) · [Hooktheory Gerudo Valley](https://www.hooktheory.com/theorytab/view/nintendo/gerudo-valley-theme)
- [Wikipedia — Maqsoum](https://en.wikipedia.org/wiki/Maqsoum) · [MaqamWorld iqa'at index](https://www.maqamworld.com/en/iqaa.php) (+ per-rhythm pages: maqsum, baladi, saidi, ayyub, malfuf) · [Baba Yaga rhythm diagrams](https://babayagamusic.com/Music/oriental-dance-rhythm-diagrams-and-descriptions.htm) · [Arab Instruments — Malfuf/Maksum/Baladi](https://www.arabinstruments.com/blogs/arabinstruments-blog/darbuka-rhythms-malfuf-maksum-and-baladi) · [khafif.com Middle Eastern Rhythms FAQ](http://www.khafif.com/rhy/) · [WorldBellyDance — Arabic rhythms](https://www.worldbellydance.com/arabic-rhythms/)
- [Wikipedia — Phrygian dominant](https://en.wikipedia.org/wiki/Phrygian_dominant_scale) · [Farya Faraji — Orientalism: Desert Level Music vs Actual Middle-Eastern Music](https://www.youtube.com/watch?v=LR511iAedYU) (+ [VI-Control thread](https://vi-control.net/community/threads/wasnt-sure-where-to-put-this-orientalism-in-music.151999/))
- [Kieran Lambie — NSMB desert music analysis](https://kieranlambie.weebly.com/ba-music-personal-project/new-super-mario-bros-desert-music-research-and-analysis) · [Shantae OSTs (Kaufman, Bandcamp)](https://virt.bandcamp.com/album/shantae-and-the-pirates-curse-ost) · [Aladdin Genesis music (Internet Archive)](https://archive.org/details/md_music_aladdin) · [Sphinx and the Cursed Mummy soundtrack wiki](https://sphinxandthecursedmummy.fandom.com/wiki/Soundtrack) · [Josh Mancell — Wikipedia](https://en.wikipedia.org/wiki/Josh_Mancell) · [Spyro OST (Copeland)](https://en.wikipedia.org/wiki/Stewart_Copeland)
- [Wikipedia — Duduk](https://en.wikipedia.org/wiki/Duduk) · [Wikipedia — Djivan Gasparyan](https://en.wikipedia.org/wiki/Djivan_Gasparyan) (Gladiator "To Zucchabar")
- [Fiveable — taksim & ornamentation](https://fiveable.me/introduction-to-musics-of-the-world/unit-3/improvisation-techniques-taksim-ornamentation/study-guide/QX978WJmrpF7uGK4) · [Ethnic Musical — Maqam explained](https://www.ethnicmusical.com/blog/maqam-music-for-beginners/) · [MaqamWorld — maqam](https://www.maqamworld.com/en/maqam.php)
- [Greatest Game Music — DKC soundtrack review (instrument list)](https://www.greatestgamemusic.com/soundtracks/donkey-kong-country-soundtrack/) · [Hooktheory — DK Island Swing](https://www.hooktheory.com/theorytab/view/david-wise/dk-island-swing---donkey-kong-country) · [VGMO — DK64 soundtrack review](https://vgmonline.net/donkeykong64/) · [GamesRadar — making of DK64](https://www.gamesradar.com/making-of-donkey-kong-64/) · [TV Tropes — Banjo-Kazooie Awesome Music (Mumbo's Mountain)](https://tvtropes.org/pmwiki/pmwiki.php/AwesomeMusic/BanjoKazooie) · [The Boar — Crash trilogy music](https://theboar.org/2021/06/music-box-the-crash-trilogy/) · [TV Tropes — Jungle Japes trope](https://tvtropes.org/pmwiki/pmwiki.php/Main/JungleJapes)
- [Rhythm Notes — salsa rhythms](https://rhythmnotes.net/salsa-rhythms/) · [Rhythm Notes — tumbao](https://rhythmnotes.net/tumbao-rhythm-on-congas/) · [MusicRadar — programming congas & bongos](https://www.musicradar.com/tuition/tech/how-to-program-a-basic-latin-rhythm-with-congas-and-bongos-634917) · [Wikipedia — Tumbao](https://en.wikipedia.org/wiki/Tumbao)
- [Melodigging — space ambient genre](https://www.melodigging.com/genre/space-ambient) · [Wikipedia — space-themed music](https://en.wikipedia.org/wiki/Space-themed_music)
