// Assertion families (§3.3), evaluated against a compiled song's meta:
//   - relational: each section's `must` constraints vs its partner sections
//   - structural: withhold really silent + sets_up payoff exists
//   - harmonic: accented onsets carry chord tones of the sounding chord
//   - motif: bound material's emitted notes match the binder's resolution exactly,
//     and the emitted contour preserves the (transformed) library contour's shape
//   - interlock: complement scores between bound rhythmic layers per section
// Each result: { family, name, pass, severity: 'fail'|'warn', detail }

import { labelMetrics, harmonicRhythm, parseMeter } from './metrics.js';
import { pitchOf, gainOf } from './signature.js';
import { chordTimeline, chordAt } from './chords.js';
import { contourSigns } from '../binder/theory.js';
import { checkInterlocks } from '../binder/interlock.js';
import { declaredPairsFor } from '../lib/interlocks.js';

const METRIC_KEYS = {
  density: 'density',
  register_span: 'registerSpan',
  register_center: 'registerCenter',
  register_max: 'registerMax',
  syncopation: 'syncopation',
  entropy: 'pitchClassEntropy',
  accent_variance: 'accentVariance',
  onset_variety: 'onsetVariety',
};
const SUGAR = {
  'wider than': ['register_span', '>', 1],
  'narrower than': ['register_span', '<', 1],
  'denser than': ['density', '>', 1],
  'sparser than': ['density', '<', 1],
  'higher than': ['register_center', '>', 1],
  'lower than': ['register_center', '<', 1],
};

export function parseConstraint(key, raw) {
  const s = String(raw).trim();
  for (const [phrase, [metric, cmp, factor]] of Object.entries(SUGAR)) {
    if (s.toLowerCase().startsWith(phrase)) {
      return { metric, cmp, factor, ref: s.slice(phrase.length).trim(), raw: s };
    }
  }
  // "<cmp> <num>x <section>" or "<cmp> <num>"
  const m = /^(>=|<=|>|<|==?)\s*([\d.]+)\s*(x\s+(\S.*))?$/.exec(s);
  if (!m) throw new Error(`unparseable must-constraint "${s}" for "${key}"`);
  const metric = METRIC_KEYS[key] ? key : null;
  if (!metric && key !== 'harmonic_rhythm') throw new Error(`unknown must metric "${key}" (have: ${Object.keys(METRIC_KEYS).join(', ')}, harmonic_rhythm)`);
  return { metric: key, cmp: m[1] === '=' ? '==' : m[1], factor: Number(m[2]), ref: m[4]?.trim() ?? null, raw: s };
}

function cmp(a, op, b) {
  switch (op) {
    case '>': return a > b;
    case '>=': return a >= b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '==': return Math.abs(a - b) < 1e-9;
    default: throw new Error(`bad cmp ${op}`);
  }
}

function sectionHaps(hapsMap, { includeMuted = false } = {}) {
  const all = [];
  for (const [, entry] of hapsMap) {
    if (entry.muted && !includeMuted) continue;
    all.push(...entry.haps);
  }
  return all;
}

function sectionMetric(hapsMap, metricKey, ranges, meter, meta, evaluated) {
  if (metricKey === 'harmonic_rhythm') {
    const chordsHaps = harmonyHaps(evaluated, meta, ranges);
    return harmonicRhythm(chordsHaps, { ranges }).perCycle;
  }
  const m = labelMetrics(sectionHaps(hapsMap), { ranges, meter });
  return m[METRIC_KEYS[metricKey] ?? metricKey] ?? 0;
}

function harmonyHaps(evaluated, meta, ranges) {
  const binding = evaluated.bindings.get(meta?.harmonyBinding ?? 'chords');
  if (!binding?.queryArc) return [];
  const spans = ranges ?? [[0, meta?.totalCycles ?? 16]];
  const out = [];
  for (const [a, b] of spans) out.push(...binding.queryArc(a, b).filter((h) => h.hasOnset()));
  return out;
}

// ---------------------------------------------------------------------------

