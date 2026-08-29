# Corpus atlas — r15

What the r15 MIDI corpus actually contains, lane by lane, and which tracks
are worth deep chord-loop analysis for the engine's trope pools.

**Read this first — every classification here is a metadata-based
inference, not a listening impression.** Nobody heard any of these 1786
files. Each row's lane, mood, energy and style tags were derived by 15
shard agents from filename, folder, extracted key/meter/tempo, melody
pitch-class histograms, note density and extracted chord loops. Where a
title and the extracted content disagree, the atlas says so rather than
picking a winner. The 46 questions in
`scratchpad/r15/analysis/uncertainties.json` are the ones only Ethan's ear
can settle; they are referenced inline as (u1)…(u46).

Source data: `scratchpad/r15/analysis/shards-out/*.out.jsonl` (1786 rows,
one per file) and `scratchpad/r15/analysis/smwc-tags-summary.json`.

---

## 1. Corpus inventory

### 1.1 Sources

| Source | Files | high | medium | low | high % |
|---|---:|---:|---:|---:|---:|
| `audios/vgmusic` (general tree) | 1199 | 602 | 260 | 337 | 50% |
| `audios/hsmusic` (Homestuck / fan albums) | 348 | 190 | 69 | 89 | 55% |
| `audios/vgmusic-lanes/desert` | 60 | 25 | 25 | 10 | 42% |
| `audios/vgmusic-lanes/jungle` | 60 | 33 | 11 | 16 | 55% |
| `audios/vgmusic-lanes/space` | 60 | 33 | 9 | 18 | 55% |
| `audios/vgmusic-lanes/horror` | 59 | 34 | 13 | 12 | 58% |
| **Total** | **1786** | **917** | **387** | **482** | **51%** |

1783 distinct filenames — 3 files (`emperor.mid`, `smstg2a.mid`,
`snes__Lunar_Pyramid.mid`) were classified twice by different shards.

**engineValue** is the shard agents' judgment of whether a row could feed
the engine at all: `high` = clean key, allowed meter, plausible tempo and
at least one extracted chord loop; `low` = one or more of those is broken.
It is a data-quality grade, not a musical one — a `low` row can be great
music with a mangled tempo map, and a `high` row can be a boss-chaos
scramble.

### 1.2 Platform spread

1547 of 1786 filenames carry no platform prefix (the general vgmusic tree
and all of hsmusic). The prefixed files come from the four lane folders:
nes 63, snes 52, genesis 37, n64 30, ps1 27, gameboy 15, gba 15.

### 1.3 hsmusic composition

348 rows across ~35 fan albums. Largest: homestuck-vol-5 (36),
muse-of-net (29), sburbmon-ost (28), homestuck-vol-9 (23),
homestuck-vol-8 (20), homestuck-vol-4 (19), alterniabound (16),
homestuck-vol-1 (16), alternia (13), coloUrs-and-mayhem-universe-a (13).

hsmusic's idiom is piano and electronic, not modal folk. Its lane
distribution reflects that: 112 rows fall to `other`, 74 to battle_fight,
40 calm_pastoral, 29 somber_sad, 20 town_shop, 18 space — and only **3**
to desert, **0** to jungle. Whether hsmusic should feed the desert pool at
all is (u37).

### 1.4 Duplication

- **49 basename groups contain more than one row** (98 rows, 5.5% of the
  corpus). 46 of those groups span `vgmusic` and `vgmusic-lanes`, i.e. the
  lane folders are largely a curated overlay of the main tree rather than
  a separate corpus.
- **21 of the 49 groups received different lane calls** from different
  shard agents on the same music (e.g. `InnerHallways.mid`,
  `cryst-py.mid`, `Ghostbusters2-StatueOfLibertyStage.mid`,
  `CV4-_Secret_Room.mid`). Every lane total below double-counts those.
- hsmusic adds arranger-variant duplicates on top: Explore ×4,
  Crystamanthequins ×2, The Broken Clock ×2, The Blind Prophet ×2,
  Showdown ×2, At The Price of Oblivion ×2, Savior of the Waking World ×2.
- vgmusic adds rip-variant duplicates: Sandopolis Zone 1 appears 5× under
  4 filenames, Bloody Tears ×2, `Ml2spzn2V1_4`/`Ml2spzn2v1_3` (identical
  metadata), `Desert_GS`/`Desert_XG_V127`, `SOMDesert`/`SOMDesert-SC8850`,
  `cxstage1`/`dxstage1`.

Dedupe policy is (u21) and (u42). **Do not build a retrieval pool from
these totals without deduping first** — library growth re-rolls every
unpinned song's `fnv % pool.length`.

---

## 2. Lane census

| Lane | n | % | mean conf | high | med | low | dominant energy |
|---|---:|---:|---:|---:|---:|---:|---|
| other | 574 | 32.1% | 0.37 | 269 | 123 | 182 | mid (368) |
| battle_fight | 422 | 23.6% | 0.54 | 226 | 85 | 111 | high (348) |
| space | 97 | 5.4% | 0.52 | 53 | 18 | 26 | mid (48) |
| calm_pastoral | 92 | 5.2% | 0.44 | 46 | 21 | 25 | mid (52) |
| town_shop | 82 | 4.6% | 0.47 | 49 | 20 | 13 | mid (58) |
| desert | 79 | 4.4% | 0.58 | 41 | 27 | 11 | mid (59) |
| somber_sad | 60 | 3.4% | 0.48 | 36 | 11 | 13 | low (41) |
| jungle | 57 | 3.2% | 0.59 | 23 | 18 | 16 | mid (40) |
| triumphant | 56 | 3.1% | 0.45 | 31 | 10 | 15 | mid (34) |
| horror_catacombs | 54 | 3.0% | 0.56 | 24 | 14 | 16 | high (32) |
| cave | 50 | 2.8% | 0.47 | 27 | 12 | 11 | mid (33) |
| horror_manor | 43 | 2.4% | 0.47 | 24 | 10 | 9 | mid (21) |
| factory_industrial | 34 | 1.9% | 0.46 | 20 | 7 | 7 | mid (20) |
| sky_flight | 34 | 1.9% | 0.49 | 19 | 3 | 12 | mid (18) |
| water | 23 | 1.3% | 0.55 | 15 | 3 | 5 | mid (14) |
| ice_snow | 21 | 1.2% | 0.58 | 11 | 4 | 6 | mid (15) |
| horror_citadel | 8 | 0.4% | 0.43 | 3 | 1 | 4 | mid (4) |

