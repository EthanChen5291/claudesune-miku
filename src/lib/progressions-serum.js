// The Serum producer's own loops — r28, read off research/reel-layers-r22.json.
//
// HIS ASK this round: "make a song suite learning and applying patterns and
// layering and everything from the synth guy from earlier, in the genre his
// songs are (think layer stack vibe). i feel like not enough of his techniques
// were applied fully."
//
// ---------------------------------------------------------------------------
// READ THIS FIRST — THE RESEARCH REFUSES TO GENERALISE THESE
// ---------------------------------------------------------------------------
// research/reel-layers-r22.md §5.3 is explicit, and this file does not overrule
// it: "Any progression. 4 of 9 (all one source) are the same descending minor
// loop landing on V ... That is one producer's habit, not a finding."
//
// So NOTHING here is offered as a law about game music, about minor keys, or
// about what a progression should be. These are six loops that a specific
// person actually wrote, recorded so a suite can be built IN HIS GENRE rather
// than in ours. That is a different claim and a much weaker one, and it is the
// only claim this file makes. `ratified: false` on every entry, as always —
// only Ethan's ear promotes anything.
//
// The layering research is the substance of the round (R1-R6 + the roles);
// the harmony is here so those layers have something to be layered ON.
//
// ---------------------------------------------------------------------------
// SAFETY (D95, and the same shape as the r26/r27 packs)
// ---------------------------------------------------------------------------
// NOT merged into ALL_PROGRESSIONS, so build-harmony-model.mjs never counts it
// and no judged song's `treat` op moves. NOT in any retrieval pool, so no
// `fnv % pool.length` re-rolls. Reached only by an explicit `basePin`.
// Tests in test/serum.test.js pin both.
//
// ---------------------------------------------------------------------------
// WHAT WAS ACTUALLY READ, PER REEL
// ---------------------------------------------------------------------------
// Every entry names its reel file and quotes the transcription's own reading of
// the harmony. Where the loop is 3 chords and the reel's pattern is 4 bars, the
// bar allocation is an EDITORIAL choice and says so in `notes` — the reels were
// read for pitch and register, and no chord-length measurement was made on them
// (that measurement exists for the @vanrivermusic reels, a different producer,
// and is not transferable).
//
// ALL SIX ARE MINOR, because all nine reels are: "Zero major-key, zero modal,
// zero non-Western evidence." That is also why this pack, like the r27 work, is
// barred from the niche lanes.

/** Lanes this pack must never reach — his r27 ruling, still standing. */
export const NICHE_LANES = new Set(['desert', 'jungle', 'manor', 'catacombs', 'citadel']);

