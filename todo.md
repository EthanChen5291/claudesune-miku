- research into how to improve and how to train melody
- expand to different genres (and mixing of genres)

- get .midi of toby fox and .wav of laufey
- [done, D30] Undertale MIDI (110 files) ingested — harmony/bass side only:
  166 chord loops (progressions-undertale.js), 85 accompaniment figurations as
  chord-relative tokens + bindFigure() (figurations-undertale.js), rhythm
  skeletons, 11 observed development moves; melody = notes only
  (undertale-melody.md). All ratified:false. Audition at audition/undertale.html
  (figures tab: switch the progression to hear the same movement re-voiced).
  NEXT: (a) listen + keep/kill — 47 progressions and 39 figures are needsEar
  (chord/key solved from notes with thin evidence), (b) promote kept figures'
  character lines, (c) consider 2-bar figuration mining (current entries are
  1-bar) once round 1 says the abstraction sounds right.
  [round 2, D33] "notes sound wrong" was: thirdless labels (D5/Csus for Dm/C —
  now diatonic-completed), figure octaves, and the page playing C@110 with
  flattened chord durations. Page now plays solved key + source bpm, has a
  "true chords" texture, and per-card VERBATIM SOURCE playback ('a' key) —
  A/B extraction vs the actual MIDI before killing an entry.
  [round 3, D34] melody-in-chords fixed (octave-double reassignment + acc-only
  quality + built-not-voted completion), and each progression now carries
  ownFigure — its own interval deployment, the DEFAULT texture ("own pattern").
  Megalovania round-trips note-for-note (regression-tested). 127/163 loops
  have own patterns; the rest fall back to true chords.
- [done, D29] Unison packs in audios/ ingested: 72 progressions + 12 drum-loop
  rhythms + 91 voicing observations (all ratified:false). Audition at
  audition/unison.html. NEXT: (a) listen + keep/kill, (b) 17 progressions are
  flagged needsEar because the filename label disagrees with the notes, (c) 6
  drum parts need an accent profile authored before they can bind, (d) promote
  observed voicings into src/lib/voicings.js to close the D28 gaps.
- NOT ingested: 124 WAV one-shots + FX from those packs. They are A7 instrument
  palette material and need sample hosting the engine has no story for yet.
