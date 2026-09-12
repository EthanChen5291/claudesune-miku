// r33 — the variation-labs page (audition/variations.html).
//
// His ruling: "variation labs should be a different page" + the variation law
// ("actually creating another flow bound within the sample that works") + the
// question law ("ask targeted questions... so u can prove your hypothesis").
// These tests pin the data shape, the D95 boundary (nothing in the engine
// imports the labs), and that the built page carries verified playable code
// for every variant.

import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { VARIATION_LABS, VARIATION_META } from '../src/lib/variation-labs.js';

const LANES = new Set(['flow', 'perc', 'combo', 'align', 'mix', 'compose']);
const KINDS = new Set(['degrees', 'note_mini', 'stack_mini', 'rhythm_onsets', 'lab_stack']);

test('r33: variation labs are well-formed — every card is an experiment', () => {
  const entries = Object.entries(VARIATION_LABS);
  assert.ok(entries.length >= 30, `only ${entries.length} lab cards`);
  for (const [key, c] of entries) {
    assert.equal(c.id, key, `${key}: key != id`);
    assert.ok(LANES.has(c.lane), `${key}: unknown lane ${c.lane}`);
    // the question law: a card without hypothesis+question is not an experiment
    assert.ok(c.hypothesis && c.hypothesis.length > 40, `${key}: hypothesis missing/too thin`);
    assert.ok(c.question && c.question.length > 40, `${key}: question missing/too thin`);
    assert.ok(typeof c.his_words === 'string' && c.his_words.trim(), `${key}: his_words required — every lab answers something he said`);
    assert.ok(Array.isArray(c.variants) && c.variants.length >= 2, `${key}: needs >=2 variants`);
    const vids = new Set();
    for (const v of c.variants) {
      assert.ok(v.id && !vids.has(v.id), `${key}/${v.id}: variant id missing or duplicate`);
      vids.add(v.id);
      assert.ok(v.name, `${key}/${v.id}: variant needs a mechanism name`);
      assert.ok(KINDS.has(v.render?.kind), `${key}/${v.id}: unknown render kind`);
      JSON.parse(v.render.spec); // throws on malformed spec
    }
  }
  assert.equal(VARIATION_META.round, 'r33');
});

test('r33: NOTHING in the engine imports the variation labs (D95 boundary)', () => {
  const offenders = [];
  const scan = (dir) => {
    for (const f of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!/\.(js|mjs)$/.test(f)) continue;
      const path = `${dir}/${f}`;
      if (path === 'src/lib/variation-labs.js') continue;
      const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
      if (src.includes('variation-labs')) offenders.push(path);
    }
  };
  scan('src/lib');
  scan('src/binder');
  scan('src/harness');
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  assert.ok(!gen.includes('variation-labs'), 'the SONG GENERATOR imports the labs');
  assert.deepEqual(offenders, [], `engine files import the labs: ${offenders.join(', ')}`);
});

test('r33: the variations page is built and every variant carries playable code', () => {
  const html = readFileSync(new URL('../audition/variations.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  assert.ok(data.cards.length >= 30, `page carries ${data.cards.length}`);
  const moduleIds = new Set(Object.keys(VARIATION_LABS));
  for (const c of data.cards) {
    assert.ok(moduleIds.has(c.id), `${c.id}: on page but not in module`);
    assert.ok(c.variants.length >= 2, `${c.id}: page lost variants`);
    for (const v of c.variants) {
      assert.ok(v.code && v.code.includes('setcpm('), `${c.id}/${v.id}: no playable code`);
      assert.ok(v.haps > 0, `${c.id}/${v.id}: built with zero haps`);
    }
  }
  // every module card made it to the page (build rejects loudly, page must agree)
  assert.equal(data.cards.length, moduleIds.size, 'page/module card count mismatch');
});
