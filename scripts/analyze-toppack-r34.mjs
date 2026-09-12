// r34 — deep read of the "Top MIDI Tracks Pack (Free)" (421 piano-arrangement
// MIDIs of pop / film / classical / anime / Zelda OoT, unpacked 2026-09-12).
//
// His ask: "analyze the new folder, just like you analyzed all the previous
// sample midi suites. extract all sorts of patterns, chord progressions,
// rhythms, layers, and anything else we extracted in the past. since the names
// are labeled, you can sort of figure out the vibes of the song. in-depth."
//
// ANALYSIS ONLY (D95): nothing here is counted into src/lib. The output is
// audios/toppack-r34/_analysis.json (gitignored, like every other corpus
// read-out) plus research/toppack-r34.md, and whatever survives is authored
// BY HAND into lab cards / techniques rows / canon entries in a later step.
//
// What is different from analyze-manual-r22.mjs: that set was multi-part game
// MIDI, so the questions were about parts and pairs. This pack is 89% two-hand
// PIANO, so the questions are the ones the engine's own piano path asks —
// what the LEFT HAND does (figure class, rhythm, register, inversions), what
// the RIGHT HAND does (top-voice melody grammar against the r33 reference
// bands, chordal thickness — "melody is chord too"), what the harmony does
// (loops via the repaired extractor, harmonic rhythm, borrowed chords, cadence,
// bass line), and how a song is BUILT over time (sections, intro, lift,
// dynamics arc). The 33 multi-track files get the r22 part/pair read as well.
//
// Run: node scripts/analyze-toppack-r34.mjs [dir]   (default audios/toppack-r34)

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSong, chordLoops } from '../src/ingest/corpus.js';
import { chordAt } from '../src/ingest/piano.js';
import { readCorpusMidi, extractParts, DRUM_ROLE, PC_NAMES } from './corpus-midi.mjs';
import { classifyParts } from './corpus-features.mjs';
import { labelFor, tagsFor } from './toppack-labels-r34.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = process.argv[2] ? join(ROOT, process.argv[2]) : join(ROOT, 'audios', 'toppack-r34');
const mod12 = (x) => ((x % 12) + 12) % 12;
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const share = (n, d) => (d ? r3(n / d) : null);

// ------------------------------------------------------------- harmony helpers

// the render dialect the labs page understands (audition-variations.mjs
// QUALITY_INTERVALS) — every extracted loop is written in it so a card can
// paste the loop verbatim. Ingest qualities outside it are folded and NOTED.
const QUALITY_PCS = {
  '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], '^7': [0, 4, 7, 11],
  m9: [0, 3, 7, 10, 14], madd9: [0, 3, 7, 14], 9: [0, 4, 7, 10, 14], sus: [0, 5, 7], '7sus': [0, 5, 7, 10],
  6: [0, 4, 7, 9], m6: [0, 3, 7, 9], o: [0, 3, 6], o7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10],
  // ingest-only spellings, kept for chord-tone tests, folded for the dialect
  2: [0, 2, 7], 5: [0, 7], aug: [0, 4, 8],
};
const DIALECT_FOLD = { 2: 'sus', 5: '', aug: '' };
const dialectQuality = (q) => (q in DIALECT_FOLD ? DIALECT_FOLD[q] : (q in QUALITY_PCS ? q : ''));
const chordPcs = (rootPc, q) => new Set((QUALITY_PCS[q] ?? QUALITY_PCS['']).map((i) => mod12(rootPc + i)));
const isMinorQ = (q) => /^m(?!aj)/.test(q) || q === 'o' || q === 'o7' || q === 'm7b5';

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const DEGREE_NAMES = { 0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII' };
// diatonic triad qualities by scale degree semitone: major key / natural minor
const DIATONIC = {
  major: { 0: '', 2: 'm', 4: 'm', 5: '', 7: '', 9: 'm', 11: 'o' },
  minor: { 0: 'm', 2: 'o', 3: '', 5: 'm', 7: 'm', 8: '', 10: '' },
};

function numeral(semis, quality, mode) {
  const base = DEGREE_NAMES[mod12(semis)] ?? '?';
  const minorish = isMinorQ(quality);
  const label = minorish ? base.toLowerCase() : base;
  const suffix = quality === '' || quality === 'm' ? '' : quality.replace(/^m(?!aj|7b5)/, '');
  return `${label}${suffix}`;
}
function isDiatonic(semis, quality, mode) {
  const table = DIATONIC[mode];
  const d = table[mod12(semis)];
  if (d == null) return false;
  const q = quality;
  if (d === '') return ['', '7', '^7', '6', 9, '9', 'sus', '7sus', '2', '5', 'madd9'].includes(q) && !isMinorQ(q);
  if (d === 'm') return ['m', 'm7', 'm9', 'madd9', 'm6', 'sus', '2', '5'].includes(q);
  if (d === 'o') return ['o', 'o7', 'm7b5'].includes(q);
  return false;
}
/** name a non-diatonic chord by the device it usually is */
function borrowedTag(semis, quality, mode) {
  const s = mod12(semis);
  if (mode === 'major') {
    if (s === 10 && !isMinorQ(quality)) return 'bVII (mixolydian borrow)';
    if (s === 8 && !isMinorQ(quality)) return 'bVI (aeolian borrow)';
    if (s === 5 && isMinorQ(quality)) return 'iv (minor plagal)';
    if (s === 3 && !isMinorQ(quality)) return 'bIII (borrow)';
    if (s === 2 && !isMinorQ(quality)) return 'II / V of V (secondary dominant)';
    if (s === 4 && !isMinorQ(quality)) return 'III / V of vi (secondary dominant)';
    if (s === 9 && !isMinorQ(quality)) return 'VI / V of ii (secondary dominant)';
    if (s === 0 && isMinorQ(quality)) return 'i (parallel minor)';
    if (s === 1) return 'bII (neapolitan)';
    if (s === 6) return '#IV (lydian / passing dim)';
  } else {
    if (s === 7 && !isMinorQ(quality)) return 'V (harmonic-minor dominant)';
    if (s === 0 && !isMinorQ(quality)) return 'I (picardy / parallel major)';
    if (s === 5 && !isMinorQ(quality)) return 'IV (dorian)';
    if (s === 9 && !isMinorQ(quality)) return 'VI natural? (dorian vi)';
    if (s === 2 && !isMinorQ(quality)) return 'II (lydian-ish)';
    if (s === 1) return 'bII (neapolitan)';
    if (s === 11) return 'vii° (leading-tone)';
    if (s === 4) return 'III# (chromatic)';
  }
  return 'other chromatic';
}

/** collapse a loop that is an exact k-fold repetition of a shorter cycle */
function collapsePeriod(chords) {
  const n = chords.length;
  for (let p = 1; p < n; p++) {
    if (n % p) continue;
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      const a = chords[i], b = chords[i % p];
      if (a.rootPc !== b.rootPc || a.quality !== b.quality || a.half !== b.half) ok = false;
    }
    if (ok) return { chords: chords.slice(0, p), folds: n / p };
  }
  return { chords, folds: 1 };
}

