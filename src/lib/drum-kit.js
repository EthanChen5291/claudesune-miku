// r37/D142 — THE KIT WRITER. His ask, verbatim: "i want to explore drums, like
// actually good drum vsts ... and then how to make good beats on top of it, like
// more complex ones as well that flow with the song", and on a card:
// "abstract to all of them but drums can totally be better and more complex/
// immersive".
//
// WHAT THE MEASUREMENT SAID (research/drums-r37.md, 718,475 drum MIDI files
// from the archive he attached, against our own 68 songs carrying drums):
//
//                                   corpus      motif-engine
//   snare present                    85.8%           7.4%
//   median piece classes                 4              1
//   two pieces sounding at once       44.7%          0.0%
//   every bar of a loop differs       89.4%          0.0%
//   every bar identical                1.8%          66.2%
//   hand percussion                   35.1%          79.4%
//
// Read together: the engine was not writing a drum kit at all. It was writing
// one-class hand percussion that repeats — the world-percussion folders
// (Africa/Asia/Europe/Middle East) measure exactly our shape, 1 class and 0.00
// simultaneity, and we were serving that for rock and festival prompts too.
//
// WHY A WRITER AND NOT A BIGGER POOL. The old selector took up to three
// UNRELATED library rows by band (`byBand('low')`, a mid, `byBand('high')`) and
// capped at two for most of its life — the "missing snare" defect that has now
// failed four times (r16, r22, D100, and again here). Three unrelated rows can
// never give the corpus's two defining properties: pieces that strike TOGETHER
// (they were written apart) and bars that DIFFER (each row is one bar looped).
// So the kit is composed as a set of COORDINATED LANES from one seed.
//
// LANES, NOT ONE ROW. Each lane is an ordinary RHYTHMS-shaped row with its own
// sound, and they are stacked by the existing compiler. That is deliberate:
// emitting one row with colliding onsets would hit `drumExpr`'s single overlay
// slot (D123's "last writer wins" fix holds exactly two sounds per instant), and
// a real kit puts three on a downbeat. Lanes give simultaneity for free with no
// change to the compiler at all.
//
// WHAT IS NOT HERE, AND IT IS MEASURED ABSENCE, NOT AN OVERSIGHT. The browser
// sample pack carries md_kick / md_snare / md_clap / md_hat / md_ohat /
// md_metal / md_stick and NO RIDE, NO CRASH and no kit toms — against a corpus
// ride rate of 24.4% and crash 18.7%. The fill below borrows vc_tom_hi/lo
// (orchestral toms) because they are the only toms in the pack; the crash
// accent is written as an OPEN HAT, which is the nearest thing the pack has.
// Both are stand-ins and should be replaced once a real kit is rendering.

/** deterministic 32-bit hash — the engine's own, so a kit is reproducible */
function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// A lane's sounds. `deep` picks his Miraleste pack (r24); the stock fallbacks
// keep a page that has not loaded the sample pack audible rather than silent.
const VOICE = {
  kick: { deep: 'md_kick', stock: 'bd' },
  snare: { deep: 'md_snare', stock: 'sd' },
  clap: { deep: 'md_clap', stock: 'cp' },
  hat: { deep: 'md_hat', stock: 'hh' },
  open: { deep: 'md_ohat', stock: 'oh' },
  tomHi: { deep: 'vc_tom_hi', stock: 'ht' },
  tomLo: { deep: 'vc_tom_lo', stock: 'lt' },
};

