// r33 — the verification catalog (audition/catalog.html).
//
// His ask: "take everything you like ... and ask me to verify them one by one
// so i can label what they contribute and which ones sound good together."
// The candidates are PRE-ratification material: nothing here may reach a
// retrieval pool until his labels come back and entries are authored by hand
// into the proper library (D95). These tests pin that boundary.

import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { CATALOG_CANDIDATES, CATALOG_META } from '../src/lib/catalog-candidates.js';

const KINDS = new Set(['degrees', 'note_mini', 'stack_mini', 'rhythm_onsets', 'library_rows', 'figure']);
const TYPES = new Set(['harmony', 'rhythm', 'accomp_pattern', 'melody_pattern', 'instrument_for_vibe', 'instrument_combo', 'device']);

test('r33: catalog candidates are well-formed and keyed by their own id', () => {
  const entries = Object.entries(CATALOG_CANDIDATES);
  assert.ok(entries.length >= 50, `only ${entries.length} candidates`);
  for (const [key, c] of entries) {
    assert.equal(c.id, key, `${key}: key != id`);
    assert.ok(TYPES.has(c.type), `${key}: unknown type ${c.type}`);
    assert.ok(KINDS.has(c.render?.kind), `${key}: unknown render kind ${c.render?.kind}`);
    assert.ok(c.source && c.why, `${key}: missing provenance or why`);
    assert.ok(typeof c.his_prior_words === 'string', `${key}: his_prior_words must be a string ('' if none)`);
    if (c.key_tonic != null) {
      // drives the pair-combo transposition on the page — a malformed tonic
      // would mistranspose every combo the candidate joins
      assert.match(c.key_tonic, /^[A-G][#b]?$/, `${key}: bad key_tonic "${c.key_tonic}"`);
    }
    for (const p of c.pairs_with ?? []) {
      assert.notEqual(p, key, `${key}: pairs with itself`);
    }
  }
  assert.equal(CATALOG_META.round, 'r33');
});

test('r33: NOTHING in the engine imports the catalog — labels precede promotion (D95)', () => {
  // The only legal consumer is scripts/audition-catalog.mjs (the page builder)
  // and this test. A src/ or generator import would put unratified material a
  // hash-rotation away from judged songs.
  const offenders = [];
  const scan = (dir) => {
    for (const f of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!/\.(js|mjs)$/.test(f)) continue;
      const path = `${dir}/${f}`;
      if (path === 'src/lib/catalog-candidates.js') continue;
      const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
      if (src.includes('catalog-candidates')) offenders.push(path);
    }
  };
  scan('src/lib');
  scan('src/binder');
  scan('src/harness');
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  assert.ok(!gen.includes('catalog-candidates'), 'the SONG GENERATOR imports the catalog');
  assert.deepEqual(offenders, [], `engine files import the catalog: ${offenders.join(', ')}`);
});

test('r33: the catalog page is built and every candidate carries verified code', () => {
  const html = readFileSync(new URL('../audition/catalog.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  assert.ok(data.candidates.length >= 50, `page carries ${data.candidates.length}`);
  for (const c of data.candidates) {
    assert.ok(c.code && c.code.includes('setcpm('), `${c.id}: no playable code`);
  }
  // his-own-words candidates lead the queue (they are the most valuable labels)
  const firstTen = data.candidates.slice(0, 10);
  assert.ok(firstTen.every((c) => c.his), 'the queue must open with his-own-words candidates');
});
