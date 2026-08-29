#!/usr/bin/env node
// Aggregates features.jsonl into the numbers the engine round actually needs.
// ANALYSIS-ONLY (D95): prose input for research/*.md, never counted into src/.
//
// Every section reports the surviving n after gating, because "a confident
// percentage on a noisy label set is worse than no number". Where the corpus
// does something ZERO times, that is stated as an absence, not as a shortfall —
// twice in this project a "more X" note meant the engine did X exactly zero
// times and the analysis reported a shortfall instead.
//
// Usage: node scripts/corpus-report.mjs [--in FILE] [--lane scene.desert] [--json]

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const IN = flag('in', join(ROOT, 'audios/vgmusic-full/features.jsonl'));

const recs = readFileSync(IN, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const ok = recs.filter((r) => r.ok);

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r2 = (x) => Math.round(x * 100) / 100;
const IV = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

/** files carrying a label, e.g. has(r,'scene','desert') */
const has = (r, axis, name) => !!(r.labels && r.labels[axis] && r.labels[axis].includes(name));
const lane = (axis, name, extra = () => true) => ok.filter((r) => has(r, axis, name) && extra(r));

const sumHist = (rs, pick) => {
  const out = {};
  for (const r of rs) { const h = pick(r); if (!h) continue; for (const [k, v] of Object.entries(h)) out[k] = (out[k] || 0) + v; }
  return out;
};
const sumVec = (rs, pick, n = 12) => {
  const out = new Array(n).fill(0);
  for (const r of rs) { const v = pick(r); if (!v) continue; for (let i = 0; i < n; i++) out[i] += v[i] || 0; }
  return out;
};
const showVec = (v, names = IV) => {
  const t = v.reduce((a, b) => a + b, 0) || 1;
  return names.map((nm, i) => `${nm} ${(100 * v[i] / t).toFixed(1)}%`).join('  ');
};
const showHist = (h) => {
  const t = Object.values(h).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(h).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `${k}:${(100 * v / t).toFixed(1)}%`).join('  ');
};

const L = console.log;
const H = (s) => { L('\n' + '='.repeat(78)); L(s); L('='.repeat(78)); };

