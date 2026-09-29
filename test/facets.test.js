// D53: taste recorded per FACET rather than per card.
//
// The contract these defend is that the ear informs the counted model without
// replacing it, and that a verdict on one facet never leaks into another. Both
// halves of that were real bugs caught during the build, not hypotheticals.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { acquireVerdictsLock, releaseVerdictsLock } from './_verdicts-lock.mjs';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EAR_COUNT, FACET_KINDS, pairVotes, chordVotes, foldVotes, earStats, explainEar, textureRanking,
} from '../src/lib/facets.js';
import { FACET_VERDICTS } from '../src/lib/facet-verdicts.js';
import { FACET_SEEDS } from '../src/lib/facet-seeds.js';
import { rootProbs, qualityProbs, degreeAttested, DEGREES } from '../src/lib/harmony-prior.js';
import { HARMONY_MODEL } from '../src/lib/harmony-model.js';
import { OPS } from '../src/lib/harmony-ops.js';
import { parseDegrees, ALL_PROGRESSIONS } from '../src/lib/progressions.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const sums = (m) => [...m.values()].reduce((a, b) => a + b, 0);

test('D53: the generated facet file is exactly what the importer produces', () => {
  const before = readFileSync(join(ROOT, 'src/lib/facet-verdicts.js'), 'utf8');
  execFileSync('node', ['scripts/import-verdicts.mjs', '--facets'], { cwd: ROOT });
  const after = readFileSync(join(ROOT, 'src/lib/facet-verdicts.js'), 'utf8');
  assert.equal(before, after, 'src/lib/facet-verdicts.js has been hand-edited — put it in facet-seeds.js instead');
});

test('D53: hand-written seeds survive an import that never mentions them', () => {
  // The failure this guards: an export from a session where Ethan only worked
  // the pairs tab carries empty texture and cadence bags. A replace would wipe
  // everything he had said before, including the notes that started all this.
  for (const [key, seed] of Object.entries(FACET_SEEDS.pairs)) {
    assert.ok(FACET_VERDICTS.pairs[key], `seeded pair ${key} did not survive into the generated file`);
    assert.equal(FACET_VERDICTS.pairs[key].verdict, seed.verdict);
  }
  for (const key of Object.keys(FACET_SEEDS.chords)) {
    assert.ok(FACET_VERDICTS.chords[key], `seeded chord ${key} did not survive`);
  }
  assert.ok(FACET_KINDS.includes('pair') && FACET_KINDS.includes('wrap'));
});

test('D54: the importer still routes a JUDGE export, and splits it by pattern', () => {
  // A REGRESSION TEST FOR A BUG I SHIPPED. Adding the facets branch to
  // import-verdicts.mjs left the judge branch nested inside the `--facets`
  // block, AFTER a process.exit(0) — dead code referencing a variable that was
  // no longer in scope. The judge import path was completely broken and nothing
  // noticed, because every test exercised the library and none exercised the
  // script's routing.
  const fixture = join(tmpdir(), `judge-fixture-${process.pid}.json`);
  const out = join(ROOT, 'src/lib/judgments.js');
  const had = existsSync(out) ? readFileSync(out, 'utf8') : null;
  writeFileSync(fixture, JSON.stringify({
    page: 'judge',
    generated: '2026-08-24T18:00:00.000Z',
    answers: {
      t0: { type: 'ab', value: 'A', asks: 'q', a: 'varied', b: 'generated', pattern: 'block', heard: ['block', 'arp'] },
      t1: { type: 'ab', value: 'depends', asks: 'q', a: 'varied', b: 'generated', pattern: 'arp', heard: ['block', 'arp'] },
    },
    strayNotes: { t9: 'a sentence typed on a trial that was skipped' },
  }));
  try {
    const log = execFileSync('node', ['scripts/import-verdicts.mjs', fixture], { cwd: ROOT, encoding: 'utf8' });
    assert.match(log, /answers from the judging page/, 'the judge branch is unreachable again');
    assert.match(log, /split by the pattern that was playing/, 'no per-pattern breakdown');
    assert.match(log, /answered "depends on the pattern"/);
    assert.match(log, /patterns auditioned per trial/);
    assert.match(log, /skipped rather than answered/, 'stray notes were dropped');
    const written = readFileSync(out, 'utf8');
    assert.match(written, /STRAY_NOTES/, 'stray notes never reached the generated file');
    assert.match(written, /JUDGMENTS/);
  } finally {
    rmSync(fixture, { force: true });
    if (had == null) rmSync(out, { force: true }); else writeFileSync(out, had);
  }
});

