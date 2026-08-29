// The r15 ear-test question set — Ethan's standing ask, verbatim: "if you
// have any uncertainties dont stay quiet, address them all with me or give me
// a ui interface to address them and answer and give an ear".
//
// Every card is a question the r15 analysis could NOT answer without his ear.
// Sources: research/{jungle-language-r15,midi-desert-analysis,brr-samples-r15,
// misc-refs-r15,corpus-atlas-r15}.md — each card names the report section its
// evidence comes from, so an answer can be traced back to a measurement.
//
// `demos` ids join to src/lib/triage-demos-r15.json (engine-generated and
// adversarially verified — what he hears is what the engine would ship).
// `clip` ids join to the reference-audio pack (audition/triage-clips.js).
// A card with neither is a pure judgement call — answer buttons + notes only.
//
// scripts/audition-triage.mjs renders these to audition/triage.html.

/** the lanes, in the order they appear on the page */
export const TRIAGE_SECTIONS = [
  { id: 'desert', title: 'Desert', blurb: 'NSMB Desert Theme (your .brr package) + GG Oasis Battle, measured note-by-note' },
  { id: 'jungle', title: 'Jungle', blurb: 'your five references: Battle Cats (your example), JP2 SNES, Sburban Jungle, Contra, Terraria' },
  { id: 'grammar', title: 'Grammar & melody', blurb: 'engine-wide dials — including the tail removal you asked for this round' },
  { id: 'samples', title: 'Samples', blurb: 'the 24 BRR voices decoded out of your AMK packages' },
  { id: 'corpus', title: 'Corpus', blurb: '1,790 MIDIs classified + the 9,725-entry SMW Central catalog' },
];

