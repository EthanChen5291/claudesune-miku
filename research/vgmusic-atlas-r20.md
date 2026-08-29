# VGMusic full-corpus atlas (r20)

**What this is.** A full sweep of vgmusic.com — all 31,806 catalogued MIDI files —
downloaded, categorised, and measured, to find out what real game music actually
does so the engine can learn the *patterns* rather than have them hardcoded.

**Status of the corpus.** `audios/vgmusic-full/` — gitignored, ANALYSIS-ONLY per
D95. It is **not** `audios/vgmusic/`, which stays pinned to its 400-file D52
manifest. Nothing here has been or may be run through `import-vgmusic.mjs` or
`build-harmony-model.mjs`: that model is *counted*, and growing what it counts
re-rolls the variation ops on judged songs. Only **`manifest.json.gz`** is tracked
(1 MB, gzipped from 10 MB) — it is the reproducibility contract pinning which 31,806
files the corpus is, against a site that can change under us. The `.mid` files,
`features.jsonl` (253 MB), `clusters.json` (16 MB) and `lane-profiles.json` stay
local and regenerate from the pipeline in §6.

Owner permission for download/analysis: Ethan, 2026-08-28. Fetch was rate-limited
(12 req/s, 6 connections, identifying UA, resumable), completed in 44 min with
**zero failures**.

### What this corpus can and cannot settle

**31,652 files can say what game music DOES. They cannot say what Ethan LIKES.**
His ear is the project's only quality signal, and on at least one question here
(the chromatic second line, §3) the corpus-typical behaviour is precisely what he
auditioned and rejected. D95 still governs: promoting anything measured here means
hand-authoring canon entries and re-auditioning them — never letting a statistic
win an argument against a verdict. The risk of a corpus this size is that its
numbers start to feel authoritative enough to skip the ear loop.

Use these numbers to find what the engine has *never done* (an absence is a fact
about the engine, not a preference) and to calibrate ranges. Do not use them to
overturn a rule that was earned by a verdict.

---

## 1. What was collected

| | |
|---|---|
| Files catalogued | 31,806 across 56 systems, 3,943 games |
| Downloaded | 31,799 (0 fetch failures, 900 MB) |
| Analysed OK | **31,652** (154 failed: 143 too few pitched notes, 11 absurd length) |
| Harmony-usable after gating | 28,685 |
| Bass + lead + harmony | 21,670 |

Biggest systems: SNES 6,708 · NES 4,204 · PS1 2,735 · Genesis 2,413 · GB 2,034 ·
N64 1,900 · GBA 1,768 · Master System 1,585.

### Method, and where it is weak

Everything is measured with purpose-built tooling in `scripts/` (`corpus-midi.mjs`,
`corpus-features.mjs`, `corpus-taxonomy.mjs`, `corpus-cluster.mjs`,
`corpus-lanes.mjs`, `corpus-report.mjs`). **None of it is imported by `src/`** — a
bug in it can produce a wrong research number but can never move a song.
`src/ingest/midi.js` was deliberately *not* touched for the same reason.

Measurement definitions deliberately mirror the engine's own probes so the numbers
land as directly comparable targets, not as trivia.

Four things that would otherwise have poisoned the results, found and fixed by
adversarially reading the tool's own output:

1. **Chord labels from monophonic texture are noise.** A single whole-tone line
   labels as an augmented chain. Harmony is now gated on ≥2 distinct sounding
   pitch-classes and ≥0.6 label coverage; 94.4% of files pass.
2. **"Do layer entries land on section starts?" is circular** if a section is
   *defined* as a texture change. Sections are now derived from harmonic novelty
   (pitch content only), and the headline number is measured against the pure
   4/8-bar grid, which is layer-independent and is what the engine's own sections
   are built on.
3. **Duplicate parts are a real technique, not a bug.** 47.6% of files carry a
   doubled pair. Collapsing them changes "how many layers" from 6.93 to 5.79.
4. **The accompaniment is a HAND, not a track.** Game MIDI spells one chord across
   several monophonic tracks, so per-track counting reports "1 note per attack" and
   says nothing. All accompaniment numbers below are measured on the aggregated
   hand — which is how the engine binds its own acc.

A fifth was caught later, by the adversarial verify pass, *after* the first numbers
had been published and sent to other sessions:

