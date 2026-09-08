// Layer patterns read off his 8 layer-stacking reels — r31.
//
// HIS ASK, verbatim: "analyze and learn and hardcode these chord progressions and
// layering patterns by instrument and the pattern they're doing via intervals and
// rhythm. the reel format is like they show one instrument for one measure then
// move to the other instrument but they stack. the idea is that we can merge all
// the patterns I feed you and select and choose and combine regardless of what
// reel they came from, using metadata and verification and which combos work
// well." And: "Important that you learn and hardcode the patterns for each
// instrument and figure out how they combine it, which layers contribute to the
// vibe, and how we can combine. as well as how they layered it"
//
// ---------------------------------------------------------------------------
// THE FORMAT, CONFIRMED FROM AUDIO
// ---------------------------------------------------------------------------
// He describes the reels as "one instrument for one measure then move to the
// other instrument but they stack". That is measurable without watching: each new
// instrument adds energy in a new band, so a layer entry is a per-band step that
// PERSISTS. Measured (scratch/r31/entries.py) the entries land ON BAR LINES —
// reel 6 at bars 1.0, 2.0, 3.0, 4.0; reel 8 every 2 bars. His description is
// exact.
//
// ---------------------------------------------------------------------------
// WHY A ROW IS SHAPED LIKE THIS
// ---------------------------------------------------------------------------
// A row is a `bindFigure` spec (rhythm.onsets + intervals + accents on a grid)
// plus placement metadata. That is deliberate: it means a pattern read off a
// stranger's reel goes through the SAME binder as the engine's own foundations,
// so "combine regardless of what reel they came from" is a data question rather
// than a code question. `scripts/audition-songs.mjs` opts.reelLayers is the whole
// adapter.
//
// Rows are addressed BY NAME, never iterated or length-indexed (the techniques.js
// rule, D95/D101), so adding one can never re-roll an existing song.
//
// ---------------------------------------------------------------------------
// WHAT THE ENGINE OVERRULES
// ---------------------------------------------------------------------------
// `octaveVsLead` and `gainVsLead` are RELATIVE, and the adapter allocates
// downward from the lead and caps under it (r29/D77). His four r28 "the high
// synth is too loud" cards outrank a stranger's mix decision. Likewise the D102
// metronome test applies to imported material: a pattern that is a pulse or a
// gear change does not cast, however it was played on the reel.
//
// `ratified: false` on every row. Only his ear promotes anything.

/**
 * MEASURED ACOUSTIC SIGNATURE OF HIS LABELS — and it refutes the obvious answer.
 *
 * He asked in capitals: "LEARN HOW THIS SOUNDS HAPPY". The answer this project
 * would have assumed is MODE, and mode is wrong.
 *
 * Reels 3, 5 and 8 all carry the same label (3, then 5 and 8 as "sounds like
 * 3"), which makes them the only vibe with independent replicates and therefore
 * the only place the question is answerable rather than anecdotal. What the three
 * agree on:
 *
 *   mode      maj, min, min          NOT shared
 *   tempo     190, 148, 300 BPM      NOT shared (a 2x spread)
 *   centroid  2952, 3567, 3639 Hz    all top-half, 1.55x the other five reels
 *   hi/lo     0.038, 0.082, 0.119    2.28x the other five
 *   onsets/s  3.9, 3.9, 3.4          a tight band
 *
 * So his "casual happy task" vibe is a TREBLE-AND-DENSITY property, not a modal
 * one. Two of his five happy-ish reels are minor-third dominant (0.50, 0.52) —
 * indistinguishable from the industrial reel (0.54) on mode alone.
 *
 * And his labels order almost monotonically by brightness:
 *   614 dark_space | 1805 holiday | 2343 casual_bright | 2850 task_active
 *   2952 casual_task | 3304 industrial | 3567 + 3639 casual_task
 * The one reel he called DARK is a 25-100x outlier downward (hi/lo 0.001):
 * darkness here is the ABSENCE OF HIGHS, not minor mode.
 *
 * CAVEATS, because a spectral centroid is a blunt instrument: it is raised by a
 * hi-hat as much as by a bright synth, and these reels BUILD UP, so a longer
 * stack ends brighter. Layer count does not explain it (reel 2 has 19 layer
 * entries and the third-LOWEST centroid; reel 8 has 8 and the highest), which
 * weakens that confound but does not remove it. Per-layer note data overrules
 * this wherever the two disagree.
 */
export const VIBE_ACOUSTICS = {
  dark_space: { centroid: 614, hiLo: 0.001, majMin: 0.98, onsetsPerSec: 2.76 },
  holiday_bright: { centroid: 1805, hiLo: 0.019, majMin: 2.00, onsetsPerSec: 3.29 },
  casual_bright: { centroid: 2343, hiLo: 0.025, majMin: 1.54, onsetsPerSec: 3.85 },
  casual_task_active: { centroid: 2850, hiLo: 0.061, majMin: 0.36, onsetsPerSec: 3.00 },
  industrial_mission: { centroid: 3304, hiLo: 0.069, majMin: 0.54, onsetsPerSec: 3.82 },
  casual_task: { centroid: 3386, hiLo: 0.080, majMin: 0.78, onsetsPerSec: 3.73, replicates: [3, 5, 8] },
};

/** His 8 labels, grouped. The vocabulary is HIS — these are his words. */
export const VIBE_CLASSES = {
  dark_space: {
    reels: [1],
    his: "Dark and space ish ... this is good pattern for the genre as a supplement and also for energy vibes for dark vibes",
    lanes: ['space', 'lab', 'cave', 'stealth', 'aftermath'],
    emotions: ['mysterious', 'somber', 'tense'],
  },
  casual_bright: {
    reels: [2],
    his: "casual day / menu / happy vibes (LEARN HOW THIS SOUNDS HAPPY) / bright activity",
    lanes: ['menu', 'shop', 'rest', 'water', 'snow'],
    emotions: ['happy', 'calm', 'nostalgic'],
  },
  casual_task: {
    // THREE reels carry this label — 3, and then 5 and 8 as "sounds like 3".
    // That repetition is the most useful thing in his whole export: it is the
    // only vibe with independent replicates, so it is the only one where "what
    // do these share" is answerable rather than anecdotal.
    reels: [3, 5, 8],
    his: "Feels like when you're playing Roblox or something and you just get assigned a task in a casual happy game. Can also be generalized to anything casual and intentional environment or scene or the menu too",
    lanes: ['menu', 'shop', 'training', 'rest', 'construction'],
    emotions: ['happy', 'excited', 'calm'],
  },
  industrial_mission: {
    reels: [4],
    his: "Feels a bit more industrial like construction or a mission or something",
    lanes: ['construction', 'lab', 'training', 'stealth'],
    emotions: ['tense', 'excited'],
  },
  casual_task_active: {
    reels: [6],
    his: "Sounds like 3. But more mission/task focused like less passive and more like they just got assigned something",
    lanes: ['training', 'construction', 'shop', 'menu'],
    emotions: ['excited', 'happy', 'tense'],
  },
  holiday_bright: {
    reels: [7],
    his: "Sounds like happy holiday vibes",
    lanes: ['festival', 'shop', 'snow', 'kitchen'],
    emotions: ['happy', 'triumphant', 'nostalgic'],
  },
};

/** Lanes no reel pattern may reach — his standing r27 ruling. */
export const NICHE_LANES = new Set(['desert', 'jungle', 'manor', 'catacombs', 'citadel']);

/**
 * One row per (reel, instrument). Filled by the r31 transcription pass; every
 * row cites the reel and timestamp it was read from.
 * See the header for the field contract.
 */
