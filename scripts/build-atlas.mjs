#!/usr/bin/env node
// Builds src/lib/atlas.js — the Pattern Atlas (D35 §1): a feature record per
// library entry on three axes (vibe / speed / context), sections (agglomerative
// clusters per pool, the "organized into sections of similar patterns" ask),
// and per-entry neighbor lists per axis. Retrieval returns NEIGHBORHOODS, never
// a single entry as "the answer" — an entry is an example of a family; the
// family is the unit of style (the anti-copy-paste ruling).
//
// Everything numeric is computed from the entries themselves (degrees grammar,
// onsets, bpm) and normalized corpus-wide; the context axis is merged from the
// HAND-CURATED src/lib/undertale-context.js (documented sources only — that
// file is authored, this script never writes it). Deterministic throughout:
// sorted iteration, fixed linkage, lexicographic tie-breaks — no randomness.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { FIGURATIONS_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { RHYTHMS_UNISON } from '../src/lib/rhythms-unison.js';
import { RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import { UNDERTALE_CONTEXT } from '../src/lib/undertale-context.js';
import { euclidOnsets } from '../src/binder/bind.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const K_NEIGHBORS = 5;

// ---------------------------------------------------------------------------
// vibe features (progressions): what the chord loop IS, harmonically
// ---------------------------------------------------------------------------
const MAJOR_SET = new Set([0, 2, 4, 5, 7, 9, 11]);
const MINOR_SET = new Set([0, 2, 3, 5, 7, 8, 10]);
const FLAT_NAMES = { 1: 'bII', 3: 'bIII', 6: 'bV', 8: 'bVI', 10: 'bVII', 2: 'II', 4: 'III', 9: 'VI', 11: 'VII', 5: 'IV', 7: 'V' };
const SHARP_NAMES = { 1: '#I', 3: '#II', 6: '#IV', 8: '#V', 10: '#VI' };

function circleDist(semis) { const k = (semis * 7) % 12; return Math.min(k, 12 - k); }

function tensionShape(seq) {
  if (seq.length < 3) return 'flat';
  const span = Math.max(...seq) - Math.min(...seq);
  if (span <= 1) return 'flat';
  const third = Math.max(1, Math.floor(seq.length / 3));
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const head = mean(seq.slice(0, third)), tail = mean(seq.slice(-third));
  const peak = seq.indexOf(Math.max(...seq));
  if (peak > 0 && peak < seq.length - 1 && Math.abs(head - tail) < span / 3) return 'arch';
  if (tail - head > span / 3) return 'rising';
  if (head - tail > span / 3) return 'falling';
  return 'flat';
}

function vibeFeatures(entry) {
  const chords = parseDegrees(entry.degrees);
  const scale = entry.family === 'minor' ? MINOR_SET : MAJOR_SET;
  const colors = [];
  for (const c of chords) {
    if (scale.has(c.semis)) continue;
    const label = c.spell === '#' ? (SHARP_NAMES[c.semis] ?? FLAT_NAMES[c.semis]) : FLAT_NAMES[c.semis];
    if (label && !colors.includes(label)) colors.push(label);
  }
  const q = (re) => chords.filter((c) => re.test(c.quality)).length / chords.length;
  const totalBars = entry.barsPerChord ? entry.barsPerChord.reduce((a, b) => a + b, 0) : chords.length;
  const motion = { fifths: 0, step: 0, third: 0, same: 0, tritone: 0 };
  for (let i = 0; i < chords.length; i++) {
    const d = ((chords[(i + 1) % chords.length].semis - chords[i].semis) % 12 + 12) % 12;
    if (d === 0) motion.same++;
    else if (d === 5 || d === 7) motion.fifths++;
    else if (d <= 2 || d >= 10) motion.step++;
    else if (d === 6) motion.tritone++;
    else motion.third++;
  }
  for (const k of Object.keys(motion)) motion[k] = round3(motion[k] / chords.length);
  const last = chords[chords.length - 1], penult = chords[chords.length - 2] ?? last;
  let cadence;
  if (last.semis === 0) cadence = penult.semis === 7 ? 'authentic' : penult.semis === 5 ? 'plagal' : 'resolves';
  else cadence = last.semis === 7 ? 'half' : 'loop';
  const tension = chords.map((c) => circleDist(c.semis));
  return {
    family: entry.family,
    colors, colorCount: colors.length,
    minorish: round3(q(/^m(?!aj)/)), seventh: round3(q(/7|9|13|\^/)),
    dim: chords.some((c) => /^o/.test(c.quality)), sus: round3(q(/sus|^2$/)),
    harmonicRhythm: round3(chords.length / totalBars),
    rootMotion: motion, cadence, tension, tensionShape: tensionShape(tension),
  };
}

// ---------------------------------------------------------------------------
// speed features (figures / rhythms / progressions-with-ownFigure)
// ---------------------------------------------------------------------------
function frac(x) { const [n, d = 1] = String(x).split('/').map(Number); return n / d; }

function speedFromOnsets(onsets, { bars = 1, meterNum = 4, accents = null, legato = null, figure = null, bpm = null } = {}) {
  const pos = onsets.map(frac);
  const barPos = pos.filter((p) => p < 1); // first bar carries the shape
  const dens = pos.length / bars;
  let lcm = 1;
  for (const o of onsets) { const d = Number(String(o).split('/')[1] ?? 1); lcm = lcmOf(lcm, d); }
  const subdivision = lcm % 3 === 0 && lcm % 16 !== 0 ? 'triplet' : lcm >= 16 ? '16ths' : '8ths';
  const off = barPos.filter((p) => !Number.isInteger(p * meterNum)).length;
  const onsetSteps = [...new Set(barPos.map((p) => Math.round(p * 48)))].sort((a, b) => a - b);
  return {
    bpm, bpmBand: bpm == null ? null : bpm < 90 ? 'slow' : bpm <= 130 ? 'mid' : 'fast',
    density: round3(dens),
    subdivision,
    syncopation: round3(barPos.length ? off / barPos.length : 0),
    chordness: figure ? round3(figure.filter((t) => String(t).includes('.')).length / figure.length) : null,
    legato,
    accentSpread: accents && accents.length ? round3(Math.max(...accents) - Math.min(...accents)) : null,
    onsetSteps,
  };
}

function entryOnsets(entry) {
  if (entry.euclid) return euclidOnsets(...entry.euclid).map(([n, d]) => `${n}/${d}`);
  return entry.onsets;
}

// ---------------------------------------------------------------------------
// distances (shared by neighbors and clustering)
// ---------------------------------------------------------------------------
const CADENCES = ['authentic', 'plagal', 'resolves', 'half', 'loop'];
const SHAPES = ['flat', 'rising', 'falling', 'arch'];
const SUBDIVS = { '8ths': 0, '16ths': 1, triplet: 0.5 };

function vibeVec(v, norms) {
  return [
    v.family === 'minor' ? 1 : 0, v.family === 'modal' ? 1 : 0,
    norms.colorMax ? v.colorCount / norms.colorMax : 0,
    v.minorish, v.seventh, v.dim ? 1 : 0, v.sus,
    norms.hrMax ? v.harmonicRhythm / norms.hrMax : 0,
    v.rootMotion.fifths, v.rootMotion.step, v.rootMotion.third, v.rootMotion.same,
    ...CADENCES.map((c) => (v.cadence === c ? 0.5 : 0)),
    ...SHAPES.map((s) => (v.tensionShape === s ? 0.5 : 0)),
  ];
}

function speedVec(s, norms) {
  return [
    s.bpmBand == null ? 0.5 : s.bpmBand === 'slow' ? 0 : s.bpmBand === 'mid' ? 0.5 : 1,
    norms.densMax ? s.density / norms.densMax : 0,
    SUBDIVS[s.subdivision] ?? 0.5,
    s.syncopation,
    s.chordness ?? 0.25,
    s.legato == null ? 0.5 : s.legato ? 1 : 0,
    s.accentSpread ?? 0.3,
  ];
}

function euclid(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

/** Levenshtein over 48-step binary onset strings (the MIR edit-distance move) */
function onsetEditDist(a, b) {
  const str = (steps) => { const s = Array(48).fill('0'); for (const x of steps) if (x < 48) s[x] = '1'; return s.join(''); };
  const A = str(a), B = str(b);
  let prev = Array(B.length + 1).fill(0).map((_, j) => j);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length] / 48;
}

function contextDist(a, b) {
  if (!a || !b) return null;
  if (a.song === b.song) return 0.05;
  const am = a.motifs ?? [], bm = b.motifs ?? [];
  if (am.some((m) => bm.includes(m))) return 0.25;
  if (a.character && a.character === b.character) return 0.35;
  if (a.role && a.role === b.role) return 0.6;
  return 1;
}

// ---------------------------------------------------------------------------
// agglomerative average-linkage clustering over a pairwise distance matrix
// ---------------------------------------------------------------------------
function cluster(names, dist, K) {
  let clusters = names.map((n) => [n]);
  const d = new Map();
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    d.set(key(names[i], names[j]), dist(names[i], names[j]));
  }
  const between = (ca, cb) => {
    let s = 0;
    for (const a of ca) for (const b of cb) s += d.get(key(a, b));
    return s / (ca.length * cb.length);
  };
  while (clusters.length > K) {
    let best = Infinity, bi = 0, bj = 1;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      const x = between(clusters[i], clusters[j]);
      if (x < best - 1e-12) { best = x; bi = i; bj = j; }
    }
    clusters[bi] = [...clusters[bi], ...clusters[bj]].sort();
    clusters.splice(bj, 1);
  }
  return clusters.sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

