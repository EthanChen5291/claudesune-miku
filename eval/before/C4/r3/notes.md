# Notes — C4/r3 ("Ion Trail", melodic trance, 138 BPM)

## v0 (initial song)
- Full ABCB form (16 bars each, 64-cycle loop) at 138 BPM in A minor, built from `<...>` masks (one step per cycle) gating each labeled voice: kick/hats/shaker/clap, rolling offbeat 16th bass, offbeat supersaw stabs, 7th-chord pads, 16th arp, supersaw lead; the C breakdown drops all drums/bass and hands the lead melody to a soft delayed triangle pluck over pads.
- Harmony is Am–F–C–G (i–VI–III–VII); lead is a 4-bar phrase reused by lead (choruses) and pluck (breakdown) so the breakdown foreshadows the final chorus.
- Transition material on its own layers: `riser1`/`riser2` (4-bar white-noise sweeps, cutoff and gain riding `saw.slow(4)`, into bars 17 and 49), `fill1`/`fill2` (1-bar accelerating snare rolls with rising gain/pitch), and `impact` (crash on both chorus downbeats).

## v1 (Edit 1 — bigger transition into the final chorus; transition material only)
- Extended the final riser from 4 to 8 bars (mask `mR2` now covers bars 41-48), with a wider filter sweep (300→11000 Hz) and louder peak, envelopes moved to `saw.slow(8)` (phase-aligned at cycle 40).
- Added a new transition layer `riser2b`: a tonal sawtooth riser stepping up an octave over the same 8 bars with dotted-8th delay.
- Extended the final drum fill from 1 to 2 bars (mask `mF2` now bars 47-48) as a two-stage escalating snare roll (`<bar1 bar2>` alternation) with gain/speed ramps over `saw.slow(2)`. No non-transition layer was touched.

## v2 (Edit 2 — key change A minor → B minor; pitch transposition only)
- Transposed every pitched pattern up 2 semitones by rewriting note names: roots `<a1 f2 c2 g1>` → `<b1 g2 d2 a1>`; stabs/pads/arp now spell Bm–G–D–A (with F#/C# accidentals); lead melody moved note-for-note (e.g. e5→f#5, c5→d5, a4→b4).
- Also transposed the tonal riser (`riser2b` a5 → b5) since it is pitched material; comments updated to name the new key.
- All rhythms, masks, structures, envelopes, effects, synth choices, and unpitched drum layers are byte-identical to v1 — only note names changed.
