// r33 verification catalog — candidate rows for Ethan to label, one by one.
//
// HIS ASK, verbatim: "first take everything you like whether it's a combo of
// instruments or a specific instrument, whether it's just that instrument sound
// or a set of notes or a rhythm or a combination, and ask me to verify them one
// by one so i can label what they contribute and which ones sound good together."
//
// Every row is one candidate mined from the reels / vgmusic / Undertale /
// Unison / his own labeled files (685floyd Cottonwood + Miraleste) / the
// research back-catalog. NOTHING here is in any retrieval pool: a candidate
// only becomes engine material when HIS label comes back and it is authored
// into the proper library by hand (D95 — promotion is manual, per row).
//
// Rows are addressed BY NAME, never iterated or length-indexed in engine code
// (the techniques.js rule): adding a row can never re-roll a song. The ONLY
// consumer is scripts/audition-catalog.mjs, which builds audition/catalog.html.
//
// Row shape:
//   id             stable slug (cand_<source>_<slug>) — his labels key on it forever
//   type           harmony | rhythm | accomp_pattern | melody_pattern
//                  | instrument_for_vibe | instrument_combo | device
//   source         exact provenance (file path / reel + seconds / library row)
//   why            what I hear in it — shown to him verbatim
//   his_prior_words  his own words if he has already named the thing ('' if none)
//   vibes          lanes it plausibly serves, e.g. ['happy/menu']
//   render         { kind, spec } — see audition-catalog.mjs renderCandidate()
//   key_tonic      (optional) the tonic the RENDER sounds in — reel renders
//                  inherit their progression's key, the rest are documented in
//                  the entry's own prose. The catalog page uses it to pull a
//                  ticked pair-partner into the current card's key so a
//                  cross-key combo is heard as it would bind in one song.
//                  Absent = keyless (pure rhythm) or key unknown (plays as
//                  transcribed, untransposed). degrees/figure renders carry
//                  their spec tonic already and don't need it.
//   key_mode       (optional) 'major' | 'minor' — the mode of the render
//                  (dorian counts as minor). Drives the page's mode-aware
//                  pair transposition: a cross-mode partner maps to the
//                  card's RELATIVE key so its colors land diatonic (his
//                  batch-1 "wrong key / would work if aligned" notes, D125).
//   addon_gain     (optional) HIS measured loudness reading for this
//                  candidate in the ADD-ON role ("way too loud" -> <1,
//                  "cant hear" -> >1); the page multiplies it into the
//                  0.85 partner base. Solo playback is unaffected.
//   batch          (optional) mining batch, default 1. Later batches strictly
//                  APPEND to the audition queue so his saved position and the
//                  card numbering he has already seen never shift mid-labeling.
//   pairs_with     candidate ids that plausibly stack with it (my guess — he verifies)
//   confidence     high | medium | low (my ranking, drives queue order)
//
// This file is REPLACED by the curated r33 mining output; the entries below are
// build-harness seeds so the generator can be developed and tested before the
// curated list lands.

export const CATALOG_META = {
  round: 'r33',
  ask: 'label what each contributes; mark which sound good together',
  curatorNotes: "CURATED: 62 of 92 (21 harmony / 14 accomp / 8 rhythm / 6 melody / 7 combo / 6 device; no miner produced instrument_for_vibe rows). Ordering = rank: his_prior_words candidates first (strongest keeps and reels, then his_labeled Cottonwood/manual files, then vgmusic/misc with his words), then high-confidence no-words, then mediums that earn a slot via A/B value or a unique mechanism.\n\nVALIDATION FIXES APPLIED: (1) Dialect — every degrees spec audited token-by-token; no maj7/7b9/m11/^9 present in any kept spec (un_emo_planed_maj7 had already been down-rendered from source maj9 to ^7 by its miner; noted in its source). (2) Tidal-style sharp names (as3/fs4/cs4/ds3/gs4) normalized to a#3/f#4/c#4/d#3/g#4 form in 9 his_labeled specs (shenightfall_harpsi, dungeoncave, airpirate_lattice, airvoyage_pendulum, airvoyage_melody, morning_hexarp, rush_layering) — the project reads pitch strings like \"eb4\"/\"f#3\". (3) Sound fields carrying parentheticals (\"gm_synth_bass_1 (timpani in source)\") reduced to bare sound names, commentary moved to a note key. (4) Two rhythm_onsets specs (shenightfall_drums, desert_groove) flattened from array-of-arrays to the parallel onsets/sounds shape the schema and every other rhythm card use. (5) cand_cw_evening_royalroad pairs_with pointed at nonexistent cand_cw_rush_horn_drift — corrected to cand_cw_rush_layering. (6) All pairs_with referencing dropped ids pruned or re-pointed to kept candidates. (7) Bar-slot sums verified on every note_mini/stack_mini (all bars total correctly); moonsetter_pushcomp's bare 7 token annotated as safe only over 7th-carrying chords (bare-7 trap). No true cross-miner duplicates existed — the closest pairs are component-vs-stack (lp_r5_offbeat_pizz / lp_r1_onoff_pad inside combo_pizz_onoff_bright), kept deliberately at both granularities to identify which layer his words meant.\n\nDROPPED (30, with reasons):\n- cand_dp_afrobeat_offbeat_kit, cand_hb_iremember_mediants, cand_un_famous_pushed_cadence — low confidence; the chordBeats-push device is already demonstrated by kept reel harmonies (rl_r2 tresillo, rl_r3 barline-crossing).\n- cand_vg_ff4_aeolian_rise — bVI-bVII-i is the least-new epic-minor shape; metalwarriors + eggreverie cover the lane with more information.\n- cand_vg_cv4_secret_shimmer, cand_hs_moonsetter_wash — half-bar/whole-bar two-chord oscillation duplicated by kept hs_rda_halfbar_shuttle (higher coverage) and the pushcomp figure renders over any m7 loop.\n- cand_vg_dxstage1_tresillo_dominant — tresillo harmonic rhythm and dominant-first lean both represented by kept reel harmonies.\n- cand_vg_tetrisplus_map_backdoor, cand_vg_starfox2_select_funk, cand_hb_shelter_iii_pivot — happy-menu major harmony oversupplied (rl_r2, rl_r3, proto, evening_royalroad).\n- cand_vg_princesstomato_calm_steps — calm/shop covered by shop_planing + shop_bounce + reflection_duet.\n- cand_vg_luf1doom_pedal_holdmove — hold+move already carried wired by device_layerstack_rise (R3); also its why contained a stray CJK character.\n- cand_un_dark_ii7_hover, cand_un_dark_phrygian_bii, cand_un_dark_epic_descent — dark-minor harmony trimmed to ivm6_noir/metalwarriors/eggreverie; the phrygian bII overlaps the already-judged desert canon.\n- cand_un_famous_ocean_drive — slow night wash duplicated by cw_shenightfall_prog, which carries his words.\n- cand_un_house_four_floor — no dance lane in the current suite; strongest near-miss, revisit if an energetic/dance lane opens.\n- cand_ut_spider_dance_stack — interlock-two-thin-parts device duplicated by combo_r8_attack_hold (his words attached).\n- cand_ut_snowdin_melody — cozy-snow lane covered by snowy_bell_fall; slot given to r15_jp2_flute_call so the jungle lane isn't empty (vibe balance).\n- cand_r22_magikarp_vamp, cand_r22_afo_alien_planing, cand_r22_allstar_rest_loop — afo's semitone planing folded into musha (kept as device); magikarp/allstar are cap casualties, good next-round seeds.\n- cand_lp_r5_guide_tone_bell — no words, and the guide-tone function overlaps negrocity's chromatic walk; rl_r5_ii_v_chain still carries the reel-5 harmony.\n- cand_mir_winter_fingerpick, cand_mir_hope_cliche — the bracketing/walking asks are answered by negrocity + raining_jazz_walk, both of which carry his verbatim complaint.\n- cand_hb_oxygen_minor_v9, cand_hb_marea_planed_maj7 — research-only provenance, no words, each overlapping a kept candidate's device (im9 wash; maj7 planing).\n- cand_r14_arabian_pedal_slide, cand_r14_tropic_descent — desert/descent A/B luxuries; andalusian carries his desert complaint and desert_groove the percussion half.\n- cand_dp_motown_four_snare — rhythm balanced at 8; the missing-snare question is answered across moods by indie/lofi/trip_hop/steam.\n\nVIBE COVERAGE CHECK: happy-menu/task (heavy, mirrors his reels), calm/shop, calm/night, nostalgic/somber, desert (andalusian + desert_groove), jungle (jp2 flute), dark/space (madd9, layerstack, dungeoncave), dark-epic (magus, metalwarriors, eggreverie), battle (rda, taiko, airwolf), haunted (Threed trio), construction/industrial (r4, steam_engine, musha), adventure (airvoyage pair), festival/holiday (r7 pair). Reminder for the audition page: ids are addressed BY NAME forever (project law); render the his_prior_words block verbatim on each card so he can see what he already said.",
};

export const CATALOG_CANDIDATES = {
  "cand_device_layerstack_rise": {
    "id": "cand_device_layerstack_rise",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "device",
    "source": "rl_device_rise_down on audition/reels.html — opts synthRise + frozenSlot (r22 R2) + coprimeCell (R6) + holdMove (R3) + reregister (R1) + doublePeriod (R5) + finalBarBreak, wired from research/reel-layers-r22.md; parts extracted verbatim from the judged mix",
    "why": "His strongest keep of the round: the full r22 layering rulebook running at once. The render carries the three most distinctive parts as actually bound: a FROZEN offbeat E pedal on strings that re-colors as Dm9->Em7b5->F^7->Gm7->A7 move under it (R2: freeze the body); a 3-eighth bass cell re-phasing against the 4/4 bar, realigning every 3 bars (R6: variation with zero note edits); and the rising R-5-b3 epiano motor. His only complaint was mix level (the loud synth was the acc, already fixed via accUnderLead).",
    "his_prior_words": "love this vibe, main synth is too loud though,. otherwise love the layering and it fits the vibe (rl_device_rise_down)",
    "vibes": [
      "mysterious/space",
      "tense/lab",
      "somber/aftermath"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"~ e4 ~ e4 ~ e4 ~ e5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 [f2,bb2] g3 [f2,bb2] e2 [f2,bb2] g3 [f2,bb2]] [e2 bb2 g3 bb2 bb2 g2 e2 d3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
    },
    "pairs_with": [
      "cand_rl_r1_madd9_planed",
      "cand_vg_magus_frozen_motor"
    ],
    "confidence": "high"
  },
  "cand_combo_pizz_onoff_bright": {
    "id": "cand_combo_pizz_onoff_bright",
    "key_mode": "major",
    "key_tonic": "E",
    "type": "instrument_combo",
    "source": "rl_cross_casual_bright's judged stack: lp_r2_barline_bass (contrabass) + lp_r5_offbeat_pluck (pizzicato) + lp_r1_addnine_stack as acc (warm pad), over rp_r2_e_major — comboScore 92/100, 0% mean onset overlap",
    "why": "The cross he praised as a vibe/genre: three layers from three different reels with ZERO shared onsets — bass only at barlines (pickup+downbeat), pad only on chord-bar downbeats (then a whole bar off), pizz only on offbeats. A complete texture where no two layers ever strike together. His one complaint was the engine's glockenspiel, not any reel layer.",
    "his_prior_words": "I like this vibe! I like the pizzicato strings and the on and off synth for this vibe/genre. Glock way too loud... (rl_cross_casual_bright)",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "nostalgic/rest"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[c#3,e3,g#3] ~ [g#2,c3,d#3] ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.25},{\"mini\":\"[~ b4] [~ b4] [~ b4] ~\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3},{\"mini\":\"~@7 d#2 e2@8\",\"sound\":\"gm_contrabass\",\"gain\":0.5}],\"bpm\":102,\"bars\":4}"
    },
    "pairs_with": [
      "cand_rl_r2_e_major_happy",
      "cand_lp_r5_offbeat_pizz",
      "cand_lp_r1_onoff_pad"
    ],
    "confidence": "high"
  },
  "cand_lp_r5_offbeat_pizz": {
    "id": "cand_lp_r5_offbeat_pizz",
    "key_mode": "major",
    "key_tonic": "E",
    "type": "accomp_pattern",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r5_offbeat_pluck (reel 5, isaac.horner, 171.3-223.6s) — cast on rl_cross_casual_bright and rl_casual_task_r3/r5",
    "why": "Purely offbeat FROZEN pedal on pizzicato strings: every onset on an 'and' (1/8, 3/8, 5/8), nothing on any downbeat, nothing on beat 4, one pitch that re-colors as the harmony moves. He named the pizzicato twice in one export. The frozen pedal + pure offbeat is the whole layer — trivially portable to any bright vibe.",
    "his_prior_words": "I like this vibe! I like the pizzicato strings and the on and off synth for this vibe/genre (rl_cross_casual_bright); I like the pizzicato strings (rl_cross_casual_task_active)",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "excited/training"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"[~ b4] [~ b4] [~ b4] ~\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":1}"
    },
    "pairs_with": [
      "cand_rl_r2_e_major_happy",
      "cand_lp_r1_onoff_pad",
      "cand_combo_pizz_onoff_bright"
    ],
    "confidence": "high"
  },
  "cand_lp_r1_onoff_pad": {
    "id": "cand_lp_r1_onoff_pad",
    "key_mode": "major",
    "key_tonic": "E",
    "type": "accomp_pattern",
    "source": "rl_cross_casual_bright's acc slot: lp_r1_addnine_stack (reel 1, redbowmusic, 0-7.7s) as bound on the judged page — gm_pad_warm chord for a bar, silence for a bar",
    "why": "Best identification of his 'on and off synth': the warm pad sounding a chord for one full bar then cutting for one — a harmony layer defined by its SILENCE, a breathing gate rather than a sustain. Needs his confirmation that this is the layer he meant (it is the only on/off-shaped synth on that card).",
    "his_prior_words": "I like the pizzicato strings and the on and off synth for this vibe/genre (rl_cross_casual_bright)",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "mysterious/space"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c#3,e3,g#3] ~ [g#2,c3,d#3] ~>\",\"sound\":\"gm_pad_warm\",\"bpm\":102,\"bars\":4}"
    },
    "pairs_with": [
      "cand_lp_r5_offbeat_pizz",
      "cand_combo_pizz_onoff_bright",
      "cand_rl_r2_e_major_happy"
    ],
    "confidence": "medium"
  },
  "cand_rl_r2_e_major_happy": {
    "id": "cand_rl_r2_e_major_happy",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r2_e_major (reel 2, isaac.horner, 33.6-89.4s)",
    "why": "The 'LEARN HOW THIS SOUNDS HAPPY' reel's measured answer: every chord carries color (m9/^7/6 — never a plain triad), and the only chromatic chord (Go7) lasts ONE beat and always resolves by semitone — chromaticism as motion, never parked. Harmonic rhythm is 3+5 eighths in bar 1 and a 3+3+2 tresillo in bar 2, and the tonic arrives on the and-of-2, never a downbeat. The engine's own 'color is the norm' taste law arriving from his source.",
    "his_prior_words": "casual day / menu / happy vibes (LEARN HOW THIS SOUNDS HAPPY) / bright activity",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "nostalgic/rest"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"9:m9 0:^7 9:m9 2:6 3:o7 4:7 0:^7 9:m9 2:6 3:o7\",\"symbols\":[\"C#m9\",\"E^7\",\"C#m9\",\"F#6\",\"Go7\",\"G#7\",\"E^7\",\"C#m9\",\"F#6\",\"Go7\"],\"family\":\"major\",\"key\":\"E\",\"bpm\":102,\"chordBeats\":[1.5,2.5,1.5,1.5,1,1.5,2.5,1.5,1.5,1]}"
    },
    "pairs_with": [
      "cand_lp_r5_offbeat_pizz",
      "cand_lp_r1_onoff_pad",
      "cand_lp_r2_string_pluck_hole",
      "cand_combo_pizz_onoff_bright"
    ],
    "confidence": "high"
  },
  "cand_combo_808_cluster_task": {
    "id": "cand_combo_808_cluster_task",
    "key_mode": "major",
    "key_tonic": "F",
    "type": "instrument_combo",
    "source": "rl_cross_casual_task's judged stack: lp_r3_bounce_808 (dotted-quarter root chain) + lp_r1_cluster_arp (sawtooth) + a reel-6 rolled-piano acc, over rp_r3_circle_of_fifths — comboScore 97/100, 8% overlap",
    "why": "The highest-scoring cross on the page and his ear agreed with its core: the tresillo-phased 808 roots (a chain of dotted quarters re-phasing against the beat, R6's coprime-cell device carried by the BASS) under the reel-1 cluster arp. His 'it should be more layers' is an explicit instruction to GROW this stack — the best seed combo in the catalog.",
    "his_prior_words": "percussion too loud, the arpeggio synth fits the vibe though (the one that starts in the beginning) but its last variation before it repeats sounds off key, and it should be more layers (rl_cross_casual_task)",
    "vibes": [
      "happy/menu",
      "excited/training",
      "calm/shop"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g1@3 c2@3 f1@2] [f1 d2@7]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<[a4 [g4,a4]@2 c5] [[a4,c5] [g4,a4]@2 c5]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.35}],\"bpm\":140,\"bars\":2}"
    },
    "pairs_with": [
      "cand_lp_r1_cluster_arp_saw",
      "cand_rl_r3_circle_dotted",
      "cand_lp_r3_catchy_pluck",
      "cand_lp_r6_scale_climb"
    ],
    "confidence": "high"
  },
  "cand_lp_r1_cluster_arp_saw": {
    "id": "cand_lp_r1_cluster_arp_saw",
    "key_mode": "minor",
    "key_tonic": "A#",
    "type": "accomp_pattern",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r1_cluster_arp on gm_lead_2_sawtooth (reel 1, redbowmusic, 8.8-32.3s) — cast on rl_cross_casual_task, rl_cross_casual_task_active, rl_cross_industrial_mission",
    "why": "THE arpeggio synth he praised by name. Beats 1, 2, 4 with a deliberate gap on beat 3; the 9 voiced UNDER the b3 so a minor-2nd rub (F/F#) sits inside a consonant stack and two of three voices always ring together. Written for dark_space but his ear ratified it on THREE bright/task crosses — it travels. His one caveat: the re-pitch landing on rp_r3's D7 pass ('its last variation before it repeats sounds off key') — worth an ear-check of the cell over dominant chords.",
    "his_prior_words": "percussion too loud, the arpeggio synth fits the vibe though (the one that starts in the beginning) but its last variation before it repeats sounds off key, and it should be more layers (rl_cross_casual_task)",
    "vibes": [
      "excited/training",
      "happy/menu",
      "tense/construction",
      "mysterious/space"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[f#4 [f4,f#4]@2 a#4] [[f#4,a#4] [f4,f#4]@2 a#4] [c#4 [c4,c#4]@2 f4] [[c#4,f4] [c4,c#4]@2 f4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"bpm\":131,\"bars\":4}"
    },
    "pairs_with": [
      "cand_combo_808_cluster_task",
      "cand_rl_r3_circle_dotted",
      "cand_rl_r1_madd9_planed"
    ],
    "confidence": "high"
  },
  "cand_rl_r3_circle_dotted": {
    "id": "cand_rl_r3_circle_dotted",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r3_circle_of_fifths (reel 3, isaac.horner, 91.9-135.8s)",
    "why": "ii9-V6-I^7-vi9-iii7-V/ii circle of fifths at DOTTED-QUARTER harmonic rhythm: changes on 8ths 0,3,6,9,12,14 of a 2-bar cycle, so F^7 ties across the barline. The barline-crossing lilt is the loop's whole character, and it is the primary replicate of his most-repeated vibe label (reels 3, 5, 8 all 'casual task'). He rated this card's ideas directly.",
    "his_prior_words": "the rhythms and the ideas are good (rl_casual_task_r3) — reel label: Feels like when you're playing Roblox or something and you just get assigned a task in a casual happy game",
    "vibes": [
      "happy/menu",
      "excited/training",
      "calm/shop"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"2:m9 7:6 0:^7 9:m9 4:m7 9:7\",\"symbols\":[\"Gm9\",\"C6\",\"F^7\",\"Dm9\",\"Am7\",\"D7\"],\"family\":\"major\",\"key\":\"F\",\"bpm\":140,\"chordBeats\":[1.5,1.5,1.5,1.5,1,1]}"
    },
    "pairs_with": [
      "cand_lp_r3_catchy_pluck",
      "cand_combo_808_cluster_task",
      "cand_lp_r1_cluster_arp_saw"
    ],
    "confidence": "high"
  },
  "cand_lp_r3_catchy_pluck": {
    "id": "cand_lp_r3_catchy_pluck",
    "key_mode": "major",
    "key_tonic": "F",
    "type": "melody_pattern",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r3_catchy_pluck (reel 3, isaac.horner, 91.9-135.8s) — cast on rl_casual_task_r3",
    "why": "The layer his 'you just got assigned a task' label lives in: FOUR pitches total, frozen while the circle of fifths turns underneath, so one two-note oscillation reads as a 9th, then a root, then a 5th, then a b3. Every 16th sits immediately before a long note — a grace flick into a held pitch, never jitter. The purest frozen-cell hook in the library.",
    "his_prior_words": "the rhythms and the ideas are good (rl_casual_task_r3) — reel label: Feels like when you're playing Roblox ... you just get assigned a task in a casual happy game",
    "vibes": [
      "happy/menu",
      "excited/training",
      "calm/shop"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[~ ~ ~ d5 c5 ~ ~ ~] [c5 ~ ~ d5 c5 ~ a4 d5]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":140,\"bars\":2}"
    },
    "pairs_with": [
      "cand_rl_r3_circle_dotted",
      "cand_combo_808_cluster_task"
    ],
    "confidence": "medium"
  },
  "cand_rl_r6_pedal_sus": {
    "id": "cand_rl_r6_pedal_sus",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r6_dm_f_e7 (reel 6, isaac.horner, 225.4-263.2s)",
    "why": "Two bars of Dm9 pedal, one of F^7, then Esus->E7 resolving at the HALFWAY point of bar 4 — the sus resolution is the vibe mechanism (a V7 makes the loop want to go somewhere: the difference between passive and task-focused). He judged rl_cross_casual_task_active over exactly this harmony and said everything but the piano placement fits.",
    "his_prior_words": "the piano is offbeat. everything else is fine and fits the vibe. (rl_cross_casual_task_active, judged over this progression) — reel label: Sounds like 3. But more mission/task focused like less passive and more like they just got assigned something",
    "vibes": [
      "excited/training",
      "tense/construction",
      "happy/shop"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"5:m9 8:^7 7:sus 7:7\",\"symbols\":[\"Dm9\",\"F^7\",\"Esus\",\"E7\"],\"family\":\"minor\",\"key\":\"A\",\"bpm\":79,\"chordBeats\":[8,4,2,2]}"
    },
    "pairs_with": [
      "cand_lp_r6_scale_climb",
      "cand_combo_808_cluster_task",
      "cand_lp_r1_cluster_arp_saw"
    ],
    "confidence": "high"
  },
  "cand_lp_r6_scale_climb": {
    "id": "cand_lp_r6_scale_climb",
    "key_mode": "minor",
    "key_tonic": "A",
    "type": "melody_pattern",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r6_scale_climb_strings (reel 6, isaac.horner, 225.7-262.4s) — cast on rl_casual_task_active_r6",
    "why": "This row IS his ambient-strings ask, already sitting in the library: an unbroken diatonic string line that SLOWS as it climbs (16ths -> 8ths -> quarters -> a whole note), landing on the dominant and staying — ambiance in 'safe notes' (every pitch a white note) that accumulates over time. Verifying this row answers that note with material he has already heard in context.",
    "his_prior_words": "there should be some ambiance added over time (in safe notes) though like ambient strings or something. this should be abstracted to other songs too. (rl_cross_casual_task_active)",
    "vibes": [
      "excited/training",
      "calm/menu",
      "happy/shop",
      "any-bright-as-ambiance"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c5 b4 a4 g4 a4@9 b4 c5 d5] [e5@8 f5@4 g5@4] [a5 b5 c6 d6] [e6]>\",\"sound\":\"gm_string_ensemble_1\",\"bpm\":79,\"bars\":4}"
    },
    "pairs_with": [
      "cand_rl_r6_pedal_sus",
      "cand_combo_808_cluster_task"
    ],
    "confidence": "high"
  },
  "cand_rl_r8_dorian_climb": {
    "id": "cand_rl_r8_dorian_climb",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r8_dorian_chromatic (reel 8, isaac.horner, 306.6-350.2s)",
    "why": "D dorian with a chromatic bass CLIMB (D -> Eb -> E ... C -> C# -> D) harmonized by passing diminisheds — a chromatic floor under a diatonic top is how the loop moves without changing key, and the dorian inflection keeps a minor tonic reading bright. He judged the faithful card over this exact harmony and liked it. Its ~25% out-of-key rate is the reel's own design, not a defect.",
    "his_prior_words": "I like this!. fits the excited vibe (rl_casual_task_r8) — reel label: sounds like 3.",
    "vibes": [
      "excited/training",
      "happy/menu",
      "tense/construction"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m9 1:o7 2:m7 10:^7 11:m7b5 0:m9 7:o 2:m7 11:m7b5\",\"symbols\":[\"Dm9\",\"Ebo7\",\"Em7\",\"C^7\",\"C#m7b5\",\"Dm9\",\"Ao\",\"Em7\",\"C#m7b5\"],\"family\":\"modal\",\"key\":\"D:dorian\",\"bpm\":150,\"chordBeats\":[1.5,1.5,2.5,1.5,1,1.5,1.5,3,2]}"
    },
    "pairs_with": [
      "cand_combo_r8_attack_hold"
    ],
    "confidence": "high"
  },
  "cand_combo_r8_attack_hold": {
    "id": "cand_combo_r8_attack_hold",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "device",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r8_syncopated_stabs + lp_r8_interlock_stab (reel 8, isaac.horner, 307.6-333.5s) — both cast on rl_casual_task_r8",
    "why": "Two SPARSE parts that sum to an almost-continuous 8th pulse neither plays alone: keys attack on 1, 1.5, 2.5, 4 and the stab on the plain beats, each filling exactly the holes the other leaves (with one real rest — beat 2 of bar 2). His 'I like this! fits the excited vibe' was judged over this pair. The general principle — build drive from two thin interlocking parts instead of one busy one — is what deserves his label.",
    "his_prior_words": "I like this!. fits the excited vibe (rl_casual_task_r8)",
    "vibes": [
      "excited/training",
      "happy/menu",
      "tense/construction"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[d4,f4,a4,c5,e5] [d4,f4,a4,c5] ~ [d4,f4,a4,c5] ~ ~ [d4,f4,a4,c5] ~\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[[d5,f5,a5,c6] [eb5,gb5,a5] [e5,g5,b5,d6] [e5,g5,b5,d6]] [[c5,e5,g5,b5] ~ [c#5,e5,g5,b5] [c#5,e5,g5,b5]]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.35}],\"bpm\":150,\"bars\":2}"
    },
    "pairs_with": [
      "cand_rl_r8_dorian_climb"
    ],
    "confidence": "medium"
  },
  "cand_rl_r4_dorian_major_iv": {
    "id": "cand_rl_r4_dorian_major_iv",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r4_dorian_major_iv (reel 4, isaac.horner, 137.7-169.1s)",
    "why": "Seventeen chords over four bars at uneven beat-level spans, with THE finding: the IV is E MAJOR in B minor — a raised 6th (dorian) keeps a minor key from reading sad, the actual mechanism behind his 'sounds happy' question (mode alone does not separate his labels; mode INFLECTION does). Passing dim7s on half-beats supply drive. He confirmed the vibe on the faithful card; his complaints there were support layers, not this harmony.",
    "his_prior_words": "this does give that excited vibe! (rl_industrial_mission_r4) — reel label: Feels a bit more industrial like construction or a mission or something",
    "vibes": [
      "tense/construction",
      "excited/lab",
      "excited/training"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m9 3:7 5:6 3:7 2:7 7:m7 0:m9 3:7 4:o7 5:6 3:m7 3 2:m7 2:7 7:7 10 11:o7\",\"symbols\":[\"Bm9\",\"D7\",\"E6\",\"D7\",\"C#7\",\"F#m7\",\"Bm9\",\"D7\",\"D#o7\",\"E6\",\"Dm7\",\"D\",\"C#m7\",\"C#7\",\"F#7\",\"A\",\"A#o7\"],\"family\":\"minor\",\"key\":\"B\",\"bpm\":123,\"chordBeats\":[1,1,1.5,0.5,2,2,1,0.5,0.5,1,0.5,0.5,1,1,1,0.5,0.5]}"
    },
    "pairs_with": [
      "cand_lp_r1_cluster_arp_saw",
      "cand_dp_steam_engine_backbeat"
    ],
    "confidence": "high"
  },
  "cand_lp_r7_frozen_bell": {
    "id": "cand_lp_r7_frozen_bell",
    "key_mode": "major",
    "key_tonic": "Gb",
    "type": "melody_pattern",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r7_frozen_bell_tune (reel 7, isaac.horner, 265.0-304.8s) — cast on rl_holiday_bright_r7, rl_cross_holiday_bright, rl_cross_dark_space",
    "why": "The bell he called happy: a FROZEN 3-note tune (3-5-R+, quarters and halves, entering at beat 2.5) held unchanged while chords cycle at one per beat underneath. With harmony that fast a re-pitching melody would have no shape, so it does not — freezing IS the craft. His caveat is a labeling instruction, not a rejection: don't copy-paste it onto every happy song.",
    "his_prior_words": "the bell is happy but shouldn't be applied as a copy to every happy song (rl_cross_holiday_bright)",
    "vibes": [
      "happy/festival",
      "triumphant/snow",
      "nostalgic/kitchen"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"~@3 bb4 db5@2 gb5@2\",\"sound\":\"gm_tubular_bells\",\"gain\":0.5},{\"mini\":\"[gb3,bb3,db4] [g3,bb3,db4] [ab3,b3,eb4] [db4,f4,ab4]\",\"sound\":\"piano\",\"gain\":0.38}],\"bpm\":144,\"bars\":2}"
    },
    "pairs_with": [
      "cand_rl_r7_beat_rate"
    ],
    "confidence": "high"
  },
  "cand_rl_r7_beat_rate": {
    "id": "cand_rl_r7_beat_rate",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r7_beat_rate_changes (reel 7, isaac.horner, 265-304.8s)",
    "why": "The fastest harmonic rhythm in the set: I-#i°-ii-V with a chord ON EVERY BEAT and the beat-2 chord alternating (passing #i° on odd bars, vi9 on even) — the four-chords-per-bar turnaround device. The r32 retranscription answered his earlier 'G to G#m rising tension' card (the real chord is a one-beat passing diminished), but that fix has not been re-eared, and his crossed card flagged 'notes right next to each other' in the harmony synth voicing — so the progression needs judging separate from that voicing.",
    "his_prior_words": "Sounds like happy holiday vibes (reel 7 label); the bell is happy... also the main harmony synth has a bit of dissonance (notes right next to each other) which doesn't fit happy (rl_cross_holiday_bright)",
    "vibes": [
      "happy/festival",
      "triumphant/snow",
      "nostalgic/kitchen"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0 1:o 2:m 7 0 9:m9 2:m 7 0 1:m 2:m 7 0 9:m9 2:m 7\",\"symbols\":[\"Gb\",\"Go\",\"Abm\",\"Db\",\"Gb\",\"Ebm9\",\"Abm\",\"Db\",\"Gb\",\"Gm\",\"Abm\",\"Db\",\"Gb\",\"Ebm9\",\"Abm\",\"Db\"],\"family\":\"major\",\"key\":\"Gb\",\"bpm\":144,\"chordBeats\":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}"
    },
    "pairs_with": [
      "cand_lp_r7_frozen_bell"
    ],
    "confidence": "medium"
  },
  "cand_lp_r2_string_pluck_hole": {
    "id": "cand_lp_r2_string_pluck_hole",
    "addon_gain": 1.6,
    "type": "rhythm",
    "source": "src/lib/layer-patterns.js LAYER_PATTERNS.lp_r2_string_pluck (reel 2, isaac.horner, 33.6-89.4s)",
    "why": "Straight staccato 8ths with THE LAST 8TH OF EVERY BAR LEFT EMPTY — seven hits, one hole. The hole is what stops it reading as a machine (a producer arriving at the D102 metronome-test instinct by hand). The simplest transferable rhythm in the whole set: any pluck voice can carry it in any bright lane.",
    "his_prior_words": "casual day / menu / happy vibes (LEARN HOW THIS SOUNDS HAPPY) (reel 2 label)",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "excited/training"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\"],\"sounds\":[\"gm_pizzicato_strings\"],\"bpm\":102}"
    },
    "pairs_with": [
      "cand_rl_r2_e_major_happy",
      "cand_lp_r1_onoff_pad"
    ],
    "confidence": "medium"
  },
  "cand_rl_r5_ii_v_chain": {
    "id": "cand_rl_r5_ii_v_chain",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r5_two_beat_changes (reel 5, isaac.horner, 171.3-223.6s)",
    "why": "A descending chain of ii-Vs (Bm7-E7 is ii-V of A, Am7-D7 is ii-V of G) looping back deceptively, one chord every 2 beats — a jazz motion device none of the engine's own pools contain. His earlier card already corrected its one defect (the m9 droning the tonic under the bVII is now m7), so the current form is untried by his ear and worth a clean verdict.",
    "his_prior_words": "third chord in the progression sounds weird because you added a note which makes it sounds dissonant (his r32-era card that produced the m9 -> m7 fix) — reel label: Sounds like 3. Vibes",
    "vibes": [
      "happy/menu",
      "calm/shop",
      "excited/training"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m7 5:7 10:m7 3:7\",\"symbols\":[\"Bm7\",\"E7\",\"Am7\",\"D7\"],\"family\":\"minor\",\"key\":\"B\",\"bpm\":148,\"chordBeats\":[2,2,2,2]}"
    },
    "pairs_with": [
      "cand_lp_r5_offbeat_pizz"
    ],
    "confidence": "medium"
  },
  "cand_rl_r1_madd9_planed": {
    "id": "cand_rl_r1_madd9_planed",
    "type": "harmony",
    "source": "src/lib/layer-patterns.js REEL_PROGRESSIONS.rp_r1_iv_i_add9 (reel 1, redbowmusic, 8.8-32.3s)",
    "why": "Two madd9 chords (R-9-b3-5, NO seventh) of two bars each, chord 2 a literal -5 transposition of chord 1, with the 9 voiced UNDER the b3 so a minor-2nd cluster sits at the top of an otherwise consonant stack — the reel's title device ('the most overpowered chord in all dark music'), the same friction-between-consonances principle as D93's fifth pincer from an independent source. Verified acoustically by FFT. Dark lane only.",
    "his_prior_words": "Dark and space ish ... this is good pattern for the genre as a supplement and also for energy vibes for dark vibes (reel 1 label)",
    "vibes": [
      "mysterious/space",
      "tense/lab",
      "somber/cave"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"5:madd9 0:madd9\",\"symbols\":[\"D#madd9\",\"A#madd9\"],\"family\":\"minor\",\"key\":\"A#\",\"bpm\":131,\"chordBeats\":[8,8]}"
    },
    "pairs_with": [
      "cand_lp_r1_cluster_arp_saw",
      "cand_device_layerstack_rise"
    ],
    "confidence": "medium"
  },
  "cand_cw_shenightfall_prog": {
    "id": "cand_cw_shenightfall_prog",
    "type": "harmony",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/shenightfall (...).mid — pad track 3 + bass of track 1, bars 0-15, G minor, 78bpm",
    "why": "i(m9) to bVI^7 shuttle that detours through v(m7) instead of a V: Gm9 | Eb^7 | Dm7 | Eb^7, one chord per 2 bars. The minor dominant is what keeps it nocturnal — no leading tone ever pulls home, and the pad voices it as bare dyads (D+A, D+G, C+F, G+D) so the color comes from bass+figure, not a block chord.",
    "his_prior_words": "chord progression feels like night -> save it",
    "vibes": [
      "calm/night",
      "somber/town",
      "mysterious/calm"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m9 8b:^7 7:m7 8b:^7\",\"family\":\"minor\",\"bpm\":78,\"note\":\"2 bars per chord, tonic G; pad plays open dyads not full stacks\"}"
    },
    "pairs_with": [
      "cand_cw_shenightfall_harpsi",
      "cand_cw_shenightfall_drums"
    ],
    "confidence": "high"
  },
  "cand_cw_shenightfall_harpsi": {
    "id": "cand_cw_shenightfall_harpsi",
    "key_mode": "minor",
    "key_tonic": "G",
    "type": "accomp_pattern",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/shenightfall (...).mid — track 1 (rendered steel guitar, he heard harpsichord), bars 0-7, exact pitches",
    "why": "A statement/answer sub-foundation: bar A strikes the low root, climbs two grace 16ths (2nd, 3rd of the chord scale) and lands HELD on the chord's 7th for the rest of the bar; bar B repeats the climb but answers with a turn (F-G-D...C-D). The grace-climb-onto-the-7th is the whole character — the engine has no figure that lands and holds a 7th.",
    "his_prior_words": "the harpsichord is very good save it too as a sub-foundation",
    "vibes": [
      "calm/night",
      "somber/town"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3] [d3 g3 a3 f4@13] [d3 g3 a3 f4 ~ g4 ~ d4@3 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 a#4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4] [c4,f4] [c4,f4] [g3,d4] [g3,d4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":8}"
    },
    "pairs_with": [
      "cand_cw_shenightfall_prog",
      "cand_cw_shenightfall_drums"
    ],
    "confidence": "high"
  },
  "cand_cw_shenightfall_drums": {
    "id": "cand_cw_shenightfall_drums",
    "addon_gain": 1.2,
    "type": "rhythm",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/shenightfall (...).mid — drum track 6 (ch 10), bars 8-10 measured",
    "why": "Three-deck groove: 16th shaker carpet at half velocity, cabasa marking every offbeat 8th, and a tresillo-leaning kick (0, 3/16, 7/16, 8/16, 11/16, 15/16) with a 32nd flam after beat 1, under a plain 2+4 snare. The kick syncopation against the straight backbeat is what makes it night-walk rather than pop.",
    "his_prior_words": "I love the drums",
    "vibes": [
      "calm/night",
      "somber/town",
      "groovy/calm"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":78,\"onsets\":[\"0/16\",\"5/48\",\"3/16\",\"7/16\",\"8/16\",\"11/16\",\"15/16\",\"4/16\",\"12/16\",\"2/16\",\"4/16\",\"6/16\",\"7/16\",\"8/16\",\"10/16\",\"11/16\",\"12/16\",\"14/16\",\"2/16\",\"6/16\",\"10/16\",\"14/16\",\"0/16\",\"1/16\",\"2/16\",\"3/16\",\"4/16\",\"5/16\",\"6/16\",\"7/16\",\"8/16\",\"9/16\",\"10/16\",\"11/16\",\"12/16\",\"13/16\",\"14/16\",\"15/16\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\"],\"note\":\"shaker lane at gain ~0.5\"}"
    },
    "pairs_with": [
      "cand_cw_shenightfall_prog",
      "cand_cw_shenightfall_harpsi",
      "cand_pr_proto_mediant_shuttle"
    ],
    "confidence": "high"
  },
  "cand_cw_dungeoncave_lefthand": {
    "id": "cand_cw_dungeoncave_lefthand",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "accomp_pattern",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/dungeoncave(...).mid — track 1 (fx atmosphere), bars 0-2, exact 48-note cycle, D minor, 60bpm",
    "why": "A continuous 16th ostinato whose cycle is THREE bars, built from five 4-note cells that rotate out of phase with the barline — it never feels like a loop even though it repeats verbatim. He explicitly asked for it note-exact; this is the exact 48 pitches. Against 4-bar sections it phases, a structural device the engine has never had.",
    "his_prior_words": "I like the left hand, but its complex so copy the note progression exactly, and the melody",
    "vibes": [
      "mysterious/dungeon",
      "dark/cave",
      "tense/calm"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d3 a3 g3 c4 f3 a3 g3 f3 g3 f3 e3 c3 d3 a3 g3 c4] [a3 e4 c4 a#3 a3 f3 g3 e3 d3 a3 g3 c4 f3 a3 g3 f3] [g3 f3 e3 c3 d3 a3 g3 c4 a3 e4 c4 a#3 a3 f3 g3 e3]>\",\"sound\":\"gm_pad_bowed\",\"bpm\":60,\"bars\":3,\"note\":\"dark epiano also works; original is GM fx-4 atmosphere\"}"
    },
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_cw_airpirate_lattice": {
    "id": "cand_cw_airpirate_lattice",
    "key_mode": "minor",
    "key_tonic": "G",
    "type": "instrument_combo",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/1-05_Air_Pirate_Secret_Base_XG (...).mid — timpani trk 3, marimbas trks 7/9/11, vibraphone trk 17, bars 2-8, G minor, 105bpm",
    "why": "The 'layering' is a lattice of one-pitch cogs: timpani thumps D2 on beats with an F2 pickup, THREE marimbas each play ONLY offbeat 8ths locked on a single pitch (D5, G4, and G5 stepping to F5 — only one cog ever moves), and a vibraphone holds the full Gm7 a whole bar. Every layer is trivial alone; the ensemble is the music. The buildable version of his repeated 'layering' praise, and the offbeat cogs are the same species as his 'on and off synth'.",
    "his_prior_words": "I like the bass, percussion, and the layering",
    "vibes": [
      "sneaky/base",
      "tense/mission",
      "groovy/dungeon"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1,\"note\":\"low part is timpani in source; source adds conga 16th pairs + woodblock offbeats + claps on 2/3/4 with tambourine, all at whisper velocity\"}"
    },
    "pairs_with": [
      "cand_cw_airpirate_bass"
    ],
    "confidence": "high"
  },
  "cand_cw_airpirate_bass": {
    "id": "cand_cw_airpirate_bass",
    "addon_gain": 1.25,
    "key_mode": "minor",
    "key_tonic": "G",
    "type": "accomp_pattern",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/1-05_Air_Pirate_Secret_Base_XG (...).mid — fretless bass track 15, bars 6-9 (2-bar riff)",
    "why": "Staccato G pedal in a 3-3-2-3-3-2 16th grid with an octave pop on the second onset (G1...G2...G1), answering bar drops to D2-F2-D2. The 3-3-2 inside each half-bar is what makes it prowl; every note is short and the register never leaves the floor, so the marimba lattice above it stays clear.",
    "his_prior_words": "I like the bass, percussion, and the layering",
    "vibes": [
      "sneaky/base",
      "tense/mission"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[g1 ~ ~ g2 ~ ~ g1 ~ g1 ~ ~ f2 ~ ~ g1 ~] [g1 ~ ~ g2 ~ ~ g1 ~ g1 ~ ~ d2 f2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"bpm\":105,\"bars\":2,\"octaveShift\":1,\"note\":\"fretless in source; g1 register inaudible in browser mix, auditioned an octave up\"}"
    },
    "pairs_with": [
      "cand_cw_airpirate_lattice"
    ],
    "confidence": "high"
  },
  "cand_cw_airvoyage_pendulum": {
    "id": "cand_cw_airvoyage_pendulum",
    "key_mode": "major",
    "key_tonic": "Bb",
    "type": "instrument_combo",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/Air_Voyage (...).mid — strings trk 3 + bass trk 7, bars 1-8, Bb major, 140bpm",
    "why": "The 'bass compliments the violin' mechanism, measured: strings pendulum Bb4-F4-Bb3-F4 in staccato straight 8ths (root high, 5th mid, root low — three registers of one triad; only the inner F moves to E on the chord change) while the bass hammers Bb 8ths with octave-doubled accents on beat 1, beat 3 and the and-of-3. Two rhythmically identical parts that read as motion because they trade REGISTER, not rhythm — D102's law as a concrete preset.",
    "his_prior_words": "love the melody, it feels very adventury, bass compliments the violin",
    "vibes": [
      "adventure/flight",
      "excited/journey"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 e4 a#3 e4 a#4 e4 a#3 e4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":3,\"note\":\"strings staccato; source adds a 16th shaker carpet\"}"
    },
    "pairs_with": [
      "cand_cw_airvoyage_melody"
    ],
    "confidence": "high"
  },
  "cand_cw_airvoyage_melody": {
    "id": "cand_cw_airvoyage_melody",
    "key_mode": "major",
    "key_tonic": "Bb",
    "type": "melody_pattern",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/Air_Voyage (...).mid — flute track 1, bars 5-8 (antecedent phrase)",
    "why": "The adventury cell: hold a long note ~1.5 beats, double-tap its lower neighbor in two 16ths, then DROP a 4th and hold; answer bar climbs the triad in quarters (Bb-D-F). The neighbor-mordent-before-the-drop is the signature ornament, and the phrase breathes a full beat before the pickup — held-not-jittery exactly as D98 asks.",
    "his_prior_words": "love the melody, it feels very adventury",
    "vibes": [
      "adventure/flight",
      "excited/journey",
      "happy/overworld"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[a#4@6 a4 a#4 f4@8] [~ a#4 d5 f5] [e5@6 d5 e5 c5@8] [~ ~ ~ d5]>\",\"sound\":\"gm_flute\",\"bpm\":140,\"bars\":4}"
    },
    "pairs_with": [
      "cand_cw_airvoyage_pendulum"
    ],
    "confidence": "high"
  },
  "cand_cw_evening_royalroad": {
    "id": "cand_cw_evening_royalroad",
    "type": "harmony",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/eveningnighttown (...).mid — slap bass trk 1 + steel gtr trk 13, bars 0-3, C major, ~120bpm",
    "why": "IV | V | iii(m7) | vi — the royal-road loop, served with a whole-note bass and a broken-chord guitar that deliberately SKIPS beat 3 (onsets on 16ths 0,2,4,6,10,12,14), so the bar has a hole where the pulse should be. shenmue_rain in his manual-r22 set runs the same family (IV V vi at 65bpm) — two independent files he saved carry this progression: a taste signal, not a coincidence.",
    "his_prior_words": "I love the layering and everything. the bass, the chord progression along with the overlaying of different instruments over it, the melody",
    "vibes": [
      "calm/night",
      "happy/town",
      "nostalgic/evening"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"5 7 4:m7 9:m\",\"family\":\"major\",\"bpm\":120,\"note\":\"1 bar per chord, tonic C; acc = broken chord R-5-R-3 on 16ths 0,2,4,6,10,12,14 (beat 3 silent); bass = whole notes\"}"
    },
    "pairs_with": [
      "cand_cw_rush_layering",
      "cand_un_indie_backbeat"
    ],
    "confidence": "high"
  },
  "cand_cw_morning_hexarp": {
    "id": "cand_cw_morning_hexarp",
    "key_mode": "major",
    "key_tonic": "A",
    "type": "accomp_pattern",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/shenmue_morning(...).mid — harp trk 5 + low strings trk 1, bars 0-5, A major",
    "why": "The 'specific intervals': a one-octave 8th-note climb A-B-C#-E-F#-G#-A-B — the major scale with NO 4th (R 2 3 5 6 7 R 2), so it shimmers without ever rubbing the third — and it plays one bar ON, one bar OFF, leaving silence for the strings dyad to answer. The engine's arp figures never skip the 4th and never rest a whole bar; both halves are the heartfelt-new-day character.",
    "his_prior_words": "feels heartfelt like a new day, i like how the piano arrpegio thing (with the specific intervals it had) combined with the strings, along with the melody",
    "vibes": [
      "heartfelt/morning",
      "calm/new-day",
      "hopeful/town"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6,\"note\":\"source doubles roots an octave down on tuba; strings are bare dyads, never triads\"}"
    },
    "pairs_with": [
      "cand_cw_reflection_duet"
    ],
    "confidence": "high"
  },
  "cand_cw_reflection_duet": {
    "id": "cand_cw_reflection_duet",
    "addon_gain": 0.6,
    "key_mode": "major",
    "key_tonic": "C",
    "type": "device",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/soa_reflection (...).mid — epiano trk 3 + synth voice trk 1, bars 0-3, 65bpm, vi-iii-IV-I in C",
    "why": "'Finishes each other' is a shared landing point: the epiano climbs a wide arp in the first half-bar (root-5th-9th) and lands HELD at the and-of-2; the voice holds the low root from beat 1 and speaks its one answer note at exactly that same and-of-2. Both voices converge on one instant every bar, and the arp's 9th-heavy spacing (a3-e4-b4-g5) keeps it reflective rather than sweet. A call-response device the engine has zero of.",
    "his_prior_words": "I like how the duet finishes each other), and the vibe is reflective",
    "vibes": [
      "reflective/calm",
      "somber/memory",
      "calm/shop"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a3@2 e4@2 b4@2 g5@10] [e3@2 b3@2 g4@2 e5@10] [f3@2 d4@2 g4@2 e5@10] [c3@2 g3@2 e4@2 g5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5},{\"mini\":\"<[a3@6 b4@10] [e3@6 a4@10] [f3@6 a4@10] [c3@6 c5@10]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.4}],\"bpm\":65,\"bars\":4,\"note\":\"answer voice is a synth voice in source\"}"
    },
    "pairs_with": [
      "cand_cw_morning_hexarp"
    ],
    "confidence": "high"
  },
  "cand_cw_rush_layering": {
    "id": "cand_cw_rush_layering",
    "addon_gain": 0.75,
    "key_mode": "minor",
    "key_tonic": "C",
    "type": "instrument_combo",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/Rush2049OverStats (...).mid — bass trks 0-3 (octave-doubled pair), horn/fx trk 4, C dorian-ish, ~120bpm",
    "why": "Two-pitch machine: the bass chatters only C2 and D2 in mutating 16th bursts (~9 hits/bar, never the same bar twice, Bb1 walkdown at phrase end), doubled a full octave below for sub weight — motion from TWO pitches, pure rhythm-as-melody. Over it a horn swells ONE safe note (C4, then Bb3) for ~a bar at a time, entering roughly every 2 bars so it drifts in and out. The swell-note-that-comes-and-goes is his 'ambiance added over time (in safe notes)' ask, found in his own collection.",
    "his_prior_words": "love the bass patterns and the layering and how the horn fades in and out, and the percussion",
    "vibes": [
      "energetic/menu",
      "groovy/stats",
      "cool/racing"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [d2 d2 ~ d2 ~ ~ ~ c2 ~ d2 c2 ~ c2 d2 ~ d2] [d2 ~ d2 ~ ~ ~ c2 d2 ~ c2 ~ a#1 a#1 ~ a#1 a#1]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8,\"note\":\"bass doubled an octave down at gain 0.5 in source; horn entries are off-grid (every ~1.85 bars) — the drift against the barline is part of the effect; horn = slow-attack swell\"}"
    },
    "pairs_with": [
      "cand_cw_evening_royalroad"
    ],
    "confidence": "high"
  },
  "cand_cw_desert_groove": {
    "id": "cand_cw_desert_groove",
    "addon_gain": 1.4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/desert-town (...).mid — drum trk 2, bars 2-3, 85bpm",
    "why": "A question-answer bar: kick speaks only in the FIRST half (beat 1 + and-of-2), then hand percussion answers in the second half (bongo on 3, cabasa 10/16-12/16-14/16, muted conga on 4, tambourine flourish 14-15/16). No snare, no hat. Different from the engine's iqa' rows — those are dum/tak lines; this is a kit-role split across the bar halves.",
    "his_prior_words": "the percussion is very deserty, and the flute complimenting and the bass and the melody",
    "vibes": [
      "desert/town",
      "calm/market"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":85,\"onsets\":[\"0/16\",\"6/16\",\"0/16\",\"14/16\",\"15/16\",\"8/16\",\"10/16\",\"12/16\",\"14/16\",\"12/16\"],\"sounds\":[\"md_kick\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_bongo_hi\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_conga_mute\"],\"note\":\"kick soft\"}"
    },
    "pairs_with": [
      "cand_r14_andalusian_descent"
    ],
    "confidence": "medium"
  },
  "cand_vg_airwolf_gallop_pedal": {
    "id": "cand_vg_airwolf_gallop_pedal",
    "key_mode": "minor",
    "key_tonic": "Bb",
    "type": "accomp_pattern",
    "source": "audios/vgmusic/nes/airwolf_title.mid (ch1 sawtooth root pump + aggregate acc, figure recurs 14 of 36 bars; extracted bars 8 and 10)",
    "why": "A root PEDAL hammering a gallop rhythm (16th-16th-rest-16th, every beat) while the upper voice climbs the minor arpeggio f-g#-a#-c# and folds back down — the same cell every bar, re-seated when the chord moves Bbm -> Db. His repeated-intervals energy figure with a rhythm the engine doesn't have: synthRise runs straight 8ths, this gallops. One pattern = motor + harmony at once.",
    "his_prior_words": "some given intervals and it repeats those intervals over and over to convey energy",
    "vibes": [
      "energetic/mission",
      "tense/flight"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[[a#2,a#3] [a#2,f4] ~@1 [a#2,g#4] [a#2,a#4] [a#2,c#5] ~@1 [a#2,g#4] [a#2,a#4] [a#2,f4] ~@1 [a#2,g#4] [a#2,d#4] [a#2,f4] ~@1 [a#2,g#4]] [[c#3,c#4] [c#3,g#4] ~@1 [c#3,b4] [c#3,c#5] [c#3,e5] ~@1 [c#3,b4] [c#3,c#5] [c#3,g#4] ~@1 [c#3,b4] [c#3,f#4] [c#3,g#4] ~@1 [c#3,b4]]>\",\"sound\":\"gm_lead_2_sawtooth\",\"bpm\":140,\"bars\":2}"
    },
    "pairs_with": [
      "cand_vg_metalwarriors_bvi_bii_loop"
    ],
    "confidence": "high"
  },
  "cand_vg_magus_frozen_motor": {
    "id": "cand_vg_magus_frozen_motor",
    "addon_gain": 0.4,
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "device",
    "source": "audios/vgmusic/snes/Chrono2.mid (Chrono Trigger Magus-theme arrangement; electric-grand motor ch6 + choir ch3, bars 4-7, D minor 95bpm)",
    "why": "A high dotted-rhythm cell (long-short-short) that drops an octave inside itself — d7 d7 d6 d6 a6 a6 — FROZEN while the harmony walks underneath, with slow choir dyads floating d5-g4 / d5-e5 above the gloom. R2 freeze-the-body confirmed from a third independent source (after the reels and the Synthesia clip), in the dark-epic register instead of the bright one: the cell never follows the chord, and that refusal IS the menace.",
    "his_prior_words": "some given intervals and it repeats those intervals over and over to convey energy",
    "vibes": [
      "dark/epic",
      "menacing/boss"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[d7@2 d7 d6 d6 a6@2 a6 d7@2 d7 c7 c7 a6@2 a6] [g6@2 g6 c7 c7 a6@2 a6 g6@2 g6 d6 d6 a6@2 a6] [d7@2 d7 d6 d6 a6@2 a6 d7@2 d7 c7 c7 a6@2 a6] [g6@2 g6 c7 c7 a6@2 a6 g6@2 g6 c7 c7 a6@2 a6]>\",\"sound\":\"gm_celesta\",\"gain\":0.7},{\"mini\":\"<[~@5 d5@5 g4@5 ~@1] [~@5 d5@5 g4@5 ~@1] [~@5 d5@5 e5@5 ~@1] [~@5 e5@5 d5@5 ~@1]>\",\"sound\":\"gm_choir_aahs\",\"gain\":0.35}],\"bpm\":95,\"bars\":4}"
    },
    "pairs_with": [
      "cand_device_layerstack_rise"
    ],
    "confidence": "high"
  },
  "cand_vg_dq_pizz_flute_stack": {
    "id": "cand_vg_dq_pizz_flute_stack",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "instrument_combo",
    "source": "audios/vgmusic/gameboy/DQ1_2_-_Unknown_World.mid (pizzicato ch0 + flute ch1, bars 4-5, D minor, 50bpm)",
    "why": "Pizzicato strings running steady 16ths where the low D pedal returns EVERY beat and the inner dyad walks up f/a -> g/b -> a/c -> f/bb — four chords in one bar over one bass note — while a flute sighs the aeolian descent d-c-bb above. At 50bpm the pizz reads as raindrops, not drive. Chords-over-pedal as pattern, and his praised pizzicato as the voice carrying it.",
    "his_prior_words": "I like the pizzicato strings and the on and off synth for this vibe/genre",
    "vibes": [
      "somber/vast",
      "calm/overworld"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.55},{\"mini\":\"<[d5@2 a5@2 g5@6 f5 e5 d5@2 c5 a#4] [c5 a4 e5@2 d5@11 ~@1]>\",\"sound\":\"gm_flute\",\"gain\":0.9}],\"bpm\":50,\"bars\":2}"
    },
    "pairs_with": [
      "cand_vg_rd_panflute_nocturne"
    ],
    "confidence": "high"
  },
  "cand_vg_rd_panflute_nocturne": {
    "id": "cand_vg_rd_panflute_nocturne",
    "key_mode": "minor",
    "key_tonic": "Bb",
    "type": "instrument_combo",
    "source": "audios/vgmusic/snes/rd-star_stealing_girl.mid (Radical Dreamers 'The Girl Who Stole the Stars'; pan flute ch1 + piano ch0 + strings ch2, bars 12-15, Bb minor, 64bpm)",
    "why": "Three-layer nocturne: a HIGH pan flute (octave 6) sighing two-note descents with long holds, a piano rocking wide two-hand broken tenths (bass note answered by a single high chord tone, never a block chord), and one held wide string chord per bar as the ambient floor. The flute sits an octave above everything so it never fights; the strings are the 'ambiance in safe notes' he asked to abstract. The strongest calm/nostalgic cast in the whole 400-file library.",
    "his_prior_words": "there should be some ambiance added over time (in safe notes) ... like ambient strings ... this should be abstracted to other songs too",
    "vibes": [
      "calm/nostalgic",
      "somber/night",
      "peaceful/ending"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@8 g#6@6 f#6 f6] [c#6@8 d#6@8] [f6@12 a#5@2 c6@2] [c#6 c6 c#6@10 c6@2 g#5@2]>\",\"sound\":\"gm_pan_flute\",\"gain\":0.9},{\"mini\":\"<[[d#2,g#5]@2 a#2@2 f3@2 [f#3,f#5] f5 [g#3,c#5]@4 c#3@4] [[b1,g#5]@2 f#2@2 c#3@2 [d#3,f#5] f5 [f#3,d#5]@4 [f3,c#5]@2 d#5@2] [[a#1,g#3,c#5] c5 [a#2,g#3,c#5]@2 c#3@2 c3@2 d#3@2 c3@2 c#3@2 c3@2] [a#1@2 a#2@2 c#3@2 c3@2 d#3@2 c3@2 c#3@2 c3@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[d#2,a#4,f5]@16] [[b1,f#4,f#5]@14 g#4@2] [[a#1,a#4,f5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
    },
    "pairs_with": [
      "cand_vg_dq_pizz_flute_stack"
    ],
    "confidence": "high"
  },
  "cand_ut_raining_jazz_walk": {
    "id": "cand_ut_raining_jazz_walk",
    "key_mode": "minor",
    "key_tonic": "F",
    "type": "accomp_pattern",
    "source": "audios/Undertale MIDI/Undertale - Its Raining Somewhere Else.mid, bars 16-20 (harmony row ut_its_raining_somewhere_else_p1: im-vm7-im-iim7-VII^7-ivm7, F minor, coverage 0.95)",
    "why": "A working demonstration of exactly the walking piano he asked for: the left hand states the chord as a low block on beat 1, holds, then WALKS single bass notes (c3-g2, then c2-c3-f2-g2) stepwise into the next chord while the melody answers in sparse held phrases. The walk happens between chords, not inside the chord — the shape D101 measured at zero in the engine.",
    "his_prior_words": "the piano doesnt do any walking. there's not any extra notes between chords or countermelody etc in the piano - it's just chord bouncing (his r20 nostalgic_casino note - this loop is the device that answers it)",
    "vibes": [
      "nostalgic/casino",
      "somber",
      "calm/night"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 eb5@2 d5@2 eb5@4 c5@2 d5@2] [eb5@2 bb5@2 g5@2 eb5@4 d5@2 c5@2 g4@2] [~@4 d5@2 c5@2 d5@4 g4@2 a4@2] [bb4@2 f5@4 d5@8 ~@2]>\",\"sound\":\"piano\",\"gain\":1.0},{\"mini\":\"<[[eb3,g3,bb3] ~@5 c3@6 g2@4] [c2@6 c3@6 f2@2 ~ g2] [[bb2,d3,f3]@6 g2@6 d2@4] [g1@6 g2@6 d2@2 eb2 bb2]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":110,\"bars\":4}"
    },
    "pairs_with": [
      "cand_un_emo_im9_wash",
      "cand_un_lofi_backbeat",
      "cand_hs_negrocity_walking_bass"
    ],
    "confidence": "high"
  },
  "cand_hs_negrocity_walking_bass": {
    "id": "cand_hs_negrocity_walking_bass",
    "key_mode": "minor",
    "key_tonic": "C",
    "type": "accomp_pattern",
    "source": "audios/hsmusic/midnight-crew-drawing-dead__Liquid Negrocity - MrCheeze.mid, track 3 (bass, meanMidi 37.5), bars 18-25 — 38% stepwise motion at 4 quarter-note onsets/bar, the highest walk rate in a 40-file hsmusic sample",
    "why": "A real noir walking bass in quarters: C-Eb-F-Gb climbing chromatically into | G-Gb-F-Bb walking chromatically back down to the b7 — every non-chord tone is approached AND left by step, exactly the bracketing the corpus does (48.7% approach / 43.6% resolution) and the engine does 0% of. Later bars walk pure chromatic descents (Bb-A-Ab-G). The concrete cell for 'walking between chords'.",
    "his_prior_words": "the piano doesnt do any walking. there's not any extra notes between chords or countermelody etc in the piano - it's just chord bouncing",
    "vibes": [
      "nostalgic/casino",
      "jazz-noir/urban",
      "mysterious/stealth"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
    },
    "pairs_with": [
      "cand_dp_trip_hop_groove",
      "cand_ut_raining_jazz_walk",
      "cand_un_dark_ivm6_noir"
    ],
    "confidence": "high"
  },
  "cand_dp_steam_engine_backbeat": {
    "id": "cand_dp_steam_engine_backbeat",
    "addon_gain": 0.35,
    "type": "rhythm",
    "source": "src/lib/rhythms-drum-patterns.js rows dp_steam_engine_1_* (already imported, ratified:false, accents:null) <- audios/drum-patterns/steam-engine-1.html (90bpm)",
    "why": "A locomotive double-stroke kick — 16ths 0,2,4 then 8,10,12: chuff-CHUFF-chuff on each half — under a plain 2-and-4 snare backbeat, with clave/conga rows as the metal-adjacent top. Machinery-as-groove: an industrial floor that is a BEAT, not a stick sample, and the judged suite currently has zero mid-band snare anywhere. Five sibling patterns (steam_engine_2-5) give the construction lane variety instead of one literal row.",
    "his_prior_words": "the same 3 stick is just used every construction or what?",
    "vibes": [
      "construction/industrial",
      "mission/tense-work",
      "train"
    ],
    "render": {
      "kind": "library_rows",
      "spec": "[\"dp_steam_engine_1_bd\",\"dp_steam_engine_1_sd\",\"dp_steam_engine_1_ch\",\"dp_steam_engine_1_hc\",\"dp_steam_engine_1_cl\"]"
    },
    "pairs_with": [
      "cand_rl_r4_dorian_major_iv"
    ],
    "confidence": "high"
  },
  "cand_r14_andalusian_descent": {
    "id": "cand_r14_andalusian_descent",
    "type": "harmony",
    "source": "research/progressions-desert-jungle-r14.md §2 item 2 (StudyBass/Wikipedia; ZeldaDungeon notes Gerudo is this with the middle chords swapped) — researched r14, never wired (only the Gerudo rotation entered DESERT_TROPES)",
    "why": "i-bVII-bVI-V7: the flamenco original of the Gerudo lane he already keeps. Same harmonic-minor descent onto a major V7, but stepwise bVII->bVI instead of Gerudo's swap — slightly more Spanish, equally desert. The doc's intended use is the B-letter/bridge partner of the Gerudo trope so desert sections own their harmony instead of looping one trope.",
    "his_prior_words": "I still don't think the chord progression sounds like a desert. look into other game desert chord progressions.",
    "vibes": [
      "desert",
      "epic/dark-adventure"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m 10b 8b 7:7\",\"family\":\"modal\",\"bpm\":100}"
    },
    "pairs_with": [
      "cand_cw_desert_groove"
    ],
    "confidence": "high"
  },
  "cand_hs_moonsetter_pushcomp": {
    "id": "cand_hs_moonsetter_pushcomp",
    "type": "accomp_pattern",
    "source": "audios/hsmusic/homestuck-vol-9__Moonsetter - Twix Stix.mid, bars 8-11 (Toby Fox; 130bpm): root eb3/db3 at 16ths 0 and 8, upper triad gb-bb-db / f-ab-c struck at 16ths 2,6,10,14",
    "why": "Root alone on beats 1 and 3, then the m7 chord's UPPER STRUCTURE (3-5-7 as one triad) pumped on the surrounding off-8ths — a four-note voicing by construction, split into bass-hit / color-stab so it breathes on and off instead of block-bouncing. The 16th-2 placement (a push right after the beat, not the ska offbeat) is what makes it float.",
    "his_prior_words": "see how the chord is four notes not your typical chord",
    "vibes": [
      "calm/nostalgic",
      "space/night",
      "casual/menu"
    ],
    "render": {
      "kind": "figure",
      "spec": "{\"onsets\":[\"0/1\",\"1/8\",\"3/8\",\"1/2\",\"5/8\",\"7/8\"],\"figure\":[\"R\",\"3.5.7\",\"3.5.7\",\"R\",\"3.5.7\",\"3.5.7\"],\"class\":\"comp\",\"octave\":3,\"legato\":false,\"bpm\":130,\"note\":\"7 token is safe here only over chords that carry a 7th (m7/^7); prefer s7 if generalized\"}"
    },
    "pairs_with": [
      "cand_hs_skyisland_lastbeat_lift"
    ],
    "confidence": "high"
  },
  "cand_hs_skyisland_lastbeat_lift": {
    "id": "cand_hs_skyisland_lastbeat_lift",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "harmony",
    "source": "audios/hsmusic/alterniabound__BL1ND JUST1C3 - 1NV3ST1G4T1ON !! - Sky Island.mid — chordLoops(repaired): Dm7x3|F^7x1 half-bars, x2+ reps, coverage 0.89, 112bpm",
    "why": "i7 held for 1.5 bars, then bIII^7 arriving on BEAT 4 — the chord change lands off the barline, a 3+1 half-bar harmonic rhythm. A small, cheap mechanism for harmony that moves at a unique moment instead of on the section grid, and the maj7 lift on the weak beat is what gives the courtroom theme its skip.",
    "his_prior_words": "changes not just in strict section bar, and also changes an a unique way",
    "vibes": [
      "quirky/casual",
      "task/investigation",
      "playful"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d3,f3,a3,c4] [[d3,f3,a3,c4]@3 [f3,a3,c4,e4]]>\",\"sound\":\"piano\",\"bpm\":112,\"bars\":2}"
    },
    "pairs_with": [
      "cand_hs_moonsetter_pushcomp"
    ],
    "confidence": "medium"
  },
  "cand_r23_taiko_trailer_gallop": {
    "id": "cand_r23_taiko_trailer_gallop",
    "addon_gain": 0.5,
    "type": "rhythm",
    "source": "research/percussion-catalog.md §4 'Taiko action-trailer figure' (2-bar phrase; low don at 16ths 0,6,8,14 with rim ka between, then 8ths -> 16th fill -> accented unison landing) — researched, never wired",
    "why": "The classic war-drum build: bar 1 is a dotted-8th gallop with rim answers, bar 2 straightens to 8ths and floods into a 16th fill that LANDS as one accented unison hit. A 2-bar arc, not a loop — exactly the toms+crash 'solid' battle floor his boss note asked for, as a phrase with a destination.",
    "his_prior_words": "the drums don't feel too solid yet, they feel very bare minimum.",
    "vibes": [
      "war/boss",
      "epic/army"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0/1\",\"1/8\",\"1/4\",\"3/8\",\"5/8\",\"3/4\",\"7/8\",\"1/1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"25/16\",\"13/8\",\"27/16\",\"7/4\"],\"sounds\":[\"vc_wardrum\",\"md_stick\",\"md_stick\",\"vc_wardrum\",\"md_stick\",\"md_stick\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\",\"vc_wardrum\"],\"bpm\":140}"
    },
    "pairs_with": [
      "cand_hs_rda_halfbar_shuttle",
      "cand_r22_eggreverie_loop"
    ],
    "confidence": "medium"
  },
  "cand_vg_metalwarriors_bvi_bii_loop": {
    "id": "cand_vg_metalwarriors_bvi_bii_loop",
    "type": "harmony",
    "source": "audios/vgmusic/snes/Metal_Warriors-Vital_Mission.mid (loop at bar 80, x2, coverage 0.99; verified against bass ch10 + guitar ch11 bars 80-87)",
    "why": "Gb^7 (2 bars) -> Bbm7 (2) -> B7 (2) -> Bbm7 (2) in Bb minor: bVI^7 into the tonic, then the bII DOMINANT 7 leaning on the tonic from a semitone above before falling back. The bII7 is a tritone-sub gesture almost nothing in the current canon does — dark-heroic mission energy, 100% colored chords, every root verified against two independent channels.",
    "his_prior_words": "",
    "vibes": [
      "tense/industrial",
      "energetic/mission",
      "dark/epic"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"8:^7 8:^7 0:m7 0:m7 1:7 1:7 0:m7 0:m7\",\"family\":\"minor\",\"bpm\":150}"
    },
    "pairs_with": [
      "cand_vg_airwolf_gallop_pedal",
      "cand_vg_musha_sus_planing"
    ],
    "confidence": "high"
  },
  "cand_vg_threed_iv_mixture_vamp": {
    "id": "cand_vg_threed_iv_mixture_vamp",
    "type": "harmony",
    "source": "audios/vgmusic/snes/EB_Threed.mid (EarthBound 'Threed', guitar ch3 + bass ch13 bars 4-19; D major, 100bpm)",
    "why": "A major tonic that keeps flinching into iv MINOR over its own pedal: D... then Gm/D for two beats... back to D. The b6 (Bb) arrives as one sighing chord and leaves. The haunted-town formula — warm and wrong at once — and it is mixture, not chromaticism, so it sits exactly on his color-is-the-norm / chromaticism-is-rejected line. The horn melody touches Bb over the Gm and resolves it by step.",
    "his_prior_words": "",
    "vibes": [
      "haunted/town",
      "creepy/calm"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0 5:m 0\",\"family\":\"major\",\"bpm\":100,\"chordBeats\":[6,2,8]}"
    },
    "pairs_with": [
      "cand_vg_threed_harp_zigzag",
      "cand_vg_threed_horn_echo"
    ],
    "confidence": "high"
  },
  "cand_vg_threed_harp_zigzag": {
    "id": "cand_vg_threed_harp_zigzag",
    "addon_gain": 0.5,
    "key_mode": "major",
    "key_tonic": "D",
    "type": "accomp_pattern",
    "source": "audios/vgmusic/snes/EB_Threed.mid (orchestral harp ch5, continuous 16ths bars 15-37; extracted bars 16-17)",
    "why": "A broken-triad 16ths ostinato that zigzags the SAME three pitch classes across THREE octaves — d5 a4 f#5 d5 a5 f#5 d6 a5 f#6 and back down — then re-pitches the identical contour when the chord flinches to Gm. High-low register alternation as one continuous line: shimmering, machine-steady, and it never crowds the melody because it owns no rhythm of its own. The engine's arps stay inside one octave; this is what three buys.",
    "his_prior_words": "",
    "vibes": [
      "haunted/town",
      "mysterious/forest"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d5 a4 f#5 d5 a5 f#5 d6 a5 f#6 d6 a5 f#5 d5 a4 f#5 d5] [a#4 g4 d5 a#4 g5 d5 a#4 g4 f#4 a4 d5 a4 f#5 d5 a5 f#5]>\",\"sound\":\"gm_orchestral_harp\",\"bpm\":100,\"bars\":2}"
    },
    "pairs_with": [
      "cand_vg_threed_iv_mixture_vamp",
      "cand_vg_threed_horn_echo"
    ],
    "confidence": "high"
  },
  "cand_vg_threed_horn_echo": {
    "id": "cand_vg_threed_horn_echo",
    "key_mode": "major",
    "key_tonic": "D",
    "type": "device",
    "source": "audios/vgmusic/snes/EB_Threed.mid — track literally named 'ENGLISH HORN (Echo)': same pitches, exactly 0.5 beat late, velocity 98 vs 127 (77%). The atlas's echo-doubling device (42% of doubled files, median half-beat offset) measured live; vgmusic-techniques-r20.md marks it 'a device the engine does not have'.",
    "why": "Echo doubling: the lead re-played by a second copy of itself half a beat behind at ~three-quarter volume. Costs zero new musical material, and it answers 'add another layer' the way half the corpus actually does — width and haunt from delay, not from another melody. On a sparse spooky lead the echo fills the holds without ever colliding, because it only ever plays what just happened.",
    "his_prior_words": "",
    "vibes": [
      "haunted/town",
      "mysterious/cave",
      "calm/space"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 f#4@2 g4@2 a4@4 d5@4] [c#5@4 a4@4 c5@2 a#4@4 a4 g4]>\",\"sound\":\"gm_oboe\",\"gain\":0.9},{\"mini\":\"<[~@6 f#4@2 g4@2 a4@4 d5@2] [d5@2 c#5@4 a4@4 c5@2 a#4@2 a4 g4]>\",\"sound\":\"gm_oboe\",\"gain\":0.68}],\"bpm\":100,\"bars\":2}"
    },
    "pairs_with": [
      "cand_vg_threed_iv_mixture_vamp",
      "cand_vg_threed_harp_zigzag"
    ],
    "confidence": "high"
  },
  "cand_ut_shop_planing": {
    "id": "cand_ut_shop_planing",
    "type": "harmony",
    "source": "audios/Undertale MIDI/Undertale - Shop.mid (ut_shop_p2 in src/lib/progressions-undertale.js, loop at bar 16, coverage 0.94)",
    "why": "The definitive game-shop loop: four chords that PLANE downward in parallel (Db^7 - Cm7 - Bbm - Ab^7) rather than resolve functionally — every chord keeps the same voicing shape a step lower, which is what makes it feel like browsing, not traveling. All qualities in the safe dialect; cycles in 2 bars.",
    "his_prior_words": "",
    "vibes": [
      "calm/shop",
      "casual/menu",
      "nostalgic"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"1b:^7 0:m7 10:m 8:^7\",\"family\":\"minor\",\"bpm\":110,\"barsPerChord\":[0.5,0.5,0.5,0.5]}"
    },
    "pairs_with": [
      "cand_ut_shop_bounce_acc",
      "cand_un_lofi_backbeat",
      "cand_un_emo_planed_maj7"
    ],
    "confidence": "high"
  },
  "cand_ut_shop_bounce_acc": {
    "id": "cand_ut_shop_bounce_acc",
    "key_mode": "minor",
    "key_tonic": "F",
    "type": "accomp_pattern",
    "source": "audios/Undertale MIDI/Undertale - Shop.mid, acc hand bars 0-4 (transcribed verbatim, 16th grid)",
    "why": "The Shop comp shape: low root held on beat 1, then TWO offbeat full-triad stabs per half-bar chord (root - stab - stab). A bounce that never lands on the beat with the chord, so it grooves without drums. Directly reusable as an engine acc figure class distinct from block/offbeat rows because the bass note and the stabs alternate registers.",
    "his_prior_words": "",
    "vibes": [
      "calm/shop",
      "casual/task",
      "happy/menu"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[db4@2 f4 ~@3 [f4,ab4,c5] ~ c4@2 [eb4,g4,bb4] ~@3 [eb4,g4,bb4] ~] [bb3@2 [db4,f4,g4] ~@3 [db4,f4,ab4] ~ ab3@2 [c4,eb4,g4] ~@3 [c4,eb4,ab4] ~]>\",\"sound\":\"gm_epiano1\",\"bpm\":110,\"bars\":2}"
    },
    "pairs_with": [
      "cand_ut_shop_planing",
      "cand_un_lofi_backbeat"
    ],
    "confidence": "high"
  },
  "cand_ut_snowy_bell_fall": {
    "id": "cand_ut_snowy_bell_fall",
    "key_mode": "major",
    "key_tonic": "G",
    "type": "melody_pattern",
    "source": "audios/Undertale MIDI/Undertale - Snowy.mid, melody bars 0-4 (4/4, MIDI bpm 120, G-major area)",
    "why": "The iconic cozy-snow opening cell: a long held d6 that FALLS to a g5-a5-b5-a5-g5 turn, stated twice, then the third bar slips the whole gesture down a semitone (db6/gb5 — chromatic planing of the same shape) before landing on a held b5. One bar of melody, one bar of echo, one chromatic surprise, one breath — a complete antecedent in 4 bars, and the semitone slip is placed variation, not noodling.",
    "his_prior_words": "",
    "vibes": [
      "nostalgic/snow",
      "calm/town",
      "somber-sweet"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [db6@6 ~@2 gb5 ~ g5 ~ [a5,b5] a5@2 d6] [b5@16]>\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":4}"
    },
    "pairs_with": [
      "cand_un_emo_im9_wash"
    ],
    "confidence": "high"
  },
  "cand_un_emo_im9_wash": {
    "id": "cand_un_emo_im9_wash",
    "type": "harmony",
    "source": "row un_emotional_minor_prog_07_gb in src/lib/progressions-unison.js (unratified; audios/Unison+Free+Emotional+MIDI+Chord+Progressions/07 - Gb Major - Eb Minor/Minor Prog 07, label-note match clean)",
    "why": "im9 - ivm9 - VI^7 - vm7: every chord carries color (color is the norm), no dominant anywhere, so it washes instead of cadencing — the minor-9 on both i and iv is the wistful blur, and the vm7 ending loops back to i without an arrival. The strongest somber/nostalgic loop in the emotional pack; needs zero dialect adaptation.",
    "his_prior_words": "",
    "vibes": [
      "nostalgic",
      "somber",
      "calm/rain"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m9 5:m9 8:^7 7:m7\",\"family\":\"minor\",\"bpm\":76,\"barsPerChord\":[1,1,1,1]}"
    },
    "pairs_with": [
      "cand_ut_raining_jazz_walk",
      "cand_ut_snowy_bell_fall"
    ],
    "confidence": "high"
  },
  "cand_un_dark_ivm6_noir": {
    "id": "cand_un_dark_ivm6_noir",
    "type": "harmony",
    "source": "row un_dark_minor_prog_02_f in src/lib/progressions-unison.js (unratified; audios/Unison+Free+Dark+MIDI+Chord+Progressions/06 - F Major - D Minor/Minor Prog 02, label-note match clean)",
    "why": "ivm6 - III^7 - i: the minor-six chord is the classic noir 'sigh' (its added 6th is the key's 2nd degree hanging unresolved), and III^7 approaches the tonic from above instead of a V. Three chords, two bars of tonic to breathe — a tense loop that stays consonant, exactly the D93 dosing shape. m6 is a full dialect quality since r16 and almost nothing in the engine uses it.",
    "his_prior_words": "",
    "vibes": [
      "tense/manor",
      "dark/calm",
      "mysterious"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"5:m6 3:^7 0:m 0:m\",\"family\":\"minor\",\"bpm\":72,\"barsPerChord\":[1,1,1,1]}"
    },
    "pairs_with": [
      "cand_dp_trip_hop_groove",
      "cand_hs_negrocity_walking_bass"
    ],
    "confidence": "high"
  },
  "cand_un_indie_backbeat": {
    "id": "cand_un_indie_backbeat",
    "type": "rhythm",
    "source": "rows un_indie_dance_different_kick / _snare / _hat in src/lib/rhythms-unison.js (unratified; from audios/Unison Free LoFi Drum Kit/Drum Loops/Indie Dance)",
    "why": "The textbook backbeat the judged suite has ZERO of (every kit is kick+hat, no mid band): kick on 1 and 3, snare on 2 and 4, hats on the offbeat 8ths. One bar, totally legible, and the single highest-leverage promotion available because the engine's known drum bug is exactly the missing snare. Assembled from three already-extracted unratified rows.",
    "his_prior_words": "",
    "vibes": [
      "casual/bright",
      "happy/town",
      "excited"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0/1\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\"],\"sounds\":[\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\"],\"bpm\":105}"
    },
    "pairs_with": [
      "cand_vg_gijoe_quartal_comp",
      "cand_cw_evening_royalroad"
    ],
    "confidence": "high"
  },
  "cand_un_lofi_backbeat": {
    "id": "cand_un_lofi_backbeat",
    "type": "rhythm",
    "source": "rows un_hip_hop_major_kick + un_hip_hop_major_clap in src/lib/rhythms-unison.js (unratified; audios/Unison Free LoFi Drum Kit/Drum Loops/Hip-Hop, 106bpm, 4-bar loop)",
    "why": "Half-time lofi backbeat: clap lands only mid-bar (the half-time '3'), kick syncopates around it with a 15/8 and 23/8 push, and bar 4 varies the clap placement (3.125 and 3.5) as a built-in fill — a 4-bar groove with its own variation, not a 1-bar stamp. The right floor for shop/task/menu material where a full backbeat would be too eager.",
    "his_prior_words": "",
    "vibes": [
      "calm/shop",
      "casual/task",
      "nostalgic"
    ],
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0/1\",\"1/2\",\"1/1\",\"3/2\",\"15/8\",\"2/1\",\"5/2\",\"23/8\",\"3/1\",\"25/8\",\"7/2\",\"31/8\"],\"sounds\":[\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"md_clap\",\"vc_tom_lo\"],\"bpm\":106}"
    },
    "pairs_with": [
      "cand_ut_shop_planing",
      "cand_ut_raining_jazz_walk"
    ],
    "confidence": "high"
  },
  "cand_dp_trip_hop_groove": {
    "id": "cand_dp_trip_hop_groove",
    "addon_gain": 0.35,
    "type": "rhythm",
    "source": "src/lib/rhythms-drum-patterns.js rows dp_trip_hop_* (imported, ratified:false) <- audios/drum-patterns/trip-hop.html (90bpm, 4 bars)",
    "why": "90bpm backbeat on 2 and 4 under straight 8th hats, kick on 1 + and-of-2 + 3-and, low conga ghost at bar-end — and it EVOLVES: each of the four bars moves the kick pickups and adds snare ghosts while the hats hold still, so the groove develops without a fill. Slow, moody, snare-forward: the exact mid-band-with-development the judged suite's kick+hat kits never produce.",
    "his_prior_words": "",
    "vibes": [
      "mysterious/manor",
      "stealth/rain",
      "sad/urban"
    ],
    "render": {
      "kind": "library_rows",
      "spec": "[\"dp_trip_hop_bd\",\"dp_trip_hop_sd\",\"dp_trip_hop_ch\",\"dp_trip_hop_lc\"]"
    },
    "pairs_with": [
      "cand_hs_negrocity_walking_bass",
      "cand_un_dark_ivm6_noir"
    ],
    "confidence": "high"
  },
  "cand_r22_eggreverie_loop": {
    "id": "cand_r22_eggreverie_loop",
    "type": "harmony",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/manual-r22/EggReverie.mid — chordLoops(repaired), G minor, 90bpm",
    "why": "Finale-grade minor loop: i(m7) | bVI^7 | bVII(sus) | i(m7). The sus on the bVII is the move — it withholds the third exactly where a pop loop would blare it, so the return to i lands huge without any dominant. Epic-without-chromaticism, squarely inside his color-is-the-norm law.",
    "his_prior_words": "",
    "vibes": [
      "epic/finale",
      "triumphant/boss",
      "emotional/climax"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:m7 8b:^7 10b:sus 0:m7\",\"family\":\"minor\",\"bpm\":90,\"note\":\"tonic G, 1 bar per chord\"}"
    },
    "pairs_with": [
      "cand_r23_taiko_trailer_gallop"
    ],
    "confidence": "high"
  },
  "cand_pr_proto_mediant_shuttle": {
    "id": "cand_pr_proto_mediant_shuttle",
    "type": "harmony",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/piano-refs/get_proto-2.mid — research/misc-refs-r15.md artifact 2 (E major, measured swing 0.585)",
    "why": "The 6th-chord mediant shuttle: 0 0 8b 8b 0 0 8b 7 (8-bar loop, bar-8 turnaround to V), with the 6th color coming from the FIGURE (R 3 5 6 / cascade), not the symbol — and it only grooves under his measured 0.585 swing, which opts.swing already implements from this exact file. The one r15 artifact that pairs a progression with its figure AND its feel, still unauditioned as a unit.",
    "his_prior_words": "",
    "vibes": [
      "goofy/chill",
      "playful/lounge",
      "happy/menu"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0 0 8b 8b 0 0 8b 7\",\"family\":\"major\",\"bpm\":96,\"note\":\"tonic E; acc figure 'R 3 5 6' (the 6 token, never 7); requires opts.swing 0.585, subdiv beats*2\"}"
    },
    "pairs_with": [
      "cand_cw_shenightfall_drums"
    ],
    "confidence": "high"
  },
  "cand_hs_rda_halfbar_shuttle": {
    "id": "cand_hs_rda_halfbar_shuttle",
    "key_mode": "minor",
    "key_tonic": "F",
    "type": "harmony",
    "source": "audios/hsmusic/alterniabound__Rex Duodecim Angelus - Malcolm Brown.mid — chordLoops(repaired): 16 half-bar chords Fm|Csus alternating x2 reps, coverage 0.95, 200bpm",
    "why": "i and Vsus trade every HALF BAR for eight straight bars at 200bpm — the engine of a famous strife theme. Sub-bar harmonic rhythm is the engine's newest capability (chordBeats, D122) with almost no library material behind it, and the sus keeps the dominant thirdless, matching the measured battle law that stakes-harmony is OPEN (power fifths up, thirds down, dissonance down).",
    "his_prior_words": "",
    "vibes": [
      "battle/boss",
      "chase/energetic"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"[f2,f3,ab3,c4] [c3,g3,c4,f4]\",\"sound\":\"piano\",\"bpm\":200,\"bars\":1}"
    },
    "pairs_with": [
      "cand_r23_taiko_trailer_gallop"
    ],
    "confidence": "high"
  },
  "cand_vg_gijoe_quartal_comp": {
    "id": "cand_vg_gijoe_quartal_comp",
    "key_mode": "minor",
    "key_tonic": "D",
    "type": "accomp_pattern",
    "source": "audios/vgmusic/nes/GIJOEAF.mid (aggregate acc bars 8-9 over the D-dorian funk vamp; companion figure 'ninth dyads' recurs 8 of 48 bars)",
    "why": "A funk comp built from STACKED FOURTHS ([d4,g4], [e4,a4], [a4,e5]) bouncing over an alternating d3/c3 bass, with push-pull stab placement instead of downbeat chords. The engine has never sounded a 4th above its own bass (r16: 99.3% of acc notes were R/b3/3/5) — the missing interval class doing groove work, what makes NES funk sound modern rather than polka.",
    "his_prior_words": "",
    "vibes": [
      "energetic/funk",
      "casual/action"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[[d3,d4,g4]@2 c3 ~@1 [d3,d4,g4]@2 [c3,e4,a4] [d3,c#4,f#4]@2 d3 ~@1 c3 [g3,g4,d5] ~@1 [a3,a4,e5] ~@1] [[a#3,c4,f4]@2 a3 ~@1 [a#3,c4,f4]@2 [a3,d4,g4] [b3,c4,e4]@2 c4 ~@1 a3 [c4,e4,c5] ~@1 [a3,f#4,d5] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":2}"
    },
    "pairs_with": [
      "cand_un_indie_backbeat"
    ],
    "confidence": "medium"
  },
  "cand_vg_musha_sus_planing": {
    "id": "cand_vg_musha_sus_planing",
    "type": "device",
    "source": "audios/vgmusic/genesis/Musha_Aleste-Theme.mid (loop at bar 13, coverage 0.95, C minor) — instance of the never-wired planing technique (vgmusic-techniques-r20.md section 2: planing occurs in three quarters of files)",
    "why": "Fsus - Gsus - Cm - Fm7 - Ebsus: SUS chords sliding to new roots keeping their quality (planing). The sus quality removes the third so the parallel motion never makes parallel-third mud — pure open muscle, reads tense-heroic without one dissonant vertical. The technique compendium recorded planing as a corpus-dominant device the engine has never had; this is a concrete, colorful instance to judge it by.",
    "his_prior_words": "",
    "vibes": [
      "tense/industrial",
      "energetic/mission"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"5:sus 7:sus 0:m 5:m7 3:sus\",\"family\":\"minor\",\"bpm\":128,\"chordBeats\":[4,2,4,2,4]}"
    },
    "pairs_with": [
      "cand_vg_metalwarriors_bvi_bii_loop"
    ],
    "confidence": "medium"
  },
  "cand_un_emo_planed_maj7": {
    "id": "cand_un_emo_planed_maj7",
    "type": "harmony",
    "source": "row un_emotional_major_prog_07_gb in src/lib/progressions-unison.js (unratified; source chords are all maj9 — rendered here as ^7 because ^9 is outside the safe dialect)",
    "why": "I - bIII - bVI - bII, every chord the SAME maj7 quality planed around a chromatic-mediant circle — no functional logic at all, pure dreamlike color-shifting. The identical device to the Undertale Shop loop (parallel planing) transposed into wide-eyed major, so A/B-ing the two isolates whether he likes the DEVICE or the mode. Rare shape: nothing in the engine's pools moves by chromatic mediants.",
    "his_prior_words": "",
    "vibes": [
      "dreamy",
      "nostalgic",
      "calm/space"
    ],
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:^7 3b:^7 8b:^7 1b:^7\",\"family\":\"major\",\"bpm\":84,\"barsPerChord\":[1,1,1,1]}"
    },
    "pairs_with": [
      "cand_ut_shop_planing"
    ],
    "confidence": "medium"
  },
  "cand_r15_jp2_flute_call": {
    "id": "cand_r15_jp2_flute_call",
    "key_mode": "minor",
    "key_tonic": "G",
    "type": "melody_pattern",
    "source": "research/jungle-language-r15.md §1.4 (JP2 SNES jungle pan-flute call grammar, measured: signature call 1-4-5 landing 6.5 beats held; answers 1-4-5-b7 or 5-4-b2-1; b2->1 upper-neighbor x11; 1.4 onsets/bar, 40% of notes >=2 beats) — was never wired",
    "why": "A thirdless quartal CALL: pickup on the and-of-1, hop 1->4->5 and HOLD the 5th for most of two bars, answered by a 5-4-b2-1 descent whose b2->1 sigh is the only chromatic note. At 1.4 onsets/bar over a busy floor it is a sparse-calls lead mode the engine's melody density targets cannot reach — the missing atmospheric-jungle voice, and the only jungle-lane candidate in this catalog.",
    "his_prior_words": "",
    "vibes": [
      "calm/deep-jungle",
      "mysterious/ruins",
      "exploration"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[~@2 g4@4 c5@2 d5@8] [d5@16] [~@2 d5@4 c5@2 ab4@8] [g4@16]>\",\"sound\":\"gm_pan_flute\",\"bpm\":122,\"bars\":4}"
    },
    "pairs_with": [],
    "confidence": "medium"
  },
"cand_vg_magus_motor_only": {
    "id": "cand_vg_magus_motor_only",
    "batch": 2,
    "key_tonic": "D",
    "key_mode": "minor",
    "addon_gain": 0.85,
    "type": "device",
    "source": "split from cand_vg_magus_frozen_motor per his pair note (rl_r6_pedal_sus) — the celesta motor alone, gain dropped from 0.7 to 0.45 for his 'high part way way too loud'",
    "why": "The frozen high motor by itself: the same 3-note cell re-attacked over every chord, no choir. He asked to judge it separated from the choir and quieter, as background.",
    "his_prior_words": "the choir and the frozen motor should be separated, and the glockenspiel too loud (magus pair note, rl_r6)",
    "vibes": ["mysterious/space", "tense/lab"],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[d7@2 d7 d6 d6 a6@2 a6 d7@2 d7 c7 c7 a6@2 a6] [g6@2 g6 c7 c7 a6@2 a6 g6@2 g6 d6 d6 a6@2 a6] [d7@2 d7 d6 d6 a6@2 a6 d7@2 d7 c7 c7 a6@2 a6] [g6@2 g6 c7 c7 a6@2 a6 g6@2 g6 c7 c7 a6@2 a6]>\",\"sound\":\"gm_celesta\",\"gain\":0.45}],\"bpm\":95,\"bars\":4}"
    },
    "pairs_with": ["cand_vg_magus_choir_only"],
    "confidence": "high"
  },
  "cand_vg_magus_choir_only": {
    "id": "cand_vg_magus_choir_only",
    "batch": 2,
    "key_tonic": "D",
    "key_mode": "minor",
    "type": "device",
    "source": "split from cand_vg_magus_frozen_motor per his pair note (rl_r6_pedal_sus) — the choir alone",
    "why": "The slow two-note choir line by itself. His note: the choir fits where the motor does not — so it needs its own label.",
    "his_prior_words": "choir fits. the choir and the frozen motor should be separated (magus pair notes, rl_r3/rl_r6)",
    "vibes": ["mysterious/space", "somber/aftermath"],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@5 d5@5 g4@5 ~@1] [~@5 d5@5 g4@5 ~@1] [~@5 d5@5 e5@5 ~@1] [~@5 e5@5 d5@5 ~@1]>\",\"sound\":\"gm_choir_aahs\",\"gain\":0.35}],\"bpm\":95,\"bars\":4}"
    },
    "pairs_with": ["cand_vg_magus_motor_only"],
    "confidence": "high"
  },
  "cand_vg_dq_pizz_only": {
    "id": "cand_vg_dq_pizz_only",
    "batch": 2,
    "key_tonic": "D",
    "key_mode": "minor",
    "type": "accomp_pattern",
    "source": "split from cand_vg_dq_pizz_flute_stack per his pair note (rl_r2) — the pizzicato lattice alone",
    "why": "The pedal-anchored pizzicato lattice by itself: d4 pedal alternating with the chord's upper tones. He likes it individually where the bundled pair did not fit.",
    "his_prior_words": "I like the flute and pizza in these parts individually but just dont fit here (dq pair note, rl_r2)",
    "vibes": ["calm/shop", "nostalgic/rest"],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
    },
    "pairs_with": ["cand_vg_dq_flute_only"],
    "confidence": "high"
  },
  "cand_vg_dq_flute_only": {
    "id": "cand_vg_dq_flute_only",
    "batch": 2,
    "key_tonic": "D",
    "key_mode": "minor",
    "type": "melody_pattern",
    "source": "split from cand_vg_dq_pizz_flute_stack per his pair note (rl_r2) — the flute line alone",
    "why": "The long-held flute answer phrase by itself. He likes it individually; label where it belongs.",
    "his_prior_words": "I like the flute and pizza in these parts individually but just dont fit here (dq pair note, rl_r2)",
    "vibes": ["calm/shop", "somber/snow"],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d5@2 a5@2 g5@6 f5 e5 d5@2 c5 a#4] [c5 a4 e5@2 d5@11 ~@1]>\",\"sound\":\"gm_flute\",\"bpm\":50,\"bars\":2,\"gain\":0.7}"
    },
    "pairs_with": ["cand_vg_dq_pizz_only"],
    "confidence": "high"
  },
  "cand_vg_rd_panflute_lead_only": {
    "id": "cand_vg_rd_panflute_lead_only",
    "batch": 2,
    "key_tonic": "Bb",
    "key_mode": "minor",
    "type": "melody_pattern",
    "source": "split from cand_vg_rd_panflute_nocturne per his pair note (rl_r3) — the pan flute line alone",
    "why": "The nocturne's pan flute line by itself — he called it a strong part of a song and asked to evaluate the bundle in its parts.",
    "his_prior_words": "the parts fit a lot actually but I think evaluate this in its parts not a whole (rl_r3); with the pan flute be careful since this is a strong part of a song (rl_r2)",
    "vibes": ["calm/night", "somber/aftermath"],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[~@8 g#6@6 f#6 f6] [c#6@8 d#6@8] [f6@12 a#5@2 c6@2] [c#6 c6 c#6@10 c6@2 g#5@2]>\",\"sound\":\"gm_pan_flute\",\"bpm\":64,\"bars\":4,\"gain\":0.7}"
    },
    "pairs_with": ["cand_vg_rd_nocturne_bed"],
    "confidence": "high"
  },
  "cand_vg_rd_nocturne_bed": {
    "id": "cand_vg_rd_nocturne_bed",
    "batch": 2,
    "key_tonic": "Bb",
    "key_mode": "minor",
    "type": "accomp_pattern",
    "source": "split from cand_vg_rd_panflute_nocturne per his pair note (rl_r3) — the piano + string bed without the lead",
    "why": "The nocturne's accompaniment by itself: rolled piano low-register comp under a whisper string pad. The other half of his 'evaluate this in its parts'.",
    "his_prior_words": "the parts fit a lot actually but I think evaluate this in its parts not a whole (rd nocturne pair note, rl_r3)",
    "vibes": ["calm/night", "somber/aftermath"],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[d#2,g#5]@2 a#2@2 f3@2 [f#3,f#5] f5 [g#3,c#5]@4 c#3@4] [[b1,g#5]@2 f#2@2 c#3@2 [d#3,f#5] f5 [f#3,d#5]@4 [f3,c#5]@2 d#5@2] [[a#1,g#3,c#5] c5 [a#2,g#3,c#5]@2 c#3@2 c3@2 d#3@2 c3@2 c#3@2 c3@2] [a#1@2 a#2@2 c#3@2 c3@2 d#3@2 c3@2 c#3@2 c3@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[d#2,a#4,f5]@16] [[b1,f#4,f#5]@14 g#4@2] [[a#1,a#4,f5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
    },
    "pairs_with": ["cand_vg_rd_panflute_lead_only"],
    "confidence": "high"
  },
  "cand_b2_dr_shadowrun_creep": {
      "id": "cand_b2_dr_shadowrun_creep",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/Shadowrun-HotelRoom.mid, bars 8-9 (the 2-bar loop covers 100% of the 16 drummed bars, verified raw), ch9. File carries no tempo event; SMF default 120bpm used.",
      "why": "Stealth creep: the kick moves in 16th PAIRS on the ands (16ths 2-3, 6-7, 10-11), a tambourine ghosts the same pairs a velocity tier down (v60 vs v110), and the snare backbeat doubles itself once per two bars (beat 4 + one 16th) while bar 2 closes with a two-16th kick run into the loop. cov 1.00 of all drummed bars, vel 60-127.",
      "his_prior_words": "",
      "vibes": [
          "sneaky/stealth",
          "tense/hideout",
          "mysterious/night"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":2,\"onsets\":[\"0\",\"1/8\",\"3/16\",\"3/8\",\"7/16\",\"1/2\",\"5/8\",\"11/16\",\"1\",\"9/8\",\"19/16\",\"11/8\",\"23/16\",\"3/2\",\"13/8\",\"27/16\",\"15/8\",\"31/16\",\"1/8\",\"3/16\",\"3/8\",\"7/16\",\"5/8\",\"11/16\",\"7/8\",\"9/8\",\"19/16\",\"11/8\",\"23/16\",\"13/8\",\"27/16\",\"1/4\",\"3/4\",\"13/16\",\"5/4\",\"7/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_cw_airpirate_lattice"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_dkc_water_congas": {
      "id": "cand_b2_dr_dkc_water_congas",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/DKC_Water-KM.mid, bar 12 (1-bar loop of the underwater section, 49% of 49 drummed bars, verified raw), ch9, 74bpm.",
      "why": "All hand percussion, no kick/snare/hat: a half-bar cell x2 where the muted conga speaks three falling 16ths (vel 76-64), the open conga ANSWERS rising (57-71), and a high bongo pair caps the exchange; a shaker strikes once and dies away over six 16ths (vel 102 down to 8 - approximated here by hard-then-soft shaker). Underwater breathing at 74bpm.",
      "his_prior_words": "",
      "vibes": [
          "water/beach",
          "calm/underwater",
          "mysterious/lagoon"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":74,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"1/2\",\"9/16\",\"5/8\",\"3/16\",\"1/4\",\"5/16\",\"11/16\",\"3/4\",\"13/16\",\"3/8\",\"7/16\",\"7/8\",\"15/16\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\"],\"sounds\":[\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
      },
      "pairs_with": [
          "cand_b2_hm_ocean_dorian_shimmer",
          "cand_b2_pk_shenmue_sea_heartbeat"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_yicave_bongo_flurry": {
      "id": "cand_b2_dr_yicave_bongo_flurry",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/YICave.mid, dominant 1-bar loop (65% of 37 drummed bars), ch9, 96bpm.",
      "why": "The bar's energy is FRONT-loaded: a four-16th low-bongo flurry opens beat 1 (plus an echo on the and-of-2), then congas and soft toms take over the back half while a shaker walks straight 8ths underneath. Reverse of a fill-at-the-end groove - the flurry is the downbeat. Hand-drum kit, zero kick/snare/hat, vel 85-100.",
      "his_prior_words": "",
      "vibes": [
          "cave/dungeon",
          "forest/jungle",
          "sneaky/ruins"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":96,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"3/16\",\"3/8\",\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1/4\",\"1/2\",\"5/8\",\"3/4\",\"1/2\",\"5/8\",\"1/4\",\"3/4\"],\"sounds\":[\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_tom_hi\",\"vc_tom_hi\",\"vc_tom_lo\",\"vc_tom_lo\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_dr_ffmq_mine_rotation": {
      "id": "cand_b2_dr_ffmq_mine_rotation",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/FFMQMine-V2.0.mid, dominant 2-bar loop (75% of 96 drummed bars), ch9, 120bpm.",
      "why": "One voice per QUARTER, rotating around the kit - kick, hat, snare, low tom - so four beats are four different drums; bar 1 closes with a three-onset ACCELERATING hat pickup (slot gaps 3,2,2 = 16th then two faster) and bar 2 swaps the tom for a kick pickup on the and-of-4. 5.5 onsets/bar: mine-cart clank as a groove, sparse enough to sit under any melody.",
      "his_prior_words": "",
      "vibes": [
          "cave/dungeon",
          "quirky/workshop",
          "sneaky/puzzle"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":2,\"onsets\":[\"0\",\"1\",\"7/4\",\"1/4\",\"41/48\",\"11/12\",\"23/24\",\"5/4\",\"1/2\",\"3/2\",\"3/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_snare\",\"vc_tom_lo\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_dr_wily_answer_snare": {
      "id": "cand_b2_dr_wily_answer_snare",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/genesis/WW_MM1_Wily_Boss_V1_2.mid, 2-bar loop (100% of 32 drummed bars), ch9, 150bpm.",
      "why": "Boss groove built from ONE question and two answers: kick holds beats 1 and 3 both bars; the snare answers differently each bar - bar 1 lands beat 2 then DISPLACES to the and-of-3 and 16th-14 (beat 4 never struck), bar 2 lands beats 2 and 4 then runs two 16ths into the loop restart. 5.5 onsets/bar - a boss floor that is menace-by-absence, not a wall.",
      "his_prior_words": "",
      "vibes": [
          "battle/boss",
          "menacing/showdown"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":150,\"bars\":2,\"onsets\":[\"0\",\"1/2\",\"1\",\"3/2\",\"1/4\",\"5/8\",\"7/8\",\"5/4\",\"7/4\",\"15/8\",\"31/16\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_r22_eggreverie_loop",
          "cand_b2_hm_boss_napolitan_hammer"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_gradius_pressure_snare": {
      "id": "cand_b2_dr_gradius_pressure_snare",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/Grad3SNES_Boss1.mid, 1-bar snare figure (the 2-bar rep's halves are identical; its bar-1 crash was a section-start hit and is dropped), ch9, 130bpm.",
      "why": "Relentless boss PRESSURE: the snare owns 16ths 2,4,6,7,10,12,14,15 - every even 16th plus double-taps before beats 3 and 1 - so the bar never opens a hole, while the kick just anchors 1 and 3. Velocity ripples 111-127 (the double-taps lean). The opposite battle shape to the Wily card: saturation instead of absence.",
      "his_prior_words": "",
      "vibes": [
          "battle/boss",
          "tense/assault"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":130,\"bars\":1,\"onsets\":[\"0\",\"1/2\",\"1/8\",\"1/4\",\"3/8\",\"7/16\",\"5/8\",\"3/4\",\"7/8\",\"15/16\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_vg_metalwarriors_bvi_bii_loop",
          "cand_b2_hm_boss_napolitan_hammer",
          "cand_b2_pk_skies_deck_battle"
      ],
      "confidence": "medium"
  },
  "cand_b2_dr_7thsaga_triangle_clock": {
      "id": "cand_b2_dr_7thsaga_triangle_clock",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/7thsaga_town2.mid, 2-bar loop (100% of 36 drummed bars), ch9 (GM triangle -> vc_zill), 120bpm.",
      "why": "A town where the percussion is a music box: a triangle (rendered vc_zill) ticks a 2-bar clock mixing 16ths with 8th-triplet slots (7/12, 2/3, 11/6) and alternating loud/soft strokes (100/85), while a closed hat marks only the half-bars. No kick, no snare. Needs far-back gain per the cymbal law - the pattern, not the level, is the candidate.",
      "his_prior_words": "",
      "vibes": [
          "town/village",
          "calm/shop",
          "nostalgic/morning"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":2,\"onsets\":[\"0\",\"1/2\",\"1\",\"5/4\",\"0\",\"1/16\",\"1/4\",\"3/8\",\"1/2\",\"7/12\",\"2/3\",\"3/4\",\"7/8\",\"1\",\"17/16\",\"5/4\",\"21/16\",\"3/2\",\"27/16\",\"7/4\",\"11/6\"],\"sounds\":[\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\"]}"
      },
      "pairs_with": [
          "cand_cw_evening_royalroad",
          "cand_b2_hm_town_chromatic_slip",
          "cand_b2_pk_garden_horn_answer"
      ],
      "confidence": "medium"
  },
  "cand_b2_dr_sq_credits_skiphat": {
      "id": "cand_b2_dr_sq_credits_skiphat",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/SQ-Credits.mid, dominant 2-bar loop (55% of 44 drummed bars), ch9, 110bpm.",
      "why": "The whole shuffle lives in ONE displaced tick: the hat plays only the LAST 8th-triplet of each beat (slot 8 of 12 - the \"let\" of trip-a-let), kick 1 and 3, snare backbeat; in bar 2 the beat-4 hat goes silent and a snare pickup on a triplet slot (23/12) fills the hole. Victory-lap swagger from 8 onsets/bar.",
      "his_prior_words": "",
      "vibes": [
          "victory/fanfare",
          "happy/credits",
          "groovy/stroll"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":110,\"bars\":2,\"onsets\":[\"0\",\"1/2\",\"1\",\"3/2\",\"1/6\",\"5/12\",\"2/3\",\"11/12\",\"7/6\",\"17/12\",\"5/3\",\"1/4\",\"3/4\",\"5/4\",\"7/4\",\"23/12\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_pr_proto_mediant_shuttle",
          "cand_b2_hm_epilog_walkdown",
          "cand_b2_hm_credits_sixth_bloom"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_ballad_cadence": {
      "id": "cand_b2_dr_ballad_cadence",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/ballad.mid, bars 5-6 (dominant 2-bar phrase, 91% of 70 drummed bars, verified raw), ch9, 150bpm.",
      "why": "Snare-only processional: quarter notes, except one beat per bar splits into an 8th-triplet TURN - beat 4 in bar 1, migrating to beat 2 in bar 2, which then closes with a straight 8th pair instead. A funeral-march cadence in a single voice: the sparse-percussion answer for sad and march vibes the suite has zero of. (Promotion note: vc_snare_mil is the fitting timbre; md_snare per the GM mapping here.)",
      "his_prior_words": "",
      "vibes": [
          "sad/sparse",
          "march",
          "somber/memorial"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":150,\"bars\":2,\"onsets\":[\"0\",\"1/4\",\"1/2\",\"3/4\",\"5/6\",\"11/12\",\"1\",\"5/4\",\"4/3\",\"17/12\",\"3/2\",\"7/4\",\"15/8\"],\"sounds\":[\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_b2_hm_lament_tetrachord",
          "cand_b2_hm_grief_staircase"
      ],
      "confidence": "medium"
  },
  "cand_b2_dr_mountain_trail": {
      "id": "cand_b2_dr_mountain_trail",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/genesis/Mountain_track.mid, 2-bar loop (99% of 87 drummed bars), ch9, 151bpm.",
      "why": "Trail-ride march: a low-tom double thump opens every bar (beat 1 + and-of-1), a rimshot ticks a sparse offbeat lattice, and the snare syncopates 16th answers with one GHOST (v85 vs 127) tucked after the and-of-3; bar 2 shifts a snare onto an 8th-triplet slot (17/12) and doubles the closing cadence. Three voices, 11.5 onsets/bar, everything conversational.",
      "his_prior_words": "",
      "vibes": [
          "march",
          "adventure/mountain",
          "excited/journey"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":151,\"bars\":2,\"onsets\":[\"0\",\"1/8\",\"1\",\"9/8\",\"1/8\",\"1/4\",\"5/8\",\"7/8\",\"9/8\",\"5/4\",\"13/8\",\"15/8\",\"1/4\",\"7/16\",\"9/16\",\"5/8\",\"3/4\",\"5/4\",\"17/12\",\"25/16\",\"13/8\",\"7/4\",\"15/8\"],\"sounds\":[\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_cw_airvoyage_pendulum"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_brutal_fading_shaker": {
      "id": "cand_b2_dr_brutal_fading_shaker",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/BrutalTitle.mid, 2-bar loop (100% of 168 drummed bars), ch9, 189bpm.",
      "why": "All-hand-percussion title groove: the shaker plays plain 8ths but its velocity STAIRCASES 88-76-52-28 every half bar - a wave that breathes twice a bar (approximated by hard-then-soft shaker); the open conga stamps bar downbeats plus one and-of-4 push in bar 2, claves and muted conga scatter single answers into the gaps. Latin without any kit voice.",
      "his_prior_words": "",
      "vibes": [
          "menu/title",
          "happy/festival",
          "forest/jungle"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":189,\"bars\":2,\"onsets\":[\"0\",\"1\",\"7/4\",\"0\",\"1/8\",\"1/2\",\"5/8\",\"1\",\"9/8\",\"3/2\",\"13/8\",\"1/4\",\"3/8\",\"3/4\",\"7/8\",\"5/4\",\"11/8\",\"7/4\",\"15/8\",\"1/8\",\"1/2\",\"3/8\",\"3/4\",\"11/8\",\"3/2\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_claves\",\"vc_claves\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_dr_macabre_echo_chase": {
      "id": "cand_b2_dr_macabre_echo_chase",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/hsmusic/references-beyond-homestuck__Macabre.mid, dominant 2-bar loop (66% of 73 drummed bars), ch9, 150bpm.",
      "why": "Percussion as call-and-ECHO, not timekeeping: three velocity fades chase each other - rim 8ths dying 77-52-27 across beats 1-2, then kick+low-tom in unison fading 127 down to 27 ACROSS the barline (beats 3-4-1), then the rim again from full 127 through bar 2 - with a tambourine stab marking where each new fade begins and a lone open hat pulsing between. Haunted echo-chamber floor (fades flattened in this render; the placement still chases).",
      "his_prior_words": "",
      "vibes": [
          "haunted",
          "mysterious/manor",
          "sneaky/graveyard"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":150,\"bars\":2,\"onsets\":[\"0\",\"1/8\",\"1/4\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"1/4\",\"1\",\"7/4\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"1/2\",\"5/4\"],\"sounds\":[\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_ohat\",\"md_ohat\",\"md_ohat\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_riq\",\"vc_riq\"]}"
      },
      "pairs_with": [
          "cand_dp_trip_hop_groove"
      ],
      "confidence": "high"
  },
  "cand_b2_dr_yukon_camel_trot": {
      "id": "cand_b2_dr_yukon_camel_trot",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/nes/Yukon-Pyramid.mid, dominant 1-bar loop (81% of 52 drummed bars), ch9, 130bpm.",
      "why": "Camel trot with NO low end: the hat double-taps each beat (16ths 1-2 of every quarter) and the snare answers alone on every AND - eight taps, four answers, nothing else. All top-end, so it layers under any dum-heavy desert floor (iqa' rows, nsmb_doum) without fighting the one-low-voice law. Different species from the carded desert Q&A bar: this is a trot, that is a call-and-response.",
      "his_prior_words": "",
      "vibes": [
          "desert",
          "adventure/caravan"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":130,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/4\",\"5/16\",\"1/2\",\"9/16\",\"3/4\",\"13/16\",\"1/8\",\"3/8\",\"5/8\",\"7/8\"],\"sounds\":[\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_r14_andalusian_descent",
          "cand_cw_desert_groove"
      ],
      "confidence": "medium"
  },
  "cand_b2_dr_followthewind_glide": {
      "id": "cand_b2_dr_followthewind_glide",
      "batch": 2,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/SAI-FollowTheWind.mid, dominant 1-bar loop (85% of 34 drummed bars), ch9, 124.5bpm.",
      "why": "Airborne drive: a 16th shaker carpet with strict up/down stroke alternation (v127 on 8ths, v102 between - rendered as hard/soft shaker), OPEN hat on every and, kick leaning 1, and-of-1, 2 then settling to quarters, and a snare backbeat wearing a ghost pair (v83) around the and-of-2 plus a full-velocity pickup on 16th 15. Faster, brighter sibling of the carded night-walk groove (that one is 78bpm tresillo; this is straight-16th glide).",
      "his_prior_words": "",
      "vibes": [
          "flying/sky",
          "excited/journey",
          "happy/overworld"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":124.5,\"bars\":1,\"onsets\":[\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1/16\",\"3/16\",\"5/16\",\"7/16\",\"9/16\",\"11/16\",\"13/16\",\"15/16\",\"0\",\"1/4\",\"1/2\",\"3/4\",\"0\",\"1/8\",\"1/4\",\"1/2\",\"3/4\",\"1/8\",\"3/8\",\"5/8\",\"7/8\",\"1/4\",\"7/16\",\"9/16\",\"3/4\",\"15/16\"],\"sounds\":[\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_ohat\",\"md_ohat\",\"md_ohat\",\"md_ohat\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_cw_airvoyage_pendulum",
          "cand_b2_hm_airship_sus_carousel",
          "cand_b2_pk_theair_wind_gust"
      ],
      "confidence": "medium"
  },
  "cand_b2_hm_lament_tetrachord": {
      "id": "cand_b2_hm_lament_tetrachord",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/snes/DQ2R_Lonely_Youth.mid — 2-bar loop @bar0 x2 cov 1.00 (+x2 @13.5 cov 0.97; the 322-bar file cycles it throughout). Spot-checked: bass walks D3-C3-Bb2-A2, every chord's tones verified in the pc histogram at cov 1.00.",
      "why": "The COLORED lament: a descending-tetrachord bass (i - bVII6 - bVI^7 - v7) at HALF-BAR harmonic rhythm — a new chord every 2 beats, verified at coverage 1.00, the cleanest extraction in the whole 1788-file scan. Differs from the carded andalusian descent (0:m 10b 8b 7:7) on every axis that matters: every chord carries color (6/^7/m7, no plain triad), the dominant is a soft MINOR v7 (no leading tone — grief, not Spain), and it moves at double speed. Fills the sad/funeral gap with the bass-line-driven shape the brief asked for.",
      "his_prior_words": "",
      "vibes": [
          "sad/funeral",
          "somber/loss",
          "nostalgic/rain"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 10b:6 8b:^7 7:m7\",\"family\":\"minor\",\"bpm\":113,\"chordBeats\":[2,2,2,2],\"symbols\":[\"Dm\",\"C6\",\"Bb^7\",\"Am7\"]}"
      },
      "pairs_with": [
          "cand_ut_raining_jazz_walk",
          "cand_b2_dr_ballad_cadence",
          "cand_b2_pk_un_minor_ii_v_lament"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_airship_sus_carousel": {
      "id": "cand_b2_hm_airship_sus_carousel",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/nes/ff3airship.mid (FF3 airship) — 4-bar loop @bar8.5 x2 cov 0.90; near-identical rotations extract again @34 and @59.5 (x2 each), so the figure states 6+ times across 75 bars.",
      "why": "Eight chords in four bars — EVERY chord lasts exactly 2 beats — the sub-bar-harmonic-rhythm capability with almost no library behind it. The carousel: V - III(major!) - viisus - iii7 - vii(o) - IV - Isus - IV^7, i.e. a chromatic-mediant III and a passing diminished inside a major-key adventure loop, each resolving in one half-bar. Spot-check caveat, documented honestly: the source holds a C# bass pedal under slots 3-5 and a D pedal under 6-8 (two-bar pedals with harmony changing above); a root-position render is an approximation of that — the chord CONTENT is verified per half-bar.",
      "his_prior_words": "",
      "vibes": [
          "flying/airship",
          "adventure/departure",
          "triumphant/journey"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"7 4 11:sus 4:m7 11:o 5 0:sus 5:^7\",\"family\":\"major\",\"bpm\":151,\"chordBeats\":[2,2,2,2,2,2,2,2],\"symbols\":[\"A\",\"F#\",\"C#sus\",\"F#m7\",\"C#o\",\"G\",\"Dsus\",\"G^7\"]}"
      },
      "pairs_with": [
          "cand_cw_airvoyage_pendulum",
          "cand_b2_dr_followthewind_glide",
          "cand_b2_ly_lb3_swing_arp_swap"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_boss_napolitan_hammer": {
      "id": "cand_b2_hm_boss_napolitan_hammer",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/gameboy/FFl2_Boss_GB.mid (SaGa2/FFL2 boss) — 8-bar loop x2 @2.5 cov 0.88, again @25 (0.88) and @47.5 (0.90). Spot-checked bars 2-10: the C^7 spans are cov 1.00 with C2 bass and C-E-G-B sounding.",
      "why": "A boss loop built on the NAPOLITAN bII^7 as a place the music LIVES, not a passing chord: C^7 hammers for two full bars (8 of 32 beats) against a Bm7 home, with bVIIm and bVII7 relief and an iv-sus turn. Matches the r23 boss finding (battle harmony is min9/colour-consonant, not dissonant) — the dread is the semitone-above ROOT relationship, every vertical sonority stays lush. Two slots corrected from the voted labels after spot-check, per the D85 measure-first law: the '7:m' vote was really i over its 5th (B/F# — F#m would add an A natural the source never sounds), and one 2-beat slot is a real passing F#o (F#-A-C verified, cov 1.00) between bVIIm and i. Distinct from carded metalwarriors (bVI^7-i-bII DOMINANT 7 industrial): here the bII is major-SEVENTH and is the loop's center of gravity.",
      "his_prior_words": "",
      "vibes": [
          "battle/boss",
          "tense/showdown",
          "dark/epic"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"10b:m 7:o 0:m 1b:^7 0:m7 5:sus 0:m 10b:7 0:m7\",\"family\":\"minor\",\"bpm\":155,\"chordBeats\":[2,2,4,8,4,2,2,4,4],\"symbols\":[\"Am\",\"F#o\",\"Bm/F#\",\"C^7\",\"Bm7\",\"Esus\",\"Bm\",\"A7\",\"Bm7\"]}"
      },
      "pairs_with": [
          "cand_r23_taiko_trailer_gallop",
          "cand_vg_airwolf_gallop_pedal",
          "cand_b2_dr_wily_answer_snare",
          "cand_b2_ly_versus_bass_fill_bar"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_epilog_walkdown": {
      "id": "cand_b2_hm_epilog_walkdown",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/snes/Zelda3_Epilog_Theme.mid — 4-bar loop @34.5 x2 cov 0.81. Spot-checked: bass walks D3-G3-C3-B2-A2-E2 under the changes.",
      "why": "The victory-lap cadence the catalog has zero of: ii7 - V - I^7 - iim6 - IV^7, at 2-beat harmonic rhythm for the cadence half and long warm ^7 landings for the rest. The mechanism is the WALKING BASS under a resolving progression — the source steps D-G-C then B-A-E, putting I^7 over its 7th and IV^7 over its 3rd on the way down (a root-position render keeps the chord colors; the walk is what a bound bass layer would re-add). The iim6 (Dm6 = Dm with a B natural) is the one non-obvious color and it labelled at cov 0.94. Fills victory/fanfare with the RESOLVING shape — the atlas notes ^7-color fanfares as triumphant's signature and none is carded.",
      "his_prior_words": "",
      "vibes": [
          "victory/epilog",
          "triumphant/warm",
          "peaceful/aftermath"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"2:m7 7 0:^7 2:m6 5:^7\",\"family\":\"major\",\"bpm\":122,\"chordBeats\":[2,2,4,2,6],\"symbols\":[\"Dm7\",\"G\",\"C^7\",\"Dm6\",\"F^7\"]}"
      },
      "pairs_with": [
          "cand_vg_dq_pizz_flute_stack"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_credits_sixth_bloom": {
      "id": "cand_b2_hm_credits_sixth_bloom",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/snes/SQ-Credits.mid (Space Quest credits) — 8-bar loop @1 x2 cov 1.00 (+variant @27 cov 0.96). Spot-checked at half-bar resolution: every slot cov 1.00.",
      "why": "A credits roll whose mechanism is the 6th BLOOMING inside each chord: every harmony gets one plain bar then one bar with the added 6th — E then E6, D then D6, C#m then C#m6 (the A# verified sounding), before a 2-bar V. The scan's RLE had collapsed the same-root pairs to one chord; the spot-check recovered the bloom, which is the whole card. I - bVII - vi - V mixolydian frame, but the within-chord change is a 2-bar-period device no existing card carries (the r17 'changes not just in strict section bar' ask, arriving from a credits screen). Extraction quality is the best in the scan: literally every half-bar at coverage 1.00.",
      "his_prior_words": "",
      "vibes": [
          "victory/credits",
          "nostalgic/farewell",
          "calm/rest"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 0:6 10b 10b:6 9:m 9:m6 7\",\"family\":\"major\",\"bpm\":110,\"chordBeats\":[4,4,4,4,4,4,8],\"symbols\":[\"E\",\"E6\",\"D\",\"D6\",\"C#m\",\"C#m6\",\"B\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_hm_victory_phrygian_finale": {
      "id": "cand_b2_hm_victory_phrygian_finale",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic/nes/mff-finalvictory.mid — 4-bar loop @0.5 x2 cov 0.90. Spot-checked: the Eb (bII) slot is cov 1.00 with Eb2 bass and Eb-G-Bb sounding.",
      "why": "The MINOR victory — a finale loop that celebrates without going major: bVIsus - iv - v7 - bIII6 - bII - v7 - i at 2-beat harmonic rhythm. The distinctive move is the PHRYGIAN cadence color (a real bII major triad resolving through the minor v7 to i) inside a triumphant context — carded desert/hijaz owns bII-against-RAISED-third; this is the all-minor cousin serving 'won, at a cost'. Quality downgrade documented: the source's Bbsus2 is rendered sus (sus2 is outside the closed set); everything else is verbatim. Sub-bar harmonic rhythm throughout except the 1-bar bIII6 landing.",
      "his_prior_words": "",
      "vibes": [
          "triumphant/finale",
          "victory/hard-won",
          "epic/aftermath"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"8b:sus 5:m 7:m7 3b:6 1b 7:m7 0:m\",\"family\":\"minor\",\"bpm\":145,\"chordBeats\":[2,2,2,4,2,2,2],\"symbols\":[\"Bbsus\",\"Gm\",\"Am7\",\"F6\",\"Eb\",\"Am7\",\"Dm\"]}"
      },
      "pairs_with": [
          "cand_r23_taiko_trailer_gallop"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_ocean_dorian_shimmer": {
      "id": "cand_b2_hm_ocean_dorian_shimmer",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/genesis/TK_OpenOcean_Ecco.mid (Ecco the Dolphin, Open Ocean — the r15 atlas's clearest water exemplar, conf 0.90) — 4-bar loop @1 x2 cov 0.81, key Am margin 0.245.",
      "why": "The catalog's first WATER card. The mechanism: an UNEVEN-SPAN tonic shimmer — i holds a bar and a half, then bIII^7 answers on the back half-bar, then i - IVsus - i - bIII^7 at 2-beat rate, so the loop breathes across the barline instead of landing on it (the r32 'a chord does not have to last a bar' law in a calm context). The IVsus is the dorian brightening (source sounds D-E-A, a sus2; rendered sus per the closed set — the F# major-IV read is NOT in the source pcs, so sus is the honest downgrade). New-age m7-and-^7 wash over a slow swell — the atlas water signature.",
      "his_prior_words": "",
      "vibes": [
          "water/ocean",
          "calm/underwater",
          "mysterious/deep"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 3b:^7 0:m 5:sus 0:m 3b:^7\",\"family\":\"minor\",\"bpm\":130,\"chordBeats\":[6,2,2,2,2,2],\"symbols\":[\"Am\",\"C^7\",\"Am\",\"Dsus\",\"Am\",\"C^7\"]}"
      },
      "pairs_with": [
          "cand_vg_rd_nocturne_bed",
          "cand_b2_dr_dkc_water_congas",
          "cand_b2_ly_dkc_decay_echo_sparkle"
      ],
      "confidence": "medium"
  },
  "cand_b2_hm_heroic_mixture_stroll": {
      "id": "cand_b2_hm_heroic_mixture_stroll",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic/snes/WingCommander.mid — 4-bar loop @0 x2 cov 0.94. Spot-checked: basses Bb1-Ab1-Ab2-Eb1-C1-Db1-F1, tonic and bVII6 slots at cov 1.00.",
      "why": "Heroic-mission harmony at half-bar rate: I - bVII6 - I7(third inversion in source, the b7 IS the bass) - IVsus - ii7 - bIIIsus - V(full bar). Two borrowed chords (bVII6, bIII) inside a functional major loop that still lands a real V — mixture as swagger, not darkness, at 80bpm military stride. Every chord 2 beats except the V landing: eight-of-nine cards in this batch carry the sub-bar capability but this is the slowest, most exposed use of it. Quality downgrade documented: source Db is a sus2 wash (Db-Eb heavy), rendered 3b:sus.",
      "his_prior_words": "",
      "vibes": [
          "flying/mission",
          "heroic/military",
          "tense/briefing"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 10b:6 0:7 5:sus 2:m7 3b:sus 7\",\"family\":\"major\",\"bpm\":80,\"chordBeats\":[2,2,2,2,2,2,4],\"symbols\":[\"Bb\",\"Ab6\",\"Bb7/Ab\",\"Ebsus\",\"Cm7\",\"Dbsus\",\"F\"]}"
      },
      "pairs_with": [
          "cand_vg_airwolf_gallop_pedal"
      ],
      "confidence": "high"
  },
  "cand_b2_hm_town_chromatic_slip": {
      "id": "cand_b2_hm_town_chromatic_slip",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/snes/7thsaga_town2.mid — 4-bar loop @9 x2 cov 0.94. Spot-checked: the C#4-C4-B3 chromatic descent slots are all cov 1.00 (C dim = C-Eb-Gb verified).",
      "why": "Town-day harmony driven by a CHROMATIC PASSING BASS that resolves: vi - bVI(dim) - Vsus, roots slipping C#-C-B by semitone with the dim resolving in 2 beats — exactly the prized passing-chromatic shape (and nothing like the parked dim chains D88 rejects). Then the II major (V-of-V used as color, not modulation) lifts into IVsus2/IIsus2/Vsus2 bell-tone territory. The loop never states I — a town square that stays mid-conversation. Quality downgrades documented: the three sus2 chords (A2, F#sus2, B2) render as sus. Music-box register in source (bass at octave 3-4).",
      "his_prior_words": "",
      "vibes": [
          "town/village-day",
          "quirky/errand",
          "nostalgic/afternoon"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 8b:o 7:sus 2 5:sus 2:sus 7:sus\",\"family\":\"major\",\"bpm\":120,\"chordBeats\":[2,2,2,2,4,2,2],\"symbols\":[\"C#m\",\"Co\",\"Bsus\",\"F#\",\"Asus\",\"F#sus\",\"Bsus\"]}"
      },
      "pairs_with": [
          "cand_ut_shop_bounce_acc",
          "cand_b2_dr_7thsaga_triangle_clock",
          "cand_b2_ly_pkmn_push_hold_dyads"
      ],
      "confidence": "medium"
  },
  "cand_b2_hm_sports_mixolydian_ramp": {
      "id": "cand_b2_hm_sports_mixolydian_ramp",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/nes/tf2-olymintro.mid (Track & Field II, Olympic intro) — 4-bar loop @11.5 x2 cov 0.86.",
      "why": "The training/sports gap's best extraction: IV - v(MINOR) - IV - Vsus - I7, a mixolydian pump-up where the tonic arrives as a DOMMINANT-7 I (mixolydian b7) and the v is borrowed minor — brass-fanfare harmony that never quite sits down, which is what makes it read 'warm-up' rather than 'won'. Label caveat stated honestly: the Bb slot flaps between Bbm/Bb7/Bbm7/Bbsus across the four bars in the source (spot-check), so the voted v-minor and Vsus are the majority reads, not unanimous ones — hence medium confidence.",
      "his_prior_words": "",
      "vibes": [
          "training/sports",
          "excited/warmup",
          "happy/announcer"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5 7:m 5 7:sus 0:7\",\"family\":\"major\",\"bpm\":140,\"chordBeats\":[2,4,4,4,2],\"symbols\":[\"Ab\",\"Bbm\",\"Ab\",\"Bbsus\",\"Eb7\"]}"
      },
      "pairs_with": [
          "cand_un_indie_backbeat"
      ],
      "confidence": "medium"
  },
  "cand_b2_hm_lounge_walk_dim": {
      "id": "cand_b2_hm_lounge_walk_dim",
      "batch": 2,
      "type": "harmony",
      "source": "audios/vgmusic-corpus/nes/Vegas_Dream_-_Black_Jack.mid — 4-bar loop @0 x2 cov 0.77 (variant without the dim @24 x2 cov 0.83). The atlas's town_shop notes flagged this file for its dim/^7 changes.",
      "why": "Night-lounge harmony for the mysterious-but-warm slot: iii - I - IVsus - I^7 - Vsus - IV^7 - bII(dim) - I at 2-beat rate. The card's point is the PASSING DIMINISHED that resolves down a semitone into the tonic in one half-bar (Gb-dim to F, roots by semitone — the prized resolving-chromatic, opposite of a parked chain) after a stroll through BOTH ^7 colors. Risks stated: overall coverage 0.77 is the batch's lowest, the iii slot is thin in the source (melody pickup, cov 0.38), and an F-major color loop lives near the oversupplied happy-menu family — what earns the slot is the dim resolution plus the I^7/IV^7 pairing, which no kept card demonstrates.",
      "his_prior_words": "",
      "vibes": [
          "mysterious/lounge-night",
          "calm/casino",
          "quirky/cocktail"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"4:m 0 5:sus 0:^7 7:sus 5:^7 1b:o 0\",\"family\":\"major\",\"bpm\":150,\"chordBeats\":[2,2,2,2,2,2,2,2],\"symbols\":[\"Am\",\"F\",\"Bbsus\",\"F^7\",\"Csus\",\"Bb^7\",\"Gbo\",\"F\"]}"
      },
      "pairs_with": [
          "cand_hs_negrocity_walking_bass"
      ],
      "confidence": "medium"
  },
  "cand_b2_hm_grief_staircase": {
      "id": "cand_b2_hm_grief_staircase",
      "batch": 2,
      "type": "harmony",
      "source": "audios/hsmusic/alterniabound__Requiem of Sunshine and Rainbows - Unknown (piano).mid — 8-bar loop @24.5 x2 cov 0.97 (second 8-bar loop @55 also cov 0.97). Spot-checked bars 24-33: every slot cov 1.00 except the two loop-seam halves.",
      "why": "Sad-but-WARM, the other half of the funeral gap: an ascending aeolian staircase bIII - iv - V - i / v - bVI - bVII - i / ii - bIII where the cadence uses the MAJOR V (the G# verified sounding, one half-bar) but the interior walks the natural-minor ladder, and the ii is a real B-MINOR (dorian ii in A minor) — three different sixth/seventh-degree treatments in one loop, which is why it reads as processing grief rather than sitting in it. Coverage 0.97 over 8 bars on a piano arrangement. Render bpm note: the file is notated 160 (piano-roll double-time); spec bpm 100 restores the ballad stride the harmonic rhythm implies — documented, not hidden.",
      "his_prior_words": "",
      "vibes": [
          "sad/memorial",
          "somber/warm",
          "peaceful/processing"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"3b 5:m 7 0:m 7:m 8b 10b 0:m 2:m 3b\",\"family\":\"minor\",\"bpm\":100,\"chordBeats\":[2,2,2,4,4,4,4,4,4,2],\"symbols\":[\"C\",\"Dm\",\"E\",\"Am\",\"Em\",\"F\",\"G\",\"Am\",\"Bm\",\"C\"]}"
      },
      "pairs_with": [
          "cand_un_emo_im9_wash"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_hmsummer_echo_cascade": {
      "id": "cand_b2_ly_hmsummer_echo_cascade",
    "piano_main": false,
      "batch": 2,
      "key_tonic": "G",
      "key_mode": "major",
      "type": "device",
      "source": "audios/vgmusic-corpus/snes/HMSummer-1.mid (Harvest Moon SNES, Summer) — tracks 1-4: 'Acoustic Grand Piano (Background)' + '(Background Echo)' + '(Background Echo 2)' + '(Background Echo 3)', bars 0-1 transcribed verbatim; each echo lane is the background delayed exactly +1/+2/+3 sixteenths (taps that would cross the barline are dropped in the source too). Source velocities are flat 127 (SNES rip; the fade lived in channel volume), gains staged 0.5/0.3/0.2/0.13 here. Bar-0 f5 rings 2 slots into bar 1 in source, clipped at the barline here.",
      "why": "Echo doubling at a fixed delay — the device vgmusic-techniques-r20 SS5 flags as one the engine does not have (echo = 42.6% of corpus doubled pairs, 'overwhelmingly a same-instrument delay at a half or quarter beat'). Here the arranger NAMED the lanes: three echo taps at +1, +2, +3 sixteenths, alignment 1.00 over all 40 bars (scanner: offBeats 0.25/0.5/0.75, frac=1.0). One sparse broken-chord figure becomes a shimmering 4-deep cascade with zero new material. The same file echoes its melody lane too (accordion -> square lead at +0.5 beat, +12). Portable over anything sparse: the taps are copies, so they re-color with whatever harmony the figure follows.",
      "his_prior_words": "",
      "vibes": [
          "happy/menu",
          "nostalgic/rest",
          "calm/shop"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g4@2 b4@2 g5@2 d5@2 ~@2 f5@6] [~@2 f5@2 e5@2 d5@2 e5@2 d5@2 c5@2 g4@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ g4@2 b4@2 g5@2 d5@2 ~@2 f5@5] [~@3 f5@2 e5@2 d5@2 e5@2 d5@2 c5@2 g4]>\",\"sound\":\"piano\",\"gain\":0.3},{\"mini\":\"<[~@2 g4@2 b4@2 g5@2 d5@2 ~@2 f5@4] [~@4 f5@2 e5@2 d5@2 e5@2 d5@2 c5@2]>\",\"sound\":\"piano\",\"gain\":0.2},{\"mini\":\"<[~@3 g4@2 b4@2 g5@2 d5@2 ~@2 f5@3] [~@5 f5@2 e5@2 d5@2 e5@2 d5@2 c5]>\",\"sound\":\"piano\",\"gain\":0.13}],\"bpm\":180,\"bars\":2}"
      },
      "pairs_with": [
          "cand_b2_ly_hmsummer_steel_octave_double"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_hmsummer_steel_octave_double": {
      "id": "cand_b2_ly_hmsummer_steel_octave_double",
      "batch": 2,
      "key_tonic": "G",
      "key_mode": "major",
      "type": "instrument_combo",
      "source": "audios/vgmusic-corpus/snes/HMSummer-1.mid — track 5 'Finger Electric Bass (Bassline)' + track 16 'Steel Drums (Transposed Bassline Layer)', bars 0-3 transcribed verbatim (the bar repeats byte-identically for 40 bars). Steel drums rendered on gm_marimba (no steel drums in the engine palette); the double is the bass +24 exactly, note for note (116 = 116 notes).",
      "why": "Two devices in one named row. (1) The bass is a frozen R / low-5 / low-b7 figure on the 8th-note tresillo (onsets 0, 3, 6 of 8) that does NOT re-pitch as the G->F harmony moves — the reels' R2 freeze arriving from a 1996 SNES farm game. (2) 'Transposed Bassline Layer' is the arranger naming reel rule R1 (a new layer is existing material re-registered): the identical line +2 octaves on a contrasting mallet timbre, so one part reads as floor AND cog. Recurrence of the figure itself: Undertale - Dance of Dog's bass is the same R/5-below/b7-below cell on the doubled 16th tresillo (0,3,6,8,11,14), cover 16/16 bars — two independent corpora carry this exact bass DNA.",
      "his_prior_words": "",
      "vibes": [
          "happy/overworld",
          "happy/festival",
          "calm/shop"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 f2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@2 ~@4 d4@6 f4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
      },
      "pairs_with": [
          "cand_b2_ly_hmsummer_echo_cascade"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_dkc_decay_echo_sparkle": {
      "id": "cand_b2_ly_dkc_decay_echo_sparkle",
      "batch": 2,
      "key_tonic": "Ab",
      "key_mode": "major",
      "type": "device",
      "source": "audios/vgmusic-corpus/snes/DKC_Water-KM.mid — track 8 'Bright Acoustic Piano', bar 20 transcribed verbatim (cells and their order exact; the written velocity ladder 102/89/76/64 realized as 4 stacked parts at falling gain). In source the decay continues through bar 21 down to velocity 13 (8 steps over 2 bars) and the whole lane is additionally duplicated by a '(echo)' track at +0.125 beat (a 32nd).",
      "why": "A written-out echo with the decay IN THE NOTES: a 4-note 16th cell repeated 8 times with geometrically falling velocity — and the cell ALTERNATES between two forms (g#6-g6-a#6-g6 and g#6-g6-c6-d#6, shared head, different tail), so the sparkle varies while it fades. That is his built-in-variation ask at ornament scale ('instead of 321232123 repeatedly it could be 3213232123232') plus real dynamics data (this file passes triage with performance-grade velocities, rare in the corpus). Over Ab the cells spell R-maj7-9 and R-maj7-3-5 — pure color, no third hammering. Portable as a fade-tail to drop on any held chord.",
      "his_prior_words": "",
      "vibes": [
          "calm/night",
          "mysterious/space",
          "somber/aftermath"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g#6 g6 a#6 g6 ~@12]\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"[~@4 g#6 g6 c6 d#6 ~@8]\",\"sound\":\"piano\",\"gain\":0.38},{\"mini\":\"[~@8 g#6 g6 a#6 g6 ~@4]\",\"sound\":\"piano\",\"gain\":0.28},{\"mini\":\"[~@12 g#6 g6 c6 d#6]\",\"sound\":\"piano\",\"gain\":0.2}],\"bpm\":74,\"bars\":1}"
      },
      "pairs_with": [
          "cand_cw_shenightfall_prog",
          "cand_b2_ly_premonition_rolled_swell"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_lb3_swing_arp_swap": {
      "id": "cand_b2_ly_lb3_swing_arp_swap",
    "addon_gain": 0.45,
      "batch": 2,
      "key_tonic": "C",
      "key_mode": "major",
      "type": "accomp_pattern",
      "source": "audios/vgmusic-corpus/snes/lb3_flight.mid — track 4 'EP' (GM EPiano1), bars 1-4 transcribed verbatim on the file's own triplet grid (12 slots/bar = swung 8ths; written accents 105/100/90 per cell in source). The identical engine runs 68 active bars (816 notes).",
      "why": "An arpeggio engine with TWO levels of built-in variation and a re-seat. Cell = top-voice R-maj7-5 falling; on beats 2 and 4 the inner pair SWAPS (c6-b5-g5 -> c6-g5-b5) so even a single bar never repeats verbatim; every second bar the last two beats ESCAPE upward through the 9th (c6-d6-c6, b5-c6-g5) — exactly his 'instead of 321232123 repeatedly it could be 3213232123232'. At the chord change the frozen shape re-seats +3 onto the relative-major shape of Cm7 (d#6-d6-a#5, escape to f6) — shape frozen, seat moving. Swing is in the grid itself (triplet cells), not faked with rests.",
      "his_prior_words": "",
      "vibes": [
          "adventure/flight",
          "happy/menu",
          "groovy/calm"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [c6 b5 g5 c6 g5 b5 c6 d6 c6 b5 c6 g5] [d#6 d6 a#5 d#6 a#5 d6 d#6 d6 a#5 d#6 a#5 d6] [d#6 d6 a#5 d#6 a#5 d6 d#6 f6 d#6 d6 d#6 d6]>\",\"sound\":\"gm_epiano1\",\"bpm\":144,\"bars\":4,\"gain\":0.5}"
      },
      "pairs_with": [
          "cand_b2_ly_infinity_slap_octave_pop"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_infinity_slap_octave_pop": {
      "id": "cand_b2_ly_infinity_slap_octave_pop",
    "addon_gain": 1.8,
      "batch": 2,
      "key_tonic": "C",
      "key_mode": "minor",
      "type": "accomp_pattern",
      "source": "audios/vgmusic-corpus/snes/SMASInfinitySchool-V1.1.mid — track 6 'Slap Bass 2', bars 8-16 transcribed verbatim (one bar, byte-identical; cover 0.67 of 90 active bars). Rendered on gm_synth_bass_1 (no slap bass in the engine palette).",
      "why": "A one-pitch funk bass riff whose whole character is rhythm: dotted-8th lean (onsets 0,3,6 = 3-3-2 head), a gap where beat 3 should re-strike, then an octave POP on the 16th before beat 4 that immediately drops back down. Because it uses exactly one pitch class it follows ANY root — in source it walks i -> bVI -> bVII (C, Ab, Bb) with the figure unchanged. Six onsets but four distinct duration values and the octave accent, so it is nothing like a uniform pulse. The pop-before-4 is the same prowl gesture his kept Air Pirate bass has, at a different slot — a second independent attestation of the octave-pop device.",
      "his_prior_words": "",
      "vibes": [
          "sneaky/base",
          "groovy/dungeon",
          "tense/mission"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[c2@3 c2 ~@2 c2@2 ~@2 c2@2 c3 c2@3]\",\"sound\":\"gm_synth_bass_1\",\"octaveShift\":1,\"bpm\":120,\"bars\":1,\"gain\":0.6}"
      },
      "pairs_with": [
          "cand_b2_ly_lb3_swing_arp_swap",
          "cand_cw_airpirate_lattice"
      ],
      "confidence": "medium"
  },
  "cand_b2_ly_versus_bass_fill_bar": {
      "id": "cand_b2_ly_versus_bass_fill_bar",
    "addon_gain": 1.5,
      "batch": 2,
      "key_tonic": "G",
      "key_mode": "minor",
      "type": "accomp_pattern",
      "source": "audios/hsmusic/homestuck-vol-5__Versus - Unknown.mid — track 2 'Bass' (GM SlapBass1), bars 8-11 transcribed verbatim; the A A' A B cycle covers 64 active bars. Rendered on gm_synth_bass_1.",
      "why": "The clearest bass answer to his six-times complaint that add-ons 'sound uniform / should vary': a 4-bar cycle of THREE distinct bar shapes sharing one pitch set. Bar A climbs R-b7-b3-9-4-5 on a 3-3-3-3-2-2 grid; bar A' keeps the grid but re-orders the tail to come back DOWN (9-4 swap to 4-2-b7); bar B is a dedicated FILL — leaps to the upper octave and turns through a chromatic lower-neighbor triple (a2-a#2-a2) in 16ths before relaunching. Variation lives inside the pattern, not in a section boundary. Syncopated but never busy (6-8 onsets/bar, multiple shapes — metronome-test clean).",
      "his_prior_words": "",
      "vibes": [
          "battle/rival",
          "tense/mission",
          "excited/training"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[g2 ~ ~ f2 ~ ~ a#2 ~ ~ a2 ~ ~ c3 ~ d3 ~] [g2 ~ ~ f2 ~ ~ a#2 ~ ~ c3 ~ ~ a2 ~ f2 ~] [g2 ~ ~ f2 ~ ~ a#2 ~ ~ a2 ~ ~ c3 ~ d3 ~] [f3 ~ ~ d3 ~ ~ f3 ~ ~ d3 ~ a2 a#2 a2 f3 ~]>\",\"sound\":\"gm_synth_bass_1\",\"bpm\":134,\"bars\":4,\"gain\":0.6}"
      },
      "pairs_with": [
          "cand_lp_r1_cluster_arp_saw"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_premonition_rolled_swell": {
      "id": "cand_b2_ly_premonition_rolled_swell",
      "batch": 2,
      "key_tonic": "A",
      "key_mode": "major",
      "type": "device",
      "source": "audios/Undertale MIDI/Undertale - Premonition.mid — tracks 1+2 (both piano), bars 0-3 transcribed verbatim: TWO tracks jointly roll one chord in 16th steps (low voice slots 0,2; upper voice slots 3,4). In source every rolled note sustains through the following silent bar (mini clips the holds at the barline — a pad's release covers the difference) and an additional statement at bar 6 planes DOWN to G. Source velocities 41-69 (soft).",
      "why": "A two-layer rolled-chord swell on strict alternate bars: c#4 -> g#4 -> a4 -> c#5+e5 stack up at 16th spacing into an A^7 cloud rolled from its 3rd, ring a bar, silence, then the whole roll planes UP a step to B^7 (and later down to G^7) — planed ^7 color as one gesture, not a progression. The chord is assembled from monophonic lines (the r22 'no layer plays a chord' finding, in a 2015 indie OST). As an add-on it is a breathing texture: sound-then-silence on a 2-bar period, exactly the 'on and off' shape he liked, at whisper gain by construction. Undertale provenance, but an accompaniment gesture, not the recognizable tune.",
      "his_prior_words": "",
      "vibes": [
          "mysterious/calm",
          "calm/night",
          "somber/ruins"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c#4@2 g#4@14] [~@16] [d#4@2 a#4@14] [~@16]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@3 a4@13] [~@16] [~@3 b4@13] [~@16]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[~@4 [c#5,e5]@12] [~@16] [~@4 [d#5,f#5]@12] [~@16]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
      },
      "pairs_with": [
          "cand_b2_ly_dkc_decay_echo_sparkle",
          "cand_rl_r1_madd9_planed"
      ],
      "confidence": "medium"
  },
  "cand_b2_ly_dtai_dyad_zigzag_trade": {
      "id": "cand_b2_ly_dtai_dyad_zigzag_trade",
      "batch": 2,
      "key_tonic": "F",
      "key_mode": "major",
      "type": "instrument_combo",
      "source": "audios/vgmusic-corpus/snes/dtai-23.mid (Deae Tonosama Appare Ichiban ending, Masashi Kageyama) — track 3 (GM SynthBrass2, here gm_epiano1) + track 8 (GM StringEns1), bars 9-12 transcribed verbatim. Under them the source bass oscillates G-F in whole steps.",
      "why": "A true call-and-answer pair between two SUPPORT layers (the lead lives elsewhere — the corpus finding that 59.7% of trading pairs do not involve the lead). Strict 2-bar parity over the whole section (call: 40 bars all odd, answer: 32 bars all even, parity 1.00 each, zero shared onsets): odd bars a dyad double-tap sigh (long strike + short re-tap, top voice near-static on a#4/c5 while the bottom walks f-e-g-f#), even bars a five-8th zigzag answer entering at beat 2.5 — off the downbeat, pendulum 4ths, re-pitched each statement. Two thin layers that sum to continuous interest with no collision; either half also stands alone as an add-on.",
      "his_prior_words": "",
      "vibes": [
          "happy/ending",
          "nostalgic/rest",
          "triumphant/ceremony"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f4,a#4]@3 [f4,a#4] ~@12] [~@16] [[e4,a#4]@3 [e4,a#4] ~@12] [~@16]>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[~@16] [~@6 f6@2 c6@2 d6@2 g5@2 c6@2] [~@16] [~@6 g5@2 d6@2 c6@2 f6@2 d6@2]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.32}],\"bpm\":150,\"bars\":4}"
      },
      "pairs_with": [
          "cand_b2_ly_daydreamer_walk_pair"
      ],
      "confidence": "medium"
  },
  "cand_b2_ly_daydreamer_walk_pair": {
      "id": "cand_b2_ly_daydreamer_walk_pair",
      "batch": 2,
      "key_tonic": "E",
      "key_mode": "minor",
      "type": "accomp_pattern",
      "source": "audios/hsmusic/stlap__Daydreamer - Pascal van den Bos.mid (composer-authored file) — track 2 (GM FretlessBass, here gm_acoustic_bass) + track 0 (GM CleanGtr, here gm_acoustic_guitar_nylon), bars 8-11 transcribed verbatim; the cycle covers 68 active bars.",
      "why": "Both of his connective-tissue complaints answered in one 4-bar pair. The bass: three bars of a rocking cell whose d2 is a lower neighbor bracketed by e2 on BOTH sides (a passing tone by construction, D102's both-sides law), bar 3 pivots its last note to a2, and bar 4 is a genuine WALKING fill — eight straight 8ths climbing an octave stepwise (b2-a2-c3-d3-e3-d3-e3-f3), the f3 resolving down by semitone into the next bar's root ('the piano doesnt do any walking... not any extra notes between chords' — this is the walking). The guitar: a 4-note falling flick landing on a HELD b4 (jitter-free, D98 held-first), with a bar-3 tail variant and a bar-4 a4-b4-a4 answer — an A A A' B shape, variation built in. All-white-note dream color over the E pedal (the flick opens on f4 — a phrygian b9 shade, but 26 semitones above the bass and gone in an 8th, while the HELD note is the stable fifth b4), verbatim from the source.",
      "his_prior_words": "",
      "vibes": [
          "calm/night",
          "nostalgic/town",
          "mysterious/calm"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 a2@2 ~@2] [b2@2 a2@2 c3@2 d3@2 e3@2 d3@2 e3@2 f3@2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.6},{\"mini\":\"<[f4@2 d5@2 c5@2 b4@10] [f4@2 d5@2 c5@2 b4@10] [f4@2 d5@2 c5@2 b4@6 g4@4] [a4@4 b4@2 a4@10]>\",\"sound\":\"gm_acoustic_guitar_nylon\",\"gain\":0.42}],\"bpm\":130,\"bars\":4}"
      },
      "pairs_with": [
          "cand_b2_ly_dtai_dyad_zigzag_trade",
          "cand_cw_shenightfall_prog",
          "cand_b2_hm_lounge_walk_dim"
      ],
      "confidence": "high"
  },
  "cand_b2_ly_pkmn_push_hold_dyads": {
      "id": "cand_b2_ly_pkmn_push_hold_dyads",
      "batch": 2,
      "key_tonic": "F",
      "key_mode": "major",
      "type": "accomp_pattern",
      "source": "audios/vgmusic-corpus/gameboy/PKMNTCG2_-_RonaldXG.mid — track 11 (XG Polysynth, ch 11; here gm_pad_warm), bars 9-12 transcribed verbatim. In source the slot-14 chord TIES through the whole following bar (18 slots); mini re-strikes it at the barline instead — noted, the push attack itself is preserved.",
      "why": "A breathing anticipation pad on a 2-bar period, parity 1.00 across its 40 active bars: strike the bar's chord on the downbeat, hold, then at the and-of-4 strike the NEXT bar's chord and hang it through an otherwise silent bar. The 'on and off synth' shape he liked, plus the connective push — the change arrives an 8th early, so the harmony always walks into itself. Built-in growth too: statements thicken from dyads (a#3-d4 -> c4-e4) to triads (adding f4 / g3) as the section develops. Planed major-third dyads IV->V in F; trivially re-seatable on any two-chord motion.",
      "his_prior_words": "",
      "vibes": [
          "happy/menu",
          "calm/shop",
          "excited/training"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
      },
      "pairs_with": [
          "cand_lp_r5_offbeat_pizz",
          "cand_rl_r3_circle_dotted"
      ],
      "confidence": "medium"
  },
  "cand_b2_pk_skies_deck_battle": {
      "id": "cand_b2_pk_skies_deck_battle",
      "batch": 2,
      "type": "harmony",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/Skies_Deck_Battle(I like the layering of strings, the drums, the harmony, chord progression, melody, love it).mid — main G-minor section, bars 38-45 (also in repo as audios/manual-r22b copy)",
      "why": "The battle loop from his strongest battle card: i held for 2 bars as m(add9)->m9->m11 (the tonic THICKENS instead of changing), then bIII^7 and two bars of bVI^7 — every color chord a ^7/9 so it reads epic without a single dissonant device — and the dominant is a 7sus that resolves at BEAT 4 of its bar over a held D bass: the tonic chord returns before the bass does (bars 44-45 keep bass D under Gm). Measured at 100% chord-coverage on 6 of 8 bars; bass walks G->A under the bar-4 return (simplified to root position here). Battle is a thin lane in the catalog and this is its first ^7-colored minor loop.",
      "his_prior_words": "I like the layering of strings, the drums, the harmony, chord progression, melody, love it",
      "vibes": [
          "battle/epic",
          "tense/mission",
          "triumphant/battle"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m9 3:^7 0:m9 8:^7 7:7sus 0:m9\",\"symbols\":[\"Gm9\",\"Bb^7\",\"Gm9\",\"Eb^7\",\"D7sus\",\"Gm9\"],\"family\":\"minor\",\"key\":\"G\",\"bpm\":150,\"chordBeats\":[8,4,4,8,3,5],\"tonic\":\"G\"}"
      },
      "pairs_with": [
          "cand_b2_pk_skybattle_leadup",
          "cand_b2_dr_gradius_pressure_snare"
      ],
      "confidence": "high"
  },
  "cand_b2_pk_skybattle_leadup": {
      "id": "cand_b2_pk_skybattle_leadup",
      "batch": 2,
      "key_tonic": "E",
      "key_mode": "minor",
      "type": "device",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/Sky_battle(...instruments lead up to their section before they come in...).mid — seams at bars 15.75 (trk5 melody) and 23.5 (trk9 tremolo), notes verbatim; E-pedal texture from trks 6/7/8",
      "why": "His note IS the device and it measures cleanly: the melody enters ONE BEAT before its section with a 4-note scale run (e-f#-g-a on the 16ths of beat 4, landing b on the next downbeat), and a second layer enters HALF A BAR early as a repeated-note 16th tremolo on D — the b7 of the E it is heading to — with a velocity crescendo (69->80->66) through the seam. Both recur every 49-bar loop pass. This render loops the mechanism: bars 1-2 are old texture only (3+3+2 E-pedal bass + straight-8th E pulse), the run-pickup fires at the end of bar 2 into the melody's 2-bar phrase, and the tremolo fires in the back half of bar 4 leading back into the loop start. Answers the r17 'changes not just in strict section bar' ask from his own saved file — the engine enters every layer exactly ON the boundary (139/139 measured in r17).",
      "his_prior_words": "I like the non-obvious chord progression and the layering and chord progression, also note how some instruments lead up to their section before they come in like start playing before their section",
      "vibes": [
          "battle/epic",
          "tense/mission",
          "any-section-seam"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[e2 ~ ~ e2 ~ ~ e2 ~] [~ e2 ~ ~ e2 e2 e2 ~] [e2 ~ ~ e2 ~ ~ e2 ~] [~ e2 ~ ~ e2 e2 e2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[e4 e4 e4 e4 e4 e4 e4 e4]\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.22},{\"mini\":\"<[~] [~@12 e3 f#3 g3 a3] [b3@10 b3@2 c4@2 d4@2] [d4@4 e4@2 b3@4 a3@2 g3@2 a3@2]>\",\"sound\":\"gm_french_horn\",\"gain\":0.5},{\"mini\":\"<[~] [~] [~] [~@8 d3 d3 d3 d3 d3 d3 d3 d3]>\",\"sound\":\"gm_tremolo_strings\",\"gain\":0.3}],\"bpm\":145,\"bars\":4}"
      },
      "pairs_with": [
          "cand_b2_pk_skies_deck_battle"
      ],
      "confidence": "high"
  },
  "cand_b2_pk_shenmue_sea_heartbeat": {
      "id": "cand_b2_pk_shenmue_sea_heartbeat",
      "batch": 2,
      "key_tonic": "C",
      "key_mode": "minor",
      "type": "device",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/shenmue_sea (percussion feels like nature:sea:sneaky love it...).mid — bars 8-15 verbatim (bass trks 1+3, mid line trk4, drone trk2); percussion trk7 documented below",
      "why": "The 'rhythmic pulse of the bass' measured: a three-octave heartbeat — every quarter note, ONE pitch, staccato 8th gates, velocities breathing 88-125 with a longer leaned note at the end of each 2-bar phrase — under a pure phrygian shuttle (Cm 2 bars, Db^7 2 bars: the bass only ever moves a SEMITONE). The mid line plays only weak 16ths (slots 2,4,10,14) and is doing harmony work: it lands the sus4 (f) early in the tonic bar and resolves to b3 (eb) late — the sus lives inside the accompaniment. The ambiance is one Ab held across the whole loop (5th of Db, b6 rub over Cm). HIS percussion (not renderable in this batch's pitched schema, transcribe at promotion): NO kick/snare/hat — claves alone answer on beat 3 (soft and-of-1 v35, LOUD beat 3 v116-124), tambourine cluster on 16ths 4/6/8, maracas on 10/12, the two bars alternating. Water/sea is an empty lane in the catalog.",
      "his_prior_words": "percussion feels like nature:sea:sneaky love it, and i like the rhythmic pulse of the bass and everything and ambiance",
      "vibes": [
          "calm/sea",
          "sneaky/nature",
          "mysterious/water"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[c#2,c#3] [c#2,c#3] [c#2,c#3] [c#2,c#3]] [[c#2,c#3] [c#2,c#3] [c#2,c#3] [c#2,c#3]]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.6},{\"mini\":\"<[~ ~ f4@2 f4 ~ ~ ~ ~ ~ d#4@2 ~ ~ d#4@2] [~ ~ f4@2 f4 ~ ~ ~ ~ ~ d#4@2 d#4@2 d#4@2] [a#3@2 ~ ~ f4 ~ ~ ~ ~ ~ c4@3 ~ c4@2] [~@4 f4 ~ ~ ~ ~ ~ ~ ~ c4@2 c4@2]>\",\"sound\":\"gm_clarinet\",\"gain\":0.3},{\"mini\":\"<[g#3]>\",\"sound\":\"gm_pad_bowed\",\"gain\":0.18}],\"bpm\":158,\"bars\":4}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_pk_fangmei_farewell_descent": {
      "id": "cand_b2_pk_fangmei_farewell_descent",
      "batch": 2,
      "type": "harmony",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/fangmei_goodbye (love the strings and their chords, and the melody seems heartfelt).mid — string+piano harmony, bars 0-7 (8-bar period; the whole 32-bar file is this period 4x with voicing growth)",
      "why": "The heartfelt mechanism measured: a stepwise-DESCENDING diatonic loop in Ab major — IV^7, iii7, then a half-bar ii9->V9 into I — whose ANSWER phrase re-routes the cadence: the same IV^7-iii7-ii9 arrives but the ii climbs back to iii7 and lands on vi(madd9) instead of I (bars 4-7). Question resolves home, answer resolves deceptively — that alternation is the 'goodbye'. Every chord carries color (^7/m9/9/madd9, never a plain triad; his color-is-the-norm law from his own sad file), the strings voice it as sustained close blocks at half-bar rate, and the melody is a music-box line an octave-plus above. Sad is a named catalog gap; nothing carded resolves a major-key ii-V deceptively.",
      "his_prior_words": "love the strings and their chords, and the melody seems heartfelt",
      "vibes": [
          "sad/farewell",
          "somber/goodbye",
          "nostalgic/rest"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5:^7 4:m7 2:m9 7:9 0:^7 5:^7 4:m7 2:m9 4:m7 9:madd9\",\"symbols\":[\"Db^7\",\"Cm7\",\"Bbm9\",\"Eb9\",\"Ab^7\",\"Db^7\",\"Cm7\",\"Bbm9\",\"Cm7\",\"Fmadd9\"],\"family\":\"major\",\"key\":\"Ab\",\"bpm\":60,\"chordBeats\":[4,4,2,2,4,4,4,2,2,4],\"tonic\":\"Ab\"}"
      },
      "pairs_with": [
          "cand_b2_pk_un_minor_ii_v_lament",
          "cand_b2_pk_mir_sadness_floating"
      ],
      "confidence": "high"
  },
  "cand_b2_pk_theair_wind_gust": {
      "id": "cand_b2_pk_theair_wind_gust",
      "batch": 2,
      "key_tonic": "C",
      "key_mode": "major",
      "type": "device",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/theair (I like the melody and the woodwind arrpegio thing idkw hat it is to represend wind).mid — Track 11 (doubled on Track 12), gusts at bars 8, 11, 14-15, quantized from a loose performance",
      "why": "His 'woodwind arpeggio thing to represent wind' is a GUST: a fast run (10-15 notes, 16th-and-faster) that sweeps and then LANDS on one tone held for 2+ bars — the up-gust climbs a diatonic zigzag (c-d-e cells stepping up) into a high held G, the down-gust cascades a triad through three octaves (a-f#-d rotating registers, the local D chord as transcribed) into a low held A, and a third variant walks a full scale down two octaves. Wind = motion then stillness; nothing in the engine's melody family writes a sweep-and-hold ornament. The runs in the source are loose/triplet-leaning (performance MIDI); straightened to 16ths here with each landing given its own whole bar. Flying/wind is an empty catalog lane.",
      "his_prior_words": "I like the melody and the woodwind arrpegio thing idkw hat it is to represend wind",
      "vibes": [
          "flying/wind",
          "adventure/sky",
          "happy/valley"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[~@6 c6 d6 e6 c6 d6 e6 f6 d6 e6 f6] [g6] [~ a6 f#6 d6 a5 f#6 d6 a5 f#5 d6 a5 f#5 d5 a5 f#5 d5] [a4]>\",\"sound\":\"gm_flute\",\"bpm\":120,\"bars\":4,\"gain\":0.45}"
      },
      "pairs_with": [
          "cand_rl_r2_e_major_happy"
      ],
      "confidence": "high"
  },
  "cand_b2_pk_garden_horn_answer": {
      "id": "cand_b2_pk_garden_horn_answer",
    "addon_gain": 0.65,
      "batch": 2,
      "key_tonic": "E",
      "key_mode": "major",
      "type": "accomp_pattern",
      "source": "685floyd Cottonwood Omnisphere Bank: /Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/garden theme (I like the horns and how they support the main melody as another melody...).mid — chorus bars 54-55 verbatim: accordion lead + French horn + walking bass + piano offbeat comp",
      "why": "The horn 'another melody' measured: while the accordion stabs bright 3rd-dyads on top, the horn walks its OWN line of parallel sixths stepping down (b+g#, c#+a, b+g#, a+f#), then plays the key's 4th and 7th together (a+d# — the dominant tritone) and resolves it to an E octave: real two-voice counterpoint with a functional job, exactly the D94 dyad-subharmony shape from his own file. It enters on a 2-bar rotation, only in the bars the lead leaves room. Under it, the 'chord progression shifts': I to IV-over-tonic every half bar (E -> A/E on the piano's offbeat 8ths) while the bass ignores the pedal and WALKS a chromatic climb (e-f-g, f#-g#, e-f#-g#-a-b) every single bar. Town/garden lane fill; also his most-repeated 'more layers with their own melody' ask served from his own source.",
      "his_prior_words": "I like the horns and how they support the main melody as another melody, and how the chord progression shifts",
      "vibes": [
          "happy/town",
          "calm/garden",
          "nostalgic/village"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e5,g#5]@2 [e5,g#5] [f#5,a5]@2 [f#5,a5] [e5,g#5]@2 e5 [f#5,a5]@2 [f#5,a5] [e5,g#5]@2 e5 [f#5,a5]] [~ [e5,a5] [g#5,b5]@2 [g#5,b5] [a5,c#6,e6]@2 [a5,c#6,e6] [a5,c#6]@2 [g#5,b5,e6] [g#5,b5,e6]@2 [a5,c#6] [c#6,e6]@2]>\",\"sound\":\"gm_accordion\",\"gain\":0.45},{\"mini\":\"<[~@2 b3@2 e4@2 [b3,g#4]@2 [c#4,a4]@3 [b3,g#4]@3 [a3,f#4]@2] [[g#3,e4]@4 [a3,d#4]@4 [e3,e4]@8]>\",\"sound\":\"gm_french_horn\",\"gain\":0.4},{\"mini\":\"[e2@2 f2 g2@2 f#2 g#2@2 e2@2 f#2 g#2@2 a2 b2@2]\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@2 [e3,g#3,b3]@2 ~@2 [e3,g#3,b3]@2 ~@2 [e3,a3,d4]@2 ~@2 [e3,a3,d4]@2] [~@2 [e3,g#3,b3]@2 ~@2 [e3,g#3,b3]@2 ~@2 [e3,a3,c#4]@2 ~@2 [e3,a3,c#4]@2]>\",\"sound\":\"piano\",\"gain\":0.35}],\"bpm\":124,\"bars\":2}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b2_pk_mir_sadness_floating": {
      "id": "cand_b2_pk_mir_sadness_floating",
      "batch": 2,
      "key_tonic": "Bb",
      "key_mode": "major",
      "type": "accomp_pattern",
      "source": "685floyd Miraleste (Drum & Melody Kit): /Users/ethanchen/Downloads/685floyd - Miraleste (Drum & Melody Kit)/MIDI melodies/sad anime keys/sadness floating on a gentle breeze.mid — the full 4-bar loop (file is this loop 2x), one FL Keys track split into stacks / top line / walk-outs",
      "why": "The best of his seven 'sad anime keys' loops: Bb | iii7 | IV^7 in second inversion (Eb^7 keeping Bb in the bass) | ii7 that DARKENS to iim7b5 at the turnaround — the borrowed half-diminished ii is the sadness, a mode-mixture color no carded candidate uses outside dark/battle lanes. The texture is the anime-keys formula worth keeping as a preset: one sustained wide stack per bar, a held high note floating over bar 1 (d5+d6 across the whole bar), answer fragments only in the back halves, and a single walk-out bass note at each bar's beat 4 (c, d, c, then gb+d under the half-dim). Minor folds: bar-2 grace c5 dropped, two half-beat overlaps merged into their slots.",
      "his_prior_words": "",
      "vibes": [
          "sad/rain",
          "nostalgic/night",
          "somber/rest"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#2,f3,a#3,d4,f4] [d3,a3,d4,f4] [a#2,d#3,g3,a#3,d4,g4] [c3,a#3,d#4,g4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[d5,d6]] [~ c5 [d5,f6] [f5,d6]] [[a#4,a#5]@2 [d5,g5]@2] [[c5,d6]@2 [a#4,a#5] [c5,f5,c6]]>\",\"sound\":\"piano\",\"gain\":0.55},{\"mini\":\"<[~@3 c3] [~@3 d3] [~@3 c3] [~@2 [f#3,f#4] d3]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":116,\"bars\":4}"
      },
      "pairs_with": [
          "cand_b2_pk_fangmei_farewell_descent",
          "cand_b2_hm_grief_staircase"
      ],
      "confidence": "medium"
  },
  "cand_b2_pk_un_minor_ii_v_lament": {
      "id": "cand_b2_pk_un_minor_ii_v_lament",
      "batch": 2,
      "type": "harmony",
      "source": "Unison Free Emotional MIDI Chord Progressions: audios/Unison+Free+Emotional+MIDI+Chord+Progressions/04 - Eb Major - C Minor/Minor Prog 04 (...).mid — labeled iim7b5-V7b9-im9-VI-ivm9-bII9-im9 on the file; row un_emotional_minor_prog_04_eb in src/lib/progressions-unison.js (unratified, importer match: 5 agree / 2 colour / 0 conflict); source V is 7b9, downgraded to 7 (7b9 falls back to a plain triad in the dialect)",
      "why": "The catalog's first FUNCTIONAL minor cadence: iim7b5 - V7 - im9, then VI^7 - ivm9 - bII9 - im9 — a full lament loop that actually arrives home twice, where every carded minor harmony so far washes (im9 wash), planes (madd9), or vamps (dorian). The Neapolitan bII9 approaching i from a semitone above is the cinematic sigh, one passing chord rather than a phrygian vamp (distinct from the desert canon and from the dropped bII candidates). Verified note-for-note against the MIDI: every root and quality matches; the only loss in this render is the V's b9 (Ab over G7), named here because the downgrade is audible.",
      "his_prior_words": "",
      "vibes": [
          "sad/lament",
          "somber/aftermath",
          "emotional/cinematic"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"2:m7b5 7:7 0:m9 8:^7 5:m9 1b:9 0:m9\",\"symbols\":[\"Dm7b5\",\"G7\",\"Cm9\",\"Ab^7\",\"Fm9\",\"Db9\",\"Cm9\"],\"family\":\"minor\",\"key\":\"C\",\"bpm\":70,\"chordBeats\":[4,4,4,4,4,4,8],\"tonic\":\"C\"}"
      },
      "pairs_with": [
          "cand_b2_pk_fangmei_farewell_descent"
      ],
      "confidence": "high"
  },
  "cand_b2_pk_allstar_rest_loop": {
      "id": "cand_b2_pk_allstar_rest_loop",
      "batch": 2,
      "type": "harmony",
      "source": "audios/manual-r22/AllStarRestArea.mid (his hand-imported r22 set, research/manual-midi-r22.md) — bars 4-11, the full 8-bar loop; flagged 'good next-round seed' by the r33 catalog curator (cap casualty, not a quality drop)",
      "why": "The rest-area loop, measured: it starts OFF the tonic (IV^9) and withholds I^7 until bar 8, walking there through ii11, a first-inversion I, a V-of-V over its 3rd (A7/C# climbing to D), a Vsus->V half cadence — and then bar 5 answers with v MINOR (Dmadd9): the dominant just heard, immediately softened by mixture, before IV^7-ii11-V9 finally cadences. That borrowed v-minor after a half cadence exists nowhere in the catalog and is the whole 'safe to put the controller down' color. Invited back from batch 1 by the curator's own note; calm/rest sits between his shop and night lanes.",
      "his_prior_words": "",
      "vibes": [
          "calm/rest",
          "nostalgic/menu",
          "happy/town"
      ],
      "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5:^7 2:m9 0 5 2:7 7:sus 7 7:madd9 5:^7 2:m9 7:9 0:^7\",\"symbols\":[\"C^7\",\"Am9\",\"G\",\"C\",\"A7\",\"Dsus\",\"D\",\"Dmadd9\",\"C^7\",\"Am9\",\"D9\",\"G^7\"],\"family\":\"major\",\"key\":\"G\",\"bpm\":94,\"chordBeats\":[4,2,2,2,2,2,2,4,2,2,4,4],\"tonic\":\"G\"}"
      },
      "pairs_with": [
          "cand_hs_negrocity_walking_bass"
      ],
      "confidence": "medium"
  },
  "cand_b3_pz_offbeat_third_up": {
      "id": "cand_b3_pz_offbeat_third_up",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis of lp_r5_offbeat_pluck — his exact suggestion applied: the third offbeat lifts one scale step (5 5 s6); s-tokens resolve against each chord scale so it can never leave the key",
      "why": "The offbeat pedal with his up-a-note-on-the-third variation. Baseline hypothesis of the pizz lab: does one moving note cure the uniformity while keeping the offbeat identity?",
      "his_prior_words": "maybe could also play some notes like up a note on the third note occasionally for variation (lp_r5 pair note); pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression",
      "vibes": [
          "happy/menu",
          "calm/shop",
          "excited/training"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"5\",\"5\",\"s6\"],\"onsets\":[\"1/8\",\"3/8\",\"5/8\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":1}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pz_offbeat_walkup": {
      "id": "cand_b3_pz_offbeat_walkup",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis of lp_r5_offbeat_pluck — offbeats climb the chord (R 3 5) instead of holding one pitch",
      "why": "Rising-through-the-chord offbeats: every bar climbs its own chord, so the line re-pitches with the harmony by construction. Hypothesis: motion via chord tones reads as buildup (his word on the pizz family) without dissonance risk.",
      "his_prior_words": "pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression; conveys a bit of buildup (lp_r5 on shenightfall)",
      "vibes": [
          "happy/menu",
          "excited/training",
          "adventure/departure"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"R\",\"3\",\"5\"],\"onsets\":[\"1/8\",\"3/8\",\"5/8\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":1}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pz_offbeat_answer": {
      "id": "cand_b3_pz_offbeat_answer",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis of lp_r5_offbeat_pluck — 2-bar statement/answer: bar 1 holds the 5th, bar 2 answers 3 s4 3",
      "why": "Call-and-answer pizz: the uniform bar becomes a question, the second bar a stepwise answer around the 3rd. Hypothesis: 2-bar periodicity is the cheapest cure for offbeat monotony.",
      "his_prior_words": "pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression",
      "vibes": [
          "happy/menu",
          "calm/shop",
          "nostalgic/rest"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"5\",\"5\",\"5\",\"3\",\"s4\",\"3\"],\"onsets\":[\"1/8\",\"3/8\",\"5/8\",\"9/8\",\"11/8\",\"13/8\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":2}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pz_offbeat_dip": {
      "id": "cand_b3_pz_offbeat_dip",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis of lp_r5_offbeat_pluck — the third offbeat dips to the scale 4th under the 5th (lower neighbor)",
      "why": "The mirror of the third-up card: down a step instead of up. A/B against cand_b3_pz_offbeat_third_up to learn which direction his ear prefers for pizz motion.",
      "his_prior_words": "pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression",
      "vibes": [
          "calm/shop",
          "nostalgic/rest",
          "mysterious/night"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"5\",\"5\",\"s4\"],\"onsets\":[\"1/8\",\"3/8\",\"5/8\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":1}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pz_double_stop": {
      "id": "cand_b3_pz_double_stop",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis — offbeat DYADS (3.5 double stops) instead of single plucks",
      "why": "Two-note pizz chords on the offbeats: thicker, more harmonic, same rhythm. Hypothesis: the dyad reads as a different instrument role (comp) vs the single-note pedal (texture).",
      "his_prior_words": "pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression",
      "vibes": [
          "happy/menu",
          "town/village-day",
          "victory/epilog"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"3.5\",\"3.5\",\"3.5\"],\"onsets\":[\"1/8\",\"3/8\",\"5/8\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":1}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pz_tresillo_ground": {
      "id": "cand_b3_pz_tresillo_ground",
      "batch": 3,
      "type": "accomp_pattern",
      "source": "AUTHORED variation hypothesis — pizz moved ON the beat in a 3+3+2 tresillo (R 5 3), the grounded counterpart of the offbeat family",
      "why": "Same instrument, opposite placement: downbeat-anchored 3+3+2 through chord tones. Hypothesis: placement (on vs off the beat) is the pizz family’s biggest vibe lever.",
      "his_prior_words": "pizz should be explored as an option and should be analyzed for what variations work - create variations of pizz, with each variation as a hypothesis for creation... be creative but true to the chord progression",
      "vibes": [
          "groovy/stroll",
          "adventure/caravan",
          "happy/festival"
      ],
      "render": {
          "kind": "figure",
          "spec": "{\"figure\":[\"R\",\"5\",\"3\"],\"onsets\":[\"0\",\"3/8\",\"3/4\"],\"bpm\":102,\"octave\":4,\"sound\":\"gm_pizzicato_strings\",\"harmony\":{\"degrees\":\"0:^7 9:m7 5:^7 7:7\",\"family\":\"major\",\"tonic\":\"C\"},\"bars\":1}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_sleigh_clock": {
      "id": "cand_b3_pv_sleigh_clock",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — the 7thsaga triangle-clock idea voice-swapped to sleigh bells (his triangle-reminds-me-of-snow reading), half-note clock + soft shaker answer",
      "why": "His reading made the connection: soft ringing metal = snow. This is the clock pattern on the snow timbre — sleigh bells keeping halves, a soft shaker answering the and-of-2.",
      "his_prior_words": "the soft triangle (as an instrument) kinda reminds me of snow. not this particular rhythm but just the instrument (7thsaga pair note); same for alternate drum melodies like using triangle or shake or etc",
      "vibes": [
          "somber/snow",
          "calm/night",
          "nostalgic/winter"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":96,\"bars\":2,\"onsets\":[\"0\",\"1/2\",\"5/8\",\"1\",\"3/2\",\"13/8\"],\"sounds\":[\"vc_sleigh\",\"vc_sleigh\",\"vc_shaker_soft\",\"vc_sleigh\",\"vc_sleigh\",\"vc_shaker_soft\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_agogo_answer": {
      "id": "cand_b3_pv_agogo_answer",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — agogo bell call answered by woodblock, second bar extends the answer (built-in variation)",
      "why": "A two-voice percussion MELODY: bell states a 3-hit call, woodblock answers; the repeat lengthens the answer so no two bars are identical. His alternate-drum-melodies ask made literal.",
      "his_prior_words": "same for alternate drum melodies like using triangle or shake or etc",
      "vibes": [
          "forest/jungle",
          "town/market",
          "quirky/workshop"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":112,\"bars\":2,\"onsets\":[\"0\",\"3/16\",\"1/4\",\"1/2\",\"11/16\",\"1\",\"19/16\",\"5/4\",\"3/2\",\"13/8\",\"27/16\"],\"sounds\":[\"vc_agogo\",\"vc_agogo\",\"vc_agogo\",\"vc_woodblock\",\"vc_woodblock\",\"vc_agogo\",\"vc_agogo\",\"vc_agogo\",\"vc_woodblock\",\"vc_woodblock\",\"vc_woodblock\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_log_duet": {
      "id": "cand_b3_pv_log_duet",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — tuned log drums (hi/lo) playing a lilting two-pitch melody cell",
      "why": "The most melodic percussion in the pack: two pitched log drums trading a contour, a drum line that reads as a tune. Candidate voice for organic/nature vibes.",
      "his_prior_words": "same for alternate drum melodies like using triangle or shake or etc; drums can be layered and mixed too",
      "vibes": [
          "forest/jungle",
          "calm/nature",
          "sneaky/ruins"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":104,\"bars\":1,\"onsets\":[\"0\",\"1/4\",\"3/8\",\"1/2\",\"11/16\",\"3/4\"],\"sounds\":[\"vc_log_lo\",\"vc_log_hi\",\"vc_log_hi\",\"vc_log_lo\",\"vc_log_hi\",\"vc_log_lo\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_zill_offbeat": {
      "id": "cand_b3_pv_zill_offbeat",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — finger cymbals on the offbeats (the pizz-offbeat placement in ringing metal), bar 2 ends in a windchime sweep",
      "why": "The offbeat device on a shimmer timbre: zills where the pizz would pluck, and the last hit of the period becomes a chime sweep so the loop breathes. Hypothesis: offbeat metal = sparkle without density.",
      "his_prior_words": "same for alternate drum melodies like using triangle or shake or etc",
      "vibes": [
          "mysterious/night",
          "desert/oasis",
          "calm/shrine"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":100,\"bars\":2,\"onsets\":[\"1/8\",\"3/8\",\"5/8\",\"9/8\",\"11/8\",\"7/4\"],\"sounds\":[\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_zill\",\"vc_windchimes\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_shaker_staircase": {
      "id": "cand_b3_pv_shaker_staircase",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — the velocity-staircase idea as a SOUND staircase: soft shaker sparse in bar 1, hard shaker filling bar 2",
      "why": "Density and loudness climb across the 2-bar period then reset — a breathing texture rather than a wall. His continuous-layers-sit-back law built into the pattern itself.",
      "his_prior_words": "drums can be layered and mixed too; some layers should be softer and heard in the background if it’s like continuous",
      "vibes": [
          "happy/festival",
          "excited/training",
          "water/beach"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":116,\"bars\":2,\"onsets\":[\"0\",\"1/2\",\"1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"15/8\"],\"sounds\":[\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_pv_woodblock_clock": {
      "id": "cand_b3_pv_woodblock_clock",
      "batch": 3,
      "type": "rhythm",
      "source": "AUTHORED — woodblock quarter clock with a claves answer on the and-of-3",
      "why": "The town-clock idea on wood: dry ticking quarters, one syncopated claves answer per bar. Minimal, layerable under nearly anything per his drums-can-layer note.",
      "his_prior_words": "drums can be layered and mixed too",
      "vibes": [
          "town/village-day",
          "quirky/errand",
          "calm/shop"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":108,\"bars\":1,\"onsets\":[\"0\",\"1/4\",\"1/2\",\"5/8\",\"3/4\"],\"sounds\":[\"vc_woodblock\",\"vc_woodblock\",\"vc_woodblock\",\"vc_claves\",\"vc_woodblock\"]}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_accordion": {
      "id": "cand_b3_iv_accordion",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the accordion serve? My guesses: town square / French café / traveling merchant candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_accordion\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_harmonica": {
      "id": "cand_b3_iv_harmonica",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the harmonica serve? My guesses: lazy afternoon / western / campfire candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_harmonica\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_koto": {
      "id": "cand_b3_iv_koto",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the koto serve? My guesses: zen / east / garden candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_koto\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_steel_drums": {
      "id": "cand_b3_iv_steel_drums",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the steel drums serve? My guesses: beach / island / vacation candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_steel_drums\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_ocarina": {
      "id": "cand_b3_iv_ocarina",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the ocarina serve? My guesses: pastoral / adventure / ruins candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_ocarina\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_iv_fiddle": {
      "id": "cand_b3_iv_fiddle",
      "batch": 3,
      "type": "instrument_for_vibe",
      "source": "AUTHORED timbre probe — the SAME 2-bar C-major phrase as its five siblings; only the instrument changes, so the label is purely about the voice",
      "why": "Which vibes does the fiddle serve? My guesses: folk dance / tavern / harvest candidates — but the phrase is deliberately neutral so your ear decides. (First cards of the instrument_for_vibe type; the catalog had none.)",
      "his_prior_words": "",
      "vibes": [],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e4@2 g4@2 a4@4 g4@2 e4@2 d4@2 c4@2] [d4@2 e4@2 g4@6 e4@2 c4@4]>\",\"sound\":\"gm_fiddle\",\"bpm\":96,\"bars\":2,\"gain\":0.6,\"tonic\":\"C\"}"
      },
      "pairs_with": [],
      "confidence": "high"
  },
  "cand_b3_sd_woodman_stomp": {
      "id": "cand_b3_sd_woodman_stomp",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/Woodman.mid, bars 2-3 (the A|fill 2-bar loop covers 14 of the 16 groove bars 2-17), ch9. All velocities flat 127 in source. The fill's last snare sits at raw 46.5/48 (a 32nd before the barline); rounded to slot 47 per the scan quantizer.",
      "why": "Forest stomp with a written accelerando: kick stamps every quarter while the snare answers every AND (offbeat 8ths, a full-bar call-response at 85bpm), and bar 2 closes by tightening the snare — from its last and (slot 30) the gaps run 9-3-3-2 slots: a dotted-8th reach, two 16ths, then a final tap only a 24th-slot behind, rolling the loop over. Zero velocity dependence — the whole pattern is placement.",
      "his_prior_words": "",
      "vibes": [
          "forest/jungle",
          "march",
          "battle/boss"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":85,\"bars\":2,\"onsets\":[\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"29/16\",\"15/8\",\"31/16\",\"95/48\"],\"sounds\":[\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
      },
      "pairs_with": [
          "cand_r15_jp2_flute_call"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_semap_role_inversion": {
      "id": "cand_b3_sd_semap_role_inversion",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/SEMap.mid, bars 7-14 + 18-56 (the dominant 1-bar loop, ~39 of 57 drummed bars), ch9. Source doubles the snare (GM 38+40 same slot) — deduped to one; GM 80 (mute triangle) -> vc_zill, the set's nearest small metal; velocities flat 80.",
      "why": "Full role inversion of a rock beat: the SNARE holds the anchors (beats 1 and 3) while the kick answers in offbeat pairs (beat 2 + its and, and-of-3 + beat 4), each kick doubled by a low tom so the answer has a pitched thump. A muted-triangle turn (and-of-1, then 16ths at 4.5/4.75) rolls the bar over. Marching adventure with the weight upside down.",
      "his_prior_words": "",
      "vibes": [
          "overworld",
          "march",
          "adventure/quest"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":140,\"bars\":1,\"onsets\":[\"0\",\"1/8\",\"1/4\",\"1/4\",\"3/8\",\"3/8\",\"1/2\",\"5/8\",\"5/8\",\"3/4\",\"3/4\",\"7/8\",\"15/16\"],\"sounds\":[\"md_snare\",\"vc_zill\",\"md_kick\",\"vc_tom_lo\",\"md_kick\",\"vc_tom_lo\",\"md_snare\",\"md_kick\",\"vc_tom_lo\",\"md_kick\",\"vc_tom_lo\",\"vc_zill\",\"vc_zill\"]}"
      },
      "pairs_with": [
          "cand_cw_airvoyage_pendulum"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_dkltemple_lattice": {
      "id": "cand_b3_sd_dkltemple_lattice",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/gameboy/DKLTemple.mid, bars 0-63 (one bar at 94% coverage of 64 drummed bars), ch9. GM note 32 (a click, off-map) fills the stick's and-of-2 — folded into md_stick; same-sound unisons (two low toms, two hats) deduped; velocities flat 75.",
      "why": "Tom+rim unison lattice with no kick anywhere: stick+both-toms walk the 8ths, the snare backbeat (with closed hat) takes 2 and 4 cleanly out of the lattice, the whole ensemble REFUSES beat 3 (a one-8th hole every bar), and the bar closes on a five-voice pile (stick+hat+open-hat+riq+high-tom). Percussion as an ensemble texture — temple ritual, not a kit groove.",
      "his_prior_words": "",
      "vibes": [
          "cave/dungeon",
          "forest/jungle",
          "march"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":140,\"bars\":1,\"onsets\":[\"0\",\"0\",\"0\",\"1/8\",\"1/8\",\"1/8\",\"1/4\",\"1/4\",\"1/4\",\"3/8\",\"3/8\",\"3/8\",\"5/8\",\"5/8\",\"5/8\",\"3/4\",\"3/4\",\"3/4\",\"7/8\",\"7/8\",\"7/8\",\"7/8\",\"7/8\"],\"sounds\":[\"md_stick\",\"vc_tom_hi\",\"vc_tom_lo\",\"md_stick\",\"vc_tom_hi\",\"vc_tom_lo\",\"md_hat\",\"md_snare\",\"md_stick\",\"md_stick\",\"vc_tom_hi\",\"vc_tom_lo\",\"md_stick\",\"vc_tom_hi\",\"vc_tom_lo\",\"md_hat\",\"md_snare\",\"md_stick\",\"md_hat\",\"md_ohat\",\"md_stick\",\"vc_riq\",\"vc_tom_hi\"]}"
      },
      "pairs_with": [
          "cand_cw_dungeoncave_lefthand"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_viewpoint_swing_ride": {
      "id": "cand_b3_sd_viewpoint_swing_ride",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/genesis/viewpoint.mid, bars 4-79 (one bar at 94% coverage), ch9. Velocity substitution: the beat-3 triplet ghost snare (v43 vs v125-127 backbeats) is rendered md_stick (sidestick — the lounge drummer's quiet stroke); kick pickups (v57-72 vs v127) stay md_kick, their swung placement carries them.",
      "why": "A genuinely swung ride-led lounge kit, all on real triplet slots (no microtiming): the ride walks swing 8ths with skip-notes, then RUNS four consecutive 16th-triplets across beat 4 into a drag tap a 24th before the next downbeat; the kick ghosts a swung 24th pickup before beats 2, 4 and 1; snare backbeats 2/4 with a triplet sidestick answer inside beat 3. 108bpm cocktail groove — the casino/night lane has no swung kit at all.",
      "his_prior_words": "",
      "vibes": [
          "casino",
          "night/jazz",
          "menu/title"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":108,\"bars\":1,\"onsets\":[\"0\",\"0\",\"1/8\",\"5/24\",\"1/4\",\"1/4\",\"1/3\",\"3/8\",\"1/2\",\"1/2\",\"7/12\",\"5/8\",\"17/24\",\"17/24\",\"3/4\",\"3/4\",\"19/24\",\"5/6\",\"7/8\",\"23/24\",\"23/24\"],\"sounds\":[\"md_kick\",\"md_metal\",\"md_metal\",\"md_kick\",\"md_metal\",\"md_snare\",\"md_metal\",\"md_metal\",\"md_kick\",\"md_metal\",\"md_stick\",\"md_metal\",\"md_kick\",\"md_metal\",\"md_metal\",\"md_snare\",\"md_metal\",\"md_metal\",\"md_metal\",\"md_kick\",\"md_metal\"]}"
      },
      "pairs_with": [
          "cand_ut_raining_jazz_walk"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_platoon_tick": {
      "id": "cand_b3_sd_platoon_tick",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/nes/Platoon-Title.mid, bars 0-97 (one bar, 100% of 98 drummed bars), ch9. Two-tier velocity (clicks v127, echoes v26) rendered as sound choice: the echo — same hat/stick voices a tier down in source — becomes vc_shaker_soft, the only intrinsically quiet stroke in the set.",
      "why": "The minimal march tick: TOTAL silence except beats 2 and 4, where a three-voice unison click (stick+closed hat+open hat) fires and a ghost echoes it exactly one 16th later at a fifth the level. No kick, no snare, no beat 1 — the dread is in what refuses to play. Layers under any melody without touching the low end; tense military menu at 100bpm.",
      "his_prior_words": "",
      "vibes": [
          "march",
          "tense/military",
          "sneaky/stealth"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":100,\"bars\":1,\"onsets\":[\"1/4\",\"1/4\",\"1/4\",\"5/16\",\"3/4\",\"3/4\",\"3/4\",\"13/16\"],\"sounds\":[\"md_hat\",\"md_ohat\",\"md_stick\",\"vc_shaker_soft\",\"md_hat\",\"md_ohat\",\"md_stick\",\"vc_shaker_soft\"]}"
      },
      "pairs_with": [
          "cand_cw_airpirate_bass"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_battletoads_hat_drag": {
      "id": "cand_b3_sd_battletoads_hat_drag",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/gameboy/BattletoadsLev3.mid, bars 0-25 (one bar at 72% coverage of 36 drummed bars), ch9. RE-JUDGED from the b2 velocity-dependence reject: the hat's dynamics are BIMODAL (accents v99-100 always on beat downbeats, ghosts v60-70 on the drag slots — no gradient), and the tiers occupy disjoint slots, so a two-sound split (accents md_hat, ghosts vc_shaker_soft) preserves the architecture the flat-gain renderer erased.",
      "why": "Hybrid duple/triplet hat drag, identical every beat: an accented hat ON the beat, then ghosts at the 2nd 8th-triplet, the STRAIGHT and, and the last 16th-triplet — a 4-stroke cell that is neither straight nor shuffled but drags between the grids. Kick 1/3, snare 2/4 underneath at fixed level. The speeder-bike chase shuffle at 112bpm.",
      "his_prior_words": "",
      "vibes": [
          "battle/boss",
          "chase/speed"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":112,\"bars\":1,\"onsets\":[\"0\",\"0\",\"1/12\",\"1/8\",\"5/24\",\"1/4\",\"1/4\",\"1/3\",\"3/8\",\"11/24\",\"1/2\",\"1/2\",\"7/12\",\"5/8\",\"17/24\",\"3/4\",\"3/4\",\"5/6\",\"7/8\",\"23/24\"],\"sounds\":[\"md_hat\",\"md_kick\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"md_hat\",\"md_snare\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"md_hat\",\"md_kick\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"md_hat\",\"md_snare\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
      },
      "pairs_with": [],
      "confidence": "medium"
  },
  "cand_b3_sd_mpaint_trot": {
      "id": "cand_b3_sd_mpaint_trot",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-corpus/snes/mpaint-title.mid, bars 0-115 (one bar at 78% coverage), ch9. RE-JUDGED from the b2 velocity-dependence reject: source is closed hat + muted conga in strict unison at three velocity tiers (accents v119-121, medium v64, soft v41-46), each tier on its own slots. Rendered as orchestration — accents keep the full hat+conga unison, the medium keeps the conga alone, softs become vc_shaker_soft — so intensity is carried by voice count instead of the velocity the flat-gain page cannot play.",
      "why": "A canter gait, not a grid: onsets repeat quarter / long-triplet / short-triplet (spacings 12-8-4 slots), so the pattern gallops da-DUM-da-dum-DUM-da with accents on beats 2 and 4 — a horse trot at 225bpm that stays upright even at flat gain because the gait is in the spacing. The soft downbeat (beat 1 is the QUIETEST stroke) is the joke that makes it playful.",
      "his_prior_words": "",
      "vibes": [
          "menu/title",
          "playful/goofy",
          "happy/menu"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":225,\"bars\":1,\"onsets\":[\"0\",\"1/4\",\"1/4\",\"5/12\",\"1/2\",\"3/4\",\"3/4\",\"11/12\"],\"sounds\":[\"vc_shaker_soft\",\"md_hat\",\"vc_conga_mute\",\"vc_shaker_soft\",\"vc_conga_mute\",\"md_hat\",\"vc_conga_mute\",\"vc_shaker_soft\"]}"
      },
      "pairs_with": [
          "cand_ut_shop_bounce_acc"
      ],
      "confidence": "medium"
  },
  "cand_b3_sd_redrum_tension_strings": {
      "id": "cand_b3_sd_redrum_tension_strings",
      "batch": 3,
      "key_tonic": "A",
      "key_mode": "minor",
      "type": "device",
      "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/RedRum-JimmyQTEChase (I like the rhythm and the melody in the strings or whatever it was - conveys tension and the chord progression).mid, tracks 1/5/6 (strings + octave copy + held line) and 3 (bass), bars 0-15. Ostinato rendered at the track-5 octave-copy register (the base track sits a2-g3, below the pizzicato range floor); source notes are 32nd stabs, rendered as staccato 16ths; the held top line moves one pitch per TWO bars in source, compressed to one per bar so 4 bars carry the full G-A-Bb-A arc; the A0/A1 bass pedal (struck once per 2 bars) is seated at a2 and re-struck per bar (mini cannot tie across barlines).",
      "why": "His tension device measured: a 2-bar staccato string ostinato of three-16th cells with a rest every 4th slot (A-E-D falling / D-G-A rising), whose B bar FILLS the tail gaps into an unbroken run — the rhythm and the melody are the same object, which is exactly what his note says. Over it, one held string line planes G (b7) -> A (root) -> Bb (b9!) -> A: the chord progression he heard is ONE chord re-colored, with the Bb-vs-A-pedal semitone as the tension peak. Source arrangement grows by octave copies (bar 6 +12, bar 12 a unison double) — R1 reregister from a file he labeled himself.",
      "his_prior_words": "I like the rhythm and the melody in the strings or whatever it was - conveys tension and the chord progression (RedRum-JimmyQTEChase)",
      "vibes": [
          "tense/chase",
          "sneaky/stealth",
          "battle/boss"
      ],
      "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 e4 d4 ~ d4 g3 a3 ~ a3 e4 d4 ~ d4 g4 e4 ~] [a3 e4 d4 ~ d4 g3 a3 ~ a3 e4 d4 g4 e4 a4 g4 g4] [a3 e4 d4 ~ d4 g3 a3 ~ a3 e4 d4 ~ d4 g4 e4 ~] [a3 e4 d4 ~ d4 g3 a3 ~ a3 e4 d4 g4 e4 a4 g4 g4]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.5},{\"mini\":\"<g4 a4 a#4 a4>\",\"sound\":\"gm_tremolo_strings\",\"gain\":0.3},{\"mini\":\"<a2 a2 a2 a2>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5}],\"bpm\":70,\"bars\":4,\"tonic\":\"A\"}"
      },
      "pairs_with": [
          "cand_b2_dr_shadowrun_creep"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_enemy_chaos_melody": {
      "id": "cand_b3_sd_enemy_chaos_melody",
      "batch": 3,
      "key_tonic": "E",
      "key_mode": "minor",
      "type": "melody_pattern",
      "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/enemy_chaos(I like the melody - conveys enemy, and the drums).mid, track 2 \"Lead 8 (bass + lead)\", bars 0-3 (the 4-bar loop; bars 4-7 repeat it verbatim, the whole file is built on it). Two dyads that ring 4 slots across a barline in source are clipped to 2; the pad track doubles this line in unison and the pick bass doubles it 2 octaves down.",
      "why": "The \"conveys enemy\" mechanism measured: a parallel power-dyad line — the three-8th B/E pump is a bare FOURTH, the walk that follows is in 5ths — descending CHROMATICALLY E -> D# -> D -> C# -> C with every post-pump attack on an offbeat (and-of-2, and-of-3, and-of-4 — an anticipation chain), landing on A/E and pushing to F or G colors (the two 4ths) at each phrase end. Menace = chromatic creep + power intervals + never striking with the pulse it just established. His note names this melody AND the drums; the kit (an all-v127 four-16th kick quad opening every bar, snare displaced and-of-4 vs on-4) is a further seed, documented in the mining report.",
      "his_prior_words": "I like the melody - conveys enemy, and the drums (enemy_chaos)",
      "vibes": [
          "battle/boss",
          "tense/enemy",
          "chase/speed"
      ],
      "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[b3,e4]@2 [b3,e4]@2 [b3,e4]@2 [e4,b4]@4 [d#4,a#4]@4 [d4,a4]@2] [~@2 [c#4,g#4]@4 [a3,e4]@4 [a3,e4]@2 [c4,f4]@4] [[b3,e4]@2 [b3,e4]@2 [b3,e4]@2 [d#4,a#4]@4 [d4,a4]@4 [c#4,g#4]@2] [~@2 [c4,g4]@4 [a3,e4]@4 [a3,e4]@2 [d4,g4]@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.5,\"bpm\":140,\"bars\":4,\"tonic\":\"E\"}"
      },
      "pairs_with": [
          "cand_b2_pk_skies_deck_battle"
      ],
      "confidence": "high"
  },
  "cand_b3_sd_snowy_perc_elements": {
      "id": "cand_b3_sd_snowy_perc_elements",
      "batch": 3,
      "type": "rhythm",
      "source": "/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank/snowy(I like chords, extra stuff, and percussive snow elements).mid, ch9 (Orchestra Kit), bars 0-1 (the 2-bar unit repeats through all 119 drummed bars). GM 83 (jingle bell) -> vc_sleigh; GM 81 (open triangle) -> vc_zill, the set's nearest ring. The sleigh's written velocity ladder (55-50-45-40-35-30) is approximated by handing the last three strokes to vc_shaker_soft — the shake dying into a hush; the triangle's rise (60-80-100) flattens, its dotted-8th climb carries the answer by placement.",
      "why": "His \"percussive snow elements\" located exactly: bar 1's back half is a sleigh-bell shake FADING over six straight 16ths (a written decay, the snow settling), and bar 2 answers with an open-triangle CLIMB on dotted 8ths (beat 3, 3.75, 4.5) rising to full — decay answered by crescendo, straight 16ths answered by dotted spacing, every bar's front half silent. The file's other snow layers (Seashore noise wash, guitar fret-noise ticks) have no closed-set voice and are named here so promotion knows what it is missing.",
      "his_prior_words": "I like chords, extra stuff, and percussive snow elements (snowy)",
      "vibes": [
          "snow/ice",
          "calm/night",
          "sad/sparse"
      ],
      "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":72,\"bars\":2,\"onsets\":[\"5/8\",\"11/16\",\"3/4\",\"13/16\",\"7/8\",\"15/16\",\"3/2\",\"27/16\",\"15/8\"],\"sounds\":[\"vc_sleigh\",\"vc_sleigh\",\"vc_sleigh\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_zill\",\"vc_zill\",\"vc_zill\"]}"
      },
      "pairs_with": [
          "cand_ut_snowy_bell_fall"
      ],
      "confidence": "high"
  },
  "cand_b4_ex_dance_intro": {
    "id": "cand_b4_ex_dance_intro",
    "his_prior_words": "moreover there's also the beginning measure or two before the actual section starts - could analyze that too but it's more complex.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "device",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bar 0 into bar 1",
    "why": "The intro measure he pointed at: the WHOLE band (brass in 4-note major chords, piano+strings doubling the top line two octaves down, drums on stick ticks) planes chromatically down E-Eb-D-C#-D-C#-C-B in straight 8ths with a dotted push on beat 3, the bass walking in at the and-of-2 — then bar 2 locks the groove and a unison E stab stamps beat 1 (the source fires an orchestra hit here and at the halfway return, bar 25, only). One bar of unison descent = the whole \"danger\" setup; every instrument states it, nothing harmonizes it.",
    "scope": "boss/battle intros — a unison chromatic slide onto the tonic reads as threat; too theatrical for calm lanes",
    "question": "Should intros like this become a device the engine can pick for boss/battle songs (one unison bar, all instruments, then the groove locks)?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[e4,b4,e5,g#5] ~ [eb4,bb4,eb5,g5] ~ [d4,a4,d5,f#5]@3 [c#4,g#4,c#5,f5] [d4,a4,d5,f#5] ~ [c#4,g#4,c#5,f5] ~ [c4,g4,c5,e5] ~ [b3,f#4,b4,eb5] ~] [[e4,b4,e5]@4 ~@12]>\",\"sound\":\"gm_trumpet\",\"gain\":0.5},{\"mini\":\"<[e3 ~ eb3 ~ d3@3 c#3 d3 ~ c#3 ~ c3 ~ b2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@7 b2 d3 ~ c#3 ~ c3 ~ b2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<[md_stick ~ md_stick ~ md_stick ~ ~ md_kick [md_snare,md_clap] ~ [md_kick,md_snare,md_clap] ~ [md_snare,md_clap] ~ [md_kick,md_snare,md_clap] ~] [md_kick ~ vc_riq ~ [md_snare,md_clap] ~ vc_riq ~ vc_riq ~ [md_kick,vc_riq] ~ [md_snare,md_clap] md_kick [md_kick,vc_riq] ~]>\",\"sound\":\"md_kick\",\"gain\":0.8}],\"bpm\":115,\"bars\":2}"
    }
  },
  "cand_b4_ex_lh_blues_walk": {
    "id": "cand_b4_ex_lh_blues_walk",
    "his_prior_words": "the left hand piano in the beginning section is a valid thing to take.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "accomp_pattern",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bars 1-16 (x32 over the song)",
    "why": "The left hand he called valid to take: a one-bar E blues-scale walk in straight 8ths — R b3 2 4 5 b5 4 b3 (e g f# a b bb a g) — and in the source it is played in EXACT UNISON by piano LH, electric bass and synth bass at once (three instruments, one line, one octave). Lifted one octave here (source sits at octave 1, under our floor). The b5 passing tone is what makes it danger rather than noodle.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"piano\",\"gain\":0.55},{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5}],\"bpm\":115,\"bars\":1}"
    }
  },
  "cand_b4_ex_lh_dominant_gallop": {
    "id": "cand_b4_ex_lh_dominant_gallop",
    "his_prior_words": "and then the variation of the piano left hand and the variation in the melody.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "device",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bars 17-24 (LH forms: walk x32, gallop x6+x4, climb x2)",
    "why": "The left-hand VARIATION he named, measured: after 16 bars of the blues walk, the whole LH unison moves to the DOMINANT and becomes a B octave gallop (b2-b3 pairs in a pushed rhythm) for 8 bars — alternate bars end c4 vs bb2 — then a half-bar chromatic climb (b c d eb) walks it back into the E riff. The variation is a register+rhythm change on a pedal, not a re-harmonization: same drive, new floor. Card = 4 walk bars, 3 gallop bars, the climb bar.",
    "question": "Is this the kind of \"safe variation\" you mean for strong figures — hold the identity 16 bars, then one section on the V with a new rhythm shape, then walk back?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 c4 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 bb2 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 c4 ~] [~@8 b3 b2 c3 ~ d3 ~ eb3 ~]>\",\"sound\":\"piano\",\"gain\":0.55},{\"mini\":\"<[e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 c4 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 bb2 ~] [b2 ~ b3 ~ b2 b3 ~ b2 b3 ~ b2 b3 ~ b2 c4 ~] [~@8 b3 b2 c3 ~ d3 ~ eb3 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5}],\"bpm\":115,\"bars\":8}"
    }
  },
  "cand_b4_ex_brass_planing_stabs": {
    "id": "cand_b4_ex_brass_planing_stabs",
    "his_prior_words": "then there's also the patterns in the melody in the trumpets and how there's multiple notes in the trumpet.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "melody_pattern",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bars 5-8 (brass returns at 19-24, 29-32, 43-48)",
    "why": "His \"multiple notes in the trumpet\", measured: the brass NEVER plays one note — 90 of 90 attacks are chords. Post-intro it stabs 3-note root-5th-octave voicings on the offbeats (beat 2, a dotted beat 3, the and-of-3), each stab answered a semitone DOWN (E to Eb, D to C#) — chromatic lower-neighbor planing between the riff onsets, then a G-to-C# held resolution in bar 4. It lives only in the gaps the lead leaves.",
    "question": "The stabs answer only in the rests between phrases — worth a standing rule (brass chords live in lead gaps), or should some songs let them overlap the lead?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 [e4,b4,e5] ~@3 [eb4,b4,eb5]@3 [b3,g4,b4] ~@4] [~@4 [d4,b4,d5] ~@3 [c#4,bb4,c#5]@3 [bb3,f#4,bb4] ~@4] [~@4 [e4,b4,e5] ~@3 [eb4,b4,eb5]@3 [b3,g4,b4] ~@2 [e3,b3,e4] ~] [[d4,g4,d5] ~@2 [d4,g4,d5] ~@2 [c#4,g4,c#5]@10]>\",\"sound\":\"gm_trumpet\",\"gain\":0.5},{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":115,\"bars\":4}"
    }
  },
  "cand_b4_ex_octave_growth": {
    "id": "cand_b4_ex_octave_growth",
    "his_prior_words": "then there's also the pattern in how it adds octaves over time without adding dissonance with layers, and with instruments.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "device",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bars 1-12 (riff bar 1, strings bar 5, leads bar 9)",
    "why": "The growth pattern he named, measured: the song adds octaves WITHOUT adding pitch classes. Bar 1: the riff in unison at one octave. Bar 5: strings re-enter the SAME riff as exact +1/+2 octave copies (100% of string attack instants are internal octaves). Bar 9: the melody enters already doubled two octaves up (sawtooth copies the lead on 85% of its notes at +24). Every growth step is an exact octave copy or a previously empty register — that is why it thickens without dissonance. Card compresses the ladder to 4+4+4 bars.",
    "question": "The +24 double enters WITH the melody (born doubled). Do you want doubling as a later growth step too (melody alone first, +24 copy joins next section)?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.45},{\"mini\":\"<~ ~ ~ ~ [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~] [[e3,e4] ~ [g3,g4] ~ [f#3,f#4] ~ [a3,a4] ~ [b3,b4] ~ [bb3,bb4] ~ [a3,a4] ~ [g3,g4] ~]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.35},{\"mini\":\"<~ ~ ~ ~ ~ ~ ~ ~ [b3@6 a3 b3 g3@6 d3@2] [e3 ~ g3 ~ b3 ~ d4 ~ c#4@2 ~@2 b3@4] [~@2 e4@3 ~ eb4 ~ d4@3 ~ d4@3 c#4] [c4 ~ b3 ~ bb3 ~ a3 ~ g3@3 [f#3,e3] eb3@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.6},{\"mini\":\"<~ ~ ~ ~ ~ ~ ~ ~ [b5@6 a5 b5 g5@6 d5@2] [e5 ~ g5 ~ b5 ~ d6 ~ c#6@2 ~@2 b5@4] [~@2 e6@3 ~ eb6 ~ d6@3 ~ d6@3 c#6] [c6 ~ b5 ~ bb5 ~ a5 ~ g5@3 [f#5,e5] eb5@4]>\",\"sound\":\"gm_lead_1_square\",\"gain\":0.28}],\"bpm\":115,\"bars\":12}"
    }
  },
  "cand_b4_ex_aug_cascade": {
    "id": "cand_b4_ex_aug_cascade",
    "his_prior_words": "and the synth descending quickly that appears.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "device",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), bars 13-15 + 37-39 (FX-rain synth; square-accent passage)",
    "why": "The fast descending synth he heard, transcribed exactly: an Eb-AUGMENTED triad (b-g-eb — over E minor that is the 5th, the b3 and the raised 7th, a built-in rub) falling five octaves in 48th-notes at beat 3, once per bar for three bars running, then gone. Source timbre is the FX-rain synth; harp carries the gesture here. It appears only during the high-accent passage, twice per song.",
    "question": "One cascade per bar for exactly 3 bars, then absent — is the disappearing repetition the appeal, or would once per section seam be enough?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@8 [b7 g7 eb7 b6 g6 eb6 b5 g5 eb5 b4 g4 eb4 b3 g3 eb3]@8] [~@8 [b7 g7 eb7 b6 g6 eb6 b5 g5 eb5 b4 g4 eb4 b3 g3 eb3]@8] [~@8 [b7 g7 eb7 b6 g6 eb6 b5 g5 eb5 b4 g4 eb4 b3 g3 eb3]@8] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"e2 ~ g2 ~ f#2 ~ a2 ~ b2 ~ bb2 ~ a2 ~ g2 ~\",\"sound\":\"piano\",\"gain\":0.4},{\"mini\":\"<[md_kick ~ vc_riq ~ [md_snare,md_clap] ~ vc_riq ~ vc_riq ~ [md_kick,vc_riq] ~ [md_snare,md_clap] md_kick [md_kick,vc_riq] ~] [md_kick ~ vc_riq ~ [md_snare,md_clap] ~ vc_riq ~ vc_riq ~ [md_kick,vc_riq] ~ [md_snare,md_clap] md_kick [md_kick,vc_riq] ~] [md_kick ~ vc_riq ~ [md_snare,md_clap] ~ vc_riq ~ vc_riq ~ [md_kick,vc_riq] ~ [md_snare,md_clap] md_kick [md_kick,vc_riq] ~] [md_kick ~ vc_riq ~ [md_snare,md_clap] ~ vc_riq ~ vc_riq ~ [md_kick,vc_riq] ~ [md_snare,md_clap] md_kick [md_kick,vc_riq] ~]>\",\"sound\":\"md_kick\",\"gain\":0.7}],\"bpm\":115,\"bars\":4}"
    }
  },
  "cand_b4_ex_dance_perc_arc": {
    "id": "cand_b4_ex_dance_perc_arc",
    "his_prior_words": "the percussion and how it changes.",
    "vibes": [
      "battle/boss"
    ],
    "batch": 4,
    "pairs_with": [],
    "confidence": "high",
    "key_tonic": "E",
    "key_mode": "minor",
    "type": "rhythm",
    "source": "vgmusic.com/music/console/nintendo/switch/SM-MiniBoss.mid — \"Mini Boss - Danger On the Dance Floor\" (E minor, 115bpm, 50 bars; downloaded for analysis, not committed), drum arc bars 1-24 (played twice), compressed to 8",
    "why": "The percussion and how it changes, measured over the full song: a 24-bar arc played twice — doubled-kick dance stomp with pushed kicks at the bar tail (the \"dance floor\"), snare = CLAP+SLAP LAYERED on every backbeat (two samples, one hit), tambourine 8ths throughout, a tom run every 4th bar; then the kick thins to beat-1-only half-time under a crash with a finger-cymbal answer; then a snare-roll build bar stomps it back in. Card: 3 groove bars, tom-fill bar, 2 half-time bars, build bar, return+crash.",
    "scope": "boss/dance/energetic — the doubled kick and pushed bar-tails ARE the dance floor; the half-time drop is the danger arc",
    "question": "The backbeat here is md_snare+md_clap stacked on the same onsets (the source layers slap+clap as one hit) — should layered drum hits become a standard engine trick?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":115,\"bars\":8,\"onsets\":[\"0/16\",\"0/16\",\"2/16\",\"4/16\",\"4/16\",\"4/16\",\"6/16\",\"8/16\",\"10/16\",\"10/16\",\"12/16\",\"12/16\",\"12/16\",\"13/16\",\"14/16\",\"14/16\",\"16/16\",\"16/16\",\"18/16\",\"20/16\",\"20/16\",\"20/16\",\"22/16\",\"24/16\",\"26/16\",\"26/16\",\"28/16\",\"28/16\",\"28/16\",\"29/16\",\"30/16\",\"30/16\",\"32/16\",\"32/16\",\"34/16\",\"36/16\",\"36/16\",\"36/16\",\"38/16\",\"40/16\",\"42/16\",\"42/16\",\"44/16\",\"44/16\",\"44/16\",\"45/16\",\"46/16\",\"46/16\",\"48/16\",\"48/16\",\"50/16\",\"52/16\",\"52/16\",\"52/16\",\"54/16\",\"56/16\",\"58/16\",\"58/16\",\"58/16\",\"59/16\",\"60/16\",\"60/16\",\"60/16\",\"61/16\",\"62/16\",\"62/16\",\"64/16\",\"64/16\",\"64/16\",\"66/16\",\"68/16\",\"68/16\",\"68/16\",\"70/16\",\"72/16\",\"74/16\",\"76/16\",\"76/16\",\"76/16\",\"78/16\",\"78/16\",\"80/16\",\"80/16\",\"82/16\",\"84/16\",\"84/16\",\"84/16\",\"86/16\",\"88/16\",\"90/16\",\"92/16\",\"92/16\",\"92/16\",\"94/16\",\"94/16\",\"96/16\",\"96/16\",\"96/16\",\"98/16\",\"98/16\",\"98/16\",\"100/16\",\"100/16\",\"100/16\",\"102/16\",\"102/16\",\"102/16\",\"104/16\",\"104/16\",\"104/16\",\"105/16\",\"105/16\",\"106/16\",\"108/16\",\"108/16\",\"108/16\",\"110/16\",\"110/16\",\"112/16\",\"112/16\",\"112/16\",\"114/16\",\"116/16\",\"116/16\",\"116/16\",\"118/16\",\"120/16\",\"122/16\",\"122/16\",\"124/16\",\"124/16\",\"124/16\",\"125/16\",\"126/16\",\"126/16\"],\"sounds\":[\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_kick\",\"md_kick\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_kick\",\"md_kick\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_kick\",\"md_kick\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"vc_tom_hi\",\"vc_tom_hi\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_tom_lo\",\"vc_riq\",\"vc_tom_lo\",\"md_kick\",\"md_ohat\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_zill\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_zill\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"md_ohat\",\"md_kick\",\"vc_riq\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_riq\",\"md_snare\",\"md_clap\",\"vc_riq\",\"md_kick\",\"md_kick\",\"vc_riq\"]}"
    }
  },
  "cand_b4_q_sadshop_strings": {
    "id": "cand_b4_q_sadshop_strings",
    "type": "device",
    "source": "vs_sad_shop on audition/songs.html (judged, byte-frozen) — the gm_string_ensemble_1 layer (counterline + descant), bars 4-7 transcribed verbatim from the mix; HQ tier renders this voice with VSCO-2-CE string-section samples through sfizz",
    "why": "The strings he praised, isolated and portable: even bars HOLD a whole-bar low third with an octave top (g3+bb3+g4, whisper gain ~0.2); odd bars CLIMB beats 2-3-4 in quarter-note dyads, each climb landing on an OCTAVE (g#3+c#4 -> bb3+f4 -> g#3+g#4, alternating with the Db-side climb to c#4+c#5). Hold-then-climb, always under the lead. The flow he heard is the alternation: a bar of stillness, a bar of walk.",
    "his_prior_words": "with vs_sad_shop, the strings are really good like the vst is really good. are we still using that? / i really liked ... especially the strings in sad shop and how they flowed ... i want us to replicate those layers but across a higher range of layers so the songs are more diverse across genres",
    "vibes": [
      "somber/aftermath",
      "nostalgic/rest",
      "calm/shop"
    ],
    "question": "Producer experiment: tick this onto cards from OTHER genres (a groove card, a happy-menu card, a boss card) — does the hold-then-climb survive outside sad/calm? Wherever it does, this becomes the portable string-layer pattern for the \"replicate across genres\" goal.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[g3,bb3,g4]@16] [~@4 [g#3,c#4]@4 [bb3,f4]@4 [g#3,g#4]@4] [[g3,bb3,g4]@16] [~@4 [c#4,f#4]@4 [eb4,bb4]@4 [c#4,c#5]@4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22}],\"bpm\":65,\"bars\":4}"
    },
    "key_tonic": "C",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_tp_backbeat_chords": {
    "id": "cand_b4_tp_backbeat_chords",
    "type": "accomp_pattern",
    "source": "rhythm-template cluster: 116 vgmusic-full files / 2,071 bars (Demon’s Crest Level_1_2 et al.), spread evenly across types — a universal, not a genre marker",
    "why": "TEMPLATE — the harmony IS the snare: a full chord stab on beats 2 and 4 and NOTHING else. Fill policy measured: chords 44%, one repeated pitch 35%; chord-tone rate 0.80; voice mid register. This answers the suite’s standing missing-backbeat bug from the HARMONY side — no drum-pool change, zero blast radius. Realized here as piano stabs over a I-vi-IV-V loop with held bass roots.",
    "his_prior_words": "",
    "vibes": [
      "happy/menu",
      "nostalgic/rest",
      "calm/shop"
    ],
    "question": "This is a RHYTHM TEMPLATE: the rhythm+policy is the object, the pitches are one realization. If you label it good, the engine fills it per-song (so no two songs share pitches) — is that the right kind of variety for this figure?",
    "template": {
      "rhythm": [
        "1/4",
        "3/4"
      ],
      "fill_policy": "full chord stab mid-register (or one repeated pitch: the 5th or root)",
      "prevalence": "116 files, type-flat"
    },
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 [e3,g3,c4]@4 ~@4 [e3,g3,c4]@4] [~@4 [e3,a3,c4]@4 ~@4 [e3,a3,c4]@4] [~@4 [f3,a3,c4]@4 ~@4 [f3,a3,c4]@4] [~@4 [d3,g3,b3]@4 ~@4 [d3,g3,b3]@4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[c2@16] [a2@16] [f2@16] [g2@16]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.45}],\"bpm\":100,\"bars\":4}"
    },
    "key_tonic": "C",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_tp_pickup_run": {
    "id": "cand_b4_tp_pickup_run",
    "type": "accomp_pattern",
    "source": "rhythm-template cluster: 130 vgmusic-full files — anchor the downbeat, REST the middle, 3-note run at and-of-3 / 4 / and-of-4 walking INTO the next bar’s chord (ascending 44%, descending 14%)",
    "why": "TEMPLATE — D101’s walk-into-the-change as a whole rhythm class: hold the bar’s root, silence through the middle, then three pickup notes that only exist to reach the NEXT chord. Chord-tone rate is 0.72 BECAUSE the run serves the destination, not the current chord — the corpus’s connective tissue in its most common costume. Realized over I-vi-IV-V, each run landing on the next root or its leading tone.",
    "his_prior_words": "",
    "vibes": [
      "nostalgic/rest",
      "calm/shop",
      "happy/menu"
    ],
    "question": "This is a RHYTHM TEMPLATE: the rhythm+policy is the object, the pitches are one realization. If you label it good, the engine fills it per-song (so no two songs share pitches) — is that the right kind of variety for this figure?",
    "template": {
      "rhythm": [
        "0 (held ~5/8)",
        "5/8",
        "3/4",
        "7/8"
      ],
      "fill_policy": "downbeat anchor; 3-note run targeting the next bar’s chord (ascending preferred)",
      "prevalence": "130 files"
    },
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[c3@10 f3@2 g3@2 g#3@2] [a3@10 c3@2 d3@2 e3@2] [f3@10 d3@2 e3@2 f#3@2] [g3@10 g3@2 a3@2 b3@2]>\",\"sound\":\"piano\",\"gain\":0.55}],\"bpm\":100,\"bars\":4}"
    },
    "key_tonic": "C",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_tp_gallop_bass": {
    "id": "cand_b4_tp_gallop_bass",
    "type": "accomp_pattern",
    "source": "rhythm-template cluster: 86 vgmusic-full files — 8th + two 16ths per beat; fill: one-pitch 38%, octave-alt 27% (R low then two pops an octave up), root-fifth 8%; chord-tone 0.96",
    "why": "TEMPLATE — the gallop cell x4: dun-dada on every beat, almost never leaving chord tones (0.96, the tightest cluster measured). Realized in the octave-alt fill: root on the 8th, two octave-up pops. The SM-MiniBoss dominant gallop (cand_b4_ex_lh_dominant_gallop) is this template parked on a pedal — corpus says it is a general driving-bass class, boss/battle-leaning.",
    "his_prior_words": "",
    "vibes": [
      "battle/boss",
      "excited/training"
    ],
    "scope": "driving/energetic songs — a gallop under a calm lead is a gear mismatch",
    "question": "This is a RHYTHM TEMPLATE: the rhythm+policy is the object, the pitches are one realization. If you label it good, the engine fills it per-song (so no two songs share pitches) — is that the right kind of variety for this figure?",
    "template": {
      "rhythm": [
        "0",
        "1/8",
        "3/16",
        "1/4",
        "3/8",
        "7/16",
        "1/2",
        "5/8",
        "11/16",
        "3/4",
        "7/8",
        "15/16"
      ],
      "fill_policy": "one pitch or R + octave pops per beat, strictly chord tones",
      "prevalence": "86 files, boss/battle-leaning"
    },
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[e2@2 e3 e3 e2@2 e3 e3 e2@2 e3 e3 e2@2 e3 e3] [c2@2 c3 c3 c2@2 c3 c3 c2@2 c3 c3 c2@2 c3 c3]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55}],\"bpm\":120,\"bars\":2}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_ex_lh_dominant_gallop"
    ],
    "confidence": "high"
  },
  "cand_b4_tp_offbeat_stabs": {
    "id": "cand_b4_tp_offbeat_stabs",
    "type": "accomp_pattern",
    "source": "rhythm-template cluster: 132 vgmusic-full files / 3,531 bars — every 8th offbeat, never a downbeat; dance 2.8x over-represented; frozen-triad fill dominates (47%); chord-tone 0.87",
    "why": "TEMPLATE — offbeat 8th stabs, the figure the engine has exactly ONE ratified example of (the r29 pool-of-one: fnd_offbeat_chords on 30 of 39 songs). The corpus’s dominant fill FREEZES one triad and lets the bass move under it, re-coloring the same three notes each bar. Realized: a frozen Am stab over an A-F-C-E bass descent.",
    "his_prior_words": "",
    "vibes": [
      "happy/menu",
      "excited/training"
    ],
    "scope": "bright/dance/casual only — the r19 law stands: offbeat comping reads less serious, so dread/serious lanes exclude it",
    "question": "This is a RHYTHM TEMPLATE: the rhythm+policy is the object, the pitches are one realization. If you label it good, the engine fills it per-song (so no two songs share pitches) — is that the right kind of variety for this figure?",
    "template": {
      "rhythm": [
        "1/8",
        "3/8",
        "5/8",
        "7/8"
      ],
      "fill_policy": "one FROZEN triad on every offbeat; the bass carries the harmony motion",
      "prevalence": "132 files, dance 2.8x"
    },
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"~ [e3,a3,c4] ~ [e3,a3,c4] ~ [e3,a3,c4] ~ [e3,a3,c4]\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[a2@16] [f2@16] [c2@16] [e2@16]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5}],\"bpm\":110,\"bars\":4}"
    },
    "key_tonic": "A",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_gr_dk64_galleon_call_octaves": {
    "id": "cand_b4_gr_dk64_galleon_call_octaves",
    "type": "device",
    "source": "audios/vgmusic-full/n64/dk64gloomygalleoncaves-v1_1.mid (DK64 — Gloomy Galleon caves) bars 0-19, double-statements halved; pizz theme and English-horn line lifted +12 (source [c2,c3] dips to b1, below the floor), theme restatement kept +24 above the low copy as in the source",
    "why": "A theme that accretes octaves across a whole page, in strict call-and-answer: spooky pizzicato states the 2-bar theme in self-octave dyads, ALONE; marimba answers with a rising-thirds wave, ALONE (they alternate bars, never overlapping); then a harp 8th-ostinato motor starts and the horn takes the theme at the bottom; finally the theme returns TWO octaves above the low copy — the same line sounding in c3+c4 and c5+c6 at once — with the motor cut to a single strike, and the marimba answer closes alone. Measured: all 10 bars use the same 6 pitch classes (c d eb f g b); the build never adds one.",
    "his_prior_words": "",
    "vibes": [
      "mysterious/cave",
      "haunted/night"
    ],
    "scope": "cave/night/mystery — the alternation (layers taking turns, not stacking) is what keeps it eerie; a dense stack would read adventure instead",
    "question": "Corpus rule this card tests: a late-entering layer almost never brings new pitch classes (98.9% of octave entries, 83.9% of even the free lines). Would you take that as an engine law — 'a layer entering after bar 4 only uses pitch classes already sounding'?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[c3,c4] ~@3 [b2,b3] ~@2 [d3,d4] [c3,c4] ~@5 [d3,d4] ~@1] [[d#3,d#4] ~@3 [d3,d4] ~@2 [f3,f4] [d#3,d#4] ~@3 [c3,c4] ~@3] ~ ~ ~ ~ [[c3,c4] ~@3 [b2,b3] ~@2 [d3,d4] [c3,c4] ~@5 [d3,d4] ~@1] [[d#3,d#4] ~@3 [d3,d4] ~@2 [f3,f4] [d#3,d#4] ~@3 [c3,c4] ~@3] ~ ~>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.55},{\"mini\":\"<~ ~ [~@2 [c3,d#3]@2 [d#3,g3]@2 [g3,c4]@2 [c4,d#4]@2 [g3,c4]@2 [d#3,g3]@2 [c3,d#3]@2] [~@2 [c3,d#3]@2 [d#3,g3]@2 [g3,c4]@2 [c4,d#4]@2 [g3,c4]@2 [d#3,g3]@2 [c3,d#3]@2] ~ ~ ~ ~ [~@2 [c3,d#3]@2 [d#3,g3]@2 [g3,c4]@2 [c4,d#4]@2 [g3,c4]@2 [d#3,g3]@2 [c3,d#3]@2] [~@2 [c3,d#3]@2 [d#3,g3]@2 [g3,c4]@2 [c4,d#4]@2 [g3,c4]@2 [d#3,g3]@2 [c3,d#3]@2]>\",\"sound\":\"gm_marimba\",\"gain\":0.45},{\"mini\":\"<~ ~ ~ ~ [c4@2 d4@2 d#4@2 g4@2 c4@2 d4@2 d#4@2 g4@2] [c4@2 d4@2 d#4@2 g4@2 c4@2 d4@2 d#4@2 g4@2] [c4@2 ~@14] ~ ~ ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.4},{\"mini\":\"<~ ~ ~ ~ [c3@3 ~@1 b2@2 ~@1 d3 c3@5 ~@1 d3 ~@1] [d#3@2 ~@1 d3 d#3@11 ~@1] ~ ~ ~ ~>\",\"sound\":\"gm_french_horn\",\"gain\":0.42},{\"mini\":\"<~ ~ ~ ~ ~ ~ [[c5,c6] ~@3 [b4,b5] ~@2 [d5,d6] [c5,c6] ~@5 [d5,d6] ~@1] [[d#5,d#6] ~@3 [d5,d6] ~@2 [f5,f6] [d#5,d#6] ~@3 [c5,c6] ~@3] ~ ~>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.45}],\"bpm\":94,\"bars\":10}"
    },
    "key_tonic": "C",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_gr_bkmansion_trill_build": {
    "id": "cand_b4_gr_bkmansion_trill_build",
    "type": "device",
    "source": "audios/vgmusic-full/n64/w7BKMansion(Boss).mid bars 0-19 (8-bar phrases halved to 4). Source has a c2/g1 octave-jump bass under everything — below the floor and dropped here (the cello theme at c3/g2 carries the low end). The +12 upper voice doubles the theme (source has TWO unison copies of it; one kept) and then lifts to the bar-18 melody",
    "why": "A haunted-mansion boss that grows by octave copies of a BASS-register theme — the inverse of doubling a melody down. 2-bar intro: a g5-f#5 semitone tremolo over a bare g pedal pulse, ending in a chromatic run-up — the shiver before the section starts. Then the groove: 8th-note Cm chord pulses planing Cm/Ab/Cm/F# (tritone lurch), under them the theme — a c3 pedal figure answered by chromatic climbs. At bar 7 the theme gains a +12 copy while the chord pulse hands off to organ and the keys switch from pulses to rolling 16th arps over the same chords — the texture doubles in speed with zero new harmony. Finale: the melody states the theme's shape at the top with a g5-c5 16th pedal ringing above. All growth is register and rate; the harmony never thickens.",
    "his_prior_words": "",
    "vibes": [
      "haunted/manor",
      "boss/citadel"
    ],
    "scope": "manor/citadel boss only — the tremolo intro and tritone plane are gothic devices; in a bright lane the same build would need different chords",
    "question": "",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1] [c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [c4 d#4 g#4 c5 d#5 c5 g#4 d#4 c4 d#4 g#4 c5 d#5 c5 g#4 d#4] [c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4 a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4] [g5 c5 g5 c5 g5 c5 g5 c5 g5 c5 g5 c5 g5 c5 g5 c5] [f#5 c5 f#5 c5 f#5 c5 f#5 c5 g5 c5 g5 c5 g5 c5 g5 c5]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.48},{\"mini\":\"<[g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2] [g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2] ~ ~ ~ ~ [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1] [[c4,d#4,g4]@16] [[c4,d#4,f#4]@8 [c4,d#4,g4]@8]>\",\"sound\":\"gm_church_organ\",\"gain\":0.35},{\"mini\":\"<~ ~ [c3@3 ~@1 g2@3 ~@1 c3@3 ~@3 g2@2] [g#2@2 a#2@2 b2@3 ~@1 b2@2 c#3@2 d#3@3 ~@1] [c3@3 ~@1 g2@3 ~@1 c3@3 ~@3 g2@2] [f#2@2 g#2@2 a#2@2 b2@2 c#3@2 d#3@2 e3@2 f#3@2] [c3@3 ~@1 g2@3 ~@1 c3@3 ~@3 g2@2] [g#2@2 a#2@2 b2@3 ~@1 b2@2 c#3@2 d#3@3 ~@1] [c3@3 ~@1 g2@3 ~@1 c3@3 ~@3 g2@2] [f#2@2 g#2@2 a#2@2 b2@2 c#3@2 d#3@2 e3@2 f#3@2] [c4@3 ~@3 d4@2 d#4@3 ~@1 g4@3 ~@1] [f#4@3 ~@1 f#4@3 ~@1 g4@3 ~@5]>\",\"sound\":\"gm_cello\",\"gain\":0.55},{\"mini\":\"<~ ~ ~ ~ ~ ~ [c4@3 ~@1 g3@3 ~@1 c4@3 ~@3 g3@2] [g#3@2 a#3@2 b3@3 ~@1 b3@2 c#4@2 d#4@3 ~@1] [c4@3 ~@1 g3@3 ~@1 c4@3 ~@3 g3@2] [f#3@2 g#3@2 a#3@2 b3@2 c#4@2 d#4@2 e4@2 f#4@2] [c5@3 ~@3 d5@2 d#5@3 ~@1 g5@3 ~@1] [f#5@3 ~@1 f#5@3 ~@1 g5@3 ~@5]>\",\"sound\":\"gm_viola\",\"gain\":0.4}],\"bpm\":260,\"bars\":12}"
    },
    "key_tonic": "C",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [],
    "confidence": "medium"
  },
  "cand_b4_gr_rosa_bed_then_halo": {
    "id": "cand_b4_gr_rosa_bed_then_halo",
    "type": "device",
    "source": "audios/vgmusic-full/gba/FFIV-Rosastheme.mid bars 0-3 (A phrase, thin), 8-11 (A phrase + full bed), 16-19 (B phrase + octave halo) — the source states each phrase over 8 bars; first halves used",
    "why": "The calm version of adding octaves: a theme statement gains one stratum per pass. Pass 1: melody + a sparse rising harp figure. Pass 2 (same phrase): sustained inner strings + bass slip in AT THE HALF-BAR, under the melody's held note — not at the seam. Pass 3 (the B phrase): the whole melody doubled EXACTLY +12 by a second voice, the harp opening into full up-down 16th waves. Measured in the source: the +12 double matches the lead 100% for its entire life and enters precisely when the new phrase begins — the halo marks 'this is the arrival' without one dynamics change. Progression A / Dm / G / Em (major tonic in a minor field).",
    "his_prior_words": "",
    "vibes": [
      "calm/nostalgic",
      "somber/theme"
    ],
    "question": "The bed enters at the HALF-bar under a held melody note — mid-phrase, off the section grid (half the corpus' octave entries are off the 4-bar seam too). Natural, or does your ear want entries only at section starts?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 b4@4 a4@4 e4@4] [f4@2 e5@2 e5@12] [~@4 d5@2 e5@2 d5@2 c5@2 b4@2 a4@2] [g4@2 e4@2 d5@12] [a4@8 b4@3 a4@3 e4@2] [f4@2 e5@2 e5@12] [~@4 d5@2 e5@2 d5@2 c5@2 b4@2 a4@2] [g4@2 e4@2 d5@12] [~@8 a4@3 b4@3 c5@2] [e5@6 g4@2 a4@4 e5@4] [d5@10 c5@2 b4@2 c5@2] [d5@6 f#4@2 g4@4 d5@4]>\",\"sound\":\"gm_violin\",\"gain\":0.55},{\"mini\":\"<~ ~ ~ ~ ~ ~ ~ ~ [~@8 a5@3 b5@3 c6@2] [e6@6 g5@2 a5@4 e6@4] [d6@10 c6@2 b5@2 c6@2] [d6@6 f#5@2 g5@4 d6@4]>\",\"sound\":\"gm_flute\",\"gain\":0.4},{\"mini\":\"<~ [d3@2 a3@2 d4@2 f4@2 a4@4 ~@4] [g2@2 g3@2 d4@2 g4@2 b4@2 ~@6] [e3@2 b3@2 e4@2 g4@2 b4@2 ~@6] [a2@2 a3@2 c#4@2 e4@2 a4@2 ~@6] [d3@2 a3@2 d4@2 f4@2 a4@4 ~@4] [g2@2 g3@2 d4@2 g4@2 b4@2 ~@6] [e3@2 b3@2 e4@2 g4@2 b4@2 ~@6] [a2@2 a3@2 c4@2 a4@2 a2 [e3,a3] e3 [a3,c4] a3 [c4,e4] [a4,c5] [e5,a5,c6]] [f2 c3 f3 a3 c4 f4 a4 c5 f5 c5 a4 f4 c4 a3 f3 c3] [b2 d3 g3 b3 c4 d4 g4 b4 g5 c5 b4 g4 d4 b3 g3 d3] [e2 b2 e3 g3 b3 e4 g4 b4 e5 b4 g4 e4 b3 g3 e3 b2]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.45},{\"mini\":\"<~ ~ ~ ~ [~@8 a2@8] [d3@16] [g2@16] [e3@16] [~@8 a2@4 g2@4] [f2@16] ~ [e2@16]>\",\"sound\":\"gm_cello\",\"gain\":0.5},{\"mini\":\"<~ ~ ~ ~ [~@8 c#4@8] [c4@8 f4@8] [b3@8 f4@8] [b3@16] [~@8 c4@8] [a3@16] [b3@16] [b3@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.3}],\"bpm\":80,\"bars\":12}"
    },
    "key_tonic": "A",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b4_in_dreamtv_castle_stamp": {
    "id": "cand_b4_in_dreamtv_castle_stamp",
    "type": "device",
    "source": "audios/vgmusic-corpus/snes/DreamTVCastle.mid bars 0-3 (the bar-0 stamp never recurs; bars 1-3 are the groove it sets up). Bass g1/b1 notes lifted +12",
    "why": "A chord-splash intro that is secretly a preview: bar 1 states the band's exact comp RHYTHM (two short stabs + a long hold) on the plain tonic triad — with a fifth held under it — before any harmony moves. Bars 2-4 then run the same rhythm as the actual progression (C / Em / C) with a walking-8ths bass. The intro teaches the groove's shape using zero of its harmony, so the progression's first move still lands fresh. Cheapest intro device found in the sweep: one bar, no new material to write.",
    "his_prior_words": "",
    "vibes": [
      "castle/fanfare",
      "happy/menu"
    ],
    "question": "",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[g4,c5] ~@2 [g4,c5] [c5,e5,g5]@8 ~@4] [[c4,e4] ~@2 [c4,e4] [e4,g4]@12] [[b3,e4] ~@2 [b3,e4] [e4,b4]@12] [[e4,g4] ~@2 [e4,g4] [c4,e4]@12]>\",\"sound\":\"gm_trumpet\",\"gain\":0.45},{\"mini\":\"<[c2 ~@2 c2 g2@12] [c2@2 c2@2 ~@2 g2@2 c2@3 c2 c2@2 d2@2] [e2@2 e2@2 ~@2 b2@2 e2@3 e2 e2@2 d2@2] [c2@2 c2@2 ~@2 g2@2 c2@3 c2 c2@2 d2@2]>\",\"sound\":\"gm_trombone\",\"gain\":0.5}],\"bpm\":114,\"bars\":4}"
    },
    "key_tonic": "C",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [],
    "confidence": "medium"
  },
  "cand_b4_pc_snow_jingle_fourfloor": {
    "id": "cand_b4_pc_snow_jingle_fourfloor",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/nes/Snow_Bros-lv41-49.mid, bars 12-13 (the 2-bar groove that runs bars 4-63), ch9, 140bpm.",
    "why": "The snow-type kit signature, measured: snow is the type where four-on-the-floor kick peaks (25.9% of 85 snow files vs 15.9% of other typed files) AND tambourine peaks (23.5% vs 10.8%) - jingle metal over a stomping floor. Here: kick+hat stamp all four beats, the tambourine answers on the 'e' 16th after EVERY beat, a pedal hat ticks the 'a' before each beat, and an agogo bell rings the backbeat 2+4 (a BELL as backbeat, not a snare - snow is also 41% snare-less). Bar 1 opens with an open-hat splash.",
    "his_prior_words": "",
    "vibes": [
      "snow/ice",
      "happy/festival",
      "excited/journey"
    ],
    "scope": "snow/ice only - the four_floor+tamb pairing is snow-enriched (1.6x and 2.2x other types)",
    "question": "I rendered the GM tambourine as vc_riq (honest transcription). Want vc_sleigh there instead for winter flavor - or both?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"0\",\"0\",\"1/16\",\"3/16\",\"1/4\",\"1/4\",\"1/4\",\"5/16\",\"7/16\",\"1/2\",\"1/2\",\"9/16\",\"11/16\",\"3/4\",\"3/4\",\"3/4\",\"13/16\",\"15/16\",\"1\",\"1\",\"17/16\",\"19/16\",\"5/4\",\"5/4\",\"5/4\",\"21/16\",\"23/16\",\"3/2\",\"3/2\",\"25/16\",\"27/16\",\"7/4\",\"7/4\",\"7/4\",\"29/16\"],\"sounds\":[\"md_kick\",\"md_hat\",\"md_ohat\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_agogo\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_agogo\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_agogo\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_riq\",\"md_hat\",\"md_kick\",\"md_hat\",\"vc_agogo\",\"vc_riq\"],\"bpm\":140,\"bars\":2}"
    },
    "pairs_with": [
      "cand_b3_pv_sleigh_clock",
      "cand_b3_sd_snowy_perc_elements"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_overworld_snare_tattoo": {
    "id": "cand_b4_pc_overworld_snare_tattoo",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/snes/Final_Fantasy_Mystic_Quest_-_Overworld_(MWS_v1.1).mid, bars 0-31 (every bar identical), ch9, 134bpm.",
    "why": "Overworld/field has a percussion identity NO other type has: a snare-only military tattoo with no kit around it. Measured: 21.5% of 130 overworld files run snare with NO kick and NO hats (other types: 8.2%), and roll-dense snare is overworld's biggest snare class (29%). This is the cleanest specimen: quarter-note snare taps, then beat 4 splits into an 8th-note triplet turn - a drumline cadence that walks. Rendered on the rope-tension military snare.",
    "his_prior_words": "",
    "vibes": [
      "overworld",
      "adventure/quest",
      "march"
    ],
    "scope": "overworld/field only (2.6x enrichment vs other types); also fits march",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/4\",\"1/2\",\"3/4\",\"5/6\",\"11/12\"],\"sounds\":[\"vc_snare_mil\",\"vc_snare_mil\",\"vc_snare_mil\",\"vc_snare_mil\",\"vc_snare_mil\",\"vc_snare_mil\"],\"bpm\":134,\"bars\":1}"
    },
    "pairs_with": [
      "cand_b3_sd_semap_role_inversion",
      "cand_b2_dr_mountain_trail"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_water_wood_ripple": {
    "id": "cand_b4_pc_water_wood_ripple",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/nes/M3Water.mid (SMB3 water), bars 2-25 (24 identical bars), ch9, 100bpm.",
    "why": "Water is the woodblock/claves/guiro type (17.6% of 68 water files vs 6% baseline - the highest of ALL types) and runs the fewest kits (41% have no kick). The SMB3 water bar is the minimal version: a soft shaker breathes on beats 1 and 3, a woodblock ticks every other 8th between - two voices, 8 onsets, rocking like water. No kick, no snare, no cymbal anywhere in the file.",
    "his_prior_words": "",
    "vibes": [
      "water/beach",
      "calm/underwater",
      "calm/nature"
    ],
    "scope": "water/sea only - wood-family color is a water signature (3x baseline)",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\"],\"sounds\":[\"vc_shaker_soft\",\"vc_woodblock\",\"vc_woodblock\",\"vc_woodblock\",\"vc_shaker_soft\",\"vc_woodblock\",\"vc_woodblock\",\"vc_woodblock\"],\"bpm\":100,\"bars\":1}"
    },
    "pairs_with": [
      "cand_b2_dr_dkc_water_congas"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_desert_kit_hand_stack": {
    "id": "cand_b4_pc_desert_kit_hand_stack",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/genesis/SprkstrDesert.mid, bars 8-11 (the 4-bar loop; kit+bongos+tamb co-run all 40 kit bars), ch9, 127bpm.",
    "why": "Direct evidence for 'drums can be layered and mixed too': desert is where kit+hand-percussion stacking PEAKS - 48.1% of desert kit files run hand percussion in the same bars (corpus-wide: 19.4%). This file runs THREE decks at once, all 40 kit bars: kick 1+3 / snare 2+4 (deck 1), bongos answering on the 8th-and-16th cluster after each kick (deck 2), tambourine pairs riding behind each snare (deck 3). Bar 4 is the turnaround: a conga roll climbs muted->high->low over the still-running stack (source roll is 32nds; thinned to the 16th grid).",
    "his_prior_words": "drums can be layered and mixed too",
    "vibes": [
      "desert",
      "adventure/caravan",
      "excited/market"
    ],
    "scope": "desert first (48.1% stack rate), then water (36.7%) / cave (28.7%) - NOT dance (8.3%) or victory (11.1%)",
    "question": "This is one SONG running three percussion decks. Should the engine treat kit / hand / jingle as three independently mixable layers with their own gains, the way melody layers already work?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/8\",\"3/16\",\"1/4\",\"1/4\",\"3/8\",\"3/8\",\"7/16\",\"1/2\",\"5/8\",\"11/16\",\"3/4\",\"3/4\",\"7/8\",\"7/8\",\"15/16\",\"1\",\"9/8\",\"19/16\",\"5/4\",\"5/4\",\"11/8\",\"11/8\",\"23/16\",\"3/2\",\"13/8\",\"27/16\",\"7/4\",\"7/4\",\"15/8\",\"15/8\",\"31/16\",\"2\",\"17/8\",\"35/16\",\"9/4\",\"9/4\",\"19/8\",\"19/8\",\"39/16\",\"5/2\",\"21/8\",\"43/16\",\"11/4\",\"11/4\",\"23/8\",\"23/8\",\"47/16\",\"3\",\"25/8\",\"51/16\",\"13/4\",\"13/4\",\"27/8\",\"27/8\",\"55/16\",\"7/2\",\"7/2\",\"57/16\",\"29/8\",\"29/8\",\"59/16\",\"59/16\",\"15/4\",\"15/4\",\"61/16\",\"31/8\",\"31/8\",\"63/16\"],\"sounds\":[\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_snare\",\"vc_bongo_hi\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_quinto\",\"vc_bongo_hi\",\"vc_quinto\",\"vc_bongo_hi\",\"md_snare\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_bongo_lo\",\"vc_conga\"],\"bpm\":127,\"bars\":4}"
    },
    "pairs_with": [
      "cand_b2_dr_yukon_camel_trot",
      "cand_cw_desert_groove"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_evo_hats_to_kit": {
    "id": "cand_b4_pc_evo_hats_to_kit",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/arcade/bgstage1.mid, bars 4-19 VERBATIM (16 bars), ch9, 146bpm.",
    "why": "EVOLUTION card - the kit is not the same for 16 bars, exactly as the source plays it: bars 1-3 closed-hat 16th carpet alone; bar 4 the hat DRAGS an 8th-triplet fill into the seam; bars 5-6 kick joins on all four beats + a single clap on the 'a' of 4; bar 7 kick only; bar 8 everything DROPS to the bare drag fill (a breath bar); bars 9-16 the full kit lands - snare on 2, the 16th-after-and-of-2, and 4, with an open-hat accent every other bar. Three staged entries + one written breath. Corpus context: 70.2% of songs (>=3 windows) change their kit at least once; hat->full-kit entries like this were detected in 632 songs.",
    "his_prior_words": "percussion is different for every song - analyze how it changes",
    "vibes": [
      "stage",
      "battle/boss",
      "excited/training"
    ],
    "scope": "stage/battle build-ins; the staged-entry SHAPE generalizes to any energetic lane",
    "question": "Should fresh songs get this staged drum entry (hats -> +kick -> breath -> full kit) instead of the kit starting complete? Corpus says staged entry, and you flagged the breakdown firing too often - this is the opposite device: assembly.",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\",\"3/8\",\"7/16\",\"1/2\",\"9/16\",\"5/8\",\"11/16\",\"3/4\",\"13/16\",\"7/8\",\"15/16\",\"1\",\"17/16\",\"9/8\",\"19/16\",\"5/4\",\"21/16\",\"11/8\",\"23/16\",\"3/2\",\"25/16\",\"13/8\",\"27/16\",\"7/4\",\"29/16\",\"15/8\",\"31/16\",\"2\",\"33/16\",\"17/8\",\"35/16\",\"9/4\",\"37/16\",\"19/8\",\"39/16\",\"5/2\",\"41/16\",\"21/8\",\"43/16\",\"11/4\",\"45/16\",\"23/8\",\"47/16\",\"3\",\"49/16\",\"25/8\",\"51/16\",\"13/4\",\"53/16\",\"27/8\",\"55/16\",\"7/2\",\"57/16\",\"29/8\",\"59/16\",\"15/4\",\"91/24\",\"23/6\",\"31/8\",\"47/12\",\"95/24\",\"4\",\"4\",\"65/16\",\"33/8\",\"67/16\",\"17/4\",\"17/4\",\"69/16\",\"35/8\",\"71/16\",\"9/2\",\"9/2\",\"73/16\",\"37/8\",\"75/16\",\"19/4\",\"19/4\",\"77/16\",\"39/8\",\"39/8\",\"79/16\",\"5\",\"5\",\"81/16\",\"41/8\",\"83/16\",\"21/4\",\"21/4\",\"85/16\",\"43/8\",\"87/16\",\"11/2\",\"11/2\",\"89/16\",\"45/8\",\"91/16\",\"23/4\",\"23/4\",\"93/16\",\"47/8\",\"47/8\",\"95/16\",\"6\",\"6\",\"97/16\",\"49/8\",\"99/16\",\"25/4\",\"25/4\",\"101/16\",\"51/8\",\"103/16\",\"13/2\",\"13/2\",\"105/16\",\"53/8\",\"107/16\",\"27/4\",\"27/4\",\"109/16\",\"55/8\",\"111/16\",\"31/4\",\"187/24\",\"47/6\",\"63/8\",\"95/12\",\"191/24\",\"8\",\"8\",\"129/16\",\"65/8\",\"131/16\",\"33/4\",\"33/4\",\"33/4\",\"133/16\",\"67/8\",\"135/16\",\"135/16\",\"17/2\",\"17/2\",\"137/16\",\"69/8\",\"139/16\",\"35/4\",\"35/4\",\"35/4\",\"141/16\",\"71/8\",\"143/16\",\"9\",\"9\",\"145/16\",\"73/8\",\"147/16\",\"37/4\",\"37/4\",\"37/4\",\"149/16\",\"75/8\",\"151/16\",\"151/16\",\"19/2\",\"19/2\",\"153/16\",\"77/8\",\"155/16\",\"39/4\",\"39/4\",\"39/4\",\"157/16\",\"79/8\",\"79/8\",\"159/16\",\"10\",\"10\",\"161/16\",\"81/8\",\"163/16\",\"41/4\",\"41/4\",\"41/4\",\"165/16\",\"83/8\",\"167/16\",\"167/16\",\"21/2\",\"21/2\",\"169/16\",\"85/8\",\"171/16\",\"43/4\",\"43/4\",\"43/4\",\"173/16\",\"87/8\",\"87/8\",\"175/16\",\"11\",\"11\",\"177/16\",\"89/8\",\"179/16\",\"45/4\",\"45/4\",\"45/4\",\"181/16\",\"91/8\",\"183/16\",\"183/16\",\"23/2\",\"23/2\",\"185/16\",\"185/16\",\"93/8\",\"187/16\",\"47/4\",\"47/4\",\"47/4\",\"189/16\",\"95/8\",\"191/16\",\"12\",\"12\",\"193/16\",\"97/8\",\"195/16\",\"49/4\",\"49/4\",\"49/4\",\"197/16\",\"99/8\",\"199/16\",\"199/16\",\"25/2\",\"25/2\",\"201/16\",\"101/8\",\"203/16\",\"51/4\",\"51/4\",\"51/4\",\"205/16\",\"103/8\",\"207/16\",\"13\",\"13\",\"209/16\",\"105/8\",\"211/16\",\"53/4\",\"53/4\",\"53/4\",\"213/16\",\"107/8\",\"215/16\",\"215/16\",\"27/2\",\"27/2\",\"217/16\",\"109/8\",\"219/16\",\"55/4\",\"55/4\",\"55/4\",\"221/16\",\"111/8\",\"111/8\",\"223/16\",\"14\",\"14\",\"225/16\",\"113/8\",\"227/16\",\"57/4\",\"57/4\",\"57/4\",\"229/16\",\"115/8\",\"231/16\",\"231/16\",\"29/2\",\"29/2\",\"233/16\",\"117/8\",\"235/16\",\"59/4\",\"59/4\",\"59/4\",\"237/16\",\"119/8\",\"119/8\",\"239/16\",\"15\",\"15\",\"241/16\",\"121/8\",\"243/16\",\"61/4\",\"61/4\",\"61/4\",\"245/16\",\"123/8\",\"247/16\",\"247/16\",\"31/2\",\"31/2\",\"249/16\",\"249/16\",\"125/8\",\"251/16\",\"63/4\",\"63/4\",\"63/4\",\"253/16\",\"127/8\",\"255/16\"],\"sounds\":[\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_clap\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_clap\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_ohat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_ohat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_ohat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_ohat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\"],\"bpm\":146,\"bars\":16}"
    },
    "pairs_with": [
      "cand_un_indie_backbeat"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_evo_ride_strip": {
    "id": "cand_b4_pc_evo_ride_strip",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/gameboy/PKMN_-_TrainerBattleRemix.mid, bars 40-55 VERBATIM (16 bars), ch9, 175bpm.",
    "why": "EVOLUTION card - subtraction as a section change, exactly as the source: bars 1-8 a full rock beat (four-floor kick, backbeat snare, 8th hats); bar 9 the hats VANISH and a ride takes bare quarters while the beat goes HALF-TIME (snare moves to beat 3, kick syncopates to the and-of-2); bar 12 a kick-run fill; bars 13-16 even the ride is gone - naked kick and snare, still half-time. Two subtractive strips in 16 bars. Corpus: hat->ride swaps detected 342 times, and 9,435 window transitions DROP density (vs 12,463 that raise it) - real songs strip as often as they build. NOTE: no ride cymbal exists in the sample pack; the ride is rendered as vc_zill (finger cymbal) - a stand-in.",
    "his_prior_words": "percussion is different for every song - analyze how it changes",
    "vibes": [
      "battle/boss",
      "chase/speed",
      "tense/assault"
    ],
    "scope": "battle only (7 of the 8 cleanest ride-swap exemplars found were battle files)",
    "question": "The pack has no ride cymbal (quarters on vc_zill here). Worth adding a real ride sample? It is the standard second-section cymbal in 20% of corpus files.",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"0\",\"1/8\",\"1/4\",\"1/4\",\"1/4\",\"3/8\",\"1/2\",\"1/2\",\"5/8\",\"3/4\",\"3/4\",\"3/4\",\"7/8\",\"1\",\"1\",\"9/8\",\"5/4\",\"5/4\",\"5/4\",\"11/8\",\"3/2\",\"3/2\",\"13/8\",\"7/4\",\"7/4\",\"7/4\",\"15/8\",\"2\",\"2\",\"17/8\",\"9/4\",\"9/4\",\"9/4\",\"19/8\",\"5/2\",\"5/2\",\"21/8\",\"11/4\",\"11/4\",\"11/4\",\"23/8\",\"3\",\"3\",\"25/8\",\"13/4\",\"13/4\",\"13/4\",\"27/8\",\"7/2\",\"7/2\",\"29/8\",\"15/4\",\"15/4\",\"15/4\",\"31/8\",\"4\",\"4\",\"33/8\",\"17/4\",\"17/4\",\"17/4\",\"35/8\",\"9/2\",\"9/2\",\"37/8\",\"19/4\",\"19/4\",\"19/4\",\"39/8\",\"5\",\"5\",\"41/8\",\"21/4\",\"21/4\",\"21/4\",\"43/8\",\"11/2\",\"11/2\",\"45/8\",\"23/4\",\"23/4\",\"23/4\",\"47/8\",\"6\",\"6\",\"49/8\",\"25/4\",\"25/4\",\"25/4\",\"51/8\",\"13/2\",\"13/2\",\"53/8\",\"27/4\",\"27/4\",\"27/4\",\"55/8\",\"7\",\"7\",\"57/8\",\"29/4\",\"29/4\",\"29/4\",\"59/8\",\"15/2\",\"15/2\",\"61/8\",\"31/4\",\"31/4\",\"31/4\",\"63/8\",\"8\",\"8\",\"33/4\",\"67/8\",\"17/2\",\"17/2\",\"35/4\",\"9\",\"9\",\"37/4\",\"75/8\",\"19/2\",\"19/2\",\"39/4\",\"10\",\"10\",\"41/4\",\"83/8\",\"21/2\",\"21/2\",\"43/4\",\"11\",\"11\",\"89/8\",\"45/4\",\"45/4\",\"91/8\",\"23/2\",\"23/2\",\"93/8\",\"47/4\",\"47/4\",\"95/8\",\"12\",\"49/4\",\"25/2\",\"51/4\",\"103/8\",\"13\",\"105/8\",\"53/4\",\"107/8\",\"27/2\",\"55/4\",\"111/8\",\"14\",\"57/4\",\"29/2\",\"29/2\",\"59/4\",\"59/4\",\"15\",\"121/8\",\"61/4\",\"123/8\",\"31/2\",\"31/2\",\"63/4\",\"127/8\"],\"sounds\":[\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"md_snare\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"md_snare\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"md_snare\",\"vc_zill\",\"vc_zill\",\"md_kick\",\"vc_zill\",\"md_snare\",\"md_kick\",\"vc_zill\",\"md_kick\",\"md_snare\",\"vc_zill\",\"md_kick\",\"md_kick\",\"vc_zill\",\"md_snare\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_kick\",\"md_kick\"],\"bpm\":175,\"bars\":16}"
    },
    "pairs_with": [
      "cand_b3_sd_viewpoint_swing_ride",
      "cand_b2_dr_wily_answer_snare"
    ],
    "confidence": "high"
  },
  "cand_b4_pc_stack_kit_x_bongos": {
    "id": "cand_b4_pc_stack_kit_x_bongos",
    "batch": 4,
    "type": "rhythm",
    "source": "CROSS-SOURCE EXPERIMENT - kit: gameboy/PKMN_-_TrainerBattleRemix.mid bar 44 (175bpm battle); hand layer: genesis/SprkstrDesert.mid bar 8 bongo+tamb deck (127bpm desert). Card runs both at 130bpm.",
    "why": "STACKING experiment, built to be judged: bars 1-2 are the rock kit alone (kick 1-3-and-floor, snare 2+4, 8th hats); bars 3-4 stack the desert file's bongo+tambourine deck on top, unchanged. The corpus says this two-kits-at-once texture is real but SCOPED: 19.4% of all kit songs run hand percussion >=25% of their kit bars - and when they do, they keep it (87% of those stay co-active >=50% of bars: stacking is an arrangement choice, not a fill). It concentrates in environment types (desert 48%, water 37%, cave 29%) and is rare in dance (8%) and victory (11%).",
    "his_prior_words": "drums can be layered and mixed too",
    "vibes": [
      "excited/market",
      "adventure/caravan",
      "battle/festival"
    ],
    "scope": "experiment - asks WHERE two percussion decks may stack, not a single-type claim",
    "question": "Bars 3-4 vs bars 1-2: do you want the second percussion deck as a formula (an energy/environment gate), and if yes - should the hand deck sit clearly under the kit gain-wise, like D77 support layers, or be an equal partner?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"0\",\"1/8\",\"1/4\",\"1/4\",\"1/4\",\"3/8\",\"1/2\",\"1/2\",\"5/8\",\"3/4\",\"3/4\",\"3/4\",\"7/8\",\"1\",\"1\",\"9/8\",\"5/4\",\"5/4\",\"5/4\",\"11/8\",\"3/2\",\"3/2\",\"13/8\",\"7/4\",\"7/4\",\"7/4\",\"15/8\",\"2\",\"2\",\"17/8\",\"17/8\",\"35/16\",\"9/4\",\"9/4\",\"9/4\",\"9/4\",\"19/8\",\"19/8\",\"19/8\",\"39/16\",\"5/2\",\"5/2\",\"21/8\",\"21/8\",\"43/16\",\"11/4\",\"11/4\",\"11/4\",\"11/4\",\"23/8\",\"23/8\",\"23/8\",\"47/16\",\"3\",\"3\",\"25/8\",\"25/8\",\"51/16\",\"13/4\",\"13/4\",\"13/4\",\"13/4\",\"27/8\",\"27/8\",\"27/8\",\"55/16\",\"7/2\",\"7/2\",\"29/8\",\"29/8\",\"59/16\",\"15/4\",\"15/4\",\"15/4\",\"15/4\",\"31/8\",\"31/8\",\"31/8\",\"63/16\"],\"sounds\":[\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_hat\",\"md_hat\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_kick\",\"md_snare\",\"md_hat\",\"vc_bongo_hi\",\"md_hat\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"md_hat\",\"md_hat\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_kick\",\"md_snare\",\"md_hat\",\"vc_bongo_hi\",\"md_hat\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"md_hat\",\"md_hat\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_kick\",\"md_snare\",\"md_hat\",\"vc_bongo_hi\",\"md_hat\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\",\"md_kick\",\"md_hat\",\"md_hat\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"md_kick\",\"md_snare\",\"md_hat\",\"vc_bongo_hi\",\"md_hat\",\"vc_bongo_lo\",\"vc_riq\",\"vc_riq\"],\"bpm\":130,\"bars\":4}"
    },
    "pairs_with": [
      "cand_b4_pc_desert_kit_hand_stack",
      "cand_un_indie_backbeat"
    ],
    "confidence": "medium"
  },
  "cand_b4_pc_stack_clap_on_snare": {
    "id": "cand_b4_pc_stack_clap_on_snare",
    "batch": 4,
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/arcade/Dance_Dance_Revolution_3rd_Mix-wa.mid, bars 19-21 (clap half, transcribed; bars 1-2 are the same groove with the claps muted - authored A/B). Slot-28 scratch-noise layer omitted (no GM meaning, no sample).",
    "why": "STACKING experiment on ONE slot: the clap does not replace the snare, it LAYERS onto it. Measured corpus-wide: of 1,676 songs using claps for 8+ bars, 61% run the clap in the same bars as a snare - and dance is the clap type (24.1% of dance files vs 10.5% baseline). Here bars 3-4 add, over the identical four-floor + offbeat-open-hat + backbeat bed: a clap ON both snare hits, plus a soft clap ECHO an 8th after each backbeat (the crowd answering the drummer). Your own md_clap note already says 'layers WITH the snare on 2 and 4, not instead of it' - this is the corpus agreeing, with the echo as the new detail.",
    "his_prior_words": "md_clap: 'layers WITH the snare on 2 and 4, not instead of it' (r22 kit import note)",
    "vibes": [
      "dance",
      "happy/festival",
      "excited/training"
    ],
    "scope": "dance/energetic only (clap prevalence 2.3x baseline in dance)",
    "question": "Clap-echo an 8th after the backbeat (bars 3-4): keep as a dance-lane device? And should snare+clap layering become the default backbeat at high energy?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"1/8\",\"1/4\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"3/4\",\"7/8\",\"1\",\"9/8\",\"5/4\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"7/4\",\"15/8\",\"2\",\"17/8\",\"9/4\",\"9/4\",\"9/4\",\"19/8\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"11/4\",\"11/4\",\"23/8\",\"23/8\",\"3\",\"25/8\",\"13/4\",\"13/4\",\"13/4\",\"27/8\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"15/4\",\"15/4\",\"31/8\",\"31/8\"],\"sounds\":[\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_ohat\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_ohat\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_ohat\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_ohat\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_clap\",\"md_ohat\",\"md_clap\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_clap\",\"md_ohat\",\"md_clap\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_clap\",\"md_ohat\",\"md_clap\",\"md_kick\",\"md_ohat\",\"md_kick\",\"md_snare\",\"md_clap\",\"md_ohat\",\"md_clap\"],\"bpm\":136,\"bars\":4}"
    },
    "pairs_with": [
      "cand_un_indie_backbeat"
    ],
    "confidence": "medium"
  },
  "cand_b4_pc_stack_iqa_under_kit": {
    "id": "cand_b4_pc_stack_iqa_under_kit",
    "batch": 4,
    "type": "rhythm",
    "source": "CROSS-SOURCE EXPERIMENT - hand deck: the engine's own D93 ayyub row (src/lib/rhythms.js, exact onsets/sounds/order); kit deck: the kick 1+3 / snare 2+4 half of genesis/SprkstrDesert.mid bar 8. 122bpm (inside ayyub's stated 100-130 range).",
    "why": "The engine's desert floor is hand-drum-only by D93, and the corpus says that matches LOW-energy desert - but desert is ALSO the type where kit+hand stacking peaks (48.1% of desert kit files). This card asks the boundary question directly: bars 1-2 the ayyub darbuka gallop alone (the current engine floor, verbatim); bars 3-4 the same gallop with kick under its dums and snare on 2+4. If bars 3-4 work, high-energy desert gets drums by ADDING a deck to the judged floor (the D120 law: serve the finished object, add layers) rather than by replacing the iqa'.",
    "his_prior_words": "drums can be layered and mixed too",
    "vibes": [
      "desert",
      "battle/desert",
      "excited/caravan"
    ],
    "scope": "desert at raised energy only; the ayyub-alone half IS the current low-energy floor",
    "question": "Desert at high energy: stack a kick+snare kit UNDER the darbuka iqa' (bars 3-4), or does any kit kill the desert? If it works, same recipe for jungle's tumbao?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"onsets\":[\"0\",\"3/16\",\"1/4\",\"3/8\",\"1/2\",\"11/16\",\"3/4\",\"7/8\",\"1\",\"19/16\",\"5/4\",\"11/8\",\"3/2\",\"27/16\",\"7/4\",\"15/8\",\"2\",\"2\",\"35/16\",\"9/4\",\"9/4\",\"19/8\",\"5/2\",\"5/2\",\"43/16\",\"11/4\",\"11/4\",\"23/8\",\"3\",\"3\",\"51/16\",\"13/4\",\"13/4\",\"27/8\",\"7/2\",\"7/2\",\"59/16\",\"15/4\",\"15/4\",\"31/8\"],\"sounds\":[\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_kick\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_snare\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_kick\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_snare\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_kick\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_snare\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_kick\",\"vc_darbuka_tak\",\"vc_darbuka\",\"md_snare\",\"vc_darbuka_tak\"],\"bpm\":122,\"bars\":4}"
    },
    "pairs_with": [
      "cand_b4_pc_desert_kit_hand_stack",
      "cand_b2_dr_yukon_camel_trot"
    ],
    "confidence": "medium"
  },
  "cand_b4_ly_chaotix_shadow_fourth": {
    "id": "cand_b4_ly_chaotix_shadow_fourth",
    "type": "device",
    "source": "audios/vgmusic-full/32x/Knuckles_sc.mid (Knuckles' Chaotix - Decision / 2nd, SC8850), bars 1-8, 100bpm. FM Slap + Pop Vibe tracks; bass lifted one octave (source g#1-c#2) for audibility; bar-4 eb fill kept",
    "why": "A cross-instrument shadow canon: the slap bass states a chromatic-ish climb ON the beats (g# bb b c#, +2 +1 +2), and a vibraphone answers ONE 16TH LATER, transposed UP A FOURTH and two octaves (c# eb e f# - the identical +2+1+2 shape). Every beat becomes a two-voice flick: thump, then sparkle. Distinct from the catalog's echo cascade (same instrument, same pitch, half/quarter-beat delay) - this is a different TIMBRE, different REGISTER (29 semitones up), different PITCH (a 4th), at the tightest delay (one 16th), so it reads as groove, not as echo. Frozen for the whole section; measured 0 shared onsets.",
    "his_prior_words": "",
    "vibes": [
      "groovy/menu",
      "happy/task",
      "excited/training"
    ],
    "scope": "groove/funk lanes (menu, task, bright activity) - at slow tempi or on pads the 16th delay would smear",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_vibraphone\",\"gain\":0.38}],\"bpm\":100,\"bars\":2}"
    },
    "key_tonic": "C#",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_b2_ly_infinity_slap_octave_pop",
      "cand_combo_808_cluster_task"
    ],
    "confidence": "high"
  },
  "cand_b4_ly_tf2_octave_pump": {
    "id": "cand_b4_ly_tf2_octave_pump",
    "type": "device",
    "source": "audios/vgmusic-full/genesis/tf2_exceed.mid (Thunder Force II - Stage 3 'Exceed'), bars 8-16, 179bpm, D minor. BASS1 + LEAD4 transcribed verbatim; bass lifted one octave (source a1/a2); pad's one-16th-late entries normalized to the downbeat",
    "why": "The extreme density inversion: the bass is a ONE-PITCH octave pump (a-A-a-A on straight 8ths, 64 identical notes over 8 bars, frozen) and the ONLY moving layer is a whole-note saw glide (d5 e5 f5, then a 4-bar answering phrase) - 16 onsets a bar against 1. The pump sits on A, the DOMINANT of D minor, so the glide's d-e-f walks tension over an unresolved pedal. This is the exact shape the r21 metronome test rejects as a texture (8 identical onsets, 1 shape) - but the corpus uses it as a BASS at scale (octave-alt is 9% of all straight-8th accompaniment bars, 560-file cluster) and it drives every shooter stage this way.",
    "his_prior_words": "some given intervals and it repeats those intervals over and over to convey energy (r30, the synthRise ask)",
    "vibes": [
      "battle/space",
      "excited/fight",
      "tense/lab"
    ],
    "scope": "high-energy battle/shooter only, and only as the BASS with slow layers above - as a mid-register texture this is the exact monotony the metronome test exists to kill",
    "question": "Your metronome law kills 8-identical-onsets figures as textures. As a BASS under whole-note glides (this render), does the same shape become drive instead of monotony - i.e. should the metronome test be role-aware?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[a2 a3 a2 a3 a2 a3 a2 a3]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<d5 e5 f5 [g5 f5@2 e5] [a5@2 g5@2] [f5@2 e5@2] a4@2>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.3}],\"bpm\":179,\"bars\":8}"
    },
    "key_tonic": "D",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_r23_taiko_trailer_gallop",
      "cand_device_layerstack_rise"
    ],
    "confidence": "medium"
  },
  "cand_b4_ly_dkc2_tom_fourths": {
    "id": "cand_b4_ly_dkc2_tom_fourths",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/snes/DKC2_Credits-KM.mid (Donkey Kong Country 2 - Credits 'Donkey Kong Rescued' (2)), bars 16-24, 120bpm. Melodic Tom + Halo tracks transcribed verbatim",
    "why": "PITCHED TOMS carrying the harmony's floor: a frozen riff of stacked-fourth dyads FALLING by fourths (f+b, c+f, g+c, then a lone g) on an off-grid rhythm (16th slots 2,4,6,10 - it starts a 16th AFTER the downbeat and dodges beat 4), under a halo pad climbing parallel minor thirds a bar at a time (d+f, e+g, f#+a - the f-natural-to-f# morph is the modal charm). Drum-register quartal descent + treble planing climb, zero rhythm overlap, one frozen one moving. The engine has no pitched-percussion harmony layer at all.",
    "his_prior_words": "",
    "vibes": [
      "adventure/jungle",
      "nostalgic/ending",
      "triumphant/forest"
    ],
    "scope": "adventure/jungle/ending lanes - the tom timbre is expedition flavor, wrong for interiors and menus",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[~ [f3,b3] [c3,f3] [g2,c3] ~ g2 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.5},{\"mini\":\"<[d4,f4] [e4,g4] [f#4,a4]@2>\",\"sound\":\"gm_pad_halo\",\"gain\":0.3}],\"bpm\":120,\"bars\":4}"
    },
    "key_tonic": "D",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b2_dr_dkc_water_congas",
      "cand_r15_jp2_flute_call"
    ],
    "confidence": "medium"
  },
  "cand_b4_gr_ctr_boss_staircase": {
    "id": "cand_b4_gr_ctr_boss_staircase",
    "type": "device",
    "source": "audios/vgmusic-full/ps1/ctr_bossrace.mid (Crash Team Racing — Boss Race), bars 0-23 compressed 8->4 per stage; whole card +12 (source bass riff lives on b1/g1/e1, below the octave floor), so the bass doubles the theme at -12 here where the source runs -24",
    "why": "The staircase his boss exemplar describes, measured: 8 bars solo bass riff on a B pedal -> offbeat root-triad stabs join (bar 8) -> the THEME enters at bar 16 and two things happen at once: the stabs DROP OUT entirely and the bass abandons its own riff to play the theme in octave unison -> bar 20 a chromatic inner climb (e-g-g#-b / a-c-c#-e) takes over while the theme rests. Voice count goes 1 -> 3 -> 2 -> 2: the build makes WAY at the biggest moment instead of piling up. Every stage stays on E-minor pitch classes except the climb's g#/c# — the one chromatic device, saved for last.",
    "his_prior_words": "",
    "vibes": [
      "boss/battle",
      "tense/chase"
    ],
    "scope": "boss/battle only — the pressure comes from the dominant-pedal riff running 8 bars before anything else exists, and from support layers clearing out when the theme lands",
    "question": "When the theme enters (bar 9 here), the stabs vanish and the bass leaves its riff to double the theme — the layer count DROPS at the arrival. Does that read as impact or as the mix thinning out?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[b2@3 ~@1 b2 ~@1 b2@3 ~@1 b2@3 ~@1 b2 ~@1] [b2 ~@1 b2@3 ~@1 b2@2 g2@3 ~@1 f#2@4] [e3@6 ~@2 e3@5 ~@1 b2@2] [a2@2 b2@2 a2@2 b2@7 ~@3]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.75},{\"mini\":\"<[~@4 [b2,f#3,b3]@2 ~@6 [b2,f#3,b3]@3 ~@1] [~@4 [g2,d3,g3]@3 ~@5 [g2,d3,g3]@4] ~ ~>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<~ ~ [e4@6 ~@2 e4@5 ~@1 b3@2] [a3@2 b3@2 a3@2 b3@7 ~@3]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.5}],\"bpm\":140,\"bars\":4}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_in_luf1_pickup_run"
    ],
    "confidence": "high"
  },
  "cand_b4_gr_topgear_riff_octave_copy": {
    "id": "cand_b4_gr_topgear_riff_octave_copy",
    "type": "device",
    "source": "audios/vgmusic-corpus/snes/Top_Gear_3000_ParaDise_Forever_HQ_v3_Remix.mid bars 0-19 (stage repeats halved: source runs each stage 8 bars); whole card +12 — the source riff sits on e1, below the octave floor, and its own bar-8 copy at e2 becomes this card's base register",
    "why": "The purest form of 'adds octaves over time': a pumping-8ths bass riff (E..E-g / E..g-a-a-a, D bar for the turn) runs 4 bars alone, then an EXACT +12 copy of it enters — same rhythm, same turns, nothing else changed — plus a held-root pad. 4 bars later two-note offbeat stabs (d/e oscillation, static over both chords) stack on top. Measured in the source: the copy matches the bass 100% at +12 for its whole life; zero new pitch classes enter with any layer. The riff itself never varies once — all growth is vertical.",
    "his_prior_words": "",
    "vibes": [
      "energetic/race",
      "tense/chase"
    ],
    "scope": "energetic/driving only — at low energy an unvaried 8th-note riff with octave copies reads as a drone",
    "question": "Is the exact +12 copy alone enough of an event at bar 5, or does it need the pad entering with it to register?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[e2@2 ~@1 e2 e2@2 e2@4 e2@2 e2@2 g2@2] [e2@2 e2@2 e2@2 e2@2 g2@2 a2@2 a2@2 a2@2] [d2@3 d2 d2@2 d2@4 d2@2 d2@2 c2@2] [d2@2 d2@2 d2@2 d2@2 g2@2 a2@2 g2@2 a2@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.75},{\"mini\":\"<~ ~ [d3@3 d3 d3@2 d3@4 d3@2 d3@2 c3@2] [d3@2 d3@2 d3@2 d3@2 g3@2 a3@2 g3@2 a3@2]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.42}],\"bpm\":132,\"bars\":4}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_gr_ctr_credits_octave_pillar"
    ],
    "confidence": "high"
  },
  "cand_b4_gr_ctr_credits_octave_pillar": {
    "id": "cand_b4_gr_ctr_credits_octave_pillar",
    "addon_gain": 1.3,
    "type": "device",
    "source": "audios/vgmusic-full/ps1/CTR_Credits.mid bars 0-7; whole card +12 (source riff on g1, below the floor). Source registers g1/g2/g3 -> g2/g3/g4 here, relations preserved",
    "why": "The other way octaves get added: not a staircase but a PILLAR. A funky minor riff (g-a-bb-d with a c#-d chromatic snap) plays 4 bars alone in the bass, then +12 AND +24 copies land TOGETHER on the downbeat of bar 5 — a three-octave unison wall, all at once, note-for-note (measured 100% at both offsets in the source). Zero new pitch classes; the event is pure register. Contrast card to the Top Gear staircase: same riff-growth idea, opposite dosing.",
    "his_prior_words": "",
    "vibes": [
      "energetic/credits",
      "funk/groove"
    ],
    "scope": "energetic/groove — the slam-entry is a celebration gesture; in a tense lane it reads as a jump-scare",
    "question": "",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g2@4 ~@2 a2@4 a#2@4 d3@2] [g2@4 ~@2 a2@4 d2@2 c#3@2 d3@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.75},{\"mini\":\"<[g3@4 ~@2 a3@4 a#3@4 d4@2] [g3@4 ~@2 a3@4 d3@2 c#4@2 d4@2]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.45},{\"mini\":\"<[g4@4 ~@2 a4@4 a#4@4 d5@2] [g4@4 ~@2 a4@4 d4@2 c#5@2 d5@2]>\",\"sound\":\"gm_lead_1_square\",\"gain\":0.32}],\"bpm\":165,\"bars\":2}"
    },
    "key_tonic": "G",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_gr_topgear_riff_octave_copy"
    ],
    "confidence": "high"
  },
  "cand_b4_in_luf1_pickup_run": {
    "id": "cand_b4_in_luf1_pickup_run",
    "type": "device",
    "source": "audios/vgmusic-full/snes/luf1battle.mid (Lufia — battle) bars 1-5; pickup run lifted +12 (source descends to ab1/bb1, below the floor — the lifted run now lands exactly on the groove bass's first note)",
    "why": "A one-bar intro that never comes back (46.6% of scanned files open this way; 61% of battle tracks): a lone held eb (the V) hangs while a half-bar bass run tumbles down ab-bb-f-ab-g-eb-bb-ab — landing square on beat 1 of the groove: slap-bass 16th motor, planing held triads Db-Eb-Gb-Ab (IV V bVII I), the lead walking down from f5. The run tells you where beat 1 is before the band exists; because the card loops, it also demos as a turnaround.",
    "his_prior_words": "",
    "vibes": [
      "battle/energetic",
      "boss/battle"
    ],
    "question": "The engine currently opens songs with loops of their own material. Should a fresh energetic song get a NEVER-recurring bar like this — a run that exists only to point at beat 1?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[eb5@16] [f5@10 eb5@2 db5@2 c5@2] [eb5@10 db5@2 c5@2 bb4@2] [db5@10 c5@2 bb4@2 ab4@2] [bb4@3 ab4@3 g4@3 ab4@3 g4@2 eb4 ~@1]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.5},{\"mini\":\"<~ [[db4,f4,ab4]@13 [db4,f4,ab4]@3] [[eb4,g4,bb4]@12 [eb4,g4,bb4]@4] [[gb4,bb4,db5]@13 [gb4,bb4,db5]@3] [[ab4,c5,eb5]@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.3},{\"mini\":\"<[~@8 ab3 bb3 f3 ab3 g3 eb3 bb2 ab2] [ab2 bb2 f2 f2 ab2 ab2 bb2 f2 ab2 bb2 f2 f2 ab2 ab2 bb2 f2] [ab2 bb2 f2 f2 ab2 ab2 bb2 f2 ab2 bb2 f2 f2 ab2 ab2 bb2 f2] [ab2 bb2 f2 f2 ab2 ab2 bb2 f2 ab2 bb2 f2 f2 ab2 ab2 bb2 f2] [ab2 bb2 f2 f2 ab2 ab2 bb2 f2 ab2 bb2 f2 f2 ab2 ab2 bb2 f2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55}],\"bpm\":150,\"bars\":5}"
    },
    "key_tonic": "Ab",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_b4_gr_ctr_boss_staircase"
    ],
    "confidence": "high"
  },
  "cand_b4_ly_mine_cogs": {
    "id": "cand_b4_ly_mine_cogs",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/snes/mine.mid (Donkey Kong Country 2 - Mine (2)), bars 16-24, 92bpm, D minor. Str + Mtl Clg + Mtl Clg2 tracks, transcribed verbatim; high cog dropped f8 -> f6 for instrument range, low cog d3 kept",
    "why": "An industrial machine built from two ONE-PITCH metal cogs at opposite register extremes (d3 vs f8 in source - 65 semitones apart) around a slow string chorale. The low clang hits beats 2 and 4 and answers ITSELF three 16ths later at half velocity (v80 then v40 - a written echo); the high ping plays the identical hit+echo shape but starts two 16ths EARLIER, so the two cogs interlock into a tick-tock in which no cog ever strikes with the other. Zero shared onsets with the chorale (measured 0.00 over 8 bars). Both cogs are frozen for the whole section while only the strings move - the whole 'machine' is 2 pitches.",
    "his_prior_words": "the same 3 stick is just used every construction or what? (r32, on the industrial_metal pool-of-one)",
    "vibes": [
      "tense/mine",
      "tense/construction",
      "mysterious/cave"
    ],
    "scope": "cave/mine/industrial only - the cogs are literal machinery; on a bright or pastoral song they would read as noise",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[g3,a3,c4,e4] [f3,a3,d4]] [[bb3,d4,f4] [c4,e4,g4]] [[f4,a4] [d4,f4,a4]] [[bb3,d4,f4] [g3,c4,e4]]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4},{\"mini\":\"[~ ~ ~ ~ d3 ~ ~ ~ ~ ~ ~ ~ d3 ~ ~ ~]\",\"sound\":\"gm_tubular_bells\",\"gain\":0.42},{\"mini\":\"[~ ~ ~ ~ ~ ~ ~ d3 ~ ~ ~ ~ ~ ~ ~ d3]\",\"sound\":\"gm_tubular_bells\",\"gain\":0.2},{\"mini\":\"[~ ~ f6 ~ ~ f6 ~ ~ ~ ~ f6 ~ ~ f6 ~ ~]\",\"sound\":\"gm_glockenspiel\",\"gain\":0.28}],\"bpm\":92,\"bars\":4}"
    },
    "key_tonic": "D",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b3_sd_dkltemple_lattice",
      "cand_b4_ly_bowser_stomp_seesaw"
    ],
    "confidence": "high"
  },
  "cand_b4_ly_aquatic_murmur_canon": {
    "id": "cand_b4_ly_aquatic_murmur_canon",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/snes/DKC_Water-Arr-KM.mid (Donkey Kong Country - Aquatic Ambience, arranged), bars 14-22, 74bpm. Fingered Bass + Synth Strings 2 + Synth Strings 1 (echo); murmur lifted one octave (source b0/f#1) for audibility",
    "why": "The famous water texture decomposed into three portable layers. (1) A FROZEN murmur bass: three 16th rests then five 16ths (R 5 R oct oct on B) repeating every half-bar, identical for the whole section while the harmony moves G^9 -> Em7 -> A -> Bm9 over it - B stays consonant with all four chords (3rd, 5th, 9th, root), so one bar of notes serves the entire progression. (2) Two pad layers a 16TH APART: the high chord strikes the downbeat, the low open voicing (R-5-R) answers exactly one 16th later two octaves down - a written micro-echo across registers, 2-bar breathing. Pads share zero onsets with the murmur's active slots at pad-entry time; each layer alone is trivial.",
    "his_prior_words": "",
    "vibes": [
      "calm/water",
      "mysterious/water",
      "somber/cave"
    ],
    "scope": "water/underwater specifically - the murmur reads as bubbling; census shows water files favor low-density complementary pads (acc~lead complementary 14.5% vs locked 37.9%, lowest locked share of all scene types after dance)",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[~ ~ ~ b1 f#2 b1 b2 b2 ~ ~ ~ b1 f#2 b1 b2 b2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<[b5,d6,f#6]@2 [e5,g5,a5]@2 [c#5,e5,a5]@2 [f#5,a5,c#6]@2>\",\"sound\":\"gm_pad_halo\",\"gain\":0.3},{\"mini\":\"<[~ [g2,d3,g3]@31]@2 [~ [e2,b2,e3]@31]@2 [~ [a2,e3,a3]@31]@2 [~ [b2,f#3,b3]@31]@2>\",\"sound\":\"gm_pad_warm\",\"gain\":0.32}],\"bpm\":74,\"bars\":8}"
    },
    "key_tonic": "B",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_ly_xtheory_bell_to_water",
      "cand_b2_dr_dkc_water_congas"
    ],
    "confidence": "high"
  },
  "cand_b4_ly_hangcastle_offbeat_bloom": {
    "id": "cand_b4_ly_hangcastle_offbeat_bloom",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/gamecube/Sonic_Heroes_Hang_Castle.mid (Sonic Heroes - Hang Castle), bars 8-16, 120bpm, A minor. Both parts transcribed verbatim (pad trimmed from 6 voices to 4; source pad holds a full bar, crossing the barline - simplified to a half-bar bloom)",
    "why": "A haunted groove from exactly two frozen layers with ZERO shared onsets over 8 bars: an Am triad stabbed on every offbeat 8th (the census offbeat-comp template, [2,6,10,14] in 16th slots), and a 4-octave Am stack that blooms at the HALF-bar and hangs across the beat. The stabs own the offbeats, the pad owns the half-bar, the downbeat belongs to nobody - which is what makes it float. Both parts play identical bars for the full section; the hypnosis IS the freeze.",
    "his_prior_words": "the piano on the offbeat (the & of every beat) makes it sound less serious (r19, on catacombs)",
    "vibes": [
      "haunted/castle",
      "sneaky/manor",
      "groovy/dungeon"
    ],
    "scope": "haunted-groove songs (spooky but danceable) - NOT the serious-dread lanes; census: offbeat-8th comp is 2.8x over-represented in dance files, and this reel of it is a haunted DANCE stage",
    "question": "Your r19 law says offbeat chords read less serious - here a haunted castle stage is built ON them (minor key, half-bar choir bloom). Does minor + the bloom flip offbeat stabs from playful to spooky-groovy, or does this confirm they can never carry real dread?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4]]\",\"sound\":\"gm_harpsichord\",\"gain\":0.42},{\"mini\":\"[~ [a4,c5,e5,a5]]\",\"sound\":\"gm_choir_aahs\",\"gain\":0.3}],\"bpm\":120,\"bars\":2}"
    },
    "key_tonic": "A",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_vg_threed_iv_mixture_vamp",
      "cand_b4_ly_bowser_stomp_seesaw"
    ],
    "confidence": "high"
  },
  "cand_b4_ly_bowser_stomp_seesaw": {
    "id": "cand_b4_ly_bowser_stomp_seesaw",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/gamecube/bowsiewowsie.mid (Mario Kart: Double Dash!! - Bowser's Castle), bars 9-16, 120bpm, Eb minor. Both parts transcribed verbatim",
    "why": "Menace from two frozen layers: a dotted-8th TRIPLE STOMP on one pitch (eb2 at 16th slots 0,3,6 - a 3+3+2 tresillo head that stops after the third hit, leaving beats 3-4 empty except a bb1 pickup on the last 8th), and high triads on the HALF-bar seesawing a semitone: Ebm one bar, Dm the next, never resolving. The seesaw is your S.C.A.R.Y. choir pincer arriving from Mario Kart as full triads - alternate-bar semitone neighbors over a stomping floor. Stomp and pad share zero onsets; the empty back half of every bar is where the dread lives.",
    "his_prior_words": "conveys tension and can also be used outside of desert too (r16, on the wobble pincer - same never-resolving neighbor device)",
    "vibes": [
      "dark/castle",
      "tense/boss",
      "haunted/fortress"
    ],
    "scope": "dark castle/menace lanes - the semitone seesaw is a horror-budget harmonic device (one per song per D93)",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"[eb2@3 eb2@3 eb2@2 ~@6 bb1@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<[~ [eb5,f#5,bb5]] [~ [d5,f5,a5]]>\",\"sound\":\"gm_pad_metallic\",\"gain\":0.26}],\"bpm\":120,\"bars\":2}"
    },
    "key_tonic": "Eb",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_rl_r1_madd9_planed",
      "cand_b4_ly_mine_cogs"
    ],
    "confidence": "medium"
  },
  "cand_b4_ly_evermore_beat2_descant": {
    "id": "cand_b4_ly_evermore_beat2_descant",
    "type": "instrument_combo",
    "source": "audios/vgmusic-full/snes/soe62.mid (Secret of Evermore - Ivor Tower East Wing / Dog Maze (2)), bars 0-4, 75bpm. Both parts transcribed verbatim (drone's pushed re-entries kept as final-16th anticipations)",
    "why": "A melody that REFUSES beat 1: every phrase is a pair of grace 16ths landing on a note held from BEAT 2, plus one more held note on beat 4 - the downbeat always belongs to the drone alone. Under it, a two-pitch breathing drone (a3/g3 whole-note seesaw) that anticipates each change on the final 16th of the previous bar (a written push). Census: the beats-2-3-4 comp shape [4,8,12] is 196 files with castle/victory skew, and the beat-2 landing held note is its melodic twin. The engine's melody grammar has no avoid-the-downbeat mode at all.",
    "his_prior_words": "notice how melody is chord too not just one note, and the melody is held not very jittery (r17 - the held half applies: every landing is a 2-3 beat hold)",
    "vibes": [
      "haunted/manor",
      "mysterious/tower",
      "somber/interior"
    ],
    "scope": "slow interior/haunted lanes (60-90bpm) - at speed the grace pairs become jitter",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\": [{\"mini\": \"<[a3@15 g3] [g3@15 a3] [a3@15 g3] [g3@15 a3]>\", \"sound\": \"gm_pad_bowed\", \"gain\": 0.34}, {\"mini\": \"<[~@4 c5@8 c#5@4] [~ ~ eb5 f5 c5@8 bb4@4] [~ ~ f4 bb4 c5@8 c#5@4] [~ ~ ~ a5 c5@8 f5@4]>\", \"sound\": \"gm_celesta\", \"gain\": 0.4}], \"bpm\": 75, \"bars\": 4}"
    },
    "key_tonic": "F",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_vg_threed_harp_zigzag",
      "cand_b4_ly_bowser_stomp_seesaw"
    ],
    "confidence": "medium"
  },
  "cand_b4_ly_xtheory_bell_to_water": {
    "id": "cand_b4_ly_xtheory_bell_to_water",
    "type": "device",
    "source": "CROSS-THEORY EXPERIMENT: the one-pitch piano bell of ps1/(ValensFtrs1).mid (Threads of Fate - Valens Fortress, a tense castle, g4 clock at slots 2,8,12 / 2,6,12) transposed to f#4 and dropped into the DKC Aquatic Ambience water texture (snes/DKC_Water-Arr-KM.mid murmur bass + halo pads). Two games, two genres, zero composed-together history",
    "why": "The census claim under test: a FROZEN one-pitch layer appeared in every song type I measured (castle, water, menu, victory, mine), always with the same contract - sit in an empty register octave, stay consonant with every chord, share zero onsets with the pads and separate from the murmur by register+timbre (measured: 0.00 shared slots vs pads, 0.50 vs the murmur - D102's law that register and timbre separate a layer where rhythm does not is part of what this card tests). This bell keeps its exact castle rhythm (a 2-bar clock whose middle hit shifts one 8th between bars) but takes the water texture's pitch contract (f#4 = 5th of B, consonant with all four chords) and its empty middle octave. If it reads as water-sparkle rather than an intruder, the genre of a frozen layer lives in the COMBINATION, not the layer - which would let every hardcoded one-pitch pattern serve any lane whose harmony keeps it consonant.",
    "his_prior_words": "whether two layers from two different songs work to prove a theory... mixing different genre layers, anything - up to you",
    "vibes": [
      "calm/water",
      "mysterious/water"
    ],
    "scope": "experiment - if it works, the one-pitch clock patterns become lane-free; if it fails, one-pitch layers get genre-locked like everything else",
    "question": "The bell is a tense-castle layer note-for-note; only its pitch class and its neighbors changed. Does it read as water now? And if yes - should frozen one-pitch layers be the one pattern class the engine treats as genre-free?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\": [{\"mini\": \"[~ ~ ~ b1 f#2 b1 b2 b2 ~ ~ ~ b1 f#2 b1 b2 b2]\", \"sound\": \"gm_synth_bass_1\", \"gain\": 0.5}, {\"mini\": \"<[b5,d6,f#6]@2 [e5,g5,a5]@2 [c#5,e5,a5]@2 [f#5,a5,c#6]@2>\", \"sound\": \"gm_pad_halo\", \"gain\": 0.3}, {\"mini\": \"<[~ ~ f#4@2 ~@4 f#4@2 ~ ~ f#4@2 ~ ~] [~ ~ f#4@2 ~ ~ f#4@2 ~@4 f#4@2 ~ ~]>\", \"sound\": \"gm_epiano1\", \"gain\": 0.36}], \"bpm\": 74, \"bars\": 8}"
    },
    "key_tonic": "B",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_ly_aquatic_murmur_canon"
    ],
    "confidence": "medium"
  },
  "cand_b4_vr_dejavu_aaab_melody": {
    "id": "cand_b4_vr_dejavu_aaab_melody",
    "type": "melody_pattern",
    "source": "audios/vgmusic-full/nes/dejavu8.mid (Deja Vu NES, Ending Theme) t1, bars 0-7 — 4-bar phrase transcribed verbatim; bars 4-7 repeat it byte-identically",
    "why": "The cleanest A A A' B melody-variation curve in a 928-file sweep: statements 1-2 identical (d4-g4-f#4-g4), statement 3 lifts exactly ONE pitch (d4->e4, 25% of the bar's notes), statement 4 keeps the front half and rewrites only the back half into a cadence (2 extra onsets). Then the whole 4-bar phrase repeats EXACTLY. Same-slot corpus stats behind it: 85.1% of variant bars keep the rhythm identical and vary pitch only (n=22,588 variant bars), and variants sit in statements 3-4 of a 4-group 55% of the time — this card is that norm in 8 bars. His law verbatim: vary the strong melody 'safely... the appeal of that original sample' — here the appeal survives because only one note moves until the cadence.",
    "his_prior_words": "some strong melodies should be varied. over the course of the song (safely) as well as by the song",
    "vibes": [
      "nostalgic/rest",
      "calm/town",
      "happy/ending"
    ],
    "question": "is the one-note lift on the 3rd statement enough variation for you, or is this still 'the same melody 4 times'?",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[d4@4 g4@2 f#4@4 g4@6] [d4@4 g4@2 f#4@4 g4@6] [e4@4 g4@2 f#4@4 g4@6] [e4@4 g4@2 g4@2 f#4@2 g4@2 ~@2 g4@2]>\",\"sound\":\"gm_lead_1_square\",\"bpm\":180,\"bars\":4,\"note\":\"GM file says Alto Sax; NES original is a square. Harmony under it is a G^7/C/Em7 tonic wash.\"}"
    },
    "key_tonic": "G",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_termina_addvoice"
    ],
    "confidence": "high"
  },
  "cand_b4_vr_ttyd_bass_aaab": {
    "id": "cand_b4_vr_ttyd_bass_aaab",
    "type": "accomp_pattern",
    "source": "audios/vgmusic-full/gamecube/PM_Ttyd_Final_Battle.mid (Battle with Shadow Queen) t8 synth bass, bars 16-19 — the 4-bar group loops verbatim through bar 31",
    "why": "A left-hand A A A B group whose entire variation budget is 1-2 notes: three bars end with a chromatic push UP (c-c-c-Db, the Db on beat 4 in bars 1/3 but on the and-of-3 in bar 2 — even the 'identical' bars alternate the push's timing), and the 4th bar answers DOWN to the leading tone (b-b) instead. D97's 'block 4 is a turnaround' measured in a shipped boss track. Corpus context: bass-role same-slot variants are 42% transposition and only 7% rhythm-side — a repeated left hand varies by PITCH, almost never by rhythm, and this is the minimal version of that.",
    "his_prior_words": "and then the variation of the piano left hand (his boss-song exemplar)",
    "vibes": [
      "tense/battle",
      "dark/boss",
      "tense/construction"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c2@2 ~@2 c2@2 ~@2 c2@2 ~@4 db2@2] [c2@2 ~@2 c2@2 ~@2 c2@2 ~@2 db2@2 ~@2] [c2@2 ~@2 c2@2 ~@2 c2@2 ~@4 db2@2] [c2@2 ~@2 c2@2 ~@2 b1@2 ~@2 b1@2 ~@2]>\",\"sound\":\"gm_synth_bass_1\",\"bpm\":140,\"bars\":4,\"octaveShift\":1,\"note\":\"source register c2/b1 sits under the browser floor; auditioned an octave up. Harmony is a Cm pedal.\"}"
    },
    "key_tonic": "C",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_boss1_fall_seam",
      "cand_b4_vr_absq_call_answer"
    ],
    "confidence": "high"
  },
  "cand_b4_vr_termina_addvoice": {
    "id": "cand_b4_vr_termina_addvoice",
    "type": "accomp_pattern",
    "source": "audios/vgmusic-full/n64/Majora-Termina.mid (Termina Field) t1 pizzicato, bars 1-8 transcribed verbatim (chords change on beat 3, hence the half-bar offsets)",
    "why": "Variation by ADDING A VOICE, not changing the figure: 3.5 bars of a three-note cluster (root+9+b3 — the 9 UNDER the b3, same species as the madd9 card he liked) struck on every offbeat 8th, then a 4th voice (the 5th, d4) joins mid-phrase and the now-four-voice cluster starts following the harmony. The rhythm never moves once in 8 bars. This is r17's 'a top voice is ADDED on every second pass' finally measured in a famous field theme — and it is the acc-role norm's counterweight: acc parts are the most rhythm-varying role in the corpus (20% fill/thin) yet this one varies density instead.",
    "his_prior_words": "",
    "vibes": [
      "happy/field",
      "excited/town",
      "adventure/field"
    ],
    "question": "does the 4th voice joining mid-phrase read as growth to you, or do you only hear it once the chords start moving?",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3]] [~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3]] [~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3]] [~ [g3,a3,bb3] ~ [g3,a3,bb3] ~ [g3,a3,bb3,d4] ~ [g3,a3,bb3,d4]] [~ [g3,a3,bb3,d4] ~ [g3,a3,bb3,d4] ~ [f3,g3,a3,c4] ~ [f3,g3,a3,c4]] [~ [f3,g3,a3,c4] ~ [f3,g3,a3,c4] ~ [eb3,f3,g3,bb3] ~ [eb3,f3,g3,bb3]] [~ [eb3,f3,g3,bb3] ~ [eb3,f3,g3,bb3] ~ [f3,a3,bb3,d4] ~ [f3,a3,bb3,d4]] [~ [f3,a3,bb3,d4] ~ [f3,a3,bb3,d4] ~ [eb3,f3,ab3,c4] ~ [eb3,f3,ab3,c4]]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":145,\"bars\":8,\"note\":\"Gm cluster; harmony walks Gm -> F6 -> Eb -> Bb/D -> Ab from bar 5 at half-bar rate.\"}"
    },
    "key_tonic": "G",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_dejavu_aaab_melody"
    ],
    "confidence": "high"
  },
  "cand_b4_vr_thunder_mode_flicker": {
    "id": "cand_b4_vr_thunder_mode_flicker",
    "type": "device",
    "source": "audios/vgmusic-full/ps2/thunder_plains.mid (FFX Thunder Plateau) t3 violin, bars 10-17 — 4 bars per state, transcribed verbatim",
    "why": "A frozen repeating-interval cell (g-d-e-f straight 8ths, the synthRise species) that moves exactly ONE scale degree at the 4-bar seam: e-natural while the harmony sits on the dominant side (Fm/C), eb once it darkens to Gm7/Bb6 — the leading tone flickering to the subtonic. R2's 'freeze the body' with the corpus's one permitted edit: the cell does NOT follow the chord beat-to-beat, it tracks the MODE at phrase period. Same-slot corpus norm: repitched_partial variants change a median 50% of the figure's notes; this changes 25% and only every 4th bar.",
    "his_prior_words": "some given intervals and it repeats those intervals over and over to convey energy (his synthRise ask)",
    "vibes": [
      "tense/field",
      "mysterious/storm",
      "somber/rain"
    ],
    "question": "when the repeated cell bends one note to follow the mode like this, does it still count as the same pattern to your ear, or does it read as a new pattern?",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[g4 d4 e4 f4 g4 d4 e4 f4] [g4 d4 e4 f4 g4 d4 e4 f4] [g4 d4 e4 f4 g4 d4 e4 f4] [g4 d4 e4 f4 g4 d4 e4 f4] [g4 d4 eb4 f4 g4 d4 eb4 f4] [g4 d4 eb4 f4 g4 d4 eb4 f4] [g4 d4 eb4 f4 g4 d4 eb4 f4] [g4 d4 eb4 f4 g4 d4 eb4 f4]>\",\"sound\":\"gm_violin\",\"bpm\":120,\"bars\":8,\"note\":\"F minor; e-natural bars sit over Fm/C (dominant side), eb bars over Gm7/Bb6.\"}"
    },
    "key_tonic": "F",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_ttyd_bass_aaab"
    ],
    "confidence": "medium"
  },
  "cand_b4_vr_absq_call_answer": {
    "id": "cand_b4_vr_absq_call_answer",
    "type": "melody_pattern",
    "source": "audios/vgmusic-full/genesis/a-bsq.mid (Battle Squadron, Main) t2 Lead 2 (call) + t1 Lead 1 (answer), bars 33-36 — triplet grid, transcribed verbatim",
    "why": "His trumpet exemplar as a mechanism: the tune is MONO when it moves (a swung triplet call winding c5-db5-c5...bb4-ab4) and turns into parallel minor-3rD DYADS only when it answers in stabs ([ab4,c5]->[g4,bb4]->[f4,ab4] — pure Fm chord-tone pairs). Measured across 126 selectively-thickened corpus leads: dyads are 68% of all thickening, 3rds beat 6ths everywhere, and brass leads are mono 47 of 55 files — 'multiple notes in the trumpet' lives in exactly this call/answer split, not in thickening the whole line. The source is one brass section split across two sequencer tracks.",
    "his_prior_words": "the patterns in the melody in the trumpets and how there's multiple notes in the trumpet (his boss-song exemplar)",
    "vibes": [
      "excited/battle",
      "heroic/boss",
      "triumphant/battle"
    ],
    "question": "do the dyad stabs answering a mono call sound like your boss-song trumpets, or were yours playing the dyads ON the tune itself?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[c5@2 db5@2 c5@2 c5 bb4 ab4 bb4@2 ab4] [~@10 ab4 bb4] [c5@2 db5@3 eb5 bb4@5 ~] [~@10 ab4 bb4]>\",\"sound\":\"gm_trumpet\",\"gain\":0.5},{\"mini\":\"<~ [[ab4,c5]@3 [g4,bb4]@2 [f4,ab4] [g4,bb4]@2 ~@4] ~ [[ab4,c5]@3 [g4,bb4]@2 [f4,ab4] [g4,bb4]@2 ~@4]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.45}],\"bpm\":135,\"bars\":4,\"note\":\"bars are 12-slot (triplet 8ths). Source voice is SynthBrass 2 on both tracks; muted trumpet separates the answer here. F minor.\"}"
    },
    "key_tonic": "F",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_ttyd_bass_aaab",
      "cand_b4_vr_hgss_bass_drumfill"
    ],
    "confidence": "high"
  },
  "cand_b4_vr_btoads_dyad_holds": {
    "id": "cand_b4_vr_btoads_dyad_holds",
    "type": "melody_pattern",
    "source": "audios/vgmusic-full/snes/battle_toads__double_dragon_-_level_1.mid t3 (Choir Aahs), bars 8-11 transcribed verbatim",
    "why": "The chordTop law arriving from the corpus with its own numbers: this lead thickens 100% of its held notes and 19% of its short ones (measured per-bar), and the held-note dyads are parallel THIRDS (c5+e5 -> a4+c5 -> b4+d5) while every 16th run stays mono. That is chordTop's exact shape — but the corpus-wide default for long-note thickening is octave doubling (octave-family = 35-40% of all doubling intervals vs 16-24% thirds), so this 3rds version is the minority craft worth keeping deliberate. Sweep-wide: only half of thickened notes are the bar's LONGEST, and the median thickened note is 0.49 beats — chordTop's >=1-beat gate is twice as strict as practice.",
    "his_prior_words": "notice how melody is chord too not just one note (r17/D98 reel note)",
    "vibes": [
      "tense/battle",
      "groovy/stage",
      "heroic/battle"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[[c5,e5]@3 [a4,c5]@3 [b4,d5]@10] [~ e4 a4 c5 b4 c5 b4 g4@2 b3 d4 g4 f#4 g4 f#4 d4] [~ d4 f4 bb4 a4 f4 d4 c4@2 c4 d4 f4@2 d4 f4 g4] [~ e4 a4 c5 b4 c5 b4 g4@2 b3 d4 g4 f#4 g4 f#4 d4]>\",\"sound\":\"gm_choir_aahs\",\"bpm\":78,\"bars\":4,\"note\":\"source is Choir Aahs; the runs dip under the D93 G4 gender seam, so a string or epiano voice is the safe cast if the choir reads wrong.\"}"
    },
    "key_tonic": "G",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_absq_call_answer"
    ],
    "confidence": "medium"
  },
  "cand_b4_vr_boss1_fall_seam": {
    "id": "cand_b4_vr_boss1_fall_seam",
    "type": "device",
    "source": "audios/vgmusic-full/saturn/boss1.mid (House of the Dead, Boss) t1 lead + t3 comp, bars 30-33 — the fall recurs identically at bars 32/64/96/128/160, once per 32-bar cycle",
    "why": "'The synth descending quickly that appears' — measured: a 3-bar rising sequence (g5 -> c6 -> g6, each with the same push figure) spills into a two-octave descending 32nd-note scale on the LAST beat of the 32-bar cycle, landing exactly on the next section's downbeat (C -> Am). It appears once per cycle, always identical — a section-seam marker, not a lick. Corpus placement stats say this is the minority craft: only ~26% of fast runs land at seams (74% are mid-phrase decoration), and among instrument families only synth leads run DOWN more than up (564 down / 476 up) — the descending seam swoosh is specifically a synth-lead habit.",
    "his_prior_words": "and the synth descending quickly that appears (his boss-song exemplar)",
    "vibes": [
      "tense/boss",
      "excited/battle",
      "heroic/boss"
    ],
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g5@6 g5 ab5 bb5@8] [c6@6 c6 d6 e6@6 e6 f6] [g6@6 g6 ab6 bb6@4 [c7 b6 a6 g6] [f6 e6 d6 c6] [b5 a5 g5 f5] [e5 d5 c5 b4]] [a4@10 bb4@3 bb4@3]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.5},{\"mini\":\"<[[c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3] [[c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3] [[c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3 [c3,g3]@2 c3 c3] [[a2,e3]@2 a2 a2 a2 a2 a2 a2 a2 a2 [bb2,f3]@2 bb2 [bb2,f3]@3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":155,\"bars\":4,\"note\":\"the four bracketed 4-note groups in bar 3 are 32nds (four per 16th slot). Source also runs a C2 16th-note bass pedal under all of it.\"}"
    },
    "key_tonic": "F",
    "key_mode": "major",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_ttyd_bass_aaab",
      "cand_b4_vr_absq_call_answer"
    ],
    "confidence": "high"
  },
  "cand_b4_vr_soncha_rise_pickup": {
    "id": "cand_b4_vr_soncha_rise_pickup",
    "type": "device",
    "source": "audios/vgmusic-full/master/sonicchaosboss.mid (Sonic Chaos, Boss 2) t2 celesta + t4 comp, bars 11-13 — the rise bar recurs at bars 12/20/40/48, every 8 bars",
    "why": "The rising twin of the boss1 fall, from a bright chip boss: the celesta abandons its broken-chord ostinato for exactly ONE bar of two half-bar rising 16th sweeps (b5 up to c7, then again to b6) over the D pedal's last bar, then snaps back to the ostinato as Em lands. An 8-bar-period one-bar gesture — the ostinato itself never varies, the ENERGY does. Family stats behind the direction choice: chromatic-perc/bell runs go UP 310 vs 56 down, strings up 409 vs 214 — rising sweeps belong to bells and strings the way falls belong to synth leads.",
    "his_prior_words": "",
    "vibes": [
      "excited/boss",
      "playful/battle",
      "excited/festival"
    ],
    "question": "should a rise like this replace a drum fill at section returns in bright songs, or stack WITH one?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [b5 c6 d6 f6 g6 ab6 bb6 c7 b5 c6 d6 f6 g6 ab6 bb6 b6] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":3,\"note\":\"E minor; the rise fills the LAST bar of the D-pedal passage and lands on the Em ostinato. Source comp voice is a muted trumpet.\"}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_termina_addvoice"
    ],
    "confidence": "medium"
  },
  "cand_b4_vr_hgss_bass_drumfill": {
    "id": "cand_b4_vr_hgss_bass_drumfill",
    "addon_gain": 1.6,
    "type": "accomp_pattern",
    "source": "audios/vgmusic-full/ds/hgss_pokemon_wild_battle_kanto.mid (Kanto Wild Battle) t7 synth bass, bars 0-7 — fills recur at bars 1/5/9, period 4, transcribed verbatim",
    "why": "The exception that proves the pitch-side rule: same-slot corpus variation is 85% pitch-only, and when a bass DOES vary rhythm it does THIS — a staccato quarter-note pulse whose 4th beat bursts into 16ths every 4th bar, exactly a drummer's fill vocabulary on a pitched voice (the fill grows: seven 16ths first time, three the next). Bass-role rhythm-side variation is only 7% of variants corpus-wide, which is why one bar of it per 4 reads as an event. Zero pitch movement in 8 bars; the C pedal is the harmony's job (Cm -> Ab^7 -> G7 moves above it).",
    "his_prior_words": "",
    "vibes": [
      "excited/battle",
      "tense/battle",
      "urgent/mission"
    ],
    "question": "a drum-style 16th fill on the BASS every 4th bar with no drum kit present — does that carry the energy alone, or does it need the kit doubling it?",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3] [c2 ~@3 c2 ~@3 c2 c2 c2 c2 c2 c2 c2 ~] [c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3] [c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3] [c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3] [c2 ~@3 c2 ~@3 c2 ~@3 c2 c2 c2 ~] [c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3] [c2 ~@3 c2 ~@3 c2 ~@3 c2 ~@3]>\",\"sound\":\"gm_synth_bass_1\",\"bpm\":170,\"bars\":8,\"note\":\"C minor above it (Cm/Ab^7/G7); the pedal itself never moves.\"}"
    },
    "key_tonic": "C",
    "key_mode": "minor",
    "batch": 4,
    "pairs_with": [
      "cand_b4_vr_absq_call_answer",
      "cand_b4_vr_boss1_fall_seam"
    ],
    "confidence": "medium"
  },
  "cand_b5_tp_gijoe_rhythm": {
    "id": "cand_b5_tp_gijoe_rhythm",
    "type": "accomp_pattern",
    "source": "the RHYTHM of cand_vg_gijoe_quartal_comp (G.I. Joe comp, D minor), re-filled with plain key-aligned chord tones — his ask made a card",
    "why": "TEMPLATE — the gijoe groove with the clash removed: the exact stab rhythm he loves (chord(2) note rest chord(2) push chord(2) note rest note chord rest chord rest), but every stab is the bar's own triad and every single note a scale step, so it can ride ANY progression that matches the pattern. Realized here over Am -> F/G; the original quartal voicings are what clashed on other keys.",
    "his_prior_words": "I love the rhythm of this so take the rhythm and stuff too to apply for different chord progressions that follow the same pattern. feels playful and/or groovy. (lp_r5 pair note) / the rhythm and groove works as a layer but the notes clash. maybe aligned key or different notes (rl_r2 pair note)",
    "vibes": [
      "happy/menu",
      "excited/training"
    ],
    "question": "This is the gijoe rhythm as a TEMPLATE: same stabs, chord-tone fill per song. Does it keep the playful/groovy feel once the quartal color is gone, or was the color part of what you loved?",
    "template": {
      "rhythm": [
        "0(1/8)",
        "1/8",
        "1/4(1/8)",
        "3/8",
        "7/16(1/8)",
        "9/16",
        "11/16",
        "3/4",
        "7/8"
      ],
      "fill_policy": "stabs = the bar's triad; single notes = scale steps; no quartal color",
      "prevalence": "derived from his loved gijoe comp"
    },
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":120,\"bars\":2}"
    },
    "key_tonic": "A",
    "key_mode": "minor",
    "batch": 5,
    "pairs_with": [
      "cand_vg_gijoe_quartal_comp"
    ],
    "confidence": "high"
  },
  "cand_b5_sp_daydreamer_bass": {
    "id": "cand_b5_sp_daydreamer_bass",
    "type": "accomp_pattern",
    "source": "split of cand_b2_ly_daydreamer_walk_pair (his ask: \"should be separated into bass and guitar\") — the acoustic-bass walk alone",
    "why": "The daydreamer bass by itself: an E-pedal walk (e-d-e-g cells) that opens into a real climbing line in bar 4 (b-a-c-d-e-d-e-f). Split out so it can be varied and cast independently of the guitar.",
    "his_prior_words": "this should be separated into bass and guitar and should be varied so its not copied (andalusian pair note)",
    "vibes": [
      "happy/menu",
      "nostalgic/rest"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 a2@2 ~@2] [b2@2 a2@2 c3@2 d3@2 e3@2 d3@2 e3@2 f3@2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":130,\"bars\":4}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 5,
    "pairs_with": [
      "cand_b5_sp_daydreamer_guitar"
    ],
    "confidence": "high"
  },
  "cand_b5_sp_daydreamer_guitar": {
    "id": "cand_b5_sp_daydreamer_guitar",
    "type": "melody_pattern",
    "source": "split of cand_b2_ly_daydreamer_walk_pair — the nylon-guitar line alone, with his fix: the off-sounding first note (f4, a b9 against E minor) moved to the ROOT (e4) in all three statements",
    "why": "The daydreamer guitar phrase by itself, first note corrected f4 -> e4 per his note — the held b4 answers and the bar-4 a-b-a turn are untouched. Split out so bass and guitar can vary independently instead of always arriving as one copied pair.",
    "his_prior_words": "the first note in the guitar (and all repeats of that note) sounds kinda off. maybe change that to the root or something (lp_r5 pair note); should be separated into bass and guitar and should be varied so its not copied",
    "vibes": [
      "happy/menu",
      "nostalgic/rest"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[e4@2 d5@2 c5@2 b4@10] [e4@2 d5@2 c5@2 b4@10] [e4@2 d5@2 c5@2 b4@6 g4@4] [a4@4 b4@2 a4@10]>\",\"sound\":\"gm_acoustic_guitar_nylon\",\"bpm\":130,\"bars\":4}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 5,
    "pairs_with": [
      "cand_b5_sp_daydreamer_bass"
    ],
    "confidence": "high"
  },
  "cand_b5_sp_garden_horn_only": {
    "id": "cand_b5_sp_garden_horn_only",
    "type": "melody_pattern",
    "source": "split of cand_b2_pk_garden_horn_answer — the french-horn answer line alone (his ask: \"the layers should be separated\"; on andalusian: \"the horn fits but not the piano\")",
    "why": "The horn answer by itself: the rising b-e / g#-a dyad walk landing on the held [e3,e4] octave — the part he called a marching/determination vibe, without the accordion, bass and comp piano that came welded to it.",
    "his_prior_words": "I think the horn fits but not the piano since piano contrasts with the already existing piano (andalusian); fits - the horn adds like a marching/determination vibe (skybattle note, same voice); should be less loud though and the layers should be separated (lp_r5)",
    "vibes": [
      "happy/festival",
      "excited/training"
    ],
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[~@2 b3@2 e4@2 [b3,g#4]@2 [c#4,a4]@3 [b3,g#4]@3 [a3,f#4]@2] [[g#3,e4]@4 [a3,d#4]@4 [e3,e4]@8]>\",\"sound\":\"gm_french_horn\",\"bpm\":124,\"bars\":2}"
    },
    "key_tonic": "E",
    "key_mode": "major",
    "batch": 5,
    "pairs_with": [
      "cand_b2_pk_garden_horn_answer"
    ],
    "confidence": "high"
  },
"cand_b6_sp_soncha_base": {
    "id": "cand_b6_sp_soncha_base",
    "his_prior_words": "sounds very playful, but the vibraphone high part is very niche style when it goes up and off key and doesn't fit. these should be separated. whenever the vibraphone isn't increasing though it sounds good, just playful and casual",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "instrument_combo",
    "key_tonic": "E",
    "key_mode": "minor",
    "source": "split of cand_b4_vr_soncha_rise_pickup — the pendulum arps + muted-trumpet comp WITHOUT the chromatic rise bar (\"whenever the vibraphone isn't increasing though it sounds good\")",
    "why": "The playful half by itself: the celesta pendulum arpeggios (D pedal then the Em answer) over the muted-trumpet comp, the chromatic rise removed entirely.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":2}"
    }
  },
  "cand_b6_sp_soncha_rise_transition": {
    "id": "cand_b6_sp_soncha_rise_transition",
    "his_prior_words": "the vibraphone high part is very niche style when it goes up and off key and doesn't fit. these should be separated.",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "device",
    "key_tonic": "E",
    "key_mode": "minor",
    "source": "split of cand_b4_vr_soncha_rise_pickup — the chromatic rise bar ALONE, framed as what it is in the source: a one-bar transition into a new section",
    "why": "The rise isolated and scoped: one bar of climbing 16ths landing on the Em downbeat. In the source it happens ONCE, as a seam pickup — auditioning it inside a loop is what made it read off-key.",
    "scope": "transition/pickup use ONLY — the last bar before a section change, never looped material",
    "question": "Heard as a once-per-section seam pickup (bar 3 of 4 here, then the arrival), does the rise earn a place — or is the chromatic climb wrong for you even as a transition?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [b5 c6 d6 f6 g6 ab6 bb6 c7 b5 c6 d6 f6 g6 ab6 bb6 b6] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":4}"
    }
  },
  "cand_b6_sp_bkmansion_trill": {
    "id": "cand_b6_sp_bkmansion_trill",
    "his_prior_words": "this is a spooky vibe, and I like it... can be separated into the 4 different sections because the left hand is trying a bunch of different things as you can see which you can study and vary and build variations of",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "C",
    "key_mode": "minor",
    "source": "split 1 of cand_b4_gr_bkmansion_trill_build's left hand (\"can be separated into the 4 different sections because the left hand is trying a bunch of different things... study and vary and build variations of\")",
    "why": "LH texture 1: the semitone TRILL (g-f# 16ths) — bar 2 escapes up chromatically (g#-a-a#-b) into the next section. The spook is D118's law in miniature: the semitone lives INSIDE the repeated cell.",
    "scope": "spooky non-ambient (his words: \"very good spooky non-ambient music\") — use serum-like synths, not chip voices, to leave the pixel-VGM feel",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":2}"
    }
  },
  "cand_b6_sp_bkmansion_stab_triads": {
    "id": "cand_b6_sp_bkmansion_stab_triads",
    "his_prior_words": "the left hand is trying a bunch of different things as you can see which you can study and vary and build variations of",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "C",
    "key_mode": "minor",
    "source": "split 2 of cand_b4_gr_bkmansion_trill_build's left hand — the staccato triad 8ths, with the source's own variation curve (g -> g# -> g -> the F# planed triad)",
    "why": "LH texture 2: Cm triad stabbed on every 8th, and the source varies it EXACTLY the way your variation law asks — same rhythm, one voice moves (g to g#), then the whole triad planes down a semitone (F#-side) for the fourth bar.",
    "question": "This is the source's own variation scheme: one-voice move (bar 2), return (bar 3), whole-shape plane (bar 4). Is the semitone plane the spooky bar, or does the g# alone already do it?",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
    }
  },
  "cand_b6_sp_bkmansion_updown_arp": {
    "id": "cand_b6_sp_bkmansion_updown_arp",
    "his_prior_words": "the left hand is trying a bunch of different things as you can see which you can study and vary and build variations of",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "C",
    "key_mode": "minor",
    "source": "split 3 of cand_b4_gr_bkmansion_trill_build's left hand — the up-down 16th arpeggio, with the source's g/g# color swap and the F#-plane bar",
    "why": "LH texture 3: the Cm arp climbing to d#5 and folding back, twice per bar. Same variation curve as the stabs: the g lifts to g# (bar 2), returns (bar 3), then the whole cell planes to F# (bar 4).",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [c4 d#4 g#4 c5 d#5 c5 g#4 d#4 c4 d#4 g#4 c5 d#5 c5 g#4 d#4] [c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4 a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
    }
  },
  "cand_b6_sp_raining_lefthand": {
    "id": "cand_b6_sp_raining_lefthand",
    "his_prior_words": "this is literally an entire section of the piano from undertake. separate this, and dont use the melody but analyze why its relaxing and works for its rhythm and intervals and orders of intervals. left hand could be learn structurally and rhythm wise thats fine",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "F",
    "key_mode": "minor",
    "source": "split of cand_ut_raining_jazz_walk — the LEFT HAND alone (\"separate this, and dont use the melody... left hand could be learn structurally and rhythm wise thats fine\")",
    "why": "The rain LH by itself, structurally: a rootless voicing ON the downbeat only once per two bars, everything else single low notes in wide dotted arcs (c2-c3 octave leaps, g1-g2), each bar's last notes walking into the next chord. Why it relaxes, measured: 3-4 attacks/bar, no two consecutive strikes in the same octave, and every phrase ends approaching — never landing hard.",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[[eb3,g3,bb3] ~@5 c3@6 g2@4] [c2@6 c3@6 f2@2 ~ g2] [[bb2,d3,f3]@6 g2@6 d2@4] [g1@6 g2@6 d2@2 eb2 bb2]>\",\"sound\":\"piano\",\"bpm\":110,\"bars\":4,\"gain\":0.7}"
    }
  },
  "cand_b6_sp_ctr_chord_stabs": {
    "id": "cand_b6_sp_ctr_chord_stabs",
    "his_prior_words": "the chords themselves sounds fine but should be separated into multiple sections... they sound good though as layers.",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "E",
    "key_mode": "minor",
    "source": "split 1 of cand_b4_gr_ctr_boss_staircase (\"should be separated into multiple sections since there's a part with chord, a part with synths, a part with trumpets... they sound good though as layers\") — the epiano chord stabs",
    "why": "The chord part alone: syncopated triad stabs (B, G, A) landing off the downbeat, with the driving bass riff under them so the stabs' placement is audible.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@4 [b3,f#4,b4]@2 ~@6 [b3,f#4,b4]@3 ~@1] [~@4 [g3,d4,g4]@3 ~@5 [g3,d4,g4]@4] [[a3,e4,a4]@2 ~@4 [a3,e4,a4]@3 ~@3 [a3,e4,a4]@3 ~@1] [~@4 [g3,d4,g4]@3 ~@5 [g3,d4,g4]@4]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5},{\"mini\":\"<[b2@3 ~@1 b2 ~@1 b2@3 ~@1 b2@3 ~@1 b2 ~@1] [b2 ~@1 b2@3 ~@1 b2@2 g2@3 ~@1 f#2@4] [b2@3 ~@1 b2 ~@1 b2@3 ~@1 b2@3 ~@1 b2 ~@1] [b2 ~@1 b2@3 ~@1 b2@2 g2@3 ~@1 f#2@4]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.65}],\"bpm\":140,\"bars\":4}"
    }
  },
  "cand_b6_sp_ctr_saw_theme": {
    "id": "cand_b6_sp_ctr_saw_theme",
    "his_prior_words": "there's a part with chord, a part with synths, a part with trumpets. all different. they sound good though as layers.",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "melody_pattern",
    "key_tonic": "E",
    "key_mode": "minor",
    "source": "split 2 of cand_b4_gr_ctr_boss_staircase — the sawtooth theme alone over the bass",
    "why": "The synth part alone: the held-note theme (e4... b3 / a3-b3 rocking) that the source hands to the saw when the arrangement peaks.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[e4@6 ~@2 e4@5 ~@1 b3@2] [a3@2 b3@2 a3@2 b3@7 ~@3] [d4@6 ~@2 d4@5 ~@1 a3@2] [g3@2 a3@2 g3@2 a3@6 g3@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.5},{\"mini\":\"<[e3@6 ~@2 e3@5 ~@1 b2@2] [a2@2 b2@2 a2@2 b2@7 ~@3] [d3@6 ~@2 d3@5 ~@1 a2@2] [g2@2 a2@2 g2@2 a2@6 g2@4]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6}],\"bpm\":140,\"bars\":4}"
    }
  },
  "cand_b6_sp_topgear_riff_only": {
    "id": "cand_b6_sp_topgear_riff_only",
    "his_prior_words": "sounds good, but remove the silence bruh. moreover separate the two (they match but shouldn't always be together).",
    "vibes": [],
    "batch": 6,
    "pairs_with": [],
    "confidence": "high",
    "type": "accomp_pattern",
    "key_tonic": "E",
    "key_mode": "minor",
    "source": "split of cand_b4_gr_topgear_riff_octave_copy (\"separate the two (they match but shouldn't always be together)\") — the riff alone; the original card now carries riff + copy with no leading silence",
    "why": "The Top Gear driving riff by itself, so the +12 copy is a CHOICE (tick both cards) rather than welded on.",
    "render": {
      "kind": "note_mini",
      "spec": "{\"mini\":\"<[e2@2 ~@1 e2 e2@2 e2@4 e2@2 e2@2 g2@2] [e2@2 e2@2 e2@2 e2@2 g2@2 a2@2 a2@2 a2@2] [d2@3 d2 d2@2 d2@4 d2@2 d2@2 c2@2] [d2@2 d2@2 d2@2 d2@2 g2@2 a2@2 g2@2 a2@2]>\",\"sound\":\"gm_synth_bass_1\",\"bpm\":132,\"bars\":4,\"gain\":0.75}"
    }
  },
  "cand_b6_dv_faxanadu_companion_return": {
    "id": "cand_b6_dv_faxanadu_companion_return",
    "type": "device",
    "source": "audios/vgmusic-full/nes/fxn-pwrd.mid (Faxanadu — Password Screen, NES) bars 1-8 + 13-24 verbatim, whole mix -12 semitones for audition register (source melody sits e6-e7); the only cut is bars 9-12, an exact repeat of bars 5-8",
    "why": "A complete 20-bar development scheme measured off one 3-voice NES song, mechanisms in order: (1) A = melody + broken-octave acc alone; (2) A repeats EXACTLY and a companion line enters in parallel 6ths/3rds below — the corpus way to add 'a layer with its own melody' is on the repeat, not at bar 1 (+layer = 24.0% of 8,192 measured section returns, the #1 active transform); (3) third A: the companion goes double-time (running 8ths) while melody stays frozen and the acc DROPS AN OCTAVE to make room (register reallocation on the busy pass), and the 4th bar becomes a turnaround with a b4-b4 pickup into B (turnaround_alt = 29.2% of loop-repeat seams, the #1 seam device); (4) B contrast: harmony leaves Em for E-major/Am/D/G#^7 descending-fifths, acc switches broken-octaves -> arpeggio 8ths (a bridge with new harmony + changed figure = 36.4% of 717 well-segmented songs), then cadences home on B7. Full form of the source is A A A A B8 twice.",
    "his_prior_words": "I want more layers with their own melody man thats what ive been saying (r18, five cards)",
    "vibes": [
      "nostalgic/rest",
      "calm/night",
      "mysterious/manor"
    ],
    "scope": "the SCHEME (enter-on-repeat, double-time third pass, turnaround into a figure-changing bridge) is the candidate; the tune itself is demo material",
    "question": "This is how the corpus adds a companion: NOT from bar 1 — the section plays clean once, then repeats byte-identical with the new line added, then the new line doubles its speed on pass 3. Does the enter-on-repeat rule beat our current companion (which is present from the first bar of the section)? And is the double-time third pass a keeper or already too busy?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[e5@2 e5@2 d#5 ~ e5 ~ f#5@2 f#5@2 b5 ~ g5@2] [~@4 f#5 ~ g5 ~ a5@2 a5@2 d6 ~ b5@2] [~@6 g5 ~ c6 ~ b5 ~ a5 ~ g5 ~] [a5@6 f#5 ~ b5 ~ a5 ~ g5 ~ f#5 ~] [e5@2 e5@2 d#5 ~ e5 ~ f#5@2 f#5@2 b5 ~ g5@2] [~@4 f#5 ~ g5 ~ a5@2 a5@2 d6 ~ b5@2] [~@6 g5 ~ c6 ~ b5 ~ a5 ~ g5 ~] [a5@6 f#5 ~ b5 ~ a5 ~ g5 ~ f#5 ~] [e5@2 e5@2 d#5 ~ e5 ~ f#5@2 f#5@2 b5 ~ g5@2] [~@4 f#5 ~ g5 ~ a5@2 a5@2 d6 ~ b5@2] [~@6 g5 ~ c6 ~ b5 ~ a5 ~ g5 ~] [a5 ~ g5 ~ f#5 ~ b5@6 b4@2 b4@2] [b5 ~ b5 ~ b5 ~ b5 ~ b5@2 b5@2 d6@2 c6@2] [~@8 c6 ~ b5 ~ a5 ~ g5 ~] [f#5@2 f#5@2 e6@2 e6@2 d6@2 d6@2 a5@2 a5@2] [c6@6 b5@2 b5@3 ~ c6 ~ d6 ~] [e6@6 g5 ~ g5@8] [d6@2 d6@2 c6@2 c6@2 g5@2 g5@2 a5@2 a5@2] [b5@8 ~@3 a5 ~ g5 ~@2] [f#5@2 f#5@4 ~@10]>\",\"sound\":\"gm_lead_1_square\",\"gain\":0.42},{\"mini\":\"<[~@16] [~@16] [~@16] [~@16] [g4@2 g4@2 f#4 ~ g4 ~ a4@2 a4@2 f#4 ~ b4@2] [~@4 a4 ~ b4 ~ c5@2 c5@2 f#5 ~ d5@2] [~@6 b4 ~ e5 ~ d5 ~ c5 ~ b4 ~] [e5@6 c#5 ~ d#5 ~ c#5 ~ b4 ~ a4 ~] [g4 ~ e4 ~ f#4 ~ g4 ~ a4 ~ f#4 ~ a4 ~ b4 ~] [d4 ~ g4 ~ a4 ~ b4 ~ c5 ~ a4 ~ f#5 ~ d5 ~] [g4 ~ b4 ~ g4 ~ b4 ~ e5 ~ d5 ~ c5 ~ b4 ~] [c#5 ~ e5 ~ c#5 ~ d#5@2 d#5@2 g4 ~ f#4@2 f#4@2] [g#5 ~ g#5 ~ g#5 ~ g#5 ~ g#5@2 g#5@2 b5@2 a5@2] [~@8 a5 ~ g5 ~ f#5 ~ e5 ~] [d5@2 d5@2 c6@2 c6@2 a5@2 a5@2 f#5@2 f#5@2] [g#5@6 g5@2 g5@3 ~ a5 ~ b5 ~] [c6@6 e5 ~ e5@2 e5@2 c5 ~ e5 ~] [a5 ~ d5 ~ a5 ~ c5 ~ e5 ~ g4 ~ e5 ~ a4 ~] [e5@8 ~@3 f#5 ~ e5 ~@2] [d#5@2 d#5@4 ~@10]>\",\"sound\":\"gm_lead_3_calliope\",\"gain\":0.3},{\"mini\":\"<[e3@2 e4@2 b3@2 e3@2 f#3@2 e4@2 d#4@2 b3@2] [g3@2 e4@2 b3@2 e3@2 a3@2 g4@2 e4@2 f#3@2] [g3@2 g4@2 d4@2 g3@2 c3@2 c4@2 g3@2 c3@2] [f#3@2 f#4@2 c#4@2 f#3@2 b3@2 d#4@2 f#4@2 b3@2] [e3@2 e4@2 b3@2 e3@2 f#3@2 e4@2 d#4@2 b3@2] [g3@2 e4@2 b3@2 e3@2 a3@2 g4@2 e4@2 f#3@2] [g3@2 g4@2 d4@2 g3@2 c3@2 c4@2 g3@2 c3@2] [f#3@2 f#4@2 c#4@2 f#3@2 b3@2 d#4@2 f#4@2 b3@2] [e2@2 e3@2 b2@2 e2@2 f#2@2 e3@2 d#3@2 b2@2] [g2@2 e3@2 b2@2 e2@2 a2@2 g3@2 e3@2 f#2@2] [g2@2 g3@2 d3@2 g2@2 c2@2 c3@2 g2@2 c2@2] [f#2@2 c#3@2 e3@2 b2@4 b2@2 c3@2 b2@2] [e3@2 b3@2 e4@2 b3@2 e3@2 g#3@2 b3@2 e3@2] [a2@2 c3@2 a3@2 e3@2 a2@2 c3@2 e3@2 a3@2] [d2@2 a2@2 d3@2 a2@2 d2@2 f#2@2 a2@2 d3@2] [d#3@2 c3@2 g#2@2 g2@4 d3@2 g3@2 d3@2] [c3@2 e3@2 g3@2 c4@2 g3@2 e3@2 c3@2 g2@2] [a2@2 c3@2 e3@2 a3@2 a3@2 e3@2 c3@2 a2@2] [f#2@2 a2@2 c3@2 e3@2 f#3@3 e3@2 c3@3] [b2@2 ~@2 b3 [c4,b3] b3@3 ~ a3@2 g3@2 f#3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":112,\"bars\":20}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_tailcave_sequence_climb"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_tailcave_sequence_climb": {
    "id": "cand_b6_dv_tailcave_sequence_climb",
    "type": "device",
    "source": "audios/vgmusic-full/gameboy/lalev1.mid (Link's Awakening — Tail Cave, Game Boy) bars 1-12 verbatim, 2 voices, no cuts",
    "why": "Escalation by transposition instead of layers, measured: 4-bar phrase in Bm; the SAME phrase up a whole step (sequence-return = 11.2% of 8,192 returns); then the phrase LIQUIDATES to 1-bar fragments planed up by SEMITONE (e-f-f#) with the peak note climbing d6-d#6-e6; then a breath bar — melody silent, bass alone on F# (the dominant) — before the loop re-enters (dominant_approach = 12.7% of section-change seams; 'thin' = 5.6%). Three escalation gears in 12 bars with only 2 voices, no drums.",
    "his_prior_words": "",
    "vibes": [
      "mysterious/catacombs",
      "tense/dungeon",
      "dark/cave"
    ],
    "question": "The tension here is pure TRANSPOSITION: same cell, planed up a step, then chopped to 1-bar fragments rising by semitone into the dominant. The engine currently varies sections by rewriting intervals/rhythm (D97 composite) but never by planing a whole phrase. Is this scheme a better fit for dungeon/tense lanes than interval rewrites — and is the empty breath bar before the return a feature (suspense) or a hole?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[b4@2 c#5@2 d5@2 a5@3 ~@7] [b4@2 c#5@2 d5@2 g#5@3 ~@7] [b4@2 c#5@2 d5@2 g5@3 ~@7] [b4@2 c#5@2 d5@2 g#5@3 ~@7] [c#5@2 d#5@2 e5@2 b5@3 ~@7] [c#5@2 d#5@2 e5@2 a#5@3 ~@7] [c#5@2 d#5@2 e5@2 a5@3 ~@7] [c#5@2 d#5@2 e5@2 a#5@3 ~@7] [e5@2 f#5@2 g5@2 d6@3 ~@7] [f5@2 g5@2 g#5@2 d#6@3 ~@7] [f#5@2 g#5@2 a5@2 e6@3 ~@7] [~@16]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.38},{\"mini\":\"<[b2 ~ b2 ~@7 b3@3 ~ b2 ~] [b2 ~ b2 ~@7 b3@3 ~ b2 ~] [b2 ~ b2 ~@7 b3@3 ~ b2 ~] [b2 ~ b2 ~@7 b3@3 ~ b2 ~] [c#3 ~ c#3 ~@7 c#4@3 ~ c#3 ~] [c#3 ~ c#3 ~@7 c#4@3 ~ c#3 ~] [c#3 ~ c#3 ~@7 c#4@3 ~ c#3 ~] [c#3 ~ c#3 ~@7 c#4@3 ~ c#3 ~] [e3 ~ e3 ~@7 e4@3 ~ e3 ~] [f3 ~ f3 ~@7 f4@3 ~ f3 ~] [f#3 ~ f#3 ~@7 f#4@3 ~ f#3 ~] [f#3 ~ f#3 ~@11 f#3 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55}],\"bpm\":90,\"bars\":12}"
    },
    "key_tonic": "B",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_wily_descent_arrival",
      "cand_b6_dv_faxanadu_companion_return"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_wily_descent_arrival": {
    "id": "cand_b6_dv_wily_descent_arrival",
    "type": "device",
    "source": "audios/vgmusic-full/nes/Wily1st1.mid (Mega Man — Wily Stage 1, NES) bars 1,3,5,7 + 9-12, all voices verbatim, -12 semitones; the intro states each descent step twice (identical bars) — the card keeps one bar per step, arrival section untouched",
    "why": "The mirror of the Tail Cave climb: a frozen 3-note cell (skip-skip-step arch) re-seated DOWN the andalusian ladder f#m - E - D - C# with a parallel line a 3rd below and a pulsing pedal descending with it; then the ARRIVAL — the cell does not stop, it becomes the accompaniment while pulse 1 switches role to long held notes (a5@16) on top. The intro cell re-roles into support instead of being replaced (his synthRise 'repeated intervals' device, but used as an intro that RESOLVES into the theme; 'sequence' transform measured at 11.2% of returns).",
    "his_prior_words": "some given intervals and it repeats those intervals over and over to convey energy (r30, synthRise ask)",
    "vibes": [
      "tense/fight",
      "excited/fight",
      "dark/citadel"
    ],
    "question": "Two-part hypothesis: (a) a rise-into-the-theme intro reads better when the SAME cell carries through the arrival as accompaniment (role swap) than when the intro material is discarded at the seam; (b) descending i-VII-VI-V under a frozen cell = tension even though everything is diatonic. True on your ear? Should synthRise sections hand their cell down to the acc instead of stopping?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~@2 a4@2 a4 b4@3 c#5@3 b4@2 a4@3] [~@2 g#4@2 g#4 a4@3 b4@3 a4@2 g#4@3] [~@2 f#4@2 f#4 g#4@3 a4@3 g#4@2 f#4@3] [~@2 f4@2 f4 f#4@3 g#4@3 f#4@2 f4@3] [a4@16] [~@10 a4@2 ~@2 g#4@2] [~@16] [~@10 g#4@2 ~@2 f#4@2]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.4},{\"mini\":\"<[~@2 f#4@2 f#4 g#4@3 a4@3 g#4@2 f#4@3] [~@2 e4@2 e4 f#4@3 g#4@3 f#4@2 e4@3] [~@2 d4@2 d4 e4@3 f#4@3 e4@2 d4@3] [~@2 c#4@2 c#4 d#4@3 f4@3 d4@2 c#4@3] [~@2 a4@2 a4 b4@3 c#5@3 b4@2 a4@3] [~@2 a4@2 a4 b4@3 c#5@3 b4@2 a4@3] [~@2 g#4@2 g#4 a4@3 b4@3 a4@2 g#4@3] [~@2 g#4@2 g#4 a4@3 b4@3 a4@2 g#4@3]>\",\"sound\":\"gm_lead_1_square\",\"gain\":0.32},{\"mini\":\"<[f#3@2 f#3@2 f#3@2 f#3@2 ~@2 f#3@2 f#3@2 f#3@2] [e3@2 e3@2 e3@2 e3@2 ~@2 e3@2 e3@2 e3@2] [d3@2 d3@2 d3@2 d3@2 ~@2 d3@2 d3@2 d3@2] [c#3@2 c#3@2 c#3@2 c#3@2 ~@2 c#3@2 c#3@2 c#3@2] [f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2] [f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2 f#3@2] [e3@2 e3@2 e3@2 e3@2 e3@2 e3@2 e3@2 e3@2] [e3@2 e3@2 e3@2 e3@2 e3@2 e3@2 e3@2 e3@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<[~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~ md_snare ~] [~@4 md_snare ~@7 md_snare ~@3] [~@4 md_snare ~@7 md_snare ~ md_snare ~]>\",\"sound\":\"md_snare\",\"gain\":0.55,\"kind\":\"s\"}],\"bpm\":150,\"bars\":8}"
    },
    "key_tonic": "F#",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_tailcave_sequence_climb"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_chemplant_seam_kit": {
    "id": "cand_b6_dv_chemplant_seam_kit",
    "type": "device",
    "source": "audios/vgmusic-full/genesis/duo_chplantdynamic.mid (Sonic 2 — Chemical Plant Zone Remix 2) bars 3-6 verbatim; drum transcription drops the sample-doubling layers (clap doubling every snare, rimstick doubling every kick) and the fill bar's claves/shaker/whistle extras — every onset SLOT is verbatim",
    "why": "One bar carrying four seam devices at once, each independently common in 8,447 measured section-change seams: the stabs go TACET for the whole fill bar (thin = 5.6%), the kit erupts into a every-16th tom cascade descending hi->lo with a snare wall at the end (drumfill = 5.9%), the bass enters mid-fill walking chromatically c#-d-d#-e up into the downbeat (pickup run; 10.2% run up), and the landing bar restarts the groove with an open-hat crash stack on beat 1 (crash_landing = 14.6%, the #2 device). The engine writes NONE of these — its sections butt-splice.",
    "his_prior_words": "changes not just in strict section bar, and also changes an a unique way (r17, not yet built)",
    "vibes": [
      "excited/fight",
      "energetic/stage",
      "tense/lab"
    ],
    "question": "Four seam devices stacked: stabs cut + tom fill + chromatic bass walkup + crash on the landing. Is the full stack the right dose for energetic lanes, or should the engine roll 1-2 of the four per seam? Which single device does the most work for your ear when you A/B the fill bar against a plain bar?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[b4,e5,g5] ~@3 [b4,e5,g5] [b4,e5,g5] [b4,e5,g5] [b4,e5,g5] ~@8] [~@16] [[b4,e5,g5] ~@3 [b4,e5,g5] [b4,e5,g5] [b4,e5,g5] [b4,e5,g5] ~@6 [b4,e5,g5] [b4,e5,g5]] [~@2 [b4,e5,g5] [b4,e5,g5] ~@2 [b4,e5,g5] [a4,d5,f#5,a5]@8 ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[~@16] [e3 e3 c#3@6 d2 d2 d3 d3 d#2 d#2 d#3 d#3] [e2 e2 e3 e3 e2 e2 e3 e3 e2 e2 e3 e3 e2 e2 e3 e3] [e2 e2 e3 e3 e2 e2 e3 e3 e2 e3 c#2 c#3 d2 d3 d#2 d#3]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<[[md_kick,md_hat] md_hat [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] md_hat [md_hat,md_ohat] md_hat md_hat [md_kick,md_hat] [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] md_hat [md_hat,md_ohat] [md_hat,vc_tom_hi]] [[md_kick,md_hat,vc_tom_hi] [md_kick,md_hat,vc_tom_hi] [md_snare,md_hat,md_ohat] [md_snare,md_hat,vc_tom_hi] [md_kick,md_hat] [md_kick,md_hat,vc_tom_hi] [md_snare,md_hat,md_ohat,vc_tom_hi] [md_snare,md_hat] [md_hat,vc_tom_hi] [md_kick,md_hat,vc_tom_hi] [md_hat,md_ohat] [md_kick,md_snare,md_hat,vc_tom_lo] [md_snare,md_hat,vc_tom_lo] [md_snare,md_hat,vc_tom_lo] [md_snare,md_hat,vc_tom_lo,md_ohat] [md_snare,md_hat,vc_tom_lo]] [[md_kick,md_hat,md_ohat] md_hat [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] md_hat [md_hat,md_ohat] md_hat md_hat [md_kick,md_hat] [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] md_hat [md_hat,md_ohat] md_hat] [[md_kick,md_hat] md_hat [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] md_hat [md_hat,md_ohat] md_hat md_hat [md_kick,md_hat] [md_hat,md_ohat] [md_kick,md_hat] [md_snare,md_hat] [md_snare,md_hat] [md_hat,md_ohat] [md_snare,md_hat]]>\",\"sound\":\"md_kick\",\"gain\":0.5,\"kind\":\"s\"}],\"bpm\":150,\"bars\":4}"
    },
    "key_tonic": "E",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_vectorman_stagger_strip"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_goron_selective_drop": {
    "id": "cand_b6_dv_goron_selective_drop",
    "type": "device",
    "source": "audios/vgmusic-full/n64/goron.mid (Ocarina of Time — Goron City) bars 31-34 + 38-39 + 42-43 verbatim (the drop runs 9 bars in source; card keeps its entry, its middle with the log-drum chatter entry, and the melody return; GM cuica 78/79 -> vc_log_lo/vc_log_hi)",
    "why": "How a real drop works, against the engine's own defect (r32: breakdown cut the WHOLE base mix with a 0/1 mask, 12 of 16 songs): Goron City strips ONLY the melody and the answer dyads; the marimba vamp, the offbeat d6 ping and the conga pulse all keep running (drop_rebuild = 16.1% of 950 energy arcs, and the drop window keeps 3 of 5 layers), then NEW percussion — cuica chatter — enters DURING the drop so the ear has something fresh to follow before the melody returns. The drop is a texture rotation, not silence.",
    "his_prior_words": "there doesn't have to be a beat drop in every song ffs; the piano disappears ... abrupt (r32, six cards)",
    "vibes": [
      "happy/festival",
      "jungle/village",
      "excited/training"
    ],
    "scope": "the selective-strip rule (keep the groove floor + inject one new element mid-drop), not the Goron vamp itself",
    "question": "Your r32 cards said the engine's breakdowns are abrupt and overused. This is the reference version: melody out, floor STAYS, and a new percussion voice enters halfway through the drop. If breakdowns keep the vamp+pulse and add one fresh element like this, do they earn their place back — or do you want drops rarer regardless of how they're built?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[b4@6 bb4@10] [b4@6 bb4@10] [~@16] [~@16] [~@16] [~@16] [b4@6 bb4@10] [b4@6 bb4@10]>\",\"sound\":\"gm_ocarina\",\"gain\":0.45},{\"mini\":\"<[~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2] [~@12 d6@2 d6@2]>\",\"sound\":\"gm_celesta\",\"gain\":0.3},{\"mini\":\"<[e4@2 g3@2 ~@2 g3@2 c4@2 g3@2 ~@2 g3@2] [e4@2 g3@2 ~@2 g3@2 c4@2 ~@2 bb3@2 c4@2] [e4@2 c4@2 ~@2 g3@2 bb3@2 c4@2 ~@4] [e4@2 g3@2 ~@2 g3@2 c4@2 g3@2 ~@2 g3 g3] [e4@2 c4 g3@3 g3@2 bb3@2 c4@2 ~@4] [e4@2 c4 g3@3 c4@2 bb3@2 c4@2 ~@3 bb3] [e4@2 c4 g3@3 g3@2 bb3@2 c4@2 ~@4] [e4@2 c4 g3@3 c4@2 bb3@2 c4@2 ~@3 bb3]>\",\"sound\":\"gm_marimba\",\"gain\":0.5},{\"mini\":\"<[~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5] [~@4 vc_conga_mute ~@5 vc_conga_mute ~@5]>\",\"sound\":\"vc_conga_mute\",\"gain\":0.55,\"kind\":\"s\"},{\"mini\":\"<[~@16] [~@16] [~@16] [~@16] [vc_log_hi ~ vc_log_lo ~@3 vc_log_lo ~ vc_log_hi ~ vc_log_hi ~@5] [~@2 vc_log_lo ~ vc_log_hi ~ vc_log_lo ~ vc_log_hi ~ vc_log_hi ~@5] [~@2 vc_log_hi ~ vc_log_lo ~ vc_log_lo ~ vc_log_lo ~ vc_log_hi ~@5] [vc_log_hi ~ vc_log_lo ~@3 vc_log_lo ~ vc_log_lo ~ vc_log_hi ~@5]>\",\"sound\":\"vc_log_hi\",\"gain\":0.45,\"kind\":\"s\"}],\"bpm\":114,\"bars\":8}"
    },
    "key_tonic": "G",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_chemplant_seam_kit"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_vectorman_stagger_strip": {
    "id": "cand_b6_dv_vectorman_stagger_strip",
    "type": "device",
    "source": "audios/vgmusic-full/genesis/Disco.mid (Vectorman — Disco) bars 1-12 verbatim, all voices",
    "why": "The staircase build done as pure scheduling, one layer per 2 bars, measured: octave-bounce bass ALONE (sounding from beat 1 — no silent intro); four-on-floor kick joins at bar 3; at bar 4 a 4x16th shaker pre-roll ANNOUNCES the next entry; bar 5 doubles the bass in 16ths (double-time doubling, not a new line) + shaker backbeats; bars 9-10 the whole stack planes down to Db (bVI) and back — variation by transposing the LOOP, zero new material; bar 12 strips everything to solo 16th shaker for one bar as the gate into the next section (staircase = 8.1% of arcs; drumcut = 2.0% of seams). Every entry lands on a 2-bar boundary and each is announced by percussion.",
    "his_prior_words": "its silence for like the first half bruh (batch-5 audition note); the second section randomly got louder (r1)",
    "vibes": [
      "energetic/stage",
      "excited/fight",
      "happy/menu"
    ],
    "question": "Two rules to verify: (a) a new layer every 2 bars with a 1-beat shaker pre-roll announcing it — does the pre-roll make the entries feel intentional instead of random? (b) the bar of SOLO shaker as the section gate: is one stripped timekeeper bar an acceptable seam in an energetic song, or does it read as the mix breaking?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 f2@2 f3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 ab2@2 ab3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 f2@2 f3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 ab2@2 ab3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 f2@2 f3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 ab2@2 ab3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 f2@2 f3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 ab2@2 ab3@2] [db2@2 db3@2 db2@2 db3@2 db2@2 db3@2 db2@2 db3@2] [db2@2 db3@2 db2@2 db3@2 db2@2 db3@2 eb2@2 eb3@2] [f2@2 f3@2 f2@2 f3@2 f2@2 f3@2 f2@2 f3@2] [~@16]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@16] [~@16] [~@16] [~@16] [f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3] [f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3 ab2 ab2 ab3 ab3] [f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3] [f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3 ab2 ab2 ab3 ab3] [db2 db2 db3 db3 db2 db2 db3 db3 db2 db2 db3 db3 db2 db2 db3 db3] [db2 db2 db3 db3 db2 db2 db3 db3 db2 db2 db3 db3 eb2 eb2 eb3 eb3] [f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3 f2 f2 f3 f3] [~@16]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.4},{\"mini\":\"<[~@16] [~@16] [md_kick ~@3 md_kick ~@3 md_kick ~@3 md_kick ~@3] [md_kick ~@3 md_kick ~@3 md_kick ~@3 [md_kick,vc_shaker] vc_shaker vc_shaker vc_shaker] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [md_kick ~@3 [md_kick,vc_shaker] ~@3 md_kick ~@3 [md_kick,vc_shaker] ~@3] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker]>\",\"sound\":\"md_kick\",\"gain\":0.55,\"kind\":\"s\"}],\"bpm\":140,\"bars\":12}"
    },
    "key_tonic": "F",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_chemplant_seam_kit",
      "cand_b6_dv_goron_selective_drop"
    ],
    "confidence": "high"
  },
  "cand_b6_dv_alien3_echo_holdmove": {
    "id": "cand_b6_dv_alien3_echo_holdmove",
    "type": "device",
    "source": "audios/vgmusic-full/master/Alien3-Level4.mid (Alien 3, Master System — Matt Furniss) bars 3-8 verbatim; bass -12 (source FM voices share one register); second voice is the SAME ostinato delayed one 16th, exactly as sequenced",
    "why": "Development with zero new material, 6 bars: a 16th ostinato holds two pitches (a#-b, a semitone rub) and MOVES only its third pitch per bar d-e-d-d#-d-e (the r22 holdMove rule arriving from an independent source); the entire second voice is the same ostinato ONE 16TH BEHIND (a written echo — Bucky O'Hare's credits does the same at one 8th, two independent sightings); the bass enters only at bar 3 stating the pump. Tension comes from the held semitone + the moving top note, not from any vertical stab.",
    "his_prior_words": "repetition is not the spook; the semitone inside the repeated cell is (D93 boiler-mushi law, engine-side)",
    "vibes": [
      "tense/lab",
      "industrial/construction",
      "mysterious/manor"
    ],
    "question": "The second voice here is literally the first voice delayed one 16th note — a written echo, no reverb. Does the echo read as depth/space to you (worth a standing device: clone a busy ostinato onto a quieter voice one 16th late), or does it just read as flamming? And does the top-note-only motion (d-e-d-d#) carry enough 'development' for a 6-8 bar tense section on its own?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3 d4] [a#3 b3 e4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4@2 a#3 b3 e4] [a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3 d4] [a#3 b3 d#4 a#3 b3 d#4 a#3 b3 d#4 a#3 b3 d#4@2 a#3 b3 d#4] [a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3 d4] [a#3 b3 e4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4@2 a#3 b3 e4]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.42},{\"mini\":\"<[d#4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3] [d4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4@2 a#3 b3] [e4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3] [d4 a#3 b3 d#4 a#3 b3 d#4 a#3 b3 d#4 a#3 b3 d#4@2 a#3 b3] [d#4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4 a#3 b3 d4@2 a#3 b3] [d4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4 a#3 b3 e4@2 a#3 b3]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3},{\"mini\":\"<[~@16] [~@16] [a#2@2 a#2 a#2 ~@2 g#2 a#2@2 a#2 a#2 a#2 ~@2 g#2@2] [b2@2 b2 b2 ~@2 g#2 b2@2 b2 b2 b2 ~@2 f#2@2] [g#2@2 g#2 g#2 ~@2 f#2 g#2@2 g#2 g#2 g#2 ~@2 f#2@2] [d3@2 d3 d3 ~@2 f#2 d3@2 d3 d3 d3 ~@2 g#2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5}],\"bpm\":128,\"bars\":6}"
    },
    "key_tonic": "Bb",
    "key_mode": "minor",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_wily_descent_arrival"
    ],
    "confidence": "medium"
  },
  "cand_b6_dv_mariogolf_push_arrival": {
    "id": "cand_b6_dv_mariogolf_push_arrival",
    "type": "device",
    "source": "audios/vgmusic-full/n64/mg64Trainingv2_0.mid (Mario Golf 64 — Training) bars 17-24 verbatim; melody -12 (source doubles it in two channels an octave apart; the card keeps the octave dyads of one channel)",
    "why": "The pre-chorus riser scheme: four bars of a 3+3+2+3+3+2 chord pulse (his tresillo, doubled) planing chromatically upward Dm - Eb - Gb/F - Ebm/Db while the bass octave-bounces each root, then the ARRIVAL: harmony settles onto a C pedal with an Em/F planing vamp (a C^7-family wash), the pulse relaxes, and the melody enters for the first time — octave-doubled, long notes. Energy rises by harmony+rhythm, then the arrival trades tension for the tune (arch/staircase family, 14.2% of arcs combined; 'pitchburst' push = 6.1% of change seams).",
    "his_prior_words": "notice how melody is chord too not just one note, and the melody is held not very jittery (r17/D98)",
    "vibes": [
      "calm/menu",
      "happy/task",
      "nostalgic/rest"
    ],
    "question": "The riser here is HARMONIC (chords plane up by step under one rhythm) and the payoff is the melody's FIRST entry, held notes, octave-doubled. When a song delays its melody, does 4 bars of rising chord-pulse make the entry land for you — or is 4 bars of no-melody already too long at 94bpm (the corpus caps pre-melody intros ~8 bars)?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[[f5,a5,c6]@3 [f5,a5,b5]@3 [f5,a5,c6]@2 [f5,a5,d6]@3 [f5,a5,c6]@3 [f5,a5,b5]@2] [[g5,bb5,d6]@3 [g5,bb5,c6]@3 [g5,bb5,d6]@2 [g5,bb5,eb6]@3 [g5,bb5,d6]@3 [g5,bb5,c6]@2] [[bb5,db6,f6]@2 [bb5,db6,f6]@3 [bb5,db6,f6]@2 [ab5,c6,g6]@5 [ab5,c6,eb6]@2 [ab5,c6,g6]@2] [[g5,bb5,f6]@2 [g5,bb5,f6]@3 [g5,bb5,f6]@2 [f5,ab5,eb6]@9] [[e5,g5,b5]@3 [e5,g5,a5]@3 [e5,g5,b5]@6 [e5,g5,a5]@2 [e5,g5,b5]@2] [[f5,a5,c6]@3 [f5,a5,b5]@3 [f5,a5,c6]@6 [f5,a5,b5]@2 [f5,a5,c6]@2] [[e5,g5,b5]@3 [e5,g5,a5]@3 [e5,g5,b5]@6 [e5,g5,a5]@2 [e5,g5,b5]@2] [[f5,a5,c6]@8 [f5,b5,d6]@8]>\",\"sound\":\"gm_epiano1\",\"gain\":0.42},{\"mini\":\"<[d2@4 d3@3 d3@2 d2 d2@2 d3@4] [eb2@4 eb3@3 eb3@2 eb2 eb2@2 eb3@4] [gb2@4 gb3@3 f3@2 f3 f2@2 f3@4] [eb2@4 eb3@3 db3@2 db3 ab2@2 db3@4] [c3@4 g3@3 c3@2 c3 c3@2 g3@4] [c3@4 g3@3 c3@2 c3 c3@2 g3@4] [c3@4 g3@3 c3@2 c3 c3@2 g3@4] [c3@4 g3@3 c3@2 c3 c3@2 g3@4]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@16] [~@16] [~@16] [~@16] [[b4,b5]@16] [[c5,c6]@8 [e5,e6]@8] [[g5,g6]@3 [e5,e6]@3 [c5,c6]@2 [b4,b5]@4 [a4,a5]@2 [b4,b5]@2] [[c5,c6]@8 [d5,d6]@8]>\",\"sound\":\"gm_celesta\",\"gain\":0.38}],\"bpm\":94,\"bars\":8}"
    },
    "key_tonic": "C",
    "key_mode": "major",
    "batch": 6,
    "pairs_with": [
      "cand_b6_dv_faxanadu_companion_return"
    ],
    "confidence": "medium"
  },
  "cand_b6_px_wiztest_guild_answer": {
    "id": "cand_b6_px_wiztest_guild_answer",
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/nes/Wiztest.mid (Wizards & Warriors 3 — vgmusic title 'Wizard's Guild Test'), dominant 2-bar loop with identical halves collapsed to 1 bar (97% of 32 drummed bars), ch9, 136bpm, all velocities a flat 100.",
    "why": "The same recipe as the three beats you called \"here's whats going on / tutorial / activity\" (ffmq/wily/skiphat), from a fourth game — and this one is literally a guild TEST theme. Kick states beats 1 and 3 plus ONE extra kick on the last 8th-triplet of beat 3 (the 'let' — the same displaced-triplet trick as the skiphat card, but on the kick); snare answers alone on 2 and 4; 5 onsets/bar; the biggest hole is a full beat. Nothing else — no hat, no cymbals, no carpet.",
    "his_prior_words": "",
    "vibes": [
      "happy/menu",
      "excited/training",
      "calm/shop"
    ],
    "scope": "activity/tutorial — 'here's whats going on / tutorial / activity' beats",
    "question": "Hypothesis: the 'tutorial/activity' feel = a kick STATEMENT on 1/3 + a snare ANSWER on 2/4 + real holes in the bar, at 5-8 onsets/bar with kit voices only — a conversation sparse enough to talk over. This groove matches that recipe from a different game (and its source is literally a 'guild test' theme). Does it land in the same 'here's what's going on / tutorial / activity' bucket for you, or does something else drive that category?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":136,\"bars\":1,\"onsets\":[\"0\",\"1/2\",\"2/3\",\"1/4\",\"3/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\"]}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_cw_evening_royalroad"
    ],
    "confidence": "high"
  },
  "cand_b6_px_bof_underworld_kickrun": {
    "id": "cand_b6_px_bof_underworld_kickrun",
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/snes/BoF-_Underworld_Theme.mid (Breath of Fire — 'Underworld'), dominant 2-bar loop with identical halves collapsed to 1 bar (97% of 36 drummed bars), ch9, 100bpm, flat v108.",
    "why": "A deliberate CONTROL for the activity recipe: the drum bar fits your 'tutorial/activity' recipe exactly — 6 onsets/bar, kit voices only, snare steady on 2 and 4, a beat-long hole — but with the ROLES swapped (the wily card keeps the kick stable and displaces the snare; here the snare is the stable half and the kick makes the move: beat 1, then a three-kick 16th run leaning into beat 3 at 7/16, 9/16, 5/8). And the source is an UNDERWORLD theme, i.e. the name predicts the opposite category.",
    "his_prior_words": "",
    "vibes": [
      "happy/menu",
      "mysterious/cave",
      "calm/shop"
    ],
    "scope": "activity/tutorial — name-opposed control (recipe says activity, source name says dungeon)",
    "question": "Hypothesis test with the name working AGAINST me: this bar follows the same Q&A-with-holes recipe as your 'here's whats going on / tutorial / activity' beats (roles swapped: stable snare, moving kick), but it comes from a dungeon theme. If the recipe is what drives the category, this should still read 'activity'. Does it — or does the kick run into beat 3 tip it somewhere else (tension/creep)?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":100,\"bars\":1,\"onsets\":[\"0\",\"7/16\",\"9/16\",\"5/8\",\"1/4\",\"3/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\"]}"
    },
    "batch": 6,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b6_px_boulderdash_sand_gallop": {
    "id": "cand_b6_px_boulderdash_sand_gallop",
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/nes/Sand_World.mid (Boulder Dash — 'Sand World'), dominant 2-bar loop with identical halves collapsed to 1 bar (99% of 88 drummed bars), ch9, 150bpm, flat v75.",
    "why": "Your 'minigame, high energy' reading on the camel-trot card measured as: all TOP end (zero kick), ~12 onsets/bar, one identical little cell stamped on every beat. This is the same species from a digging game with the cell turned around: snare ON each beat, hat double-tap answering on the 'and-a' — DUM-ka-ka four times a bar — where the trot was ka-ka-DUM (hat pair into a snare answer). No low voice anywhere, so it stays light however fast it runs.",
    "his_prior_words": "",
    "vibes": [
      "excited/training",
      "happy/menu",
      "desert"
    ],
    "scope": "minigame (high energy) — uniform top-end gallop cell, no low anchor",
    "question": "Hypothesis: 'minigame, high energy' = a uniform per-beat gallop cell in top-end voices ONLY (no kick, no weight) at ~12 onsets/bar — busy but light. Same ingredients as the camel trot, cell reversed (DUM-ka-ka vs ka-ka-DUM). Does it land 'minigame / high energy' too — i.e. is it the uniform light lattice that makes minigame, regardless of which voice leads the cell?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":150,\"bars\":1,\"onsets\":[\"0\",\"1/4\",\"1/2\",\"3/4\",\"1/8\",\"3/16\",\"3/8\",\"7/16\",\"5/8\",\"11/16\",\"7/8\",\"15/16\"],\"sounds\":[\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\"]}"
    },
    "batch": 6,
    "pairs_with": [],
    "confidence": "high"
  },
  "cand_b6_px_sonic2_vs_boombap": {
    "id": "cand_b6_px_sonic2_vs_boombap",
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/genesis/Sonic2re.mid (Sonic the Hedgehog 2 — the 'Vs. Results' screen of VERSUS mode), dominant 2-bar loop with identical halves collapsed to 1 bar (90% of 42 drummed bars), ch9, 120bpm, flat v100.",
    "why": "Your 'showdown / calm showdown of a rap battle' reading on the shadowrun card measured as: the KICK does the syncopated work in 16th pairs off the beat while the snare stays minimal on the backbeat. This bar has the same signature from a screen that is literally the results of a VERSUS match: kick pumps 8ths and doubles into 16th pairs on the 'and-a' of beats 1 and 3 (1/8+3/16, 5/8+11/16), each pair rolling into the snare crack on 2 and 4 — and the snare plays NOTHING else. 12 onsets/bar, 120bpm head-nod tempo.",
    "his_prior_words": "",
    "vibes": [
      "battle",
      "excited/training",
      "tense/lab"
    ],
    "scope": "showdown — syncopated kick 16th-pairs + bare backbeat = the rap-battle head-nod",
    "question": "Hypothesis: 'showdown' = the low end carrying the syncopation (kick 16th-pairs off the beat) while the snare stays bare on 2/4 — the boom-bap shape. This one adds a straight-8th kick pump under the same pairs. Does it still read 'showdown / rap battle', or does the extra kick drive push it toward plain 'fight/run' energy? (Locates whether the category needs the pairs, or the pairs plus space.)",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":120,\"bars\":1,\"onsets\":[\"0\",\"1/8\",\"3/16\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"11/16\",\"3/4\",\"7/8\",\"1/4\",\"3/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\"]}"
    },
    "batch": 6,
    "pairs_with": [],
    "confidence": "medium"
  },
  "cand_b6_px_smrpg_booster_stream": {
    "id": "cand_b6_px_smrpg_booster_stream",
    "type": "rhythm",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/snes/SMRPG_Booster_Tower-KMv1-1.mid (Super Mario RPG — 'Booster's Tower'), 2-bar loop (100% of 48 drummed bars), ch9, 116bpm. Source snare alternates v102/v76 on/off the beat; rendered flat, which makes the stream MORE uniform — uniformity is the mechanism under test.",
    "why": "Your 'mission received / clean / relaxing minigame' reading on the gradius card measured as: one voice runs an UNBROKEN even stream (no holes, no syncopation) while the kick just anchors — regularity at saturation reads mid-energy, not high. Same recipe here from a completely different game: snare marches every single 8th for the whole loop, kick anchors 1 / and-2 / 3, a stick answers on three offbeats, and a soft tambourine adds one two-tap turn at the bar 1 end that grows a third tap in bar 2 (the loop's only variation). ~16 onsets/bar yet nothing ever surprises.",
    "his_prior_words": "",
    "vibes": [
      "excited/training",
      "happy/menu",
      "battle"
    ],
    "scope": "mission-clean — unbroken even stream + plain anchor = 'clean' mid energy",
    "question": "Hypothesis: 'mission received / clean' = an unbroken even-8th stream (snare) over a plain kick anchor — total regularity, zero syncopation, so it saturates the bar without raising the stakes. The gradius card had this recipe; here it is from a playful tower theme, busier but just as regular. Does it read 'mission/clean/relaxing-minigame, mid energy, supports both directions' like the gradius one — confirming that regular saturation, not density, sets that category?",
    "render": {
      "kind": "rhythm_onsets",
      "spec": "{\"bpm\":116,\"bars\":2,\"onsets\":[\"0\",\"3/8\",\"1/2\",\"1\",\"11/8\",\"3/2\",\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"15/8\",\"1/4\",\"5/8\",\"7/8\",\"5/4\",\"13/8\",\"15/8\",\"3/4\",\"13/16\",\"13/8\",\"7/4\",\"29/16\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"md_stick\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\",\"vc_riq\"]}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_rl_r3_circle_dotted"
    ],
    "confidence": "high"
  },
  "cand_b6_px_outrun_breeze_shuttle": {
    "id": "cand_b6_px_outrun_breeze_shuttle",
    "type": "harmony",
    "key_tonic": "A",
    "key_mode": "major",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/master/Passing_Breeze.mid (Out Run — 'Passing Breeze', the cruising BGM), bars 30-33 measured note-by-note; the loop labeler reads the same A^7/D alternation across bars 26-41. 120bpm.",
    "why": "A becalmed two-chord shuttle from music written for literally driving past scenery: I^7 one bar, IV6 seven beats, then I^7 returns EARLY — anticipated on beat 4 of bar 3 (chordBeats 4/7/5, a sub-bar change per the r32 law). Measured voicings: the comp never plays the roots — it planes minor-triad upper structures (C#m over A = A^7's 3-5-7; F#m over D = D6/9) — and the bass closes the loop with a chromatic g#->a pickup. No V, no leading-tone cadence, so it can circle forever.",
    "his_prior_words": "",
    "vibes": [
      "calm/night",
      "happy/menu",
      "adventure"
    ],
    "scope": "timelapse / passive running mini game — the CALM-HARMONY half of the pair (per your shenightfall note: just piano = refreshing/calm; all layers on = timelapse)",
    "question": "Hypothesis from your shenightfall note: 'timelapse / passive running' is not a harmony — it is calm, circling harmony PLUS a complete groove stack; the same chords with layers off read refreshing/calm. Solo, does this anticipated I^7-IV6 shuttle read refreshing/calm? Then tick it with the Out Run stab groove (its sibling card) + your lofi/indie backbeat: does the combination flip it to 'timelapse / passive running minigame' the way shenightfall's full stack did?",
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"0:^7 5:6 0:^7\",\"family\":\"major\",\"tonic\":\"A\",\"bpm\":120,\"chordBeats\":[4,7,5]}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_b6_px_outrun_breeze_stabs",
      "cand_un_lofi_backbeat",
      "cand_un_indie_backbeat"
    ],
    "confidence": "high"
  },
  "cand_b6_px_outrun_breeze_stabs": {
    "id": "cand_b6_px_outrun_breeze_stabs",
    "type": "accomp_pattern",
    "key_tonic": "A",
    "key_mode": "major",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/master/Passing_Breeze.mid — ch0 FM bass + ch1 comp, bars 30-33 transcribed onset-for-onset (bass lifted +12 from source e1/a1/d2 for audibility, the chaotix-card precedent). The source holds the anticipated chord ~5 beats; here it rings only its cell — noted, the ONSET is the device.",
    "why": "The actual 'running' texture under the shuttle, and it is NOT a carpet: bass and comp lock the same syncopated stab rhythm — a dotted pair on beat 1 and beat 4 of the IV bar, the pair displaced to beat 3 in the next bar, then a near-silent breath bar where only the bass walks g#->a, then a bar that is one four-16th pickup RUN into the loop's top. Two voices, zero collisions with a backbeat's 2/4. If 'passive running' needs a steady 16th carpet, this stack should fail to produce it; if it needs a complete calm groove of any shape, this should work.",
    "his_prior_words": "",
    "vibes": [
      "calm/night",
      "happy/menu",
      "adventure"
    ],
    "scope": "timelapse / passive running mini game — the GROOVE-STACK half of the pair; discriminates carpet-vs-completeness",
    "question": "Hypothesis discriminator: shenightfall flipped to 'timelapse' under a straight 16th-shaker carpet; Out Run runs on syncopated STABS with a breath bar instead. Layered on its shuttle sibling + one of your backbeats: does stab-groove + calm harmony still read 'timelapse / passive running', or does that category specifically need the unbroken carpet? Either answer pins which half of the stack does it.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[~ ~ a2 a2 a2 a2 ~ ~ a2@3 a2 ~ ~ ~ ~] [d3@3 d3 ~@8 d3@3 d3] [~@8 d3@3 d3 ~@2 a2@2] [~@14 g#2 a2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<[~ ~ [g#3,c#4,e4] [g#3,c#4,e4] [g#3,c#4,e4] [g#3,c#4,e4] ~ ~ [g#3,c#4,e4]@3 [g#3,c#4,e4] ~ ~ ~ ~] [[f#3,a3,c#4]@3 [f#3,a3,c#4] ~@8 [f#3,a3,c#4]@3 [f#3,a3,c#4]] [~@8 [f#3,a3,c#4]@3 [f#3,a3,c#4] ~@2 [g#3,c#4,e4]@2] [~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4}],\"bpm\":120,\"bars\":4}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_b6_px_outrun_breeze_shuttle",
      "cand_un_lofi_backbeat",
      "cand_un_indie_backbeat"
    ],
    "confidence": "medium"
  },
  "cand_b6_px_ff6_troops_lockstep": {
    "id": "cand_b6_px_ff6_troops_lockstep",
    "type": "accomp_pattern",
    "key_tonic": "C",
    "key_mode": "minor",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/snes/FFVI_-_Troops_March_On.mid ('Troops March On'; the file declares 16/16, which is metrically the same 16-sixteenth bar as 4/4), ch2 low brass + ch8 horn + ch9 snare, bars 6-11 measured. 139bpm. Source snare roll fades v96->31; rendered flat. No melody is taken.",
    "why": "Your 'determination/marching' words have always landed on pitched material with an unwavering repeated pulse (the skybattle repeated-16th bass and tremolo, the castle-stamp brass, the chaotix stamps). This is that mechanism in its purest measured form: low brass, a horn an octave up and the military snare all strike the IDENTICAL stamp rhythm (1, 2, and-2, 3, 4, and-4) in lockstep, on the TONIC ONLY — the sole pitch events are a c#2 semitone LEAN on beat 4 of every second bar and a six-stroke snare roll under it, both pointing the march forward. Harmony is a static Cm pedal for 15 of every 16 half-bars.",
    "his_prior_words": "",
    "vibes": [
      "battle",
      "adventure",
      "tense/lab"
    ],
    "scope": "determination / marching — the RHYTHM half: lockstep tonic stamps, zero progression",
    "question": "Hypothesis: 'determination/marching' is made by an unwavering repeated-note stamp machine — same rhythm in every voice, tonic-only, with one semitone lean as the only motion — and needs NO chord progression at all. Does this read 'determination/marching' by itself? Its sibling card (the DQ4 wagon quarters) carries a real marching PROGRESSION with no stamps; between the two, which half is the category?",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ c2 ~ c2 ~ c2 ~ ~ ~ c2 ~ c2 ~] [c2 ~ ~ ~ c2 ~ c2 ~ c2 ~ ~ ~ c#2@4]>\",\"sound\":\"gm_trombone\",\"gain\":0.5},{\"mini\":\"<[c3@4 c3@2 c3@2 c3@6 ~@2] [~@8 c3@4 c#3@4]>\",\"sound\":\"gm_french_horn\",\"gain\":0.35},{\"mini\":\"<[vc_snare_mil ~ ~ ~ vc_snare_mil ~ vc_snare_mil ~ vc_snare_mil ~ ~ ~ vc_snare_mil ~ vc_snare_mil ~] [vc_snare_mil ~ ~ ~ vc_snare_mil ~ vc_snare_mil ~ vc_snare_mil ~ ~ ~ [vc_snare_mil!6]@4]>\",\"sound\":\"vc_snare_mil\",\"gain\":0.45}],\"bpm\":139,\"bars\":2}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_b6_px_dq4_wagon_quarters"
    ],
    "confidence": "high"
  },
  "cand_b6_px_dq4_wagon_quarters": {
    "id": "cand_b6_px_dq4_wagon_quarters",
    "type": "harmony",
    "key_tonic": "A",
    "key_mode": "minor",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/nes/Dw4wagonwheelmarch.mid (Dragon Quest IV — 'Wagon Wheel March'), bars 8-10 measured note-by-note: the two NES voices walk it in parallel 10ths (f2-a3, g2-b3, a2-c4) in flat-v127 quarters. 121bpm.",
    "why": "The other half of the determination question: a real MARCHING PROGRESSION with no stamp machine. Chords change at QUARTER level (the r32 chordBeats law — a chord does not have to last a bar): bVI-bVII-i-bVII stepwise walk in bar 1, then bVI leaning onto a half-bar V in bar 2 — the wagon-wheel 'turn'. In the source there are no block chords at all: the whole harmony is two voices in parallel 10ths pulsing quarters, which is why it marches instead of sits.",
    "his_prior_words": "",
    "vibes": [
      "adventure",
      "battle",
      "happy/menu"
    ],
    "scope": "determination / marching — the HARMONY half: quarter-level walking progression, no stamps",
    "question": "Hypothesis: a stepwise quarter-note walking progression (bVI-bVII-i-bVII, then bVI->V) supplies the 'marching' half of determination even played as plain chords. Solo, does this read 'march'? Then tick it with the FF6 lockstep sibling: stamps+walk together should be unmistakably 'determination/marching' if the category = stamp rhythm x walking harmony. Which of the three (rhythm alone / harmony alone / both) is the real trigger?",
    "render": {
      "kind": "degrees",
      "spec": "{\"degrees\":\"8b 10b 0:m 10b 8b 7\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":121,\"chordBeats\":[1,1,1,1,2,2]}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_b6_px_ff6_troops_lockstep"
    ],
    "confidence": "medium"
  },
  "cand_b6_px_swfairy_rotation_lattice": {
    "id": "cand_b6_px_swfairy_rotation_lattice",
    "type": "melody_pattern",
    "key_tonic": "D",
    "key_mode": "major",
    "source": "/Users/ethanchen/Documents/GitHub/motif-engine/audios/vgmusic-full/saturn/SW-FileMenu-Fairytheme.mid (Shining Wisdom — the file-select 'Fairy theme'), ch0 celesta bars 20-23 (shifted -12 from source octave 6 for browser register) + ch3 bass, 124bpm. Figuration only — a rotating broken triad is a pattern, not a tune (D30).",
    "why": "Your 'fairy-tale' label on the DQ pizz measured as: a plucked/bell lattice that increments and de-increments over gently oscillating harmony. Here is the same species from a file literally titled 'Fairy theme', with a different rotation mechanism: falling broken-triad 8ths on celesta where each bar starts the SAME triad one rotation later (top voice drifts g-c-f#-b), planed down a whole step every two bars (C triad -> B minor triad); under it the bass rises in bare FIFTHS (d-a-e, then e-b-f#, a quintal R-5-9 stack — no third anywhere) and drifts OFF the beat on alternate bars. No leading tone, nothing resolves; the two sonorities just alternate a whole step apart.",
    "his_prior_words": "",
    "vibes": [
      "calm/night",
      "happy/menu",
      "mysterious/space"
    ],
    "scope": "fairy-tale — bell lattice whose rotation drifts + whole-step planed harmony with no resolution",
    "question": "Hypothesis: 'fairy-tale' = a high plucked/bell lattice whose contour drifts by ROTATION (rise-and-fall without a destination) over two chords a whole step apart that never resolve — the DQ pizz had the pedal version, this is the rotation version from a second source. Does it land 'fairy-tale' for you? If yes, the mechanism generalizes past the pedal; if it reads 'mysterious/floaty' instead, the pedal anchor is what made DQ's feel like a story.",
    "render": {
      "kind": "stack_mini",
      "spec": "{\"parts\":[{\"mini\":\"<[g5 e5 c5 g5 e5 c5 g5 e5] [c5 g5 e5 c5 g5 e5 c5 g5] [f#5 d5 b4 f#5 d5 b4 f#5 d5] [b4 f#5 d5 b4 f#5 d5 b4 f#5]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d2@6 a2@6 e3@4] [~@2 d2@4 a2@4 e3@6] [e2@6 b2@6 f#3@4] [~@2 e2@4 b2@4 f#3@6]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5}],\"bpm\":124,\"bars\":4}"
    },
    "batch": 6,
    "pairs_with": [
      "cand_vg_dq_pizz_only"
    ],
    "confidence": "high"
  }
};