- explore chord manipulation for variation (see ldrolez video)
- [done, D28] ldrolez/free-midi-chords: 188 progressions imported as a candidate
  pool (src/lib/progressions.js). NEXT: audition to promote ~20-30 into the library
  (that's when each gets a `character` line and ratified:true).
- MIDI Crate by phelpsiemusic.com — redistribution cleared. Use it as a
  VOICING/COMPING/ACCENT source, not a progression source (D28). Blocked on the A6
  extractor. First action on the subscription: A6.2 triage (velocity variance /
  grid deviation) to learn whether the files are humanized or quantized.
- 6 chord qualities have no voicing shapes yet (2 5 69 add9 m6 madd9) — 14 of the
  188 progressions can't be voiced until someone writes and auditions them.
- incorporate sound effects like fades for transition or emphasis.
- [done, D31] audio export: `cli.js export <songdir> --wav` = haps -> song.mid
  (@tonejs/midi, exact) -> song.wav (fluidsynth + GeneralUser GS in
  vendor/soundfonts/). NEXT if render quality matters: DAW finishing tier
  (import song.mid, real instruments per track; Reaper can render headlessly).
  OSC -> StrudelDirt deferred (realtime-only, SC install, one fixed palette).

- alan walker syntax incorporation

- [researched, D32] chord manipulation (octave displacement, chord-to-instrument
  distribution), instrument choice/doubling relations, loop-vs-rising-tension
  structure + controlling instruments over time, arpeggio types / traversal
  rhythms / staccato-vs-hold, bass-lowest rule -> arrangement-grammar.md.
  Decision procedure everywhere: hard rules -> cost ranking -> seeded choice,
  variation only at structural triggers (never per-chord dice); every choice a
  declared typed operator. NEXT: implement §1 voicing operators AS the queued
  D24 binder-revoicing pass (bass-note-integrity + bass-lowest lints first,
  verifier-side), then phrase grid + ramp policies (§4.2); thresholds in the
  doc are audition-tunable defaults.

- eventually apply midi to samples
- assessment of strudle for music representation

- [built, D36] pattern atlas + melody pipeline (design: atlas-and-melody.md,
  D35). Atlas: scripts/build-atlas.mjs -> src/lib/atlas.js (425 progressions /
  95 figures / 84 rhythms across all pools; vibe/speed features, sections by
  clustering, per-axis neighbor lists; neighborhood() returns FAMILIES, never
  one entry) + src/lib/undertale-context.js (hand-curated song context for the
  88 pool songs — role/character/leitmotif family/arc, documented sources
  only, uncurated tracks say so). Melody: chordScale() in theory.js
  (parent-scale search, b9-rule-derived avoids), bindMelody()+melodyReport()
  in bind.js (cell-first, anchors snap / approach tones resolve / weak beats
  from the chord-scale, seeded+deterministic), melody-profiles.js (toby-fox =
  the corpus numbers). Audition page: cards grouped by atlas section, context
  in tooltips, new "own + melody" texture = the pipeline audible per song.
  1676/1676 patterns green. [round 1, D36 addendum] "notes don't sound
  legal" = full jazz chord-scales (13% of notes out of key) -> triadic
  tension depth: supply = (chord-scale ∩ key) + the chord's own tones;
  offKeyUnforced now 0, machine-checked. [round 2, D37] "a layer, not the
  lead singer" -> melody-form.md research (MeloForm/MELONS/Huron/step
  inertia) -> bindMelody v2: phrase plan (motif·answer·motif·cadence),
  thinned+held cadence bars with a breath, antecedent/consequent landings,
  arch contour, step-inertia runs, restatement tail variation. 137/137
  tests. [round 3, D38] "still a gamble, no story" -> tier 2 BUILT:
  bindMelodySpec() = authored-melody guard (anchors snap loudly, altered
  degrees stand, off-supply notes resolve-or-snap) + melodies-tier2.js (6
  Claude-composed flagship melodies, reduction-first, A6.1 candidates) +
  "melody T2" audition texture for A/B vs the generated tier-1 line.
  [D38 addendum] authored set expanded to 22 songs spanning meters 2/4 2/2
  3/4 4/4 4/2 5/4 6/8, tempos 47-175, diatonic + chromatic; all 16 new specs
  passed the guard on first render (anchor tables computed before composing).
  Page has a blue "tier 2" flag + "only TIER 2" filter.
  [round 4, D39] verdict "clean but same-y/lifeless" -> MEASURED against the
  corpus's own melody streams and split in two: LIFELESS was the renderer
  (we emitted 100% legato; Toby is 24/25/51 staccato/detached/legato) ->
  articulation layer built (per-note duration ratio via .clip(), pitch-aware:
  steps connect, leaps lift, repeats re-articulate; now 22/30/48 at mean
  0.86). SAME-Y is the authoring (15 rhythms over 116 bars, top 5 = 82%;
  density 3.54/bar vs corpus 8.25, stdev 1.22 vs 5.08) — deliberately left
  as the tier-3 question, now isolated from the rendering confound.
  [round 5, D40] "it is actually much better" -> articulation confirmed as
  most of "lifeless". Remaining same-y attacked WITHOUT training: mined 37
  MELODY_RHYTHMS_UNDERTALE cells from the melody streams (rhythm + accents +
  artic only, no pitch — D30 ruling holds), stratified by density so the pool
  spans 2..16 notes/bar. Tier 1 now draws 26 distinct cells across 165 cards
  (was 1), density 7.25 vs the corpus's 8.25.
  [round 6, D41] His Theme + Gasters "own+melody" very good; rest good but
  style-mismatched ("hyper"). Analyzed the two praised cards -> five two-hand
  principles (density complementarity, register lanes, articulation contrast,
  interlock-at-anchors, thirdless-frame/melody-colour) recorded in D41 as the
  layering phase's starting rules. Built: ENERGY toggle (auto=tempo default
  unchanged | context=atlas role decides | calm/mid/hyper pin the band) +
  "+ counter (triangle)" background voice (calm cell, oct 4, own seed).
  [D42] soundfonts wired (@strudel/soundfonts, ~128 gm_* voices, lazy per
  instrument, graceful fallback); energy REMOVED from the UI and derived at
  generation time by density complementarity (activity budget - accompaniment
  density; praised cards bit-identical, Megalovania 8->3 fixes "hyper");
  counter instrument chosen by context role; playback bugs fixed (no overlap:
  generation-guarded + hush-before-evaluate; no JS error: stop on tab switch +
  codeFor tab guard; settings persist across refresh).
  [D43/D44] ARRANGER built: src/lib/instruments.js (15 gm voices described in
  words + properties) + src/binder/arrange.js (planArrangement/
  renderArrangement; situation -> headroom -> slate -> casting -> lanes; two
  costs: adds=new onsets vs mass=spectral weight; part-appropriate instrument
  fit; edit-ready metadata per layer). Audition: "full mix" texture + solo row
  (hear any single contribution alone) + full plan in the card tooltip.
  Melody: interlock-scored cell choice (hyper allowed when it counters) and a
  deterministic repeat policy (vary | exact | rest — loops and silence are
  legitimate). 165/165 cards arranged, 10 instruments in play.
  [D42 addendum] sample loading hardened after a live blackout: mirrors per
  map (raw.githubusercontent -> jsdelivr), piano degrades to gm_acoustic_piano
  when its map is unreachable, fatal only if NOTHING can sound; tested with a
  simulated dead host.
  NEXT (Ethan's stated order): (1) HARMONY GENERATION — compose progressions,
  not just replay extracted loops; (2) LAYERING — harmonies + lead + ~2 more
  instruments, engine-side instrument palette decision (load gm_* soundfonts
  or more dough-samples banks), encode the five D41 principles as layering
  lints; (3) CHRONOLOGICAL EDITING — prompt-driven song edits (add/change
  notes/instruments/vibe, escalation, drops). Tier 3 stays parked unless
  pitch same-y resurfaces.
  (b) if T2 wins by ear, author more specs + wire spec-authoring into song
  generation (LLM composes per song, guard renders); (c) tier 3 (train a
  scale-degree melody model on Hooktheory-style data; ~15k AWS credits
  cover compute many times over — data prep is the real cost) only if the
  T2 ceiling shows.

ALSO FIND MORE BOSSA NOVA / WALTZ / CINEMATIC STUFF. THEN SPECIFIALIZE IN SYNTH MUSIC (look on instagram)

pattern atlas

- further understanding of flow of sections in music


todo changes:
- modal numerals: tonic-relative degrees transcode to ionian-relative

____

CURRENT:

these are very good in the own + melody version. analyze the patterns here between the left and right hands that make it sound good (tell me). the other ones for both "own + melody" and (melody t2) are good but just different styles

in general, the "own + melody" is very hyper and sounds good music-wise but it's two different styles. i think keep this, but add like a variation toggle for the rhythm (not randomized of course) depending on what the user is building the song for and their context. moreover i think the current "own + melody" melodies could also be kept as like a background instrument in the harmony with a different instrument or something (what are strudle's other instruments we could use)? 

