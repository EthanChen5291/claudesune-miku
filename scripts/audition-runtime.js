// Shared browser-side playback runtime for the audition pages, inlined into each
// generated HTML file. Factored out so the two pages cannot drift apart.
//
// Everything here exists because an audition page that fails silently is useless:
// "I click and nothing happens" has at least five causes (CDN blocked, audio
// context suspended pending a gesture, sample fetch hanging, a bad pattern, a JS
// error) and the page has to say WHICH.
// ---------------------------------------------------------------------------
// Soundfont loading (D48), as real exported values and functions so it can be
// TESTED. They are interpolated into RUNTIME_JS below rather than duplicated,
// so the thing that broke has exactly one source of truth.
//
// @strudel/soundfonts ships UNBUNDLED: its dist/index.mjs opens with bare
// specifiers — "@strudel/core", "@strudel/webaudio", "sfumato" — which a browser
// cannot resolve on its own. A plain import() of it throws "Failed to resolve
// module specifier", every gm_* voice was then rewritten to the triangle
// fallback, and the entire General MIDI palette silently became one synth.
//
// It cannot simply be pulled from a CDN that bundles dependencies either: the
// two strudel imports have to resolve to the ALREADY-RUNNING instance, because
// registering a sound into a second copy of @strudel/webaudio writes it into a
// registry the live scheduler never reads. So — fetch the source, repoint those
// two specifiers at blob shims that re-export the running instance off the
// strudel global, point "sfumato" at a real ESM build, and import the result.
// No import map required, and it works from a file:// origin.
// ---------------------------------------------------------------------------

/** CDN copies of @strudel/soundfonts, tried in order */
// The audio bundle everything else depends on. D42's addendum gave the SAMPLE
// MAPS mirrors after a live blackout, but never the bundle itself — so one
// blocked host took the whole page down with a message that read like a user
// problem. Mirrored now, same as the maps.
export const WEB_BUNDLE_URLS = [
  'https://unpkg.com/@strudel/web@1.1.0/dist/index.js',
  'https://cdn.jsdelivr.net/npm/@strudel/web@1.1.0/dist/index.js',
];

export const SOUNDFONT_URLS = [
  'https://unpkg.com/@strudel/soundfonts@1.1.0/dist/index.mjs',
  'https://cdn.jsdelivr.net/npm/@strudel/soundfonts@1.1.0/dist/index.mjs',
];
// sfumato parses soundfont binaries and holds no strudel state, so a second
// copy of it is harmless — but no CDN autobuild of it actually WORKS, because
// of what its own dependency ships (D48 addendum).
//
// sfumato's one import is `{ DEFAULT_GENERATOR_VALUES, SoundFont2 } from
// "soundfont2"`. soundfont2's package.json points its "module" field at
// lib/SoundFont2.js — which is not an ES module at all, it is a UMD bundle with
// no export statements in it. So every autobuilder (esm.sh, jsdelivr's +esm)
// produces a soundfont2 with a default export and nothing named, and the
// browser refuses sfumato with "Importing binding name
// 'DEFAULT_GENERATOR_VALUES' is not found."
//
// Imported as an ES module the UMD still runs — `exports`, `module` and
// `define` are all undefined in module scope, so it falls through to its
// browser-global branch and assigns window.SoundFont2. So: load it for that
// side effect and re-export the two names off the global it sets. Same trick as
// the strudel shims, one level further down the graph.
export const SFUMATO_URLS = [
  'https://unpkg.com/sfumato@0.1.2/dist/sfumato.js',
  'https://cdn.jsdelivr.net/npm/sfumato@0.1.2/dist/sfumato.js',
];
export const SOUNDFONT2_URLS = [
  'https://unpkg.com/soundfont2@0.4.0/lib/SoundFont2.js',
  'https://cdn.jsdelivr.net/npm/soundfont2@0.4.0/lib/SoundFont2.js',
];
/** the only two names sfumato asks of soundfont2 */
export const SOUNDFONT2_EXPORTS = ['DEFAULT_GENERATOR_VALUES', 'SoundFont2'];

/** source of a module that runs the soundfont2 UMD and re-exports its global */
export function soundfont2ShimSource(url, names) {
  return 'await import(' + JSON.stringify(url) + ');\n'
    + 'const ns = globalThis.SoundFont2;\n'
    + 'if (!ns) throw new Error("soundfont2 loaded but set no global to read");\n'
    + names.map((n) => 'export const ' + n + ' = ns.' + n + ';').join('\n');
}
/** exactly the names dist/index.mjs imports, each verified present on the
 *  @strudel/web bundle's own global namespace object */
