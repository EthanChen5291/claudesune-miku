// D63: the vibe-prompted song generator and the drum confidence gate.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('songs page: 10 prompts build, every expr green, structure varied', () => {
  const log = execFileSync('node', ['scripts/audition-songs.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(log, /11 vibe-prompted songs/);
  assert.match(log, /(\d+)\/\1 exprs evaluated green/);
  assert.match(log, /parses clean/);
  // the genocide transform: sad shop must be slow and drum-free
  const sad = log.split('\n').find((l) => l.includes('vs_sad_shop'));
  assert.ok(sad && !sad.includes('drums:'), 'sad shop must strip drums');
  assert.ok(Number(sad.match(/@(\d+)/)[1]) < 80, 'sad shop must be slow');
  // his named vibes are present
  for (const n of ['vs_happy_shop', 'vs_x_construction', 'vs_tense_fight']) assert.ok(log.includes(n));
  // tone travel fires somewhere
  assert.match(log, /travel/);
  // the vouched drums ride with his notes quoted; the buildup/drop song exists
  assert.match(log, /dp_residual_stress_study \(harvested — his note: “rising tension/);
  const drop = log.split('\n').find((l) => l.includes('vs_excited_festival_drop'));
  assert.ok(drop && drop.includes('BUILDUP+DROP'), 'the buildup/drop song is missing');
  assert.ok(drop.includes('dp_b_52_s buildup bars 1-4'));
  // articulation is stated per song: damper on the wet vibes, staccato on the crisp
  assert.match(log, /vs_calm_water:.*legato \+ damper pedal/);
  assert.match(log, /vs_goofy_kitchen:.*staccato/);
  // determinism: a rebuild produces the identical page
  const first = readFileSync(join(ROOT, 'audition/songs.html'), 'utf8');
  execFileSync('node', ['scripts/audition-songs.mjs'], { cwd: ROOT });
  assert.equal(readFileSync(join(ROOT, 'audition/songs.html'), 'utf8'), first);
});

test('drums page: shortlist builds; taiko and 8-bit kits are on it', () => {
  const log = execFileSync('node', ['scripts/audition-drums.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(log, /\d+ shortlisted patterns \(7 taiko, \d 8-bit/);
  assert.match(log, /(\d+)\/\1 patterns evaluated green/);
});

test('drums export round-trips into DRUM_VERDICTS/DRUM_NOTES', () => {
  const out = join(ROOT, 'src/lib/verdicts.js');
  const had = existsSync(out) ? readFileSync(out, 'utf8') : null;
  const fixture = join(ROOT, 'test', '.drum-verdicts-fixture.json');
  try {
    const { DRUM_PATTERN_FORMS } = JSON.parse(execFileSync('node', ['--input-type=module', '-e',
      `import { DRUM_PATTERN_FORMS } from '${join(ROOT, 'src/lib/rhythms-drum-patterns.js')}';` +
      'console.log(JSON.stringify({ DRUM_PATTERN_FORMS }))'], { cwd: ROOT, encoding: 'utf8' }));
    const name = Object.keys(DRUM_PATTERN_FORMS)[0];
    writeFileSync(fixture, JSON.stringify({
      drums: true, page: 'drums', generated: '2026-08-25T00:00:00Z',
      verdicts: { [name]: 'keep' },
      notes: { [name]: 'chill beach vibe', dp_not_a_real_pattern: 'stale' },
    }));
    const log = execFileSync('node', ['scripts/import-verdicts.mjs', fixture], { cwd: ROOT, encoding: 'utf8' });
    assert.match(log, /drum gate: \d+ verdicts, \d+ vibe notes/); // merges over prior sessions
    assert.match(log, /STALE: "dp_not_a_real_pattern \(note\)"/);
    const emitted = readFileSync(out, 'utf8');
    assert.match(emitted, /DRUM_VERDICTS/);
    assert.match(emitted, new RegExp(`${name}: \\{ verdict: 'keep'`));
    assert.match(emitted, /chill beach vibe/);
  } finally {
    rmSync(fixture, { force: true });
    if (had == null) rmSync(out, { force: true }); else writeFileSync(out, had);
  }
});
