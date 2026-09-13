// r38 — THE VOCALOID FORM: what a Vocaloid song is BUILT from, as named data.
//
// His ask (2026-09-12): "i cloned this branch and want to basically create a
// thing primarily for vocaloid based songs and want it to rock those, but in
// order to that it has to sound good so learn from vocaloid songs."
//
// Everything here was read off the 36-file Vocaloid set (research/
// vocaloid-r38.md, the section numbers below refer to it) and authored BY
// HAND. Rows are addressed BY NAME ONLY — never iterated, never
// length-indexed — so adding a row can never re-roll a song (D95/D119; the
// techniques.js property; a test enforces it on the generator). A page row
// names its verse loop, chorus loop, figures and form; the generator looks
// them up.
//
// Dialect reminders (CLAUDE.md): `^7` is maj7 (never `maj7`); degrees are
// semitone offsets from the tonic with `:quality`; figure tokens R/3/5/s2/s6/
// s7 (+ per octave, dots join chords); onsets are bar-relative fractions.

// ---------------------------------------------------------------- loops
// §3: the chorus has its own loop in 35 of 36 songs; it opens off the tonic in
// 22 of 36 (minor: bIII / v / bVI; major: vi / IV^7); the sus chord is the
// turnaround; vocabulary is triads / sus / m7 / ^7 / 6 — no 9ths, no 13ths.
// Every loop is FOUR chords, one bar each, so a verse loop and a chorus loop
// always share the bar plan (the generator's `plan4` is built from the verse).
const loop = (family, role, degrees, numerals, source) => ({
  family, role, degrees, numerals, source,
  pack: 'vocaloid-r38', provenance: 'r38 read-out (hand-authored from the labeller\'s section loops)',
  ratified: false, needsEar: true, chordUnits: [1, 1, 1, 1],
});
export const VOCALOID_LOOPS = {
  // ---- minor, verse ------------------------------------------------------
  vf_min_verse_i_v_bVI_bVII: loop('minor', 'verse', '0:m 7:m 8 10', 'i v bVI bVII', 'Six Trillion Years verse (×3), the minor axis'),
  vf_min_verse_bVI7_i_v_i: loop('minor', 'verse', '8:^7 0:m 7:m 0:m', 'bVI^7 i v i', 'Hibikase verse'),
  vf_min_verse_i_bVIIsus: loop('minor', 'verse', '0:m 10:sus 0:m7 10', 'i bVIIsus i7 bVII', 'Gimme×Gimme / Toosenbo two-chord vamp'),
  vf_min_verse_i_iv_bVI_v: loop('minor', 'verse', '0:m 5:m 8 7:m', 'i iv bVI v', 'New Darling verse'),
  vf_min_verse_i_bIII7_i_i7: loop('minor', 'verse', '0:m 3:^7 0:m 0:m7', 'i bIII^7 i i7', 'Roki verse'),
  // r39: his "the exact same beginning progression used for all the songs" —
  // two rows (rooftop, lantern) named the SAME verse loop; the wa-rock row
  // takes the descending minor axis (i bVII bVI v, the Senbonzakura-family verse)
  vf_min_verse_i_bVII_bVI_v: loop('minor', 'verse', '0:m 10 8 7:m', 'i bVII bVI v', 'the descending minor axis (Senbonzakura verse family)'),
  // ---- minor, chorus -----------------------------------------------------
  vf_min_chorus_i_bVI7_bVIIsus_bIII7: loop('minor', 'chorus', '0:m 8:^7 10:sus 3:^7', 'i bVI^7 bVIIsus bIII^7', 'Senbonzakura chorus'),
  vf_min_chorus_bIII_bVI_i_v: loop('minor', 'chorus', '3 8 0:m 7:m', 'bIII bVI i v', 'Android Girl chorus (opens on bIII)'),
  vf_min_chorus_v_bVI_bVII6_i: loop('minor', 'chorus', '7:m 8 10:6 0:m', 'v bVI bVII6 i', 'Gimme×Gimme chorus (opens on v)'),
  vf_min_chorus_bVI_v_Isus_bIII6: loop('minor', 'chorus', '8 7:m 0:sus 3:6', 'bVI v Isus bIII6', 'USSEEWA chorus (opens on bVI)'),
  vf_min_chorus_iv7_i_v_bVI7: loop('minor', 'chorus', '5:m7 0:m 7:m 8:^7', 'iv7 i v bVI^7', 'Super Superhero chorus'),
  vf_min_chorus_i_bVI_bIII_bVII: loop('minor', 'chorus', '0:m 8 3 10', 'i bVI bIII bVII', 'the four-chord minor (Lost One\'s / Jigsaw family)'),
  // ---- major, verse ------------------------------------------------------
  vf_maj_verse_I_V_vi_IV: loop('major', 'verse', '0 7 9:m 5', 'I V vi IV', 'Two Breaths Walking / the idol four'),
  vf_maj_verse_vi_IV_vamp: loop('major', 'verse', '9:m 5 9:m 5', 'vi IV vi IV', 'Rolling Girl verse (32 bars of it)'),
  vf_maj_verse_I_vi_bVII_I: loop('major', 'verse', '0 9:m 10 0', 'I vi bVII I', 'Eh? Ah, Sou. verse'),
  vf_maj_verse_I_Isus_V_iii: loop('major', 'verse', '0 0:sus 7 4:m', 'I Isus V iii', 'Hated by Life Itself verse'),
  // ---- major, chorus -----------------------------------------------------
  vf_maj_chorus_royal: loop('major', 'chorus', '5:^7 7:sus 4:m7 9:m7', 'IV^7 Vsus iii7 vi7', 'the royal road (Looking for the Moon chorus, Yoru ni Kakeru)'),
  vf_maj_chorus_vi_I6_IV_V: loop('major', 'chorus', '9:m 0:6 5 7', 'vi I6 IV V', 'Melt chorus'),
  vf_maj_chorus_vi_V_IV_I: loop('major', 'chorus', '9:m 7 5 0', 'vi V IV I', 'Rolling Girl chorus (opens on vi)'),
  vf_maj_chorus_ii7_IV6_vi7_Vsus: loop('major', 'chorus', '2:m7 5:6 9:m7 7:sus', 'ii7 IV6 vi7 Vsus', 'New Genesis chorus'),
  vf_maj_chorus_I_iii_vi_IV7: loop('major', 'chorus', '0 4:m 9:m 5:^7', 'I iii vi IV^7', 'Yoru ni Kakeru chorus family'),
};

