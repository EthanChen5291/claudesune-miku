# motif-engine

A [Strudel](https://strudel.cc)-based game-music generation engine. A prompt
(an **emotion** plus an **environment**, e.g. `somber space` or `excited jungle`)
compiles to a full song: harmony, accompaniment, melody with letter form,
companion lines, drums, section-by-section arrangement, and an HQ sampled
render. Nothing is composed by hand. Every rule in the engine was learned from
one listener's ear verdicts, round by round, and the full ledger of those
decisions is [DECISIONS.md](DECISIONS.md).

The project started as an LLM song *editor* with mechanically gated edits (the
handoff in [doc.md](doc.md), the CLI in [SESSIONS.md](SESSIONS.md)). That layer
still works and is still tested, but the centre of gravity is now the
prompt-to-song generator and the audition loop around it.

## Setup

```
npm install                          # Strudel 1.1.0, exact-pinned (see below)
npm test                             # 39 files, 394 tests (~45 s; rebuilds songs.html)
node scripts/audition-songs.mjs      # rebuilds audition/songs.html (47 judged songs)
open audition/songs.html             # listen; export verdicts JSON from the page
npm run listen                       # or serve audition/ at http://localhost:8765 so the per-card wav download links work
```

Node 22+ (developed on 26). The HQ render tier has extra native dependencies,
described under "Render tier" below. Everything else is pure Node.

### The version pin (do not upgrade)

Everything is pinned to **Strudel 1.1.0** (`@strudel/core`, `mini`, `tonal`,
`transpiler`, `reference`, and the REPL bundle embedded in every audition
page). Newer `@strudel/core` imports a browser-only module and dies under Node,
which kills headless evaluation, and headless evaluation is how every song is
measured. Two 1.1.0 quirks are worked around rather than fixed: `.voicing()` in
root mode is broken (we emit `rootNotes()`, D3) and the transpiler mini-fies
double-quoted object keys (D12).

## How a song is made

```
prompt "somber space"
   │  src/lib/prompt-parse.js  → emotion + environment
   │  src/lib/vibes.js         → compileVibe(): EMOTION is a transform
   │                             (mode, tempo ×, register, percussion, chroma)
   │                             ENVIRONMENT is the material (timbre bias,
   │                             figuration classes, ensemble dial, perc profile)
   ▼
harmony      D50 exemplar variation from the ratified progression pool
             (src/lib/harmony-vary.js, progressions-*.js, harmony-model.js)
accompaniment ratified foundation figure by figuration class, varied per
             4-bar block by CLASS (rhythm / intervals / turnaround, D97) and
             travelling along FND_TRAVEL edges as letters change
melody       letter form (A B A' …), retrieved cells bound through the melody
             walker: cadence grammar, chord spelling, leap folding, grid snap,
             connective tissue (src/binder/bind.js)
layers       companion (lead's own cell rebound to chord tones below it),
             counterline, descant, pad top voice, marcato, textures, drums
arrangement  planArrangement (src/binder/arrange.js): roles, handoffs between
             instruments at letter boundaries, section curves, breakdowns
   ▼
audition/songs.html   one card per song: mix string, solos, harmony, notes,
                      keep / kill buttons, HQ toggle, "copy verdicts JSON"
```

All of this lives in `scripts/audition-songs.mjs` (the generator, with every
engine rule inline next to its D-number and the quote that caused it) on top of
`src/binder/` and `src/lib/`. Per-song pins and asks are `SONG_OPTS` at the
bottom of that file.

Song identity is hashed from the song's **name**: key, tempo, voice count and
every pool pick rotate with it. An A/B pair must be built under one name.

## The round loop

Every session is one round:

1. Ethan listens to an audition page and exports a verdicts JSON.
2. `node scripts/import-verdicts.mjs <file>` regenerates
   `src/lib/verdicts.js` (keeps, kills, derived pins, card notes). Never edit
   that file by hand.
3. Snapshot the judged page, make fixes, rebuild, and byte-compare every
   song's DATA against the snapshot. **Judged material is frozen**: a kept song
   pins its harmony and its exemplar, and every new engine rule is gated so
   kept songs stay byte-identical.
4. `npm test`, re-render changed songs' HQ wavs, run the adversarial verify
   workflow (`.claude/workflows/verify-round.js`: stability, per-claim
   refutation, support-vs-lead gain ratios, melody-grammar bands).
5. Append a numbered D-entry to [DECISIONS.md](DECISIONS.md) and update
   [todo.md](todo.md).

[CLAUDE.md](CLAUDE.md) is the working doctrine for that loop: the laws his ear
has established, the traps that have bitten before, and how to measure a song
headlessly (`evaluateSong` + `hapsByLabel` in `src/harness/evaluate.js`).

## Audition pages

All under `audition/`, all self-contained HTML with the Strudel REPL embedded.
Each has keep/kill buttons and a verdicts export.

| Page | Built by | What it is |
|---|---|---|
| `songs.html` | `scripts/audition-songs.mjs` | The judged suite: 47 prompt-generated songs |
| `vanriver.html` | `VANRIVER=1 …audition-songs.mjs` | 23 songs on the progressions transcribed from @vanrivermusic's reels |
| `reels.html` | `REELS=1 …audition-songs.mjs` | His 8 layer-stacking reels transcribed as data (`src/lib/layer-patterns.js`): faithful, crossed, device A/B |
| `layerstack.html` | `LAYERSTACK=1 …audition-songs.mjs` | The Serum producer's genre with the seven reel-layer rules wired |
| `energy.html` | `ENERGY=1 …audition-songs.mjs` | Song labels (which prompts a finished song also serves) and the energy A/B |
| `vocal.html` | `VOCAL=1 …audition-songs.mjs` | The vocal suite: 10 songs (8 energetic, 2 ballads) sung by the vocal tier with generated Japanese lyrics and a subtle rhythm guitar, plus 6 guitar-main songs (`vg_*`: anime-opening J-rock, power pop, sports anthem, Vocaloid electro-rock, city pop, guitar ballad) on the J-pop / city-pop idiom progressions |
| `variations.html` | `scripts/audition-variations.mjs` | Variation labs: 104 byte-frozen experiment cards, melody grammar as a program |
| `catalog.html` | `scripts/audition-catalog.mjs` | Mined candidates from the curated corpus tier, awaiting labels |
| `foundations.html`, `drums.html`, `progressions.html`, `facets.html`, `judge.html` | their `audition-*.mjs` | Library-level auditions: accompaniment figures, drum patterns, progressions, per-song facets |
| `triage.html` | `scripts/audition-triage.mjs` | Ear-test questions an analysis cannot settle, with A/B demos |
| `videolab.html`, `undertale.html`, `unison.html` | their `audition-*.mjs` | Material extracted from the video corpus, Undertale MIDI and the Unison packs |

The `HQ: off/on` toggle on the song pages switches between the browser
soundfont and the rendered wavs in `audition/hq/` (gitignored, rebuilt locally).

## Render tier (HQ)

`scripts/render-hq.mjs <song>` and `scripts/render-hq-pages.mjs` (batch):
haps are split into per-sound stems, gains become MIDI velocity, and each stem
renders through **sfizz** (Salamander piano, VSCO strings and winds, the SSO
choir, generated `vendor/sfz/gen/*.sfz`), **DawDreamer + Surge XT** for synths
(`vendor/patches/*.fxp`), or fluidsynth as fallback, then ffmpeg mixes to
-16 LUFS. Sample libraries, plugins and the Python env live under `vendor/`
and are gitignored; the generated sfz maps and patches are committed. Only
songs whose mixes changed get re-rendered.

## Vocal tier (r34)

`scripts/render-vocal.mjs <song>` sings a song's tune and lays the vocal over
its HQ render. Four stages, each measurable on its own:

| Stage | Script | What it does |
|---|---|---|
| 0 score | `export-vocal.mjs` | lifts the `_lead` solo as a monophonic line (top note per onset, no overlaps), keeps only bars where the **mix** actually plays the tune (handoff letters count, breakdown bars go silent), shifts by whole octaves into a singer's range |
| 0b lyrics | `src/lib/lyrics-ja.js` | generated Japanese mora lyrics (default `--lyrics ja`): one mora per note from a pool of the words Miku songs lean on (kimi, boku, sekai, koe, sora, yume…) plus particles and verb endings; a very short run note melismas on the previous vowel; identical melodic phrases get identical lines so a returning letter sings its hook again; every mora is spelled in the voicebank's phoneme set |
| 1 sing | `vocal-sing.py` | runs a DiffSinger voicebank's ONNX models directly with onnxruntime (no OpenUtau): the pitch model writes a sung f0 curve, acoustic + vocoder make the wav; consonants sung before the beat so the vowel lands on it, breaths at phrase starts, the engine's per-note gain as an amplitude envelope (`--syllable la` when a score has no lyrics) |
| 2 convert | `vocal-convert.py` | RVC timbre conversion (`infer_rvc_python`) with a target `.pth` + `.index`; pitch, timing and vowels pass through unchanged |
| verify | `vocal-verify.py` | pyworld f0 of the result vs the score: % voiced frames within 50 cents, octave errors, unvoiced notes, rest leak |

Outputs land in `audition/hq/` (`<song>.vocal-score.json`, `.vocal-dry.wav`,
`.vocal-raw.wav`, `.vocal.wav` with the lead's room, `.withvocal.wav`,
`*.verify.json`). `songs.html` shows a VOCAL badge and a **Vocal: off/on**
toggle that swaps the `.withvocal.wav` in when HQ is on. The flag is only set
when the file exists, so every other song's DATA stays byte-identical.

**Electric guitar (r34).** The vocal suite carries a J-rock guitar layer
(`opts.guitar`: `rock` = palm-muted 8ths or a 16th gallop in the verse
letters, open power chords with the octave in the others; `arp` = a clean
broken-chord arpeggio for ballads), written by `bindFigure` over the song's
own chords at octave 2 and mixed under the voice. Browser tier: the GM
soundfont's electric guitars. HQ tier: Unreal Instruments' free, licence-free
**Standard Guitar** SFZ (a Japanese DI library with keyswitched articulations;
`vendor/sfz/unreal/`) rendered by sfizz, then a **Neural Amp Modeler**
capture (`vendor/nam-models/`, GPL v3 community captures with the cabinet
included) applied by `scripts/guitar-amp.py` in the vocal-tier env. Every
stem's MIDI opens with its keyswitch note because the library's default
articulation is silent.

**r35 (his first vocal-page export, D138).** The guitar plays **staccato**
on unpinned songs — every part he called "sustaining … white noise" was the
ringing open chorus, every part he liked was palm-muted — so the chorus is a
muted octave chug (B letters) or a 3+3+2 push (bridge letters), the main-mode
riff and double are muted too, and `guitar: false` / `guitarGainMul` sit on
the rows where his card asked. The battle crash is a **stamp placed by its
measured peak time** (the crescendo file peaks 1.44 s in) before each drop's
downbeat instead of an 8-bar cell. The singer's ceiling is G#5, duration-aware
(`export-vocal.mjs`). The per-row `vocalDb` follows his law — energetic 0 dB
over the band, calm +1.5 — with pins where he judged. Two render-tier fixes
reach every page's next HQ render: `scripts/build-sfz.mjs` now writes a
per-sample `offset` that skips the VSCO sustain layer's recorded swell (a
soft held note reached half its level at 0.92 s; now 0.04 s), the string
patch finally carries the **violin** section (its zone had been empty since
D80 — every rendered violin was a stretched viola), and `gm_french_horn`
renders from VSCO's horn instead of the swelling GM patch. Renders:
`render-hq.mjs --reuse-stems` keeps a keyed stem cache (a remix is
byte-identical and skips every unchanged sampler/synth stem);
`render-vocal.mjs --rehq` re-renders an existing HQ mix through it, and a
score whose sung notes changed re-sings by itself.

