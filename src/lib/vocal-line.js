// r35 — a SUNG line written from the Vocaloid set's rules (research/vocaloid-r35.md).
//
// His ask: "our voices are good and the melody is good but it's relatively
// uniform … learn from vocaloid patterns and agreements with harmony and
// ranges and speeds that can be done (and the choruses to support)".
//
// Measured over 36 transcriptions, the sung line is NOT the instrumental lead
// the engine sings today (a quarter-note arpeggio starting every phrase on the
// downbeat, never repeating a cell): it is
//   - 8ths at a TEMPO-INVARIANT syllable rate (~3.9 syllables/s: 7 notes a bar
//     at 120, 5 at 180; 16ths appear under 140 bpm, quarters over 170);
//   - a scale walk — step 48%, repeat 25%, third 13%, 4th/5th 9%, wider 2% —
//     inside an 11-semitone home (80% of notes), full range 21;
//   - phrases of ~6 notes / 3.5 beats separated by an 8th-note breath, starting
//     OFF the downbeat (off-8ths ~23%, beat 4 ~11%, & of 4 ~10%, beat 2 12%,
//     beat 3 10%, downbeat 9%);
//   - a 2-bar hook cell that RETURNS AT PITCH (31% of 2-bar cells are exact
//     repeats; 42% repeat the rhythm) with its landing re-fit to the chord;
//   - chord tones on the beat (64% beat 1, 67% beat 3) and diatonic neighbours
//     between (NCT 39%, 57% resolved by step); out of key 4%;
//   - phrase finals on root / 3rd / 5th (60%), a quarter long;
//   - the chorus +3..+5 semitones up, same syllable rate.
//
// This module AUTHORS a spec for bindMelodySpec (src/binder/bind.js, the D38
// guard: accented notes snap to the chord's core tones, weak out-of-supply
// notes resolve or are snapped, loudly). It composes from RULES, never from
// the corpus's notes (D95 — "patterns yes, tunes no"), and it is a pure
// function of its seed: the same song name writes the same line.
//
// Shape: a 4-bar spec = the HOOK cell (bars 0–1) + the ANSWER cell (bars 2–3,
// the same rhythm, the walk re-rolled from the hook's last pitch). The rhythm
// is CYCLIC over the 2-bar cell — a phrase that starts on the pickup of beat 4
// runs across the bar line, and a phrase that runs past the cell's end wraps
// to its start (which is where the previous cell's tail sits in a real song).
// Every section start in the suite divides by 4, so cycle c of the bound
// expression is spec bar c % 4 wherever the letter's mask lets it sound, and
// an 8-bar section states the hook twice (H A H A) — the corpus's 31%/42%
// exact/rhythm repetition arrives from the form, not from a copy.
//
// Rests are real: a null degree is an explicit '~' (bindMelodySpec's r35
// extension), so export-vocal.mjs sees the breath as a gap, not as legato.

import { fnv } from './harmony-prior.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** a tiny seeded PRNG (mulberry32) — deterministic per song + letter */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, table) => { // table: [[value, weight], ...]
  const tot = table.reduce((s, [, w]) => s + w, 0);
  let x = r() * tot;
  for (const [v, w] of table) { x -= w; if (x <= 0) return v; }
  return table[table.length - 1][0];
};

/**
 * The syllable rate law: ~3.9 syllables a second whatever the tempo, so the
 * notes per bar FALL as the tempo rises. Corpus medians by band: <100 → 6.5,
 * 100–139 → 7.2, 140–169 → 6.0, 170+ → 4.9 (and 16ths only under 140).
 */
export function vocalDensity(bpm, { rate = 3.9, slowFloor = false } = {}) {
  const perBar = rate * (240 / bpm);
  // r38 (research/vocaloid-r38.md §8): below ~100 bpm the corpus HALVES the
  // count rather than holding the rate — its <100 band sings 6.5 notes a bar
  // at 2.2 syllables/s with 3% 16ths. The rate law at 70–84 bpm wrote 61–67%
  // 16th-note runs on bd_lighthouse / bd_credits, which is not what a singer
  // does at a ballad tempo. Opt-in (`vocalWriter.slowFloor`) so no judged
  // sung line moves.
  const cap = slowFloor && bpm < 100 ? 6.5 : 8;
  return { notesPerBar: clamp(perBar, 3.5, cap), sixteenths: bpm < 100 ? 0.03 : bpm < 140 ? 0.3 : bpm < 170 ? 0.1 : 0.01 };
}

