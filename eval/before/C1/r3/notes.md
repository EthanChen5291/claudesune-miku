# notes — C1/r3 (f minor house, 122 bpm, A B A' B)

## v0 — initial song
- Full 64-bar arrangement via per-voice `arrange()`: A (16) / B (16) / A' (16) / B (16). Harmony is an 8-bar loop of Fm7 / AbM7 / DbM7 / Cm7; 909 kit, rolling offbeat sawtooth bass, offbeat e-piano stabs.
- A: sparse triangle lead hook in the F4–F5 range over offbeat 4-note stabs. B (chorus) lifts: lead moves up to C5–F6 and doubles its note density, chords widen to 5-note voicings with a busier struct, and a pad, high square arp (F5–F6 16ths), and offbeat ride enter.
- A': identical melody and chords to A, but busier drums — accented 16th closed hats under open hats, ghost claps on the and-of-2/and-of-4, syncopated rims, and a tom fill every 4th bar.

## v1 — edit 1: busier hats (hats only)
- hatsA: offbeat 8th closed hats became a full 16th grid with an accent kept on the offbeat ("and") so the house feel survives.
- hatsB: the closed layer under the open hats went from 8ths to accented 16ths.
- hatsA2: the 16th closed-hat layer now ends every 4th bar with a 32nd-note roll in the back half. Nothing outside the three hats definitions was touched.

## v2 — edit 2: bigger chorus lift (B only; A sections byte-identical)
- leadB rewritten: register pushed from scale degrees 4–14 (C5–F6) up to 7–16 (F5–Ab6) and densified with 16th-note pairs (~9–10 notes/bar vs ~6); its lpf opened 2600 → 3000 to let the higher line through.
- chordsB voicings widened to 6 notes with a new high top voice (c5/eb5/ab4), and the stab rhythm gained extra 16th pushes; padB voicings extended upward (c6/bb5/ab5 tops).
- arpB contour raised (top from F6 to C7) with added 16th subdivisions inside the pattern. leadA, chordsA, hats, clap, perc, bass, kick all unchanged.

## v3 — edit 3: darker bass sound (timbre only)
- Bass oscillator swapped sawtooth → square (odd harmonics only, mellower) and its lowpass dropped 750 Hz → 380 Hz for a rounder, darker sub character.
- Note pattern, rhythm, amp envelope, and gain are byte-identical to v2 — only `.s()` and `.lpf()` on the bass changed.
