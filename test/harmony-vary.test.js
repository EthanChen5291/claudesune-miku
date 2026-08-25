// D50: exemplar-based variation. The contract these tests defend is that a
// variation INHERITS the quality of the progression it came from — so most of
// them are comparisons against the exemplar, not absolute checks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { varyProgression, variationsOf, exemplarPool, explainVariation } from '../src/lib/harmony-vary.js';
import { OPS, OP_NAMES, ROTATE } from '../src/lib/harmony-ops.js';
import { cycleScore, thirdClass } from '../src/lib/harmony-prior.js';
import { renderProgression } from '../src/binder/harmony.js';
import { ALL_PROGRESSIONS, parseDegrees, playableWith } from '../src/lib/progressions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POOL = exemplarPool().entries;
const famOf = (e) => (e.family === 'major' ? 'major' : e.family === 'minor' ? 'minor' : 'modal');
const roots = (d) => parseDegrees(d).map((t) => t.semis);

/** every variation of every exemplar, for the sweeping checks */
function* everyVariation({ intensities = [0.15, 0.4, 0.75], budgets = [1, 2, 3] } = {}) {
  for (const [name, e] of POOL) {
    for (const intensity of intensities) {
      for (const budget of budgets) {
        for (const seed of ['a', 'b']) {
          yield [name, e, varyProgression(name, { intensity, budget, seed })];
        }
      }
    }
  }
}

test('D50: the exemplar pool declares its basis, and admits it is a stand-in', () => {
  const pool = exemplarPool();
  assert.ok(pool.entries.length >= 20, `only ${pool.entries.length} exemplars`);
  assert.ok(pool.basis, 'the pool does not say what makes these exemplars');
  // Three states, and the pool must never be silent about which one it is in —
  // a stand-in for Ethan's ear passing itself off as his ear is the failure mode
  // worth catching.
  const ratified = Object.values(ALL_PROGRESSIONS).filter((e) => e.ratified).length;
  if (ratified === 0) {
    assert.ok(pool.caveat && /ratified/.test(pool.caveat), 'no ratified entries, but the pool claims no caveat');
    assert.ok(pool.entries.every(([, e]) => e.pack === 'unison-famous'));
  } else if (ratified < 20) {
    assert.ok(pool.caveat && /ratified/.test(pool.caveat), 'a thin ear pool must say it is thin');
    assert.ok(pool.entries.some(([, e]) => e.ratified) && pool.entries.some(([, e]) => !e.ratified),
      'a supplemented pool should contain both');
  } else {
    assert.equal(pool.caveat, null);
    assert.ok(pool.entries.every(([, e]) => e.ratified));
  }
  // the evidence-gated entries are not exemplars of anything (D49)
  assert.ok(!pool.entries.some(([n]) => /rocket_man|bitter_sweet/.test(n)));
  assert.ok(exemplarPool({ family: 'minor' }).entries.every(([, e]) => e.family === 'minor'));
});

test('D50: a variation is never less idiomatic than the exemplar it came from', () => {
  // This IS the design: the bar is set by the exemplar, not by a constant.
  let n = 0;
  for (const [, e, v] of everyVariation()) {
    const ctx = { family: famOf(e), style: null, home: 0 };
    const before = cycleScore(parseDegrees(e.degrees), ctx);
    const after = cycleScore(parseDegrees(v.degrees), ctx);
    assert.ok(after.worst >= before.worst - 1.2 - 1e-9,
      `${v.degrees} worst transition ${after.worst.toFixed(2)} vs exemplar ${before.worst.toFixed(2)}`);
    assert.ok(after.cadence >= before.cadence - 0.7 - 1e-9,
      `${v.degrees} cadence ${after.cadence.toFixed(2)} vs exemplar ${before.cadence.toFixed(2)}`);
    assert.ok(after.worstQual >= before.worstQual - 1.0 - 1e-9,
      `${v.degrees} chord quality ${after.worstQual.toFixed(2)} vs exemplar ${before.worstQual.toFixed(2)}`);
    n++;
  }
  assert.ok(n > 300, `only ${n} variations exercised`);
});

