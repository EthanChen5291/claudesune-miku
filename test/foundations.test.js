// D61: the foundational accompaniment canon (pack fnd_), its audition page,
// and the FIGURE_VERDICTS loop through import-verdicts.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { bindFigure } from '../src/binder/bind.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MET = new Set(['4/4', '3/4', '2/4', '2/2', '6/8', '12/8']);

test('canon shape: 29 entries, A6.1 discipline, aligned arrays', () => {
  const entries = Object.entries(FIGURATIONS_FOUNDATION);
  assert.equal(entries.length, 29);
  for (const [name, e] of entries) {
    assert.ok(name.startsWith('fnd_'), `${name} lacks the fnd_ prefix`);
    assert.equal(e.pack, 'foundation');
    assert.equal(e.provenance, 'canon');
    assert.equal(e.character, null, `${name}: character is earned by ear, never at authoring`);
    assert.equal(e.figure.length, e.onsets.length, `${name}: figure/onsets mismatch`);
    assert.equal(e.accents.length, e.onsets.length, `${name}: accents mismatch`);
    assert.ok(MET.has(e.meter_class), `${name}: unknown meter ${e.meter_class}`);
    assert.ok(e.octave >= 1 && e.octave <= 4, `${name}: octave ${e.octave} out of accompaniment range`);
    if (e.microtiming) assert.equal(e.microtiming.length, e.onsets.length, `${name}: microtiming mismatch`);
    // an unratified canon entry either awaits the ear or has been judged
    if (e.verdict == null) assert.equal(e.needsEar, true, `${name}: unjudged but not needsEar`);
  }
});

test('every canon entry binds over major and minor probe contexts', () => {
  for (const ctx of [
    { harmony: ['C', 'F', 'G7', 'C'], barsPerChord: 1, key: 'C:major' },
    { harmony: ['Cm', 'Ab', 'G7', 'Cm'], barsPerChord: 1, key: 'C:minor' },
  ]) {
    for (const [name, e] of Object.entries(FIGURATIONS_FOUNDATION)) {
      const bound = bindFigure(e, ctx, e.meter_class, { rhythmName: name });
      assert.ok(bound.expr && bound.expr.length > 10, `${name} bound to nothing`);
    }
  }
});

test('audition page builds with all 145 pattern×progression exprs green', () => {
  const log = execFileSync('node', ['scripts/audition-foundations.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(log, /5 progressions × 29 foundation patterns/);
  assert.match(log, /145\/145 patterns evaluated green/);
  assert.match(log, /parses clean/);
  // chips render client-side; the static page carries the DATA JSON — every
  // pattern appears once in `patterns` and once per progression in `exprs`
  const html = readFileSync(join(ROOT, 'audition/foundations.html'), 'utf8');
  assert.ok((html.match(/fnd_/g) ?? []).length >= 29 + 5 * 29, 'page DATA is missing patterns or exprs');
});

test('foundations export round-trips: FIGURE_VERDICTS land and overlay ratifies', () => {
  const out = join(ROOT, 'src/lib/verdicts.js');
  const had = existsSync(out) ? readFileSync(out, 'utf8') : null;
  const fixture = join(ROOT, 'test', '.fnd-verdicts-fixture.json');
  const sig = (n) => FIGURATIONS_FOUNDATION[n].figure.join(' ');
  const probe = () => JSON.parse(execFileSync('node', ['--input-type=module', '-e',
    `import { FIGURATIONS_FOUNDATION as F } from '${join(ROOT, 'src/lib/figurations-foundation.js')}';` +
    'console.log(JSON.stringify({ a: F.fnd_alberti_8ths, b: F.fnd_boogie_shuffle, w: F.fnd_waltz_bass }))',
  ], { cwd: ROOT, encoding: 'utf8' }));
  try {
    writeFileSync(fixture, JSON.stringify({
      figurations: true, page: 'foundations', generated: '2026-08-25T00:00:00Z',
      verdicts: { fnd_alberti_8ths: 'keep', fnd_boogie_shuffle: 'kill' },
      notes: { fnd_waltz_bass: 'sways nicely' },
      judged: {
        fnd_alberti_8ths: sig('fnd_alberti_8ths'),
        fnd_boogie_shuffle: sig('fnd_boogie_shuffle'),
        fnd_waltz_bass: 'R WRONG TOKENS', // deliberately stale for the note only
      },
    }));
    const log = execFileSync('node', ['scripts/import-verdicts.mjs', fixture], { cwd: ROOT, encoding: 'utf8' });
    assert.match(log, /figuration verdicts: 2 total \(2 new\)/);
    const emitted = readFileSync(out, 'utf8');
    assert.match(emitted, /FIGURE_VERDICTS/);
    assert.match(emitted, /fnd_alberti_8ths: \{ verdict: 'keep'/);
    assert.match(emitted, /FIGURE_NOTES/);
    // a fresh process sees the overlay applied
    const seen = probe();
    assert.equal(seen.a.ratified, true);
    assert.equal(seen.a.needsEar, false);
    assert.equal(seen.b.ratified, false);
    assert.equal(seen.b.verdict, 'kill');
    assert.equal(seen.b.needsEar, false);
    // no verdict on the waltz — the stale-judged note must not ratify anything
    assert.equal(seen.w.ratified, false);
    assert.equal(seen.w.needsEar, true);
  } finally {
    rmSync(fixture, { force: true });
    if (had == null) rmSync(out, { force: true }); else writeFileSync(out, had);
  }
});

test('a stale figure snapshot is refused by the overlay', () => {
  const out = join(ROOT, 'src/lib/verdicts.js');
  const had = existsSync(out) ? readFileSync(out, 'utf8') : null;
  const fixture = join(ROOT, 'test', '.fnd-stale-fixture.json');
  try {
    writeFileSync(fixture, JSON.stringify({
      figurations: true, generated: '2026-08-25T00:00:00Z',
      verdicts: { fnd_alberti_8ths: 'keep' },
      judged: { fnd_alberti_8ths: 'R 5 3 5 TOKENS THAT CHANGED' },
    }));
    execFileSync('node', ['scripts/import-verdicts.mjs', fixture], { cwd: ROOT });
    const seen = JSON.parse(execFileSync('node', ['--input-type=module', '-e',
      `import { FIGURATIONS_FOUNDATION as F } from '${join(ROOT, 'src/lib/figurations-foundation.js')}';` +
      'console.log(JSON.stringify(F.fnd_alberti_8ths))',
    ], { cwd: ROOT, encoding: 'utf8' }));
    assert.equal(seen.verdictStale, true);
    assert.equal(seen.ratified, false);
    assert.equal(seen.needsEar, true, 'a stale verdict must leave the entry awaiting the ear');
  } finally {
    rmSync(fixture, { force: true });
    if (had == null) rmSync(out, { force: true }); else writeFileSync(out, had);
  }
});
