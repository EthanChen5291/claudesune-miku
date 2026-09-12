// r38 — "understand how it's more harmonious than ours and sounds better".
// LIKE-FOR-LIKE harmonic density, both sides collapsed to sounding PITCH
// CLASSES on an 8th grid:
//   corpus side: audios/vocaloid-r35/*.mid (NOTE + BASS + VOICE, the r35 roles)
//   engine side: a page's `mix` haps (every layer, in the mix, masks applied)
// Per song: distinct pcs sounding per 8th (median / p90), semitone rubs per bar
// (two sounding pcs a semitone apart — counted at pc level, so an octave apart
// still rubs), tritone pairs per bar, share of 8ths whose sounding set fits a
// TRIAD or 7th (a set the ear labels as one chord), out-of-key share of all
// sounding pcs, and for the engine the per-layer out-of-chord rate against the
// song's own chord symbol for the bar.
//   node scripts/probe-harmony-density-r38.mjs corpus
//   node scripts/probe-harmony-density-r38.mjs audition/band.html [audition/vocaloid.html …]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { solveKeyKS } from '../src/ingest/piano.js';
import { readCorpusMidi, extractParts } from './corpus-midi.mjs';

const mod12 = (x) => ((x % 12) + 12) % 12;
const r3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);
const med = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (a, p) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const NOTE_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const midiOf = (nv) => { if (typeof nv === 'number') return Math.round(nv); const m = /^([a-gA-G])([#b]*)(-?\d+)$/.exec(String(nv)); if (!m) return null; let pc = NOTE_PC[m[1].toLowerCase()]; for (const a of m[2]) pc += a === '#' ? 1 : -1; return (Number(m[3]) + 1) * 12 + pc; };
const MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10];
// every triad / seventh shape, as pc sets relative to a root
const SHAPES = [[0, 4, 7], [0, 3, 7], [0, 5, 7], [0, 2, 7], [0, 3, 6], [0, 4, 8], [0, 4, 7, 11], [0, 4, 7, 10], [0, 3, 7, 10], [0, 3, 6, 10], [0, 3, 6, 9], [0, 4, 7, 9], [0, 3, 7, 9], [0, 5, 7, 10], [0, 4, 7, 14 % 12], [0, 3, 7, 14 % 12], [0, 7]];
function fitsChord(pcs) {
  if (pcs.size <= 2) return true;
  for (let root = 0; root < 12; root++) for (const sh of SHAPES) { const set = new Set(sh.map((s) => mod12(root + s))); if ([...pcs].every((p) => set.has(p))) return true; }
  return false;
}
// notes: [{t (in 8ths, float), dur (8ths), midi}] -> metrics over `bars`
function metrics(notes, bars, keyPcs, chordPcsAtBar = null) {
  const slots = bars * 8;
  const sounding = Array.from({ length: slots }, () => new Set());
  for (const n of notes) { const a = Math.max(0, Math.floor(n.t + 1e-6)), b = MODE === 'onset' ? a + 1 : Math.min(slots, Math.ceil(n.t + Math.max(n.dur, 0.5) - 1e-6)); for (let s = a; s < Math.min(slots, b); s++) sounding[s].add(mod12(n.midi)); }
  // STALE SUSTAIN (engine side of the peer's point): a note held >= 2 beats whose
  // pc leaves the chord label while it still sounds — a held pad against a change
  let stale = 0, heldN = 0;
  if (chordPcsAtBar) for (const n of notes) { if (n.dur < 4) continue; heldN++; const b0 = Math.floor(n.t / 8), b1 = Math.floor((n.t + n.dur - 0.01) / 8); for (let b = b0 + 1; b <= b1; b++) { const set = chordPcsAtBar(b); if (set && !set.has(mod12(n.midi))) { stale++; break; } } }
  const counts = [], rubs = [], tris = [], fits = []; let outKey = 0, total = 0;
  for (let b = 0; b < bars; b++) { let rub = 0, tri = 0; for (let s = b * 8; s < b * 8 + 8; s++) { const S = sounding[s]; if (!S.size) continue; counts.push(S.size); const arr = [...S]; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) { const d = mod12(arr[i] - arr[j]); if (d === 1 || d === 11) rub++; if (d === 6) tri++; } fits.push(fitsChord(S) ? 1 : 0); for (const p of arr) { total++; if (!keyPcs.has(p)) outKey++; } } rubs.push(rub); tris.push(tri); }
  return { staleHeld: heldN ? r3(stale / heldN) : null, heldN, pcsMed: med(counts), pcsP90: pct(counts, 0.9), rubsPerBar: r3(rubs.reduce((a, b) => a + b, 0) / bars), triPerBar: r3(tris.reduce((a, b) => a + b, 0) / bars), fitsChord: r3(fits.reduce((a, b) => a + b, 0) / (fits.length || 1)), outOfKey: r3(outKey / (total || 1)) };
}
const MODE = process.env.MODE ?? 'sustain';      // 'sustain' | 'onset'
const MIN_GAIN = Number(process.env.MIN_GAIN ?? 0); // engine only: drop haps under this gain
const target = process.argv[2] ?? 'corpus';
const rows = [];
if (target === 'corpus') {
  const DIR = 'audios/vocaloid-r35';
  const R35 = JSON.parse(readFileSync(join(DIR, '_analysis.json'), 'utf8'));
  for (const r of R35) {
    if (r.skipped) continue;
    const mid = readCorpusMidi(join(DIR, r.file));
    const parts = extractParts(mid);
    const [num, den] = mid.timeSig; const barTicks = mid.ppq * 4 * (num / den); const e8 = barTicks / 8;
    const use = parts.filter((p) => [r.tracks.voice, r.tracks.bass, ...r.tracks.acc].includes(p.name));
    const notes = use.flatMap((p) => p.notes.map((n) => ({ t: (n.tick - (r.gridShift16ths || 0) * barTicks / 16) / e8, dur: n.dur / e8, midi: n.midi })));
    const bars = Math.ceil(mid.endTick / barTicks);
    const key = solveKeyKS(mid.notes);
    const keyPcs = new Set((key.mode === 'minor' ? MINOR : MAJOR).map((s) => mod12(key.tonicPc + s)));
    if (key.mode === 'minor') keyPcs.add(mod12(key.tonicPc + 11));
    rows.push({ name: r.label.song, ...metrics(notes, bars, keyPcs), layers: use.length });
  }
} else {
  for (const page of process.argv.slice(2)) {
    const html = readFileSync(page, 'utf8'); const i0 = html.indexOf('const DATA = ');
    const data = JSON.parse(html.slice(i0 + 13, html.indexOf(';\n', i0)));
    for (const s of data.songs) {
      const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
      const haps = hapsByLabel(ev, 0, s.totalBars).get('p').haps;
      const notes = []; const perLayer = new Map();
      const QP = { '': [0,4,7], m: [0,3,7], 7: [0,4,7,10], m7: [0,3,7,10], '^7': [0,4,7,11], m9: [0,3,7,10,2], 9: [0,4,7,10,2], '^9': [0,4,7,11,2], 13: [0,4,7,10,2,9], '13sus': [0,5,7,10,2,9], sus: [0,5,7], '7sus': [0,5,7,10], 6: [0,4,7,9], m6: [0,3,7,9], o: [0,3,6], o7: [0,3,6,9], m7b5: [0,3,6,10], madd9: [0,3,7,2] };
      const symPcs = (sym) => { const mm = /^([A-G][#b]?)(.*)$/.exec(sym || ''); if (!mm) return null; const root = midiOf(mm[1] + '4') % 12; return new Set((QP[mm[2]] ?? QP['']).map((x) => mod12(root + x))); };
      const syms = s.symbols || []; const chordPcsAtBar = syms.length ? (b) => symPcs(syms[b % syms.length]) : null;
      for (const h of haps) { const m = midiOf(h.value?.note); if (m == null) continue; if (MIN_GAIN && Number(h.value?.gain ?? 1) < MIN_GAIN) continue; const t = Number(h.whole?.begin ?? h.part.begin) * 8; const d = (Number(h.whole?.end ?? h.part.end) - Number(h.whole?.begin ?? h.part.begin)) * 8; notes.push({ t, dur: d, midi: m }); const L = h.value?.s ?? '?'; if (!perLayer.has(L)) perLayer.set(L, []); perLayer.get(L).push({ t, midi: m }); }
      const m = /^([A-G][#b]?):(major|minor)$/.exec(s.key); const tonic = m ? midiOf(m[1] + '4') % 12 : 0; const minor = m?.[2] === 'minor';
      const keyPcs = new Set((minor ? MINOR : MAJOR).map((x) => mod12(tonic + x))); if (minor) keyPcs.add(mod12(tonic + 11));
      const layerOut = [...perLayer.entries()].map(([L, ns]) => `${L} ${(100 * ns.filter((n) => !keyPcs.has(mod12(n.midi))).length / ns.length).toFixed(0)}%`).join(' ');
      rows.push({ name: s.name, ...metrics(notes, s.totalBars, keyPcs, chordPcsAtBar), layers: perLayer.size, symbols: (s.symbols || []).join(' '), layerOut });
    }
  }
}
for (const r of rows) console.log(`${r.name.padEnd(30)}${r.heldN != null ? ' held>=2b ' + r.heldN + ' stale ' + r.staleHeld : ''} layers ${String(r.layers).padStart(2)}  pcs/8th med ${r.pcsMed} p90 ${r.pcsP90}  rubs/bar ${r.rubsPerBar}  tritones/bar ${r.triPerBar}  fits-a-chord ${r.fitsChord}  out-of-key ${r.outOfKey}${r.symbols ? '  | ' + r.symbols : ''}${r.layerOut ? '\n    out-of-key by layer: ' + r.layerOut : ''}`);
console.log(`\nMEDIANS [${MODE}${MIN_GAIN ? ' gain>=' + MIN_GAIN : ''}] (${rows.length}): pcs/8th ${med(rows.map((r) => r.pcsMed))} (p90 ${med(rows.map((r) => r.pcsP90))}) · rubs/bar ${med(rows.map((r) => r.rubsPerBar))} · tritones/bar ${med(rows.map((r) => r.triPerBar))} · fits-a-chord ${med(rows.map((r) => r.fitsChord))} · out-of-key ${med(rows.map((r) => r.outOfKey))} · layers ${med(rows.map((r) => r.layers))}`);
