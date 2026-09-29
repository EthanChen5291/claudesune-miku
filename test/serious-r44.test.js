// r44 — HIS COMBINATION-LAB RULINGS, as tests.
//
// The three notes (verdicts.js COMBO_NOTES, audition/mixlab.html, 2026-09-14):
//
//   "you can layer just about anything to achieve the energetic serious vibe,
//    just dont overlay (comes up to be greater than 3) but anything works"
//   "you can just about layer any of these together, but I found that bass
//    melodies like the zoltraak one sound really good. but each of these serve
//    as good backbone"
//   "…this group volume should be reduced"
//
// Each one is pinned here as the property it became, and two of these tests
// exist because this round's own first build broke them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SERIOUS_FIGURES, SERIOUS_STACKS, SERIOUS_POOLS, SERIOUS_THEME,
  OVERLAY_CAP, SUPPORT_ENERGY_CAP, figurePerBar, rotateSeriousFigures,
} from '../src/lib/serious-layers.js';
import { CARD_NOTES, DERIVED_VERDICTS, COMBO_NOTES } from '../src/lib/verdicts.js';

const GEN = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
const SHIPPED = ['sr_stack_titan', 'sr_stack_battle', 'sr_stack_additive', 'sr_stack_calm'];

test('r44 pools: every member is a real figure, none is a partial, and no pool is a pool of one', () => {
  for (const [slot, pool] of Object.entries(SERIOUS_POOLS)) {
    assert.ok(pool.length >= 2, `${slot} is a pool of ${pool.length} — D119: a pool of one makes the rotation a no-op`);
    for (const fig of pool) {
      const row = SERIOUS_FIGURES[fig];
      assert.ok(row, `${slot} names an unknown figure ${fig}`);
      // D148's rest-anchor law: a figure that does not tile its own bar names
      // the partner that fills it, and playing it alone is the defect he heard.
      assert.ok(!row.partial, `${slot} carries ${fig}, which is partial — it needs its partner voice`);
    }
  }
});

test('r44 pools: membership is what HE ratified, not what the library holds', () => {
  // D95 — only clicked entries enter a retrieval pool. Every pool member must
  // be traceable to a keep on audition/cells.html (the cl_* cards), to a note
  // he wrote there, or to a layer he ticked and praised in the combination lab.
  const cards = [...GEN.matchAll(/\{ id: '([a-z0-9_]+)', group: '([a-z]+)', fig: '([a-z0-9_]+)'/g)]
    .map(([, id, , fig]) => ({ card: `cl_${id}`, fig }));
  const judgedFigs = new Set(cards
    .filter(({ card }) => DERIVED_VERDICTS?.[card]?.verdict === 'keep' || CARD_NOTES?.[card])
    .map(({ fig }) => fig));
  // the combination lab's own ticks: a layer id maps to its figure through the
  // mixlab stack, and a COMBO_NOTE records exactly what was sounding
  const labFig = new Map(SERIOUS_STACKS.sr_stack_mixlab.entries.filter((e) => e.fig).map((e) => [e.id, e.fig]));
  for (const note of COMBO_NOTES ?? []) for (const id of note.sel?.layers ?? []) {
    if (labFig.has(id)) judgedFigs.add(labFig.get(id));
  }
  for (const [slot, pool] of Object.entries(SERIOUS_POOLS)) {
    for (const fig of new Set(pool)) {
      assert.ok(judgedFigs.has(fig), `${slot} carries ${fig}, which he has never judged — D95`);
    }
  }
});

test('r44 "bass melodies like the zoltraak one sound really good" — the moving pool leans melodic', () => {
  // a line with its own melody = three or more DISTINCT scale degrees in the
  // figure (an octave double is not a move — D148's mining rule)
  const degrees = (fig) => new Set(SERIOUS_FIGURES[fig].figure
    .flatMap((tok) => String(tok).split('.')).map((t) => t.replace(/\+/g, '')));
  const melodic = SERIOUS_POOLS.push.filter((f) => degrees(f).size >= 3);
  assert.ok(melodic.length / SERIOUS_POOLS.push.length >= 0.3,
    `only ${melodic.length}/${SERIOUS_POOLS.push.length} of the moving-bass pool carries its own line`);
  assert.ok(SERIOUS_POOLS.push.filter((f) => f === 'sr_bass_walk_down').length >= 2,
    'the Zoltraak walk he named is meant to appear twice — that repeat IS the lean');
});

test('r44 the rotation is deterministic, in-pool, and never doubles a figure inside one stack', () => {
  for (const stackName of SHIPPED) {
    const seen = new Map();
    for (let i = 0; i < 200; i++) {
      const name = `probe_${stackName}_${i}`;
      const picks = rotateSeriousFigures(name, stackName);
      assert.deepEqual(picks, rotateSeriousFigures(name, stackName), 'the same name must give the same picks');
      const figs = SERIOUS_STACKS[stackName].entries
        .filter((e) => e.kind === 'figure').map((e) => picks[e.id] ?? e.fig);
      assert.strictEqual(new Set(figs).size, figs.length, `${name} drew the same figure into two slots`);
      for (const [slot, fig] of Object.entries(picks)) {
        const pool = Object.values(SERIOUS_POOLS).find((p) => p.includes(fig));
        assert.ok(pool, `${stackName}/${slot} drew ${fig}, which is in no pool`);
      }
      // count the RESOLVED figure, not the override — a pick that lands on the
      // slot's own literal emits nothing, and counting overrides made this test
      // report a 2-member pool as "only ever draws the other one"
      for (const e of SERIOUS_STACKS[stackName].entries) {
        if (e.kind !== 'figure' || !Object.values(SERIOUS_POOLS).some((p) => p.includes(e.fig))) continue;
        seen.set(e.id, (seen.get(e.id) ?? new Set()).add(picks[e.id] ?? e.fig));
      }
    }
    // D119 again, from the other side: a slot that always draws the same thing
    // is a rotation that is not rotating
    for (const [slot, figs] of seen) {
      assert.ok(figs.size >= 2, `${stackName}/${slot} only ever draws ${[...figs][0]} over 200 names`);
    }
  }
});

test('r44 "dont overlay (comes up to be greater than 3)" — no shipped stack stacks a group deeper than 3', () => {
  const groupOf = (e) => (e.kind !== 'figure' ? 'theme'
    : SERIOUS_FIGURES[e.fig]?.role === 'bass' ? 'bass'
      : SERIOUS_FIGURES[e.fig]?.role === 'pad' ? 'pad' : 'ostinato');
  for (const stackName of SHIPPED) {
    const counts = {};
    for (const e of SERIOUS_STACKS[stackName].entries) {
      const g = groupOf(e);
      counts[g] = (counts[g] ?? 0) + 1;
      assert.ok(counts[g] <= OVERLAY_CAP,
        `${stackName} stacks ${counts[g]} layers of ${g} — his cap is ${OVERLAY_CAP}`);
    }
  }
  // the combination lab is a PALETTE and is exempt by construction (51 layers,
  // all at -1, ticked by hand) — but the stack it suggests must obey the law
  const preset = GEN.match(/const ML_PRESET = \[([^\]]*)\]/)[1].split(',').length;
  assert.ok(preset <= 7, `the lab's suggested stack is ${preset} layers`);
});

