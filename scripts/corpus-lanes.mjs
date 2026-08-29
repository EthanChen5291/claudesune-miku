#!/usr/bin/env node
// Lane profiles built from CONFIRMED members only.
// ANALYSIS-ONLY (D95). Never feeds src/lib.
//
// HIS RULING: "for low confidence intervals ask me to verify so u dont make a
// mistake and creation for one genre gets influenced by another genre's song."
// So a lane profile is drawn ONLY from tracks where the TITLE names the lane AND
// the measured sound lands in a cluster where that lane is over-represented.
// Title-only members are excluded and queued for his ear
// (research/vgmusic-lane-outliers.md) rather than silently averaged in.
//
// Every printed number carries its n. Where a lane does something ZERO times that
// is stated as an absence, because twice in this project a "more X" note meant
// the engine did X exactly zero times and the analysis reported a shortfall.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = readFileSync(join(ROOT, 'audios/vgmusic-full/features.jsonl'), 'utf8')
  .trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((r) => r && r.ok);
const C = JSON.parse(readFileSync(join(ROOT, 'audios/vgmusic-full/clusters.json'), 'utf8'));
const conf = new Map();
for (const a of C.assignments) conf.set(a.file + '|' + a.game, new Set(a.confirmed));
const byKey = new Map(F.map((r) => [r.file + '|' + r.game, r]));

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r2 = (x) => Math.round(x * 100) / 100;
const IV = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

const LANES = [
  'scene.desert', 'scene.jungle', 'scene.space', 'scene.haunted', 'mood.creepy',
  'mood.menacing', 'scene.cave', 'scene.water', 'scene.snow', 'scene.volcano',
  'scene.town', 'scene.forest', 'scene.factory', 'mood.somber', 'mood.peaceful',
  'mood.playful', 'mood.heroic', 'mood.triumphant', 'mood.tense', 'mood.mysterious',
  'fn.battle', 'fn.boss',
];

const membersOf = (L) => F.filter((r) => (conf.get(r.file + '|' + r.game) || new Set()).has(L));

const sumVec = (rs, pick, n = 12) => {
  const out = new Array(n).fill(0);
  for (const r of rs) { const v = pick(r); if (!v) continue; for (let i = 0; i < n; i++) out[i] += v[i] || 0; }
  return out;
};
const sumHist = (rs, pick) => {
  const o = {};
  for (const r of rs) { const h = pick(r); if (!h) continue; for (const [k, v] of Object.entries(h)) o[k] = (o[k] || 0) + v; }
  return o;
};
const showVec = (v, names = IV) => { const t = v.reduce((a, b) => a + b, 0) || 1; return names.map((nm, i) => `${nm} ${(100 * v[i] / t).toFixed(1)}%`).join(' '); };
const showHist = (h) => { const t = Object.values(h).reduce((a, b) => a + b, 0) || 1; return Object.entries(h).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => `${k}:${(100 * v / t).toFixed(1)}%`).join(' '); };

