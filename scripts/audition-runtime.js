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
const SAMPLE_MAPS = {
  drums: 'https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/strudel.json',
  piano: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json',
};
// General MIDI soundfonts (~128 instruments: gm_music_box, gm_vibraphone,
// gm_epiano1, gm_pad_warm …). @strudel/web does NOT bundle these — it is a
// separate ES module that registers the gm_* sound names; each font's audio is
// then fetched lazily the first time that instrument sounds, so registering is
// cheap. If it fails (offline, CDN blocked) the page must not go silent: every
// gm_* voice is rewritten to a bundled fallback before evaluation.
const SOUNDFONT_URL = 'https://unpkg.com/@strudel/soundfonts@1.1.0/dist/index.mjs';
const GM_FALLBACK = 'triangle';
const RT = { ready: false, booting: null, note: '', soundfonts: false, gen: 0 };

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
    // Never block forever on a sample fetch, and never let one map take the other
    // down: drums failing should not cost you the piano. A hung request is
    // indistinguishable from a broken page from the outside.
    const results = await Promise.allSettled(Object.entries(SAMPLE_MAPS).map(([name, url]) =>
      Promise.race([
        strudel.samples(url),
        rtSleep(25000).then(() => { throw new Error('timed out'); }),
      ]).catch((e) => { throw new Error(name + ' samples failed (' + url + '): ' + (e && e.message ? e.message : e)); })
    ));
    const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason.message);
    RT.ready = true;
    if (failed.length === results.length) throw new Error('no samples loaded — everything would be silent.\n' + failed.join('\n'));
    if (failed.length) rtBanner('Some sounds are unavailable, the rest will play:\n' + failed.join('\n'), 'error');
    else rtBanner('', null);
    rtStatus('ready');
  })();
  try { await RT.booting; } finally { RT.booting = null; }
}

/** gm_* voices -> a bundled sound when the soundfont module never loaded */
function rtSubstituteSounds(code) {
  if (RT.soundfonts) return code;
  return String(code).replace(/\.s\("gm_[a-z0-9_]+"\)/g, '.s("' + GM_FALLBACK + '")');
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
