// Per-file feature extraction for the vgmusic-full ANALYSIS corpus.
//
// ANALYSIS-ONLY (D95). Nothing here is imported by src/. The output is prose
// input for research/*.md — it must never be counted into harmony-model.js.
//
// EVERY MEASUREMENT DEFINITION MIRRORS THE ENGINE'S OWN, so a corpus number
// lands as a directly comparable target rather than as interesting trivia:
//   - "interval above bass"  : semitone class of an acc note over the SOUNDING
//                              bass note, matching the 99.3%-in-{0,3,4,7} probe
//   - "notes per attack"     : onset-cluster size in the acc hand, matching the
//                              74.3%-single / 0.11%-four probe
//   - "non-chord tone"       : pc absent from the labelled chord; RESOLVED iff
//                              that voice's next onset is a chord tone a step
//                              (<=2 semitones) away — matching the 22.8%-NCT /
//                              93.9%-unresolved probe
//   - "layer entry"          : a part's first sounding bar, measured against
//                              inferred section starts (the 139-of-139 probe)
//
// GATES ARE THE POINT. VGMusic is amateur transcription of wildly varying
// quality, and a confident percentage over a noisy subset is worse than no
// number (D51: the strongest predictor of a rejected card was `coverage`, i.e.
// whether the label explained what actually sounds). So every file carries a
// `gates` object, every aggregate filters on it, and the write-up reports the
// surviving n. Specifically: harmony is NOT labelled from monophonic texture —
// a single whole-tone line labels as an augmented chain, which is an artifact,
// not a progression.

import { readCorpusMidi, extractParts, GM_FAMILY, GM_DRUM, DRUM_ROLE, PC_NAMES } from './corpus-midi.mjs';

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const r3 = (x) => Math.round(x * 1000) / 1000;
const mod12 = (x) => ((x % 12) + 12) % 12;
const stdev = (xs) => { const m = mean(xs); return Math.sqrt(mean(xs.map((v) => (v - m) ** 2))); };

// ---------------------------------------------------------------- key

// Krumhansl-Kessler profiles, correlated against a DURATION-weighted pitch-class
// histogram: weighting by count alone lets a 16th ornament outvote a whole note,
// which mislabels exactly the slow atmospheric tracks this project cares about.
const KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function corr(a, b) {
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

export function detectKey(notes, ppq) {
  const h = new Array(12).fill(0);
  for (const n of notes) h[mod12(n.midi)] += Math.min(n.dur, ppq * 4) / ppq;
  if (!h.some(Boolean)) return null;
  const scored = [];
  for (let t = 0; t < 12; t++) {
    const rot = h.slice(t).concat(h.slice(0, t));
    for (const [mode, prof] of [['major', KK_MAJ], ['minor', KK_MIN]])
      scored.push({ tonic: t, mode, score: corr(rot, prof) });
  }
  scored.sort((a, b) => b.score - a.score);
  // margin over the runner-up is the honest confidence signal: a flat profile
  // (chromatic or atonal music) produces a high top score with no separation.
  return { ...scored[0], margin: r3(scored[0].score - scored[1].score) };
}

// ---------------------------------------------------------------- chords

const TEMPLATES = [
  ['maj', [0, 4, 7]], ['min', [0, 3, 7]], ['dim', [0, 3, 6]], ['aug', [0, 4, 8]],
  ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]],
  ['maj7', [0, 4, 7, 11]], ['min7', [0, 3, 7, 10]], ['dom7', [0, 4, 7, 10]],
  ['min7b5', [0, 3, 6, 10]], ['dim7', [0, 3, 6, 9]], ['minMaj7', [0, 3, 7, 11]],
  ['maj6', [0, 4, 7, 9]], ['min6', [0, 3, 7, 9]],
  ['maj9', [0, 4, 7, 11, 2]], ['min9', [0, 3, 7, 10, 2]], ['dom9', [0, 4, 7, 10, 2]],
  ['5', [0, 7]],
];

/** label one window of sounding pitch-classes (duration-weighted) */
export function labelChord(weights, bassPc, distinctPcs) {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  // A label needs vertical evidence. With fewer than 2 distinct sounding pitch
  // classes there is no harmony to read, and with exactly 2 only power/open
  // labels are honest — everything else is the template fitting noise.
  if (distinctPcs < 2) return null;
  let best = null;
  for (let root = 0; root < 12; root++) {
    for (const [name, ivs] of TEMPLATES) {
      if (distinctPcs < 3 && ivs.length > 2) continue;
      const set = new Set(ivs.map((i) => mod12(root + i)));
      let inside = 0, outside = 0, present = 0;
      for (let pc = 0; pc < 12; pc++) (set.has(pc) ? (inside += weights[pc]) : (outside += weights[pc]));
      for (const pc of set) if (weights[pc] > 0) present++;
      if (present < Math.min(set.size, 3) && set.size > 2) continue;
      if (present < set.size && set.size === 2) continue;
      const cover = inside / total;
      const completeness = present / set.size;
      const bassBonus = bassPc != null && bassPc === root ? 0.12 : 0;
      const score = cover * 0.6 + completeness * 0.28 + bassBonus - (set.size > 3 ? 0.02 : 0);
      if (!best || score > best.score) best = { root, quality: name, score, coverage: cover, tones: [...set] };
    }
  }
  return best;
}

