// Form parsing: the spec's form string + per-section bars -> section instance
// ranges, per-section-name cycle masks, and total length. 1 cycle = 1 bar (D7).

/** "A B A' B" -> ['A','B',"A'",'B'] */
export function parseForm(formStr) {
  return String(formStr).trim().split(/\s+/).filter(Boolean);
}

/**
 * Compute instance ranges and per-name masks.
 * Returns { order, total, instances: [{name, start, end}], ranges: {name: [[s,e],...]},
 *           masks: {name: '<...>'} }
 */
export function sectionLayout(spec) {
  const order = parseForm(spec.form);
  const sections = spec.sections ?? {};
  for (const name of order) {
    if (!sections[name]) throw new Error(`form references section "${name}" but spec.sections has no such entry`);
  }
  const instances = [];
  let t = 0;
  for (const name of order) {
    const bars = barsOf(sections, name);
    instances.push({ name, start: t, end: t + bars });
    t += bars;
  }
  const total = t;
  const ranges = {};
  for (const { name, start, end } of instances) {
    (ranges[name] ??= []).push([start, end]);
  }
  const masks = {};
  for (const name of Object.keys(ranges)) {
    masks[name] = maskString(ranges[name], total);
  }
  return { order, total, instances, ranges, masks };
}

function barsOf(sections, name, seen = new Set()) {
  const s = sections[name];
  if (s.bars != null) return assertBars(s.bars, name);
  if (s.recalls && !seen.has(name)) {
    seen.add(name);
    return barsOf(sections, s.recalls, seen);
  }
  throw new Error(`section "${name}" has no bars (and no recalls chain that provides them)`);
}
function assertBars(b, name) {
  if (!Number.isInteger(b) || b <= 0) throw new Error(`section "${name}": bars must be a positive integer, got ${b}`);
  return b;
}

/** ranges like [[0,16],[32,48]] over total -> '<1!16 0!16 1!16 0!16>' (runs compressed). */
export function maskString(ranges, total) {
  const flags = new Array(total).fill(0);
  for (const [s, e] of ranges) for (let i = s; i < e; i++) flags[i] = 1;
  const runs = [];
  let cur = flags[0], count = 0;
  for (const f of flags) {
    if (f === cur) count++;
    else { runs.push([cur, count]); cur = f; count = 1; }
  }
  runs.push([cur, count]);
  return '<' + runs.map(([v, c]) => (c === 1 ? String(v) : `${v}!${c}`)).join(' ') + '>';
}

/** Section name -> valid JS identifier suffix: A' -> Ap, "A''" -> App, 'drop-2' -> drop_2 */
export function identOf(name) {
  return String(name).replace(/'/g, 'p').replace(/[^A-Za-z0-9_]/g, '_');
}

/**
 * Effective (inheritance-resolved) section: recalls pulls role/harmony/layers from
 * the recalled section, with `vary` overriding per-layer material and local fields
 * overriding scalars. `withhold` removes labels.
 */
export function resolveSection(spec, name, seen = new Set()) {
  const s = spec.sections[name];
  if (!s) throw new Error(`no section "${name}"`);
  if (!s.recalls) return { ...s, layers: { ...(s.layers ?? {}) }, name };
  if (seen.has(name)) throw new Error(`recalls cycle at "${name}"`);
  seen.add(name);
  const base = resolveSection(spec, s.recalls, seen);
  const layers = { ...base.layers };
  for (const [label, mat] of Object.entries(s.vary ?? {})) layers[label] = mat;
  for (const [label, mat] of Object.entries(s.layers ?? {})) layers[label] = mat;
  for (const w of s.withhold ?? []) delete layers[w];
  return {
    ...base,
    ...stripUndefined(s),
    layers,
    harmony: s.harmony ?? base.harmony,
    harmonicRhythm: s.harmonicRhythm ?? base.harmonicRhythm,
    name,
  };
}

function stripUndefined(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
  return out;
}
