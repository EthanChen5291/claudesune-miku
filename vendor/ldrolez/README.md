# vendored: ldrolez/free-midi-chords

`chords.py` is copied verbatim from https://github.com/ldrolez/free-midi-chords
(commit fetched 2026-08-20), MIT licensed — see LICENSE. Copyright (c) 2019-2026
Ludovic Drolez.

It is the SOURCE of that project's 13k MIDI files: 190 chord progressions written
as Roman numerals with human-authored mood tags. We take the numerals, not the
MIDI — the MIDI is generated output (flat velocity 100, quantized), which our own
A6.2 ingest triage would mark pitch-side-only anyway.

`scripts/import-ldrolez.mjs` transcodes this file into `src/lib/progressions.js`.
Re-run it after updating this vendored copy; never hand-edit the generated library.
