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

  // ==========================================================================
  // BATCH 2 (D68) — the "extra stuff between chords" Ethan asked for by name,
  // read out of the new reels. Two families dominate the batch: CLIMBS (the
  // voicing taken up the octaves) and TAGS (one or two notes placed after or
  // between chords). Every entry names its source video(s).
  // ==========================================================================

  /**
   * The octave-climb BLOCK RESTRIKE (igexport-DceNMCmuYZV, the G#m9 reel —
   * his named ask; also igexport-DYP1T7zRAYJ and the sr2027 Fm7(11) bar).
   *
   * NOT an arpeggio: the entire rootless upper voicing (9-b3-5-b7-9, the 9 a
   * half-step under the b3) is restruck as a solid block one octave higher on
   * each successive beat, hands fully releasing between strikes — terraced
   * echoes, not a swell. The bass sounds only under position 1. After the top
   * octave, two solo notes walk down as the pickup into the next chord
   * (octave-root then b7 — 9->1->b7 down the top of the chord).
   */
  vid_climb_block_restrike: {
    role: 'flourish', pack: 'igvideo', style: 'cinematic-rnb', class: 'climb',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['0/1', '1/4', '1/2', '3/4', '7/8'],
    figure: ['R.9.3.5.7.9+', '9+.3+.5+.7+.9++', '9++.3++.5++.7++.9+++', 'R+++', '7++'],
    accents: [0.85, 0.8, 0.9, 0.6, 0.55],
    legato: false, octave: 3,
    seen: 8, songs: ['G#m9 octave-climb reel (igexport-DceNMCmuYZV)', 'vanriver Eb loop (sr 13-20-27)'],
    placement: 'a whole bar owns one chord: block on beats 1-3 climbing an octave each, walk-down 8ths on beat 4',
    function: 'converts one held chord into a full-bar gesture; the detached release between strikes is what keeps it an echo, not a wash',
    needsEar: true, character: null,
  },

  /**
   * The post-climb walk-down tag, octave-doubled (igexport-DYP1T7zRAYJ).
   *
   * After the last chord of the loop (stated once, low), three octave-doubled
   * single notes walk down before the loop restarts: 9 -> 1 -> 7 OF THE
   * INCOMING CHORD (A -> G -> F# into Gmaj7). The tag announces the next
   * chord rather than echoing the current one — the DceNMCmuYZV reel does the
   * same trick on its V chord (tag notes = 5th and 3rd of the coming bII).
   */
  vid_tag_climb_walkdown: {
    role: 'flourish', pack: 'igvideo', style: 'ballad', class: 'tag',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['5/8', '3/4', '7/8'],
    figure: ['9+.9++', 'R+.R++', '7.7+'],
    accents: [0.7, 0.65, 0.6],
    legato: false, octave: 4,
    seen: 3, songs: ['Octave-stack reel (igexport-DYP1T7zRAYJ)', 'G#m9 reel (igexport-DceNMCmuYZV)'],
    placement: 'the last three 8ths before a chord change, bound against the INCOMING chord',
    function: 'hands the ear the next chord early — 9->1->7 walked down in octaves; the video even ends mid-tag, wired for looping',
    needsEar: true, character: null,
  },

  /**
   * The two-note end-of-bar pickup (igexport-DbEktz0I_j8; the same cell,
   * walking UP instead, closes every full bar of igexport-DZ93AHcBuac).
   *
   * Two even 8ths on the '4-and': the chord's own b3 falling a semitone-or-
   * step onto its 9 — the top of the voicing sings a tiny sigh into the next
   * chord. On a maj9 chord the reel plays a single accented 3rd instead (no
   * walk), so the tag is a minor-chord habit, not a universal.
   */
  vid_tag_two_note_pickup: {
    role: 'flourish', pack: 'igvideo', style: 'neo-soul', class: 'tag',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['3/4', '7/8'],
    figure: ['3+', '9+'],
    accents: [0.65, 0.6],
    legato: false, octave: 4,
    seen: 6, songs: ['Use-these-chords planing loop (igexport-DbEktz0I_j8)', 'D-major bubble circle (igexport-DZ93AHcBuac)'],
    placement: 'beats 4 and 4-and of a chord\'s bar, at the top of the voicing',
    function: 'the "two extra notes" habit: b3 resolving onto the 9 as a pickup — motion into the barline without a run',
    needsEar: true, character: null,
  },

  /**
   * The Tyler sus-melt dyad (igexport-DcY-6NdSCFY — his named ask).
   *
   * Strike the sus chord and hold it one beat; then strike TWO EXTRA NOTES
   * together, each exactly a half-step below the two notes simultaneously
   * lifted: the 4th falls to the 3rd, the 13th sags to the b13 — Csus13
   * becomes C9b13 in one dyad. The bass and inner voices ring underneath.
   * Voice-leading payoff: the new 3rd holds over as the maj7 of the next
   * chord, and the b13 slides one more semitone to its 9 — the top voice
   * sings a chromatic line across the whole turn (A-A-G#-G).
   */
  vid_tag_sus_melt: {
    role: 'flourish', pack: 'igvideo', style: 'neo-soul', class: 'tag',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['0/1', '5/8'],
    figure: ['R.7.9', '3+.6+'],
    accents: [0.8, 0.7],
    legato: true, octave: 3,
    seen: 2, songs: ['Tyler type chords (igexport-DcY-6NdSCFY)'],
    placement: 'on a dominant held for the bar: shell on the downbeat, the 3+13/b13 dyad on the and-of-3 (pushed)',
    function: 'sus-then-resolve as a PLAYED event — the re-attack transient is the point; over a b13 chord the 6-token lands on the b13 and the melt is complete',
    needsEar: true, character: null,
  },

  /**
   * The arp under-shadow (ScreenRecording 13-26-56, @consci3ntiousmusic —
   * "add a note below every arp note").
   *
   * A plain descending one-note-per-8th chord-tone waterfall gains a second
   * simultaneous CHORD TONE under (or occasionally over) every note — same
   * grid, same gate, struck together. The pairing is not parallel motion:
   * octaves at the top, then compound 3rds/4ths, then the pairs INVERT
   * (the "added" voice crosses above) as the line descends — so the dyad
   * colour rotates while the contour stays. Encoded as the observed Amaj9
   * bar: R-7-5-3-9-R-7-5 descending, each with its shadow.
   */
  vid_arp_undershadow: {
    role: 'flourish', pack: 'igvideo', style: 'fl-tutorial', class: 'run',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    figure: ['R++.R+', '7+.7', '5+.9', '3+.R+', '9.5+', 'R+.3+', '7.9', '5.R+'],
    accents: [0.85, 0.7, 0.75, 0.7, 0.75, 0.7, 0.65, 0.7],
    legato: false, octave: 3,
    seen: 6, songs: ['arp-trick tutorial (sr 13-26-56, consci3ntiousmusic)'],
    placement: 'replaces a whole bar of single-note arpeggio, any chord it runs over',
    function: 'the fix for "sounds too robotic": every arp note carries a chord-tone shadow, so a line becomes a texture without changing the rhythm',
    needsEar: true, character: null,
  },

  /**
   * The bronik add9 climb (sr 13-25-13, @bronikbeats "Impossible" — his
   * named ask; Ethan on the opening figure: "that sounds good").
   *
   * A two-octave broken-chord climb in straight 8ths: root, 9, b3, 5, then
   * the same four tones an octave up — 1-9-b3-5-8-9'-b3'-5', topping out on
   * the 5th two octaves up on the and-of-4. One chord per bar.
   *
   * THE SOURCE'S REHARM TRICK IS NOT IN THESE TOKENS, on purpose: in the
   * video the upper cell (9-b3-5 = D-Eb-G) is ABSOLUTELY FIXED and only the
   * bottom note walks down 1 -> b7 -> b6 -> 5, re-naming the same climb as
   * i(add9), bIII^7-color, bVI^7#11, v(b13). Chord-relative tokens would
   * move the cell with each root. So the faithful engine rendering is this
   * figure held on ONE static chord while a SEPARATE bass layer walks
   * 1-b7-b6-5 underneath — which is also literally how the video is built
   * (the arp layer never changes; the sub bass does the moving). The
   * resulting harmony is recorded as vid_bronik_descent.
   */
  vid_climb_bronik_add9: {
    role: 'flourish', pack: 'igvideo', style: 'melodic-trap', class: 'climb',
    provenance: 'video-transcribed', ratified: false,
    bars: 1, grid: 8, meter_class: '4/4',
    onsets: ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    figure: ['R', '9', '3', '5', 'R+', '9+', '3+', '5+'],
    accents: [0.8, 0.7, 0.72, 0.75, 0.78, 0.72, 0.75, 0.82],
    legato: false, octave: 3,
    seen: 16, songs: ['bronikbeats Impossible (sr 13-25-13)'],
    placement: 'the loop’s foundation layer, every bar; pair with a whole-note bass walking 1-b7-b6-5 on a STATIC chord to reproduce the source’s fixed-cell reharm',
    function: 'notes leading upwards as the identity of the beat — the 9 next to the b3 gives the climb its blur; four more layers in the source echo the same 1-2-b3-4 vocabulary at other octaves (video-corpus.md)',
    needsEar: true, character: null,
  },

  /**
   * The quintal ladder (igexport-DZKQMVQsj79 — Aquatic Ambience cover; the
   * interval-progression brief, note for note).
   *
   * ONE chord-relative rule explains every bar of the source: arpeggiate
   * bottom-to-top as stacked FIFTHS from the root (1 -> 5 -> 9), take a
   * half/whole-step BLUR SLIDE into the adjacent chord tone (9 -> b3 on
   * minor chords, the G#+A semitone pair that appears in literally every
   * bar of the video; on the major bar the same slot lands #11 -> 5), then
   * keep climbing in 5ths/4ths to the b7/9 region two octaves up. LH plays
   * notes 1-4 on beats 1-&-2-&, RH plays 5-8 on beats 3-&-4-&, pedal down
   * for the whole bar so the ladder ACCUMULATES into the chord — then a
   * full hold bar of just the wash. Because every token is chord-relative,
   * the same eight tokens re-voice as m9, ^9(#11), m7 exactly the way the
   * source's five chords do.
   */
  vid_ladder_quintal: {
    role: 'flourish', pack: 'igvideo', style: 'vgm-ambient', class: 'climb',
    provenance: 'video-transcribed', ratified: false,
    bars: 2, grid: 8, meter_class: '4/4',
    onsets: ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    figure: ['R', '5', '9', '3', '7', '9+', '3+', '7+'],
    accents: [0.75, 0.7, 0.7, 0.72, 0.75, 0.78, 0.8, 0.85],
    legato: true, octave: 2,
    seen: 10, songs: ['Aquatic Ambience cover (igexport-DZKQMVQsj79)'],
    placement: 'one chord owns two bars: the ladder climbs bar 1 (straight 8ths, LH then RH), bar 2 is the pedal wash holding',
    function: 'the water texture as a single line: stacked 5ths + the 9-under-b3 blur; the chord is never blocked, it accumulates. The source ends its cycle with a falling b6-5-b3 cascade from the top — an ending tag to pair with it. D71, his keep note on vl_aquatic_ladder: "ensure that in songs it\'s lots of reverb and damper though" — bind with generous .room() and legato pedal whenever this enters a song',
    needsEar: true, character: null,
  },
};
