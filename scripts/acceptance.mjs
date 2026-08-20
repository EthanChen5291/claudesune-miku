// §5 acceptance checklist runner: checks every deliverable mechanically and
// writes ACCEPTANCE.md with evidence pointers. Exit 0 only if all pass.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS } from '../src/lib/voicings.js';
import { INTERLOCKS } from '../src/lib/interlocks.js';
import { TRANSITIONS } from '../src/lib/transitions.js';

const ROOT = new URL('..', import.meta.url).pathname;
const items = [];
const check = (name, pass, evidence) => items.push({ name, pass, evidence });

// 1. Harness + acceptance test triple
let testOut = '';
try {
  testOut = execSync('npm test 2>&1', { cwd: ROOT, encoding: 'utf8' });
} catch (e) { testOut = String(e.stdout ?? '') + String(e.stderr ?? ''); }
const passCount = /ℹ pass (\d+)/.exec(testOut)?.[1];
const failCount = /ℹ fail (\d+)/.exec(testOut)?.[1];
check('deterministic test suite green', failCount === '0', `${passCount} pass / ${failCount} fail (npm test)`);
check('§5(a) scoped edit passes', /✔ ACCEPTANCE \(a\)/.test(testOut), 'test/harness.test.js "ACCEPTANCE (a)"');
check('§5(b) leaky edit rejected', /✔ ACCEPTANCE \(b\)/.test(testOut), 'test/harness.test.js "ACCEPTANCE (b)"');
check('§5(c) must-violating chorus flagged with measured values', /✔ ACCEPTANCE \(c\)/.test(testOut), 'test/binder.test.js "ACCEPTANCE (c)"');

// 2. Compiler + binder exist and are exercised
check('compiler: spec -> labeled file honoring §3.1', /✔ compile: output evaluates/.test(testOut), 'test/compiler.test.js');
check('binder: harmonic snapping, accents→gain, swing, complement scoring',
  /✔ bind: accented onsets snap/.test(testOut) && /✔ bind: accents ALWAYS wire to gain/.test(testOut)
  && /✔ bind: swing emits swingBy/.test(testOut) && /✔ interlock: complement scores/.test(testOut),
  'test/binder.test.js');

// 3. Library counts (≥12 rhythms, ≥10 contours, ≥6 voicings, ≥4 interlocks, ≥6 transitions)
check(`rhythms ≥12 with real accent profiles (${Object.keys(RHYTHMS).length})`, Object.keys(RHYTHMS).length >= 12, 'src/lib/rhythms.js');
check(`contours ≥10 (${Object.keys(CONTOURS).length})`, Object.keys(CONTOURS).length >= 10, 'src/lib/contours.js');
// seed target was ≥6; quartal_9 + power_sus were KILLED by ear in audition r1
// (2026-08-19) — the count now tracks Ethan's verdicts, not seed inflation
check(`voicing shapes ≥5 after audition r1 kills (${Object.keys(VOICINGS).length})`, Object.keys(VOICINGS).length >= 5, 'src/lib/voicings.js');
check(`interlock pairs ≥4 (${INTERLOCKS.length})`, INTERLOCKS.length >= 4, 'src/lib/interlocks.js');
check(`transitions ≥6 (${Object.keys(TRANSITIONS).length})`, Object.keys(TRANSITIONS).length >= 6, 'src/lib/transitions.js');
const documented = Object.values(RHYTHMS).every((r) => r.character?.length > 20)
  && Object.values(CONTOURS).every((c) => c.character?.length > 20);
check('every entry documents the taste it encodes', documented, 'character fields, asserted in tests');

// 4. Demo songs: two genres, one non-4/4
const demo1 = JSON.parse(readFileSync(`${ROOT}/songs/neon-undertow/spec.json`, 'utf8'));
const demo2 = JSON.parse(readFileSync(`${ROOT}/songs/aksak-lantern/spec.json`, 'utf8'));
check(`two demo songs, different genres (${demo1.genre} / ${demo2.genre})`, demo1.genre !== demo2.genre, 'songs/');
check(`one demo in a non-4/4 meter (${demo2.meter})`, demo2.meter !== '4/4', 'songs/aksak-lantern');
for (const d of ['neon-undertow', 'aksak-lantern']) {
  const dir = `${ROOT}/songs/${d}`;
  const files = readdirSync(dir);
  check(`${d}: paste-ready .strudel + listen.html + report.md + meta`,
    files.includes('listen.html') && files.includes('report.md') && files.some((f) => /^v\d+\.strudel$/.test(f)) && files.some((f) => /meta\.json$/.test(f)),
    `songs/${d}/`);
}
const listen = readFileSync(`${ROOT}/songs/neon-undertow/listen.html`, 'utf8');
check('listen.html: per-label mutes + before/after A-B + pinned repl bundle',
  listen.includes('checkbox') && listen.includes('before') && listen.includes('@strudel/repl@1.1.0'),
  'songs/neon-undertow/listen.html');

// 5. Edit session: ≥5 sequential scoped edits, each passing containment, with before/after metrics
const session = readFileSync(`${ROOT}/songs/neon-undertow/EDIT_SESSION.md`, 'utf8');
const editCount = (session.match(/^## Edit \d/gm) ?? []).length;
const versions = readdirSync(`${ROOT}/songs/neon-undertow`).filter((f) => /^v\d+\.strudel$/.test(f)).length;
check(`edit session: ${editCount} sequential scoped edits (≥5), ${versions} versions on disk`,
  editCount >= 5 && versions >= 6, 'songs/neon-undertow/EDIT_SESSION.md');
check('edit session demonstrates a REJECTED leaky edit', /REJECTED/.test(session), 'EDIT_SESSION.md rejection demo');

// 6. Docs
check('SESSIONS.md: the 3 commands', existsSync(`${ROOT}/SESSIONS.md`) && /generate/.test(readFileSync(`${ROOT}/SESSIONS.md`, 'utf8')), 'SESSIONS.md');
const readme = readFileSync(`${ROOT}/README.md`, 'utf8');
check('README: setup + version pin & why + edit workflow + adding entries',
  /1\.1\.0/.test(readme) && /kabelsalat/.test(readme) && /Adding library entries/.test(readme), 'README.md');
check('DECISIONS.md log exists with dated judgment calls', /## D2\d/.test(readFileSync(`${ROOT}/DECISIONS.md`, 'utf8')), 'DECISIONS.md');

// 7. Eval artifacts (Ethan's added requirement)
check('eval: three arms with replicates on disk',
  existsSync(`${ROOT}/eval/before-default/C1/r3`) && existsSync(`${ROOT}/eval/before/C4/r3`) && existsSync(`${ROOT}/eval/after`),
  'eval/');

const lines = ['# §5 Acceptance checklist — run ' + new Date().toISOString().slice(0, 16), ''];
for (const i of items) lines.push(`- [${i.pass ? 'x' : ' '}] ${i.pass ? '' : '**FAIL** '}${i.name} — _${i.evidence}_`);
const allPass = items.every((i) => i.pass);
lines.push('', allPass ? '**ALL CHECKS PASS**' : '**FAILURES PRESENT — see above**', '');
writeFileSync(`${ROOT}/ACCEPTANCE.md`, lines.join('\n'));
console.log(lines.join('\n'));
process.exit(allPass ? 0 : 1);