// ---------------------------------------------------------------------------
// THE GENRE TABLE. Every row is a median measured off the archive's own
// genre folders (the per-genre table in research/drums-r37.md), not invented:
// `onsets` is that folder's median onsets/bar, `odd16` its median share of
// onsets on an odd 16th (the "e"/"a"), `openHat`/`tom` the share of its files
// carrying one. A lane is written to hit its row's numbers, so "funk" is funk
// because it syncopates at 0.30 like the Funk Drums folder does, not because a
// human called the pattern funky.
// ---------------------------------------------------------------------------
export const KIT_STYLES = {
  // n=268, bpm 123, 15.0 onsets/bar, odd16 0.300, openHat 0.45, stack 0.29
  funk: { onsets: 15, odd16: 0.30, openHat: 0.45, ghost: 0.5, kick: 'syncopated', hat: '16th' },
  // n=268, bpm 95, 12.5 onsets/bar, odd16 0.083, openHat 0.25, stack 0.44
  rock: { onsets: 12.5, odd16: 0.08, openHat: 0.25, ghost: 0.2, kick: 'four', hat: '8th' },
  // GM MIDI Pack, n=331749, bpm 128, 15.0 onsets/bar, odd16 0.056, stack 0.40
  pop: { onsets: 15, odd16: 0.06, openHat: 0.30, ghost: 0.25, kick: 'boom_bap', hat: '16th' },
  // Electronic Dance n=420 + Superior n=368757: four-on-the-floor, offbeat open
  dance: { onsets: 16, odd16: 0.20, openHat: 0.60, ghost: 0.1, kick: 'four', hat: 'offbeat' },
  // Linear Drums, n=338: simultaneity 0.00 BY RULE with four classes — the one
  // folder whose shape the engine already had by accident. Kept as a NAMED
  // style so sparseness can be deliberate instead of a defect.
  linear: { onsets: 9.5, odd16: 0.318, openHat: 0.44, ghost: 0.3, kick: 'syncopated', hat: '8th', linear: true },
  // Blues Drums n=135 (off16 0.333) / Swing n=39 (off16 0.580) — the shuffle
  // lane. Its 8ths are TRIPLET 8ths, which is what puts it off the 16th grid.
  shuffle: { onsets: 14.5, odd16: 0, openHat: 0.05, ghost: 0.4, kick: 'four', hat: 'shuffle' },
  // Rock:Indie n=268 read quiet — a held-back kit for ballad and scene lanes
  ballad: { onsets: 8, odd16: 0.05, openHat: 0.15, ghost: 0.3, kick: 'sparse', hat: '8th' },
  // r41/D146 — THE CINEMATIC KIT. His serious export, four cards: "the
  // percussion isn't serious. think the percussion in movie soundtracks, or
  // maybe even the percussion of the SAC with an actual complex beat" (x3) and
  // "the drums are too casual (just a normal beat)".
  //
  // Every drummed serious song was running `rock` or `ballad` — a drum-kit
  // kick, a drum-kit snare and a hi-hat. The sample pack has carried the whole
  // orchestral battery since D93 and the serious page never reached for it:
  // vc_wardrum (+cresc), vc_timpani, vc_snare_mil, vc_snare_roll, vc_gong,
  // vc_frame, vc_log_hi/lo. There is no hi-hat in a film cue.
  //
  // The numbers are the practitioner consensus in research/serious-r40.md §1.8,
  // not a genre-folder median like the rows above — stated plainly because this
  // row is NOT measured off the archive the way the others are: orchestral bass
  // drum on the downbeats, a steady accented ostinato instead of a hat, a
  // military snare pattern on top, timpani for the accents and fills. Straight
  // on the grid (odd16 0.05): syncopation is what reads "casual" here.
  cinematic: {
    onsets: 13, odd16: 0.05, openHat: 0, ghost: 0.15, kick: 'four', hat: '16th',
    voices: { kick: 'vc_wardrum', snare: 'vc_snare_mil', hat: 'vc_frame', tomHi: 'vc_timpani', tomLo: 'vc_wardrum', open: 'vc_gong' },
  },
};

const KICKS = {
  //                 bar-relative 16th slots
  four: [0, 4, 8, 12],
  boom_bap: [0, 7, 10],
  syncopated: [0, 3, 6, 10],
  sparse: [0, 8],
};

/**
 * Compose a drum kit as coordinated lanes.
 *
 * @param {object} o
 * @param {string} o.seed      stable per song+section, so the kit is deterministic
 * @param {string} o.style     a key of KIT_STYLES
 * @param {number} o.bars      phrase length — 2 or 4 (the corpus is 23.1% / 50.2%)
 * @param {boolean} o.fill     write a fill in the phrase's last bar
 * @param {boolean} o.deep     use the local sample pack rather than stock one-shots
 * @returns {Array<object>} RHYTHMS-shaped lane rows, ready for the drum compiler
 */
