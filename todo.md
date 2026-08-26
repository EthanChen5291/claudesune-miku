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
0. [RESOLVED — D56 addendum] The wrap fork is METER-FIRST (Ethan): even meter
   -> replace the duplicate (keeps bar count; ranked alternates carried as
   variation material), odd meter -> trim. resolveLoopWrap() in loops.js; both
   4/4 audition pages replace now. The parallel-flip device (v->V, "Gm to G")
   always rides in the options palette even though the score honestly ranks it
   low. NEXT for this: song generation must pass its actual meter instead of
   assuming 4/4.
0b. RESEARCH — tone switching through the song. Corpus head start:
   DEVELOPMENT_UNDERTALE has 23 observed FROM->TO accompaniment transitions with
   counts, and 53 of 112 development moves (47%) change the texture. What is
   missing is WHERE in the form they land.
0c. [RESOLVED — D59] Harmony variation is placed at THE LAST REPRISE of the
   letter form: a variation is only audible as one against material already
   known, so it lands on the final return of an already-heard letter, and a
   no-reprise scheme (ABCD) gets none. One gentle root-preserving operator
   through the D50 gate; everything chord-reading rebinds in that section.
   Hear it: undertale.html, "mix" texture — 98/163 cards carry a treat (the
   form strip marks it A′/B′). Still open from 0c: variation OUTSIDE the loop
   wrap (mid-phrase substitutions in longer forms) belongs to chronological
   editing.
0d. [done, D57] TWELVE VIDEOS TRANSCRIBED BY EYE -> pack 'igvideo': 18 section
   entries (Fujii Kaze x3, jazz ballad in E, neo-soul in F, dim chain in C#,
   city-pop in C x3, modulation etude x3), 2 flourishes as placed events with
   placement+function, video-corpus.md research doc (8 missing harmony
   techniques + the layering doctrine + melody habits). All needsEar; Ethan
   endorsed the SOURCES (sourceEndorsed:true), not my transcriptions of them.
   Hear them: audition/progressions.html, source filter "from the videos".
   [done, D59] all three queued changes built: sus-then-alter + end-on-9sus4
   ride the facets cadence tab (with new 7sus/9sus/13sus/7b9/7alt dictionary
   shapes so they can play); OPS.alter_dominant is a placed operator (one per
   phrase, at the turn, must resolve; own gateSlack so the D50 gate cannot veto
   the device for being rare); the `dialogue` archetype does call & response as
   lead-lane turn-taking (2-bar call, 2-bar answer, never simultaneous).
