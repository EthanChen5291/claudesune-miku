# How Game Music Scores ENVIRONMENTS and ACTIVITIES (not emotions)

**Status: CANDIDATE research.** Every parameter below is a genre-norm hypothesis distilled from published analyses, composer writeups, and reference tracks — none of it is ear-ratified. In motif-engine terms this is a candidate pool for a vibe taxonomy (vibe = emotion × environment); only the owner's ear promotes any of it to fact.

## Core finding (the factorization)

Across sources, **environment lives primarily in timbre, texture/figuration, and groove; emotion lives primarily in mode, tempo, and melodic/harmonic contour.** Two strong pieces of evidence:

1. **The synecdoche principle** (Lavengood & Williams, *Music Theory Online* 29.1, "The Common Cold"): Nintendo signals winter with *one or two* markers — usually just sleigh bells — layered over completely unrelated genre bases (polka in "Cool, Cool Mountain", mambo in "Vanilla Lake", samba in "Frappe Snowland", Celtic jig in "Shiveria"). Their line on Shiveria: *"if the sleigh bells were not present, nothing about this music would suggest the winter topic."* Environment can be carried by a timbre tag alone while the emotional/genre base is freely swapped.
2. **The Undertale genocide transform**: Tem Shop (C major, 110 bpm, bouncy) plays *at half speed and pitched down* on the Genocide route — same environment identity, emotion flipped by a mechanical transform. Environment = the material; emotion = the transform. This is literally vibe = emotion × environment implemented in a shipped game.

CANDIDATE architecture implication for motif-engine: environment tags should bind to **instrument palette + figuration + percussion profile + (sometimes) meter**, while emotion tags bind to **mode/tempo/register/harmonic-color transforms** applied on top. The two axes compose.

---

## Environment parameter rows

Tempo ranges are typical norms, not laws; every row has famous violations. "Percussion" = presence/character, since perc presence is one of the strongest environment signals.

### Quick-scan table

