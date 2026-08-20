// Harness acceptance tests (§5): (a) scoped edit passes, (b) leaky edit rejected,
// plus evaluator/metrics/lint invariants everything downstream leans on.
// (Acceptance (c) — must-constraint violation flagged — lives in test/assertions.test.js.)

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { containment } from '../src/harness/signature.js';
import { labelMetrics, harmonicRhythm, parseMeter } from '../src/harness/metrics.js';
import { lintSong } from '../src/harness/lint.js';
import { checkEdit, verifySong } from '../src/harness/index.js';

const fx = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const V0 = fx('toy_v0.strudel');

test('evaluator: labels, bindings, deps, cpm', async () => {
  const ev = await evaluateSong(V0);
  assert.deepEqual([...ev.labels.keys()].sort(), ['bass', 'hats', 'kick', 'lead', 'pads']);
  assert.deepEqual([...ev.bindings.keys()].sort(), ['chords', 'form', 'key']);
  assert.equal(ev.cpm, 30);
  assert.ok(ev.labelDeps.get('bass').has('chords'));
  assert.ok(ev.labelDeps.get('lead').has('key'));
  assert.ok(ev.labelDeps.get('lead').has('form'));
  assert.equal(ev.labelDeps.get('kick').size, 0);
});

test('evaluator: haps are onset-filtered, sorted, correct counts', async () => {
  const ev = await evaluateSong(V0);
  const haps = hapsByLabel(ev, 0, 8);
  assert.equal(haps.get('kick').haps.length, 32);   // bd*4 over 8 cycles
  assert.equal(haps.get('hats').haps.length, 64);   // hh*8 over 8 cycles
  assert.equal(haps.get('bass').haps.length, 24);   // 3 onsets/cycle
  assert.equal(haps.get('lead').haps.length, 16);   // masked to cycles 4-8, 4/cycle
  const lead = haps.get('lead').haps;
  assert.equal(lead[0].whole.begin.valueOf(), 4);   // mask B starts at cycle 4
  assert.equal(lead[0].value.note, 'C3');           // degree 0 of C:minor
});

test('evaluator: muted labels carry muted flag; duplicates warn', async () => {
  const src = `x: s("bd*4")\n_y: s("hh*8")\nx: s("bd*2")`;
  const ev = await evaluateSong(src);
  assert.equal(ev.labels.get('y').muted, true);
  assert.ok(ev.warnings.some((w) => w.includes('duplicate label "x"')));
  const haps = hapsByLabel(ev, 0, 1);
  assert.equal(haps.get('x').haps.length, 2); // last definition wins
});

test('metrics: density, span, syncopation (meter-derived), accent variance', async () => {
  const ev = await evaluateSong(V0);
  const haps = hapsByLabel(ev, 0, 8);
  const lead = labelMetrics(haps.get('lead').haps, { from: 0, to: 8, meter: '4/4' });
  assert.equal(lead.density, 2);            // 16 onsets / 8 cycles
  assert.equal(lead.registerSpan, 7);       // C3..G3 in C minor
  assert.equal(lead.syncopation, 0);        // on the quarter grid
  assert.ok(lead.accentVariance > 0);       // gains applied, not uniform
  const hats = labelMetrics(haps.get('hats').haps, { from: 0, to: 8, meter: '4/4' });
  assert.equal(hats.syncopation, 0.5);      // 8ths: half off the 4/4 beat grid
  assert.equal(hats.onsetVariety, 0);       // verbatim loop
});

test('metrics: syncopation grid derives from meter, not 4/4', async () => {
  const src = `beat: s("bd*7")`; // 7 equal onsets per cycle
  const ev = await evaluateSong(src);
  const haps = hapsByLabel(ev, 0, 2);
  const m78 = labelMetrics(haps.get('beat').haps, { from: 0, to: 2, meter: '7/8' });
  assert.equal(m78.syncopation, 0);        // perfectly on the 7-grid
  const m44 = labelMetrics(haps.get('beat').haps, { from: 0, to: 2, meter: '4/4' });
  assert.ok(m44.syncopation > 0.5);        // same onsets are OFF a 4-grid
  assert.throws(() => parseMeter('waltz'));
});

