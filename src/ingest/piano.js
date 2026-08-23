// Piano-arrangement analysis for full-song MIDI (the Undertale corpus, D30).
// Unlike the Unison packs (D29), these files carry NO labels: no numerals in the
// filename, no per-part tracks, no trustworthy key directory. Everything here is
// solved from the notes and every solve records the evidence behind it, so an
// entry is never quietly trusted (A6.1) — low-confidence results are flagged,
// not dropped.
//
// What this module answers, in dependency order:
//   splitHands()    which notes are the accompaniment (the "left hand") and
//                   which are the melody line
//   chordTimeline() what chord is sounding when (template match + hysteresis)
//   solveKeyKS()    what key the song is in (Krumhansl-Schmuckler profiles)
//   barFigures()    the accompaniment's bar-by-bar figuration, abstracted to
//                   CHORD-RELATIVE tokens ('R 5 R+ 5' = root, fifth, octave,
//                   fifth) — the "movement of the fingers" with the specific
//                   chord factored out, so the same figure can be re-applied
//                   to any progression

import { qualityPcs } from './numerals.js';

const mod12 = (x) => ((x % 12) + 12) % 12;

// ---------------------------------------------------------------------------
// Hand separation
// ---------------------------------------------------------------------------

/** 1-D two-means split point over pitches (duration-weighted). */
function twoMeans(notes) {
  const pts = notes.map((n) => ({ p: n.midi, w: Math.max(1, n.dur) }));
  let lo = Math.min(...pts.map((x) => x.p)), hi = Math.max(...pts.map((x) => x.p));
  if (hi - lo < 2) return { split: lo - 1, gap: 0 };
  let mLo = lo, mHi = hi;
  for (let it = 0; it < 24; it++) {
    let sLo = 0, wLo = 0, sHi = 0, wHi = 0;
    for (const { p, w } of pts) {
      if (Math.abs(p - mLo) <= Math.abs(p - mHi)) { sLo += p * w; wLo += w; }
      else { sHi += p * w; wHi += w; }
    }
    const nLo = wLo ? sLo / wLo : mLo, nHi = wHi ? sHi / wHi : mHi;
    if (Math.abs(nLo - mLo) < 0.01 && Math.abs(nHi - mHi) < 0.01) break;
    mLo = nLo; mHi = nHi;
  }
  return { split: (mLo + mHi) / 2, gap: mHi - mLo };
}

/** onset clusters: notes striking together (within `tol` bars) */
export function onsetClusters(notes, barTicks, tol = 1 / 48) {
  const t = barTicks * tol;
  const out = [];
  for (const n of [...notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi)) {
    const last = out[out.length - 1];
    if (last && n.tick - last.tick <= t) last.notes.push(n);
    else out.push({ tick: n.tick, notes: [n] });
  }
  return out;
}

/**
 * splitHands(midi, barTicks) -> { acc, mel, method }
 *
 * Multi-track files declare the split themselves: the substantial track with the
 * highest mean pitch is the melody, everything else is accompaniment. Single-track
 * files get a pitch split (two-means): within each onset cluster, the top note is
 * melody IF it clears the split line; all other notes are accompaniment. The
 * method is recorded per file so a bad split is diagnosable, not mysterious.
 */
export function splitHands(midi, barTicks) {
  const noteTracks = midi.tracks.filter((t) => t.notes.length > 0);
  if (noteTracks.length >= 2) {
    const total = midi.notes.length;
    const stats = noteTracks.map((t) => ({
      t, share: t.notes.length / total,
      mean: t.notes.reduce((a, n) => a + n.midi, 0) / t.notes.length,
    }));
    const candidates = stats.filter((s) => s.share >= 0.15);
    const melTrack = (candidates.length ? candidates : stats).reduce((a, b) => (b.mean > a.mean ? b : a));
    const acc = stats.filter((s) => s !== melTrack).flatMap((s) => s.t.notes)
      .sort((a, b) => a.tick - b.tick || a.midi - b.midi);
    return { acc, mel: melTrack.t.notes, method: `tracks(${noteTracks.length})` };
  }
  const notes = midi.notes;
  const { split, gap } = twoMeans(notes);
  const acc = [], mel = [];
  for (const cl of onsetClusters(notes, barTicks)) {
    const sorted = [...cl.notes].sort((a, b) => a.midi - b.midi);
    const top = sorted[sorted.length - 1];
    const isMelTop = top.midi >= split && gap >= 7;
    // Toby's melodies travel thickened: in OCTAVES, and in parallel 3rds/6ths
    // (Hopes and Dreams' theme). Only the top voice reaching the melody stream
    // left the doubles/harmony voice in the accompaniment, where the chord
    // labeler read them as harmony and figures replayed them (audition rounds
    // 3-4). In a melody-topped cluster:
    //   - an exact octave double of the top, still in melody territory, is
    //     the melody (a LOW root doubling the tune — oom-pah bass — stays);
    //   - a SINGLE companion within a 6th below the top, in melody territory,
    //     is the parallel-harmony voice of the melody;
    //   - two or more companions above the split are a CHORD (comping) and
    //     stay accompaniment.
    const isOctDouble = (n) => (top.midi - n.midi === 12 || top.midi - n.midi === 24) && n.midi >= split - 3;
    const companions = sorted.filter((n) => n !== top && n.midi >= split - 3 && !isOctDouble(n));
    for (const n of sorted) {
      if (n === top && isMelTop) { mel.push(n); continue; }
      if (isMelTop && isOctDouble(n)) { mel.push(n); continue; }
      if (isMelTop && companions.length === 1 && n === companions[0] && top.midi - n.midi <= 9) { mel.push(n); continue; }
      acc.push(n);
    }
  }
  return { acc, mel, method: `pitch-split(${split.toFixed(1)},gap ${gap.toFixed(1)})` };
}