const IS_SEVENTH = new Set(['maj7', 'min7', 'dom7', 'min7b5', 'dim7', 'minMaj7', 'maj9', 'min9', 'dom9']);
const IS_THIRDLESS = new Set(['5', 'sus4', 'sus2']);
const IS_COLOUR = new Set([...IS_SEVENTH, 'maj6', 'min6', 'sus4', 'sus2']);

// ---------------------------------------------------------------- roles

/**
 * Classify each pitched part by what it DOES. Deliberately BEHAVIOURAL: a name
 * blacklist "has now failed four times in three rounds" in this project, so
 * nothing here keys on the GM instrument string. Register, monophony, onset
 * density and duration decide. The GM program is DECLARED DATA (the sanctioned
 * kind of signal, like INSTRUMENTS[sound].range) so it is allowed as a tiebreak
 * only — and `bassAgree` records how often behaviour and declaration agree, so
 * the classifier's error rate is itself a reported number.
 */
export function classifyParts(parts, barTicks) {
  const pitched = parts.filter((p) => !p.isDrum);
  const tol = barTicks / 32;
  const feats = pitched.map((p) => {
    const ms = p.notes.map((n) => n.midi);
    const onsets = [...new Set(p.notes.map((n) => n.tick))].sort((a, b) => a - b);
    const first = p.notes[0].tick;
    const last = Math.max(...p.notes.map((n) => n.tick + n.dur));
    const span = Math.max(1, last - first);
    const byTick = new Map();
    for (const n of p.notes) { const k = Math.round(n.tick / tol); if (!byTick.has(k)) byTick.set(k, []); byTick.get(k).push(n); }
    const clusters = [...byTick.values()];
    return {
      part: p, key: p.key,
      medPitch: median(ms), minPitch: Math.min(...ms), maxPitch: Math.max(...ms),
      n: p.notes.length,
      firstTick: first, lastTick: last,
      density: p.notes.length / (span / barTicks || 1),
      onsetDensity: onsets.length / (span / barTicks || 1),
      medDur: median(p.notes.map((n) => n.dur)) / barTicks,
      polyRatio: clusters.filter((c) => c.length > 1).length / (clusters.length || 1),
      maxCluster: Math.max(...clusters.map((c) => c.length)),
      spanBars: span / barTicks,
      pitchRange: Math.max(...ms) - Math.min(...ms),
      distinctPc: new Set(ms.map(mod12)).size,
      declaredBass: p.family === 'bass',
    };
  });
  if (!feats.length) return { feats: [], bassAgree: null };

  // BASS: lowest-sitting part, genuinely low, and separated from the next
  // lowest. "One low voice at a time" is the project's own law, so at most one
  // part gets the label; a track with two equally low parts gets none, which is
  // the honest answer rather than an arbitrary pick.
  const byLow = [...feats].sort((a, b) => a.medPitch - b.medPitch);
  let bass = null;
  if (byLow[0].medPitch <= 54 && (byLow.length === 1 || byLow[1].medPitch - byLow[0].medPitch >= 3)) bass = byLow[0];
  else if (byLow[0].declaredBass && byLow[0].medPitch <= 60) bass = byLow[0];
  if (bass) bass.role = 'bass';
  const bassAgree = bass ? bass.declaredBass : null;

  // LEAD: mostly-monophonic, active, and topmost among such parts. Weighted
  // toward register because the tune sits above its support (D77).
  const leadCands = feats.filter((f) => !f.role && f.polyRatio < 0.3 && f.n >= 8);
  const lead = leadCands.sort((a, b) => (b.medPitch + b.onsetDensity * 1.5) - (a.medPitch + a.onsetDensity * 1.5))[0] || null;
  if (lead) lead.role = 'lead';

  for (const f of feats) {
    if (f.role) continue;
    if (f.medDur >= 0.45 && f.onsetDensity <= 2.5) f.role = 'pad';
    else if (f.polyRatio >= 0.25) f.role = 'acc';
    else if (lead && f.medPitch >= lead.medPitch && f.n >= 6) f.role = 'descant';
    else if (f.n >= 6) f.role = 'counter';
    else f.role = 'acc';
  }
  return { feats, bassAgree };
}

// ---------------------------------------------------------------- sections

/**
 * Section segmentation from the TEXTURE STATE — which parts are sounding in each
 * bar. A boundary is a change in that set which PERSISTS: a one-bar blip is a
 * fill, not a new section. This matters because the question it exists to answer
 * ("are changes section-locked?") is circular if every texture change is defined
 * to be a section start. Bar 0 is excluded from every boundary statistic for the
 * same reason — everything enters there by construction.
 */
export function segment(feats, barTicks, totalBars, minHold = 2) {
  const sig = [];
  for (let b = 0; b < totalBars; b++) {
    const a = b * barTicks, z = a + barTicks;
    sig.push(feats.filter((f) => f.part.notes.some((n) => n.tick < z && n.tick + n.dur > a)).map((f) => f.key).sort().join(','));
  }
  const bounds = [0];
  let i = 1;
  while (i < totalBars) {
    if (sig[i] !== sig[bounds[bounds.length - 1]]) {
      let hold = 1;
      while (i + hold < totalBars && sig[i + hold] === sig[i]) hold++;
      if (hold >= minHold) bounds.push(i);
      i += Math.max(1, hold);
    } else i++;
  }
  return { sig, bounds };
}


