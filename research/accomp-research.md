# Foundational Accompaniment Canon — CANDIDATE pool (pack `fnd_`)

**Status: every entry below is a CANDIDATE.** Nothing here is a fact about what sounds
good. Per A6.1 and project doctrine, these are historically attested pattern *structures*
encoded into the engine's figuration grammar; they enter the pool `ratified: false`,
`character: null`, `needsEar: true`. The "character" lines below are proposals to help
triage auditions, not verdicts. Only Ethan's ear ratifies.

**Grammar recap** (matches `src/lib/figurations-undertale.js` conventions):
- Tokens are chord-relative: `R` root, `3` chord's third (whatever quality), `5` fifth
  (even diminished), `7` seventh, `9`/`4`/`6` colours, `~<n>` literal n semitones above
  root (non-chord), `+` = octave up, `a.b` = struck together.
- `onsets` are fractions of a bar; `grid` = subdivisions/bar; `octave` per Strudel
  (middle C = octave 4; accompaniment mostly 1–3).
- `fit.meanMidi` here is **computed** assuming a C root at the suggested octave (major
  third for estimates) — unlike corpus entries, where it is a transcription statistic.
  `nonChord` = fraction of onsets using `~n` tokens; `chordness` = fraction of
  multi-note (`a.b`) onsets.
- Accents and microtiming are seed defaults, not transcribed medians — expect the ear
  pass to reshape them.
- Swing/shuffle: encoded as microtiming only where the pattern *is* the shuffle
  (boogie). Stride/Charleston assume render-time swing so they stay reusable straight.

Provenance suggestion for the importer: `provenance: 'canon'` (distinct from
`'transcribed'`), so ear verdicts can be filtered by source later.

---

## Section 1 — 29 candidate figurations

### Classical

#### 1. `fnd_alberti_8ths`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `arp` · octave: 3 · legato: true
- onsets: `['0/1','1/8','1/4','3/8','1/2','5/8','3/4','7/8']`
- figure: `['R','5','3','5','R','5','3','5']`
- accents: `[1, 0.75, 0.85, 0.75, 0.95, 0.75, 0.85, 0.75]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 52 }`
- character (CANDIDATE): polite clockwork underpinning; the default "Classical-era engine idle."
- tags: `classical, mozart, haydn, alberti, gentle, neutral`
- Note: canonical low–high–mid–high cell (C–G–E–G). The single most-documented keyboard accompaniment figure in Western pedagogy.

#### 2. `fnd_alberti_16ths`
- meter_class: `4/4` · grid: 16 · bars: 1 · class: `arp` · octave: 3 · legato: true
- onsets: all 16 sixteenths `['0/1','1/16','1/8','3/16','1/4','5/16','3/8','7/16','1/2','9/16','5/8','11/16','3/4','13/16','7/8','15/16']`
- figure: `['R','5','3','5'] × 4`
- accents: `[1,0.7,0.8,0.7, 0.9,0.7,0.8,0.7, 0.95,0.7,0.8,0.7, 0.9,0.7,0.8,0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 52 }`
- character (CANDIDATE): the 8ths cell doubled in speed — nervous energy, sonatina urgency.
- tags: `classical, alberti, busy, urgent`

#### 3. `fnd_waltz_bass`
- meter_class: `3/4` · grid: 6 · bars: 1 · class: `oompah` · octave: 2 · legato: false
- onsets: `['0/1','1/3','2/3']`
- figure: `['R','3+.5+','3+.5+']`
- accents: `[1, 0.7, 0.65]`
- fit: `{ nonChord: 0, chordness: 0.67, meanMidi: 50 }`
- character (CANDIDATE): downbeat anchor, two light afterbeats — ballroom sway.
- tags: `classical, waltz, chopin, strauss, 3/4, dance`
- Variant: alternate bar-to-bar bass R → 5 (standard practice; the binder or a 2-bar variant can supply it).

#### 4. `fnd_march_oompah`
- meter_class: `2/4` · grid: 4 · bars: 1 · class: `oompah` · octave: 2 · legato: false
- onsets: `['0/1','1/2']`
- figure: `['R','3+.5+']`
- accents: `[1, 0.7]`
- fit: `{ nonChord: 0, chordness: 0.5, meanMidi: 48 }`
- character (CANDIDATE): boots-on-gravel two-step; sturdy, square, parade-ground plain.
- tags: `classical, march, sousa, polka, 2/4`
- Variant: bass alternates R / 5 on alternating bars (near-universal in real marches).

