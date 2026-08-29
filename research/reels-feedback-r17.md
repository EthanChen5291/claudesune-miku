# r17 — his reel feedback, transcribed from the DM log

Source: `ScreenRecording_08-28-2026 12-32-45_1.MP4` (86s), an Instagram DM thread
he screen-recorded scrolling back through the history. Reels are interleaved with
his own messages; each message sits UNDER the reel it comments on.

Method: frames extracted at 1 fps and scored in numpy for the purple message-bubble
colour, then the hit frames read directly. Bubble hits at seconds 13, 40-41, 63-65,
73-74, 76-82, 84-86 — the rest of the recording is full-screen reel playback.
Nothing was inferred; every line below was read off a frame.

His stated goal for the round, verbatim:

> get more unique sound chord progressions and become better at "melody" as well
> as "extra stuff" so that it's not just a basic foundation but also sounds good

## The messages, with what they were attached to

| # | attached to | his words (verbatim) |
|---|---|---|
| 1 | `jayhmproject` — reharmonization ladder, sheet music over piano hands, ♩=78, D major | "notice how melody is chord too not just one note, and the melody is held not very jittery" |
| 2 | `briancalli.music` — "Modo Mixolidio b9 b13", animated mode visualiser | "desert chord example" |
| 3 | `prodbyberke` — FL Studio piano roll, Kontakt 8 | "also learn from the melodies" |
| 4 | the reel above it | "notice the chord progression, chords, and the extra stuff outside of the chords and how it changes. changes not just in strict section bar, and also changes an a unique way" |
| 5 | a reel of hands playing one chord | "see how the chord is four notes not your typical chord" |
| 6 | the reel above it | "analyze the extra stuff that makes it not just a chord progression as well as the chord progression itself" |
| 7 | `prod.essential` — FL piano roll, teal notes | "analyze this rhythm too for the chords. See how rhythm can also be varied along with extra stuff? see how the chords aren't normal chords but vary in intervals? bear in mind this is just one pattern of many and matches with this chord" |
| 8 | `lyfe8k` — "The perfect loop", FL piano roll | "see the intervals that's what I mean by foundation setting (but not just randomly, take note of what works)" |

## What the reels are

- `jayhmproject` — a REHARMONIZATION LADDER: the same two bars at levels #1..#10+,
  chord symbols printed above the staff. Levels captured off-screen so far:
  - #2  `Dmaj7/F# | G2 | Dmaj7/F# || E7 | A7sus | Dsus2`
  - #6  `D…aj9/F# | G | Dmaj7/F# || E7 | A7sus | Dsus2`
  - #10 `Dmaj9/F# | G2 | Dmaj9/F# || E7 | A7sus`
  Devices visible without hearing a note: **inversions in the bass** (`/F#` — the
  I chord over its third, so the bass steps instead of leaping), **added-2nd
  chords** (`G2` = Gadd9), **maj7/maj9 colour throughout**, a **secondary
  dominant** (`E7` = II7 in D, with a raised third), and a **7sus** resolution.
- `briancalli.music` — "Modo Mixolidio b9 b13" = C Db E F G Ab Bb, which is
  exactly the engine's `phrygianDominant` [0,1,4,5,7,8,10]. Chord labels along the
  animation: **C, Db, C, Db, Bbm, C** — a I↔bII shuttle with a bVIIm. He labelled
  it "desert chord example", which independently ratifies the D93 desert reading
  AND the r16 shuttle trope.
- `lyfe8k` "The perfect loop" / "This is what you need", `prodbyberke`,
  `prod.essential`, `ariesfawn`, `bronikbeats`, `maestro_s…`, `maxemanuel…`,
  `saesh000` — FL Studio piano-roll teardowns.
- `ryanaudy` — chord-voicing tutorial (a frame shows `Dmaj7 / D F# A C#`).
- `thefakesnorriz` — FL Studio breakdown of "Black Knife" (Deltarune).
- `joe_dejima` "Release Cut" — "How to compose like this:".

## The laws these state, in engine terms

1. **MELODY IS CHORDAL.** "melody is chord too not just one note". The lead
   sounds more than one pitch. Corroborated by his r16 triage note on the
   dissonance card: "you made the melody have multiple notes rather than jut a
   one-note melody. sounds fuller."
2. **MELODY IS HELD.** "held not very jittery" — a DURATION law, consistent with
   the standing "jitter is DURATION as much as count" finding.
3. **CHORDS ARE FOUR NOTES.** "not your typical chord" — triads are the exception,
   not the norm; and "the chords aren't normal chords but vary in intervals".
4. **EXTRA STUFF IS A FIRST-CLASS PART.** "the extra stuff that makes it not just
   a chord progression"; "rhythm can also be varied along with extra stuff".
5. **CHANGES ARE NOT SECTION-LOCKED.** "changes not just in strict section bar,
   and also changes an a unique way". This is the one r16 did NOT satisfy — r16's
   per-statement variation is keyed to section starts, which is precisely the
   "strict section bar" he is arguing against.
6. **INTERVALS ARE CHOSEN, NOT RANDOM.** "see the intervals that's what I mean by
   foundation setting (but not just randomly, take note of what works)". A direct
   guard-rail on r16's hash-picked forms: the palette must be curated, and the
   choice must be conditioned on what the chord is doing, not on a seed alone.

## Also new on disk

`~/Downloads/Hyperbits - 350 Famous MIDI Chord Progressions/` — 352 MIDI files
whose FILENAMES carry key and roman numerals, e.g.
`ATB ft. Dash Berlin - Apollo Road [G#m] (i - i7 -VI - VI9 - VII - i - …).mid`.
Directly on-point for "more unique sound chord progressions". Treat as a RESEARCH
CORPUS (D95): analysis only, gitignored, and promoting anything from it means
hand-authoring canon entries, never re-counting.
