// Tier-2 melodies (D38): AUTHORED by the model (Claude), not sampled — each
// spec was composed reduction-first (target notes per bar, then the surface)
// against one extracted progression, and renders ONLY through the
// bindMelodySpec() guard (anchors snap, colors declared, off-supply notes
// resolve or get snapped loudly). This file is HAND-WRITTEN, not generated —
// edit and re-audition freely.
//
// These are ORIGINAL melodies over the extracted chord loops — NOT
// transcriptions of the songs' actual melodies (D30's ruling: extracting "the
// melody of X" would be copying a tune, not abstracting a habit).
//
// A6.1 discipline: model output is a CANDIDATE like any import — every entry
// lands ratified:false / needsEar:true / character:null, and enters the
// library only through Ethan's ear.
//
// degrees: scale degrees relative to the solved key (int, or 'b<n>'/'#<n>'
// for declared color — e.g. '#5' in D minor = B natural over Bm).

export const MELODIES_TIER2 = {
  // Dm C Bm Bb^7 (D:minor) — insistent question, sequence down, chromatic-lift
  // bar rising to a peak, gap-fill fall onto a held tonic close.
  ut_megalovania_p1: {
    for: 'ut_megalovania_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '3/16', '1/4', '1/2', '3/4', '7/8'], degrees: [7, 7, 4, 7, 9, 8], accents: [1, 0.55, 0.6, 0.85, 0.75, 0.55] },
      { onsets: ['0', '3/16', '1/4', '1/2', '3/4', '7/8'], degrees: [6, 6, 3, 6, 8, 7], accents: [1, 0.55, 0.6, 0.85, 0.75, 0.55] },
      { onsets: ['0', '3/16', '1/4', '1/2', '5/8', '3/4'], degrees: ['#9', '#9', 7, '#9', 10, 11], accents: [1, 0.55, 0.6, 0.85, 0.6, 0.65] },
      { onsets: ['0', '1/4', '1/2'], degrees: [9, 8, 7], accents: [0.9, 0.6, 0.9], breath: true },
    ],
    character: null,
  },
  // Db2 Ab Db2 Cm7 (Ab:major) — cozy rocking figure, sequenced down, a lifted
  // third statement, settling onto the minor chord's root.
  ut_snowdin_town_p1: {
    for: 'ut_snowdin_town_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '5/8', '3/4'], degrees: [4, 3, 4, 5, 4], accents: [0.9, 0.6, 0.8, 0.55, 0.65] },
      { onsets: ['0', '1/4', '1/2', '5/8', '3/4'], degrees: [2, 1, 2, 4, 2], accents: [0.9, 0.6, 0.8, 0.55, 0.65] },
      { onsets: ['0', '1/4', '1/2', '5/8', '3/4'], degrees: [4, 5, 6, 5, 4], accents: [0.9, 0.55, 0.65, 0.55, 0.6] },
      { onsets: ['0', '1/4', '1/2'], degrees: [4, 3, 2], accents: [0.85, 0.6, 0.9], breath: true },
    ],
    character: null,
  },
  // Db6 Fm Db6 Csus (F:minor) — sassy offbeat strut; exact motif restatement
  // in bar 3, cadence sliding down to the sus chord's root.
  ut_spider_dance_p1: {
    for: 'ut_spider_dance_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '3/16', '3/8', '1/2', '3/4', '7/8'], degrees: [5, 5, 4, 5, 7, 5], accents: [1, 0.55, 0.6, 0.8, 0.75, 0.55] },
      { onsets: ['0', '3/16', '3/8', '1/2', '3/4', '7/8'], degrees: [4, 4, 3, 4, 7, 6], accents: [1, 0.55, 0.6, 0.8, 0.75, 0.55] },
      { onsets: ['0', '3/16', '3/8', '1/2', '3/4', '7/8'], degrees: [5, 5, 4, 5, 7, 5], accents: [1, 0.55, 0.6, 0.8, 0.75, 0.55] },
      { onsets: ['0', '1/4', '3/8', '1/2'], degrees: [7, 5, 3, 4], accents: [0.85, 0.6, 0.6, 0.95], breath: true },
    ],
    character: null,
  },
  // F G7 Bb F (F:major, 2/2) — gentle rise, a descending run through the
  // dominant (B natural declared as '#3'), classic 2̂→1̂ close.
  ut_once_upon_a_time_p3: {
    for: 'ut_once_upon_a_time_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [2, 3, 4, 2], accents: [0.9, 0.6, 0.8, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [5, 4, '#3', 1], accents: [0.85, 0.6, 0.6, 0.75] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [5, 4, 3, 5], accents: [0.9, 0.55, 0.7, 0.6] },
      { onsets: ['0', '1/2'], degrees: [1, 0], accents: [0.65, 0.95], breath: true },
    ],
    character: null,
  },
  // Em D G Em D G (E:minor, 6 bars) — flowing arch across the whole loop:
  // rocking figure sequenced down, rise through G, peak at the second Em,
  // descent, held landing on the final G's root.
  ut_waterfall_p2: {
    for: 'ut_waterfall_p2', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [4, 5, 4, 2], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [3, 4, 3, 1], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [2, 3, 4, 6], accents: [0.85, 0.55, 0.7, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 6, 4, 5], accents: [0.9, 0.6, 0.75, 0.55] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [4, 3, 1, 3], accents: [0.65, 0.6, 0.7, 0.55] },
      { onsets: ['0', '1/2'], degrees: [4, 2], accents: [0.7, 0.9], breath: true },
    ],
    character: null,
  },
  // E F# G#m7 B (B:major, 4/2) — slow farewell shape: high entry falling to
  // rest, answered twice, resolving up onto the tonic's root.
  ut_his_theme_p3: {
    for: 'ut_his_theme_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 3,
    bars: [
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [10, 8, 7, 8], accents: [0.9, 0.55, 0.7, 0.55] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [8, 9, 8, 6], accents: [0.9, 0.55, 0.7, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 8, 9, 8], accents: [0.9, 0.55, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2'], degrees: [8, 9, 7], accents: [0.6, 0.6, 0.95], breath: true },
    ],
    character: null,
  },

  // ---- round 2 of authoring: a spread wide enough to judge tier 2 by ear ----
  // meters 3/4, 6/8, 2/4, 2/2, 5/4 alongside 4/4; tempos 70-175; both modes;
  // diatonic loops and chromatic ones (where the chord's own tones are written
  // as DECLARED colour — 'b<n>'/'#<n>' — which the guard lets stand, D26).

  // Abm7 Abm7 Dbm7 Dbm (Ab:minor) — lazy jazz fall, answered lower, a rising
  // line over the iv7, settling on the fifth.
  ut_sans_p1: {
    for: 'ut_sans_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [6, 4, 2, 4, 2], accents: [0.9, 0.5, 0.5, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [4, 2, 0, 2, 0], accents: [0.9, 0.5, 0.5, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [3, 5, 6, 7, 5], accents: [0.9, 0.5, 0.5, 0.75, 0.5] },
      { onsets: ['0', '1/4', '1/2'], degrees: [5, 3, 0], accents: [0.6, 0.6, 0.95], breath: true },
    ],
    character: null,
  },
  // Db Db Gb Ab Db Db Bbm Bbm7 (Db:major) — skippy dog-trot cell, restated
  // exactly at bar 5 (the theme recurs), climbing over the IV-V, home on the 1̂.
  ut_dogsong_p1: {
    for: 'ut_dogsong_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [4, 4, 2, 4, 5], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [4, 4, 2, 0, 2], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [5, 5, 3, 5, 6], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [4, 6, 8, 6], accents: [0.85, 0.55, 0.85, 0.55] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [4, 4, 2, 4, 5], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [4, 4, 2, 0, 2], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/4', '3/8', '1/2', '3/4'], degrees: [5, 5, 4, 2, 0], accents: [0.9, 0.5, 0.55, 0.75, 0.5] },
      { onsets: ['0', '1/2'], degrees: [4, 0], accents: [0.6, 0.95], breath: true },
    ],
    character: null,
  },
  // Abm Db (Eb:minor, 3/4) — a two-bar waltz: rocking rise, mirrored fall,
  // breath at the turn. Short loops get shape from contour inversion.
  ut_ruins_p1: {
    for: 'ut_ruins_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/3', '2/3'], degrees: [3, 5, 7], accents: [0.7, 0.55, 0.9] },
      { onsets: ['0', '1/3', '2/3'], degrees: [8, 6, 3], accents: [0.9, 0.55, 0.8], breath: true },
    ],
    character: null,
  },
  // Abm Db Abm B^7 (Ab:minor, 6/8) — driving compound-time arpeggio up to the
  // downbeat of each pulse; the IV bar's major third written as colour ('#5').
  ut_ngahhh_p3: {
    for: 'ut_ngahhh_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/6', '1/3', '1/2', '2/3', '5/6'], degrees: [0, 2, 4, 7, 4, 2], accents: [1, 0.55, 0.6, 0.9, 0.55, 0.6] },
      { onsets: ['0', '1/6', '1/3', '1/2', '2/3', '5/6'], degrees: [3, 4, '#5', 7, '#5', 4], accents: [1, 0.55, 0.6, 0.9, 0.55, 0.6] },
      { onsets: ['0', '1/6', '1/3', '1/2', '2/3', '5/6'], degrees: [0, 2, 4, 7, 4, 2], accents: [1, 0.55, 0.6, 0.9, 0.55, 0.6] },
      { onsets: ['0', '1/6', '1/3', '1/2'], degrees: [6, 4, 2, 1], accents: [0.85, 0.55, 0.7, 0.9], breath: true },
    ],
    character: null,
  },
  // E D#m G#m F# (B:major, 175bpm) — anthem: long rising heroic tones, peak on
  // the iii, a stepwise turn over the vi, left open on the V's third.
  ut_save_the_world_p3: {
    for: 'ut_save_the_world_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2', '3/4'], degrees: [3, 5, 7], accents: [0.9, 0.8, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [9, 6, 4], accents: [0.95, 0.7, 0.7] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [5, 7, 9, 7], accents: [0.9, 0.6, 0.85, 0.6] },
      { onsets: ['0', '1/2'], degrees: [8, 6], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // E7 D2 (A:major) — warm two-bar arch, rise and settle, nothing hurried.
  ut_home_p1: {
    for: 'ut_home_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '5/8', '3/4'], degrees: [4, 6, 8, 6, 4], accents: [0.85, 0.55, 0.8, 0.55, 0.6] },
      { onsets: ['0', '1/4', '1/2'], degrees: [3, 4, 0], accents: [0.7, 0.55, 0.9], breath: true },
    ],
    character: null,
  },
  // Am Am Bb Bb ×2 (D:minor) — sparse and eerie: held tones, each pair of bars
  // answering a step higher, the whole thing sinking back at the close.
  ut_gasters_theme_p1: {
    for: 'ut_gasters_theme_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [4, 6], accents: [0.85, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [8, 6, 4], accents: [0.9, 0.6, 0.7] },
      { onsets: ['0', '1/2'], degrees: [5, 7], accents: [0.85, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [9, 7, 5], accents: [0.9, 0.6, 0.7] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [6, 8, 6, 4], accents: [0.85, 0.55, 0.8, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [8, 9, 8, 6], accents: [0.9, 0.55, 0.8, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [7, 5, 2], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/2'], degrees: [2, 0], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // G Am ×4 (E:minor, 2/4) — comic bounce: two-note cells that grow a pickup,
  // then a descending run before the drop onto the tonic.
  ut_thundersnail_p1: {
    for: 'ut_thundersnail_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [4, 2], accents: [0.9, 0.75] },
      { onsets: ['0', '1/2'], degrees: [3, 5], accents: [0.9, 0.75] },
      { onsets: ['0', '1/4', '1/2'], degrees: [6, 4, 2], accents: [0.9, 0.55, 0.75] },
      { onsets: ['0', '1/4', '1/2'], degrees: [5, 3, 0], accents: [0.9, 0.55, 0.75] },
      { onsets: ['0', '1/2', '3/4'], degrees: [4, 6, 9], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [7, 5, 3], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [6, 5, 4, 2], accents: [0.85, 0.55, 0.75, 0.55] },
      { onsets: ['0', '1/2'], degrees: [3, 0], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // Dm Em Am Bb (A:minor, 5/4) — five-beat bars taken as 3+2: an arch per bar,
  // sequenced up, and a Neapolitan landing written as colour ('b1' = Bb).
  ut_shes_playing_piano_p1: {
    for: 'ut_shes_playing_piano_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/5', '2/5', '3/5', '4/5'], degrees: [3, 5, 7, 5, 3], accents: [0.85, 0.55, 0.75, 0.55, 0.6] },
      { onsets: ['0', '1/5', '2/5', '3/5', '4/5'], degrees: [4, 6, 8, 6, 4], accents: [0.85, 0.55, 0.75, 0.55, 0.6] },
      { onsets: ['0', '1/5', '2/5', '3/5', '4/5'], degrees: [7, 9, 7, 4, 2], accents: [0.85, 0.55, 0.75, 0.6, 0.6] },
      { onsets: ['0', '2/5', '4/5'], degrees: [5, 3, 'b1'], accents: [0.7, 0.6, 0.95], breath: true },
    ],
    character: null,
  },
  // F#m D D E7 E7 C#m C#m F# (A:major, 70bpm) — the slow one: mostly half
  // notes, one held tone per bar, the arch spread across all eight.
  ut_reunited_p3: {
    for: 'ut_reunited_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [5, 7], accents: [0.85, 0.7] },
      { onsets: ['0', '1/2'], degrees: [7, 5], accents: [0.85, 0.7] },
      { onsets: ['0', '1/4', '1/2'], degrees: [3, 5, 7], accents: [0.8, 0.6, 0.85] },
      { onsets: ['0', '1/2'], degrees: [8, 6], accents: [0.9, 0.7] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [6, 4, 3, 4], accents: [0.85, 0.6, 0.75, 0.55] },
      { onsets: ['0', '1/2'], degrees: [9, 6], accents: [0.85, 0.7] },
      { onsets: ['0', '1/4', '1/2'], degrees: [6, 4, 2], accents: [0.85, 0.6, 0.8] },
      { onsets: ['0', '1/2'], degrees: [5, 2], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // Bb2 Bb2 D7 Bb2 ×2-ish + A (D:minor) — noble march; the D7 bars take their
  // raised third as colour ('#1'), the close lands on the dominant's root.
  ut_asgore_p2: {
    for: 'ut_asgore_p2', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2', '3/4'], degrees: [5, 6, 9], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [9, 6, 5], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 6, 4, '#1'], accents: [0.9, 0.6, 0.8, 0.6] },
      { onsets: ['0', '1/2'], degrees: [5, 2], accents: [0.85, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [5, 6, 9], accents: [0.9, 0.7, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [9, 11, 12], accents: [0.85, 0.6, 0.9] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [11, '#8', 7, 6], accents: [0.9, 0.6, 0.8, 0.6] },
      { onsets: ['0', '1/2'], degrees: [8, 4], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // Gb Gb Ab Ab Fm Fm Bbm Ab (F:minor) — wandering and wide; the bII bars keep
  // their own root as colour ('b8'), the line drifts up to the i and back.
  ut_another_medium_p2: {
    for: 'ut_another_medium_p2', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [5, 3], accents: [0.85, 0.7] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [5, 'b8', 5, 3], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [6, 4, 2], accents: [0.85, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [2, 4, 6, 9], accents: [0.8, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [9, 7], accents: [0.9, 0.75] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 9, 7, 4], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [5, 3, 0], accents: [0.85, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [2, 4], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // D D D D Dbm Dbm Dbm Gbm (Db:minor) — music-box tenderness over a Neapolitan
  // pedal: small delicate cells, one octave-lifted restatement, a soft landing.
  ut_memory_p1: {
    for: 'ut_memory_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [5, 3], accents: [0.8, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [3, 5, '#7'], accents: [0.8, 0.7, 0.6] },
      { onsets: ['0', '1/4', '1/2'], degrees: [10, 9, 5], accents: [0.85, 0.6, 0.75] },
      { onsets: ['0', '1/2'], degrees: [3, 5], accents: [0.75, 0.8] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 9, 7, 4], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [9, 11, 9, 7], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2', '3/4'], degrees: [7, 4, 2], accents: [0.85, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [3, 0], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // C C Fm Fm (C:major, 170bpm) — silly and quick; the borrowed iv keeps its
  // flat sixth as colour ('b5'), the tune shrugs down onto the tonic.
  ut_temmie_village_p2: {
    for: 'ut_temmie_village_p2', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [4, 2, 4, 7], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [7, 4, 2, 0], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [3, 'b5', 3, 0], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [7, 0], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // Bb Fm7 A^7 Gm7 (Bb:major) — bright and chatty; the chromatic A^7 bar is
  // written almost entirely as declared colour and still passes the guard.
  ut_dating_start_p3: {
    for: 'ut_dating_start_p3', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [4, 5, 4, 2], accents: [0.9, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [3, 4, 3, 1], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [6, '#5', 6, '#3'], accents: [0.85, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [5, 2], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
  // F#m7 F#m7 Em7 ×4 (E:minor, 2/2) — cold and open: half-note tones over the
  // ii, a slow climb through the i7, resolution on the tonic.
  ut_core_approach_p1: {
    for: 'ut_core_approach_p1', style: 'toby-fox', pack: 'undertale',
    provenance: 'authored-tier2', author: 'claude', ratified: false, needsEar: true,
    octave: 4,
    bars: [
      { onsets: ['0', '1/2'], degrees: [3, 1], accents: [0.85, 0.7] },
      { onsets: ['0', '1/2', '3/4'], degrees: [1, 3, 7], accents: [0.85, 0.7, 0.6] },
      { onsets: ['0', '1/2'], degrees: [4, 2], accents: [0.85, 0.7] },
      { onsets: ['0', '1/4', '1/2', '3/4'], degrees: [2, 4, 6, 4], accents: [0.8, 0.6, 0.75, 0.6] },
      { onsets: ['0', '1/2'], degrees: [7, 6], accents: [0.9, 0.7] },
      { onsets: ['0', '1/2'], degrees: [4, 0], accents: [0.7, 0.95], breath: true },
    ],
    character: null,
  },
};