| Environment | BPM | Meter | Mode/harmony | Signal timbres | Texture/figuration | Percussion |
|---|---|---|---|---|---|---|
| Shop | 90–120 | 4/4 (some 3/4) | Major, maj7/6th, bossa/jazz color, circular non-cadential | Marimba/mallets, accordion, ukulele, pizz, e-piano, muted guitar | Light comping + bounce, staccato bass, small ensemble | Light/none: shaker, brushes |
| Normal battle | 140–180 | 4/4 | Minor/dorian, i–bVI–bVII riff loops | Strings ost., brass, rock kit, chip lead, slap bass | Riff ostinato + syncopated melody, front-loaded hook | Constant, driving |
| Boss battle | 150–185 | 4/4, meter shifts | Minor/chromatic, dim., Phrygian, half-step bass | Choir (Latin), organ, taiko, low brass, dist. guitar | Multi-phase escalation, ostinato bass, stabs | Heavy, accented, taiko/toms |
| Factory | 100–140 | Rigid 4/4 grid | Minor/chromatic, static one-chord vamps | Anvils/metal perc, synth bass, industrial noise, saw leads | Interlocking mechanical ostinati, never stops, melody minimal | Foregrounded, metallic, quantized |
| Stealth | 70–110 | 4/4 sparse | Minor/atonal, pedal points, cluster tension | Low strings, sub drones, synth pulse, ticking hats | Low ostinato + silence + swells; alert layers | Sparse: heartbeat kick, rimshot, clock tick |
| Snow/ice | 60–110 | 3/4 waltz or 4/4 | Major add9/maj7 sparkle, or wistful minor | Sleigh bells, celesta, glockenspiel, vibraphone, wind chimes, breathy flute | High shimmer arps, stillness pads, washy hats | Minimal; hats imitate sleigh bells |
| Water/underwater | 60–90 | 4/4, 6/8/12/8, 3/4 | Maj7/lydian dreamy, planing, extended chords | Harp/EP arps, filtered pads, choir oohs, vibes | Slow broken-chord arps, LP filter, heavy reverb/chorus, few transients | Minimal/soft; drums = surfacing/land reward |
| Desert | 80–120 | 4/4, 2/4 gait | Phrygian dominant (Hijaz)/double harmonic, drone pedal | Oud/sitar plucks, double reeds, snake-flute; OR Spanish guitar; OR Western twang | Ornamented melisma over drone, sparse mid | Hand drums: dumbek, frame drum, toms |
| Cave/ruins | 50–90 or free | Free / loose 4/4 | Aeolian/dorian, ambiguous, open 4ths/5ths | Deep pads, echo plucks/kalimba, distant choir, low piano, drips | Sparse single lines, huge reverb, long silences | Rare; deep booms |
| Lab/tech | 100–140 | 4/4 16th grid | Minor/whole-tone/chromatic; wonder = lydian | Analog arps, square/saw leads, vocoder, glitch, beeps | Arpeggiator ostinato + pad + FX, hard quantize | Drum machine, tight, dry |
| Casino/minigame | 120–160 | 4/4 swing/shuffle | Major + jazz: sec. dominants, dim passing, 6/9, blues | Big band brass, walking upright bass, vibes, honky-tonk piano, slot bells | Comping + walking bass + riff, showbiz stabs | Swing kit, brushes, splashy |
| Festival | 100–140 | 2/4, 4/4, 6/8 dance | Major diatonic I–IV–V, folk modes, real cadences | Fiddle, accordion, whistle, taiko/festival drums, brass band, claps/crowd | Full tutti dance groove, call-and-response | Prominent, communal (taiko, tambourine, claps) |
| Kitchen/cooking | 110–150 (accelerating) | 2/4 or 4/4 polka | Major, novelty chromatic runs | Pizz, kazoo/whistle, tuba oom-pah, xylophone, temple blocks | Comedic novelty tune; tempo tied to timer; blocks = chopping | Woodblocks, perky kit |
| Training/gym | 120–150 | 4/4 | Major/mixolydian, heroic riff | 80s synth brass, rock kit, electric bass, chip lead | Motoric repetitive riff, montage energy | Driving backbeat / four-on-floor |
| Night/rest | 50–80 (or 3–15s jingle) | 3/4 or gentle 4/4 | Major add9/maj7 tender; lullaby topos | Music box, celesta, soft piano, nylon guitar, warm pads | Sparse melody + slow arp, low dynamics; "day theme but softer" | None, or brushes |
| Title/menu | 60–120 or free | 4/4 or free | Either anthem (full theme) or ambient tease (pad + motif fragment) | Game's signature palette distilled | Fanfare+theme OR drone+fragment; must survive idling | Often absent until gameplay |
| Sad aftermath | 50–75 | 4/4 rubato / free | Minor, or major w/ suspensions & appoggiaturas; deceptive cadences | Solo piano, solo cello/strings, music box, thin pad | Known leitmotif stripped/slowed/reharmonized; silence as material | None |

### Per-environment detail + reference tracks

#### 1. Shop
- **Feel target**: polite, unhurried browsing; "waiting-room" music that never pressures. Bossa/lounge harmony recurs across the genre ("Why Does Shop Music Sound Like Spending" analyses; itch.io composer threads name bossa progressions as the default shop move).
- **Signature moves**: harmonic circularity — progressions that loop without strong cadences, so time feels suspended while the player reads menus; melodic "bounce" (staccato, grace notes); small ensemble intimacy.
- **Refs**: Undertale "Shop" (a *calmer variation of Snowdin Town* — environment cluster sharing one motif), Undertale "Tem Shop" (C major, 110 bpm), Deltarune "Hip Shop", EarthBound "Buy Somethin' Will Ya!", Zelda series shop themes, Animal Crossing "Able Sisters" / Nook's Cranny.

#### 2. Normal battle
- **Feel target**: urgency without ceremony; battles begin abruptly, so the hook is front-loaded (often a rising intro stinger, then the loop).
- **Signature moves**: bass/string riff ostinato; syncopated melody over a driving kit; short loop (15–30 s norm per loop-length guides) so it never becomes a song you wait through; minor-mode riff loops (i–bVI–bVII).
- **Refs**: Undertale "Enemy Approaching", FFVII "Let the Battles Begin!", Chrono Trigger "Battle 1", Pokémon RBY wild battle, Dragon Quest battle themes.