Three structural facts fall straight out of this table:

1. **Over half the corpus (996 rows) is `other` or `battle_fight`.**
   `other` also carries the lowest mean confidence of any lane (0.37) while
   holding 269 high-value rows — usable music with nowhere to go (u35).
2. **The engine's distinctive environment lanes are thin.** desert 79,
   jungle 57, and the three horror lanes together 105. horror_citadel has
   **8 rows in 1786** and half of them are broken (u5).
3. **Lane conviction tracks lane specificity.** jungle (0.59), desert
   (0.58) and ice_snow (0.58) have the highest mean confidence because
   they have audible signatures a histogram can see; `other` and
   calm_pastoral have the lowest because they are defined by absence.

### 2.1 Lane-folder fidelity

The four curated folders were the corpus's best guess at lane supply.
Content-based classification agreed with the folder as follows:

| Folder | n | landed in the intended lane | biggest leak |
|---|---:|---|---|
| `desert` | 60 | **56 (93%)** | 2 → battle_fight, 1 → ice_snow (`mkart64_frozenhyrule`), 1 → town_shop |
| `horror` | 59 | 50 (85%: catacombs 33, manor 14, citadel 3) | 7 → battle_fight (boss themes) |
| `space` | 60 | 38 (63%) | 10 → battle_fight, 3 → town_shop, 2 → desert, 2 → triumphant, 2 → ice_snow |
| `jungle` | 60 | **35 (58%)** | 6 → battle_fight, 6 → town_shop, 4 → space, 3 → water, 2 → triumphant |

Desert's 93% is misleading: the agents largely followed the folder because
the folder was the strongest available evidence, and 16 of those 56 rows
have **no b2 in the melody at all** (u9). Jungle's 58% is the honest
number — the jungle folder contains Dragon Warrior overworld marches
(`nes__DW4TALN`) and Chrono Trigger's Robo theme (`snes__Robos_Theme_V4`).

---

## 3. Lane-by-lane detail

Notation in the exemplar tables: **conf** = the shard agent's lane
confidence (0-1), **ev** = engineValue. "Loop" figures quoted are the
extractor's, in the engine's semitone-degree dialect.

### 3.1 desert — 79 rows (41 high, 27 medium, 11 low)

Top style tags: phrygian 19, modal-vamp 19, ostinato 7, waltz 4,
diminished-vamp 4, groove 3, exotic 2, jazz-changes 2, andalusian 2.
Sources: 56 from the desert folder, 18 general vgmusic, 3 hsmusic, 2 from
the space folder.

The lane splits into four families that D93/D94 treat very differently:

| Family | rows | Fits the engine's desert law? |
|---|---:|---|
| bII / heavy-b2 (phrygian tag) | ~19 | Only if the third is RAISED — metadata can't tell (u3) |
| diminished-vamp (Sandopolis cluster) | 4–6 | Dim chains are the chromaticism D88 rejects (u11) |
| Andalusian / Spanish / western | ~7 | Outside the hijaz definition (u1) |
| desert by title only, no b2 | ~16 | Would poison the pool (u9) |

**Exemplars — clean extraction, content and title agree** (mine these
first, u45):

| File | conf/ev | Note from the data |
|---|---|---|
| `snes__Seiken_Densetsu_2_-_Secret_of_the_Arid_Sands.mid` | 0.70 / med | Archetypal RPG desert theme; 6/8 lilt, no loops from 468 notes |
| `snes__bldesert.mid` | 0.70 / high | Clean minor vamp, loop coverage **0.98** |
| `genesis__SAND.mid` | 0.70 / high | Sunny modal groove |
| `n64__Desert_GS.mid` | 0.70 / high | Tritone-tinged minor vamp (dup: `Desert_XG_V127`) |
| `gameboy__WarioLand3DesertRuins.mid` | 0.60 / high | Sparse b6 color, slow |
| `snes__SOMDesert.mid` / `-SC8850` | 0.70 / med | Wistful 3/4; keyMargin 0.018 |
| `nes__smb3desert.mid` | 0.70 / med | bII7 chord in the loop |

**Exemplars — genuine hijaz candidates, all need an ear** (u3):

| File | conf/ev | Signature |
|---|---|---|
| `bltower.mid` | 0.40 / high | **I7 → bII^7 vamp** — the clearest Phrygian-dominant signature in the corpus; bpm 221 suspect, game unknown |
| `genesis__MW4-Entrance2.mid` | 0.60 / high | Monster World 4 (Arabian-set game); 3/4, pc1 is 2nd-heaviest |
| `genesis__MW4-Pyramid.mid` | 0.75 / low | **Heaviest b2 melody measured** (pc1 = 196); blocked only by a 7/8 meter |
| `gba__BT_-_Desert.mid` | 0.60 / high | Raised 3rd + raised 7th — harmonic-minor color |
| `gba__ohooasis.mid` | 0.65 / high | Heavy b2 phrygian, single track |
| `T_AlteredBeast_Ruins.mid` | 0.40 / high | sus-tonic → bII^7 vamp |
| `mag_town.mid` | 0.50 / high | 6/8, heavy pc1 with b3/b6/b7 — but the title says town |
| `SKJ-50a.mid` | 0.35 / high | Re-rooting the histogram at Eb yields clean phrygian; unknown game (u39) |
| `dhgbbgma.mid` | — / high | bIII → bII^7 vamp; unknown game (u39) |
| `Sggb3.mid` | 0.40 / med | pc1 = 204, the strongest single b2 count; 3/4; likely Super Ghouls'n Ghosts (u3, u2) |
| `homestuck-vol-5__Sunslammer - cookiefonster.mid` | — | Loop is `0:m 1:^7` ×4 — the engine's own bII signature — but keyMargin 0.002 |

**The Sandopolis cluster** (`SandopolisZoneAct2`, `Sonic_3_-_Sandopolis_Zone_1_V11`,
`sonic_and_knuckles-sandopolis_zone_act1`, `md_sk_sm04`, `sandopolis`,
`Sonic_3_-_Sandopolis_Zone_2`) is six high-value rows, one of them with
loop coverage 0.95, whose entire character is a diminished vamp — the most
consistently-extracting sub-family in the lane and the one D88 most likely
rejects (u11).

### 3.2 jungle — 57 rows (23 high, 18 medium, 16 low)

