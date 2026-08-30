// City-pop / K-pop progressions, hand-authored — r27.
//
// HIS ASK, verbatim: "in terms of the 'casual', 'lobby' kinda chord progressions
// like the one from my reels, i liked citypop and kpop a lot (it's hard to make
// it yourself generated though so let's trying hardcoding a lot of chord
// progressions, tagging them with emtadata of when to apply, and then applying
// them in songs (with other stuff of course)."
//
// So this file is deliberately NOT generated, NOT counted, and NOT retrieved by
// hash. It is a hand-written vocabulary with an explicit `appliesWhen` on every
// entry, and a selector (`citypopFor`) that reads those tags. That is the whole
// design: he is telling us the engine cannot invent this idiom, so we should stop
// trying to and instead carry it as knowledge.
//
// ---------------------------------------------------------------------------
// WHAT IS IN HERE AND WHERE IT COMES FROM
// ---------------------------------------------------------------------------
// These are IDIOM progressions — the shared common-practice vocabulary of
// Japanese city-pop, J-pop and K-pop, the way a ii-V-I is the shared vocabulary
// of jazz. Each entry names the idiom and, where the idiom has a name of its own
// in the tradition, uses it. No entry is a transcription of a particular
// recording; the two that WERE read off video (the royal road and the
// hotel/neo-soul turnaround) are cross-referenced to their source entries in
// progressions-vanriver.js rather than duplicated here.
//
// The reels he handed over are what made this worth writing: measured across
// them, the royal road turned up as the backbone of the set, and the two
// structural devices below turned up in almost every entry.
//
// ---------------------------------------------------------------------------
// THE TWO DEVICES THAT MAKE IT SOUND LIKE THE IDIOM
// ---------------------------------------------------------------------------
// 1. EVERY CHORD CARRIES A SEVENTH OR A SIXTH. A plain triad is what makes our
//    generated harmony read "generic" (his standing note, D88). In this idiom the
//    triad is essentially absent: the tonic is Δ7 or 6/9, the subdominant is Δ7,
//    the minor chords are m7 or m9, the dominant is 7sus or 7(b9) or omitted
//    entirely. `degrees` below therefore carries a quality on nearly every token.
//
// 2. THE CHORDS ARE NOT ALL THE SAME LENGTH. Carried as `chordUnits`, the same
//    field the vanriver pack uses, and consumed by the same `opts.chordUnits`
//    path in the generator. Measured on the reels: only 36.8% of chords last the
//    modal unit. Where an entry has a passing or approach chord it is written
//    SHORT here, because that is what makes it read as a passing chord rather
//    than as another chord in the list.
//
// ---------------------------------------------------------------------------
// `appliesWhen` — the metadata he asked for
// ---------------------------------------------------------------------------
//   emotions      the vibe emotions this progression suits
//   environments  the lanes it suits. NEVER a niche lane — see the gate below.
//   bpm           [min, max] the idiom sits in; outside it the changes stop
//                 reading as a groove and start reading as a chorale
//   energy        'low' | 'mid' | 'high' — how much the progression can carry
//   idiom         which tradition, so a K-pop and a city-pop entry are not
//                 silently interchangeable
//
// THE NICHE GATE IS PART OF THE DATA, NOT A CONVENTION. His ruling this round:
// "note that engine changes as a result of this should not affect the niche
// genres". Desert, jungle and the three horror lanes have their own researched
// vocabulary (D93/D94/D97) and their own judged material. `NICHE_LANES` below is
// the closed set, `citypopFor()` refuses to return anything for them, and
// test/citypop.test.js pins that refusal. A list of PERMITTED environments is
// used rather than a list of forbidden ones, because a forbidden-name list has
// failed five times in this project.
//
// ---------------------------------------------------------------------------
// STATUS: NOTHING HERE IS RATIFIED AND NOTHING IS IN A RETRIEVAL POOL.
// Not merged into ALL_PROGRESSIONS — merging restages the counted harmony model
// and re-rolls `treat` on judged songs, which is the documented D95 failure.
// Entries are reachable by NAME (via `opts.basePin`) or through `citypopFor()`,
// which a song opts into explicitly.
// ---------------------------------------------------------------------------

