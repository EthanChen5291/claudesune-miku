# The video corpus (D57) — what twelve videos teach about harmony, layering, and melody

Transcribed by eye from `igexport-*.mp4` in the repo root (session 2026-08-25):
frame-sampled at 1–2 fps, chord labels and piano rolls read from montage sheets.
Twelve unique videos (three files are duplicates). No MIDI exists behind these,
so nothing here passed the D45 labeller — the chord sequences are what the
videos *display*, trusted as far as a screen can be trusted.

Ethan's standing note on the whole set: **"i am a fan of how all the songs
sound. these songs all sound good and i want the engine to be able to create
music like theirs (if prompted for the appropriate context and style)."** That
endorsement is recorded per-entry as `sourceEndorsed: true` in
`progressions-videos.js`; it does not pre-ratify my transcriptions.

## Inventory

| # | file | what it is | key | kind |
|---|------|-----------|-----|------|
| 1 | DRIEseyk294 | Fujii Kaze quiz clip | B | chords |
| 2 | DXNX1y0k7-W | jazz ballad study, dim-run flourish | E | chords |
| 3 | DYhxb2VTGbm | neo-soul loop | F | chords |
| 4 | DYsBsQ-z8cm | Fujii Kaze — Yasashisa | Db | chords |
| 5 | Da-2jFHBTYT | "Producers: steal these chords" (FL, 125bpm) | — | **layering** |
| 6 | Da7g_WLKDhY | descending-dim chain card | C# | chords |
| 7 | Db04jWHop4_ | Ableton pop build (Gimme More flip) | C label | **layering** |
| 8 | DbbI6uyTKD3 | city-pop catalogue ("this kind of thing is fine") | C | chords |
| 9 | Dbn9IrqTPAI | modulation etude, colour-coded key areas | multi | chords |
| 10 | DcPlz2QhN4M | Animal Crossing hourly-music tutorial (FL) | — | **layering** |
| 11 | DcRXC2RTLZB | Fujii Kaze — Prema, parallel-key modulation | Dm→D | chords |
| 12 | DcbbGuNCfGv | 90s house from scratch (FL, 127bpm) | Fm-ish | **layering** |

Chord data → `src/lib/progressions-videos.js` (17 section entries, pack
`igvideo`). Flourishes → `src/lib/figurations-videos.js`. This file holds what
doesn't fit in an entry.

## Harmony techniques the corpus does not have (ranked by how often the videos lean on them)

1. **The 9sus4 as a load-bearing chord.** Video 9 pivots every modulation off
   one (Ab9sus4, F9sus4, A9sus4, C9sus4 — and *ends the piece* on C9sus4,
   unresolved). Prema's V arrives as A13sus4 first and only cracks into
   A7(b9,b13) at the last moment — **sus-then-alter as a two-stage dominant**.
   My corpus uses `sus` as colour; these use it as *structure*. Feeds directly
   into D53's open cadence question.
2. **Altered dominants as the marked event.** Videos 1/4/9/11 render plain
   chords in white and altered dominants in gold/rainbow — the sources
   themselves annotate where the spice is. The pattern: *diatonic frame, one
   altered dominant per phrase, at the turn*. Never two in a row.
