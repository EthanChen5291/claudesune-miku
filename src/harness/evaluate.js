// Headless evaluation of a .strudel song file into per-label patterns.
//
// Uses @strudel/transpiler (pinned 1.1.0) so semantics match the strudel.cc REPL:
// double-quoted strings become mini-notation, labeled statements become .p('label')
// calls. We supply `m`, a registering `Pattern.prototype.p`, and stubs for
// browser-only globals. See DECISIONS.md D2.

import { transpiler } from '@strudel/transpiler';
import * as core from '@strudel/core';
import * as mini from '@strudel/mini';
import * as tonal from '@strudel/tonal';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const { Pattern } = core;

// ---------------------------------------------------------------------------
// Global scope construction (once per process)
// ---------------------------------------------------------------------------

const IDENT_RE = /^[A-Za-z_$][\w$]*$/;
const RESERVED = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete','do',
  'else','export','extends','finally','for','function','if','import','in','instanceof',
  'new','return','super','switch','this','throw','try','typeof','var','void','while',
  'with','yield','let','static','enum','await','implements','package','protected',
  'interface','private','public','arguments','eval','null','true','false',
]);

function buildScope() {
  const scope = Object.create(null);
  for (const mod of [core, mini, tonal]) {
    for (const [k, v] of Object.entries(mod)) {
      if (IDENT_RE.test(k) && !RESERVED.has(k)) scope[k] = v;
    }
  }
  // The transpiler emits m('<mini>', offset) for double-quoted strings.
  scope.m = (str, _offset) => mini.mini(str);
  return scope;
}

const BASE_SCOPE = buildScope();

// Browser/REPL globals that make no sound decision headlessly. setcpm records
// tempo; the rest are inert. Kept minimal on purpose: an unknown function in a
// song should FAIL evaluation (that's data), not be silently absorbed.
function makeStubs(state) {
  return {
    setcpm: (v) => { state.cpm = v; },
    setcps: (v) => { state.cpm = v * 60; },
    samples: (..._a) => Promise.resolve(),
    hush: () => {},
    all: (_fn) => {}, // REPL-wide fx hook; audio-only, ignored headlessly
  };
}

// Registry hookup: Pattern.prototype.p is not defined at 1.1.0 (verified), so we
// own it. Evaluation is single-threaded; a module-level current registry is safe.
let currentRegistry = null;
Pattern.prototype.p = function (label) {
  if (currentRegistry) currentRegistry.push([String(label), this]);
  return this;
};
// The REPL also exposes .q (quiet) — map it to a muted registration for safety.
Pattern.prototype.q = function (label) {
  if (currentRegistry) currentRegistry.push(['_' + String(label), this]);
  return this;
};

// ---------------------------------------------------------------------------
// Static analysis of the transpiled program (bindings + label dependencies)
// ---------------------------------------------------------------------------

function parse(code) {
  return acorn.parse(code, { ecmaVersion: 'latest', allowAwaitOutsideFunction: true });
}

function declaredNamesOf(node) {
  const names = [];
  if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) collectPatternNames(d.id, names);
  } else if (node.type === 'FunctionDeclaration' && node.id) {
    names.push(node.id.name);
  }
  return names;
}

function collectPatternNames(id, out) {
  if (!id) return;
  if (id.type === 'Identifier') out.push(id.name);
  else if (id.type === 'ObjectPattern') for (const p of id.properties) collectPatternNames(p.value ?? p.argument, out);
  else if (id.type === 'ArrayPattern') for (const el of id.elements) collectPatternNames(el, out);
  else if (id.type === 'AssignmentPattern') collectPatternNames(id.left, out);
  else if (id.type === 'RestElement') collectPatternNames(id.argument, out);
}

