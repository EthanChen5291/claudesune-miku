<div align="center">

<img src="docs/media/logo.png" width="140" alt="Claudesune Miku">

# Claudesune Miku

**The best Claude skill**

[![Decisions](https://img.shields.io/badge/decisions-D1%E2%80%93D150-blueviolet.svg)](DECISIONS.md)
[![Strudel](https://img.shields.io/badge/strudel-1.1.0%20pinned-teal.svg)](#installation)
[![Tests](https://img.shields.io/badge/tests-49%20files-green.svg)](#quick-start)
[![Doctrine](https://img.shields.io/badge/doctrine-CLAUDE.md-lightgrey.svg)](CLAUDE.md)

Package name `motif-engine`

</div>

## Overview

Claudesune Miku is a [Strudel](https://strudel.cc) game-music engine. An **emotion** plus an **environment** compiles to harmony, accompaniment, a letter-form melody, companion lines, drums, a section-by-section arrangement, an HQ sampled render, and a sung vocal with generated Japanese lyrics. Every rule was learned from my keep/kill verdicts, round by round, and the full ledger with rationale is [DECISIONS.md](DECISIONS.md).

It began as an LLM song *editor* with mechanically gated, containment-verified edits ([doc.md](doc.md), [SESSIONS.md](SESSIONS.md)). That layer still works and is still tested; the centre of gravity is now the generator and the audition loop around it.

## How a song is made

```
┌──────────────────────────────────────────┐
│  PROMPT        emotion + environment     │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  HARMONY       a chord progression       │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  MELODY        letter form, A B A'       │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  LAYERS        accompaniment, drums      │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  ARRANGEMENT   sections and handoffs     │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  RENDER        browser or HQ samplers    │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│  VOCAL         Japanese lyrics, sung     │
└──────────────────────────────────────────┘
```

The same prompt and song name always give the same song, so revisions compare against a fixed baseline instead of a re-roll.

## The round loop

1. Listen to an audition page; export a verdicts JSON.
2. `node scripts/import-verdicts.mjs <file>` regenerates `src/lib/verdicts.js`. Never edit it by hand.
3. Snapshot the judged page, make fixes, rebuild, and byte-compare every song's DATA. **Judged material is frozen**: a kept song pins its harmony and exemplar, and every new rule is gated so kept songs stay byte-identical.
4. `npm test`, re-render changed songs, run the adversarial verify workflow (`.claude/workflows/verify-round.js`: stability, per-claim refutation, support-versus-lead gain ratios, melody-grammar bands).
5. Append a numbered D-entry and update [todo.md](todo.md).

[CLAUDE.md](CLAUDE.md) is the working doctrine: the laws the ear has established, the traps that have bitten, and how to measure a song headlessly (`evaluateSong` and `hapsByLabel` in `src/harness/evaluate.js`).

## Installation

```sh
npm install        # Node 22+; Strudel 1.1.0 exact-pinned
```

**Do not upgrade Strudel.** Newer `@strudel/core` imports a browser-only module and dies under Node, and headless evaluation is how every song is measured. Two 1.1.0 quirks are worked around: `.voicing()` in root mode (D3) and mini-fied double-quoted object keys in the transpiler (D12).

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  BROWSER             │  │  HQ RENDER           │  │  VOCAL               │
│                      │  │                      │  │                      │
│  npm install         │  │  sfizz               │  │  Python 3.12 venv    │
│  nothing else        │  │  DawDreamer + Surge  │  │  onnxruntime, torch  │
│                      │  │  fluidsynth fallback │  │  infer_rvc_python    │
│                      │  │  ffmpeg              │  │  DiffSinger voicebank│
│                      │  │  vendor/ (ignored)   │  │  RVC model           │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

## Quick start

```sh
npm test                              # rebuilds audition/songs.html as part of the suite
node scripts/audition-songs.mjs       # 47 judged songs
npm run listen                        # serve audition/ at http://localhost:8765
node scripts/render-hq.mjs <song>     # HQ stems for one song (--reuse-stems keeps a cache)
node scripts/render-vocal.mjs <song>  # sing it and lay the vocal over the HQ mix
```

## Grammar quick reference

- Chord symbols use the ireal dialect: `Ab^7` not `Abmaj7`, `o` and `o7` not `dim`, `sus` not `sus4`. An unknown quality silently renders a plain triad; a test fails on `maj7` anywhere in the reel progressions.
- Onsets are bar-relative fractions (`'3/16'`). Sections are 4- or 8-bar multiples. Meter is 4/4 only (D92).

## Limitations

- My ear is the only quality signal. Please be kind.
- The bundled RVC targets are community models trained on Vocaloid output, and the voicebank is free for non-commercial use.
- `audios/` and `research/` corpora are analysis-only and gitignored. Promoting material means authoring a canon entry by hand; only ratified entries enter retrieval pools.

## Repository

| Path | Contents |
|---|---|
| `scripts/` | Song generator and audition pages, verdict and corpus importers, HQ and vocal render tiers |
| `src/binder/` | Figure and melody binding, cadence grammar, arrangement planner |
| `src/lib/` | All musical material as data, vibe tables, generated verdicts |
| `src/harness/` | Headless evaluate, hap signatures, containment gate, metrics, lint |
| `src/compiler/`, `src/cli.js` | The original spec-to-Strudel editor flow: generate, edit, verify, export |
| `audition/` | Self-contained pages with the Strudel REPL embedded; `hq/` holds local renders |
| `test/` | 49 files: song counts, harmony pins, page determinism, grammar, library invariants |
| `DECISIONS.md`, `CLAUDE.md`, `todo.md` | The ledger, the doctrine, and where things stand |

## Acknowledgements

[Strudel](https://strudel.cc), [sfizz](https://sfz.tools/sfizz/) with Salamander piano, VSCO and the SSO choir, [DawDreamer](https://github.com/DBraun/DawDreamer) with [Surge XT](https://surge-synthesizer.github.io), Unreal Instruments' Standard Guitar, [Neural Amp Modeler](https://www.neuralampmodeler.com) community captures, [DiffSinger](https://github.com/openvpi/DiffSinger) with the Tiger voicebank, and RVC. The name is a nod to the voice it is chasing; it is not affiliated with Crypton Future Media.
