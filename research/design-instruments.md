# Design: instrument-knowledge expansion

**Status: CANDIDATE throughout.** Every claim below is a proposal for Ethan's ear,
never a fact about what sounds good (the only quality signal in this project).
All `level` values on new entries are `1.0` placeholders explicitly flagged
UNMEASURED — per D46, `level` is an ear-measured gain-parity correction that only
the owner sets after audition. Nothing in this document may be treated as
ratified until it survives an ear pass.

Inputs: `orch-research.md` (orchestration idiom, this scratchpad),
`strudel-research.md` (verified sound inventory, this scratchpad),
`/Users/ethanchen/Documents/GitHub/motif-engine/src/lib/instruments.js` (ground
truth schema, 43 voices). Every GM name proposed below was verified registered
in `packages/soundfonts/gm.mjs` by the strudel research — no unverified names.

---

## 1. Per-part idiom enrichment — what the arranger is missing

The orchestration research's core finding is that **an instrument is several
instruments depending on function**: cello bass duty lives at 2–3 but cello
*melody* lives at 4–5 (the A-string); flute harmony can sit at 4 but flute
melody must clamp no lower than 5; glockenspiel doubling must thin to accents;
horn/trombone/choir melody must reject fast lines. Today's schema has ONE
`range` per instrument and no way to say any of this, so the lane clamp can
push a melodic cast into the instrument's wrong register (anti-pattern 16:
cello takeover clamped into bass octaves reads as a droning bass, not a tune —
and the ratified "didn't really hear the flute" was partly this).

### Proposal: one new OPTIONAL field, `idiom`

Additive, read-if-present; entries without it behave exactly as today. Keyed by
part name (matching `PARTS` in arrange.js), with a `'*'` key for
instrument-wide hints. Values are tiny hint objects — no prose, no rewrite:

```js
// CANDIDATE schema addition — all hints optional, all behavior unchanged when absent
idiom: {
  melody_takeover: { range: [4, 5] },        // per-part register override (clamps AFTER the lane proposes)
  melody_backup:   { octave: +1, thin: 'accents' }, // doubling offset; 'accents' = first onset per beat group + phrase peaks only
  counter_melody:  { maxOnsetsPerBar: 3 },   // sparsity ceiling for this part
  '*':             { maxOnsetsPerBeat: 2 },  // agility ceiling: reject casts whose line is busier
},
```

Semantics (all enforce in `arrange.js`, keyed off D46 resulting-octave logic):

- `range` (per part): overrides the top-level `range` for that part only. The
  lane still proposes the octave; this clamps it. Fixes cello/flute/bassoon
  melody without touching their support ranges.
- `octave` (`melody_backup` only): +1 = double an octave above the lead
  (bright voices: flute, celesta, glock, xylo, square), 0 = unison (warm
  voices: strings, choir, epiano, horn). Encodes research §9.
- `thin: 'accents'` (`melody_backup` only): never 1:1 with the lead — first
  onset of each beat group and phrase peaks. Encodes the glockenspiel rule.
- `maxOnsetsPerBeat` (`'*'` or per part): agility ceiling. Horn, trombone,
  choir, accordion, tubular bells, taiko get 2; a cast whose line exceeds it
  is rejected. Encodes anti-patterns 2 and 8 mechanically.
- `maxOnsetsPerBar` (per part): sparsity for punctuation voices (tubular
  bells 1, orchestra hit 1–2, timpani ~4).
- `pitchSet: 'root-fifth'` (`'*'`, drums only): pitch material limited to the
  chord root and fifth — timpani/taiko never play melody notes.

Deliberately NOT proposed: per-part level, per-part cuts, behavior prose
fields, or any change to existing field meanings. The `character` sentence
stays the only prose. Cross-instrument rules from the research (voicing floor
below C3, ≤2 sustained layers, one bass owner, counter yields to lead) are
**arranger rules, not instrument data** — they belong in arrange.js/bind.js
constants, not in this schema, and are out of scope here beyond noting them.

---

## 2. Draft entries — 15 NEW instruments (exact existing schema)

All names verified registered (strudel-research §1). All `level: 1.0` are
**UNMEASURED placeholders** — D46 says level is measured by the owner's ear
against the piano at the same gain; these numbers are not that measurement and
must not be read as parity claims. `cuts`/`weight` are informed guesses from
the research (also unratified). One new `family` word is proposed: `drum`
(see §4). One new mood word is proposed: `tropical` (needs an atlas vibe-word
check before merge; every other mood below already exists in instruments.js).

