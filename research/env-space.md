<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

# Space / Alien / Sci-Fi Game-Music Idiom — Research Report

## 1. Canonical track anatomy

### Mass Effect — "Uncharted Worlds" (Jack Wall / Sam Hulick) — THE galaxy-map template
- **Design brief (confirmed by Wall):** a cross between Vangelis's *Blade Runner* and Tangerine Dream, set by director Casey Hudson at conception. This is the single most-referenced "space exploration" cue in games.
- **Harmony:** G minor, ~120 BPM. Loop documented as **Gm – Eb^7 – C – Eb** = **i – bVI^7 – IV – bVI**. The major IV in minor (**Dorian raised 6th as a chord**) is the "hope" lift; bVI^7 is the color chord. No dominant, no cadence — the loop just rotates. Engine degrees: `0:m 8:^7 5 8`.
- **Pulse:** constant sequenced 16th-note analog arpeggio (Berlin-school/Tangerine Dream), low-passed, hypnotic; harmonic rhythm slow (2 bars/chord) against the fast pulse. **Fast surface + slow harmony is the core trick.**
- **Texture:** slow-attack detuned brass-pad swells (CS-80 lineage) over the arp; essentially **no percussion**; big reverb tail. Melody is minimal — the arp and pad ARE the piece.

### Vangelis / Blade Runner (the parent palette everything cites)
- CS-80 "brass" pad: **slow attack, long decay/release, slight detune between voices, PWM + dynamic filter movement**; ribbon-controller pitch slides (portamento falls at phrase ends).
- The signature space is **dry synth drowned in cavernous reverb** (Lexicon 224) — "epic" comes from the reverb, not the patch. Modern recreations use a huge hall verb send plus a Space-Echo-style delay.

### Metroid / Super Metroid (Yamamoto/Hamano, Tanaka) — hostile-planet ambient
- **Crateria:** long, low notes **broken up by beats of silence**; one low threatening synth against environmental noise. **Silence is a compositional material** (Paste's thesis: the soundtrack's strength is its silences).
- **Lower Brinstar:** pulsing drone + low choir chants + somber flute/piano melody. **Lower Norfair:** tribal drums + deliberately discordant harmony.
- **Item rooms / elevators:** industrial hum + sparse **high-pitched beeps** — the purest "alien technology" signifier in the canon.
- Hooktheory metrics on Super Metroid themes: unusually high **chord–melody tension** (melody notes deliberately outside the chord) and chord-progression novelty — instability as style.
- **Metroid Prime (Tallon Overworld):** chords that **plane chromatically downward** under low drones, flute-like synth melody above, low male choir — the "dark alien sacred" recipe.

### Halo (Marty O'Donnell) — space via the *ancient*, not the synth
- D major/modal. Gregorian-chant open (4/4), then 12/8 middle: **low-string triplet ostinato whose leaps widen octave → 9th → 10th → 11th**, tribal percussion, high-string variation melody. Brief was "importance, weight, ancient." Lesson: **choir + modal chant + widening intervals reads "cosmic scale"** with zero synths.

### Outer Wilds (Andrew Prahlow) — space + nostalgia
- Two-palette system: **Hearthian = folk** (banjo, campfire melodies, deliberately simple/diatonic, Zelda-nostalgic); **Nomai = melodic sound design** — "a melody and textures to resemble a piano being ripped apart in space" (many piano libraries heavily edited + live upright, granular/smeared).
- "End Times": **analog + digital + NES-emulated synths stacked into one huge pad** carrying a minimal, memorable melody.
- Anti-wallpaper doctrine: music is sparse and event-following; **an intimate acoustic instrument inside giant reverb over synth pads = warm space**. This is the closest model for a game engine that already leans acoustic.

### FTL (Ben Prunty) — the explore/battle groove system
- Palette: **Kontakt ambient textures + Plogue Chipsounds (chip percussion/leads) + Reaktor Sound School Analog leads** — "cinematic but without an orchestra." Influences: Battlestar Galactica, Holst, funk, chiptune.
- **Explore/Battle pairing:** battle = the explore track **with percussion added** (his own generalization), same harmony/structure; hi-hats everywhere in battle versions; reviewers note the drums act as the dominant "melody" of battle variants. Openings leave a "seemingly eternal amount of space" between chords before layering in.
- Emotional target: "Space is creepy and lonely" — sustained low-key tension, never jarring, built for 30-hour exposure.

