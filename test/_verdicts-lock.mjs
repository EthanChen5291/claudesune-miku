// r42 — ONE LOCK OVER src/lib/verdicts.js FOR THE TEST SUITE.
//
// The problem it solves, measured rather than guessed: `test/songs.test.js`
// asserts that two consecutive generator runs produce a byte-identical
// audition/songs.html, and it failed in roughly two of three full-suite runs
// while passing alone every time. r41 recorded that as "several test files each
// run the generator". They do not — songs.test.js is the only file that
// executes it. What the other files do is rewrite the generator's INPUT:
// test/foundations.test.js (twice) and test/facets.test.js run
// `import-verdicts.mjs <fixture>`, which overwrites src/lib/verdicts.js and
// restores it in a `finally`. node --test runs files in parallel, so a
// fixture's verdicts can be live for exactly one of the two builds.
//
// A before/after byte check on verdicts.js does NOT catch it: the foreign write
// and its restore both happen inside the window, so the file looks unchanged at
// both ends while the build in the middle saw something else. The fix is
// mutual exclusion — a lock the writers take around their mutation and the
// reader takes around its build pair.
//
// `mkdirSync` is the lock: atomic on every platform, no library, and a stale
// directory (a crashed run) is stolen after the deadline rather than wedging
// the suite forever.
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const LOCK = join(tmpdir(), 'motif-engine-verdicts.lock');
const STALE_MS = 180000;
const sleep = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };

/** Take the lock. Pair with `releaseVerdictsLock()` in a `finally`. */
export function acquireVerdictsLock() {
  const deadline = Date.now() + STALE_MS;
  for (;;) {
    try { mkdirSync(LOCK); return; } catch {
      // steal a lock whose holder is older than any legitimate hold
      try { if (Date.now() - statSync(LOCK).mtimeMs > STALE_MS) rmSync(LOCK, { recursive: true, force: true }); } catch { /* raced */ }
      if (Date.now() > deadline) return; // never deadlock a test run over a lock
      sleep(25);
    }
  }
}

export function releaseVerdictsLock() { rmSync(LOCK, { recursive: true, force: true }); }

/** Run `fn` with exclusive access to src/lib/verdicts.js. */
export function withVerdictsLock(fn) {
  acquireVerdictsLock();
  try { return fn(); } finally { releaseVerdictsLock(); }
}