// Identifiers referenced by a statement, minus names the statement DECLARES
// itself (function params, arrow params, local lets) — a lambda parameter named
// like a hoisted binding must not credit the label with that binding as a dep
// (review finding: over-crediting let allowBindings whitelist unrelated labels).
function identifiersIn(node, into) {
  const shadowed = new Set();
  walk.full(node, (n) => {
    if (n.type === 'VariableDeclarator') { const out = []; collectPatternNames(n.id, out); out.forEach((x) => shadowed.add(x)); }
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
      if (n.id?.name) shadowed.add(n.id.name);
      for (const p of n.params ?? []) { const out = []; collectPatternNames(p, out); out.forEach((x) => shadowed.add(x)); }
    }
  });
  walk.simple(node, {
    Identifier(n) { if (!shadowed.has(n.name)) into.add(n.name); },
  });
  return into;
}

// If an expression statement's outermost call chain ends in .p('label'), return the label.
function labelOfStatement(node) {
  if (node.type !== 'ExpressionStatement') return null;
  const e = node.expression;
  if (e.type === 'CallExpression' && e.callee.type === 'MemberExpression'
      && !e.callee.computed && e.callee.property.name === 'p'
      && e.arguments.length === 1
      && (e.arguments[0].type === 'Literal')) {
    return String(e.arguments[0].value);
  }
  return null;
}

/**
 * Static structure of the (transpiled) song: which top-level bindings exist,
 * which bindings each binding references, and which bindings each label references
 * (transitively). Used by the containment check to expand "allowed bindings" into
 * the set of labels they may legitimately affect.
 */