0e. [done, D59] THE LETTER FORM — harmony+melody composed over time. Letters
   name melodies (ABAB/ABCA/AABA/... hash-picked per song); same letter = same
   seed, new letter = new line; lead-derived layers rebind to their section's
   letter. undertale.html "mix" is now the full letter-formed song. NEXT:
   letter schemes + dialogue + treats should reach SONG GENERATION (cli), not
   just the audition page; and the answer voice could eventually VARY its echo
   (video 10's answers are near-echoes, not exact).
0f. [done, D60] FIRST BIG VERDICT HARVEST imported: 237 library verdicts (104
   clicked + 133 implied by Ethan's unmarked-half rule), 85 page-local verdicts
   recovered into DERIVED_VERDICTS, 12 notes, mood corrections, the modal|10:m
   facet seed, vid_mod_etude_close_cell (his E7·2 F^7 E7 cell), and 4/4 plans
   for 6-chord loops. exemplarPool now runs on the ear alone (201 ratified);
   pages vary only the 74 click-kept. GEN-NAME COLLISION fixed (was: one name
   covered up to 6 cards; his 21 gen verdicts were unattributable and dropped —
   re-judge the generated arm when convenient). QUEUED RULINGS: octave as a
   section parameter (post-peak quiet section 1-2 octaves up, with variations —
   form phase); 'Mysterious' mood tags read too consonant (prompt→params note).
0g. [researched, D61] THE SCENARIO ROUND — four designs in research/ (README.md
   is the index + build order), all CANDIDATE, awaiting Ethan's go before the
   20-environmental + 20-emotion song batch:
   (a) KEYS: mode first, register second, tonic = corpus practice + hash
       variety (per-key "character" is 12-TET myth; Schubart = metadata only).
       Corpus practice found: G:minor generic battle, F:minor heavy boss,
       B:major emotional peak, A:major warmth, towns 3/3 major.
   (b) FOUNDATIONS THEN VARIATION: 29-pattern universal fnd_ canon (alberti/
       stride/habanera/bossa/travis/gospel...) lands and is auditioned FIRST;
       then varyFiguration (12 typed ops — swap positions = rotate/swap,
       change intervals = colour_sub/octave_token/neighbor_insert) in the D50
       idiom with fit-drift gates.
   (c) VIBE = EMOTION x ENVIRONMENT: 17 environments (shop, fight, boss,
       construction, stealth, snow, water, desert, cave, lab, casino,
       festival, kitchen, training, rest, menu, aftermath) x 12 emotions;
       compileVibe() -> situation patch; contradiction cells (gloomy shop,
       happy construction, calm fight) are the ratification test.
   (d) INSTRUMENTS: per-part orchestration rules ready to become lints; 15
       verified new GM voices drafted (timpani, taiko, brass section, steel
       drums, guitars, slap bass, koto...; levels UNMEASURED until his ear);
       82 of 125 gm_* names still unused; .n(i) render variants = cheapest
       expansion.
   (e) ENSEMBLE SHAPES (his add-on, D61 ruling): solo / duet / groove / bed /
       no_drums / no_bass / full — sparsity is a scenario decision, shapes cap
       the arranger's slate, the batch includes deliberately sparse cards.
0h. [built, D61 + addendum] drum-patterns.com pipeline:
   `node scripts/fetch-drum-patterns.mjs liked <pages>` (owner granted Ethan
   permission via email, 2026-08-25 — D61 addendum; polite: page budget,
   1.2s/request, honest UA, skips saved) then
   `node scripts/import-drum-patterns.mjs --report` -> rhythm entries per
   voice + DRUM_PATTERN_FORMS (bank play order = where the fill lands, the
   todo-0b placement data). Grids are velocity-less, so entries need accent
   profiles unless the pattern used AC/ghost rows (those recover a real
   profile). Hand-saved pages still work and import identically.
   HARVEST DONE 2026-08-25 (D62): 240 liked patterns fetched (0 failures)
   -> 1315 voice entries + 240 DRUM_PATTERN_FORMS in
   src/lib/rhythms-drum-patterns.js. 146 entries carry recovered accent
   profiles (AC/ghost rows) and can bind TODAY; 1169 need accent profiles
   authored (A6.2 discipline, same as unison's flat loops). 100 fills + 94
   intros detected from bank play orders; 37 long arrangements truncated to
   16-bar loops with the full order kept on the form. Kits: 808×115,
   909×26, 8-bit×18, 303×14, acoustic×14, linn×12, TAIKO×7 (8-bit + taiko
   = straight into the game/boss palette). bpm 70-202, median 110. NEXT:
   (a) audition surface for the 146 bindable ones, (b) style-default accent
   profiles for the flat 1169, (c) wire DRUM_PATTERN_FORMS fill/intro
   placement into the form phase (todo 0b).
0i. [built, D61 addendum] FOUNDATIONS EAR PASS: audition/foundations.html —
   29 fnd_ canon patterns (figurations-foundation.js) × 5 click-kept
   progressions, a chip per pattern per card, verdicts PER PATTERN with
   notes; export -> import-verdicts.mjs -> FIGURE_VERDICTS overlay (stale
   snapshots refused, D51 discipline). This is build-order step 1: the
   fnd_ ear pass gates figuration-vary.
   [D62] Ethan's prose verdict landed: "they work well ... for now they're
   good" -> all 29 provisionally ratified as from:'notes-blanket' (a later
   CLICK on the page outranks the blanket, per pattern). His caveat ("which
   chords don't work on certain tones") is measured in FND_QUALITY_COMPAT.
0j. [built, D62] FIGURATION RELATIONSHIP GRAPH (his ask): generated
   src/lib/figuration-graph.js via scripts/build-figuration-graph.mjs —
   FND_TRAVEL (190 cost-ranked section-transition edges, devices from the
   corpus's observed development moves; each declares what it preserves;
   meter hard-guarded), FND_LAYERS (71 floor+comment vertical pairs, D41
   principles as rules — his "combine multiple patterns when layering"),
   FND_QUALITY_COMPAT (binder fallback warnings per chord quality). ALL
   CANDIDATE — edges are smoothness hypotheses until heard. NEXT: wire
   travel edges into the D59 letter form (a section boundary picks a
   cheap edge; the audition surface for the graph IS the form), and layer
   pairs into the arranger's accompaniment stacking.
1. *** RE-RUN audition/facets.html AND audition/judge.html, plus
   audition/progressions.html filtered to "from the videos" (18 sections to
   keep/kill — they are eye-reads of videos you like, so a kill likely means I
   misread; notes welcome). EVERY card now has its own tone buttons — block /
   bossa / arpeggio / wide pad / wide oom-pah — the global row is the default,
   a card's buttons override it, and the export records which tone you judged
   (cardTones), and every card has a notes box — typed comments persist, ride
   the export, and land in verdicts.js as CARD_NOTES on import. Odd-length
   progressions are now fit to 4/4 by lengthening
   (3→4 bars, 5→8 as 2+2+2+1+1, ...; video cards honour their sectionBars) —
   the card shows the plan. The facets cadence tab now also offers the two D57
   devices per harmony: "sus, then altered V" and "end on 9sus4" (D59). *** facets first — it
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
2. [done, D59] melody-profiles-vgmusic.js is wired: 'game-midi' is a selectable
   bindMelody style (articulation defaults eased from measured shares; the
   saturated cellRepetitionFloor deliberately not carried). NOT yet used by any
   audition card — switch a page to it when the ear wants the comparison.
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


-----

MY PERSONAL TODO:

- listen to progressions.html

What you can do: reload undertale.html and play some mix cards — you'll hear melodies change by letter, dialogues trade phrases, and the harmony treat at the last reprise (hover the strip for exactly what varied). Then the standing re-run: facets.html (cadence tab has the two new devices; the wraps bag is still empty until you vote there) and the video cards with their new tone buttons.

ROUND 3 VERDICTS LANDED (D67): 10 keep / water's 3rd kill (mix-faulted —
harmony KEPT via keepBase) + 7 new notes, all actioned — CROSS-BAR repeats
now re-pitched (the gap that kept kitchen/sad-shop "hyper": within-bar
merge can't tie over a barline, so the note moves; zero repeats measured
across all 11 leads), pads BREATHE (per-bar gain waves, soft base rising
in the development, ×1.3 bump removed — "too loud" ×4), ENVIRONMENT PADS
START AT BAR 1 (your snow principle: the setting begins as it starts
playing — cave/snow/aftermath/water), aftermath un-uniformed (its AA
scheme never travelled → forced AB, alberti 8ths→16ths at B), construction
articFloor 0.9 (short notes lengthened), pedal piano wetter (room 0.7) +
softer (×0.55), happy shop intro halved (64→56) + dp_slowton, kitchen →
dp_boom_tap light, fight strings 0.3. NOTE: sad shop / boss / aftermath /
drop notes arrived verbatim from round 2 (the page keeps note boxes filled)
— actioned their remaining gaps; clear a box if a note no longer applies.
306/306. RE-LISTEN: audition/songs.html.

ROUND 2.5 (D66): your two scope fixes — string pads are now ROOTLESS
VOICE-LED REDUCTIONS (upper core tones, rotating inversions, fewer notes —
a variation of the chord, not its restatement; sus-safe), and the MERGE is
scoped to the melody only (lead + tune-carrying layers; alternate/counter
lines may repeat again). 306/306. Same page: audition/songs.html.

ROUND 2 VERDICTS LANDED (D65): 10 keep / 1 kill + 11 notes, all actioned —
THE MERGE (consecutive same-pitch notes combine into one held note — your
spec verbatim — on every lead), THE REACH (hold/merge now reaches arranger-
bound layers: the boss trumpet holds, finally), your STRINGS RULE (pads are
real chord voicings over a low frame, ×1.3 gain, swell at the peak;
cave/snow/aftermath demand the string ensemble), fight's texture layer
(fnd_offbeat_chords oct 4) + held guide-tone counterline, drums re-seated
(cymbal 0.22, busy-voice trim for the boss spam, lead boost 0.18, kitchen →
dp_tikoflow swing), pedal vibes softer (×0.65) + wetter (room 0.55) + no
melodic layer above the lead (cave's high flute drops), aftermath moves
(alberti arp + 3 voices), calm water rebuilt AGAIN (killed base banned from
retrieval, lead at octave 6): ut_once_upon_a_time_p3 "0 2 5:^7 0:7". Kept
songs now pin BASE + degrees. All 10 keeps verified stable. 306/306.
RE-LISTEN: same page — audition/songs.html.
STILL PARKED: melody-on-a-different-instrument (construction — you repeated
the staccato half, which the merge addresses; the instrument half waits on
the instrument-idiom build), busy-line-as-support (fight).

ROUND 1 VERDICTS LANDED (D64): 9 keep / 1 kill + 10 notes, all actioned —
held/sparser/softer leads on pedal + fast songs, consecutive-pitch cap,
intros halved on slow songs, drums seated (gains down, cymbal trim, lead up
vs foreground drums), strings support on snow/cave/aftermath, aftermath
2 voices, calm water rebuilt (plain-triad rule + octave floor), kitchen on
dp_nuevayol. KEPT SONGS PIN their judged harmony (drift measured; pin
tested). PARKED: melody-on-a-different-instrument (construction), busy-line-
as-support (fight) — both belong to the instrument-idiom build.
RE-LISTEN: same page, same links — audition/songs.html.

NEW (D63 + addendum) — LISTEN: audition/songs.html, now ELEVEN songs.
- 10 vibe songs: letter-form melody, varied kept harmony + last-reprise
  treat, foundation accompaniment that TRAVELS between letters,
  environment-cast instruments on the ensemble dial, articulation per vibe
  (staccato/legato/damper), and YOUR vouched drum patterns riding where
  your vibe note matches (each card quotes the note that let it in).
- #11 vs_excited_festival_drop: the b-52's buildup ask — 4 never-looped
  intro bars (drums → drone → accompaniment → riser), then the drop.
- Keep/kill + notes per song; export → import-verdicts.mjs.
DRUM GATE state after your first pass: 25 verdicts + 27 vibe notes in
verdicts.js (DRUM_VERDICTS/DRUM_NOTES); 4 patterns assigned into songs; 20
vouched-and-waiting; drums.html still has unjudged cards if you want more.
Parked from your notes: parapraxis first-4-bars as a standalone minimal
beat; cool_rock_1 minus "the synth thing" (voice-subset variant);
funky-bassline pairing for dp_to_go_with_funky_basslines.
Also standing: foundations.html per-pattern clicks outrank the D62 blanket;
remaining design approvals (keys policy module, instrument additions) in
research/README.md.


VIDEO BATCH 2 LANDED (D68): 23 new sources analyzed (17 reels + 5 screen
recordings + the Aquatic Ambience cover added mid-session). Your three asks
answered in video-corpus.md BATCH 2 (Tyler dyad = 3+b13 under the lifted
4+13; G#m9 climb = BLOCK RESTRIKES +1 octave/beat with 9->1->b7 walk-down
tags; bronik = fixed D-Eb-G cell over a descending bass, five octave-height
layers). 21+1 new vid_ progressions (needsEar), 6 new flourishes incl.
vid_tag_sus_melt, vid_climb_block_restrike, vid_arp_undershadow ("add a
note below every arp note" — direct fix for our robotic-arp complaints),
vid_ladder_quintal (the Aquatic Ambience water ladder — candidate DEFAULT
texture for the water vibe when you next audition it). None ear-ratified:
they will surface via progressions.html / future song builds.

NEW — LISTEN: audition/videolab.html (D69). Ten technique-lab cards from
the video corpus: keep/kill judges the TECHNIQUE AS RENDERED; notes say
what to combine next. Faithfuls (tyler melt, G#m9 climb, bronik build,
aquatic ladder, planing, gospel roll-in), a transplant (arp under-shadow on
your kept water harmony), combinations (dominant elevator modulation song,
city-pop enter-early/decorate-late, kpop pads + two-note sigh). Export →
import-verdicts.mjs as usual.

VIDEOLAB ROUND 1 IMPORTED (D71): 3 keeps (gsharp climb, aquatic ladder,
planing), 1 kill (tyler melt — vid_tyler_loop banned), 6 note-only cards.
Aquatic rule recorded: in songs the water ladder gets lots of reverb +
damper.

NEW — LISTEN: audition/videolab.html ROUND 2 (11 cards). Kept cards are
unchanged; every note-only card is rebuilt to your notes (bronik
rebalanced, elevator lands on the same theme a semitone up, undershadow
left hand rocks root-fifth, citypop/kpop falls only at phrase ends +
chord-rhythm variation, gospel middle now diatonic vi9-iii7). Two new
cards from your keep notes: vl_gsharp_vamp (just the two chords you
liked) and vl_planing_var (your Eb-for-A bass substitution). CLEAR STALE
NOTE BOXES before exporting — old notes persist between rounds.

NEW — RELISTEN: audition/songs.html — somber aftermath only (D70). The
cello + strings pads now carry their own slow held top-voice melodies
(varied durations, leaning into each chord change); every other song is
byte-identical. The padMelody switch is ready for any other song you name.

D72 UPDATE — the aftermath-only RELISTEN above is superseded: your
"change the generation, not the song" ruling made pad melodies POLICY.
RELISTEN the WHOLE songs page: every song's pad support now moves — slow
songs' top pad sings a planned phrase (contour arc, scale passing tones,
repeating rhythm motif, cadence home), fast songs (>140bpm: fight, boss,
kitchen, drop) and all lower pads move subtly per bar. Only pad exprs
changed; leads, accompaniment, drums untouched.

D73 — RELISTEN both pages:
- songs.html: water's loop is now C D F^7 Am (your C7 note; F^7-from-D
  banked as a taste seed), water pads trimmed 0.85; kitchen piano at HALF
  TIME with a sparse lead (-43% onsets, drums untouched); fight/boss/drop/
  kitchen top pads now sing the FREE phrase (your "more free, with
  variations"); fight + boss carry the new sine SUB-BASS under the beat.
  Chill songs (cave/snow/aftermath/sad shop/construction/happy shop) are
  byte-identical to what you just praised.
- videolab.html: the copy-JSON error is fixed (a stale round-1 verdict for
  the removed tyler card broke export — stale keys now prune on load).
  Re-export when ready; your pasted round-2 listen still needs its
  keep/kills.