### Starbound (Curtis Schweitzer)
- Ambient-orchestral: **delicate piano lines that linger + soft synths "breathing" underneath** ("Europa", "On the Beach at Night"); memorable diatonic themes over ambient beds; biome-driven. The chill-exploration formula: piano/pluck melody, pad respiration, very light or absent drums.

### Stellaris (Andreas Waldetoft)
- **Vangelis-derived synths + real orchestra** (Brandenburg State Orch.); dark-ambient influences (Lustmord, Aphex ambient). His stated hard problem: "not the harmony or melody… finding the right sound and synth for the job." Occasional 80s post-punk drums for motion. Space opera = pads and strings doubling the same slow theme.

### EVE Online (Jón Hallur "RealX") & Homeworld (Paul Ruskay)
- EVE: dark ambient electronica in the Tangerine Dream/Vangelis lineage, non-event-specific, introspective drones.
- Homeworld: ambient electronic **+ tribal drums and Indian influences + Barber's Adagio choir**. Ruskay: the tribal sound emerged "in the context of a desert planet and space ships" — **direct evidence that hand-drum/tribal groove pulls space toward *desert planet***, and vice versa. Keep this asymmetry in mind for §5.

---

## 2. Space-signifier checklist (ranked by reliability)

1. **Enormous reverb/delay on sparse events.** The #1 signal — emptiness rendered literally. A short dry note with a 3–6s tail, or an echo repeating at dotted-8th/half-bar intervals, reads "space" in isolation. (Blade Runner's Lexicon; Metroid item beeps; FTL's chord-gap openings.)
2. **Slow harmonic rhythm over a drone/pedal.** 1 chord per 2–4 bars, root pedal held beneath; no functional cadences — modal rotation (i–bVI–bVII, i–bVI^7–IV) instead of V–I.
3. **Open no-3rd voicings: 5ths, 4ths, sus2/sus4, quartal stacks.** Ambiguity = vastness; the third is "gravity." Wide spacing (10th+ between bass and pad).
4. **Steady low-passed analog arp pulse** (Berlin school): 8ths/16ths, 90–120 BPM, small pitch set (R-5-8 or R-5-9), filter closed-ish, unwavering. Motion without groove.
5. **High "sensor blip" ornaments:** sine/square single notes ≥C6, quiet, irregular (every 1–2 bars), each with delay repeats. The Metroid item-room device.
6. **Wide detuned saw/PWM pad, slow attack** (≥0.5–1s), release ≥2s, breathing volume. 2 voices at ±7–12 cents (total 15–25 cents spread) = lush; keep below ~25 cents for "beautiful" space.
7. **Lydian #4 (wonder-space) or Dorian-in-minor (melancholy-space).** Lydian trope: major triad on II over tonic pedal (C pedal: C – D/C); Dorian trope: major IV chord in a minor key (Uncharted Worlds' C in Gm).
8. **Sub-register root drone** (engine: synth bass octave 2, whole notes, one low voice).
9. **Sparse or absent percussion**; when present, soft electronic clicks/hats far back — never acoustic kit up front.
10. **Choir "aah" pad** — cosmic-sacred (Halo chant, Metroid choirs, Homeworld Adagio). Powerful but bivalent (also reads "ancient/temple").
11. **bVI and bVII major chords under a minor/ambiguous tonic** (Holst planets lineage; also the Brinstar-family progressions).
12. **Portamento/theremin-style slides** — retro-alien; use sparingly, phrase-end falls only (Vangelis ribbon).

Weakest signals used alone: minor key, slow tempo, strings — all shared with a dozen other moods.

---

## 3. ALIEN vs SPACE — pushing neutral space into unsettling

Neutral space = beautiful emptiness (list above). Alien = **break the harmonic series or the scale's center**:

- **Detune amounts (concrete):** 5–10¢ = organic warmth; 10–25¢ = lush chorus (still "pretty"); **>40–50¢ = audible beating, "wrong"; a full quarter-tone (50¢) parallel layer is maximally uncanny** (between-the-keys pitch). Rule: space pads stay ≤25¢ total spread; alien layers run a second voice at +35–50¢.
- **Inharmonic/metallic FM:** non-integer carrier:modulator ratios (1:1.41, 1:2.76, 1:3.5x) put partials **off** the harmonic series → bell/metal/hollow timbres; slow operator attacks + subtle LFO drift on the ratio = evolving unsettling atmosphere. In Surge terms: an FM2/FM3 patch with detuned M-ratios, long attack — one vendored .fxp covers the whole alien-timbre budget.
- **Whole-tone scale:** all whole steps, no leading tone, no tonic gravity — "dreamy/blurred/otherworldly." Best as a **blip/arp pitch-set** (e.g. C-D-E-F#-G#-A#) floating over a pedal, not as full harmony.
- **Tritone emphasis** in suspensions/figures (Fenoughty's sci-fi recipe: "sprinkle in tritone relationships… in suspensions instead of what fits the key"); the engine's desert bII is Phrygian-exotic, but a **#4 against the root** is sci-fi-exotic.
- **Chromatic planing:** parallel chords sliding down by half steps (Metroid Prime Tallon) — alien-organic dread. NOTE: this is licensed chromaticism — genre-justified like desert Hijaz; gate it to alien/derelict vibes only, since Ethan rejects unmotivated chromaticism.
- **Unstable pitch:** slow LFO drift (±10–20¢, 0.1–0.3 Hz) on a drone; reversed-envelope swells; melody notes deliberately outside the chord (Super Metroid's measured high chord–melody tension).
- **Cluster seconds** in high register (minor 2nd dyads, ppp, long tail) = derelict-ship horror-adjacent.

Escalation ladder (space → eerie → alien): open 5ths → add sus2/#11 → whole-tone blips → quarter-tone detune layer → inharmonic FM bell drone → chromatic planing.

---

## 4. FTL / Starbound "chill space groove" — concrete recipe

- **Structure law (FTL):** write the harmonic/textural bed first ("explore"); the energetic version is **the same bed + drums** (+ sharpened melody), not a new piece. Maps 1:1 onto the engine's letter/intensity system: an A-section without drums and a later section that adds them shares ALL pitch material.
- **Drums:** electronic, mid-tempo (~85–110 BPM feel). Sparse kick (beat 1 + one syncopated placement, e.g. 3-and), rim/snare on 3 (half-time backbeat), **hats carry the energy** (8ths with occasional 16th pairs — Prunty: "hi-hats… everywhere" in battle versions). Cymbals/hats far back in the mix. No fills every bar; sparsity is the genre.
- **Bass:** root-note only, moves **only on chord changes**, octave jumps for interest (R…R+12…R), synth bass at octave 2, staccato-ish 8ths or dotted rhythm (funk influence shows up as syncopation in the bass, not busyness).
- **Leads:** chip-flavored square/triangle with echo, OR lingering piano over breathing pads (Starbound). Melody sits high, notes long, density low.
- **Glue:** ambient texture layer (pad/shimmer) runs through BOTH versions so battle still reads "space."

---

## 5. Why the desert song read as SPACE — and the fix

Shared devices (the ambiguity zone): drone/pedal root, open fifths, sparse texture, exotic scale color, slow melody. What disambiguates:

**Space-pulling devices (strip from desert; lean into for space songs):**
1. **Synth pad timbre with slow attack / long release** — the single strongest pull. Desert wants acoustic/plucked/bowed attacks.
2. **Long echo/reverb tails and held whole-note beds** — wet = void. Desert is DRY (close, roomy, immediate).
3. **Slow harmonic rhythm + static sus/no-3rd voicings** — desert's identity chord (bII major against tonic, raised 3rd) must actually SOUND, frequently: the Hijaz color lives in fast root motion 1↔b2 and the M3–b2 melodic clash, not in a held open 5th.
4. **High sine blips / shimmer ornaments** — pure space-tech; desert ornaments are melodic turns (b2 neighbor figures, augmented-2nd runs), mid-register, rhythmically placed.
5. **Motionless sub drone with nothing rhythmic above** — Homeworld's evidence runs the other way: adding **tribal/hand-drum groove** made ambient space read "desert planet." So: desert = give it the hand-drum/oom-pah pulse and ornamented melisma; space = remove exactly those.

**Desert checklist after the fix:** Phrygian-dominant color chords voiced WITH thirds, harmonic motion every bar (1–b2–1), ornamental 16th turns in the melody, plucked/struck timbres, percussion groove present, minimal pad, minimal echo. **Space checklist = the mirror image.**

---

## 6. Implementable engine rules

**Progression library (degrees tokens, semitone offsets):**
- Melancholy explore (Uncharted Worlds family): `0:m 8:^7 5 8` (i–bVI^7–IV–bVI), 2 bars/chord.
- Space-epic minor: `0:m 8 10 0:m` (i–bVI–bVII–i).
- Wonder/Lydian major: `0:^7 2` alternating over held tonic bass (I^7 – II/I); or `0 2 0 2` with bass pinned to 0.
- Ambient/derelict: single `0:m` or `0:sus` held 4–8 bars, color from layers not changes.
- No V–I cadences anywhere; phrase-ends land on bVII or IV (plagal/modal).

**Layer recipe — "space explore" (Mass Effect tier):**
1. Arp: 16ths (at 100–120 BPM) or 8ths (at 70–90), figure `R/5/R+/5` or `R/5/9/5`, filtered pluck synth, gain ~0.5, octave 3–4.
2. Pad: sus2/add9 voicing (R+5+9 or R+2+5), slow-attack detuned saw (±7–12¢/voice), breathing per-bar gain wave (use padWaveCalm-style gradual bands), octave 3–4.
3. Bass: root whole notes, synth bass octave 2, one low voice.
4. Blips: 1 note per 1–2 bars, ≥C6, sine, gain ≤0.25, with 2–3 echo repeats at half-beat intervals decaying ~0.6× (fake delay via repeated quieter onsets — the engine has no FX sends).
5. Melody: enters ≥16 bars in, long holds, low density (half the normal per-bar target), mostly chord tones + 9ths; silence between phrases is the point.
6. Drums: none, or FTL-tier addition in high-energy letters ONLY, reusing identical pitch material.

**Layer recipe — "alien" overlay:** whole-tone blip set, FM-metallic Surge patch (non-integer ratio, slow attack), optional +40–50¢ detuned double of the drone, chromatic-planing pad allowed (genre-gated).

**Sound assets to acquire (in the project's practicality order):** (a) one-shot WAVs: reversed-swell, sub-boom, metallic ping; (b) SFZ: none critical; (c) SF2: GeneralUser GS "Choir Aahs" for the sacred-cosmic pad; (d) **Surge .fxp patches — the main need**: slow-attack detuned PWM/saw pad (CS-80-ish), filtered analog arp pluck, long-release sine blip, FM inharmonic bell, clean sub bass. All five are stock Surge territory.

**Mix doctrine:** pads whisper-tier under any melody (existing ≤0.1 support law extends naturally); blips quieter still; the arp is the loudest non-melody layer; kept songs untouched (`!priorKeep` gates on all of it).

Sources: [Uncharted Worlds analysis thread](https://forums.ea.com/discussions/mass-effect-franchise-discussion-en/uncharted-worlds-musical-analysis/9195781) · [Chordify: Uncharted Worlds](https://chordify.net/chords/mass-effect-galaxy-map-music-remix-uncharted-worlds-lavapenguin19) · [Mass Effect OST wiki (Wall on Blade Runner/Tangerine Dream)](https://masseffect.fandom.com/wiki/Mass_Effect_Original_Soundtrack) · [Reverb Machine: Vangelis Blade Runner synth sounds](https://reverbmachine.com/blog/vangelis-blade-runner-synth-sounds/) · [Reverb.com: Synth Sounds of Blade Runner](https://reverb.com/news/the-synth-sounds-of-blade-runner) · [MusicRadar: Blade Runner CS-80](https://www.musicradar.com/news/blade-runner-best-synth-sound) · [Paste: Super Metroid's silences](https://www.pastemagazine.com/games/metroid/the-strength-of-super-metroids-soundtrack-is-in-its-silences) · [AV Club: Metroid's music & space](https://www.avclub.com/best-metroid-soundtracks) · [Hooktheory: Theme of Super Metroid](https://www.hooktheory.com/theorytab/view/kenji-yamamoto/theme-of-super-metroid) · [Metroid Recon: Prime music notes](https://metroid.retropixel.net/games/mprime/music/) · [Halopedia: Halo Theme](https://www.halopedia.org/Halo_Theme) · [Will Baker: Halo sequence analysis](https://www.willbakermusic.com/halo-sequence/) · [GameDeveloper: Outer Wilds music](https://www.gamedeveloper.com/audio/behind-the-hauntingly-beautiful-music-of-i-outer-wilds-i-) · [TheGamer: Prahlow interview](https://www.thegamer.com/outer-wilds-echoes-of-the-eye-music-lost-reels-andrew-prahlow/) · [CheerfulGhost: Ben Prunty interview](https://cheerfulghost.com/jdodson/posts/1552/interview-with-ftl-composer-ben-prunty) · [NPR: Prunty/FTL](https://www.npr.org/2013/10/06/229171039/composing-game-soundtracks-that-move-faster-than-light) · [Score. FTL OST review](https://scorevgm.wordpress.com/2013/07/29/vgm8_ftl/) · [Grokipedia: Ben Prunty (tools)](https://grokipedia.com/page/Ben_Prunty) · [MusicRadar: 65daysofstatic NMS](https://www.musicradar.com/news/guitars/how-65daysofstatic-built-the-soundtrack-to-no-mans-skys-infinite-universe-641184) · [Game Informer: NMS generative soundtrack](https://gameinformer.com/b/features/archive/2016/05/30/65daysofstatic-on-creating-no-man-39-s-sky-generative-soundtrack.aspx) · [VGMO: Stellaris OST review](https://vgmonline.net/stellaris-original-soundtrack/) · [Curtis Schweitzer: Starbound OST](https://curtis-schweitzer.bandcamp.com/album/starbound-official-soundtrack) · [RPGFan: EVE OST review](https://www.rpgfan.com/music-review/eve-online-original-soundtrack/) · [Fists of Heaven: Paul Ruskay interview](http://www.fistsofheaven.com/paul-ruskay-interview/) · [Homeworld Soundtrack wiki](https://homeworld.fandom.com/wiki/Homeworld_Soundtrack) · [Heather Fenoughty: sci-fi recipe](https://www.heather-fenoughty.com/composing-music/how-to-compose-science-fiction-music-my-personal-recipe/) · [MT4E: Lydian](https://mt4e.substack.com/p/lydian-the-mystic-tritone-mode) · [Ali Jamieson: quartal harmony](https://alijamieson.co.uk/2015/11/06/breaking-the-fourth-wall-a-brief-guide-to-quartal-harmony/) · [Song Cage: sus chords](https://songcage.com/blog/suspended-chords/) · [Wikipedia: whole-tone scale](https://en.wikipedia.org/wiki/Whole-tone_scale) · [Synthtopia: FM metallic sounds](https://www.synthtopia.com/content/2018/09/02/fm-synthesis-of-metallic-sounds/) · [MusicRadar: FM sound design](https://www.musicradar.com/how-to/fm-synthesis-sounds-actually-use) · [CMUSE: unison detune calculator](https://www.cmuse.org/synth-unison-detune-calculator) · [FaderPro: supersaw](https://blog.faderpro.com/techniques/supersaw-how-make-iconic-sound/) · [ADSR: Serum unison voices](https://www.adsrsounds.com/serum-tutorials/xfer-serum-odd-or-even-unison-voices/) · [Flypaper: synths in sci-fi film history](https://flypaper.soundfly.com/discovery/sounds-future-history-primer-synths-sci-fi-movies/) · [SciFi Slacker: Forbidden Planet electronic tonalities](https://www.scifislacker.com/scifi-music/forbidden-planet-electronic-tonalities/)
