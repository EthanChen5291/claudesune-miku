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