export const SHIM_EXPORTS = {
  '@strudel/core': ['freqToMidi', 'noteToMidi', 'getSoundIndex', 'Pattern', 'getPlayableNoteValue'],
  '@strudel/webaudio': ['registerSound', 'getADSRValues', 'getAudioContext', 'getParamADSR',
    'getVibratoOscillator', 'getPitchEnvelope'],
};

/** source of a module that re-exports the live strudel globals under `names` */
export function shimSource(names) {
  return 'const s = globalThis.strudel;\n'
    + names.map((n) => 'export const ' + n + ' = s.' + n + ';').join('\n');
}

/**
 * Repoint every bare import in the soundfont source at something a browser can
 * resolve; `shims` maps specifier -> URL.
 *
 * Throws if an unresolvable specifier survives. One that got through means the
 * package grew a dependency these shims do not know about and the import would
 * fail halfway — saying so beats degrading mutely to a single synth.
 */
export function rewriteSoundfontSource(src, shims) {
  let out = String(src);
  for (const [spec, target] of Object.entries(shims)) {
    out = out.split('"' + spec + '"').join('"' + target + '"');
    out = out.split("'" + spec + "'").join("'" + target + "'");
  }
  const left = [];
  const re = /\bfrom\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(out))) if (!/^(https?:|blob:|data:|\.{0,2}\/)/.test(m[1])) left.push(m[1]);
  if (left.length) {
    throw new Error('unresolvable imports survived the rewrite (' + [...new Set(left)].join(', ')
      + ') - @strudel/soundfonts changed its dependencies');
  }
  return out;
}

