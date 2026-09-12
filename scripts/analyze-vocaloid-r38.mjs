// r38 — the SECOND read of the Vocaloid set: what the r35 read-out did not
// measure. His ask (2026-09-12, after band.html "fits but doesn't really sound
// good or catchy"): "analyze all the vocaloid songs i gave you last time and
// learn from their chord progressions and patterns and what they play and how
// they support vocaloid and the piano patterns and voice patterns and layering,
// and just what makes the song 'sound good' … take note of instruments they
// use too".
//
// r35 measured the VOICE (speed, intervals, phrases, repetition, agreement) and
// the verse/chorus contrast as numbers. This pass measures the ARRANGEMENT as
// FIGURES and the SONG as a FORM:
//   ACC FIGURES   what the piano's right hand plays, classified per 4-bar window
//                 (sustain / block on beats / 8th block / stab / arpeggio / riff /
//                 counter-line / syncopated) and its top-voice motion
//   BASS FIGURES  8th pump / 16th pump / octave / walk / held / syncopated
//   FORM          contiguous sections from the window classifier (intro, verse,
//                 pre, chorus, interlude, bridge, outro) with their LENGTHS, the
//                 chorus's harmony vs the verse's, the chord the chorus opens on,
//                 the chord the pre-chorus ends on
//   HOOK          does the instrumental intro carry the chorus tune (cells
//                 shared between the intro top line and the sung chorus)
//   KEY CHANGES   key per section; the final-chorus modulation
//   LAYERING ARC  density per window, breakdowns, the final-chorus lift
//   CHORUS CELL   the shape of the first chorus phrase (start, first interval,
//                 peak placement, repeated-note opening, syncopation)
//   INSTRUMENTS   what the files DECLARE — measured as absent (no program
//                 changes, one velocity), so the instrument table in the
//                 research doc is knowledge, not measurement, and says so.
//
// Roles, grid shift and labels are taken from the r35 analysis JSON so the two
// reads describe the same population the same way. ANALYSIS ONLY (D95).
//
// Run: node scripts/analyze-vocaloid-r38.mjs [--summary]
//   -> audios/vocaloid-r35/_analysis-r38.json (+ a printed summary)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chordLoops } from '../src/ingest/corpus.js';
import { chordAt, chordTimeline, solveKeyKS } from '../src/ingest/piano.js';
import { readCorpusMidi, extractParts, PC_NAMES } from './corpus-midi.mjs';
import { clusters, accFigure, bassFigure } from './figure-classes-r38.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = join(ROOT, 'audios', 'vocaloid-r35');
const R35 = JSON.parse(readFileSync(join(DIR, '_analysis.json'), 'utf8'));
const SUMMARY_ONLY = process.argv.includes('--summary');

