# Catalog mining, batch 2 (r33) — the "scrounge more patterns" analysis

His ask: "im sure you can scrounge some more patterns, whether that's drums,
chord progressions, layers, or others from the 2k+ songs in the library +
reels combined. do an analysis."

Four parallel mining lanes over the curated tier (~2,050 files: vgmusic-corpus
800, vgmusic-lanes 240, hsmusic 352, Undertale 110, frozen vgmusic 400
read-only, Unison packs 72, manual-r22/r22b 59, Miraleste 53, Cottonwood 38,
piano-refs 4, LoFi kit 12) plus the prior research docs, which several finds
were pulled straight out of (documented in r15–r23, never carded). Everything
lands as **catalog candidates only** — batch 2, strictly appended after his
current queue position, nothing in any retrieval pool until his labels ratify
(D95). 45 mined candidates survived curation; every spec renders through the
project harness at build (113/113).

## Lane results

**Drums — 14 grooves** (1,262 files scanned, 575 usable after the 4/4 +
grid gates; dominant-loop detection by bar-signature counting, all 14
re-rendered through evaluateSong and their (time,sound) multisets verified).
Every priority vibe gap covered: boss ×2 (a menace-by-absence answer-snare;
a saturation pressure-snare), water (conga call/answer + dying shaker),
flying (16th glide), town (triangle clock), victory (skip-hat shuffle built
from one displaced triplet tick), sad/march (snare-only cadence with a
migrating triplet turn), stealth (16th-pair creep with tambourine ghosts),
cave ×2, desert (camel trot with no low end), haunted (triple echo-chase),
festival (all-hand-percussion with a velocity-staircase shaker). Corpus
findings worth keeping: **the Undertale MIDI set is piano-only transcriptions
— zero drum material in 110 files**; Miraleste's drums are wav-only (no MIDI);
and the flat-gain rhythm_onsets renderer erases velocity-built grooves — two
strong finds rejected purely for that (per-onset gains are a batch-3 page
improvement).

**Harmony — 12 progressions** (1,792 files through chordLoops with
LOOP_PROFILES.repaired pinned per D96; 16 raw-note spot-checks rejected 3
shortlisted finds and corrected 2 labels before delivery). Gap-targeted: sad
×2 (a colored lament tetrachord at coverage 1.00; a grief staircase), boss (a
bII^7 hammer with beat-level 2-2-4-8 harmonic rhythm), flying ×2, victory ×3
distinct mechanisms (ii7–V–I^7 walkdown, a per-chord 6th bloom, a
minor-phrygian finale), water (the r15 atlas's dorian shimmer, finally
carded), town (chromatic bass slip), sports (mixolydian I7 ramp), lounge
night (passing-dim walk). **9 of 12 carry verified sub-bar harmonic rhythm**
(chordBeats) — the engine capability with almost no library behind it.

**Layer devices — 10** (1,088 4/4 files, 6 detectors, ~25 hand-read,
transcribed verbatim from bar-grid dumps). Mapped to his standing asks:
echo doubling ×2 (an arranger-*named* triple cascade at +1/+2/+3 16ths; a
written-out decaying echo whose cell alternates two forms while fading);
built-in variation ×2 (a swung arp engine whose inner pair swaps every other
beat and escapes through the 9th at phrase ends; an A A′ A B bass with a
dedicated chromatic-turn fill bar); connective tissue (a bass cell with a
both-sides-bracketed neighbor + a real walking fill every 4th bar);
call-and-answer between support layers (strict 2-bar parity trade, zero
shared onsets); a frozen tresillo bass + its exact +24 mallet copy (R1/R2
attested outside the reels); an octave-pop slap riff; a rolled ^7 two-lane
swell; an anticipation-hold pad. Notable negative result: **every top
density-inversion hit measured as section handoff, not bar-level trading** —
recorded so the next miner doesn't re-chase it.

**Hand-curated packs — 9** (per-file disposition written for all 38
Cottonwood + 53 Miraleste files). Six carry pack annotations verbatim in
his_prior_words — front-loaded in the queue. Standouts: the Skies deck-battle
loop ("love it" annotation) with madd9→m9 tonic thickening; a *measured*
answer to his r17 "changes not just in strict section bar" ask (a pickup that
starts one beat before its section + a destination-note tremolo entering half
a bar early with a velocity crescendo); the catalog's first FUNCTIONAL minor
cadence (iim7b5–V7–im9 + Neapolitan); a deceptive-cadence farewell; a
sea-heartbeat one-pitch bass under a semitone shuttle; and the
curator-invited allstar rest loop (tonic withheld to bar 8). Caveat flagged:
Miraleste's filename parentheticals read as the *producer's* notes, not
Ethan's — his_prior_words left empty there pending his correction.

## Batch-3 seeds (named, not carded)

Woodman stomp, SEMap role-inversion, DKL Temple, viewpoint swing-ride,
Platoon tick (drums); RedRum tension strings, enemy_chaos melody,
triumphantexpedition's "bass becomes percussive" (declared 1/4 meter — its
praise is arrangement-scale); percussive snow elements; velocity-dependent
grooves once rhythm_onsets carries per-onset gains.

## Queue protection

Batch ordering is now part of the builder: batch 2 strictly appends, so his
saved position and the numbering he has seen never shift (verified: his
batch-1 export's 59-card unseen order survives as an exact subsequence of the
first 62). The pianoMain measurement gained a documented per-candidate
override (`piano_main`) after it misread a staggered-unison echo cascade as
a chordal bed — co-attacks of one line at different phases are not harmony.