// ---------------------------------------------------------------------------
// Chord inference
// ---------------------------------------------------------------------------

// Small, curated template set in the ireal dialect (D28: one chord dialect).
// Deliberately NO extended tensions: a fan piano arrangement's colour notes are
// melody, not harmony, and bestQuality-style full-dictionary matching dressed
// triads up as 13ths in early runs. Simpler labels win ties. '2' (sus2) earns
// its slot because Toby Fox leans on root-9th-5th sonorities constantly and
// without it they mislabel as sus chords of the WRONG root (Db2 read as Absus).
const TEMPLATE_QUALITIES = ['', 'm', '7', '^7', 'm7', 'o', 'o7', 'm7b5', 'sus', '2', '5', '6', 'm6', 'aug'];
let TEMPLATES = null;
export function chordTemplates() {
  if (TEMPLATES) return TEMPLATES;
  const qp = qualityPcs();
  TEMPLATES = TEMPLATE_QUALITIES.filter((q) => qp.has(q)).map((q) => ({ quality: q, pcs: qp.get(q) }));
  return TEMPLATES;
}

/**
 * chordTimeline(notes, barTicks, totalBars, { melody }) -> [{ start, end,
 *   rootPc, quality, coverage }]  (start/end in half-bar units)
 *
 * Half-bar windows, duration-weighted pc profiles, bass-note root prior, and
 * hysteresis (the incumbent chord keeps the window unless a challenger beats it
 * by 12%) so passing tones don't shred the timeline. Notes in the `melody` set
 * count at half weight: a melodic run through the second half of a bar kept
 * reading as a new chord (Megalovania's riff turned every D bar into D|G7).
 * `coverage` is the fraction of window weight the chosen chord explains — the
 * honesty number that later becomes needsEar.
 */
