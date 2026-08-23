// D35: the Pattern Atlas — generated feature records, sections, neighborhoods,
// and the hand-curated Undertale context axis.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ATLAS, ATLAS_SECTIONS, neighborhood, sectionOf, pickFrom } from '../src/lib/atlas.js';
import { ALL_PROGRESSIONS } from '../src/lib/progressions.js';
import { PROGRESSIONS_UNDERTALE } from '../src/lib/progressions-undertale.js';
import { FIGURATIONS_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { UNDERTALE_CONTEXT } from '../src/lib/undertale-context.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('D35: atlas.js is exactly what build-atlas.mjs produces (no hand edits)', () => {
  const before = readFileSync(join(ROOT, 'src/lib/atlas.js'), 'utf8');
  execFileSync('node', ['scripts/build-atlas.mjs'], { cwd: ROOT });
  assert.equal(readFileSync(join(ROOT, 'src/lib/atlas.js'), 'utf8'), before,
    'src/lib/atlas.js drifted from scripts/build-atlas.mjs — it is generated, do not hand-edit');
});

test('D35: every progression across all pools has a record, a section, and neighbors', () => {
  for (const name of Object.keys(ALL_PROGRESSIONS)) {
    const r = ATLAS.progressions[name];
    assert.ok(r, `${name} missing from the atlas`);
    assert.ok(r.vibe && r.vibe.family && r.vibe.rootMotion, `${name} has no vibe features`);
    assert.ok(ATLAS_SECTIONS.progressions[r.section]?.members.includes(name), `${name} not in its section`);
    assert.ok(r.neighbors.blend.length > 0 && !r.neighbors.blend.includes(name), `${name} bad blend neighbors`);
  }
  assert.equal(Object.keys(ATLAS.progressions).length, Object.keys(ALL_PROGRESSIONS).length);
});

test('D35: sections are real groupings, not one giant bucket', () => {
  for (const [kind, secs] of Object.entries(ATLAS_SECTIONS)) {
    const pools = new Map();
    for (const s of Object.values(secs)) {
      pools.set(s.pool, (pools.get(s.pool) ?? 0) + 1);
      assert.ok(s.members.length >= 1 && typeof s.label === 'string' && s.label.length > 0, `${kind}: bad section`);
    }
    for (const [pool, n] of pools) {
      const total = Object.values(secs).filter((s) => s.pool === pool).reduce((a, s) => a + s.members.length, 0);
      if (total >= 24) assert.ok(n >= 3 && n <= 15, `${kind}/${pool}: ${n} sections for ${total} entries`);
    }
  }
});

test('D35: the anti-copy-paste contract — retrieval returns a family', () => {
  const hood = neighborhood('progressions', 'ut_megalovania_p1', 'vibe');
  assert.ok(Array.isArray(hood) && hood.length >= 2, 'a neighborhood is plural');
  assert.ok(!hood.includes('ut_megalovania_p1'), 'an entry is not its own neighbor');
  // seeded pick is deterministic and stays inside the family
  assert.equal(pickFrom(hood, 42), pickFrom(hood, 42));
  assert.ok(hood.includes(pickFrom(hood, 42)));
  assert.throws(() => pickFrom([], 1));
});

test('D35: vibe features read the harmony honestly (Megalovania as ground truth)', () => {
  const v = ATLAS.progressions.ut_megalovania_p1.vibe;
  assert.equal(v.family, 'minor');
  assert.equal(v.rootMotion.step, 1); // the D-C-B-Bb lament walks entirely by step
  assert.equal(v.cadence, 'loop');
});

test('D35: context is curated, never invented — and the leitmotif axis works', () => {
  // every context key is a song the corpus actually references
  const songs = new Set(Object.values(PROGRESSIONS_UNDERTALE).map((e) => e.song));
  for (const e of Object.values(FIGURATIONS_UNDERTALE)) for (const s of e.songs) songs.add(s.replace(/ \(\d+\)$/, ''));
  for (const key of Object.keys(UNDERTALE_CONTEXT)) {
    assert.ok(songs.has(key), `context for unknown song "${key}"`);
  }
  // every undertale progression got its song's context merged
  for (const [name, e] of Object.entries(PROGRESSIONS_UNDERTALE)) {
    const r = ATLAS.progressions[name];
    if (UNDERTALE_CONTEXT[e.song]) {
      assert.equal(r.context.song, e.song, `${name} context not merged`);
    }
  }
  // motif families are similarity ground truth: Hopes and Dreams' context
  // neighbors stay inside the once-upon-a-time family / its own song
  const hop = Object.entries(PROGRESSIONS_UNDERTALE).find(([, e]) => e.song === 'Hopes and Dreams');
  if (hop) {
    const ns = ATLAS.progressions[hop[0]].neighbors.context;
    assert.ok(ns.length > 0);
    for (const n of ns) {
      const c = ATLAS.progressions[n].context;
      const own = ATLAS.progressions[hop[0]].context;
      const related = c.song === own.song || c.motifs.some((m) => own.motifs.includes(m))
        || (c.character && c.character === own.character) || (c.role && c.role === own.role);
      assert.ok(related, `${n} is a context neighbor of Hopes and Dreams with no documented relation`);
    }
  }
});

test('D35: uncurated songs stay honestly empty (empty beats invented)', () => {
  for (const [song, c] of Object.entries(UNDERTALE_CONTEXT)) {
    if (c.role === null) {
      assert.ok(/not curated/.test(c.notes ?? ''), `${song}: null role needs the not-curated note`);
      assert.equal(c.motifs.length, 0, `${song}: uncurated song must not claim motifs`);
    }
  }
});

test('D35: sectionOf and neighborhood throw on unknown entries', () => {
  assert.throws(() => sectionOf('progressions', 'nope'));
  assert.throws(() => neighborhood('figures', 'nope'));
  const s = sectionOf('figures', Object.keys(ATLAS.figures)[0]);
  assert.ok(s.id && s.label && s.members.length >= 1);
});