test('D53: a liked transition moves the INNER table and not the WRAP table', () => {
  // THE BUG THIS EXISTS FOR. The minor wrap row out of the tonic holds 57
  // observations against the inner row's 287, so folding Ethan's two Cm->Bm
  // votes into both tables took P(0->11) as a CADENCE from 0.07% to 19.8% —
  // second-likeliest ending in the family, off a side note about a transition.
  const on = { family: 'minor', home: 0 };
  const off = { ...on, ear: false };
  const innerOn = rootProbs('inner', 0, on).get(11);
  const innerOff = rootProbs('inner', 0, off).get(11);
  assert.ok(innerOn > innerOff * 1.5, `the ear did not reach the inner table (${innerOff} -> ${innerOn})`);
  assert.ok(innerOn < 0.15, `the ear swamped the inner table (${innerOn})`);
  assert.equal(rootProbs('wrap', 0, on).get(11), rootProbs('wrap', 0, off).get(11),
    'a pair verdict leaked into the cadence table');
});

test('D53: `ear: false` reproduces the pre-D53 model exactly', () => {
  // Without this the overlay is unfalsifiable: there would be no way to ask what
  // the corpus alone thinks, and no A/B to run on the page.
  for (const family of ['major', 'minor', 'modal']) {
    for (const table of ['inner', 'wrap']) {
      for (const from of DEGREES) {
        const fam = HARMONY_MODEL.families[family];
        const raw = fam[table][from];
        if (!raw) continue;
        const p = rootProbs(table, from, { family, ear: false });
        // the un-eared blend must be a pure function of the counts
        const total = Object.values(raw).reduce((a, b) => a + b, 0);
        if (!total) continue;
        assert.ok(Math.abs(sums(p) - 1) < 1e-9, `${family}/${table}/${from} does not sum to 1`);
        assert.ok(p.get(11) >= 0);
      }
    }
  }
  // and the eared version is still a distribution
  for (const family of ['major', 'minor', 'modal']) {
    assert.ok(Math.abs(sums(rootProbs('inner', 0, { family })) - 1) < 1e-9);
    assert.ok(Math.abs(sums(qualityProbs(0, { family })) - 1) < 1e-9);
  }
});

test('D53: a dislike damps a move but never vetoes it', () => {
  // A veto is a different mechanism with different failure modes — it makes a
  // move unreachable forever on one click. Backoff guarantees a floor; the fold
  // must not be able to punch through it.
  const row = { 0: 100, 5: 50, 7: 25 };
  const votes = new Map([[5, { good: 0, bad: 3 }]]);
  const out = foldVotes(row, votes, DEGREES);
  assert.equal(out[5], 50, 'a dislike must not subtract observations');
  assert.ok(out[0] > 100 && out[7] > 25, 'the dislike mass should go to what the corpus does play');
  const shareBefore = 50 / 175;
  const shareAfter = out[5] / Object.values(out).reduce((a, b) => a + b, 0);
  assert.ok(shareAfter < shareBefore, 'a dislike must lower the share');
  assert.ok(shareAfter > 0, 'a dislike must not zero the move');
  // and a dislike may never promote a destination the corpus never plays
  assert.equal(out[6], undefined, 'the fold invented a destination out of a dislike');
});

test('D53: a good vote is worth exactly EAR_COUNT observations', () => {
  const row = { 0: 100, 5: 50 };
  const out = foldVotes(row, new Map([[7, { good: 1, bad: 0 }]]), DEGREES);
  assert.equal(out[7], EAR_COUNT);
  const two = foldVotes(row, new Map([[7, { good: 2, bad: 0 }]]), DEGREES);
  assert.equal(two[7], 2 * EAR_COUNT);
  // untouched rows come back byte-identical, so no-verdict costs nothing
  assert.equal(foldVotes(row, new Map(), DEGREES), row);
});