export function chordTimeline(notes, barTicks, totalBars, { melody = null, key = null } = {}) {
  const H = barTicks / 2;
  const nWin = Math.max(1, Math.ceil((totalBars * barTicks) / H));
  const wins = Array.from({ length: nWin }, () => ({ w: new Map(), acc: new Map(), bass: null, total: 0 }));
  const mel = melody ? new Set(melody) : null;
  for (const n of notes) {
    let t = n.tick;
    const end = n.tick + n.dur;
    while (t < end) {
      const wi = Math.floor(t / H);
      if (wi >= nWin) break;
      const wEnd = Math.min(end, (wi + 1) * H);
      const win = wins[wi];
      const dur = (wEnd - t) / barTicks;
      const onset = t === n.tick ? 1.5 : 1; // striking in the window counts extra
      const isMel = mel ? mel.has(n) : false;
      const wt = dur * onset * (isMel ? 0.5 : 1);
      const pc = mod12(n.midi);
      win.w.set(pc, (win.w.get(pc) ?? 0) + wt);
      if (!isMel) win.acc.set(pc, (win.acc.get(pc) ?? 0) + wt);
      win.total += wt;
      if (win.bass == null || n.midi < win.bass) win.bass = n.midi;
      t = wEnd;
    }
  }

  const templates = chordTemplates();
  // Chords are judged on the ACCOMPANIMENT alone wherever it sounds at all —
  // audition round 3 (Ethan): melody tones were dressing the labels ("the
  // chords are incorporating the melody"). The melody-notes map is only the
  // fallback for windows where the accompaniment is silent (solo-melody
  // intros), and those windows wear their coverage honestly.
  const mapOf = (win) => {
    let accTotal = 0;
    for (const [, w] of win.acc) accTotal += w;
    return accTotal > 0.05 ? { m: win.acc, total: accTotal } : { m: win.w, total: win.total };
  };
  const score = (win, rootPc, pcs) => {
    const { m, total } = mapOf(win);
    let inW = 0, outW = 0, present = 0;
    for (const [pc, w] of m) {
      if (pcs.has(mod12(pc - rootPc))) { inW += w; present++; } else outW += w;
    }
    // absent template tones cost a little: without this, exotic 4-note labels
    // (o7) tie plain triads on windows that only sound a root and one colour
    let s = inW - 0.7 * outW - 0.15 * ((pcs.size - present) / pcs.size) * total;
    if (win.bass != null && mod12(win.bass) === rootPc) s += 0.3 * total;
    return s;
  };

  const segs = [];
  let cur = null;
  for (let wi = 0; wi < nWin; wi++) {
    const win = wins[wi];
    if (win.total < 1e-6) { // silence: extend the current chord, decide nothing
      if (cur) cur.end = wi + 1;
      continue;
    }
    let best = null;
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      for (const t of templates) {
        const s = score(win, rootPc, t.pcs);
        if (!best || s > best.s + 1e-9) best = { rootPc, quality: t.quality, s };
      }
    }
    const cover = (rootPc, quality) => {
      const { m, total } = mapOf(win);
      const qp = qualityPcs().get(quality);
      let inW = 0;
      for (const [pc, w] of m) if (qp?.has(mod12(pc - rootPc))) inW += w;
      return { inW, total };
    };
    if (cur) {
      const qp = qualityPcs().get(cur.quality);
      const keep = score(win, cur.rootPc, qp);
      if (keep >= best.s * 0.88) {
        cur.end = wi + 1;
        const c = cover(cur.rootPc, cur.quality);
        cur.inW += c.inW; cur.totW += c.total;
        continue;
      }
    }
    if (cur) segs.push(cur);
    const c0 = cover(best.rootPc, best.quality);
    cur = { start: wi, end: wi + 1, rootPc: best.rootPc, quality: best.quality, inW: c0.inW, totW: c0.total };
  }
  if (cur) segs.push(cur);
  // merge adjacent identical chords (hysteresis restarts can split them)
  const out = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (last && last.rootPc === s.rootPc && last.quality === s.quality && last.end === s.start) {
      last.end = s.end; last.inW += s.inW; last.totW += s.totW;
    } else out.push(s);
  }
  for (const s of out) s.coverage = s.totW > 0 ? s.inW / s.totW : 0;

  // Diatonic completion of THIRDLESS labels. The missing-tone penalty makes
  // minimal templates win wherever no third sounds — a pedal-bass bar over D in
  // a D-minor song labels 'D5', a bar whose melody brushes the 4th labels
  // 'Csus' — and .voicing() then PLAYS the bare fifth / sus wash: audibly wrong
  // chords (the audition round that caught this heard power chords all over
  // Megalovania). Ruling: a '5'/'sus'/'2' label is kept only when the
  // ACCOMPANIMENT itself voices the colour (sus4's 4th, 2's 9th) while lacking
  // any third — Snowdin's Db-Eb-Ab really is a Db2 and stays one. Otherwise
  // the label completes to the solved key's diatonic triad for that root:
  // absence of evidence is not a sus chord.
  if (key) {
    const scale = new Set((key.mode === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11])
      .map((i) => mod12(key.tonicPc + i)));
    const accNotes = mel ? notes.filter((n) => !mel.has(n)) : notes;
    for (const s of out) {
      if (!['5', 'sus', '2'].includes(s.quality)) continue;
      const t0 = s.start * H, t1 = s.end * H;
      const inSeg = accNotes.filter((n) => n.tick < t1 && n.tick + n.dur > t0);
      const colour = s.quality === 'sus' ? 5 : s.quality === '2' ? 2 : null;
      const accPcs = new Set(inSeg.map((n) => mod12(n.midi)));
      const accHasThird = accPcs.has(mod12(s.rootPc + 3)) || accPcs.has(mod12(s.rootPc + 4));
      // a real sus/2 voices the colour AGAINST the root — the two notes must
      // actually overlap in time (Snowdin strikes Db and Eb together). A colour
      // tone that merely lives in the same window (the next chord's pedal
      // starting mid-bar) does not make the previous chord a sus.
      if (colour != null && !accHasThird) {
        const roots = inSeg.filter((n) => mod12(n.midi) === s.rootPc);
        const colours = inSeg.filter((n) => mod12(n.midi) === mod12(s.rootPc + colour));
        const overlap = colours.some((c) => roots.some((r) => r.tick < c.tick + c.dur && c.tick < r.tick + r.dur));
        if (overlap) continue; // genuinely voiced sus/2
      }
      // The accompaniment alone can't name this chord, so build the quality
      // directly: the THIRD from whatever evidence exists (all notes — melody
      // may cast this one binary vote), else the solved key's diatonic third;
      // a SEVENTH only if one actually sounds. Melody can pick between m and
      // maj, it can never invent sus/dim/exotic colour — that was the "chords
      // are incorporating the melody" failure.
      const fullW = new Map();
      let total = 0;
      for (let wi = s.start; wi < s.end && wi < wins.length; wi++) {
        for (const [pc, wt] of wins[wi].w) {
          if (mod12(pc - s.rootPc) === 0) continue;
          fullW.set(mod12(pc - s.rootPc), (fullW.get(mod12(pc - s.rootPc)) ?? 0) + wt);
          total += wt;
        }
      }
      const w = (rel) => fullW.get(mod12(rel)) ?? 0;
      let minor;
      if (w(3) > 1.2 * w(4)) minor = true;
      else if (w(4) > 1.2 * w(3)) minor = false;
      else minor = scale.has(mod12(s.rootPc + 3)) && !scale.has(mod12(s.rootPc + 4));
      const seventhTh = 0.2 * total;
      const b7 = w(10) > seventhTh, M7 = !b7 && w(11) > seventhTh;
      s.quality = minor ? (b7 ? 'm7' : 'm') : (b7 ? '7' : M7 ? '^7' : '');
      s.completed = true;
    }
  }
  return out;
}

