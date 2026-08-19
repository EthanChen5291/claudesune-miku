# C1 / r2 — version notes

## v0 — initial track
- House in F minor at 122 BPM (`setcpm(122/4)`, one cycle = one bar); form A B A' B with 16-bar sections, sequenced per voice with `arrange`. Progression: Fm7 - Dbmaj7 - Bbm7 - Cm7 (i - bVI - iv - v), one chord per bar.
- Separate labeled voices: kick, hats, ohat, clap, perc, ride, crash (TR-909), plus bass (sawtooth), chords (sawtooth stabs), lead (triangle), and a chorus-only pad.
- B lifts vs A: melody jumps roughly an octave (ab4-c6 vs the verse's c4-c5) and doubles in note count, chords get wider voicings and offbeat-8th stabs, and pad + ride + crash + 16th hats + octave-pumping 8th bass are added. A' repeats the verse melody note-for-note over busier drums (denser hats, ghost clap on the last 16th of beat 4, euclidean rim percussion).

## v1 — Edit 1: busier hats (hats only)
- hatsA: accented offbeat 8ths -> ghosted straight 16ths.
- hatsA2: mixed 8th/16th pattern -> full 16ths with a half-bar 32nd roll every 4th bar (`ply("<1 1 1 [1 2]>")`).
- hatsB: straight 16ths -> 16ths with a full-bar 32nd roll every 4th bar (`ply("<1 1 1 2>")`). Density tiering A < A' < B preserved; no other layer touched.

## v2 — Edit 2: bigger chorus lift (A sections untouched)
- chorusMelody rewritten: register pushed from ab4-c6 up to f5-f6 and densified with 16th-note pairs (~13-14 notes per bar instead of 7).
- chordB voicings extended upward (new tops eb5 / c5 / ab4 / bb4); chorus stabs gain an extra 16th anticipation at the end of each bar and a brighter filter (lpf 1650 -> 1900).
- Chorus lead filter opened (2600 -> 3200) and chorus pad brightened (lpf 850 -> 1150, gain 0.25 -> 0.28). verseMelody, chordA, leadA, chordsA, bass, and all drum layers unchanged.

## v3 — Edit 3: darker bass (timbre only)
- Bass oscillator swapped sawtooth -> square and lowpass pulled from 600 Hz down to 280 Hz for a darker, subbier tone.
- Amp envelope, gain, drive (`shape`), and both note patterns (bassA / bassB) untouched — identical notes and rhythm in every section.
