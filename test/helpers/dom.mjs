// Minimal DOM shim: enough to RUN an audition page's inline script and click
// through it in Node. Parsing the page with acorn proves it is valid JS; this
// proves it WORKS — the audition pages shipped once where clicking a card emitted
// no pattern at all, and only executing the handlers would have caught it.
//
// Deliberately tiny: no layout, no events beyond the handlers the pages assign.
// Its job is to answer "does a click produce playable Strudel source", nothing more.
import { readFileSync } from 'node:fs';

// Stand-ins for the three real downloads, each the same SHAPE as the package it
// replaces — same bare imports, same exports — without the 290KB of General MIDI
// tables and soundfont parsing. The loader's whole job is resolving this graph,
// so the graph is what the stubs reproduce.
const SOUNDFONT_STUB = `
import { registerSound } from "@strudel/webaudio";
import { noteToMidi } from "@strudel/core";
import { startPresetNote, loadSoundfont } from "sfumato";
export function registerSoundfonts() {
  globalThis.__sfRegistered = (globalThis.__sfRegistered || 0) + 1;
  registerSound('gm_stub', () => {});
  noteToMidi('c4'); startPresetNote(); loadSoundfont();
}
`;
// sfumato's real single import — the one no CDN autobuild can satisfy
const SFUMATO_STUB = `
import { DEFAULT_GENERATOR_VALUES, SoundFont2 } from "soundfont2";
export const startPresetNote = () => DEFAULT_GENERATOR_VALUES;
export const loadSoundfont = () => SoundFont2;
`;
// soundfont2 ships a UMD, not an ES module: no exports at all, just a global
// assigned as a side effect. Reproducing that is the point of this stub.
const SOUNDFONT2_STUB = `
globalThis.SoundFont2 = { DEFAULT_GENERATOR_VALUES: {}, SoundFont2: function () {} };
`;
const stubFor = (url) => (/sfumato/.test(url) ? SFUMATO_STUB
  : /soundfont2/.test(url) ? SOUNDFONT2_STUB
    : SOUNDFONT_STUB);

export function runPage(path, { breakStrudel = false, failSamples = null, failSoundfonts = false } = {}) {
  const html = readFileSync(path, 'utf8');
  const script = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);

  const mkEl = (tag = 'div') => {
    const el = {
      tagName: String(tag).toUpperCase(), children: [], style: {}, dataset: {},
      _cls: '', _html: '', textContent: '', value: '', checked: false, title: '', type: '',
      clientWidth: 1200,
      get className() { return this._cls; }, set className(v) { this._cls = v; },
      get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.children = []; },
      appendChild(c) { this.children.push(c); return c; },
      remove() {}, select() {}, scrollIntoView() {},
      add(o) { this.children.push(o); },
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener() {}, onclick: null, oninput: null, onchange: null,
    };
    return el;
  };
  const byId = new Map(ids.map((i) => [i, mkEl()]));
  const listeners = {};
  const document = {
    getElementById: (id) => byId.get(id) ?? null,
    createElement: (t) => mkEl(t),
    querySelectorAll: () => [],
    querySelector: () => null,
    body: mkEl('body'),
    execCommand: () => true,
    addEventListener: (k, fn) => { (listeners[k] ??= []).push(fn); },
    set onkeydown(fn) { this._onkeydown = fn; },
    get onkeydown() { return this._onkeydown; },
  };
  const calls = [];
  const storage = {};
  const globals = {
    document,
    setTimeout: (fn, ms) => 0,
    Promise,
    // Real read/write, not a no-op: the facets page (D53) records its verdicts
    // here and nowhere else, so a stub that swallows setItem would let a page
    // that saves nothing pass every test.
    localStorage: {
      getItem: (k) => (k in storage ? storage[k] : null),
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; },
    },
    navigator: { clipboard: { writeText: async () => {} } },
    Option: function (text, value) { return { text, value }; },
    // The soundfont loader fetches a module, rewrites its bare imports and
    // imports the result as a blob. None of that exists in Node's global scope
    // here, so it is stubbed: enough for the page to take the real code path
    // and for a test to force it to fail.
    fetch: async (url) => {
      calls.push(['fetch', url]);
      if (failSoundfonts) throw new Error('simulated CDN failure');
      return { ok: true, status: 200, text: async () => stubFor(url) };
    },
    Blob: function (parts) { this.parts = parts; },
    // A browser hands back a blob: URL and can import() it. Node cannot import
    // blob:, but it CAN import data:, so the seam returns one of those — the
    // page's own import() then really runs, and the loader is exercised end to
    // end rather than mocked out at the interesting step.
    URL: {
      createObjectURL: (b) => 'data:text/javascript;base64,'
        + Buffer.from(b.parts.join('')).toString('base64'),
    },
    strudel: breakStrudel ? undefined : {
      evaluate: async (c) => { calls.push(['evaluate', c]); },
      hush: () => calls.push(['hush']),
      // the names the soundfont shim re-exports; present so rtShim() succeeds
      freqToMidi: () => 0, noteToMidi: () => 0, getSoundIndex: () => 0, Pattern: function () {},
      getPlayableNoteValue: () => 0, registerSound: () => {}, getADSRValues: () => [],
      getAudioContext: () => ({ state: 'running', resume: async () => {} }),
      getParamADSR: () => {}, getVibratoOscillator: () => {}, getPitchEnvelope: () => {},
      // `failSamples` is a predicate: return true for URLs that should reject,
      // so a test can simulate one mirror being unreachable
      samples: async (u) => {
        calls.push(['samples', u]);
        if (failSamples && failSamples(u)) throw new Error('simulated fetch failure');
      },
    },
    window: {
      initStrudel: async () => calls.push(['initStrudel']),
      addEventListener: (k, fn) => { (listeners[k] ??= []).push(fn); },
    },
    console,
  };
  globals.globalThis = globals;
  // The shim modules the loader builds are evaluated by Node's OWN module
  // loader, which sees the real globalThis rather than this sandbox — so the
  // stub strudel has to be reachable there for `globalThis.strudel` to resolve.
  globalThis.strudel = globals.strudel;
  const fn = new Function(...Object.keys(globals), `"use strict";\n${script}\n; return { DATA: typeof DATA !== 'undefined' ? DATA : null, play: typeof play !== 'undefined' ? play : null, render: typeof render !== 'undefined' ? render : null, items: typeof items !== 'undefined' ? items : null, codeFor: typeof codeFor !== 'undefined' ? codeFor : null };`);
  const api = fn(...Object.values(globals));
  return { api, calls, byId, document, listeners, storage };
}
