// Rhythm library (§3.5). ABSTRACT ONLY: onsets as cycle fractions (strings keep
// them exact) or euclid [k,n,rot]; accents are REAL profiles (uniform velocity is
// a bug); swing/microtiming are data the binder applies. Never mini-notation —
// these must survive any meter. `character` documents the taste each entry encodes.
// Retrieval is by computed properties (density/syncopation/downbeat anchoring),
// not genre tags — tags are secondary hints.
//
// Audition r1 (Ethan, 2026-08-19): the library's PURPOSE is rhythms for NOTES to
// fill in — pure drum patterns are the special case, not the default. Entries that
// only work as percussion carry role 'percussion'; note-oriented entries carry
// melodic/bass/chords roles and are auditioned WITH notes. Multi-bar entries set
// `bars: N` with onsets in bar units [0, N). `voices` marks each onset 'main'
// (carries the chord/contour) or 'bounce' (light low note to bounce off).

export const RHYTHMS = {
  four_floor: {
    role: 'percussion', band: 'low', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/4', '1/2', '3/4'],
    accents: [1.0, 0.85, 0.92, 0.85],
    meter_class: '4/4', tags: ['kick', 'house', 'techno'],
    character: 'The floor. Beat 3 slightly heavier than 2/4 so the bar breathes instead of marching.',
  },
  offbeat_8ths: {
    role: 'support', band: 'mid', style: 'house', provenance: 'hand-written', ratified: false,
    onsets: ['1/8', '3/8', '5/8', '7/8'],
    accents: [0.75, 0.6, 0.8, 0.62],
    meter_class: '4/4', tags: ['hat', 'bass', 'house'],
    character: 'Pure offbeat pulse — the exhale between four-floor kicks. Accent tilts to the 3& lift.',
  },
  // ---- r22: THE BACKBEAT, on real samples -------------------------------
  // His verdict, verbatim: "for the drums there isn't even a dum being hit
  // it's just hihat - there should be actual drums like an actual drum beat".
  // Measured on the song he wrote it about: 256 hi-hats and 80 kicks over 16
  // bars and ZERO snares. Not a taste problem — the default selector takes one
  // 'low' pattern and one 'high' and caps at two, and every snare in this file
  // is band 'mid', so a backbeat was structurally unreachable.
  //
  // These carry their own sounds from his Miraleste kit rather than Strudel's
  // built-in `sd`, which is the other half of his note ("the drums arent very
  // full and dont sound realistic"). Clap LAYERS with the snare on the
  // backbeat rather than replacing it — that stacking is most of what reads as
  // a full kit.
  backbeat_kit: {
    role: 'percussion', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['1/4', '1/4', '5/8', '3/4', '3/4', '7/8'],
    sounds: ['md_snare', 'md_clap', 'md_snare', 'md_snare', 'md_clap', 'md_snare'],
    accents: [1.0, 0.75, 0.3, 1.0, 0.75, 0.35],
    meter_class: '4/4', tags: ['snare', 'backbeat', 'kit'],
    character: 'Snare+clap together on 2 and 4, with a ghost snare pushing into each of them. The doubled backbeat is the "actual drum beat".',
  },
  backbeat_hard: {
    role: 'percussion', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['1/4', '1/4', '1/2', '3/4', '3/4', '15/16'],
    sounds: ['md_snare', 'md_clap', 'md_snare', 'md_snare', 'md_clap', 'md_snare'],
    accents: [1.0, 0.85, 0.4, 1.0, 0.85, 0.55],
    meter_class: '4/4', tags: ['snare', 'backbeat', 'action'],
    character: 'The same doubled backbeat with a hit on 3 and a 16th pickup into the bar line — for high-energy songs where the 2-and-4 alone reads thin.',
  },
  // his industrial ask: "if it's industrial it should have more percussion like
  // metal rod hits or stick hits or such"
  industrial_metal: {
    role: 'percussion', band: 'mid', style: 'industrial', provenance: 'hand-written', ratified: false,
    onsets: ['1/8', '1/4', '1/2', '5/8', '3/4', '7/8'],
    sounds: ['md_stick', 'md_metal', 'md_metal', 'md_stick', 'md_metal', 'md_stick'],
    accents: [0.5, 1.0, 0.8, 0.45, 1.0, 0.5],
    meter_class: '4/4', tags: ['perc', 'industrial', 'metal'],
    character: 'Metal-rod and stick hits on an off-grid pattern over the kit — machinery, not a drummer.',
  },
  backbeat_ghost: {
    role: 'percussion', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['1/4', '7/16', '3/4', '15/16'],
    accents: [1.0, 0.35, 0.95, 0.4],
    meter_class: '4/4', tags: ['snare', 'breaks', 'dnb'],
    character: 'Backbeat 2 & 4 with ghost 16ths dragging into the next beat — the ghosts ARE the groove.',
  },
  tresillo: {
    role: 'percussion', band: 'low', style: 'latin', provenance: 'hand-written', ratified: false,
    euclid: [3, 8],
    accents: [1.0, 0.7, 0.85],
    meter_class: '4/4', tags: ['kick', 'latin', 'reggaeton', 'pop'],
    character: '3-in-8, the most exported rhythm on earth. Middle onset softest so the last one pushes forward.',
  },
  son_clave_3: {
    role: 'percussion', band: 'mid', style: 'latin', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/16', '3/8', '5/8', '3/4'],
    accents: [1.0, 0.8, 0.9, 0.7, 0.85],
    meter_class: '4/4', tags: ['perc', 'latin', 'melodic'],
    character: 'One-bar son clave (3+2 compressed). Works as melodic rhythm as well as percussion.',
  },
  dembow: {
    role: 'percussion', band: 'low', style: 'reggaeton', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/16', '1/2', '11/16', '7/8'],
    accents: [1.0, 0.85, 0.9, 0.85, 0.55],
    meter_class: '4/4', tags: ['composite', 'reggaeton'],
    character: 'Dembow skeleton — boom-ch-boom-chick with a soft pickup into the next bar.',
  },
  sixteenth_drive: {
    role: 'percussion', band: 'high', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['0','1/16','1/8','3/16','1/4','5/16','3/8','7/16','1/2','9/16','5/8','11/16','3/4','13/16','7/8','15/16'],
    accents: [1.0, 0.4, 0.62, 0.4, 0.82, 0.4, 0.62, 0.42, 0.9, 0.4, 0.62, 0.4, 0.82, 0.42, 0.66, 0.46],
    meter_class: '4/4', tags: ['hat', 'trance', 'house'],
    character: 'Continuous 16ths with a beat-weighted accent hierarchy — drive without flatness. The last two lift into the next bar.',
  },
  swung_lofi_hats: {
    role: 'percussion', band: 'high', style: 'lofi-hiphop', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    accents: [0.9, 0.42, 0.72, 0.46, 0.86, 0.4, 0.72, 0.52],
    swing: 0.55,
    meter_class: '4/4', tags: ['hat', 'lofi', 'hiphop'],
    character: 'Straight 8ths swung hard (0.55). Accents lean on 1 and 3 so the swing reads as lazy, not lopsided.',
  },
  lazy_dilla: {
    role: 'percussion', band: 'high', style: 'lofi-hiphop', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    accents: [0.95, 0.5, 0.75, 0.55, 0.9, 0.5, 0.7, 0.6],
    microtiming: ['0', '1/64', '0', '1/48', '0', '1/64', '0', '1/48'],
    meter_class: '4/4', tags: ['hat', 'perc', 'lofi', 'hiphop'],
    character: 'Dilla drag: every offbeat lands late by an uneven hair (1/64 vs 1/48) — drunk but deliberate.',
  },
  two_step_kick: {
    role: 'percussion', band: 'low', style: 'ukg', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/8', '5/8'],
    accents: [1.0, 0.65, 0.85],
    meter_class: '4/4', tags: ['kick', 'garage', 'dnb'],
    character: 'UKG two-step kick — hole on beat 2 is the point; the 3& shoves the bar forward.',
  },
  anticipation_bass: {
    role: 'percussion', band: 'low', style: 'universal', provenance: 'hand-written', ratified: false, audit: 'audition-r1: percussion only',
    onsets: ['0', '7/16', '1/2', '15/16'],
    accents: [0.95, 0.6, 0.85, 0.7],
    meter_class: '4/4', tags: ['perc', 'kick', 'funk', 'house'],
    character: 'Pre-empts beats 2 and 1 by a 16th — the push-pull against a straight kick. Audition r1: too sparse-with-holes to carry a note line; demoted to percussion.',
  },
  push_pull_16s: {
    role: 'percussion', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false, audit: 'audition-r1: percussion only',
    onsets: ['0', '3/16', '3/8', '5/8', '3/4', '15/16'],
    accents: [1.0, 0.5, 0.8, 0.6, 0.9, 0.4],
    meter_class: '4/4', tags: ['perc', 'verified'],
    character: 'The §2 handoff rhythm: strong anchors on 1 and 4 with syncopated pushes between — verified ground truth. Audition r1: reads as percussion, not a note-carrier.',
  },
  gallop_arp: {
    role: 'percussion', band: 'mid', style: 'trance', provenance: 'hand-written', ratified: false, audit: 'audition-r1: percussion only',
    onsets: ['0','1/8','3/16','1/4','3/8','7/16','1/2','5/8','11/16','3/4','7/8','15/16'],
    accents: [1.0, 0.45, 0.6, 0.85, 0.45, 0.6, 0.9, 0.45, 0.6, 0.85, 0.5, 0.65],
    meter_class: '4/4', tags: ['perc', 'arp', 'trance'],
    character: 'Trance gallop (dum-da-da ×4). Accents on the long note. Audition r1: works as percussion, not as a note-filler; demoted.',
  },
  sparse_pedal: {
    role: 'bass', band: 'low', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/4'],
    accents: [1.0, 0.6],
    meter_class: 'any', tags: ['bass', 'pad', 'breakdown'],
    character: 'Two anchors per bar. For breakdowns and bridges — space is the material.',
  },
  seven_pulse_223: {
    role: 'percussion', band: 'low', style: 'aksak', provenance: 'hand-written', ratified: false,
    onsets: ['0', '2/7', '4/7'],
    accents: [1.0, 0.82, 0.9],
    meter_class: '7/8', tags: ['kick', 'aksak'],
    character: '7/8 anchor in 2+2+3: the long third group gets the secondary weight, which is what makes 7 feel intentional.',
  },
  seven_hats_223: {
    role: 'percussion', band: 'high', style: 'aksak', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/7', '2/7', '3/7', '4/7', '5/7', '6/7'],
    accents: [1.0, 0.4, 0.78, 0.42, 0.85, 0.45, 0.58],
    meter_class: '7/8', tags: ['hat', 'aksak'],
    character: 'All seven pulses, accented at group starts (1, 3, 5) so the 2+2+3 grouping is audible without a kick.',
  },
  seven_syncopated: {
    role: 'melodic', band: 'mid', style: 'aksak', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/14', '2/7', '1/2', '9/14', '11/14'],
    accents: [1.0, 0.5, 0.8, 0.9, 0.55, 0.72],
    meter_class: '7/8', tags: ['melodic', 'aksak'],
    character: 'Melodic 7/8 line that ghosts between group boundaries — anchors on 1 and the 4th pulse, pushes elsewhere.',
  },
  seven_offbeat_lift: {
    role: 'support', band: 'mid', style: 'aksak', provenance: 'hand-written', ratified: false,
    onsets: ['1/14', '5/14', '9/14', '13/14'],
    accents: [0.72, 0.62, 0.82, 0.66],
    meter_class: '7/8', tags: ['melodic', 'hat', 'aksak'],
    character: 'Offbeat pulses inside 7/8 — the exhale against a 2+2+3 kick. The 9/14 accent leans into the long group.',
  },
  waltz_lift: {
    role: 'percussion', band: 'low', style: 'waltz', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/3', '2/3'],
    accents: [1.0, 0.55, 0.7],
    meter_class: '3/4', tags: ['kick', 'perc', 'waltz'],
    character: 'ONE-two-three with the lift on 3, not 2 — the third beat leads back to the downbeat.',
  },

  // ---- genre-expansion percussion (2026-08-27; research/percussion-catalog
  // .md + env-desert-jungle.md iqa' grids + midi-desert-analysis.md). These
  // carry per-onset `sounds` (local vc_* sample-pack names — real VCSL hits
  // in both tiers) so a dum and a tak are different drums, not just accents.
  // Referenced only by the new environments, so existing songs never re-roll.
  maqsum: {
    role: 'percussion', band: 'low', style: 'middle-eastern', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/8', '3/8', '1/2', '3/4'],
    sounds: ['vc_darbuka', 'vc_darbuka_tak', 'vc_darbuka_tak', 'vc_darbuka', 'vc_darbuka_tak'],
    accents: [1.0, 0.7, 0.7, 0.95, 0.7],
    meter_class: '4/4', tags: ['perc', 'desert', 'dance'],
    character: 'Maqsum — D.T..T.D...T...: the most common Arabic iqa\'. Desert town / bazaar warmth; dum >> tak.',
  },
  ayyub: {
    role: 'percussion', band: 'low', style: 'middle-eastern', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/16', '1/4', '3/8', '1/2', '11/16', '3/4', '7/8'],
    sounds: ['vc_darbuka', 'vc_darbuka_tak', 'vc_darbuka', 'vc_darbuka_tak', 'vc_darbuka', 'vc_darbuka_tak', 'vc_darbuka', 'vc_darbuka_tak'],
    accents: [1.0, 0.4, 0.9, 0.65, 1.0, 0.4, 0.9, 0.65],
    meter_class: '4/4', tags: ['perc', 'desert', 'travel'],
    character: 'Ayyub — the camel-walk gallop, twice per bar. THE desert caravan/travel rhythm (100-130bpm).',
  },
  masmoudi_slow: {
    role: 'percussion', band: 'low', style: 'middle-eastern', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/4', '3/4'],
    sounds: ['vc_darbuka', 'vc_darbuka', 'vc_darbuka_tak'],
    accents: [1.0, 0.9, 0.55],
    meter_class: '4/4', tags: ['perc', 'desert', 'processional'],
    character: 'Masmoudi reduced to one bar: two dums then a lone tak — vast, processional. The somber-desert floor; silence is a note.',
  },
  // r16 (desert-perc, his answer: "add it as a 3rd pattern"). NSMB's deep drum
  // never lands on beat 1 — measured, it sits on the &-of-1 and the e-of-2
  // every bar, with no kick, no snare and no hat. The engine's iqa' patterns
  // (ayyub/maqsum/masmoudi) all put a dum on the downbeat, so this is a floor
  // the lane could not previously make. Added ALONGSIDE them, never replacing:
  // his note on the same page was "don't make it replace everything".
  nsmb_doum: {
    role: 'percussion', band: 'low', style: 'desert', provenance: 'ethan-requested', ratified: false,
    onsets: ['1/8', '5/16', '1/2', '3/4', '7/8'],
    sounds: ['vc_darbuka', 'vc_darbuka', 'vc_darbuka_tak', 'vc_darbuka', 'vc_darbuka_tak'],
    accents: [1.0, 0.85, 0.5, 0.95, 0.55],
    meter_class: '4/4', tags: ['perc', 'desert', 'offbeat'],
    character: 'The NSMB desert floor: the deep drum refuses beat 1 and speaks on the &-of-1 and the e-of-2, taks filling behind. Downbeat-less, so it floats where an iqa\' marches.',
  },
  tumbao_conga: {
    role: 'percussion', band: 'low', style: 'latin', provenance: 'hand-written', ratified: false,
    onsets: ['1/4', '3/4', '7/8'],
    sounds: ['vc_conga_mute', 'vc_conga', 'vc_conga'],
    accents: [0.9, 1.0, 0.95],
    meter_class: '4/4', tags: ['perc', 'jungle', 'groove'],
    character: 'Conga tumbao, audible strokes only: slap on 2, open tones on 4 and 4-and — empty 1, loaded 4.',
  },
  martillo_bongo: {
    role: 'percussion', band: 'high', style: 'latin', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    sounds: ['vc_bongo_hi', 'vc_bongo_hi', 'vc_bongo_hi', 'vc_bongo_hi', 'vc_bongo_hi', 'vc_bongo_hi', 'vc_bongo_lo', 'vc_bongo_hi'],
    accents: [0.6, 0.45, 0.55, 0.45, 0.6, 0.45, 1.0, 0.5],
    meter_class: '4/4', tags: ['perc', 'jungle', 'timekeeper'],
    character: 'Bongo martillo: constant 8th tick on the high drum, the low hembra answering on beat 4. Insect-tick jungle time.',
  },
  // r16 (jungle-floor, his answer: "depends on the song's energy! use a for
  // relaxing jungle themes but otherwise make a beat similar to b. important
  // that you don't reuse b every time though. because that makes it uniform").
  // Two carpets, not one, so the energetic floor is a CHOICE rather than a
  // fixture. Modelled on the measured JP2 SNES carpet — every 16th filled,
  // the two drums interleaved so they never double, building by percussion
  // density rather than by adding layers (21 -> 27 -> 39 hits/bar across the
  // piece). The engine's relaxing floor stays tumbao_conga + martillo_bongo.
  jungle_carpet_16ths: {
    role: 'percussion', band: 'high', style: 'latin', provenance: 'ethan-requested', ratified: false,
    onsets: ['0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'],
    sounds: ['vc_bongo_hi', 'vc_shaker', 'vc_bongo_hi', 'vc_shaker', 'vc_bongo_lo', 'vc_shaker', 'vc_bongo_hi', 'vc_shaker',
      'vc_bongo_hi', 'vc_shaker', 'vc_bongo_hi', 'vc_shaker', 'vc_bongo_lo', 'vc_shaker', 'vc_bongo_hi', 'vc_shaker'],
    accents: [1.0, 0.35, 0.5, 0.8, 0.4, 0.35, 0.85, 0.4, 0.95, 0.35, 0.5, 0.8, 0.4, 0.35, 0.9, 0.45],
    meter_class: '4/4', tags: ['perc', 'jungle', 'carpet'],
    character: 'The full 16th carpet: bongo and shaker interleaved so neither doubles the other, cross-accented 3+3+2 (slots 0,3,6,8,11,14) so it shimmers instead of ticking.',
  },
  jungle_carpet_guiro: {
    role: 'percussion', band: 'high', style: 'latin', provenance: 'ethan-requested', ratified: false,
    onsets: ['1/16', '1/8', '3/16', '5/16', '3/8', '7/16', '9/16', '5/8', '11/16', '13/16', '7/8', '15/16'],
    sounds: ['vc_quinto', 'vc_shaker_soft', 'vc_guiro', 'vc_quinto', 'vc_shaker_soft', 'vc_guiro',
      'vc_quinto', 'vc_shaker_soft', 'vc_guiro', 'vc_quinto', 'vc_shaker_soft', 'vc_guiro'],
    accents: [0.45, 0.6, 0.35, 0.5, 0.7, 0.35, 0.45, 0.6, 0.35, 0.55, 0.75, 0.4],
    meter_class: '4/4', tags: ['perc', 'jungle', 'carpet'],
    character: 'The same density with the quarter-note downbeats LEFT EMPTY for the conga and kick — quinto/shaker/guiro rotating around them. The busy jungle floor that is not the 16th carpet.',
  },
  war_gallop: {
    role: 'percussion', band: 'low', style: 'cinematic', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/8', '1/2', '7/8'],
    sounds: ['vc_wardrum', 'vc_tom_lo', 'vc_wardrum', 'vc_tom_lo'],
    accents: [1.0, 0.8, 0.95, 0.8],
    meter_class: '4/4', tags: ['perc', 'war', 'trailer'],
    character: 'The action-trailer dotted-8th gallop (onsets 0,6,8,14 in 16ths): concert bass drum answered by low toms.',
  },
  war_march: {
    role: 'percussion', band: 'low', style: 'cinematic', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/16', '3/8', '1/2', '11/16', '7/8'],
    sounds: ['vc_wardrum', 'vc_tom_hi', 'vc_tom_lo', 'vc_wardrum', 'vc_tom_hi', 'vc_tom_lo'],
    accents: [1.0, 0.6, 0.8, 0.95, 0.6, 0.8],
    meter_class: '4/4', tags: ['perc', 'war', 'march'],
    character: '3+3+2 war march across the drum family — army-on-the-move; the wardrum owns the long beats.',
  },
  shaker_urgency: {
    role: 'percussion', band: 'high', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'],
    sounds: ['vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker', 'vc_shaker'],
    accents: [1.0, 0.35, 0.5, 0.35, 1.0, 0.35, 0.5, 0.35, 1.0, 0.35, 0.5, 0.35, 1.0, 0.35, 0.5, 0.35],
    meter_class: '4/4', tags: ['perc', 'urgency', 'timekeeper'],
    character: 'Straight-16th shaker, beats accented — the urgency timekeeper; a hi-hat substitute that reads environment, not kit.',
  },
  riq_offbeats: {
    role: 'percussion', band: 'high', style: 'middle-eastern', provenance: 'hand-written', ratified: false,
    onsets: ['1/8', '3/8', '5/8', '7/8'],
    sounds: ['vc_riq', 'vc_riq', 'vc_riq', 'vc_riq'],
    accents: [0.6, 0.5, 0.6, 0.5],
    meter_class: '4/4', tags: ['perc', 'desert', 'jingle'],
    character: 'Riq (tambourine) jingles on the offbeat 8ths — the bright band over a darbuka floor.',
  },
  // ==== r24 BAND / ORCHESTRAL PERCUSSION ================================
  // HIS ASK, verbatim: "also I feel like our drum vst isnt that good. like it
  // doesnt sound like deep reel drums. bear in mind though that some songs may
  // not have drum set, they'll have like band drums like snare or bass and
  // timphany etc. and of course there are the various other ones."
  //
  // MEASURED FIRST, and the diagnosis is not the VST: 15 of 33 percussion
  // patterns declared NO samples and fell back to Strudel's stock bd/sd/hh —
  // and those 15 were every kick and hat the battle songs use (four_floor,
  // dembow, sixteenth_drive, two_step_kick). One boss kit was playing a
  // synthetic stock kick, his real Miraleste snare, a synthetic stock hat and
  // real orchestral toms: four sonic worlds, with the cheapest sounds carrying
  // the body. That is what "shallow" was.
  //
  // AND THE BAND PERCUSSION HE IS DESCRIBING WAS ALREADY SAMPLED AND NEVER
  // PLAYED. vc_timpani, vc_snare_mil (field snare), vc_snare_roll, vc_gong,
  // vc_wardrum_cresc, vc_anvil, vc_windchimes, vc_sleigh — zero patterns
  // referenced any of them before this block.
  //
  // These are a KIT, not accents: band 'low'/'mid'/'high' so a song can seat a
  // full band floor in place of a drum set. They are only reachable through the
  // orchestral selector in audition-songs.mjs, which keys on the CAST's declared
  // instrument families — never on a lane or a song name.
  band_march_snare: {
    role: 'percussion', band: 'mid', style: 'orchestral', provenance: 'ethan-requested', ratified: false,
    onsets: ['0', '3/16', '1/4', '1/2', '11/16', '3/4', '7/8'],
    sounds: ['vc_snare_mil', 'vc_snare_mil', 'vc_snare_mil', 'vc_snare_mil', 'vc_snare_mil', 'vc_snare_mil', 'vc_snare_mil'],
    accents: [0.95, 0.45, 0.6, 0.9, 0.45, 0.6, 0.5],
    meter_class: '4/4', tags: ['perc', 'band', 'snare', 'march'],
    character: 'Field snare with the double-stroke pickups a marching line actually plays — accent on 1 and 3, ghosted 16ths before 2 and 4. The band answer to a backbeat.',
  },
  band_bass_drum: {
    role: 'percussion', band: 'low', style: 'orchestral', provenance: 'ethan-requested', ratified: false,
    bars: 2,
    onsets: ['0', '1/2', '1', '7/4'],
    sounds: ['vc_wardrum', 'vc_wardrum', 'vc_wardrum', 'vc_wardrum_cresc'],
    accents: [1.0, 0.6, 0.9, 0.7],
    meter_class: '4/4', tags: ['perc', 'band', 'bass-drum'],
    character: 'Concert bass drum on the strong beats with a crescendo stroke into the 2-bar turn. Deep and sparse — it is the floor, not the pulse.',
  },
  band_timpani: {
    role: 'percussion', band: 'low', style: 'orchestral', provenance: 'ethan-requested', ratified: false,
    bars: 4,
    onsets: ['0', '3/2', '2', '7/2', '15/4'],
    sounds: ['vc_timpani', 'vc_timpani', 'vc_timpani', 'vc_timpani', 'vc_timpani'],
    accents: [1.0, 0.55, 0.85, 0.6, 0.75],
    meter_class: '4/4', tags: ['perc', 'band', 'timpani'],
    character: 'Timpani on the structural downbeats of a 4-bar phrase plus a two-note pickup into the next. His "snare or bass and timphany" — the part that makes a cue read orchestral rather than kit.',
  },
  band_roll_swell: {
    role: 'percussion', band: 'mid', style: 'orchestral', provenance: 'ethan-requested', ratified: false,
    bars: 8,
    onsets: ['15/2'],
    sounds: ['vc_snare_roll'],
    accents: [0.7],
    meter_class: '4/4', tags: ['perc', 'band', 'transition'],
    character: 'A snare roll on the last half-bar of every eight — the band transition. One event, never a texture.',
  },
  band_gong: {
    role: 'percussion', band: 'accent', style: 'orchestral', provenance: 'ethan-requested', ratified: false,
    bars: 16,
    onsets: ['0'],
    sounds: ['vc_gong'],
    accents: [0.8],
    meter_class: '4/4', tags: ['perc', 'band', 'gong'],
    character: 'One gong per sixteen bars. The rarest event in the library, deliberately.',
  },

  // ---- r23 BATTLE KIT (measured, research/boss-r23.md) ----------------
  // His ask: "for the boss fights learn what makes them actually feel
  // energetic with stakes on the line and epic ... and rhythm".
  // Measured over 13 battle files against 43 non-battle files from HIS OWN
  // hand-picked set (so the contrast is a battle property, not a taste
  // property): TOMS are the battle drum voice at 1.887 hits/bar against 0.313
  // (6.0x), present in 5 of 12 battle files vs 11 of 39 others, and the crash
  // covers 19.8% of bars against 13.8%. Hats go the OTHER way — battle hats are
  // 8ths, not 16ths (16th-position share 8.8% vs 21.9%) and there are FEWER of
  // them (5.2/bar vs 6.7). A battle kit is not a busier kit; it is a kit with
  // toms and a crash and a plainer hat.
  //
  // Deliberately band 'accent' — a band no selector picks — so these can only
  // ever arrive as an explicit extra voice. Adding another 'low' or 'mid' would
  // re-roll `byBand()` for every song in the suite (D95's pool law), and the
  // drum selector has now broken three times on exactly that assumption.
  // BOTH RATES WERE MEASURED WRONG ON THE FIRST WRITE AND ARE CORRECTED HERE.
  // The first battle_toms put 8 onsets in a 2-bar cell and its own comment
  // claimed "= 2.0/bar"; 8 over 2 bars is 4.0/bar, and the probe measured
  // exactly 4.00 — 2.1x the 1.887 it was built to hit. battle_crash put 2
  // onsets in a 4-bar cell and claimed 25%; 2 in 4 is 50%, and the probe
  // measured exactly 50% — 2.5x the 19.8%. Both are now 4-bar and 8-bar cells.
  battle_toms: {
    role: 'percussion', band: 'accent', style: 'cinematic', provenance: 'hand-written', ratified: false,
    bars: 4,
    onsets: ['1/2', '5/8', '3/4', '7/8', '7/2', '29/8', '15/4', '31/8'],
    sounds: ['vc_tom_hi', 'vc_tom_hi', 'vc_tom_lo', 'vc_tom_lo', 'vc_tom_hi', 'vc_tom_lo', 'vc_tom_lo', 'vc_wardrum'],
    accents: [0.62, 0.55, 0.78, 0.6, 0.62, 0.6, 0.8, 0.9],
    meter_class: '4/4', tags: ['perc', 'battle', 'toms'],
    character: 'Tom answer across the back half of bars 1 and 4 of every four, hi->lo, landing on the wardrum at the turn. 8 hits per 4 bars = 2.0/bar against the measured battle rate of 1.887 — and it leaves bars 2-3 clear, which is what makes it an answer rather than a carpet.',
  },
  battle_crash: {
    role: 'percussion', band: 'accent', style: 'cinematic', provenance: 'ethan-requested', ratified: false,
    bars: 8,
    onsets: ['31/4'],
    sounds: ['vc_cym_cresc'],
    accents: [0.85],
    meter_class: '4/4', tags: ['perc', 'battle', 'cymbal'],
    // r24 — HIS EAR, on two separate cards: "the suspended cymbal is overused"
    // (su_tense_boss) and "the cymbal is overused" (su_triumphant_boss). The
    // r23 build measured 25.0% of bars carrying a crash against the 19.8% read
    // off his own battle references, so I had already OVERSHOT my own target and
    // he heard it. Halved to a 16-bar cell: 2 bars in 16 = 12.5%. Deliberately
    // UNDER the reference rather than at it — a crash is an event, and the one
    // measurement I have of his tolerance is that 25% was too many.
    //
    // r24 ADVERSARIAL CATCH — the 16-bar cell SILENTLY DELETED THE CYMBAL from the
    // song he liked most. Measured in the mix: su_scary_fight, 28 bars ("I like
    // this one the most of the fight songs"), got ZERO cymbal hits, because a
    // 16-bar cell's two onsets both fall outside what a 28-bar drum mask carries;
    // su_tense_fight got 6.3% and the 64-bar songs 9.4%, none of them the 12.5%
    // the comment claimed. A cell longer than a section cannot be relied on to
    // sound at all. One onset in EIGHT bars states the same 12.5% and always
    // includes bar 0, so the shortest song still gets its accent. This is D95 in
    // its plainest form — a library edit re-rolls judged material — and it reached
    // a judged song through no gate at all, because rhythms.js is DATA.
    //
    // r25 — HIS INSTRUCTION, and it is about PLACEMENT, not rate: "make the
    // suspended cymbal lead up to the drop/section end not on section beginning"
    // (su_tense_boss). A suspended cymbal crescendo IS a lead-in — it belongs on
    // the last beat before the seam, not on the downbeat after it. The onset moves
    // from bar 1 beat 1 to bar 8 beat 4 of the cell, so it arrives INTO the next
    // section. Two other cards ask for it gone outright from their songs ("just
    // remove the suspended cymbal from these type of songs", "remove the cymbal"),
    // which `opts.noCymbal` does per song rather than by deleting the pattern.
    character: 'A crash on the 16-bar downbeat and a soft one on the back half of bar 16 (the pickup into the next sixteen). 2 bars in 16 = 12.5%; the reference is 19.8% and 25% was judged overused.',
  },

  heartbeat_toms: {
    role: 'percussion', band: 'low', style: 'cinematic', provenance: 'hand-written', ratified: false,
    onsets: ['0', '3/16'],
    sounds: ['vc_tom_lo', 'vc_tom_lo'],
    accents: [1.0, 0.55],
    meter_class: '4/4', tags: ['perc', 'horror', 'sparse'],
    character: 'Lub-dub on a low tom, then silence for the rest of the bar — the stalking-heartbeat floor for horror ambience.',
  },

  // ---- note-oriented + multi-bar entries (audition r1 direction) ----
  even_8ths: {
    role: 'melodic', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false,
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    accents: [0.85, 0.5, 0.65, 0.5, 0.75, 0.5, 0.65, 0.55],
    meter_class: '4/4', tags: ['melodic', 'neutral'],
    character: 'Straight 8ths with a beat-weighted accent tilt. The neutral note-carrier — when the CONTOUR is the story, this stays out of its way.',
  },
  pushed_comp_2bar: {
    role: 'chords', band: 'mid', style: 'pop', provenance: 'ethan-requested', ratified: false,
    bars: 2,
    onsets: ['0', '1/4', '3/8', '1/2', '5/8', '3/4', '9/8', '11/8', '3/2', '7/4'],
    accents: [1.0, 0.9, 0.5, 0.92, 0.5, 0.55, 0.85, 0.88, 0.95, 0.8],
    voices: ['main', 'main', 'bounce', 'main', 'bounce', 'bounce', 'main', 'main', 'main', 'main'],
    meter_class: '4/4', tags: ['comp', 'chords', 'pop', 'piano'],
    character: 'Ethan\'s 2-bar push comp: bar 1 states 1-2-3 on the beat with light low bounces on 2&, 3&, 4; bar 2 anticipates on the &s of 1 and 2, then lands 3-4. The classic anticipation/"rhythmic push" comping family.',
  },
  charleston_2bar: {
    role: 'chords', band: 'mid', style: 'jazz', provenance: 'hand-written', ratified: false,
    bars: 2,
    onsets: ['0', '3/8', '1', '11/8', '7/4'],
    accents: [0.95, 0.8, 0.9, 0.82, 0.6],
    voices: ['main', 'main', 'main', 'main', 'bounce'],
    meter_class: '4/4', tags: ['comp', 'chords', 'jazz', 'charleston'],
    character: 'Charleston (1, 2&) asked and answered: bar 2 repeats it and adds a soft low pickup on 4 leading back to the top.',
  },
  bossa_comp_2bar: {
    role: 'chords', band: 'mid', style: 'bossa', provenance: 'hand-written', ratified: false,
    bars: 2,
    onsets: ['0', '3/8', '3/4', '5/4', '13/8'],
    accents: [0.9, 0.78, 0.85, 0.88, 0.7],
    meter_class: '4/4', tags: ['comp', 'chords', 'bossa', 'latin'],
    character: 'Bossa comp skeleton over two bars: bar 1 pushes 1, 2&, 4; bar 2 answers on 2 and 3& — the offbeat half of the phrase.',
  },
  call_response_2bar: {
    role: 'melodic', band: 'mid', style: 'universal', provenance: 'hand-written', ratified: false,
    bars: 2,
    onsets: ['0', '1/8', '1/4', '1/2', '5/8', '1', '3/2', '7/4'],
    accents: [1.0, 0.5, 0.8, 0.9, 0.55, 0.95, 0.75, 0.6],
    meter_class: '4/4', tags: ['melodic', 'phrase'],
    character: 'Two-bar phrase logic for a line: busy call in bar 1 (five notes leaning on 1 and 3), sparse answer in bar 2 (three long notes). Eight onsets — 8-degree contours like question_answer land exactly.',
  },
};

