# motif-engine — working doctrine

Strudel-based game-music generation engine. Ethan Chen composes nothing by
hand here: prompts (emotion + environment) compile to full songs. **His ear
verdicts are the project's ONLY quality signal.** Everything below was
learned from his ear, round by round; the full ledger with rationale is
`DECISIONS.md` (numbered D-entries — the authority when this file is
ambiguous). Read the LAST few D-entries before starting any round.

## The round loop (how every session works)

1. Ethan listens to `audition/songs.html` (or `videolab.html` /
   `foundations.html` / `drums.html`) and pastes a verdicts JSON export.
2. Save it to a scratch file, run `node scripts/import-verdicts.mjs <file>`
   → updates `src/lib/verdicts.js` (VERDICTS, DERIVED_VERDICTS, CARD_NOTES…).
3. **Snapshot `audition/songs.html` FIRST** — it is the judged baseline for
   byte-stability checks.
4. Make fixes (see the laws below), rebuild: `node scripts/audition-songs.mjs`.
5. **Compare every song's DATA JSON against the snapshot.** Only songs his
   notes name (plus intended engine-rule absorption on unkept songs) may
   differ. Kept songs must be byte-identical unless his note names them.
6. `npm test` (the suite pins song counts, D64 harmony pins, determinism).
7. Re-render changed songs' HQ wavs (see Render tier below).
8. Verify adversarially (measure, don't trust — a multi-agent verify pass
   has caught a real defect almost every round).
9. Append a numbered D-entry to `DECISIONS.md` + update `todo.md`.

## Prime directives (violating these has burned us before)

- **Judged material is frozen.** A KEPT song pins its harmony degrees AND
  its base exemplar (D64/D65) — the generator re-reads them from
  DERIVED_VERDICTS. Structural gates key on `priorKeep`; every new engine
  rule must be gated `!priorKeep` so kept songs stay byte-identical.
- **The keep-transition law (D91).** A song judged on the UNKEPT path was
  judged WITH bridges/breakdowns/melody-grammar. When its keep click lands,
  `priorKeep` flips and those gates would strip the features he approved.
  Pin them in SONG_OPTS (`bridgeHarmony: true, breakdown: true,
  melodyGrammar: true`) and verify byte-identity against the judged page.