/** chord sounding at half-bar index `hw`, from a chordTimeline */
export function chordAt(timeline, hw) {
  for (const s of timeline) if (hw >= s.start && hw < s.end) return s;
  return timeline[timeline.length - 1] ?? null;
}

// ---------------------------------------------------------------------------
// Key solve — Krumhansl-Schmuckler tone profiles
// ---------------------------------------------------------------------------
const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export function solveKeyKS(notes) {
  const hist = Array(12).fill(0);
  for (const n of notes) hist[mod12(n.midi)] += n.dur;
  const corr = (profile, rot) => {
    const x = [], y = [];
    for (let i = 0; i < 12; i++) { x.push(hist[mod12(i + rot)]); y.push(profile[i]); }
    const mx = x.reduce((a, b) => a + b) / 12, my = y.reduce((a, b) => a + b) / 12;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < 12; i++) { num += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) ** 2; dy += (y[i] - my) ** 2; }
    return dx && dy ? num / Math.sqrt(dx * dy) : 0;
  };
  const all = [];
  for (let pc = 0; pc < 12; pc++) {
    all.push({ tonicPc: pc, mode: 'major', r: corr(KS_MAJOR, pc) });
    all.push({ tonicPc: pc, mode: 'minor', r: corr(KS_MINOR, pc) });
  }
  all.sort((a, b) => b.r - a.r);
  return { ...all[0], margin: all[0].r - all[1].r };
}

// ---------------------------------------------------------------------------
// Figuration abstraction: accompaniment bar -> chord-relative tokens
// ---------------------------------------------------------------------------

// pitch class relative to the chord root -> member char. Quality-blind BY DESIGN:
// '3' names "the chord's third" whether that is 3 or 4 semitones, '5' the fifth
// even when the chord diminishes it — that is what makes a figure portable
// across progressions ("even if it's slightly different intervals"). A note that
// is NOT a member of the sounding chord keeps its literal interval as '~<semis>'
// ('~10' = a b7 colour over a plain triad): re-abstracting it to a member would
// erase exactly the colour that made the bar worth extracting.
const REL_MEMBER = { 0: 'R', 2: '9', 3: '3', 4: '3', 5: '4', 6: '5', 7: '5', 8: '5', 9: '6', 10: '7', 11: '7' };

export function memberToken(midi, rootMidiRef, chordRelPcs) {
  const rel = mod12(midi - rootMidiRef);
  const oct = Math.floor((midi - rootMidiRef) / 12);
  const isChord = chordRelPcs.has(rel);
  const member = isChord ? REL_MEMBER[rel] : '~' + rel;
  return { token: member + '+'.repeat(Math.max(0, oct)), chordTone: isChord, below: oct < 0 };
}

