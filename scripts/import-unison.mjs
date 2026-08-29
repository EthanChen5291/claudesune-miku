#!/usr/bin/env node
// Extract library material from the Unison packs in audios/ (D29).
//
// What each source type becomes, per A6.2 ("MIDI = perfect what, often fake how"):
//   chord-progression MIDI -> progressions (numerals are IN the filename) +
//                             observed voicings + harmonic rhythm.  Triage says
//                             quantized-flat, so NO accents are taken from them.
//   drum-loop MIDI         -> rhythm entries; accents/microtiming only from the
//                             files triage clears as 'performance'.
//   WAV                    -> NOT ingested. One-shots and FX are instrument-palette
//                             material (A7), which stores audio, not abstractions.
//
// The filename is a LABEL, not ground truth: every chord it claims is checked
// against the notes actually in the MIDI. Agreement is recorded per entry; the
// ones that disagree are flagged `needs_ear` rather than quietly trusted (A6.1).
//
// Run: node scripts/import-unison.mjs [--report] [--check]

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMidi, triage, chordEvents, loopPeriod } from '../src/ingest/midi.js';
import { parseNumeral, numeralsFromFilename, parseKeyDir, qualityPcs } from '../src/ingest/numerals.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const AUDIOS = join(ROOT, 'audios');
const REPORT = process.argv.includes('--report');
const CHECK = process.argv.includes('--check');

// Minor progressions are numbered from the NATURAL MINOR scale (III=3, VI=8,
// VII=10) — the same convention ldrolez's minor family uses, NOT Ionian-anchored.
const MINOR_SHIFT = { 0: 0, 2: 0, 4: -1, 5: 0, 7: 0, 9: -1, 11: -1 };

const PACKS = {
  'Unison Essential Famous MIDI Chord Progressions': { id: 'famous', style: 'pop', moods: [], titled: true },
  'Unison+Free+Dark+MIDI+Chord+Progressions': { id: 'dark', style: 'cinematic', moods: ['Dark'], titled: false },
  'Unison+Free+Emotional+MIDI+Chord+Progressions': { id: 'emotional', style: 'cinematic', moods: ['Emotional'], titled: false },
};

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const round2 = (x) => Math.round(x * 100) / 100;
const round4 = (x) => Math.round(x * 10000) / 10000;
const PC_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const subset = (a, b) => [...a].every((x) => b.has(x));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 54);

// ---------------------------------------------------------------------------
// Chord progressions
// ---------------------------------------------------------------------------
const QP = qualityPcs();
const progressions = [];
const voicingObs = new Map(); // quality -> [{ offsets, root, source }]
const notes_ = [];