const mod12 = (x) => ((x % 12) + 12) % 12;
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const median = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (a, p) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const share = (n, d) => (d ? r3(n / d) : null);
const hist = (arr, f = (x) => x) => { const h = {}; for (const x of arr) { const k = f(x); if (k == null) continue; h[k] = (h[k] ?? 0) + 1; } return h; };
const top = (h) => Object.entries(h).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
const DEGREE_NAMES = { 0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII' };
const DIALECT_FOLD = { 2: 'sus', 5: '', aug: '' };
const dialectQuality = (q) => (q in DIALECT_FOLD ? DIALECT_FOLD[q] : q);
const numeral = (semis, quality) => { const n = DEGREE_NAMES[semis]; const q = dialectQuality(quality); return (q === 'm' || q === 'm7' || q === 'm9' || q === 'm6' || q === 'madd9') ? n.toLowerCase() + (q === 'm' ? '' : q.slice(1)) : q === 'o' || q === 'm7b5' ? n.toLowerCase() + (q === 'o' ? '°' : 'ø') : n + q; };

// ------------------------------------------------------------------ analyze
function analyze(r35) {
  const file = r35.file;
  const mid = readCorpusMidi(join(DIR, file));
  const parts = extractParts(mid);
  const [num, den] = mid.timeSig;
  const barTicks = mid.ppq * 4 * (num / den);
  const beatTicks = mid.ppq;
  const grid16 = barTicks / 16;
  if (r35.gridShift16ths) for (const p of parts) { for (const n of p.notes) n.tick -= r35.gridShift16ths * grid16; p.notes = p.notes.filter((n) => n.tick >= 0); }
  const byName = (nm) => parts.find((p) => p.name === nm);
  const voicePart = byName(r35.tracks.voice);
  const accParts = r35.tracks.acc.map(byName).filter(Boolean);
  const bassPart = r35.tracks.bass ? byName(r35.tracks.bass) : null;
  if (!voicePart) return { file, skipped: 'voice track not found' };
  let voice = [...voicePart.notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi);
  if (r35.voiceShift16ths) voice = voice.map((n) => ({ ...n, tick: n.tick + r35.voiceShift16ths * grid16 })).filter((n) => n.tick >= 0);
  const vOnsets = []; for (const n of voice) { const last = vOnsets[vOnsets.length - 1]; if (last && Math.abs(last.tick - n.tick) <= 2) { if (n.midi > last.midi) vOnsets[vOnsets.length - 1] = n; } else vOnsets.push(n); }
  const acc = accParts.flatMap((p) => p.notes).sort((a, b) => a.tick - b.tick);
  const bass = bassPart ? [...bassPart.notes].sort((a, b) => a.tick - b.tick) : [];
  const totalBars = Math.max(1, Math.ceil(mid.endTick / barTicks));
  const allNotes = mid.notes.filter((n) => n.channel !== 9 && n.tick >= 0);
  const key = solveKeyKS(allNotes);
  const tonicPc = key.tonicPc, mode = key.mode;
  const harmNotes = acc.concat(bass);
  const timeline = chordTimeline(harmNotes.length ? harmNotes : allNotes, barTicks, totalBars, { key });
  const chordAtTick = (t) => chordAt(timeline, Math.floor(t / (barTicks / 2)));
  const numAt = (hw) => { const s = chordAt(timeline, hw); return s && s.coverage > 0 ? numeral(mod12(s.rootPc - tonicPc), s.quality) : null; };

  // ---- INSTRUMENTS as declared
  const declared = parts.map((p) => ({ name: p.name, program: p.program, instrument: p.instrument, velocities: new Set(p.notes.map((n) => n.velocity)).size, ccs: p.ccs.length, bends: p.bends.length }));

  // ---- windows (4 bars)
  const W = 4; const nWin = Math.ceil(totalBars / W);
  const inWin = (arr, w) => arr.filter((n) => n.tick >= w * W * barTicks && n.tick < (w + 1) * W * barTicks);
  const windows = [];
  for (let w = 0; w < nWin; w++) {
    const barsHere = Math.min(W, totalBars - w * W);
    const v = inWin(vOnsets, w), a = inWin(acc, w), b = inWin(bass, w);
    const af = accFigure(a, barsHere, barTicks, beatTicks);
    const bf = bassFigure(b, barsHere, barTicks, beatTicks, chordAtTick);
    const vDbl = v.length ? share(v.filter((n) => a.some((x) => Math.abs(x.tick - n.tick) <= 3 && mod12(x.midi) === mod12(n.midi) && x.midi !== n.midi)).length, v.length) : null;
    const wk = solveKeyKS(a.concat(b, v));
    windows.push({ w, bar: w * W, bars: barsHere, sung: v.length >= 2, vNotes: v.length, vMed: v.length ? median(v.map((n) => n.midi)) : null, vHi: v.length ? Math.max(...v.map((n) => n.midi)) : null,
      acc: af, bass: bf, accNotesPerBar: r3(a.length / barsHere), bassNotesPerBar: r3(b.length / barsHere), density: r3((a.length + b.length) / barsHere), accDoublesVoice: vDbl,
      keyPc: wk.tonicPc, keyMode: wk.mode, chords: [0, 1, 2, 3, 4, 5, 6, 7].slice(0, barsHere * 2).map((h) => numAt(w * W * 2 + h)) });
  }
  // ---- sections from windows: contiguous runs. Sung windows are ranked by the
  // r35 composite (register + density + acc density + thickness); top third =
  // chorus, bottom third = verse, middle = 'mid' (pre-chorus / B-verse); an
  // unsung run before the first sung = intro, between = interlude, after = outro.
  const sungW = windows.filter((x) => x.sung);
  const z = (arr, f) => { const vals = arr.map(f); const m = mean(vals), sd = Math.sqrt(mean(vals.map((v) => (v - m) ** 2))) || 1; return vals.map((v) => (v - m) / sd); };
  let labelOf = new Map();
  if (sungW.length >= 4) {
    const zm = z(sungW, (x) => x.vMed ?? 0), zh = z(sungW, (x) => x.vHi ?? 0), za = z(sungW, (x) => x.acc.onsetsPerBar ?? 0), zs = z(sungW, (x) => x.acc.meanSize ?? 0), zb = z(sungW, (x) => x.bass.onsetsPerBar ?? 0);
    const score = sungW.map((x, i) => zm[i] + zh[i] + 0.6 * za[i] + 0.6 * zs[i] + 0.4 * zb[i]);
    const order = sungW.map((x, i) => i).sort((i, j) => score[i] - score[j]);
    const k = Math.max(1, Math.floor(sungW.length / 3));
    order.slice(0, k).forEach((i) => labelOf.set(sungW[i].w, 'verse'));
    order.slice(-k).forEach((i) => labelOf.set(sungW[i].w, 'chorus'));
    order.slice(k, -k).forEach((i) => labelOf.set(sungW[i].w, 'mid'));
  }
  const firstSung = sungW[0]?.w ?? 0, lastSung = sungW[sungW.length - 1]?.w ?? nWin - 1;
  for (const x of windows) { if (!x.sung) labelOf.set(x.w, x.w < firstSung ? 'intro' : x.w > lastSung ? 'outro' : 'interlude'); x.label = labelOf.get(x.w) ?? 'mid'; }
  // smooth: a single 'mid' window between two of one label takes that label
  for (let i = 1; i + 1 < windows.length; i++) if (windows[i].sung && windows[i - 1].label === windows[i + 1].label && windows[i - 1].sung && windows[i].label !== windows[i - 1].label) windows[i].label = windows[i - 1].label;
  const sections = [];
  for (const x of windows) { const last = sections[sections.length - 1]; if (last && last.label === x.label) { last.bars += x.bars; last.windows.push(x.w); } else sections.push({ label: x.label, startBar: x.bar, bars: x.bars, windows: [x.w] }); }
  for (const s of sections) {
    const ws = s.windows.map((w) => windows[w]);
    s.accCls = top(hist(ws.map((x) => x.acc.cls)));
    s.bassCls = top(hist(ws.map((x) => x.bass.cls)));
    s.density = r3(mean(ws.map((x) => x.density)));
    s.accDoublesVoice = r3(mean(ws.map((x) => x.accDoublesVoice).filter((v) => v != null)));
    s.vMed = median(ws.map((x) => x.vMed).filter((v) => v != null));
    s.keyPc = top(hist(ws.map((x) => x.keyPc)));
    s.chords = ws.flatMap((x) => x.chords);
    // loop of the section: collapse repeated half-bar labels to a chord sequence
    const seq = []; for (const c of s.chords) if (c && c !== seq[seq.length - 1]) seq.push(c);
    s.loop = seq.slice(0, 12).join(' ');
    s.firstChord = s.chords.find((c) => c) ?? null;
    s.lastChord = [...s.chords].reverse().find((c) => c) ?? null;
    s.chordsPerBar = r3(1 + s.chords.filter((c, i) => i % 2 === 1 && c && s.chords[i - 1] && c !== s.chords[i - 1]).length / s.bars);
  }
  const chorusSecs = sections.filter((s) => s.label === 'chorus');
  const verseSecs = sections.filter((s) => s.label === 'verse');
  const midSecs = sections.filter((s) => s.label === 'mid');
  const preChorusEnd = sections.map((s, i) => (s.label === 'chorus' && i > 0 && sections[i - 1].label !== 'chorus' ? sections[i - 1] : null)).filter(Boolean);
  const sectionLens = hist(sections.filter((s) => ['verse', 'chorus', 'mid'].includes(s.label)).map((s) => s.bars));

  // ---- key changes: first chorus vs last chorus key, and per-section key pcs
  // KEY CHANGE, robustly: the pc histogram (voice+acc+bass, duration-weighted)
  // of one span against another, best transposition k by correlation; a lift
  // is reported only when k != 0 beats k = 0 by a margin (0.08 in correlation).
  const pcHist = (fromBar, bars) => { const h = Array(12).fill(0); for (const n of vOnsets.concat(acc, bass)) if (n.tick >= fromBar * barTicks && n.tick < (fromBar + bars) * barTicks) h[mod12(n.midi)] += n.dur; const t = h.reduce((a, b) => a + b, 0) || 1; return h.map((x) => x / t); };
  const corr = (a, b) => { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0; for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db || 1); };
  const bestShift = (A, B) => { let best = { k: 0, c: -2 }, c0 = 0; for (let k = 0; k < 12; k++) { const Bk = B.map((_, i) => B[mod12(i - k)]); const c = corr(A, Bk); if (k === 0) c0 = c; if (c > best.c) best = { k, c }; } return best.k !== 0 && best.c - c0 >= 0.08 ? best.k : 0; };
  const finalLift = chorusSecs.length >= 2 ? bestShift(pcHist(chorusSecs[0].startBar, chorusSecs[0].bars), pcHist(chorusSecs[chorusSecs.length - 1].startBar, chorusSecs[chorusSecs.length - 1].bars)) : null;
  const keyChanges = [];
  for (let i = 1; i < sections.length; i++) { const a = sections[i - 1], b = sections[i]; if (!['verse', 'mid', 'chorus'].includes(a.label) || !['verse', 'mid', 'chorus'].includes(b.label)) continue; const k = bestShift(pcHist(a.startBar, a.bars), pcHist(b.startBar, b.bars)); if (k) keyChanges.push({ atBar: b.startBar, semis: k, from: a.label, to: b.label }); }

  // ---- the hook: intro top line vs the sung chorus. Cells = 2-bar (rhythm
  // slots + interval string). Intro top line = the highest acc note per cluster.
  // three strictnesses: rhythm+intervals (exact cell), intervals only (the
  // tune at any rhythm), and the interval string with repeats collapsed (the
  // contour — a piano hook often re-strikes what the voice holds)
  const cellSigs = (ns, fromBar, toBar, kind = 'exact') => { const out = []; for (let b = fromBar; b + 1 < toBar; b += 2) { const cell = ns.filter((n) => n.tick >= b * barTicks && n.tick < (b + 2) * barTicks); if (cell.length < 3) continue; const rh = cell.map((n) => Math.round(((n.tick - b * barTicks) / barTicks) * 16)).join(','); const ivs = cell.slice(1).map((n, i) => n.midi - cell[i].midi); if (kind === 'exact') out.push(`${rh}|${ivs.join(',')}`); else if (kind === 'iv') out.push(ivs.join(',')); else out.push(ivs.filter((d) => d !== 0).join(',')); } return out; };
  const hookMatch = (line, fromBar, toBar, targetCells) => { const res = {}; for (const kind of ['exact', 'iv', 'contour']) { const cells = cellSigs(line, fromBar, toBar, kind); res[kind] = share(cells.filter((c) => targetCells[kind].has(c)).length, cells.length); res.cells = cells.length; } return res; };
  const accTop = clusters(acc).map((c) => ({ tick: c.tick, midi: c.top }));
  const cellSet = (secs, kind) => new Set(secs.flatMap((s) => cellSigs(vOnsets, s.startBar, s.startBar + s.bars, kind)));
  const chorusCells = { exact: cellSet(chorusSecs, 'exact'), iv: cellSet(chorusSecs, 'iv'), contour: cellSet(chorusSecs, 'contour') };
  const sungCells = { exact: cellSet(sections.filter((s) => ['verse', 'mid', 'chorus'].includes(s.label)), 'exact'), iv: cellSet(sections.filter((s) => ['verse', 'mid', 'chorus'].includes(s.label)), 'iv'), contour: cellSet(sections.filter((s) => ['verse', 'mid', 'chorus'].includes(s.label)), 'contour') };
  const introSec = sections[0]?.label === 'intro' ? sections[0] : null;
  const introHook = introSec ? { bars: introSec.bars, ...hookMatch(accTop, 0, introSec.bars, chorusCells), anySung: hookMatch(accTop, 0, introSec.bars, sungCells).contour, accCls: introSec.accCls, topNotesPerBar: r3(accTop.filter((n) => n.tick < introSec.bars * barTicks).length / introSec.bars), topMono: share(clusters(acc.filter((n) => n.tick < introSec.bars * barTicks)).filter((c) => c.size === 1).length, clusters(acc.filter((n) => n.tick < introSec.bars * barTicks)).length) } : null;
  // interludes: do they restate the chorus tune (or any sung cell) on the instrument?
  const interludes = sections.filter((s) => s.label === 'interlude').map((s) => ({ startBar: s.startBar, bars: s.bars, ...hookMatch(accTop, s.startBar, s.startBar + s.bars, chorusCells), anySung: hookMatch(accTop, s.startBar, s.startBar + s.bars, sungCells).contour, accCls: s.accCls }));

  // ---- layering arc
  const maxD = Math.max(...windows.map((x) => x.density));
  const arc = windows.map((x) => r3(x.density / (maxD || 1)));
  const breakdowns = windows.filter((x, i) => x.sung && i > 0 && x.density < 0.4 * maxD && windows.slice(0, i).some((y) => y.label === 'chorus')).map((x) => x.bar);
  const chorusLift = chorusSecs.length >= 2 ? r3(chorusSecs[chorusSecs.length - 1].density / (chorusSecs[0].density || 1)) : null;
  const introToFirstChorus = chorusSecs.length ? chorusSecs[0].startBar : null;

  // ---- chorus cell: the first phrase of the first chorus
  let chorusCell = null;
  if (chorusSecs.length) {
    const s = chorusSecs[0]; const t0 = s.startBar * barTicks;
    const notes = vOnsets.filter((n) => n.tick >= t0 - barTicks / 2 && n.tick < t0 + 2 * barTicks);
    if (notes.length >= 3) {
      const slot = (t) => Math.round((((t - t0) % barTicks + barTicks) % barTicks) / barTicks * 16) % 16;
      const ivs = notes.slice(1).map((n, i) => n.midi - notes[i].midi);
      const peakIdx = notes.map((n) => n.midi).indexOf(Math.max(...notes.map((n) => n.midi)));
      chorusCell = { notes: notes.length, startsBeforeDownbeat: notes[0].tick < t0, startSlot: slot(notes[0].tick), firstInterval: ivs[0] ?? null, openingRepeats: notes.slice(0, 4).filter((n, i) => i > 0 && n.midi === notes[i - 1].midi).length, peakPos: r3(peakIdx / Math.max(1, notes.length - 1)), peakMidi: notes[peakIdx].midi, span: Math.max(...notes.map((n) => n.midi)) - Math.min(...notes.map((n) => n.midi)), distinctPitches: new Set(notes.map((n) => n.midi)).size, offbeatShare: share(notes.filter((n) => slot(n.tick) % 4 !== 0).length, notes.length), firstChord: s.firstChord, startsOnChordTone: (() => { const seg = chordAtTick(Math.max(t0, notes[0].tick)); if (!seg || !seg.coverage) return null; return mod12(notes[0].midi - seg.rootPc); })() };
    }
  }

  // ---- voice vs bass at shared onsets
  const bassAt = new Map(); for (const n of bass) bassAt.set(Math.round(n.tick / 6), n);
  const vbIvs = []; for (const n of vOnsets) { const b = bassAt.get(Math.round(n.tick / 6)); if (b) vbIvs.push(mod12(n.midi - b.midi)); }
  const vbHist = hist(vbIvs, (d) => (d === 0 ? 'unison/8ve' : d === 3 || d === 4 ? '3rd' : d === 7 ? '5th' : d === 5 ? '4th' : d === 8 || d === 9 ? '6th' : d === 10 || d === 11 ? '7th' : d === 1 || d === 2 ? '2nd' : 'tritone'));

  // ---- acc class shares by section type
  const clsBy = (label, k) => hist(windows.filter((x) => x.label === label).map((x) => x[k].cls));
  return {
    file, label: r35.label, bpm: r35.bpm, key: r35.key, totalBars,
    declared,
    sections: sections.map(({ windows: _w, chords: _c, ...s }) => s),
    sectionLens, verseBars: median(verseSecs.map((s) => s.bars)), chorusBars: median(chorusSecs.map((s) => s.bars)),
    accClsByLabel: { verse: clsBy('verse', 'acc'), mid: clsBy('mid', 'acc'), chorus: clsBy('chorus', 'acc'), intro: clsBy('intro', 'acc'), interlude: clsBy('interlude', 'acc') },
    bassClsByLabel: { verse: clsBy('verse', 'bass'), mid: clsBy('mid', 'bass'), chorus: clsBy('chorus', 'bass'), intro: clsBy('intro', 'bass') },
    accTopMotion: { verse: r3(mean(windows.filter((x) => x.label === 'verse' && x.acc.top).map((x) => x.acc.top.stepShare ?? 0))), chorus: r3(mean(windows.filter((x) => x.label === 'chorus' && x.acc.top).map((x) => x.acc.top.stepShare ?? 0))) },
    accRhythmRepeat: r3(mean(windows.map((x) => x.acc.rhythmRepeat).filter((v) => v != null))),
    harmony: { verseLoop: verseSecs[0]?.loop ?? null, chorusLoop: chorusSecs[0]?.loop ?? null, sameLoop: verseSecs[0] && chorusSecs[0] ? verseSecs[0].loop === chorusSecs[0].loop : null, chorusFirstChord: chorusSecs[0]?.firstChord ?? null, verseFirstChord: verseSecs[0]?.firstChord ?? null, preChorusLastChord: preChorusEnd[0]?.lastChord ?? null, chorusChordsPerBar: r3(mean(chorusSecs.map((s) => s.chordsPerBar))), verseChordsPerBar: r3(mean(verseSecs.map((s) => s.chordsPerBar))) },
    keyChanges, finalChorusKeyLift: finalLift,
    introHook, interludes, arc, breakdowns, chorusDensityLift: chorusLift, introToFirstChorus,
    chorusCell, voiceVsBass: Object.fromEntries(Object.entries(vbHist).map(([k, v]) => [k, share(v, vbIvs.length)])),
    doubling: { verse: r3(mean(verseSecs.map((s) => s.accDoublesVoice).filter((v) => v != null))), chorus: r3(mean(chorusSecs.map((s) => s.accDoublesVoice).filter((v) => v != null))) },
    windows: windows.map((x) => ({ bar: x.bar, label: x.label, acc: x.acc.cls, bass: x.bass.cls, accProfile: x.acc, bassProfile: x.bass, d: x.density, vMed: x.vMed, key: x.keyPc != null ? PC_NAMES[x.keyPc] + (x.keyMode === 'minor' ? 'm' : '') : null, chords: x.chords })),
  };
}