test('metrics: harmonic rhythm groups sonorities, ignores restatements', async () => {
  const ev = await evaluateSong(V0);
  const haps = hapsByLabel(ev, 0, 8);
  const hr = harmonicRhythm(haps.get('pads').haps, { from: 0, to: 8 });
  assert.equal(hr.sonorities, 8);
  // <Cm7 Fm7 Cm7 G7> twice: establishment + 3 changes per pass + change back to Cm7
  assert.equal(hr.changes, 8);
});

test('ACCEPTANCE (a): scoped edit passes containment', async () => {
  const res = await checkEdit(V0, fx('toy_v1_scoped.strudel'), { allowLabels: ['hats'], cycles: 8 });
  assert.equal(res.ok, true, JSON.stringify(res.containment?.leaks));
  assert.deepEqual(res.containment.changed, ['hats']);
  assert.ok(res.after.metrics.hats.density > res.before.metrics.hats.density);
  const hatLine = res.containment.changelog.find((l) => l.startsWith('hats:'));
  assert.match(hatLine, /timing changed/);
});

test('ACCEPTANCE (b): leaky edit is REJECTED with named leak', async () => {
  const res = await checkEdit(V0, fx('toy_v1_leaky.strudel'), { allowLabels: ['hats'], cycles: 8 });
  assert.equal(res.ok, false);
  assert.equal(res.stage, 'containment');
  assert.equal(res.containment.leaks.length, 1);
  assert.equal(res.containment.leaks[0].label, 'bass');
  assert.match(res.containment.leaks[0].reason, /timing changed/);
});

test('aspect scoping: sound-only edit passes with allowAspects, pitch/time locked', async () => {
  const ok = await checkEdit(V0, fx('toy_v1_sound.strudel'), {
    allowLabels: ['bass'], allowAspects: ['sound'], cycles: 8,
  });
  assert.equal(ok.ok, true, JSON.stringify(ok.containment?.leaks));
  // the leaky file changes bass TIMING — must fail under sound-only scope even though bass is allowed
  const bad = await checkEdit(V0, fx('toy_v1_leaky.strudel'), {
    allowLabels: ['bass', 'hats'], allowAspects: ['sound'], cycles: 8,
  });
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /forbidden aspect/);
});

test('binding expansion: editing hoisted chords legitimizes bass+pads, nothing else', async () => {
  const res = await checkEdit(V0, fx('toy_v1_keychange.strudel'), { allowBindings: ['chords'], cycles: 8 });
  assert.equal(res.ok, true, JSON.stringify(res.containment?.leaks));
  assert.deepEqual([...res.containment.allowed].sort(), ['bass', 'pads']);
  // and WITHOUT the binding allowance the same edit is rejected
  const bad = await checkEdit(V0, fx('toy_v1_keychange.strudel'), { allowLabels: ['hats'], cycles: 8 });
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.containment.leaks.map((l) => l.label).sort(), ['bass', 'pads']);
});

test('mute flip on non-allowed label is a leak', async () => {
  const muted = V0.replace('bass: chords', '_bass: chords');
  const res = await checkEdit(V0, muted, { allowLabels: ['hats'], cycles: 8 });
  assert.equal(res.ok, false);
  assert.equal(res.containment.leaks[0].label, 'bass');
});

test('lint: unknown function is an error; real functions are not', () => {
  const bad = lintSong(`x: s("bd").reverberate(3)`);
  assert.equal(bad.errors.length, 1);
  assert.match(bad.errors[0].msg, /unknown function "reverberate"/);
  const good = lintSong(V0);
  assert.equal(good.errors.length, 0);
});