export const LAYER_PATTERNS = {
  // =========================================================================
  // REEL 1 — redbowmusic, "The most overpowered chord in all dark music"
  // His label: "Dark and space ish ... good pattern for the genre as a
  // supplement and also for energy vibes for dark vibes"
  //
  // 131 BPM (measured off the playhead at 151.4 px/s; one bar = 277.6 px =
  // 1.834 s), 4-bar loop, A#/Bb minor. No chord labels anywhere — the harmony
  // below is read from the piano-roll NOTE LABELS.
  //
  // THE CHORD IS THE SUBJECT: R + 9 + b3 + 5, with the NINTH VOICED BELOW THE
  // MINOR THIRD, so a minor 2nd sits inside an otherwise consonant stack
  // (F5/F#5, then C5/C#5). That is the same principle as D93's fifth pincer —
  // the friction is BETWEEN two consonant intervals rather than smeared through
  // the voicing — arrived at from a completely different direction.
  //
  // NOTE ON HIS OWN EXAMPLE: he wrote "D F F# A#", which is 0-3-4-8 and a
  // strange set. The roll spells it D#4 F5 F#5 A#5 — he dropped a sharp. The
  // real shape is 0-2-3-7.
  //
  // ADVERSARIALLY VERIFIED, and the verify pass corrected three things:
  //  CONFIRMED  the interval set {0,+2,+3,+7} with the 9 voiced UNDER the b3
  //             (F5 sounds below F#5), read off the labels AND confirmed
  //             acoustically by FFT (156.1/349.9/370.1/467.0 Hz).
  //  CONFIRMED  chord 2 is a LITERAL -5 transposition of chord 1, rhythm
  //             included, matching the reel's own card "move it 5 notes down".
  //  CONFIRMED  131 BPM by two independent methods — playhead tracking
  //             (152.2 px/s, 4 bars in 7.32s) and audio onsets (0.46s IOI).
  //  CONFIRMED  NO PERCUSSION AT ALL: 3-8 kHz is ~2% of spectral energy and
  //             8-11 kHz ~0.06%. That independently confirms the hi/lo = 0.001
  //             outlier in VIBE_ACOUSTICS — his "dark" reel has no kit, and
  //             darkness here really is the absence of highs.
  //  CORRECTED  the pedal sits 14-19 semitones under the arpeggio, not 15-17.
  //  CORRECTED  "4 layers" overstates independence. Layers 2/3/4 are three
  //             notes of ONE arpeggio cell on ONE instrument, no two ever
  //             striking together. THE REAL TEXTURE IS TWO PARTS: a sustained
  //             2-bar bass pedal plus a 3-notes-per-bar arpeggio. The block
  //             stack is kept as its own row because bars 1-3 genuinely play it
  //             that way, but a stack that casts all three rows is casting the
  //             same instrument twice — `comboScore` reports 100% onset overlap
  //             for exactly that reason.
  //  CAUTION    the labels are FL's octave convention (C5 = middle C), ONE
  //             OCTAVE ABOVE scientific pitch. Every note name in `read` fields
  //             below is as-shown, i.e. FL.
  // =========================================================================
  lp_r1_pedal: {
    reel: 1, poster: 'redbowmusic', sourceAt: '0-32.3s',
    role: 'bass', instrument: 'low root pedal (no track name shown — single piano roll)',
    rhythm: { bars: 2, grid: 16, onsets: ['0'], accents: [0.55], legato: true },
    intervals: ['R'],
    frozen: false,          // D#4 -> A#3, re-pitches with the chord
    octaveVsLead: -2, gainVsLead: [0.3, 0.5], minEnergy: 0,
    sound: 'gm_pad_warm', synthSound: 'gm_synth_bass_1',
    read: 'one onset per chord, held the full 2 bars, no re-articulation; sits 14-19 semitones below the arpeggio (verify-corrected from 15-17)',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r1_arp: {
    reel: 1, poster: 'redbowmusic', sourceAt: '8.8-32.3s',
    role: 'arp', instrument: 'the repetitive arpeggio the reel builds ("make a repetitive arpeggio from it")',
    // PRIMARY: this is what the reel actually spends its time on (8.8s-32.3s of
    // 32.3s). The block stack is bars 1-3 only, i.e. the teaching step before it.
    // When two rows exclude each other, the primary one wins.
    primary: true,
    // beats 1, 2 and 4 — NOT a straight subdivision, and the gap on beat 3 is
    // what keeps it from reading as a pulse.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/4', '3/4'], accents: [0.58, 0.42, 0.46], legato: false },
    // b3 first, then DOWN a semitone to the 9th, then up to the 5th. The reel's
    // own arp is NOT bottom-to-top; that was his generalisation of it, and it is
    // carried separately as opts.synthRise{direction:'up'}.
    intervals: ['3', 's2', '5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'F#5 on beat 1 (len 2 beats), F5 on beat 2, A#5 on beat 4; the whole cell transposes -5 semitones for the second chord',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r1_addnine_stack: {
    reel: 1, poster: 'redbowmusic', sourceAt: '0-7.7s',
    role: 'chords', instrument: 'the add9 stack, block-sustained (bars 1-3, before it is arpeggiated)',
    // Casting this ALONGSIDE lp_r1_arp doubles one instrument — the verify pass
    // is explicit that the reel's real texture is two parts, not three.
    exclusiveWith: ['lp_r1_arp'],
    // ONE onset carrying a DOTTED token. bindFigure requires strictly
    // increasing onsets, so four notes at '0' throws — the dialect spells a
    // simultaneity with dots (`R.s2.3.5`), and token ORDER is the voicing.
    rhythm: { bars: 2, grid: 16, onsets: ['0'], accents: [0.5], legato: true },
    // R, 9, b3, 5 — THE NINTH BELOW THE MINOR THIRD is the whole device
    intervals: ['R.s2.3.5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.25, 0.45], minEnergy: 0,
    sound: 'gm_pad_warm', synthSound: 'gm_pad_warm',
    read: 'D#4 F5 F#5 A#5 held two bars, then A#3 C5 C#5 F5; the reel adds the four notes one at a time at 0.5s, 1.2s, 2.0s, 2.8s',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 6 — isaac.horner. His label: "Sounds like 3. But more mission/task
  // focused like less passive and more like they just got assigned something"
  //
  // MISLABELLED AS REEL 5 ON FIRST WRITE. The journal returns agents in
  // completion order, not reel order, and I read the index instead of the `n`
  // field. The transcription's own vibe reading — "a real functional dominant is
  // what separates task-assigned from passive" — matches HIS reel-6 label, not
  // his reel-5 one, which is what caught it.
  //
  // 79 BPM, 4-bar loop played 3x, A NATURAL MINOR (every sounding pitch class is
  // a white note except one G#). No chord labels — harmony read from the bass
  // roll and confirmed against the full stacks.
  //
  // THE FINDING: SIX TITLE CARDS, FOUR DISTINCT MIDI PARTS. Layer 2 ("Layering
  // Keys") is byte-identical to layer 1 and layer 5 ("Layering Pad") is
  // byte-identical to layer 3 — the piano roll does not change at all when the
  // card flips. HALF THIS REEL IS TIMBRAL LAYERING ON UNCHANGED NOTES. That is a
  // real technique and it is invisible if you count title cards, which is what
  // his "they stack" description would lead you to do. It also corroborates
  // D102 from the other side: there, sharing a TIMBRE was the defect; here,
  // sharing the NOTES and changing only the timbre is the deliberate device.
  //
  // REGISTER HAS A DELIBERATE HOLE IN THE MIDDLE: bass MIDI 26-45, then keys
  // (50-69) and piano (52-76) almost on top of each other, then strings far
  // above. Nothing at all between 45 and 50.
  //
  // NOT HARDCODED: the "6. Strings" layer. It is an unbroken diatonic A-minor
  // scale that is NEITHER frozen NOR chord-locked — it just climbs through the
  // harmony — and the transcription gives its contour but not enough of its
  // rhythm to write a row that is not partly invented. Recorded here rather
  // than guessed: written FL G6-E8, contour C7 B6 A6 G6 | A6 held, and the
  // sounding octave is uncertain because MIDI 100 is above any real string
  // instrument, so the patch must be transposed.
  // =========================================================================
  lp_r6_keys: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'lead', instrument: '1. Digital Synth (and 2. "Layering Keys", which is the SAME MIDI on a second timbre)',
    timbralDouble: '2. Layering Keys — byte-identical notes, a second patch over the same roll',
    // 4 of the bar's 8 onsets. The back half of the bar was read only partially,
    // so it is left out rather than invented — a short honest row beats a long
    // guessed one.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '3/16', '6/16', '1/2'], accents: [0.6, 0.44, 0.46, 0.4], legato: false },
    intervals: ['R.3.5.s7.s2', 'R.3.5.s7.s2', 'R.3.5.s7.s2', 's4'],
    frozen: false,          // re-pitches on the chord change, rhythm held constant
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'FL D4-A5 = D3-A4 scientific, only 7 pitch rows in the whole roll. Over Dm the chord hits spell R b3 5 b7 9 (D-F-A-C-E); the 4th onset is the 11 alone (G4). Full bar grid x..x..x.xxx.x.x.',
    partialRead: 'onsets 9/16, 10/16, 12/16 and 14/16 are in the roll but their pitches were not resolved',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r6_piano_roll_chord: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'chords', instrument: '3. Piano (and 5. "Layering Pad", which is the SAME MIDI on a second timbre)',
    timbralDouble: '5. Layering Pad — verified note-by-note, every onset and length matches within 0.2 of a sixteenth',
    // A ROLLED chord, not a block: the voices enter one 16th apart, bottom-up.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/16', '2/16', '3/16'], accents: [0.5, 0.44, 0.44, 0.46], legato: true },
    intervals: ['R', '3', '5', 's7'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.26, 0.48], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_pad_warm',
    read: 'SILENT for loop bars 1-2 (checked twice on views 12s apart). Bar 3 is Fmaj7 rolled bottom-up R-3-5-7 with the root doubled at the octave; bar 4 is E7sus4 resolving to E7.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r6_bass: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'bass', instrument: '4. Bass Guitar',
    // THROUGH-COMPOSED: the only layer in the reel that is not a loop. Bar 1 is
    // encoded here as the representative bar; the row says so rather than
    // pretending the pattern repeats.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/2', '10/16', '3/4', '13/16'], accents: [0.62, 0.48, 0.42, 0.5, 0.42], legato: false },
    intervals: ['R', 'R', '5', '5+', '5'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.34, 0.6], minEnergy: 0,
    sound: 'gm_acoustic_bass', synthSound: 'gm_synth_bass_1',
    read: 'FL D2-A3 = D1-A2 scientific, MIDI 26-45 — two octaves below the keys, and nothing else in the mix goes below MIDI 52. Bar 1: 0 held 7 slots, then 8, 10, 12, 13.',
    throughComposed: 'DIFFERENT EVERY BAR — the only layer here that is not a loop. Bar 1 encoded as representative; bar 2 walks R, b7, R-up-an-octave.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 2 — isaac.horner. His label: "casual day / menu / happy vibes
  // (LEARN HOW THIS SOUNDS HAPPY) / bright activity". E MAJOR — and this is the
  // one reel where the mode agrees with the label.
  // =========================================================================
  lp_r2_string_pluck: {
    reel: 2, poster: 'isaac.horner', sourceAt: '33.6-89.4s',
    role: 'pluck', instrument: '5. String Pluck',
    // THE DEVICE: straight staccato 8ths with THE LAST 8TH OF EVERY BAR LEFT
    // EMPTY. Seven hits, one hole, every bar. The hole is what stops it reading
    // as a machine — and it is the same instinct as D102's metronome test,
    // arrived at by a producer rather than by a rule.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4'], accents: [0.6, 0.4, 0.46, 0.4, 0.52, 0.4, 0.44], legato: false },
    intervals: ['R', '3', '5', 'R+', 'R', '3', '5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.28, 0.5], minEnergy: 0,
    sound: 'gm_pizzicato_strings', synthSound: 'gm_lead_2_sawtooth',
    read: 'grid xxxxxxx.xxxxxxx. over 16 pulses. Voicings per chord: G#7 = R 3 5 R+8ve; Emaj7 = R 3 5 7; C#m9 = R b3 5 b7 9.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_barline_bass: {
    reel: 2, poster: 'isaac.horner', sourceAt: '33.6-89.4s',
    role: 'bass', instrument: '7. Synth Bass',
    // EXTREMELY SPARSE and placed entirely at BAR LINES — a pickup plus its
    // downbeat, straddling the bar. Nothing in the middle of a bar at all.
    rhythm: { bars: 1, grid: 16, onsets: ['7/16', '1/2'], accents: [0.44, 0.62], legato: false },
    intervals: ['s7', 'R'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.34, 0.6], minEnergy: 0,
    sound: 'gm_contrabass', synthSound: 'gm_synth_bass_1',
    read: 'G1-E2 (verify-corrected from G1-C#2). Two 2-note pickup+downbeat pairs per 16-pulse loop, both straddling a bar line.',
    verifyNote: 'the verify pass found THREE pairs, not two, and corrected the range; the pickup-into-downbeat SHAPE survived both readings',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 3 — isaac.horner. His label: "Feels like when you're playing Roblox ...
  // you just get assigned a task in a casual happy game". F MAJOR, a 2-bar
  // circle-of-fifths cycle. THE HARMONIC RHYTHM IS DOTTED QUARTERS.
  // =========================================================================
  lp_r3_bounce_808: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'bass', instrument: '5. 808 — the transcription calls it "THE BOUNCE ENGINE"',
    // A CHAIN OF DOTTED QUARTERS: onsets every 3 eighths against a 4/4 bar, so
    // the pattern re-phases against the beat and realigns every 3 bars. That is
    // R6 from the r22 reels (a cell length coprime with the bar) arriving from a
    // third independent source, and here it is the BASS carrying it.
    rhythm: { bars: 2, grid: 8, onsets: ['0', '3/8', '6/8', '9/8'], accents: [0.64, 0.5, 0.54, 0.48], legato: false },
    intervals: ['R', 'R', 'R', 'R'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.36, 0.62], minEnergy: 0,
    sound: 'gm_synth_bass_1', synthSound: 'gm_synth_bass_1',
    read: 'chord ROOTS on 8ths 0, 3, 6, 9 of the 2-bar cycle, each held ~3 eighths: G -> C -> F -> D.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r3_frozen_hook: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'lead', instrument: '8. Digital Lead',
    // FROZEN: the same four pitches run unchanged across G, C, F and D, so their
    // MEANING changes under them while the notes do not. Same principle as r30's
    // frozen rise and r22's R2, here as a melodic hook. The reel plays it for
    // three bars then answers in the fourth — the classic 3+1 shape.
    rhythm: { bars: 1, grid: 8, onsets: ['0', '2/8', '4/8', '6/8'], accents: [0.6, 0.44, 0.5, 0.46], legato: false },
    intervals: ['5', '3', '6', '5'],
    frozen: true,
    octaveVsLead: 0, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_1_square',
    read: 'a 1-bar riff repeated for THREE bars then a written answer bar (3+1). Pitches C4-A3-D4-C4 held unchanged across all four chords.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 4 — isaac.horner. His label: "Feels a bit more industrial like
  // construction or a mission". B MINOR, DORIAN-INFLECTED — and that is the
  // finding: THE IV IS E MAJOR, NOT E MINOR. A raised 6th in a minor key is what
  // keeps it from reading as sad, which is the mechanism his "LEARN HOW THIS
  // SOUNDS HAPPY" question is really about (see VIBE_ACOUSTICS: mode alone does
  // not separate his labels, but MODE INFLECTION does).
  // =========================================================================
  lp_r4_pushed_eighths: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    role: 'chords', instrument: '1. Talking Synth',
    // Straight 8ths with ONE 16TH PUSH — the 7/16 onset is the only thing off
    // the 8th grid, and it is what gives the part its lean.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/4', '3/8', '7/16', '1/2', '5/8', '3/4', '7/8'], accents: [0.6, 0.46, 0.42, 0.5, 0.52, 0.42, 0.46, 0.42], legato: false },
    intervals: ['R.3.5.s7', 'R.3.5.s7', '5', 's7', 'R.3.5.s7', '5', 'R.3.5.s7', '5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'bar grid x...x.xxx.x.x.x. — root-position close stack R-3-5-b7(-9) on every chord.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  lp_r4_crispy_bass: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    role: 'bass', instrument: '2. Crispy Bass (5. "Layering Bass" is its timbral double)',
    timbralDouble: '5. Layering Bass — identical MIDI, verified where the two segments overlap',
    // LOCKED TO THE CHORD LAYER'S GRID: the bass strikes exactly where the
    // Talking Synth does. That is the opposite of the interlock this project
    // usually rewards, and it is deliberate here — the two read as one attack.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/4', '3/8', '7/16', '1/2', '5/8', '3/4', '7/8'], accents: [0.64, 0.48, 0.44, 0.5, 0.54, 0.44, 0.48, 0.44], legato: false },
    intervals: ['R', 'R+', 'R', '3', 'R', '5', 'R', '5'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.34, 0.6], minEnergy: 0,
    sound: 'gm_synth_bass_1', synthSound: 'gm_synth_bass_1',
    read: 'B2-F#4. Locked to the Talking Synth grid x...x.xxx.x.x.x. — the root line with octave leaps and chromatic connectors.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r4_accordion_lead: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    role: 'lead', instrument: '7. Accordian (spelled that way on screen)',
    // ITS ONE REST IS THE POINT: it is silent through the first six sixteenths
    // of the bar — the only rest in the part — and it falls exactly where the
    // chord layer is thickest. The melody enters in the hole.
    rhythm: { bars: 1, grid: 16, onsets: ['3/8', '1/2', '3/4', '7/8'], accents: [0.56, 0.5, 0.52, 0.46], legato: false },
    intervals: ['s7', 'R+', '5', '3'],
    frozen: false,
    octaveVsLead: 0, gainVsLead: [0.32, 0.56], minEnergy: 0,
    sound: 'gm_accordion', synthSound: 'gm_lead_1_square',
    read: 'B4-C6, working band F5-C6. Grid ......x.x...x.x. — it RESTS through slots 0-5, the only rest in the part, exactly under the chord layer\'s densest moment. A through-composed monophonic melody, chord tones with chromatic approach notes.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 5 — isaac.horner, "How to make charm beats in fl studio".
  // His label: "Sounds like 3. Vibes". B minor / D major, 2-bar loop, ONE CHORD
  // EVERY 2 BEATS. Eleven layers — the densest reel in the set.
  // =========================================================================
  lp_r5_offbeat_pluck: {
    reel: 5, poster: 'isaac.horner', sourceAt: '171.3-223.6s',
    role: 'pluck', instrument: '9. Pluckington',
    // PURELY OFFBEAT: every onset is on an "and", nothing on any downbeat. It is
    // also nearly FROZEN — a B5 pedal that re-pitches only when the harmony
    // leaves it behind. Offbeat + pedal is the whole layer.
    rhythm: { bars: 1, grid: 16, onsets: ['1/8', '3/8', '5/8'], accents: [0.46, 0.44, 0.46], legato: false },
    intervals: ['R', 'R', 'R'],
    frozen: true,
    octaveVsLead: 0, gainVsLead: [0.24, 0.44], minEnergy: 0,
    sound: 'gm_pizzicato_strings', synthSound: 'gm_lead_1_square',
    read: 'onsets on the "and" of beats 1, 2 and 3 (bar fractions 1/8, 3/8, 5/8). Nothing on any downbeat and nothing on beat 4.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r5_guide_tone_bell: {
    reel: 5, poster: 'isaac.horner', sourceAt: '171.3-223.6s',
    role: 'counter', instrument: '4. Church Bell',
    // IT PLAYS THE GUIDE TONES, and only those: the b7 on beat 1 and the 3 on
    // beat 3. Two notes a bar, chosen for the interval that DEFINES each chord
    // rather than for a contour. That is a different idea from every other
    // counter-line in this project, which pick by shape.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/2'], accents: [0.5, 0.46], legato: false },
    intervals: ['s7', '3'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.22, 0.42], minEnergy: 0,
    sound: 'gm_tubular_bells', synthSound: 'gm_music_box',
    read: 'plain quarters, beats 1 and 3 only, then long rests. Over Am9|D7b9: G5 = b7 of Am9, F#5 = 3 of D7b9.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 7 — isaac.horner. His label: "Sounds like happy holiday vibes".
  // Gb major, harmonic rhythm ONE CHORD PER BEAT — four chords a bar, the
  // fastest in the set.
  // =========================================================================
  lp_r7_beat_chords: {
    reel: 7, poster: 'isaac.horner', sourceAt: '265.0-304.8s',
    role: 'chords', instrument: '1. Piano (with 2/5/6 as timbral doubles of it)',
    timbralDouble: '2. Short Strings, 5. Bell Layer and 6. Synth Layer are all the SAME roll — three of the seven cards add no new notes',
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/4', '1/2', '3/4', '7/8'], accents: [0.6, 0.48, 0.5, 0.48, 0.44], legato: false },
    intervals: ['R.3.5', 'R.3.5', 'R.3.5', 'R.3.5', '5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'piano', synthSound: 'gm_epiano1',
    read: 'odd bars x...x...x...x.x. — a chord ON EVERY BEAT, root doubled an octave below in the left hand, right hand in root position.',
    vibes: ['holiday_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r7_frozen_bell_tune: {
    reel: 7, poster: 'isaac.horner', sourceAt: '265.0-304.8s',
    role: 'lead', instrument: '3. Church Bell',
    // FROZEN AS A TUNE: the same 6-note phrase recurs while the chords cycle
    // underneath at one per beat. With harmony moving that fast, a melody that
    // re-pitched would have no shape left — so it does not.
    rhythm: { bars: 1, grid: 16, onsets: ['3/8', '1/2', '3/4'], accents: [0.5, 0.58, 0.48], legato: true },
    intervals: ['3', '5', 'R+'],
    frozen: true,
    octaveVsLead: 0, gainVsLead: [0.3, 0.52], minEnergy: 0,
    sound: 'gm_tubular_bells', synthSound: 'gm_music_box',
    read: 'quarters and halves, one note per chord, changing ON the piano chord changes and never between them. The 6-note phrase recurs in bars 1-2 and again in 3-4.',
    vibes: ['holiday_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // =========================================================================
  // REEL 8 — isaac.horner. His label: "sounds like 3." D DORIAN over the
  // C-major collection (tonic D, B and F both natural) — the third casual_task
  // replicate, and the second of the three to be DORIAN-INFLECTED rather than
  // plain minor.
  // =========================================================================
  lp_r8_syncopated_stabs: {
    reel: 8, poster: 'isaac.horner', sourceAt: '307.6-333.5s',
    role: 'chords', instrument: '1. Synth Keys',
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/8', '3/8', '3/4'], accents: [0.6, 0.44, 0.5, 0.46], legato: false },
    intervals: ['R.3.5.s7.s2', 'R.3.5.s7', 'R.3.5.s7', 'R.3.5.s7'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'x.x...x.....x... — syncopated 8th chord stabs, NOT on every beat. Close position with the root doubled an octave below the stack: R + (R 3 5 b7 9).',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r8_legato_root_walk: {
    reel: 8, poster: 'isaac.horner', sourceAt: '307.6-333.5s',
    role: 'bass', instrument: '6. Synth Bass',
    // MONOPHONIC AND FULLY LEGATO — each note runs straight into the next with
    // no gap, and the roots walk CHROMATICALLY (D, D#, E, C, C#). A chromatic
    // bass under a diatonic top is what makes this reel move without changing key.
    rhythm: { bars: 1, grid: 16, onsets: ['0', '1/2'], accents: [0.6, 0.5], legato: true },
    intervals: ['R', 'R'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.34, 0.6], minEnergy: 0,
    sound: 'gm_synth_bass_1', synthSound: 'gm_synth_bass_1',
    read: 'one long note per chord, no gaps. A-version root sequence D4 -> D#4 -> E4 -> C5 -> C#5 — a chromatic walk.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },

  // ==========================================================================
  // r32 — THE REST OF WHAT WAS PLAYED
  // ==========================================================================
  // The r31 library held 19 rows against ~60 transcribed layers: reel 5 has
  // ELEVEN parts and had 2 rows, reel 7 has eight and had 2. A combination
  // cannot be faithful when most of what was played was never recorded, and
  // that is the other half of his "the combination wasn't that good ... more
  // faithfully to the reel".
  //
  // Authored one reel at a time straight from the transcriptions in
  // scratch/r32/reel<N>.json, then checked: parses, no duplicate key, onsets
  // strictly increasing and inside [0, bars), onsets/intervals/accents equal
  // length, the D102 metronome test, every `sound` and `synthSound` a real
  // INSTRUMENTS key, binds against the reel's own chordBeats harmony without
  // throwing, and the out-of-key rate measured.
  //
  // VERIFICATION STATUS, honestly: reels 1 and 2 got an independent adversarial
  // pass as well (a second agent trying to REFUTE each row against the source
  // prose); reels 3, 4, 6 and 8 did not — that pass ran out of budget. Their
  // rows carry the mechanical checks above and a fidelity spot-check, nothing
  // more. Reels 5 and 7 got nothing and remain under-covered. Every row is
  // `ratified: false, needsEar: true` and enters no retrieval pool: a row only
  // sounds when a card names it, so an unverified row cannot re-roll a song.
  //
  // ONE MEASUREMENT WORTH KEEPING, refuted from my own first hypothesis: five of
  // these rows carry bare `4`/`7` tokens, and the standing rule says those spell
  // foreign pitches. Measured, swapping them for `s4`/`s7` changed the
  // out-of-key rate by 0.0, 0.0, 0.0 and +2.5 points — it did not help and once
  // hurt. The high rates (reel 8 24-28%, reel 4 23-24%) are the REELS' OWN
  // CHROMATICISM: a roots-only figure on reel 8's progression is already 25%
  // out-of-key, because its bass IS a chromatic climb, and reel 4's chords carry
  // C#7's E#, F#7's A# and two passing dim7s. Faithful, not defective.

  // ---- r32 · REEL 1, THE TWO GAPS THE r31 ROWS LEFT -----------------------
  // Reel 1's four transcribed layers were all already covered (pedal + arp +
  // block stack), so nothing here is a NEW instrument. What was missing is
  // SUSTAIN, and both gaps were measured against the r32 `chordBeats` harmony
  // (rp_r1_iv_i_add9, two madd9 chords of 8 beats each):
  //   lp_r1_pedal    sounds 50.0% of the 4-bar loop. `bars: 2` with one onset
  //                  emits note-bar + REST-bar — the bound expression is
  //                  literally `<[D#4@4] [~] [A#3@4] [~]>`. The reel holds one
  //                  note across both bars with no re-articulation, so the low
  //                  pedal that the transcription calls "the root pedal
  //                  supplying the space" is absent for half of every chord.
  //   lp_r1_arp      binds three 1-beat notes with 0 overlapping pairs at
  //                  legato:false AND at legato:true (both measured). The
  //                  reel's notes are 2.06-2.09 beats long and deliberately
  //                  overlap, and that overlap is the entire subject of the
  //                  reel — the F5/F#5 minor 2nd, "the only interval in the
  //                  whole piece that is not a plain triad tone". In our
  //                  binding it NEVER SOUNDS as a dyad: F# is released exactly
  //                  when F begins. (At legato:true lp_r1_arp is contiguous,
  //                  not detached — 100% coverage — but still never stacked.)
  // bindFigure cannot sustain a note past the next onset, so neither gap is
  // reachable by an articulation flag. Both rows below buy the sustain with a
  // RE-STRIKE, which is a real departure and is stated in each `read`.
  //
  // NOT REACHED BY EITHER AUTO-CAST PATH WITHOUT NAME-ADDRESSED OPTS. Measured
  // with the real `stackOf` and the real `comboScore`: on the FAITHFUL block
  // lp_r1_arp is `primary: true` so it sorts first and excludes lp_r1_cluster_arp,
  // and lp_r1_pedal precedes lp_r1_pedal_held alphabetically so the new row's
  // own exclusiveWith drops it — cast comes out `lp_r1_arp, lp_r1_pedal`. On the
  // CROSSED block both pairs tie exactly (bass 57 vs 57, arp 7 vs 7) and the
  // picker uses a strict `>`, so the incumbent wins there too. These rows are
  // OPT-IN: serve them by name in SONG_OPTS (`reelLayers: ['lp_r1_pedal_held']`),
  // which is what an A/B against the incumbents needs anyway.
  // =========================================================================
  lp_r1_pedal_held: {
    // r32: PRIMARY over lp_r1_pedal. Same pitches, same placement — it only
    // closes the sustain gap (measured: lp_r1_pedal sounds 50.0% of its loop,
    // because a `bars: 2` figure whose onsets all fall in bar 1 emits a note-bar
    // and then a REST bar; the reel holds its root for the full 8 beats). The
    // arp pair is deliberately NOT re-flagged: lp_r1_arp keeps `primary` because
    // it is what he heard on the card he said "I like the layering" about.
    primary: true,
    reel: 1, poster: 'redbowmusic', sourceAt: '10.3-32.3s',
    role: 'bass', instrument: 'low root pedal (no track name shown — single piano roll)',
    // Identical to lp_r1_pedal in every sounding field except the second onset
    // (and the accent it needs). That is deliberate: it makes coverage the ONLY
    // variable if his ear A/Bs the two.
    exclusiveWith: ['lp_r1_pedal'],
    rhythm: { bars: 2, grid: 16, onsets: ['0', '1'], accents: [0.55, 0.5], legato: true },
    intervals: ['R', 'R'],
    frozen: false,          // D#4 -> A#3, re-pitches with the chord
    octaveVsLead: -2, gainVsLead: [0.3, 0.5], minEnergy: 0,
    sound: 'gm_pad_warm', synthSound: 'gm_synth_bass_1',
    read: 'the reel holds ONE root across both bars of each chord, no re-articulation ("x..............." then a bar tied through). MEASURED: lp_r1_pedal renders that as one bar of root then a literal REST bar — 50.0% sounding coverage of the 4-bar loop, 2 haps. Striking the root on each bar\'s downbeat and letting legato carry it gives 100.0% (4 haps, one voice ringing at every one of the 16 beats). 0 out-of-key. THE DEPARTURE: one extra attack per chord, which the reel does not play; the proper fix is a binder that can sustain across a barline.',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r1_cluster_arp: {
    reel: 1, poster: 'redbowmusic', sourceAt: '8.8-32.3s',
    role: 'arp', instrument: 'the repetitive arpeggio, encoded as its SOUNDING verticalities',
    // Same instrument as lp_r1_arp and lp_r1_addnine_stack, played a third way.
    exclusiveWith: ['lp_r1_arp', 'lp_r1_addnine_stack'],
    // TWO BARS, because the tie is bar-dependent and a 1-bar row cannot say so:
    // the beat-4 fifth ties over the barline into bar 2's beat 1, but its copy on
    // bar 2's beat 4 is TRUNCATED because the chord changes. So bar 1 opens with
    // the b3 alone and bar 2 opens with the b3 under the still-ringing 5th.
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '1/4', '3/4', '1', '5/4', '7/4'],
      // the two dyad onsets are scaled by 1/sqrt(2) off the single-note values
      // (0.42 -> 0.30, 0.58 -> 0.41): D98's rule that two notes at one gain read
      // as a +3dB accent.
      accents: [0.58, 0.30, 0.46, 0.41, 0.30, 0.46],
      // LEGATO, not detached. The source says the arp notes are half notes at
      // 1-beat spacing and "held/legato so it overlaps the beat-4 note", and
      // whyThisVibe #3 is "the cluster never clears — two of three voices always
      // sustain together". At legato:false this row measured 4 of 16 beats with
      // ZERO voices ringing (75.0% coverage) — the beat-3 hole the reel does not
      // have, which turns the F/F# rub into exactly the "passing crunch" the
      // transcription says it is not. legato:true: 100.0% coverage, 0 silent
      // beats, ring-per-beat [1 2 2 1 | 2 2 2 1] against the reel's
      // [1 2 1 1 | 2 2 1 1].
      legato: true,
    },
    // The 9 is voiced UNDER the b3 — token order is the voicing, so `s2.3` puts
    // F below F#, which is the reel's whole device.
    intervals: ['3', 's2.3', '5', '3.5', 's2.3', '5'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.28, 0.5], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'onsets are the reel\'s exactly — beats 1, 2 and 4, gap on beat 3. What changes is that a HELD voice is re-struck under the entering one, because bindFigure releases every note at the next onset (measured: 0 overlapping pairs from lp_r1_arp at legato false AND true). Renders F#4 | F4+F#4 | A#4 || F#4+A#4 | F4+F#4 | A#4, then C#4 | C4+C#4 | F4 || C#4+F4 | C4+C#4 | F4 — the reel\'s sounding stack at every onset, 18 notes, 0 out-of-key, 100.0% sounding coverage. THE DEPARTURE: 4 of the 18 note attacks (12 onsets) re-articulate a note the reel is still holding, and legato carries the beat-2 dyad through beat 3, where the reel has released the b3 and only the 9 rings.',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  // --- r32 · REEL 2, THE SIX LAYERS r31 LEFT OUT ---------------------------
  // The reel is TEN layers; r31 hardcoded two. Everything below is read off the
  // same transcription, in the reel's own 16-PULSE / 2-BAR frame (pulse = an
  // 8th at ~102.5 BPM), which is the frame `chordBeats` already uses for
  // rp_r2_e_major — 1.5 beats = 3 pulses. So a pulse p is bar-fraction p/8 and
  // every row below is `bars: 2`, aligned chord-slot for chord-slot with the
  // progression: X(0-2) E(3-7) | C#m9(8-10) F#6(11-13) G°7(14-15).
  //
  // NOT AUTHORED, deliberately: layer 3 (Drums) is rendered AUDIO LOOPS in the
  // playlist, not MIDI — no pitched figure exists to bind. Layer 8 ("Layering
  // Stab #2") is byte-identical MIDI to layer 6, verified note-for-note in the
  // source, so it is recorded as a `timbralDouble` rather than given a row.
  //
  // ADVERSARIALLY VERIFIED (r32). All six bind against rp_r2_e_major's own
  // chordBeats without throwing, all six pass the D102 metronome test, all six
  // CAST in a live `REELS=1 node scripts/audition-songs.mjs` run, and npm test
  // stayed 386/386. Two results worth recording:
  //  CONFIRMED  the bare `7` in the G°7 slot of lp_r2_digital_pluck does NOT
  //             hit the foreign-pitch fallback — Go7 carries a diminished 7th,
  //             so `7` emits E and the voicing reproduces the source exactly.
  //             Every out-of-key pitch these six rows emit is A#, C(=B#) or G,
  //             i.e. the three chromatics the transcription itself names, and
  //             ALL of them are chord tones of their own chord. Zero unintended
  //             foreign pitches across 260 bound notes.
  //  CONFIRMED  21 of the 24 readable chord voicings bind EXACTLY to the
  //             source's own note labels as pitch-class sets. The three that do
  //             not are the two compromises declared in `read` below.
  //  CAUTION    lp_r2_string_swells' two passes land 5-12 semitones apart
  //             (C#4/E4 then G#3/E3 at the cast octave) because the D76 root
  //             walk takes the descending fifth from C#. The reel has the G#
  //             pass ABOVE the C# pass. Not fixable from the row — bars:4 with
  //             both passes written out reproduces it identically, and the
  //             shipped lp_r1_pedal behaves the same way. For his ear.
  lp_r2_digital_pluck: {
    reel: 2, poster: 'isaac.horner', sourceAt: '33.6-89.4s',
    role: 'chords', instrument: '1. Digital Pluck',
    // THE HARMONY HAND, and the reel's own answer to "why does this sound
    // happy": FIVE OR SIX NOTES ON EVERY QUARTER, never a plain triad. It is
    // also the layer the reel spends the most time on — first in, and sounding
    // under all nine others.
    primary: true,
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['0', '1/4', '1/2', '3/4', '1', '5/4', '3/2', '7/4'],
      accents: [0.6, 0.44, 0.52, 0.44, 0.56, 0.44, 0.5, 0.46], legato: false,
    },
    // One token per quarter, each the voicing of the chord actually underneath
    // it. Verified against the reel's own note labels: E = E4 G#4 B4 D#5 B5,
    // C#m9 = C#4 E4 G#4 B4 D#5 B5, F#6/9 = F#4 A#4 C#5 F#5 G#5 D#6,
    // G°7 = G4 C#5 E5 G5 C#6 (it OMITS the b3, so no `3` token).
    intervals: ['R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5.s7.5+', 'R.3.5.s7.5+',
      'R.3.5.s7.s2+.s7+', 'R.3.5.s7.s2+.s7+', 'R.3.5.R+.s2+.6+', 'R.5.7.R+.5+'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_orchestral_harp', synthSound: 'gm_lead_2_sawtooth',
    read: 'straight QUARTERS, 8 per 16-pulse loop (x.x.x.x.x.x.x.), ~98% gate. Voicings read off the '
      + 'FL note labels chord by chord; bound pitches match them exactly except at pulses 0/2, where the '
      + 'chord ALTERNATES C#m9 / G#7 across the 4-bar phrase and one token cannot double both passes’ '
      + 'top voice — R.3.5.s7.s2+ keeps the lower four notes of both and puts the 9 on top.',
    verifyNote: 'MEASURED: E^7, C#m9, F#6 and G°7 bind EXACTLY to the source’s pitch-class sets — '
      + 'F#3 A#3 C#4 F#4 G#4 D#5 and G3 C#4 E4 G4 C#5 are the reel’s own note names. The G#7 pass is the '
      + 'one inexact voicing: s2+ writes A# where the reel doubles C, so that chord carries the 9 the reel '
      + 'does not. The bare `7` was checked for the foreign-pitch fallback and is clean (it resolves to the '
      + 'diminished 7th E, in key).',
    unrepresented: 'the STRUM (every chord rolled bottom-to-top, 0.030-0.038s per voice = a 64th, too fine '
      + 'to notate as onsets without failing the metronome test) and the sustained ROOT the same track holds '
      + 'under each chord (C#3-G#3) — a second part inside one roll that a single figure cannot state.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_sub_bass_roots: {
    reel: 2, poster: 'isaac.horner', sourceAt: '36.8-38.0s',
    role: 'bass', instrument: '2. Sub Bass',
    // ONE HELD ROOT PER CHORD and nothing else — the layer whose whole job is
    // the harmonic rhythm itself. Its onsets ARE the chord changes, which is
    // why it reads as a floor rather than a line.
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['0', '3/8', '1', '11/8', '7/4'],
      accents: [0.58, 0.5, 0.52, 0.46, 0.42], legato: true,
    },
    intervals: ['R', 'R', 'R', 'R', 'R'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.32, 0.56], minEnergy: 0,
    sound: 'gm_synth_bass_1', synthSound: 'gm_synth_bass_1',
    read: 'a transposing sub patch (displayed C#5-G5, sounding 2-3 octaves lower): one long note per '
      + 'chord, no subdivision, chord ROOT only. Directly observed: C# ending at 36.80, F# 36.804-37.679 '
      + '(exactly 3 pulses), G 37.679-37.96 (~1 pulse, shorter than its chord).',
    partialRead: 'THE REEL SHOWS ONLY ~1.6s OF THIS TRACK. The C#m9 -> F#6 -> G°7 span (pulses 8-15) is '
      + 'observed; the roll is empty after 37.96 and I never saw what it does over E or G#7. The pulse-0 and '
      + 'pulse-3 onsets here are the transcribed RULE ("one long note per chord") applied to the two chords '
      + 'that were not on screen — an inference, not a reading.',
    verifyNote: 'the three OBSERVED onsets bind to C#3, F#3, G3 — exact against the observed roots. The two '
      + 'inferred onsets are the only unverified events in the row.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_epiano_top: {
    reel: 2, poster: 'isaac.horner', sourceAt: '45.3-51.8s',
    role: 'pad', instrument: '4. E-Piano',
    // THE INVERSE OF THE PLUCKS, and where the "happy" actually lives: it
    // SUSTAINS through everything on 6 onsets while the plucks hammer 12-14,
    // and it carries the maj7 / 9 / 6 colour at the very top of the mix. Bar 2
    // is a clean TRESILLO (0, 3, 6).
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['0', '3/8', '5/8', '1', '11/8', '7/4'],
      accents: [0.5, 0.52, 0.4, 0.5, 0.48, 0.42], legato: true,
    },
    // The pulse-5 onset is the TOP VOICE ALONE re-struck over an unchanged
    // chord — a repeated chord returning with one voice re-added, which is the
    // r17 "changes not just in strict section bar" mechanism played by hand.
    intervals: ['R.3+', 'R.3.5', '5', 'R.3.5.s7', 'R.3.5.6', 'R.3.5'],
    frozen: false,
    // NOTE (r32 verify): 0 is INERT. The caster clamps to leadOctave-1, so this
    // is indistinguishable from -1 and the row will never sit above the lead.
    // Kept as written because the reel really is the top layer; D77 outranks it.
    octaveVsLead: 0, gainVsLead: [0.24, 0.44], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_pad_new_age',
    read: 'FL E6-D#7, the highest layer in the reel and an octave above everything else. Onsets at pulses '
      + '0, 3, 5, 8, 11, 14; note lengths 3, 2, 2, 3, 3, 2 pulses. Voicings match the labels exactly: G#7 = '
      + 'a bare TENTH (R + 3 an octave up), E = R 3 5, C#m9 = R b3 5 b7, F#6/9 = R 3 5 6, G°7 = R b3 b5.',
    verifyNote: 'ALL FIVE voicings bind EXACTLY to the source’s pitch-class sets — the only row here that is '
      + 'exact on every chord. The bare tenth measures 16 semitones (G#3 -> C5) as it should. The disputed '
      + 'pulse-0 attack is CORRECT: the source’s own note-length table lists "pulse 0 chord = 3 pulses", and '
      + 'its "bar 2 = 0, 3, 6 = a clean TRESILLO" only parses if pulse 8 is an attack.',
    unrepresented: 'the TIES. In the source G#6 is held from the G#7 through the whole E chord and A#6 from '
      + 'F# through G°7, so the top of the mix never re-articulates at those changes; the binder has no tie, '
      + 'so those two tones re-strike here. The transcription’s own onset count (5) omits the pulse-0 attack '
      + 'that its note-length table lists (3 pulses); I kept it, since the G#7 voicing has to be struck.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_layering_stabs: {
    reel: 2, poster: 'isaac.horner', sourceAt: '57.7-67.2s',
    role: 'pluck', instrument: '6. Layering Stabs',
    timbralDouble: '8. "Layering Stab #2" — the SAME 12 onsets, the same ~0.13-0.17s lengths and the same '
      + 'pitches on a second stab patch, verified note-for-note (layer 6 at 57.741s vs layer 8 at 67.150s, '
      + 'both G#5+C6+D#6+G#6). Two title cards, one part: the reel’s actual "layering" trick is thickening '
      + 'a transient, not adding a voice.',
    // SAME SHAPES AS THE STRING PLUCK, AN OCTAVE UP, AND A DIFFERENT ENTRY:
    // it states the X chord ONCE (pulse 2) where the String Pluck states it
    // three times (0, 1, 2), so the bar opens thin and fills. Casting it beside
    // lp_r2_string_pluck is the reel as played — they share 11 of 12 onsets and
    // are separated by OCTAVE and TIMBRE, which is exactly what D102 says
    // separates two layers (rhythm does not).
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['1/4', '3/8', '1/2', '5/8', '3/4', '1', '9/8', '5/4', '11/8', '3/2', '13/8', '7/4'],
      accents: [0.54, 0.5, 0.4, 0.44, 0.4, 0.56, 0.42, 0.44, 0.5, 0.4, 0.44, 0.46], legato: false,
    },
    intervals: ['R.3.5.R+', 'R.3.5.s7', 'R.3.5.s7', 'R.3.5.s7', 'R.3.5.s7',
      'R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5', 'R.3.5', 'R.3.5', 'R.3.5'],
    frozen: false,
    // NOTE (r32 verify): 0 is INERT — the caster clamps to leadOctave-1.
    octaveVsLead: 0, gainVsLead: [0.26, 0.46], minEnergy: 0,
    sound: 'gm_harpsichord', synthSound: 'gm_lead_1_square',
    read: 'FL E5-G#6. Grid ..xxxxx.xxxxxxx. — 16th-length stabs ON 8th pulses, ~45-55% gate, voices '
      + 'simultaneous (spread 0.008-0.017s, no strum). Six onsets a bar with FOUR distinct shapes, so it '
      + 'passes the metronome test on shape variety rather than on density.',
    verifyNote: 'ALL FIVE voicings bind EXACTLY to the source’s pitch-class sets, and the onset grid matches '
      + 'the source ASCII pulse for pulse. It DOES share 12 of 12 onsets with lp_r2_string_pluck — not a '
      + 'duplicate (different on-screen instrument, chord stabs vs single-note arp, different timbre and '
      + 'octave, and the reel plays both) but it drops reel 2’s comboScore from 74 to 58, mean onset '
      + 'overlap 0.62. Expected, not a surprise.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_string_swells: {
    reel: 2, poster: 'isaac.horner', sourceAt: '71.2-80.7s',
    role: 'counter', instrument: '9. String Ensemble',
    // THE SPARSEST LAYER IN THE REEL: two 8th-length swells per 2 bars and
    // nothing else. It marks the downbeat chord and THE ARRIVAL OF THE TONIC —
    // and the tonic never lands on a downbeat here, it lands on the "and of 2",
    // which is the transcription’s seventh reason the loop reads happy.
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['0', '3/8'],
      accents: [0.5, 0.54], legato: false,
    },
    intervals: ['R.3.5', 'R.3.5'],
    frozen: false,
    // NOTE (r32 verify): 0 is INERT — the caster clamps to leadOctave-1.
    octaveVsLead: 0, gainVsLead: [0.2, 0.38], minEnergy: 0,
    sound: 'gm_string_ensemble_1', synthSound: 'gm_pad_bowed',
    read: 'FL C#5-D#6, ~1 pulse per note. This is the layer that EXPOSED the 4-bar alternation — its '
      + 'pulse-0 chord measured C#m9 at 71.23s, G# major at 75.92s, C#m9 at 80.66s, 4.69s apart. Pulse 3 is '
      + 'always the E triad. The plain R.3.5 is exact on the G#7 pass and the triad core of the C#m9 pass '
      + '(where the reel adds b7 and 9); one token cannot state both, and the alternation itself now comes '
      + 'from the progression underneath rather than from the row.',
    verifyNote: 'FOR HIS EAR, measured. The two passes land 5-12 semitones apart — at the cast octave, '
      + 'cyc0 = C#4 E4 G#4 then E4 G#4 B4, cyc2 = G#3 C4 D#4 then E3 G#3 B3 — so the "invariant" E triad '
      + 'alternates E4/E3 and the G# pass sits BELOW the C# pass, where the reel has it above. Cause is the '
      + 'D76 nearest-motion root walk taking the descending fifth from C#; the shipped lp_r1_pedal does the '
      + 'same. NOT fixable from the row: bars:4 with both passes written out reproduces it identically, and '
      + 'bars:1 corrects the register only by doubling the onsets, which the source forbids ("TWO 8TH-LENGTH '
      + 'SWELLS PER 2-BAR LOOP, nothing else"). Bars 2 and 4 of the phrase are correctly SILENT.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r2_bass_pluck_octaves: {
    reel: 2, poster: 'isaac.horner', sourceAt: '80.9-85.9s',
    role: 'bass', instrument: '10. Bass Pluck',
    // A MELODIC BASS BUILT ENTIRELY FROM OCTAVE PAIRS — a root stated
    // high-then-low, then an octave lift as the THIRD of four repeats. In the
    // REEL it interlocks exactly: it leaves pulses 0, 7 and 8 empty, which are
    // the only four pulses the Synth Bass plays.
    //
    // r32 VERIFY — CORRECTED, AND THE ORIGINAL CLAIM WAS FALSE. This comment
    // read "Two basses, zero collisions — cast them together and that is the
    // reel." Measured against the SHIPPED library, that is wrong: the reel's
    // interlock is real, but `lp_r2_barline_bass` does not encode it. Its
    // onsets are '7/16' and '1/2' on a bars:1 row, which is 8th-pulses 3.5 and
    // 4 (and 11.5, 12), not 7 and 8 — off by a factor of two, and 3.5 is not on
    // the 8th grid at all. So the two rows COLLIDE at pulses 4 and 12, and this
    // row also collides with lp_r2_sub_bass_roots at pulses 3, 11 and 14: five
    // collisions, not zero. The interlock becomes real only once
    // lp_r2_barline_bass is re-read onto the 8th-pulse grid.
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '9/8', '5/4', '11/8', '3/2', '13/8', '7/4'],
      accents: [0.5, 0.56, 0.6, 0.44, 0.5, 0.44, 0.52, 0.46, 0.56, 0.44, 0.48, 0.5], legato: false,
    },
    intervals: ['R+', 'R', 'R', 'R', 'R+', 'R', '9+', '9', 'R', 'R', 'R+', 'R'],
    frozen: false,
    octaveVsLead: -2, gainVsLead: [0.3, 0.54], minEnergy: 0,
    sound: 'gm_acoustic_bass', synthSound: 'gm_synth_bass_1',
    read: 'FL E2-D#4 (it leaps two octaves — a melodic bass, not a sub). Grid .xxxxxx..xxxxxx. at ~75% '
      + 'gate. Pulses 1-2 state the downbeat root high-then-low (G#3->G#2 / C#4->C#3); pulses 3-6 over E '
      + 'are R R R+8 R; pulses 9-10 are the NINTH high-then-low (D#4->D#3) over C#m9; 11-13 are R R R+8 '
      + 'over F#. Bound pitches reproduce all of that.',
    verifyNote: 'MEASURED and exact: cyc0 pulses 3-6 emit E3 E3 E4 E3 (R R R+ R), cyc1 pulses 9-10 emit '
      + 'D#4 D#3 (the 9th, high-then-low), pulses 11-13 emit F#3 F#3 F#4. The bare `9`/`9+` tokens were '
      + 'checked for the foreign-pitch fallback and are clean — C#m9 carries its 9th, so they resolve to D#, '
      + 'in key.',
    unrepresented: 'the CHROMATIC APPROACH at pulses 14-15. On the pass leading back to C#m9 the reel plays '
      + 'C4->C3 (=B#, a semitone under C#) against a G°7 whose root is G, so every 2-bar loop ends a '
      + 'semitone below where the next one starts. A row cannot tell the two passes apart, so pulse 14 takes '
      + 'the chord root G — true on the other pass, and the semitone approach is lost. The occasional '
      + 'pulse-15 note is left out for the same reason.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  // -------------------------------------------------------------------------
  // r32 — THE REST OF REEL 3. r31 hardcoded 2 of its 8 layers (the 808 and the
  // Digital Lead). His note: "it should be hardcoded more faithfully to the reel
  // in terms of combinations and such". These four are the pitched layers the
  // transcription resolves to note level; layer 4 (drums) is unpitched and layer
  // 7 ("808s") is Playlist-only glide 808s whose onsets do not resolve to a grid.
  //
  // THE VOICINGS ARE THE REEL'S, NOTE FOR NOTE. Bound against rp_r3's chordBeats
  // the two chord rows emit exactly the on-screen note names (FL labels, one
  // octave above scientific): C6 = C E G A, Fmaj7 = F A C E, Dm9 = D F A C E,
  // Am7 = A C E G, D7 = F# A C (+F#) then D. That is only possible now — with one
  // chord per BAR the dotted-quarter changes landed on the wrong onsets.
  //
  // CORROBORATION OF THE ALIGNMENT, worth recording because it was not assumed:
  // mapping each measured onset onto rp_r3's chord spans yields EXACTLY as many
  // onsets per chord as the transcription itemises voicings for, in the same
  // order, for BOTH keys layers. The 2-bar cell and the 2-bar harmonic cycle
  // line up at period 2.
  lp_r3_synth_bass_roots: {
    // r32: PRIMARY over lp_r3_bounce_808. The 808 row was an r31 approximation
    // — roots on 8ths 0/3/6/9, i.e. the dotted-quarter rhythm starting on the
    // downbeat. The transcription's measured Synth Bass grids are
    // "......x.....x..." / "..x...x........." = 8ths 3, 6, 9, 11, which SKIPS
    // the bar-1 downbeat and adds a third. Faithfulness is the whole point of
    // the round, so the transcribed one wins. It also answers his card on this
    // song directly: "there's also no active groove/bass which drives the
    // happiness a bit I think."
    primary: true,
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'bass', instrument: '1. Synth Bass(es) — the first layer the reel shows',
    // THE SAME ROOT LINE AS THE 808 MINUS THE DOWNBEAT: it enters on the C at
    // 8th 3 and leaves beat 1 to the 808. Measured onset overlap with
    // lp_r3_bounce_808 is 3 of 4, which is why they exclude each other here even
    // though the reel plays both — two root lines an 8th apart is doubling in
    // this engine, whatever a stranger's mix does with four bass elements.
    exclusiveWith: ['lp_r3_bounce_808'],
    rhythm: { bars: 2, grid: 8, onsets: ['3/8', '3/4', '9/8', '11/8'], accents: [0.54, 0.6, 0.5, 0.42], legato: false },
    intervals: ['R', 'R', 'R', '3'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.32, 0.56], minEnergy: 0,
    sound: 'gm_synth_bass_1', synthSound: 'gm_synth_bass_1',
    read: '16-slot grids bar A "......x.....x...", bar B "..x...x........." = cycle 8ths 3, 6, 9, 11, '
      + 'one note per chord on the dotted-quarter harmonic rhythm. Roots C -> F -> D, then the 3rd of '
      + 'the D chord (F#3 on the repeat, giving D9/F#) — a 3rd-in-the-bass inversion, the one place this '
      + 'layer is not a root.',
    partialRead: 'THREE things are in the transcription and NOT in this row. (a) The F# is only there on '
      + 'the SECOND pass, where the D chord turns major; over rp_r3\'s Dm9 the `3` token writes F natural, '
      + 'which is a chord tone. (b) Written octave placement jumps freely (C6 -> F5 -> D5 -> F#3, a span '
      + 'of MIDI 42-72) and the binder walks roots by nearest motion instead — the displacement is not '
      + 'encodable without inventing octaves. (c) The "(es)" is real: a second Serum channel adds eighths '
      + '(A4, A5, F#5, then C5, C4) but the transcription cannot place its bar alignment, so it is not authored.',
    lengthNote: 'the reel holds these 2-3 eighths ("long held notes, no staccato") but legato is FALSE here '
      + 'deliberately: legato would hold the last note five eighths across Am7 and D7, parking F against F#.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r3_digital_keys_offbeat: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'chords', instrument: '2. Digital Keys',
    // NOTHING ON BEAT 1 OF EITHER BAR — the 808's dotted-quarter chain owns the
    // downbeat and this layer answers around it. Five onsets a bar, all off the
    // strong beats, three of them 16th-length flams into the next chord change.
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['1/4', '3/8', '5/8', '3/4', '7/8', '9/8', '11/8', '3/2', '7/4', '15/8'],
      accents: [0.42, 0.56, 0.42, 0.54, 0.46, 0.58, 0.42, 0.52, 0.56, 0.44],
      legato: false,
    },
    // Full 4-5 note voicings, ALWAYS with a 6th/7th/9th — never a plain triad.
    // The 9ths carry '+' so they sit on TOP of the b7 the way the roll shows
    // them (a bare s2 voices the 9th as a 2nd inside the chord, which is a
    // different chord — measured, it emitted E5 where the roll shows E6).
    intervals: ['R.5.s7.s2+', 'R.3.5.6', 'R.3.5.6', 'R.3.5.s7', 'R.3.5.s7',
      'R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5.s7', '3.5.s7.3+', 'R+'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: '16-slot grids bar A "....x.x...x.x.x.", bar B "..x...x.x...x.x." = cycle 8ths 2,3,5,6,7 and '
      + '9,11,12,14,15. Bound against rp_r3 it emits the roll verbatim: C6 = C E G A, Fmaj7 = F A C E, '
      + 'Dm9 = D F A C E, Am7 = A C E G, and the D7 ROOTLESS as F# A C + F# with D added an 8th later '
      + '(the 808 has the D — that omission is why four bass-register elements do not muddy).',
    partialRead: 'the Gm9 onset (8th 2) is the one token not itemised for THIS layer. It is written '
      + 'thirdless (R 5 b7 9) because layer 2\'s complete on-screen pitch list contains no Bb, and the '
      + 'layer\'s stated law is a colour tone on every chord.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r3_layering_keys_pairs: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'chords', instrument: '3. Layering Keys',
    // THE SIGNATURE IS THE DOUBLED 8THS 0+1: it re-articulates the SAME chord a
    // single eighth later, on the downbeat the Digital Keys refuse. Bars 2 and 4
    // of the loop add 8ths 6 and 7 — the same cell, extended, not a new one.
    //
    // NOT A TIMBRAL DOUBLE of lp_r3_digital_keys_offbeat: different onsets and
    // genuinely different note content (rootless upper structures over the D, a
    // bare 3rd over the D7). But the transcription's word "interlocks"
    // OVERSTATES it — measured on the two grids they share 6 of 10 onsets (60%),
    // and the interlock is real only at bar A's 8ths 0/1 and 6/7. Per D102 that
    // is normal and it is not what separates them; the DECLARED VOICE is, so
    // this row takes a different one rather than a second epiano.
    rhythm: {
      bars: 2, grid: 8,
      onsets: ['0', '1/8', '3/8', '5/8', '1', '9/8', '11/8', '13/8', '7/4', '15/8'],
      accents: [0.6, 0.44, 0.5, 0.46, 0.58, 0.44, 0.48, 0.46, 0.5, 0.44],
      legato: false,
    },
    intervals: ['R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5.6', 'R.3.5.6', 'R.3.5.s7',
      '3.5.s7.3+', '5.s7.s2+', 'R.3.5', '3', '5.s7'],
    frozen: false,
    octaveVsLead: -1, gainVsLead: [0.24, 0.44], minEnergy: 0,
    sound: 'gm_vibraphone', synthSound: 'gm_lead_1_square',
    read: 'grids "x.x...x...x....." (bars 1,3) and "x.x...x...x.x.x." (bars 2,4). Bound against rp_r3 it '
      + 'emits the measured shapes in order: Gm9 = G Bb D F A twice (the doubled pair), Fmaj7 = F A C E, '
      + 'then over the D chord the ROOTLESS upper structure F A C F and A C E, Am7 = A C E, and the D7 as '
      + 'just its 3rd (F#) then 5-b7 (A C). Notes measure 0.66 of an eighth vs the Digital Keys\' 0.96 — '
      + 'this is the tighter, shorter of the two.',
    partialRead: 'the two C6 onsets (8ths 3 and 5) are the only INFERRED tokens in this row — the '
      + 'transcription itemises Gm9, Fmaj7, the D chord, Am7 and D7 for this layer but not C6. R-3-5-6 '
      + 'follows the layer\'s own stated law (4-5 notes, always a colour tone) and matches what the '
      + 'Digital Keys play there; it was not read off the roll.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r3_catchy_pluck: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    role: 'pluck', instrument: '6. Catchy Pluck',
    // THE LAYER HIS LABEL LIVES IN, per the transcription: "it is the only layer
    // with a small, memorable, unchanging shape, and it is the one that reads as
    // 'you just got assigned a task'". FOUR PITCHES in the whole loop, spanning a
    // major 6th, FROZEN while the circle of fifths turns underneath — so one
    // two-note oscillation is a 9th, then a root, then a 5th, then a b3.
    // Same principle as lp_r3_frozen_hook and r30's frozen rise; degrees are
    // relative to the KEY's tonic, the convention lp_r3_frozen_hook uses.
    rhythm: {
      bars: 2, grid: 8, onsets: ['3/8', '1/2', '1', '11/8', '3/2', '7/4', '15/8'],
      accents: [0.44, 0.56, 0.56, 0.44, 0.5, 0.48, 0.42], legato: false,
    },
    intervals: ['s6', '5', '5', 's6', '5', '3', 's6'],
    frozen: true,
    octaveVsLead: 0, gainVsLead: [0.3, 0.52], minEnergy: 0,
    sound: 'gm_pizzicato_strings', synthSound: 'gm_lead_1_square',
    read: 'grids bar A "......x.x.......", bar B "x.....x.x...x.x." = cycle 8ths 3,4 and 8,11,12,14,15. '
      + 'Bound frozen over F it emits D C | C D C A D — the reel\'s D6 C6 | C6 D6 C6 A5 D6 exactly. '
      + 'Every 16th sits immediately before a long note, so it reads as a grace flick into a held pitch.',
    partialRead: 'ONE note is dropped. The reel re-pitches the final 16th on the second pass only '
      + '(D6 -> F#5, the 3rd of D7 — "the only place the pluck acknowledges the chord change"). A frozen '
      + 'row binds against ONE chord, so a chord-following note cannot live in it, and spelling F# as a '
      + 'literal semitone would park a chromatic in every song that casts this.',
    lengthNote: 'the reel\'s two long notes are quarters held ~1.93 eighths; legato false gives every note '
      + 'one eighth. legato true would hold bar A\'s C across four eighths, and both readings are wrong, so '
      + 'the shorter error was taken. The `s6` SCALE token keeps it in key under any tonic — a bare `6` '
      + 'falls back to a major 6th over a minor chord (F# in F major), which is what lp_r3_frozen_hook '
      + 'currently does and it warns on every bind.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  // ---------------------------------------------------------------------------
  // r32 · REEL 4, THE OCTAVE STACK. The transcription's own headline: "The core
  // trick is brute octave stacking, not counterpoint: the Piano, the Talking
  // Synth and the Bells all play the IDENTICAL root-position R-3-5-7(-9)
  // voicing in three consecutive octaves — piano B2-C#4, synth B3-C#5, bells
  // B4-C#6 — verified numerically, every shared onset came out at exactly
  // +/-12 semitones. Register is the ONLY thing separating the parts."
  //
  // r31 hardcoded the MIDDLE octave only (lp_r4_pushed_eighths), so the device
  // his ear was hearing was not in the library at all — one voicing, one octave,
  // which is just a chord layer. These two rows are the octave above and the
  // octave below. They are NOT timbral doubles: each is at a different octave,
  // each has its own rhythm, and each adds notes the middle octave does not have.
  //
  // BARE `7`, NOT `s7`, AND IT WAS MEASURED. CLAUDE.md prefers scale tokens
  // because a bare 7 can spell a foreign pitch. Bound against this reel's own
  // 17-chord progression the opposite is true here: `7` resolves to the CHORD'S
  // OWN seventh on the nine seventh-chords, to the bb7 on both diminished
  // sevenths (A#o7 -> A#4 C#5 E5 G5, the transcription's exact voicing) and,
  // decisively, to C# on E6 — the reel's actual note, where `s7` writes a D
  // natural the reel does not have. Swept over all eight reel progressions the
  // two tokens are within 1-6 notes of each other for out-of-key rate and `7`
  // is LOWER on reels 2 and 8. The only fallback warnings are on the two plain
  // triads (D -> C natural, A -> G natural), both diatonic to B minor.
  // ---------------------------------------------------------------------------
  lp_r4_piano_octave_stack: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    role: 'chords', instrument: '3. Piano',
    octaveStack: 'THE SAME VOICING AS 1. Talking Synth, ONE OCTAVE DOWN (verified -12 on every '
      + 'note: piano Bm9 = B2 D3 F#3 A3 C#4 vs synth B3 D4 F#4 A4 C#5), plus a doubled bass root '
      + 'an octave lower again and one added top voice. Not a timbral double — different octave, '
      + 'different rhythm (it never plays the synth\'s 7/16 push) and two voices the synth lacks.',
    // STEADY 8THS, EVERY BAR THE SAME: x...x.x.x.x.x.x. The Talking Synth's grid
    // MINUS its one 16th push at slot 7 — "the most metronomic of the three
    // keyboard layers". That single missing onset is the whole rhythmic
    // difference between the two, and it is why they are separate rows.
    rhythm: {
      bars: 1, grid: 16,
      onsets: ['0', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
      accents: [0.6, 0.46, 0.42, 0.5, 0.42, 0.46, 0.4], legato: false,
    },
    // Downbeat = the FULL stack (doubled bass root + body + top voice); the six
    // stabs = the body alone. `3++` is the added top voice, which the source
    // reads as "the 3rd or the 9th" (E6 -> +G#4, F#7 -> +A#4).
    intervals: [
      'R.R+.3+.5+.7+.3++',
      'R+.3+.5+.7+', 'R+.3+.5+.7+', 'R+.3+.5+.7+',
      'R+.3+.5+.7+', 'R+.3+.5+.7+', 'R+.3+.5+.7+',
    ],
    frozen: false,
    // -3 is the seat of the DOUBLED BASS ROOT, not of the chord body: bindFigure
    // seats at C<octave> and the `+` members stack on top, so this one row spans
    // three bands (measured B2 -> D5 at octave 2). gm_epiano1's declared range
    // is [3,5], so r28Band will lift it to 3 under a lead at 4 or 5 — recorded
    // because the reel's own placement is a full octave lower than that.
    octaveVsLead: -3, gainVsLead: [0.26, 0.48], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_pad_warm',
    read: 'Bound against rp_r4_dorian_major_iv it realises the transcription\'s literal voicings: '
      + 'Bm9 = B3 D4 F#4 A4 (+B2 root, +D5 top), C#7 = C#4 F4 G#4 B4 (F = the E#), Dm7 = D4 F4 A4 C5, '
      + 'F#7 = F#4 A#4 C#5 E5, A#o7 = A#4 C#5 E5 G5 — one octave under lp_r4_bells_thinning on every '
      + 'shared onset. 7 onsets a bar with only 2 interval shapes passes the metronome test on the '
      + 'letter of the rule AND on its intent: the harmony moves sub-bar, so the measured bar 3 sounds '
      + 'D7, D#o7, E6, E6, Dm7 and D across those 7 stabs — six chords, not a repeated pulse.',
    inferred: 'The FULL-STACK-on-the-downbeat / BODY-on-the-stabs split is an inference from '
      + '"downbeat chord held 4 sixteenths ... everything else is a 16th/8th stab", not a measured '
      + 'voicing difference; the source does not say whether the bass root and top voice sound on '
      + 'every stab. It is also what gives the row its second interval shape.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r4_bells_thinning: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    role: 'chords', instrument: '4. Bells',
    octaveStack: 'the octave ABOVE 1. Talking Synth (+12 on every shared onset, verified across five '
      + 'chords). It earns its own row on RHYTHM, not pitch: "the SPARSE layer — it thins out where '
      + 'the synth is thickest, and it is the only pitched layer whose rhythm changes bar to bar".',
    // A 2-BAR CELL, because one bar cannot express the thinning. Bar 1 is
    // x...x...x.....x. (0, 4, 8, 14) and bar 2 is x.....x.x....... (0, 6, 8) —
    // it then goes SILENT for the back half of bar 2, which is the only hole any
    // pitched layer in this reel leaves. In a texture the transcription calls
    // "many machines executing the same instruction", this is the one that stops.
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '1/4', '1/2', '7/8', '1', '11/8', '3/2'],
      accents: [0.52, 0.46, 0.48, 0.42, 0.5, 0.4, 0.46], legato: false,
    },
    // Bar 2 slot 6 is a LONE SINGLE NOTE, not a chord: the F5 (= E#, the 3rd of
    // C#7) the source calls out as one of the bells' two chromatic connectors.
    // That single `3` among six stacks is the layer's own content.
    intervals: ['R.3.5.7.9+', 'R.3.5.7', 'R.3.5', 'R.3.5.7', 'R.3.5.7.R+', '3', 'R.3.5.7'],
    frozen: false,
    // 0 is the REEL's placement — the bells sit at B4-E6 with the accordian's
    // F5-C6 on top of them. r28Band's hard ceiling clamps it to leadOctave-1,
    // which lands it at exactly the octave measured below; the value is left
    // faithful so a future round that revisits the ceiling reads the truth.
    octaveVsLead: 0, gainVsLead: [0.22, 0.42], minEnergy: 0,
    sound: 'gm_tubular_bells', synthSound: 'gm_celesta',
    read: 'MEASURED NOTE-FOR-NOTE against the transcription\'s own voicing list, at its own written '
      + 'octaves: Bm9 = B4 D5 F#5 A5 C#6, D7 = D5 F#5 A5 C6, E6 = E5 G#5 B5 (a TRIAD — the one chord '
      + 'with no seventh), C#7 = C#5 F5 G#5 B5 C#6, F#m7 = F#5 A5 C#6 E6, C#m7 = C#5 E5 G#5 B5 C#6, '
      + 'plus the lone F5 connector at bar 2 b6. Seven of seven onsets match the source exactly.',
    partialRead: 'The cell repeats over bars 3-4, where the reel plays 0,4,6,8,12 and then a single '
      + 'downbeat; bar 4 was scrolled off screen past slot 0, so its real shape is unknown and is not '
      + 'invented here. Bars 1-2 are transcribed in full and are what the row encodes.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  // ---- r32 · REEL 6, THE MISSING HALF ---------------------------------------
  // His note: "it should be hardcoded more faithfully to the reel in terms of
  // combinations and such". Reel 6 shipped three rows, and each was a PARTIAL:
  // half a bar of the keys, one bar of the piano, one bar of the bass, and the
  // strings not at all. The transcription resolves all four in full, so these
  // four rows are the complete reading. Each supersedes its partial and says so
  // in `exclusiveWith`; the strings are new.
  //
  // THE INTERLOCK IS THE POINT (the transcription's own "howTheyStack"): the
  // keys hold the FRONT half of the bar with three dotted-eighth stabs and thin
  // to single 16ths at slots 8-14, which is exactly where the bass wakes up
  // (8, 10, 12, 13). Casting only the front half of the keys — which is what
  // lp_r6_keys is — deletes both sides of that interlock. Measured on the four
  // rows together: comboScore 82, mean onset overlap 22%, 3/3 roles.
  lp_r6_keys_full: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'lead', instrument: '1. Digital Synth (and 2. "Layering Keys", which is the SAME MIDI on a second timbre)',
    timbralDouble: '2. Layering Keys — byte-identical notes, a second patch over the same roll (r31 rule 5: no row of its own)',
    // THE COMPLETE BAR. lp_r6_keys carries onsets 0, 3/16, 6/16 and 8/16 only
    // and declares the rest unresolved; the transcription does resolve them —
    // slot 9 is the 5 alone and slots 10/12/14 are the A-C-E-G stack.
    exclusiveWith: ['lp_r6_keys'],
    primary: true,
    rhythm: {
      bars: 1, grid: 16,
      onsets: ['0', '3/16', '3/8', '1/2', '9/16', '5/8', '3/4', '7/8'],
      // three FAT stabs, then five LIGHT 16ths — the transcription's own words
      accents: [0.62, 0.5, 0.54, 0.36, 0.34, 0.42, 0.38, 0.36],
      legato: false,
    },
    // `s2+`, not `s2`: memberSemis puts a bare s2 TWO SEMITONES above the root,
    // i.e. E jammed between D and F as a cluster. The reel voices it as the
    // NINTH, on top — D4 F4 A4 C5 E5. (lp_r6_keys carries the bare `s2` and is
    // wrong about this; that is one more reason this row supersedes it.)
    intervals: ['R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5.s7.s2+', 's4', '5',
      '5.s7.s2+.s4+', '5.s7.s2+.s4+', '5.s7.s2+.s4+'],
    frozen: false,          // re-pitches on the chord change, rhythm held constant
    octaveVsLead: -1, gainVsLead: [0.3, 0.55], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_lead_2_sawtooth',
    read: 'FL D4-A5 = D3-A4 scientific; only 7 pitch rows exist in the whole roll. Bar grid '
      + 'x..x..x.xxx.x.x., IDENTICAL every bar (measured byte-for-byte across 3 consecutive bars). '
      + 'FRONT HALF: three chord stabs a DOTTED EIGHTH apart (0, 3/16, 6/16) — a 3-against-4 '
      + 'cross-rhythm that never re-aligns with the beat after 1. BACK HALF: five light 16ths. '
      + 'Over Dm the stabs spell R b3 5 b7 9 (D-F-A-C-E), slot 8 is the 11 alone (G4), slot 9 the 5 '
      + 'alone (A4), and slots 10/12/14 the A-C-E-G stack (5 b7 9 11) — verified realised as '
      + 'D4 F4 A4 C5 E5 / G4 / A4 / A4 C5 E5 G5.',
    caveat: 'TWO places a re-pitched single shape cannot follow the reel. (a) Over Fmaj7 the reel '
      + 'KEEPS the common tones A-C-E and moves one voice; a figure row transposes the whole shape, '
      + 'so it renders F-A-C-E-G and C-E-G-B instead of the reel\'s F-A-C-E and F-A-C-E-G. Every '
      + 'pitch stays white-note/in-key, but the voice-leading is ours, not his. (b) The `3` token '
      + 'over Esus warns ("carries no 3") and falls back to G#, so bar 4\'s sus is overwritten by '
      + 'the E7 third for its first half. The sus->3 resolution is carried correctly by '
      + 'lp_r6_piano_full instead. Bar 4 of THIS layer was never observed (the view switched).',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r6_piano_full: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'chords', instrument: '3. Piano (and 5. "Layering Pad", the SAME MIDI on a second timbre)',
    timbralDouble: '5. Layering Pad — verified note-by-note, every onset and length matches within 0.2 of a sixteenth',
    // FOUR BARS, AND THE FIRST TWO ARE EMPTY ON PURPOSE. The transcription:
    // "the piano and pad are SILENT for loop bars 1-2 and only enter on the
    // Fmaj7 ... that is the arrangement's arrival mechanism, not a mixing
    // choice." A 1-bar row plays every bar and destroys it; a 4-bar row whose
    // onsets start at bar 3 states it in the data, and 4 divides every section.
    exclusiveWith: ['lp_r6_piano_roll_chord'],
    primary: true,
    rhythm: {
      bars: 4, grid: 16,
      onsets: ['2', '33/16', '17/8', '35/16', '3', '49/16', '25/8', '51/16', '57/16', '29/8', '59/16'],
      accents: [0.52, 0.42, 0.42, 0.44, 0.52, 0.42, 0.42, 0.44, 0.5, 0.42, 0.44],
      legato: true,          // "everything is HELD; there is no repeated attack anywhere"
    },
    // ROLLED bottom-up, one 16th apart, root doubled at the octave underneath.
    // The upper voices carry `+` because the reel puts them ABOVE the doubled
    // root (F3+F4 then A4 C5 E5), which the compact R-3-5-s7 spelling inverts.
    intervals: ['R.R+', '3+', '5+', 's7+', 'R.R+', 's4+', '5+', 's7+', '3+', '5+', 's7+'],
    frozen: false,
    octaveVsLead: -2, gainVsLead: [0.24, 0.44], minEnergy: 0,
    sound: 'gm_epiano1', synthSound: 'gm_pad_warm',
    read: 'FL E4-E6 = E3-E5 scientific. SILENT for loop bars 1-2 (checked twice on views 12s apart: '
      + 'the roll is completely empty there). Bar 3 xxxx............ — one roll at 0,1,2,3, all held '
      + 'to the bar end. Bar 4 xxxx.....xxx.... — the same roll, then a SECOND roll at 9,10,11. '
      + 'Realised against chordBeats [8,4,2,2]: bar 3 = F+F8ve, A, C, E (Fmaj7 R-3-5-7); bar 4 beat 1 '
      + '= E+E8ve, A, B, D (E7sus4); bar 4 beat 3 = G#, B, D — the A moves to G# while B and D '
      + 're-attack. That G# is the ONLY chromatic pitch in the whole reel and this row is the only '
      + 'place it lands. Zero binder warnings.',
    caveat: 'THE SUS RESOLUTION IS THE REEL\'S VIBE MECHANISM — "a V7 makes the loop want to go '
      + 'somewhere, which is precisely the difference between passive and task-focused" — so this '
      + 'row must be cast for the reel to read as his label. It depends on chordBeats [8,4,2,2] '
      + 'being live (r32 subBarOn); without it bar 4 is one chord and the sus never resolves. '
      + 'Under `legato` the three roll voices before the last one sound one 16th each; the binder '
      + 'has no way to hold all four to the bar end from separate onsets.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r6_bass_2bar: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'bass', instrument: '4. Bass Guitar',
    // THE D-PEDAL PHRASE, BOTH BARS. lp_r6_bass encodes bar 1 alone and calls
    // it "representative", but the bass is the one THROUGH-COMPOSED layer here
    // and bar 2 is where it walks. Two bars is the honest unit: it is exactly
    // the Dm span (chordBeats 8), and both bars are fully observed.
    exclusiveWith: ['lp_r6_bass'],
    primary: true,
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '1/2', '5/8', '3/4', '13/16', '1', '9/8', '19/16', '11/8', '25/16', '13/8'],
      accents: [0.62, 0.5, 0.44, 0.52, 0.44, 0.6, 0.44, 0.48, 0.5, 0.42, 0.48],
      legato: false,
    },
    // bar 1: D1 held, then D1 A1 A2 A1. bar 2: D1 C2 D2 D1, then G1 as an
    // APPROACH into A1 — `s4` not `4`, so it takes D dorian's G rather than a
    // fixed interval that consults neither key nor chord-scale.
    intervals: ['R', 'R', '5', '5+', '5', 'R', 's7', 'R+', 'R', 's4', '5'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.34, 0.6], minEnergy: 0,
    sound: 'gm_acoustic_bass', synthSound: 'gm_synth_bass_1',
    read: 'FL D2-A3 = D1-A2 scientific, MIDI 26-45 — two octaves below the keys, and nothing else in '
      + 'the mix goes below MIDI 52. Bar 1 x.......x.x.xx.. (0 held 7 slots, then 8, 10, 12, 13); '
      + 'bar 2 x.xx..x..xx..x.. The shape is a long root covering the whole front half and then a '
      + 'burst at slots 8-13 — exactly where the keys thin to single 16ths, which is the reel\'s '
      + 'interlock. 5.5 onsets/bar, 6 distinct shapes: it passes the metronome test on both clauses.',
    throughComposed: 'DIFFERENT EVERY BAR — the only layer here that is not a loop. Bars 1-2 are '
      + 'encoded in full; bar 3 is three F1 roots (R only) and bar 4 was NOT OBSERVED (the roll '
      + 'scrolled past before the reel switched views), so neither is authored.',
    caveat: 'bar 2\'s slot-13 onset is dropped: the transcription lists six pitches for its seven '
      + 'onsets and does not resolve the last. Dropping it is a declared omission, not an invention.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r6_scale_climb_strings: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.7-262.4s',
    role: 'counter', instrument: '6. Strings',
    // THE LAYER r31 DECLINED TO WRITE, now authorable: the r31 comment said the
    // transcription "gives its contour but not enough of its rhythm". It does —
    // bar by bar, x-grid by x-grid — and the 16 onsets below are those grids
    // read literally, with the 16 pitches assigned in the order the
    // transcription lists them (8 in bar 1, 3 in bar 2, 4 in bar 3, 1 in bar 4;
    // the pitch list has exactly 16 entries, which is what makes the assignment
    // determinate rather than a guess).
    //
    // ITS RHYTHM SLOWS AS IT CLIMBS: 16ths -> 8ths -> quarters -> a whole note,
    // landing on the dominant and staying there. That is the "setting off"
    // gesture behind his label, and no other layer in the reel does anything
    // like it.
    rhythm: {
      bars: 4, grid: 16,
      onsets: ['0', '1/16', '1/8', '3/16', '1/4', '13/16', '7/8', '15/16',
        '1', '3/2', '7/4', '2', '9/4', '5/2', '11/4', '3'],
      accents: [0.46, 0.4, 0.4, 0.4, 0.48, 0.4, 0.42, 0.44,
        0.5, 0.44, 0.46, 0.5, 0.46, 0.48, 0.52, 0.56],
      legato: true,
    },
    // ONE UNBROKEN DIATONIC SCALE. Every token is a SCALE token by necessity —
    // the line is a scale, not a chord shape — and `+` climbs the octaves.
    intervals: ['s7', 's6', '5', 's4', '5', 's6', 's7', 'R+',
      's2+', '3+', 's4+', '5+', 's6+', 's7+', 'R++', 's2++'],
    // FROZEN IS NOT "IT REPEATS" HERE, IT IS "IT IGNORES THE CHORDS". The
    // transcription: "NOT chord-locked — it neither freezes nor re-pitches per
    // chord; it just keeps climbing through the harmony." `frozen` binds the
    // whole cell against one chord's scale, which is exactly how a continuous
    // scale survives four chord changes. Bound against the moving context it
    // breaks: measured, bar 3 came out C-D-E-F instead of the reel's A-B-C-D.
    frozen: true,
    octaveVsLead: -1, gainVsLead: [0.2, 0.38], minEnergy: 0,
    sound: 'gm_string_ensemble_1', synthSound: 'gm_pad_bowed',
    read: 'Bar 1 xxxxx........xxx (four descending 16ths, a note held 9 slots from 4/16, three 16ths '
      + 'at 13-15); bar 2 x.......x...x...; bar 3 x...x...x...x... (four quarters); bar 4 '
      + 'x............... (one whole note). Realised through bindFigure under a frozen Dm9 context '
      + 'in A minor it comes out C B A G | A | B C D | E | F G | A B | C D | E — a 4-note step DOWN '
      + 'then a stepwise ascent of a 13th, every pitch a white note, span 21 semitones. That is the '
      + 'transcribed line note for note.',
    caveat: 'THE REEL PUTS THIS TWO OCTAVES ABOVE EVERYTHING (written FL G6-E8 = MIDI 79-100) and '
      + 'the schema cannot: octaveVsLead is capped at 0 and r28Band hard-caps the realised octave '
      + 'at leadOctave-1 (D77). At -1 the climb STARTS about an octave under the lead and ends '
      + 'above it, which keeps the shape — a line that climbs and slows and stops — but not the '
      + 'reel\'s register separation. The transcription itself flags the written octave as '
      + 'unusable ("MIDI 100 is above any real string instrument"), so the patch would have been '
      + 'transposed either way. Needs his ear on where it sits.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  // ---- r32 second pass: the three layers the first pass left out ----------
  // Reel 8 has SIX layers and only two were hardcoded (Synth Keys, Synth Bass).
  // The stack's whole point is the split the transcription names — layers 1/2
  // ATTACK and layers 4/5/6 HOLD — and with only one of each side present the
  // "combination" he judged was half the reel. These three complete it.
  lp_r8_interlock_stab: {
    reel: 8, poster: 'isaac.horner', sourceAt: '307.6-333.5s',
    role: 'pluck', instrument: '2. Digital Stab',
    // THE INTERLOCK IS THE FINDING, and it only exists once BOTH rows are cast:
    // Synth Keys attacks on beats 1, 1.5, 2.5, 4 and this one on 1, 2, 3, 4, so
    // the stab fills exactly the beats (2, 3) where the keys have gone silent
    // and the keys fill the offbeats the stab never touches. Together they read
    // as an almost continuous 8th pulse that NEITHER PLAYS ALONE — which is why
    // each one on its own sounded thin, and why neither passes the metronome
    // test as a single dense part. Two sparse parts, not one busy one.
    // The hole is real: beat 2 of bar 2 is a REST, the only one in the part.
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '1/4', '1/2', '3/4', '1', '3/2', '7/4'],
      accents: [0.58, 0.46, 0.44, 0.5, 0.52, 0.44, 0.42],
      legato: false,
    },
    // Onsets land on cycle beats 1,2,3,4 | 5,7,8 and `chordBeats` resolves each
    // against the chord actually sounding there: Dm9, Dm9, dim, Em7 | Em7,
    // C^7 (B-version: C#m7b5), C#m7b5. `s2+` puts the 9th ON TOP (D-F-A-C-E,
    // the reel's literal spelling) rather than as a 2nd next to the root.
    intervals: ['R.3.5.s7.s2+', 'R.3.5.s7.s2+', 'R.3.5', 'R.3.5.s7', 'R.3.5.s7', 'R.3.5.s7', 'R.3.5.s7'],
    frozen: false,
    octaveVsLead: -2, gainVsLead: [0.26, 0.48], minEnergy: 0,
    sound: 'gm_vibraphone', synthSound: 'gm_lead_1_square',
    read: 'quarter-note stabs, one per beat, with ONE hole — bar 1 x...x...x...x..., bar 2 x.......x...x... '
      + '(beat 2 of bar 2 rests). Every hit an 8th long and detached. FL C#5-E6 = C#4-E5 scientific, no note '
      + 'below C#5: it sits entirely inside Synth Keys’ right hand. Voicings measured per chord: Dm9 = '
      + 'D5 F5 A5 C6 E6 (R b3 5 b7 9), dim = a 3-note subset, Em7 = R b3 5 b7, C#m7b5 = R b3 b5 b7. '
      + 'Bound against rp_r8_dorian_chromatic the tokens emit exactly those pitches at octave 4.',
    verifyNote: 'octaveVsLead is -2, one lower than the reel’s own placement (same band as the Synth Keys '
      + 'stabs), because the top token is `s2+`, a 14-semitone reach — at -1 the realised top clears the lead '
      + 'and breaks D77/D118. The reel has NO melody layer at all, so its register order carries no lead to sit under.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r8_sustain_pad: {
    reel: 8, poster: 'isaac.horner', sourceAt: '307.6-333.5s',
    role: 'pad', instrument: '4. Smooth Keys',
    // THE SPARSEST LAYER IN THE REEL: four attacks in two bars, one per harmony,
    // no articulation at all, and the Em7 held straight across the barline. It
    // is the "hold" half of the reel's attack/hold split, and it is the layer
    // that makes the two staccato parts read as rhythm rather than as the whole
    // texture. Plain 4-note close voicing, NO root doubling — that is what keeps
    // it distinct from the Layering Piano on the same schedule.
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '3/8', '3/4', '3/2'],
      accents: [0.48, 0.42, 0.46, 0.42],
      legato: true,
    },
    intervals: ['R.3.5.s7', 'R.3.5', 'R.3.5.s7', 'R.3.5.s7'],
    frozen: false,
    octaveVsLead: -2, gainVsLead: [0.22, 0.42], minEnergy: 0,
    sound: 'gm_pad_new_age', synthSound: 'gm_pad_warm',
    read: 'FL C#5-D#6 = C#4-D#5 scientific — exactly the Digital Stab’s register. Durations 1.00, 0.97, '
      + '2.21, 1.29 beats against chord spans of 1.5, 1.5, 3, 2, i.e. every note releases ~0.5-0.8 beat before '
      + 'the next chord. Voicings: Dm7 = D5 F5 A5 C6, dim = A5 C6 D#6, Em7 = R b3 5 b7, C#m7b5 = R b3 b5 b7.',
    verifyNote: 'THE TRANSCRIPTION CONTRADICTS ITSELF ON THE THIRD ONSET and I took the prose over the grid '
      + 'string. Its two 16-slot strings put the attacks at cycle beats 1, 2.5, 5, 7 (offsets 0, 1.5, 4, 6); '
      + 'its prose says "one per harmony" and "the Em7 is held right across the barline for over two beats", '
      + 'which is only true if the Em7 attack is at offset 3 (beat 4 of bar 1) — a 2.21-beat note from 4 crosses '
      + 'no barline. Offsets 0, 1.5, 3, 6 are also exactly the B-version’s four chord changes, and they make '
      + 'the release gaps uniform (0.50, 0.53, 0.79) where the other reading gives 0.5, 1.53, -0.21. Encoded as '
      + '0, 3/8, 3/4, 3/2. If an ear pass disagrees, the alternative is 0, 3/8, 1, 3/2.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  lp_r8_two_hand_block: {
    reel: 8, poster: 'isaac.horner', sourceAt: '307.6-333.5s',
    role: 'chords', instrument: '5. Layering Piano',
    // THE ONLY LAYER THAT GOES LOW, and the only one that voices the full dim7
    // with its b3. Same hold schedule as Smooth Keys, but a two-handed voicing:
    // the root doubled in octaves below a close 4-note stack. That doubling is
    // the whole reason this is a separate row and not a timbral double of the
    // pad — strip it and the two rows are the same pitches (r31 measured 9 of 60
    // transcribed layers adding no new pitch or rhythm; this is not one of them).
    // It also carries the A-version's extra Cmaj7 attack, which the pad does not.
    rhythm: {
      bars: 2, grid: 16,
      onsets: ['0', '3/8', '3/4', '11/8', '7/4'],
      accents: [0.54, 0.46, 0.5, 0.46, 0.44],
      legato: true,
    },
    // The BARE `7` on the dim onset is deliberate and was checked both ways.
    // Over Eb°7 it takes the chord's own bb7 (C), which is the note that makes
    // this the only full dim7 voicing in the reel; `s7` would take the whole-half
    // diminished scale's 7th and write F# there, foreign to the C-major
    // collection. Over the B-version's A° TRIAD the bare 7 falls back to a b7
    // (G) and warns — G is in the collection, and A-C-D#-G is a half-diminished,
    // the same quality the phrase ends on. Every other onset uses `s7`.
    intervals: ['R.R+.3+.5+.s7+', 'R.R+.3+.5+.7+', 'R.R+.3+.5+.s7+', 'R.R+.3+.5+.s7+', 'R.R+.3+.5+.s7+'],
    frozen: false,
    octaveVsLead: -3, gainVsLead: [0.28, 0.5], minEnergy: 0,
    sound: 'gm_orchestral_harp', synthSound: 'gm_pad_warm',
    read: 'FL C3-D#6 = C2-D#5 scientific, ~3.5 octaves, the widest layer and the only one below C4 (FL). '
      + 'A-version onsets at cycle beats 1, 2.5, 4, 6.5, 8, B-version at 1, 2.5, 4, 7; grids x.....x.....x... / '
      + '......x.....x... The reel doubles the root in TWO octaves under the stack (Dm7 = D3 D4 | D5 F5 A5 C6); '
      + 'this row keeps ONE doubling so the figure spans two octaves, not three, which is what keeps its realised '
      + 'top under the lead at octaveVsLead -3.',
    verifyNote: 'INSTRUMENTS carries no acoustic-piano key (49 voices, `piano` is not one of them — note that '
      + 'lp_r7_beat_chords declares sound: \'piano\', which resolves to undefined and hands r28Band no range). '
      + 'gm_orchestral_harp is the nearest voice that holds a two-octave block with a doubled low root and is '
      + 'not already taken by another reel-8 row; gm_epiano1 would collide with lp_r8_syncopated_stabs.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
};

/** The chord progressions the reels were built on, one per reel. */
export const REEL_PROGRESSIONS = {
  // ==========================================================================
  // r32 — RE-TRANSCRIBED FAITHFULLY. His note: "i feel like the combination
  // wasn't that good. it should be hardcoded more faithfully to the reel in
  // terms of combinations and such".
  //
  // The r31 rows compressed every reel to FOUR CHORDS, ONE BAR EACH, because
  // that is all `barsPerChord` could express. Re-read against the source
  // transcriptions, that was wrong for six of the eight and it is the single
  // largest fidelity loss in the whole library. `chordBeats` (r32, bind.js)
  // gives each symbol a duration in BEATS, so a span may be half a bar, a
  // dotted quarter, or a single beat, and consecutive spans may cross the
  // barline exactly as the reels do.
  //
  // TWO OF HIS CARDS ARE THAT FLATTENING HEARD DIRECTLY:
  //   reel 7  "G to G#m sounds like rising tension not happy festival"
  //           — the real chord is a PASSING G-DIMINISHED lasting ONE BEAT.
  //             I spelled it a major triad and held it for a whole bar, which
  //             turns a standard I–#i°–ii–V turnaround into a chromatic lurch.
  //   reel 5  "third chord in the progression sounds weird because you added a
  //            note which makes it sounds dissonant"
  //           — the source says Am9's 9th sounds "on the second stab" only.
  //             I wrote `m9`, which puts B in the chord's core on every hit;
  //             in B minor that is the tonic droning under the bVII. `m7`.
  // Reel 1 had the same class of error: `m9` carries a b7 the add9 stack does
  // not have. The dialect's own `madd9` (R 9 b3 5) is that chord exactly.
  // ==========================================================================
  rp_r1_iv_i_add9: {
    reel: 1, poster: 'redbowmusic', sourceAt: '8.8-32.3s',
    key: 'A#:minor', family: 'minor', bpm: 131,
    // R 9 b3 5 — NO SEVENTH. r31 wrote m9, which adds one.
    degrees: '5:madd9 0:madd9', symbols: ['D#madd9', 'A#madd9'],
    chordBeats: [8, 8],
    read: 'iv -> i in A# minor, two chords of TWO BARS each. Both are the interval set '
      + '{0,+2,+3,+7} from the root voiced with the 9 UNDER the b3, so the top of the stack is a '
      + 'minor-2nd cluster. Chord 2 is a literal -5 transposition of chord 1.',
    vibes: ['dark_space'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r2_e_major: {
    reel: 2, poster: 'isaac.horner', sourceAt: '33.6-89.4s',
    key: 'E:major', family: 'major', bpm: 102,
    // A FOUR-bar phrase, not a 2-bar loop: the first chord ALTERNATES C#m9 / G#7.
    // Harmonic rhythm 3+5 eighths in bar 1, 3+3+2 (TRESILLO) in bar 2.
    degrees: '9:m9 0:^7 9:m9 2:6 3:o7 4:7 0:^7 9:m9 2:6 3:o7',
    // NB the dialect is `E^7`, never `Emaj7` (CLAUDE.md): an unknown symbol does
    // not throw, it silently renders R-3-5 and the major 7th disappears. My own
    // r31 rows carried Emaj7 / Fmaj7 / Cmaj7 and all three were plain triads.
    symbols: ['C#m9', 'E^7', 'C#m9', 'F#6', 'Go7', 'G#7', 'E^7', 'C#m9', 'F#6', 'Go7'],
    chordBeats: [1.5, 2.5, 1.5, 1.5, 1, 1.5, 2.5, 1.5, 1.5, 1],
    read: 'vi9 - I - vi9 - II(V/V) - #ii°7 - III7(V/vi) - I over a FOUR-bar phrase. The G°7 lasts only '
      + '2 pulses and always resolves by semitone: chromaticism as MOTION, never parked.',
    vibes: ['casual_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r3_circle_of_fifths: {
    reel: 3, poster: 'isaac.horner', sourceAt: '91.9-135.8s',
    key: 'F:major', family: 'major', bpm: 140,
    // DOTTED QUARTERS — the changes deliberately cross the barline.
    degrees: '2:m9 7:6 0:^7 9:m9 4:m7 9:7',
    symbols: ['Gm9', 'C6', 'F^7', 'Dm9', 'Am7', 'D7'],
    chordBeats: [1.5, 1.5, 1.5, 1.5, 1, 1],
    read: 'ii9 - V6 - Imaj7 - vi9 - iii7 - V/ii over TWO bars. Onsets in eighths: G at 0, C at 3, '
      + 'F at 6, D at 9, A at 12, D7 at 14 — the first four are dotted quarters, so Fmaj7 ties '
      + 'OVER the barline. That barline-crossing is the whole character of the loop.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r4_dorian_major_iv: {
    reel: 4, poster: 'isaac.horner', sourceAt: '137.7-169.1s',
    key: 'B:minor', family: 'minor', bpm: 123,
    // SEVENTEEN chords over four bars at uneven beat-level spans. r31 served 4.
    degrees: '0:m9 3:7 5:6 3:7 2:7 7:m7 0:m9 3:7 4:o7 5:6 3:m7 3 2:m7 2:7 7:7 10 11:o7',
    symbols: ['Bm9', 'D7', 'E6', 'D7', 'C#7', 'F#m7', 'Bm9', 'D7', 'D#o7', 'E6', 'Dm7', 'D',
      'C#m7', 'C#7', 'F#7', 'A', 'A#o7'],
    chordBeats: [1, 1, 1.5, 0.5, 2, 2, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5],
    read: 'THE FINDING: the IV is E MAJOR (E6), not Em — a raised 6th in a minor key, i.e. DORIAN. '
      + 'That is the mechanism his "sounds happy" label was pointing at. The motion is beat-level '
      + 'and uneven, with passing diminished chords (D#o7, A#o7) on half-beats.',
    vibes: ['industrial_mission'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r5_two_beat_changes: {
    reel: 5, poster: 'isaac.horner', sourceAt: '171.3-223.6s',
    key: 'B:minor', family: 'minor', bpm: 148,
    // HIS CARD: "third chord ... you added a note". The 9 is on the repeat stab
    // only; m7 is the chord. The D7's b9 is a VOICING detail, not a core tone.
    degrees: '0:m7 5:7 10:m7 3:7', symbols: ['Bm7', 'E7', 'Am7', 'D7'],
    chordBeats: [2, 2, 2, 2],
    read: 'a 2-BAR LOOP, ONE CHORD EVERY 2 BEATS: a descending chain of ii-Vs (Bm7-E7 is ii-V of A, '
      + 'Am7-D7 is ii-V of G) looping back deceptively. Read decisively from the "5. Synth Chords" '
      + 'roll where the full stacks are visible.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r6_dm_f_e7: {
    reel: 6, poster: 'isaac.horner', sourceAt: '225.4-263.2s',
    key: 'A:minor', family: 'minor', bpm: 79,
    degrees: '5:m9 8:^7 7:sus 7:7', symbols: ['Dm9', 'F^7', 'Esus', 'E7'],
    // TWO bars of D pedal, one of F, then the bar-4 sus RESOLVES at the halfway
    // point — the one place this reel changes chord inside a bar.
    chordBeats: [8, 4, 2, 2],
    read: 'a 4-bar loop: D pedal for two bars, F for one, then E7sus4 -> E7 across bar 4. Within '
      + 'bars 1-2 the keys alternate the voicing every half bar over the UNCHANGING D pedal — '
      + 'that is a voicing swap, not a chord change, and it is not modelled as one.',
    vibes: ['casual_task_active'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r7_beat_rate_changes: {
    reel: 7, poster: 'isaac.horner', sourceAt: '265-304.8s',
    key: 'Gb:major', family: 'major', bpm: 144,
    // HIS CARD, ANSWERED: I - #i° - ii - V, ONE CHORD PER BEAT, with the beat-2
    // chord alternating G°(odd bars) / Ebm9(even). r31 wrote a G MAJOR triad and
    // held it a whole bar. bpm was also wrong — measured 144, r31 said 128.
    degrees: '0 1:o 2:m 7 0 9:m9 2:m 7 0 1:m 2:m 7 0 9:m9 2:m 7',
    symbols: ['Gb', 'Go', 'Abm', 'Db', 'Gb', 'Ebm9', 'Abm', 'Db',
      'Gb', 'Gm', 'Abm', 'Db', 'Gb', 'Ebm9', 'Abm', 'Db'],
    chordBeats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    read: 'I - #i° - ii - V four times, ONE CHORD PER BEAT, with the beat-2 chord alternating: odd '
      + 'bars take the chromatic passing #i°, even bars take vi9. The left hand walks F#3-G3-G#3-C#3. '
      + 'G natural is the only chromatic in the whole reel and it is always a passing tone.',
    vibes: ['holiday_bright'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
  rp_r8_dorian_chromatic: {
    reel: 8, poster: 'isaac.horner', sourceAt: '306.6-350.2s',
    key: 'D:dorian', family: 'modal', bpm: 150,
    // TWO alternating 2-bar versions = a 4-bar phrase. The bass is a chromatic
    // CLIMB D -> D#/Eb -> E ... C -> C# -> D, harmonised by passing diminisheds.
    degrees: '0:m9 1:o7 2:m7 10:^7 11:m7b5 0:m9 7:o 2:m7 11:m7b5',
    symbols: ['Dm9', 'Ebo7', 'Em7', 'C^7', 'C#m7b5', 'Dm9', 'Ao', 'Em7', 'C#m7b5'],
    chordBeats: [1.5, 1.5, 2.5, 1.5, 1, 1.5, 1.5, 3, 2],
    read: 'D DORIAN — B and F both natural over the C-major collection. Two alternating 2-bar '
      + 'versions; the only difference is the bass under the diminished (Eb vs A, same dim7 family) '
      + 'and whether Cmaj7 gets its own beat. Dorian inflection is what makes this read bright.',
    vibes: ['casual_task'], provenance: 'video-transcribed', ratified: false, needsEar: true,
  },
};

/** Patterns matching a vibe class and/or a role. Never a niche lane. */
export function layersFor({ vibe, role, environment, emotion } = {}) {
  if (environment && NICHE_LANES.has(environment)) return [];
  const out = [];
  for (const [name, lp] of Object.entries(LAYER_PATTERNS)) {
    if (vibe && !(lp.vibes ?? []).includes(vibe)) continue;
    if (role && lp.role !== role) continue;
    if (environment && !(lp.vibes ?? []).some((v) => VIBE_CLASSES[v]?.lanes.includes(environment))) continue;
    if (emotion && !(lp.vibes ?? []).some((v) => VIBE_CLASSES[v]?.emotions.includes(emotion))) continue;
    out.push({ ...lp, name });   // the LIBRARY KEY wins — a row's `instrument` is its own field
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * HIS "which combos work well", made checkable.
 *
 * Three things are verifiable without an ear, and each is a law this project
 * already learned the hard way:
 *   REGISTER   two layers in the same octave band muddy each other (r22 R4, and
 *              r29 measured the engine putting support ABOVE the lead on 11 of
 *              14 songs).
 *   INTERLOCK  layers that strike on the same subdivisions read as one layer
 *              (D100: the counterline and descant were one layer because they
 *              struck together on one voice).
 *   ROLES      a stack with no bass, or three leads, is not an arrangement.
 * Returns a score plus the reasons, so a bad combo says WHY.
 */
export function comboScore(names) {
  const rows = names.map((n) => (typeof n === 'string' ? { name: n, ...LAYER_PATTERNS[n] } : n))
    .filter((r) => r && r.role);
  if (rows.length < 2) return { score: 0, reasons: ['need at least two layers'] };
  const reasons = [];
  let score = 0;

  // --- register: reward disjoint bands
  const bands = rows.map((r) => r.octaveVsLead ?? -2);
  const uniq = new Set(bands).size;
  const regScore = uniq / rows.length;
  score += regScore * 40;
  reasons.push(`register: ${uniq} distinct band(s) across ${rows.length} layers (${(regScore * 100).toFixed(0)}%)`);

  // --- interlock: reward layers that do NOT strike together
  const slots = rows.map((r) => {
    const g = r.rhythm?.grid ?? 16;
    const bars = r.rhythm?.bars ?? 1;
    return new Set((r.rhythm?.onsets ?? []).map((o) => {
      const [a, b] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
      return Math.round(((b ? a / b : a) % bars) * g);
    }));
  });
  let pairs = 0; let shared = 0;
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      pairs += 1;
      const inter = [...slots[i]].filter((x) => slots[j].has(x)).length;
      const smaller = Math.min(slots[i].size, slots[j].size) || 1;
      shared += inter / smaller;
    }
  }
  const overlap = pairs ? shared / pairs : 0;
  score += (1 - overlap) * 35;
  reasons.push(`interlock: mean onset overlap ${(overlap * 100).toFixed(0)}% (lower is more independent)`);

  // --- roles: reward a complete arrangement
  // --- mutual exclusion: two rows that are the SAME instrument played two ways
  // must not both cast. The reel-1 verify pass caught exactly this — its block
  // stack and its arpeggio are one instrument, and stacking them is doubling.
  for (const r of rows) {
    for (const x of r.exclusiveWith ?? []) {
      if (rows.some((o) => o.name === x)) {
        score -= 30;
        reasons.push(`WARNING: ${r.name} and ${x} are the same instrument played two ways — casting both is doubling`);
      }
    }
  }

  const roles = new Set(rows.map((r) => r.role));
  const hasLow = roles.has('bass');
  const hasHarm = roles.has('chords') || roles.has('pad') || roles.has('pluck') || roles.has('arp');
  const hasTop = roles.has('lead') || roles.has('counter') || roles.has('arp');
  const complete = [hasLow, hasHarm, hasTop].filter(Boolean).length;
  score += (complete / 3) * 25;
  reasons.push(`roles: ${[...roles].join('+')} — ${complete}/3 of bass/harmony/top`);
  if (!hasLow) reasons.push('WARNING: no bass in this stack');
  const leads = rows.filter((r) => r.role === 'lead').length;
  if (leads > 1) { score -= 15; reasons.push(`WARNING: ${leads} leads compete`); }

  return { score: Math.round(Math.max(0, Math.min(100, score))), reasons, overlap: Number(overlap.toFixed(3)), bands: uniq };
}

/** Every vibe class a pattern set can serve — used by the tests. */
export function patternVibes() {
  const s = new Set();
  for (const lp of Object.values(LAYER_PATTERNS)) for (const v of lp.vibes ?? []) s.add(v);
  return s;
}