L(`records=${recs.length}  ok=${ok.length}  failed=${recs.length - ok.length}`);
const errs = {};
for (const r of recs.filter((x) => !x.ok)) errs[r.error] = (errs[r.error] || 0) + 1;
L('failures: ' + Object.entries(errs).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}x ${k}`).join(' | '));

// gates
H('GATES (share of ok records passing each)');
const gk = Object.keys(ok[0]?.gates || {});
for (const g of gk) L(`  ${g.padEnd(10)} ${pct(ok.filter((r) => r.gates[g]).length, ok.length)}`);
const G = { harm: ok.filter((r) => r.gates.harmony && r.gates.length && r.gates.tempo), full: ok.filter((r) => r.gates.harmony && r.gates.length && r.gates.tempo && r.gates.bass && r.gates.lead) };
L(`  -> harmony-usable set n=${G.harm.length};  bass+lead+harmony set n=${G.full.length}`);

// ---------------------------------------------------------------- Q2
H('Q2  INTERVAL CLASSES ABOVE THE SOUNDING BASS  (engine: 99.3% in {R,b3,3,5})');
const ivAll = sumVec(G.full, (r) => r.ivHand);
L('accompaniment hand, all genres:');
L('  ' + showVec(ivAll));
const core = [0, 3, 4, 7].reduce((a, i) => a + ivAll[i], 0), tot = ivAll.reduce((a, b) => a + b, 0);
L(`  {R,b3,3,5} share = ${pct(core, tot)}   (engine measures 99.3%)`);
L(`  colour tones {2,4,b5,b6,6,b7,7} = ${pct([2, 5, 6, 8, 9, 10, 11].reduce((a, i) => a + ivAll[i], 0), tot)}`);
L(`  distinct interval classes with >=1% share = ${ivAll.filter((v) => v / tot >= 0.01).length} of 12`);
L('\nby role:');
for (const role of ['acc', 'pad', 'counter', 'descant', 'lead', 'arp']) {
  const v = sumVec(G.full, (r) => r.ivAboveBass && r.ivAboveBass[role]);
  const t = v.reduce((a, b) => a + b, 0);
  if (t < 500) continue;
  L(`  ${role.padEnd(8)} n=${String(t).padStart(8)}  ${showVec(v)}`);
}

// ---------------------------------------------------------------- Q3
H('Q3  NOTES PER ATTACK  (engine acc: 74.3% single, 0.11% four-note)');
L('aggregated accompaniment HAND (the sounding chord, not one track):');
L('  ' + showHist(sumHist(G.full, (r) => r.simulHand)));
L('whole pitched mix:');
L('  ' + showHist(sumHist(G.full, (r) => r.simulMix)));
const sh = sumHist(G.full, (r) => r.simulHand), shT = Object.values(sh).reduce((a, b) => a + b, 0);
L(`  hand: >=3 notes on ${pct(Object.entries(sh).filter(([k]) => +k >= 3).reduce((a, [, v]) => a + v, 0), shT)} of attacks;  >=4 on ${pct(Object.entries(sh).filter(([k]) => +k >= 4).reduce((a, [, v]) => a + v, 0), shT)}`);

// ---------------------------------------------------------------- Q9
H('Q9  NON-CHORD TONES AND WHETHER THEY RESOLVE  (engine: 22.8% NCT, 93.9% UNresolved)');
const withN = G.harm.filter((r) => r.nct && r.nct.total >= 50);
const nctR = mean(withN.map((r) => r.nct.nctRatio));
const resR = mean(withN.filter((r) => r.nct.nct >= 10).map((r) => r.nct.resolvedRatio));
L(`  n=${withN.length} files with >=50 harmonised acc notes`);
L(`  mean non-chord-tone rate      ${(100 * nctR).toFixed(1)}%   (engine 22.8%)`);
L(`  mean RESOLVED-by-step share   ${(100 * resR).toFixed(1)}%   (engine 6.1% resolved / 93.9% unresolved)`);
L(`  mean step-APPROACHED share    ${(100 * mean(withN.filter((r) => r.nct.nct >= 10).map((r) => r.nct.stepApproach / r.nct.nct)) ).toFixed(1)}%`);
const totN = withN.reduce((a, r) => a + r.nct.nct, 0), totR = withN.reduce((a, r) => a + r.nct.resolved, 0), totT = withN.reduce((a, r) => a + r.nct.total, 0);
L(`  pooled: ${totN}/${totT} notes are NCT (${pct(totN, totT)}); ${totR} resolve by step (${pct(totR, totN)})`);

// ---------------------------------------------------------------- Q10
H('Q10  INSERTION vs SUBSTITUTION under a HELD chord');
const ins = G.harm.filter((r) => r.insertion && r.insertion.heldBars >= 4);
L(`  n=${ins.length} files with >=4 bars of held harmony`);
L(`  median onsets per held bar in the acc hand: ${median(ins.map((r) => r.insertion.onsetsPerHeldBar))}`);
L(`  mean share of held bars that are PURE RE-STRIKES (no tone outside the chord): ${(100 * mean(ins.map((r) => r.insertion.pureRestrikeRatio))).toFixed(1)}%`);
L(`  -> so ${(100 * (1 - mean(ins.map((r) => r.insertion.pureRestrikeRatio)))).toFixed(1)}% of held bars ADD a tone the chord does not contain`);

// ---------------------------------------------------------------- Q4
H('Q4  ARE LAYER ENTRIES SECTION-LOCKED?  (engine: 139 of 139 land on a section start)');
const ent = ok.filter((r) => r.gates.length && r.sections && r.sections.entries && r.sections.entries.n > 0);
const sum = (f) => ent.reduce((a, r) => a + f(r.sections.entries), 0);
const N = sum((e) => e.n);
L(`  n=${ent.length} files, ${N} layer entries after bar 0`);
L(`  on an 8-bar multiple      ${pct(sum((e) => e.onGrid8), N)}`);
L(`  on a 4-bar multiple       ${pct(sum((e) => e.onGrid4), N)}`);
L(`  on a 2-bar multiple       ${pct(sum((e) => e.onGrid2), N)}`);
L(`  on an ODD bar             ${pct(sum((e) => e.odd), N)}   <- engine does this 0% of the time`);
L(`  on a 2-bar-but-NOT-4 bar  ${pct(sum((e) => e.onGrid2) - sum((e) => e.onGrid4), N)}`);
L(`  on a harmonic-novelty boundary ${pct(sum((e) => e.onHarmonicBoundary), N)}`);
L(`  median distance to nearest harmonic boundary: ${median(ent.map((r) => r.sections.entries.medOffsetToHarmonic).filter((x) => x != null))} bars`);

// ---------------------------------------------------------------- Q5
H('Q5  THE SECOND MELODIC LINE');
const sl = ok.filter((r) => r.secondLine);
L(`  ${pct(sl.length, ok.filter((r) => r.gates.lead).length)} of lead-bearing files carry a second independently-moving line (n=${sl.length})`);
L(`  sits BELOW the lead: ${pct(sl.filter((r) => r.secondLine.belowLead).length, sl.length)}`);
L(`  median interval from lead: ${median(sl.map((r) => r.secondLine.medIntervalFromLead))} semitones`);
L(`  median density ratio vs lead: ${r2(median(sl.map((r) => r.secondLine.densityRatio)))}  (<1 = sparser than the lead)`);
const cmp = sl.filter((r) => r.secondLine.moreChromaticThanLead != null);
L(`  MORE chromatic than the lead: ${pct(cmp.filter((r) => r.secondLine.moreChromaticThanLead).length, cmp.length)}  <- r19 failure mode`);
L(`  median out-of-key rate: second line ${r2(median(cmp.map((r) => r.secondLine.outOfKey)))} vs lead ${r2(median(cmp.map((r) => r.secondLine.leadOutOfKey)))}`);
L(`  median independent LAYERS per file: ${median(ok.map((r) => r.independentLayers))} (raw parts ${median(ok.map((r) => r.nPitchedParts))})`);

// ---------------------------------------------------------------- doubling
H('LAYERING: DOUBLING TECHNIQUES  (parts that carry ONE idea)');
const dAll = ok.flatMap((r) => r.doublings || []);
const dk = {};
for (const d of dAll) dk[d.kind] = (dk[d.kind] || 0) + 1;
L(`  ${pct(ok.filter((r) => (r.doublings || []).length).length, ok.length)} of files contain at least one doubled pair (n=${dAll.length} pairs)`);
L(`  kinds: ${Object.entries(dk).map(([k, v]) => `${k} ${pct(v, dAll.length)}`).join('  ')}`);
const echo = dAll.filter((d) => d.kind === 'echo');
L(`  echo offsets (beats): median ${median(echo.map((d) => Math.abs(d.offsetBeats)))}, ` +
  Object.entries(echo.reduce((a, d) => { const k = Math.abs(d.offsetBeats); a[k] = (a[k] || 0) + 1; return a; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}b:${v}`).join(' '));