/**
 * barFigures(accNotes, timeline, barTicks, totalBars, grid) ->
 *   [{ bar, steps, tokens, vels, durs, nonChord, count, meanMidi, sig }]
 *
 * One record per bar of accompaniment. Tokens are chord-relative (see above);
 * the octave reference is the chord root placed at-or-below the bar's lowest
 * accompaniment note, so 'R 5 R+' reads as played. `sig` is the portable
 * signature — grid steps + tokens, chord factored out — that recurrence mining
 * tallies across the whole corpus.
 */
export function barFigures(accNotes, timeline, barTicks, totalBars, grid = 16) {
  const byBar = Array.from({ length: totalBars }, () => []);
  for (const n of accNotes) {
    const b = Math.floor(n.tick / barTicks);
    if (b >= 0 && b < totalBars) byBar[b].push(n);
  }
  const out = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const notes = byBar[bar];
    if (!notes.length) { out.push(null); continue; }
    const clusters = onsetClusters(notes, barTicks).filter((c) => Math.floor(c.tick / barTicks) === bar);
    if (!clusters.length) { out.push(null); continue; }
    const lowest = Math.min(...notes.map((n) => n.midi));
    const steps = [], tokens = [], vels = [], durs = [];
    let nonChord = 0, count = 0, midiSum = 0, rootRefBar = null;
    let residuals = [];
    for (const cl of clusters) {
      const local = (cl.tick - bar * barTicks) / barTicks;
      const step = Math.round(local * grid);
      if (step >= grid) continue;
      const hw = Math.min(Math.floor((cl.tick / barTicks) * 2), timeline.length ? timeline[timeline.length - 1].end - 1 : 0);
      const seg = chordAt(timeline, hw);
      if (!seg) continue;
      const rootRef = lowest - mod12(lowest - seg.rootPc);
      if (rootRefBar == null) rootRefBar = rootRef;
      const relPcs = qualityPcs().get(seg.quality) ?? new Set([0, 4, 7]);
      const toks = [...new Set(cl.notes.map((n) => n.midi))].sort((a, b) => a - b)
        .map((m) => memberToken(m, rootRef, relPcs));
      for (const t of toks) { if (!t.chordTone) nonChord++; count++; }
      midiSum += cl.notes.reduce((a, n) => a + n.midi, 0);
      const prev = steps[steps.length - 1];
      if (prev === step) continue; // two clusters quantized onto one step: keep the first
      steps.push(step);
      tokens.push(toks.map((t) => t.token).join('.'));
      vels.push(Math.max(...cl.notes.map((n) => n.velocity)));
      durs.push(Math.max(...cl.notes.map((n) => n.dur)) / barTicks);
      residuals.push(local - step / grid);
    }
    if (!steps.length) { out.push(null); continue; }
    out.push({
      bar, steps, tokens, vels, durs,
      residuals,
      nonChord, count,
      meanMidi: midiSum / notes.length,
      rootRef: rootRefBar,
      chordness: tokens.filter((t) => t.includes('.')).length / tokens.length,
      sig: `${grid}|${steps.join(',')}|${tokens.join(' ')}`,
    });
  }
  return out;
}

/** The grid (per bar) that explains these onset ticks. COARSEST-FIRST: these
 *  files are humanized (triage: 'performance'), so a fine grid can "explain"
 *  the lag by absorbing it into the step positions — Fallen Down's even 6ths
 *  came out as 48ths 0,9,17,25,33,40. The musical grid is the coarsest one
 *  whose residual stays inside the microtiming budget (≤ ~1.2/96 mean); the
 *  residual is then FEEL, kept separately as microtiming, not structure. */
export function pickGrid(notes, barTicks, meterNum, candidates = null) {
  const triple = meterNum % 3 === 0;
  const GRIDS = candidates ?? (triple ? [6, 12, 24] : [8, 16, 12, 24]);
  let best = null;
  for (const g of GRIDS) {
    let err = 0, worst = 0;
    for (const n of notes) {
      const local = (n.tick % barTicks) / barTicks;
      const r = Math.abs(local * g - Math.round(local * g)) / g;
      err += r;
      if (r > worst) worst = r;
    }
    const mean = notes.length ? err / notes.length : 0;
    if (!best || mean < best.mean - 1e-9) best = { grid: g, mean, worst };
    if (mean <= 1.2 / 96 && worst <= 1 / 24) return { grid: g, mean, worst };
  }
  return best;
}