function cadenceClass(lastSemis, lastQ, firstSemis, firstQ, mode) {
  const l = mod12(lastSemis), f = mod12(firstSemis);
  const tonicFirst = f === 0;
  if (l === 7 && tonicFirst) return 'authentic V-I';
  if (l === 5 && tonicFirst) return 'plagal IV-I';
  if (l === 10 && tonicFirst) return 'bVII-I (mixolydian)';
  if (l === 8 && tonicFirst) return 'bVI-I';
  if (l === 9 && tonicFirst) return 'vi-I';
  if (l === 2 && tonicFirst) return 'ii-I';
  if (l === 7 && f === 9) return 'deceptive V-vi';
  if (l === 7) return 'V-x (half-cadence turnaround)';
  if (l === 5 && f === 7) return 'IV-V (open)';
  if (l === 0) return 'loop ends on tonic';
  return `${DEGREE_NAMES[l]}-${DEGREE_NAMES[f]}`;
}

// ------------------------------------------------------------- hand helpers

function onsetGroups(notes, barTicks, grid = 16) {
  // notes -> [{step, notes[]}] per bar-relative 16th slot (tolerant of ±1/48)
  const byBar = new Map();
  const step = barTicks / grid;
  for (const n of notes) {
    const bar = Math.floor(n.tick / barTicks);
    const pos = (n.tick - bar * barTicks) / step;
    const slot = Math.round(pos);
    if (!byBar.has(bar)) byBar.set(bar, new Map());
    const m = byBar.get(bar);
    if (!m.has(slot)) m.set(slot, []);
    m.get(slot).push(n);
  }
  return byBar;
}

/** the LEFT hand of one bar, classified by what it DOES (never by a name) */
function lhClass(groups, barTicks) {
  const slots = [...groups.keys()].sort((a, b) => a - b);
  const clusters = slots.map((s) => groups.get(s));
  const sizes = clusters.map((c) => c.length);
  const nGroups = slots.length;
  if (nGroups === 0) return null;
  const meanSize = mean(sizes);
  const longest = Math.max(...clusters.flat().map((n) => n.dur)) / barTicks;
  if (nGroups === 1) return longest >= 0.75 ? 'pedal' : 'single_hit';
  const tops = clusters.map((c) => Math.max(...c.map((n) => n.midi)));
  const lows = clusters.map((c) => Math.min(...c.map((n) => n.midi)));
  // dyad interval when clusters are pairs
  const dyadIv = clusters.filter((c) => c.length === 2).map((c) => Math.abs(c[0].midi - c[1].midi));
  const octaveShare = dyadIv.length ? dyadIv.filter((d) => d === 12).length / dyadIv.length : 0;
  const fifthShare = dyadIv.length ? dyadIv.filter((d) => d === 7 || d === 19).length / dyadIv.length : 0;
  const singles = sizes.filter((s) => s === 1).length / nGroups;
  // alternation single-low / cluster (stride, oompah)
  let alt = 0;
  for (let i = 1; i < nGroups; i++) if ((sizes[i] === 1) !== (sizes[i - 1] === 1)) alt++;
  const altShare = alt / (nGroups - 1);
  if (meanSize >= 2.5 && nGroups <= 4) return 'block';
  if (meanSize >= 2 && nGroups >= 5) return 'comp';
  if (singles < 0.5 && altShare >= 0.6 && nGroups >= 4) return 'stride';
  if (dyadIv.length >= nGroups * 0.6 && octaveShare >= 0.6) return nGroups >= 6 ? 'octave_pulse' : 'octaves';
  if (dyadIv.length >= nGroups * 0.6 && fifthShare >= 0.6) return 'fifths';
  if (singles >= 0.75 && nGroups >= 4) {
    // single-note figure: alberti / broken octave / arp shapes by contour
    const seq = tops;
    const dirs = [];
    for (let i = 1; i < seq.length; i++) dirs.push(Math.sign(seq[i] - seq[i - 1]));
    const ups = dirs.filter((d) => d > 0).length, downs = dirs.filter((d) => d < 0).length;
    const pivot = seq.filter((_, i) => i % 2 === 1);
    const pivotSame = pivot.length >= 2 && pivot.every((p) => p === pivot[0]);
    const alt2 = seq.length >= 4 && seq.every((p, i) => p === seq[i % 2]);
    const octAlt = alt2 && Math.abs(seq[0] - seq[1]) === 12;
    if (octAlt) return 'broken_octave';
    if (pivotSame && seq.length >= 4) return 'alberti';
    if (downs === 0 && ups >= 3) return 'arp_up';
    if (ups === 0 && downs >= 3) return 'arp_down';
    if (ups >= 2 && downs >= 2) {
      const peakAt = seq.indexOf(Math.max(...seq));
      if (peakAt > 0 && peakAt < seq.length - 1 && dirs.slice(0, peakAt).every((d) => d >= 0) && dirs.slice(peakAt).every((d) => d <= 0)) return 'arp_updown';
      const steps = dirs.filter((_, i) => Math.abs(seq[i + 1] - seq[i]) <= 2).length / dirs.length;
      if (steps >= 0.6) return 'walk';
      return 'arp_mixed';
    }
    return 'arp_mixed';
  }
  if (meanSize >= 2) return 'comp';
  return 'mixed';
}

