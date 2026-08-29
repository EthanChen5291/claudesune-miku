// r22 — deep read of the 22 MIDI files Ethan hand-picked on 2026-08-29.
//
// His ask: "analyze existing patterns of individual instruments and what they
// do and contribute to that song with their specific intervals, rhythms, tone,
// and timing. and then how these combine in the song with respect to the chord
// progression and how it gets away with it, and how it's layered."
//
// This is a HAND-PICKED set, not a corpus sweep. D95's rule applies with full
// force: nothing here is counted into src/lib. What comes out is a written
// analysis, and any technique that survives it is AUTHORED by hand into the
// engine as an opt — the same path the desert tropes and the reel devices took.
//
// Deliberately separate from scripts/corpus-features.mjs: that file answers
// "what does game music do on average", which is a different question from
// "what are these twenty-two songs doing with their layers".
//
// Run: node scripts/analyze-manual-r22.mjs

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCorpusMidi, extractParts, GM_NAMES, GM_FAMILY, DRUM_ROLE, PC_NAMES } from './corpus-midi.mjs';
import { detectKey, labelChord, classifyParts } from './corpus-features.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = join(ROOT, 'audios', 'manual-r22');
const mod12 = (x) => ((x % 12) + 12) % 12;
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (x) => (x * 100).toFixed(1) + '%';

// ---------------------------------------------------------------- per part

/** onset positions folded into one bar, on a 16th grid */
function rhythmProfile(notes, barTicks) {
  const step = barTicks / 16;
  const hist = new Array(16).fill(0);
  for (const n of notes) hist[Math.round((n.tick % barTicks) / step) % 16]++;
  const total = hist.reduce((a, b) => a + b, 0) || 1;
  const onGrid8 = hist.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / total;
  const onBeat = hist.filter((_, i) => i % 4 === 0).reduce((a, b) => a + b, 0) / total;
  const offBeat16 = hist.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) / total;
  // how many DISTINCT grid slots the part ever uses — a pulse uses few
  const slots = hist.filter((x) => x > 0).length;
  return { hist, onBeat, onGrid8, offBeat16, slots };
}

/** melodic behaviour of one line: what its intervals actually do */
function melodicProfile(notes) {
  // one pitch per onset (topmost, so a chordal part reads by its top voice)
  const byTick = new Map();
  for (const n of notes) byTick.set(n.tick, Math.max(byTick.get(n.tick) ?? -1, n.midi));
  const seq = [...byTick.entries()].sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  let rep = 0, step = 0, leap = 0, big = 0, dirChanges = 0, lastDir = 0;
  const ivs = [];
  for (let i = 1; i < seq.length; i++) {
    const d = seq[i] - seq[i - 1];
    ivs.push(Math.abs(d));
    if (d === 0) rep++; else if (Math.abs(d) <= 2) step++; else if (Math.abs(d) <= 7) leap++; else big++;
    const dir = Math.sign(d);
    if (dir && lastDir && dir !== lastDir) dirChanges++;
    if (dir) lastDir = dir;
  }
  const moves = rep + step + leap + big || 1;
  return {
    n: seq.length, rep: rep / moves, step: step / moves, leap: leap / moves, big: big / moves,
    dirChangeRate: dirChanges / (moves || 1), medIv: median(ivs), range: seq.length ? Math.max(...seq) - Math.min(...seq) : 0,
  };
}

// ------------------------------------------------------------ pair relations