const ALL = F.filter((r) => r.gates.length && r.gates.tempo);
const profile = (rs) => {
  const h = rs.filter((r) => r.gates.harmony);
  const m = rs.filter((r) => r.melody);
  const d = rs.filter((r) => r.gates.drums);
  const n = rs.filter((r) => r.nct && r.nct.total >= 50);
  const dr = rs.filter((r) => r.drums.hits > 0);
  return {
    n: rs.length,
    bpm: median(rs.map((r) => r.bpm)),
    minor: rs.length ? rs.filter((r) => r.keyMode === 'minor').length / rs.length : 0,
    layers: median(rs.map((r) => r.independentLayers)),
    concurrent: r2(median(rs.map((r) => r.sections.meanConcurrentParts))),
    noDrums: rs.length ? rs.filter((r) => !r.drums.hits).length / rs.length : 0,
    drumDensity: r2(median(dr.map((r) => r.drums.hits / Math.max(1, r.totalBars)))),
    handDrum: dr.length ? dr.filter((r) => r.drums.roles.hand_drum).length / dr.length : 0,
    shaker: dr.length ? dr.filter((r) => r.drums.roles.shaker).length / dr.length : 0,
    woodMetal: dr.length ? dr.filter((r) => r.drums.roles.wood_metal).length / dr.length : 0,
    colour: r2(median(h.map((r) => r.harmony.colourRatio))),
    thirdless: r2(median(h.map((r) => r.harmony.thirdlessRatio))),
    triad: r2(median(h.map((r) => r.harmony.triadRatio))),
    chgPerBar: r2(median(h.map((r) => r.harmony.changesPerBar))),
    distinctRoots: median(h.map((r) => r.harmony.distinctRoots)),
    melDensity: r2(median(m.map((r) => r.melody.notesPerActiveBar))),
    melHeld: r2(median(m.map((r) => r.melody.heldRatio))),
    melActive: r2(median(m.map((r) => r.melody.activeBarRatio))),
    melOOK: r2(median(m.map((r) => r.melody.outOfKey).filter((x) => x != null))),
    melStep: r2(median(m.map((r) => r.melody.stepwiseRatio))),
    melRange: median(m.map((r) => r.melody.range)),
    nctRatio: r2(median(n.map((r) => r.nct.nctRatio))),
    nctResolved: r2(median(n.filter((r) => r.nct.nct >= 10).map((r) => r.nct.resolvedRatio))),
    develop: median(rs.map((r) => r.sections.harmBounds)),
    secLen: median(rs.map((r) => r.sections.medSectionLen)),
    velSpread: r2(median(rs.map((r) => r.dynamics.velBarSpread))),
    bends: rs.length ? rs.filter((r) => r.dynamics.bends > 0).length / rs.length : 0,
    secondLine: rs.length ? rs.filter((r) => r.secondLine).length / rs.length : 0,
    ivHand: sumVec(rs, (r) => r.ivHand),
    simulHand: sumHist(rs, (r) => r.simulHand),
    families: (() => { const c = {}; for (const r of rs) for (const f of (r.families || [])) c[f] = (c[f] || 0) + 1; return c; })(),
    leadFamilies: (() => { const c = {}; for (const r of m) c[r.melody.family] = (c[r.melody.family] || 0) + 1; return c; })(),
    drumKeys: sumHist(dr, (r) => r.drums.keys),
    qualities: sumHist(h, (r) => r.harmony.qualities),
    kickGrid: sumVec(dr, (r) => r.drums.kickGrid, 16),
    snareGrid: sumVec(dr, (r) => r.drums.snareGrid, 16),
  };
};

const base = profile(ALL);
const L = console.log;
const out = {};

