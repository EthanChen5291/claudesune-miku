# Notes — melodic trance, A B C B, 138 BPM (C4/r2)

## v0.strudel — initial song
- Full 64-cycle form (1 cycle = 1 bar) at `setcpm(138/4)`: A intro groove (0-15), B chorus (16-31), C breakdown (32-47), final B chorus (48-63), sectioned with 64-cycle `mask` patterns per voice.
- A minor throughout via scale degrees (`scale("A1/A3/A4:minor")`): Am-F-C-G progression shared by pads (`chords`), 16th arp (`pluck`), rolling offbeat bass (`bass`), plus a supersaw lead hook that enters at the first chorus and stays airy in the breakdown.
- Transition material on dedicated layers: `riser` (2-bar white-noise sweep into each chorus, cycles 14-15 and 46-47), `fill` (1-bar pitched-up snare roll at cycles 15 and 47), and `crash` impacts on each chorus downbeat (cycles 16 and 48).

## v1.strudel — Edit 1: bigger transition into the final chorus (transition layers only)
- `riser` now covers only the first-chorus transition; added `riserlong`, a 4-bar (cycles 44-47) white-noise riser with a wider filter sweep and higher peak gain, plus `risertone`, a 4-bar sawtooth glissando uplifter (A2 -> A4).
- `fill` now covers only the first-chorus transition; added `fillbig`, a 2-bar accelerating snare roll (8ths -> 16ths, rising gain and pitch, cycles 46-47), and `filltoms`, a tom run stacked on the last bar (cycle 47).
- No non-transition layer (drums, bass, chords, pluck, lead, crash) was touched.

## v2.strudel — Edit 2: transpose A minor -> B minor (pitch only)
- Changed every scale root up a whole step: `A1:minor` -> `B1:minor` (bass), `A3:minor` -> `B3:minor` (chords, pluck), `A4:minor` -> `B4:minor` (lead); degree patterns untouched, so all rhythms and contours are identical.
- Shifted the `risertone` glissando MIDI range +2 semitones (45..69 -> 47..71, i.e. B2 -> B4) to match the new key.
- Updated comments (key name, progression now Bm-G-D-A); no timbre, rhythm, mix, or arrangement changes.
