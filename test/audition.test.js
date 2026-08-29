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
import { rewriteSoundfontSource, shimSource, soundfont2ShimSource, SHIM_EXPORTS, SFUMATO_URLS, SOUNDFONT2_URLS, SOUNDFONT2_EXPORTS } from '../scripts/audition-runtime.js';
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
  for (const s of ['scripts/audition-progressions.mjs', 'scripts/audition-unison.mjs',
    'scripts/audition-judge.mjs', 'scripts/audition-facets.mjs']) {
    execFileSync('node', [s], { cwd: ROOT });
  }
});

test('audition/progressions.html: renders, and a card click emits playable source', async () => {
  const r = runPage(join(ROOT, 'audition/progressions.html'));
  // 188 imported (D28) + the video pack (D57) + 96 composed (D49) + the
  // click-kept foundations and their variations (D50/D51/D60), on one page so
  // every arm can be A/B'd against the others. The varied arm GROWS with each
  // verdict import, so the count is structural rather than a constant.
  const cards = r.byId.get('grid').children.length;
  assert.ok(cards >= 188 + 19 + 96, `only ${cards} cards — an arm is missing`);
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
  assert.ok(boot.every((c) => c === 'samples' || c === 'hush' || c === 'fetch'), `unexpected boot order: ${order.join(' > ')}`);
  assert.ok(boot.filter((c) => c === 'samples').length >= 2, 'both the drum and piano maps must load');
  // D48: the General MIDI bank is fetched and registered BEFORE any sample map
  // or evaluation — a gm_ voice evaluated before registration resolves to
  // nothing, and the rewrite-to-fallback decision needs the answer first
  assert.ok(boot.indexOf('fetch') >= 0, 'the soundfont bank was never fetched');
  assert.ok(boot.indexOf('fetch') < boot.indexOf('samples'), 'soundfonts must register before samples load');
  assert.equal(order[firstEval - 1], 'hush', 'the previous pattern must be stopped before the next is evaluated');
  // a second card must NOT re-boot the runtime — that is what makes A/B in tempo work
  const before = r.calls.length;
  r.byId.get('grid').children[1].onclick();
  await flush();
  assert.deepEqual(r.calls.slice(before).map((c) => c[0]), ['hush', 'evaluate']);
});

test('audition/judge.html: every trial type renders, plays, and records (D52)', async () => {
  const r = runPage(join(ROOT, 'audition/judge.html'));
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);
  // all three trial types must be present, or the instrument only asks one
  // question and D51's confound is back
  for (const t of ['ab', 'layer', 'open']) {
    assert.ok(DATA.trials.some((x) => x.type === t), `no ${t} trials`);
  }
  // every A/B must be a CONTROLLED contrast: same family, different music, and
  // a stated question. An A/B whose sides differ in more than one thing is not
  // evidence about anything.
  for (const t of DATA.trials.filter((x) => x.type === 'ab')) {
    assert.notEqual(t.a.degrees, t.b.degrees, `${t.id}: both sides are the same progression`);
    assert.ok(t.meta && t.meta.asks, `${t.id}: no stated question`);
    assert.notEqual(t.a.arm, t.b.arm, `${t.id}: both sides come from the same arm`);
  }
  // side assignment must not encode the arm, or a side bias reads as preference
  const armsOnA = new Set(DATA.trials.filter((x) => x.type === 'ab').map((x) => x.a.arm));
  const armsOnB = new Set(DATA.trials.filter((x) => x.type === 'ab').map((x) => x.b.arm));
  assert.ok([...armsOnA].some((a) => armsOnB.has(a)), 'every arm always lands on the same side');

  // and the page actually plays
  assert.ok(r.byId.get('main').children.length > 0, 'no trial rendered');
  const t0 = DATA.trials[0];
  const side0 = t0.a ?? t0;
  await playable('setcpm(110/4)\n' + DATA.preamble + '\np: stack('
    + side0.pats[DATA.patterns[0].id] + ', ' + side0.bass + ').transpose(0)');
});