- **HIS OWN NOTES RETRACT WHAT HE JUDGED (r28/D118) — the keep-transition law's
  FOURTH bite, and the first one that fires at IMPORT TIME.** Six gates read
  `!DERIVED_VERDICTS?.[name] && !CARD_NOTES?.[name]` so a NEW capability only
  lands on a history-less song. Correct, and it stays. But the instant a note
  about the song exists those gates ALSO strip what the song had when he heard
  it: importing his 23 vanriver notes moved **15 of 23 songs on their own page**
  with nothing else changed, and `colorFresh` — which governs HARMONY — changed
  `degrees`/`symbols`/`numerals` on 14, including two prose keeps ("no
  complaints", "really good"). **Rebuild against a pre-import copy of
  `verdicts.js` after every import**; that is the only way to see it. The fix is
  `opts.noteBlind` + `historyLess()`: a page declares that its OWN notes are not
  a history because they are its first judgement. One flag — pinning
  feature-by-feature was tried and overshot, moving all 23 mixes (D101's "six
  flags, seven next round", on schedule).
- **A POOL OF ONE MAKES EVERY HASH ROTATION A NO-OP (r29/D119).** `fnv(...) %
  pool.length` is the engine's variety mechanism and it is silently dead wherever
  the pool has one member. The texture selector fixed its class to `offbeat`,
  which has exactly ONE ratified 4/4 figure, so `fnd_offbeat_chords` on
  `gm_kalimba` was **30 of 39 songs across all three pages** — his "has been used
  in every song so far". `texSounds[ti % texSounds.length]` is the same shape:
  index 0, every time. When a selection looks varied, COUNT THE POOL. And after
  widening one, immediately run the metronome test over what became reachable
  (D100) — opening `broken_octave` here admitted a 16-onsets-per-bar figure.
- **D77 IS RELATIVE AND THE ABSOLUTE CAPS DO NOT ENFORCE IT (r29/D119).** Two
  independent places cap support with a NUMBER and neither compares to the lead:
  the texture band `[0.3, 0.52]` (D86, set for energetic songs but reached by
  every `fullSynth` song whatever its energy) and `gainFor`'s `Math.min(0.9, …)`
  in arrange.js, whose own comment says "Capped so nothing can shout over the
  piano". Measured: the texture was 0.481 on all 14 r28 songs and **louder than
  the lead on 11**, with all four of his "too loud" cards inside that 11 and none
  outside it; `melody_takeover` ran **1.91x, 1.60x, 1.53x** its own song's lead.
  Cap at a fraction of `leadGain`, and check the RATIO, never the number.
- **A CHORD DOES NOT HAVE TO LAST A BAR (r32/D122).** `bindFigure` resolved its
  symbol once per CYCLE, so every chord in this engine lasted a whole number of
  bars. Measured against the eight reels he sent, that is wrong for SIX of them
  and it was the largest single fidelity loss in the whole transcription: reel 7
  changes chord ON EVERY BEAT (16 chords / 4 bars), reel 4 runs 17 chords over 4
  bars at uneven beat-level spans, reel 3's dotted quarters deliberately CROSS
  the barline, reel 2 is a 3+3+2 tresillo. `harmonyContext.chordBeats` gives each
  symbol a duration in BEATS and the chord resolves PER ONSET. Distinct roots per
  bar went 1.00 -> 4.00 on reel 7. Two of his cards were that flattening heard
  directly. **Only `bindFigure` gets the real thing** — every other binder
  collapses it to the bar's DOWNBEAT chord (`perBarHarmony`), because melodic
  phrase logic, cadence landing, masks and section alignment are all
  bar-quantised; that is an approximation and it is documented as one.
- **THE ENGINE'S OWN ARRANGEMENT WAS 82% OF A CARD CALLED "FAITHFUL" (r32/D122).**
  His note: "it should be hardcoded more faithfully to the reel in terms of
  combinations and such (or maybe other added instruments are just affecting it
  idk)". Measured: **37 of 203 sounding layers came from the reel library, 18.2%**,
  and almost every complaint on the page named an ENGINE part — `gm_music_box` on
  15 of 16 songs (his "the vibraphone is a bit overused"; NO reel row picks that
  voice), `_funk_bass` on both construction songs ("boogie again for tense
  construction — why?"), the breakdown on 12 of 16 ("there doesn't have to be a
  beat drop in every song ffs"). `opts.reelFaithful` is ONE flag that stands the
  whole discretionary cast down at once (D101's "six flags, seven next round"),
  plus: the reel's OWN instruments (`fullSynth: true` was swapping the accordion
  for a square lead and both bell rows for a music box), the reel's chord row
  taking the ACC slot rather than stacking beside a second harmony hand, and
  `accVary: false` + `accTravel: false` because **a transcribed pattern must play
  as transcribed** — D97's composite moves the RHYTHM in block 2 and D62 swaps
  the figure every letter, which is his "each iteration shouldn't be a different
  speed". 18.2% -> 42.9%.
- **THE LIBRARY IS SMALLER THAN THE SOURCE (r32).** 19 rows across 8 reels
  against ~60 transcribed layers (reel 5 has ELEVEN parts and 2 rows). A
  combination cannot be faithful when most of what was played was never
  recorded. Caveat from r31: timbral doubling is pervasive, so the distinct-part
  count is lower than the title-card count.
- **THE DRUM POOL NEVER FILTERED ON METER (r32/D122).** `seven_hats_223` is a
  **7/8** row — seven onsets at sevenths of the bar — and it was selected for 4/4
  songs, so its hats aligned with nothing. His words, twice: "sounds like it's on
  a different tempo", "literally just off beat". **Its own row said
  `meter_class: '7/8'`**; the foundation pool has filtered on that forever and
  the drum pool never did. Five rows affected, reach 3 songs, all festival — which
  is why it took eight rounds to surface. D92 makes the engine 4/4-only.
- **A LIST OF ONE, AGAIN (r32/D122) — D119's third instance.** `industrial_metal`
  was the ONLY row in the library carrying a stick or metal rod and the generator
  named it literally, so every construction song got the identical part: "the same
  3 stick is just used every construction or what?". Two groove-forward siblings
  + hash rotation. **When a selection looks varied, COUNT THE POOL — and when a
  generator names a library entry as a string literal, that IS a pool of one.**
- **THE BREAKDOWN IS SIX OF HIS CARDS (r32/D122).** Five "the piano disappears …
  abrupt" plus "there doesn't have to be a beat drop in every song ffs" are ONE
  device. It fired on 12 of 16 (34 of 47 on the suite) because
  `opts.breakdown !== false && !priorKeep` is true of every unkept song, and it
  cut the whole base mix with a 0/1 `.mask()` — the exact artefact r22 already
  fixed for the breathing layers and never applied here. Now hash-gated to ~1 in
  3, and a gain envelope: a bar of decay in, a two-bar swell out.
- **D77, TWICE MORE, AND ONE NUMBER LEFT ON THE TABLE (r32/D122).** The drums:
  `PRESENCE_GAIN` is absolute and never consults the tune — measured mean **0.90x
  the lead**, louder than it on two songs; now capped at 0.72 x `leadGain` where
  the kit is ASSEMBLED, so the solo carries it too. The accompaniment: `_acc`
  averaged **1.15x the lead across all 16 songs and hit 2.13x**, because the piano
  band's top is a flat `1.0`. **That fix is SCOPED to reel-faithful cards on
  purpose** — the acc band reaches all 47 judged songs and widening it is a round
  of its own. The measurement is in D122 for whoever picks it up.
- **A MODE WAS NOT EXPRESSIBLE OUTSIDE DESERT (r32/D122).** `family` only
  distinguishes major/minor, so reel 8 — D DORIAN, B and F both natural — was
  built in D MAJOR, writing F# and C# against Dm9/Em7/C^7. His card: "the melody
  in the glockenspiel doesn't sound on key". `opts.keyScale` now names any mode
  `SCALES` knows; only `desertScale` could before.
- **A LATER .gain() REPLACES THE EARLIER ONE (r33/D123).** bindMelody authors a
  per-note accent envelope as `.gain("<env>")`; every melody fx then appended a
  flat `.gain(x)`, and the flat one WON — the ENTIRE melody tier on EVERY page
  realized uniform velocity for rounds ("uniform velocity is a bug §3.4", live
  on the project's own leads; all 47 songs.html chains measured min==max).
  `.mul(gain(x))` composes. `gainFx()`/`composeGain` are the r33-gated fix;
  kept songs were judged flat and STAY flat. When auditing gain, count DISTINCT
  realized values — a 20+-note layer with one value is a clobbered envelope.
- **THE HANDOFF CHAIN WAS TEN OF SIXTEEN CARDS (r33/D123).** The default
  handoff pool (flute/vibraphone/epiano) took the tune at 1.01–1.04x the lead
  (the SECTION CURVE: later letters ride louder segments than the A bars his
  ear calibrated to; LEAD_CURVE now clamps at 1.0 on fresh songs) — every
  "flute too loud", both "glockenspiel way too loud" (= gm_vibraphone; no
  glockenspiel existed), the "melody synth", r1's "second section randomly got
  louder" (same-timbre 2.54x jump at the handoff seam) and r2's "piano just
  abruptly cuts off". REGISTER separated the complained flutes (78–83) from
  the uncomplained (68–70), 5/5 vs 0/3, with gains overlapping. Reels pages
  now pass `noHandoff` (a reel plays one instrument per role);
  `opts.handoffPool` steers pages that keep handoffs.
- **A FROZEN ROW SEATS ON THE KEY TONIC, NOT barSyms[0] (r33/D123).** The reel
  adapter seated every frozen row on the loop's FIRST CHORD while the rows
  declare key-tonic degrees — on r3 (first chord Gm9, tonic F) that made the
  pluck 71.4% out-of-chord vs 14.3% per its own spec, the largest single number
  behind "most of the instruments sound dissonant". And CONSONANCE WITH A STALE
  CHORD IS DISSONANCE: 61/96 engine out-of-chord notes were downbeat-chord
  members against sub-bar progressions (`opts.subBarChords` gives bindMelody
  per-onset chord resolution; cadence grammar stays on the downbeat chord).
- **A BARE `!opts.pinFrom` RETRACTS JUDGED CAPABILITIES (r33/D123, the D101
  catch-22's third instance).** deepDrums and leadDynamics read `!opts.pinFrom`
  and switched OFF the moment a prose keep was pinned — the pin destroyed what
  it protected. Every pin-aware gate reads `ruleFresh(N)` with the capability's
  own round, never pin EXISTENCE; colorFresh's escape is forcing the judged
  capability explicitly (`voicedColor: true`). A prose-keep pin is verified on
  MUSIC fields (mix/solos/degrees/bpm/key/drums) — card-text fields may move.
- **THE MELODY GRID LAW + TISSUE (r33/D123, research/melody-grammar-r33.md).**
  His "shifted off by like a sixteenth" measured: melody cells write odd-16th
  onsets (65% at slots 3/7 — anticipations; swing/microtiming ruled out, 0/16),
  33–73% of the named cards' melody components. References (four populations):
  odd 16ths are PICKUPS or run members; short notes hit the bar's final slot at
  2.6–7.5% ≈ uniform vs our in-mix 32.3%/70.7% (lead/companion) — the D118
  shape exists in NO reference. `gridSnapMelodyEntry` snaps non-pickup odd
  16ths down an 8th (colliding snaps MERGE — the ≤3-onset-bar case closed);
  triplets pass (a different grid, not a displacement). `noJitter` is now the
  fresh-song DEFAULT. The deeper gap: the engine NEVER writes connective tissue
  — stepwise 16.3% vs 28–57%, NCT ~2% vs 25–52%, leaps 18.9% vs 1.7–6.5%
  medians, flat 97% chord-tone rate where every reference has a strong-beat
  GRADIENT. `opts.tissue` = one leap per phrase + between-neighbour passing
  tones bracketed by step on BOTH sides by construction. And the study's own
  engine numbers first reproduced only on UNMASKED SOLOS — the
  measure-in-the-mix trap catches measurers too; re-baseline before targeting.
- **THE DRUM COMPILER'S LAST WRITER WINS (r33/D123).** drumExpr wrote colliding
  same-slot onsets into ONE slot cell, so backbeat_hard/kit's clap ERASED the
  snare's beats 2/4 — the declared backbeat has never fully sounded on ANY page
  carrying those rows. Same-slot onsets now stack `[a,b]` (r33-gated). The kit
  cap now compares to the lead's REALIZED mean (envelope mean x nominal) with
  the section-curve max divided out — the r32 cap FIRED and was still defeated
  by both (metal at 0.93x lead). The stick rotation was a hash NO-OP on the
  exact card he judged (fnv%3=0 = the old row): after growing a pool, CHECK
  WHERE THE HASH LANDS on the complained song.
- **THE STANDING VERIFICATION WORKFLOW (r33, his ask "create a verifcation
  process and iterate"):** `.claude/workflows/verify-round.js` — stability /
  per-claim adversarial verifiers / D77 realized-ratio sweep / melody-grammar
  sweep vs the r33 reference bands / completeness critic. Run it after fixes,
  before the D-entry, with args {pages, snapshots, movedExpected, claims}.
  What predicts his dissonance cards is NOT friction density (the page maximum
  got "I like this!"): it is out-of-chord-vs-TRUE-harmony on ENGINE layers,
  exposed struck semitone dyads in sparse mixes, and literal majors/leading
  tones.
- **FOUR AGENTS ON ONE JSON READ FOUR POPULATIONS (r34/D137).** The pop-pack
  read-out's four lane agents each silently chose a cut (312 fullest-non-easy
  songs / 249 in 4/4 / most-parts dedup / a lift table conditioned on 5–19 st)
  and the verify pass found 17 cross-lane number drifts, none flipping a
  conclusion, all misleading to anyone re-measuring. Every lane section and
  every headline number STATES ITS POPULATION, and the header names each
  lane's. And the solo-vs-mix trap fired a THIRD time: "the engine repeats
  MORE than pop" was true of `_lead` solos (84%) and false in the mix (59%).
- **PATTERNS YES, TUNES NO — AND MEASURE IT (r34/D137).** Lab hooks are
  composed from a corpus's RULES; a verifier comparing every hook's
  (interval, gap) pairs against every source RH caught one card that had
  reproduced Shape of You's cell transposed. Run that comparison before a
  page built on copyrighted material ships.
- **THE ENGINE'S VOICE HAD THE RANGE AND NOTHING ELSE (r35/D139).** 36
  Vocaloid transcriptions measured against the 17 sung scores the engine had
  exported: syllables/s 3.9 vs 1.4, step 48% vs 18%, phrase starts on the
  downbeat 9% vs 100%, 2-bar cells returning at pitch 31% vs 0%, out of key
  4% vs 15% — while the range (58–80 / 55–78) already matched. "Good but
  uniform" was ONE shape: the instrumental lead sung as-is. The sung line is
  now a RULE-COMPOSED spec per letter (`src/lib/vocal-line.js`,
  `opts.vocalWriter`) through `bindMelodySpec`'s guard; every rider
  (companion, double, octave, chorus double) takes the same spec. The chorus
  in that corpus is a REGISTER (+3..+5) and a TEXTURE (the accompaniment
  doubling the tune an octave UP in 92% of choruses vs 9% of verses, ×2.5
  strikes, ×2 notes per strike) — never a speed and never a harmonic rate.
- **A LAB CARD THAT MOVES NOTHING IS A FAKE A/B — MEASURE EVERY VARIANT
  BEFORE IT SHIPS (r35/D139).** Two of nine cards were dead on first build: a
  walk-width card whose three variants all realized 60–77 (the tessitura is
  set by the walk's dynamics, not the clamp), and a hook card whose variants
  differed only from the THIRD statement on a 16-bar ABAB form (no letter
  reaches a third statement). A test now pins that a card's variants realize
  DISTINCT mixes. Also: a "does the accompaniment sound the voice's pc"
  agreement measure read 0% on every engine downbeat — in a dense mix every
  chord tone the voice sings is doubled by some layer, so excluding the
  doubling excludes exactly the agreements. Label the chord; do not count the
  set.
- **A DOUBLER IS VERIFIED BY ITS INTERVAL AT SHARED ONSETS, NEVER BY ITS OCTAVE
  PARAMETER (r35/D139).** The chorus double was requested at `leadOctave + 1`
  and sang in UNISON on 34 of 36 songs: the writer re-centres on an absolute
  target, so the parameter was a no-op, and a range cap on the PARAMETER then
  pulled it to unison or an octave DOWN. A rider's octave is a degree shift
  from ONE bound octave, its pool is filtered by the REALIZED register, and the
  verify pass measures the interval histogram at shared onsets (+12 on 100%
  after the fix). Same round: an un-gated pool exclusion moved six judged
  songs — every pool change is `vocalWriterOn`/rule-gated and byte-compared.
- **A NEW MELODY WRITER MUST OWN EVERY LINE THAT RIDES THE LEAD (r35/D139).**
  The first build's sung line reached midi 99: a cast `melody_takeover` layer
  still carried the OLD retrieved tune into `_lead_mix`, and the companion /
  octave / double bound their own cells. Under the writer they all take the
  writer's spec (shifted, re-octaved) and the takeover leaves the score.
- **A VOWEL CONTINUED ONTO A NEW PITCH IS "INDIAN FLUCTUATION" TO HIS EAR
  (r36/D140).** r34's melisma rule (a note under 0.14 s with no gap takes no
  mora) met the r35 writer's 16th pairs and 46–66% of the sung notes on his
  four "held and different notes … sounds Indian" cards were melisma, 0% on
  the songs he liked. A Vocaloid line is one mora per note; `--melisma` is 0.
  And every sung voice says the SAME words: the harmony copies the lead's
  syllable at shared onsets (`copyLyricsFrom`), never rolls its own.
- **A SOLO WIND DOUBLING A CONVERTED VOICE AT THE OCTAVE READS "OFF KEY"
  (r36/D140).** Three "woodwind off key" cards and one "violin too loud" were
  all the chorus double — in key on 98% of notes, drawn from a wide pool onto
  gm_clarinet/gm_flute at midi 81–84 — exposing the singer's pitch drift. The
  corpus doubles on the accompaniment's own piano; so does the engine now
  (keyboards/mallets only, 0.5 × lead). And with a 0.45 guide lead, every D77
  support band was set against the wrong reference: ×0.6 under a voice.
- **A BUG FIX GATED `ruleFresh(N)` RUNS THE BUG ON THE KEEP CLICK (r36/D140).**
  The D138 index fix was gated r35; his keep on vo_lullaby flipped priorKeep,
  the r34 constant index ran, pointed past `mixParts`, and the PAGE COULD NOT
  BUILD. A gated fix needs a fallback that is correct on both paths (an
  out-of-range index falls back to the true one). Same round: the clicked
  bright-major exemplar pool is TWO Undertale loops (D119) — both excited
  major songs hashed onto one; pinned with basePin + rawBase.
- **"ABSTRACT THIS TO ANY X" MEANS A LABEL, NOT A REDESIGN (r30/D120).** His four
  "could be abstracted to any dark/calm/epic environment" notes were read as an
  engine-redesign ask and planned as `core(mood,energy) x tint(environment)`. His
  ruling: "no i mean label-wise for that song, x song could also be used given
  other various prompts rather than specific that one. so that instrument preset
  and pattern and what not works." A song he likes is a FINISHED OBJECT; what
  widens is the set of prompts it is SERVED for - `src/lib/song-labels.js`, one
  entry per song he has spoken about, his note verbatim in `source`, read by name
  so it can never re-roll anything. Serving at a higher energy means ADDING layers
  to the judged object, never regenerating it.
- **THE KEY IS PICKED BY HASHING THE SONG'S NAME (r30/D120).** `keyHint =
  weightedPick(KEY_POOLS[family], fnv(name|tonic))`. Measured: five names for one
  identical prompt gave C, G, A, D and A#, with bpm 54-75 and voices 1-3. Two
  consequences. (a) Any "the same song under another prompt" work must serve the
  finished object, not re-generate it. (b) **An A/B pair must be built under ONE
  name** and renamed afterwards, or the comparison is testing the name. Also
  measured: with the emotion FIXED, the environment alone moves bpm by up to x3.4
  (a "calm" song is 50-151 BPM).
- **Prose keeps are real.** "love this / I like this a lot" without a keep
  click → pin the song (`grammarPin: true` in SONG_OPTS) so no engine-wide
  rule re-rolls it before the click lands. Remind him to click + export.
- **Voice-only changes.** Swapping an instrument on a judged song is allowed
  ONLY when his note asks, and must be voice-only: the (time, midi) multiset
  byte-identical, only `.s()` changes. Verify by evaluating both pages.
- **A song he has spoken about never swaps its lead voice** unless his note
  names it. New-capability rolls (string leads, vary-lead-voice) default
  only on HISTORY-LESS songs (no verdict AND no CARD_NOTES entry).
- **Library growth re-rolls hashes.** Adding a canon/pool entry mutates
  every unpinned song's `fnv % pool.length` retrieval. Only CLICKED entries
  enter retrieval pools, so unclicked additions are safe; ratifying one is
  not — check the blast radius, pin affected songs if needed.
- **The CORPUS is not the library (D95).** Growing `audios/vgmusic/` re-runs
  `import-vgmusic.mjs` → `build-harmony-model.mjs`, and the counted model
  ranks the variation ops: at 1200 files it flipped `treat` on 18 songs,
  KEPT ones included (sad_shop mixture→suspend). `audios/vgmusic/` stays
  pinned to its 400-file D52 manifest. Research corpora (vgmusic-corpus,
  vgmusic-lanes, hsmusic, smwcentral) are ANALYSIS-only, gitignored, and
  never feed `src/lib/`. Promoting corpus material means authoring canon
  entries by hand, not re-counting. **A bug fix that makes a previously
  unreadable file readable IS library growth** (D96): it added one unratified
  entry and moved four songs including a keep. `import-vgmusic.mjs` carries a
  documented `FROZEN_EXCLUSIONS` set for exactly that.
- **Extraction is versioned, not just correct (D96).** `LOOP_PROFILES` in
  `src/ingest/corpus.js`: `repaired` is the DEFAULT for anything analysing a
  corpus; `legacy` is what the committed packs were built with, and both
  importers pin it EXPLICITLY at the call site. Improving the extractor must
  never re-roll judged material as a side effect — regenerating under
  `repaired` moves 33 of 43 songs. Flipping the importers is a whole round:
  re-audition and pin, don't ride it in on a bug fix.
- **Never trust "returned OK" — measure.** The D85 lesson: a VST preset
  "loaded" (returned truthy) for three rounds while every synth stem played
  the init patch. A change is unproven until a MEASURED difference (haps,
  spectrum, byte diff) confirms it. Same for every fix: measure
  before/after; report the numbers.
- **Stale notes — HIS RULING (r18/D99), and it has a SCOPE**: "some advice i
  didnt change but if its a song that was changeed and the advice wasnt changed,
  it just means the advice still applies", then, asked how far that reaches:
  "oh I meant like every song including scary manor and below. everything above
  it, if advice is the same it doesnt apply". So the export's note ORDER is
  meaningful — he works down the page and stops. Notes from the card he names
  downward are LIVE; above that line, only notes whose TEXT changed are live and
  an unchanged one is a leftover from the round that already answered it.
  **Ask which card he stopped at, or infer it, before acting on the top of the
  list** — in r18 six of my fixes came from leftovers, one of which moved a
  PINNED song. A note on a song with no prior entry at all is necessarily new
  text and is live wherever it sits.
- **A gate that stops NEW capabilities must not RETRACT old ones (r18/D99).**
  `marcatoOn` and `varyLead` key on `!CARD_NOTES?.[name]` so that new rolls only
  land on history-less songs. The first time he writes a note about such a song,
  those gates flip and the song silently LOSES layers he already heard —
  measured on vs_excited_space, which lost its marcato and swapped its lead
  voice the moment its first note landed. Pin the feature; only the byte compare
  catches it (npm test was green).

## How to measure a song (the probe pattern)

```js
import { evaluateSong, hapsByLabel } from './src/harness/evaluate.js';
const html = readFileSync('audition/songs.html', 'utf8');
const data = JSON.parse(html.slice(html.indexOf('const DATA = ') + 13,
  html.indexOf(';\n', html.indexOf('const DATA = '))));
const s = data.songs.find(x => x.name === NAME);
const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
const haps = hapsByLabel(ev, 0, s.totalBars).get('p').haps;
// h.whole?.begin ?? h.part.begin may be a Fraction — Number() it.
// h.value.note is usually a STRING like "c5"/"eb4" — parse it yourself.
// h.value.s is the sound name. One cycle unit = one bar.
```

Byte-stability check: `JSON.stringify` each song object from the snapshot
vs the rebuilt page. The page embeds a `BUILD` timestamp with minute
resolution — a determinism test straddling a minute boundary is a known
flake; rerun before believing it.

## Grammar & dialect traps

- Chord dialect: `Ab^7` (maj7), never `Abmaj7` — unknown symbols silently
  get WRONG default intervals. **r32: I wrote `Emaj7`, `Fmaj7` and `Cmaj7` into a
  brand-new library while this line was on screen; all three rendered as PLAIN
  TRIADS with the major 7th silently gone.** A test now fails on the `maj7`
  spelling anywhere in `REEL_PROGRESSIONS`. Other qualities that DO resolve and
  are easy to miss: `madd9` (R 9 b3 5 — an add9 with no 7th, which is what a
  `m9` wrongly gives a 7th to), `o` (dim triad), `o7`, `sus`, `7sus`, `6`,
  `m7b5`. `7b9` and `m11` do NOT — both fall back to a plain triad. Degrees tokens: `0:m 3 5:m 8b 1b:^7` =
  semitone offsets from tonic, `:quality` suffixes, `b` for flat roots.
- Figure tokens: `R/3/5/6/7/9` or `~<semitones>`, `+` per octave, dots join
  chords (`3.5.7`). NO negative semitones (`~-12` is invalid — use a
  separate figure at a lower octave).
- On plain triads a `7` token still falls back to b7 (foreign-pitch bug) — use
  6, or a SCALE token. r16 tried to "fix" it (major third -> maj7) and REVERTED:
  it is a fixed rule for a function-dependent question (over V it writes the
  key's tritone), and it is library-level — 30 entries in the undertale/videos
  packs carry a bare `7`, so it would move judged material on their next
  rebuild, and it measurably moved `audition/foundations.html`.
- `s2/s4/s6/s7` are the SAFE way to reach a 2nd/4th/6th/7th: they resolve
  against `chordScale` and are in-key by construction. `4` and `7` do NOT —
  `memberSemis` falls back to FIXED intervals that consult neither key nor
  chord-scale. Prefer the scale token in any generated figure.
- `:6` and `:m6` are both full dialect qualities as of r16 (`6` already worked
  everywhere; `m6` was the real gap). NOTE: adding `m6` grew every voicing
  shape's `playableWith` pool 446 -> 453, which is a retrieval re-roll vector
  for any path that filters by shape. It moved no song (0 of 43 contain an m6).
- Onsets are bar-relative fractions (`'3/4'`), bars ∈ [0, entry.bars).
- Section lengths must be 4/8-bar multiples; melody masks must align to
  whole harmonic loops (a half-loop intro shift starts the tune
  mid-progression — shrink intros by WHOLE loops only).

## Taste canon (his ear's standing laws — the WHY matters)

- **Color is the norm**: diatonic color (m7/^7/9/sus/6) everywhere; plain
  triad runs read "generic". CHROMATICISM (dim chains) is what he rejects —
  never conflate the two (the old plainness rule did, D88).
- **Sections own their harmony**: a real bridge (B letter, budget-2
  variation), real breakdowns (acc+drums strip over a held-root floor
  ≤C3), bar-4 turnarounds (sub drops an octave). One-loop-plus-treat reads
  generic.
- **Layers with their own melody**: counterline (held 3rd / beat-2 climb),
  descant (3+5 dyad, 5-6-5 walk), singing pad top voice (planned phrase),
  marcato on energetic songs, and the COMPANION. Multiple at once is good;
  support tops stay UNDER the lead (D77); high ornaments go silent during
  melody bars. **The COMPANION (r18/D99) is his most-repeated ask — five cards
  in one round, once as "I want more layers with their own melody man that's
  what ive been saying".** It rebinds the LEAD'S OWN CELL (same seed, rhythm,
  phrasing, per-letter `hold`) with every pitch moved to a chord tone BELOW the
  melody: thirds-first on even bars, sixths-first on odd, no fourths, no octave
  doubling, and a note with no tone available under it becomes a REST so the
  line is sparser than the lead rather than its shadow. Default ON for every
  unkept song with no counter/alternate melody in its cast; `companion: true`
  forces it past a cast that has one. The arranger's own `counter_melody` part
  was NOT the answer — measured, it was 3 of 108 cast layers and 29 of 43 songs
  had no own-melody layer at all.
  **r19/D100 — a chord tone under EVERY note made it more chromatic than the
  lead** (11 of 21 songs; triumphant_citadel 22.9% -> 50.7% out-of-key; three
  songs whose lead is 100% diatonic got a companion that is not; over
  excited_fight's B-in-A-major it parked on D# for 18 of 22 notes and his ear
  called it "completely off key"). The lead spells a chromatic chord only at
  structural points and walks the scale between them; the companion did it every
  time, so a passing chromatic became a drone. **It may leave the key only where
  the LEAD already has, and otherwise RESTS** — 16.3% -> 6.1%, 0 of 21 songs.
  It also never takes the LEAD's or the ACC's voice (hard exclusions — the acc
  hand is not in `rendered.layers`, so both jungle songs had the companion on
  the acc's own marimba); a quiet cast layer is a soft exclusion, because losing
  the layer is worse than sharing one. Cap its octave by
  `INSTRUMENTS[sound].range`, never by a name list (see below).
- **The descant and the counterline were ONE layer (r19/D100).** Measured: 25 of
  the 28 songs carrying both put them on the SAME string voice at IDENTICAL
  onsets — the counterline's climb masks onto the ODD bar at 1/4·2/4·3/4, which
  is exactly where a 2-bar descant's 5/4·6/4·7/4 walk lands. Four notes of one
  parallel string chord, counted by the engine as two "layers with their own
  melody". The descant's walk now sits in the EVEN bar, where the counterline
  only holds. When auditing this ask, CHECK FOR THIS SHAPE FIRST: two layers
  that always strike together on one instrument are one layer.
- **Staccato strings (D94, his law verbatim)**: "mainly harmony, doing its
  own subharmony or just a rhymic repeat ... multiple notes per hit not
  just one note typically" — the marcato is a CHORDAL OSTINATO (dyad
  subharmony walk or 3+3+2 rhythmic repeat), never a walked line that
  shadows the melody, and it's an ensemble voice, not a solo violin.
- **Foundations vary by CLASS, not by one note (r16/D97 — supersedes D94)**:
  his ruling, three times in one round, incl. verbatim "no changing like 1
  interval randomly doesn't change it like you did for the foundations". Every
  unkept acc binds a FOUR-bar composite where each block owes a quota of
  changed events by class — block 2 moves the RHYTHM (hold/fill/push), block 3
  rewrites the INTERVALS (colour/scale/quartal/dyad), block 4 is a turnaround.
  A form that misses its quota ESCALATES rather than degrading to a one-note
  edit; that degradation is what produced the old octave-lift monoculture (52%
  of composites, and 65 of 66 changed exactly one event). 4 bars is the MAXIMUM
  safe length — every section start and length in the suite divides by 4.
  Three rules the verify pass had to teach it, all measured: a SPARSE figure
  (fnd_drone_fifth is one onset) must still vary or the law becomes a
  REGRESSION — quota is 1 for 1-2 onset figures and the fill may open any big
  hole, not just the back half; the interval palettes use SCALE tokens
  (`s4/s7`), never bare `4`/`7`, which wrote out-of-key pitches; and the
  turnaround DROPS (D88) — lifting put a piano acc above its own lead and a
  synth BASS on G4.
- **The engine varies by SUBSTITUTION; music varies by INSERTION WITH
  RESOLUTION (r20/D101).** Two of his complaints are the same defect: "the piano
  doesnt do any walking. there's not any extra notes between chords or
  countermelody etc in the piano - it's just chord bouncing" (nostalgic_casino)
  and "bits of dissonance that you can't follow" (mysterious_jungle). Walking IS
  passing tones; an unresolved non-chord tone IS a dissonance you can't follow.
  Measured on the acc hand: 2,620 within-chord non-chord tones, **66 resolving
  (2.5%), ZERO passing tones, 489 (18.7%) repeating in place**. Swapping a chord
  tone for a colour tone changes the note but not the LINE — a passing tone is
  defined by what comes AFTER it. The fixes: the **scale ladder**
  (`R s2 3 s4 5 s6 s7` — consecutive positions are a step apart by definition,
  all resolving against `chordScale`, so none can spell a foreign pitch); the
  **resolution law** (`resolveBlocks`, ONE law over the whole composite rather
  than five patched forms — patching them individually moved 93.9%→93.3%, which
  is what proved the general law was needed); and the **`>` look-ahead token** in
  bind.js, which resolves a member against the NEXT chord. That last one is the
  only way a figure can WALK INTO a change: current-chord tokens can only land a
  step from where the walk started, never from where it is going. Measured: 24
  walk events on 4 songs → **122 on 13**. Passing tones INSIDE a bar are still 0
  — the walk fixes the boundary only.
- **"MORE LAYERS WITH THEIR OWN MELODY" IS NOT A REQUEST FOR MORE VOICES
  (r21/D102, numbers corrected TWICE — see the caution at the end).** Measured
  against 31,652 vgmusic files: corpus median concurrency is **4.16** (median max
  5) and ours is **5–7** — we still carry MORE simultaneous voices than real game
  music, by roughly 1–3 voices. The gap is INDEPENDENCE, not count, and four
  rounds of answering this ask by casting another voice were answering the wrong
  question.
  **The magnitude is modest, and the first figure reported was wrong.** 90.9% of
  files carry a second NON-DOUBLING pitched part, but only **23.2% of those move
  freely of the lead** — 76.8% strike WITH the lead on more than half their
  onsets, and 39.6% are a chord block rather than a line. A rhythmically-free
  partner is **54.5%** of files (67.3% correcting for pairs the extractor drops,
  38.9% under the strictest definition) against our **32.6%**: a gap of roughly
  **6–22 points, not the 88.8 vs 32.6 first reported**. Direction confirmed,
  magnitude much smaller. It also varies by platform — master system 20.3%,
  gameboy 33.8%, nes 35.2% vs ps1 69.9%, ds 71.4%, snes 58.2% — so on chip-era
  reference material a free second line is a MINORITY behaviour and must not be
  a default there.
  **The corpus norm is ONE companion locked to the lead's rhythm**, plus, in
  about half of files, one further free line. Our rhythm-locked companion is
  already the right shape.
  **REGISTER AND TIMBRE SEPARATE A LAYER; RHYTHM DOES NOT.** Striking with the
  lead is NORMAL (76.8%), so shared onsets alone are not a defect — **the defect
  is the same INSTRUMENT** (69.3% of second lines and 85.9% of trading pairs use
  a different declared GM family). This corrects r19/D100: the counterline and
  descant were one layer because they share a VOICE, and moving the descant's
  walk to the even bar changed the wrong variable. Separate by register and
  declared family first, rhythm second. The two register devices are distinct:
  the melody sits ~an octave off the harmony hand (median −12), while a companion
  runs in the SAME register a 3rd–4th away (42.8% of files; parallel thirds
  12.2%). **Density inverts with the lead**: when the lead rests the second line
  is DENSER (ratio 1.57, denser in 63.9%); when the lead runs continuously it is
  sparser (0.88). Drive companion density from the lead's measured activity, not
  a constant. Entry is early — 83.5% at or before the lead's first bar.
  Same sweep: our accompaniment resolves its non-chord tones 7x less often than
  the corpus (6.1% vs 43.6%), and corpus approach (48.7%) ≈ resolution (43.6%),
  so real practice brackets a non-chord tone with stepwise motion on BOTH sides —
  D101's law constrains only the exit and is half a constraint.
  **THE NCT *RATE* IS CONTESTED AND NOT ACTIONABLE; THE RESOLUTION GAP IS THE
  FINDING (r22).** This file briefly asserted "we use MORE dissonance" off a
  single source. Two references disagree — 31,652 vgmusic files say **14.1%**,
  the 26 MIDI files Ethan HAND-IMPORTED say **22.8%, identical to ours** — and
  neither should be treated as the reference:
  (1) DIFFERENT POPULATIONS. vgmusic is dominated by chip-era 2–4 voice files
  (the same split that gives master system 20.3% vs ps1 69.9% on free second
  lines); the hand-imported set is modern and dense (10.3 declared parts, 4.85
  concurrent). A thin texture has fewer chances to sound a non-chord tone against
  its own harmony, so part of the lower rate is a voice-count artefact.
  (2) LOOSER METHOD ON THE SMALL SET. It labels one chord per BAR from every
  sounding note, so a bar carrying two chords counts every tone of the second as
  non-chord — an unbounded inflation.
  **(3) THE RESOLUTION FINDING SURVIVES BOTH**, because it is a ratio internal to
  each file's own non-chord tones, so the population and labelling differences
  largely cancel: **63.6% resolved (hand-imported), 43.6% (corpus), 6.1% (ours)**
  — a 7x–10x gap from two independent sources. Fix resolution; do not act on rate.
  The per-ROLE split reads as a mechanism rather than a statistic: counter 69.2%
  resolved, bass 69.2%, lead 66.7%, acc 47.6% — and **the PAD is the outlier at
  9.4% non-chord and only 14.3% resolved.** The pad is the part that HOLDS rather
  than passes, and it is the one that does not resolve. That is the same law as
  "chromatic licence scales with realised motion" arriving from a second
  direction: a sustaining voice must be diatonic.
  **A companion is NOT more chromatic than its lead** in the corpus (37.4%
  lead-diatonic vs 40.4% the other way on companion-shaped lines) — that
  strengthens D100's in-key rule rather than licensing a loosening of it. And
  rhythmic independence buys no chromatic licence: out-of-key rate is FLAT across
  the whole independence range, so never trade one for the other.
- **CHROMATIC LICENCE SCALES WITH REALISED MOTION (r21/D102) — the mechanism
  behind D100's companion rule.** A barely-moving line parked on out-of-key
  pitches occurs **26 times in 15,813 files (0.16%)**, and narrow-RANGE second
  lines have a median out-of-key rate of exactly **ZERO**. So the corpus rule is
  not "never leave the key" but **a line that repeats or holds must be diatonic;
  one that MOVES may not be**. That reaches D100's outcome without the hard
  key-gate, and it explains precisely why his ear called the r19 companion
  "completely off key": it had parked on D# for 18 of 22 notes — a chromatic
  DRONE, the one shape the corpus essentially never writes. The current hard gate
  works and is judged; this is the better mechanism when it is next revisited.
- **Thirds-first for the companion SURVIVES; the categorical no-fourths ban does
  not (r21/D102).** With octave DOUBLING removed from the count (it was 21–23% of
  coincidences and had been folded into the "perfect" bucket), thirds+sixths beat
  fourths+fifths in every cut, **43.1% vs 33.1%** — so keep the ordering. What is
  unsupported is banning the fourth outright: the perfect FOURTH individually
  (17.3%) exceeds the minor third (15.1%).
  Horror is NOT thirdless (0.17 vs 0.18 baseline); its unease is mode, percussion
  ABSENCE and melodic chromaticism (0.107–0.111 vs 0.072 baseline, post-fix
  numbers). His ear still loved a thirdless device on vs_scary_cave, so
  thirdlessness is a DEVICE, not a horror default — and **31,652 files can say
  what game music DOES, never what Ethan LIKES.** Corpus is
  `research/vgmusic-atlas-r20.md`, analysis-only, gitignored, never fed to
  `src/lib` (D95 holds).
- **THE METRONOME TEST — measure the figure, don't name it (r21/D102).** A travel
  destination is rejected when `onsets/bar >= 6 && distinct shapes <= 1` (a pulse,
  not a texture) or `onsets/bar >= 12` (a gear change, not a texture).
  `fnd_power_fifth_8ths` is eight identical `R.5` tokens and it bound the MARIMBA
  for jungle's middle 16 bars — 124 attacks per 8 bars, 5 patterns, the 8-bar
  block repeating verbatim. **No rhythm form can rescue a monotonous figure**: on
  straight 8ths `fill` finds no gap, `walk` no hole, `push` collides, so `hold` is
  the only survivor, the composite comes out salt-INVARIANT, and `effStmt`
  collapses it to statement 0 — every statement identical. I tried FOUR variants
  of `hold` first and each traded repetition against density; all reverted. Fix
  the SELECTION, not the variation. The second clause was forced by the first:
  excluding only single-shaped pulses moved jungle to `fnd_arp_16ths_drive`,
  denser still, because `SERIOUS_FND_CLASSES` permits `arp` — D100 said a
  whitelist encodes "not playful" and is silent about GROOVE; it is equally
  silent about GEAR. **A list of forbidden names has now failed five times.**
- **Long sections need splitting, not just salting (r21/D102).** D97 salted by
  letter-statement count, so A B C B* gives statements 0,0,0,1 and three of four
  sections share one composite. Salt is now keyed on the SECTION, and a section of
  8+ bars splits in half at `4*floor(bars/8)` so every piece stays on the 4-bar
  grid. A 4-bar composite cannot develop across 16 bars however it is salted.
  Also: 2-bar figures had NEVER received an interval rewrite (only 1-bar ones
  did) — it is now composed onto the rhythm block, keeping the composite at 4 bars.
- **`pinFrom` beats feature-pinning (r20/D101) — the keep-transition law, 3rd
  bite.** A fresh PROSE KEEP was judged on the UNKEPT path, so acc variation,
  travel rotation, melody grammar and descant placement were all live in what he
  praised. `grammarPin: true` switches all of them off at once: the byte compare
  caught somber_space's lead going from two held notes a bar to nine, destroying
  the "pad warping thing" he'd just said he loved. Pinning feature-by-feature is
  how that gets missed (six flags, seven next round). `pinFrom: 'r20'` states the
  intent — rules from this round on do not reach this song — and generalises.
- **A suspiciously clean number is a bug until proven otherwise (r20).** Three
  wrong measurements in one round, one of which I acted on before checking:
  `chordCoreTones()` returns a **Set**, so `.map` threw into a swallowed catch
  and reported a beautiful "0.0% non-chord tones"; an "accompaniment = busiest
  voice below the median pitch" heuristic silently measured kalimba textures and
  synth basses on most songs; and a top-voice-to-top-voice step test scored a
  genuine walk as a REGRESSION, because the chord re-enters as a block whose top
  is the 5th — it cannot see an approach into the bass. When a probe and a
  feature disagree, read the emitted notes.
  **r21 adds two more, both from the corpus work.** (a) A feature computed from a
  SINGLE best-scoring pick per file understates prevalence by roughly the
  candidate count — measured at 8.5% single-pick vs **43.5% all-pairs at the
  identical window** (median 4 candidates). "One second line per file, chosen by
  most co-onsets" systematically picks the dense harmony hand and hides
  everything else. Scan all pairs. (b) An adversarial verify pass over the
  corpus's eight headline claims **weakened or refuted SEVEN of eight**, and the
  corrections were more useful than the originals. Treat any single-source
  measurement — including one that arrives already written up — as provisional
  until something independent has tried to break it. Two figures reached this
  file before that happened and both were wrong.
- **Sections change over time (r16/D97, his ask)**: "how sections change over
  time". A returning letter is keyed and seeded by its STATEMENT NUMBER, so A
  at bar 24 is not A at bar 0. Statement 0 keeps the unsalted seed. The split
  is gated on `accVaryOn` — keying the combo changes the MIX STRING even when
  the bound expression is identical, and an ungated split moved a KEPT song.
- **The engine had never played a 4th, 6th, 7th or 9th above its own bass**
  (measured r16: 99.3% of all accompaniment notes were {0,3,4,7}; the canon is
  98.8% R/3/5 tokens). His references use 11 and 12 interval classes. `4/6/9`
  resolve against what the chord carries, `s2/s4/s6/s7` against its
  chord-scale, so neither can spell a foreign pitch.
- **Foundations think in SCALES, not only chords (r15/D95, his ask)**:
  "instead of purely thinking in chords, also think in scales. the possible
  different kind of scales combined with the chord, and the intervals on
  those chords you'd use as the foundation (whether in chord form or rising
  form or whatever form)." Figure tokens `s2/s4/s6/s7` resolve against
  `chordScale(sym, key).pcs` relative to the chord ROOT, so a figure lands
  in the scale the chord actually implies (harmonic-minor leading tone over
  a bVI, b9 over a V7) rather than in generic chord tones. The embellish
  palette grew to five forms — the three above plus RISING FORM (an s2
  pickup on the last 8th) and SCALE CLUSTER (`5.s2` / `3.s6`).
- **Melody is CHORDAL and HELD (r17/D98, his reel note)**: "notice how melody
  is chord too not just one note, and the melody is held not very jittery". The
  lead was 100% monophonic — 8137 haps at 8137 distinct attack times, never two
  notes at once. `chordTop` thickens the BAR'S LONGEST note (>=1 beat) with a
  tone from the BAR's chord: prefer 3rds/6ths, never a 4th (it stacks quartally
  against a pad), never the same pitch class (that is an octave double), floor
  G3, and scale the attack by 1/sqrt(2) or two notes at one gain read as a
  +3dB accent. NOT on choir leads (D93's gender-seam rule). `heldFirst` +
  `minNote` do the "held" half — melody-cell retrieval ranked by ONSET POSITION
  only, so longer-noted cells at the same density were invisible to it, and
  because `tokens()` is legato, dropping a short onset makes the previous note
  HOLD rather than the bar merely thinning.
- **Four-note chords are the target (r17/D98)**: "see how the chord is four
  notes not your typical chord". The acc struck four notes on 0.11% of attacks
  and ONE note on 74.3%. Inversions are TOKEN ORDER, not symbols — `3.5.s7.R+`
  is literally Dmaj7/F#. Slash SYMBOLS are a silent trap: `chordTones` returns a
  plausible set so lint passes, `chordRootPc` returns the UPPER root so
  bindFigure renders root position, and `chord("D/F#")` throws outright because
  mini-notation reads `/` as slow.
- **Changes must not be section-locked (r17, HIS ASK, NOT YET BUILT)**: "changes
  not just in strict section bar, and also changes an a unique way". Measured:
  139 of 139 layer entries land exactly on a section start. His references show
  the mechanism — a repeated chord returns with its voicing ROTATED one position,
  and a top voice is ADDED on every second pass of an unchanging loop. Both are
  2-bar-period changes with no section boundary involved.
- **THE ERRATIC NOTES ARE THE BAR'S LAST ONSET (r28/D118).** His most-repeated
  complaint, five cards in one export. Measured over 23 songs: **1185 notes are a
  16th or shorter and 1003 (84.6%) are the bar's LAST onset — all 1003 in the
  bar's final 16th slot.** Every one. Cause: `minNote` exempts
  `i === notes.length - 1` unconditionally, so a 16th hanging off the barline is
  the one short note the floor can never remove. `minNoteLast` (bind.js, OPT-IN —
  47 judged songs call bindMelody) lifts it; `opts.noJitter` threads it through
  the whole melody family at once, because 81.9% of the offending notes are one
  lead gesture plus its `_octave`/`_companion` copies. Isolation pair: **204 → 84,
  a 59% cut**, with overall short-note density unchanged (2.390 → 2.385). `_acc`
  contributes ZERO — when he says "bursts in the left hand" he is hearing the
  OCTAVE PARTNER, which is the tune an octave down. **Jitter is an ONSET-SPACING
  question, not a duration one**: measuring sounding length scores a staccato 8th
  as erratic and put one song at 3.8/bar with no extra onsets written.
- **`minNoteLast` COMPLETIONS (r29/D119).** Two gaps in the r28 fix, both
  measured: (a) `arrange.js` forwards `leadOpts.minNote` but NOT `minNoteLast`, so
  the lead dropped its final 16th and its own cast copies kept it — his "sometimes
  sounds like a 16th note off beat"; (b) bind.js's `if (keep.length >= 2)` guard
  fires MORE often with `minNoteLast` on, and each firing abandons the thinning
  entirely, so the bar keeps EVERY onset — one layer went 3 onsets a bar to 8 and
  cast density 2.38 → 3.30. The guard now falls back to thinning the interior and
  keeping the last note. STILL OPEN: on a 3-onset bar the final 16th cannot be
  dropped without leaving one note; that case needs a MERGE into the preceding
  held note, not a drop.
- **Melody**: consecutive same-pitch notes MERGE (melody only); antecedent
  phrase-finals land 3rd/5th, never the 7th (cadenceNo7); over a
  foreign-root chord the melody SPELLS the chord (chromCore); jitter is
  DURATION as much as count — holds + articulation floors cure "hyper",
  thinning alone measured only -32%. In 2/4 the per-bar density target
  halves (bars are half as long). **The cadence tail is GONE (r15/D95, his
  ruling): "i dont think the melody tail should be rotated, it should just
  be removed because it just doesnt sound that good"** — `tailOff` keeps the
  full cell on cadence bars, no thinning and no held final; only the
  landing-pitch grammar and the breath remain. **r16 CONFLICT, unresolved: his
  triage answer clicked "actually keep the tail", reversing the above.** Both
  builds exist (`audition/songs.html` ships the removal,
  `audition/songs-tailkeep.html` is the other). Measured on real songs the tail
  costs 13.7% of the melody notes overall, 0% to 31.7% per song. Do not flip
  `tailOff` until he settles it on real material. (It replaces D94's
  tailVariety rotation, which replaced the fixed thin+held tail he called
  "really overused ... in many other songs" — the shape itself was the
  problem, not its predictability.) D94: leaps beyond a 7th fold by octaves
  toward the previous note (leapFold — chromCore chord-spelling wrote
  +21/+24 zigzags). Both gate on grammarFresh (!priorKeep && !grammarPin),
  NOT on a pinned melodyGrammar.
- **The lane law (D94, restructured r18/D99)**: serious lanes
  (manor/catacombs/citadel, desert, jungle) refuse the playful defaults — no
  sparkle, no funk bounce, no chip-lead casts. **A NAME blacklist for
  foundations is dead: it failed twice (r16's jungle alberti, r18's
  arp_16ths + wide_oompah) because the set of playful figure NAMES is
  open-ended.** A serious lane now states the CLASSES it PERMITS —
  `pulse, sustain, block, broken_octave, arp` — in pools AND travel edges
  AND THE TEXTURE PATH AND ITS FALL-THROUGH CHAIN (r19/D100: r18 wired the
  whitelist to the first two only, so all three catacombs songs still bound
  `fnd_offbeat_chords` as a texture and he caught it on two cards — "the piano
  on the offbeat (the & of every beat) makes it sound less serious". Serious
  lanes take `block` there; the `comp`/`riff` fall-through is lane-aware too).
  dance_bass / oompah / guajeo / riff / comp / walk / fingerpick / offbeat are
  simply not in its vocabulary. The name blacklist survives only for the
  within-class exclusions (alberti, arp_16ths, broken_tenths in horror).
  **THE WHITELIST ENCODES "NOT PLAYFUL", NOT "NOT GROOVY" (r19/D100).** `block`
  is permitted, and `block_quarters` on a dread song is four-on-the-floor — 384
  attacks, every quarter of all 32 bars, which is what he heard as "an evening
  disco dance ball" (his locating note: "scary citadel's harmony is like groovy
  synth rhythm" — never the drums, where I looked for two rounds). A dread lane
  wants its harmony SUSTAINED. Class is not rhythm: check the onset profile.
  **A LIST OF FORBIDDEN NAMES HAS NOW FAILED FOUR TIMES IN THREE ROUNDS**, and
  three of those were opened by the fix for the previous one — most recently
  inside this round's own work, when the vibraphone joined a companion pool and
  the octave cap's regex did not know the word. Clamp by DECLARED DATA
  (`INSTRUMENTS[sound].range`) or by ROLE; enumerate what is PERMITTED; and
  after fixing any list-based rule, immediately measure what the newly reachable
  options are.
  **Every NEW structural rule needs BOTH `!priorKeep` and `!opts.grammarPin`
  (r18/D99).** Two rules this round shipped with only the first and each moved a
  prose keep: the travel rotation moved both, and the bare-intro cap shortened
  goofy_casino by 4 bars. A prose keep is a keep.
  **Travel destinations are hash-ROTATED per song, family-deduped (r18/D99):**
  `edgesFrom[i]` took declaration order, so any two songs sharing an acc figure
  walked to the same destination and one song's B/C/D walked to three figures of
  the same family — measured, arp-family was 55% of all travel destinations over
  only 13 distinct figures, and his ear called it "overused and not varied at
  all" on four separate cards. Gate the rotation on `priorKeep || grammarPin`.
  **Cast voices too**: the retint must cover bright reeds/flutes/mallets, not
  just chip voices — the planner handed both manor songs an oboe straight from
  the palette ("the high oboe doesn't fit at all"; "the flute started being the
  melody"). Manor's voice is the CELLO, catacombs' LEAD is the cello (the solo
  violin carried the tune and read "giddy" on all three of its songs). **r16: the jungle arm was
  missing `alberti` while horror and desert carried it — his ear caught it on
  two separate cards ("just another default Alberti"). Blacklisting alone is
  NOT the fix (measured: it drops both songs to octave 2 and doubles the
  acc/bass unison); the lane binds a written `jungle-vamp` and holds its acc
  hand at octave 3 so the tumbao bass keeps the low end.** Textures stab on
  pizzicato/harpsichord (horror) or marimba (desert); horror default leads
  are violin (catacombs) / church organ (citadel) / dark piano (manor);
  handoff pools are lane voices (desert: shanai/oboe/sitar — never
  epiano/vibraphone).
- **AN OCTAVE PARAMETER IS NOT A REGISTER (r28/D118).** `bindFigure` seats a
  figure at `C<octave>` and stacks the chord member on top, so `octave: 3` with a
  `5` token realises a fifth higher than the same octave with an `R`, and
  `bindMelody` realises differently again. Two layers on distinct octave
  parameters can land in the same actual band; with 5-6 layers against 3-octave
  instrument ranges no allocation fixes it. **A support-layer allocator must
  search DOWNWARD first with a hard ceiling under the lead** — a symmetric
  "nearest free octave" search resolves collisions upward, i.e. toward the tune,
  and measured it put the hold/move layer at midi 94-101 against a lead at 66 on
  12 of 14 songs (the frozen slot's own r23 defect, reproduced). Verify D77 on
  REALISED medians, never on the request.
- **Registers**: energetic songs leave the piano (synth acc/leads) UNLESS
  the vibe is piano territory (goofy/comic/playful/quirky/silly/whimsical
  moods or solo/duet/trio anchor). One low voice at a time. Bare sine at
  octave 1 is inaudible — synth bass at octave 2.
- **Dynamics**: pads BREATHE (per-bar waves) but transitions must be
  gradual — a 1.6× band jump reads as "suddenly really loud" (padWaveCalm
  exists). Strings support = whisper — but the number in this file was wrong: the
  SHIPPED string layers measure 0.162-0.258 (counterline `[0.12,0.24]`,
  descant `[0.15,0.28]`), and the only band at or under 0.1 is the manor b2
  rub's `[0.08,0.14]`. The law that actually holds is RELATIVE: support stays
  under the lead (D77). "Too loud" came four rounds running, so treat the
  counterline floor of 0.162 as the ceiling for a new support texture. Lead gain ceiling 1.0 for formulas; per-song opts
  may reach 1.15. The x1.35 boost = +2.6dB, and 1.35 overshot once (rest).
- **Intros**: pre-melody intros cap at ~16 seconds any tempo, whole-loop
  shrinks, one-loop floor; at ≤60bpm they DROP entirely.
- **Meter: 4/4 only** (D92 ruling — "avoid 2/4 and just stick with 4/4").
  The generator re-maps any 2/4 vibe to 4/4 at compile time. Exception:
  goofy_kitchen was kept IN 2/4 and stays as judged. Never author new
  2/4 material.
- **Handoffs stay** (D90): letters hand off between instruments at
  complete-statement boundaries; never remove handoffs to feature a voice.
  String melodies are a PALETTE (strings-first handoff pool on
  string-friendly vibes; solo string leads); "not one synth playing the
  melody the entire time" — non-A letters bind the partner synth
  (varyLeadVoice, voice-only on kept songs).
  **`HANDOFF_POOL` IS A SECOND PLACE THE LEAD VOICE IS CHOSEN (r19/D100).**
  D99 moved the catacombs LEAD off the violin for his "the violin taking the
  melody made it not as much scarier" and left the pool alone, so the violin
  went on taking the whole tune on every non-A letter — four cards before it was
  found. Changing a lane's lead means changing `horrorLeadDefault` AND
  `HANDOFF_POOL` AND the companion pool; a voice removed from one arrives
  through another, and dropping a cast layer RE-ROLLS `castSounds` so the
  companion can land on the very voice just banished (it did, on four songs).
  Audit voices per song after any cast change, not just the byte compare.
- **`melody_backup` is a DOUBLER by declaration (r19/D100)** — arrange.js says
  "doubles the lead line so it reads louder and wider without adding any new
  rhythm". Louder-and-wider is an anti-goal in an atmosphere lane, so horror
  does not cast it: his verdict was "the melody is super loud (not dissonant)
  and completely harmonic in the violin like a lead singer which destroys the
  atmosphericness", measured at 36 of 48 violin notes on the lead's exact pitch.
  `melody_takeover` is DIFFERENT and stays — it genuinely takes over (somber
  manor: 20 instants alone, 12 alongside, 0 at the same pitch).
  **MEASURE LAYER OVERLAP IN THE MIX, NOT THE SOLOS**: solo bindings are
  unmasked, and a solos-only pass overstated the doubling as 19 of 38 songs.
- **Desert = Phrygian dominant**: bII hard against the tonic + the raised
  third (Hijaz). All-minor Phrygian read "dark, not desert" to his ear.
  Serve trope progressions RAW — the variation pass dilutes them.
  D93 additions: desert pins family MODAL whatever the emotion says (the
  emotion's family override re-created "dark, not desert"); desert is DRY
  (no damper-pedal wet room); the floor is hand-drum iqa' (ayyub/maqsum/
  masmoudi on vc_darbuka) + the NSMB marimba broken-fifth 16th ostinato;
  sitar/shanai/oboe leads; slide-off flourish stamps at A-starts. Even
  somber desert keeps masmoudi dums — deleting all percussion tips it
  into space (opts.percPresence resurrects an emotion-zeroed floor).
  r16 adds TWO more tropes: `shuttle` (NSMB's planed bII maj7 — C^7|Db^7, with
  the departure chord Db7 not the reference's Eb^7, because he heard Eb^7 as "a
  bit too harmonious"; Db7's b7 is B natural, so it pincers the tonic from both
  semitones) and `drone` (NSMB's thirdless eight-bar A section — OPT-IN ONLY,
  never in the hash pool, because "don't lock all desert to be this"). Also
  r16: `nsmb_doum`, the floor whose deep drum refuses beat 1, added ALONGSIDE
  the iqa' patterns — the blocker was the drum SELECTOR, which took one
  low-band pattern and capped at two.
  D94 (researched, research/progressions-desert-jungle-r14.md): THREE
  tropes served raw, pinned via opts.desertTrope — gerudo `0:m 8b 10b 7:7`
  (melody harmonicMinor), hijaz `0 1b 5:m 1b` (MAJOR tonic against bII;
  melody phrygianDominant), legacy (the clicked bII exemplar). The melody
  KEY follows the trope's lane. The desert acc hand never plays piano
  (drone figures → gm_pad_bowed, moving → gm_marimba); under 80bpm the
  floor runs its SLOW 8th variant instead of dropping.
- **Jungle (D94)**: modal VAMPS served raw (dorian `0:m7 5 7:m 5` or the
  Stickerbush minor wash), never functional pop loops; melody supply
  dorian/minor (pentatonic-leaning); acc voice gm_marimba (DKC); bass =
  round jungle tumbao on synth bass (R / 5 on and-of-2 / octave on 4) —
  the slap bounce "doesn't work". Kalimba textures are the lane voice.
- **Horror dosing (D93)**: ONE harmonic-dissonance device per song over a
  consonant floor; the rest of the budget is TIMBRAL (ghost pad, tremolo,
  ambience beds). Lanes: manor = ambience (<=75bpm, fragmented lead, beds
  + 1-2 one-shot stingers), catacombs = action (near-consonant ostinato,
  war drums, breakdown re-entry riser+impact), citadel = epic (the MOST
  tonal — organ/choir/lament; Bloodborne law: tonal theme + gothic
  timbre). His hx_* files: loops = beds (re-trigger every ~file-length
  bars, gain <=0.2, a third of songs roll none), short ones = play ONCE.
  D94 devices (dosing intact): catacombs = off-chord STINGERS (solo
  violin/cello b9/tritone at ≤3 section seams) + chromatic descent
  (12-11-10-9 cello, departure sections); manor = opts.b2rub (whisper
  minor-9th ghost-pad shimmer, interior sections). A horror song whose
  modal retrieval lands a BRIGHT major trope reads lullaby, not
  mysterious — pin family minor (opts.family).
- **Choir (D93)**: SSO chorus (gen/choir-{male,female,mixed}.sfz + pitched
  browser maps). Writing rules: merge repeats, breath gaps, steps not
  runs, one side of the G4 gender seam per line; chant = detached unison
  (vs_somber_citadel's lead); opts.choirPad forces a choir pad.
- **Drums**: his vouched dp_* patterns where the vibe note matches; melody
  outranks drums; cymbals sit far back.
  **KNOWN BUG, NOT YET FIXED — AND THE r22 WORDING WAS TOO STRONG (corrected
  r28).** The DEFAULT selector is `[byBand('low') ?? pats[0], byBand('high')]`
  capped at two, so none of the 12 mid-band patterns — `backbeat_ghost` among
  them, i.e. the SNARE/backbeat — can be chosen **by it**. Re-measured r28 on the
  judged page: of **33** songs carrying banded drums, **26 low, 12 high, ZERO
  mid**, so every kit in `audition/songs.html` is still kick+hat with no snare.
  But "structurally unreachable" is wrong — **`opts.percBackbeat: true` reaches
  it**, and the pages that pass it get a mid backbeat (vanriver: 14 mid across 11
  drum songs; layerstack: 2 of 2). So the fix for the judged suite is to decide
  the DEFAULT, not to build a mechanism. Same shape as the r16 second-low-band
  bug.
  Fixing it moves the drums on ~27 songs and invalidates their HQ renders, so it
  is a deliberate round, not a drive-by — and the fix must decide whether mid
  REPLACES high in the second slot (keeps density, his "drums too loud" note) or
  becomes a third pick (fuller kit, more density).
- **THE REPEATING-INTERVAL ENERGY FIGURE (r30/D120, `opts.synthRise`)** - his
  ask twice over ("the percussive strings I mentioned with their repeated
  intervals + percussion and boom"; "some given intervals and it repeats those
  intervals over and over to convey energy"). Measured off the Synthesia example
  he left: **138.4 BPM, straight 8ths (median IOI 0.2160s = exactly one 8th), a
  3-4 note DESCENDING cell filling half a bar and repeating** - `5 3 s2 R` in
  minor, `5 s2 R` in major. **THE CELL DOES NOT FOLLOW THE CHORD**: one 3-note
  cell plays unchanged over FIVE different basses. That is R2 (freeze the body)
  confirmed by a source completely independent of the r22 reels, and it is what
  separates this from `motorFall`, which plays the same descent but rebinds every
  chord. Frozen PER SECTION (song-long is D100's rejected drone). NOTE: he calls
  it a "rise" and the reference DESCENDS every time - what rises is the re-attack.
  At `octave: leadOctave` it realises 7-12 semitones ABOVE the lead (bindFigure
  seats at C<octave> then the `5` token adds a fifth) - use `leadOctave - 1`.
- Sparsity is a legitimate ensemble shape. Repeated uniform anything
  (chords, ornaments, dynamics) reads as "a piano exercise".

## r16 capabilities added (all opt-in per song)

- `opts.swing` — a RATIO (0.585 = get_proto's measured swing). Emits
  `.swingBy(2*(ratio-0.5), beats*2)` on the mix and every solo. subdiv MUST be
  `beats*2` to swing 16ths; passing 16 is a silent no-op. Onsets shift,
  durations hold (measured: 2057 haps in / 2057 out, duration 530.000 both).
  Never fake swing by subdividing and padding with rests — that is what made
  the r15 demo's notes 6x too short, which he heard immediately.
- `opts.wobble` — a P4 dyad pincering the root a semitone either side, whisper
  gain, interior sections. His: "conveys tension and can also be used outside
  of desert too".
- `opts.choirPincer` — the S.C.A.R.Y. device: choir a semitone above and below
  the root in alternate whole bars, never resolving. Suppresses the stingers
  and chromatic descent, because ONE harmonic device is the law and catacombs
  was measured running two at once on all three of its songs.
- `opts.horrorOstinato` — Boiler Mushi's `R 5 ~8 5`: thirdless, diatonic, at
  accompaniment volume. The measured spook there is MELODIC semitone motion in
  the acc hand (50.7% of its steps), not vertical dissonance — the bars he
  called spooky carry zero sustained m2/m9/M7/tritone. Repetition is not the
  spook; the semitone inside the repeated cell is.

## Local samples (D93 — the sample-hosting story)

src/lib/sample-pack-def.js is the single source of truth (hx_* = his horror
pack in audios/horror-fx/, vc_* = VCSL/VSCO percussion, choir_* = SSO
pitched). `node scripts/build-sample-pack.mjs` emits audition/sample-pack.js
(mp3 data-URIs, loaded by a sibling script tag — file:// cannot fetch).
**r16 correction: sample-pack.js is NOT committed and never has been** — this
file and the pack's own header both claimed otherwise. It is now gitignored by
decision, which is what his r16 licensing ruling ("local-only, never
committed") requires for the ripped BRR rows it carries. render-hq.mjs has a `wav` backend that
places the ORIGINAL wavs at hap times (deterministic round-robin). Percussion
rhythms may carry per-onset `sounds` (a dum and a tak are different drums).
INSTRUMENTS entries may declare `envOnly` — new voices cast only in their
environments, so palette growth cannot re-roll existing songs. New-env count
pins live in test/vibes.test.js (23) and test/songs.test.js (43 songs).

## Render tier (HQ)

`scripts/render-hq.mjs` (one song) / `render-hq-pages.mjs` (batch):
haps → per-sound stems → sfizz (Salamander piano, VSCO strings/winds,
`vendor/sfz/gen/*.sfz`) + DawDreamer+Surge XT for synths
(`vendor/patches/*.fxp` — VST3 preset wrapping + 0.3s warmup, D85) +
fluidsynth fallback → ffmpeg mix (-16 LUFS). Gains export as MIDI velocity
(velocity = hap gain × velScale, absolute, never stem-normalized). Notes
outside an SFZ's key range FOLD by octaves (D83) — watch the render log.
Only re-render songs whose mixes changed; wavs land in `audition/hq/`.
Surge patches must come from the release tag matching the vendored build.

## File map

- `scripts/render-vocal.mjs` (r34) — the VOCAL tier: `export-vocal.mjs`
  (the `_lead` solo as a monophonic score, sung only in bars where the MIX
  plays the tune, octave-placed into a singer's range) -> `vocal-sing.py`
  (a DiffSinger voicebank's ONNX models run directly with onnxruntime; its
  pitch model writes the sung f0) -> `vocal-convert.py` (RVC timbre, pitch
  and timing pass through) -> `vocal-verify.py` (pyworld f0 vs score: %
  frames within 50 cents, octave errors, rest leak) -> `.withvocal.wav` over
  the HQ mix. Everything lives in gitignored `vendor/vocal/` (py3.12 venv,
  Tiger voicebank, RVC models). Stage 2 needs `KMP_DUPLICATE_LIB_OK=TRUE
  OMP_NUM_THREADS=1` or RMVPE segfaults (two OpenMP runtimes). The page's
  `vocal` flag is set ONLY when the file exists — no other song's DATA moves.
  `src/lib/lyrics-ja.js` (r34, his "vary the lyrics a bit more - learn from
  miku songs") generates one Japanese mora per note from a word POOL picked
  by hash (song name + phrase signature) — a retrieval pool under D95, so
  growing the word list re-rolls unpinned lines. `VOCAL=1` builds
  `audition/vocal.html` (his "suite ... mostly energetic"): vx_* songs with
  `opts.vocalLead` (the instrumental lead + doublers at a x0.45 guide, the
  masks untouched) — page-only, no judged song carries it. Render with
  `render-vocal.mjs <name> --page audition/vocal.html --vocal-db 0`.
  SING FROM `_lead_mix` (the lead as the mix plays it + any melody_takeover
  layer's masked part), never the `_lead` solo — the solo is a loop that
  diverges from the mix in later letters (42 of 96 notes on tense_fight).
  Phrase in 2-bar lines with a breath trim; place each PHRASE by octave.
  ONSET LAW: the singer's CONSONANT precedes the beat; the VOWEL lands on it
  (measured by pitch arrival, never by amplitude envelope).
  BALANCE THE VOCAL IN THE SUNG SPANS (+3 dB over the band's RMS there; his
  per-song pins are `vocalDb` on the VX_PROMPTS row), never by whole-song
  LUFS — that put it 1-3 dB under the band and he "didn't hear the vocals".
- **ELECTRIC GUITAR (r34, his ask).** `opts.guitar` (page-only): J-rock
  figures bound over the song's chords at octave 2 — verse = palm-muted 8ths
  (`jrock-mute8`) or a 16th gallop, chorus = open R.5.R+ 8ths, ballad =
  clean arpeggio; sounds `gm_electric_guitar_muted` / `gm_overdriven_guitar`
  / `gm_electric_guitar_clean` (INSTRUMENTS entries with `envOnly: []`, so
  the planner never casts them). HQ: Unreal "Standard Guitar" SFZ (DI,
  keyswitched — `sw_default` is SILENT, render-hq injects the `keyswitch`
  note first) then a NAM capture via scripts/guitar-amp.py (`fx.nam` in
  hq-instruments.js; legacy 0.5.x .nam layer configs are converted on load).
  Measured: the amp collapses the DI's crest factor 26 -> 12 dB.
  **HIS VERDICT ON THE FIRST PASS (r34): "in the current songs, guitar fits
  pretty well as a subtle layer i like it actually. take note of this."**
  The subtle rhythm guitar under the voice (mute 0.40-0.50 / open
  0.46-0.58 x leadGain) is a LIKED default — keep it that quiet on
  vocal songs; `guitar: 'main'` (D137) is the separate, louder, genre-
  gated mode with the intro riff and the final-chorus melody double, for
  J-rock / anime-opening / power-pop / Vocaloid-rock / city-pop lanes only.
- **REAL LYRICS ARE GRAMMAR + A MELODY BINDER, NEVER A LINE TABLE (r36/D141).**
  His "currently, our vocaloid produces random japanese syllables. it should
  actually produce real japanese lyrics, of course with parts bound to the
  melody". `src/lib/lyrics-ja-writer.js`: templates x tagged lexicon x verb
  conjugation write one clause per 2-bar phrase; a bunsetsu never crosses a
  rest (segments cut at 0.4 beat), a long note gets a word end or a held 'ー',
  the chorus is keyed by ordinal (same words every statement), the verse by
  statement, the prompt/description picks the words. Vocal-page songs carry
  `sections` (spread-gated on `opts.vocalLead`; songs.html 47/47 identical).
  D137 on the text side: a test fails on any lexicon entry longer than a word.
  NEVER pre-export a score into audition/hq before a render — render-vocal's
  re-sing check reads the on-disk syllables and would keep the OLD dry wav.
- **r35 — HIS FIRST VOCAL-PAGE EXPORT (D138), the laws it wrote:**
  - **THE SINGER'S CEILING IS G#5 AND IT IS DURATION-AWARE.** Both "sounds
    like screaming" notes were A5 held 0.70-0.74 s; A#5/B5 at 0.2-0.4 s, G5
    held 1.8 s and G#5 held 1.2 s passed. export-vocal folds
    `midi > hi+4 && dur >= 0.5 s` (A5 and up, held).
  - **A CRESCENDO SAMPLE PEAKS AFTER ITS ONSET — PLACE THE PEAK, NOT THE
    START.** vc_cym_cresc's three files peak 1.44 / 3.57 / 7.06 s in; the
    wav backend round-robins them, so a beat-4 "lead-in" peaked bars into
    the next section ("random cymbal in the middle of the section"). And
    `battle_crash` is an 8-bar CELL counting from the drum mask, not the
    form. r35-fresh battle songs stamp `vc_cym_cresc:0` 1.44 s before each
    drop's downbeat (same index in both tiers). Any one-shot with a rise
    needs the same treatment.
  - **THE GUITAR PLAYS STACCATO.** Five cards: every complained part was the
    ringing open chorus through the crunch amp; every praised part was the
    palm-muted verse ("staccato good, octave alternation good"). Unpinned
    songs: chorus = muted octave chug (B) / 3+3+2 push (bridge letters),
    riff/double muted, room 0.06-0.08. `guitar: false` where it "doesn't
    fit the genre" (happy shop, excited festival). `guitarGainMul` trims.
  - **THE VOCAL BALANCE LAW IS HIS EAR, NOT A MEASUREMENT.** K-weighted
    vocal-over-band did not separate "too loud" (boss 5.2 dB) from "love"
    (casino 5.7 dB). Rows: energetic 0 dB, calm +1.5, with pins.
  - **A KEEP CLICK ON A noteBlind PAGE NEEDS `keepFresh`** — the click
    flips `priorKeep` and `ruleFresh(N)` retracts every rule the song was
    judged with (D91's fifth bite). `keepFresh: true, pinFrom: 'r35',
    voicedColor: true`; verify by byte compare (snow moved only in `_acc`).
  - **`nFixed` WAS A CONSTANT INDEXING A VARIABLE-LENGTH HEAD** — the
    vocal guide wrapped a neighbouring part and left jungle's kalimba
    takeover at 0.89 ("random fast … glitching"). Index from the running
    count. And gate a BUG FIX with `ruleFresh(35)`, not the niche-gated
    `r35()` — the bug was found on a niche lane.
  - **TWO STRING-PATCH DEFECTS OLDER THAN THE VOCAL TIER.** (a) VSCO's
    soft sustain layer SWELLS: half-peak at 1.1-3.2 s, 90% at 4.8-6.7 s — his
    "starts really soft and then becomes really loud" and "violin much too
    loud" are the same sample; build-sfz measures each file and writes an
    `offset` (t50 0.92 → 0.04 s on a held C5). (b) **strings-sections.sfz
    had NO VIOLIN REGIONS since D80** (27 cello + 6 viola): the violin
    section tops at D5 like the viola, and autoSplit left it nothing — every
    rendered "violin" was a stretched viola. Zone order cello → violin →
    viola. gm_french_horn is on VSCO (horn.sfz), off the swelling GM patch.
  - **Render tier:** `render-hq --reuse-stems` (keyed stem cache, byte-
    identical remix), `render-vocal --rehq`, and a changed score re-sings
    by itself. Two D137 entries exist in the ledger (the other session's
    toppack read-out); the vocal export round is D138.

- `scripts/audition-songs.mjs` — the song generator (SONG_OPTS at the
  bottom = per-song pins/asks; every engine rule lives inline with its
  D-number and his quote).
- `src/binder/bind.js` — bindFigure/bindMelody (the melody walker, cadence
  + chromCore grammar); `src/binder/arrange.js` — the planner/arranger.
- `src/lib/verdicts.js` — GENERATED by import-verdicts.mjs; never edit.
- `src/lib/techniques.js` (r20/D101) — extracted craft as DATA, one row per
  technique: intent, the reel + second it was read from, his verbatim words,
  applicability conditions, and an honest status (`wired` + impl pointer, or
  `recorded` + what blocks it). His ask: "i want to do this in a way that every
  analysis isnt wasted but also isnt hardcoded though". **Rows are addressed by
  NAME only — never iterated or length-indexed** (a test enforces this), so
  adding one can never re-roll a song the way a retrieval pool does (D95). That
  property is what makes recording an analysis cheap. Currently 5 wired, 7
  recorded-and-blocked. NOT yet migrated: the variation FORMS are still a
  hand-written list picked by hash, which is the remaining hardcoding.
- `src/lib/progressions-serum.js` (r28) + `LAYERSTACK=1 node
  scripts/audition-songs.mjs` → `audition/layerstack.html` — the Serum
  producer's genre, with all seven `research/reel-layers-r22.md` rules wired
  (R1 `reregister`, R2 `frozenSlot`, R3 `holdMove`, R4 `r28Band()`, R5
  `doublePeriod`, R6 `coprimeCell`, plus `finalBarBreak` and `motorFall`).
  Casting R2 needs the lane rub budget RAISED — priced as an isolation pair at
  +38% close semitone/tritone hits per bar.
- `src/lib/layer-patterns.js` (r31, re-transcribed r32) + `REELS=1 node
  scripts/audition-songs.mjs` -> `audition/reels.html`. His 8 layer-stacking
  reels as DATA: `LAYER_PATTERNS` (one row per reel instrument — rhythm, interval
  shape, register, gain-vs-lead, frozen-or-re-pitched) and `REEL_PROGRESSIONS`
  (the chords AT THEIR MEASURED HARMONIC RHYTHM via `chordBeats`). Rows are
  addressed BY NAME, never iterated, so adding one cannot re-roll a song. The
  page is FAITHFUL (one card per reel, `opts.reelFaithful`) + CROSSED (layers
  mixed across reels over a reel's own harmony, picked by `comboScore`) + a
  DEVICE A/B.
- `src/lib/song-labels.js` (r30) + `ENERGY=1 node scripts/audition-songs.mjs` ->
  `audition/energy.html` - his SONG labels (which prompts a finished song also
  serves) and the energy A/B: each labelled core as judged, and the same core plus
  `synthRise` + marcato + percussion, both built under ONE hash name.
- `src/lib/vibes.js` — prompt → vibe compilation.
- `scripts/audition-triage.mjs` + `src/lib/triage-r15.js` — the EAR-TEST page
  (D95): the questions an analysis cannot settle, each with the measurement
  behind it and, where an ear settles it, engine-generated A/B demos
  (`src/lib/triage-demos-r15.json`) plus reference audio
  (`scripts/build-triage-clips.mjs`, gitignored output). The generator
  re-evaluates every snippet at build time and acorn-parses the page; a card
  whose A/B moves more than one variable must say so in its `caveat`.
- `DECISIONS.md` — the ledger. `todo.md` — the running summary for Ethan.
- `test/` — 300+ tests pin counts, pins, determinism, grammar.

## Ultracode / verification habit

Every round: after fixes, run an adversarial multi-agent verify pass
(stability / per-fix conformance / grammar / HQ integrity), each agent
REFUTING claims with measurements. It has caught a real defect nearly
every round (missed bind paths, register collisions, canon ripples).
Report its findings honestly — including what it refuted about your own
work — in the D-entry addendum and to Ethan.
