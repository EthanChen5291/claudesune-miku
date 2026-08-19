// report.md emitter (§5.6): what changed (per-label hap diff), which assertions
// passed/failed WITH NUMBERS, and what to listen for. Human-first prose;
// machine detail lives in the accompanying JSON.

export function renderReport({
  title, version, note = null, verify, edit = null, listenFor = [],
}) {
  const L = [];
  L.push(`# ${title} — ${version}`);
  L.push('');
  if (note) L.push(`**Edit:** ${note}`, '');
  L.push(`_${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ${verify.meter ?? '4/4'} · cycles ${verify.window?.[0] ?? 0}–${verify.window?.[1] ?? '?'}_`);
  L.push('');

  if (edit) {
    L.push('## What changed');
    L.push('');
    L.push(edit.containment.ok
      ? `Containment: **PASS** — allowed: ${edit.containment.allowed.join(', ') || '(none)'}`
      : `Containment: **REJECT**`);
    for (const line of edit.containment.changelog) L.push(`- ${line}`);
    L.push('');
    const deltas = metricDeltas(edit.before.metrics, edit.after.metrics, edit.containment.changed);
    if (deltas.length) {
      L.push('| label | metric | before | after |');
      L.push('|---|---|---|---|');
      for (const d of deltas) L.push(`| ${d.label} | ${d.metric} | ${d.before} | ${d.after} |`);
      L.push('');
    }
  }

  L.push('## Verification');
  L.push('');
  L.push(`- lint: ${verify.lint.errors.length === 0 ? 'clean' : verify.lint.errors.length + ' ERRORS'}${verify.lint.warnings.length ? ` (${verify.lint.warnings.length} warnings)` : ''}`);
  L.push(`- evaluates headlessly: ${verify.evalOk ? 'yes' : `NO — ${verify.error}`}`);
  const asserts = verify.assertions ?? [];
  if (asserts.length) {
    const fails = asserts.filter((a) => !a.pass && a.severity === 'fail');
    const warns = asserts.filter((a) => !a.pass && a.severity === 'warn');
    L.push(`- assertions: ${asserts.length - fails.length - warns.length}/${asserts.length} pass${fails.length ? `, **${fails.length} FAIL**` : ''}${warns.length ? `, ${warns.length} warn` : ''}`);
    L.push('');
    for (const fam of ['relational', 'structural', 'harmonic', 'motif', 'interlock']) {
      const items = asserts.filter((a) => a.family === fam);
      if (!items.length) continue;
      L.push(`### ${fam}`);
      for (const a of items) L.push(`- ${a.pass ? '✅' : a.severity === 'warn' ? '⚠️' : '❌'} \`${a.name}\` — ${a.detail}`);
      L.push('');
    }
  }

  L.push('## Per-label metrics');
  L.push('');
  L.push('| label | onsets | density | span | sync | accVar | variety |');
  L.push('|---|---|---|---|---|---|---|');
  for (const [label, info] of Object.entries(verify.labels)) {
    const m = info.metrics;
    L.push(`| ${label}${info.muted ? ' _(muted)_' : ''} | ${m.onsets} | ${m.density} | ${m.registerSpan} | ${m.syncopation} | ${m.accentVariance} | ${m.onsetVariety} |`);
  }
  L.push('');

  if (listenFor.length) {
    L.push('## What to listen for');
    L.push('');
    for (const x of listenFor) L.push(`- ${x}`);
    L.push('');
  }
  L.push('---');
  L.push('_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._');
  return L.join('\n') + '\n';
}

function metricDeltas(before, after, changedLabels) {
  const out = [];
  const interesting = [
    ['density', 'density (onsets/cycle)'],
    ['registerSpan', 'register span (semitones)'],
    ['registerMax', 'register top (midi)'],
    ['syncopation', 'syncopation'],
    ['accentVariance', 'accent variance'],
  ];
  for (const label of changedLabels ?? []) {
    const b = before[label];
    const a = after[label];
    if (!b || !a) { out.push({ label, metric: 'layer', before: b ? 'present' : '—', after: a ? 'present' : '—' }); continue; }
    for (const [k, nice] of interesting) {
      if ((b[k] ?? null) !== (a[k] ?? null)) out.push({ label, metric: nice, before: b[k] ?? '—', after: a[k] ?? '—' });
    }
  }
  return out;
}

/** Auto "what to listen for" hints from an edit's metric deltas. */
export function listenForHints(edit, note) {
  const hints = [];
  if (note) hints.push(`The requested change: ${note}`);
  for (const label of edit.containment.changed ?? []) {
    const b = edit.before.metrics[label];
    const a = edit.after.metrics[label];
    if (!b || !a) { hints.push(`${label}: layer ${a ? 'added' : 'removed'} — its entrance/absence is the change.`); continue; }
    if (a.density > b.density * 1.2) hints.push(`${label}: ${round1(a.density / b.density)}× busier (${b.density} → ${a.density} onsets/cycle).`);
    if (a.density < b.density / 1.2) hints.push(`${label}: sparser (${b.density} → ${a.density} onsets/cycle) — more air between notes.`);
    if ((a.registerMax ?? 0) > (b.registerMax ?? 0) + 2) hints.push(`${label}: reaches ${a.registerMax - b.registerMax} semitones higher at the top.`);
    if (a.accentVariance > b.accentVariance * 1.5 && a.accentVariance > 0.005) hints.push(`${label}: stronger accent contour — listen for louder/softer alternation instead of flat hits.`);
    if (a.syncopation > b.syncopation + 0.1) hints.push(`${label}: more offbeat placement — should feel pushed, less square.`);
    const diff = edit.containment.diffs.find((d) => d.label === label);
    if (diff?.aspects?.sound && !diff.aspects.time && !diff.aspects.pitch) hints.push(`${label}: same notes, same rhythm, new timbre — ONLY the tone color should differ.`);
  }
  const unchanged = Object.keys(edit.before.metrics).filter((l) => !(edit.containment.changed ?? []).includes(l));
  if (unchanged.length) hints.push(`Everything else (${unchanged.join(', ')}) is bit-identical — if anything sounds different there, that's a bug to report.`);
  return hints;
}
function round1(x) { return Math.round(x * 10) / 10; }