Setup is local and gitignored under `vendor/vocal/`: a Python 3.12 venv
(`onnxruntime`, `infer_rvc_python`, torch), the voicebank
(`vendor/vocal/tiger/voicebank`, Tiger v106, free for non-commercial use)
and the RVC model (`vendor/vocal/rvc-models/<name>/`). Stage 2 must run with
`KMP_DUPLICATE_LIB_OK=TRUE OMP_NUM_THREADS=1` on macOS or the RMVPE loader
segfaults (faiss and torch each bundle an OpenMP runtime); the orchestrator
sets both. The bundled RVC targets are community models trained on Vocaloid
output: fine for a local audition, not for anything released.

## Libraries and corpora

`src/lib/` holds the engine's material as **abstractions only**: onset
fractions and accent profiles (`rhythms*.js`), scale-degree contours, voicing
shapes, figuration figures (`figurations-*.js`), progressions in the ireal
chord dialect (`progressions-*.js`), instruments and their ranges, the vibe
tables, and the transcribed reel layers. Only entries Ethan has clicked
(`ratified`) enter retrieval pools, so adding an entry cannot re-roll a judged
song; ratifying one can, and gets checked for blast radius.

Two libraries are deliberately addressed by name and never iterated:
`src/lib/techniques.js` (craft extracted from references, with status `wired`
or `recorded`) and `src/lib/layer-patterns.js` (the reel rows). A test
enforces this so recording an analysis is free.

