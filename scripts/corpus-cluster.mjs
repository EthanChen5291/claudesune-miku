#!/usr/bin/env node
// Sound-based clustering + STRENGTH-SCORED multi-labels for vgmusic-full.
// ANALYSIS-ONLY (D95). Never feeds src/lib.
//
// HIS TWO RULINGS THIS ROUND:
//  1. "cluster them by measured sound but also get some bg info by looking them
//     up" — so the 47.8% of files whose TITLE carries no mood/scene word are
//     placed by what they MEASURE, not by a guess from the game name.
//  2. "for low confidence intervals ask me to verify so u dont make a mistake and
//     creation for one genre gets influenced by another genre's song" — so a
//     lane's profile is only ever drawn from members it is CONFIDENT about, and
//     everything uncertain is queued for his ear instead of silently averaged in.
//
// The clustering is also a CROSS-CHECK on the title labels: if title-'creepy'
// files scatter evenly across every cluster, the title label is not tracking
// anything audible and no lane number built on it should be trusted.
//
// Usage: node scripts/corpus-cluster.mjs [--k 14] [--out FILE]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const K = Number(flag('k', 14));
const OUT = flag('out', join(ROOT, 'audios/vgmusic-full/clusters.json'));

const recs = readFileSync(join(ROOT, 'audios/vgmusic-full/features.jsonl'), 'utf8')
  .trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.ok && r.gates && r.gates.length && r.gates.tempo);

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const stdev = (xs) => { const m = mean(xs); return Math.sqrt(mean(xs.map((v) => (v - m) ** 2))) || 1; };
const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');

// ---- the feature vector. Deliberately PERCEPTUAL: tempo, mode, how busy, how
// low, how much percussion and of what kind, how held the tune is, how coloured
// the harmony is, how much it develops. These are the axes an ear sorts on.
const famHas = (r, f) => (r.families || []).includes(f) ? 1 : 0;
const FEATURES = [
  ['bpm', (r) => Math.min(r.bpm, 220)],
  ['minor', (r) => (r.keyMode === 'minor' ? 1 : 0)],
  ['concurrent', (r) => r.sections.meanConcurrentParts],
  ['layers', (r) => r.independentLayers],
  ['drumDensity', (r) => Math.min(r.drums.hits / Math.max(1, r.totalBars), 40)],
  ['handDrum', (r) => (r.drums.roles && r.drums.roles.hand_drum ? 1 : 0)],
  ['shaker', (r) => (r.drums.roles && r.drums.roles.shaker ? 1 : 0)],
  ['noDrums', (r) => (r.drums.hits ? 0 : 1)],
  ['melHeld', (r) => (r.melody ? r.melody.heldRatio : 0.1)],
  ['melDensity', (r) => (r.melody ? Math.min(r.melody.notesPerActiveBar, 24) : 6)],
  ['melActive', (r) => (r.melody ? r.melody.activeBarRatio : 0.7)],
  ['melOOK', (r) => (r.melody && r.melody.outOfKey != null ? r.melody.outOfKey : 0.1)],
  ['melPitch', (r) => (r.melody ? r.melody.medPitch : 70)],
  ['colour', (r) => (r.gates.harmony ? r.harmony.colourRatio : 0.7)],
  ['thirdless', (r) => (r.gates.harmony ? r.harmony.thirdlessRatio : 0.18)],
  ['chgPerBar', (r) => (r.gates.harmony ? Math.min(r.harmony.changesPerBar, 5) : 1.5)],
  ['develop', (r) => Math.min(r.sections.harmBounds / Math.max(1, r.totalBars) * 20, 5)],
  ['velSpread', (r) => Math.min(r.dynamics.velBarSpread, 25)],
  ['bend', (r) => (r.dynamics.bends > 0 ? 1 : 0)],
  ['ethnic', (r) => famHas(r, 'ethnic')],
  ['mallet', (r) => famHas(r, 'chromatic_perc')],
  ['pad', (r) => famHas(r, 'synth_pad')],
  ['fx', (r) => famHas(r, 'synth_fx')],
  ['choirEns', (r) => famHas(r, 'ensemble')],
  ['organ', (r) => famHas(r, 'organ')],
  ['piano', (r) => famHas(r, 'piano')],
  ['guitar', (r) => famHas(r, 'guitar')],
  ['brass', (r) => famHas(r, 'brass')],
  ['strings', (r) => famHas(r, 'strings')],
];

