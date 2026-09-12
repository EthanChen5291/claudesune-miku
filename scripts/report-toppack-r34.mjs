// r34 — aggregate audios/toppack-r34/_analysis.json by lane / emotion into the
// markdown tables research/toppack-r34.md is built on. Analysis only (D95).
//
// One SONG counts once: the pack carries four Fadeds and three All of Mes, so
// every aggregate takes one representative file per song (the fullest
// non-"easy" version) and reports n = songs. Per-file rows stay in the JSON.
//
// Run: node scripts/report-toppack-r34.mjs [--songs]   (--songs appends the per-song table)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const J = JSON.parse(readFileSync(join(ROOT, 'audios', 'toppack-r34', '_analysis.json'), 'utf8'));
const median = (a) => { const b = a.filter((x) => x != null && !Number.isNaN(x)).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
const mean = (a) => { const b = a.filter((x) => x != null); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const pct = (x, d = 0) => (x == null ? '—' : (x * 100).toFixed(d) + '%');
const num = (x, d = 2) => (x == null ? '—' : Number(x).toFixed(d));
const wantSongs = process.argv.includes('--songs');

// ---- one representative file per song
const bySong = new Map();
for (const f of J.files) {
  const cur = bySong.get(f.song);
  const easy = f.tags.includes('easy');
  const score = (easy ? 0 : 1e6) + f.lh.notes + f.rh.notes;
  if (!cur || score > cur._score) bySong.set(f.song, { ...f, _score: score });
}
const S = [...bySong.values()];
const lanes = [...new Set(S.map((s) => s.lane))].sort((a, b) => S.filter((s) => s.lane === b).length - S.filter((s) => s.lane === a).length);
const by = (lane) => S.filter((s) => s.lane === lane);
const line = (cells) => `| ${cells.join(' | ')} |`;
const header = (cells) => `${line(cells)}\n${line(cells.map(() => '---'))}`;

console.log(`## Corpus\n`);
console.log(`${J.files.length} files read, ${S.length} distinct songs (duplicates collapsed to the fullest non-easy version), ${J.failed.length} unreadable.\n`);
console.log(header(['lane', 'songs', 'files', 'bpm (median)', 'major share', '4/4 share', 'bars (median)', 'hands by track']));
for (const l of lanes) {
  const xs = by(l);
  const files = J.files.filter((f) => f.lane === l).length;
  console.log(line([l, xs.length, files, num(median(xs.map((s) => s.bpm)), 0), pct(mean(xs.map((s) => s.key.endsWith('major') ? 1 : 0))), pct(mean(xs.map((s) => s.meter.startsWith('4/4') ? 1 : 0))), num(median(xs.map((s) => s.totalBars)), 0), pct(mean(xs.map((s) => s.hands.startsWith('tracks') ? 1 : 0)))]));
}
const emos = {};
for (const s of S) emos[`${s.lane}/${s.emotion}`] = (emos[`${s.lane}/${s.emotion}`] ?? 0) + 1;
console.log(`\nlane/emotion cells with ≥3 songs: ${Object.entries(emos).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}\n`);

// ---- keys
console.log(`## Keys\n`);
const keyCount = {};
for (const s of S) keyCount[s.key] = (keyCount[s.key] ?? 0) + 1;
console.log(Object.entries(keyCount).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, n]) => `${k} ${n}`).join(' · '));
console.log(`\nmajor ${S.filter((s) => s.key.endsWith('major')).length} / minor ${S.filter((s) => s.key.endsWith('minor')).length}; key-detector margin median ${num(median(S.map((s) => s.keyMargin)), 3)}\n`);

