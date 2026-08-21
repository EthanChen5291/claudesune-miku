#!/usr/bin/env node
// motif-engine CLI — the three commands (SESSIONS.md):
//   generate <spec.json> --out songs/<name>
//   edit <songdir> (--file edited.strudel | --spec newspec.json) --allow ... --note "..."
//   verify <songdir | file.strudel> [--meta meta.json]
// Every accepted generate/edit emits: vN.strudel (paste-ready), vN.meta.json,
// listen.html (per-label mutes + before/after A-B), report.md (§5.6).

import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { compile } from './compiler/compile.js';
import { makeBindFn, makeTransitionFn } from './binder/adapter.js';
import { verifySong, checkEdit } from './harness/index.js';
import { renderListenHtml } from './emit/listen.js';
import { songToMidi } from './emit/midi.js';
import { songHaps } from './harness/evaluate.js';
import { renderWav } from '../scripts/render-wav.mjs';
import { renderReport, listenForHints } from './emit/reportmd.js';
import { fmtMetricsTable, fmtAssertions, fmtContainment } from './harness/report.js';

const USAGE = `motif-engine

  generate <spec.json> --out <songdir>          compile + bind + verify + emit v0
  edit <songdir> --file <edited.strudel>        gate an edited source file
       [--spec <newspec.json>]                  ...or recompile from an edited spec
       --allow kick,hats --allow-binding bass_A scope: labels and/or hoisted bindings
       [--aspects sound,gain]                   lock other aspects even on allowed labels
       [--sections B]                           confine changes to a section's cycle ranges
       --note "make the hats busier"            what this edit is (goes in the report)
  verify <songdir | file.strudel> [--meta <meta.json>] [--json]
  export <songdir | file.strudel>               emit song.mid (haps -> MIDI, exact)
       [--out x.mid] [--from 0] [--to cycles]   cycle window (default: meta totalCycles)
       [--wav] [--soundfont f.sf2] [--gain 0.7] also render .wav via fluidsynth

Every accepted generate/edit writes: vN.strudel (paste-ready), vN.meta.json,
listen.html (per-label mutes, before/after A-B), report.md, session.log.md.`;

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'generate') return generate(rest);
  if (cmd === 'edit') return edit(rest);
  if (cmd === 'verify') return verify(rest);
  if (cmd === 'export') return exportCmd(rest);
  console.log(USAGE);
  process.exit(cmd ? 1 : 0);
}

function latestVersion(dir) {
  const vs = readdirSync(dir).map((f) => /^v(\d+)\.strudel$/.exec(f)).filter(Boolean).map((m) => Number(m[1]));
  return vs.length ? Math.max(...vs) : -1;
}
const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));

function emit(dir, n, { source, meta, verifyRes, editRes = null, note = null, prevSource = null, title }) {
  writeFileSync(join(dir, `v${n}.strudel`), source);
  writeFileSync(join(dir, `v${n}.meta.json`), JSON.stringify(meta, null, 2));
  const listenFor = editRes ? listenForHints(editRes, note) : defaultListenFor(verifyRes, meta);
  const labels = Object.keys(verifyRes.labels);
  const versions = [];
  if (prevSource != null) versions.push({ name: `before (v${n - 1})`, source: prevSource, note: 'pre-edit' });
  versions.push({ name: prevSource != null ? `after (v${n})` : `v${n}`, source, note: note ?? 'current' });
  writeFileSync(join(dir, 'listen.html'), renderListenHtml({ title: `${title} v${n}`, versions, labels, listenFor }));
  writeFileSync(join(dir, 'report.md'), renderReport({ title, version: `v${n}`, note, verify: verifyRes, edit: editRes, listenFor }));
  writeFileSync(join(dir, 'song.strudel'), source); // stable paste-ready pointer
  const logLine = `\n## v${n} — ${new Date().toISOString().slice(0, 16)}\n${note ?? 'initial generation'}\n` +
    (editRes ? editRes.containment.changelog.map((l) => `- ${l}`).join('\n') + '\n' : '');
  appendFileSync(join(dir, 'session.log.md'), logLine);
}