L(`  raw parts ${r2(mean(ok.map((r) => r.nPitchedParts)))} -> independent layers ${r2(mean(ok.map((r) => r.independentLayers)))} (mean)`);

// ---------------------------------------------------------------- Q6
H('Q6  MELODY: DURATION, POLYPHONY, SHAPE');
const mel = ok.filter((r) => r.melody && r.gates.lead && r.gates.length);
L(`  n=${mel.length}`);
L(`  median notes per ACTIVE bar     ${median(mel.map((r) => r.melody.notesPerActiveBar))}`);
L(`  median active-bar ratio         ${r2(median(mel.map((r) => r.melody.activeBarRatio)))}  (rest of the time the lead is SILENT)`);
L(`  median held-note share (>=1 beat) ${r2(median(mel.map((r) => r.melody.heldRatio)))}`);
L(`  lead strikes 2+ notes at once   ${pct(mel.filter((r) => r.melody.polyAttackRatio > 0.02).length, mel.length)} of files;  median share of attacks ${r2(median(mel.map((r) => r.melody.polyAttackRatio)))}`);
L(`  median stepwise share           ${r2(median(mel.map((r) => r.melody.stepwiseRatio)))}`);
L(`  median leaps > an octave        ${r2(median(mel.map((r) => r.melody.leapBig)))}`);
L(`  median repeated-pitch share     ${r2(median(mel.map((r) => r.melody.repeatRatio)))}`);
L(`  median rest count / note        ${r2(median(mel.map((r) => r.melody.restRatio)))}`);
L(`  median out-of-key share         ${r2(median(mel.map((r) => r.melody.outOfKey).filter((x) => x != null)))}`);
L(`  median range (semitones)        ${median(mel.map((r) => r.melody.range))}`);
const fam = {};
for (const r of mel) fam[r.melody.family] = (fam[r.melody.family] || 0) + 1;
L(`  lead instrument family: ${Object.entries(fam).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${pct(v, mel.length)}`).join('  ')}`);

// ---------------------------------------------------------------- Q11
H('Q11  FORM: AMBIENT LOOP vs NARRATIVE');
const fm = ok.filter((r) => r.gates.length && r.totalBars >= 16);
const ambient = fm.filter((r) => r.sections.harmBounds <= 2 && r.sections.distinctTextures <= 3);
L(`  n=${fm.length} (>=16 bars)`);
L(`  AMBIENT (<=2 harmonic boundaries and <=3 distinct textures): ${pct(ambient.length, fm.length)}`);
L(`  median harmonic-novelty boundaries per file: ${median(fm.map((r) => r.sections.harmBounds))}`);
L(`  median distinct textures per file:           ${median(fm.map((r) => r.sections.distinctTextures))}`);
L(`  median section length (bars):                ${median(fm.map((r) => r.sections.medSectionLen))}`);
L(`  median texture-change rate (per bar):        ${r2(median(fm.map((r) => r.sections.textureChangeRate)))}`);
L('  for AMBIENT files, what still moves:');
L(`    median velocity spread across bars ${r2(median(ambient.map((r) => r.dynamics.velBarSpread)))} vs narrative ${r2(median(fm.filter((r) => !ambient.includes(r)).map((r) => r.dynamics.velBarSpread)))}`);
L(`    median concurrent parts ${r2(median(ambient.map((r) => r.sections.meanConcurrentParts)))} vs narrative ${r2(median(fm.filter((r) => !ambient.includes(r)).map((r) => r.sections.meanConcurrentParts)))}`);

// ---------------------------------------------------------------- Q12
H('Q12  CONCURRENT PITCHED VOICES  (engine sits at 5-7)');
L(`  median mean-concurrent-parts ${r2(median(ok.map((r) => r.sections.meanConcurrentParts)))}`);
L(`  median MAX concurrent        ${median(ok.map((r) => r.sections.maxConcurrent))}`);
const cc = {};
for (const r of ok) { const b = Math.min(10, Math.round(r.sections.meanConcurrentParts)); cc[b] = (cc[b] || 0) + 1; }
L('  distribution of mean concurrent parts: ' + showHist(cc));

// ---------------------------------------------------------------- dynamics/pauses
H('DYNAMICS, PAUSES, TEMPO');
L(`  velocity: median mean ${r2(median(ok.map((r) => r.dynamics.velMean)))}, median stdev ${r2(median(ok.map((r) => r.dynamics.velStdev)))}`);
L(`  files with FLAT velocity (stdev<1): ${pct(ok.filter((r) => r.dynamics.velStdev < 1).length, ok.length)}`);
L(`  files using CC11 expression: ${pct(ok.filter((r) => r.dynamics.cc && r.dynamics.cc['11']).length, ok.length)};  CC7 volume: ${pct(ok.filter((r) => r.dynamics.cc && r.dynamics.cc['7']).length, ok.length)};  CC1 mod: ${pct(ok.filter((r) => r.dynamics.cc && r.dynamics.cc['1']).length, ok.length)}`);
L(`  files using PITCH BEND: ${pct(ok.filter((r) => r.dynamics.bends > 0).length, ok.length)} (median ${median(ok.filter((r) => r.dynamics.bends > 0).map((r) => r.dynamics.bends))} events)`);
L(`  files with a TEMPO CHANGE (>1 tempo event): ${pct(ok.filter((r) => r.tempoChanges > 1).length, ok.length)}`);
L(`  files with a TIME-SIG CHANGE: ${pct(ok.filter((r) => r.timeSigChanges > 1).length, ok.length)}`);
const ts = {};
for (const r of ok) ts[r.timeSig] = (ts[r.timeSig] || 0) + 1;
L(`  time signatures: ${Object.entries(ts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${pct(v, ok.length)}`).join('  ')}`);
L(`  tempo: median ${median(ok.filter((r) => r.gates.tempo).map((r) => r.bpm))} bpm`);

// ---------------------------------------------------------------- call & response
H('CALL AND RESPONSE');
const cr = ok.filter((r) => r.callResponse && r.callResponse.pair);
L(`  ${pct(cr.filter((r) => r.callResponse.alternationRatio >= 0.5).length, ok.length)} of files contain a part-pair alternating >=50% of active bars`);
L(`  ${pct(cr.filter((r) => r.callResponse.alternationRatio >= 0.75).length, ok.length)} alternate >=75% (true trading)`);
const pairs = {};
for (const r of cr.filter((x) => x.callResponse.alternationRatio >= 0.6)) { const k = r.callResponse.pair.slice().sort().join('/'); pairs[k] = (pairs[k] || 0) + 1; }
L('  most common trading pairs: ' + Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join('  '));

// ---------------------------------------------------------------- harmony vocabulary
H('HARMONY VOCABULARY');
const hq = G.harm;
L(`  n=${hq.length}`);
L(`  median chord changes per bar: ${r2(median(hq.map((r) => r.harmony.changesPerBar)))}`);
L(`  median plain-triad share:     ${r2(median(hq.map((r) => r.harmony.triadRatio)))}`);
L(`  median COLOUR share (7/6/9/sus): ${r2(median(hq.map((r) => r.harmony.colourRatio)))}`);
L(`  median seventh share:         ${r2(median(hq.map((r) => r.harmony.seventhRatio)))}`);
L(`  median THIRDLESS share (5/sus): ${r2(median(hq.map((r) => r.harmony.thirdlessRatio)))}`);
const qual = sumHist(hq, (r) => r.harmony.qualities);
L('  chord-quality mix: ' + Object.entries(qual).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${pct(v, Object.values(qual).reduce((a, b) => a + b, 0))}`).join('  '));
const rm = sumHist(hq, (r) => r.harmony.rootMotion);
const rmT = Object.values(rm).reduce((a, b) => a + b, 0);
L('  ROOT MOTION (semitones up): ' + Object.entries(rm).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `+${k} ${pct(v, rmT)}`).join('  '));
const big = {};
for (const r of hq) for (const b of (r.harmony.bigrams || [])) big[b] = (big[b] || 0) + 1;
L('  top degree bigrams (key-relative, 0=tonic):');
for (const [k, v] of Object.entries(big).sort((a, b) => b[1] - a[1]).slice(0, 20)) L(`    ${k.padEnd(24)} ${v}`);

// ---------------------------------------------------------------- percussion
H('PERCUSSION VOCABULARY');
const dr = ok.filter((r) => r.gates.drums);
L(`  ${pct(dr.length, ok.length)} of files have a drum channel (n=${dr.length})`);
const droles = sumHist(dr, (r) => r.drums.roles);
const drT = Object.values(droles).reduce((a, b) => a + b, 0);
L('  hit-role mix: ' + Object.entries(droles).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v, drT)}`).join('  '));
const dkeys = sumHist(dr, (r) => r.drums.keys);
L('  top 18 instruments: ' + Object.entries(dkeys).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => `${k}(${pct(v, drT)})`).join(', '));
const kg = sumVec(dr, (r) => r.drums.kickGrid, 16), sg = sumVec(dr, (r) => r.drums.snareGrid, 16), hg = sumVec(dr, (r) => r.drums.hatGrid, 16);
const g16 = Array.from({ length: 16 }, (_, i) => String(i + 1));
L('  kick  on 16ths: ' + showVec(kg, g16));
L('  snare on 16ths: ' + showVec(sg, g16));
L('  hat   on 16ths: ' + showVec(hg, g16));
L(`  files with HAND DRUMS (bongo/conga/timbale/cuica/surdo): ${pct(dr.filter((r) => r.drums.roles.hand_drum).length, dr.length)}`);
L(`  files with SHAKER-class (shaker/cabasa/maracas/tambourine): ${pct(dr.filter((r) => r.drums.roles.shaker).length, dr.length)}`);
L(`  files with WOOD/METAL (claves/woodblock/agogo/cowbell/triangle): ${pct(dr.filter((r) => r.drums.roles.wood_metal).length, dr.length)}`);