const RHYTHM_CLASS = (hist16) => {
  const total = hist16.reduce((a, b) => a + b, 0) || 1;
  const on = (i) => hist16[i] / total;
  const onBeat = [0, 4, 8, 12].reduce((a, i) => a + hist16[i], 0) / total;
  const off8 = [2, 6, 10, 14].reduce((a, i) => a + hist16[i], 0) / total;
  const odd16 = hist16.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) / total;
  const tresillo = on(0) + on(6) + on(12);
  return { onBeat: r3(onBeat), off8: r3(off8), odd16: r3(odd16), tresillo: r3(tresillo), anticipation: r3(on(14) + on(15)) };
};

// ------------------------------------------------------------- melody helpers

function topVoice(notes, barTicks) {
  const byOnset = new Map();
  const tol = Math.max(1, Math.round(barTicks / 48));
  for (const n of notes) {
    const k = Math.round(n.tick / tol);
    if (!byOnset.has(k)) byOnset.set(k, []);
    byOnset.get(k).push(n);
  }
  const events = [...byOnset.entries()].sort((a, b) => a[0] - b[0]).map(([, ns]) => {
    const top = ns.reduce((a, b) => (b.midi > a.midi ? b : a));
    return { tick: top.tick, dur: top.dur, midi: top.midi, velocity: top.velocity, size: ns.length };
  });
  return events;
}

