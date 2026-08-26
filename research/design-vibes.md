# Vibe = EMOTION × ENVIRONMENT — design for `src/lib/vibes.js`

**Status: CANDIDATE, all of it.** Per A6.1 the owner's ear is the only quality signal in
this project. Every table, mapping, number, and default below is a proposal that becomes
a fact only when generated songs pass the ear. The audition surface for this design IS
the planned 20-environmental + 20-emotional song batch (section 8). Nothing here claims
anything "sounds good"; it claims only what the vocabularies SAY and what the compile
step would DO.

Grounding read for this design: `vibes-census.md` (every existing vocabulary and
mismatch M1–M7), `env-research.md` (genre-norm parameter rows for 17 environments), and
the working tree: `src/binder/arrange.js` (13 roles, ROLE_SLATE / ROLE_MOODS /
ROLE_FORM / ARCHETYPES energy, `planArrangement(situation)`), `src/lib/instruments.js`
(43 instruments, 41 mood words), `src/lib/figurations-undertale.js` (+videos: class
vocabulary), `src/lib/rhythms.js` (15 `role:'percussion'` entries), atlas vibeFeatures.

## 0. The factorization (owner's brief + research finding)

Owner: *"vibes aren't just 'excited / sad etc', they're also meant to describe
environments. so the atmosphere like 'happy shop' or 'construction' or 'fight
activity'."*

Research (env-research.md, CANDIDATE): **environment lives in timbre, texture/
figuration, groove, percussion, ensemble address; emotion lives in mode, tempo,
register, harmonic color.** Evidence poles: Nintendo's sleigh-bell synecdoche (winter =
one timbre tag over any genre base) and Undertale's genocide transform (Tem Shop at half
speed, pitched down = same environment, flipped emotion).

So the model is not a flat list of vibe words. It is two orthogonal axes that compose:

- **ENVIRONMENT** → the *material*: role archetype, instrument palette bias, figuration
  class, percussion profile, meter, base tempo range, salience.
- **EMOTION** → the *transform*: mode/family bias, tempo multiplier, register delta,
  chromaticism pull, percussion multiplier, energy delta, plus the mood WORDS that feed
  instrument casting.

`vibe = compileVibe({ emotion, environment })` = environment material with the emotion
transform applied on top, then explicit overrides. Either axis may be null:
`'construction'` alone is a legal vibe (neutral emotion), and `'sad'` alone is a legal
vibe (no environment → no role implied, current behavior).

---

## 1. Vocabulary

### 1a. Emotion axis — 12 names, each EXPANDING to existing words (no new leaf words)

Rule: an emotion is a **thesaurus row over vocabularies that already exist**. Its
`moods` list ⊆ the 41 instruments.js words (lowercase, verbatim); its `tags` list ⊆ the
22 ldrolez tags (Capitalized, verbatim). Where an existing word IS the natural name
(sad, calm, tense, nostalgic), the emotion reuses that spelling as its key. This keeps
D46's discipline: no word enters the system without a consumer.

| emotion | instruments.js `moods` (verbatim) | ldrolez `tags` (verbatim) | family | tempoMul | regΔ | percMul | colorBias |
|---|---|---|---|---|---|---|---|
| happy | warm, bright, playful, hopeful | Joyful, Hopeful, Playful | major | 1.0 | 0 | 1 | 0 |
| sad | sad, plaintive, lonely, tender | Sad, Lonely | minor | 0.65 | −1 | 0 | 0 |
| calm | calm, relaxed, gentle, spacious | Peaceful, Relaxed | (keep env) | 0.85 | 0 | 0.5 | 0 |
| excited | driving, bright, playful, epic | Excited, Joyful | major | 1.15 | 0 | 1.25 | 0 |
| tense | tense, ominous, dark, driving | Dark, Fearful | minor | 1.05 | 0 | 1 | 0.3 |
| scary | eerie, ominous, grave, dark | Dark, Fearful, Mysterious | minor | 0.9 | −1 | 0.5 | 0.5 |
| mysterious | eerie, dreamy, magical, sly | Mysterious | modal | 0.9 | 0 | 0.5 | **0.6** |
| triumphant | triumphant, heroic, epic, noble | Triumphant, Empowered | major | 1.05 | 0 | 1.25 | 0 |
| nostalgic | nostalgic, tender, retro, warm | Nostalgic | (keep env) | 0.9 | 0 | 0.75 | 0 |
| romantic | tender, intimate, warm, dreamy | Romantic | major | 0.85 | 0 | 0.5 | 0.2 |
| somber | grave, sad, plaintive, sacred | Sad, Anguished, Dramatic | minor | 0.6 | −1 | 0 | 0.1 |
| goofy | comic, quirky, playful, baroque | Playful, Surprised | major | 1.1 | +1 | 1 | 0.2 |