test('r44 "this group volume should be reduced" — D77 is checked on ENERGY, at the point the layer is built', () => {
  assert.match(GEN, /const ePerBar = figurePerBar\(e\.figure\);/, 'the energy term is gone');
  assert.match(GEN, /const eRatio = ePerBar \? \(e\.gain \* ePerBar\) \/ srLeadPB : 0;/,
    'the ratio must be energy against the LEAD, never an absolute number (D119)');
  // VERIFY-PASS FIX 1: scoped to a song he has never heard, not just to the
  // round. Gated on ruleFresh alone the -0.6 dB trim reached four judged songs
  // and re-rolled the entry choreography of 14 other layers through the
  // gain-hashing stagger — collateral 10x the intended effect.
  assert.match(GEN, /const srCapOn = ruleFresh\(44\) && neverAuditioned\(\);/,
    'the energy cap must not reach a song he has already heard');
  // VERIFY-PASS FIX 2: ONE multiplier per FIGURE. Per entry, a capped gain
  // becomes cap x leadPB / perBar — independent of e.gain — so the lab's cell
  // and its +8ve violin twin (same figure, 0.5 and 0.34) collapsed from 0.677
  // to 0.879, and to exactly 1.000 on neighbor_full: the double as loud as the
  // line it doubles, which D77 and Belkin both forbid.
  assert.match(GEN, /if \(prev == null \|\| mul < prev\) srFigMul\.set\(e\.fig, mul\);/,
    'the trim must be taken from the loudest entry binding a figure and shared by all of them');
  assert.match(GEN, /const energyMul = srFigMul\.get\(e\.fig\) \?\? 1;/, 'the per-entry cap is back');
  // the cap must bite exactly where his ear drew the line: the 16th cells at
  // full gain, and nothing that plays at or near the tune's own rate
  const bites = (fig, gain) => (gain * figurePerBar(SERIOUS_FIGURES[fig])) / SERIOUS_THEME.notesPerBar > SUPPORT_ENERGY_CAP;
  assert.ok(bites('sr_pedal_cell', 0.5), 'the cell group he asked to reduce must be over the cap');
  assert.ok(!bites('sr_pedal_cell', 0.34), 'the +8ve violin level he did NOT complain about must be under it');
  assert.ok(!bites('sr_bass_push', 0.55) && !bites('sr_gallop', 0.46) && !bites('sr_chorale_rotate', 0.34),
    'the bass, the riff and the pad are not what he asked to reduce');
});

