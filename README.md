# motif-engine — Strudel Song Engine

Iterative, verified AI music generation for [Strudel](https://strudel.cc). An LLM
generates and — critically — **edits** full songs, where every edit is mechanically
gated: touch only what you were asked to touch, or the edit is rejected with the
leak named. Built from the handoff in [doc.md](doc.md); every judgment call is
logged in [DECISIONS.md](DECISIONS.md).

**If you just want to make and edit music: read [SESSIONS.md](SESSIONS.md) (3 commands).**

## Setup

```
npm install     # versions are exact-pinned; see below
npm test        # 38 tests, all green
```

### The version pin (do not "upgrade")

Everything is pinned to **Strudel 1.1.0** (`@strudel/core`, `mini`, `tonal`,
`transpiler`, `reference`, and the unpkg REPL bundle in every `listen.html`).
Latest `@strudel/core` imports `@kabelsalat/web`, which is browser-only and crashes
under Node — headless verification (the entire point of this engine) dies with it.
1.1.0 is the verified-good version (doc.md §2). Also pinned-around: `.mode('root:g2')
.voicing()` is broken at 1.1.0 (we emit `rootNotes()` instead — DECISIONS D3), and
the transpiler mini-fies double-quoted object keys (D12).

## How it works

```
spec.json ──compile──> labeled .strudel + meta.json
              │
              ├── binder: rhythm entry × contour × harmony → resolved notes
              │           (chord-tone snapping on accents, accents→gain, swing,
              │            cadence targets, interlock complement scoring)
              │
verify: evaluate headlessly (same transpiler as the REPL) → per-label haps
        → metrics, relational musts, harmonic/motif/structural assertions
              │
edit:   old vs new hap signatures per label → containment gate
        (allowed labels/bindings/aspects/sections; leak ⇒ REJECT)
              │
every accepted version ──> vN.strudel (paste-ready) + listen.html (mutes, A/B)
                           + report.md (what changed, what to listen for)
```

- **Source format** (§3.1): labeled layers, every cross-cutting concern hoisted to a
  named `let`. Every likely edit request maps to one contiguous region — one
  binding per (label × section material).
- **Song spec** (§3.2): a section *graph* — `recalls`/`vary`, `contrasts_with`,
  `sets_up` + `withhold` (the withheld bass returning IS the payoff), `must`
  constraints measured relationally (`"density": "> 1.3x A"`).
- **Libraries** (§3.5) are abstract only: onset fractions + real accent profiles,
  scale-degree contours, voicing shapes, declared interlock pairs, and transitions
  indexed by role boundary. No literal note strings, no mini-notation. Each entry
  documents the taste it encodes (`character`).
- **Transitions are first-class**: risers/fills/impacts live on their own labels
  with per-occurrence bindings ("make the LAST riser bigger" is one edit).

## The edit workflow

See [SESSIONS.md](SESSIONS.md) for commands and
[songs/neon-undertow/EDIT_SESSION.md](songs/neon-undertow/EDIT_SESSION.md) for a
real 6-edit session — including a rejected leaky edit and a musical regression
(verse edit silently killing the chorus lift) caught by the relational assertions.

## Adding library entries

Edit `src/lib/*.js`. Rules the tests enforce:
- rhythms: exact-fraction onsets (strings like `'3/16'`) or `euclid: [k,n,rot]`;
  an accent per onset; accents must NOT be uniform; a `character` line ≥ 20 chars.
- contours: integer scale degrees + `shape` + `character`.
- voicing shapes: per-quality semitone-offset strings, **array-valued** when
  registered (D-empirical: string values silently fail at 1.1.0).
- interlock pairs: declare co-designed rhythm pairs so intended coincidences
  aren't flagged.
- transitions: `from`/`to` roles, `placement: 'before'|'at'`, a `make(bars)` that
  emits 1.1.0-safe source using ubiquitous sample names only.
- **progressions are NOT hand-edited**: `src/lib/progressions.js` is generated from
  `vendor/ldrolez/chords.py` by `node scripts/import-ldrolez.mjs` (D28). It is a
  ratified:false *candidate pool*, queried with `findProgressions()`; entries are
  promoted by ear, and that is when a `character` line gets written.
- chord qualities everywhere use the **ireal dialect** (`sus` not `sus4`, `o`/`o7`
  not `dim`) — one symbol has to be valid on the harmony timeline AND in a `me_*`
  voicing shape. Lint fails a symbol that resolves in neither (D28).

Then `npm test` — library invariants are asserted.

## Layout

```
src/harness/    evaluate (transpiler+registry), signatures+containment, metrics,
                assertions, lint (names validated against installed exports), chords
src/compiler/   spec → labeled file + meta (form masks, harmony, materials)
src/binder/     bind (snapping/accents/swing/cadence), theory, interlock, adapter
src/lib/        rhythms, contours, voicings, interlocks, transitions
src/emit/       listen.html + report.md emitters
src/cli.js      generate / edit / verify
songs/          demo songs (4/4 house + 7/8 dorian) + the edit session
eval/           before/after evaluation: B0 (default-Claude), B1 (freehand Strudel),
                AFTER (engine), scorer, REPORT.md
test/           38-test suite incl. the §5 acceptance cases
```
