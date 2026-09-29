<div align="center">

<img src="docs/media/logo.png" width="140" alt="Claudesune Miku">

# Claudesune Miku

**The best Claude skill**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blueviolet.svg)](LICENSE)
[![Strudel](https://img.shields.io/badge/strudel-1.1.0%20pinned-teal.svg)](#installation)
[![Skill](https://img.shields.io/badge/claude-skill-green.svg)](SKILL.md)

Package name `motif-engine`

</div>

## Overview

Claudesune Miku is a [Strudel](https://strudel.cc) game-music engine. An **emotion** plus an **environment** compiles to harmony, accompaniment, a letter-form melody, companion lines, drums, a section-by-section arrangement, an HQ sampled render, and a sung vocal with generated Japanese lyrics. Every rule was learned from my keep/kill verdicts, round by round.

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

## Repository

| Path | Contents |
|---|---|
| `src/` | The engine: binder, libraries as data, harness, compiler, CLI |
| `scripts/` | The song generator and the HQ and vocal render tiers |
| `vendor/` | Generated SFZ maps and synth patches for the HQ tier; sample libraries are fetched, not tracked |
| `SKILL.md` | The Claude skill that drives the engine by ear |

The full working history, audition pages, judged songs, tests and the decision ledger live on the `dev` branch.

## Acknowledgements

[Strudel](https://strudel.cc), [sfizz](https://sfz.tools/sfizz/) with Salamander piano, VSCO and the SSO choir, [DawDreamer](https://github.com/DBraun/DawDreamer) with [Surge XT](https://surge-synthesizer.github.io), Unreal Instruments' Standard Guitar, [Neural Amp Modeler](https://www.neuralampmodeler.com) community captures, [DiffSinger](https://github.com/openvpi/DiffSinger) with the Tiger voicebank, and RVC. The name is a nod to the voice it is chasing; it is not affiliated with Crypton Future Media.
