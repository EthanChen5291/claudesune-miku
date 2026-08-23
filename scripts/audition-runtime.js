// Shared browser-side playback runtime for the audition pages, inlined into each
// generated HTML file. Factored out so the two pages cannot drift apart.
//
// Everything here exists because an audition page that fails silently is useless:
// "I click and nothing happens" has at least five causes (CDN blocked, audio
// context suspended pending a gesture, sample fetch hanging, a bad pattern, a JS
// error) and the page has to say WHICH.
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
const PIANO_FALLBACK = 'gm_acoustic_piano';
// General MIDI soundfonts (~128 instruments: gm_music_box, gm_vibraphone,
// gm_epiano1, gm_pad_warm …). @strudel/web does NOT bundle these — it is a
// separate ES module that registers the gm_* sound names; each font's audio is
// then fetched lazily the first time that instrument sounds, so registering is
// cheap. If it fails (offline, CDN blocked) the page must not go silent: every
// gm_* voice is rewritten to a bundled fallback before evaluation.
const SOUNDFONT_URL = 'https://unpkg.com/@strudel/soundfonts@1.1.0/dist/index.mjs';
const GM_FALLBACK = 'triangle';
const RT = { ready: false, booting: null, note: '', soundfonts: false, gen: 0, maps: {} };

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

async function rtInit() {
  if (RT.ready) return;
  if (RT.booting) return RT.booting;
  RT.booting = (async () => {
    if (typeof strudel === 'undefined' || typeof window.initStrudel !== 'function') {
      throw new Error('the strudel bundle did not load (unpkg blocked, offline, or an extension stripped it). The page needs network access the first time.');
    }
    rtStatus('starting audio…');
    await window.initStrudel();
    // Browsers start the AudioContext suspended until a user gesture. Every call
    // path here is inside a click, but resume() explicitly rather than assuming.
    try {
      const ac = strudel.getAudioContext && strudel.getAudioContext();
      if (ac && ac.state !== 'running') await ac.resume();
    } catch (e) { /* older bundles expose no context getter */ }
    rtStatus('loading soundfonts…');
    try {
      const sf = await Promise.race([
        import(SOUNDFONT_URL),
        rtSleep(20000).then(() => { throw new Error('timed out'); }),
      ]);
      if (typeof sf.registerSoundfonts === 'function') { sf.registerSoundfonts(); RT.soundfonts = true; }
    } catch (e) {
      rtBanner('General MIDI soundfonts unavailable (' + (e && e.message ? e.message : e) + ') — those voices fall back to "' + GM_FALLBACK + '".', 'error');
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
    const failed = results.filter((r) => !r.ok);
    RT.ready = true;
    if (failed.length === results.length && !RT.soundfonts) {
      throw new Error('nothing can sound: every sample mirror failed AND the soundfont bank did not load.\n'
        + failed.map((f) => f.detail).join('\n')
        + '\nCheck network access, or an extension blocking raw.githubusercontent.com and jsdelivr.net.');
    }
    if (failed.length) {
      const pianoGone = !RT.maps.piano;
      rtBanner('Some sample maps are unavailable'
        + (pianoGone && RT.soundfonts ? ' — the piano falls back to the General MIDI "' + PIANO_FALLBACK + '"' : ', the rest will play')
        + ':\n' + failed.map((f) => f.detail).join('\n'), 'error');
    } else rtBanner('', null);
    rtStatus('ready');
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