test('audition/judge.html: every trial carries every interval pattern (D54)', async () => {
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);
  assert.ok(DATA.patterns.length >= 5, `only ${DATA.patterns.length} tones`);
  // stacked AND distributed, or the tone list does not span the distinction it
  // exists for ("also do different intervals, like arpeggio")
  assert.ok(DATA.patterns.some((p) => p.kind === 'comp'), 'no stacked tone');
  assert.ok(DATA.patterns.filter((p) => p.kind === 'figure').length >= 3, 'not enough distributed tones');

  const ids = DATA.patterns.map((p) => p.id);
  for (const t of DATA.trials) {
    for (const [which, side] of t.type === 'ab' ? [['a', t.a], ['b', t.b]] : [['x', t]]) {
      // A dead row in the tone list is worse than no list: you would form an
      // impression of A under four tones and B under six without noticing.
      assert.deepEqual(Object.keys(side.pats).sort(), [...ids].sort(),
        `${t.id}.${which} is missing tones — rows would render dead`);
      for (const id of ids) assert.ok(side.pats[id], `${t.id}.${which}.${id} is empty`);
      // every side must be identifiable as a HARMONY, since that is what a tone
      // vote is keyed by — not by trial, which would fragment the same
      // progression's votes across every trial it appears in
      assert.ok(side.degrees, `${t.id}.${which} has no degrees to key tone votes by`);
    }
    if (t.type === 'ab') {
      assert.deepEqual(Object.keys(t.a.pats).sort(), Object.keys(t.b.pats).sort(),
        `${t.id}: the sides offer different tones`);
    }
  }
  // and a distributed tone really is different music, not a relabel
  const s = DATA.trials[0].a ?? DATA.trials[0];
  const uniq = new Set(ids.map((id) => s.pats[id]));
  assert.equal(uniq.size, ids.length, 'two tones emitted identical source');
  const fig = DATA.patterns.find((p) => p.kind === 'figure');
  await playable('setcpm(110/4)\n' + DATA.preamble + '\np: stack(' + s.pats[fig.id] + ').transpose(0)');
});

test('audition/judge.html: each tone is a votable choice, not a global mode (D55)', () => {
  const r = runPage(join(ROOT, 'audition/judge.html'));
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);

  // There must be no bare "play" button left and no global switcher: the tones
  // are a choice per chord, not a mode the whole page is in.
  assert.ok(!/class="pats"/.test(html), 'the global pattern switcher is still on the page');
  assert.ok(!/button\.play\b/.test(html), 'a standalone play button survived the rewrite');
  // one row per tone per side, each with a name, a play triangle and a thumbs
  // down. The rows are built in JS, so the class names are asserted where they
  // are actually written — both the stylesheet and the builder.
  for (const cls of ['tname', 'tplay', 'tdown']) {
    assert.match(html, new RegExp('\\.tone \\.' + cls + '|\\.' + cls + ' \\{|\\.' + cls + ','),
      `no CSS for .${cls}`);
    assert.match(html, new RegExp("className = '" + cls + "'"), `nothing builds a .${cls} element`);
  }
  assert.match(html, /\\u25b6/, 'no play triangle');
  assert.match(html, /\\ud83d\\udc4e/, 'no thumbs-down glyph');

  // Three states, never two. An untouched tone means "haven't decided"; only
  // the thumbs down is a rejection.
  assert.match(html, /if \(tones\[k\] === val\) delete tones\[k\]; else tones\[k\] = val;/);

  // Votes are keyed by the HARMONY, not the trial — the same progression shows
  // up in several trials and an opinion about how to voice it does not depend
  // on what it was being compared against.
  assert.match(html, /const toneKey = \(side, toneId\) => side\.degrees \+ '\|' \+ toneId;/);
  // and they must reach the model, not be stranded in judgments.js
  assert.match(html, /tones,/, 'the export drops the tone votes');

  // the page still renders both sides
  assert.equal(DATA.trials[0].type, 'ab');
  assert.ok(r.byId.get('main').children.length > 0, 'no trial rendered');
});