function pairRelation(a, b, barTicks) {
  const tol = barTicks / 32;
  const aT = [...new Set(a.notes.map((n) => n.tick))].sort((x, y) => x - y);
  const bT = [...new Set(b.notes.map((n) => n.tick))].sort((x, y) => x - y);
  const bSet = new Set(bT.map((t) => Math.round(t / tol)));
  const co = aT.filter((t) => bSet.has(Math.round(t / tol))).length;
  const coRate = co / (Math.min(aT.length, bT.length) || 1);

  // top pitch of each part at each SHARED onset, for register gap and motion
  const topAt = (p, t) => {
    const on = p.notes.filter((n) => n.tick <= t + tol && n.tick + n.dur > t + tol);
    return on.length ? Math.max(...on.map((n) => n.midi)) : null;
  };
  const shared = aT.filter((t) => bSet.has(Math.round(t / tol)));
  const gaps = [], pairsSeq = [];
  for (const t of shared) {
    const pa = topAt(a, t), pb = topAt(b, t);
    if (pa == null || pb == null) continue;
    gaps.push(pa - pb);
    pairsSeq.push([pa, pb]);
  }
  // MOTION between consecutive shared onsets — the layering question that
  // "do they strike together" cannot answer
  let par = 0, sim = 0, obl = 0, contra = 0;
  for (let i = 1; i < pairsSeq.length; i++) {
    const da = pairsSeq[i][0] - pairsSeq[i - 1][0];
    const db = pairsSeq[i][1] - pairsSeq[i - 1][1];
    if (da === 0 && db === 0) continue;
    if (da === 0 || db === 0) obl++;
    else if (Math.sign(da) !== Math.sign(db)) contra++;
    else if (da === db) par++;
    else sim++;
  }
  const motions = par + sim + obl + contra || 1;

  // vertical interval CLASS histogram at shared onsets
  const ic = new Array(12).fill(0);
  for (const g of gaps) ic[mod12(g)]++;
  const icTotal = ic.reduce((x, y) => x + y, 0) || 1;

  // ECHO — is b a constant-lag copy of a?
  let echo = null;
  for (const lagBeats of [0.25, 0.5, 0.75, 1, 1.5, 2]) {
    const lag = Math.round(lagBeats * (barTicks / 4));
    const hit = aT.filter((t) => bSet.has(Math.round((t + lag) / tol))).length;
    const r = hit / (aT.length || 1);
    if (r > 0.6 && (!echo || r > echo.rate)) echo = { lagBeats, rate: r };
  }

  // DENSITY INVERSION — when a rests, is b busier?
  const bars = Math.max(1, Math.ceil(Math.max(...[...a.notes, ...b.notes].map((n) => n.tick)) / barTicks));
  const dens = (p) => { const d = new Array(bars).fill(0); for (const n of p.notes) { const i = Math.floor(n.tick / barTicks); if (i < bars) d[i]++; } return d; };
  const da = dens(a), db = dens(b);
  const aQuiet = [], aBusy = [];
  const aMed = median(da.filter((x) => x > 0));
  for (let i = 0; i < bars; i++) { if (da[i] < aMed) aQuiet.push(db[i]); else if (da[i] > aMed) aBusy.push(db[i]); }
  const inversion = (mean(aBusy) > 0) ? mean(aQuiet) / mean(aBusy) : null;

  return {
    coRate, n: shared.length,
    medGap: median(gaps),
    motion: { parallel: par / motions, similar: sim / motions, oblique: obl / motions, contrary: contra / motions },
    icShare: ic.map((x) => x / icTotal),
    echo, inversion,
  };
}

// ---------------------------------------------------------------- one file