/** the corpus's phrase-start table, in 8th slots of the bar (r35 verify: the
 *  first table read the & of 4 as part of a 26% beat-4 pickup; measured
 *  finely it is beat 4 ~11%, & of 4 ~10%, the three off-8ths ~23%, beat 2
 *  12%, beat 3 10%, downbeat 9%) */
const START_TABLE = [[0, 9], [1, 8], [2, 12], [3, 8], [4, 10], [5, 8], [6, 11], [7, 10]];

/**
 * The rhythm of one 2-bar cell as a CYCLIC list of 8th-slot events:
 * [{slot (0..16, may be x.5 for a 16th), len (in 8ths), phraseStart,
 * phraseEnd}] sorted by slot. Phrases of 4–8 syllables separated by a one-8th
 * breath (sometimes two); the first phrase starts where the corpus starts.
 * Density is the SYLLABLE budget for the 16 slots: the fill stops when the
 * cycle is full or the budget is spent, so the tempo law holds.
 */
function cellRhythm(r, { notesPerBar, sixteenths, startBias = null, breathBias = null }) {
  const SLOTS = 16;
  const budget = Math.round(notesPerBar * 2);
  const start = startBias ?? pick(r, START_TABLE);
  const events = [];
  let cursor = start, used = 0, count = 0, guard = 0;
  while (used < SLOTS - 1 && count < budget && guard++ < 40) {
    const phraseLen = pick(r, [[3, 1], [4, 2], [5, 3], [6, 4], [7, 3], [8, 2]]);
    for (let n = 0; n < phraseLen && used < SLOTS - 1 && count < budget; n++) {
      const last = n === phraseLen - 1 || used >= SLOTS - 2 || count === budget - 1;
      let len = 1;
      if (last) len = 2;                       // the phrase final is a quarter
      else if (r() < 0.16 && !(events.length && events[events.length - 1].len === 2)) len = 2; // a quarter inside a phrase, never two in a row
      if (!last && len === 1 && r() < sixteenths && count + 1 < budget) {
        // a 16th PAIR: two syllables in one 8th (under 140 bpm)
        events.push({ slot: cursor % SLOTS, len: 0.5, phraseStart: n === 0, phraseEnd: false });
        events.push({ slot: (cursor + 0.5) % SLOTS, len: 0.5, phraseStart: false, phraseEnd: false });
        cursor += 1; used += 1; count += 2;
        continue;
      }
      events.push({ slot: cursor % SLOTS, len, phraseStart: n === 0, phraseEnd: last });
      cursor += len; used += len; count++;
      if (last) break;
    }
    // the breath: one 8th (median 0.5 beat), sometimes two
    const breath = breathBias ?? pick(r, [[1, 7], [2, 3]]);
    cursor += breath; used += breath;
    // (r35 verify: only the FIRST phrase took the start table; later phrases
    // began wherever the previous one ended, 52% on off-8ths) — the next
    // phrase's start is drawn from the table too and reached by lengthening
    // the breath by up to two 8ths when the drawn slot lies just ahead
    // (not when the breath is pinned by a lab card — the card's variable is
    // the breath length, and the snap lengthened it)
    if (breathBias == null) {
      const want = startBias ?? pick(r, START_TABLE);
      const ahead = ((want - (cursor % 8)) % 8 + 8) % 8;
      if (ahead > 0 && ahead <= 2) { cursor += ahead; used += ahead; }
    }
  }
  if (events.length) events[events.length - 1].phraseEnd = true;
  // a final's quarter that runs past the cycle end is cut to an 8th
  for (const e of events) if (e.slot + e.len > SLOTS) e.len = SLOTS - e.slot;
  return events.sort((a, b) => a.slot - b.slot);
}