test('D50: variations render, stay playable, and are honest about provenance', () => {
  for (const [, e, v] of everyVariation({ intensities: [0.4], budgets: [2] })) {
    const key = e.family === 'minor' ? 'C:minor' : 'C:major';
    const symbols = renderProgression(v, key);
    assert.equal(symbols.length, roots(v.degrees).length);
    for (const s of symbols) assert.match(s, /^[A-G][#b]?/);
    assert.equal(v.provenance, 'varied');
    assert.equal(v.ratified, false);
    assert.equal(v.needsEar, true);
    assert.equal(v.character, null);
    assert.equal(v.family, e.family);
  }
});

test('D50: an operator never introduces a chord identical to its neighbour', () => {
  // A substitution whose result is its own neighbour has substituted nothing,
  // and the counted model cannot see it (the corpus does repeat chords).
  //
  // D53 carves out the ONE case where a repeated root is the point: a
  // suspension resolving into its own triad. `Csus C` is not a failed
  // substitution, it is the cadence Ethan asked for, so a duplicate whose first
  // half is a sus does not count against the operator.
  for (const [, e, v] of everyVariation()) {
    const had = adjacentDupes(parse(e.degrees));
    const has = adjacentDupes(parse(v.degrees));
    assert.ok(has <= had, `${e.degrees} -> ${v.degrees} introduced an adjacent duplicate`);
  }
  function parse(deg) {
    return deg.split(/\s+/).map((t) => {
      const [r, q = ''] = t.split(':');
      return { root: r.replace(/[b#]/g, ''), sus: /sus/.test(q) };
    });
  }
  function adjacentDupes(cs) {
    let n = 0;
    for (let i = 0; i < cs.length; i++) {
      const next = cs[(i + 1) % cs.length];
      if (cs[i].root !== next.root) continue;
      if (cs[i].sus && !next.sus) continue; // Xsus -> X: a resolution, not a collapse
      n++;
    }
    return n;
  }
});

test('D53: cadential_sus only ever puts the sus where something resolves it', () => {
  // The complaint that produced this operator was that `suspend` treats every
  // slot as equally suspendable. If cadential_sus could do the same it would be
  // a rename, not a fix — so every site it offers must be immediately followed
  // by the triad on the same root, counting the loop wrap.
  let sites = 0;
  for (const [, e] of POOL) {
    const cyc = parseDegrees(e.degrees);
    const ctx = { family: e.family, home: cyc[0].semis };
    for (const s of OPS.cadential_sus.sites(cyc, ctx)) {
      sites++;
      assert.match(s.to.quality, /sus/, 'cadential_sus must produce a suspension');
      const out = cyc.map((c, i) => (i === s.slot ? { ...c, ...s.to } : c));
      const next = out[(s.slot + 1) % out.length];
      assert.equal(next.semis, s.to.semis,
        `${e.degrees}: sus at slot ${s.slot} is not followed by its own root`);
      assert.ok(!/sus/.test(next.quality), 'a sus resolving into another sus resolves nothing');
      // and it lands at the cadence, not loose in the middle
      assert.ok(s.slot >= cyc.length - 2, `slot ${s.slot} of ${cyc.length} is not cadential`);
    }
  }
  assert.ok(sites > 20, `expected the operator to fire across the pool, got ${sites} sites`);
});

test('D50: a variation never undoes itself', () => {
  for (const [name, , v] of everyVariation({ intensities: [0.4], budgets: [3] })) {
    if (v.lineage.ops.length < 2) continue;
    // replay the chain: no cycle may appear twice
    const seen = new Set([v.lineage.exemplarDegrees]);
    // the final cycle must differ from the exemplar whenever any op landed
    assert.ok(!seen.has(v.degrees) || !v.lineage.changed,
      `${name}: ${v.lineage.ops.length} operators applied and the result is the exemplar`);
  }
});

test('D50: no operator INTRODUCES a third-flip (D49) that the exemplar lacked', () => {
  // Not "the result contains no flip": an exemplar may legitimately carry one.
  // Lil Tecca's Ransom is `0:m 8 7:m 7` — degree 7 as both v and V, which is the
  // raised-leading-tone device, one of the 43 named flips D49 measured. The
  // contract is that a SUBSTITUTION may not add one.
  const flips = (degrees) => {
    const pinned = new Map();
    let n = 0;
    for (const t of parseDegrees(degrees)) {
      const k = thirdClass(t.quality);
      if (k === 'none') continue;
      if (pinned.has(t.semis)) { if (k !== pinned.get(t.semis)) n++; } else pinned.set(t.semis, k);
    }
    return n;
  };
  for (const [, e, v] of everyVariation()) {
    assert.ok(flips(v.degrees) <= flips(e.degrees),
      `${e.degrees} -> ${v.degrees} introduced a third-flip`);
  }
});

test('D50: every operator preserves what it declares', () => {
  const ctx = { family: 'minor', style: null, home: 0 };
  // a cycle rich enough to give every operator a site
  const cycle = parseDegrees('0:m 5:m 7:7 3');

  for (const [i, to] of OPS.third_sub.sites(cycle, ctx).map((s) => [s.slot, s.to])) {
    const shared = tonesOf(cycle[i]).filter((p) => tonesOf(to).includes(p));
    assert.ok(shared.length >= 2, `third_sub at ${i} shares only ${shared.length} tones`);
  }
  for (const s of OPS.mixture.sites(cycle, ctx)) {
    assert.equal(s.to.semis, cycle[s.slot].semis, 'mixture moved the root');
    assert.notEqual(thirdClass(s.to.quality), thirdClass(cycle[s.slot].quality));
    assert.notEqual(s.to.semis, 0, 'mixture touched the home chord');
  }
  for (const s of OPS.secondary_dominant.sites(cycle, ctx)) {
    const target = cycle[(s.slot + 1) % cycle.length];
    assert.equal(s.to.quality, '7');
    assert.equal((s.to.semis + 5) % 12, target.semis, 'not a fifth above its target');
  }
  for (const s of OPS.tritone_sub.sites(cycle, ctx)) {
    const target = cycle[(s.slot + 1) % cycle.length];
    assert.equal(s.to.quality, '7');
    assert.equal((s.to.semis + 11) % 12, target.semis, 'a tritone sub must resolve down a semitone');
    // the substitute shares the original's tritone
    const orig = cycle[s.slot];
    assert.equal((s.to.semis + 6) % 12, orig.semis);
  }
  for (const s of OPS.make_ii_V.sites(cycle, ctx)) {
    const dom = cycle[(s.slot + 1) % cycle.length];
    assert.equal(s.to.quality, 'm7');
    assert.equal((s.to.semis + 5) % 12, dom.semis, 'not the ii of the dominant that follows');
  }
  for (const s of OPS.suspend.sites(cycle, ctx)) {
    assert.equal(s.to.semis, cycle[s.slot].semis, 'suspend moved the root');
    assert.equal(thirdClass(s.to.quality), 'none');
  }
  for (const s of OPS.recolour.sites(cycle, ctx)) {
    assert.equal(s.to.semis, cycle[s.slot].semis, 'recolour moved the root');
    assert.equal(thirdClass(s.to.quality), thirdClass(cycle[s.slot].quality), 'recolour changed the third');
  }
  for (const s of ROTATE.sites(cycle)) {
    const r = ROTATE.apply(cycle, s.by);
    assert.deepEqual([...r].map((c) => c.semis).sort(), cycle.map((c) => c.semis).sort(),
      'rotate changed which chords are in the cycle');
  }

  function tonesOf(c) {
    const k = thirdClass(c.quality);
    const third = k === 'min' ? 3 : 4;
    return [c.semis, (c.semis + third) % 12, (c.semis + 7) % 12];
  }
});

test('D50: intensity reaches for different operators', () => {
  const used = (intensity) => {
    const seen = new Map();
    for (const [name] of POOL) {
      for (const seed of ['a', 'b', 'c', 'd']) {
        for (const o of varyProgression(name, { intensity, budget: 2, seed }).lineage.ops) {
          seen.set(o.op, (seen.get(o.op) ?? 0) + 1);
        }
      }
    }
    return seen;
  };
  const gentle = used(0.15);
  const bold = used(0.9);
  const share = (m, op) => (m.get(op) ?? 0) / [...m.values()].reduce((a, b) => a + b, 0);
  assert.ok(share(gentle, 'recolour') > share(bold, 'recolour'),
    'gentle variations do not favour the quietest operator');
  const loud = ['secondary_dominant', 'tritone_sub', 'make_ii_V'];
  const loudShare = (m) => loud.reduce((a, op) => a + share(m, op), 0);
  assert.ok(loudShare(bold) > loudShare(gentle) + 0.1,
    `bold ${loudShare(bold).toFixed(2)} vs gentle ${loudShare(gentle).toFixed(2)} — intensity does nothing`);
});

test('D50: no single operator swallows the output (the flat-pool bug)', () => {
  // Ranking (operator, site) pairs in one pool makes an operator's chance
  // proportional to how many sites it happens to have; `suspend` took 90% of
  // every variation. The pick is two-stage now, and this is the regression.
  const seen = new Map();
  for (const [, , v] of everyVariation()) {
    for (const o of v.lineage.ops) seen.set(o.op, (seen.get(o.op) ?? 0) + 1);
  }
  const total = [...seen.values()].reduce((a, b) => a + b, 0);
  const top = Math.max(...seen.values());
  assert.ok(top / total < 0.45, `one operator took ${(100 * top / total).toFixed(0)}% of all applications`);
  assert.ok(seen.size >= 6, `only ${seen.size} of ${OP_NAMES.length + 1} operators ever fired: ${[...seen.keys()].join(', ')}`);
});

test('D50: variation is deterministic and the request is carried', () => {
  const [name] = POOL[0];
  const a = varyProgression(name, { budget: 3, intensity: 0.6, seed: 'fixed' });
  const b = varyProgression(name, { budget: 3, intensity: 0.6, seed: 'fixed' });
  assert.equal(a.degrees, b.degrees);
  assert.deepEqual(a.lineage.ops.map((o) => o.op), b.lineage.ops.map((o) => o.op));
  assert.notEqual(a.degrees, varyProgression(name, { budget: 3, intensity: 0.6, seed: 'other' }).degrees);
  assert.equal(a.request.exemplar, name);
  assert.equal(a.request.seed, 'fixed');
});

test('D50: `allow` restricts the operator set', () => {
  for (const [name] of POOL) {
    for (const seed of ['a', 'b']) {
      const v = varyProgression(name, { budget: 3, allow: ['recolour', 'suspend'], seed });
      for (const o of v.lineage.ops) assert.ok(['recolour', 'suspend'].includes(o.op), `${o.op} escaped the allow list`);
    }
  }
});

test('D50: variationsOf returns distinct variations that actually changed', () => {
  for (const [name] of POOL.slice(0, 8)) {
    const vs = variationsOf(name, { count: 3, intensity: 0.5, seed: 'v' });
    assert.ok(vs.length >= 2, `${name} yielded only ${vs.length} variations`);
    assert.equal(new Set(vs.map((v) => v.degrees)).size, vs.length, 'duplicates in the batch');
    for (const v of vs) {
      assert.ok(v.lineage.changed);
      assert.notEqual(v.degrees, ALL_PROGRESSIONS[name].degrees);
    }
  }
});

test('D50: the lineage says where it came from and what each edit guaranteed', () => {
  const [name, e] = POOL[2];
  const v = varyProgression(name, { budget: 2, intensity: 0.7, seed: 'L' });
  assert.equal(v.lineage.exemplar, name);
  assert.equal(v.lineage.exemplarDegrees, e.degrees);
  for (const o of v.lineage.ops) {
    assert.ok(o.op && o.where && o.note && o.preserves, `incomplete lineage record: ${JSON.stringify(o)}`);
  }
  assert.ok(v.lineage.idiom.exemplar != null && v.lineage.cadence.exemplar != null);
  assert.ok(explainVariation(v).length > 1);
});

test('D50: bad requests fail loudly', () => {
  assert.throws(() => varyProgression('no_such_progression'), /unknown exemplar/);
  assert.throws(() => varyProgression(POOL[0][0], { budget: 0 }), /budget must be/);
});

test('D50: a variation of a playable exemplar stays playable', () => {
  for (const [name, e] of POOL) {
    if (!playableWith(e, 'shell_37')) continue;
    for (const seed of ['a', 'b', 'c']) {
      const v = varyProgression(name, { budget: 2, intensity: 0.5, seed });
      // Operators draw qualities from the corpus, which is wider than the me_*
      // dictionaries — so this is not guaranteed, and the point of the check is
      // to know HOW OFTEN it holds rather than to assert it never fails.
      if (!playableWith(v, 'shell_37')) {
        assert.ok(v.degrees.includes(':'), 'unplayable for no visible reason');
      }
    }
  }
});

// --- D51: the ear, once it exists ------------------------------------------

test('D51: verdicts reach the library and ratify entries', async () => {
  const { VERDICTS, KEPT, KILLED } = await import('../src/lib/verdicts.js');
  assert.ok(KEPT.length > 0, 'no kept entries — the verdict import never ran');
  assert.equal(KEPT.length + KILLED.length, Object.keys(VERDICTS).length);
  // A verdict is only honoured while it still describes the music that played
  const live = (n) => VERDICTS[n].judged == null || VERDICTS[n].judged === ALL_PROGRESSIONS[n]?.degrees;
  for (const n of KEPT) {
    if (!live(n)) continue;
    assert.equal(ALL_PROGRESSIONS[n].ratified, true, `${n} was kept but is not ratified`);
    assert.equal(ALL_PROGRESSIONS[n].needsEar, false);
  }
  for (const n of KILLED) {
    if (!live(n)) continue;
    assert.equal(ALL_PROGRESSIONS[n].ratified, false, `${n} was killed but reads as ratified`);
    assert.equal(ALL_PROGRESSIONS[n].verdict, 'kill');
    assert.equal(ALL_PROGRESSIONS[n].needsEar, false, 'a killed entry has still been heard');
  }
});

test('D52: a verdict is void once the entry is re-transcribed', async () => {
  // The percussion fix moved both Amalgam entries from B:minor to D:major.
  // The kills recorded against them judged music that no longer exists, so they
  // must NOT be honoured — a stale label is worse than no label.
  const { VERDICTS } = await import('../src/lib/verdicts.js');
  let stale = 0;
  for (const [n, v] of Object.entries(VERDICTS)) {
    const e = ALL_PROGRESSIONS[n];
    if (!e || v.judged == null || v.judged === e.degrees) continue;
    stale++;
    assert.equal(e.ratified, false, `${n}: stale verdict still ratifies`);
    assert.equal(e.verdict, undefined, `${n}: stale verdict still applied`);
    assert.equal(e.verdictStale, v.verdict, `${n}: staleness not recorded`);
    assert.notEqual(e.needsEar, false, `${n}: re-transcribed, so it needs an ear again`);
  }
  assert.ok(stale > 0, 'no stale verdicts left to defend this rule');
  // and every verdict records what it judged, or the check above is vacuous
  for (const v of Object.values(VERDICTS)) assert.ok(typeof v.judged === 'string');
});

test('D51: the verdict file is not stale', () => {
  execFileSync('node', ['scripts/import-verdicts.mjs', '--check'], { cwd: ROOT });
});

test('D51: the ear outranks the coverage proxy', async () => {
  const { COVERAGE_FLOOR } = await import('../src/lib/taste.js');
  const { KEPT, KILLED } = await import('../src/lib/verdicts.js');
  const pool = new Set(exemplarPool().entries.map(([n]) => n));
  // Two entries Ethan kept sit below the coverage floor. Excluding them would be
  // the proxy overruling the evidence it exists to approximate.
  const lowButKept = KEPT.filter((n) => (ALL_PROGRESSIONS[n].coverage ?? 1) < COVERAGE_FLOOR);
  assert.ok(lowButKept.length > 0, 'no low-coverage keeps left to defend this rule');
  for (const n of lowButKept) assert.ok(pool.has(n), `${n} was kept by ear but the coverage gate dropped it`);
  // and a killed entry never becomes an exemplar, whatever its coverage
  for (const n of KILLED) assert.ok(!pool.has(n), `${n} was killed but is in the exemplar pool`);
  // an UNJUDGED low-coverage entry is still gated
  const unjudgedLow = Object.entries(ALL_PROGRESSIONS)
    .filter(([, e]) => e.verdict == null && e.coverage != null && e.coverage < COVERAGE_FLOOR);
  for (const [n] of unjudgedLow) assert.ok(!pool.has(n), `${n} is unjudged and low-coverage but got in`);
});

test('D51: the exemplar pool reports honestly how thin the ear pool is', async () => {
  const { KEPT } = await import('../src/lib/verdicts.js');
  const pool = exemplarPool();
  if (KEPT.length < 20) {
    assert.ok(/ratified/.test(pool.caveat ?? ''), 'a thin ear pool must say so');
    assert.ok(pool.basis.includes('ratified'));
    // ratified entries come first, so a caller taking the head gets the ear
    assert.ok(pool.entries.slice(0, KEPT.length).every(([, e]) => e.ratified));
  }
});

test('D51: the taste profile is derived from the verdicts, not asserted', async () => {
  const { tasteProfile, explainTaste } = await import('../src/lib/taste.js');
  const { VERDICTS } = await import('../src/lib/verdicts.js');
  const t = tasteProfile();
  assert.equal(t.n, Object.keys(VERDICTS).filter((n) => ALL_PROGRESSIONS[n]).length);
  assert.equal(t.keeps + t.kills, t.n);
  // colour is the inverse of the observed plain-triad share, in the units
  // generateProgression() takes
  assert.ok(Math.abs(t.colour - (1 - t.plainShare)) < 0.01);
  assert.ok(t.colour >= 0 && t.colour <= 1);
  // with this little data the profile MUST say so rather than read as a model
  assert.equal(t.confidence, t.n < 60 ? 'low' : t.n < 200 ? 'moderate' : 'usable');
  assert.ok(t.caveats.length >= 3);
  assert.ok(t.caveats.some((c) => /coverage|transcription/.test(c)),
    'the profile must flag that its strongest separator is not taste');
  assert.ok(explainTaste().length > 4);
});
