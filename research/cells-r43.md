# r43 — the second pattern export, the grid law, and the combination lab

His export on `audition/cells.html` (r42-cells): 21 keeps, 2 cards left unclicked,
14 notes. Then, in his own words:

> create a lab where you create more of these and extract more from our energetic
> MIDI songs to analyze.
>
> next lab, allow me to combine different layers by enabling multiple at a time,
> then press something to leave a note either individually for that song or for
> the group, and i can do this multiple times with an extensive list with a
> diversity of serious ones

## 1. The two notes that were the same bug

> `cl_cell_neighbor` — "I feel like it's not 4/4 - the next chord is always coming
> in like an eight note too soon which should happened. this works"
>
> `cl_riff_motor16` — "should be aligned by measure - the next chord shouldn't come
> in like a half step early"

Both real. Two different defects, one symptom: a bar whose grid the ear cannot find.

### (a) a triplet figure written on a sixteenth grid

Re-measured off `The raising fighting spirit.mid` at ppq 96. The left hand from bar
8 on hits ticks **0, 96, 128, 160, 192, 256, 320, 352** in every bar. A quarter is
96 ticks, so every one of those is an exact multiple of **32** — a TRIPLET eighth.
In twelfths of a bar: `0 3 4 5 6 8 10 11`.

`sr_motor16_dyad` (r40) wrote them as sixteenths `0 4 5 7 8 11 13 15`:

| triplet-8th | source position | r40 wrote | error |
|---|---|---|---|
| 0 | 0/12 | 0/16 | — |
| 3 | 3/12 = 0.250 | 4/16 = 0.250 | — |
| 4 | 4/12 = 0.333 | 5/16 = 0.313 | −1/3 of a 16th |
| 5 | 5/12 = 0.417 | 7/16 = 0.438 | +1/3 |
| 6 | 6/12 = 0.500 | 8/16 = 0.500 | — |
| 8 | 8/12 = 0.667 | 11/16 = 0.688 | +1/3 |
| 10 | 10/12 = 0.833 | 13/16 = 0.813 | −1/3 |
| 11 | 11/12 = 0.917 | 15/16 = 0.938 | +1/3 |

Five of eight onsets are a third of a sixteenth out, and the last one is pushed from
11/12 to **15/16 — hard against the barline, where the source leaves a gap**. That
last onset is his "half step early": it arrives where the next chord is about to.

The pitches were wrong too. r40 wrote `R.5` on all eight; the source strikes
**root + fifth + octave** on the downbeat and the half-bar and **fifth + octave**
elsewhere. `sr_motor16_triplet` is the corrected row. The straight one stays in the
library so the combination lab can A/B them — the correction changes the FEEL from
straight to swung, and that is an ear question, not a bug question.

### (b) half of a two-voice texture

`sr_cell_neighbor` is attack on titan bars 21–28. Re-measured, **all twenty of its
events are exact** — the r42 transcription of the lower voice is right. What is
missing is the other voice.

Bar 21, every note, as 16th slot : midi —

```
0:40,52  1:43,52  2:42,55  3:43,59  4:40,52  5:52  6:55  7:59
8:52     9:40,52  10:43,55 11:42,59 12:43,52 13:45,52 14:55 15:59
```

The upper voice is `52 52 55 59` four times a bar — that is `sr_pedal_cell` itself
(R R b3 5), an octave up. **The file sounds all sixteen sixteenths.** The lower
neighbour figure's holes at slots 5–8 and 14–15 are filled by it.

Alone, the lower voice groups the bar 5 + 4 rest + 5 + 2 rest: its second group
starts a sixteenth after beat 3 and its bar ends two sixteenths early. That is
exactly what he describes, and it is a property of the r42 lab — which swapped the
figure into a slot that plays alone — not of the file.

`sr_cell_neighbor_full` carries both voices. A test now pins that it fills every
slot and that the half-voice's onsets are a subset of it.