/**
 * r40 — THE THEME RHYTHM (his "the main theme/voice has a very strong, slow
 * ish theme when it's the main thing"). Measured on his serious set
 * (research/serious-r40.md): the theme runs 1.6–3.2 notes a bar, median
 * duration 0.66–1.45 beats, 15–54% dotted values, phrases START on a beat
 * (AoT slot 0/8 on 22 of 24, Muzan 19 of 23 on the downbeat, Zoltraak 18 of
 * 35), the phrase peak sits early (15–43% of the phrase), and the engine's
 * own leads ran 5–7.5 a bar with 0% dotted. The r35 cell writes SYLLABLES;
 * this writes a THEME: quarters, dotted quarters answered by an 8th (the
 * AoT 3+1), halves, and a held final of at least a half note. One cyclic
 * 2-bar cell like cellRhythm, so everything downstream (hook/answer, riders,
 * the lyric binder) is unchanged.
 */
function themeRhythm(r, { notesPerBar, startBias = null, dotted = 0.3 }) {
  const SLOTS = 16;
  const budget = Math.max(2, Math.round(notesPerBar * 2));
  const start = startBias ?? pick(r, [[0, 60], [4, 15], [6, 12], [2, 8], [8, 5]]);
  const events = [];
  let cursor = start, used = 0, count = 0, guard = 0;
  // phrase = one bar (8 slots) or two bars; the final is held
  while (used < SLOTS - 2 && count < budget && guard++ < 40) {
    const phraseLen = pick(r, [[2, 3], [3, 4], [4, 3]]);
    let pendingShort = false;
    for (let n = 0; n < phraseLen && count < budget && cursor < start + SLOTS - 1; n++) {
      const last = n === phraseLen - 1 || count === budget - 1;
      let len;
      if (last) len = pick(r, [[4, 5], [6, 3], [3, 2], [2, 3]]);   // a held final: half / dotted half / dotted quarter / quarter
      else if (pendingShort) { len = 1; pendingShort = false; }    // the 8th that answers a dotted quarter
      // the mix of values, measured: attack on titan's theme is 42% notes of a
      // beat or longer, Homura 59%, Muzan 37% — NOT all of them. A first cut
      // without the 8ths here realized 100% on two songs.
      else { len = pick(r, [[2, 40], [3, Math.round(100 * dotted)], [4, 12], [1, 16]]); if (len === 3) pendingShort = true; }
      const room = start + SLOTS - cursor;
      if (len > room) len = room;
      if (len <= 0) break;
      events.push({ slot: cursor % SLOTS, len, phraseStart: n === 0, phraseEnd: last });
      cursor += len; used += len; count++;
      if (last) break;
    }
    // the breath after a held final: a quarter, sometimes an 8th
    // the breath after a held final: a quarter, sometimes a half — an EVEN
    // number of 8ths, so the next phrase starts on a beat (his set: 22 of 24 AoT
    // phrases, 19 of 23 Muzan)
    const breath = pick(r, [[2, 7], [4, 2]]);
    cursor += breath; used += breath;
    // …and SNAP to the next beat if an 8th or a dotted value has shifted the
    // parity. Without this a phrase ending on a dotted quarter puts every
    // later phrase off the beat and keeps it there: measured on the first
    // build, sr_oath started 0% of its phrases on a beat against the
    // reference's 32–98%.
    if (cursor % 2 === 1) { cursor += 1; used += 1; }
  }
  if (events.length) events[events.length - 1].phraseEnd = true;
  for (const e of events) if (e.slot + e.len > SLOTS) e.len = SLOTS - e.slot;
  return events.sort((a, b) => a.slot - b.slot);
}

/**
 * The walk: scale degrees around a home centre, mean-reverting, with the
 * corpus's interval table and an arch inside each phrase. `chordDegsOf(bar)`
 * gives the bar's chord tones as scale-degree indices (0..6) of the key.
 * Events are walked in TIME order; a phrase that wrapped keeps its flags.
 */
