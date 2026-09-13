// r40 — his "serious" reference set (2026-09-13): attack on titan, Homura,
// Muzan vs Hashiras, Zoltraak, The raising fighting spirit, Solo Leveling
// ReawakeR, A world where the sun never rises, Detach (piano+organ), and the
// two Interstellar arrangements from the r34 pack. His ask: "all of our
// energetic songs sound like 'light energetic' … i just want more serious
// prompts to have more serious vibes … analyze [these] for trends in the
// melody for how it sounds serious, and all the different layers (in attack
// on titan you can literally see them come in one by one) … the main
// theme/voice has a very strong, slow ish theme when it's the main thing, but
// it has a lot of layered support … the left hand chord that plays by itself
// after the main theme plays at the beginning of attack on titan … where the
// top left hand note hits and then is raised by a note then repeat".
//
// These are two-hand piano transcriptions (one AoT file has a third track,
// Detach has six), so LAYERS are inferred, never declared: a layer here is a
// register band + an onset stream, and "layers enter one by one" is measured
// as the active-band / polyphony / onset arc over 4-bar windows. Instrument
// identity is unknowable from the files (his "i know you cant see the
// instrument info") and is NOT reported as a measurement.
//
// ANALYSIS ONLY (D95): nothing here feeds src/lib; the rules are hand-authored
// from the read-out in research/serious-r40.md.
//
// Run: node scripts/analyze-serious-r40.mjs [--json]
//   -> audios/serious-r40/_analysis.json (+ printed summary)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chordAt, chordTimeline, solveKeyKS } from '../src/ingest/piano.js';
import { readCorpusMidi, extractParts, PC_NAMES } from './corpus-midi.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = join(ROOT, 'audios', 'serious-r40');
const mod12 = (x) => ((x % 12) + 12) % 12;
const r2 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 100) / 100);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const median = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const share = (n, d) => (d ? r2(n / d) : null);
const hist = (arr, f = (x) => x) => { const h = {}; for (const x of arr) { const k = f(x); if (k == null) continue; h[k] = (h[k] ?? 0) + 1; } return h; };
const topK = (h, k = 5) => Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, k).map(([a, b]) => `${a}:${b}`).join(' ');
const DEG = { 0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII' };
const numeral = (semis, q) => { const n = DEG[semis]; return /^m/.test(q) && q !== 'maj7' ? n.toLowerCase() + q.slice(1) : q === 'o' || q === 'dim' ? n.toLowerCase() + '°' : n + (q === 'major' || q === '' ? '' : q); };

// onset clusters: notes within `tol` ticks are one strike
function clusters(notes, tol) {
  const out = [];
  for (const n of [...notes].sort((a, b) => a.tick - b.tick || b.midi - a.midi)) {
    const last = out[out.length - 1];
    if (last && n.tick - last.tick <= tol) last.notes.push(n); else out.push({ tick: n.tick, notes: [n] });
  }
  for (const c of out) c.notes.sort((a, b) => b.midi - a.midi);
  return out;
}

function analyze(file) {
  const mid = readCorpusMidi(join(DIR, file));
  const parts = extractParts(mid).filter((p) => !p.isDrum);
  const [num, den] = mid.timeSig;
  const barTicks = mid.ppq * 4 * (num / den);
  const beat = mid.ppq;
  const g16 = barTicks / 16;
  const tol = Math.max(2, Math.round(g16 / 3));
  const all = parts.flatMap((p) => p.notes);
  const totalBars = Math.ceil(Math.max(...all.map((n) => n.tick + n.dur)) / barTicks);
  // hands: the part with the highest median is the UPPER (melody-carrying) hand
  const withMed = parts.map((p) => ({ p, med: median(p.notes.map((n) => n.midi)) })).sort((a, b) => b.med - a.med);
  const upper = withMed[0].p;
  const lowers = withMed.slice(1).map((x) => x.p);
  const lowNotes = lowers.flatMap((p) => p.notes);

  // ---- key + harmony
  let key = solveKeyKS(all);
  let tl = chordTimeline(all, barTicks, totalBars, { key });
  { // the KS solver reads the relative major for a minor theme (AoT: E Aeolian read as C major, tonic neither C nor A).
    // Relabel: among the solved key's SEVEN diatonic pcs, the tonic is the pc most often struck as the LOWEST note on a bar downbeat;
    // its mode is major when the scale carries a major third above it, else minor.
    const scale = key.mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
    const pcs = scale.map((d) => mod12(key.tonicPc + d));
    const roots = hist(Array.from({ length: totalBars }, (_, b) => { const on = all.filter((n) => Math.abs(n.tick - b * barTicks) <= tol); return on.length ? mod12(Math.min(...on.map((n) => n.midi))) : null; }));
    const best = pcs.map((pc) => ({ pc, n: roots[pc] ?? 0 })).sort((a, b) => b.n - a.n)[0];
    if (best && best.pc !== key.tonicPc && best.n > (roots[key.tonicPc] ?? 0)) {
      const mode = pcs.includes(mod12(best.pc + 4)) ? 'major' : 'minor';
      key = { ...key, tonicPc: best.pc, mode, relabelled: true }; tl = chordTimeline(all, barTicks, totalBars, { key });
    }
  }
  const chordAtTick = (t) => chordAt(tl, Math.floor(t / (barTicks / 2)));
  const barChords = [];
  for (let b = 0; b < totalBars; b++) {
    const segs = new Set();
    for (let hw = b * 2; hw < b * 2 + 2; hw++) { const c = chordAt(tl, hw); if (c) segs.add(`${c.rootPc}:${c.quality}`); }
    const c0 = chordAt(tl, b * 2);
    barChords.push({ bar: b, distinct: segs.size, numeral: c0 ? numeral(mod12(c0.rootPc - key.tonicPc), c0.quality) : '?', q: c0?.quality ?? '?' });
  }
  const loops4 = hist(barChords.slice(0, totalBars - 3).map((_, i) => barChords.slice(i, i + 4).map((c) => c.numeral).join(' ')).filter((_, i) => i % 4 === 0));
  const qualities = hist(barChords.map((c) => c.q));
  // leading tone vs subtonic (minor keys): share of pitch weight on 7 vs b7, and 6 vs b6
  const pcw = Array(12).fill(0); for (const n of all) pcw[mod12(n.midi - key.tonicPc)] += n.dur;
  const tot = pcw.reduce((a, b) => a + b, 0);
  const degShare = pcw.map((w) => r2(w / tot));

  // ---- skyline melody from the upper hand
  const upC = clusters(upper.notes, tol);
  let sky = upC.map((c, i) => { const n = c.notes[0]; const next = upC[i + 1]?.tick ?? Infinity; return { tick: c.tick, midi: n.midi, dur: Math.min(n.dur, next - c.tick), vel: n.velocity, size: c.notes.length, below: c.notes.slice(1) }; });
  const upBar0 = Array(totalBars).fill(0); for (const c of upC) upBar0[Math.min(totalBars - 1, Math.floor(c.tick / barTicks))]++;
  const heldBar = Array(totalBars).fill(0); for (const s of sky) if (s.dur >= beat - 2) heldBar[Math.min(totalBars - 1, Math.floor(s.tick / barTicks))]++;
  const themeBar = Array.from({ length: totalBars }, (_, b) => upBar0[b] > 0 && (heldBar[b] > 0 || upBar0[b] <= 6));
  const skyAll = sky;
  sky = sky.filter((s) => themeBar[Math.min(totalBars - 1, Math.floor(s.tick / barTicks))] && s.dur >= g16 * 2 - 2);
  const themeBars = themeBar.filter(Boolean).length;
  const durs16 = sky.map((s) => Math.round(s.dur / g16));
  const ivs = sky.slice(1).map((s, i) => s.midi - sky[i].midi);
  const absIv = ivs.map(Math.abs);
  const slot = (t) => Math.round((t % barTicks) / g16) % 16;
  const skyTheme = skyAll.filter((s) => themeBar[Math.min(totalBars - 1, Math.floor(s.tick / barTicks))]);
  const phrases = []; { let cur = [skyTheme[0]]; for (let i = 1; i < skyTheme.length; i++) { const gap = skyTheme[i].tick - (skyTheme[i - 1].tick + skyTheme[i - 1].dur); if (gap >= beat || skyTheme[i].tick - skyTheme[i - 1].tick >= 2 * barTicks) { phrases.push(cur); cur = []; } cur.push(skyTheme[i]); } phrases.push(cur); }
  const melody = {
    themeBars, themeShare: share(themeBars, totalBars), notes: sky.length, notesPerBar: r2(sky.length / Math.max(1, themeBars)),
    range: [Math.min(...sky.map((s) => s.midi)), Math.max(...sky.map((s) => s.midi))], median: median(sky.map((s) => s.midi)),
    durMedianBeats: r2(median(sky.map((s) => s.dur)) / beat),
    durShareGE1beat: share(sky.filter((s) => s.dur >= beat - 2).length, sky.length),
    durShareGE2beat: share(sky.filter((s) => s.dur >= 2 * beat - 2).length, sky.length),
    durShareLE16th: share(sky.filter((s) => s.dur <= g16 + 2).length, sky.length),
    dur16Hist: topK(hist(durs16), 8),
    dottedShare: share(durs16.filter((d) => d === 3 || d === 6 || d === 12).length, durs16.length),
    stepShare: share(absIv.filter((x) => x >= 1 && x <= 2).length, absIv.length),
    repeatShare: share(absIv.filter((x) => x === 0).length, absIv.length),
    leapGE5Share: share(absIv.filter((x) => x >= 5).length, absIv.length),
    leapGE7Share: share(absIv.filter((x) => x >= 7).length, absIv.length),
    ivHist: topK(hist(ivs), 10),
    onsetSlotHist: topK(hist(sky.map((s) => slot(s.tick))), 8),
    onDownbeatShare: share(sky.filter((s) => slot(s.tick) === 0).length, sky.length),
    onBeatShare: share(sky.filter((s) => slot(s.tick) % 4 === 0).length, sky.length),
    offEighthShare: share(sky.filter((s) => slot(s.tick) % 2 === 1).length, sky.length),
    phraseCount: phrases.length, phraseLenBarsMedian: r2(median(phrases.map((p) => (p[p.length - 1].tick + p[p.length - 1].dur - p[0].tick) / barTicks))),
    phraseStartSlotHist: topK(hist(phrases.map((p) => slot(p[0].tick))), 5),
    phraseFirstIv: topK(hist(phrases.filter((p) => p.length > 1).map((p) => p[1].midi - p[0].midi)), 6),
    phrasePeakPos: r2(mean(phrases.filter((p) => p.length > 2).map((p) => { let k = 0; p.forEach((s, i) => { if (s.midi > p[k].midi) k = i; }); return k / (p.length - 1); }))),
    outOfKeyShare: share(sky.filter((s) => !inKey(s.midi, key)).length, sky.length),
    // chord-tone share vs the sounding chord
    chordToneShare: share(sky.filter((s) => { const c = chordAtTick(s.tick); return c && chordPcs(c).has(mod12(s.midi - c.rootPc)); }).length, sky.length),
  };
  // under-melody support in the upper hand (his "harmony for the voice")
  const dyads = sky.filter((s) => s.below.length).map((s) => s.midi - s.below[0].midi);
  const clusterSizeHist = hist(sky.map((s) => s.size));
  const upperSupport = {
    strikesWithSupport: share(dyads.length, sky.length),
    clusterSizeHist: topK(clusterSizeHist, 5),
    intervalBelowHist: topK(hist(dyads, (d) => d === 12 ? 'oct' : d === 3 || d === 4 ? '3rd' : d === 8 || d === 9 ? '6th' : d === 5 ? '4th' : d === 7 ? '5th' : d === 1 || d === 2 ? '2nd' : d === 10 || d === 11 ? '7th' : d > 12 ? '>oct' : d), 6),
  };

  // ---- lower hand
  const loC = clusters(lowNotes, tol);
  const loBarOnsets = Array(totalBars).fill(0); for (const c of loC) loBarOnsets[Math.min(totalBars - 1, Math.floor(c.tick / barTicks))]++;
  const octDyads = loC.filter((c) => c.notes.length >= 2 && c.notes.some((n) => c.notes.some((m) => n.midi - m.midi === 12))).length;
  const loTop = loC.map((c) => c.notes[0].midi);
  const loTopIv = loTop.slice(1).map((m, i) => m - loTop[i]);
  const loBottom = loC.map((c) => c.notes[c.notes.length - 1].midi);
  const lower = {
    onsetsPerBar: r2(loC.length / totalBars),
    range: lowNotes.length ? [Math.min(...lowNotes.map((n) => n.midi)), Math.max(...lowNotes.map((n) => n.midi))] : null,
    bottomMedian: median(loBottom), topMedian: median(loTop),
    clusterSizeHist: topK(hist(loC.map((c) => c.notes.length)), 5),
    octaveDyadShare: share(octDyads, loC.length),
    topVoiceIvHist: topK(hist(loTopIv), 8),
    topVoiceStepUpShare: share(loTopIv.filter((x) => x === 1 || x === 2).length, loTopIv.length),
    slotHist: topK(hist(loC.map((c) => slot(c.tick))), 8),
  };
  // the lower hand ALONE (his AoT "left hand chord that plays by itself")
  const upBar = Array(totalBars).fill(0); for (const c of upC) upBar[Math.min(totalBars - 1, Math.floor(c.tick / barTicks))]++;
  const aloneBars = []; for (let b = 0; b < totalBars; b++) if (!upBar[b] && loBarOnsets[b]) aloneBars.push(b);
  const aloneRuns = []; for (const b of aloneBars) { const r = aloneRuns[aloneRuns.length - 1]; if (r && r.end === b) r.end = b + 1; else aloneRuns.push({ start: b, end: b + 1 }); }
  const cellOf = (b, part) => clusters(part, tol).filter((c) => c.tick >= b * barTicks && c.tick < (b + 1) * barTicks).map((c) => `${(c.tick % barTicks) / beat}:${c.notes.map((n) => n.midi).join('.')}`).join(' ');
  const aloneCells = aloneRuns.slice(0, 3).map((r) => ({ bars: `${r.start}-${r.end - 1}`, cells: Array.from({ length: Math.min(4, r.end - r.start) }, (_, i) => cellOf(r.start + i, lowNotes)) }));

  // ---- ostinato / repetition: longest exact and transposed bar-repeat runs per hand
  const runs = (notes) => {
    const cells = []; const cellsRel = [];
    for (let b = 0; b < totalBars; b++) {
      const cs = clusters(notes, tol).filter((c) => c.tick >= b * barTicks && c.tick < (b + 1) * barTicks);
      const lo = cs.length ? Math.min(...cs.flatMap((c) => c.notes.map((n) => n.midi))) : 0;
      cells.push(cs.map((c) => `${slot(c.tick)}:${c.notes.map((n) => n.midi).join('.')}`).join(' '));
      cellsRel.push(cs.map((c) => `${slot(c.tick)}:${c.notes.map((n) => n.midi - lo).join('.')}`).join(' '));
    }
    const longest = (arr) => { let best = 0, cur = 1; for (let i = 1; i < arr.length; i++) { if (arr[i] && arr[i] === arr[i - 1]) cur++; else cur = 1; best = Math.max(best, cur); } return best; };
    const distinct = new Set(cellsRel.filter(Boolean)).size;
    const nonEmpty = cellsRel.filter(Boolean).length;
    const h = hist(cellsRel.filter(Boolean)); const [topCell, topN] = Object.entries(h).sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
    return { longestExactRun: longest(cells), longestShapeRun: longest(cellsRel), distinctShapes: distinct, bars: nonEmpty, topShapeBars: topN, topShapeReuse: share(topN, nonEmpty), topShape: topCell.slice(0, 80) };
  };

  // ---- per-bar layer profile
  const bars = [];
  for (let b = 0; b < totalBars; b++) {
    const t0 = b * barTicks, t1 = t0 + barTicks;
    const sounding = all.filter((n) => n.tick < t1 && n.tick + n.dur > t0);
    let poly = 0; for (let s = 0; s < 16; s++) { const t = t0 + s * g16 + 1; poly += sounding.filter((n) => n.tick <= t && n.tick + n.dur > t).length; }
    const onsets = all.filter((n) => n.tick >= t0 && n.tick < t1);
    const bands = new Set(onsets.map((n) => Math.floor(n.midi / 12) - 1));
    const mel = skyAll.filter((s) => s.tick >= t0 && s.tick < t1);
    bars.push({ b, poly: r2(poly / 16), onsets: onsets.length, up: upBar[b], lo: loBarOnsets[b], bands: [...bands].sort().join(''), span: onsets.length ? Math.max(...onsets.map((n) => n.midi)) - Math.min(...onsets.map((n) => n.midi)) : 0, vel: r2(mean(onsets.map((n) => n.velocity))), melHeld: mel.filter((s) => s.dur >= beat - 2).length, chord: barChords[b].numeral, hr: barChords[b].distinct });
  }
  const wins = [];
  for (let w = 0; w < totalBars; w += 4) {
    const bs = bars.slice(w, w + 4);
    wins.push({ bar: w, poly: r2(mean(bs.map((x) => x.poly))), onsets: r2(mean(bs.map((x) => x.onsets))), up: r2(mean(bs.map((x) => x.up))), lo: r2(mean(bs.map((x) => x.lo))), bands: [...new Set(bs.flatMap((x) => x.bands.split('')))].sort().join(''), span: Math.round(mean(bs.map((x) => x.span))), vel: r2(mean(bs.map((x) => x.vel).filter((v) => v != null))), melHeld: bs.reduce((a, x) => a + x.melHeld, 0), chords: bs.map((x) => x.chord).join(' '), hr: r2(mean(bs.map((x) => x.hr))) });
  }

  const roleSet = (w) => { const bs = bars.slice(w, w + 4); const on = all.filter((n) => n.tick >= w * barTicks && n.tick < (w + 4) * barTicks); const cnt = (lo, hi) => on.filter((n) => n.midi >= lo && n.midi < hi).length / 4; const r = []; if (cnt(0, 48) >= 1) r.push('bass'); if (cnt(48, 60) >= 1) r.push('tenor'); if (cnt(60, 72) >= 1) r.push('alto'); if (cnt(72, 84) >= 1) r.push('sop'); if (cnt(84, 128) >= 1) r.push('top'); if (mean(bs.map((x) => x.lo)) >= 8) r.push('MOTOR'); if (bs.some((x) => themeBar[x.b])) r.push('THEME'); if (cnt(0, 48) >= 1 && on.filter((n) => n.midi < 48).length / 4 >= 6) r.push('bass8ths'); return r; };
  const events = []; let prev = new Set();
  for (let w = 0; w < totalBars; w += 4) { const cur = new Set(roleSet(w)); const add = [...cur].filter((x) => !prev.has(x)); const drop = [...prev].filter((x) => !cur.has(x)); if (add.length || drop.length) events.push(`b${w}:${add.map((x) => '+' + x).join('')}${drop.map((x) => '-' + x).join('')}`); prev = cur; }
  return {
    events: events.join(' '),
    file, bpm: r2(mid.bpm), timeSig: `${num}/${den}`, bars: totalBars, parts: parts.map((p) => ({ name: p.name, n: p.notes.length, med: median(p.notes.map((n) => n.midi)) })),
    key: `${PC_NAMES[key.tonicPc]} ${key.mode}${key.relabelled ? ' (relabelled from relative)' : ''}`, keyMargin: r2(key.margin), degreeShare: degShare,
    harmony: { qualities: topK(qualities, 6), loops4: topK(loops4, 4), distinctChordsPerBar: r2(mean(barChords.map((c) => c.distinct))), leadingToneShare: degShare[11], subtonicShare: degShare[10], sixthShare: degShare[9], flatSixthShare: degShare[8] },
    melody, upperSupport, lower, aloneRuns: aloneRuns.map((r) => `${r.start}-${r.end - 1}`).join(','), aloneCells,
    upperRepeat: runs(upper.notes), lowerRepeat: runs(lowNotes),
    polyOverall: r2(mean(bars.map((x) => x.poly))), wins,
  };
}
function inKey(midi, key) { const rel = mod12(midi - key.tonicPc); return key.mode === 'major' ? [0, 2, 4, 5, 7, 9, 11].includes(rel) : [0, 2, 3, 5, 7, 8, 9, 10, 11].includes(rel); }
function chordPcs(c) { const q = c.quality; const base = /^m|min|dim|o/.test(q) ? [0, 3, 7] : /sus/.test(q) ? [0, 5, 7] : [0, 4, 7]; if (/7|9/.test(q)) base.push(/maj7|\^7/.test(q) ? 11 : 10); if (/9/.test(q)) base.push(2); if (/dim|o/.test(q)) base[2] = 6; return new Set(base); }

const files = readdirSync(DIR).filter((f) => f.endsWith('.mid')).sort();
const out = [];
for (const f of files) {
  try { out.push(analyze(f)); } catch (e) { out.push({ file: f, error: String(e.stack ?? e) }); }
}
writeFileSync(join(DIR, '_analysis.json'), JSON.stringify(out, null, 1));
if (process.argv.includes('--json')) process.exit(0);
for (const a of out) {
  if (a.error) { console.log(`\n== ${a.file}: ERROR ${a.error.slice(0, 300)}`); continue; }
  console.log(`\n== ${a.file}  ${a.bpm} bpm ${a.timeSig} ${a.bars} bars  key ${a.key} (margin ${a.keyMargin})  poly ${a.polyOverall}`);
  console.log(`   parts: ${a.parts.map((p) => `${p.name}[n${p.n} med${p.med}]`).join(' | ')}`);
  console.log(`   layer events: ${a.events}`);
  console.log(`   harmony: ${JSON.stringify(a.harmony)}`);
  console.log(`   melody: ${JSON.stringify(a.melody)}`);
  console.log(`   upperSupport: ${JSON.stringify(a.upperSupport)}`);
  console.log(`   lower: ${JSON.stringify(a.lower)}`);
  console.log(`   aloneRuns: ${a.aloneRuns || 'none'}  ${JSON.stringify(a.aloneCells)}`);
  console.log(`   repeat upper ${JSON.stringify(a.upperRepeat)}\n   repeat lower ${JSON.stringify(a.lowerRepeat)}`);
  console.log('   bar  poly onsets up   lo   bands   span vel  held chords');
  for (const w of a.wins) console.log(`   ${String(w.bar).padStart(3)}  ${String(w.poly).padEnd(4)} ${String(w.onsets).padEnd(6)} ${String(w.up).padEnd(4)} ${String(w.lo).padEnd(4)} ${w.bands.padEnd(7)} ${String(w.span).padEnd(4)} ${String(w.vel).padEnd(4)} ${String(w.melHeld).padEnd(4)} ${w.chords} (hr ${w.hr})`);
}