### the rule this writes

**A figure that does not tile its own bar names the partner that fills it.**
`partial:` on the incomplete row, `fills:` on the complete one, and a test over
every running (`arp`) ostinato: a rest of a quarter bar or more must be followed by
an onset ON A BEAT, or the row must declare a partner. Scoped to `arp` because
scoping it wider flagged the 3+3+2 tresillo, which is the most legible syncopation
in the literature and not a defect.

Two rows declare `partial` today: `sr_cell_neighbor` and `sr_ost_inner_pedal` (whose
source file has another voice striking the beat 3 it rests over).

## 2. The mine

His "extract more from our energetic MIDI songs to analyze". 52 files — the ten
serious references he chose himself plus the 43-file Vocaloid transcription set
(one skipped: First Step is in 3/4, and the engine is 4/4 only).

Method: count repeated one-bar cells in three register bands (lowest third / middle
/ top third of each file's own pitch distribution), signature = onset slot → the
intervals above the bar's lowest note, so it is transposition-invariant. Kept at
three repeats or more.

**Grid 48** — the lowest common multiple of sixteenths and triplet eighths. This is
the direct consequence of §1(a): a miner that can only see sixteenths is the thing
that caused that bug, and it would have quantized every triplet cell in the corpus
into a lie.

**984 repeated cells.** By grid:

| grid | cells | share |
|---|---|---|
| sixteenths | 782 | 79.5% |
| eighths | 109 | 11.1% |
| **triplet eighths** | **84** | **8.5%** |
| mixed | 9 | 0.9% |

**The library had zero triplet-grid figures.** One in twelve repeated cells in his
own reference material is on a grid this engine could not write.

Of the 251 low-band cells with three or more distinct scale degrees in the line (an
octave double is not a move) — the shape his four bass notes asked for — the rows
taken are listed below.

## 3. What was added (18 rows)

Corrections:

| row | source |
|---|---|
| `sr_motor16_triplet` | Raising Fighting Spirit, bar 8+, triplet eighths `0 3 4 5 6 8 10 11` |
| `sr_cell_neighbor_full` | attack on titan 21–28, both voices, all sixteen sixteenths |

His notes, turned into rows:

| row | his words |
|---|---|
| `sr_cell_step_ct` | "steps work for some of them (like the 2nd and third) but not the first and fourth" — chord tones on 1 and 4, the step between them |
| `sr_cell_oct_leap_b` | "the second one sounds kinda weird ... just the note you chose" — the alternate bar's middle note off s4 (a fourth struck eight times a bar over a minor chord) onto the fifth |
| `sr_bass_pump_rise` | "variations where the third chord is higher instead of just the chord repeating 3 times. like the second repeat it a different" |
| `sr_bass_lament` | "this represents like creative basses - learn from this -> more happy of a vibe though" — the Zoltraak walk with the heroic turn up to the octave removed: R b7 b6 5 |

Mined — the bass with its own melody ("think everything you learned from the walking
bass stuff"):

| row | file | x | the line |
|---|---|---|---|
| `sr_bass_walk4` | Two Breaths Walking | 16 | R 5 b3 b7, one degree a beat, nothing repeated |
| `sr_bass_line_arp` | Mousou Kanshou Daishou Renmei | 16 | R 5 [5 8ve b3] 3 4 8ve [8ve 4] 4 |
| `sr_bass_synco_root5` | Rolling Girl | **45** | root and fifth, NO downbeat — the most repeated low bar in the whole mine |
| `sr_bass_synco_down` | Ghost Rule | 26 | the same with the downbeat struck |

Mined — the triplet grid:

| row | file | x |
|---|---|---|
| `sr_ost_shuffle_run` | Raising Fighting Spirit | 10 | twelve triplet eighths with a contour, not a pulse |
| `sr_riff_tri_dyad` | Mind Brand | 11 | eight of twelve, dyads on the offbeats |

Mined — riffs and stabs:

| row | file | x | note |
|---|---|---|---|
| `sr_riff_run_down` | get_proto-6 | 12 | **his "falling instead of rising", measured** — where r42's `sr_gallop_fall` had to be marked invented |
| `sr_riff_three_two` | Muzan vs Hashiras | 13 | three on the 2nd degree, three on the root, then the bar rests |
| `sr_riff_power` | USSEEWA | 12 | root-fifth-octave on beats 1, 3, 4 — the engine had never written a power chord |
| `sr_stabs_four` | Eh Ah, Sou | 8 | six offbeat four-note stabs (rhythm measured, voicings ours) |
| `sr_ost_inner_pedal` | The Lost One's Weeping | 12 | one degree repeated off the beat, hole on beat 3 |

**What the xN counts mean, checked independently.** Every count is the number of bars
carrying the EXACT onset-and-interval cell, re-counted with a second script that shares
no code with the miner: walk4 16/16, synco_down 26/26, run_down 12/12, inner_pedal
12/12, tri_dyad 11/11, line_arp 16/16 — exact on all six spot-checks. Counting the
RHYTHM alone (ignoring pitch) gives larger numbers on several rows — walk4 35, line_arp
77, tri_dyad 22 — so the figure in each row's source string is the conservative one and
no row claims more than its file plays.

Where the dialect has no safe token for a pitch the source plays — a tritone passing
tone in two rows, a leading tone below the root in one — the row says which note it
substitutes rather than shipping a silent error.

## 4. The vibraphone, six cards later

> "the pitched percussion in the harmony should be replaced with another instrument"
> (x3) · "I dont think it sounds \"serious\" yet, this may be because the vibraphone
> isn't too serious" · "I think the vibraphone or whatever that pitched percussive
> instrument still makes it a bit less serious (the one in the harmony that does the
> chord repeats and stuff, NOT the one that plays the melody)" · and now
> "I dont think the vibraphone conveys tense or fight at all"

**r41 read this as the COMPANION and fixed the wrong layer.** That fix was real —
measured on the current page, gm_vibraphone is gone from the companion on 10 of 11
rows — and the complaint came back anyway.

The layer he describes is the ACCOMPANIMENT HAND. It is the harmony; it does the
chord repeats; it is not the melody; and `gm_epiano1` is a pitched-percussive
keyboard. The r41 replacement was a church organ, which nobody would call a
vibraphone.

Why six cards: on serious.html the e-piano is one of seventeen sounds and 544 of
5007 notes. On the sparse pattern-lab bed it is the **second loudest thing in the
mix**. His ear found it the moment the density dropped.

And it is louder than the tune. Measured against the INSTRUMENTAL TWIN (never the
ducked `_lead` — D145):

| song | before | after |
|---|---|---|
| sr_gate | 1.36x | 0.99x |
| sr_oath | 0.79x | 0.58x |
| sr_duel | 0.80x | 0.58x |
| sr_hunt | 1.36x | 0.99x |
| sr_vanguard | 0.80x | 0.59x |
| sr_resolve | 1.21x | 0.90x |

(Against the ducked lead, which is how the number is usually quoted, it was
1.88–2.05x on all six.) D122 measured this band at 1.15x on the reels page, fixed it
for reel-faithful cards only, and wrote down that the general band "reaches all 47
judged songs and that is a round of its own". This picks it up for six rows.

**SCOPING COST TWO ATTEMPTS AND BOTH FAILURES ARE THE POINT.** Keyed on the lane
(`opts.serious`) it moved nine songs instead of six — the three prose keeps among
them, and all 23 cards of the judged pattern lab. Switched to `pinFrom: 'r43'` on
those rows, it was worse: `pinFrom` flips every bare `!opts.pinFrom` gate, so the pin
MOVED two of the songs it was added to protect, one of them on its harmony
(D123's catch-22, third instance). The shipped scope is one opt, `seriousAcc`, on the
six rows whose notes name this layer. It can reach nothing else by construction.

`sr_loopcat` still runs its electric piano at 1.51x the tune. It is the goofy control
row, its note is "I like it!", and judged material is frozen even when it is wrong.

## 5. A page named its progression and played something else

`basePin` is set from the vocaloid form's VERSE loop and resolved through a lookup
that knows seven progression tables. When the serious pack arrived in r40 its ten
loops were never added to it, so `basePinned` came back **null on every serious row**
and the song fell through to the hash-picked exemplar, then through the variation
pass.

Measured: `audition/serious.html` declares `sr_loop_shuttle_i_bVII` (`i bVII i bVII`)
on sr_gate and plays `VI VII Isus VI VII im VII VII^7 #vim`. The r42 pattern lab
declares the same loop and plays the YNW Melly pop progression. The first build of
the combination lab declared `i bVII i bVII` and played `III^7 bII^7 III^7 bV` — a
bII and a bV, out of key, on a bed meant to be Aeolian.

This is D100's reel finding arriving again on a table added two rounds later: *"the
four reel progressions were silently ignored and the songs built on them came out on
unrelated exemplars — the build looked green and the music was wrong."*

Gated on `opts.loopHarmony`, not fixed in place: making it general would rewrite the
harmony of 11 serious songs and 23 judged lab cards, and a kept song's degrees are
the degrees he judged (D64). The combination lab opts in (plus `rawBase`, because the
variation pass dilutes a transcribed loop — D93/D100). serious.html and cells.html
keep the harmony they were judged on until he says otherwise.

**All nine combination-lab beds now play exactly the loop they name.** A test pins it.

## 6. The combination lab

`audition/mixlab.html`, `MIXLAB=1`.

Nine beds — nine progressions, nine tempos from 88 to 152, one of them serious CALM
because "energetic" is not the only serious. **51 layers per bed**, every one bound
separately over that bed's harmony and sounding all 32 bars, so what he ticks is
exactly what he hears. Groups: 14 cell · 16 bass · 8 riff · 3 stabs · 1 pad · 5 acc ·
3 theme · 1 kit.

Three design constraints, each a consequence of something already learned:

- **the form is flat and every stack entry is `at: -1`.** The entry SCHEDULE is what
  sr_stack_titan and the r42 lab exist to test; running it here would make a ticked
  layer silent for sixteen bars and the checkbox a lie.
- **within a group one voice, across groups different voices.** A cell-for-cell swap
  has to be a pure pattern A/B (D139); a combination has to stay legible, which is
  register and timbre and not rhythm (D102). The `acc` group is the deliberate
  exception — one figure on four voices — because there the variable IS the
  instrument, and that is §4 above put in front of his ear.
- **no HQ renders, and the page says so.** 51 layers is more combinations than can be
  pre-rendered. He listens with HQ on, so the header says this page is for judging
  PATTERNS and COMBINATIONS rather than timbre, and points at the pages that carry
  renders.

Notes: three targets — LAYER, GROUP, COMBINATION — accumulating in a list rather than
overwriting a box ("i can do this multiple times"), and **every note records the exact
selection that was sounding**, because a note about "the bass" names one of sixteen
basses under one of fifty other layers. `import-verdicts.mjs` merges them into
`LAYER_NOTES` / `GROUP_NOTES` / `COMBO_NOTES`, deduplicated on text + selection so a
re-paste cannot double them. Nothing in the generator reads those bags: they are
design evidence for the next round, and a bag the engine reads is a bag that can
re-roll a judged song (D95).

## 7. The strings, and the violin (his two follow-ups)

> "can you allow HQ on for all of them because otherwise the strings dont sound good"
> · "along with cello there should also be a repeat on violin like an octave up or
> something because its all strings."

**HQ is unreachable for this page by construction** — 64 togglable layers is 2^64
mixes. The alternatives were per-layer stems played as synchronised `<audio>` elements
(reaches arbitrary combinations, but ~300 MB, hours of rendering and an unmeasurable
start-skew/drift risk) or moving the BROWSER tier onto the renderer's samples. The
second is what shipped.

`kind: 'vsco'` in the sample pack reads a VSCO section folder, takes the loud velocity
layer per note, applies the same de-swell offset sfizz uses (`src/ingest/swell.js`,
extracted this round so the pack builder no longer re-runs the whole SFZ build as an
import side effect), and encodes it into the local data-URI pack.

| voice | notes | range |
|---|---|---|
| `vsco_cello` | 13 | c1–f4 |
| `vsco_violin` | 11 | g2–d5 |
| `vsco_viola` | 13 | c2–d5 |
| `vsco_bass` | 13 | contrabass |

**44 of the lab's 64 layers** — every string layer — now play these. Pack 13.75 →
14.80 MB. Names are page-scoped (`vsco_*`, `envOnly: []`, `parts: []`) because the
local pack is loaded by every audition page: naming them `gm_cello` would have
re-timbred every judged song in the project. All six judged pages byte-compared at 0
afterwards, and they carry HQ entries pointing at the same patch so the tiers cannot
drift.

**The violin double**: thirteen entries, one per cell, its own group, octave 3 against
the cell's 2, gain 0.34 against 0.5. Verified by REALIZED interval (D139), not by the
octave parameter — every note of all thirteen is exactly +12, 512/512 on the full
cells, median midi 54 against a lead of 66. Each is its own checkbox: a doubling that
cannot be switched off is not something an ear can rule on.

## 8. The damper pedal and the dynamics (his third follow-up)

> "i feel like there's a damper petal or something because all of them have a lot of
> reverb and duration. moreover, control dynamics - they're all pretty med-soft
> dynamics and as i combine them it balances so i can actually hear the combinations"

| | before | after |
|---|---|---|
| layers with no note-length limit | **43 of 64** | 0 |
| room on a figure layer | 0.20–0.25 | 0.08 (tune 0.12) |
| ring vs note length (16th @140) | 3.0 s vs 0.107 s = **28x** | clipped to the written note |
| cello realized gain | 0.190–0.208 (**1.09x**) | 0.198–0.296 (**1.49x**) |
| violin | 0.190–0.208 | 0.134–0.200 (1.49x) |
| bass | — | 0.264–0.360 (1.36x) |
| ceiling | 0.208 | 0.296 within the same declared band top |

**The first pass was not enough.** With every layer clipped and the room at 0.08 he
still heard it, and his wording gave the mechanism: *"when i hit stop it reverberates
for like a few more secs before stopping"* — a reverb SEND outlives `hush`, because
stopping the pattern stops the sources and not the convolution tail. Second pass:
samples cut from 3.0 s to **1.0 s** (1.4 viola, 1.6 bass) with a 0.25 s fade, **no
`.room()` anywhere on the page**, and an explicit `.release(0.05)`. Both are also
exposed as buttons (reverb: dry / a little / more; note length: shorter / as built /
longer) — a fix made without a browser to hear it in should cost a click to correct,
not a round.

The ring-out was made worse by §7 in the same round: the GM soundfont decays quickly,
the VSCO sustains do not, so adding the better samples turned a missing `clip` from a
survivable imprecision into a smear of ~45 simultaneous copies of the cell. **A sample
swap is also an articulation change.**

The accent compression is arithmetic: `bindFigure` maps an accent into its band as
`lo + a*(hi-lo)`, the rows write `a` from 0.55 to 1.0, and the band was `[0.78g, g]` —
so the realized ratio was `(0.78 + 0.22) / (0.78 + 0.55*0.22)` = **1.14**. The band is
now `[0.1g, g]`, giving 1.68 by construction and 1.36–1.49 measured. The band moved
DOWNWARD only; the ceiling is unchanged, so nothing about D77 moves.

Balance: `sqrt(7/n)` clamped to [0.4, 2.0] against the suggested stack — 3 layers
×1.53, 7 ×1.0, 30 ×0.48, 64 ×0.4 — applied as `.mul(gain())` so the per-note accents
above survive it, with a switch to hear the raw levels.

---

## Second pass (2026-09-14) — the wet was the ARTICULATION and the TIER, measured

His question did the diagnosis: *"is it just HQ? like it wasn't like this before. however
with HQ off it sounds bad. it's still the same amount of wet."* Yes, and by two mechanisms,
neither of them reverb.

### The sustain banks have no decay

**The first version of this section was measured on silent files** — `enc()` faded on the
source timeline while `-ss` seeked the output, so 20 of 88 notes in the pack, including all
eleven of `vsco_violin`, encoded to digital silence. Fixed; 0 of 88 silent. Corrected
below, using a statistic that does not depend on file length: **median dB below each note's
own peak, 0.5 s after it**.

| | cello | viola | violin | bass |
|---|---|---|---|---|
| sustain | −4.8 | −4.7 | −8.5 | −2.7 |
| spiccato | −26.1 | −40.0 | −50.5 | −16.9 |

The sustains do not decay; the cello is *louder* at +0.5 s than at +0.25 s. Cause, measured
on the source: `Cello Section/susvib/susvib_C3_v1_1.wav` is 9.24 s long and **peaks at
5.25 s**, holding full level for eight seconds. The D138 de-swell seeks past the swell, so
a 1.0 s trim is a slice of a plateau. There is no decay in it to keep.

Checked where a struck sample is least convincing — the bottom of each range — spiccato is
still quieter than its sustain twin at +0.5 s on every low note: cello c1 −18.7 vs −4.5,
b1 −23.2 vs −1.9, bass a#0 −23.6 vs −2.3 (range 0.2 to 35 dB, median ~14).

Struck articulations, same C3, same method: `spic` peaks at 0.10 s, −20 dB by 0.35 s,
−40 dB by 0.70 s. `pizzT` peaks at 0.05 s, −20 dB by 0.55 s. VSCO ships both for all four
sections; they had never been built.

### The HQ tier holds every note for 0.7 s after it ends

`vendor/sfz/gen/strings-sections.sfz` declares `ampeg_release=0.7`, and every string voice
on both labs mapped to it. A sixteenth at 140 bpm is 0.107 s, so a note sounds 0.807 s with
a new one every 0.107: **about 8 notes of one layer at once**, before a second layer exists.
`render-hq.mjs` then adds convolution from the mean of the stem's own `.room()` haps
(≥ 0.15, wet = room × 1.1) — 0.2–0.4 on the cells page.

### The browser tier was never the wet one

Read out of `@strudel/web@1.1.0`, the bundle the page actually loads: the sampler computes
`ee = begin + value.duration`, calls `R.stop(ee + release + 0.01)`, and `superdough()`
assigns `value.duration = hap.duration / cps` where the hap duration already has `clip`
multiplied in. So `clip` bounds a browser note and always did. "With HQ off it sounds bad"
is the thin GM soundfont, not a wash — his sentence separated the tiers correctly.

### The A/B, on rendered audio

`cl_cell_orig`, same card, rendered from the pre-fix page and from the fixed one; RMS
envelope at 5 ms over the 8-bar intro, where the tested cell plays ALONE:

| | peak → median | peak → 10th pct | **gap depth** |
|---|---|---|---|
| before | −4.0 dB | −7.8 dB | **−3.7 dB** |
| after | −7.7 dB | −18.3 dB | **−10.6 dB** |

Gap depth is the measure that matters: how far the signal falls BETWEEN onsets. −3.7 dB is
a continuous wash; −10.6 dB is a layer that clears. **Use it to verify any "it's too wet"
fix** — it distinguishes a non-decaying layer from a reverberant one, which a spectrum or a
LUFS number does not.