test('r44 a song he has heard never re-rolls its pattern — the rotation gate ignores noteBlind', () => {
  // THIS TEST EXISTS BECAUSE THE FIRST BUILD FAILED IT. Gated on historyLess(),
  // the rotation moved TEN of the eleven judged serious rows — two of them
  // pinned prose keeps — because the page sets `noteBlind` for every row, which
  // is right for a capability gate (D118) and wrong for retrieval (D95).
  assert.match(GEN, /if \(srCfg\.rotate === true && neverAuditioned\(\)\) \{/,
    'the slot rotation must be opt-in AND gated on neverAuditioned(), not historyLess()');
  // and OPT-IN, because the labs build every card under one shared name (D120)
  // so the per-song gate is blind there: a page-wide default re-rolled 14 of
  // the 23 judged cards on cells.html and 26 of the 64 palette layers on the
  // combination lab, where every checkbox names the figure it plays.
  assert.match(GEN, /o\.serious = \{ rotate: true, \.\.\.row\.serious \};/,
    'the serious SONG page is where the rotation is turned on');
  for (const lab of ['cells', 'mixlab']) {
    const p = new URL(`../audition/${lab}.html`, import.meta.url);
    let h; try { h = readFileSync(p, 'utf8'); } catch { continue; }
    const d = JSON.parse(h.slice(h.indexOf('const DATA = ') + 13, h.indexOf(';\n', h.indexOf('const DATA = '))));
    for (const s of d.songs ?? d.beds ?? []) assert.ok(!s.srPicks, `${lab}: ${s.name} rotated — a lab card must play the figure it names`);
  }
  const page = new URL('../audition/serious.html', import.meta.url);
  let html; try { html = readFileSync(page, 'utf8'); } catch { return; }   // page not built in this checkout
  const data = JSON.parse(html.slice(html.indexOf('const DATA = ') + 13, html.indexOf(';\n', html.indexOf('const DATA = '))));
  for (const s of data.songs) {
    const heard = !!(CARD_NOTES?.[s.name] || DERIVED_VERDICTS?.[s.name]);
    if (heard) assert.ok(!s.srPicks, `${s.name} has been judged and its layer slots were re-rolled anyway`);
  }
});

test('r44 a rotated pick is WRITTEN INTO THE ROW — a computed pick reverts on his first note', () => {
  // VERIFY-PASS FIX 3, and it is D91's keep-transition law one turn ahead: the
  // rotation is gated on "never auditioned", so the instant a verdict or a note
  // lands on one of the five fresh rows the gate flips false and the slot falls
  // back to the STACK DEFAULT — a different figure, not a different gain. The
  // pick has to be a row pin, with the rotation as the thing that chose it.
  const block = GEN.slice(GEN.indexOf('const SR_PROMPTS = ['), GEN.indexOf('let SR_FIRST'));
  const rows = block.split(/\n  \{ id: '/).slice(1).map((c) => ({ id: c.slice(0, c.indexOf("'")), src: c }));
  let pinned = 0;
  for (const r of rows) {
    const name = `sr_${r.id}`;
    if (CARD_NOTES?.[name] || DERIVED_VERDICTS?.[name]) continue;      // judged: never rotates
    const stack = /stack: '([^']+)'/.exec(r.src)?.[1] ?? 'sr_stack_titan';
    const picks = rotateSeriousFigures(name, stack);
    for (const [slot, fig] of Object.entries(picks)) {
      assert.match(r.src, new RegExp(`figures: \\{[^}]*${slot}: '${fig}'`),
        `${name} would draw ${slot}=${fig} but its row does not pin it — his first note reverts it`);
      pinned++;
    }
  }
  assert.ok(pinned >= 5, `only ${pinned} rotated picks are pinned into rows`);
});

test('r44 the cap never lets a doubling reach the line it doubles (mixlab, same figure two entries)', () => {
  const p = new URL('../audition/mixlab.html', import.meta.url);
  let html; try { html = readFileSync(p, 'utf8'); } catch { return; }
  const d = JSON.parse(html.slice(html.indexOf('const DATA = ') + 13, html.indexOf(';\n', html.indexOf('const DATA = '))));
  const peak = (e) => { const m = /gain\("<\[?([0-9.]+)/.exec(String(e)) ?? /gain\(([0-9.]+)/.exec(String(e)); return m ? +m[1] : null; };
  let pairs = 0;
  for (const bed of d.beds) {
    const byId = new Map(bed.layers.map((l) => [l.id, l]));
    for (const l of bed.layers) {
      if (!l.id.startsWith('cell_')) continue;
      const twin = byId.get(`vln_${l.id.slice(5)}`);
      if (!twin) continue;
      const c = peak(l.expr), v = peak(twin.expr);
      if (c == null || v == null) continue;
      assert.ok(v < c, `${bed.name}: ${twin.id} at ${v} is not under ${l.id} at ${c}`);
      pairs++;
    }
  }
  assert.ok(pairs >= 50, `only ${pairs} doubling pairs checked`);
});
