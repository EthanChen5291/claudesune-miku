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
import { swellOffset, SWELL } from '../src/ingest/swell.js';

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
  // r43: case-INSENSITIVE. VSCO's cello short articulations name the round
  // robin `_RR1`, every other folder `_rr1`; matching only lowercase collapsed
  // four distinct bow strokes onto seq_position 1..4 in directory order rather
  // than by their own numbering. No patch built before r43 contains an uppercase
  // RR, so this cannot move one.
  const rm = /_rr(\d+)/i.exec(name) ?? /_v\d+_(\d+)\./.exec(name);
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
// samples (one zone) -> sfz <region> lines. Key ranges are midpoints between
// sampled pitches, clamped to [zoneLo, zoneHi] when given.
// r43: `topSpread` is how far ABOVE its highest keycentre a patch may stretch its
// top sample. Default 6 (unchanged, so every patch built before this stays
// byte-identical). A patch raises it only where the alternative is worse: notes
// past the top FOLD DOWN AN OCTAVE (D83), and a wrong octave on a top line is
// more audible than a stretched sample. Measured, the two cases that need it are
// 32 cello onsets at midi 72 (patch top 71) and 64 violin onsets at 81-84 (top
// 80) — 0.05% and 0.1% of their layers, and nothing above a violin section can
// cover them.
function regions(samples, libRoot, { zoneLo = 0, zoneHi = 127, transpose = 0, skipSwell = false, topSpread = 6 } = {}) {
  const byNote = new Map();
  for (const s of samples) {
    if (!byNote.has(s.midi)) byNote.set(s.midi, []);
    byNote.get(s.midi).push(s);
  }
  const notes = [...byNote.keys()].sort((a, b) => a - b);
  const lines = [];
  notes.forEach((n, i) => {
    const lo = Math.max(zoneLo, i === 0 ? n - 6 : Math.floor((notes[i - 1] + n) / 2) + 1);
    const hi = Math.min(zoneHi, i === notes.length - 1 ? n + topSpread : Math.floor((n + notes[i + 1]) / 2));
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
  // r43 — THE SHORT ARTICULATIONS. HIS NOTE: "i still feel like it's held for so
  // long ... it like fills up everything and is reallt wet", then "is it just HQ?
  // like it wasn't like this before. however with HQ off it sounds bad."
  //
  // Both halves are true and neither is reverb. MEASURED: `strings-sections.sfz`
  // carries ampeg_release=0.7 and the pattern labs write SIXTEENTHS — 0.107 s at
  // 140 bpm — so every note rings 0.8 s and ONE cello layer sounds about 8 notes
  // at once. And the sustain sample it rings with does not decay: VSCO's susvib
  // reaches its peak 5.25 s in and holds, so the de-swelled first second sits
  // within 5 dB of its own peak half a second later. Nothing downstream of that
  // can make a sixteenth sound like a sixteenth — not `clip`, not a dry mix.
  //
  // A struck note needs a struck SAMPLE. Measured on the same C3: spic peaks at
  // 0.10 s and is 20 dB down by 0.35 s, pizzT peaks at 0.05 s and 20 dB down by
  // 0.55 s. So the labs' ostinato voices play the spiccato patch, and the
  // sustains stay for the lines that actually sustain (a pad, a theme).
  //
  // NO `skipSwell`: the de-swell offset seeks to the first window at 80% of peak,
  // which on a struck sample is its ATTACK — measuring it here would cut off the
  // bow. (It is currently saved only by the `len - minLeftSec` clamp, which is a
  // coincidence, not an intent; `noSwell` in the pack def states the same thing
  // on the browser side.)
  // r43 SECOND PASS, corrected by the verify pass — ONE PATCH PER INSTRUMENT.
  //
  // The first cut of these gave cello, violin and viola a SHARED patch split by
  // pitch, exactly like strings-sections.sfz. Measured over the combination
  // lab's 387 layers, that made `vsco_violin_spic` play CELLO samples on 93.3%
  // of its onsets (55,888 against 3,952) — the layer sold as "the octave-up
  // double" was the same section again — and left every VSCO viola sample
  // unused, because violin and viola both top at D5 so autoSplit hands the
  // viola nothing. D138's missing-violin defect, reproduced by the fix for it.
  //
  // A pitch-split patch is right for an ENSEMBLE name (gm_string_ensemble_1,
  // which is what strings-sections.sfz is for, and which is judged and stays).
  // It is wrong wherever the NAME already says which instrument plays, which is
  // every vsco_* name: the browser pack has one bank per instrument, so the HQ
  // tier must have one patch per instrument or the two tiers disagree about
  // WHICH INSTRUMENT a layer is — the exact invariant these names exist to hold.
  { out: 'cello-sus.sfz', lib: 'VSCO-2-CE', release: 0.5, skipSwell: true, zones: [{ dir: 'Strings/Cello Section/susvib' }] },
  // topSpread: 32 onsets land on midi 72, one semitone past the F4 keycentre's default reach
  { out: 'cello-spiccato.sfz', lib: 'VSCO-2-CE', release: 0.12, topSpread: 7, zones: [{ dir: 'Strings/Cello Section/spic' }] },
  { out: 'cello-pizz.sfz', lib: 'VSCO-2-CE', release: 0.25, zones: [{ dir: 'Strings/Cello Section/pizzT' }] },
  { out: 'violin-sus.sfz', lib: 'VSCO-2-CE', release: 0.5, skipSwell: true, zones: [{ dir: 'Strings/Violin Section/susVib' }] },
  // topSpread: 64 onsets land at 81-84 — the octave-up double of a cello cell that peaks at 72; nothing above a violin section can cover them, so the top sample stretches rather than the notes folding an octave
  { out: 'violin-spiccato.sfz', lib: 'VSCO-2-CE', release: 0.12, topSpread: 10, zones: [{ dir: 'Strings/Violin Section/Spic' }] },
  { out: 'violin-pizz.sfz', lib: 'VSCO-2-CE', release: 0.25, zones: [{ dir: 'Strings/Violin Section/Pizz' }] },
  { out: 'viola-sus.sfz', lib: 'VSCO-2-CE', release: 0.5, skipSwell: true, zones: [{ dir: 'Strings/Viola Section/susvib' }] },
  { out: 'viola-spiccato.sfz', lib: 'VSCO-2-CE', release: 0.12, zones: [{ dir: 'Strings/Viola Section/spic' }] },
  { out: 'viola-pizz.sfz', lib: 'VSCO-2-CE', release: 0.25, zones: [{ dir: 'Strings/Viola Section/pizz' }] },
  // The contrabass keycentres stop at B2 (47), so the patch topped out at 53 and
  // render-hq FOLDED everything above it down an octave (D83) — measured, 100
  // notes on 4 cells cards and 1,280 in the combination lab, and on
  // cl_bass_offbeat the fold collapsed the figure's opening fifth to a unison.
  // The cello section takes the band above the basses, which is what a real low
  // string section does and what keeps the written pitch.
  { out: 'contrabass-spiccato.sfz', lib: 'VSCO-2-CE', release: 0.12,
    zones: [{ dir: 'Strings/Solo Contrabass/Spic' }, { dir: 'Strings/Cello Section/spic', autoSplit: true }] },
  { out: 'contrabass-pizz.sfz', lib: 'VSCO-2-CE', release: 0.25,
    zones: [{ dir: 'Strings/Solo Contrabass/Pizz' }, { dir: 'Strings/Cello Section/pizzT', autoSplit: true }] },
  { out: 'contrabass-sus.sfz', lib: 'VSCO-2-CE', release: 0.5, skipSwell: true,
    zones: [{ dir: 'Strings/Solo Contrabass/SusVib' }, { dir: 'Strings/Cello Section/susvib', autoSplit: true }] },
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
    const r = regions(p.kept, libRoot, { zoneLo: p.zoneLo, zoneHi: p.zoneHi, skipSwell: inst.skipSwell === true, ...(inst.topSpread ? { topSpread: inst.topSpread } : {}) });
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
