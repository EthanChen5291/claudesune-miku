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
  // LAYERING — from the production-breakdown reels (the face-cam / DAW ones)
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
    status: 'recorded',
    blocked: 'the per-statement salt (D97) re-generates a cell; this transposes one instead. Needs a statement-level transpose hook.',
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