export function writeKit({ seed = 'kit', style = 'rock', bars = 4, fill = true, deep = true } = {}) {
  const st = KIT_STYLES[style] ?? KIT_STYLES.rock;
  // r41: a style may name its own voices (the cinematic battery). Stock
  // one-shots are unchanged — those are the browser fallback, and no local
  // sample exists there to swap to.
  const v = (k) => (deep ? (st.voices?.[k] ?? VOICE[k].deep) : VOICE[k].stock);
  const rnd = (tag) => fnv(`${seed}|${tag}`);
  // A 16th grid everywhere except `shuffle`, whose 8ths are triplet 8ths — that
  // is the ONLY way this engine has ever put an onset off the 16th grid, and
  // half the corpus is off it (50.4%).
  const DEN = st.hat === 'shuffle' ? 12 : 16;
  const per = DEN;                         // grid steps per bar
  const at = (bar, step) => `${bar * per + step}/${per}`;

  const kickOn = [], kickAcc = [];
  const snareOn = [], snareAcc = [], snareSnd = [];
  const hatOn = [], hatAcc = [], hatSnd = [];
  const tomOn = [], tomAcc = [], tomSnd = [];

  const scale = DEN / 16;                  // 16th slots -> this grid
  const fillBar = fill && bars >= 2 ? bars - 1 : -1;

  for (let bar = 0; bar < bars; bar++) {
    const isFill = bar === fillBar;
    const r = rnd(`bar${bar}`);

    // ---- KICK ------------------------------------------------------------
    // THE BAR-TO-BAR LAW (corpus: 89.4% of multi-bar loops have every bar
    // different, 1.8% repeat one exactly; ours was 0% and 66.2%). Every bar
    // after the first takes a displacement drawn from its own hash, so no two
    // bars of a phrase carry the same kick — this is the drum equivalent of
    // D97's composite, and for the same reason: repeating one bar reads as a
    // machine, and "1 interval randomly" is not a variation.
    if (!isFill) {
      const base = KICKS[st.kick] ?? KICKS.four;
      const shifted = base.map((s, i) => {
        if (bar === 0 || i === 0) return s;             // the downbeat is never moved
        const d = (r >> (i * 3)) % 4;
        return d === 0 ? s : d === 1 ? s + 1 : d === 2 ? Math.max(0, s - 1) : s;
      });
      const extra = bar > 0 && (r % 3 === 0) ? [(r >> 8) % 4 === 0 ? 14 : 11] : [];
      for (const s of [...new Set([...shifted, ...extra])].sort((a, b) => a - b)) {
        if (s >= 16) continue;
        kickOn.push(at(bar, Math.round(s * scale)));
        kickAcc.push(s === 0 ? 1.0 : 0.82);
      }
    } else {
      kickOn.push(at(bar, 0)); kickAcc.push(1.0);
    }

    // ---- SNARE: backbeat, ghosts, and the fill ---------------------------
    // Ghost notes are not an ornament — where the corpus writes them at all
    // (23.5% of grooves) they are 37.5% of that groove's snare hits, and they
    // are what makes 28 distinct velocities out of a two-hit part.
    if (!isFill) {
      for (const beat of [4, 12]) {
        snareOn.push(at(bar, Math.round(beat * scale)));
        snareAcc.push(1.0); snareSnd.push(v('snare'));
        // the clap LAYERS with the snare rather than replacing it (D123's
        // same-slot law) — it is a second lane, so no overlay is involved
      }
      const ghosts = Math.round(st.ghost * 4);
      // The ghost SET is rotated by the bar index, not only hashed: hashing
      // alone measured 3 of 4 bars distinct, and the corpus is 89.4% ALL
      // distinct. Rotating guarantees no two bars of a phrase carry the same
      // ghost placement, which is the cheapest way to hold the bar-to-bar law.
      const GHOST_SLOTS = [3, 7, 11, 15];
      for (let g = 0; g < ghosts; g++) {
        const slot = GHOST_SLOTS[(bar + g + ((r >> (g * 4)) % 2)) % GHOST_SLOTS.length];
        snareOn.push(at(bar, Math.round(slot * scale)));
        snareAcc.push(0.26 + ((r >> (g * 2)) % 5) * 0.02);   // 0.26–0.34, never uniform
        snareSnd.push(v('snare'));
      }
    } else {
      // THE FILL IS THE LAST BAR OF THE PHRASE (the archive gives fills their
      // own folder: 3 classes, tom share 0.49). Descending toms into the turn.
      const steps = DEN === 12 ? [0, 2, 4, 6, 8, 10] : [0, 2, 4, 6, 8, 10, 12, 14];
      steps.forEach((s, i) => {
        tomOn.push(at(bar, s));
        tomAcc.push(0.55 + (i / steps.length) * 0.4);        // a crescendo into the turn
        tomSnd.push(i < steps.length / 2 ? v('tomHi') : v('tomLo'));
      });
      snareOn.push(at(bar, Math.round(4 * scale)));
      snareAcc.push(0.9); snareSnd.push(v('snare'));
    }

    // ---- HAT: the timekeeper, its accents, and the open-hat phrase mark ---
    if (!isFill || st.hat === 'offbeat') {
      const steps = st.hat === '16th' ? [0, 1, 2, 3, 4, 5, 6, 7]
        : st.hat === 'offbeat' ? [1, 3, 5, 7]
          : st.hat === 'shuffle' ? [0, 2, 3, 5]                 // triplet 8ths: 1 _ & …
            : [0, 1, 2, 3, 4, 5, 6, 7];
      const span = st.hat === '16th' ? 2 : st.hat === 'shuffle' ? 3 : 2;
      for (const s of steps) {
        const step = st.hat === 'shuffle' ? s : s * span;
        if (step >= per) continue;
        hatOn.push(at(bar, step));
        // an accent every beat, a lighter touch between — the corpus's velocity
        // spread is mostly this, not ghost notes
        hatAcc.push(step % (per / 4) === 0 ? 0.62 : 0.38);
        hatSnd.push(v('hat'));
      }
      // THE OPEN HAT MARKS THE PHRASE (corpus: 29.4% of grooves carry one;
      // 0.97 in the loop-oriented folders). It lands on the last 8th of the
      // bar before the phrase turns, which is where a drummer opens up.
      const wantsOpen = (r % 100) < st.openHat * 100;
      if (wantsOpen && !isFill) {
        hatOn.push(at(bar, per - (DEN === 12 ? 3 : 2)));
        hatAcc.push(0.7); hatSnd.push(v('open'));
      }
    }
  }

  const lane = (name, onsets, accents, sounds, sound) => (onsets.length ? {
    role: 'percussion', band: name === 'kick' ? 'low' : name === 'hat' ? 'high' : 'mid',
    style: 'kit-writer', provenance: 'r37 writer', ratified: false,
    onsets, accents, bars, meter_class: '4/4',
    ...(sounds ? { sounds } : { sound }),
    tags: ['kit', name, style],
    character: `${name} lane, ${style} — written from the r37 drum-archive medians`,
  } : null);

  const lanes = [
    lane('kick', kickOn, kickAcc, null, v('kick')),
    lane('snare', snareOn, snareAcc, snareSnd),
    lane('hat', hatOn, hatAcc, hatSnd),
    lane('tom', tomOn, tomAcc, tomSnd),
  ].filter(Boolean);

  // LINEAR MEANS NO TWO PIECES EVER STRIKE TOGETHER, and the flag was declared
  // in the table and never read — the first build measured simultaneity 0.400
  // on the one style whose entire definition is 0.00. That is the same class of
  // defect as a pool of one (D119): a parameter that looks like it is doing
  // something and is not. Later lanes yield the slot to earlier ones, in kit
  // priority order (kick > snare > hat > tom), which is how a linear drummer
  // actually resolves it.
  if (st.linear) {
    const taken = new Set();
    for (const L of lanes) {
      const keepIx = [];
      L.onsets.forEach((o, i) => {
        const [n, d] = o.split('/').map(Number);
        const key = Math.round((n / d) * per);
        if (taken.has(key)) return;
        taken.add(key); keepIx.push(i);
      });
      L.onsets = keepIx.map((i) => L.onsets[i]);
      L.accents = keepIx.map((i) => L.accents[i]);
      if (L.sounds) L.sounds = keepIx.map((i) => L.sounds[i]);
    }
    return lanes.filter((L) => L.onsets.length);
  }
  return lanes;
}

/** the style a song's own vibe asks for — never a name list, always the vibe's
 *  own measured energy and lane, so a new environment cannot miss the table */
export function kitStyleFor({ bpm = 110, energy = 0.5, moods = [], lane = null } = {}) {
  if (lane && KIT_STYLES[lane]) return lane;
  const m = moods.map((x) => String(x).toLowerCase());
  if (m.some((x) => /swing|jazz|blues|saloon/.test(x))) return 'shuffle';
  if (m.some((x) => /funk|groov|strut/.test(x))) return 'funk';
  if (bpm >= 124 && energy >= 0.6) return 'dance';
  if (energy >= 0.55) return 'rock';
  if (energy <= 0.3 || bpm <= 80) return 'ballad';
  return 'pop';
}
