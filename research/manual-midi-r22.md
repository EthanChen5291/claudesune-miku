# r22 — the 26 hand-imported MIDI files

Ethan imported these himself on 2026-08-29 (22 files at 01:51, four more at
01:56–01:57). They are not a corpus sweep and are not treated as one: **D95
holds, nothing here was counted into `src/lib`.** What came out is this
document plus six hand-authored rows in `src/lib/techniques.js`.

    Sonic Mania    Studiopolis 1/2, Press Garden 1/2, Mirage Saloon 1K/1ST/2,
                   Oil Ocean 2, Flying Battery 1, Green Hill 2, MiniBoss, Egg Reverie
    Nintendo       SM3DW main theme, NSMBU Overworld, NSMBU World 3-1,
                   All-Star Rest Area, Sm4sh menu, Megaman 2 Air Man (Smash),
                   Splatoon main theme, Magikarp Festival
    other          DuckTales Remastered boss, Jungle-Challenge,
                   AFO Alien theme, AFO Army, Grandia II battle 3, Shenmue rain

Reader: `scripts/analyze-manual-r22.mjs` (uses `scripts/corpus-midi.mjs`).
Output: `audios/manual-r22/_analysis.json` — gitignored, analysis only.

## The window: steady sections, not whole files

His instruction, verbatim: *"be careful, some songs are abstract or have
specific quirks - just analyze in terms of sections or the 'normal' sections
where it's a good part of the song basically"*.

He was right, and the first pass was wrong because of it. **The Sm4sh menu is a
medley** — fifteen declared parts, each covering ~3% of the file, because each
belongs to a different game's theme. Averaged with a Sonic zone that reads as a
sparse arrangement, which is a fact about the *format*. Air Man (270 bars) and
the DuckTales boss (263 bars) carry long non-representative stretches for the
same reason.

Every number below is therefore taken inside one window per file: the longest
stretch where the **set of sounding parts holds still** and the texture is at
full strength (`stability × 0.6 + strength × 0.4`, 8–17 bars). Detected windows
run 0.62–1.00 stability; the weakest is Mirage Saloon Act 1K at 0.62, which is
worth a second look if anything downstream depends on it.

## What each instrument does

Medians over 180 parts, inside their own core window:

| role | onsets/bar | note length | polyphonic | max notes | step motion | repeats | range | off-16ths |
|---|---|---|---|---|---|---|---|---|
| lead | 4.8 | 0.50 beats | 0% | 1 | 50.0% | 11.8% | 15 st | 21.4% |
| descant | 4.4 | 0.50 | 0% | 1 | 57.0% | 8.6% | 22 | 59.2% |
| counter | 5.8 | 0.25 | 0% | 1 | 53.8% | 8.9% | 15 | 32.7% |
| acc | 4.4 | 0.33 | 100% | 2 | 44.4% | 12.0% | 11 | 30.8% |
| pad | 1.4 | 2.00 | 100% | 4 | 68.2% | 20.8% | 5 | 0.0% |
| bass | 5.9 | 0.33 | 0% | 1 | 33.6% | 17.5% | 15 | 30.6% |

The shapes are sharply distinct and mostly match what the engine already does.
Two things stand out: the **acc hand is a DYAD**, not a chord — median max 2
notes, 100% polyphonic — and the **pad is the only part that never syncopates**
(0.0% off-16ths) while carrying the widest stacks (4 notes) and the longest
notes (2 beats).

## How they combine

**Concurrency.** 10.3 pitched parts are declared per file, but only **4.85 sound
at once** (median 5, peak 7.3). Against our judged `songs.html` at 4.02 and the
31k vgmusic sweep at 4.16. So a rich arrangement is not a thick one — it is many
parts taking turns.

**Pair motion**, 342 pairs:

| | share |
|---|---|
| oblique (one holds, one moves) | 27.8% |
| parallel | 24.7% |
| contrary | 20.9% |
| similar | 19.9% |

Nearly even, with oblique the plurality. Our companion measured **27.7%** oblique
before any change — the engine already sits on the reference value, which
refuted the premise I started from.

**Vertical intervals** at shared onsets, and this is the biggest gap:

| class | reference | ours (control) |
|---|---|---|
| unison/octave | **34.8%** | 21.9% |
| P4 + P5 | 20.3% | 27.8% |
| thirds + sixths | 23.3% | **39.2%** |
| seconds + sevenths | 18.9% | **9.1%** |

We write markedly more consonant verticals than the reference: a third more
thirds and sixths, half the seconds and sevenths, and far less octave doubling —
which the engine bans outright in the companion.

**Timbre separation is near-total.** Only **9.9%** of pairs share a declared GM
family. Meanwhile **62.6%** strike together on more than half their onsets. So
these arrangements separate by *instrument*, not by rhythm — which confirms
D102's ruling on an independent source.

**Layers rest.** Inside a steady section with no texture change, **57.5%** of
parts stop for at least a bar. Median coverage of their own window: lead 50%,
counter 66.7%, acc 62.5%, pad 92.9%, bass 100%. Bass and pad hold; everything
else breathes.

**Echo layers are common.** 16 of 26 files carry a pair where one part is a
constant-lag copy of another (13.5% of pairs). The lag is quantised: 2 beats (14
pairs), 0.5 (9), 1.5 (8), 1 (7), 0.75 (6). The copy is on a different family and
sits under the line it follows.

## How it gets away with it

Non-chord tones, 180 parts: **22.8% median** — the same rate the engine writes.
The difference is entirely in what happens either side. The reference **resolves
63.6% by step and approaches 63.0% by step**; ours resolves 6.1%.

By role: counter 26.0% nct / 69.2% resolved, lead 22.9% / 66.7%, acc 23.4% /
47.6%, bass 17.7% / 69.2%, **pad 9.4% / 14.3%**. The pad is the exception that
proves the mechanism — it is the most consonant part and the one that does not
resolve, because it *holds* rather than passes.

This independently reproduces D102 on a hand-picked source: approach ≈
resolution, and D101 built the exit half only.

## Not measurable here

**Density inversion.** The 31k sweep says a second line gets denser when the lead
rests (1.57). This set says 0.17, inverting on 4.1% of pairs. That is almost
certainly underpowered rather than contradictory: inside a 16-bar steady window
the lead rarely rests, so the median split is degenerate. Neither number should
be acted on without a wider window.
