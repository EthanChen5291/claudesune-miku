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
import { execFileSync } from 'node:child_process';

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

// r35 — THE SWELL IS IN THE SAMPLE (his vg_nostalgic_shop card: "it's not
// really sustaining, it sounds like every new note it starts really soft and
// then becomes really loud over time rather than more flowy ... just a vst
// control thing"; vg_romantic_water: "violin much too loud"). Measured on the
// VSCO section sustains: the SOFT layer — the one a support voice's velocity
// selects — reaches half its peak RMS 1.1-3.2 s into the note (VlnEns_susVib
// C4_v1 1.09 s, G4_v1 1.73 s, D5_v1 3.17 s) and 90% only after 4.8-6.7 s; the
// loud layer gets there in 0.1-0.8 s. A held support note is therefore a
// crescendo INTO every attack, and its peak sits far above the level the mix
// stage measured for the stem (the gated loudness averages the swell). The
// fix is a per-sample `offset`: start playback where the recording has
// reached SWELL_LEVEL of its own peak (capped so at least MIN_LEFT seconds of
// sample remain), with a short envelope attack so the skipped-into sample
// does not click. Measured on each file at build time, so the output stays
// deterministic for a given library.
const SWELL = { level: 0.8, maxSec: 4, minLeftSec: 3, attack: 0.04 };
function swellOffset(path) {
  const rateTxt = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=sample_rate', '-of', 'csv=p=0', path], { encoding: 'utf8' }).trim();
  const rate = Number(rateTxt) || 44100;
  const ANALYSIS_RATE = 8000;
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', String(ANALYSIS_RATE), '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  const w = Math.round(ANALYSIS_RATE * 0.01);
  const env = [];
  for (let i = 0; i + w <= x.length; i += w) { let a = 0; for (let k = i; k < i + w; k++) a += x[k] * x[k]; env.push(Math.sqrt(a / w)); }
  const peak = Math.max(...env, 1e-9);
  let at = env.findIndex((e) => e >= SWELL.level * peak);
  if (at < 0) at = 0;
  let sec = at * w / ANALYSIS_RATE;
  const len = x.length / ANALYSIS_RATE;
  sec = Math.min(sec, SWELL.maxSec, Math.max(0, len - SWELL.minLeftSec));
  return { samples: Math.round(sec * rate), sec, peakSec: env.indexOf(peak) * w / ANALYSIS_RATE };
}