function melodyMetrics(events, timeline, key, barTicks, totalBars) {
  if (events.length < 8) return null;
  const beat = barTicks / 4;
  const seq = events;
  let rep = 0, step = 0, leap = 0, big = 0;
  for (let i = 1; i < seq.length; i++) {
    const d = Math.abs(seq[i].midi - seq[i - 1].midi);
    if (d === 0) rep++; else if (d <= 2) step++; else if (d <= 7) leap++; else big++;
  }
  const moves = rep + step + leap + big || 1;
  // chord-tone behaviour against the HALF-BAR chord (sub-bar truth, not the
  // downbeat approximation — D123's "consonance with a stale chord is dissonance")
  let judged = 0, out = 0, res = 0, app = 0, strongJudged = 0, strongIn = 0;
  const pcsAt = (tick) => {
    const seg = chordAt(timeline, Math.floor(tick / (barTicks / 2)));
    return seg ? chordPcs(seg.rootPc, seg.quality) : null;
  };
  const scale = new Set((key.mode === 'major' ? MAJOR_SCALE : MINOR_SCALE).map((s) => mod12(key.tonicPc + s)));
  const harmMinor = new Set([...MINOR_SCALE.slice(0, 6), 11].map((s) => mod12(key.tonicPc + s)));
  const pentMaj = new Set([0, 2, 4, 7, 9].map((s) => mod12(key.tonicPc + s)));
  const pentMin = new Set([0, 3, 5, 7, 10].map((s) => mod12(key.tonicPc + s)));
  let inScale = 0, inPent = 0, hist16 = new Array(16).fill(0), finalSlotShort = 0, shortNotes = 0;
  for (let i = 0; i < seq.length; i++) {
    const n = seq[i];
    const pcs = pcsAt(n.tick);
    const pc = mod12(n.midi);
    if (scale.has(pc) || (key.mode === 'minor' && harmMinor.has(pc))) inScale++;
    if ((key.mode === 'major' ? pentMaj : pentMin).has(pc)) inPent++;
    const slot = Math.round(((n.tick % barTicks) / barTicks) * 16) % 16;
    hist16[slot]++;
    const strong = slot % 8 === 0;
    if (n.dur <= beat / 4 + 1) { shortNotes++; if (slot === 15) finalSlotShort++; }
    if (!pcs) continue;
    judged++;
    if (strong) strongJudged++;
    if (pcs.has(pc)) { if (strong) strongIn++; continue; }
    out++;
    if (i + 1 < seq.length && Math.abs(seq[i + 1].midi - n.midi) <= 2 && (pcsAt(seq[i + 1].tick)?.has(mod12(seq[i + 1].midi)) ?? false)) res++;
    if (i > 0 && Math.abs(n.midi - seq[i - 1].midi) <= 2) app++;
  }
  const overallIn = judged ? (judged - out) / judged : null;
  const strongRate = strongJudged ? strongIn / strongJudged : null;
  // phrases: a gap >= a beat or a note held >= 2 beats ends a phrase
  const phrases = [];
  let cur = [seq[0]];
  for (let i = 1; i < seq.length; i++) {
    const prev = seq[i - 1];
    const gap = seq[i].tick - (prev.tick + prev.dur);
    if (gap >= beat || prev.dur >= 2 * beat) { phrases.push(cur); cur = []; }
    cur.push(seq[i]);
  }
  if (cur.length) phrases.push(cur);
  const phraseBars = phrases.map((p) => (p[p.length - 1].tick + p[p.length - 1].dur - p[0].tick) / barTicks);
  const contour = (p) => {
    if (p.length < 3) return 'flat';
    const f = p[0].midi, l = p[p.length - 1].midi, pk = Math.max(...p.map((n) => n.midi)), pi = p.findIndex((n) => n.midi === pk);
    const mid = pi > 0 && pi < p.length - 1;
    if (mid && pk - Math.min(f, l) >= 3) return 'arch';
    if (l - f >= 3) return 'rise';
    if (f - l >= 3) return 'fall';
    return 'flat';
  };
  const contours = {};
  for (const p of phrases) contours[contour(p)] = (contours[contour(p)] ?? 0) + 1;
  // activity + rests
  const activeBars = new Set(seq.map((n) => Math.floor(n.tick / barTicks)));
  let sounding = 0;
  for (const n of seq) sounding += n.dur;
  const span = seq[seq.length - 1].tick + seq[seq.length - 1].dur - seq[0].tick;
  // repetition: rhythm skeleton per bar + relative-pitch skeleton per bar
  const barSig = new Map(), barPitchSig = new Map();
  for (const n of seq) {
    const b = Math.floor(n.tick / barTicks);
    const slot = Math.round(((n.tick % barTicks) / barTicks) * 16) % 16;
    if (!barSig.has(b)) { barSig.set(b, []); barPitchSig.set(b, []); }
    barSig.get(b).push(slot);
    barPitchSig.get(b).push(`${slot}:${n.midi}`);
  }
  const sigs = [...barSig.entries()].sort((a, b) => a[0] - b[0]).map(([b, s]) => ({ b, r: s.join(','), p: barPitchSig.get(b).join(',') }));
  const rSeen = new Map(), pSeen = new Map();
  let rRepeat = 0, pRepeat = 0;
  for (const s of sigs) {
    if (rSeen.has(s.r)) rRepeat++; rSeen.set(s.r, (rSeen.get(s.r) ?? 0) + 1);
    if (pSeen.has(s.p)) pRepeat++; pSeen.set(s.p, (pSeen.get(s.p) ?? 0) + 1);
  }
  // hook: most repeated 2-bar (rhythm + interval) cell
  const cell2 = new Map();
  for (let i = 0; i + 1 < sigs.length; i++) {
    if (sigs[i + 1].b !== sigs[i].b + 1) continue;
    const ns = seq.filter((n) => Math.floor(n.tick / barTicks) === sigs[i].b || Math.floor(n.tick / barTicks) === sigs[i + 1].b);
    const ivs = ns.slice(1).map((n, j) => n.midi - ns[j].midi).join(',');
    const k = `${sigs[i].r}|${sigs[i + 1].r}|${ivs}`;
    cell2.set(k, (cell2.get(k) ?? 0) + 1);
  }
  const hook = [...cell2.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const durs = seq.map((n) => n.dur / beat);
  const durValues = new Set(durs.map((d) => Math.round(d * 4) / 4)).size;
  const pitches = seq.map((n) => n.midi);
  const climax = seq.reduce((a, b) => (b.midi > a.midi ? b : a));
  return {
    n: seq.length,
    onsetsPerActiveBar: r3(seq.length / (activeBars.size || 1)),
    activeBarShare: r3(activeBars.size / totalBars),
    medDurBeats: r3(median(durs)), durValues,
    restShare: r3(span ? Math.max(0, 1 - sounding / span) : 0),
    range: Math.max(...pitches) - Math.min(...pitches), medPitch: median(pitches),
    rep: r3(rep / moves), step: r3(step / moves), leap: r3(leap / moves), big: r3(big / moves),
    inScale: r3(inScale / seq.length), pentatonic: r3(inPent / seq.length),
    nct: share(out, judged), nctResolved: share(res, out), nctApproached: share(app, out),
    strongBeatChordTone: r3(strongRate), overallChordTone: r3(overallIn),
    gradient: strongRate != null && overallIn != null ? r3(strongRate - overallIn) : null,
    rhythm: RHYTHM_CLASS(hist16),
    finalSlotShortShare: share(finalSlotShort, shortNotes), shortNotes,
    phrases: phrases.length, phraseBarsMed: r3(median(phraseBars)), contours,
    rhythmRepeatShare: share(rRepeat, sigs.length), pitchRepeatShare: share(pRepeat, sigs.length),
    hook: hook ? { count: hook[1], cell: hook[0].slice(0, 120) } : null,
    climaxAt: r3(climax.tick / barTicks / totalBars),
    thickness: {
      single: share(seq.filter((e) => e.size === 1).length, seq.length),
      dyad: share(seq.filter((e) => e.size === 2).length, seq.length),
      triadPlus: share(seq.filter((e) => e.size >= 3).length, seq.length),
    },
  };
}

// ------------------------------------------------------------- pair relations (r22)

function pairRelation(a, b, barTicks) {
  const tol = barTicks / 32;
  const aT = [...new Set(a.notes.map((n) => n.tick))].sort((x, y) => x - y);
  const bT = [...new Set(b.notes.map((n) => n.tick))].sort((x, y) => x - y);
  const bSet = new Set(bT.map((t) => Math.round(t / tol)));
  const co = aT.filter((t) => bSet.has(Math.round(t / tol))).length;
  const coRate = co / (Math.min(aT.length, bT.length) || 1);
  const topAt = (p, t) => { const on = p.notes.filter((n) => n.tick <= t + tol && n.tick + n.dur > t + tol); return on.length ? Math.max(...on.map((n) => n.midi)) : null; };
  const shared = aT.filter((t) => bSet.has(Math.round(t / tol)));
  const gaps = [], pairsSeq = [];
  for (const t of shared) { const pa = topAt(a, t), pb = topAt(b, t); if (pa == null || pb == null) continue; gaps.push(pa - pb); pairsSeq.push([pa, pb]); }
  let par = 0, sim = 0, obl = 0, contra = 0;
  for (let i = 1; i < pairsSeq.length; i++) {
    const da = pairsSeq[i][0] - pairsSeq[i - 1][0], db = pairsSeq[i][1] - pairsSeq[i - 1][1];
    if (da === 0 && db === 0) continue;
    if (da === 0 || db === 0) obl++; else if (Math.sign(da) !== Math.sign(db)) contra++; else if (da === db) par++; else sim++;
  }
  const motions = par + sim + obl + contra || 1;
  let echo = null;
  for (const lagBeats of [0.25, 0.5, 0.75, 1, 1.5, 2]) {
    const lag = Math.round(lagBeats * (barTicks / 4));
    const hit = aT.filter((t) => bSet.has(Math.round((t + lag) / tol))).length;
    const r = hit / (aT.length || 1);
    if (r > 0.6 && (!echo || r > echo.rate)) echo = { lagBeats, rate: r3(r) };
  }
  return { coRate: r3(coRate), n: shared.length, medGap: median(gaps), motion: { parallel: r3(par / motions), similar: r3(sim / motions), oblique: r3(obl / motions), contrary: r3(contra / motions) }, echo };
}

// ------------------------------------------------------------- one file

function analyze(path, file) {
  const raw = readCorpusMidi(path);
  const [num, den] = raw.timeSig;
  // some exporters write nonsense denominators (1/4, 1/8, 3/16): treat a bar
  // shorter than half a 4/4 bar as 4/4 and say so
  const bogusMeter = num * 4 / den < 2;
  const meter = bogusMeter ? '4/4*' : `${num}/${den}`;
  const s = loadSong(path);
  if (s.skipped) throw new Error(s.skipped);
  const barTicks = bogusMeter ? s.midi.ppq * 4 : s.barTicks;
  const lastTick = Math.max(...s.midi.notes.map((n) => n.tick + n.dur));
  const totalBars = Math.max(1, Math.ceil(lastTick / barTicks));
  // re-derive the ingest structures on the corrected bar length when needed
  let song = s;
  if (bogusMeter || totalBars !== s.totalBars) {
    song = { ...s, barTicks, totalBars };
    if (bogusMeter) {
      // chord timeline is in half-bars of the ORIGINAL barTicks; rebuild from scratch
      const { chordTimeline, barFigures, pickGrid } = awaitPiano;
      song.timeline = chordTimeline(s.midi.notes, barTicks, totalBars, { melody: s.mel, key: s.key });
      const grid = s.acc.length ? pickGrid(s.acc, barTicks, 4) : null;
      song.grid = grid?.grid ?? null;
      song.figs = grid ? barFigures(s.acc, song.timeline, barTicks, totalBars, grid.grid) : [];
    }
  }
  const key = song.key;
  const tonic = key.tonicPc, mode = key.mode;
  const label = labelFor(file);
  const tags = tagsFor(file);

  // ---- harmony: half-bar timeline -> segments (root+quality RLE)
  const nHalf = totalBars * 2;
  const segs = [];
  for (let h = 0; h < nHalf; h++) {
    const seg = chordAt(song.timeline, h);
    if (!seg) { segs.push(null); continue; }
    const last = segs[segs.length - 1];
    if (last && last.rootPc === seg.rootPc && last.quality === seg.quality) { last.half++; continue; }
    segs.push({ rootPc: seg.rootPc, quality: seg.quality, half: 1, at: h });
  }
  const chords = segs.filter(Boolean);
  const labelled = chords.length;
  const spanHist = {};
  for (const c of chords) { const k = c.half / 2; spanHist[k] = (spanHist[k] ?? 0) + 1; }
  const subBarChanges = chords.filter((c) => c.at % 2 === 1).length;
  const qualityHist = {};
  for (const c of chords) qualityHist[c.quality || 'maj'] = (qualityHist[c.quality || 'maj'] ?? 0) + c.half;
  const colorHalf = chords.filter((c) => !['', 'm', '5'].includes(c.quality)).reduce((a, c) => a + c.half, 0);
  const diatonicHalf = chords.filter((c) => isDiatonic(c.rootPc - tonic, c.quality, mode)).reduce((a, c) => a + c.half, 0);
  const borrowed = {};
  for (const c of chords) {
    if (isDiatonic(c.rootPc - tonic, c.quality, mode)) continue;
    const t = `${numeral(c.rootPc - tonic, c.quality, mode)} = ${borrowedTag(c.rootPc - tonic, c.quality, mode)}`;
    borrowed[t] = (borrowed[t] ?? 0) + 1;
  }
  const rootMotion = {};
  for (let i = 1; i < chords.length; i++) {
    let d = mod12(chords[i].rootPc - chords[i - 1].rootPc);
    if (d > 6) d -= 12;
    const k = d === 5 || d === -5 ? (d === 5 ? 'up4' : 'down4') : d === 1 || d === -1 ? 'semitone' : Math.abs(d) === 2 ? (d > 0 ? 'up2' : 'down2') : Math.abs(d) <= 4 ? (d > 0 ? 'up3' : 'down3') : 'tritone';
    rootMotion[k] = (rootMotion[k] ?? 0) + 1;
  }
  // bass line under the chords (LH lowest note per half-bar)
  const lowAt = new Array(nHalf).fill(null);
  for (const n of song.acc) {
    const h0 = Math.floor(n.tick / (barTicks / 2)), h1 = Math.min(nHalf - 1, Math.floor((n.tick + n.dur - 1) / (barTicks / 2)));
    for (let h = h0; h <= h1; h++) if (lowAt[h] == null || n.midi < lowAt[h]) lowAt[h] = n.midi;
  }
  let invJudged = 0, inversions = 0, pedalHalf = 0, descRuns = 0;
  const slashes = {};
  for (let h = 0; h < nHalf; h++) {
    const seg = chordAt(song.timeline, h);
    if (!seg || lowAt[h] == null) continue;
    invJudged++;
    const pc = mod12(lowAt[h]);
    if (pc !== seg.rootPc && chordPcs(seg.rootPc, seg.quality).has(pc)) {
      inversions++;
      const k = `${numeral(seg.rootPc - tonic, seg.quality, mode)}/${DEGREE_NAMES[mod12(pc - tonic)]}`;
      slashes[k] = (slashes[k] ?? 0) + 1;
    }
  }
  // pedal point: same bass pc across >= 3 half-bars while the chord root changes
  for (let h = 2; h < nHalf; h++) {
    const a = chordAt(song.timeline, h - 2), b = chordAt(song.timeline, h - 1), c = chordAt(song.timeline, h);
    if (!a || !b || !c || lowAt[h] == null || lowAt[h - 1] == null || lowAt[h - 2] == null) continue;
    const samePc = mod12(lowAt[h]) === mod12(lowAt[h - 1]) && mod12(lowAt[h]) === mod12(lowAt[h - 2]);
    const rootsDiffer = new Set([a.rootPc, b.rootPc, c.rootPc]).size >= 2;
    if (samePc && rootsDiffer) pedalHalf++;
  }
  // stepwise descending bass runs (lament / Pachelbel shapes): >= 3 consecutive
  // downward steps (1-2 semitones) in the half-bar bass sequence
  {
    const seq = lowAt.filter((x) => x != null);
    let run = 0;
    for (let i = 1; i < seq.length; i++) {
      const d = seq[i - 1] - seq[i];
      if (d === 1 || d === 2) { run++; if (run === 3) descRuns++; } else if (d !== 0) run = 0;
    }
  }

  // ---- loops (repaired extractor), written in the labs dialect
  const loops = chordLoops(song, { max: 4 }).map((l) => {
    let { chords: cs, folds } = collapsePeriod(l.chords);
    // a span that starts mid-chord reads "IV I V vi IV": merge the straddled
    // chord and start the loop on the next one, so the loop is the song's
    if (cs.length > 2 && cs[0].rootPc === cs[cs.length - 1].rootPc && cs[0].quality === cs[cs.length - 1].quality) {
      const merged = { ...cs[cs.length - 1], half: cs[0].half + cs[cs.length - 1].half };
      cs = [...cs.slice(1, -1), merged];
    }
    const degrees = cs.map((c) => { const semis = mod12(c.rootPc - tonic); const q = dialectQuality(c.quality); return `${semis}${q ? ':' + q : ''}`; }).join(' ');
    const beats = cs.map((c) => c.half * 2);
    const folded = cs.filter((c) => c.quality in DIALECT_FOLD).map((c) => `${PC_NAMES[c.rootPc]}${c.quality}`);
    return {
      degrees, chordBeats: beats, loopBars: l.loopBars / folds, foldsWithin: folds, reps: l.reps * folds, atBar: l.atBar, coverage: r3(l.coverage),
      numerals: cs.map((c) => numeral(c.rootPc - tonic, c.quality, mode)).join(' '),
      symbols: cs.map((c) => `${PC_NAMES[c.rootPc]}${c.quality}`).join(' '),
      colorChords: cs.filter((c) => !['', 'm', '5'].includes(c.quality)).length,
      nonDiatonic: cs.filter((c) => !isDiatonic(c.rootPc - tonic, c.quality, mode)).map((c) => numeral(c.rootPc - tonic, c.quality, mode)),
      cadence: cadenceClass(cs[cs.length - 1].rootPc - tonic, cs[cs.length - 1].quality, cs[0].rootPc - tonic, cs[0].quality, mode),
      harmonicRhythm: beats.join('-'),
      dialectFolds: folded,
    };
  });
  const loopCoverBars = loops.reduce((a, l) => a + l.loopBars * l.reps, 0);

  // ---- LEFT HAND
  const accGroups = onsetGroups(song.acc, barTicks);
  const lhBars = [...accGroups.entries()].sort((a, b) => a[0] - b[0]);
  const lhClasses = {};
  const lhHist = new Array(16).fill(0);
  const lhOnsets = [], lhSizes = [], lhSpread = [], lhDurs = [], lhLow = [];
  const perBarLH = new Map();
  for (const [bar, groups] of lhBars) {
    const cls = lhClass(groups, barTicks);
    if (!cls) continue;
    lhClasses[cls] = (lhClasses[cls] ?? 0) + 1;
    perBarLH.set(bar, cls);
    for (const [slot, ns] of groups) { lhHist[slot % 16]++; lhSizes.push(ns.length); }
    lhOnsets.push(groups.size);
    const all = [...groups.values()].flat();
    lhSpread.push(Math.max(...all.map((n) => n.midi)) - Math.min(...all.map((n) => n.midi)));
    lhLow.push(Math.min(...all.map((n) => n.midi)));
    for (const n of all) lhDurs.push(n.dur / (barTicks / 4));
  }
  const lhClassTop = Object.entries(lhClasses).sort((a, b) => b[1] - a[1]);
  // representative figures: most common bar signature (grid steps + tokens)
  const sigCount = new Map();
  for (const f of song.figs) { if (!f || !f.sig) continue; const k = f.sig; if (!sigCount.has(k)) sigCount.set(k, { n: 0, f }); sigCount.get(k).n++; }
  const topFigs = [...sigCount.values()].sort((a, b) => b.n - a.n).slice(0, 3).map(({ n, f }) => ({
    seen: n, share: r3(n / (song.figs.length || 1)), grid: song.grid, steps: f.steps, tokens: f.tokens,
    onsets: f.steps.map((st) => `${st}/${song.grid}`), accents: f.vels.map((v) => r3(v / Math.max(...f.vels))),
    nonChord: r3(f.nonChord), meanMidi: r3(f.meanMidi), octave: Math.floor(f.rootRef / 12) - 1,
  }));
  const lhVel = song.acc.map((n) => n.velocity);

  // ---- RIGHT HAND
  const rhEvents = topVoice(song.mel, barTicks);
  const melody = melodyMetrics(rhEvents, song.timeline, key, barTicks, totalBars);
  const rhVel = song.mel.map((n) => n.velocity);
  // intro: first bar where the top voice runs >= 2 onsets/bar for 2 bars
  let introBars = 0;
  {
    const perBar = new Map();
    for (const e of rhEvents) { const b = Math.floor(e.tick / barTicks); perBar.set(b, (perBar.get(b) ?? 0) + 1); }
    for (let b = 0; b < totalBars; b++) { if ((perBar.get(b) ?? 0) >= 2 && (perBar.get(b + 1) ?? 0) >= 2) { introBars = b; break; } }
  }

  // ---- SECTIONS from the texture state (LH class, RH density, RH register,
  // velocity), a change persisting >= 4 bars
  const barState = [];
  for (let b = 0; b < totalBars; b++) {
    const rh = rhEvents.filter((e) => Math.floor(e.tick / barTicks) === b);
    const lhNotes = song.acc.filter((n) => Math.floor(n.tick / barTicks) === b);
    barState.push({
      lh: perBarLH.get(b) ?? 'rest', rhN: rh.length, rhPitch: rh.length ? median(rh.map((e) => e.midi)) : null,
      vel: mean([...rh.map((e) => e.velocity), ...lhNotes.map((n) => n.velocity)]) || null,
      lhN: lhNotes.length,
    });
  }
  const sections = [];
  let start = 0;
  const differs = (a, b) => {
    let d = 0;
    if (a.lh !== b.lh) d++;
    if (a.rhPitch != null && b.rhPitch != null && Math.abs(a.rhPitch - b.rhPitch) >= 5) d++;
    if (Math.abs(a.rhN - b.rhN) >= 3) d++;
    if (a.vel && b.vel && Math.abs(a.vel - b.vel) >= 12) d++;
    return d >= 2;
  };
  const summarize = (from, to) => {
    const bs = barState.slice(from, to);
    const lhs = {};
    for (const x of bs) lhs[x.lh] = (lhs[x.lh] ?? 0) + 1;
    return { start: from, bars: to - from, lh: Object.entries(lhs).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'rest', rhDensity: r3(mean(bs.map((x) => x.rhN))), rhPitch: r3(median(bs.map((x) => x.rhPitch).filter((x) => x != null))), vel: r3(mean(bs.map((x) => x.vel).filter(Boolean))), lhDensity: r3(mean(bs.map((x) => x.lhN))) };
  };
  for (let b = 4; b + 4 <= totalBars; b++) {
    const prev = summarize(Math.max(start, b - 4), b), next = summarize(b, b + 4);
    if (b - start >= 4 && differs(prev, next)) { sections.push(summarize(start, b)); start = b; }
  }
  sections.push(summarize(start, totalBars));
  const lift = sections.length > 1 ? Math.max(...sections.map((x) => x.rhPitch ?? 0)) - (sections[0].rhPitch ?? 0) : 0;
  const velMeans = sections.map((x) => x.vel).filter(Boolean);
  const velArc = velMeans.length > 1 ? (velMeans[velMeans.length - 1] > velMeans[0] + 6 ? 'rising' : velMeans[velMeans.length - 1] < velMeans[0] - 6 ? 'falling' : 'flat') : 'flat';

  // ---- dynamics / performance
  const allVel = s.midi.notes.map((n) => n.velocity);
  const cc = raw.tracks.flatMap((t) => t.ccs);
  const sustain = cc.filter((c) => c.cc === 64).length;
  const tempos = raw.tempos.length;

  // ---- multi-track: parts, roles, concurrency, pairs, drums
  let layers = null;
  const parts = extractParts(raw);
  const pitched = parts.filter((p) => !p.isDrum);
  const drums = parts.filter((p) => p.isDrum);
  if (pitched.length >= 3 || drums.length) {
    const { feats } = classifyParts(parts, barTicks);
    const roleOf = new Map(feats.map((f) => [f.key, f.role]));
    const arc = new Array(totalBars).fill(0);
    for (const p of pitched) for (const b of new Set(p.notes.map((n) => Math.floor(n.tick / barTicks)))) if (b < totalBars) arc[b]++;
    const partRows = pitched.map((p) => {
      const ms = p.notes.map((n) => n.midi);
      const first = Math.min(...p.notes.map((n) => n.tick));
      const activeBars = new Set(p.notes.map((n) => Math.floor(n.tick / barTicks))).size;
      const byTick = new Map();
      for (const n of p.notes) { if (!byTick.has(n.tick)) byTick.set(n.tick, []); byTick.get(n.tick).push(n); }
      return { key: p.key, name: p.name, instrument: p.instrument, family: p.family, role: roleOf.get(p.key) ?? 'acc', notes: p.notes.length, medPitch: median(ms), entryBar: Math.floor(first / barTicks), coverage: r3(activeBars / totalBars), onsetsPerActiveBar: r3(byTick.size / (activeBars || 1)), medDurBeats: r3(median(p.notes.map((n) => n.dur)) / (barTicks / 4)), poly: r3([...byTick.values()].filter((c) => c.length > 1).length / (byTick.size || 1)) };
    }).sort((a, b) => b.medPitch - a.medPitch);
    const top = [...pitched].sort((a, b) => b.notes.length - a.notes.length).slice(0, 6);
    const rel = [];
    for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) {
      const r = pairRelation(top[i], top[j], barTicks);
      if (r.n < 4) continue;
      rel.push({ a: top[i].instrument, b: top[j].instrument, aRole: roleOf.get(top[i].key), bRole: roleOf.get(top[j].key), sameFamily: top[i].family === top[j].family, ...r });
    }
    const drumRows = drums.map((p) => {
      const roles = {};
      for (const n of p.notes) { const r = DRUM_ROLE(n.midi); roles[r] = (roles[r] ?? 0) + 1; }
      const hist = new Array(16).fill(0);
      for (const n of p.notes) hist[Math.round(((n.tick % barTicks) / barTicks) * 16) % 16]++;
      // dominant one-bar groove: the most common (role@slot) bar signature
      const sigs = new Map();
      const byBar = new Map();
      for (const n of p.notes) { const b = Math.floor(n.tick / barTicks); if (!byBar.has(b)) byBar.set(b, []); byBar.get(b).push(`${DRUM_ROLE(n.midi)}@${Math.round(((n.tick % barTicks) / barTicks) * 16) % 16}`); }
      for (const [, xs] of byBar) { const k = [...new Set(xs)].sort().join(' '); sigs.set(k, (sigs.get(k) ?? 0) + 1); }
      const dom = [...sigs.entries()].sort((a, b) => b[1] - a[1])[0];
      return { notes: p.notes.length, roles, hist, groove: dom ? { bars: dom[1], sig: dom[0] } : null };
    });
    layers = {
      declared: pitched.length, concurrencyMean: r3(mean(arc.filter(Boolean))), concurrencyMax: Math.max(...arc),
      parts: partRows, relations: rel, drums: drumRows,
      sameFamilyPairs: share(rel.filter((r) => r.sameFamily).length, rel.length),
      entryBars: [...new Set(partRows.map((p) => p.entryBar))].sort((a, b) => a - b),
    };
  }

  return {
    file, song: label?.song ?? file.replace(/\.mid$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40),
    lane: label?.lane ?? 'unlabeled', emotion: label?.emotion ?? null, energy: label?.energy ?? null, tags,
    meter, bogusMeter, bpm: Math.round(raw.bpm), tempoEvents: tempos, ppq: raw.ppq, totalBars,
    key: `${PC_NAMES[tonic]}:${mode}`, keyMargin: r3(key.margin), keySig: raw.keySigs[0] ?? null,
    hands: song.method, tracks: raw.tracks.filter((t) => t.notes.length).length,
    harmony: {
      labelledSegments: labelled, chordsPerBar: r3(labelled / totalBars), spanHist, subBarChangeShare: share(subBarChanges, labelled),
      qualityHist, colorShare: share(colorHalf, nHalf), diatonicShare: share(diatonicHalf, nHalf), borrowed, rootMotion,
      inversionShare: share(inversions, invJudged), slashes, pedalHalfShare: share(pedalHalf, nHalf), descendingBassRuns: descRuns,
      loops, loopCoverShare: r3(loopCoverBars / totalBars),
    },
    lh: {
      notes: song.acc.length, classes: lhClasses, classTop: lhClassTop[0]?.[0] ?? null, classTopShare: lhClassTop.length ? r3(lhClassTop[0][1] / lhBars.length) : null,
      onsetsPerBar: r3(mean(lhOnsets)), clusterMean: r3(mean(lhSizes)), clusterHist: { 1: lhSizes.filter((x) => x === 1).length, 2: lhSizes.filter((x) => x === 2).length, 3: lhSizes.filter((x) => x === 3).length, '4+': lhSizes.filter((x) => x >= 4).length },
      spreadMed: median(lhSpread), lowMed: median(lhLow), medDurBeats: r3(median(lhDurs)), rhythm: RHYTHM_CLASS(lhHist), hist16: lhHist,
      velMean: r3(mean(lhVel)), grid: song.grid, topFigures: topFigs,
    },
    rh: { notes: song.mel.length, velMean: r3(mean(rhVel)), melody, introBars },
    form: { sections, sectionCount: sections.length, lift, velArc, velDistinct: new Set(allVel).size, velMean: r3(mean(allVel)), velMin: Math.min(...allVel), velMax: Math.max(...allVel), sustainEvents: sustain },
    layers,
  };
}