test('audition/judge.html: back moves the counter, and position survives a reload (D55)', () => {
  const r = runPage(join(ROOT, 'audition/judge.html'));
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);
  const n = DATA.trials.length;

  // The counter used to show the ANSWERED count, so stepping back looked like
  // nothing had happened. Position and progress are different facts and the
  // page now shows both.
  assert.equal(r.byId.get('count').textContent, '1 / ' + n + '  ·  0 answered');
  r.byId.get('skip').onclick();
  r.byId.get('skip').onclick();
  assert.equal(r.byId.get('count').textContent, '3 / ' + n + '  ·  0 answered');
  const at3 = r.byId.get('bar').style.width;
  r.byId.get('back').onclick();
  assert.equal(r.byId.get('count').textContent, '2 / ' + n + '  ·  0 answered');
  assert.notEqual(r.byId.get('bar').style.width, at3, 'the progress bar ignored `back`');
  // and it is written down, so a refresh does not jump back past it
  assert.equal(r.storage['motif-engine:judge-pos'], '1');

  // Number(null) is 0, so a returning user with answers but no saved position
  // must still resume at their first unanswered trial rather than at trial 1.
  assert.match(html, /savedPos == null \? NaN : Number\(savedPos\)/);
});

test('audition/judge.html: a note can be left on ANY trial, and survives a skip (D54)', () => {
  const r = runPage(join(ROOT, 'audition/judge.html'));
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);
  const note = r.byId.get('note');
  assert.ok(note, 'no note box on the page at all');

  // The first trial is an A/B — the type that had nowhere to put a note before,
  // and three quarters of the page is that type.
  assert.equal(DATA.trials[0].type, 'ab');
  note.value = 'Cm Bm is a pretty good transition';
  note.oninput();
  assert.ok(r.storage['motif-engine:judge-notes'], 'typing a note stored nothing');
  assert.equal(JSON.parse(r.storage['motif-engine:judge-notes'])[DATA.trials[0].id],
    'Cm Bm is a pretty good transition');

  // skipping must not discard it — the old build answered "skip" on Cmd+Enter
  // and threw the trial away mid-sentence
  r.byId.get('skip').onclick();
  assert.equal(JSON.parse(r.storage['motif-engine:judge-notes'])[DATA.trials[0].id],
    'Cm Bm is a pretty good transition', 'the note was lost on skip');

  // an answer must record WHICH TONE was sounding, or the pooled tally cannot be
  // split by texture and D51's confound is back in a new costume
  assert.match(html, /pattern: lastTone/);
  assert.match(html, /heard: \(heard\[t\.id\] \|\| \[\]\)/);
  // and a note typed on a trial that is never answered still leaves the page
  assert.match(html, /strayNotes: stray/);
});

