// r42 — THE PATTERN LAB (src/lib/serious-layers.js's r42 rows + the CELLS=1
// page). His ask: more variations of the rising, repeating cello cell —
// "falling instead of rising, 3 notes instead of 4 where the fourth note is the
// root again, different intervals, different patterns" — plus attack on titan's
// BASS patterns and the others, each heard INDIVIDUALLY.
//
// What these pin is what would silently make the page stop being evidence:
// a card that moves more than one variable (D139's fake A/B), a variant that
// collapses onto another, an intro that is not actually the layer alone, and a
// figure override that falls back to the stack's default instead of throwing.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SERIOUS_FIGURES, SERIOUS_STACKS, seriousSpec } from '../src/lib/serious-layers.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const load = (p) => { const h = readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'); const i = h.indexOf('const DATA = '); return { html: h, data: JSON.parse(h.slice(i + 13, h.indexOf(';\n', i))) }; };

test('r42 cell variants differ from the control in PITCH ONLY — same onsets, same accents', () => {
  const c = SERIOUS_FIGURES.sr_pedal_cell;
  const variants = Object.keys(SERIOUS_FIGURES).filter((k) => /^sr_cell_/.test(k) && !/^sr_cell_neighbor/.test(k));
  assert.ok(variants.length >= 6, `${variants.length} cell variants`);
  for (const k of variants) {
    const v = SERIOUS_FIGURES[k];
    assert.deepEqual(v.onsets, c.onsets, `${k} moved the rhythm as well as the pitches`);
    assert.deepEqual(v.accents, c.accents, `${k} moved the accents as well as the pitches`);
    assert.notDeepEqual(v.figure, c.figure, `${k} is the control under another name`);
    assert.equal(v.bars, c.bars, `${k} bars`);
  }
  // ...and no two variants are each other
  const seen = new Map();
  for (const k of [...variants, 'sr_pedal_cell']) {
    const sig = JSON.stringify(SERIOUS_FIGURES[k].figure);
    assert.ok(!seen.has(sig), `${k} and ${seen.get(sig)} are the same cell`);
    seen.set(sig, k);
  }
});

test('r42 the bass rows are bass-role, low, and each one is a distinct bar', () => {
  const bass = Object.keys(SERIOUS_FIGURES).filter((k) => SERIOUS_FIGURES[k].role === 'bass');
  assert.ok(bass.length >= 9, `${bass.length} bass figures`);
  const seen = new Map();
  for (const k of bass) {
    const F = SERIOUS_FIGURES[k];
    assert.ok(F.octave <= 2, `${k} sits at octave ${F.octave} — a bass row is 1 or 2`);
    const sig = JSON.stringify([F.onsets, F.figure]);
    assert.ok(!seen.has(sig), `${k} and ${seen.get(sig)} are the same bar`);
    seen.set(sig, k);
  }
});

test('r42 seriousSpec: a figure override resolves BY NAME, brings its own register, and throws on a typo', () => {
  const base = seriousSpec({ stack: 'sr_stack_lab_cell' });
  assert.equal(base.stack.entries.find((e) => e.id === 'ost').fig, 'sr_pedal_cell');
  const swapped = seriousSpec({ stack: 'sr_stack_lab_cell', figures: { ost: 'sr_cell_fall' } });
  const ost = swapped.stack.entries.find((e) => e.id === 'ost');
  assert.equal(ost.fig, 'sr_cell_fall');
  assert.equal(ost.figure.name, 'sr_cell_fall');
  // every other slot is untouched
  for (const e of swapped.stack.entries) if (e.id !== 'ost') {
    assert.equal(e.fig, base.stack.entries.find((x) => x.id === e.id).fig, `${e.id} moved`);
  }
  // the override's own measured octave wins (D118: an octave parameter is not a register)
  const pump = seriousSpec({ stack: 'sr_stack_lab_bass', figures: { bass: 'sr_bass_fifth_pump' } });
  assert.equal(pump.stack.entries.find((e) => e.id === 'bass').octave, SERIOUS_FIGURES.sr_bass_fifth_pump.octave);
  // a typo must throw, not fall back to the stack's default
  assert.throws(() => seriousSpec({ stack: 'sr_stack_lab_cell', figures: { ost: 'sr_cell_nope' } }), /unknown figure/);
  assert.throws(() => seriousSpec({ stack: 'sr_stack_lab_cell', figures: { nope: 'sr_cell_fall' } }), /not a figure slot/);
});

