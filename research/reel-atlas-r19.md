# Reel atlas — r19

Per-reel metadata keyed by **who posted it**, so Ethan can find any row in his DMs
and correct it. Replaces the un-cross-referenceable
`research/video-corpus-round13.md` (14 entries, only 4 of which name a file).

**Every chord row below was READ OFF A FRAME, never inferred from audio.** Where a
voicing is uncertain the row says so — those are the ones worth his eye first.

Method: `ffmpeg` frames at 1 fps → detect the DM bubble colour (right-aligned,
b>200 / 95<r<170 / g<80) to find his comments → read the hit frames and the
piano-roll frames directly. His comment sits UNDER the reel it belongs to.

---

## A. Progressions extracted exactly

### A1. `dantes.studio` — his comment: **"scary^"**
Source: `new.MP4` @ 104-118s (thread position: before the `diokhairiansyah_` reel).

Read note-by-note off the piano roll:

| | pitches (bottom → top) | pitch classes | reading |
|---|---|---|---|
| chord 1 | F#3 G3 C#4 D4 F#4 G4 C#5 | F#, G, C#, D | **F#–C# against G–D** |
| chord 2 | G3 G#3 C#4 D4 F#4 G4 D5 | G, G#, C#, D, F# | **G–D against C#–G#** |

**The device: two perfect fifths a semitone apart, held.** Not a dissonant chord
over a consonant one — the whole stack is fifths, and the scare is the semitone
*between* them.

- **THIRDLESS.** Zero thirds in either chord. This is the single biggest
  difference from anything the engine writes for horror.
- **Staggered entries** — F#3+G3 together, then C#4, then D4, then F#4, then G4,
  then C#5, roughly a beat apart. It accumulates instead of striking. (Also a
  live example of his standing "changes not just in strict section bar" ask.)
- Notes held ~2 bars.

*Uncertain:* exact onset offsets between voices (read to the nearest beat).

### A2. `dantes.studio` (second reel) — "Steal this chords progression"
Source: `new.MP4` @ 222-230s. Caption is the poster's, not his.

| | pitches | chord |
|---|---|---|
| bars 1-2 | C5 D#5 G5 A#5 D6 | **Cm9** |
| bars 3-4 | G4 A#4 D5 F5 A5 | **Gm9** |

- **Five-note voicings**, R–m3–5–b7–9, and the second is the FIRST TRANSPOSED
  INTACT (planed down a fourth). i9 → v9, no major chord anywhere.
- **Rhythm: LONG, short, short** per 2-bar cell — one chord held ~1.5 bars, then
  two stabs. Not sustained, not metronomic.

### A3. `solobdomde…` — his comment: **"Walking bass (jazz, unique)"**
Source: `remainder+logs.MP4` @ 83s. Printed on screen by the poster, so exact:

> **Dmin9 → G9 → Cmaj9 → Fmaj9 → Bm7b5(addb9) → Eaug → Amin9 → A7**

In C: iim9 – V9 – Imaj9 – IVmaj9 – viim7b5(addb9) – IIIaug – vim9 – VI7.
A descending-fifths circle with two dark pivots: the **half-diminished carrying a
FLAT ninth** and the **augmented III**. Note `addb9`, not `add9` — read twice.

