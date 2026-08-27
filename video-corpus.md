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

Chord data → `src/lib/progressions-videos.js` (20 section entries, pack
`igvideo`: 18 eye-read, 1 ear-derived (D60), 1 audio-confirmed (D64)). Flourishes → `src/lib/figurations-videos.js`. This file holds what
doesn't fit in an entry.

## The thirteenth video (D64) — read twice, and it disagrees

`ScreenRecording_08-26-2026 00-35-16_1.MP4` (Instagram reel by @eunyu_pia,
"Chord progression") came in later than the twelve and is not an `igexport-*`
file. It is the only entry in the pack whose labels were checked against the
**audio** — onset detection plus iterative harmonic subtraction recovered the
sounding pitches of all 15 strikes, and all 15 matched the on-screen label.
Entry `vid_eunyu_circle`; `provenance: 'video+audio-transcribed'`.

8 bars, C major: **C – E7 – Am7 – Gm7 – C7 – FM7 – Em7 – A7 – Dm7 – G7.**

It is the corpus's counterexample on point 2 below. The twelve say *one altered
dominant per phrase, at the turn, never two in a row*. This one runs a
descending circle-of-fifths chain with a secondary dominant at **every** turn
(E7→Am7, C7→FM7, A7→Dm7, then V7) — four in eight bars, none of them altered.
Read together, the two are a real fork rather than a contradiction: **either the
dominants are rare and coloured, or they are frequent and plain.** What is not
in evidence anywhere is frequent *and* altered.