// ---- harmony by lane
console.log(`## Harmony by lane (medians over songs)\n`);
console.log(header(['lane', 'n', 'chords/bar', 'sub-bar changes', 'colour (7/9/sus/6)', 'diatonic', 'inversions (LH bass ≠ root)', 'pedal', 'desc. bass runs/song', 'loop bars', 'loop cover']));
for (const l of lanes) {
  const xs = by(l);
  const h = (k) => median(xs.map((s) => s.harmony[k]));
  const loopBars = median(xs.flatMap((s) => s.harmony.loops.slice(0, 1).map((x) => x.loopBars)));
  console.log(line([l, xs.length, num(h('chordsPerBar')), pct(h('subBarChangeShare')), pct(h('colorShare')), pct(h('diatonicShare')), pct(h('inversionShare')), pct(h('pedalHalfShare')), num(mean(xs.map((s) => s.harmony.descendingBassRuns)), 1), num(loopBars, 0), pct(h('loopCoverShare'))]));
}
// span histogram pooled
const spans = {};
for (const s of S) for (const [k, n] of Object.entries(s.harmony.spanHist)) spans[k] = (spans[k] ?? 0) + n;
const spanTotal = Object.values(spans).reduce((a, b) => a + b, 0);
console.log(`\nchord span (bars) pooled over ${spanTotal} labelled segments: ${Object.entries(spans).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, n]) => `${k}b ${pct(n / spanTotal)}`).join(' · ')}\n`);
// quality vocabulary pooled (half-bar weighted)
const q = {};
for (const s of S) for (const [k, n] of Object.entries(s.harmony.qualityHist)) q[k] = (q[k] ?? 0) + n;
const qTotal = Object.values(q).reduce((a, b) => a + b, 0);
console.log(`chord qualities (half-bar weighted): ${Object.entries(q).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${pct(n / qTotal, 1)}`).join(' · ')}\n`);
// root motion pooled
const rm = {};
for (const s of S) for (const [k, n] of Object.entries(s.harmony.rootMotion)) rm[k] = (rm[k] ?? 0) + n;
const rmTotal = Object.values(rm).reduce((a, b) => a + b, 0);
console.log(`root motion: ${Object.entries(rm).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${pct(n / rmTotal, 1)}`).join(' · ')}\n`);