#### 3. Boss battle
- **Feel target**: threat + occasion. Published composer breakdowns (Leroy, Chilelli; Gamedeveloper genre series) converge on 140–180 bpm, drums pushing slightly ahead of the beat, heavy syncopation, and *phase evolution*: new layers/key changes/choir entries per boss phase.
- **Signature moves**: chromatic or half-step bass motion, diminished harmony, choir (often Latin text), meter shifts as destabilizers, multi-section forms (rare elsewhere in game loops).
- **Refs**: FFVII "One-Winged Angel", Undertale "Spear of Justice" / "Battle Against a True Hero" / "ASGORE" (Bergentrückung intro: 115 bpm, C# minor), Deltarune "The World Revolving" / "Big Shot", Zelda boss themes.

#### 4. Factory / machinery / construction
- **Feel target**: the machine never stops. Cartridge Lit's factory-song analysis: *"when the melody rests, the bass line works through the night; when both rest, the percussion continues its insistent, mechanical beat."* Lineage traced to Raymond Scott's "Powerhouse" (1937).
- **Signature moves**: interlocking rigid ostinati (cog-and-gear polyrhythm feel while staying on-grid); metallic found-percussion (anvil, clang, hiss) doing double duty as diegetic machine noise; static or one-chord harmony (machines don't modulate); darker/heavier/more synthetic than surrounding levels — it functions as *contrast* to pastoral areas.
- **Refs**: DKC "Fear Factory", Sonic 2 "Metropolis Zone" / "Chemical Plant" (CP is the up-tempo techno pole), Kirby 64 "Factory Inspection", Mega Man 2 "Metal Man".

#### 5. Stealth / sneaking
- **Feel target**: held breath. Low information density; silence is a texture.
- **Signature moves**: pedal-point drones with sparse punctuation; ticking/clock figures (time pressure embodied); "body-diegetic" percussion (heartbeat kick); *alert-state vertical layering* — detection adds an intensity layer over the same bed (MGS alert phases are the canonical model).
- **Refs**: MGS2 "Plant Sneaking Theme", MGS series "Encounter"/alert cues, BotW "Yiga Clan Hideout", Wind Waker Forsaken Fortress sneaking.

#### 6. Snow / ice
- **Feel target**: crystalline stillness or cozy village, both carried by metallic high-register percussion.
- **Signature moves**: sleigh bells as the load-bearing tag (MTO: works over polka, mambo, samba, jig); celesta/glockenspiel/vibraphone "icy keyboard" trope; breathy woodwinds = wind; washy hi-hat imitating sleigh bells with other drums *removed* ("Cool, Cool Mountain" has no conventional kit); waltz meter recurs (SMB underwater/ice-adjacent waltz tradition).
- **Refs**: SM64 "Cool, Cool Mountain", Undertale "Snowdin Town" (bells + bounce) and "Snowy" (wistful piano pole), DKC "Ice Cave Chant", Mario Kart 64 "Frappe Snowland", Super Mario Odyssey "Shiveria".

#### 7. Water / underwater
- **Feel target**: weightlessness, muffled light. David Wise built "Aquatic Ambience" as slow, spacious, layered Wavestation-style pads — deliberately *against* the bright platformer norm.
- **Signature moves**: slow broken-chord arps (harp/EP) = light through water; low-pass filtering + chorus + long reverb = submersion; extended/lydian harmony and chromatic planing = buoyant ambiguity; compound meter (6/8, 12/8) or waltz = wave motion (SMB underwater is a waltz); **percussion as depth-state variable**: Dire Dire Docks adds kick/snare/hat only when Mario reaches ground — layering as reward, activity-shift scored inside one environment.
- **Refs**: DKC "Aquatic Ambience", SM64 "Dire, Dire Docks", SMB underwater waltz, Undertale "Waterfall" (Ruins slowed — another environment-via-transform case).

#### 8. Desert
- **Feel target**: heat, expanse, the ancient. Two distinct sub-topics that should be separate tags:
  - **Arabian/Hijaz desert**: Phrygian dominant scale (b2 + major 3rd; "Hijaz" in Arabic practice), drone pedal, ornamented melisma, double reeds and plucked ouds, hand percussion.
  - **Wild-West desert**: country/western twang, trotting 2/4 gait (Mario Kart 64 "Kalimari Desert" scores desert as American West — proof the sub-tags are real).
  - A third pole: Spanish flamenco standing in for desert ("Gerudo Valley" is flamenco, not Middle Eastern, and still reads desert).
- **Refs**: Zelda OoT "Gerudo Valley" + Spirit Temple, SMB3 desert world, Mario Kart 64 "Kalimari Desert", Crash 3 Egyptian levels.

#### 9. Cave / ruins
- **Feel target**: the space itself is the instrument. Reverb size = room size; sparse notes = darkness.
- **Signature moves**: cavernous reverb + water-drip FX; echoing single-line motifs with long silences; open 4ths/5ths and tonal ambiguity (no harmonic "walls"); *ruins* variant adds ancient-mystery markers — distant choir, bell tolls, modal chant fragments — over the same sparse bed.
- **Refs**: DKC "Cave Dweller Concert", SM64 "Cave Dungeon", Undertale "Ruins" (melodic ruins pole), Hollow Knight "Crossroads", Minecraft cave ambience (pure-ambient pole).

#### 10. Lab / tech
- **Feel target**: precision and process. Everything quantized, dry-ish, synthetic.
- **Signature moves**: arpeggiator ostinato as the defining figuration (sequenced 16ths); beeps/glitch/vocoder as "computer diegesis"; whole-tone or lydian for wonder-tech, chromatic ostinato for corporate/menace-tech; quirky-novelty pole for friendly-scientist characters.
- **Refs**: Undertale "CORE" (dense synth arps; shares Hotland motifs — region cluster) and "Alphys" (quirky-lab pole), Pokémon "Silph Co.", FFVII "Shinra Company" (menace-tech march), Deltarune Ch.2 Cyber World tracks.

#### 11. Casino / minigame
- **Feel target**: showbiz glamour + play. Directly borrows real-casino diegesis: 50s–60s Vegas big band (Basie/Sinatra lineage per casino-music histories).
- **Signature moves**: swing/shuffle groove; jazz harmony (secondary dominants, diminished passing chords, 6/9 voicings); brass stabs as "win" punctuation; slot/bell FX integrated as pitched percussion; pinball/minigame variants push tempo and novelty percussion.
- **Refs**: Sonic 2 "Casino Night Zone", Pokémon "Game Corner", Mario Kart DS "Waluigi Pinball", Dragon Quest casino themes.

#### 12. Festival / celebration
- **Feel target**: communal, public, danced. The crowd is in the mix (claps, crowd noise, call-and-response).
- **Signature moves**: real dance forms with real cadences (jig, polka, samba, matsuri groove) — phrase arrivals people could dance to; tutti ensemble (opposite of shop intimacy); foregrounded communal percussion (taiko, tambourine, hand claps); implied on-screen performers.
- **Refs**: Chrono Trigger "Guardia Millennial Fair", Majora's Mask "Carnival of Time" material, Animal Crossing "Festivale" (samba), Stardew Valley festival cues.

#### 13. Kitchen / cooking
- **Feel target**: busy hands, comic pressure. Novelty-tune tradition (close to cartoon scoring).
- **Signature moves**: oom-pah/polka bounce; woodblock/xylophone percussion mapping onto chopping; kazoo/whistling as "domestic cheer"; **tempo coupled to the timer** — Overcooked's music accelerates as time runs out, driving the player without their noticing (activity scored as mechanic).
- **Refs**: Kirby Super Star "Gourmet Race", Overcooked level themes (accelerating), Cooking Mama task themes.

#### 14. Training / gym
- **Feel target**: 80s montage optimism; effort as fun.
- **Signature moves**: motoric riff repetition (repetition = reps); mixolydian/major heroic riffs; synth-brass + rock-kit "sports broadcast" palette; tight short loops that disguise their brevity (Punch-Out!! training theme is the canonical lean loop, by Koji Kondo).
- **Refs**: Punch-Out!! "Training", Pokémon RBY Gym theme (motoric bass), Wii Fit / Ring Fit Adventure menu-and-workout cues.

#### 15. Night / rest
- **Feel target**: safety, closure, low light. Two forms: the looping nocturne and the 3–15s inn jingle (FFXIII's "Innkeeper" at ~15s is the *longest* in the FF series — rest music is the shortest form in games).
- **Signature moves**: "the day theme but softer/slower" is an explicit industry convention (night variants of town themes); lullaby topos (music box, celesta); nocturne ABA with vocal-like melody; Animal Crossing's hourly system is the extreme case — time-of-day as a continuous environment axis with ~30 s loops per hour.
- **Refs**: FF "Good Night" inn jingle, Dragon Quest inn jingle, Animal Crossing 1–4 AM hourlies, BotW night exploration piano fragments.

#### 16. Title / menu
- **Feel target**: identity + endurance. Must state what the game is, and survive being idled on.
- **Signature moves**: two poles — (a) anthem: full main-theme statement, fanfare framing (Zelda tradition); (b) invitation: ambient pad + motif fragment, percussion withheld (OoT's title famously chose a gentle ocarina nocturne over bombast; Undertale's "Once Upon a Time" is a story-book chip lullaby). Menu music trends longer-loop and lower-salience than gameplay music.
- **Refs**: Zelda OoT "Title Theme", Undertale "Once Upon a Time", Minecraft menu (C418), Stardew Valley "Overture".

#### 17. Sad aftermath
- **Feel target**: grief inside a familiar place. The strongest convention is **transformation of known material**: take the area/character leitmotif, strip the texture to solo piano/strings, halve the tempo, flatten or suspend the harmony. Undertale's genocide-route shops (Tem Shop at half speed, pitched down; silence replacing town themes) are the systematized version.
- **Signature moves**: solo instrument + silence; appoggiaturas and suspensions; deceptive cadences (resolution denied); no percussion at all (percussion = activity, and activity has ended).
- **Refs**: FFVII "Aerith's Theme" (aftermath usage), FFX "To Zanarkand", Mother 3 "Love Theme", Chrono Trigger "At the Bottom of Night", Undertale genocide shop variants.

---

## Principles

### 1. Same emotion, different environment: happy shop vs happy festival
Both are major-mode, bouncy, mid-tempo. The environment split is carried by **social scale and address**, not by mode/tempo:

| Parameter | Happy shop | Happy festival |
|---|---|---|
| Ensemble | Chamber/intimate, 2–4 voices | Tutti, full band + crowd |
| Percussion | Minimal (shaker/brushes) or none | Foregrounded, communal (taiko, claps, tambourine) |
| Harmonic rhythm | Circular, cadence-avoiding (browsing = suspended time) | Real dance cadences, phrase arrivals (danced time) |
| Dynamics/register | Contained, mid-register, polite | Wide, loud, crescendos |
| Function | Background (music must not compete with menu-reading) | Foreground spectacle (music *is* the event) |
| Implied source | Shopkeeper's radio at most | On-screen performers |

CANDIDATE rule for the taxonomy: emotion sets mode/tempo/contour; environment sets ensemble size, percussion presence, cadence behavior, and diegetic address. "Happy" is one tag; shop-happy vs festival-happy differ in the environment column alone.

### 2. Diegetic logic (why environment scoring is timbre-first)
Environments imply plausible in-world sound sources, and composers borrow the implied source's timbre even for non-diegetic score ("source-adjacent scoring"): casino → lounge band on the floor; festival → street band; kitchen → cartoon/TV-show novelty band; factory → the machines themselves (anvil hits are simultaneously percussion and sound design); stealth → the sneaker's own body (heartbeat, held breath) and the clock; cave → no plausible performer, so the *room* becomes the instrument (reverb, drips) and music trends ambient. Fully diegetic set-pieces (Zelda's ocarina, Witcher 3 taverns, FFVI opera, Sea of Thieves shanties) anchor the convention: the closer an environment sits to a believable performance, the more its non-diegetic score imitates one.

### 3. Loop length norms
- Exploration/background: **30–60 s** workhorse. Ambient town/puzzle: **60–120 s** for a real arc.
- Combat: **15–30 s** — tense without becoming a jingle; hook front-loaded because battles begin abruptly.
- Rest/inn: **3–15 s non-looping jingle** (a cadence, not a loop).
- Animal Crossing hourlies: ~**30 s** loops engineered for hours of exposure (low salience makes this survivable).
- Perceptual anchor cited in loop guides: the ear consciously registers repetition around **90–120 s** of unchanged material; loops under that can run indefinitely if salience is kept low. Seamless loop = beginning and end joined so the seam is unlocatable.

### 4. Energy ≠ foreground/background function (two independent axes)
- **Intensity** (arousal): tempo, layer count, percussion density, dynamics.
- **Salience** (attention demand): melodic prominence, novelty, syncopation, hook strength.
- The four quadrants all exist: factory = high intensity / low salience (grid texture, minimal melody — it must not tire the player); boss = high intensity / high salience (the hook is the point); shop = low intensity / low salience; sad aftermath = low intensity / **high** salience (cutscene: melody carries all attention).
- Adaptive scoring manipulates intensity *without* changing identity: vertical layering adds/removes stems (Dire Dire Docks' land-percussion; stealth alert layers; fighting-game adaptive mixes), horizontal re-sequencing swaps sections. Activity changes inside one environment are normally scored as layer changes, not track changes.

### 5. Environment clusters share motifs (regional leitmotif families)
Undertale's Snowdin family (Snowy / Snowdin Town / Shop / dating sequence — one melody, four textures) and Ruins→Waterfall (same melody, slowed) show a second factorization: **one motif per region, one texture per activity within it**. Waterfall's chime figure also underpins "Another Medium" and "CORE" (region-to-region threading). CANDIDATE implication: motif identity can bind to *place*, with activity/emotion realized as arrangement transforms — cheaper and more cohesive than new material per vibe cell.

---

## Sources
- MTO 29.1 Lavengood & Williams, "The Common Cold": https://www.mtosmt.org/issues/mto.23.29.1/mto.23.29.1.lavengoodwilliams.html
- Cartridge Lit "High Scores: Factory Songs": https://cartridgelit.com/2022/04/30/high-scores-factory-songs/ and "Dire, Dire Docks": https://cartridgelit.com/2021/06/30/high-scores-dire-dire-docks/
- Gardiner Bryant, "Aquatic Ambience and Its Legacy": https://gardinerbryant.com/a-world-beneath-the-surface-aquatic-ambience-and-its-legacy/
- Gamedeveloper.com: "Classic Genre Series — Boss Music", "Arrangement for Vertical Layers Pt. 1", "Rethinking the audio loop in games", Winifred Phillips diegetic-music GDC writeups
- Jerome Leroy / Matthew Chilelli boss-track process posts: https://www.jeromeleroy.com/complog-content/2019/10/12/my-creative-process-writing-a-boss-battle-track-for-a-video-game , https://www.matthewchilelli.com/blog-2/2020/7/14/writing-a-boss-battle-track
- Jason M. Yu, Undertale leitmotif examination: https://jasonyu.me/undertale-part-1/ , https://jasonyu.me/undertale-part-2/
- Undertale wiki track pages (Tem Shop, Shop, Bergentrückung): https://undertale.fandom.com/wiki/Tem_Shop_(Soundtrack)
- TV Tropes: "Snowy Sleigh Bells", "Icy Keyboard", "Battle Theme Music", "Variable Mix"
- Animal Crossing music guides (hourly system, ~30 s loops): https://www.playanimalcrossing.com/animal_crossing_music/
- Loop-length guides: https://sorceress.games/blog/layer-how-to-make-good-video-game-music-ai-loops-2026 , https://www.makeuseof.com/how-to-create-music-loop-video-games/
- FF wiki "Good Night" (inn jingles): https://finalfantasy.fandom.com/wiki/Good_Night
- Laced Records "Jazz in video games": https://www.lacedrecords.com/blogs/blog/in-the-swing-of-things-12-times-jazz-bopped-into-video-games
- Casino music history: https://indiepulsemusic.com/2024/02/27/5-music-genres-used-in-casinos/
- Overcooked timer-coupled music: https://kinglink-reviews.com/2018/06/29/overcooked-review/
- Phrygian dominant/Hijaz: https://en.wikipedia.org/wiki/Phrygian_dominant_scale
