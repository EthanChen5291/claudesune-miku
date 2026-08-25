// Chord progressions transcribed BY EYE from Ethan's video collection (D57).
//
// HAND-WRITTEN, NOT GENERATED. The source is twelve Instagram videos in the
// repo root (igexport-*.mp4) showing piano-roll / falling-note renderings with
// on-screen chord labels; frames were read and the label sequences transcribed
// (session 2026-08-25). There is no MIDI behind these — the pipeline that
// checks label-vs-notes agreement (D45) cannot run, so every entry carries
// `coverage: null` and `provenance: 'video-transcribed'`, and the full label
// as displayed is kept in `voicedAs` wherever the degrees grammar simplifies it
// (F7(9,13) lands as :7 — the extensions are the video's claim, preserved for
// the day the quality vocabulary grows).
//
// SECTIONS, PER ETHAN'S BRIEF: "cut the chords up into sections (the chords
// that went into 8 or 4 measures depending on when that section ended ... not
// 8 or 4 chords, but the total chords that went into a section)". Each entry is
// one section; `song` links the sections of one piece so they can be recombined
// ("note that they can be mixed"). Bar counts are estimated from label timing
// (~1 chord/bar unless noted) since the videos show no barlines.
//
// `sourceEndorsed: true` on every entry: Ethan, verbatim — "i am a fan of how
// all the songs sound. these songs all sound good and i want the engine to be
// able to create music like theirs." That endorses the SOURCE, not this
// transcription of it — a verdict on my reading of a video is still the ear's
// to give (A6.1), so ratified stays false and needsEar stays true.
//
// GENRE NOTE (Ethan): several of these are jazz/city-pop/neo-soul — "different
// genre from ours ... will be more intricate to mix around and such and will
// mix differently." The style tags say which idiom each came from so retrieval
// can keep idioms apart until blending rules exist.