test('lint: repeated single-use effect warns (§3.6 gotcha)', () => {
  const res = lintSong(`x: s("bd").lpf(100).distort(2).lpf(800)`);
  assert.ok(res.warnings.some((w) => /\.lpf\(\) applied 2/.test(w.msg)));
});

test('checkEdit fails cleanly on a file that does not evaluate', async () => {
  const res = await checkEdit(V0, `x: s("bd").scale(`, { allowLabels: ['x'] });
  assert.equal(res.ok, false);
  assert.equal(res.stage, 'lint');
});

test('verifySong end-to-end shape', async () => {
  const res = await verifySong(V0, { cycles: 8 });
  assert.equal(res.evalOk, true);
  assert.equal(res.lint.errors.length, 0);
  assert.ok(res.labels.kick.metrics.onsets === 32);
});

test('aspect semantics: a pure timing change (swing) leaves pitch/sound/gain sequences intact', async () => {
  const a = `h: s("hh*8").gain(".9 .4 .7 .4 .9 .4 .7 .5")`;
  const b = `h: s("hh*8").gain(".9 .4 .7 .4 .9 .4 .7 .5").swingBy(.4, 4)`;
  const res = await checkEdit(a, b, { allowLabels: ['h'], allowAspects: ['time'], cycles: 4 });
  assert.equal(res.ok, true, JSON.stringify(res.containment?.leaks));
  const d = res.containment.diffs.find((x) => x.label === 'h');
  assert.equal(d.aspects.time, true);
  assert.equal(d.aspects.pitch, false);
  assert.equal(d.aspects.sound, false);
  assert.equal(d.aspects.gain, false);
});

// Regression tests for the adversarial review's confirmed false-PASS holes (D25).
test('REVIEW: sample-index (n) change cannot hide from aspect contracts', async () => {
  const res = await checkEdit(`lead: s("east*4").n("0 1 2 3")`, `lead: s("east*4").n("0 1 2 7")`,
    { allowLabels: ['lead'], allowAspects: ['gain'], cycles: 2 });
  assert.equal(res.ok, false);
  assert.match(res.reason, /forbidden aspect/);
});

test('REVIEW: added/removed layers cannot bypass aspect contracts or windows', async () => {
  const base = `kick: s("bd*4")\nlead: note("c3 e3 g3")`;
  const removed = await checkEdit(base, `kick: s("bd*4")`, { allowLabels: ['lead'], allowAspects: ['gain'], cycles: 4 });
  assert.equal(removed.ok, false);
  assert.match(removed.reason, /layer removed under an aspect contract/);
  const added = await checkEdit(`kick: s("bd*4")`, `kick: s("bd*4")\nriser: s("hh*8")`,
    { allowLabels: ['riser'], allowWindows: [[8, 16]], cycles: 16 });
  assert.equal(added.ok, false);
  assert.match(added.reason, /outside the allowed cycle window/);
});

test('REVIEW: anonymous $ labels carry their OWN statement deps', async () => {
  const ev = await evaluateSong(`let melody = "c3 e3 g3"\n$: note(melody)\n$: s("bd*4")`);
  assert.ok(ev.labelDeps.get('$1').has('melody'));
  assert.equal(ev.labelDeps.get('$2').size, 0);
});

test('REVIEW: lambda params do not credit labels with binding deps', async () => {
  const ev = await evaluateSong(`let chords = "Cm7"\nx: s("bd*4").fmap((chords) => chords)\ny: note("c3").scale(chords)`);
  assert.equal(ev.labelDeps.get('x').has('chords'), false);
  assert.equal(ev.labelDeps.get('y').has('chords'), true);
});

test('REVIEW: mute flip violates an aspect contract', async () => {
  const res = await checkEdit(`bass: note("c2*4")`, `_bass: note("c2*4")`,
    { allowLabels: ['bass'], allowAspects: ['pitch'], cycles: 2 });
  assert.equal(res.ok, false);
});
