// Build src/lib/figuration-graph.js — relationships over the fnd_ canon (D62).
//
// Ethan (2026-08-25): "i also want to make relationships - like which
// foundations can travel to other foundations while maintaining the vibe and
// sounding smooth across sections", plus "in any given song when layering, we
// can combine multiple patterns", plus the caveat "we might have to figure
// out which chords don't work on certain tones".
//
// Three products, all MEASURED or RULE-DERIVED, all CANDIDATE (A6.1 — an edge
// is a hypothesis about smoothness until his ear hears the transition):
//
//   FND_QUALITY_COMPAT — the caveat made concrete: every pattern bound against
//     a battery of chord qualities; a cell records the binder's own FALLBACK
//     warnings (a token the chord cannot supply, re-pointed by preference
//     order). Clean cells are omitted. This is the mechanical half of "which
//     chords don't work on certain tones"; the taste half stays with the ear.
//
//   FND_TRAVEL — section-to-section edges. Devices come from the corpus's own
//     observed development moves (DEVELOPMENT_STATS: repitch 59, blockify 23,
//     arpeggiate 7, pattern_swap 7, sparsify 6, octave moves 6, densify 4)
//     crossed with the variation-device ranking in research/accomp-research.md
//     §2 (register shift / density change = the "very common" tier). Every
//     edge DECLARES what it preserves (the D50 idiom) and a cost that prices
//     audibility. Meter is a hard guard: travel never changes the bar's feel
//     mid-song except through the declared compound/simple nesting devices.
//
//   FND_LAYERS — vertical pairs that can sound AT ONCE (his layering note).
//     Rule-derived from the D41 two-hand principles: register lanes apart,
//     compatible grids, onsets that interlock rather than pile up.
//
// GENERATED — do not hand-edit; re-run this script. --check verifies.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { bindFigure } from '../src/binder/bind.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/lib/figuration-graph.js');
const CHECK = process.argv.includes('--check');

const F = FIGURATIONS_FOUNDATION;
const names = Object.keys(F);
const BPB = { '4/4': 4, '3/4': 3, '2/4': 2, '2/2': 2, '6/8': 2, '12/8': 4 };

// ---- features -------------------------------------------------------------
const toN = (s) => { const [a, b] = String(s).split('/').map(Number); return a / (b || 1); };
const features = {};
for (const n of names) {
  const e = F[n];
  const bpb = BPB[e.meter_class] ?? 4;
  const off = e.onsets.filter((o) => !Number.isInteger(toN(o) * bpb)).length;
  features[n] = {
    class: e.class, style: e.style, meter: e.meter_class, grid: e.grid,
    octave: e.octave, legato: e.legato,
    density: e.figure.length / (e.bars ?? 1),
    offbeatFrac: Math.round((off / e.onsets.length) * 100) / 100,
    chordness: e.fit.chordness, meanMidi: e.fit.meanMidi,
  };
}

// ---- quality compatibility (the caveat, measured) -------------------------
// Battery: the qualities the libraries actually use, one bar each on C.
const QUALITIES = ['', 'm', '7', 'm7', '^7', 'm^7', 'm7b5', 'o', 'o7', 'sus', '6', 'm6', '9', 'm9', '^9', '13', '7b9', '7alt', '9sus'];
const compat = {};
const badQualities = [];
// pre-probe: a quality the parser does not know warns on EVERY pattern and
// would pollute every row — drop it from the battery and say so instead
const probeFig = { ...F.fnd_drive_8th_root, figure: ['R'], onsets: ['0/1'], accents: [1] };
const battery = QUALITIES.filter((q) => {
  const { warnings } = bindFigure(probeFig, { harmony: [`C${q}`], barsPerChord: 1, key: 'C:major' }, '4/4', {});
  if (warnings.some((w) => String(w).includes('unknown chord'))) { badQualities.push(`C${q}`); return false; }
  return true;
});
for (const q of battery) {
  const sym = `C${q}`;
  for (const n of names) {
    const e = F[n];
    const { warnings } = bindFigure(e, { harmony: [sym], barsPerChord: 1, key: 'C:major' }, e.meter_class, { rhythmName: n });
    if (warnings.length) {
      (compat[n] ??= {})[q || 'maj'] = [...new Set(warnings.map(String))].map((w) => w.slice(0, 90));
    }
  }
}

