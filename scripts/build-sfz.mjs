#!/usr/bin/env node
// Generate .sfz mappings for the VSCO-2-CE / VCSL sample trees (D80).
//
// The VSCO-2-CE GitHub repo ships raw samples with pitch/velocity/round-robin
// encoded in FILENAMES (VlnEns_susVib_G4_v1.wav, KSHarp_A2_mf.wav,
// Sum_SHTrumpet_sus_D#3_v3_rr1.wav) but no .sfz files — so we author the
// mappings ourselves, deterministically: notes from names, key ranges from
// midpoints between sampled pitches, velocity splits from v-layers or dynamic
// marks, round robins from rr indices. Output: vendor/sfz/gen/*.sfz with
// sample paths relative to each library root.
//
// Rerunnable: same inputs -> byte-identical outputs.

import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SFZ_DIR = join(ROOT, 'vendor', 'sfz');
const OUT_DIR = join(SFZ_DIR, 'gen');

const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const DYN_ORDER = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];

// D83: velocity picks the LAYER; it must not also be the fader. At the old
// amp_veltrack=100 sfizz applied the full squared velocity curve ON TOP of a
// velocity that already carried the engine's mix balance (render-hq maps gain
// -> velocity), so a support voice at gain 0.26 -> vel 33 landed 27 dB under
// the piano's vel 82 instead of the intended 8. Measured on trumpet.sfz, one
// note at key 65, vel 26 -> 82: veltrack 100 = 26.8 dB swing, 70 = 12.2,
// 55 = 10.3, 40 = 9.1 (the floor is the ~9 dB step between the v1 and v3
// SAMPLE layers, which is the real timbral dynamic). 50 keeps that step plus
// a little within-layer shading and leaves the level to the mix stage.
// Salamander piano ships amp_veltrack=73 and never had the problem.
const AMP_VELTRACK = 50;

// filename -> { midi, layer (0-based sortable), rr (1-based) } or null
function parseSample(name) {
  const m = /(?:^|_)([A-G])(#|b)?(-?\d)(?:_|\.|-)/.exec(name);
  if (!m) return null;
  const pc = NOTE_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = pc + (Number(m[3]) + 1) * 12;
  const vm = /_v(\d+)(?:_|\.)/.exec(name);
  let layer = null;
  if (vm) layer = Number(vm[1]);
  else {
    const dm = /_(p{1,3}|m[pf]|f{1,3})(?:_|\.)/.exec(name);
    if (dm) layer = DYN_ORDER.indexOf(dm[1]) + 1;
  }
  const rm = /_rr(\d+)/.exec(name) ?? /_v\d+_(\d+)\./.exec(name);
  const rr = rm ? Number(rm[1]) : 1;
  return { midi, layer: layer ?? 1, rr };
}

function collect(dir, filter = null) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!/\.(wav|flac)$/i.test(f)) continue;
    if (filter && !filter.test(f)) continue;
    const p = parseSample(f);
    if (p) out.push({ ...p, path: join(dir, f) });
  }
  return out;
}

// samples (one zone) -> sfz <region> lines. Key ranges are midpoints between
// sampled pitches, clamped to [zoneLo, zoneHi] when given.
function regions(samples, libRoot, { zoneLo = 0, zoneHi = 127, transpose = 0 } = {}) {
  const byNote = new Map();
  for (const s of samples) {
    if (!byNote.has(s.midi)) byNote.set(s.midi, []);
    byNote.get(s.midi).push(s);
  }
  const notes = [...byNote.keys()].sort((a, b) => a - b);
  const lines = [];
  notes.forEach((n, i) => {
    const lo = Math.max(zoneLo, i === 0 ? n - 6 : Math.floor((notes[i - 1] + n) / 2) + 1);
    const hi = Math.min(zoneHi, i === notes.length - 1 ? n + 6 : Math.floor((n + notes[i + 1]) / 2));
    if (lo > hi) return;
    const group = byNote.get(n);
    const layers = [...new Set(group.map((s) => s.layer))].sort((a, b) => a - b);
    for (const [li, layer] of layers.entries()) {
      const lovel = Math.round((127 * li) / layers.length) + (li ? 1 : 0);
      const hivel = Math.round((127 * (li + 1)) / layers.length);
      const rrs = group.filter((s) => s.layer === layer).sort((a, b) => a.rr - b.rr);
      for (const [ri, s] of rrs.entries()) {
        const parts = [
          `<region> sample=${relative(libRoot, s.path).split('\\').join('/')}`,
          `lokey=${lo} hikey=${hi} pitch_keycenter=${n + transpose}`,
          `lovel=${lovel} hivel=${hivel}`,
        ];
        if (rrs.length > 1) parts.push(`seq_length=${rrs.length} seq_position=${ri + 1}`);
        lines.push(parts.join(' '));
      }
    }
  });
  return lines;
}