// ---------------------------------------------------------------- figures
// §2: verse = a single-note LINE (3 strikes a bar, one note, or nothing);
// chorus = CHORDS ON 8THS (7 strikes a bar, 2 notes a strike) under the tune
// doubled an octave up; intro = a riff of its own (6.5 notes a bar, single
// notes, stepwise); every strike an 8th long. Bass: root–fifth 8ths (chorus,
// 56%), quarters or octave 8ths (verse), midi 39–41.
// REGISTER (measured on the first vocarock build): at octave 4 the hand's
// median sat at 65–77 against a sung lead at 65–71 — above the voice. The
// corpus verse line tops at B4 (p90) UNDER a voice whose median is G#4, so
// the acc figures seat at octave 3; only the intro riff keeps octave 4 (the
// corpus intro top line p90 is 79).
const E8 = ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];
const E8x2 = [...E8, '1/1', '9/8', '5/4', '11/8', '3/2', '13/8', '7/4', '15/8'];
const S16 = Array.from({ length: 16 }, (_, i) => `${i}/16`);
const fig = (name, cls, bars, onsets, figure, accents, extra = {}) => ({
  name, class: cls, bars, grid: 8, meter_class: '4/4', onsets, figure, accents,
  legato: false, pack: 'vocaloid-r38', role: extra.role ?? 'accompaniment', ...extra,
});
export const VOCALOID_FIGURES = {
  // acc (the one chordal hand)
  vf_verse_line: fig('vf_verse_line', 'line', 1, ['0/1', '1/2', '3/4'], ['R', '5', '3'], [0.9, 0.7, 0.75], { octave: 3, source: '§2 verse `line`: 3 strikes/bar, one note, top p90 B4' }),
  vf_verse_arp8: fig('vf_verse_arp8', 'arp', 1, E8, ['R', '5', '3', '5', 'R+', '5', '3', '5'], [0.85, 0.6, 0.7, 0.6, 0.8, 0.6, 0.7, 0.6], { octave: 3, source: '§2 verse `arp8` (11% of verse windows)' }),
  vf_chorus_block8: fig('vf_chorus_block8', 'block', 1, E8, ['3.5', '3.5', 'R+.3+', 'R+.3+', '3.5', '3.5', '5.R+', '5.R+'], [0.95, 0.7, 0.85, 0.7, 0.9, 0.7, 0.85, 0.7], { octave: 3, source: '§2 chorus `block8`: 7 strikes/bar, 2 notes a strike, the tune doubled above (chorusDouble)' }),
  vf_chorus_block4: fig('vf_chorus_block4', 'block', 1, ['0/1', '1/4', '1/2', '3/4'], ['R.3.5', '3.5.R+', 'R.3.5', '3.5.R+'], [0.95, 0.75, 0.9, 0.75], { octave: 3, source: '§2 chorus `block4` (26%)' }),
  vf_bridge_block4: fig('vf_bridge_block4', 'block', 1, ['0/1', '3/8', '1/2', '7/8'], ['R.5', '3.5', 'R.5', '3.5'], [0.9, 0.7, 0.85, 0.7], { octave: 3, source: '§2 mid/bridge: block4 with a tie-over (syncopated 13%)' }),
  vf_intro_riff: fig('vf_intro_riff', 'riff', 2, E8x2,
    ['5', 's6', '5', '3', 'R', 's2', '3', '5', 'R+', 's7', '5', 's6', '5', '3', 's2', 'R'],
    [0.95, 0.7, 0.8, 0.7, 0.9, 0.7, 0.8, 0.7, 0.95, 0.7, 0.8, 0.7, 0.9, 0.7, 0.8, 0.7],
    { octave: 4, source: '§4 the intro is a riff of its own (single notes, stepwise, 6.5/bar) — never the chorus tune' }),
  // r39 — THE INTRO RIFF WAS A POOL OF ONE (D119, fourth instance). His first
  // vocarock export, seven cards of ten: "the exact same beginning progression
  // used for all the songs???". Measured on the judged page: every intro was
  // `vf_intro_riff` on the acc voice over a bass, 12–16 onsets a bar, TWO
  // layers, and 19 of 45 song pairs shared 80%+ of their 8th-by-8th contour
  // over the first four bars (rooftop and lantern were identical — same loop,
  // same riff). The loops differed; the riff, the rhythm, the register and
  // the voice did not, and that is what "the same progression" names. Every
  // row now names its intro figure, its intro VOICE and which loop the intro
  // sits on (`introLoop: 'chorus'` — the chorus loop opens off the tonic).
  vf_intro_arp16: fig('vf_intro_arp16', 'arp', 1, S16,
    ['R', '3', '5', 'R+', '3+', 'R+', '5', '3', 'R', '3', '5', 'R+', '5+', '3+', 'R+', '5'],
    [0.9, 0.55, 0.65, 0.75, 0.6, 0.7, 0.6, 0.55, 0.85, 0.55, 0.65, 0.75, 0.6, 0.7, 0.6, 0.55],
    { octave: 4, source: 'r39: the chip/electro intro — a 16th arpeggio through the chord (corpus chorus `arp16` class)' }),
  vf_intro_hook: fig('vf_intro_hook', 'line', 2, ['0/1', '3/8', '1/2', '3/4', '1/1', '11/8', '3/2', '7/4'],
    ['5', 'R+', 's7', '5', '3', '5', 's2', 'R'], [0.95, 0.8, 0.85, 0.7, 0.9, 0.75, 0.8, 0.7],
    { octave: 4, source: 'r39: a WIDE hook — four notes a bar, a pickup onto beat 3, falling home over two bars (the corpus intro p90 top is 79)' }),
  vf_intro_octaves: fig('vf_intro_octaves', 'pulse', 1, E8, ['R', 'R+', 'R', 'R+', '5', '5+', '5', 'R+'],
    [0.95, 0.7, 0.9, 0.7, 0.9, 0.7, 0.85, 0.7],
    { octave: 3, source: 'r39: the rock intro — octave alternation on 8ths (his r35 "octave alternation good")' }),
  vf_intro_stabs332: fig('vf_intro_stabs332', 'block', 2, ['0/1', '3/8', '3/4', '1/1', '11/8', '3/2', '7/4'],
    ['R.3.5', 'R.3.5', '3.5.R+', 'R.3.5', '3.5.R+', 'R.3.5', '3.5.R+'], [0.95, 0.8, 0.85, 0.95, 0.8, 0.85, 0.75],
    { octave: 3, source: 'r39: 3+3+2 chord stabs (the corpus `syncopated` class, 13% of mid windows)' }),
  vf_intro_none: fig('vf_intro_none', 'silent', 1, [], [], [],
    { octave: 3, source: 'r39: no accompaniment hand in the intro — bass and kit open the song (ghost: the slap bass he liked, alone)' }),
  // r39 — ENERGY LAYERS. His second message: "none of our songs are actually
  // 'intense, catchy, energetic' … no song that spews energy yet … more
  // synths when you can with energy and interesting harmonies that ARE
  // ALIGNED and are harmonic". Every token here is a chord member or a scale
  // token, so the layer cannot spell a foreign pitch (aligned by construction).
  // His correction, mid-round: "'intense, catchy, energetic' doesnt mean a
  // bunch of fast notes. it means good, catchy harmonies with full, energetic,
  // active layers". The first cut of these was a 16th arpeggio (fast notes);
  // it is now a PHRASED HOOK LINE — a two-bar counter-melody of chord tones
  // and scale steps with rests, six notes a bar, that answers the voice — and
  // a pad whose voicing MOVES every bar (the reference device from his reels:
  // a repeated chord returning with its voicing rotated).
  vf_syn_hook: fig('vf_syn_hook', 'line', 2, ['0/1', '1/8', '1/4', '1/2', '5/8', '3/4', '1/1', '9/8', '5/4', '3/2', '13/8', '7/4'],
    ['5', '5', '3+', 'R+', '5', 's6', '3', '3', '5', 's2+', 'R+', '5'],
    [0.75, 0.55, 0.7, 0.8, 0.55, 0.6, 0.75, 0.55, 0.65, 0.7, 0.8, 0.55],
    { octave: 3, role: 'synth', source: 'r39: the chorus synth HOOK — a phrased two-bar counter-line (chord tones + s2/s6 steps, rests on beat 2 of each bar)' }),
  vf_syn_hook_lite: fig('vf_syn_hook_lite', 'line', 2, ['0/1', '1/4', '1/2', '1/1', '5/4', '3/2', '7/4'],
    ['5', '3+', 'R+', '3', '5', 's2+', 'R+'], [0.75, 0.7, 0.8, 0.75, 0.65, 0.7, 0.8],
    { octave: 3, role: 'synth', source: 'r39: the mid-tier chorus synth hook — the same line at 3–4 notes a bar' }),
  vf_pad_sustain: fig('vf_pad_sustain', 'sustain', 1, ['0/1'], ['R.5.3+'], [0.8],
    { octave: 3, legato: true, role: 'pad', source: 'r39: a held root-fifth-tenth pad under the chorus (corpus `sustain` class; the tenth keeps it aligned to the chord\'s third)' }),
  vf_pad_move: fig('vf_pad_move', 'sustain', 2, ['0/1', '1/1'], ['R.5.R+.3+', '3.5.R+.5+'], [0.8, 0.75],
    { octave: 3, legato: true, role: 'pad', source: 'r39: the FULL pad — four notes, the voicing rotating every bar (his reels: "a repeated chord returns with its voicing ROTATED one position")' }),
  // bass (always present, strikes an 8th long)
  vf_bass_root5_8ths: fig('vf_bass_root5_8ths', 'pulse', 1, E8, ['R', 'R', '5', 'R', 'R', '5', 'R', '5'], [1, 0.75, 0.85, 0.75, 0.95, 0.75, 0.85, 0.8], { role: 'bass', octave: 2, source: '§2 chorus bass `root5-8ths` (56%): 7.5 strikes/bar, root 48% / fifth motion 59%' }),
  vf_bass_quarters: fig('vf_bass_quarters', 'pulse', 1, ['0/1', '1/4', '1/2', '3/4'], ['R', 'R', '5', 'R'], [1, 0.8, 0.85, 0.8], { role: 'bass', octave: 2, source: '§2 verse bass `quarters` (27%)' }),
  vf_bass_octave8: fig('vf_bass_octave8', 'pulse', 1, E8, ['R', 'R+', 'R', 'R+', 'R', 'R+', 'R', 'R+'], [1, 0.7, 0.9, 0.7, 0.95, 0.7, 0.9, 0.7], { role: 'bass', octave: 2, source: '§2 verse bass `octave` (18%): octave alternation on 8ths' }),
  vf_bass_riff8: fig('vf_bass_riff8', 'pulse', 1, E8, ['R', 'R', 'R', '5', 'R', 'R', 's7', 'R'], [1, 0.75, 0.8, 0.85, 0.95, 0.75, 0.85, 0.8], { role: 'bass', octave: 2, source: '§2 bass `riff` (10%): root 8ths with a fifth and a b7 pickup' }),
};