// ---------------------------------------------------------------- instruments
H('INSTRUMENT ROLES (which GM families take which job)');
const roleFam = {};
for (const r of ok) for (const p of r.roles) { if (p.isDouble) continue; (roleFam[p.role] ||= {})[p.family] = ((roleFam[p.role] || {})[p.family] || 0) + 1; }
for (const [role, fams] of Object.entries(roleFam)) {
  const t = Object.values(fams).reduce((a, b) => a + b, 0);
  if (t < 200) continue;
  L(`  ${role.padEnd(9)} n=${String(t).padStart(7)}  ` + Object.entries(fams).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${pct(v, t)}`).join('  '));
}

// ---------------------------------------------------------------- lanes
H('LANE PROFILES  (multi-label; a file may appear in several)');
const LANES = [
  ['scene', 'desert'], ['scene', 'jungle'], ['scene', 'space'], ['scene', 'haunted'],
  ['scene', 'cave'], ['scene', 'water'], ['scene', 'snow'], ['scene', 'volcano'],
  ['scene', 'factory'], ['scene', 'town'], ['scene', 'castle'], ['scene', 'forest'],
  ['mood', 'creepy'], ['mood', 'menacing'], ['mood', 'heroic'], ['mood', 'triumphant'],
  ['mood', 'somber'], ['mood', 'peaceful'], ['mood', 'playful'], ['mood', 'tense'],
  ['mood', 'mysterious'], ['mood', 'epic'], ['fn', 'battle'], ['fn', 'boss'],
];
L('lane          n   bpm  minor%  colour thirdl  chg/bar  concur  drums%  handDr%  melNPB  held  ook   NCT  res');
for (const [ax, nm] of LANES) {
  const rs = lane(ax, nm, (r) => r.gates.length && r.gates.tempo);
  if (rs.length < 12) { L(`${(ax + '.' + nm).padEnd(14)} n=${rs.length} (too few)`); continue; }
  const hs = rs.filter((r) => r.gates.harmony);
  const ms = rs.filter((r) => r.melody);
  const ds = rs.filter((r) => r.gates.drums);
  const ns = rs.filter((r) => r.nct && r.nct.total >= 50);
  L([
    (ax + '.' + nm).padEnd(13),
    String(rs.length).padStart(4),
    String(median(rs.map((r) => r.bpm)).toFixed(0)).padStart(5),
    pct(rs.filter((r) => r.keyMode === 'minor').length, rs.length).padStart(6),
    r2(median(hs.map((r) => r.harmony.colourRatio))).toFixed(2).padStart(7),
    r2(median(hs.map((r) => r.harmony.thirdlessRatio))).toFixed(2).padStart(6),
    r2(median(hs.map((r) => r.harmony.changesPerBar))).toFixed(2).padStart(8),
    r2(median(rs.map((r) => r.sections.meanConcurrentParts))).toFixed(1).padStart(7),
    pct(ds.length, rs.length).padStart(7),
    pct(ds.filter((r) => r.drums.roles.hand_drum).length, ds.length || 1).padStart(8),
    r2(median(ms.map((r) => r.melody.notesPerActiveBar))).toFixed(1).padStart(7),
    r2(median(ms.map((r) => r.melody.heldRatio))).toFixed(2).padStart(5),
    r2(median(ms.map((r) => r.melody.outOfKey).filter((x) => x != null))).toFixed(2).padStart(5),
    r2(median(ns.map((r) => r.nct.nctRatio))).toFixed(2).padStart(5),
    r2(median(ns.filter((r) => r.nct.nct >= 10).map((r) => r.nct.resolvedRatio))).toFixed(2).padStart(4),
  ].join(' '));
}

// ---------------------------------------------------------------- Q1
H('Q1  WHAT SEPARATES SPACE FROM SOMBER DESERT?  (his first complaint in prompt.md)');
const desert = lane('scene', 'desert', (r) => r.gates.length);
const space = lane('scene', 'space', (r) => r.gates.length);
const feats1 = [
  ['bpm', (r) => r.bpm],
  ['minor mode share', (r) => (r.keyMode === 'minor' ? 1 : 0)],
  ['has drums', (r) => (r.gates.drums ? 1 : 0)],
  ['hand-drum share (of drummed)', (r) => (r.drums.roles.hand_drum ? 1 : 0)],
  ['drum hits per bar', (r) => r.drums.hits / r.totalBars],
  ['mean concurrent parts', (r) => r.sections.meanConcurrentParts],
  ['independent layers', (r) => r.independentLayers],
  ['median note duration (bars, lead)', (r) => (r.melody ? r.melody.medDurBars : null)],
  ['lead held-note share', (r) => (r.melody ? r.melody.heldRatio : null)],
  ['lead notes / active bar', (r) => (r.melody ? r.melody.notesPerActiveBar : null)],
  ['lead active-bar ratio', (r) => (r.melody ? r.melody.activeBarRatio : null)],
  ['lead out-of-key', (r) => (r.melody ? r.melody.outOfKey : null)],
  ['lead stepwise share', (r) => (r.melody ? r.melody.stepwiseRatio : null)],
  ['chord changes / bar', (r) => (r.gates.harmony ? r.harmony.changesPerBar : null)],
  ['thirdless share', (r) => (r.gates.harmony ? r.harmony.thirdlessRatio : null)],
  ['colour share', (r) => (r.gates.harmony ? r.harmony.colourRatio : null)],
  ['pitch-bend use', (r) => (r.dynamics.bends > 0 ? 1 : 0)],
  ['texture-change rate', (r) => r.sections.textureChangeRate],
  ['harmonic boundaries', (r) => r.sections.harmBounds],
  ['velocity spread across bars', (r) => r.dynamics.velBarSpread],
];
L(`  desert n=${desert.length}   space n=${space.length}`);
L('  feature                              desert    space    separation');
const seps = [];
for (const [nm, f] of feats1) {
  const a = desert.map(f).filter((x) => x != null && isFinite(x));
  const b = space.map(f).filter((x) => x != null && isFinite(x));
  if (a.length < 8 || b.length < 8) continue;
  // Binary indicators must be reported as MEANS: the median of a 0/1 feature is
  // 0 or 1 and hides the actual rate (it printed "minor 1.00 vs 0.00, d=0.08").
  const binary = a.concat(b).every((x) => x === 0 || x === 1);
  const ma = binary ? mean(a) : median(a), mb = binary ? mean(b) : median(b);
  const sd = Math.sqrt((mean(a.map((x) => (x - mean(a)) ** 2)) + mean(b.map((x) => (x - mean(b)) ** 2))) / 2) || 1;
  const d = (mean(a) - mean(b)) / sd;   // Cohen's d
  seps.push([nm, ma, mb, d]);
}
for (const [nm, ma, mb, d] of seps.sort((x, y) => Math.abs(y[3]) - Math.abs(x[3])))
  L(`  ${nm.padEnd(36)} ${r2(ma).toFixed(2).padStart(7)} ${r2(mb).toFixed(2).padStart(8)}    d=${d.toFixed(2)}${Math.abs(d) >= 0.5 ? '  *' : ''}`);
L(`  features reaching |d|>=0.5: ${seps.filter((x) => Math.abs(x[3]) >= 0.5).length} of ${seps.length}`);
L('  (d = Cohen\'s d, desert minus space; |d|>=0.5 is a real separation, >=0.8 large)');

// ---------------------------------------------------------------- Q7/Q14
H('Q7/Q14  HORROR: DOSING, THIRDLESS VOICINGS, WHERE THE UNEASE LIVES');
const horror = ok.filter((r) => (has(r, 'mood', 'creepy') || has(r, 'scene', 'haunted') || has(r, 'mood', 'menacing')) && r.gates.length);
const hh = horror.filter((r) => r.gates.harmony);
L(`  n=${horror.length} horror-ish (creepy|haunted|menacing), harmony-usable ${hh.length}`);
L(`  minor-mode share            ${pct(horror.filter((r) => r.keyMode === 'minor').length, horror.length)}  (all-corpus ${pct(ok.filter((r) => r.keyMode === 'minor').length, ok.length)})`);
L(`  median THIRDLESS share      ${r2(median(hh.map((r) => r.harmony.thirdlessRatio)))}  (all-corpus ${r2(median(G.harm.map((r) => r.harmony.thirdlessRatio)))})`);
L(`  median colour share         ${r2(median(hh.map((r) => r.harmony.colourRatio)))}  (all-corpus ${r2(median(G.harm.map((r) => r.harmony.colourRatio)))})`);
L(`  median chord changes/bar    ${r2(median(hh.map((r) => r.harmony.changesPerBar)))}  (all-corpus ${r2(median(G.harm.map((r) => r.harmony.changesPerBar)))})`);
const hqual = sumHist(hh, (r) => r.harmony.qualities), hqT = Object.values(hqual).reduce((a, b) => a + b, 0);
L('  quality mix: ' + Object.entries(hqual).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${pct(v, hqT)}`).join('  '));
L(`  dim/aug/dim7 share          ${pct((hqual.dim || 0) + (hqual.aug || 0) + (hqual.dim7 || 0) + (hqual.min7b5 || 0), hqT)}  (all-corpus ${pct((qual.dim || 0) + (qual.aug || 0) + (qual.dim7 || 0) + (qual.min7b5 || 0), Object.values(qual).reduce((a, b) => a + b, 0))})`);
L(`  median lead out-of-key      ${r2(median(horror.filter((r) => r.melody).map((r) => r.melody.outOfKey).filter((x) => x != null)))}  (all-corpus ${r2(median(mel.map((r) => r.melody.outOfKey).filter((x) => x != null)))})`);
L(`  median tempo                ${median(horror.filter((r) => r.gates.tempo).map((r) => r.bpm))} bpm`);
L(`  drum presence               ${pct(horror.filter((r) => r.gates.drums).length, horror.length)}  (all-corpus ${pct(ok.filter((r) => r.gates.drums).length, ok.length)})`);
L(`  median concurrent parts     ${r2(median(horror.map((r) => r.sections.meanConcurrentParts)))}`);