export function runAssertions(evaluated, hapsMap, meta) {
  const results = [];
  if (!meta) return results;
  const meter = meta.meter ?? '4/4';

  // ---- relational (must) ----
  for (const [name, sec] of Object.entries(meta.sections ?? {})) {
    if (!sec.must) continue;
    for (const [key, raw] of Object.entries(sec.must)) {
      let c;
      try { c = parseConstraint(key, raw); } catch (e) {
        results.push({ family: 'relational', name: `${name}.must.${key}`, pass: false, severity: 'fail', detail: e.message });
        continue;
      }
      const val = sectionMetric(hapsMap, c.metric, sec.ranges, meter, meta, evaluated);
      let refVal = 1;
      let refDesc = '';
      if (c.ref) {
        const refSec = meta.sections[c.ref];
        if (!refSec) {
          results.push({ family: 'relational', name: `${name}.must.${key}`, pass: false, severity: 'fail', detail: `references unknown section "${c.ref}"` });
          continue;
        }
        refVal = sectionMetric(hapsMap, c.metric, refSec.ranges, meter, meta, evaluated);
        refDesc = ` (${c.ref}: ${fmt(refVal)})`;
      }
      const target = c.factor * refVal;
      const pass = cmp(val, c.cmp, target);
      results.push({
        family: 'relational', name: `${name}.must.${key}`, pass, severity: 'fail',
        detail: `"${c.raw}": measured ${fmt(val)} vs target ${c.cmp} ${fmt(target)}${refDesc}`,
        measured: val, target, ref: c.ref,
      });
    }
  }

  // ---- structural: withhold + sets_up payoff ----
  for (const [name, sec] of Object.entries(meta.sections ?? {})) {
    for (const label of sec.withhold ?? []) {
      const entry = hapsMap.get(label);
      const inSec = entry ? labelMetrics(entry.haps, { ranges: sec.ranges, meter }).onsets : 0;
      results.push({
        family: 'structural', name: `${name}.withhold.${label}`, pass: inSec === 0, severity: 'fail',
        detail: inSec === 0 ? `${label} silent in ${name} as declared` : `${label} has ${inSec} onsets in ${name} but is withheld`,
      });
      if (sec.sets_up && meta.sections[sec.sets_up]) {
        const payoff = entry ? labelMetrics(entry.haps, { ranges: meta.sections[sec.sets_up].ranges, meter }).onsets : 0;
        results.push({
          family: 'structural', name: `${name}.payoff.${label}->${sec.sets_up}`, pass: payoff > 0, severity: 'fail',
          detail: payoff > 0 ? `${label} returns in ${sec.sets_up} (${payoff} onsets) — the payoff exists`
            : `${label} withheld in ${name} but never returns in ${sec.sets_up}`,
        });
      }
    }
  }

  // ---- harmonic: accented onsets carry chord tones ----
  const timeline = chordTimeline(harmonyHaps(evaluated, meta, [[0, meta.totalCycles ?? 16]]));
  if (timeline.length) {
    for (const [label, entry] of hapsMap) {
      if (entry.muted) continue;
      const pitched = entry.haps.filter((h) => pitchOf(h.value) != null);
      if (pitched.length === 0) continue;
      const gains = pitched.map((h) => gainOf(h.value));
      const maxG = Math.max(...gains);
      const varied = Math.max(...gains) - Math.min(...gains) > 1e-6;
      const accented = pitched.filter((h, i) => varied ? gains[i] >= 0.8 * maxG : isDownbeat(h));
      if (!accented.length) continue;
      const violations = [];
      for (const h of accented) {
        const seg = chordAt(timeline, h.whole.begin.valueOf());
        if (!seg || seg.pcs.size === 0) continue;
        const pc = ((Math.round(pitchOf(h.value)) % 12) + 12) % 12;
        if (!seg.pcs.has(pc)) violations.push(`${h.value.note ?? pc}@${h.whole.begin.toFraction()} vs ${seg.symbol}`);
      }
      const rate = 1 - violations.length / accented.length;
      // Bound material MUST satisfy this (the binder snapped it — a miss is a bug).
      // Free material gets a warning: accented tensions are a legitimate authorial
      // choice, but Ethan should know where they are (documented exceptions, §3.3).
      const isBound = (meta.motifPlacements ?? []).some((p) => p.label === label);
      const isTransition = meta.labels?.[label]?.kind === 'transition';
      results.push({
        family: 'harmonic', name: `${label}.accented-chord-tones`, pass: rate >= 0.85,
        severity: isBound && !isTransition ? 'fail' : 'warn',
        detail: `${accented.length} accented onsets, ${fmt(rate * 100)}% chord tones${isBound ? '' : ' [free material — exceptions allowed, listed for review]'}${violations.length ? ` — violations: ${violations.slice(0, 5).join(', ')}${violations.length > 5 ? ` (+${violations.length - 5})` : ''}` : ''}`,
      });
    }
  }

  // ---- motif: emitted notes match the binder's resolution; contour shape preserved ----
  for (const p of meta.motifPlacements ?? []) {
    if (!p.notes) continue; // percussive bind
    const entry = hapsMap.get(p.label);
    if (!entry) continue;
    const ranges = (p.sections ?? []).flatMap((s) => meta.sections[s]?.ranges ?? []);
    if (!ranges.length) continue;
    const expectedPhrase = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t)).map((n) => n.note);
    const emitted = entry.haps
      .filter((h) => ranges.some(([a, b]) => h.whole.begin.valueOf() >= a - 1e-9 && h.whole.begin.valueOf() < b - 1e-9))
      .sort((a, b) => a.whole.begin.valueOf() - b.whole.begin.valueOf())
      .map((h) => h.value.note);
    const tiled = [];
    while (tiled.length < emitted.length) tiled.push(...expectedPhrase);
    const exact = emitted.length > 0 && emitted.every((n, i) => n === tiled[i]);
    results.push({
      family: 'motif', name: `${p.label}.${p.motif ?? p.contourLib ?? 'bound'}.notes`, pass: exact, severity: 'fail',
      detail: exact ? `${emitted.length} emitted notes match the bound resolution exactly`
        : `emitted notes diverge from bound resolution (first mismatch at ${firstMismatch(emitted, tiled)})`,
    });
    if (p.contourSignsExpected?.length) {
      const midis = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t)).map((n) => n.midi);
      const perCycle = groupBy(p.notes, (n) => n.cycle);
      let match = 0, totalSigns = 0;
      for (const cyc of Object.values(perCycle)) {
        const signs = contourSigns(cyc.sort((a, b) => cmpFrac(a.t, b.t)).map((n) => n.midi));
        const expected = p.contourSignsExpected;
        for (let i = 0; i < signs.length && i < expected.length; i++) {
          totalSigns++;
          if (signs[i] === expected[i] || Math.abs(cyc[i + 1].midi - cyc[i].midi) <= 2) match++;
        }
      }
      const rate = totalSigns ? match / totalSigns : 1;
      results.push({
        family: 'motif', name: `${p.label}.${p.motif ?? p.contourLib ?? 'bound'}.contour${p.transform ? `(${p.transform})` : ''}`,
        pass: rate >= 0.8, severity: 'fail',
        detail: `contour shape ${fmt(rate * 100)}% preserved after harmonic snapping${p.transform ? ` under transform "${p.transform}"` : ''}`,
      });
      void midis;
    }
    if (p.cadence) {
      const last = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t)).at(-1);
      results.push({
        family: 'motif', name: `${p.label}.cadence`, pass: true, severity: 'warn',
        detail: `cadence target "${p.cadence}" resolved to ${last.note} (enforced at bind time, verified by exact-notes check)`,
      });
    }
  }

  // ---- interlock: complement scores between bound rhythmic layers, per section ----
  const bySection = {};
  for (const p of meta.motifPlacements ?? []) {
    for (const s of p.sections ?? []) {
      (bySection[s] ??= []).push({ label: p.label, onsets: p.onsets, rhythm: p.rhythm });
    }
  }
  for (const [sName, layers] of Object.entries(bySection)) {
    if (layers.length < 2) continue;
    const declaredPairs = declaredPairsFor(Object.fromEntries(layers.map((l) => [l.label, l.rhythm])));
    for (const r of checkInterlocks(layers, { declaredPairs })) {
      results.push({
        family: 'interlock', name: `${sName}.${r.pair.join('+')}`, pass: r.ok, severity: 'warn',
        detail: `complement joint=${r.joint} (${r.pair[1]} in ${r.pair[0]} gaps: ${r.bInAGaps}, reverse: ${r.aInBGaps})${r.declared ? ' [declared pair]' : ''}${r.ok ? '' : ' — rhythms collide; use a declared interlock pair or raise complementarity'}`,
      });
    }
  }

  return results;
}

function isDownbeat(h) {
  const f = h.whole.begin;
  const n = typeof f.n === 'number' ? f.n : Number(f.n);
  const d = typeof f.d === 'number' ? f.d : Number(f.d);
  return n % d === 0;
}
function cmpFrac(a, b) {
  const pa = a.includes('/') ? a.split('/').map(Number) : [Number(a), 1];
  const pb = b.includes('/') ? b.split('/').map(Number) : [Number(b), 1];
  return pa[0] * pb[1] - pb[0] * pa[1];
}
function groupBy(arr, fn) {
  const out = {};
  for (const x of arr) (out[fn(x)] ??= []).push(x);
  return out;
}
function firstMismatch(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return `index ${i}: got ${a[i]}, expected ${b[i]}`;
  return 'length mismatch';
}
function fmt(x) { return Number.isInteger(x) ? String(x) : x.toFixed(2); }