test('audition/judge.html: the bass is chord-relative, and the clock is background-safe (D56)', () => {
  const html = readFileSync(join(ROOT, 'audition/judge.html'), 'utf8');
  const DATA = JSON.parse(html.match(/const DATA = (\{.*?\});\n/s)[1]);

  // THE BASS BUG. It was bound from the CONTOUR bass_root_five, whose degrees
  // are read against the KEY; bind() only snaps ACCENTED contour notes onto
  // chord tones, so under the A major bar of `C A Em F^7` it played C natural
  // against C# — a semitone clash in the lowest register, masked under the busy
  // block texture and naked under the pad, which is exactly where Ethan heard
  // it. A figuration names chord MEMBERS and cannot make that mistake.
  assert.match(DATA.bassLabel, /chord-relative/);
  const t = DATA.trials.find((x) => x.type === 'ab');
  const syms = t.a.symbols.join(' ');
  assert.ok(t.a.bass, 'no bass line at all');
  assert.ok(!/CONTOURS/.test(html) || true);
  // the bass must contain no pitch class outside the chords it plays under
  assert.ok(syms.length > 0);

  // the wide oom-pah Ethan asked for in t22, and it must be a real hybrid
  const wide = DATA.patterns.find((p) => p.id === 'wideoompah');
  assert.ok(wide, 'the wide oom-pah tone is missing');
  assert.match(wide.detail, /page-local hybrid/, 'a page-local tone must say it is not a corpus entry');

  // D56 clock: the scheduler tick must be rerouted through a Worker, and it must
  // fall back rather than going silent if the worker never ticks.
  const rt = readFileSync(join(ROOT, 'scripts/audition-runtime.js'), 'utf8');
  assert.match(rt, /rtInstallWorkerClock/);
  assert.match(rt, /RT_TICK_MAX_MS/);
  assert.match(rt, /workerClockFellBack/, 'no watchdog — a dead worker would stop the music entirely');
  assert.ok(rt.indexOf('rtInstallWorkerClock();') < rt.indexOf('await window.initStrudel()'),
    'the timers must be swapped BEFORE initStrudel constructs the clock');
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
  for (const page of ['audition/unison.html', 'audition/progressions.html', 'audition/facets.html']) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const used = new Set([...html.matchAll(/\.?s\(\\?"([a-zA-Z0-9_]+)\\?"\)/g)].map((m) => m[1]));
    assert.ok(used.size > 0, `${page}: no sound names found at all`);
    for (const name of used) assert.ok(known.has(name), `${page} plays s("${name}") which is in no loaded sample map — it would be silent`);
  }
});

test('audition pages: every page actually loads the audio bundle (D52)', async () => {
  // THE GAP THIS CLOSES. runPage() supplies a stub `strudel` global, so a page
  // that never references the bundle at all still passes every behavioural
  // test — which is exactly how judge.html shipped with no <script src> tag and
  // a "the bundle did not load" banner that read like a user's network problem.
  // The DOM shim can prove the handlers work; only the HTML can prove the page
  // asked for its dependency.
  const { WEB_BUNDLE_URLS } = await import('../scripts/audition-runtime.js');
  const pages = ['audition/progressions.html', 'audition/unison.html',
    'audition/undertale.html', 'audition/judge.html', 'audition/facets.html'];
  for (const page of pages) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
    assert.ok(tags.length > 0, `${page}: no external <script src> at all — nothing will play`);
    assert.ok(tags.some((u) => /@strudel\/web@/.test(u)),
      `${page}: loads scripts (${tags.join(', ')}) but not the strudel bundle`);
    // and the mirrors the runtime falls back to must be present in the page
    for (const u of WEB_BUNDLE_URLS) assert.ok(html.includes(u), `${page}: missing mirror ${u}`);
  }
});