export const TRIAGE_CARDS = [
  // ─────────────────────────────── desert ───────────────────────────────
  {
    id: 'desert-egyptian',
    section: 'desert',
    title: 'The Egyptian song you meant to link',
    question: 'You wrote "egyptian-themed is very good for desert. like this song" — the link never came through. Which song?',
    why: [
      'Everything else in the desert lane this round came from the NSMB package you added; this one reference is missing entirely.',
      'Egyptian vs. the current Hijaz/Phrygian-dominant reading may pull the lane in a different direction (double harmonic, or the thirdless drone the NSMB floor actually uses).',
    ],
    options: null,
    askText: 'paste the link or name the song',
  },
  {
    id: 'desert-shuttle',
    section: 'desert',
    title: 'bII as a chord, not just a melody note',
    question: 'NSMB\'s B section plants the bII as a planed maj7 CHORD (C^7 | Db^7, alternating every bar). Add it as a desert trope?',
    why: [
      'measured: research/midi-desert-analysis.md §1.6 — bars 12–17 are C^7|Db^7 ×3 then Eb^7, bass root+5th, guide-tone (3rd+7th) dyads.',
      'The engine\'s current hijaz trope sounds the bII mostly as a melodic b2. Both chords being maj7 also satisfies the color-is-the-norm law.',
      'Union of the two chords = C double harmonic — natural 7 included, which the current desert scale does not use.',
    ],
    demos: ['desert-shuttle-a', 'desert-shuttle-b'],
    caveat: 'One thing riding along: a is a 4-bar loop played twice, b is 8 bars through-composed, so b is also less repetitive. If you prefer b, worth saying whether it is the harmony or the variety.',
    options: [
      { v: 'b', label: 'add the shuttle' },
      { v: 'a', label: 'keep current hijaz' },
      { v: 'both', label: 'both, pick per song' },
    ],
  },
  {
    id: 'desert-floor',
    section: 'desert',
    title: 'The marimba floor',
    question: 'NSMB\'s floor is a constant-16th broken open fifth with a b7+4 splash on each downbeat and accents at 16ths 2/7/12/14. Swap the engine\'s floor for it?',
    why: [
      'measured: §1.2 — G3↔D4 alternating (never together), staccato ~75%, range a major 6th, first two 16ths of every bar C4→F3.',
      'The velocity cross-accent (spacing 5+5+2) is what makes it shimmer instead of tick.',
      'The engine already plays a broken-fifth 16th ostinato here; this is a more specific version of the same idea.',
    ],
    demos: ['desert-floor-a', 'desert-floor-b'],
    caveat: 'Verified afterwards: the engine ALREADY plays this figure and these accents almost exactly — across 16 slots the only pitch difference is one note (the splash\'s second note sits an octave lower in the reference). Demo b is also about 1.2dB quieter, which is an artifact of how the two velocity curves normalise, not a musical choice. So if they sound nearly the same to you, that is the correct answer and the honest headline: this part of the desert lane was already right.',
    options: [
      { v: 'same', label: 'they sound the same' },
      { v: 'b', label: 'b is better' },
      { v: 'a', label: 'a is better' },
    ],
  },
  {
    id: 'desert-bass',
    section: 'desert',
    title: 'The b6→5 sting bass',
    question: 'GG Oasis Battle runs one cell — 1‑5‑b6‑5, straight 8ths, unbroken for 320 bars. Use it as the energetic-desert bass?',
    why: [
      'measured: §2.3 — the b6 is the only non-chord tone in it; the desert flavor is baked into the floor rather than left to the lead.',
      'It never changes root for 32–40 bars: drone psychology at battle tempo.',
    ],
    demos: ['desert-bass-a', 'desert-bass-b'],
    options: [
      { v: 'b', label: 'yes, the sting cell' },
      { v: 'a', label: 'plain root/fifth' },
    ],
  },
  {
    id: 'desert-ornament',
    section: 'desert',
    title: 'The snake-charmer wobble',
    question: 'A degree oscillating with its chromatic lower neighbour (5↔b5). Ornament only, texture too, or neither?',
    why: [
      'measured: §1.5 and §1.6 — the choir does D–Db–D on the 5th; the strings promote the same wobble to an 8th-note dyad texture at whisper level.',
      'This matters because it injects desert color into an otherwise plain minor melody WITHOUT rewriting the scale — a possible cure for "dark, not desert" that does not touch harmony.',
      'demo c is the texture version (strings, whisper gain).',
    ],
    caveat: 'Two honest notes. c\'s shimmer sits about 21dB under the lead (the whisper law) — if you cannot hear a difference from a, that IS the finding, not a mistake. And only one of b\'s two wobbles is literally the 5↔b5 of the reference; the other is a 4↔3 on the same principle. Judge the device, not the exact degree.',
    demos: ['desert-ornament-a', 'desert-ornament-b', 'desert-ornament-c'],
    options: [
      { v: 'b', label: 'ornament only' },
      { v: 'c', label: 'texture too' },
      { v: 'a', label: 'neither' },
    ],
  },
  {
    id: 'desert-scale',
    section: 'desert',
    title: 'NSMB\'s desert scale is not the one the engine plays',
    question: 'The melody is G Dorian ♯4 (Nikriz: G A Bb C# D E F) with the raised 3rd only at cadences — not Phrygian dominant, not harmonic minor. Should desert melodies use it?',
    why: [
      'measured: research/nsmb-desert-mml-r15.md §4, duration-weighted over the parsed MML — the ♯4 is the constant, the ♯3 is an event.',
      'The engine currently walks desert melodies in Hijaz / harmonic minor, where the raised third is wallpaper rather than a cadence arrival.',
      'This is the same "exotic by ornament, not by scale" idea as the wobble card, one level up: the scale itself keeps a minor third and gets its color from the ♯4.',
    ],
    options: [
      { v: 'nikriz', label: 'add Nikriz as a desert scale' },
      { v: 'keep', label: 'keep hijaz/harmonic minor' },
      { v: 'both', label: 'both, pick per trope' },
    ],
  },
  {
    id: 'desert-perc',
    section: 'desert',
    title: 'Doum off the downbeat',
    question: 'NSMB\'s deep drum never lands on beat 1 — it sits on the &-of-1 and the e-of-2, every bar. Re-place the engine\'s doum the same way?',
    why: [
      'measured: §1.7 — no kick, no snare, no hat; ~22 hits/bar in a 2-bar loop that never changes across sections; triangle fixed at beat 3.5.',
      'The engine\'s iqa\' patterns (ayyub/maqsum/masmoudi) do put dums on the downbeat.',
      'HONEST CAVEAT: this one depends on where the barline is. The official MIDI puts the splash on beat 1 (giving the off-downbeat doums above); the SMWC porter heard it two 16ths earlier, which lands the doums on 0 and 3 — close to the ayyub the engine already plays. Nothing in the files decides it, so your ear does.',
    ],
    caveat: 'This A/B is not clean and you should know it: b is the full transcribed kit (6 voices, 21.5 hits/bar, no riq), a is the engine\'s (3 voices, 12 hits/bar). So placement, kit and density all move together — "b sounds better" would not by itself mean "move the doum". The third option is the one this pair can honestly answer.',
    demos: ['desert-perc-a', 'desert-perc-b'],
    options: [
      { v: 'b', label: 'move the doum off 1' },
      { v: 'a', label: 'keep the iqa\' as is' },
      { v: 'add', label: 'add it as a 3rd pattern' },
    ],
  },
  {
    id: 'desert-drone',
    section: 'desert',
    title: 'Eight bars of one chord',
    question: 'NSMB spends its whole A section on a thirdless G drone — no progression at all — then jumps to the shuttle a fourth above. Is that much stillness what you want desert to do?',
    why: [
      'measured: research/nsmb-desert-mml-r15.md §1 — the floor is only {G, D, C, F} for eight bars, no third anywhere; all the desert color is in the ornaments over it.',
      'The engine gives every desert song a chord loop. A drone section is a different structural permission, and it is what makes the reference sound like a place rather than a progression.',
      'It also explains "too harmonious": the reference is barely harmonic at all in its A section.',
    ],
    options: [
      { v: 'drone', label: 'let A sections drone' },
      { v: 'loop', label: 'keep looping harmony' },
      { v: 'some', label: 'only on calm/mysterious' },
    ],
  },

  // ─────────────────────────────── jungle ───────────────────────────────
  {
    id: 'jungle-bc-key',
    section: 'jungle',
    title: 'Your Battle Cats example — major or minor?',
    question: 'The chroma is nearly flat (percussion swamps it), so the key read is a guess: C-centered, leaning I↔bVII, with a darker Am-ish middle. Does that match your ear?',
    why: [
      'measured: research/jungle-language-r15.md §1 — best guess C-major r=0.67, LOW-MED confidence; the bass stretches on C with 0.5s Bb touches.',
      'This is YOUR example, so its mode should probably set the lane\'s default. Right now the jungle lock is minor-only.',
    ],
    clip: 'battlecats',
    options: [
      { v: 'major', label: 'major / mixolydian' },
      { v: 'minor', label: 'minor' },
      { v: 'both', label: 'it moves between them' },
    ],
  },
  {
    id: 'jungle-mode',
    section: 'jungle',
    title: 'Minor-only, or add the major side?',
    question: 'Contra\'s jungle is mixolydian and your Battle Cats example leans that way too. Add a major-side jungle trope?',
    why: [
      'measured: Contra\'s melody is 92% mixolydian collection; its hook vamp is F·Gm·F·F7 (I–ii) and the chorus is Eb·F·Cm·Fsus (bVII–I–v–Isus).',
      'The engine\'s jungle env declares family: major but the trope lock only permits minor tropes — currently contradictory.',
      'Both sides share the law that matters: no leading tone anywhere.',
    ],
    demos: ['jungle-mode-a', 'jungle-mode-b'],
    caveat: 'The two demos sit in different keys (A dorian vs F mixolydian, each taken from its own source), so up to a minor third of register rides along with the mode. The rhythm and contour are identical bar for bar.',
    options: [
      { v: 'b', label: 'add mixolydian' },
      { v: 'a', label: 'minor only' },
      { v: 'both', label: 'both, energy picks' },
    ],
  },
  {
    id: 'jungle-bass',
    section: 'jungle',
    title: 'The jungle bass is contradicted by all five references',
    question: 'The engine plays a 3-onset round tumbao. Every reference plays a stream, a pedal, or an 8th walk instead. Which do you want?',
    why: [
      'measured: Sburban runs 32 onsets/bar (a 5-slot cell [5 5 b7 5 1] cycled, roots landing off beat 1); Battle Cats and JP2 hold pedals; JP2\'s coda walks straight 8ths.',
      'The tumbao\'s slot skeleton (0 · 3/8 · 3/4) does survive — as the ACCENT map of a busier line, not as the whole line.',
      'happy_jungle was judged with the tumbao and stays pinned whatever you pick here.',
    ],
    demos: ['jungle-bass-a', 'jungle-bass-b', 'jungle-bass-c'],
    caveat: 'Two things to know before you judge: the fourth option (an 8th-note walk, from JP2\'s coda) has no demo — say the word and I will build it. And c\'s pedal sits an octave above a and b, so it will read thinner in the low end for a reason the question is not about.',
    options: [
      { v: 'b', label: 'the 16th stream' },
      { v: 'c', label: 'the pedal' },
      { v: 'a', label: 'keep the tumbao' },
      { v: 'split', label: 'stream when busy, pedal when calm' },
    ],
  },
  {
    id: 'jungle-floor',
    section: 'jungle',
    title: 'How busy should the jungle floor be?',
    question: 'The engine\'s conga/bongo pair plays 11 hits a bar; the transcribed JP2 carpet plays 27, two and a half times as busy. How busy should the floor be?',
    why: [
      'measured: JP2 is four minutes of flute over LoConga+LoBongo+maracas+cowbell with EVERY 16th filled, interleaved so the two drums never double, ramping 21→27→39 hits/bar across the piece.',
      'The arrangement builds by percussion density rather than by adding layers.',
    ],
    demos: ['jungle-floor-a', 'jungle-floor-b'],
    options: [
      { v: 'b', label: 'the 16th carpet' },
      { v: 'a', label: 'current density' },
      { v: 'ramp', label: 'ramp it across the song' },
    ],
  },
  {
    id: 'jungle-kick',
    section: 'jungle',
    title: 'Four-on-the-floor under jungle?',
    question: 'Your Battle Cats example puts a dance kick under the hand percussion. No other reference does. Too dance for the lane?',
    why: [
      'measured: kick on 0/4/8/12 with tresillo mid-percussion and a shaker carpet — §1 Battle Cats row.',
      'It is the difference between "groove jungle" and "ritual jungle"; both are defensible, but they are different lanes.',
    ],
    demos: ['jungle-kick-a', 'jungle-kick-b'],
    options: [
      { v: 'b', label: 'yes, for energetic songs' },
      { v: 'a', label: 'hand percussion only' },
    ],
  },
  {
    id: 'jungle-tempo',
    section: 'jungle',
    title: 'Action jungle overshoots the tempo band',
    question: 'Groove references sit at 100–122bpm; action ones (Sburban 140, Contra 152) sit outside the engine\'s [100,132] jungle band. Widen it?',
    why: [
      'measured: both audio references are exactly 100.0bpm; JP2 is 122.4 (its MIDI tempo meta claims 255 — a frame-quantized SPC rip).',
      'Widening means an excited_jungle could run at 150 with the action kit rather than being forced down to a groove tempo.',
    ],
    options: [
      { v: 'wide', label: 'widen to [100,152]' },
      { v: 'keep', label: 'stay groove-only' },
    ],
  },
  {
    id: 'jungle-form',
    section: 'jungle',
    title: 'Can a jungle song wander?',
    question: 'Terraria\'s jungle theme is through-composed — no repeating harmonic loop at any lag. Everything else is a static vamp. Allow wandering jungle?',
    why: [
      'measured: chroma self-similarity decays monotonically; the tonal center drifts E → Ab/B → C/Bb across 82 seconds.',
      'The engine is vamp-based everywhere; this would be a new structural permission, not just a jungle setting.',
    ],
    options: [
      { v: 'vamp', label: 'stay vamp-based' },
      { v: 'wander', label: 'allow a wandering form' },
    ],
  },

  // ────────────────────────────── grammar ──────────────────────────────
  {
    id: 'tail-off',
    section: 'grammar',
    title: 'The melody tail you had me remove',
    question: 'You said the cadence tail "should just be removed because it just doesnt sound that good". This is before vs after — confirm?',
    why: [
      'demo a is what ships now (the cadence bar keeps its full cell); demo b is the old thinned-and-held tail you called "really overused ... in many other songs".',
      'Both come from the same bindMelody call with one flag flipped, so the difference is exactly the code path.',
      'Landing-pitch grammar and the breath are untouched either way.',
    ],
    demos: ['tail-off-a', 'tail-off-b'],
    caveat: 'Fair warning: this is a STRONG instance, not the average one. On the cell these demos use, the old tail cut the cadence bars from 5 and 6 notes down to 2 and 2. On other cells the merge and hold absorb most of the thinning and the two paths differ by a couple of notes. The difference is confined to bars 4 and 8; the rest is identical.',
    options: [
      { v: 'a', label: 'yes — removal is right' },
      { v: 'b', label: 'actually keep the tail' },
      { v: 'other', label: 'neither — say what instead' },
    ],
  },
  {
    id: 'parallel-fourths',
    section: 'grammar',
    title: 'Parallel fourths baked into the hit',
    question: 'NSMB\'s "4th Oboe/Strings/Guitar" samples play a perfect FOURTH from a single key. Want that dyad color on desert accompaniment?',
    why: [
      'measured: research/brr-samples-r15.md §0 — 4th Oboe is 529.5Hz + 707Hz, a 4:3 ratio; the same trick in the strings and guitar samples.',
      'The engine can do this with no new sample: the figure token R.~5 on any voice.',
    ],
    demos: ['parallel-fourths-a', 'parallel-fourths-b'],
    options: [
      { v: 'b', label: 'yes, use P4 dyads' },
      { v: 'a', label: 'single notes' },
      { v: 'some', label: 'only on stabs' },
    ],
  },
  {
    id: 'sixth-chords',
    section: 'grammar',
    title: 'A real :6 chord quality',
    question: 'The chord dialect has no :6 — and a 7 token on a plain triad silently falls back to b7. Add :6 to the grammar?',
    why: [
      'get_proto\'s entire identity is the 6th chord (E6 ↔ C6); Sburban\'s jungle vamp uses bIII6 and bVII6.',
      'Right now 6ths have to be routed through figure tokens, which means they can appear in the accompaniment but never as a chord symbol the whole arrangement reads.',
    ],
    demos: ['sixth-chords-a', 'sixth-chords-b'],
    caveat: 'The demos show what 6ths sound like, not the fallback bug — there is no way to play "a 7 token silently became a b7". Judge the sound; the bug is a separate reason to want a real :6.',
    options: [
      { v: 'add', label: 'add :6 to the dialect' },
      { v: 'figs', label: 'figure tokens are enough' },
    ],
  },
  {
    id: 'swing',
    section: 'grammar',
    title: 'Swing does not exist in the engine',
    question: 'get_proto is swung 16ths (measured ratio ~0.585). The engine has no swing concept at all. Worth building?',
    why: [
      'A swing: 0.585 opt applying to offbeat 16ths would cover this file and any future shuffle reference.',
      'It touches every rhythm path, so it is a real build — worth knowing whether you want the sound before I start.',
    ],
    demos: ['swing-a', 'swing-b'],
    options: [
      { v: 'yes', label: 'build swing' },
      { v: 'no', label: 'straight only' },
      { v: 'later', label: 'not this round' },
    ],
  },
  {
    id: 'dissonance-dose',
    section: 'grammar',
    title: 'Where playful-spooky turns into just dissonant',
    question: '"What\'s This" is goofy and spooky at once: chromatic bass under a consonant top. Three doses — which is still playful?',
    why: [
      'measured: research/misc-refs-r15.md §2.6 — the film cue keeps the top consonant and puts every chromatic device in the bass and in half-step planing.',
      'Your horror dosing law allows ONE harmonic-dissonance device per song; this is asking which device that should be for the playful-spooky end.',
    ],
    demos: ['dissonance-dose-a', 'dissonance-dose-b', 'dissonance-dose-c'],
    caveat: 'c has to change the harmony (that IS its device), and its bass also sits a fifth higher than a and b — so c will feel lighter in the low end for a reason unrelated to the dissonance.',
    options: [
      { v: 'a', label: 'a — none' },
      { v: 'b', label: 'b — one bass slide' },
      { v: 'c', label: 'c — planing' },
    ],
  },

  // ────────────────────────────── samples ──────────────────────────────
  {
    id: 'brr-licensing',
    section: 'samples',
    title: 'These are Nintendo recordings',
    question: 'The BRR samples are rips of copyrighted audio hosted on SMW Central. The sample pack commits audio into the repo as data-URIs. How do you want to handle it?',
    why: [
      'build-sample-pack.mjs emits audition/sample-pack.js with mp3 data-URIs, and that file IS committed (the hx_ precedent — but those are your own files).',
      'Adding the NSMB rows as-is would put Nintendo audio in git history. Nothing is committed yet; this is blocking the sample rows either way.',
    ],
    options: [
      { v: 'local', label: 'local-only, never committed' },
      { v: 'commit', label: 'commit them anyway' },
      { v: 'skip', label: 'do not use them at all' },
    ],
  },
  {
    id: 'nsmb-perc',
    section: 'samples',
    title: 'The real NSMB hand drums',
    question: 'Tabla (a single stroke) and Low Drum (~94Hz doum) as a dum/tak pair for the desert floor. Listen to them raw — good pair?',
    why: [
      'measured: research/brr-samples-r15.md §1 — Tabla is one articulation only (no round robins), Low Drum is a dholak-ish body at fs2/g2.',
      'Pairing them as dum + tak is musically plausible but has never been heard by your ear, which is why it is a question and not a change.',
    ],
    clip: 'nsmb_perc',
    options: [
      { v: 'yes', label: 'good pair' },
      { v: 'no', label: 'stick with vc_darbuka' },
    ],
  },
  {
    id: 'nsmb-voices',
    section: 'samples',
    title: 'Sitar, Bah, Kalimba',
    question: 'The lead/stab/color voices out of the NSMB package. Which are worth having as desert-only instruments?',
    why: [
      'Sitar is a 0.28s pluck (f5) with real jawari buzz; "Bah" is the NSMB brass shout stab (e5, clean decay); Kalimba is a soft c4 pluck that glides ~70 cents.',
      'The sustaining voices (Flute, Oboe, Ensemble, Bass, the 4th* dyads) are NOT usable yet — the decode lost their loop points, so they click.',
    ],
    clip: 'nsmb_voices',
    multi: true,
    options: [
      { v: 'sitar', label: 'sitar' },
      { v: 'bah', label: 'bah stab' },
      { v: 'kalimba', label: 'kalimba' },
      { v: 'none', label: 'none of them' },
    ],
  },
  {
    id: 'choir-pincer',
    section: 'samples',
    title: 'The choir pincer (from your S.C.A.R.Y. package)',
    question: 'Its entire harmonic horror budget is one device: a choir holding C# and B in alternate whole bars, a semitone above and below the riff\'s C, never resolving. Add it to the catacombs lane?',
    why: [
      'measured: research/nsmb-desert-mml-r15.md §9 — the overlap table is unambiguous, and the device runs alone for a 16-bar intro before any floor exists.',
      'It validates your dosing law exactly (one harmonic device, consonant floor, everything else timbral) and it is the same pincer NSMB uses in its strings, slowed down and sung.',
      'The engine has the choir and the pad machinery already; this is a writing rule, not new plumbing.',
    ],
    options: [
      { v: 'yes', label: 'add the pincer' },
      { v: 'intro', label: 'yes, and the device-only intro' },
      { v: 'no', label: 'skip it' },
    ],
  },
  {
    id: 'scary-voices',
    section: 'samples',
    title: 'The S.C.A.R.Y. pack',
    question: 'A witch cackle, a non-harmonic ghost-choir shimmer, and four clipped distorted-guitar stabs. Any of these earn a place in the horror lanes?',
    why: [
      'The pack is entirely TIMBRAL dissonance — which is exactly what your horror dosing law wants: one harmonic device, the rest timbre.',
      'The distorted guitars are heavily clipped (up to 178 rail samples); that crunch is probably intentional, but it is a specific taste.',
    ],
    clip: 'scary_voices',
    multi: true,
    options: [
      { v: 'laugh', label: 'the cackle' },
      { v: 'choir', label: 'ghost choir shimmer' },
      { v: 'guitars', label: 'distorted stabs' },
      { v: 'none', label: 'none' },
    ],
  },

  // ─────────────────────────────── corpus ───────────────────────────────
  // ─────────────────────────────── corpus ───────────────────────────────
  // These come out of the 15-agent classification of 1,790 MIDIs. Each one
  // gates a block of material: answering it either opens a pool or closes it.
  {
    id: 'corpus-desert-width',
    section: 'corpus',
    title: 'Is desert Hijaz-only?',
    question: 'Seven high-value tracks carry Andalusian/Spanish colour (i–bVII–bVI–V) or American-western gallop, with no raised third. Do those count as desert?',
    why: [
      'D93 defines desert as Phrygian dominant and rules all-minor Phrygian "dark, not desert" — these sit exactly in that gap.',
      'This is the single largest coherent block of near-miss desert material in the corpus; the ruling roughly doubles or halves the desert pool.',
    ],
    options: [
      { v: 'hijaz', label: 'Hijaz only' },
      { v: 'andalusian', label: '+ Andalusian' },
      { v: 'both', label: '+ Andalusian and western' },
    ],
  },
  {
    id: 'corpus-comic-horror',
    section: 'corpus',
    title: 'Comic-spooky horror',
    question: 'Beetlejuice, Kid Dracula, Zombies Ate My Neighbors, Addams Family, dark-circus — campy horror. Does the lane law shut all of it out?',
    why: [
      'Twelve loop-bearing rows hinge on this, several high-value; horror_manor only has 43 rows to begin with.',
      'The D94 lane law says serious lanes refuse playful defaults — but "What\'s This" (which I analyzed this round) is exactly goofy-and-spooky at once and works.',
    ],
    options: [
      { v: 'no', label: 'keep horror serious' },
      { v: 'manor', label: 'allow it in manor only' },
      { v: 'lane', label: 'it deserves its own lane' },
    ],
  },
  {
    id: 'corpus-jungle-tropical',
    section: 'corpus',
    title: 'Bright tropical jungle',
    question: 'Nine of the 57 jungle rows are cheerful major island grooves — musically the opposite of a Stickerbush wash. In or out?',
    why: [
      'D94 defines jungle as dark modal vamps with marimba and tumbao bass.',
      'It connects to the mode question above: if the lane admits mixolydian, island-major is the next step along the same road.',
    ],
    options: [
      { v: 'out', label: 'dark modal only' },
      { v: 'in', label: 'allow tropical' },
    ],
  },
  {
    id: 'corpus-space-split',
    section: 'corpus',
    title: 'Space is two different lanes',
    question: 'The 97 space rows split into sparse floating m7/maj7 vamps (2.7–4 notes/bar) and hurtling shmup drive. They want opposite arrangements. Which is the engine\'s space?',
    why: [
      'The float family suits sparsity-as-ensemble-shape and breathing pads; the shmup family suits 16th ostinatos and synths out of piano territory.',
      'Building one pool from both gives a lane with no consistent character — which may be why space songs have been hit-and-miss.',
    ],
    options: [
      { v: 'float', label: 'floating/ambient' },
      { v: 'drive', label: 'driving/shmup' },
      { v: 'split', label: 'two lanes, energy picks' },
    ],
  },
  {
    id: 'corpus-dim-chains',
    section: 'corpus',
    title: 'Diminished chains — ever?',
    question: 'Eleven rows are built on dim7 chaining, including the whole Sandopolis "pyramid interior" cluster that reads as desert. Your law rejects chromaticism. Is dim ever admissible?',
    why: [
      'D88 is explicit: diatonic colour is the norm, dim chains are the chromaticism your ear rejects — and conflating the two burned us before.',
      'But six high-value desert-folder rows are entirely dim vamps, so a blanket no costs the desert pool real material.',
    ],
    options: [
      { v: 'never', label: 'never — the law stands' },
      { v: 'horror', label: 'horror lanes only' },
      { v: 'sparingly', label: 'as a dosed device' },
    ],
  },
  {
    id: 'corpus-odd-meter',
    section: 'corpus',
    title: 'Salvage odd-meter sources for harmony only?',
    question: '194 tracks are disqualified only by meter (5/4, 7/8, cut time, and so on). May I re-bar them to 4/4 and mine just their chords, or is the whole file out?',
    why: [
      'D92 rules 4/4 only for what the engine WRITES; this asks whether it also governs what the engine READS.',
      'Several are excellent sources otherwise — one has perfect loop coverage and a strong key read; some are 4/4 in everything but notation.',
    ],
    options: [
      { v: 'salvage', label: 'mine the harmony' },
      { v: 'out', label: 'whole file out' },
    ],
  },
  {
    id: 'corpus-east-asian',
    section: 'corpus',
    title: 'East-Asian pentatonic has no lane',
    question: 'Five tracks are clean East-Asian pentatonic and no lane covers it. The classifier defaulted them toward jungle, which would put wuxia music in the DKC-marimba pool. What should happen to them?',
    why: [
      'Folding them into jungle contaminates a lane whose law is marimba vamps and tumbao bass.',
      '"pentatonic" is a distinct style tag across 15 rows, so this is a small but real seam in the taxonomy.',
    ],
    options: [
      { v: 'lane', label: 'own lane, later' },
      { v: 'jungle', label: 'fold into jungle' },
      { v: 'drop', label: 'discard them' },
    ],
  },
  {
    id: 'corpus-boss-supply',
    section: 'corpus',
    title: 'Do boss themes count as lane supply?',
    question: '25 tracks sit in an environment folder but read as battle music (a horror game\'s boss theme, a jungle stage boss). Route them to battle, or let them feed their environment lane?',
    why: [
      'If boss themes count, horror_catacombs — the action horror lane with war drums and riser/impact re-entries — gains real material.',
      'If not, all four lane folders are overstating what they actually hold.',
    ],
    options: [
      { v: 'lane', label: 'they feed the lane' },
      { v: 'battle', label: 'route to battle' },
    ],
  },
  {
    id: 'get-proto',
    section: 'grammar',
    title: 'What is get_proto.mid?',
    question: 'An Online Sequencer export in E major with swung 16ths, E6↔C6 harmony, vibes and xylophone, and a written-out dotted-8th echo. I could not identify it. What is it, and which lane did you add it for?',
    why: [
      'If it is your own prototype, then the devices in it are the ask list itself and I should be implementing them, not classifying them.',
    ],
    options: null,
    askText: 'what is it / which lane',
  },
];
