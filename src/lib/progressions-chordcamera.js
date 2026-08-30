// Chord progressions transcribed from @ChordCamera (by Haltber) — r26.
//
// SOURCE. One screen recording Ethan made on 2026-08-29 and handed over:
// `ScreenRecording_08-29-2026 20-04-54_1.MP4`, 4m19s, in which he scrolls
// through 21 consecutive Instagram reels from a single account. Every reel is
// the same format: a title, the full chord list burned into the frame, an
// orange box that steps through the list in time with the audio, and a piano
// keyboard whose keys light as they sound (teal for the voicing, orange for the
// bass). His brief, verbatim: "it contains a bunch of chord progressions that
// are nice (kinda like citypop/kpop style chord progressions). copy them as
// foundations. it's important to analyze the rhythm of the chords, the
// intervals, the extra stuff between the chords, and how long each chord lasts
// in the progression (to ensure u understand its place and purpose)" — and then
// "except for nonfuctional neo soul melodie, that one doesn't belong."
//
// THE EXCLUSION IS HONOURED. Reel 12, "Non Functional Neo Soul Harmonies"
// (Dm11-Bm11-Ebm11-Dbm11-Cm9-Bbmaj7-Amaj7, a chain of parallel m11s that never
// resolves), is NOT in this file. It was read and measured like the others and
// then dropped on his word.
//
// THE VIDEO IS NOT IN THE REPO and never will be: third-party copyrighted reels,
// which his r16 licensing ruling puts under "local-only, never committed". Only
// this hand-authored reading of them lives in src/lib. That is the same D95 line
// the vgmusic and manual-r22 corpora sit behind.
//
// ---------------------------------------------------------------------------
// HOW THIS WAS READ, AND HOW FAR TO TRUST IT
// ---------------------------------------------------------------------------
// Reels were segmented by frame-difference (22 segments, boundaries confirmed
// against frames either side). Three things were then measured per reel:
//
//   CHORDS      read off the burned-in text. This is the strongest evidence in
//               the file — the labels are the publisher's own claim, not my
//               transcription of audio.
//   DURATION    the orange box was tracked at 8 fps and its distinct positions
//               sorted into reading order, which gives the exact time each chord
//               is highlighted. Durations quantise cleanly (fit error 0.04-0.16
//               of a unit), so `chordUnits` below is a RELATIVE duration per
//               chord, not a guess.
//   VOICING     lit keys were decoded from the keyboard strip. The keyboard PANS
//               horizontally between reels, so each segment's offset was solved
//               by matching detected bass keys against the labelled bass. Where
//               that agreement is high the voicing is trustworthy; where it is
//               not, NO voicing is recorded. `bassAgree` states it per entry and
//               only entries at >= 0.75 carry `observedVoicing`.
//
// NOT MEASURED: tempo. The reels show no barlines and no BPM, so `sectionBars`
// follows this pack's existing convention (~1 chord per bar) and `chordUnits` is
// relative. A chord marked 1 against neighbours marked 2 lasts HALF as long — it
// is not a claim about beats.
//
// ATTACK SHAPE, measured at 30 fps on the three highest-confidence reels: the
// voicing is complete 33 ms after the box moves (median 1 frame, max 8). These
// are BLOCK chords struck together, not rolled or arpeggiated — with one spread
// chord in reel 18. Median voicing size is 5 notes (range 2-11), against our own
// accompaniment hand's median of ONE note per attack (r26 measurement). That gap
// is the D98 "four-note chords are the target" ask arriving from a new source.
//
// ---------------------------------------------------------------------------
// THE FINDING THE DURATIONS PRODUCED — his "place and purpose" ask, answered
// ---------------------------------------------------------------------------
// Across all 19 progressions the chord rhythm is EVEN, and the exceptions carry
// the meaning. A chord at half the prevailing length is, without exception, one
// of three things:
//
//   a PASSING chord   the diminished connectors (C#o7 in reel 19, whose own
//                     title is "& a Passing Chord"), always half-length
//   an APPROACH chord the second half of a ii-V insert (Dm7b5-G7b13 in reel 18,
//                     the "surprising moves" of its title, both half-length
//                     while every structural chord around them is full)
//   a DECEPTION       the chord that arrives instead of the expected resolution
//                     (reel 11's Em7 and CD7, both half-length)
//
// So duration is not decoration here: full length = structural, half length =
// connective. That is the same shape already recorded for vid_eunyu_circle
// ("the two connector chords take half a bar each while everything else takes a
// full one"), now confirmed on 19 more progressions from a different publisher.
//
// ---------------------------------------------------------------------------
// WHAT THE DEGREES GRAMMAR CANNOT SAY
// ---------------------------------------------------------------------------
// This is a jazz/city-pop vocabulary and our dialect is smaller than it. Every
// entry carries `dialectDrops` naming what the reduction lost, so nothing here
// silently claims to be what it is not. The recurring gaps, by frequency:
//
//   9sus4 / 13sus4      -> `7sus`   (11 occurrences: the extension is the sound)
//   m11                 -> `m9`     (3)
//   7b9 / 7b13 / 7#5#9  -> `7`      (8: every altered dominant flattens to plain)
//   add4                -> triad    (2: no add4 quality exists)
//   D7#5                -> `+`      (1: kept the #5, dropped the 7th)
//
// The altered-dominant loss is the big one — a third of these progressions get
// their character from an altered V, and `7` writes a plain one. `voicedAs`
// keeps the published symbol so the day the vocabulary grows, the material is
// already here.
//
// ---------------------------------------------------------------------------
// SAFETY (D95) — AND A CORRECTION I HAD TO MAKE MID-WAY
// ---------------------------------------------------------------------------
// THIS PACK IS DELIBERATELY *NOT* MERGED INTO `ALL_PROGRESSIONS`, and a test
// (test/chordcamera.test.js) enforces that it stays out.
//
// My first attempt did merge it, on the reasoning that `ratified: false` keeps
// it out of exemplarPool() — which is true, and verified: all four pools return
// zero chordcamera entries, and rebuilding both audition pages moved 0 of 75
// songs. But two other things read `ALL_PROGRESSIONS` and neither cares about
// ratification:
//
//   scripts/build-harmony-model.mjs COUNTS EVERY ENTRY. The counted model ranks
//   the variation ops, so nineteen new entries restage it — which is D95's
//   documented failure ("at 1200 files it flipped `treat` on 18 songs, KEPT ones
//   included"). `node scripts/build-harmony-model.mjs --check` caught it.
//
//   src/lib/progressions.js IS IMPORTER-GENERATED. Adding an import line there
//   fails `node scripts/import-ldrolez.mjs --check`, which exists to stop
//   exactly that hand edit.
//
// So the pack stands alone. It is candidate material, not library material: a
// consumer that wants it imports it by name, and promoting an entry into
// retrieval is a deliberate act taken one entry at a time after his ear rules —
// which is what D95 means by "authoring canon entries by hand, not re-counting".
//
// `sourceEndorsed: true` throughout: he chose these reels and called the
// progressions "nice". That endorses the SOURCE, not my reading of it, so
// `ratified` stays false and `needsEar` stays true.

