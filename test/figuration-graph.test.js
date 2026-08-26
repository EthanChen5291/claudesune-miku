// D62: the relationship graph over the foundational canon — quality compat,
// travel edges, layer pairs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { FND_FEATURES, FND_QUALITY_COMPAT, FND_TRAVEL, FND_LAYERS } from '../src/lib/figuration-graph.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('graph regenerates byte-stable (--check)', () => {
  execFileSync('node', ['scripts/build-figuration-graph.mjs', '--check'], { cwd: ROOT });
});

test('travel edges: real endpoints, declared devices and preserves, sane costs', () => {
  assert.ok(FND_TRAVEL.length > 50);
  for (const e of FND_TRAVEL) {
    assert.ok(FIGURATIONS_FOUNDATION[e.a], `${e.a} not in canon`);
    assert.ok(FIGURATIONS_FOUNDATION[e.b], `${e.b} not in canon`);
    assert.ok(e.devices.length >= 1, `${e.a}->${e.b} has no device`);
    assert.ok(e.preserves.length >= 1, `${e.a}->${e.b} declares nothing preserved`);
    assert.ok(e.cost >= 0.1 && e.cost <= 0.6, `${e.a}->${e.b} cost ${e.cost} out of band`);
  }
});

test('meter is a hard travel guard except the declared nestings', () => {
  for (const e of FND_TRAVEL) {
    const [ma, mb] = [FND_FEATURES[e.a].meter, FND_FEATURES[e.b].meter];
    if (ma === mb) continue;
    assert.ok(e.devices.includes('meter_nest'), `${e.a}(${ma}) -> ${e.b}(${mb}) crosses meter without meter_nest`);
    const pair = new Set([ma, mb]);
    assert.ok((pair.has('2/4') && pair.has('4/4')) || (pair.has('6/8') && pair.has('12/8')),
      `${ma}<->${mb} is not a legal nesting`);
  }
});

test('the research-named pairs are recovered by the rules, not hand-seeded', () => {
  const has = (a, b) => FND_TRAVEL.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
  assert.ok(has('fnd_murky_octaves', 'fnd_octave_bounce_16ths'), 'density pair missing');
  assert.ok(has('fnd_alberti_8ths', 'fnd_alberti_16ths'), 'alberti density pair missing');
  assert.ok(has('fnd_stride_4', 'fnd_wide_oompah'), 'register pair missing');
  assert.ok(has('fnd_tresillo_bass', 'fnd_tumbao_bass'), 'figure-swap pair missing');
  const swap = FND_TRAVEL.find((e) => (e.a === 'fnd_tresillo_bass' && e.b === 'fnd_tumbao_bass') || (e.b === 'fnd_tresillo_bass' && e.a === 'fnd_tumbao_bass'));
  assert.ok(swap.devices.includes('figure_swap'));
});

test('layer pairs: floor under comment, lanes apart, interlocked', () => {
  assert.ok(FND_LAYERS.length > 20);
  for (const p of FND_LAYERS) {
    const [b, u] = [FND_FEATURES[p.bass], FND_FEATURES[p.upper]];
    assert.ok(u.octave - b.octave >= 1, `${p.bass}+${p.upper} lanes collide`);
    assert.equal(b.meter, u.meter, `${p.bass}+${p.upper} meters differ`);
    assert.ok(p.overlap <= 0.6, `${p.bass}+${p.upper} piles up (${p.overlap})`);
  }
  // the research's named interlock candidate emerges from the rules
  assert.ok(FND_LAYERS.some((p) => p.bass === 'fnd_tresillo_bass' && p.upper === 'fnd_offbeat_chords'));
});

test('quality compat measures real fallbacks and only battery qualities', () => {
  // alberti carries a 3 — a sus chord cannot supply it; the binder re-points to the 4
  assert.ok(FND_QUALITY_COMPAT.fnd_alberti_8ths?.sus?.some((w) => w.includes('no 3')));
  // an all-R pattern can never fall back
  assert.equal(FND_QUALITY_COMPAT.fnd_drive_8th_root, undefined);
  assert.equal(FND_QUALITY_COMPAT.fnd_murky_octaves, undefined);
  for (const [n, row] of Object.entries(FND_QUALITY_COMPAT)) {
    assert.ok(FIGURATIONS_FOUNDATION[n], `${n} not in canon`);
    for (const ws of Object.values(row)) assert.ok(ws.length >= 1);
  }
});