```js
  // ---- drums (pitched percussion — see §4; kit percussion stays raw samples) ----
  gm_timpani: {
    gm: 'gm_timpani', family: 'drum', attack: 'quick', sustain: 'medium',
    cuts: 0.7, weight: 0.7, range: [2, 3], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['low'],
    parts: ['additional_harmony'],
    moods: ['epic', 'grave', 'tense', 'triumphant'],
    character: 'timpani: a pitched orchestral drum — it lands on roots and fifths, so it punctuates the harmony rather than keeping time. Boss-door thunder; a few strokes a bar at most.',
    // idiom: { '*': { pitchSet: 'root-fifth' }, additional_harmony: { maxOnsetsPerBar: 4 } }
  },
  gm_taiko_drum: {
    gm: 'gm_taiko_drum', family: 'drum', attack: 'quick', sustain: 'short',
    cuts: 0.65, weight: 0.7, range: [1, 2], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['low'],
    parts: ['additional_harmony'],
    moods: ['epic', 'ominous', 'driving', 'grave'],
    character: 'a taiko drum: deep barrel thunder with almost no pitch left in it — war drums and ceremony. It owns the pulse of a bar or it stays out; it never plays a line.',
    // idiom: { '*': { pitchSet: 'root-fifth', maxOnsetsPerBeat: 2 } }
  },

  // ---- bell -----------------------------------------------------------------
  gm_steel_drums: {
    gm: 'gm_steel_drums', family: 'bell', attack: 'quick', sustain: 'medium',
    cuts: 0.75, weight: 0.35, range: [4, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['lead', 'mid', 'high'],
    parts: ['melody_takeover', 'alternate_melody', 'additional_harmony', 'counter_melody'],
    moods: ['tropical', 'playful', 'bright', 'relaxed'],  // 'tropical' is a NEW mood word — check atlas
    character: 'a steel pan: sunny hammered metal with a wobble in its ring — one note relocates the whole song to a beach.',
  },

  // ---- brass ----------------------------------------------------------------
  gm_brass_section: {
    gm: 'gm_brass_section', family: 'brass', attack: 'quick', sustain: 'long',
    cuts: 0.85, weight: 0.8, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'lead'],
    parts: ['harmony_support', 'melody_backup', 'melody_takeover'],
    moods: ['triumphant', 'heroic', 'epic', 'driving'],
    character: 'a full brass section: massed trumpets and trombones in one patch — tutti weight no solo voice can fake. A climax device: everything else thins while it sounds.',
  },

  // ---- pluck ----------------------------------------------------------------
  gm_overdriven_guitar: {
    gm: 'gm_overdriven_guitar', family: 'pluck', attack: 'quick', sustain: 'long',
    cuts: 0.85, weight: 0.7, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'additional_harmony'],
    moods: ['driving', 'dark', 'epic', 'retro'],
    character: 'an overdriven electric guitar: sustain with teeth — the only voice in the palette that sounds angry. Like a saw lead it eats spectrum, so the bed thins while it plays.',
  },
  gm_electric_guitar_clean: {
    gm: 'gm_electric_guitar_clean', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.65, weight: 0.4, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'lead'],
    parts: ['additional_harmony', 'counter_melody', 'melody_takeover'],
    moods: ['relaxed', 'jazzy', 'nostalgic', 'retro'],
    character: 'a clean electric guitar: round wire with a little air around it — town at night, neon on wet streets. It comps as readily as it sings.',
  },
  gm_electric_guitar_muted: {
    gm: 'gm_electric_guitar_muted', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.6, weight: 0.4, range: [2, 4], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'low'],
    parts: ['additional_harmony'],
    moods: ['driving', 'tense', 'sneaking', 'retro'],
    character: 'a palm-muted electric guitar: a dry percussive chug — rhythmic drive without a drum kit. Pure engine-room; it never carries a line.',
  },
  gm_slap_bass_1: {
    gm: 'gm_slap_bass_1', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.75, weight: 0.5, range: [1, 3], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['low'],
    parts: ['additional_harmony', 'counter_melody'],
    moods: ['driving', 'playful', 'quirky', 'retro'],
    character: 'a slap bass: thumb-and-pop funk, percussive enough to be its own drummer — chase scenes and minigames, never solemn.',
  },
  gm_banjo: {
    gm: 'gm_banjo', family: 'pluck', attack: 'quick', sustain: 'short',
    cuts: 0.8, weight: 0.35, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'lead'],
    parts: ['additional_harmony', 'melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['folk', 'playful', 'comic', 'pastoral'],
    character: 'a banjo: bright twanging roll — porches, farms, the rural west. Happiest playing constant eighths; a held banjo note is a contradiction.',
  },
  gm_koto: {
    gm: 'gm_koto', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.7, weight: 0.35, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'additional_harmony'],
    moods: ['spacious', 'lonely', 'nostalgic', 'gentle'],
    character: 'a koto: long plucked strings that bloom and fade — unhurried and formal, its silences part of the sound. Sparse lines only.',
  },
  gm_dulcimer: {
    gm: 'gm_dulcimer', family: 'pluck', attack: 'quick', sustain: 'medium',
    cuts: 0.65, weight: 0.35, range: [3, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid', 'high'],
    parts: ['additional_harmony', 'counter_melody', 'alternate_melody'],
    moods: ['folk', 'magical', 'nostalgic', 'tender'],
    character: 'a hammered dulcimer: struck strings that shimmer between a harp and a harpsichord — snowfall and market squares. Broken chords are its best sentence.',
  },

  // ---- wind -----------------------------------------------------------------
  gm_whistle: {
    gm: 'gm_whistle', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.8, weight: 0.25, range: [5, 6], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['high', 'lead'],
    parts: ['melody_takeover', 'counter_melody', 'alternate_melody'],
    moods: ['playful', 'relaxed', 'hopeful', 'innocent'],
    character: 'a human whistle: somebody strolling with their hands in their pockets — the most casual lead in the palette. One easy line at a time; it cannot do ceremony.',
  },
  gm_shakuhachi: {
    gm: 'gm_shakuhachi', family: 'wind', attack: 'soft', sustain: 'long',
    cuts: 0.7, weight: 0.35, range: [4, 5], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['lead', 'high', 'mid'],
    parts: ['melody_takeover', 'counter_melody'],
    moods: ['lonely', 'spacious', 'eerie', 'calm'],
    character: 'a shakuhachi: bamboo breath with the wind still in it — meditative, slightly wild at the edges. Long tones and silence; it refuses to hurry.',
  },

  // ---- synth ----------------------------------------------------------------
  gm_orchestra_hit: {
    gm: 'gm_orchestra_hit', family: 'synth', attack: 'quick', sustain: 'short',
    cuts: 0.95, weight: 0.8, range: [3, 4], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['mid'],
    parts: ['additional_harmony'],
    moods: ['epic', 'ominous', 'driving', 'retro'],
    character: 'an orchestra hit: the whole orchestra crushed into one stab — pure 80s drama. Punctuation only: a downbeat hit a few times a section, or it turns to parody.',
    // idiom: { additional_harmony: { maxOnsetsPerBar: 1 } }
  },

  // ---- bowed strings --------------------------------------------------------
  gm_string_ensemble_2: {
    gm: 'gm_string_ensemble_2', family: 'string', attack: 'slow', sustain: 'long',
    cuts: 0.35, weight: 0.7, range: [2, 4], level: 1.0, // UNMEASURED — D46: ear-set only
    lanes: ['low', 'mid'],
    parts: ['harmony_support'],
    moods: ['sad', 'grave', 'spacious', 'dark'],
    character: 'a second string section: darker and slower to speak than the first — the bed for grief, snowfall and empty halls where ensemble 1 would sound like a film score.',
  },
```