function analyze(path, name) {
  const mid = readCorpusMidi(path);
  const parts = extractParts(mid);
  const [num, den] = mid.timeSig;
  const barTicks = Math.round(mid.ppq * 4 * (num / den));
  const totalBars = Math.max(1, Math.ceil(mid.endTick / barTicks));
  const pitched = parts.filter((p) => !p.isDrum);
  const drums = parts.filter((p) => p.isDrum);
  const { feats } = classifyParts(parts, barTicks);
  const roleOf = new Map(feats.map((f) => [f.key, f.role]));

  const key = detectKey(mid.notes.filter((n) => n.channel !== 9), mid.ppq);

  // ---- chord per bar, from everything sounding
  const chords = [];
  for (let b = 0; b < totalBars; b++) {
    const t0 = b * barTicks, t1 = t0 + barTicks;
    const w = new Array(12).fill(0);
    let lowest = null;
    const pcs = new Set();
    for (const n of mid.notes) {
      if (n.channel === 9) continue;
      const s = Math.max(n.tick, t0), e = Math.min(n.tick + n.dur, t1);
      if (e <= s) continue;
      w[mod12(n.midi)] += e - s;
      pcs.add(mod12(n.midi));
      if (lowest == null || n.midi < lowest) lowest = n.midi;
    }
    const lab = labelChord(w, lowest == null ? null : mod12(lowest), pcs.size);
    // labelChord returns {root, quality, tones} — it has no `name`, and reading
    // one gave `undefined !== undefined` on every comparison, which reported
    // exactly ONE chord change in all 22 files. Name it here.
    chords.push(lab ? { ...lab, name: PC_NAMES[lab.root] + lab.quality } : null);
  }

  // ---- the LAYER ARC: how many pitched parts sound in each bar
  const arc = new Array(totalBars).fill(0);
  for (const p of pitched) for (const b of new Set(p.notes.map((n) => Math.floor(n.tick / barTicks)))) if (b < totalBars) arc[b]++;

  // ---- THE CORE SECTION (his caution: "some songs are abstract or have
  // specific quirks - just analyze in terms of sections or the 'normal'
  // sections where it's a good part of the song basically").
  //
  // Whole-file aggregates lie about exactly the files he means. The Sm4sh menu
  // is a MEDLEY — fifteen parts each covering 3% of the file, because each one
  // belongs to a different game's theme. Averaging that with a Sonic zone
  // measures the format, not the music. So every statistic below is taken
  // inside one window: the longest stretch where the SET of sounding parts
  // holds still and the texture is at full strength.
  const barSet = [];
  for (let b = 0; b < totalBars; b++) barSet.push(new Set());
  for (const p of pitched) for (const n of p.notes) { const b = Math.floor(n.tick / barTicks); if (b < totalBars) barSet[b].add(p.key); }
  const jac = (x, y) => { if (!x.size && !y.size) return 1; let inter = 0; for (const v of x) if (y.has(v)) inter++; return inter / (x.size + y.size - inter || 1); };
  const W = Math.min(16, Math.max(8, Math.floor(totalBars / 4)));
  const peak = Math.max(...arc);
  let core = { start: 0, len: Math.min(W, totalBars), score: -1 };
  for (let st = 0; st + W <= totalBars; st++) {
    let stab = 0;
    for (let i = st + 1; i < st + W; i++) stab += jac(barSet[i - 1], barSet[i]);
    stab /= (W - 1);
    const strength = arc.slice(st, st + W).reduce((a, b) => a + b, 0) / (W * (peak || 1));
    const score = stab * 0.6 + strength * 0.4;
    if (score > core.score) core = { start: st, len: W, score, stability: stab, strength };
  }
  const coreT0 = core.start * barTicks, coreT1 = (core.start + core.len) * barTicks;
  const inCore = (n) => n.tick >= coreT0 && n.tick < coreT1;
  // parts that never sound in the core are NOT this song's normal texture
  const CORE_PARTS = pitched.map((p) => ({ ...p, notes: p.notes.filter(inCore) })).filter((p) => p.notes.length);

  // ---- per part
  const partRows = CORE_PARTS.map((p) => {
    const ms = p.notes.map((n) => n.midi);
    const first = Math.min(...p.notes.map((n) => n.tick));
    const last = Math.max(...p.notes.map((n) => n.tick + n.dur));
    const activeBars = new Set(p.notes.map((n) => Math.floor(n.tick / barTicks))).size;
    const byTick = new Map();
    for (const n of p.notes) { const k = n.tick; if (!byTick.has(k)) byTick.set(k, []); byTick.get(k).push(n); }
    const clusters = [...byTick.values()];
    // chord-tone behaviour against the bar's own label
    let inChord = 0, outChord = 0, resolvedStep = 0, approachedStep = 0, judged = 0;
    const seq = [...byTick.entries()].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < seq.length; i++) {
      const [t, ns] = seq[i];
      const bar = Math.floor(t / barTicks);
      const lab = chords[bar];
      if (!lab || !lab.tones) continue;
      const tones = new Set(lab.tones.map(mod12));
      for (const n of ns) {
        judged++;
        if (tones.has(mod12(n.midi))) { inChord++; continue; }
        outChord++;
        const prev = i > 0 ? Math.max(...seq[i - 1][1].map((x) => x.midi)) : null;
        const next = i < seq.length - 1 ? Math.max(...seq[i + 1][1].map((x) => x.midi)) : null;
        if (next != null && Math.abs(next - n.midi) <= 2) resolvedStep++;
        if (prev != null && Math.abs(n.midi - prev) <= 2) approachedStep++;
      }
    }
    return {
      key: p.key, instrument: p.instrument, program: p.program, family: p.family,
      role: roleOf.get(p.key) ?? 'acc',
      notes: p.notes.length,
      minPitch: Math.min(...ms), medPitch: median(ms), maxPitch: Math.max(...ms),
      entryBar: Math.floor(first / barTicks), exitBar: Math.ceil(last / barTicks), activeBars,
      // coverage is measured against the CORE WINDOW, not the file. Measured
      // against the file it just reports the window's own length (it read
      // 13.6% for every part, which is core.len/totalBars and says nothing).
      // Inside a steady section the real question is whether a layer still
      // drops out — that is a layering device, not an accident.
      coverage: activeBars / core.len,
      restBars: core.len - activeBars,
      notesPerActiveBar: p.notes.length / (activeBars || 1),
      onsetsPerActiveBar: byTick.size / (activeBars || 1),
      medDurBeats: median(p.notes.map((n) => n.dur)) / (barTicks / 4),
      polyRatio: clusters.filter((c) => c.length > 1).length / (clusters.length || 1),
      maxCluster: Math.max(...clusters.map((c) => c.length)),
      rhythm: rhythmProfile(p.notes, barTicks),
      melodic: melodicProfile(p.notes),
      nctRate: judged ? outChord / judged : null,
      nctResolved: outChord ? resolvedStep / outChord : null,
      nctApproached: outChord ? approachedStep / outChord : null,
      hasCC1: p.ccs.some((c) => c.cc === 1), hasCC11: p.ccs.some((c) => c.cc === 11),
      bends: p.bends.length,
    };
  }).sort((a, b) => b.medPitch - a.medPitch);

  // ---- pairwise, top parts by note count
  const top = [...CORE_PARTS].sort((a, b) => b.notes.length - a.notes.length).slice(0, 7);
  const rel = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const r = pairRelation(top[i], top[j], barTicks);
      if (r.n < 4) continue;
      rel.push({
        a: top[i].key, b: top[j].key,
        aInst: top[i].instrument, bInst: top[j].instrument,
        aFam: top[i].family, bFam: top[j].family,
        aRole: roleOf.get(top[i].key), bRole: roleOf.get(top[j].key),
        ...r,
      });
    }
  }


  // ---- drums
  const drumRows = drums.map((p) => {
    const roles = new Map();
    for (const n of p.notes) { const r = DRUM_ROLE(n.midi); roles.set(r, (roles.get(r) ?? 0) + 1); }
    return { key: p.key, notes: p.notes.length, roles: Object.fromEntries([...roles].sort((a, b) => b[1] - a[1])) };
  });

  return {
    name, bpm: Math.round(mid.bpm), timeSig: `${num}/${den}`, ppq: mid.ppq, totalBars,
    key: key ? `${PC_NAMES[key.tonic]}:${key.mode}` : null, keyMargin: key?.margin ?? null,
    nPitched: pitched.length, nDrums: drums.length,
    chords: chords.map((c) => (c ? c.name : null)),
    chordChanges: chords.filter((c, i) => c && (i === 0 || !chords[i - 1] || chords[i - 1].name !== c.name)).length,
    parts: partRows, relations: rel, arc, drums: drumRows,
    core: { startBar: core.start, bars: core.len, stability: Number(core.stability.toFixed(3)), strength: Number(core.strength.toFixed(3)) },
    partsInCore: CORE_PARTS.length, partsDeclared: pitched.length,
  };
}

