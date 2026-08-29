// sample-pack-def.js — the local sample palette, single source of truth.
//
// Consumed by BOTH tiers so they play the same audio:
//   - scripts/build-sample-pack.mjs -> audition/sample-pack.js (mp3 data URIs
//     for the browser; lazy-loaded, file://-safe via a sibling <script> tag)
//   - src/lib/hq-instruments.js -> backend:'wav' entries (render-hq places the
//     ORIGINAL wavs at hap times, full quality)
//
// kind drives generator usage:
//   oneshot  play once, never looped (Ethan: "some are just sound effects that
//            you shouldnt loop and should only play once (like the relatively
//            short ones) like the transition risers and the crow")
//   loop     ambience bed — the generator re-triggers it every ~duration bars;
//            each trigger plays the file once through (both tiers)
//   beat     bpm-locked rhythm loop (4 bars at the named bpm)
//   hit      percussion one-shot with round-robin variants
//
// srcs are repo-root-relative. Wavs are gitignored (repo policy: audios/ and
// vendor/ carry no committed audio); the generated audition pack IS committed.
// durS is the measured source duration (librosa, 2026-08-27) — the generator
// needs it to schedule loop re-triggers without reading audio files.

const HX = (f) => `audios/horror-fx/${f}`;
const SM = (f) => `vendor/sfz/VCSL/Membranophones/Struck Membranophones/${f}`;
const SI = (f) => `vendor/sfz/VCSL/Idiophones/Struck Idiophones/${f}`;
const VP = (f) => `vendor/sfz/VSCO-2-CE/VSCO 1 Percussion/${f}`;
const VS = (f) => `vendor/sfz/VSCO-2-CE/${f}`;
const MD = (f) => `audios/miraleste/${f}`;

