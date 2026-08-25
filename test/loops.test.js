// D56: what goes wrong when a chord list is played as a LOOP rather than read
// as a list. Every case here came from Ethan naming it by ear first.

import test from 'node:test';
import assert from 'node:assert/strict';
import { trimLoopWrap, loopWraps, loopIssues } from '../src/lib/loops.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { thirdClass } from '../src/lib/harmony-prior.js';
import { bindFigure } from '../src/binder/bind.js';
import { FIGURATIONS_UNDERTALE } from '../src/lib/figurations-undertale.js';

const cyc = (d) => parseDegrees(d);
const deg = (c) => c.map((x) => `${x.semis}${x.quality ? ':' + x.quality : ''}`).join(' ');

test('D56: a trailing chord that repeats the first is trimmed', () => {
  // The three Ethan flagged, by trial: t27 `Cm Ab Bb Cm`, t23 `... Gm Cm`,
  // t30 `G C Gsus Dsus G`.
  assert.equal(deg(trimLoopWrap(cyc('0:m 8 10 0:m'))), '0:m 8 10');
  assert.equal(deg(trimLoopWrap(cyc('0:m 8 5:m 7:m 0:m 8 7:m 0:m'))), '0:m 8 5:m 7:m 0:m 8 7:m');
  assert.equal(deg(trimLoopWrap(cyc('7 0 7:sus 2:sus 7'))), '7 0 7:sus 2:sus');
});

test('D56: a repeat that carries information is NOT trimmed', () => {
  // a colour change on the same root says something new
  assert.equal(deg(trimLoopWrap(cyc('0 0:^7 0:7 0:^7'))), '0 0:^7 0:7 0:^7');
  // a suspension resolving into the opening chord is the D53 cadential device
  const sus = cyc('0 4:m 9:m 0:sus');
  assert.equal(trimLoopWrap(sus).length, sus.length);
  assert.equal(thirdClass(sus.at(-1).quality), 'none');
  // and nothing that would leave fewer than two chords
  assert.equal(trimLoopWrap(cyc('0 0')).length, 2);
  assert.equal(trimLoopWrap(cyc('0:m 0:m')).length, 2);
});

test('D56: trimming is idempotent and never touches a distinct ending', () => {
  for (const [, e] of Object.entries(ALL_PROGRESSIONS)) {
    const once = trimLoopWrap(cyc(e.degrees));
    assert.deepEqual(trimLoopWrap(once), once, `${e.degrees} trims twice`);
    assert.ok(once.length >= 2);
    const last = once.at(-1);
    if (once.length > 2) {
      assert.ok(!(last.semis === once[0].semis && last.quality === once[0].quality),
        `${e.degrees} still ends where it starts`);
    }
  }
});

test('D56: the corpus is measured, not guessed at', () => {
  // 77 entries end on their own first root. Only the ones that add nothing are
  // the defect; the ruling had to be narrow or it would have eaten the cadences.
  let sameRoot = 0, trimmed = 0, colour = 0, susCadence = 0;
  for (const [, e] of Object.entries(ALL_PROGRESSIONS)) {
    const c = cyc(e.degrees);
    if (c.length < 3 || c.at(-1).semis !== c[0].semis) continue;
    sameRoot++;
    if (loopWraps(c)) trimmed++;
    else if (thirdClass(c.at(-1).quality) === 'none') susCadence++;
    else colour++;
  }
  assert.ok(sameRoot >= 70, `expected ~77 same-root endings, found ${sameRoot}`);
  assert.ok(trimmed >= 50 && trimmed < sameRoot, `${trimmed} trimmed of ${sameRoot} — the rule is too broad or too narrow`);
  assert.ok(colour + susCadence > 15, 'the rule swallowed the colour changes and the cadences');
});

test('D56: loopIssues names the odd-length problem separately', () => {
  // Ethan, t26 on `Cm Db^7 Cm Ab^7 Fm7`: "five chords - sounds awkward in timing
  // but the chords work". Reported, never auto-fixed — he proposed splitting it
  // into two phrases, which is not something a trim can decide.
  const five = loopIssues(cyc('0:m 1:^7 0:m 8:^7 5:m7'));
  assert.ok(five.some((s) => /odd loop/.test(s)), five.join(' | '));
  assert.ok(!five.some((s) => /repeats the first/.test(s)));
  const both = loopIssues(cyc('0:m 8 10 0:m'));
  assert.ok(both.some((s) => /repeats the first/.test(s)));
  assert.deepEqual(loopIssues(cyc('0:m 8 10 7')), []);
});

test('D56: a figuration states the chord\'s extension instead of flattening it', () => {
  // Ethan: "all the chord types besides block and wide pad kinda made some of
  // the chord progressions generic (like if it was a G7 it'd go back to root G)".
  // Every judge figuration draws from {R, 3, 5} only, so a G7, a G6 and a G came
  // out as the same notes.
  const ctx = { harmony: ['C', 'G7', 'Am7', 'F^7'], barsPerChord: 1, key: 'C:major' };
  for (const id of ['ut_arp_tem_shop', 'ut_oompah_dogsong', 'ut_ostinato_core']) {
    const off = bindFigure(FIGURATIONS_UNDERTALE[id], ctx, '4/4', { sound: 'piano' });
    const on = bindFigure(FIGURATIONS_UNDERTALE[id], ctx, '4/4', { sound: 'piano', stateExtensions: true });
    assert.equal(off.boundMeta.extendedChords, 0, 'the option must be opt-in');
    assert.equal(on.boundMeta.extendedChords, 3, `${id}: expected the three seventh chords to be coloured`);
    assert.notEqual(on.expr, off.expr);
    // the seventh must actually sound: F is the 7th of G7
    assert.match(on.expr, /F\d/, `${id} still never states the 7th of G7`);
  }
});