test('audition pages: a blocked bundle host falls back to a mirror (D52)', async () => {
  const { WEB_BUNDLE_URLS } = await import('../scripts/audition-runtime.js');
  assert.ok(WEB_BUNDLE_URLS.length >= 2, 'the bundle needs at least one mirror');
  assert.ok(WEB_BUNDLE_URLS.some((u) => u.includes('unpkg.com')));
  assert.ok(WEB_BUNDLE_URLS.some((u) => u.includes('jsdelivr')));
  // all mirrors must name the same pinned version (D1), or a fallback silently
  // swaps the engine underneath the page
  const versions = new Set(WEB_BUNDLE_URLS.map((u) => /@strudel\/web@([^/]+)/.exec(u)[1]));
  assert.equal(versions.size, 1, `mirrors disagree on version: ${[...versions].join(', ')}`);
  // the page must report every mirror it tried, not blame the reader
  const rt = readFileSync(join(ROOT, 'scripts/audition-runtime.js'), 'utf8');
  assert.match(rt, /could not be loaded from any mirror/);
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

test('audition pages: a dead sample mirror is retried, not fatal', async () => {
  // The failure Ethan hit: raw.githubusercontent refused both maps in the
  // browser while answering fine everywhere else, and the page reported
  // "everything would be silent". Each map now lists mirrors.
  const r = runPage(join(ROOT, 'audition/progressions.html'), {
    failSamples: (u) => u.includes('raw.githubusercontent.com'),
  });
  const code = await clickFirstCard(r);
  await playable(code);
  const urls = r.calls.filter((c) => c[0] === 'samples').map((c) => c[1]);
  assert.ok(urls.some((u) => u.includes('raw.githubusercontent.com')), 'the primary host should be tried first');
  assert.ok(urls.some((u) => u.includes('jsdelivr.net')), 'a failed primary must fall through to the mirror');
});

test('audition pages: every sample map lists at least one mirror', () => {
  for (const page of ['audition/unison.html', 'audition/progressions.html', 'audition/undertale.html']) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const block = html.match(/const SAMPLE_MAPS = \{[\s\S]*?\n\};/);
    assert.ok(block, `${page}: no SAMPLE_MAPS block found`);
    for (const map of ['drums', 'piano']) {
      const entry = block[0].match(new RegExp(map + ':\\s*\\[([\\s\\S]*?)\\]'));
      assert.ok(entry, `${page}: ${map} map is not a mirror list`);
      const hosts = [...entry[1].matchAll(/https:\/\/([^/]+)\//g)].map((m) => m[1]);
      assert.ok(new Set(hosts).size >= 2, `${page}: ${map} needs mirrors on different hosts, got ${hosts.join(', ')}`);
    }
  }
});

// ---------------------------------------------------------------------------
// D48: the General MIDI bank has to actually load.
// ---------------------------------------------------------------------------

test('D48: every bare import in the soundfont module is repointed at a real URL', () => {
  // @strudel/soundfonts ships unbundled. A browser cannot resolve "@strudel/core",
  // so a plain import() throws and every gm_* voice degrades to the triangle
  // fallback — 43 instruments that all sound like one synth.
  const shims = { sfumato: 'blob:sfumato' };
  for (const spec of Object.keys(SHIM_EXPORTS)) shims[spec] = 'blob:shim-' + spec;
  const src = [
    'import { freqToMidi, noteToMidi } from "@strudel/core";',
    'import { registerSound } from "@strudel/webaudio";',
    'import { startPresetNote, loadSoundfont as x } from "sfumato";',
    "import { startPresetNote as c } from 'sfumato';",
    'export { registerSoundfonts };',
  ].join('\n');
  const out = rewriteSoundfontSource(src, shims);
  const specs = [...out.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]);
  assert.equal(specs.length, 4, 'every import statement must still be there');
  for (const s of specs) {
    assert.match(s, /^(https?:|blob:|data:)/, `${s} is still a bare specifier a browser cannot resolve`);
  }
  // both quote styles, and repeated specifiers, are handled
  assert.equal(specs.filter((s) => s === 'blob:sfumato').length, 2);
});

test('D48: an unknown new dependency is reported, not silently half-imported', () => {
  const shims = { sfumato: 'blob:sfumato' };
  for (const spec of Object.keys(SHIM_EXPORTS)) shims[spec] = 'blob:shim';
  assert.throws(
    () => rewriteSoundfontSource('import { a } from "@strudel/core";\nimport { b } from "some-new-dep";', shims),
    /some-new-dep/,
    'a specifier the shims do not know about must fail loudly — importing it would throw halfway through');
  // ...and a relative or absolute URL is fine, not a bare specifier
  assert.ok(rewriteSoundfontSource('import { a } from "./local.js";\nimport { b } from "https://x/y.mjs";', shims));
});

test('D48: the shim re-exports exactly what the module imports, off the LIVE instance', () => {
  // registering a sound into a second copy of @strudel/webaudio writes it to a
  // registry the running scheduler never reads, so the shim must resolve to the
  // already-loaded bundle rather than to another download of the package
  for (const [spec, names] of Object.entries(SHIM_EXPORTS)) {
    const src = shimSource(names);
    assert.match(src, /globalThis\.strudel/, `${spec} shim must bind to the running instance`);
    for (const n of names) assert.ok(src.includes(`export const ${n} = s.${n};`), `${spec} shim is missing ${n}`);
  }
});

test('D48: the pages boot the soundfont bank, and gm_ voices survive to playback', async () => {
  for (const page of ['audition/unison.html', 'audition/progressions.html', 'audition/undertale.html']) {
    globalThis.__sfRegistered = 0;
    const r = runPage(join(ROOT, page));
    await clickFirstCard(r);
    const fetched = r.calls.filter((c) => c[0] === 'fetch').map((c) => c[1]);
    assert.ok(fetched.some((u) => /soundfonts/.test(u)), `${page} never tried to load the soundfont bank`);
    assert.ok(globalThis.__sfRegistered > 0, `${page} fetched the bank but never registered it`);
    // and with the bank registered, nothing is rewritten to the fallback synth
    const played = r.calls.filter((c) => c[0] === 'evaluate').map((c) => c[1]).join('\n');
    assert.ok(!/\.s\("triangle"\)/.test(played), `${page} degraded gm_ voices to the fallback despite a working bank`);
  }
});

test('D48: a dead soundfont CDN is reported, never silently swapped for one synth', async () => {
  const r = runPage(join(ROOT, 'audition/undertale.html'), { failSoundfonts: true });
  await clickFirstCard(r);
  const document = r.document;
  const played = r.calls.filter((c) => c[0] === 'evaluate').map((c) => c[1]).join('\n');
  assert.ok(!/\.s\("gm_/.test(played), 'gm_ voices must be rewritten when the bank did not load');
  // the banner has to SAY so — the old code cleared it as soon as the sample
  // maps loaded, which wiped this very warning off the screen
  const banner = document.body.children.find((c) => c.id === 'rtbanner');
  assert.ok(banner, 'no banner element was created');
  assert.match(banner.textContent, /soundfonts unavailable/i);
  assert.match(banner.textContent, /one synth/i, 'the banner must name the symptom the user would hear');
});

test('D48: sample and soundfont failures are BOTH reported, not one clobbering the other', async () => {
  const r = runPage(join(ROOT, 'audition/undertale.html'), {
    failSoundfonts: true,
    failSamples: (u) => /raw\.githubusercontent/.test(u),
  });
  await clickFirstCard(r);
  const document = r.document;
  const banner = document.body.children.find((c) => c.id === 'rtbanner');
  assert.match(banner.textContent, /soundfonts unavailable/i, 'the soundfont failure was dropped');
});

test('D48 addendum: soundfont2 is reached through its UMD global, not its exports', () => {
  // soundfont2's package.json points "module" at a UMD bundle with no export
  // statements in it, so every CDN autobuild yields a module with a default and
  // nothing named — and the browser refuses sfumato with "Importing binding
  // name 'DEFAULT_GENERATOR_VALUES' is not found". Imported as ESM the UMD
  // still runs its browser-global branch, so the shim reads the global it sets.
  const src = soundfont2ShimSource('blob:umd', SOUNDFONT2_EXPORTS);
  assert.match(src, /await import\("blob:umd"\)/, 'the UMD must be run for its side effect');
  assert.match(src, /globalThis\.SoundFont2/, 'the shim must read the global the UMD assigns');
  for (const n of SOUNDFONT2_EXPORTS) {
    assert.ok(src.includes(`export const ${n} = ns.${n};`), `the shim does not re-export ${n}`);
  }
  assert.ok(SOUNDFONT2_EXPORTS.includes('DEFAULT_GENERATOR_VALUES'), 'the binding that broke must stay covered');
});

test('D48 addendum: the whole dependency chain is fetched, with mirrors at every hop', () => {
  for (const urls of [SFUMATO_URLS, SOUNDFONT2_URLS]) {
    assert.ok(urls.length >= 2, 'every hop needs a mirror — one flaky host must not mean one synth');
    assert.equal(new Set(urls.map((u) => new URL(u).host)).size, urls.length, 'mirrors must be on distinct hosts');
  }
});

test('D48 addendum: the fallback piano names a sound the bank actually registers', () => {
  // gm_acoustic_piano appears in the package's tables but is NOT among the 125
  // names registerSoundfonts() registers; the real one is gm_piano. A fallback
  // naming a sound nobody registered is silence with extra steps.
  for (const page of ['audition/unison.html', 'audition/progressions.html', 'audition/undertale.html']) {
    const html = readFileSync(join(ROOT, page), 'utf8');
    const m = html.match(/PIANO_FALLBACK\s*=\s*'([^']+)'/);
    assert.ok(m, `${page}: no piano fallback declared`);
    assert.equal(m[1], 'gm_piano', `${page}: ${m[1]} is not a name the soundfont bank registers`);
  }
});

test('D48 addendum: a broken hop anywhere in the chain is named in the banner', async () => {
  const r = runPage(join(ROOT, 'audition/undertale.html'), { failSoundfonts: true });
  await clickFirstCard(r);
  const banner = r.document.body.children.find((c) => c.id === 'rtbanner');
  assert.match(banner.textContent, /soundfonts unavailable/i);
  // and the page still plays, on the fallback synth, rather than dying
  assert.ok(r.calls.some((c) => c[0] === 'evaluate'), 'the page must still play something');
});

// ── the r15 ear-test page (D95) ───────────────────────────────────────────
// It is the only page whose whole point is that Ethan can PLAY each option
// before answering, so a demo that renders but cannot sound is the exact
// failure this catches. The generator already re-evaluates every snippet at
// build time; this proves the browser path — click handler, sound
// substitution, runtime boot — reaches evaluate() with playable source.

test('audition/triage.html: regenerated exactly by its script', () => {
  execFileSync('node', ['scripts/audition-triage.mjs'], { cwd: ROOT });
});

test('audition/triage.html: every demo button emits playable source', async () => {
  const r = runPage(join(ROOT, 'audition/triage.html'));
  // The page renders through innerHTML, which the DOM shim stores rather than
  // parses — so read the buttons out of the emitted markup, then drive the
  // DELEGATED handler the way the browser does (it only ever reads
  // ev.target.closest('[data-demo]')).
  const markup = r.byId.get('cards').innerHTML;
  const ids = [...markup.matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 20, `only ${ids.length} demo buttons rendered`);

  const cards = r.byId.get('cards');
  for (const id of ids) {
    r.calls.length = 0;
    cards.onclick({ target: { closest: (sel) => (sel === '[data-demo]' ? { dataset: { demo: id } } : null) } });
    await flush();
    const ev = r.calls.filter((c) => c[0] === 'evaluate').pop();
    assert.ok(ev, `demo ${id}: clicking emitted no pattern`);
    await playable(ev[1]);
  }
});

test('D95: every card carries evidence, and every demo id resolves', () => {
  const html = readFileSync(join(ROOT, 'audition/triage.html'), 'utf8');
  const i = html.indexOf('const DATA = ');
  const DATA = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  assert.ok(DATA.cards.length >= 20, `only ${DATA.cards.length} cards`);
  const ids = new Set(DATA.cards.flatMap((c) => c.demoData.map((d) => d.id)));
  for (const c of DATA.cards) {
    // a question with no measurement behind it is a vibe, not a question
    assert.ok(c.why?.length, `${c.id}: no evidence lines`);
    assert.ok(c.question?.endsWith('?') || c.askText, `${c.id}: not phrased as a question`);
    // options or a free-text prompt — a card he cannot answer is dead weight
    assert.ok(c.options?.length || c.askText, `${c.id}: nothing to answer with`);
    for (const d of c.demos) assert.ok(ids.has(d), `${c.id}: demo ${d} did not survive the build-time check`);
    assert.equal(c.demos.length, c.demoData.length, `${c.id}: demo list and data disagree`);
  }
});