// ---- travel edges ---------------------------------------------------------
// Each device: applies(a, b) -> false | { preserves, cost }. Costs price
// audibility (cheap = subtle), CANDIDATE numbers. Undirected: stored a<b.
const ratio = (a, b) => Math.max(a, b) / Math.min(a, b);
const DEVICES = {
  // corpus: repitch_same_rhythm 59× — same figure machinery, new register
  register_shift: (a, b) => a.class === b.class && a.meter === b.meter &&
    Math.abs(a.octave - b.octave) >= 1 && ratio(a.density, b.density) <= 4 / 3 &&
    { preserves: ['class', 'density', 'meter'], cost: 0.2 },
  // research §2 tier 1: subdivision doubling/halving (murky↔octave_bounce, alberti 8↔16)
  density_shift: (a, b) => a.class === b.class && a.meter === b.meter &&
    a.octave === b.octave && ratio(a.density, b.density) >= 1.7 && ratio(a.density, b.density) <= 2.5 &&
    { preserves: ['class', 'register', 'meter'], cost: 0.2 },
  // corpus pattern_swap 7×: same rhythm skeleton, different tokens (tresillo↔tumbao)
  figure_swap: (a, b, ea, eb) => a.meter === b.meter && a.class === b.class &&
    ea.onsets.join() === eb.onsets.join() && ea.figure.join() !== eb.figure.join() &&
    { preserves: ['rhythm', 'class', 'meter'], cost: 0.25 },
  // same tradition, same texture family — the low-drama neighbor
  same_family: (a, b) => a.class === b.class && a.style === b.style && a.meter === b.meter &&
    { preserves: ['class', 'style', 'meter'], cost: 0.15 },
  // corpus blockify 23× / arpeggiate 7×: broken ↔ struck, register held
  blockify: (a, b) => a.meter === b.meter && Math.abs(a.octave - b.octave) <= 1 &&
    ((a.class === 'arp' && b.class === 'block') || (a.class === 'block' && b.class === 'arp')) &&
    { preserves: ['register', 'meter', 'harmony-clarity'], cost: 0.35 },
  // corpus sparsify 6× / densify 4×: energy change across a class boundary
  energy_shift: (a, b) => a.meter === b.meter && a.class !== b.class &&
    Math.abs(a.octave - b.octave) <= 1 && ratio(a.density, b.density) >= 1.7 &&
    { preserves: ['register', 'meter'], cost: 0.4 },
  // shared tradition bridges a class change (bossa_bass -> montuno_skel)
  style_kin: (a, b) => a.meter === b.meter && a.class !== b.class && a.style === b.style &&
    ratio(a.density, b.density) < 1.7 &&
    { preserves: ['style', 'meter'], cost: 0.45 },
  // a 2/4 bar nests twice in 4/4; 6/8 nests twice in 12/8 — the only legal
  // meter crossings, and they cost like the section events they are
  meter_nest: (a, b) => a.class === b.class &&
    ((new Set([a.meter, b.meter]).has('2/4') && new Set([a.meter, b.meter]).has('4/4')) ||
     (new Set([a.meter, b.meter]).has('6/8') && new Set([a.meter, b.meter]).has('12/8'))) &&
    { preserves: ['class', 'pulse'], cost: 0.5 },
};

const travel = [];
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const [na, nb] = [names[i], names[j]];
    const [a, b] = [features[na], features[nb]];
    const hits = [];
    for (const [dev, fn] of Object.entries(DEVICES)) {
      const r = fn(a, b, F[na], F[nb]);
      if (r) hits.push({ device: dev, ...r });
    }
    if (!hits.length) continue;
    hits.sort((x, y) => x.cost - y.cost);
    travel.push({
      a: na, b: nb, cost: hits[0].cost,
      devices: hits.map((h) => h.device),
      preserves: [...new Set(hits.flatMap((h) => h.preserves))].sort(),
    });
  }
}
travel.sort((x, y) => x.cost - y.cost || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));

