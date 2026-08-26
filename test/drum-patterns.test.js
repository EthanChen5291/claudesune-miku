// D61: the drum-patterns.com saved-page importer. Hermetic — the fixture is a
// minimal synthetic page mimicking the site's machine-generated markup, so the
// test needs no saved pages and never touches the network.

import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePage, buildEntries } from '../scripts/import-drum-patterns.mjs';
import { normalizeRhythm } from '../src/binder/bind.js';

const row = (v, title, steps) =>
  `<div><span class="voice voice-${v}" title="${title}">${v.toUpperCase()}</span><span class="beats">` +
  steps.split('').map((c) => c === 'X' ? '<span class="on value-X">X</span>' : '<span>-</span>').join('') +
  '</span></div>';

const bank = (rows) => `<code class="pattern pad-1">${rows.join('')}</code>`;

const FIXTURE = `<html><head>
<link rel="canonical" href="https://drum-patterns.com/test-groove/" />
</head><body>
<div class="drumpattern time-4-4 swing-1 kit-roland-tr-808 style-house banks-2 bank-1" data-order="1,1,2">
<h6><a href="https://drum-patterns.com/test-groove/" title="Test Groove">Test Groove</a></h6>
${bank([
  row('bd', 'Bass Drum', 'X---X---X---X---'),
  row('sd', 'Snare Drum', '----X-------X---'),
  row('gh', 'Ghost', '--X-------------'),
  row('ch', 'Closed Hi-Hat', 'X-X-X-X-X-X-X-X-'),
  row('ac', 'Accent', 'X-------X-------'),
])}
${bank([
  row('bd', 'Bass Drum', 'X---X---X---XX--'),
  row('sd', 'Snare Drum', '----X-------X-XX'),
  row('ch', 'Closed Hi-Hat', 'X-X-X-X-X-X-X-X-'),
])}
<p class="meta-links"><a href="https://drum-patterns.com/bpm/120/">124BPM</a></p>
</div>
<div class="drumpattern time-4-4 swing-0 kit-acoustic style-pop banks-1 bank-1">
<h6><a href="https://drum-patterns.com/somebody-elses/" title="Somebody Else's">Somebody Else's</a></h6>
${bank([row('bd', 'Bass Drum', 'X-------X-------')])}
<p class="meta-links"><a href="https://drum-patterns.com/bpm/90/">90BPM</a></p>
</div>
</body></html>`;

test('parsePage: finds both patterns, marks only the canonical one main', () => {
  const pats = parsePage(FIXTURE);
  assert.equal(pats.length, 2);
  assert.equal(pats[0].main, true);
  assert.equal(pats[1].main, false);
  assert.equal(pats[0].title, 'Test Groove');
  assert.equal(pats[0].bpm, 124); // the pattern's shown BPM, not the /bpm/ category link
  assert.equal(pats[0].swing, true);
  assert.equal(pats[0].kit, 'roland-tr-808');
  assert.deepEqual(pats[0].order, [1, 1, 2]);
  assert.equal(pats[0].banks.length, 2);
});

test('buildEntries: order expands banks into played bars', () => {
  const { entries, form } = buildEntries(parsePage(FIXTURE)[0], 'test.html');
  const bd = entries.find((e) => e.name === 'dp_test_groove_bd');
  assert.ok(bd);
  assert.equal(bd.bars, 3);
  assert.equal(bd.grid, 16);
  // bars 1+2 are bank 1 (4 kicks each), bar 3 is bank 2 (5 kicks)
  assert.equal(bd.onsets.length, 13);
  assert.equal(bd.onsets[0], '0/1');
  assert.equal(bd.onsets[1], '1/4');
  // bank 2's double kick lands in bar 3: steps 12,13 -> (2*16+12)/16 = 11/4, 45/16
  assert.ok(bd.onsets.includes('11/4') && bd.onsets.includes('45/16'));
  assert.equal(form.fill, 2); // bank 2 used once, in final position
  assert.equal(form.intro, null); // bank 1 opens but recurs
  assert.equal(bd.swing, 0.55);
});

test('buildEntries: AC row recovers a real accent profile', () => {
  const { entries } = buildEntries(parsePage(FIXTURE)[0], 'test.html');
  const bd = entries.find((e) => e.name === 'dp_test_groove_bd');
  assert.equal(bd.needsAccents, false);
  assert.equal(bd.triage, 'grid-accent');
  // bank-1 bars: kick on accented steps 0 and 8 reads 1.0, steps 4 and 12 read 0.85
  assert.deepEqual(bd.accents.slice(0, 4), [1, 0.85, 1, 0.85]);
  // bank 2 has no AC row: all base
  assert.equal(bd.accents[bd.accents.length - 1], 0.85);
});

test('buildEntries: ghost row merges into the snare at 0.4', () => {
  const { entries } = buildEntries(parsePage(FIXTURE)[0], 'test.html');
  const sd = entries.find((e) => e.name === 'dp_test_groove_sd');
  assert.ok(!entries.some((e) => e.name.endsWith('_gh')), 'no separate ghost entry');
  // bank-1 bars each carry the ghost at step 2 -> onsets 1/8 and (16+2)/16 = 9/8
  assert.ok(sd.onsets.includes('1/8') && sd.onsets.includes('9/8'));
  const ghostAcc = sd.accents[sd.onsets.indexOf('1/8')];
  assert.equal(ghostAcc, 0.4);
  // and the merge kept onsets sorted
  const vals = sd.onsets.map((o) => { const [n, d] = o.split('/').map(Number); return n / d; });
  assert.deepEqual(vals, [...vals].sort((a, b) => a - b));
});

test('accentless pattern stays needsAccents with null accents', () => {
  const { entries } = buildEntries(parsePage(FIXTURE)[1], 'test.html');
  const bd = entries.find((e) => e.name === 'dp_somebody_else_s_bd');
  assert.equal(bd.accents, null);
  assert.equal(bd.needsAccents, true);
  assert.equal(bd.triage, 'grid-flat');
});

test('entries with recovered accents pass the real binder gate', () => {
  const { entries } = buildEntries(parsePage(FIXTURE)[0], 'test.html');
  for (const e of entries.filter((x) => !x.needsAccents)) {
    const r = normalizeRhythm(e);
    assert.equal(r.bars, 3);
    assert.equal(r.onsets.length, e.onsets.length);
    assert.equal(r.swing, 0.55);
  }
});