test('r42 the lab stacks put the tested slot FIRST and add one layer per section', () => {
  for (const name of ['sr_stack_lab_cell', 'sr_stack_lab_bass', 'sr_stack_lab_riff']) {
    const st = SERIOUS_STACKS[name];
    assert.equal(st.entries[0].at, -1, `${name}: the tested layer must enter in the intro, alone`);
    const ats = st.entries.map((e) => e.at);
    assert.deepEqual(ats, [...ats].sort((a, b) => a - b), `${name}: entries out of entry order`);
    assert.equal(new Set(ats).size, ats.length, `${name}: two layers enter together — that is not a build`);
  }
  assert.equal(SERIOUS_STACKS.sr_stack_lab_cell.entries[0].id, 'ost');
  assert.equal(SERIOUS_STACKS.sr_stack_lab_bass.entries[0].id, 'bass');
  assert.equal(SERIOUS_STACKS.sr_stack_lab_riff.entries[0].id, 'ost');
  // r42 verify catch: the riff figures sit an octave-plus above the cell ones,
  // so the riff bed needs a MOVING bass under it or three of its four cards
  // carry a fraction of the low end every other card on the page has
  const rb = SERIOUS_STACKS.sr_stack_lab_riff.entries.find((e) => e.id === 'bass');
  assert.ok(SERIOUS_FIGURES[rb.fig].onsets.length / SERIOUS_FIGURES[rb.fig].bars >= 2,
    'the riff bed\'s bass must move, not hold');
});

test('r42 the pattern lab page: one bed, one variable, no two cards the same mix', () => {
  const { html, data } = load('audition/cells.html');
  assert.ok(html.includes("page: 'r42-cells'"));
  assert.ok(data.songs.length >= 20, `${data.songs.length} cards`);
  const keys = new Set(), bpms = new Set(), mixes = new Map();
  for (const s of data.songs) {
    assert.ok(/^cl_/.test(s.name), s.name);
    keys.add(s.key); bpms.add(s.bpm);
    assert.ok(s.why && /source:/.test(s.why), `${s.name}: the card must say where its figure came from`);
    assert.ok(SERIOUS_FIGURES[s.labFig], `${s.name}: unknown figure ${s.labFig}`);
    assert.ok(!mixes.has(s.mix), `${s.name} and ${mixes.get(s.mix)} realize the SAME mix — a fake A/B`);
    mixes.set(s.mix, s.name);
    // the tested layer has its own solo button
    assert.ok(s.solos[s.labGroup === 'bass' ? '_sr_bass' : '_sr_ost'], `${s.name}: no solo for the tested layer`);
  }
  // built under ONE name (D120): the key and every retrieval hash come from it
  assert.equal(keys.size, 1, `the cards span keys ${[...keys].join(', ')}`);
  assert.equal(bpms.size, 1, `the cards span tempos ${[...bpms].join(', ')}`);
  // every figure is used by exactly one card, and every card names a distinct one
  const figs = data.songs.map((s) => s.labFig);
  assert.equal(new Set(figs).size, figs.length, 'two cards test the same figure');
});

test('r42 the intro really is the tested layer alone — no kit, no other pitched voice', async () => {
  const { data } = load('audition/cells.html');
  for (const name of ['cl_cell_orig', 'cl_bass_oct8']) {
    const s = data.songs.find((x) => x.name === name);
    const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
    const haps = hapsByLabel(ev, 0, s.totalBars).get('p').haps;
    const intro = haps.filter((h) => Number(h.whole?.begin ?? h.part.begin) < 8);
    // the only other thing allowed in the intro is the one-shot that leads INTO
    // the first section (the r41 seam impact), which is a lead-in, not a layer
    const counts = new Map();
    for (const h of intro) counts.set(h.value.s, (counts.get(h.value.s) ?? 0) + 1);
    const layers = [...counts.entries()].filter(([, n]) => n > 2);
    assert.equal(layers.length, 1, `${name}: the intro carries ${layers.map(([k, n]) => `${k} x${n}`).join(', ')}`);
    // r43 SECOND PASS — the struck VSCO banks. HIS NOTE: "is it just HQ? ...
    // however with HQ off it sounds bad. it's still the same amount of wet".
    // HQ ON was strings-sections.sfz at ampeg_release=0.7 under a sixteenth-note
    // cell; HQ OFF was the GM soundfont. Both tiers now play the same spiccato
    // samples. Voice-only: all 23 cards are byte-identical on the (time, midi)
    // multiset, which is the rule for touching judged material.
    assert.equal(layers[0][0], name.startsWith('cl_bass') ? 'vsco_bass_spic' : 'vsco_cello_spic');
    // and the rest of the song is a build, not the same texture
    const last = haps.filter((h) => Number(h.whole?.begin ?? h.part.begin) >= s.totalBars - 8);
    assert.ok(new Set(last.map((h) => h.value.s)).size >= 6, `${name}: the last section adds nothing`);
  }
});
