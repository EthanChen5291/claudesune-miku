// Harness façade: the two entry points everything else uses.
//   verifySong(source, opts)  -> lint + evaluate + metrics (+ assertions when meta given)
//   checkEdit(oldSrc, newSrc, opts) -> containment gate + changelog + before/after metrics

import { evaluateSong, hapsByLabel } from './evaluate.js';
import { containment, diffSongs } from './signature.js';
import { labelMetrics, harmonicRhythm, parseMeter } from './metrics.js';
import { lintSong } from './lint.js';
import { runAssertions } from './assertions.js';

export { evaluateSong, hapsByLabel, containment, diffSongs, labelMetrics, harmonicRhythm, lintSong, parseMeter, runAssertions };

/**
 * Default cycle window: meta's song length if known, else opts.cycles, else 16.
 */
function windowOf(meta, opts) {
  const end = meta?.totalCycles ?? opts.cycles ?? 16;
  return [0, end];
}

export async function verifySong(source, { meta = null, cycles = null, meter = null } = {}) {
  const lint = lintSong(source);
  const out = { lint, evalOk: false, error: null, labels: {}, cpm: null, warnings: [] };
  if (lint.errors.length) {
    out.error = `lint: ${lint.errors.map((e) => `L${e.line} ${e.msg}`).join('; ')}`;
    return out;
  }
  let ev;
  try {
    ev = await evaluateSong(source);
  } catch (e) {
    out.error = e.message;
    return out;
  }
  out.evalOk = true;
  out.cpm = ev.cpm;
  out.warnings = ev.warnings;
  const [from, to] = windowOf(meta, { cycles });
  const m = meter ?? meta?.meter ?? '4/4';
  const haps = hapsByLabel(ev, from, to);
  for (const [name, entry] of haps) {
    out.labels[name] = {
      muted: entry.muted,
      error: entry.error,
      metrics: labelMetrics(entry.haps, { from, to, meter: m }),
    };
  }
  out.window = [from, to];
  out.meter = m;
  out.evaluated = ev;
  out.haps = haps;
  out.assertions = meta ? runAssertions(ev, haps, meta) : [];
  out.assertionsPass = out.assertions.every((a) => a.pass || a.severity === 'warn');
  return out;
}

/**
 * The edit gate (§3.3). Rejects when any non-allowed label's hap signature changed.
 */
export async function checkEdit(oldSource, newSource, {
  allowLabels = [], allowBindings = [], allowAspects = null, allowWindows = null,
  meta = null, cycles = null, meter = null,
} = {}) {
  const [from, to] = windowOf(meta, { cycles });
  const m = meter ?? meta?.meter ?? '4/4';

  const lint = lintSong(newSource);
  if (lint.errors.length) {
    return { ok: false, stage: 'lint', lint, reason: lint.errors.map((e) => `L${e.line} ${e.msg}`).join('; ') };
  }
  let oldEv, newEv;
  try { oldEv = await evaluateSong(oldSource); } catch (e) {
    return { ok: false, stage: 'eval-old', reason: `old version does not evaluate: ${e.message}` };
  }
  try { newEv = await evaluateSong(newSource); } catch (e) {
    return { ok: false, stage: 'eval-new', reason: `new version does not evaluate: ${e.message}` };
  }
  const oldRes = { evaluated: oldEv, haps: hapsByLabel(oldEv, from, to) };
  const newRes = { evaluated: newEv, haps: hapsByLabel(newEv, from, to) };
  const gate = containment(oldRes, newRes, { allowLabels, allowBindings, allowAspects, allowWindows });

  const metricsFor = (res) => {
    const out = {};
    for (const [name, entry] of res.haps) out[name] = labelMetrics(entry.haps, { from, to, meter: m });
    return out;
  };

  return {
    ok: gate.ok,
    stage: gate.ok ? 'pass' : 'containment',
    reason: gate.ok ? null : gate.leaks.map((l) => l.reason).join('; '),
    containment: gate,
    lint,
    window: [from, to],
    before: { metrics: metricsFor(oldRes), res: oldRes },
    after: { metrics: metricsFor(newRes), res: newRes },
  };
}
