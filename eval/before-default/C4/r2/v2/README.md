# Aurora (v2) — melodic trance, B minor, 138 BPM

v2 change: transposed from A minor to B minor (+2 semitones, pitched parts
only). All rhythms, contours, sounds, and the drum parts are exactly as in v1;
the MIDI key signature is now B minor. Chords are Bm–G–D–A.

Carried from v1: the transition into the final chorus is the big one — 4-bar
riser (bars 44–47) + 2-bar accelerating snare roll (bars 46–47).

Form: **A B C B**, 16-bar sections (~115 s total).

- **A** (bars 0–15): intro — kick + rolling bass, offbeat hats, pluck arp, pads;
  2-bar riser + 1-bar snare fill into the first chorus.
- **B1** (bars 16–31): chorus — full mix with supersaw lead melody over Bm–G–D–A.
- **C** (bars 32–47): breakdown — kick/bass drop out; pads + emotive lead line,
  arp builds back in; 4-bar riser + 2-bar drum fill set up the final chorus.
- **B2** (bars 48–63): final chorus, then an ending hit + reverb tail.

## Files

- `aurora.wav` — listenable stereo render (44.1 kHz, 16-bit).
- `aurora.mid` — Standard MIDI File (format 1: pads, bass, lead, pluck arp,
  riser FX, GM drums on ch. 10) for use in any DAW.
- `make_track.py` — the generator. Rebuild both outputs with:
  `python3 make_track.py` (needs only Python 3 + numpy).
