// Compiler (§3.1/§3.2): song spec JSON -> labeled .strudel file + meta.json.
//
// Layout invariant (§3.1): every likely edit maps to ONE contiguous region —
//   - section material for one label = one hoisted `let <label>_<section>` binding
//   - harmony = one hoisted binding per section (+ one combined `chords`)
//   - form/arrangement = the spec (masks are compiled, marked do-not-hand-edit)
//   - the label statement itself only combines material; sounds/fx live in material
//
// Alignment rule (D6): a multi-cycle material pattern masked by a section mask is
// emitted per-occurrence with .late(start) whenever an occurrence start is not a
// multiple of the material's period.

import { sectionLayout, resolveSection, identOf, maskString } from './form.js';
import { voicingRegistration } from '../lib/voicings.js';
import { resolveHarmony } from '../binder/harmony.js';

const DEFAULT_METER = '4/4';

/**
 * compile(spec, { bindFn, transitionFn }) -> { source, meta }
 * bindFn(bindSpec, ctx) -> { expr, period, boundMeta }   (plugged in by the binder, step 3)
 * transitionFn(transSpec, ctx) -> { label, expr, period, meta } (step 5)
 */
export function compile(spec, { bindFn = null, transitionFn = null } = {}) {
  validateSpec(spec);
  const meter = spec.meter ?? DEFAULT_METER;
  const beatsPerBar = Number(meter.split('/')[0]);
  const layout = sectionLayout(spec);
  const resolved = {};
  for (const name of Object.keys(spec.sections)) resolved[name] = resolveSection(spec, name);
  // Library progressions become plain chord symbols HERE, once, against spec.key
  // (D28). Everything downstream — emission, binding, verification, the edit gate
  // — sees an ordinary harmony array and needs to know nothing about numerals.
  const harmonyLibOf = {};
  for (const [name, s] of Object.entries(resolved)) {
    try {
      const { harmony, lib } = resolveHarmony(s.harmony, spec.key);
      s.harmony = harmony;
      if (lib) harmonyLibOf[name] = lib;
    } catch (e) {
      throw new Error(`section "${name}": ${e.message}`);
    }
  }

  const L = []; // output lines
  const meta = {
    title: spec.title ?? 'untitled',
    genre: spec.genre ?? null,
    meter,
    bpm: spec.bpm ?? 120,
    key: spec.key ?? null,
    seed: spec.seed ?? 0,
    form: spec.form,
    totalCycles: layout.total,
    instances: layout.instances,
    ranges: layout.ranges,
    sections: {},
    harmonyBinding: 'chords',
    bindings: {},      // bindingName -> { label, sections: [...] }
    labels: {},        // label -> { sections: [...], bindings: {section: bindingName} }
    motifPlacements: [], // filled by bindFn results
    styles: spec.styles ?? null, // style palette (addendum A5.4)
    orbits: {},
  };
  for (const [name, s] of Object.entries(resolved)) {
    meta.sections[name] = {
      role: s.role ?? null, bars: s.bars, must: s.must ?? null,
      contrasts_with: s.contrasts_with ?? null, resolves: s.resolves ?? null,
      recalls: spec.sections[name].recalls ?? null, sets_up: s.sets_up ?? null,
      withhold: spec.sections[name].withhold ?? [],
      harmony: s.harmony ?? null, harmonyLib: harmonyLibOf[name] ?? null,
      ranges: layout.ranges[name] ?? [],
      cadence: s.cadence ?? null,
    };
  }

  L.push(`// ${'='.repeat(12)} ${meta.title} ${'='.repeat(12)}`);
  L.push(`// compiled by motif-engine (seed ${meta.seed}) — edit map in the song's meta.json`);
  L.push(`// form: ${spec.form} | ${meter} | ${meta.bpm} bpm | key ${meta.key ?? '-'}`);
  L.push(`setcpm(${meta.bpm}/${beatsPerBar})`);
  L.push('');
  if (spec.key) L.push(`let key = "${spec.key}"`);
  L.push('');
  L.push(`// ---- form masks (compiled from form: ${spec.form}; edit the SPEC, not these) ----`);
  // Keys must be bare identifiers: the strudel transpiler mini-fies double-quoted
  // object keys, so "A'" would break IN THE REPL TOO (D12).
  L.push(`let form = {`);
  for (const name of Object.keys(layout.masks)) {
    const k = identOf(name);
    const note = k === name ? '' : `  // section ${name}`;
    L.push(`  ${k}: "${layout.masks[name]}",${note}`);
  }
  L.push(`}`);
  L.push('');

  // ---- voicing-shape registrations (auto-detected from material exprs) ----
  const shapeRefs = new Set();
  for (const s of Object.values(resolved)) {
    for (const mat of Object.values(s.layers)) {
      const text = typeof mat === 'string' ? mat : JSON.stringify(mat);
      for (const m of String(text).matchAll(/me_([a-z0-9_]+)/g)) shapeRefs.add(m[1]);
      // comp binds may name the shape without the me_ prefix
      const dict = mat?.bind?.dict;
      if (dict && dict !== 'ireal') shapeRefs.add(String(dict).replace(/^me_/, ''));
    }
  }
  if (shapeRefs.size) {
    L.push(`// ---- voicing shapes (library: src/lib/voicings.js) ----`);
    for (const shape of [...shapeRefs].sort()) L.push(voicingRegistration(shape));
    L.push('');
    meta.voicingShapes = [...shapeRefs].sort();
  }

  // ---- harmony ----
  L.push(`// ---- harmony ----`);
  const harmonyBindingOf = {}; // section name -> binding name
  const harmonyPeriodOf = {};
  const emittedHarmony = new Set();
  for (const name of uniqueInOrder(layout.order)) {
    const s = resolved[name];
    if (!s.harmony?.length) continue;
    // a recalled, un-overridden harmony reuses the recalled section's binding
    const recallsFrom = spec.sections[name].recalls;
    if (recallsFrom && spec.sections[name].harmony == null && harmonyBindingOf[recallsFrom]) {
      harmonyBindingOf[name] = harmonyBindingOf[recallsFrom];
      harmonyPeriodOf[name] = harmonyPeriodOf[recallsFrom];
      continue;
    }
    const barsPerChord = s.harmonicRhythm ?? s.bars / s.harmony.length;
    if (!Number.isInteger(barsPerChord) || barsPerChord <= 0) {
      throw new Error(`section "${name}": bars (${s.bars}) / harmony length (${s.harmony.length}) must give integer bars-per-chord (or set harmonicRhythm)`);
    }
    const period = s.harmony.length * barsPerChord;
    const bname = `harmony_${identOf(name)}`;
    if (!emittedHarmony.has(bname)) {
      const seq = s.harmony.join(' ');
      const slow = barsPerChord === 1 ? '' : `/${barsPerChord}`;
      L.push(`let ${bname} = chord("<${seq}>${slow}").dict('ireal')`);
      emittedHarmony.add(bname);
      meta.bindings[bname] = { label: 'chords', sections: [name], kind: 'harmony' };
    } else {
      meta.bindings[bname].sections.push(name);
    }
    harmonyBindingOf[name] = bname;
    harmonyPeriodOf[name] = period;
  }
  const harmonyTerms = [];
  for (const name of uniqueInOrder(layout.order)) {
    const bname = harmonyBindingOf[name];
    if (!bname) continue;
    harmonyTerms.push(...sectionTerms(bname, name, harmonyPeriodOf[name], layout));
  }
  if (harmonyTerms.length) {
    L.push(`let chords = ${combine(harmonyTerms)}`);
    meta.bindings['chords'] = { label: '(harmony timeline)', sections: Object.keys(harmonyBindingOf), kind: 'harmony-combined' };
  }
  L.push('');

  // ---- section material, grouped per label (one contiguous region per label) ----
  const labels = collectLabels(resolved, layout.order);
  const labelTerms = {}; // label -> [{term}]
  // Orbit assignment must be a pure function of the label NAME (addendum A1.2:
  // adding an fx layer elsewhere must not renumber other labels' orbits — byte
  // identity of untouched sections). Hash the name into 2..9; resolve collisions
  // by name-sorted probing.
  const orbitOf = stableOrbits(labels);
  for (const label of labels) {
    L.push(`// ---- material: ${label} ----`);
    const bindingBySection = {};
    const emitted = new Set(); // binding names already emitted for this label
    for (const name of uniqueInOrder(layout.order)) {
      const s = resolved[name];
      const mat = s.layers[label];
      if (mat == null) continue;
      // Reuse happens ONLY through recalls-inheritance (ownerSection), never by
      // value equality — equal strings in unrelated sections stay separate
      // bindings (review finding), and inherited material is bound in its
      // OWNER section's harmonic context, not the first-in-form user's.
      const owner = ownerSection(spec, resolved, name, label);
      const bname = `${label}_${identOf(owner)}`;
      if (!emitted.has(bname)) {
        const ownerResolved = resolved[owner] ?? s;
        const { expr, period, boundMeta } = materialExpr(mat, {
          spec, section: ownerResolved, sectionName: owner, label, bindFn, meter, layout,
        });
        let finalExpr = expr;
        if (/\.(room|delay)\s*\(/.test(expr) && !/\.orbit\s*\(/.test(expr)) {
          const orb = orbitOf(label);
          finalExpr = `${expr}.orbit(${orb})`;
          meta.orbits[label] = orb;
        }
        L.push(`let ${bname} = ${finalExpr}`);
        meta.bindings[bname] = { label, sections: [name], kind: mat.bind ? 'bound' : 'free', period };
        if (boundMeta) meta.motifPlacements.push({ ...boundMeta, label, binding: bname, sections: [name] });
        emitted.add(bname);
      } else {
        meta.bindings[bname].sections.push(name);
        const mp = meta.motifPlacements.find((m) => m.binding === bname);
        if (mp) mp.sections.push(name);
      }
      bindingBySection[name] = bname;
    }
    meta.labels[label] = { sections: Object.keys(bindingBySection), bindings: bindingBySection };
    labelTerms[label] = [];
    for (const name of uniqueInOrder(layout.order)) {
      const bname = bindingBySection[name];
      if (!bname) continue;
      const period = meta.bindings[bname].period ?? 1;
      labelTerms[label].push(...sectionTerms(bname, name, period, layout));
    }
    L.push('');
  }

  // ---- transitions (step 5; first-class labels of their own) ----
  const transitions = spec.transitions ?? [];
  if (transitions.length && !transitionFn) {
    throw new Error('spec declares transitions but no transitionFn was provided (transitions land in build step 5)');
  }
  const transitionLayers = [];
  for (const t of transitions) {
    const res = transitionFn(t, { spec, layout, resolved, meter });
    for (const layer of res.layers) {
      L.push(`// ---- transition: ${layer.comment} ----`);
      L.push(`let ${layer.binding} = ${layer.expr}`);
      meta.bindings[layer.binding] = { label: layer.label, sections: layer.sections ?? [], kind: 'transition' };
      transitionLayers.push(layer);
      L.push('');
    }
    (meta.transitions ??= []).push(...res.meta);
  }

  // ---- labels ----
  L.push(`// ---- layers ----`);
  for (const label of labels) {
    if (!labelTerms[label].length) continue;
    L.push(`${label}: ${combine(labelTerms[label])}`);
  }
  const byLabel = new Map();
  for (const layer of transitionLayers) {
    if (labels.includes(layer.label)) {
      throw new Error(`transition label "${layer.label}" collides with a material layer label — rename the spec layer (labels: ${labels.join(', ')})`);
    }
    if (!byLabel.has(layer.label)) byLabel.set(layer.label, []);
    byLabel.get(layer.label).push(layer.term);
  }
  for (const [label, terms] of byLabel) {
    L.push(`${label}: ${combine(terms)}`);
    meta.labels[label] = { sections: [], bindings: {}, kind: 'transition' };
  }
  L.push('');

  return { source: L.join('\n'), meta };
}

// Materials inherited via `recalls` keep the ORIGIN section's binding name, so
// "verse lead" stays one region even when A' recalls it.
function ownerSection(spec, resolved, name, label) {
  let cur = name;
  const seen = new Set();
  while (spec.sections[cur]?.recalls && !seen.has(cur)) {
    seen.add(cur);
    const parent = spec.sections[cur].recalls;
    const varied = spec.sections[cur].vary?.[label] != null || spec.sections[cur].layers?.[label] != null;
    if (varied) return cur;
    if (resolved[parent]?.layers?.[label] == null) return cur;
    cur = parent;
  }
  return cur;
}

function materialExpr(mat, ctx) {
  if (typeof mat === 'string') return { expr: mat, period: 1, boundMeta: null };
  if (mat.pattern) return { expr: mat.pattern, period: mat.period ?? 1, boundMeta: null };
  if (mat.bind) {
    if (!ctx.bindFn) throw new Error(`layer "${ctx.label}" in section "${ctx.sectionName}" uses bind but no bindFn provided (binder lands in build step 3)`);
    return ctx.bindFn(mat.bind, ctx);
  }
  throw new Error(`layer "${ctx.label}" in section "${ctx.sectionName}": material must be a string, {pattern}, or {bind}`);
}

// Emit mask terms for one binding over one section's occurrences, adding .late()
// only when a multi-cycle period misaligns with an occurrence start (D6).
function sectionTerms(bname, sectionName, period, layout) {
  const ranges = layout.ranges[sectionName] ?? [];
  const p = period ?? 1;
  const aligned = ranges.every(([s]) => s % p === 0);
  const full = ranges.length && maskString(ranges, layout.total) === `<1!${layout.total}>`;
  if (full) return [bname];
  if (aligned) return [`${bname}.mask(form.${identOf(sectionName)})`];
  return ranges.map(([s, e]) =>
    `${bname}.late(${s}).mask("${maskString([[s, e]], layout.total)}")`);
}

function combine(terms) {
  if (terms.length === 1) return terms[0];
  return `stack(\n  ${terms.join(',\n  ')},\n)`;
}

function collectLabels(resolved, order) {
  const labels = [];
  for (const name of uniqueInOrder(order)) {
    for (const label of Object.keys(resolved[name].layers)) {
      if (!labels.includes(label)) labels.push(label);
    }
  }
  return labels;
}

function uniqueInOrder(arr) {
  return [...new Set(arr)];
}

// name -> orbit in [2..9]: a PURE function of the label name, no uniqueness
// probing (review findings: probing hung with 9+ labels and renumbered other
// labels' orbits when the label set changed). Two labels may share an orbit —
// that's a shared fx bus, only a problem when their delay/reverb params differ,
// which the lint's orbit warning already surfaces.
function stableOrbits(_labels) {
  return (label) => {
    let h = 0;
    for (const c of label) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return 2 + (h % 8);
  };
}

function validateSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('spec must be an object');
  if (!spec.form) throw new Error('spec.form is required (e.g. "A B A\' B")');
  if (!spec.sections || !Object.keys(spec.sections).length) throw new Error('spec.sections is required');
  if (spec.meter && !/^\d+\s*\/\s*\d+$/.test(spec.meter)) throw new Error(`bad meter "${spec.meter}"`);
  for (const [name, s] of Object.entries(spec.sections)) {
    if (!s.recalls && s.bars == null) throw new Error(`section "${name}" needs bars or recalls`);
    if (s.harmony != null && !Array.isArray(s.harmony)) {
      if (typeof s.harmony !== 'object' || !s.harmony.lib) {
        throw new Error(`section "${name}": harmony must be an array of chord symbols or { lib: "<progression>" }`);
      }
      if (!spec.key) throw new Error(`section "${name}" uses harmony { lib: "${s.harmony.lib}" }, which needs spec.key to render into (e.g. "C:minor")`);
    }
    for (const label of Object.keys(s.layers ?? {})) {
      if (!/^[a-z][a-z0-9_]*$/.test(label)) throw new Error(`label "${label}" must be lower_snake (it becomes a Strudel label and JS identifier)`);
    }
  }
}