// ---- loops: the famous shapes, counted by song
console.log(`## Loops (repaired extractor, counted once per song, rotation-insensitive)\n`);
const rot = (numerals) => { const t = numerals.split(' '); let best = null; for (let i = 0; i < t.length; i++) { const r = [...t.slice(i), ...t.slice(0, i)].join(' '); if (best == null || r < best) best = r; } return best; };
const strip = (n) => n.replace(/(\^7|m7b5|7sus|sus|add9|m9|m7|o7|[6792])/g, '').replace(/\s+/g, ' ');
const loopCount = new Map();
for (const s of S) {
  const seen = new Set();
  for (const l of s.harmony.loops.slice(0, 2)) {
    if (l.loopBars > 8 || l.reps < 2) continue;
    const key = `${s.key.endsWith('major') ? 'M' : 'm'} ${rot(strip(l.numerals))}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!loopCount.has(key)) loopCount.set(key, { n: 0, songs: [], lanes: {}, examples: [] });
    const e = loopCount.get(key);
    e.n++; e.songs.push(s.song); e.lanes[s.lane] = (e.lanes[s.lane] ?? 0) + 1;
    if (e.examples.length < 3) e.examples.push(`${s.song}: ${l.numerals} (${l.symbols}) hr ${l.harmonicRhythm}`);
  }
}
console.log(header(['mode', 'loop (triad skeleton, rotation-free)', 'songs', 'lanes', 'examples (with colour + harmonic rhythm)']));
for (const [k, e] of [...loopCount.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 40)) {
  console.log(line([k[0], k.slice(2), e.n, Object.entries(e.lanes).map(([l, n]) => `${l} ${n}`).join(', '), e.examples.join('; ')]));
}
// cadence classes
const cad = {};
for (const s of S) for (const l of s.harmony.loops.slice(0, 1)) cad[l.cadence] = (cad[l.cadence] ?? 0) + 1;
console.log(`\nprimary-loop cadence classes: ${Object.entries(cad).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')}\n`);
// borrowed chords by lane
console.log(`## Borrowed / chromatic chords (songs carrying each, by lane)\n`);
const bor = {};
// a chromatic label needs >= 2 half-bar segments in the song to count — one
// segment is the half-bar labeller flapping on a passing tone, not a device
for (const s of S) for (const [k, cnt] of Object.entries(s.harmony.borrowed)) { if (cnt < 2) continue; const tag = k.split(' = ')[1]; if (!bor[tag]) bor[tag] = { n: 0, lanes: {} }; bor[tag].n++; bor[tag].lanes[s.lane] = (bor[tag].lanes[s.lane] ?? 0) + 1; }
console.log(header(['device (≥2 segments in the song)', 'songs', 'lanes']));
for (const [k, e] of Object.entries(bor).sort((a, b) => b[1].n - a[1].n).slice(0, 16)) console.log(line([k, e.n, Object.entries(e.lanes).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', ')]));
// slash chords
const sl = {};
for (const s of S) for (const [k, n] of Object.entries(s.harmony.slashes)) sl[k] = (sl[k] ?? 0) + 1;
console.log(`\nmost common inversions (songs): ${Object.entries(sl).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k} ${n}`).join(' · ')}\n`);

// ---- LEFT HAND by lane
console.log(`## Left hand by lane\n`);
const CLASSES = ['block', 'comp', 'alberti', 'arp_up', 'arp_updown', 'arp_mixed', 'broken_octave', 'octaves', 'octave_pulse', 'fifths', 'stride', 'walk', 'pedal', 'single_hit', 'mixed'];
console.log(header(['lane', 'n', 'dominant class (songs)', 'onsets/bar', 'notes per attack', 'low note (median midi)', 'spread (st)', 'note len (beats)', 'on-beat', 'off-8th', 'odd-16th', 'tresillo slots']));
for (const l of lanes) {
  const xs = by(l);
  const dom = {};
  for (const s of xs) if (s.lh.classTop) dom[s.lh.classTop] = (dom[s.lh.classTop] ?? 0) + 1;
  const m = (k) => median(xs.map((s) => s.lh[k]));
  const r = (k) => median(xs.map((s) => s.lh.rhythm[k]));
  console.log(line([l, xs.length, Object.entries(dom).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} ${n}`).join(', '), num(m('onsetsPerBar'), 1), num(m('clusterMean')), num(m('lowMed'), 0), num(m('spreadMed'), 0), num(m('medDurBeats')), pct(r('onBeat')), pct(r('off8')), pct(r('odd16')), pct(r('tresillo'))]));
}
// class share pooled by bars
const cls = {};
for (const s of S) for (const [k, n] of Object.entries(s.lh.classes)) cls[k] = (cls[k] ?? 0) + n;
const clsTotal = Object.values(cls).reduce((a, b) => a + b, 0);
console.log(`\nLH class share pooled over ${clsTotal} bars: ${Object.entries(cls).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${pct(n / clsTotal, 1)}`).join(' · ')}\n`);
// top figure signatures across songs
console.log(`### Recurring left-hand figures (chord-relative tokens, grid slots), songs carrying each as their most common bar\n`);
const figs = new Map();
for (const s of S) {
  const f = s.lh.topFigures[0];
  if (!f || f.share < 0.15) continue;
  const key = `${f.tokens.join(' ')} @ ${f.onsets.join(',')}`;
  if (!figs.has(key)) figs.set(key, { n: 0, lanes: {}, songs: [], octave: [] });
  const e = figs.get(key); e.n++; e.lanes[s.lane] = (e.lanes[s.lane] ?? 0) + 1; if (e.songs.length < 4) e.songs.push(s.song); e.octave.push(f.octave);
}
console.log(header(['figure', 'songs', 'lanes', 'octave (median)', 'examples']));
for (const [k, e] of [...figs.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 30)) console.log(line([k, e.n, Object.entries(e.lanes).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', '), median(e.octave), e.songs.join(', ')]));

// ---- RIGHT HAND by lane (vs the r33 reference bands)
console.log(`\n## Right hand — top-voice melody by lane (medians over songs)\n`);
console.log(header(['lane', 'n', 'onsets/active bar', 'note len (beats)', 'rest', 'range (st)', 'stepwise', 'leaps >P5', 'repeat', 'NCT', 'NCT resolved', 'strong-beat gradient', 'odd-16th', 'final-slot shorts', 'pentatonic', 'in scale', 'bars repeating a rhythm', 'phrase (bars)', 'dyad/3+ under the top', 'climax at']));
for (const l of lanes) {
  const xs = by(l).filter((s) => s.rh.melody);
  const m = (k) => median(xs.map((s) => s.rh.melody[k]));
  const r = (k) => median(xs.map((s) => s.rh.melody.rhythm[k]));
  const t = (k) => median(xs.map((s) => s.rh.melody.thickness[k]));
  console.log(line([l, xs.length, num(m('onsetsPerActiveBar'), 1), num(m('medDurBeats')), pct(m('restShare')), num(m('range'), 0), pct(m('step')), pct(m('big')), pct(m('rep')), pct(m('nct')), pct(m('nctResolved')), `+${num(m('gradient') * 100, 0)} pts`, pct(r('odd16')), pct(m('finalSlotShortShare')), pct(m('pentatonic')), pct(m('inScale')), pct(m('rhythmRepeatShare')), num(m('phraseBarsMed'), 1), `${pct(t('dyad'))} / ${pct(t('triadPlus'))}`, pct(m('climaxAt'))]));
}
const cont = {};
for (const s of S) if (s.rh.melody) for (const [k, n] of Object.entries(s.rh.melody.contours)) cont[k] = (cont[k] ?? 0) + n;
const contTotal = Object.values(cont).reduce((a, b) => a + b, 0);
console.log(`\nphrase contours pooled: ${Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${pct(n / contTotal, 1)}`).join(' · ')}\n`);

// ---- form by lane
console.log(`## Form and dynamics by lane\n`);
console.log(header(['lane', 'n', 'sections', 'intro bars (median)', 'intro ≤ 1 loop share', 'RH lift (st, max section vs first)', 'velocity values (median)', 'vel arc rising/flat/falling', 'sustain pedal used', 'tempo changes']));
for (const l of lanes) {
  const xs = by(l);
  const arc = { rising: 0, flat: 0, falling: 0 };
  for (const s of xs) arc[s.form.velArc]++;
  console.log(line([l, xs.length, num(median(xs.map((s) => s.form.sectionCount)), 0), num(median(xs.map((s) => s.rh.introBars)), 0), pct(mean(xs.map((s) => (s.rh.introBars <= 4 ? 1 : 0)))), num(median(xs.map((s) => s.form.lift)), 0), num(median(xs.map((s) => s.form.velDistinct)), 0), `${arc.rising}/${arc.flat}/${arc.falling}`, pct(mean(xs.map((s) => (s.form.sustainEvents > 0 ? 1 : 0)))), pct(mean(xs.map((s) => (s.tempoEvents > 1 ? 1 : 0))))]));
}

// ---- layers (multi-track files)
console.log(`\n## Multi-track arrangements (${S.filter((s) => s.layers).length} songs)\n`);
console.log(header(['song', 'lane', 'parts', 'concurrency mean/max', 'entry bars', 'same-family pairs', 'echo pairs', 'drums (groove bars)']));
for (const s of S.filter((s) => s.layers).sort((a, b) => b.layers.declared - a.layers.declared)) {
  const L = s.layers;
  console.log(line([s.song, s.lane, L.declared, `${L.concurrencyMean}/${L.concurrencyMax}`, L.entryBars.slice(0, 8).join(','), pct(L.sameFamilyPairs), L.relations.filter((r) => r.echo).length, L.drums.map((d) => d.groove ? `${d.groove.bars}: ${d.groove.sig}` : '-').join(' | ').slice(0, 80)]));
}

// ---- meters outside 4/4
console.log(`\n## Meter\n`);
const met = {};
for (const s of S) met[s.meter] = (met[s.meter] ?? 0) + 1;
console.log(Object.entries(met).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · '));
console.log(`\n6/8 and 12/8 songs: ${S.filter((s) => /^(6\/8|12\/8)/.test(s.meter)).map((s) => s.song).join(', ')}`);
console.log(`3/4 songs: ${S.filter((s) => s.meter.startsWith('3/4')).map((s) => s.song).join(', ')}\n`);

if (wantSongs) {
  console.log(`## Per-song digest (representative file)\n`);
  console.log(header(['song', 'lane/emotion/energy', 'key', 'bpm', 'meter', 'bars', 'primary loop', 'harmonic rhythm', 'cadence', 'LH class', 'LH figure', 'RH on/bar', 'step', 'NCT/res', 'odd16', 'sections', 'intro']));
  for (const s of [...S].sort((a, b) => a.lane.localeCompare(b.lane) || a.song.localeCompare(b.song))) {
    const l = s.harmony.loops[0];
    const m = s.rh.melody;
    const f = s.lh.topFigures[0];
    console.log(line([s.song, `${s.lane}/${s.emotion}/${s.energy}`, s.key, s.bpm, s.meter, s.totalBars, l ? `${l.numerals} (${l.symbols})` : '—', l ? l.harmonicRhythm : '—', l ? l.cadence : '—', s.lh.classTop ?? '—', f ? `${f.tokens.join(' ')} @${f.onsets.join(',')}` : '—', m ? num(m.onsetsPerActiveBar, 1) : '—', m ? pct(m.step) : '—', m ? `${pct(m.nct)}/${pct(m.nctResolved)}` : '—', m ? pct(m.rhythm.odd16) : '—', s.form.sectionCount, s.rh.introBars]));
  }
}