// ---------------------------------------------------------------- forms
// §4: intro 8 → verse 16 → (pre) → chorus 16 → verse 2 THINNED → chorus →
// interlude / bridge → final chorus; first chorus ~bar 36; 30 of 36 drop the
// density after the first chorus. Sections are 8 bars (two statements of the
// writer's 4-bar cell); `silentVerse` = the tune section whose accompaniment
// hand DROPS OUT (bass + voice + kit only — 18 of 36 songs do this in a verse).
// Roles: A = verse, B = chorus, C = bridge (the writer's own map).
export const VOCALOID_FORMS = {
  vf_form_standard: {
    intro: 8, sections: ['A', 'A', 'B', 'A', 'B', 'C', 'B'], silentVerse: 3,
    source: '§4 median form: intro 8, first chorus at bar 24 (corpus 36 — the verse here is 16 = A A), verse 2 thinned, bridge, final chorus',
  },
  vf_form_short: {
    intro: 4, sections: ['A', 'B', 'A', 'B', 'C', 'B'], silentVerse: 2,
    source: '§4 the short form (Vampire / Iya Iya Yo shape: the chorus early)',
  },
  vf_form_long: {
    intro: 8, sections: ['A', 'A', 'B', 'A', 'A', 'B', 'C', 'B', 'B'], silentVerse: 3,
    source: '§4 the full radio shape: 16-bar verses, a double final chorus (final lift is the row\'s call)',
  },
  vf_form_chorus_first: {
    intro: 0, sections: ['B', 'A', 'A', 'B', 'A', 'B', 'C', 'B'], silentVerse: 4,
    source: '§4 four of 36 open on the chorus (Ievan Polkka, Iya Iya Yo, Vampire, Yoru ni Kakeru)',
  },
  vf_form_standard_4: {
    intro: 4, sections: ['A', 'A', 'B', 'A', 'B', 'C', 'B'], silentVerse: 3,
    source: 'r39: the standard form with a 4-bar intro — one loop of the riff, then the voice (intro lengths were 8 on nine of ten rows)',
  },
};