// ---------------------------------------------------------------- doubling

/**
 * Two parts can carry the SAME musical idea. Collapsing them is required before
 * any "how many layers" number means anything — and the collapse itself is a
 * finding, because the offsets are deliberate technique:
 *   unison  : identical pitches, same ticks        -> thickening
 *   octave  : pitches differ by a constant +/-12   -> weight without a new line
 *   echo    : identical pitches at a CONSTANT tick offset -> delay/width layer
 * Measured on GS3Godot.mid: four echo pairs at 320/480 ticks, which would
 * otherwise have counted as four extra "independent layers".
 * "Two layers that always strike together on one instrument are one layer."
 */
export function findDoublings(feats, barTicks) {
  const out = [];
  const sigOf = (f) => [...f.part.notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi);
  for (let i = 0; i < feats.length; i++) for (let j = i + 1; j < feats.length; j++) {
    const A = sigOf(feats[i]), B = sigOf(feats[j]);
    if (Math.abs(A.length - B.length) > Math.max(2, A.length * 0.12)) continue;
    const n = Math.min(A.length, B.length);
    if (n < 8) continue;
    // candidate constant offsets from the first few pairings
    const cands = new Set([0]);
    for (let k = 0; k < Math.min(4, n); k++) cands.add(B[k].tick - A[k].tick);
    let best = null;
    for (const off of cands) {
      if (Math.abs(off) > barTicks * 2) continue;
      let same = 0, oct = 0;
      const bByTick = new Map();
      for (const b of B) { const key = b.tick - off; if (!bByTick.has(key)) bByTick.set(key, []); bByTick.get(key).push(b.midi); }
      for (const a of A) {
        const arr = bByTick.get(a.tick);
        if (!arr) continue;
        if (arr.includes(a.midi)) same++;
        else if (arr.some((m) => Math.abs(m - a.midi) % 12 === 0)) oct++;
      }
      const score = (same + oct) / n;
      if (!best || score > best.score) best = { off, same, oct, score };
    }
    if (best && best.score >= 0.7) out.push({
      a: i, b: j,
      kind: best.off === 0 ? (best.same >= best.oct ? 'unison' : 'octave') : 'echo',
      offsetTicks: best.off, offsetBeats: r3(best.off / (barTicks / 4)),
      agreement: r3(best.score),
      sameInstrument: feats[i].part.program === feats[j].part.program,
    });
  }
  return out;
}

/**
 * An arpeggio is accompaniment, not a tune. Without this the lead detector picks
 * the densest high line and hands back a 16-note-per-bar broken chord — which
 * then poisons every melody statistic. Test: consecutive onsets that keep moving
 * in one direction through chord-tone-sized leaps, with few repeats and little
 * stepwise motion.
 */
export function looksArpeggiated(f, barTicks) {
  const ns = [...f.part.notes].sort((a, b) => a.tick - b.tick);
  if (ns.length < 12) return false;
  const steps = [];
  for (let i = 1; i < ns.length; i++) if (ns[i].tick > ns[i - 1].tick) steps.push(ns[i].midi - ns[i - 1].midi);
  if (steps.length < 10) return false;
  const stepwise = steps.filter((s) => Math.abs(s) <= 2).length / steps.length;
  const chordLeap = steps.filter((s) => [3, 4, 5, 7, 8, 9, 12].includes(Math.abs(s))).length / steps.length;
  let runs = 0;
  for (let i = 1; i < steps.length; i++) if (Math.sign(steps[i]) === Math.sign(steps[i - 1]) && steps[i] !== 0) runs++;
  return chordLeap >= 0.55 && stepwise <= 0.25 && f.onsetDensity >= 5 && runs / steps.length >= 0.4;
}

/**
 * Foote novelty over bar-level pitch-class histograms. Deliberately NOT computed
 * from which layers are on: "are layer changes section-locked?" is circular if a
 * layer entering is what defines a section. This reads HARMONIC/melodic content
 * only, and the write-up additionally reports the fully layer-independent number
 * (entry bar mod 4 / mod 8), since the engine's own sections are 4/8-bar
 * multiples by construction.
 */
export function harmonicSections(pitchedNotes, barTicks, totalBars, W = 4, thresh = 0.28) {
  const H = Array.from({ length: totalBars }, () => new Array(12).fill(0));
  for (const n of pitchedNotes) {
    const b = Math.floor(n.tick / barTicks);
    if (b >= 0 && b < totalBars) H[b][mod12(n.midi)] += Math.min(n.dur, barTicks) / barTicks;
  }
  const norm = (v) => { const m = Math.sqrt(v.reduce((a, x) => a + x * x, 0)); return m ? v.map((x) => x / m) : v; };
  const N = H.map(norm);
  const avg = (a, z) => { const v = new Array(12).fill(0); let c = 0; for (let i = a; i < z; i++) { if (i < 0 || i >= totalBars) continue; for (let k = 0; k < 12; k++) v[k] += N[i][k]; c++; } return c ? norm(v.map((x) => x / c)) : v; };
  const nov = new Array(totalBars).fill(0);
  for (let b = 1; b < totalBars; b++) {
    const L = avg(b - W, b), R = avg(b, b + W);
    nov[b] = 1 - L.reduce((a, x, k) => a + x * R[k], 0);
  }
  const bounds = [0];
  for (let b = 2; b < totalBars - 1; b++)
    if (nov[b] >= thresh && nov[b] >= nov[b - 1] && nov[b] >= nov[b + 1] && b - bounds[bounds.length - 1] >= 2) bounds.push(b);
  return { bounds, novelty: nov };
}

