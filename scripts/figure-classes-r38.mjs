// r38 — the figure classifier shared by the corpus analyzer
// (analyze-vocaloid-r38.mjs) and the engine-side probe
// (probe-figures-r38.mjs), so "theirs" and "ours" are classed by ONE rule.
// Notes are {tick, dur, midi}; barTicks/beatTicks in the same units.
const mod12 = (x) => ((x % 12) + 12) % 12;
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const median = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (a, p) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const share = (n, d) => (d ? r3(n / d) : null);
// ------------------------------------------------------------------ figures
// ACC figure class for a bar-window. Inputs: the window's notes (acc), bar
// ticks, beat ticks. Classes are decided from MEASURED onset/cluster/duration
// profiles, never from names (D100's list law).
export function clusters(notes, tol = 6) {
  const m = new Map();
  for (const n of notes) { const k = Math.round(n.tick / tol); if (!m.has(k)) m.set(k, []); m.get(k).push(n); }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([, ns]) => ({ tick: ns[0].tick, notes: ns, size: ns.length, top: Math.max(...ns.map((x) => x.midi)), bottom: Math.min(...ns.map((x) => x.midi)), dur: median(ns.map((x) => x.dur)) }));
}
export function accFigure(notes, bars, barTicks, beatTicks) {
  if (!notes.length || bars <= 0) return { cls: 'silent', onsetsPerBar: 0 };
  const cl = clusters(notes);
  const onsetsPerBar = cl.length / bars;
  const slot = (t) => Math.round(((t % barTicks) / barTicks) * 16) % 16;
  const slots = cl.map((c) => slot(c.tick));
  const onBeat = share(slots.filter((s) => s % 4 === 0).length, slots.length);
  const on8 = share(slots.filter((s) => s % 2 === 0).length, slots.length);
  // SYNCOPATION: an off-8th onset whose NEXT on-beat slot carries no onset —
  // the chord is struck early and held over the beat (a tie-over). A straight
  // 8th-note block figure has half its onsets on off-8ths and is NOT syncopated.
  const grid16 = barTicks / 16;
  const slotSet = new Set(cl.map((c) => Math.floor(c.tick / grid16)));
  const antic = share(cl.filter((c) => { const g = Math.floor(c.tick / grid16); return g % 4 === 2 && !slotSet.has(g + 2) && !slotSet.has(g + 1); }).length, cl.length);
  const meanSize = mean(cl.map((c) => c.size));
  const durBeats = median(cl.map((c) => c.dur)) / beatTicks;
  const shortShare = share(cl.filter((c) => c.dur < beatTicks * 0.45).length, cl.length);
  // top-voice motion (the acc's top note, cluster to cluster)
  const tops = cl.map((c) => c.top);
  const ivs = tops.slice(1).map((t, i) => t - tops[i]);
  const stepShare = share(ivs.filter((d) => Math.abs(d) >= 1 && Math.abs(d) <= 2).length, ivs.length);
  const repShare = share(ivs.filter((d) => d === 0).length, ivs.length);
  const leapShare = share(ivs.filter((d) => Math.abs(d) >= 5).length, ivs.length);
  const topRange = tops.length ? Math.max(...tops) - Math.min(...tops) : 0;
  // 2-bar rhythm repetition inside the window (a FIGURE repeats; a free part does not)
  const rhythmSigs = []; for (let b = 0; b < bars; b += 2) { const s = cl.filter((c) => c.tick >= b * barTicks && c.tick < (b + 2) * barTicks).map((c) => Math.round(((c.tick - b * barTicks) / barTicks) * 16)).join(','); if (s) rhythmSigs.push(s); }
  const rhythmRepeat = rhythmSigs.length >= 2 ? share(rhythmSigs.length - new Set(rhythmSigs).size, rhythmSigs.length - 1) : null;
  let cls;
  if (onsetsPerBar < 1) cls = 'sparse';
  else if (durBeats >= 1.8 && onsetsPerBar <= 2.5) cls = 'sustain';
  else if (meanSize < 1.35 && onsetsPerBar >= 10) cls = 'arp16';
  else if (meanSize < 1.35 && onsetsPerBar >= 5 && stepShare >= 0.4) cls = 'counterline';
  else if (meanSize < 1.35 && onsetsPerBar >= 5) cls = 'arp8';
  else if (antic >= 0.25) cls = 'syncopated';
  else if (meanSize >= 1.35 && onsetsPerBar >= 6) cls = 'block8';
  else if (meanSize >= 1.35 && shortShare >= 0.6) cls = 'stab';
  else if (meanSize >= 1.35) cls = 'block4';
  else cls = 'line';
  return { cls, onsetsPerBar: r3(onsetsPerBar), meanSize: r3(meanSize), onBeat, on8, antic, durBeats: r3(durBeats), shortShare, top: { stepShare, repShare, leapShare, range: topRange, p90: pct(tops, 0.9) }, rhythmRepeat };
}
export function bassFigure(notes, bars, barTicks, beatTicks, chordAtTick) {
  if (!notes.length || bars <= 0) return { cls: 'silent', onsetsPerBar: 0 };
  const cl = clusters(notes);
  const onsetsPerBar = cl.length / bars;
  const slot = (t) => Math.round(((t % barTicks) / barTicks) * 16) % 16;
  const slots = cl.map((c) => slot(c.tick));
  const on8 = share(slots.filter((s) => s % 2 === 0).length, slots.length);
  const odd16 = share(slots.filter((s) => s % 2 === 1).length, slots.length);
  const grid16 = barTicks / 16;
  const slotSet = new Set(cl.map((c) => Math.floor(c.tick / grid16)));
  const antic = share(cl.filter((c) => { const g = Math.floor(c.tick / grid16); return g % 4 === 2 && !slotSet.has(g + 2) && !slotSet.has(g + 1); }).length, cl.length);
  const pitches = cl.map((c) => c.bottom);
  const ivs = pitches.slice(1).map((p, i) => p - pitches[i]);
  const octShare = share(ivs.filter((d) => Math.abs(d) === 12).length, ivs.length);
  const repShare = share(ivs.filter((d) => d === 0).length, ivs.length);
  const stepShare = share(ivs.filter((d) => Math.abs(d) >= 1 && Math.abs(d) <= 2).length, ivs.length);
  const fifthShare = share(ivs.filter((d) => Math.abs(d) === 5 || Math.abs(d) === 7).length, ivs.length);
  let root = 0, rootN = 0; for (const c of cl) { const seg = chordAtTick(c.tick); if (seg && seg.coverage) { rootN++; if (mod12(c.bottom) === seg.rootPc) root++; } }
  const durBeats = median(cl.map((c) => c.dur)) / beatTicks;
  let cls;
  if (onsetsPerBar < 2) cls = 'held';
  else if (onsetsPerBar >= 12) cls = odd16 >= 0.3 ? 'pump16' : 'pump8+';
  else if (octShare >= 0.3) cls = 'octave';
  else if (antic >= 0.25) cls = 'syncopated';
  else if (onsetsPerBar >= 6 && repShare >= 0.6) cls = 'pump8';
  else if (stepShare >= 0.3) cls = 'walk';
  else if (onsetsPerBar >= 6 && fifthShare >= 0.35) cls = 'root5-8ths';
  else if (onsetsPerBar >= 6) cls = 'riff';
  else cls = 'quarters';
  return { cls, onsetsPerBar: r3(onsetsPerBar), on8, odd16, antic, octShare, repShare, stepShare, fifthShare, rootShare: share(root, rootN), durBeats: r3(durBeats), median: median(pitches) };
}

