# Deep mining, batch 4 (r33) — the per-song facet mindset

His ask, verbatim: "i mean also look deeper into each song. more than just the
specific copies but also the patterns and rhythms and add-ons ... like apply
this mindset to every song and ill verify." Plus the producer directive:
"make it more varied based off what YOU want to verify since you're basically
the producer - ask direct questions ... whether two layers from two different
songs work to prove a theory, whether percussion can be stacked, sound levels,
vibes of the song, mixing different genre layers, anything - up to you."

## The facet taxonomy (what one song yields)

His own walkthrough of one file enumerates seven extractable facet classes,
and they generalize:

1. **Specific figures** — "the left hand piano in the beginning section is a
   valid thing to take" (verbatim transcriptions; what batches 1–3 already did).
2. **Arrangement growth** — "the pattern in how it adds octaves over time
   without adding dissonance with layers, and with instruments" (HOW a song
   thickens, not what it plays).
3. **Chordal-melody patterns** — "the patterns in the melody in the trumpets
   and how there's multiple notes in the trumpet".
4. **Percussion typology + evolution** — "the percussion and how it changes";
   "percussion is different for every song - analyze how it changes, what
   percussion is found in what song types".
5. **Gestures** — "the synth descending quickly that appears" (one-shot
   devices with a placement rule, not loops).
6. **Variation of repeated figures** — "the variation of the piano left hand
   and the variation in the melody" (his safe-variation law's mechanism bank).
7. **The intro measures** — "the beginning measure or two before the actual
   section starts - could analyze that too but it's more complex".

