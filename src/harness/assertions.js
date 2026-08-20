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
  gw_density: 'gwDensity',            // gain-weighted density (A1.3 — Goodhart-resistant "louder/fuller")
  register_span: 'registerSpan',      // on the section AGGREGATE this is cross-layer register width (A1.3)
  cross_register_width: 'registerSpan',
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
  if (!metric && key !== 'harmonic_rhythm' && key !== 'active_layers') throw new Error(`unknown must metric "${key}" (have: ${Object.keys(METRIC_KEYS).join(', ')}, harmonic_rhythm, active_layers)`);
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
  if (metricKey === 'active_layers') { // arrangement metric (A1.3)
    let n = 0;
    for (const [, entry] of hapsMap) {
      if (entry.muted) continue;
      if (labelMetrics(entry.haps, { ranges, meter }).onsets > 0) n++;
    }
    return n;
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
    const judge = (haps, cutoffFn) => {
      const pitched = haps.filter((h) => pitchOf(h.value) != null);
      if (!pitched.length) return null;
      const gains = pitched.map((h) => gainOf(h.value));
      const accented = pitched.filter((h, i) => cutoffFn(gains[i], h));
      if (!accented.length) return null;
      const violations = [];
      for (const h of accented) {
        const seg = chordAt(timeline, h.whole.begin.valueOf());
        if (!seg || seg.pcs.size === 0) continue;
        const pc = ((Math.round(pitchOf(h.value)) % 12) + 12) % 12;
        if (!seg.pcs.has(pc)) violations.push(`${h.value.note ?? pc}@${h.whole.begin.toFraction()} vs ${seg.symbol}`);
      }
      return { accented: accented.length, violations };
    };
    const vio = (v) => v.violations.length ? ` — violations: ${v.violations.slice(0, 5).join(', ')}${v.violations.length > 5 ? ` (+${v.violations.length - 5})` : ''}` : '';

    // Bound material: per placement, using the binder's OWN accent mapping (gains
    // for accents ≥ 0.7 in that placement) — assertion and binder agree exactly.
    const boundLabels = new Set();
    for (const p of meta.motifPlacements ?? []) {
      if (!p.notes || !p.gains || !p.accents) continue; // percussive
      boundLabels.add(p.label);
      const entry = hapsMap.get(p.label);
      if (!entry || entry.muted) continue;
      const ranges = (p.sections ?? []).flatMap((s) => meta.sections[s]?.ranges ?? []);
      const accGains = p.gains.filter((_, i) => p.accents[i] >= 0.7);
      if (!accGains.length || !ranges.length) continue;
      const cutoff = Math.min(...accGains) - 1e-6;
      const inRanges = entry.haps.filter((h) => ranges.some(([a, b]) => h.whole.begin.valueOf() >= a - 1e-9 && h.whole.begin.valueOf() < b - 1e-9));
      const v = judge(inRanges, (g) => g >= cutoff);
      if (!v) continue;
      const isTransition = meta.labels?.[p.label]?.kind === 'transition';
      const rate = 1 - v.violations.length / v.accented;
      results.push({
        family: 'harmonic', name: `${p.label}.accented-chord-tones[${(p.sections ?? []).join(',')}]`,
        pass: rate >= 0.85, severity: isTransition ? 'warn' : 'fail',
        detail: `${v.accented} accented onsets (bound), ${fmt(rate * 100)}% chord tones${vio(v)}`,
      });
    }

    // Free material: whole-song heuristic cutoff; warn-level — accented tensions
    // are a legitimate authorial choice, but they get listed (documented exceptions, §3.3).
    for (const [label, entry] of hapsMap) {
      if (entry.muted || boundLabels.has(label)) continue;
      const gains = entry.haps.map((h) => gainOf(h.value));
      if (!gains.length) continue;
      const maxG = Math.max(...gains);
      const varied = maxG - Math.min(...gains) > 1e-6;
      const v = judge(entry.haps, (g, h) => varied ? g >= 0.8 * maxG : isDownbeat(h));
      if (!v) continue;
      const rate = 1 - v.violations.length / v.accented;
      results.push({
        family: 'harmonic', name: `${label}.accented-chord-tones`, pass: rate >= 0.85, severity: 'warn',
        detail: `${v.accented} accented onsets, ${fmt(rate * 100)}% chord tones [free material — exceptions allowed, listed for review]${vio(v)}`,
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
      // Compare the EMITTED pitch direction between adjacent onsets against the
      // direction of the degrees the binder actually assigned there (which follow
      // the transformed contour). Snapping may move a note by ≤2 semitones without
      // counting as a shape break.
      const ordered = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t));
      let match = 0, totalSigns = 0;
      for (let i = 1; i < ordered.length; i++) {
        if (ordered[i].cycle !== ordered[i - 1].cycle) continue; // phrase steps within a cycle
        if (ordered[i].degree == null || ordered[i - 1].degree == null) continue;
        totalSigns++;
        const emittedSign = Math.sign(ordered[i].midi - ordered[i - 1].midi);
        const degreeSign = Math.sign(ordered[i].degree - ordered[i - 1].degree);
        const snapSlack = Math.abs(ordered[i].midi - ordered[i - 1].midi) <= 2;
        if (emittedSign === degreeSign || snapSlack) match++;
      }
      const rate = totalSigns ? match / totalSigns : 1;
      results.push({
        family: 'motif', name: `${p.label}.${p.motif ?? p.contourLib ?? 'bound'}.contour${p.transform ? `(${p.transform})` : ''}`,
        pass: rate >= 0.8, severity: 'fail',
        detail: `contour shape ${fmt(rate * 100)}% preserved after harmonic snapping (${totalSigns} steps)${p.transform ? ` under transform "${p.transform}"` : ''}`,
      });
    }
    if (p.cadence) {
      const last = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t)).at(-1);
      results.push({
        family: 'motif', name: `${p.label}.cadence`, pass: true, severity: 'warn',
        detail: `cadence target "${p.cadence}" resolved to ${last.note} (enforced at bind time, verified by exact-notes check)`,
      });
    }
  }

  // ---- style containment (addendum A5.4): bound entries must sit in the palette ----
  if (meta.styles?.length) {
    for (const p of meta.motifPlacements ?? []) {
      if (!p.style || p.style === 'universal') continue;
      if (meta.styles.includes(p.style)) continue;
      const ok = p.mix === 'surface' || p.mix === 'device';
      results.push({
        family: 'style', name: `${p.label}.style.${p.style}`, pass: ok, severity: 'fail',
        detail: ok
          ? `cross-style use of "${p.style}" (${p.rhythm ?? p.contourLib}) declared as mix:${p.mix}${p.mix === 'surface' ? ' — highly audible, listen for the borrowed groove/timbre' : ' — abstract device, barely detectable'}`
          : `entry "${p.rhythm ?? p.contourLib}" is style "${p.style}" but the palette is [${meta.styles.join(', ')}] — declare "mix": "surface"|"device" on the bind or pick an in-palette entry`,
      });
    }
  }

  // ---- vertical interlock (interval-grammar §4/§8): b9 rule + low-interval limits + sub exclusion ----
  results.push(...verticalInterlock(hapsMap, meta, timeline));

  // ---- interval profiles (interval-grammar §7): measured per bound melodic placement ----
  for (const p of meta.motifPlacements ?? []) {
    if (!p.notes || p.notes.length < 3 || p.archetype) continue;
    const ordered = [...p.notes].sort((a, b) => a.cycle - b.cycle || cmpFrac(a.t, b.t));
    let leaps = 0, reps = 0, steps = 0;
    for (let i = 1; i < ordered.length; i++) {
      const d = Math.abs(ordered[i].midi - ordered[i - 1].midi);
      if (d === 0) reps++;
      else if (d > 2) leaps++;
      else steps++;
    }
    const n = ordered.length - 1;
    const midis = ordered.map((x) => x.midi);
    results.push({
      family: 'motif', name: `${p.label}.${p.motif ?? p.contourLib ?? 'bound'}.interval-profile`,
      pass: true, severity: 'warn',
      detail: `leap_ratio ${(leaps / n).toFixed(2)}, repetition ${(reps / n).toFixed(2)}, range ${Math.max(...midis) - Math.min(...midis)} semitones (measured; enforcement pending grammar policy)`,
    });
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
    for (const r of checkInterlocks(layers, { declaredPairs, meterNum: parseMeter(meter).num })) {
      results.push({
        family: 'interlock', name: `${sName}.${r.pair.join('+')}`, pass: r.ok, severity: 'warn',
        detail: `complement joint=${r.joint} (${r.pair[1]} in ${r.pair[0]} gaps: ${r.bInAGaps}, reverse: ${r.aInBGaps})${r.declared ? ' [declared pair]' : ''}${r.texture ? ' [texture grid — complement n/a]' : ''}${r.ok ? '' : ' — rhythms collide; use a declared interlock pair or raise complementarity'}`,
      });
    }
  }

  return results;
}