for (const [packDir, pack] of Object.entries(PACKS)) {
  for (const file of walk(join(AUDIOS, packDir)).filter((f) => f.endsWith('.mid'))) {
    const nm = numeralsFromFilename(basename(file));
    const key = parseKeyDir(basename(dirname(file)));
    if (!nm || !key) { notes_.push(`SKIP ${basename(file)} — no numerals or unparseable key dir`); continue; }
    const midi = readMidi(file);
    const tri = triage(midi);
    const ev = chordEvents(midi.notes, midi.ppq);
    const toks = nm.tokens.map(parseNumeral);
    if (toks.some((t) => !t) || !ev.length) { notes_.push(`SKIP ${basename(file)} — unparseable numeral`); continue; }

    // The DIRECTORY is not trustworthy — "Minor Prog 01 (i-v-VI-iv)" filed under
    // "05 - E Major - C# Minor" is actually in C minor. So solve the tonic from the
    // notes (12 roots x 2 modes, scored by how well the numerals explain the chords)
    // and treat the directory as a claim to check, not a fact. This costs nothing:
    // the library stores degrees relative to the tonic, so the solved key is only
    // ever used to VERIFY.
    const declared = /Minor Prog/i.test(basename(file)) ? 'minor' : /Major Prog/i.test(basename(file)) ? 'major' : null;
    const solved = solveKey(toks, ev, declared);
    const minor = solved.minor;
    const mode = minor ? 'minor' : 'major';
    const tonicPc = solved.tonic;

    const bars = midi.ppq * 4 * (midi.timeSig[0] / midi.timeSig[1]);
    const rep = ev.length % toks.length === 0 ? ev.length / toks.length : null;

    const chords = [];
    let agree = 0, colour = 0, conflict = 0, rootMiss = 0;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      const semis = (t.semis + (minor ? (MINOR_SHIFT[t.semis] ?? 0) : 0) + 12) % 12;
      const e = rep ? ev[i * rep] : ev[Math.min(i, ev.length - 1)];
      const pcs = new Set(e.notes.map((n) => n.midi % 12));
      const rootPc = (tonicPc + semis) % 12;
      let quality = t.quality;
      let status;
      if (!pcs.has(rootPc)) { rootMiss++; status = 'root-absent'; }
      else {
        const rel = new Set([...pcs].map((p) => (p - rootPc + 12) % 12));
        const q = quality ? QP.get(quality) : null;
        if (!q) {
          // unmapped label ("maj7sus", "add#11") — let the NOTES name the chord
          quality = nearestQuality(rel) ?? quality;
          status = 'from-notes';
        } else if (setEq(rel, q)) { agree++; status = 'exact'; }
        else if (subset(rel, q)) { agree++; status = 'omits-tones'; }   // voicing drops the 5th etc.
        else if (subset(q, rel)) { colour++; status = 'adds-colour'; }  // player adds an extension
        else { conflict++; status = 'conflict'; }
        // Observed voicing: semitone offsets from the root, lowest note first.
        const lo = Math.min(...e.notes.map((n) => n.midi));
        const rootMidi = lo - ((lo - rootPc) % 12 + 12) % 12;
        voicingObs.set(quality, (voicingObs.get(quality) ?? []).concat([{
          offsets: [...new Set(e.notes.map((n) => n.midi - rootMidi))].sort((a, b) => a - b),
          source: basename(file), numeral: t.raw,
        }]));
      }
      chords.push({ semis, spell: t.spell, quality, raw: t.raw, status });
    }

    const perChord = rep
      ? Array.from({ length: toks.length }, (_, i) => round2((ev[i * rep].endTick - ev[i * rep].tick) / bars))
      : null;
    const song = pack.titled ? nm.label : null;
    const name = `un_${pack.id}_${slug(song ?? `${nm.label}_${key.majorRoot}`)}_${slug(nm.tokens.join('_'))}`.slice(0, 78);

    progressions.push({
      name, pack: pack.id, family: mode, style: pack.style, song,
      numerals: nm.tokens.join('-'),
      degrees: chords.map((c) => `${c.semis}${c.spell ?? ''}${c.quality ? `:${c.quality}` : ''}`).join(' '),
      moods: pack.moods.slice(),
      barsPerChord: perChord,
      sourceKey: `${PC_NAMES[tonicPc]}:${mode}`,
      dirKey: `${key.majorRoot} major / ${key.minorRoot} minor`,
      dirAgrees: tonicPc === (minor ? key.minorPc : key.majorPc),
      sourceFile: relative(ROOT, file),
      triage: tri.verdict,
      // A chord the label got wrong, an absent root, or a progression whose chord
      // count does not divide evenly is not trustworthy without a listen.
      needsEar: conflict > 0 || rootMiss > 0 || !rep,
      match: { agree, colour, conflict, rootMiss, chords: toks.length, repeats: rep },
    });
  }
}

/** Best (tonic, mode) for these numerals over these chords. The declared mode gets
 *  a small nudge so a genuine tie keeps the pack's own word. */