function defaultListenFor(verifyRes, meta) {
  const hints = [];
  const secs = Object.entries(meta.sections ?? {});
  for (const [name, s] of secs) {
    if (s.role === 'chorus') hints.push(`Section ${name} (chorus, cycles ${JSON.stringify(s.ranges)}) should lift relative to its verse.`);
    if ((s.withhold ?? []).length) hints.push(`Section ${name} withholds ${s.withhold.join(', ')} — their return is the payoff.`);
  }
  for (const t of meta.transitions ?? []) hints.push(`Transition "${t.name}" (${t.kind}) into ${t.to} at cycles ${t.window[0]}–${t.window[1]}.`);
  return hints;
}

function songState(dir) {
  const p = join(dir, 'state.json');
  return existsSync(p) ? JSON.parse(read(p)) : {};
}
function writeSongState(dir, state) {
  writeFileSync(join(dir, 'state.json'), JSON.stringify(state, null, 2));
}

async function generate(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: { out: { type: 'string' }, json: { type: 'boolean', default: false } },
  });
  const specPath = positionals[0];
  if (!specPath || !values.out) { console.error('usage: generate <spec.json> --out <songdir>'); process.exit(1); }
  if (existsSync(values.out) && latestVersion(values.out) >= 0) {
    console.error(`${values.out} already has versions — use \`edit\` (generate never overwrites a song's history)`);
    process.exit(1);
  }
  const spec = readJson(specPath);
  const { source, meta } = compile(spec, { bindFn: makeBindFn(spec), transitionFn: makeTransitionFn(spec) });
  const verifyRes = await verifySong(source, { meta });
  if (!verifyRes.evalOk || verifyRes.lint.errors.length) {
    console.error('GENERATE FAILED:', verifyRes.error ?? JSON.stringify(verifyRes.lint.errors));
    process.exit(2);
  }
  mkdirSync(values.out, { recursive: true });
  writeFileSync(join(values.out, 'spec.json'), JSON.stringify(spec, null, 2));
  emit(values.out, 0, { source, meta, verifyRes, title: meta.title });
  printVerify(verifyRes, meta, values.json);
  const fails = verifyRes.assertions.filter((a) => !a.pass && a.severity === 'fail');
  console.log(`\nwrote ${values.out}/v0.strudel + listen.html + report.md`);
  if (fails.length) { console.error(`\n${fails.length} assertion FAILURES — see report.md`); process.exit(3); }
}