// ---------------------------------------------------------------- main

export function analyzeFile(path, meta = {}) {
  const mid = readCorpusMidi(path);
  const ppq = mid.ppq;
  const [tsNum, tsDen] = mid.timeSig;
  const barTicks = ppq * 4 * (tsNum / tsDen);
  if (!(barTicks > 0)) throw new Error('bad bar length');
  const totalBars = Math.max(1, Math.ceil(mid.endTick / barTicks));
  if (totalBars > 4000) throw new Error('absurd length');

  const parts = extractParts(mid);
  const pitchedNotes = mid.notes.filter((n) => n.channel !== 9);
  if (pitchedNotes.length < 16) throw new Error('too few pitched notes');

  const { feats, bassAgree } = classifyParts(parts, barTicks);
  const tol = barTicks / 32;

  // ---- doubling: collapse before counting layers, but KEEP the finding
  const doublings = findDoublings(feats, barTicks);
  const doubled = new Set();          // the later member of each pair
  for (const d of doublings) doubled.add(d.b);
  feats.forEach((f, i) => { f.isDouble = doubled.has(i); });
  const independentLayers = feats.filter((f) => !f.isDouble).length;

  // ---- arpeggio: an arp is accompaniment, not a tune. Demote and re-pick.
  for (const f of feats) f.arp = looksArpeggiated(f, barTicks);
  let leadFeat = feats.find((f) => f.role === 'lead') || null;
  if (leadFeat && leadFeat.arp) {
    leadFeat.role = 'arp';
    const cands = feats.filter((f) => !f.role || (f.role !== 'bass' && f.role !== 'arp'));
    const alt = cands.filter((f) => f.polyRatio < 0.3 && f.n >= 8 && !f.arp && !f.isDouble)
      .sort((a, b) => (b.medPitch + b.onsetDensity * 1.5) - (a.medPitch + a.onsetDensity * 1.5))[0];
    if (alt) { alt.role = 'lead'; leadFeat = alt; } else leadFeat = null;
  }
  for (const f of feats) if (f.arp && f.role !== 'lead' && f.role !== 'bass') f.role = 'arp';

  const bassFeat = feats.find((f) => f.role === 'bass') || null;
  const key = detectKey(pitchedNotes, ppq);

  // ---- THE ACCOMPANIMENT HAND, aggregated.
  // His ask "see how the chord is four notes not your typical chord" is about the
  // SOUNDING chord, not about one track. Game MIDI spells one chord across
  // several monophonic tracks, so a per-track count reports 1 note per attack and
  // says nothing. The engine binds its acc as ONE hand; this mirrors that.
  // Echo/unison doubles are excluded — they re-strike an idea already counted.
  const handFeats = feats.filter((f) => f.role !== 'bass' && f.role !== 'lead' && !f.isDouble);
  const handNotes = handFeats.flatMap((f) => f.part.notes).sort((a, b) => a.tick - b.tick || a.midi - b.midi);

  // ---- harmony grid: one label per half-bar, gated on vertical evidence
  const SLOTS = 2;
  const slotTicks = barTicks / SLOTS;
  const nSlots = Math.min(Math.ceil(mid.endTick / slotTicks), 2000);
  const chords = [];
  let slotsWithHarmony = 0;
  for (let s = 0; s < nSlots; s++) {
    const a = s * slotTicks, b = a + slotTicks;
    const w = new Array(12).fill(0);
    let lowest = null;
    const pcs = new Set();
    for (const n of pitchedNotes) {
      const ov = Math.min(n.tick + n.dur, b) - Math.max(n.tick, a);
      if (ov <= 0) continue;
      w[mod12(n.midi)] += ov / slotTicks;
      pcs.add(mod12(n.midi));
      if (lowest == null || n.midi < lowest) lowest = n.midi;
    }
    if (pcs.size >= 2) slotsWithHarmony++;
    chords.push(labelChord(w, lowest == null ? null : mod12(lowest), pcs.size));
  }
  const labelled = chords.filter(Boolean);
  const coverage = labelled.length ? mean(labelled.map((c) => c.coverage)) : 0;
  const harmonyGate = labelled.length >= 8 && coverage >= 0.6 && slotsWithHarmony / (nSlots || 1) >= 0.5;

  const seq = [];
  for (const c of chords) {
    if (!c) continue;
    const tok = `${c.root}:${c.quality}`;
    if (!seq.length || seq.at(-1).tok !== tok) seq.push({ tok, root: c.root, quality: c.quality, n: 1 });
    else seq.at(-1).n++;
  }
  const degreeOf = (root) => (key ? mod12(root - key.tonic) : null);
  const progression = key ? seq.map((s) => `${degreeOf(s.root)}${s.quality === 'maj' ? '' : ':' + s.quality}`) : [];
  const rootMotion = {};
  for (let i = 1; i < seq.length; i++) { const d = mod12(seq[i].root - seq[i - 1].root); rootMotion[d] = (rootMotion[d] || 0) + 1; }
  // degree-pair bigrams (key-relative) — the transferable shape of a progression
  const bigrams = [];
  if (key) for (let i = 1; i < seq.length; i++)
    bigrams.push(`${degreeOf(seq[i - 1].root)}${seq[i - 1].quality === 'maj' ? '' : ':' + seq[i - 1].quality}>${degreeOf(seq[i].root)}${seq[i].quality === 'maj' ? '' : ':' + seq[i].quality}`);

  // ---- interval classes above the SOUNDING bass
  const bassNotes = bassFeat ? [...bassFeat.part.notes].sort((a, b) => a.tick - b.tick) : [];
  const bassAt = (tick) => {
    let b = null;
    for (const n of bassNotes) { if (n.tick > tick) break; if (tick < n.tick + n.dur && (b == null || n.midi < b)) b = n.midi; }
    return b;
  };
  const ivAboveBass = {};
  const ivHand = new Array(12).fill(0);
  if (bassFeat) {
    for (const f of feats) {
      if (f.role === 'bass') continue;
      const bucket = ivAboveBass[f.role] ||= new Array(12).fill(0);
      for (const n of f.part.notes) { const b = bassAt(n.tick); if (b != null) bucket[mod12(n.midi - b)]++; }
    }
    for (const n of handNotes) { const b = bassAt(n.tick); if (b != null) ivHand[mod12(n.midi - b)]++; }
  }

  // ---- simultaneity: per role, for the aggregated HAND, and for the whole mix
  const histOf = (notes) => {
    const buckets = new Map();
    for (const n of notes) { const k = Math.round(n.tick / tol); buckets.set(k, (buckets.get(k) || 0) + 1); }
    const h = {};
    for (const c of buckets.values()) { const b = Math.min(c, 8); h[b] = (h[b] || 0) + 1; }
    return h;
  };
  const simulByRole = {};
  for (const f of feats) {
    const h = histOf(f.part.notes);
    const acc = simulByRole[f.role] ||= {};
    for (const [k, v] of Object.entries(h)) acc[k] = (acc[k] || 0) + v;
  }
  const simulHand = histOf(handNotes);
  const simulMix = histOf(pitchedNotes);

  // ---- non-chord tones over the aggregated hand, and whether they RESOLVE
  const chordAt = (tick) => chords[Math.min(chords.length - 1, Math.floor(tick / slotTicks))];
  let nct = 0, nctResolved = 0, nctTotal = 0, nctStepApproach = 0;
  if (harmonyGate) for (const f of handFeats) {
    const ns = [...f.part.notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi);
    for (let i = 0; i < ns.length; i++) {
      const c = chordAt(ns[i].tick);
      if (!c) continue;
      nctTotal++;
      if (c.tones.includes(mod12(ns[i].midi))) continue;
      nct++;
      if (i > 0 && Math.abs(ns[i].midi - ns[i - 1].midi) <= 2) nctStepApproach++;
      let j = i + 1;
      while (j < ns.length && ns[j].tick <= ns[i].tick) j++;
      if (j >= ns.length) continue;
      const c2 = chordAt(ns[j].tick);
      if (c2 && c2.tones.includes(mod12(ns[j].midi)) && Math.abs(ns[j].midi - ns[i].midi) <= 2) nctResolved++;
    }
  }

  // ---- INSERTION vs SUBSTITUTION: under a HELD chord, does the hand add notes
  // between the chord tones, or just re-strike the same shape?
  let insertion = null;
  if (harmonyGate && handNotes.length) {
    let heldBars = 0, onsetsIn = 0, distinctShapes = 0, reStrikes = 0;
    for (let b = 0; b + 1 < totalBars; b++) {
      const c1 = chords[b * SLOTS], c2 = chords[b * SLOTS + 1];
      if (!c1 || !c2 || c1.root !== c2.root || c1.quality !== c2.quality) continue;
      heldBars++;
      const inBar = handNotes.filter((n) => n.tick >= b * barTicks && n.tick < (b + 1) * barTicks);
      onsetsIn += new Set(inBar.map((n) => n.tick)).size;
      const shapes = new Set(inBar.map((n) => `${Math.round((n.tick % barTicks) / tol)}`));
      distinctShapes += shapes.size;
      const pcSet = new Set(inBar.map((n) => mod12(n.midi)));
      const extra = [...pcSet].filter((pc) => !c1.tones.includes(pc)).length;
      if (extra === 0) reStrikes++;
    }
    insertion = {
      heldBars,
      onsetsPerHeldBar: r3(onsetsIn / (heldBars || 1)),
      pureRestrikeRatio: r3(reStrikes / (heldBars || 1)),
    };
  }

  // ---- sections. TWO measurements, because the obvious one is circular.
  // (1) texture segmentation — what layers are on (circular for entry stats)
  // (2) harmonic novelty — pitch content only, layer-independent
  // (3) the pure 4/8-bar grid — fully independent, and the engine's own sections
  //     are 4/8-bar multiples by construction, so this is the honest comparison.
  const { sig, bounds: texBounds } = segment(feats, barTicks, totalBars);
  const { bounds: harmBounds } = harmonicSections(pitchedNotes, barTicks, totalBars);
  const entries = feats.map((f) => ({ role: f.role, bar: Math.floor(f.firstTick / barTicks), dbl: f.isDouble }))
    .filter((e) => e.bar > 0);
  const exits = feats.map((f) => ({ role: f.role, bar: Math.ceil(f.lastTick / barTicks) }))
    .filter((e) => e.bar > 0 && e.bar < totalBars - 1);
  const hSet = new Set(harmBounds);
  const nearestH = (bar) => (harmBounds.length ? Math.min(...harmBounds.map((b) => Math.abs(b - bar))) : null);
  const entryStats = {
    n: entries.length,
    onHarmonicBoundary: entries.filter((e) => hSet.has(e.bar)).length,
    onGrid8: entries.filter((e) => e.bar % 8 === 0).length,
    onGrid4: entries.filter((e) => e.bar % 4 === 0).length,
    onGrid2: entries.filter((e) => e.bar % 2 === 0).length,
    odd: entries.filter((e) => e.bar % 2 !== 0).length,
    medOffsetToHarmonic: entries.length && harmBounds.length ? median(entries.map((e) => nearestH(e.bar))) : null,
  };
  const secLens = harmBounds.map((b, i) => (i + 1 < harmBounds.length ? harmBounds[i + 1] : totalBars) - b);

  // ---- independent melodic lines, measured IN THE MIX
  const indep = [];
  for (let i = 0; i < feats.length; i++) for (let j = i + 1; j < feats.length; j++) {
    const A = feats[i], B = feats[j];
    if (A.role === 'bass' || B.role === 'bass') continue;
    const at = new Map();
    for (const n of A.part.notes) at.set(Math.round(n.tick / tol), n.midi);
    let together = 0, samePitch = 0; const ivs = [];
    for (const n of B.part.notes) {
      const k = Math.round(n.tick / tol);
      if (!at.has(k)) continue;
      together++;
      if (at.get(k) === n.midi) samePitch++;
      ivs.push(n.midi - at.get(k));
    }
    if (together < 4) continue;
    indep.push({
      a: A.role, b: B.role, sameInstrument: A.part.program === B.part.program,
      isDouble: A.isDouble || B.isDouble,
      together, sameOnsetRatio: r3(together / Math.min(A.n, B.n)),
      unisonRatio: r3(samePitch / together), medInterval: median(ivs),
      densityRatio: r3(B.onsetDensity / (A.onsetDensity || 1)),
    });
  }
  // A SECOND LINE WITH ITS OWN MELODY: independently moving, not a double, not
  // the lead, sparser than the lead, and its out-of-key rate relative to the
  // lead's — the r19 failure mode was a companion that left the key where the
  // lead did not.
  let secondLine = null;
  if (leadFeat) {
    const cands = feats.filter((f) => f !== leadFeat && !f.isDouble && f.role !== 'bass' && f.role !== 'arp' && f.n >= 8);
    const scored = cands.map((f) => {
      const at = new Map();
      for (const n of leadFeat.part.notes) at.set(Math.round(n.tick / tol), n.midi);
      let tog = 0, uni = 0; const ivs = [];
      for (const n of f.part.notes) { const k = Math.round(n.tick / tol); if (!at.has(k)) continue; tog++; if (at.get(k) === n.midi) uni++; ivs.push(n.midi - at.get(k)); }
      const ook = key ? f.part.notes.filter((n) => !inScale(mod12(n.midi - key.tonic), key.mode)).length / f.n : null;
      return { f, tog, unison: tog ? uni / tog : 0, medIv: median(ivs), ook };
    }).filter((c) => c.tog >= 4 && c.unison < 0.5);
    if (scored.length) {
      const best = scored.sort((a, b) => b.tog - a.tog)[0];
      const leadOok = key ? leadFeat.part.notes.filter((n) => !inScale(mod12(n.midi - key.tonic), key.mode)).length / leadFeat.n : null;
      secondLine = {
        instrument: best.f.part.instrument, role: best.f.role,
        medIntervalFromLead: best.medIv,
        belowLead: best.medIv < 0,
        unisonRatio: r3(best.unison),
        densityRatio: r3(best.f.onsetDensity / (leadFeat.onsetDensity || 1)),
        outOfKey: best.ook == null ? null : r3(best.ook),
        leadOutOfKey: leadOok == null ? null : r3(leadOok),
        moreChromaticThanLead: best.ook != null && leadOok != null ? best.ook > leadOok + 0.02 : null,
      };
    }
  }

  // call-and-response
  let callResponse = null;
  if (feats.length >= 2) {
    const active = feats.map((f) => {
      const a = new Array(totalBars).fill(0);
      for (const n of f.part.notes) { const b = Math.floor(n.tick / barTicks); if (b < totalBars) a[b] = 1; }
      return a;
    });
    let bestAlt = 0, bestPair = null;
    for (let i = 0; i < feats.length; i++) for (let j = i + 1; j < feats.length; j++) {
      if (feats[i].isDouble || feats[j].isDouble) continue;
      let xor = 0, both = 0;
      for (let b = 0; b < totalBars; b++) { if (active[i][b] !== active[j][b]) xor++; else if (active[i][b]) both++; }
      const alt = xor / (xor + both || 1);
      if (alt > bestAlt && xor >= 4) { bestAlt = alt; bestPair = [feats[i].role, feats[j].role]; }
    }
    callResponse = { alternationRatio: r3(bestAlt), pair: bestPair };
  }

  // ---- melody shape
  let melody = null;
  if (leadFeat) {
    const ns = [...leadFeat.part.notes].sort((a, b) => a.tick - b.tick);
    const steps = [];
    for (let i = 1; i < ns.length; i++) if (ns[i].tick > ns[i - 1].tick) steps.push(ns[i].midi - ns[i - 1].midi);
    const tickSet = new Map();
    for (const n of ns) tickSet.set(n.tick, (tickSet.get(n.tick) || 0) + 1);
    const rests = [];
    for (let i = 1; i < ns.length; i++) { const g = ns[i].tick - (ns[i - 1].tick + ns[i - 1].dur); if (g > tol) rests.push(g / barTicks); }
    const activeBars = new Set(ns.map((n) => Math.floor(n.tick / barTicks))).size;
    melody = {
      instrument: leadFeat.part.instrument, family: leadFeat.part.family,
      n: ns.length,
      notesPerActiveBar: r3(ns.length / (activeBars || 1)),
      activeBarRatio: r3(activeBars / totalBars),
      medDurBars: r3(median(ns.map((n) => n.dur / barTicks))),
      heldRatio: r3(ns.filter((n) => n.dur >= barTicks / 4).length / ns.length),
      polyAttackRatio: r3([...tickSet.values()].filter((c) => c > 1).length / tickSet.size),
      medStep: median(steps.map(Math.abs)),
      stepwiseRatio: r3(steps.filter((s) => Math.abs(s) <= 2).length / (steps.length || 1)),
      leapBig: r3(steps.filter((s) => Math.abs(s) > 12).length / (steps.length || 1)),
      repeatRatio: r3(steps.filter((s) => s === 0).length / (steps.length || 1)),
      restRatio: r3(rests.length / (ns.length || 1)),
      medRestBars: r3(median(rests)),
      range: Math.max(...ns.map((n) => n.midi)) - Math.min(...ns.map((n) => n.midi)),
      medPitch: median(ns.map((n) => n.midi)),
      outOfKey: key ? r3(ns.filter((n) => !inScale(mod12(n.midi - key.tonic), key.mode)).length / ns.length) : null,
    };
  }

  // ---- percussion
  const drumParts = parts.filter((p) => p.isDrum);
  const drumHits = drumParts.flatMap((p) => p.notes);
  const drumRoles = {}, drumKeys = {};
  for (const h of drumHits) {
    drumRoles[DRUM_ROLE(h.midi)] = (drumRoles[DRUM_ROLE(h.midi)] || 0) + 1;
    const nm = GM_DRUM[h.midi] || `key${h.midi}`;
    drumKeys[nm] = (drumKeys[nm] || 0) + 1;
  }
  const grid16 = (t) => Math.round((t % barTicks) / (barTicks / 16)) % 16;
  const kickGrid = new Array(16).fill(0), snareGrid = new Array(16).fill(0), hatGrid = new Array(16).fill(0), handGrid = new Array(16).fill(0);
  for (const h of drumHits) {
    const rr = DRUM_ROLE(h.midi), g = grid16(h.tick);
    if (rr === 'kick') kickGrid[g]++; else if (rr === 'snare') snareGrid[g]++;
    else if (rr === 'hat') hatGrid[g]++; else if (rr === 'hand_drum') handGrid[g]++;
  }
  let malletAlt = null;
  const mallet = feats.filter((f) => ['chromatic_perc', 'ethnic'].includes(f.part.family));
  if (mallet.length) {
    const alts = mallet.map((f) => {
      const ns = [...f.part.notes].sort((a, b) => a.tick - b.tick);
      let flips = 0, cmp = 0;
      for (let i = 2; i < ns.length; i++) {
        if (ns[i].tick === ns[i - 1].tick) continue;
        const d = Math.sign(ns[i].midi - ns[i - 1].midi);
        const p = Math.sign(ns[i - 1].midi - ns[i - 2].midi);
        if (d !== 0 && p !== 0) { cmp++; if (d !== p) flips++; }
      }
      return cmp ? flips / cmp : 0;
    });
    malletAlt = { parts: mallet.length, medAlternation: r3(median(alts)), instruments: [...new Set(mallet.map((f) => f.part.instrument))] };
  }

  // ---- dynamics
  const vels = pitchedNotes.map((n) => n.velocity);
  const ccUse = {};
  for (const p of parts) for (const c of p.ccs) ccUse[c.cc] = (ccUse[c.cc] || 0) + 1;
  const bendCount = parts.reduce((a, p) => a + p.bends.length, 0);
  // does loudness track the section arc? velocity mean per bar, then its spread
  const velByBar = [];
  for (let b = 0; b < totalBars; b++) {
    const inB = pitchedNotes.filter((n) => Math.floor(n.tick / barTicks) === b);
    if (inB.length) velByBar.push(mean(inB.map((n) => n.velocity)));
  }

  const distinctSigs = new Set(sig).size;
  const concurrentByBar = sig.map((s) => (s ? s.split(',').length : 0));
  const plausibleTempo = mid.bpm >= 40 && mid.bpm <= 240;

  return {
    file: path.split('/').pop(), ...meta, ok: true,
    ppq, format: mid.format, bpm: r3(mid.bpm), timeSig: `${tsNum}/${tsDen}`,
    tempoChanges: mid.tempos.length, timeSigChanges: mid.timeSigs.length,
    totalBars, notes: mid.notes.length, pitchedNotes: pitchedNotes.length,
    nParts: parts.length, nPitchedParts: feats.length, nDrumParts: drumParts.length,
    independentLayers,
    key: key ? `${PC_NAMES[key.tonic]} ${key.mode}` : null,
    keyMode: key ? key.mode : null, keyScore: key ? r3(key.score) : null, keyMargin: key ? key.margin : null,
    chordCoverage: r3(coverage),
    gates: {
      harmony: harmonyGate, tempo: plausibleTempo, length: totalBars >= 8,
      parts: feats.length >= 2, key: !!key && key.margin >= 0.03,
      bass: !!bassFeat, lead: !!leadFeat, hand: handFeats.length > 0,
      drums: drumHits.length > 0,
    },
    bassAgree,
    roles: feats.map((f) => ({
      role: f.role, instrument: f.part.instrument, family: f.part.family, program: f.part.program,
      n: f.n, medPitch: f.medPitch, density: r3(f.density), onsetDensity: r3(f.onsetDensity),
      medDurBars: r3(f.medDur), polyRatio: r3(f.polyRatio), maxCluster: f.maxCluster,
      spanBars: r3(f.spanBars), range: f.pitchRange, entryBar: Math.floor(f.firstTick / barTicks),
      isDouble: !!f.isDouble, arp: !!f.arp,
    })),
    doublings,
    instruments: [...new Set(parts.filter((p) => !p.isDrum).map((p) => p.instrument))],
    families: [...new Set(parts.filter((p) => !p.isDrum).map((p) => p.family))],
    harmony: {
      nChordSlots: labelled.length, slotsWithHarmony, nSlots,
      changes: seq.length, changesPerBar: r3(seq.length / totalBars),
      qualities: seq.reduce((a, s) => { a[s.quality] = (a[s.quality] || 0) + 1; return a; }, {}),
      seventhRatio: r3(seq.filter((s) => IS_SEVENTH.has(s.quality)).length / (seq.length || 1)),
      thirdlessRatio: r3(seq.filter((s) => IS_THIRDLESS.has(s.quality)).length / (seq.length || 1)),
      colourRatio: r3(seq.filter((s) => IS_COLOUR.has(s.quality)).length / (seq.length || 1)),
      triadRatio: r3(seq.filter((s) => s.quality === 'maj' || s.quality === 'min').length / (seq.length || 1)),
      progression: progression.slice(0, 48), bigrams: bigrams.slice(0, 48),
      rootMotion, distinctRoots: new Set(seq.map((s) => s.root)).size,
    },
    ivAboveBass, ivHand, simulByRole, simulHand, simulMix,
    nct: { total: nctTotal, nct, resolved: nctResolved, stepApproach: nctStepApproach, nctRatio: r3(nct / (nctTotal || 1)), resolvedRatio: r3(nctResolved / (nct || 1)) },
    insertion,
    sections: {
      texBounds: texBounds.length, harmBounds: harmBounds.length,
      distinctTextures: distinctSigs,
      meanConcurrentParts: r3(mean(concurrentByBar)),
      maxConcurrent: Math.max(0, ...concurrentByBar),
      medSectionLen: median(secLens),
      entries: entryStats, exits: exits.length,
      textureChangeRate: r3(texBounds.length / totalBars),
      harmonicChangeRate: r3(harmBounds.length / totalBars),
    },
    independence: indep, secondLine, callResponse, melody,
    drums: { hits: drumHits.length, parts: drumParts.length, roles: drumRoles, keys: drumKeys, kickGrid, snareGrid, hatGrid, handGrid },
    malletAlt,
    dynamics: {
      velMean: r3(mean(vels)), velStdev: r3(stdev(vels)), velDistinct: new Set(vels).size,
      velBarSpread: velByBar.length > 1 ? r3(stdev(velByBar)) : 0,
      cc: ccUse, bends: bendCount,
    },
  };
}

const MAJ_SET = new Set([0, 2, 4, 5, 7, 9, 11]);
// Minor includes the RAISED 7th (11). Testing against natural minor alone counted
// the leading tone of an ordinary major/dominant V as "out of key" BY
// CONSTRUCTION — which is standard harmonic-minor practice, not chromaticism.
// Measured cost of the bug: minor-key files containing a major/dom V scored 79.1%
// "violation" versus 47.4% for those without, i.e. the metric was reporting the
// presence of a normal dominant. Caught by the adversarial verify pass.
const MIN_SET = new Set([0, 2, 3, 5, 7, 8, 10, 11]);
function inScale(deg, mode) { return (mode === 'major' ? MAJ_SET : MIN_SET).has(deg); }