function solveKey(toks, ev, declared) {
  const rep = ev.length % toks.length === 0 ? ev.length / toks.length : 1;
  let best = null;
  for (let tonic = 0; tonic < 12; tonic++) {
    for (const minor of [false, true]) {
      let s = declared && (minor === (declared === 'minor')) ? 0.5 : 0;
      for (let i = 0; i < Math.min(toks.length, ev.length); i++) {
        const t = toks[i];
        const semis = (t.semis + (minor ? (MINOR_SHIFT[t.semis] ?? 0) : 0) + 12) % 12;
        const want = (tonic + semis) % 12;
        const e = ev[i * rep] ?? ev[i];
        const pcs = new Set(e.notes.map((n) => n.midi % 12));
        if (!pcs.has(want)) continue;
        s += 1;
        const rel = new Set([...pcs].map((p) => (p - want + 12) % 12));
        const q = t.quality && QP.get(t.quality);
        if (q && setEq(rel, q)) s += 2; else if (q && subset(rel, q)) s += 1.5; else if (q && subset(q, rel)) s += 1;
      }
      if (!best || s > best.score) best = { tonic, minor, score: s };
    }
  }
  return best;
}

/** the ireal quality whose tones exactly match, else the closest superset */
function nearestQuality(rel) {
  let best = null;
  for (const [q, pcs] of QP) {
    const hit = [...rel].filter((p) => pcs.has(p)).length;
    const score = hit * 2 - (rel.size - hit) * 2 - (pcs.size - hit) - q.length * 0.01;
    if (!best || score > best.score) best = { q, score };
  }
  return best?.q;
}

// ---------------------------------------------------------------------------
// Drum loops -> rhythm entries
//
// Onsets are quantized to the smallest grid that explains them and the RESIDUAL
// is kept as `microtiming` — the binder already applies that field, and it is the
// A6.2 split made concrete: grid is the what, residual is the how. Raw tick
// positions would need a 1/384 grid, past the binder's MAX_GRID of 192, and would
// bury the feel inside the note positions where nothing can reason about it.
// ---------------------------------------------------------------------------
const GRIDS = [16, 12, 24, 32, 48];
const PART_ROLE = {
  kick: ['percussion', 'low'], snare: ['percussion', 'mid'], clap: ['percussion', 'mid'],
  'rim shot': ['percussion', 'mid'], perc: ['percussion', 'mid'],
  hat: ['percussion', 'high'], hats: ['percussion', 'high'], 'hat 1': ['percussion', 'high'], 'hat 2': ['percussion', 'high'],
};

function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function frac(n, d) { const g = gcd(Math.abs(n), Math.abs(d)) || 1; return `${n / g}/${d / g}`; }

