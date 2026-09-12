// r34 — the pop-pack labs page (audition/poplab.html).
//
// His ask: "just like variations.html, create another extensive variation lab
// testing hypothesis combos, variations, etc." from the Top MIDI Tracks Pack
// read-out. Same laws as the r33 labs (variation law + question law), one
// difference in shape: a card answers a MEASURED FINDING from the pack (its
// `finding` + `source_songs`) rather than a note of his. These tests pin the
// data shape, the D95 boundary (nothing in the engine imports the labs), and
// that the built page carries verified playable code for every variant.

import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { POP_LABS, POP_LAB_META } from '../src/lib/pop-labs.js';

const LANES = new Set(['prog', 'lh', 'melody', 'rhythm', 'form', 'mix', 'combo']);
const KINDS = new Set(['degrees', 'note_mini', 'stack_mini', 'rhythm_onsets', 'lab_stack']);

test('r34: pop labs are well-formed — every card is an experiment on a measured finding', () => {
  const entries = Object.entries(POP_LABS);
  assert.ok(entries.length >= 30, `only ${entries.length} lab cards`);
  for (const [key, c] of entries) {
    assert.equal(c.id, key, `${key}: key != id`);
    assert.ok(/^pl_[a-z0-9_]+$/.test(key), `${key}: id must be pl_<lane>_<name>`);
    assert.ok(LANES.has(c.lane), `${key}: unknown lane ${c.lane}`);
    assert.ok(Array.isArray(c.source_songs) && c.source_songs.length, `${key}: source_songs required — every card names the songs it was read from`);
    assert.ok(c.finding && c.finding.length > 40, `${key}: finding missing/too thin — the measured fact under test`);
    // the question law: a card without hypothesis+question is not an experiment
    assert.ok(c.hypothesis && c.hypothesis.length > 40, `${key}: hypothesis missing/too thin`);
    assert.ok(c.question && c.question.length > 40, `${key}: question missing/too thin`);
    assert.ok(Array.isArray(c.variants) && c.variants.length >= 2, `${key}: needs >=2 variants`);
    const vids = new Set();
    for (const v of c.variants) {
      assert.ok(v.id && !vids.has(v.id), `${key}/${v.id}: variant id missing or duplicate`);
      vids.add(v.id);
      assert.ok(v.name, `${key}/${v.id}: variant needs a mechanism name`);
      assert.ok(KINDS.has(v.render?.kind), `${key}/${v.id}: unknown render kind`);
      JSON.parse(v.render.spec); // throws on malformed spec
      // the D122 trap: `maj7` renders as a plain triad with the 7th silently gone
      assert.ok(!/maj7/.test(v.render.spec), `${key}/${v.id}: "maj7" in spec — write ^7`);
    }
  }
  assert.equal(POP_LAB_META.round, 'r34');
  assert.equal(POP_LAB_META.page, 'poplab-r34');
});

test('r34: NOTHING in the engine imports the pop labs (D95 boundary)', () => {
  const offenders = [];
  const scan = (dir) => {
    for (const f of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!/\.(js|mjs)$/.test(f)) continue;
      const path = `${dir}/${f}`;
      if (path === 'src/lib/pop-labs.js') continue;
      const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
      if (src.includes('pop-labs')) offenders.push(path);
    }
  };
  scan('src/lib');
  scan('src/binder');
  scan('src/harness');
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  assert.ok(!gen.includes('pop-labs'), 'the SONG GENERATOR imports the labs');
  assert.deepEqual(offenders, [], `engine files import the labs: ${offenders.join(', ')}`);
});

test('r34: the poplab page is built and every variant carries playable code', () => {
  const html = readFileSync(new URL('../audition/poplab.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  assert.ok(data.cards.length >= 30, `page carries ${data.cards.length}`);
  assert.equal(data.page, 'poplab-r34');
  const moduleIds = new Set(Object.keys(POP_LABS));
  for (const c of data.cards) {
    assert.ok(moduleIds.has(c.id), `${c.id}: on page but not in module`);
    assert.ok(c.variants.length >= 2, `${c.id}: page lost variants`);
    for (const v of c.variants) {
      assert.ok(v.code && v.code.includes('setcpm('), `${c.id}/${v.id}: no playable code`);
      assert.ok(v.haps > 0, `${c.id}/${v.id}: built with zero haps`);
    }
  }
  assert.equal(data.cards.length, moduleIds.size, 'page/module card count mismatch');
});

test('r34: the r33 variations page is not touched by the pop-lab build', () => {
  // the two builders are hand-kept clones; the judged r33 page must never
  // pick up a poplab id, and the poplab page must never carry an r33 id
  const v = readFileSync(new URL('../audition/variations.html', import.meta.url), 'utf8');
  assert.ok(!v.includes('poplab-r34'), 'variations.html carries the poplab page id');
  const p = readFileSync(new URL('../audition/poplab.html', import.meta.url), 'utf8');
  assert.ok(!p.includes("'variations-r33'"), 'poplab.html carries the r33 page id');
});