L(`corpus baseline n=${base.n}\n`);
L('lane            n   bpm minor lyrs conc noDrm dDens hDrm shak colr 3les triad chg/b dRoot mDens mHeld mAct mOOK mStep nct nRes dev sLen vSpr bend 2nd');
const rows = [];
for (const lane of LANES) {
  const rs = membersOf(lane).filter((r) => r.gates.length && r.gates.tempo);
  if (rs.length < 25) { rows.push([lane, rs.length, null]); continue; }
  const p = profile(rs);
  out[lane] = p;
  L([
    lane.padEnd(15), String(p.n).padStart(4), String(p.bpm.toFixed(0)).padStart(4),
    (100 * p.minor).toFixed(0).padStart(5), String(p.layers).padStart(4), String(p.concurrent).padStart(4),
    (100 * p.noDrums).toFixed(0).padStart(5), String(p.drumDensity).padStart(5),
    (100 * p.handDrum).toFixed(0).padStart(4), (100 * p.shaker).toFixed(0).padStart(4),
    String(p.colour).padStart(4), String(p.thirdless).padStart(4), String(p.triad).padStart(5),
    String(p.chgPerBar).padStart(5), String(p.distinctRoots).padStart(5),
    String(p.melDensity).padStart(5), String(p.melHeld).padStart(5), String(p.melActive).padStart(4),
    String(p.melOOK).padStart(4), String(p.melStep).padStart(5),
    String(p.nctRatio).padStart(4), String(p.nctResolved).padStart(4),
    String(p.develop).padStart(3), String(p.secLen).padStart(4), String(p.velSpread).padStart(4),
    (100 * p.bends).toFixed(0).padStart(4), (100 * p.secondLine).toFixed(0).padStart(3),
  ].join(' '));
}
L('\nBASELINE       ' + [
  String(base.n).padStart(4), String(base.bpm.toFixed(0)).padStart(4), (100 * base.minor).toFixed(0).padStart(5),
  String(base.layers).padStart(4), String(base.concurrent).padStart(4), (100 * base.noDrums).toFixed(0).padStart(5),
  String(base.drumDensity).padStart(5), (100 * base.handDrum).toFixed(0).padStart(4), (100 * base.shaker).toFixed(0).padStart(4),
  String(base.colour).padStart(4), String(base.thirdless).padStart(4), String(base.triad).padStart(5),
  String(base.chgPerBar).padStart(5), String(base.distinctRoots).padStart(5), String(base.melDensity).padStart(5),
  String(base.melHeld).padStart(5), String(base.melActive).padStart(4), String(base.melOOK).padStart(4),
  String(base.melStep).padStart(5), String(base.nctRatio).padStart(4), String(base.nctResolved).padStart(4),
  String(base.develop).padStart(3), String(base.secLen).padStart(4), String(base.velSpread).padStart(4),
  (100 * base.bends).toFixed(0).padStart(4), (100 * base.secondLine).toFixed(0).padStart(3),
].join(' '));
for (const [lane, n] of rows.filter((r) => r[2] === null)) L(`(skipped ${lane}: only ${n} confirmed members)`);

// what makes each lane DIFFERENT from the corpus baseline
L('\n\n=== LANE SIGNATURES: where a lane departs from the corpus baseline ===');
const NUM = ['bpm', 'minor', 'layers', 'concurrent', 'noDrums', 'drumDensity', 'handDrum', 'shaker', 'woodMetal',
  'colour', 'thirdless', 'triad', 'chgPerBar', 'distinctRoots', 'melDensity', 'melHeld', 'melActive',
  'melOOK', 'melStep', 'melRange', 'nctRatio', 'nctResolved', 'develop', 'secLen', 'velSpread', 'bends', 'secondLine'];
for (const [lane, p] of Object.entries(out)) {
  const devs = NUM.map((k) => {
    const b = base[k], v = p[k];
    if (!isFinite(b) || !isFinite(v) || Math.abs(b) < 1e-9) return null;
    return { k, v, b, rel: (v - b) / Math.abs(b) };
  }).filter((d) => d && Math.abs(d.rel) >= 0.2);
  devs.sort((a, b2) => Math.abs(b2.rel) - Math.abs(a.rel));
  L(`\n${lane}  (n=${p.n})`);
  L('  ' + (devs.slice(0, 9).map((d) => `${d.k} ${r2(d.v)} vs ${r2(d.b)} (${d.rel > 0 ? '+' : ''}${(100 * d.rel).toFixed(0)}%)`).join('; ') || 'nothing departs >=20% from baseline'));
  const lf = Object.entries(p.leadFamilies).sort((a, b2) => b2[1] - a[1]).slice(0, 4);
  L('  lead families: ' + lf.map(([k, v]) => `${k} ${pct(v, Object.values(p.leadFamilies).reduce((a, b2) => a + b2, 0))}`).join(' '));
  const dk = Object.entries(p.drumKeys).sort((a, b2) => b2[1] - a[1]).slice(0, 6);
  if (dk.length) L('  top drums: ' + dk.map(([k, v]) => k).join(', '));
  L('  iv above bass: ' + showVec(p.ivHand));
  L('  notes/attack:  ' + showHist(p.simulHand));
}

writeFileSync(join(ROOT, 'audios/vgmusic-full/lane-profiles.json'), JSON.stringify({ baseline: base, lanes: out }, null, 1));
L('\nwrote audios/vgmusic-full/lane-profiles.json');
