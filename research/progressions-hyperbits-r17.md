# r17 — 18 canon-ready progressions from the Hyperbits pack

Mined from `~/Downloads/Hyperbits - 350 Famous MIDI Chord Progressions` (350 parsed).
Every entry below: parses under `parseDegrees`, `playableWith` true on all five
VOICINGS shapes, and verified ABSENT from the 555-entry library (no exact quality
cycle and no exact root cycle). NOT yet added to the engine — see the blast-radius
section, which is the reason why.

## 4. Deliverable — 18 hand-authorable entries, all verified absent

Every one: parses under `parseDegrees`, `playableWith` **true on all five `VOICINGS` shapes**, **no exact quality-cycle and no exact root-cycle** anywhere in the 555 entries. `d=` is the minimum cyclic root distance to the nearest same-length library entry; `agr` is label/notes root agreement. Source files listed verbatim.

**minor**

| degrees | d | agr | source | why distinct / vibe |
|---|---|---|---|---|
| `5:m7 7:7b9 8:^7 10:7 0:m` | 2 | 100% | *Calvin Harris - Thinking About You [Cm]* | iv7→**V7b9**→bVI^7→**bVII7**→i. `7b9` appears **1× in 2856 library chords**; two dominants in one minor loop. tense/scary · citadel, catacombs |
| `0:m7 7:m9 8:^7 10 7:7sus` | 1 | 88% | *Headhunterz - Oxygen [Cm]* | **minor v with a 9th** (no leading tone) + a `7sus` pre-tonic; `7sus` is 4× in the library, notes confirm Gm9/Bb slash bass. somber/calm · space, lab |
| `0:m7 7:m7 8 3 5:m` | 2 | 100% | *Flume - Say It [D#m]* | minor v again, and the bVI arrives **thirdless** (B–C#–F#). mysterious · cave, jungle |
| `8:^7 3:^7 0:m 3` | 1 | 80% | *Fred again.. - Marea (We'­ve Lost Dancing) [Fm]* | two **planed maj7s** (bVI^7→bIII^7) landing on a plain minor tonic; the filename's "VI7/III7" is wrong, the notes are Db^7/Ab^7. somber · aftermath, manor |
| `0:m 10:6 5:sus` | 1 | 100% | *Anyma - Black Dress Remix [Cm]* | three chords over 4 bars; **bVII as a 6 chord**, iv as a bare sus4 (F–Bb–C). tense/mysterious · stealth, catacombs |
| `8:^7 10 0:m 7:7` | 1 | 100% | *The Chainsmokers - Habits [Dm]* | the entire loop is thirdless except the ^7; a **major-third v7** against an aeolian bVI/bVII. scary · manor |
| `8 0:m7 10 5:m 10:6 5:7` | 3 | 75% | *RUFUS DU SOL - Like An Animal [Am]* | six chords, and the last is a **Dorian IV7** (major IV with b7) after a minor iv — mode mixture inside one loop. mysterious · jungle, cave |
| `0:m 8:^7 5:9sus 0:m 3` | 1 | 100% | *Calvin Harris - How Deep Is Your Love [Em]* | **`9sus` occurs 0× in the library.** Notes: bVI^7 with no third, iv9sus with no third and no fifth. calm/nostalgic · water, rest |

**major**

| degrees | d | agr | source | why distinct / vibe |
|---|---|---|---|---|
| `9 0:^7 5:^7 4` | 1 | 100% | *Deadmau5 & Kaskade - I Remember [D]* | **VI and III both MAJOR** in a major key — two quality-mixture mediants, six-note voicings incl. D^9. nostalgic/triumphant · snow, citadel |
| `5 4:m7 7 4:m7 9:m7 2:m9` | 2 | 86% | *Porter Robinson & Madeon - Shelter [C]* | **iii7 as the recurring pivot**, no tonic anywhere, wraps from ii9 back to IV. happy/nostalgic · festival, shop |
| `9:m 7 0 2:m7 9:m 7 2:m7` | **4** | 100% | *Calvin Harris - My Way [G]* | 7 chords, ends on **ii7 not V** — the largest distance from anything in the library. Notes carry Em/B and G/D first inversions. excited · training, fight |
| `9:7 7 0 2:7sus 5:^7 4:m` | 2 | 88% | *Zedd - Stay The Night [D#]* | **two secondary dominants** (VI7 of ii, II7sus of V) and a landing on iii. triumphant/excited · boss, festival |
| `0 2:m 4:m 9:m 0 2` | 3 | 100% | *Afrojack - Keep Our Love Alive [G#]* | **stepwise planing I-ii-iii** (played as power chords) with a **major II** cadence. goofy/happy · kitchen, casino |
| `0 2:7sus 4:m7 9:13sus` | 1 | 100% | *Hardwell & Dyro - Never Say Goodbye [A]* | **`13sus` is 7× in the library, `7sus` 4×** — a whole loop built on suspensions that never resolve. calm · menu, rest |
| `9:m7 0:^7 4:m7 2:7sus` | 1 | 100% | *Myon & Shane 54 - Wings Remix [A]* | four sevenths, zero triads; ends on **II7sus** (a suspended secondary dominant). calm/romantic · shrine, water |

**modal**

| degrees | d | agr | source | why distinct / vibe |
|---|---|---|---|---|
| `5:m9 8 1b:^7 6` | 2 | 83% | *Kaskade & Deadmau5 - Move For Me [Cm]* | **bII^7 planing into a bV** — a Neapolitan maj7 next to the tritone; the desert lane already pins bII maj7 shuttles (r16 `mod_desert_shuttle`), this is the same device with a different exit. desert, catacombs |
| `7 3b 10b 0` | 1 | 100% | *Alesso - If I Lose Myself [D]* | **V-bIII-bVII-I with no minor chord at all** — a pure mixolydian/borrowed major loop. happy · jungle, festival |
| `0:m 10b 8b 7:m 10b 0:m` | 2 | 100% | *Armin Van Buuren - Not Giving Up On Love [Em]* | six chords, **minor v** and a bVII passing back — aeolian with no leading tone anywhere. mysterious/somber · cave, space |

### CRITICAL: blast radius, **measured**, not argued

I built a sandbox clone (`scratchpad/hbsim`, repo untouched) and confirmed it reproduces `audition/songs.html` byte-for-byte on all 43 songs (the only differing field is `hq`, an artefact of the sandbox having no wavs). Then I added all 18 as a `progressions-hyperbits.js` pack and re-ran `audition-songs.mjs`:

| scenario | songs moved | frozen songs moved |
|---|---|---|
| **A.** 18 added `ratified:false`, `harmony-model.js` NOT regenerated | **0 / 43** | 0 |
| **B.** same 18, `harmony-model.js` regenerated (what `npm test` forces) | **10 / 43** | **5** — `vs_x_construction`, `vs_tense_fight`, `vs_sad_shop` (keeps, `ops`/`numerals` lineage), plus **`vs_tense_lab` degrees `0:m7 10:6 5:m7 7:sus` → `0:m7 10:6 5:sus 7:m7`** and `vs_goofy_casino` `treat` flip |
| **C/D.** 18 added but withheld from the counted model (via the existing `coverage` evidence gate, or an explicit `modelExclude` flag added to `evidenceGate`) | **0 / 43** | 0 |
| **E.** **one** entry ratified (clicked keep) | **10 / 43** | **2** — `vs_tense_lab`, `vs_calm_space` |
| **F.** all 18 ratified | **22 / 43** | **3** — `vs_tense_lab`, `vs_goofy_casino`, `vs_calm_space` |

Three findings that matter:

1. **`ALL_PROGRESSIONS` is not a free-add surface even for unratified entries**, contra the "unclicked additions are safe" shorthand. `test/harmony-gen.test.js:26` runs `build-harmony-model.mjs --check`, and `scripts/build-harmony-model.mjs:62` counts **every** entry regardless of `ratified`. Adding 18 grows the model from 549→567 entries and 2823→2921 transitions, which re-ranks the variation ops — the exact D95 mechanism, and it lands on judged material.
2. **The safe route inside the library exists and costs one line.** Withholding the new pack from the count (option C/D) leaves the model diff at exactly `excluded: 6` → `24` and every other number identical; 43/43 songs byte-identical. `npm test` in the sandbox adds exactly **2** new failures over the environmental baseline of 22, both hand-pin counters: `test/harmony-gen.test.js:251` (`built.excluded === 6`) and `test/unison.test.js:179` (the `ALL_PROGRESSIONS.length` formula, needs `+ findProgressions({pack:'hyperbits'}).length`). `scripts/build-atlas.mjs` must also be re-run (`test/atlas.test.js:33` requires a record per entry) — the atlas is not on the song path (`grep -rln atlas.js src scripts` → only `undertale-context.js`, `audition-undertale.mjs`, `build-atlas.mjs`, `build-atlas`'s test), and regenerating it moved nothing.
3. **The retrieval pools are tiny, so ratification is the real hazard.** `famPool = EX.entries.filter(clicked && family)` (`audition-songs.mjs:280`) measures **major 17 / minor 18 / modal 40**, halved by the colorness rank to **9 / 9 / 20**, and `loop4` narrows to **2 / 5 / 13**. One click on a minor entry takes 18→19 and re-rolls `fnv % pool.length` for every unpinned song — measured, that is **10 songs**. Worse, **the three prose-keep `grammarPin` songs are NOT protected**: `grammarPin` gates melody grammar but does not set `priorKeep`, so `famPool` re-rolls their exemplar. The 14 clicked keeps stayed byte-identical in every scenario (D64/D65 pinning works); `vs_tense_lab`, `vs_goofy_casino`, `vs_calm_space` did not.

**Recommendation, in the r16 precedent's shape.** Do not put these in a retrieval pool this round. Ship them the way `DESERT_TROPES` / `JUNGLE_TROPES` ship (`audition-songs.mjs:340-397`): inline `{ name, entry: { degrees, numerals: null, family, lineage } }` tables assigned by `opts.<trope>` or a lane hash, `famPool = [[name, entry]]`. That path never touches `ALL_PROGRESSIONS`, never re-counts `harmony-model.js`, never enters `fnv % pool.length` for any other song, and needs no test re-pin — measured blast radius **0**. Its cost is real and should be stated: those entries get no atlas record, no `findProgressions` retrieval, no vote in the counted prior, and reach a song only by an explicit pin. If you want them in the library proper instead, use option D (`modelExclude`), re-pin the two counters, re-run `build-atlas.mjs`, and **before ratifying any of them, pin `base` on `vs_tense_lab`, `vs_goofy_casino` and `vs_calm_space` in `SONG_OPTS`** — or gate `famPool` on `grammarPin` the way it is gated on `priorKeep`.

## 5. Provenance and licensing

The pack is **not in the repo** — the only mention anywhere is `research/reels-feedback-r17.md:76`, which points at the Downloads path. `git ls-files audios` confirms the Unison `.mid` files *are* tracked (the `.gitignore` header says so explicitly: they must be re-importable), while `audios/vgmusic/`, `audios/hsmusic/`, `audios/smwcentral/`, `audios/piano-refs/` and every `.wav` are ignored.

It is a **Hyperbits (hyperbits.com) commercial/lead-magnet MIDI pack**, and unlike the Unison packs its contents are **transcriptions of named copyrighted recordings** — every filename carries an artist and a title. Two separable questions: the pack's own EULA (these packs are typically royalty-free for making music, **not** for redistribution of the MIDI), and the underlying songs (a chord progression is not itself copyrightable, which is the basis on which the pack is sold, but a committed MIDI transcription of *Faded* is a redistribution).

