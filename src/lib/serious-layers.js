// r40 — THE SERIOUS TIER: what makes a serious fight / adventure / calm theme
// sound serious, as named data.
//
// His ask (2026-09-13): "all of our energetic songs sound like 'light
// energetic' … i just want more serious prompts to have more serious vibes …
// i will attach a few files you should analyze for trends in the melody for
// how it sounds serious, and all the different layers (in attack on titan you
// can literally see them come in one by one) … the main theme/voice has a very
// strong, slow ish theme when it's the main thing, but it has a lot of layered
// support … the left hand chord that plays by itself after the main theme
// plays at the beginning of attack on titan is really good you should learn
// that (like where the top left hand note hits and then is raised by a note
// then repeat) … even if it's virtually the same notes or with just a interval
// tweak or octave tweak or slightly different notes, add it! typically the more
// layers the better but just make sure to balance out dynamics."
//
// Every row below was measured off his ten reference files (the read-out is
// research/serious-r40.md; the section numbers refer to it) or taken from the
// orchestration literature and marked as such. Rows are addressed BY NAME ONLY
// — never iterated, never length-indexed — so adding one can never re-roll a
// song (D95/D119; the techniques.js property, enforced by a test).
//
// Dialect reminders (CLAUDE.md): `^7` is maj7 (never `maj7`); degrees are
// semitone offsets from the tonic with `:quality`; figure tokens are
// R/3/5/s2/s4/s6/s7 (`+` per octave, dots join a chord), onsets are
// bar-relative fractions and may exceed 1 on a multi-bar figure.

// ---------------------------------------------------------------- loops
// §2.6: the leading tone is essentially absent (0–3% of pitch weight on nine of
// ten files) and the harmonic rhythm is 1.06–1.63 chords a bar — mostly one
// chord a bar, and Attack on Titan holds ONE chord for twelve bars. So every
// loop here is Aeolian or Dorian, four chords, one bar each, and none of them
// carries a major V.
const loop = (degrees, numerals, source, extra = {}) => ({
  family: 'minor', role: 'both', degrees, numerals, source,
  pack: 'serious-r40', provenance: 'r40 read-out (hand-authored from the measured loops)',
  ratified: false, needsEar: true, chordUnits: [1, 1, 1, 1], ...extra,
});
export const SERIOUS_LOOPS = {
  // the shuttle: two chords, four bars — Naruto's `i bVII i bVII` (measured
  // twice in its window table) and the same shape under Attack on Titan's build
  sr_loop_shuttle_i_bVII: loop('0:m 10 0:m 10', 'i bVII i bVII', 'The Raising Fighting Spirit, bars 8–23 (measured loop `i bVII i bVII`)'),
  // the descending Aeolian axis, the most common anime-battle loop on the charts
  sr_loop_i_bVII_bVI_bVII: loop('0:m 10 8 10', 'i bVII bVI bVII', 'the Aeolian axis with the bVII turnaround (AoT build, Zoltraak family)'),
  sr_loop_i_bVII_bVI_iv: loop('0:m 10 8 5:m', 'i bVII bVI iv', 'Zoltraak (Gm–F–Eb–Cm on the chart; the file measures i and IVsus bVI2 cells)'),
  sr_loop_i_bVII_bVI_III: loop('0:m 10 8 3', 'i bVII bVI bIII', 'Homura intro (Bm–A–G–D)'),
  // the epic cadence: bVI–bVII–i (Aeolian cadence; stoic while i stays minor)
  sr_loop_iv_bVI_bVII_i: loop('5:m 8 10 0:m', 'iv bVI bVII i', 'the bVI–bVII–i Aeolian cadence (literature §3.8) over the measured iv opening'),
  sr_loop_bVII_iv_i_bVI7: loop('10 5:m 0:m 8:^7', 'bVII iv i bVI^7', 'Solo Leveling ReawakeR (measured `bVII iv i7 bVI^7`, twice)'),
  // the pedal: ONE chord for the whole loop — AoT's twelve-bar tonic pedal under
  // the left-hand cell, harmonic rhythm 1.00
  sr_loop_pedal_i: loop('0:m 0:m 0:m 0:m', 'i i i i', 'attack on titan bars 9–20: one chord under the left-hand cell for twelve bars (§2.3)'),
  // Dorian: the major IV against a minor tonic, "everywhere in fantasy game
  // music" (Open Music Theory's modal schemas) and the mode Zimmer's "Time" uses
  sr_loop_dorian_i_IV: loop('0:m 5 0:m 10', 'i IV i bVII', 'Dorian IV–i (literature §5.1: "Time" is A Dorian; the major 6th removes the leading-tone pull)'),
  // serious CALM — Interstellar's measured loop, sevenths and a sus, stepping up
  sr_loop_calm_i7_bIII6_iv: loop('0:m7 3:6 5:m 10:sus', 'i7 bIII6 iv bVIIsus', 'Interstellar (main), measured loop `i7 bIII6 iv bVIIsus` (twice)'),
  sr_loop_calm_bVI7_bVII_i: loop('8:^7 10 0:m7 0:m7', 'bVI^7 bVII i7 i7', 'Interstellar F^7–G6–Am family: each chord steps up and resolves on the root'),
};

// ---------------------------------------------------------------- figures
const E8 = ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];
const S16x2 = Array.from({ length: 32 }, (_, i) => `${i}/16`);
const fig = (name, cls, bars, onsets, figure, accents, extra = {}) => ({
  name, class: cls, bars, grid: extra.grid ?? 8, meter_class: '4/4', onsets, figure, accents,
  legato: extra.legato ?? false, pack: 'serious-r40', role: extra.role ?? 'ostinato', ...extra,
});

// r42 — the four-note 16th cell as a FUNCTION of its two beat patterns, so a
// variant can differ from `sr_pedal_cell` only in its PITCHES: same onsets,
// same accents, same two-bar alternation. Returns `{ [name]: row }` for
// spreading into the table below — the rows are still addressed by name and
// nothing iterates them (D95/D119).
const CELL_ACC_A = [0.95, 0.6, 0.7, 0.75];
const CELL_ACC_B = [0.9, 0.6, 0.7, 0.8];
const cellPair = (name, beatA, beatB, source, extra = {}) => ({
  [name]: fig(name, 'arp', 2, S16x2,
    [...Array.from({ length: 4 }, () => beatA).flat(), ...Array.from({ length: 4 }, () => beatB).flat()],
    [...Array.from({ length: 4 }, () => CELL_ACC_A).flat(), ...Array.from({ length: 4 }, () => CELL_ACC_B).flat()],
    { octave: 2, grid: 16, source, ...extra }),
});

