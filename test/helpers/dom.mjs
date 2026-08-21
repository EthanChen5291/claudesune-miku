// Minimal DOM shim: enough to RUN an audition page's inline script and click
// through it in Node. Parsing the page with acorn proves it is valid JS; this
// proves it WORKS — the audition pages shipped once where clicking a card emitted
// no pattern at all, and only executing the handlers would have caught it.
//
// Deliberately tiny: no layout, no events beyond the handlers the pages assign.
// Its job is to answer "does a click produce playable Strudel source", nothing more.
import { readFileSync } from 'node:fs';

export function runPage(path, { breakStrudel = false } = {}) {
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
  const globals = {
    document,
    setTimeout: (fn, ms) => 0,
    Promise,
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { clipboard: { writeText: async () => {} } },
    Option: function (text, value) { return { text, value }; },
    strudel: breakStrudel ? undefined : {
      evaluate: async (c) => { calls.push(['evaluate', c]); },
      hush: () => calls.push(['hush']),
      samples: async (u) => { calls.push(['samples', u]); },
    },
    window: {
      initStrudel: async () => calls.push(['initStrudel']),
      addEventListener: (k, fn) => { (listeners[k] ??= []).push(fn); },
    },
    console,
  };
  globals.globalThis = globals;
  const fn = new Function(...Object.keys(globals), `"use strict";\n${script}\n; return { DATA: typeof DATA !== 'undefined' ? DATA : null, play: typeof play !== 'undefined' ? play : null, render: typeof render !== 'undefined' ? render : null, items: typeof items !== 'undefined' ? items : null, codeFor: typeof codeFor !== 'undefined' ? codeFor : null };`);
  const api = fn(...Object.values(globals));
  return { api, calls, byId, document, listeners };
}
