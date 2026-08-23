// The audition pages are the only deliverable here that Node never executes, so
// they get executed: load each page's inline script under a DOM shim, click every
// tab and a card in each, and put the emitted Strudel source through the engine's
// own evaluator. A page that renders but cannot play is the failure mode this
// catches (and did catch — see D29).

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { runPage } from './helpers/dom.mjs';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const flush = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); };

/** click a card, let the async handler settle, return the last code passed to evaluate() */
async function clickFirstCard(r) {
  const card = r.byId.get('grid').children[0];
  assert.ok(card, 'no cards rendered');
  card.onclick();
  await flush();
  const ev = r.calls.filter((c) => c[0] === 'evaluate').pop();
  return ev ? ev[1] : null;
}

async function playable(code) {
  assert.ok(code, 'clicking a card emitted no pattern at all');
  // a blank control interpolated into the source ("setcpm(/4)") parses as nothing
  assert.match(code, /setcpm\(\d+(\.\d+)?\/\d+\)/, `bad transport line: ${code.slice(0, 60)}`);
  const ev = await evaluateSong(code);
  const haps = hapsByLabel(ev, 0, 4).get('p');
  assert.ok(haps && !haps.error && haps.haps.length > 0, `emitted pattern produced no haps: ${haps?.error ?? 'empty'}`);
  return haps.haps.length;
}

test('audition pages: both are regenerated exactly by their scripts', () => {
  for (const s of ['scripts/audition-progressions.mjs', 'scripts/audition-unison.mjs']) {
    execFileSync('node', [s], { cwd: ROOT });
  }
});

test('audition/progressions.html: renders, and a card click emits playable source', async () => {
  const r = runPage(join(ROOT, 'audition/progressions.html'));
  assert.equal(r.byId.get('grid').children.length, 188);
  const code = await clickFirstCard(r);
  await playable(code);
  // every sample map must be requested before anything is evaluated, or the sounds
  // resolve to silence
  const order = r.calls.map((c) => c[0]);
  assert.equal(order[0], 'initStrudel');
  const firstEval = order.indexOf('evaluate');
  assert.ok(firstEval > 0, 'never reached evaluate');
  // every evaluate is preceded by a hush (D42: two quick clicks used to leave
  // both patterns sounding), so the boot window is samples + that one hush
  const boot = order.slice(1, firstEval);
  assert.ok(boot.every((c) => c === 'samples' || c === 'hush'), `unexpected boot order: ${order.join(' > ')}`);
  assert.ok(boot.filter((c) => c === 'samples').length >= 2, 'both the drum and piano maps must load');
  assert.equal(order[firstEval - 1], 'hush', 'the previous pattern must be stopped before the next is evaluated');
  // a second card must NOT re-boot the runtime — that is what makes A/B in tempo work
  const before = r.calls.length;
  r.byId.get('grid').children[1].onclick();
  await flush();
  assert.deepEqual(r.calls.slice(before).map((c) => c[0]), ['hush', 'evaluate']);
});

test('audition/unison.html: every tab renders and plays', async () => {
  const r = runPage(join(ROOT, 'audition/unison.html'));
  const tabs = r.byId.get('tabs').children;
  assert.deepEqual(tabs.map((b) => b.textContent), ['progressions', 'rhythms', 'voicings']);
  const seen = {};
  for (const tab of tabs) {
    tab.onclick();
    const n = r.byId.get('grid').children.length;
    assert.ok(n > 0, `tab "${tab.textContent}" rendered nothing`);
    seen[tab.textContent] = n;
    await playable(await clickFirstCard(r));
  }
  assert.equal(seen.progressions, 72);
  assert.equal(seen.voicings, 91);
  assert.ok(seen.rhythms >= 12);
});

test('audition pages: a missing audio bundle is reported, not swallowed', async () => {
  // The failure that started this: window.initStrudel undefined threw inside an
  // async click handler, so the page looked alive and simply never made a sound.
  const r = runPage(join(ROOT, 'audition/unison.html'), { breakStrudel: true });
  r.byId.get('grid').children[0].onclick();
  await flush();
  const banner = r.document.body.children.map((c) => c.textContent).join(' ');
  assert.match(banner, /bundle did not load|Could not play/i);
  assert.equal(r.calls.filter((c) => c[0] === 'evaluate').length, 0);
});

test('audition pages: every sound they emit exists in a sample map they load', () => {
  // The failure this locks down: s("rim") and s("oh") are not in Dirt-Samples, so
  // the rhythms tab played nothing while looking completely healthy. A missing
  // sample name is silence, never an error — so it has to be caught here.
  const known = new Set(JSON.parse(readFileSync(join(ROOT, 'src/ingest/sample-names.json'), 'utf8')).names);
  assert.ok(known.has('piano'), 'the committed name list must include the piano map');
  for (const page of ['audition/unison.html', 'audition/progressions.html']) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const used = new Set([...html.matchAll(/\.?s\(\\?"([a-zA-Z0-9_]+)\\?"\)/g)].map((m) => m[1]));
    assert.ok(used.size > 0, `${page}: no sound names found at all`);
    for (const name of used) assert.ok(known.has(name), `${page} plays s("${name}") which is in no loaded sample map — it would be silent`);
  }
});

test('audition pages: sample maps are full URLs, never the github: shorthand', () => {
  // strudel's samples() appends "strudel.json" to any github: path, so
  // github:.../piano.json resolves to ".../piano.json/strudel.json" and 404s.
  for (const page of ['audition/unison.html', 'audition/progressions.html']) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const maps = [...html.matchAll(/SAMPLE_MAPS\s*=\s*\{([^}]*)\}/g)].map((m) => m[1]).join('');
    assert.ok(maps.includes('https://'), `${page}: sample maps must be absolute URLs`);
    assert.ok(!/samples\(\s*['"`]github:/.test(html), `${page}: uses the github: shorthand, which appends strudel.json`);
  }
});