`audios/` and `research/` are **analysis-only** and never feed `src/lib/` by
counting. The 400-file `audios/vgmusic/` manifest that built
`harmony-model.js` is pinned; every larger corpus (the 31k-file VGMusic sweep,
hsmusic, smwcentral, the hand-imported MIDI, the Unison and Undertale packs,
his reel videos) stays local and gitignored. Promoting corpus material means
authoring a canon entry by hand. `research/` holds the write-ups those corpora
produced, from the environment and key censuses through the melody-grammar
study that set the current reference bands.

## Grammar quick reference

- Chord symbols use the ireal dialect: `Ab^7` not `Abmaj7`, `o`/`o7` not
  `dim`, `sus` not `sus4`. An unknown quality silently renders a plain triad;
  a test fails on `maj7` anywhere in the reel progressions.
- Degrees: `0:m 3 5:m 8b 1b:^7` (semitone offsets from tonic, `b` for flat
  roots, `:quality` suffixes).
- Figure tokens: `R/3/5/6/9`, `+` per octave, dots join chords (`3.5.7`),
  `s2/s4/s6/s7` resolve against the chord's scale and are in-key by
  construction, `>` looks ahead to the next chord. Bare `4`/`7` fall back to
  fixed intervals and can spell foreign pitches.
- Onsets are bar-relative fractions (`'3/16'`). Sections are 4- or 8-bar
  multiples. Meter is 4/4 only (D92).

## Layout

```
scripts/audition-songs.mjs   the song generator + SONG_OPTS (per-song pins)
scripts/audition-*.mjs       the other audition pages
scripts/import-*.mjs         verdict / corpus importers (verdicts.js is generated)
scripts/render-hq*.mjs       HQ render tier
scripts/corpus-*.mjs         corpus analysis (research/, never src/lib)
src/binder/      bind.js (figure + melody binding, cadence grammar), arrange.js
                 (planner), harmony.js, theory.js, interlock.js
src/lib/         all material as data; vibes.js; verdicts.js (generated)
src/harness/     headless evaluate, hap signatures, containment gate, metrics,
                 assertions, lint
src/compiler/    spec → labeled .strudel (the original editor flow)
src/ingest/      MIDI readers and corpus manifests
src/emit/        listen.html, report.md, MIDI export
src/cli.js       generate / edit / verify / export (see SESSIONS.md)
audition/        the pages above; hq/ holds local renders
research/        analysis write-ups behind the engine's rules
test/            39 files, 394 tests: song counts, harmony pins, page
                 determinism, grammar, library invariants, the original
                 acceptance cases
DECISIONS.md     the numbered ledger (D1–D133); CLAUDE.md the working doctrine;
                 todo.md where things stand
```