function walk(r, events, { centre, span, chordDegsOf, fromDeg = null, upLean = 0, theme = false }) {
  let deg = fromDeg ?? centre + pick(r, [[0, 4], [1, 3], [-1, 3], [2, 1], [-2, 1]]);
  const out = [];
  // phrase lengths in time order (a wrapped phrase counts its tail first)
  const lens = new Map();
  for (let i = 0; i < events.length; i++) {
    if (!events[i].phraseStart) continue;
    let n = 1, k = i + 1;
    while (k < events.length && !events[k].phraseStart) { n++; k++; }
    lens.set(i, n);
  }
  let phraseLen = 4, posInPhrase = 0, repeatsRun = 0;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.phraseStart) { phraseLen = lens.get(i) ?? 4; posInPhrase = 0; }
    const bar = Math.floor(e.slot / 8);
    const chordDegs = chordDegsOf(bar);
    const strong = e.slot % 8 === 0 || e.slot % 8 === 4; // beats 1 and 3
    const rel = phraseLen > 1 ? posInPhrase / (phraseLen - 1) : 0;
    // direction: an arch — up in the first half, down in the second; pulled
    // back toward the centre when the line strays past the home span
    // (r35 verify: a pull that fired only BEYOND the span let the line park at
    // the clamp and swallowed the chorus lift on 10 of 36 songs — the pull is
    // now proportional to the distance from the centre)
    // r40 theme: the peak comes EARLY (15–43% of the phrase on his serious set) — up for the first third, then down
    let dirBias = (theme ? (rel < 0.34 ? 0.7 : 0.35) : (rel < 0.5 ? 0.6 : 0.4)) - 0.09 * (deg - centre) + (upLean ?? 0);
    dirBias = clamp(dirBias, 0.12, 0.88);
    const cls = e.phraseStart && i > 0
      ? (theme ? pick(r, [[0, 2], [1, 3], [2, 2], [3, 3], [4, 3], [5, 1]])   // r40 theme: a phrase opens with a 4th/5th leap as often as a step (Muzan opens 14 of 23 phrases with -7/-9)
        : pick(r, [[0, 2], [1, 5], [2, 3], [3, 2], [4, 1]]))            // a new phrase may enter by a leap
      : (theme ? pick(r, [[0, 16], [1, 44], [2, 18], [3, 10], [4, 8], [5, 4]]) // r40 theme table: leaps >= a 7th at 9–45% on his set vs the sung corpus's 2–8%
        : pick(r, [[0, 20], [1, 50], [2, 14], [3, 6], [4, 3], [5, 1]])); // the corpus interval table (degrees: 1 = step, 2 = third, 3/4 = 4th–5th)
    let next = deg;
    if (cls > 0) next = deg + (r() < dirBias ? cls : -cls);
    // a leap of a 4th or more is answered by a step back a third of the time
    if (i > 0 && Math.abs(out[i - 1].deg - deg) >= 3 && r() < 0.34) next = deg + (out[i - 1].deg > deg ? 1 : -1);
    next = clamp(next, centre - span - 1, centre + span + 1);
    // strong beats and phrase finals sit on a chord tone (the guard would snap
    // them anyway — choosing the NEAREST keeps the walk a walk, not a jump);
    // a phrase final prefers root / 3rd / 5th
    if (strong || e.phraseEnd) {
      const cands = chordDegs.length ? chordDegs : [0, 2, 4];
      let best = next, bd = Infinity;
      for (let o = -2; o <= 2; o++) for (const c of cands) { const d = c + 7 * o; const dist = Math.abs(d - next); if (dist < bd) { bd = dist; best = d; } }
      next = best;
    }
    // three repeats in a row is a chant, not a line: the fourth moves a step
    if (next === deg) { repeatsRun++; if (repeatsRun >= 3 && !strong) { next = deg + (r() < dirBias ? 1 : -1); repeatsRun = 0; } } else repeatsRun = 0;
    deg = next;
    out.push({ ...e, deg, strong });
    posInPhrase++;
  }
  return out;
}