test('D53: a verdict in one family never moves another', () => {
  // Pair votes on record: minor|0>11, and (D73) major|2>5 — "I especially
  // like the F^7 from D". Modal carries only a chord vote, which cannot
  // move root motion. So: modal never moves, and major moves ONLY out of
  // degree 2, the row its own vote sits on (folding renormalizes that row,
  // so every 2->d cell may shift — but no other row may).
  for (const family of ['major', 'modal']) {
    for (const from of DEGREES) {
      if (family === 'major' && from === 2) continue;
      const on = rootProbs('inner', from, { family });
      const off = rootProbs('inner', from, { family, ear: false });
      for (const d of DEGREES) {
        assert.equal(on.get(d), off.get(d), `${family}: degree ${from}->${d} moved with no vote on that row`);
      }
    }
  }
  // and the voted row moves TOWARD the named target, not just somewhere
  const on2 = rootProbs('inner', 2, { family: 'major' });
  const off2 = rootProbs('inner', 2, { family: 'major', ear: false });
  assert.ok(on2.get(5) > off2.get(5), 'the D73 major|2>5 vote should lift 2->5');
});

test('D53: pairVotes and chordVotes read only the bag they are asked for', () => {
  // The two bags are keyed the same way but hold different claims, so a lookup
  // must see only its own. `minor|0>11` is an inner transition; `minor|7>0` is a
  // cadence. Asking the wrap table about degree 0 must not surface the pair.
  assert.equal(pairVotes(0, 'minor', 'wrap').size, 0, 'a pair verdict leaked into the wrap bag');
  assert.ok(pairVotes(7, 'minor', 'wrap').has(0), 'the seeded V->i cadence is not on the wrap table');
  assert.equal(pairVotes(7, 'minor', 'inner').size, 0, 'a wrap verdict leaked into the inner bag');
  const inner = pairVotes(0, 'minor', 'inner');
  assert.ok(inner.has(11), 'the seeded Cm->Bm vote is not visible on the inner table');
  assert.equal(inner.get(11).good, 2, 'the two agreeing chord colours should weigh the motion at 2');
  assert.equal(pairVotes(0, 'major', 'inner').size, 0);
  assert.ok(chordVotes(11, 'minor').has('m'));
  assert.equal(chordVotes(11, 'major').size, 0);
});

test('D53: a degree the ear vouched for is always reachable by an operator', () => {
  // degreeAttested() is the one hard gate every operator passes through, so a
  // chord Ethan has approved must never fail it — that would be the model
  // telling him he did not hear what he heard.
  //
  // NOTE ON WHAT THIS CURRENTLY PROVES. Every degree is attested in every family
  // in the present corpus (the thinnest, degree 6 in major, still has 6
  // observations), so the ear branch is dormant and this test is an invariant
  // rather than a demonstration. It becomes load-bearing the moment a vote lands
  // on a degree a family has never played, which is exactly when it would
  // otherwise fail silently.
  let checked = 0;
  for (const family of ['major', 'minor', 'modal']) {
    for (const d of DEGREES) {
      if (!chordVotes(d, family).size) continue;
      checked++;
      assert.equal(degreeAttested(d, { family, home: 0 }), true,
        `${family} degree ${d} has an ear verdict but no operator can reach it`);
    }
  }
  assert.ok(checked > 0, 'no chord verdicts on record to check');
  // and turning the ear off must not make a corpus-attested degree vanish
  assert.equal(degreeAttested(11, { family: 'minor', home: 0, ear: false }), true);
});

test('D53: earStats counts both record shapes and never hides how thin it is', () => {
  const s = earStats();
  assert.ok(s.pairs.good >= 1);
  assert.equal(typeof s.textures.good, 'number', 'the aggregate {good,bad} shape must be countable');
  const lines = explainEar();
  assert.ok(lines.some((l) => /confidence/.test(l)), 'explainEar must always state its confidence');
  assert.ok(lines.some((l) => l.includes(String(EAR_COUNT))), 'explainEar must say what a vote is worth');
  for (const t of textureRanking()) assert.ok(t.share > 0 && t.share < 1, 'Laplace floor missing: one vote read as certainty');
});