// ------------------------------------------------------------------ main
const OUTF = join(DIR, '_analysis-r38.json');
let out;
if (SUMMARY_ONLY && existsSync(OUTF)) out = JSON.parse(readFileSync(OUTF, 'utf8'));
else {
  out = [];
  for (const r of R35) {
    if (r.skipped) { out.push({ file: r.file, skipped: r.skipped }); continue; }
    try { out.push(analyze(r)); } catch (e) { out.push({ file: r.file, skipped: e.message }); console.error(`FAIL ${r.file}: ${e.stack?.split('\n').slice(0, 3).join(' | ')}`); }
  }
  writeFileSync(OUTF, JSON.stringify(out, null, 1));
}
const ok = out.filter((s) => !s.skipped);
console.log(`analyzed ${ok.length} / ${out.length} -> ${OUTF}\n`);

// ---- summary
const merge = (hs) => { const m = {}; for (const h of hs) for (const [k, v] of Object.entries(h ?? {})) m[k] = (m[k] ?? 0) + v; return m; };
const pctTable = (h) => { const n = Object.values(h).reduce((a, b) => a + b, 0) || 1; return Object.entries(h).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / n).toFixed(0)}%`).join(' · '); };
console.log('INSTRUMENTS DECLARED: programs present in', ok.filter((s) => s.declared.some((d) => d.program != null)).length, 'of', ok.length, 'files; files with >1 velocity on any part:', ok.filter((s) => s.declared.some((d) => d.velocities > 1)).length, '; CC events:', ok.filter((s) => s.declared.some((d) => d.ccs > 0)).length, '; pitch bends:', ok.filter((s) => s.declared.some((d) => d.bends > 0)).length);
for (const lab of ['intro', 'verse', 'mid', 'chorus', 'interlude']) console.log(`ACC figure in ${lab.padEnd(9)} (windows): ${pctTable(merge(ok.map((s) => s.accClsByLabel[lab])))}`);
for (const lab of ['intro', 'verse', 'mid', 'chorus']) console.log(`BASS figure in ${lab.padEnd(9)} (windows): ${pctTable(merge(ok.map((s) => s.bassClsByLabel[lab])))}`);
console.log('acc top-voice step share verse/chorus (median):', median(ok.map((s) => s.accTopMotion.verse).filter((v) => v != null)), '/', median(ok.map((s) => s.accTopMotion.chorus).filter((v) => v != null)));
console.log('acc 2-bar rhythm repeat inside 4-bar windows (median):', median(ok.map((s) => s.accRhythmRepeat).filter((v) => v != null)));
console.log('section lengths (verse/mid/chorus runs, bars):', pctTable(merge(ok.map((s) => s.sectionLens))));
console.log('verse bars median', median(ok.map((s) => s.verseBars).filter((v) => v != null)), '· chorus bars median', median(ok.map((s) => s.chorusBars).filter((v) => v != null)));
console.log('intro bars median', median(ok.map((s) => s.introHook?.bars ?? 0)), '· bars to first chorus median', median(ok.map((s) => s.introToFirstChorus).filter((v) => v != null)));
const ih = ok.filter((s) => s.introHook && s.introHook.cells >= 2);
console.log(`intro top line vs the sung CHORUS (${ih.length} intros with >=2 cells): exact ${ih.filter((s) => s.introHook.exact >= 0.25).length} · intervals ${ih.filter((s) => s.introHook.iv >= 0.25).length} · contour ${ih.filter((s) => s.introHook.contour >= 0.25).length}; vs ANY sung cell (contour) ${ih.filter((s) => s.introHook.anySung >= 0.25).length}; intro top line mono share median ${median(ih.map((s) => s.introHook.topMono))}, notes/bar ${median(ih.map((s) => s.introHook.topNotesPerBar))}; intro acc class: ${pctTable(merge(ih.map((s) => ({ [s.introHook.accCls]: 1 }))))}`);
const il = ok.flatMap((s) => s.interludes).filter((x) => x.cells >= 2);
console.log(`interludes (${il.length}) restating the chorus: exact ${il.filter((x) => x.exact >= 0.25).length} · intervals ${il.filter((x) => x.iv >= 0.25).length} · contour ${il.filter((x) => x.contour >= 0.25).length}; any sung cell (contour) ${il.filter((x) => x.anySung >= 0.25).length}`);
// bass riff profile: what a 'riff' bass actually does
const riffW = ok.flatMap((s) => s.windows.filter((w) => w.bass === 'riff').map((w) => w.bassProfile)).filter(Boolean);
if (riffW.length) console.log(`bass 'riff' windows (${riffW.length}): onsets/bar median ${median(riffW.map((x) => x.onsetsPerBar))}, repeat ${median(riffW.map((x) => x.repShare))}, octave ${median(riffW.map((x) => x.octShare))}, 5th ${median(riffW.map((x) => x.fifthShare))}, step ${median(riffW.map((x) => x.stepShare))}, root ${median(riffW.map((x) => x.rootShare))}, on 8ths ${median(riffW.map((x) => x.on8))}`);
const syncW = ok.flatMap((s) => s.windows.filter((w) => w.acc === 'syncopated').map((w) => w.accProfile)).filter(Boolean);
if (syncW.length) console.log(`acc 'syncopated' windows (${syncW.length}): onsets/bar median ${median(syncW.map((x) => x.onsetsPerBar))}, tie-over share ${median(syncW.map((x) => x.antic))}, cluster ${median(syncW.map((x) => x.meanSize))}, dur beats ${median(syncW.map((x) => x.durBeats))}`);
console.log('doubling verse/chorus (median):', median(ok.map((s) => s.doubling.verse).filter((v) => v != null)), '/', median(ok.map((s) => s.doubling.chorus).filter((v) => v != null)));
for (const md of ['minor', 'major']) { const sub = ok.filter((s) => s.key.endsWith(md)); console.log(`[${md}, ${sub.length}] chorus opens on: ${pctTable(merge(sub.map((s) => (s.harmony.chorusFirstChord ? { [s.harmony.chorusFirstChord]: 1 } : {}))))}`); console.log(`[${md}] verse opens on: ${pctTable(merge(sub.map((s) => (s.harmony.verseFirstChord ? { [s.harmony.verseFirstChord]: 1 } : {}))))}`); console.log(`[${md}] pre-chorus ends on: ${pctTable(merge(sub.map((s) => (s.harmony.preChorusLastChord ? { [s.harmony.preChorusLastChord]: 1 } : {}))))}`); }
console.log('chorus opens off the tonic:', ok.filter((s) => s.harmony.chorusFirstChord && !/^(i|I)(7|\^7|6|sus)?$/.test(s.harmony.chorusFirstChord)).length, 'of', ok.filter((s) => s.harmony.chorusFirstChord).length, '· verse opens off the tonic:', ok.filter((s) => s.harmony.verseFirstChord && !/^(i|I)(7|\^7|6|sus)?$/.test(s.harmony.verseFirstChord)).length);
console.log('chorus opens on:', pctTable(merge(ok.map((s) => (s.harmony.chorusFirstChord ? { [s.harmony.chorusFirstChord]: 1 } : {})))));
console.log('verse opens on:', pctTable(merge(ok.map((s) => (s.harmony.verseFirstChord ? { [s.harmony.verseFirstChord]: 1 } : {})))));
console.log('pre-chorus ends on:', pctTable(merge(ok.map((s) => (s.harmony.preChorusLastChord ? { [s.harmony.preChorusLastChord]: 1 } : {})))));
console.log('chorus loop == verse loop:', ok.filter((s) => s.harmony.sameLoop === true).length, 'of', ok.filter((s) => s.harmony.sameLoop != null).length);
console.log('chords/bar verse / chorus (median):', median(ok.map((s) => s.harmony.verseChordsPerBar).filter((v) => v != null)), '/', median(ok.map((s) => s.harmony.chorusChordsPerBar).filter((v) => v != null)));
console.log('key changes between sung sections (robust): songs with any', ok.filter((s) => s.keyChanges.length).length, 'of', ok.length, '; final chorus vs first chorus:', pctTable(merge(ok.filter((s) => s.finalChorusKeyLift != null).map((s) => ({ [`+${s.finalChorusKeyLift}`]: 1 })))));
console.log('breakdowns (sung window under 40% of max density after a chorus): songs', ok.filter((s) => s.breakdowns.length).length, 'of', ok.length, '; final-chorus density / first-chorus density median', median(ok.map((s) => s.chorusDensityLift).filter((v) => v != null)));
const cc = ok.map((s) => s.chorusCell).filter(Boolean);
console.log(`chorus cell (${cc.length}): starts before the downbeat ${share(cc.filter((c) => c.startsBeforeDownbeat).length, cc.length)}; opening repeated notes median ${median(cc.map((c) => c.openingRepeats))}; first interval ${pctTable(hist(cc.map((c) => Math.abs(c.firstInterval ?? 0)), (d) => (d === 0 ? 'repeat' : d <= 2 ? 'step' : d <= 4 ? '3rd' : d <= 7 ? '4-5' : 'wide')))}; peak position median ${median(cc.map((c) => c.peakPos))}; offbeat share median ${median(cc.map((c) => c.offbeatShare))}; distinct pitches median ${median(cc.map((c) => c.distinctPitches))}; starts on chord degree ${pctTable(hist(cc.map((c) => c.startsOnChordTone).filter((v) => v != null)))}`);
console.log('voice vs bass at shared onsets (pooled):', pctTable(merge(ok.map((s) => Object.fromEntries(Object.entries(s.voiceVsBass).map(([k, v]) => [k, Math.round(v * 100)]))))));
if (!SUMMARY_ONLY) for (const s of ok) console.log(`  ${s.label.song.padEnd(30)} ${String(s.bpm).padStart(3)} ${s.key.padEnd(9)} form: ${s.sections.map((x) => `${x.label[0]}${x.bars}`).join(' ')} | verse ${s.harmony.verseLoop ?? '-'} | chorus ${s.harmony.chorusLoop ?? '-'} | acc v/c ${top(s.accClsByLabel.verse)}/${top(s.accClsByLabel.chorus)} bass ${top(s.bassClsByLabel.verse)}/${top(s.bassClsByLabel.chorus)}`);