const raw0 = recs.map((r) => FEATURES.map(([, f]) => { const v = f(r); return isFinite(v) ? v : 0; }));
// WINSORIZE at the 1st/99th percentile. Without this a handful of pathological
// files (one had 72 independent layers) capture their own centroid and the
// remaining clusters collapse into near-duplicates — which is exactly what the
// first run produced.
const qAt = (xs, q) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * s.length)))]; };
const lo = FEATURES.map((_, j) => qAt(raw0.map((v) => v[j]), 0.01));
const hi = FEATURES.map((_, j) => qAt(raw0.map((v) => v[j]), 0.99));
const raw = raw0.map((v) => v.map((x, j) => Math.min(hi[j], Math.max(lo[j], x))));
const mus = FEATURES.map((_, j) => mean(raw.map((v) => v[j])));
const sds = FEATURES.map((_, j) => stdev(raw.map((v) => v[j])));
const X = raw.map((v) => v.map((x, j) => (x - mus[j]) / sds[j]));

// ---- k-means, deterministic (k-means++ seeded from a fixed hash, no RNG: the
// project's determinism tests exist because a re-roll silently moves material)
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
const d2 = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return s; };
// Deterministic k-means++: probability-weighted by squared distance, but drawn
// from a fixed LCG so the run is reproducible. Farthest-point seeding was tried
// first and is outlier-magnetic — it spent a centroid on 3 files.
let rngState = fnv('vgmusic-full-cluster-seed');
const rnd = () => { rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0; return rngState / 4294967296; };
let cents = [X[Math.floor(rnd() * X.length)]];
while (cents.length < K) {
  const dd = X.map((x) => Math.min(...cents.map((c) => d2(x, c))));
  const tot = dd.reduce((a, b) => a + b, 0);
  let t = rnd() * tot, pick = 0;
  for (let i = 0; i < dd.length; i++) { t -= dd[i]; if (t <= 0) { pick = i; break; } }
  cents.push(X[pick]);
}
let assign = new Array(X.length).fill(-1);
for (let iter = 0; iter < 60; iter++) {
  let moved = 0;
  for (let i = 0; i < X.length; i++) {
    let best = 0, bd = Infinity;
    for (let c = 0; c < K; c++) { const d = d2(X[i], cents[c]); if (d < bd) { bd = d; best = c; } }
    if (assign[i] !== best) { assign[i] = best; moved++; }
  }
  const sums = Array.from({ length: K }, () => new Array(FEATURES.length).fill(0));
  const cnt = new Array(K).fill(0);
  for (let i = 0; i < X.length; i++) { cnt[assign[i]]++; for (let j = 0; j < FEATURES.length; j++) sums[assign[i]][j] += X[i][j]; }
  for (let c = 0; c < K; c++) if (cnt[c]) cents[c] = sums[c].map((s) => s / cnt[c]);
  if (!moved) break;
}

// ---- describe each cluster, and name it from the title-labels that land in it
const members = Array.from({ length: K }, () => []);
recs.forEach((r, i) => members[assign[i]].push(r));

const labelCounts = (rs, axis) => {
  const c = {};
  for (const r of rs) for (const l of ((r.labels || {})[axis] || [])) c[l] = (c[l] || 0) + 1;
  return c;
};
// base rate across the whole corpus, so a cluster's ENRICHMENT is what names it
const baseRate = {};
for (const axis of ['scene', 'mood', 'fn', 'style']) {
  const c = labelCounts(recs, axis);
  for (const [k, v] of Object.entries(c)) baseRate[axis + '.' + k] = v / recs.length;
}