Second wave (verified names, deliberately deferred so the first ear pass stays
tractable): `gm_sitar`, `gm_fiddle`, `gm_tuba`, `gm_harmonica`,
`gm_electric_bass_finger`, `gm_pad_poly` / `gm_pad_sweep` / `gm_pad_metallic`,
`gm_piccolo`, `gm_english_horn`, `gm_melodic_tom`. Also note the strudel
research's cheapest expansion of all: auditioning `.n(i)` render variants of
voices Ethan already likes (same name, different sf2) — orthogonal to this
design but worth an audition slot.

---

## 3. Corrections to EXISTING entries (CANDIDATE change list)

Each row is a proposal with the research reason. None applies until ratified.
`level` values are never touched here — those are ear-measured (D46).

| # | Entry | Change | Reason (orch-research) |
|---|---|---|---|
| C1 | `gm_cello` | add `idiom: { melody_takeover: { range: [4,5] }, alternate_melody: { range: [3,5] } }`; keep `range: [2,4]` for support parts | §1: cello melody lives on the A-string at 4–5, an octave+ above its bass duty; today lanes `['low','mid']` clamp a takeover to 3 → droning bass (anti-pattern 16) |
| C2 | `gm_flute` | `idiom: { melody_takeover: { range: [5,6] }, melody_backup: { octave: +1 } }` (or, without idiom, `range` → `[5,6]`) | §2: flute octave 4 is inaudible against texture — matches the ratified "didn't really hear the flute"; sweet spot 5–6. NOTE: `level: 1.5` was ear-set under the old range — a register change requires re-measuring level |
| C3 | `gm_contrabass` | `range: [1,3]` → `[1,2]` | §1: bass is its own region (1–2); octave 3 collides with cello support territory and blurs the one-bass-owner rule |
| C4 | `gm_bassoon` | add `'melody_takeover'` to `parts` with `idiom: { melody_takeover: { range: [3,4] } }` | §2: bassoon tenor register is a real melody voice (plaintive or comic); currently it can never lead |
| C5 | `gm_choir_aahs` | add `'melody_backup'` to `parts` (arc peaks only — arranger gates it) | §7: choir doubling the lead at unison is the strongest "finale" move; currently choir can only pad |
| C6 | `gm_trumpet` | demote or drop `'melody_backup'` | §3/§9: trumpet at unison annexes the line it doubles — a backup that replaces the lead is not a backup |
| C7 | `gm_glockenspiel`, `gm_xylophone` | `idiom: { melody_backup: { octave: +1, thin: 'accents' } }` | §4: decoration voices — 1:1 doubling of a moving lead is the canonical anti-pattern; accents only |
| C8 | `gm_french_horn`, `gm_trombone`, `gm_tubular_bells`, `gm_accordion`, `gm_choir_aahs` | `idiom: { '*': { maxOnsetsPerBeat: 2 } }` (tubular bells also `maxOnsetsPerBar: 1`) | §3/§7 + anti-patterns 2, 8, 15: slide/valve/vowel physics reject fast lines; bells are single strokes |
| C9 | `gm_orchestral_harp`, `gm_acoustic_guitar_nylon` | note (arranger rule, not schema): `additional_harmony` must land ≥1 octave from the piano accompaniment's octave | §6: harp/guitar figuration duplicates the piano's job in the same register (anti-pattern 9) |
| C10 | `gm_viola` | optional: add `'melody_takeover'` with `idiom: { melody_takeover: { range: [4,4] } }` | §1: viola melody sweet spot is octave 4 ("violin with a cold") — a melancholy takeover color the palette lacks; weakest candidate on this list |
| C11 | `gm_oboe` | no schema change; arranger note: counter_melody enters only in the lead's rests, strictly | §2: oboe steals attention — its enters-in-gaps behavior must be hard-enforced |

