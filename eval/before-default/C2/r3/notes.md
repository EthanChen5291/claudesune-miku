# Notes — 7/8 D dorian groove (140 BPM, A B C A)

## Tools / format

- **Format:** each version ships a standard MIDI file (`groove.mid`, SMF type 1, GM programs, 7/8 time signature) plus a fully synthesized stereo WAV (`groove.wav`, 44.1 kHz / 16-bit, ~53 s) so it is listenable with no DAW or soundfont needed.
- **Tooling:** a single dependency-light Python script per version (`compose.py`, Python 3 + numpy only — no fluidsynth/timidity on this machine). It builds one note-event list, then writes the MIDI with a hand-rolled SMF writer and renders the WAV with a hand-rolled additive/subtractive synth (bass, saw lead with delay, e-piano stabs, warm pad, kick/snare/hats/crash, cheap FFT reverb). Noise is seeded per event, so re-renders are deterministic and versions differ only where intended.
- **Structure:** 7/8 grouped 2+2+3; 8-bar sections A B C A (32 bars) plus a one-bar Dm(add9) ring-out. A = Dm7–G7–C vamp with the main hook; B = Fmaj7–G7–Am7–C/G7sus lift; C = bridge with **no bass at all** (pads + floating lead, drums thinned, 2-bar hat/snare build), so the bass re-entry at the final A lands as the payoff. Verified acoustically: sub-150 Hz RMS is ~0.31 in the A sections vs ~0.08 in C.

## v0 — initial version

- Composed the full arrangement: 2+2+3 funk bass riff, e-piano stabs on the "and of 1" and the 3-group downbeat, D-dorian lead hook (leaning on the B-natural dorian sixth over G7), and a 2+2+3 drum kit pattern with straight-16th hats.
- C-section bridge withholds the bass entirely and thins drums to a heartbeat kick and soft 8th-note hats, with a build in bars 7–8 into the bass return.
- Wrote both deliverables (MIDI + rendered WAV) and validated: MIDI parses cleanly (balanced note on/off), WAV peaks at −0.5 dBFS, low-band energy confirms the C-section bass drop and final-A payoff.

## v1 — change request 1: swing/shuffle on hi-hats only

- Set `SWING_HATS = 0.64`: every offbeat-16th hi-hat now lands 64 % of the way through its eighth note instead of 50 % (a medium shuffle), in both the WAV and the MIDI.
- Applied strictly to hat events; kick, snare, crash, bass, chords, pad and lead are untouched.
- Verified by diffing the event lists: exactly 182 closed-hat events moved (x.5 → x.64); zero changes on any other track.

## v2 — change request 2: sparser lead in A sections only

- Set `SPARSE_A_LEAD = True`: the A-section lead phrases are reduced to their skeleton — anchor notes of the hook kept at identical times/durations/velocities, passing tones and pickups dropped.
- 46 lead notes removed, all inside the two A sections (this applies to both A statements, since both state the same melody); no notes added or moved.
- Verified by diffing v1 vs v2 event lists (changes are lead-only, A-bars-only) and by per-section RMS: B and C renders are identical to v1 to four decimal places.
