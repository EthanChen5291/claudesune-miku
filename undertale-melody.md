# Undertale melody notes (D30)

Observations from the melody streams of the 110-file corpus in `audios/Undertale
MIDI` — the RIGHT-hand side that the D30 import deliberately does NOT turn into
library entries. These are abstractable habits, each grounded in a measured
number from `scripts/import-undertale.mjs --report` (37,464 melodic intervals).
They are written as rules-of-thumb you could hand to a binder or a writer;
none of them name a specific tune's notes.

## Interval habits

- **Cells, not lines.** 73% of bars repeat an interval pattern already stated
  earlier in the same song. The unit of writing is a 1-bar cell that gets
  re-pitched along the harmony, not a through-composed line. This matches the
  accompaniment side exactly (repitch_same_rhythm is the dominant development
  move there too). *Apply:* write one strong bar, then move it — change its
  pitches with the chord, keep its intervals and rhythm.
- **Leap-heavy, but self-healing.** Only 34% of motion is stepwise; 40% is a
  leap of a 4th or more (pop melody is usually step-dominated). The reason it
  still sings: 79% of leaps immediately reverse direction — leap up, settle
  back (classic gap-fill). *Apply:* allow far more leaps than a "safe" melody
  generator would, but make the note after a leap move the other way.
- **The 4th is the signature leap.** Perfect 4ths are 11.3% of ALL intervals —
  the most common leap, ahead of the 5th (7.0%) and the major 3rd (6.5%).
  Melodies outline stacked 4ths and sus sonorities rather than sweet 3rds/6ths
  (6ths and 7ths are rare: ~2.4% each). *Apply:* when a leap is wanted, reach a
  4th first; it reads "Toby" where a 6th would read "ballad".
- **Octave displacement as a hook.** Straight octave jumps are 6.6% of motion —
  a repeated note is often restated an octave away instead (the shout). *Apply:*
  vary a repeated-note hook by octave-throwing one of the repeats, not by
  changing the pitch class.
- **Repetition is rhythmic, not pitch-static.** Direct note repeats are only
  8.6% — low. The same PATTERN repeats constantly (73% of bars), the same NOTE
  rarely does. Motion up (48%) and down (43%) stays balanced; phrases don't
  drift.

## Harmony contact

- **Anchored on the beat, free off it.** On-beat melody notes are chord tones
  76% of the time; half of all onsets are off-beat, and that's where the
  colour/passing material lives. *Apply:* exactly the binder's D14 policy —
  snap the accented grid, let the offbeats run — so the existing snapping rule
  needs no Undertale-specific change.

## Rhythm habits

- **Moderate density, wide range.** ~6 melody onsets per bar (median), but each
  song's melody covers ~2 octaves — the width comes from leaps and octave
  throws, not from runs.
- **Two rhythm vocabularies.** The most common bar cells split cleanly into
  (a) plain grids — straight quarters [0,4,8,12], halves, even 8ths — and
  (b) the push cells: the dotted-8th chain [0,4,7,11,12,15] (3-3-3-3 sixteenths
  landing on beat 4) and the 3+4+5 push [0,3,7,12]. Verse-like sections use (a),
  hooks use (b). *Apply:* a section can be lifted from "stated" to "insistent"
  by moving its melody from the plain grid to the dotted chain WITHOUT touching
  its pitches — the cells have the same note count.
- **The anacrusis snap.** Cells like [0,3,4,8,12] put a 16th directly before a
  beat — a snap into the anchor, the rhythmic sibling of the gap-fill leap.

## What was deliberately NOT taken

Melodic pitch content, full phrases, or contour entries. Extracting "the melody
of X" into the contour library would be copying a tune, not abstracting a habit
(and A6.1 wants ears, not scrapes, deciding what enters the library). If a
contour entry is ever wanted from this corpus, it should be hand-written from
one of the habits above and auditioned like anything else.