export const PROGRESSIONS_SERUM = {
  // -------------------------------------------------------------------------
  sr_descend_bvi_v: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'descending minor loop',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'ScreenRecording_08-26-2026 13-25-13_1.MP4', sourceBpm: 102, sourceKey: 'C minor',
    read: 'C - Bb - Ab - G. Bar ruler legible (bars 1,2,3)',
    idiomName: 'i - bVII - bVI - V (the descending loop, 4 of 9 reels)',
    numerals: 'im9-bVII6-bVIΔ7-V7',
    degrees: '0:m9 10:6 8:^7 7:7',
    voicedAs: ['Cm9', 'Bb6', 'AbΔ7', 'G7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['somber', 'mysterious', 'tense', 'nostalgic'],
      environments: ['space', 'lab', 'stealth', 'aftermath', 'rest', 'cave'],
      bpm: [60, 110], energy: 'mid',
    },
    notes: "The single most common shape in the set — the same producer writes it four times. Every root steps DOWN, which is why his floor layer can be one held note per bar and still read as a line. The V is a real dominant (B natural against a C-minor loop); the b7 chord above it is a Bb6 rather than a Bb7 so the loop stays inside natural minor until the V arrives.",
  },
  // -------------------------------------------------------------------------
  sr_descend_iv_v: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'descending minor loop, no leading tone',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'igexport-Da3c_kEI25C.mp4', sourceBpm: 69, sourceKey: 'C minor',
    read: 'C - Bb - F - G = i - bVII - iv - v in C minor',
    idiomName: 'i - bVII - iv - v (all-minor, the v is NOT a dominant)',
    numerals: 'im9-bVII6-ivm7-vm7',
    degrees: '0:m9 10:6 5:m7 7:m7',
    voicedAs: ['Cm9', 'Bb6', 'Fm7', 'Gm7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['somber', 'calm', 'mysterious', 'nostalgic'],
      environments: ['space', 'rest', 'snow', 'water', 'aftermath', 'menu'],
      bpm: [60, 95], energy: 'low',
    },
    notes: "The transcription is explicit that this reel stays in NATURAL minor — the v is a minor triad, not a dominant. That is the difference between this and sr_descend_bvi_v and it is the whole character: nothing pulls, so the loop can repeat indefinitely without ever sounding like it wants to close. This is the reel that also carries the hold-bar/move-bar layer (R3) and the beats-2-and-4 lead.",
  },
  // -------------------------------------------------------------------------
  sr_iii_vi_v: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'relative-major lift',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'igexport-DalZ717INc7.mp4', sourceBpm: 91, sourceKey: 'C minor',
    read: 'C - Eb - Ab - G = i - III - VI - V in C minor',
    idiomName: 'i - III - VI - V (the relative major on beat two of the loop)',
    numerals: 'im9-bIIIΔ7-bVIΔ7-V7',
    degrees: '0:m9 3:^7 8:^7 7:7',
    voicedAs: ['Cm9', 'EbΔ7', 'AbΔ7', 'G7'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      emotions: ['nostalgic', 'somber', 'mysterious', 'calm'],
      environments: ['space', 'snow', 'rest', 'water', 'shrine', 'menu'],
      bpm: [70, 110], energy: 'mid',
    },
    notes: "The one loop in the set that is not purely descending — the bIII lifts before the bVI drops. It is also the reel with the cleanest register discipline on record (four disjoint octave bands, G3-G4 / C5-D5 / C6-G6 / C7-G8, never doubling a pitch), so it is the natural home for R4.",
  },
  // -------------------------------------------------------------------------
  sr_vi_v_three: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'three-chord minor',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'ScreenRecording_08-26-2026 13-20-54_1.MP4', sourceBpm: null, sourceKey: 'C minor',
    read: 'C - Ab - G (i, VI, v of C minor)',
    idiomName: 'i - bVI - v (three chords, the trap reel)',
    numerals: 'im9-bVIΔ7-vm7',
    degrees: '0:m9 8:^7 7:m7',
    voicedAs: ['Cm9', 'AbΔ7', 'Gm7'],
    chordUnits: [2, 1, 1],
    appliesWhen: {
      emotions: ['tense', 'mysterious', 'somber'],
      environments: ['stealth', 'lab', 'space', 'cave', 'aftermath'],
      bpm: [70, 120], energy: 'high',
    },
    notes: "THE BAR ALLOCATION IS EDITORIAL. The reel shows three chords and a 4-bar pattern; nothing in the transcription says which chord takes the extra bar, so the tonic does, which is the conventional reading and is flagged here rather than presented as a measurement. This is the only reel of the nine with hand-placed, deliberately non-grid drums, and the only one whose stabs sit high specifically to clear the kick's pitched sub tail.",
  },
  // -------------------------------------------------------------------------
  sr_stepwise_floor: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'scale-step bass',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'igexport-DZS8aawIFrb.mp4', sourceBpm: 80, sourceKey: 'E natural minor',
    read: 'E-F#-G-A-B, one scale step per held bar (chords Em / C / B)',
    idiomName: 'a bass that walks the scale — i - ii° - bIII - iv - V',
    numerals: 'im9-iiø7-bIIIΔ7-ivm7-V7',
    degrees: '0:m9 2:m7b5 3:^7 5:m7 7:7',
    voicedAs: ['Em9', 'F#m7b5', 'GΔ7', 'Am7', 'B7'],
    chordUnits: [1, 1, 1, 1, 1],
    appliesWhen: {
      emotions: ['mysterious', 'somber', 'tense', 'calm'],
      environments: ['space', 'cave', 'stealth', 'lab', 'shrine', 'water'],
      bpm: [65, 100], energy: 'low',
    },
    notes: "The reel's floor walks E-F#-G-A-B one scale step per held bar while the visible CHORDS are only Em / C / B — so the harmony here is written from the BASS MOTION rather than from a chord list, which is why every root is a step from the last. Harmonising each step gives the passing iiø and iv the reel implies without naming. This is also the reel of the frozen dyad (R2): a fixed F#+G reads 9+b3, then #11+5, then 5+b6 across the loop without changing.",
  },
  // -------------------------------------------------------------------------
  sr_planing_chrom: {
    family: 'minor', pack: 'serum', role: 'harmony', style: 'planed maj7 with a chromatic slide',
    provenance: 'video-transcribed', ratified: false, needsEar: true,
    source: 'igexport-DcbbGuNCfGv.mp4', sourceBpm: 127, sourceKey: 'not stated on screen; read from the voicings',
    read: 'AbΔ7 root position -> EbΔ7 second inversion -> Em7 spread over 2.5 octaves -> Fm9',
    idiomName: 'bIIIΔ7 - bVIIΔ7 - (chromatic) - i9',
    numerals: 'bIIIΔ7-bVIIΔ7-viiΔ-im9',
    degrees: '3:^7 10:^7 11:m7 0:m9',
    voicedAs: ['AbΔ7', 'EbΔ7', 'Em7', 'Fm9'],
    chordUnits: [1, 1, 1, 1],
    appliesWhen: {
      // r29, RETAGGED BY HIS EAR — and the retag is better evidence than the
      // original tags because he judged the SAME progression twice in one round:
      //   casino/tense  "it feels like an unsettling casino. like a casino that
      //                  is happening where something is obviously wrong.
      //                  dissonance but patterns individually work fine"
      //   lab/mysterious "dissonance in the piano and the synths. not a very good
      //                  song - not good combination and instruments seem dissonant"
      // Same chords, same pack, opposite verdicts. MEASURED, vertical friction is
      // NOT the difference and in fact runs the wrong way: the casino song has
      // 38.53 close semitone/tritone pairs per bar and the lab song 20.84, and
      // three songs he liked sit between them. That reproduces D115's own result
      // (twenty dissonance measures, every |r| < 0.23) — the question is not how
      // much friction but WHETHER THE LANE WANTS IT.
      // So this entry keeps the lanes where "something is obviously wrong" is the
      // intent and gives up the ones where it is just wrong.
      emotions: ['tense', 'mysterious'],
      environments: ['casino', 'stealth', 'space'],
      bpm: [95, 135], energy: 'high',
    },
    hisVerdict: 'unsettling casino, "like a casino ... where something is obviously wrong" (r28, casino/tense) — and NOT good in lab/mysterious',
    notes: "The chromatic one, and the one from a DIFFERENT producer than the other five — worth carrying for exactly that reason. Em7 between EbΔ7 and Fm9 is a semitone slide up and back down; it is a passing sonority, not a key change, which is why it is written as a single unit rather than given extra length. Read in F minor, where the Fm9 is the home the loop keeps arriving at. This is also the reel that gives R6 its second independent source (a chord every 3 eighths, verified at two zoom levels).",
  },
};

/** Tag-driven selection, same contract as citypopFor. Refuses the niche lanes. */
export function serumFor({ emotion, environment, bpm, energy } = {}) {
  if (environment && NICHE_LANES.has(environment)) return [];
  const scored = [];
  for (const [name, e] of Object.entries(PROGRESSIONS_SERUM)) {
    const w = e.appliesWhen;
    if (environment && !w.environments.includes(environment)) continue;
    if (emotion && !w.emotions.includes(emotion)) continue;
    let score = 0;
    if (emotion) score += 2;
    if (environment) score += 2;
    if (bpm != null) {
      if (bpm < w.bpm[0] || bpm > w.bpm[1]) continue;
      const mid = (w.bpm[0] + w.bpm[1]) / 2;
      score += 1 - Math.abs(bpm - mid) / (w.bpm[1] - w.bpm[0]);
    }
    if (energy && w.energy === energy) score += 1;
    scored.push({ name, entry: e, score });
  }
  return scored.sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
}

/**
 * The measured tempo range of the six reels this pack is read from.
 * Used by the r28 page so its songs sit in the genre's own tempo band rather
 * than in the engine's emotion-derived default.
 */
export const SERUM_TEMPI = [63, 69, 75, 80, 91, 102, 122, 127];