/** Resolve a page row's vocaloidForm config by NAME; throws on an unknown name
 *  so a typo cannot silently fall back to a pool pick. */
export function vocaloidFormSpec(cfg = {}) {
  const get = (table, key, what) => { if (key == null) return null; const row = table[key]; if (!row) throw new Error(`vocaloidForm: unknown ${what} "${key}"`); return { name: key, ...row }; };
  return {
    verse: get(VOCALOID_LOOPS, cfg.verse, 'verse loop'),
    chorus: get(VOCALOID_LOOPS, cfg.chorus, 'chorus loop'),
    verseFig: get(VOCALOID_FIGURES, cfg.verseFig ?? 'vf_verse_line', 'verse figure'),
    chorusFig: get(VOCALOID_FIGURES, cfg.chorusFig ?? 'vf_chorus_block8', 'chorus figure'),
    bridgeFig: get(VOCALOID_FIGURES, cfg.bridgeFig ?? 'vf_bridge_block4', 'bridge figure'),
    introFig: get(VOCALOID_FIGURES, cfg.introFig ?? 'vf_intro_riff', 'intro figure'),
    verseBass: get(VOCALOID_FIGURES, cfg.verseBass ?? 'vf_bass_quarters', 'verse bass'),
    chorusBass: get(VOCALOID_FIGURES, cfg.chorusBass ?? 'vf_bass_root5_8ths', 'chorus bass'),
    form: get(VOCALOID_FORMS, cfg.form ?? 'vf_form_standard', 'form'),
    bassSound: cfg.bassSound ?? 'gm_synth_bass_1',
    silentVerse: cfg.silentVerse ?? true,
    // r39 — the intro is the row's: its loop ('verse' | 'chorus'), and the
    // voice its figure plays on (null = the song's accompaniment voice)
    introLoop: cfg.introLoop === 'chorus' ? 'chorus' : 'verse',
    introSound: cfg.introSound ?? null,
    // r39 — the ENERGY tier ('low' | 'mid' | 'high') decides the chorus's
    // synth figure and the pad's reach; a row may name either figure outright
    // or switch one off with `false`
    energy: ['low', 'mid', 'high'].includes(cfg.energy) ? cfg.energy : 'mid',
    synthFig: cfg.synthFig === false ? null
      : get(VOCALOID_FIGURES, cfg.synthFig ?? (cfg.energy === 'high' ? 'vf_syn_hook' : cfg.energy === 'low' ? null : 'vf_syn_hook_lite'), 'synth figure'),
    synthSound: cfg.synthSound ?? 'gm_lead_2_sawtooth',
    padFig: cfg.padFig === false ? null : get(VOCALOID_FIGURES, cfg.padFig ?? (cfg.energy === 'high' ? 'vf_pad_move' : 'vf_pad_sustain'), 'pad figure'),
    padSound: cfg.padSound ?? 'gm_pad_warm',
  };
}