/**
 * composeVocalLine(params) -> { spec, meta }
 *   params: { seed (string), keyIntervals (the mode's 7 semitone offsets),
 *     rootMidi (the key root at the spec octave), bpm, harmony: [sym per bar]
 *     (>= 4; the first 4 are used), chordTonesOf(sym) -> pitch-class Set,
 *     role: 'verse' | 'chorus' | 'bridge', lift (semitones, default by role),
 *     targetMidi (the home centre, default 66), span (degrees each side of
 *     the centre, default 3 = an 11-semitone home), rate (syllables/s, default
 *     3.9), stmt (statement number — >= 2 re-rolls the answer only),
 *     hookVary ('answer' | 'none' | 'all'), startBias / breathBias (lab knobs) }
 */
export function composeVocalLine(params) {
  const {
    seed, keyIntervals, rootMidi, bpm, harmony, chordTonesOf,
    role = 'verse', stmt = 0, rate = 3.9, startBias = null, breathBias = null, slowFloor = false,
    theme = false,
  } = params;
  // r40 — `theme: true | { notesPerBar, dotted }` writes the SERIOUS theme
  // (themeRhythm above): 2–3 notes a bar whatever the tempo, beat starts, a
  // held final. Opt-in: no judged sung line moves.
  const themeCfg = theme ? (typeof theme === 'object' ? theme : {}) : null;
  // (r35 verify: at +4 the walk's own wander hid the lift on 4 of 14 suite
  // songs — the chorus default is +5 and the chorus walk leans upward)
  const lift = params.lift ?? (role === 'chorus' ? 5 : role === 'bridge' ? 2 : 0);
  const targetMidi = (params.targetMidi ?? 66) + lift;
  const span = params.span ?? 3;
  // hookVary: 'answer' (default — the hook returns AT PITCH on every statement
  // and the answer re-rolls from the third statement, r24's restate-then-
  // depart), 'none' (nothing re-rolls: the 4 bars loop verbatim), 'all' (the
  // hook re-rolls from the third statement too — every return is new)
  // 'answer1' re-rolls the answer from the SECOND statement (a lab variant —
  // every return varies its second half); 'all' re-rolls hook and answer from
  // the second statement (every return is new)
  const hookVary = params.hookVary ?? 'answer';
  const from = hookVary === 'answer' ? 2 : hookVary === 'none' ? Infinity : 1;
  const salt = stmt >= from ? stmt : 0;
  const r = rng(fnv(`${seed}|vocal|${role}${hookVary === 'all' && salt ? `|h${salt}` : ''}`));
  const rA = rng(fnv(`${seed}|vocal|${role}|answer|${salt}`));
  const density = vocalDensity(bpm, { rate, slowFloor });
  const notesPerBar = themeCfg ? clamp(themeCfg.notesPerBar ?? 2.5, 1.5, 3.5) : density.notesPerBar;
  const sixteenths = themeCfg ? 0 : density.sixteenths;
  // the home centre as a scale degree (0 = key root at rootMidi)
  const semis = targetMidi - rootMidi;
  let centre = 0, bd = Infinity;
  // (r35 verify: a [-7, 21] search parked a leadOctave-6 song's centre at A5
  // and made the octave parameter a no-op — the search now spans four octaves
  // either side; a rider that wants ANOTHER octave shifts degrees by 7)
  for (let d = -28; d <= 28; d++) { const m = keyIntervals[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); if (Math.abs(m - semis) < bd) { bd = Math.abs(m - semis); centre = d; } }
  // chord tones per bar as scale degrees (altered tones fall to the nearest)
  const chordDegsOf = (bar) => {
    const sym = harmony[((bar % harmony.length) + harmony.length) % harmony.length];
    const pcs = chordTonesOf(sym);
    const out = [];
    for (let d = 0; d < 7; d++) { const pc = (((rootMidi + keyIntervals[d]) % 12) + 12) % 12; if (pcs.has(pc)) out.push(d); }
    return out;
  };
  // a syllable budget past what 8ths can hold in 16 slots (~11 with breaths
  // and quarter finals) is met with 16th PAIRS — the corpus's 100–139 bpm
  // band sings 34% 16ths for exactly this reason (7.2 notes a bar)
  const budget = notesPerBar * 2;
  const sixteenthsEff = Math.max(sixteenths, clamp((budget - 10) / 8, 0, 0.6));
  const rhythm = themeCfg
    ? themeRhythm(r, { notesPerBar, startBias, dotted: themeCfg.dotted ?? 0.3 })
    : cellRhythm(r, { notesPerBar, sixteenths: sixteenthsEff, startBias, breathBias });
  // the hook walks the cell; the answer keeps the RHYTHM (42% of 2-bar cells
  // repeat the rhythm) and re-rolls the walk from where the hook ended
  const upLean = role === 'chorus' ? 0.06 : 0;
  const themeWalk = !!themeCfg;
  const hook = walk(r, rhythm.map((e) => ({ ...e })), { centre, span, chordDegsOf: (b) => chordDegsOf(b), upLean, theme: themeWalk });
  const answer = walk(rA, rhythm.map((e) => ({ ...e })), { centre, span, chordDegsOf: (b) => chordDegsOf(b + 2), fromDeg: hook[hook.length - 1]?.deg ?? centre, upLean, theme: themeWalk });
  // emit the 4 spec bars: onsets as 16ths of the bar, degrees (int scale
  // degrees relative to the key root at `octave`), accents (beat 1 > beat 3 >
  // phrase final > syllable), and explicit RESTS (null degree) after each
  // phrase final so the breath is a real gap
  const bars = Array.from({ length: 4 }, () => ({ onsets: [], accents: [], degrees: [] }));
  const put = (bar, slotInBar, degree, accent) => {
    if (bar < 0 || bar > 3 || slotInBar < 0 || slotInBar >= 8) return;
    const B = bars[bar];
    const key = Math.round(slotInBar * 2);
    const ix = B.onsets.indexOf(key);
    if (ix >= 0) { if (degree != null || B.degrees[ix] == null) { B.degrees[ix] = degree ?? B.degrees[ix]; B.accents[ix] = Math.max(B.accents[ix], accent); } return; }
    B.onsets.push(key); B.degrees.push(degree); B.accents.push(accent);
  };
  const emit = (cell, barOffset) => {
    const slots = new Set(cell.map((e) => e.slot));
    for (const e of cell) {
      const bar = barOffset + Math.floor(e.slot / 8);
      put(bar, e.slot - Math.floor(e.slot / 8) * 8, e.deg, e.slot % 8 === 0 ? 0.85 : e.slot % 8 === 4 ? 0.75 : e.phraseEnd ? 0.62 : 0.5);
      if (e.phraseEnd) {
        const restSlot = e.slot + e.len;
        if (restSlot < 16 && !slots.has(restSlot)) put(barOffset + Math.floor(restSlot / 8), restSlot - Math.floor(restSlot / 8) * 8, null, 0);
      }
    }
  };
  emit(hook, 0);
  emit(answer, 2);
  for (const B of bars) {
    if (!B.onsets.length) { B.onsets.push(0); B.degrees.push(null); B.accents.push(0); }
    const idx = B.onsets.map((o, i) => i).sort((a, b) => B.onsets[a] - B.onsets[b]);
    B.onsets = idx.map((i) => `${B.onsets[i]}/16`); B.degrees = idx.map((i) => B.degrees[i]); B.accents = idx.map((i) => B.accents[i]);
  }
  const notes = [...hook, ...answer];
  const meta = {
    role, lift, centreDeg: centre, targetMidi, notesPerBar: Math.round(notesPerBar * 10) / 10, theme: !!themeCfg,
    hookNotes: hook.length, answerNotes: answer.length,
    steps: Math.round(100 * notes.slice(1).filter((n, i) => Math.abs(n.deg - notes[i].deg) === 1).length / Math.max(1, notes.length - 1)),
    repeats: Math.round(100 * notes.slice(1).filter((n, i) => n.deg === notes[i].deg).length / Math.max(1, notes.length - 1)),
    phraseStarts: hook.filter((e) => e.phraseStart).map((e) => e.slot % 8),
  };
  return { spec: { name: `vocal:${role}`, bars }, meta };
}
