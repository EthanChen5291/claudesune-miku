# SESSIONS.md — the 3 commands you need

You never have to read engine code. Three commands, and every one of them leaves you
a `listen.html` you can open and a `report.md` you can read.

## 1. generate — make a song from a spec

```
node src/cli.js generate songs/my-song/spec.json --out songs/my-song
```

Writes into `songs/my-song/`:
- `v0.strudel` — paste-ready for [strudel.cc](https://strudel.cc) (select-all, paste, ctrl+enter)
- `listen.html` — open locally: play/stop, per-label mute checkboxes, copy button
- `report.md` — which assertions passed/failed, with numbers, and what to listen for
- `v0.meta.json` — the edit map (which binding owns which label/section)

Spec format: see the demo specs in `songs/neon-undertow/spec.json` (4/4 house) and
`songs/aksak-lantern/spec.json` (7/8). README §"Song specs" documents every field.

## 2. edit — change ONE thing, provably only that thing

Tell Claude (or edit yourself) what to change, then gate it:

```
# spec-level edit (recompiles; engine flow):
node src/cli.js edit songs/my-song --spec edited-spec.json \
    --allow-binding hats_A --note "make the verse hats busier"

# hand edit of the .strudel file:
node src/cli.js edit songs/my-song --file my-edited.strudel \
    --allow bass --aspects sound --note "darker bass, same notes"
```

Scoping flags:
- `--allow kick,hats` — these labels may change
- `--allow-binding bass_A` — this hoisted binding may change (auto-expands to the labels it feeds)
- `--aspects sound` — even allowed labels may only change timbre (also: `time`, `pitch`, `gain`)
- `--sections B` — changes confined to that section's cycles

If ANYTHING outside the scope changed, the edit is **rejected with the leak named**,
and no version is written. If it passes, you get `vN+1.strudel`, an updated
`listen.html` with a **before/after A-B switch**, and a `report.md` saying what
changed and what to listen for. If a contained edit breaks a declared musical
relationship (e.g. the chorus stops lifting), you get a MUSICAL REGRESSION banner.

## 3. verify — re-check any song, any time

```
node src/cli.js verify songs/my-song          # latest version + its meta
node src/cli.js verify some-file.strudel      # any labeled strudel file
```

Prints lint, per-label metrics, and every assertion family (relational musts,
withhold/payoff structure, harmonic anchors, motif identity, interlock scores)
with measured values. Exit code 0 = green.

## Listening (no code required)

Open `songs/<name>/listen.html` in a browser:
- **version buttons** — A/B the edit by ear in one click
- **checkboxes** — mute/solo any labeled layer (native `_label:` muting)
- **copy button / strudel.cc link** — take the current state to the real REPL

The embedded player is pinned to the same Strudel version as the engine (1.1.0).
