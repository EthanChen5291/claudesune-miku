// r34 — POP-PACK LABS (audition/poplab.html data).
//
// HIS ASK (2026-09-12): "analyze the new folder, just like you analyzed all
// the previous sample midi suites ... and then, just like variations.html,
// create another extensive variation lab testing hypothesis combos,
// variations, etc. just like we did previously to affirm and help the engine
// learn."
//
// The source is the "Top MIDI Tracks Pack (Free)" — 419 piano arrangements of
// pop / film / classical / anime / Zelda OoT, labeled by TITLE, read in
// research/toppack-r34.md. Unlike the r33 labs, a card here answers a
// MEASURED FINDING (its `finding`, with `source_songs`) rather than a note of
// his: the page is the ear test the analysis cannot settle.
//
// His two laws every entry must honor:
//   VARIATION LAW: "this variation does NOT mean randomly changing some
//   notes, it means like actually creating another flow bound within the
//   sample that works" — every variant names its mechanism.
//   QUESTION LAW: "ask targeted questions when im verifying so u can prove
//   your hypothesis" — every card carries a falsifiable hypothesis.
//
// Entries are addressed BY NAME and never iterated by the engine (the D95
// boundary: nothing here feeds retrieval; a ratified finding is promoted by
// hand in a later round). lab_stack variants may REFERENCE catalog cards by
// id string — resolved only by scripts/audition-poplab.mjs.
//
// Batches append only: his queue position on the page never shifts.

export const POP_LAB_META = { round: 'r34', page: 'poplab-r34' };