It also supplies the pack's only **measured** voicings (`observedVoicing`), RH
only, all inside E3–E4. The mechanism worth stealing: the top voice holds E4 for
nine strikes then D4 for the rest while the BOTTOM of the voicing walks
(G3–G#3–G3–F3–G3–F3–E3–G3–F3–F3). Static top over moving bottom is what keeps a
relentless dominant chain sounding smooth — the same static-top habit point 5
notes in the descending-dim chain, doing a different job.

Not endorsed by ear: Ethan approved adding it, which is not the blanket
"i am a fan of how all the songs sound" that covers the twelve.

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

---

# BATCH 2 (D68, 2026-08-26) — seventeen reels + five screen recordings

Transcribed by a 22-agent frame-read pass (montage sheets + full-res frame
extraction per agent; several voicings pixel-decoded from lit-key overlays or
read off FL piano-roll note labels — evidence class noted per item below).
Chord data → `progressions-videos.js` (21 new entries, `sourceEndorsed: false`
— the D57 blanket does not reach a later source). Devices →
`figurations-videos.js` (5 new flourishes). None of this is ear-ratified.

## Inventory

| file | what it is | key | kind |
|------|-----------|-----|------|
| DcY-6NdSCFY | **"Tyler, the Creator Type Chords"** (his ask a) | F | chords |
| DceNMCmuYZV | **G#m9 octave-climb reel** (his ask b) | G#m | chords |
| sr 13-25-13 | **@bronikbeats "Impossible"** (his ask c: black shirt, painting, synth build) | Cm | layering |
| DbEktz0I_j8 | "Use these chords" planing loop | Cm | chords |
| DYP1T7zRAYJ | "+1 octave" stack reel | G | chords |
| DbuFbACtERO | "K-Pop/R&B Chords" | Dm | chords |
| DceFyBnsRB1 | "Try this these chords:" | Eb | chords |
| DZ5k5-xKqzH | @ChordCamera "C minor Fast Cycle with 3-Note Chords" | Cm | chords |
| Daa21N3RUlX | "Take these damn chords" (upright, F minor) | Fm | chords |
| DcB52lyPaNg | "Take these damn chords" (Ab walkdown) | Ab | chords |
| DbOexm8RS5a | "Take these damn chords" (Db gospel turnaround) | Db | chords |
| DaHBG7LtDab | "Use these damn chords" (Db constant-structure) | Db | chords |
| DZ93AHcBuac | bubble-label hand-cam circle | D | chords |
| DYcEDDITmvV | "City Pop Type Piano Chords" | Ab | chords |
| Db-2YGCvU68 | pixel-font modulation reel (Abm→Am) | multi | chords |
| sr 13-20-27 | @vanrivermusic chord-app loop | Eb | chords |
| DYpzbrLyAg7 | "who let bro cook" FL trap build (producer "june") | Bm | layering |
| DZsWPeixrry | New Super Mario Bros. Wii W7 remake (FL Mobile) | D | layering |
| sr 13-23-03 | @migwlito_rl "how to make epic melodies" 6-layer build | Am | layering |
| sr 13-20-54 | @leonardo_made_this "this beat too swaggy" | Cm | layering |
| sr 13-26-56 | @consci3ntiousmusic arp trick ("add a note below every arp note") | A | technique |
| DaNrisqTgaC | sidechain tutorial (Fruity Limiter comp mode) | Gm | technique |

## His three asks, answered

**(a) Tyler chords (DcY-6NdSCFY).** F major, ~81bpm, one 2-bar loop:
Gm9 → Csus13 → C9b13 → Fmaj9 → Em9 → A7b9b13, LH low root + RH rootless
upper structure a 10th up, nearly every change pushed onto an "and". THE TWO
EXTRA NOTES: after Csus13 is struck and held one beat, a dyad of **E5+G#5**
lands on the pushed and-of-3 — each note exactly a half-step below the two
notes simultaneously lifted (F5, A5). Vs the C root: the **major 3rd and the
b13** — the sus4 resolves to 3 while the 13 sags to b13, converting Csus13
into C9b13 in one gesture, bass and inner voices ringing under it. Payoff:
E holds over as the maj7 of Fmaj9 and G# slides to G (its 9th), so the top
voice sings A–A–G#–G chromatically across the turn. Secondary habit worth
stealing: on long chords the top two notes are RELEASED one at a time (9th,
then 7th, ~1 beat apart) — decays, not fills; the loop breathes.
→ `vid_tyler_loop` + `vid_tag_sus_melt`.

**(b) The G#m9 octave technique (DceNMCmuYZV).** G#m9 → C#m9 → D#7#5#9 →
A9#11(no3) (i–iv–V–bII, labels + numerals on screen; ~80bpm). The climb is
NOT an arpeggio: the entire rootless cluster (9-b3-5-b7-9, with the 9 a
half-step UNDER the b3) is **restruck as a solid block one octave higher per
beat** — three positions (two for the bII), bass sounding only under the
first, hands fully releasing between strikes. The release is the trick:
terraced echoes, not a swell. AFTER THE TOP OCTAVE: two solo notes walk down
as 8ths on beat 4 — **octave-root then b7** (9→1→b7 down the top of the
chord: A#7→G#7→F#7 after G#m9). On the V chord the tag flips allegiance and
plays the NEXT chord's 5th and 3rd instead; on the bII it slows to quarters
(5 then #11, the #11 doubling as the tonic's 5th — a chromatic hand-back).
Second-cycle personality: one tag note octave-doubled, one tag omitted
entirely. → `vid_gsharp_climb` + `vid_climb_block_restrike` +
`vid_tag_climb_walkdown`.

**(c) The black-shirt synth build (sr 13-25-13, @bronikbeats "Impossible").**
C minor, 102bpm, FL + five Serum 2 patches, no drums in the recorded 56s.
THE OPENING UPWARD FIGURE: a two-octave broken-chord climb in straight 8ths,
one chord per bar — **1, 9, b3, 5, then the same four an octave up**
(C5-D5-Eb5-G5-C6-D6-Eb6-G6), topping on the 5th. The harmony trick: the
upper cell D-Eb-G never moves; only the bottom note descends **C → Bb → Ab →
G** (i→bVII→bVI→v), re-naming the same climb as Cm(add9), Cm/Bb, Abmaj7(#11),
G(b13). THE LAYERS, in order, intervals vs the root: (1) the arp above;
(2) sub bass doubling the descent in whole notes — 1, b7, b6, 5 (the last
leaping UP an octave for the turnaround); (3) melody an octave above the arp
using ONLY 1-2-b3-4: pickup 1→b3 answered by a 1-2-b3-2-1 turn, second
phrase lifts the pickup to 1→4; (4) inner counter: root held a full bar,
answered by quarters 4-1-2-b3; (5) bell two octaves up: root on the
downbeat, 1→2 walk-up tag ending odd bars, 1→b3 + a lone suspended 4 ending
even bars. Five registers, one 1-2-b3-4 vocabulary echoed at every height.
→ `vid_bronik_descent` (harmony) + `vid_climb_bronik_add9` (the playable
climb — held on a static chord with a 1-b7-b6-5 bass walk underneath, it
reproduces the source note-for-note); layering pattern recorded here.

## The layering videos

- **DYpzbrLyAg7 ("who let bro cook", FL, 140, B minor, producer "june").**
  Build order: exposed held F#6 lead (the key's 5th — common tone over every
  coming chord) → chopped melodic sample carrying Gmaj7–D(add9)–Em9–Bm9 →
  full sung verse → glassy bell answering phrase-ends with a b3-2-1 walk-down
  tag → 808 → hats → kick + Effector X/Y automation stuttering the vocal
  chops at 2-bar boundaries. The harmony lesson: the 808 does NOT track the
  sample — it simplifies to a half-speed root descent G(×2 bars) → E(×2,
  with a chromatic F passing quarter) → D(×4, with A fifth-bounce ghosts),
  letting the alternating Bm9/Em9 upper stacks reharmonize each bass note.
  Same fixed-top/moving-bottom device as bronik, at section scale. Audio-
  derived (no labels) — medium confidence, kept out of the progression pack.
- **sr 13-23-03 (@migwlito_rl, "epic melodies", A minor).** Six layers over a
  two-chord Am–Bb Phrygian plane: (1) pad with doubled root + wide gap + close
  3rd/5th an octave up; (2) metal pluck on 5-b6-b3 (the b6 = the Bb chord's
  5th held over the Am — a suspension that resolves down to 5); (3) bass
  adding a chromatic leading M3 (C#) and 4; (4) slow lead on 1-b3-b7;
  (5) pulsating gated synth on the same stack at three octaves; (6) short
  triad stabs. The vocabulary never exceeds the two triads + b6/b7 color —
  epicness = registral spread + rhythmic subdivision, not harmony.
- **sr 13-20-54 (@leonardo_made_this, C minor).** Stab-stack build: bass
  roots (C, Ab, G) → a 6-note Cm9 cluster stab (5th on BOTH outer edges, b7
  tucked under the root, 9-b3 semitone rub in the middle) machine-gunned
  while ONLY its top voice moves (adds b7-above, root-above, steps b3 and 5
  two octaves up, peaks, then resolves onto a LONG-HELD 9th) → growl → kick
  → clap → hats/shakers → percs → full beat. "Repetition with a moving lid."
- **DZsWPeixrry (Mario Wii W7, FL Mobile, D major, 122).** Intro sine-bell
  pentatonic rocker (5-1'-3-6 | 5-1-2-6 zigzag implying D6/9 without block
  chords) → melody alone → strings+piano (roots/5ths + a 1-2-3-4 piano
  walk-up landing on repeated 5th/root chirps) → pad chorale (Dmaj7–Em7–
  Dmaj7–A) → bass staircase run into a drums-only break → main loop. Classic
  Nintendo layering: every layer diatonic, contrast lives in register+timbre.
- **DaNrisqTgaC (sidechain tutorial).** No notes at all: kick → Fruity
  Limiter COMP sidechain → sub-bass pumping. Production device, logged for
  the day the engine has a mix stage.

## Cross-video patterns (what batch 2 adds to the technique book)

1. **The climb-then-tag shape.** Three independent sources (G#m9 reel,
   "+1 octave" reel, vanriver's Fm7(11) bar) climb a voicing up octaves and
   then hand the barline a 2-3 note walk-down. The climb is BLOCK RESTRIKES
   with full releases; the tag walks 9→1→b7 (or announces the next chord).
2. **Two-note tags, three flavors.** After-chord dyad (Tyler: 3+b13 melting
   a sus), end-of-bar pickup pair (b3→9 falling, DbEktz0I_j8; stepwise-UP
   version closing every bar of DZ93AHcBuac), post-climb walk-down (above).
   Ethan's "extra stuff between chords" is, in this batch, almost always
   exactly two notes.
3. **Fixed upper structure, moving bass** — the batch's defining harmony
   move, at three scales: within a chord (DaHBG7LtDab: one Bbm triad held
   over a 6-stop bass walk), within a loop (bronik: D-Eb-G cell over C-Bb-
   Ab-G), across a section (june's 808 descending under static Bm9/Em9
   stacks). Reharmonization by bass alone.
4. **The altered-dominant fork, resolved.** D57 said dominants are either
   frequent-and-plain or rare-and-colored. Batch 2 finds the exception and
   its job: Db-2YGCvU68 runs FOUR b13/alt dominants in a row — as a
   MODULATION elevator between two keys, not as phrase color. And
   DZ93AHcBuac seconds vid_eunyu_circle on the frequent-and-plain side.
5. **Roll-in shells** (DbOexm8RS5a): a chord introduced as root + ONE high
   color note (maj7 or 9) held naked for a beat before the middle rolls in.
   The chord arrives as a question. Related: bass-first attacks
   (DceFyBnsRB1), and DcB52lyPaNg stacking color tones one finger at a time
   ON TOP of a ringing chord.
6. **The 9-under-b3 crunch cluster** (G#m9 reel, sr2054's stab): minor-9
   voicings that put the 9 a half-step under the b3 mid-stack — the rub is
   the color. City-pop/neo-soul reels prefer it to clean stacked 3rds.
7. **The arp under-shadow** (sr 13-26-56): "add a note below every arp
   note" — every 8th of a chord-tone waterfall gains a simultaneous second
   chord tone; pairs invert as the line descends so the dyad color rotates
   while the contour stays. Direct fix for our own "robotic arp" complaints.


## The 23rd source (added mid-session): "aquatic ambience" — the interval walk

`igexport-DZKQMVQsj79.mp4` — scizzie / PianoKiwis, a solo-piano cover of
**Aquatic Ambience (Donkey Kong Country, David Wise)**. F# minor, ~141bpm at
performance tempo (the first 25s is the same material at exactly half speed
with sheet + note labels — a teaching pass, which is why this is the
strongest eye-read in the batch: notation, key labels, and audio all agree).
One chord per 2-bar phrase (figure bar + hold bar): **F#m9 → Dmaj9(#11) →
Bm7(add11) → Bm13(dorian) → C#m7(b13)** — i–bVI–iv–iv–v, no cadential V,
loop falls from the minor v back to i. → `vid_aquatic_ladder`.

**The interval progression, relative to the key root F#** (his ask, note by
note; ' marks octaves; LH = notes 1–4 on beats 1-&-2-&, RH = notes 5–8 on
beats 3-&-4-&, pedal down all bar):

- **i (F#m9):** 1, 5, 2', b3', b7', 2'', b3'', b7'' — up in 5ths, the 2'→b3'
  semitone blur, ending at the TOP (two octaves + a 7th up).
- **bVI (Dmaj9#11):** b6, b3, b7, 1', 5', 2'', b3'', then **down** to b7' —
  the same ladder from the new root (1-5-9-3-7-#11-5-9 of D); the one
  descending 8th in the piece — the figure curls under instead of peaking.
- **iv (Bm7add11):** 4, 1', b6', b7', b3'', b7'', 1''' — the 9 slot swapped
  for the 11; lowest start (B2).
- **iv (Bm13):** 4, 1', 5', b6' in the LH, then the top line turns
  b3'''–2'''–4'''–b3'' — over B that is b7-6-1-b7, the natural 6 over a
  minor chord = the dorian signature, with a mid-figure B octave punch.
- **v (C#m7b13):** 5, 2', 4', b7', 2'', b3''+b7'', then a ~2-octave leap to
  the top of the piano and the **cascade tag falling b6→5→b3 of the chord**
  (A6→G#6→E6), held ~2 seconds, loop restarts.

**The generative rule** (what to copy): stack 5ths from the root (1→5→9),
blur-slide a semitone into the adjacent chord tone (9→b3 minor / #11→5
major — the G#+A pair sounds in every single bar), keep climbing to the
b7/9 region two octaves up. Endings rotate: peak-up, curl-under, cascade.
Register counterpoint at phrase scale: roots walk DOWN (F#3→D3→B2→B2→C#3)
while peaks walk UP (E6→…→A6). This is our `water` vibe rendered as one
voice and a pedal — sparsity as the texture, the D62 theme from the source
that does it best.

---

# BATCH 3 (D85, 2026-08-27) — eight reels: the layer-stack builds

Transcribed by an 8-agent frame-read pass (montage sheets + full-res frames,
FL note-name labels read per note; one video pitch-checked against the
Ableton status bar). His ask for this batch: layering techniques per
instrument + synth types + interval patterns, high-end patterns, the synths
the creator uses, and the bouncy funk bass. Five of the eight are the SAME
creator (couch, headphones, seascape painting) building 3-5 synth layers
note-by-note in FL — the batch is effectively a masterclass in one person's
layer grammar.

## Inventory

| file | what it is | key | bpm | synths |
|------|-----------|-----|-----|--------|
| DYfkq3BouJ_ | FL loop build, high chime layer | Cm | 75 | Serum 2 ×3+ |
| DZS8aawIFrb | FL ostinato build | Em | 80 | **Surge XT ×3** |
| DY77j6wIEcA | FL pulse-arp build | Dm | 63 | Serum 2 ×4 |
| DalZ717INc7 | FL accent-line build | Cm | 91 | Massive X ×2 + Serum 2 ×2 |
| Da3c_kEI25C | FL backbeat-stab build (saved ×3) | Cm | 69 | Serum 2 ×5 |
| DcZL7XFSQj_ | pluggnb 5-layer breakdown | Eb | ? | Serum 2 ×2 + DirectWave ×2 |
| Db8S5RaNXOJ | Ableton "what instrument do you play" meme | Em | ~166 | tremolo strings rack |
| Dak2qNuMi0i | (report pending at write time; addendum below) | | | |

**The synth-acquisition verdict:** patch names are on screen in NONE of the
eight — no preset browser is ever opened. What IS recoverable: the plugins
(Serum 2 dominates; one build is entirely Surge XT — the synth we already
vendor; Massive X once; DirectWave sampling). Serum 2 and Massive X are
commercial and cannot be auto-fetched; the palette therefore lands as
category-matched Surge XT factory patches, each verified by probe render
(envelope + spectral centroid) before wiring — see D85.

## The layer-stack formula (five same-creator builds agree)

3-5 synth instances, ONE function each, all sharing a tiny interval
vocabulary (1-2-b3-4-5 + b6/b7 color) restated at every octave:

1. **Sustained root bass** — whole/half-note roots only (1-b3-b6-5,
   1-bVII-IV-bVI-V etc.); the ONLY rhythmic event is a bar-4 turnaround
   (octave drop + a beat of rest; or the V root leaping UP an 11th).
   Never bouncy in these builds.
2. **Ostinato / pulse motor** — straight 8ths/16ths on a root pedal with a
   fixed neighbor pair; e.g. [1,8,9,b10] 16th cells where the top F#-G pair
   NEVER moves while the bottom root changes (fixed-top again), or a 1-2
   pedal where only the bar-downbeat accent note changes (8ve→b3→b6→5) —
   **the accent line IS the chord change**.
3. **Mid counter, entering on beat 2** — fills the exact gaps the
   motor/lead leaves: 1-2-b3 quarter climb → 5 held over the barline →
   4-b3 16th turn → 2 resolve. Or a whole/half-note scale line climbing
   E→F#→G→A→B across the whole loop.
4. **Staccato high melody** — 16th-length stabs, mostly on beats, small
   arches (b3-2-4-b3-1), sparse answers, ONE peak bar per 4 (5-1-2 or a
   held b3-at-the-octave landed by a straight-8th 1-2-b3 run).
5. **Ultra-high sparkle (C7+)** — see the high-end doctrine.

No drums in five of the builds — the pulse layers carry time. The
pluggnb video is the exception that adds 808/claps under the same stack.

## The high-end doctrine (his "high end patterns" ask — six sources)

- **Root/5th chimes** on beats 1 and 3 of ODD bars; **motion cells** only in
  the back half of EVEN bars (chromatic 16th slide b3→2; a 1-2-b3-2-1-2
  eighth rock filling the turnaround). Sparse anchor, placed motion.
- **The beat-4 pickup**: two 8ths stepping into the NEXT bar's downbeat
  harmony tone, transposed UP each bar (1 / 2 / b3 / 8ve downbeats,
  peaking at 5 two octaves above the lead at loop end).
- **The "e"-echo**: over a straight-8th root pedal, one 16th a grid step
  AFTER each beat, a m3 above in bars 1/3 and a M2 above in bars 2/4 —
  shimmer from exactly two intervals.
- **Backbeat stabs**: one 16th on beats 2 and 4 walking a two-bar descent
  (b3-b7-b6-5) — a hat substitute in drumless loops.
- **Rocking pentatonic cell ×4 with rotating answers** (1-5-6-5 then:
  octave plunge / two-beat breath / walkdown / final 6→1 resolve).
- **String-figuration formula** (Ableton video, bars 9-12): per chord, one
  repeating 8th shape [5, 3-below, root-above, 5, PEAK 3rd-an-octave-up on
  beat 3, root, 5, root]; the peak climbs a step per bar (C5→D#5→E5).

## Other batch-3 techniques

- **Velocity fade ramps** on closing stabs (sawkeys layer) — endings decay
  by velocity, not by removal.
- **Paired 16th double-stabs** (harpsichord) as high-mid sparkle against
  sustained chords.
- **4-3 grace resolve** (Ab6→G6) as a high-topper signature.
- **Placed variation inside the loop**: bar 4 restates bar 2 with ONE note
  changed (C6 for D#6); second-cycle sparkle repeats with one-note
  variations. Same law as his own "variation as a placed event".
- **Contrary-motion walking bass** under a sequentially-climbing melody
  (tremolo-strings video, bars 5-8), then quarter-pulse root+5th hits under
  the figuration — the only batch-3 bass with internal motion.

## Batch-3 addendum: the eighth video (Dak2qNuMi0i)

Not a DAW build — a Synthesia-style solo-piano anime ballad ("You hear the
piano and know the episode is about to end"), E minor, ~100-105 rubato,
decoded programmatically (self-calibrating key grid + on-bar handwritten
note letters; 336 events, full timeline in the read agent's events.txt).
No synths anywhere — nothing to acquire; what it teaches is ARRANGEMENT:
- **Texture changes instead of layers** (solo piano): music-box intro two
  octaves up → lament verse → ostinato section → climax chords over
  chromatic 16th runs → white-key glissando → octave-doubled outro.
- **The 7→1 grace tag**: a semitone D#→E flick into the high tonic,
  recurring at phrase heads — the track's identity ornament.
- **Chromatic lament bass** D#-D-C#-C-B-E harmonized B/D# → Bø7/D → C#dim
  → C → B7 → Em (a real descending-bass progression for sad vibes).
- **The same 1-b3-b6-5 ostinato** as the synth builds (E-G-C-B quarter
  loop) — sixth independent source for that contour.
- **Octave-doubled outro melody** (X4+X5 bell dyads) as the final-section
  lift, and V(7)→i at every cadence including the end — his v→V taste,
  corroborated from the piano side.