test('D53: cadential_sus puts the suspension only where something resolves it', () => {
  // `suspend` treats every slot as equally suspendable, which is how a sus ends
  // up floating mid-loop doing nothing. A suspension is a delayed arrival, so
  // every site must be immediately followed by the triad on the same root.
  const cases = ['0:m 8 10 3', '0 5 7 9:m', '0:m 5:m 10 7', '0:m 10 8 7'];
  let seen = 0;
  for (const degrees of cases) {
    const cycle = parseDegrees(degrees);
    const ctx = { family: /^0:m/.test(degrees) ? 'minor' : 'major', home: 0 };
    const sites = OPS.cadential_sus.sites(cycle, ctx);
    assert.ok(sites.length > 0, `${degrees}: no cadential site at all`);
    for (const s of sites) {
      seen++;
      const out = cycle.map((c, i) => (i === s.slot ? { ...c, ...s.to } : c));
      const next = out[(s.slot + 1) % out.length];
      assert.match(s.to.quality, /sus/);
      assert.equal(next.semis, s.to.semis, `${degrees}: sus at ${s.slot} resolves to a different root`);
      assert.ok(!/sus/.test(next.quality), `${degrees}: sus resolving into a sus resolves nothing`);
      assert.ok(s.slot >= cycle.length - 2, `${degrees}: slot ${s.slot} is not at the cadence`);
    }
  }
  assert.ok(seen >= 8);
  // and a two-chord loop has no room for the device
  assert.equal(OPS.cadential_sus.sites(parseDegrees('0:m 7'), { family: 'minor', home: 0 }).length, 0);
});

test('D53: no operator leaves a suspension unresolved, however they compose', () => {
  // cadential_sus put a sus at the wrap resolving into the tonic, and a plain
  // suspend then suspended the tonic: `Csus | Csus` across the seam, both sites
  // individually legal, the pair resolving nothing. The guard has to live in
  // legal() because it can only be checked AFTER every later edit.
  const ctx = { family: 'minor', home: 0 };
  const cycle = parseDegrees('0:m 8 10 0:sus');
  for (const [name, op] of Object.entries(OPS)) {
    for (const s of op.sites(cycle, ctx)) {
      const out = cycle.map((c, i) => (i === s.slot ? { ...c, ...s.to } : c));
      for (let i = 0; i < out.length; i++) {
        const a = out[i], b = out[(i + 1) % out.length];
        assert.ok(!(/sus/.test(a.quality) && /sus/.test(b.quality) && a.semis === b.semis),
          `${name} left ${a.semis}sus -> ${b.semis}sus unresolved`);
      }
    }
  }
});

test('D59: card notes ride the progressions import and survive a note-less re-import', () => {
  // Ethan asked for a comment box on every progressions.html card. The notes
  // land in verdicts.js as CARD_NOTES — and, like every other bag, they MERGE:
  // a session where he types nothing must not erase what an earlier one said.
  const name = Object.keys(ALL_PROGRESSIONS)[0];
  const fixture = join(tmpdir(), `prog-fixture-${process.pid}.json`);
  // r42: this rewrites the GENERATOR'S INPUT — hold the suite-wide lock
  acquireVerdictsLock();
  const out = join(ROOT, 'src/lib/verdicts.js');
  const had = existsSync(out) ? readFileSync(out, 'utf8') : null;
  try {
    writeFileSync(fixture, JSON.stringify({
      generated: '2026-08-25T18:00:00.000Z',
      verdicts: { [name]: 'keep' },
      notes: { [name]: 'the third chord drags a little', ghost_entry_xyz: 'stale note' },
    }));
    let log = execFileSync('node', ['scripts/import-verdicts.mjs', fixture, '--page', 'progressions'], { cwd: ROOT, encoding: 'utf8' });
    assert.match(log, /\d+ card notes carried \(1 new this import\)/);
    assert.match(log, /STALE: "ghost_entry_xyz \(note\)"/, 'a note on a renamed entry must be reported, not silently dropped');
    let written = readFileSync(out, 'utf8');
    assert.match(written, /CARD_NOTES/);
    assert.match(written, /the third chord drags a little/);
    assert.match(written, new RegExp(`${name}: \\{ note:`), 'the note is keyed by entry name');
    // second import: same verdict, NO notes — the earlier note must survive
    writeFileSync(fixture, JSON.stringify({ verdicts: { [name]: 'keep' }, notes: {} }));
    execFileSync('node', ['scripts/import-verdicts.mjs', fixture, '--page', 'progressions'], { cwd: ROOT });
    written = readFileSync(out, 'utf8');
    assert.match(written, /the third chord drags a little/, 'a note-less session erased an earlier note');
  } finally {
    rmSync(fixture, { force: true });
    if (had == null) rmSync(out, { force: true }); else writeFileSync(out, had);
    releaseVerdictsLock();
  }
});