Top style tags: modal-vamp 14, chiptune 13, dkc-style 11, ostinato 7,
pentatonic 5, ostinato-16ths 5, percussion-forward 3, two-chord-vamp 3,
dorian 2, island-groove 2, sus-color 2. Sources: 35 jungle folder, 22
general vgmusic, 0 hsmusic.

Highest mean lane confidence of any lane (0.59) — DKC-family vamps have a
histogram signature. But **16 of 57 are low engineValue and most of those
died to empty loop extraction** (u22), so the usable pool is 23 rows.

| File | conf/ev | Why it matters |
|---|---|---|
| `n64__dk64_jungle_2.1.mid` | **0.92** / high | Highest lane confidence in the corpus; minor vamp over 207 bars, clean key |
| `n64__smashbroscongo.mid` | 0.90 / high | modal-vamp + percussion-forward + dkc-style — all three lane markers |
| `nes__T_HiryuNoKenII_JungleTheme1.mid` | 0.85 / high | **Loop `2:m7 7:m7`** — literally D94's dorian two-chord jungle shape |
| `n64__dk64junglelobby.mid` | 0.85 / high | Bright tropical, pentatonic + ostinato |
| `n64__wocDK64JMC.mid` | 0.85 / high | 13 tracks, 2384 melody notes — rich but busy |
| `nes__Amagon-Zone_4_Rain_Forest.mid` | 0.80 / high | Two-chord minor oscillation; pc histogram suspiciously uniform (u44) |
| `snes__FlintstonesTTSMJungleByCryogen.mid` | 0.80 / high | m6-color two-chord vamp; bpm 280 is a notation artifact (u17) |
| `snes__Jungle%28V1.1%29.mid` | 0.75 / high | Brooding two-chord minor with a b2 tinge |
| `n64__pm_koopa_tropical.mid` | 0.75 / high | Coverage-**1.0** I-V-IV vamp, density 18.1/bar — but bright-major (u4) |
| `Jurassicpark_lvl1_jannee.mid` | 0.50 / high | Clean m7 vamp loops; the best non-DKC candidate |
| `DKLTemple.mid` | 0.50 / high | High-value loop; temple setting straddles jungle and cave (u30) |
| `nes__CB_Startropics.mid` | 0.60 / high | m7-vamp + sus color, sparse (4 notes/bar) |
| `dkl2screech.mid` | 0.45 / high | DKL2 Screech's Sprint |
| `genesis__AquaticRuin_Jungle.mid` | 0.55 / high | Lush m7-chain; overlaps the water lane |
| `n64__mpyoshi.mid` | 0.60 / high | Playful island — explicitly *not* DKC-dark (u4) |

Lost to extraction failure and worth recovering (u22):
`nes__Swamp-Jungle` (332 notes, 0 loops), `nes__F_jungle` (468),
`nes__T_SnakesRevenge_Jungle` (644), `gameboy__dkljungl` (514),
`snes__bunglejungle` (310), `gba__DKC3-GBA_JungleJitter`,
`nes__Amagon-Zone_2_Jungle` (263), `dkc_dkhouse` (1010),
`n64__dk64_lobby_jungle` (181).

**Naming trap:** Homestuck's "Sburban Jungle" and "Another Jungle" use
*jungle* as a breakbeat genre, and Jungle Strike is a helicopter combat
game — five files that filename sorting would wrongly pool (u13). Ironic
inversion: `Another Jungle` is the one that actually extracts a dorian
`2:m7 7:m7` vamp at keyMargin 0.337.

### 3.3 horror_catacombs — 54 rows (24 high, 14 med, 16 low)

Top tags: ostinato-16ths 11, ostinato 9, gothic 5, castlevania 3, rock 3,
waltz 3, diminished-ostinato 2, action-horror 2, phrygian 2. 32 of 54 are
high-energy — this is D93's action lane and the corpus agrees.

**The lane is essentially the Castlevania corpus.** At least 20 rows are
Castlevania rips or covers across NES/GB/SNES/Genesis/N64/PS1.

| File | conf/ev | Note |
|---|---|---|
| `CVBR_-_Original_Sin.mid` (+ `gameboy__` dup) | 0.70 / high | Castlevania action ostinato — the catacombs archetype |
| `snes__CVDX_-_Beginning.mid` | 0.70 / high | Driving gothic 16ths |
| `gba__CVAoS-HeartofFire.mid` | 0.70 / high | Driving gothic 16ths |
| `genesis__Ryan_Bury_-_..._Bloody_Tears.mid` (+ SB-128 mix) | 0.70 / high | Bloody Tears; heroic gothic |
| `snes__cxstage1.mid` / `snes__dxstage1.mid` | 0.70 / high | Same stage, two rips |
| `n64__CVLoD-_WatchTower.mid` (+ `WatchTower2`) | 0.60 / high | **m7b5 two-chord vamp, coverage 0.97** — near-consonant ostinato, exactly D93's catacombs recipe |
| `nes__DG_C3_Vampire_Killer.mid` | 0.65 / high | |
| `nes__CV3_-_Pressure_-Remix-.mid` | 0.60 / high | Urgent waltz + ostinato |
| `nes__CV2_-_Monster_Dance_-Remix-.mid` | 0.60 / high | |
| `ps1__sotn-pain_%28children%27s_mix%29.mid` | 0.55 / high | Clean loop, coverage 0.98 |
| `muse-of-net__Robo-Vania.mid` | 0.50 / high | hsmusic; castlevania + **lament-descent** tag — D94's chromatic-descent device |
| `snes__Castlevania4-Cellar%28stage8%29V2.mid` | 0.65 / med | Grim waltz, loop coverage **1.0**; keyMargin 0.032 |
| `gameboy__cvl-st1.mid` | 0.65 / med | b2-heavy; loops empty despite 380 notes |
| `sburbmon-ost__The Broken Clock - Twix Stix.mid` | 0.35 / med | Diminished ostinato (u11) |
| `Dungeon-Master_Scene_of_Pandemonium.mid` | 0.35 / high | Consonant sus/maj7 loop — catacombs vs cave (u15) |

Blocked by timing bugs, all recoverable: `Cvbl-st1` (5/16 meter, 557
notes, 0 loops), `nes__cv1-lv2` and `nes__c3stg5` and `c3d1st` (the bpm-12
NES cluster, u19), `genesis__CVB-_Iron_Blue_Intention` (540 notes, 0
loops), `nes__cv1-6` (693 notes, 0 loops).