export const PROGRESSIONS_VIDEOS = {

  // -------------------------------------------------------------------------
  // Video: igexport-DRIEseyk294 — Fujii Kaze quiz clip, key B major.
  // One strike per chord, LH single bass note ~octave 2 + RH close cluster C3–C4.
  // -------------------------------------------------------------------------
  vid_fujii_quiz_loop: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze quiz clip (B major)', section: 'A', sectionBars: 4,
    source: 'igexport-DRIEseyk294.mp4',
    numerals: 'iim7-iiim7-vim7',
    degrees: '2:m7 4:m7 9:m7',
    voicedAs: ['C#m7', 'D#m7', 'G#m7'],
    sourceKey: 'B:major', coverage: null, moods: ['warm', 'circling'],
    character: null,
    notes: 'ii–iii–vi with the tonic never stated — the loop floats. Repeated 3x before the B section.',
  },
  vid_fujii_quiz_resolve: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze quiz clip (B major)', section: 'B', sectionBars: 6,
    source: 'igexport-DRIEseyk294.mp4',
    numerals: 'V7-I^7-bV7-IV^7-III7-bVII^7',
    degrees: '7:7 0:^7 6:7 5:^7 4:7 10:^7',
    voicedAs: ['F#7(9)', 'BMaj7(9)', 'F7(9,#11)', 'EMaj7(9)', 'D#7(b9,#9)', 'AMaj7'],
    sourceKey: 'B:major', coverage: null, moods: ['resolving', 'lush'],
    character: null,
    notes: 'The payoff after the floating loop: V finally lands I, then slides out through bV7(#11) '
      + '(tritone colour), IV, V/vi altered, and ENDS on bVIImaj7 — resolution without a full stop. '
      + 'Video renders the altered dominants in gold/rainbow: the source itself flags them as the spice.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-DXNX1y0k7-W — jazz ballad study, key E major, ~38s.
  // Sections split where the bass line changes direction.
  // -------------------------------------------------------------------------
  vid_eballad_descent: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'E-major ballad study', section: 'A', sectionBars: 4,
    source: 'igexport-DXNX1y0k7-W.mp4',
    numerals: 'I-iim7-III7-vim7-vm7-#ivm7b5-IV^7',
    degrees: '0 2:m7 4:7 9:m7 7:m7 6:m7b5 5:^7',
    voicedAs: ['E', 'F#m7', 'G#7alt', 'C#m7', 'Bm7', 'A#m7-5', 'AMaj7'],
    sourceKey: 'E:major', coverage: null, moods: ['tender', 'falling'],
    character: null,
    notes: 'Bass walks E–F#–G#–C#–B–A#–A: up then chromatic descent. 7 chords over ~4 bars '
      + '(two per bar in the middle). #ivm7b5 -> IVmaj7 is the section\'s signature move, repeated later.',
  },
  vid_eballad_slashes: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'E-major ballad study', section: 'B', sectionBars: 4,
    source: 'igexport-DXNX1y0k7-W.mp4',
    numerals: 'iiim7-VI+-iim7-II7-Vsus-bII7-I',
    degrees: '4:m7 9:7 2:m7 2:7 7:sus 1:7 0',
    voicedAs: ['G#m7', 'C#aug/G', 'F#m7', 'F#7/A#', 'B13sus4', 'F7(9,#11)', 'E'],
    sourceKey: 'E:major', coverage: null, moods: ['suspended', 'chromatic'],
    character: null,
    notes: 'The slash-bass section: C#aug/G and F#7/A# walk the bass chromatically G–A#–B. '
      + 'B13sus4 is the dominant that never shows its third; bII7(#11) resolves down a semitone to I. '
      + 'Qualities simplified — the slash basses are the point and the grammar cannot hold them yet.',
  },
  vid_eballad_dim_pivot: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'E-major ballad study', section: 'C', sectionBars: 4,
    source: 'igexport-DXNX1y0k7-W.mp4',
    numerals: 'viim7b5-III7-vim7-bVIIo7',
    degrees: '11:m7b5 4:7 9:m7 10:o7',
    voicedAs: ['D#m7-5', 'G#7/C', 'C#m7', 'Ddim7'],
    sourceKey: 'E:major', coverage: null, moods: ['dark', 'pivoting'],
    character: null,
    notes: 'iiø–V/vi–vi then the Ddim7 PIVOT — held ~2 bars and carrying the ascending dim run '
      + '(see FIGURATIONS_VIDEOS.vid_run_dim_ascent). The stall on the dim chord is what makes '
      + 'room for the flourish; harmony and figure were designed together.',
  },
  vid_eballad_planing: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jazz-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'E-major ballad study', section: 'D', sectionBars: 4,
    source: 'igexport-DXNX1y0k7-W.mp4',
    numerals: 'iim9-iiim7-bIII^7-bII^7',
    degrees: '2:m9 4:m7 3:^7 1:^7',
    voicedAs: ['F#m7(9)', 'G#m7', 'GMaj7', 'FMaj7b5'],
    sourceKey: 'E:major', coverage: null, moods: ['floating', 'modal'],
    character: null,
    notes: 'Non-diatonic planing: two maj7 chords a semitone apart (bIII, bII) slid under a '
      + 'diatonic frame. Modal colour, not function — the corpus has almost nothing like it.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-DYhxb2VTGbm — neo-soul loop, key F major, ~17s.
  // Short syncopated comping stabs; melody noodles on top between hits.
  // -------------------------------------------------------------------------
  vid_neosoul_loop: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'F neo-soul loop', section: 'A', sectionBars: 8,
    source: 'igexport-DYhxb2VTGbm.mp4',
    numerals: 'iim9-III7-vim7-vm7-I7-IIsus-#IVo7-vm9-I7',
    degrees: '2:m9 4:7 9:m7 7:m7 0:7 2:sus 11:o7 7:m9 0:7',
    voicedAs: ['Gm7(9)', 'A7#5(#9)', 'Dm7', 'Cm7', 'F7(9,13)', 'G9sus4', 'Bdim7', 'Cm7(9)', 'F7(9,13)'],
    sourceKey: 'F:major', coverage: null, moods: ['smooth', 'groovy'],
    character: null,
    notes: 'ii9–III7alt–vi opens (royal-road adjacent), then v7–I7 pointing at IV that never comes — '
      + 'G9sus4 deceives instead. #ivo7 passing into the v-I7 cell. The I is a DOMINANT seventh '
      + 'throughout: blues/gospel tonic, not a maj7. Ended live on C#aug7/D# (out-chord).',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-DYsBsQ-z8cm — Fujii Kaze 優しさ (Yasashisa), key Db major.
  // -------------------------------------------------------------------------
  vid_yasashisa_a: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze — Yasashisa (Db major)', section: 'A', sectionBars: 4,
    source: 'igexport-DYsBsQ-z8cm.mp4',
    numerals: 'IV^7-V-vim7-iiim7-iim7-V7-I-bV7',
    degrees: '5:^7 7 9:m7 4:m7 2:m7 7:7 0 6:7',
    voicedAs: ['GbMaj7', 'Ab', 'Bbm7', 'Fm7', 'Ebm7', 'Ab7(b9)', 'Db', 'Abb7#5(9) [= G7#5(9)]'],
    sourceKey: 'Db:major', coverage: null, moods: ['gentle', 'yearning'],
    character: null,
    notes: 'IV–V–vi–iii–ii–V–I: the full royal-road descent landing home, then the chromatic '
      + 'G7#5(9) (spelled Abb7 in the video, rainbow-highlighted) pivots back to IV a semitone below. '
      + '~2 chords/bar.',
  },
  vid_yasashisa_b: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze — Yasashisa (Db major)', section: 'B', sectionBars: 4,
    source: 'igexport-DYsBsQ-z8cm.mp4',
    numerals: 'IV^7-III7-vim9-I7-IV^7-VIIsus-III7',
    degrees: '5:^7 4:7 9:m9 0:7 5:^7 11:sus 4:7',
    voicedAs: ['GbMaj7', 'F7(b9)', 'Bbm7(9)', 'Db7#5(b9)', 'GbMaj7(9)', 'C9sus4', 'F7#5(b9)'],
    sourceKey: 'Db:major', coverage: null, moods: ['rich', 'turning'],
    character: null,
    notes: 'Every dominant is altered (b9, #5). I7#5 is V-of-IV in altered dress; C9sus4 sits on the '
      + 'leading tone as a sus — a chord my corpus has never used from that degree.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-Da7g_WLKDhY — "Most Popular Chord Progression" card, key C#.
  // Text card; play order = written order, ~1 chord/bar. Bass root in red,
  // upper voices cyan: root low + close chord mid.
  // -------------------------------------------------------------------------
  vid_gospel_dim_chain: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'gospel',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'ChordCamera — descending dim chain (C#)', section: 'A', sectionBars: 8,
    source: 'igexport-Da7g_WLKDhY.mp4',
    numerals: 'IV^7-#IVo7-iiim7-bIIIo7-iim7-V7-I^7-bIIo7',
    degrees: '5:^7 5:o7 4:m7 3:o7 2:m7 7:7 0:^7 1:o7',
    voicedAs: ['F#maj7', 'F#°7', 'E#m7', 'E°7', 'D#m7', 'G#7', 'C#maj7', 'D°7 (E#°7/D)'],
    sourceKey: 'C#:major', coverage: null, moods: ['classic', 'walking-down'],
    character: null,
    notes: 'THE descending-diminished cliche, complete: every second chord is a passing o7 a '
      + 'semitone under the chord it leaves, so the top voices barely move while the bass walks. '
      + 'Last chord D°7 loops chromatically up into... the iim7, or back to IV. Note two entries '
      + 'here share a DEGREE with different qualities (5:^7 then 5:o7) — the same-root dim flip.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-DbbI6uyTKD3 — こういうのでいいんだよ, key C. City-pop catalogue.
  // -------------------------------------------------------------------------
  vid_citypop_c_a: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'City-pop in C ("this kind of thing is fine")', section: 'A', sectionBars: 4,
    source: 'igexport-DbbI6uyTKD3.mp4',
    numerals: 'iim9-V7-I^7-bV7-IV^7-bVII7-vim9',
    degrees: '2:m9 7:7 0:^7 6:7 5:^7 10:7 9:m9',
    voicedAs: ['Dmin9', 'G7(9,13)', 'CMaj7', 'F#7(9,#11)', 'FMaj9', 'Bb7(9,13)', 'Amin9'],
    sourceKey: 'C:major', coverage: null, moods: ['bright', 'urbane'],
    character: null,
    notes: 'ii–V–I then the two classic detours back-to-back: bV7(#11) sliding chromatically into '
      + 'IVmaj9, and the bVII13 backdoor into vi. A tour of tasteful non-diatonic dominants.',
  },
  vid_citypop_c_b: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'City-pop in C ("this kind of thing is fine")', section: 'B', sectionBars: 4,
    source: 'igexport-DbbI6uyTKD3.mp4',
    numerals: 'vm7-I7-VI7-iim9-V7-I^7',
    degrees: '7:m7 0:7 9:7 2:m9 7:7 0:^7',
    voicedAs: ['Gmin7', 'C7/E', 'A7(b9,b13)', 'Dmin9', 'G7(9,13)', 'CMaj9'],
    sourceKey: 'C:major', coverage: null, moods: ['cycling', 'assured'],
    character: null,
    notes: 'v7–I7 borrows the ii–V of IV, but VI7alt hijacks it into a home-key ii–V–I. '
      + 'Chained secondary ii–Vs that keep resolving somewhere other than promised.',
  },
  vid_citypop_c_ending: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'City-pop in C ("this kind of thing is fine")', section: 'C (ending)', sectionBars: 4,
    source: 'igexport-DbbI6uyTKD3.mp4',
    numerals: 'III7-IV^7-bVII^7-VI^7',
    degrees: '4:7 5:^7 10:^7 9:^7',
    voicedAs: ['Eaug7', 'FMaj9', 'BbMaj9', 'AMaj9'],
    sourceKey: 'C:major', coverage: null, moods: ['hopeful', 'lifting'],
    character: null,
    notes: 'The ending: aug dominant into IV, then TWO borrowed maj9s — bVIImaj9 and finally '
      + 'VImaj9, a major chord where the relative minor lives. "Hopeful lift" ending; compare '
      + 'Ethan\'s t28 note about endings that climb. Held long; no return to I.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-Dbn9IrqTPAI — modulation etude ("chord progression that
  // feels good through modulation"), 53s, four key areas colour-coded in the
  // source (green -> yellow -> blue -> orange). Sections = colour regions;
  // 9sus4 chords are the pivots between them. Three representative sections
  // encoded in their LOCAL key; the full chain is in video-corpus.md.
  // -------------------------------------------------------------------------
  vid_mod_etude_flatside: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Modulation etude (green section, Gb)', section: 'A', sectionBars: 8,
    source: 'igexport-Dbn9IrqTPAI.mp4',
    numerals: 'IIsus-V7-I^7-ivm9-viim7b5-III7-vim7',
    degrees: '2:sus 7:7 0:^7 5:m9 11:m7b5 4:7 9:m7',
    voicedAs: ['Ab9sus4', 'Db7(9,13)', 'GbMaj9', 'Cbmin9', 'Fmin7b5', 'Bb7(#9,b13)', 'Ebmin7'],
    sourceKey: 'Gb:major', coverage: null, moods: ['plush', 'sinking'],
    character: null,
    notes: 'Opens II9sus->V13->Imaj9 (the sus-sus-resolve stack), then iv minor 9 borrowed, then '
      + 'iiø–V/vi–vi. The 9sus4 on II is this etude\'s signature pivot — every modulation in the '
      + 'video departs from a 9sus4.',
  },
  vid_mod_etude_planing: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Modulation etude (blue section, D)', section: 'C', sectionBars: 6,
    source: 'igexport-Dbn9IrqTPAI.mp4',
    numerals: 'I^7-viim7-bVII m7-vim7-II7-V^7',
    degrees: '0:^7 11:m7 10:m7 9:m7 2:7 7:^7',
    voicedAs: ['DMaj7 (and DminMaj7 in passing)', 'C#min7', 'Cmin7', 'Bmin7', 'E7(9,13)', 'AMaj7'],
    sourceKey: 'D:major', coverage: null, moods: ['drifting', 'chromatic'],
    character: null,
    notes: 'Chromatic planing: three m7 chords walking down by semitone (C#m7–Cm7–Bm7), landing on '
      + 'II7 as V-of-V. The source also flips DMaj7 -> DminMaj7 in place (parallel darkening) — '
      + 'grammar can\'t hold mM7, noted here. This planing cell appears TWICE in the etude.',
  },
  vid_mod_etude_close: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Modulation etude (orange section, C-ish close)', section: 'D (ending)', sectionBars: 6,
    source: 'igexport-Dbn9IrqTPAI.mp4',
    numerals: 'III7-IV^7-III7-VIsus-iim7-V7-Isus',
    degrees: '4:7 5:^7 4:7 9:sus 2:m7 7:7 0:sus',
    voicedAs: ['E7(9,13)', 'FMaj9', 'E7(#9,b13)', 'A9sus4', 'Dmin7', 'G7(b13)', 'C9sus4 (final)'],
    sourceKey: 'C:major', coverage: null, moods: ['unresolved', 'suspended'],
    character: null,
    notes: 'III7 toggling plain->altered against the same FMaj9, then a ii–V that lands on... '
      + 'C9sus4, and STAYS there. The etude ends suspended — the sus-as-destination ending. '
      + 'Directly relevant to D53\'s open cadence question.',
  },

  // -------------------------------------------------------------------------
  // Video: igexport-DcRXC2RTLZB — Fujii Kaze "Prema", Dm -> D parallel-key
  // modulation (the video prints "Key: Dm(F) → D (同主調)" at the seam).
  // -------------------------------------------------------------------------
  vid_prema_dm: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze — Prema', section: 'A (D minor)', sectionBars: 8,
    source: 'igexport-DcRXC2RTLZB.mp4',
    numerals: 'im7-vm7-VI^7-vm7-ivm7-VII7-III^7-Vsus',
    degrees: '0:m7 7:m7 8:^7 7:m7 5:m7 10:7 3:^7 7:sus',
    voicedAs: ['Dmin7', 'Amin7', 'BbMaj7', 'Amin7', 'Gmin7', 'C7(9)', 'FMaj7', 'A13sus4 -> A7(b9,b13)'],
    sourceKey: 'D:minor', coverage: null, moods: ['soulful', 'rolling'],
    character: null,
    notes: 'Aeolian descent i–v–VI with v as the passing chord both ways, iv–VII–III walking to the '
      + 'relative major, then the V arrives ONLY as 13sus4 first, cracking into 7(b9,b13) at the last '
      + 'moment — sus-then-alter is the turnaround. Both V chords gold-highlighted in the source.',
  },
  vid_prema_dmaj: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: true,
    song: 'Fujii Kaze — Prema', section: 'B (D major, after parallel modulation)', sectionBars: 8,
    source: 'igexport-DcRXC2RTLZB.mp4',
    numerals: 'IV^7-iiim7-iim7-bVI^7-vm9-bV7-IV^7',
    degrees: '5:^7 4:m7 2:m7 8:^7 7:m9 6:7 5:^7',
    voicedAs: ['GMaj7', 'F#min7', 'Emin7', 'BbMaj7', 'Amin9', 'Ab7(#11)', 'GMaj7'],
    sourceKey: 'D:major', coverage: null, moods: ['radiant', 'descending'],
    character: null,
    notes: 'After the parallel-key lift: IV–iii–ii diatonic walk that never states the tonic, then '
      + 'the chromatic bass descent Bb–A–Ab–G (bVImaj7 -> vm9 -> bV7#11 -> IVmaj7), the Ab7(#11) '
      + 'rainbow-flagged. Same never-touch-home trick as the quiz clip\'s A section, in major.',
  },
};
