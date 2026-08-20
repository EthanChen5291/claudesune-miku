// Compiler tests: spec -> labeled file honoring §3.1, verified through the harness.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compile } from '../src/compiler/compile.js';
import { sectionLayout, maskString, resolveSection } from '../src/compiler/form.js';
import { verifySong, checkEdit } from '../src/harness/index.js';

const spec = JSON.parse(readFileSync(new URL('./fixtures/toy.spec.json', import.meta.url), 'utf8'));

test('form: layout ranges, masks, recalls-provided bars', () => {
  const l = sectionLayout(spec);
  assert.equal(l.total, 16);
  assert.deepEqual(l.ranges['B'], [[4, 8], [12, 16]]);
  assert.deepEqual(l.ranges["A'"], [[8, 12]]);
  assert.equal(l.masks['A'], '<1!4 0!12>');
  assert.equal(maskString([[0, 2], [3, 4]], 4), '<1!2 0 1>');
});

test('form: resolveSection inherits via recalls, vary overrides, withhold removes', () => {
  const s = resolveSection(spec, "A'");
  assert.equal(s.role, 'verse');                       // inherited
  assert.deepEqual(s.harmony, ['Fm9', 'Bbm9', 'Fm9', 'C7']); // inherited
  assert.match(s.layers.hats.pattern, /rim/);          // varied
  assert.equal(s.layers.kick, resolveSection(spec, 'A').layers.kick); // same object => shared binding
  const spec2 = structuredClone(spec);
  spec2.sections["A'"].withhold = ['bass'];
  assert.equal(resolveSection(spec2, "A'").layers.bass, undefined);
});

test('compile: output evaluates, all labels live, §3.1 layout holds', async () => {
  const { source, meta } = compile(spec);
  // §3.1: one contiguous let per (label, section material); labels combine only
  assert.match(source, /let kick_A = /);
  assert.match(source, /let hats_Ap = /);
  assert.match(source, /kick: stack\(\n  kick_A\.mask\(form\.A\),/);
  // recalled material reuses the origin binding (A' kick IS kick_A)
  assert.match(source, /kick_A\.mask\(form\.Ap\)/);
  // form keys are bare identifiers (transpiler mini-fies quoted keys — D12)
  assert.doesNotMatch(source, /"A'":/);
  const res = await verifySong(source, { meta });
  assert.equal(res.evalOk, true, res.error);
  assert.equal(res.lint.errors.length, 0);
  for (const l of ['kick', 'hats', 'bass', 'pads', 'lead']) {
    assert.ok(res.labels[l].metrics.onsets > 0, `${l} silent`);
  }
  // lead only plays in B (cycles 4-8, 12-16)
  const leadHaps = res.haps.get('lead').haps;
  assert.ok(leadHaps.every((h) => {
    const t = h.whole.begin.valueOf();
    return (t >= 4 && t < 8) || (t >= 12 && t < 16);
  }));
  // orbit assigned once per label using room/delay, stable under label-set changes (A1.2)
  const orb = meta.orbits.pads;
  assert.ok(orb >= 2 && orb <= 9);
  assert.equal((source.match(new RegExp(`\\.orbit\\(${orb}\\)`, 'g')) || []).length, 2); // pads_A and pads_B share it
  const withExtra = structuredClone(spec);
  withExtra.sections.A.layers.zz_extra = { pattern: 's("rim*2").gain(".6 .4").room(.2)' };
  assert.equal(compile(withExtra).meta.orbits.pads, orb); // adding another fx label must not renumber pads
});

test('compile: deterministic (same spec -> identical source)', () => {
  const a = compile(spec).source;
  const b = compile(structuredClone(spec)).source;
  assert.equal(a, b);
});

test('compile: misaligned multi-cycle material falls back to late()+occurrence masks', () => {
  const s2 = structuredClone(spec);
  // 8-cycle harmony in a 4-bar section whose 2nd occurrence starts at cycle 12 (not %8)
  s2.sections.B.harmony = ['Db^7', 'Eb7', 'Fm9', 'C7', 'Db^7', 'Eb7', 'Fm9', 'C7'];
  s2.sections.B.harmonicRhythm = 1;
  s2.sections.B.bars = 4; // period 8 > bars 4 and starts 4, 12 not multiples of 8
  const { source } = compile(s2);
  assert.match(source, /harmony_B\.late\(4\)\.mask/);
  assert.match(source, /harmony_B\.late\(12\)\.mask/);
});

test('compile: spec validation errors are specific', () => {
  assert.throws(() => compile({ form: 'A', sections: { A: { layers: {} } } }), /bars or recalls/);
  assert.throws(() => compile({ form: 'A Z', sections: { A: { bars: 4 } } }), /form references section "Z"/);
  assert.throws(() => compile({ form: 'A', sections: { A: { bars: 4, layers: { 'Bad-Label': 'x' } } } }), /lower_snake/);
  const s2 = structuredClone(spec);
  s2.sections.A.harmony = ['Fm9', 'Bbm9', 'C7'];
  assert.throws(() => compile(s2), /integer bars-per-chord/);
});

test('compile+harness: editing one material binding is a contained edit', async () => {
  const v0 = compile(spec);
  const s2 = structuredClone(spec);
  s2.sections.A.layers.hats.pattern = 's("hh*16").gain(".6 .3 .45 .3 .75 .3 .45 .35 .6 .3 .45 .3 .75 .3 .5 .4")';
  const v1 = compile(s2);
  const res = await checkEdit(v0.source, v1.source, { allowBindings: ['hats_A'], meta: v0.meta });
  assert.equal(res.ok, true, JSON.stringify(res.containment?.leaks));
  assert.deepEqual(res.containment.changed, ['hats']);
  // and the same edit is a REJECT when only kick was allowed
  const bad = await checkEdit(v0.source, v1.source, { allowBindings: ['kick_A'], meta: v0.meta });
  assert.equal(bad.ok, false);
});

test('compile+harness: section-scoped edit via allowWindows', async () => {
  const v0 = compile(spec);
  const s2 = structuredClone(spec);
  s2.sections.B.layers.lead.pattern = 'n("0 4 7 9 12 9 7 4").scale("F5:minor").s("triangle").gain(".9 .6 .8 .6 1 .7 .8 .6")';
  const v1 = compile(s2);
  // B occupies [4,8) and [12,16): edit confined there passes
  const ok = await checkEdit(v0.source, v1.source, {
    allowLabels: ['lead'], allowWindows: [[4, 8], [12, 16]], meta: v0.meta,
  });
  assert.equal(ok.ok, true, JSON.stringify(ok.containment?.leaks));
  // but claiming it only touched A's window fails
  const bad = await checkEdit(v0.source, v1.source, {
    allowLabels: ['lead'], allowWindows: [[0, 4]], meta: v0.meta,
  });
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /outside the allowed cycle window/);
});