// piano.js extras for the bogus-meter rebuild (imported lazily to keep the
// top of the file about what the script MEASURES)
const awaitPiano = await import('../src/ingest/piano.js');

const files = readdirSync(DIR).filter((f) => /\.mid$/i.test(f)).sort();
const out = [];
const failed = [];
for (const f of files) {
  try { out.push(analyze(join(DIR, f), f)); }
  catch (e) { failed.push(`${f}: ${e.message}`); }
}
writeFileSync(join(DIR, '_analysis.json'), JSON.stringify({ built: new Date().toISOString(), files: out, failed }, null, 1));
console.log(`analysed ${out.length}/${files.length} files -> ${DIR}/_analysis.json${failed.length ? `\nFAILED (${failed.length}):\n  ${failed.join('\n  ')}` : ''}`);
const unl = out.filter((a) => a.lane === 'unlabeled').map((a) => a.file);
if (unl.length) console.log(`\nUNLABELED (${unl.length}):\n  ${unl.join('\n  ')}`);
for (const a of out) {
  const m = a.rh.melody;
  console.log(`\n${a.file.slice(0, 70)}  [${a.lane}/${a.emotion}/${a.energy}] ${a.key} @${a.bpm} ${a.meter} · ${a.totalBars} bars · ${a.hands}`);
  for (const l of a.harmony.loops.slice(0, 2)) console.log(`   loop ${l.loopBars}b x${l.reps} @${l.atBar}: ${l.numerals}  (${l.symbols}) hr ${l.harmonicRhythm} cad ${l.cadence}${l.nonDiatonic.length ? ' borrowed ' + l.nonDiatonic.join(',') : ''}`);
  console.log(`   LH ${a.lh.classTop} ${a.lh.classTopShare != null ? (a.lh.classTopShare * 100).toFixed(0) + '%' : ''} ${a.lh.onsetsPerBar}on/bar cluster${a.lh.clusterMean} low${a.lh.lowMed} off8 ${a.lh.rhythm.off8} | ${a.lh.topFigures[0] ? a.lh.topFigures[0].tokens.join(' ') + ' @' + a.lh.topFigures[0].onsets.join(',') : '-'}`);
  if (m) console.log(`   RH ${m.onsetsPerActiveBar}on/bar dur${m.medDurBeats}b step${(m.step * 100).toFixed(0)}% leap>5 ${(m.big * 100).toFixed(0)}% nct${m.nct != null ? (m.nct * 100).toFixed(0) + '%' : '-'}/res${m.nctResolved != null ? (m.nctResolved * 100).toFixed(0) + '%' : '-'} grad${m.gradient} odd16 ${m.rhythm.odd16} final ${m.finalSlotShortShare} thick ${m.thickness.dyad}/${m.thickness.triadPlus} pent${m.pentatonic} rep${m.rhythmRepeatShare} phr${m.phraseBarsMed}b`);
  console.log(`   form ${a.form.sectionCount} sections, intro ${a.rh.introBars}b, lift ${a.form.lift}st, vel ${a.form.velDistinct} values ${a.form.velArc}, color ${a.harmony.colorShare} diatonic ${a.harmony.diatonicShare} inv ${a.harmony.inversionShare} subbar ${a.harmony.subBarChangeShare}`);
  if (a.layers) console.log(`   LAYERS ${a.layers.declared} parts, conc ${a.layers.concurrencyMean}/${a.layers.concurrencyMax}, entries ${a.layers.entryBars.join(',')}, drums ${a.layers.drums.length}`);
}