// instrument configs: zones are sample dirs (relative to the library root);
// a zone with autoSplit:true claims only pitches above the previous zone's top
const INSTRUMENTS = [
  {
    out: 'strings-sections.sfz', lib: 'VSCO-2-CE', release: 0.7,
    zones: [
      { dir: 'Strings/Cello Section/susvib' },
      { dir: 'Strings/Viola Section/susvib', autoSplit: true },
      { dir: 'Strings/Violin Section/susVib', autoSplit: true },
    ],
  },
  { out: 'flute.sfz', lib: 'VSCO-2-CE', release: 0.35, zones: [{ dir: 'Woodwinds/Flute/susvib' }] },
  { out: 'harp.sfz', lib: 'VSCO-2-CE', release: 1.2, zones: [{ dir: 'Strings/Harp' }] },
  { out: 'trumpet.sfz', lib: 'VSCO-2-CE', release: 0.3, zones: [{ dir: 'Brass/Trumpet/sus', filter: /^Sum_/ }] },
  { out: 'bassoon.sfz', lib: 'VSCO-2-CE', release: 0.3, zones: [{ dir: 'Woodwinds/Bassoon/sus' }] },
  { out: 'clarinet.sfz', lib: 'VSCO-2-CE', release: 0.3, zones: [{ dir: 'Woodwinds/Clarinet/susLong' }] },
  { out: 'oboe.sfz', lib: 'VSCO-2-CE', release: 0.3, zones: [{ dir: 'Woodwinds/Oboe/sus' }] },
  { out: 'glockenspiel.sfz', lib: 'VSCO-2-CE', release: 1.5, zones: [{ dir: 'Percussion/Glock' }] },
  { out: 'xylophone.sfz', lib: 'VSCO-2-CE', release: 0.8, zones: [{ dir: 'Percussion/Xylo', filter: /_far\./ }] },
  // VCSL (vibraphone, celesta) — zone dirs resolved by probe below, since the
  // VCSL tree names folders like "Struck Idiophones/Vibraphone/..."
  { out: 'vibraphone.sfz', lib: 'VCSL', release: 2.0, probe: /vibraphone/i },
  { out: 'celesta.sfz', lib: 'VCSL', release: 1.0, probe: /celesta/i },
  // genre-expansion round: jungle marimba (the NSMB-desert/DKC ostinato voice)
  { out: 'marimba.sfz', lib: 'VSCO-2-CE', release: 1.0, zones: [{ dir: 'Percussion/Marimba' }] },
];

function findDirs(root, re, depth = 4) {
  const hits = [];
  const walk = (dir, d) => {
    if (d > depth) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const p = join(dir, e.name);
      if (re.test(e.name)) hits.push(p);
      else walk(p, d + 1);
    }
  };
  walk(root, 0);
  return hits;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const inst of INSTRUMENTS) {
  const libRoot = join(SFZ_DIR, inst.lib);
  if (!existsSync(libRoot)) { console.log(`skip ${inst.out}: ${inst.lib} not present`); continue; }
  let zones = inst.zones;
  if (inst.probe) {
    const dirs = findDirs(libRoot, inst.probe);
    if (!dirs.length) { console.log(`skip ${inst.out}: no dir matching ${inst.probe} in ${inst.lib}`); continue; }
    // prefer a sustain/hits subdir when the instrument folder nests further
    const leafDirs = [];
    for (const d of dirs) {
      const subs = readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory());
      const sus = subs.find((e) => /soft/i.test(e.name))
        ?? subs.find((e) => /sus|hit|medium|motor ?off/i.test(e.name));
      leafDirs.push(sus ? join(d, sus.name) : d);
    }
    zones = leafDirs.map((d) => ({ dir: relative(libRoot, d) }));
  }
  const lines = [
    `// generated by scripts/build-sfz.mjs — do not hand-edit`,
    `<control> default_path=./`,
    `<global> ampeg_release=${inst.release} amp_veltrack=${AMP_VELTRACK}`,
  ];
  let prevTop = -1;
  let total = 0;
  for (const z of zones) {
    const samples = collect(join(libRoot, z.dir), z.filter ?? null);
    if (!samples.length) { console.log(`  warn ${inst.out}: no samples in ${z.dir}`); continue; }
    const zoneLo = z.autoSplit ? prevTop + 1 : 0;
    const kept = z.autoSplit ? samples.filter((s) => s.midi > prevTop) : samples;
    if (!kept.length) continue;
    prevTop = Math.max(prevTop, ...kept.map((s) => s.midi));
    const r = regions(kept, libRoot, { zoneLo });
    total += r.length;
    lines.push(`// zone: ${z.dir} (${kept.length} samples)`);
    lines.push(...r);
  }
  const outPath = join(OUT_DIR, inst.out);
  // sample paths are relative to the LIBRARY root; the sfz lives in gen/, so
  // point default_path at the library
  lines[1] = `<control> default_path=../${inst.lib}/`;
  writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`wrote vendor/sfz/gen/${inst.out} (${total} regions)`);
}
