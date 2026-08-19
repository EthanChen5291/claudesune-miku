# Notes — C4 / r1

## v0.strudel (initial track)
- Melodic trance in A minor at 138 BPM (`setcpm(138/4)`, 1 cycle = 1 bar), form A B C B with 16-bar sections gated by 64-bar `<...>` masks; harmony is Am | F | C | G expressed as scale-degree offsets (`prog`) added to every pitched layer.
- Separate labeled layers per voice: kick / hats / ohat / clap (TR909), rolling 16th offbeat bass, 16th arp with per-section LPF automation, offbeat supersaw stabs, breakdown pad, supersaw lead (softer + wetter in the C breakdown), and an octave doubler `lead2` that only appears in the final chorus.
- Transition material on its own layers: `riser` (4-bar white-noise sweep into each chorus, bars 13-16 and 45-48), `fill` (1-bar accelerating snare roll into each chorus, bars 16 and 48), and `impact` (crash on each chorus downbeat).

## v1.strudel (Edit 1 — bigger transition into the final chorus)
- Split the transition into per-chorus layers: original `riser`/`fill` now cover only the first chorus (masks trimmed to bars 13-16 and bar 16); first-chorus transition sounds unchanged.
- Added `riser2`: an 8-bar white-noise riser into the final chorus (bars 41-48) with a wider LPF sweep (300→15k), a rising HPF, and a louder gain ramp via `saw.slow(8)`.
- Added `fill2`: a 2-bar accelerating snare roll into the final chorus (bars 47-48) with gain and pitch (`speed`) ramping over both bars. Only transition masks/layers were touched; all other voices are byte-identical to v0.

## v2.strudel (Edit 2 — key change A minor → B minor)
- Pure transposition up a whole step: every `.scale("A?:minor")` root changed to the same octave in B (`A1→B1`, `A3→B3`, `A4→B4`, `A5→B5`).
- All patterns are written in scale degrees, so rhythms, contours, voicings, masks, effects, and drum/noise layers are exactly the same as v1 — no other code changed.
- Updated comments only where they named the key (header, progression now Bm | G | D | A, lead-melody comment).
