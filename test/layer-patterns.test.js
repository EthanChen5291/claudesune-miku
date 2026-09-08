// r31 — the reel layer-pattern library and its combination logic.
//
// His ask: "we can merge all the patterns I feed you and select and choose and
// combine regardless of what reel they came from, using metadata and verification
// and which combos work well."
//
// These tests pin the machinery and the safety gates. The DATA tests (one per
// hardcoded row) live alongside and check that every row is honest about where it
// was read from.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LAYER_PATTERNS, VIBE_CLASSES, VIBE_ACOUSTICS, NICHE_LANES, REEL_PROGRESSIONS,
  layersFor, comboScore, patternVibes,
} from '../src/lib/layer-patterns.js';

test('r31: the vibe vocabulary is HIS, and casual_task has the replicates', () => {
  // He labelled 8 reels; three of them carry the same vibe (3, and 5 and 8 as
  // "sounds like 3"). That is the only vibe with independent replicates, which
  // makes it the only one where "what do these share" is answerable.
  assert.deepEqual(VIBE_CLASSES.casual_task.reels, [3, 5, 8]);
  const seen = new Set();
  for (const [k, c] of Object.entries(VIBE_CLASSES)) {
    assert.ok(c.his && c.his.length > 25, `${k}: a vibe class must carry his words`);
    assert.ok(c.reels.length && c.lanes.length && c.emotions.length, `${k}: incomplete`);
    for (const r of c.reels) {
      assert.ok(!seen.has(r), `reel ${r} is claimed by two vibe classes`);
      seen.add(r);
    }
  }
  assert.deepEqual([...seen].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8],
    'every one of his 8 reels must be claimed exactly once');
});

test('r31: no pattern and no vibe class can reach a niche lane', () => {
  for (const [k, c] of Object.entries(VIBE_CLASSES)) {
    for (const l of c.lanes) assert.ok(!NICHE_LANES.has(l), `${k} claims the niche lane "${l}"`);
  }
  for (const env of NICHE_LANES) {
    assert.deepEqual(layersFor({ environment: env }), [], `layersFor leaked into "${env}"`);
  }
});

test('r31: every hardcoded row is honest about where it was read from', () => {
  const rows = Object.entries(LAYER_PATTERNS);
  for (const [name, lp] of rows) {
    assert.equal(lp.ratified, false, `${name}: ratified without an ear`);
    assert.equal(lp.needsEar, true, `${name}: must still need an ear`);
    assert.ok(lp.reel >= 1 && lp.reel <= 8, `${name}: no reel number`);
    assert.ok(lp.sourceAt, `${name}: no timestamp`);
    assert.ok(lp.role, `${name}: no role`);
    // the two fields that ARE the ask
    assert.ok(lp.rhythm?.onsets?.length, `${name}: no rhythm onsets`);
    assert.ok(Array.isArray(lp.intervals) && lp.intervals.length, `${name}: no interval shape`);
    assert.equal(lp.rhythm.onsets.length, lp.intervals.length,
      `${name}: onsets and intervals must correspond one-to-one`);
    // bindFigure requires strictly increasing onsets: a simultaneity is ONE
    // onset with a DOTTED token, not repeated onsets. Four notes at '0' throws.
    const st = lp.rhythm.onsets.map((o) => {
      const [a, b] = String(o).includes('/') ? String(o).split('/').map(Number) : [Number(o), 1];
      return b ? a / b : a;
    });
    for (let i = 1; i < st.length; i += 1) {
      assert.ok(st[i] > st[i - 1], `${name}: onsets must be strictly increasing (use a dotted token for a chord)`);
    }
    assert.ok(lp.instrument, `${name}: must record the instrument as SHOWN, separate from the library key`);
    assert.equal(lp.rhythm.accents.length, lp.intervals.length, `${name}: accents length`);
    assert.equal(typeof lp.frozen, 'boolean',
      `${name}: must say whether it RE-PITCHES on a chord change — that distinction is the r30/r31 finding`);
    assert.ok(Array.isArray(lp.vibes) && lp.vibes.length, `${name}: no vibe tag`);
    for (const v of lp.vibes) assert.ok(VIBE_CLASSES[v], `${name}: unknown vibe "${v}"`);
    // relative placement, never absolute: the engine's laws overrule the reel's mix
    assert.ok(typeof lp.octaveVsLead === 'number', `${name}: placement must be RELATIVE to the lead (r29/D77)`);
  }
});

test('r31: no imported pattern may be a metronome (D102 applies to strangers too)', () => {
  for (const [name, lp] of Object.entries(LAYER_PATTERNS)) {
    const perBar = lp.rhythm.onsets.length / (lp.rhythm.bars ?? 1);
    const shapes = new Set(lp.intervals).size;
    assert.ok(!((perBar >= 6 && shapes <= 1) || perBar >= 12),
      `${name}: ${perBar}/bar with ${shapes} shape(s) — a pulse or a gear change, which his own rule refuses`);
  }
});