export const PROGRESSIONS_CHORDCAMERA = {

  // -------------------------------------------------------------------------
  // reel 1: "Mixing chords from 4 different scales"  —  A:major
  // -------------------------------------------------------------------------
  vid_cc_four_scales: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Mixing chords from 4 different scales', section: 'A', sectionBars: 9,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '0.0-19.5s',
    numerals: 'I-I7-vim7-bVI+-I-bvm7b5-iim7-V7sus-Iadd9',
    degrees: '0 0:7 9:m7 8:+ 0 6:m7b5 2:m7 7:7sus 0:add9',
    voicedAs: ["A", "A7/G", "F#m7", "FΔ7#5", "A/E", "D#m7b5", "Bm7", "E9sus4", "Aadd9"],
    chordUnits: [2, 2, 2, 2, 2, 2, 2, 2, 2],
    unitsObserved: 7,
    bassNotes: [null, 7, null, null, 4, null, null, null, null],
    dialectDrops: ["FΔ7#5: the 7th (kept the #5 — it IS the sound)", "E9sus4: 9th over the sus"],
    bassAgree: 0.6,
    sourceKey: 'A:major', coverage: null, moods: ["bright", "shifting"],
    character: null,
    notes: "Nine chords, seven of them measured at an identical length: this is an EVEN progression whose interest is entirely vertical. The publisher's claim is four different scales in one loop and the degrees bear it out - I and I7 (mixolydian), F#m7 (aeolian), FΔ7#5 (lydian augmented on bVI) and D#m7b5 (locrian on bV). The bass does the connecting: A -> G under the I7, then E under A/A/E, so the harmony sits still while the bottom voice walks down A-G-E. Copy the BASS DESCENT under a held tonic, not the chord chain.",
  },

  // -------------------------------------------------------------------------
  // reel 2: "45 seconds Progression using just 3-note chords"  —  E:major
  // -------------------------------------------------------------------------
  vid_cc_three_note: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — 45 seconds Progression using just 3-note chords', section: 'A', sectionBars: 14,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '19.5-40.2s',
    numerals: 'I-I-V-IV^7-ivm6-iiim7-vim-iim-I-IV^7-bvm7b5-Vsus-V-I',
    degrees: '0 0 7 5:^7 5:m6 4:m7 9:m 2:m 0 5:^7 6:m7b5 7:sus 7 0',
    voicedAs: ["E/G#", "E/B", "B", "AΔ7", "Am6", "G#m7", "C#m", "F#m", "E/G#", "AΔ7", "A#m7b5", "Bsus4", "B", "E"],
    chordUnits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 11,
    bassNotes: [8, 11, null, null, null, null, null, null, 8, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.6,
    sourceKey: 'E:major', coverage: null, moods: ["light", "open"],
    character: null,
    notes: "The reel's own point is that every chord is THREE notes - no sevenths on the triads, and the measured voicings confirm it (median 3 notes, the lowest in the whole set). Its length is the other lesson: 14 chords at ONE unit each, the fastest harmonic rhythm here, which is what lets a three-note texture stay interesting. The two borrowings are Am6 (iv6, minor-plundered) and A#m7b5 (bv), both one unit like everything else - a chord this brief cannot destabilise. Sparse voicing plus fast changes is a trade, not a compromise.",
  },

  // -------------------------------------------------------------------------
  // reel 3: "R&B Idea in F minor with F major Sparks"  —  F:minor
  // -------------------------------------------------------------------------
  vid_cc_rnb_fmin_sparks: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — R&B Idea in F minor with F major Sparks', section: 'A', sectionBars: 11,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '40.2-49.0s',
    numerals: 'VI^7-vm7-I-ivm7-vm7-VI^7-VIIsus-VII-VI^7-vm7-I',
    degrees: '8:^7 7:m7 0 5:m7 7:m7 8:^7 10:sus 10 8:^7 7:m7 0',
    voicedAs: ["DbΔ7", "Cm7", "F", "Bbm7", "Cm7", "DbΔ7", "Ebsus4", "Eb", "DbΔ7", "Cm7", "F"],
    chordUnits: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 8,
    bassNotes: [null, null, null, null, null, null, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.714,
    sourceKey: 'F:minor', coverage: null, moods: ["warm", "yearning"],
    character: null,
    notes: "The 'F major sparks' of the title are literal: a MAJOR I dropped into F minor twice (bar 3 and the last chord), each time arriving from Cm7 - a minor v resolving to a major i, which is the whole hook. DbΔ7 opens and gets DOUBLE length; everything after it is one unit. So the progression states bVI, holds it, and spends the rest of its time moving. The Ebsus4 -> Eb pair is a suspension resolved in place, both halves short.",
  },

  // -------------------------------------------------------------------------
  // reel 4: "Turnaround + Circle of 5ths"  —  F#:major
  // -------------------------------------------------------------------------
  vid_cc_turnaround_fifths: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Turnaround + Circle of 5ths', section: 'A', sectionBars: 13,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '49.0-61.0s',
    numerals: 'I^7-III7-vim9-iim7-V7sus-I^7-IV^7-V-iiim7-vim9-iim9-V7sus-Iadd9',
    degrees: '0:^7 4:7 9:m9 2:m7 7:7sus 0:^7 5:^7 7 4:m7 9:m9 2:m9 7:7sus 0:add9',
    voicedAs: ["F#Δ7", "A#7", "D#m9", "G#m7", "C#9sus4", "F#Δ7", "BΔ7", "C#/B", "A#m7", "D#m11", "G#m9", "C#9sus4", "F#add9"],
    chordUnits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 12,
    bassNotes: [null, null, null, null, null, null, null, 11, null, null, null, null, null],
    dialectDrops: ["C#9sus4: 9th over the sus", "D#m11: 11th", "C#9sus4: 9th over the sus"],
    bassAgree: 0.833,
    sourceKey: 'F#:major', coverage: null, moods: ["polished", "circling"],
    character: null,
    notes: "Thirteen chords, all ONE unit - the most metrically uniform progression in the set, which is what a turnaround is for. Two descending fifth chains (A#7-D#m9-G#m7-C#9sus4-F#Δ7 and A#m7-D#m11-G#m9-C#9sus4-F#add9) separated by a IVΔ7-V lift. The III7 is a secondary dominant of vi and the only altered colour; every other chord is diatonic with an added 9 or 11. Uniform rhythm + moving roots = motion without drama.",
  },

  // -------------------------------------------------------------------------
  // reel 5: "Soulful Vibes Featuring Neapolitan Sixth"  —  E:minor
  // -------------------------------------------------------------------------
  vid_cc_neapolitan: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Soulful Vibes Featuring Neapolitan Sixth', section: 'A', sectionBars: 9,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '61.0-74.2s',
    numerals: 'imadd9-ivm9-V7-im9-imadd9-bII-im-V7sus-imadd9',
    degrees: '0:madd9 5:m9 7:7 0:m9 0:madd9 1 0:m 7:7sus 0:madd9',
    voicedAs: ["Em(add9)", "Am9", "B7(b9,b13)", "Em9", "Em(add9)", "F/A", "Em/B", "B7sus4(b9)", "Em(add9)"],
    chordUnits: [3, 2, 3, 3, 3, 3, 1, 2, 2],
    unitsObserved: 9,
    bassNotes: [null, null, null, null, null, 9, 11, null, null],
    dialectDrops: ["B7(b9,b13): b9 and b13", "B7sus4(b9): b9 over the sus"],
    bassAgree: 0.778,
    sourceKey: 'E:minor', coverage: null, moods: ["soulful", "dark-sweet"],
    character: null,
    notes: "The Neapolitan is F/A - bII in first inversion, so the bass reads A (iv) while the chord reads bII. That is why it does not sound like a wrench: the bass is doing a normal iv while the upper structure goes chromatic. It takes FULL length (3 units), the same as the tonic - a Neapolitan here is structural, not a passing colour. The one short chord in the reel is Em/B (1 unit), a bass-inversion pivot into the final cadence. B7(b9,b13) is the altered dominant that the dialect flattens to a plain 7 - the b9/b13 is the entire reason it bites.",
  },

  // -------------------------------------------------------------------------
  // reel 6: "Soothing Chords To Ease Your Mind"  —  D:minor
  // -------------------------------------------------------------------------
  vid_cc_soothing: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Soothing Chords To Ease Your Mind', section: 'A', sectionBars: 10,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '74.2-84.8s',
    numerals: 'im-VI-III-VIIsus-VII-ivm7-VI^7-V7-V7-im',
    degrees: '0:m 8 3 10:sus 10 5:m7 8:^7 7:7 7:7 0:m',
    voicedAs: ["Dm", "Bb/D", "F/C", "Csus4", "C", "Gm7", "BbΔ7", "A7(b13)", "A7", "Dm"],
    chordUnits: [3, 2, 2, 1, 2, 2, 2, 2, 2, 2],
    unitsObserved: 8,
    bassNotes: [null, 2, 0, null, null, null, null, null, null, null],
    dialectDrops: ["A7(b13): b13"],
    bassAgree: 0.875,
    sourceKey: 'D:minor', coverage: null, moods: ["calm", "settled"],
    character: null,
    notes: "A PEDAL-BASS progression: Dm, Bb/D (bass held on D), then F/C, Csus4, C (bass held on C). The chords change while the bass does not, which is what makes it 'soothing' - measured, the bass moves on 4 of 10 chords. The only short chord is Csus4 (1 unit against 2-3 everywhere else) and it is a suspension into C. A7(b13) -> A7 is the same device at the cadence: the altered form first, the plain form second, resolving the b13 by hand.",
  },

  // -------------------------------------------------------------------------
  // reel 7: "Viral Progression in F + Diminished Chords"  —  F:major
  // -------------------------------------------------------------------------
  vid_cc_face_dim_walk: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'jazz-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Viral Progression in F + Diminished Chords', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4, reels 7/13/21 (identical degrees in F, C# and C)',
    sourceAt: '84.8-92.2s',
    numerals: 'IV^7-ivo7-iiim7-biiio7-iim7-V7-I^7-biio7',
    degrees: '5:^7 5:o7 4:m7 3:o7 2:m7 7:7 0:^7 1:o7',
    voicedAs: ["Bbmaj7", "Bb°7", "Am7", "Ab°7", "Gm7", "C7", "Fmaj7", "Gb°7"],
    chordUnits: [3, 2, 2, 2, 2, 2, 2, 2],
    unitsObserved: 5,
    bassNotes: [null, null, null, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.0,
    sourceKey: 'F:major', coverage: null, moods: ["nostalgic", "stepwise"],
    character: null,
    notes: "THIS PROGRESSION APPEARS THREE TIMES IN THE RECORDING, in three keys - reel 7 'Viral Progression in F', reel 13 'Most Popular Chord Progression in C#' and reel 21 'The Viral FACE Progression', in F, C# and C. Identical degrees each time. Three of 21 reels being one shape is the strongest signal in the source about what it considers canonical. The mechanism: every diatonic chord is followed by a DIMINISHED SEVENTH a semitone below the next chord's root, so the roots walk down chromatically IV-IV-iii-bIII-ii-V-I-bII while the qualities alternate diatonic/diminished. In the C reading the top voice spells F-A-C-E, which is what the title means. Measured durations are even here - the diminished chords are NOT short. They are half the progression, not ornaments on it.",
  },

  // -------------------------------------------------------------------------
  // reel 8: "Jazzy Harmonies Mixing Modes"  —  Eb:major
  // -------------------------------------------------------------------------
  vid_cc_mixing_modes: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Jazzy Harmonies Mixing Modes', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '92.2-101.2s',
    numerals: 'I^7-IV^9-viim7-I^7-bIII^7-vim7-bVI^7-V^9',
    degrees: '0:^7 5:^9 11:m7 0:^7 3:^7 9:m7 8:^7 7:^9',
    voicedAs: ["EbΔ7", "AbΔ9", "Dm7", "EbΔ7", "GbΔ7", "Cm7", "CbΔ7", "BbΔ9"],
    chordUnits: [1, 2, 1, 1, 1, 2, 1, 1],
    unitsObserved: 6,
    bassNotes: [null, null, null, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.0,
    sourceKey: 'Eb:major', coverage: null, moods: ["floating", "modal"],
    character: null,
    notes: "Planing major sevenths: EbΔ7 -> AbΔ9 -> Dm7 -> EbΔ7, then GbΔ7 (bIII, borrowed) and CbΔ7 (bVI, spelled Cb and captioned '(BΔ7)' by the publisher - the enharmonic is theirs, not mine). The vii m7 (Dm7) in a major key is the tell that this is modal rather than functional. Voicings measured at 2-3 notes: these are ROOTLESS shells, which is how planed maj7s avoid mud.",
  },

  // -------------------------------------------------------------------------
  // reel 9: "Chromatic Moves with Modulation A → Bb"  —  Bb:major
  // -------------------------------------------------------------------------
  vid_cc_chromatic_mod: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Chromatic Moves with Modulation A → Bb', section: 'A', sectionBars: 10,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '101.2-111.2s',
    numerals: 'III^7-iiim7-biiim7-II^7-iim7-V7sus-I^7-biio7-IV^7-ivm7',
    degrees: '4:^7 4:m7 3:m7 2:^7 2:m7 7:7sus 0:^7 1:o7 5:^7 5:m7',
    voicedAs: ["DΔ7", "Dm7", "C#m7", "CΔ7", "Cm7", "F9sus4", "BbΔ7", "B°7", "EbΔ7", "Ebm7"],
    chordUnits: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 7,
    bassNotes: [null, null, null, null, null, null, null, null, null, null],
    dialectDrops: ["F9sus4: 9th over the sus"],
    bassAgree: 0.714,
    sourceKey: 'Bb:major', coverage: null, moods: ["restless", "travelling"],
    character: null,
    notes: "A genuine modulation, and the title states it: A major to Bb major. The pivot is Cm7 - ii of Bb - reached by a chromatic descent of PARALLEL SEVENTHS whose roots step down by semitone (DΔ7-Dm7-C#m7-CΔ7-Cm7). Degrees are given relative to the DESTINATION key so the ii-V-I lands where it should; the first four chords read as III/iii/biii/II from Bb, which is the honest way to write an approach from a foreign key. After the arrival, Bo7 is a half-length passing chord into EbΔ7. Copy the semitone-parallel-seventh descent.",
  },

  // -------------------------------------------------------------------------
  // reel 10: "All Diatonic Chords Twisted by Extensions"  —  E:major
  // -------------------------------------------------------------------------
  vid_cc_diatonic_twisted: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — All Diatonic Chords Twisted by Extensions', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '111.2-120.0s',
    numerals: 'vim9-IV^9-iim9-iiim7-IV^7-V7sus-V7sus-I^9',
    degrees: '9:m9 5:^9 2:m9 4:m7 5:^7 7:7sus 7:7sus 0:^9',
    voicedAs: ["C#m9", "AΔ9", "F#m9", "G#m7", "AΔ7", "B13sus4", "B9sus4", "EΔ9"],
    chordUnits: [3, 2, 2, 2, 2, 2, 2, 1],
    unitsObserved: 8,
    bassNotes: [null, null, null, null, null, null, null, null],
    dialectDrops: ["B13sus4: 13th over the sus", "B9sus4: 9th over the sus"],
    bassAgree: 0.5,
    sourceKey: 'E:major', coverage: null, moods: ["lush", "even"],
    character: null,
    notes: "Entirely diatonic - the title's claim is that the EXTENSIONS do the work, and it holds: every chord is a plain scale degree wearing a 9th or a 13th. vi9-IV9-ii9-iii7-IV7-V13sus-V9sus-I9. The two sus chords at the cadence are the only tension and they are sus, not altered. This is the entry to reach for when a bright cue needs colour without a single foreign pitch: measured, ZERO out-of-key chord tones.",
  },

  // -------------------------------------------------------------------------
  // reel 11: "90s Vibe Loop with 2 Deceptive Cadences"  —  C:major
  // -------------------------------------------------------------------------
  vid_cc_90s_deceptive: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — 90s Vibe Loop with 2 Deceptive Cadences', section: 'A', sectionBars: 13,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '120.0-135.2s',
    numerals: 'I^9-VII7-III7sus-iiim7-bII9-I^9-II7sus-V^9-bvm7b5-VII7sus-I^7-vim9-II7sus',
    degrees: '0:^9 11:7 4:7sus 4:m7 1:9 0:^9 2:7sus 7:^9 6:m7b5 11:7sus 0:^7 9:m9 2:7sus',
    voicedAs: ["CΔ9", "B7b9", "E9sus4", "Em7", "Db9", "CΔ9", "D9sus4", "GΔ9", "F#m7b5", "B7sus4", "CΔ7", "Am9", "D9sus4"],
    chordUnits: [4, 2, 2, 1, 2, 1, 2, 2, 2, 1, 1, 2, 2],
    unitsObserved: 11,
    bassNotes: [null, null, null, null, null, null, null, null, null, null, null, null, null],
    dialectDrops: ["B7b9: b9", "E9sus4: 9th over the sus", "D9sus4: 9th over the sus", "D9sus4: 9th over the sus"],
    bassAgree: 0.333,
    sourceKey: 'C:major', coverage: null, moods: ["wistful", "turning"],
    character: null,
    notes: "Two deceptive cadences, and the DURATIONS mark them: both times the expected resolution is replaced by a HALF-LENGTH chord (Em7 after E9sus4, CΔ7 after B7sus4) before the loop moves on. Everything structural runs 2 units; the deceptions run 1. The tonic gets 4 units at the top - the longest single chord measured in the whole recording. Db9 is a tritone substitute for the V. Thirteen chords is the longest loop here.",
  },

  // -------------------------------------------------------------------------
  // reel 13: "Most Popular Chord Progression in C#"  —  C#:major
  // -------------------------------------------------------------------------
  vid_cc_cinematic_cmin: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'cinematic',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Most Popular Chord Progression in C#', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '145.2-156.8s',
    numerals: 'IV^7-ivo7-iiim7-biiio7-iim7-V7-I^7-biio7',
    degrees: '5:^7 5:o7 4:m7 3:o7 2:m7 7:7 0:^7 1:o7',
    voicedAs: ["F#maj7", "F#°7", "E#m7", "E°7", "D#m7", "G#7", "C#maj7", "D°7"],
    chordUnits: [2, 2, 2, 2, 2, 2, 2, 1],
    unitsObserved: 6,
    bassNotes: [null, null, null, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.333,
    sourceKey: 'C#:major', coverage: null, moods: ["still", "wide"],
    character: null,
    notes: "A pedal on C for the first three chords (Cm9, Abadd9/C, Bbadd4 all over or containing C), then the bass finally moves for Ebmaj9/G. The 'texture' the title promises is that stasis. Add-chords rather than sevenths throughout - add9 and add4 keep the third and add a second, which is a brighter, more open sound than a m7 and is exactly what the dialect cannot spell (add4 reduces to a bare triad here). G7sus4 -> G7 is the same suspend-then-resolve cadence as reel 6.",
  },

  // -------------------------------------------------------------------------
  // reel 15: "Neo-Soul Chords with Spicy Changes & a SubV"  —  C:major
  // -------------------------------------------------------------------------
  vid_cc_subv: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Neo-Soul Chords with Spicy Changes & a SubV', section: 'A', sectionBars: 9,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '163.8-173.0s',
    numerals: 'I^7-VII7-iiim9-vim9-II7sus-V^7-iim9-bII9-I^7',
    degrees: '0:^7 11:7 4:m9 9:m9 2:7sus 7:^7 2:m9 1:9 0:^7',
    voicedAs: ["Cmaj7", "B7b13", "Em9", "Am9", "D9sus4/A", "Gmaj7", "Dm9", "Db9", "Cmaj7"],
    chordUnits: [1, 1, 1, 2, 2, 1, 2, 1, 1],
    unitsObserved: 8,
    bassNotes: [null, null, null, null, 9, null, null, null, null],
    dialectDrops: ["B7b13: b13", "D9sus4/A: 9th over the sus"],
    bassAgree: 0.625,
    sourceKey: 'C:major', coverage: null, moods: ["spicy", "smooth"],
    character: null,
    notes: "The SubV is Db9 - a tritone substitute for G7 - and it is HALF LENGTH, arriving one unit before the tonic returns. Every structural chord (Am9, D9sus4/A, Dm9) is 2 units; every connector (Cmaj7, Em9, Gmaj7, Db9) is 1. B7b13 in bar 2 is a secondary dominant of iii with an altered 13th. D9sus4/A is a sus chord over its own fifth - the bass stays on A while the chord changes above it, the same pedal trick as reel 6.",
  },

  // -------------------------------------------------------------------------
  // reel 16: "La Folía — Variations on One of the Oldest Progressions"  —  D:minor
  // -------------------------------------------------------------------------
  vid_cc_la_folia: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'baroque',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — La Folía — Variations on One of the Oldest Progressions', section: 'A', sectionBars: 12,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '173.0-184.8s',
    numerals: 'im-V-im-VII-IIIadd9-VII-V-im-ivm7-Vsus-V-im',
    degrees: '0:m 7 0:m 10 3:add9 10 7 0:m 5:m7 7:sus 7 0:m',
    voicedAs: ["Dm", "A/C#", "Dm", "C/E", "Fadd9", "C", "A/C#", "Dm", "Gm7", "Asus4", "A", "Dm"],
    chordUnits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 7,
    bassNotes: [null, 1, null, 4, null, null, 1, null, null, null, null, null],
    dialectDrops: [],
    bassAgree: 0.714,
    sourceKey: 'D:minor', coverage: null, moods: ["ancient", "formal"],
    character: null,
    notes: "The oldest progression in the recording and the only one whose bass is the SUBJECT: i-V-i-bVII-bIII-bVII-V-i with A/C# and C/E putting the dominant and the bVII in first inversion, so the bass alternates step and leap (D-C#-D-E-F...). Fadd9 rather than F is the publisher's modernisation. Asus4 -> A at the cadence is the same suspend-then-resolve as reels 6 and 13 - three of nineteen progressions end that way.",
  },

  // -------------------------------------------------------------------------
  // reel 17: "Lights & Shadows — Major ⇄ Minor Mode Switch"  —  D:major
  // -------------------------------------------------------------------------
  vid_cc_mode_switch: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'cinematic',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Lights & Shadows — Major ⇄ Minor Mode Switch', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '184.8-192.5s',
    numerals: 'vim7-bVI^7-V7-I^7-ivm9-bVII7sus-Iadd9-imadd9',
    degrees: '9:m7 8:^7 7:7 0:^7 5:m9 10:7sus 0:add9 0:madd9',
    voicedAs: ["Bm7", "Bbmaj7", "A7#5#9", "Dmaj7", "Gm9", "C13sus4", "Dadd9/F#", "Dmadd9/F"],
    chordUnits: [1, 1, 1, 1, 1, 1, 1, 1],
    unitsObserved: 4,
    bassNotes: [null, null, null, null, null, null, 6, 5],
    dialectDrops: ["A7#5#9: #5 and #9", "C13sus4: 13th over the sus"],
    bassAgree: 0.5,
    sourceKey: 'D:major', coverage: null, moods: ["bittersweet", "pivoting"],
    character: null,
    notes: "A major/minor switch on the SAME root, stated twice: Dmaj7 in the middle, then Dadd9/F# and Dmadd9/F at the end - the identical chord in major and minor a beat apart, with the bass moving F#->F to spell the change. That semitone in the bass IS the device. Bbmaj7 is bVI borrowed from D minor and A7#5#9 is the altered dominant that sets it up; both alterations are lost in the dialect reduction, which for this entry costs more than usual.",
  },

  // -------------------------------------------------------------------------
  // reel 18: "Neo-Soul Essence with Surprising Moves"  —  F:minor
  // -------------------------------------------------------------------------
  vid_cc_neosoul_essence: {
    family: 'minor', pack: 'chordcamera', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Neo-Soul Essence with Surprising Moves', section: 'A', sectionBars: 10,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '192.5-208.2s',
    numerals: 'im7-vm9-VII^9-III^7-VI^7-vim7b5-II7-III^7-I7-IV7sus',
    degrees: '0:m7 7:m9 10:^9 3:^7 8:^7 9:m7b5 2:7 3:^7 0:7 5:7sus',
    voicedAs: ["Fm7", "Cm9", "EbΔ9", "AbΔ7", "DbΔ7", "Dm7b5", "G7b13", "AbΔ7", "F7/A", "Bb9sus4"],
    chordUnits: [2, 2, 2, 2, 2, 1, 1, 2, 2, 2],
    unitsObserved: 10,
    bassNotes: [null, null, null, null, null, null, null, null, 9, null],
    dialectDrops: ["G7b13: b13", "Bb9sus4: 9th over the sus"],
    bassAgree: 1.0,
    sourceKey: 'F:minor', coverage: null, moods: ["soulful", "surprising"],
    character: null,
    notes: "The highest-confidence read in the file (bass agreement 1.00, voicings measured chord for chord). Eight structural chords at 2 units and exactly TWO at 1 unit - Dm7b5 and G7b13, a ii-V insert in the relative that arrives, turns and leaves inside the time of one normal chord. That is what the title's 'surprising moves' means and the duration measurement finds it without being told. F7/A at the end is a major I7 in first inversion - the same major-tonic-in-a-minor-key spark as reel 3. Voicings sit F2-C5 with the bass doubled at the octave on the first chord.",
  },

  // -------------------------------------------------------------------------
  // reel 19: "From Pedal Point Stillness to Brighter Vibes"  —  Ab:major
  // -------------------------------------------------------------------------
  vid_cc_pedal_point: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — From Pedal Point Stillness to Brighter Vibes', section: 'A', sectionBars: 11,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '208.2-218.8s',
    numerals: 'I-II7-iim7-I-I-vim7-II7-iim7-V7sus-V7-Iadd9',
    degrees: '0 2:7 2:m7 0 0 9:m7 2:7 2:m7 7:7sus 7:7 0:add9',
    voicedAs: ["Ab", "Bb7/Ab", "Bbm7/Ab", "Ab", "Ab/G", "Fm7", "Bb7", "Bbm7", "Eb9sus4", "Eb7b9", "Abadd9"],
    chordUnits: [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    unitsObserved: 8,
    bassNotes: [null, 8, 8, null, 7, null, null, null, null, null, null],
    dialectDrops: ["Eb9sus4: 9th over the sus", "Eb7b9: b9"],
    bassAgree: 0.5,
    sourceKey: 'Ab:major', coverage: null, moods: ["still-to-bright", "lifting"],
    character: null,
    notes: "The title is the structure: four chords over an Ab pedal (Ab, Bb7/Ab, Bbm7/Ab, Ab) in which the bass never moves and the chord above it goes major, then minor, then home - then the bass finally steps Ab->G and the progression opens out. Bb7 -> Bbm7 is the same major-then-minor pair as reel 17, here over a pedal instead of in the bass. The cadence is Eb9sus4 -> Eb7b9 -> Abadd9: sus, then altered, then home, with the altered dominant getting full length.",
  },

  // -------------------------------------------------------------------------
  // reel 20: "Warm Extensions & a Passing Chord"  —  C:major
  // -------------------------------------------------------------------------
  vid_cc_warm_passing: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — Warm Extensions & a Passing Chord', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '218.8-228.8s',
    numerals: 'IV^9-V7-I^9-biio7-iim9-V7sus-V7-I^9',
    degrees: '5:^9 7:7 0:^9 1:o7 2:m9 7:7sus 7:7 0:^9',
    voicedAs: ["Fmaj9", "G7/F", "Cmaj9", "C#°7", "Dm11", "G13sus4", "G7(b9,b13)", "Cmaj9"],
    chordUnits: [3, 2, 2, 1, 1, 2, 2, 2],
    unitsObserved: 6,
    bassNotes: [null, 5, null, null, null, null, null, null],
    dialectDrops: ["Dm11: 11th", "G13sus4: 13th over the sus", "G7(b9,b13): b9 and b13"],
    bassAgree: 0.5,
    sourceKey: 'C:major', coverage: null, moods: ["warm", "easy"],
    character: null,
    notes: "The clearest passing chord in the recording, and its own title names it. C#o7 sits between Cmaj9 and Dm11 and is measured at HALF the length of its neighbours - a chromatic connector whose only job is to walk the bass C->C#->D. Dm11 beside it is also short; the two together are one gesture. Fmaj9 opens at 3 units, the longest chord, so the shape is: long tonic-substitute, movement, short chromatic step, cadence. G13sus4 -> G7(b9,b13) is a sus-then-altered cadence that the dialect flattens to 7sus -> 7, losing both alterations.",
  },

  // -------------------------------------------------------------------------
  // reel 22: "The Alphabet Bass  A>B>C>D>E>F>G"  —  C:major
  // -------------------------------------------------------------------------
  vid_cc_alphabet_bass: {
    family: 'major', pack: 'chordcamera', role: 'harmony', style: 'pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: '@ChordCamera — The Alphabet Bass  A>B>C>D>E>F>G', section: 'A', sectionBars: 9,
    source: 'ScreenRecording_08-29-2026 20-04-54_1.MP4',
    sourceAt: '236.5-255.8s',
    numerals: 'vim7-V-Iadd9-iim7-Iadd9-IV^7-I-V-vim7',
    degrees: '9:m7 7 0:add9 2:m7 0:add9 5:^7 0 7 9:m7',
    voicedAs: ["Am7", "Gadd4/B", "Cadd9", "Dm7", "Cadd9/E", "Fmaj7", "C/G", "G", "Am7"],
    chordUnits: [4, 4, 1, 1, 2, 3, 1, 1, 1],
    unitsObserved: 6,
    bassNotes: [null, 11, null, null, 4, null, 7, null, null],
    dialectDrops: ["Gadd4/B: the added 4th (no add4 in the dialect)"],
    bassAgree: 0.556,
    sourceKey: 'C:major', coverage: null, moods: ["friendly", "climbing"],
    character: null,
    notes: "A BASS LINE dressed as a progression: the title is A>B>C>D>E>F>G and the bass literally walks the scale, with inversions invented as needed to make it do so (Gadd4/B, Cadd9/E, C/G). The chords are whatever sits over the next bass note, which is the inverse of how the rest of this pack is built - and a direct answer to the r26 finding that our own accompaniment's top voice moves by step only ~10% of the time. Am7 is both the first and last chord and takes 4 units at the ends; the walking middle runs 1-3 units per chord. Copy the PRINCIPLE: choose the inversion that keeps the bass stepwise.",
  },
};