const clusters = [];
for (let c = 0; c < K; c++) {
  const rs = members[c];
  if (!rs.length) continue;
  const enrich = [];
  for (const axis of ['scene', 'mood', 'fn', 'style']) {
    const cc = labelCounts(rs, axis);
    for (const [k, v] of Object.entries(cc)) {
      const rate = v / rs.length, base = baseRate[axis + '.' + k] || 1e-9;
      if (v >= 8 && rate / base >= 1.35) enrich.push({ label: axis + '.' + k, n: v, rate, lift: rate / base });
    }
  }
  enrich.sort((a, b) => b.lift * Math.log(1 + b.n) - a.lift * Math.log(1 + a.n));
  clusters.push({
    id: c, n: rs.length,
    labelledShare: rs.filter((r) => r.labelConfidence !== 'none').length / rs.length,
    profile: Object.fromEntries(FEATURES.map(([nm], j) => [nm, Math.round(100 * cents[c][j]) / 100])),
    stats: {
      bpm: Math.round(median(rs.map((r) => r.bpm))),
      minor: pct(rs.filter((r) => r.keyMode === 'minor').length, rs.length),
      drums: pct(rs.filter((r) => r.drums.hits).length, rs.length),
      handDrum: pct(rs.filter((r) => r.drums.roles && r.drums.roles.hand_drum).length, rs.length),
      concurrent: Math.round(100 * median(rs.map((r) => r.sections.meanConcurrentParts))) / 100,
      layers: median(rs.map((r) => r.independentLayers)),
      melHeld: Math.round(100 * median(rs.filter((r) => r.melody).map((r) => r.melody.heldRatio))) / 100,
      melDensity: Math.round(10 * median(rs.filter((r) => r.melody).map((r) => r.melody.notesPerActiveBar))) / 10,
      melOOK: Math.round(100 * median(rs.filter((r) => r.melody && r.melody.outOfKey != null).map((r) => r.melody.outOfKey))) / 100,
      colour: Math.round(100 * median(rs.filter((r) => r.gates.harmony).map((r) => r.harmony.colourRatio))) / 100,
      thirdless: Math.round(100 * median(rs.filter((r) => r.gates.harmony).map((r) => r.harmony.thirdlessRatio))) / 100,
      develop: Math.round(10 * median(rs.map((r) => r.sections.harmBounds))) / 10,
      velSpread: Math.round(100 * median(rs.map((r) => r.dynamics.velBarSpread))) / 100,
    },
    enriched: enrich.slice(0, 8).map((e) => `${e.label} x${e.lift.toFixed(1)} (n=${e.n})`),
    sampleTitles: rs.slice(0, 400).filter((_, i) => i % Math.max(1, Math.floor(rs.length / 400)) === 0).slice(0, 10).map((r) => `${r.game} :: ${r.title}`),
  });
}

// ---- STRENGTH-SCORED labels (his ruling 3: all applicable, with strength)
// Title evidence is strong; cluster enrichment is corroborating evidence. A label
// is 'confirmed' only when BOTH agree; title-only or cluster-only is 'uncertain'
// and goes to him rather than into a lane profile.
const clusterLabelRate = {};
for (const cl of clusters) {
  clusterLabelRate[cl.id] = {};
  for (const axis of ['scene', 'mood', 'fn', 'style']) {
    const cc = labelCounts(members[cl.id], axis);
    for (const [k, v] of Object.entries(cc)) clusterLabelRate[cl.id][axis + '.' + k] = v / cl.n;
  }
}
const scored = recs.map((r, i) => {
  const cid = assign[i];
  const out = {};
  const titleLabels = new Set();
  for (const [axis, ls] of Object.entries(r.labels || {})) for (const l of ls) titleLabels.add(axis + '.' + l);
  const cand = new Set([...titleLabels]);
  // cluster-suggested labels: strongly enriched in this cluster
  for (const e of (clusters.find((c) => c.id === cid)?.enriched || [])) cand.add(e.split(' ')[0]);
  for (const key of cand) {
    const fromTitle = titleLabels.has(key);
    const clusterRate = (clusterLabelRate[cid] || {})[key] || 0;
    const base = baseRate[key] || 1e-9;
    const lift = clusterRate / base;
    // strength in [0,1]: title evidence dominates, cluster agreement adds
    let s = 0;
    if (fromTitle) s += r.labelConfidence === 'high' ? 0.62 : r.labelConfidence === 'medium' ? 0.48 : 0.3;
    if (lift >= 1.35) s += Math.min(0.3, 0.1 * lift);
    if (fromTitle && lift >= 1.35) s += 0.1;
    if (s > 0.05) out[key] = Math.round(100 * Math.min(1, s)) / 100;
  }
  return {
    file: r.file, system: r.system, game: r.game, title: r.title,
    cluster: cid, titleConfidence: r.labelConfidence,
    labels: out,
    // CONFIRMED = title says it AND the cluster it measures into agrees.
    confirmed: Object.entries(out).filter(([k, v]) => v >= 0.6 && titleLabels.has(k)).map(([k]) => k),
    uncertain: Object.entries(out).filter(([k, v]) => v < 0.6).map(([k]) => k),
  };
});