// ---------------------------------------------------------------------------
// Computed indexing (retrieval by musical function, §3.5)
// ---------------------------------------------------------------------------
import { normalizeRhythm } from '../binder/bind.js';

export function rhythmProperties(entry) {
  const r = normalizeRhythm(entry);
  const meterNum = entry.meter_class && entry.meter_class !== 'any'
    ? Number(entry.meter_class.split('/')[0]) : 4;
  // bar-unit onsets: integer bar shifts are grid multiples, so this works for
  // multi-bar entries unchanged
  const onGrid = ([n, d]) => (n * meterNum) % d === 0;
  const off = r.onsets.filter((o) => !onGrid(o)).length;
  return {
    density: r.onsets.length / r.bars,
    bars: r.bars,
    syncopation: r.onsets.length ? off / r.onsets.length : 0,
    downbeatAnchored: r.onsets.some(([n]) => n === 0),
    swung: (entry.swing ?? 0) > 0 || !!entry.microtiming,
    accentSpread: Math.max(...entry.accents) - Math.min(...entry.accents),
  };
}

/** Retrieve by musical function: filters over computed properties + meter fit.
 *  `role` filters by what the rhythm is FOR (melodic/bass/chords/percussion) —
 *  audition r1: never hand a percussion-only rhythm to a note line. */
export function findRhythms({ meter = '4/4', role = null, minDensity = 0, maxDensity = Infinity, syncopation = null, downbeatAnchored = null, tag = null } = {}) {
  const out = [];
  for (const [name, entry] of Object.entries(RHYTHMS)) {
    if (entry.meter_class !== 'any' && entry.meter_class !== meter) continue;
    if (role && entry.role !== role) continue;
    const p = rhythmProperties(entry);
    if (p.density < minDensity || p.density > maxDensity) continue;
    if (syncopation === 'high' && p.syncopation < 0.4) continue;
    if (syncopation === 'low' && p.syncopation >= 0.4) continue;
    if (downbeatAnchored != null && p.downbeatAnchored !== downbeatAnchored) continue;
    if (tag && !entry.tags.includes(tag)) continue;
    out.push({ name, entry, properties: p });
  }
  return out;
}