export const RUNTIME_JS = String.raw`
// Full https URLs, NOT the github: shorthand: strudel's samples() appends
// "strudel.json" to any github: path, so github:.../piano.json resolves to
// ".../piano.json/strudel.json" and 404s. Two maps, because the pages need both
// a piano and Dirt-named drums, and initStrudel() prebakes neither.
// Each map lists MIRRORS, tried in order until one answers. raw.githubusercontent
// is the canonical host but browsers hit it inconsistently (rate limits, CORS
// from file://, extensions blocking it); jsdelivr serves the identical files
// from a CDN built for browser traffic. One flaky host must not mean silence.
const SAMPLE_MAPS = {
  drums: [
    'https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/strudel.json',
    'https://cdn.jsdelivr.net/gh/tidalcycles/dirt-samples@master/strudel.json',
  ],
  piano: [
    'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json',
    'https://cdn.jsdelivr.net/gh/felixroos/dough-samples@main/piano.json',
  ],
};
// If the piano map is unreachable but the soundfont bank loaded, the page can
// still play a piano — a General MIDI one. Losing the sampled piano is a
// downgrade; losing the whole page is not acceptable.
// NOT gm_acoustic_piano — that name appears in the package's tables but is not
// one of the 125 the bank actually registers. Verified against a real
// registerSoundfonts() run; a fallback that names a sound nobody registered is
// no fallback at all.
const PIANO_FALLBACK = 'gm_piano';
// General MIDI soundfonts (~128 instruments: gm_music_box, gm_vibraphone,
// gm_epiano1, gm_pad_warm …). @strudel/web does NOT bundle these — it is a
// separate ES module that registers the gm_* sound names; each font's audio is
// then fetched lazily the first time that instrument sounds, so registering is
// cheap. If it fails the page must not go silent: every gm_* voice is rewritten
// to a bundled fallback before evaluation. See D48 in the generator for why
// this needs a rewrite pass rather than a plain import().
const WEB_BUNDLE_URLS = ${JSON.stringify(WEB_BUNDLE_URLS)};
const SOUNDFONT_URLS = ${JSON.stringify(SOUNDFONT_URLS)};
const SFUMATO_URLS = ${JSON.stringify(SFUMATO_URLS)};
const SOUNDFONT2_URLS = ${JSON.stringify(SOUNDFONT2_URLS)};
const SOUNDFONT2_EXPORTS = ${JSON.stringify(SOUNDFONT2_EXPORTS)};
const SHIM_EXPORTS = ${JSON.stringify(SHIM_EXPORTS)};
const GM_FALLBACK = 'triangle';
const BUILD = '${new Date().toISOString().slice(0, 16).replace('T', ' ')}';
const RT = { ready: false, booting: null, note: '', soundfonts: false, gmVoices: 0, gen: 0, maps: {}, problems: [],
  // D56: set once the scheduler tick is running off a Web Worker, so a hidden
  // tab cannot clamp it to 1s. workerTicks is how a probe proves it is live.
  workerClock: false, workerTimers: 0, workerTicks: 0, workerClockFellBack: false };
// Exposed deliberately: when a page will not play, "open the console and read
// RT" is the whole diagnosis — which mirrors loaded, whether the soundfont bank
// registered, whether the background-safe clock is live, and what went wrong.
globalThis.RT = RT;

${shimSource.toString()}
${soundfont2ShimSource.toString()}
${rewriteSoundfontSource.toString()}

const rtBlob = (src) => URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
/** a module re-exporting the live strudel globals, addressable by URL */
function rtShim(names) {
  const missing = names.filter((n) => !(n in (globalThis.strudel || {})));
  if (missing.length) {
    throw new Error('the strudel bundle is missing ' + missing.join(', ')
      + ' - the soundfont shim cannot be built against it');
  }
  return rtBlob(shimSource(names));
}
/** first mirror that answers, as text */
async function rtFetchText(urls, what) {
  const errors = [];
  for (const url of urls) {
    try {
      const res = await Promise.race([
        fetch(url),
        rtSleep(20000).then(() => { throw new Error('timed out'); }),
      ]);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.text();
    } catch (e) {
      errors.push('  ' + url + ' - ' + (e && e.message ? e.message : e));
    }
  }
  throw new Error(what + ' unreachable:\n' + errors.join('\n'));
}
/** sfumato, with its broken soundfont2 import repointed at a working shim */
async function rtSfumatoShim() {
  // the UMD is fetched and blobbed like everything else rather than imported
  // by URL, so it gets the same mirror list as the rest of the chain
  const umd = rtBlob(await rtFetchText(SOUNDFONT2_URLS, 'soundfont2'));
  const sf2 = rtBlob(soundfont2ShimSource(umd, SOUNDFONT2_EXPORTS));
  const src = await rtFetchText(SFUMATO_URLS, 'sfumato');
  return rtBlob(rewriteSoundfontSource(src, { soundfont2: sf2 }));
}
async function rtLoadSoundfonts() {
  const errors = [];
  // Count what actually registers rather than trusting that the import
  // succeeded: "the module loaded" and "there are 125 playable instruments" are
  // different claims, and only the second is the one an ear can hear.
  //
  // The counter has to go on BEFORE the shims are built. shimSource() captures
  // registerSound BY VALUE when the shim module evaluates, so a wrapper
  // installed afterwards is invisible to every call the bank makes — the first
  // version of this counted zero every time and disabled the whole bank.
  let count = 0;
  const realRegister = globalThis.strudel && globalThis.strudel.registerSound;
  if (realRegister) {
    globalThis.strudel.registerSound = function (name) {
      if (/^gm_/.test(name)) count++;
      return realRegister.apply(this, arguments);
    };
  }
  try {
    let shims;
    try {
      shims = { sfumato: await rtSfumatoShim() };
      for (const [spec, names] of Object.entries(SHIM_EXPORTS)) shims[spec] = rtShim(names);
    } catch (e) {
      return { ok: false, detail: 'General MIDI soundfonts unavailable:\n  ' + (e && e.message ? e.message : e) };
    }
    for (const url of SOUNDFONT_URLS) {
      try {
        const src = await rtFetchText([url], 'soundfonts');
        const mod = await import(rtBlob(rewriteSoundfontSource(src, shims)));
        if (typeof mod.registerSoundfonts !== 'function') throw new Error('no registerSoundfonts export');
        const before = count;
        mod.registerSoundfonts();
        if (count === before) throw new Error('registerSoundfonts() ran but registered no gm_ voices');
        return { ok: true, url, count: count - before };
      } catch (e) {
        errors.push('  ' + url + ' - ' + (e && e.message ? e.message : e));
      }
    }
  } finally {
    if (realRegister) globalThis.strudel.registerSound = realRegister;
  }
  return { ok: false, detail: 'General MIDI soundfonts unavailable:\n' + errors.join('\n') };
}

function rtBanner(msg, kind) {
  let el = document.getElementById('rtbanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'rtbanner';
    el.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;padding:8px 16px;font:13px/1.5 -apple-system,system-ui,sans-serif;white-space:pre-wrap';
    document.body.appendChild(el);
  }
  el.style.background = kind === 'error' ? '#4a1420' : '#14304a';
  el.style.color = kind === 'error' ? '#ffb3c0' : '#bfe0ff';
  el.style.borderBottom = '1px solid ' + (kind === 'error' ? '#7d2437' : '#2b5a80');
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}
window.addEventListener('error', (e) => rtBanner('JS error: ' + (e.message || e.error) + '  (' + (e.filename || '') + ':' + (e.lineno || '?') + ')', 'error'));
window.addEventListener('unhandledrejection', (e) => rtBanner('Unhandled: ' + (e.reason && e.reason.message ? e.reason.message : e.reason), 'error'));

function rtStatus(s) {
  RT.note = s;
  const el = document.getElementById('rtstatus');
  if (el) el.textContent = s;
}

const rtSleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rtBundleReady = () => typeof strudel !== 'undefined' && typeof window.initStrudel === 'function';

function rtInjectScript(url) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = url;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('blocked or unreachable'));
    document.head.appendChild(el);
  });
}

/** The page's own <script src> is the first attempt; if that host is blocked,
 *  try the mirrors before declaring the page dead. Returns the errors so the
 *  message can name what was actually tried rather than blaming the user. */
async function rtLoadBundle() {
  if (rtBundleReady()) return { ok: true };
  const errors = [];
  for (const url of WEB_BUNDLE_URLS) {
    try {
      await rtInjectScript(url);
      if (rtBundleReady()) return { ok: true, url };
      errors.push('  ' + url + ' — loaded but set no global');
    } catch (e) {
      errors.push('  ' + url + ' — ' + (e && e.message ? e.message : e));
    }
  }
  return { ok: false, errors };
}

/**
 * A TIMER THAT A BACKGROUND TAB CANNOT THROTTLE (D56).
 *
 * Ethan: "if i leave the page the music doesnt slow down dramatically".
 *
 * Strudel's scheduler clock is, in the 1.1.0 bundle:
 *
 *   function ol(getTime, tick, duration=.05, interval=.1, overlap=.1,
 *               r = globalThis.setInterval, s = globalThis.clearInterval)
 *
 * It wakes every 100ms and schedules only (interval + overlap) = 200ms of audio
 * ahead. Chrome clamps main-thread setInterval to ONE SECOND in a hidden tab, so
 * the scheduler wakes 5x too slowly for the lookahead it keeps — the audio graph
 * starves and the music staggers. That is the whole bug: not a CPU problem, a
 * wake-up problem.
 *
 * Timers inside a Web Worker are not clamped the same way, so the tick is moved
 * there. createClock reads the timer functions off globalThis as DEFAULT
 * PARAMETERS, evaluated when the clock is constructed, so replacing them is all
 * it takes — no fork, no patched bundle.
 *
 * ONLY SHORT INTERVALS ARE REROUTED. Anything at or under RT_TICK_MAX_MS is an
 * audio scheduler; longer ones are UI housekeeping that SHOULD idle when the tab
 * is hidden, and stealing those into a worker would keep the tab awake for no
 * benefit.
 *
 * Verified from file://: a blob: Worker constructs and round-trips there, which
 * is not true of blob: AudioWorklets — so this is the one unthrottled clock
 * available to a page opened straight off disk.
 */
const RT_TICK_MAX_MS = 250;

function rtInstallWorkerClock() {
  if (RT.workerClock || typeof Worker === 'undefined') return;
  const src = 'const t = {};'
    + 'onmessage = (e) => { const d = e.data;'
    + ' if (d.a === "set") { t[d.id] = setInterval(() => postMessage(d.id), d.ms); }'
    + ' else if (d.a === "clear") { clearInterval(t[d.id]); delete t[d.id]; } };';
  let w;
  try {
    w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  } catch (e) {
    // No worker (a stricter file:// policy, an extension). Native timers still
    // work; the tab just throttles when hidden, which is the old behaviour.
    RT.problems.push('background-safe timer unavailable (' + e.message
      + ') — audio may stagger while this tab is in the background');
    return;
  }
  const cbs = new Map();
  const live = new Map();   // id -> { native, seen }
  let next = 1;
  w.onmessage = (e) => {
    const rec = live.get(e.data);
    if (rec) rec.seen = true;
    const fn = cbs.get(e.data);
    if (fn) { RT.workerTicks++; fn(); }
  };
  const nativeSet = globalThis.setInterval.bind(globalThis);
  const nativeClear = globalThis.clearInterval.bind(globalThis);
  const nativeTimeout = globalThis.setTimeout.bind(globalThis);

  globalThis.setInterval = (fn, ms, ...rest) => {
    if (!(ms <= RT_TICK_MAX_MS)) return nativeSet(fn, ms, ...rest);
    const id = 'w' + (next++);
    cbs.set(id, fn);
    live.set(id, { native: null, seen: false });
    RT.workerTimers++;
    w.postMessage({ a: 'set', id, ms });
    // WATCHDOG. Rerouting the clock is only worth doing if it cannot make things
    // WORSE than the bug it fixes, and a worker that never ticks would not
    // stagger the audio — it would stop it dead. So every rerouted timer is
    // given a deadline: if the worker has produced nothing by the time several
    // ticks were due, that timer silently reverts to a native one and RT says so.
    const rec = live.get(id);
    rec.native = nativeTimeout(() => {
      if (rec.seen || !live.has(id)) return;
      w.postMessage({ a: 'clear', id });
      RT.workerClockFellBack = true;
      const fallback = nativeSet(fn, ms, ...rest);
      rec.fallbackId = fallback;
    }, Math.max(600, ms * 5));
    return id;
  };
  globalThis.clearInterval = (id) => {
    if (typeof id === 'string' && id[0] === 'w') {
      const rec = live.get(id);
      if (rec) {
        if (rec.native != null) clearTimeout(rec.native);
        if (rec.fallbackId != null) nativeClear(rec.fallbackId);
      }
      cbs.delete(id); live.delete(id);
      w.postMessage({ a: 'clear', id });
      return;
    }
    return nativeClear(id);
  };
  RT.workerClock = true;
}

async function rtInit() {
  if (RT.ready) return;
  if (RT.booting) return RT.booting;
  RT.booting = (async () => {
    if (!rtBundleReady()) {
      rtStatus('fetching the audio bundle…');
      const got = await rtLoadBundle();
      if (!got.ok) {
        throw new Error('the strudel audio bundle could not be loaded from any mirror:\n'
          + got.errors.join('\n')
          + '\nThe page needs network access the first time. A content blocker on CDN scripts will do this too.');
      }
    }
    rtStatus('starting audio…');
    // BEFORE initStrudel(), which is where the scheduler clock is constructed
    // and where it captures its timer functions off globalThis.
    rtInstallWorkerClock();
    await window.initStrudel();
    // Browsers start the AudioContext suspended until a user gesture. Every call
    // path here is inside a click, but resume() explicitly rather than assuming.
    try {
      const ac = strudel.getAudioContext && strudel.getAudioContext();
      if (ac && ac.state !== 'running') await ac.resume();
    } catch (e) { /* older bundles expose no context getter */ }
    rtStatus('loading soundfonts…');
    const sf = await rtLoadSoundfonts();
    RT.soundfonts = sf.ok;
    RT.gmVoices = sf.count || 0;
    if (!sf.ok) {
      RT.problems.push(sf.detail + '\nEvery gm_* voice falls back to "' + GM_FALLBACK
        + '", so the whole General MIDI palette sounds like one synth.');
    }
    rtStatus('loading samples…');
    // Never block forever on a sample fetch, and never let one map take the
    // other down: drums failing should not cost you the piano. A hung request
    // is indistinguishable from a broken page from the outside.
    const loadMap = async (name, urls) => {
      const errors = [];
      for (const url of urls) {
        try {
          await Promise.race([
            strudel.samples(url),
            rtSleep(20000).then(() => { throw new Error('timed out'); }),
          ]);
          RT.maps[name] = url;
          return { name, ok: true };
        } catch (e) {
          errors.push('  ' + url + ' — ' + (e && e.message ? e.message : e));
        }
      }
      return { name, ok: false, detail: name + ' samples unreachable:\n' + errors.join('\n') };
    };
    const results = await Promise.all(Object.entries(SAMPLE_MAPS).map(([n, urls]) => loadMap(n, urls)));
    // Local sample pack (audition/sample-pack.js, built by build-sample-pack
    // .mjs): a sibling script tag — NOT a fetch, which file:// forbids —
    // defines window.LOCAL_SAMPLES as a data:-URI strudel map. Lazy-loaded
    // per name by the sampler, so registration is cheap. Pages without the
    // tag (or a missing file) just skip this: the global is undefined.
    // (Do not write a literal script-open-tag in this comment: the page
    // builder slices the inline script by lastIndexOf of that tag.)
    if (typeof window !== 'undefined' && window.LOCAL_SAMPLES) {
      try {
        await strudel.samples(window.LOCAL_SAMPLES);
        RT.maps.local = 'sample-pack.js (' + Object.keys(window.LOCAL_SAMPLES).length + ' local names)';
      } catch (e) {
        RT.problems.push('local sample pack failed to register: ' + (e && e.message ? e.message : e)
          + '\nhx_*/vc_* layers will be silent in web playback (HQ renders are unaffected).');
      }
    }
    const failed = results.filter((r) => !r.ok);
    RT.ready = true;
    if (failed.length === results.length && !RT.soundfonts) {
      throw new Error('nothing can sound: every sample mirror failed AND the soundfont bank did not load.\n'
        + failed.map((f) => f.detail).join('\n')
        + '\nCheck network access, or an extension blocking raw.githubusercontent.com and jsdelivr.net.');
    }
    if (failed.length) {
      const pianoGone = !RT.maps.piano;
      RT.problems.push('Some sample maps are unavailable'
        + (pianoGone && RT.soundfonts ? ' — the piano falls back to the General MIDI "' + PIANO_FALLBACK + '"' : ', the rest will play')
        + ':\n' + failed.map((f) => f.detail).join('\n'));
    }
    // Report EVERY subsystem that degraded, not just the last to fail. The old
    // code cleared the banner whenever the sample maps loaded, which wiped the
    // soundfont warning off the screen — so the page quietly reduced the whole
    // GM palette to one synth and then said nothing at all about it.
    rtBanner(RT.problems.join('\n\n'), RT.problems.length ? 'error' : null);
    // Say what is actually loaded, every time. "Still triangle" cost two rounds
    // of guessing because the page reported nothing once it stopped erroring:
    // there was no way to tell a working build from a stale one without an ear.
    rtStatus(RT.soundfonts
      ? 'ready · ' + RT.gmVoices + ' GM voices · build ' + BUILD
      : 'ready · GM UNAVAILABLE, every instrument is the "' + GM_FALLBACK + '" synth · build ' + BUILD);
  })();
  try { await RT.booting; } finally { RT.booting = null; }
}

/** Swap sounds whose source never loaded for ones that did, so a missing
 *  dependency degrades the timbre instead of silencing the page. */
function rtSubstituteSounds(code) {
  let out = String(code);
  if (!RT.soundfonts) out = out.replace(/\.s\("gm_[a-z0-9_]+"\)/g, '.s("' + GM_FALLBACK + '")');
  if (!RT.maps.piano && RT.soundfonts) out = out.replace(/\.s\("piano"\)/g, '.s("' + PIANO_FALLBACK + '")');
  return out;
}

/** play(code) -> true if it started, false if it reported a reason instead.
 *  Plays are GENERATION-GUARDED: booting and sample loading are async, so two
 *  quick clicks used to race and leave both patterns sounding. Each call takes
 *  a ticket; a call that finds itself superseded hushes and bows out, and the
 *  previous pattern is always hushed before the next is evaluated. */
async function rtPlay(code) {
  const gen = ++RT.gen;
  try {
    await rtInit();
    if (gen !== RT.gen) return false; // a newer click won while we were booting
    try { strudel.hush(); } catch (e) {}
    await strudel.evaluate(rtSubstituteSounds(code));
    if (gen !== RT.gen) { try { strudel.hush(); } catch (e) {} return false; }
    return true;
  } catch (e) {
    if (gen !== RT.gen) return false;
    rtBanner('Could not play: ' + (e && e.message ? e.message : e), 'error');
    rtStatus('error');
    return false;
  }
}
function rtStop() { RT.gen++; try { if (RT.ready) strudel.hush(); } catch (e) {} }

async function rtCopy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  return ok;
}

// If the bundle never arrived, say so up front instead of on first click.
window.addEventListener('load', () => {
  if (typeof strudel === 'undefined') {
    rtBanner('The strudel audio bundle did not load from unpkg.com — the page will render but cannot play. Check network access or an extension blocking CDN scripts, then reload.', 'error');
  }
});
`;
