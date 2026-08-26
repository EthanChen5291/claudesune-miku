# research/ — the scenario-generation research round (D61, 2026-08-25)

Twelve documents from one research pass, answering four questions Ethan asked
on the way to the 20-environmental + 20-emotion song batch. Everything below is
CANDIDATE material (A6.1): corpus statistics and scholarship feed candidate
pools; only the ear ratifies. Each chain is census/research → design; the
design docs end in numbered implementation steps and a ledger of exactly which
constants need ear verdicts.

## The four chains

**1. Keys** — *"how to decide between what key to use? what is each key known
for being good at?"*
- [keys-census.md](keys-census.md) — key × role/arc across the corpora
  (83 Undertale songs + 88 vgmusic), margin-weighted; G:minor = generic battle,
  F:minor = heavy boss, B:major = the late/emotional lane, A:major = warmth,
  towns 3/3 major.
- [keys-research.md](keys-research.md) — the Schubart 1806 affect tradition and
  why it died with unequal temperament; what survives in 12-TET (mode, register,
  tempo, timbre — not the tonic letter; Powell & Dibben 2005); verified keys of
  famous game themes.
- [design-keys.md](design-keys.md) — `selectKey()`: mode first, register
  second, tonic as corpus-practice + hash-variety tie-break; `KEY_PRACTICE`
  tables, headroom contract with the octave-as-section-parameter ruling.

**2. Pattern foundations + variation** — *"use those as the foundations (get
more foundational patterns first) then vary them a bit"*
- [patterns-census.md](patterns-census.md) — the exact bindFigure grammar as
  implemented, counts/classes/meters of every pattern pool, the gaps (no 2/4,
  5/4, 12/8; 6/8 nearly empty; zero multi-bar figures).
- [accomp-research.md](accomp-research.md) — 29 canonical accompaniment
  patterns from across music history (`fnd_` pack: alberti, stride, habanera,
  bossa, travis, gospel 12/8, …) already encoded in the repo grammar, plus 17
  variation devices ranked by how commonly real music uses them.
