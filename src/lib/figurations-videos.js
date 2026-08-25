// Flourishes and connective figures observed in the video corpus (D57).
//
// HAND-WRITTEN from frame reads of igexport-*.mp4 (see progressions-videos.js
// for the transcription provenance). Ethan's brief: "each song will also have
// their own special thing like a quick arpeggio in the middle of the chord
// progression ... this shouldnt be included in the chord progression but should
// be noted somewhere in our arpeggios for possible arpeggios and how they used
// it, the intervals, how quick, where they placed it, and how it worked."
//
// So these are NOT accompaniment patterns that run all song (that is what the
// ut_* figurations are). A flourish is a PLACED EVENT: it happens at one spot,
// for one reason, and the entry records the placement and the reason alongside
// the notes. Same schema as FIGURATIONS_UNDERTALE so bindFigure() can play
// them, plus `placement`/`function` fields the renderer can ignore.

export const FIGURATIONS_VIDEOS = {

  /**
   * The ascending diminished run from the E-major ballad (igexport-DXNX1y0k7-W).
   *
   * WHERE: on the Ddim7 pivot chord (see vid_eballad_dim_pivot), which the
   * harmony HOLDS for ~2 bars — the run exists because the chords stall.
   * Repeated on each cycle of the dim bar, ~3 times, identically.
   * HOW FAST: ~8 even notes across half a bar (16ths at ballad tempo), then the
   * top is held. Spans just over 1.5 octaves bottom to top.
   * INTERVALS: pure o7 stack — minor thirds all the way (R 3 5 7 R+ ...), which
   * is why it works: every note of the run is a chord tone, so speed adds
   * drama without adding dissonance.
   * FUNCTION: dramatizes the pivot. The section's harmonic engine stops on a
   * single unstable chord and the run converts that stall into a gesture.
   */
  vid_run_dim_ascent: {
    role: 'flourish', pack: 'igvideo', style: 'jazz-ballad', class: 'run',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 16, meter_class: '4/4',
    onsets: ['0/1', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2'],
    figure: ['R', '3', '5', '7', 'R+', '3+', '5+', '7+', 'R++'],
    accents: [0.8, 0.7, 0.7, 0.75, 0.8, 0.8, 0.85, 0.9, 1],
    legato: false, octave: 3,
    seen: 3, songs: ['E-major ballad study (igexport-DXNX1y0k7-W)'],
    placement: 'on a held o7 chord at a section pivot — never mid-flow',
    function: 'converts a harmonic stall into drama; all chord tones, so fast but consonant',
    needsEar: true, character: null,
  },

  /**
   * The stepwise walk-up connector from the "steal these chords" loop
   * (igexport-Da-2jFHBTYT, FL Studio, 125bpm).
   *
   * WHERE: the counter-melody line (green layer) plays it in the BACK HALF of a
   * bar, landing on the next chord's downbeat. It is a pickup, not a run: the
   * destination note is the next chord's tone and the walk approaches it by
   * step from below.
   * HOW FAST: 3–5 eighth-ish notes — half the speed of the dim run; it walks,
   * it does not sprint.
   * FUNCTION: connective tissue between chords. The chord layer sustains, the
   * lead is sparse, and this line supplies all the motion — Ethan's corpus has
   * arps that LOOP but nothing whose job is to travel between two chords.
   */
  vid_walkup_connector: {
    role: 'flourish', pack: 'igvideo', style: 'neo-soul', class: 'walkup',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 16, meter_class: '4/4',
    onsets: ['1/2', '5/8', '3/4', '7/8'],
    // 5-6-7-R+: an all-members ascent into the octave, the chord-relative
    // approximation of the observed stepwise walk (the source walks the SCALE;
    // members are what the schema can hold, and they land on the same rungs)
    figure: ['5', '6', '7', 'R+'],
    accents: [0.6, 0.65, 0.75, 0.9],
    legato: true, octave: 4,
    seen: 4, songs: ['Producers: steal these chords (igexport-Da-2jFHBTYT)'],
    placement: 'back half of a bar, aimed at the NEXT chord\'s downbeat',
    function: 'a pickup that travels between chords while the pads sustain',
    needsEar: true, character: null,
  },
};
