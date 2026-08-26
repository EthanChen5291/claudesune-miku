# Key census of the motif-engine corpora

Date: 2026-08-25. Read-only analysis; counting script at
`/private/tmp/claude-501/-Users-ethanchen-Documents-GitHub-motif-engine/f1dcbaad-750d-406e-bd16-4235ec57fef5/scratchpad/census.mjs`.

Sources:

- `/Users/ethanchen/Documents/GitHub/motif-engine/src/lib/progressions-undertale.js` — 163 entries, 83 songs. Keys are Krumhansl-Schmuckler solves (`sourceKey`), `keyMargin` = gap to runner-up key, `coverage` = fraction of sounding material the labels explain.
- `/Users/ethanchen/Documents/GitHub/motif-engine/src/lib/undertale-context.js` — 88 hand-curated titles (role/character/motifs/arc).
- `/Users/ethanchen/Documents/GitHub/motif-engine/src/lib/progressions-videos.js` — 19 entries, 10 songs. Human-read `sourceKey` from on-screen labels; **no `keyMargin`, no `coverage` (null), no `bpm`** — there is no MIDI behind these.
- `/Users/ethanchen/Documents/GitHub/motif-engine/src/lib/progressions-vgmusic.js` — 88 entries, 88 songs (1 loop/song by the D52 gate). Same KS solve, gated `keyMargin >= 0.06`, `coverage >= 0.9`.

Method notes:

- Counting is **per SONG**, not per entry. Safe for Undertale because the key is solved per song: **0 of 83 songs have entries that disagree on `sourceKey`** (the importer stamps song-level key/meter/bpm onto every loop). vgmusic is 1 entry = 1 song by construction. Videos counted per song by modal section key.
- Enharmonics normalized to sharps (Db→C#, Eb→D#, Gb→F#, Ab→G#, Bb→A#).
- "Thin margin" threshold = **0.06**, the vgmusic pack's own admission gate (D51/D52) — the Undertale pack deliberately keeps entries far below it. "Very thin" = < 0.03, where the solve is effectively a coin flip with the runner-up.
- Context coverage gaps: 6 curated titles have **no corpus entries** (Nyeh Heh Heh, Bonetrousle, Hotel, Can You Really Call This A Hotel…, Dogbass, The Wrong Number Song) — so Papyrus's two signature themes and both Hotel town cues are invisible to every table below, which depresses the `town` and Papyrus rows. One corpus song (`Start Menu`) is missing from context and counts as `(uncurated)`.

---

## 1. Overall key distribution (per song)

### Undertale (83 songs)

Mode split: **major 43 / minor 40** — essentially even.

| key | songs | thin (<0.06) | songs |
|---|---|---|---|
| F:minor | 7 | 2 | Another Medium; Battle Against a True Hero; Finale; Its Raining Somewhere Else; Quiet Water; Spider Dance; Uwa So Temperate |
| B:major | 6 | 3 | CORE; Death Report; Ghouliday; His Theme; Last Goodbye; SAVE the World |
| E:minor | 6 | 1 | But the Earth Refused to Die; CORE Approach; Death by Glamour; Here We Are; Thundersnail; Waterfall |
| G:minor | 6 | 2 | Dating Fight; Dummy; Enemy Approaching; Ghost Fight; Run; Song That Might Play When You Fight Sans |
| A:major | 5 | 0 | Home; Oh One True Love; Reunited; Room of Dog; You Idiot |
| C:major | 5 | 2 | Alphys; Burn in Despair; Menu Full; Temmie Village; Your Best Nightmare |
| D:major | 5 | 4 | Amalgam; Confession; Fallen Down Reprise; Oh Dungeon; Start Menu |
| D#:minor | 4 | 3 | Hopes and Dreams; Ruins; Snore Symphony; Undyne |
| F#:major | 4 | 2 | Danger Mystery; For the Fans; Tem Shop; Trouble Dingle |
| G#:minor | 4 | 1 | Dating Tense; Dont Give Up; NGAHHH; sans |
| A#:major | 3 | 2 | Dating Start; Undertale; Uwa So Holiday |
| B:minor | 3 | 2 | Power of NEO; Snowy; Uwa So HEATS |
| D:minor | 3 | 0 | ASGORE; Gasters Theme; Megalovania |
| D#:major | 3 | 3 | Metal Crusher; Spooktune Spookwave; Star |
| E:major | 3 | 1 | An Ending; Premonition; Wrong Enemy |
| F:major | 3 | 1 | Anticipation; Bird That Carries You…; Once Upon A Time |
| G#:major | 3 | 1 | Snowdin Town; Spear of Justice; Your Best Friend |
| A#:minor | 2 | 1 | Heartache; Stronger Monsters |
| C:minor | 2 | 1 | Bring It In Guys; Shop |
| C#:major | 2 | 0 | Dogsong; Unnecessary Tension |
| A:minor | 1 | 0 | Shes Playing Piano |
| C#:minor | 1 | 0 | Memory |
| F#:minor | 1 | 0 | Dununn Predummy |
| G:major | 1 | 0 | Its Showtime |

Tonic pitch-class totals (both modes): F=10, B=9, E=9, D=8, C=7, D#=7, G=7, G#=7, A=6, A#=5, F#=5, C#=3.
**All 24 major/minor keys occur at least once.** Black-key tonics = 27/83 songs (33%).

Per-song min `keyMargin` distribution: min 0.004, q25 0.040, median 0.082, q75 0.144, max 0.369. **32/83 songs (39%) fall under the 0.06 gate; 14 under 0.03.**

### vgmusic (88 songs)

Mode split: **minor 52 / major 36** — minor-leaning, opposite of Undertale's balance.

C:minor=11, A:minor=8, C:major=8, D:major=7, A#:minor=6, E:minor=6, G:major=6, G:minor=6, B:minor=5, A#:major=4, D:minor=3, D#:major=3, D#:minor=3, E:major=2, F:major=2, F:minor=2, A:major=1, B:major=1, C#:minor=1, F#:major=1, G#:major=1, G#:minor=1.

Tonics: C=19, G=12, A#=10, D=10, A=9, E=8, B=6, D#=6, F=4, G#=2, C#=1, F#=1. Black-key tonics = 20/88 (23%) — whiter-key than Toby.
Margins are healthy by construction: per-song min 0.061, median 0.152, max 0.348; 0 below the gate.
Platform x mode: snes 17m/12M, nes 16m/12M, genesis 12m/6M, gameboy 7m/6M — every platform leans minor, Genesis most (2:1).

### videos (10 songs, 19 sections)

**All 10 songs major** (Fujii Kaze — Prema has a D:minor A-section that parallel-modulates to D:major). Keys: C=2 (city-pop, etude close), C#/Db=2 (Yasashisa, dim-chain), D=2 (etude blue, Prema), B, E, F, F#/Gb = 1 each. No margins (human-read), no bpm. The three "Modulation etude" songs are one modulating piece split by section key (Gb → D → C-ish).

---

## 2. Undertale key x role (per song)

Roles from `undertale-context.js`. Columns: uncur=uncurated.

| key | uncur | battle | boss | char | credits | cutscene | diegetic | joke | menu | overworld | shop | town |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F:minor | . | . | 3 | 1 | . | . | . | . | . | 3 | . | . |
| B:major | . | . | 1 | . | . | 3 | 1 | . | . | 1 | . | . |
| E:minor | . | . | 1 | . | . | 1 | . | 1 | . | 3 | . | . |
| G:minor | . | 3 | 1 | 1 | . | 1 | . | . | . | . | . | . |
| A:major | . | . | . | . | . | 3 | . | . | . | 1 | . | 1 |
| C:major | . | . | 2 | 1 | . | . | . | . | 1 | . | . | 1 |
| D:major | 1 | 1 | . | . | . | 3 | . | . | . | . | . | . |
| D#:minor | 1 | . | 1 | 1 | . | . | . | . | . | 1 | . | . |
| F#:major | 3 | . | . | . | . | . | . | . | . | . | 1 | . |
| G#:minor | . | . | . | 1 | . | 3 | . | . | . | . | . | . |
| A#:major | . | . | . | . | . | 2 | . | . | . | 1 | . | . |
| B:minor | . | . | 1 | . | . | . | . | . | . | 2 | . | . |
| D:minor | . | . | 2 | 1 | . | . | . | . | . | . | . | . |
| D#:major | 1 | . | 1 | . | . | . | 1 | . | . | . | . | . |
| E:major | . | 1 | . | . | . | 2 | . | . | . | . | . | . |
| F:major | . | 1 | . | . | . | 2 | . | . | . | . | . | . |
| G#:major | . | . | 1 | 1 | . | . | . | . | . | . | . | 1 |
| A#:minor | . | 1 | 1 | . | . | . | . | . | . | . | . | . |
| C:minor | . | . | . | . | 1 | . | . | . | . | . | 1 | . |
| C#:major | . | . | . | 1 | . | 1 | . | . | . | . | . | . |
| A:minor | . | . | . | . | . | 1 | . | . | . | . | . | . |
| C#:minor | . | . | . | . | . | 1 | . | . | . | . | . | . |
| F#:minor | 1 | . | . | . | . | . | . | . | . | . | . | . |
| G:major | . | . | 1 | . | . | . | . | . | . | . | . | . |
| **TOTAL** | 7 | 7 | 16 | 8 | 1 | 23 | 2 | 1 | 1 | 12 | 2 | 3 |

Mode x role:

- major: cutscene **16**, boss 6, uncurated 5, battle 3, character 3, overworld 3, town **3** (all towns), diegetic 2, menu 1, shop 1
- minor: boss **10**, overworld **9**, cutscene 7, character 5, battle 4, uncurated 2, joke 1, credits 1, shop 1, town **0**

---

## 3. Undertale key x arc (per song)

| key | early | mid | late | climax | ending | (none) |
|---|---|---|---|---|---|---|
| F:minor | . | 2 | 2 | 2 | . | 1 |
| B:major | . | 1 | 2 | 2 | 1 | . |
| E:minor | . | 2 | 3 | 1 | . | . |
| G:minor | 3 | 2 | . | . | . | 1 |
| A:major | 1 | . | 1 | 1 | 1 | 1 |
| C:major | . | 2 | . | 2 | . | 1 |
| D:major | . | . | 3 | 1 | . | 1 |
| D#:minor | 1 | 1 | . | 1 | . | 1 |
| F#:major | . | 1 | . | . | . | 3 |
| G#:minor | 2 | 1 | . | 1 | . | . |
| A#:major | 1 | . | 1 | . | . | 1 |
| B:minor | 1 | . | . | 1 | . | 1 |
| D:minor | . | . | . | 2 | . | 1 |
| D#:major | . | 2 | . | . | . | 1 |
| E:major | . | . | . | . | 1 | 2 |
| F:major | 2 | 1 | . | . | . | . |
| G#:major | 2 | 1 | . | . | . | . |
| A#:minor | 1 | . | 1 | . | . | . |
| C:minor | 1 | . | . | . | 1 | . |
| C#:major | 1 | . | . | . | . | 1 |
| A:minor | . | . | 1 | . | . | . |
| C#:minor | . | . | . | . | . | 1 |
| F#:minor | . | . | . | . | . | 1 |
| G:major | . | 1 | . | . | . | . |

Mode x arc: major — early 7, mid 9, late 7, climax 6, **ending 3**; minor — early 9, mid 8, late 7, climax 8, **ending 1** (Bring It In Guys, a credits medley). Signal is modest overall, but two lines are real: **G:minor and F/G#-side keys own `early`** (G:minor 3, G#:minor 2, G#:major 2, F:major 2 of 16 early songs), and **B:major owns the late/climax/ending emotional lane** (5 of its 6 songs sit there). F:minor never appears early. Endings are major 3:1.

---

## 4. Which keys carry battle vs town vs cutscene (Undertale, with margins & bpm)

### battle (7 songs) — median bpm 174, the fastest role

| key | margin | bpm | song |
|---|---|---|---|
| G:minor | 0.369 | 120 | Ghost Fight |
| G:minor | 0.253 | 252 | Dummy |
| G:minor | 0.049 | 183 | Enemy Approaching |
| A#:minor | 0.040 | 174 | Stronger Monsters |
| D:major | 0.020 | 180 | Amalgam |
| E:major | 0.027 | 110 | Wrong Enemy |
| F:major | 0.052 | 110 | Anticipation |

**G:minor is the generic-encounter key** (3/7), and two of its three solves are rock-solid. The other four battle songs are ALL thin-margin — outside G:minor, the battle row's key claims are unreliable.

### boss (16 songs) — median bpm 120

Minor 10 / major 6. F:minor leads with 3 (Battle Against a True Hero 0.166, Finale 0.177, Spider Dance 0.350 — all solid margins), D:minor and C:major have 2 each. By character:

| character | songs (key, margin) |
|---|---|
| Asriel | Hopes and Dreams D#:minor 0.041 (thin); SAVE the World B:major 0.139 |
| Asgore | ASGORE D:minor 0.203 |
| Sans | Megalovania D:minor 0.097 |
| Toriel | Heartache A#:minor 0.121 |
| Undyne | Battle Against a True Hero F:minor 0.166; Spear of Justice G#:major **0.008** |
| Muffet | Spider Dance F:minor 0.350 |
| Flowey | Your Best Nightmare C:major 0.034 (thin); Burn in Despair C:major 0.082; Finale F:minor 0.177 |
| Mettaton | Metal Crusher D#:major 0.055 (thin); Its Showtime G:major 0.223; Death by Glamour E:minor 0.178; Power of NEO B:minor **0.009** |
| Papyrus | Dating Fight G:minor 0.039 (thin) |

### town (3 songs) — all major, no thin margins

Home A:major 0.118 (115bpm), Temmie Village C:major 0.133 (170), Snowdin Town G#:major 0.141 (110). Caveat: the two Hotel cues and Papyrus material are missing from the corpus, so `town` is undersampled.

### cutscene (23 songs) — 16 major / 7 minor, median bpm 116, widest bpm range (50–190)

Clusters: A:major x3 (Oh One True Love, Reunited, You Idiot — all solid), B:major x3 (Death Report 0.114, His Theme 0.063, Last Goodbye 0.048), G#:minor x3 (Dating Tense 0.252, NGAHHH 0.224, Dont Give Up 0.022), D:major x3 (Confession 0.068, Fallen Down Reprise 0.058, Oh Dungeon 0.023).

### overworld (12 songs) — 9 minor / 3 major

F:minor x3 (Another Medium 0.082, Quiet Water 0.090, Uwa So Temperate 0.036) and E:minor x3 (Waterfall 0.235, Here We Are 0.185, CORE Approach 0.085 — all solid). Area themes live in minor; towns in major — the overworld/town mode flip is the cleanest role signal in the corpus.

---

## 5. Margin caveats — rows dominated by thin solves

Per-song min margin < 0.06 (the vgmusic gate): 32/83 Undertale songs. Rows to distrust:

- **D#:major — 3/3 thin** (Metal Crusher 0.055, Spooktune 0.041, Star 0.004). The whole row is unreliable.
- **D:major — 4/5 thin** (Amalgam 0.020, Start Menu 0.016, Oh Dungeon 0.023, Fallen Down Reprise 0.058; only Confession 0.068 clears, barely). D:major's apparent "late-game cutscene" identity is mostly noise.
- **D#:minor — 3/4 thin** (Undyne 0.009, Hopes and Dreams 0.041, Ruins 0.052; only the uncurated Snore Symphony clears). The Ruins/Undyne/Hopes cluster is real-song-famous but weakly solved — these tracks are modal/pentatonic and KS struggles.
- **A#:major — 2/3 thin** including the song 'Undertale' at 0.009.
- **B:minor — 2/3 thin** (Power of NEO 0.009, Uwa So HEATS 0.049; only Snowy 0.062 clears, barely).
- **shop role — 2/2 thin** (Tem Shop F#:major 0.007, Shop C:minor 0.017). No reliable shop-key claim exists.
- **F#:major — 2/4 thin**, and 3 of its 4 songs are uncurated/joke cues (Danger Mystery, For the Fans, Trouble Dingle) — the row is junk-cue-dominated regardless of margin.
- Individual famous-song cautions: **Spear of Justice G#:major 0.008**, **Undyne D#:minor 0.009**, **Power of NEO B:minor 0.009**, **Alphys C:major 0.016** — the four thinnest curated solves; treat their keys as guesses.
- Conversely, the most trustworthy row claims: **F:minor** (5/7 solid, incl. Spider Dance 0.350), **G:minor battle** (Ghost Fight 0.369, Dummy 0.253), **E:minor overworld** (all >=0.085), **A:major** (5/5 solid), **D:minor bosses** (all >=0.097).
- vgmusic margins are all >=0.061 by gate; videos have no margins at all (human-read labels — a different failure mode: my reading of a video frame, unverified by D45).

---

## 6. Tempo/BPM field inventory (grep of src/lib + scripts/import-*.mjs)

- `progressions-undertale.js` & `progressions-vgmusic.js`: per-entry `meter` + `bpm` (song-level, stamped by importers). Origin: `src/ingest/midi.js` parses the first set-tempo meta (`tempoBpm`), `src/ingest/corpus.js:79` rounds it (`null` if absent). UT: n=163, 47–252, median 120, 0 null. VG: n=88, 60–225, median 140, 1 null (`vg_nes_bucky_o_hare_blue_planet_2`, which also has a garbage `meter: '1/8'`).
- `progressions-videos.js`: **no bpm/tempo field** (no MIDI); one comment mentions 125bpm in `figurations-videos.js`.
- `rhythms-unison.js`: per-entry `bpm` parsed from the kit filename (`scripts/import-unison.mjs:236`).
- `atlas.js`: `speed.bpm` + `speed.bpmBand` (slow/mid/fast) per card — the retrieval-facing tempo axis.
- `melodies-tier2.js`: bpm only in comments; `instruments.js`: prose only.
- UT median bpm per role: battle 174 (110–252), boss 120 (110–175), cutscene 116 (50–190), overworld 120 (70–150), town 115, character 120. Battle is the clear tempo outlier.

---

## 7. Observations (CANDIDATES — corpus statistics, not ratified taste; the ear decides what any of this is worth)

1. **CANDIDATE: G:minor is Toby's small-fight key.** 3 of 7 `battle` songs (Ghost Fight, Dummy, Enemy Approaching) — and the two strongest key solves in the whole corpus (0.369, 0.253) are both G:minor battles. Every other battle song's key is thin-margin.
2. **CANDIDATE: heavyweight bosses cluster in F:minor.** Battle Against a True Hero, Finale, Spider Dance — 3 of 16 boss songs, all solid margins, all mid-or-later arc; F:minor never appears before `mid` anywhere. F is also the corpus's most common tonic (10/83).
3. **CANDIDATE: B:major is the pacifist-emotional key.** SAVE the World, His Theme, Last Goodbye, Death Report, CORE, Ghouliday — 5 of 6 sit at late/climax/ending. The Asriel material (His Theme, Last Goodbye, SAVE the World) is a single B:major family. (Caveat: 3 of 6 solves are thin.)
4. **CANDIDATE: town=major, overworld=minor is the cleanest role/mode rule.** Towns 3/3 major (solid margins); overworld 9/12 minor with E:minor (Waterfall side) and F:minor (Hotland side) as area-key anchors. Undersampled: Hotel cues missing from corpus.
5. **CANDIDATE: A:major is the warmth/domestic key.** Home, Reunited, Oh One True Love, You Idiot, Room of Dog — cutscene/town-leaning, 5/5 solid margins, and its cutscenes are the slow ones (60–92 bpm).
6. **CANDIDATE: Mettaton is deliberately key-less.** Four boss tracks in four unrelated keys (D#:major, G:major, E:minor, B:minor) — the only multi-boss character with no key identity; Flowey by contrast keeps C:major twice, and Undyne's material orbits the G#/D# black-key region (though on the two thinnest solves in the set).
7. **CANDIDATE: modes are balanced overall (43M/40m) but roles split them** — bosses 10/16 minor, cutscenes 16/23 major, endings 3/1 major. Toby's key palette covers all 24 keys with 33% black-key tonics; the vgmusic corpus is minor-leaning (52/36), C-heavy (C tonic 19/88, C:minor 11), and only 23% black-key — an engine drawing on both pools inherits two different priors.
8. **CANDIDATE: the videos pack is an all-major pool.** 10/10 songs major (jazz/city-pop/neo-soul idioms), keys spread B/C/C#/D/E/F/F#, with Prema's minor→parallel-major lift as the one mode event. It contributes no battle/minor material at all.
9. **CANDIDATE: tempo separates roles better than key does.** Battle median 174bpm vs everything else at 110–120; a generator picking "battle" should reach for tempo first, key second.
10. **Data caveat, not candidate:** any key-based conclusion touching D:major, D#:major, D#:minor, A#:major, B:minor, or the shop role rests mostly on sub-0.06 margins (39% of UT songs overall); and the corpus is missing Papyrus's themes and both Hotel cues, so Papyrus/town rows undercount reality.
