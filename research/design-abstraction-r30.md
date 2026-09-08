# r30 — song labels ("serves for"), corrected after his ruling

**Status: descoped by his correction.** The first version of this file planned a
`core(mood, energy) ⊗ tint(environment)` engine redesign. His ruling, verbatim:

> *"no i mean label-wise for that song, x song could also be used given other
> various prompts rather than specific that one. so that instrument preset and
> pattern and what not works."*

So the song is a FINISHED OBJECT — preset, patterns, everything stay. What widens
is its **applicability label**: `ls_stepwise_floor_mysterious` was generated for
mysterious/space, and his note says it *serves* "any dark environment". This is
the progression packs' `appliesWhen` idea, one level up: tags on SONGS.

## What survives from the measurement pass

The grid measurements stand and are worth keeping on file (they explain WHY a
fresh generation for a neighbouring prompt sounds like a different song — env
alone moves bpm ×3.4, and the key is hashed off the song NAME), but they now
motivate labels rather than a redesign: **reusing the finished song sidesteps all
of it.** The same object served for two prompts is trivially the "same song".

## The design

`src/lib/song-labels.js` — hand-authored, like every pack:

```js
export const SONG_LABELS = {
  ls_stepwise_floor_mysterious: {
    moodClass: 'dark',                    // his four words: dark / calm / epic / somber
    servesEmotions: ['mysterious', 'tense', 'scary'],
    servesEnvironments: 'any-dark',       // or an explicit lane list
    energy: 'low',
    energyNote: 'if high energy, add parts on top (his note) — never regenerate',
    source: 'his r28 card, verbatim: "could also be abstracted to any dark environment, and if high energy, the appropriate instruments and parts can be added"',
  },
  ...
}
```

- Labels come ONLY from his notes — a card he has not spoken about gets none.
- `songsFor({emotion, environment})` returns labelled songs whose class covers
  the prompt. Niche lanes excluded, as always.
- Audition cards print "also serves: …" so he can veto a widening.
- Adding a label re-rolls nothing: labels are read by name (the techniques.js
  rule — never iterated, never length-indexed).

His energy clause attaches HERE, not to a new axis: a labelled song asked for at
higher energy gets layers ADDED on top of its frozen self (marcato, percussion,
drive bass) — the additions gated by the label's `energy`, the base untouched.

## Current labels his notes justify (r28/r29 exports)

| song | class | his words |
|---|---|---|
| ls_stepwise_floor_mysterious | dark | "any dark environment, and if high energy, the appropriate instruments and parts can be added" |
| ls_stepwise_floor_calm | calm | "can be abstracted beyond calm water to any environment that's calm" |
| ls_iii_vi_v_mysterious | epic | "can be abstracted to anything epic … if it's energetic just add the percussive strings … + percussion and boom" |
| ls_descend_iv_v_somber | somber | "it moreso works for like x somber environment" |
| cp_komuro_triumphant | (multi) | "fits triumphant festival but also like rainy festival or sunset environment" (r27) |
| vr_moody_tense | (multi) | "more like somber aftermath or sad haunting theme or rainy/moody day theme" (r27) |

## Not in scope

The `bright` class (no card), the niche lanes, any change to how songs compile.