- `family` = harmony family bias (`major | minor | modal`), the atlas's existing enum.
  "(keep env)" = this emotion does not fight the environment's default family.
- `tempoMul` multiplies the environment's base bpm (the genocide transform is literally
  `sad` = ×0.65, register −1, percussion stripped).
- `regΔ` shifts the register hint in octaves (applied to lead and acc octave hints,
  clamped; instruments' own `range` still clamps last, per D46 — lane proposes, range wins).
- `percMul` scales percussion presence (0 = strip percussion entirely — "percussion =
  activity, and activity has ended", env-research aftermath row).
- `colorBias` 0..1 = chromaticism pull for progression retrieval via atlas
  `colorCount` (borrowed degrees). **`mysterious` deliberately gets the highest pull**:
  the MOOD CALIBRATION ruling (DECISIONS.md ~2716) says the Mysterious tags read too
  consonant to earn the word, and the vibe layer must pull more chromaticism than the
  tag delivers. This is the first ruling this design discharges.

CANDIDATE by construction: the 12 names, every row value, and every expansion are for
the ear to confirm or correct. Corrections should live in vibes.js data (the
`MOOD_CORRECTIONS` pattern from import-ldrolez.mjs: the ear's word outranks the table,
and regeneration reproduces it).

### 1b. Environment axis — 17 environments (from env-research.md rows)

Names are lowercase slugs. `fight` (not "battle") and `construction` (not "factory")
follow the owner's own words; the research's factory row IS construction. The 17 rows
of the research map 1:1; `town`/`overworld` are deliberately NOT duplicated as
environments — they remain reachable as raw roles (see §6/§7), and the environment list
can grow after the first ear pass.

| environment | implies role | bpm | meter | default family | perc presence | figuration classes |
|---|---|---|---|---|---|---|
| shop | shop | 90–120 | 4/4 | major | light | oompah, block |
| fight | battle | 140–180 | 4/4 | minor | driving | bass, ostinato |
| boss | boss | 150–185 | 4/4 | minor | foreground | ostinato, bass, block |
| construction | chase (see §7) | 100–140 | 4/4 | minor | foreground | ostinato, block |
| stealth | chase | 70–110 | 4/4 | minor | light | bass, ostinato |
| snow | overworld | 60–110 | 3/4, 4/4 | major | none | arp, oompah |
| water | overworld | 60–90 | 6/8, 4/4, 3/4 | major (lydian-ish colors) | none | arp, arp_down |
| desert | overworld | 80–120 | 4/4, 2/4 | modal (Phrygian-dom colors) | light | bass, ostinato |
| cave | overworld | 50–90 | 4/4 loose | modal | none | arp, figure |
| lab | character | 100–140 | 4/4 | minor | driving | arp, ostinato |
| casino | diegetic | 120–160 | 4/4 swing | major | driving | oompah, bass, block |
| festival | town | 100–140 | 2/4, 4/4, 6/8 | major | foreground | oompah, block |
| kitchen | joke | 110–150 | 2/4, 4/4 | major | light | oompah, block |
| training | chase | 120–150 | 4/4 | major | driving | ostinato, bass |
| rest | cutscene | 50–80 | 3/4, 4/4 | major | none | arp, block |
| menu | menu | 60–120 | 4/4 | major | none | arp, block |
| aftermath | cutscene | 50–75 | 4/4 | minor | none | block, arp |

Every referenced vocabulary is existing and unrenamed:

- **roles** ⊆ arrange.js's 13 (`boss battle chase cutscene character credits ending town
  overworld shop diegetic menu joke`).
- **figuration classes** ⊆ the extracted class vocabulary (`block oompah bass ostinato
  arp arp_down arp_up figure` in figurations-undertale.js; `walkup run` in videos).
- **envMoods** (below) ⊆ the 41 instruments.js words.
- **percussion patterns** ⊆ existing `role:'percussion'` rhythm names in rhythms.js.

Each environment also carries `envMoods` — the environment's own casting words, all
existing instrument words (this is the half of the vocabulary ROLE_MOODS could never
vary; note `water` deliberately includes `ethereal`, redeeming the census's one dead
word, M1):

- shop: jazzy, playful, folk, retro, quirky, relaxed
- fight: epic, driving, dark, tense, triumphant
- boss: epic, driving, dark, ominous, tense, heroic
- construction: driving, dark, retro, tense
- stealth: sneaking, tense, ominous, sly
- snow: magical, innocent, bright, gentle, tender
- water: dreamy, spacious, calm, airy, ethereal
- desert: lonely, spacious, eerie, questing
- cave: eerie, spacious, lonely, grave, dark
- lab: quirky, retro, eerie, driving
- casino: jazzy, sly, retro, playful
- festival: folk, warm, bright, playful, triumphant
- kitchen: comic, quirky, playful, baroque
- training: driving, heroic, retro, bright
- rest: tender, calm, gentle, intimate, nostalgic
- menu: bright, magical, calm
- aftermath: sad, plaintive, grave, intimate, tender

And per-environment **instrument affinity** (`instBias`), the timbre synecdoche made
explicit — names ⊆ instruments.js keys, instruments.js itself untouched (§5):

- shop — boost: gm_marimba, gm_vibraphone, gm_accordion, gm_kalimba, gm_epiano1,
  gm_acoustic_guitar_nylon, gm_pizzicato_strings, gm_muted_trumpet, gm_acoustic_bass,
  gm_xylophone · avoid: gm_church_organ, gm_tubular_bells, gm_choir_aahs,
  gm_string_ensemble_1, gm_lead_2_sawtooth, gm_tremolo_strings
- fight — boost: gm_lead_2_sawtooth, gm_lead_1_square, gm_synth_bass_1,
  gm_string_ensemble_1, gm_trumpet, gm_tremolo_strings · avoid: gm_music_box,
  gm_celesta, gm_kalimba, gm_recorder, gm_pan_flute
- boss — boost: gm_church_organ, gm_choir_aahs, gm_tubular_bells, gm_lead_2_sawtooth,
  gm_tremolo_strings, gm_trombone, gm_string_ensemble_1 · avoid: gm_kalimba,
  gm_recorder, gm_music_box, gm_accordion
- construction — boost: gm_synth_bass_1, gm_lead_2_sawtooth, gm_lead_1_square,
  gm_xylophone, gm_marimba, gm_harpsichord · avoid: gm_orchestral_harp, gm_ocarina,
  gm_recorder, gm_pad_new_age, gm_choir_aahs, gm_voice_oohs
- stealth — boost: gm_pizzicato_strings, gm_contrabass, gm_synth_bass_1, gm_pad_bowed,
  gm_muted_trumpet · avoid: gm_trumpet, gm_glockenspiel, gm_xylophone
- snow — boost: gm_celesta, gm_glockenspiel, gm_vibraphone, gm_music_box, gm_flute,
  gm_pad_halo · avoid: gm_lead_2_sawtooth, gm_trombone, gm_synth_bass_1
- water — boost: gm_orchestral_harp, gm_epiano1, gm_pad_warm, gm_pad_halo,
  gm_voice_oohs, gm_vibraphone, gm_lead_3_calliope · avoid: gm_xylophone,
  gm_glockenspiel, gm_trumpet, gm_harpsichord
- desert — boost: gm_oboe, gm_acoustic_guitar_nylon, gm_contrabass, gm_pad_bowed,
  gm_kalimba · avoid: gm_epiano1, gm_lead_1_square, gm_celesta
- cave — boost: gm_pad_warm, gm_kalimba, gm_orchestral_harp, gm_contrabass,
  gm_choir_aahs, gm_pan_flute · avoid: gm_trumpet, gm_xylophone, gm_glockenspiel
- lab — boost: gm_lead_1_square, gm_synth_bass_1, gm_lead_3_calliope, gm_epiano1,
  gm_harpsichord, gm_xylophone · avoid: gm_accordion, gm_orchestral_harp, gm_cello
- casino — boost: gm_muted_trumpet, gm_vibraphone, gm_acoustic_bass, gm_epiano1,
  gm_clarinet, gm_trumpet · avoid: gm_pad_warm, gm_church_organ, gm_ocarina
- festival — boost: gm_accordion, gm_trumpet, gm_recorder, gm_marimba, gm_xylophone,
  gm_acoustic_bass · avoid: gm_pad_halo, gm_tremolo_strings, gm_music_box
- kitchen — boost: gm_xylophone, gm_pizzicato_strings, gm_bassoon, gm_trombone,
  gm_kalimba, gm_recorder · avoid: gm_choir_aahs, gm_string_ensemble_1, gm_pad_bowed
- training — boost: gm_lead_1_square, gm_synth_bass_1, gm_trumpet, gm_epiano1,
  gm_marimba · avoid: gm_music_box, gm_pad_warm, gm_orchestral_harp
- rest — boost: gm_music_box, gm_celesta, gm_acoustic_guitar_nylon, gm_pad_warm,
  gm_voice_oohs, gm_vibraphone · avoid: gm_trumpet, gm_lead_2_sawtooth, gm_xylophone,
  gm_glockenspiel
- menu — boost: gm_celesta, gm_pad_new_age, gm_epiano1, gm_orchestral_harp,
  gm_lead_3_calliope · avoid: gm_trombone, gm_tremolo_strings
- aftermath — boost: gm_cello, gm_violin, gm_viola, gm_music_box, gm_oboe,
  gm_voice_oohs · avoid: gm_lead_1_square, gm_lead_2_sawtooth, gm_xylophone,
  gm_glockenspiel, gm_trumpet, gm_synth_bass_1

Percussion patterns per environment (⊆ rhythms.js `role:'percussion'` names):

- shop: tresillo, swung_lofi_hats · fight: sixteenth_drive, dembow, gallop_arp ·
  boss: sixteenth_drive, gallop_arp, four_floor · construction: four_floor,
  sixteenth_drive, anticipation_bass · stealth: two_step_kick, seven_pulse_223 ·
  desert: tresillo, son_clave_3 · lab: push_pull_16s, four_floor · casino:
  swung_lofi_hats, backbeat_ghost, lazy_dilla · festival: four_floor, son_clave_3,
  seven_hats_223 · kitchen: two_step_kick, tresillo · training: four_floor,
  backbeat_ghost · snow/water/cave/rest/menu/aftermath: none (presence 'none').

Honesty note on percussion: the arranger does not currently render a percussion lane at
all; `percussion` in the compiled object is a *retrieval + rendering hint* for the
audition batch script, and presence `none` costs nothing. Wiring a perc lane is step 8,
after the ear has spoken on everything cheaper.

### 1c. Salience (carried, not invented)

env-research §Principles 4: intensity ≠ salience. Each environment carries
`salience: 'background' | 'foreground'` (shop/menu/rest/water/cave/construction =
background; boss/fight/festival/aftermath = foreground; rest = background). v1 use:
advisory data on the audition card + a candidate gain trim on non-lead layers for
background environments. The ear decides if it earns wiring.

---

## 2. The compile step — `compileVibe(spec) → params`

```
compileVibe({
  emotion?: string|null,        // key of EMOTIONS
  environment?: string|null,    // key of ENVIRONMENTS
  name?: string,                // song name — the ONLY seed (fnv hash, D32: no dice)
  role?, bpm?, family?, key?, ...overrides   // explicit overrides, always win
})
```

Precedence (hard rules → ranked defaults → seeded choice, the D32 house shape):

1. **Environment material** — role, bpm range, meter set, default family, envMoods,
   instBias, figClasses, percussion, salience, register hints, energyCap.
2. **Emotion transform** on top — family override (unless "(keep env)"), bpm ×tempoMul,
   register +regΔ, percussion presence scaled by percMul, energy +energyDelta,
   colorBias, emotion moods PREPENDED to envMoods, tags.
3. **Explicit overrides** win over both (§7: role override is the named escape hatch).
4. All picks (bpm within range, meter within set, key within family pool) are
   `fnv(name + '|' + field)` — deterministic forever, same as arrange.js.
5. bpm is NOT re-clamped into the environment range after the emotion multiplier — the
   transform escaping the range is the point (genocide transform) — only an absolute
   [50, 190] clamp applies.

Compiled output (the exact proposed shape — a *situation patch* plus retrieval hints;
`notes` is a why-trace in the planArrangement style):

```js
{
  vibe: { emotion, environment },        // echo of the request
  role,                                  // arrange.js role (env-implied or overridden)
  family,                                // 'major' | 'minor' | 'modal'
  bpm, bpmRange, meter,
  keyHint,                               // e.g. 'C' — hash-picked from a per-family pool
  register: { accOctave, leadOctave },   // hints; instrument range still clamps (D46)
  energy: { cap, delta },                // vs ARCHETYPES energy 1–5; advisory in v1
  salience,                              // 'background' | 'foreground'
  moods: [...],                          // emotion.moods + envMoods — instruments.js
                                         //   words only; feeds planArrangement s.moods
                                         //   (an EXISTING param, today always null)
  progTags: [...],                       // ldrolez tags for findProgressions({moods})
  atlasQuery: {                          // handle for the 251 tagless entries (M5):
    family, colorCount: [min, max],      //   colorBias → colorCount pull (MOOD
    cadence: [...], harmonicRhythm,      //   CALIBRATION discharged here)
    tensionShape,
  },
  instBias: { boost: [...], avoid: [...] },  // instruments.js keys; casting nudge
  figClasses: [...],                     // figuration class filter preference
  percussion: { presence, patterns },    // presence: none|light|driving|foreground
  loopHint,                              // seconds band from env-research §3, advisory
  notes: [...],                          // why-trace, one line per decision
}
```

Consumption map (all additive, nothing renamed — §5):

- `moods` → `planArrangement`'s existing `s.moods` (census M2: this field is wired but
  always null today; compileVibe is its first real producer — **zero arrange.js change**).
- `progTags` → existing `findProgressions({ moods })` for tagged pools.
- `atlasQuery` → atlas vibe-feature filter for the untagged 251 (vgmusic + undertale).
- `instBias` → ONE new optional additive term in the casting score (§5).
- `figClasses`, `percussion`, `bpm`, `keyHint`, `register`, `energy` → the batch
  generation script (the same place audition-undertale.mjs already decides bpm/key).

---

## 3. Three examples walked fully

### 3a. `compileVibe({ emotion: 'happy', environment: 'shop', name: 'demo-happy-shop' })`

Environment gives: role shop, bpm 90–120, 4/4 (3/4 possible), major, light percussion,
oompah/block figures, chamber-intimate boosts, background salience. Emotion `happy`
gives: family major (agrees), tempoMul 1.0, its four casting words, Joyful/Hopeful/
Playful tags. Hash picks bpm 104 within range and key from the major pool.

```js
{
  vibe: { emotion: 'happy', environment: 'shop' },
  role: 'shop',
  family: 'major',
  bpm: 104, bpmRange: [90, 120], meter: '4/4',
  keyHint: 'C',
  register: { accOctave: 3, leadOctave: 5 },
  energy: { cap: 3, delta: 0 },
  salience: 'background',
  moods: ['warm', 'bright', 'playful', 'hopeful',            // emotion
          'jazzy', 'folk', 'retro', 'quirky', 'relaxed'],    // environment ('playful' deduped)
  progTags: ['Joyful', 'Hopeful', 'Playful'],
  atlasQuery: { family: 'major', colorCount: [0, 1], cadence: ['loop', 'half'],
                harmonicRhythm: 'slow', tensionShape: 'flat' },   // circular, non-cadential browsing
  instBias: {
    boost: ['gm_marimba', 'gm_vibraphone', 'gm_accordion', 'gm_kalimba', 'gm_epiano1',
            'gm_acoustic_guitar_nylon', 'gm_pizzicato_strings', 'gm_muted_trumpet',
            'gm_acoustic_bass', 'gm_xylophone'],
    avoid: ['gm_church_organ', 'gm_tubular_bells', 'gm_choir_aahs',
            'gm_string_ensemble_1', 'gm_lead_2_sawtooth', 'gm_tremolo_strings'],
  },
  figClasses: ['oompah', 'block'],
  percussion: { presence: 'light', patterns: ['tresillo', 'swung_lofi_hats'] },
  loopHint: [30, 60],
  notes: [
    'environment shop → role shop (no override)',
    'emotion happy: family major agrees with shop default',
    'bpm 104 hash-picked in shop range 90–120 × happy tempoMul 1.0',
    'moods: happy words lead, shop words behind; role shop adds its own inside arrange.js',
    'cadence bias loop/half: shop time is suspended while menus are read (CANDIDATE)',
  ],
}
```

Downstream: arrange.js builds its casting list as `s.moods + ROLE_MOODS.shop +
FAMILY_MOODS.major` — the compiled words now double-hit warm/bright/playful/jazzy
instruments (marimba scores mood 3+, sawtooth 0 and avoided). The contrast case
**gloomy shop** (`{emotion:'sad', environment:'shop'}`) is the same object with family
minor, bpm ≈ 68 (104 × 0.65, escaping the range — genocide transform), register −1,
percussion stripped, sad/plaintive/lonely/tender leading the moods — role still shop,
so the slate/form still browse-shaped. That pair is exactly what the batch must put in
front of the ear.

### 3b. `compileVibe({ environment: 'construction', name: 'demo-construction' })` — no emotion

Neutral emotion = pure environment material, no transform.

```js
{
  vibe: { emotion: null, environment: 'construction' },
  role: 'chase',            // CANDIDATE mapping — see §7; override with { role: ... }
  family: 'minor',
  bpm: 122, bpmRange: [100, 140], meter: '4/4',
  keyHint: 'Am',
  register: { accOctave: 2, leadOctave: 4 },     // low-mid machine floor
  energy: { cap: 4, delta: 0 },
  salience: 'background',   // high intensity, LOW salience: grid texture, minimal tune
  moods: ['driving', 'dark', 'retro', 'tense'],
  progTags: [],             // no emotion → no tag filter; retrieval leans on atlasQuery
  atlasQuery: { family: 'minor', colorCount: [0, 0], cadence: ['loop'],
                harmonicRhythm: 'static', rootMotion: 'same',   // machines don't modulate
                tensionShape: 'flat' },
  instBias: {
    boost: ['gm_synth_bass_1', 'gm_lead_2_sawtooth', 'gm_lead_1_square',
            'gm_xylophone', 'gm_marimba', 'gm_harpsichord'],
    avoid: ['gm_orchestral_harp', 'gm_ocarina', 'gm_recorder', 'gm_pad_new_age',
            'gm_choir_aahs', 'gm_voice_oohs'],
  },
  figClasses: ['ostinato', 'block'],   // interlocking rigid ostinati, on-grid
  percussion: { presence: 'foreground',
                patterns: ['four_floor', 'sixteenth_drive', 'anticipation_bass'] },
  loopHint: [30, 60],
  notes: [
    'environment construction → role chase (CANDIDATE: driving/retro/dark/tense is the closest ROLE_MOODS row; overworld rejected — its words are pastoral/airy/calm, the opposite of a machine floor)',
    'no emotion: environment defaults pass through untransformed',
    'harmonicRhythm static + rootMotion same: one-chord vamp norm (Cartridge Lit factory analysis)',
    'salience background despite foreground percussion: melody minimal, texture is the point',
  ],
}
```

### 3c. `compileVibe({ environment: 'fight', name: 'demo-fight' })` — activity as environment

```js
{
  vibe: { emotion: null, environment: 'fight' },
  role: 'battle',
  family: 'minor',
  bpm: 156, bpmRange: [140, 180], meter: '4/4',
  keyHint: 'Am',
  register: { accOctave: 3, leadOctave: 5 },
  energy: { cap: 5, delta: 0 },
  salience: 'foreground',   // the hook is the point, front-loaded (battles begin abruptly)
  moods: ['epic', 'driving', 'dark', 'tense', 'triumphant'],
  progTags: [],
  atlasQuery: { family: 'minor', colorCount: [0, 2], cadence: ['loop', 'resolves'],
                harmonicRhythm: 'fast', tensionShape: 'arch' },   // i–bVI–bVII riff loops
  instBias: {
    boost: ['gm_lead_2_sawtooth', 'gm_lead_1_square', 'gm_synth_bass_1',
            'gm_string_ensemble_1', 'gm_trumpet', 'gm_tremolo_strings'],
    avoid: ['gm_music_box', 'gm_celesta', 'gm_kalimba', 'gm_recorder', 'gm_pan_flute'],
  },
  figClasses: ['bass', 'ostinato'],
  percussion: { presence: 'driving', patterns: ['sixteenth_drive', 'dembow', 'gallop_arp'] },
  loopHint: [15, 30],       // combat loop norm: tense without becoming a jingle
  notes: [
    'environment fight → role battle: env moods EQUAL ROLE_MOODS.battle by design — fight is a thin wrapper over the existing role, adding only timbre/figure/perc/loop material the role never carried',
    'no emotion: neutral. {emotion:"triumphant", environment:"fight"} would flip family major and add Triumphant/Empowered tags — a winning fight',
  ],
}
```

The fight card demonstrates the compatibility claim in miniature: where an environment
coincides with an existing role, the compiled words are IDENTICAL to today's — the new
axis only adds material the role system never expressed (timbre bias, figuration class,
percussion, loop length).

---

## 4. Data home — `src/lib/vibes.js` (exact proposed shape)

```js
// Vibe = EMOTION × ENVIRONMENT (D6x). Emotion transforms; environment is material.
// Every entry is a CANDIDATE (A6.1): ratified stays false and character stays null
// until the owner's ear passes on generated songs (audition: the 20+20 vibe batch).
// Vocabulary discipline (D46): every leaf word here already exists elsewhere —
// moods ⊆ instruments.js words, tags ⊆ ldrolez tags, roles ⊆ arrange.js roles,
// figClasses ⊆ figuration class vocab, percussion.patterns ⊆ rhythms.js names.
// Nothing is renamed; this file only REFERENCES. test/vibes.test.js enforces closure.

export const EMOTIONS = {
  happy: {
    family: 'major', tempoMul: 1.0, registerDelta: 0, energyDelta: 0,
    percMul: 1, colorBias: 0, cadenceBias: null,
    moods: ['warm', 'bright', 'playful', 'hopeful'],
    tags: ['Joyful', 'Hopeful', 'Playful'],
    ratified: false, character: null,
  },
  // ... 11 more rows per §1a
};

export const ENVIRONMENTS = {
  shop: {
    role: 'shop',                       // arrange.js role this environment implies
    bpm: [90, 120], meters: ['4/4', '3/4'],
    family: 'major',                    // default; emotion.family overrides
    register: { accOctave: 3, leadOctave: 5 },
    energyCap: 3, salience: 'background',
    envMoods: ['jazzy', 'playful', 'folk', 'retro', 'quirky', 'relaxed'],
    instBias: { boost: [/* §1b */], avoid: [/* §1b */] },
    figClasses: ['oompah', 'block'],
    percussion: { presence: 'light', patterns: ['tresillo', 'swung_lofi_hats'] },
    atlas: { cadence: ['loop', 'half'], harmonicRhythm: 'slow', tensionShape: 'flat' },
    loopHint: [30, 60],
    ratified: false, character: null,   // written only when the ear ratifies
  },
  // ... 16 more rows per §1b
};

export function compileVibe(spec) { /* §2 algorithm; returns the params object */ }
export function vibeNames() { /* { emotions: [...], environments: [...] } for UIs */ }
```

House-style conformance: generated-file conventions don't apply (this is hand-curated
like undertale-context.js — curated, sourced, never invented per the census's closing
CANDIDATE); `ratified: false` / `character: null` at birth per A6.1; determinism via
fnv, no dice per D32; ear-corrections recorded in-place so nothing regenerates over them.

## 5. Compatibility — nothing renamed, everything referenced

- **instruments.js**: untouched. Affinity lives in `ENVIRONMENTS[env].instBias` as a
  one-way reference by instrument key. Consumption: one additive term in the casting
  score — `score += (boost.includes(name) ? ENV_BOOST : 0) - (avoid.includes(name) ?
  ENV_AVOID : 0)` with CANDIDATE weights ENV_BOOST 1.0 / ENV_AVOID 1.5, read from a new
  OPTIONAL `s.instBias` on the situation. Absent field = identical behavior to today
  (existing tests must pass unchanged).
- **arrange.js roles/slates/forms/ROLE_MOODS**: untouched. The environment reaches them
  by *choosing a role*, exactly as undertale-context.js roles do today.
- **`s.moods`**: already a planArrangement parameter (currently always null, census
  M2) — compileVibe is a producer for an existing consumer, not a new vocabulary.
- **ldrolez tags**: referenced verbatim (Capitalized) through the existing
  `findProgressions({ moods })` path; casing quirk M3 stays quarantined where it lives.
- **figuration `class` / rhythm names / atlas features**: referenced by exact existing
  values; the untagged 251 entries (M5) become reachable through `atlasQuery` without
  gaining a single invented tag.
- **M6 cleanup rides along**: instruments.js's stale header phrase "atlas vibe words"
  can be re-pointed at vibes.js in the docs pass — a comment fix, not a rename.

## 6. Honesty — what ratifies this, and what "wrong" looks like

Every row above is a genre-norm hypothesis (env-research) crossed with a thesaurus
guess (census). The promotion path is the project's only one:

- **Audition surface = the planned 20-environmental + 20-emotional song batch.**
  - 20 environmental: neutral emotion, sweep the 17 environments (+3 repeats of
    shop/fight/construction with different seeds — the owner's own three words get the
    most cards).
  - 20 emotional: fix 2 environments the ear knows well (shop, fight) and sweep the 12
    emotions across them, prioritizing pairs that CONTRADICT the role default —
    gloomy shop, happy construction, calm fight — because those are the cells the old
    role system could not express at all; if they don't sound different from the role
    default, the whole axis is decoration.
- Verdicts flow through the existing judge loop: audition JSON → import-verdicts.mjs →
  npm test → D-entry in DECISIONS.md. Ear corrections edit vibes.js data in place
  (MOOD_CORRECTIONS pattern), `ratified` flips per-entry, `character` lines get written
  in the owner's words.
- Known pre-registered risks for the ear pass: (a) ROLE_MOODS may drown the emotion
  words since role contributes ~5–7 words vs emotion's 4 — if gloomy shop still sounds
  playful, the fix is a `suppressRoleMoods` flag or weighting `s.moods` above role
  words, decided then, not now; (b) `mysterious` must audibly out-chromaticize the
  Mysterious tag (MOOD CALIBRATION) or the colorBias number moves; (c) construction →
  chase may be wrong — the override exists precisely so the batch can render both.

## 7. Interaction with the role system — environment IMPLIES role, override allowed

The role stays the arranger's structural key (slate, form, its own mood words). The
environment axis sits ABOVE it:

```
vibe request → ENVIRONMENTS[env].role   (implied default)
            → overridden by explicit { role } in compileVibe's spec
            → compiled params.role → planArrangement (unchanged)
```

Explicit mapping (CANDIDATES, restated from §1b with reasons where non-obvious):

| environment | role | reason (one line) |
|---|---|---|
| shop | shop | identity |
| fight | battle | identity (activity name → scene role) |
| boss | boss | identity |
| construction | **chase** | needs driving/retro/dark/tense words + driving forms; overworld (the "?" in the brief) rejected: its words are pastoral/airy/calm — the opposite of a machine floor. Ear may overrule. |
| stealth | chase | 'sneaking' is literally in ROLE_MOODS.chase |
| snow, water, desert, cave | overworld | exploration regions; the environment supplies the timbre the role can't |
| lab | character | the quirky/eerie lab pole (Alphys); menace-lab = override to battle |
| casino | diegetic | the lounge band on the floor IS the diegetic role's meaning |
| festival | town | communal town at tutti energy |
| kitchen | joke | novelty/comic tradition |
| training | chase | motoric driving riff; battle is the tempting wrong answer (too hook-forward) |
| rest | cutscene | tender/intimate/dreamy words; menu is the alternative |
| menu | menu | identity |
| aftermath | cutscene | grief scenes are cutscenes; ending for finale-flavored aftermath via override |

Overrides are first-class: `compileVibe({ environment: 'construction', role:
'overworld' })` renders the brief's question mark as a playable A/B — the batch should
include that exact pair.

## 8. Implementation steps

1. **Write `src/lib/vibes.js`**: EMOTIONS (12), ENVIRONMENTS (17), `compileVibe()`,
   `vibeNames()`; every entry `ratified: false`, `character: null`. No other file
   changes in this step.
2. **Write `test/vibes.test.js`**: vocabulary-closure lints (envMoods/emotion moods ⊆
   instruments.js words; tags ⊆ the 22 ldrolez tags verbatim; roles ⊆ arrange.js's 13;
   figClasses ⊆ existing class values; percussion patterns exist in rhythms.js with
   `role:'percussion'`; instBias names ∈ INSTRUMENTS) + compileVibe determinism (same
   spec+name → deep-equal output) + override precedence + null-axis behavior.
3. **Wire `moods`**: batch/audition callers pass `compileVibe(...).moods` as the
   existing `s.moods` param to planArrangement. Zero arrange.js diff.
4. **Add optional `s.instBias`** consumption to the casting score in arrange.js
   (additive term, absent = today's behavior; existing undertale tests must pass
   unchanged).
5. **Build `scripts/audition-vibes.mjs`** on the audition-undertale.mjs pattern:
   generate the 20-environmental + 20-emotional batch (§6), each card showing the vibe
   spec, the full compiled object, and its `notes` why-trace; include the
   construction-role A/B and the three contradiction pairs.
6. **Ear pass** → paste verdicts → import-verdicts.mjs → npm test → D-entry in
   DECISIONS.md; corrections edited into vibes.js data; `ratified` flipped per entry;
   `character` written in the owner's words.
7. **Only after ratification**: wire `energy.cap`/`salience` into planForm/gain, and
   `register` into the queued OCTAVE-AS-SECTION-PARAMETER work (DECISIONS.md ~2709),
   so vibe drives register the way that ruling anticipated.
8. **Percussion lane** (new rendering work): consume `percussion.{presence, patterns}`
   in the batch renderer; presence scaling by emotion percMul comes free.
9. **Docs pass**: DECISIONS.md entry for the model itself; re-point instruments.js's
   stale "atlas vibe words" comment (M6) at vibes.js.