#### 5. `fnd_murky_octaves`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `broken_octave` · octave: 2 · legato: true
- onsets: all 8 eighths
- figure: `['R','R+','R','R+','R','R+','R','R+']`
- accents: `[1,0.7,0.85,0.7,0.9,0.7,0.85,0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 42 }`
- character (CANDIDATE): low rumbling broken octaves ("Murky bass", C.P.E. Bach era → Beethoven Pathétique); storm pressure.
- tags: `classical, murky, beethoven, tension, low, tremolo-adjacent`

#### 6. `fnd_broken_tenths`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `arp` · octave: 2 · legato: true
- onsets: all 8 eighths
- figure: `['R','5','3+','5','R','5','3+','5']`
- accents: `[1,0.7,0.85,0.7,0.9,0.7,0.85,0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 44 }`
- character (CANDIDATE): Alberti stretched to a tenth — warmer, wider, Romantic-parlor glow.
- tags: `romantic, chopin, nocturne, wide, warm`

#### 7. `fnd_block_quarters`
- meter_class: `4/4` · grid: 4 · bars: 1 · class: `block` · octave: 3 · legato: false
- onsets: `['0/1','1/4','1/2','3/4']`
- figure: `['R.3.5','R.3.5','R.3.5','R.3.5']`
- accents: `[1, 0.8, 0.9, 0.8]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 52 }`
- character (CANDIDATE): hymn/chorale pulse — plain, honest, maximum harmonic clarity.
- tags: `classical, hymn, chorale, pop, neutral, foundation`

### Jazz / early pop

#### 8. `fnd_stride_4`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `oompah` · octave: 2 · legato: false
- onsets: `['0/1','1/4','1/2','3/4']`
- figure: `['R','3+.5+.R+','5','3+.5+.R+']`
- accents: `[1, 0.75, 0.9, 0.75]`
- fit: `{ nonChord: 0, chordness: 0.5, meanMidi: 49 }`
- character (CANDIDATE): left-hand leap between low bass and mid chord — vaudeville strut.
- tags: `jazz, stride, ragtime, swing, saloon`
- Note: swing at render time; grid 8 kept so an 8th-level "backbeat kick" variant fits later. Classic stride often uses a tenth (`R.3+`) on beats 1/3 — a density variant.

#### 9. `fnd_boogie_shuffle`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `riff` · octave: 2 · legato: false
- onsets: all 8 eighths
- figure: `['R','3','5','6','~10','6','5','3']`
- accents: `[1,0.75,0.85,0.75, 0.9,0.75,0.85,0.75]`
- microtiming: `['0','4/96','0','4/96','0','4/96','0','4/96']` (triplet-shuffle offbeats)
- fit: `{ nonChord: 0.125, chordness: 0, meanMidi: 42 }`
- character (CANDIDATE): the R–3–5–6–b7 climb-and-fall — barrelhouse locomotion.
- tags: `boogie, blues, rock-n-roll, shuffle, driving`
- Note: `~10` = b7 when the sounding chord carries no seventh; substitute token `7` when the progression is dominant-7-bearing.

#### 10. `fnd_walking_skel`
- meter_class: `4/4` · grid: 4 · bars: 1 · class: `walk` · octave: 2 · legato: true
- onsets: `['0/1','1/4','1/2','3/4']`
- figure: `['R','3','5','3']`
- accents: `[1, 0.85, 0.9, 0.85]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 40 }`
- character (CANDIDATE): four even quarter steps through the chord — unhurried forward walk.
- tags: `jazz, walking-bass, swing, lounge`
- Variant: `['R','3','5','6']` (rising approach into the next root) — the other canonical skeleton; real walking lines add chromatic approach tones (`~1` below next root), which is a binder-level device, not a figuration.

#### 11. `fnd_charleston_comp`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `comp` · octave: 3 · legato: false
- onsets: `['0/1','3/8']`
- figure: `['R.3.5','R.3.5']`
- accents: `[0.9, 1]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 52 }`
- character (CANDIDATE): hit on 1, anticipation on the and-of-2, then air — the oldest syncopated comp cell.
- tags: `jazz, charleston, comping, sparse, syncopated`