test('r31: comboScore rewards disjoint registers and independent rhythm', () => {
  const A = { name: 'a', role: 'bass', octaveVsLead: -3, rhythm: { grid: 16, onsets: ['0', '1/2'], accents: [1, 1] }, intervals: ['R', '5'] };
  const B = { name: 'b', role: 'lead', octaveVsLead: 0, rhythm: { grid: 16, onsets: ['1/4', '3/4'], accents: [1, 1] }, intervals: ['3', '5'] };
  const C = { name: 'c', role: 'chords', octaveVsLead: -1, rhythm: { grid: 16, onsets: ['1/8', '5/8'], accents: [1, 1] }, intervals: ['R', '3'] };
  const good = comboScore([A, B, C]);
  // same band as A, and the exact same onsets as A
  const D = { name: 'd', role: 'bass', octaveVsLead: -3, rhythm: { grid: 16, onsets: ['0', '1/2'], accents: [1, 1] }, intervals: ['R', '5'] };
  const bad = comboScore([A, D]);
  assert.ok(good.score > bad.score,
    `a disjoint, interlocking, complete stack (${good.score}) must beat a doubled one (${bad.score})`);
  assert.equal(bad.overlap, 1, 'two layers on identical onsets must read as 100% overlap');
  assert.ok(good.reasons.some((r) => /register/.test(r)) && good.reasons.some((r) => /interlock/.test(r)));
  assert.ok(comboScore([A]).score === 0, 'one layer is not a combination');
  // a stack with no bass must SAY so
  assert.ok(comboScore([B, C]).reasons.some((r) => /no bass/.test(r)));
});

test('r31: the library is addressed by NAME — adding a row cannot re-roll a song', () => {
  const src = LAYER_PATTERNS;
  for (const k of Object.keys(src)) assert.ok(Number.isNaN(Number(k)), `row "${k}" is index-like`);
  // and every progression row keys to a real reel
  for (const [k, p] of Object.entries(REEL_PROGRESSIONS)) {
    assert.ok(p.reel >= 1 && p.reel <= 8, `${k}: no reel`);
    assert.ok(p.degrees || p.symbols, `${k}: no harmony`);
  }
});

test('r31: the measured acoustics cover every vibe class, and MODE is refuted', () => {
  for (const k of Object.keys(VIBE_CLASSES)) {
    assert.ok(VIBE_ACOUSTICS[k], `${k}: no measured signature`);
    assert.ok(VIBE_ACOUSTICS[k].centroid > 0 && VIBE_ACOUSTICS[k].hiLo >= 0);
  }
  // his one DARK reel is the treble outlier — 25-100x below everything else
  const dark = VIBE_ACOUSTICS.dark_space.hiLo;
  for (const [k, a] of Object.entries(VIBE_ACOUSTICS)) {
    if (k === 'dark_space') continue;
    assert.ok(a.hiLo > dark * 15, `${k} is not clearly brighter than the dark reel`);
  }
  // and mode does NOT separate his happy labels: casual_task averages
  // MINOR-third dominant (<1) despite being the vibe he calls happy
  assert.ok(VIBE_ACOUSTICS.casual_task.majMin < 1,
    'if casual_task ever measures major-dominant, the "mode is refuted" finding needs re-checking');
  assert.deepEqual(VIBE_ACOUSTICS.casual_task.replicates, [3, 5, 8],
    'the replicate reels are what make that finding possible');
});

test('r31: mutual exclusion resolves toward the PRIMARY row', () => {
  // The reel-1 verify pass found its block stack and its arpeggio to be one
  // instrument played two ways. Casting both is doubling (comboScore drops from
  // 65 to 22 with a warning); casting the wrong one loses the reel's actual
  // texture, which is the arpeggio for 8.8s of its 32.3s.
  // r32: the invariant is per COMPONENT, not per pair. Reel 1's three rows are
  // one instrument played three ways — block stack, arpeggio, and the arpeggio
  // encoded as its sounding verticalities — so they form a mutual-exclusion
  // CLIQUE. Exactly one of the clique is primary, which necessarily leaves some
  // pairs with two non-primary members; the old pairwise rule called that a
  // failure. A pair with ZERO or TWO primaries inside one component is still
  // caught, which is the defect the rule existed for.
  for (const [name, lp] of Object.entries(LAYER_PATTERNS)) {
    for (const x of lp.exclusiveWith ?? []) {
      assert.ok(LAYER_PATTERNS[x], `${name}: excludes "${x}", which does not exist`);
    }
  }
  const seen = new Set();
  for (const start of Object.keys(LAYER_PATTERNS)) {
    if (seen.has(start)) continue;
    const comp = []; const queue = [start];
    while (queue.length) {
      const n = queue.pop();
      if (seen.has(n)) continue;
      seen.add(n); comp.push(n);
      for (const [k, v] of Object.entries(LAYER_PATTERNS)) {
        if ((v.exclusiveWith ?? []).includes(n) || (LAYER_PATTERNS[n].exclusiveWith ?? []).includes(k)) {
          if (!seen.has(k)) queue.push(k);
        }
      }
    }
    if (comp.length < 2) continue;
    const primaries = comp.filter((n) => LAYER_PATTERNS[n].primary === true);
    assert.equal(primaries.length, 1,
      `mutual-exclusion group [${comp.join(', ')}] has ${primaries.length} primary rows; `
      + 'exactly one must win, or the cast is decided by declaration order');
  }
  const withBoth = comboScore(['lp_r1_pedal', 'lp_r1_arp', 'lp_r1_addnine_stack']);
  const real = comboScore(['lp_r1_pedal', 'lp_r1_arp']);
  assert.ok(real.score > withBoth.score, 'the two-part texture must beat the doubled one');
  assert.ok(withBoth.reasons.some((r) => /same instrument played two ways/.test(r)));
});