// ---------------------------------------------------------------------------
// assemble the three kinds
// ---------------------------------------------------------------------------
function round3(x) { return Math.round(x * 1000) / 1000; }
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function lcmOf(a, b) { return (a / gcd(a, b)) * b; }
const poolOf = (pack) => String(pack ?? 'library').split('-')[0];
const stripTake = (s) => s.replace(/ \(\d+\)$/, '');

const records = { progressions: {}, figures: {}, rhythms: {} };

// figures → song, for rhythm-donor context resolution
const figSong = new Map();
for (const [name, e] of Object.entries(FIGURATIONS_UNDERTALE)) figSong.set(name, stripTake(e.songs[0] ?? ''));

for (const [name, e] of Object.entries(ALL_PROGRESSIONS).sort()) {
  const vibe = vibeFeatures(e);
  let speed = null;
  if (e.ownFigure) {
    speed = speedFromOnsets(e.ownFigure.onsets, {
      bars: e.ownFigure.bars ?? 1, meterNum: Number((e.meter ?? '4/4').split('/')[0]),
      accents: e.ownFigure.accents, legato: e.ownFigure.legato ?? null,
      figure: e.ownFigure.figure, bpm: e.bpm ?? null,
    });
  } else if (e.bpm) {
    speed = speedFromOnsets([], { bpm: e.bpm });
  }
  const context = e.song && UNDERTALE_CONTEXT[e.song] ? { song: e.song, ...UNDERTALE_CONTEXT[e.song] } : null;
  records.progressions[name] = { pack: e.pack, pool: poolOf(e.pack), vibe, speed, context };
}