// ---- layer pairs (vertical) ----------------------------------------------
// D41 principles as rules: register lanes apart, one grid divides the other,
// onsets interlock (low shared-onset fraction off the downbeat), and the pair
// reads as floor + comment (a low anchor under a mid/high answer).
const FLOOR = new Set(['dance_bass', 'walk', 'pulse', 'broken_octave', 'riff', 'oompah', 'sustain']);
const COMMENT = new Set(['comp', 'offbeat', 'block', 'guajeo', 'arp', 'fingerpick']);
const layers = [];
for (const nb of names) {
  for (const nu of names) {
    if (nb === nu) continue;
    const [bass, up] = [features[nb], features[nu]];
    const [eb, eu] = [F[nb], F[nu]];
    if (bass.meter !== up.meter) continue;
    if (!FLOOR.has(bass.class) || !COMMENT.has(up.class)) continue;
    if (up.octave - bass.octave < 1) continue;               // register lanes (D41)
    if (bass.grid % up.grid !== 0 && up.grid % bass.grid !== 0) continue;
    const setB = new Set(eb.onsets.map(toN));
    const shared = eu.onsets.map(toN).filter((x) => x !== 0 && setB.has(x)).length;
    const overlap = Math.round((shared / eu.onsets.length) * 100) / 100;
    if (overlap > 0.6) continue;                              // pile-up, not interlock
    if (bass.density + up.density > 24) continue;             // combined activity cap
    layers.push({
      bass: nb, upper: nu, overlap,
      why: `${bass.class} floor (oct ${bass.octave}) under ${up.class} comment (oct ${up.octave}), ${Math.round((1 - overlap) * 100)}% interlocked`,
    });
  }
}
layers.sort((x, y) => x.overlap - y.overlap || x.bass.localeCompare(y.bass) || x.upper.localeCompare(y.upper));

// ---- emit -----------------------------------------------------------------
const lit = (v) => JSON.stringify(v);
const L = [
  '// Relationships over the foundational canon (D62): quality compatibility,',
  '// travel edges, layer pairs. GENERATED by scripts/build-figuration-graph.mjs',
  '// — do not hand-edit; re-run the builder. Everything here is CANDIDATE:',
  '// compat cells are the binder\'s own measurements, but every edge and pair',
  '// is a smoothness HYPOTHESIS until the ear hears the transition (A6.1).',
  '',
  '// Per-pattern computed features (density = onsets/bar).',
  'export const FND_FEATURES = {',
  ...names.sort().map((n) => `  ${n}: ${lit(features[n])},`),
  '};',
  '',
  '// Chord qualities whose members cannot supply a pattern\'s tokens — the',
  '// binder FALLBACK warnings per quality (clean cells omitted). The measured',
  '// half of "which chords don\'t work on certain tones"; taste is the ear\'s.',
  'export const FND_QUALITY_COMPAT = {',
  ...Object.keys(compat).sort().map((n) => `  ${n}: ${lit(compat[n])},`),
  '};',
  '',
  '// Section-to-section transitions. Devices from the corpus\'s observed',
  '// development moves + the research §2 device ranking; each edge declares',
  '// what it preserves (D50 idiom). Undirected, sorted by cost (subtle first).',
  'export const FND_TRAVEL = [',
  ...travel.map((e) => `  ${lit(e)},`),
  '];',
  '',
  '// Pairs that can sound AT ONCE — floor + comment, register lanes apart,',
  '// grids nested, onsets interlocked (D41 principles as rules).',
  'export const FND_LAYERS = [',
  ...layers.map((e) => `  ${lit(e)},`),
  '];',
  '',
];
const out = L.join('\n');

if (CHECK) {
  if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== out) {
    console.error('figuration-graph.js is stale — re-run scripts/build-figuration-graph.mjs');
    process.exit(1);
  }
  console.log('ok');
} else {
  writeFileSync(OUT, out);
  console.log(`wrote src/lib/figuration-graph.js`);
  console.log(`  features: ${names.length} patterns`);
  console.log(`  quality compat: ${Object.keys(compat).length} patterns have fallback cells (${battery.length}/${QUALITIES.length} qualities probed${badQualities.length ? `; unparseable dropped: ${badQualities.join(' ')}` : ''})`);
  console.log(`  travel: ${travel.length} edges (cheapest ${travel[0]?.cost}, priciest ${travel.at(-1)?.cost})`);
  console.log(`  layers: ${layers.length} floor+comment pairs`);
}