const rhythms = [];
const loopDir = join(AUDIOS, 'Unison Free LoFi Drum Kit', 'Drum Loops');
for (const file of walk(loopDir).filter((f) => f.endsWith('.mid'))) {
  const midi = readMidi(file);
  const tri = triage(midi);
  const barTicks = midi.ppq * 4 * (midi.timeSig[0] / midi.timeSig[1]);
  const totalBars = Math.max(1, Math.round(midi.endTick / barTicks));
  const bars = loopPeriod(midi.notes, barTicks, totalBars);
  const notes = midi.notes.filter((n) => n.tick < bars * barTicks).sort((a, b) => a.tick - b.tick);
  if (!notes.length) continue;

  const pos = (n) => n.tick / barTicks; // bar units
  let grid = GRIDS[GRIDS.length - 1];
  for (const g of GRIDS) {
    const worst = Math.max(...notes.map((n) => Math.abs(pos(n) * g - Math.round(pos(n) * g)) / g));
    if (worst < 1 / 64) { grid = g; break; }
  }
  // merge notes that quantize onto the same step (multi-articulation hats), keeping
  // the loudest — an onset is one strike as far as a rhythm entry is concerned
  const steps = new Map();
  for (const n of notes) {
    const step = Math.round(pos(n) * grid);
    const prev = steps.get(step);
    if (!prev || n.velocity > prev.velocity) steps.set(step, { step, velocity: n.velocity, pos: pos(n), pitches: new Set() });
    steps.get(step).pitches.add(n.midi);
  }
  const ordered = [...steps.values()].sort((a, b) => a.step - b.step).filter((x) => x.step < bars * grid);
  const maxVel = Math.max(...ordered.map((x) => x.velocity));
  const onsets = ordered.map((x) => frac(x.step, grid));
  // The binder's toFrac only spans denominators up to 96, so the residual is
  // expressed as the nearest 96th of a bar (~20ms at these tempos) and emitted as
  // an exact fraction string, matching the library's existing microtiming style.
  // Finer detail than a 96th does not survive — noted rather than silently lost.
  const residual = ordered.map((x) => Math.round((x.pos - x.step / grid) * 96));
  const hasResidual = residual.some((r) => r !== 0);
  const microFrac = residual.map((r) => (r === 0 ? '0' : frac(r, 96)));

  const bpm = Number(/\((\d+)\s*BPM\)/i.exec(basename(file))?.[1]) || null;
  const genre = relative(loopDir, file).split('/')[0];
  const part = (/- ([A-Za-z0-9 ]+?) \(/.exec(basename(file))?.[1] ?? 'part').trim();
  const loop = /DRUMLOOP_([A-Za-z0-9]+)/.exec(basename(file))?.[1] ?? 'loop';
  const [role, band] = PART_ROLE[part.toLowerCase()] ?? ['percussion', 'mid'];

  rhythms.push({
    name: `un_${slug(genre)}_${slug(loop)}_${slug(part)}`,
    role, band, style: slug(genre).replace(/_/g, '-'),
    loop: `${genre}/${loop}`, part, bpm, bars, grid,
    onsets,
    // Accents ONLY where the velocities carry information. A flat-velocity file
    // gets `accents: null` and cannot bind — inventing a profile here is exactly
    // the cached-LLM-output circularity A6.1 forbids.
    accents: tri.accentsUsable ? ordered.map((x) => round2(x.velocity / maxVel)) : null,
    microtiming: tri.timingUsable && hasResidual ? microFrac : null,
    meter_class: `${midi.timeSig[0]}/${midi.timeSig[1]}`,
    tags: [slug(genre).replace(/_/g, '-'), part.toLowerCase().replace(/\s+/g, '-'), 'lofi'],
    triage: tri.verdict,
    velocityStdev: tri.velocityStdev, offGridRatio: tri.offGridRatio,
    sourceBars: totalBars,
    sourceFile: relative(ROOT, file),
  });
}

// co-designed pairs: parts of the SAME loop are ground truth (A5.3), free here
const interlocks = [];
for (const loop of [...new Set(rhythms.map((r) => r.loop))]) {
  const parts = rhythms.filter((r) => r.loop === loop);
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      interlocks.push({
        name: `un_${slug(loop)}_${slug(parts[i].part)}_x_${slug(parts[j].part)}`,
        a: parts[i].name, b: parts[j].name,
        roleA: parts[i].part.toLowerCase(), roleB: parts[j].part.toLowerCase(),
        loop,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
const HDR = (what) => [
  `// ${what} extracted from the Unison packs in audios/ (D29).`,
  `//`,
  `// GENERATED by scripts/import-unison.mjs — do not hand-edit; re-run the importer.`,
  `// Every entry is \`ratified: false\` with \`character: null\`: an extracted corpus is`,
  `// a CANDIDATE POOL, not a library (A6.1). A character line is written when an ear`,
  `// ratifies the entry, never at import.`,
].join('\n');

function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return `[${v.map(lit).join(', ')}]`;
  if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
  return String(v);
}

// --- progressions ---
{
  const L = [HDR('Chord progressions'), '//',
    "// Numerals come from the FILENAME; every chord was then checked against the notes",
    "// actually in the MIDI. `match` records that check and `needsEar` marks the entries",
    "// where the label and the notes disagree — those are unverified until heard.",
    "// `degrees` is the same grammar as src/lib/progressions.js: semitones above the",
    "// tonic + an ireal quality.", '',
    'export const PROGRESSIONS_UNISON = {'];
  for (const p of progressions.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`  ${p.name}: {`);
    L.push(`    family: ${lit(p.family)}, pack: ${lit('unison-' + p.pack)}, role: 'harmony', style: ${lit(p.style)},`);
    L.push(`    provenance: 'transcribed', source: ${lit(p.sourceFile)}, ratified: false,`);
    if (p.song) L.push(`    song: ${lit(p.song)},`);
    L.push(`    numerals: ${lit(p.numerals)},`);
    L.push(`    degrees: ${lit(p.degrees)},`);
    L.push(`    moods: ${lit(p.moods)},`);
    L.push(`    barsPerChord: ${lit(p.barsPerChord)},`);
    L.push(`    sourceKey: ${lit(p.sourceKey)}, dirAgrees: ${lit(p.dirAgrees)},`);
    L.push(`    match: { agree: ${p.match.agree}, colour: ${p.match.colour}, conflict: ${p.match.conflict}, rootMiss: ${p.match.rootMiss}, chords: ${p.match.chords}, repeats: ${lit(p.match.repeats)} },`);
    L.push(`    needsEar: ${lit(p.needsEar)},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');
  writeFileSync(join(ROOT, 'src/lib/progressions-unison.js'), L.join('\n'));
}

// --- rhythms + co-designed pairs ---
{
  const L = [HDR('Drum-loop rhythms'), '//',
    "// `accents` is null wherever the source file has flat velocity: A6.2 says such a",
    "// file is valid for pitch/onset extraction ONLY, and normalizeRhythm rejects a",
    "// uniform profile anyway. Those entries carry the groove and still need an accent",
    "// profile authored and auditioned before they can bind.",
    "// `microtiming` holds the residual after quantizing onsets to `grid` — the feel",
    "// the grid cannot express.", '',
    'export const RHYTHMS_UNISON = {'];
  for (const r of rhythms.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`  ${r.name}: {`);
    L.push(`    role: ${lit(r.role)}, band: ${lit(r.band)}, style: ${lit(r.style)}, provenance: 'transcribed', ratified: false,`);
    L.push(`    pack: 'unison-lofi', loop: ${lit(r.loop)}, part: ${lit(r.part)}, bpm: ${lit(r.bpm)},`);
    L.push(`    bars: ${r.bars}, grid: ${r.grid},`);
    L.push(`    onsets: ${lit(r.onsets)},`);
    L.push(`    accents: ${lit(r.accents)},`);
    if (r.microtiming) L.push(`    microtiming: ${lit(r.microtiming)},`);
    L.push(`    meter_class: ${lit(r.meter_class)}, tags: ${lit(r.tags)},`);
    L.push(`    triage: ${lit(r.triage)}, needsAccents: ${lit(!r.accents)},`);
    L.push(`    source: ${lit(r.sourceFile)}, sourceBars: ${r.sourceBars},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');
  L.push("// Parts of the same loop are co-designed by construction — the strongest edge");
  L.push("// type in A5.3, and free from a multi-track source.");
  L.push('export const INTERLOCKS_UNISON = [');
  for (const i of interlocks) {
    L.push(`  { name: ${lit(i.name)}, pair: [${lit(i.a)}, ${lit(i.b)}], rhythms: { a: ${lit(i.a)}, b: ${lit(i.b)} },`);
    L.push(`    roles: { a: ${lit(i.roleA)}, b: ${lit(i.roleB)} }, kind: 'co-designed', loop: ${lit(i.loop)}, ratified: false, character: null },`);
  }
  L.push(']', '');
  writeFileSync(join(ROOT, 'src/lib/rhythms-unison.js'), L.join('\n'));
}

// --- observed voicings ---
{
  const byQuality = new Map();
  for (const [q, obs] of voicingObs) {
    const tally = new Map();
    for (const o of obs) {
      const k = o.offsets.join(' ');
      if (!tally.has(k)) tally.set(k, { offsets: o.offsets, count: 0, sources: new Set() });
      tally.get(k).count++;
      tally.get(k).sources.add(o.source);
    }
    byQuality.set(q, [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 4));
  }
  const L = [HDR('Observed chord voicings'), '//',
    "// Semitone offsets from the chord root, exactly as played on the source records.",
    "// This is what MIDI is uniquely good for and a numeral corpus can never give",
    "// (D28): real register, spacing and inversion. Four of the five qualities D28",
    "// listed as missing shapes appear here — as OBSERVATIONS, not yet as library",
    "// shapes. Promotion into src/lib/voicings.js is an ear decision.", '',
    'export const VOICING_OBSERVATIONS = {'];
  for (const [q, list] of [...byQuality].sort((a, b) => a[0].localeCompare(b[0]))) {
    L.push(`  ${JSON.stringify(q || '')}: [`);
    for (const v of list) {
      L.push(`    { offsets: ${lit(v.offsets)}, seen: ${v.count}, sources: ${lit([...v.sources].slice(0, 3))} },`);
    }
    L.push(`  ],`);
  }
  L.push('}', '');
  // r16: 'm6' left this list — it was promoted into src/lib/voicings.js when
  // he ruled "add :6 to the dialect", so it is no longer a gap these records
  // fill. The list is a hand-kept literal, not derived from VOICINGS, so
  // promoting a quality means editing it here.
  L.push("/** qualities src/lib/voicings.js has no shape for, that these records DO voice */");
  L.push(`export const FILLS_GAPS = ${lit([...byQuality.keys()].filter((q) => ['2', '5', '69', 'add9', 'madd9'].includes(q)).sort())}`);
  L.push('');
  writeFileSync(join(ROOT, 'src/lib/voicings-unison.js'), L.join('\n'));
}

console.log(`wrote src/lib/progressions-unison.js  ${progressions.length} entries`);
console.log(`wrote src/lib/rhythms-unison.js       ${rhythms.length} rhythms + ${interlocks.length} co-designed pairs`);
console.log(`wrote src/lib/voicings-unison.js      ${voicingObs.size} qualities observed`);

// ---------------------------------------------------------------------------
if (REPORT) {
  const tot = progressions.length;
  const flagged = progressions.filter((p) => p.needsEar);
  const sum = (k) => progressions.reduce((a, p) => a + p.match[k], 0);
  console.log(`progressions: ${tot} (${Object.values(PACKS).map((p) => p.id + ' ' + progressions.filter((x) => x.pack === p.id).length).join(', ')})`);
  console.log(`  chords: ${sum('chords')} | label matches notes ${sum('agree')}, player adds colour ${sum('colour')}, conflict ${sum('conflict')}, root absent ${sum('rootMiss')}`);
  console.log(`  needs ear: ${flagged.length}`);
  for (const p of flagged) console.log(`    ${p.name.slice(0, 64)} — ${JSON.stringify(p.match)}`);
  const tally = (xs) => xs.reduce((a, x) => ({ ...a, [x]: (a[x] ?? 0) + 1 }), {});
  console.log(`\ntriage of chord MIDI: ${JSON.stringify(tally(progressions.map((p) => p.triage)))}`);
  const wrongDir = progressions.filter((p) => !p.dirAgrees);
  console.log(`directory key disagrees with the notes on ${wrongDir.length}/${tot} files (solved from notes; the directory is only a claim)`);
  for (const p of wrongDir.slice(0, 6)) console.log(`    ${basename(p.sourceFile).slice(0,52)} — dir "${p.dirKey}", notes say ${p.sourceKey}`);
  console.log(`\ndrum loops: ${rhythms.length} parts`);
  for (const r of rhythms) console.log(`  ${r.name.padEnd(32)} ${String(r.bars)}bar(of ${r.sourceBars}) 1/${String(r.grid).padEnd(2)} ${String(r.onsets.length).padStart(3)}on ${r.triage.padEnd(15)} accents:${r.accents ? 'YES' : 'none '} micro:${r.microtiming ? 'YES' : 'none'}`);
  console.log(`  co-designed pairs: ${interlocks.length}`);
  console.log(`\nvoicing observations by quality:`);
  for (const [q, obs] of [...voicingObs].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${(q || '(major triad)').padEnd(10)} ${String(obs.length).padStart(3)} observations`);
  }
  console.log(`\nnotes:`); notes_.forEach((n) => console.log('  ' + n));
  process.exit(0);
}

export { progressions, rhythms, voicingObs };