export const POP_LABS = {
  "pl_lh_wave_three_flows": {
    "id": "pl_lh_wave_three_flows",
    "lane": "lh",
    "source_songs": [
      "pompeii",
      "lithium",
      "hold_on",
      "enya_only_time",
      "wheres_my_love",
      "wherever_you_will_go",
      "alone_alan_walker"
    ],
    "finding": "The broken-chord 8ths wave R 5 R+ 5 3+ 5 R+ 5 (1-5-8-5-10-5-8-5) is the most-shared multi-onset LH figure in the pack: 7 of 249 4/4 songs carry it for >= 4 bars (pompeii 62 bars at flat velocity 80, lithium 23, enya_only_time 16), always at root octave 2 (pompeii low 38). Bar-to-bar the RHYTHM holds in 50-53% of ballad/pop bar pairs while the exact pitch shape holds in only 21%.",
    "hypothesis": "The D97 rhythm block (hold / fill / push on bars 2-4) and the interval block (the arch 1-5-8-10-12 and the two-register 1-5-8-5 / 8-12-15-12) are both audible as another flow of the same figure; the surgical one-tone edit in bar 3 is inaudible (his r33 verdict), so the last variant will be judged identical to the reference.",
    "question": "Which of the three flows still sounds like the SAME accompaniment developing, and which one sounds like a different figure? Can you hear the one-note change at all?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "the wave x4 bars, flat velocity (pompeii)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "reference: root-fifth-octave-fifth-tenth wave, one chord a bar, identical every bar, no accents (pompeii plays it at velocity 80 on all 8 notes)"
      },
      {
        "id": "rhythm_block",
        "name": "D97 rhythm block: bar 2 HOLD (back half rings), bar 3 FILL (back half doubles with scale steps), bar 4 PUSH (back half a 16th early)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3@4] [a2 e3 a3 e3 [c4 b3] [e3 d3] [a3 g3] [e3 d3]] [f2 c3 f3 [c3 a3] [~ c3] f3 c3 ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "the same pitches; only the rhythm of the back half changes each bar — this is what the engine calls the rhythm block"
      },
      {
        "id": "interval_block",
        "name": "interval block: bars 3-4 widen the spread (1-5-8-10-12 arch, then the two-register rocking fifth)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 c4 e4 c4 a3 e3] [f2 c3 f3 c3 f3 c4 f4 c4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "same rhythm as the reference; the intervals move — the arch is alone_alan_walker's figure, the two-register one is someone_like_you / yesterday / hall_of_fame"
      },
      {
        "id": "surgical",
        "name": "FALSIFICATION: one tone changed in bar 3 (the 6th note, g -> c) — surgical repair",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 c4 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "predicted inaudible: one 8th in 32 changed — his \"I can barely tell a difference\""
      }
    ],
    "batch": 1
  },
  "pl_lh_class_names_the_vibe": {
    "id": "pl_lh_class_names_the_vibe",
    "lane": "lh",
    "source_songs": [
      "pompeii",
      "another_love",
      "alone_pt2",
      "i_need_your_love",
      "still_dre",
      "oot_potion_shop",
      "einaudi_experience",
      "someone_like_you"
    ],
    "finding": "On the same I V vi IV the pack's lanes play different LH classes: ballad = broken 8ths (arp_mixed 23% of bars, 5.3 onsets/bar, notes/attack 1.36); pop = comp/block (39% of bars, 1.95 notes/attack); EDM = octave dyads on the beats (i_need_your_love R.R+ x4, 30% of bars); hip-hop = octave dyad on 1 + fifth-octave on 4 (still_dre, 25% of hip-hop bars are octaves, low midi 36); game = whole-note octave pedal (potion_shop; game 3.8 onsets/bar, note length 0.95 beats, 34% of onsets on beat 1); film = 16th alberti (einaudi_experience 54 bars, 16 onsets/bar).",
    "hypothesis": "With no melody and one fixed loop, the LH class alone moves the perceived genre: the pedal reads Zelda/mystery, the octave quarters read EDM, the 0/6/12 bass-plus-answers comp reads pop, the wave reads piano ballad, the 16th alberti reads film/classical — and the hip-hop octaves will be the hardest to place without drums. Falsification: the ballad wave at EDM tempo under a four-on-the-floor kick should still read as a piano ballad with a beat, not as EDM — if it flips, tempo + drums name the lane, not the LH class.",
    "question": "Name the genre of each variant from the left hand alone. Which two are hardest to tell apart, and which one would you never use for a pop song? And does the ballad wave at 128 with a kick become EDM, or stay a ballad in a hurry?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "ballad_wave",
        "name": "ballad: broken 8ths wave (pompeii / lithium / hold_on)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5}],\"bpm\":104,\"bars\":4}"
        },
        "note": "reference"
      },
      {
        "id": "pop_comp_0_6_12",
        "name": "pop: bass+octave on 1, chord answers on the and-of-2 and beat 4 (another_love, alone_pt2 — tresillo slots)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2,c3]@3 [e3,g3]@3 [e3,g3]@2] [[g2,d3,g3]@3 [b3,d4]@3 [b3,d4]@2] [[a2,e3,a3]@3 [c4,e4]@3 [c4,e4]@2] [[f2,c3,f3]@3 [a3,c4]@3 [a3,c4]@2]>\",\"sound\":\"piano\",\"gain\":0.5}],\"bpm\":104,\"bars\":4}"
        },
        "note": "the most common 3-onset shape in the catch-all classes: onsets 0, 6/16, 12/16"
      },
      {
        "id": "edm_octave_quarters",
        "name": "EDM: octave dyad on every beat (i_need_your_love, viva_la_vida, human_perri)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g1,g2] [g1,g2] [g1,g2] [g1,g2]] [[a1,a2] [a1,a2] [a1,a2] [a1,a2]] [[f1,f2] [f1,f2] [f1,f2] [f1,f2]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.48 0.52 0.48\"}],\"bpm\":104,\"bars\":4}"
        },
        "note": "quarter-note octave dyads; i_need_your_love plays the upper note louder (75 vs 59) — the renderer cannot split a chord's velocity, so only the beat accent is kept"
      },
      {
        "id": "hiphop_octaves",
        "name": "hip-hop: octave dyad on 1, fifth-octave on 4 (still_dre @0,12/16, low midi 33)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3]@3 [g1,g2]] [[g1,g2]@3 [d2,d3]] [[a1,a2]@3 [e2,e3]] [[f1,f2]@3 [c2,c3]]>\",\"sound\":\"piano\",\"gain\":0.5}],\"bpm\":104,\"bars\":4}"
        },
        "note": "two attacks a bar, a whole octave lower than the ballad wave"
      },
      {
        "id": "zelda_pedal",
        "name": "game: whole-note octave pedal (oot_potion_shop, oot_deku_last_words)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2,c3] [g1,g2] [a1,a2] [f1,f2]>\",\"sound\":\"piano\",\"gain\":0.5}],\"bpm\":104,\"bars\":4}"
        },
        "note": "one attack a bar held the whole bar"
      },
      {
        "id": "film_alberti_16ths",
        "name": "film/classical: 16th alberti R 5 R+ 5 (einaudi_experience, someone_like_you chorus) — 16 onsets a bar, fails the engine's metronome test",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 c2 g2 c3 g2 c2 g2 c3 g2 c2 g2 c3 g2] [g2 d3 g3 d3 g2 d3 g3 d3 g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3 f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.42,\"gainPattern\":\"0.5 0.36 0.4 0.36 0.46 0.36 0.4 0.36 0.48 0.36 0.4 0.36 0.46 0.36 0.4 0.36\"}],\"bpm\":104,\"bars\":4}"
        },
        "note": "the engine rejects >= 12 onsets a bar as a gear change; the pack plays it on 13 einaudi bars and 4 someone_like_you bars"
      },
      {
        "id": "wave_at_edm_tempo_kick",
        "name": "FALSIFICATION: the ballad wave at 128 bpm under a four-on-the-floor kick + 8th hats",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"md_kick md_kick md_kick md_kick\",\"sound\":\"md_kick\",\"gain\":0.35},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.18}],\"bpm\":128,\"bars\":4}"
        },
        "note": "if tempo and a kick turn the ballad wave into EDM, the class is not what names the lane; the hypothesis predicts it still reads as a fast piano ballad under a beat"
      }
    ],
    "batch": 1
  },
  "pl_rhythm_anticipation_ladder": {
    "id": "pl_rhythm_anticipation_ladder",
    "lane": "rhythm",
    "source_songs": [
      "viva_la_vida",
      "stay_with_me",
      "maps",
      "listen_to_your_heart",
      "every_breath_you_take",
      "clarity",
      "stay_the_night",
      "drops_of_jupiter"
    ],
    "finding": "A GENUINE anticipation (the bar's last 8th strikes the NEXT bar's chord, not the current one) is rare in the pool — 3% of ballad and 8% of pop chord-change bars that end on the last 8th — but it is a whole-song device where it occurs: viva_la_vida 14 of 14 such bars, stay_with_me 13 of 13, maps 26 of 48, listen_to_your_heart 30 of 44, clarity 23 of 85. Only 10 of 249 4/4 songs carry >= 4. The and-of-4 slot holds 6-10% of LH onsets by lane; the and-of-2 slot 10-13%.",
    "hypothesis": "One anticipation per bar (the next chord on the and-of-4) reads as forward lean without changing tempo; adding the and-of-2 push reads as pop comp; striking the CURRENT chord again on the and-of-4 (no chord change) reads as a stutter rather than a lift, because the lean comes from the harmony arriving early, not from the extra attack.",
    "question": "Does the and-of-4 chord read as the next bar starting early (a lean) or as an extra hit? Which rung of the ladder is the pop feel, and is the falsification variant a groove or a mistake?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "straight",
        "name": "reference: block on beats 1 and 3, no anticipation",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3,e3,g3] [c2,c3,e3,g3]] [[g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,c3,f3,a3] [f2,c3,f3,a3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":120,\"bars\":4}"
        },
        "note": "two chords a bar on the beats"
      },
      {
        "id": "antic_1",
        "name": "one anticipation: the NEXT chord on the and-of-4 (viva_la_vida, stay_with_me)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3,e3,g3]@4 [c2,c3,e3,g3]@3 [g2,b2,d3,g3]] [[g2,b2,d3,g3]@4 [g2,b2,d3,g3]@3 [a2,c3,e3,a3]] [[a2,c3,e3,a3]@4 [a2,c3,e3,a3]@3 [f2,c3,f3,a3]] [[f2,c3,f3,a3]@4 [f2,c3,f3,a3]@3 [c2,c3,e3,g3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":120,\"bars\":4}"
        },
        "note": "the chord change lands an 8th before the barline; the downbeat re-strikes it"
      },
      {
        "id": "antic_2",
        "name": "two pushes: the and-of-2 (charleston) plus the and-of-4 anticipation (maps, listen_to_your_heart)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3,e3,g3]@3 [c2,c3,e3,g3]@4 [g2,b2,d3,g3]] [[g2,b2,d3,g3]@3 [g2,b2,d3,g3]@4 [a2,c3,e3,a3]] [[a2,c3,e3,a3]@3 [a2,c3,e3,a3]@4 [f2,c3,f3,a3]] [[f2,c3,f3,a3]@3 [f2,c3,f3,a3]@4 [c2,c3,e3,g3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":120,\"bars\":4}"
        },
        "note": "onsets 0, 3/8, 7/8 — the tresillo slots"
      },
      {
        "id": "restrike_current",
        "name": "FALSIFICATION: the CURRENT chord re-struck on the and-of-4 (an anticipation of nothing)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3,e3,g3]@4 [c2,c3,e3,g3]@3 [c2,c3,e3,g3]] [[g2,b2,d3,g3]@4 [g2,b2,d3,g3]@3 [g2,b2,d3,g3]] [[a2,c3,e3,a3]@4 [a2,c3,e3,a3]@3 [a2,c3,e3,a3]] [[f2,c3,f3,a3]@4 [f2,c3,f3,a3]@3 [f2,c3,f3,a3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":120,\"bars\":4}"
        },
        "note": "same rhythm as antic_1, same chord as the bar — predicted to read as a stutter"
      }
    ],
    "batch": 1
  },
  "pl_lh_chorus_register_drop": {
    "id": "pl_lh_chorus_register_drop",
    "lane": "lh",
    "source_songs": [
      "let_me_down_slowly",
      "someone_like_you",
      "alone_alan_walker",
      "viva_la_vida",
      "all_of_me"
    ],
    "finding": "From the first section to the loudest later section the pack's LH goes DOWN, not up: median low note -8 semitones in ballads (67% of 54 songs drop >= 3 st), -12 in EDM (73% of 15), -3 rock; onsets/bar +1.2 (ballad), notes per attack unchanged (+0.05). Spot-checked: let_me_down_slowly low 47 -> 35 with 6 -> 12 onsets/bar; alone_alan_walker 51 -> 38-41 at a constant 8 onsets/bar; someone_like_you 44-50 -> 38-40. The RH median pitch moves only +2 st. A pedal song (all_of_me) never moves.",
    "hypothesis": "The chorus lift in a piano arrangement is carried by the LEFT hand dropping an octave (and adding the octave dyad on the downbeat), not by the melody rising: the as-measured variant reads as a chorus, the LH-unchanged variant reads as the same section played louder, and the class-change-in-place and density-only variants read as partial lifts.",
    "question": "Which variant's bar 5 sounds like a chorus arriving? Is the octave drop alone enough, or does it need the extra onsets too? Does the unchanged-LH variant sound like a chorus at all?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "verse wave at root c3, chorus the same wave an octave down with an octave dyad on 1 (let_me_down_slowly / alone_alan_walker)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 e4 g3 c4 g3] [g3 d4 g4 d4 b4 d4 g4 d4] [a3 e4 a4 e4 c5 e4 a4 e4] [f3 c4 f4 c4 a4 c4 f4 c4] [[c2,c3] g2 c3 g2 e3 g2 c3 g2] [[g1,g2] d3 g3 d3 b3 d3 g3 d3] [[a1,a2] e3 a3 e3 c4 e3 a3 e3] [[f1,f2] c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~] [e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"room\":0.3,\"gainPattern\":\"<0.6 0.6 0.6 0.6 0.72 0.72 0.72 0.72>\"}],\"bpm\":96,\"bars\":8}"
        },
        "note": "bars 1-4 verse, 5-8 chorus; the melody is identical in both halves with a +0.12 gain lift (0.6 -> 0.72)"
      },
      {
        "id": "class_change_same_register",
        "name": "chorus changes CLASS (wave -> octave quarter dyads) but stays in the verse register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 e4 g3 c4 g3] [g3 d4 g4 d4 b4 d4 g4 d4] [a3 e4 a4 e4 c5 e4 a4 e4] [f3 c4 f4 c4 a4 c4 f4 c4] [[c3,c4] [c3,c4] [c3,c4] [c3,c4]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~] [e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"room\":0.3,\"gainPattern\":\"<0.6 0.6 0.6 0.6 0.72 0.72 0.72 0.72>\"}],\"bpm\":96,\"bars\":8}"
        },
        "note": "the pop cliche (arp -> block octaves) without the register drop"
      },
      {
        "id": "density_only",
        "name": "chorus doubles the density (16th alberti) in the SAME register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 e4 g3 c4 g3] [g3 d4 g4 d4 b4 d4 g4 d4] [a3 e4 a4 e4 c5 e4 a4 e4] [f3 c4 f4 c4 a4 c4 f4 c4] [c3 g3 c4 g3 c3 g3 c4 g3 c3 g3 c4 g3 c3 g3 c4 g3] [g3 d4 g4 d4 g3 d4 g4 d4 g3 d4 g4 d4 g3 d4 g4 d4] [a3 e4 a4 e4 a3 e4 a4 e4 a3 e4 a4 e4 a3 e4 a4 e4] [f3 c4 f4 c4 f3 c4 f4 c4 f3 c4 f4 c4 f3 c4 f4 c4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~] [e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"room\":0.3,\"gainPattern\":\"<0.6 0.6 0.6 0.6 0.72 0.72 0.72 0.72>\"}],\"bpm\":96,\"bars\":8}"
        },
        "note": "onsets 8 -> 16 a bar, register unchanged"
      },
      {
        "id": "lh_unchanged",
        "name": "FALSIFICATION: the LH plays the verse wave through all 8 bars; only the melody gain lifts",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 e4 g3 c4 g3] [g3 d4 g4 d4 b4 d4 g4 d4] [a3 e4 a4 e4 c5 e4 a4 e4] [f3 c4 f4 c4 a4 c4 f4 c4] [c3 g3 c4 g3 e4 g3 c4 g3] [g3 d4 g4 d4 b4 d4 g4 d4] [a3 e4 a4 e4 c5 e4 a4 e4] [f3 c4 f4 c4 a4 c4 f4 c4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~] [e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"room\":0.3,\"gainPattern\":\"<0.6 0.6 0.6 0.6 0.72 0.72 0.72 0.72>\"}],\"bpm\":96,\"bars\":8}"
        },
        "note": "predicted to read as one section played louder, not as a chorus"
      }
    ],
    "batch": 1
  },
  "pl_lh_accent_placement": {
    "id": "pl_lh_accent_placement",
    "lane": "lh",
    "source_songs": [
      "alone_alan_walker",
      "pompeii",
      "somewhere_only_we_know",
      "i_need_your_love",
      "einaudi_experience",
      "heartbreak_girl"
    ],
    "finding": "In bars with real velocity variety (spread >= 8; 26-46% of bars by lane, only 2% in game) the loudest LH note is the bar's LOWEST note 53-65% of the time and sits on beat 1 in 44-60% (ballad/pop/rock/edm); film and classical put the loudest attack OFF the beat in 53-56% of such bars. alone_alan_walker plays the wave at 88 65 64 70 60 57 56 54 (bass-loud, decaying); pompeii and somewhere_only_we_know play every note at 80 (flat); heartbreak_girl's block comp puts the top note at 90-93 with the bass at 82-85.",
    "hypothesis": "A bass-loud decaying accent reads as a played left hand; the flat version reads as sequenced but not wrong; putting the accent on the pivot fifths (the film/classical offbeat shape) will read as a limp or a mistake on this pop figure because it lifts the least important note.",
    "question": "Which accent pattern sounds like a person playing, which sounds like a sequencer, and does the offbeat-loud variant sound wrong or just different?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "flat",
        "name": "flat velocity (pompeii, somewhere_only_we_know)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.68,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "reference: 8 equal attacks"
      },
      {
        "id": "bass_loud_decay",
        "name": "bass-loud, decaying through the bar (alone_alan_walker measured 88 65 64 70 60 57 56 54)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.6 0.44 0.44 0.48 0.41 0.39 0.38 0.37\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.68,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "the pack's modal shape: loudest = lowest = beat 1"
      },
      {
        "id": "top_loud",
        "name": "peak-loud: the accent on the arp's top note (the 10th on beat 3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.42 0.38 0.45 0.38 0.6 0.38 0.45 0.38\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.68,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "heartbreak_girl's block comp keeps the top note loudest; here it is applied to the arp"
      },
      {
        "id": "offbeat_loud",
        "name": "FALSIFICATION: the pivot fifths (offbeats) loudest — the film/classical offbeat shape on a pop wave",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.38 0.55 0.38 0.55 0.38 0.55 0.38 0.55\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.68,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "predicted to read wrong: the least important note carries the weight"
      },
      {
        "id": "engine_default",
        "name": "the engine's fnd_ballad_8ths_arch accents (1 .7 .8 .75 .85 .7 .75 .7) scaled",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.39 0.44 0.41 0.47 0.39 0.41 0.39\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.68,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "bass-loud with a beat-3 secondary — between flat and the alone shape"
      }
    ],
    "batch": 1
  },
  "pl_lh_rock_chug_metronome": {
    "id": "pl_lh_rock_chug_metronome",
    "lane": "lh",
    "source_songs": [
      "all_the_small_things",
      "my_songs_know",
      "the_final_countdown",
      "somewhere_only_we_know",
      "in_the_end"
    ],
    "finding": "A straight-8th LH with ONE shape (the engine's metronome-test failure: >= 6 onsets, <= 1 distinct shape) is a ROCK idiom, not a ballad one: 22% of rock's straight-8 bars carry one shape (all_the_small_things 77 bars of R.5 power-chord 8ths, my_songs_know 36, the_final_countdown 30 of R.5.R+ x8, somewhere_only_we_know 27) against 3% in pop and 5% in ballads. Overall metronome-fail bars: rock 11%, ballad 6%, pop 4%, edm 4% of bars.",
    "hypothesis": "Under a backbeat the single-shape chug reads as the rock idiom, not as a defect; the engine's two-shape repair (octave pops on the tresillo slots) reads as a different, busier groove rather than a fix; the 16-onset single shape (the >= 12 gear-change clause) is the variant that reads as a tremolo and breaks.",
    "question": "Is the one-shape 8th chug a mistake to your ear when a kit is under it, or is it what a rock LH should do? Does the octave-pop version sound better or just different? Where does the 16th version stop being a groove?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "chug_fifths",
        "name": "R.5 x8 power-chord 8ths (all_the_small_things, 77 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2]*8] [[g1,d2]*8] [[a1,e2]*8] [[f1,c2]*8]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.45 0.5 0.45 0.55 0.45 0.5 0.45\"},{\"mini\":\"<[md_kick md_snare md_kick md_snare]>\",\"sound\":\"md_kick\",\"gain\":0.35},{\"mini\":\"[md_hat*8]\",\"sound\":\"md_hat\",\"gain\":0.18}],\"bpm\":150,\"bars\":4}"
        },
        "note": "reference: one shape, eight attacks, fails the metronome test"
      },
      {
        "id": "chug_R5R",
        "name": "R.5.R+ x8 (the_final_countdown 26 bars, somewhere_only_we_know 19, in_the_end 16)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2,c3]*8] [[g1,d2,g2]*8] [[a1,e2,a2]*8] [[f1,c2,f2]*8]>\",\"sound\":\"piano\",\"gain\":0.48,\"gainPattern\":\"0.55 0.45 0.5 0.45 0.55 0.45 0.5 0.45\"},{\"mini\":\"<[md_kick md_snare md_kick md_snare]>\",\"sound\":\"md_kick\",\"gain\":0.35},{\"mini\":\"[md_hat*8]\",\"sound\":\"md_hat\",\"gain\":0.18}],\"bpm\":150,\"bars\":4}"
        },
        "note": "one shape, three notes per attack"
      },
      {
        "id": "two_shape_octave_pops",
        "name": "the engine's repair: octave pops on the tresillo slots (fnd_pedal_root_ostinato shape) — passes the metronome test",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2] [c2,g2] [c2,g2] [c3,g3] [c2,g2] [c2,g2] [c3,g3] [c2,g2]] [[g1,d2] [g1,d2] [g1,d2] [g2,d3] [g1,d2] [g1,d2] [g2,d3] [g1,d2]] [[a1,e2] [a1,e2] [a1,e2] [a2,e3] [a1,e2] [a1,e2] [a2,e3] [a1,e2]] [[f1,c2] [f1,c2] [f1,c2] [f2,c3] [f1,c2] [f1,c2] [f2,c3] [f1,c2]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.45 0.5 0.5 0.55 0.45 0.5 0.45\"},{\"mini\":\"<[md_kick md_snare md_kick md_snare]>\",\"sound\":\"md_kick\",\"gain\":0.35},{\"mini\":\"[md_hat*8]\",\"sound\":\"md_hat\",\"gain\":0.18}],\"bpm\":150,\"bars\":4}"
        },
        "note": "two shapes: the octave pop on the and-of-2 and the and-of-3"
      },
      {
        "id": "chug_16ths",
        "name": "FALSIFICATION: R.5 x16 — the >= 12 onsets gear-change clause",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2]*16] [[g1,d2]*16] [[a1,e2]*16] [[f1,c2]*16]>\",\"sound\":\"piano\",\"gain\":0.42,\"gainPattern\":\"0.5 0.36 0.42 0.36 0.48 0.36 0.42 0.36 0.5 0.36 0.42 0.36 0.48 0.36 0.42 0.36\"},{\"mini\":\"<[md_kick md_snare md_kick md_snare]>\",\"sound\":\"md_kick\",\"gain\":0.35},{\"mini\":\"[md_hat*8]\",\"sound\":\"md_hat\",\"gain\":0.18}],\"bpm\":150,\"bars\":4}"
        },
        "note": "predicted to read as a tremolo, not a groove"
      }
    ],
    "batch": 1
  },
  "pl_rhythm_tresillo_comp": {
    "id": "pl_rhythm_tresillo_comp",
    "lane": "rhythm",
    "source_songs": [
      "another_love",
      "alone_pt2",
      "shape_of_you",
      "deja_vu",
      "gurenge"
    ],
    "finding": "The 3+3+2 tresillo is the pack's most common NON-8th LH rhythm and it hides inside the catch-all classes: 37 of another_love's bars strike on 0, 6/16, 12/16 (bass, then two chord answers), alone_pt2 57% of bars R 3+.5+ R+ on the same slots, shape_of_you 167 bars of R.5 on 0, 3/8, 6/8, deja_vu 100% of bars a doubled tresillo R 5 5 | R 5 5 on 0,3,6 | 8,11,14. Tresillo-slot share of LH onsets is 38-45% by lane. His ruling: groove regroupings are WRONG for calm/nature material — this card tests them where the groove is right.",
    "hypothesis": "On a pop loop the tresillo comp reads as the genre's groove (better than straight quarters) when the figure is CHORDAL (bass + answers, or the R.5 dyad), and it fails when the same 3+3+2 regrouping is imposed on the flowing 8th wave, because the wave's sense comes from its evenness.",
    "question": "Which tresillo variant is the pop groove, and does the regrouped wave sound like a groove or like the pattern stumbling? Is straight quarters plainer or cleaner?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "straight_quarters",
        "name": "reference: bass+chord on 1, chord on every beat",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3,e3,g3] [e3,g3] [e3,g3] [e3,g3]] [[g1,g2,b2,d3] [b2,d3] [b2,d3] [b2,d3]] [[a1,a2,c3,e3] [c3,e3] [c3,e3] [c3,e3]] [[f1,f2,a2,c3] [a2,c3] [a2,c3] [a2,c3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":100,\"bars\":4}"
        },
        "note": "no syncopation"
      },
      {
        "id": "tresillo_bass_answers",
        "name": "bass on 1, chord answers on 6/16 and 12/16 (another_love, alone_pt2)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2,c3]@3 [e3,g3]@3 [e3,g3]@2] [[g1,d2,g2]@3 [b2,d3]@3 [b2,d3]@2] [[a1,e2,a2]@3 [c3,e3]@3 [c3,e3]@2] [[f1,c2,f2]@3 [a2,c3]@3 [a2,c3]@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":100,\"bars\":4}"
        },
        "note": "3 attacks a bar on the tresillo slots"
      },
      {
        "id": "double_tresillo",
        "name": "doubled tresillo R 5 5 | R 5 5 (deja_vu, every bar)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2@3 g2@3 g2@2 c3@3 g2@3 g2@2] [g1@3 d2@3 d2@2 g2@3 d2@3 d2@2] [a1@3 e2@3 e2@2 a2@3 e2@3 e2@2] [f1@3 c2@3 c2@2 f2@3 c2@3 c2@2]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.42 0.42 0.5 0.42 0.42\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":100,\"bars\":4}"
        },
        "note": "six attacks a bar, single notes, 3+3+2 twice"
      },
      {
        "id": "dyad_tresillo",
        "name": "R.5 dyads on 0, 3/8, 6/8 (shape_of_you, 167 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2]@3 [c2,g2]@3 [c2,g2]@2] [[g1,d2]@3 [g1,d2]@3 [g1,d2]@2] [[a1,e2]@3 [a1,e2]@3 [a1,e2]@2] [[f1,c2]@3 [f1,c2]@3 [f1,c2]@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":100,\"bars\":4}"
        },
        "note": "one shape, three attacks — the sparsest tresillo in the pack"
      },
      {
        "id": "regrouped_wave",
        "name": "FALSIFICATION: the 8th wave regrouped 3+3+2 (his ruling on groove regroupings)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2@3 g2@3 c3@2 g2@3 e3@3 g2@2] [g2@3 d3@3 g3@2 d3@3 b3@3 d3@2] [a2@3 e3@3 a3@2 e3@3 c4@3 e3@2] [f2@3 c3@3 f3@2 c3@3 a3@3 c3@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":100,\"bars\":4}"
        },
        "note": "the wave's six of eight notes on tresillo slots — predicted to stumble"
      }
    ],
    "batch": 1
  },
  "pl_lh_register_octaves": {
    "id": "pl_lh_register_octaves",
    "lane": "lh",
    "source_songs": [
      "pompeii",
      "sign_of_the_times",
      "rap_god",
      "oot_potion_shop",
      "someone_like_you",
      "yesterday",
      "hall_of_fame"
    ],
    "finding": "The pack's LH lowest note sits at midi 41 (F2) median in ballads and pop, 36 (C2) in hip-hop, 45 (A2) in game, 39 in rock; it goes as low as 24-29 (sign_of_the_times chorus, 39 bars) and 31 (rap_god) on the piano. The two-register rocking fifth R 5 R+ 5 | R+ 5+ R++ 5+ (someone_like_you 16ths, yesterday 8ths, hall_of_fame) spans two octaves from one root. The engine's law \"bare sine at octave 1 is inaudible\" was measured on a synth, not a piano.",
    "hypothesis": "The wave at root C2 is the piano-ballad register; at C1 the piano is audible but muddy (the tenth sits below the mud line); at C3 it thins and collides with the melody's band; the two-register version reads as fuller than either single octave; doubling the C2 wave with a synth bass an octave down breaks \"one low voice at a time\" and reads as mud.",
    "question": "Which register is the ballad left hand? Is C1 muddy or just dark? Does the two-register figure sound like more hands or like one hand opening up? Is the synth-bass doubling mud?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "oct2",
        "name": "root C2 (midi 36) — the pack's register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"add\":0},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "reference"
      },
      {
        "id": "oct1",
        "name": "root C1 (midi 24) — sign_of_the_times / rap_god depth",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"add\":-12},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "the whole figure an octave down"
      },
      {
        "id": "oct3",
        "name": "root C3 (midi 48) — the engine's piano-acc default",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"add\":12},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "the whole figure an octave up"
      },
      {
        "id": "two_register",
        "name": "two-register rocking fifth from C2 (someone_like_you / yesterday / hall_of_fame)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 c3 g3 c4 g3] [g2 d3 g3 d3 g3 d4 g4 d4] [a2 e3 a3 e3 a3 e4 a4 e4] [f2 c3 f3 c3 f3 c4 f4 c4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "R 5 R+ 5 then the same a fifth-octave higher"
      },
      {
        "id": "oct2_plus_synth_bass",
        "name": "FALSIFICATION: C2 wave doubled by a synth bass root at C1 — two low voices at once",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"add\":0},{\"mini\":\"<c1 g0 a0 f0>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.4},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":104,\"bars\":4}"
        },
        "note": "predicted mud: the engine's \"one low voice at a time\" law"
      }
    ],
    "batch": 1
  },
  "pl_lh_hold_vs_swap": {
    "id": "pl_lh_hold_vs_swap",
    "lane": "lh",
    "source_songs": [
      "pompeii",
      "someone_you_loved",
      "heart_attack",
      "shape_of_you",
      "all_of_me"
    ],
    "finding": "The pack HOLDS its LH rhythm across chord changes: at a chord change the onset grid is identical to the previous bar in 50-52% of ballad/pop bar pairs (44% rock, 59% classical) while the exact pitch shape holds in only 17-21% — the hand keeps the rhythm and re-roots or re-voices. Whole-song single figures are common: shape_of_you 167 bars of one shape, all_of_me 92 bars of a whole-note root, heart_attack 73 bars of R.3.5 R.3.5, someone_you_loved 63 of 79 bars alberti. Pompeii's only variant is its own first half held: R 5 R+ 3+ then ring (4 bars).",
    "hypothesis": "A figure held for four bars and re-rooted per chord reads as the song; swapping the figure class every bar (the D62 rotation) reads as \"each iteration a different speed\"; swapping every two bars is tolerable; the pack's own turnaround (bar 4 = the first half of the figure, then held) reads as the most musical variation of the four because it is a hold, not a swap.",
    "question": "Does the per-bar figure swap sound like variety or like the accompaniment changing speed? Is the held half-bar in bar 4 a better turnaround than any swap?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "hold",
        "name": "reference: the wave held 4 bars, re-rooted per chord (pompeii)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "as transcribed"
      },
      {
        "id": "swap_per_bar",
        "name": "FALSIFICATION: a different figure class every bar (wave, alberti, block, octaves) — the D62 rotation",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [[g2,b3] d3 b3 d3 b3 d3 b3 d3] [[a2,e3,a3,c4] [a2,e3,a3,c4]] [[f1,f2] [f1,f2] [f1,f2] [f1,f2]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "predicted \"each iteration a different speed\""
      },
      {
        "id": "swap_per_2_bars",
        "name": "the figure changes every two bars (wave, then the 0/6/12 comp)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [[a2,e3,a3]@3 [c4,e4]@3 [c4,e4]@2] [[f2,c3,f3]@3 [a3,c4]@3 [a3,c4]@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "a section-scale change inside one loop"
      },
      {
        "id": "hold_turnaround",
        "name": "held 3 bars, bar 4 = the figure's first half then ring (pompeii's own turnaround)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 a3@5]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":118,\"bars\":4}"
        },
        "note": "a HOLD, not a swap — the D97 hold form as the pack plays it"
      }
    ],
    "batch": 1
  },
  "pl_lh_zelda_pedal_vs_pulse": {
    "id": "pl_lh_zelda_pedal_vs_pulse",
    "worth": "skip",
    "expected": "Known: a whole-note octave pedal reads place/mystery, straight 8ths read a motor, a 16th octave bounce reads an action stage; the half-note R/R+ alternation still reads as a pedal with motion. The engine already binds the pedal for the mystery lanes.",
    "lane": "lh",
    "source_songs": [
      "oot_potion_shop",
      "oot_deku_last_words",
      "oot_ganondorf",
      "oot_requiem_spirit",
      "oot_kokiri"
    ],
    "finding": "The game lane's LH is the sparsest in the pack: 3.8 onsets/bar median (31 4/4 songs), note length 0.95 beats, 34% of onsets on beat 1, and game/mysterious runs 1.8 onsets/bar at 1.94 beats with a 2-semitone spread. The OoT figures are a whole-note octave dyad R.R+ (potion_shop 100% of bars, deku_last_words) or a half-note R then R+ (ganondorf 10 of 15 bars, requiem_spirit). The engine's game staples (fnd_drive_8th_root, fnd_octave_bounce_16ths) are 8 and 16 onsets a bar.",
    "hypothesis": "Over a modal minor loop the whole-note octave pedal and the half-note octave alternation read as Zelda / mystery; the straight root 8ths read as a chiptune motor and the 16th octave bounce as an action stage — the engine's two game staples are the wrong idiom for the calm/mysterious game cell.",
    "question": "Which left hand sounds like an overworld or a shop, and which like a stage you are running through? Does the half-note R/R+ alternation feel like motion or still like a pedal?",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "pedal_whole",
        "name": "whole-note octave dyad (oot_potion_shop, oot_deku_last_words)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2,a3] [f2,f3] [g2,g3] [a2,a3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5@2 g5 a5] [c5@3 ~] [d5 e5 g5@2] [a4@4]>\",\"sound\":\"gm_ocarina\",\"gain\":0.62,\"room\":0.4}],\"bpm\":90,\"bars\":4}"
        },
        "note": "reference: one attack a bar"
      },
      {
        "id": "half_octaves",
        "name": "half-note R then R+ (oot_ganondorf, oot_requiem_spirit)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 a3] [f2 f3] [g2 g3] [a2 a3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5@2 g5 a5] [c5@3 ~] [d5 e5 g5@2] [a4@4]>\",\"sound\":\"gm_ocarina\",\"gain\":0.62,\"room\":0.4}],\"bpm\":90,\"bars\":4}"
        },
        "note": "two attacks a bar"
      },
      {
        "id": "root_8ths",
        "name": "the engine's fnd_drive_8th_root: straight root 8ths",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2*8] [f2*8] [g2*8] [a2*8]>\",\"sound\":\"piano\",\"gain\":0.45,\"gainPattern\":\"0.5 0.38 0.44 0.38 0.48 0.38 0.44 0.38\"},{\"mini\":\"<[e5@2 g5 a5] [c5@3 ~] [d5 e5 g5@2] [a4@4]>\",\"sound\":\"gm_ocarina\",\"gain\":0.62,\"room\":0.4}],\"bpm\":90,\"bars\":4}"
        },
        "note": "eight attacks a bar, one pitch"
      },
      {
        "id": "octave_bounce_16ths",
        "name": "FALSIFICATION: the engine's fnd_octave_bounce_16ths",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3] [f2 f3 f2 f3 f2 f3 f2 f3 f2 f3 f2 f3 f2 f3 f2 f3] [g2 g3 g2 g3 g2 g3 g2 g3 g2 g3 g2 g3 g2 g3 g2 g3] [a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3 a2 a3]>\",\"sound\":\"piano\",\"gain\":0.4,\"gainPattern\":\"0.48 0.34 0.4 0.34 0.46 0.34 0.4 0.34 0.48 0.34 0.4 0.34 0.46 0.34 0.4 0.34\"},{\"mini\":\"<[e5@2 g5 a5] [c5@3 ~] [d5 e5 g5@2] [a4@4]>\",\"sound\":\"gm_ocarina\",\"gain\":0.62,\"room\":0.4}],\"bpm\":90,\"bars\":4}"
        },
        "note": "predicted to read as an action stage, not the calm cell"
      }
    ],
    "batch": 1
  },
  "pl_lh_ballad_emotion_density": {
    "id": "pl_lh_ballad_emotion_density",
    "worth": "skip",
    "expected": "Known: held blocks read sad, the 8th wave reads romantic, the pivot alberti / 16th two-register arp read calm-flowing; a 16th block-chord variant reads as an exercise. Density is the emotion dial and the engine already maps it that way.",
    "lane": "lh",
    "source_songs": [
      "young_and_beautiful",
      "hold_on",
      "another_love",
      "someone_you_loved",
      "pompeii",
      "someone_like_you"
    ],
    "finding": "Inside the ballad lane the LH density tracks the emotion label: ballad/sad (23 songs) 4.0 onsets/bar, top classes block/mixed, low midi 44; ballad/romantic (8) 5.5 onsets/bar, arp_mixed on 5 of 8; ballad/calm (6) 6.8 onsets/bar, alberti/arp; ballad/somber (3) 3.2 onsets/bar. young_and_beautiful holds a whole-bar R.3.5.R+ block on 57% of bars; someone_you_loved plays the pivot-on-the-fifth alberti R.3+ 5 3+ 5 3+ 5 3+ 5 on 63 of 79 bars.",
    "hypothesis": "With one melody and one loop, the LH density alone moves the read from sad (held block) to romantic (8th wave) to calm/flowing (pivot alberti and the 16th two-register arp); the falsification — the held block's chord tones repeated as 16th block chords — reads as a piano exercise (his law: repeated uniform anything), not as calm, because density without contour is not flow.",
    "question": "Which LH makes the same melody sound sad, which romantic, which calm? Does the 16th block-chord variant sound calm or like an exercise?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "sad_held_block",
        "name": "sad: one held block R 5 R+ 3+ a bar (young_and_beautiful, hold_on)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2,g2,c3,e3] [g1,d2,g2,b2] [a1,e2,a2,c3] [f1,c2,f2,a2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":80,\"bars\":4}"
        },
        "note": "reference: one attack a bar"
      },
      {
        "id": "romantic_wave",
        "name": "romantic: the 8th wave",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 e3 g2 c3 g2] [g2 d3 g3 d3 b3 d3 g3 d3] [a2 e3 a3 e3 c4 e3 a3 e3] [f2 c3 f3 c3 a3 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.56 0.42 0.46 0.42 0.5 0.42 0.46 0.42\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":80,\"bars\":4}"
        },
        "note": "eight attacks, contour up and back"
      },
      {
        "id": "calm_pivot_alberti",
        "name": "calm: pivot-on-the-fifth alberti R.3+ 5 3+ 5 3+ 5 3+ 5 (someone_you_loved)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,e3] g2 e3 g2 e3 g2 e3 g2] [[g1,b2] d2 b2 d2 b2 d2 b2 d2] [[a1,c3] e2 c3 e2 c3 e2 c3 e2] [[f1,a2] c2 a2 c2 a2 c2 a2 c2]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.56 0.42 0.46 0.42 0.5 0.42 0.46 0.42\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":80,\"bars\":4}"
        },
        "note": "the bass only on 1; the hand rocks between the third and the fifth"
      },
      {
        "id": "calm_two_register_16ths",
        "name": "calm/flowing: two-register 16ths R 5 R+ 5 | R+ 5+ R++ 5+ (someone_like_you chorus)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 g2 c3 g2 c2 g2 c3 g2 c3 g3 c4 g3 c3 g3 c4 g3] [g1 d2 g2 d2 g1 d2 g2 d2 g2 d3 g3 d3 g2 d3 g3 d3] [a1 e2 a2 e2 a1 e2 a2 e2 a2 e3 a3 e3 a2 e3 a3 e3] [f1 c2 f2 c2 f1 c2 f2 c2 f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.42,\"gainPattern\":\"0.5 0.36 0.4 0.36 0.46 0.36 0.4 0.36 0.48 0.36 0.4 0.36 0.46 0.36 0.4 0.36\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":80,\"bars\":4}"
        },
        "note": "sixteen attacks over two octaves"
      },
      {
        "id": "block_16ths",
        "name": "FALSIFICATION: the held block's tones as 16 repeated block chords",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,g2,c3,e3]*16] [[g1,d2,g2,b2]*16] [[a1,e2,a2,c3]*16] [[f1,c2,f2,a2]*16]>\",\"sound\":\"piano\",\"gain\":0.38,\"gainPattern\":\"0.45 0.33 0.36 0.33 0.42 0.33 0.36 0.33 0.44 0.33 0.36 0.33 0.42 0.33 0.36 0.33\"},{\"mini\":\"<[e5 g5 a5@2] [g5@3 d5] [c5 e5 a5@2] [a5@2 g5 ~]>\",\"sound\":\"gm_flute\",\"gain\":0.62,\"room\":0.3}],\"bpm\":80,\"bars\":4}"
        },
        "note": "predicted \"piano exercise\": density with no contour"
      }
    ],
    "batch": 1
  },
  "pl_form_pop_build_verse_chorus": {
    "id": "pl_form_pop_build_verse_chorus",
    "worth": "skip",
    "expected": "Known, and already your verdict: a chorus is a class change plus a register lift; a build made only by gain or only by an added octave does not read as a change (\"adding octaves is inaudible\"). The as-measured variant is the one the engine keeps.",
    "lane": "form",
    "source_songs": [
      "call_me_maybe",
      "viva_la_vida",
      "faded",
      "roar",
      "hello"
    ],
    "finding": "Verse->chorus in the pack (n=52 pop songs with >=2 sections): the LH CLASS changes in 75% (comp->block 8ths in call_me_maybe: LH 5.7 -> 12 onsets/bar), the LH density rises 1.4x (50% >=1.3x), the RH register lifts +3.5 st median — but pop velocity rises only +2.5 (35% >= +10) against +23.6 for ballads. call_me_maybe bar 13 plays its chorus block 8ths SOFTER per note (v44-59) than its verse (v56-71).",
    "hypothesis": "A pop chorus is heard as a class change (comp -> block 8ths in both hands) plus a register lift, at the SAME level; a build made only by adding an octave voice (his \"adding octaves is inaudible\") or only by gain will not read as a chorus, and the same-register block variant will read as a chorus with less lift.",
    "question": "Which of these reads as a verse going into a chorus — and does the one that only gets louder (or only adds an octave) read as any change at all?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "comp verse -> block-8ths chorus, RH dyads +5 st (call_me_maybe)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"gainPattern\":\"<0.7 0.7 0.7 0.7 0.7 0.7 0.7 0.7 0.66 0.66 0.66 0.66 0.66 0.66 0.66 0.66>\"}],\"bpm\":120,\"bars\":16}"
        },
        "note": "bars 1-8 the verse (LH bass + and-of-2 chord, single line), bars 9-16 the chorus (4-note LH chords on every 8th, RH dyads in 8ths a 5th higher, per-note gain slightly DOWN as measured) NOTE (verify pass): this reference runs the chorus LH at 12 vs 4.5 onsets/bar (x2.67) — call_me_maybe's own bar-13 jump; the pack MEDIAN chorus density ratio is x1.4, so this is the loud end of the measured range."
      },
      {
        "id": "flat_verse",
        "name": "the verse texture for all 16 bars (no build)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":16}"
        },
        "note": "control: same loop, no class change, no lift — does it read as a song or as a loop?"
      },
      {
        "id": "octave_add_only",
        "name": "verse texture + an added octave voice from bar 9 (his \"inaudible\" law)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.4,\"add\":12,\"mask\":\"<0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1>\"}],\"bpm\":120,\"bars\":16}"
        },
        "note": "falsification: development by doubling the line an octave up, nothing else changes — predicted to read as no chorus"
      },
      {
        "id": "class_change_same_register",
        "name": "block-8ths chorus but the RH stays at the verse register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [[e4,g4] [e4,g4] [f4,a4] [e4,g4] [c4,e4]@2 [e4,g4] ~] [[d4,g4] [d4,g4] [e4,a4] [d4,g4] [b3,d4]@3 ~] [[e4,a4] [e4,a4] [a4,c5] [e4,a4] [e4,g4]@2 [c4,e4] [e4,g4]] [[c4,f4]@2 [f4,a4] [f4,a4] [e4,g4]@3 ~] [[e4,g4] [e4,g4] [f4,a4] [e4,g4] [c4,e4]@2 [e4,g4] ~] [[d4,g4] [d4,g4] [e4,a4] [d4,g4] [b3,d4]@3 ~] [[e4,a4] [e4,a4] [a4,c5] [e4,a4] [e4,g4]@2 [c4,e4] [e4,g4]] [[c4,f4]@2 [f4,a4] [f4,a4] [e4,g4]@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":16}"
        },
        "note": "isolates the CLASS change from the register lift: chorus rhythm and thickness at the verse pitch"
      },
      {
        "id": "gain_only",
        "name": "verse texture, chorus bars only LOUDER (x1.3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.65>\"},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.6 0.6 0.6 0.6 0.6 0.6 0.6 0.6 0.78 0.78 0.78 0.78 0.78 0.78 0.78 0.78>\"}],\"bpm\":120,\"bars\":16}"
        },
        "note": "falsification: the ballad build (velocity +23) applied to a pop loop with no texture change — the pack says pop does not build this way"
      }
    ],
    "batch": 1
  },
  "pl_form_breakdown_grades": {
    "id": "pl_form_breakdown_grades",
    "lane": "form",
    "source_songs": [
      "someone_like_you",
      "call_me_maybe",
      "all_of_me",
      "let_her_go"
    ],
    "finding": "An interior section whose LH or RH density halves is RARE in pop (17% of 64 songs; ballads 35%, film 46%), sits at 0.5-0.7 of the form, and when it happens the LH thins while the RH KEEPS the tune (pop 11 LH-thins vs 5 RH-thins vs 0 both; ballad 27/14/4). someone_like_you bars 57-58: both hands drop to 2 attacks a bar, velocity 80 -> 49, nothing stops; call_me_maybe bars 60-62: LH block 8ths (12/bar) -> a 5-note rising arpeggio, RH held.",
    "hypothesis": "A breakdown reads as music when the LH changes CLASS and thins while the tune continues at a lower level; the D122 full stop (everything but a held root) and the melody-alone cut will read as \"the piano disappears\", and the no-breakdown control will not read as a song section at all.",
    "question": "Bars 5-8 of each: which drop reads as a deliberate breakdown, which as the piano dropping out, and is the no-drop version missing anything?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "LH thins to fifths on 1 and 3, tune continues at -35% (someone_like_you)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,g3]@2 [c3,g3]@2] [[g2,d3]@2 [g2,d3]@2] [[a2,e3]@2 [a2,e3]@2] [[f2,c3]@2 [f2,c3]@2] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.7 0.7 0.7 0.7 0.45 0.45 0.45 0.45 0.7 0.7 0.7 0.7>\"},{\"mini\":\"md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_kick\",\"gain\":0.45,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"}],\"bpm\":120,\"bars\":12}"
        },
        "note": "bars 5-8: LH from block 8ths to two fifths a bar, RH keeps the dyad hook softer. The kick/snare bed drops with the LH here — that is this page's bed, not the finding (the pack files are drumless piano)"
      },
      {
        "id": "lh_class_change",
        "name": "LH becomes a rising 5-note arpeggio, RH held tones (call_me_maybe bridge)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [c3 e3 g3 c4 ~ ~ ~ ~] [g3 b3 d3 g4 ~ ~ ~ ~] [a3 c3 e3 a4 ~ ~ ~ ~] [f3 a3 c3 f4 ~ ~ ~ ~] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5]@4 [e4,g4]@4] [[g4,b4]@4 [d4,g4]@4] [[a4,c5]@4 [e4,a4]@4] [[f4,a4]@4 [g4,c5]@4] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.7 0.7 0.7 0.7 0.5 0.5 0.5 0.5 0.7 0.7 0.7 0.7>\"},{\"mini\":\"md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_kick\",\"gain\":0.45,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"}],\"bpm\":120,\"bars\":12}"
        },
        "note": "the other pack shape: a CLASS change in the LH (arp_up) under a held RH — the tune becomes its landing tones"
      },
      {
        "id": "d122_held_root",
        "name": "the engine: acc + drums stop, held root floor <= C3, tune alone",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] c2@4 g2@4 a2@4 f2@4 [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_kick\",\"gain\":0.45,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"}],\"bpm\":120,\"bars\":12}"
        },
        "note": "D122's device as shipped: the whole accompaniment is replaced by one held root a bar"
      },
      {
        "id": "melody_alone_cut",
        "name": "everything stops except the tune (the 0/1 mask artefact)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"<[[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_kick\",\"gain\":0.45,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22,\"mask\":\"<1 1 1 1 0 0 0 0 1 1 1 1>\"}],\"bpm\":120,\"bars\":12}"
        },
        "note": "falsification: the r22 artefact — a hard cut of the whole base mix — predicted \"abrupt\""
      },
      {
        "id": "no_breakdown",
        "name": "the chorus texture for 12 bars (control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~] [[g4,c5] [g4,c5] [a4,c5] [g4,c5] [e4,g4]@2 [g4,c5] ~] [[g4,b4] [g4,b4] [a4,d5] [g4,b4] [d4,g4]@3 ~] [[a4,c5] [a4,c5] [c5,e5] [a4,c5] [g4,c5]@2 [e4,a4] [g4,c5]] [[f4,a4]@2 [a4,c5] [a4,c5] [g4,c5]@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_kick\",\"gain\":0.45,\"mask\":\"<1 1 1 1 1 1 1 1 1 1 1 1>\"},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4,\"mask\":\"<1 1 1 1 1 1 1 1 1 1 1 1>\"},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22,\"mask\":\"<1 1 1 1 1 1 1 1 1 1 1 1>\"}],\"bpm\":120,\"bars\":12}"
        },
        "note": "his \"there doesn't have to be a beat drop in every song\": is anything missing?"
      }
    ],
    "batch": 1
  },
  "pl_form_intro_length_hook_first": {
    "id": "pl_form_intro_length_hook_first",
    "lane": "form",
    "source_songs": [
      "a_thousand_miles",
      "heart_attack",
      "catch_my_breath",
      "summertime_sadness",
      "listen_to_your_heart"
    ],
    "finding": "Intros are near zero: the tune (>=2 RH onsets/bar for 2 bars) starts at bar 0 in 47-63% of songs and within 1 loop in 88%; in seconds the median is 0 (pop 1.9 s, p75 6 s) and only 5% exceed the engine's 16-second cap. Pop opens with its HOOK at the top register: the first section is the register maximum in 37% of pop songs (ballad 18%) — a_thousand_miles bars 1-3 riff at midi 82-83 then the verse at 71-78; heart_attack bar 0 at 85 then a verse at 56-61.",
    "hypothesis": "The hook-first opening reads as pop; a 4-bar LH-only intro is tolerated; an 8-bar (16 s at 120) LH-only intro reads as waiting, so the engine's 16-second cap is at the far tail of what the pack does, not its centre.",
    "question": "How many bars of accompaniment alone are you willing to wait before the tune — and does opening with the hook at the top register (then dropping to the verse) sound like pop or like starting in the middle?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "tune at bar 0 (pack median intro = 0 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":16}"
        },
        "note": "no intro at all"
      },
      {
        "id": "intro_1_loop",
        "name": "4-bar LH-only intro (one loop, 8 s), tune from bar 5",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"mask\":\"<0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1>\"}],\"bpm\":120,\"bars\":16}"
        },
        "note": "the pack's p75 (6 s) rounded to a whole loop"
      },
      {
        "id": "intro_2_loops",
        "name": "8-bar LH-only intro (two loops = the engine's 16-second cap)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"mask\":\"<0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1>\"}],\"bpm\":120,\"bars\":16}"
        },
        "note": "falsification: predicted to read as waiting — only 5% of the pack waits this long"
      },
      {
        "id": "hook_first_top",
        "name": "the hook at the chorus register for 4 bars, THEN the verse (a_thousand_miles / heart_attack)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3]] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[[g4,c5] g4 [a4,c5] g4 [e4,g4]@2 g4 ~] [[g4,b4] g4 [a4,d5] g4 [d4,g4]@3 ~] [[a4,c5] a4 [c5,e5] a4 [g4,c5]@2 e4 g4] [[f4,a4]@2 a4 [a4,c5] [g4,c5]@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":16}"
        },
        "note": "the pop opening: the riff stated first an octave-ish above the verse line, over quarter octaves; the verse then drops 5-10 st"
      }
    ],
    "batch": 1
  },
  "pl_form_drum_groove_ladder": {
    "id": "pl_form_drum_groove_ladder",
    "worth": "skip",
    "expected": "Known: the backbeat snare is what makes it pop; kick+hat alone reads as a click track (the drum-default bug in CLAUDE.md); four-on-the-floor flips the same loop to EDM; 16th hats read busier, not more pop. The open decision (mid band replaces high, or a third pick) is mine to make and measure, not yours to hear here.",
    "lane": "form",
    "source_songs": [
      "every_breath_you_take",
      "love_song_bareilles",
      "listen_to_your_heart",
      "the_way_it_is",
      "faded",
      "just_give_me_a_reason"
    ],
    "finding": "Every 4/4 drum part in the multi-track pack (12 of 12 dominant one-bar grooves) has a snare on beat 4 and 10 of 12 on beats 2 AND 4; the kick is on beat 1 in 11 of 12 (pink_panther's dominant bar has none), on the and-of-2 (slot 6) in 5, on beat 3 in 8; 8th-note hats or shakers in 6 of 12, 16th hats in 2 (drops_of_jupiter, the_way_it_is), the rest ride / hand-drum / none. The engine's default kit is kick + hat with NO snare (0 mid-band picks on 33 judged songs). The canonical pop-rock bar: hat 8ths, kick 0/6/8, snare 4/12 (every_breath_you_take 39 bars, love_song_bareilles 26, listen_to_your_heart 34).",
    "hypothesis": "The backbeat snare is what makes a groove read as pop; the engine's kick+hat default reads as a metronome under the same piano, four-on-the-floor flips the SAME loop to EDM, and the 16th-hat version reads busier without more energy.",
    "question": "Under the same piano loop: which kit makes it a pop song, which sounds like a click track, and does the four-on-the-floor version stop being pop?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "no_drums",
        "name": "piano only (the two-track pack: 89% of files)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "control"
      },
      {
        "id": "engine_kick_hat",
        "name": "kick 1+3 and hat 8ths, no snare (the engine default)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"[md_kick ~ ~ ~ ~ ~ ~ ~ md_kick ~ ~ ~ ~ ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22}],\"bpm\":120,\"bars\":8}"
        },
        "note": "falsification: the judged suite's kit — predicted to read as a metronome"
      },
      {
        "id": "pop_rock_backbeat",
        "name": "hat 8ths, kick 1 / and-of-2 / 3, snare 2 and 4 (the pack's canonical bar)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"[md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"[~ ~ ~ ~ md_snare ~ ~ ~ ~ ~ ~ ~ md_snare ~ ~ ~]\",\"sound\":\"md_snare\",\"gain\":0.4},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22}],\"bpm\":120,\"bars\":8}"
        },
        "note": "every_breath_you_take / love_song_bareilles / listen_to_your_heart groove"
      },
      {
        "id": "sixteenth_hat",
        "name": "hat 16ths, kick 1 / e-of-1 / and-of-2 / 3 / a-of-4, snare 2 and 4 (the_way_it_is)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"[md_kick ~ ~ md_kick ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ md_kick ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"[~ ~ ~ ~ md_snare ~ ~ ~ ~ ~ ~ ~ md_snare ~ ~ ~]\",\"sound\":\"md_snare\",\"gain\":0.4},{\"mini\":\"md_hat*16\",\"sound\":\"md_hat\",\"gainPattern\":\"0.22 0.12 0.18 0.12 0.22 0.12 0.18 0.12 0.22 0.12 0.18 0.12 0.22 0.12 0.18 0.12\"}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the busier of the two pop grooves, hats accented on the 8ths"
      },
      {
        "id": "four_on_floor",
        "name": "kick on every beat, snare 2 and 4, hat 8ths (faded)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"[md_kick ~ ~ ~ md_kick ~ ~ ~ md_kick ~ ~ ~ md_kick ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"[~ ~ ~ ~ md_snare ~ ~ ~ ~ ~ ~ ~ md_snare ~ ~ ~]\",\"sound\":\"md_snare\",\"gain\":0.35},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the EDM kit under the pop piano — does the LANE flip with the kick alone?"
      },
      {
        "id": "ballad_halftime",
        "name": "kick 1 / and-of-2, snare 4 only with a drag on the e-and of 1, ride on 1 (just_give_me_a_reason)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"[md_kick ~ ~ ~ ~ ~ md_kick ~ ~ ~ md_kick ~ ~ ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"[~ ~ md_snare md_snare ~ ~ ~ ~ ~ ~ ~ ~ md_snare ~ ~ ~]\",\"sound\":\"md_snare\",\"gainPattern\":\"0 0 0.16 0.2 0 0 0 0 0 0 0 0 0.4 0 0 0\"},{\"mini\":\"md_hat ~ ~ ~ ~ ~ ~ ~\",\"sound\":\"md_hat\",\"gain\":0.25}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the ballad kit: half-time feel, snare on 4 with ghost drag — under a 120 bpm pop loop, does it halve the tempo?"
      }
    ],
    "batch": 1
  },
  "pl_form_velocity_arc_terrace": {
    "id": "pl_form_velocity_arc_terrace",
    "worth": "skip",
    "expected": "Known: the section terrace is what reads as a build; per-bar crescendo ramps and within-bar accents read as human but not as a section change; a falling arc reads as an outro. Both are used where they belong.",
    "lane": "form",
    "source_songs": [
      "someone_like_you",
      "hello",
      "let_her_go",
      "all_of_me",
      "call_me_maybe"
    ],
    "finding": "In 151 4/4 files with real velocity data (>=20 distinct values) the chorus section is louder than the verse by +22 velocity (64% of songs >= +8; median means 63.6 -> 85.7) while the WITHIN-section spread stays constant (p10-p90 = 24 in the verse, 22.5 in the chorus); inside a bar the median range is 27 velocity units over 10 distinct values; melody peaks are +2.9 louder than their neighbours (49% of songs > +3, 6% < -3), on-beats +1.8 over off-8ths, the LH -3.6 under the RH. The velocity peak of a form sits at 0.6-0.8 of the song (edm 0.8, rock 0.7). The engine realized ONE velocity per layer on all 47 songs until r33.",
    "hypothesis": "A section-level terrace (+22 velocity, ~x1.3 gain) is what he hears as a build; per-bar crescendo ramps and within-bar accents add \"human\" but do not by themselves read as a section change; the falling arc reads as an outro, not a form.",
    "question": "Which one has a chorus? Do the within-bar accents (variant 5) sound played rather than typed, and is the crescendo ramp (variant 3) a build or a fade-in?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "flat",
        "name": "one gain for 16 bars (the engine before r33)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":88,\"bars\":16}"
        },
        "note": "control: uniform velocity"
      },
      {
        "id": "terrace_as_measured",
        "name": "verse 8 bars, chorus 8 bars at x1.3 (the pack's +22 velocity step)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.42 0.42 0.42 0.42 0.42 0.42 0.42 0.42 0.55 0.55 0.55 0.55 0.55 0.55 0.55 0.55>\"},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.58 0.58 0.58 0.58 0.58 0.58 0.58 0.58 0.76 0.76 0.76 0.76 0.76 0.76 0.76 0.76>\"}],\"bpm\":88,\"bars\":16}"
        },
        "note": "one step at bar 9, nothing else changes"
      },
      {
        "id": "ramp",
        "name": "a bar-by-bar crescendo over 16 bars to the same peak",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.36 0.37 0.38 0.4 0.41 0.43 0.44 0.46 0.47 0.49 0.5 0.51 0.52 0.53 0.54 0.55>\"},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.5 0.52 0.54 0.55 0.57 0.59 0.6 0.62 0.64 0.66 0.68 0.7 0.72 0.73 0.75 0.76>\"}],\"bpm\":88,\"bars\":16}"
        },
        "note": "the same distance, spread as a ramp: build or fade-in?"
      },
      {
        "id": "falling_outro",
        "name": "chorus first, then falling to the verse level (the ballad \"falling\" arc = an outro)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.55 0.55 0.55 0.55 0.55 0.55 0.55 0.55 0.5 0.47 0.45 0.43 0.42 0.4 0.38 0.35>\"},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gainPattern\":\"<0.76 0.76 0.76 0.76 0.76 0.76 0.76 0.76 0.7 0.66 0.62 0.6 0.58 0.55 0.52 0.48>\"}],\"bpm\":88,\"bars\":16}"
        },
        "note": "falsification: 23 of 78 ballads read \"falling\" only because their last section is a short outro"
      },
      {
        "id": "within_bar_accents",
        "name": "flat section level, but downbeat + melody-peak accents inside every bar (27-unit range)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gainPattern\":\"0.5 0.36 0.42 0.36 0.46 0.36 0.42 0.36\"},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gainPattern\":\"0.72 0.55 0.6 0.5 0.66 0.55 0.6 0.5\"}],\"bpm\":88,\"bars\":16}"
        },
        "note": "D123's question: the per-bar envelope alone — human, or still no form?"
      }
    ],
    "batch": 1
  },
  "pl_form_layer_entry_grid_or_pickup": {
    "id": "pl_form_layer_entry_grid_or_pickup",
    "lane": "form",
    "source_songs": [
      "listen_to_your_heart",
      "drops_of_jupiter",
      "love_song_bareilles",
      "forget_you",
      "the_way_it_is"
    ],
    "finding": "In the five pop multi-tracks, 43 layer entries after the first: 24 (56%) land on the 4-bar grid, 10 (23%) land ONE BAR EARLY as a pickup into the grid (listen_to_your_heart entries at bars 3, 15, 31 before its 4/16/32; drops_of_jupiter 47 before 48; love_song_bareilles 19 before 20), 9 (21%) mid-phrase. Over all 28 multi-tracks (121 entries): 36% on grid, 18% one bar early, 45% mid — the mid share is carried by classical/film files. Only 7% of entries coincide with a texture-segmenter boundary.",
    "hypothesis": "A new layer entering one bar BEFORE the phrase boundary with a pickup reads as musical and \"not section-locked\" (the r17 ask); entering one bar AFTER the boundary reads as late; entering exactly on the boundary reads as correct but mechanical.",
    "question": "Bars 4-6: which entry of the low counter-line sounds intended — on the downbeat of bar 5, the pickup from bar 4, or the bar-6 entry — and does any of them sound like a mistake?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "on_grid",
        "name": "counter-line enters on bar 5 (the 4-bar grid)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<~ ~ ~ ~ [e3 ~ g3 ~ ~ ~ ~ ~] [d3 ~ b2 ~ ~ ~ ~ ~] [c3 ~ e3 ~ ~ ~ ~ ~] [a2 ~ c3 ~ ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4}],\"bpm\":120,\"bars\":8}"
        },
        "note": "56% of pop entries; the counter-line's first onset is the DOWNBEAT of bar 5 (the verify pass caught the first draft entering on beat 3)"
      },
      {
        "id": "pickup_one_early",
        "name": "counter-line enters with a two-note pickup at the end of bar 4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<~ ~ ~ [~ ~ ~ ~ ~ ~ c3 d3] [e3 ~ g3 ~ ~ ~ ~ ~] [d3 ~ b2 ~ ~ ~ ~ ~] [c3 ~ e3 ~ ~ ~ ~ ~] [a2 ~ c3 ~ ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4}],\"bpm\":120,\"bars\":8}"
        },
        "note": "23% of pop entries: the anticipation into the grid"
      },
      {
        "id": "late_one_after",
        "name": "counter-line enters on bar 6",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<~ ~ ~ ~ ~ [d3 ~ b2 ~ ~ ~ ~ ~] [c3 ~ e3 ~ ~ ~ ~ ~] [a2 ~ c3 ~ ~ ~ ~ ~] [e3 ~ g3 ~ ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4}],\"bpm\":120,\"bars\":8}"
        },
        "note": "falsification: mid-phrase entry, predicted to read as late"
      },
      {
        "id": "from_bar_2",
        "name": "counter-line enters on bar 2 (early, off-grid)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<~ [d3 ~ b2 ~ ~ ~ ~ ~] [c3 ~ e3 ~ ~ ~ ~ ~] [a2 ~ c3 ~ ~ ~ ~ ~] [e3 ~ g3 ~ ~ ~ ~ ~] [d3 ~ b2 ~ ~ ~ ~ ~] [c3 ~ e3 ~ ~ ~ ~ ~] [a2 ~ c3 ~ ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the other mid-phrase case: does an early off-grid entry read as intended when it is still inside the first phrase?"
      }
    ],
    "batch": 1
  },
  "pl_mix_lh_class_flips_lane": {
    "id": "pl_mix_lh_class_flips_lane",
    "worth": "skip",
    "expected": "Near-duplicate of #2 (the LH class alone names the genre): held R+5 = game, quarter octaves = rock ballad, 8th octaves = EDM, frozen cell = film, comp = pop. Your answer on #2 covers it.",
    "lane": "mix",
    "source_songs": [
      "call_me_maybe",
      "oot_potion_shop",
      "oot_deku_last_words",
      "viva_la_vida",
      "i_need_your_love",
      "alone_pt2"
    ],
    "finding": "At the same tempo band the lanes differ mostly by LH class: game LH is 3.6 onsets/bar with 0.95-beat notes and R.R+ held from the downbeat (oot_potion_shop, oot_deku_last_words, the_office: \"R.R+ @ 0/8\"), pop is comp 15 / block 12 of 64 songs at 4.9 onsets/bar, rock/ballad share the quarter-note octave figure R.R+ x4 (another_love, i_need_your_love, viva_la_vida, human_perri), edm runs 6.2 onsets/bar with 43% off-8ths. The RH melody grammar barely differs (5.2 vs 4.3 onsets/bar).",
    "hypothesis": "Swapping only the LH class under an unchanged pop loop and tune moves the lane label: the held root+5th reads Zelda/game, quarter octaves read rock ballad, 8th octaves read EDM, the frozen cell reads film — and the comp reads pop.",
    "question": "Same tune, same chords, same tempo: name the genre of each — and which LH makes the tune itself sound different?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "pop_comp",
        "name": "comp: bass on 1, chord on the and-of-2, single on 3-and (pop)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "reference"
      },
      {
        "id": "game_pedal",
        "name": "root + 5th held for the whole bar (Zelda OoT: R.R+ @0)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2,g2] [g2,d3] [a2,e3] [f2,c3] [c2,g2] [g2,d3] [a2,e3] [f2,c3]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "game lane: one onset a bar"
      },
      {
        "id": "rock_quarter_octaves",
        "name": "octaves on every quarter (the pack's most shared figure)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "viva_la_vida / i_need_your_love"
      },
      {
        "id": "edm_octave_8ths",
        "name": "octaves on every 8th",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the pulse — does it flip to EDM without a kick?"
      },
      {
        "id": "film_frozen_cell",
        "name": "a frozen a2-e3-a3-e3 8th cell that never re-pitches (film ostinato)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":120,\"bars\":8}"
        },
        "note": "falsification: over C G Am F the frozen cell puts A against G — predicted \"film\" or \"wrong\", not pop"
      }
    ],
    "batch": 1
  },
  "pl_mix_film_ostinato_under_sad_ballad": {
    "id": "pl_mix_film_ostinato_under_sad_ballad",
    "worth": "skip",
    "expected": "Known: a frozen 8th cell over a moving loop reads film (the R2 device you already judged on the layerstack page); the same cell re-pitched per chord is an ordinary ballad arpeggio. Nothing here changes the engine.",
    "lane": "mix",
    "source_songs": [
      "someone_like_you",
      "interstellar",
      "einaudi_i_giorni",
      "the_scientist",
      "hello"
    ],
    "finding": "ballad/sad (n=29) is 88 bpm, 72% MAJOR keys, the sparsest LH of the ballad cells (3.8 onsets/bar; block 7 / mixed 5 / arp 5 songs) and a lift of 8 st; film (n=28) is 79% minor, 5.4 LH onsets/bar with 28% odd-16th onsets (ballad 3%) — i.e. a driven cell, and its RH climax sits latest (0.57). The r30 synthRise reading: the film cell does NOT follow the chord (one 3-note cell over five basses).",
    "hypothesis": "A frozen 8th cell under the sad-ballad loop turns it into film (Zimmer/Einaudi) at the same tempo, harmony and tune; the same cell re-pitched per chord is heard as a ballad arpeggio, not film; the frozen cell over the whole loop is the mechanism, not the density.",
    "question": "Bars 1-8 each: which is a sad ballad and which is a film cue — and is the re-pitched cell (variant 3) still film, or has it become an ordinary ballad arpeggio?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "sad_ballad_block",
        "name": "block chords, 4 onsets a bar (ballad/sad reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,e2] [c3,e3,a3] [a2,e2] [c3,e3,a3]] [[f2,c2] [a3,c3,f3] [f2,c2] [a3,c3,f3]] [[c2,g2] [e3,g3,c3] [c2,g2] [e3,g3,c3]] [[g2,d2] [b3,d3,g3] [g2,d2] [b3,d3,g3]] [[a2,e2] [c3,e3,a3] [a2,e2] [c3,e3,a3]] [[f2,c2] [a3,c3,f3] [f2,c2] [a3,c3,f3]] [[c2,g2] [e3,g3,c3] [c2,g2] [e3,g3,c3]] [[g2,d2] [b3,d3,g3] [g2,d2] [b3,d3,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "reference: root-fifth on 1 and 3, chord on 2 and 4"
      },
      {
        "id": "frozen_cell",
        "name": "the a2-e3-a3-e3 cell in 8ths, frozen across Am F C G",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "the film mechanism: A and E stay while the harmony moves (6th/3rd over C, 3rd/7th over F, 9th/13th over G)"
      },
      {
        "id": "cell_repitched",
        "name": "the same R-5-R+-5 cell re-pitched on every chord",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c2 g3 c3 g3 c2 g3 c3 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c2 g3 c3 g3 c2 g3 c3 g3] [g2 d3 g3 d3 g2 d3 g3 d3]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "falsification: same density, same rhythm — predicted to read as a ballad arpeggio, not film"
      },
      {
        "id": "frozen_cell_16ths",
        "name": "the frozen cell at 16ths (double density)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3] [a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3 a2 e3 a3 e3]>\",\"sound\":\"piano\",\"gain\":0.4},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "is the film reading about the freeze or about the drive?"
      },
      {
        "id": "frozen_cell_strings",
        "name": "the frozen cell on strings under the block ballad LH",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,e2] [c3,e3,a3] [a2,e2] [c3,e3,a3]] [[f2,c2] [a3,c3,f3] [f2,c2] [a3,c3,f3]] [[c2,g2] [e3,g3,c3] [c2,g2] [e3,g3,c3]] [[g2,d2] [b3,d3,g3] [g2,d2] [b3,d3,g3]] [[a2,e2] [c3,e3,a3] [a2,e2] [c3,e3,a3]] [[f2,c2] [a3,c3,f3] [f2,c2] [a3,c3,f3]] [[c2,g2] [e3,g3,c3] [c2,g2] [e3,g3,c3]] [[g2,d2] [b3,d3,g3] [g2,d2] [b3,d3,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4] [a3 e4 a4 e4 a3 e4 a4 e4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"release\":0.3},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "the cell as a LAYER over the ballad piano (strings law levels): film, or ballad with strings?"
      }
    ],
    "batch": 1
  },
  "pl_mix_edm_pulse_under_ballad": {
    "id": "pl_mix_edm_pulse_under_ballad",
    "worth": "skip",
    "expected": "Known: octave 8ths at 88 read as a rock ballad; the EDM flip needs 120 AND the four-on-the-floor kick; block 8ths at 88 read as a chorus. The engine already gates the lane on tempo + kit, not the LH alone.",
    "lane": "mix",
    "source_songs": [
      "alone_pt2",
      "diamond_heart",
      "faded",
      "i_need_your_love",
      "another_love"
    ],
    "finding": "edm (n=16) sits at 120 bpm with 6.2 LH onsets/bar and 43% off-8ths; the quarter-octave figure R.R+ x4 is shared by ballad AND edm songs (another_love, i_need_your_love), and faded's drop is block chords at 26 LH onsets/bar. ballad/sad is 88 bpm at 3.8 onsets/bar. The two lanes share loops (I V vi IV: 9 ballads, 1 edm) — what differs is LH density and tempo.",
    "hypothesis": "The LH alone does not flip a ballad to EDM: octave 8ths at 88 bpm read as a rock ballad; the flip needs the tempo (120) AND the four-on-the-floor kick together; block 8ths at 88 read as a chorus, not a drop.",
    "question": "Which of these is EDM? Is it the LH pulse, the tempo, or the kick that makes the flip — and does the 88 bpm pulse (variant 2) sound like a ballad wearing a costume?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "ballad_arp_88",
        "name": "ballad arpeggio R 5 R+ 3+ 5+ 3+ R+ 5 at 88 (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "alone_alan_walker's own figure at ballad tempo"
      },
      {
        "id": "octave_8ths_88",
        "name": "octave 8ths at 88",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "the EDM LH at the ballad tempo — falsification of \"LH alone flips it\""
      },
      {
        "id": "octave_8ths_124",
        "name": "octave 8ths at 124",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":124,\"bars\":8}"
        },
        "note": "tempo added"
      },
      {
        "id": "octave_8ths_124_kick",
        "name": "octave 8ths at 124 + four-on-the-floor kick and off-beat hat",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]] [[a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3] [a2,a3]] [[f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3] [f2,f3]] [[c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3] [c2,c3]] [[g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3] [g2,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65},{\"mini\":\"md_kick md_kick md_kick md_kick\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"~ md_hat ~ md_hat ~ md_hat ~ md_hat\",\"sound\":\"md_hat\",\"gain\":0.2}],\"bpm\":124,\"bars\":8}"
        },
        "note": "the full EDM recipe"
      },
      {
        "id": "block_8ths_88",
        "name": "block chords on every 8th at 88 (faded's drop shape at ballad tempo)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]] [[a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3] [a2,c3,e3,a3]] [[f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3] [f2,a2,c3,f3]] [[c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4] [c3,e3,g3,c4]] [[g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3] [g2,b2,d3,g3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "density without tempo: a drop or a chorus?"
      }
    ],
    "batch": 1
  },
  "pl_combo_pop_pattern_voice_swap": {
    "id": "pl_combo_pop_pattern_voice_swap",
    "worth": "skip",
    "expected": "Known: piano, epiano and nylon guitar keep the pop label; marimba turns the same pattern into game/jungle (the D94 jungle voice); a pad+bass split loses the comp rhythm. The label is the pattern plus its acc family, which is already how the planner casts.",
    "lane": "combo",
    "source_songs": [
      "call_me_maybe",
      "forget_you",
      "love_song_bareilles",
      "the_way_it_is"
    ],
    "finding": "The pop comp (bass on 1, chord on the and-of-2) + RH comp dyads + tune is the pack's pop piano shape (comp 15 of 64 songs; call_me_maybe bars 10-12). In the multi-tracks the same material is spread over acc instruments: piano 46 of 172 parts, guitar 25, ensemble 25, organ 6, epiano/vibraphone in forget_you and love_song_bareilles.",
    "hypothesis": "The pop label survives the voice swap on piano, epiano and nylon guitar (the pack's own acc families); marimba turns the same pattern into game/jungle and the pad+bass split loses the comp's rhythm entirely — the LABEL is carried by the pattern first and the voice second, but marimba is the exception.",
    "question": "Same pattern on five voices: which still say pop, which one becomes a different genre, and is the nylon guitar version better than the piano?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "piano",
        "name": "piano (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"piano\",\"gain\":0.5599999999999999},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the pack"
      },
      {
        "id": "epiano",
        "name": "electric piano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5599999999999999},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "forget_you's acc voice"
      },
      {
        "id": "nylon",
        "name": "nylon guitar",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_acoustic_guitar_nylon\",\"gain\":0.55},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_acoustic_guitar_nylon\",\"gain\":0.6000000000000001},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"gm_acoustic_guitar_nylon\",\"gain\":0.75,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "stairway's acc voice"
      },
      {
        "id": "marimba",
        "name": "marimba",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.5},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.5599999999999999},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "falsification: predicted to leave pop for game/jungle"
      },
      {
        "id": "pad_bass_split",
        "name": "LH on synth bass, chords on warm pad, tune on epiano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"<[c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3,\"room\":0.4},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the comp's and-of-2 rhythm is gone — does the pattern still read pop when only its chords survive?"
      }
    ],
    "batch": 1
  },
  "pl_combo_band_split_bass_epiano": {
    "id": "pl_combo_band_split_bass_epiano",
    "worth": "skip",
    "expected": "Known arranging practice: a band bass plays the simplified line (root on 1, 5th on the and-of-2, root on 3) and the chords move to the acc voice; a bass that plays the piano LH literally reads as the wrong player. The engine writes the simplified bass (the D94 tumbao / the funk bounce) and never hands it the LH.",
    "lane": "combo",
    "source_songs": [
      "love_song_bareilles",
      "listen_to_your_heart",
      "drops_of_jupiter",
      "every_breath_you_take",
      "the_way_it_is"
    ],
    "finding": "In the 28 multi-tracks the bass role sits at midi 38.5 (median), covers 89% of bars, plays 3.2 onsets per active bar (the piano LH plays 4.9) and is monophonic (poly 0.004); the acc role sits at 61 with 4.8 onsets/bar and dyads on 53% of its onsets; the pad at 66, 1.5 onsets/bar, 3-beat notes, 43% coverage. Pairs share a GM family in 26% of cases and strike together on >50% of onsets in 69%.",
    "hypothesis": "The band split works when the bass is SIMPLIFIED to the measured bass density (root on 1, 5th on the and-of-2, root on 3) and the chords move to the acc voice; a bass that plays the piano LH literally (dyads, 4.9 onsets) reads muddy; adding the pad at strings-law level thickens without clashing.",
    "question": "Which split sounds like a band and which like a piano part handed to the wrong player — and does the pad (variant 4) add anything the piano did not already say?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "piano_solo",
        "name": "piano arrangement (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"piano\",\"gain\":0.55},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the two-hand shape"
      },
      {
        "id": "bass_simplified_epiano",
        "name": "acoustic bass at 3 onsets/bar + epiano comp + piano tune",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the measured band: bass root/5th/root, chords on the and-of-2 in the epiano"
      },
      {
        "id": "bass_plays_lh_literally",
        "name": "acoustic bass plays the whole LH figure including the chord",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "falsification: dyads and 4.9 onsets on a bass — predicted muddy"
      },
      {
        "id": "band_plus_pad",
        "name": "the simplified band + warm pad at 0.22 / room 0.5",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4},{\"mini\":\"<[c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.22,\"room\":0.5,\"attack\":0.2,\"release\":0.4},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12}],\"bpm\":120,\"bars\":8}"
        },
        "note": "pad at the pack's role numbers: 1 onset a bar, 3-4 beats, register 60-70"
      },
      {
        "id": "band_plus_backbeat",
        "name": "the simplified band + the pack's pop-rock kit",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~] [c2 ~ ~ ~ ~ ~ g2 ~ c2 ~ ~ ~ ~ ~ ~ ~] [g2 ~ ~ ~ ~ ~ d2 ~ g2 ~ ~ ~ ~ ~ ~ ~] [a2 ~ ~ ~ ~ ~ e2 ~ a2 ~ ~ ~ ~ ~ ~ ~] [f2 ~ ~ ~ ~ ~ c2 ~ f2 ~ ~ ~ ~ ~ ~ ~]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,g3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [d3,g3,b3] ~ ~ ~ ~ b3 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [e3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ [f3,a3,c4] ~ ~ ~ ~ c4 ~ ~ ~ ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.45},{\"mini\":\"<[~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~] [~ ~ ~ ~ [e4,g4] ~ ~ ~ [e4,g4] ~ ~ ~ ~ ~ [c4,e4] ~] [~ ~ ~ ~ [b4,d4] ~ ~ ~ [b4,d4] ~ ~ ~ ~ ~ [g4,b4] ~] [~ ~ ~ ~ [c4,e4] ~ ~ ~ [c4,e4] ~ ~ ~ ~ ~ [a4,c4] ~] [~ ~ ~ ~ [a4,c4] ~ ~ ~ [a4,c4] ~ ~ ~ ~ ~ [f4,a4] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.4},{\"mini\":\"<[e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~] [e4 e4 g4 g4 a4@2 g4 ~] [d4 d4 e4 d4 b3@3 ~] [c4 c4 e4 e4 g4 e4 d4@2] [c4@2 a3 c4 d4@3 ~]>\",\"sound\":\"piano\",\"gain\":0.7,\"add\":12},{\"mini\":\"[md_kick ~ ~ ~ ~ ~ md_kick ~ md_kick ~ ~ ~ ~ ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.45},{\"mini\":\"~ md_snare ~ md_snare\",\"sound\":\"md_snare\",\"gain\":0.4},{\"mini\":\"md_hat*8\",\"sound\":\"md_hat\",\"gain\":0.22}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the full 5-part pop multi-track shape (concurrency 5.2 in the >=6-part songs)"
      }
    ],
    "batch": 1
  },
  "pl_combo_strings_pad_levels": {
    "id": "pl_combo_strings_pad_levels",
    "worth": "skip",
    "expected": "Already your findings: a pad at the D77 level in the pack register entering at bar 5 reads as the song opening up; from bar 1 it is a wash; loud and dry (0.45, no room) is the r33 \"robotic\" sad-shop finding; an octave higher collides with the tune.",
    "lane": "combo",
    "source_songs": [
      "just_give_me_a_reason",
      "listen_to_your_heart",
      "forget_you",
      "my_heart_will_go_on",
      "every_breath_you_take"
    ],
    "finding": "Pads in the multi-tracks (21 of 172 parts): 1.5 onsets/bar, 3-beat notes, median pitch 66 (under the lead at 71, over the acc at 61), covering 43% of bars — they ENTER mid-song (just_give_me_a_reason strings at bar 22 of 97, every_breath_you_take strings at 26 of 115, listen_to_your_heart choir at 16). His strings law: gain <= 0.25, room >= 0.45, notes >= a beat.",
    "hypothesis": "A pad at the law's level, in the pack's register, entering at bar 5 reads as the song opening up; the same pad from bar 1 reads as a wash; at 0.45 with no room it reads robotic (the r33 sad-shop finding); an octave higher it fights the tune.",
    "question": "Does the strings entry at bar 5 (variant 3) sound like a section starting, and does the loud/dry one (variant 4) or the high one (variant 5) ever sound acceptable?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "piano_only",
        "name": "piano only (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65}],\"bpm\":88,\"bars\":8}"
        },
        "note": "control"
      },
      {
        "id": "pad_law_from_bar1",
        "name": "strings at 0.22 / room 0.5, whole-bar chords at 55-67, from bar 1",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65},{\"mini\":\"<[a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.3,\"release\":0.4}],\"bpm\":88,\"bars\":8}"
        },
        "note": "the law, all the way through"
      },
      {
        "id": "pad_law_enter_bar5",
        "name": "the same strings entering at bar 5 (the pack's 43% coverage)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65},{\"mini\":\"<[a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4] [a3,c4,e4] [f3,a4,c4] [c3,e4,g4] [g3,b4,d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.3,\"release\":0.4,\"mask\":\"<0 0 0 0 1 1 1 1>\"}],\"bpm\":88,\"bars\":8}"
        },
        "note": "mid-song entry"
      },
      {
        "id": "pad_loud_dry",
        "name": "strings at 0.45, no room, 8th-note re-attacks",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65},{\"mini\":\"<[[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4]] [[c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4]] [[g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4] [f3,a4,c4]] [[c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4] [c3,e4,g4]] [[g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4] [g3,b4,d4]]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45}],\"bpm\":88,\"bars\":8}"
        },
        "note": "falsification: the robotic strings of the r33 labs"
      },
      {
        "id": "pad_octave_up",
        "name": "strings at 0.22 / room 0.5 but an octave higher (67-79, over the tune)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2] [a2 e2 a3 c3 e3 c3 a3 e2] [f2 c2 f3 a3 c3 a3 f3 c2] [c2 g2 c3 e3 g3 e3 c3 g2] [g2 d2 g3 b3 d3 b3 g3 d2]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4] [e5@2 e5 d5 c5@3 ~] [a4 c5 d5 c5@3 a4@2] [e5@2 g5 e5 d5@2 c5@2] [d5 d5 e5 d5 b4@4]>\",\"sound\":\"piano\",\"gain\":0.65},{\"mini\":\"<[a4,c5,e5] [f4,a5,c5] [c4,e5,g5] [g4,b5,d5] [a4,c5,e5] [f4,a5,c5] [c4,e5,g5] [g4,b5,d5]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.3,\"release\":0.4}],\"bpm\":88,\"bars\":8}"
        },
        "note": "register clash with the tune (D77 is about register as much as gain)"
      }
    ],
    "batch": 1
  },
  "pl_prog_axis_rotation": {
    "id": "pl_prog_axis_rotation",
    "lane": "prog",
    "source_songs": [
      "someone_you_loved",
      "jar_of_hearts",
      "hide_and_seek",
      "einaudi_nuvole_bianche",
      "try_colbie",
      "fall_for_you",
      "i_need_your_love",
      "daybreak"
    ],
    "finding": "The I V vi IV family is the pack's top loop (17 of 311 songs) and its extracted ROTATION splits by emotion label: the 8 loops starting on I are labelled sad/happy/tender/somber/dreamy (someone_you_loved, jar_of_hearts, hide_and_seek, made_in_the_usa), the 8 starting on vi are calm/romantic/hopeful (einaudi x2, try_colbie, fall_for_you, let_me_love_you, right_place_right_time), 1 starts on IV (edm, i_need_your_love). Plagal IV-I closes every I-start, deceptive V-vi closes every vi-start.",
    "hypothesis": "The felt emotion follows the chord under the PHRASE START (the mechanism: the bar-1 downbeat chord is heard as home). Same four chords, same figure, same drums: the vi-start should read calmer/sadder-minor, the I-start brighter; the IV-start should read like a lift-off (edm). Falsification: the doo-wop ORDER I vi IV V (a different order, not a rotation) should read as a different family entirely — if it reads the same as the rotations, order does not matter and neither does rotation.",
    "question": "Do the four rotations read as four moods (which one is \"home\" to you: I or vi?), or as one loop with the drums moved? Does I vi IV V read as a different family or the same?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_I_start",
        "name": "I V vi IV — phrase starts on I (sad/happy ballads)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [g2@3 g2] [a2@3 a2] [f2@3 f2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5},{\"mini\":\"<[md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_snare [md_snare md_snare]]>\",\"sound\":\"md_kick\",\"gain\":0.5}],\"bpm\":90,\"bars\":4}"
        },
        "note": "the drum fill marks bar 4; listen for which chord feels like home"
      },
      {
        "id": "vi_start",
        "name": "vi IV I V — phrase starts on vi (calm/romantic; Einaudi, Colbie)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.4 0.45 0.4\"},{\"mini\":\"<[a2@3 a2] [f2@3 f2] [c2@3 c2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5},{\"mini\":\"<[md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_snare [md_snare md_snare]]>\",\"sound\":\"md_kick\",\"gain\":0.5}],\"bpm\":90,\"bars\":4}"
        },
        "note": "same chords; the fill now lands before vi. Deceptive V-vi close."
      },
      {
        "id": "IV_start",
        "name": "IV I V vi — phrase starts on IV (edm; i_need_your_love)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.4 0.45 0.4\"},{\"mini\":\"<[f2@3 f2] [c2@3 c2] [g2@3 g2] [a2@3 a2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5},{\"mini\":\"<[md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_snare [md_snare md_snare]]>\",\"sound\":\"md_kick\",\"gain\":0.5}],\"bpm\":90,\"bars\":4}"
        },
        "note": "the loop closes vi -> IV; does it lift?"
      },
      {
        "id": "V_start",
        "name": "V vi IV I — phrase starts on V (hide_and_seek loop 2)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.4 0.45 0.4\"},{\"mini\":\"<[g2@3 g2] [a2@3 a2] [f2@3 f2] [c2@3 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5},{\"mini\":\"<[md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_snare [md_snare md_snare]]>\",\"sound\":\"md_kick\",\"gain\":0.5}],\"bpm\":90,\"bars\":4}"
        },
        "note": "closes I -> V: the phrase ends open"
      },
      {
        "id": "falsify_order_doowop",
        "name": "FALSIFICATION: I vi IV V — a different ORDER, not a rotation (daybreak, perfect)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.55 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [a2@3 a2] [f2@3 f2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5},{\"mini\":\"<[md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_kick ~] [md_kick ~ md_snare [md_snare md_snare]]>\",\"sound\":\"md_kick\",\"gain\":0.5}],\"bpm\":90,\"bars\":4}"
        },
        "note": "if this reads as the same family as the four rotations, rotation is not what the ear tracks"
      }
    ],
    "batch": 1
  },
  "pl_prog_colour_dose": {
    "id": "pl_prog_colour_dose",
    "lane": "prog",
    "source_songs": [
      "made_in_the_usa",
      "lego_house",
      "we_cant_stop",
      "someone_you_loved",
      "sky_full_of_stars",
      "chopin_nocturne_op9_2"
    ],
    "finding": "Pop is PLAIN: median colour share (7/9/sus/6 by half-bar) is 13% pop, 9% ballad, 9% rock vs 33% classical and 23% anime; pop/happy sits at 4.7% and 17 of 64 pop songs carry <=2%. When a pop loop is coloured it is one or two chords, not a texture: 46 of 111 pop loops carry colour, 20 of those on exactly one chord, median coloured share 1/3 of the loop; corpus-wide 199 of 517 loops carry colour and the coloured numerals are ii7 (39), vi7 (30), IV^7 (27), Vsus (21) — a 7th on the SUBDOMINANT or a sus on V, almost never V7 (14, mostly classical). lego_house is literally I V vi IV^7.",
    "hypothesis": "Mechanism: colour in pop is a single softened chord, not a texture. Plain triads should read \"pop/anthem\"; one IV^7 should read \"pop, warmer\"; vi7+IV^7+Vsus should read \"ballad\"; the full jazz dose with a V7 should break the genre and read classical/lounge. If he prefers the all-coloured version everywhere, his colour-is-the-norm law overrides the pack's plainness.",
    "question": "At which dose does the loop stop sounding like pop: one coloured chord, three, or only when the V becomes V7? Which one would you keep for a happy pop song and which for a sad ballad?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_plain",
        "name": "I V vi IV plain triads (pop/happy median colour 4.7%)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 9:m 5\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "the pack's pop default"
      },
      {
        "id": "slot4_IV7",
        "name": "one colour chord, slot 4: I V vi IV^7 (lego_house)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 9:m 5:^7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "the most common single dose: a ^7 on the subdominant"
      },
      {
        "id": "three_coloured",
        "name": "I Vsus vi7 IV^7 (the ballad dose: Vsus 21, vi7 30, IV^7 27 loops)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7:sus 9:m7 5:^7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "no V7 anywhere — pop softens V with a sus"
      },
      {
        "id": "ninths",
        "name": "I^7 Vsus vi(add9) IV6 — the 9th/6th dose (anime/classical register)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:^7 7:sus 9:madd9 5:6\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "still no dominant 7th"
      },
      {
        "id": "falsify_jazz_V7",
        "name": "FALSIFICATION: I^7 V7 vi7 IV^7 — the classical/jazz dose with a real V7",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:^7 7:7 9:m7 5:^7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "V7 is 14 loops in 311 songs, 10 of them classical; predicted to leave the pop lane"
      }
    ],
    "batch": 1
  },
  "pl_prog_harmonic_rhythm": {
    "id": "pl_prog_harmonic_rhythm",
    "worth": "skip",
    "expected": "Known: 2-2-4 reads as forward motion landing on I, 6-2 as an anticipation pulling into the next bar, 2-2-2-2 as busier, 2-6 as a shape nobody writes. The engine already resolves chords per beat (D122 chordBeats), so any of these is expressible; none needs your ear to pick.",
    "lane": "prog",
    "source_songs": [
      "happier",
      "wake_me_up",
      "enough_for_you",
      "children_robert_miles",
      "right_place_right_time",
      "lego_house",
      "good_time",
      "jar_of_hearts",
      "someone_you_loved"
    ],
    "finding": "Sub-bar harmony is REAL but half of the extractor's number is not: 0.5-bar chords are 49% of labelled SEGMENTS yet only 20-38% of the music's BARS (bar-weighted, per lane). Raw notes: the 2-2-4 shape (two chords in bar 1, one in bar 2: vi IV | I) is genuine in happier, wake_me_up, enough_for_you, children (5 songs, 2 lanes) and the 6-2 pre-cadential anticipation is genuine in right_place_right_time (Dm . | Dm Bb | F . | F C); but the 2-6 splits in jar_of_hearts and faded are the LH putting the 5th/3rd under a STATIC chord, and someone_you_loved's 2-6 is a section seam.",
    "hypothesis": "Mechanism: the position of the second chord change inside the 2-bar group is what the ear tracks. 2-2-4 should read as forward motion that lands on I; 6-2 as an anticipation that pulls into the next bar; 2-2-2-2 as busier/EDM at the same tempo; 4-4-8 as the ballad default. Falsification: the 2-6 shape (a chord for 2 beats then its neighbour for 6) is what the labeller reads off inversions — if it sounds like a musical shape rather than a stumble, the flap is musically real and the extractor is right after all.",
    "question": "Same chords, same tempo: does 2-2-4 read as more energetic than 4-4-8 or just fussier? Does the 6-2 anticipation feel like a pull or a stumble? And does 2-6 sound like a shape anyone would write?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_224",
        "name": "vi IV | I  — 2-2-4 (happier, wake_me_up, enough_for_you)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 5 0\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[2,2,4]}"
        },
        "note": "two chords then one; the genuine pop shape"
      },
      {
        "id": "even_448",
        "name": "vi | IV | I I — 4-4-8 (the ballad default; 18 of 76 ballad loops are all-4s)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 5 0\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[4,4,8]}"
        },
        "note": "same chords, whole bars"
      },
      {
        "id": "anticipated_62",
        "name": "vi . | vi IV | I . | I V — 6-2-6-2 (right_place_right_time, genuine)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 5 0 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[6,2,6,2]}"
        },
        "note": "the second chord arrives on beat 3 of bar 2, pulling into the next bar"
      },
      {
        "id": "halves_2222",
        "name": "vi IV | I V — 2-2-2-2 (lego_house, good_time)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 5 0 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[2,2,2,2]}"
        },
        "note": "every chord half a bar; edm/uptempo pop"
      },
      {
        "id": "falsify_26",
        "name": "FALSIFICATION: vi IV | IV . | I . . . — 2-6-8 (the labeller's inversion flap read literally)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"9:m 5 0\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":100,\"chordBeats\":[2,6,8]}"
        },
        "note": "if this sounds like a shape a song would use, the extractor's 2-6 loops are musically real"
      }
    ],
    "batch": 1
  },
  "pl_prog_walkdown": {
    "id": "pl_prog_walkdown",
    "worth": "skip",
    "expected": "Known: a stepwise bass walkdown turns the loop into a song where root position reads generic; the chromatic lament reads older and sadder; the line only in the right hand loses the device. The engine has the > look-ahead walk (D101) for exactly this.",
    "lane": "prog",
    "source_songs": [
      "piano_man",
      "wake_me_up",
      "how_to_save_a_life",
      "golden_hour",
      "someone_you_loved",
      "the_a_team"
    ],
    "finding": "Inversions are 6-19% of half-bars by lane (ballad 12%, classical 19%, pop 6%) and the top slashes are the WALKDOWN steps: I/V 91 songs, IV/I 68, V/II 66, I/III 54, V/VII 44, I^7/VII 34 (the last is C/B read as Cmaj7 with B in the bass). Raw notes: piano_man's bass walks C B A G F E D G under C G/B Am C/G F C/E Dm G; wake_me_up drops the bass to C# under D on beat 4 to walk into Bm; golden_hour walks chromatically A G# G F# under IV iii bIII+ ii; someone_you_loved puts the 5th under every chord on beat 3 (39% inversions).",
    "hypothesis": "Mechanism: the BASS LINE is the device, the chords are the same. The stepwise walkdown should read \"song\" (Piano Man / Whiter Shade lineage) where root position reads \"generic pop\". The chromatic lament should read sadder/older than the diatonic one. Falsification 1: root-position bass under the identical chords — if it reads the same, the line is not the device. Falsification 2: the same descending line moved to the top voice over root bass — if THAT carries it, the device is voice-leading, not bass.",
    "question": "Does the walking bass turn the loop into a song, and does root position lose it? Is the chromatic walkdown (F Em Eb+ Dm) too old-fashioned for pop? Does the line work when it is only in the right hand?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_walkdown",
        "name": "C G/B Am C/G F C/E Dm G — bass walks C B A G F E D G (piano_man)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[c4,e4,g4] [c4,e4,g4]] [[b3,d4,g4] [b3,d4,g4]]] [[[a3,c4,e4] [a3,c4,e4]] [[g3,c4,e4] [g3,c4,e4]]] [[[a3,c4,f4] [a3,c4,f4]] [[e3,g3,c4] [e3,g3,c4]]] [[[d4,f4,a4] [d4,f4,a4]] [[g3,b3,d4] [g3,b3,d4]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38\"},{\"mini\":\"<[c2 b1] [a1 g1] [f1 e1] [d2 g1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "two chords a bar, bass steps down every half bar"
      },
      {
        "id": "falsify_root_position",
        "name": "FALSIFICATION: same chords, bass on every root (C G A C F C D G)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[c4,e4,g4] [c4,e4,g4]] [[b3,d4,g4] [b3,d4,g4]]] [[[a3,c4,e4] [a3,c4,e4]] [[g3,c4,e4] [g3,c4,e4]]] [[[a3,c4,f4] [a3,c4,f4]] [[e3,g3,c4] [e3,g3,c4]]] [[[d4,f4,a4] [d4,f4,a4]] [[g3,b3,d4] [g3,b3,d4]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38\"},{\"mini\":\"<[c2 g1] [a1 c2] [f1 c2] [d2 g1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "if this reads the same, the bass line was not the device"
      },
      {
        "id": "top_voice_walk",
        "name": "line in the TOP voice (c5 b4 a4 g4 f4 e4 d4), bass static roots",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,g4,c5] [e4,g4,c5]] [[d4,g4,b4] [d4,g4,b4]]] [[[c4,e4,a4] [c4,e4,a4]] [[c4,e4,g4] [c4,e4,g4]]] [[[a3,c4,f4] [a3,c4,f4]] [[g3,c4,e4] [g3,c4,e4]]] [[[f3,a3,d4] [f3,a3,d4]] [[d4,g4,b4] [d4,g4,b4]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38\"},{\"mini\":\"<[c2 g1] [a1 c2] [f1 c2] [d2 g1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "is the descent heard when the bass does not carry it?"
      },
      {
        "id": "chromatic_lament_major",
        "name": "F Em Eb+ Dm G — chromatic walkdown in major (golden_hour IV iii bIII+ ii)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[f3,a3,c4] [f3,a3,c4]] [[f3,a3,c4] [f3,a3,c4]]] [[[e3,g3,b3] [e3,g3,b3]] [[e3,g3,b3] [e3,g3,b3]]] [[[d#4,g4,b4] [d#4,g4,b4]] [[d#4,g4,b4] [d#4,g4,b4]]] [[[d4,f4,a4] [d4,f4,a4]] [[g3,b3,d4] [g3,b3,d4]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38\"},{\"mini\":\"<[f1 f1] [e1 e1] [d#1 d#1] [d2 g1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "Eb+ is the passing chord between Em and Dm; declared chromatic",
        "chromatic_ok": true
      },
      {
        "id": "fifth_under_beat3",
        "name": "C C/G Am Am/E F F/C G G/D — the 5th under each chord on beat 3 (someone_you_loved bars 24-27)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] [c4,e4,g4] [c4,e4,g4] [c4,e4,g4]] [[a3,c4,e4] [a3,c4,e4] [a3,c4,e4] [a3,c4,e4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[c2 g1] [a1 e1] [f1 c2] [g1 d2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the rocking-fifth bass that the extractor reads as a chord change every half bar"
      }
    ],
    "batch": 1
  },
  "pl_prog_minor_family": {
    "id": "pl_prog_minor_family",
    "worth": "skip",
    "expected": "Known: the major V is the lane switch — i iv bVI bVII reads pop/rock, i bVII bVI V (Andalusian) reads film/Spanish, bare i iv reads a game/hip-hop bed. The desert and horror lanes already pin the family for this reason (D93/D94).",
    "lane": "prog",
    "source_songs": [
      "shape_of_you",
      "nothing_else_matters",
      "la_calin",
      "potc_hes_a_pirate",
      "a_whole_new_world",
      "ww_farewell_hyrule_king",
      "adams_song",
      "maps"
    ],
    "finding": "Minor loops split by lane on ONE chord: the major V. Of minor songs with a loop, bVI is in 16/18 pop, 17/20 rock, 17/21 ballad, 12/20 film; iv in 10/18 pop, 12/20 rock; but a MAJOR V sits inside the loop in only 1/18 pop and 0/6 edm against 9/20 film, 7/21 ballad and 7/7 classical (by segments). Pop/rock minor is aeolian (i iv bVI bVII: shape_of_you, nothing_else_matters; bVI bVII i: maps, all_i_want); film/classical minor is harmonic (V i bVI: potc; V i: fur_elise, les_choristes). The bare i iv two-chord loop is film/game/hiphop (4 songs).",
    "hypothesis": "Mechanism: the leading tone (major V) is the lane switch. i iv bVI bVII should read pop/rock; i bVII bVI V (the Andalusian close) should read film/Spanish; i iv alone should read game/hiphop-dark. Falsification: replacing the pop loop's bVII with V7 — predicted to leave pop and read film/classical even though three of four chords are unchanged.",
    "question": "Which of these is \"pop minor\" to you and which is \"film minor\"? Is the major V what makes the difference, or the descending bVI-bVII motion? Does the bare i iv loop read as a game/hiphop bed or as unfinished?",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_pop_aeolian",
        "name": "i iv bVI bVII — pop/rock aeolian (shape_of_you, nothing_else_matters)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 5:m 8 10\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":110,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "no leading tone anywhere"
      },
      {
        "id": "andalusian_V",
        "name": "i bVII bVI V — the film/Spanish descent with the major V (la_calin re-keyed, potc)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 10 8 7\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":110,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "the G# leading tone arrives only on the last bar"
      },
      {
        "id": "bare_i_iv",
        "name": "i iv — the two-chord bed (a_whole_new_world 2-2, ww_farewell 22-2, ice_ice_baby)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 5:m\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":110,\"chordBeats\":[8,8]}"
        },
        "note": "film/game/hiphop; is it a bed or unfinished?"
      },
      {
        "id": "epic_bVI_bIII_bVII",
        "name": "i bVI bIII bVII — the epic/anthem rotation (adams_song, bad_romance family)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 8 3 10\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":110,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "bIII in slot 3 brightens; still no V"
      },
      {
        "id": "falsify_pop_with_V7",
        "name": "FALSIFICATION: i iv bVI V7 — the pop loop with its bVII swapped for V7",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0:m 5:m 8 7:7\",\"family\":\"minor\",\"tonic\":\"A\",\"bpm\":110,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "three of four chords unchanged; predicted to read film/classical"
      }
    ],
    "batch": 1
  },
  "pl_prog_game_shuttles": {
    "id": "pl_prog_game_shuttles",
    "worth": "skip",
    "expected": "Known: a two-chord shuttle with no dominant reads as place — I bVII overworld (mixolydian), I IV pastoral, IV V open/hopeful; I V resolves and stops being a loop; bVII IV I reads both game and rock. Your lane labels (song-labels.js) already say which places you use these for.",
    "lane": "prog",
    "source_songs": [
      "oot_kokiri",
      "atlas",
      "oot_lost_woods",
      "oot_lon_lon",
      "oot_opening",
      "this_kiss",
      "smb_theme",
      "hey_jude",
      "over_the_rainbow",
      "clementi_sonatina"
    ],
    "finding": "The game lane loops on TWO chords: of 28 game songs with a loop, 4 have a 2-chord loop and the lane's only repeated shapes are I IV (oot_lost_woods 8-8, oot_lon_lon 4-4) and I bVII (oot_kokiri 2-2; atlas 14-2 in rock; 4 undertale entries in the engine canon). bVII is the game lane's major borrow (5 of 24 major game loops: smb_theme, goron_city, hyrule_field, kokiri) and bVII-I is its cadence class (3 songs) — against I V, which is classical/folk (over_the_rainbow, clementi, tchaik: 3 of 21 classical) and never game.",
    "hypothesis": "Mechanism: a two-chord shuttle whose second chord is NOT the dominant reads \"place\" (a game area loop) because nothing resolves; I bVII should read adventure/overworld (mixolydian), I IV pastoral, IV V open/hopeful. Falsification: the I V shuttle — same two-chord form but with the dominant — is predicted to read classical/nursery rather than game; if it reads game too, the form (two chords) is the device and the chord choice is not.",
    "question": "Which two-chord loop is a Zelda field to you: I bVII, I IV, IV V or I V? Does the double-plagal bVII IV I (Mario/Hey Jude) read game, rock, or both?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_I_bVII",
        "name": "I bVII shuttle (oot_kokiri, atlas; undertale start menu in the canon)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 10\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":101,\"chordBeats\":[4,4]}"
        },
        "note": "Bb is the borrow; declared",
        "chromatic_ok": true
      },
      {
        "id": "I_IV",
        "name": "I IV shuttle (oot_lost_woods, oot_lon_lon; 11 songs corpus-wide)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 5\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":101,\"chordBeats\":[4,4]}"
        },
        "note": "pastoral plagal shuttle"
      },
      {
        "id": "IV_V",
        "name": "IV V shuttle (oot_opening V IV; this_kiss, catch_my_breath in pop)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":101,\"chordBeats\":[4,4]}"
        },
        "note": "the tonic never sounds"
      },
      {
        "id": "double_plagal",
        "name": "I bVII IV I — the double plagal (smb_theme I IV I bVII, hey_jude I bVII IV)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 10 5 0\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":101,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "game AND rock carry it",
        "chromatic_ok": true
      },
      {
        "id": "falsify_I_V",
        "name": "FALSIFICATION: I V shuttle (over_the_rainbow, clementi — classical/folk, never game)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":101,\"chordBeats\":[4,4]}"
        },
        "note": "two chords again, but the dominant; predicted to read nursery/classical"
      }
    ],
    "batch": 1
  },
  "pl_prog_borrowed_ladder": {
    "id": "pl_prog_borrowed_ladder",
    "worth": "skip",
    "expected": "Known: bVII imports rock/game, bVI+bVII epic/anthem, iv classical/gospel rather than sad pop (the pack never writes it there). The engine already treats borrowed chords by parent mode (D35).",
    "lane": "prog",
    "source_songs": [
      "paradise_coldplay",
      "hey_jude",
      "royals",
      "daybreak",
      "chopin_nocturne_op9_2",
      "under_the_bridge",
      "smb_theme"
    ],
    "finding": "Borrowed chords by lane, counted only inside REPEATED loops (the ≥2-segment table is inflated by the half-bar labeller): major-key bVII 22 songs (ballad 7, game 5, pop 4, rock 3), vii 13, II 9, i 8, bIII 6, bVI 4 — and the minor plagal iv in a MAJOR loop is ZERO of 55 ballads and ZERO of 46 pop songs (3 songs total: under_the_bridge, ut_fallen_down, chopin). bVI-bVII-I is the epic cadence (bVI-I 8 songs; daybreak V I bVII bVI).",
    "hypothesis": "Mechanism: each borrow imports its parent mode. bVII should read rock/game (mixolydian), bVI+bVII together should read epic/anthem, and iv should NOT read \"sad pop\" — the pack never writes it there — but old/classical/gospel. Falsification: if iv reads as the natural sad-pop move to him, the pack's absence of iv is a transcription artefact rather than a genre rule.",
    "question": "Adding one borrowed chord at a time to I V vi IV: which addition changes the genre, which just adds colour? Does the minor iv sound sad-pop or old-fashioned?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_axis",
        "name": "I V vi IV — nothing borrowed (the pop default)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 9:m 5\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "reference"
      },
      {
        "id": "add_bVII",
        "name": "I V bVII IV — bVII replaces vi (paradise_coldplay rotation; royals, hey_jude)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 10 5\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "mixolydian borrow: rock/game",
        "chromatic_ok": true
      },
      {
        "id": "add_iv",
        "name": "I V vi iv — minor plagal (absent from every pop/ballad loop in the pack)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 9:m 5:m\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "Ab is the borrow; the question is whether it reads sad-pop or old",
        "chromatic_ok": true
      },
      {
        "id": "add_bVI_bVII",
        "name": "I V bVI bVII — the epic/anthem cadence (daybreak, mario/rock bVI bVII I)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 7 8 10\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "two borrows, parallel major chords stepping up into I",
        "chromatic_ok": true
      },
      {
        "id": "falsify_all_three",
        "name": "FALSIFICATION: I bVII iv bVI — every borrow at once",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 10 5:m 8\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "predicted to lose the key entirely (reads modal/minor); if it still reads as pop-with-colour the borrows are not mode imports",
        "chromatic_ok": true
      }
    ],
    "batch": 1
  },
  "pl_prog_pedal_point": {
    "id": "pl_prog_pedal_point",
    "worth": "skip",
    "expected": "Known: a held tonic under IV and V reads static/dreamy, a dominant pedal reads tension, and the pedal releasing on bar 4 is the turnaround (D88). No engine decision hangs on hearing it again.",
    "lane": "prog",
    "source_songs": [
      "daylight",
      "we_cant_stop",
      "summertime_sadness",
      "a_thousand_miles",
      "comptine_dun_autre_ete"
    ],
    "finding": "Pedal points (same bass pc across ≥3 half-bars while the root changes) are rare and pop: median 0% in every lane, >5% in 20 songs, the top four all pop/film — daylight 42% (the LH holds D F# A under IV I for whole sections; bass-pc share D 91%), we_cant_stop 41%, summertime_sadness 25%, comptine 25%. No pedal in the pack runs a whole song: the max is 42% of half-bars, and the root moves again at the cadence.",
    "hypothesis": "Mechanism: a held tonic under IV and V removes the bass walk and the loop reads static/dreamy (daylight and we_cant_stop are labelled dreamy/nostalgic) where the same chords over moving roots read as an ordinary progression. A dominant pedal should read as tension; the pedal that RELEASES on the cadence bar should read as the pack does it. Falsification: the moving-root version — if it reads the same as the pedal, the bass is inaudible under the chords and the device is not real.",
    "question": "Does the held tonic bass make the loop dreamy/static or just muddy? Is the dominant pedal tension or wrongness? Should the pedal release on bar 4 as the pack does, or hold?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_tonic_pedal",
        "name": "C F/C G/C C over a held C bass (daylight)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~] [[f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~] [[g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~] [[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [c2@3 c2] [c2@3 c2] [c2@3 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":120,\"bars\":4}"
        },
        "note": "bass never moves"
      },
      {
        "id": "falsify_moving_roots",
        "name": "FALSIFICATION: same chords, bass on the roots C F G C",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~] [[f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~] [[g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~] [[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [f2@3 f2] [g2@3 g2] [c2@3 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":120,\"bars\":4}"
        },
        "note": "if this reads the same, the pedal is inaudible"
      },
      {
        "id": "dominant_pedal",
        "name": "C F G C over a held G bass (dominant pedal)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~] [[f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~] [[g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~] [[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.4 0.45 0.4\"},{\"mini\":\"<[g1@3 g1] [g1@3 g1] [g1@3 g1] [g1@3 g1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":120,\"bars\":4}"
        },
        "note": "tension: I and IV over the dominant"
      },
      {
        "id": "pedal_releases_bar4",
        "name": "C F/C G/C then the bass moves under the cadence (pack max 42%)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~] [[f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~] [[g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~] [[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [c2@3 c2] [g1@3 g1] [c2@3 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":120,\"bars\":4}"
        },
        "note": "the pedal breaks exactly where the pack breaks it: at V"
      },
      {
        "id": "inverted_pedal",
        "name": "top-voice pedal: c5 held on top of every chord, roots move",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~] [[f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~] [[d4,g4,c5] ~ [d4,g4,c5] ~ [d4,g4,c5] ~ [d4,g4,c5] ~] [[c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~ [c4,e4,g4] ~]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.4 0.45 0.4\"},{\"mini\":\"<[c2@3 c2] [f2@3 f2] [g2@3 g2] [c2@3 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":120,\"bars\":4}"
        },
        "note": "the G chord becomes Gsus4 under the held C"
      }
    ],
    "batch": 1
  },
  "pl_prog_cadence_close": {
    "id": "pl_prog_cadence_close",
    "worth": "skip",
    "expected": "Known: IV->I reads ballad, V->I (triad) pop-anthem, V7->I older/classical, bVII->I rock/game, V->vi deceptive/film. The cadence grammar already picks by lane; the plain V versus V7 is the r16 bare-7 rule in a different coat.",
    "lane": "prog",
    "source_songs": [
      "daybreak",
      "perfect",
      "someone_you_loved",
      "hey_jude",
      "einaudi_nuvole_bianche",
      "chopin_nocturne_op9_2",
      "fur_elise"
    ],
    "finding": "Primary-loop cadence classes by lane: ballad = plagal IV-I 14 / authentic V-I 6 / deceptive V-vi 5; pop = half-cadence V-x 8 / plagal 6 / bVI-I 4; rock = plagal 7 / V-x 6 / bVII-I 4; classical = authentic 6 (the only lane where V-I leads); game = authentic 4 / bVII-I 3; film = deceptive 3. The pop/ballad world closes on IV or leaves V hanging; the classical world resolves V-I.",
    "hypothesis": "Mechanism: the last chord before the loop restarts is the genre marker. IV->I should read ballad; V->I (triad) should read pop-anthem; V7->I should read classical/old; bVII->I rock/game; V->vi (deceptive, the vi-start rotation) should read film/Einaudi. Falsification: the V7 close — if a dominant seventh reads as neutral pop to him, the pack's avoidance of V7 (14 loops in 311 songs) is not a taste rule.",
    "question": "Same first three chords, five closes: which close is a ballad, which is a pop anthem, and does the V7 sound old? Does the deceptive V-vi midpoint read as film or as a wrong turn?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_authentic",
        "name": "I vi IV V -> I (authentic close; daybreak, perfect)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 9:m 5 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":90,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "V triad, no 7th"
      },
      {
        "id": "plagal",
        "name": "I vi IV IV -> I (plagal close; the ballad majority, someone_you_loved I V vi IV)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 9:m 5 5\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":90,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "no dominant anywhere in the loop"
      },
      {
        "id": "mixolydian_bVII",
        "name": "I vi IV bVII -> I (bVII-I; rock/game)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 9:m 5 10\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":90,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "Bb is the borrow",
        "chromatic_ok": true
      },
      {
        "id": "deceptive_midpoint",
        "name": "I vi IV V | vi IV I V — V resolves to vi at the midpoint (the vi-start rotations; Einaudi)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 9:m 5 7 9:m 5 0 7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":90,\"chordBeats\":[4,4,4,4,4,4,4,4]}"
        },
        "note": "bar 4 -> bar 5 is V -> vi"
      },
      {
        "id": "falsify_V7",
        "name": "FALSIFICATION: I vi IV V7 -> I (the classical dominant seventh)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"0 9:m 5 7:7\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":90,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "predicted to read old/classical; 10 of the 14 V7 loops in the pack are classical"
      }
    ],
    "batch": 1
  },
  "pl_prog_sus2_voicing": {
    "id": "pl_prog_sus2_voicing",
    "worth": "skip",
    "expected": "Known: R-5-9 is the modern pop-piano open colour; sus4 is a suspension that wants to resolve; plain triads read older. The dialect question (a real add9/sus2 quality) is a code decision I will make with a test, not one to hear.",
    "lane": "prog",
    "source_songs": [
      "payphone",
      "this_kiss",
      "diamonds",
      "every_breath_you_take",
      "catch_my_breath"
    ],
    "finding": "The labeller's \"2\" (root-5th-9th, no 3rd) is on 77 songs and is GENUINE where checked: payphone voices E B F# and B F# C# in the LH (IV2, I2 — 73 of 156 half-bars), this_kiss loops IV2 V2 (36 of 100). It is 2.7% of pop half-bars against 1.3% pooled. The labs dialect has no sus2: the analysis FOLDS \"2\" to \"sus\" (R 4 5), so every card that pastes a \"2\" loop as degrees renders a sus4 — a different chord.",
    "hypothesis": "Mechanism: the open R-5-9 shape is the modern pop-piano colour (no 3rd, no 7th); sus4 is a suspension that wants to resolve and should NOT be heard as the same thing. Plain triads should read older/simpler; add9 with the 3rd should read fuller but less open. Falsification: if the sus4 rendering reads the same as R-5-9 to him, the dialect fold is harmless and no sus2 quality is needed.",
    "question": "Is the R-5-9 shape the modern pop sound to you, and does the sus4 version sound like the same idea or like an unresolved suspension? Would you want a real sus2/add9 quality in the dialect?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_R59",
        "name": "IV V as R-5-9 (payphone/this_kiss): f3 c4 g4 | g3 d4 a4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f3,c4,g4] [f3,c4,g4] [f3,c4,g4] [f3,c4,g4]] [[g3,d4,a4] [g3,d4,a4] [g3,d4,a4] [g3,d4,a4]] [[f3,c4,g4] [f3,c4,g4] [f3,c4,g4] [f3,c4,g4]] [[g3,d4,a4] [g3,d4,a4] [g3,d4,a4] [g3,d4,a4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[f2@3 f2] [g2@3 g2] [f2@3 f2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5}],\"bpm\":120,\"bars\":4}"
        },
        "note": "no third anywhere"
      },
      {
        "id": "plain_triads",
        "name": "IV V as plain triads",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]] [[f3,a3,c4] [f3,a3,c4] [f3,a3,c4] [f3,a3,c4]] [[g3,b3,d4] [g3,b3,d4] [g3,b3,d4] [g3,b3,d4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[f2@3 f2] [g2@3 g2] [f2@3 f2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5}],\"bpm\":120,\"bars\":4}"
        },
        "note": "the pop default"
      },
      {
        "id": "falsify_dialect_sus4",
        "name": "FALSIFICATION: IV V as sus4 — what the dialect fold renders for a \"2\" loop",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f3,bb3,c4] [f3,bb3,c4] [f3,bb3,c4] [f3,bb3,c4]] [[g3,c4,d4] [g3,c4,d4] [g3,c4,d4] [g3,c4,d4]] [[f3,bb3,c4] [f3,bb3,c4] [f3,bb3,c4] [f3,bb3,c4]] [[g3,c4,d4] [g3,c4,d4] [g3,c4,d4] [g3,c4,d4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[f2@3 f2] [g2@3 g2] [f2@3 f2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5}],\"bpm\":120,\"bars\":4}"
        },
        "note": "Bb is the 4th of F, out of C major: this is what a pasted \"5:sus 7:sus\" plays",
        "chromatic_ok": true
      },
      {
        "id": "add9_with_third",
        "name": "IV V as add9 with the third: f3 a3 c4 g4 | g3 b3 d4 a4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[f3,a3,c4,g4] [f3,a3,c4,g4] [f3,a3,c4,g4] [f3,a3,c4,g4]] [[g3,b3,d4,a4] [g3,b3,d4,a4] [g3,b3,d4,a4] [g3,b3,d4,a4]] [[f3,a3,c4,g4] [f3,a3,c4,g4] [f3,a3,c4,g4] [f3,a3,c4,g4]] [[g3,b3,d4,a4] [g3,b3,d4,a4] [g3,b3,d4,a4] [g3,b3,d4,a4]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[f2@3 f2] [g2@3 g2] [f2@3 f2] [g2@3 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.5}],\"bpm\":120,\"bars\":4}"
        },
        "note": "fuller; is the openness lost?"
      }
    ],
    "batch": 1
  },
  "pl_prog_inversion_as_change": {
    "id": "pl_prog_inversion_as_change",
    "worth": "skip",
    "expected": "Known: the ear names a chord by its bass and outer voices — a bass move to the 3rd reads as a new chord, an inner-voice move over a held bass reads as colour on the same chord. The D98 inversion-by-token-order rule already follows this.",
    "lane": "prog",
    "source_songs": [
      "stay_rihanna",
      "jar_of_hearts",
      "faded",
      "set_fire_to_the_rain",
      "blinding_lights"
    ],
    "finding": "A large share of the extractor's half-bar chords are one chord with a moved bass or inner voice: stay_rihanna's loop \"i bIII6 i bIII6\" (2-2-2-2, 60% inversions) is Am/E with the inner voice A->G on beat 3 (LH E3 A3 C4 -> E3 G3 C4); jar_of_hearts' \"I Vsus\" 2-6 is Eb with Bb dropped under it on the and-of-2; faded's \"vi I6\" is D#m with F# put in the bass. 35% of all \"6\" labels (502 of 1434 half-bars) sit next to the relative minor chord, and 53% of 2-beat loop chords share two pitch classes with a neighbour (an upper bound: vi-IV also shares two).",
    "hypothesis": "Mechanism: the ear names a chord by its bass and its outer voices; a bass move to the 3rd (Am -> Am/C) should read as a NEW chord (C), an inner-voice move (A->G over a held E bass) should read as colour on the same chord, and a bass move to the 5th (Am -> Am/E) should read as the same chord. Falsification: if all three read as Am, the labeller's 2-2-2-2 loops are pure artefact and sub-bar harmony in the pack is even rarer than the bar-weighted 20-38%.",
    "question": "Which of these is a chord CHANGE to you: the bass dropping to C, the bass dropping to E, or the inner voice moving to G? Compare with the real Am -> C change.",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured_inner_voice",
        "name": "Am/E with the inner voice A -> G on beat 3 (stay_rihanna; labelled i bIII6)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[e2@3 e2] [e2@3 e2] [e2@3 e2] [e2@3 e2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":115,\"bars\":4}"
        },
        "note": "bass stays on E throughout"
      },
      {
        "id": "bass_to_third",
        "name": "Am -> Am/C on beat 3 (bass A -> C), right hand static",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[a1 c2] [a1 c2] [a1 c2] [a1 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":115,\"bars\":4}"
        },
        "note": "the labeller would call beat 3 \"C6\""
      },
      {
        "id": "bass_to_fifth",
        "name": "Am -> Am/E on beat 3 (bass A -> E), right hand static (jar_of_hearts shape)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[a1 e1] [a1 e1] [a1 e1] [a1 e1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":115,\"bars\":4}"
        },
        "note": "second inversion on beat 3"
      },
      {
        "id": "real_change",
        "name": "Am -> C on beat 3: right hand AND bass move (control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,g4,c5] [e4,g4,c5]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[a1 c2] [a1 c2] [a1 c2] [a1 c2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":115,\"bars\":4}"
        },
        "note": "a genuine 2-2 harmonic rhythm"
      },
      {
        "id": "falsify_static",
        "name": "FALSIFICATION baseline: Am static, nothing moves",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]] [[[e4,a4,c5] [e4,a4,c5]] [[e4,a4,c5] [e4,a4,c5]]]>\",\"sound\":\"piano\",\"gain\":0.5,\"gainPattern\":\"0.5 0.38 0.45 0.38\"},{\"mini\":\"<[a1@3 a1] [a1@3 a1] [a1@3 a1] [a1@3 a1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":115,\"bars\":4}"
        },
        "note": "if the three moves all read like this, none is a chord change"
      }
    ],
    "batch": 1
  },
  "pl_melody_hook_repeat": {
    "id": "pl_melody_hook_repeat",
    "lane": "melody",
    "source_songs": [
      "call_me_maybe",
      "shape_of_you",
      "counting_stars",
      "steal_my_girl",
      "the_scientist"
    ],
    "finding": "Pop RH top voices repeat an earlier bar's rhythm skeleton in 70% of bars (median, n=64 pop; ballad 62%, rock 66%, hiphop 81%; game 50%, classical 79% but of a 47-skeleton vocabulary). Of the bars that repeat a rhythm within 1/2/4/8 bars (pooled 2,271 pop bars) the pitches are identical 57%, differ in ONE note 11%, are chromatically transposed 6%, keep the contour with pitches re-fit 7%, and are freely re-fit 20%. call_me_maybe's chorus is one 2-bar cell (|4 8 9 11 14|6 8 9 11 14| in 16ths) stated 6 times with only the cell's last two notes changing; the_scientist's hook cell recurs 14 times.",
    "hypothesis": "A 2-bar cell restated four times over the loop reads as a HOOK; eight bars that never repeat a rhythm read as noodling (the engine's current shape). Among the repeat grades, full pitch re-fit to each chord and the one-note landing change both read as intentional variation; the fully frozen cell reads as a riff (works, shape_of_you), and literal chromatic transposition reads wrong-key (the pack does it 6% of the time and his law says transposition is not variation).",
    "question": "Which repeat grade sounds like a real pop hook — identical pitches over all four chords, only the landing note changing, every note re-fit to the chord, or the cell moved with the chord root? And does the no-repeat variant sound like a melody at all?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "refit",
        "name": "2-bar cell x4, pitches re-fit to each chord (the pack's 20% grade + landing re-fit)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Cell = |e g a g e|d e d c-held| in 16ths 0,3,6,8,12 | 0,2,4,6; over G the body keeps its contour and lands on d (5th), over Am the peak moves to c6, over F it lands on c (5th). Listen for the cell as ONE object returning four times."
      },
      {
        "id": "frozen",
        "name": "cell frozen: identical pitches over C, G, Am and F (shape_of_you's mechanism)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Exactly the same 2 bars four times; over G the held c is a sus4 rub, over Am it is the 3rd. The pack's most common grade (57% identical). Does the rub read as riff tension or as a wrong note?"
      },
      {
        "id": "last_note",
        "name": "frozen body, only the LANDING re-fit per chord (the pack's one-note grade, 11%)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 a4@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 b4@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 a4@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "The frozen 2-bar body every time; only the landing note follows the chord: c over C, then a4 over F, b4 over G, a4 over F. One pitch differs per statement (the pack's one-note grade). Is that enough variation to hear?"
      },
      {
        "id": "transposed",
        "name": "FALSIFICATION: the cell literally transposed to each chord root (C, -5 to G, -3 to Am, +5 to F)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [b4@3 d5@3 e5@2 d5@4 b4@4] [a4@2 b4@2 a4@2 g4@10] [c#5@3 e5@3 f#5@2 e5@4 c#5@4] [b4@2 c#5@2 b4@2 a4@10] [a5@3 c6@3 d6@2 c6@4 a5@4] [g5@2 a5@2 g5@2 f5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Chromatic transposition writes c# and f# over Am in C major (declared: the out-of-key tones ARE the point). His law: transposition is not variation; the pack does it 6% of the time. Predicted: sounds like the same lick in the wrong key.",
        "chromatic_ok": true
      },
      {
        "id": "no_repeat",
        "name": "FALSIFICATION: eight bars, no rhythm skeleton repeats (every bar its own shape)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@2 a5@2 g5@4 e5@4] [d5@2 b4@2 d5@4 g5@8] [a5@3 g5@3 e5@6 c5@4] [c5@4 a5@4 c6@2 a5@2 g5@4] [g5@2 e5@2 d5@2 c5@2 e5@8] [b4@6 d5@2 g5@4 a5@4] [e5@2 a5@6 g5@4 e5@4] [a5@4 g5@2 f5@2 c5@8]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Same key, same chords, all pentatonic-with-passing tones, all chord-fitting - but 8 distinct rhythm skeletons, zero repeats (the pack's pop songs repeat 70% of bars). Predicted: no hook forms; reads like the engine's current leads."
      }
    ],
    "batch": 1
  },
  "pl_melody_cell_period": {
    "id": "pl_melody_cell_period",
    "worth": "skip",
    "expected": "Overlaps #35 (hook repeat): a 1-bar cell x8 reads as an ostinato, a 2-bar cell x4 as a hook, a 4-bar phrase twice as a shaped phrase; a re-fit second half reads as development. Your answer on #35 decides the engine's unit.",
    "lane": "melody",
    "source_songs": [
      "counting_stars",
      "call_me_maybe",
      "i_knew_you_were_trouble",
      "shake_it_off",
      "love_song_bareilles"
    ],
    "finding": "In pop (n=61 4/4 songs) a bar's rhythm equals the bar 4 back 22% of the time, 2 back 16%, 1 back 10% - the 4-bar unit is the strongest period; and 70% of bars repeat SOME earlier bar while only 43% repeat one within 1/2/4/8 bars, so hooks return across sections rather than looping locally. The engine's 47 judged leads repeat at lag 1/2/4 in 56% of bars with a median of 5 distinct skeletons per 32 bars (pop: ~25 per 91). counting_stars states its 4-bar phrase exactly (bars 0-3 = 4-7) and varies only the bar-4 approach into the same held e5.",
    "hypothesis": "The 4-bar unit stated twice reads as a phrase with a shape; a 1-bar cell x8 reads as a loop/ostinato rather than a melody; a 2-bar cell x4 reads as a hook; an 8-bar unit whose second half keeps the rhythm but re-fits the pitches reads as development. Predicted failure: the 1-bar cell.",
    "question": "Which repeated-unit length reads as a sung hook: one bar looped, a two-bar cell, or a four-bar phrase stated twice? Does the re-fit second half (bars 5-8) sound like development or like a different tune?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "four_bar_x2",
        "name": "4-bar phrase stated twice, identical (counting_stars's shape)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [c6@4 a5@4 g5@4 e5@4] [g5@4 e5@2 d5@2 c5@8] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [c6@4 a5@4 g5@4 e5@4] [g5@4 e5@2 d5@2 c5@8]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Four distinct bars (16ths 0,3,6,8,12 | 0,2,4,6 | 0,4,8,12 | 0,4,6,8), bar 4 lands held on c; then the whole phrase again. Rhythm repeats only at lag 4."
      },
      {
        "id": "one_bar_x8",
        "name": "1-bar cell x8, pitches re-fit per chord",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [d5@3 g5@3 a5@2 g5@4 d5@4] [e5@3 a5@3 c6@2 a5@4 e5@4] [a5@3 c6@3 d6@2 c6@4 a5@4] [e5@3 g5@3 a5@2 g5@4 e5@4] [d5@3 g5@3 a5@2 g5@4 d5@4] [e5@3 a5@3 c6@2 a5@4 e5@4] [a5@3 c6@3 d6@2 c6@4 a5@4]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "The same 5-onset bar every bar (lag-1 repeat 100%; pop median 10%). CAVEAT: a 1-bar cell has no room for the held landing, so two variables move here; if it fails, a follow-up isolates them. Predicted: an ostinato, not a tune - the engine's \"piano exercise\" verdict."
      },
      {
        "id": "two_bar_x4",
        "name": "2-bar cell x4 (call_me_maybe's chorus shape)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "The card-1 reference: a 2-bar cell with a held landing, four statements."
      },
      {
        "id": "eight_bar_refit",
        "name": "8-bar unit: bars 5-8 keep bars 1-4's rhythm, pitches re-fit to a new contour",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [c6@4 a5@4 g5@4 e5@4] [g5@4 e5@2 d5@2 c5@8] [g5@3 a5@3 c6@2 a5@4 g5@4] [g5@2 e5@2 d5@2 b4@10] [e5@4 c6@4 a5@4 e5@4] [a5@4 g5@2 e5@2 c5@8]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Rhythm identical at lag 4, every pitch different (the pack's free re-fit grade, 20%). Predicted: reads as the same phrase developed, because the rhythm carries the identity."
      }
    ],
    "batch": 1
  },
  "pl_melody_pent_passing": {
    "id": "pl_melody_pent_passing",
    "worth": "skip",
    "expected": "Known and already your law: short passing 4/7 bracketed by steps read smoother than pure pentatonic (D123 tissue); the same degrees held on strong beats read as sus/maj7 colour at best and as the chromCore complaint at worst.",
    "lane": "melody",
    "source_songs": [
      "counting_stars",
      "perfect",
      "shake_it_off",
      "call_me_maybe",
      "faded"
    ],
    "finding": "Pop top voices are 89% pentatonic (median, n=64; ballad 82%, hiphop 91%; game 69%, classical 67%). The non-pentatonic notes are 100% in-scale (median) and in major keys land on scale degree 4 (58% of them in pop) and 7 (31%); in minor keys on 2 (32%) and b6 (56%). They are short (65% an 8th or less), off the strong beats (only 24% on beats 1/3, 44% on any beat - about uniform) and 75% resolve by step. counting_stars bar 2: a5 (degree 4) on beat 3 for an 8th over B, stepping down to g#5.",
    "hypothesis": "The hook is heard as pentatonic; 4 and 7 are TISSUE - short, weak, bracketed by steps - and adding them reads as smoother than the pure pentatonic. Put the same degrees on strong beats and hold them (the engine's chromCore/anchor placement) and they read as wrong notes; approach or leave them by leap and they read as dissonance you cannot follow.",
    "question": "Does the pure-pentatonic hook sound blander than the one with short passing 4/7, or cleaner? When the 4 and 7 sit held on the downbeat, do you hear them as colour (sus/maj7) or as mistakes?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "passing",
        "name": "4 and 7 as short weak-beat passing tones, step on both sides (the pack's placement)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 f5@2 g5@4 a5@4 g5@4] [d5@2 c5@2 b4@2 c5@2 d5@8] [e5@2 f5@2 e5@4 c5@4 a4@4] [c5@2 d5@2 c5@2 b4@2 c5@8] [e5@2 f5@2 g5@4 a5@4 g5@4] [d5@2 c5@2 b4@2 c5@2 d5@8] [e5@2 f5@2 e5@4 c5@4 a4@4] [c5@2 d5@2 c5@2 b4@2 c5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.65}],\"bpm\":112,\"bars\":8}"
        },
        "note": "f5 on the \"and\" of 1 for an 8th between e and g; b4 on beat 2 for an 8th between two c's. Measured: 8 of 40 notes non-pentatonic (20%; pop median 11%, ballad 18%), all short, none on beats 1/3, all step-resolved."
      },
      {
        "id": "pure_pent",
        "name": "pure pentatonic: the passing tones replaced by pentatonic neighbours",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 d5@2 g5@4 a5@4 g5@4] [d5@2 c5@2 a4@2 c5@2 d5@8] [e5@2 g5@2 e5@4 c5@4 a4@4] [c5@2 d5@2 c5@2 a4@2 c5@8] [e5@2 d5@2 g5@4 a5@4 g5@4] [d5@2 c5@2 a4@2 c5@2 d5@8] [e5@2 g5@2 e5@4 c5@4 a4@4] [c5@2 d5@2 c5@2 a4@2 c5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.65}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Same rhythm, same landings; every note from C D E G A. The hiphop lane is nearest this (91%)."
      },
      {
        "id": "strong_held",
        "name": "FALSIFICATION: 4 and 7 on the strong beats, held a beat or more, unresolved",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[f5@4 g5@4 b4@4 a5@4] [f5@4 d5@4 b4@8] [f5@4 e5@4 b4@4 c5@4] [b4@4 c5@4 f5@8] [f5@4 g5@4 b4@4 a5@4] [f5@4 d5@4 b4@8] [f5@4 e5@4 b4@4 c5@4] [b4@4 c5@4 f5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.65}],\"bpm\":112,\"bars\":8}"
        },
        "note": "f on beat 1 over C (a held 4th against the 3rd), b on beat 1 over F (a tritone against the root), f held to the barline over F... all in scale. Measured: 16 of 28 notes non-pentatonic, 16 of 16 on beats 1/3, 0 of 16 short (the pack: 24% on beats 1/3, 65% short)."
      },
      {
        "id": "by_leap",
        "name": "FALSIFICATION: 4 and 7 approached and left by leap (no step bracket)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 b4@2 g5@4 f5@2 a5@6] [d5@2 f5@2 b4@2 g5@10] [e5@2 f5@2 c5@4 b4@2 e5@6] [c5@2 b4@2 f5@4 a5@8] [e5@2 b4@2 g5@4 f5@2 a5@6] [d5@2 f5@2 b4@2 g5@10] [e5@2 f5@2 c5@4 b4@2 e5@6] [c5@2 b4@2 f5@4 a5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.65}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Same degrees, same short durations, but b4 is entered from e5 and left to g5 by leap; f5 is left to a5; over G f5 leaps a tritone to b4. The pack resolves 75% of these by step; here 0%. D102's \"dissonance you can't follow\" in isolation."
      }
    ],
    "batch": 1
  },
  "pl_melody_anticipation": {
    "id": "pl_melody_anticipation",
    "lane": "melody",
    "source_songs": [
      "call_me_maybe",
      "faded",
      "you_say",
      "good_time",
      "piano_man"
    ],
    "finding": "On the 210 on-grid 4/4 songs, 12-13% of all top-voice onsets fall on the last 8th of the bar (slots 14/15) - the pop anticipation. Odd-16th onsets are 8.7% of pop onsets (ballad 14.6%, engine 29.9%) and pooled they are: pickups whose partner follows within a 16th 48%, run members 17%, dotted-8th / 3+3+2 members 28% (pop-specific: call_me_maybe's 8-11-14 chorus cell), tied anticipations 2%, and isolated shorts 4% - i.e. 0.4% of ALL pop onsets. The engine's lead puts 32% of its short notes in the bar's final 16th (D118); the pack puts 2.9% of pop shorts there.",
    "hypothesis": "A hook note attacked an 8th early and sustained through the barline reads as pop groove; the same note on the downbeat reads squarer but fine; a 16th anticipation tied over reads as a push; the D118 shape - an unrelated 16th stuck in the bar's last slot before the on-beat note - reads as a stumble (it exists in no reference); the dotted 3+3+2 head reads as the pop syncopation that the D123 grid law would wrongly snap.",
    "question": "Which feels like a pop hook: the note pushed an 8th early and held over the barline, on the beat, or pushed a 16th? Does the extra 16th before the downbeat (the engine's current habit) sound like a stumble or like a pickup? Does the 3+3+2 head sound groovy or shifted?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "antic_8th_tied",
        "name": "anticipation by an 8th, tied over the barline (slot 14, sustained to beat 2 of the next bar)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"[e5@4 g5@4 a5@4 g5@2 d6@6 a5@4 g5@8 e5@4 a5@4 c6@4 a5@2 c6@6 g5@4 a5@8 e5@4 g5@4 a5@4 g5@2 d6@6 a5@4 g5@8 e5@4 a5@4 c6@4 a5@2 c6@6 g5@4 a5@8]/8\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "d6 (5th of the coming G) attacks on the last 8th of the C bar and rings through the barline; the same a bar later with c6 over F. Written as one 8-bar sequence so the tie is real."
      },
      {
        "id": "on_beat",
        "name": "the same cell with the note on the downbeat",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"[e5@4 g5@4 a5@4 g5@4 d6@4 a5@4 g5@8 e5@4 a5@4 c6@4 a5@4 c6@4 g5@4 a5@8 e5@4 g5@4 a5@4 g5@4 d6@4 a5@4 g5@8 e5@4 a5@4 c6@4 a5@4 c6@4 g5@4 a5@8]/8\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "d6 lands on beat 1 of the G bar. Squarer; the pack's majority shape (87% of onsets are not on the last 8th)."
      },
      {
        "id": "antic_16th_tied",
        "name": "anticipation by a 16th, tied over (slot 15, held)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"[e5@4 g5@4 a5@4 g5@3 d6@5 a5@4 g5@8 e5@4 a5@4 c6@4 a5@3 c6@5 g5@4 a5@8 e5@4 g5@4 a5@4 g5@3 d6@5 a5@4 g5@8 e5@4 a5@4 c6@4 a5@3 c6@5 g5@4 a5@8]/8\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "The push is a 16th instead of an 8th; the note still sustains through beat 1. ~2% of odd-16th onsets in the pack; the tied slot-15 case."
      },
      {
        "id": "d118_final_slot",
        "name": "FALSIFICATION: an extra 16th in the bar's final slot, then the on-beat note (the engine's D118 shape)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"[e5@4 g5@4 a5@4 g5@3 e5@1 d6@4 a5@4 g5@8 e5@4 a5@4 c6@4 a5@3 e5@1 c6@4 g5@4 a5@8 e5@4 g5@4 a5@4 g5@3 e5@1 d6@4 a5@4 g5@8 e5@4 a5@4 c6@4 a5@3 e5@1 c6@4 g5@4 a5@8]/8\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "A lone e5 16th hangs off the barline and d6 is struck on the beat - the note is short AND leaps away (10 st), which is the engine's realised D118 shape. 0.4% of pop onsets; 32% of the engine's short notes. Predicted: reads as the \"seemingly really short notes and offbeats\" he complained of."
      },
      {
        "id": "dotted_head",
        "name": "dotted-8th 3+3+2 head (the pop odd-16th class the grid law would snap)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"[e5@3 g5@3 a5@2 g5@4 a5@4 d6@4 a5@4 g5@8 e5@3 a5@3 c6@2 a5@4 g5@4 c6@4 g5@4 a5@8 e5@3 g5@3 a5@2 g5@4 a5@4 d6@4 a5@4 g5@8 e5@3 a5@3 c6@2 a5@4 g5@4 c6@4 g5@4 a5@8]/8\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Onsets at 16ths 0,3,6 then on the beat: the odd slots 3 are dotted members, not pickups or runs (28% of pop odd-16ths). gridSnapMelodyEntry would move slot 3 to slot 2."
      }
    ],
    "batch": 1
  },
  "pl_melody_step_leap": {
    "id": "pl_melody_step_leap",
    "worth": "skip",
    "expected": "Known: the pop mix (a third steps, a third repeats, small leaps) is the singable one; the stepwise film line is lyrical but less hooky; the repeated-note rap cell is a rhythm, not a tune; the leap-heavy engine line is the D123 gap already being closed.",
    "lane": "melody",
    "source_songs": [
      "shape_of_you",
      "rap_god",
      "ice_ice_baby",
      "a_whole_new_world",
      "hello"
    ],
    "finding": "Pop top voices move by step 32% (median, n=64), repeat the pitch 28%, and leap beyond a 5th only 6%; hiphop steps 21% and repeats 36%; film steps 43% with 13% big leaps; the engine's leads step 16% and leap beyond a 5th 19% (r33, in mix). shape_of_you's verse is one pitch (e4) restruck 5 times a bar with a single move at the phrase end; rap_god's hook cell has all-zero intervals.",
    "hypothesis": "The pop mix (a third steps, a third repeats, small leaps) reads as singable; the film run-based line reads as lyrical but less hooky; the repeated-note cell reads as a hook only because its rhythm carries it; the engine's leap-heavy shape (16% step, 3 leaps > P5 per bar) reads as unsingable - and that, not dissonance, is what \"the melody generation has been ass\" measures.",
    "question": "Rank the four for \"could be sung\": pop mix, stepwise film line, repeated-note rap cell, leap-heavy engine line. Does the repeated-note cell read as a melody or as a rhythm?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "pop_mix",
        "name": "pop: 25% step / 37% repeat / small leaps only",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 e5@2 e5@4 g5@4 a5@4] [g5@2 e5@2 e5@2 d5@10] [e5@2 e5@2 e5@4 a5@4 c6@4] [a5@2 g5@2 g5@2 c5@10] [e5@2 e5@2 e5@4 g5@4 a5@4] [g5@2 e5@2 e5@2 d5@10] [e5@2 e5@2 e5@4 a5@4 c6@4] [a5@2 g5@2 g5@2 c5@10]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Repeated e's, a rise to the 6th, a 3rd down, a held landing. Largest leap a 5th."
      },
      {
        "id": "film_steps",
        "name": "film: ~60% stepwise, 16th run pickups, one wide fall",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 f5@1 g5@1 c6@4 a5@4 g5@4] [e5@2 d5@2 c5@2 d5@10] [e5@2 f5@1 g5@1 a5@4 c6@4 e5@4] [a5@2 g5@2 f5@2 a5@10] [e5@2 f5@1 g5@1 c6@4 a5@4 g5@4] [e5@2 d5@2 c5@2 d5@10] [e5@2 f5@1 g5@1 a5@4 c6@4 e5@4] [a5@2 g5@2 f5@2 a5@10]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":112,\"bars\":8}"
        },
        "note": "A scale run into the peak, stepwise descent; the odd-16th onsets are run members (film: 90% of odd 16ths are pickups/runs)."
      },
      {
        "id": "rap_repeat",
        "name": "hiphop: one pitch restruck, syncopated, one move per cell",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 e5@2 e5@2 ~@2 e5@2 e5@2 g5@2 e5@2] [d5@2 d5@2 d5@2 ~@2 d5@2 d5@2 e5@2 d5@2] [e5@2 e5@2 e5@2 ~@2 e5@2 e5@2 a5@2 e5@2] [c5@2 c5@2 c5@2 ~@2 c5@2 a4@2 c5@4] [e5@2 e5@2 e5@2 ~@2 e5@2 e5@2 g5@2 e5@2] [d5@2 d5@2 d5@2 ~@2 d5@2 d5@2 e5@2 d5@2] [e5@2 e5@2 e5@2 ~@2 e5@2 e5@2 a5@2 e5@2] [c5@2 c5@2 c5@2 ~@2 c5@2 a4@2 c5@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":112,\"bars\":8}"
        },
        "note": "shape_of_you-verse mechanics: the pitch is re-fit per chord (e over C, d over G, e over Am, c over F) but inside the bar it barely moves; the rest on beat 2 is the breath."
      },
      {
        "id": "engine_leaps",
        "name": "FALSIFICATION: the engine's shape - 12% step, 3 leaps beyond a 5th per bar",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@2 c6@2 g5@4 d5@4 b5@4] [a5@2 d5@2 b5@2 g5@10] [e5@2 c6@2 a5@4 c5@4 a5@4] [f5@2 c6@2 a4@2 c5@10] [e5@2 c6@2 g5@4 d5@4 b5@4] [a5@2 d5@2 b5@2 g5@10] [e5@2 c6@2 a5@4 c5@4 a5@4] [f5@2 c6@2 a4@2 c5@10]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Same rhythm as the pop mix, all in key - only the interval sizes changed (e-c6 8, d-b5 9, a-c5 9, f-c6 7...). Measured 6% step / 40% leaps beyond a 5th: the engine's 16% / 19% amplified. If this reads worse than the pop mix, the gap is INTERVAL SIZE, not harmony."
      }
    ],
    "batch": 1
  },
  "pl_melody_phrase_qa": {
    "id": "pl_melody_phrase_qa",
    "worth": "skip",
    "expected": "Known: a 4-bar question ending open on a held non-tonic, answered by 4 bars landing on the held tonic, reads as a phrase pair; both on the tonic reads as two statements; removing the holds makes it busier, not less of a melody. The cadence grammar (cadenceNo7, heldFirst) already does this.",
    "lane": "melody",
    "source_songs": [
      "counting_stars",
      "7_years",
      "adams_song",
      "the_scientist",
      "someone_like_you"
    ],
    "finding": "Pop phrases (gap >= a beat or a note >= 2 beats ends one) are 1.74 bars median and 56% end on a note held >= 2 beats (ballad 67%, edm 79%, game 100%; hiphop 11%). The second phrase of a pair ends LOWER than the first in 35%, HIGHER in 38%, on the SAME pitch in 29% - direction is not the answer mechanism. Bar 4 of a 4-bar unit ends on the key tonic 26% vs bar 2 23%, and on the sounding chord's root 13% vs 10% - a weak but consistent bar-4 close. counting_stars: Q ends g#5 held 2.5 beats, A ends e5 held 2 beats, twice.",
    "hypothesis": "The held landing is load-bearing: a 4-bar question ending open (3rd of IV, held) answered by 4 bars ending on the tonic (held) reads as a phrase pair; ending both on the tonic reads as two statements, still fine; an answer that ends higher is as acceptable as one that ends lower (his nocturne verdict: both directions passed); removing the holds and running 8ths through both cadences reads as breathless and unphrased.",
    "question": "Do the two 4-bar halves read as question and answer? Is the higher-ending answer as convincing as the tonic one? And when the holds are removed, does it stop being a melody or just get busier?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "q_open_a_tonic",
        "name": "question ends open (a5, 3rd of F) held; answer ends on the tonic held",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c5@4 e5@4 a5@4 g5@4] [a5@4 g5@2 f5@2 a5@8] [e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c6@4 a5@4 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":104,\"bars\":8}"
        },
        "note": "Bars 1-3 shared; bar 4 lands a5 for 2 beats, bar 8 lands c5 for 2.5 beats. The pack's 4-bar close."
      },
      {
        "id": "both_tonic",
        "name": "both phrases end on the tonic held (the pack's 29% \"same\" case)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c5@4 e5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 c5@10] [e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c6@4 a5@4 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":104,\"bars\":8}"
        },
        "note": "Bar 4 = bar 8's landing. Two closed statements rather than Q/A."
      },
      {
        "id": "answer_higher",
        "name": "answer ends HIGHER (e5) than the question (c5)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c5@4 e5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 c5@10] [e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [c6@4 a5@4 g5@4 e5@4] [g5@2 a5@2 g5@2 e5@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":104,\"bars\":8}"
        },
        "note": "The question closes on c, the answer opens upward to e (maj7 over F, held). 38% of pack answers end higher."
      },
      {
        "id": "no_held_landing",
        "name": "FALSIFICATION: no landing held - 8ths run through both cadence bars",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@2 d5@2 e5@2 g5@2 e5@2] [c5@4 e5@4 a5@4 g5@4] [a5@2 g5@2 f5@2 a5@2 g5@2 f5@2 e5@2 d5@2] [e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@2 d5@2 e5@2 g5@2 e5@2] [c6@4 a5@4 g5@4 e5@4] [d5@2 e5@2 d5@2 c5@2 d5@2 e5@2 g5@2 e5@2]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":104,\"bars\":8}"
        },
        "note": "Bars 2, 4, 6 and 8 keep moving in 8ths to the barline (the reference holds all four >= 2 beats). The pack holds 56% of pop phrase endings >= 2 beats; here 0%."
      }
    ],
    "batch": 1
  },
  "pl_melody_thickness": {
    "id": "pl_melody_thickness",
    "lane": "melody",
    "source_songs": [
      "how_to_save_a_life",
      "you_say",
      "call_me_maybe",
      "faded",
      "clocks"
    ],
    "finding": "Under the top voice the RH strikes 2+ notes on 35% of pop onsets (median, n=61 raw; ballad 39%, rock 53%, hiphop 68%; game 21%, film 23%). Thickness is placed: downbeats are thick 46% vs off-beats 28% in pop; phrase-final notes 43%. The interval directly below the top (pooled pop, 11,060 thick onsets): a 3rd 30%, a 4th/5th 30%, an octave 23%, a 6th 13%. how_to_save_a_life's chorus is octave-doubled on every note; you_say's chorus is full 4-note chords under the tune; call_me_maybe's verse is 3rds/6ths on the offbeat comps.",
    "hypothesis": "The single line reads as a demo; 3rds/6ths on downbeats and landings read as \"the melody is chord too\" (D98) without muddying the tune; 3rds on every note read as a parallel-harmony choir; octaves throughout read as the chorus lift device (louder, wider, not richer); 4ths/5ths throughout read hollow/power-chord-like.",
    "question": "Which thickening reads as the pop piano sound: dyads only on downbeats and landings, 3rds throughout, octaves throughout, or 4ths/5ths throughout? Does the single line sound unfinished by comparison?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "single",
        "name": "the hook alone (single top voice)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [e5@4 a5@4 c6@4 a5@4] [c6@2 a5@2 g5@2 a5@10] [e5@4 g5@4 a5@4 g5@4] [d5@2 e5@2 d5@2 b4@10] [e5@4 a5@4 c6@4 a5@4] [c6@2 a5@2 g5@2 a5@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":108,\"bars\":8}"
        },
        "note": "Reference line: quarter-note bar then a syncopated bar with a held landing."
      },
      {
        "id": "ends_and_downbeats",
        "name": "dyads (3rd/6th below) on downbeats and phrase landings only",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[[e5,c5]@4 g5@4 a5@4 g5@4] [[d5,b4]@2 e5@2 d5@2 [b4,g4]@10] [[e5,c5]@4 a5@4 c6@4 a5@4] [[c6,a5]@2 a5@2 g5@2 [a5,f5]@10] [[e5,c5]@4 g5@4 a5@4 g5@4] [[d5,b4]@2 e5@2 d5@2 [b4,g4]@10] [[e5,c5]@4 a5@4 c6@4 a5@4] [[c6,a5]@2 a5@2 g5@2 [a5,f5]@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":108,\"bars\":8}"
        },
        "note": "The pack's placement: thick where the bar and the phrase land, single in between (downbeats 46% thick vs off-beats 28%)."
      },
      {
        "id": "thirds_throughout",
        "name": "3rds/6ths under every note",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[[e5,c5]@4 [g5,e5]@4 [a5,c5]@4 [g5,e5]@4] [[d5,b4]@2 [e5,b4]@2 [d5,b4]@2 [b4,g4]@10] [[e5,c5]@4 [a5,c5]@4 [c6,a5]@4 [a5,c5]@4] [[c6,a5]@2 [a5,f5]@2 [g5,e5]@2 [a5,f5]@10] [[e5,c5]@4 [g5,e5]@4 [a5,c5]@4 [g5,e5]@4] [[d5,b4]@2 [e5,b4]@2 [d5,b4]@2 [b4,g4]@10] [[e5,c5]@4 [a5,c5]@4 [c6,a5]@4 [a5,c5]@4] [[c6,a5]@2 [a5,f5]@2 [g5,e5]@2 [a5,f5]@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":108,\"bars\":8}"
        },
        "note": "Rock/hiphop density (53-68% thick). Chord-aware 3rds and 6ths, never a 4th."
      },
      {
        "id": "octaves_throughout",
        "name": "octave-doubled on every note (how_to_save_a_life's chorus)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[[e5,e4]@4 [g5,g4]@4 [a5,a4]@4 [g5,g4]@4] [[d5,d4]@2 [e5,e4]@2 [d5,d4]@2 [b4,b3]@10] [[e5,e4]@4 [a5,a4]@4 [c6,c5]@4 [a5,a4]@4] [[c6,c5]@2 [a5,a4]@2 [g5,g4]@2 [a5,a4]@10] [[e5,e4]@4 [g5,g4]@4 [a5,a4]@4 [g5,g4]@4] [[d5,d4]@2 [e5,e4]@2 [d5,d4]@2 [b4,b3]@10] [[e5,e4]@4 [a5,a4]@4 [c6,c5]@4 [a5,a4]@4] [[c6,c5]@2 [a5,a4]@2 [g5,g4]@2 [a5,a4]@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":108,\"bars\":8}"
        },
        "note": "Octaves are 23% of pop thick onsets and 33-44% in ballad/edm; the ballad chorus device."
      },
      {
        "id": "fourths_throughout",
        "name": "4ths/5ths under every note (mostly)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[[e5,b4]@4 [g5,c5]@4 [a5,e5]@4 [g5,c5]@4] [[d5,g4]@2 [e5,a4]@2 [d5,g4]@2 [b4,g4]@10] [[e5,a4]@4 [a5,e5]@4 [c6,g5]@4 [a5,e5]@4] [[c6,f5]@2 [a5,f5]@2 [g5,c5]@2 [a5,f5]@10] [[e5,b4]@4 [g5,c5]@4 [a5,e5]@4 [g5,c5]@4] [[d5,g4]@2 [e5,a4]@2 [d5,g4]@2 [b4,g4]@10] [[e5,a4]@4 [a5,e5]@4 [c6,g5]@4 [a5,e5]@4] [[c6,f5]@2 [a5,f5]@2 [g5,c5]@2 [a5,f5]@10]>\",\"sound\":\"piano\",\"gain\":0.75}],\"bpm\":108,\"bars\":8}"
        },
        "note": "30% of pop thick onsets carry a 4th/5th directly below the top. Predicted: hollow next to the 3rds variant; the \"power\" sound."
      }
    ],
    "batch": 1
  },
  "pl_melody_chorus_lift": {
    "id": "pl_melody_chorus_lift",
    "worth": "skip",
    "expected": "Overlaps #4 and #12: the lift is register + thickness + LH density at the same note lengths; halving the melody onsets reads as a slowdown. The as-measured variant is what the engine keeps.",
    "lane": "melody",
    "source_songs": [
      "how_to_save_a_life",
      "you_say",
      "sign_of_the_times",
      "wheres_my_love",
      "safe_and_sound"
    ],
    "finding": "On 117 songs with a register lift between the first active section and the highest later one (median +10 st; pop +8.5, ballad/rock +12), the RH note length ratio is 1.00 and the onset density ratio 0.98 - the chorus does NOT slow down or thin out. What changes: thickness 17% -> 59% of onsets (pop 36% -> 54%), LH density x1.32 (pop x1.39), velocity +6 (pop +0.3), and rhythm repetition FALLS (44% -> 29%). how_to_save_a_life bar 39: the tune returns an octave up doubled in octaves over a busier alberti; you_say bar 39: 4-note chords under the top, LH 2.5 -> 14.5 onsets a bar.",
    "hypothesis": "The lift is REGISTER + THICKNESS + LH DENSITY at the same note lengths; a chorus that halves the melody's onsets (my expectation before measuring) reads as a slowdown, not a lift. Register alone reads as the same tune moved (his \"adding octaves is inaudible\" law predicts it is barely a lift); thickness + LH alone at the verse register reads as a build without arrival.",
    "question": "Does the chorus land as a lift in the reference? Which single variable carries it - the octave, the dyads, or the busier left hand? Does the longer-notes chorus feel bigger or slower?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_measured",
        "name": "verse 8 bars, then the hook an octave up + dyads on beats and landings (44% thick) + LH x1.5 + full kit (note lengths unchanged)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat]>\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [[e5,c5]@3 [g5,e5]@3 a5@2 [g5,e5]@4 e5@4] [e5@2 g5@2 e5@2 [d5,b4]@10] [[e5,c5]@3 [a5,e5]@3 c6@2 [a5,c5]@4 e5@4] [d5@2 e5@2 d5@2 [c5,a4]@10] [[e5,c5]@3 [g5,e5]@3 a5@2 [g5,e5]@4 e5@4] [e5@2 g5@2 e5@2 [d5,b4]@10] [[e5,c5]@3 [a5,e5]@3 c6@2 [a5,c5]@4 e5@4] [d5@2 e5@2 d5@2 [c5,a4]@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":16}"
        },
        "note": "Same cell, same durations; +12 st, 3rds/6ths under the on-beat notes and the landing (measured 44% of chorus onsets thick; pack pop 54%), LH 8 -> 12 onsets with octave bass, hat 8ths join."
      },
      {
        "id": "longer_notes",
        "name": "FALSIFICATION: the chorus hook at half the onsets, each note doubled (register/thickness/LH as measured)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat]>\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [[e5,c5]@6 [g5,e5]@6 a5@4] [g5@4 e5@4 [d5,b4]@8] [[e5,c5]@6 [a5,e5]@6 c6@4] [e5@4 d5@4 [c5,a4]@8] [[e5,c5]@6 [g5,e5]@6 a5@4] [g5@4 e5@4 [d5,b4]@8] [[e5,c5]@6 [a5,e5]@6 c6@4] [e5@4 d5@4 [c5,a4]@8]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":16}"
        },
        "note": "The pack's note-length ratio is 1.00; here it is 2.0. Predicted: reads as a slower section, not a chorus."
      },
      {
        "id": "register_only",
        "name": "the hook an octave up, everything else as the verse",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~]>\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":16}"
        },
        "note": "Only the register moves (+12). His law says development by adding octaves is inaudible - is MOVING an octave a lift?"
      },
      {
        "id": "thick_lh_only",
        "name": "dyads + LH x1.5 + kit at the VERSE register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]] [[c2,c3] [g3 c4] c4 [g3 c4] [c2,c3] [g3 c4] c4 [g3 c4]] [[g2,g3] [d3 g3] g3 [d3 g3] [g2,g3] [d3 g3] g3 [d3 g3]] [[a2,a3] [e3 a3] a3 [e3 a3] [a2,a3] [e3 a3] a3 [e3 a3]] [[f2,f3] [c3 f3] f3 [c3 f3] [f2,f3] [c3 f3] f3 [c3 f3]]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"<[md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick ~ md_snare ~] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat] [md_kick md_hat md_snare md_hat md_kick md_hat md_snare md_hat]>\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [e4@3 g4@3 a4@2 g4@4 e4@4] [e4@2 g4@2 e4@2 d4@10] [e4@3 a4@3 c5@2 a4@4 e4@4] [d4@2 e4@2 d4@2 c4@10] [[e4,c4]@3 [g4,e4]@3 a4@2 [g4,e4]@4 e4@4] [e4@2 g4@2 e4@2 [d4,b3]@10] [[e4,c4]@3 [a4,e4]@3 c5@2 [a4,c4]@4 e4@4] [d4@2 e4@2 d4@2 [c4,a3]@10] [[e4,c4]@3 [g4,e4]@3 a4@2 [g4,e4]@4 e4@4] [e4@2 g4@2 e4@2 [d4,b3]@10] [[e4,c4]@3 [a4,e4]@3 c5@2 [a4,c4]@4 e4@4] [d4@2 e4@2 d4@2 [c4,a3]@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":16}"
        },
        "note": "Everything but the octave. Predicted: a build that never arrives."
      }
    ],
    "batch": 1
  },
  "pl_melody_transfer_loops": {
    "id": "pl_melody_transfer_loops",
    "worth": "skip",
    "expected": "Known: a cell composed by the same rules over a minor loop reads as the same composer's sad hook; the transplanted major hook is wrong over the minor loop (its 3rds clash), not merely different; the rules-off variant is the engine's pre-r33 shape. Self-validation — nothing for your ear to settle.",
    "lane": "melody",
    "source_songs": [
      "someone_like_you",
      "let_her_go",
      "call_me_maybe",
      "counting_stars",
      "the_scientist"
    ],
    "finding": "The same hook grammar holds across the pop family with different tempos and modes: ballad/sad (n=29) and pop/excited (n=12) both sit at 36% / 33% stepwise, 40% / 39% NCT, 88% / 92% pentatonic, 63% / 71% rhythm repetition, 1.9 / 1.8-bar phrases. The r33 labs' nocturne grammar transferred to seven hosts (\"sounds human\"). The minor loop Am F C G (i bVI bIII bVII) is the pack's 3rd most common minor loop.",
    "hypothesis": "A 2-bar cell (dotted head, held landing, minor-pentatonic body, landing re-fit per chord) composed by the SAME rules reads as a sad ballad hook over Am F C G at 76 on flute exactly as the major version reads as a pop hook at 112 on epiano; transplanting the major hook's pitches note-for-note onto the minor bed also survives (C-major and A-minor pentatonic are the same five pitches) but its landings sit on the wrong chord members; switching the rules OFF (no repeat, leaps, no held landing, final-slot 16ths) over the minor bed reads like the engine.",
    "question": "Does the minor hook sound like it came from the same composer as the major one? Is the transplanted major hook merely different or actually wrong over the minor loop? Does the rules-off variant sound like the engine's current songs?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "major_pop",
        "name": "the rules over C G Am F at 112, epiano (card 1 reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_epiano1\",\"gain\":0.7}],\"bpm\":112,\"bars\":8}"
        },
        "note": "Major pentatonic cell, landing re-fit, held landing, 3+3+2 head."
      },
      {
        "id": "minor_ballad",
        "name": "the same rules re-composed over Am F C G at 76, flute",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 c4 e4 c4 a3 e3] [f2 c3 f3 a3 c4 a3 f3 c3] [c3 g3 c4 e4 g3 e4 c4 g3] [g2 d3 g3 b3 d4 b3 g3 d3]>\",\"sound\":\"piano\",\"gain\":0.4,\"room\":0.3},{\"mini\":\"<[a4@3 c5@3 d5@2 c5@4 a4@4] [e5@2 d5@2 c5@2 a4@10] [g4@3 c5@3 d5@2 c5@4 g4@4] [e5@2 d5@2 c5@2 b4@10] [a4@3 c5@3 d5@2 c5@4 a4@4] [e5@2 d5@2 c5@2 a4@10] [g4@3 c5@3 d5@2 c5@4 g4@4] [e5@2 d5@2 c5@2 b4@10]>\",\"sound\":\"gm_flute\",\"gain\":0.6,\"room\":0.3}],\"bpm\":76,\"bars\":8}"
        },
        "note": "Minor-pentatonic body (a c d), the head on the same 0,3,6,8,12 skeleton, landings a (3rd of F), b (3rd of G). A new hook, not the major one moved."
      },
      {
        "id": "transplant",
        "name": "the major hook's pitches note-for-note over the minor bed at 76",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 c4 e4 c4 a3 e3] [f2 c3 f3 a3 c4 a3 f3 c3] [c3 g3 c4 e4 g3 e4 c4 g3] [g2 d3 g3 b3 d4 b3 g3 d3]>\",\"sound\":\"piano\",\"gain\":0.4,\"room\":0.3},{\"mini\":\"<[e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10] [e5@3 g5@3 a5@2 g5@4 e5@4] [e5@2 g5@2 e5@2 d5@10] [e5@3 a5@3 c6@2 a5@4 e5@4] [d5@2 e5@2 d5@2 c5@10]>\",\"sound\":\"gm_flute\",\"gain\":0.6,\"room\":0.3}],\"bpm\":76,\"bars\":8}"
        },
        "note": "Same five pitch classes, so nothing is out of key - but the landings are d over F (6th) and c over G (sus4). Is it wrong or just less sad?"
      },
      {
        "id": "rules_off",
        "name": "FALSIFICATION: over the minor bed, no repeat + leaps > P5 + no held landing + final-slot 16ths",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a2 e3 a3 c4 e4 c4 a3 e3] [f2 c3 f3 a3 c4 a3 f3 c3] [c3 g3 c4 e4 g3 e4 c4 g3] [g2 d3 g3 b3 d4 b3 g3 d3]>\",\"sound\":\"piano\",\"gain\":0.4,\"room\":0.3},{\"mini\":\"<[a4@2 e5@2 c5@4 a5@4 d5@3 c6@1] [f5@4 a4@2 c6@2 e5@4 g4@4] [e5@2 c5@2 g5@4 e4@4 b5@3 g5@1] [d5@6 b5@2 g4@4 d6@2 a5@2] [c5@4 a5@2 e4@2 c6@4 e5@3 a4@1] [a5@2 f4@2 c6@4 a4@4 f5@3 c5@1] [g5@4 c5@2 e6@2 g4@4 c6@2 e5@2] [b4@2 g5@2 d5@2 b5@2 g4@4 d6@2 b4@2]>\",\"sound\":\"gm_flute\",\"gain\":0.6,\"room\":0.3}],\"bpm\":76,\"bars\":8}"
        },
        "note": "All in scale, same bed - only the grammar is gone. Measured: 0% stepwise, 67% of moves beyond a 5th, 6 distinct skeletons, no note held 2 beats, four 16ths hanging off barlines - the engine's r33 shape amplified (it measures 16% step / 19% big leaps)."
      }
    ],
    "batch": 1
  },
  "pl_melody_tresillo_frozen": {
    "id": "pl_melody_tresillo_frozen",
    "lane": "melody",
    "source_songs": [
      "shape_of_you",
      "rap_god",
      "ice_ice_baby",
      "clocks",
      "i_knew_you_were_trouble"
    ],
    "finding": "shape_of_you's hook is three notes at 8ths 0-3-6 (a 3+3+2 tresillo) with IDENTICAL pitches (c#4 e4 c#4) over C#m, F#m and A, re-pitched only over the 4th chord (d#4 c#4 b3) - the frozen-cell mechanism the r33 reels study found where harmony moves fast, now in the pack's most-played pop song. Tresillo slots carry 44% of pop LH onsets and the 3+3+2 class is 28% of pop odd-16th melody onsets. rap_god / ice_ice_baby hooks are all-zero-interval cells repeated 22-48 times.",
    "hypothesis": "The frozen tresillo cell over three chords with the fourth bar re-pitched reads as a riff-hook (the 9th/6th over the moving chords is the tension that makes it a riff); re-fitting it every bar reads as a chord exercise; the same pitches on straight quarters lose the hook; one pitch on the tresillo reads as a rhythm, not a melody, until the 4th bar moves; the D118 final-slot 16th on the cell reads as a stumble.",
    "question": "Is the frozen cell with its held 6th/4th over the moving chords a hook or a clash? Does re-fitting every bar sound better or more generic? Does the straight-quarter version still feel like a hook? Does the repeated single pitch work as a verse hook?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "frozen_tresillo",
        "name": "frozen 3+3+2 cell over C, G, Am; re-pitched over F (the pack's frozen-cell mechanism, new pitches)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[g5@6 a5@6 e5@4] [g5@6 a5@6 e5@4] [g5@6 a5@6 e5@4] [a5@6 g5@6 f5@4] [g5@6 a5@6 e5@4] [g5@6 a5@6 e5@4] [g5@6 a5@6 e5@4] [a5@6 g5@6 f5@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":120,\"bars\":8}"
        },
        "note": "g a e over C (5-6-3); the same over G (a = 9th, e = 6th) and Am (g = b7); then a g f over F. An ORIGINAL cell: +2/-5 on the tresillo, not the pack song's +3/-3. Three identical bars, one change."
      },
      {
        "id": "refit_every_bar",
        "name": "the same cell re-fit to each chord",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[g5@6 c6@6 e5@4] [g5@6 b5@6 d5@4] [a5@6 c6@6 e5@4] [a5@6 c6@6 f5@4] [g5@6 c6@6 e5@4] [g5@6 b5@6 d5@4] [a5@6 c6@6 e5@4] [a5@6 c6@6 f5@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":120,\"bars\":8}"
        },
        "note": "Root/5th-fitted each bar: no rub anywhere. The engine's ladder does this by default."
      },
      {
        "id": "straight_quarters",
        "name": "FALSIFICATION: the frozen pitches on the beat (0, 4, 8)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[g5@4 a5@4 e5@4 ~@4] [g5@4 a5@4 e5@4 ~@4] [g5@4 a5@4 e5@4 ~@4] [a5@4 g5@4 f5@4 ~@4] [g5@4 a5@4 e5@4 ~@4] [g5@4 a5@4 e5@4 ~@4] [g5@4 a5@4 e5@4 ~@4] [a5@4 g5@4 f5@4 ~@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":120,\"bars\":8}"
        },
        "note": "Same pitches, same 3 onsets, same note lengths (a rest fills beat 4), no syncopation. If the hook disappears, the 3+3+2 was the hook."
      },
      {
        "id": "one_pitch",
        "name": "one pitch on the tresillo, moving only on the 4th bar's last note (rap/verse hook)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[e5@6 e5@6 e5@4] [e5@6 e5@6 e5@4] [e5@6 e5@6 e5@4] [e5@6 e5@6 f5@4] [e5@6 e5@6 e5@4] [e5@6 e5@6 e5@4] [e5@6 e5@6 e5@4] [e5@6 e5@6 f5@4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":120,\"bars\":8}"
        },
        "note": "rap_god's all-zero-interval cell. Rhythm alone carrying the hook; the pitch is a pedal against C, G, Am."
      },
      {
        "id": "d118_tail",
        "name": "FALSIFICATION: the frozen cell with a 16th stuck in the bar's last slot",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c3 g3 c4 g3 c3 g3 c4 g3] [g2 d3 g3 d3 g2 d3 g3 d3] [a2 e3 a3 e3 a2 e3 a3 e3] [f2 c3 f3 c3 f2 c3 f3 c3]>\",\"sound\":\"piano\",\"gain\":0.45},{\"mini\":\"[md_kick md_hat md_snare md_hat]\",\"sound\":\"md_kick\",\"gain\":0.3},{\"mini\":\"<[g5@6 a5@6 e5@3 g5@1] [g5@6 a5@6 e5@3 g5@1] [g5@6 a5@6 e5@3 g5@1] [a5@6 g5@6 f5@3 a5@1] [g5@6 a5@6 e5@3 g5@1] [g5@6 a5@6 e5@3 g5@1] [g5@6 a5@6 e5@3 g5@1] [a5@6 g5@6 f5@3 a5@1]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.55}],\"bpm\":120,\"bars\":8}"
        },
        "note": "The engine's habit applied to a riff: a 16th g before every barline. Predicted: the riff stops swinging and starts stumbling."
      }
    ],
    "batch": 1
  },
};
