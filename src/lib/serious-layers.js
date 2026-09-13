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
    { kind: 'themeThird', id: 'theme3', at: 4, gain: 0.45 },
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
  const entries = st.entries.map((e) => ({
    ...e,
    figure: e.kind === 'figure' ? get(SERIOUS_FIGURES, e.fig, 'figure') : null,
  }));
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