// Vertical interlock (interval-grammar §4): checks between concurrently sounding
// voices across ALL layers — the harmonic sibling of the rhythmic complement score.
//   4.1 b9 rule: no vertical minor-9th (semitone class 1 spanning > an octave)
//       between voices, except root→b9 on a dominant chord.
//   4.2 low-interval limits: simple intervals below their mud limit get flagged.
//   4.3 sub exclusion: when a band:'sub' label sounds, no other pitched voice below E2.
// Warn-level for now: the binder does not yet revoice to satisfy these (D19) —
// flips to fail once binder-side revoicing lands.
const LOW_LIMITS = { 1: 52, 2: 52, 3: 48, 4: 46, 5: 46, 6: 46, 7: 36, 8: 36, 9: 36, 10: 35, 11: 35, 0: 27 };
function verticalInterlock(hapsMap, meta, timeline) {
  const events = [];
  const subLabels = new Set((meta.motifPlacements ?? []).filter((p) => p.band === 'sub').map((p) => p.label));
  for (const [label, entry] of hapsMap) {
    if (entry.muted) continue;
    for (const h of entry.haps) {
      const p = pitchOf(h.value);
      if (p == null) continue;
      events.push({ label, midi: Math.round(p), t0: h.whole.begin.valueOf(), t1: h.whole.end.valueOf() });
    }
  }
  events.sort((a, b) => a.t0 - b.t0);
  const active = [];
  const b9hits = [];
  const mudHits = [];
  const subHits = [];
  for (const e of events) {
    for (let i = active.length - 1; i >= 0; i--) if (active[i].t1 <= e.t0 + 1e-9) active.splice(i, 1);
    for (const o of active) {
      if (o.label === e.label) continue;
      const lo = Math.min(e.midi, o.midi);
      const hi = Math.max(e.midi, o.midi);
      const d = hi - lo;
      if (d % 12 === 1 && d > 12) {
        const seg = timeline?.length ? chordAt(timeline, e.t0) : null;
        const isDomRootB9 = seg && /7/.test(seg.symbol) && !/(m7|\^7)/.test(seg.symbol)
          && lo % 12 === (chordRootPcOf(seg.symbol) ?? -1);
        if (!isDomRootB9 && b9hits.length < 40) b9hits.push(`${e.label}/${o.label} ${lo}-${hi} @${e.t0.toFixed(2)}`);
      }
      if (d > 0 && d <= 12 && lo < (LOW_LIMITS[d % 12] ?? 0)) {
        if (mudHits.length < 40) mudHits.push(`${e.label}/${o.label} interval ${d} on midi ${lo} @${e.t0.toFixed(2)}`);
      }
      if ((subLabels.has(e.label) || subLabels.has(o.label)) && !(subLabels.has(e.label) && subLabels.has(o.label))) {
        const other = subLabels.has(e.label) ? o : e;
        if (other.midi < 40 && subHits.length < 40) subHits.push(`${other.label} midi ${other.midi} below E2 while sub active @${e.t0.toFixed(2)}`);
      }
    }
    active.push(e);
  }
  const out = [];
  const item = (name, hits, what) => out.push({
    family: 'vertical', name, pass: hits.length === 0, severity: 'warn',
    detail: hits.length ? `${hits.length} ${what}: ${hits.slice(0, 4).join('; ')}${hits.length > 4 ? ` (+${hits.length - 4})` : ''}` : `no ${what}`,
  });
  if (events.length) {
    item('b9-rule', b9hits, 'vertical minor-9th violations');
    item('low-interval-limits', mudHits, 'muddy low intervals');
    if (subLabels.size) item('sub-exclusion', subHits, 'voices inside the sub exclusion zone');
  }
  return out;
}
const rootPcCache = new Map();
function chordRootPcOf(symbol) {
  if (!rootPcCache.has(symbol)) {
    const m = /^([A-G])([#b]?)/.exec(symbol);
    if (!m) rootPcCache.set(symbol, null);
    else {
      let pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
      if (m[2] === '#') pc += 1;
      if (m[2] === 'b') pc -= 1;
      rootPcCache.set(symbol, ((pc % 12) + 12) % 12);
    }
  }
  return rootPcCache.get(symbol);
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