// samples (one zone) -> sfz <region> lines. Key ranges are midpoints between
// sampled pitches, clamped to [zoneLo, zoneHi] when given.
function regions(samples, libRoot, { zoneLo = 0, zoneHi = 127, transpose = 0, skipSwell = false } = {}) {
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
        if (skipSwell) {
          const so = swellOffset(s.path);
          if (so.samples > 0) parts.push(`offset=${so.samples} ampeg_attack=${SWELL.attack}`);
          parts.push(`// swell: ${so.sec.toFixed(2)}s skipped (peak at ${so.peakSec.toFixed(2)}s)`);
        }
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
    out: 'strings-sections.sfz', lib: 'VSCO-2-CE', release: 0.7, skipSwell: true,
    // r35 MEASURED: the violin zone had been EMPTY since D80. VSCO's violin
    // section tops out at D5 (74) — the same top as its viola section — so
    // with the viola listed first, autoSplit left the violins nothing to claim
    // (33 regions = 27 cello + 6 viola, 0 violin; the 67-74 band and every
    // stretched note above it was a VIOLA). The ensemble's upper zone is now
    // the violins, as a string section is; the violas keep only what the
    // violins do not cover (nothing, at present — listed so a fuller library
    // fills the gap by data, not by edit).
    zones: [
      { dir: 'Strings/Cello Section/susvib' },
      { dir: 'Strings/Violin Section/susVib', autoSplit: true },
      { dir: 'Strings/Viola Section/susvib', autoSplit: true },
    ],
  },
  { out: 'flute.sfz', lib: 'VSCO-2-CE', release: 0.35, zones: [{ dir: 'Woodwinds/Flute/susvib' }] },
  { out: 'harp.sfz', lib: 'VSCO-2-CE', release: 1.2, zones: [{ dir: 'Strings/Harp' }] },
  { out: 'trumpet.sfz', lib: 'VSCO-2-CE', release: 0.3, zones: [{ dir: 'Brass/Trumpet/sus', filter: /^Sum_/ }] },
  // r35: the French horn leaves the fluidsynth GM fallback — its harmony_support
  // whole notes were the "strings ... starts really soft" on vg_nostalgic_shop
  // (he names timbres approximately; the song has no violin line at that gain).
  // VSCO's horn sustains reach half their peak in 0.04-0.15 s, no swell to skip.
  { out: 'horn.sfz', lib: 'VSCO-2-CE', release: 0.4, zones: [{ dir: 'Brass/F Horn/sus' }] },
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
  // r41/D146 — AUTOSPLIT SET EACH ZONE'S FLOOR AND NEVER CAPPED THE ONE BELOW
  // IT, SO ADJACENT SECTIONS BOTH SOUNDED. `zoneLo = prevTop + 1` bounds the
  // UPPER zone; the lower zone kept `zoneHi = 127` and its top region still
  // spread `n + 6` above its last sample. In strings-sections.sfz the cello's
  // last sample is F4 (65), so its top region claimed 64-71 while the violins
  // claimed 66 upward — and with no <group> in the file, SFZ sounds EVERY
  // matching region. Every note from 66 to 71 was a violin section AND a cello
  // section stretched up into violin register, played together.
  //
  // That is five of his eleven serious cards: "this violin/cello (the vst that
  // plays the melody) vst absolutely sucks and shouldn't be used because it
  // doesn't sound serious at all" (x2), "a bit too loud and should be more
  // 'fluid'", "main melody violin/cello too loud". Measured share of that
  // layer's notes inside the doubled band: hunt 66%, expanse 58%, gate 39%,
  // resolve 25%, duel 18%. And it explains why he rated ashes' melody voice
  // "better than the other ones" — gm_viola has no HQ entry at all and falls
  // through to fluidsynth, so it never touches this patch.
  //
  // A zone is now capped at the next autoSplit zone's floor, which makes the
  // split exclusive in both directions. Boundaries only: no sample, offset,
  // velocity layer or release changes, so every OTHER pitch renders as before.
  const planned = [];
  for (const z of zones) {
    const samples = collect(join(libRoot, z.dir), z.filter ?? null);
    if (!samples.length) { console.log(`  warn ${inst.out}: no samples in ${z.dir}`); continue; }
    const zoneLo = z.autoSplit ? prevTop + 1 : 0;
    const kept = z.autoSplit ? samples.filter((s) => s.midi > prevTop) : samples;
    if (!kept.length) continue;
    prevTop = Math.max(prevTop, ...kept.map((s) => s.midi));
    planned.push({ z, kept, zoneLo });
  }
  for (const [i, p] of planned.entries()) {
    const next = planned[i + 1];
    p.zoneHi = next && next.z.autoSplit ? next.zoneLo - 1 : 127;
  }
  for (const p of planned) {
    const r = regions(p.kept, libRoot, { zoneLo: p.zoneLo, zoneHi: p.zoneHi, skipSwell: inst.skipSwell === true });
    total += r.length;
    lines.push(`// zone: ${p.z.dir} (${p.kept.length} samples${p.zoneHi < 127 ? `, capped at key ${p.zoneHi}` : ''})`);
    lines.push(...r);
  }
  const outPath = join(OUT_DIR, inst.out);
  // sample paths are relative to the LIBRARY root; the sfz lives in gen/, so
  // point default_path at the library
  lines[1] = `<control> default_path=../${inst.lib}/`;
  writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`wrote vendor/sfz/gen/${inst.out} (${total} regions)`);
}