Cross-cutting: **titles are priors** ("the names also give lots of signs — u
can already assume that this song['s] percussion and melody and left hand
speaks to boss fight and 'dance'"). And two encoding widths beyond verbatim:
**genre-scoped patterns** ("patterns that you believe will only be good for
certain genres/energy/song types (stated explicitly upon verification)" — the
new `scope` field, rendered as "claimed scope" on the card so his label
ratifies the claim, not just the sound) and **rhythm templates** ("not
encoding the points but just the rhythm + some info about the notes to fill
it").

## The exemplar, fully read: SM-MiniBoss.mid ("Danger On the Dance Floor")

vgmusic.com Switch page. E minor, 115 BPM, 50 bars = bar-0 intro + a 24-bar
arc played twice + tail. Every facet he named, measured:

- **The LH**: a one-bar E blues-scale walk in straight 8ths — R b3 2 4 5 b5 4
  b3 — played in EXACT UNISON by piano LH, electric bass AND synth bass
  (three instruments, one line, one octave), 32 bars of the song.
  → `cand_b4_ex_lh_blues_walk`.
- **Its variation**: 5 distinct LH bar-forms in the whole song. After 16 walk
  bars the unison moves to a B-pedal OCTAVE GALLOP for 8 bars (two tail
  variants, c4 vs bb2), then a half-bar chromatic climb (b c d eb) re-enters
  the E riff. Register+rhythm change on the dominant, zero re-harmonization.
  → `cand_b4_ex_lh_dominant_gallop`.
- **The growth**: bar 1 riff at one octave → bar 5 strings re-enter the SAME
  riff as exact +1/+2 octave copies (100% of string attack instants are
  internal octaves) → bar 9 melody enters already doubled at +24 (sawtooth
  copies the charang on 85% of its 190 notes). Every growth step adds ZERO
  new pitch classes or lands in an empty register — that is the mechanism of
  "adds octaves without adding dissonance". → `cand_b4_ex_octave_growth`.
- **The brass**: 90 of 90 attacks are chords (4-note major planing in the
  intro; 3-note R-5-R offbeat stabs with chromatic lower-neighbor answers
  post-intro, living only in the lead's rests).
  → `cand_b4_ex_brass_planing_stabs`.
- **The percussion arc** (24 bars, played twice): doubled-kick stomp with
  pushed bar-tail kicks + clap-AND-slap LAYERED as one backbeat hit + tamb
  8ths + a tom run every 4th bar → kick thins to beat-1 half-time under a
  crash with a whistle answer → a snare-roll build bar → stomp returns.
  → `cand_b4_ex_dance_perc_arc` (8-bar compression, scope: boss/dance).
- **The descending synth**: an Eb-AUGMENTED triad (b–g–eb = the 5th, b3 and
  raised 7th of E minor — a built-in rub) falling five octaves in 48th-notes
  at beat 3, once per bar for exactly bars 13–15 and 37–39, on the FX-rain
  patch. → `cand_b4_ex_aug_cascade`.
- **The intro**: ONE unison bar — brass 4-note major chords, piano+strings
  doubling the top line, planing chromatically E–Eb–D–C#–D–C#–C–B on 8ths
  with a dotted push, bass walking in at the and-of-2, drums on stick ticks —
  then the groove locks and an orchestra hit stamps beat 1 (fired exactly
  twice per song: bars 1 and 25, the arc seams).
  → `cand_b4_ex_dance_intro`.
- **The title as prior, confirmed**: "Danger" = the chromatic planing, the b5
  in the walk, the augmented cascade; "Dance Floor" = the doubled four-ish
  kick, clap backbeat, tamb 8ths; "Mini Boss" = both at once.

Seven cards, all carrying his verbatim sentence as `his_prior_words`, several
with direct `question` fields (does the intro become an engine device? should
doubles enter later as a growth step? is drum-layering a standard trick?).

## Lane results (corpus-wide, 4 parallel miners)

**Growth + intros** (3,781 4/4 files; 8 cards). Staged layer entry is the
corpus NORM: 64.8% of files have a voice entering ≥4 bars in, 20.1% a strict
staircase. But of 9,061 late entrants, 77.8% bring NEW material — octave
doubles are only 5.1% (unison doubles 8.0% outnumber them), so the exemplar's
octave-adding is a real device, not the default growth move. The sharper,
engine-actionable law: even INDEPENDENT late entrants add zero new pitch
classes 83.9% of the time — growth is pc-conservative whatever the material.
Entries land on 4-bar seams 49.9% (2x enrichment) but HALF enter mid-phrase.
Honest negative: boss files are NOT enriched for octave-adding (8.0% vs 9.1%
mean; credits 20.5% leads). Intros: 46.6% of files open with 1–3
never-recurring bars — battle 61.4%, menu 33.1%; theme-preview solos 12%,
risers 6.4% (boss-skewed), chord splashes 5.3%.

**Percussion typology + evolution + stacking** (19,733 4/4 drummed files;
9 cards). Density and change-rate do NOT separate song types — the VOICE SET
does: victory runs 0% congas/triangle/agogo (pure kit), overworld is a
snare-only drumline (21.5% vs 8.2%), snow peaks four-on-floor (25.9%) AND
tambourine (23.5%), water peaks woodblock/guiro (3x), desert peaks latin
percussion (30.6%) with the fewest cymbals, and dance's real marker is the
CLAP (24.1%, 2.3x) — not four-on-floor (20.4% there; honest negative).
Evolution: 70.2% of songs change their kit at least once (~1.6 changes/32
bars); crash and tom are THE add/drop voices; 41.8% of crashes land exactly on
beat 1, 35.9% of those on 4-bar seams. Stacking: median 3 simultaneous
slot-groups; 19.4% of kit songs run a hand-percussion deck on ≥25% of their
kit bars and 87% of those keep it ≥50% — a standing arrangement choice, not a
fill. 61% of clap songs layer the clap WITH the snare — corpus confirmation of
the exemplar's clap+slap finding, and of his "drums can be layered" law.

**Layer census + rhythm templates** (27,270 files role-typed + 1,400
note-level, 218,114 gridded bars; 9 cards + 6 template proposals). The
role skeleton is bass + lead + 1–3 mid SINGLE-LINES — a chordal acc hand is
rarer than the engine assumes; harmony arrives as stacked counters. Register:
one hole above the bass (median 14–19 semitones), everything above packs at
3–7 semitone gaps, descants hug the lead at ~1. Rhythm relations:
complementary (<0.2 shared onsets) is the MINORITY everywhere (10–20%) — his
praised zero-overlap reels are a distinctive choice, not the norm; victory is
79% locked (fanfares are homophonic — a victory generator should LOCK, the
opposite of the reels advice); dance is least locked. The six templates
(rhythm + fill policy, per his "not encoding the points" ask): backbeat
chords [2,4] (116 files — the missing-snare answer from the harmony side),
offbeat-8th frozen stabs (132, dance 2.8x — widens the r29 pool-of-one),
gallop bass (86, chord-tone 0.96), pickup-run-into-bar (130 — D101's walk as
a rhythm class), 16th double-tresillo (95; not carded — adjacent to existing
tresillo cards), beats-2-3-4 lift (196, victory/ceremonial skew; not carded —
the sad_shop strings card IS this template). Four carded as one-realization
demos; the template data rides in each card's `template` field for future
wiring.

**Variation + chordal melody + gestures** (928 verified 4/4 files, 22,588
variant bars; 9 cards). THE variation law: **85.1% of corpus variation keeps
the rhythm IDENTICAL and varies pitch only** — transposed 34.9%,
fully-repitched 28.1%, partially repitched 22.1% (median half the notes),
thinned 7.0%, fill-added 5.6%, and octave_shift — the old engine favorite —
is the RAREST at 1.1%. Bass varies pitch-side 93%; acc is the most
rhythm-varying (20%). Variants sit in statements 3–4 of a 4-group 55% of the
time. This is "each iteration shouldn't be a different speed" measured across
928 games, and it is the mechanism bank for his melodies-vary-per-song law.
Chordal melody: ~66% of leads are mono; thickening peaks in battle (17.9%) /
dungeon (17.2%); 68% of thickening is dyads; long notes thicken at 2.4x short
— chordTop's DIRECTION is right but its ≥1-beat gate is ~2x too strict
(median doubled note 0.49 beats), and long-note doubling is mostly OCTAVES
(39.8%) while 3rds are the short-stab choice — chordTop implements the
minority craft. Brass leads are mono 47/55: "multiple notes in the trumpet"
lives in stab splits and cross-track pairs (as in the exemplar), not line
thickening. Gestures: only 28% of files have any fast run; median 7 notes /
20 semitones / exact 16ths; direction is a FAMILY trait (synth leads fall,
bells rise, strings rise, piano falls); placement 74% mid-phrase (seams only
weakly enriched, 26% vs 19%) — and the memorable seam runs are PERIOD-LOCKED
riffs (identical fall every 32 bars), not one-shots.

## Sources beyond vgmusic, and the of-use rubric

Permission held: vgmusic.com + hsmusic.wiki (owner permission 2026-08-28),
drum-patterns.com (email permission 2026-08-25 — re-confirm before bulk).
Already local: his 8 reels (the highest-signal source — his taste is attached),
Miraleste + Cottonwood packs (his annotations), Unison LoFi kit, Undertale
MIDI (piano-only — no drum material), NSMB desert refs, the r30 Synthesia
example (proved video-frame pitch extraction works). Considered and NOT
scraped: khinsider (audio rips, wrong medium + rights), bitmidi/freemidi
(unclear rights), Lakh/IMSLP (licensable but wrong idiom — pop/classical
phrasing doesn't transfer to loop-based game scoring). VGMusic stays the
backbone because it is idiom-matched AND permitted. Miraleste's wav-only drums
remain minable via onset detection if a round ever needs them (heavier
tooling; not built).

**How a find earns a card** (the rubric, applied at curation):
1. idiom match — 4/4 (D92), loopable in ≤16 bars, register-legal;
2. mechanism NEW to the store (dedupe against all prior batches — b2 dropped
   30 candidates for duplication; a pool of near-duplicates teaches nothing);
3. renders through the project dialect and is BUILD-VERIFIED (every candidate
   evaluates at page build; anything that doesn't is rejected loudly);
4. scope statable — title prior + musical evidence agree on where it belongs,
   or it is genuinely general;
5. his words attach where they exist (front-loads the queue);
6. an arrangement-scale find must compress to an audible A/B inside one card,
   or it becomes a template/technique row instead;
7. provenance exact enough that promotion to engine libraries stays a
   BY-HAND, per-row act (D95 — nothing here touches retrieval pools).

## The broad goal: store → verify → predict

His framing: "once we have all the hardcoded stuff stored, we then verify
which ones are good in the library and then we try to predict by learning
directly from what we have stored as well as previous music theory stuff."

- **Store** (this batch): candidates carry machine-readable features — type,
  scope claim, key/mode, tempo, cont (continuous vs sporadic), pianoMain,
  register band, and now the question being tested.
- **Verify**: his labels + pair notes ratify cards AND scope claims
  (import-catalog.mjs → catalog-labels.js; ticked pairs pin their judged
  {delta, gain, tempo} forever).
- **Predict**: the ratified store becomes training data for the crossing
  ranker. The features already measured for the combo player (key-seatability,
  tempo-grid ratio, register collision, onset-overlap class, mode alignment)
  plus his heads-up constraint — "two songs under the same category's
  harmonies/layers may not resonate completely ... it depends on categorical
  as well as music theory/mechanical/style rules" — mean CATEGORY features
  alone must never predict a pairing; mechanical compatibility gates first,
  category ranks second. First concrete step: score all unlabeled pairs with
  the mechanical features, surface the top predictions as pre-ticked guesses,
  and let every label he returns correct the ranker. The theory priors that
  survived measurement (the line-fits-the-KEY law, D77 relative loudness,
  octave-copy growth, continuous-layers-sit-lower) enter as hard constraints,
  not learned weights.
