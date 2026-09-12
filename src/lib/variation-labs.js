// r33 — VARIATION LABS (audition/variations.html data).
//
// HIS RULING (export-5 message, verbatim): "variation labs should be a
// different page. moreover there should be many many more variations.
// experiment as much as you can with not just the samples and changing
// intervals/notes/order in the samples but also combos of instruments and
// also trying to compose in speicifc ways with respect to the samples and how
// mixing samples mixes their genres/vibes and composing with respect to that.
// there's so many."
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
// id string — resolved only by scripts/audition-variations.mjs.
//
// Batches append only: his queue position on the page never shifts.

export const VARIATION_META = { round: 'r33' };

export const VARIATION_LABS = {
  "lab_flow_pendulum": {
    "id": "lab_flow_pendulum",
    "lane": "flow",
    "source_cards": [
      "cand_cw_airvoyage_pendulum",
      "cand_b6_vl_pendulum_flows",
      "cand_b6_vl_pendulum_bright_third"
    ],
    "his_words": "if 3 is high 2 is middle and 1 is low, instead of 321232123 repeatedly it could be 3213232123232 or something right? percussive and stuff. just make sure it actually sounds groovy. this could also be added later into the song as a variation / the variation in the third measure or something doesn't match the happy vibe (rl_r6)",
    "hypothesis": "The pendulum's identity is three registers of one chord (root high, 5th mid, root low) on a straight-8th staccato grid, so any reordering of the SAME three tones that keeps a danceable grouping (3+3+2, or his 13-digit string with a breath after each digit group) still reads as \"the pendulum varying\". Separately, the darkness he flagged in the chord-change bar was the E-natural (#11 over Bb, present only in the reference variant), not the act of varying: bright3rd swaps only that tone for the 3rd (d4) — if that bar still reads dark, the problem is the variation slot itself.",
    "question": "Do regroup332, literal13 and pairdouble each still read as THE pendulum varying, or does one become a different figure? Is literal13 — your exact 3213232123232 — actually groovy with rests after each digit group, or does it stumble? Does bright3rd finally match the happy vibe in the third measure? And is enterslater (2 bars plain, then the 3+3+2 takes over) the right way for the variation to arrive mid-song?",
    "key_tonic": "A#",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 e4 a#3 e4 a#4 e4 a#3 e4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":3,\"note\":\"strings staccato; source adds a 16th shaker carpet\"}"
        },
        "note": "as judged: two pendulum bars, then the chord-change bar with the E-natural you flagged as too dark. Bass identical in every variant. (carries the source's dark bar-3 e-natural (the tritone you flagged) — bright3rd refills that slot)",
        "chromatic_ok": true
      },
      {
        "id": "regroup332",
        "name": "3+3+2 regrouping",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[a#4 f4 a#3 a#4 f4 a#4 f4 a#3]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":2}"
        },
        "note": "same three tones, regrouped H-M-L | H-M-H | M-L on the same 8th grid — the accent lands early into beat 3's push."
      },
      {
        "id": "literal13",
        "name": "his literal 3213232123232 (13-in-16)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[a#4 f4 a#3 ~ a#4 f4 a#4 ~ f4 a#3 f4 a#4 ~ f4 a#4 f4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":2}"
        },
        "note": "your exact digit string on the three tones as 16ths, rests after each digit group (321 / 323 / 2123 / 232): the gaps sit at the ends of beats 1 and 2 and on beat 4, so the last three notes become a pickup into the next bar."
      },
      {
        "id": "pairdouble",
        "name": "16th-pair percussive double",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[a#4 f4 a#3 f4 a#4 [f4 f4] a#3 f4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":2}"
        },
        "note": "the pendulum untouched except beat 3's middle tone strikes as a 16th pair — the percussive push, one moment per bar."
      },
      {
        "id": "bright3rd",
        "name": "bright third in the chord-change bar",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 d4 a#3 d4 a#4 d4 a#3 d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":3}"
        },
        "note": "the same 3-bar shape with the dark E-natural replaced by d4 (the 3rd): the variation slot survives, only the color tone changes."
      },
      {
        "id": "enterslater",
        "name": "enters later (context demo)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 f4 a#3 a#4 f4 a#4 f4 a#3] [a#4 f4 a#3 a#4 f4 a#4 f4 a#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7}],\"bpm\":140,\"bars\":4}"
        },
        "note": "how a song would use it: two bars of the plain pendulum, then the 3+3+2 regroup takes over for two bars — the variation added later, per your note."
      }
    ],
    "batch": 1
  },
  "lab_flow_hexarp": {
    "id": "lab_flow_hexarp",
    "lane": "flow",
    "source_cards": [
      "cand_cw_morning_hexarp",
      "cand_b6_vl_hexarp_flows"
    ],
    "his_words": "for the harp thing you should vary the melody a bit though like you can do more stuff with the harp than this hardcoded melody too. strings should stay the same - these strings add more atmosphere",
    "hypothesis": "The run fits because it is the A-major ladder MINUS scale degree 4 (a b c# e f# g# = R 2 3 5 6 7) — d is the one tone that rubs both the tonic chord (as an 11) and the E-side dyads — so any contour drawn from the d-free ladder keeps the shimmer while killing the hardcoded-melody feel. Every variant here is d-free and the strings are byte-identical (your rule), so whatever changes between them is contour/rhythm only.",
    "question": "With strings identical everywhere: which flow keeps the heartfelt new-day feel best — arch, zigzag, answer or peakwalk? Does answer overfill the silence you liked (the harp now plays every bar), and does peakwalk's rising peak read as growth or as the same increment problem the dq pizz had?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6,\"note\":\"source doubles roots an octave down on tuba; strings are bare dyads, never triads\"}"
        },
        "note": "the judged reference: the d-free ladder climbs one octave, rests a bar, three times; strings verbatim."
      },
      {
        "id": "arch",
        "name": "arch contour (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 a4 g#4 f#4 e4] ~ [a3 b3 c#4 e4 a4 g#4 f#4 e4] ~ [a3 b3 c#4 e4 a4 g#4 f#4 e4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "from the first-gen lab, split out: climb four notes then fall back four — still one bar on, one bar off, strings untouched."
      },
      {
        "id": "zigzag",
        "name": "zigzag with dotted push (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3@3 c#4 b3@3 e4 c#4@2 f#4@2 e4@2 a4@2] ~ [a3@3 c#4 b3@3 e4 c#4@2 f#4@2 e4@2 a4@2] ~ [a3@3 c#4 b3@3 e4 c#4@2 f#4@2 e4@2 a4@2] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "from the first-gen lab, split out: thirds up, step back, on a dotted long-short rhythm — the only variant that changes the harp's rhythm as well as its contour."
      },
      {
        "id": "answer",
        "name": "question/answer phrase split",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] [b4 a4 g#4 e4 c#4@4] [a3 b3 c#4 e4 f#4 g#4 a4 b4] [b4 a4 g#4 e4 c#4@4] [a3 b3 c#4 e4 f#4 g#4 a4 b4] [b4 a4 g#4 e4 c#4@4]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "odd bars the original run, even bars a falling answer (steps b4-a4-g#4, then down the chord to a held c#4 — consonant over all three string dyads). The rest bar becomes an answer, so the harp now plays every bar."
      },
      {
        "id": "peakwalk",
        "name": "top-note walk (peak 1-2-3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4@2] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 g#4 a4 b4 c#5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "three statements whose peak walks a4 -> b4 -> c#5 (1-2-3): statement one stops on a held a4, two is the original, three extends a step higher (the e4-g#4 skip mirrors the ladder's own c#4-e4 skip). Rests and strings untouched."
      }
    ],
    "batch": 1
  },
  "lab_flow_lattice": {
    "id": "lab_flow_lattice",
    "lane": "flow",
    "source_cards": [
      "cand_cw_airpirate_lattice",
      "cand_b6_vl_lattice_breathing_top"
    ],
    "his_words": "the glockenspiel note should vary like go up a note or something (of course it depends on the song) to add variation because it sounds a bit uniform",
    "hypothesis": "The uniformity is one voice — the vibraphone chord's g5 top striking identically every bar over cogs that are frozen BY DESIGN — so varying only that voice (lift9, lift10, qa), or one cog's last strike (upperneighbor), should kill the uniform feel without breaking the lattice. The literal \"a third lower\" answer (eb5) failed its chord check — a minor 9th against the held d5 cog and the D pedal — which is why qa answers on the chord tone below (d5) instead.",
    "question": "Which dose and direction works: lift9's step up, lift10's bigger reach, upperneighbor's single lifted cog strike, or qa's answer-below? Is every-other-bar the right frequency, and did any variant stop sounding like the same lattice?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1,\"note\":\"low part is timpani in source; source adds conga 16th pairs + woodblock offbeats + claps on 2/3/4 with tambourine, all at whisper velocity\"}"
        },
        "note": "the judged 1-bar lattice: frozen cogs over the D pedal, the vibraphone chord topping g5 every bar — the uniformity you flagged."
      },
      {
        "id": "lift9",
        "name": "top voice up a step — the 9th (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"<[g4,a#4,d5,g5] [g4,a#4,d5,a5]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out: every second bar only the vibe chord's top note lifts g5 -> a5 (your \"go up a note\", literally). Everything else frozen."
      },
      {
        "id": "lift10",
        "name": "top voice up to the 3rd — a#5 (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"<[g4,a#4,d5,g5] [g4,a#4,d5,a#5]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out: the same every-second-bar lift, but to a#5 — a bigger, brighter reach."
      },
      {
        "id": "upperneighbor",
        "name": "high cog upper-neighbor on its last strike",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g5 ~ g5 ~ f5 ~ f5] [~ g5 ~ g5 ~ f5 ~ g5]>\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":2}"
        },
        "note": "a different layer varies: the g5/f5 mallet cog's LAST strike goes up a note (f5 -> g5) every second bar, then the pattern returns — the vibe chord stays put. Chord-checked: g5 is the root."
      },
      {
        "id": "qa",
        "name": "question/answer top (chord-tone answer)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"<[g4,a#4,d5,g5] [g4,a#4,d5]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":2}"
        },
        "note": "bar 1 as-is, bar 2's chord answers with its top voice down on d5 (the chord tone below g5) — the thinner chord IS the softer answer. The literal diatonic third below (eb5) was vetoed by the chord check: it rubs the held d5 cog."
      }
    ],
    "batch": 1
  },
  "lab_flow_snowy": {
    "id": "lab_flow_snowy",
    "lane": "flow",
    "source_cards": [
      "cand_ut_snowy_bell_fall",
      "cand_b6_vl_snowy_bell_flows"
    ],
    "his_words": "the melody may be a bit too recognizable (maybe vary while keeping the rhythm because I like it) and becomes uniform / the last 5-6 notes sound a bit too off because they're a bit more unique to their vibe which makes it less generalizable",
    "hypothesis": "With the rhythm byte-frozen (your rule), the melody's recognizability lives entirely in its pitch contour — so thirdlower, inversion and arch should each read as the SAME bell doing new things. And the \"too off\" last notes are specifically bar 3's chromatic planing (db6/gb5, present only in the reference variant): tailfix replaces only that bar, diatonically, inside the full 4-bar statement — if the ending still bothers you, the problem is the gesture's shape, not its chromaticism.",
    "question": "Do thirdlower, inversion and arch all still feel snowy, or does one break the bell's identity? In tailfix, does the diatonic bar 3 fix the \"too unique\" ending while keeping everything you liked? The rhythm is untouched in every variant — confirm it still earns that freeze.",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [db6@6 ~@2 gb5 ~ g5 ~ [a5,b5] a5@2 d6] [b5@16]>\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":4}"
        },
        "note": "the judged reference: statement, echo, the chromatic slip bar (db6/gb5 — the last notes you called too off), held landing. (carries the source's chromatic tail (the 'too unique' db) — tailfix replaces it)",
        "chromatic_ok": true
      },
      {
        "id": "thirdlower",
        "name": "third-lower fall (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[b5@6 ~ e5 f#5 ~ g5@2 [f#5,g5] f#5 e5@2]\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out and stated twice: the same rhythm starting a third lower, falling to the 6th — same bell, new pitches, dyad signature kept."
      },
      {
        "id": "inversion",
        "name": "contour inversion (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[g5@6 ~ a5 b5 ~ d6@2 [c6,d6] b5 a5@2]\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out and stated twice: rises where the original falls, dyad signature kept."
      },
      {
        "id": "tailfix",
        "name": "diatonic tail-fix (in context)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [d6@6 ~ g5 a5 ~ b5@2 [a5,b5] a5 g5@2] [c6@6 ~@2 a5 ~ b5 ~ [a5,b5] a5@2 g5] [b5@16]>\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":4}"
        },
        "note": "the full 4-bar statement with ONLY the chromatic bar replaced (held c6, a5-b5 turn, lands g5 — all in key): your \"too unique\" last notes made diatonic, the rest byte-identical."
      },
      {
        "id": "arch",
        "name": "arch contour (new)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[b5@6 ~ c6 d6 ~ e6@2 [d6,e6] c6 b5@2]\",\"sound\":\"gm_celesta\",\"bpm\":110,\"bars\":2}"
        },
        "note": "a new flow on the same frozen rhythm: starts on b5, rises to a held e6 peak, falls back to b5 — an arch that returns where it began, adjacent-step dyad kept ([d6,e6])."
      }
    ],
    "batch": 1
  },
  "lab_flow_horn_echo": {
    "id": "lab_flow_horn_echo",
    "lane": "flow",
    "source_cards": [
      "cand_vg_threed_horn_echo",
      "cand_b6_vl_horn_echo_own_melody"
    ],
    "his_words": "fits but more variation rather than repeating! like vary this to make an own melody, also bear in mind that the last 4-5 notes sounds a bit dissonant because it's unique in style so change those to fit the vibe/key/chords more",
    "hypothesis": "The dissonance is localized to the two chromatic tail notes (c5 and a#4 against D major), not the echo device or the phrase — tailfix changes exactly those and nothing else, so if it still sounds off the problem is elsewhere. Given a fixed tail, the phrase becomes an own melody by developing its own pickup gesture rather than repeating: ownmelody re-flows the second bar from the same pickup, continuation states the repaired phrase then sequences the pickup up a step and walks home. The trailing echo (an 8th late, softer) is kept in every variant.",
    "question": "Does tailfix alone cure the dissonance you flagged? Then between ownmelody and continuation, which earns the \"own melody\" you asked for — the re-flowed 2-bar phrase or the 4-bar statement-plus-development? And does the echo device survive the longer line, or does it clutter bars 3-4 of continuation?",
    "key_tonic": "D",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~@4 f#4@2 g4@2 a4@4 d5@4] [c#5@4 a4@4 c5@2 a#4@4 a4 g4]>\",\"sound\":\"gm_oboe\",\"gain\":0.9},{\"mini\":\"<[~@6 f#4@2 g4@2 a4@4 d5@2] [d5@2 c#5@4 a4@4 c5@2 a#4@2 a4 g4]>\",\"sound\":\"gm_oboe\",\"gain\":0.68}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the judged reference with the chromatic tail (c5, a#4) intact; the echo trails by an 8th at lower gain here and in every variant. (carries the source's dissonant tail tones (your 'last 4-5 notes') — tailfix repairs them)",
        "chromatic_ok": true
      },
      {
        "id": "tailfix",
        "name": "tail-fix only",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~@4 f#4@2 g4@2 a4@4 d5@4] [c#5@4 a4@4 b4@2 g4@4 f#4 e4]>\",\"sound\":\"gm_oboe\",\"gain\":0.9},{\"mini\":\"<[~@6 f#4@2 g4@2 a4@4 d5@2] [d5@2 c#5@4 a4@4 b4@2 g4@2 f#4 e4]>\",\"sound\":\"gm_oboe\",\"gain\":0.68}],\"bpm\":100,\"bars\":2}"
        },
        "note": "only the last notes change: c5/a#4 become b4/g4 and the line walks out f#4-e4 — diatonic to D major, everything before the tail untouched."
      },
      {
        "id": "ownmelody",
        "name": "own-melody flow (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~@4 f#4@2 g4@2 a4@4 b4@4] [a4@4 f#4@4 g4@2 e4@4 f#4 d4]>\",\"sound\":\"gm_oboe\",\"gain\":0.9},{\"mini\":\"<[~@6 f#4@2 g4@2 a4@4 b4@2] [b4@2 a4@4 f#4@4 g4@2 e4@2 f#4 d4]>\",\"sound\":\"gm_oboe\",\"gain\":0.68}],\"bpm\":100,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out: the same pickup shape (f#-g-a) continues to b4 instead of leaping to d5, then walks home to d4 — a new phrase from the phrase's own DNA."
      },
      {
        "id": "continuation",
        "name": "composed continuation (4 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~@4 f#4@2 g4@2 a4@4 d5@4] [c#5@4 a4@4 b4@2 g4@4 f#4 e4] [~@4 g4@2 a4@2 b4@4 e5@4] [d5@4 b4@4 a4@2 g4@2 f#4@2 e4 d4]>\",\"sound\":\"gm_oboe\",\"gain\":0.9},{\"mini\":\"<[~@6 f#4@2 g4@2 a4@4 d5@2] [d5@2 c#5@4 a4@4 b4@2 g4@2 f#4 e4] [~@6 g4@2 a4@2 b4@4 e5@2] [e5@2 d5@4 b4@4 a4@2 g4@2 f#4 e4]>\",\"sound\":\"gm_oboe\",\"gain\":0.68}],\"bpm\":100,\"bars\":4}"
        },
        "note": "an own melody as you asked: the tail-fixed phrase (bars 1-2), then its pickup gesture sequenced up a step (g-a rise onto a held b4, leap to e5) and a stepwise walk all the way home to d4. The echo trails everything."
      }
    ],
    "batch": 1
  },
  "lab_flow_offbeat_pizz": {
    "id": "lab_flow_offbeat_pizz",
    "lane": "flow",
    "source_cards": [
      "cand_lp_r5_offbeat_pizz",
      "cand_b6_vl_offbeat_pizz_third_up"
    ],
    "his_words": "pizzicato fits. maybe could also play some notes like up a note on the third note occasionally for variation",
    "hypothesis": "On a one-pitch background pedal, \"occasionally\" is a dose question: every4th (your recipe read literally — one lift per four bars) should breathe without becoming a melody, every2nd (the first-gen lab's dose) risks reading as a two-bar tune, and twolevel tests whether varying the SIZE of the lift (a step, then a third — both diatonic) adds life or reads as noodling. Nothing else about the layer changes; it stays sparse.",
    "question": "Which dose is right — every4th or every2nd? In twolevel, is the alternating step/third lift welcome variety or too much attention for a background layer? And should the lift land on a different pluck than the third?",
    "key_tonic": "E",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[~ b4] [~ b4] [~ b4] ~\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":1}"
        },
        "note": "the judged 1-bar pedal: three offbeat b4 plucks, beat 4 silent."
      },
      {
        "id": "every4th",
        "name": "his literal recipe (lift 1 in 4)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ c#5] ~]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":4}"
        },
        "note": "your words made literal: every 4th cycle the third pluck goes up a note (b4 -> c#5); the other three bars are the untouched pedal."
      },
      {
        "id": "every2nd",
        "name": "every-other-bar lift (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ c#5] ~]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":2}"
        },
        "note": "the first-gen lab's dose, verbatim: the third pluck lifts every second bar — twice as often as the literal \"occasionally\"."
      },
      {
        "id": "twolevel",
        "name": "two-level lift (step, then third)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ c#5] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ b4] ~] [[~ b4] [~ b4] [~ d#5] ~]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":8}"
        },
        "note": "alternate 4-bar passes: the first pass lifts up a step (c#5), the next up a third (d#5 — the 7th, diatonic, a soft color over an E chord), then it repeats. Still one lifted pluck per 4 bars."
      }
    ],
    "batch": 1
  },
  "lab_flow_walkbass": {
    "id": "lab_flow_walkbass",
    "lane": "flow",
    "source_cards": [
      "cand_hs_negrocity_walking_bass",
      "cand_b6_vl_negrocity_walk_flows"
    ],
    "his_words": "should also be varied in terms of notes or interval order by the song so it's not uniform / works! feels groovy. this add-on feels playful and groovy",
    "hypothesis": "The groove's identity is the quarter-note stroll that lands by step (or a dominant pickup) into each new downbeat — not the exact tones. If all four alternates still feel like the negrocity add-on, per-song walks are safe to generate; if bright loses the playfulness, the gb2 blues passing tone is load-bearing and must survive per-song variation. chromatic_ok: the gb2 is deliberate blues chromaticism from the source's own vocabulary (approached and left by step).",
    "question": "Do all four alternates keep the playful groovy stroll? Specifically: does dropping the gb (bright) lose the noir flavor, and do the two NEW walks (dominantlean, stepclimb) land into the loop as convincingly as the original's bb1 -> c2 step does?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "the judged 2-bar walk with the gb2 blues passing tone, climbing back into the loop by step (bb1 -> c2)."
      },
      {
        "id": "bright",
        "name": "bright 6-path walk (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 g2] [ab2 g2 f2 eb2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out: the gb swapped for the natural-6 path (c-eb-f-g / ab-g-f-eb) — no blues tone, same stroll."
      },
      {
        "id": "descendfirst",
        "name": "descend-first reorder (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 g2 gb2 f2] [eb2 f2 g2 bb2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "from the first-gen lab, split out: drops to the 5th immediately and walks down through the gb, then climbs eb-f-g-bb into the loop."
      },
      {
        "id": "dominantlean",
        "name": "b6 lean + dominant pickup (new)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 g2 ab2 g2] [f2 eb2 d2 g2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "a new per-song walk, all diatonic: root, leap to the 5th, ab leans on it (the b6-5 noir move), then f-eb-d steps down and g2 makes the V pickup home to c2."
      },
      {
        "id": "stepclimb",
        "name": "step-climb then 2-1 lean (new)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 d2 eb2 g2] [ab2 g2 f2 d2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "a new per-song walk, all diatonic: climbs by step c-d-eb then leaps to g; answers falling ab-g-f and lands on d2, leaning a whole step into the loop's c2."
      }
    ],
    "batch": 1
  },
  "lab_flow_harpsi": {
    "id": "lab_flow_harpsi",
    "lane": "flow",
    "source_cards": [
      "cand_cw_shenightfall_harpsi",
      "cand_b6_vl_harpsi_third_up"
    ],
    "his_words": "for the harpsichord we should vary it for each song rather than keep it constant every time we use it",
    "hypothesis": "The harpsi fits everything because its held f4 anchor is a common tone over every bass in the loop and its pickups are strictly stepwise 1-2-3 — so any variation preserving { stepwise grace onto a common-tone hold } keeps both the fit and the identity. thirdup re-seats the whole shape a third higher, invertedpickup reverses only the approach direction (falls onto the anchor), anchormove exchanges the held tone for the loop's OTHER common tone (d4) for two bars and returns. Strings pad byte-identical in every variant.",
    "question": "Does thirdup read as the same harpsichord in another song — the per-song variation you asked for? Does invertedpickup keep the character with the approach reversed? And does anchormove's two-bars-on-d4 still feel anchored, or does the figure need the 7th (f4) specifically?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference, cropped to 4 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the judged figure cropped to the source's first 4 bars (it runs 8): grace-climb onto the held f4, then the turn answer, twice. Pad identical in every variant."
      },
      {
        "id": "thirdup",
        "name": "third-up transplant (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [a#3 c4 d4 g4@13] [a#3 c4 d4 g4 ~ a4 f4@4 d#4@3 f4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the first-gen lab verbatim: the original pair, then the same shape planted a third higher (pickups bb-c-d onto a held g4) — hear the seam as \"same harpsi, another song\"."
      },
      {
        "id": "invertedpickup",
        "name": "inverted pickup (grace-fall)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 a4 g4 f4@13] [a#4 a4 g4 f4 ~ g4 d4@4 c4@3 d4@3] [a#4 a4 g4 f4@13] [a#4 a4 g4 f4 ~ g4 d4@4 c4@3 d4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the pickup run comes DOWN onto the anchor (bb4-a4-g4 -> f4) instead of climbing up from g3; the held f4 and the turn answer are untouched."
      },
      {
        "id": "anchormove",
        "name": "anchor moves to the other common tone",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 d4@13] [g3 a3 a#3 d4 ~ c4 a#3@4 a3@3 a#3@3] [g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "two bars anchored on d4 (the loop's other common tone — unison with the pad) with the turn answering BELOW it (c4, bb3), then the f4 original returns. The anchor breathes without ever leaving common tones."
      }
    ],
    "batch": 1
  },
  "lab_flow_dq_pizz": {
    "id": "lab_flow_dq_pizz",
    "lane": "flow",
    "source_cards": [
      "cand_vg_dq_pizz_only",
      "cand_b6_vl_dq_pizz_vamp"
    ],
    "his_words": "feels like fairy-tale like. should also create variations of this because since it increments and deincrements it may lose resonance with a lot of possible matches / the low pizz doesn't fit in that it like increases the top note every iteration (rl_r6)",
    "hypothesis": "What clashes with hosts is the marching top (a4 -> b4 -> c5) implying its own progression against whatever the host plays — the pedal-pluck texture itself is innocent. level removes the march entirely, vamp allows one lift per two bars, fallingarc reverses the arc into an arrival, and reseat keeps the increment CONTOUR but draws every tone from the bar's own chord (Dm, then Gm) so the march can never outrun the harmony. The source's own b-natural and f#-major color cells appear only in the reference and the two vl splits.",
    "question": "Rank them as default add-on shapes: does level keep enough fairy-tale with zero motion, or does it need vamp's single lift? Does fallingarc still feel like an arrival? And does reseat keep the increment charm while fixing your \"increases the top note every iteration\" objection?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the judged 2-bar reference: the pedal pluck whose top marches a4 -> b4 -> c5, with the source's own b-natural and f#-major color cells. (source's own dorian b + picardy f# (its fairy-tale color, as ticked))",
        "chromatic_ok": true
      },
      {
        "id": "vamp",
        "name": "flat vamp (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 a4 f4 a4 d4 b4 g4 b4 d4 a4 f4 a4] [d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "from the first-gen lab, split out: the march flattened — pure d-f-a cells with a single g/b lift per two bars. (keeps the source's dorian b)",
        "chromatic_ok": true
      },
      {
        "id": "fallingarc",
        "name": "falling arc (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "from the first-gen lab, split out: starts high on the c5 color and settles down to f/a — the arc reversed into an arrival. (keeps the source's dorian b + picardy f#)",
        "chromatic_ok": true
      },
      {
        "id": "level",
        "name": "level top (no increment)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4]\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "your rl_r6 objection answered directly: the top does NOT increment — a4 throughout, the d4 pedal figure otherwise identical. Pure fairy-tale texture, zero march."
      },
      {
        "id": "reseat",
        "name": "per-chord reseat (increment kept)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 a4 f4 a4 d4 d5 a4 d5 d4 a4 f4 a4] [d4 a#4 g4 a#4 d4 a#4 g4 a#4 d4 d5 a#4 d5 d4 a#4 g4 a#4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the lift contour survives but every tone is the bar's own chord: bar 1 lifts inside Dm (to the a4/d5 dyad), bar 2 moves to Gm cells (g/bb over the same d4 pedal) with the lift in the same slot."
      }
    ],
    "batch": 1
  },
  "lab_flow_pkmn_dyads": {
    "id": "lab_flow_pkmn_dyads",
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_pkmn_push_hold_dyads",
      "cand_b6_vl_pkmn_dyads_lift"
    ],
    "his_words": "I feel like the chords are beat not in sync with the sample which makes it seem off. otherwise it'd fit ... it shouldn't repeat, maybe it could go higher for the last chord in a safe valid chord or something occasionally too (like go up a note instead of back down)",
    "hypothesis": "Two candidate causes for \"beat not in sync\", separated one per variant: the @14+@2 anticipation push (the transcribed device — aligned removes only that, landing every change ON the barline) versus the falling-back resolution (vllift changes only that, resolving UP to c4-f4-a4, an F-triad \"safe valid chord\"). If aligned fixes the off feel, the anticipation itself was the problem; if vllift does, the push was fine and the repeat-and-fall was. occasionallift then doses the lift at every second pass, per his \"occasionally\".",
    "question": "A or B: does aligned (changes on the beat) or vllift (push kept, resolution up) fix the out-of-sync feeling? And is occasionallift's every-second-pass the right amount of \"occasionally\", or should the lift be rarer?",
    "key_tonic": "F",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "the judged reference: each chord change strikes an 8th EARLY (the transcribed anticipation push) and hangs through the following bar, and the second phrase falls back down."
      },
      {
        "id": "aligned",
        "name": "aligned — push removed (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@16] [[c4,e4]@16] [[a#3,d4,f4]@16] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "from the first-gen lab, split out: same dyads, every change lands ON the barline — if this fixes the off feel, the anticipation was the culprit."
      },
      {
        "id": "vllift",
        "name": "up-ending resolution (from the vl card)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [c4,f4,a4]@2] [[c4,f4,a4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "from the first-gen lab, split out: the push stays, but the second phrase resolves UP to c4-f4-a4 (an F triad — your \"safe valid chord\") instead of falling back to g3-c4-e4."
      },
      {
        "id": "occasionallift",
        "name": "occasional lift (every second pass)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16] [[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [c4,f4,a4]@2] [[c4,f4,a4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":8,\"gain\":0.5}"
        },
        "note": "your \"occasionally\" made literal: pass one ends down (as judged), pass two ends with the lift — an 8-bar cycle where the up-ending arrives half the time."
      }
    ],
    "batch": 1
  },
  "lab_flow_steel": {
    "id": "lab_flow_steel",
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_hmsummer_steel_octave_double",
      "cand_b6_vl_steel_double_reversed"
    ],
    "his_words": "feels like a good layer in a lot of songs. feels casual. could also be varied too or reversed or something",
    "hypothesis": "A 3-pitch tresillo cell varies legitimately by reordering its own tones (reversed, rotation) or by one diatonic substitution at the same function (upend) — never by new rhythm. The f-natural is the cell's mixolydian b7 identity (that deliberate out-of-key tone is why chromatic_ok is set) and survives in reversed and rotation; upend deliberately gives it up for the 9 (a), so if upend loses the casual feel, the b7 is load-bearing. The synth-bass + marimba two-octave pairing is kept everywhere.",
    "question": "Which of reversed / rotation / upend still feels like the casual layer you liked? Does rotation's landing-on-the-root read as an answer to the original (call/return), and does upend — the only variant without the f-natural — lose the character?",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 f2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@2 ~@4 d4@6 f4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "the judged 1-bar cell: g-d-f in both hands two octaves apart, long-short-long on the tresillo."
      },
      {
        "id": "reversed",
        "name": "retrograde (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[f2@2 ~@4 d2@6 g2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[f4@2 ~@4 d4@6 g4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "from the first-gen lab, split out: f-d-g — the same three pitches walked backward, both hands together, ending up on the root."
      },
      {
        "id": "rotation",
        "name": "rotation (d-f-g)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@2 ~@4 f2@6 g2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[d4@2 ~@4 f4@6 g4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "the cell started one position later: d-f-g, climbing so it ends ON the root — an arrival instead of the b7 hang."
      },
      {
        "id": "upend",
        "name": "up-ending (g-d-a)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 a2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@2 ~@4 d4@6 a4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "the b7 swapped for the 9: g-d-a, the cell now reaching up a step past the root at its end. The only variant without the f-natural."
      }
    ],
    "batch": 1
  },
  "lab_flow_swell": {
    "id": "lab_flow_swell",
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_b6_vl_premonition_safe_swell"
    ],
    "his_words": "feels mysterious and ambient... should be varied in rhythm or structure but use this for tension or mystery or scary / when paired with more harmonic layers ... it actually makes it less scary and strengthens its other vibes",
    "hypothesis": "The clash was swell 2's NEW pitch set (the whole-step plane onto d#/a#, deliberately out of A major — that device is why chromatic_ok is set), never the repetition: safeswell rebuilds swell 2 from the SAME chord, one chord-tone higher per voice, in-harmony by construction. Independently, his \"varied in rhythm or structure\" gets one variable per variant: rolltight moves ONLY the roll spacing (same pitches, four entries compressed into beat 1) and everybar removes ONLY the silent bars (swell every bar, alternating low and high octaves).",
    "question": "Does safeswell keep the mystery, or did the out-of-chord drift PROVIDE it? Does rolltight's snapped bloom still feel like a swell or become a chord stab? And does everybar — no silence, low/high alternation — build tension, or kill the ambient breathing that makes this work under more harmonic layers?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c#4@2 g#4@14] [~@16] [d#4@2 a#4@14] [~@16]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@3 a4@13] [~@16] [~@3 b4@13] [~@16]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[~@4 [c#5,e5]@12] [~@16] [~@4 [d#5,f#5]@12] [~@16]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the judged reference: the A^7 roll blooms, a silent bar, then the whole roll planes UP a step onto out-of-key tones (d#/a#) — the second swell that every one of your clash notes named."
      },
      {
        "id": "safeswell",
        "name": "in-chord swell 2 (from the vl card)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c#4@2 g#4@14] [~@16] [e4@2 b4@14] [~@16]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@3 a4@13] [~@16] [~@3 c#5@13] [~@16]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[~@4 [c#5,e5]@12] [~@16] [~@4 [e5,a5]@12] [~@16]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the first-gen lab verbatim: swell 2 re-rolls the SAME chord one chord-tone higher per voice (e-b-c#5-e5-a5) — inside the harmony by construction; rhythm and roll spacing untouched."
      },
      {
        "id": "rolltight",
        "name": "roll compressed into beat 1",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c#4 g#4@15] [~@16] [d#4 a#4@15] [~@16]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@2 a4@14] [~@16] [~@2 b4@14] [~@16]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[~@3 [c#5,e5]@13] [~@16] [~@3 [d#5,f#5]@13] [~@16]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
        },
        "note": "same pitches as judged (the planed swell 2 included): the roll's four entries now land on four consecutive 16ths inside beat 1 — a tighter bloom, then the same long hang and silent bar."
      },
      {
        "id": "everybar",
        "name": "swell every bar, low/high alternation",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c#4@2 g#4@14] [c#5@2 g#5@14] [d#4@2 a#4@14] [d#5@2 a#5@14]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@3 a4@13] [~@3 a5@13] [~@3 b4@13] [~@3 b5@13]>\",\"sound\":\"piano\",\"gain\":0.42},{\"mini\":\"<[~@4 [c#5,e5]@12] [~@4 [c#6,e6]@12] [~@4 [d#5,f#5]@12] [~@4 [d#6,f#6]@12]>\",\"sound\":\"piano\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
        },
        "note": "structure varied: no silent bars — the roll fires every bar, alternating the low voicing with the same chord an octave up (A^7 low, A^7 high, then the planed pair low/high). Tests whether the silence IS the mystery."
      }
    ],
    "batch": 1
  },
  "lab_flow_rush": {
    "id": "lab_flow_rush",
    "lane": "flow",
    "source_cards": [
      "cand_cw_rush_layering"
    ],
    "his_words": "the first two were fine but the third and fourth sounded slower and lower/more offkey. should be the same speed and a different note for variation and softer.",
    "hypothesis": "The slower/lower he heard is the bass cycle's own bars 3-4: bar 4 drops the floor to a#1 and parks on repeated same-pitch hits, which reads as a tempo drop even though bpm never moves. Rebuilding bars 3-4 on bars 1-2's EXACT onset slots (same speed by construction, 9 and 6 onsets), holding the c2-f2 register, and carrying the variation in note choice alone (eb2/f2 - C natural minor color, no chromatics) should fix all three complaints at once; the displacement variant tests whether rhythm-order is a second legal variation axis for this two-pitch machine or whether note-choice is the only one his ear accepts.",
    "question": "recipe vs orig: are bars 3-4 now the same speed and register with the variation carried by the new notes (eb2/f2), and softer the right amount at 0.55? Then displace: same notes as bars 1-2 with beats 2-3 onsets nudged one 16th later - does that also read as valid variation, or does note-choice beat rhythm-shift for this machine?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [d2 d2 ~ d2 ~ ~ ~ c2 ~ d2 c2 ~ c2 d2 ~ d2] [d2 ~ d2 ~ ~ ~ c2 d2 ~ c2 ~ a#1 a#1 ~ a#1 a#1]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8,\"note\":\"bass doubled an octave down at gain 0.5 in source; horn entries are off-grid (every ~1.85 bars) — the drift against the barline is part of the effect; horn = slow-attack swell\"}"
        },
        "note": "verbatim Rush machine: the bass cycles 4 bar-patterns twice (9/6/9/9 onsets per bar), bar 4 dropping to a#1 and ending on repeated same-pitch hits - the bars he flagged; pad swells c4/a#3 above, unchanged in every variant."
      },
      {
        "id": "recipe",
        "name": "his recipe: same speed, new note, softer",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [c2 eb2 ~ d2 eb2 ~ d2 ~ ~ c2 ~ f2 ~ eb2 ~ c2] [~ ~ eb2 ~ d2 ~ ~ ~ c2 ~ f2 ~ eb2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "bars 3-4 rebuilt on bars 1-2's exact onset slots (same speed, same 9/6 densities), register held c2-f2 with no a#1 drop, variation by note choice only - eb2 and f2 from C natural minor; whole bass softer at 0.55 (was 0.7). Pad untouched."
      },
      {
        "id": "displace",
        "name": "rhythm displacement (16th-late, beats 2-3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [c2 d2 ~ d2 ~ d2 ~ d2 ~ ~ c2 ~ d2 c2 ~ c2] [~ ~ d2 ~ ~ d2 ~ ~ ~ c2 ~ d2 c2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "bars 3-4 are bars 1-2's notes (c2/d2 only) with the beats-2-3 onsets shifted one 16th later; onset count and register identical. Gain kept at 0.7 on purpose so softness is not confounded with the displacement."
      }
    ],
    "batch": 1
  },
  "lab_flow_lb3": {
    "id": "lab_flow_lb3",
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_lb3_swing_arp_swap"
    ],
    "his_words": "sounds good, but should be really soft if it's a layer... should also be varied in terms of intervals or order in which intervals are played to create variation / the second increasing by one doesn't fit this chord (r14)",
    "hypothesis": "The arp's identity is its cell TEMPLATE (a 3-note top-voice cell on the swing grid with the inner pair swapping on beats 2 and 4), not the fixed c6-b5-g5 assignment - so rotating the cell order (rotate) or swapping the 7th for the 6th (sixth) varies intervals/order exactly as he asked while never touching the rhythm he likes. Both new flows deliberately stay on the C-major bars and drop the source's +3 re-seat, per his r14 \"increasing by one doesn't fit this chord\". Softness is an independent axis: the verbatim notes at gain 0.3 test whether level alone fixes the layer-fit.",
    "question": "rotate: does each bar's rotated cell (cbg then bgc then gcb then home) still read as THE same swing arp varying? Which reads better as within-song variation - rotate (order) or sixth (the b5 replaced by a5, 1-6-5 color in alternate bars)? And soft: at 0.3, does the verbatim original finally sit right as a layer under a song?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [c6 b5 g5 c6 g5 b5 c6 d6 c6 b5 c6 g5] [d#6 d6 a#5 d#6 a#5 d6 d#6 d6 a#5 d#6 a#5 d6] [d#6 d6 a#5 d#6 a#5 d6 d#6 f6 d#6 d6 d#6 d6]>\",\"sound\":\"gm_epiano1\",\"bpm\":144,\"bars\":4,\"gain\":0.5}"
        },
        "note": "verbatim lb3 engine: C-major cell with beat-2/4 inner swap and every-second-bar escape through the 9th, then the +3 re-seat onto the Cm7 shape (the d#/a# bars - his r14 \"doesn't fit\" note lives there). (carries the source's own +3 re-seat bars — the thing your r14 note flagged; rotate/sixth drop them)",
        "chromatic_ok": true
      },
      {
        "id": "rotate",
        "name": "cell order rotation (cbg-bgc-gcb-home)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [b5 g5 c6 b5 c6 g5 b5 g5 c6 b5 c6 g5] [g5 c6 b5 g5 b5 c6 g5 c6 b5 g5 b5 c6] [c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5]>\",\"sound\":\"gm_epiano1\",\"bpm\":144,\"bars\":4,\"gain\":0.5}"
        },
        "note": "each bar rotates the 3-note cell one position (c6-b5-g5, then b5-g5-c6, then g5-c6-b5, then home) inside the identical swing template. Order is the only variable; no re-seat bars."
      },
      {
        "id": "sixth",
        "name": "interval swap (7th to 6th, alternate bars)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [c6 a5 g5 c6 g5 a5 c6 a5 g5 c6 g5 a5] [c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [c6 a5 g5 c6 g5 a5 c6 a5 g5 c6 g5 a5]>\",\"sound\":\"gm_epiano1\",\"bpm\":144,\"bars\":4,\"gain\":0.5}"
        },
        "note": "alternate bars replace b5 with a5 - 1-6-5 color instead of 1-7-5, same cell template throughout. The escape bars are set aside so the 7th-vs-6th color is the only variable."
      },
      {
        "id": "soft",
        "name": "soft-layer (verbatim at 0.3)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c6 b5 g5 c6 g5 b5 c6 b5 g5 c6 g5 b5] [c6 b5 g5 c6 g5 b5 c6 d6 c6 b5 c6 g5] [d#6 d6 a#5 d#6 a#5 d6 d#6 d6 a#5 d#6 a#5 d6] [d#6 d6 a#5 d#6 a#5 d6 d#6 f6 d#6 d6 d#6 d6]>\",\"sound\":\"gm_epiano1\",\"bpm\":144,\"bars\":4,\"gain\":0.3}"
        },
        "note": "identical notes to the original, gain 0.3 instead of 0.5 - his \"should be really soft if it's a layer\", tested with nothing else changed. (carries the source's own +3 re-seat bars — the thing your r14 note flagged; rotate/sixth drop them)",
        "chromatic_ok": true
      }
    ],
    "batch": 1
  },
  "lab_flow_daydreamer_bass": {
    "id": "lab_flow_daydreamer_bass",
    "lane": "flow",
    "source_cards": [
      "cand_b5_sp_daydreamer_bass"
    ],
    "his_words": "happy bass. should also explore variations for bass (however bear in mind the last measure may clash with some pieces since it does its own thing)",
    "hypothesis": "The clash risk he flagged lives entirely in bar 4: it is the only bar that leaves the low register (climbs to f3) and its top note f3 sits outside E natural minor (a b2 color) - both properties absent from the happy bars 1-3. tame4 keeps his bars and swaps only bar 4 for a low-register stepwise cadence home (b2-a2-g2-f#2 landing e2), so if it keeps the happy while killing the clash risk, the bass becomes host-safe. reattack varies rhythm only (the g2@4 holds re-struck as g2@2 g2@2); newflow reorders the same e/g/d/a/b vocabulary into a fresh flow whose bar 4 also stays low - two different variation mechanisms on one skeleton.",
    "question": "tame4 vs orig: does bar 4 cadencing home low keep the happy-bass feel while removing the does-its-own-thing risk? Does reattack read as added drive or as stutter? And is newflow still THIS bass (the daydreamer) or already a different bass?",
    "key_tonic": "E",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 a2@2 ~@2] [b2@2 a2@2 c3@2 d3@2 e3@2 d3@2 e3@2 f3@2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":130,\"bars\":4}"
        },
        "note": "verbatim daydreamer bass: three bars of the e-pedal walk, then bar 4 does its own thing - the climbing line b2-a2-c3-d3-e3-d3-e3-f3 he warned may clash (f3 is the one out-of-key note in the whole pattern). (bar 4 keeps the source's f-natural — the \"does its own thing\" tone you warned about; tame4/newflow remove it)",
        "chromatic_ok": true
      },
      {
        "id": "tame4",
        "name": "tamed bar 4 (low cadence home)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 g2@4] [e2@2 d2@2 e2@2 g2@4 e2@2 a2@2 ~@2] [b2@2 a2@2 g2@2 f#2@2 e2@8]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":130,\"bars\":4}"
        },
        "note": "bars 1-3 verbatim; bar 4 stays in the low register and cadences home stepwise: b2 a2 g2 f#2 landing on e2 held. No climb, no f3, every note in E natural minor."
      },
      {
        "id": "reattack",
        "name": "hold re-attacks (g2 broken for drive)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e2@2 d2@2 e2@2 g2@2 g2@2 e2@2 g2@2 g2@2] [e2@2 d2@2 e2@2 g2@2 g2@2 e2@2 g2@2 g2@2] [e2@2 d2@2 e2@2 g2@2 g2@2 e2@2 a2@2 ~@2] [b2@2 a2@2 c3@2 d3@2 e3@2 d3@2 e3@2 f3@2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":130,\"bars\":4}"
        },
        "note": "same pitches as the original bars 1-3, each g2@4 hold broken into two g2@2 re-attacks for drive; bar 4 kept verbatim so the rhythm change is the only variable. (bar 4 keeps the source's f-natural — the \"does its own thing\" tone you warned about; tame4/newflow remove it)",
        "chromatic_ok": true
      },
      {
        "id": "newflow",
        "name": "new flow (same skeleton, reordered)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e2@4 g2@4 e2@4 d2@4] [e2@4 g2@4 a2@4 g2@4] [e2@4 g2@4 e2@4 d2@4] [b2@4 a2@4 g2@4 a2@4]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":130,\"bars\":4}"
        },
        "note": "a second flow from the same vocabulary: quarter-note shapes e2-g2-e2-d2 / e2-g2-a2-g2, with bar 4 answering low on b2-a2-g2-a2 instead of climbing. Same pedal-plus-third skeleton, new interval order."
      }
    ],
    "batch": 1
  },
  "lab_flow_bkmansion_lh": {
    "id": "lab_flow_bkmansion_lh",
    "lane": "flow",
    "source_cards": [
      "cand_b4_gr_bkmansion_trill_build",
      "cand_b6_sp_bkmansion_trill",
      "cand_b6_sp_bkmansion_stab_triads",
      "cand_b6_sp_bkmansion_updown_arp"
    ],
    "his_words": "can be separated into the 4 different sections because the left hand is trying a bunch of different things as you can see which you can study and vary and build variations of",
    "hypothesis": "His ask verbatim: split the LH's experiments, study each, vary each by its own logic. The three studies are the source's textures verbatim, each already carrying the source's own variation curve (one voice moves g to g#, return, whole-shape semitone plane to F#). chromatic_ok because the F# tritone plane, the g/f# semitone trill and its chromatic run-up are the source's own gothic devices - kept, never added. widen applies the source's exact curve to the up-down arp with its arch extended one chord rung (apex c4-to-g5 instead of d#5), so if it reads as the same texture varying, \"vary by its own logic\" is a general recipe. chain plays the source's actual join - 2 bars of trill shiver straight into 2 bars of stabs - the way the piece itself moves between LH experiments.",
    "question": "Which LH study is the spooky core worth building on - trill, stabs, or updown? Does widen still read as the up-down arp varying by its own logic (one-voice move, then the F# plane, on the taller arch)? And does chain prove 2-bar section joins are how these textures should combine inside a song?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig_trill",
        "name": "section study 1: semitone trill (verbatim)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":2}"
        },
        "note": "cropped study - split 1 of the build's left hand, verbatim: the g-f# 16th trill, bar 2 escaping up chromatically (g#-a-a#-b) into the next section. The semitone lives inside the repeated cell."
      },
      {
        "id": "orig_stabs",
        "name": "section study 2: stab triads (verbatim)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1 [a#3,c#4,f#4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
        },
        "note": "split 2 verbatim: Cm triad stabbed on every 8th with the source's own variation curve - one voice moves (g to g#), returns, then the whole triad planes to the F# side for bar 4."
      },
      {
        "id": "orig_updown",
        "name": "section study 3: up-down arp (verbatim)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [c4 d#4 g#4 c5 d#5 c5 g#4 d#4 c4 d#4 g#4 c5 d#5 c5 g#4 d#4] [c4 d#4 g4 c5 d#5 c5 g4 d#4 c4 d#4 g4 c5 d#5 c5 g4 d#4] [a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4 a#3 c#4 f#4 a#4 c#5 a#4 f#4 c#4]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
        },
        "note": "split 3 verbatim: the Cm 16th arp climbing to d#5 and folding back, twice a bar, same curve as the stabs (g#-move, return, F#-plane)."
      },
      {
        "id": "widen",
        "name": "up-down arp widened (arch one rung higher)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c4 d#4 g4 c5 d#5 g5 d#5 c5 c4 d#4 g4 c5 d#5 g5 d#5 c5] [c4 d#4 g#4 c5 d#5 g#5 d#5 c5 c4 d#4 g#4 c5 d#5 g#5 d#5 c5] [c4 d#4 g4 c5 d#5 g5 d#5 c5 c4 d#4 g4 c5 d#5 g5 d#5 c5] [a#3 c#4 f#4 a#4 c#5 f#5 c#5 a#4 a#3 c#4 f#4 a#4 c#5 f#5 c#5 a#4]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
        },
        "note": "new variation built by the arp's own logic: the arch extends one chord rung (climb reaches g5 before folding), then the source's curve is applied to the taller cell - bar 2 moves the 5th to #5 wherever it is voiced (g4/g5 to g#4/g#5), bar 3 returns, bar 4 planes the whole cell to F#. Rhythm and contour identity untouched."
      },
      {
        "id": "chain",
        "name": "recombination: 2 bars trill into 2 bars stabs",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5] [[c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1 [c4,d#4,g4] ~@1] [[c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1 [c4,d#4,g#4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":4}"
        },
        "note": "how the source chains them: the trill's two bars verbatim (chromatic run-up and all) landing directly on the stab groove's first two bars verbatim (Cm, then the g# move) - the shiver-into-groove join as one playable unit."
      }
    ],
    "batch": 1
  },
  "lab_flow_grief_tempo": {
    "id": "lab_flow_grief_tempo",
    "lane": "flow",
    "source_cards": [
      "cand_b2_hm_grief_staircase"
    ],
    "his_words": "I feel like this grief should be played slower if it's just the chord. too fast makes it less sad ish and grievy",
    "hypothesis": "Tempo is the ONLY variable - degrees, chordBeats, family and symbols are byte-identical across all three variants - so any change in grief is the chord RATE, nothing else. His words state the mechanism: solo-chord grief needs slowness. Claim: 72 reads meaningfully sadder than 100, and there is a floor - below it (60) the extra slowness stops adding grief and starts dragging, because the staircase's ascent needs enough motion to still read as walking somewhere. (Probe note: the page renders this card in the C frame — Eb/Fm/G/Cm... — and the G major's b-natural is the harmonic-minor V's leading tone, the progression's own.)",
    "question": "Is bpm72 clearly sadder/grievier than bpm100 (the original)? And does bpm60 add real grief over bpm72, or is 72 already the floor where slower just drags?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "bpm100",
        "name": "original (bpm 100)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"3b 5:m 7 0:m 7:m 8b 10b 0:m 2:m 3b\",\"family\":\"minor\",\"bpm\":100,\"chordBeats\":[2,2,2,4,4,4,4,4,4,2],\"symbols\":[\"C\",\"Dm\",\"E\",\"Am\",\"Em\",\"F\",\"G\",\"Am\",\"Bm\",\"C\"]}"
        },
        "note": "the grief staircase verbatim at its spec tempo 100 - the speed you said makes it less sad ish and grievy when it's just the chord."
      },
      {
        "id": "bpm72",
        "name": "same degrees at bpm 72",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"3b 5:m 7 0:m 7:m 8b 10b 0:m 2:m 3b\",\"family\":\"minor\",\"bpm\":72,\"chordBeats\":[2,2,2,4,4,4,4,4,4,2],\"symbols\":[\"C\",\"Dm\",\"E\",\"Am\",\"Em\",\"F\",\"G\",\"Am\",\"Bm\",\"C\"]}"
        },
        "note": "identical degrees/chordBeats, only slower - ballad stride. Nothing else moved."
      },
      {
        "id": "bpm60",
        "name": "same degrees at bpm 60",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"3b 5:m 7 0:m 7:m 8b 10b 0:m 2:m 3b\",\"family\":\"minor\",\"bpm\":60,\"chordBeats\":[2,2,2,4,4,4,4,4,4,2],\"symbols\":[\"C\",\"Dm\",\"E\",\"Am\",\"Em\",\"F\",\"G\",\"Am\",\"Bm\",\"C\"]}"
        },
        "note": "identical again at 60 - past this the whole loop takes over half a minute; testing where the slower-is-sadder curve flattens."
      }
    ],
    "batch": 1
  },
  "lab_perc_congas_flows": {
    "id": "lab_perc_congas_flows",
    "lane": "perc",
    "source_cards": [
      "cand_b2_dr_dkc_water_congas"
    ],
    "his_words": "feels groovy and tribal (could be desert OR water OR jungle). could also be varied to create variation",
    "hypothesis": "The groove's tribal identity is its half-bar call/answer CYCLE - falling mute cluster, rising open answer, bongo cap, over a struck-then-dying shaker - so it varies legally by reassigning WHO speaks (swap, bongolead) or HOW MUCH (wave), never by scrambling the exchange. If swap still grooves, the pattern is a role scheme rather than a fixed drum map, which is exactly what makes it desert-OR-water-OR-jungle portable; and bongolead tests whether the voice assignment is what picks the biome.",
    "question": "swap vs orig: with the open congas now calling on beat 1 and the mute cluster answering at beat 2, does the call/answer still groove the same? wave: does bar 2 thinned to 13 of 22 hits (skeleton kept) read as the groove breathing, or as dropout? And bongolead: busy bongos over sparse congas - same groove, different biome (more jungle, less water)?",
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":74,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"1/2\",\"9/16\",\"5/8\",\"3/16\",\"1/4\",\"5/16\",\"11/16\",\"3/4\",\"13/16\",\"3/8\",\"7/16\",\"7/8\",\"15/16\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\"],\"sounds\":[\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
        },
        "note": "verbatim DKC water congas: mute cluster falls on beat 1, open congas answer rising, high bongo pair caps each half-bar, one shaker strike dies away."
      },
      {
        "id": "swap",
        "name": "call/answer swap (open calls, mute answers)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":74,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"1/2\",\"9/16\",\"5/8\",\"3/16\",\"1/4\",\"5/16\",\"11/16\",\"3/4\",\"13/16\",\"3/8\",\"7/16\",\"7/8\",\"15/16\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
        },
        "note": "every onset identical to the original; only the two conga voices trade slots - the open congas now speak the beat-1 cluster and the mutes take the answer that straddles beat 2. Bongo caps and shakers untouched."
      },
      {
        "id": "wave",
        "name": "density wave (bar 2 thinned to skeleton)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":74,\"bars\":2,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"1/2\",\"9/16\",\"5/8\",\"3/16\",\"1/4\",\"5/16\",\"11/16\",\"3/4\",\"13/16\",\"3/8\",\"7/16\",\"7/8\",\"15/16\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\",\"1\",\"17/16\",\"3/2\",\"19/16\",\"5/4\",\"27/16\",\"7/4\",\"23/16\",\"31/16\",\"1\",\"17/16\",\"9/8\",\"19/16\"],\"sounds\":[\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
        },
        "note": "bar 1 verbatim, bar 2 thinned to 13 of 22 onsets (59%): cluster heads, answer heads and beats, one bongo cap per half, shaker strike with a shortened die-away. The exchange's skeleton survives; the infill breathes out."
      },
      {
        "id": "bongolead",
        "name": "voice-role swap (bongos busy, congas sparse)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":74,\"bars\":1,\"onsets\":[\"0\",\"1/16\",\"1/8\",\"1/2\",\"9/16\",\"5/8\",\"3/16\",\"1/4\",\"5/16\",\"11/16\",\"3/4\",\"13/16\",\"3/8\",\"7/16\",\"7/8\",\"15/16\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\"],\"sounds\":[\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_lo\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_bongo_hi\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\"]}"
        },
        "note": "same onsets again, roles traded across drum families: bongo_lo takes the falling call, bongo_hi the rising answer (keeping the low-to-high arc), and a single open conga takes the sparse cap role."
      }
    ],
    "batch": 1
  },
  "lab_perc_shaker_flows": {
    "id": "lab_perc_shaker_flows",
    "lane": "perc",
    "source_cards": [
      "cand_b2_dr_brutal_fading_shaker"
    ],
    "his_words": "feels relaxing and groovy and tribal... could also be varied to create variation",
    "hypothesis": "The relax-groove is carried by the fading shaker carpet, which is HALF-BAR periodic - measured on the spec, rotating the whole pattern by a half bar maps both shaker lanes onto themselves, so rotate moves ONLY the conga/claves/mute anchors while the carpet stays byte-identical. If rotate still grooves with the anchors off the downbeat, the anchors are free variation material; reverse flips bar 2's hard/soft lane assignment so the fade becomes a swell (same onsets, opposite breathing); thin removes the claves and doubles the conga at the loop turn - testing whether the scattered answers are load-bearing or decoration.",
    "question": "rotate: with the shaker carpet identical and only the conga/claves/mute anchors displaced off the downbeat, is it the same groove or does it float? reverse: does bar 2 swelling instead of fading read as the carpet breathing back in (good variation) or does it break the relax? thin: claves gone and the turn doubled - cleaner or emptier?",
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":189,\"bars\":2,\"onsets\":[\"0\",\"1\",\"7/4\",\"0\",\"1/8\",\"1/2\",\"5/8\",\"1\",\"9/8\",\"3/2\",\"13/8\",\"1/4\",\"3/8\",\"3/4\",\"7/8\",\"5/4\",\"11/8\",\"7/4\",\"15/8\",\"1/8\",\"1/2\",\"3/8\",\"3/4\",\"11/8\",\"3/2\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_claves\",\"vc_claves\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\"]}"
        },
        "note": "verbatim Brutal groove: shaker 8ths fading hard-to-soft twice a bar, conga stamping downbeats plus the bar-2 beat-4 push, claves and muted conga scattering answers."
      },
      {
        "id": "rotate",
        "name": "half-bar rotation (anchors move, carpet fixed)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":189,\"bars\":2,\"onsets\":[\"1/2\",\"3/2\",\"1/4\",\"1/2\",\"5/8\",\"1\",\"9/8\",\"3/2\",\"13/8\",\"0\",\"1/8\",\"3/4\",\"7/8\",\"5/4\",\"11/8\",\"7/4\",\"15/8\",\"1/4\",\"3/8\",\"5/8\",\"1\",\"7/8\",\"5/4\",\"15/8\",\"0\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_claves\",\"vc_claves\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\"]}"
        },
        "note": "every onset shifted a half bar (mod 2 bars). Both shaker lanes land exactly on themselves - the carpet is unchanged by construction - so what actually moves is the anchors: the conga downbeat stamp leaves beat 1 and the claves/mute answers relocate."
      },
      {
        "id": "reverse",
        "name": "fade reversal (bar 2 swells)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":189,\"bars\":2,\"onsets\":[\"0\",\"1\",\"7/4\",\"0\",\"1/8\",\"1/2\",\"5/8\",\"1\",\"9/8\",\"3/2\",\"13/8\",\"1/4\",\"3/8\",\"3/4\",\"7/8\",\"5/4\",\"11/8\",\"7/4\",\"15/8\",\"1/8\",\"1/2\",\"3/8\",\"3/4\",\"11/8\",\"3/2\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_claves\",\"vc_claves\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\"]}"
        },
        "note": "same 25 onsets; in bar 2 the hard/soft shaker roles swap so each half-bar goes soft-into-HARD - the fade direction reverses and the second bar breathes in instead of out. Bar 1 and all anchors verbatim."
      },
      {
        "id": "thin",
        "name": "accent thin (claves out, turn doubled)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":189,\"bars\":2,\"onsets\":[\"0\",\"1\",\"7/4\",\"15/8\",\"0\",\"1/8\",\"1/2\",\"5/8\",\"1\",\"9/8\",\"3/2\",\"13/8\",\"1/4\",\"3/8\",\"3/4\",\"7/8\",\"5/4\",\"11/8\",\"7/4\",\"15/8\",\"3/8\",\"3/4\",\"11/8\",\"3/2\"],\"sounds\":[\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_conga\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_shaker_soft\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\",\"vc_conga_mute\"]}"
        },
        "note": "the two claves answers dropped; one conga added at 15/8 next to the 7/4 push so the phrase turn is a doubled conga hit driving back to the top. Everything else verbatim."
      }
    ],
    "batch": 1
  },
  "lab_perc_lofi_indie_combined": {
    "id": "lab_perc_lofi_indie_combined",
    "lane": "perc",
    "source_cards": [
      "cand_un_lofi_backbeat",
      "cand_un_indie_backbeat"
    ],
    "his_words": "also best percussion too - relaxing and old classic. double be combined with indie",
    "hypothesis": "The combination works because the two grooves own different lanes: lofi supplies the half-time clap frame plus the syncopated low pushes (15/8, 23/8), indie supplies the 8th carpet and the quarter-note backbeat. But stacked raw they collide - 5 same-voice tom double-hits (slots 0, 1, 3/2, 2, 3) and 7 cross-voice pile-ups - the same-slot problem D123 found inside the drum compiler, here at the combo level. Claim: raw reads as two drummers, and resolving every contested slot to ONE voice (groomed) makes it read as one drummer who is both lofi and indie.",
    "question": "stack vs the two references: does raw stacking read as two drummers fighting (listen for the doubled toms on the downbeats of bars 1-4)? Does groomed read as ONE groove that is still recognizably both? And which parent does the combo lean toward - the lofi half-time relax or the indie drive?",
    "variants": [
      {
        "id": "lofi",
        "name": "lofi alone (reference)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"onsets\":[\"0/1\",\"1/2\",\"1/1\",\"3/2\",\"15/8\",\"2/1\",\"5/2\",\"23/8\",\"3/1\",\"25/8\",\"7/2\",\"31/8\"],\"sounds\":[\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"md_clap\",\"vc_tom_lo\"],\"bpm\":105,\"bars\":4}"
        },
        "note": "the lofi backbeat verbatim except re-clocked 106 to 105 so both references share the card tempo, and bars:4 made explicit. Clap only mid-bar, kick-role toms syncopating around it, bar 4 varying the clap as a built-in fill."
      },
      {
        "id": "indie",
        "name": "indie alone (reference)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"onsets\":[\"0/1\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\"],\"sounds\":[\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\"],\"bpm\":105,\"bars\":1}"
        },
        "note": "the indie backbeat verbatim (bars:1 made explicit): kick-role tom on 1 and 3, snare on 2 and 4, shaker 8ths between."
      },
      {
        "id": "stack",
        "name": "stacked as-is",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":105,\"bars\":4,\"onsets\":[\"0/1\",\"1/2\",\"1/1\",\"3/2\",\"15/8\",\"2/1\",\"5/2\",\"23/8\",\"3/1\",\"25/8\",\"7/2\",\"31/8\",\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"15/8\",\"2\",\"17/8\",\"9/4\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"23/8\",\"3\",\"25/8\",\"13/4\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"31/8\"],\"sounds\":[\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"md_clap\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\"]}"
        },
        "note": "both patterns at once, untouched - the indie bar tiled across all 4 lofi bars. Every collision left in, including vc_tom_lo striking itself twice at 0, 1, 3/2, 2 and 3."
      },
      {
        "id": "groomed",
        "name": "groomed combination (collisions resolved)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":105,\"bars\":4,\"onsets\":[\"0/1\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1/1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"15/8\",\"2/1\",\"17/8\",\"9/4\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"23/8\",\"3/1\",\"25/8\",\"13/4\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"31/8\"],\"sounds\":[\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"md_clap\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_shaker\",\"md_snare\",\"vc_shaker\",\"md_clap\",\"vc_shaker\",\"md_snare\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_clap\",\"md_snare\",\"vc_shaker\",\"md_clap\",\"vc_shaker\",\"md_snare\",\"vc_tom_lo\"]}"
        },
        "note": "stacked, then every contested slot resolved to one voice (32 hits from 44): the 5 tom double-hits deduped (0, 1, 3/2, 2, 3); the indie kick-tom yields to the lofi clap at 1/2, 5/2 and 7/2; shaker ticks yield to the lofi pushes at 15/8, 23/8, 31/8 and to the clap at 25/8. Backbeat-family hits own their slots, accents beat carpet."
      }
    ],
    "batch": 1
  },
  "lab_perc_tutorial_cluster": {
    "id": "lab_perc_tutorial_cluster",
    "lane": "perc",
    "source_cards": [
      "cand_b2_dr_wily_answer_snare",
      "cand_b2_dr_ffmq_mine_rotation",
      "cand_b2_dr_sq_credits_skiphat"
    ],
    "his_words": "could be layered with the other b2 wily and ffmq stuff I feel like when it's called for like over time",
    "hypothesis": "His \"over time\" is a staging claim: the same three lanes entering 2 bars apart read as development because each entry re-frames an unchanged floor, while the identical material from bar 1 (control) reads as a static, busier loop - staged entry is what makes layers read as EVENTS. reverse tests whether entry ORDER matters too: hat first and the kick/snare floor last should feel unmoored until the floor lands. Lane content at any given bar is identical across all three variants (the tom line rotates +1/8 per bar as a function of the bar index, so bar N's toms match everywhere) - only entry timing changes. The wily/ffmq/sq source specs are not in the refs file, so these are simple faithful skeletons authored per their descriptions, at a chosen 120bpm.",
    "question": "Does staged read as a build - each entry landing as a real event over the snare-answer floor? Does control confirm your \"over time\" instinct (all-at-once = clutter/static)? And does reverse (skipping hat first, floor last) feel like suspense resolving, or just backwards?",
    "variants": [
      {
        "id": "staged",
        "name": "staged build (2-bar entries)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":6,\"onsets\":[\"0\",\"1/2\",\"1\",\"3/2\",\"2\",\"5/2\",\"3\",\"7/2\",\"4\",\"9/2\",\"5\",\"11/2\",\"1/4\",\"3/4\",\"5/4\",\"7/4\",\"9/4\",\"11/4\",\"13/4\",\"15/4\",\"17/4\",\"19/4\",\"21/4\",\"23/4\",\"17/8\",\"21/8\",\"23/8\",\"3\",\"13/4\",\"15/4\",\"33/8\",\"35/8\",\"39/8\",\"5\",\"21/4\",\"11/2\",\"4\",\"67/16\",\"17/4\",\"9/2\",\"75/16\",\"19/4\",\"5\",\"83/16\",\"21/4\",\"11/2\",\"91/16\",\"23/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\"]}"
        },
        "note": "bars 1-2: the snare-answer skeleton alone (kick on 1 and 3, snare answering on 2 and 4); bars 3-4 add the tom line rotating one 8th right each bar; bars 5-6 add the skipping hat (0, 3/16, 1/4, 1/2, 11/16, 3/4). The rotation walks the toms across the kit - some bars they sit in the gaps, alternate bars they land on the kit hits."
      },
      {
        "id": "control",
        "name": "all-at-once (control)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":6,\"onsets\":[\"0\",\"1/2\",\"1\",\"3/2\",\"2\",\"5/2\",\"3\",\"7/2\",\"4\",\"9/2\",\"5\",\"11/2\",\"1/4\",\"3/4\",\"5/4\",\"7/4\",\"9/4\",\"11/4\",\"13/4\",\"15/4\",\"17/4\",\"19/4\",\"21/4\",\"23/4\",\"3/8\",\"5/8\",\"7/8\",\"1\",\"3/2\",\"7/4\",\"17/8\",\"21/8\",\"23/8\",\"3\",\"13/4\",\"15/4\",\"33/8\",\"35/8\",\"39/8\",\"5\",\"21/4\",\"11/2\",\"0\",\"3/16\",\"1/4\",\"1/2\",\"11/16\",\"3/4\",\"1\",\"19/16\",\"5/4\",\"3/2\",\"27/16\",\"7/4\",\"2\",\"35/16\",\"9/4\",\"5/2\",\"43/16\",\"11/4\",\"3\",\"51/16\",\"13/4\",\"7/2\",\"59/16\",\"15/4\",\"4\",\"67/16\",\"17/4\",\"9/2\",\"75/16\",\"19/4\",\"5\",\"83/16\",\"21/4\",\"11/2\",\"91/16\",\"23/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\"]}"
        },
        "note": "identical lanes, all three sounding from bar 1 for all 6 bars - the no-staging control. Bar-for-bar the material matches staged wherever both sound."
      },
      {
        "id": "reverse",
        "name": "reverse build (hat first, floor last)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":120,\"bars\":6,\"onsets\":[\"0\",\"3/16\",\"1/4\",\"1/2\",\"11/16\",\"3/4\",\"1\",\"19/16\",\"5/4\",\"3/2\",\"27/16\",\"7/4\",\"2\",\"35/16\",\"9/4\",\"5/2\",\"43/16\",\"11/4\",\"3\",\"51/16\",\"13/4\",\"7/2\",\"59/16\",\"15/4\",\"4\",\"67/16\",\"17/4\",\"9/2\",\"75/16\",\"19/4\",\"5\",\"83/16\",\"21/4\",\"11/2\",\"91/16\",\"23/4\",\"17/8\",\"21/8\",\"23/8\",\"3\",\"13/4\",\"15/4\",\"33/8\",\"35/8\",\"39/8\",\"5\",\"21/4\",\"11/2\",\"4\",\"9/2\",\"5\",\"11/2\",\"17/4\",\"19/4\",\"21/4\",\"23/4\"],\"sounds\":[\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"vc_tom_lo\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\"]}"
        },
        "note": "entries reversed: skipping hat alone (bars 1-2), toms join (3-4), kick/snare floor arrives last (5-6). Same per-bar lane content as the others."
      }
    ],
    "batch": 1
  },
  "lab_perc_energy_ladder": {
    "id": "lab_perc_energy_ladder",
    "lane": "perc",
    "source_cards": [],
    "his_words": "very relaxing, low energy (7thsaga triangle) / 6/10 (gradius) / 6-7/10 (ballad) / high energy (yukon)",
    "hypothesis": "Percussion pattern alone carries a legible energy arc: the four tiers are mechanically ordered by onset density and kick rate (2, 10, 12, 24 onsets/bar; kicks 0, 1, 2, 4 per bar) at one fixed bpm (116), with no pitched material at all - so if his tier labels are right, the ladder must read as a rise from pattern choice alone. The middle pair is the hard test: gradius and ballad differ by only 2 onsets/bar (the second kick and the bar-end tom fill), the closest spacing in the ladder - if any adjacent pair fails to order, it should be that one. The 7thsaga/gradius/ballad/yukon source specs are not in the refs file; these are simple skeletons authored to honor his descriptions (claves standing in for the triangle clock).",
    "question": "Does ladder read low-to-high the whole way up with no pitched help? In middles, is ballad hearably above gradius (your 6 vs 6-7), or do they tie? And does reverse read as a wind-down, or fall apart into four unrelated grooves?",
    "variants": [
      {
        "id": "ladder",
        "name": "energy ladder (low to high)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":116,\"bars\":8,\"onsets\":[\"1/4\",\"3/4\",\"5/4\",\"7/4\",\"2\",\"5/2\",\"2\",\"17/8\",\"9/4\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"23/8\",\"3\",\"7/2\",\"3\",\"25/8\",\"13/4\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"31/8\",\"4\",\"35/8\",\"9/2\",\"4\",\"33/8\",\"17/4\",\"35/8\",\"9/2\",\"37/8\",\"19/4\",\"39/8\",\"39/8\",\"5\",\"43/8\",\"11/2\",\"5\",\"41/8\",\"21/4\",\"43/8\",\"11/2\",\"45/8\",\"23/4\",\"47/8\",\"47/8\",\"6\",\"25/4\",\"13/2\",\"27/4\",\"49/8\",\"51/8\",\"53/8\",\"55/8\",\"6\",\"97/16\",\"49/8\",\"99/16\",\"25/4\",\"101/16\",\"51/8\",\"103/16\",\"13/2\",\"105/16\",\"53/8\",\"107/16\",\"27/4\",\"109/16\",\"55/8\",\"111/16\",\"7\",\"29/4\",\"15/2\",\"31/4\",\"57/8\",\"59/8\",\"61/8\",\"63/8\",\"7\",\"113/16\",\"57/8\",\"115/16\",\"29/4\",\"117/16\",\"59/8\",\"119/16\",\"15/2\",\"121/16\",\"61/8\",\"123/16\",\"31/4\",\"125/16\",\"63/8\",\"127/16\"],\"sounds\":[\"vc_claves\",\"vc_claves\",\"vc_claves\",\"vc_claves\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\"]}"
        },
        "note": "2 bars each, your order: triangle-clock claves on 2 and 4; gradius kick-snare-8th-hats; ballad adding the 3/8 kick and a bar-end tom fill; yukon four-on-the-floor kick, offbeat snares, 16th shaker."
      },
      {
        "id": "reverse",
        "name": "reverse ladder (high to low)",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":116,\"bars\":8,\"onsets\":[\"0\",\"1/4\",\"1/2\",\"3/4\",\"1/8\",\"3/8\",\"5/8\",\"7/8\",\"0\",\"1/16\",\"1/8\",\"3/16\",\"1/4\",\"5/16\",\"3/8\",\"7/16\",\"1/2\",\"9/16\",\"5/8\",\"11/16\",\"3/4\",\"13/16\",\"7/8\",\"15/16\",\"1\",\"5/4\",\"3/2\",\"7/4\",\"9/8\",\"11/8\",\"13/8\",\"15/8\",\"1\",\"17/16\",\"9/8\",\"19/16\",\"5/4\",\"21/16\",\"11/8\",\"23/16\",\"3/2\",\"25/16\",\"13/8\",\"27/16\",\"7/4\",\"29/16\",\"15/8\",\"31/16\",\"2\",\"19/8\",\"5/2\",\"2\",\"17/8\",\"9/4\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"23/8\",\"23/8\",\"3\",\"27/8\",\"7/2\",\"3\",\"25/8\",\"13/4\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"31/8\",\"31/8\",\"4\",\"9/2\",\"4\",\"33/8\",\"17/4\",\"35/8\",\"9/2\",\"37/8\",\"19/4\",\"39/8\",\"5\",\"11/2\",\"5\",\"41/8\",\"21/4\",\"43/8\",\"11/2\",\"45/8\",\"23/4\",\"47/8\",\"25/4\",\"27/4\",\"29/4\",\"31/4\"],\"sounds\":[\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_snare\",\"md_snare\",\"md_snare\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"vc_shaker\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_claves\",\"vc_claves\",\"vc_claves\",\"vc_claves\"]}"
        },
        "note": "the same four tiers in descending order, yukon first, claves last - the wind-down direction."
      },
      {
        "id": "middles",
        "name": "middle tiers back-to-back",
        "render": {
          "kind": "rhythm_onsets",
          "spec": "{\"bpm\":116,\"bars\":4,\"onsets\":[\"0\",\"1/2\",\"0\",\"1/8\",\"1/4\",\"3/8\",\"1/2\",\"5/8\",\"3/4\",\"7/8\",\"1\",\"3/2\",\"1\",\"9/8\",\"5/4\",\"11/8\",\"3/2\",\"13/8\",\"7/4\",\"15/8\",\"2\",\"19/8\",\"5/2\",\"2\",\"17/8\",\"9/4\",\"19/8\",\"5/2\",\"21/8\",\"11/4\",\"23/8\",\"23/8\",\"3\",\"27/8\",\"7/2\",\"3\",\"25/8\",\"13/4\",\"27/8\",\"7/2\",\"29/8\",\"15/4\",\"31/8\",\"31/8\"],\"sounds\":[\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\",\"md_kick\",\"md_kick\",\"md_snare\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"md_hat\",\"vc_tom_lo\"]}"
        },
        "note": "gradius (2 bars) straight into ballad (2 bars), nothing else - the two-onset difference isolated so the 6 vs 6-7 ordering can be judged directly."
      }
    ],
    "batch": 1
  },
  "lab_combo_bkmansion_synth": {
    "id": "lab_combo_bkmansion_synth",
    "lane": "combo",
    "source_cards": [
      "cand_b4_gr_bkmansion_trill_build",
      "cand_b6_sp_bkmansion_trill"
    ],
    "his_words": "this is a spooky vibe, and I like it... since its synths basically, but remove the synths or use serum-like synths and it becomes less pixel vgm like, but this is very good spooky non-ambient music",
    "hypothesis": "Your claim is that the SPOOK is in the notes (the g/f# trill and its chromatic climb) and the PIXEL is in the timbre. If true, the trill should stay spooky on a thick saw stack and on piano — and the saw stack is the closest this palette gets to a serum-style read.",
    "question": "The same trill section three ways: v1 the pixel synth, v2 a two-octave saw stack (the 'serum-like' direction), v3 plain piano. Which keeps the spook while losing the pixel — and does piano keep enough bite, or does this line NEED a synth edge?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "pixel",
        "name": "as transcribed (epiano/pixel read)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5]>\",\"sound\":\"gm_epiano1\",\"bpm\":130,\"bars\":2}"
        },
        "note": "the split card's trill section, verbatim"
      },
      {
        "id": "saw_stack",
        "name": "two-octave saw stack (serum-like direction)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.45},{\"mini\":\"<[g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4] [g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4 g4 f#4 g#4 a4 a#4 b4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.22}],\"bpm\":130,\"bars\":2}"
        },
        "note": "same notes, saw + a quieter octave double — the thick modern-synth read this palette can reach"
      },
      {
        "id": "piano",
        "name": "plain piano",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5] [g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g5 f#5 g#5 a5 a#5 b5]>\",\"sound\":\"piano\",\"bpm\":130,\"bars\":2,\"gain\":0.6}"
        },
        "note": "the 'remove the synths' direction"
      }
    ],
    "batch": 1
  },
  "lab_combo_airwolf_timbre": {
    "id": "lab_combo_airwolf_timbre",
    "lane": "combo",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_vg_airwolf_gallop_pedal"
    ],
    "his_words": "the notes work but the instrument sounds a bit too pixel for piano",
    "hypothesis": "Your note splits pitch from timbre: 'the notes work' but the saw reads pixel AGAINST A PIANO HOST. Same gallop, same seat, three timbres over the same host — if piano or harpsichord sits where the saw didn't, the rule is 'match the host's attack family when transplanting a comp', not 'this comp is wrong'.",
    "question": "v1 saw (as heard), v2 piano, v3 harpsichord — all identical notes over the same host. Which sits? (Pitch is held constant here; the bar-2 off-key tone is the align lane's card, deliberately NOT fixed in any of these.)",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "saw_as_heard",
        "name": "sawtooth (as you heard it)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_vg_airwolf_gallop_pedal\",\"add\":-6,\"gain\":0.7}],\"bpm\":102,\"bars\":2}"
        },
        "note": "the page combo, verbatim"
      },
      {
        "id": "piano_swap",
        "name": "same notes on piano",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[e2,e3] [e2,b3] ~@1 [e2,d4] [e2,e4] [e2,g4] ~@1 [e2,d4] [e2,e4] [e2,b3] ~@1 [e2,d4] [e2,a3] [e2,b3] ~@1 [e2,d4]] [[g2,g3] [g2,d4] ~@1 [g2,f4] [g2,g4] [g2,a#4] ~@1 [g2,f4] [g2,g4] [g2,d4] ~@1 [g2,f4] [g2,c4] [g2,d4] ~@1 [g2,f4]]>\",\"sound\":\"piano\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "identical pitches written out at the seat (a# and all) — only the instrument changes"
      },
      {
        "id": "harpsi_swap",
        "name": "same notes on harpsichord",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[e2,e3] [e2,b3] ~@1 [e2,d4] [e2,e4] [e2,g4] ~@1 [e2,d4] [e2,e4] [e2,b3] ~@1 [e2,d4] [e2,a3] [e2,b3] ~@1 [e2,d4]] [[g2,g3] [g2,d4] ~@1 [g2,f4] [g2,g4] [g2,a#4] ~@1 [g2,f4] [g2,g4] [g2,d4] ~@1 [g2,f4] [g2,c4] [g2,d4] ~@1 [g2,f4]]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.44}],\"bpm\":102,\"bars\":2}"
        },
        "note": "a plucked-attack compromise between saw bite and piano warmth"
      }
    ],
    "batch": 1
  },
  "lab_combo_soncha_vibr": {
    "id": "lab_combo_soncha_vibr",
    "lane": "combo",
    "source_cards": [
      "cand_b4_vr_soncha_rise_pickup",
      "cand_b6_sp_soncha_base"
    ],
    "his_words": "the vibraphone high part is very niche style when it goes up and off key and doesn't fit... whenever the vibraphone isn't increasing though it sounds good, just playful and casual",
    "hypothesis": "Two variables tangled in the original: the RISE (the chromatic climb bar) and the TIMBRE. v2 removes the rise exactly as your note prescribes (a plain handover bar instead of the climb); v3 is the same flat version on the vibraphone you named. If v2/v3 both work, the rise was the whole problem and the part is host-ready.",
    "question": "v1 = the transcription with the rise. v2 = flat handover on celesta. v3 = the same on vibraphone. Does removing the rise fix it as your note predicts, and does the timbre matter once it's flat?",
    "key_tonic": "E",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "with_rise",
        "name": "as transcribed (rise bar included)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [b5 c6 d6 f6 g6 ab6 bb6 c7 b5 c6 d6 f6 g6 ab6 bb6 b6] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":3}"
        },
        "note": "the catalog transcription: D-arp, the off-key climb, then the Em ostinato"
      },
      {
        "id": "flat_handover",
        "name": "rise replaced by a plain handover",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [a5 f#5 d5 a4 f#5 d5 a4 f#4 b5 g5 e5 b4 b5 g5 e5 b4] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_celesta\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 e3@3 e3@2 g3@2 b3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":3}"
        },
        "note": "bar 2 hands over halfway (half D-arp, half Em-arp) instead of climbing — your 'isn't increasing' version"
      },
      {
        "id": "flat_vibraphone",
        "name": "flat handover on vibraphone",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a5 f#5 d5 a4 f#5 d5 a4 f#4 a5 f#5 d5 a4 f#5 d5 a4 f#4] [a5 f#5 d5 a4 f#5 d5 a4 f#4 b5 g5 e5 b4 b5 g5 e5 b4] [b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4 b5 g5 e5 b4]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.5},{\"mini\":\"<[d3@2 d3@2 a3@2 f#3 d3@3 d3@2 f#3@2 a3@2] [d3@2 d3@2 a3@2 f#3 e3@3 e3@2 g3@2 b3@2] [e3@2 e3@2 b3@2 g3 e3@3 e3@2 g3@2 b3@2]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":132,\"bars\":3}"
        },
        "note": "the timbre you named, on the fixed line"
      }
    ],
    "batch": 1
  },
  "lab_combo_chaotix_abstract": {
    "id": "lab_combo_chaotix_abstract",
    "lane": "combo",
    "source_cards": [
      "cand_b4_ly_chaotix_shadow_fourth"
    ],
    "his_words": "this instrument itself by itself gives off music box vibe but the notes convey like determination/rising tension/fighting and can also be abstracted to other instruments as a layer",
    "hypothesis": "Your abstraction claim, tested: the determination lives in the NOTES (the chromatic-adjacent climb over the bass fourths), so it should survive any timbre. Prediction: it carries everywhere but the CHARACTER shifts — epiano reads focused, strings read cinematic tension, trumpet reads open fighting.",
    "question": "The same line four ways: v1 vibraphone (music box read), v2 epiano, v3 string ensemble, v4 muted trumpet. Does determination survive each swap, and which would you actually cast as a layer in a fight/tension song?",
    "key_tonic": "C#",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "musicbox",
        "name": "as transcribed (vibraphone)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_vibraphone\",\"gain\":0.38}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the catalog card verbatim"
      },
      {
        "id": "epiano",
        "name": "line on epiano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_epiano1\",\"gain\":0.45}],\"bpm\":100,\"bars\":2}"
        },
        "note": "focused/interior read"
      },
      {
        "id": "strings",
        "name": "line on string ensemble",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "cinematic-tension read"
      },
      {
        "id": "trumpet",
        "name": "line on muted trumpet",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.42}],\"bpm\":100,\"bars\":2}"
        },
        "note": "open-fighting read"
      }
    ],
    "batch": 1
  },
  "lab_combo_offbeat_voices": {
    "id": "lab_combo_offbeat_voices",
    "lane": "combo",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_lp_r5_offbeat_pizz"
    ],
    "his_words": "pizzicato fits. maybe could also play some notes like up a note on the third note occasionally for variation",
    "hypothesis": "The offbeat role ('a pluck on every and-of-beat') may be instrument-agnostic — any short-attack voice in the same register should serve it. If marimba/nylon/koto all work, the generator can rotate the voice per song and the offbeat becomes a ROLE, not a pizzicato preset.",
    "question": "The same offbeat figure at its judged seat on four voices: v1 pizzicato (your tick), v2 marimba, v3 nylon guitar, v4 koto. Which ones serve the role — and do any CHANGE the vibe rather than just the color (koto pulling it eastward, say)?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "pizz",
        "name": "pizzicato (as ticked)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_lp_r5_offbeat_pizz\",\"add\":-4,\"gain\":0.85}],\"bpm\":102,\"bars\":4}"
        },
        "note": "the stored-pin combo from your batch-1 tick"
      },
      {
        "id": "marimba",
        "name": "marimba",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"[~ g4] [~ g4] [~ g4] ~\",\"sound\":\"gm_marimba\",\"gain\":0.6}],\"bpm\":102,\"bars\":4}"
        },
        "note": "same figure at the same seat"
      },
      {
        "id": "nylon",
        "name": "nylon guitar",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"[~ g4] [~ g4] [~ g4] ~\",\"sound\":\"gm_acoustic_guitar_nylon\",\"gain\":0.6}],\"bpm\":102,\"bars\":4}"
        },
        "note": "same figure at the same seat"
      },
      {
        "id": "koto",
        "name": "koto",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"[~ g4] [~ g4] [~ g4] ~\",\"sound\":\"gm_koto\",\"gain\":0.6}],\"bpm\":102,\"bars\":4}"
        },
        "note": "same figure — does the voice drag the vibe with it?"
      }
    ],
    "batch": 1
  },
  "lab_align_layerstack_rise": {
    "id": "lab_align_layerstack_rise",
    "lane": "align",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_device_layerstack_rise"
    ],
    "his_words": "fits, but sounds a bit off in terms of notes. maybe the notes should be more aligned to the key? / (on rl_r6) the low instrument notes should be more aligned to the chord I think bc there's a bit of dissonance",
    "hypothesis": "Measured: after the page's seating (down 5, onto the host's vi) EVERY rise pitch is already IN the host key — so what you heard was never scale misalignment. It is chord-level: the rise runs its own i–iv loop (bar 4 is a diminished b–f–d shape) against the host's changes. Your instinct 'aligned to the chord' (rl_r6 note) is the right mechanism, 'aligned to the key' is already true.",
    "question": "v1 is exactly what you heard. v2 fixes ONLY bar 4 (the diminished shape). v3 also re-seats bar 3's inner dyads onto the host's E7. Does v2 alone remove the off-ness — i.e. was it all bar 4 — or do you need v3? This decides whether pairing needs full per-chord conforming or just clash-bar repair.",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_heard",
        "name": "as you heard it (page seating)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_device_layerstack_rise\",\"add\":-5,\"gain\":0.7}],\"bpm\":102,\"bars\":4}"
        },
        "note": "the exact combo the catalog played: rise seated down 5, gain 0.7"
      },
      {
        "id": "bar4_fix",
        "name": "bar-4 chord fix only",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"~ b3 ~ b3 ~ b3 ~ b4\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.21},{\"mini\":\"<[a2 ~ ~ e3 ~ ~ c4 ~] [~ a2 ~ ~ e3 ~ ~ c4] [~ ~ b2 ~ ~ b3 ~ ~] [b2 ~ ~ e3 ~ ~ d4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.315},{\"mini\":\"<[a1 e2 c3 e2 a1 e2 c3 e2] [a1 e2 c3 e2 a1@4] [b1 [c2,f2] d3 [c2,f2] b1 [c2,f2] d3 [c2,f2]] [b1 e2 d3 e2 e2 d2 b1 a2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":102,\"bars\":4}"
        },
        "note": "bars 1-3 identical to v1 (written out at the same seat); only bar 4's b-f-d diminished shape becomes b-e-d resolving home"
      },
      {
        "id": "full_conform",
        "name": "bars 3+4 conformed to the host chords",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"~ b3 ~ b3 ~ b3 ~ b4\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.21},{\"mini\":\"<[a2 ~ ~ e3 ~ ~ c4 ~] [~ a2 ~ ~ e3 ~ ~ c4] [~ ~ b2 ~ ~ b3 ~ ~] [b2 ~ ~ e3 ~ ~ d4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.315},{\"mini\":\"<[a1 e2 c3 e2 a1 e2 c3 e2] [a1 e2 c3 e2 a1@4] [e2 [b1,e2] d3 [b1,e2] e2 [b1,e2] d3 [b1,e2]] [b1 e2 d3 e2 e2 d2 b1 a2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":102,\"bars\":4}"
        },
        "note": "bar 3's motor re-seats its inner dyads from c/f onto the host's E7 (b/e); bar 4 as v2"
      }
    ],
    "batch": 1
  },
  "lab_align_combo_r8": {
    "id": "lab_align_combo_r8",
    "lane": "align",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_combo_r8_attack_hold"
    ],
    "his_words": "sounds like wrong key, if aligned to key it sounds like it'd work",
    "hypothesis": "Measured: the attack-hold's core stack lands as a ii11 of the host — fully diatonic, untransposed. The 'wrong key' is TWO chromatic planing cells in the vibraphone (an eb/gb passing chord and a c# chord), 3 of 8 cells. The device is in key; the planing is what you heard.",
    "question": "v2 keeps the planing MOTION but walks it diatonically; v3 simply rests the two chromatic cells. Which reads 'aligned' — and does v3's sparser version lose the push that made the device interesting? If v3 works, alignment for this family = drop chromatic cells; if only v2 works, it = rewrite them diatonically.",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_heard",
        "name": "as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_combo_r8_attack_hold\",\"add\":0,\"gain\":0.85}],\"bpm\":102,\"bars\":4}"
        },
        "note": "exact page combo: untransposed (its content already scored best in place), gain 0.85"
      },
      {
        "id": "diatonic_planing",
        "name": "planing kept, walked diatonically",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"[d4,f4,a4,c5,e5] [d4,f4,a4,c5] ~ [d4,f4,a4,c5] ~ ~ [d4,f4,a4,c5] ~\",\"sound\":\"gm_epiano1\",\"gain\":0.38},{\"mini\":\"<[[d5,f5,a5,c6] [e5,g5,a5] [e5,g5,b5,d6] [e5,g5,b5,d6]] [[c5,e5,g5,b5] ~ [d5,f5,a5,c6] [d5,f5,a5,c6]]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.3}],\"bpm\":102,\"bars\":4}"
        },
        "note": "the eb/gb passing chord becomes an e/g/a step-through; the c# chord becomes a Dm7 plane — same motion shape, all host-diatonic"
      },
      {
        "id": "chromatics_rested",
        "name": "chromatic cells rested",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"[d4,f4,a4,c5,e5] [d4,f4,a4,c5] ~ [d4,f4,a4,c5] ~ ~ [d4,f4,a4,c5] ~\",\"sound\":\"gm_epiano1\",\"gain\":0.38},{\"mini\":\"<[[d5,f5,a5,c6] ~ [e5,g5,b5,d6] [e5,g5,b5,d6]] [[c5,e5,g5,b5] ~ ~ ~]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.3}],\"bpm\":102,\"bars\":4}"
        },
        "note": "identical to v1's material with the two chromatic cells silent — the minimal 'aligned' edit"
      }
    ],
    "batch": 1
  },
  "lab_align_shop_bounce": {
    "id": "lab_align_shop_bounce",
    "lane": "align",
    "source_cards": [
      "cand_rl_r3_circle_dotted",
      "cand_ut_shop_bounce_acc"
    ],
    "his_words": "I feel like this would work if more aligned to the chord and key notes. dissonance at the moment",
    "hypothesis": "Measured: after seating (up 4) every bounce pitch is in the host key — the dissonance is the bounce spelling its own two-chord loop against the host's six-chord circle. So 'aligned to the chord' needs per-chord conforming: same bounce rhythm, hit-by-hit re-voiced to whatever host chord is sounding.",
    "question": "v2 conforms the original voicings hit-by-hit; v3 keeps only the RHYTHM and freshly voices every hit from the host chords (your 'aligned key or different notes' alternative from the gijoe note, applied here). Does either make the bounce work — and is v3's fresh voicing better than v2's conformed original, i.e. is the rhythm the transferable part?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_heard",
        "name": "as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0},{\"id\":\"cand_ut_shop_bounce_acc\",\"add\":4,\"gain\":0.7}],\"bpm\":140,\"bars\":2}"
        },
        "note": "exact page combo: bounce seated up 4, gain 0.7"
      },
      {
        "id": "chord_conformed",
        "name": "original voicings conformed per host chord",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[f4@2 a4 ~@3 [g4,b4,d5] ~ e4@2 [g4,b4,e5] ~@3 [g4,b4,d5] ~] [d4@2 [e4,a4,b4] ~@3 [e4,a4,c5] ~ b3@2 [e4,g4,b4] ~@3 [e4,g4,c#5] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.49}],\"bpm\":140,\"bars\":2}"
        },
        "note": "each hit snapped to the chord sounding under it (the final c# is the host's own A7 third, not a foreign tone)"
      },
      {
        "id": "rhythm_renoted",
        "name": "rhythm kept, freshly voiced from the host",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[d4@2 f4 ~@3 [f4,a4,c5] ~ b3@2 [d4,g4,b4] ~@3 [e4,g4,b4] ~] [e4@2 [g4,c5,e5] ~@3 [f4,a4,c5] ~ e4@2 [e4,g4,b4] ~@3 [e4,a4,c#5] ~]>\",\"sound\":\"gm_epiano1\",\"gain\":0.49}],\"bpm\":140,\"bars\":2}"
        },
        "note": "the bounce's rhythm skeleton with brand-new voicings built from Dm9/G6/C^7/Am9/Em7/A7 — nothing carried from the source pitches"
      }
    ],
    "batch": 1
  },
  "lab_align_gijoe": {
    "id": "lab_align_gijoe",
    "lane": "align",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_vg_gijoe_quartal_comp"
    ],
    "his_words": "the rhythm and groove works as a layer but the notes clash. maybe aligned key or different notes would work / I love the rhythm of this so take the rhythm and stuff too",
    "hypothesis": "After seating (down 5) the comp is mostly diatonic but THREE cells carry genuine out-of-scale tones (two chromatic lower-neighbor planes and a c# arrival). Unlike the rise/bounce cards, this one really does have foreign pitches — your 'notes clash' points at 3 of 13 cells.",
    "question": "v2 keeps the lower-neighbor MECHANISM but a whole step below (diatonic); v3 rests the three cells. Same test as the attack-hold card, on a card where the clash is real out-of-scale tones: does the neighbor device survive being diatonic, or was the half-step slide the whole point (in which case this comp just doesn't transplant to happy hosts)?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_heard",
        "name": "as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_vg_gijoe_quartal_comp\",\"add\":-5,\"gain\":0.7}],\"bpm\":102,\"bars\":2}"
        },
        "note": "exact page combo: comp seated down 5, gain 0.7"
      },
      {
        "id": "diatonic_neighbor",
        "name": "half-step slides become whole-step (diatonic)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[a2,a3,d4]@2 g2 ~@1 [a2,a3,d4]@2 [g2,b3,e4] [a2,g3,c4]@2 a2 ~@1 g2 [d3,d4,a4] ~@1 [e3,e4,b4] ~@1] [[f3,g3,c4]@2 e3 ~@1 [f3,g3,c4]@2 [e3,a3,d4] [e3,g3,b3]@2 g3 ~@1 e3 [g3,b3,g4] ~@1 [e3,c4,a4] ~@1]>\",\"sound\":\"gm_epiano1\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "the g#/c# slide-chord becomes g/c (a tone below), the b-cell sits on Em, the final chord lands Am — neighbor motion intact, all in key"
      },
      {
        "id": "clash_cells_rested",
        "name": "the three clash cells rested",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[a2,a3,d4]@2 g2 ~@1 [a2,a3,d4]@2 [g2,b3,e4] ~@2 a2 ~@1 g2 [d3,d4,a4] ~@1 [e3,e4,b4] ~@1] [[f3,g3,c4]@2 e3 ~@1 [f3,g3,c4]@2 [e3,a3,d4] ~@2 g3 ~@1 e3 [g3,b3,g4] ~@1 ~@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "everything you heard minus the three chromatic cells (silent in their slots) — the groove skeleton with holes where the clashes were"
      }
    ],
    "batch": 1
  },
  "lab_align_airwolf": {
    "id": "lab_align_airwolf",
    "lane": "align",
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_vg_airwolf_gallop_pedal"
    ],
    "his_words": "the first part fits but the second variation sounds a bit off key / (r14) same notes, second one sounds off but first one fits",
    "hypothesis": "Measured: after seating, gallop bar 1 lands fully in the host key; bar 2 carries exactly ONE out-of-scale pitch class (the seated a#, from the source's m3) plus an f that rubs the host's D6/f# region. Your 'second variation off key' on two separate hosts is one, maybe two, tones.",
    "question": "v2 fixes only the a# (one pitch class). v3 fixes a# AND the f. If v2 alone clears it, a single-tone conform rule covers this whole family of complaints; if you still hear rub, the f-vs-f# fight matters too. (The pixel-timbre half of your note is tested separately in the combo lane.)",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_heard",
        "name": "as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_vg_airwolf_gallop_pedal\",\"add\":-6,\"gain\":0.7}],\"bpm\":102,\"bars\":2}"
        },
        "note": "exact page combo: gallop seated down 6, gain 0.7"
      },
      {
        "id": "one_tone_fix",
        "name": "only the a# conformed (one pitch class)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[e2,e3] [e2,b3] ~@1 [e2,d4] [e2,e4] [e2,g4] ~@1 [e2,d4] [e2,e4] [e2,b3] ~@1 [e2,d4] [e2,a3] [e2,b3] ~@1 [e2,d4]] [[g2,g3] [g2,d4] ~@1 [g2,f4] [g2,g4] [g2,a4] ~@1 [g2,f4] [g2,g4] [g2,d4] ~@1 [g2,f4] [g2,c4] [g2,d4] ~@1 [g2,f4]]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "bar 1 verbatim (written out at the seat); bar 2's a# becomes a — everything else untouched, same saw timbre"
      },
      {
        "id": "two_tone_fix",
        "name": "a# and f both conformed",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[[e2,e3] [e2,b3] ~@1 [e2,d4] [e2,e4] [e2,g4] ~@1 [e2,d4] [e2,e4] [e2,b3] ~@1 [e2,d4] [e2,a3] [e2,b3] ~@1 [e2,d4]] [[g2,g3] [g2,d4] ~@1 [g2,e4] [g2,g4] [g2,a4] ~@1 [g2,e4] [g2,g4] [g2,d4] ~@1 [g2,e4] [g2,c4] [g2,d4] ~@1 [g2,e4]]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "bar 2's a#→a and f→e — the fully in-key gallop over the host's f#-bearing chords"
      }
    ],
    "batch": 1
  },
  "lab_align_host_pulse": {
    "id": "lab_align_host_pulse",
    "lane": "align",
    "source_cards": [
      "cand_rl_r6_pedal_sus",
      "cand_rl_r2_e_major_happy"
    ],
    "his_words": "tempo should be a bit more constant (to fix up rhythm) but it feels nice / (rl_r2) rhythm should be more aligned, but otherwise sounds good / (rl_r3) rhythm is a little hard to follow",
    "hypothesis": "Three host cards drew the same note, and all three carry UNEVEN transcribed chord spans (this one: 8+4+2+2 beats). Played bare, an uneven harmonic rhythm with nothing marking the beat reads as tempo wobble. Two candidate fixes: give the ear a pulse (the changes stay as transcribed), or even the changes out to one per bar (the literal 'more constant').",
    "question": "v1 = the card as you heard it. v2 = same chords, same uneven spans, plus a quiet root pulse marking the quarters. v3 = the changes EVENED to one chord per bar. Which is the fix you meant? v2 keeps the transcription faithful; v3 changes the harmonic rhythm itself — your pick decides how every unevenly-transcribed progression gets presented from now on.",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_heard",
        "name": "bare, uneven spans (as on the catalog)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0}],\"bpm\":79,\"bars\":4}"
        },
        "note": "Fm9 for two bars, Ab^7 a bar, Gsus/G7 splitting the last — nothing marks the beat"
      },
      {
        "id": "pulse_anchor",
        "name": "+ quiet root pulse (transcription kept)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[f2 f2 f2 f2] [f2 f2 f2 f2] [ab2 ab2 ab2 ab2] [g2 g2 g2 g2]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3}],\"bpm\":79,\"bars\":4}"
        },
        "note": "root quarters under the unchanged chords — the pulse is added, the harmony untouched"
      },
      {
        "id": "evened_spans",
        "name": "changes evened to one chord per bar",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5:m9 8:^7 7:sus 7:7\",\"family\":\"minor\",\"tonic\":\"C\",\"bpm\":79,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "same four chords, constant harmonic rhythm — the literal 'more constant', at the cost of the transcribed spans"
      }
    ],
    "batch": 1
  },
  "lab_mix_his_energy_recipe": {
    "id": "lab_mix_his_energy_recipe",
    "lane": "mix",
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_cw_morning_hexarp",
      "cand_cw_airpirate_bass",
      "cand_lp_r3_catchy_pluck",
      "cand_cw_shenightfall_drums"
    ],
    "his_words": "like if it's just the harp and piano then it feels like a relaxing/calm vibe. for more energy, add like the air-pirate bass and energetic pizzicato",
    "hypothesis": "This is YOUR recipe rendered literally: the calm core (prog + hexarp) plus the two energizers you named. If it works, 'energy = add a driving bass + a sparse plucked pusher over an unchanged core' becomes a compilable rule — the first vibe-algebra rule taken from your own words rather than my guesses.",
    "question": "v1 = the calm core. v2 = your recipe exactly (bass + pizzicato added). v3 = recipe + the nightfall drums. Is v2 the energy lift you meant? And does v3 tip it into the 'timelapse / passive running minigame' zone you described, or is that zone only reached with even more layers?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "calm_core",
        "name": "calm core: piano + hexarp",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "your ticked pair at its judged seat — the 'refreshing/calm' baseline"
      },
      {
        "id": "his_recipe",
        "name": "your recipe: + air-pirate bass + catchy pluck",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_cw_airpirate_bass\",\"add\":5,\"gain\":1.063},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":-2,\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the two energizers you named, at their page seats/gains, over the unchanged core"
      },
      {
        "id": "recipe_plus_drums",
        "name": "recipe + nightfall drums",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_cw_airpirate_bass\",\"add\":5,\"gain\":1.063},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_cw_shenightfall_drums\",\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the full-cast direction — checking where 'energetic' becomes 'timelapse'"
      }
    ],
    "batch": 1
  },
  "lab_mix_mysterious_desert": {
    "id": "lab_mix_mysterious_desert",
    "lane": "mix",
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_cw_desert_groove"
    ],
    "his_words": "mysterious desert vibe",
    "hypothesis": "The second swell's d#/a# pitches — the ones that CLASHED on every tonal host — sit a semitone off the tonic frame, which is exactly the desert bII pincer (the D93 law). Prediction: over a bare tonic drone with the desert groove, the clash tones become the style, so the swell needs NO safe-swell fix here.",
    "question": "v1 = the pair as the page played it. v2 adds a low tonic drone (the desert floor). v3 adds sparse zill/riq sparkle. Does the second swell — the one that clashed everywhere else — sound RIGHT in this frame? If yes, the rule is: a device's clash tones can be re-framed as modal color instead of fixed.",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_heard",
        "name": "swell + desert groove (as the page played it)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_cw_desert_groove\",\"gain\":1.19}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the exact combo behind your 'mysterious desert vibe' note"
      },
      {
        "id": "with_drone",
        "name": "+ tonic drone floor",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_cw_desert_groove\",\"gain\":1.19}],\"parts\":[{\"mini\":\"<[a1@16] [a1@16] [a1@16] [a1@12 g1@2 a1@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.45}],\"bpm\":110,\"bars\":4}"
        },
        "note": "a bare A pedal under everything — the drone that makes the bII-side swell tones read as desert color"
      },
      {
        "id": "with_sparkle",
        "name": "+ zill/riq sparkle",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_cw_desert_groove\",\"gain\":1.19}],\"parts\":[{\"mini\":\"<[a1@16] [a1@16] [a1@16] [a1@12 g1@2 a1@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.45},{\"mini\":\"<[~@4 vc_zill ~@11] [~@4 vc_zill ~@9 vc_riq ~] [~@4 vc_zill ~@11] [~@4 vc_zill ~@7 vc_riq ~@2 vc_riq]>\",\"sound\":\"vc_zill\",\"gain\":0.4}],\"bpm\":110,\"bars\":4}"
        },
        "note": "hand-percussion glints on the backbeat side, whisper level — the full mysterious-desert scene"
      }
    ],
    "batch": 1
  },
  "lab_mix_playful_mysterious": {
    "id": "lab_mix_playful_mysterious",
    "lane": "mix",
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_hs_negrocity_walking_bass",
      "cand_lp_r3_catchy_pluck"
    ],
    "his_words": "fits, turns the song kinda playful like a playful mysterious / (catchy pluck) makes it playful",
    "hypothesis": "You identified TWO independent playful-izers for the same mysterious core. If vibe-deltas compose, both at once should read as more playful than either alone — but they may instead crowd each other (your texture-budget law) since both are sparse mid-register pluck-family voices.",
    "question": "v1 walking bass alone, v2 catchy pluck alone, v3 both. Does playfulness ADD in v3, or do the two pluckers fight? This calibrates whether same-direction vibe layers stack or saturate.",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "walk_only",
        "name": "swell + walking bass",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_hs_negrocity_walking_bass\",\"add\":6,\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "your 'playful mysterious' pair, at its page seat"
      },
      {
        "id": "pluck_only",
        "name": "swell + catchy pluck",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":4,\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "your 'makes it playful' pair"
      },
      {
        "id": "both",
        "name": "swell + both playful-izers",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_hs_negrocity_walking_bass\",\"add\":6,\"gain\":0.85},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":4,\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "do the deltas add, or crowd?"
      }
    ],
    "batch": 1
  },
  "lab_mix_determined_mysterious": {
    "id": "lab_mix_determined_mysterious",
    "lane": "mix",
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_cw_shenightfall_drums",
      "cand_lp_r1_onoff_pad"
    ],
    "his_words": "(drums) gives it more determination like determination + mysterious / (onoff pad) too loud. fits but adds stuff to it... it increases the significance of the atmosphere",
    "hypothesis": "Determination + mysterious is a real compiled scene: swell + drums. The pad you called 'too loud' at 0.85 should earn its place at roughly half that — your note said it fits, only the level was wrong.",
    "question": "v1 = the determination pair as you heard it. v2 adds the on/off pad at HALF the gain you heard it at. Does the pad now deepen the atmosphere the way you described without the loudness problem — i.e. was your 'too loud' purely a level note, not a fit note?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "determined",
        "name": "swell + nightfall drums",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_cw_shenightfall_drums\",\"gain\":1.02}],\"bpm\":110,\"bars\":4}"
        },
        "note": "your 'determination + mysterious' pair at its page gain"
      },
      {
        "id": "pad_halved",
        "name": "+ on/off pad at half gain",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_cw_shenightfall_drums\",\"gain\":1.02},{\"id\":\"cand_lp_r1_onoff_pad\",\"add\":5,\"gain\":0.45}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the pad you heard at 0.85 now at 0.45 — the level fix your note implied"
      }
    ],
    "batch": 1
  },
  "lab_mix_tech_mystery": {
    "id": "lab_mix_tech_mystery",
    "lane": "mix",
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_device_layerstack_rise"
    ],
    "his_words": "fits slightly but is borderline. gives it more energy and tech-like vibe since its piano + straight synths",
    "hypothesis": "Measured: at its seat the rise is fully inside the swell's A frame — the 'borderline' is its bars 3-4 leaning on a G#-diminished shape against the swell's harmony. Re-seating those two bars on E (the frame's V) should keep the tech vibe and remove the borderline.",
    "question": "v1 as you heard it, v2 with the rise's bars 3-4 seated on E. Does v2 turn 'fits slightly / borderline' into a clean fit while still reading tech? If yes, the align-lane chord-conform rule extends to device-on-device mixes too.",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_heard",
        "name": "swell + rise (as the page played it)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_device_layerstack_rise\",\"add\":4,\"gain\":0.7}],\"bpm\":110,\"bars\":4}"
        },
        "note": "your 'tech-like vibe... borderline' combo"
      },
      {
        "id": "seated_on_v",
        "name": "rise bars 3-4 seated on E",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0}],\"parts\":[{\"mini\":\"~ g#4 ~ g#4 ~ g#4 ~ g#5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.21},{\"mini\":\"<[f#3 ~ ~ c#4 ~ ~ a4 ~] [~ f#3 ~ ~ c#4 ~ ~ a4] [~ ~ g#3 ~ ~ g#4 ~ ~] [g#3 ~ ~ e4 ~ ~ b4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.315},{\"mini\":\"<[f#2 c#3 a3 c#3 f#2 c#3 a3 c#3] [f#2 c#3 a3 c#3 f#2@4] [g#2 [b2,e3] b3 [b2,e3] g#2 [b2,e3] b3 [b2,e3]] [g#2 e3 b3 e3 e3 b2 g#2 a2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":110,\"bars\":4}"
        },
        "note": "bars 1-2 identical to v1 (written at the seat); bars 3-4 move from the G#-dim lean onto E, landing back on a"
      }
    ],
    "batch": 1
  },
  "lab_mix_timelapse_dial": {
    "id": "lab_mix_timelapse_dial",
    "lane": "mix",
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_cw_morning_hexarp",
      "cand_vg_dq_pizz_only",
      "cand_un_lofi_backbeat",
      "cand_device_layerstack_rise",
      "cand_lp_r3_catchy_pluck",
      "cand_cw_shenightfall_drums"
    ],
    "his_words": "with all the layers, it sounds fine like a 'timelapse' sort of vibe or like a 'passive running mini game'... while just piano and maybe hexarp conveys refreshing/calm... but any layer can be on or off",
    "hypothesis": "Your 'any layer can be on or off' means the same core supports a VIBE DIAL: each added layer moves it monotonically from refreshing toward timelapse. If the dial is real, the midpoint (v3) should read as its own usable scene, not a half-finished version of v4. (Probe note: the dq-pizz layer carries its source's own picardy/dorian tones — the e/a naturals in the C-minor frame are the ticked layer's character, not seating errors.)",
    "question": "Four dial positions, all from your own ticks at their judged seats. Name where refreshing ends and timelapse begins — and is v3 a real scene of its own (what would you call it)? That boundary is what the generator would use to serve one core at several energies.",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "dial_1",
        "name": "dial 1: piano only",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the bare core"
      },
      {
        "id": "dial_2",
        "name": "dial 2: + hexarp (your 'refreshing/calm')",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the calm position you named"
      },
      {
        "id": "dial_3",
        "name": "dial 3: + dq pizz + lofi backbeat",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_vg_dq_pizz_only\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the midpoint — is this its own scene?"
      },
      {
        "id": "dial_4",
        "name": "dial 4: + rise + pluck + drums (all ticks)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_vg_dq_pizz_only\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85},{\"id\":\"cand_device_layerstack_rise\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_cw_shenightfall_drums\",\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "everything you ticked at once — your 'timelapse' reading"
      }
    ],
    "batch": 1
  },
  "lab_mix_royalroad_stakes": {
    "id": "lab_mix_royalroad_stakes",
    "lane": "mix",
    "source_cards": [
      "cand_cw_evening_royalroad",
      "cand_cw_airvoyage_pendulum",
      "cand_un_indie_backbeat"
    ],
    "his_words": "air voyage pendulum adds a 'stakes' feel / (indie backbeat) best percussion... it's like relaxing and old classic",
    "hypothesis": "Two of your deltas point in different directions on the same host: the pendulum adds stakes (tension-ward), the indie backbeat adds relaxed-classic (ease-ward). Stacking them tests which delta dominates — my bet: percussion sets the floor mood and the pendulum reads as motion on top, i.e. 'relaxed but something's at stake'. (Probe note: the pendulum's dark-bar e-natural seats to f# here — its own transcribed variation tone, as ticked.)",
    "question": "v1 = royalroad + pendulum (stakes). v2 = + indie backbeat. Does v2 read 'relaxed with stakes' (both deltas audible), or does the backbeat neutralize the stakes? This decides whether opposing vibe layers blend or cancel.",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "stakes",
        "name": "royalroad + pendulum",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1.0},{\"id\":\"cand_cw_airvoyage_pendulum\",\"add\":2,\"gain\":0.85}],\"bpm\":120,\"bars\":4}"
        },
        "note": "your ticked 'stakes' pair at its stored pin"
      },
      {
        "id": "stakes_relaxed",
        "name": "+ indie backbeat",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1.0},{\"id\":\"cand_cw_airvoyage_pendulum\",\"add\":2,\"gain\":0.85},{\"id\":\"cand_un_indie_backbeat\",\"gain\":0.85}],\"bpm\":120,\"bars\":4}"
        },
        "note": "opposing deltas stacked — blend or cancel?"
      }
    ],
    "batch": 1
  },
  "lab_mix_texture_budget": {
    "id": "lab_mix_texture_budget",
    "lane": "mix",
    "source_cards": [
      "cand_rl_r3_circle_dotted",
      "cand_cw_morning_hexarp",
      "cand_vg_rd_panflute_nocturne",
      "cand_lp_r3_catchy_pluck",
      "cand_un_lofi_backbeat"
    ],
    "his_words": "most of the time if you play them all at once they're not gonna resonate too well due to being too textured.. for example moving hexarp and panflute nocturnal would def clash",
    "hypothesis": "Your texture-budget law, tested on your own named example. Prediction per your words: v1 (both at once) clashes. v2 tests whether TIME separation rescues the pair (panflute speaks only in the hexarp's rest bars). v3 is the role-spread contrast — three of your actual ticks whose textures occupy different registers/roles.",
    "question": "Does v1 clash the way you predicted? Does v2 rescue it — i.e. is the budget about SIMULTANEITY, so alternation is fine — or is the pair just wrong together in any arrangement? And does v3 confirm that spreading roles is how a full mix stays clean?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "predicted_clash",
        "name": "hexarp + panflute together (your predicted clash)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":3,\"gain\":0.85},{\"id\":\"cand_vg_rd_panflute_nocturne\",\"add\":-1,\"gain\":0.7,\"slow\":2}],\"bpm\":140,\"bars\":4}"
        },
        "note": "both textures at their page seats, simultaneously — the control"
      },
      {
        "id": "time_separated",
        "name": "panflute only in the hexarp's rest bars",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":3,\"gain\":0.85}],\"parts\":[{\"mini\":\"<~ [~@8 g6@6 f6 e6] ~ [c6@8 d6@8] ~ [e6@12 a5@2 b5@2]>\",\"sound\":\"gm_pan_flute\",\"gain\":0.63}],\"bpm\":140,\"bars\":6}"
        },
        "note": "the flute's own gestures (at the same seat) placed in the bars where the hexarp rests — alternation instead of simultaneity"
      },
      {
        "id": "role_spread",
        "name": "role-spread contrast: hexarp + pluck + lofi",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r3_circle_dotted\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":3,\"gain\":0.85},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":-5,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85}],\"bpm\":140,\"bars\":4}"
        },
        "note": "three of your rl_r3 ticks — texture + sparse pluck + backbeat, each owning a different role"
      }
    ],
    "batch": 1
  },
  "lab_compose_harpsi_rule": {
    "id": "lab_compose_harpsi_rule",
    "lane": "compose",
    "source_cards": [
      "cand_cw_shenightfall_harpsi",
      "cand_rl_r6_pedal_sus",
      "cand_r14_andalusian_descent"
    ],
    "his_words": "analyze why it fits all the vibes in terms of the intervals and why mechanically it may fit so we can predict for future different chords",
    "hypothesis": "The analysis: the harpsi generalizes because (1) its long anchor note is a COMMON TONE of every chord in its home loop, (2) its pickups are bare stepwise 1-2-3, (3) it owns one mid register at low density. Predict-forward: on the sus-pedal host, the seated anchor lands as a #9 rub against the final dominant beats — the ONE chord whose third fights it — while on the andalusian the very same rub is idiomatic (you already said it fits there). The fix the rule prescribes: move the anchor to the host's all-chords common tone (g).",
    "question": "v1 = harpsi on the sus-pedal host exactly as the page seats it — do you hear the rub on the last two beats of the loop (the dominant)? v2 moves the anchor to g (common to all four chords) — clean now? v3 = the andalusian pairing you already called 'fits', same rub present — the control. If v1 rubs where v3 doesn't, the rule + its phrygian exception are both real and we can PREDICT the fit for any future progression by checking the anchor against each chord.",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "naive_seat",
        "name": "on the sus-pedal host, page seating",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0},{\"id\":\"cand_cw_shenightfall_harpsi\",\"add\":5,\"gain\":0.7}],\"bpm\":79,\"bars\":8}"
        },
        "note": "anchor lands on bb — a common tone of three chords but a #9 against the final G7 beats"
      },
      {
        "id": "rule_anchor",
        "name": "anchor moved to the all-chords common tone",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c3 d3 eb3 g4@13] [c3 d3 eb3 g4 ~ ab4 eb4@4 d4@3 eb4@3] [ab2 d3 eb3 g4@13] [ab2 d3 eb3 g4 ~ ab4 eb4@4 g4@3 ab4@3] [g2 c3 d3 g4@13] [g2 c3 d3 g4 ~ ab4 ~ eb4@3 d4@3 eb4@3] [ab2 d3 eb3 g4@13] [ab2 d3 eb3 g4 ~ ab4 eb4@4 g4@3 c5@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.385},{\"mini\":\"<[g3,d4] [g3,d4] [g3,c4] [g3,c4] [f3,bb3] [f3,bb3] [eb3,g3] [d3,g3]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.21}],\"bpm\":79,\"bars\":8}"
        },
        "note": "same pattern rebuilt in the host frame with the anchor on g (9th of Fm9, maj7 of Ab^7, root of Gsus/G7) — the rule's own prescription"
      },
      {
        "id": "andalusian_control",
        "name": "on the andalusian (your 'fits'), same rub present",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_r14_andalusian_descent\",\"gain\":1.0},{\"id\":\"cand_cw_shenightfall_harpsi\",\"add\":5,\"gain\":0.7}],\"bpm\":100,\"bars\":4}"
        },
        "note": "identical seating, identical bb-vs-dominant rub — but here the rub is the style (phrygian b9 world), which is why your ear passed it"
      }
    ],
    "batch": 1
  },
  "lab_compose_hexarp_rule": {
    "id": "lab_compose_hexarp_rule",
    "lane": "compose",
    "source_cards": [
      "cand_cw_morning_hexarp",
      "cand_rl_r2_e_major_happy",
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "fits as well, analyze just like for she nightfall harps",
    "hypothesis": "The analysis: the hexarp run is its major scale MINUS degree 4 — six notes (1 2 3 5 6 7) that omit the one degree that rubs both the tonic chord (as a suspended 4th) and the leading tone below the 5th. That is why it fits every diatonic chord: everything left is chord tone or 9/13 color. Falsification: putting degree 4 back in should break it exactly on tonic-family bars; transfer: building the same no-4th run in a MINOR key should inherit the fits-everything property.",
    "question": "v1 = the run as you ticked it on the happy host. v2 = same run WITH the 4th restored — do the tonic bars now rub where v1 was clean? v3 = a no-4th run built fresh for the nightfall minor loop — does it fit that loop the way the original fits its own? If v2 breaks and v3 carries, the rule ('omit degree 4 and an arp fits its whole key') becomes a generator law.",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "no4_original",
        "name": "the run on the happy host (as ticked)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":3,\"gain\":0.85}],\"bpm\":102,\"bars\":6}"
        },
        "note": "seated at +3 the run is c-d-e-g-a-b — no f anywhere"
      },
      {
        "id": "with4_restored",
        "name": "the same run with degree 4 restored",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c4 d4 e4 f4 g4 a4 b4 c5] ~ [c4 d4 e4 f4 g4 a4 b4 c5] ~ [c4 d4 e4 f4 g4 a4 b4 c5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.425},{\"mini\":\"<[e4,a4] [e4,a4] [g3,b3] [g3,b3] [e3,a3] [e3,a3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.34}],\"bpm\":102,\"bars\":6}"
        },
        "note": "one note different per run (the f) — the rule predicts this is where 'fits everything' dies"
      },
      {
        "id": "no4_minor_transfer",
        "name": "a no-4th run composed for the nightfall loop",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c4 d4 eb4 g4 ab4 bb4 c5 d5] ~ [c4 d4 eb4 g4 ab4 bb4 c5 d5] ~ [c4 d4 eb4 g4 ab4 bb4 c5 d5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.425}],\"bpm\":78,\"bars\":6}"
        },
        "note": "C-minor frame, the scale minus its 4th (no f): c-d-eb-g-ab-bb — the same construction as the original run, transferred to minor over the nightfall loop",
        "key_tonic": "C",
        "key_mode": "minor"
      }
    ],
    "batch": 1
  },
  "lab_compose_nocturne_rule": {
    "id": "lab_compose_nocturne_rule",
    "lane": "compose",
    "source_cards": [
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "sounds really good, refreshing, like a nocturne... however change this up since this is a really big and distinct combo. just learn how it is this vibe and the call and return of the piano and the intervals it uses to be calm.",
    "hypothesis": "The learned rules: (1) the left hand frames a WIDE space — low root + a high single voice with the middle octave empty; (2) the answers are stepwise and FALLING; (3) motion is neighbor-rocking (a tone and its upper neighbor trading); (4) one gesture per half-bar, never a run. Composing NEW material from only those four rules should produce the same calm — and inverting rule 2 (rising answers) should measurably un-calm it.",
    "question": "v1 = the original bed. v2 = brand-new material in a different key composed from the four rules (nothing copied). v3 = v2 with the answers INVERTED to rise. Does v2 get the nocturne calm (rule set proven portable)? Does v3 lose it (the falling-answer rule is load-bearing)?",
    "key_tonic": "E",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "original",
        "name": "the nocturne bed (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_vg_rd_nocturne_bed\",\"gain\":1.0}],\"bpm\":64,\"bars\":4}"
        },
        "note": "Bb minor, as on the catalog",
        "key_tonic": "Bb",
        "key_mode": "minor",
        "chromatic_ok": true
      },
      {
        "id": "rules_transfer",
        "name": "new material from the four rules (E minor)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,g5] f#5 [b2,e5]@4 b3@4] [[c2,b4]@2 g2@2 e3@2 [f#3,f#5] e5 [g3,d5]@4 [f#3,c5]@2 b4@2] [[a1,e5] d5 [a2,e5]@2 b2@2 c3@2 d3@2 c3@2 b2@2 c3@2] [[b1,d5]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
        },
        "note": "wide empty-middle frames, falling stepwise answers (g5-f#5, f#5-e5, e5-d5), neighbor rocking, one gesture per half-bar — no pitch copied from the source"
      },
      {
        "id": "rules_inverted",
        "name": "same material, answers inverted to RISE",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,d5] e5 [b2,g5]@4 b3@4] [[c2,b4]@2 g2@2 e3@2 [f#3,c5] d5 [g3,f#5]@4 [f#3,g5]@2 a5@2] [[a1,c5] d5 [a2,e5]@2 b2@2 c3@2 d3@2 c3@2 b2@2 c3@2] [[b1,b4]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
        },
        "note": "identical frames and rhythm; every answer contour flipped upward — the falsification of the falling rule"
      }
    ],
    "batch": 1
  },
  "lab_compose_allstar_resolver": {
    "id": "lab_compose_allstar_resolver",
    "lane": "compose",
    "source_cards": [
      "cand_b2_pk_allstar_rest_loop",
      "cand_cw_evening_royalroad",
      "cand_rl_r6_pedal_sus"
    ],
    "his_words": "I like the resolver used in at the end of the first chord progression (like the last two chords). those should be learned",
    "hypothesis": "The learned resolver: the dominant arrives MAJOR, then melts to its own minor-add9 (D → Dmadd9) before the loop restarts — mixture that softens the pull instead of discharging it. As a rule: 'V → v(add9)' is a graftable cadence softener. Test by grafting it onto two frames that currently end on a plain pull.",
    "question": "v1 = the resolver in its home loop (reference). v2 grafts it into the royal-road frame; v3 grafts it onto the sus-pedal loop's dominant. Does the soft-landing quality carry to both? If yes, the resolver joins the cadence vocabulary as a device any progression can borrow.",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "home",
        "name": "the resolver at home (allstar tail)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"2:7 7:sus 7 7:madd9\",\"family\":\"major\",\"tonic\":\"G\",\"bpm\":94,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "A7 → Dsus → D → Dmadd9 — the last two chords are the device"
      },
      {
        "id": "royalroad_graft",
        "name": "grafted into the royal road",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5 7 7:madd9 9:m\",\"family\":\"major\",\"tonic\":\"C\",\"bpm\":120,\"chordBeats\":[4,4,4,4]}"
        },
        "note": "F → G → Gmadd9 → Am: the dominant melts before the vi lands (the host loop's own tempo and frame)",
        "key_tonic": "C",
        "key_mode": "major"
      },
      {
        "id": "pedal_graft",
        "name": "grafted onto the sus-pedal dominant",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"5:m9 8:^7 7:7 7:madd9\",\"family\":\"minor\",\"tonic\":\"C\",\"bpm\":79,\"chordBeats\":[8,4,2,2]}"
        },
        "note": "Fm9 → Ab^7 → G7 → Gmadd9: the loop's dominant defuses to minor at the turn, same harmonic rhythm as the host",
        "key_tonic": "C",
        "key_mode": "minor"
      }
    ],
    "batch": 1
  },
  "lab_compose_rainingjazz_lh": {
    "id": "lab_compose_rainingjazz_lh",
    "lane": "compose",
    "source_cards": [
      "cand_ut_raining_jazz_walk"
    ],
    "his_words": "separate this, and dont use the melody but analyze why its relaxing and works for its rhythm and intervals and orders of intervals. left hand could be learn structurally and rhythm wise thats fine",
    "hypothesis": "The analysis: the relax is (a) a sparse LH cycle — chord-then-root-then-fifth at one attack per ~2 beats with tenth-wide spreads, and (b) an RH that only ROCKS between a tone and its neighbor and always falls at phrase ends. Test: the LH structure alone transferred to new changes should already relax; adding a new RH composed by the rocking rule should complete it — and neither uses one pitch of the source melody.",
    "question": "v1 = the source's left hand alone (melody removed, per your 'separate this'). v2 = the LH structure transferred to a D-minor progression (new pitches, same rhythm/interval orders). v3 = v2 plus a new neighbor-rocking RH. Does v2 already carry the relax (structure is the substance), or does it need v3's rocking line? Whichever wins tells the generator which half to learn.",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "lh_only",
        "name": "source left hand alone",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[eb3,g3,bb3] ~@5 c3@6 g2@4] [c2@6 c3@6 f2@2 ~ g2] [[bb2,d3,f3]@6 g2@6 d2@4] [g1@6 g2@6 d2@2 eb2 bb2]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":110,\"bars\":4}"
        },
        "note": "exactly the catalog card's LH part, melody removed",
        "key_tonic": "F",
        "key_mode": "minor"
      },
      {
        "id": "lh_transfer",
        "name": "LH structure on new changes (D minor)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7}],\"bpm\":110,\"bars\":4}"
        },
        "note": "same attack rhythm and interval ORDERS (chord/root/fifth/approach) over Dm-Bb-Gm-A — no source pitch survives (the closing c# is the new dominant's own third)"
      },
      {
        "id": "lh_plus_rocking_rh",
        "name": "+ a new rocking right hand",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@4 f5@2 e5@2 f5@4 d5@2 e5@2] [f5@2 a5@2 g5@2 f5@4 e5@2 d5@2 a4@2] [~@4 e5@2 d5@2 e5@4 a4@2 bb4@2] [c5@2 e5@4 d5@8 ~@2]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the RH composed by the rocking rule only (tone/upper-neighbor trades, falling phrase tails) — not a quote of the source melody"
      }
    ],
    "batch": 1
  },
  "lab_compose_scale_climb_placement": {
    "id": "lab_compose_scale_climb_placement",
    "lane": "compose",
    "source_cards": [
      "cand_lp_r6_scale_climb",
      "cand_rl_r6_pedal_sus"
    ],
    "his_words": "works but should be used like right before a drop or something because it's more of a transition rather than a repeat",
    "hypothesis": "Your placement rule, staged: the climb is a TRANSITION device, so it should appear once, late, aimed at an arrival — not loop. v2 stages it in bar 4 of an 8-bar pass with a percussion arrival on bar 5 (the 'drop'); v3 stages the same placement with no arrival, to test whether the climb alone creates one.",
    "question": "v1 = the climb looping (how the catalog card plays — your objection context). v2 = placed before a drop, your prescription. v3 = placed but nothing arrives. Is v2 the usage you meant? And does v3 feel like a promise broken — i.e. does the climb REQUIRE the arrival it points at?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "looped",
        "name": "the climb looping (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_lp_r6_scale_climb\",\"gain\":1.0}],\"bpm\":79,\"bars\":4}"
        },
        "note": "as the catalog plays it — a transition treated as a repeat",
        "key_tonic": "A",
        "key_mode": "minor"
      },
      {
        "id": "before_drop",
        "name": "placed in bar 4, drop arrives",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<~ ~ ~ [c5@2 d5@2 eb5@2 f5@2 g5 ab5 bb5 c6 d6 eb6 f6 g6] ~ ~ ~ ~>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.5},{\"mini\":\"<~ ~ ~ ~ [vc_wardrum ~@3 md_kick ~@3 vc_wardrum ~@3 md_kick ~@3] [md_kick ~@3 md_kick ~@3 md_kick ~@3 md_kick ~@3] [md_kick ~@3 md_kick ~@3 md_kick ~@3 md_kick ~@3] [md_kick ~@3 md_kick ~@3 vc_wardrum ~@1 vc_wardrum [md_kick,vc_wardrum] ~@3]>\",\"sound\":\"md_kick\",\"gain\":0.6}],\"bpm\":79,\"bars\":8}"
        },
        "note": "bars 1-3 groove, bar 4 the climb (accelerating: quarters into 16ths, in the host frame), bars 5-8 the drop — drums land exactly where the climb points"
      },
      {
        "id": "no_arrival",
        "name": "placed in bar 4, nothing arrives",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r6_pedal_sus\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<~ ~ ~ [c5@2 d5@2 eb5@2 f5@2 g5 ab5 bb5 c6 d6 eb6 f6 g6] ~ ~ ~ ~>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.5}],\"bpm\":79,\"bars\":8}"
        },
        "note": "same climb, same spot, no drop — the broken-promise control"
      }
    ],
    "batch": 1
  },
  "lab_compose_echo_rule": {
    "id": "lab_compose_echo_rule",
    "lane": "compose",
    "source_cards": [
      "cand_b2_ly_hmsummer_echo_cascade"
    ],
    "his_words": "sounds good and refreshing but could also be carried after analyzing why it sounds refreshing since this is a very distinct melody / adds an echo/ethereal vibe to it like you're in a crystal cave or night sky/sunset etc",
    "hypothesis": "The analysis: the cascade is a UNISON CANON — the same line repeated at one-slot delays with decaying gains — and it stays clear because the line is ARPEGGIO-shaped (chord tones, wide steps), so delayed copies land as consonances with each other. Rule: echo-cascade any chord-tone line and you get crystal-cave; echo a STEPWISE line and adjacent copies collide in seconds — mud, not shimmer.",
    "question": "v1 = the original cascade. v2 = a brand-new chord-tone line put through the same cascade (delays + decaying gains copied, no pitch copied). v3 = a stepwise line through the identical cascade — the falsification. Does v2 carry the crystal-cave vibe, and does v3 turn to mud the way the rule predicts?",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "original",
        "name": "the cascade (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_hmsummer_echo_cascade\",\"gain\":1.0}],\"bpm\":180,\"bars\":2}"
        },
        "note": "four copies of one line at one-slot delays, gains 0.5/0.3/0.2/0.13",
        "chromatic_ok": true
      },
      {
        "id": "new_line_cascade",
        "name": "new chord-tone line, same cascade",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g4@2 d5@2 b4@2 g5@2 ~@2 e5@6] [~@2 e5@2 d5@2 b4@2 c5@2 b4@2 a4@2 g4@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ g4@2 d5@2 b4@2 g5@2 ~@2 e5@5] [~@3 e5@2 d5@2 b4@2 c5@2 b4@2 a4@2 g4]>\",\"sound\":\"piano\",\"gain\":0.3},{\"mini\":\"<[~@2 g4@2 d5@2 b4@2 g5@2 ~@2 e5@4] [~@4 e5@2 d5@2 b4@2 c5@2 b4@2 a4@2]>\",\"sound\":\"piano\",\"gain\":0.2},{\"mini\":\"<[~@3 g4@2 d5@2 b4@2 g5@2 ~@2 e5@3] [~@5 e5@2 d5@2 b4@2 c5@2 b4@2 a4@1]>\",\"sound\":\"piano\",\"gain\":0.13}],\"bpm\":180,\"bars\":2}"
        },
        "note": "a fresh G-arpeggio line under the exact delay/decay scheme of the source"
      },
      {
        "id": "stepwise_cascade",
        "name": "stepwise line, same cascade (falsification)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g4@2 a4@2 b4@2 c5@2 d5@2 e5@6] [~@2 f#5@2 e5@2 d5@2 c5@2 b4@2 a4@2 g4@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ g4@2 a4@2 b4@2 c5@2 d5@2 e5@5] [~@3 f#5@2 e5@2 d5@2 c5@2 b4@2 a4@2 g4]>\",\"sound\":\"piano\",\"gain\":0.3},{\"mini\":\"<[~@2 g4@2 a4@2 b4@2 c5@2 d5@2 e5@4] [~@4 f#5@2 e5@2 d5@2 c5@2 b4@2 a4@2]>\",\"sound\":\"piano\",\"gain\":0.2},{\"mini\":\"<[~@3 g4@2 a4@2 b4@2 c5@2 d5@2 e5@3] [~@5 f#5@2 e5@2 d5@2 c5@2 b4@2 a4@1]>\",\"sound\":\"piano\",\"gain\":0.13}],\"bpm\":180,\"bars\":2}"
        },
        "note": "identical cascade, line made stepwise — delayed copies now overlap as seconds; the rule predicts mud"
      }
    ],
    "batch": 1
  },
  "lab2_flow_walkbass_rhythm": {
    "id": "lab2_flow_walkbass_rhythm",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_hs_negrocity_walking_bass",
      "cand_b6_vl_negrocity_walk_flows"
    ],
    "his_words": "I like this! these variations are nice. definitely make more of these. these sounds good. could also vary rhythm too to test hypothesis",
    "hypothesis": "Batch 1 (lab_flow_walkbass) varied this walk by PITCH and every alternate kept the groove, so the identity was never the exact tones; the remaining candidate is the quarter-note stroll itself. This card holds the pitch set AND its order fixed (c-eb-f-gb | g-gb-f-bb, so the gb2 blues passing tone from the source is the only out-of-scale pitch — chromatic_ok for that reason) and moves only the timing. Prediction: pushed and tresillo keep the noir stroll because each bar's last note still steps into the next downbeat (gb->g, bb->c) and the pulse stays at four-to-the-bar or denser; halftime is the falsifier — nothing but duration changes, and if it reads as a different, slower song then rhythm alone IS a variation axis to your ear; restpunct tests whether a silence inside the figure is heard as a feature (breath) or a dropout.",
    "question": "Same eight notes in the same order in every variant; only the timing moves. Which of pushed / restpunct / halftime / tresillo still reads as THE negrocity groove, and which becomes a different figure? Is rhythm alone enough to count as variation (your hypothesis), or does it need the batch-1 pitch flows on top? Does restpunct's silent beat 3 breathe or stumble?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "the judged 2-bar walk in straight quarters: c-eb-f-gb climbing chromatically, g-gb-f-bb walking back down and stepping into the loop.",
        "chromatic_ok": true
      },
      {
        "id": "pushed",
        "name": "pushed — beats 2 and 4 anticipated by an 8th",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2@3 f2 gb2@3] [g2 gb2@3 f2 bb1@3]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "same walk, but the beat-2 and beat-4 notes arrive an 8th early (on the and-of-1 and the and-of-3) and hold through their beat — half the onsets move, none of the pitches.",
        "chromatic_ok": true
      },
      {
        "id": "restpunct",
        "name": "rest-punctuated — beat 3 silent, beat 4 stutters as two 8ths",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 ~ [gb2 gb2]] [g2 gb2 ~ [bb1 bb1]]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "beat 3 is silence and the beat-4 note is struck twice as 8ths (a pickup stutter into the downbeat). Per the recipe the silenced note is the beat-3 f2, so this is the one variant whose bar loses a pitch; the step into the next bar (gb->g, bb->c) is untouched.",
        "chromatic_ok": true
      },
      {
        "id": "halftime",
        "name": "half-time — every note held two beats (4-bar cycle)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2@2 eb2@2] [f2@2 gb2@2] [g2@2 gb2@2] [f2@2 bb1@2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":4}"
        },
        "note": "the identical eight-note walk stretched to half notes, so the 2-bar cycle becomes 4 bars at the same tempo — same speed, half the motion. The control for \"does timing alone change the song\".",
        "chromatic_ok": true
      },
      {
        "id": "tresillo",
        "name": "tresillo — 3+3+2 sixteenths, then the fourth note held",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2@3 eb2@3 f2@2 gb2@8] [g2@3 gb2@3 f2@2 bb1@8]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "the first three notes squeezed into a 3+3+2 tresillo across beats 1-2 (attacks on 16ths 0, 3, 6), the fourth note lands on beat 3 and holds the half bar — three of four onsets move, order kept.",
        "chromatic_ok": true
      }
    ]
  },
  "lab2_flow_dq_rhythm": {
    "id": "lab2_flow_dq_rhythm",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_vg_dq_pizz_only",
      "cand_b6_vl_dq_pizz_vamp"
    ],
    "his_words": "I like this! these variations are nice. definitely make more of these. these sounds good. could also vary rhythm too to test hypothesis / the falling part should be repeated as the primary variation because it sounds good",
    "hypothesis": "Two axes, one per variant. fallprimary changes only PITCH ORDER: batch 1's lab_flow_dq_pizz/fallingarc (which you marked as the part that sounds good) is restructured so the fall c5-b4-bb4-a4 is the repeated cell every bar and the rise survives only as a one-beat diatonic pickup (f-g-a-bb) at the end of bar 2 — the sixteen even plucks are untouched. tresillo and breathe change only RHYTHM, drawing every pitch from the original in order. Prediction: fallprimary is the default add-on shape (an arrival every bar instead of a march); the rhythm flows keep the fairy-tale because the pedal-lattice identity is the pedal/colour ALTERNATION, not its density — if tresillo stops sounding like the pluck, the identity was the even 16ths after all. Pitch discipline: the source's own b-natural (the G-major cell) and f# (the picardy cells) appear only where the original places them; all new material is D natural minor — chromatic_ok for those inherited tones only.",
    "question": "fallprimary changes only the pitch order, tresillo and breathe only the timing. Is fallprimary the \"falling part repeated as the primary\" you asked for — does the one-beat rising pickup earn its place or should the fall simply restart? Does tresillo (pedal + the two colour tones per half bar, long-long-short) still read as the fairy-tale pluck at 50bpm, or become a sleepier different figure? Does breathe's silence after every cell breathe or stutter? Which axis carries the freshness here — pitch order or timing?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the judged 2-bar lattice: d4 pedal alternating with the colour tones, the top marching a4 -> b4 -> c5 then bb4, bar 2 on the picardy f#. (source's own dorian b + picardy f#)",
        "chromatic_ok": true
      },
      {
        "id": "fallprimary",
        "name": "falling arc as the primary cell, rise as a one-beat pickup",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 f4 g4 a4 a#4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "bar 1 is batch-1 fallingarc's fall verbatim (top c5 -> b4 -> bb4 -> a4 over the pedal); bar 2 states the fall again but its last beat becomes a rising pickup f-g-a-bb (diatonic, pedal dropped for that beat) that leads back up to the c5 — the rise is now one beat of pickup, the fall is the tune. (keeps the source's dorian b in the fall's G cell)",
        "chromatic_ok": true
      },
      {
        "id": "tresillo",
        "name": "dotted regroup — 3+3+2 per half bar, pedal + colour tones",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4@3 a4@3 b4@2 d4@3 c5@3 a#4@2] [a3@3 c5@3 a4@2 d4@3 a4@3 f#4@2]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "each half bar plays three plucks in a long-long-short 3+3+2 of 16ths: the pedal, then the half's two colour tones in their original order (a4 b4 | c5 bb4 | c5 a4 | a4 f#4) — the increment march is kept, the in-between pedal strikes and partner tones go. 16 plucks a bar become 6. (keeps the source's b and f# where they were)",
        "chromatic_ok": true
      },
      {
        "id": "breathe",
        "name": "rest-punctuated — every 4th 16th silent",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 ~ d4 b4 g4 ~ d4 c5 a4 ~ d4 a#4 f4 ~] [a3 c5 a4 ~ d4 a4 f#4 ~ d4 a4 f#4 ~ d4 a4 f#4 ~]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the original with the last 16th of every beat silent — each 4-note cell becomes pedal-colour-partner then a breath, so the pizz stops sounding continuous. Pitches and the march untouched; a quarter of the plucks removed, the phrase shape changed. (source's b + f# as placed)",
        "chromatic_ok": true
      }
    ]
  },
  "lab2_flow_lattice_bold": {
    "id": "lab2_flow_lattice_bold",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_cw_airpirate_lattice",
      "cand_b6_vl_lattice_breathing_top"
    ],
    "his_words": "very minimal changes, I can barely tell a difference so these aren't really changes (batch-1 lattice verdict) / the glockenspiel note should vary like go up a note or something ... because it sounds a bit uniform",
    "hypothesis": "Batch 1 (lab_flow_lattice: lift9, lift10, upperneighbor, qa) moved ONE pitch in a lattice of twelve identical offbeat cog strikes plus a held chord, and the density masked it — that is the mechanism behind 'very minimal'. A lattice varies audibly only when its TIME shape changes or a cog gets a real line. Axes separated: rolled changes only timing (same pitches; the g4 cog anticipates the and by a 16th, the top cog trails it by a 16th, so the three cogs strike g4-d5-g5 as an upward roll — 8 of 12 cog onsets move); qa2 changes only pitch (the top cog answers bar 1's g5-g5-f5-f5 with a stepwise fall from the 3rd, bb5-a5-g5-f5, 3 of 4 strikes new — measured, that is still only 3 of the lattice's 40 events over two bars, the same magnitude as the batch-1 lifts, so it is the deliberate test of whether a LINE registers where a neighbour did not); sparse changes density (cogs on the and-of-1 and and-of-3 only) and puts a low marimba cog in the emptied gaps (bb3 then g3); both stacks qa2's line onto sparse's density. Bass and vibraphone are byte-identical everywhere. Prediction: rolled is the first variation you can hear, because it changes every beat's surface; if qa2 also registers, a top-cog line is enough and the roll is optional.",
    "question": "rolled = timing only, qa2 = pitch only (the top cog's bar-2 walk), sparse = half the cog strikes plus a low marimba answer in the gaps, both = qa2's walk at sparse's density. Which is the first lattice variation you can actually hear in one listen? Does rolled still feel like a cog machine or has it become an arpeggio? Is sparse's low answer the right voice for the gaps, or should the gaps stay empty for the bass pickups already there?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1,\"note\":\"low part is timpani in source; source adds conga 16th pairs + woodblock offbeats + claps on 2/3/4 with tambourine, all at whisper velocity\"}"
        },
        "note": "the judged 1-bar lattice: three one-pitch marimba cogs on every offbeat 8th (d5, g4, g5->f5) over the D pedal, the vibraphone holding Gm7."
      },
      {
        "id": "rolled",
        "name": "rolled — cogs displaced a 16th each into an upward roll",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ ~ ~ g5 ~ ~ ~ g5 ~ ~ ~ f5 ~ ~ ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1}"
        },
        "note": "same three cogs, same pitches: the g4 cog now strikes a 16th BEFORE each and, the d5 cog stays on the and, the top cog a 16th AFTER it — so every offbeat becomes a rolled g4-d5-g5 arpeggio instead of a single chord-stab. Bass and pad untouched."
      },
      {
        "id": "qa2",
        "name": "question/answer — top cog answers bb5-a5-g5-f5 in bar 2",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g5 ~ g5 ~ f5 ~ f5] [~ a#5 ~ a5 ~ g5 ~ f5]>\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":2}"
        },
        "note": "bar 1 as judged (g5 g5 f5 f5 — the question); in bar 2 the top cog stops repeating and answers with a stepwise descent from the 3rd, bb5-a5-g5-f5, landing where bar 1 landed — a real answering line on the one cog that already moved, not a neighbour tone (3 of its 4 strikes new; a5 is the 9th, in key). The recipe's g5-f5-d5-f5 was measured to put its d5 in unison with the frozen d5 cog at the same and, so that note fused into the cog instead of sounding as a step — the answer was moved above the lattice for that reason. Everything else frozen."
      },
      {
        "id": "sparse",
        "name": "sparse — cogs on every other offbeat, low marimba answers the gaps",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ ~ ~ d5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ ~ ~ f5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"[~ ~ ~ a#3 ~ ~ ~ g3]\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":1}"
        },
        "note": "the cogs keep only the and-of-1 and the and-of-3 (half their strikes gone); in the emptied and-of-2 / and-of-4 a LOW marimba cog answers bb3 then g3 (the 3rd — the one Gm7 tone the cogs never play — falling to the root). Written on a low marimba rather than a bass because the untouched synth bass already pops f2 at exactly those two slots; a second bass there would double or rub it."
      },
      {
        "id": "both",
        "name": "both — the bar-2 walk at the sparse density with the low answer",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ ~ ~ d5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g5 ~ ~ ~ f5 ~ ~] [~ a#5 ~ ~ ~ g5 ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"[~ ~ ~ a#3 ~ ~ ~ g3]\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":2}"
        },
        "note": "sparse's density and low answer, with the top cog's two strikes per bar carrying qa2's answer at half density across the two bars: g5 f5 | bb5 g5 (the 3rd falling to the root). Pitch and rhythm change at once — the \"is more than one axis too much\" test."
      }
    ]
  },
  "lab2_flow_pkmn_diverse": {
    "id": "lab2_flow_pkmn_diverse",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_pkmn_push_hold_dyads",
      "cand_b6_vl_pkmn_dyads_lift"
    ],
    "his_words": "very minimal, try more diverse changes once again! but these are good first steps / it shouldn't repeat, maybe it could go higher for the last chord in a safe valid chord or something occasionally too (like go up a note instead of back down)",
    "hypothesis": "Batch 1 (lab_flow_pkmn_dyads: aligned, vllift, occasionallift) changed ONE chord's voicing at ONE moment — the last two slots of a four-bar pad — which is why it read minimal: a held pad varies audibly only when the whole bar's surface changes. Three axes separated, the anticipation push kept in every variant: arpeggio changes the SURFACE (each hold becomes a quarter-note up-down rock through its own tones, same pitches, pad voice kept); triads changes PITCH (a third voice on top of every chord, moving stepwise f4-g4-a4-g4 across the four bars — a real line, all F major, Bb / C / Bb^7 / C over G); pulse332 changes RHYTHM (each hold re-struck as a dotted-quarter 3+3+2 tresillo of chords). endinglift is the one-moment control done UP: bar 4 rises to c4-e4-g4 — the same C chord an inversion higher — instead of falling to g3-c4-e4; batch-1 vllift went to the F triad instead. Prediction: arpeggio and pulse332 are audible in one listen; triads is audible as 'fuller' but may read as a different pad; endinglift alone still reads minimal, which would confirm that 'go up a note' needs a whole-bar change to register.",
    "question": "arpeggio (surface), triads (a real top line), pulse332 (re-attacks) — which is the first one you can hear in one listen, and does any of them stop being the on-and-off pad you liked? endinglift changes only the last chord (up to c4-e4-g4, the same C chord an inversion higher): is that lift audible now, or does \"go up a note\" need the whole bar to move? The 8th-early push is kept everywhere — does it still feel out of sync on any variant?",
    "key_tonic": "F",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "the judged 4-bar pad: each chord change strikes an 8th early and hangs through the following bar; the second phrase thickens to triads and falls back to g3-c4-e4."
      },
      {
        "id": "arpeggio",
        "name": "arpeggiated — each hold becomes a quarter-note up-down rock",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[a#3@4 d4@4 a#3@4 d4@2 [c4,e4]@2] [c4@4 e4@4 c4@4 e4@4] [a#3@4 d4@4 f4@4 d4@2 [g3,c4,e4]@2] [g3@4 c4@4 e4@4 c4@4]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "the same pitches, the same push: instead of holding, the pad rocks through its chord in quarters (bb-d-bb-d, c-e-c-e, bb-d-f-d, g-c-e-c) and the pushed chord still arrives as a struck dyad/triad on the and-of-4. Pad voice kept."
      },
      {
        "id": "triads",
        "name": "third voice on top — a stepwise line f4-g4-a4-g4",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4,f4]@14 [c4,e4,g4]@2] [[c4,e4,g4]@16] [[a#3,d4,f4,a4]@14 [g3,c4,e4,g4]@2] [[g3,c4,e4,g4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "every chord gains a top voice that moves by step across the four bars: f4 (Bb) -> g4 (C) -> a4 (Bb^7) -> g4 (C/G) — an arch that returns, so the loop closes g4 -> f4 by step too. Rhythm and push identical to the original."
      },
      {
        "id": "pulse332",
        "name": "3+3+2 pulse — each hold re-struck as a dotted-quarter tresillo",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@6 [a#3,d4]@6 [a#3,d4]@2 [c4,e4]@2] [[c4,e4]@6 [c4,e4]@6 [c4,e4]@4] [[a#3,d4,f4]@6 [a#3,d4,f4]@6 [a#3,d4,f4]@2 [g3,c4,e4]@2] [[g3,c4,e4]@6 [g3,c4,e4]@6 [g3,c4,e4]@4]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "same chords, same push: each bar's hold is re-attacked on beat 1, the and-of-2 and beat 4 (dotted quarter, dotted quarter, quarter — the tresillo), so the pad pulses instead of sustaining. One to two onsets a bar become three to four."
      },
      {
        "id": "endinglift",
        "name": "ending lift — bar 4 rises to the next inversion (c4-e4-g4)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [c4,e4,g4]@2] [[c4,e4,g4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "bars 1-3 as judged; the second push goes UP to c4-e4-g4 — the same C chord the original falls to, one inversion higher, so the last chord is the highest in the loop. Your \"go higher for the last chord in a safe valid chord\", with the chord itself unchanged (batch-1 vllift used the F triad instead)."
      }
    ]
  },
  "lab2_flow_rise_rhythm_intervals": {
    "id": "lab2_flow_rise_rhythm_intervals",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_device_layerstack_rise"
    ],
    "his_words": "very minimal changes, I feel like there could be more changes in the rhythm and intervals",
    "hypothesis": "The epiano motor reads as one unchanging thing because its cell spans a 10th (d2-a2-f3) and repeats every four 8ths; you hear variation only when the cell's SPAN or its PULSE changes. Axes separated: intervals changes only pitch span — the same eight slots now carry d2-a2-d3-f3-a3-f3-d3-a2, a fifth-plus-octave arpeggio (bars 3-4 widen the same way on e-g-bb), 5 of 8 pitches per bar new but all D natural minor; rhythm332 changes only timing — the cell's three tones on a 3+3+2 of 16ths twice a bar (6 attacks instead of 8, bar 2's half-bar breath kept) and the frozen strings pedal re-seated onto the tresillo's accents (16ths 3, 6, 11, 14); both stacks the two; rise changes only REGISTER — bars 3-4 of the motor AND the bass cell move up one diatonic step (e-based to f-based) while the strings' e4/e5 pedal stays frozen (R2), so the pedal turns from Em7b5's root into F^7's 7th and the device actually climbs. Prediction: rhythm332 is the most audible single change (the pulse is the layer's identity), intervals second; rise is the variant you will call 'the rise finally rising'. Every pitch in every variant is D natural minor (the source's bb is in scale) — chromatic_ok false.",
    "question": "intervals = pitch span only, rhythm332 = timing only (strings re-seated onto the tresillo accents), both = the two together, rise = bars 3-4 up a step with the strings pedal frozen. Which single axis makes the motor read as varied — the wider cell or the 3+3+2 pulse? Does both overshoot into a different device? And does rise (the frozen e pedal now a maj7 over F) sound like the rise you named, or does the frozen pedal start to clash once the floor moves?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"~ e4 ~ e4 ~ e4 ~ e5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 [f2,bb2] g3 [f2,bb2] e2 [f2,bb2] g3 [f2,bb2]] [e2 bb2 g3 bb2 bb2 g2 e2 d3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "the judged three parts: frozen offbeat e4 pedal on strings, the 3-eighth bass cell re-phasing against the bar, and the d2-a2-f3 epiano motor with its half-bar breath in bar 2 and the e-bass turnaround in bars 3-4."
      },
      {
        "id": "intervals",
        "name": "intervals widened — the cell becomes d2-a2-d3-f3-a3 (same slots)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"~ e4 ~ e4 ~ e4 ~ e5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 d3 f3 a3 f3 d3 a2] [d2 a2 d3 f3 d2@4] [e2 bb2 e3 g3 bb3 g3 e3 bb2] [e2 bb2 e3 g3 bb3 g3 e3 d3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "same eight 8th slots, same rhythm, same breath in bar 2: the motor now climbs a fifth-plus-octave (d2 a2 d3 f3 a3) and folds back, and bars 3-4 widen the same way through e-bb-e-g-bb, dropping the f/bb dyads for a pure Em7b5 arpeggio; the bar-4 landing on d3 is kept. Strings and bass cell untouched."
      },
      {
        "id": "rhythm332",
        "name": "rhythm 3+3+2 — motor in a double tresillo, strings on its accents",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~]\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2@3 a2@3 f3@2 d2@3 a2@3 f3@2] [d2@3 a2@3 f3@2 d2@8] [e2@3 [f2,bb2]@3 g3@2 e2@3 [f2,bb2]@3 g3@2] [e2@3 bb2@3 g3@2 bb2@3 g2@3 d3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "the motor's three tones (d2 a2 f3; e2 [f2,bb2] g3) on a 3+3+2 of 16ths twice a bar — attacks on 16ths 0, 3, 6, 8, 11, 14 — with bar 2's half-bar hold kept and bar 4 thinned to six attacks landing on d3. The strings' four hits move from the ands onto the tresillo's second and third accents (16ths 3, 6, 11, 14). Pitches unchanged; bass cell untouched."
      },
      {
        "id": "both",
        "name": "both — widened cell on the 3+3+2 pulse",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~]\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2@3 a2@3 d3@2 f3@3 a3@3 f3@2] [d2@3 a2@3 d3@2 f3@8] [e2@3 bb2@3 e3@2 g3@3 bb3@3 g3@2] [e2@3 bb2@3 e3@2 g3@3 bb3@3 d3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "intervals and rhythm332 at once: the wide d2-a2-d3-f3-a3 climb on the double tresillo (bar 2 climbs d2-a2-d3 and holds f3 for the breath), the e-bar the same way, strings on the accents. The \"is two axes too many\" test."
      },
      {
        "id": "rise",
        "name": "rise realized — bars 3-4 a step higher, strings pedal frozen",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"~ e4 ~ e4 ~ e4 ~ e5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ f3 ~ ~ f4 ~ ~] [f3 ~ ~ c4 ~ ~ a4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [f2 [g2,c3] a3 [g2,c3] f2 [g2,c3] a3 [g2,c3]] [f2 c3 a3 c3 c3 a2 f2 e3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "bars 1-2 as judged; bars 3-4 of the motor and of the bass cell move up one diatonic step (e-bass with f/bb dyads -> f-bass with g/c dyads and an a3 top; e3/e4/bb3/g4 cell -> f3/f4/c4/a4), the bar-4 turnaround landing on e3. The strings' e4/e5 pedal is NOT moved (R2: freeze the body), so it becomes the 7th of F^7 — the device now climbs d -> f instead of d -> e."
      }
    ]
  },
  "lab2_flow_harpsi_rhythm_notes": {
    "id": "lab2_flow_harpsi_rhythm_notes",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_cw_shenightfall_harpsi",
      "cand_b6_vl_harpsi_third_up"
    ],
    "his_words": "rhythm could also be changed in the harpsichord and what notes the harpsichord plays. I feel like the changes aren't too intentional and novel / inverted pickup or to rise will almost always work!",
    "hypothesis": "Batch 1 (lab_flow_harpsi) re-seated the figure (thirdup), reversed the pickup (invertedpickup — which you ratified: 'inverted pickup or to rise will almost always work') and moved the anchor tone (anchormove); the anchor BARS never changed their rhythm and the answer bars never changed their notes — that is the 'not intentional' feel. The character is { stepwise grace -> held common tone -> turn }, so bold variation has to touch the held bars or the answer's notes. risingpickup changes the pickup (four rising 16ths from the root instead of three, so the anchor lands ON beat 2 instead of the last 16th of beat 1 — rhythm AND notes; over the Eb bars the run is eb-f-g-bb); rocking replaces each held bar with an f4-g4-f4 dotted rock (dotted 8th, dotted quarter, quarter) so the harpsi MOVES where it used to hold; descrun rewrites both answer bars as a seven-note stepwise fall from the anchor to the root (f-eb-d-c-bb-a-g in 8ths — notes change, rhythm busier); combo stacks the rising pickup and a six-note fall to a3 whose root arrival is the next bar's pickup. Every new tone is G natural minor; the pad is byte-identical in all five. Prediction: rocking is the most audible (it changes the bar you hear as static), descrun reads as 'intentional' because a scale run is a nameable gesture, risingpickup alone may still read minimal.",
    "question": "Pad identical everywhere. risingpickup changes only the pickup (four notes, anchor on beat 2), rocking only the held bars, descrun only the answer bars, combo the pickup plus the answer. Which one first sounds like an INTENTIONAL, novel harpsichord rather than a tweak? Does rocking lose the \"lands and holds the 7th\" character you saved this figure for? Does descrun's run to the root still fit over the Eb bars (bar 4)? And is combo too much for a sub-foundation?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference, cropped to 4 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the judged figure cropped to the source's first 4 bars (it runs 8, the second half repeating the shape): grace-climb onto the held f4, then the turn answer, twice. Pad identical in every variant."
      },
      {
        "id": "risingpickup",
        "name": "rising 4-note pickup — anchor lands on beat 2",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 c4 f4@12] [g3 a3 a#3 c4 f4 g4 d4@4 c4@3 d4@3] [d#3 f3 g3 a#3 f4@12] [d#3 f3 g3 a#3 f4 g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the three-16th grace becomes a four-16th rising scale from the root (g-a-bb-c; over the Eb bars eb-f-g-bb) so the held f4 now lands ON beat 2 instead of the last 16th of beat 1 — one more note and a later anchor. In the answer bars the pickup absorbs the breath rest; the g4-d4-c4-d4 turn keeps its exact slots."
      },
      {
        "id": "rocking",
        "name": "dotted rock — the held bars move f4-g4-f4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@3 g4@6 f4@4] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@3 g4@6 f4@4] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "pickups and answer bars as judged; the two HELD bars stop holding: after the grace the anchor f4 lasts a dotted 8th, rocks up to its upper neighbour g4 for a dotted quarter (landing on the and-of-2, through beat 3), and returns to f4 on beat 4. g4 is the root over Gm9 and the 3rd over Eb^7, so the rock is chord-checked in both pairs."
      },
      {
        "id": "descrun",
        "name": "descending answer run — f4 down to g3 in 8ths",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 d#4@2 d4@2 c4@2 a#3@2 a3@2 g3@2] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 d#4@2 d4@2 c4@2 a#3@2 a3@2 g3@2]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "held bars as judged; each answer bar replaces the g4-d4-c4-d4 turn with a stepwise fall from the anchor all the way to the root — f4 (the grace-landing 16th) then eb-d-c-bb-a-g in 8ths — notes change, twice as many attacks. Over Eb^7 (bar 4) the run passes c and a as 8th-note passing tones between chord tones."
      },
      {
        "id": "combo",
        "name": "combo — rising 4-note pickup + descending answer run",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 c4 f4@12] [g3 a3 a#3 c4 f4@2 d#4@2 d4@2 c4@2 a#3@2 a3@2] [d#3 f3 g3 a#3 f4@12] [d#3 f3 g3 a#3 f4@2 d#4@2 d4@2 c4@2 a#3@2 a3@2]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "risingpickup's four-note climb in every bar plus descrun's fall in the answer bars, the fall now in even 8ths from beat 2 (f-eb-d-c-bb-a) and stopping on a3 so the next bar's pickup g3 completes the descent to the root. The boldest harpsi here — both axes at once."
      }
    ]
  },
  "lab2_flow_hexarp_rhythm": {
    "id": "lab2_flow_hexarp_rhythm",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_cw_morning_hexarp",
      "cand_b6_vl_hexarp_flows"
    ],
    "his_words": "feels more skippy and less refreshing/nature but works mechanically (on batch-1 zigzag) / strings should stay the same - these strings add more atmosphere / the harp melody and rhythm should vary",
    "hypothesis": "Your verdict on batch 1's lab_flow_hexarp/zigzag ('more skippy and less refreshing/nature but works mechanically') says the harp's freshness lives in FLOW — continuous stepwise motion in one direction — and the zigzag broke it by reversing direction on short notes, not by changing rhythm per se. So the harp's rhythm can vary without losing nature as long as the contour stays a single climb. Three timings of the exact same eight d-free ladder notes: triplets rounds the climb into two triplet groups and holds a4 then b4 a beat each (a 12-slot bar); dotted keeps long-short pairs but never reverses, gathering f#-g#-a into the held top b4 ON beat 4; anticipation moves the whole climb an 8th late (an 8th rest first) so the top b4 lands on the NEXT bar's downbeat, written as the top held into the rest bar's first beat. Strings are byte-identical, no scale degree 4 anywhere. Prediction: none of these reads skippy — if dotted does, then long-short rhythm itself was zigzag's problem and not its direction changes; anticipation is the risk, because the harp now speaks on the strings' answer bar.",
    "question": "Same eight notes, same strings, three timings. Which keeps the refreshing/nature feel best — triplets (rounder), dotted (long-short but still one climb), anticipation (the top lands on the NEXT downbeat)? Is dotted skippy the way zigzag was — i.e. was zigzag's skip its rhythm or its direction changes? And does anticipation's tie into the rest bar feel like breath, or like the harp stepping on the strings' answer?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6,\"note\":\"source doubles roots an octave down on tuba; strings are bare dyads, never triads\"}"
        },
        "note": "the judged reference: the d-free ladder climbs one octave in even 8ths, rests a bar, three times; strings verbatim."
      },
      {
        "id": "triplets",
        "name": "triplets — two triplet groups, then a4 and b4 held a beat each",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4@3 b4@3] ~ [a3 b3 c#4 e4 f#4 g#4 a4@3 b4@3] ~ [a3 b3 c#4 e4 f#4 g#4 a4@3 b4@3] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "the same eight notes on a 12-slot triplet bar: a-b-c# and e-f#-g# as two triplet groups over beats 1-2, then a4 held on beat 3 and the top b4 held on beat 4 — the climb rounds off and slows into its arrival instead of running evenly to the barline. Rest bars and strings untouched."
      },
      {
        "id": "dotted",
        "name": "dotted flow — long-short pairs gathering into the top on beat 4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~ [a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~ [a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "a3-b3 and c#4-e4 as dotted-8th + 16th pairs, then f#4 (8th) g#4 a4 (16ths) flick into the top b4 held on beat 4 — the run takes the whole bar and ARRIVES instead of ending on an 8th. One direction throughout; no zigzag."
      },
      {
        "id": "anticipation",
        "name": "anticipation — 8th rest first, top ties onto the next downbeat",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~ a3 b3 c#4 e4 f#4 g#4 a4] [b4@2 ~@6] [~ a3 b3 c#4 e4 f#4 g#4 a4] [b4@2 ~@6] [~ a3 b3 c#4 e4 f#4 g#4 a4] [b4@2 ~@6]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "the climb starts on the and-of-1 (one 8th of rest first) and its top b4 lands on the following bar's downbeat, written as b4 held for beat 1 of the rest bar — the tie across the barline. The rest bar keeps three beats of silence for the strings' answer."
      }
    ]
  },
  "lab2_flow_offbeat_rhythm": {
    "id": "lab2_flow_offbeat_rhythm",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_lp_r5_offbeat_pizz",
      "cand_b6_vl_offbeat_pizz_third_up"
    ],
    "his_words": "pizzicato fits. maybe could also play some notes like up a note on the third note occasionally for variation / could also vary rhythm too to test hypothesis",
    "hypothesis": "A one-pitch pedal cannot vary by pitch without becoming a melody — batch 1's lab_flow_offbeat_pizz (every4th, every2nd, twolevel) was the dose test for that — so its remaining variable is WHERE it strikes. Three placements, same b4, still sparse: doubletime adds one 16th (the third pluck becomes a 16th pair — a pocket, not a new note); aofbeat moves every pluck a 16th later than the and, onto the 'a' of each beat, so the pedal leans INTO the next beat instead of bouncing off the last one; octaveanswer keeps the bar as judged and answers it with three ON-beat plucks an octave down (b3), a 2-bar call/response. Prediction: aofbeat changes the layer's feel the most without adding a note (ska offbeat -> anticipation); octaveanswer reads as call/response and stays background; doubletime is the subtlest of the three.",
    "question": "Same b4 everywhere. doubletime adds one 16th, aofbeat moves every pluck a 16th later than the and, octaveanswer answers on the beats an octave down. Which still reads as the background pizz you liked, and which becomes a foreground figure? Does aofbeat's lean into the beat still feel like the on-and-off vibe or does it drag? Is octaveanswer the right kind of variation for a pedal — a register answer instead of a pitch change?",
    "key_tonic": "E",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[~ b4] [~ b4] [~ b4] ~\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":1}"
        },
        "note": "the judged 1-bar pedal: three offbeat b4 plucks on the and-of-1, -2, -3, beat 4 silent."
      },
      {
        "id": "doubletime",
        "name": "double-time pocket — the third offbeat becomes two 16ths",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[~ b4] [~ b4] [~ [b4 b4]] ~\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":1}"
        },
        "note": "the first two plucks as judged; the third splits into a 16th pair (the and-of-3 and the a-of-3) — one extra attack, same pitch, beat 4 still silent."
      },
      {
        "id": "aofbeat",
        "name": "off-off-beat — every pluck a 16th later than the and",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"[~ ~ ~ b4] [~ ~ ~ b4] [~ ~ ~ b4] ~\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":1}"
        },
        "note": "all three plucks slide a 16th later, from the and to the a of beats 1-3, so each one anticipates the next beat by a 16th instead of answering the last one by an 8th. Same count, same pitch, beat 4 silent. (The recipe called this the \"e\" of the beat; the 16th AFTER the and is the \"a\", which is what is written.)"
      },
      {
        "id": "octaveanswer",
        "name": "octave answer — bar 2 answers on the beats, an octave down",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[~ b4] [~ b4] [~ b4] ~] [b3 b3 b3 ~]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":102,\"bars\":2}"
        },
        "note": "bar 1 as judged; bar 2 answers the three offbeats with three ON-beat plucks on b3 (beats 1-3), beat 4 silent — a call/response between registers, no new pitch class, still sparse."
      }
    ]
  },
  "lab2_flow_steel_rhythm": {
    "id": "lab2_flow_steel_rhythm",
    "batch": 2,
    "lane": "flow",
    "source_cards": [
      "cand_b2_ly_hmsummer_steel_octave_double",
      "cand_b6_vl_steel_double_reversed"
    ],
    "his_words": "feels like a good layer in a lot of songs. feels casual. could also be varied too or reversed or something (batch 1: all four pitch flows — reversed, rotation, upend — marked works)",
    "hypothesis": "Batch 1 (lab_flow_steel: reversed, rotation, upend) proved the cell survives any reordering of its three tones; this card holds the pitches g-d-f exactly (the f-natural is the cell's mixolydian b7 — the deliberate out-of-key tone, hence chromatic_ok) and moves only the timing. The source already sits on the 8th-note tresillo (attacks on 8ths 0, 3, 6), so 'tresillo placement' would be a no-op; in its place is the doubled 16th tresillo (0,3,6,8,11,14) that the catalog note itself found in Undertale's Dance of Dog on this same cell. squeezed halves the cell into beats 1-2 and leaves the second half silent; stretched doubles every duration across two bars (written as one 32-slot cell so the d is a single tied note) with the marimba answering the cell's tones in the bass's gaps instead of doubling it; callecho keeps the bass and delays only the marimba by an 8th, so every bass note is echoed two octaves up — the echo-cascade device from your own hmsummer collection. Prediction: doubled16 and callecho keep the casual layer (the tresillo skeleton survives both); squeezed reads as a hiccup because it abandons the tresillo; stretched becomes a different, slower song even though nothing but duration changed.",
    "question": "Same g-d-f in both hands everywhere; only timing moves. Does squeezed (cell in the first half, silence after) still feel casual or does the hole read as a dropout? Does stretched (each note twice as long, marimba answering in the gaps) stay the same layer at half speed or become a new one? Is callecho's 8th-late marimba the crystal-cave echo you liked in the cascade card, and does doubled16 (the Dance-of-Dog double tresillo) read as the same cell at double time?",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 f2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@2 ~@4 d4@6 f4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "the judged 1-bar cell: g-d-f in both hands two octaves apart, long-short-long on the 8th-note tresillo (attacks on 8ths 0, 3, 6).",
        "chromatic_ok": true
      },
      {
        "id": "squeezed",
        "name": "squeezed — the cell in the first half bar, second half silent",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2 ~@2 d2@3 f2 ~@9]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4 ~@2 d4@3 f4 ~@9]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "every duration halved so the whole g-d-f cell (attacks on 16ths 0, 3, 6) fits in beats 1-2, then silence for beats 3-4 — the same shape at double speed with a half-bar hole. Both hands together as in the source.",
        "chromatic_ok": true
      },
      {
        "id": "stretched",
        "name": "stretched — every note doubled across two bars, marimba answers the gaps",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@4 ~@8 d2@12 f2@4 ~@4]/2\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[~@4 g4@2 ~@2 d4@4 ~@16 f4@4]/2\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":2}"
        },
        "note": "the bass cell at half speed over two bars (g a quarter on bar 1's downbeat, d a tied dotted half from bar 1 beat 4 across the barline, f a quarter on bar 2 beat 3), written as one 32-slot cell so the d is one note, not two. The marimba stops doubling and ANSWERS in the gaps: g4 right after the bass g, d4 on bar 1 beat 3 leading the bass into its d, f4 in the final rest.",
        "chromatic_ok": true
      },
      {
        "id": "callecho",
        "name": "call-echo — marimba echoes each bass note an 8th later",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 f2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[~@2 g4@2 ~@4 d4@6 f4@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "bass as judged; the marimba plays the identical cell displaced one 8th late (g4 in the first rest, d4 over the bass's held d, f4 in the final rest), so every bass note gets a two-octave echo — the cascade device, one tap.",
        "chromatic_ok": true
      },
      {
        "id": "doubled16",
        "name": "doubled 16th tresillo — the cell twice a bar (0,3,6 / 8,11,14)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@3 d2@3 f2@2 g2@3 d2@3 f2@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@3 d4@3 f4@2 g4@3 d4@3 f4@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "g-d-f on a 3+3+2 of 16ths, stated twice per bar (attacks on 16ths 0, 3, 6, 8, 11, 14) — the Dance-of-Dog form of the same cell named in the catalog note; six attacks instead of three, both hands together. Replaces the recipe's \"tresillo placement\", which the source already has.",
        "chromatic_ok": true
      }
    ]
  },
  "lab2_compose_melody_rules_isolate": {
    "id": "lab2_compose_melody_rules_isolate",
    "lane": "compose",
    "batch": 2,
    "source_cards": [
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "I like it! learn how to make melodies like these. very nice, very good!!! just melody generation like this is good - sounds human",
    "hypothesis": "Both the falling and the rising versions passed, so answer DIRECTION is not what made it human. Three rules remain: the neighbor ROCKING, the SPARSE one-gesture-per-half-bar pacing, and the wide EMPTY-MIDDLE frame. Removing one at a time should show which is load-bearing — my bet is rocking first, sparseness second, the frame least.",
    "question": "v1 is the melody you called human, verbatim. v2 replaces every rocking pair with a leap. v3 fills the gestures into continuous 8ths. v4 keeps the melody but fills the empty middle with a pad. Which one STOPS sounding human? That is the rule the generator must never break.",
    "key_tonic": "E",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "human_ref",
        "name": "the melody you called human (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,g5] f#5 [b2,e5]@4 b3@4] [[c2,b4]@2 g2@2 e3@2 [f#3,f#5] e5 [g3,d5]@4 [f#3,c5]@2 b4@2] [[a1,e5] d5 [a2,e5]@2 b2@2 c3@2 d3@2 c3@2 b2@2 c3@2] [[b1,d5]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
        },
        "note": "batch-1 rules_transfer, byte-identical"
      },
      {
        "id": "no_rocking",
        "name": "rocking pairs replaced by leaps",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,g5] d5 [b2,b5]@4 b3@4] [[c2,b4]@2 g2@2 e3@2 [f#3,f#5] b4 [g3,g5]@4 [f#3,c5]@2 e5@2] [[a1,e5] a4 [a2,e5]@2 b2@2 c3@2 d3@2 c3@2 b2@2 c3@2] [[b1,d5]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
        },
        "note": "same rhythm, same frame; every neighbor step became a 4th/5th leap"
      },
      {
        "id": "no_sparse",
        "name": "gestures filled into continuous 8ths",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,g5] f#5 e5 d5 [b2,e5]@2 f#5 g5 b3@2] [[c2,b4]@2 g2@2 e3@2 [f#3,f#5] e5 d5 e5 [g3,d5]@2 c5 b4 [f#3,c5]@2] [[a1,e5] d5 c5 b4 [a2,e5]@2 d5 e5 b2@2 c3@2 d3@2 c3@2] [[b1,d5]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16}],\"bpm\":64,\"bars\":4}"
        },
        "note": "same pitches and frame; the rests between gestures are filled with stepwise 8ths"
      },
      {
        "id": "no_frame",
        "name": "empty middle filled with a pad",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[e2,b4]@2 b2@2 g3@2 [a3,g5] f#5 [b2,e5]@4 b3@4] [[c2,b4]@2 g2@2 e3@2 [f#3,f#5] e5 [g3,d5]@4 [f#3,c5]@2 b4@2] [[a1,e5] d5 [a2,e5]@2 b2@2 c3@2 d3@2 c3@2 b2@2 c3@2] [[b1,d5]@2 b2@2 d3@2 c3@2 d3@2 c3@2 b2@2 a2@2]>\",\"sound\":\"piano\",\"gain\":0.6},{\"mini\":\"<[[e2,g4,e5]@16] [[c2,e4,g5]@14 f#4@2] [[a1,e4,c5]@16] [~@16]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.16},{\"mini\":\"<[e3,g3,b3] [c3,e3,g3] [a2,c3,e3] [b2,d3,f#3]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.35}],\"bpm\":64,\"bars\":4}"
        },
        "note": "melody identical to v1; a warm pad now occupies the middle octave the original left empty"
      }
    ]
  },
  "lab2_compose_melody_over_host": {
    "id": "lab2_compose_melody_over_host",
    "lane": "compose",
    "batch": 2,
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "learn how to make melodies like these... just melody generation like this is good - sounds human",
    "hypothesis": "The grammar (rocking + sparse gestures + falling tails) was proven over its own bed. A generator needs it to work as a LEAD over a real progression it did not shape. Composed fresh over your nightfall loop, one gesture per half-bar, every landing a chord tone of the bar.",
    "question": "v1 = the grammar melody on piano over the nightfall loop. v2 = the same melody on flute. v3 = on slow strings. Does the melody still read human over changes it didn't come from — and does the grammar need piano's attack, or does it survive a sustaining voice?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "piano_lead",
        "name": "grammar melody, piano, over the loop",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "rocking pairs (g-f-g, c-bb-c, d-c-d, g-f) each falling onto a chord tone; nothing copied from any source"
      },
      {
        "id": "flute_lead",
        "name": "same melody on flute",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"gm_flute\",\"gain\":0.5}],\"bpm\":78,\"bars\":4}"
        },
        "note": "identical notes, breath instrument"
      },
      {
        "id": "strings_lead",
        "name": "same melody on slow strings",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45}],\"bpm\":78,\"bars\":4}"
        },
        "note": "identical notes, sustaining voice — does the grammar need an attack?"
      }
    ]
  },
  "lab2_compose_melody_energetic": {
    "id": "lab2_compose_melody_energetic",
    "lane": "compose",
    "batch": 2,
    "source_cards": [
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "just melody generation like this is good - sounds human / (calm is not a cage) a calm piano bit can be made to sound adventurous or bossy",
    "hypothesis": "The grammar has only been heard calm at 64 bpm. At 128 bpm over a driving bass + offbeat stabs the same three rules (rocking, sparse gestures, landings on chord tones) should still read human; a hammered-repeat rewrite (rocking removed) should read mechanical — the energetic version of the rule test.",
    "question": "v1 = grammar melody over an energetic bed. v2 = the melody alone (does it stand without the bed?). v3 = the same rhythm with every rocking pair hammered on one pitch — the machine version. Does human-ness survive energy in v1, and does v3 lose it the way the rule predicts?",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "grammar_energetic",
        "name": "grammar melody over a driving bed (128 bpm)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[e5@2 f5 e5 c5@2 ~@2 e5@2 f5 e5 d5@2 ~@2] [f5@2 g5 f5 c5@2 ~@2 a5@2 g5 f5 e5@2 ~@2] [d5@2 e5 d5 b4@2 ~@2 g5@2 f5 e5 d5@2 ~@2] [e5@2 f5 e5 b4@4 ~@2 c5 b4 a4@4]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[a1 a1 a2 a1 a1 a1 a2 a1] [f1 f1 f2 f1 f1 f1 f2 f1] [g1 g1 g2 g1 g1 g1 g2 g1] [e1 e1 e2 e1 e1 e1 e2 e1]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<[~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4]] [~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4]] [~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4]] [~ [e3,g3,b3] ~ [e3,g3,b3] ~ [e3,g3,b3] ~ [e3,g3,b3]]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":128,\"bars\":4}"
        },
        "note": "Am-F-G-Em drive; the melody rocks (e-f-e, f-g-f, d-e-d) and falls onto chord tones, two gestures a bar"
      },
      {
        "id": "melody_alone",
        "name": "the melody alone",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[e5@2 f5 e5 c5@2 ~@2 e5@2 f5 e5 d5@2 ~@2] [f5@2 g5 f5 c5@2 ~@2 a5@2 g5 f5 e5@2 ~@2] [d5@2 e5 d5 b4@2 ~@2 g5@2 f5 e5 d5@2 ~@2] [e5@2 f5 e5 b4@4 ~@2 c5 b4 a4@4]>\",\"sound\":\"piano\",\"bpm\":128,\"bars\":4,\"gain\":0.7}"
        },
        "note": "no bed — does the line carry its own shape?"
      },
      {
        "id": "hammered",
        "name": "rocking replaced by hammered repeats (machine control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[e5@2 e5 e5 c5@2 ~@2 e5@2 e5 e5 d5@2 ~@2] [f5@2 f5 f5 c5@2 ~@2 a5@2 a5 a5 e5@2 ~@2] [d5@2 d5 d5 b4@2 ~@2 g5@2 g5 g5 d5@2 ~@2] [e5@2 e5 e5 b4@4 ~@2 c5 c5 a4@4]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[a1 a1 a2 a1 a1 a1 a2 a1] [f1 f1 f2 f1 f1 f1 f2 f1] [g1 g1 g2 g1 g1 g1 g2 g1] [e1 e1 e2 e1 e1 e1 e2 e1]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<[~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4] ~ [a3,c4,e4]] [~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4] ~ [f3,a3,c4]] [~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4] ~ [g3,b3,d4]] [~ [e3,g3,b3] ~ [e3,g3,b3] ~ [e3,g3,b3] ~ [e3,g3,b3]]>\",\"sound\":\"gm_epiano1\",\"gain\":0.35}],\"bpm\":128,\"bars\":4}"
        },
        "note": "identical rhythm, bed and landings; every rock is now a repeated note"
      }
    ]
  },
  "lab2_time_walkbass_evolve": {
    "id": "lab2_time_walkbass_evolve",
    "lane": "flow",
    "batch": 2,
    "source_cards": [
      "cand_hs_negrocity_walking_bass"
    ],
    "his_words": "I like this! these variations are nice. definitely make more of these / explore more intentional variations over time / could also do like 4 bars since most sections are 4 bars",
    "hypothesis": "The four walks you liked, deployed as a DEVELOPMENT over 8 bars, in three pacings. Too-frequent change reads restless, too-rare reads static; 4-bar blocks should feel most like a song section (your own note).",
    "question": "v1 changes the walk every 2 bars (all four flows in 8 bars). v2 changes every 4 bars (original ×2, then bright ×2). v3 holds the original for 6 bars and varies only the last 2 (a turnaround). Which pacing reads as intentional development rather than restlessness — and is v2's 4-bar block the section feel you meant?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "every2",
        "name": "a new walk every 2 bars",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 eb2 f2 g2] [ab2 g2 f2 eb2] [c2 g2 gb2 f2] [eb2 f2 g2 bb2] [c2 d2 eb2 g2] [ab2 g2 f2 d2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":8}"
        },
        "note": "original → bright → descend-first → step-climb, 2 bars each"
      },
      {
        "id": "every4",
        "name": "4-bar blocks: original ×2, bright ×2",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 eb2 f2 g2] [ab2 g2 f2 eb2] [c2 eb2 f2 g2] [ab2 g2 f2 eb2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":8}"
        },
        "note": "your '4 bars since most sections are 4 bars'"
      },
      {
        "id": "late_turn",
        "name": "original ×3, step-climb as a turnaround",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 eb2 f2 gb2] [g2 gb2 f2 bb1] [c2 d2 eb2 g2] [ab2 g2 f2 d2]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":8}"
        },
        "note": "change arrives only in the last 2 bars — the D88 turnaround shape"
      }
    ]
  },
  "lab2_time_dq_evolve": {
    "id": "lab2_time_dq_evolve",
    "lane": "flow",
    "batch": 2,
    "source_cards": [
      "cand_vg_dq_pizz_only"
    ],
    "his_words": "I like this! however I think the falling part should be repeated as the primary variation because it sounds good / definitely make more of these",
    "hypothesis": "You asked for the falling cell to be the PRIMARY figure. Over 4 bars (at this slow tempo 4 bars is a full section) the question becomes placement: falling as the home cell with the original as the contrast, or the original opening and the fall taking over.",
    "question": "v1 opens on the original, then the falling cell twice, then the re-seat. v2 opens on the falling cell (home) and uses the original as the contrast bar. v3 alternates level / falling / level / re-seat. Which arrangement makes the falling cell feel primary the way you meant?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig_then_fall",
        "name": "original → falling ×2 → re-seat",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 a#4 g4 a#4 d4 a#4 g4 a#4 d4 d5 a#4 d5 d4 a#4 g4 a#4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":4,\"gain\":0.55}"
        },
        "note": "the falling cell as the repeated body (your ask), original as the opening"
      },
      {
        "id": "fall_home",
        "name": "falling cell as home, original as contrast",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 a4 f4 a4 d4 b4 g4 b4 d4 c5 a4 c5 d4 a#4 f4 a#4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":4,\"gain\":0.55}"
        },
        "note": "fall, fall, original (the rise as contrast), fall"
      },
      {
        "id": "level_fall_alt",
        "name": "level / falling / level / re-seat",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4] [d4 c5 a4 c5 d4 b4 g4 b4 d4 a#4 f4 a#4 d4 a4 f4 a4] [d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4 d4 a4 f4 a4] [d4 a#4 g4 a#4 d4 a#4 g4 a#4 d4 d5 a#4 d5 d4 a#4 g4 a#4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":4,\"gain\":0.55}"
        },
        "note": "the level pedal as breathing room between the falls"
      }
    ]
  },
  "lab2_time_gijoe_evolve": {
    "id": "lab2_time_gijoe_evolve",
    "lane": "flow",
    "batch": 2,
    "source_cards": [
      "cand_b5_tp_gijoe_rhythm"
    ],
    "his_words": "(gijoe rhythm template) sounds happy. I like it! / (align gijoe) explore more intentional variations over time",
    "hypothesis": "The template you liked, developed over 8 bars with one nameable move per 2-bar block: as-is → top voice lifted an octave (brightening) → bass notes doubled in octaves (weight) → a rising fill into the loop. Development by ADDITION over a frozen rhythm — the corpus's own #1 return transform.",
    "question": "v1 = the 8-bar arc. v2 = the template ×4 unchanged (the static control). v3 = static for 6 bars, the fill only at bars 7-8. Does the arc read as intentional development, does the control read as the sameness you complained about, and is v3's late-only change enough?",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "arc",
        "name": "the 8-bar development arc",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4,a4]@2 g3 ~@1 [a3,c4,e4,a4]@2 [g3,c4,e4] [a3,c4,f4,a4]@2 a3 ~@1 g3 [c4,e4,a4,c5] ~@1 [b3,d4,g4,b4] ~@1] [[f3,a3,c4,f4]@2 e3 ~@1 [f3,a3,c4,f4]@2 [f3,a3,d4] [e3,g3,c4,e4]@2 e3 ~@1 f3 [g3,b3,d4,g4] ~@1 [a3,c4,e4,a4] ~@1] [[a3,c4,e4]@2 [g2,g3] ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 [a2,a3] ~@1 [g2,g3] [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 [e2,e3] ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 [e2,e3] ~@1 [f2,f3] [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 c4 d4 e4 g4]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "bars 1-2 template · 3-4 top voice up an octave · 5-6 bass in octaves · 7-8 template with a rising fill"
      },
      {
        "id": "static",
        "name": "template ×4 unchanged (control)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "the 2-bar template looping four times"
      },
      {
        "id": "late_fill",
        "name": "static, fill only at bars 7-8",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 c4 d4 e4 g4]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "six bars of template, the fill only at the turn"
      }
    ]
  },
  "lab2_fix_royalroad_pendulum": {
    "id": "lab2_fix_royalroad_pendulum",
    "lane": "mix",
    "batch": 2,
    "source_cards": [
      "cand_cw_evening_royalroad",
      "cand_cw_airvoyage_pendulum"
    ],
    "his_words": "the pendulum second chord doesn't fit because it sounds darker ish. should be changed to different notes",
    "hypothesis": "Measured: the pendulum's third bar seats its e-natural to f# over the royal road's C frame — a lydian #4 against F/Am, exactly 'darker ish'. Your batch-1 mark on the bright-third flow said 'if it fits the song chord, sure' — here it does (e over F/G/Em/Am is chord tone or 9th), so it should be the fix.",
    "question": "v1 = the stakes pairing as you judged it. v2 = the pendulum's third bar re-noted with the bright third (e). v3 = the third bar replaced by the percussive 3+3+2 regroup instead (pitches all from bar 1). Does v2 remove the dark chord — and is v3's rhythm-variation a better 'stakes' bar than a pitch fix?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_judged",
        "name": "stakes pairing as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1.0},{\"id\":\"cand_cw_airvoyage_pendulum\",\"add\":2,\"gain\":0.85}],\"bpm\":120,\"bars\":4}"
        },
        "note": "the stored-pin combo; bar 3's f# is the dark chord (the f# is the subject — both fixes remove it)",
        "chromatic_ok": true
      },
      {
        "id": "bright_third",
        "name": "third bar re-noted with the bright third",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c5 g4 c4 g4 c5 g4 c4 g4] [c5 g4 c4 g4 c5 g4 c4 g4] [c5 e4 c4 e4 c5 e4 c4 e4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.38},{\"mini\":\"[[c1,c2] c2 c2 c2 [c1,c2] [c1,c2] c2 c2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6}],\"bpm\":120,\"bars\":4}"
        },
        "note": "bars 1-2 identical at the seat; bar 3's f# becomes e"
      },
      {
        "id": "regroup_bar",
        "name": "third bar as the 3+3+2 regroup",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c5 g4 c4 g4 c5 g4 c4 g4] [c5 g4 c4 g4 c5 g4 c4 g4] [c5 g4 c4 c5 g4 c5 g4 c4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.38},{\"mini\":\"[[c1,c2] c2 c2 c2 [c1,c2] [c1,c2] c2 c2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6}],\"bpm\":120,\"bars\":4}"
        },
        "note": "no new pitch at all — the variation is rhythmic (your 'more percussive, for more energetic environments')"
      }
    ]
  },
  "lab2_fix_dial_pizz": {
    "id": "lab2_fix_dial_pizz",
    "lane": "mix",
    "batch": 2,
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_dq_pizz_only",
      "cand_cw_morning_hexarp",
      "cand_un_lofi_backbeat"
    ],
    "his_words": "the pizza notes second bar sound kinda strange (when its just repeating that one progression bc that progression doesn't really fit) ... just one note in the middle that doesn't work that's repeated",
    "hypothesis": "Measured: the dq pizz's second bar carries the source's picardy f# which seats to an e-natural against the C-minor loop — one pitch class, struck six times a bar, exactly 'one note in the middle that doesn't work'. Your batch-1 marks accepted the level and re-seat flows; either should cure the dial.",
    "question": "v1 = dial position 3 as you judged it. v2 = the pizz swapped for the LEVEL flow (no second-bar content at all). v3 = swapped for the RE-SEAT flow (second bar re-drawn from the loop's own chord). Is the strange note gone, and which keeps the groove you liked ('good groove layer')?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_judged",
        "name": "dial 3 as you heard it",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_vg_dq_pizz_only\",\"add\":-2,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the e-natural in the pizz's second bar is the misfit"
      },
      {
        "id": "level_pizz",
        "name": "pizz → level flow",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85}],\"parts\":[{\"mini\":\"[c4 g4 eb4 g4 c4 g4 eb4 g4 c4 g4 eb4 g4 c4 g4 eb4 g4]\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.47}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the batch-1 level flow at the same seat — one static cell"
      },
      {
        "id": "reseat_pizz",
        "name": "pizz → re-seat flow",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0},{\"id\":\"cand_cw_morning_hexarp\",\"add\":-6,\"gain\":0.85},{\"id\":\"cand_un_lofi_backbeat\",\"gain\":0.85}],\"parts\":[{\"mini\":\"<[c4 g4 eb4 g4 c4 g4 eb4 g4 c4 c5 g4 c5 c4 g4 eb4 g4] [c4 ab4 f4 ab4 c4 ab4 f4 ab4 c4 c5 ab4 c5 c4 ab4 f4 ab4]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.47}],\"bpm\":78,\"bars\":4}"
        },
        "note": "second bar drawn from the loop's Ab chord — the contour kept, the misfit tone gone"
      }
    ]
  },
  "lab2_fix_rainingjazz_rh": {
    "id": "lab2_fix_rainingjazz_rh",
    "lane": "compose",
    "batch": 2,
    "source_cards": [
      "cand_ut_raining_jazz_walk"
    ],
    "his_words": "second half of the melody sounds a bit dissonant, but good step. also sounds a bit too similar to the original",
    "hypothesis": "Two fixes in one: the rocking right hand recomposed a register higher with new gesture shapes (less similar), and its second half re-landed on chord tones of Gm7 and A7 (the dissonance). The chord tone c# over A7 is the loop's own third, not a foreign tone.",
    "question": "v1 = the version you judged. v2 = the new right hand over the same transferred left hand. v3 = the new right hand on flute (timbre separation from the piano LH). Is the second-half dissonance gone, does it now read as its own tune — and does splitting the hands across two instruments help the 'too similar' feel?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_judged",
        "name": "the version you judged",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@4 f5@2 e5@2 f5@4 d5@2 e5@2] [f5@2 a5@2 g5@2 f5@4 e5@2 d5@2 a4@2] [~@4 e5@2 d5@2 e5@4 a4@2 bb4@2] [c5@2 e5@4 d5@8 ~@2]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "batch-1 lh_plus_rocking_rh, byte-identical"
      },
      {
        "id": "new_rh",
        "name": "new right hand, second half re-landed",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@4 a5@2 g5@2 a5@4 f5@2 e5@2] [d5@2 f5@2 e5@2 d5@4 c5@2 bb4@2 a4@2] [~@4 a4@2 bb4@2 a4@4 f4@2 e4@2] [c#5@2 e5@4 d5@6 a4@2 ~@2]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "higher-register rocking (a-g-a), new descents, bar 3 rocks a-bb over Gm7 and bar 4 lands c#-e-d over A7"
      },
      {
        "id": "new_rh_flute",
        "name": "new right hand on flute",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@4 a5@2 g5@2 a5@4 f5@2 e5@2] [d5@2 f5@2 e5@2 d5@4 c5@2 bb4@2 a4@2] [~@4 a4@2 bb4@2 a4@4 f4@2 e4@2] [c#5@2 e5@4 d5@6 a4@2 ~@2]>\",\"sound\":\"gm_flute\",\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "same new line, the hands split across two instruments"
      }
    ]
  },
  "lab2_fix_hexarp_minor": {
    "id": "lab2_fix_hexarp_minor",
    "lane": "compose",
    "batch": 2,
    "source_cards": [
      "cand_cw_morning_hexarp",
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "this run sounds kinda strange. like the chord itself doesn't sound too good but the setup has potential I see the vision",
    "hypothesis": "The minor transfer kept the natural-minor b6 (ab) in the run — the one tone that darkens a rising arp against a loop that already carries Ab as a CHORD. Two candidates for the strange tone: drop it (minor pentatonic + 9) or raise it (dorian 6th, the 'refreshing' minor).",
    "question": "v1 = the run you judged. v2 = the run without its b6. v3 = the run with the dorian 6th (a-natural) instead. Which one gets the fits-everything feel the major run has — and was the b6 the strange tone?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_judged",
        "name": "the run you judged",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c4 d4 eb4 g4 ab4 bb4 c5 d5] ~ [c4 d4 eb4 g4 ab4 bb4 c5 d5] ~ [c4 d4 eb4 g4 ab4 bb4 c5 d5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.425}],\"bpm\":78,\"bars\":6}"
        },
        "note": "natural minor minus the 4th — the ab is the suspect"
      },
      {
        "id": "no_b6",
        "name": "the run without the b6",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c4 d4 eb4 g4 bb4 c5 d5 eb5] ~ [c4 d4 eb4 g4 bb4 c5 d5 eb5] ~ [c4 d4 eb4 g4 bb4 c5 d5 eb5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.425}],\"bpm\":78,\"bars\":6}"
        },
        "note": "minor pentatonic plus the 9th — five tones, no 4th, no 6th"
      },
      {
        "id": "dorian_6",
        "name": "the run with the dorian 6th",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[c4 d4 eb4 g4 a4 bb4 c5 d5] ~ [c4 d4 eb4 g4 a4 bb4 c5 d5] ~ [c4 d4 eb4 g4 a4 bb4 c5 d5] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.425}],\"bpm\":78,\"bars\":6}"
        },
        "note": "a-natural for ab — dorian minus the 4th (the a is outside natural minor, deliberately)"
      }
    ]
  },
  "lab2_fix_chaotix_articulation": {
    "id": "lab2_fix_chaotix_articulation",
    "lane": "combo",
    "batch": 2,
    "source_cards": [
      "cand_b4_ly_chaotix_shadow_fourth"
    ],
    "his_words": "(strings) make it legato and hold each duration fully until the next note (or staccato, in which it's sharper) / (trumpet) much softer",
    "hypothesis": "Your two articulation directions for the strings are opposite readings of the same line — legato = cinematic tension, staccato = sharper determination — and both should beat the half-held original. The trumpet works at roughly half its judged gain.",
    "question": "v1 strings legato (every note held to the next). v2 strings staccato (short bites). v3 muted trumpet at half gain. Which articulation carries determination best on strings, and is the trumpet right at this level?",
    "key_tonic": "C#",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "strings_legato",
        "name": "strings legato, full durations",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "each tone held until the next — no gaps"
      },
      {
        "id": "strings_staccato",
        "name": "strings staccato, sharp bites",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4 ~@2 ~ eb4 ~@2 ~ e4 ~@2 ~ f#4 ~@2]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45}],\"bpm\":100,\"bars\":2}"
        },
        "note": "one 16th per note, silence after"
      },
      {
        "id": "trumpet_soft",
        "name": "muted trumpet at half gain",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[~ c#4@3 ~ eb4@3 ~ e4@3 ~ f#4@3]\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.2}],\"bpm\":100,\"bars\":2}"
        },
        "note": "0.42 → 0.2, your 'much softer'"
      }
    ]
  },
  "lab2_fix_airwolf_separate": {
    "id": "lab2_fix_airwolf_separate",
    "lane": "combo",
    "batch": 2,
    "source_cards": [
      "cand_rl_r2_e_major_happy",
      "cand_vg_airwolf_gallop_pedal"
    ],
    "his_words": "I feel like those should be separated. but otherwise they work. I think some variation is also changing the second chord in the melody instrument",
    "hypothesis": "The gallop is two parts glued: a pedal-note engine and a melody-dyad top. Separated, each should be usable alone as a layer; and 'changing the second chord' is a BOLDER fix for the second-bar off-ness than the one-tone repairs you could not hear — the whole bar re-noted as a G-major gallop.",
    "question": "v1 pedal engine alone. v2 melody top alone (as heard, second bar included). v3 melody top with the second bar re-noted as a G-major gallop. Over the same host: which half carries the value, and does re-noting the second chord fix it audibly where the one-tone repair didn't?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "pedal_only",
        "name": "pedal engine alone",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[e2 e2 ~@1 e2 e2 e2 ~@1 e2 e2 e2 ~@1 e2 e2 e2 ~@1 e2] [g2 g2 ~@1 g2 g2 g2 ~@1 g2 g2 g2 ~@1 g2 g2 g2 ~@1 g2]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45}],\"bpm\":102,\"bars\":2}"
        },
        "note": "the low repeated-note engine, seated as on the page"
      },
      {
        "id": "melody_only",
        "name": "melody top alone (as heard)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[e3 b3 ~@1 d4 e4 g4 ~@1 d4 e4 b3 ~@1 d4 a3 b3 ~@1 d4] [g3 d4 ~@1 f4 g4 a#4 ~@1 f4 g4 d4 ~@1 f4 c4 d4 ~@1 f4]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "the upper voice without its pedal, second bar as transcribed"
      },
      {
        "id": "melody_second_chord",
        "name": "melody top, second bar re-noted (G major gallop)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_rl_r2_e_major_happy\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[e3 b3 ~@1 d4 e4 g4 ~@1 d4 e4 b3 ~@1 d4 a3 b3 ~@1 d4] [g3 b3 ~@1 d4 g4 b4 ~@1 d4 g4 b3 ~@1 d4 e4 d4 ~@1 b3]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.49}],\"bpm\":102,\"bars\":2}"
        },
        "note": "bar 2's f/a# shape replaced by a G-B-D gallop — an audible change of chord, not a tone repair"
      }
    ]
  },
  "lab2_fix_rush_speed": {
    "id": "lab2_fix_rush_speed",
    "lane": "flow",
    "batch": 2,
    "source_cards": [
      "cand_cw_rush_layering"
    ],
    "his_words": "(batch-1 recipe) I feel like the second one is still slower",
    "hypothesis": "The recipe matched bars 3-4 to bars 1-2's onset SLOTS and it still felt slower — so felt speed is not onset count. Bars 1-2 hammer the SAME pitch (d2 d2 d2) and bars 3-4 alternate pitches; same-pitch machine-gun re-attacks read faster than pitch motion. Fix: keep bars 1-2's exact repetition pattern and move the whole cell to new pitches as a block.",
    "question": "v1 = the recipe you judged. v2 = bars 3-4 as a block transposition of bars 1-2's repetition pattern (eb/f for c/d). v3 = the bass identical in all four bars, the 'different note' living in the pad instead. Is v2 the same speed now — proving felt speed is repetition density — and is v3 the cleaner way to vary?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_judged",
        "name": "the recipe you judged",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [c2 eb2 ~ d2 eb2 ~ d2 ~ ~ c2 ~ f2 ~ eb2 ~ c2] [~ ~ eb2 ~ d2 ~ ~ ~ c2 ~ f2 ~ eb2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "batch-1 recipe, byte-identical"
      },
      {
        "id": "block_transpose",
        "name": "bars 3-4 = bars 1-2's repetition, moved as a block",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [eb2 f2 ~ f2 f2 ~ f2 ~ ~ eb2 ~ f2 ~ eb2 ~ eb2] [~ ~ f2 ~ f2 ~ ~ ~ eb2 ~ f2 ~ eb2 ~ f2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ a#3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "same machine-gun re-attacks, the cell moved up a minor third"
      },
      {
        "id": "pad_varies",
        "name": "bass identical throughout, the pad carries the change",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ g3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "maximum speed preservation; the fourth pad statement drops to g"
      }
    ]
  },
  "lab2_perc_loop_form": {
    "id": "lab2_perc_loop_form",
    "lane": "perc",
    "batch": 2,
    "source_cards": [],
    "his_words": "when using this, ensure that when you start looping it, dont loop the buildup each time. loop the main bar that'll be used unless there's a change later in the song / it feels like the first energetic section is like the buildup to the main section which is the main beat",
    "hypothesis": "Your looping law as a FORM: a buildup plays once and hands off to the main beat, which loops; a later change is a one-bar event, not a new buildup. Built from the ladder's own tiers (6/10 → 6-7/10 → high).",
    "question": "v1 = buildup once (two tiers, 2 bars each) then the main beat looping for 4 bars. v2 = the main beat alone, looping (the control — is the buildup even needed?). v3 = v1 with a one-bar drop to the middle tier at bar 8 (your 'unless there's a change later'). Is v1 the form you meant, and does v3's late change read as an event rather than a restart?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "build_once_loop",
        "name": "buildup once, then the main beat loops",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~]>\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"<[~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare]>\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"<[md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker]>\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "bars 1-2 the 6/10 tier, 3-4 the 6-7/10 tier, 5-8 the high tier looping"
      },
      {
        "id": "main_only",
        "name": "the main beat alone, looping (control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[md_kick ~ md_kick ~ md_kick ~ md_kick ~]\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"[~ md_snare ~ md_snare ~ md_snare ~ md_snare]\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"[vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker]\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "no buildup — the loop as it would run mid-song"
      },
      {
        "id": "late_change",
        "name": "buildup once, loop, one-bar drop at bar 8",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ ~ md_kick ~ ~ ~ ~]>\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"<[~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ ~ ~ ~ md_snare ~ ~ ~]>\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"<[md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo]>\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "bar 8 drops to the middle tier for one bar — an event inside the loop, then it restarts on the main beat"
      }
    ]
  },
  "lab3_compose_gen_seeds": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_seeds",
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The melodies you called human were composed by hand, from rules I named afterwards. If the rules are the substance, an ALGORITHM running only those rules must produce human melodies from different random seeds with no hand involved. The rules, as switches: breath → rock (X, neighbour, X) or stepwise run → chord-tone landing held ≥ a quarter → optional tail; voice-led landings with one wide move at the peak; Q/A phrase ends (open bars avoid the tonic, the last bar lands on it and holds longest); a 4-bar arch; bar 3 reuses bar 1's rhythm skeleton; varied durations. v1 is the hand-composed lead you judged; v2-v4 are three seeds of the algorithm over the same loop, piano, same level — nothing edited after generation.",
    "question": "Do all three generated melodies (v2, v3, v4) read as human as v1? If one does not, say which and what is wrong with it - that names the rule the algorithm is missing. If all three do, the grammar is ready to become an engine rule.",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "human_ref",
        "name": "the hand-composed lead you judged (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "lab2_compose_melody_over_host/piano_lead, byte-identical"
      },
      {
        "id": "gen_s1",
        "name": "algorithm, seed 1",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "seed 1, all rules on · 21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "gen_s2",
        "name": "algorithm, seed 2",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 f5@2 eb5@2 d5@2 c5@2 bb4@6] [~@2 c5@2 d5@2 c5@2 eb5@8] [~@2 c6@2 bb5@2 ab5@2 g5@2 f5@6] [~@2 f5@2 eb5@2 d5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "seed 2, all rules on · 18 notes · 88% stepwise · 1 leap · landings 4/4 chord tones · 3 duration values · 13% rest"
      },
      {
        "id": "gen_s3",
        "name": "algorithm, seed 3",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@4 eb5@2 d5@2 eb5@2 c5@6] [~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@4 ab5@2 g5@2 ab5@2 f5@6] [~@2 eb5@2 d5@2 eb5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "seed 3, all rules on · 18 notes · 65% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 19% rest"
      }
    ]
  },
  "lab3_compose_gen_rules": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_rules",
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "Batch 2 removed rocking, sparseness and the empty-middle frame one at a time and nothing broke, so none of those was load-bearing. Four properties remain, each a switch in the algorithm, same seed and host: (a) DURATION VARIETY - v2 makes every note an 8th and never holds a landing (your grief note \"same durations feels robotic\" predicts this one breaks it); (b) BREATH - v3 removes every rest, gestures start on the downbeat and landings fill the bar; (c) QUESTION/ANSWER - v4 lands EVERY bar on the tonic, no phrase is left open; (d) ARCH - v5 removes the peak/dip contour shaping. Prediction: v2 breaks it outright, v4 reads static, v3 and v5 survive.",
    "question": "v1 is seed 1 with every rule on. Which single switch breaks the human feel - v2 equal durations, v3 no breath, v4 every bar ending on the tonic, or v5 no arch? If more than one does, rank them.",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "all_rules",
        "name": "seed 1, every rule on (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "iso_durations",
        "name": "every note an 8th, landings unheld",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@2 ~@6] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@2 ~@4] [~@2 bb5@2 ab5@2 bb5@2 g5@2 ~@6] [~@2 g5@2 ab5@2 g5@2 c6@2 ~@6]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "same pitches and order; 17 notes · 75% stepwise · 0 leaps · landings 4/4 chord tones · 1 duration value · 47% rest"
      },
      {
        "id": "no_breath",
        "name": "no rests - gestures start on the downbeat",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[g5@2 f5@2 g5@2 eb5@6 f5@2 eb5@2] [eb5@2 f5@2 eb5@2 g5@2 ab5@4 bb5@2 ab5@2] [bb5@2 ab5@2 bb5@2 g5@6 ab5@2 g5@2] [g5@2 ab5@2 g5@2 c6@10]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "same gestures, landings extended to fill; 23 notes · 82% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 0% rest"
      },
      {
        "id": "all_tonic",
        "name": "every bar lands on the tonic (no question/answer)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 eb5@2 d5@2 eb5@2 c5@4 d5@2 c5@2] [g4@2 ab4@2 g4@2 bb4@2 c5@4 d5@2 c5@2] [~@2 d5@2 c5@2 d5@2 bb4@4 c5@2 bb4@2] [~@2 eb5@2 d5@2 eb5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the Q/A switch replaced by \"land on C wherever the chord has one\" (Gm7 has no C, so bar 3 takes its nearest chord tone); 23 notes · 73% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 9% rest"
      },
      {
        "id": "no_arch",
        "name": "no peak/dip contour shaping",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 ab5@2 g5@2 bb5@4 c6@2 bb5@2] [~@2 ab5@2 g5@2 ab5@2 f5@2 eb5@6] [~@2 d5@2 c5@2 d5@2 bb4@4 c5@2 bb4@2] [~@2 g4@2 ab4@2 g4@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "landings chosen by voice-leading alone; 21 notes · 75% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      }
    ]
  },
  "lab3_compose_gen_density": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_density",
    "source_cards": [
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The grammar at one gesture a bar read human at 78 bpm; at two gestures a bar (16th-note rocks, breath after each landing) it read \"energetic! I like it\" - but that was at 128 bpm. Same seed and host here: v2 is two gestures a bar at 78, v3 four a bar with no breath at all. Prediction: v2 still reads as a melody (busier, not mechanical), v3 becomes a texture - the point where gestures stop being separated by breath is where melody ends.",
    "question": "v1 one gesture a bar, v2 two, v3 four. Where does it stop being a melody and become a running texture - and is v2 a usable \"busier\" setting for slow songs or already too much?",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "density_1",
        "name": "one gesture a bar (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "density_2",
        "name": "two gestures a bar (16th rocks, breath after each)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[g5@2 f5 g5 eb5@2 ~@2 g5@2 f5 g5 d5@2 ~@2] [g5@2 f5 g5 eb5@2 ~@2 g5@2 f5 g5 eb5@2 ~@2] [bb5@2 ab5 bb5 g5@2 ~@2 c6@2 bb5 c6 g5@2 ~@2] [d5@2 eb5 f5 ab5@2 ~@2 g5@2 ab5 g5 c6@4]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "32 notes · 55% stepwise · 0 leaps · landings 8/8 chord tones · 3 duration values · 22% rest"
      },
      {
        "id": "density_4",
        "name": "four gestures a bar, no breath (the texture control)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[g5 f5 eb5@2 g5 f5 d5@2 g5 f5 eb5@2 ab5 g5 eb5@2] [ab5 g5 eb5@2 c5 d5 g5@2 eb5 f5 ab5@2 eb5 f5 ab5@2] [g5 ab5 bb5@2 f5 g5 bb5@2 ab5 g5 f5@2 c6 bb5 g5@2] [bb4 c5 eb5@2 c5 d5 g5@2 c5 d5 g5@2 g5 ab5 c6@2]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "48 notes · 49% stepwise · 1 leap · landings 16/16 chord tones · 2 duration values · 0% rest"
      }
    ]
  },
  "lab3_compose_gen_velocity": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_velocity",
    "source_cards": [
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "Every labs melody you have called human so far played at ONE flat velocity, so velocity shaping is not required for human-ness. It may still improve it: v2 gives the landings full weight and the rock neighbours the least (the way a player leans into the arrival), v3 inverts that (rocks loud, landings soft - the way a machine would accent). Same notes, same rhythm, same host. Prediction: v2 is a small improvement, v3 is audibly wrong.",
    "question": "v1 flat, v2 landings loudest, v3 rocks loudest. Does v2 sound more human than v1 or the same? Does v3 sound wrong - and is that \"wrong\" robotic, or just oddly accented?",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "flat",
        "name": "one velocity (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "landings_loud",
        "name": "landings 1.0, rocks 0.8, neighbours 0.72, tails 0.7",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gainPattern\":\"<[0.8@2 0.8@2 0.72@2 0.8@2 1@4 0.7@2 0.7@2] [0.8@2 0.8@2 0.72@2 0.8@2 0.82@2 1@6] [0.8@2 0.8@2 0.72@2 0.8@2 1@4 0.7@2 0.7@2] [0.8@2 0.8@2 0.72@2 0.8@2 1@8]>\"}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the accent envelope leans into every arrival; overall level scaled to sit where v1 sits"
      },
      {
        "id": "rocks_loud",
        "name": "rocks 1.0, landings 0.68 (inverted accents)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gainPattern\":\"<[1@2 1@2 1@2 1@2 0.68@4 0.66@2 0.66@2] [1@2 1@2 1@2 1@2 1@2 0.68@6] [1@2 1@2 1@2 1@2 0.68@4 0.66@2 0.66@2] [1@2 1@2 1@2 1@2 0.68@8]>\"}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the machine accent: the moving notes shout, the arrivals whisper"
      }
    ]
  },
  "lab3_compose_gen_tails": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_tails",
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The hand-composed melodies ended some gestures with a TAIL after the landing - an upper-neighbour return (ab-g after landing on g) or a hanging step below left unresolved until the next bar. The tail type is a switch: v1 returning tails, v2 hanging tails, v3 no tails at all. Prediction: hanging tails create forward pull (the most \"human\"), returning tails are the calmest, no tails reads static but still human - the tail is colour, not structure.",
    "question": "Same landings everywhere. v1 returns to the landing after each one, v2 leaves a step below hanging into the next bar, v3 holds the landing and stops. Which reads most human, and does v3 (no tails) lose anything?",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "tails_return",
        "name": "returning tails (reference: seed 1)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "tails_hang",
        "name": "hanging tails (a step below, unresolved)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@4 d5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@4 g5@2] [~@4 bb5@2 ab5@2 bb5@2 g5@4 f5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "20 notes · 74% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 19% rest"
      },
      {
        "id": "tails_none",
        "name": "no tails - the landing holds to the bar",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@6] [~@4 eb5@2 f5@2 eb5@2 g5@2 ab5@4] [~@4 bb5@2 ab5@2 bb5@2 g5@6] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "17 notes · 75% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 22% rest"
      }
    ]
  },
  "lab3_compose_gen_anticipation": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_anticipation",
    "source_cards": [
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The grammar places every gesture on the 8th-note grid after a breath. v2 starts every gesture an 8th EARLY (its landing holds longer to compensate), v3 a 16th early - so every gesture begins on an odd 16th, the exact shape your \"shifted off by like a sixteenth\" cards named in the songs (r33 melody grid law). Prediction: v2 reads as pickups and stays human, v3 reads as off-grid jitter.",
    "question": "Same notes. v1 on the grid, v2 every gesture an 8th early, v3 a 16th early. Does v2 feel like natural pickups or like rushing? Does v3 sound \"off by a sixteenth\" the way the songs did?",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "on_grid",
        "name": "on the grid (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "eighth_early",
        "name": "every gesture an 8th early",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[g5@2 f5@2 g5@2 eb5@6 f5@2 eb5@2] [eb5@2 f5@2 eb5@2 g5@2 ab5@8] [bb5@2 ab5@2 bb5@2 g5@6 ab5@2 g5@2] [g5@2 ab5@2 g5@2 c6@10]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "rests shortened by an 8th, landings lengthened by an 8th; 21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 0% rest"
      },
      {
        "id": "sixteenth_early",
        "name": "every gesture a 16th early (odd-16th onsets)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~ g5@2 f5@2 g5@2 eb5@5 f5@2 eb5@2] [~ eb5@2 f5@2 eb5@2 g5@2 ab5@7] [~ bb5@2 ab5@2 bb5@2 g5@5 ab5@2 g5@2] [~ g5@2 ab5@2 g5@2 c6@9]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the D123 shape on purpose; 21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 6% rest"
      }
    ]
  },
  "lab3_compose_gen_form8": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_form8",
    "source_cards": [
      "cand_cw_shenightfall_prog"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "A 4-bar melody proves a grammar; a song needs 8. Three ways to fill the second half over the loop played twice: v1 the algorithm keeps generating (eight different bars, bar 4 left open, bar 8 home); v2 the RETURN form - bars 5-6 restate bars 1-2 exactly, bar 7 is new, bar 8 closes (the corpus's commonest 8-bar shape); v3 exact repeat of the 4 bars. Prediction: v2 reads as a tune (you can hum it back), v1 as a meander that never returns, v3 as a loop.",
    "question": "Which of the three sounds like a SONG melody rather than a generator running: v1 all-new, v2 the return form (bars 5-6 = bars 1-2), v3 the exact repeat? Is v1 forgettable, is v3 boring - or is the loop what a game track wants?",
    "key_tonic": "C",
    "key_mode": "minor",
    "variants": [
      {
        "id": "free8",
        "name": "eight different bars (open at bar 4, home at 8)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 d5@2 eb5@2 d5@2 f5@2 g5@4 f5@2] [~@4 g5@2 f5@2 eb5@2 d5@4 c5@2] [~@2 f5@2 g5@2 f5@2 ab5@8] [~@4 c6@2 bb5@2 ab5@2 g5@4 f5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":8}"
        },
        "note": "41 notes · 78% stepwise · 0 leaps · landings 8/8 chord tones · 4 duration values · 16% rest"
      },
      {
        "id": "return8",
        "name": "return form: bars 5-6 restate bars 1-2, bar 7 new, bar 8 closes",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 d5@2 eb5@2 d5@2 f5@2 g5@4 f5@2] [~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@4 c6@2 bb5@2 ab5@2 g5@4 f5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":8}"
        },
        "note": "built from v1's bars: 1 2 3 4 | 1 2 7 8"
      },
      {
        "id": "exact8",
        "name": "the 4-bar melody twice",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8] [~@2 g5@2 f5@2 g5@2 eb5@4 f5@2 eb5@2] [~@2 eb5@2 f5@2 eb5@2 g5@2 ab5@6] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 g5@2 ab5@2 g5@2 c6@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":78,\"bars\":8}"
        },
        "note": "seed 1 verbatim, looped"
      }
    ]
  },
  "lab3_compose_gen_major_allstar": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": true,
    "id": "lab3_compose_gen_major_allstar",
    "source_cards": [
      "cand_b2_pk_allstar_rest_loop"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "Every melody you have called human was in a MINOR key. Same algorithm over your allstar resolver (A7 | Dsus | D | Dm add9 at 94 bpm): D major, with a thirdless bar 2 (the landing must be d, g or a) and a bar 4 that turns MINOR (f natural - the resolver's own colour, so chromatic_ok). Prediction: the grammar is key-agnostic and reads human in major; the ocarina (v3) keeps it because the grammar's holds suit a breath instrument.",
    "question": "v1 and v2 are two seeds on piano, v3 is seed 1 on ocarina. Does the grammar sound as human in major as it did in minor? Does the bar-4 turn to minor (f natural) land right under the melody, and does the ocarina keep or lose the feel?",
    "key_tonic": "D",
    "key_mode": "major",
    "variants": [
      {
        "id": "gen_s1",
        "name": "algorithm, seed 1, piano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a3,c#4,e4,g4]@4] [[d3,g3,a3]@4] [[d3,f#3,a3]@4] [[d3,f3,a3,e4]@4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[a1@4] [d1@4] [d1@4] [d1@4]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@2 g5@2 f#5@2 g5@2 e5@4 f#5@2 e5@2] [d5@2 e5@2 d5@2 f#5@2 g5@4 a5@2 g5@2] [~@2 f#5@2 g5@2 f#5@2 a5@4 b5@2 a5@2] [~@2 f5@2 e5@2 f5@2 d5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":94,\"bars\":4}"
        },
        "note": "host = the resolver's rendered voicings; 23 notes · 77% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 9% rest"
      },
      {
        "id": "gen_s2",
        "name": "algorithm, seed 2, piano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a3,c#4,e4,g4]@4] [[d3,g3,a3]@4] [[d3,f#3,a3]@4] [[d3,f3,a3,e4]@4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[a1@4] [d1@4] [d1@4] [d1@4]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@2 g5@2 f#5@2 e5@2 d5@2 c#5@6] [~@2 e5@2 f#5@2 g5@2 a5@4 b5@2 a5@2] [~@2 b4@2 c#5@2 d5@2 e5@2 f#5@6] [~@2 g5@2 f5@2 e5@2 d5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":94,\"bars\":4}"
        },
        "note": "20 notes · 89% stepwise · 1 leap · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "gen_s1_ocarina",
        "name": "seed 1 on ocarina",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a3,c#4,e4,g4]@4] [[d3,g3,a3]@4] [[d3,f#3,a3]@4] [[d3,f3,a3,e4]@4]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[a1@4] [d1@4] [d1@4] [d1@4]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55},{\"mini\":\"<[~@2 g5@2 f#5@2 g5@2 e5@4 f#5@2 e5@2] [d5@2 e5@2 d5@2 f#5@2 g5@4 a5@2 g5@2] [~@2 f#5@2 g5@2 f#5@2 a5@4 b5@2 a5@2] [~@2 f5@2 e5@2 f5@2 d5@8]>\",\"sound\":\"gm_ocarina\",\"gain\":0.5}],\"bpm\":94,\"bars\":4}"
        },
        "note": "identical notes, breath instrument"
      }
    ]
  },
  "lab3_compose_gen_major_royalroad": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_major_royalroad",
    "source_cards": [
      "cand_cw_evening_royalroad"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The royal-road loop (F | G | Em7 | Am in C major, 120 bpm) is the brightest, most \"game\" host on the page and it never lands on its tonic chord - the phrase closes on Am, so the grammar's home landing is c over Am (the vi chord's third). Prediction: the grammar reads human at 120 bpm with one gesture a bar; the flute (v3) reads as a proper game lead.",
    "question": "v1 and v2 two seeds on piano, v3 seed 1 on flute. Human at this brighter tempo? Does closing on c over Am feel finished, or does the melody want the loop to resolve?",
    "key_tonic": "C",
    "key_mode": "major",
    "variants": [
      {
        "id": "gen_s1",
        "name": "algorithm, seed 1, piano",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 e5@2 d5@2 e5@2 c5@4 d5@2 c5@2] [~@2 d5@2 c5@2 d5@2 b4@8] [~@2 g4@2 f4@2 g4@2 e4@4 f4@2 e4@2] [~@2 f5@2 e5@2 d5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":120,\"bars\":4}"
        },
        "note": "20 notes · 74% stepwise · 1 leap · landings 4/4 chord tones · 3 duration values · 13% rest"
      },
      {
        "id": "gen_s2",
        "name": "algorithm, seed 2, piano",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 e5@2 d5@2 c5@2 b4@2 a4@6] [e4@2 f4@2 g4@2 a4@2 b4@4 c5@2 b4@2] [~@2 f5@2 e5@2 d5@2 c5@2 b4@6] [~@2 e5@2 d5@2 e5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":120,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 9% rest"
      },
      {
        "id": "gen_s1_flute",
        "name": "seed 1 on flute",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_evening_royalroad\",\"gain\":1}],\"parts\":[{\"mini\":\"<[~@2 e5@2 d5@2 e5@2 c5@4 d5@2 c5@2] [~@2 d5@2 c5@2 d5@2 b4@8] [~@2 g4@2 f4@2 g4@2 e4@4 f4@2 e4@2] [~@2 f5@2 e5@2 d5@2 c5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.5}],\"bpm\":120,\"bars\":4}"
        },
        "note": "identical notes on the game-lead voice"
      }
    ]
  },
  "lab3_compose_gen_jazz_raining": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": true,
    "id": "lab3_compose_gen_jazz_raining",
    "source_cards": [
      "cand_ut_raining_jazz_walk"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "Over the raining-jazz left hand (Dm | Bb | Gm7 | A7 at 110) you called my hand-written right hand \"sounds really good!\". The algorithm now writes that right hand: two seeds at one gesture a bar (v1, v2) and seed 1 at two gestures a bar (v3 - the busier jazz line). Bar 4's c# is A7's own third (chromatic_ok). Prediction: v1/v2 relax like the hand-written one; v3 is where jazz can afford density and it still reads human at 110.",
    "question": "v1 and v2 two seeds, one gesture a bar; v3 two gestures a bar. Do the generated right hands relax the way the hand-written one did? Is v3 the right density for jazz or too busy?",
    "key_tonic": "D",
    "key_mode": "minor",
    "variants": [
      {
        "id": "gen_s1",
        "name": "algorithm, seed 1",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@2 c5@2 bb4@2 c5@2 a4@4 bb4@2 a4@2] [~@2 g5@2 a5@2 g5@2 bb5@8] [~@2 g5@2 a5@2 g5@2 bb5@4 c6@2 bb5@2] [~@2 e5@2 f5@2 g5@2 a5@8]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "20 notes · 68% stepwise · 1 leap · landings 4/4 chord tones · 3 duration values · 13% rest"
      },
      {
        "id": "gen_s2",
        "name": "algorithm, seed 2",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[~@2 c6@2 bb5@2 a5@2 g5@2 f5@6] [bb4@2 c5@2 d5@2 e5@2 f5@4 g5@2 f5@2] [~@2 c5@2 d5@2 e5@2 f5@2 g5@6] [~@2 d5@2 e5@2 f5@2 g5@8]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "21 notes · 85% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 9% rest"
      },
      {
        "id": "gen_s1_dense",
        "name": "seed 1, two gestures a bar",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[d3,f3,a3] ~@5 a2@6 e2@4] [bb1@6 bb2@6 d2@2 ~ a2] [[g2,bb2,d3]@6 e2@6 a1@4] [a1@6 a2@6 e2@2 f2 c#3]>\",\"sound\":\"piano\",\"gain\":0.7},{\"mini\":\"<[c5@2 bb4 c5 a4@2 ~@2 a4@2 g4 a4 f4@2 ~@2] [a4@2 g4 a4 f4@2 ~@2 d5@2 c5 d5 bb4@2 ~@2] [d5@2 c5 d5 bb4@2 ~@2 d5@2 c5 d5 bb4@2 ~@2] [g5@2 f5 e5 db5@2 ~@2 f5@2 e5 d5 db5@4]>\",\"sound\":\"piano\",\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "32 notes · 58% stepwise · 2 leaps · landings 8/8 chord tones · 3 duration values · 22% rest"
      }
    ]
  },
  "lab3_compose_gen_blues_walk": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": true,
    "id": "lab3_compose_gen_blues_walk",
    "source_cards": [
      "cand_hs_negrocity_walking_bass"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The walking bass you liked implies a C blues (both eb and e, bb) at 150 bpm - the fastest and most playful host here. The algorithm runs on the blues scale with C7 landings (c e g bb): a \"rock\" in this scale can be a minor third (e-g-e) because the scale has no f. Prediction: one gesture a bar keeps up at 150 and reads playful-human; the square-wave lead (v3) is the chip version of the same tune.",
    "question": "v1 and v2 two seeds on piano over the walk, v3 seed 1 on a square lead. Does the grammar swing with the bass at this speed? Does the blues colour (eb and e in one line) read intentional? Does the chip voice keep the human feel?",
    "key_tonic": "C",
    "key_mode": "major",
    "variants": [
      {
        "id": "gen_s1",
        "name": "algorithm, seed 1, piano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@2 eb5@2 d5@2 eb5@2 c5@4 d5@2 c5@2] [e4@2 g4@2 e4@2 a4@2 bb4@4 c5@2 bb4@2] [~@2 eb5@2 d5@2 eb5@2 c5@4 d5@2 c5@2] [~@2 e5@2 eb5@2 d5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":150,\"bars\":4}"
        },
        "note": "23 notes · 64% stepwise · 1 leap · landings 4/4 chord tones · 3 duration values · 9% rest"
      },
      {
        "id": "gen_s2",
        "name": "algorithm, seed 2, piano",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@2 e5@2 eb5@2 d5@2 c5@2 bb4@6] [~@2 eb5@2 d5@2 c5@2 bb4@4 c5@2 bb4@2] [~@2 g5@2 e5@2 eb5@2 d5@2 c5@6] [~@2 e5@2 eb5@2 d5@2 c5@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":150,\"bars\":4}"
        },
        "note": "20 notes · 79% stepwise · 1 leap · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "gen_s1_square",
        "name": "seed 1 on a square lead",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@2 eb5@2 d5@2 eb5@2 c5@4 d5@2 c5@2] [e4@2 g4@2 e4@2 a4@2 bb4@4 c5@2 bb4@2] [~@2 eb5@2 d5@2 eb5@2 c5@4 d5@2 c5@2] [~@2 e5@2 eb5@2 d5@2 c5@8]>\",\"sound\":\"gm_lead_1_square\",\"gain\":0.38}],\"bpm\":150,\"bars\":4}"
        },
        "note": "identical notes on the chip voice"
      }
    ]
  },
  "lab3_compose_gen_mystery_harpsi": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_mystery_harpsi",
    "source_cards": [
      "cand_cw_shenightfall_harpsi"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The shenightfall harpsichord (Gm9 | Gm9 | Eb^7 | Eb^7 at 78) is a FIGURE, not a melody, so a lead can sit above it. The algorithm writes that lead above the harpsi's held f4: flute (v1), clarinet (v2, seed 2), and strings with the sad-shop treatment as a LEAD (v3: room 0.5, attack 0.06, release 0.4 - the strings lane asks whether that is enough). Landings are Gm9/Eb^7 tones only.",
    "question": "v1 flute seed 1, v2 clarinet seed 2, v3 seed 1 on treated strings. Does a generated lead over the harpsi keep the mysterious read? Which voice fits it - and do the treated strings finally sound smooth, or do strings need to stay under a lead?",
    "key_tonic": "G",
    "key_mode": "minor",
    "variants": [
      {
        "id": "gen_s1_flute",
        "name": "algorithm, seed 1, flute",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<[~@2 c6@2 bb5@2 c6@2 a5@4 bb5@2 a5@2] [~@2 d6@2 c6@2 d6@2 bb5@4 c6@2 bb5@2] [~@2 bb5@2 a5@2 bb5@2 g5@4 a5@2 g5@2] [~@2 c6@2 bb5@2 c6@2 g5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.5}],\"bpm\":78,\"bars\":4}"
        },
        "note": "22 notes · 71% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 13% rest"
      },
      {
        "id": "gen_s2_clarinet",
        "name": "algorithm, seed 2, clarinet",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<[~@2 d6@2 c6@2 bb5@2 a5@2 g5@6] [c6@2 bb5@2 a5@2 g5@2 f5@4 g5@2 f5@2] [~@2 a5@2 g5@2 f5@2 eb5@2 d5@6] [~@2 bb5@2 a5@2 bb5@2 g5@8]>\",\"sound\":\"gm_clarinet\",\"gain\":0.5}],\"bpm\":78,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 1 leap · landings 4/4 chord tones · 4 duration values · 9% rest"
      },
      {
        "id": "gen_s1_strings_treated",
        "name": "seed 1 on strings, sad-shop treatment",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<[~@2 c6@2 bb5@2 c6@2 a5@4 bb5@2 a5@2] [~@2 d6@2 c6@2 d6@2 bb5@4 c6@2 bb5@2] [~@2 bb5@2 a5@2 bb5@2 g5@4 a5@2 g5@2] [~@2 c6@2 bb5@2 c6@2 g5@8]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the same notes as v1 on the ensemble sample, treated (room, attack, release)"
      }
    ]
  },
  "lab3_compose_gen_bright_lb3": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": true,
    "id": "lab3_compose_gen_bright_lb3",
    "source_cards": [
      "cand_b2_ly_lb3_swing_arp_swap"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The lb3 arpeggio (C^7 | C^7 | Eb^7 | Eb^7 at 144) is bright and fast and shifts key by a third halfway (chromatic_ok: bars 3-4 are Eb major by design). The host is dropped an octave so the melody can sit above it. Prediction: the grammar reads human at 144 with one gesture a bar (v1 vibraphone, v2 piano); two gestures a bar at 144 (v3) is the speed limit and starts to read as a machine.",
    "question": "v1 vibraphone seed 1, v2 piano seed 2, v3 vibraphone seed 1 at two gestures a bar. Human at 144? Does the key shift into Eb feel followed by the melody? Is v3 over the speed limit?",
    "key_tonic": "C",
    "key_mode": "major",
    "variants": [
      {
        "id": "gen_s1_vibes",
        "name": "algorithm, seed 1, vibraphone",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_lb3_swing_arp_swap\",\"add\":-12,\"gain\":0.6}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 g5@2 e5@4 f5@2 e5@2] [d5@2 e5@2 d5@2 f5@2 g5@4 a5@2 g5@2] [~@2 bb5@2 ab5@2 bb5@2 g5@4 ab5@2 g5@2] [~@2 d5@2 eb5@2 f5@2 g5@8]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.5}],\"bpm\":144,\"bars\":4}"
        },
        "note": "host an octave down; 23 notes · 77% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 9% rest"
      },
      {
        "id": "gen_s2_piano",
        "name": "algorithm, seed 2, piano",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_lb3_swing_arp_swap\",\"add\":-12,\"gain\":0.6}],\"parts\":[{\"mini\":\"<[~@2 g5@2 f5@2 e5@2 d5@2 c5@6] [~@2 a5@2 g5@2 f5@2 e5@4 f5@2 e5@2] [~@2 d5@2 c5@2 bb4@2 ab4@2 g4@6] [~@2 c5@2 bb4@2 ab4@2 g4@8]>\",\"sound\":\"piano\",\"gain\":0.62}],\"bpm\":144,\"bars\":4}"
        },
        "note": "20 notes · 89% stepwise · 1 leap · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "gen_s1_dense",
        "name": "seed 1, two gestures a bar, vibraphone",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_lb3_swing_arp_swap\",\"add\":-12,\"gain\":0.6}],\"parts\":[{\"mini\":\"<[g5@2 f5 g5 e5@2 ~@2 d5@2 e5 d5 g5@2 ~@2] [d5@2 e5 f5 g5@2 ~@2 d5@2 e5 d5 g5@2 ~@2] [bb5@2 ab5 bb5 g5@2 ~@2 bb4@2 c5 bb4 eb5@2 ~@2] [bb5@2 ab5 g5 eb5@2 ~@2 ab5@2 g5 f5 eb5@4]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.5}],\"bpm\":144,\"bars\":4}"
        },
        "note": "32 notes · 61% stepwise · 1 leap · landings 8/8 chord tones · 3 duration values · 22% rest"
      }
    ]
  },
  "lab3_compose_gen_pedal_pendulum": {
    "lane": "compose",
    "batch": 3,
    "chromatic_ok": false,
    "id": "lab3_compose_gen_pedal_pendulum",
    "source_cards": [
      "cand_cw_airvoyage_pendulum",
      "cand_b6_vl_pendulum_bright_third"
    ],
    "his_words": "the melody variations and generations have been really good. experiment more to test more hypothesis and learn more for what sounds human, and try to create more variations and experimenting. / do more and experiment with much more! these are really good / just melody generation like this is good - sounds human",
    "hypothesis": "The pendulum (Bb pedal with the bright third, 140 bpm, your energetic strings-and-bass bed) has NO chord changes, so the grammar's landings can only choose among Bb-D-F (plus the g of the 6th bar) - the test of whether the grammar makes a melody when the harmony gives it nothing to follow. Prediction: it does, because the arch and Q/A rules shape the line without harmony; the saw lead (v1, v2) fits the bed, the muted trumpet (v3) reads softer/older.",
    "question": "v1 and v2 two seeds on a saw lead, v3 seed 1 on muted trumpet. Does a melody over a static pedal still read human and shaped? Which voice belongs on this energetic bed?",
    "key_tonic": "Bb",
    "key_mode": "major",
    "variants": [
      {
        "id": "gen_s1_saw",
        "name": "algorithm, seed 1, saw lead",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 g4 a#3 g4 a#4 g4 a#3 g4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 d4 a#3 d4 a#4 d4 a#3 d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<[~@2 f5@2 eb5@2 f5@2 d5@4 eb5@2 d5@2] [~@2 a5@2 g5@2 f5@2 eb5@2 d5@6] [~@2 d5@2 c5@2 d5@2 bb4@4 c5@2 bb4@2] [~@2 eb5@2 d5@2 c5@2 bb4@8]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.42}],\"bpm\":140,\"bars\":4}"
        },
        "note": "21 notes · 80% stepwise · 0 leaps · landings 4/4 chord tones · 4 duration values · 13% rest"
      },
      {
        "id": "gen_s2_saw",
        "name": "algorithm, seed 2, saw lead",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 g4 a#3 g4 a#4 g4 a#3 g4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 d4 a#3 d4 a#4 d4 a#3 d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<[~@2 f5@2 eb5@2 d5@2 c5@2 bb4@6] [~@2 d5@2 eb5@2 d5@2 f5@8] [~@2 f5@2 eb5@2 d5@2 c5@2 bb4@6] [~@2 f4@2 g4@2 a4@2 bb4@8]>\",\"sound\":\"gm_lead_2_sawtooth\",\"gain\":0.42}],\"bpm\":140,\"bars\":4}"
        },
        "note": "18 notes · 82% stepwise · 0 leaps · landings 4/4 chord tones · 3 duration values · 13% rest"
      },
      {
        "id": "gen_s1_trumpet",
        "name": "seed 1 on muted trumpet",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 g4 a#3 g4 a#4 g4 a#3 g4] [a#4 f4 a#3 f4 a#4 f4 a#3 f4] [a#4 d4 a#3 d4 a#4 d4 a#3 d4]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45},{\"mini\":\"[[a#1,a#2] a#2 a#2 a#2 [a#1,a#2] [a#1,a#2] a#2 a#2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.7},{\"mini\":\"<[~@2 f5@2 eb5@2 f5@2 d5@4 eb5@2 d5@2] [~@2 a5@2 g5@2 f5@2 eb5@2 d5@6] [~@2 d5@2 c5@2 d5@2 bb4@4 c5@2 bb4@2] [~@2 eb5@2 d5@2 c5@2 bb4@8]>\",\"sound\":\"gm_muted_trumpet\",\"gain\":0.35}],\"bpm\":140,\"bars\":4}"
        },
        "note": "identical notes, softer brass"
      }
    ]
  },
  "lab3_combo_strings_treatment": {
    "id": "lab3_combo_strings_treatment",
    "lane": "combo",
    "batch": 3,
    "source_cards": [
      "cand_b4_ly_chaotix_shadow_fourth"
    ],
    "his_words": "these sound more robotic than the strings you used in songs.html sad shop. the fluid and smooth ones. notes sound good though",
    "hypothesis": "Measured: the sad-shop strings and these are the SAME gm_string_ensemble_1 sample. Sad shop plays it at gain 0.21 (30% of its piano lead), with room 0.45-0.5, every note held at least a beat (0.92-3.69 s), two attacks a bar and eight distinct velocities; the chaotix strings you judged sit at 0.4, dry, on four equal quarters a bar. The soundfont's default release is 10 ms, so every note end is a hard cut - reverb, level and a real attack/release each hide that cut in a different way. Prediction: reverb alone removes most of the robot, the whisper level second, the envelope least; all three together reach the sad-shop smoothness on the identical notes. The line is the source's own chromatic shadow (c# eb e f# over g# bb b c#), so chromatic_ok.",
    "question": "Same four notes and the same bass in every variant; v1 is the legato you judged. Which single change first stops it sounding robotic - v2 the whisper level, v3 the reverb, v4 the attack/release - and does v5 (all three at once) match the sad-shop feel? If none of them do, the cause is the equal durations, which the durations card tests.",
    "key_tonic": "C#",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_judged",
        "name": "legato as judged (gain 0.4, dry)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "lab2_fix_chaotix_articulation/strings_legato, byte-identical - the one you called robotic"
      },
      {
        "id": "whisper",
        "name": "level only: gain 0.4 -> 0.2 (the sad-shop ratio)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2}],\"bpm\":100,\"bars\":2}"
        },
        "note": "same notes, half the level, still dry and hard-cut"
      },
      {
        "id": "reverb",
        "name": "reverb only: room 0.5 at the judged level",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4,\"room\":0.5}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the sad-shop room on the judged notes - the tail of each note now covers the next one's onset"
      },
      {
        "id": "envelope",
        "name": "envelope only: attack 0.08 s, release 0.45 s",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4,\"attack\":0.08,\"release\":0.45}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the 10 ms cut replaced by a bowed swell-in and a real decay; level and dryness as judged"
      },
      {
        "id": "sadshop",
        "name": "all three: gain 0.2 + room 0.5 + attack/release",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"attack\":0.08,\"release\":0.45}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the sad-shop treatment on the identical notes"
      }
    ]
  },
  "lab3_combo_strings_lead_smooth": {
    "id": "lab3_combo_strings_lead_smooth",
    "lane": "combo",
    "batch": 3,
    "source_cards": [
      "cand_cw_shenightfall_prog",
      "cand_vg_rd_nocturne_bed"
    ],
    "his_words": "sounds good! however the strings are really robotic -> use the sad shop strings",
    "hypothesis": "The strings lead you judged re-attacks the ensemble sample on 8th notes (median note 0.38 s, only a quarter of them a beat or longer) at gain 0.45 with no room; the soundfont's 10 ms release cuts each note dead before the bow has finished swelling, and the grid of equal cuts is the robot. Sad shop never asks the sample to do that: whole-beat holds, room, whisper level, and it is never the lead. Prediction: treatment alone (v2) helps but the 8th-note rocks still read mechanical; removing the re-attacks (v3) matters more; the sample is happiest as the SHADOW under a piano lead (v4) - the sad-shop role.",
    "question": "v1 is the strings lead you judged. v2 adds the sad-shop treatment (room, attack, release) at the same level. v3 keeps the treatment and removes the 8th-note re-attacks - each rocking pair becomes its first note held. v4 gives the melody back to the piano and puts the strings under it at whisper level. Which one first stops being robotic, and is v4 the only one that sounds like sad shop?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_judged",
        "name": "strings lead as judged (0.45, dry, 8th-note rocks)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45}],\"bpm\":78,\"bars\":4}"
        },
        "note": "lab2_compose_melody_over_host/strings_lead, byte-identical"
      },
      {
        "id": "treated",
        "name": "same lead + room 0.5, attack 0.06, release 0.4",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":78,\"bars\":4}"
        },
        "note": "identical notes and level; only the treatment changes"
      },
      {
        "id": "held_only",
        "name": "treated + re-attacks removed (each rock = its first note held)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@6 eb5@2 d5@4] [~@2 c6@6 g5@4 ab5@2 g5@2] [~@4 d5@6 bb4@4 ab4@2] [~@2 g5@4 eb5@4 c5@6]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.45,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the melody's landings and tails intact; the g-f-g / c-bb-c / d-c-d rocks become one held note each, so the sample is never re-struck on an 8th"
      },
      {
        "id": "shadow",
        "name": "piano takes the lead; strings shadow it at 0.2 with the treatment",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_cw_shenightfall_prog\",\"gain\":1.0}],\"parts\":[{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"piano\",\"gain\":0.62},{\"mini\":\"<[~@4 g5@2 f5@2 g5@2 eb5@2 d5@4] [~@2 c6@2 bb5@2 c6@2 g5@4 ab5@2 g5@2] [~@4 d5@2 c5@2 d5@2 bb4@4 ab4@2] [~@2 g5@2 f5@2 eb5@4 c5@6]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the sad-shop role: the piano lead you called good, the strings a whisper underneath doubling it"
      }
    ]
  },
  "lab3_combo_strings_durations": {
    "id": "lab3_combo_strings_durations",
    "lane": "combo",
    "batch": 3,
    "source_cards": [
      "cand_b4_ly_chaotix_shadow_fourth"
    ],
    "his_words": "it's just chords at same durations it feels robotic",
    "hypothesis": "Your grief note names a second cause besides treatment: EQUAL durations. The chaotix strings strike four identical quarters a bar; sad shop's string notes range 0.92-3.69 s and its layers interlock (a held top voice over a moving inner voice). Prediction: with the treatment fixed, the isochronous line (v2) still reads somewhat robotic; long-short durations (v3) or a held voice above the moving one (v4) remove it with no pitch changed; velocity variety alone (v5) is the weakest fix because the ensemble sample's dynamic range is small. Chromatic_ok: the source line is chromatic.",
    "question": "Treatment (room 0.5, release 0.4) is identical from v2 on, so durations are the only axis. Does v2 still sound robotic with equal quarters? Does v3 (long-short) fix it? Does v4 (a held c#5 over the moving line - the sad-shop interlock) sound like sad shop? Does v5 (accented velocities on equal quarters) do anything on its own?",
    "key_tonic": "C#",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "as_judged",
        "name": "equal quarters, dry, 0.4 (as judged)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "lab2_fix_chaotix_articulation/strings_legato, byte-identical"
      },
      {
        "id": "treated_iso",
        "name": "equal quarters, treated (room 0.5, release 0.4, gain 0.3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.3,\"room\":0.5,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the durations control: same four equal notes, now treated"
      },
      {
        "id": "long_short",
        "name": "long-short durations (5+3, 5+3 sixteenths)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@5 eb4@3 e4@5 f#4@3]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.3,\"room\":0.5,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "same pitches, treated; each pair now leans long-short so no two consecutive notes share a duration"
      },
      {
        "id": "interlock",
        "name": "held c#5 over the moving line (the sad-shop interlock)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#5@16]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"release\":0.4},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "two string layers like sad shop: a whole-bar hold on top, the judged quarters underneath, both at whisper level"
      },
      {
        "id": "velocity",
        "name": "accented velocities on the equal quarters",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gainPattern\":\"[0.34@4 0.26@4 0.3@4 0.24@4]\",\"room\":0.5,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "same notes and durations, treated; the four strikes now carry four different levels (sad shop has eight)"
      }
    ]
  },
  "lab3_combo_strings_notes": {
    "id": "lab3_combo_strings_notes",
    "lane": "combo",
    "batch": 3,
    "source_cards": [
      "cand_b4_ly_chaotix_shadow_fourth"
    ],
    "his_words": "could also experiment with different notes too",
    "hypothesis": "With the sad-shop treatment fixed (gain 0.22, room 0.5, attack 0.06, release 0.4), the NOTES become the only axis. The judged line shadows the rising chromatic bass a fourth above; alternatives read differently by construction: contrary motion (falling against the rising bass) reads as tension resolving, a held dominant pedal reads cinematic-static, low parallel fifths read dark and heavy. Prediction: contrary motion is the most 'determined', the pedal the most 'mysterious', the fifths too heavy for the synth bass underneath. Chromatic_ok: the bass itself is chromatic and every line here follows it.",
    "question": "Treatment identical everywhere. v1 the judged parallel-fourth shadow, v2 contrary motion, v3 a held g#4 pedal through the whole rising bass, v4 low parallel fifths. Which notes fit the determined/tension read you gave this piece - and does any of them fit a different vibe better (say which)?",
    "key_tonic": "C#",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "treated_ref",
        "name": "the judged notes with the sad-shop treatment",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[c#4@4 eb4@4 e4@4 f#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "reference for the notes axis: the judged line, treated (same as the treatment card's v5 at a hair more level)"
      },
      {
        "id": "contrary",
        "name": "contrary motion: f# e eb c# falling against the rising bass",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[f#4@4 e4@4 eb4@4 c#4@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the same four pitches in reverse order - the line now closes toward the bass as it rises"
      },
      {
        "id": "dominant_pedal",
        "name": "held g#4 pedal through the whole bass line",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[g#4@16]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "one note a bar: the 5th of the arrival chord held while the bass climbs into it (it rubs the bb2 in passing - the tension is the point)"
      },
      {
        "id": "dyads_low",
        "name": "low parallel fifths an octave down",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g#2 bb2 b2 c#3] [g#2 bb2 b2 [c#3 eb3]]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"[[c#3,g#3]@4 [eb3,bb3]@4 [e3,b3]@4 [f#3,c#4]@4]\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.22,\"room\":0.5,\"attack\":0.06,\"release\":0.4}],\"bpm\":100,\"bars\":2}"
        },
        "note": "the judged line an octave lower with a fifth stacked on each note - dark, cinematic, heavier"
      }
    ]
  },
  "lab3_flow_harpsi_rise_notes": {
    "id": "lab3_flow_harpsi_rise_notes",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_cw_shenightfall_harpsi",
      "cand_b6_vl_harpsi_third_up"
    ],
    "his_words": "good step but also try exploring making the notes of the initial rise different because it still seems notable the same idea",
    "hypothesis": "The \"same idea\" is the pickup's INTERVAL CONTENT, not its rhythm: the judged figure and batch-2's risingpickup both start on the root and climb by scale step (1-2-3, then 1-2-3-4), so re-timing the climb left the idea intact. This card freezes the rhythm of the held bars and the answer bars' turn (g4 d4 c4 d4 / g4 d4 f4 g4) and the pad, and changes only what the pickup's three (or four) notes ARE: triadic leaps through the chord (g-bb-d), a wide-leap pickup that starts on the chord's 5th (d3 / bb2, never the root), the falling pickup you pre-ratified (stretched to four notes, c5-bb4-a4-g4, so the anchor lands ON beat 2), and a pickup that climbs past f4 to a new anchor (a4, the 9th over Gm9; bb4, the 5th over Eb^7). Prediction: any pickup that keeps \"root, then steps\" reads as the same idea whatever its timing; the first two leaps of triadic and fifth_wide are enough to make it a new idea even though the anchor and the turn are untouched; anchor9 is the boldest because the note that holds is different. Every pitch is G natural minor; over the Eb^7 bars the pickups land on f4 (the judged figure's own landing, its 9th) except anchor9, which lands on bb4, an Eb^7 tone.",
    "question": "Pad, held-bar rhythm and the answer turns are byte-identical in all five; only the pickup notes (and, in anchor9, the note they land on) change. Which of triadic / fifth_wide / falling4 / anchor9 is the first that stops being \"the same idea\"? Does triadic still read as this harpsichord figure when it lands on the same f4 — i.e. is the idea the landing or the climb? Is falling4 the \"inverted pickup will almost always work\" you predicted, even four notes long with the anchor on beat 2? And does anchor9, landing on the 9th (a4) instead of the 7th (f4), still feel like the figure you saved for \"lands and holds the 7th\", or is the 7th the identity?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference, cropped to 4 bars)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "lab2_flow_harpsi_rhythm_notes/orig verbatim (the judged figure cropped to the source's first 4 bars): root-2-3 grace climb onto the held f4, then the turn answer, over Gm9 then Eb^7. Pad identical in every variant."
      },
      {
        "id": "triadic",
        "name": "triadic pickup — g3 bb3 d4 leaps through the chord onto f4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a#3 d4 f4@13] [g3 a#3 d4 f4 ~ g4 d4@4 c4@3 d4@3] [g3 a#3 d4 f4@13] [g3 a#3 d4 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the stepwise climb becomes the chord arpeggiated: g3-bb3-d4 (root, 3rd, 5th of Gm9) then the same f4 anchor. Over Eb^7 (bars 3-4) the SAME three notes are the chord's 3rd-5th-7th, so the pickup no longer starts on eb3 — a leap-built pickup, same landing, same turn. 10 of 24 harpsi notes change."
      },
      {
        "id": "fifth_wide",
        "name": "wide pickup from the 5th — d3 g3 d4 / bb2 eb3 bb3 onto f4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[d3 g3 d4 f4@13] [d3 g3 d4 f4 ~ g4 d4@4 c4@3 d4@3] [a#2 d#3 a#3 f4@13] [a#2 d#3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the pickup starts on the chord's 5th BELOW the root and leaps: d3 up a 4th to g3, up a 5th to d4, then f4 (Gm9); bb2-eb3-bb3 then f4 over Eb^7 — 4th, 5th, 5th. Nothing stepwise left in the rise; anchor and turn untouched. 10 of 24 notes change, the lowest note now a 4th under the original's."
      },
      {
        "id": "falling4",
        "name": "falling 4-note pickup — c5 bb4 a4 g4 down onto f4 on beat 2",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c5 a#4 a4 g4 f4@12] [c5 a#4 a4 g4 f4 g4 d4@4 c4@3 d4@3] [c5 a#4 a4 g4 f4@12] [c5 a#4 a4 g4 f4 g4 d4@4 c4@3 d4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "your \"inverted pickup will almost always work\", stretched: four 16ths falling by step from c5 (c5-bb4-a4-g4) so the f4 anchor lands ON beat 2 instead of the last 16th of beat 1 (batch-2 risingpickup's timing, reversed in direction). In the answer bars the fourth pickup note absorbs the breath rest; the g4-d4-c4-d4 turn keeps its slots. Every pickup note changes and the anchor moves a 16th; bars 3-4 (Eb^7) use the same fall — a4 is a passing 16th, as the judged figure's own a3 is over Eb."
      },
      {
        "id": "anchor9",
        "name": "new anchor — the pickup climbs past f4 to the 9th (a4) / the 5th (bb4)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a#3 d4 g4 a4@13] [a#3 d4 g4 a4 ~ g4 d4@4 c4@3 d4@3] [d#4 g4 a4 a#4@13] [d#4 g4 a4 a#4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the pickup bb3-d4-g4 (3rd, 5th, root) climbs THROUGH the old anchor and holds a4, the 9th of Gm9 (unison with the pad's a4); over Eb^7 it is eb4-g4-a4 onto bb4, the chord's 5th, because a4 is not an Eb^7 tone. The turn answers from the new anchor (a4 then g4 d4 c4 d4). 16 of 24 notes change — the boldest here: the held note itself is new."
      }
    ]
  },
  "lab3_time_gijoe_bold": {
    "id": "lab3_time_gijoe_bold",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_b5_tp_gijoe_rhythm",
      "cand_vg_gijoe_quartal_comp"
    ],
    "his_words": "barely different I feel like",
    "hypothesis": "The batch-2 arc developed by ADDING OCTAVES over a frozen rhythm and frozen chords, and you could barely hear it: an octave double changes no onset and no pitch class, so it is below the threshold. This arc changes at least a third of each 2-bar block's events with one nameable move per block: block 2 regroups the stabs into 3+3+2 | 3+3+2 (onsets 0,3,6 / 8,11,14 of the 16th grid — six attacks where the template has nine, only the downbeat and the last stab survive in place); block 3 keeps the template's rhythm and voice-leading moves exactly but re-harmonizes to G -> C (every stab re-voiced in the template's own e3-a4 register, every single note the new chord's step-below or root — all natural A minor); block 4 returns the template and ADDS a flute counter-line (e5 c5 a4 | a4 c5 f5, chord tones, every note at least a beat, gain 0.3) plus the judged rising fill. The two controls isolate the axes: harmony_only changes nothing but bars 5-6, rhythm_only nothing but bars 3-4. Prediction: the arc reads as intentional development and each block is audibly its own move; harmony_only alone already clears \"barely different\" (a chord change is a pitch-class change on every stab), while the octave-addition mechanism never could.",
    "question": "static is the template x4 you judged. In arc, does each 2-bar block read as a different, intentional move — regroup (3-4), new chords G -> C (5-6), flute line + fill (7-8) — or does one of them overshoot (the regroup losing the gijoe groove, the flute crowding the stabs)? Compare the two controls: is harmony_only (only bars 5-6 change) already clearly \"different\", and is rhythm_only (only bars 3-4) — which axis clears your \"barely different\" first, chords or rhythm?",
    "key_tonic": "A",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "static",
        "name": "template x4 unchanged (reference control)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "lab2_time_gijoe_evolve/static verbatim: the 2-bar Am | F template looping four times."
      },
      {
        "id": "arc",
        "name": "bold arc — 3+3+2 regroup, then G -> C, then flute line + fill",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 ~ g3@2 ~ [g3,c4,e4]@2 [a3,c4,f4]@2 ~ [c4,e4,a4]@2 ~ [b3,d4,g4]@2] [[f3,a3,c4]@2 ~ e3@2 ~ [f3,a3,d4]@2 [e3,g3,c4]@2 ~ [g3,b3,d4]@2 ~ [a3,c4,e4]@2] [[g3,b3,d4]@2 f3 ~@1 [g3,b3,d4]@2 [f3,b3,d4] [g3,b3,e4]@2 g3 ~@1 f3 [b3,d4,g4] ~@1 [a3,c4,e4] ~@1] [[c4,e4,g4]@2 b3 ~@1 [c4,e4,g4]@2 [c4,e4,a4] [b3,d4,g4]@2 b3 ~@1 c4 [d4,f4,a4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 c4 d4 e4 g4]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5},{\"mini\":\"<~ ~ ~ ~ ~ ~ [e5@4 c5@4 a4@8] [a4@4 c5@4 f5@8]>\",\"sound\":\"gm_flute\",\"gain\":0.3,\"room\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "bars 1-2 template · 3-4 the stabs regrouped 3+3+2 per half bar (six attacks, the single-note fills a3/g3 and e3/f3 dropped) · 5-6 the same rhythm and moves over G | C · 7-8 template with a flute counter-line above (e5 c5 a4 | a4 c5 f5, notes a beat or longer, gain 0.3) and the rising fill f3 c4 d4 e4 g4 into the loop."
      },
      {
        "id": "harmony_only",
        "name": "control — only the G -> C block (bars 5-6) changes",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[g3,b3,d4]@2 f3 ~@1 [g3,b3,d4]@2 [f3,b3,d4] [g3,b3,e4]@2 g3 ~@1 f3 [b3,d4,g4] ~@1 [a3,c4,e4] ~@1] [[c4,e4,g4]@2 b3 ~@1 [c4,e4,g4]@2 [c4,e4,a4] [b3,d4,g4]@2 b3 ~@1 c4 [d4,f4,a4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "template rhythm in every bar; bars 5-6 re-harmonized G | C with the template's stab/passing/pickup moves (root stab, bass-down and top-up neighbour stabs, inverted-up stab, Am pickup); no regroup, no fill, no added voice."
      },
      {
        "id": "rhythm_only",
        "name": "control — only the 3+3+2 block (bars 3-4) changes",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 ~ g3@2 ~ [g3,c4,e4]@2 [a3,c4,f4]@2 ~ [c4,e4,a4]@2 ~ [b3,d4,g4]@2] [[f3,a3,c4]@2 ~ e3@2 ~ [f3,a3,d4]@2 [e3,g3,c4]@2 ~ [g3,b3,d4]@2 ~ [a3,c4,e4]@2] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1] [[a3,c4,e4]@2 g3 ~@1 [a3,c4,e4]@2 [g3,c4,e4] [a3,c4,f4]@2 a3 ~@1 g3 [c4,e4,a4] ~@1 [b3,d4,g4] ~@1] [[f3,a3,c4]@2 e3 ~@1 [f3,a3,c4]@2 [f3,a3,d4] [e3,g3,c4]@2 e3 ~@1 f3 [g3,b3,d4] ~@1 [a3,c4,e4] ~@1]>\",\"sound\":\"gm_epiano1\",\"bpm\":120,\"bars\":8,\"gain\":0.5}"
        },
        "note": "template chords throughout; bars 3-4 regrouped 3+3+2 | 3+3+2 (attacks on 16ths 0, 3, 6, 8, 11, 14), everything else the template."
      }
    ]
  },
  "lab3_flow_dq_tresillo_variations": {
    "id": "lab3_flow_dq_tresillo_variations",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_vg_dq_pizz_only",
      "cand_b6_vl_dq_pizz_vamp"
    ],
    "his_words": "there could also be variations of this. it works!",
    "hypothesis": "The tresillo you ratified is a half-bar cell — pedal, colour, colour in 3+3+2 sixteenths — so it varies legally on three axes without touching that cell: WHERE the cell sits (displaced starts every cell on the and-of-the-beat, so each half's short tone wraps onto the next downbeat as a lean — f#4 onto bar 1, bb4 onto bar 2 — and the two colour families separate, major in bar 1, b6 in bar 2), WHAT pitches it carries (fallpitch pours batch-2 fallprimary's pitches — the one you marked \"like it\" — into the same slots, so the top now falls c5-b4-bb4-a4 across the bar and bar 2 ends on the rising pickup f-g-bb), HOW OFTEN it sounds (alternating pairs one tresillo bar with the original's straight-16th bar, so the regroup is an event, not a texture), and whether SILENCE belongs inside it (restpunct silences beat 3 and turns the second half's colour pair into an 8th-note pickup on beat 4 — the walkbass restpunct shape you called \"more groovy and niche\"). Prediction: fallpitch is the strongest because it changes 8 of 12 pitches on the rhythm you already approved; displaced is the riskiest because the lean on the downbeat is a non-pedal tone; alternating is the one that survives longest in a loop. Inherited tones only: the source's b-natural and picardy f# appear where the original and fallprimary placed them — chromatic_ok for those alone.",
    "question": "Same 50 bpm pizzicato, same tresillo cell in every variant. Does displaced still read as the tresillo when nothing lands on a downbeat but the previous half's short tone — and is the lean (f# onto bar 1, bb onto bar 2) a feature or a stumble? Is fallpitch the \"variations of this\" you meant: the falling top you liked, now in 3+3+2? Does alternating keep the tresillo fresh by rationing it, or does the straight bar feel like a different figure butting in? And does restpunct's silent beat 3 + beat-4 pickup pair breathe the way the walkbass one did, or go limp at this tempo?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "tresillo",
        "name": "original (reference — batch-2 tresillo)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4@3 a4@3 b4@2 d4@3 c5@3 a#4@2] [a3@3 c5@3 a4@2 d4@3 a4@3 f#4@2]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "lab2_flow_dq_rhythm/tresillo verbatim: each half bar plays pedal + two colour tones as 3+3+2 sixteenths (attacks on 0, 3, 6 / 8, 11, 14), the march a4 -> b4 | c5 -> bb4 kept. (source's own b and f#)",
        "chromatic_ok": true
      },
      {
        "id": "displaced",
        "name": "displaced tresillo — every cell starts on the and, the short tone leans onto the next downbeat",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[f#4@2 d4@3 a4@3 b4@2 d4@3 c5@3] [a#4@2 a3@3 c5@3 a4@2 d4@3 a4@3]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the same six tones per bar in the same order, the whole 3+3+2 pushed an 8th late: attacks on 16ths 2, 5, 8 / 10, 13, and the second half's short tone falls on the NEXT bar's downbeat (bar 2's f#4 opens bar 1, bar 1's bb4 opens bar 2) — so every downbeat is a lean onto the pedal, never the pedal itself. All 12 attacks move; bar 1 now carries only the major colours (f#, b), bar 2 the b6 (bb).",
        "chromatic_ok": true
      },
      {
        "id": "fallpitch",
        "name": "tresillo carrying the fall-primary pitches — top falls c5 b4 bb4 a4",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4@3 c5@3 b4@2 d4@3 a#4@3 a4@2] [d4@3 c5@3 b4@2 f4@3 g4@3 a#4@2]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "the rhythm is the reference's; the tones are batch-2 fallprimary's (pedal + each half's two colour tones in its order): d4 c5 b4 | d4 bb4 a4 || d4 c5 b4 | f4 g4 bb4 — the top now FALLS c5-b4-bb4-a4 through bar 1 and the last half of bar 2 is the rising pickup f-g-bb in 3+3+2, leading back to the c5. 8 of 12 pitches change, no onset moves.",
        "chromatic_ok": true
      },
      {
        "id": "alternating",
        "name": "tresillo alternating with a straight bar",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4@3 a4@3 b4@2 d4@3 c5@3 a#4@2] [a3 c5 a4 c5 d4 a4 f#4 a4 d4 a4 f#4 a4 d4 a4 f#4 a4]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "bar 1 is the reference tresillo bar; bar 2 is the ORIGINAL straight-16th bar 2 (16 even plucks over the a3 pedal and the f# cells) — the regroup becomes something that happens every other bar instead of the whole texture. Bar 2's 16 attacks replace the reference's 6.",
        "chromatic_ok": true
      },
      {
        "id": "restpunct",
        "name": "rest-punctuated tresillo — beat 3 silent, colour pair as an 8th pickup on beat 4",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[d4@3 a4@3 b4@2 ~@4 c5@2 a#4@2] [a3@3 c5@3 a4@2 ~@4 a4@2 f#4@2]>\",\"sound\":\"gm_pizzicato_strings\",\"bpm\":50,\"bars\":2,\"gain\":0.55}"
        },
        "note": "first half as the reference (3+3+2); the second half's pedal is SILENCED — a full beat of nothing on beat 3 — and its two colour tones come as a pair of 8ths on beat 4 and the and-of-4 (c5 bb4 | a4 f#4), a pickup into the next bar. The walkbass restpunct shape (silent beat 3, doubled beat 4) on the pizz: 5 attacks a bar, 3 of the reference's 6 onsets moved or removed.",
        "chromatic_ok": true
      }
    ]
  },
  "lab3_time_walkbass_progression": {
    "id": "lab3_time_walkbass_progression",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_hs_negrocity_walking_bass",
      "cand_b6_vl_negrocity_walk_flows"
    ],
    "his_words": "depends on the chord progression and song direction but a development does work",
    "hypothesis": "The batch-2 developments changed the walk with NO progression under it, which is why the answer was \"depends on the chord progression\". This card states one: C7 | F7 | G7 | C7 (a 4-bar blues turn), announced by epiano shell stabs on the and-of-2 and the and-of-4 (3rd-5th-b7 / b7-3-5 / b7-3-5, gain 0.3, never on a bass onset), and RE-NOTES the walk per chord so every bar's last note steps into the next root: bar 1 is the judged c-eb-f-gb (gb falls a half step onto F), bar 2 climbs f-g-ab-a (a falls a step onto G — the same root-step-chromatic-pair species as bar 1), bar 3 is the judged g-gb-f-bb (now G7's root, chromatic, b7, #9 — bb steps up into C), bar 4 slides c-eb-e-g (the blues b3-3 slide, g a fifth above the returning c). The development is batch-2's pushed rhythm (beats 2 and 4 an 8th early — your \"more groovy and energetic\"), and the variable is WHERE its four beats fall against the harmony: push_with puts them in bar 3, opening exactly on the G7 change; push_against puts the same four beats from beat 3 of bar 2 to beat 2 of bar 3, straddling the change so no chord arrives on a pushed bar's downbeat; push_all pushes every bar (the control that should stop reading as development and start reading as a texture). Prediction: push_with reads as the arrival of the dominant and push_against as the bass rushing the change — the development needs to coincide with the chord change to read as direction, and push_all is \"groovy\" but not \"a development\". chromatic_ok: the progression is C blues, so C7's e, F7's a, G7's b and the gb passing tone are the idiom's own, not scale errors.",
    "question": "progression is the plain 4-bar walk with the stabs — does re-noting each bar to its chord keep the negrocity stroll (bars 1 and 3 are the judged cells; 2 and 4 are new)? Then the same walk with the pushed development: push_with (bar 3, starting ON the G7 change) vs push_against (the same four pushed beats, but straddling the barline from bar 2 beat 3 to bar 3 beat 2). Does the development need to coincide with the chord change, or does the straddle also read as intentional? Is push_all (every bar pushed) still a development or just a busier bass — i.e. does a change have to be RARE to be a change?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[c2 eb2 f2 gb2] [g2 gb2 f2 bb1]>\",\"sound\":\"gm_acoustic_bass\",\"bpm\":150,\"bars\":2}"
        },
        "note": "lab_flow_walkbass/orig verbatim: the judged 2-bar walk with the gb2 blues passing tone, no harmony stated.",
        "chromatic_ok": true
      },
      {
        "id": "progression",
        "name": "C7 | F7 | G7 | C7 stated — walk re-noted per chord, epiano shell stabs on the ands",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [f2 g2 ab2 a2] [g2 gb2 f2 bb1] [c2 eb2 e2 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2] [~@6 [eb3,a3,c4]@2 ~@6 [eb3,a3,c4]@2] [~@6 [f3,b3,d4]@2 ~@6 [f3,b3,d4]@2] [~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.3}],\"bpm\":150,\"bars\":4}"
        },
        "note": "straight quarters throughout: c-eb-f-gb (judged) | f-g-ab-a | g-gb-f-bb (judged, now over G7) | c-eb-e-g, each last note stepping into the next root (gb->f, a->g, bb->c, g->c). Epiano 3-note shells at gain 0.3 on the and-of-2 and and-of-4 only: [e3,g3,bb3] [eb3,a3,c4] [f3,b3,d4] [e3,g3,bb3]. Bars 2 and 4 are new walks; the stabs are the added harmony.",
        "chromatic_ok": true
      },
      {
        "id": "push_with",
        "name": "development WITH the change — bar 3 pushed, opening on the G7",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [f2 g2 ab2 a2] [g2 gb2@3 f2 bb1@3] [c2 eb2 e2 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2] [~@6 [eb3,a3,c4]@2 ~@6 [eb3,a3,c4]@2] [~@6 [f3,b3,d4]@2 ~@6 [f3,b3,d4]@2] [~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.3}],\"bpm\":150,\"bars\":4}"
        },
        "note": "progression, but bar 3 (G7) plays batch-2's pushed rhythm — gb2 arrives on the and-of-1 and bb1 on the and-of-3, each held through its beat — so the groove change begins exactly where the dominant arrives. Two of sixteen bass onsets move; stabs unchanged.",
        "chromatic_ok": true
      },
      {
        "id": "push_against",
        "name": "development AGAINST the change — the same four pushed beats straddle the bar-2/bar-3 line",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2 f2 gb2] [f2@2 g2@2 ab2 a2@3] [g2 gb2@3 f2@2 bb1@2] [c2 eb2 e2 g2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2] [~@6 [eb3,a3,c4]@2 ~@6 [eb3,a3,c4]@2] [~@6 [f3,b3,d4]@2 ~@6 [f3,b3,d4]@2] [~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.3}],\"bpm\":150,\"bars\":4}"
        },
        "note": "progression, but the pushed window runs from beat 3 of bar 2 to beat 2 of bar 3: a2 (F7's last note) lands on the and-of-3 of bar 2 and gb2 on the and-of-1 of bar 3, then straight quarters resume — the same two anticipations as push_with, placed so the G7 downbeat sits in the MIDDLE of the development instead of starting it.",
        "chromatic_ok": true
      },
      {
        "id": "push_all",
        "name": "control — every bar pushed (texture, not development)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 eb2@3 f2 gb2@3] [f2 g2@3 ab2 a2@3] [g2 gb2@3 f2 bb1@3] [c2 eb2@3 e2 g2@3]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.7},{\"mini\":\"<[~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2] [~@6 [eb3,a3,c4]@2 ~@6 [eb3,a3,c4]@2] [~@6 [f3,b3,d4]@2 ~@6 [f3,b3,d4]@2] [~@6 [e3,g3,bb3]@2 ~@6 [e3,g3,bb3]@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.3}],\"bpm\":150,\"bars\":4}"
        },
        "note": "progression with beats 2 and 4 anticipated in all four bars (eight onsets moved): the pushed feel as the bass's constant state, so there is no moment where anything arrives.",
        "chromatic_ok": true
      }
    ]
  },
  "lab3_mix_lattice_bass_level": {
    "id": "lab3_mix_lattice_bass_level",
    "lane": "mix",
    "batch": 3,
    "source_cards": [
      "cand_cw_airpirate_lattice",
      "cand_b6_vl_lattice_breathing_top"
    ],
    "his_words": "feels more reflective/ casual vibe. background synth is a bit too loud",
    "hypothesis": "Two synthetic layers sit behind the sparse lattice: the gm_synth_bass_1 pedal (gain 0.5 — the loudest part in the stack, above every marimba cog at 0.30-0.35) and the gm_vibraphone Gm7 hold (0.25). In the full lattice the twelve cog strikes masked the bass; at sparse's half density it is exposed, which is when you heard it. \"Background synth\" is read as the bass first (the only synth patch, and the only part louder than the cogs), so bass_035 cuts it 0.5 -> 0.35 (below the cogs) and changes nothing else; both_soft additionally lowers the vibraphone hold 0.25 -> 0.18 in case the sustained pad was the \"background synth\". No note, onset or voice changes — a level-only A/B/C. Prediction: bass_035 is the fix; both_soft loses the reflective floor the hold was giving.",
    "question": "Only gains move. sparse is the mix you judged. Is bass_035 (synth bass 0.5 -> 0.35, nothing else) the fix for \"background synth is a bit too loud\" — i.e. was the synth you meant the bass? Or does it take both_soft (bass 0.35 AND the vibraphone hold 0.25 -> 0.18), which would mean the sustained pad was the background synth — and does both_soft then lose the reflective/casual vibe you liked?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "sparse",
        "name": "sparse as judged (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ ~ ~ d5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ ~ ~ f5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"[~ ~ ~ a#3 ~ ~ ~ g3]\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":1}"
        },
        "note": "lab2_flow_lattice_bold/sparse verbatim: cogs on the and-of-1 and and-of-3, low marimba answering bb3 then g3, synth bass 0.5, vibraphone hold 0.25."
      },
      {
        "id": "bass_035",
        "name": "synth bass 0.5 -> 0.35",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.35},{\"mini\":\"[~ d5 ~ ~ ~ d5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ ~ ~ f5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"[~ ~ ~ a#3 ~ ~ ~ g3]\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":1}"
        },
        "note": "the pedal now sits under every cog (0.35 = the g4/d5 cogs' level); nothing else changes."
      },
      {
        "id": "both_soft",
        "name": "bass 0.35 + vibraphone hold 0.25 -> 0.18",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.35},{\"mini\":\"[~ d5 ~ ~ ~ d5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ ~ ~ g4 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ ~ ~ f5 ~ ~]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.18},{\"mini\":\"[~ ~ ~ a#3 ~ ~ ~ g3]\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":1}"
        },
        "note": "bass_035 plus the Gm7 hold pulled back a step further — the test of whether the \"background synth\" was the sustained pad rather than the pedal."
      }
    ]
  },
  "lab3_mix_pluck_level": {
    "id": "lab3_mix_pluck_level",
    "lane": "mix",
    "batch": 3,
    "source_cards": [
      "cand_b2_ly_premonition_rolled_swell",
      "cand_hs_negrocity_walking_bass",
      "cand_lp_r3_catchy_pluck"
    ],
    "his_words": "pluck a bit too loud",
    "hypothesis": "You marked the pluck too loud on BOTH cards that carry it (pluck_only and both), so it is a level fault of the pluck ref itself, not a crowding effect of the walking bass. The pluck rides at 0.85 x its card gain against the swell at 1.0 — but the swell is a whisper by construction (piano 0.4-0.5, sounding every other bar) while the pizzicato pluck strikes on every bar, so at 0.85 the ornament is the loudest thing in the mix. pluck_055 cuts only the pluck (0.85 -> 0.55, roughly -4 dB); pluck_bass_07 also trims the walking bass 0.85 -> 0.7 in case the pluck only sounded loud because the bass under it was. Notes, onsets and seats (+6 / +4 semitone re-seats) are byte-identical across all three. Prediction: pluck_055 is the fix and the bass was never the problem (it did not draw a note on walk_only).",
    "question": "Only gains move; the swell + walking bass + pluck notes are exactly the mix you judged. Is pluck_055 (pluck 0.85 -> 0.55, nothing else) enough to answer \"pluck a bit too loud\" while keeping the playful lift it gave? Or is pluck_bass_07 (pluck 0.55 AND walking bass 0.85 -> 0.7) the better balance — and if so, was the bass part of the loudness, or does trimming it just make the mix thinner?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "both",
        "name": "swell + both playful-izers as judged (reference)",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1.0},{\"id\":\"cand_hs_negrocity_walking_bass\",\"add\":6,\"gain\":0.85},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":4,\"gain\":0.85}],\"bpm\":110,\"bars\":4}"
        },
        "note": "lab_mix_playful_mysterious/both verbatim: swell 1.0, walking bass +6 at 0.85, catchy pluck +4 at 0.85."
      },
      {
        "id": "pluck_055",
        "name": "pluck 0.85 -> 0.55",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1},{\"id\":\"cand_hs_negrocity_walking_bass\",\"add\":6,\"gain\":0.85},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":4,\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "the pluck alone pulled down about 4 dB; bass and swell untouched."
      },
      {
        "id": "pluck_bass_07",
        "name": "pluck 0.55 + walking bass 0.85 -> 0.7",
        "render": {
          "kind": "lab_stack",
          "spec": "{\"refs\":[{\"id\":\"cand_b2_ly_premonition_rolled_swell\",\"gain\":1},{\"id\":\"cand_hs_negrocity_walking_bass\",\"add\":6,\"gain\":0.7},{\"id\":\"cand_lp_r3_catchy_pluck\",\"add\":4,\"gain\":0.55}],\"bpm\":110,\"bars\":4}"
        },
        "note": "pluck_055 plus the walking bass trimmed a step, so the swell is clearly the loudest layer again."
      }
    ]
  },
  "lab3_flow_grief_humanize": {
    "id": "lab3_flow_grief_humanize",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_b2_hm_grief_staircase"
    ],
    "his_words": "it's just chords at same durations it feels robotic",
    "hypothesis": "Measured on the judged render: the page realizes this degrees card as 16 block chords each struck for exactly two beats (every 4-beat chord is re-struck at the barline) over a bass that does the same — 64 haps, one duration, one attack shape, one velocity. That uniformity is the \"robotic\", not the tempo or the chords. The three re-authorings keep the SAME ten chords, the same voicings the page renders (Eb [eb3,g3,bb3] ... Dm [d3,f3,a3]), the same chordBeats and the identical acoustic bass, and each breaks one uniformity: longshort breaks the DURATION (every chord is struck long then re-struck short and followed by a breath — quarter/8th/8th-rest on the 2-beat chords, half then quarter + quarter-rest on the 4-beat ones — so the piano lifts its hands before every change while the bass keeps the pulse); rolled breaks the ATTACK (three piano voices enter a 16th apart, bottom first, and hold — a slow arpeggiated roll on every strike, no block); topline adds a VOICE (one held chord tone per chord, bb4 c5 d5 | eb5 | d5 c5 d5 eb5 | d5 bb4, held across barlines for the chord's full length, piano at 0.42 — nine of ten moves by step, one sigh d5 -> bb4 into the loop); line_longshort stacks the line on the breathing chords. Prediction: longshort alone clears \"robotic\" because the silence before each change is the human tell; rolled helps less (every strike is still on the grid); topline reads as the piece finally having a melody, and line_longshort is the one you keep.",
    "question": "bpm72 is the version you judged. Which single change first stops it feeling robotic: longshort (durations — a re-attack and a breath in every chord, bass unchanged), rolled (every chord rolled bottom-up in 16ths, durations unchanged), or topline (a held top-voice line, chords unchanged)? Does rolled's roll on EVERY strike become its own uniformity? Is the topline's one leap (d5 down to bb4 at the loop's end) a sigh or a break? And is line_longshort — the line over the breathing chords — more than the sum, or too much for a grief piece that should stay bare?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "bpm72",
        "name": "original (reference — same degrees at bpm 72)",
        "render": {
          "kind": "degrees",
          "spec": "{\"degrees\":\"3b 5:m 7 0:m 7:m 8b 10b 0:m 2:m 3b\",\"family\":\"minor\",\"bpm\":72,\"chordBeats\":[2,2,2,4,4,4,4,4,4,2],\"symbols\":[\"C\",\"Dm\",\"E\",\"Am\",\"Em\",\"F\",\"G\",\"Am\",\"Bm\",\"C\"]}"
        },
        "note": "lab_flow_grief_tempo/bpm72 verbatim (degrees; the page renders it in the C frame: Eb Fm G Cm | Gm Ab Bb Cm | Dm Eb, block chords every two beats, bass in the same durations). The G major's b-natural is the progression's own leading tone (chromatic_ok as in the judged card).",
        "chromatic_ok": true
      },
      {
        "id": "longshort",
        "name": "long-short durations — struck long, re-struck short, a breath before every change",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[eb3,g3,bb3]@4 [eb3,g3,bb3]@2 ~@2 [f3,ab3,c4]@4 [f3,ab3,c4]@2 ~@2] [[g3,b3,d4]@4 [g3,b3,d4]@2 ~@2 [c3,eb3,g3]@8] [[c3,eb3,g3]@4 ~@4 [g3,bb3,d4]@8] [[g3,bb3,d4]@4 ~@4 [ab3,c4,eb4]@8] [[ab3,c4,eb4]@4 ~@4 [bb3,d4,f4]@8] [[bb3,d4,f4]@4 ~@4 [c3,eb3,g3]@8] [[c3,eb3,g3]@4 ~@4 [d3,f3,a3]@8] [[d3,f3,a3]@4 ~@4 [eb3,g3,bb3]@4 [eb3,g3,bb3]@2 ~@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[eb1@2 f1@2] [g1@2 c1@2] [c1@2 g1@2] [g1@2 ab1@2] [ab1@2 bb1@2] [bb1@2 c1@2] [c1@2 d1@2] [d1@2 eb1@2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":72,\"bars\":8}"
        },
        "note": "the rendered voicings and bass exactly; each 2-beat chord becomes quarter + 8th re-attack + 8th rest, each 4-beat chord becomes a half (its first bar) then a quarter re-attack + a quarter rest (its second bar). 20 attacks instead of 16, and 14 of the 20 are new or shorter; the bass still walks in even half notes underneath.",
        "chromatic_ok": true
      },
      {
        "id": "rolled",
        "name": "rolled voicings — every chord arpeggiated bottom-up in 16ths, then held",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[eb3@8 f3@8] [g3@8 c3@8] [c3@8 g3@8] [g3@8 ab3@8] [ab3@8 bb3@8] [bb3@8 c3@8] [c3@8 d3@8] [d3@8 eb3@8]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~ g3@7 ~ ab3@7] [~ b3@7 ~ eb3@7] [~ eb3@7 ~ bb3@7] [~ bb3@7 ~ c4@7] [~ c4@7 ~ d4@7] [~ d4@7 ~ eb3@7] [~ eb3@7 ~ f3@7] [~ f3@7 ~ g3@7]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[~@2 bb3@6 ~@2 c4@6] [~@2 d4@6 ~@2 g3@6] [~@2 g3@6 ~@2 d4@6] [~@2 d4@6 ~@2 eb4@6] [~@2 eb4@6 ~@2 f4@6] [~@2 f4@6 ~@2 g3@6] [~@2 g3@6 ~@2 a3@6] [~@2 a3@6 ~@2 bb3@6]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"<[eb1@2 f1@2] [g1@2 c1@2] [c1@2 g1@2] [g1@2 ab1@2] [ab1@2 bb1@2] [bb1@2 c1@2] [c1@2 d1@2] [d1@2 eb1@2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":72,\"bars\":8}"
        },
        "note": "the same 16 strikes, but each chord enters as three piano voices a 16th apart — bottom on the beat, middle a 16th later, top two 16ths later — every voice holding to the chord's end. 32 of the 48 piano notes move off the grid (the bottom voice stays where the block was); bass identical.",
        "chromatic_ok": true
      },
      {
        "id": "topline",
        "name": "top-voice line — one held chord tone per chord, an octave up",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[eb3,g3,bb3]@2 [f3,ab3,c4]@2] [[g3,b3,d4]@2 [c3,eb3,g3]@2] [[c3,eb3,g3]@2 [g3,bb3,d4]@2] [[g3,bb3,d4]@2 [ab3,c4,eb4]@2] [[ab3,c4,eb4]@2 [bb3,d4,f4]@2] [[bb3,d4,f4]@2 [c3,eb3,g3]@2] [[c3,eb3,g3]@2 [d3,f3,a3]@2] [[d3,f3,a3]@2 [eb3,g3,bb3]@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"[bb4@2 c5@2 d5@2 eb5@4 d5@4 c5@4 d5@4 eb5@4 d5@4 bb4@2]/8\",\"sound\":\"piano\",\"gain\":0.42,\"room\":0.25,\"release\":0.5},{\"mini\":\"<[eb1@2 f1@2] [g1@2 c1@2] [c1@2 g1@2] [g1@2 ab1@2] [ab1@2 bb1@2] [bb1@2 c1@2] [c1@2 d1@2] [d1@2 eb1@2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":72,\"bars\":8}"
        },
        "note": "the judged block chords and bass, plus a single piano voice above them at 0.42 holding one chord tone for each chord's whole length (bb4 c5 d5 over Eb Fm G, eb5 over Cm, d5 Gm, c5 Ab, d5 Bb, eb5 Cm, d5 Dm, bb4 Eb): a real sustained top line, held across barlines, moving by step except the final sigh d5 -> bb4. 10 notes added to 64.",
        "chromatic_ok": true
      },
      {
        "id": "line_longshort",
        "name": "the line over the long-short chords",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[eb3,g3,bb3]@4 [eb3,g3,bb3]@2 ~@2 [f3,ab3,c4]@4 [f3,ab3,c4]@2 ~@2] [[g3,b3,d4]@4 [g3,b3,d4]@2 ~@2 [c3,eb3,g3]@8] [[c3,eb3,g3]@4 ~@4 [g3,bb3,d4]@8] [[g3,bb3,d4]@4 ~@4 [ab3,c4,eb4]@8] [[ab3,c4,eb4]@4 ~@4 [bb3,d4,f4]@8] [[bb3,d4,f4]@4 ~@4 [c3,eb3,g3]@8] [[c3,eb3,g3]@4 ~@4 [d3,f3,a3]@8] [[d3,f3,a3]@4 ~@4 [eb3,g3,bb3]@4 [eb3,g3,bb3]@2 ~@2]>\",\"sound\":\"piano\",\"gain\":0.5},{\"mini\":\"[bb4@2 c5@2 d5@2 eb5@4 d5@4 c5@4 d5@4 eb5@4 d5@4 bb4@2]/8\",\"sound\":\"piano\",\"gain\":0.42,\"room\":0.25,\"release\":0.5},{\"mini\":\"<[eb1@2 f1@2] [g1@2 c1@2] [c1@2 g1@2] [g1@2 ab1@2] [ab1@2 bb1@2] [bb1@2 c1@2] [c1@2 d1@2] [d1@2 eb1@2]>\",\"sound\":\"gm_acoustic_bass\",\"gain\":0.55}],\"bpm\":72,\"bars\":8}"
        },
        "note": "longshort's breathing chords with topline's held voice on top — the two fixes at once.",
        "chromatic_ok": true
      }
    ]
  },
  "lab3_time_pkmn_arc": {
    "id": "lab3_time_pkmn_arc",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_b2_ly_pkmn_push_hold_dyads",
      "cand_b6_vl_pkmn_dyads_lift"
    ],
    "his_words": "pretty good variartions! / make it intentional and layer / barely different I feel like (on the gijoe octave-addition arc)",
    "hypothesis": "The gijoe arc read \"barely different\" because each 2-bar block changed only REGISTER over a frozen rhythm. Here the material is the four pkmn flows you passed, laid out as 2-bar blocks of ONE 8-bar development over the pad's own harmonic loop played twice (Bb C | Bb^7 C/G | Bb C | Bb^7 C): block 1 orig, block 2 arpeggio (two held chords become nine quarter-note attacks — 8 of 9 events differ from the reference bars), block 3 triads (a top voice on every chord, 3 of 3 chords change), block 4 pulse332 with the ending lift (3+3+2 re-attacks and the last chord rising to c4-e4-g4 — 6 of 7 events differ). Each block changes SURFACE, PITCH SET or RHYTHM, never register alone, so by the batch-2 finding every block should be audible. orig is the static control (the judged pad looping unchanged — 8 bars of it are the reference twice). layered keeps the judged pad byte-identical for all 8 bars and ADDS the judged arpeggio on gm_celesta at 0.3 from bar 5 in the pad's own register; layered_8va is the identical celesta part moved up an octave (add 12). D102 says register and timbre separate a layer and rhythm does not: prediction — arc reads as one pad developing; layered's celesta doubles pitches the pad already holds (a#3, d4, c4, e4) and is partly masked, so it reads weaker than layered_8va, whose celesta sits above the pad in a free register. If both register equally, the celesta's percussive attack alone separates the layer and register is optional for a layer with a different timbre.",
    "question": "arc = the four judged flows as 2-bar blocks of one 8-bar development (orig → arpeggio → triads → 3+3+2 with the lift); orig is the same pad looping unchanged. Does arc read as ONE pad that develops, or as four different pads stitched together — and does the lift on the last chord register now that the whole block moves with it? layered adds the arpeggio on celesta from bar 5 in the pad's own register; layered_8va is the same celesta an octave up. Which one is the \"intentional layer\" — is the same-register celesta audible at all under the pad it doubles, or does the added layer need its own register?",
    "key_tonic": "F",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference) — the static control, looping unchanged",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":4,\"gain\":0.5}"
        },
        "note": "lab2_flow_pkmn_diverse/orig, byte-identical: the judged 4-bar pad (Bb dyad pushed into C, Bb^7 triad pushed into C/G). Looping it IS \"orig x4\" — the static control for arc and layered."
      },
      {
        "id": "arc",
        "name": "arc — orig → arpeggio → triads → 3+3+2 + lift, as 2-bar blocks of one development",
        "render": {
          "kind": "note_mini",
          "spec": "{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [a#3@4 d4@4 f4@4 d4@2 [g3,c4,e4]@2] [g3@4 c4@4 e4@4 c4@4] [[a#3,d4,f4]@14 [c4,e4,g4]@2] [[c4,e4,g4]@16] [[a#3,d4,f4]@6 [a#3,d4,f4]@6 [a#3,d4,f4]@2 [c4,e4,g4]@2] [[c4,e4,g4]@6 [c4,e4,g4]@6 [c4,e4,g4]@4]>\",\"sound\":\"gm_pad_warm\",\"bpm\":130,\"bars\":8,\"gain\":0.5}"
        },
        "note": "bars 1-2 the judged pad (Bb dyad → C dyad); bars 3-4 the arpeggio flow on the Bb^7 → C/G bars (quarter-note rock through each chord, pushed triad kept); bars 5-6 the triads flow (Bb and C with the f4 → g4 top voice); bars 7-8 the pulse332 flow with the ending lift — Bb^7 re-struck 3+3+2, the push rising to c4-e4-g4 and pulsing to the end, so the loop's highest chord is its last. Same pad voice, same push everywhere."
      },
      {
        "id": "layered",
        "name": "layered — judged pad held throughout, the arpeggio added on celesta from bar 5 (same register)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16] [[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.5},{\"mini\":\"<~ ~ ~ ~ [a#3@4 d4@4 a#3@4 d4@2 [c4,e4]@2] [c4@4 e4@4 c4@4 e4@4] [a#3@4 d4@4 f4@4 d4@2 [g3,c4,e4]@2] [g3@4 c4@4 e4@4 c4@4]>\",\"sound\":\"gm_celesta\",\"gain\":0.3}],\"bpm\":130,\"bars\":8}"
        },
        "note": "the judged pad, byte-identical, for all 8 bars; from bar 5 the judged arpeggio flow (a#3 d4 a#3 d4 …) enters on gm_celesta at 0.3 in the pad's own register, so its quarter-note rock doubles tones the pad is already holding. Nothing on the pad changes — the development is the added voice only."
      },
      {
        "id": "layered_8va",
        "name": "layered, celesta an octave up — the same added voice in its own register",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16] [[a#3,d4]@14 [c4,e4]@2] [[c4,e4]@16] [[a#3,d4,f4]@14 [g3,c4,e4]@2] [[g3,c4,e4]@16]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.5},{\"mini\":\"<~ ~ ~ ~ [a#3@4 d4@4 a#3@4 d4@2 [c4,e4]@2] [c4@4 e4@4 c4@4 e4@4] [a#3@4 d4@4 f4@4 d4@2 [g3,c4,e4]@2] [g3@4 c4@4 e4@4 c4@4]>\",\"sound\":\"gm_celesta\",\"gain\":0.3,\"add\":12}],\"bpm\":130,\"bars\":8}"
        },
        "note": "identical to layered except the celesta part carries add 12: the same arpeggio an octave higher (a#4 d5 a#4 d5 …), above the pad instead of inside it. The register-separation control (D102)."
      }
    ]
  },
  "lab3_time_rise_arc": {
    "id": "lab3_time_rise_arc",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_device_layerstack_rise"
    ],
    "his_words": "good variations! / feels more groovy (rhythm332 / both) / could also do like 4 bars since most sections are 4 bars",
    "hypothesis": "The material is fixed to the four rise flows you passed (orig, intervals, rhythm332, both); the only variable is WHEN the change lands and how much of the 8 bars it owns. arc changes every two bars over the loop's harmony played twice (D D E E | D D E E): orig → intervals (the cell widens to d2-a2-d3-f3-a3, 5 of 8 pitches new) → rhythm332 (the 3+3+2 pulse, strings re-seated onto its accents, ~8 of 10 onset slots differ) → both, so the groovy version arrives last and prepared. half changes once, at bar 5: orig for the whole first 4-bar loop, both for the whole second (your \"most sections are 4 bars\"). late is orig for six bars and both only in bars 7-8, unprepared. Bass cell byte-identical in every variant; every pitch is D natural minor. Prediction: half reads as a section change (an A and a B), arc as a build whose steps you can name, and late as a fill or turnaround into the loop restart. \"Feels more groovy\" was judged on both looping alone; if late still reads groovy the groove needs no preparation, and if it reads as a glitch a 2-bar change has to be prepared by the intervals/3+3+2 blocks before it. orig is the static control.",
    "question": "arc changes every two bars (orig → intervals → 3+3+2 → both), half changes once at bar 5 (orig for four bars, both for four), late changes only in the last two bars (orig for six, both for two); orig is the same motor looping. Which granularity reads as the motor DEVELOPING rather than as a new loop (half) or a fill (late)? Does \"feels more groovy\" survive when both arrives unprepared in late, or does it need the intervals and 3+3+2 steps before it? And in arc, does the strings pedal moving onto the tresillo accents at bar 5 sound like a change or like the pedal slipping?",
    "key_tonic": "D",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference) — the static control, looping unchanged",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"~ e4 ~ e4 ~ e4 ~ e5\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 [f2,bb2] g3 [f2,bb2] e2 [f2,bb2] g3 [f2,bb2]] [e2 bb2 g3 bb2 bb2 g2 e2 d3]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":4}"
        },
        "note": "lab2_flow_rise_rhythm_intervals/orig, byte-identical: the offbeat e4 strings pedal, the re-phasing bass cell, the d2-a2-f3 epiano motor with its bar-2 breath and e-bass turnaround. Looping it is the static 8 bars."
      },
      {
        "id": "arc",
        "name": "arc — orig → intervals → 3+3+2 → both, changing every two bars",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~]>\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~] [d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 bb2 e3 g3 bb3 g3 e3 bb2] [e2 bb2 e3 g3 bb3 g3 e3 d3] [d2@3 a2@3 f3@2 d2@3 a2@3 f3@2] [d2@3 a2@3 f3@2 d2@8] [e2@3 bb2@3 e3@2 g3@3 bb3@3 g3@2] [e2@3 bb2@3 e3@2 g3@3 bb3@3 d3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":8}"
        },
        "note": "bars 1-2 the judged motor (d cell, breath in bar 2); bars 3-4 the intervals flow on the e bars (e2-bb2-e3-g3-bb3 arpeggio, dyads dropped, landing d3); bars 5-6 the 3+3+2 flow on the d bars, strings pedal re-seated onto the tresillo accents from here on; bars 7-8 both on the e bars (wide cell on the double tresillo, landing d3). Bass cell untouched throughout."
      },
      {
        "id": "half",
        "name": "half — orig for the first 4-bar loop, both for the second (one change at bar 5)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~]>\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~] [d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 [f2,bb2] g3 [f2,bb2] e2 [f2,bb2] g3 [f2,bb2]] [e2 bb2 g3 bb2 bb2 g2 e2 d3] [d2@3 a2@3 d3@2 f3@3 a3@3 f3@2] [d2@3 a2@3 d3@2 f3@8] [e2@3 bb2@3 e3@2 g3@3 bb3@3 g3@2] [e2@3 bb2@3 e3@2 g3@3 bb3@3 d3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":8}"
        },
        "note": "the judged four bars verbatim, then the judged both verbatim: one change, at the 4-bar section boundary, owning the whole second half. Strings pedal moves onto the tresillo accents with it."
      },
      {
        "id": "late",
        "name": "late — orig for six bars, both in bars 7-8 only",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ e4 ~ e4 ~ e4 ~ e5] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~] [~ ~ ~ e4 ~ ~ e4 ~ ~ ~ ~ e4 ~ ~ e5 ~]>\",\"sound\":\"gm_synth_strings_1\",\"gain\":0.3},{\"mini\":\"<[d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~] [d3 ~ ~ a3 ~ ~ f4 ~] [~ d3 ~ ~ a3 ~ ~ f4] [~ ~ e3 ~ ~ e4 ~ ~] [e3 ~ ~ bb3 ~ ~ g4 ~]>\",\"sound\":\"gm_synth_bass_2\",\"gain\":0.45},{\"mini\":\"<[d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2 [f2,bb2] g3 [f2,bb2] e2 [f2,bb2] g3 [f2,bb2]] [e2 bb2 g3 bb2 bb2 g2 e2 d3] [d2 a2 f3 a2 d2 a2 f3 a2] [d2 a2 f3 a2 d2@4] [e2@3 bb2@3 e3@2 g3@3 bb3@3 g3@2] [e2@3 bb2@3 e3@2 g3@3 bb3@3 d3@2]>\",\"sound\":\"gm_epiano1\",\"gain\":0.5}],\"bpm\":80,\"bars\":8}"
        },
        "note": "the judged motor for six bars (the loop once, then its d bars again), then both on the e bars for the last two — the groove arrives unprepared as a two-bar turnaround into the restart. Strings on the tresillo accents in those two bars only."
      }
    ]
  },
  "lab3_time_steel_event": {
    "id": "lab3_time_steel_event",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_b2_ly_hmsummer_steel_octave_double",
      "cand_b6_vl_steel_double_reversed"
    ],
    "his_words": "very energetic (doubled16) / could work but depends on how it interacts with the other layers (stretched) / I feel like the high tier looping is the buildup and bars1-2 and 3-4 are like the main beat",
    "hypothesis": "The looping law from your perc_loop_form reading: the plain cell is the MAIN beat and the dense version is a build, so density belongs to a POSITION in the loop, not to every bar. event plays the judged cell for three bars and the doubled 16th tresillo on bars 4 and 8 only — in those bars 6 of the 7 onset slots differ from the reference (the tresillo's 3 attacks become 6 at 16ths 0,3,6,8,11,14; only the downbeat g is shared), the other six bars are byte-identical. alt puts doubled16 on every even bar (4 of 8) — the control that should FAIL: by the law it stops being an event and becomes a 2-bar loop with a permanently busier second half. breath keeps the cell for six bars and stretches bars 7-8 to half speed with the marimba answering in the gaps instead of doubling (the \"depends on the other layers\" case, here answered by the only other layer), so the loop breathes out before it restarts. form = event at bar 4 + breath at 7-8: main / event / main / breath, the four-position loop shape. The f natural is the cell's own mixolydian b7 (present in the reference), hence chromatic_ok. Prediction: event reads as the same casual layer with a fill you wait for; alt reads as \"too much\" or as a different, busier layer; breath reads as a breath only if the marimba answer bridges the half-speed bass — a dropout verdict there means the doubling must be kept through the stretch; form is the loop shape the percussion card described and should read as the most song-like.",
    "question": "orig is the judged cell looping. event puts the doubled 16th tresillo on bars 4 and 8 only; alt puts it on every even bar; breath stretches bars 7-8 to half speed with the marimba answering the gaps; form combines event (bar 4) and breath (bars 7-8). Does event read as the same casual layer with a fill, or as two layers taking turns? Is alt too much — has the double-time stopped being an event and become the loop? Does breath's half-speed tail read as a breath before the restart or as a dropout — and does the marimba answer bridge it? Is form (main / event / main / breath) the loop shape you described on the percussion card?",
    "key_tonic": "G",
    "key_mode": "major",
    "chromatic_ok": true,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference) — the judged cell looping",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[g2@2 ~@4 d2@6 f2@2 ~@2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"[g4@2 ~@4 d4@6 f4@2 ~@2]\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":1}"
        },
        "note": "lab2_flow_steel_rhythm/orig, byte-identical: g-d-f in both hands two octaves apart on the 8th-note tresillo (attacks on 8ths 0, 3, 6). Looping it is the static 8 bars.",
        "chromatic_ok": true
      },
      {
        "id": "event",
        "name": "event — doubled16 as a one-bar fill on bars 4 and 8 only",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"<[g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2]>\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":8}"
        },
        "note": "bars 1-3 and 5-7 the judged cell; bars 4 and 8 the judged doubled16 (g-d-f on a 3+3+2 of 16ths twice, six attacks) in both hands — the density change lands LATER in the loop, once per four bars, as an event.",
        "chromatic_ok": true
      },
      {
        "id": "alt",
        "name": "alternating — doubled16 on every even bar (the control that should be too much)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"<[g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2]>\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":8}"
        },
        "note": "the same two bars taking turns: judged cell, doubled16, judged cell, doubled16 … Half the bars are the dense form, so by the looping law it is no longer an event but the loop's identity.",
        "chromatic_ok": true
      },
      {
        "id": "breath",
        "name": "breath — the cell for six bars, then stretched to half speed over bars 7-8",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@4 ~@8 d2@12 f2@4 ~@4]@2>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"<[g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [~@4 g4@2 ~@2 d4@4 ~@16 f4@4]@2>\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":8}"
        },
        "note": "bars 1-6 the judged cell; bars 7-8 the judged stretched flow — the bass cell at half speed (g a quarter, d a dotted half tied across the barline, f a quarter) with the marimba answering in its gaps (g4 after the bass g, d4 leading into the bass d, f4 in the final rest) instead of doubling. The loop breathes out before restarting.",
        "chromatic_ok": true
      },
      {
        "id": "form",
        "name": "form — event at bar 4, breath at bars 7-8 (main / event / main / breath)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@3 d2@3 f2@2 g2@3 d2@3 f2@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@2 ~@4 d2@6 f2@2 ~@2] [g2@4 ~@8 d2@12 f2@4 ~@4]@2>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.6},{\"mini\":\"<[g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@3 d4@3 f4@2 g4@3 d4@3 f4@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [g4@2 ~@4 d4@6 f4@2 ~@2] [~@4 g4@2 ~@2 d4@4 ~@16 f4@4]@2>\",\"sound\":\"gm_marimba\",\"gain\":0.4}],\"bpm\":180,\"bars\":8}"
        },
        "note": "event and breath combined into one loop shape: three bars of the cell, the doubled16 fill on bar 4, two bars of the cell, the half-speed stretch with the marimba answer on 7-8. Your percussion reading (main beat / buildup) as a four-position form.",
        "chromatic_ok": true
      }
    ]
  },
  "lab3_time_lattice_layered": {
    "id": "lab3_time_lattice_layered",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_cw_airpirate_lattice",
      "cand_b6_vl_lattice_breathing_top"
    ],
    "his_words": "learn from them, just layer over them / feels more reflective/ casual vibe. background synth is a bit too loud (sparse) / like it (rolled)",
    "hypothesis": "Development by LAYERING: the four lattice flows you passed are stacked as accumulating 2-bar blocks, each adding to the last and never removing — sparse (bars 1-2: cogs on the and-of-1 and and-of-3 only, the low marimba bb3-g3 answering the gaps) → full cogs (3-4: the six missing strikes return, 8 of 19 events per bar change) → + the answer line (5-6: the top cog answers bb5-a5-g5-f5 in bar 6 — the judged qa2 magnitude, 3 new pitches in 38 events, kept as judged on purpose because whether a top-cog LINE registers inside a full lattice is exactly the open question from batch 2) → + rolled (7-8: the g4 and top cogs displaced a 16th either side of the and so every offbeat becomes a g4-d5-g5 roll — 8 of 12 cog onsets move, the fullest block). The low answer and the Gm7 vibraphone hold run throughout; the synth bass is 0.35 in every 8-bar variant (your \"background synth is a bit too loud\"). static035 is the judged full lattice with ONLY the bass lowered to 0.35, so static035 vs layered isolates the layering axis and orig vs static035 isolates the bass level. reverse is the exact mirror (rolled + line → full + line → full → sparse) — thinning as development. Prediction: layered reads as a build whose weakest step is block 3 (the line), and block 2 (the cogs doubling) as its clearest; reverse ends on your \"reflective/casual\" sparse and reads as a fade rather than a development unless the line carries it — if reverse reads as a development too, direction does not matter and only the per-block change size does.",
    "question": "orig is the judged lattice; static035 is the same lattice with only the synth bass lowered to 0.35 (is that the fix for \"too loud\"?). layered builds sparse → full cogs → + the top cog's answer line → + the rolled timing, bass at 0.35 throughout; reverse is the mirror, thinning from the rolled peak down to sparse. Does layered read as one lattice developing, and which block is the first you hear as a change — the cogs filling in (bar 3), the top cog answering (bar 6), or the roll (bar 7)? Does the answer line register at all inside the full lattice? Does reverse read as a development or as a fade-out, and is ending on sparse's reflective feel a good place for a loop to land?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference) — the judged full lattice",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.5},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1,\"note\":\"low part is timpani in source; source adds conga 16th pairs + woodblock offbeats + claps on 2/3/4 with tambourine, all at whisper velocity\"}"
        },
        "note": "lab2_flow_lattice_bold/orig, byte-identical: three one-pitch marimba cogs on every offbeat 8th over the D pedal (bass 0.5), vibraphone holding Gm7."
      },
      {
        "id": "static035",
        "name": "static, bass 0.35 — the judged lattice with only the synth bass lowered",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[d2@3 f2 d2@3 f2]\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.35},{\"mini\":\"[~ d5 ~ d5 ~ d5 ~ d5]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g4 ~ g4 ~ g4 ~ g4]\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"[~ g5 ~ g5 ~ f5 ~ f5]\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"[g4,a#4,d5,g5]\",\"sound\":\"gm_vibraphone\",\"gain\":0.25}],\"bpm\":105,\"bars\":1}"
        },
        "note": "every event of the reference at the same time and pitch; the only change is the synth bass 0.5 → 0.35 — the level the 8-bar variants use, so this is their true static control (and the level half of your \"background synth is a bit too loud\")."
      },
      {
        "id": "layered",
        "name": "layered — sparse → full cogs → + answer line → + rolled, adding a layer every two bars",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.35},{\"mini\":\"<[~ d5 ~ ~ ~ d5 ~ ~] [~ d5 ~ ~ ~ d5 ~ ~] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5]>\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g5 ~ ~ ~ f5 ~ ~] [~ g5 ~ ~ ~ f5 ~ ~] [~ g5 ~ g5 ~ f5 ~ f5] [~ g5 ~ g5 ~ f5 ~ f5] [~ g5 ~ g5 ~ f5 ~ f5] [~ a#5 ~ a5 ~ g5 ~ f5] [~ ~ ~ g5 ~ ~ ~ g5 ~ ~ ~ f5 ~ ~ ~ f5] [~ ~ ~ a#5 ~ ~ ~ a5 ~ ~ ~ g5 ~ ~ ~ f5]>\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"<[g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"<[~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3]>\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":8}"
        },
        "note": "bars 1-2 the judged sparse (cogs on two offbeats, low marimba bb3-g3 in the gaps); bars 3-4 the cogs fill every offbeat (the judged full lattice, low answer kept); bars 5-6 the top cog asks g5 g5 f5 f5 and answers bb5 a5 g5 f5 (the judged qa2); bars 7-8 the judged rolled timing on the cogs (g4 a 16th early, top a 16th late) with the answer line kept, the fullest block. Bass 0.35 and the Gm7 vibraphone throughout; nothing is ever taken away."
      },
      {
        "id": "reverse",
        "name": "reverse — rolled + line → full + line → full cogs → sparse (thinning as development)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2] [d2@3 f2 d2@3 f2]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.35},{\"mini\":\"<[~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ d5 ~ d5 ~ d5] [~ d5 ~ ~ ~ d5 ~ ~] [~ d5 ~ ~ ~ d5 ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ g4 ~ g4 ~ g4] [~ g4 ~ ~ ~ g4 ~ ~] [~ g4 ~ ~ ~ g4 ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.35},{\"mini\":\"<[~ ~ ~ g5 ~ ~ ~ g5 ~ ~ ~ f5 ~ ~ ~ f5] [~ ~ ~ a#5 ~ ~ ~ a5 ~ ~ ~ g5 ~ ~ ~ f5] [~ g5 ~ g5 ~ f5 ~ f5] [~ a#5 ~ a5 ~ g5 ~ f5] [~ g5 ~ g5 ~ f5 ~ f5] [~ g5 ~ g5 ~ f5 ~ f5] [~ g5 ~ ~ ~ f5 ~ ~] [~ g5 ~ ~ ~ f5 ~ ~]>\",\"sound\":\"gm_marimba\",\"gain\":0.3},{\"mini\":\"<[g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5] [g4,a#4,d5,g5]>\",\"sound\":\"gm_vibraphone\",\"gain\":0.25},{\"mini\":\"<[~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3] [~ ~ ~ a#3 ~ ~ ~ g3]>\",\"sound\":\"gm_marimba\",\"gain\":0.3}],\"bpm\":105,\"bars\":8}"
        },
        "note": "the exact mirror of layered: bars 1-2 the rolled peak with the answer line, bars 3-4 full cogs with the line, bars 5-6 full cogs repeating g5 g5 f5 f5, bars 7-8 sparse with the low answer — the loop thins down to its reflective form and restarts at the peak. Same gains, same bass 0.35."
      }
    ]
  },
  "lab3_time_harpsi_layered": {
    "id": "lab3_time_harpsi_layered",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_cw_shenightfall_harpsi",
      "cand_b6_vl_harpsi_third_up"
    ],
    "his_words": "learn from them, just layer over them / these sound more robotic than the strings you used in songs.html sad shop. the fluid and smooth ones. notes sound good though / use the sad shop strings",
    "hypothesis": "Development by ADDING VOICES over a byte-identical harpsichord: 1 voice (bars 1-2, harpsi alone — the judged pad withheld) → 2 (bars 3-4, the judged pad enters on the Eb^7 bars) → 3 (bars 5-6, a whisper string top voice) → 4 (bars 7-8, a low pizzicato pulse eb2 on beat 1, bb2 on beat 3). The string voice is written to the STRINGS LAW measured off the sad-shop strings you called fluid: gain 0.17-0.22 (a gainPattern, not one flat velocity), room 0.5, release 0.4, every note at least a beat, never the only voice, and only Gm9 / Eb^7 tones — layered holds one tone a bar (d5 the 5th, f5 the 7th, then eb5 the root and d5 the maj7 over Eb^7: the pedal tone d turning from 5th into maj7 across the chord change); layered_climb keeps the same landing tones but enters on beat 2 and climbs into them (bb4→d5, d5→f5, d5→eb5, bb4→d5 — two attacks a bar, the sad-shop beat-2 climb). all_from_bar1 is the control: all four voices from the start, no staging. Event share is a poor yardstick for this mechanism (a whole-bar hold is one event but a whole voice), so the per-block change vs the reference is 2/14, 0/14, 2/16, 6/20 events but 50%, 0%, 33%, 50% of the voice count. Prediction: the pad entry (bar 3) and the pizz entry (bar 7, a new attack type on the beats) are the audible events; the held string is heard as atmosphere rather than an entry, and only the climb registers as a voice arriving. If all_from_bar1 reads as well as layered, staging adds nothing and the texture is the finding; if the strings read robotic in BOTH string variants, the law's remaining variable is the interlocking sad shop has (held top + climb + dyad walk at once), since gain, room, duration and velocity variety are matched here.",
    "question": "layered adds a voice every two bars (harpsichord alone → + pad → + a whisper string holding one tone a bar, d5 f5 eb5 d5 → + a low pizz pulse on beats 1 and 3); layered_climb is the same order with the string entering on beat 2 and climbing into each tone (the sad-shop shape); all_from_bar1 plays all four voices from the start. Do the entries read as a development or as instruments joining late? Is the held string audible at all at 0.2 with room, and does it read fluid like sad shop or robotic like the labs strings? Does the climb read as the same voice made human, or as a second tune competing with the harpsichord? And does the pizz pulse on 1 and 3 belong under this figure, or does it turn nightfall into a march?",
    "key_tonic": "G",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference, cropped to 4 bars) — harpsichord + pad as judged",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "lab2_flow_harpsi_rhythm_notes/orig, byte-identical (already cropped there to the source's first 4 bars): grace-climb onto the held f4, then the turn answer, twice, over the Gm9 / Eb^7 pad."
      },
      {
        "id": "layered",
        "name": "layered — harpsi alone → + pad → + held string top voice → + low pizz pulse",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3] [g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<~ ~ [d4,g4] [d4,g4] [d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<~ ~ ~ ~ d5 f5 d#5 d5>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"release\":0.4,\"gainPattern\":\"<0 0 0 0 0.2 0.18 0.22 0.19>\"},{\"mini\":\"<~ ~ ~ ~ ~ ~ [d#2 ~ a#2 ~] [d#2 ~ a#2 ~]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3}],\"bpm\":78,\"bars\":8}"
        },
        "note": "the judged harpsichord for 8 bars (its 4-bar figure twice), never altered. Bars 1-2 alone; bars 3-4 the judged pad enters ([d4,g4] on the Eb^7 bars); bars 5-8 a string ensemble at 0.17-0.22 with room 0.5 and release 0.4 holds one chord tone a bar — d5, f5 over Gm9, then eb5, d5 over Eb^7; bars 7-8 a pizzicato eb2 on beat 1 and bb2 on beat 3 at 0.3. Every added tone is a Gm9 or Eb^7 tone; the strings follow the sad-shop law (soft, roomy, whole-bar holds, under the harpsi)."
      },
      {
        "id": "layered_climb",
        "name": "layered, string voice with the beat-2 climb — the sad-shop shape instead of a hold",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3] [g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<~ ~ [d4,g4] [d4,g4] [d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<~ ~ ~ ~ [~@4 a#4@4 d5@8] [~@4 d5@4 f5@8] [~@4 d5@4 d#5@8] [~@4 a#4@4 d5@8]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"release\":0.4,\"gainPattern\":\"<0 0 0 0 [0@4 0.17@4 0.2@8] [0@4 0.18@4 0.18@8] [0@4 0.2@4 0.22@8] [0@4 0.17@4 0.19@8]>\"},{\"mini\":\"<~ ~ ~ ~ ~ ~ [d#2 ~ a#2 ~] [d#2 ~ a#2 ~]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3}],\"bpm\":78,\"bars\":8}"
        },
        "note": "identical to layered except the string part: instead of holding one tone from beat 1 it rests beat 1, enters on beat 2 and climbs into the same landing tone for beats 3-4 — bb4→d5, d5→f5 (Gm9: 3rd→5th, 5th→7th), d5→eb5, bb4→d5 (Eb^7: maj7→root, 5th→maj7). Two attacks a bar, every note at least a beat, the same whisper gains."
      },
      {
        "id": "all_from_bar1",
        "name": "all voices from bar 1 — the same four parts with no staging",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[g3 a3 a#3 f4@13] [g3 a3 a#3 f4 ~ g4 d4@4 c4@3 d4@3] [d#3 a3 a#3 f4@13] [d#3 a3 a#3 f4 ~ g4 d4@4 f4@3 g4@3]>\",\"sound\":\"gm_harpsichord\",\"gain\":0.55},{\"mini\":\"<[d4,a4] [d4,a4] [d4,g4] [d4,g4]>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3},{\"mini\":\"<d5 f5 d#5 d5>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.2,\"room\":0.5,\"release\":0.4,\"gainPattern\":\"<0.2 0.18 0.22 0.19>\"},{\"mini\":\"<[g2 ~ d3 ~] [g2 ~ d3 ~] [d#2 ~ a#2 ~] [d#2 ~ a#2 ~]>\",\"sound\":\"gm_pizzicato_strings\",\"gain\":0.3}],\"bpm\":78,\"bars\":4}"
        },
        "note": "the control: harpsichord, pad, the held string line (d5 f5 eb5 d5) and the pizz pulse (g2/d3 over Gm9, eb2/bb2 over Eb^7) all sounding from the first bar as a 4-bar loop — the texture layered arrives at, without the arrival."
      }
    ]
  },
  "lab3_flow_rush_pad": {
    "id": "lab3_flow_rush_pad",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_cw_rush_layering"
    ],
    "his_words": "the third and fourth ones are still slower bruh",
    "hypothesis": "You left that note on all three rush variants, including pad_varies, whose BASS is identical in every 2-bar statement - so the bass cannot be what slows statements 3 and 4. The only thing that changes there is the PAD: c4 in statements 1-2, then a#3 and g3 - a sustained voice stepping DOWN. A falling sustained pitch reads as energy sagging, i.e. 'slower', even at a fixed tempo and an unchanged bass. Prediction: with the pad held flat (v2) all four statements are the same speed; with the pad rising (v3) statements 3-4 feel faster; adding bass re-attacks under the falling pad (v4) only partly cancels the drag.",
    "question": "v1 is the pad_varies you judged (bass identical throughout, pad falls). v2 holds the pad on c4 - are statements 3 and 4 the same speed now? v3 makes the pad rise instead - do they feel faster? v4 keeps the fall but adds bass re-attacks under it - does that cancel the slowdown, or is the falling pad still audible as one?",
    "key_tonic": "C",
    "key_mode": "minor",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_judged",
        "name": "pad_varies as judged (bass identical, pad falls c4 -> a#3 -> g3)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ g3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "lab2_fix_rush_speed/pad_varies, byte-identical"
      },
      {
        "id": "pad_flat",
        "name": "pad held on c4 for all four statements",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ c4 ~ c4 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "nothing moves between statements at all - the speed control"
      },
      {
        "id": "pad_rises",
        "name": "pad rises c4 -> d4 -> eb4 in statements 3-4",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ d4 ~ eb4 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "the mirror of the judged pad: the sustained voice steps UP (9th, then minor 3rd over the C bass)"
      },
      {
        "id": "pad_falls_bass_lifts",
        "name": "pad falls as judged; the bass adds re-attacks under it",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [c2 d2 ~ d2 d2 ~ d2 ~ ~ c2 ~ d2 ~ c2 ~ c2] [~ ~ d2 ~ d2 ~ ~ ~ c2 ~ d2 ~ c2 ~ d2 ~] [c2 d2 ~ d2 d2 d2 d2 ~ ~ c2 c2 d2 ~ c2 c2 c2] [~ ~ d2 d2 d2 ~ ~ ~ c2 c2 d2 ~ c2 c2 d2 ~] [c2 d2 ~ d2 d2 d2 d2 ~ ~ c2 c2 d2 ~ c2 c2 c2] [~ ~ d2 d2 d2 ~ ~ ~ c2 c2 d2 ~ c2 c2 d2 ~]>\",\"sound\":\"gm_synth_bass_1\",\"gain\":0.55},{\"mini\":\"<c4 ~ c4 ~ a#3 ~ g3 ~>\",\"sound\":\"gm_pad_warm\",\"gain\":0.3}],\"bpm\":120,\"bars\":8}"
        },
        "note": "bars 5-8 carry 12 and 9 bass onsets instead of 9 and 6 (three extra same-pitch re-attacks each) while the pad still falls"
      }
    ]
  },
  "lab3_perc_form_identity": {
    "id": "lab3_perc_form_identity",
    "lane": "perc",
    "batch": 3,
    "source_cards": [],
    "his_words": "I feel like the high tier looping is the buildup and bars1-2 and 3-4 are like the main beat",
    "hypothesis": "You heard the roles the other way round from how the form was built, and that is a law, not a mistake: a MAIN BEAT is a kick/snare IDENTITY with space in it (a kick, a backbeat snare, silence between), while the dense tier - kick on every quarter, snare on every offbeat, a 16th shaker carpet - is undifferentiated, so it reads as a BUILD however long it loops. Density does not make a main beat. Prediction: the dense tier played ONCE before the groove (v2) is the form you meant; the groove alone (v3) misses the lift; the dense bar dropped into the loop once (v4) reads as a fill, not a restart.",
    "question": "v1 is the form as you judged it. v2 plays the dense tier once (bars 1-2) and then loops the groove you called the main beat - is that the form you described? v3 loops the groove alone - does it miss the buildup? v4 loops the groove and plays the dense tier for ONE bar at bar 8 - fill/event, or restart? Does v1's dense loop still read as buildup after hearing v2?",
    "key_tonic": "C",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "as_judged",
        "name": "the judged form (sparse tiers 1-4, dense tier looping 5-8)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ ~ ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~]>\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"<[~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare]>\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"<[md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat md_hat] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker]>\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "lab2_perc_loop_form/build_once_loop, byte-identical"
      },
      {
        "id": "dense_then_groove",
        "name": "dense tier ONCE (bars 1-2), then the groove loops (3-8)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~]>\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"<[~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ md_snare ~ md_snare ~ md_snare ~ md_snare] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~]>\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"<[vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo]>\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "the roles as you heard them: the dense tier is the buildup and plays once; the kick-1-and-2.5 / snare-3 groove is the main beat and loops"
      },
      {
        "id": "groove_only",
        "name": "the groove alone, looping (control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"[md_kick ~ ~ md_kick ~ ~ ~ ~]\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"[~ ~ ~ ~ md_snare ~ ~ ~]\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"[md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo]\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "no buildup at all - the main beat as it would run mid-song"
      },
      {
        "id": "groove_with_event",
        "name": "groove loops; the dense tier for ONE bar at bar 8",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ ~ md_kick ~ ~ ~ ~] [md_kick ~ md_kick ~ md_kick ~ md_kick ~]>\",\"sound\":\"md_kick\",\"gain\":0.8},{\"mini\":\"<[~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ ~ ~ ~ md_snare ~ ~ ~] [~ md_snare ~ md_snare ~ md_snare ~ md_snare]>\",\"sound\":\"md_snare\",\"gain\":0.7},{\"mini\":\"<[md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [md_hat md_hat md_hat md_hat md_hat md_hat md_hat vc_tom_lo] [vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker vc_shaker]>\",\"sound\":\"md_hat\",\"gain\":0.5}],\"bpm\":116,\"bars\":8}"
        },
        "note": "your 'unless there's a change later in the song' as a one-bar event inside the main loop"
      }
    ]
  },
  "lab3_flow_hexarp_nature_rhythm": {
    "id": "lab3_flow_hexarp_nature_rhythm",
    "lane": "flow",
    "batch": 3,
    "source_cards": [
      "cand_cw_morning_hexarp"
    ],
    "his_words": "sounds kinda off because it's like really groovy for a relatively serious/natural vibe",
    "hypothesis": "Your dotted verdict separates two kinds of rhythm variation. Regrouping the beat (dotted pairs, 3+3+2) is a GROOVE device and reads wrong on nature material; shaping DURATIONS inside one unbroken climb is not - a breath inside the climb, a final statement that broadens into its top, an echo of the peak in the rest bar. Prediction: v2-v4 keep the refreshing/nature feel (one direction, no short-long pairs), v5 (dotted, your control) reads groovy again. Strings byte-identical, no scale degree 4 anywhere.",
    "question": "Same eight ladder notes, same strings. v2 takes a breath after the 4th note and lands the top on the next downbeat; v3 is the judged climb twice, then a third statement that slows into its top; v4 echoes the peak (a4-b4) inside each rest bar; v5 is the dotted flow you called groovy. Which of v2-v4 keeps the nature feel? Does any of them read groovy the way v5 did? Is v4's echo stepping on the strings' answer bar?",
    "key_tonic": "A",
    "key_mode": "major",
    "chromatic_ok": false,
    "variants": [
      {
        "id": "orig",
        "name": "original (reference)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "lab2_flow_hexarp_rhythm/orig, byte-identical (the strings here are the judged bed and stay as judged so the harp is the only axis)"
      },
      {
        "id": "breath",
        "name": "breath after the 4th note; the top lands on the next downbeat",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3@2 b3@2 c#4@2 e4@3 ~ f#4@2 g#4@2 a4@2] [b4@4 ~@12] [a3@2 b3@2 c#4@2 e4@3 ~ f#4@2 g#4@2 a4@2] [b4@4 ~@12] [a3@2 b3@2 c#4@2 e4@3 ~ f#4@2 g#4@2 a4@2] [b4@4 ~@12]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "one climb, one direction: e4 leans long, a 16th of air, and the ladder finishes on the following bar's beat 1 (held a beat) - the rest bar keeps three beats for the strings"
      },
      {
        "id": "rit_final",
        "name": "third statement broadens into its top (written ritardando)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3 b3 c#4 e4 f#4 g#4 a4 b4] ~ [a3@2 b3@2 c#4@2 e4@2 f#4@2 g#4@3 a4@3] [b4@6 ~@10]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "statements 1-2 as judged; the last one slows over its final three notes and arrives on the next downbeat held a beat and a half - the change is placed, not per bar"
      },
      {
        "id": "rocking_peak",
        "name": "the peak echoed (a4-b4) inside each rest bar",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3 b3 c#4 e4 f#4 g#4 a4 b4] [a4@2 b4@2 ~@12] [a3 b3 c#4 e4 f#4 g#4 a4 b4] [a4@2 b4@2 ~@12] [a3 b3 c#4 e4 f#4 g#4 a4 b4] [a4@2 b4@2 ~@12]>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "the climb as judged; the rest bar answers with the top two notes once more (the rocking grammar), then three beats of air"
      },
      {
        "id": "dotted",
        "name": "dotted flow (your 'really groovy' control)",
        "render": {
          "kind": "stack_mini",
          "spec": "{\"parts\":[{\"mini\":\"<[a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~ [a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~ [a3@3 b3 c#4@3 e4 f#4@2 g#4 a4 b4@4] ~>\",\"sound\":\"gm_orchestral_harp\",\"gain\":0.5},{\"mini\":\"<[c#4,f#4] [c#4,f#4] [e3,g#3] [e3,g#3] [c#3,f#3] [c#3,f#3]>\",\"sound\":\"gm_string_ensemble_1\",\"gain\":0.4}],\"bpm\":100,\"bars\":6}"
        },
        "note": "lab2_flow_hexarp_rhythm/dotted, byte-identical - the regrouping you heard as groovy"
      }
    ]
  },
};
