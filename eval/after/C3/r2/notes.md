# C3 r2 — attic-glow (lo-fi hip-hop, C minor, 84 BPM, A B A B)

## v0 — initial generation

```
node src/cli.js generate eval/after/C3/r2/spec.json --out eval/after/C3/r2
```

- Spec: 4/4, 84 BPM, C:minor, form A B A B with 8-bar sections. Verse A = kick (two_step_kick) + snare (backbeat_ghost) + swung hats (swung_lofi_hats, swing 0.55) + sine bass (anticipation_bass x bass_root_five) + rootless 3-and-7 shell keys (me_shell_37 over Cm9 Fm9 Ab^7 G7, one chord per bar) + a white-noise dust bed. Chorus B adds a sleepy fall_sigh lead (son_clave_3 rhythm, triangle, tonic cadence), a tresillo keys struct, and a ii-V progression (Fm9 Bb7 Eb^7 G7); B must be > 1.15x A in density (measured 31.75 vs target 28.75).
- Drums are deliberately UNIFORM velocity in v0 (gainRange min == max on kick/snare/hats) — the ghost-note onsets of backbeat_ghost are present but flat, leaving Edit 2 a real velocity-contour job. All assertions pass (bound accented onsets 100%/97.5% chord tones, motif notes exact).

## v1 — Edit 1: halve the harmonic rhythm

```
node src/cli.js edit eval/after/C3/r2 \
    --spec <scratchpad>/spec-e1.json \
    --allow-binding harmony_A,harmony_B,bass_A,bass_B,lead_B \
    --aspects pitch \
    --note "halve the harmonic rhythm: chords change every 2 bars instead of every bar"
```

(spec-e1.json = spec.json with `harmonicRhythm: 1 -> 2` in sections A and B; nothing else touched.)

- Harmony bindings became `chord("<...>/2")` — same four chords per section, each now lasting 2 bars instead of 1, so the full progression still completes once per 8-bar pass. `--allow-binding harmony_A,harmony_B` auto-expanded to the keys label (it reads the hoisted `chords` timeline); bass_A/bass_B/lead_B were allowed because the binder re-snaps their accented onsets to the chord now sounding at each onset.
- Gate confirmed containment: bass 16 pitches changed, keys 60, lead 50 — timing unchanged on every label, no gain/sound changes anywhere (`--aspects pitch` held). Kick/snare/hats/dust byte-identical. No musical regression; B.must.density still passes.

## v2 — Edit 2: drum velocity contour

```
node src/cli.js edit eval/after/C3/r2 \
    --spec <scratchpad>/spec-e2.json \
    --allow-binding kick_A,kick_B,snare_A,snare_B,hats_A,hats_B \
    --aspects gain \
    --note "drum velocity contour: library accent profiles wired to gain — backbeats ring, ghost notes whisper; timing and onsets untouched"
```

(spec-e2.json = v1's spec with drum gainRange spreads opened up: kick [0.9,0.9] -> [0.4,0.95], snare [0.75,0.75] -> [0.15,0.95], hats [0.5,0.5] -> [0.2,0.75] in both sections.)

- The library rhythms' real accent profiles now drive gain: snare backbeats land ~0.95/0.91 while the dragging ghost 16ths drop to ~0.43/0.47; kick beat-1 leads at 0.95 over the 2& and 3& pushes; swung hats lean on 1 and 3 with quiet offbeats. accentVariance went 0 -> 0.006 (kick) / 0.058 (snare) / 0.011 (hats).
- Gate confirmed gain-aspect-only containment: 96 kick + 128 snare + 256 hats gains changed, timing and pitches unchanged, every other label byte-identical. Verify exit 0, all assertions still pass.
