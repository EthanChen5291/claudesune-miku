# motif-engine — working doctrine

Strudel-based game-music generation engine. Ethan Chen composes nothing by
hand here: prompts (emotion + environment) compile to full songs. **His ear
verdicts are the project's ONLY quality signal.** Everything below was
learned from his ear, round by round; the full ledger with rationale is
`DECISIONS.md` (numbered D-entries — the authority when this file is
ambiguous). Read the LAST few D-entries before starting any round.

## The round loop (how every session works)

1. Ethan listens to `audition/songs.html` (or `videolab.html` /
   `foundations.html` / `drums.html`) and pastes a verdicts JSON export.
2. Save it to a scratch file, run `node scripts/import-verdicts.mjs <file>`
   → updates `src/lib/verdicts.js` (VERDICTS, DERIVED_VERDICTS, CARD_NOTES…).
3. **Snapshot `audition/songs.html` FIRST** — it is the judged baseline for
   byte-stability checks.
4. Make fixes (see the laws below), rebuild: `node scripts/audition-songs.mjs`.
5. **Compare every song's DATA JSON against the snapshot.** Only songs his
   notes name (plus intended engine-rule absorption on unkept songs) may
   differ. Kept songs must be byte-identical unless his note names them.
6. `npm test` (the suite pins song counts, D64 harmony pins, determinism).
7. Re-render changed songs' HQ wavs (see Render tier below).
8. Verify adversarially (measure, don't trust — a multi-agent verify pass
   has caught a real defect almost every round).
9. Append a numbered D-entry to `DECISIONS.md` + update `todo.md`.

## Prime directives (violating these has burned us before)

- **Judged material is frozen.** A KEPT song pins its harmony degrees AND
  its base exemplar (D64/D65) — the generator re-reads them from
  DERIVED_VERDICTS. Structural gates key on `priorKeep`; every new engine
  rule must be gated `!priorKeep` so kept songs stay byte-identical.
- **The keep-transition law (D91).** A song judged on the UNKEPT path was
  judged WITH bridges/breakdowns/melody-grammar. When its keep click lands,
  `priorKeep` flips and those gates would strip the features he approved.
  Pin them in SONG_OPTS (`bridgeHarmony: true, breakdown: true,
  melodyGrammar: true`) and verify byte-identity against the judged page.
- **Prose keeps are real.** "love this / I like this a lot" without a keep
  click → pin the song (`grammarPin: true` in SONG_OPTS) so no engine-wide
  rule re-rolls it before the click lands. Remind him to click + export.
- **Voice-only changes.** Swapping an instrument on a judged song is allowed
  ONLY when his note asks, and must be voice-only: the (time, midi) multiset
  byte-identical, only `.s()` changes. Verify by evaluating both pages.
- **A song he has spoken about never swaps its lead voice** unless his note
  names it. New-capability rolls (string leads, vary-lead-voice) default
  only on HISTORY-LESS songs (no verdict AND no CARD_NOTES entry).
- **Library growth re-rolls hashes.** Adding a canon/pool entry mutates
  every unpinned song's `fnv % pool.length` retrieval. Only CLICKED entries
  enter retrieval pools, so unclicked additions are safe; ratifying one is
  not — check the blast radius, pin affected songs if needed.
- **Never trust "returned OK" — measure.** The D85 lesson: a VST preset
  "loaded" (returned truthy) for three rounds while every synth stem played
  the init patch. A change is unproven until a MEASURED difference (haps,
  spectrum, byte diff) confirms it. Same for every fix: measure
  before/after; report the numbers.
- **Stale notes.** The judge page's note boxes persist between rounds. A
  note that arrives byte-identical to last round's may be stale, not a
  re-complaint — check before re-fixing; say what you assumed.

## How to measure a song (the probe pattern)