const files = readdirSync(DIR).filter((f) => /\.mid$/i.test(f)).sort();
const out = [];
for (const f of files) {
  try { out.push(analyze(join(DIR, f), f.replace(/\.mid$/i, ''))); }
  catch (e) { console.log(`FAILED ${f}: ${e.message}`); }
}
writeFileSync(join(ROOT, 'audios', 'manual-r22', '_analysis.json'), JSON.stringify(out, null, 1));
console.log(`analysed ${out.length}/${files.length} files -> audios/manual-r22/_analysis.json`);
for (const a of out) {
  console.log(`\n${a.name}  ${a.key} @${a.bpm} ${a.timeSig} · ${a.totalBars} bars · ${a.nPitched} pitched + ${a.nDrums} drum parts · ${a.chordChanges} chord changes`);
  for (const p of a.parts) {
    console.log(`   ${String(p.role).padEnd(8)} ${String(p.instrument).slice(0, 22).padEnd(23)} med${String(p.medPitch).padStart(3)} [${p.minPitch}-${p.maxPitch}] ` +
      `${p.onsetsPerActiveBar.toFixed(1)}on/bar dur${p.medDurBeats.toFixed(2)}b poly${(p.polyRatio * 100).toFixed(0)}%/${p.maxCluster} ` +
      `step${(p.melodic.step * 100).toFixed(0)}% rep${(p.melodic.rep * 100).toFixed(0)}% rng${p.melodic.range} ` +
      `off16 ${(p.rhythm.offBeat16 * 100).toFixed(0)}% slots${p.rhythm.slots} ` +
      `nct${p.nctRate == null ? '-' : (p.nctRate * 100).toFixed(0) + '%'}${p.nctResolved != null ? '/res' + (p.nctResolved * 100).toFixed(0) + '%' : ''} ` +
      `bars${p.entryBar}-${p.exitBar}(${(p.coverage * 100).toFixed(0)}%)`);
  }
}
