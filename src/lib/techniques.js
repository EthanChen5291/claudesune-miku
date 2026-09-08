// ---------------------------------------------------------------------------
// TECHNIQUES — r20/D101. The home for extracted craft.
//
// Ethan, r20: "is it possible to learn the good techniques without hardcoding
// them? ... i want to do this in a way that every analysis isnt wasted but also
// isnt hardcoded though".
//
// This file is the answer's data half. Until now every technique read off a reel
// became a hand-written JS form inside audition-songs.mjs, chosen by a hash —
// RHYTHM_FORMS, INTERVAL_FORMS, one function per idea. That is the hardcoding.
// It has two costs he has heard: a form is picked without any test of whether it
// FITS, which is why his ear keeps reporting "random"; and an analysis that does
// not fit the existing shapes gets written into a research .md and lost.
//
// A technique here is a ROW, not a branch. Each states:
//   - the INTENT (what it does musically), not the note edit
//   - the EVIDENCE (which reel, which second, and his verbatim words)
//   - APPLIES (the conditions under which it is a fit)
//   - STATUS (wired into the engine, or recorded and waiting)
//
// Two rules this file exists to enforce:
//
// 1. AN INTENT IS DEFINED RELATIVE TO THE MUSIC AROUND IT, NEVER AS A FIXED
//    NOTE EDIT. "Insert the scale step between these two chord tones" transfers
//    to any key over any progression; "insert s4 on odd onsets" does not. This
//    is his own test — "actually making variations of it, even in different
//    chord progressions and such". Where an entry names pitches it is quoting a
//    SOURCE, and `shape` says how to generalise it.
//
// 2. NOTHING HERE IS A RETRIEVAL POOL. Adding a row must not re-roll any song
//    (the D95 law: library growth moves `fnv % pool.length` everywhere). These
//    rows are consulted BY NAME from SONG_OPTS or by an explicit gate in the
//    generator — never indexed by hash. A new row is therefore always safe to
//    add, which is the property that makes analysis cheap to record.
//
// STATUS values:
//   'wired'    — the engine implements it; `impl` names where
//   'recorded' — measured off a source, not yet built; `blocked` says what it needs
// ---------------------------------------------------------------------------

/** @typedef {'harmony'|'voicing'|'acc'|'melody'|'layering'|'timbre'|'form'} Role */

