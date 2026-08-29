<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

All research complete. Synthesizing the final report.

# Horror scoring research — dissonance dosing + three-lane recipes

## 0. The core finding: why "too much" fails, in one law

Every credible source converges on the same principle: **horror dissonance only works against a consonant floor**. Dissonance is contrast, not content. Three mechanisms kill it when overdosed:

1. **Habituation** — the definitive cautionary tale is Dead Space: reviewers praised Graves' aleatoric craft but noted the music "pitched at the same intensity throughout... creates a constant 'BOO!' state rather than building tension" ([VGMO](https://vgmonline.net/deadspace/)). Constant dissonance re-normalizes as noise within minutes.
2. **Loss of the violated expectation** — "full chords introduce resolution... in horror, familiarity reduces tension," but equally, with no tonal frame at all there is nothing to violate. Herrmann's Psycho works because harmony is "loosely based on traditional Western harmony, then transformed *enough*" — not abandoned ([Royal Holloway](https://www.royalholloway.ac.uk/media/19436/herrmann%20teachinghub.pdf)).
3. **Register/density mud** — mid-register mezzo-forte clusters read as "bad mix," not fear. Clusters work pp-high (shimmer of dread) or ff-low-and-short (terror hit), almost never in between ([Flutu Music](https://flutumusic.com/2023/02/13/horror-music-for-video-games/)).

**The budget rule for a generative engine: one primary harmonic-dissonance device per cue + unlimited *timbral* dissonance (noise, detune, texture — free, spends no harmonic budget). Everything else stays diatonic minor.** This is exactly the desert lesson replayed: serve one trope raw; don't stack.

---

## 1. DOSING TABLE (device → when → how much → what to avoid)

| Device | Severity | When (lane) | Register | Dose (duration / gain / frequency) | What to avoid |
|---|---|---|---|---|---|
| **Minor-2nd ostinato** (Jaws E–F) | Med | Action; ambience at slow tempo | LOW (octave 1–2 strings/synth) | Tempo & gain map to threat: slow+quiet = distant, fast+loud = close. Persistent once started; but Williams kept *appearances* rare — silence between uses is the dose ([The Conversation](https://theconversation.com/45-years-on-the-jaws-theme-manipulates-our-emotions-to-inspire-terror-136462)) | Mid/high register (reads comic); harmonizing it — the bass stays put, the m2 is *melodic* |
| **Sustained m2/m9 clash** (melody a semitone off drone) | High | Ambience peaks | Melody mid, drone low (m9 spacing softens to "eerie" vs raw m2 "alarm") | ONE clashing voice, quiet (≈0.1–0.2 gain), ≤2 bars, then resolve down to the drone's chord tone. ≤1–2 per 16 bars | Two+ simultaneous clashing voices; loud sustain (becomes siren); putting the clash IN the lead melody line |
| **Tritone** | Low–Med | All lanes | Any | The *safest* dissonance — still pitch-centered. As melodic outline (i.e., #4 in a phrase) or bass pivot, 1–2 per phrase. Fine in loops | Tritone + m2 together in one sonority (that's a cluster); parallel tritone planing (goes cartoon-spooky) |
| **b9 / cluster stinger** | High | Ambience (event-tied), action downbeats | High strings or full-range | **0.5–2 s; ~+14 dB over bed (bed −20 dB, stinger −6 dB); ≤1 per 60–90 s, ideally less** ([Mowjera](https://mowjera.com/blog/horror-game-sound-design-silence)) | Stingers on a timer/loop grid (predictable = dead); >2 s decay tails that overlap the next one |
| **Tone cluster** (3+ adjacent semitones) | Very high | Peaks only | HIGH+pp = dread shimmer (sustainable); LOW+ff = terror hit (short) | High/quiet: may sustain whole sections at ≤0.15 gain. Low/loud: ≤1 bar, ≤1 per section | Mid-register mf clusters (mud); clusters as a *progression* member — they're events, not chords |
| **Semitone trill / oscillation** | Med | Ambience | High, pp | Intermittent — 1–2 bars on, 4–8 bars off; gain ≤0.1 (the strings-whisper law already learned) | Continuous trilling (becomes texture wallpaper, loses meaning) |
| **Quarter-tone / detune drift** | Timbral (free) | All lanes, esp. music-box & drones | Pads/drones only | **±15–50 cents between two layers** of the same note → slow beating; cap ~100 cents before it reads as a wrong *note* not a wrong *tuning* ([Native Instruments](https://blog.native-instruments.com/scary-sound-effects/); [A Sound Effect](https://www.asoundeffect.com/horror-sound-design-techniques/)) | Detuning the melody-carrying voice (reads as broken audio); detuning both layers in the same direction (no beating, just flat) |
| **Col legno / sul pont / metallic found-sound** | Timbral (free) | All lanes | Any | Unlimited — this is where Penderecki, Little Nightmares, and Silent Hill put MOST of their horror. Timbre-dissonance never fatigues the way harmonic dissonance does ([The Artifice](https://the-artifice.com/penderecki-sound-horror/); [Gamemusic on LN](https://gamemusic.net/little-nightmares-original-soundtrack-2/)) | Substituting it entirely for pitch (engine needs chords to generate against) |
| **Aleatoric swarm** (Penderecki/Dead Space) | Extreme | Reserved: one peak event per song, if at all | Full string range, glissandi | ≤4 bars, once. It's a climax color, not a texture ([Dead Space fear-layer system](https://en.wikipedia.org/wiki/Music_of_the_Dead_Space_series)) | Sustained use — see the Dead Space "constant BOO" criticism |
| **i(maj7) "Hitchcock chord"** | Low | All lanes — the star | Any | The premium find: a *chordal, loopable, sustainable* dissonance. Herrmann used it "repeated very often... taking the place of traditional harmonic resolution" ([Pearson analysis](https://qualifications.pearson.com/content/dam/pdf/A%20Level/Music/2016/teaching-and-learning-materials/A_level_Herrmann_Psycho_set_work_support_guide.pdf)) | Voicing the maj7 a m2 under the root's octave (put the 7 up top, spaced) |

**Cross-cutting dose numbers** ([Mowjera](https://mowjera.com/blog/horror-game-sound-design-silence), [Flutu](https://flutumusic.com/2023/02/13/horror-music-for-video-games/)): ambience tempo **<70 BPM or pulseless** (50–68 BPM cited; a clear driving beat reads "action game"); dynamic spread safe→peak ≈**14 dB**; sub-drone energy 20–60 Hz (engine note: bare sine at octave 1 is inaudible per existing doctrine — use octave 2 with a harmonic-rich Surge patch); perfect 5ths are "surprisingly stable even in minor" — the drone itself should be root+5th, keeping all instability in what floats above it.

---

## 2. "Wrong key" techniques, ranked by damage to a mostly-tonal engine

Usable now, minimal damage:
1. **Phrygian minor i–bII** — the single most-cited dark device ([Musiversal](https://musiversal.com/blog/learn-dark-chord-progressions): "the bII is the single most unsettling chord in common use"). Crucial project synergy: all-minor Phrygian read "dark, not desert" to Ethan's ear — **that failed desert reading is exactly the correct horror reading.** The engine already speaks this.
2. **i(maj7)** as tonic sonority — see table. Engine note: chord-dialect trap — verify the symbol before use (unknown symbols silently get wrong intervals); if unsupported, build it with figure tokens (`R`, `3` on minor, `5`, plus a `~11` figure for the maj7 — no negative semitones needed).
3. **Chromatic mediants** — i–bvi(minor), i–biii(minor); "alternating tonic and chromatic mediants (C–Abm–C–Ebm) builds tension" while every chord stays a plain consonant triad ([Orchestral Metal](https://www.orchestralmetal.com/blog/may-11th-2016)). Wrongness lives *between* chords, not inside them — ideal for an engine whose voices bind to chord tones.
4. **Neapolitan cadence** (bII6→V→i) at phrase ends only.
5. **Lament tetrachord bass** (tonic down a 4th to dominant, diatonic version first) — grief-coded, fully chordal ([Wikipedia](https://en.wikipedia.org/wiki/Lament_bass)).

Dose-limited (event, not bed):
6. **Melody a semitone off the drone** — see dosing table row 2.
7. **Bitonal pad** (Herrmann-style polychord: two triads a tritone or m2 apart) — brief, 1–2 bars, quiet upper triad; Herrmann tied bitonality to "irrationality" as a *moment* device ([MTO on Herrmann's polytonality](https://www.mtosmt.org/issues/mto.25.31.4/mto.25.31.4.moreira.pdf)).

Not worth it:
- **Locrian as home mode** — no stable tonic; the engine's whole architecture assumes one. Skip.
- **Lydian b7** — reads sci-fi/wonder, not horror. Skip for these lanes.
- **Diminished-7th chains** — this is precisely the chromaticism Ethan already rejects (D88 territory). A *single passing* v° or ii°ø between diatonic chords is fine; chains are not.

---

## 3. Canonical game scores — per-title recipes

| Title | Ambient recipe | Chase/action recipe | "Epic" recipe |
|---|---|---|---|
| **Silent Hill** (Yamaoka) | Texture over melody: industrial drones, radio static, "emotional spaces to inhabit" not tunes ([Tone Glow](https://toneglow.substack.com/p/tone-glow-230-akira-yamaoka)) | Trip-hop/industrial pulse + metallic percussion loops | The melodic tracks ("Promise") are *clean, tonal, mandolin-led* — the key Yamaoka insight: **melody and dissonance never share a track**; dissonance is 100% timbral |
| **Resident Evil** save rooms | "Anxious calm": 2–3 chords, simple looping melody on top of *unsettled pulsating held synth chords* — consonant surface, uneasy sustain ([Laced Records](https://www.lacedrecords.co/blogs/blog/vgm-subgenres-the-anxious-calm-of-resident-evil-save-room-music)) | — | — |
| **Dead Space** (Graves) | 4 simultaneous adaptive intensity layers, game-state crossfaded ([Wikipedia](https://en.wikipedia.org/wiki/Music_of_the_Dead_Space_series)) | Aleatoric string chaos, cluster brass | Cautionary: constant max intensity → fatigue ([VGMO](https://vgmonline.net/deadspace/)) |
| **Amnesia** (Tarmia) | Short soundscape cues; dark orchestral bed + sparse piano accents, choir moans, live-sample sourced ([Cubed3](https://www.cubed3.com/features/music-review/amnesia-the-dark-descent)) | Minimal — terror carried by sound design | — |
| **Little Nightmares** (Lilja) | "Horror without clichés": found-metal instruments, fog horn, bowed spring reverb, huge vessel-like reverbs ([Gamemusic](https://gamemusic.net/little-nightmares-original-soundtrack-2/)) | Grinding metallic ostinati | LN2: **music box + punched-paper nursery rhymes** as the identity ([Gamemusic LN2](https://gamemusic.net/a-possessed-music-box/)) |
| **FNAF** | Silence + ambient hum; music only as *diegetic threat* | — | Music box **Toreador March** — a real, innocent, pre-existing tune recontextualized; the tune itself is untouched ([SlashFilm](https://www.slashfilm.com/1398653/five-nights-freddys-toreadors-march-french-opera/)) |
| **Darkwood** (Kordas) | Forest-sourced drones + deep beating bass + haunting sparse piano; even "calm" tracks keep despair undertone ([Black Screen Records](https://blackscreenrecords.com/products/darkwood)) | Pulsing bass intensification | — |
| **Bloodborne** | — | "Wall of sound" action: full orchestra + choir, extended techniques ([GDC 2016](https://gdcvault.com/play/1023339/The-Gothic-Horror-Music-of)) | Large choir + soloists, lament figures, **pipe organ layered onto a cleaned-up reprise of an earlier theme** (Laurence) — epic = *tonal theme + gothic timbre*, not more dissonance |
| **Castlevania** | — | Baroque organ/harpsichord + driving rhythm; harmony mostly straight tonal minor | The gothic signifier is the **instrument** (organ), not the harmony |

**The meta-pattern across all nine**: the more "listenable"/iconic the horror track, the more the horror is carried by **timbre + one device**, over fully tonal bones.

---

## 4. Music-box horror recipe (childlike-eerie)

Why it works: innocence/dread juxtaposition + uncanny valley — "the tiny bit that's off is what makes it feel very wrong" ([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/OminousMusicBoxTune); [Tropedia](https://tropedia.fandom.com/wiki/Ironic_Nursery_Tune)). Concrete recipe:

1. **Tune**: a genuinely simple, singable 8-bar lullaby in 3/4 or 6/8 (engine: 4/4 with triplet feel, per the D92 4/4-only law), **major or natural minor — write it pretty first**. FNAF proves the tune can be 100% innocent.
2. **Timbre**: music box / celesta (GeneralUser GS has a GM Music Box preset — fluidsynth path; or a plain WAV one-shot set, tier (a)).
3. **Corruptions, pick 2–3, never all**: (a) slow to ~0.6–0.8× with occasional ritardando "winding down"; (b) duplicate the layer detuned **+15–40 cents** for beating; (c) **one wrong note per phrase** — b2 or #4 substituting for an expected diatonic tone, at the phrase *end*; (d) timing jitter / a dropped note (mechanical decay); (e) big dark reverb tail.
4. **Accompaniment**: either **none** (isolation is the point) or a low root+5th drone a large gap below — the m9/tritone tension comes from the wrong note against the drone, one clash at a time.

---

## 5. Horror harmony that stays listenable — ranked for a looping soundtrack

1. **i – bII – i** (Phrygian oscillation) — infinitely loopable, both chords consonant. `0:m 1b` in engine degrees.
2. **Diatonic lament tetrachord** (e.g., Am–G–F–E(or Em): `0:m 10b 8b 7:m`) — descent = inevitability; the chromatic-fill version is darker but spends chromatic budget.
3. **i(maj7) pedal** over ostinato — one sonority, sustainable for whole sections (Herrmann's proof).
4. **Chromatic mediant pair**: i – bvi(minor) (`0:m 8b:m`) or i – biv-area minor mediants — consonant chords, alien relation.
5. **i – iv – bII – i** (adds the subdominant for motion; still all-consonant).
6. **Neapolitan cadence** bII6–v–i at phrase ends only.
7. **Passing v°/ii°ø** between diatonic chords — single diminished, never chained.
8. *(floor)* dim7 chains / cluster-harmony — fails the listenability bar and Ethan's existing anti-chromaticism verdict; excluded.

---

## 6. Per-lane structural recipes

**LANE 1 — HORROR AMBIENCE (exploration).** Tempo <70 BPM or pulse-free. Bed: root+5th low drone (octave 2, harmonic-rich Surge patch) + a second drone layer detuned +20–40 cents (beating does the "alive" work). NO full melody — "if the safe state has a recognizable melody, the player will hum along to it" ([Mowjera](https://mowjera.com/blog/horror-game-sound-design-silence)); instead 2–4-note piano/celesta fragments, placed irregularly, ~0.15–0.25 gain (Darkwood/Amnesia model). Harmony nearly static: i, with one bII lean per 8 bars. One m2-clash or trill event per 16 bars, quiet. Stinger budget ≤1/60–90 s at ~+14 dB over bed, event-tied. Real silence gaps. Engine mapping: this lane naturally satisfies the ≤60 BPM intro-drop rule and sparsity-as-ensemble-shape doctrine.

**LANE 2 — HORROR ACTION (chase).** 120–160 BPM (Jaws logic: tempo = proximity). Relentless low ostinato in 8ths/16ths built from *stable* intervals (root, 5th, octave) + ONE m2 neighbor note — keep the ostinato itself near-consonant so the dissonance events read ([Recording Arts](https://recordingarts.com/how-to-create-emotion-in-music-terror/)). Phrygian or Phrygian-dominant fragments above; **whole-section transposition up a semitone** (the rising-sequence device — engine: this is a section-level key shift, cheap to implement, huge dread payoff). Cluster/b9 stabs on sparse downbeats (≤1 per 4 bars). Drums drive; tritone bass pivot at turnarounds. Ends abruptly, not with a cadence.

**LANE 3 — EPIC HORROR (main theme).** The MOST tonal lane — Bloodborne/Castlevania prove epic horror = **tonal minor theme + gothic timbre** (organ, choir, big low percussion, lament bass). Structure: passacaglia over lament tetrachord or i–bvi–bII–v; a **Dies-Irae-shaped motif** — stepwise, falling, 4–8 notes ([Sounding Out!](https://soundstudiesblog.com/2017/12/18/beyond-the-grave-the-dies-irae-in-video-game-music/)) — as the A-theme; terrace dynamics (organ-like), choir sustains on bar-tops; i(maj7) as the final sonority instead of a picardy. Dissonance appears only at cadences (Neapolitan) and via timbre. This lane fits the existing section-grammar (bridges, handoffs) unchanged.

**Sound-sourcing (practical tiers)**: music box → GeneralUser GS GM Music Box or WAV one-shots (tier a/c); detuned drones → Surge XT oscillator cent-detune in a new .fxp (tier d — and per D85, prove the patch loaded with a spectrum measurement, not a truthy return); metallic/col-legno textures → WAV one-shots (VSCO-2 CE likely lacks col legno/sul pont articulations — verify against the vendored SFZs before promising them); organ/choir → check GeneralUser GS presets before hunting new SFZs.

**Sources:** [Film Music Theory — harmonic tension psychology](https://filmmusictheory.com/article/the-psychology-of-harmonic-tension-in-horror-scores/) · [JUNO — sound of fear](https://junoawards.ca/blog/the-sound-of-fear-how-music-makes-the-ordinary-terrifying/) · [Musicians Addition — spooky scales](https://www.musiciansaddition.com/post/spooky-scales-the-music-theory-behind-creepy-compositions) · [WDAV — tritone in horror](https://blogs.wdav.org/2019/10/the-tritone-interval-and-its-use-in-horror-films/) · [Northern Film Orchestra — 5 horror tips](https://www.northernfilmorchestra.com/post/film-composers-5-tips-for-writing-horror-music) · [PremiumBeat — what makes music scary](https://www.premiumbeat.com/blog/what-makes-music-sound-scary/) · [Recording Arts — terror](https://recordingarts.com/how-to-create-emotion-in-music-terror/) · [The Artifice — Penderecki](https://the-artifice.com/penderecki-sound-horror/) · [Threnody analysis](https://mawrgorshin.com/2022/05/31/analysis-of-threnody-for-the-victims-of-hiroshima/) · [Royal Holloway — Herrmann/Psycho](https://www.royalholloway.ac.uk/media/19436/herrmann%20teachinghub.pdf) · [Pearson — Psycho set work](https://qualifications.pearson.com/content/dam/pdf/A%20Level/Music/2016/teaching-and-learning-materials/A_level_Herrmann_Psycho_set_work_support_guide.pdf) · [MTO — Herrmann polytonality](https://www.mtosmt.org/issues/mto.25.31.4/mto.25.31.4.moreira.pdf) · [Musiversal — dark progressions](https://musiversal.com/blog/learn-dark-chord-progressions) · [Orchestral Metal — chromatic mediants](https://www.orchestralmetal.com/blog/may-11th-2016) · [Wikipedia — lament bass](https://en.wikipedia.org/wiki/Lament_bass) · [Tone Glow — Yamaoka](https://toneglow.substack.com/p/tone-glow-230-akira-yamaoka) · [Laced Records — save rooms](https://www.lacedrecords.co/blogs/blog/vgm-subgenres-the-anxious-calm-of-resident-evil-save-room-music) · [VGMO — Dead Space](https://vgmonline.net/deadspace/) · [Wikipedia — Dead Space music](https://en.wikipedia.org/wiki/Music_of_the_Dead_Space_series) · [Cubed3 — Amnesia OST](https://www.cubed3.com/features/music-review/amnesia-the-dark-descent) · [Gamemusic — Little Nightmares](https://gamemusic.net/little-nightmares-original-soundtrack-2/) · [Gamemusic — LN2 music box](https://gamemusic.net/a-possessed-music-box/) · [SlashFilm — FNAF Toreador](https://www.slashfilm.com/1398653/five-nights-freddys-toreadors-march-french-opera/) · [Black Screen — Darkwood](https://blackscreenrecords.com/products/darkwood) · [GDC — Bloodborne gothic horror](https://gdcvault.com/play/1023339/The-Gothic-Horror-Music-of) · [Soundiron — Bloodborne style](https://soundiron.com/blogs/news/composing-in-the-style-of-bloodborne-soundiron-session) · [TV Tropes — ominous music box](https://tvtropes.org/pmwiki/pmwiki.php/Main/OminousMusicBoxTune) · [NI — scary sound effects](https://blog.native-instruments.com/scary-sound-effects/) · [A Sound Effect — horror techniques](https://www.asoundeffect.com/horror-sound-design-techniques/) · [The Conversation — Jaws](https://theconversation.com/45-years-on-the-jaws-theme-manipulates-our-emotions-to-inspire-terror-136462) · [Mowjera — silence & numbers](https://mowjera.com/blog/horror-game-sound-design-silence) · [Flutu — horror for games](https://flutumusic.com/2023/02/13/horror-music-for-video-games/) · [Unidark — horror game music](https://unidark.substack.com/p/best-music-for-horror-games-how-to) · [Sounding Out! — Dies Irae in games](https://soundstudiesblog.com/2017/12/18/beyond-the-grave-the-dies-irae-in-video-game-music/)
