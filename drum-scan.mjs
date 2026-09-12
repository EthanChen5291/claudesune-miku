// r37 drum-corpus scan — ANALYSIS ONLY (D95: never feeds src/lib by counting).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import pkg from '@tonejs/midi';
const { Midi } = pkg;

const ROOT = process.argv[2];
const OUT = process.argv[3];
const LIMIT_PER_DIR = Number(process.argv[4] || 400);

// GM channel-10 map -> piece class
const CLASS = new Map();
const put = (ns, c) => ns.forEach(n => CLASS.set(n, c));
put([35,36], 'kick');
put([38,40], 'snare');
put([37], 'rim');       // side stick
put([39], 'clap');
put([42,44], 'hatC');   // closed, pedal
put([46], 'hatO');
put([49,52,55,57], 'crash');
put([51,53,59], 'ride');
put([41,43,45,47,48,50], 'tom');
put([54,56,58,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82], 'perc');

function walk(dir, acc = []) {
  let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  const files = [];
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.mid$/i.test(e.name)) files.push(p);
  }
  if (files.length) {
    // stratified: cap per directory so a 50k folder cannot drown a 96-file one
    const step = Math.max(1, Math.floor(files.length / LIMIT_PER_DIR));
    for (let i = 0; i < files.length; i += step) acc.push(files[i]);
  }
  return acc;
}

const files = walk(ROOT);
console.error(`scanning ${files.length} files (cap ${LIMIT_PER_DIR}/dir)`);
const rows = [];
let bad = 0;
for (let i = 0; i < files.length; i++) {
  if (i % 2000 === 0) console.error(`  ${i}/${files.length}`);
  const f = files[i];
  let midi; try { midi = new Midi(readFileSync(f)); } catch { bad++; continue; }
  const ppq = midi.header.ppq || 96;
  const ts = midi.header.timeSignatures?.[0]?.timeSignature || [4,4];
  const beatsPerBar = ts[0] * (4 / ts[1]);
  const ticksPerBar = ppq * beatsPerBar;
  const ev = [];
  const hasCh9 = midi.tracks.some(t => t.channel === 9 && t.notes.length);
  for (const tr of midi.tracks) {
    if (!tr.notes.length) continue;
    // A track is drums if it is on GM channel 10, names itself so, or — when the
    // file has no channel-10 track at all — if its notes live in the GM
    // percussion range. 72% of a first pass was skipped for want of this.
    const inRange = tr.notes.filter(n => n.midi >= 27 && n.midi <= 87).length / tr.notes.length;
    const isDrum = (tr.channel === 9) || /drum|perc|kit/i.test(tr.name || '') || (!hasCh9 && inRange >= 0.9);
    if (!isDrum) continue;
    for (const n of tr.notes) ev.push({ tick: Math.round(n.ticks), midi: n.midi, vel: Math.round(n.velocity * 127) });
  }
  if (ev.length < 4) { bad++; continue; }
  ev.sort((a,b) => a.tick - b.tick);
  const span = ev[ev.length-1].tick + 1;
  const bars = Math.max(1, Math.round(span / ticksPerBar));
  const rel = f.slice(ROOT.length + 1);
  const parts = rel.split('/');
  const genre = parts[1] || parts[0];
  const sub = parts[2] || '';
  const nameBpm = /^(\d{2,3})[_\- ]/.exec(basename(f));
  const bpm = nameBpm ? Number(nameBpm[1]) : (midi.header.tempos?.[0]?.bpm ? Math.round(midi.header.tempos[0].bpm) : null);

  const byClass = {};
  const vels = [];
  let off8 = 0, off16 = 0, onsets = 0;
  const slotMap = new Map();      // tick-slot -> Set(class) for linear/layer test
  const sixteenth = ppq / 4;
  for (const e of ev) {
    const c = CLASS.get(e.midi) || 'other';
    byClass[c] = (byClass[c] || 0) + 1;
    vels.push(e.vel);
    onsets++;
    const inBar = ((e.tick % ticksPerBar) + ticksPerBar) % ticksPerBar;
    const s16 = inBar / sixteenth;
    if (Math.abs(s16 - Math.round(s16)) > 0.12) off16++;            // not on a 16th at all (triplet/flam/swing)
    else if (Math.round(s16) % 2 === 1) off8++;                     // on an odd 16th (the "e"/"a")
    const key = Math.round(e.tick / (ppq/8));                       // 32nd-resolution slot
    if (!slotMap.has(key)) slotMap.set(key, new Set());
    slotMap.get(key).add(c);
  }
  const snareVels = ev.filter(e => CLASS.get(e.midi) === 'snare').map(e => e.vel);
  const ghosts = snareVels.filter(v => v < 64).length;
  const stacked = [...slotMap.values()].filter(s => s.size > 1).length;
  const pieces = Object.keys(byClass).filter(c => c !== 'other');
  const distinctMidi = new Set(ev.map(e => e.midi)).size;

  // bar-to-bar variation: signature of each bar
  const barSig = [];
  for (let b = 0; b < Math.min(bars, 8); b++) {
    const sig = ev.filter(e => Math.floor(e.tick / ticksPerBar) === b)
      .map(e => `${Math.round((e.tick % ticksPerBar) / sixteenth)}:${CLASS.get(e.midi)||'x'}`).join(',');
    barSig.push(sig);
  }
  const distinctBars = new Set(barSig.filter(Boolean)).size;

  rows.push({
    rel, genre, sub, bpm, bars, beatsPerBar, ts: ts.join('/'),
    onsets, perBar: +(onsets / bars).toFixed(2),
    pieces: pieces.length, distinctMidi,
    byClass,
    ghostRate: snareVels.length ? +(ghosts / snareVels.length).toFixed(3) : null,
    velDistinct: new Set(vels).size,
    velMin: Math.min(...vels), velMax: Math.max(...vels),
    velMean: +(vels.reduce((a,b)=>a+b,0)/vels.length).toFixed(1),
    off16Rate: +(off16 / onsets).toFixed(3),
    off8Rate: +(off8 / onsets).toFixed(3),
    stackRate: +(stacked / slotMap.size).toFixed(3),
    distinctBars, barsSeen: barSig.filter(Boolean).length,
  });
}
console.error(`done: ${rows.length} parsed, ${bad} skipped`);
writeFileSync(OUT, JSON.stringify(rows));