### 3.4 horror_manor — 43 rows (24 high, 10 med, 9 low)

Top tags: ostinato 5, ambient 4, sparse 4, waltz 4, chromatic 3,
modal-vamp 3, drone 2, spooky 2, circus 2, chromatic-mediant 2. Energy
skews low/mid (19 low, 21 mid, 3 high) — consistent with D93's ambience
lane.

| File | conf/ev | Note |
|---|---|---|
| `n64__bkmmm.mid` | 0.75 / high | Banjo-Kazooie Mad Monster Mansion |
| `n64__Silent_Madness.mid` | 0.65 / high | **m6 + bII vamp, coverage 0.97** |
| `FridayThe13th_-_MapDark.mid` | 0.60 / high | Semitone sus-chord vamp |
| `gba__clocktower-remix.mid` | 0.60 / high | Survival-horror source, sparse melody |
| `ghoulshall.mid` | 0.60 / high | 60bpm sparse minor — manor or somber? (u31) |
| `T_SplatterHouse3_Hiding.mid` | 0.65 / med | **Root-b2 half-step oscillation** — prime manor tension device (u14) |
| `snes__SMW2CBOX.mid` | 0.50 / high | Eerie music-box waltz, loop reps 5, coverage 0.92 |
| `uninvit4.mid` | 0.70 / med | *Uninvited* — literally a haunted-manor game; bpm 350 bogus (u17) |
| `clocktowerelevator.mid` | 0.70 / med | Clock Tower; 2-pitch-class ostinato, keyMargin 0.003 |
| `shad6rm.mid` | 0.35 / high | Aeolian vamp, coverage **1.0**; likely Shadowgate (u15) |
| `Mansion_Attic.mid` | 0.50 / med | 75bpm, b9/tritone-heavy; game unidentified |
| `the-grubbles__Frondly Warning - IronInvoker47 (piano).mid` | 0.30 / high | Slow sparse half-diminished (hsmusic) |
| `Faxfog.mid` | 0.35 / high | Diminished chain `2:o 7:o 1:o7` (u11) |
| `snes__smw_ghost.mid` | 0.70 / low | SMW Ghost House — archetypal manor material lost to an 8/4 meter and 0 loops from 1024 notes |
| `T_SweetHome_Allies.mid` | 0.40 / low | *Sweet Home*, the horror-mansion RPG; extraction fully degenerate |

Six of the 43 are comic-spooky rather than dreadful (`BEETLEJUICE` +
duplicate, `ewj_heck`, `addams_residence`, `gsmikami2`,
`snes__SMAS-TSDoor`) — the lane-law question (u2).

### 3.5 horror_citadel — 8 rows (3 high, 1 med, 4 low)

The starved lane. Full contents:

| File | conf/ev | Note |
|---|---|---|
| `ps1__sotndra3.mid` | 0.45 / high | SotN Dracula — may be a boss theme, not environment (u12) |
| `snes__Dracula31.mid` | 0.45 / high | 3/4 gothic waltz |
| `homestuck-vol-10__Castle - Unknown.mid` | 0.30 / high | bpm 40; citadel read is title-driven |
| `bof2god.mid` | 0.40 / med | Likely BoF2 church/god theme; only 17 bars, no loops |
| `gba__CVAoS-Chapel.mid` | 0.60 / low | **chorale** tag; no loops, keyMargin 0.008 |
| `homestuck-vol-5__Chorale for War - Unknown.mid` | 0.45 / low | chorale + choir tags; loops empty despite 228 notes |
| `gothic.mid` | 0.40 / low | Title-only read; bpm missing, no loops |
| `CVDX_-_Illusionary_Dance.mid` | 0.40 / low | 6/4 meter, no loops |

Only **2 rows in the entire 1786-row corpus carry a `chorale` tag and 1 a
`choir` tag**, and all three are low engineValue. D93's citadel recipe
(the most tonal horror lane: organ, choir, lament; Bloodborne law) has
essentially no corpus support — see (u5) and (u41).

### 3.6 space — 97 rows (53 high, 18 med, 26 low)

Top tags: chiptune 18, shmup 13, sparse 10, m7-vamp 9, modal-vamp 7,
ostinato 7, chiptune-arp 7, ambient 6, driving 6, dream-theme 5.

**The lane contains two incompatible families** (u24):

*Float* — sparse m7/maj7 vamps, the family that suits sparsity-as-shape:

| File | conf/ev | Note |
|---|---|---|
| `gameboy__Ml2spzn2V1_4.mid` (dup `v1_3`) | 0.90 / high | SML2 Space Zone; clean m7/maj7 loop |
| `n64__SpacePort_Alpha.mid` | 0.85 / high | maj7/6/m7 loop — matches the engine's color law directly |
| `snes__Spaceup.mid` | 0.80 / high | m7→m7 vamp at density **2.7/bar** |
| `ps1__Astroman.mid` | 0.80 / high | Mega Man 8; Eb^7/Bb^7 planing |
| `genesis__ps4space.mid` | 0.80 / high | Phantasy Star 4; alternating 4:m / 2:2 |
| `nes__Dash_Galaxy_-_Intro.mid` | 0.80 / high | Stark alien minor vamp |
| `nes__Journey_To_The_Moon_%287%27%27_Romantic_Space_Remix%29.mid` | 0.80 / high | 168 bars, 14 tracks — a full arrangement |
| `Metroid2Title.mid` | — / low | Pure {0,1} semitone drone in 9/8, no loops — prime texture, degenerate metadata |

*Shmup drive* — 16th ostinatos, high energy:
`snes__Axestg6a` (Axelay, 0.70), `snes__gra3depa` (Gradius III, 0.65, bpm
210 at the flag boundary), `JDC_SSArea1` / `JDC_SSArea4_120` (Solar
Striker), `Gyruss_Disk` (Bach Toccata lineage), `Strfoxbc`,
`StarFox2FB_CharSelMapTrnMode_XG`.

`snes__ff2lunar` (FF4 moon theme) is a **loop-coverage-1.0, keyMargin
0.192 row demoted only by a 5/4 detection** — the single most valuable
meter-salvage target in the corpus (u8).

Nine space rows were assigned from title or folder alone (u25), including
`n64__001124071846.mid`, whose filename is a bare timestamp.

### 3.7 cave — 50 rows (27 high, 12 med, 11 low)

Tags: ostinato 11, modal-vamp 10, dungeon 7, chiptune 5, vamp 4,
phrygian 3, sparse 3, minor-vamp 3.