for (const [name, e] of Object.entries(FIGURATIONS_UNDERTALE).sort()) {
  const speed = speedFromOnsets(e.onsets, {
    bars: e.bars ?? 1, meterNum: Number((e.meter_class ?? '4/4').split('/')[0]),
    accents: e.accents, legato: e.legato ?? null, figure: e.figure,
  });
  const song = figSong.get(name);
  const context = song && UNDERTALE_CONTEXT[song] ? { song, ...UNDERTALE_CONTEXT[song] } : null;
  records.figures[name] = { pack: e.pack, pool: poolOf(e.pack), class: e.class, vibe: null, speed, context };
}

const rhythmPools = [
  ...Object.entries(RHYTHMS).map(([n, e]) => [n, { ...e, pack: e.pack ?? 'library' }]),
  ...Object.entries(RHYTHMS_UNISON),
  ...Object.entries(RHYTHMS_UNDERTALE),
];
for (const [name, e] of rhythmPools.sort()) {
  const speed = speedFromOnsets(entryOnsets(e), {
    bars: e.bars ?? 1, meterNum: e.meter_class && e.meter_class !== 'any' ? Number(e.meter_class.split('/')[0]) : 4,
    accents: e.accents, bpm: e.bpm ?? null,
  });
  const song = e.figures ? figSong.get(e.figures[0]) : null;
  const context = song && UNDERTALE_CONTEXT[song] ? { song, ...UNDERTALE_CONTEXT[song] } : null;
  records.rhythms[name] = { pack: e.pack, pool: poolOf(e.pack), role: e.role, vibe: null, speed, context };
}

