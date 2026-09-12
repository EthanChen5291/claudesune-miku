// src/index.js — the PUBLIC package surface (r38 packaging).
//
// WHY THIS FILE EXISTS. src/cli.js ends in `main().catch(...)`, so importing it
// RUNS the CLI. It can be a `bin`, never the module entry. This is the entry.
//
// WHAT IS IN SCOPE. The composition tier only — the part that is pure JS and
// opens no asset files. Measured before writing this: nothing re-exported below
// reads from vendor/, audios/ or audition/. That property is the whole reason
// the engine is shippable while the render tiers are not, so it is a contract,
// not an accident: anything added here must keep it.
//
// WHAT IS DELIBERATELY NOT HERE.
//   - The HQ render tier (scripts/render-hq.mjs, src/lib/hq-instruments.js).
//     It needs vendor/sfz + DawDreamer + a Surge VST3 and is a SERVER, not a
//     library import.
//   - The vocal tier (scripts/render-vocal.mjs). Same, plus a licence: the
//     Tiger voicebank sells commercial use separately and the RVC model in
//     vendor/vocal/rvc-models is not licensable at all.
//   - src/lib/sample-pack-def.js. Seven of its rows (md_*) are the commercial
//     Miraleste kit and cannot be redistributed.
//   - scripts/audition-songs.mjs, the full prompt->song generator. It is a
//     10k-line PAGE BUILDER carrying every per-song pin in SONG_OPTS, not a
//     library function. Exposing it as an API is its own piece of work; until
//     then consumers drive the four stages below the way cli.js `generate`
//     does, which is the path that is actually exercised by the test suite.
//
// STABILITY. Every name below is re-exported under the identifier it already
// has, verified against its defining module. Subpath imports
// ("motif-engine/harness" etc.) are declared in package.json#exports for
// consumers who want one stage without loading the rest.

// --- stage 1: a spec compiles to a song plan ---
export { compile } from './compiler/compile.js';

// --- stage 2: the plan binds to Strudel source ---
export { makeBindFn, makeTransitionFn } from './binder/adapter.js';

// --- stage 3: measurement. The most reusable thing in the repo: it evaluates
// Strudel source to timed events, which is how every claim in DECISIONS.md was
// checked. `evaluateSong` + `hapsByLabel` are the documented probe pattern. ---
export { verifySong, checkEdit } from './harness/index.js';
export { evaluateSong, hapsByLabel, songHaps } from './harness/evaluate.js';

// --- stage 4: emit ---
export { songToMidi } from './emit/midi.js';

// --- prompt compilation (emotion + environment -> a vibe) ---
export { compileVibe } from './lib/vibes.js';
