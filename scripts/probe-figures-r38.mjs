// r38 — OUR songs classed by the same figure rule as the corpus: for every
// song on a page, the acc hand (`_acc` solo, unmasked) and the bass (the mix's
// lowest layer under midi 52) in 4-bar windows, plus section labels from the
// page's `sections` (role) where present.
//   node scripts/probe-figures-r38.mjs audition/band.html
import { readFileSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { accFigure, bassFigure } from './figure-classes-r38.mjs';
const NOTE_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const midiOf = (nv) => { if (typeof nv === 'number') return Math.round(nv); const m = /^([a-gA-G])([#b]*)(-?\d+)$/.exec(String(nv)); if (!m) return null; let pc = NOTE_PC[m[1].toLowerCase()]; for (const a of m[2]) pc += a === '#' ? 1 : -1; return (Number(m[3]) + 1) * 12 + pc; };
const hist = (arr) => { const h = {}; for (const x of arr) h[x] = (h[x] ?? 0) + 1; return h; };
const pctTable = (h) => { const n = Object.values(h).reduce((a, b) => a + b, 0) || 1; return Object.entries(h).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / n).toFixed(0)}%`).join(' · '); };
const BT = 960, BAR = BT * 4;
const toNotes = (haps) => haps.map((h) => { const m = midiOf(h.value?.note); if (m == null) return null; const b = Number(h.whole?.begin ?? h.part.begin), e = Number(h.whole?.end ?? h.part.end); return { tick: Math.round(b * BAR), dur: Math.max(1, Math.round((e - b) * BAR)), midi: m, s: h.value?.s }; }).filter(Boolean);
const accAll = {}, bassAll = {};
for (const page of process.argv.slice(2)) {
  const html = readFileSync(page, 'utf8'); const i0 = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i0 + 13, html.indexOf(';\n', i0)));
  for (const s of data.songs) {
    const accExpr = s.solos?._acc; if (!accExpr) { console.log(s.name, 'no _acc solo'); continue; }
    const evA = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: ${accExpr}`);
    const acc = toNotes(hapsByLabel(evA, 0, s.totalBars).get('p').haps);
    const evM = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
    const mix = toNotes(hapsByLabel(evM, 0, s.totalBars).get('p').haps);
    // the bass = the layer (by sound) with the lowest median pitch under 52
    const bySound = new Map(); for (const n of mix) { if (!bySound.has(n.s)) bySound.set(n.s, []); bySound.get(n.s).push(n); }
    const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
    const bassSound = [...bySound.entries()].map(([k, v]) => [k, med(v.map((n) => n.midi))]).filter(([, m]) => m < 52).sort((a, b) => a[1] - b[1])[0]?.[0];
    const bass = bassSound ? bySound.get(bassSound) : [];
    const roleAt = (bar) => (s.sections ?? []).find((x) => bar >= x.startBar && bar < x.startBar + x.bars)?.role ?? (s.sections ? 'intro' : '?');
    const rows = [];
    for (let b = 0; b < s.totalBars; b += 4) { const bars = Math.min(4, s.totalBars - b); const inW = (arr) => arr.filter((n) => n.tick >= b * BAR && n.tick < (b + bars) * BAR); const af = accFigure(inW(acc), bars, BAR, BT); const bf = bassFigure(inW(bass), bars, BAR, BT, () => null); const role = roleAt(b); rows.push(`${role[0]}:${af.cls}/${bf.cls}`); (accAll[role] ??= []).push(af.cls); (bassAll[role] ??= []).push(bf.cls); }
    console.log(`${s.name.padEnd(16)} acc=${s.accompaniment ?? '?'} bass=${bassSound ?? '-'} | ${rows.join(' ')}`);
  }
}
for (const r of Object.keys(accAll)) console.log(`OUR ACC in ${r.padEnd(8)}: ${pctTable(hist(accAll[r]))}`);
for (const r of Object.keys(bassAll)) console.log(`OUR BASS in ${r.padEnd(8)}: ${pctTable(hist(bassAll[r]))}`);
