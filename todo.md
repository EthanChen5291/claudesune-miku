# r24 (2026-08-29) — YOUR CARRIED LIST, AND THREE OF MY MEASUREMENTS WERE WRONG

Listen: **`audition/suite.html`** (the 28 `su_*` songs, rebuilt).
`audition/songs.html` is rebuilt too — **all 15 of your kept songs are
byte-identical**, 27 unkept ones moved. Tests 318/318.

## Your jungle question, answered — the seed is dead code

> *"is this melody (with random variations) for kalimba used in all jungle?
> this what it feels like."*

Yes. And there are no random variations: **the melody-cell picker takes a seed
and never reads it.** The cell is chosen purely by meter, density target and
where the accompaniment's onsets fall — so any two songs with a similar left
hand get the *identical* rhythm cell.

- **11 distinct cells** cover the whole judged page's A sections, out of 27.
- One cell (`utm_dummy_7on_2`) covers 12 songs; another covers 10.
- Both happy-jungle songs draw the same cell despite 124 vs 144 bpm.

Not fixed — seeding it re-rolls the melody on every unpinned song, which is a
round of its own and wants your ear. But it's a dead parameter, not a taste call,
and now it's written down.

## What I fixed

| your words | what I measured | now |
|---|---|---|
| *"too much dissonance in some of the chords in the piano"* | 35.0% of piano chords sounded a **2nd**; 14.5% a literal **semitone**. Your reference MIDI: 9.0% / 3.9%. Eight songs were at **100%** — su_excited_boss played F against F# 64 times | **5.2% / 0.4%** |
| *"the percussive nature of the piano doesn't fit"* (4 cards) | Your *kept* calm songs' piano sits at **48/60/66**; the suite's at **42/53/68** — half an octave lower and wider. Attacks, gain, reverb were *identical*, so it was never loudness | **50/57/68** |
| *"the synth ... way too loud when it comes in"* (3 cards) | A layer entering mid-song entered **louder** than it then plays — violin 1.40x, flute 1.37x | **0.3–0.6x** |
| *"you don't have to always do a beat drop"* | Up to 9 voices switching on in one bar; your references land 4–6 | **4 / 5 / 6**, matching |
| *"you repeated the same melody ... for like a full section"* | Melody repeats over 11 bars median; yours over 5 | **7 median**, p90 now *below* yours |

**The dissonance one has a real cause worth knowing.** Last round's rule made a
colour note *resolve* by moving the top of the chord it sits in — and never
looked at the notes underneath. So making the line resolve was making the chord
clash. A 9th above the chord is colour; a 2nd beside the root is the clash —
same note, different octave. That's your good-colour/bad-colour distinction doing
the work.

## Three numbers I got wrong before I got them right

I'd rather you know how these went than just see the good ones.

1. **"72 of 72 bars of the same melody."** I measured the *solo*, which plays
   unmasked for the whole song by design. The real gap was 2x, not 5x.
2. **"13 voices arrive in one bar vs your 10."** I counted each of our drum
   sounds as a separate voice while your reference counts a whole kit as one.
   The real gap was about **one** voice, not seven.
3. **"The chord is clean."** I modelled piano chords as stacking upward when the
   binder actually places each note independently — so a semitone read as fine.

All three were flattering to the fix I was about to make. Two of them I'd already
half-built before the correction.

## Still open

- **Brass fit** — *"sounds good but sometimes just doesnt fit the vibe"*, and
  *"the brass doesn't fit - it's literally the jungle bruh"*. Not touched.
- The **ornament layers'** dissonance as a class (sparkle / descant / frozen
  slot still run 33–43% non-chord tones against the lead's 26.9%). The piano fix
  doesn't reach them.
- *"reduce some layers ... make them cuter / shorter in duration and more
  harmonic"* — happy shop.
- **Low strings as a held ambience layer** (somber aftermath), **multiple strings
  in the background** for romantic.
- **Tension percussion for stealth** — triangle, shaker.
- Seeding the melody cell (above).
- Older: the mid-band drum fork (no song in the suite has a snare on the
  backbeat), `tailOff` still unsettled.

Nothing is committed. Say the word and I will.