// ---------------------------------------------------------------- Q8/Q13
H('Q8/Q13  JUNGLE: VAMPS, BASS, MALLETS, REGISTER ALTERNATION');
const jung = lane('scene', 'jungle', (r) => r.gates.length);
const jh = jung.filter((r) => r.gates.harmony);
L(`  n=${jung.length}, harmony-usable ${jh.length}`);
L(`  median distinct chord ROOTS per file: ${median(jh.map((r) => r.harmony.distinctRoots))}  (all-corpus ${median(G.harm.map((r) => r.harmony.distinctRoots))})`);
L(`  median chord changes/bar: ${r2(median(jh.map((r) => r.harmony.changesPerBar)))}  (all-corpus ${r2(median(G.harm.map((r) => r.harmony.changesPerBar)))})`);
L(`  minor-mode share: ${pct(jung.filter((r) => r.keyMode === 'minor').length, jung.length)}`);
const jmal = jung.filter((r) => r.malletAlt);
L(`  files carrying a mallet/ethnic pitched part: ${pct(jmal.length, jung.length)}  (all-corpus ${pct(ok.filter((r) => r.malletAlt).length, ok.length)})`);
L(`  median register-ALTERNATION of those parts: ${r2(median(jmal.map((r) => r.malletAlt.medAlternation)))}  (all-corpus ${r2(median(ok.filter((r) => r.malletAlt).map((r) => r.malletAlt.medAlternation)))})`);
L('    (1.0 = every step reverses direction, i.e. strict high-low-high-low)');
const jd = jung.filter((r) => r.gates.drums);
L(`  hand-drum presence: ${pct(jd.filter((r) => r.drums.roles.hand_drum).length, jd.length || 1)}  (all-corpus ${pct(dr.filter((r) => r.drums.roles.hand_drum).length, dr.length)})`);
L(`  shaker presence:    ${pct(jd.filter((r) => r.drums.roles.shaker).length, jd.length || 1)}  (all-corpus ${pct(dr.filter((r) => r.drums.roles.shaker).length, dr.length)})`);