export const TECHNIQUES = [
  // -------------------------------------------------------------------------
  // HARMONY / VOICING — read note-by-note off piano rolls in his DM reels
  // -------------------------------------------------------------------------
  {
    id: 'fifth_pincer',
    role: 'voicing',
    intent: 'Two perfect fifths a semitone apart, held and entered one voice at a time. The dissonance is BETWEEN two consonant stacks, not inside one.',
    evidence: {
      kind: 'reel', poster: 'dantes.studio', file: 'new.MP4', at: '104-118s',
      hisComment: 'scary^',
      read: 'F#3 G3 C#4 D4 F#4 G4 C#5 -> F#-C# against G-D; then G3 G#3 C#4 D4 F#4 G4 D5 -> G-D against C#-G#',
    },
    // WHY it matters: everything the engine writes for horror is tertian. This
    // is thirdless top to bottom, which is the single biggest gap measured
    // against his horror references.
    shape: 'Stack R+5 on the root and R+5 a semitone above it; no third anywhere. Enter voices ~1 beat apart rather than striking the stack.',
    applies: { roles: ['harmony_bed'], lanes: ['horror', 'cave', 'catacombs', 'citadel', 'manor'], tertian: false },
    status: 'wired', impl: 'audition-songs.mjs opts.fifthPincer (fpFig)',
    heardOn: ['vs_scary_cave'],
    verdict: 'love this, scariest song you’ve made so far',
  },
  {
    id: 'staggered_entry',
    role: 'layering',
    intent: 'A chord ACCUMULATES one voice at a time instead of striking, so the change lands off the section grid.',
    evidence: {
      kind: 'reel', poster: 'dantes.studio', file: 'new.MP4', at: '104-118s',
      hisComment: 'scary^',
      read: 'the seven voices of the pincer enter roughly a beat apart, not together',
    },
    // this is also a live example of his long-standing structural ask
    relatedAsk: 'changes not just in strict section bar, and also changes in a unique way',
    shape: 'Delay each voice of a sustained stack by one grid step from the one below it; the stack is complete by the bar it belongs to.',
    applies: { roles: ['harmony_bed', 'pad'], minVoices: 3, sustained: true },
    status: 'recorded',
    blocked: 'the pad/bed layers bind one expression per voice-group; per-voice onset offsets need the bed to bind voice-by-voice',
  },
  {
    id: 'planed_ninths',
    role: 'harmony',
    intent: 'A five-note m9 voicing moved INTACT to a new root. No voice-leading — the parallel motion is the effect.',
    evidence: {
      kind: 'reel', poster: 'dantes.studio', file: 'new.MP4', at: '222-230s',
      hisComment: null, posterCaption: 'Steal this chords progression',
      read: 'C5 D#5 G5 A#5 D6 (Cm9) then G4 A#4 D5 F5 A5 (Gm9) — R m3 5 b7 9, transposed down a fourth',
    },
    shape: 'Hold one voicing shape and transpose it; do not re-voice per chord. Rhythm observed LONG-short-short per 2-bar cell.',
    applies: { roles: ['acc', 'harmony_bed'], family: ['minor'], wantsParallel: true },
    status: 'wired', impl: 'progressions-videos.js vid_dantes_m9_plane + rawBase',
    heardOn: ['vs_somber_space'],
    verdict: 'I really like this. it’s very unique ... def keep some of the techniques u used here',
  },
  {
    id: 'circle_b9',
    role: 'harmony',
    intent: 'A descending-fifths circle with two dark pivots: a half-diminished carrying a FLAT ninth, and an augmented III.',
    evidence: {
      kind: 'reel', poster: 'solobdomde', file: 'remainder+logs.MP4', at: '83s',
      hisComment: 'Walking bass (jazz, unique)',
      read: 'Dmin9 G9 Cmaj9 Fmaj9 Bm7b5(addb9) Eaug Amin9 A7 — printed on screen by the poster, so exact',
    },
    shape: 'iim9 V9 Imaj9 IVmaj9 viim7b5(addb9) IIIaug vim9 VI7. The addb9 is read twice — it is not add9.',
    applies: { roles: ['progression'], family: ['major'], wantsChromatic: true },
    status: 'wired', impl: 'progressions-videos.js vid_jazz_circle_b9',
    heardOn: ['vs_nostalgic_casino'],
    verdict: 'I feel like the chords are good and I like what you chose',
  },
  {
    id: 'hijaz_bviim',
    role: 'harmony',
    intent: 'Phrygian dominant that walks I - bII - bviim rather than I - bII - ivm. The b7 MINOR is the relation the engine’s desert tropes never had.',
    evidence: {
      kind: 'reel', poster: 'briancalli.music', file: 'remainder+logs.MP4', at: '56s',
      onScreen: 'Modo Mixolidio b9 b13',
      hisComment: 'desert chord example',
      // r20: he later identified this SAME reel as "the scary key reel" —
      // Phrygian dominant is both his desert scale and his scary key, which is
      // why one row serves two lanes.
      alsoCalled: 'the scary key reel',
      read: 'ladder C Db C Db Bbm C; scale rows lit C Db E F G Ab Bb (row spacing is chromatic — C->Db 35px, Db->E 110px ~ 3x35 — so the scale reading is measured, not inferred)',
    },
    shape: 'I - bII - I - bII - bviim - I in Phrygian dominant. Serve RAW; the variation pass dilutes a trope (D93).',
    applies: { roles: ['progression'], lanes: ['desert'], family: ['modal'] },
    status: 'wired', impl: 'progressions-videos.js vid_hijaz_bviim + rawBase',
    heardOn: ['vs_calm_desert'],
    verdict: 'I like it! ... it fits the vibe and is atmospheric',
  },
  {
    id: 'pivot_by_added_sixth',
    role: 'voicing',
    intent: 'Voice the bII with an added 6th so the chord ALREADY CONTAINS the root of the chord it moves to. The move then reads as a re-rooting, not a jump.',
    evidence: {
      kind: 'reel', poster: 'briancalli.music', file: 'remainder+logs.MP4', at: '56-60s',
      hisComment: 'desert chord example',
      read: 'Db voiced Db F Ab Bb (Db6, not Db); Bbm voiced Bb Db F (+Ab late) = Bbm7. They share Db, F and Bb — the same four notes re-rooted.',
    },
    // this is the r20 finding that the r19 pass flagged as uncertain and got
    // wrong: the ladder was right, the voicings were never read.
    shape: 'When chord B’s root is a third below chord A’s, add that root to A as a 6th. Generalises past the desert case: it is a common-tone pivot.',
    applies: { roles: ['acc', 'harmony_bed'], condition: 'next chord root is a third below the current root' },
    status: 'recorded',
    blocked: 'needs the D101 look-ahead reference (now built) plus a voicing hook on the acc bed; the walk uses look-ahead for single notes only',
  },

  // -------------------------------------------------------------------------
  // ACCOMPANIMENT — the r20 round’s own work
  // -------------------------------------------------------------------------
  {
    id: 'walk_into_next_root',
    role: 'acc',
    intent: 'Fill the hole before a chord change with scale steps that ARRIVE on the next chord’s root. Extra notes that are a line, not decoration.',
    evidence: {
      kind: 'ear', song: 'vs_nostalgic_casino',
      hisComment: 'the piano doesn’t do any walking. there’s not any extra notes between chords or countermelody etc in the piano - it’s just chord bouncing',
      measured: 'that song’s acc hand was literally [B3,D4,F#4] ~@2 [B3,D4,F#4] ~@4 — one triad struck twice and four empty slots. It passed the variation law because a 2-onset figure gets quota 1.',
    },
    shape: 'Take the largest gap in the bar. Place the next chord’s 3rd then its 2nd on the last two grid slots, so the downbeat lands on its root. Expressed with the ‘>’ look-ahead token so it holds over any progression.',
    applies: { roles: ['acc'], maxOnsetsPerBar: 3, minGridSteps: 3 },
    status: 'wired', impl: 'audition-songs.mjs RHYTHM_FORMS walk + bind.js ‘>’ token',
    measuredEffect: '24 walk events across 4 songs -> 122 across 13',
  },
  {
    id: 'resolve_non_chord',
    role: 'acc',
    intent: 'A note that is not a chord tone must be a scale step from the note that follows it. Otherwise it is a dissonance the ear cannot follow.',
    evidence: {
      kind: 'ear', song: 'vs_mysterious_jungle',
      hisComment: 'too much dissonance and variation - it sounds kinda random and not intentional - like varied a bit too much and just tiny offbeats and bits of dissonance that you can’t follow',
      measured: 'acc hand across the suite: 2,620 within-chord non-chord tones, 66 of them resolving (2.5%), ZERO true passing tones, 489 (18.7%) simply repeating in place.',
    },
    // The general form of five special cases. Stated over the scale ladder so it
    // holds in any key over any chord — which is the whole point of putting it
    // here rather than inside one variation form.
    shape: 'After a variation block is generated, retarget the TOP VOICE of any non-chord token to the ladder neighbour of the token that follows it. Keep the voicing; move one voice.',
    applies: { roles: ['acc'], appliesTo: 'generated variation blocks only — never the canon figure itself' },
    status: 'wired', impl: 'audition-songs.mjs resolveBlocks()',
    measuredEffect: 'resolved 66 -> 100; repeats-in-place 489 -> 391. Passing tones still 0 — see open note below.',
    open: 'passing tones remain 0 because the acc’s own line rarely moves by step WITHIN a bar; the walk only fixes the boundary. The interior needs a stepwise-motion intent, not just a resolution constraint.',
    // r21 CALIBRATION from a 31,652-file vgmusic sweep (research/vgmusic-atlas-r20.md).
    // The target is not "more colour" — it is LESS dissonance that goes somewhere:
    //   non-chord-tone rate      corpus 14.1%  vs ours 22.8%   (we use MORE)
    //   resolved by step         corpus 43.6%  vs ours  6.1%   (7x gap)
    //   step-APPROACHED          corpus 48.7%
    // The approach and resolution rates being near-equal is the real lesson: real
    // practice surrounds a non-chord tone with stepwise motion on BOTH sides, so
    // the resolution law is only half of the constraint.
    corpusTarget: { nctRate: 0.141, resolvedByStep: 0.436, stepApproached: 0.487 },
  },
  {
    id: 'percussive_register',
    role: 'acc',
    intent: 'Treat a pitched instrument as a drum kit: alternate a high register and a low register in a repeating pattern, with fills between.',
    evidence: {
      kind: 'ear', song: 'vs_mysterious_jungle',
      hisComment: 'jungle is kinda percussion like even with pitched instruments so maybe you could treat it like drums where it’s like high note low note high note low note in a drum percussion-like pattern (of course with additional notes too) to convey that',
    },
    shape: 'Assign each onset a register role (low = root octave, high = octave above) on a kick/snare-like pattern; the "additional notes" are ghost notes at low gain between the two.',
    applies: { roles: ['acc', 'texture'], lanes: ['jungle'], sounds: ['gm_marimba', 'gm_kalimba', 'gm_steel_drums'] },
    status: 'recorded',
    blocked: 'needs a register-assignment pass over figure onsets; the D101 ladder handles pitch class but not octave role',
  },

  // -------------------------------------------------------------------------
  // LAYERING — from the production-breakdown reels.
  //
  // r22 CORRECTION TO THIS HEADER. It used to read "(the face-cam / DAW ones)",
  // which overstated what these rows are and appears to have left Ethan believing
  // a Serum-reels layering analysis exists. IT DOES NOT. These four rows are
  // title-card layer ORDERS and one legible track list — no per-layer patterns,
  // no register relationships, nothing about how layers enter or leave. B1 is a
  // soundfont deconstruction and B2 is FL Studio (Sytrus/Morphine); neither is
  // Serum. ~36 of the ~51 repo reels have never been opened. His note — "I feel
  // like it wasn't fully learned how he layered and the specific patterns he put
  // on each layer" — is correct, and this is the gap it names.
  // -------------------------------------------------------------------------
  {
    id: 'bed_motion_melody_order',
    role: 'layering',
    intent: 'Build bed, then motion, then melody — and bring the melodic voices in LAST and in PAIRS rather than one lead holding the tune.',
    evidence: {
      kind: 'reel', poster: '_moogrs', file: 'new.MP4', at: '0-56s',
      read: 'one layer per title card: Soundfont -> Saw Wave -> Drums -> Bass -> Brass -> Sax -> Lead Guitar',
      subject: 'DELTARUNE "It’s TV Time!" deconstruction; soundfont named on screen as SGM/TMNT4',
    },
    shape: 'Section 1 = bed only. Motion (drums+bass) enters as a block. The tune arrives on two voices within a section of each other, never on one.',
    applies: { roles: ['arrangement'], minSections: 3 },
    status: 'recorded',
    blocked: 'the arranger casts layers per-letter, not on an entry SCHEDULE; needs an entry-order plan',
  },
  {
    id: 'thin_spread_leads',
    role: 'layering',
    intent: 'Spread melodic weight across four THIN voices rather than one thick one.',
    evidence: {
      kind: 'reel', poster: 'diokhairiansyah_', file: 'new.MP4', at: '128-160s',
      read: 'layer cards PIANO -> SYNTH 2 -> PLUCK 2 -> WAERA AHH LEAD -> FULL BEAT; the full-beat shot shows two plucks, two leads and a chant FX',
      subject: '"slayr" full production breakdown',
    },
    // his standing ask, nine cards and counting
    relatedAsk: 'I want more layers with their own melody man that’s what ive been saying',
    shape: 'Where one lead would carry a section, cast two-to-four quieter voices with distinct rhythms covering the same line.',
    applies: { roles: ['arrangement'], energetic: true },
    status: 'recorded',
    blocked: 'partially served by the D100 companion; the remaining half is CASTING more than one support melody at once',
    // r21 CORPUS CAVEAT (corrected figures — the first pass overstated this
    // fivefold by never testing rhythm). We are ABOVE the corpus on voice count
    // (median 3.77, max 5; we run 5-7), so this is not a licence to add voices.
    // A rhythmically-free second line is 54.5% of files (38.9% strictest) vs our
    // 32.6% — a real but modest gap. The corpus NORM is one companion LOCKED to
    // the lead's rhythm plus, in about half of files, one further free line.
    // And it is platform-dependent: 20-35% on chip-era hardware vs 58-71% on
    // ps1/snes/ds, so it must never be a default in a chip-era lane.
    corpusCaveat: { freeSecondLine: 0.545, strict: 0.389, ours: 0.326, chipEra: [0.203, 0.352], concurrency: 4.16 },
  },
  {
    id: 'chromatic_licence_scales_with_motion',
    role: 'melody',
    intent: 'A line that repeats or holds must be diatonic; a line that genuinely MOVES may leave the key. Chromatic licence is earned by realised motion, not granted by role.',
    evidence: {
      kind: 'ear', song: 'vs_excited_fight',
      hisComment: 'completely off key',
      measured: 'r19: the companion parked on D# for 18 of 22 notes over a B chord in A major. r21 corpus (15,813 files): a barely-moving line parked on out-of-key pitches occurs 26 times — 0.16% — and narrow-RANGE second lines have a median out-of-key rate of exactly ZERO.',
    },
    // WHY THIS ROW EXISTS: D100 fixed the same problem with a hard key-gate (a
    // companion may leave the key only where the lead already has, else it
    // rests), which worked — 16.3% -> 6.1% out-of-key, 0 of 21 songs — and is
    // judged material. But the gate is a blunter instrument than the corpus's
    // own rule, and it strips colour from a companion that has EARNED it by
    // moving. The measured shape says his ear was not objecting to chromaticism
    // as such; it was objecting to a chromatic DRONE, which is the one shape
    // real game music essentially never writes.
    shape: 'Gate chromatic notes on the line’s realised range/motion in the bar, not on whether the lead went there. A held or repeated note must be a scale tone; a line covering real intervallic ground may take colour.',
    applies: { roles: ['companion', 'counterline', 'descant'] },
    status: 'recorded',
    blocked: 'D100’s hard key-gate is judged material and stays until his ear rules on a replacement; swapping the mechanism moves every unpinned song carrying a companion, so it needs its own round and an A/B',
  },
  {
    id: 'separate_by_register_and_timbre',
    role: 'layering',
    intent: 'What makes a second line read as its own voice is REGISTER and INSTRUMENT, not rhythm. Striking with the lead is normal; sharing its voice is not.',
    evidence: {
      kind: 'ear', song: 'vs_triumphant_citadel',
      hisComment: 'I want more layers with their own melody man that’s what ive been saying',
      measured: 'r19 found the counterline and descant strike together on ONE instrument in 25 of 28 songs. r21 corpus: shared onsets are NORMAL (76.8% of second lines strike with the lead on >half their onsets), but 69.3% of second lines — and 85.9% of trading pairs — use a DIFFERENT declared GM family. Both of ours are gm_string_ensemble_1 at octave 4.',
    },
    // THE CORRECTION THIS ROW EXISTS TO RECORD: r19 answered the one-layer
    // finding by moving the descant's walk to the even bar, i.e. by changing the
    // RHYTHM. The corpus says rhythm was the wrong variable and the shared VOICE
    // was the defect the whole time.
    shape: 'Give the second line a different declared GM family from the lead, and place it either ~an octave off the harmony hand or a 3rd-4th from the melody in the same register (the corpus runs both devices; median gap between the two highest non-bass parts is 5 semitones, not 12). Drive its density from the lead’s measured per-bar activity — denser when the lead rests (ratio 1.57), sparser when the lead runs continuously (0.88). Enter at or before the lead’s first bar (83.5%).',
    applies: { roles: ['counterline', 'descant', 'companion'] },
    status: 'recorded',
    blocked: 'counterline and descant both bind gm_string_ensemble_1 at octave 4; separating them re-rolls castSounds, which is the D100 hazard that put a companion on a banished voice — needs a cast audit per song, not just a byte compare',
  },
  {
    id: 'blend_by_near_unison',
    role: 'layering',
    intent: 'Give two instruments the SAME or almost the same part so they fuse into one composite timbre — a sound neither makes alone. Doubling for COLOUR, not for volume.',
    evidence: {
      kind: 'ear', song: 'vs_nostalgic_casino',
      hisComment: 'sometimes you can give instruments the same or almost the same parts and they kinda mix together to make a more unique sound (kinda like some of the reels i showed you where they did that, like for tv man reel or something)',
      // the "tv man reel" is _moogrs' DELTARUNE "It's TV Time!" deconstruction,
      // atlas row B1 — brass then sax then lead guitar arriving in pairs
      read: 'new.MP4 @ 0-56s: the melodic voices arrive LAST and in PAIRS (brass, then sax, then lead guitar) rather than one lead holding the tune',
    },
    // THE DISTINCTION THAT MATTERS, and it cost a round to learn. r19/D100
    // dropped `melody_backup` from horror because it "doubles the lead line so it
    // reads louder and wider" — measured at 36 of 48 violin notes on the lead's
    // exact pitch, and his verdict was that it "destroys the atmosphericness".
    // That is NOT a contradiction of this row: louder-and-wider is an anti-goal
    // in an atmosphere lane, while FUSION is the goal here. The separating
    // variables are gain (a blend partner sits under, not level) and lane.
    shape: 'Two voices on the same rhythm and near-identical pitches, the partner mixed well under the lead so the pair reads as one instrument. Never in an atmosphere lane, where the same operation reads as a loud doubled lead.',
    applies: { roles: ['lead', 'texture'], lanes: ['!horror'], notWhen: 'atmosphere-led songs' },
    status: 'recorded',
    blocked: 'needs a blend-partner cast slot with its own gain law; melody_backup is the wrong vehicle — it is a doubler by declaration and mixes at lead level',
  },
  {
    id: 'transpose_second_statement',
    role: 'form',
    intent: 'Repeat a figure with its second statement transposed down a fifth, then adjust by hand for a seamless loop. A 2-bar-period change with no section boundary involved.',
    evidence: {
      kind: 'reel', poster: 'dxxdly/trifreeze', file: 'new.MP4', at: '64-100s',
      read: 'three on-screen instructions: "RUNS LIKE THIS" / "NOTE, ADD TWO NOTES" / "PITCH THE SECOND PART DOWN 7 & ADJUST FOR A MORE SEAMLESS [loop]"',
    },
    relatedAsk: 'changes not just in strict section bar, and also changes in a unique way',
    // measured r17: 139 of 139 layer entries land exactly on a section start.
    shape: 'On the second statement of a repeating cell, transpose by -7 semitones and fix the seam. The change is a transposition of the SAME cell, not new material.',
    applies: { roles: ['texture', 'acc'], repeatingCell: true, minStatements: 2 },
    status: 'wired',
    impl: 'audition-songs.mjs opts.doublePeriod — applied to the finished PATTERN as .add(note("<-12@2 0@2>")), not to the figure tokens. Tokens resolve against their own bar\'s chord, so \'the same tokens an octave up\' measured as a different pitch up 8 semitones; only a pattern-level transpose is exact. r28: the lift is exactly -12/0 on 100% of bars and statement two is higher than statement one in 100% of 4-bar groups, all 14 songs.',
  },
  {
    id: 'distorted_soundfont',
    role: 'timbre',
    intent: 'Route a plain General MIDI soundfont through distortion. The horror is TIMBRAL, not harmonic — the notes stay consonant.',
    evidence: {
      kind: 'reel', poster: 'thefakesnoritz', file: 'remainder+logs.MP4', at: '83s',
      read: 'SGM-V2.01 through FRUITY FAST DIST; sparse yellow piano roll, notes around C3-C4',
    },
    // matches the D93 dosing law: one harmonic device, the rest of the budget timbral
    shape: 'Keep the written harmony consonant and spend the horror budget on the signal chain.',
    applies: { roles: ['timbre'], lanes: ['horror'] },
    status: 'recorded',
    blocked: 'render-hq has no distortion stage; Strudel-side needs a distort/crush on the stem',
  },

  // -------------------------------------------------------------------------
  // FORM — his r20 ask, recorded here because it is the axis, not a technique
  // -------------------------------------------------------------------------
  {
    id: 'form_axis_ambient_to_narrative',
    role: 'form',
    intent: 'Song form is a DEGREE, not a kind: from an ambient loop (bare progression, no drop, texture carries it) to a narrative arc (real sections, drops, story).',
    evidence: {
      kind: 'ear', song: 'vs_scary_cave',
      hisComment: 'there’s songs with progression and development and such (what we’ve been doing now as an extent) but there’s also a degree to it. like an ambiant loop (kinda what scary cave was doing with its bare progression and no drop -> this can be generalized and created in other genres too determined by the fit). and then stuff with storiy and personality -> so actual drops and epic stuff.',
    },
    shape: 'A per-song scalar. At the ambient end: one harmonic cell, no bridge, no drop, variation carried by texture and dynamics. At the narrative end: letters, travel, breakdown, buildup+drop. The vibe picks the position.',
    applies: { roles: ['arrangement'] },
    status: 'recorded',
    blocked: 'NOT BUILT. The generator has the narrative end (letters/travel/drop) and reaches the ambient end only by per-song opts, as scary_cave did by hand. Needs the scalar plus a rule mapping vibe -> position.',
  },

  // -------------------------------------------------------------------------
  // LAYERING — r22, read off the 26 MIDI files Ethan hand-imported 2026-08-29
  // (Sonic Mania zones, Smash/Splatoon/Mario/Pokemon, two boss themes, an
  // alien cue, a rest area, a rain cue). Every number is taken inside each
  // file's STEADY SECTION — his caution: "some songs are abstract or have
  // specific quirks - just analyze in terms of sections or the 'normal'
  // sections where it's a good part of the song basically". Whole-file
  // averages made the Sm4sh menu (a 15-part MEDLEY, each part covering 3% of
  // the file) read like a sparse arrangement, which is a fact about the
  // format, not the music.
  // -------------------------------------------------------------------------
  {
    id: 'echo_layer',
    role: 'layering',
    intent: 'A second instrument repeats the lead a fixed musical distance later, quieter. It thickens a line by filling its own gaps rather than by making it louder — the opposite of a doubler.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: '16 of 26 files carry a pair where one part is a constant-lag copy of another (13.5% of all measured pairs). Lag is quantised and clusters: 2 beats (14 pairs), 0.5 (9), 1.5 (8), 1 (7), 0.75 (6). The copy is on a DIFFERENT declared GM family and sits well under the line it follows.',
    },
    shape: 'Rebind the lead cell on a different-family voice at ~0.35 of lead gain, then delay the whole pattern by a beat count drawn from the measured lag set. Never at lead gain — that is D100 melody_backup, which his ear rejected.',
    applies: { roles: ['lead'], notLanes: [] },
    status: 'wired',
    impl: 'scripts/audition-songs.mjs opts.echoLayer',
    // MEASURED after wiring: confirmed on 15 of 16 suite songs at the intended
    // lag (50-93% of echo onsets matching a lead onset one lag earlier). The
    // first build emitted `.late(NaN)` on all 16 and was silent — the vibe
    // object carries `meter`, not `beats`, and Strudel accepted NaN quietly.
  },
  {
    id: 'layer_breathing',
    role: 'layering',
    intent: 'Layers stop playing for a bar at a time inside an otherwise unchanged section, staggered so the texture thins in rotation. Sparsity as an ensemble shape, applied per voice rather than per section.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: 'Inside a steady section with no texture change, 57.5% of parts still rest at least one bar. Median coverage of their own window: lead 50%, counter 66.7%, acc 62.5%, pad 92.9%, bass 100%. Bass and pad are the exceptions and stay continuous.',
    },
    shape: 'Mask each non-bass, non-pad layer to rest one bar in eight, with the rest slot offset per layer by a step co-prime to the period so no two layers breathe together.',
    applies: { roles: ['counter_melody', 'descant', 'marcato', 'sparkle', 'harmony_support'], excludeRoles: ['bass', 'pad'] },
    status: 'wired',
    impl: 'scripts/audition-songs.mjs opts.layerRest',
    // MEASURED: layers rest more than their control on 15 of 16 suite songs
    // (20-75% fewer sounding bars per voice). The first version reached only
    // the 2-3 planner layers and moved 3 of 16 — the density that reads as a
    // wall is in the SUPPORT layers (counterline/descant/marcato/sparkle),
    // which the engine keeps in a separate list.
  },
  {
    id: 'octave_partner',
    role: 'layering',
    intent: 'A second instrument doubles the lead exactly an octave below. The engine had banned this outright; the reference material leans on it heavily.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: 'Unison/octave is 34.8% of every simultaneous interval in the set — the largest class by far, ahead of P5 (10.3%), P4 (10.0%) and thirds+sixths combined (23.3%).',
    },
    shape: 'Bind the lead cell at the LEAD’s own octave so the pitches are identical by construction, then transpose the pattern down twelve. Binding at a lower octave instead re-runs the melody walker, whose range clamp and leapFold are octave-sensitive, and produces a different line (measured: only 35-57% of its notes landed an exact octave under the lead).',
    applies: { roles: ['lead'], notLanes: ['manor', 'catacombs', 'citadel', 'cave'] },
    status: 'wired',
    impl: 'scripts/audition-songs.mjs opts.octaveDouble',
    // HONEST STATUS: the weakest of the four. It plays and it moves the mix the
    // right way, but only part of the distance — unison/octave went 21.9% ->
    // 24.3% against a reference of 34.8%. Horror is excluded because D100 ruled
    // that a loud wide double is an anti-goal in an atmosphere lane.
  },
  {
    id: 'oblique_companion',
    role: 'layering',
    intent: 'The companion holds its pitch while the lead moves stepwise, instead of picking a fresh tone under every note.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: 'Oblique motion is the plurality pair relation at 27.8%, over parallel 24.7%, contrary 20.9% and similar 19.9%.',
    },
    shape: 'Carry the previous companion tone forward while the chord holds and the lead moves by a step or less, subject to every existing companion gate (below the lead, not its pitch class, a chord tone, D100’s in-key rule). A leap re-picks.',
    applies: { roles: ['companion'] },
    status: 'wired',
    impl: 'src/binder/bind.js opts.obliqueCompanion',
    // THE PREMISE WAS WRONG AND THE MEASUREMENT SAYS SO. The control build was
    // ALREADY at 27.7% oblique against a reference of 27.8% — a companion that
    // re-picks still lands on the same tone whenever the lead repeats or the
    // chord holds, so "the engine cannot make oblique motion" was false.
    // Holding unconditionally overshot to 45.8%, which is the chromatic-drone
    // shape D100's ear verdict rejected. Conditioned on stepwise lead motion it
    // sits at 31.3%. Keep, but it is a small effect on an existing strength.
  },
  {
    id: 'vertical_consonance_gap',
    role: 'voicing',
    intent: 'Our vertical writing is markedly more consonant than the reference: we over-use thirds and sixths and almost never sound a second or a seventh.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: 'Reference vs ours, share of all simultaneities: thirds+sixths 23.3% vs 39.2%; seconds+sevenths 18.9% vs 9.1%; unison/octave 34.8% vs 21.9%; P4+P5 20.3% vs 27.8%.',
    },
    shape: 'Not a device — a target. Any future voicing change should be checked against these four buckets rather than against a chord-quality count.',
    applies: {},
    status: 'recorded',
    blocked: 'This is harmony, not layering, and his r22 ask was explicitly layering-only ("i only want these specific layering techniques to basically stack on top of the current engine stuff"). Acting on it would move the acc hand on every unkept song, which is a round of its own.',
  },
  {
    id: 'nct_bracket_both_sides',
    role: 'melody',
    intent: 'A non-chord tone is entered by step AND left by step. The bracket is what makes the dissonance legible, not its absence.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 (26 files)', scope: 'steady sections only',
      read: 'Reference parts carry 22.8% non-chord tones — the same rate we do — but resolve 63.6% by step and APPROACH 63.0% by step. Ours resolve 6.1%. By role: counter 26.0% nct / 69.2% resolved, lead 22.9% / 66.7%, acc 23.4% / 47.6%, pad 9.4% / 14.3% (pads hold, they do not resolve).',
    },
    shape: 'Constrain both the entry and the exit of any non-chord tone to a step. D101 built the exit half only, which is half a constraint.',
    applies: { roles: ['acc', 'lead', 'counter_melody'] },
    status: 'recorded',
    blocked: 'The approach half is a bind.js change that would move all 47 judged songs. It independently confirms D102 on a second, hand-picked source — approach and resolution are near-identical there too (48.7% / 43.6%).',
  },

  // -------------------------------------------------------------------------
  // LAYERING — r22, the FACE-CAM PRODUCTION REELS. His ask: "the reels with the
  // guy visibly making the beats with a camera in the top half of the reel ...
  // it wasn't fully learned how he layered and the specific patterns he put on
  // each layer". 44 reels frame-sampled, 9 are production reels, 4 producers —
  // SIX OF THE NINE ARE ONE PERSON (the Serum producer). Every row states
  // reels / independent sources. All 9 are in MINOR: nothing here transfers to
  // a modal or major lane on its own authority.
  // Full transcriptions: research/reel-layers-r22.{md,json}
  // -------------------------------------------------------------------------
  {
    id: 'layer_by_reregistration',
    role: 'layering',
    intent: 'A new layer is not new material. It is an existing layer transposed by an octave or two with a different note-value class and onset offset, introducing no new pitch class.',
    evidence: {
      kind: 'reel', poster: 'multiple (6 reels / 2 sources)', file: 'ScreenRecording_08-26-2026 13-25-13_1.MP4', at: '0-56s',
      read: 'One reel states it outright: separation comes entirely from register, density and note length, never from new harmony. In another the BASS is drawn as the lead ostinato’s four downbeat pitches sustained an octave down, and the counter is the same lead oscillation an octave up.',
    },
    shape: 'Take a bound layer’s pitch sequence, transpose ±12 or ±24, and change its note-value class and onset offset. Never generate a new pitch set.',
    applies: { roles: ['companion', 'counter_melody', 'bass'] },
    status: 'wired',
    impl: "audition-songs.mjs opts.reregister — the lead's own cell rebound at the same seed, its FIRST bound note per cycle taken off boundMeta (one pitch a bar, held), transposed -12/-24. Pitch set is a subset of the lead's by construction. r28: 0.67-1.00 notes/bar against a lead at 2.4-4.5, foreign pitch classes 0 on 10 of 14 songs.",
  },
  {
    id: 'freeze_body_move_one_slot',
    role: 'acc',
    intent: 'In a repeating figure, bind exactly ONE token to the harmony and hold every other token as a fixed pitch across the whole loop. The frozen tones re-colour themselves as the chord moves underneath.',
    evidence: {
      kind: 'reel', poster: 'the Serum producer (4 reels / 1 source)', file: 'igexport-DZS8aawIFrb.mp4', at: '0-55s',
      read: 'A 4-note per-beat cell whose slots 3 and 4 never change for the whole loop: the frozen dyad reads 9+b3 over Em, #11+5 over C, then 5+b6 over B. Another reel: the body of every bar is byte-identical and only the downbeat moves — and those four downbeats spell the entire progression.',
    },
    shape: 'One token binds to the chord root; the rest are pinned scale pitches held for the loop. Colour arises from re-harmonisation, never from substitution.',
    applies: { roles: ['acc', 'ostinato', 'marcato'] },
    secondSource: 'r30 — CONFIRMED BY AN INDEPENDENT SOURCE. He left a 23s Synthesia recording of a Demon Slayer OST piano arrangement (research/reel-energy-rise-r30.md): its right hand plays one unchanged 3-note cell (C5 G4 F4) over FIVE different bass notes, and a 4-note cell (B4 G4 F#4 E4) over three. R2 was 4 reels by one producer; this is a different arranger entirely, and the freeze is identical. Wired a second time as opts.synthRise, which freezes PER SECTION rather than per loop.',
    status: 'wired', impl: 'audition-songs.mjs opts.frozenSlot — the frozen body binds against a CONSTANT tonic context, one slot binds against the real progression',
    wiredNote: 'r23. Verified on the emitted notes of all 14 stress-test songs: every position in the frozen body carries exactly ONE distinct pitch across all bars, while the moving slot carries 3-6. Opt-in, not a default: rolled by hash it moved 10 of the 47 judged songs including three lanes that pin their own texture.',
  },
  {
    id: 'hold_bar_move_bar',
    role: 'layering',
    intent: 'A support layer alternates on a strict 2-bar period: hold one whole note, then walk stepwise and land back on the held pitch.',
    evidence: {
      kind: 'reel', poster: 'the Serum producer (4 reels / 1 source)', file: 'igexport-Da3c_kEI25C.mp4', at: '0-55s',
      read: 'Odd bars a whole note, even bars exactly two notes at beat 2 and the & of 3. In another reel: bar 1 hold, bar 2 a neighbour figure, bar 3 hold, bar 4 a two-note move. The most repeated device across the set — and all four instances are one person.',
    },
    shape: 'Parity-gate the layer on bar index. Hold bars sustain a chord tone; move bars walk stepwise against chordScale and resolve onto the next hold.',
    applies: { roles: ['counter_melody', 'descant', 'harmony_support'] },
    status: 'wired',
    impl: "audition-songs.mjs opts.holdMove — a 2-bar figure, hold on the 5th then a scale-ladder walk landing back on it. Two forms by hash (DZS8's 3-note turn, Da3c's exact two notes at beat 2 and the & of 3). r28: measured 100% of even bars hold one note, 100% of odd bars move, 100% of moves are a step or less, on all 14 songs.",
  },
  {
    id: 'register_bands_then_duration',
    role: 'layering',
    intent: 'Allocate disjoint octave bands to layers first. Where two must share a band, separate them by note-value class — one holds while the other runs.',
    evidence: {
      kind: 'reel', poster: 'multiple (7 reels / 3 sources)', file: 'igexport-DalZ717INc7.mp4', at: '0-58s',
      read: 'Four disjoint octave bands with no doubled pitch. One reel states it verbatim: independence is bought with register, not rhythm. Where a collision is deliberate, one reel says the layer was put in the other’s octave specifically so a sustain can sit against a run.',
    },
    shape: 'Assign octave bands before voices. On a forced collision, differentiate by note-value class, not by moving the rhythm.',
    applies: { roles: ['all'] },
    status: 'wired',
    impl: 'audition-songs.mjs r28Band() — downward-first allocation from the lead with a hard ceiling under it. r28: the lead is the top layer on 14 of 14 songs (it was 1-2.5 octaves BELOW its own support before). PARTIAL: realised bands still overlap within a 6th on 0-4 pairs per song, because an octave PARAMETER is not a register — bindFigure seats at C<octave> then stacks the chord member on top. Allocating on realised pitch would need the generator to see notes rather than patterns.',
  },
  {
    id: 'coprime_cell_length',
    role: 'form',
    intent: 'Give one layer a cell length coprime with the bar, so it restarts on a different metric position every bar and realigns only every few bars.',
    evidence: {
      kind: 'reel', poster: 'two independent sources (2 reels)', file: 'igexport-Db04jWHop4_.mp4', at: '0-52s',
      read: 'A keys part on a 3-eighth cell in a 4/4 bar, and a bass at dotted-8th spacing; a second producer runs a chord every 3 eighths, verified at two zoom levels. The phrase ends by BREAKING the cell into a stepwise descent introducing a pitch the cell never contained.',
    },
    shape: 'Cell length coprime with the bar length. Variation with zero note edits and no section boundary. Close the phrase by breaking the cell.',
    applies: { roles: ['acc', 'ostinato'] },
    status: 'wired', impl: 'audition-songs.mjs opts.coprimeCell — a 3-bar figure with onsets every 3/8',
    wiredNote: 'r23. Verified: exactly 3 distinct bar-onset patterns over 6 bars, cycling [0,3/8,6/8] -> [1/8,4/8,7/8] -> [2/8,5/8]. This is the r17 "changes not just in strict section bar" ask, built at last. Opt-in for the same measured reason as the frozen slot.',
  },
  {
    id: 'final_bar_breaks_everything',
    role: 'form',
    intent: 'On the loop’s last bar every layer breaks its own pattern at once: the floor splits and displaces by an octave, the ornament hits its densest bar, the chord voicing spreads widest.',
    evidence: {
      kind: 'reel', poster: 'multiple (5 reels / 2 sources)', file: 'igexport-DYfkq3BouJ_.mp4', at: '0-39s',
      read: 'The bass leaps UP a major 7th on the turnaround rather than stepping down, putting V near the melody register on the busiest bar; elsewhere it drops an octave at the bar end. One reel’s chord layer spreads its final chord wider than all the others.',
    },
    shape: 'Reserve the loop’s last bar as a simultaneous pattern break across every layer, rather than a turnaround in one voice.',
    applies: { roles: ['all'] },
    status: 'wired',
    impl: 'audition-songs.mjs opts.finalBarBreak — the FLOOR clause only, over the r28 re-registered floor: an octave drop on the last bar of every 4-bar group, period independent of the section grid. DROPS rather than leaps because 2 of the 3 readings drop and D88 already says the sub drops. r28: fires on 100% of checked bars on all 14 songs. The ornament and voicing-spread clauses are still unbuilt.',
  },
  // -------------------------------------------------------------------------
  // r23 — WHAT MAKES A BATTLE THEME FEEL LIKE ONE
  // His ask: "for the boss fights learn what makes them actually feel energetic
  // with stakes on the line and epic through their layering patterns and what
  // they do in each instrument and rhythm and intervals."
  // Contrast set: 13 battle files vs 43 non-battle, ALL hand-picked by him, so a
  // difference is a battle property rather than a taste property. Core windows
  // only (his "just analyze in terms of sections or the normal sections").
  // -------------------------------------------------------------------------
  {
    id: 'battle_bass_pedal',
    role: 'bass',
    intent: 'A battle bass drives by REPETITION, not by motion: the same pitch hammered in straight 8ths, moving only when the chord moves.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (13 battle vs 43 other)', scope: 'core window only',
      read: 'repeated-note rate 62.2% vs 36.8%; stepwise 19.8% vs 31.5%; onsets/bar 5.38 vs 6.71 (FEWER, not more); grid x.x.x.x.x.x.x.x. in 6 of 10; longest identical-pitch run 13-144 notes',
    },
    shape: 'Eight 8ths per bar on the chord root, accented 1 and 3, with an octave DROP on the last 8th of every 4th bar (D88 — lifting there put a synth bass on G4 once already).',
    applies: { roles: ['bass'], genres: ['battle', 'boss'], notLanes: ['manor', 'catacombs', 'citadel', 'desert', 'jungle'] },
    status: 'wired', impl: 'audition-songs.mjs opts.driveBass (wantsDriveBass) — REPLACES the sub-bass, never stacks with it',
    wiredNote: 'r23. Measured on the solo: 85.5% repeated at 8.25 onsets/bar against the control 0.0% at 1.25. It OVERSHOOTS the 62.2% reference, because the references mix pedal bars with moving ones and a pure eight-per-chord pedal is 87.5% by construction.',
  },
  {
    id: 'battle_support_hammer',
    role: 'acc',
    intent: 'The battle support layer hammers ONE pitch. Not a figure, not a walk — three onsets a bar, all the same note.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (13 battle vs 43 other)', scope: 'core window only',
      read: 'pure-repeat bar shapes 34.2% of battle support bars vs 7.0% (4.9x, the largest single separation in the analysis); modal shape is 0-0-0, i.e. THREE onsets all one pitch; support repeated-note rate 33.8% vs 20.2%',
      hisComment: 'in battle themes the violins can go root third fifth or root fifth 8th repeatedly 8th note style ... to make it sound more "action" and "high stakes"',
    },
    shape: 'Three onsets placed 3+3+2 (0, 3/8, 3/4), all the SAME chord tone, loopRoots so it moves when the chord moves. On the fifth, not the root, when the bass is already a repeated-root pedal.',
    applies: { roles: ['harmony_support'], genres: ['battle', 'boss'] },
    status: 'wired', impl: 'audition-songs.mjs SUPPORT_FIGS[3] support-hammer',
    wiredNote: 'r23. First write was R-5-5 ("so the chord change stays audible") — two pitches, therefore 0% pure-repeat BY CONSTRUCTION, measured 0.0% on all 10 songs carrying it. One pitch now: 100% against the control 0%.',
  },
  {
    id: 'battle_open_sonority',
    role: 'voicing',
    intent: 'Battle harmony is OPEN, and it is LESS dissonant than his other picks. Stakes are made of octaves and fifths, not of tension intervals.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (13 battle vs 43 other)', scope: 'core window only',
      read: 'octave/unison dyads 36.1% vs 28.3%; fifths 15.3% vs 13.0%; THIRDS DOWN 15.5% vs 20.2%; bare power-fifth chords 11.7% vs 4.9% (2.4x); min9 21.8% vs 15.9%. And going the other way: tritone 1.7% vs 2.3%, semitone 1.0% vs 1.8%, dim 0.8% vs 1.5%, dim7 0.3% vs 1.1%, dom7 0.8% vs 3.2%',
    },
    shape: 'Thirdless R.5 / 5.R+ dyads in the support ostinato; minor-9 colour rather than dominant; no added chromaticism.',
    applies: { roles: ['harmony_support', 'voicing'], genres: ['battle', 'boss'] },
    status: 'wired', impl: 'audition-songs.mjs SUPPORT_FIGS[4] support-open5',
    wiredNote: 'r23. Direction confirmed on 4-5 of 5 battle songs for EVERY interval class, but the magnitude is small and the target is not reached: 24.7% octaves against 36.1%, thirds 23.7% against 15.5%. Our battle texture is still markedly more third-y than his references. The remaining gap is in the planner cast, not this figure.',
  },
  {
    id: 'battle_kit_toms',
    role: 'percussion',
    intent: 'The battle drum voice is the TOM, and a battle kit is not a busier kit — its hats are fewer and plainer.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (13 battle vs 43 other)', scope: 'core window only',
      read: 'toms 1.887 hits/bar vs 0.313 (6.0x), used in 5 of 12 battle files vs 11 of 39; crash on 19.8% of bars vs 13.8%, present in 8 of 12 vs 26 of 39; hats FEWER (5.2/bar vs 6.7) and on 8ths not 16ths (16th-position share 8.8% vs 21.9%); kick/bar 4.00 vs 3.43 but four-on-the-floor DOWN 34.2% vs 42.8%; fill bars 9.4% vs 6.0% and quiet bars 9.2% vs 4.3% — the battle kit BREATHES more at both ends',
      hisComment: 'the drums don\u2019t feel too solid yet, they feel very bare minimum',
    },
    shape: 'A tom answer across the back half of bars 1 and 4 of every four (hi->lo, landing on a wardrum), plus a crash on the 8-bar downbeat and a soft one on the pickup. Extra voices on a band no selector reads.',
    applies: { roles: ['percussion'], genres: ['battle', 'boss'], notLanes: ['manor', 'catacombs', 'citadel', 'desert', 'jungle', 'cave', 'shrine'] },
    status: 'wired', impl: 'src/lib/rhythms.js battle_toms + battle_crash, band accent; audition-songs.mjs opts.battleKit',
    wiredNote: 'r23. Both rates were WRONG on the first write and the probe caught it: 4.00 toms/bar and 50% crash bars (2.1x and 2.5x over) because 8 onsets sat in a 2-bar cell and 2 in a 4-bar cell while the comments claimed 2.0/bar and 25%. Now 2.00/bar and 25.0%.',
  },
  {
    id: 'battle_not_the_mechanism',
    role: 'form',
    intent: 'Two things that look like they should carry battle urgency and measurably do not: harmonic rhythm and dynamics.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (13 battle vs 43 other)', scope: 'core window only',
      read: 'chord changes/bar 1.31 battle vs 1.38 other — no faster. Velocity stdev 9.2 vs 9.3 and snare ghost-notes in 2 of 12 files — his reference MIDIs are near-uniform, so this set cannot teach dynamics at all. Concurrency 6 vs 5 and tempo 150 vs 120 are real but modest.',
    },
    shape: 'Do not reach for faster harmony or louder dynamics to make a battle cue. Reach for repetition, open intervals and toms.',
    applies: { roles: ['all'], genres: ['battle', 'boss'] },
    status: 'recorded',
    blocked: 'Nothing to build — this row exists so the next round does not spend itself on the two obvious wrong levers. The dynamics half is a LIMIT OF THE SOURCE, not a finding about battle music.',
  },
  // -------------------------------------------------------------------------
  // r24 — the carried list. Each of these answers a card from the r23-suite
  // export, and three of them exist because a first measurement was wrong.
  // -------------------------------------------------------------------------
  {
    id: 'vertical_corollary',
    role: 'voicing',
    intent: 'A horizontal fix may not create a vertical step. Making a line resolve must not make the chord it sits in clash.',
    evidence: {
      kind: 'ear', song: 'su_excited_casino / su_calm_water / su_happy_jungle (r23-suite export)',
      hisComment: 'too much dissonance in some of the chords in the piano / the added notes in the piano onto the Alberti make it sound bad / you do a dissonance pass and randomly add dissonance at certain places',
      read: 'Acc hand, share of polyphonic attacks sounding a second: 35.0% ours vs 9.0% in his 59 reference MIDI files; a literal SEMITONE 14.5% vs 3.9%. EIGHT suite songs at 100.0% — their acc is monophonic except where a variation form bolts a partner on. After: 5.2% / 0.4%, with the polyphonic-attack count unchanged, so chords were revoiced, not deleted.',
    },
    shape: 'Check the sounding interval between every pair of members of a stack, in ladder (scale-position) coordinates so it holds in any key over any chord. Where a rewrite would place a tone a step from a voice already there, lift it an octave (a 9th is colour, a 2nd is a clash) and if it cannot lift, leave the token alone.',
    applies: { roles: ['acc', 'voicing'], genres: ['all'] },
    status: 'wired', impl: 'audition-songs.mjs stackPositions / stackBad / setTopVoiced, plus guards in the quartet and dyad forms',
    wiredNote: 'r24. The first write modelled a stack as resolving each member at or above the one before, on the strength of a comment. bindFigure does not — midi = rootRef + memberSemis(member) + 12*plus.length, each member independent — so the monotone model passed R.3.5.s4 as clean while the song sounded D-F#-G#-A. Reading the binder instead of the comment took the result from 11.5% to 5.2%.',
  },
  {
    id: 'quiet_piano_register',
    role: 'acc',
    intent: 'A quiet piano reads PERCUSSIVE when it sits too low: the hammer and the beating of low intervals carry over the pitch.',
    evidence: {
      kind: 'ear', song: 'su_mysterious_space / su_calm_water / su_mysterious_cave / su_calm_menu / su_romantic_rest (r23-suite export), against the KEPT calm songs on audition/songs.html',
      hisComment: 'the percussive nature of the piano here doesnt fit at all / it makes it sound percussive which doesnt make it sound nice / the random low note piano slam doesnt sound good (I think it did in in Dm7)? / piano too loud and "forceful" / dont be afraid to move the piano harmonies up sometimes into a higher octave',
      read: 'His 7 KEPT calm/slow songs vs the suite\u2019s 10, acc hand only: attacks/bar 8.00 vs 7.25, attacks/sec 1.67 vs 1.75, peak gain 1.00 vs 1.00, room and clip IDENTICAL. Register is the whole difference — kept low 48 / centre 60 / top 66, suite low 42 / centre 53 / top 68, and wider (26 semitones vs 18). After: 50 / 57 / 68.',
    },
    shape: 'Lift the hand a whole octave, bounded by a trial bind read back against the reference set\u2019s measured ceiling; where the lift does not fit, take one octave mark off the spread tokens instead, which raises the floor without raising the ceiling.',
    applies: { roles: ['acc'], genres: ['all'], conditions: 'salience background, acc voice is the piano, no explicit octave already stated' },
    status: 'wired', impl: 'audition-songs.mjs accLiftMode / closeVoicing / ACC_CEIL',
    wiredNote: 'r24. Lifting alone overshot to top 79 against his kept 66 (su_calm_menu at G#5, through the lead) because the hand is WIDE, so transposing moves the ceiling as much as the floor. Octave arithmetic on the tokens was not enough either — chord members and ~n tokens add semitones above the mark — so the ceiling is trial-bound and read back.',
  },
  {
    id: 'entry_ramp',
    role: 'layering',
    intent: 'A voice arriving mid-song must arrive gradually. The device for this existed and was anchored to bar 0 instead of to the voice\u2019s own first bar.',
    evidence: {
      kind: 'ear', song: 'su_calm_water / su_excited_space / su_somber_aftermath (r23-suite export)',
      hisComment: 'the synth sounds pretty good when it came in but just way too loud / when the synth comes in in the middle it\u2019s good but way too loud / the synth is too loud when it comes in but the synth itself I like and the notes. Earlier: strings should always FADE in at times like this not just cut in and spawn in.',
      read: 'Measured in the mix per sound, first sounding bar against steady state two bars later: a mid-song entry arrives LOUDER than it then plays — violin 1.40x, flute 1.37x, timpani 1.24x, pad 1.06x. After: 0.3-0.6x.',
    },
    shape: 'Read the entry bar off the layer\u2019s own mask so it cannot drift out of sync with it, then ramp gain across the first three bars from that point.',
    applies: { roles: ['all'], genres: ['all'], conditions: 'not the base accompaniment, the tune itself, or the drums' },
    status: 'wired', impl: 'audition-songs.mjs ENTRY_RAMP / entrySpanOfExpr / withEntryAt',
  },
  {
    id: 'entry_stagger',
    role: 'layering',
    intent: 'Five or more voices switching on in one bar reads as a forced drop. Real arrangements assemble.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (58 files)', scope: 'whole file, bar-quantised voice counts; percussion collapsed to one voice on both sides',
      hisComment: 'you dont have to always do a beat drop, especially in calmer or more atmospheric song / whenever it feels like a beat drop, the note that the piano and stuff begins on sort of negates that drop because it sounds forced',
      read: 'Voices arriving in one bar, percussion collapsed to ONE voice on both sides and gain-weighted: reference median 4 / p75 5 / p90 6 / max 10, ours 4 / 6 / 7 / 9. After staggering groups of 5+: 4 / 5 / 6.',
    },
    shape: 'Delay, never anticipate — a delayed voice stays inside the section it was cast for. Order by a hash of the voice\u2019s own expression, not by its index in the mix, so the stagger does not depend on assembly order.',
    applies: { roles: ['all'], genres: ['all'] },
    status: 'wired', impl: 'audition-songs.mjs entryPlan / rampSlot',
    wiredNote: 'r24. TWO measurement errors before this number. Counting each of our drum SOUNDS as a voice, against a reference that counts a kit as one channel-9 part, reported median 6 / max 13 vs 4 / 10 — a 1-voice gap read as 7. And the un-weighted count could not see the fix at all, because a voice ramped to gain 0 still emits a hap. The breakdown DEPTH, the first hypothesis, was never the problem: 0.69 median dip against the reference\u2019s 0.75.',
  },
  {
    id: 'phrase_split_reseed',
    role: 'melody',
    intent: 'A returning phrase is not the same phrase. Repetition lives inside a section, not across statements of a letter.',
    evidence: {
      kind: 'midi-set', set: 'audios/manual-r22 + manual-r22b (59 files)', scope: 'whole file, melody part = highest median pitch among parts dense enough to carry a tune',
      hisComment: 'for the section you repeated the same melody with nothing different for like a full section which was like 16 times or something',
      read: 'Longest stretch over which the melody repeats with period P in {1,2,4,8}: reference median 5 / p75 9 / p90 15 / max 44; our MASKED lead 11 / 14 / 16 / 32. Keying the seed on the STATEMENT number moved it by exactly zero. Splitting a statement at phrase length: 7 / 9 / 11 / 16.',
    },
    shape: 'Split a statement into chunks of the lead\u2019s own bound period and re-seed the walk from the second chunk. The melody\u2019s version of D102\u2019s rule for the accompaniment.',
    applies: { roles: ['melody'], genres: ['all'] },
    status: 'wired', impl: 'src/binder/arrange.js renderLetterLead perStatement/phraseBars; audition-songs.mjs leadStmtVary / leadPhraseBars / letterSeed',
    wiredNote: 'r24. A first pass reported median 24 and "72 of 72 bars" — it measured the UNMASKED _lead solo, which loops for the whole song by design. A second pass split the mix and picked the highest-median-pitch part on both sides; on our side that chose a declared synth BASS at median pitch 62. Only a hook that dumps the exact masked lead settled it, and the real gap was 2x, not 5x.',
  },
  {
    id: 'melody_cell_seed_is_dead',
    role: 'melody',
    intent: 'The melody rhythm cell selector takes a seed and never reads it, so two songs with a similar accompaniment retrieve the identical cell.',
    evidence: {
      kind: 'ear', song: 'su_happy_jungle (r23-suite export); confirmed by reading melodyRhythm and by the MELDEBUG dump',
      hisComment: 'is this melody (with random variations) for kalimba used in all jungle? this what it feels like',
      read: '`seedName` is a parameter of melodyRhythm and appears nowhere in its body; the cell is a pure argmax over meter, target density, accompaniment onset positions and heldFirst. Across the judged page the A letter draws 11 distinct cells from a 27-cell 4/4 pool — utm_dummy_7on_2 covers 12 songs, utm_dummy_6on 10. Both happy-jungle songs retrieve utm_dummy_4on_3 despite 124 vs 144 bpm and different density targets.',
    },
    shape: 'Rotate among cells whose interlock score is within epsilon of the top, by a hash of the song — the D99 travel-rotation shape — so retrieval keeps its quality ranking but stops being an argmax.',
    applies: { roles: ['melody'], genres: ['all'] },
    status: 'recorded',
    blocked: 'Seeding it re-rolls the melody cell on every unpinned song, which is a whole round of re-audition. His question is answered; the fix wants his ear on the result.',
  },

  // -------------------------------------------------------------------------
  // r27 — the @vanrivermusic reels. Read off the screen recording Ethan handed
  // over on 2026-08-29, together with the vibe labels he wrote in the DM thread
  // (see src/lib/progressions-vanriver.js). These three rows are the "extra
  // stuff" half of his ask: the chord LIST is in the progressions pack, and what
  // the hands do between the chords is here.
  // -------------------------------------------------------------------------
  {
    id: 'uneven_chord_length',
    role: 'harmony',
    intent: 'A chord\u2019s duration states its function. The chord the loop is ABOUT is held; everything travelling towards it is short. Length is a compositional parameter, not a grid.',
    evidence: {
      kind: 'reel', poster: 'vanrivermusic',
      file: 'ScreenRecording_08-29-2026 23-09-51_1.MP4', at: '265-291s',
      set: '@vanrivermusic reels, 8 progressions', scope: 'whole reel',
      read: 'Anchored on the reel above; the figure below aggregates all 8 in the recording. 155 chords, each measured against its own reel\u2019s median chord length. Only 36.8% last the modal unit; 23.2% last half of it or less; 14.8% last two to four times it. vid_vr_reflective holds six structural chords at 2.12s each and gives Bdim/F 0.50s \u2014 exactly a quarter. vid_vr_moody spans 0.5 to 3 units, a 6:1 ratio in one loop.',
    },
    shape: 'Give each chord in a pinned progression a duration weight from chordUnits rather than one bar each. The short slots are, in 5 of 8 reels, the unstable chords (dim / altered dominant / slash); in one they are two half-length re-voicings of ONE stable chord; in one (vid_vr_funky) the rule inverts and the diatonic chords are the short ones.',
    applies: { roles: ['harmony'], genres: ['city-pop', 'neo-soul', 'j-pop'] },
    status: 'recorded',
    blocked: 'The generator lays one chord per bar from a degrees string and every downstream mask (melody phrase alignment, section length, breakdown floor) assumes that. Weighted chord slots need a harmonic-rhythm layer under bindFigure, and turning it on would move every unpinned song. A whole round, not a drive-by.',
  },
  {
    id: 'subdivision_through_change',
    role: 'acc',
    intent: 'The accompaniment figure does not pause at the chord change. A steady subdivision runs underneath and the harmony moves over it.',
    evidence: {
      kind: 'reel', poster: 'vanrivermusic',
      file: 'ScreenRecording_08-29-2026 23-09-51_1.MP4', at: '294-377s',
      set: '@vanrivermusic reels, 158 chord slots', scope: 'whole reel',
      read: 'Anchored on the reel above; the figures below aggregate all 8 in the recording. Spectral-flux onset detection at 22050 Hz. Mean 5.91 audible attacks per chord slot, median 4; only 17.1% of slots carry a single strike and 71.5% carry three or more. Attacks per SECOND is flat regardless of chord length \u2014 vid_vr_ineedyourears plays 25 attacks under a 3-unit chord and 9 under a 1-unit chord, ~6/s either way. Our own accompaniment hand\u2019s median is ONE note per attack (r26).',
    },
    shape: 'Bind the acc hand as a continuous rhythmic cell whose PITCHES rebind at the chord change while its onset grid runs through unbroken \u2014 the opposite of re-striking a block on each new chord.',
    applies: { roles: ['accompaniment'], genres: ['all'] },
    status: 'recorded',
    blocked: 'This is D101\u2019s "the piano doesnt do any walking ... it\u2019s just chord bouncing" arriving from a second independent source, and the same thing blocks it: the acc composite is built per-bar from a figure token list, so a cell that spans a chord boundary has no representation. The D101 look-ahead token is half of the mechanism.',
  },
  {
    id: 'finger_order_voicing',
    role: 'acc',
    intent: 'A chord is played finger by finger from the top down rather than struck together \u2014 the intervals arrive in sequence, so the listener hears the voicing built rather than presented.',
    evidence: {
      kind: 'reel', poster: 'vanrivermusic',
      file: 'ScreenRecording_08-29-2026 23-09-51_1.MP4', at: '265-291s',
      scope: 'one reel',
      read: 'HIS instruction, verbatim: "reflective, sleepy, relaxing music. take note that it goes like pinky to thumb in terms of playing the note intervals rather than just playing the full chord together". MEASURED on that reel: median inter-onset interval 0.244s against a 2.12s chord \u2014 about eight separate strikes per chord, not one block. The DIRECTION was not confirmed: burst analysis found 25 rapid groups in 1207 onsets and split 7 descending / 7 ascending, and the within-chord pitch trace on his reel came out +0.08 (no direction). A spectral-peak tracker cannot separate voices in a polyphonic piano mix, so that is a limit of the method, not evidence against his ear.',
    },
    shape: 'Spread a chord\u2019s tones across the beat top-down instead of stacking them on one onset. Distinct from a strum: the spacing measured here is an eighth note, not 30ms.',
    applies: { roles: ['accompaniment'], genres: ['neo-soul', 'city-pop'] },
    status: 'recorded',
    blocked: 'Wants an ear before it is built. The engine already has an arpeggio class and a chordTop thickener; what it lacks is a form that takes ONE chord and spends a whole chord slot on it in a fixed finger order. Also gated on uneven_chord_length \u2014 a top-down spread needs a long slot to spread across.',
  },
];

/** Look a technique up by id. */
export function technique(id) {
  return TECHNIQUES.find((t) => t.id === id) ?? null;
}

/** Techniques the engine actually implements. */
export function wiredTechniques() {
  return TECHNIQUES.filter((t) => t.status === 'wired');
}
/**
 * Recorded-but-unbuilt techniques, with what each is waiting on. This is the
 * "analysis isn't wasted" half — the backlog is queryable instead of buried in
 * a research .md nobody re-reads.
 */
export function pendingTechniques() {
  return TECHNIQUES.filter((t) => t.status === 'recorded')
    .map((t) => ({ id: t.id, role: t.role, intent: t.intent, blocked: t.blocked }));
}
