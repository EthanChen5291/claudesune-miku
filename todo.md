- research into how to improve and how to train melody
- expand to different genres (and mixing of genres)

- get .midi of toby fox and .wav of laufey
- [done, D30] Undertale MIDI (110 files) ingested — harmony/bass side only:
  166 chord loops (progressions-undertale.js), 85 accompaniment figurations as
  chord-relative tokens + bindFigure() (figurations-undertale.js), rhythm
  skeletons, 11 observed development moves; melody = notes only
  (undertale-melody.md). All ratified:false. Audition at audition/undertale.html
  (figures tab: switch the progression to hear the same movement re-voiced).
  NEXT: (a) listen + keep/kill — 47 progressions and 37 figures are needsEar
  (chord/key solved from notes with thin evidence), (b) promote kept figures'
  character lines, (c) consider 2-bar figuration mining (current entries are
  1-bar) once round 1 says the abstraction sounds right.
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

- further understanding of flow of sections in music


todo changes:
- modal numerals: tonic-relative degrees transcode to ionian-relative