Cross-cutting rules the research proposes that are NOT instrument data (record
for arrange.js/bind.js work, out of scope here): voicing floor (below C3 only
octaves/P5, close triads above G3), ≤2 sustained layers above the piano in
distinct octave regions, exactly one bass owner, counter yields to lead
(anti-correlated onsets), brass entry thins the bed, high-`cuts` voices get
sparse material by construction.

---

## 4. The percussion question

**Proposal: pitched percussion joins INSTRUMENTS; kit percussion stays raw
samples.** Rationale:

- Timpani, taiko (and later melodic_tom, synth_drum) are `note()`-driven GM
  voices with a range, a register, a level, and mass — every existing
  arranger mechanism (lanes, D46 resulting-octave occupancy, weight budget,
  `level` parity) applies to them unchanged. They are instruments that happen
  to be drums.
- Kit percussion (`bd`/`hh`/`sd` via `s()`) lives on a different plane: no
  pitch, no diatonic snap, no lanes, patterned by subdivision rather than by
  notes. Forcing it into INSTRUMENTS would bend every field's meaning.
- The taste memory says **notes > clicks** — pitched drums in INSTRUMENTS
  cover the environmental need (battle thunder, ceremony) without committing
  the engine to kit programming at all.

Concretely: add one word to the family vocabulary comment (`drum`), and one
arranger rule keyed on it: family `'drum'` casts only as `additional_harmony`,
pitch material root/fifth-locked (`idiom['*'].pitchSet: 'root-fifth'`), lane
`low`, and its onsets count against the same figuration budget as any other
`additional_harmony` (a drum part is a rhythm bed, not a free extra).

**Kit shape — sketched, recommended DEFERRED.** Only if the owner ever asks
for kit drums, a minimal parallel table (parallel because `s()` names are not
GM voices and take no `note()`):

```js
// CANDIDATE, deferred — kit voices for s(), if ever arranger-placed
export const PERCUSSION = {
  bd: { s: 'bd', role: 'pulse',    level: 1.0 /* UNMEASURED */, moods: ['driving'] },
  sd: { s: 'sd', role: 'backbeat', level: 1.0 /* UNMEASURED */, moods: ['driving'] },
  hh: { s: 'hh', role: 'tick',     level: 1.0 /* UNMEASURED */, moods: ['driving', 'tense'] },
};
// role: pulse | backbeat | tick | fill | crash — the only axis a kit voice needs
```

