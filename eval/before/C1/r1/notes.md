# Notes — "Vapor Lines" (F minor house, 122 BPM, form A B A' B, 16-bar sections)

## v0 — initial track
- 64-bar form built from per-section masks (`mA`, `mB`, `mA2`, `mAA`), one cycle = one bar; harmony is a 4-bar Fm7 | Abmaj7 | Dbmaj7 | Eb7 loop shared by bass, chords, pads, and arp.
- Verse (A): 4-on-floor 909 kick, offbeat hats, claps, offbeat rolling saw bass, offbeat Fm7 stabs, sparse triangle melody around F4–C5. A' repeats the exact verse melody/chords but adds busier drums: extra 8th hats, ghost snares, rim syncopation, and a snare fill into each chorus.
- Chorus (B) lifts: melody jumps to C5–Ab5 on a brighter saw, plus chorus-only pads, a 16th-note arp, 5-voice stab voicings, open hats + 16th hat carpet, backbeat snare layer, and ride — denser and wider in register than A.

## v1 — Edit 1: busier hats (hats only)
- Verse hats changed from offbeat 8ths (`[~ hh]*4`) to a full accented 8th-note pattern (`hh*8`).
- A' extra hat layer upgraded from 8ths to a 16th-note carpet; chorus closed hats gain a ratchet (`hh*2`) on every 4th 16th.
- No other layer, melody, mask, or mixing value was touched.

## v2 — Edit 2: bigger chorus lift (B only; verses untouched)
- `chorusMel` rewritten a register higher and denser: continuous 8th notes with no rests, now spanning Db5–C6 (was C5–Ab5 with rests); chorus lead also gets an `.off(1/8)` octave-up echo layer.
- Chorus chord stabs get octave doubling (`.add(note("0,12"))`) and a denser syncopated 16th struct; pads gain a fourth, higher voice (up to Ab5) and a brighter filter.
- Arp widened to a two-octave sweep peaking at C6. All verse layers (`mAA`/`mA2`-masked), drums, and masks are byte-identical to v1.

## v3 — Edit 3: darker bass timbre (sound only)
- Bass oscillator swapped from sawtooth to triangle with the low-pass pulled from 800 Hz down to 460 Hz and resonance reduced — a rounder, darker sub character.
- Gain nudged up slightly (0.85 → 0.95) to compensate for the lost harmonics.
- The bass note pattern and rhythm are unchanged from v2; nothing else in the file was modified.
