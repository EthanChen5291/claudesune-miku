// Function-name validation (§3.6): every function called in a song must exist in
// the installed pinned packages (ground truth) or be locally defined. Unknown
// function → lint ERROR before evaluation, not a runtime surprise.
// Also flags two Strudel gotchas: repeated single-use effects on one chain, and
// same-orbit delay/reverb conflicts.

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as core from '@strudel/core';
import * as mini from '@strudel/mini';
import * as tonal from '@strudel/tonal';
import { reference } from '@strudel/reference';

const { Pattern } = core;

function installedNames() {
  const names = new Set();
  for (const mod of [core, mini, tonal]) {
    for (const [k, v] of Object.entries(mod)) if (typeof v === 'function') names.add(k);
  }
  const descs = Object.getOwnPropertyDescriptors(Pattern.prototype);
  for (const [k, d] of Object.entries(descs)) {
    if (typeof d.value === 'function') names.add(k); // skip getters: touching them throws on the bare prototype
  }
  // Harness/REPL globals we provide (see evaluate.js makeStubs) + prototype hooks we own.
  for (const k of ['setcpm', 'setcps', 'samples', 'hush', 'all', 'm', 'p', 'q']) names.add(k);
  // JS builtins commonly used in songs.
  for (const k of ['Array', 'Math', 'Object', 'JSON', 'String', 'Number', 'Boolean',
    'parseInt', 'parseFloat', 'isNaN', 'Map', 'Set', 'console']) names.add(k);
  return names;
}

const INSTALLED = installedNames();
const DOCUMENTED = new Set(Object.keys(reference ?? {}));

// Effects that are single-use per pattern chain (§3.6 gotcha #1) — a repeat
// silently overrides the earlier call.
const SINGLE_USE = new Set(['lpf', 'hpf', 'bpf', 'cutoff', 'hcutoff', 'gain', 'pan', 'room',
  'delay', 'shape', 'distort', 'crush', 'coarse', 'speed', 'attack', 'decay', 'sustain',
  'release', 'orbit', 'bank', 'vowel']);

/**
 * Lint .strudel source. Returns { errors: [...], warnings: [...] } with line numbers.
 * Parses the RAW source (labeled statements are valid JS), so locations match the file.
 */
export function lintSong(source) {
  const errors = [];
  const warnings = [];
  let ast;
  try {
    ast = acorn.parse(source, { ecmaVersion: 'latest', allowAwaitOutsideFunction: true, locations: true });
  } catch (e) {
    return { errors: [{ line: e.loc?.line ?? 0, msg: `syntax error: ${e.message}` }], warnings };
  }

  // Locally declared names (top-level and nested) are legal callees.
  const local = new Set();
  walk.full(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier') local.add(n.id.name);
    if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression')) {
      if (n.id?.name) local.add(n.id.name);
      for (const p of n.params) if (p.type === 'Identifier') local.add(p.name);
      if (n.params) for (const p of n.params) if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') local.add(p.left.name);
    }
    if (n.type === 'ObjectPattern') for (const p of n.properties) if (p.value?.type === 'Identifier') local.add(p.value.name);
  });

  const known = (name) => INSTALLED.has(name) || local.has(name);

  walk.full(ast, (n) => {
    if (n.type !== 'CallExpression') return;
    const callee = n.callee;
    let name = null;
    if (callee.type === 'Identifier') name = callee.name;
    else if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
      // obj.method(...) — validate the method name unless obj is a local non-pattern
      // helper container (Math.floor etc. handled by builtin objects list).
      const root = rootObject(callee);
      if (root && ['Math', 'Object', 'JSON', 'Array', 'String', 'Number', 'console'].includes(root)) return;
      name = callee.property.name;
    }
    if (!name) return;
    if (!known(name)) {
      const documented = DOCUMENTED.has(name);
      errors.push({
        line: n.loc.start.line,
        msg: documented
          ? `"${name}" is documented in @strudel/reference but NOT available in the pinned packages (1.1.0) — do not use it`
          : `unknown function "${name}" — not in installed @strudel exports, not locally defined`,
      });
    }
  });

  // Gotcha #1: repeated single-use effect in one method chain.
  walk.full(ast, (n) => {
    if (n.type !== 'ExpressionStatement') return;
    const seen = new Map();
    let cur = n.expression;
    while (cur && cur.type === 'CallExpression' && cur.callee.type === 'MemberExpression' && !cur.callee.computed) {
      const nm = cur.callee.property.name;
      if (SINGLE_USE.has(nm)) seen.set(nm, (seen.get(nm) ?? 0) + 1);
      cur = cur.callee.object;
    }
    for (const [nm, count] of seen) {
      if (count > 1) warnings.push({
        line: n.loc.start.line,
        msg: `.${nm}() applied ${count}× in one chain — later call silently overrides the earlier (single-use effect)`,
      });
    }
  });

  // Gotcha #2: delay/reverb on multiple layers sharing an orbit. Heuristic on source:
  // count layers using room/delay without an explicit .orbit().
  const chains = [];
  for (const node of ast.body) {
    if (node.type !== 'LabeledStatement' && labelOfExpr(node) == null && node.type !== 'ExpressionStatement') continue;
    const text = source.slice(node.start, node.end);
    const usesSpace = /\.(room|delay)\s*\(/.test(text);
    const hasOrbit = /\.orbit\s*\(/.test(text);
    if (usesSpace) chains.push({ line: node.loc.start.line, hasOrbit });
  }
  const unassigned = chains.filter((c) => !c.hasOrbit);
  if (unassigned.length > 1) {
    warnings.push({
      line: unassigned[1].line,
      msg: `${unassigned.length} layers use delay/reverb without explicit .orbit() — one delay + one reverb per orbit; assign orbits deliberately (§3.6)`,
    });
  }

  return { errors, warnings };
}

function rootObject(member) {
  let cur = member;
  while (cur.type === 'MemberExpression') cur = cur.object;
  return cur.type === 'Identifier' ? cur.name : null;
}

function labelOfExpr(node) {
  return node.type === 'LabeledStatement' ? node.label.name : null;
}
