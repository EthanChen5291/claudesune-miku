// listen.html emitter (§5.6): local page embedding the @strudel/repl web
// component (unpkg, PINNED to 1.1.0 to match the engine), with:
//   - play via the REPL's own transport
//   - per-label mute toggles (rewrites `label:` <-> `_label:` — native Strudel muting)
//   - before/after A-B switch when two versions are given
//   - paste-ready source + one-click copy + strudel.cc fallback link
// No build step, no dependencies beyond the pinned unpkg bundle.

const REPL_BUNDLE = 'https://unpkg.com/@strudel/repl@1.1.0/dist/index.js';

export function renderListenHtml({ title, versions, labels, listenFor = [], notes = [] }) {
  if (!versions?.length) throw new Error('need at least one version');
  const data = {
    title,
    versions: versions.map((v) => ({ name: v.name, source: v.source, note: v.note ?? '' })),
    labels,
    listenFor,
    notes,
  };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — listen</title>
<style>
  :root { color-scheme: dark; }
  body { font: 14px/1.5 -apple-system, system-ui, sans-serif; margin: 0; background: #14141a; color: #e8e8ee; }
  header { padding: 14px 20px 10px; border-bottom: 1px solid #2b2b36; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
  h1 { font-size: 16px; margin: 0 12px 0 0; }
  .vswitch button { margin-right: 6px; padding: 6px 14px; border-radius: 6px; border: 1px solid #3a3a4a; background: #1e1e28; color: #cfcfe0; cursor: pointer; font-weight: 600; }
  .vswitch button.active { background: #4c6ef5; border-color: #4c6ef5; color: #fff; }
  .mutes { display: flex; flex-wrap: wrap; gap: 4px 12px; padding: 8px 20px; border-bottom: 1px solid #2b2b36; }
  .mutes label { user-select: none; cursor: pointer; opacity: .9; }
  .mutes input { accent-color: #4c6ef5; }
  main { padding: 12px 20px; }
  #repl { min-height: 420px; }
  strudel-editor { display: block; }
  .panel { background: #1b1b24; border: 1px solid #2b2b36; border-radius: 8px; padding: 12px 16px; margin: 14px 0; }
  .panel h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #9a9ab0; margin: 0 0 8px; }
  .panel ul { margin: 0; padding-left: 18px; }
  button.copy { padding: 6px 12px; border-radius: 6px; border: 1px solid #3a3a4a; background: #1e1e28; color: #cfcfe0; cursor: pointer; }
  a { color: #74a0ff; }
  .hint { color: #9a9ab0; font-size: 12.5px; }
</style>
</head>
<body>
<header>
  <h1>${esc(title)}</h1>
  <div class="vswitch" id="vswitch"></div>
  <span class="hint">switch version or mutes, then hit play in the editor (ctrl+enter updates)</span>
</header>
<div class="mutes" id="mutes"></div>
<main>
  <div id="repl"></div>
  <div class="panel" id="listenfor" style="display:none"><h2>What to listen for</h2><ul id="listenforList"></ul></div>
  <div class="panel">
    <h2>Paste-ready</h2>
    <button class="copy" id="copyBtn">Copy current code (with mutes)</button>
    <a id="ccLink" target="_blank" style="margin-left:12px">open on strudel.cc</a>
    <div class="hint" style="margin-top:6px">The embedded REPL is pinned to strudel 1.1.0 (same as the engine). strudel.cc runs latest — both play this code.</div>
  </div>
</main>
<script src="${REPL_BUNDLE}"></script>
<script>
const DATA = ${JSON.stringify(data)};
let currentVersion = DATA.versions.length - 1;
const muted = new Set();

function applyMutes(src) {
  // labels live at column 0 — anchoring without leading whitespace keeps
  // indented object keys (form masks) safe even when a section shares the name
  let out = src;
  for (const label of DATA.labels) {
    const on = new RegExp('^' + label + ':', 'm');
    const off = new RegExp('^_' + label + ':', 'm');
    if (muted.has(label)) out = out.replace(on, '_' + label + ':');
    else out = out.replace(off, label + ':');
  }
  return out;
}
function currentCode() { return applyMutes(DATA.versions[currentVersion].source); }
function render() {
  const holder = document.getElementById('repl');
  holder.innerHTML = '';
  const el = document.createElement('strudel-editor');
  el.setAttribute('code', currentCode());
  holder.appendChild(el);
  document.querySelectorAll('.vswitch button').forEach((b, i) => b.classList.toggle('active', i === currentVersion));
  document.getElementById('ccLink').href = 'https://strudel.cc/#' + encodeURIComponent(btoa(unescape(encodeURIComponent(currentCode()))));
}
const vs = document.getElementById('vswitch');
DATA.versions.forEach((v, i) => {
  const b = document.createElement('button');
  b.textContent = v.name;
  b.title = v.note || '';
  b.onclick = () => { currentVersion = i; render(); };
  vs.appendChild(b);
});
const ms = document.getElementById('mutes');
DATA.labels.forEach((label) => {
  const l = document.createElement('label');
  const c = document.createElement('input');
  c.type = 'checkbox'; c.checked = true;
  c.onchange = () => { c.checked ? muted.delete(label) : muted.add(label); render(); };
  l.appendChild(c); l.appendChild(document.createTextNode(' ' + label));
  ms.appendChild(l);
});
if (DATA.listenFor.length) {
  document.getElementById('listenfor').style.display = '';
  const ul = document.getElementById('listenforList');
  DATA.listenFor.forEach((x) => { const li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
}
document.getElementById('copyBtn').onclick = async () => {
  await navigator.clipboard.writeText(currentCode());
  document.getElementById('copyBtn').textContent = 'Copied ✓';
  setTimeout(() => document.getElementById('copyBtn').textContent = 'Copy current code (with mutes)', 1200);
};
render();
</script>
</body>
</html>`;
}

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
