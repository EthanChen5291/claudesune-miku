# r22 — the face-cam production reels, layer by layer

His ask: *"take notes from the reels of the guy making the serum synth beats ...
because I feel like it wasn't fully learned how he layered and the specific
patterns he put on each layer for it to sound good"*, clarified as *"the reels
with the guy visibly making the beats with a camera in the top half"*.

**These reels exist and had never been opened.** A previous round recorded layer
ORDER from title cards and nothing about what each layer plays; that gap is what
this closes. 44 unique reels were frame-sampled and read; **9 are face-cam
production reels**. Per-layer transcriptions: `research/reel-layers-r22.json`.

## Read this before using any of it

**9 reels, 4 producers.** Six of the nine are the SAME person — identical webcam
framing, same FL workflow of numbered instances of one synth (Serum2 #2/#3/#4/#5,
Surge XT #2/#3), same drumless 4-bar minor loop, tempi 63/75/80/69/91/102. He is
the Serum producer. So "5 reels" usually means "one producer, five times", and
every count below is given as reels / independent sources.

**All 9 are in MINOR.** Zero major-key, zero modal, zero non-Western evidence.
Nothing here transfers to desert, jungle or any modal lane on its own authority.

**The visible build is a curated subset of the project.** One reel's final
arrangement contains four layers (crash, vocal chops, a sustained pad, a perc
loop) that were never shown being built.

---
## Evidence base — read this before any rule below

**9 reels, but 4 producers.** Six of the nine (`13-25-13` bronikbeats, `DY77j6wIEcA`, `DYfkq3BouJ_`, `DZS8aawIFrb`, `Da3c_kEI25C`, `DalZ717INc7`) are the **same person**: identical webcam framing, same couch + framed landscape, same FL workflow of numbered instances of one synth (Serum2 #2/#3/#4/#5, Surge XT #2/#3), same no-drums 4-bar minor loop, tempi 63/75/80/69/91/102. The other three are `13-20-54` (leonardo_made_this, trap, drums), `Db04jWHop4_` (Ableton, Gimme More remake), `DcbbGuNCfGv` (127 BPM, FL, **transcription truncated — 2 of its 5 named channels readable**).

So **"5 reels" usually means "one producer, five times."** Every count below is given as `reels / independent sources`. Also: 61 igexport reels sit in `~/Downloads`; 7 were transcribed. This is a ~13% non-random sample.

Two further sampling facts that limit everything: `13-20-54`'s final arrangement contains four layers (crash, vocal chops, sustained Vital pad, an 8-hit perc loop) that were **never shown being built** — so the visible build is a curated subset of the project, not the project. And `DY77j6wIEcA`'s fourth layer "was still being drawn when the reel ends" — layer counts are lower bounds set by video length.

---

## 1. LAYER ROLES — the patterns

### A. Sustained floor — mono, 1–2 notes/bar, zero rhythm — 5 reels / 2 sources
One note per chord, held its full value, monophonic, no ornament, no repeat. `13-20-54` "zero repeated onsets, zero rhythm"; `DYfk` one whole note per bar (5 notes / 4 bars); `DalZ` one whole note per bar; `Da3c` half notes on beats 1 and 3 only, legato; `DZS8` 2.5 notes/bar as a single moving voice, explicitly "no block chords anywhere." Contour = chord roots, moving **only when the chord moves**. Loop 2 or 4 bars.

**The turnaround is the floor's only event** — 3 reels / 1 source: the last bar splits in half and the second half displaces by an octave. `DYfk` leaps **up a major 7th** (Ab3 → G4) rather than stepping down a semitone, putting V near the melody's register on the busiest bar; `DalZ` drops an octave (G4 → G3); `DZS8` drops an octave at the bar end (B4 → B3). `Dcbb`'s chord layer does the equivalent — the loop's last chord "SPREADS WIDER than the others."

### B. The motor — continuous subdivision, zero rests — 5 reels / 2 sources
8ths (`13-25-13` 8/bar × 4 bars = 32, no rests; `DY77` 8/bar pedal; `DalZ` 32/4 bars, zero rests; `Db04` keys, no rests) or 16ths (`DZS8` 16/bar, no rests, strictly monophonic).

**Its defining trick: the body is frozen and ONE slot carries the harmony** — 4 reels / 1 source.
- `13-25-13`: 8-note two-octave ascending shape per bar; 3 of its 4 pitch classes are invariant across all 4 bars, only the lowest walks C–Bb–Ab–G.
- `DZS8`: 4-note per-beat cell `[root, root+12, F#5, G5]`; **slots 3–4 never change for the whole loop**, so the frozen dyad reads 9+b3 over Em, #11+5 over C, 5+b6 over B.
- `DalZ`: "The body of every bar is byte-identical; only the downbeat moves" — and those four downbeats spell the entire progression.
- `DY77`: the pedal note never changes pitch at all.

`Db04` is the variant from a second source: pitches follow the chord but the **cell shape** is frozen and variation comes from metric rotation (below).

### C. Topline / lead — sparse, stepwise, one designated leap — all 9 reels, but the shape splits
Density 1.5–6 notes/bar, always well under the motor. Stepwise-dominant with the largest leap a 4th: `13-25-13` ("no leap larger than a 4th anywhere"), `DY77` (stepwise within a fifth, the single leap saved for bar 4), `DalZ` (quarter-note stepwise rise → one P4 leap to a held peak → 16th step-down → held landing) — 3 reels / 1 source.
- **Static-bar / moving-bar lead** (`DYfk`, 1 reel): notes/bar = 4, 8, 4, 8. Static bars hammer **one** chord tone as staccato quarters (b3 over i, root over iv); moving bars alternate **two chord tones a P4 apart**, low on-beat, high off-beat.
- **Weak-beat-only lead** (`Da3c`, 1 reel): melody notes on beats 2 and 4 exclusively; the line descends b3–b7–b6–5 with **shrinking intervals** (P4, whole tone, semitone).
- **Direct counterexample** (`Db04`, 1 reel): the lead has *no stepwise motion at all* — three pitch classes (4th, 5th, root), one note every two beats. It is defined entirely by its rests.

The perfect 4th/5th is the structural leap in 6 reels / 2 sources (`DalZ` leap to peak, `DYfk` P4 oscillation and P4 turnaround drop, `13-25-13` bar 3 reaching a 4th where bar 1 reached a 3rd, `DZS8` rising-P4 barline pickup, `Da3c` falling-P5 tag twice, `Db04` root-and-5th plucks).

### D. Sustain / augmentation layer — long values against a fast layer — 5 reels / 2 sources
Whole and half notes only, 1–3 notes/bar. **Hold-bar / move-bar alternation on a strict 2-bar period is the single most repeated device in the whole corpus** — 4 reels, all one producer: `13-25-13` #2 (odd bars a whole note C5, even bars quarter notes F5-C5-D5-D#5 landing back on the held C), `DZS8` #3 (bar 1 hold, bar 2 F#-E-F# neighbour, bar 3 hold, bar 4 A-B), `Da3c` #2 (whole note on odd bars, **exactly two** notes on even bars at beat 2 and the & of 3), and `DYfk`'s lead runs the same 4-8-4-8 shape.

### E. High ornament — highest, sparsest, straddles the barline — 4 reels / 1 source
2–3.5 notes/bar. Pitch set is **the melody's, transposed up 1–2 octaves** (`DYfk`: "LITERALLY THE MELODY'S SET TRANSPOSED UP TWO OCTAVES"). Its figure is a **3-note upper-neighbour turn** (4 reels), and it crosses the barline where nothing else does: `13-25-13` "always straddles the bar line rather than sitting inside a bar"; `DalZ` "the only layer that crosses barlines with its figure; everything else is bar-locked" — a turn on beat 4 + & of 4 resolving onto the next downbeat.
A **thirdless root+5th ping** appears in 2 reels / 2 sources (`DYfk` bars 1 and 3; `Db04` plucks "root and 5th only, no third").

### F. Stab / chord-rhythm layer — 3 reels / 3 sources
Notes ≤ 1/8, 3–4 hits/bar, **never a steady quarter pulse**. `13-20-54` onset spacing 0,+2,+4,+2,+4,+4 sixteenths (two stabs an 8th apart then a quarter gap); `Dcbb` "Layer" at 8th-positions 0, 2, 3.5 (a 16th before beat 3); `Dcbb` Purity #2 one chord **every 3 eighths**, durations alternating quarter/eighth.
Voicings — **10 of the ~11 chords named across these 3 independent sources are 4–6 notes, or inverted, or deliberately incomplete**: Ab 1st inversion, Gm 1st inversion, a 6-note Cm9, Abmaj7 root position (caught being thickened 3→4 notes on camera), Ebmaj7 in **2nd inversion**, Em7 with the root at E3 and the whole upper structure crammed into C5-G5, Fm9, and a Bb triad octave-doubled over two octaves. The one plain triad was mid-thickening. `Db04`'s pad omits the **fifth** (root + root+8ve + third above the upper root). `13-20-54` holds **one voice long inside the stack** (a D6/G5 over 4–5 cells) while the other five are 16th stabs under it.
Chord changes land off the beat in 2 reels / 2 sources: `Db04`'s pad splits the bar **2.5 + 1.5** (second chord on the & of 3, a half beat early); `Dcbb`'s dotted-quarter cycle.

### G. Doubling / transient layer — adds zero new information — 4 reels / 3 sources
`Db04` counts a note-for-note pad doubling on a second timbre as a numbered layer. `DalZ`'s bass is "literally the lead's downbeat skeleton, sustained and transposed down… adds no new pitch and no new rhythm." `Da3c`'s lead fires a 1/8 stab of the bass root in exact unison with the bass half note — **it gives the sustained note its transient and gets out of the way**. `13-20-54`'s growl doubles the bass register as a second low pass.

### H. Answer layer — plays only on alternate bars — 3 reels / 1 source
`DY77`'s unnumbered part is silent in odd bars, enters bar 2 with two half notes Bb→A (b6→5, a semitone sigh), silent again, returns bar 4. `Da3c`: bar 1 is held/sparse in *every* layer and bar 2 carries all the 8th-note motion — density breathes on a 2-bar period.

### I. Drums — 2 of 9 reels, and they contradict
`13-20-54`: kick **not** four-on-the-floor — hand-placed clips, 2–3 per 2 bars with empty bars between, one dragged off-grid, long pitched decays; hats 1–2 per bar, explicitly **not** a continuous 16th grid; percs irregular except one 8-hits-per-bar loop that is the only continuous pulse in the beat. `Db04`: kick **is** four-on-the-floor, clap on 2 and 4. Nothing generalises except entry position (§2).

---

## 2. STACKING ORDER

**What is solid (8 of 8 readable reels, 4 sources): the last layer written is always decorative — never the floor, never the motor.** The floor's root motion and the motor, where they exist, are always the 1st or 2nd layer. Drums, where they exist, arrive after at least two pitched layers (2/2 reels — `13-20-54` finishes *all* harmony first; `Db04` puts them 4th of 9).

**Bottom-up is NOT universal.** 3 reels (`13-25-13`, `DY77`, `DalZ` — one source) write the motor or lead FIRST and derive the bass from it afterwards. `DalZ` is the clearest inversion of the engine's assumption: the lead ostinato is written first, and the bass is then drawn as that lead's four downbeat pitches, sustained an octave down. In `DYfk`, `DZS8`, `Da3c` the floor already exists as grey ghost notes at 0:00.

**A number I had to retract.** I first concluded "the last layer is the sparsest" in 7 of 8 reels; recounting onsets/bar killed it — `13-25-13`'s third-written #2 is 2.5/bar against the last-written #5 at 3.0/bar, and `Da3c`'s #2 (1.5/bar) is sparser than its last layer #5. It holds cleanly in only 3 (`DYfk`, `DZS8`, `Db04` — "by far the SPARSEST layer in the project"). Reported per the project's own "suspiciously clean number" rule.

**Implication for an arrangement engine:** the order is not a cast list, it is a **derivation chain**. Layer *n* is produced by transforming layer 1..n−1 (octave shift + note-value class change + onset displacement), not by independently generating a new part. See Rule 1.

---

## 3. REGISTER + INTERLOCK

**Register is the primary separator — 7 reels / 3 sources.** `DalZ`: "four disjoint octave bands (G3-G4 / C5-D5 / C6-G6 / C7-G8) and never double a pitch." `Da3c`: F3-C4 → Ab4-Eb5 → C6-G6 → C6-G6 → D6-Eb7. `13-20-54`: the stabs live from A#4 up specifically to clear the kick's pitched sub tail. `DYfk` states it outright: "INDEPENDENCE IS BOUGHT WITH REGISTER, NOT RHYTHM."

**When two layers deliberately share a register, one HOLDS and the other RUNS** — 2 reels / 1 source, both explicit. `Da3c` put #2 in #3's octave "specifically so a sustain can sit against a run." `DZS8` #3 sits in the arp's own register on a different patch and is "the only layer whose separation is purely durational."

**Interlocking pairs** (later layer displaces its onsets off the beats the earlier one owns) — 6 reels, but a *different pair each time*: `DY77`'s ostinato voices are exactly out of phase by a 16th (measured: F5 at x=486 is the exact midpoint of D5 at 428 and 542; the first 16th of every beat is empty so **nothing lands on the downbeat**); `Da3c` bass on 1 and 3 vs lead on 2 and 4, zero shared melodic onsets; `DZS8`'s counter never on beat 1 or 3 except the phrase opening; `DalZ`'s counter rests on beat 1 where the lead accents; `13-25-13`'s topline enters on beat 2 and never on the bar-1 downbeat; `Db04`'s lead lands where the keys cell is mid-rotation.

**Coinciding pairs, deliberately** — this is the important corrective. `DYfk` measured 13 of its ornament's 14 attacks landing **on** a melody onset and concluded separation was register + patch, not rhythm. `DalZ`'s top ladder accents the same downbeats the lead substitutes on, "so the substituted note is doubled at the top of the mix." And `Da3c` places its coincidence: on the & of 3 of bar 2, two layers hit D6 in unison with a third adding C7 — "the pre-cadential note is the one instant the whole ensemble strikes together, and it resolves onto C6 on the next downbeat."

**No layer plays a chord in 6 of 9 reels** (all one source). `Da3c`: "no single layer ever plays a chord, the chord is assembled out of five monophonic lines" — on beat 2 of bar 2, three layers each contribute one note (Eb6 + F6 + G6) over the lead's Ab4.

---

## 4. ENTRY / EXIT

**8 of 9 reels state explicitly that nothing fades.** Verbatim: "no fades anywhere in the piano-roll build"; "no automation clips, no volume rides and no filter sweeps anywhere on screen"; "a layer is either drawn or not drawn"; "not a single fade or volume ramp in the reel, and nothing ever drops out."

**But this is mostly format bias and must not be read as an arrangement finding.** These are build videos shot on a looping piano roll — an additive-only sequence is what the format *is*. Only 2 reels show an arrangement at all:
- `Db04`: at the "final result" every clip **cuts in together at bar 139**, and the kick/clap clips before that bar are drawn **dimmed/deactivated**. So muting-for-a-section does happen there — via clip activation, not a fade.
- `13-20-54`: a single long crash on beat 1 of the section, decaying ~4 bars, marking where the full beat drops.

**Transitions are marked by a one-shot, not a ramp** — 2 reels / 2 sources (that crash; `Db04`'s "laser downer," one swept FX note per section). **Zero reels show a layer being removed and returning, a filter sweep, a riser, or a gradual entry.**

---

## 5. WHAT IS NOT SUPPORTED

1. **Anything as "the corpus says."** 6 of 9 reels are one person. Rules 2, 3 and 5 below, and roles D/E/H, are **single-source**.
2. **Any key or mode outside minor.** All 9 reels are minor — C minor ×5, plus D, E, F#, and one Eb/Cm chromatic region. Zero major-key, zero modal/exotic, zero Phrygian-dominant, zero non-Western evidence. Nothing here transfers to desert, jungle or any modal lane on its own authority.
3. **Any progression.** 4 of 9 (all one source) are the same descending minor loop landing on V (i-bVII-bVI-V, i-bVII-iv-bVI-V, i-bVII-iv-v, i-III-VI-V). That is one producer's habit, not a finding.
4. **Drums.** 2 of 9 reels, contradicting on the kick. No hat rule, no perc rule, no fill rule is supported.
5. **"Density falls as register rises."** Stated in `13-25-13` (8 → 2.5 → 3.5 → 3 notes/bar up the ladder) and **contradicted twice**: `Da3c`'s high #3 carries the only continuous 8ths in the project, and `DY77`'s high melody (4/bar) sits over a low answer at 1/bar. What generalises is register *separation*, not a density gradient.
6. **"The second line fills the lead's rests / density inverts."** `DYfk` **explicitly refutes** this: "DENSITY IS NOT INVERTED — the ornament tracks the melody's activity curve at roughly half density (melody 4-8-4-8, ornament 2-4-2-6), thinning on the melody's static bars and thickening most in the bar-4 turnaround." `Da3c` shows the opposite behaviour. Both occur; neither is a law. **Note this contradicts D102's corpus figure (ratio 1.57, denser in 63.9%) — do not treat the reels as confirming it.**
7. **Rhythmic independence as a requirement.** Two reels measure the top layer landing *on* the lead's onsets by design. Shared onsets are not the defect here.
8. **Timbral diversity.** Layers are numbered instances of the *same plugin* (four Serum2s, three Surge XTs). `DY77` states it: "the layers are separated by REGISTER and RHYTHM, not by timbre." This is **counter-evidence** to a same-instrument-is-the-defect rule, and it conflicts with D102's 69.3% different-GM-family figure. Different data types (preset instances vs GM channel declarations) — flagging the conflict, not resolving it.
9. **Dynamics.** Zero evidence of any gain shaping, and two reels of positive evidence against: `DZS8` checked the velocity lane and found "all 64 notes uniform at maximum, no dynamic shaping at all"; `DalZ` shows 32 evenly spaced stems. Every musical decision in these reels is pitch, register, duration or placement. Nothing here supports pad-breathing or per-bar gain waves as a layering device.
10. **Song form.** Every reel is a 2- or 4-bar loop. Nothing supports any section, bridge, breakdown, intro or turnaround-at-bar-32 rule. The one section-level observation available is `Db04`'s "everything cuts in together at bar 139."
11. **How many layers is right.** Counts run 3–10, are lower bounds (one reel's last layer was unfinished at the cut), and `13-20-54` proves the shown build omits layers that exist in the project.
12. **That any of it sounds good.** These are visual piano-roll transcriptions; `DYfk` states "Audio was not analysed." Several onset claims (`DY77`'s interlock, `Dcbb`'s dotted-quarter cycle) are pixel arithmetic off single frames — `Dcbb`'s was cross-checked at two zoom levels, `DY77`'s was not.
13. **`Dcbb` as a whole reel.** 3 of its 5 named channels (Kontakt, Purity #3, Omnisphere) are absent from the transcription; `13-20-54` has no readable tempo.

---

## 6. ENGINE-READY RULES

Deliberately omitted as a rule: **chords are 4+ notes, frequently inverted, with a wide bottom gap and a clustered upper structure** — 3 reels / **3 independent sources**, the best-attested finding in the whole set, but already engine law (D98). Treat the reels as independent corroboration of it.

**R1 — A new layer is existing material re-registered, not new material.** Generate layer *n* by taking an existing layer's pitch sequence, transposing it by ±12/±24, and changing its note-value class and onset offset. No new pitch class is introduced. *6 reels / 2 sources* — `13-25-13` ("separation comes entirely from register, density and note length, never from new harmony"), `DY77`, `DYfk`, `DZS8`, `DalZ` (bass = lead's downbeats −8ve; counter = lead's oscillation +8ve), `Db04`. This is D99/D100's companion generalised: the same rebinding at +12 and +24 with different note values yields the second and third "layer with its own melody" without casting new voices.

**R2 — Freeze the body, move one slot.** In any repeating figure, bind exactly ONE token to the harmony (root/bass) and hold every other token as a fixed scale pitch for the whole loop. The frozen tones re-colour themselves as the chord moves. *4 reels / 1 source* — `DZS8`'s frozen F#+G reads 9+b3, then #11+5, then 5+b6 across three chords without changing. This produces the 9ths/11ths above the bass that D98 wants without choosing them, and it varies by re-harmonisation rather than by substitution (the D101 distinction).

**R3 — Parity-gate a support layer into hold-bar / move-bar.** Even bars hold one whole note; odd bars walk stepwise in the chord scale and land back on the held pitch at the next hold. Strict 2-bar period. *4 reels / 1 source* — the most-repeated device in the corpus, and it is one person's. Generalises across keys because the walk is defined against `chordScale`, not by interval.

**R4 — Allocate disjoint octave bands first; on a forced collision, separate by note-value class, not by voice.** *7 reels / 3 sources* for register-primary; *2 reels / 1 source* for the collision clause, both explicit about the intent. **Flag: this partially contradicts D100's fix** (which kept the shared voice and moved the rhythm) and D102 (same instrument = the defect). The reels say a shared *instrument* is fine when the octave band and the duration class differ; they never separate by timbre at all.

**R5 — Give exactly one layer double the loop period.** Its second statement is the first transposed up an octave, or with its held pitch changed, or with its two-note move inverted from falling to rising. *3 reels / 1 source* — `DY77` (bars 3-4 = bars 1-2 up an exact octave), `Da3c` (#2's held pitch C6→G6 and its moving pair inverting; #5 "the only thing in the arrangement longer than 2 bars"), `DalZ` (the ladder jumps an octave at bar 3). Mechanism for change that is not section-locked: key one layer's seed on `floor(bar/2)`.

**R6 — Give one layer a cell length coprime with the bar.** A 3-unit cell in an 8-unit bar restarts on a different metric position every bar and realigns only every 3 bars — variation with zero note edits and no section boundary. *2 reels / **2 independent sources*** — `Db04`'s keys (3-eighth cell; also its bass at dotted-8th 3/16 spacing) and `Dcbb`'s Purity #2 (a chord every 3 eighths, verified at two zoom levels). Thin on reel count but it is the only structural device here confirmed by two different producers, and the only one that produces change without a boundary — directly the standing r17 ask. `Db04` also shows how to end it: **break the cell** at the phrase close into a stepwise descent that introduces a pitch the cell never contained.

**Near-miss seventh (stated here, not promoted):** the loop's **final bar is where every layer breaks its own pattern simultaneously** — floor splits and displaces by an octave, ornament hits its densest bar, chord voicing spreads widest. *5 reels / 2 sources* (`DYfk`, `DZS8`, `DalZ`, `Da3c`, `Dcbb`). Worth building, but 4 of the 5 are one producer.
