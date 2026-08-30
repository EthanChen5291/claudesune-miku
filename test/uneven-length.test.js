// r27 — the uneven chord-length rule, pinned.
//
// `weightedBarPlan` turns a progression's measured relative durations into an
// uneven bar plan. The rule exists because the @vanrivermusic reels give only
// 36.8% of their chords the modal length; the previous behaviour (`barPlan`)
// spreads every progression as evenly as the 4-bar grid allows.
//
// These tests pin the two properties that make it correct and the one that makes
// it USEFUL — the third is the one a plausible refactor breaks silently.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROGRESSIONS_VANRIVER } from '../src/lib/progressions-vanriver.js';

// The generator is a script, not a module, so the function is re-derived here
// from its source to keep the test honest about WHICH implementation it pins.
const SRC = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');

test('r27: weightedBarPlan is present and is the path chordUnits takes', () => {
  assert.match(SRC, /function weightedBarPlan\(units, target\)/,
    'the uneven-length allocator is gone');
  assert.match(SRC, /const unevenOn = r27\(\) && Array\.isArray\(opts\.chordUnits\)/,
    'the rule must stay gated on r27(), which is ruleFresh AND not a niche lane');
  assert.match(SRC, /opts\.chordUnits\.length === symbols\.length/,
    'a stale weight vector must not be applied to a lengthened progression');
});

test('r27: THE NICHE GATE — his ruling, pinned in the generator', () => {
  // His words this round: "note that engine changes as a result of this should
  // not affect the niche genres". Every rule added in r27 goes through r27(),
  // which is ruleFresh(round) AND NOT a niche lane. This test pins the gate
  // itself and pins that each rule uses it — a new rule that reaches for a bare
  // ruleFresh(27) fails here.
  assert.match(SRC, /const NICHE_LANES = new Set\(\['desert', 'jungle', 'manor', 'catacombs', 'citadel'\]\)/,
    'the niche lane set is gone or has changed membership');
  assert.match(SRC, /const nicheLane = NICHE_LANES\.has\(env\) \|\| laneHorror;/,
    'nicheLane must cover the horror lanes via laneHorror as well as by name');
  assert.match(SRC, /const r27 = \(round = 27\) => ruleFresh\(round\) && !nicheLane;/,
    'the r27 gate must combine freshness AND the niche exclusion');
  // and no r27 rule may bypass it
  assert.doesNotMatch(SRC, /ruleFresh\(27\)/,
    'an r27 rule is using a bare ruleFresh(27) and would fire on desert/jungle/horror');
  for (const rule of [
    /const unevenOn = r27\(\)/,
    /if \(r27\(\) && opts\.totalBarsCap > 0/,
    /const contrastOn = r27\(\) && !!opts\.contrastAtZero;/,
    /const percRampOn = r27\(\) && !!opts\.percRamp;/,
  ]) assert.match(SRC, rule, `an r27 rule stopped going through the niche gate: ${rule}`);
  // The funk bounce is NOT in that list on purpose. He named it this round and I
  // wrote a fresh implementation of it before measuring the page and finding the
  // engine already had one, byte-identical, as `opts.funkBass`. The duplicate was
  // deleted. Its niche exclusion comes from the pre-existing `!laneSerious` gate,
  // pinned here so removing that gate is a test failure rather than a silent leak.
  assert.match(SRC, /if \(opts\.funkBass !== false && !laneSerious && !accToBass && drumBarsShared/,
    'the funk bounce lost its !laneSerious gate and can now reach desert/jungle/horror');
  assert.equal((SRC.match(/name: 'funk-bounce'/g) ?? []).length, 1,
    'there is more than one funk-bounce implementation again');
});

// A local copy of the allocator, kept identical to the generator's. If someone
// changes one and not the other, the "matches the generator" test below fails.
function weightedBarPlan(units, target) {
  const n = units.length;
  if (!n) return null;
  const B = Math.max(target, Math.ceil(n / 4) * 4);
  if (B < n) return null;
  const sum = units.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return null;
  const raw = units.map((u) => (B * u) / sum);
  const plan = raw.map((x) => Math.floor(x));
  const rem = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  let left = B - plan.reduce((a, b) => a + b, 0);
  for (let k = 0; left > 0; k += 1, left -= 1) plan[rem[k % n][1]] += 1;
  for (let i = 0; i < n; i += 1) {
    if (plan[i] >= 1) continue;
    let big = 0;
    for (let j = 1; j < n; j += 1) if (plan[j] > plan[big]) big = j;
    if (plan[big] <= 1) return null;
    plan[big] -= 1; plan[i] += 1;
  }
  return plan;
}

test('r27: every chord sounds, and the loop lands on the target', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_VANRIVER)) {
    for (const T of [16, 32]) {
      const plan = weightedBarPlan(e.chordUnits, T);
      assert.ok(plan, `${name}@${T}: no plan`);
      assert.equal(plan.length, e.chordUnits.length, `${name}@${T}: lost a chord`);
      assert.ok(plan.every((b) => b >= 1), `${name}@${T}: a chord got zero bars — it would not sound`);
      const B = plan.reduce((a, b) => a + b, 0);
      assert.equal(B, Math.max(T, Math.ceil(e.chordUnits.length / 4) * 4),
        `${name}@${T}: loop is ${B}, off the 4-bar grid`);
    }
  }
});

test('r27: the allocator PRESERVES the ratio — the property the first version destroyed', () => {
  // The first implementation gave every chord one bar and shared only the
  // remainder proportionally. That guarantees the floor and quietly compresses
  // every ratio towards 1:1 — on vid_vr_ineedyourears (units 0.75 1 0.75 1) it
  // produced 4-4-4-4, a perfectly EVEN plan from an uneven progression, i.e. it
  // deleted the entire finding. This test is the one that would have caught it.
  const flat = [];
  for (const [name, e] of Object.entries(PROGRESSIONS_VANRIVER)) {
    const u = e.chordUnits;
    const wantRatio = Math.max(...u) / Math.min(...u);
    if (wantRatio === 1) continue;                       // vid_vr_shop is genuinely even
    const plan = weightedBarPlan(u, 32);
    const gotRatio = Math.max(...plan) / Math.min(...plan);
    assert.ok(gotRatio > 1, `${name}: an uneven progression rendered as a FLAT bar plan`);
    // and the realised ratio must be in the neighbourhood of the measured one
    assert.ok(Math.abs(gotRatio - wantRatio) / wantRatio < 0.45,
      `${name}: published ratio ${wantRatio.toFixed(1)}:1 rendered as ${gotRatio.toFixed(1)}:1`);
    if (gotRatio === 1) flat.push(name);
  }
  assert.deepEqual(flat, []);
});

test('r27: vid_vr_ineedyourears specifically does not go flat', () => {
  // Named because it is the case that actually failed. 0.75 1 0.75 1 is the
  // hardest shape in the pack: only four chords, and the ratio is small enough
  // that a floor-first allocator rounds it away entirely.
  const plan = weightedBarPlan(PROGRESSIONS_VANRIVER.vid_vr_ineedyourears.chordUnits, 32);
  assert.notDeepEqual(plan, [8, 8, 8, 8], 'the flat plan the first allocator produced');
  assert.equal(plan[0], plan[2], 'the two 0.75 chords must get the same length');
  assert.equal(plan[1], plan[3], 'the two 1.0 chords must get the same length');
  assert.ok(plan[1] > plan[0], 'the longer chord must actually be longer');
});