No lanes, no range, no parts — `role` is the whole vocabulary. Do not build
this until asked; the recommendation of this design is timpani/taiko in
INSTRUMENTS and nothing else percussion-wise in the first pass.

---

## 5. Environment unlocks (which new voice buys which room)

All CANDIDATE pairings — the atlas moods above are the machine hook; this
table is the intent.

| Environment | New voices that unlock it | What was missing before |
|---|---|---|
| Battle / boss | gm_timpani, gm_taiko_drum, gm_brass_section, gm_overdriven_guitar, gm_orchestra_hit | no aggression, no tutti mass, no low punctuation — the current palette cannot sound dangerous |
| Factory / industrial | gm_electric_guitar_muted, gm_slap_bass_1, gm_overdriven_guitar | no dry mechanical drive without a drum kit |
| Snow / mountain | gm_dulcimer, gm_string_ensemble_2, gm_shakuhachi, gm_whistle (bright day) | dulcimer shimmer + dark string bed = falling-snow texture the harp/celesta pair only approximates |
| Water / beach / island | gm_steel_drums, gm_koto (still water), gm_shakuhachi | instant tropical color; calm-water restraint |
| Shop / town | gm_whistle, gm_banjo (rural), gm_electric_guitar_clean (night/noir), gm_dulcimer (market) | casual, unceremonious leads — current winds are all a bit solemn |
| Eastern zone / temple / dojo | gm_koto, gm_shakuhachi, gm_taiko_drum | an entire region theme with zero coverage today (pairs with the `east` Dirt bank later) |
| Western / farm / rural | gm_banjo, gm_whistle, gm_slap_bass_1 (comic chase) | no rustic string voice at all |
| Night city / lounge / casino | gm_electric_guitar_clean, gm_slap_bass_1, gm_steel_drums (casino) | nylon guitar is the only "urban intimate" voice and it reads folk |
| Victory / ceremony / castle | gm_brass_section, gm_timpani, gm_orchestra_hit | fanfares currently rest on one solo trumpet |
| Grief / ruins / long night | gm_string_ensemble_2, gm_shakuhachi | ensemble_1 reads sweeping-epic; the darker bed is missing |
| Chase / minigame | gm_slap_bass_1, gm_banjo, gm_orchestra_hit (stingers), gm_electric_guitar_muted | high-energy comic drive |

---

## 6. Implementation steps

1. **Schema support first**: implement optional `idiom` in `arrange.js`
   (per-part `range` override after lane proposal; `octave`/`thin` on
   melody_backup; `maxOnsetsPerBeat`/`maxOnsetsPerBar` rejection;
   `pitchSet: 'root-fifth'`). Entries without `idiom` must behave bit-for-bit
   as today — add a regression test asserting that.
2. **Family `drum`**: add the word to the instruments.js header comment; add
   the arranger rule (additional_harmony only, root/fifth pitch material, low
   lane, counts against figuration budget).
3. **Append the 15 new entries** from §2 with `level: 1.0 // UNMEASURED`
   comments intact; coordinate the one new mood word (`tropical`) with
   `src/lib/atlas.js` vibe words (add or substitute an existing word).
4. **Apply the §3 correction list** as `idiom` additions (C1–C8, C10) and
   arranger notes (C9, C11) — separate commit from the new entries so the ear
   pass can bisect.
5. **Tests**: extend the instruments schema test — every `idiom` key is a
   valid part name or `'*'`; every idiom `range` lies within sane octaves;
   every new entry's `parts`/`lanes`/`moods` values are in-vocabulary; every
   new `gm` name is on the verified-registered list from the strudel research.
6. **Audition wiring**: new voices lazy-load on first trigger (strudel
   research §4) — audition pages should pre-trigger each new voice once
   before judging begins so first-play silence doesn't poison a verdict.
   Group audition slates by the §5 environments so each session answers one
   room's question.
7. **Ear pass (the only ratification)**: Ethan auditions per environment,
   sets each `level` by ear against the piano (D46), keeps or cuts voices,
   accepts or rejects each C-row. Record the verdicts as a D-entry in
   `DECISIONS.md` via the judge export→import flow.
8. **Second wave** only after the first is ratified: sitar/fiddle/tuba/
   harmonica/finger bass/pad variants (§2 deferred list), `.n(i)` render
   auditions of already-liked voices, and — only if the owner asks for kit —
   the PERCUSSION table from §4.