async function edit(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: {
      file: { type: 'string' }, spec: { type: 'string' },
      allow: { type: 'string', default: '' }, 'allow-binding': { type: 'string', default: '' },
      aspects: { type: 'string' }, sections: { type: 'string' },
      note: { type: 'string' }, json: { type: 'boolean', default: false },
      reconciled: { type: 'boolean', default: false },
    },
  });
  const dir = positionals[0];
  if (!dir || (!values.file && !values.spec)) { console.error('usage: edit <songdir> (--file f.strudel | --spec s.json) --allow ... --note "..."'); process.exit(1); }
  if (values.file && values.spec) { console.error('pass EITHER --file OR --spec, not both (they are different edit sources)'); process.exit(1); }
  const n = latestVersion(dir);
  if (n < 0) { console.error(`no versions in ${dir}`); process.exit(1); }
  const oldSource = read(join(dir, `v${n}.strudel`));
  const oldMeta = readJson(join(dir, `v${n}.meta.json`));

  // Divergence guard (addendum A1.1 adjudication): a hand edit on a spec-backed
  // song marks it diverged; recompiling from spec would silently revert the hand
  // edit, so it is BLOCKED until the spec is reconciled.
  const state = songState(dir);
  let newSource, newMeta;
  if (values.spec) {
    if (state.diverged && !values.reconciled) {
      console.error(`REFUSED: ${dir} diverged from its spec at v${state.divergedAt} (hand edit: "${state.divergedNote ?? ''}").`);
      console.error('A recompile would silently revert that edit. Update the spec to reflect it, then pass --reconciled; or keep editing with --file.');
      process.exit(5);
    }
    const spec = readJson(values.spec);
    ({ source: newSource, meta: newMeta } = compile(spec, { bindFn: makeBindFn(spec), transitionFn: makeTransitionFn(spec) }));
  } else {
    newSource = read(values.file);
    newMeta = oldMeta; // hand edits keep the structural meta
  }

  const allowLabels = csv(values.allow);
  const allowBindings = csv(values['allow-binding']);
  const allowAspects = values.aspects ? csv(values.aspects) : null;
  let allowWindows = null;
  if (values.sections) {
    allowWindows = csv(values.sections).flatMap((s) => {
      const sec = oldMeta.sections[s];
      if (!sec) { console.error(`unknown section "${s}"`); process.exit(1); }
      return sec.ranges;
    });
  }

  const res = await checkEdit(oldSource, newSource, { allowLabels, allowBindings, allowAspects, allowWindows, meta: oldMeta });
  if (!res.ok) {
    console.error(`EDIT REJECTED (${res.stage}): ${res.reason}`);
    if (res.containment) console.error('\n' + fmtContainment(res.containment));
    process.exit(4);
  }
  const verifyRes = await verifySong(newSource, { meta: newMeta });
  const prevVerify = await verifySong(oldSource, { meta: oldMeta });
  const prevFails = new Set(prevVerify.assertions.filter((a) => !a.pass && a.severity === 'fail').map((a) => a.name));
  const newFails = verifyRes.assertions.filter((a) => !a.pass && a.severity === 'fail' && !prevFails.has(a.name));
  emit(dir, n + 1, {
    source: newSource, meta: newMeta, verifyRes, editRes: res,
    note: values.note ?? null, prevSource: oldSource, title: newMeta.title ?? basename(dir),
  });
  console.log(fmtContainment(res.containment));
  printVerify(verifyRes, newMeta, values.json);
  console.log(`\nACCEPTED -> ${dir}/v${n + 1}.strudel (listen.html has before/after A-B)`);
  if (newFails.length) {
    console.log(`\n⚠ MUSICAL REGRESSION: this contained edit broke ${newFails.length} assertion(s) that previously passed:`);
    for (const f of newFails) console.log(`  ✗ ${f.name} — ${f.detail}`);
    console.log('  The edit is accepted (containment is the gate); fix or re-declare the constraint in a follow-up.');
  }
  if (values.file && existsSync(join(dir, 'spec.json'))) {
    writeSongState(dir, { ...state, diverged: true, divergedAt: n + 1, divergedNote: values.note ?? null });
    console.log(`\nnote: song marked DIVERGED from spec.json (hand edit). Recompile-from-spec is blocked until --reconciled.`);
  } else if (values.spec && values.reconciled && state.diverged) {
    writeSongState(dir, { ...state, diverged: false, reconciledAt: n + 1 });
  }
  if (values.spec) writeFileSync(join(dir, 'spec.json'), JSON.stringify(readJson(values.spec), null, 2));
}

async function verify(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: { meta: { type: 'string' }, json: { type: 'boolean', default: false }, cycles: { type: 'string' } },
  });
  let target = positionals[0];
  if (!target) { console.error('usage: verify <songdir | file.strudel>'); process.exit(1); }
  let source, meta = null;
  if (existsSync(target) && !target.endsWith('.strudel')) {
    const n = latestVersion(target);
    if (n < 0) { console.error(`no versions in ${target}`); process.exit(1); }
    source = read(join(target, `v${n}.strudel`));
    meta = readJson(join(target, `v${n}.meta.json`));
    console.log(`verifying ${target}/v${n}.strudel`);
  } else {
    source = read(target);
    if (values.meta) meta = readJson(values.meta);
  }
  const res = await verifySong(source, { meta, cycles: values.cycles ? Number(values.cycles) : null });
  printVerify(res, meta, values.json);
  if (!res.evalOk || res.lint.errors.length) process.exit(2);
  if (res.assertions.some((a) => !a.pass && a.severity === 'fail')) process.exit(3);
}