5. **A real bug: out-of-key was tested against NATURAL minor only.** In a minor key
   the leading tone of an ordinary major/dominant V therefore counted as
   out-of-key *by construction* — minor-key files containing a major V scored 79.1%
   "violation" against 47.4% for those without, i.e. the metric was detecting the
   presence of a normal dominant. Fixed (minor now admits the raised 7th) and the
   corpus re-extracted. **Control: major-key medians moved 0.100 → 0.100, exactly
   unchanged**, confirming the fix is correctly scoped. Corpus-wide lead
   out-of-key median 0.090 → **0.072**; minor keys 0.081 → **0.052**; horror lanes
   moved most (haunted 0.149 → 0.111, creepy 0.141 → 0.107). Every out-of-key
   number in this document is post-fix.

**Method warning that applies to this whole document.** Any feature computed by
picking ONE member per file understates that feature's prevalence by roughly the
candidate count. `secondLine` picks the part with the *most* co-onsets — which
systematically selects the dense accompaniment hand over a genuine counter-line
(median 4 eligible candidates per file). Measured cost: a same-register companion
was reported at 8.5% by the single-pick method and **43.5%** by scanning all pairs.
Any "the corpus rarely does X" claim sourced from a single pick must be re-checked
against the unfiltered pair array.

**Label accuracy.** Genre labels are inferred from the sequencer's track title.
A 40-file hand check on the first version found ~50% precision — game *names* were
leaking ("Breath of **Fire**"→volcano, "**Jazz** Jackrabbit"→jazz, "**Phantom**
Hourglass"→haunted). After restricting to title+filename and pruning loose terms
(`home`→peaceful, `heart`→romantic, `time`→urgent), a 30-file re-check measured
**~88% precision**. Coverage is 52.2%; the other 47.8% carry no mood/scene word and
are placed by measured sound instead.

---

## 2. The honest limit on genre labels

Files were also clustered by **measured sound** (k-means, k=14, deterministic,
winsorised at the 1st/99th percentile). This is a cross-check: if a title label
scatters evenly across clusters, it is not tracking anything audible.

**Only 21% of files have a label the title and the sound agree on.**

| Lane | Cluster lift | Verdict |
|---|---|---|
| jungle | ×3.78 | measurable |
| snow | ×3.26 | measurable |
| **desert** | **×2.54** | measurable |
| somber | ×2.41 | measurable |
| volcano | ×2.30 | measurable |
| playful | ×2.26 | measurable |
| tense | ×2.17 | measurable |
| space | ×2.00 | marginal |
| creepy | ×1.91 | marginal |
| haunted | ×1.67 | marginal |
| castle | ×1.50 | **not separable by sound** |
| sky | ×1.49 | **not separable by sound** |
| vigilante | ×1.30 | **not separable by sound** |

So "castle music" and "sky music" are not things the corpus can teach — those
titles describe the scene on screen, not the sound. Desert and jungle *are* real
sonic categories. Space and horror sit in between and need his ear.

**Per his ruling**, every lane profile below is built from **confirmed members
only** (title *and* sound agree). Title-only members are excluded and queued for
review in `research/vgmusic-lane-outliers.md`.

---

## 3. Where the engine and real game music disagree

This is the load-bearing table. Engine numbers are from `CLAUDE.md`/`DECISIONS.md`.

| Measure | Engine | Corpus | n |
|---|---|---|---|
| Acc notes within {R, b3, 3, 5} above own bass | **99.3%** | **65.2%** | 21,670 |
| Distinct interval classes ≥1% share | 4 of 12 | **12 of 12** | 21,670 |
| Acc attacks that are a single note | **74.3%** | **43.1%** | 21,670 |
| Acc attacks of 4+ notes | **0.11%** | **17.7%** | 21,670 |
| Non-chord-tone rate | 22.8% | **14.1%** | 27,171 |
| …of those, resolved by step | **6.1%** | **43.6%** | 27,171 |
| Layer entries on an odd bar | **0%** | **51.4%** | 23,359 (127,754 entries) |
| Layer entries on an 8-bar multiple | 100% | **14.2%** | 23,359 |
| Songs with a rhythmically-free second line | 33% (14/43) | **54.5%** (38.9% strict) | 23,486 |
| Mean concurrent pitched voices | 5–7 | **4.16** (max median 5) | 31,652 |

Read together these say something specific: **the engine plays too few pitch
classes, too few notes at once, resolves too little, changes too tidily, and — the
one place it overshoots — runs more voices at once than real game music does.**

*(An earlier draft of this table reported concurrency as 3.77. That figure came
from a 12,268-file partial run, not the full corpus; the correct value is 4.16.
The direction is unchanged — the engine is still above the corpus — but the gap
is smaller than first stated.)*

### The four rules that follow

1. **Colour above the bass is the norm, not an ornament.** A third of all
   accompaniment notes sit on 2, 4, b5, b6, 6, b7 or 7 above the sounding bass.
   The rule is not "add a 9th sometimes" — it is that the interval above the bass
   should be *drawn from the whole scale the chord implies*, with R/3/5 as a
   plurality rather than a monopoly.
2. **The chord is a hand, and the hand strikes together.** 31.4% of accompaniment
   attacks carry 3+ notes and 17.7% carry 4+. His "see how the chord is four
   notes" is a description of ordinary practice, not an exotic ask.
3. **Dissonance must be followed somewhere.** Real game music uses *fewer*
   non-chord tones than the engine and resolves them *seven times more often*.
   That is exactly "bits of dissonance you can't follow" — the fix is not less
   colour, it is that a tone outside the chord must step to one inside it.
4. **Change is not section-locked.** Over half of all layer entries land on an odd
   bar. Only one in seven lands on an 8-bar boundary. The engine's 139-of-139 is
   the single largest structural departure from the corpus in this table.

### Layering: what "more layers" actually means

- 47.6% of files contain at least one doubled pair — **unison 42%, echo 42%,
  octave 16%**. Echo offsets cluster hard at **half a beat (median) and a quarter
  beat**; these are deliberate delay/width layers, not sloppy sequencing.
- Collapsing doublings: **6.93 raw parts → 5.79 independent layers** (mean).
- So "add another layer" is frequently answered in real music by *doubling an
  existing one at an offset*, which costs no new musical material. The engine has
  no such device.
- **This converges independently on a law already in `CLAUDE.md`**: "two layers
  that always strike together on one instrument are one layer", which came from the
  r19 discovery that the descant and counterline were a single string voice. That
  law was found by ear on 43 songs; this is the same trap measured on 31,652. Two
  independent routes to the same conclusion make both more credible — and mean any
  "how many layers" number that skips the collapse is inflated by roughly 20%.
- **90.9% carry a second non-doubling pitched part — but only 23.2% of those move
  freely of the lead.** 76.8% strike *with* the lead on more than half their
  onsets, and 39.6% are chordal blocks rather than lines at all. A genuinely
  rhythmically-free partner is present in **54.5%** of files (67.3% once the
  extractor's dropped never-coinciding pairs are added back; **38.9%** if the
  partner must also be a moving, monophonic non-double line).
  Against the engine's 32.6%, the gap is **6–22 points, not 88.8 vs 32.6**.
  *An earlier draft of this document reported 88.8% "independently-moving"; that
  figure conflated "a second part exists" with "it is independent", and is
  corrected here.*
- **The corpus norm is ONE companion locked to the lead's rhythm, plus — in about
  half of files — one further rhythmically-free line.** It is not a general
  free-counterpoint texture. Nor is it uniform: by platform, Master System 20.3%,
  Game Boy 33.8%, NES 35.2% versus PS1 69.9%, PS2 70.9%, DS 71.4%, SNES 58.2%. On
  2–3-voice chip-era material a free second line is a *minority* behaviour.
- **Chromaticism is NOT bought by rhythmic independence** — out-of-key rate is flat
  across the entire rhythmic-independence range. No rule should grant a companion
  extra chromatic licence in exchange for having its own rhythm.
- **The corpus shows no tendency for a companion to be more chromatic than its
  lead.** On companion-shaped lines (below lead, sparser, monophonic) it is 37.4%
  lead-diatonic→companion-chromatic versus **40.4% the other way round** — symmetric.
  The whole-population asymmetry (34.3%) is a note-count exposure effect: second
  lines carry roughly twice the lead's note count, so a binary "any accidental"
  test flags them more often.
  **This strengthens D100 rather than licensing a loosening of it.** r19 already
  built the permissive version — a chord tone under every note, 16.3% out-of-key —
  and his ear rejected it. What the corpus *does* bound is the SIZE of any excess:
  median 6.1 percentage points, and a line spending more than ~5% of its notes
  out of key is the corpus's upper quartile.

### Melody

- Median **5.57 notes per active bar**, but the lead is **silent 31% of bars**
  (median active-bar ratio 0.69). Rests are structural, not decoration.
- Median held-note share (≥1 beat) is only 0.09 — real game leads are *not*
  especially held, corpus-wide. Held-ness is a **lane** property (somber 0.34,
  peaceful 0.24) rather than a global one.
- **13.7% of files have a polyphonic lead attack.** The engine's lead is 100%
  monophonic, so chordal melody is a genuine absence, but it is a minority device
  — roughly one file in seven, not the norm.
- Median stepwise share 0.60; median leaps beyond an octave **0.00**.

### Rhythm and percussion

- 76.3% of files have a drum channel. Role mix: hat 33.3%, kick 20.6%,
  snare 19.6%, **shaker 8.6%**, ride 3.7%, **hand-drum 3.6%**, tom 3.2%.
- Kick concentrates on 16ths 1 and 9 (22.8%, 14.7%); snare on 5 and 13 (17.3%,
  18.2%); hats spread evenly with a mild accent on 1/5/9/13. Standard backbeat.
- Hand drums appear in **12.1%** of drummed files, shaker-class in **22.6%**,
  wood/metal in **10.1%** — all far more common than the engine's palette assumes.

### Dynamics and form

- **35.4% of files have flat velocity** (stdev < 1) — a sequencer artifact, and a
  caveat every dynamics number inherits.
- CC7 volume 89.1%, CC11 expression only 12.0%, CC1 mod 12.8%, **pitch bend 27.8%**.
- 20.1% carry a tempo change; 13.2% a time-signature change.
- Time signatures: **4/4 86.3%**, 3/4 4.4%, 2/4 2.1%, 6/8 1.0% — the D92
  "4/4 only" ruling matches practice.
- Median tempo 130 bpm. Median section length **8 bars**.
- Only **12.6% are ambient loops** (≤2 harmonic boundaries, ≤3 textures). In those,
  velocity spread drops to 0 and concurrency to 3 — an ambient track holds
  *everything* still, it does not substitute one kind of motion for another.
- **63.5% contain a part-pair alternating ≥50% of active bars; 55% trade ≥75%.**
  Call-and-response is not a special effect, it is the default relationship
  between a lead and its counter-line.

### Harmony vocabulary

- Median **1.48 chord changes per bar**; median 7 distinct roots per track.
- Median colour share (7ths/6ths/9ths/sus) **0.70**; plain triads only **0.19**.
  This strongly confirms the existing taste canon: diatonic colour is the norm and
  plain triad runs are the exception.
- Quality mix: maj 13.6%, min9 10.9%, maj9 10.8%, sus4 8.4%, min7 8.1%, min 7.6%,
  5 7.2%, maj6 6.9%, sus2 5.5%, maj7 5.4%.
- Root motion: **+0 29.4%** (chord repeats), +5 13.1%, +2 10.3%, +7 10.2%,
  +10 8.7%. Nearly a third of all "changes" are the same root re-struck — which is
  where the insertion rule below does its work.
- **50.8% of held-chord bars add a tone the chord does not contain**, at a median
  7.6 onsets per held bar. Under a static harmony the hand keeps *moving*; it does
  not re-strike the shape.

---

## 4. Lane profiles (confirmed members only)

Baseline row is the whole gated corpus (n=29,017). Values are medians unless the
name says otherwise.

| lane | n | bpm | minor | layers | concur | noDrums | handDrum | shaker | colour | thirdless | melDens | melHeld | melActive | melOOK | develop | velSpread | bend |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **baseline** | 29017 | 128 | 54% | 5 | 4.26 | 21% | 13% | 22% | 0.72 | 0.18 | 5.63 | 0.09 | 0.69 | 0.09 | 5 | 2.70 | 30% |
| desert | 155 | 130 | 52% | 6 | 4.14 | **5%** | **34%** | 33% | 0.76 | **0.29** | 5.00 | 0.11 | 0.61 | 0.10 | 6 | 3.38 | 32% |
| jungle | 205 | 126 | 33% | 6 | 4.06 | 9% | **54%** | 39% | 0.74 | 0.17 | 6.38 | 0.04 | **0.42** | 0.11 | 4 | 3.44 | 32% |
| space | 117 | 132 | 50% | **7** | 5.13 | 8% | **9%** | 18% | 0.77 | 0.18 | 5.82 | 0.07 | 0.58 | **0.05** | **7** | **5.38** | **43%** |
| haunted | 128 | 120 | 64% | 5 | 4.06 | **48%** | 15% | 24% | 0.70 | 0.17 | 5.37 | 0.13 | 0.65 | **0.17** | 5 | 2.39 | 29% |
| creepy | 86 | 124 | **77%** | 7 | 4.31 | 17% | 14% | 20% | 0.74 | 0.18 | 5.80 | 0.07 | 0.50 | **0.17** | 7 | **5.10** | 23% |
| menacing | 273 | 133 | 71% | 6 | 4.67 | 18% | 8% | 14% | 0.69 | 0.18 | 5.00 | 0.13 | 0.56 | 0.10 | 8 | 2.93 | 30% |
| somber | 188 | **100** | 61% | 5 | 3.96 | **69%** | 8% | 22% | 0.68 | 0.17 | **3.63** | **0.34** | 0.80 | 0.04 | 6 | 2.98 | 24% |
| peaceful | 125 | 115 | 47% | 5 | 4.00 | **54%** | 4% | 35% | 0.69 | 0.18 | 4.00 | **0.24** | 0.63 | 0.07 | 8 | 3.02 | 24% |
| playful | 105 | 125 | **32%** | 7 | 4.24 | 19% | 32% | 41% | 0.70 | 0.15 | 5.72 | 0.04 | 0.49 | 0.13 | 6 | 4.01 | 38% |
| tense | 133 | 137 | 44% | 7 | 4.50 | **5%** | 24% | 28% | 0.77 | 0.20 | **7.32** | **0.02** | 0.43 | 0.09 | 5 | 3.92 | 41% |
| battle | 1019 | **148** | 67% | 7 | 4.98 | 6% | 5% | 15% | 0.74 | 0.20 | 6.00 | 0.08 | 0.56 | 0.15 | 8 | 3.83 | 32% |
| boss | 878 | **150** | 70% | 5 | 4.26 | 5% | 3% | 12% | 0.75 | 0.21 | 6.85 | 0.04 | 0.81 | 0.16 | 7 | 2.62 | 27% |

### 4.1 What separates SPACE from SOMBER DESERT — his first complaint

This was the question the whole sweep was pointed at. The answer is that **the
current somber-desert song is not failing at "desert", it is succeeding at
"somber"** — and somber's defining trait swamps the lane.

Ranked separators, desert (n=155) vs space (n=117):

| feature | desert | space | direction |
|---|---|---|---|
| **hand drums** | **34%** | **9%** | 3.8× — the single strongest separator |
| **thirdless harmony** | **0.29** | 0.18 | desert is open-fifth/sus, space is tertian |
| **lead voice family** | pipe 17%, guitar 13% | **synth_lead 27%, synth_fx 10%** | acoustic vs synthetic |
| **pitch bend** | 32% | **43%** | space bends |
| **velocity spread** | 3.38 | **5.38** | space swells, desert is steady |
| **layers / development** | 6 / 6 | **7 / 7** | space is bigger and moves more |
| **melody out-of-key** | **0.10** | 0.05 | desert is *more* chromatic |
| **b7 and 7 above bass** | 6.0% / 2.7% | **7.5% / 4.2%** | space leans on the upper extensions |

**The trap, stated plainly:** *no-drums is not a desert trait.* Only **5%** of
confirmed desert tracks have no percussion — desert is one of the most
percussion-forward lanes in the corpus. But **69% of somber tracks have no
percussion**, and somber is the strongest no-drums lane there is. So a "somber
desert" prompt where the emotion strips the floor removes the 34%-hand-drum,
33%-shaker signal that *is* the lane, and what remains — sustained, spread,
few voices — is the space profile almost exactly.

This is independently corroborated by the outlier list: the desert tracks whose
sound least matches the desert centroid are almost entirely **no-drums,
held-melody** tracks. The corpus reproduces his complaint on its own.

The existing D93 rule (`opts.percPresence` resurrects an emotion-zeroed floor,
"even somber desert keeps masmoudi dums") is the right instinct and the corpus
says it should be a **law, not an option**: emotion may thin a lane's percussion
but must never zero it, because the floor is carrying the lane identity.

Two further corpus corrections to the desert lane:
- **Thirdless is a desert signature** (0.29 vs 0.18 baseline, +61%) — the open
  fifth/sus voicing is doing as much lane work as the bII does.
- **Desert leads are acoustic** (pipe/guitar/mallet). The lane's own doctrine
  already says shanai/sitar/oboe; the corpus agrees and adds *guitar*.

### 4.2 Horror

- **Haunted is defined by absence: 48% have no drums** (vs 21% baseline) and
  melody out-of-key is **0.17, +89%** over baseline. Leads are pipe, mallet
  (music-box register) and piano — not strings.
- **Creepy is defined by mode and motion**: 77% minor (highest of any lane),
  velocity spread 5.10 (+89%), lead active only 50% of bars, and drum density
  −37%. Its b3-above-bass share is the highest measured (10.2%).
- **Menacing is the loud one**: 71% minor but drums present, 8 harmonic boundaries
  (most developed of the horror group), lowest colour (0.69).
- Corpus-wide, horror-ish files run dim/aug/dim7/m7b5 at **6.8% vs 5.5%** baseline
  — a real but *small* lift. This directly supports the D93 dosing law: horror is
  **not** made of stacked dissonant chords. Its harmony is barely more dissonant
  than average; what changes is **mode, percussion absence, and melodic
  chromaticism**, not vertical crunch.

So the three horror lanes want three different mechanisms, and the corpus splits
them cleanly: **ambient = take the drums away; action = keep them and go minor;
epic = develop more sections.**

### 4.3 Jungle

- **Hand drums 54% (+326%), wood/metal 22% (+107%), shaker 39% (+78%)** — by far
  the most percussion-defined lane in the corpus.
- **Only 33% minor** (baseline 54%) — jungle is *major-leaning*, which contradicts
  the instinct to write it dark.
- **Melody active in only 42% of bars** — the lead is silent well over half the
  time. Jungle is a groove-and-space lane, not a tune lane.
- Mallet/ethnic pitched parts appear in 41.5% of jungle files vs 26.9% baseline,
  and their register alternation is **0.78 vs 0.64** — measurable support for his
  "high note low note high note low note" ask, as a *lane* property.

### 4.4 Lanes with the strongest single signatures

- **somber**: melHeld 0.34 (+278%), noDrums 69% (+220%), melDensity 3.63 (−36%).
- **tense**: melDensity 7.32 (highest), melHeld 0.02 (lowest), noDrums 5%.
- **boss/battle**: bpm 148–150, melActive 0.81 for boss, out-of-key 0.15–0.16.
- **playful**: only 32% minor, hand drums 32%, shaker 41%.

---

## 5. Open items

- ~635 title-only lane members await his ear
  (`research/vgmusic-lane-verification.md`, shortlist in
  `research/vgmusic-lane-outliers.md`). Lane numbers above use confirmed members
  only and will shift slightly once he rules.
- 47.8% of the corpus carries no title label and is currently placed by measured
  sound alone. Background lookups on the largest unlabelled soundtracks are the
  next step.
- Technique deep-dives (harmony, layering, melody, rhythm, form, counterpoint,
  dynamics, accompaniment) were run as a verified multi-agent pass; findings are
  folded in above and detailed in the companion document.

## 6. Reproducing

```
node scripts/vgmusic-full-index.mjs      # 56 system indexes -> manifest.json
node scripts/vgmusic-full-fetch.mjs      # resumable, rate-limited download
node scripts/corpus-extract.mjs          # -> features.jsonl  (31,652 records, 83s)
node scripts/corpus-cluster.mjs --k 14   # -> clusters.json
node scripts/corpus-lanes.mjs            # -> lane-profiles.json
node scripts/corpus-report.mjs           # the full numeric report
```

Nothing in this pipeline writes to `src/`, and nothing in `src/` reads it.