`YICave.mid` (0.85, Yoshi's Island, near-pentatonic melody),
`ps1__Luncave.mid` (0.75, m6-color 16th ostinato, strong key),
`Rygar_Cave.mid` (0.70), `TinyToonsBHT-Cave2.mid` (0.70, m6/dim color),
`GQ2CAVE.mid` (0.60, Gargoyle's Quest 2),
`LowerNorfairOrchestrated.mid` (0.60, Super Metroid),
`nes__ST-Underworld-%28Remix%29.mid` (0.60, heavy b2/b3 over `5:m 3 1 3`),
`CaD_Cave.mid` (0.55), `x-tunnelscene2.mid` (0.45, coverage 0.95),
`KidIcarus-Underworld.mid` (0.45, bVI-bII bounce),
`sburbmon-ost__Ruins (With Strings) - Twix Stix.mid` (0.45, Undertale
cover, i-bVI), `laval.mid` (0.45, lava i-v vamp), `H-ruins.mid`,
`KI_Fortress.mid`, `Pitfall_-_Volcano.mid`.

cave and horror_manor are near-identical in every measurable field (u15);
so are cave and jungle for temple/ruins material (u30).

### 3.8 water — 23 rows / ice_snow — 21 rows

The two smallest environment lanes after citadel.

**water**: `TK_OpenOcean_Ecco.mid` (0.90, new-age m7 color — the clearest
exemplar), `SuperBonk-WaterLevel_XG.mid` (0.85, i-bIII6 two-chord vamp),
`cbsc_swim.mid` (0.60, clean F/Fm vamp), `nes__startropicswhale.mid`
(0.60, b7→maj7 rock), `A-sea.mid` (0.60, 3/4 sea theme),
`HookWaterfalls.mid` (0.60, orchestral), `squiddles__Ocean Stars -
IronInvoker47 (piano).mid` (0.60, lullaby + arpeggio accompaniment),
`Vm_Tidal_Surge-KM.mid` (0.55). Five of the 23 are contested against
horror or calm (u27), including `DKC_Water-KM` (Aquatic Ambience, whose
famous chromatic planing makes its detected tonic doubtful).

**ice_snow**: `btoads-ice.mid` (0.75, loopable minor vamps),
`molemania_snow.mid` (0.70, jazzy m7/6 loop),
`Light_Crusader_-_Castle_Ice_World.mid` (0.65, waltz),
`Ice_Climber_Main_Theme.mid` (0.60),
`n64__Switch_on_the_snow_blower.mid` and
`n64__The_penguins_have_built_a_statue.mid` (0.60 each, both filed under
*space*), `CB_RBSnow.mid` (0.50, winter waltz),
`homestuck-vol-8__Frostbite - IronInvoker47 (piano).mid` (0.60). Nine of
21 are title-driven; the lane may be a timbral palette rather than a
retrieval pool (u28).

### 3.9 town_shop — 82 rows (49 high)

Tags: jazz 13, chiptune 13, swing 10, waltz 8, lounge 6, jazzy 5, funk 4,
diatonic-pop 4. The most harmonically colorful lane in the corpus and the
best-behaved (only 13 low-value rows).

`PS2-Shop1.mid` (0.90, Phantasy Star II shop),
`skate_or_die_-_shop_%28extend%29.mid` (0.90, funk vamp),
`Dragon_Knight_4_Town_2_Theme.mid` (0.85, town waltz),
`Sk81shop.mid` (0.70, same shop tune, single sparse track — is it a
melody-only rip?), `SoE-_Ivor_Tower.mid` (0.60, i-VI7 with dim7 color),
`nes__StarTropics-miracola.mid` (0.60, sus color + diatonic pop; bpm 250
is double-time), `simcity.mid` (0.55, rich 6/8 jazz),
`sburbmon-ost__Elevatorstuck - Twix Stix.mid` (0.60, lounge),
`Peaceful_Village.mid` (0.60), `SNES_Metal_Max_Returns_Town_3.mid` (0.55),
`RenStimpy_Neighborhood.mid` (0.50, clean I-V and ii7-V-I loops),
`Vegas_Dream_-_Black_Jack.mid` (0.50, dim/maj7 changes),
`nes__StarTropics-shecola.mid` (0.50, dim passing chord),
`PS3-Town.mid` (Phantasy Star III, 6/8, blocked by keyMargin 0.018 — u20),
`mggbcCaddie.mid` (0.50, waltz).

### 3.10 calm_pastoral — 92 / somber_sad — 60 / triumphant — 56

**calm_pastoral** (46 high) leans hsmusic-heavy (40 of 92).
`TLOTR_The_Shire_Xg.mid` (0.80, 3/4 celtic folk), `HMSummer-1.mid` (0.70,
Harvest Moon), `Greengreens.mid` (0.55, Kirby),
`homestuck-vol-2__Explore - Goatmon.mid` (0.50, **7-chord loop ×6,
coverage 0.99** — the richest clean progression in the calm lane),
`homestuck-vol-5__Crystamanthequins` (2 arrangements),
`stlap__Daydreamer - Pascal van den Bos.mid`, `do2_field.mid`,
`sburbmon-ost__Frog Forager - Twix Stix.mid` (bIII-bVI vamp), `paula.mid`
(EarthBound, bpm missing).

**somber_sad** (36 high, 41 low-energy) is the ballad lane.
`one-year-older__Mother (Piano) - i300.mid` (0.70), `luf1dead.mid` (0.70,
Lufia death theme — major-key requiem), `s-collide__Heir of Grief`
(2 versions, 0.60, compound meter + m7 color), `Batman_Ending.mid` (0.60,
GB), `DQ2R_Lonely_Youth.mid` (0.60), `cherubim__Eternity Served Cold`
(2 versions), `homestuck-vol-7__Even in Death`, `Memories.mid`,
`AandCForever_%28Ballad%29_V1-1.mid`, `tomb-of-the-ancestors__wwretched
wwaltz.mid` (title says waltz, meter detected 4/4 — u40).

**triumphant** (31 high) is fanfare-dominated (fanfare 20, march 5,
heroic 5, credits 5). `Zelda3_Epilog_Theme.mid` (0.70, maj7 color),
`Warsongp.mid` (0.60), `mff-finalvictory.mid` (0.60),
`Supermanv1_1.mid` (0.60, I-vi7-V-ii), `dq3credt.mid` (0.55),
`tf2-olymintro.mid` (0.50), `Zelda2ov.mid` (0.45),
`ps1__Justice-LeosTheme...` (0.45, heroic march),
`homestuck-vol-5__Savior of the Waking World` (2 piano arrangements).

### 3.11 factory_industrial — 34 / sky_flight — 34

**factory_industrial**: `STH2_Chemical_Plant-KMv2.mid` (0.85, funk-rock),
`Zenkusa_-_StH_ScrapBrainZone_seq.mid` (0.85, industrial + syncopated),
`Shatterhand_Refinery_Area_B.mid` (0.70), `GBwily3b.mid` (0.60),
`GB_Elecman.mid` (0.55, 16th ostinato),
`coloUrs-and-mayhem-universe-a__Iron Infidel - IronInvoker47 (piano).mid`
(0.50, **coverage-1.0 long loop**, sparse melody), `ewj_junkcity.mid`,
`GB_Robocop_Lvl1.mid`, `32-WilyTheme.mid`, `faceball2000.mid`.

**sky_flight**: `BL_pilotwings_hangglider_v2.mid` (0.90, maj7 wash +
compound meter — the lane's clearest exemplar), `ff3airship.mid` (0.75),
`Track_and_Field_II_-_Hang_Gliding.mid` (0.65, maj7 two-chord float),
`Balloon_Kid_Stage1.mid` (0.60), `TopGun-demo.mid` (0.60),
`Ryan_Bury_-_..._Batman_-_Sky_Over_Gotham_City_-_Part_2.mid` (0.50,
i-bVI-bVII vamp), `Dragon_Ride_%28Ver._X.X%29.mid` (0.50),
`OLfantzoneround1.mid` (0.40, 6/maj7 loop), `Twinbee_-_StageBGM.mid`,
`smkrainbow.mid` (Rainbow Road, bpm 215). Six of the 34 are contested
against battle_fight or town_shop (u29).

### 3.12 battle_fight — 422 rows / other — 574 rows

**battle_fight** is the corpus's workhorse: 226 high-value rows, 348
high-energy. Its dominant style tag is **boss-chaos (85 rows)** — usually
chromatic, fast and loop-less, i.e. the family least likely to yield a
stable progression (u34). Clean high-confidence rows include
`LegendofHeroes2_Battle1_GM.mid`, `rs1_bt2.mid` (Romancing SaGa),
`smt-bossbttl.mid`, `Battle_2.mid`,
`Dragon_Quest_III_-_Big_Battle_XG.mid`, `mk_pit_genEsis.mid`,
`ps1__BossBattle.mid` (2/4 — re-mapped to 4/4 by D92),
`WW_MM1_Wily_Boss_V1_2.mid` (aug/dim planing chain).

**other** (574) is the atlas's biggest open question (u35). Visible
sub-families inside it: chiptune 90, waltz 30, chiptune-arp 29, rock 24,
modal-vamp 16, funk 12, jazz 11, title jingles 10, menu 9. It also
absorbs racing (`Top_Gear_3000_*`, `Lotus_2_track_3_Remix`), sports,
anime openings (`Y_Y_Hakusho_Op_movie`), cartoon tunes
(`Animaniacs_-_Song_Test_8`, `bigbirddance`) and pop covers
(`1beatit.mid`, `biljean.mid` — Moonwalker).

---

## 4. The SMWC tag landscape

`smwc-tags-summary.json` covers the SMW Central music catalog: **9725
entries, 38104 tag instances across 60 folded tags** (220 raw tags before
folding a long typo tail — `athletic` alone has 7 misspellings and
`ghost house` 2).

### 4.1 Tag histogram, top 30

athletic 2001 · calm 1769 · tense 1714 · overworld 1656 · castle 1495 ·
boss 1491 · dark 1451 · final 1430 · cutscene 1296 · night 1225 ·
grassland 1202 · industrial 1149 · cave 1043 · sky 989 · bonus 975 ·
abstract 921 · space 909 · urban 873 · chase 822 · title 812 ·
mountain 772 · town 768 · forest 720 · water 657 · ruins 616 · retro 608 ·
fire 594 · temple 581 · credits 555 · ice 541

### 4.2 Lane supply, per the catalog's own tags

| Engine lane | Catalog tag supply |
|---|---|
| space | **909** (+ sky 989, abstract 921) — by far the deepest |
| jungle | jungle 381, reaching ~988 only by borrowing forest 720 |
| horror | split across ghost house 424 + spooky 434 + mysterious 487 |
| desert | **377 — the scarcest lane in the catalog** |

This mirrors the MIDI corpus exactly: desert and the horror lanes are
supply-constrained in both places, space is over-supplied in both.

### 4.3 Downloaded subset

119 lane-id pairs were downloaded, but only **115 unique ids** — four ids
sit in two lane folders each (7866 desert+jungle, 7494 and 11538
jungle+space, 11147 space+horror). Per-lane: desert 30 (25 tag-matching),
jungle 29 (28), space 30 (26), horror 30 (30).

Top-rated per lane (rating desc, then downloads):
- **desert**: Kirby's Dream Land 3 Sand Canyon 3 · LTTP Dark World ·
  Majora's Mask Stone Tower Temple · SMRPG Moleville Mountain Rail ·
  b3313 Dry Town · Jurassic Park Triceratops Trot · Super Mario Land Ruins
- **jungle**: DKC2 **Stickerbush Symphony** (1856 dl — the D94 jungle
  reference itself) · SMO Steam Gardens · OoT Lost Woods · Sonic CD
  Palmtree Panic (Past) · DKC3 Rockface Rumble · Jurassic Park 2 Dark Jungle
- **space**: Deltarune A CYBER'S WORLD? (2442) · MF DOOM (2346) · MM9
  We're the Robots · VVVVVV Potential For Anything · SMG Gateway Galaxy ·
  MK64 Rainbow Road
- **horror**: Pokémon Dark Cave / Ice Path · DKC2 Krook's March · MM
  Final Hours (No Bells) · Cave Story Halloween 2 · Metroid Zero Mission
  Ridley's Lair · Castlevania Chronicles Tower of Dolls

### 4.4 Documented tag traps

Carried verbatim from the summary's own notes — these are landmines for
any tag-driven retrieval:

1. **The `star` tag (83) means the Starman power-up cue, not outer space.**
   22 say so in the name and only 8 also carry `space`. It is excluded;
   including it dragged two whole-soundtrack rips to the top of space.
2. **Rating cannot rank alone.** 3441 of 9725 entries are unrated (0) and
   3872 are exactly 5.0 (likely single-vote), with no vote-count field.
3. **Kitchen-sink tagging pollutes every lane.** Entries average 3.94 tags
   but 87 carry ≥12 (max 28). Id 25703 "Death Songs" has 17 tags and lands
   in both desert and horror on the merit of neither.
4. **The downloaded corpus was curated by ear/title, not tag query.** 10 of
   119 files carry no lane tag at all — desert holds Rogueport Sewers
   [cave,sewer] and X-Naut Fortress [abstract,athletic,castle,space];
   space holds 3 Galaxy tracks tagged only castle/airship/boss.
5. **Non-song text ships inside the packages** (readme, blist,
   Addmusic_sample groups) and macOS `._` sidecars duplicate real names —
   both inherit a valid catalog id, so filter by filename.

---

## 5. Metadata quality — read before trusting any number above

**1261 of 1786 rows (71%) carry at least one data-quality flag.** Only 525
rows are clean on every axis. Flag counts (rows may carry several):

| Flag | Rows | What it invalidates |
|---|---:|---|
| loop / extraction | **377** | The chord progression — the thing the engine actually wants |
| keyMargin | **302** (279 numeric) | The tonic, and therefore every degree token in the loop |
| meter | **194** | The bar grid, bar-relative onsets, loop boundaries |
| bpm | **182** | Energy read, intro cap, register/piano rules |
| single pitch class | **33** | The entire melody feature set for that row |

### 5.1 Key detection

Of the 279 rows citing a numeric keyMargin, the **median is 0.021 and 276
of 279 sit under 0.05**. Thirteen rows are under 0.005 — an effectively
arbitrary tonic. This matters more than it looks: every extracted loop is
spelled as semitone degrees *relative to the detected tonic*, so a
mis-rooted tonic silently transposes the whole progression. An unverified
low-margin row entering a retrieval pool would inject a wrong progression
and re-roll every unpinned song's hash. Policy is (u7); the actionable
short-list of high-coverage loops blocked only by key is (u20).

Worked example: `PopDitty.mid` has a 0.98-coverage loop that keeps
returning `11:m`, which suggests the real tonic is B, not the detected C —
one ear judgment converts it from unusable to pool-ready.

### 5.2 Loop extraction

Empty `loops` arrays on tracks with 500–3300 melody notes are the corpus's
biggest single defect. Two visible failure modes:

- **Dense arpeggio swamping** — `Bc-lev6.mid` (1602 notes, density 33.4,
  0 loops), `MegaManX2_OverdriveOstrich.mid` (3372 notes, 0 loops),
  `ps1__Luntrans.mid` (2668 notes, density 29, 0 loops).
- **Large-arrangement failure** — `act-7__Overture (Canon Edit)` (821
  notes over 23 orchestral tracks, 0 loops),
  `squiddles__Friendship is Paramount` (1347 notes, 25 tracks),
  `Obelix_04_Countryside_SwissFrontier` (714 notes, 20 tracks),
  `coloUrs-and-mayhem-universe-a__Purple Bard` (20 melody notes across 29
  tracks). See (u38).

Famously-looping tunes returned nothing: `smb2overworld1.mid` (623 notes),
`PKMN_-_ChampionBattle.mid`, `snes__smw_ghost.mid` (1024 notes). If a
progression this well-known cannot be extracted, the extractor is the
problem, not the music (u6).

### 5.3 Meter

Two distinct classes, and they need different fixes:

- **Degenerate parses** — 1/4, 1/8, 1/16 or 2/8 over hundreds of bars
  (~18 rows). `MM4_Drillman` at 1/4 over 229 bars, `MegaManX2` at 1/4 over
  457, `LSSSC_Towards_The_Horizon` and `Scorner` both at 1/16 over ~550.
  These are mis-parsed 4/4 and probably one bug (u18).
- **Genuine odd meters outside D92's 4/4-only rule** — 5/4, 6/4, 7/4,
  7/8, 13/8, 16/16, 2/2, 3/8, 5/8, 5/16, 8/4, 4/8. Several are otherwise
  excellent: `snes__ff2lunar` (coverage 1.0, keyMargin 0.192),
  `homestuck-vol-8__Calamity` (coverage-1.0 loops),
  `homestuck-vol-9__Anbroids V2.0` (2/2 = cut-time 4/4, keyMargin 0.309).
  Whether harmony-only salvage is allowed is (u8).

Extreme outliers: `Upward Movement (Dave Owns) B` at 68/4 over 7 bars, and
`The Thirteenth Hour` at 39/8 — both rubato jazz, which suggests bar
inference degrades specifically on free time (u43).

### 5.4 Tempo

Also two classes: **doubled/quadrupled** (bpm 220–512, ~15+ rows, peaking
at `StarSoldier_PowerUp_arranged` 512 and `3 In The Morning` 456) and
**absent or absurd** (bpm null, or 10–30 with 2–11 bars — including a
six-file bpm-12 NES Castlevania cluster). See (u17) and (u19). Tempo
drives the engine's energy read, the ~16s intro cap, the ≤60bpm intro
drop, and the "energetic songs leave the piano" rule — a track at a false
280 gets pushed out of piano territory on a parsing error.

### 5.5 Melody-track selection

33 rows report a melody collapsed to one or two pitch classes.
`Platoon-Title.mid` puts all 1568 melody notes on pc1; `Solstice-InGame`
— a famously intricate Follin track — reads 97% one pitch class;
`audios/vgmusic/snes/nhl96.mid` is 100% pc4 across 1106 notes. Two Cryogen
rips (`JM2ScarletCarpet`, `JM2Swamp`) show the identical signature,
suggesting a per-submitter pattern. **Every b2/hijaz argument in §3.1
rests on pitch-class histograms, so this defect directly threatens the
desert analysis** (u16). A related worry: `nes__Amagon-Zone_4_Rain_Forest`
reports a *perfectly uniform* histogram (92 notes on each of several
classes), which music does not do by accident (u44).

### 5.6 Classification method

Lane calls carry a confidence field for a reason. Mean lane confidence
across the whole corpus is well under 0.6 in every lane, and the two
largest lanes sit at 0.37 (`other`) and 0.54 (`battle_fight`). Where the
title/folder and the extracted content disagree, the rows record both —
`tomb-of-the-ancestors__wwretched wwaltz` (title says waltz, meter says
4/4), `Phrygia_-_Searching_the_Moon_Ball` (title says Phrygia, melody has
no b2 and a major third), `n64__sm64-snow-jungle` (filename names two
lanes) — and (u40) treats those as the test of which evidence type to
trust corpus-wide.

---

## 6. What to mine next

Ordered by expected engine value per unit of effort.

### Tier 1 — repair the data before mining it

1. **Fix loop extraction** (u6, u38). 377 rows blocked, including several
   named lane exemplars. Two suspected causes: arpeggio tracks swamping
   the chord detector, and melody/harmony track selection failing on
   20-plus-track arrangements. Nothing below is safe until this is
   measured — and per the D85 lesson, "the extractor returned something"
   is not proof; a before/after count of recovered loops is.
2. **Fix the 1/4-over-hundreds-of-bars meter parse** (u18). ~18 rows, one
   likely bug, and it also invalidates bar-relative onsets on those rows.
3. **Apply the tempo sanity pass** (u17, u19). Halve everything over 210
   and audition the bpm-null / bpm-12 clusters — the latter is six
   Castlevania 3 rips, exactly what horror_catacombs is short of.
4. **Audit melody-track selection** (u16). 33 rows, and the desert
   analysis depends on the histograms it produces.
5. **Dedupe** (u21, u42). 49 basename groups, 21 of them with conflicting
   lane calls, plus arranger and rip variants. Do this before any pool is
   built, since pool length drives `fnv % pool.length` retrieval.

### Tier 2 — deep chord-loop analysis for the trope pools

**Desert** is the highest-value target (thinnest lane in both the MIDI
corpus and the SMWC catalog, and D94 pins tropes explicitly via
`opts.desertTrope`, so a verified fourth trope is directly actionable):

- *Uncontested first* (u45): `snes__Seiken_Densetsu_2_-_Secret_of_the_Arid_Sands`,
  `snes__bldesert` (coverage 0.98), `genesis__SAND`, `n64__Desert_GS`,
  `gameboy__WarioLand3DesertRuins`, `nes__smb3desert`, `snes__SOMDesert`.
- *Then the hijaz candidates* (u3), ranked by signature strength:
  `bltower` (I7→bII^7), `genesis__MW4-Pyramid` (heaviest b2, needs the
  7/8 resolved), `genesis__MW4-Entrance2`, `gba__BT_-_Desert` (raised 3rd
  + 7th), `dhgbbgma`, `SKJ-50a`, `T_AlteredBeast_Ruins`, `mag_town`.
- Settle (u1) and (u11) *before* mining, since they decide whether the
  Andalusian block (~7 rows) and the Sandopolis dim cluster (~6 rows) are
  in scope at all. Those two rulings move the desert pool more than any
  individual track does.

**Jungle** — D94's jungle law was researched, not ear-tested, so
ratification matters as much as supply (u46):

- `nes__T_HiryuNoKenII_JungleTheme1` (`2:m7 7:m7` — D94's exact shape),
  `n64__dk64_jungle_2.1` (conf 0.92, 207 bars), `n64__smashbroscongo`,
  `n64__dk64junglelobby`, `nes__Amagon-Zone_4_Rain_Forest` (pending u44).
- Then recover the 12 jungle rows lost to empty loops (u22) — the lane
  currently has only 23 usable rows out of 57.

**Horror**:

- catacombs has real depth (the Castlevania block) but is gated on timing
  fixes: `Cvbl-st1` (5/16), `nes__cv1-6` and `genesis__CVB-_Iron_Blue_Intention`
  (0 loops), the bpm-12 CV3 cluster. `n64__CVLoD-_WatchTower` (m7b5 vamp,
  coverage 0.97) is the cleanest ready-to-use near-consonant ostinato and
  matches D93's catacombs recipe directly.
- manor's best ready material: `n64__Silent_Madness` (m6+bII, coverage
  0.97), `shad6rm` (coverage 1.0), `snes__SMW2CBOX`,
  `T_SplatterHouse3_Hiding` (root-b2 oscillation — a tension *device*, not
  a progression). `snes__smw_ghost` and `T_SweetHome_Allies` are the two
  highest-payoff repairs.
- **citadel cannot be mined** (u5, u41). 8 rows, 3 chorale/choir tags, all
  three low-value. Plan to compose from D93's writing rules rather than
  retrieve.

**Space** — resolve the float/shmup split first (u24), then mine the float
family (`SpacePort_Alpha`, `Ml2spzn2`, `Spaceup`, `Astroman`, `ps4space`).
`snes__ff2lunar` is the single best meter-salvage target in the corpus:
coverage 1.0, keyMargin 0.192, blocked only by a 5/4 reading.

**Color supply for the taste canon** — town_shop is the corpus's richest
diatonic-color lane (jazz 13, swing 10, lounge 6; only 13 low-value rows
of 82) and is the natural source for the m7/^7/9/sus/6 vocabulary D88
calls the norm: `PS2-Shop1`, `SoE-_Ivor_Tower` (i-VI7 + dim7),
`simcity` (6/8 jazz), `RenStimpy_Neighborhood` (ii7-V-I),
`homestuck-vol-2__Explore - Goatmon` (7-chord loop ×6, coverage 0.99).

### Tier 3 — questions that unlock material rather than tracks

- (u2) comedic horror: 12 rows hang on it.
- (u8) odd-meter salvage: a large tranche of otherwise-excellent rows.
- (u4) jungle's tropical-major family: ~9 rows.
- (u12) boss themes in lane folders: 25 rows.
- (u35) what to do with 269 high-value `other` rows.
- (u33) which of the 115 ostinato-tagged rows are *chordal* ostinatos —
  D94's staccato-strings law needs chordal subharmony, and an arpeggio is
  not one. The corpus cannot supply the marcato voice until that
  distinction is drawn.

---

## 7. Where the open questions live

`scratchpad/r15/analysis/uncertainties.json` — 46 merged questions
(15 taste-calls, 14 lane-ambiguity, 9 extraction-failure, 6 other,
2 key-detection), ranked by how much Ethan's answer would change the
engine, merged down from 225 raw per-file items in
`uncertainties-raw.json`.

The five that move the most material, in order: **u1** (is desert
hijaz-only, or does Andalusian/western count), **u2** (is comedic horror
admissible), **u3** (which fourteen b2 candidates are genuinely hijaz),
**u4** (does jungle admit tropical-major), **u5** (does citadel have any
corpus at all).