### A4. `briancalli.music` — "Modo Mixolidio b9 b13" — his comment: **"desert chord example"**
Source: `remainder+logs.MP4` @ 56s. **This is the answer to the standing
mysterious_desert complaint** ("I still don't think the chord progression sounds
like a desert. look into other game desert chord progressions").

**r20 UPDATE — this is also "the scary key reel".** He identified it: *"the scary
key reel is the one by brian calli.music, it says Modo Mixolidio b9 b13 on the
reel. it's on the reel that's like 1 minute and 26 seconds long."* `remainder+
logs.MP4` is 86.8s = 1:26. So the reel he called "desert chord example" and the
one he called "the scary key reel" are the SAME reel — **Phrygian dominant is
both his desert scale and his scary key.** Question C1 below is closed.

Chord ladder read off the visualiser: **C → Db → C → Db → Bbm → C**

Scale rows lit: C, Db, E, F, G, Ab, Bb = **C Phrygian dominant** — which the
engine already uses (D93). So the SCALE was never the gap. The **progression**
is: I – bII – I – bII – **bviim** – I.

The scale reading is MEASURED, not inferred: the roll spaces rows chromatically,
so the pixel gaps give the intervals directly — C→Db 35px (1 semitone), Db→E
110px (≈3×35), E→F 35px, F→G 75px (2), G→Ab 30px (1), Ab→Bb 80px (2). That is
1 b2 3 4 5 b6 b7.

**`Bbm` (bviim) is not in any engine desert trope.** hijaz is `0 1b 5:m 1b`
(I–bII–ivm–bII); this walks to the b7 MINOR instead of the iv. That is the one
new pitch relation in the whole desert answer.

**r20 — the voicings, re-read at full resolution (r19 flagged these uncertain):**

| chord | notes on the roll | quality |
|---|---|---|
| C | C E G | major triad |
| Db | Db F Ab **Bb** | **Db6** |
| Bbm | Bb Db F (+Ab entering late) | **Bbm7** |

**Db6 already contains Bb — the root of the chord it moves to — and Bbm7 contains
Db and F.** They share three notes: the same stack re-rooted a third down. That
is why the bviim sounds inevitable rather than like a jump, and it generalises
past the desert case as a common-tone pivot. Recorded as `pivot_by_added_sixth`
in `src/lib/techniques.js` (status: recorded, not yet built).

Rhythm: two attack groups per chord, with some voices sustaining across the
change while others re-articulate.

---

## B. Layer shapes and techniques (no chord data, but layer-order evidence)

### B1. `_moogrs` — DELTARUNE "It's TV Time!" deconstruction
Source: `new.MP4` @ 0-56s. Soundfont named on screen: **SGM/TMNT4**.
Build order, one layer added per title card:

> Teenage Mutant Ninja Turtles 4 Soundfont → **Saw Wave → Drums → Bass → Brass
> → Sax → Lead Guitar** → "Listen to Part 2"

Bed-before-motion-before-melody, and the melodic voices arrive LAST and in pairs
(brass then sax then guitar) rather than one lead holding the tune.

### B2. `diokhairiansyah_` — "slayr" full production breakdown
Source: `new.MP4` @ 128-160s. Layer cards: **PIANO → SYNTH 2 → PLUCK 2 → WAERA
AHH LEAD → FULL BEAT.** Track headers legible in the FULL BEAT shot:

`Keyzone Classic · Pluck Main · Square purity · GMS · Sytrus · Pluck Trance ·
Morphine · waera ahh saw lead 2 · 808 Brain Fog · Hi-Hat Toxic · Clap Eyesight ·
FX Chant · CB]HOOK · Open Hat Hard Knock · Kick Hard Knock · angelus cymbals
transitions · BreadManAU Riser Impact`

Two plucks + two leads + a chant FX — the melodic weight is spread across four
thin voices, not one thick one.

### B3. `dxxdly` / `trifreeze` — arp technique
Source: `new.MP4` @ 64-100s. Three instructions on screen:

1. "RUNS LIKE THIS" (an ascending arp figure)
2. "NOTE, ADD TWO NOTES"
3. **"PITCH THE SECOND PART DOWN 7 [semitones] & ADJUST FOR A MORE SEAMLESS [loop]"**

(3) is directly usable: a repeated arp figure whose second statement is
transposed down a FIFTH and then adjusted by hand. That is a real answer to
"changes not just in strict section bar" — the change is a transposition of the
same cell, not a new section.

### B4. `thefakesnoritz` — SGM-V2.01 through FRUITY FAST DIST
Source: `remainder+logs.MP4` @ 83s. A General MIDI soundfont run through a
distortion unit — the timbral route to horror, not a harmonic one. Sparse yellow
piano roll, notes around C3-C4.

---

## C. Open — needs his eye

- ~~**"the scary key reel near the end of remainder+logs.mP4"**~~ — **CLOSED r20.**
  It is A4, `briancalli.music` / *Modo Mixolidio b9 b13*. He identified it and
  the 1:26 length matches `remainder+logs.MP4` exactly.
- ~~**A4's voicings**~~ — **CLOSED r20**, re-read at full resolution. See A4.
- The `prodbyberke` reel in `new.MP4` was never opened during the recording and
  its thumbnail is covered by the Customize sheet; nothing readable.

## D. Not yet processed

40 unique reels in the repo root (45 `igexport-*.mp4` + 6 `ScreenRecording*.MP4`,
minus 11 duplicates), ~32 minutes total. This atlas covers the ones carrying his
comments plus the four above. The rest is a multi-pass job.