export function analyzeStructure(transpiledCode) {
  const ast = parse(transpiledCode);
  const bindings = new Set();
  const bindingRefs = new Map(); // binding -> Set(binding it references)
  const labelRefs = new Map();   // label -> Set(binding referenced directly)

  for (const node of ast.body) {
    for (const n of declaredNamesOf(node)) bindings.add(n);
  }
  let anonSeq = 0; // '$' labels indexed IN STATEMENT ORDER, matching the runtime registry
  for (const node of ast.body) {
    const declared = declaredNamesOf(node);
    if (declared.length) {
      const refs = identifiersIn(node, new Set());
      for (const d of declared) {
        const s = new Set([...refs].filter((r) => bindings.has(r) && r !== d));
        bindingRefs.set(d, s);
      }
      continue;
    }
    let label = labelOfStatement(node);
    if (label != null) {
      if (label === '$') label = `$${++anonSeq}`;
      else if (label.startsWith('_')) label = label.slice(1) || '_';
      const refs = identifiersIn(node, new Set());
      labelRefs.set(label, new Set([...refs].filter((r) => bindings.has(r))));
    }
  }

  // Transitive closure: label depends on binding B if it references B or anything
  // that (transitively) references B.
  const closure = new Map();
  function expand(b, seen = new Set()) {
    if (closure.has(b)) return closure.get(b);
    if (seen.has(b)) return new Set();
    seen.add(b);
    const out = new Set([b]);
    for (const r of bindingRefs.get(b) ?? []) for (const x of expand(r, seen)) out.add(x);
    closure.set(b, out);
    return out;
  }
  const labelDeps = new Map();
  for (const [label, refs] of labelRefs) {
    const all = new Set();
    for (const r of refs) for (const x of expand(r)) all.add(x);
    labelDeps.set(label, all);
  }
  return { bindings, labelDeps };
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate .strudel source. Returns:
 *   labels:  Map<name, { pattern, muted, statementIndex }>  (name has no '_' prefix)
 *   bindings: Map<name, value> for top-level let/const/function bindings
 *   labelDeps: Map<labelName, Set<bindingName>> (transitive)
 *   cpm, warnings
 * Throws on syntax/runtime errors (message includes the underlying cause).
 */
// Evaluations serialize on a module-level lock: Pattern.prototype.p writes into a
// module-level registry, so two interleaved evaluateSong calls would cross-
// contaminate labels (review finding). The lock makes concurrency safe.
let evalLock = Promise.resolve();

export function evaluateSong(source, opts = {}) {
  const run = evalLock.then(() => evaluateSongInner(source, opts));
  evalLock = run.catch(() => {});
  return run;
}

async function evaluateSongInner(source, { quiet = true } = {}) {
  const warnings = [];
  let transpiled;
  try {
    transpiled = transpiler(source, { wrapAsync: false, addReturn: false, simpleLocs: true }).output
      ?? transpiler(source, { wrapAsync: false, addReturn: false }).output;
  } catch (e) {
    throw new Error(`transpile failed: ${e.message}`);
  }

  const { bindings: bindingNames, labelDeps } = analyzeStructure(transpiled);

  // Append a collector so top-level binding values escape the function scope.
  const collectible = [...bindingNames].filter((n) => IDENT_RE.test(n) && !RESERVED.has(n));
  const collector = `\n;__reportBindings({${collectible.map((n) => `${n}: (typeof ${n} === 'undefined' ? undefined : ${n})`).join(', ')}});`;

  const state = { cpm: null };
  const stubs = makeStubs(state);
  const scope = { ...BASE_SCOPE, ...stubs };
  const bindingsOut = new Map();
  scope.__reportBindings = (obj) => {
    for (const [k, v] of Object.entries(obj)) bindingsOut.set(k, v);
  };

  const names = Object.keys(scope);
  const body = `"use strict";\nreturn (async () => {\n${transpiled}${collector}\n})();`;

  const registry = [];
  currentRegistry = registry;
  const silencers = quiet ? interceptConsole() : null;
  try {
    const fn = new Function(...names, body);
    await fn(...names.map((n) => scope[n]));
  } catch (e) {
    throw new Error(`evaluation failed: ${e.message}`);
  } finally {
    currentRegistry = null;
    silencers?.restore();
  }

  // Resolve labels: '_x' = muted x; duplicates: last wins (REPL semantics), warn.
  const labels = new Map();
  let anon = 0;
  for (let i = 0; i < registry.length; i++) {
    let [raw, pattern] = registry[i];
    let muted = false;
    if (raw.startsWith('_')) { muted = true; raw = raw.slice(1) || '_'; }
    if (raw === '$') raw = `$${++anon}`;
    if (labels.has(raw)) warnings.push(`duplicate label "${raw}": later definition replaces earlier`);
    if (!(pattern instanceof Pattern)) {
      warnings.push(`label "${raw}" is not a Pattern (got ${typeof pattern}); skipped`);
      continue;
    }
    labels.set(raw, { pattern, muted, statementIndex: i });
  }
  if (labels.size === 0) warnings.push('no labeled patterns found');

  // Normalize labelDeps keys the same way ('_x' -> x).
  const deps = new Map();
  let anon2 = 0;
  for (const [k, v] of labelDeps) {
    let name = k.startsWith('_') ? k.slice(1) : k;
    if (name === '$') name = `$${++anon2}`;
    deps.set(name, v);
  }

  return { labels, bindings: bindingsOut, labelDeps: deps, cpm: state.cpm, warnings };
}

function interceptConsole() {
  const orig = { log: console.log, warn: console.warn, error: console.error };
  const noisy = /strudel|kabelsalat|window|\[voicing\]|\[scale\]/i;
  for (const k of Object.keys(orig)) {
    console[k] = (...a) => { if (!a.some((x) => noisy.test(String(x)))) orig[k](...a); };
  }
  return { restore: () => Object.assign(console, orig) };
}

/**
 * Per-label onset-filtered haps over [fromCycle, toCycle).
 * Returns Map<label, { muted, haps, error }>. Query errors are captured per label.
 */
export function hapsByLabel(evaluated, fromCycle = 0, toCycle = 16) {
  const out = new Map();
  for (const [name, { pattern, muted }] of evaluated.labels) {
    let haps = [];
    let error = null;
    const silencers = interceptConsole();
    try {
      haps = pattern
        .queryArc(fromCycle, toCycle)
        .filter((h) => h.hasOnset())
        .sort((a, b) => a.whole.begin.sub(b.whole.begin).valueOf() || 0);
    } catch (e) {
      error = e.message;
    } finally {
      silencers.restore();
    }
    out.set(name, { muted, haps, error });
  }
  return out;
}

/** Convenience: evaluate a file's source and return haps in one call. */
export async function songHaps(source, fromCycle, toCycle) {
  const ev = await evaluateSong(source);
  return { evaluated: ev, haps: hapsByLabel(ev, fromCycle, toCycle) };
}