// ---------------------------------------------------------------------------
// norms, distances, neighbors, sections
// ---------------------------------------------------------------------------
const norms = {};
{
  const progs = Object.values(records.progressions);
  norms.colorMax = Math.max(1, ...progs.map((r) => r.vibe.colorCount));
  norms.hrMax = Math.max(1, ...progs.map((r) => r.vibe.harmonicRhythm));
  const speeds = Object.values(records).flatMap((k) => Object.values(k)).filter((r) => r.speed);
  norms.densMax = Math.max(1, ...speeds.map((r) => r.speed.density));
}

function axisDist(kind, a, b, axis) {
  const A = records[kind][a], B = records[kind][b];
  if (axis === 'vibe') {
    if (!A.vibe || !B.vibe) return null;
    return euclid(vibeVec(A.vibe, norms), vibeVec(B.vibe, norms));
  }
  if (axis === 'speed') {
    if (!A.speed || !B.speed) return null;
    return euclid(speedVec(A.speed, norms), speedVec(B.speed, norms)) + 2 * onsetEditDist(A.speed.onsetSteps, B.speed.onsetSteps);
  }
  if (axis === 'context') return contextDist(A.context, B.context);
  // blend: the kind's primary axes averaged over whichever are computable
  const parts = [axisDist(kind, a, b, 'vibe'), axisDist(kind, a, b, 'speed')].filter((x) => x != null);
  return parts.length ? parts.reduce((x, y) => x + y, 0) / parts.length : null;
}

const AXES = { progressions: ['vibe', 'speed', 'context', 'blend'], figures: ['speed', 'context', 'blend'], rhythms: ['speed', 'context', 'blend'] };
for (const kind of Object.keys(records)) {
  const names = Object.keys(records[kind]).sort();
  for (const name of names) {
    const neighbors = {};
    for (const axis of AXES[kind]) {
      const scored = [];
      for (const other of names) {
        if (other === name) continue;
        const dx = axisDist(kind, name, other, axis);
        if (dx == null || (axis === 'context' && dx >= 1)) continue;
        scored.push([dx, other]);
      }
      scored.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
      neighbors[axis] = scored.slice(0, K_NEIGHBORS).map(([, n]) => n);
    }
    records[kind][name].neighbors = neighbors;
  }
}

// sections per (kind, pool), on the kind's blend distance
const sections = { progressions: {}, figures: {}, rhythms: {} };
for (const kind of Object.keys(records)) {
  const byPool = new Map();
  for (const [name, r] of Object.entries(records[kind])) {
    if (!byPool.has(r.pool)) byPool.set(r.pool, []);
    byPool.get(r.pool).push(name);
  }
  for (const [pool, names] of [...byPool.entries()].sort()) {
    names.sort();
    const K = Math.max(1, Math.min(15, Math.round(names.length / 12) || 1, names.length));
    const clusters = names.length === 1 ? [names] : cluster(names, (a, b) => axisDist(kind, a, b, 'blend') ?? 1, Math.max(K, Math.min(3, names.length)));
    clusters.forEach((members, i) => {
      const id = `${kind.slice(0, 4)}_${pool}_${i}`;
      sections[kind][id] = { pool, label: sectionLabel(kind, members), members };
      for (const m of members) records[kind][m].section = id;
    });
  }
}

function majority(xs) {
  const c = new Map();
  for (const x of xs) if (x != null) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0] ?? null;
}