export const SERIOUS_FIGURES = {
  // §2.3 — HIS NAMED FIGURE. attack on titan bars 9–20, the left hand ALONE:
  //   E2 E2 G2 B2 | (×4 a bar)          bar 1   = R R b3 5
  //   E2 E2 G2 C3 | (×4 a bar)          bar 2   = R R b3 b6
  // and it alternates bar by bar for twelve bars over a static tonic pedal.
  // His words: "where the top left hand note hits and then is raised by a note
  // then repeat". Both readings of that sentence are in the figure — the cell
  // itself rises (R → b3 → 5) and its TOP note is raised one scale step on
  // alternate bars. `s6` is the scale sixth (b6 in minor), so it cannot spell a
  // foreign pitch whatever the chord (D101's law — never a bare 6).
  sr_pedal_cell: fig('sr_pedal_cell', 'arp', 2, S16x2,
    [...Array.from({ length: 4 }, () => ['R', 'R', '3', '5']).flat(),
      ...Array.from({ length: 4 }, () => ['R', 'R', '3', 's6']).flat()],
    [...Array.from({ length: 4 }, () => [0.95, 0.6, 0.7, 0.75]).flat(),
      ...Array.from({ length: 4 }, () => [0.9, 0.6, 0.7, 0.8]).flat()],
    { octave: 2, grid: 16, source: '§2.3 attack on titan bars 9–20, the left hand alone: 16ths R R b3 5 per beat, the top note raised to b6 on alternate bars, over a twelve-bar tonic pedal' }),

  // §2.4 — Interstellar "First Step" bars 0–6: 8ths alternating E4/C4 (the
  // chord's 5th and 3rd) for four bars ALONE, then the lower note follows the
  // chord while the top note never moves. The engine re-pitches both (the freeze
  // needs a pedal loop — pair it with `sr_loop_pedal_i` to reproduce it exactly).
  sr_osc_third: fig('sr_osc_third', 'arp', 1, E8, ['5', '3', '5', '3', '5', '3', '5', '3'],
    [0.8, 0.55, 0.7, 0.55, 0.75, 0.55, 0.7, 0.55],
    { octave: 4, source: '§2.4 First Step bars 0–6 / Interstellar (main) bars 0–7: an 8th oscillation between the chord\'s 5th and 3rd, alone for four bars' }),

  // §2.4 — The Raising Fighting Spirit bar 8+: the left hand's syncopated 16th
  // motor on a root–fifth dyad (onsets at 0, 1, 1.25, 1.75, 2, 2.75, 3.25, 3.75
  // in beats), under four-note chords held in the right hand.
  sr_motor16_dyad: fig('sr_motor16_dyad', 'pulse', 1,
    ['0/1', '1/4', '5/16', '7/16', '1/2', '11/16', '13/16', '15/16'],
    ['R.5', 'R.5', 'R.5', 'R.5', 'R.5', 'R.5', 'R.5', 'R.5'],
    [0.95, 0.6, 0.55, 0.6, 0.9, 0.6, 0.55, 0.6],
    { octave: 2, grid: 16, source: '§2.4 The Raising Fighting Spirit bar 8+: a syncopated 16th root–fifth motor in the left hand' }),

  // §2.4 — The Raising Fighting Spirit bars 1/3/5: the theme runs in the first
  // half of the bar and four-note block chords ANSWER it on beats 3 and 4.
  sr_answer_stabs: fig('sr_answer_stabs', 'block', 1, ['1/2', '3/4'], ['R.3.5.R+', 'R.3.5.R+'], [0.9, 0.85],
    { octave: 3, source: '§2.4 The Raising Fighting Spirit bars 1/3/5: four-note block chords answering the theme on beats 3–4' }),

  // §2.5 — the octave bass. attack on titan bars 0–7: E2+E1 held the whole bar
  // (the left hand doubles itself at the octave on 27% of its strikes; Naruto
  // 42%, Zoltraak 32%, First Step 32%).
  sr_octave_bass_hold: fig('sr_octave_bass_hold', 'sustain', 1, ['0/1'], ['R.R+'], [1],
    { octave: 1, legato: true, role: 'bass', source: '§2.5 attack on titan bars 0–7: the bass held as an octave pair for the whole bar' }),

  // §2.4 — attack on titan bars 68+: the chorus bass pushes (onsets 0, the & of
  // 2, beat 3, the & of 4) in octave pairs.
  sr_bass_push: fig('sr_bass_push', 'pulse', 1, ['0/1', '3/8', '1/2', '7/8'], ['R.R+', 'R.R+', 'R.R+', 'R.R+'],
    [1, 0.7, 0.9, 0.7], { octave: 1, role: 'bass', source: '§2.4 attack on titan bars 68+: the octave bass pushing on 1, the & of 2, 3, the & of 4' }),

  // §2.4 — attack on titan bars 68+: the chorus riff, 8ths in PAIRS (each chord
  // tone struck twice), which is what lets the octave doubling above it read as
  // one voice rather than a flurry. Single notes here; the octave doubling is a
  // SEPARATE layer on a different sound (the literature's rule: an octave pair
  // is two colours, never one instrument doubling itself).
  sr_gallop: fig('sr_gallop', 'pulse', 1, E8, ['5', '5', 'R+', 'R+', 's4', 's4', 'R+', 'R+'],
    [0.95, 0.7, 0.85, 0.7, 0.9, 0.7, 0.85, 0.7],
    { octave: 3, source: '§2.4 attack on titan bars 68+: the chorus riff in 8th PAIRS (G G C C F F C C over i)' }),

  // §2.4 — attack on titan bars 76–83: sustained four-note chords added UNDER
  // the riff, the voicing rotating every bar (his reels' own device: "a repeated
  // chord returns with its voicing rotated one position").
  sr_chorale_rotate: fig('sr_chorale_rotate', 'sustain', 2, ['0/1', '1/1'], ['R.5.R+.3+', '3.5.R+.5+'], [0.8, 0.75],
    { octave: 3, legato: true, role: 'pad', source: '§2.4 attack on titan bars 76–83: sustained four-note chords under the riff, the voicing rotating each bar' }),

  // literature §4.3 — the 3+3+2 8th cell with the accents on the direction
  // changes, low strings first. Recorded here as the serious pack's own row so a
  // battle stack can name it.
  sr_stabs_332: fig('sr_stabs_332', 'block', 1, ['0/1', '3/8', '3/4'], ['R.5', 'R.5', '3.5'], [0.95, 0.85, 0.8],
    { octave: 3, source: 'literature §4.3 (Film Music Theory): the 3+3+2 8th ostinato cell, accents on the direction changes' }),

  // §3.7 — serious CALM (Interstellar): a flowing 16th arpeggio that resolves on
  // the root of each chord, no drums anywhere in that score.
  sr_calm_arp16: fig('sr_calm_arp16', 'arp', 1, Array.from({ length: 16 }, (_, i) => `${i}/16`),
    ['R', '5', 'R+', '3+', '5+', '3+', 'R+', '5', 'R', '5', 'R+', '3+', '5+', '3+', 'R+', '5'],
    [0.7, 0.45, 0.55, 0.5, 0.6, 0.45, 0.5, 0.45, 0.68, 0.45, 0.55, 0.5, 0.6, 0.45, 0.5, 0.45],
    { octave: 3, grid: 16, source: '§3.7 Interstellar: the 16th arpeggio cell, each chord stepping up and resolving on the root' }),

  // =====================================================================
  // r42 — HIS ASK (2026-09-13), verbatim: "the cello harmony that you added
  // into the high energy songs (like the one where it's rising and repeating)
  // is good but there should be more variations of those. like experiment with
  // more variations, like falling instead of rising, 3 notes instead of 4 where
  // the fourth note is the root again, different intervals, different patterns.
  // MOREOVER, they also do the bass too in the attack on titan, and other
  // patterns besides this - I want to hear them individually and variations of
  // them for the energetic songs."
  //
  // The layer he named is `sr_pedal_cell` on `gm_cello` — the `ost` slot of
  // sr_stack_titan, which is gm_cello on sr_gate / sr_oath / sr_hunt.
  //
  // Every row below is one of two things and says which: MEASURED (a file, a
  // bar span and how many times that file plays it — counted by the cell probe,
  // not read off one bar by eye, which is the r41 mistake) or HIS ASK (a shape
  // he named that the references do not play; marked `invented: true`).
  //
  // The cell variants share `sr_pedal_cell`'s ONSETS and ACCENTS exactly —
  // sixteenths, four to a beat, the top note raised on the alternate bar — so
  // the only thing that changes between the lab cards is the PITCH SHAPE. A
  // card whose variants move more than one variable is not an A/B (D139).
  // ---------------------------------------------------------------------

  // the four-note 16th cell, two bars, the alternate bar raising the last note:
  // `sr_pedal_cell` written as data so a variant can only differ in its pitches
  ...cellPair('sr_cell_fall', ['5', '3', 'R', 'R'], ['s6', '3', 'R', 'R'],
    'HIS ASK — "falling instead of rising": sr_pedal_cell mirrored, the top note struck FIRST and the cell walking down to the doubled root. Measured support for the shape: attack on titan\'s own chorus riff descends on the odd bars (bars 69/71/73/75, 7-b6-b7-b5 in pairs) and Zoltraak\'s bass walks R-b7-b6 down (x9, bars 30-42)', { invented: true }),
  ...cellPair('sr_cell_root_return', ['R', '3', '5', 'R'], ['R', '3', 's6', 'R'],
    'HIS ASK — "3 notes instead of 4 where the fourth note is the root again": three distinct pitches rising, the fourth 16th returning to the root instead of doubling it at the start', { invented: true }),
  ...cellPair('sr_cell_arch', ['R', '3', '5', '3'], ['R', '3', 's6', '3'],
    'HIS ASK — "different patterns": up and back down inside the beat (an arch), so the cell turns rather than resets', { invented: true }),
  ...cellPair('sr_cell_step', ['R', 's2', '3', 's4'], ['R', 's2', '3', '5'],
    'HIS ASK — "different intervals": the same rhythm walked in SCALE STEPS rather than chord thirds (s2/s4 resolve against the chord-scale, so no bare 2nd or 4th can spell a foreign pitch — D101)', { invented: true }),
  ...cellPair('sr_cell_open5', ['R', '5', 'R+', '5'], ['R', '5', 's7', '5'],
    'HIS ASK — "different intervals", the open end of the range: fifths and the octave instead of thirds. Measured support: Zoltraak\'s bass pumps R-5-5-5 on 8ths (x4, bars 11-16) and attack on titan\'s cell register is octave-doubled throughout', { invented: true }),
  ...cellPair('sr_cell_oct_leap', ['R', '3', 'R+', '3'], ['R', 's4', 'R+', 's4'],
    'HIS ASK — "different intervals": a leap to the octave every beat, the middle note moving between bars (3 then s4)', { invented: true }),
  ...cellPair('sr_cell_pairs', ['R', 'R', '3', '3'], ['5', '5', '3', '3'],
    'HIS ASK — the DEVICE is measured and the notes are not: attack on titan bars 68-83 do strike every chord tone twice (verified at 85.3% of pair-head notes), but they do it in 8ths in the riff register, and this row writes 16ths in the cell register on its own pitches. "Each note struck twice" is what lets a doubled line read as one voice rather than a flurry', { invented: true }),

  // MEASURED — attack on titan bars 21-28 (x4 + x4 with the tail), the cell
  // section's SECOND pattern and the one nobody had transcribed: five 16ths,
  // then a half-bar REST, then the same five with a different landing note. A
  // neighbour figure (up a third, down a step, back up) rather than a rising
  // arpeggio, and sparse where the pedal cell is continuous.
  // r42 verify pass, CORRECTED: 20 of the 22 events I first encoded are exact,
  // and the two I called "high 16ths at the end" are D#2 — the raised leading
  // tone BELOW the root, the lowest note in the bar. The dialect has no
  // negative-octave token (`~-12` is invalid, CLAUDE.md), so rather than ship an
  // 11-semitone error the row encodes the twenty events that ARE exact and says
  // what it leaves out.
  sr_cell_neighbor: fig('sr_cell_neighbor', 'arp', 2,
    ['0/16', '1/16', '2/16', '3/16', '4/16', '9/16', '10/16', '11/16', '12/16', '13/16',
      '16/16', '17/16', '18/16', '19/16', '20/16', '25/16', '26/16', '27/16', '28/16', '29/16'],
    ['R', '3', 's2', '3', 'R', 'R', '3', 's2', '3', 's4',
      'R', '3', 's2', '3', 'R', 'R', '3', 's2', '3', 's4'],
    [0.95, 0.7, 0.6, 0.7, 0.8, 0.9, 0.7, 0.6, 0.7, 0.75,
      0.95, 0.7, 0.6, 0.7, 0.8, 0.9, 0.7, 0.6, 0.7, 0.75],
    { octave: 2, grid: 16, partial: 'sr_cell_neighbor_full', source: '§2.3 MEASURED attack on titan bars 21-28 (x4 + x4): R b3 2 b3 R, a half-bar rest, then R b3 2 b3 4. r43, HIS NOTE ("I feel like it\'s not 4/4 - the next chord is always coming in like an eight note too soon"): this row is the LOWER VOICE ONLY and its rests are filled in the file by the pedal cell an octave above — `sr_cell_neighbor_full` is the complete texture. The even bars also close on the raised leading tone BELOW the root (D#2, the bar\'s lowest note); the figure dialect cannot spell a note under its own root, so those two 16ths are the one thing here the row does not carry' }),

  // HIS ASK, and the r42 verify pass is why it says so. I first encoded this as
  // "attack on titan's odd riff bar, which descends" and re-measuring the file
  // REFUTED that: bars 69/71/73/75 sound Eb4 Eb4, C4 C4, D4 D4, Bb3 Bb3 —
  // identical in all four bars over a bass that MOVES (C2, then G#1), i.e. a
  // FROZEN cell (D120's device, arriving from a second source), and its contour
  // turns rather than descending (63 -> 60 -> 62 -> 58: down, UP, down). Zero of
  // the four pitch positions match these tokens on either root.
  //
  // The pair rhythm and the x4 are real; the descent is mine. So the row keeps
  // the shape he asked to hear and says whose it is.
  sr_gallop_fall: fig('sr_gallop_fall', 'pulse', 1, E8,
    ['R+', 'R+', 's7', 's7', 's6', 's6', '5', '5'],
    [0.95, 0.7, 0.9, 0.7, 0.9, 0.7, 0.85, 0.7],
    { octave: 3, invented: true, source: 'HIS ASK — "falling instead of rising" in the riff register: sr_gallop\'s 8th PAIRS walked strictly down (octave, b7, b6, 5). The pair rhythm is attack on titan bars 68-83; the descent is not — re-measured, that file\'s odd riff bars are a FROZEN four-note cell over a moving bass whose contour turns rather than falling' }),

  // ------------------------------------------------------------------ bass
  // HIS "they also do the bass too in the attack on titan, and other patterns
  // besides this". Measured bar by bar off the file: attack on titan plays SIX
  // distinct bass patterns across its 104 bars, and r40 encoded two of them.
  // The other four are here, with one each from Muzan, Zoltraak, A world where
  // the sun never rises and Solo Leveling.

  // MEASURED — attack on titan bars 29-36 (x7, unchanged for eight bars): the
  // octave bass on straight 8ths, the loudest and most driving thing the file
  // does with its low end. The doubling alternates: both octaves on the first
  // two 8ths of each half-bar, then the single upper and single lower.
  sr_bass_oct8ths: fig('sr_bass_oct8ths', 'pulse', 1, E8,
    ['R.R+', 'R.R+', 'R+', 'R', 'R.R+', 'R.R+', 'R+', 'R'],
    [1, 0.72, 0.8, 0.7, 0.95, 0.72, 0.8, 0.7],
    { octave: 1, role: 'bass', source: '§2.5 MEASURED attack on titan bars 29-36 (x7): octave pairs on straight 8ths, the same bar eight times' }),

  // MEASURED — attack on titan bars 0-7. r40 read this as "held the whole bar"
  // and it is not: there are TWO octave strikes a bar and the second one MOVES
  // — beat 4, beat 2, beat 3, beat 3, beat 4, beat 2, beat 4, beat 3. A bass
  // that sits still at the start of a piece and still never repeats a bar.
  sr_bass_oct_wander: fig('sr_bass_oct_wander', 'sustain', 4,
    ['0/1', '3/4', '1/1', '5/4', '2/1', '5/2', '3/1', '7/2'],
    ['R.R+', 'R.R+', 'R.R+', 'R.R+', 'R.R+', 'R.R+', 'R.R+', 'R.R+'],
    [1, 0.7, 0.95, 0.7, 0.95, 0.7, 0.95, 0.7],
    { octave: 1, role: 'bass', legato: true, source: '§2.5 MEASURED attack on titan bars 0-7: two octave strikes a bar, the second landing on beat 4 / 2 / 3 / 3 (the four-bar cycle of the opening). r42 verify pass: that holds in 6 of the 8 bars — bars 2 and 6 carry a third onset and open on a bare root rather than the octave pair' }),

  // MEASURED — Muzan vs Hashiras bars 41-44 (x4, and the same shape at 57-58
  // with 8ths): the push with a FIFTH on beat 3 instead of another root. The
  // fifth is what stops a four-onset bass reading as a drum.
  sr_bass_push5: fig('sr_bass_push5', 'pulse', 1, ['0/1', '3/8', '1/2', '3/4'],
    ['R.R+', 'R+', '5+.R++', 'R+'], [1, 0.7, 0.85, 0.75],
    { octave: 1, role: 'bass', source: '§2.5 MEASURED Muzan vs Hashiras bars 41-44 (x4): octave on 1, root on the & of 2, a fifth-plus-octave DYAD on beat 3 (the r42 verify pass found the dyad; the first cut wrote the fifth alone), root on beat 4' }),

  // MEASURED — Muzan vs Hashiras bars 45-52 (x8, its most repeated bass bar):
  // the 3+3+2 tresillo in dyads. The literature's §4.3 cell, played by a bass.
  sr_bass_332: fig('sr_bass_332', 'pulse', 1, ['0/1', '3/8', '3/4'],
    ['R.R+', 'R+.5+', 'R+.5+'], [1, 0.85, 0.8],
    { octave: 1, role: 'bass', source: '§2.5 MEASURED Muzan vs Hashiras bars 45-52, x10 file-wide: the 3+3+2 cell in the bass, the octave on 1 and root-fifth dyads on the two pushes. (r42 verify pass: x10 rather than the x8 first written, and it is the file\'s SECOND most repeated bass bar — the most repeated is an 8th-note push at x14)' }),

  // MEASURED — Zoltraak bars 11-16 (x4): the root on the downbeat and the
  // FIFTH pumping the remaining 8ths. One moving note, maximum drive.
  // r42 verify pass, CORRECTED twice over: the count is x3, not x4, and every
  // one of those "fifths" is a fifth-plus-octave DYAD in the source.
  sr_bass_fifth_pump: fig('sr_bass_fifth_pump', 'pulse', 1, E8,
    ['R', '5.R+', '5.R+', '5.R+', 'R', '5.R+', '5.R+', '5.R+'], [1, 0.72, 0.72, 0.72, 0.92, 0.72, 0.72, 0.72],
    { octave: 2, role: 'bass', source: '§2.5 MEASURED Zoltraak bars 11-16 (x3): the root on the beat and a fifth-plus-octave dyad on every other 8th' }),

  // MEASURED — A world where the sun never rises bars 66-71 (x7): the octave
  // alternation, low-high-low-high on 8ths. His own r28 words for this shape,
  // about a layer he liked: "low high high low low repeat".
  sr_bass_oct_alt: fig('sr_bass_oct_alt', 'pulse', 1, E8,
    ['R', 'R+', 'R', 'R+', 'R', 'R+', 'R', 'R+'], [1, 0.7, 0.88, 0.7, 0.95, 0.7, 0.88, 0.7],
    { octave: 1, role: 'bass', source: '§2.5 MEASURED A world where the sun never rises bars 66-73 (x8): the octave alternating on 8ths' }),

  // MEASURED — Zoltraak bars 30-42 (x9, its most repeated bass bar): the bass
  // WALKS DOWN inside the bar (root, b7, root, b7, b6) instead of restating the
  // root. His "falling instead of rising", in the bass, from the source.
  // r42 verify pass, CORRECTED: the first cut read the TOP voice at slots 4, 10
  // and 14 and the BOTTOM one at slot 8, which flattened the gesture. The
  // source's top voice turns UP a step before it falls.
  sr_bass_walk_down: fig('sr_bass_walk_down', 'pulse', 1,
    ['0/1', '1/4', '1/2', '5/8', '7/8'],
    ['R.R+', 's7+', 'R++', 's7+', 's6+'], [1, 0.8, 0.85, 0.75, 0.8],
    { octave: 1, role: 'bass', source: '§2.5 MEASURED Zoltraak, x9 file-wide (x6 inside the cited bars 30-42): octave on 1, then b7 UP to the octave and back down through b7 to b6 — a turn, then the descent' }),

  // MEASURED — Solo Leveling ReawakeR bars 1-5 (x5): the bass that never
  // strikes the downbeat — it enters on the & of 1 and syncopates across the
  // bar (slots 2, 4, 7, 10, 12 of 16).
  // r42 verify pass: the first cut omitted slot 0 and its headline said "no
  // downbeat at all". REFUTED — every one of bars 1-5 strikes F#3 on the
  // downbeat; what is missing there is the WEIGHT, because the low pair does
  // not arrive until the & of 1. Six onsets, not five. (Only bar 0, the pickup,
  // has no downbeat at all.)
  sr_bass_offbeat: fig('sr_bass_offbeat', 'pulse', 1,
    ['0/1', '1/8', '1/4', '7/16', '5/8', '3/4'],
    ['R++', 'R+', 'R.R+', 'R.R+', 'R.R+', 'R.R+'], [0.7, 0.8, 1, 0.85, 0.85, 0.9],
    { octave: 1, grid: 16, role: 'bass', source: '§2.5 MEASURED Solo Leveling ReawakeR bars 1-5 (x5): the downbeat is a lone high octave and the bass WEIGHT lands off the beat — the low pair enters on the & of 1 and pushes across the bar' }),

  // =====================================================================
  // r43 — HIS SECOND PATTERN EXPORT. Two of his fourteen notes are the same
  // defect stated twice and it is the most important thing on the page:
  //
  //   cl_cell_neighbor  "I feel like it's not 4/4 - the next chord is always
  //                      coming in like an eight note too soon which should
  //                      happened. this works"
  //   cl_riff_motor16   "should be aligned by measure - the next chord
  //                      shouldn't come in like a half step early"
  //
  // Both were REAL and both were mine, and they are two different bugs that
  // produce the same symptom — a bar whose grid the ear cannot find.
  //
  // (1) THE MOTOR WAS A TRIPLET FIGURE QUANTIZED ONTO A 16TH GRID. Re-measured
  //     off the source at ppq 96: The Raising Fighting Spirit's left hand hits
  //     ticks 0, 96, 128, 160, 192, 256, 320, 352 in every bar from 8 on —
  //     every one an exact multiple of 32, which is a TRIPLET 8th (a quarter is
  //     96). In twelfths of the bar that is 0, 3, 4, 5, 6, 8, 10, 11. r40 wrote
  //     it as sixteenths 0, 4, 5, 7, 8, 11, 13, 15, so five of the eight onsets
  //     sit a third of a sixteenth off, and the last one was pushed from 11/12
  //     to 15/16 — hard against the barline, where the source leaves a gap. His
  //     "half step early" is that last onset, arriving where the next chord is
  //     about to.
  //
  // (2) THE NEIGHBOUR CELL IS HALF OF A TWO-VOICE TEXTURE AND WE DROPPED THE
  //     HALF THAT CARRIES THE METER. Re-measured, attack on titan bars 21-28
  //     sound SIXTEEN sixteenths a bar across two hands: the lower voice is the
  //     five-note neighbour figure at slots 0-4 and 9-13 (r42's transcription is
  //     exact — all twenty events check out), and the UPPER voice is
  //     `sr_pedal_cell` itself, an octave up, striking all sixteen. The cell's
  //     gaps at slots 5-8 and 14-15 are FILLED in the file. Alone, the lower
  //     voice is a 5+4+5+2 grouping whose second group starts a sixteenth after
  //     beat 3 and whose bar ends two sixteenths early — exactly what he
  //     describes. It was never meant to play alone; the r42 lab swapped it into
  //     a slot that plays alone, which is a property of my A/B, not of the file.
  //
  // THE RULE THIS WRITES: a figure that does not tile its own bar names the
  // partner that fills it (`fills`), and the lab sounds them together. A test
  // pins that every r43 ostinato either tiles its bar on its own declared grid
  // or declares a partner.
  //
  // The rest of this block is the other half of his ask — "create a lab where
  // you create more of these and extract more from our energetic MIDI songs to
  // analyze". Mined by counting repeated one-bar cells in three register bands
  // across the serious reference set and the Vocaloid transcription set (52
  // files; the manifest and the counts are in research/cells-r43.md) (984 cells
  // repeated three times or more) on a grid of FORTY-EIGHT, the lowest common
  // multiple of sixteenths and triplet eighths — because after (1) above, a
  // miner that can only see sixteenths is the thing that caused the bug. 84 of
  // those 984 cells are triplet-grid and the library had not one.
  // Each row names its file and its repeat count; where the dialect has no safe
  // token for a pitch the source plays, the row says which note it substitutes.
  // =====================================================================

  // ---- the two corrections -------------------------------------------------

  // MEASURED, and the row `sr_motor16_dyad` should have been. Triplet eighths:
  // 0, 3, 4, 5, 6, 8, 10, 11 of twelve. The downbeat and the half-bar carry a
  // three-note stack (root, fifth, octave) and the rest are the fifth over the
  // octave — r40 wrote `R.5` throughout and dropped the octave entirely.
  sr_motor16_triplet: fig('sr_motor16_triplet', 'pulse', 1,
    ['0/1', '1/4', '1/3', '5/12', '1/2', '2/3', '5/6', '11/12'],
    ['R.5.R+', '5.R+', '5.R+', '5.R+', 'R.5.R+', '5.R+', '5.R+', '5.R+'],
    [1, 0.6, 0.55, 0.62, 0.92, 0.6, 0.55, 0.62],
    { octave: 2, grid: 12, source: '§2.4 MEASURED The Raising Fighting Spirit bars 8+ (x6 of this exact bar, the figure runs unbroken from bar 8): the syncopated motor on TRIPLET eighths — ticks 0/96/128/160/192/256/320/352 at ppq 96, every one an exact multiple of 32. `sr_motor16_dyad` is the same figure quantized onto sixteenths, which is the grid error his "should be aligned by measure" names' }),

  // MEASURED — the complete attack on titan bars 21-28 texture in ONE figure:
  // the neighbour cell in the lower voice and the pedal cell an octave above it,
  // which is what the file plays and what makes the bar legible as 4/4.
  // Sixteen onsets, all sixteen sixteenths, no hole anywhere.
  sr_cell_neighbor_full: fig('sr_cell_neighbor_full', 'arp', 2, S16x2,
    ['R.R+', '3.R+', 's2.3+', '3.5+', 'R.R+', 'R+', '3+', '5+',
      'R+', 'R.R+', '3.3+', 's2.5+', '3.R+', 's4.R+', '3+', '5+',
      'R.R+', '3.R+', 's2.3+', '3.5+', 'R.R+', 'R+', '3+', '5+',
      'R+', 'R.R+', '3.3+', 's2.5+', '3.R+', 's4.R+', '3+', '5+'],
    [0.95, 0.7, 0.6, 0.7, 0.8, 0.6, 0.55, 0.6, 0.55, 0.9, 0.7, 0.6, 0.7, 0.75, 0.55, 0.6,
      0.95, 0.7, 0.6, 0.7, 0.8, 0.6, 0.55, 0.6, 0.55, 0.9, 0.7, 0.6, 0.7, 0.75, 0.55, 0.6],
    { octave: 2, grid: 16, fills: 'sr_cell_neighbor', source: '§2.3 MEASURED attack on titan bars 21-28 (x4 + x4), BOTH VOICES: the lower neighbour figure (slots 0-4 and 9-13) under the pedal cell an octave above it striking all sixteen sixteenths. r42 shipped only the lower voice, which is the half with the holes — his "I feel like it\'s not 4/4". The even bars\' two closing sixteenths are the raised leading tone BELOW the root and the dialect cannot spell a note under its own root, so those keep the upper voice alone' }),

  // ---- the two pitch notes on cards he kept --------------------------------
  // The judged rows stay exactly as he heard them (a keep is a keep); these are
  // the variants his notes describe, so the lab can settle each by ear.

  // "I think steps work for some of them (like the 2nd and third) but not the
  // first and fourth" — sr_cell_step is R s2 3 s4 / R s2 3 5, so the step is on
  // every position. Here the OUTER notes of the beat are chord tones and the
  // step happens between them, which is what a passing tone is (D101).
  ...cellPair('sr_cell_step_ct', ['R', 's2', '3', '5'], ['5', 's4', '3', 'R'],
    'HIS NOTE on cl_cell_step — "steps work for some of them (like the 2nd and third) but not the first and fourth": positions 1 and 4 are chord tones and positions 2 and 3 walk between them, rising on the first bar and falling on the second', { invented: true }),

  // "the second one sounds kinda weird, which I think is just the note you
  // chose" — sr_cell_oct_leap's alternate bar moves its middle note to s4, a
  // fourth struck eight times a bar against a minor chord. This moves it to the
  // fifth instead; everything else is identical.
  ...cellPair('sr_cell_oct_leap_b', ['R', '3', 'R+', '3'], ['R', '5', 'R+', '5'],
    'HIS NOTE on cl_cell_octleap — "the second one sounds kinda weird, which I think is just the note you chose": sr_cell_oct_leap with the alternate bar\'s middle note moved off s4 (a repeated fourth over a minor chord) onto the fifth', { invented: true }),

  // "there could also be variations where the third chord is higher instead of
  // just the chord repeating 3 times. like the second repeat it a different"
  sr_bass_pump_rise: fig('sr_bass_pump_rise', 'pulse', 1, E8,
    ['R', '5.R+', '5.R+', 's6.R+', 'R', '5.R+', '5.R+', 's7.R+'],
    [1, 0.72, 0.72, 0.8, 0.92, 0.72, 0.72, 0.82],
    { octave: 2, role: 'bass', invented: true, source: 'HIS NOTE on cl_bass_pump5 — "there could also be variations where the third chord is higher instead of just the chord repeating 3 times. like the second repeat it a different": sr_bass_fifth_pump with the THIRD repeat of each half lifted, and lifted to a different degree in each half (b6, then b7) so the two halves do not repeat either' }),

  // "like this one - this represents like creative basses - learn from this ->
  // more happy of a vibe though". The Zoltraak walk turns UP to the octave
  // before it falls, which is the heroic half of it. This one only falls: the
  // Aeolian tetrachord, one step a beat, the oldest dark bass there is.
  sr_bass_lament: fig('sr_bass_lament', 'pulse', 1, ['0/1', '1/4', '1/2', '3/4'],
    ['R.R+', 's7+', 's6+', '5+'], [1, 0.8, 0.85, 0.8],
    { octave: 1, role: 'bass', invented: true, source: 'HIS NOTE on cl_bass_walkdown — "this represents like creative basses - learn from this -> more happy of a vibe though": sr_bass_walk_down without the turn up to the octave. Root, b7, b6, 5 — a step a beat down the Aeolian tetrachord (the lament bass, literature §3.8), which is the same descent with the heroic lift taken out' }),

  // ---- MINED: the bass with its own melody --------------------------------
  // HIS NOTE, on four bass cards at once: "of course, can also have its own
  // melody too (think everything you learned from the walking bass stuff). also
  // depends on the chord progression". Every r42 bass row is a RHYTHM on one or
  // two pitches; these are the corpus's LINES. Of 251 mined low-band cells that
  // repeat 3+ times, these carry three or more distinct scale degrees in the
  // line (an octave double is not a move).

  // the cleanest walking archetype in the whole mine: four beats, four
  // different scale degrees, nothing repeated.
  sr_bass_walk4: fig('sr_bass_walk4', 'pulse', 1, ['0/1', '1/4', '1/2', '3/4'],
    ['R', '5', '3', 's7'], [1, 0.8, 0.85, 0.8],
    { octave: 1, role: 'bass', source: 'MEASURED Two Breaths Walking (二息歩行) x16: root, fifth, minor third, minor seventh — one distinct degree per beat, the corpus\'s plainest walking bass' }),

  // the same idea with a rhythm: eight onsets, six of them moving.
  sr_bass_line_arp: fig('sr_bass_line_arp', 'pulse', 1,
    ['0/1', '1/8', '1/4', '3/8', '1/2', '11/16', '3/4', '7/8'],
    ['R', '5', '5.R+.3+', '3', 's4', 'R+', 'R+.s4+', 's4'],
    [1, 0.75, 0.85, 0.7, 0.8, 0.72, 0.85, 0.75],
    { octave: 1, grid: 16, role: 'bass', source: 'MEASURED Mousou Kanshou Daishou Renmei x16: a bass that arpeggiates its own line — root, fifth, a three-note stack, third, fourth, octave, octave-plus-fourth, fourth. The source\'s major third is spelled `3` (the chord\'s own third) so the row cannot write a major third over a minor chord' }),

  // the most repeated low cell in the entire mine (x45 in one file, x71 with
  // its downbeat variant): the root and fifth, syncopated, no downbeat at all.
  sr_bass_synco_root5: fig('sr_bass_synco_root5', 'pulse', 1,
    ['1/8', '1/4', '1/2', '5/8', '3/4', '7/8'],
    ['R', '5', 'R', 'R', '5', 'R'], [0.95, 0.8, 0.9, 0.7, 0.8, 0.7],
    { octave: 1, grid: 16, source: 'MEASURED Rolling Girl (ローリンガール) x45 — the single most repeated low-band bar in the 52-file mine: root and fifth with NO downbeat, the bass entering on the & of 1 every bar', role: 'bass' }),

  // the same shape with the downbeat struck — the pair is an A/B on one note.
  sr_bass_synco_down: fig('sr_bass_synco_down', 'pulse', 1,
    ['0/1', '1/4', '3/8', '5/8', '3/4', '7/8'],
    ['R', '5', 'R', 'R', '5', 'R'], [1, 0.8, 0.75, 0.8, 0.8, 0.7],
    { octave: 1, grid: 16, role: 'bass', source: 'MEASURED Ghost Rule x26: the same root-and-fifth syncopation as sr_bass_synco_root5 with the downbeat struck and the second push pulled to the & of 2 — the two rows differ on where the weight of bar one lands' }),

  // ---- MINED: the triplet grid, which the library did not have -------------

  // twelve triplet eighths, and a contour rather than a pulse.
  sr_ost_shuffle_run: fig('sr_ost_shuffle_run', 'arp', 1,
    ['0/1', '1/12', '1/6', '1/4', '1/3', '5/12', '1/2', '7/12', '2/3', '3/4', '5/6', '11/12'],
    ['R', 'R', 'R', 's2', 'R', 'R', '5', 's4', '3', 's4', '3', 's2'],
    [1, 0.62, 0.68, 0.68, 0.88, 0.62, 0.85, 0.68, 0.75, 0.68, 0.75, 0.7],
    { octave: 2, grid: 12, source: '§2.4 MEASURED The Raising Fighting Spirit x10: the mid-register line on all twelve TRIPLET eighths — three roots, a step up, two roots, then a fall from the fifth through the fourth and third. The one continuous triplet ostinato in the reference set (D102\'s 12-onset gear-change clause is for hash-picked travel destinations, not a named opt-in layer — the same exemption `sr_pedal_cell` takes at 16)' }),

  // a triplet RIFF: eight of twelve, dyads on the offbeats.
  sr_riff_tri_dyad: fig('sr_riff_tri_dyad', 'pulse', 1,
    ['0/1', '1/6', '1/4', '5/12', '1/2', '2/3', '3/4', '11/12'],
    ['5', 's4', 'R.s4', '3', 'R.s4', 's4', 'R.s4', '3'],
    [1, 0.7, 0.85, 0.7, 0.9, 0.7, 0.85, 0.7],
    { octave: 3, grid: 12, source: 'MEASURED Mind Brand (マインドブランド) x11: a triplet-eighth riff, root-plus-fourth dyads alternating with single notes. The source also sounds the note a tritone above its own root as a passing tone; the dialect has no token that spells a tritone in key, so that note is written as the scale\'s fourth and this is the one pitch here the row does not carry' }),

  // ---- MINED: riffs and stabs ---------------------------------------------

  // his "falling instead of rising" WITH a source this time. r42 had to mark
  // `sr_gallop_fall` invented because the file it claimed refused to descend;
  // this one descends in the file, octave-doubled the whole way.
  sr_riff_run_down: fig('sr_riff_run_down', 'arp', 1,
    ['0/1', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    ['R+.R++', '5.5+', 's4.s4+', '3.3+', 's2.s2+', 'R.R+', 'R.R+'],
    [1, 0.8, 0.72, 0.8, 0.72, 0.88, 0.7],
    { octave: 2, grid: 16, source: 'MEASURED get_proto-6 x12: an octave-doubled descending run — octave, fifth, fourth, third, second, root, root. HIS "falling instead of rising", measured, where r42\'s sr_gallop_fall had to be marked invented. The source passes through the sharpened fourth between the fifth and the fourth; the row writes the scale\'s fourth for both' }),

  // three and three: the plainest riff in the serious set, and it is Muzan.
  sr_riff_three_two: fig('sr_riff_three_two', 'pulse', 1,
    ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8'],
    ['s2', 's2', 's2', 'R', 'R', 'R'], [1, 0.75, 0.8, 0.95, 0.75, 0.8],
    { octave: 3, source: '§2.4 MEASURED Muzan vs Hashiras x13: six eighths, three on the second degree and three on the root, then the second half of the bar rests. A riff that ANSWERS and stops, which is the shape the engine never writes' }),

  // the power chord, which this engine has also never written.
  sr_riff_power: fig('sr_riff_power', 'block', 1, ['0/1', '1/2', '3/4'],
    ['R.5.R+', 'R.5.R+', 'R.5.R+'], [1, 0.9, 0.85],
    { octave: 3, source: 'MEASURED USSEEWA (うっせぇわ) x12: root-fifth-octave stacks on beats 1, 3 and 4 and nothing else in the bar' }),

  // D98's "see how the chord is four notes not your typical chord", as a riff:
  // four-note stabs off the beat with the voicing rotating between them.
  sr_stabs_four: fig('sr_stabs_four', 'block', 1,
    ['1/8', '1/4', '3/8', '1/2', '3/4', '7/8'],
    ['3.5.s7.R+', 'R.3.5.R+', 'R.5.R+.3+', 'R.3.5.R+', 'R.3.5.R+', 'R.5.R+.3+'],
    [0.9, 1, 0.8, 0.9, 0.9, 0.8],
    { octave: 3, grid: 16, source: 'MEASURED Eh Ah, Sou (え？あぁ、そう) x8 for the RHYTHM — six offbeat stabs, none on the downbeat — and the source does strike four-note stacks there. The voicings are the engine\'s own rotation (D98: an inversion is token ORDER), so the rhythm is measured and the chords are not' }),

  // an inner pedal: one repeated degree, syncopated, the root joining it late.
  sr_ost_inner_pedal: fig('sr_ost_inner_pedal', 'pulse', 1,
    ['1/8', '1/4', '3/8', '5/8', '3/4', '7/8'],
    ['s4', 's4', 's4', 's4', 'R.s4', 's4'], [0.9, 0.8, 0.75, 0.8, 0.95, 0.72],
    { octave: 3, grid: 16, partial: 'a layer that strikes beat 3', source: 'MEASURED The Lost One\'s Weeping (ロストワンの号哭) x12: an inner voice repeating one degree off the beat with a hole on beat 3 and the root joining it on beat 4 — tension held by repetition rather than by dissonance' }),
};

// ---------------------------------------------------------------- stacks
// §2.4 — THE ENTRY SCHEDULE, which is the thing he actually pointed at ("in
// attack on titan you can literally see them come in one by one"). A stack is an
// ORDERED list of entries; each names the layer, the TUNE SECTION it enters at
// (0 = the first section that carries the tune; -1 = the intro, before the tune),
// the figure it plays, the register, and its gain as a FRACTION OF THE LEAD's
// (never a number — D77 is relative, and the literature agrees: "the doubling
// must be quieter than the main line").
//
// A layer entering STAYS until the end unless `until` names a tune section.
// Layer kinds:
//   'figure'      a bound figure (ostinato / stabs / pad / gallop / bass)
//   'themeOctave' the theme itself, an octave BELOW the lead, on another sound
//   'themeThird'  the theme in parallel thirds/sixths below, on another sound
// Both theme kinds are "the same notes with an interval tweak or an octave
// tweak" — his own description of the support he wants.
const stack = (name, entries, source) => ({ name, entries, source, pack: 'serious-r40' });
// r43 — THE COMBINATION LAB'S STACK (audition/mixlab.html). HIS ASK, verbatim:
//
//   "next lab, allow me to combine different layers by enabling multiple at a
//    time, then press something to leave a note either individually for that
//    song or for the group, and i can do this multiple times with an extensive
//    list with a diversity of serious ones"
//
// EVERY ENTRY IS `at: -1`. A combination lab's whole contract is that the set
// of sounding layers is the set of TICKED layers, so an entry schedule — the
// thing sr_stack_titan exists to express — would make the page lie. The build
// is what the OTHER labs test; this one tests what goes WITH what.
//
// WITHIN A GROUP EVERY LAYER SHARES ITS VOICE, ACROSS GROUPS THEY DIFFER. That
// is the only way both halves of his ask work at once: swapping one cell for
// another has to be a pure pattern A/B (D139 — a card whose variants move more
// than one variable is not an A/B), while a combination has to be legible as
// separate parts, which is REGISTER and TIMBRE and not rhythm (D102). The one
// deliberate exception is the `acc` group, which holds one figure on four
// different voices; it is a VOICE test and the page says so.
//
// Ids are the slot names `seriousSpec` resolves sounds by, so every id here has
// an entry in the page's `sounds` map.
const mixlabEntry = (id, fig, octave, gain) => ({ kind: 'figure', id, fig, at: -1, octave, gain });
export const SERIOUS_STACKS = {
  // the Attack on Titan build, as measured: pedal cell alone → theme + octave
  // bass → sustained chords → the tune doubled at the octave + the riff →
  // the third double on the last chorus
  sr_stack_titan: stack('sr_stack_titan', [
    { kind: 'figure', id: 'ost', fig: 'sr_pedal_cell', at: -1, octave: 2, gain: 0.42 },
    { kind: 'figure', id: 'bass', fig: 'sr_octave_bass_hold', at: 0, octave: 1, gain: 0.52 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 1, octave: 3, gain: 0.34 },
    { kind: 'themeOctave', id: 'theme8', at: 2, gain: 0.48 },
    { kind: 'figure', id: 'riff', fig: 'sr_gallop', at: 2, octave: 3, gain: 0.46 },
    { kind: 'figure', id: 'push', fig: 'sr_bass_push', at: 3, octave: 1, gain: 0.5 },
    { kind: 'themeThird', id: 'theme3', at: 4, gain: 0.45 },
    // r41/D146 — THE FIGURE HIS REFERENCE REPEATS MOST WAS IN THE LIBRARY AND
    // THE STACK NAMED AFTER THAT REFERENCE NEVER SELECTED IT. Re-measured by
    // counting repeats of every one-bar cell in the file rather than reading
    // bars by eye: attack on titan's most frequent cell, x16 and the top cell
    // of the whole piece, is the LEFT HAND striking an OCTAVE at 16th-slots 0,
    // 6, 8, 14. That is `sr_bass_push` exactly — already encoded in r40, its
    // own source note already says "attack on titan bars 68+" — and this stack
    // was playing `sr_octave_bass_hold`, one onset a bar, instead. His cards:
    // "need more energetic layer patterns (like the ones in attack on titan)"
    // (x3) and "i dont hear much bass".
    //
    // The source does BOTH, sectionally: the octave is HELD through bars 0-7
    // and PUSHES from bar 68. So this is an entry in the build, not a swap —
    // the pedal stays, and the push arrives on top of it later. That is also
    // why it is `push` and not a second `bass`: the one-moving-bass rule still
    // holds, because the pedal is not a moving part.
  ], '§2.4 attack on titan: 20 texture events over 104 bars, one every ~5 bars'),

  // the battle stack: the syncopated motor under answering block chords
  // (Naruto / Muzan), the tune doubled at the octave from the first chorus
  sr_stack_battle: stack('sr_stack_battle', [
    { kind: 'figure', id: 'ost', fig: 'sr_motor16_dyad', at: -1, octave: 2, gain: 0.46 },
    { kind: 'figure', id: 'stabs', fig: 'sr_answer_stabs', at: 0, octave: 3, gain: 0.5 },
    { kind: 'themeOctave', id: 'theme8', at: 1, gain: 0.48 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 2, octave: 3, gain: 0.32 },
    { kind: 'figure', id: 'bass', fig: 'sr_bass_push', at: 2, octave: 1, gain: 0.52 },
    { kind: 'themeThird', id: 'theme3', at: 4, gain: 0.45 },
  ], '§2.4 The Raising Fighting Spirit bar 8+ / Muzan vs Hashiras: a 16th motor under four-note answering chords'),

  // the additive stack (Interstellar): one cell, a layer per repeat, nothing
  // ever removed, no percussion. The theme enters HELD and only later moves.
  sr_stack_additive: stack('sr_stack_additive', [
    // octave 3, not the reference's 4: measured on the first build, the organ
    // realized a median of 73 against sr_expanse's lead at 68 — a SUSTAINED
    // layer over the tune, which Belkin says dominates a staccato one at equal
    // dynamics. Same call, same reason, as the r30 rise (D120).
    { kind: 'figure', id: 'ost', fig: 'sr_osc_third', at: -1, octave: 3, gain: 0.4 },
    { kind: 'figure', id: 'bass', fig: 'sr_octave_bass_hold', at: 0, octave: 1, gain: 0.5 },
    { kind: 'themeOctave', id: 'theme8', at: 1, gain: 0.45 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 2, octave: 3, gain: 0.3 },
    { kind: 'figure', id: 'arp', fig: 'sr_calm_arp16', at: 3, octave: 3, gain: 0.36 },
  ], '§2.4/§3.7 Interstellar: the 4-bar cell repeated with a layer added per repeat, the harmony unchanged'),

  // ---------------------------------------------------------------- r42 LAB
  // THE PATTERN LAB (audition/cells.html). His "I want to hear them
  // individually and variations of them for the energetic songs": the slot
  // under test enters ALONE in the intro — which is how attack on titan itself
  // introduces its cell (bars 9-20, the left hand with nothing else) — and the
  // rest of the build enters on top of it one section at a time. Every card on
  // the page uses one of these two stacks and differs ONLY in the figure the
  // tested slot plays (`serious.figures`), so the card IS the pattern.
  sr_stack_lab_cell: stack('sr_stack_lab_cell', [
    { kind: 'figure', id: 'ost', fig: 'sr_pedal_cell', at: -1, octave: 2, gain: 0.55 },
    { kind: 'figure', id: 'bass', fig: 'sr_octave_bass_hold', at: 0, octave: 1, gain: 0.5 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 1, octave: 3, gain: 0.34 },
    { kind: 'themeOctave', id: 'theme8', at: 2, gain: 0.48 },
  ], 'r42 lab: the CELL slot alone in the intro (attack on titan bars 9-20 does exactly this), then bass, then chords, then the theme doubled an octave below'),
  sr_stack_lab_bass: stack('sr_stack_lab_bass', [
    { kind: 'figure', id: 'bass', fig: 'sr_bass_push', at: -1, octave: 1, gain: 0.62 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 0, octave: 3, gain: 0.34 },
    { kind: 'figure', id: 'ost', fig: 'sr_pedal_cell', at: 1, octave: 2, gain: 0.42 },
    { kind: 'themeOctave', id: 'theme8', at: 2, gain: 0.48 },
  ], 'r42 lab: the BASS slot alone in the intro, then chords, then the cell, then the theme doubled an octave below'),

  // r42 — the RIFF group's bed. VERIFY CATCH (D147): the riff figures seat an
  // octave-plus above the cell ones, so with the form's own bass stood down the
  // only low layer left was the held pedal — measured, three of the four riff
  // cards carried 7.6-9.7x LESS summed gain under midi 48 than the cell control
  // and 34-77% of their notes landed inside the lead trumpet's own realized
  // range. Thin at the bottom and crowding the tune, which is a property of my
  // bed and not of the pattern he is being asked to judge.
  //
  // The source pairs them itself: attack on titan's chorus riff (bars 68-83)
  // plays OVER the octave push, not over a pedal. So the riff stack carries
  // `sr_bass_push` from the first tune section.
  // r43 — the combination lab. 38 layers, every one of them at -1.
  sr_stack_mixlab: stack('sr_stack_mixlab', [
    // ---- CELL: the mid-register ostinato he named in r42, and every variant
    mixlabEntry('cell_orig', 'sr_pedal_cell', 2, 0.5),
    mixlabEntry('cell_fall', 'sr_cell_fall', 2, 0.5),
    mixlabEntry('cell_return', 'sr_cell_root_return', 2, 0.5),
    mixlabEntry('cell_arch', 'sr_cell_arch', 2, 0.5),
    mixlabEntry('cell_step', 'sr_cell_step', 2, 0.5),
    mixlabEntry('cell_step_ct', 'sr_cell_step_ct', 2, 0.5),
    mixlabEntry('cell_open5', 'sr_cell_open5', 2, 0.5),
    mixlabEntry('cell_octleap', 'sr_cell_oct_leap', 2, 0.5),
    mixlabEntry('cell_octleap_b', 'sr_cell_oct_leap_b', 2, 0.5),
    mixlabEntry('cell_pairs', 'sr_cell_pairs', 2, 0.5),
    mixlabEntry('cell_neighbor', 'sr_cell_neighbor', 2, 0.5),
    mixlabEntry('cell_neighbor_full', 'sr_cell_neighbor_full', 2, 0.5),
    mixlabEntry('cell_shuffle', 'sr_ost_shuffle_run', 2, 0.5),
    mixlabEntry('cell_pedal4', 'sr_ost_inner_pedal', 3, 0.44),
    // ---- THE SAME CELL AN OCTAVE UP ON A VIOLIN. HIS ASK, verbatim: "along
    // with cello there should also be a repeat on violin like an octave up or
    // something because its all strings." One entry per cell so the doubling is
    // itself a checkbox — the cell alone and the cell as a SECTION are the
    // comparison, and a rider whose interval cannot be switched off is not
    // something his ear can rule on. Octave 3 against the cell's 2, and under
    // it in gain: the double is support (D77, and Belkin — "the doubling must
    // be quieter than the main line").
    mixlabEntry('vln_orig', 'sr_pedal_cell', 3, 0.34),
    mixlabEntry('vln_fall', 'sr_cell_fall', 3, 0.34),
    mixlabEntry('vln_return', 'sr_cell_root_return', 3, 0.34),
    mixlabEntry('vln_arch', 'sr_cell_arch', 3, 0.34),
    mixlabEntry('vln_step', 'sr_cell_step', 3, 0.34),
    mixlabEntry('vln_step_ct', 'sr_cell_step_ct', 3, 0.34),
    mixlabEntry('vln_open5', 'sr_cell_open5', 3, 0.34),
    mixlabEntry('vln_octleap', 'sr_cell_oct_leap', 3, 0.34),
    mixlabEntry('vln_octleap_b', 'sr_cell_oct_leap_b', 3, 0.34),
    mixlabEntry('vln_pairs', 'sr_cell_pairs', 3, 0.34),
    mixlabEntry('vln_neighbor', 'sr_cell_neighbor', 3, 0.34),
    mixlabEntry('vln_neighbor_full', 'sr_cell_neighbor_full', 3, 0.34),
    mixlabEntry('vln_shuffle', 'sr_ost_shuffle_run', 3, 0.34),
    // ---- BASS
    mixlabEntry('bass_push', 'sr_bass_push', 1, 0.58),
    mixlabEntry('bass_hold', 'sr_octave_bass_hold', 1, 0.58),
    mixlabEntry('bass_oct8', 'sr_bass_oct8ths', 1, 0.58),
    mixlabEntry('bass_wander', 'sr_bass_oct_wander', 1, 0.58),
    mixlabEntry('bass_push5', 'sr_bass_push5', 1, 0.58),
    mixlabEntry('bass_332', 'sr_bass_332', 1, 0.58),
    mixlabEntry('bass_pump5', 'sr_bass_fifth_pump', 2, 0.58),
    mixlabEntry('bass_pump_rise', 'sr_bass_pump_rise', 2, 0.58),
    mixlabEntry('bass_octalt', 'sr_bass_oct_alt', 1, 0.58),
    mixlabEntry('bass_walkdown', 'sr_bass_walk_down', 1, 0.58),
    mixlabEntry('bass_lament', 'sr_bass_lament', 1, 0.58),
    mixlabEntry('bass_offbeat', 'sr_bass_offbeat', 1, 0.58),
    mixlabEntry('bass_walk4', 'sr_bass_walk4', 1, 0.58),
    mixlabEntry('bass_line', 'sr_bass_line_arp', 1, 0.58),
    mixlabEntry('bass_synco', 'sr_bass_synco_root5', 1, 0.58),
    mixlabEntry('bass_synco_dn', 'sr_bass_synco_down', 1, 0.58),
    // ---- RIFF
    mixlabEntry('riff_gallop', 'sr_gallop', 3, 0.46),
    mixlabEntry('riff_fall', 'sr_gallop_fall', 3, 0.46),
    mixlabEntry('riff_motor16', 'sr_motor16_dyad', 2, 0.46),
    mixlabEntry('riff_motor_tri', 'sr_motor16_triplet', 2, 0.46),
    mixlabEntry('riff_tri_dyad', 'sr_riff_tri_dyad', 3, 0.46),
    mixlabEntry('riff_rundown', 'sr_riff_run_down', 2, 0.46),
    mixlabEntry('riff_three_two', 'sr_riff_three_two', 3, 0.46),
    mixlabEntry('riff_power', 'sr_riff_power', 3, 0.46),
    // ---- STABS (brass answers — a different register and a different job)
    mixlabEntry('stabs_332', 'sr_stabs_332', 3, 0.46),
    mixlabEntry('stabs_four', 'sr_stabs_four', 3, 0.46),
    mixlabEntry('stabs_answer', 'sr_answer_stabs', 3, 0.46),
    // ---- PAD
    mixlabEntry('pad', 'sr_chorale_rotate', 3, 0.34),
    // ---- ACC: ONE figure, four voices. The deliberate exception to the
    // same-voice rule above, because this group is his six-times-repeated note
    // ("the pitched percussion in the harmony should be replaced with another
    // instrument") and the variable there IS the instrument.
    mixlabEntry('acc_piano', 'sr_chorale_rotate', 3, 0.4),
    mixlabEntry('acc_guitar', 'sr_chorale_rotate', 3, 0.4),
    mixlabEntry('acc_strings', 'sr_chorale_rotate', 3, 0.4),
    mixlabEntry('acc_epiano', 'sr_chorale_rotate', 3, 0.4),
    // ---- THEME doubles
    { kind: 'themeOctave', id: 'theme8', at: -1, gain: 0.48 },
    { kind: 'themeThird', id: 'theme3', at: -1, gain: 0.45 },
  ], 'r43 combination lab: every layer in the serious inventory, all entering at once, for him to tick on and off in any combination'),

  sr_stack_lab_riff: stack('sr_stack_lab_riff', [
    { kind: 'figure', id: 'ost', fig: 'sr_gallop', at: -1, octave: 3, gain: 0.55 },
    { kind: 'figure', id: 'bass', fig: 'sr_bass_push', at: 0, octave: 1, gain: 0.55 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 1, octave: 3, gain: 0.34 },
    { kind: 'themeOctave', id: 'theme8', at: 2, gain: 0.48 },
  ], 'r42 lab: the RIFF slot alone in the intro, then the octave push the source plays it over, then chords, then the theme doubled an octave below'),

  // serious CALM (his "romantic waters / nostalgic snow / the layerstack song,
  // that was serious calm which i really liked"): the arpeggio first, the theme
  // held over it, a low octave bass, chorale chords last. No riff, no stabs.
  sr_stack_calm: stack('sr_stack_calm', [
    { kind: 'figure', id: 'arp', fig: 'sr_calm_arp16', at: -1, octave: 3, gain: 0.4 },
    { kind: 'figure', id: 'pad', fig: 'sr_chorale_rotate', at: 0, octave: 3, gain: 0.3 },
    { kind: 'figure', id: 'bass', fig: 'sr_octave_bass_hold', at: 1, octave: 1, gain: 0.46 },
    { kind: 'themeOctave', id: 'theme8', at: 3, gain: 0.42 },
  ], '§3.7 the Interstellar calm build + his three calm references (no drums, no bass instrument early)'),
};

/**
 * r40 — the THEME WRITER's defaults (§2.2). The measured theme runs 1.6–3.2
 * notes a bar whatever the tempo, 15–54% dotted values, phrases starting on a
 * beat, an early peak and large leaps. These are the numbers the vocal writer's
 * `theme` mode is set to; a row may override either.
 */
export const SERIOUS_THEME = { notesPerBar: 2.5, dotted: 0.4 };

// ===========================================================================
// r44 — HIS COMBINATION-LAB RULINGS (audition/mixlab.html, 2026-09-14)
// ===========================================================================
// Three notes, and they are RULINGS rather than complaints — the lab exists to
// ask "what goes with what" and these are his answers, each recorded with the
// exact selection that was sounding (verdicts.js COMBO_NOTES):
//
//   [5 +8ve violin variants ticked] "you can layer just about anything to
//     achieve the energetic serious vibe, just dont overlay (comes up to be
//     greater than 3) but anything works"
//   [7 bass variants ticked] "you can just about layer any of these together,
//     but I found that bass melodies like the zoltraak one sound really good.
//     but each of these serve as good backbone"
//   [3 cell variants ticked] "…this group volume should be reduced"
//
// ---------------------------------------------------------------------------
// 1. THE POOL. His r41 note on sr_resolve said the other half of this already:
// "im sure there are more patterns for you to use than the one in the beginning
// - you've used that for like 3-5 songs already". Measured: it is FOUR songs.
// Every stack names its figure as a STRING LITERAL, and D119's law is explicit
// that "when a generator names a library entry as a string literal, that IS a
// pool of one" — 11 shipped songs draw on 3 cells and 2 basses out of a library
// of 16 cells and 16 basses, and the melodic basses he has now twice asked for
// (r43 "of course, can also have its own melody too", r44 "bass melodies like
// the zoltraak one sound really good") were reachable from NO song.
//
// MEMBERSHIP IS HIS CLICKS, not the library (D95 — only ratified entries enter
// a retrieval pool). Every row below carries a keep from audition/cells.html
// (21 of 23 cards) or was ticked and praised in the combination lab; the
// unratified r43 mine (walk4, line_arp, synco_root5, synco_down, the triplet
// riffs, the four-note stabs) stays out until a card of its own is judged.
//
// THE POOLS ARE LITERAL ARRAYS, so adding a row to SERIOUS_FIGURES cannot
// re-roll a song — only editing a pool can, and that is a deliberate act with a
// blast radius to check (D95). Slots are addressed by name; nothing iterates.
export const SERIOUS_POOLS = {
  // the CELL slot. All nine cell cards on audition/cells.html were judged: seven
  // keeps, `cl_cell_fall` a prose keep ("works"), and `cl_cell_orig`'s only note
  // is about its VOICE ("I dont think the vibraphone conveys tense or fight at
  // all" — D148 §3), not its pattern. `sr_cell_neighbor` is excluded on purpose:
  // it is `partial`, it does not tile its own bar, and playing it without the
  // partner that fills it is exactly the defect he heard in r43.
  ost: ['sr_pedal_cell', 'sr_cell_fall', 'sr_cell_root_return', 'sr_cell_arch',
    'sr_cell_step', 'sr_cell_open5', 'sr_cell_oct_leap', 'sr_cell_pairs'],
  // NO `motor` POOL, and the membership test is what caught it. The obvious
  // second member is `sr_motor16_triplet`, D148's corrected grid for the row he
  // kept — but a correction is not a verdict: D148 itself says straight-versus-
  // swung is an ear question, so the triplet has never been judged and D95 says
  // an unratified entry does not enter a retrieval pool. It is already on the
  // combination lab as `riff_motor_tri`; when he rules on it this becomes a
  // pool of two. Until then the battle stack's ostinato keeps its literal.
  // the PEDAL bass — the one that sits still. Both keeps, and both are the
  // "a bass that sits still and still never repeats a bar" shape (D146).
  bass: ['sr_octave_bass_hold', 'sr_bass_oct_wander'],
  // the MOVING bass. "each of these serve as good backbone" is the licence for
  // the pool; "bass melodies like the zoltraak one sound really good" is the
  // LEAN, and it is spelled as a repeated entry rather than a weight table so
  // the pick stays one modulo and the bias is readable: the two lines that walk
  // (Zoltraak's own `sr_bass_walk_down` and its lament sibling) appear twice, so
  // a melodic bass lands on 4 of 11 rotations instead of 2.
  push: ['sr_bass_walk_down', 'sr_bass_walk_down', 'sr_bass_lament', 'sr_bass_lament',
    'sr_bass_push', 'sr_bass_push5', 'sr_bass_332', 'sr_bass_oct8ths',
    'sr_bass_oct_alt', 'sr_bass_fifth_pump', 'sr_bass_offbeat'],
  // the RIFF slot — the three riff cards he kept. (`cl_riff_motor16` is the
  // battle stack's ostinato and lives in `motor`.)
  riff: ['sr_gallop', 'sr_gallop_fall', 'sr_stabs_332'],
};

// 2. THE OVERLAY CAP. "just dont overlay (comes up to be greater than 3)",
// written twice, both times over a selection of ONE group — five +8ve violins
// on one voice at one octave, then three cells. Within a group every layer
// shares its voice and register by the lab's own construction, so what he is
// capping is same-voice stacking, which is the shape D100 already calls one
// layer ("two layers that always strike together on one instrument are one
// layer") and D102 says is separated by REGISTER and TIMBRE, never by rhythm.
// Read as a total-layer cap it would contradict his own standing ask for more
// layers and the r40 measurement (his references carry 2.89–5.94 simultaneous
// notes); read per group it is a mechanism. A test pins it over every stack.
export const OVERLAY_CAP = 3;

// 3. D77 ON ENERGY, NOT ON THE NOTE — "this group volume should be reduced".
// Every support layer on the judged serious page PASSES the per-note check
// (the ostinato runs 0.20–0.53x the lead's per-note gain, median 0.44) while
// its per-BAR energy — gain x onsets, which is what an ear integrates — runs
// 2.88–3.33x the lead over the bars where both sound. His own boundary is in
// the lab: the group he complained about measured 3.77x the lead's energy and
// the +8ve violin group he did not measured 2.55x.
//
// The cap is stated in the lead's own units, like every other gain here, and
// `e.gain x onsetsPerBar / leadNotesPerBar` predicts the measured ratio within
// 6% on all nine songs, so it can be applied at build time.
export const SUPPORT_ENERGY_CAP = 2.5;

/**
 * the density half of the energy: STRIKES per bar, each weighted by the square
 * root of how many notes it sounds.
 *
 * Neither raw count works, and his verdicts are what settle it. Counting NOTES
 * puts the battle stack's `sr_motor16_dyad` (8 strikes, 16 notes) in the same
 * band as the single-note 16th cell, and his ear separates those: the cell
 * group is the one he asked to reduce, while the songs running the dyad motor
 * got "need more energetic layer patterns" — the opposite complaint. Counting
 * STRIKES alone ignores that a strike can sound three notes.
 *
 * Equal power is the middle a chord actually occupies — one gesture, not one
 * note, but not free either — and it reproduces both of his rulings: the cell
 * at 0.5 is over the cap, the +8ve violin at 0.34 and the dyad motor at 0.46
 * are under it.
 *
 * VERIFY-PASS CORRECTION, and it refutes this rule's first justification. That
 * justification said the weighting was needed to catch `sr_motor16_triplet`,
 * which measured 3.74x the lead on sr_march "past a cap that measured it at
 * 2.21". Re-measured at its in-use gain of 0.46 the weighted figure is **2.199
 * — still under the cap**, so equal power does NOT catch that case; the 3.74
 * came from summing haps, which is the note-counting error this very rule
 * rejects. The weighting stands on the reasoning above, not on that example,
 * and the example is moot anyway: the triplet is unratified and out of the
 * pool, so nothing draws it.
 */
export const figurePerBar = (f) => (f?.onsets?.length ?? 0) && (f.figure ?? [])
  .reduce((a, tok) => a + Math.sqrt(String(tok).split('.').length), 0) / (f.bars || 1);

/** fnv-1a, the same hash arrange.js, bind.js and every other pool here use. */
const fnvHash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

/**
 * r44 — rotate a stack's figure slots through their pools for ONE song.
 *
 * Returns the `figures` override map `seriousSpec` already accepts (r42), so
 * this adds no new path into the binder: an unknown name still throws at build
 * time and an overridden figure still brings its own register.
 *
 * OPT-IN PER PAGE (`serious.rotate`), and the labs are why. Both lab pages
 * build every card under ONE shared name (D120 — an A/B built under two names
 * is testing the names), so a per-song history check sees no history there:
 * the first build re-rolled 14 of the 23 judged cards on audition/cells.html
 * and 26 of the 64 layers on the combination lab, where a checkbox labelled
 * "the one you have (R R b3 5)" would then have played something else. A page
 * whose cards NAME their figure must never rotate; a song page asks for it.
 *
 * A SLOT ROTATES INSIDE THE POOL ITS OWN FIGURE BELONGS TO, not inside the one
 * named after it — the battle stack calls its moving bass `bass` and the titan
 * stack calls the same role `push`, so keying on the slot id would rotate one
 * and freeze the other. Membership decides; a figure in no pool keeps its
 * literal. Two slots in one stack never land on the same figure — the same cell
 * twice is D100's one-layer-wearing-two-hats, and it would spend the overlay
 * budget on nothing.
 */
export function rotateSeriousFigures(songName, stackName, opts = {}) {
  const st = SERIOUS_STACKS[stackName];
  if (!st) throw new Error(`serious: unknown stack "${stackName}"`);
  const pools = opts.pools ?? SERIOUS_POOLS;
  const poolFor = (figName) => Object.entries(pools)
    .find(([, list]) => list.includes(figName))?.[1] ?? null;
  const out = {};
  const taken = new Set();
  for (const e of st.entries) {
    if (e.kind !== 'figure') continue;
    const pool = poolFor(e.fig);
    if (!pool || !pool.length) { taken.add(e.fig); continue; }
    const start = fnvHash(`${songName}|sr44|${e.id}`) % pool.length;
    let pick = pool[start];
    for (let i = 1; i < pool.length && taken.has(pick); i++) pick = pool[(start + i) % pool.length];
    taken.add(pick);
    if (pick !== e.fig) out[e.id] = pick;
  }
  return out;
}

/** Resolve a page row's `serious` config BY NAME; throws on an unknown name so a
 *  typo cannot silently fall back to a pool pick (the vocaloidFormSpec rule). */
export function seriousSpec(cfg = {}) {
  const get = (table, key, what) => {
    if (key == null) return null;
    const row = table[key];
    if (!row) throw new Error(`serious: unknown ${what} "${key}"`);
    return { name: key, ...row };
  };
  const st = get(SERIOUS_STACKS, cfg.stack ?? 'sr_stack_titan', 'stack');
  // resolve each entry's figure by name here, so an unknown figure throws at
  // build time rather than binding nothing at render time
  // r42 — a row may swap the figure in ONE stack slot without authoring a whole
  // stack: `serious: { figures: { ost: 'sr_cell_fall' } }`. Resolved BY NAME
  // through the same `get`, so a typo throws at build time instead of silently
  // leaving the stack's default in place and shipping the wrong card. An id
  // that is not a figure slot in this stack throws for the same reason.
  const swaps = cfg.figures ?? {};
  for (const id of Object.keys(swaps)) {
    if (!st.entries.some((e) => e.id === id && e.kind === 'figure')) {
      throw new Error(`serious: figure override "${id}" is not a figure slot in stack "${st.name}"`);
    }
  }
  const entries = st.entries.map((e) => {
    if (e.kind !== 'figure') return { ...e, figure: null };
    const swapped = swaps[e.id] ?? null;
    const figure = get(SERIOUS_FIGURES, swapped ?? e.fig, 'figure');
    // An overridden figure brings its OWN register. Each of these rows was
    // measured at a particular octave (the fifth pump is a root-and-fifth line
    // at octave 2; the octave-pair basses are R.R+ at octave 1) and forcing
    // them all to the slot's octave would move half of them out of the band
    // they were transcribed in — which is D118's "an octave parameter is not a
    // register" arriving from the other direction.
    return { ...e, fig: swapped ?? e.fig, figure, ...(swapped && figure.octave != null ? { octave: figure.octave } : {}) };
  });
  return {
    stack: { ...st, entries },
    theme: cfg.theme === false ? null : { ...SERIOUS_THEME, ...(typeof cfg.theme === 'object' ? cfg.theme : {}) },
    // the sounds each stack slot plays on; a row names its own cast
    sounds: {
      ost: 'gm_pizzicato_strings', bass: 'gm_contrabass', pad: 'gm_string_ensemble_1',
      riff: 'gm_lead_2_sawtooth', stabs: 'gm_string_ensemble_1', arp: 'gm_orchestral_harp',
      // r40 verify catch: the themeOctave branch does NOT clamp to the
      // instrument's declared range (its sibling figure branch does), and the
      // -12 shift put 19% of the double's notes BELOW the declared floor of a
      // french horn. In the HQ tier an out-of-range note FOLDS by octaves
      // (D83), which would silently break the octave relationship the layer
      // exists for. The default is a voice whose floor covers leadOctave - 1.
      theme8: 'gm_cello', theme3: 'gm_viola',
      ...(cfg.sounds ?? {}),
    },
    // his "some parts may just be instrumental only though, vocals arent
    // constant … when the vocals arent singing, i notice that the songs give
    // other instruments (sometimes) another melody": tune-section indices where
    // the VOICE rests and an instrument states the theme instead.
    instrumentalAt: Array.isArray(cfg.instrumentalAt) ? cfg.instrumentalAt : [],
    instrumentalSound: cfg.instrumentalSound ?? 'gm_violin',
  };
}
