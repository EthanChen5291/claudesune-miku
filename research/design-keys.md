# Key-selection policy for song generation — design

Status: DESIGN PROPOSAL. Every musical claim below is a **CANDIDATE** until the
owner's ear ratifies it — corpus statistics and scholarship are inputs to a
candidate pool, never facts about what sounds good. Inputs read:
`keys-census.md` (corpus census), `keys-research.md` (tradition + empirics),
`scripts/audition-undertale.mjs` (current key usage + the fnv idiom),
`src/lib/atlas.js` / `src/lib/undertale-context.js` (role/mood/arc axes),
`src/lib/figurations-undertale.js` (accompaniment octaves 1–3, mostly 2–3),
todo.md ~line 435 (queued ruling: octave as a section parameter).

---

## 0. The honest premise (read this first)

The engine is an equal-tempered synth. In 12-TET every key is an exact
transposition of every other; the empirical literature (Powell & Dibben 2005;
Parncutt 2014; the Bach/Chopin register analysis) says **mode, register,
tempo, and timbre carry the affect — the tonic letter carries essentially
none**, except through (a) where it physically places the melody and bass,
and (b) learned association / pitch memory of specific pieces.

Therefore this policy's real decisions, in order of weight:

1. **MODE** — the semantic lever (major/minor; the corpus's role→mode splits).
2. **REGISTER** — the only acoustically real consequence of tonic choice
   (lead lane ~octave 5, accompaniment ~2–3; section-level octave offsets per
   the queued ruling).
3. **TONIC pc** — a tie-break: corpus-practice prior + deterministic hash
   variety. It buys idiomatic familiarity and inter-song contrast, nothing
   more. Schubart-style key poetry may live in the table as *naming metadata
   only*, never as a selection rule.

Everything downstream of this ordering is structured so a wrong tonic prior
costs little (it only reweights a tie-break) while a wrong mode prior is loud
and will be caught by ear rounds quickly.

---

## 1. Inputs and outputs

### Inputs (all optional except `name`; missing inputs fall through to corpus-wide priors)

```js
selectKey({
  name,            // REQUIRED. Song name — the determinism seed (fnv-1a).
  role,            // 'battle'|'boss'|'town'|'overworld'|'character'|'cutscene'|
                   // 'menu'|'shop'|'credits'|'joke'|'diegetic'|null
                   // (the undertale-context.js vocabulary)
  moods,           // atlas mood tags, e.g. ['warm','tender'] — CANDIDATE nudges only
  energy,          // 'low'|'mid'|'high' — derived at generation time (D41/D42
                   // says density is never a user knob; energy here means the
                   // generation-time intent, e.g. from role+bpm), not a UI knob
  arc,             // 'early'|'mid'|'late'|'climax'|'ending'|null
  character,       // optional leitmotif owner — pitch-identity hook (§4.5)
  instrumentation, // palette summary, e.g. { lead: 'piano', accomp: 'piano', bass: true }
  avoid,           // tonic pcs of the previous N songs in a generated set,
                   // e.g. ['F','G'] — the variety constraint (§4.4)
  headroom,        // octaves the form plan will need above the lead lane
                   // (post-peak quiet section = 1–2; see §5). Default 1.
})
```

### Output

```js
{
  key: 'G:minor',            // the string the binder already consumes
                             // (harmonyContext.key / parseKey / keyUsesFlats)
  tonic: 'G', mode: 'minor', // pc name (sharps-normalized) + mode
  register: {                // the REGISTER PLAN — base lanes only; the form
    lead: 5,                 // phase applies per-section offsets on top (§5)
    accomp: 2,               // accompaniment anchor (figures declare 1–3 today)
    headroom: 1,             // octaves of lead ceiling left un-spent, so the
                             // queued post-peak-quiet lift (+1..+2) has room
  },
  why: [ ... ]               // human-readable trace: which prior row fired,
                             // which re-rolls happened — for the ear-verdict
                             // export, so a kill can be attributed to a rule
}
```

`why` matters: this project's only quality signal is the ear, so every rule
that fired must be attributable when a verdict comes back.

---

## 2. Data shape — `KEY_PRACTICE` in a new `src/lib/key-practice.js`

A plain data module (same style as the other `src/lib` tables: exported
consts, comments citing sources, no logic). The selection logic itself lives
beside it in `src/lib/key-select.js` so the table stays a candidate pool the
ear can prune without touching code.

```js
// src/lib/key-practice.js
// Corpus-measured key practice (census 2026-08-25). CANDIDATE POOL — every
// weight here is a statistic about corpora, not a ratified taste fact.
// Weights = per-SONG counts, margin-filtered: Undertale songs with
// keyMargin < 0.06 are DOWN-WEIGHTED x0.25 (the vgmusic admission gate,
// D51/D52 — below it the KS solve is unreliable); vgmusic is clean by gate.

export const MODE_BY_ROLE = {
  // { major, minor } per-song counts, Undertale corpus (census §2)
  battle:    { major: 3, minor: 4 },   // but G:minor owns the reliable half
  boss:      { major: 6, minor: 10 },
  town:      { major: 3, minor: 0 },   // 3/3 major, all solid margins
  overworld: { major: 3, minor: 9 },   // the cleanest role/mode signal
  cutscene:  { major: 16, minor: 7 },
  character: { major: 3, minor: 5 },
  menu:      { major: 1, minor: 0 },   // n=1 — falls through in practice
  shop:      { major: 1, minor: 1 },   // both thin-margin; treat as no signal
  credits:   { major: 0, minor: 1 },
  _fallback: { major: 43, minor: 40 }, // whole-corpus split (≈even)
};

export const ARC_MODE_NUDGE = {
  // CANDIDATE: endings are major 3:1 in the corpus; early skews minor 9:7.
  ending: { major: +2 },   // additive nudge on the row above
};

export const TONIC_BY_ROLE_MODE = {
  // pc → margin-weighted per-song count. Sharps-normalized. Only rows the
  // census trusts (§5 of the census) get entries; everything else falls
  // through to TONIC_FALLBACK. Thin-margin-dominated keys (D#maj, Dmaj,
  // D#min, A#maj, Bmin) are already down-weighted by the x0.25 rule.
  'battle|minor':    { G: 3 },                    // Ghost Fight .369, Dummy .253
  'boss|minor':      { F: 3, D: 2, 'A#': 1 },     // True Hero/Finale/Spider Dance;
                                                  // ASGORE + Megalovania
  'boss|major':      { C: 2 },                    // Flowey's pair
  'overworld|minor': { E: 3, F: 3 },              // Waterfall-side / Hotland-side
  'town|major':      { A: 1, C: 1, 'G#': 1 },
  'cutscene|major':  { A: 3, B: 3, D: 1 },        // A = warmth cluster (5/5 solid);
                                                  // B = the late/emotional lane
  'cutscene|minor':  { 'G#': 3 },
};

export const TONIC_FALLBACK = {
  // whole-corpus per-mode pc weights (UT margin-weighted + vgmusic), the
  // floor under every sparse row. Merging both pools inherits both priors
  // (census obs. 7): Toby is black-key-happy (33%), vgmusic is C-heavy.
  major: { C: 9, D: 4, A: 5, G: 6, 'A#': 5, B: 4, E: 4, F: 4, 'G#': 3, 'F#': 2, 'D#': 2, 'C#': 2 },
  minor: { F: 8, E: 9, G: 8, C: 11, A: 8, D: 5, 'A#': 6, 'G#': 4, B: 5, 'D#': 3, 'C#': 2, 'F#': 2 },
};

export const KEY_LANES = {
  // CANDIDATE named lanes — the census's strongest per-key stories, exposed
  // so generation intents can request them BY NAME instead of by weight.
  // Metadata, not law; each needs an ear verdict before it hardens.
  smallFight:   { key: 'G:minor'  },  // Toby's generic-encounter key
  heavyBoss:    { key: 'F:minor'  },  // True Hero / Finale / Spider Dance; never early-arc
  emotionalPeak:{ key: 'B:major'  },  // His Theme family; late/climax/ending
  warmth:       { key: 'A:major'  },  // Home / Reunited; the slow-cutscene key
};

export const REGISTER_PLAN = {
  // Engine lanes as they exist today (audition-undertale.mjs: bindMelody
  // octave: 5; figurations declare octave 1–3, mostly 2–3).
  lead:   { base: 5, min: 4, max: 6 },
  accomp: { base: 2, alt: 3, mudFloorMidi: 40 },  // ≈E2: below this, dense
                                                  // textures mud (CANDIDATE)
  // CANDIDATE mood/energy register nudges (the acoustically real lever):
  // dark/heavy or low-energy → accomp base 2 and consider lead 4;
  // bright/high-energy → accomp 3; tender/quiet → lead may sit high.
  // These need ear rounds before any of them is more than a default.
};
```

Design notes on the shape:

- **Margin-weighting instead of exclusion.** The census says 39% of UT songs
  are thin-margin. Dropping them would gut the table; weighting x0.25 keeps
  the pool wide while letting solid solves dominate. The factor itself is a
  CANDIDATE constant.
- **Sparse-by-design role rows.** Only census-trusted claims get role rows;
  the fallback carries everything else. This encodes the census's own
  caveats (shop = no signal; D#:major row = junk) structurally rather than
  as comments someone has to remember.
- **`KEY_LANES` is the leitmotif hook.** Research Axis 4 (implicit
  absolute-pitch memory, Schellenberg 2019) says a recurring theme's absolute
  pitch level is part of its identity. A generated game with a recurring
  villain can pin the villain's material to one lane; `character` input maps
  to a lane assignment kept in the caller's own project state, not here.

---

## 3. The selection algorithm (deterministic, in `src/lib/key-select.js`)

The repo's hash idiom, verbatim from `scripts/audition-undertale.mjs:141`:

```js
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
```

Namespaced seeds, matching the existing `fnv(`${name}|melody|${L}`)` pattern:
`fnv(`${name}|key|mode`)`, `fnv(`${name}|key|tonic`)`,
`fnv(`${name}|key|tonic|retry${i}`)`.

Steps:

1. **Mode.** Look up `MODE_BY_ROLE[role]` (fallback row if role missing),
   apply `ARC_MODE_NUDGE[arc]`, then weighted-pick with
   `fnv(name|key|mode)`. A caller with a hard intent (e.g. "ending must be
   major") passes mode explicitly and skips the roll.
2. **Tonic pool.** `TONIC_BY_ROLE_MODE[`${role}|${mode}`]` if present, merged
   over `TONIC_FALLBACK[mode]` at low weight (role row x3, fallback x1 —
   CANDIDATE ratio) so role practice leads but the full pc gamut stays
   reachable (Toby uses all 24 keys; the policy should too, thinly).
3. **Tonic pick.** Weighted-pick with `fnv(name|key|tonic)`.
4. **Variety re-roll.** If the picked pc is in `avoid` (tonics of the last
   N=2 generated songs — caller-supplied, since the policy is stateless),
   re-roll with `...|retry${i}`, i = 1..8; after 8 tries accept the collision
   (a same-tonic neighbor is a taste misdemeanor, not a crash). Deterministic:
   the same name + same avoid list always lands the same key. CANDIDATE:
   also avoid the exact (tonic, mode) pair of the last 3 songs.
5. **Register plan.** Start from `REGISTER_PLAN` bases (lead 5, accomp 2).
   Adjustments, all CANDIDATE:
   - **Mud guard:** if the accompaniment's lowest structural tone
     (tonic at `accomp.base`) lands below `mudFloorMidi` for a dense figure,
     raise accomp to 3. (High pcs at octave 2 — A2/B2 — are safe; the guard
     mostly matters if a figure declares octave 1.)
   - **Energy/mood nudge:** high-energy/bright → accomp 3 (tighter, brighter
     stack); dark/heavy → keep 2. Lead stays 5 unless mood says otherwise —
     the census shows Toby moves *mode and tempo* per role far more than
     lead register.
   - **Headroom:** `lead.max (6) − lead.base` must be ≥ the caller's
     `headroom` request. If a form plans a post-peak quiet lift of +2, base
     lead must stay at 5 at most, or the lift clamps to +1 (see §5). The
     policy never spends the ceiling itself.
6. **Trace.** Record every rule that fired into `why`.

Properties: pure function of its inputs; same song name → same key forever
(so already-auditioned generated songs never change identity under a table
re-weight only if the weights are unchanged — a table edit IS an identity
change and should be treated like any library change: re-audition).

---

## 4. What the policy explicitly does NOT do

- **No per-key affect.** No "D minor is epic" rule anywhere in the code path.
  If the owner ever wants Schubart flavor text, it hangs off `KEY_LANES` as
  display metadata for generation UIs, with zero selection weight.
- **No instrument-idiom axis yet.** Research Axis 6 (strings→sharp keys,
  brass→flat keys) is OFF: the engine's patches are abstract synth/piano and
  the idiom argument evaporates without physical instruments. The
  `instrumentation` input is accepted and currently only feeds the register
  plan (lead/accomp lanes per palette), reserving the slot.
- **No key-to-tempo coupling.** The census is blunt (obs. 9): tempo separates
  roles better than key does — battle median 174bpm vs ~116 everywhere else.
  Tempo policy is a separate table; this module must not smuggle bpm rules in.
- **No modulation planning (yet).** Research Axis 5 (home key as routing for
  section moves) matters once generated songs modulate; today's generated
  forms stay in one key. When D-ruling-level section modulation arrives, this
  module grows a `destinations` check (every planned destination key must
  keep both lanes inside their bands) — noted in steps, not built now.

---

## 5. Tie-in: the queued octave-as-section-parameter ruling

todo.md (~line 435) queues: *"octave as a section parameter (post-peak quiet
section 1-2 octaves up, with variations — form phase)"*.

Division of labor, so the two features compose instead of fighting:

- **This policy owns the BASE lanes** — `register.lead` / `register.accomp`
  for the song, plus a `headroom` guarantee.
- **The form phase owns per-section OFFSETS** — e.g.
  `section.octaveOffset: +1` on the post-peak quiet section, applied to the
  lead lane at bind time (`octave: base + offset` in the `bindMelody` opts).
- **The contract between them:** the form phase asks for headroom when the
  key is selected (`headroom: 2` if it intends a +2 lift); the key policy
  guarantees `base + headroom ≤ lead.max`. If the tonic pick would push the
  quiet section's top notes past the usable piano range (high pcs at octave
  7), the form clamps the lift to +1 rather than the key policy re-rolling
  the tonic — register plans bend before tonic identity does, because tonic
  identity is what stays stable across a song's audition history.
- CANDIDATE: the quiet-section lift may also want the accompaniment thinned
  or raised; that is the form phase's call, out of scope here.

---

## 6. Where it wires

- **Generation/CLI only.** The future song-generation path (the "gen" arm /
  CLI) calls `selectKey(...)` once per generated song, before harmony
  retrieval, and threads `key` into `harmonyContext` exactly as
  `audition-undertale.mjs` threads `e.sourceKey` today, and `register` into
  the `bindMelody`/figure octave opts.
- **Audition pages unchanged.**
  - `audition/undertale.html` (via `scripts/audition-undertale.mjs`) keeps
    playing each song's solved `sourceKey` — it is a corpus mirror, not a
    generator.
  - `audition/progressions.html` keeps its deliberate everything-in-C render
    (`keyFor` at `scripts/audition-progressions.mjs:76`) — comparability
    across cards is the point; injecting per-card keys would destroy the
    controlled variable.
- **No importer changes.** `sourceKey`/`keyMargin` stay as-is; the census
  script stays in scratchpad; `KEY_PRACTICE` is hand-built from the census
  with the weighting rule documented inline (a builder script can regenerate
  it later if the corpora grow — step 8).

---

## 7. What needs the owner's ear (the CANDIDATE ledger)

Every one of these ships as a default and dies or hardens by verdict:

1. The x0.25 thin-margin down-weight, and the role-row x3 : fallback x1 mix.
2. Each `KEY_LANES` entry (smallFight/heavyBoss/emotionalPeak/warmth) —
   corpus stories, plausibly audible, entirely unratified.
3. The mode-by-role priors as *defaults* (especially battle, where the
   corpus is 4:3 but the reliable half is all G:minor).
4. The register nudges (accomp 2 vs 3 by energy; the E2 mud floor; whether
   lead ever leaves 5 outside section offsets).
5. The variety rule's N (avoid last 2 tonics) and whether (tonic, mode)
   pairs also need spacing.
6. Whether generated songs should ever land on the four famous-but-thin
   solves' keys *because of* those songs (Spear of Justice G#:major etc.) —
   the census says those keys are guesses; the table already down-weights
   them, but a lane request could still name them.
7. The ending→major nudge (3:1 in corpus, n=4 — thin evidence, big vibe).

Suggested ear protocol (matches existing practice): a small audition page or
CLI batch that renders the SAME generated song in 3–4 policy-picked keys and
registers, exported through the judge flow so verdicts land in
`verdicts.js` with the `why` trace attached.

---

## 8. Implementation steps

1. Create `src/lib/key-practice.js`: the `MODE_BY_ROLE`, `ARC_MODE_NUDGE`,
   `TONIC_BY_ROLE_MODE`, `TONIC_FALLBACK`, `KEY_LANES`, `REGISTER_PLAN`
   tables above, with the census date, weighting rule (x0.25 under
   margin 0.06), and CANDIDATE banners in the header comment.
2. Create `src/lib/key-select.js`: `selectKey(input) → { key, tonic, mode,
   register, why }`, using the repo's fnv-1a idiom with namespaced seeds
   (`|key|mode`, `|key|tonic`, `|key|tonic|retry${i}`); pure and stateless
   (`avoid` and `headroom` come from the caller).
3. Add `test/keys.test.js`: determinism (same name → same result), variety
   (avoid-list re-roll lands a different pc and is itself deterministic),
   fallback (unknown role → corpus-wide priors), headroom guarantee
   (`register.lead + headroom ≤ 6`), mud guard, and a distribution smoke
   test (1000 hashed names: all 12 pcs reachable in both modes, no pc > ~25%).
4. Wire into the generation path only: wherever the gen arm builds
   `harmonyContext`, replace the implicit C with `selectKey(...)`; thread
   `register.lead` into `bindMelody` opts and `register.accomp` into figure
   octave selection. Leave every `scripts/audition-*.mjs` key path untouched.
5. Extend the gen caller to keep a rolling `avoid` list (last 2 tonics)
   across a generated set, passing it through — the policy stays stateless.
6. Form-phase handshake (with the queued octave ruling, when that lands):
   form requests `headroom`; section octave offsets apply at bind time on
   top of `register.lead`; clamp rule (lift bends, tonic doesn't) documented
   in both modules.
7. Build the ear-round audition batch (§7 protocol), run it through the
   judge export/import flow, and record the verdicts; prune/re-weight
   `KEY_PRACTICE` from verdicts, never from more statistics.
8. Optional later: `scripts/build-key-practice.mjs` to regenerate the tables
   from the corpora + margin rule when new packs land (same generated-file
   pattern as `atlas.js`); and the modulation-geography `destinations` check
   once section modulation exists.
9. DECISIONS.md entry documenting: mode+register carry affect, tonic is
   corpus-practice + hash variety, per-key affect claims are metadata only,
   and the audition pages' key behavior is intentionally unchanged.