function sectionLabel(kind, members) {
  const rs = members.map((m) => records[kind][m]);
  if (kind === 'progressions') {
    const fam = majority(rs.map((r) => r.vibe.family));
    const color = majority(rs.flatMap((r) => (r.vibe.colors.length ? r.vibe.colors : ['diatonic'])));
    const hr = rs.reduce((a, r) => a + r.vibe.harmonicRhythm, 0) / rs.length;
    const hrBand = hr <= 0.75 ? 'slow harmony' : hr <= 1.5 ? '~1 chord/bar' : 'churning';
    const bpmBand = majority(rs.map((r) => r.speed?.bpmBand));
    return [fam, color, hrBand, bpmBand].filter(Boolean).join(' · ');
  }
  const sub = majority(rs.map((r) => r.speed.subdivision));
  const dens = rs.reduce((a, r) => a + r.speed.density, 0) / rs.length;
  const densBand = dens <= 4 ? 'sparse' : dens <= 8 ? 'mid' : 'dense';
  const feel = kind === 'figures'
    ? (majority(rs.map((r) => (r.speed.legato ? 'legato' : 'detached'))))
    : (rs.reduce((a, r) => a + r.speed.syncopation, 0) / rs.length >= 0.4 ? 'syncopated' : 'on-grid');
  return [sub, densBand, feel].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// emit
// ---------------------------------------------------------------------------
const HEADER = `// The Pattern Atlas (D35 §1): per-entry feature records on the vibe / speed /
// context axes, section membership (clusters of similar patterns, per pool),
// and per-axis neighbor lists — across ALL pools, so one query spans corpora.
//
// GENERATED by scripts/build-atlas.mjs — do not hand-edit; re-run the builder.
// The context blocks are merged from src/lib/undertale-context.js, which IS
// hand-curated (documented sources only) — edit context THERE, then re-run.
//
// THE RULING (anti-copy-paste): retrieval returns a NEIGHBORHOOD, never a
// single entry as "the answer". An entry is an example of a family; the family
// is the unit of style. Bind-time callers use neighborhood() + pickFrom(seed),
// and stay free to apply the declared variation operators on what they draw.
`;

const TAIL = `
/** the family around an entry: its axis neighbors ∪ its section mates.
 *  Returns NAMES (plural, always) — never resolve this to one entry without
 *  a seeded pickFrom(): the neighborhood is the retrieval unit (D35). */
export function neighborhood(kind, name, axis = 'blend') {
  const rec = ATLAS[kind]?.[name];
  if (!rec) throw new Error(\`no atlas record for \${kind}/\${name}\`);
  const out = new Set(rec.neighbors[axis] ?? []);
  if (axis === 'blend') for (const m of ATLAS_SECTIONS[kind][rec.section].members) out.add(m);
  out.delete(name);
  return [...out].sort();
}

/** section record an entry belongs to */
export function sectionOf(kind, name) {
  const rec = ATLAS[kind]?.[name];
  if (!rec) throw new Error(\`no atlas record for \${kind}/\${name}\`);
  return { id: rec.section, ...ATLAS_SECTIONS[kind][rec.section] };
}

/** deterministic seeded choice from a neighborhood (fnv-1a over seed+names) */
export function pickFrom(names, seed = 0) {
  if (!names.length) throw new Error('pickFrom: empty neighborhood');
  let h = 0x811c9dc5 ^ (seed >>> 0);
  for (const n of names) for (let i = 0; i < n.length; i++) {
    h ^= n.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return names[(h >>> 0) % names.length];
}
`;

// one line per entry/section: diffable per record, compact overall
const emitKinds = (obj) => `{\n${Object.entries(obj).map(([kind, entries]) =>
  ` ${kind}: {\n${Object.entries(entries).map(([n, r]) => `  ${JSON.stringify(n)}: ${JSON.stringify(r)},`).join('\n')}\n },`
).join('\n')}\n}`;

const body = `${HEADER}
export const ATLAS_SECTIONS = ${emitKinds(sections)};

export const ATLAS = ${emitKinds(records)};
${TAIL}`;

writeFileSync(join(ROOT, 'src/lib/atlas.js'), body);

const counts = Object.fromEntries(Object.entries(records).map(([k, v]) => [k, Object.keys(v).length]));
const sCounts = Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, Object.keys(v).length]));
const withCtx = Object.values(records).flatMap((k) => Object.values(k)).filter((r) => r.context).length;
console.log(`wrote src/lib/atlas.js`);
console.log(`  entries   ${JSON.stringify(counts)}`);
console.log(`  sections  ${JSON.stringify(sCounts)}`);
console.log(`  context   ${withCtx} entries carry curated song context`);