export const SAMPLE_PACK = {
  // ---- Ethan's horror pack (2026-08-27), sorted per his note ---------------
  // audibleS (r18/D99, his ask, verbatim "also the riser should be started a bit
  // later because there's a bit of silence after the sound effect (document
  // this)"): a riser is aligned by its END, and durS is the FILE length, not the
  // length of the sound. Measured on horror-riser.wav: 4.560s long, but the last
  // frame above 1% of peak is at 4.220s — 0.34s of trailing quiet that the
  // alignment was faithfully reserving space for, opening a hole between the
  // swell and the impact it is supposed to run into. Anything aligned to its own
  // tail should use audibleS where a file declares one.
  hx_riser: { kind: 'oneshot', durS: 4.6, audibleS: 4.22, srcs: [HX('horror-riser.wav')], note: 'transition riser — play once into a section boundary' },
  hx_crow: { kind: 'oneshot', durS: 7.4, srcs: [HX('horror-crow_40bpm_C_minor.wav')], note: 'crow caw + tail — play once, sparse' },
  // r16 (scary-voices, his answer: ["guitars"] / "just use the guitars" — the
  // witch cackle and the ghost-choir shimmer from the same pack were declined).
  // Decoded from his S.C.A.R.Y. AMK package: four clipped distorted-guitar
  // stabs, round-robined. These are RIPPED SNES audio, so they live under his
  // r16 licensing ruling — "local-only, never committed": the source wavs are
  // gitignored by audios/**/*.wav and audition/sample-pack.js is untracked.
  hx_gtr_stab: { kind: 'hit', durS: 0.5, srcs: [HX('hx_gtr_stab_1.wav'), HX('hx_gtr_stab_2.wav'), HX('hx_gtr_stab_3.wav'), HX('hx_gtr_stab_4.wav')], note: 'clipped distorted-guitar stab, 4-way round robin — the S.C.A.R.Y. crunch, for horror seams' },
  hx_stab_strings: { kind: 'oneshot', durS: 4.0, srcs: [HX('horror-strings.wav')], note: 'string cluster stab — accent/sting, play once' },
  hx_growl: { kind: 'oneshot', durS: 10.9, srcs: [HX('scary-evil-growl_C#_major.wav')], note: 'evil growl swell, builds then dies — play once' },
  hx_amb_static: { kind: 'loop', durS: 30.0, srcs: [HX('ambient-horror.wav')], note: 'steady bed, measured seamless (edge rms .01/.01, chroma sim .99)' },
  hx_amb_haunt_am: { kind: 'loop', durS: 23.6, keyNote: 'a', srcs: [HX('haunting-ambience_A_minor.wav')], note: 'A-minor bed, tail fades — the seam breathes' },
  hx_amb_haunt_dm: { kind: 'loop', durS: 57.3, keyNote: 'd', srcs: [HX('haunting-ambience_D_major.wav')], note: 'D bed, tail fades' },
  hx_amb_atmo: { kind: 'loop', durS: 105.4, srcs: [HX('horror-atmo-pad.wav')], note: 'long evolving pad bed' },
  hx_amb_future: { kind: 'loop', durS: 18.2, srcs: [HX('futuristic-horror-pad.wav')], note: 'sci-fi horror bed, fade-in/out edges' },
  hx_amb_mountain: { kind: 'loop', durS: 16.7, keyNote: 'd', srcs: [HX('horror-pad-mountains_115bpm_D_major.wav')], note: 'pad bed, D label' },
  hx_amb_industrial: { kind: 'loop', durS: 17.9, bpm: 107, srcs: [HX('industrial-horror-atmo_107bpm.wav')], note: 'industrial bed' },
  hx_amb_tv: { kind: 'loop', durS: 31.0, srcs: [HX('scary-distorted-tv_C#_major.wav')], note: 'distorted-TV noise texture (atonal — chroma sim 0)' },
  hx_amb_radio: { kind: 'loop', durS: 46.3, srcs: [HX('scary-distorted-radio.wav')], note: 'distorted-radio texture (atonal)' },
  hx_beat_sub140: { kind: 'beat', durS: 6.86, bpm: 140, srcs: [HX('hard-techno-rumble-sub-bass_140bpm.wav')], note: '4 bars @140 — rumbling sub loop' },
  hx_beat_sub105: { kind: 'beat', durS: 9.14, bpm: 105, keyNote: 'd', srcs: [HX('deep noisy-sub_105bpm_D_minor.wav')], note: '4 bars @105 — D-minor noisy sub' },
  hx_beat_industrial130: { kind: 'beat', durS: 7.4, bpm: 130, srcs: [HX('industrial-horror-drumbeat_130bpm.wav')], note: '4 bars @130 — industrial drum loop' },

  // ---- VCSL/VSCO percussion one-shots (CC0, already vendored) --------------
  // Mid-velocity round robins; the wav backend round-robins deterministically
  // and the browser map exposes them as .n() variants.
  vc_bongo_hi: { kind: 'hit', srcs: [SM('Bongos/BongoH_Hit1_v2_rr1_Mid.wav'), SM('Bongos/BongoH_Hit1_v2_rr2_Mid.wav'), SM('Bongos/BongoH_Hit1_v3_rr1_Mid.wav')], note: 'high bongo, open' },
  vc_bongo_lo: { kind: 'hit', srcs: [SM('Bongos/BongoL_Hit1_v2_rr1_Mid.wav'), SM('Bongos/BongoL_Hit1_v2_rr2_Mid.wav'), SM('Bongos/BongoL_Hit1_v3_rr1_Mid.wav')], note: 'low bongo, open' },
  vc_conga: { kind: 'hit', srcs: [SM('Conga/Conga_HitN_v2_rr1_Sum.wav'), SM('Conga/Conga_HitN_v2_rr2_Sum.wav'), SM('Conga/Conga_HitN_v3_rr1_Sum.wav')], note: 'conga, open' },
  vc_conga_mute: { kind: 'hit', srcs: [SM('Conga/Conga_HitFM_v2_rr1_Sum.wav'), SM('Conga/Conga_HitFM_v2_rr2_Sum.wav')], note: 'conga, muted' },
  vc_quinto: { kind: 'hit', srcs: [SM('Conga/Quinto_HitFM1_v2_rr1_Sum.wav'), SM('Conga/Quinto_HitFM1_v2_rr2_Sum.wav')], note: 'quinto (high conga)' },
  vc_darbuka: { kind: 'hit', srcs: [SM('Darbuka/Darbuka_1_hit_vl2_rr1.wav'), SM('Darbuka/Darbuka_1_hit_vl2_rr2.wav')], note: 'darbuka dum (center)' },
  vc_darbuka_tak: { kind: 'hit', srcs: [SM('Darbuka/Darbuka_3_hit_vl2_rr1.wav'), SM('Darbuka/Darbuka_3_hit_vl2_rr2.wav')], note: 'darbuka tak (rim)' },
  vc_frame: { kind: 'hit', srcs: [SM('Frame Drum/HDrumL_Hit_v2_rr1_Sum.wav'), SM('Frame Drum/HDrumL_Hit_v2_rr2_Sum.wav')], note: 'frame drum dum' },
  vc_shaker: { kind: 'hit', srcs: [SI('Shaker, Large/LShaker_Shake1U_rr1_Mid.wav'), SI('Shaker, Large/LShaker_Shake1D_rr2_Mid.wav'), SI('Shaker, Large/LShaker_Shake1U_rr4_Mid.wav'), SI('Shaker, Large/LShaker_Shake1D_rr3_Mid.wav')], note: 'large shaker, up/down strokes alternate — the urgency timekeeper' },
  vc_shaker_soft: { kind: 'hit', srcs: [VP("varWood/Camo's Shaker/shake1.wav"), VP("varWood/Camo's Shaker/shake2.wav"), VP("varWood/Camo's Shaker/shake3.wav")], note: 'soft shaker, jungle humidity tier' },
  vc_guiro: { kind: 'hit', srcs: [SI('Guiro/Guiro_Med_rr1_Mid.wav'), SI('Guiro/Guiro_Hit_rr1_Mid.wav')], note: 'guiro scrape (med) + hit — jungle insect texture' },
  vc_claves: { kind: 'hit', srcs: [SI('Claves/Claves1_Hit_v2_rr1_Mid.wav'), SI('Claves/Claves1_Hit_v3_rr1_Mid.wav')], note: 'claves — son clave carrier' },
  vc_log_hi: { kind: 'hit', srcs: [SI('Slit Drum/LogDrumHi_MedM_v2_rr1_Sum.wav'), SI('Slit Drum/LogDrumHi_MedM_v3_rr1_Sum.wav')], note: 'log drum high — jungle signal drum' },
  vc_log_lo: { kind: 'hit', srcs: [SI('Slit Drum/LogDrumLo_MedM_v2_rr1_Sum.wav'), SI('Slit Drum/LogDrumLo_MedM_v3_rr1_Sum.wav')], note: 'log drum low' },
  vc_cajon: { kind: 'hit', srcs: [SI('Cajon/Cajon_hit1_f_rr1.wav'), SI('Cajon/Cajon_hit1_f_rr2.wav')], note: 'cajon bass hit' },
  vc_riq: { kind: 'hit', srcs: [SI('Tambourine 1/Tamb1_Hit_v1_rr1_Mid.wav'), SI('Tambourine 1/Tamb1_Hit_v2_rr1_Mid.wav')], note: 'tambourine hit (riq stand-in) — desert jingle offbeats' },
  vc_riq_shake: { kind: 'hit', srcs: [SI('Tambourine 1/Tamb1_Shake_rr1_Mid.wav'), SI('Tambourine 1/Tamb1_Shake_rr2_Mid.wav')], note: 'tambourine shake' },
  vc_zill: { kind: 'hit', srcs: [SI('Finger Cymbals/Fing_Cymb.wav')], note: 'finger cymbal — oasis shimmer, sparse (1 per 2-4 bars)' },
  // war / epic-trailer tier
  vc_wardrum: { kind: 'hit', srcs: [VS('Percussion/BDrumNewhit_v3_rr1_Sum.wav'), VS('Percussion/BDrumNewhit_v3_rr2_Sum.wav'), VS('Percussion/BDrumNewhit_v4_rr1_Sum.wav')], note: 'big concert bass drum — the war-drum don' },
  vc_wardrum_cresc: { kind: 'oneshot', srcs: [SM('Bass Drum 2/bassdrum_cresc_short.wav'), SM('Bass Drum 2/bassdrum_cresc_med.wav')], note: 'bass-drum crescendo roll — aim to END on the target downbeat' },
  vc_tom_hi: { kind: 'hit', srcs: [SM('Tom 1/Stick/TomH_HitS_v3_rr1_Mid.wav'), SM('Tom 1/Stick/TomH_HitS_v3_rr2_Mid.wav'), SM('Tom 1/Stick/TomH_HitS_v4_rr1_Mid.wav')], note: 'high tom, stick' },
  vc_tom_lo: { kind: 'hit', srcs: [SM('Tom 2/Stick/TomL_HitS_v3_rr1_Mid.wav'), SM('Tom 2/Stick/TomL_HitS_v3_rr2_Mid.wav'), SM('Tom 2/Stick/TomL_HitS_v4_rr1_Mid.wav')], note: 'low tom, stick — battle gallop carrier' },
  vc_timpani: { kind: 'hit', srcs: [SM('Timpani 1/Hit/Timpani1_Hit_v3_rr3_Sum.wav'), SM('Timpani 1/Hit/Timpani1_Hit_v4_rr1_Sum.wav')], note: 'timpani hit — ceremonial accent (used unpitched)' },
  vc_snare_mil: { kind: 'hit', srcs: [SM('Snare Drum, Rope Tension/RopeSnare_stick_Main_vl1_rr1.wav'), SM('Snare Drum, Rope Tension/RopeSnare_stick_Main_vl1_rr2.wav')], note: 'rope-tension military snare' },
  vc_snare_roll: { kind: 'oneshot', srcs: [VS('Percussion/Snare2-rollNS_v3_rr1_Sum.wav'), VS('Percussion/Snare2-rollNS_v5_rr1_Sum.wav')], note: 'snare roll (recorded) — end on the downbeat' },
  vc_cym_cresc: { kind: 'oneshot', srcs: [VS('Percussion/susCymb1-cresc-Short_v1.wav'), VS('Percussion/susCymb1-cresc-Median_v1.wav'), VS('Percussion/susCymb1-cresc-Long_v1.wav')], note: 'suspended-cymbal crescendos (short/med/long) — ready-made risers' },
  vc_gong: { kind: 'oneshot', srcs: [VP('varMetal/Gong/gong_hit_f.wav'), VP('varMetal/Gong/gong_hit_ff.wav')], note: 'gong hit — epic/doom downbeats' },
  // industrial tier
  vc_anvil: { kind: 'hit', srcs: [SI('Anvil/Anvil_Hit1_v2_rr1_Mid.wav'), SI('Anvil/Anvil_Hit1_v3_rr1_Mid.wav'), SI('Anvil/Anvil_Hit2_v2_rr1_Mid.wav')], note: 'anvil — metal rod hit, industrial offbeat clock' },
  vc_brake: { kind: 'hit', srcs: [SI('Brake Drum/BrakeDrum1_Hammer_v2_rr1_Mid.wav'), SI('Brake Drum/BrakeDrum1_Hammer_v3_rr1_Mid.wav')], note: 'brake drum hammered — darker metal hit' },
  vc_metal_scrape: { kind: 'oneshot', srcs: [VP('varMetal/Cymbals/susp/susp_FX_scrape_1.wav'), VP('varMetal/Cymbals/susp/susp_FX_scrape_2.wav')], note: 'cymbal scrape — industrial/horror texture, sparse' },
  // horror tier
  vc_gongscrape: { kind: 'oneshot', srcs: [VS('Percussion/gongscrape_mf.wav'), VS('Percussion/gongscrape_pp.wav')], note: 'gong scrape — dread swell into a boundary' },
  vc_windchimes: { kind: 'oneshot', srcs: [SI('Mark Trees/Legacy/windchimes_asc1.wav'), SI('Mark Trees/Legacy/windchimes_desc1.wav')], note: 'mark tree asc/desc — magical or uneasy shimmer' },
  vc_flexatone: { kind: 'oneshot', srcs: [SI('Flexatone/flexatone1.wav'), SI('Flexatone/flexatone2.wav')], note: 'flexatone — comic-eerie bend' },
  // playful tier
  vc_woodblock: { kind: 'hit', srcs: [SI('Woodblock/wood_click_f_rr1.wav'), SI('Woodblock/wood_click_f_rr2.wav')], note: 'woodblock click' },
  vc_agogo: { kind: 'hit', srcs: [SI('Agogo Bells/Agogo_High_v2_rr1_Mid.wav'), SI('Agogo Bells/Agogo_Low_v2_rr1_Mid.wav')], note: 'agogo high/low' },
  vc_vibraslap: { kind: 'oneshot', srcs: [SI('Vibraslap/Legacy/vibraslap_rr1.wav'), SI('Vibraslap/Legacy/vibraslap_rr2.wav')], note: 'vibraslap — the punchline' },
  vc_slapstick: { kind: 'hit', srcs: [SI('Slapstick/slapstick_rr1.wav'), SI('Slapstick/slapstick_rr2.wav')], note: 'slapstick whip-crack' },
  vc_ratchet: { kind: 'oneshot', srcs: [SI('Ratchet/Ratchet1_Crank_rr1_Mid.wav'), SI('Ratchet/Ratchet1_Crank_rr3_Mid.wav')], note: 'ratchet crank' },
  vc_sleigh: { kind: 'hit', srcs: [SI('Sleigh Bells/Sleighbells_Hit_rr1_Mid.wav'), SI('Sleigh Bells/Sleighbells_Hit_rr2_Mid.wav')], note: 'sleigh bells' },

  // ---- SSO chorus, pitched (browser tier for choir_male / choir_female —
  // the HQ tier plays gen/choir-{male,female}.sfz from the same wavs).
  // kind 'pitched': every src filename carries its note (chorus-male-c3.wav);
  // the pack builder emits a note-keyed strudel map so .note() repitches
  // from the nearest sample.
  choir_male: { kind: 'pitched', dir: 'vendor/sfz/SSO-Chorus/Samples', match: /^chorus-male-/, note: 'SSO male chorus aahs, G2-F#4, looped sustains' },
  choir_female: { kind: 'pitched', dir: 'vendor/sfz/SSO-Chorus/Samples', match: /^chorus-female-/, note: 'SSO female chorus aahs, G4-C6, looped sustains' },

  // ---- r22: his Miraleste drum kit (imported 2026-08-29) -------------------
  // His verdict on the drums, across four cards: "there isn't even a dum being
  // hit it's just hihat - there should be actual drums like an actual drum
  // beat", "drums aren't really there", "this isn't 'heavy tribal percussion'
  // this is bare minimum", and on industrial "it should have more percussion
  // like metal rod hits or stick hits".
  //
  // He attributed part of it to sample quality — "our drum vst isnt very good
  // compared to like addictive drums (the drums arent very full and dont sound
  // realistic)" — and handed over this kit. He is half right and the half that
  // is not sample quality is worse: the DEFAULT drum path had no snare in it at
  // all (see the band selector in audition-songs.mjs). These give the backbeat
  // something real to hit; the selector fix is what lets it be hit.
  //
  // COMMERCIAL PACK. Local-only under his r16 licensing ruling, exactly like
  // the ripped BRR rows: audios/miraleste/ is gitignored and the generated
  // audition/sample-pack.js is untracked.
  //
  // Source files are 44.1k stereo float. Round-robin variants per drum so a
  // repeated hit is not a literal repeat — the machine-gun artefact is a large
  // part of what reads as "not realistic".
  md_kick: { kind: 'hit', durS: 0.53, srcs: [MD('md_kick_2.wav'), MD('md_kick_3.wav'), MD('md_kick_1.wav')], note: 'kick, 3-way round robin — punchy over sub' },
  md_snare: { kind: 'hit', durS: 0.41, srcs: [MD('md_snare_2.wav'), MD('md_snare_3.wav'), MD('md_snare_4.wav'), MD('md_snare_1.wav')], note: 'snare, 4-way round robin — THE backbeat voice the default path never had' },
  md_clap: { kind: 'hit', durS: 0.18, srcs: [MD('md_clap_1.wav'), MD('md_clap_2.wav'), MD('md_clap_3.wav')], note: 'clap, 3-way round robin — layers WITH the snare on 2 and 4, not instead of it' },
  md_hat: { kind: 'hit', durS: 0.14, srcs: [MD('md_hat_1.wav'), MD('md_hat_2.wav'), MD('md_hat_3.wav'), MD('md_hat_4.wav')], note: 'closed hat, 4-way round robin' },
  md_ohat: { kind: 'hit', durS: 1.27, srcs: [MD('md_ohat_1.wav'), MD('md_ohat_2.wav')], note: 'open hat — the & lift before a downbeat' },
  md_metal: { kind: 'hit', durS: 0.36, srcs: [MD('md_metal_1.wav'), MD('md_metal_2.wav'), MD('md_metal_3.wav')], note: 'metal/gear hits — his industrial ask, "metal rod hits"' },
  md_stick: { kind: 'hit', durS: 0.22, srcs: [MD('md_stick_1.wav'), MD('md_stick_2.wav')], note: 'stick/rim smack — his industrial ask, "stick hits"' },
};
