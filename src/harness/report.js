// Report rendering: JSON in, pretty text out. Kept dumb on purpose — all
// judgment lives in the harness; this file only formats.

export function fmtMetricsTable(perLabel) {
  const cols = ['label', 'onsets', 'density', 'span', 'sync', 'pcH', 'accVar', 'variety'];
  const rows = [cols];
  for (const [label, m] of Object.entries(perLabel)) {
    rows.push([
      label, String(m.onsets), fmt(m.density), String(m.registerSpan),
      fmt(m.syncopation), fmt(m.pitchClassEntropy), fmt(m.accentVariance), fmt(m.onsetVariety),
    ]);
  }
  return table(rows);
}

export function fmtAssertions(results) {
  const lines = [];
  for (const r of results) {
    const mark = r.pass ? 'PASS' : r.severity === 'warn' ? 'WARN' : 'FAIL';
    lines.push(`  [${mark}] ${r.name}: ${r.detail}`);
  }
  return lines.join('\n');
}

export function fmtContainment(c) {
  const lines = [];
  lines.push(c.ok ? 'CONTAINMENT: PASS' : 'CONTAINMENT: REJECT');
  lines.push(`  allowed labels: ${c.allowed.length ? c.allowed.join(', ') : '(none)'}`);
  if (c.leaks.length) {
    lines.push('  leaks:');
    for (const l of c.leaks) lines.push(`    ✗ ${l.reason}`);
  }
  lines.push('  changelog:');
  for (const line of c.changelog) lines.push(`    ${line}`);
  return lines.join('\n');
}

function fmt(x) {
  if (x == null) return '-';
  return Number.isInteger(x) ? String(x) : x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function table(rows) {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  return rows
    .map((r, ri) => '  ' + r.map((c, i) => String(c).padEnd(widths[i])).join('  ') + (ri === 0 ? '\n  ' + widths.map((w) => '-'.repeat(w)).join('  ') : ''))
    .join('\n');
}
