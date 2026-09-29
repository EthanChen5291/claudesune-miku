# r42 — the cell, the bass, and the other patterns: what the reference files actually repeat

**His ask (2026-09-13), verbatim:**

> "the cello harmony that you added into the high energy songs (like the one
> where it's rising and repeating) is good but there should be more variations
> of those. like experiment with more variations, like falling instead of
> rising, 3 notes instead of 4 where the fourth note is the root again,
> different intervals, different patterns.
> MOREOVER, they also do the bass too in the attack on titan, and other patterns
> besides this - I want to hear them individually and variations of them for the
> energetic songs"

**The layer he named**, located before anything was written: `sr_pedal_cell` on
`gm_cello` — the `ost` slot of `sr_stack_titan`, which is a cello on sr_gate,
sr_oath and sr_hunt (sr_duel and sr_resolve put the same slot on a muted
guitar). It is attack on titan bars 9–20: R R b3 5 in sixteenths, four times a
bar, the top note raised to b6 on the alternate bar.

## Method, and what it can and cannot say

Same ten files as r40 (`audios/serious-r40/`, gitignored, analysis-only under
D95). They are **two-hand piano transcriptions**, so:

- **"Bass" is a register band, not a part.** Everything below midi 52 (G#2);
  the ostinato band is 52–72. A transcription has no instrument information
  (his own "i know you cant see the instrument info"), so a band is the
  honest unit and nothing below names a timbre as a measurement.
- **A "pattern" is a repeated one-bar signature**: the bar's onsets quantised
  to sixteenths, each note written as its interval above the bar's LOWEST
  note. Transposition therefore does not split a count — the same shape over
  five different chords counts five times, which is the point. Counts below
  are how many bars of the file carry that exact signature.
- r41's mistake was reading bars by eye and encoding the one I happened to
  look at. Every row here is chosen by **how often the file plays it**.

Probes: `bandcells.mjs` (top repeated signatures per band per file) and
`basstl.mjs` (the bar-by-bar timeline of one band), both in the round's
scratchpad; `scripts/dump-serious-r40.mjs` prints any span bar by bar.

## 1. Attack on titan plays SIX bass patterns, and r40 encoded two

Bar by bar over all 104 bars, the low band:

| bars | what the bass does | count | encoded as |
|---|---|---|---|
| 0–7 | **two** octave strikes a bar, the second one MOVING: beat 4, 2, 3, 3, 4, 2, 4, 3 | 8 bars, no bar repeats | `sr_bass_oct_wander` (r42) |
| 9–20 | the left-hand CELL: R R b3 5 in 16ths, b6 on alternate bars | x6 + x6 | `sr_pedal_cell` (r40) |
| 21–28 | R b3 2 b3 R, a half-bar REST, then R b3 2 b3 4 | x4 + x4 | `sr_cell_neighbor` (r42) |
| 29–36 | octave pairs on straight 8ths, eight identical bars | x7 | `sr_bass_oct8ths` (r42) |
| 38–50 | sparse: one octave on beat 4, then a syncopated b6/b7 walk entering on beat 2 | — | not encoded (transitional) |
| 52–67 | one octave strike a bar, alternating with a silent bar | x10 | ≈ `sr_octave_bass_hold` (r40) |
| 68–83 | the PUSH: octave pairs at 16th-slots 0, 6, 8, 14 | **x16 — the most repeated bar in the file** | `sr_bass_push` (r40) |
| 84–99 | octave on 1 plus one upper note at slot 8 or 12 | x8 | not encoded (answer figure) |
| 100–103 | octave on 1, then the root MOVES at slots 8 and 12 (b6 → 7 → b7) | x2 + x2 | not encoded (turnaround) |

Two things worth saying plainly. **r40's `sr_octave_bass_hold` describes bars
52–67, not bars 0–7** — its source note says "bars 0–7: the bass held as an
octave pair for the whole bar" and the opening actually strikes twice a bar
with the second hit moving. And **the file's single most repeated bar is the
push**, which r41 already found and added to the titan stack.

## 2. The cell section is TWO patterns, not one

Bars 9–20 are the cell he named. Bars 21–28 are a different figure that nobody
had transcribed: five sixteenths (R b3 2 b3 R), a half-bar rest, then the same
five landing on the 4th; the even bars add two high sixteenths at the end. It
is a **neighbour** figure — up a third, down a step, back up — where the cell is
a rising arpeggio, and it is sparse where the cell is continuous. That is
already one of the "different patterns" he asked for, from the source.

## 3. The riff bar that DESCENDS

Bars 68–83, the ostinato band, alternate bar by bar:

- even bars (68, 70, 72, 74 …): 8th PAIRS, each chord tone struck twice, arching
  — this is r40's `sr_gallop`, x4.
- odd bars (69, 71, 73, 75 …): the same pair rhythm **descending** (7 7, b6 b6,
  b7 b7, b5 b5), x4 — now `sr_gallop_fall`.

So "falling instead of rising" is not only a variation he imagined; the file he
pointed at does it every second bar of its biggest section.

## 4. The other files' most repeated bass bars

| file | bars | pattern | count | encoded as |
|---|---|---|---|---|
| Muzan vs Hashiras | 45–52 | 3+3+2 tresillo: octave on 1, root-fifth dyads on the two pushes | **x8** | `sr_bass_332` |
| Muzan vs Hashiras | 41–44 | push with the FIFTH on beat 3 instead of a root | x4 | `sr_bass_push5` |
| Muzan vs Hashiras | 85–94 | octave on 1, then the upper root repeated on 8ths | x8 | not encoded |
| Zoltraak | 30–42 | the bass WALKS DOWN inside the bar: R b7 R b7 b6 | **x9** | `sr_bass_walk_down` |
| Zoltraak | 11–16 | root on the beat, the FIFTH pumping every other 8th | x4 | `sr_bass_fifth_pump` |
| Naruto (Raising Fighting Spirit) | 9–21 | the syncopated 16th root-fifth motor | x6 | `sr_motor16_dyad` (r40) |
| Naruto | 24–29 | octave on beat 1 and beat 4 only | x4 | not encoded |
| A world where the sun never rises | 66–71 | octave ALTERNATION, low-high-low-high on 8ths | x7 | `sr_bass_oct_alt` |
| A world where the sun never rises | 16–21 | root on every quarter | x8 | not encoded |
| Solo Leveling ReawakeR | 1–5 | no downbeat at all: enters on the & of 1, syncopates across the bar | x5 | `sr_bass_offbeat` |

His own words for the octave alternation, in r28, about a layer he LIKED:
"low high high low low repeat".

## 5. What was authored, and which kind each row is

**Nine rows are measured and eight are his ask** — and that split is the one the
first cut got wrong. An adversarial pass re-opened every cited MIDI and tried to
reproduce each claim; it REFUTED two rows and corrected seven, and the two
refutations moved `sr_gallop_fall` and `sr_cell_pairs` from "measured" to "his
ask". The corrections are recorded in each row's own `source` string and in
D147; the headline ones:

- **attack on titan's odd riff bars do not descend.** They sound Eb4 Eb4, C4 C4,
  D4 D4, Bb3 Bb3 — identical in all four bars over a bass that MOVES, i.e. a
  FROZEN cell (D120's device from a second source), and the contour turns
  (63 → 60 → **62** → 58). The pair rhythm is the file's; the descent is his ask.
- **ReawakeR's bass does strike the downbeat** (F#3, an octave up). Six onsets,
  not five. What never lands on beat 1 is the WEIGHT.
- **attack on titan bars 21–28 close on a leading tone BELOW the root** (D#2,
  the bar's lowest note), not on two high 16ths.
- Counts: the Muzan 3+3+2 is ×10 and its file's SECOND most repeated bass bar
  (an 8th push at ×14 is first); Zoltraak's fifth pump is ×3 and its "fifths"
  are fifth-plus-octave dyads; the sun-never-rises octave alternation runs
  66–73 ×8. Six are the variations he asked for by name and say so — `invented:
true` plus a source that opens with HIS ASK, which a test now pins both ways so
a variation can never be presented as a measurement:

| row | his words | what it is |
|---|---|---|
| `sr_cell_fall` | "falling instead of rising" | 5 3 R R / b6 3 R R — the control mirrored |
| `sr_cell_root_return` | "3 notes instead of 4 where the fourth note is the root again" | R b3 5 R / R b3 b6 R |
| `sr_cell_arch` | "different patterns" | R b3 5 b3 — the cell turns instead of resetting |
| `sr_cell_step` | "different intervals" | R 2 b3 4 / R 2 b3 5 in SCALE steps (s2/s4, never a bare 2nd or 4th — D101) |
| `sr_cell_open5` | "different intervals" | R 5 R+ 5 / R 5 b7 5 — no third in the cell at all |
| `sr_cell_oct_leap` | "different intervals" | R b3 R+ b3 — a leap to the octave every beat |

Every cell variant shares the control's **onsets and accents exactly**, so the
only thing that moves between those cards is the pitch shape (D139: a card
whose variants move more than one variable is not an A/B, and a test pins it).

## 6. Honest limits

- A count is over ONE arrangement of one piece. "x16" means sixteen bars of
  that file, not that the pattern is common in the genre.
- The bass band (below midi 52) and the cell register overlap on attack on
  titan, whose left-hand cell sits at E2 — the cell appears in the bass table
  for that reason, not because it is a bass line.
- Three files (Homura, Interstellar, First Step) are calm and contribute
  nothing here; the energetic set is six files.
- Nothing in this read-out says which variation his EAR wants. That is what
  `audition/cells.html` is for: 23 cards, one bed, one variable each, the
  tested layer alone for eight bars before the build enters on top of it.
