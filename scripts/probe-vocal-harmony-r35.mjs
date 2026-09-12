// r35 — the ENGINE side of the voice-vs-harmony comparison, measured IN THE MIX
// (the solo-vs-mix trap, D137): for every song on a vocal page that has a sung
// score (audition/hq/<name>.vocal-score.json), the sung notes are placed
// against the page's `mix` haps and the same yardsticks as the Vocaloid
// analyzer are taken — does the accompaniment sounding at the onset (minus any
// note doubling the voice's own pc) contain the voice's pc, by beat strength;
// how often the acc strikes with the voice; how often it doubles the voice at
// the octave; the nearest acc note under the voice.
//   node scripts/probe-vocal-harmony-r35.mjs [audition/vocal.html]
import { readFileSync, existsSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { chordTimeline, chordAt, solveKeyKS } from '../src/ingest/piano.js';
const PAGE = process.argv[2] ?? 'audition/vocal.html';
const html = readFileSync(PAGE, 'utf8');
const i0 = html.indexOf('const DATA = ');
const data = JSON.parse(html.slice(i0 + 13, html.indexOf(';\n', i0)));
const NOTE_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const midiOf = (nv) => { if (typeof nv === 'number') return Math.round(nv); const m = /^([a-gA-G])([#b]*)(-?\d+)$/.exec(String(nv)); if (!m) return null; let pc = NOTE_PC[m[1].toLowerCase()]; for (const a of m[2]) pc += a === '#' ? 1 : -1; return (Number(m[3]) + 1) * 12 + pc; };
const mod12 = (x) => ((x % 12) + 12) % 12;
const med = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pc = (x) => (x == null ? '—' : `${(100 * x).toFixed(0)}%`);
const rows = [];
const QUALITY_PCS = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], '^7': [0, 4, 7, 11], m9: [0, 3, 7, 10, 14], madd9: [0, 3, 7, 14], 9: [0, 4, 7, 10, 14], sus: [0, 5, 7], '7sus': [0, 5, 7, 10], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], o: [0, 3, 6], o7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], 2: [0, 2, 7], 5: [0, 7], aug: [0, 4, 8] };
const chordPcs = (rootPc, q) => new Set((QUALITY_PCS[q] ?? QUALITY_PCS['']).map((i) => mod12(rootPc + i)));
const MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10];
for (const s of data.songs) {
  const sf = `audition/hq/${s.name}.vocal-score.json`;
  if (!existsSync(sf)) continue;
  const score = JSON.parse(readFileSync(sf, 'utf8'));
  const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
  const haps = hapsByLabel(ev, 0, s.totalBars).get('p').haps.map((h) => ({ b: Number(h.whole?.begin ?? h.part.begin), e: Number(h.whole?.end ?? h.part.end), m: h.value?.note != null ? midiOf(h.value.note) : null, s: h.value?.s })).filter((h) => h.m != null);
  const spb = score.secondsPerBar;
  const tol = 1 / 64;
  const BT = 384; // pseudo ticks per bar
  const notes = haps.map((h) => ({ tick: Math.round(h.b * BT), dur: Math.max(1, Math.round((h.e - h.b) * BT)), midi: h.m }));
  // the guide + doublers = mix notes at a sung onset with the sung pc
  const sung = score.notes.map((n) => ({ t: n.start / spb, pc: mod12(n.midi), midi: n.midi }));
  const isGuide = new Set();
  for (const n of sung) for (let k = 0; k < haps.length; k++) if (Math.abs(haps[k].b - n.t) <= tol && mod12(haps[k].m) === n.pc) isGuide.add(k);
  const melody = [...isGuide].map((k) => notes[k]);
  const key = solveKeyKS(notes);
  const timeline = chordTimeline(notes, BT, s.totalBars, { melody, key });
  const scale = new Set((key.mode === 'minor' ? MINOR : MAJOR).map((x) => mod12(key.tonicPc + x)));
  const strength = (t) => { const slot = Math.round(((t % 1) + 1) % 1 * 16) % 16; return slot === 0 ? 'beat1' : slot === 8 ? 'beat3' : slot % 4 === 0 ? 'beat2/4' : slot % 2 === 0 ? 'off8th' : 'off16th'; };
  const agree = {}, agreeN = {};
  let nct = 0, nctRes = 0, outKey = 0, homo = 0, dblOct = 0, dblUp = 0, under = [], topAbove = 0, topN = 0, ctDur = 0, totDur = 0;
  for (let i = 0; i < sung.length; i++) {
    const n = sung[i]; const t = n.t; const st = strength(t);
    const seg = chordAt(timeline, Math.floor(t * 2));
    const pcs = seg && seg.coverage > 0 ? chordPcs(seg.rootPc, seg.quality) : null;
    const ct = pcs ? pcs.has(n.pc) : true;
    agreeN[st] = (agreeN[st] ?? 0) + 1; if (ct) agree[st] = (agree[st] ?? 0) + 1;
    const d = score.notes[i].dur; totDur += d; if (ct) ctDur += d;
    if (pcs && !ct) { nct++; const nx = sung[i + 1]; if (nx && Math.abs(nx.midi - n.midi) > 0 && Math.abs(nx.midi - n.midi) <= 2) nctRes++; }
    if (!scale.has(n.pc)) outKey++;
    const at = haps.filter((h) => Math.abs(h.b - t) <= tol);
    const others = at.filter((h) => mod12(h.m) !== n.pc);
    if (others.length) homo++;
    const dbl = at.filter((h) => mod12(h.m) === n.pc && h.m !== n.midi);
    if (dbl.length) { dblOct++; if (dbl.some((h) => h.m > n.midi)) dblUp++; }
    const snd = haps.filter((h) => h.b <= t + tol && h.e > t + tol && !(Math.abs(h.b - t) <= tol && mod12(h.m) === n.pc));
    const below = snd.map((h) => h.m).filter((m) => m < n.midi); if (below.length) under.push(n.midi - Math.max(...below));
    if (snd.length) { topN++; if (Math.max(...snd.map((h) => h.m)) > n.midi) topAbove++; }
  }
  const byS = Object.fromEntries(Object.keys(agreeN).map((k) => [k, (agree[k] ?? 0) / agreeN[k]]));
  const all = Object.values(agree).reduce((a, b) => a + b, 0) / sung.length;
  const uc = {}; for (const d of under) { const k = d <= 2 ? '2nd' : d <= 4 ? '3rd' : d <= 5 ? '4th' : d <= 7 ? '5th' : d <= 9 ? '6th' : d <= 11 ? '7th' : d === 12 ? '8ve' : '>8ve'; uc[k] = (uc[k] ?? 0) + 1; }
  const r = { name: s.name, notes: sung.length, all, byS, ctDur: ctDur / totDur, nct: nct / sung.length, nctRes: nct ? nctRes / nct : null, outKey: outKey / sung.length, homo: homo / sung.length, dblOct: dblOct / sung.length, dblUp: dblOct ? dblUp / dblOct : null, underMed: med(under), under3or4: ((uc['3rd'] ?? 0) + (uc['4th'] ?? 0)) / Math.max(1, under.length), topAbove: topAbove / Math.max(1, topN), key: `${key.tonicPc}${key.mode}` };
  rows.push(r);
  console.log(`${s.name.padEnd(24)} n ${sung.length}  CT all ${pc(all)}  beat1 ${pc(byS.beat1)} beat3 ${pc(byS.beat3)} beat2/4 ${pc(byS['beat2/4'])} off8 ${pc(byS.off8th)} off16 ${pc(byS.off16th)}  CT by dur ${pc(r.ctDur)}  NCT ${pc(r.nct)} resolved ${pc(r.nctRes)}  out-of-key ${pc(r.outKey)}  homorhythm ${pc(r.homo)}  8ve-double ${pc(r.dblOct)} (above ${pc(r.dblUp)})  under med ${r.underMed} 3rd/4th ${pc(r.under3or4)}  acc top above ${pc(r.topAbove)}`);
}
const M = (f) => med(rows.map(f).filter((x) => x != null));
console.log(`\nMEDIANS over ${rows.length} songs: CT all ${pc(M((r) => r.all))} | beat1 ${pc(M((r) => r.byS.beat1))} beat3 ${pc(M((r) => r.byS.beat3))} beat2/4 ${pc(M((r) => r.byS['beat2/4']))} off8th ${pc(M((r) => r.byS.off8th))} off16th ${pc(M((r) => r.byS.off16th))} | CT by dur ${pc(M((r) => r.ctDur))} | NCT ${pc(M((r) => r.nct))} resolved ${pc(M((r) => r.nctRes))} | out-of-key ${pc(M((r) => r.outKey))} | homorhythm ${pc(M((r) => r.homo))} | 8ve-double ${pc(M((r) => r.dblOct))} above ${pc(M((r) => r.dblUp))} | under median ${M((r) => r.underMed)} 3rd/4th ${pc(M((r) => r.under3or4))} | acc top above voice ${pc(M((r) => r.topAbove))}`);
