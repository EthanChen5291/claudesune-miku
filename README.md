<div align="center">

<img src="docs/media/logo.png" width="140" alt="Claudesune Miku">

# Claudesune Miku

**THE BEST CLAUDE SKILL**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blueviolet.svg)](LICENSE)
[![Strudel](https://img.shields.io/badge/strudel-1.1.0%20pinned-teal.svg)](#installation)
[![Skill](https://img.shields.io/badge/claude-skill-green.svg)](SKILL.md)

Package name `motif-engine`

</div>

## What is Claudesune Miku?

Outside of model APIs such as Suno, Udio, or Treblo, quality AI music generation APIs are highly limited, and, where they exist, accumulate high costs over time. Claudesune Miku aims to bring music generation back to home base, honing Claude's understandings of musical intent, fine-grained editing, "quality" sample libraries, deterministic outputs, and arrangement theory.

## Why is Claudesune Miku?

The name is derived from the popular Japanese Vocaloid voicebank, **Hatsune Miku**. I finalized this project in the weeks leading up to Hatsune Miku's 19th anniversary, and wanted to pay respect to the idol behind genius inventions such as Nyan Cat and (revised) Ievan Polkka. The Vocaloid bank was added as a token of appreciation.

## The Problem of "Song Iteration"

Music producers don't "one-shot" songs. In fact, artists spend up to 40+ hours on one track iterating and polishing. Thus, as AI becomes more and more incorporated into the arts, it is important that edits across sessions:

  (1.) accurately map vague intent ("change the middle part to be scarier") to chord progression, instrument, and layering tweaks
  (2.) are fine-grained (i.e. "change melody in climax" should preserve other sections and voices)
  (3.) understand and remember each instrument's contribution to the song as a whole, small or large
  (3.) do not drift across songs 
  (4.) remain cheap in API costs 
  
...all while ensuring that stylistic intent is preserved and instrument quality/samples are pinned. 

Claudesune Miku connects Claude with a custom [Strudel](https://strudel.cc) game-music engine and gives it access to extended harmonic support, arrangement theory, letter-form melody creation, companion lines, drums, a section-by-section arrangement, an HQ sampled render, and a sung copyright-free Hatsune Miku Vocaloid. This gives Claude a more focused music composition foundation while also leveraging state-of-the-art sample libraries for generation.

## The magic.

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

To ensure strictly legal, harmony edits, I used closed, typed operator sets rather than free perturbation as the default, with eight function-preserving substitutions: recolour, suspend, rotate, third_sub, tritone_sub and so on. Free perturbation doesn't work well because any edit to harmony is significant. So, if you were to change just one chord of a four-chord loop, you'd functionally be changing 25% of the harmony. If that progression landed on the cadence, it would break the loop itself. This creates the need for carefully set bounds.

Each operator declares what it preserves and has a cost on an audibility scale. It may only produce chord degrees the corpus has actually played, and it can't introduce a neighboring duplicate like Cm Cm Eb Bb. This is not to say that neighboring duplicates are "bad composition", but moreso that non-specialized AI models are not advanced enough to leverage them well. So we just cut our losses.

Descriptors (explicit or implicit from user prompt) such as "gentle" or a "bold" variation reaches for different operators by cost. This idea also applies the same idea to ostinato variation, where the pitch is changed, but the onsets and accents are fixed. 

To protect against drift, we implement four core things:

- Each instrument layer logs why it exists, so a request like "make the pad quieter" can easily point at a single decision instead of re-deciding the whole arrangement.

- Every edit declares its scope (which layers, sections, and aspects it may touch), and anything that changes outside that scope rejected. Every new failures flagged to prevent hand edits from being undone by a later recompile.

- The song name is hashed to pick key, tempo, and voices, so the same prompt and name always give the same song. This allows us to actually test if "change one variable" produces valid outputs.

Lastly, since Strudel is ran headless, Claude can count notes, gains and overlaps in the actual mix before saying which layer is at fault.

**Hope you enjoy!**

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

- Chord symbols use the ireal dialect: `Ab^7` not `Abmaj7`, `o` and `o7` not `dim`, `sus` not `sus4`.
- Onsets are bar-relative fractions (`'3/16'`), and meter is 4/4 only (D92).

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
