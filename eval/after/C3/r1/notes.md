# C3 r1 — attic-light (lo-fi hip-hop, C minor, 84 BPM, A B A B)

## v0 — generate

```
node src/cli.js generate /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r1/spec.json \
    --out /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r1
```

(First attempt failed at compile with `transition "sweep_downlifter" into "A": occurrence 2 not found`
— occurrences count only non-initial instances of the target section, so the second A is
occurrence 1. Fixed the spec; no version files had been written, so v0 is the first green build.)

- 7 labeled layers: kick (`two_step_kick`), snare (`backbeat_ghost`), hats (`swung_lofi_hats`,
  swing 0.55), bass (`anticipation_bass` × `bass_root_five`), keys (rootless 3-7 shell comp in A,
  drop2 comp in B), lead (sparse `minimal_dyad` verse / `hook_drop` motif m1 chorus), perc
  (chorus-only son-clave rim). Harmony: Cm9–Fm9–Ab^7–Eb^7 (A), Fm9–Eb^7–Ab^7–Cm9 (B), 1 bar/chord.
  Chorus declares `must density > 1.2x A` (measured 45 vs 28.5). Two transitions: hat riser into
  the last B, downlifter sweep back into verse 2.
- Deliberate setup for the coming edits: every melodic degree used (C, Eb, F, G, Bb) is a chord
  tone of every chord in the palette and every contour length divides its bar cycle, so a harmonic-
  rhythm change cannot re-snap bass/lead notes; drum gainRanges are flat ([x, x]) so hits are
  uniform until Edit 2 gives them a contour.

## v1 — Edit 1: halve the harmonic rhythm

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r1 \
    --spec <scratchpad>/spec-edit1.json \
    --allow-binding harmony_A,harmony_B --aspects pitch \
    --note "halve the harmonic rhythm: each chord now lasts 2 bars instead of 1 (chords change half as often); bass and lead lines are chord-tone-stable so only the keys/chord stream moves"
```

- Spec diff: `sections.A.harmonicRhythm` 1 → 2 (B recalls A and inherits it). Emitted chord
  patterns became `<...>/2` — chords now change every 2 bars instead of every bar.
- Containment: PASS, accepted first try. Only `keys` changed (368→368 haps, timing unchanged,
  72 pitches changed); kick/snare/hats/bass/lead/perc and both transition labels provably
  byte-identical in hap signature. No musical regression; all 37 fail-level assertions still pass.

## v2 — Edit 2: velocity contour for the drums

```
node src/cli.js edit /Users/ethanchen/Documents/GitHub/motif-engine/eval/after/C3/r1 \
    --spec <scratchpad>/spec-edit2.json \
    --allow-binding kick_A,snare_A,hats_A,perc_B --aspects gain \
    --note "velocity contour for the drums: widen each drum's gainRange from flat so the library accent profiles express — backbeats accented, ghost 16ths and offbeat hats drop to ghost level; onsets and sounds untouched"
```

- Spec diff: gainRange kick [0.9,0.9]→[0.55,1.0], snare [0.7,0.7]→[0.25,0.95], hats
  [0.5,0.5]→[0.22,0.75], perc [0.4,0.4]→[0.25,0.6]. The library accent profiles now express:
  snare backbeats 0.95/0.91 vs ghost 16ths at 0.5, hats lean on 1 and 3 (0.7/0.68 vs ~0.44
  offbeats), kick beat-1-heavy (1.0/0.93 vs 0.84).
- Containment: PASS, accepted first try, gain aspect only — timing and pitches explicitly
  unchanged on all four drum labels (e.g. hats 256→256 haps, 224 gains changed); accent variance
  went from 0 to >0 on every drum. All assertions still green.