export const NICHE_LANES = new Set(['desert', 'jungle', 'manor', 'catacombs', 'citadel']);

/** Lanes this pack is allowed to serve. A closed PERMITTED set, not a blacklist. */
export const CASUAL_LANES = new Set([
  'shop', 'rest', 'menu', 'snow', 'water', 'casino', 'kitchen', 'festival',
  'space', 'shrine', 'aftermath', 'lab', 'training', 'construction', 'cave',
  'stealth', 'boss', 'fight',
]);

export const PROGRESSIONS_CITYPOP = {

  // =========================================================================
  // THE FOUR PILLARS — the progressions the idiom is actually built on
  // =========================================================================

  // 王道進行 — "the royal road". IV-V-iii-vi. The single most-used progression
  // in J-pop and city-pop. Read independently off a reel: see
  // progressions-vanriver.js `vid_vr_cloudy`, which is this in Ab.
  cp_royal_road: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'j-pop royal road',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: '王道進行 (royal road) — IV-V-iii-vi',
    numerals: 'IVΔ7-V7-iiim7-vim7',
    degrees: '5:^7 7:7 4:m7 9:m7',
    voicedAs: ['IVΔ7', 'V7', 'iiim7', 'vim7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['nostalgic', 'romantic', 'calm', 'happy', 'somber'],
      environments: ['shop', 'rest', 'snow', 'menu', 'water', 'aftermath'],
      bpm: [70, 120], energy: 'mid', idiom: 'j-pop',
    },
    seeAlso: 'vid_vr_cloudy (the same progression read off a reel, in Ab)',
    notes: "The iii is the whole point: it lands where the ear expects the tonic and refuses it, so the loop never closes and can repeat forever. Do NOT substitute I for iii — that is the western pop cadence and it kills the idiom. The V is a real dominant here, unusually for this pack.",
  },

  // 小室進行 — the "Komuro" progression. vi-IV-V-I. The 90s J-pop workhorse and
  // the most K-pop-adjacent of the four; it DOES close, which is why it suits a
  // song with a chorus rather than a loop.
  cp_komuro: {
    family: 'minor', pack: 'citypop', role: 'harmony', style: 'j-pop komuro',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: '小室進行 (Komuro) — vi-IV-V-I',
    numerals: 'vim7-IVΔ7-V7sus-IΔ7',
    degrees: '9:m7 5:^7 7:7sus 0:^7',
    voicedAs: ['vim7', 'IVΔ7', 'V7sus4', 'IΔ7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['triumphant', 'happy', 'excited', 'nostalgic'],
      environments: ['festival', 'shop', 'casino', 'training', 'menu'],
      bpm: [95, 150], energy: 'high', idiom: 'j-pop',
    },
    notes: "Starts on the relative minor and arrives at the major tonic — the emotional shape is 'it turns out alright', which is why it carries a triumphant or excited prompt where the royal road cannot. The V is a SUS: resolving it fully is what makes a K-pop chorus sound like a hymn.",
  },

  // Just-the-two-of-us changes. IVΔ7 - III7 - vim7 - Im7, the neo-soul/city-pop
  // turnaround. The III7 is a secondary dominant of vi, and it is the one
  // chromatic chord the idiom uses constantly.
  cp_jtto_turnaround: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'neo-soul turnaround',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IVΔ7-III7-vim7-I — the neo-soul turnaround',
    numerals: 'IVΔ7-III7-vim7-Im7',
    degrees: '5:^7 4:7 9:m7 0:m7',
    voicedAs: ['IVΔ7', 'III7', 'vim7', 'Im7'],
    chordUnits: [1.5, 0.5, 1.5, 0.5],
    appliesWhen: {
      emotions: ['romantic', 'nostalgic', 'calm', 'somber'],
      environments: ['rest', 'menu', 'snow', 'shop', 'aftermath'],
      bpm: [60, 100], energy: 'low', idiom: 'city-pop',
    },
    seeAlso: 'vid_vr_hotel (the same shape in G minor, where the altered chord is a V7b9)',
    notes: "The UNEVEN one, and it is uneven in the way the reels are: the two stable chords hold 1.5 units and the two chords that MOVE take 0.5. Play it evenly and it becomes a plain vi-IV loop. The III7 must be short — it is an approach, not a destination.",
  },

  // The 4-5-3-6 with a chromatic descending bass in the middle — the city-pop
  // signature that separates it from generic J-pop.
  cp_descending_bass: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'city-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IVΔ7 - ivm6 - iiim7 - VI7 - iim7 - V7sus',
    numerals: 'IVΔ7-ivm6-iiim7-VI7-iim7-V7sus',
    degrees: '5:^7 5:m6 4:m7 9:7 2:m7 7:7sus',
    voicedAs: ['IVΔ7', 'ivm6', 'iiim7', 'VI7', 'iim7', 'V7sus4'],
    chordUnits: [1, 1, 1, 0.5, 1, 0.5],
    appliesWhen: {
      emotions: ['nostalgic', 'romantic', 'somber', 'calm'],
      environments: ['snow', 'rest', 'aftermath', 'shop', 'water'],
      bpm: [70, 110], energy: 'mid', idiom: 'city-pop',
    },
    notes: "The MINOR IV is the sound. Bass walks F-Fb/E-E-D#/Eb-D-G in C: a chromatic descent under mostly-static upper voices, which is the device our engine has never had (r16: 99.3% of accompaniment notes were {0,3,4,7}). The `m6` quality only became spellable in the dialect at r16 — this entry is the first thing to actually need it.",
  },

  // =========================================================================
  // K-POP — a different centre of gravity: minor, four-on-the-floor-friendly,
  // and it uses the bVII where J-pop uses the V.
  // =========================================================================

  cp_kpop_minor_anthem: {
    family: 'minor', pack: 'citypop', role: 'harmony', style: 'k-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'im9 - bVIΔ7 - bVIIsus - im9',
    numerals: 'im9-bVIΔ7-bVII7sus-im9',
    degrees: '0:m7 8:^7 10:7sus 0:m7',
    voicedAs: ['im9', 'bVIΔ7', 'bVII7sus4', 'im9'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['tense', 'excited', 'triumphant', 'mysterious'],
      environments: ['boss', 'fight', 'training', 'stealth', 'space'],
      bpm: [100, 140], energy: 'high', idiom: 'k-pop',
    },
    notes: "bVII instead of V: aeolian, no leading tone, so it drives without ever resolving. This is the one entry in the pack that suits an action lane, and it is why — the absence of a cadence is what lets it loop under a fight.",
  },

  cp_kpop_bright_hook: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'k-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ7 - V/vii - vim7 - IVΔ7 (the descending-bass hook)',
    numerals: 'IΔ7-V/VII-vim7-IVΔ7',
    degrees: '0:^7 7:7 9:m7 5:^7',
    voicedAs: ['IΔ7', 'V7/VII', 'vim7', 'IVΔ7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['happy', 'excited', 'triumphant', 'romantic'],
      environments: ['festival', 'shop', 'casino', 'menu', 'training'],
      bpm: [105, 145], energy: 'high', idiom: 'k-pop',
    },
    notes: "The V is voiced over its own 7th so the bass steps C-B-A-F rather than leaping. Our engine writes slash chords as root-position (D98's silent trap: chordRootPc returns the UPPER root), so this entry's bass motion must be pinned in the figure, not left to the symbol.",
  },

  // =========================================================================
  // LOBBY / LOUNGE — his "casual day", "shop vibes", "hotel" labels. Low energy,
  // no dominant, nothing that resolves hard.
  // =========================================================================

  cp_lobby_static: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'lounge',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ9 - iim9 - IΔ9 - iim9 (the two-chord lobby)',
    numerals: 'IΔ9-iim9-IΔ9-iim9',
    degrees: '0:^7 2:m7 0:^7 2:m7',
    voicedAs: ['IΔ9', 'iim9', 'IΔ9', 'iim9'],
    chordUnits: [2, 2, 2, 2],
    appliesWhen: {
      emotions: ['calm', 'happy', 'nostalgic'],
      environments: ['shop', 'menu', 'rest', 'lab', 'construction'],
      bpm: [80, 115], energy: 'low', idiom: 'city-pop',
    },
    notes: "TWO chords, held two units each — the sparsest entry in the pack and the one closest to his 'casual day / shop vibes' label. Sparsity is a legitimate ensemble shape (his standing note). Everything interesting has to come from the FIGURE, which is exactly the r27 subdivision finding: ~6 attacks per chord, and the figure does not stop at the change.",
  },

  cp_lobby_sixnine: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'lounge',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'I6/9 - vim7 - iim7 - V7sus (no leading tone anywhere)',
    numerals: 'I6/9-vim7-iim7-V7sus',
    degrees: '0:6 9:m7 2:m7 7:7sus',
    voicedAs: ['I6/9', 'vim7', 'iim7', 'V7sus4'],
    chordUnits: [1.5, 1, 1, 0.5],
    appliesWhen: {
      emotions: ['calm', 'nostalgic', 'happy', 'romantic'],
      environments: ['rest', 'menu', 'shop', 'water', 'snow'],
      bpm: [65, 105], energy: 'low', idiom: 'city-pop',
    },
    notes: "The 6/9 tonic is the lounge sound: no 7th, so nothing pulls. The V is a sus and it is SHORT (0.5) — it exists to turn the loop over, not to cadence. This is the 'hotel lobby' entry.",
  },

  // =========================================================================
  // MOVEMENT — for when the lane wants the harmony to travel
  // =========================================================================

  cp_circle_of_fifths: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'city-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'iiim7 - VI7 - iim7 - V7 - IΔ7 (the descending-fifths run home)',
    numerals: 'iiim7-VI7-iim7-V7-IΔ7',
    degrees: '4:m7 9:7 2:m7 7:7 0:^7',
    voicedAs: ['iiim7', 'VI7', 'iim7', 'V7', 'IΔ7'],
    chordUnits: [0.75, 0.75, 0.75, 0.75, 2],
    appliesWhen: {
      emotions: ['nostalgic', 'romantic', 'triumphant', 'happy'],
      environments: ['shop', 'casino', 'menu', 'festival', 'rest'],
      bpm: [80, 130], energy: 'mid', idiom: 'city-pop',
    },
    notes: "Four short chords falling by fifths, then the tonic held nearly THREE times as long. That length shape is the point and it is the reel finding applied: the chord the loop is about gets the time, everything travelling towards it does not.",
  },

  cp_planing_maj7: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'city-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ7 - bIIIΔ7 - bVIΔ7 - bIIΔ7 (parallel major sevenths)',
    numerals: 'IΔ7-bIIIΔ7-bVIΔ7-bIIΔ7',
    degrees: '0:^7 3:^7 8:^7 1:^7',
    voicedAs: ['IΔ7', 'bIIIΔ7', 'bVIΔ7', 'bIIΔ7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['mysterious', 'calm', 'nostalgic'],
      environments: ['space', 'shrine', 'water', 'cave', 'lab'],
      bpm: [60, 100], energy: 'low', idiom: 'city-pop',
    },
    notes: "The SHAPE is moved intact, no voice leading — parallel motion IS the effect, the same device as the vanriver m9 plane. Modal, not functional: there is no dominant and no cadence, so it suits an atmosphere lane. This is the entry to reach for on 'moody environment'.",
  },

  cp_backdoor: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'city-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ7 - ivm7 - bVII7 - IΔ7 (the backdoor cadence)',
    numerals: 'IΔ7-ivm7-bVII7-IΔ7',
    degrees: '0:^7 5:m7 10:7 0:^7',
    voicedAs: ['IΔ7', 'ivm7', 'bVII7', 'IΔ7'],
    chordUnits: [2, 1, 1, 2],
    appliesWhen: {
      emotions: ['nostalgic', 'somber', 'calm', 'romantic'],
      environments: ['aftermath', 'snow', 'rest', 'shop', 'water'],
      bpm: [60, 105], energy: 'low', idiom: 'city-pop',
    },
    notes: "Arrives at the tonic from bVII instead of V — the 'backdoor'. Softer than a real cadence, which is why it suits aftermath and snow. The borrowed iv before it is what makes the arrival read as consolation rather than as a resolution.",
  },

  cp_secondary_chain: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'j-pop',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ7 - VI7 - iim7 - II7 - iiim7 - VI7 (secondary dominants throughout)',
    numerals: 'IΔ7-VI7-iim7-II7-iiim7-VI7',
    degrees: '0:^7 9:7 2:m7 2:7 4:m7 9:7',
    voicedAs: ['IΔ7', 'VI7', 'iim7', 'II7', 'iiim7', 'VI7'],
    chordUnits: [1.5, 0.5, 1.5, 0.5, 1, 1],
    appliesWhen: {
      emotions: ['happy', 'nostalgic', 'excited', 'romantic'],
      environments: ['shop', 'casino', 'festival', 'kitchen', 'menu'],
      bpm: [90, 135], energy: 'mid', idiom: 'j-pop',
    },
    notes: "Every second chord is a secondary dominant and every one of them is SHORT. This is the shape r26 measured him complaining about when it goes wrong — a secondary dominant is theoretically correct and still reads as out-of-key if a support layer doubles down on it (D116). Keep the flare in the piano and the bass; the woodwinds stay diatonic.",
  },

  cp_sus_float: {
    family: 'major', pack: 'citypop', role: 'harmony', style: 'lounge',
    provenance: 'hand-authored', ratified: false, needsEar: true,
    idiomName: 'IΔ9 - V7sus - IVΔ9 - V7sus (nothing ever resolves)',
    numerals: 'IΔ9-V7sus-IVΔ9-V7sus',
    degrees: '0:^7 7:7sus 5:^7 7:7sus',
    voicedAs: ['IΔ9', 'V7sus4', 'IVΔ9', 'V7sus4'],
    chordUnits: [1.5, 0.5, 1.5, 0.5],
    appliesWhen: {
      emotions: ['calm', 'mysterious', 'nostalgic', 'somber'],
      environments: ['menu', 'space', 'water', 'rest', 'lab', 'shrine'],
      bpm: [55, 95], energy: 'low', idiom: 'city-pop',
    },
    notes: "A sus that is never resolved is the most characteristic single sound in the lobby idiom. Both sus chords are half-length: they are hinges, not chords. Suits the slowest lanes in the pack.",
  },
};

