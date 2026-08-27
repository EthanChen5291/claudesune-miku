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
// D64 — A THIRTEENTH SOURCE, AND A STRONGER EVIDENCE CLASS. Ethan added a
// screen recording of an Instagram reel (not an igexport-* file) and asked for
// it to be analyzed. That one was read TWICE and independently: the on-screen
// labels at 4 fps, and the audio — onset detection plus iterative harmonic
// subtraction over the FFT, which recovers the sounding pitches per strike.
// All 15 strikes agreed with their label, so the entry carries
// `provenance: 'video+audio-transcribed'` and `audioConfirmed: true` to keep it
// distinct from the eye-only reads above. `coverage` stays null regardless: the
// D45 labeller works on MIDI and still has not run on any of this. That entry
// also carries `observedVoicing` — the measured register/inversion of each
// chord, which no eye-read in this pack can supply.
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
  /**
   * The cell Ethan carved out of vid_mod_etude_close by ear (D60): "E7·2 F^7
   * E7 also works by itself as a separate thing." The first four bars of the
   * etude's close — the III7 toggling against IV^7 — as its own loop. He
   * proposed it from the page's rendering but has not heard it stated ALONE,
   * so it needs the ear like everything else (A6.1).
   */
  vid_mod_etude_close_cell: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-ballad',
    provenance: 'ear-derived', earProposed: true, ratified: false, needsEar: true,
    song: 'Modulation etude (orange section, C-ish close)',
    section: 'D (ending) — first 4 bars, as a standalone cell (Ethan, D60)',
    sectionBars: 4,
    source: 'igexport-Dbn9IrqTPAI.mp4',
    numerals: 'III7-IV^7-III7',
    degrees: '4:7 5:^7 4:7',
    voicedAs: ['E7(9,13)', 'FMaj9', 'E7(#9,b13)'],
    sourceKey: 'C:major', coverage: null,
    moods: ['unresolved', 'suspended'],
    character: null,
    notes: 'Derived from vid_mod_etude_close, not read from the video as its own section.',
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

  // -------------------------------------------------------------------------
  // ScreenRecording_08-26-2026 00-35-16_1.MP4 — Instagram reel by @eunyu_pia,
  // captioned "Chord progression". 14.85s, one right hand playing block chords
  // on a digital piano, handwritten yellow labels burned into the frame.
  // 15 strikes on an even ~0.92s grid (=> ~131 BPM in 4/4, two chords/bar at
  // the ii-V pairs, one elsewhere); the recording clips bar 1's downbeat.
  // Voicings are RH-only, no bass part, every note inside E3-E4 — see
  // `observedVoicing`. Top voice sits on E4 for nine strikes then D4 for the
  // rest; the bottom of the voicing does all the walking
  // (G3-G#3-G3-F3-G3-F3-E3-G3-F3-F3).
  // -------------------------------------------------------------------------
  vid_eunyu_circle: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video+audio-transcribed', audioConfirmed: true,
    ratified: false, needsEar: true, sourceEndorsed: false,
    song: '@eunyu_pia chord progression reel (C major)', section: 'A', sectionBars: 8,
    source: 'ScreenRecording_08-26-2026 00-35-16_1.MP4',
    numerals: 'I-III7-vim7-vm7-I7-IV^7-iiim7-VI7-iim7-V7',
    degrees: '0 4:7 9:m7 7:m7 0:7 5:^7 4:m7 9:7 2:m7 7:7',
    voicedAs: ['C', 'E7', 'Am7', 'Gm7', 'C7', 'FM7', 'Em7', 'A7', 'Dm7', 'G7'],
    observedVoicing: [
      ['G3', 'C4', 'E4'],          // C, second inversion, plain triad
      ['G#3', 'B3', 'D4', 'E4'],   // E7
      ['G3', 'A3', 'C4', 'E4'],    // Am7
      ['F3', 'G3', 'Bb3', 'D4'],   // Gm7
      ['G3', 'Bb3', 'C4', 'E4'],   // C7
      ['F3', 'A3', 'C4', 'E4'],    // FM7, root position
      ['E3', 'G3', 'B3', 'D4'],    // Em7, root position
      ['G3', 'A3', 'C#4', 'E4'],   // A7
      ['F3', 'A3', 'C4', 'D4'],    // Dm7
      ['F3', 'G3', 'B3', 'D4'],    // G7
    ],
    sourceKey: 'C:major', coverage: null, moods: ['warm', 'cycling'],
    character: null,
    notes: 'A descending circle-of-fifths chain with a secondary dominant at EVERY turn: '
      + 'E7->Am7, C7->FM7, A7->Dm7, and the closing V7. Four dominants in eight bars, all of them '
      + 'plain and unaltered — the exact inverse of the rest of this pack, where the rule read off '
      + 'the videos was one ALTERED dominant per phrase and never two in a row (video-corpus.md). '
      + 'Kept as the contrast case: the chain, not the spice, is what carries it, and what makes it '
      + 'sound smooth rather than restless is the static top voice over a walking bottom voice. '
      + 'The two connector chords (Gm7-C7 = ii-V into IV, Em7-A7 = iii-VI7 into ii) take half a bar '
      + 'each while everything else takes a full one. Label and audio agreed on all 15 strikes.',
  },

  // ==========================================================================
  // BATCH 2 (D68, session 2026-08-26): seventeen new igexport reels + five
  // screen recordings, transcribed by a 22-agent frame-read pass (full
  // per-video analyses in video-corpus.md). Ethan's brief for this batch:
  // "analyze the extra stuff they do in the harmony between chords to give
  // that song personality, as well as ... the harmony pattern itself (e.g the
  // chord up the octaves pattern)". The between-chord devices went to
  // figurations-videos.js; the progressions are below. sourceEndorsed: false
  // on every one — the D57 blanket ("i am a fan of how all the songs sound")
  // was said about the original twelve and does not reach a later source
  // (the D64 rule). needsEar throughout.
  // ==========================================================================

  // -------------------------------------------------------------------------
  // igexport-DcY-6NdSCFY — "Tyler, the Creator Type Chords" (his named ask).
  // ~81bpm, F major, one 2-bar loop. LH low root + RH rootless upper structure
  // a 10th+ up. Almost every change lands on an offbeat "and" — the lilt is
  // written into the harmonic rhythm. The famous "two extra notes" (E5+G#5
  // dyad converting Csus13 into C9b13) is vid_tag_sus_melt in figurations.
  // -------------------------------------------------------------------------
  vid_tyler_loop: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Tyler, the Creator type chords (F major)', section: 'A', sectionBars: 2,
    source: 'igexport-DcY-6NdSCFY.mp4',
    numerals: 'iim9-Vsus13-V9b13-I^9-viim9-III7alt',
    degrees: '2:m9 7:sus 7:7 0:^9 11:m9 4:7',
    voicedAs: ['Gm9', 'Csus13', 'C9b13', 'Fmaj9', 'Em9', 'A7b9b13'],
    sourceKey: 'F:major', coverage: null, moods: ['dreamy', 'warm', 'sly'],
    character: null,
    notes: 'ii-V-I in F with a iii-VI7alt turnaround. Csus13 recycles Gm9’s EXACT upper '
      + 'structure (Bb-D-F-A) over the new C bass — suspension by recycling, then the sus melts '
      + 'to C9b13 via the two-note dyad tag. Top voice sings A-A-G#-G across the first four chords. '
      + 'On the long chords the top two notes are RELEASED one at a time (9th first, then the 7th) '
      + '— the loop breathes by decay, not by fills. Voicings read off the lit-key overlay.',
  },

  // -------------------------------------------------------------------------
  // igexport-DceNMCmuYZV — the G#m9 octave-climb reel (his named ask).
  // ~80bpm, outdoor stage piano. The whole rootless cluster is RESTRUCK as a
  // block one octave higher per beat (3 positions; 2 for the bII), bass only
  // under position 1, fully detached between strikes. The two-note walk-down
  // tag after the top octave is vid_tag_climb_walkdown in figurations.
  // -------------------------------------------------------------------------
  vid_gsharp_climb: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'cinematic-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'G#m9 octave-climb reel (G# minor)', section: 'A', sectionBars: 4,
    source: 'igexport-DceNMCmuYZV.mp4',
    numerals: 'im9-ivm9-V7#5#9-bII9#11',
    degrees: '0:m9 5:m9 7:7 1:9',
    voicedAs: ['G#m9', 'C#m9', 'D#7#5#9', 'A9#11(no3)'],
    sourceKey: 'G#:minor', coverage: null, moods: ['lush', 'melancholic', 'dramatic'],
    character: null,
    notes: 'Displayed with roman numerals on screen: i-iv-V-bII. Minor-9 clusters put the 9 a '
      + 'HALF-STEP under the b3 (A#-B-D#-F#-A#); the altered V transplants the same rub onto '
      + '#9-3 (F#-G-B-C#-F#); the bII is a pure major-3rd stack (G-B-D#-G-B), Lydian-dominant '
      + 'shimmer. Each chord climbs the 88 in block restrikes — terraced echoes, not a swell. '
      + 'Voicings pixel-decoded from the lit-key strip at 20fps; all matched the labels.',
  },

  // -------------------------------------------------------------------------
  // igexport-DbEktz0I_j8 — "Use these chords" (Donner piano, bedroom studio).
  // ~107bpm. Chromatic m9/maj9 planing; every RH voicing is the same shape,
  // a 4-note stack of 3rds built FROM the chord's 3rd. Its b3->9 two-note tag
  // is folded into vid_tag_two_note_pickup in figurations.
  // -------------------------------------------------------------------------
  vid_use_these_planing: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Use-these-chords planing loop (C minor)', section: 'A', sectionBars: 4,
    source: 'igexport-DbEktz0I_j8.mp4',
    numerals: 'iim9-bII^9-im9-V7sus2',
    degrees: '2:m9 1:^9 0:m9 7:7sus',
    voicedAs: ['Dm9', 'Dbmaj9', 'Cm9', 'G7 sus2'],
    sourceKey: 'C:minor', coverage: null, moods: ['dreamy', 'warm'],
    character: null,
    notes: 'Two 9th chords sliding down by semitone into the tonic minor, then a sus V. '
      + 'Dm9→Dbmaj9 keeps F and C as common tones while A→Ab and E→Eb sink — the '
      + 'planing is voice-leading, not parallel blocks. RH shape: play the 7th chord a 3rd up over '
      + 'the bass root (Fmaj7/D, Fm7/Db, Ebmaj7/C). G7sus2 label kept in voicedAs; grammar has 7sus.',
  },

  // -------------------------------------------------------------------------
  // igexport-DYP1T7zRAYJ — the "+1 octave" stack reel (G-centered, ~69bpm,
  // 12/8 feel). Each chord = a close R-3-5-7 stack ROLLED bottom-to-top, then
  // restated at +1 and +2 octaves, one statement per beat. F#dim7 breaks the
  // pattern: stated ONCE low, its climb replaced by an octave-doubled
  // 9->1->maj7 walk-down into the returning Gmaj7 (vid_tag_climb_walkdown).
  // -------------------------------------------------------------------------
  vid_octave_stack: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Octave-stack reel (G)', section: 'A', sectionBars: 4,
    numerals: 'I^7-im6-viim7-viio7',
    degrees: '0:^7 0:m6 11:m7 11:o7',
    voicedAs: ['Gmaj7', 'Gm6', 'F#m7', 'F#dim7'],
    source: 'igexport-DYP1T7zRAYJ.mp4',
    sourceKey: 'G:major', coverage: null, moods: ['tender', 'nostalgic', 'dreamy'],
    character: null,
    notes: 'Four-voice chromatic glide: G-B-D-F# → G-Bb-D-E → F#-A-C#-E → F#-A-C-D#. '
      + 'Major to parallel-minor-6 to the m7 a half-step down to its own dim7 — every move is '
      + 'one or two voices sliding a semitone. The octave climb (x3 per chord) is the texture; '
      + 'the harmony is the four labels. On-screen captions literally say "+1 octave".',
  },

  // -------------------------------------------------------------------------
  // igexport-DbuFbACtERO — "K-Pop/R&B Chords" (~98bpm, D minor).
  // -------------------------------------------------------------------------
  vid_kpop_rnb: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'kpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'K-Pop/R&B chords (D minor)', section: 'A', sectionBars: 5,
    source: 'igexport-DbuFbACtERO.mp4',
    numerals: 'bVI^7-V7#5-im7-bviim7-bIII7',
    degrees: '8:^7 7:7 0:m7 10:m7 3:7',
    voicedAs: ['Bbmaj7', 'A7#5', 'Dm7', 'Cm7', 'F7'],
    sourceKey: 'D:minor', coverage: null, moods: ['dreamy', 'tender'],
    character: null,
    notes: 'bVI-V7#5-i plus a ii-V (Cm7-F7) pointing back at Bb — the loop’s exit ramp is '
      + 'built in. Block pads, one strike per chord, pedal down; the one ornament is the A7#5 top '
      + 'voice re-striking root→b7 mid-bar (label changed "C# F A"→"C# F G" on screen). '
      + 'LH root + RH close rootless shell; on A7#5 the LH takes root AND b7 itself.',
  },

  // -------------------------------------------------------------------------
  // igexport-DceFyBnsRB1 — "Try this these chords:" (Eb major, spelled in
  // sharps on screen; rubato, ~1 chord/sec). Medium confidence: no MIDI
  // overlay, voicings read from hand positions + audio onsets.
  // -------------------------------------------------------------------------
  vid_try_these_eb: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'gospel-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Try-these-chords loop (Eb major)', section: 'A', sectionBars: 5,
    source: 'igexport-DceFyBnsRB1.mp4',
    numerals: 'iim9-V^7-Vaug-I-IV^9',
    degrees: '2:m9 7:^7 7:aug 0 5:^9',
    voicedAs: ['Fmin9', 'A#maj7', 'A#aug', 'D#maj', 'G#maj9'],
    sourceKey: 'Eb:major', coverage: null, moods: ['warm', 'sacred'],
    character: null,
    notes: 'ii9 → V^7 → Vaug → I → IV^9: the augmented V is the passing event '
      + '(F#→G motion inside the Bb chord) before the tonic lands. Pass 2 ends on D#maj7 '
      + 'instead of G#maj9. Bass-first attacks: the low root sounds alone ~0.3s before each RH '
      + 'stack. Eye-read from hands, no MIDI overlay — medium confidence.',
  },

  // -------------------------------------------------------------------------
  // igexport-DZ5k5-xKqzH — "@ChordCamera by Haltber: C minor Fast Cycle with
  // 3-Note Chords" (~112bpm). Three linked sections. EVERY chord is exactly
  // 3 notes: lone bass root octaves 1-2 + two guide tones around middle C
  // (7ths: 3rd-as-10th + 7th; triads: root + 5th + 10th).
  // -------------------------------------------------------------------------
  vid_cmfast_cycle: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'cinematic',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'C minor fast cycle, 3-note chords', section: 'A', sectionBars: 3,
    source: 'igexport-DZ5k5-xKqzH.mp4',
    numerals: 'ivm7-bVII7-bIII^7-bVI^7-iio-V7',
    degrees: '5:m7 10:7 3:^7 8:^7 2:o 7:7',
    voicedAs: ['Fm7', 'Bb7', 'EbΔ7', 'AbΔ7', 'D°', 'G7'],
    sourceKey: 'C:minor', coverage: null, moods: ['driving', 'noble'],
    character: null,
    notes: 'A fast minor circle: iv-bVII-bIII-bVI-iio-V, two chords per bar — the harmonic '
      + 'rhythm IS the energy. Three-note spread voicings keep it clean at speed: the D51 lesson '
      + '(sparse voicings survive fast cycles) stated as a whole video.',
  },
  vid_cmfast_tag: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'cinematic',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'C minor fast cycle, 3-note chords', section: 'B', sectionBars: 1,
    source: 'igexport-DZ5k5-xKqzH.mp4',
    numerals: 'im-bVII6-bIII-im7',
    degrees: '0:m 10 3 0:m7',
    voicedAs: ['Cm', 'Bb/D', 'Eb', 'Cm7'],
    sourceKey: 'C:minor', coverage: null, moods: ['driving'],
    character: null,
    notes: 'The landing bar: quarter-note passing-chord walk, bass C→D→Eb→C '
      + '(Bb/D is a first-inversion passing chord). A written-out walk instead of a held tonic.',
  },
  vid_cmfast_ending: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'cinematic',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'C minor fast cycle, 3-note chords', section: 'C', sectionBars: 2,
    source: 'igexport-DZ5k5-xKqzH.mp4',
    numerals: 'iio-Vaug-V-im',
    degrees: '2:o 7:aug 7 0:m',
    voicedAs: ['D°', 'G#5', 'G', 'Cm'],
    sourceKey: 'C:minor', coverage: null, moods: ['grave', 'noble'],
    character: null,
    notes: 'The notated "G#5 > G": over a held G bass + B, the #5 (D#) is struck on beat 3 and '
      + 'falls one half-step to the natural 5th (D) on beat 4, then Cm. A one-note chromatic '
      + 'inner-voice slide as the entire cadence ornament — the cheapest possible "extra".',
  },

  // -------------------------------------------------------------------------
  // igexport-Daa21N3RUlX — "Take these damn chords / Write a damn song"
  // (acoustic upright, ~120bpm, metronomic quarter-note blocks, F minor).
  // One close RH shape morphing by half-steps; NO fills at all — the
  // personality is entirely voicing motion (b9 slide, aug rub).
  // -------------------------------------------------------------------------
  vid_damn_fm_loop: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Damn chords, F minor upright', section: 'A', sectionBars: 6,
    source: 'igexport-Daa21N3RUlX.mp4',
    numerals: 'im(add9)-Vaug/3-bIII7/b7-bviim7-bIII7-bVI^7-Vaug7',
    degrees: '0:m 7:aug 3:7 10:m7 3:7 8:^7 7:7',
    voicedAs: ['Fmi9', 'C#5/E', 'Ab7/Eb', 'Ebm7', 'Ab7', 'Dbmaj7', 'C7#5'],
    sourceKey: 'F:minor', coverage: null, moods: ['plaintive', 'warm'],
    character: null,
    notes: 'The bottom voice of one fixed RH shape walks down chromatically (F→E→Eb…) while '
      + 'the top anchors on C for nearly the whole loop. On the Ab7 the top two voices each '
      + 'drop a half-step (Db→C = 3rd, Bb→A = b9) over held Eb+Gb — a rootless 7b9/dim '
      + 'shimmer for two beats before Dbmaj7. On-screen chord card names the whole loop.',
  },

  // -------------------------------------------------------------------------
  // igexport-DcB52lyPaNg — "Take these damn chords" (Ab walkdown). The
  // detector-label reel: color tones stacked one finger at a time on TOP of
  // held chords, whole-shape chromatic slides INTO the next chord.
  // -------------------------------------------------------------------------
  vid_damn_walkdown: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Damn chords, Ab walkdown', section: 'A', sectionBars: 6,
    source: 'igexport-DcB52lyPaNg.mp4',
    numerals: 'I^7-bVII^13-vim7-vm7-bV7#5-IV^13',
    degrees: '0:^7 10:^7 9:m7 7:m7 6:7 5:^7',
    voicedAs: ['AbMaj7', 'F#Maj13(no9)', 'Fmin7', 'Ebmin7(13)', 'D7#5', 'DbMaj13(no9)'],
    sourceKey: 'Ab:major', coverage: null, moods: ['dreamy', 'sly'],
    character: null,
    notes: 'Descending-bass walkdown Ab→Gb→F→Eb→D→Db: I → bVII^13 → vi → MINOR v '
      + '(no dominant anywhere) → passing D7#5 → IV^13, then an ending twist the grammar '
      + 'cannot hold: E-natural slipped under a Dbm color (detector: Bbmin7b5(11)/E) — a '
      + 'minor-plagal noir ending left hanging. Maj13 chords enter as plain ^7 and get their '
      + '13th STACKED ON one finger at a time while the chord rings (the detector relabels live).',
  },

  // -------------------------------------------------------------------------
  // igexport-DbOexm8RS5a — "Take these damn chords" (Db gospel turnaround,
  // rubato, roll-in shells: every chord introduced as bass root + ONE high
  // color note held alone before the inner voices roll in).
  // -------------------------------------------------------------------------
  vid_damn_gospel: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'gospel-ballad',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Damn chords, Db gospel turnaround', section: 'A', sectionBars: 8,
    source: 'igexport-DbOexm8RS5a.mp4',
    numerals: 'IV^7-V13b9-vim9-ivm^7-iiim7-iiio7-iim9-V7b9-I^7',
    degrees: '5:^7 7:7 8:m9 5:m 3:m7 3:o7 1:m9 7:7 0:^7',
    voicedAs: ['F#Maj13(no9)', 'Ab13(b9)', 'Bbmin9', 'F#minMaj7(13)', 'Fmin7', 'Fdim7', 'Ebmin9', 'Ab7(b9)', 'DbMaj7'],
    sourceKey: 'Db:major', coverage: null, moods: ['sacred', 'warm', 'sweeping'],
    character: null,
    notes: 'Full gospel turnaround: IV-V-vi, borrowed minor-iv(maj7), iii into a passing dim7, '
      + 'then ii-V7b9-I. The roll-in shell is the signature: "F# Major 7th" first sounds as just '
      + 'F#3+F5 (root + maj7 two octaves apart), naked, before the middle fills in — the chord '
      + 'arrives as a QUESTION and resolves into itself.',
  },

  // -------------------------------------------------------------------------
  // igexport-DaHBG7LtDab — "Use these damn chords" (Db constant-structure
  // planing). ONE fixed upper-structure (Bbm triad: Bb-Db-F, the 6th/root/3rd
  // of Db) held while the bottom note of the same hand walks: the harmony is
  // the bass line. Every ~2s a single Eb6 lands above the held Db6, making a
  // major-2nd cluster and re-naming the chord (the "+13" move).
  // -------------------------------------------------------------------------
  vid_damn_planing: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Damn chords, Db constant-structure', section: 'A', sectionBars: 5,
    source: 'igexport-DaHBG7LtDab.mp4',
    numerals: 'IV^7-III7#5-I6-ivm7b5... (bass-walk reading)',
    degrees: '5:^7 3:7 0:6 6:m7b5 0',
    voicedAs: ['F#Maj7', 'F7#5', 'DbMaj6/Ab', 'Gm7b5', 'Db/Ab'],
    sourceKey: 'Db:major', coverage: null, moods: ['dreamy', 'floating'],
    character: null,
    notes: 'Constant-structure planing: the upper Bbm triad NEVER moves; the bass walks '
      + 'Gb→F→Ab→G→(Gb→A)→Db and each stop renames the same three notes. Ends on Db '
      + 'inversions (Db/Ab, Db/F). The one ornament: Eb pressed above the held Db — a '
      + 'major-2nd cluster that converts whatever chord is ringing into its (no9)13 form.',
  },

  // -------------------------------------------------------------------------
  // igexport-DZ93AHcBuac — hand-cam bubble-label loop, D major, 120bpm,
  // one right hand, NO bass register at all (measured: zero low-band energy).
  // -------------------------------------------------------------------------
  vid_dmaj_circle: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'jpop-rnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'D-major bubble-label circle', section: 'A', sectionBars: 8,
    source: 'igexport-DZ93AHcBuac.mp4',
    numerals: 'I-viim7b5-III7-vim7-vm7-I7-IV-I-II7-V7',
    degrees: '0 11:m7b5 4:7 9:m7 7:m7 0:7 5 0 2:7 7:7',
    voicedAs: ['D', 'C#m7(b5)', 'F#7', 'Bm7', 'Am7', 'D7', 'G', 'D', 'E7', 'A7'],
    sourceKey: 'D:major', coverage: null, moods: ['warm', 'circling'],
    character: null,
    notes: 'The city-pop workhorse: I → viiø-III7 (into vi) → v-I7 (into IV) → II7-V7 turn. '
      + 'Same family as vid_eunyu_circle — frequent PLAIN dominants, none altered — second '
      + 'witness for that fork. Its metronomic end-of-bar pickup cell (re-strike on and-of-3, '
      + 'two 8ths walking UP into the next downbeat) is vid_tag_two_note_pickup.',
  },

  // -------------------------------------------------------------------------
  // igexport-DYcEDDITmvV — "City Pop Type Piano Chords" (Ab, ~103bpm,
  // workstation). Two statements of one cadence with a mode flip.
  // -------------------------------------------------------------------------
  vid_citypop_ab_minor: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'City pop cadence pair (Ab)', section: 'A', sectionBars: 4,
    source: 'igexport-DYcEDDITmvV.mp4',
    numerals: 'ivm9-V7alt-im9',
    degrees: '5:m9 7:7 0:m9',
    voicedAs: ['Dbm9', 'Ebalt7', 'Abm9'],
    sourceKey: 'Ab:minor', coverage: null, moods: ['jazzy', 'nocturnal'],
    character: null,
    notes: 'Phrase 1: iv9-V7alt-i9, the minor resolution. Every chord is framed by a stepwise '
      + 'CLIMB INTO it (four 8ths: 5-6-b7-1 of the coming chord) and a high 9th-in-octaves bell '
      + 'tag rung ~0.15s AFTER it lands — enter early, decorate late (vid_climb_into_nine).',
  },
  vid_citypop_ab_major: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'city-pop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'City pop cadence pair (Ab)', section: 'B', sectionBars: 4,
    source: 'igexport-DYcEDDITmvV.mp4',
    numerals: 'ivm9-V7-I^7',
    degrees: '5:m9 7:7 0:^7',
    voicedAs: ['Dbm9', 'Eb7', 'AbM7'],
    sourceKey: 'Ab:major', coverage: null, moods: ['jazzy', 'hopeful'],
    character: null,
    notes: 'Phrase 2 answers phrase 1 with the picardy flip: same iv9-V7 but the dominant '
      + 'un-alters and lands on the MAJOR tonic. A two-phrase question/answer built from one '
      + 'cadence and one mode flip — the cheapest possible A/B contrast.',
  },

  // -------------------------------------------------------------------------
  // ScreenRecording 13-20-27 — @vanrivermusic "Make it sla..." (chord-app
  // overlay, Eb). The app logs every sub-shape struck between full chords,
  // so the fills are directly readable (root+b7 / root+b3 dyad taps).
  // -------------------------------------------------------------------------
  vid_slap_eb: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'vanriver Eb loop', section: 'A', sectionBars: 4,
    source: 'ScreenRecording_08-26-2026 13-20-27_1.MP4',
    numerals: 'I6/9-iim7(11)-vim7-bVII^9(13)',
    degrees: '0:6 2:m7 9:m7 10:^9',
    voicedAs: ['Eb 6/9', 'Fmin7(11)', 'Cmin7', 'DbMaj9(13)'],
    sourceKey: 'Eb:major', coverage: null, moods: ['warm', 'relaxed'],
    character: null,
    notes: 'I-ii-vi-bVII (backdoor color) voiced as close 2nds+4ths cluster stacks over plain '
      + 'LH roots. The Fm7(11) bar sometimes climbs the whole voicing two octaves — the same '
      + 'climb family as vid_gsharp_climb, one chord only. Between chords: bare dyad taps '
      + '(root+b7, root+b3, root+9) logged by the app — shells as connective tissue.',
  },

  // -------------------------------------------------------------------------
  // ScreenRecording 13-25-13 — @bronikbeats "Impossible" (his named ask: the
  // black-shirt facecam synth build). C minor, 102bpm, five Serum 2 layers.
  // The full layering breakdown is in video-corpus.md; the harmony is below.
  // -------------------------------------------------------------------------
  vid_bronik_descent: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'melodic-trap',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'bronikbeats Impossible (C minor)', section: 'A', sectionBars: 4,
    source: 'ScreenRecording_08-26-2026 13-25-13_1.MP4',
    numerals: 'im(add9)-bIII^7/5-bVI^7#11-v(b13)',
    degrees: '0:m 3:^7 8:^7 7',
    voicedAs: ['Cm(add9)', 'Cm/Bb', 'Abmaj7(#11)', 'G(b13)'],
    sourceKey: 'C:minor', coverage: null, moods: ['dark', 'epic', 'driving'],
    character: null,
    notes: 'The reharmonized-pedal trick: the upper three-note cell D-Eb-G NEVER moves; only '
      + 'the bottom note descends C→Bb→Ab→G (i→bVII→bVI→v), re-naming the same cell as '
      + 'add9, maj7-color, lydian #11, then a b13 rub. Read off the FL piano roll (note-name '
      + 'labels visible). Ethan on the opening figure: "that sounds good".',
  },

  // -------------------------------------------------------------------------
  // igexport-Db-2YGCvU68 — pixel-font modulation reel (Ab minor → A minor).
  // Three sections, one song: two parallel minor loops a semitone apart
  // sharing one m7(11) grip, welded by a chromatic dominant elevator.
  // -------------------------------------------------------------------------
  vid_pixel_abm: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Pixel-font modulation reel', section: 'A', sectionBars: 4,
    source: 'igexport-Db-2YGCvU68.mp4',
    numerals: 'im7(11)-iim7-III^7',
    degrees: '0:m7 2:m7 3:^7',
    voicedAs: ['Abm7(11)', 'Bbm7', 'BM7'],
    sourceKey: 'Ab:minor', coverage: null, moods: ['dreamy', 'nocturnal'],
    character: null,
    notes: 'i7(11)-ii7-III^7 loop; after the III the upper voicing HOLDS while the bass walks '
      + 'down chromatically B→Bb→A→Ab (root→maj7→b7→new root, the labels "/Bb" "/A") as '
      + 'quick 16ths in the last half-beat — the walkdown IS the turnaround. The m7(11) grip '
      + '(root under a quartal b7-b3-11-5 stack) is the identity sound of the whole reel.',
  },
  vid_pixel_elevator: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Pixel-font modulation reel', section: 'B', sectionBars: 2,
    source: 'igexport-Db-2YGCvU68.mp4',
    numerals: 'III7b13-#IV7b13-V7alt-VI7 (chromatic climb)',
    degrees: '4:7 6:7 7:7 8:7',
    voicedAs: ['C7b13', 'D7b13', 'Eb7alt', 'E7'],
    sourceKey: 'Ab:minor', coverage: null, moods: ['tense', 'rising'],
    character: null,
    notes: 'The modulation machine: four dominants climbing by whole then half steps, each '
      + 'b13-flavored, landing a half-step up in A minor. Frequent AND altered — the one thing '
      + 'the D57 corpus said was not in evidence anywhere. It is now: the exception exists, and '
      + 'its job is MODULATION, not phrase color.',
  },
  vid_pixel_am: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'neo-soul',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Pixel-font modulation reel', section: 'C', sectionBars: 6,
    source: 'igexport-Db-2YGCvU68.mp4',
    numerals: 'im7(11)-iim7-III^7-VI7-vm7(11)-bII7',
    degrees: '0:m7 2:m7 3:^7 8:7 7:m7 1:7',
    voicedAs: ['Am7(11)', 'Bm7', 'CM7', 'F7', 'Em7(11)', 'Bb7'],
    sourceKey: 'A:minor', coverage: null, moods: ['dreamy', 'resolved'],
    character: null,
    notes: 'The A-section grip transposed up a semitone and EXTENDED: same i-ii-III core plus '
      + 'F7 (VI7, tritone-adjacent color) and a bII7 (Bb7) before the loop. Proof the modulation '
      + 'landed: the listener hears the same identity in a new key — planing at song scale. '
      + 'Ends ringing on F/Eb, unresolved.',
  },

  // -------------------------------------------------------------------------
  // igexport-DZKQMVQsj79 — "aquatic ambience" by scizzie (PianoKiwis app):
  // solo-piano cover of Aquatic Ambience (Donkey Kong Country, David Wise).
  // F# minor, ~141bpm, one chord per 2-bar phrase (figure bar + hold bar).
  // The 23rd source, added mid-session with the interval-walk brief; the walk
  // itself is vid_ladder_quintal in figurations. Sheet + note labels + audio
  // all agreed — strongest eye-read in the batch.
  // -------------------------------------------------------------------------
  vid_aquatic_ladder: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'vgm-ambient',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'Aquatic Ambience cover (F# minor)', section: 'A', sectionBars: 10,
    source: 'igexport-DZKQMVQsj79.mp4',
    numerals: 'im9-bVI^9#11-ivm7add11-ivm13-vm7b13',
    degrees: '0:m9 8:^9 5:m7 5:m7 7:m7',
    voicedAs: ['F#m9', 'Dmaj9(#11)', 'Bm7(add11)', 'Bm13', 'C#m7(b13)'],
    sourceKey: 'F#:minor', coverage: null, moods: ['dreamy', 'spacious', 'aquatic'],
    character: null,
    notes: 'i-bVI-iv-iv-v with NO cadential V anywhere — the loop closes on the minor v and '
      + 'falls back to i. The iv is stated twice with a recolor (add11, then dorian 13 with the '
      + 'natural 6 over minor). Root register walks DOWN across the cycle (F#3-D3-B2-B2-C#3) '
      + 'while the melodic peak walks UP (E6...A6 climax) — contrary motion at phrase scale. '
      + 'A cascade tag ends the cycle: b6-5-b3 of the v falling from the top of the piano. '
      + 'The engine relevance is direct: this IS our water vibe, done as one voice + pedal.',
  },

  // ---- batch 3 (D85, 2026-08-27) — the two card-bearing progressions ------
  vid_layerstack_cm: {
    family: 'minor', pack: 'igvideo', role: 'harmony', style: 'melodic-loop',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'FL accent-line build (C minor, Massive X + Serum 2)', section: 'A', sectionBars: 4,
    source: 'igexport-DalZ717INc7.mp4',
    numerals: 'im-bIII-bVI-v',
    degrees: '0:m 3 8 7',
    voicedAs: ['Cm', 'Eb', 'Ab', 'G'],
    sourceKey: 'C:minor', coverage: null, moods: ['dark', 'building', 'melodic'],
    character: null,
    notes: 'Roots 1-b3-b6-5 as whole-note sustains; every layer above shares the '
      + '1-2-b3-4-5 pentachord so chord QUALITIES are implied, never stated (no 3rd '
      + 'sounds anywhere). The harmony is carried by the ostinato\'s bar-downbeat '
      + 'accent note alone. Bass bar 4: G4 half, then G3 quarter (octave drop) plus '
      + 'a beat of rest — the turnaround. Read off FL note labels, high confidence.',
  },
  vid_venexxi_ebsaw: {
    family: 'major', pack: 'igvideo', role: 'harmony', style: 'pluggnb',
    provenance: 'video-transcribed', ratified: false, needsEar: true, sourceEndorsed: false,
    song: 'pluggnb 5-layer breakdown (Eb major, "layered sawkeys")', section: 'A', sectionBars: 4,
    source: 'igexport-DcZL7XFSQj_.mp4',
    numerals: 'IV^7-iii7-I^7-iii7',
    degrees: '5:^7 4:m7 0:^7 4:m7',
    voicedAs: ['Abmaj7', 'Gm7', 'Ebmaj7', 'Gm7(add C6)'],
    sourceKey: 'Eb:major', coverage: null, moods: ['warm', 'bouncy', 'playful'],
    character: null,
    notes: 'Never states V: orbits I via IVmaj7 and iii7 (his never-state-the-tonic '
      + 'cousin — states the tonic but never the dominant). Voicings G4-C6 with a '
      + 'moving TOP voice (C6 held over the second Gm7, then Bb5-G5 tag); closing '
      + 'stabs get a velocity fade ramp. Read off FL note labels, high confidence.',
  },
};