i think the music currently is up to an ok standard (still want to test actual harmony generation though rather than just using hardcoded harmonies). my next focus will be the harmony creation ofc and layering of different notes (like layering of different harmonies and a lead melody and instrument management with like 2 added instruments) and then after that, chrnological editing (like editing a song to add or change the notes/instruments/vibhe and/or adding stuff to it (like requesting escalation or drops etc via prompt)
____

ROUND 9 (2026-08-23) — done:
- D45 chord-label evidence gate. Dating Start's weird bar was an `A^7` invented
  over an Ab->A->Bb bass walk; the corpus audit found 75% of `^7` labels had no
  third sounding anywhere. Colour must now be heard in the accompaniment; a
  poorly-covered one-window segment is absorbed by a neighbour that explains it
  better. Corpus relabelled; 3 tier-2 specs rewritten to match.
- D46 instrument palette 15 -> 43, with `range` (music box no longer at oct 6)
  and `level` (the flute is now audible). Slates vary per song, so
  harmony_support fell from 54% of layers to 25%.

NEXT (Ethan's stated order):
1. HARMONY GENERATION — compose progressions rather than replay extracted loops
2. LAYERING — continue; encode the five D41 two-hand principles as lints
3. CHRONOLOGICAL EDITING — prompt-driven edits (escalation, drops, swaps);
   the D43/D46 layer metadata exists to serve this

Open questions for the next ear pass:
- 11 instruments are still never cast (glockenspiel, epiano1, nylon guitar,
  harp, ocarina, oboe, string ensemble, pad_halo, pad_new_age, choir_aahs,
  calliope). Dominated rather than excluded — worth checking whether the mood
  vocabulary or the tempo-fit curve is what shuts them out.
- melody_takeover silences the piano lead in 33 of 161 cards (20%). Ethan's
  brief was "keep piano the same and layer on top", so this may want capping.

ROUND 10 (2026-08-23) — done:
- D47 FORM. Songs are now sections, not one constant texture: ostinato → bed →
  statement → answer → full → breakdown/tag, chosen per role AND per roster,
  masked per bar. Mean layers 1.47 → 2.6; 161/161 cards have layers; 34
  instruments in play. Takeover is now a HANDOFF at a section boundary — cast
  43, leads 43, zero lead gaps after the tune arrives.

STILL OPEN after round 10:
- Transitions are hard cuts at phrase boundaries (correct for chiptune, and
  what horizontal resequencing does). Per-cycle .gain() is verified patternable
  if a swell is wanted for pads specifically.
- The piano accompaniment never drops out. A breakdown that strips IT would be
  the most dramatic move available and is not yet reachable.
- 9 instruments still never cast (glockenspiel is now 1×, so the tail is
  thinning): epiano1, nylon guitar, harp, ocarina, string_ensemble_1,
  choir_aahs, pizzicato, synth_bass_1, calliope.
- Section length is one loop/phrase. Real songs vary section LENGTH too
  (an 8-bar verse, a 4-bar pre-chorus); everything here is uniform.

ROUND 11 (2026-08-23) — done:
- D48: the GM soundfont bank had NEVER loaded. @strudel/soundfonts ships with
  bare import specifiers a browser cannot resolve, so every gm_* voice was
  silently rewritten to the triangle fallback — the whole 43-instrument palette
  was one oscillator. Fixed by rewriting the specifiers to blob shims bound to
  the RUNNING strudel instance (module identity matters: a second copy of
  @strudel/webaudio registers into a registry the scheduler never reads).
  Also: the banner no longer clears one subsystem's warning when another
  succeeds, which is why this was invisible.
- D48 addendum: sfumato's own dep (soundfont2) ships a UMD as its "module"
  entry, so no CDN autobuild of sfumato works. Now fetched and rewritten too,
  with the soundfont2 shim reading the global the UMD sets. Also found
  PIANO_FALLBACK named a sound the bank never registers (gm_piano, not
  gm_acoustic_piano). All 43 palette instruments confirmed registering.
- D48 addendum 2: pages now report "ready · N GM voices · build <stamp>" so a
  stale copy is visible without an ear. Real-Chrome probe harness documented in
  DECISIONS (headless --dump-dom against the page + an appended probe script).

ROUND 12 (2026-08-23) — done:
- D49 HARMONY GENERATION (phase 1). Progressions are now COMPOSED, not
  retrieved: a counted prior (root bigram + quality-given-degree + a separate
  loop-WRAP cadence table, per family and per family-split pack) ranked under
  D32's procedure. Research + the data-source answer in harmony-generation.md.
  96 composed progressions are on audition/progressions.html beside the 188
  imported ones behind a `source` filter — that A/B is the ear pass.
- Found and gated 6 corpus entries whose labels the source never supported
  (Rocket Man: all 9 chords `-#5`, match.agree 0, shipped needsEar:false).

NEXT:
1. EAR PASS on audition/progressions.html — filter to `generated`, A/B against
   `imported`. Nothing composed has been heard. Specifically worth judging:
   - is 0.80 distinct-degree (vs the corpus's 0.88) "solid" or "dull"?
   - the rare tail: `o` on degree 7, `bviim` in minor (corpus-attested at n=1-2)
   - do the composed CADENCES land, given they came from the wrap table?
2. Wire the generator into song generation (audition-undertale.mjs still binds
   extracted entries only). Deliberately not done until the ear pass passes.
3. LAYERING — continue; encode the five D41 two-hand principles as lints.
4. CHRONOLOGICAL EDITING — the D49 `derivation` exists to serve this.

STILL OPEN after round 12:
- Only CYCLES are generated. A through-composed phrase with a real ending is
  not expressible, and the corpus cannot teach it (the corpus is all loops).
- The unison importer RECORDS that it agreed with nothing (`match.agree: 0`) and
  ships the entry as `needsEar: false` anyway. The gate is currently in the
  model builder; it belongs in the importer.
- Style breadth is still the real data gap (bossa/waltz/cinematic/synth). If
  importing: When-in-Rome first (RomanText, CC BY-SA, transcoder not labeller),
  then CoCoPops/Billboard, then VGMusic. NOT Lakh.
- (carried) transitions are hard cuts; the piano accompaniment never drops out;
  9 instruments never cast; section length is uniform.

ROUND 13 (2026-08-24) — done:
- D50 EXEMPLAR VARIATION, after Ethan's pushback that D49 produced "valid" not
  "nice". Progressions with outside evidence of success are now the FOUNDATION,
  changed by a closed set of 8 typed substitutions that each declare what they
  preserve. D49's counted model survives as the VERIFIER, with the bar set by
  the exemplar itself. audition/progressions.html: 372 cards, foundations
  followed immediately by their own variations.

NEXT — and (1) is now blocking, not optional:
1. *** RATIFY SOME PROGRESSIONS. *** exemplarPool() wants entries Ethan has kept
   by ear; there are ZERO. The audition pages have been writing keep/kill to
   localStorage since D28 with no path back into the library, so the pool falls
   back to `unison-famous` and says so in a caveat. D50 is only as good as its
   foundations. Two jobs:
   (a) Ethan: open audition/progressions.html, keep/kill, hit "copy verdicts
       JSON". Filter source=foundation and source=varied first — that A/B is
       the fastest way to judge whether the strategy works at all.
   (b) then build scripts/import-verdicts.mjs so the JSON lands in the library
       and exemplarPool() returns ratified entries instead of a stand-in.
2. Global (whole-cycle) scoring — tension curve, voice-leading across the loop,
   cadential strength. Attacks "goodness is not local" head on and is the
   strongest complement to D50. Wait for the ear pass to say which variations
   landed before building it.
3. Wire harmony into song generation (audition-undertale.mjs still binds
   extracted entries only). Blocked on the ear pass.
4. LAYERING — the five D41 two-hand principles as lints.
5. CHRONOLOGICAL EDITING — D49 `derivation` and D50 `lineage` exist for this.

STILL OPEN after round 13:
- 9 of the 22 foundations cannot be voiced by any me_* dictionary (they need
  13sus, 6, ^7#5, add9 — D28's deferred, ear-gated tail). Those exemplars are
  unhearable on the audition page, so their variations cannot be judged.
- Only CYCLES. A through-composed phrase with a real ending is still not
  expressible, and the corpus (all loops) cannot teach it.
- The unison importer records `match.agree: 0` and ships the entry as
  `needsEar: false` anyway. Gate lives in the model builder; belongs upstream.
- (carried) transitions are hard cuts; the piano accompaniment never drops out;
  9 instruments never cast; section length is uniform.

ROUND 14 (2026-08-24) — done:
- D51: the ear loop is CLOSED. scripts/import-verdicts.mjs + src/lib/verdicts.js
  + an overlay in progressions-tail.js, so `ratified` finally means something.
  36 verdicts landed (11 keep / 25 kill); 1 was stale and is reported.
- Measured what the verdicts correlate with. HEADLINE: the strongest separator
  is label COVERAGE (0.95 keep vs 0.84 kill) — a transcription metric, not
  taste. Much of the first pass was Ethan rejecting bad D45 transcriptions.
  The real taste signal is PLAIN TRIADS (85% vs 59%, three independent measures
  agreeing). Cadence/plausibility/chords-per-bar predict NOTHING (|d|<0.1) —
  which is what D49's verifier measures. Recorded in src/lib/taste.js, derived
  from the verdict file, confidence: low.

NEXT:
1. Re-transcribe or drop the low-coverage Undertale entries. The ear pass says
   6+ of them are simply wrong, and they are polluting both the corpus and the
   counted model. Cheapest real win available.
2. MORE EXEMPLARS, and not via keep/kill — that channel measured transcription
   error. Ranked in harmony-generation.md §9: (a) Ethan drops MIDI of songs he
   likes into audios/ — highest bandwidth, machinery already exists; (b) he
   names songs; (c) he points at ONE moment and says what about it (this is
   what produced D41 and D47 — highest value per minute); (d) build A/B pair
   judging into the audition pages, which is easier to answer than keep/kill
   and yields a ranking.
3. Do NOT wire tasteProfile() into generator defaults yet — n=36, and the
   profile's strongest term is a transcription artifact.
4. Global (whole-cycle) scoring — still the strongest complement to D50, and
   now better motivated: the per-transition scoring D49 does predicts nothing
   about what Ethan keeps.
5. (carried) wire harmony into song generation; LAYERING lints; CHRONOLOGICAL
   EDITING.

STILL OPEN after round 14:
- The exemplar pool is 11 ratified + 22 famous. Want 20+ ratified, and from
  more than one idiom — every current keep is Undertale.
- (carried) 9 of 22 famous foundations are unvoiceable by any me_* dictionary;
  only cycles, no through-composed phrases; the unison importer ships
  `match.agree: 0` entries as needsEar:false; hard-cut transitions; the piano
  never drops out; 9 instruments never cast; uniform section length.

ROUND 15 (2026-08-24) — done:
- D52: VGMusic corpus (400 files / 354 games) + one shared ingest
  (src/ingest/corpus.js, proven byte-identical on the Undertale output) +
  audition/judge.html, a 36-trial A/B + layer + open-text instrument.
- Found: PERCUSSION was never filtered. 24% of game-MIDI notes are channel 10;
  it corrupted the melody split, the chord labelling AND the key solve. Yield
  33 -> 88 progressions. It also mis-solved both Amalgam entries' key, which
  is very likely why Ethan killed them.
- Ruling: a verdict judges the music that played. verdicts.js snapshots the
  degrees it judged; re-transcribed entries lose their verdict.
- Found: a third of "melodies" were arpeggio channels. Filtered.

FIXED IMMEDIATELY AFTER (D52 addendum): judge.html shipped with no
<script src> for the strudel bundle — declared the constant, never emitted the
tag. No test caught it because the DOM shim provides a stub `strudel` global,
so a page that never loads the bundle passes everything. Added an HTML-level
test, and gave the bundle the mirror fallback the sample maps have had since
D42 (unpkg + jsdelivr, version-matched, tried in turn).

- [done, D53] TASTE IS NOW RECORDED PER FACET, not per card. Ethan's notes
  ("Cm Bm is a pretty good transition ... i rejected the ones that had these
  simply because the progression itself sounded weird") showed one keep/kill bit
  averages over things he judges separately. Verdicts now name a facet: pair,
  wrap, chord, texture, cadence, cycle. A vote is EAR_COUNT=8 pseudo-observations
  on the family count row, so the ear speaks in the corpus's currency and
  `ctx.ear === false` still reproduces the old model exactly. `pairs` feeds the
  INNER table only — folding it into the wrap too took P(0->11) as a minor
  CADENCE from 0.07% to 19.8%. New `cadential_sus` operator puts a suspension
  only where something resolves it. audition/facets.html: 467 pair tiles ·
  31 harmonies × 7 formats multi-select · 20 harmonies × 3 endings.
  Seeds in src/lib/facet-seeds.js are hand-written and survive every import.

- [done, D56] FIRST REAL JUDGE PASS came back: 15 A/B, 177 tone votes, 14 notes.
  Three of the notes named mechanical defects, now all fixed and tested:
  (a) every figuration drew from {R,3,5} only, so G7/G6/G were the same notes —
  bindFigure gains opt-in `stateExtensions`; (b) the bass was a KEY-degree
  contour and played C natural under an A major chord — now a chord-relative
  figuration; (c) 54 library entries end on their own first chord, which loops
  as a doubled bar — src/lib/loops.js trims at render time and the lint
  reproduces Ethan's complaints by trial number. Also: background-tab audio
  slowdown fixed by moving strudel's scheduler tick to a Web Worker (with a
  watchdog that reverts to native if the worker never ticks); textureRanking()
  now reports EXPOSURE because block was judged on 1 of 37 harmonies and would
  otherwise rank last; new "wide oom-pah" tone per Ethan's t22 request.

NEXT:
0. OPEN FORK FOR ETHAN — when a loop's last chord repeats its first, trim it
   (keeps the harmony, can leave an odd loop: `Cm Ab Bb Cm` -> 3 bars) or
   REPLACE it (keeps 4 bars, changes a chord — what he proposed in t23)?
   Defaulted to trim; one operator away either way.
0b. RESEARCH — tone switching through the song. Corpus head start:
   DEVELOPMENT_UNDERTALE has 23 observed FROM->TO accompaniment transitions with
   counts, and 53 of 112 development moves (47%) change the texture. What is
   missing is WHERE in the form they land.
0c. RESEARCH — harmony variation as a PLACED event, not a sprinkle. D50 builds
   the variations; nothing decides where they go. First real requirement of the
   chronological-editing phase.
1. *** RE-RUN audition/facets.html AND audition/judge.html. *** facets first — it
   is where the two things Ethan already noticed by ear get generalised, and it
   is the only page whose votes reach the generator directly. Both export JSON;
   `node scripts/import-verdicts.mjs <file.json>` handles either format and
   prints the tally. judge.html (36 trials, ~10 min) settles whether D50
   exemplar variation beats D49 statistical composition by ear — and since D54
   every trial plays through SIX interval patterns switched in lockstep, so
   sweep at least two per trial or the tally is not texture-robust (the
   importer prints the median and warns when it is under 2). Notes box on every
   trial; it exports even on trials you skip.
   On facets.html, the highest-value clicks are the top of the leverage sort:
   thin corpus rows where one opinion actually moves the model.
1b. Open question the cadence tab exists to settle: is `Xsus -> X` at the loop
   wrap good in general, or was Ethan describing one specific case? Nothing is
   seeded there on purpose.
1c. `wraps` is empty and only the cadence tab fills it. Until it has votes, the
   ear has said nothing about endings at all.
2. The melody profile is measured but NOT WIRED IN. melody-profiles-vgmusic.js
   exists; nothing reads it yet. Wire it as a selectable style once the ear
   pass says the game-midi habits are wanted.
3. Re-transcribe or drop the remaining low-coverage Undertale entries (the
   percussion fix already repaired 2; the rest are genuinely thin).
4. Consider re-auditioning the two Amalgam entries now that their key is right.
5. (carried) global whole-cycle scoring; wire harmony into song generation;
   LAYERING lints; CHRONOLOGICAL EDITING.

STILL OPEN after round 15:
- Only 88 of 391 VGMusic songs yielded a progression. The gates are strict on
  purpose, but worth checking whether coverage>=0.9 is leaving good music out.
- vgmusic entries are all needsEar:true and unheard — same candidate-pool
  discipline as every other import.
- (carried) only cycles, no through-composed phrases; 9 of 22 famous
  foundations unvoiceable by me_*; the unison importer ships agree:0 entries as
  needsEar:false; hard-cut transitions; piano never drops out; uniform sections.