// ---------------------------------------------------------------- Q15
H('Q15  DESERT: bII AND WHAT FOLLOWS IT');
const dz = desert.filter((r) => r.gates.harmony && r.gates.key);
let bII = 0, bIIto = {};
let allbII = 0, allbIIto = {};
const scanBigrams = (rs, into) => { let c = 0; for (const r of rs) for (const b of (r.harmony.bigrams || [])) { const [from, to] = b.split('>'); if (from.startsWith('1:') || from === '1') { c++; into[to] = (into[to] || 0) + 1; } } return c; };
bII = scanBigrams(dz, bIIto);
allbII = scanBigrams(G.harm.filter((r) => r.gates.key), allbIIto);
L(`  desert harmony+key set n=${dz.length}`);
L(`  bII chords seen in desert: ${bII}  (corpus-wide ${allbII})`);
L(`  desert files containing ANY bII: ${pct(dz.filter((r) => (r.harmony.bigrams || []).some((b) => b.startsWith('1:') || b.startsWith('1>'))).length, dz.length)}`);
L(`  corpus files containing ANY bII: ${pct(G.harm.filter((r) => r.gates.key && (r.harmony.bigrams || []).some((b) => b.startsWith('1:') || b.startsWith('1>'))).length, G.harm.filter((r) => r.gates.key).length)}`);
L('  what follows bII in DESERT: ' + Object.entries(bIIto).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${pct(v, bII)}`).join('  '));
L('  what follows bII CORPUS-WIDE: ' + Object.entries(allbIIto).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${pct(v, allbII)}`).join('  '));
const bvii = Object.entries(bIIto).filter(([k]) => k.startsWith('10:min') || k === '10:min7').reduce((a, [, v]) => a + v, 0);
L(`  -> bII followed by a b7-MINOR (bviim): desert ${pct(bvii, bII)}, corpus ${pct(Object.entries(allbIIto).filter(([k]) => k.startsWith('10:min')).reduce((a, [, v]) => a + v, 0), allbII)}`);

L('\n\nEND OF REPORT');