```js
import { evaluateSong, hapsByLabel } from './src/harness/evaluate.js';
const html = readFileSync('audition/songs.html', 'utf8');
const data = JSON.parse(html.slice(html.indexOf('const DATA = ') + 13,
  html.indexOf(';\n', html.indexOf('const DATA = '))));
const s = data.songs.find(x => x.name === NAME);
const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: stack(${s.mix})`);
const haps = hapsByLabel(ev, 0, s.totalBars).get('p').haps;
// h.whole?.begin ?? h.part.begin may be a Fraction — Number() it.
// h.value.note is usually a STRING like "c5"/"eb4" — parse it yourself.
// h.value.s is the sound name. One cycle unit = one bar.
```

Byte-stability check: `JSON.stringify` each song object from the snapshot
vs the rebuilt page. The page embeds a `BUILD` timestamp with minute
resolution — a determinism test straddling a minute boundary is a known
flake; rerun before believing it.

## Grammar & dialect traps

- Chord dialect: `Ab^7` (maj7), never `Abmaj7` — unknown symbols silently
  get WRONG default intervals. Degrees tokens: `0:m 3 5:m 8b 1b:^7` =
  semitone offsets from tonic, `:quality` suffixes, `b` for flat roots.
- Figure tokens: `R/3/5/6/7/9` or `~<semitones>`, `+` per octave, dots join
  chords (`3.5.7`). NO negative semitones (`~-12` is invalid — use a
  separate figure at a lower octave).
- On plain triads a `7` token falls back to b7 (foreign-pitch bug) — use 6.
- Onsets are bar-relative fractions (`'3/4'`), bars ∈ [0, entry.bars).
- Section lengths must be 4/8-bar multiples; melody masks must align to
  whole harmonic loops (a half-loop intro shift starts the tune
  mid-progression — shrink intros by WHOLE loops only).

## Taste canon (his ear's standing laws — the WHY matters)

- **Color is the norm**: diatonic color (m7/^7/9/sus/6) everywhere; plain
  triad runs read "generic". CHROMATICISM (dim chains) is what he rejects —
  never conflate the two (the old plainness rule did, D88).
- **Sections own their harmony**: a real bridge (B letter, budget-2
  variation), real breakdowns (acc+drums strip over a held-root floor
  ≤C3), bar-4 turnarounds (sub drops an octave). One-loop-plus-treat reads
  generic.
- **Layers with their own melody**: counterline (held 3rd / beat-2 climb),
  descant (3+5 dyad, 5-6-5 walk), singing pad top voice (planned phrase),
  marcato staccato-string stabs on energetic songs. Multiple at once is
  good; support tops stay UNDER the lead (D77); high ornaments go silent
  during melody bars.
- **Melody**: consecutive same-pitch notes MERGE (melody only); antecedent
  phrase-finals land 3rd/5th, never the 7th (cadenceNo7); over a
  foreign-root chord the melody SPELLS the chord (chromCore); jitter is
  DURATION as much as count — holds + articulation floors cure "hyper",
  thinning alone measured only -32%. In 2/4 the per-bar density target
  halves (bars are half as long).
- **Registers**: energetic songs leave the piano (synth acc/leads) UNLESS
  the vibe is piano territory (goofy/comic/playful/quirky/silly/whimsical
  moods or solo/duet/trio anchor). One low voice at a time. Bare sine at
  octave 1 is inaudible — synth bass at octave 2.
- **Dynamics**: pads BREATHE (per-bar waves) but transitions must be
  gradual — a 1.6× band jump reads as "suddenly really loud" (padWaveCalm
  exists). Strings support = whisper (≤~0.1 measured gains, "too loud" came
  four rounds running). Lead gain ceiling 1.0 for formulas; per-song opts
  may reach 1.15. The x1.35 boost = +2.6dB, and 1.35 overshot once (rest).
- **Intros**: pre-melody intros cap at ~16 seconds any tempo, whole-loop
  shrinks, one-loop floor; at ≤60bpm they DROP entirely.
- **Meter: 4/4 only** (D92 ruling — "avoid 2/4 and just stick with 4/4").
  The generator re-maps any 2/4 vibe to 4/4 at compile time. Exception:
  goofy_kitchen was kept IN 2/4 and stays as judged. Never author new
  2/4 material.
- **Handoffs stay** (D90): letters hand off between instruments at
  complete-statement boundaries; never remove handoffs to feature a voice.
  String melodies are a PALETTE (strings-first handoff pool on
  string-friendly vibes; solo string leads); "not one synth playing the
  melody the entire time" — non-A letters bind the partner synth
  (varyLeadVoice, voice-only on kept songs).
- **Desert = Phrygian dominant**: bII hard against the tonic + the raised
  third (Hijaz). All-minor Phrygian read "dark, not desert" to his ear.
  Serve trope progressions RAW — the variation pass dilutes them.
- **Drums**: his vouched dp_* patterns where the vibe note matches; melody
  outranks drums; cymbals sit far back.
- Sparsity is a legitimate ensemble shape. Repeated uniform anything
  (chords, ornaments, dynamics) reads as "a piano exercise".

## Render tier (HQ)

`scripts/render-hq.mjs` (one song) / `render-hq-pages.mjs` (batch):
haps → per-sound stems → sfizz (Salamander piano, VSCO strings/winds,
`vendor/sfz/gen/*.sfz`) + DawDreamer+Surge XT for synths
(`vendor/patches/*.fxp` — VST3 preset wrapping + 0.3s warmup, D85) +
fluidsynth fallback → ffmpeg mix (-16 LUFS). Gains export as MIDI velocity
(velocity = hap gain × velScale, absolute, never stem-normalized). Notes
outside an SFZ's key range FOLD by octaves (D83) — watch the render log.
Only re-render songs whose mixes changed; wavs land in `audition/hq/`.
Surge patches must come from the release tag matching the vendored build.

## File map

- `scripts/audition-songs.mjs` — the song generator (SONG_OPTS at the
  bottom = per-song pins/asks; every engine rule lives inline with its
  D-number and his quote).
- `src/binder/bind.js` — bindFigure/bindMelody (the melody walker, cadence
  + chromCore grammar); `src/binder/arrange.js` — the planner/arranger.
- `src/lib/verdicts.js` — GENERATED by import-verdicts.mjs; never edit.
- `src/lib/vibes.js` — prompt → vibe compilation.
- `DECISIONS.md` — the ledger. `todo.md` — the running summary for Ethan.
- `test/` — 300+ tests pin counts, pins, determinism, grammar.

## Ultracode / verification habit

Every round: after fixes, run an adversarial multi-agent verify pass
(stability / per-fix conformance / grammar / HQ integrity), each agent
REFUTING claims with measurements. It has caught a real defect nearly
every round (missed bind paths, register collisions, canon ripples).
Report its findings honestly — including what it refuted about your own
work — in the D-entry addendum and to Ethan.
