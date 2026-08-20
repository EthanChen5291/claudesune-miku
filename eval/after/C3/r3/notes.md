# attic-glow — C3/r3 session notes

Lo-fi hip-hop, C minor, 84 BPM, 4/4, form A B A B (8-bar sections).
Separate labeled layers per voice: kick / snare / hats / bass / keys / melody
(+ fill and sweep transition labels).

## v0 — initial generation

```
node src/cli.js generate /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r3/spec.json \
    --out /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r3
```

- All drums bound from the library: `two_step_kick` (bd), `backbeat_ghost` (sd,
  ghost 16ths), `swung_lofi_hats` (hh, swing 0.55 — the brief's swung hats), each
  with a deliberately FLAT gainRange in v0 (uniform hits, set up for edit 2).
- Jazzy extended harmony, one chord per bar: verse Cm9 Fm9 Ab^7 G7, chorus
  Fm9 Bb7 Eb^7 G7 (ii–V–I into Eb + turnaround); keys comp the changes through the
  rootless `shell_37` 3rds/7ths/9ths voicing. Sleepy melody = motif m1
  (`fall_sigh` contour): `sparse_pedal` in the verse, `push_pull_16s` with a tonic
  cadence in the chorus; bass = `anticipation_bass` x `bass_root_five`.
  Green on first run (no FAIL-level assertions; B.must.density > 1.1x A passes).

## v1 — edit 1: halve the harmonic rhythm

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r3 \
    --spec <scratchpad>/edit1-spec.json \
    --allow-binding harmony_A,harmony_B,bass_A,bass_B,melody_A,melody_B \
    --note "halve the harmonic rhythm: chords change every 2 bars instead of every bar"
```

Spec change: `harmonicRhythm: 1 -> 2` in both sections (only change).

- Harmony bindings became `chord("<...>/2")` — chords now change every 2 bars,
  i.e. half as often. Scope = the two harmony bindings plus the bound melodic
  labels whose accented notes re-snap to the slower changes.
- Containment: bass 16 pitches, keys 60 pitches, melody 26 pitches changed —
  timing unchanged on every label, drums byte-identical. No musical regression.

## v2 — edit 2: drum velocity contour

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r3 \
    --spec <scratchpad>/edit2-spec.json \
    --allow-binding kick_A,kick_B,snare_A,snare_B,hats_A,hats_B \
    --aspects gain \
    --note "drum velocity contour: accents and ghost notes from the library accent profiles instead of uniform hits"
```

Spec change: drum gainRanges opened from flat to real spreads in both sections —
kick [0.85,0.85] -> [0.55,1.0], snare [0.7,0.7] -> [0.15,0.95],
hats [0.55,0.55] -> [0.22,0.78] (only change).

- The library accent profiles now actually sound: snare backbeats at 0.95/0.91 vs
  ghost 16ths at ~0.45; hats lean on beats 1 and 3; kick beat 1 heaviest.
- Gate: `--aspects gain` proved timing and which drums hit are untouched —
  changelog shows "timing unchanged, pitches unchanged, N gains changed" for
  exactly kick/snare/hats and nothing else.

Final verify of v2: exit 0, lint clean, no FAIL-level assertions (two warn-level
notes: vertical b9 pairs between melody/keys and bass, and one kick+melody
interlock warn in B — both accepted as authorial).

(Scratchpad = /private/tmp/claude-501/-Users-ethanchen-Documents-GitHub-motif-engine/adc11f0b-83e0-4b6a-ac5c-02772dba1d0a/scratchpad)