async function exportCmd(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: {
      out: { type: 'string' }, meta: { type: 'string' },
      from: { type: 'string' }, to: { type: 'string' },
      wav: { type: 'boolean', default: false },
      soundfont: { type: 'string' }, gain: { type: 'string' },
    },
  });
  const target = positionals[0];
  if (!target) { console.error('usage: export <songdir | file.strudel> [--out song.mid] [--from a --to b] [--wav]'); process.exit(1); }
  let source, meta = null, outBase;
  if (existsSync(target) && !target.endsWith('.strudel')) {
    const n = latestVersion(target);
    if (n < 0) { console.error(`no versions in ${target}`); process.exit(1); }
    source = read(join(target, `v${n}.strudel`));
    meta = readJson(join(target, `v${n}.meta.json`));
    outBase = join(target, 'song');
    console.log(`exporting ${target}/v${n}.strudel`);
  } else {
    source = read(target);
    if (values.meta) meta = readJson(values.meta);
    outBase = target.replace(/\.strudel$/, '');
  }
  const from = values.from ? Number(values.from) : 0;
  let to = values.to ? Number(values.to) : meta?.totalCycles;
  if (to == null) { to = 16; console.log('warning: no --to and no meta totalCycles — exporting 16 cycles'); }

  const { evaluated, haps } = await songHaps(source, from, to);
  const res = songToMidi(haps, {
    cpm: evaluated.cpm, meter: meta?.meter ?? '4/4', from,
    title: meta?.title ?? basename(outBase),
  });
  const midPath = values.out ?? `${outBase}.mid`;
  writeFileSync(midPath, res.bytes);
  for (const w of res.warnings) console.log(`warning: ${w}`);
  for (const s of res.skipped) if (s.reason !== 'muted') console.log(`skipped ${s.label}: ${s.reason}`);
  for (const t of res.tracks) console.log(`  ${t.label.padEnd(18)} ${t.kind.padEnd(8)} ch ${String(t.channel + 1).padStart(2)}  ${String(t.notes).padStart(4)} notes`);
  console.log(`wrote ${midPath} (${Math.round(res.bpm * 100) / 100} bpm, ${meta?.meter ?? '4/4'}, cycles ${from}–${to})`);

  if (values.wav) {
    const wavPath = midPath.replace(/\.midi?$/i, '') + '.wav';
    const out = renderWav(midPath, wavPath, { soundfont: values.soundfont ?? null, gain: values.gain ? Number(values.gain) : 0.7 });
    console.log(`wrote ${out.wavPath} (${(out.bytes / 1e6).toFixed(1)} MB, soundfont: ${basename(out.soundfont)})`);
  }
}

function printVerify(res, meta, asJson) {
  if (asJson) {
    const { evaluated, haps, ...clean } = res;
    console.log(JSON.stringify(clean, null, 2));
    return;
  }
  console.log(`\nlint: ${res.lint.errors.length ? JSON.stringify(res.lint.errors) : 'clean'}${res.lint.warnings.length ? ` (${res.lint.warnings.length} warnings)` : ''}`);
  console.log(`eval: ${res.evalOk ? 'ok' : res.error}`);
  const perLabel = Object.fromEntries(Object.entries(res.labels).map(([l, i]) => [l, i.metrics]));
  console.log('\n' + fmtMetricsTable(perLabel));
  if (res.assertions?.length) {
    console.log('\nassertions:');
    console.log(fmtAssertions(res.assertions));
  }
}

function csv(s) { return String(s ?? '').split(',').map((x) => x.trim()).filter(Boolean); }

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