/**
 * Pick the city-pop / K-pop progressions that suit a vibe.
 *
 * REFUSES the niche lanes outright — his r27 ruling. That refusal is the reason
 * this is a function rather than a plain object lookup: a caller cannot
 * accidentally reach into the pack for a desert song without going around the
 * gate, and going around it is visible in a diff.
 *
 * Returns entries in a stable order (score desc, then name) so a caller that
 * picks the first is deterministic. Scoring is additive and deliberately simple:
 * the tags either match or they do not, and nothing is weighted by a hash,
 * because a hash-ranked pool is a retrieval pool and retrieval pools re-roll
 * judged songs when they grow (D95).
 */
export function citypopFor({ emotion, environment, bpm, energy, idiom } = {}) {
  if (environment && NICHE_LANES.has(environment)) return [];
  const scored = [];
  for (const [name, e] of Object.entries(PROGRESSIONS_CITYPOP)) {
    const w = e.appliesWhen;
    // a lane the entry does not name is a hard miss, not a low score: the tags
    // are the whole point of the file
    if (environment && !w.environments.includes(environment)) continue;
    if (emotion && !w.emotions.includes(emotion)) continue;
    if (idiom && w.idiom !== idiom) continue;
    let score = 0;
    if (emotion) score += 2;
    if (environment) score += 2;
    if (bpm != null) {
      if (bpm < w.bpm[0] || bpm > w.bpm[1]) continue;     // outside the idiom's tempo
      const mid = (w.bpm[0] + w.bpm[1]) / 2;
      score += 1 - Math.abs(bpm - mid) / (w.bpm[1] - w.bpm[0]);
    }
    if (energy && w.energy === energy) score += 1;
    scored.push({ name, entry: e, score });
  }
  return scored.sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
}

/** Every environment any entry claims — used by the test that pins the gate. */
export function citypopEnvironments() {
  const out = new Set();
  for (const e of Object.values(PROGRESSIONS_CITYPOP)) for (const v of e.appliesWhen.environments) out.add(v);
  return out;
}