### Latin

#### 12. `fnd_habanera`
- meter_class: `2/4` · grid: 8 · bars: 1 · class: `dance_bass` · octave: 2 · legato: false
- onsets: `['0/1','3/8','1/2','3/4']`
- figure: `['R','5','3','5']`
- accents: `[1, 0.7, 0.85, 0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 41 }`
- character (CANDIDATE): dotted-8th + 16th + two 8ths (Carmen's D–A–F–A) — slow hip-swing menace.
- tags: `latin, habanera, tango, bizet, sultry`

#### 13. `fnd_tresillo_bass`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `dance_bass` · octave: 2 · legato: false
- onsets: `['0/1','3/8','3/4']`
- figure: `['R','R','R']`
- accents: `[1, 0.85, 0.8]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 36 }`
- character (CANDIDATE): the 3-3-2 root pulse — the rhythmic DNA under reggaeton, EDM, and half the modern game canon.
- tags: `latin, tresillo, dembow, edm, modern, driving`

#### 14. `fnd_tumbao_bass`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `dance_bass` · octave: 2 · legato: true
- onsets: `['0/1','3/8','3/4']`
- figure: `['R','5','R']`
- accents: `[0.7, 0.9, 1]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 38 }`
- character (CANDIDATE): fifth on the and-of-2, root anticipating beat 4 held across the bar — salsa's floating floor.
- tags: `latin, salsa, tumbao, son, syncopated`
- Note: authentic tumbao omits the downbeat after the first bar and ties the beat-4 root over the barline; encoded with a soft downbeat so it self-starts. A no-downbeat 2-bar variant is the ear-test follow-up.

#### 15. `fnd_bossa_bass`
- meter_class: `4/4` · grid: 16 · bars: 1 · class: `dance_bass` · octave: 2 · legato: true
- onsets: `['0/1','3/8','1/2','7/8']`
- figure: `['R','R','5','5']`
- accents: `[1, 0.7, 0.9, 0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 40 }`
- character (CANDIDATE): dotted root, anticipated fifth — beach-shade sway, all understatement.
- tags: `latin, bossa, jobim, mellow, lounge`

#### 16. `fnd_montuno_skel`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `guajeo` · octave: 3 · legato: true
- onsets: all 8 eighths
- figure: `['R.R+','3','5','R.R+','3','5','R.R+','3']`
- accents: `[1, 0.7, 0.75, 0.95, 0.7, 0.75, 0.95, 0.7]`
- fit: `{ nonChord: 0, chordness: 0.375, meanMidi: 54 }`
- character (CANDIDATE): continuous 8ths with octave-doubled roots landing on the tresillo — a perpetual-motion vamp.
- tags: `latin, montuno, guajeo, salsa, busy, hypnotic`
- Note: structure verified against montuno pedagogy (continuous legato 8th vamp, octaves on R/3/5, tresillo/clave-anchored accents). Real montunos are 2-bar, clave-aligned (2-3 vs 3-2) with next-chord anticipation on the and-of-4; this is the 1-bar core. Sources: [Piano With Jonny – Piano Montunos](https://pianowithjonny.com/piano-lessons/piano-montunos-the-complete-guide/), [The Jazz Piano Site – Afro-Cuban Latin Jazz](https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-genres/afro-cuban-latin-jazz/), [Wikipedia – Montuno](https://en.wikipedia.org/wiki/Montuno), [Wikipedia – Tumbao](https://en.wikipedia.org/wiki/Tumbao).

### Pop / rock

#### 17. `fnd_ballad_8ths_arch`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `arp` · octave: 2 · legato: true
- onsets: all 8 eighths
- figure: `['R','5','R+','3+','5+','3+','R+','5']`
- accents: `[1,0.7,0.8,0.75,0.85,0.7,0.75,0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 47 }`
- character (CANDIDATE): one full arch up and back per bar — the piano-ballad heartbeat.
- tags: `pop, ballad, broken-chord, emotional, flowing`

#### 18. `fnd_arp_16ths_drive`
- meter_class: `4/4` · grid: 16 · bars: 1 · class: `arp` · octave: 3 · legato: true
- onsets: all 16 sixteenths
- figure: `['R','5','R+','3+'] × 4`
- accents: `[1,0.65,0.75,0.7, 0.9,0.65,0.75,0.7, 0.95,0.65,0.75,0.7, 0.9,0.65,0.75,0.7]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 57 }`
- character (CANDIDATE): shimmering 16th climb, restarted every beat — anime-OP / synth-arp propulsion.
- tags: `pop, rock, anime, synth, arpeggio, driving, bright`

#### 19. `fnd_power_fifth_8ths`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `pulse` · octave: 2 · legato: false
- onsets: all 8 eighths
- figure: `['R.5'] × 8`
- accents: `[1,0.8,0.85,0.8, 0.9,0.8,0.85,0.8]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 40 }`
- character (CANDIDATE): open-fifth chug, thirdless and quality-agnostic — rock muscle that fits any chord.
- tags: `rock, power-chord, chug, driving, neutral-quality`

#### 20. `fnd_pedal_root_ostinato`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `pulse` · octave: 2 · legato: false
- onsets: all 8 eighths
- figure: `['R','R','R','R+','R','R','R+','R']`
- accents: `[1,0.75,0.8,0.9, 0.8,0.75,0.9,0.75]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 39 }`
- character (CANDIDATE): root hammer with tresillo-placed octave pops — obstinate, coiled.
- tags: `pop, rock, game, ostinato, pedal, tense`
- Note: as a *pedal*, the binder may optionally hold R fixed across chord changes (true pedal point) — flagging that as a bind-mode question, not a new figuration.

#### 21. `fnd_offbeat_chords`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `offbeat` · octave: 3 · legato: false
- onsets: `['1/8','3/8','5/8','7/8']`
- figure: `['3.5.R+','3.5.R+','3.5.R+','3.5.R+']`
- accents: `[0.85, 0.8, 0.85, 0.8]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 56 }`
- character (CANDIDATE): nothing on the beat, stabs on every offbeat — ska/polka skank, instant cheerful bounce.
- tags: `ska, polka, reggae, game, bouncy, upbeat`
- Note: pairs naturally with `fnd_drive_8th_root` or `fnd_tresillo_bass` in another voice (interlock candidate).

### Folk

#### 22. `fnd_travis_skel`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `fingerpick` · octave: 3 · legato: false
- onsets: `['0/1','1/4','3/8','1/2','5/8','3/4','7/8']`
- figure: `['R.3+','5','R+','R','3+','5','R+']`
- accents: `[1, 0.85, 0.7, 0.9, 0.7, 0.85, 0.7]`
- fit: `{ nonChord: 0, chordness: 0.14, meanMidi: 57 }`
- character (CANDIDATE): alternating thumb (R–5–R–5) with offbeat treble answers — front-porch rolling calm.
- tags: `folk, country, travis, fingerstyle, acoustic, gentle`

#### 23. `fnd_lilt_68`
- meter_class: `6/8` · grid: 6 · bars: 1 · class: `oompah` · octave: 3 · legato: false
- onsets: `['0/1','1/3','1/2','5/6']`
- figure: `['R','3.5','5','3.5']`
- accents: `[1, 0.7, 0.85, 0.7]`
- fit: `{ nonChord: 0, chordness: 0.5, meanMidi: 53 }`
- character (CANDIDATE): bass on each dotted beat, chord on its third pulse — jig/lullaby rocking lilt.
- tags: `folk, celtic, 6/8, lullaby, lilt, rocking`

#### 24. `fnd_drone_fifth`
- meter_class: `4/4` · grid: 4 · bars: 1 · class: `sustain` · octave: 2 · legato: true
- onsets: `['0/1']`
- figure: `['R.5']`
- accents: `[1]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 40 }`
- character (CANDIDATE): one open fifth held the whole bar — bagpipe/hurdy-gurdy drone, ancient stillness.
- tags: `folk, drone, modal, ambient, sparse, minimal`
- Note: also the canonical "exploration/ambient" floor in game scoring; a true drone ignores chord changes (pedal bind-mode question again).

### Gospel / 12/8

#### 25. `fnd_gospel_128_roll`
- meter_class: `12/8` · grid: 12 · bars: 1 · class: `arp` · octave: 2 · legato: true
- onsets: `['0/1','1/12','1/6','1/4','1/3','5/12','1/2','7/12','2/3','3/4','5/6','11/12']`
- figure: `['R','5','R+','R','5','R+','R','5','R+','R','5','R+']`
- accents: `[1,0.7,0.8, 0.9,0.7,0.8, 0.95,0.7,0.8, 0.9,0.7,0.8]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 42 }`
- character (CANDIDATE): triplet R–5–R+ churn on every beat — church-organ left hand, unstoppable roll.
- tags: `gospel, 12/8, blues, soulful, rolling`

#### 26. `fnd_doowop_128_chords`
- meter_class: `12/8` · grid: 12 · bars: 1 · class: `block` · octave: 2 · legato: false
- onsets: same 12 as above
- figure: `['R.5','3+.5+','3+.5+', 'R.5','3+.5+','3+.5+', 'R.5','3+.5+','3+.5+', 'R.5','3+.5+','3+.5+']`
- accents: `[1,0.6,0.6, 0.85,0.6,0.6, 0.9,0.6,0.6, 0.85,0.6,0.6]`
- fit: `{ nonChord: 0, chordness: 1, meanMidi: 49 }`
- character (CANDIDATE): bass-plus-chord triplets, "Earth Angel" style — prom-night slow dance.
- tags: `doo-wop, 50s, ballad, 12/8, nostalgic`

### Game-music staples

#### 27. `fnd_drive_8th_root`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `pulse` · octave: 2 · legato: false
- onsets: all 8 eighths
- figure: `['R'] × 8`
- accents: `[1,0.75,0.85,0.75, 0.9,0.75,0.85,0.75]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 36 }`
- character (CANDIDATE): straight root 8ths — the plainest possible motor; everything else reads against it.
- tags: `game, chiptune, rock, driving, neutral, foundation`

#### 28. `fnd_wide_oompah`
- meter_class: `4/4` · grid: 8 · bars: 1 · class: `oompah` · octave: 1 · legato: false
- onsets: `['0/1','1/4','1/2','3/4']`
- figure: `['R','3+.5+.R+','5','3+.5+.R+']`
- accents: `[1, 0.7, 0.9, 0.7]`
- fit: `{ nonChord: 0, chordness: 0.5, meanMidi: 37 }`
- character (CANDIDATE): oom-pah with the bass dropped to the cellar — circus-boss bounce with real floor under it.
- tags: `game, boss, circus, oompah, wide, playful-menace`
- Note: encoded a full octave below `fnd_stride_4` — the register gap *is* the identity (aligns with the owner's ratified wide-oom-pah taste theme; still a candidate in this pack).

#### 29. `fnd_octave_bounce_16ths`
- meter_class: `4/4` · grid: 16 · bars: 1 · class: `broken_octave` · octave: 2 · legato: false
- onsets: all 16 sixteenths
- figure: `['R','R+'] × 8`
- accents: `[1,0.65,0.8,0.65, 0.9,0.65,0.8,0.65, 0.95,0.65,0.8,0.65, 0.9,0.65,0.8,0.65]`
- fit: `{ nonChord: 0, chordness: 0, meanMidi: 42 }`
- character (CANDIDATE): 16th octave pump — disco/chiptune adrenaline floor.
- tags: `game, disco, chiptune, octave, frantic, driving`
- Note: the 8th-note sibling is `fnd_murky_octaves` (same structure, half density, legato) — a ready-made density pair for the variation system.

---

## Section 2 — Variation devices applied to accompaniment between statements

How real music varies an accompaniment on restatement, ranked by how commonly each
device appears across the traditions above. These map onto the engine's variation
layer; commonality rankings are historical observation, **which devices the owner's
ear will accept is still an open question** — treat each device as a candidate
transform to audition, not a rule.

### Very common (safe defaults; found in nearly every tradition)
1. **Register shift (octave transposition).** Verse low, chorus an octave up (or bass
   dropped an octave for weight). Classical second themes, pop pre-chorus lifts, game
   loop B-sections. Cheapest possible "same but different."
2. **Density change (subdivision doubling/halving).** 8ths → 16ths for intensity,
   16ths → quarters for release; Alberti 8ths ↔ 16ths, murky ↔ octave-bounce are
   literally this. The workhorse of build/breakdown in both Romantic piano and EDM.
3. **Thinning at cadences.** Dropping the pattern to bass-only, a single block chord,
   or silence for the cadential bar; universal in classical (cadential hemiola bars),
   jazz (band cuts for a fill), pop (pre-chorus dropout). Directly serves the owner's
   "no uniform repeats / placed variation" theme — the placement IS the device.
4. **Phrase-end fill.** Last bar of a 4/8-bar unit replaced by a run, turnaround, or
   pickup gesture; stride turnarounds, gospel runs, game-loop drum-fill equivalents.
5. **Articulation flip (legato ↔ detached; sustain pedal on/off).** Same notes, new
   surface; ubiquitous in classical repeats and pop verse/chorus contrast.

### Common (genre-broad, used deliberately)
6. **Re-voicing / spacing change.** Same rhythm, chord tones redistributed — close →
   open position, third omitted, root doubled. The default second-statement move in
   hymn playing, jazz comping, and string writing.
7. **Neighbor- and passing-tone decoration.** Adding `~n` inflections between chord
   tones (Alberti with lower neighbors, walking-bass approach tones, montuno
   chromatic slides). Common everywhere, but *dosage* is genre-specific: heavy in
   jazz/gospel, light in Classical-era accompaniment.
8. **Accent remapping.** Same onsets, accents moved — backbeat emphasis, tresillo
   emphasis inside straight 8ths (see `fnd_montuno_skel`), or the "pah" swelling over
   the "oom". Core to Latin and funk practice.
9. **Rhythmic displacement / anticipation.** Pattern shifted by an 8th, or chord
   changes anticipated on the and-of-4 (bossa, montuno, jazz comping). Common in
   jazz/Latin/pop; **rare in Classical-era** accompaniment, where the barline stays
   sacred.
10. **Half-time / double-time feel swap.** Accompaniment implies twice or half the
    tempo while the melody continues; standard modern pop/game dynamics tool, known
    but rarer historically.
11. **Bass-note substitution (R → 3 or 5 in the bass).** First-inversion restatements,
    waltz alternating basses, gospel 3-in-the-bass walkups. Common, and cheap in this
    grammar (swap the first token).

### Occasional / rare (high salience — spend deliberately)
12. **Contour inversion.** Rising arp restated falling (arp → arp_down). Attested
    (Baroque figuration practice, some Romantic accompaniments) but *rare* as a
    between-statement device — listeners hear it as a new figure, not a variation.
13. **Pedal-point substitution.** Freezing the bass on a pedal tone while harmony
    moves above; classical dominant pedals before recaps, rock/game tension pedals.
    Powerful and section-defining, so used sparingly — one spot per piece.
14. **Tremolo conversion.** Broken figure collapsed into measured tremolo (murky bass
    is halfway there); Romantic/operatic and battle-theme usage — climaxes only.
15. **Hemiola / metric re-grouping.** 3/4 regrouped as 6/8 (or 3+3+2 imposed on 4/4)
    for the cadential approach; classic in waltz/Baroque cadences and Latin practice,
    rare elsewhere — jarring if unplaced.
16. **Ornamental grace notes on the bass (acciaccatura, crush).** Common *within*
    gospel/blues/stride idiom, rare outside it; genre-marker more than variation.
17. **Hand-crossing / registral interleaving.** Accompaniment leaps above the melody
    momentarily; virtuosic classical and stride showpiece device — rare, theatrical.

### Suggested engine mapping (CANDIDATE priorities)
- Tier 1 transforms to implement/audition first: register shift, density double/halve,
  cadential thinning, phrase-end fill slot, articulation flip — the "very common" set,
  and the set most aligned with the ratified placed-variation taste theme.
- Tier 2: re-voicing, accent remap, neighbor-tone dosage knob, bass-note substitution.
- Tier 3 (flag as high-salience, once-per-piece): inversion, pedal freeze, tremolo,
  hemiola.

---

## Sources
Used only to verify montuno/guajeo structure (all other patterns encoded from
standard, uncontroversial pedagogy):
- [Piano With Jonny — Piano Montunos: The Complete Guide](https://pianowithjonny.com/piano-lessons/piano-montunos-the-complete-guide/)
- [The Jazz Piano Site — Afro-Cuban Latin Jazz Explained](https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-genres/afro-cuban-latin-jazz/)
- [Wikipedia — Montuno](https://en.wikipedia.org/wiki/Montuno)
- [Wikipedia — Tumbao](https://en.wikipedia.org/wiki/Tumbao)