- [design-figvary.md](design-figvary.md) — `varyFiguration()` in the D50
  idiom: 12 typed operators on a cost ladder (rotate/swap = Ethan's "swap
  positions"; colour_sub/octave_token/neighbor_insert = "change intervals"),
  fit-drift gates bounded by the importer's own class thresholds, lineage
  provenance, foundation-first sequencing.

**3. Environmental vibes** — *"vibes aren't just excited/sad — the atmosphere,
like 'happy shop' or 'construction' or 'fight activity'"*
- [vibes-census.md](vibes-census.md) — all seven existing mood vocabularies and
  where they fail to meet; every word today is an EMOTION.
- [env-research.md](env-research.md) — how real games score 17 environments
  (shop/fight/boss/construction/stealth/snow/water/…): environment = timbre +
  texture + percussion + groove; emotion = mode + tempo + register transforms.
- [design-vibes.md](design-vibes.md) — `vibe = EMOTION × ENVIRONMENT`,
  `compileVibe()` → a situation patch consuming only existing vocabularies;
  happy-shop / construction / fight walked in full; the contradiction cells
  (gloomy shop, happy construction, calm fight) are the ratification test.

**4. Instruments** — *"violins are used differently for melody than for
harmony or for bass"*
- [orch-research.md](orch-research.md) — per-family, per-part orchestration
  rules keyed to the arranger's actual part names; register sweet spots,
  doubling conventions, 16 anti-patterns, a mechanical per-part checklist.
- [strudel-research.md](strudel-research.md) — what Strudel actually exposes:
  125 registered gm_* voices (engine uses 43; 82 unused), the drum-machine /
  VCSL / percussion sample banks the engine could load, `.n(i)` render
  variants, loading and loudness mechanics.
- [design-instruments.md](design-instruments.md) — an additive `idiom` field
  for per-part behavior; 15 new verified GM voices drafted in the existing
  schema (timpani, taiko, brass section, steel drums, guitars, slap bass,
  koto, shakuhachi, …) with every `level` flagged UNMEASURED (D46: levels are
  ear-set); 11 corrections to existing entries; pitched percussion joins
  INSTRUMENTS, kit percussion stays samples.

## Addendum: ensemble shapes (sparsity is a scenario decision)

Ethan, after the research launched: *"there's also good in simplicity. like a
piano solo or piano and violin duet or some other solo/duet, or percussion + a
bassline etc., or percussion and just a harmony no melody. or a song with no
drums, or no bass, etc. that totally works too and just depends on the
scenario."*

This binds the four chains together: the ENSEMBLE is part of what a vibe
compiles to, and "full layers" is only one point on the dial. The research
already points the same way — env-research's aftermath row is "known leitmotif
stripped to solo piano, no percussion"; cave is "sparse,
reverb-as-instrument"; the census's praised His Theme cards are two hands and
nothing else.

Refinement (Ethan, same session): **ensemble size is a CONTINUUM, not an
enum** — "there's also more that's less than full but more than the other
options. there's no hardcode for it — like if there were 8 instruments some
sections may have any number from 1-7." So the model is:

- The per-section parameter is a **voice count 0..N** (N = the roster the
  slate could cast), free to sit anywhere in the range and to differ per
  section — a song can breathe 2 → 5 → 7 → 3 across its letters.
- The NAMED shapes are **anchors, not the vocabulary**: `solo` (piano alone —
  the D41 two-hand principles ARE the arrangement), `duet` (piano + ONE cast
  voice), `groove` (percussion + bass, melody minimal/absent), `bed` (harmony
  + percussion, no melody lane), `no_drums` / `no_bass` (full minus one
  floor), `full`. They exist so a vibe or a prompt can ask for a recognizable
  configuration by name; between the anchors, the count rules.
- Constraint shapes (`no_drums`, `bed`) are LANE constraints that compose with
  any count; size shapes (`solo`, `duet`) are counts with a casting rule.

Where it wires: `compileVibe()` output gains `ensemble: { count | anchor,
constraints }`; `planArrangement` treats it as a cap-and-floor on the slate
before casting (headroom already exists as the budget mechanism), and the
D47/D59 form phase varies the count per section the way it already varies
masks. Environments carry priors (aftermath → 1-2 voices, rest → 1-3, cave →
2-3, construction → groove-shaped 3-4, shop → 2-4, boss → high counts); the
emotion axis can thin them (sad strips percussion already via percMul 0). The
20+20 batch must sweep the dial — solos, duets, mid-size 3-5-voice sections,
and full — so counts get their first verdicts alongside the vibes.

## Related: drum-patterns.com (same session)

`scripts/import-drum-patterns.mjs` imports drum grids from drum-patterns.com
pages in `audios/drum-patterns/`. The site's robots.txt disallows automated
collection, so the original design was hand-saved pages only; Ethan then asked
the site owner and was granted permission by email for this project
(2026-08-25), so `scripts/fetch-drum-patterns.mjs` now exists — page-budgeted,
~1.2s between requests, honest User-Agent, skips what is already saved. The
importer itself still never fetches. Per pattern it extracts: per-voice 16-step banks
(BD/SD/CH/OH/CY/CB/CP/RS/toms), meter, swing flag, drum kit, style, BPM, and
the bank PLAY ORDER — which bar is the groove, which is the fill (`DRUM_PATTERN_FORMS`;
the fill-placement data todo 0b wanted). Velocity does not exist in the grids;
AC (accent) and GH (ghost) rows recover a real profile where the author used
them, otherwise entries land `needsAccents` like the flat unison loops.
Kit names (roland-tr-808, linn-lm-1, …) pair naturally with the
tidal-drum-machines sample banks strudel-research.md found loadable.

## What approval unlocks (the build order)

1. `fnd_` foundation pack (29 patterns) + audition arm → ear pass.
2. `vibes.js` + closure tests + `audition-vibes.mjs`.
3. `key-practice.js` + `key-select.js` + tests.
4. instruments.js: 15 new entries + idiom field + corrections (levels UNMEASURED).
5. `figuration-vary` (after the fnd_ ear pass says the foundations hold).
6. THE BATCH: 20 environmental + 20 emotion-based songs with layering,
   instruments, ensemble shapes, and the new keys policy — the ratification
   surface for everything above.