3. **bV7(#11) / tritone-adjacent slides.** F7(9,#11)→E (video 2), F#7(9,#11)→F
   (video 8), Ab7(#11)→G (video 11): a dominant a semitone above the target,
   resolving down. Three different genres, same move.
4. **Chromatic planing of equal-quality chords.** C#m7→Cm7→Bm7 (video 9,
   twice); GMaj7→FMaj7b5 (video 2). Function suspended, parallel motion does
   the work.
5. **The descending-dim chain** (video 6, complete 8-chord form): every second
   chord a passing o7, top voices nearly static, bass walks. Same-root dim flip
   (F#maj7→F#°7) at the start — a *quality* flip my third-class rule handles
   only via `o`.
6. **Borrowed-maj7 endings.** bVIImaj9→VImaj9 full stop (video 8's "hopeful
   lift"); bVIImaj7 as final chord (video 1). Endings that *lift out of* the
   key rather than resolve into it. Matches Ethan's t28 ("go up more ... as
   kinda like hope").
7. **Never-state-the-tonic loops.** ii–iii–vi (video 1), IV–iii–ii (video 11
   post-modulation): four/eight bars that orbit home without landing. The
   engine's D49 `home` handling always states the tonic; these show when not to.
8. **Parallel-key modulation, cued by shared V** (video 11): Dm section's
   A7(b9,b13) is also D major's V; the modulation walks through the door both
   keys share. Video 9's colour-coded chain: **modulations depart from a 9sus4
   and land on a Imaj9/Imaj7**.

## The layering doctrine (videos 5, 7, 10, 12 agree on this)

1. **One function per layer, and the functions are few:** ground (bass), bed
   (sustained chords), motor (stabs/plucks), connector (walk-ups), lead
   (sparse), sparkle (FX/transition). Video 7 numbers them 1–9 and no layer
   does two jobs.
2. **Extreme sparsity in every melodic layer.** Video 7's lead is *three notes
   per two bars* (B4, C#5, F#4); keys are five stabs; bass is 2–3 notes. The
   density lives in the SUM, never in a part. (My arrange layer already tends
   this way; the videos are more extreme.)
3. **Register separation is absolute.** Video 5: chords G4–C6, counter weaves
   inside the chord's top octave, lead G6+. No layer crosses another's lane.
4. **Call & response is between INSTRUMENTS, not within a line.** Video 10,
   step 4: accordion asks (bars 1–2), whistle/e-piano answers (bars 3–4) — the
   two leads never sound together, they *take turns owning the lead lane*.
   This is a form-level scheduling rule, not a melody rule.
5. **The Animal Crossing recipe, verbatim order:** drum machine → bass jumping
   between 1 and 5 of the chords → plucky offbeat chords (marimba) → call &
   response leads → **"a splash of dissonance"** (one deliberate wrong-note
   moment placed once) → repeat. A complete, ordered layering grammar in six
   steps — closest existing thing to D41's principles, and it *sequences* them.
6. **Second-layer thickening = octave doubling, entering late** (video 7 step
   8: the pad line duplicated an octave down as its own track). Layer count
   grows without new material.
7. **90s house inverts the roles** (video 12): the *chord stab is the motor*
   (m9 voicing: F3 bass + Ab-C-Eb-G close = Fm9, velocity-shaped per hit),
   vocal chops are texture layers, arrangement is done by muting patterns and
   riding a string-bus fader. Harmony-as-rhythm rather than harmony-as-bed.

## Melody habits (profiles, not tunes — D30 discipline)

- **Noodling between hits** (video 3): the melody lives in the *gaps* of the
  syncopated comping, short pentatonic cells, never during a chord strike.
- **The connector line** (video 5): stepwise walk-ups in the last beat, landing
  on the next chord's tone — motion belongs to the seams between chords.
- **Call phrase ≈ 2 bars, answer ≈ 2 bars, different instrument** (video 10).
- **Leads state 2–5 notes and stop** (video 7). The hook is an interval, not a
  line.

## What was deliberately NOT taken

- Video 5's exact chord pitches (my frame reads give ~G9sus-flavoured stacks,
  but confidence is low without labels — layering analysis only).
- Video 12's second stab chord (bass note unreadable) — voicing doc only.
- Melodies as tunes, anywhere. Habits only, per D30.
- Video 9's full 40-chord chain as one entry — it is a *route*, not a loop;
  three sections carry its reusable cells, the chain lives here.

## What this changes about the engine (queued, not done)

1. Cadence tab / D53 wraps bag should probe **sus-then-alter** (A13sus4→A7alt)
   and **end-on-9sus4** as first-class cadence devices.
2. `stateExtensions` (D56) covers 7/6/9; the videos say the *next* tier is the
   altered dominant placed once per phrase — an operator with a placement rule,
   not a colour knob.
3. Layer scheduler needs a **lead-lane ownership** concept (call & response as
   turn-taking) before melody generation can use two voices.
4. The "splash of dissonance" is a placed event exactly like Ethan's variation
   ruling — same mechanism, one slot, deliberate.
