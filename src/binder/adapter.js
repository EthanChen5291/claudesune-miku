// Glue: resolves spec-level references (lib:name, motif names) and plugs the
// binder and transition library into the compiler's bindFn/transitionFn hooks.

import { bind } from './bind.js';
import { RHYTHMS } from '../lib/rhythms.js';
import { CONTOURS } from '../lib/contours.js';
import { TRANSITIONS, findTransitions } from '../lib/transitions.js';
import { identOf, maskString } from '../compiler/form.js';

export function resolveRhythm(ref) {
  if (ref == null) return { entry: null, name: null };
  if (typeof ref === 'object') return { entry: ref, name: ref.name ?? null };
  const name = String(ref).replace(/^lib:/, '');
  const entry = RHYTHMS[name];
  if (!entry) throw new Error(`unknown rhythm "${name}" (have: ${Object.keys(RHYTHMS).join(', ')})`);
  return { entry: { ...entry, name }, name };
}

export function resolveContour(ref, spec) {
  if (ref == null) return { entry: null, name: null, motif: null, baseTransform: null };
  if (typeof ref === 'object') return { entry: ref, name: ref.name ?? null, motif: null, baseTransform: null };
  const s = String(ref);
  if (s.startsWith('lib:')) {
    const name = s.slice(4);
    const entry = CONTOURS[name];
    if (!entry) throw new Error(`unknown contour "${name}" (have: ${Object.keys(CONTOURS).join(', ')})`);
    return { entry, name, motif: null, baseTransform: null };
  }
  // motif reference: spec.motifs[name] is {degrees} or {lib: contourName, transform?}
  const m = spec.motifs?.[s];
  if (!m) throw new Error(`unknown motif "${s}" — not in spec.motifs and not a lib: ref`);
  if (m.lib) {
    const entry = CONTOURS[m.lib];
    if (!entry) throw new Error(`motif "${s}" references unknown lib contour "${m.lib}"`);
    return { entry, name: m.lib, motif: s, baseTransform: m.transform ?? null };
  }
  if (!m.degrees) throw new Error(`motif "${s}" needs degrees[] or lib`);
  return { entry: m, name: null, motif: s, baseTransform: m.transform ?? null };
}

/**
 * bindFn for compile(): material {bind: {rhythm, contour?, transform?, octave?,
 * sound?, fx?, cadence?, gainRange?, legato?}} -> { expr, period, boundMeta }.
 */
export function makeBindFn(spec) {
  return (b, ctx) => {
    let { entry: rhythm, name: rhythmName } = resolveRhythm(b.rhythm);
    if (rhythm && b.swing != null) rhythm = { ...rhythm, swing: b.swing };
    if (rhythm && b.swingSubdiv != null) rhythm = { ...rhythm, swingSubdiv: b.swingSubdiv };
    const { entry: contour, name: contourName, motif, baseTransform } = resolveContour(b.contour, spec);
    if (rhythm?.meter_class && rhythm.meter_class !== 'any' && rhythm.meter_class !== ctx.meter) {
      throw new Error(`rhythm "${rhythmName}" is ${rhythm.meter_class} but the song is ${ctx.meter}`);
    }
    const section = ctx.section;
    const harmonyContext = section.harmony?.length ? {
      harmony: section.harmony,
      barsPerChord: section.harmonicRhythm ?? section.bars / section.harmony.length,
      key: spec.key,
    } : (contour ? { harmony: null, key: spec.key } : null);
    const transform = [baseTransform, b.transform].filter(Boolean).join('+') || null;
    const { expr, period, boundMeta, warnings } = bind(rhythm, contour, harmonyContext, ctx.meter, {
      octave: b.octave ?? 4,
      sound: b.sound ?? null,
      fx: b.fx ?? '',
      gainRange: b.gainRange,
      cadence: b.cadence ?? section.cadence ?? null,
      transform,
      motifName: motif,
      rhythmName,
      legato: b.legato,
      archetype: b.archetype ?? null,
    });
    for (const w of warnings) (ctx.warnings ??= []).push(`[bind ${ctx.label}/${ctx.sectionName}] ${w}`);
    return {
      expr, period,
      boundMeta: {
        ...boundMeta,
        contourLib: contourName,
        // taxonomy + style containment metadata (addendum A5.2/A5.4)
        role: b.role ?? rhythm?.role ?? (b.archetype ? 'bass' : null),
        band: b.band ?? rhythm?.band ?? (b.archetype === 'sub' ? 'sub' : null),
        style: rhythm?.style ?? null,
        mix: b.mix ?? null, // 'surface' | 'device' — explicit cross-style declaration
      },
    };
  };
}

/**
 * transitionFn for compile(): spec.transitions entries are either
 *   { use: '<template>', into: '<section>', occurrence?: n|'last', bars?: n }
 *   { auto: true }  — pick by (from_role -> to_role) for every boundary
 */
export function makeTransitionFn(spec) {
  return (t, ctx) => {
    const { layout, resolved } = ctx;
    const jobs = [];
    if (t.auto) {
      for (let i = 1; i < layout.instances.length; i++) {
        const prev = layout.instances[i - 1];
        const next = layout.instances[i];
        const found = findTransitions(resolved[prev.name].role ?? '*', resolved[next.name].role ?? '*');
        if (found.length) jobs.push({ name: found[0].name, entry: found[0].entry, boundary: next.start, prev, next, occIdx: i });
      }
    } else {
      const entry = TRANSITIONS[t.use];
      if (!entry) throw new Error(`unknown transition "${t.use}" (have: ${Object.keys(TRANSITIONS).join(', ')})`);
      const targets = layout.instances
        .map((inst, i) => ({ inst, i }))
        .filter(({ inst, i }) => inst.name === t.into && i > 0);
      if (!targets.length) throw new Error(`transition "${t.use}" into "${t.into}": no non-initial occurrence found`);
      const chosen = t.occurrence === 'last' ? [targets[targets.length - 1]]
        : typeof t.occurrence === 'number' ? [targets[t.occurrence - 1]].filter(Boolean)
        : targets;
      if (!chosen.length) throw new Error(`transition "${t.use}" into "${t.into}": occurrence ${t.occurrence} not found`);
      for (const { inst, i } of chosen) {
        jobs.push({ name: t.use, entry, boundary: inst.start, prev: layout.instances[i - 1], next: inst, occIdx: i, barsOverride: t.bars });
      }
    }

    const layers = [];
    const metas = [];
    for (const job of jobs) {
      const bars = job.barsOverride ?? job.entry.bars;
      const window = job.entry.placement === 'before'
        ? [Math.max(job.boundary - bars, job.prev.start), job.boundary]
        : [job.boundary, Math.min(job.boundary + bars, job.next.end)];
      const span = window[1] - window[0];
      const expr = job.entry.make(span);
      const binding = `${job.entry.label}_${identOf(job.next.name)}${job.occIdx}`;
      const mask = maskString([window], layout.total);
      layers.push({
        binding,
        label: job.entry.label,
        expr,
        term: `${binding}.late(${window[0]}).mask("${mask}")`,
        sections: [job.next.name],
        comment: `${job.name}: ${job.prev.name} -> ${job.next.name} @ cycles ${window[0]}-${window[1]}`,
      });
      metas.push({ name: job.name, kind: job.entry.kind, label: job.entry.label, binding, from: job.prev.name, to: job.next.name, window });
    }
    return { layers, meta: metas };
  };
}