test('D56: a plain triad comes out a plain triad', () => {
  // The first version read the chord's tone SUPPLY, which for a plain C includes
  // the 9th — so it put a D in every triad. That is exactly the unasked-for
  // colouring D51 found in the killed progressions (keeps are 84% bare triads).
  const ctx = { harmony: ['C', 'F', 'G', 'Am'], barsPerChord: 1, key: 'C:major' };
  for (const id of ['ut_arp_tem_shop', 'ut_oompah_dogsong', 'ut_ostinato_core']) {
    const off = bindFigure(FIGURATIONS_UNDERTALE[id], ctx, '4/4', { sound: 'piano' });
    const on = bindFigure(FIGURATIONS_UNDERTALE[id], ctx, '4/4', { sound: 'piano', stateExtensions: true });
    assert.equal(on.boundMeta.extendedChords, 0, `${id} coloured a triad that has nothing to state`);
    assert.equal(on.expr, off.expr, `${id} changed a triad-only progression`);
  }
});

// ---------------------------------------------------------------------------
// D56 addendum: the wrap policy is meter-first (Ethan, 2026-08-25): "time
// signature + other general framework info is decided first before we pick
// chords. if it's even ... leans towards replacing it ... if it's odd ... it's
// not necessarily needed".
// ---------------------------------------------------------------------------
import { resolveLoopWrap, wrapReplacements } from '../src/lib/loops.js';

const QUALITIES = new Set(['', 'm', '7', 'm7', '^7', '6', 'm9', 'sus', 'o', 'o7']);
const CTX = { family: 'minor', home: 0, qualities: QUALITIES };

test('D56: even meter replaces the duplicate; odd meter trims it', () => {
  const t27 = cyc('0:m 8 10 0:m'); // "fourth Cm should be replaced" — his words
  const even = resolveLoopWrap(t27, { ...CTX, meter: '4/4' });
  assert.equal(even.action, 'replace');
  assert.equal(even.cycle.length, 4, 'even meter must keep the bar count');
  assert.notEqual(even.cycle.at(-1).semis, 0, 'the replacement recreated the doubled bar');
  const odd = resolveLoopWrap(t27, { ...CTX, meter: '3/4' });
  assert.equal(odd.action, 'trim');
  assert.equal(odd.cycle.length, 3);
  // a loop with a distinct ending is untouched in any meter
  for (const meter of ['4/4', '3/4', '7/8']) {
    assert.equal(resolveLoopWrap(cyc('0:m 8 10 7'), { ...CTX, meter }).action, 'none');
  }
});

test('D56: the replacement is legal, voiceable, deterministic, and never a neighbour clone', () => {
  for (const d of ['0:m 8 10 0:m', '0:m 8 5:m 7:m 0:m 8 7:m 0:m', '0 5 7 0', '7 0 7:sus 2:sus 7']) {
    const fam = /^0:m/.test(d) ? 'minor' : 'major';
    const r1 = resolveLoopWrap(cyc(d), { meter: '4/4', family: fam, home: 0, qualities: QUALITIES });
    const r2 = resolveLoopWrap(cyc(d), { meter: '4/4', family: fam, home: 0, qualities: QUALITIES });
    assert.deepEqual(r1.cycle, r2.cycle, `${d}: not deterministic`);
    if (r1.action !== 'replace') continue;
    const c = r1.cycle;
    const last = c.at(-1), prev = c.at(-2), first = c[0];
    assert.ok(QUALITIES.has(last.quality), `${d}: unvoiceable replacement quality "${last.quality}"`);
    assert.notEqual(last.semis, first.semis, `${d}: still doubles the first bar`);
    assert.ok(!(last.semis === prev.semis && last.quality === prev.quality), `${d}: cloned its neighbour`);
    assert.ok(r1.options.length >= 2, `${d}: no alternates for in-song variation`);
  }
});

test('D56: the parallel-flip device is in the palette even when the score buries it', () => {
  // t23's cycle. Ethan proposed ending it "...Gm G" — the raised-V flip. The
  // score is honest that flips are rare (2.84% in the corpus), so it ranks 6th
  // of 11, but a variation palette that omits the one move he asked for by name
  // is not his palette. It rides along flagged as the device it is.
  const t23 = cyc('0:m 8 5:m 7:m 0:m 8 7:m 0:m');
  const r = resolveLoopWrap(t23, { ...CTX, meter: '4/4' });
  assert.equal(r.action, 'replace');
  const flip = r.options.find((o) => o.note);
  assert.ok(flip, 'the flip device is missing from the options');
  assert.equal(flip.semis, 7);
  assert.equal(thirdClass(flip.quality), 'maj', 'the flip of Gm must carry a major third — the "G" of "Gm to G"');
  // and the flip never proposes the chord that is already there
  assert.ok(!(flip.semis === 7 && flip.quality === 'm'));
});

test('D56: wrapReplacements scores through the ear-informed prior, not a private one', () => {
  // The wrap term must feel the seeded V->i cadence vote: with the ear off, the
  // V candidate scores strictly lower. If this fails, the replacement picker has
  // grown its own opinion channel, which is the exact split D50 forbade.
  const t23 = cyc('0:m 8 5:m 7:m 0:m 8 7:m 0:m');
  const on = wrapReplacements(t23, CTX).find((o) => o.semis === 7);
  const off = wrapReplacements(t23, { ...CTX, ear: false }).find((o) => o.semis === 7);
  assert.ok(on && off, 'the V candidate vanished');
  assert.ok(on.score > off.score, `ear on ${on.score} should beat ear off ${off.score}`);
});