writeFileSync(OUT, JSON.stringify({ k: K, features: FEATURES.map(([n]) => n), clusters, assignments: scored }, null, 1));

// ---- report
const L = console.log;
L(`clustered n=${recs.length} into k=${K}\n`);
L('id    n  labl  bpm  min drum hdrm conc lyr held dens ook colr 3les dev vspr   enriched labels');
for (const c of clusters.sort((a, b) => b.n - a.n)) {
  L([
    String(c.id).padStart(2), String(c.n).padStart(6), pct(c.labelledShare * c.n, c.n).padStart(5),
    String(c.stats.bpm).padStart(4), c.stats.minor.padStart(4), c.stats.drums.padStart(4),
    c.stats.handDrum.padStart(4), String(c.stats.concurrent).padStart(4), String(c.stats.layers).padStart(3),
    String(c.stats.melHeld).padStart(4), String(c.stats.melDensity).padStart(4), String(c.stats.melOOK).padStart(4),
    String(c.stats.colour).padStart(4), String(c.stats.thirdless).padStart(4), String(c.stats.develop).padStart(3),
    String(c.stats.velSpread).padStart(4),
  ].join(' ') + '   ' + c.enriched.slice(0, 4).join(', '));
}
L('\n--- cluster naming evidence (sample titles) ---');
for (const c of clusters.sort((a, b) => b.n - a.n)) {
  L(`\n[${c.id}] n=${c.n}  ${c.enriched.slice(0, 5).join(' | ') || '(no enriched title labels)'}`);
  for (const t of c.sampleTitles.slice(0, 5)) L('     ' + t.slice(0, 88));
}
// How much do the measured features actually predict the title labels? If a
// label scatters evenly across clusters, it is not tracking anything audible and
// no lane number built on it should be trusted. Reported, not hidden.
L('\n--- do measured features PREDICT the title labels? (max cluster lift per label) ---');
const lifts = [];
for (const axis of ['scene', 'mood']) {
  const tot = labelCounts(recs, axis);
  for (const [k, v] of Object.entries(tot)) {
    if (v < 40) continue;
    let best = 0, bestC = -1;
    for (const cl of clusters) {
      const inC = members[cl.id].filter((r) => ((r.labels || {})[axis] || []).includes(k)).length;
      const lift = (inC / cl.n) / (v / recs.length);
      if (inC >= 8 && lift > best) { best = lift; bestC = cl.id; }
    }
    lifts.push([axis + '.' + k, v, best, bestC]);
  }
}
for (const [k, v, lift, c] of lifts.sort((a, b) => b[2] - a[2]))
  L(`  ${k.padEnd(20)} n=${String(v).padStart(5)}  best cluster lift x${lift.toFixed(2)} (cluster ${c})${lift >= 2 ? '  <- measurable' : lift < 1.5 ? '  <- NOT separable by sound' : ''}`);

const conf = scored.filter((s) => s.confirmed.length).length;
const unc = scored.filter((s) => !s.confirmed.length && Object.keys(s.labels).length).length;
L(`\nCONFIRMED (title AND cluster agree): ${pct(conf, scored.length)} of files`);
L(`UNCERTAIN (one signal only):          ${pct(unc, scored.length)}`);
L(`NO SIGNAL:                            ${pct(scored.length - conf - unc, scored.length)}`);
L(`\nwrote ${OUT}`);
