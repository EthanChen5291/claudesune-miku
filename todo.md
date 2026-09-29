## NEW — r44: your three combination-lab notes, answered (2026-09-14; D150)

Your notes were rulings, not complaints, so this round turned each one into a rule.
**The verify pass then blocked my first version and it was right about three
things** — what shipped is the corrected version.

**"This group volume should be reduced" was a real hole in the engine.** Support
gain has always been checked per NOTE, and every layer passes that check (the
ostinato runs 0.20–0.53× the lead, median 0.44). Your ear integrates the BAR, and
per bar the cell group runs ~3–4× the lead. Your own two numbers drew the line: the
group you asked to reduce measures **3.77×**, the +8ve violin group you said nothing
about **2.55×**.

- the lab's cell group is **22% quieter** (−2.2 dB) — 3.77× → **2.90×** on the bed
  you were working, 2.02–3.77 → 1.56–2.91 across all nine. Gain only, nothing
  structural, and every cell/violin pair keeps its ordering.
- **Nothing you have judged moved.** My first version trimmed four of the eleven
  older serious songs too — and the pass caught that the trim silently re-rolled
  their layer ENTRY TIMING (9 layers changed which bars they play; sr_gate's cello
  lost its crescendo and jumped in at full volume, which is the exact thing you
  complained about on sr_ashes in r41). Cause: an internal sort hashes each layer's
  text, and the text contains its volume. The cap is now scoped to songs you have
  never heard. The underlying hash bug is written up and needs its own round.
- honest limit: the cap's number means different things on the two pages (2.9 on the
  lab, ~5.6 on the sung page, where the "lead" it compares to is the quiet guide
  under your voice). The lab is where your ear was, so that is the number I tuned.

**"Bass melodies like the zoltraak one sound really good" — the engine could not
play one.** Every stack named its figure as a literal string, so eleven songs drew
on 3 cells and 2 basses out of 16 each, and the walking basses were reachable from
no song. You'd already said this in r41 ("more patterns than the one in the
beginning — you've used that for like 3-5 songs"; it was four). Slots now rotate
through pools built only from figures you clicked or praised, walking basses
weighted double — and **the chosen figure is written into the song's row**, because
otherwise it would silently revert to the old default the moment you wrote a note
about it.

**Five new serious songs** on `audition/serious.html` (16 now): sr_relay drew the
Zoltraak walk, sr_tide and sr_verdict the lament bass, sr_march the offbeat bass,
plus two new cells and two new riffs.

**"Dont overlay (comes up to be greater than 3)"** is pinned as a per-group cap:
within one group the layers share a voice and a register, which is where five
violins turn into a wash. **Tell me if you meant three layers TOTAL** — I read it as
per group because the total reading contradicts your standing "more layers" ask, but
it is your call and I did not want to guess silently.

**What the verify pass caught in my work** (all fixed): the entry-timing re-roll
above; the five new songs' figures reverting on your first note; and the cap making
a violin double exactly as loud as the cell it doubles on one pair. It also caught
me printing the wrong octave on 117 lab chips — the +8ve violin group said it was in
the cello's octave — and a scripted edit of mine that landed in the wrong song
(caught before the build; two rows share the id "march").

- songs.html 47/47, cells.html 23/23, and all eleven older serious songs
  byte-identical. npm test 481/482 (the known suite race).
- **Renders**: nothing judged changed, so nothing is stale; the 5 new songs have no
  HQ or vocal render yet. Say go and I will run them.
- Separately, the pass found the **HQ-stale badge can never fire on songs.html**: it
  needs an `audition/hq/<name>.mixsig` sidecar and not one of the 47 has one, though
  all 47 show "HQ". It works on the serious and cells pages.

## NEW — r43 second pass: you were right, it was HQ (2026-09-14; D149)

Your question *"is it just HQ?"* was the diagnosis. Yes — and neither mechanism was
the reverb, which is why two passes of turning reverb down changed nothing you
could hear.

**First, I fixed the wrong page.** The pass before this took `mixlab.html` dry and
left `cells.html` — your export's page, the one with the HQ button, the one where
"just play one cell" is a card — at **736 reverb sends and no clips**. Your own
words named the page and I went where the recent work was.

**The HQ smear is one number.** Every string on both labs rendered through
`strings-sections.sfz`, which holds each note for **0.7 s after it ends**. The labs
write sixteenths — 0.107 s at 140 bpm. So one cello layer had **about 8 notes
sounding at once** before you ticked anything else on. That is "it fills up everything" and
"i cant layer them properly", and no mix control can reach it.

**The samples never decay** — half a second after its own peak, a sustained note
is still within 3–8 dB of full (the cello is *louder*, because it's still
swelling), where a struck one is 17–50 dB down. VSCO's sustain peaks *5.25
seconds in*, so last pass's "shorten the sample" took the first second of a
crescendo. Shortening a swell doesn't make a note decay.

**And one thing I got wrong and then caught.** My first version of that
measurement said "the violin never decays at all" — because **all eleven violin
samples in the pack were digitally silent.** The pass before this introduced it:
the trim's fade-out was computed on the wrong timeline, so 20 of 88 notes encoded
to nothing. That's the real answer to *"it also overpowers the violin sound"* —
the violin group wasn't quiet, **it wasn't there.** Fixed, 0 of 88 silent, and the
conclusion above is the re-measurement, not the broken one.

**So the fix is the articulation, not the mix.** VSCO ships **spiccato** and
**pizzicato** for all four sections and we had never used them: struck, 20 dB down
in 0.25–0.35 s. Both labs now play those, in *both* tiers — which also answers "with
HQ off it sounds bad", since the browser now plays the same real samples the
renderer does instead of the GM soundfont.

- **cells.html: all 23 cards re-rendered**, dry, on the struck samples. Voice-only —
  verified byte-identical on every (time, midi) pair, so nothing you judged moved
  musically.
- **Tempo is a button, default 50%**, as you asked. At half tempo a sixteenth is
  0.21 s instead of 0.107, so notes of one cell stop overlapping *at all* — the
  layers separate by arithmetic, not taste.
- **Strings is a button**: spiccato / pizzicato / sustained.
- **The contrabass was a stretched cello.** The section patch has 27 cello and 6
  violin regions and no contrabass at all. It has its own patch now.

**Your ambient note is kept, not overruled.** *"this level of reverb sounds good for
really ambiant vibes and moody days - it does fit a genre"* — so the sustained
samples stay one click away, the wet reverb setting is now **named "ambient /
moody"** instead of being the thing to avoid, and the whole setting is recorded as a
technique row (`sustain_wash_ambient`) with the measurement and the test for when it
fits. Same three numbers, one context wrong and one right.

**One thing I deliberately did NOT change.** "It also overpowers the violin sound":
the violin sits **3.0 dB under the cello** (0.34x the lead against 0.50x), by design
— a double is quieter than the line it doubles. But the *other* half of that
sentence is the bank I measured with no decay at all, so the articulation change is
the candidate explanation for both halves. Changing the gain in the same pass would
make it impossible to tell which one worked. **Say the word and it's one number.**

## NEW — r43: a lab you can COMBINE layers in, and two grid bugs you caught (2026-09-13; D148)

Your ask: *"create a lab where you create more of these and extract more from our
energetic MIDI songs to analyze. next lab, allow me to combine different layers by
enabling multiple at a time, then press something to leave a note either individually
for that song or for the group, and i can do this multiple times with an extensive
list with a diversity of serious ones."*

**New page: `audition/mixlab.html` — 9 beds x 51 layers, tick any combination.**
Not a list of finished mixes: a mixer. Every layer is bound separately over that
bed's harmony and plays all 32 bars, so **what you tick is exactly what you hear**.
Tick, press play, re-tick while it runs.

- **9 beds** = 9 different progressions at 9 tempos, 88 to 152 — because you said
  twice that it *"depends on the chord progression"*. One of them is serious CALM,
  since energetic is not the only serious.
- **51 layers**: 14 ostinato cells · 16 basses · 8 riffs · 3 stab figures · a pad ·
  5 harmony-hand voices · the tune and its two doubles · the kit.
- **Notes go three places** — on one LAYER, on a whole GROUP (so you never type the
  same sentence onto four bass cards again), or on THIS COMBINATION. They pile up in
  a list instead of overwriting, and **each note saves exactly which layers were
  playing when you wrote it**.
- **No HQ on this page and there cannot be** — 51 layers is more combinations than
  can be pre-rendered. It is for judging patterns and combinations, not timbre.

**You caught two real bugs and they were the same symptom.**

- *"should be aligned by measure - the next chord shouldn't come in like a half step
  early"* — the 16th motor is a **triplet** figure in the source and I had written it
  on a sixteenth grid. Five of its eight notes were a third of a sixteenth out, and
  the last one got pushed hard against the barline where the file leaves a gap. Fixed
  as a new row; both are on the lab so you can pick straight or swung.
- *"I feel like it's not 4/4 - the next chord is always coming in like an eight note
  too soon"* — that cell is the **lower half of a two-hand texture**. The file plays
  all sixteen sixteenths; the hand I left out is the one that fills the holes. The
  complete texture is now a layer.

**Also: the "vibraphone" is the harmony hand, and I fixed the wrong layer last time.**
Six cards now. It is `gm_epiano1` — the accompaniment, exactly where you put it: *"the
one in the harmony that does the chord repeats and stuff, not the one that plays the
melody"*. r41 moved the COMPANION instead. It was also running at roughly **twice the
volume of the tune** on all six fight songs. Now a piano, and under the tune (0.58–0.99x).
The lab's ACC group lets you pick the voice properly — piano / clean guitar / harp /
the electric piano you keep rejecting, same figure, four instruments.

**18 new patterns mined from 52 of your own MIDI files** (the ten serious references
plus the Vocaloid set) — 984 repeated one-bar cells, of which **84 are on a TRIPLET
grid and the library had none**. Includes the four "bass with its own melody" lines you
asked for, and a descending riff that this time is measured rather than invented.

Read-out: `research/cells-r43.md`.

**On "allow HQ on for all of them" — I couldn't, so I did the other thing.** 64
togglable layers is more combinations than can ever be pre-rendered; the only design
that reaches arbitrary combinations is playing per-layer stems in sync, which costs
hours of rendering, ~300 MB, and a timing risk I can't test from here. So instead
**the strings now play the renderer's own samples in the browser** — every cello,
violin, viola and bass layer is the VSCO section straight from the sample pack, with
the same de-swell trim sfizz applies. That's 44 of the 64 layers. The brass, guitar
and keyboards are still the browser soundfont; **tell me which of those sounds wrong
and it gets the same treatment.** (If you'd rather have literal HQ stems despite the
sync risk, say so and I'll build it — it's a render job, not a design problem.)

**The violin is in**, one toggle per cell: the same cell an octave up on the VSCO
violin section, under the cello in level. Verified note-for-note at exactly +12 on all
thirteen. Tick a cell and its violin twin together to hear it as a section.

**The damper pedal was real and it was mine.** 43 of the 64 layers had no note-length
limit at all, so every note played its whole sample — and the VSCO samples I'd just
added are 3 seconds long while a 16th at 140bpm is 0.107 s. Each note was ringing ~28x
too long; the cell had about 45 copies of itself sounding at once. Every layer now
stops when it's written to stop, and the reverb went from 0.2–0.25 down to 0.08 (0.12
on the tune).

**Then you said it was STILL ringing, and the clue was "it reverberates for a few more
secs after I hit stop."** That's the reverb bus — stopping the pattern stops the notes,
not the tail, so any reverb at all outlives the stop button. And one cell filling
everything meant the note-length control wasn't reaching the sampler, which I can't
test without a browser. So I stopped tuning it: **the samples themselves are now 1.0 s
instead of 3.0** (1.6 s for the bass, which has the longest written note), and **the
page is completely dry** — no reverb anywhere — with a fast release on every note.
Nothing downstream can make a one-second sample ring for three.

**And both are now buttons**, because I've fixed this blind twice: **reverb** (dry / a
little / more) and **note length** (shorter / as built / longer). If it's now too dry
or too clipped, that's a click, not another round.

**The dynamics were real too, and more specific than "med-soft".** The patterns write
accents from 0.55 to 1.0 — a proper accent — and the gain band squashed them into a
**1.14x** wiggle, about 1 dB. Everything measured 0.190–0.208. They now realize
1.36–1.49x (~3.5 dB), and the *ceiling didn't move* — the loudest note is the same
note, the soft ones got softer.

**And it balances as you combine.** The stack is normalised by how many layers are
ticked (equal-power against the 7-layer suggested stack: 3 layers → ×1.53, 30 → ×0.48),
so adding a layer changes the texture instead of just the volume. There's an
**auto-balance** button if you want to hear the raw levels instead.

**The new lab found a bug on its first build.** The layer that plays the tune a THIRD
BELOW is sometimes a sixth ABOVE it instead — a few notes a song, every one of them
exactly an octave off where it should be. It is the writer's degree shift wrapping
round inside the octave. `serious.html` shows none of it only because that layer enters
late there and misses the bars where the tune dips. It is on the lab with a caveat
printed on it, because it is a device you asked for and I would rather you judged it
knowing.

### Still yours to decide
- **The 16th motor on `sr_duel` / `sr_vanguard`** stays STRAIGHT until you rule. The
  triplet version is the correct transcription, but swung-vs-straight changes the feel
  of two songs you are mid-judging — A/B them on the lab (`riff_motor16` vs
  `riff_motor_tri`).
- **`sr_loopcat` still runs its electric piano at 1.51x the tune.** Left alone because
  your note is "I like it!".
- **The acc fix re-rolled the crescendo shapes on the six songs it moved** — 27 of 168
  entry envelopes changed their stagger and 13 swapped ramp length (8 lost the six-bar
  one r41 added for your "it should ease into its volume more fluidly" note). Cause:
  the entry stagger is ordered by hashing each layer's own expression TEXT, so editing
  a gain re-sorts it. Not fixed in the same round as the voice change, because any fix
  moves the stagger again and you'd be judging two things at once. Say the word and
  it's a small, separate change.
- **Carried from r42, unchanged:** the two-basses guard on six serious songs; the four
  stale sung pages (vocal / vocaloid / vocarock / vocalab); the cinematic snare sample
  (`vc_snare_mil` — the HQ renderer clamps it and still reports it 2.9–3.7 dB low on
  every song, which is the same defect measured a second way).
- **Every serious page still plays a hash-picked progression rather than the loop its
  card names** — the bug is found and fixed, but switching the judged pages onto their
  declared loops would rewrite their harmony, so it is gated to the new lab.

## NEW — r42: variations of the cell, and the bass (2026-09-13; D147)

Your ask: *"the cello harmony that you added into the high energy songs (like the
one where it's rising and repeating) is good but there should be more variations
of those ... falling instead of rising, 3 notes instead of 4 where the fourth note
is the root again, different intervals, different patterns. MOREOVER, they also do
the bass too in the attack on titan, and other patterns besides this - I want to
hear them individually and variations of them for the energetic songs."*

**New page: `audition/cells.html` — 23 cards, one bed, one variable each.**
Every card is the same song (same key, tempo, harmony, kit, tune) with exactly
ONE figure swapped. **The layer under test plays alone for the first 8 bars**,
then the build enters on top of it one layer per section — which is how attack on
titan introduces its own cell, and it is what "hear them individually" needed.
Each card is ~55 seconds. All 23 are rendered in HQ.

- **9 cell cards** — the one you have, plus falling, three-notes-then-the-root,
  an arch, scale steps instead of thirds, fifths-and-octave (no third at all),
  an octave leap, every-note-struck-twice, and the OTHER cell attack on titan
  plays (bars 21–28, which nobody had transcribed: five 16ths, a half-bar rest,
  then the same five landing a step higher).
- **10 bass cards** — the two you have, plus octaves on straight 8ths, the
  opening's two-hits-a-bar-with-the-second-moving, the push with a fifth on beat
  3, the 3+3+2, the fifth pump, low-high-low-high, the walk down, and the one
  that never plays the downbeat.
- **4 riff cards** — the chorus riff arching, the same riff DESCENDING, the 16th
  motor, the 3+3+2 stabs.

**Where they came from: 9 measured, 8 yours.** Each card says which, and the
measured ones name the file, the bars and how many times that file plays it.

**Two of those labels were wrong and an adversarial pass caught them before you
did.** I had a verifier re-open each source MIDI and try to reproduce my claim.
It refuted two rows and corrected seven. The two that mattered: the "falling"
RIFF card is not what attack on titan plays on its odd bars — that file plays a
FROZEN four-note cell over a moving bass, and its shape turns rather than
falling, so the card now says the descent is yours and not the file's; and the
ReawakeR bass does strike the downbeat (with a lone high octave) — what never
lands on beat 1 is the weight. Both cards are fixed and re-rendered. You judge
the card, so a card that mislabels where a shape came from poisons the verdict.
Attack on titan turns out to play **six** bass patterns across its 104 bars; its
single most repeated bar is the push we already had. And "falling instead of
rising" is in the file itself — the chorus riff arches on even bars and descends
on odd ones, every bar of its biggest section. The read-out is
`research/cells-r42.md`.

**Three things I found that you did not ask about:**

- **The serious page runs two basses on six songs** (gate, oath, duel, hunt,
  vanguard, resolve). The r41 rule that was meant to stop that has
  a typo and has never run once. I have NOT fixed it: you heard this build and
  said "it's better!", and fixing it would delete a bass from all six. Say the
  word and the next round puts a card each way in front of you.
- **vocal.html, vocaloid.html, vocarock.html and vocalab.html on disk are stale
  builds** — rebuilding them moves 11 songs, and (except on vocalab, which is
  older still) every change is one r41 cymbal timing constant. I left all four
  exactly as you last saw them; refreshing them would mark their renders STALE,
  so that is your call.
- **The test that kept failing at random** was not what I said last round. Two
  other test files rewrite `src/lib/verdicts.js` — the generator's own input —
  while the determinism check is building, so its two builds legitimately
  differed. They now take a lock. Three suite runs in a row at 458/458, where it
  used to fail two runs in three.

- **The serious kit's snare is the quietest sample in its folder** — it points at
  the softest velocity layer of a stick-on-*rim* hit, 13.9 dB under the on-head
  layer sitting right next to it in the same library. That is a second reason
  the percussion doesn't read as serious, separate from the kit choice I fixed
  last round. Changing it re-renders every cinematic-kit song, so it is queued,
  not done.

**0 of your 10 judged pages moved. 458 tests, 458 pass. Nothing committed.**

## NEW — r41: your two serious exports answered (2026-09-13; D146)

Your headline: *"overall better but the songs that require seriousness/energy dont
have that yet, and i sometimes cant tell that layers are added. bear in mind that
bass is also a thing because i dont hear much bass."* Instrumental only, as asked
— **0 re-sings, the sung voice was reused on every song.**

**First, an apology that explains half your notes.** Between your two exports the
page was rebuilt but the wavs were not. With **HQ on** you heard 12:17 audio
against a 14:32 page; with **HQ off** the browser played the new mix but not the
render-tier fixes. That is why one card said "percussion is better" on a song
whose percussion had not changed, and two repeated the vibraphone complaint on
songs where the vibraphone was already gone. **Fixed so it cannot recur:** the
renderer now records which mix it rendered, and a card whose wav is older than its
mix shows a red **HQ STALE** badge and says so in the now-playing line.

**The pitched percussion in the harmony** — you located it exactly ("the one in
the harmony that does the chord repeats, NOT the one that plays the melody"). It
was the companion, and it was `gm_vibraphone` on 7 of 11 because the pool has
three members and the filters removed two of them. Now five serious voices —
viola, tremolo strings, pizzicato, harp, organ.

**The string VST was genuinely broken, not badly written.** The patch builder set
each instrument zone's floor but never capped the one below it, so the cello's top
region ran to key 71 while the violins started at 66 — and every note in between
sounded **a violin section and a cello section at once**. That band is where the
melody lives: hunt had 66% of its notes there, expanse 58%, gate 39%. Before: keys
66–71 doubled. After: none. It is also why you rated ashes' melody voice "better
than the other ones" — its viola has no patch at all and quietly falls through to
a plain soundfont, so it never touched this.

**"I can't tell the new layers" was my arithmetic error.** Every added layer was
scaled against the *instrumental guide* — the placeholder that plays at 45%
because the VOICE is meant to carry the tune. But the voice isn't ducked, so the
layers came out at **0.19x the real melody**. They are now 0.35–0.61x, **1.6x
louder**, still safely under the tune.

**The bass** — also mine. r40 stood the moving bass down whenever the stack
declared one, but on seven songs (every energetic one) the stack's bass was a
**one-note-per-bar pedal**. Meanwhile the muted guitar sat in the same register
2.16x louder. Every energetic song now has 3.9–6.0 notes/bar of real bass under
the pedal.

**The Attack on Titan patterns — the figure you asked for was already in the
library and the stack named after it never used it.** Counting how often every
one-bar cell repeats (rather than reading bars by eye), AoT's most frequent cell
— **16 times, the top cell in the whole piece** — is the left hand striking an
octave on the off-beats. That is `sr_bass_push`, encoded in r40, whose own note
says "attack on titan bars 68+". It now enters at section 3, so the pedal holds
early and the push arrives on top, which is what the source does.

**The percussion is a different battery now.** Every serious song was on a pop kit
— kick, snare, hi-hat. The orchestral samples have been sitting in the pack
unused. Six songs now play **war drum, military snare, frame drum and timpani,
with no hi-hat at all**.

**The cymbal you said I'm "still using"** was one hardcoded sample at every
section change — six times on sr_gate, the identical one-shot on every song. Now
capped at three and rotated across four impacts, each placed by its **own measured
peak** (they range from 0.35 s to 6.00 s, so a shared offset would have put one
four bars late).

**Pinned on your words:** sr_summit ("no complaints", twice) and sr_ashes ("love
it") — both byte-identical through everything above. Also vg_excited_fight on
vocal.html, from your heads-up.

**Not done, and I want to be straight about it:** your sr_gate note that it
"sounds like a nice casual vocal whenever there's multiple voices" is a VOCAL
change, which you asked me to hold off on. Whether vanguard's melody instrument
should change at all (you like the trumpet, it's just loud) is still your call.
And the octave/third doublings still read as thickness rather than as separate
layers — that is the next real piece of work on "I can't tell the layers".

## NEW — r40: serious songs (2026-09-13; D145)

Your ask: *"i just want more serious prompts to have more serious vibes … in
attack on titan you can literally see them come in one by one … the main
theme/voice has a very strong, slow ish theme when it's the main thing, but it
has a lot of layered support."*

**New page to listen to: `audition/serious.html` — 11 songs, nothing judged yet.**
Build it with `SERIOUS=1 node scripts/audition-songs.mjs`.

I read all ten files you attached, bar by bar. What came out:

- **The engine was already DENSER than your references.** Simultaneous notes:
  your files 2.9–5.9, our vocarock page 6.2–9.3. We already play more at once
  than Attack on Titan. So "more layers" is not more notes — it is a slow theme,
  layers that enter one at a time, and support locked to the theme's onsets.
- **The theme.** Yours: 1.6–3.2 notes a bar whatever the tempo, notes lasting
  0.54–1.99 beats, **15–54% dotted values**, leaps of a fifth or more 9–45%,
  phrases starting on a beat. Ours: 5–7.5 notes a bar, 0.25–0.5 beats,
  **0% dotted on every single song**, leaps 2–8%. The melody writer now has a
  THEME mode and the new page realizes 2.1–2.8 notes a bar, 5–38% dotted,
  phrases on a beat 76–100%.
- **Your Attack on Titan left hand, measured exactly.** Bars 9–20, alone, over a
  twelve-bar pedal: `E2 E2 G2 B2` every beat, then `E2 E2 G2 C3` every beat,
  alternating — root, root, b3, 5th with **the top note raised one step on
  alternate bars**. That is now a named figure and it opens three of the songs.
- **Layers one by one.** Attack on Titan changes texture every ~5 bars;
  Interstellar's First Step adds five layers in eleven bars without the harmony
  moving. Each song now names an entry schedule: which layer joins at which
  section, in what register, at what fraction of the lead. Voices per bar climb
  1–3 → 6–13 across a song (the old page: 1 → 4–8).
- **"Even if it's virtually the same notes with an interval or octave tweak."**
  Measured: 63–100% of theme strikes in your files carry a second note struck
  with them — an octave below (Muzan: 166 of 177) or a third below (79 in the
  Sun theme), a fourth in Naruto. So the theme now gets an octave-below double
  on a different instrument and, in the last chorus, a third-below one. Verified
  at −12 semitones on 100% of shared onsets.
- **Vocals are not constant.** Nine of the eleven rows name sections where the
  voice rests and an instrument states the theme instead (8–24 bars each).
- **Harmony**: Aeolian, no leading tone (yours: 0–3% of pitch weight), one chord
  a bar, ten loops each citing the file it came from.
- I also did the orchestration reading you asked for — the useful part is that
  the textbooks say the same thing your ear has been saying for four rounds:
  *"the doubling must be quieter than the main line."*

**Your nyan cat / Ievan Polkka idea is on the page too** — two cards
(`sr_loopcat`, `sr_scatpolka`) where the voice is an instrument: a fast cell
that never re-rolls, wordless syllables, doubled an octave down by a synth.
Two of eleven, as you said — the rest sticks to the current system.

**One more thing I found while checking what you'd actually hear**: a sung page
plays its melody instrument at a 0.45 guide because the voice is supposed to
carry the tune — so before the vocals are rendered, the browser mix has a hole
where the melody goes. The instrumental twin that fixes this has existed since
r37 and no page could play it. There is now an **`Instrumental: off/ON` button**
next to HQ and Vocal — turn it on to hear the full arrangement with the melody
at full level. Use it on this page; the vocals are not rendered yet.

**Nothing else moved**: songs 0 of 47, vocarock 0 of 10, band 0 of 12, vocal
0 of 16, layerstack 0 of 14, reels 0 of 16 — byte-identical on every field.
`npm test` 448/448.

**The verification pass found four real problems and I fixed them all.** It
refuted one of my own claims outright: two of the new layers (the octave bass
and the octave theme double) were running *louder* than the tune on nine of
eleven songs — the old "support" multiplier was bigger than the duck the lead
itself takes under a voice. Worst case was 1.23x the lead; it is now 0.83x and
nothing is over. It also caught the octave double playing 19% of its notes below
its instrument's range (which would have folded octaves in an HQ render and
broken the very octave it exists for), a two-bar hole on one song where neither
the voice nor the stand-in instrument played, and one song whose layers had
nowhere to build because it had no intro.

**And it caught a bug in a fix I made this round.** The "Instrumental" button
above plays a twin mix that was supposed to differ from the real one only by
un-ducking the melody. It doesn't: it was also missing the piano and drum trims
that came from your own "piano too loud" notes, so its kit ran 1.1–1.4x louder
than the judged mix on every song with drums. That has been true since r37 and
was inaudible until I made the twin playable. Fixed, with a test. One
consequence: the twelve `bd_*.instrumental.wav` files were rendered from the
untrimmed twin and are now stale — say the word and I'll re-render them.

**The verifier's final pass said do-not-ship, and it was right about four
things.** All four are fixed: a second sung voice was still singing through the
sections where the card says the voice rests; the octave double was playing
below its instrument's range; on the two calm songs the pad was advertised and
inaudible; and the piano accompaniment was the loudest thing on the page at up
to 5.4x the melody. That last one is your "piano too loud" note, seven times
over, so it now uses the same cap the reels page already got — the accompaniment
now sits at 0.71-0.95x the melody with the Instrumental button on.

**One thing it said that I did not change, because it is what you asked for.**
It points out that the octave double, the third double and the harmony voice are
all the same line at a fixed interval rather than independent parts. True. It is
also exactly what your ten files do: 63% to 100% of theme strikes there carry a
second note struck with them, and your words were "even if it's virtually the
same notes or with just a interval tweak or octave tweak, add it". The
independent lines on the page are the ostinato, the answering chords, the riff
and the pad. If it reads as one thick line rather than layers, say so and I will
push the independence instead.

**One thing I measured and did NOT change.** On a sung page the melody
instrument plays at 45% (the voice is meant to carry the tune), and against that
the *older* layers — the piano accompaniment especially — read loud: on the
quietest song the accompaniment runs 5.4x the melody's level. That is the
accompaniment-band question already on the list from r32; it reaches all 47
judged songs, so it is its own round, not something to ride in on this one. The
new serious layers are all measured under the melody. Two practical notes: turn
the **Instrumental** button on while you listen (it un-ducks the melody and most
of that imbalance goes away), and if a song still sounds accompaniment-heavy,
say so and I will take the acc band as its own round.

**Honest note on my own measurements**: two of my probes were wrong before they
were right. One scored a bass that plays nothing but roots at "55% out of
chord"; the other compared solo layers (which are unmasked and bound to the
verse harmony) against the mix and briefly accused your judged vocarock page of
a chorus harmony conflict that does not exist. Measured properly in the mix, the
new page's friction is at or below the page you called good.

### r40 addendum — the renders, and a pin on vg_excited_fight

**"I can't hear the vocals."** Correct, and it was not a mix problem: the page
had **no renders at all** — `hq: false` and no vocal file on all eleven, so
HQ-on played the browser synth and Vocal-on had nothing to reach for. What you
heard was the live mix with the melody ducked to its 0.45 guide and no voice
over it. All eleven are rendering now (harmony pass then lead pass, tune 0.7 /
room 0.1 from the page pins), ~7.5 min each. **Why so long:** three quarters of
it is RVC, which runs twice per song (two sung voices) and is frame-by-frame
CPU inference — HuBERT features, RMVPE pitch, the net, a faiss lookup. The band
is the cheap part: 39 s for thirteen stems.

**Done, 12:00–13:28. All eleven have HQ + VOCAL badges and download links now.**
0 warnings, 0 failed stages, **0 octave-wrong notes on 11 of 11**, and the two
sung voices say identical words at 100% of shared onsets on all eleven. Frames
within 50 cents: summit 96, gate 95, ashes 95, expanse 94, oath 94, duel 94,
vanguard 93, resolve 93, hunt 88, loopcat 86, **scatpolka 70**.

*The files live at `audition/hq/` — open that folder directly if you'd rather
not use the page buttons.* `<song>.withvocal.wav` is the mix with the voice,
`<song>.wav` is the band alone.

*The one low number, checked rather than waved through:* scatpolka's median sung
note is **114 ms** (the nine serious rows are 0.42–1.22 s, loopcat 0.208 s), and
accuracy tracks note length almost perfectly across the page. It is not leaps —
scatpolka's leap rate is 5%, lower than most of the page — and the register is
clean. At 114 ms most of each note is the glide into it, so the voice never
settles on pitch. That is the scat row asking for 6.5 syllables/s at 158 bpm.
**Your ear decides:** smeared, or the instrument you asked for. If smeared, the
fix is one number on that row.

**Your heads-up, recorded:** *"i liked vg_excited_fight's instrumental. not the
vocals for it, but the instrumental"* — that song is on `audition/vocal.html`
(the anime-OP / J-rock row, 140 bpm). Taken as a prose keep on the band and
pinned so nothing re-rolls it before your click lands. **Please click keep +
export on it** when you're next on that page. Nothing about the sung line was
touched: you've said you don't like it but not what's wrong, and guessing would
churn the half you do like.

**`vl_double_loud` — your "the melody is good, and their jumps are good and the
intervals are good … instrumental wasnt good enough to support it (no appealing
sub harmonies or instrument selection)".** Two things, measured.

*First, the melody is not specific to that variant.* All three `vl_double`
variants (off / on / loud) carry a **byte-identical sung score** — same pitches,
same onsets, same durations, same words. The card only varies an instrumental
octave double in the chorus. So what you like is the vocalab BASE line, and it
is available on all three. Its profile, the first vocal line you have called
good that we have numbers for: F minor, 168 bpm, 16 bars, 84 notes = **5.25
notes/bar**, median note an 8th (0.50 beats), **0% dotted**, and within phrases
**18% repeats / 53% steps / 24% thirds-to-tritones / 5% leaps of a fifth or
more**, range midi 60–77, phrases starting on a beat 50%. Worth noting against
r40: that is the *energetic Vocaloid* shape, almost the opposite of the serious
theme (1.6–3.2 notes/bar, 15–54% dotted, 9–45% big leaps). Both are right for
their own job — "good jumps" here means a mostly stepwise line with a quarter of
its moves in the third-to-tritone band, not a leapy one.

*Second, your instrumental complaint is exact and it names three known laws.*
Measured on the mix:
- **The tune and the accompaniment are the same instrument.** `_lead_mix` is
  `piano` and `_acc` is `piano`. D102 says timbre and register are what separate
  a layer — the tune has no identity apart from its own chords.
- **The descant and the marcato are one layer.** Both on
  `gm_string_ensemble_1` (119 notes over 66 onsets, mean gain 0.156). That is
  D100's "two layers that always strike together are one layer", the exact shape
  CLAUDE.md says to check FIRST whenever you ask about layers.
- **The two loudest pitched parts are locked to each other** — piano and
  `gm_electric_guitar_muted` share **87% / 93%** of their onsets.
- **The rest of the palette is decorative**: marimba 25 notes, music box 16
  (median midi 101), square lead 7 at gain 0.102, counterline 25 at 0.107.

So "no appealing sub harmonies" is literally true: of the four layers billed as
sub-harmony, two are one voice, one is nearly inaudible, and the tune shares a
timbre with the chords. This is the accompaniment/cast round — it reaches the
judged suite, so it is its own round, not a drive-by. Nothing changed yet.

That pin also caught a live bug worth knowing about: `pinFrom: 'r40'` alone
**moved the very song it was protecting** (mix, solos, degrees, symbols,
numerals, cast, treat, ops) because the harmony gate reads a bare
`!opts.pinFrom` — any pin reads as "this song has history, strip the colour
upgrade". That is D101/D123's catch-22, fifth instance. `voicedColor: true`
alongside it is the documented escape; re-measured, 0 songs moved.

## NEW — r39: his first vocarock export answered (2026-09-13; D144)

Your ten cards + your second message ("no song that spews energy yet … more
layers/instruments … lower reverb by default, increase autotune … more synths
… harmonies that ARE ALIGNED"). What moved on `audition/vocarock.html` (page id
`r38-vocarock`, all ten songs re-rendered HQ + lead voice + harmony voice):
- **"the exact same beginning progression"** — it was: one intro riff figure on
  the acc voice over a bass on all ten (a pool of one, the D119 trap). Measured
  19 of 45 song pairs shared 80%+ of their first-four-bar contour. Now every
  row names its intro figure, intro VOICE and which loop the intro sits on
  (five sit on the chorus loop, which opens off the tonic); ghost opens on the
  slap bass + kit alone; lantern's verse loop changed (it shared rooftop's).
  After: 1 of 45 pairs.
- **"too loud and too much reverb"** — the voice took the lead LAYER's room
  (0.25 / 0.7); now a 0.1 room by default (`vocalRoom` pin, `--vocal-room`),
  every row 3 dB under the r36 level table, and a pitch-tune knob (`vocalTune`
  0.7 / `--tune`) that pulls the sung pitch toward the score inside each note
  — see D144 for the measured pitch-hit before/after.
- **"more layers / spews energy / more synths"** — an energy tier per row,
  built to your correction ("doesnt mean a bunch of fast notes … good, catchy
  harmonies with full, energetic, active layers"): high = a phrased synth
  HOOK line in the chorus (six notes a bar with rests, chord tones + scale
  steps) + a four-note pad whose voicing rotates every bar + marcato strings
  (rock) or the r30 synth rise (electro) + a crash on every seam; mid = the
  lighter hook + held pad + chorus descant; low (snow) = pad + descant. My
  first cut was a 16th arpeggio and a tempo bump — reverted before render.
  Voices sounding per bar: verse 4 → 4, chorus 4 → 6, bridge 4 → 6 (thin
  verse, full chorus — the corpus arc); density at audible gain 3 pcs/8th · 1.56
  rubs/bar · 92% spells a chord · 0% out of key (corpus 3 · 1.28 · 90%).
- sugar stays 128 bpm + the high tier; arcade / bike → the tune re-rolled.
- **your calm references (romantic waters / somber citadel / nostalgic
  snow)** — measured: none of the three has drums or a bass instrument; all
  three run a flowing single-note piano arpeggio, a soft four-note pad, strings
  counterline + descant across the song, sevenths on nearly every chord. The
  calm tier (vr_snow) is now that setup — kit off, bass off, Am7 Dm7 F^7 Em7,
  the 16th piano arpeggio all song, pad at a quarter of the lead.
- **your "descriptions are too musical" ruling** — all ten prompts are now
  plain player scenes ("one coin left at the arcade and the place is about
  to close"), more energetic on average; guitar / synth / kit choices moved
  onto the rows so the engine picks them. Every text was parse-checked
  ("high score" read as ORCHESTRAL, "hot chocolate" as casino — reworded).

Open for your ear: the pitch-tune amount (0.7 — 1.0 is a hard-tuned line);
marcato strings sit above the voice on boss (median 77); the chorus synth on
rooftop/arcade shares the sawtooth with the instrumental guide; the RVC model
in use is still `infamous_miku_v2` (the licensing blocker stands).

## NEW — the Vocaloid ARRANGEMENT read-out + `audition/vocarock.html` (r38, 2026-09-12, your "in band.html it fits but doesnt really sound good or catchy … learn from vocaloid songs … create a thing primarily for vocaloid based songs")

Read-out: `research/vocaloid-r38.md` (36 songs; melody identified reliably in
all 36 — 32 name the vocal track, the 3 unnamed ones were re-verified). What
it found, against band.html:
- **The harmony question ("how it's more harmonious than ours"):** what is
  LOUD in band.html is as thin and consonant as the corpus — same pitch
  classes per 8th, same rubs, same out-of-key rate — once the quiet beds
  (guide lead, strings, pad, sparkle under gain 0.25) are set aside. The real
  differences are the **vocabulary** (13ths, `Db9`-in-G vs triads/sus/m7/^7,
  47% thirdless), **one loop per song** vs a chorus with its own loop (35 of
  36), **no bass** (silent in half our windows; theirs on 8ths always),
  **one figure all song** (theirs: verse = single-note line or nothing,
  chorus = 8th block chords with the tune doubled an octave up, 16% → 92%),
  and **form** (16–48 bars, chorus at bar 4 vs 137 bars, chorus at bar 36,
  verse 2 thinned in 30 of 36). The intro is a riff of its own — 0 of 23
  carry the chorus tune.
- **Instruments:** NOT in the files (3-track piano reductions, no program
  changes, flat velocity). The doc's §7 table is knowledge of the recordings
  + VocaDB genre tags (22 of 35 rock-family, 10 electro/chip, 3 pop/ballad);
  the cast law: ONE chordal hand + bass + kit + unison doublings.

Built: `VOCAROCK=1` → **`audition/vocarock.html`** (page id `r38-vocarock`,
10 songs, 52–80 bars): `opts.vocaloidForm` names a verse loop, a chorus loop
(the B letters carry it), verse/chorus/bridge/intro figures, a bass, a form
(intro riff → A A B A B C B, verse 2 with the piano out), from
`src/lib/vocaloid-form.js` — by name only, never a pool. Measured in the mix:
chorus block on 91% of chorus windows, verse line/silent/arp, bass root–fifth
8ths on 81% of chorus windows, octave doubling 25% verse / 100% chorus,
out-of-key 0%. Renders: see the D143 note (started after the last build).
No judged page moved (songs/vocal/band 0 of 47/16/12; vocaloid/vocalab 0 on
music fields against a build from HEAD's generator). `npm test` 439/439.

Open for your ear: the ten vr_ songs; whether an 8-bar verse (two statements
of the 4-bar cell) is enough or the corpus's 16; the breath (still 1 beat on
most songs against the corpus's 8th); slow songs still write 16th pairs
(vr_snow 56% at 84 bpm — the writer's quarter-note phrase finals force it).

## NEW — your first Vocaloid-page export is in (14 cards, 3 keeps, 13 notes) — D140 (r36, 2026-09-12)

Every note measured and fixed; the three keeps (reflection, lullaby, march)
are pinned and byte-identical on their music. **Open `audition/vocaloid.html`
with HQ ON + Vocal ON** once the re-render finishes (every card now has
⬇ wav / ⬇ vocal wav download links; `npm run listen` serves the pages at
http://localhost:8765 if your browser opens the wav instead of saving it).

What your ear found, and what it was:
- **"Indian fluctuation … held and different notes" (villain, cafe, sugar,
  march)** = MELISMA. Short notes after another note continued the previous
  vowel on a new pitch (an r34 rule for instrumental ornaments); the writer's
  16th pairs triggered it on 46–66% of those songs' notes, 0% on the ones you
  liked. Now every note takes its own mora (a 16th pair is two syllables).
  March is re-sung under the law with its music untouched.
- **"multiple voices should say the same lyrics" (chase)** — the harmony voice
  now copies the lead's syllable at every shared onset (168/168 on villain).
- **"flute/woodwind off key" (android, cafe, sugar) and "violin too loud"
  (corridor)** were all the CHORUS DOUBLE: a clarinet/flute an octave over the
  voice, in key but exposing the converted singer's pitch drift. It now plays
  on the accompaniment's own piano/e-piano at half the lead, as the corpus
  does; string support under a sung lead is ×0.6.
- **"too loud" voice (rooftop, corridor, kitchen)** — per-song levels −5/−3/−4
  dB; festival lane −4 by default ("for energy like festivals … much softer").
- **"vocals as a layer/whisper for scary"** — `vocalStyle: 'layer'` on villain
  and corridor: low-passed, wetter room, quieter. A true whisper timbre is not
  in this voicebank.
- **"excited but in minor" (fireworks) / "doesn't fit excited" (opening)** —
  both had hashed onto the same ii-m9 city-pop loop. A bright-pool rule
  (major tonic, no foreign roots, ≤⅓ minor) exists now, but only TWO clicked
  major exemplars pass it, so these two are pinned on I V vi IV and IV I V vi
  served raw. **Clicking keeps on bright major progressions grows that pool.**
- **"Alberti too quick at 176 … too fast" (chase)** — 152 bpm, acc pool runs
  the metronome test (now broken tenths).
- A keep click on this page CRASHED the build (an r34 index under the old
  gate) — fixed and guarded.

Renders are DONE (every vo_ song sung once with the real lyrics from the
parallel session's writer — D141; the harmony voice sings the same words).
`audition/vocalab.html` is retired on your overrule ("i want a diversity of
other vibes") — its remaining renders were stopped; listen to vocaloid.html
and the r37 session's `audition/band.html` instead.

Still open: kitchen "more serious than goofy" (only the voice level was asked
for; the block-chord acc is the other half), the lab page re-render, the
fluid tempo, chorus acc thickening. A peer session is replacing the random
moras with real lyrics; the re-sing of both pages waits for it.

## NEW — the Vocaloid read-out, the vocal writer, `audition/vocalab.html` + `audition/vocaloid.html` (r35, 2026-09-12)

Your 37 Vocaloid MIDIs (staged at `audios/vocaloid-r35/`, gitignored) are read
out in `research/vocaloid-r35.md` — twelve laws of a sung line, each with the
engine's own number beside it. The short version: our voice had the RANGE
right and nothing else — 1.4 syllables/s vs 3.9, leaps where the corpus
steps, every phrase on the downbeat (corpus 9%), no returning hook, 15% out
of key vs 4%, no chorus lift, no chorus double.

What to listen to (HQ on, Vocal on):
1. **`audition/vocalab.html`** — 27 sung A/B variants on 10 cards, ONE
   variable each (rate/starts/breath also nudge the drum level ≤7%; the tempo
   card moves everything the tempo moves). The first card (`vl_writer_lead` vs `vl_writer_writer`) is
   the whole round: the old lead sung as-is vs the new rule-written line.
   Then: syllable rate 2.4/3.9/5.2 · phrase starts · breath length · chorus
   lift 0/+4/+8 · chorus octave double off/0.7/1.0 · companion · 120 vs 180 ·
   hook fixed/varied/fresh · **a second SUNG voice a third below: none /
   chorus / all** (your "by chorus I meant the harmony for voice"). Each card's `why` states its hypothesis and
   question — answer the question, not the song.
2. **`audition/vocaloid.html`** — 14 songs from one-sentence DESCRIPTIONS,
   every chorus with the second sung voice a third below
   (the card shows the sentence and how `describe.js` parsed it). If a parse
   reads wrong to you, say so — the parser is a synonym table, easy to fix.
3. Export both pages' JSON when done (`page: r35-vocalab` / `r35-vocaloid`).

Not built (measured, deliberately left): a FLUID tempo (your "human isn't
just a constant static tempo" — a render-tier question, next round) and the
chorus's accompaniment THICKENING (verse 1 note per strike / chorus 2, ×2.5 strikes) — it needs a
per-letter figure change in the travel machinery and is a round of its own.

# where things stand — r35

## NEW — your first vocal-page export is in (16 cards, 1 keep, 15 notes) — D138

Everything your cards named is measured and fixed; **open `audition/vocal.html`
with HQ ON + Vocal ON** — all 16 mixes and vocals are re-rendered (the
"too loud" voices now sit 0.3–3.0 dB over the band where they sat 3.5–5.2;
the six you praised are untouched at their judged level).

What your ear found, and what it was:
- **"screaming" notes** (boss #8, space-vg #5) — both were A5 held 0.7 s.
  The singer now folds any note from A5 up that is held ≥ 0.5 s (short A#5/B5
  passes in romantic_rest and shop-vg's held G#5 were fine and stay).
- **"random cymbal in the middle of the section"** — two bugs: the crash was
  an 8-bar cell that ignored the form, AND the crescendo sample peaks 1.4 /
  3.6 / 7.1 s after it starts (three lengths, picked at random by the render)
  so it peaked bars into the next section. Now one short crash per drop,
  started 1.44 s early so its PEAK lands on the downbeat (boss: bars 16 and
  48; tense_fight and fight-vg: 8 and 16).
- **guitar "sustaining → white noise" (5 cards)** — every part you disliked was
  the ringing open chorus; every part you liked was palm-muted. Unpinned
  songs are muted throughout: octave chug on B, a 3+3+2 push on the bridge
  letters (your "spamming the same chords"), drier room. Casino and
  festival-vg keep the open chorus you liked. Guitar removed from happy_shop
  and excited_festival ("doesn't fit"), trimmed x0.75 on space-vg and water.
- **"voice too loud"** — no measurement separated your too-loud cards from
  your loved ones (both ≈ 5 dB over the band), so it is your law as data:
  energetic songs 0 dB over the band, calm +1.5; fight-vg −1.5 ("still"),
  shop-vg −1 ("way"), water 0; the +3 songs you praised stay at +3.
- **jungle "random fast off-beat synth"** — the kalimba takeover was playing at
  0.89 under the voice because the guide wrapped the wrong layer (an index
  bug). 0.40 now.
- **festival-vg "really high woodwind"** — the C-section handoff put the tune on
  an electric piano at C6–C7 for 8 bars, with the clarinet companion at 84
  beside it. Handoff off, companion an octave down (max 72).
- **training-vx "spamming piano"** — the acc hand ran at 0.9–1.0 against a 0.45
  guide. Electric piano at 0.6x.
- **snow (your keep) "piano a bit too loud"** — acc x0.8, everything else
  byte-identical to what you kept (a new `keepFresh` pin makes a keep click
  on this page stop retracting what you heard).
- **shop-vg "strings start soft and get loud … a vst thing"** and **water
  "violin much too loud"** — you were right that it is the instrument: VSCO's
  soft string layer is RECORDED as a crescendo (half its level at 1–3 s,
  full at 5–7 s). The patch now skips into each sample past the swell
  (0.92 s → 0.04 s to half level). Also found: the string patch had **no
  violin samples at all** since D80 — every "violin" was a stretched viola.
  Fixed. The horn (shop-vg's sustained support) is on VSCO now too.
- **training-vg "melody doesn't sound good"** — re-rolled the tune (eight
  candidates measured; the most stepwise, least zigzagging one is pinned).
- **rest "glitch at the very beginning"** — nothing measurable in the first
  1.5 s; a 20 ms head fade is on every vocal mix. If it persists, tell me
  which tier (HQ off / on).
- **guitar "white noise", second cause** — the amp was lifting the guitar's
  silent gaps to about −35 dB (hiss between notes); a gate keyed on the dry
  guitar now shuts them (−59 → −68 dB on training-vg, notes untouched).
- **horn chords in HQ** — the VSCO horn stops at B4 and the octave fold was
  collapsing its dyads into unisons; chords now fold as a whole (boss 22 → 10
  unison events, training-vx 40 → 20). A write-side ceiling is next.
- **HQ drums "way too loud" (your poplab axis card)** — measured cause: the
  HQ mix levels each stem to the same gated loudness per written gain, and
  for a one-shot that puts its HITS ~5 dB over the piano's loudest moment
  (kick −18.9 vs piano −23.5 dB, 100 ms). PROPOSED, not shipped: level
  percussion by its momentary peak instead. It would move every drum song's
  HQ mix, so it wants a page for your ear first.
- **festival-vx "can't hear the accordion in HQ"** — OPEN. Measured: the HQ
  mix levels each stem to its written gain (accordion ≈ 4 dB under the
  piano, as written). The guitar is gone from it; the browser tier's own
  per-patch loudness is what differs and I have no measurement of it yet.

Nothing on `audition/songs.html` moved (0 of 47). Nothing committed.

## NEW — your poplab export is in (16 "good", 14 cards marked, 6 labels)

Imported to `src/lib/pop-lab-labels.js` (D138 addendum 5). Three of your
lines change what gets built next: "chorus" = vocal HARMONY (a second sung
voice), not a section; "human" includes a fluid TEMPO, not just accents;
genre is layers/voices, not the chords. Your hi-hat "way too loud with HQ
on" is measured below. 19 cards unseen, 15 of them in the answered-by-
default tail; the four still worth your ear: 13 breakdown grades, 38
melody anticipation, 41 melody thickness, 7 tresillo comp.

## NEW — `audition/poplab.html` trimmed to what needs your ear (your "filter the problems after question 9")

18 cards ask for your ear (1–9 as before, plus 13 breakdown grades, 14 intro
length, 17 layer entry pickup, 24 axis rotation, 25 colour dose, 35 hook
repeat, 38 anticipation, 41 melody thickness, 44 frozen tresillo). The other
26 now sit LAST on the page under an "answered by default — skip unless you
disagree" banner, the expected answer behind a click so it cannot anchor you — they are
music knowledge the engine already acts on (LH class = genre, terrace =
build, backbeat = pop, borrowed chords by parent mode, cadence closes, …)
or near-duplicates of an earlier card. All 44 stay playable and markable, so
a disagreement is still one click.



## NEW — the Top MIDI Tracks Pack read-out + `audition/poplab.html` (your 2026-09-12 ask)

The new folder was `Top MIDI Tracks Pack (Free)`: 421 piano arrangements of
pop / film / classical / anime / Zelda OoT, labeled by title. All 420
readable files were read (`research/toppack-r34.md`, ~1,800 lines — four
lane sections: progressions, left hand + rhythm, melody, form + layers +
vibe mixing), every song hand-labeled by lane / emotion / energy from its
title (NOT your verdicts — say where a label is wrong and the numbers recut).
What it says, in one breath: pop piano is PLAIN (colour on one chord per
loop), the loop's ROTATION carries the emotion (I-start = sad/happy, vi-start
= calm/romantic), the left hand lives on the 8th grid and the chorus drops it
an OCTAVE rather than thickening it, the melody repeats a 2-bar cell and
varies it by re-fitting the landing (never by transposing — the pack agrees
with you), the tune starts at bar 0, a real pop breakdown thins the left hand
and keeps the tune, and every pop drum groove has a snare on 2 and 4.

**Open `audition/poplab.html`** — 44 experiments, 208 variants, each a
measured finding + a hypothesis + a question for you, separate playable
variants with ✓/✗ marks and note boxes, HQ toggle like the other labs. Play
the reference first, then the variants; mark ✓/✗ on each; the card verdict
is for the experiment. Copy the labels JSON → I import it with
`node scripts/import-poplab.mjs <file.json>`. Every hook on the page is new
material written from the pack's rules (no copyrighted tune is transplanted).
The questions your ear settles: is the loop rotation audible; at what dose
does colour leave pop; does the left-hand class alone name the genre; is the
chorus the octave drop or the class change; is one anticipation a lean; 8th
vs 16th vs the old final-slot 16th; is one landing-note change audible at
all; which breakdown grade is "the piano disappears"; does a class change at
constant loudness read as a chorus.


## Real Japanese lyrics (r36, your "it should actually produce real japanese lyrics, of course with parts bound to the melody")

The random-syllable pool is gone. Every sung line is now a Japanese SENTENCE
written from grammar (23 clause shapes over ~200 words, verbs conjugated) and
bound to the tune: a word never crosses a rest, a long note gets a word
boundary or a held vowel, every note keeps exactly one mora, the chorus sings
the same words on every return, verse 2 gets new words over verse 1's tune,
and the vocabulary follows the prompt (a rainy goodbye sings ame / eki /
namida, the cafe sings koohii / asa / mado, the corridor sings gakkou /
ashioto / kage). Each vocal card gets a **lyrics** fold-out (kana / romaji /
English gloss per line, ↻ marks the chorus returning) once the songs are
re-rendered — the other session's render loop re-sings all of them with the
new words; until then the old wavs still sing the old syllables. Nothing
stored is a line from any song (a test enforces "words, not lines"); the
lines are J-pop fragments, not a story across verses — say if you want that.
`--lyrics pool` on export-vocal reproduces the old lines for any song.

**It doesn't have to be words (your follow-up).** A vocalise is now a mode,
not a failure: **la / na / oh / hum / nyan / meow / doo-bi-doo / pa-ra-pa /
nonsense babble**. Three ways it gets picked, in order: you pin it on the song
(`lyrics: 'meow'`, `'la:mixed'`, `'none'`); the description says so ("meow
instead of words", "humming", "a scat chorus", "tongue-twister" → nonsense);
or the emotion's own pool decides, at a genre rate — goofy songs 60% of the
time, happy/excited 35%, calm/sad 20%, tense/scary 10%. The default is MIXED:
words through the song with a wordless tag on the **last line of the chorus**,
returning every time the chorus does, never more than a third of the song. As
it stands 10 of the 30 sung songs carry one. Say "all meow" or "no la la" on
any song and it does that instead. The lyrics fold-out on each card names the
plan and tints the wordless lines gold.

## The vocal suite — `audition/vocal.html` (your "suite ... mostly energetic" + "vary the lyrics")

Ten new songs, each sung: eight energetic (excited festival, triumphant
boss, happy jungle, excited space, excited casino, tense fight, happy shop,
excited training) and two ballads (nostalgic snow, romantic rest). Open the
page, **HQ: ON**, **Vocal: ON**. What changed to make them "primarily vocal":

- the instrumental lead and anything that doubles it play at 0.45 as a
  guide under the voice; the companion and any alternate melody stay full —
  a second independent line beside a singer is the corpus norm, a double is
  not;
- the voice sings the lead AS THE MIX PLAYS IT (later letters, varied
  returns, handoffs) — the first pass sang from the solo loop and lost 54 of
  96 notes on tense fight;
- the energetic eight get a kit with a snare (backbeat) under the voice.

The lyrics are now generated Japanese, one mora per note, built from the
words Miku songs lean on (kimi / boku / sekai / koe / sora / yume / hikari /
kokoro / mirai / namida …) with particles and verb endings so a line scans,
set phrases (arigatou, sayonara, daisuki, doki doki, kira kira) and the odd
"ra ra ra". A returning phrase sings the same words (keyed by contour, so a
varied return still gets its hook): calm water's 16 lines collapse to 5.
Lines are two bars long with a breath between, and each line is placed by
octave into a singer's range. They are words, not sentences — if you want
real lyrics that mean something, that is a prompt field and a proper
phrasebook, not a pool.

**Your verdict noted:** "guitar fits pretty well as a subtle layer i like
it actually" — the quiet rhythm guitar under the voice stays the default on
vocal songs (CLAUDE.md, D137). The louder guitar-MAIN mode is separate and
genre-gated. **Six guitar-main songs** are on the page (vg_*): anime-opening
J-rock (fight), power pop (festival), sports-anthem rock (training),
Vocaloid electro-rock (space), city pop (shop), a guitar ballad (water) —
guitar intro riff, louder rhythm guitar, and the guitar in unison with the
voice for the last chorus; five of six on the hand-authored J-pop / city-pop
idiom progressions. The other session's toppack-r34 analysis is not written
up yet; when research/toppack-r34.md lands, I take notes and generate again.

**Electric guitar (your ask):** we had none, now we do. Every suite song
carries a J-rock guitar layer under the voice: palm-muted 8ths or a 16th
gallop in the verse letters, open power chords with the octave in the
chorus, a clean arpeggio on the two ballads — figures over the song's own
chords at octave 2. HQ tier: Unreal Instruments' free "Standard Guitar" (a
Japanese DI library) through a Neural Amp Modeler crunch capture, headless
(D136). With HQ off you hear the browser's GM guitars instead. If the
verse chug is too much under the voice, the gains are per-figure in the
guitar block and the amp capture is one path in hq-instruments.js — say
which song.

Levels: the voice sits +3 dB over the band in its sung spans by default;
your two notes are pinned on the page (training 0 dB, romantic rest +1.5).
Rendering: `node scripts/render-vocal.mjs <name> --page audition/vocal.html`. Every score, dry vocal, converted vocal and mix is measured
(pitch within 50 cents, onset lag by pitch arrival, octave errors) — the
table is in D135's addendum.

## Vocal tier: vs_calm_water sings (your "compose with hatsune miku")

`node scripts/render-vocal.mjs <song>` now sings a song's tune and lays it
over the HQ render. Open `audition/songs.html`, turn **HQ: ON** and
**Vocal: ON**, and play **vs_calm_water** (it carries a VOCAL badge). What
you are hearing, stage by stage, all measured (D134):

- the tune is the piano lead shifted down an octave (its median was C6),
  sung only in the 30 bars where the mix actually plays it — the 4-bar
  intro and the two breakdown bars stay wordless;
- a free DiffSinger voice (Tiger) sings it on "la" per note, breaths at
  phrase starts, the engine's own accent envelope as dynamics; its pitch
  model writes the portamento and vibrato (0.13 semitones median deviation
  from the score — ornaments, not a new tune);
- a community Miku RVC model replaces the timbre (pitch survives: 95.5% of
  notes on pitch, 0 octave errors, onsets on the beat to within 11 ms,
  presence band +3.2 dB);
- the vocal sits 3 dB over the band in its sung spans (your "i dont hear
  the vocals" — it had been mixed under it) and gets the lead's room.

Not the real Miku: every free "Miku" is trained on Vocaloid output and
Crypton has no public position on it — fine to audition locally, not to
release. Real lyrics are the next input if you want them (right now it is
"la"; `--syllable ah|na|oo|auto` are the other options). If the register
is wrong for a song, `--octave N` pins it. Other songs: same command; each
needs its HQ render first. Rendering takes ~7 min a song on CPU.

## Batch-2 verdicts in (17/17 good) — batch 3 is on the page: 33 new experiments, positions 72–104

Your second export: every batch-2 experiment good, none rejected. What it
settled: development by adding octaves is inaudible (gijoe "barely
different"), groove regroupings are wrong for nature material (hexarp
dotted "really groovy for a relatively serious/natural vibe"), density is
not a main beat (you heard the dense tier as the buildup and the kick-snare
groove as the main beat), rush's "third and fourth still slower" survives an
identical bass so the falling pad is the suspect, and removing rocking /
sparseness / frame from the human melody broke nothing — so batch 3 hunts
the load-bearing property with an ALGORITHM instead of my hand.

**The sad-shop strings (your question, corrected for "I listened with HQ
on"):** with HQ on, sad shop's strings are the VSCO cello/viola sections
rendered through sfizz — real bowed recordings with a 0.7 s release on
every note, the SOFT velocity layer selected by the whisper gain (0.21), and
the room rendered as convolution reverb. The labs page played the browser
soundfont, which cuts every note 10 ms after it ends. On top of the tier,
the writing differs: sad shop holds every note at least a beat, two attacks
a bar, eight velocities, five interlocking string layers under the piano;
the robotic ones were dry, 0.40–0.45, four or five equal attacks a bar,
alone or as the lead. So the labs page now has the same **HQ: off/on**
toggle as songs.html, and every batch-3 variant has an HQ render — judge
the strings cards with HQ on to hear the tier you compared against, and
with HQ off to hear the level/reverb/envelope variables cleanly (the HQ mix
levels stems by loudness, so level differences are compressed there). Full
numbers in research/variation-labs-r33.md §12.

Batch 3 (positions 72–104), judged 71 byte-frozen:
- **melody generation (14 cards)** — the gesture grammar as a program
  (seed + rule switches on every card): three seeds vs the melody you
  called human; one switch off at a time (equal durations / no breath /
  every bar on the tonic / no arch); density 1-2-4; velocity shapes; tail
  types; anticipation by an 8th and by a 16th; 8-bar form (free / return /
  exact); and the grammar over seven more hosts — major keys for the first
  time (allstar, royalroad, lb3, pendulum), blues at 150, jazz at 110,
  mystery at 78 — on piano, flute, ocarina, clarinet, vibraphone, square,
  saw, muted trumpet, treated strings. If the seeds pass, this becomes an
  engine rule; if one fails, your note on it names the missing rule.
- **strings (4)** — the chaotix line with level only / reverb only /
  attack-release only / all three; the strings lead treated / re-attacks
  removed / strings under a piano lead (the sad-shop role); durations at
  fixed treatment; your "different notes".
- **your fixes** — harpsi pickup NOTES (triadic / from the 5th / falling /
  new anchor), gijoe bolder (rhythm → harmony → added voice, with controls),
  dq tresillo variations, walkbass over a stated C7-F7-G7-C7, lattice bass
  and pluck levels, grief re-authored (long-short / rolled / top line), rush
  pad hypothesis, the loop form with the roles as you heard them, hexarp
  nature-compatible rhythm (breath / rit / peak echo vs dotted).
- **development (5)** — pkmn / rise / steel-event / lattice-layered /
  harpsi-layered arcs with static controls.

Page 104 experiments / 382 variants; suite 394/394. D133. Nothing committed.

## Your first labs verdicts are in — and batch 2 is on the page (23 new experiments, positions 49–71)

34 good, 0 rejected, 150 variant marks work, 4 off. What you settled: the
bold flows are the model ("definitely make more of these"), the surgical
align repairs are below your ear ("can barely tell a difference" ×7 — the
mechanism analysis stands, the repair grade is not worth building),
transposition is not variation ("still the same melody"), the climb needs its
drop (no-arrival marked off), safe-swell "too harmonic" while the desert drone
floor "could be expanded to many ambient songs", your hexarp×panflute clash
prediction refuted ("lively song but fits" — the real risk is reuse without
variation), and the rule-composed melody passed as human on BOTH the falling
and rising versions ("learn how to make melodies like these").

Batch 2 answers every note, appended after the judged 48 (byte-frozen):
- **melody generation** — the human melody with one rule removed at a time
  (rocking / sparseness / empty middle: which one kills it?), the grammar as
  a lead over the nightfall loop on piano/flute/strings, and at 128 bpm over a
  driving bed with a hammered "machine" control.
- **over time** — walkbass in three pacings (every 2 / every 4 / late turn),
  dq with the falling cell as PRIMARY (your ask), gijoe developed by addition
  vs static vs late-fill.
- **rhythm axis** ("could also vary rhythm too") — 9 cards: walkbass, dq,
  lattice (bold this time), pkmn (diverse this time), the rise (rhythm AND
  intervals), harpsi (rhythm AND notes), hexarp, offbeat, steel.
- **your fixes** — royalroad's dark pendulum chord (= the seated f♯: bright
  third or regroup bar), the dial's misfit pizz note (= the seated e♮: level
  or re-seat), raining-jazz RH recomposed + flute split, the minor hexarp run
  without b6 / with dorian 6, chaotix legato/staccato + softer trumpet,
  airwolf separated with the second chord re-noted, rush's "still slower"
  (felt speed is same-pitch re-attack density — fixed by block transposition),
  and your looping law as a percussion form (buildup once → main loop → late
  event).

Recorded, not yet carded: grief's "same durations feels robotic" (solo
progressions need roll/rhythm variety), the pluck "a bit too loud" on the
mysterious mixes, tech-mystery's second-bar rub. D132.

## audition/variations.html — the variation labs (batch 1: 48 experiments, 170 variants)

Per your ruling the labs left the catalog and got their own page. Every card
is one EXPERIMENT: your words that motivated it, a falsifiable hypothesis, a
targeted question, and SEPARATE play buttons per variant (your "evaluate this
in its parts not a whole") — mark each ✓ works / ✗ off, note anything, then
give the experiment a verdict. Export button is the same flow as the catalog.

Six lanes, in page order:
- **flow (17)** — every sample your notes asked to vary, with real alternate
  flows: the pendulum incl. your literal 3213232123232 and an enters-later
  demo; hexarp (strings untouched); lattice "go up a note"; snowy with its
  rhythm frozen + the tail fixed; horn echo repaired then developed into an
  own melody; offbeat pizz third-note-up occasionally; the walkbass/harpsi/
  lb3/steel/daydreamer-bass interval-order asks; dq pizz incl. a NON-rising
  version (your rl_r6 note); pkmn dyads as-transcribed vs barline-aligned vs
  your up-ending; the swell in new rhythms; rush rebuilt to your exact
  recipe (same speed, different notes, softer); bkmansion's four left-hand
  behaviors as separate studies; grief at 100/72/60 (tempo only).
- **perc (5)** — congas/shaker flows, lofi+indie combined (incl. a groomed
  version that resolves their colliding hits), your "layered over time"
  tutorial cluster staged vs all-at-once, and an energy ladder built from
  your own tier labels — does percussion alone carry the arc?
- **combo (5)** — bkmansion pixel vs saw-stack vs piano ("serum-like"
  direction), airwolf's timbre over the piano host, soncha's vibraphone
  flat vs rising, chaotix determination across four instruments, the
  offbeat role on four voices.
- **align (6)** — your five "wrong key" notes, MEASURED first: rise and
  shop-bounce are already 100% in-key after seating (the clash is
  chord-level); airwolf's "second variation off key" is literally ONE
  pitch; gijoe/attack-hold have 2–3 chromatic cells. Each card: exactly
  what you heard vs conformed vs minimal repair — your pick decides the
  pairing fix the engine builds. Plus the host-rhythm card ("tempo should
  be a bit more constant"): bare uneven changes vs +root pulse vs evened.
- **mix (8)** — your vibe algebra composed: YOUR energy recipe verbatim
  (air-pirate bass + energetic pizzicato over the calm core), mysterious
  desert (hypothesis: the second swell's clash tones are the desert bII
  pincer over a drone — reframe instead of repair), playful+playful,
  determination + the pad at half the "too loud" gain, the timelapse DIAL
  (your "any layer can be on or off" as four positions), stakes vs
  relaxed, and your hexarp×panflute clash prediction as a control with two
  rescue attempts (time-separation, role-spread).
- **compose (7)** — your analyze-why asks turned into rules and tested on
  NEW material with falsification arms: the harpsi common-tone-anchor rule
  (+ why the same rub passes on the andalusian), hexarp = scale minus
  degree 4 (the f restored should break it), nocturne's falling-answer calm
  (rising-answer control), raining-jazz left hand transferred, the allstar
  V→v(add9) resolver grafted twice, scale-climb placed before a real drop
  vs before nothing, and the echo-cascade canon rule (stepwise line =
  predicted mud).

All 170 variants build-verified; every "as you heard it" variant reproduces
the exact combo the catalog played (stored pins / judged-page values). The
analyses live in research/variation-labs-r33.md. D131.

## Catalog: 219 cards now (labs moved out), batch 6 tail = 27

Your queue and numbering through 192 are untouched, byte-verified. The b6
tail keeps: the "can't hear"/silence fixes (topgear, ctr-credits, ctr-boss
respec'd to sound from bar 1; hgss boosted), the 9 splits you asked for, and
the two mining lanes — dev patterns (return-after-contrast 62.5%, +layer =
#1 return transform, support rewrites almost never) and your perception
categories with recipe-hypothesis questions. D130.

## Your fifth export is in — and it ratified batch 5

New in it: four b5 reactions, all positive — daydreamer guitar ("I like this
vibe") and bass ("happy bass", now ticked + frozen at what you heard),
garden horn ("a reference to inspire, not hardcoded"), gijoe rhythm ("sounds
happy. I like it!"). Topgear unticked pending its split — its judged pin
stays stored for a re-tick. 78 prior pins carried byte-verbatim. Three new
laws recorded: tick lists are OPTION MENUS (your "listing all applicable...
all at once won't resonate"), melody samples are reference-only (you said it
three times), and harmonic layers make a scary device less scary (your
premonition label). D131.

## Your third labels export is in (8 cards, 76 ticks, ~150 pair notes)

**Every ticked pair is now FROZEN at exactly what you heard** — a stored pin
per pair (shift/gain/tempo), corrected only where your note asked: magus,
taiko and trip-hop pinned quieter ("way too loud"), versus-bass and the
string pluck pinned louder ("cant hear"). Thirteen add-ons got new loudness
readings for everywhere else (steam engine, trip-hop, magus, garden horn,
swing-arp "really soft", rush "softer", infinity slap and desert groove
boosted...). The "can't hear" diagnosis: the bass cards were genuinely too
quiet (fixed); the hand-drum beds and the string pluck vanish only under
DENSE cards — that's texture/same-family masking, not level, so they stay as
judged where you said they fit.

**Your two laws are recorded** (D129): calm-is-not-a-cage (a vibe label
describes the unlayered core; foundations + layers reach other vibes), and
variation = "another flow bound within the sample" — a coherent alternate
line (your 321232123 → 3213232123232 example), never random note changes.

**Your analysis asks, measured** — the mechanisms in plain terms:
- **nocturne bed's calm**: slow attacks, hands ~3.5 octaves apart with the
  middle EMPTY, answers that fall stepwise while the bass rises, then the
  whole call dissolves into a semitone rocking figure over whisper strings.
- **mir sadness floating**: I–iii–IV^7–ii7 with NO dominant anywhere — it
  floats because resolution pressure never forms; the bass only speaks on
  beat 4, as a pickup into the next chord.
- **the echo cascades' refreshing**: a decaying canon (same phrase, one 8th
  apart, 4 fading voices) whose triadic steps make every self-overlap a
  3rd/4th/5th — written-out reverb that can only be consonant. And your new
  premonition label ("harmonic layers make it less scary") is the same
  mechanism from the other side: register + level + harmonic context re-read
  a semitone as glitter or as threat.
- **airship carousel**: four locally-functional sus→resolve cells joined by
  chromatic-mediant/tritone seams — keep each cell intact and put the seams
  at phrase boundaries and it stays smooth.
- **the allstar resolver you liked**: D → Dm(add9) — the major V softening to
  minor on the same root before landing on C^7. A learnable end-of-phrase
  rest gesture.
- (harpsi/hexarp fit-everything and premonition's second chord were answered
  last round — the line-fits-the-KEY law and the bar-2 A♮/D semitone rubs.)

**4 new cards at the end of the queue (189–192)**: the gijoe RHYTHM as a
template with key-aligned notes (your "take the rhythm" ask), daydreamer
split into bass + guitar with the first guitar note moved to the root as you
asked, and the garden horn answer isolated.

## Batch 4: the deep-mining pass (47 new cards, positions 142–188)

**Your sad_shop question answered**: yes — the strings are
`gm_string_ensemble_1`, and the "really good VST" is the **VSCO-2-CE string
section** (real cello/violin section samples, round-robins, velocity layers)
rendered through sfizz in the HQ tier. Still the default strings voice: 29 of
the songs.html suite carry it. The praised layer itself is now a card
(`cand_b4_q_sadshop_strings` — hold a bar, climb beats 2-3-4 in dyads to an
octave, transcribed byte-exact from the frozen mix) posed as a transplant
experiment: tick it onto other-genre cards to find where the flow survives.

**The exemplar you named, fully read (7 cards, your sentences on each)**:
SM-MiniBoss decoded — the LH is a tripled-unison E blues walk (piano + both
basses); its "variation" is 8 bars on a B-pedal octave gallop + a chromatic
climb home; the growth is octave-COPIES (strings +12/+24 at bar 5, melody
born doubled at +24); the trumpets are chords on 90 of 90 attacks; the
descending synth is an Eb-augmented waterfall in 48ths, bars 13-15 only; the
percussion is a 24-bar arc played twice with the clap+slap LAYERED backbeat;
the intro is one unison chromatic planing bar. Title-as-prior confirmed.

**Four corpus lanes (35 cards, ~20k+ files measured)** — headline laws:
- Growth: 83.9% of late-entering layers add ZERO new pitch classes (the
  octave-double is a device, 5.1%, not the norm); half of entries land
  mid-phrase — your r17 "changes not just in strict section bar" has corpus
  backing and a card.
- Percussion: song types separate by VOICE SET not density (victory = pure
  kit, snow = four-floor+tamb, desert = latin, dance = the CLAP); 70% of
  songs change their kit mid-song; a second hand-percussion deck is a
  standing arrangement in environments (desert 48%) — your "drums can be
  layered" is corpus law (61% of clap songs layer clap WITH snare).
- Layers: complementary rhythm is the corpus MINORITY — your zero-overlap
  reels are a distinctive choice; victory fanfares LOCK (79%). Plus 4
  RHYTHM-TEMPLATE cards (your "just the rhythm + info to fill it"):
  backbeat-chords, frozen offbeat stabs, gallop bass, pickup-run.
- Variation: 85.1% of real variation keeps rhythm IDENTICAL and varies pitch
  only; octave-shift is the RAREST mechanism (1.1%) — the mechanism bank for
  your melodies-vary-per-song law.

**Producer questions (your ask "up to you")**: 32 of the 47 cards carry a
direct "Q for you:" — the big ones: should theme arrivals STRIP a support
layer (CTR does); staircase vs pillar octave growth; may layers enter
mid-phrase; is a frozen one-pitch layer genre-FREE; can offbeat chords carry
spook (Sonic Heroes says maybe — tests your r19 law); should the metronome
test be role-aware for gallop bass; second percussion deck under the kit at
D77 levels; drum-layering as a standard trick. 27 cards carry explicit
"claimed scope" lines — your label ratifies the scope claim too.

All 188 build-verified; combo probe 188/188; your first 141 positions
unmoved; FULL suite 391/391; nothing committed; research/deep-mining-b4.md
has the full analysis; D128 in the ledger.

**Heads-up before your next songs.html listen**: the page had been one
rebuild behind the session's r33 code since Sep 1; the full-suite run
rebuilt it, and **11 unkept songs you have notes on absorbed the r33 fixes**
(excited_casino, excited_training, calm_rest, somber_snow, happy_festival,
nostalgic_shop, mysterious_space, excited_space, calm_shrine, excited_fight,
nostalgic_casino — mix/cast moved, drums on three). Every KEPT song is
byte-identical to its judged state (verified against the pre-import
snapshot; D64 pins green). Those 11 songs' HQ wavs are stale until
re-rendered.

## Your second labels batch is in (5 cards, 113 pair notes) + batch 3 built

**Your three "analyze why" asks, measured:**
- **Why shenightfall-harpsi and hexarp fit everything**: after key-seating,
  EVERY pitch class they sound is diatonic to the card's key. They're only
  ~41–44% inside the sounding CHORD — and that's the finding: a single LINE
  fits through the KEY, not the chord (its non-chord tones read as passing
  tones). Predictive rule for future chords: a line-shaped add-on fits any
  progression whose key contains its pitch classes; what kills a pairing is
  out-of-KEY notes, especially a semitone against the sounding chord.
- **Why premonition's second chord doesn't fit**: measured — its bar-2
  content lands d–a–bb–f against the card's Ab bar. A-natural and D are both
  outside C minor AND both a semitone against the Ab chord's tones — two
  simultaneous semitone rubs. Bar 1's content maps fully into the key, which
  is why the first chord fits. (Same mechanism as the r33 dissonance
  predictor.)

**Your laws, recorded for the engine round:** strong melodies vary over the
song AND per-song (no two songs share a melody, but stay "safe enough to keep
the appeal of the original"); drums layer and mix like any other tier;
continuous layers sit soft in the background while sporadic ones ride normal
(the page's combo preview now does this for un-judged add-ons); layers
COMPOSE vibes — one progression becomes energetic or calm, x or y, purely by
its cast. And your sad-shop-era question: **vs_sad_shop, vs_somber_aftermath
and vs_x_construction are keeps — byte-frozen exactly as you praised them,
verified every round since.** "Replicate those layers across a higher range"
is now the standing design goal for the next engine round.

**Batch 3 (18 lab cards + mined seeds, after your position):**
- **The pizz lab (your ask, 6 cards)**: each a variation HYPOTHESIS bound to
  the chords by construction (scale tokens can't leave the key): your
  up-a-note-on-the-third verbatim, a chord walk-up, a 2-bar call/answer, a
  lower-neighbor dip, double-stop dyads, and an on-beat 3+3+2 — label which
  variations earn a place.
- **The percussion-voice lab (6)**: your triangle→snow reading made literal
  (sleigh-bell clock), an agogo/woodblock percussion melody, tuned log-drum
  duet, offbeat finger cymbals, a soft→hard shaker staircase, a woodblock
  town clock.
- **The timbre lab (6)**: accordion, harmonica, koto, steel drums, ocarina,
  fiddle — all playing the IDENTICAL neutral phrase, so your label is purely
  about the voice (first cards of the instrument-for-vibe type).
- Your "can't hear" on the slap riff fixed (same sub-audible-register bug as
  the air-pirate bass — raised an octave + boosted).
- Every pair you ticked is now pinned to the delta/gain/tempo it was judged
  under — batch-1 ticks under the old mapping, this batch's under the
  current one; no future rule change can move an approved combo.

## Batch 2 mined (your "scrounge more patterns" ask) — 45 new cards, appended AFTER your place

Four mining lanes over the ~2,050 curated files (+ research-doc finds never
carded): **14 drum grooves** (boss x2, water, flying, town, victory,
sad/march, stealth, cave x2, desert, haunted, festival), **12 progressions**
(9 with real sub-bar chord changes; sad x2, boss, flying x2, victory x3,
water, town, sports, lounge), **10 layer devices** (echo cascades, arp
engines with built-in variation, walking-bass tissue, a call-and-answer
trade), **9 from your own packs** (6 carry the pack annotations verbatim —
they lead batch 2; NOTE: Miraleste's filename notes read as the producer's,
not yours — tell me if they're actually yours). Catalog is now 113 cards;
your position, numbering, ticks and notes are untouched (batch 2 strictly
appends). Full analysis: research/catalog-mining-b2.md. Nothing enters any
pool until your labels.

## Catalog batch 1 imported (your 3 labels + 69 pair notes) — page upgraded from them

- **Piano rule built (your ask):** a piano-main card no longer offers other
  piano-main add-ons (measured flag: dominant piano/epiano voice carrying
  harmony — every chord bed, chordal comp, and two-hand accompaniment; melodic
  piano lines stay). 29 of 68 candidates flagged; none of your ticked/praised
  partners is among them. Hidden ones still show if ticked, and their note
  rows stay.
- **Key alignment now mode-aware (your "wrong key / would work if aligned",
  x4):** a minor-flavored add-on on a major card now lands on the card's
  RELATIVE minor (and vice versa), so its colors sit diatonic instead of
  fighting the card's third. r8 attack-hold, layerstack rise, gijoe comp,
  shop bounce all remap; same-mode pairs (pendulum, hexarp, snowy, horn echo)
  are byte-unchanged.
- **"can't hear the drums" was real silence:** shenightfall/desert-groove
  specs named sounds that were never registered anywhere (kick/snare/cabasa…)
  — remapped to your local pack (md_kick, vc_riq, vc_conga_mute…). The
  airpirate bass was a g1 pedal below browser audibility — auditioned an
  octave up now. String-pluck boosted 1.6x.
- **Your loudness readings applied per add-on:** steam engine + trip-hop 0.5x,
  taiko + harp zigzag 0.65x, magus 0.6x, reflection duet 0.75x.
- **"way too fast" fixed:** an add-on authored at half the card's tempo (dq
  stack at 50bpm under the 140bpm card) now halves its rate; it does NOT fire
  on r6 where you said it fits.
- **Split as asked:** magus motor and choir are now separate cards (motor
  quieter per "high part way way too loud"); dq pizz and flute separate;
  panflute nocturne lead and bed separate. 68 cards total; your progress and
  notes are untouched.
- **Recorded for the engine round (not page fixes):** your variation asks
  (pizz "up a note on the third occasionally", lattice bell vary, pendulum
  321→3213232 interval-vary, hexarp "vary the melody", snowy "vary while
  keeping the rhythm", horn echo "vary this to make an own melody"), the
  chord-safety ask ("rounding more risky notes to safer alternatives"), and
  the reel-render rhythm notes (r2/r3 "rhythm should be more aligned / hard
  to follow", r6 "tempo should be a bit more constant").

## The headline: your three issues were three specific bugs, all measured

**"certain instruments too loud once again"** — ten of your sixteen cards were
ONE mechanism: the engine hands the melody to a flute → vibraphone → e-piano
chain in the later sections, at 1.01–1.04x the lead you calibrated your ear to,
and a bug had FLATTENED every melody layer's dynamics (an authored per-note
envelope was being overwritten by a later flat gain — so every "loud" layer was
also playing every note at max). Three things you should know:
- **"glockenspiel" = the vibraphone** (there is no glockenspiel on the page),
- r1's **"sawtooth synth"** = the flute handoff (no sawtooth in that mix),
- r3's **"flute doesn't really match"** — there is NO flute in that song at
  all; the best candidate for what you heard is the vibraphone lead (42% of its
  notes clash with the true chords). Point again if it's still there.
The handoff chain is now OFF on reel cards (a reel plays one instrument per
role), the dynamics bug is fixed everywhere fresh, drums/acc are capped against
what the lead actually plays (not a paper number), and the melody can never get
louder than its own opening sections any more.

**"notes shifted off by like a sixteenth"** — not swing, not the drums: the
melody cells themselves write onsets one 16th before beats 2 and 3 (65% of all
off-grid notes were exactly those two slots), and every copy (octave partner,
handoff) repeats them. Your references almost never do this — their off-grid
16ths are pickups INTO a note. New law: an odd-16th melody note survives only
as a pickup; everything else snaps to the 8th grid or merges into the note
beside it. On your named cards: 33–73% off-grid → **1.2–3.0%**. The "really
short duration" notes were exactly 10 events on rise_up and every one was also
off-grid — one fix cleared both halves of your sentence.

**"dissonance / doesn't match"** — four separate causes, none of them "too many
notes":
1. frozen reel rows were being pitched against the WRONG chord (the loop's
   first chord instead of the key) — r3's pluck went from 71% clashing to 14%;
2. the melody was tracking chords one bar at a time while your reels change
   chords mid-bar — it now reads the chord sounding at each note;
3. r1's "major for some reason" was my bridge-variation machinery recolouring
   your madd9s into MAJOR triads for exactly bars 12–19 — reel harmony now
   plays as transcribed, untouched;
4. both "notes right next to each other" cards are reel 1's madd9 cluster
   device crossed onto happy/excited songs — on the calm card ZERO of its notes
   are out of key; it's the exposed in-chord semitone you're hearing. Which
   vibes that device may cross onto is a question for your catalog labels
   (below) rather than a rule I invented.

**The stick, fifth complaint** — you were right to be annoyed: the r32 fix
added two better stick patterns and the hash picked the OLD one again on the
exact song you judged. The old row is out of the rotation; construction now
gets the stick AS the backbeat, interlocked with the kit. Also found: the drum
compiler has been silently deleting the snare wherever snare+clap share a beat
— on every page, always. Fixed.

## The catalog — this is where I need you (audition/catalog.html)

Your ask: *"take everything you like ... and ask me to verify them one by one
so i can label what they contribute and which ones sound good together."*

**62 candidates**, one at a time: the 8 reels' progressions/layers/combos, the
best of the vgmusic 400, Undertale, the Unison packs, your own annotated files
(the Cottonwood MIDIs where you wrote "love the melody" in the filename — those
lead the queue), Miraleste, and the research back-catalog. 43 carry your own
words back to you. Every card plays through the engine. Keyboard: space =
play, g = good, x = no, u = unsure, arrows to move; the free-text box is for
what it CONTRIBUTES in your words. **The pair chips are live now (your ask):
while a card is playing, ticking "sounds good together with" ADDS that
candidate to the mix — on the playing card's tempo grid, its pitched material
pulled into the playing card's key (drums untouched), at 0.85x so the card
you're judging stays the reference. Untick to drop it. And every chip has a
small ✎: it opens a note line for THAT partner — why you included it (ticked
ones get a note line automatically) or why you left it out (✎ on an unticked
chip, without ticking it).** Export with the button when done — nothing
enters any pool until your labels come back.

## The melody study (research/melody-grammar-r33.md)

Measured your reels + all four MIDI populations against the engine. The
engine's melody was missing exactly one thing everywhere: **connective tissue**
— real melodies walk between their chord tones (28–57% stepwise, engine 16%),
leave the chord constantly but resolve by step, and put big leaps once a
phrase (engine: 19% of all intervals). First mechanism is in: one leap per
phrase, and passing tones that are approached AND left by step. The full gap
table and what's still to build are in the doc.

## Rebuilt / retested

- reels.html: all 16 (all your notes were live). rise_down ("love this vibe")
  is PINNED — only the trim you asked for. r5 lost the boogie (your
  "sneaky/goofy") + gained a companion; the two "more layers" cards got them;
  your ambient-strings ask is built (`ambientSwell`) and defaults on reel pages.
- songs.html: exactly 11 unkept songs moved; **0 kept songs, 0 pinned songs, 0
  desert/jungle/horror songs** — their HQ wavs re-rendered.
- vanriver: your two prose keeps ("no complaints" / "really good") are pinned —
  music byte-identical.
- npm test: 390/391 + the known suite race (passes alone); the 3 new catalog
  tests green. A six-agent adversarial verify pass ran on everything and
  REFUTED four of my own fixes; all four were re-fixed and re-measured in a
  second iteration (the full honesty ledger is the D123 addendum — headline:
  the drum cap was still being defeated by two later multipliers and by my own
  collision fix, now genuinely 0.73–0.77x on the worst offenders).
- New standing process (your "create a verification process and iterate"):
  `.claude/workflows/verify-round.js` runs the whole check battery every round.

## Three of your notes need YOUR call (surfaced, not guessed)

- **r6 "vary the violin"**: that violin is your reel 6's own transcribed
  scale-climb, played exactly as transcribed. Varying it breaks the
  play-as-transcribed law you set in r32. Want it varied anyway on that card?
- **r8 "the piano should just support the synth"**: I fixed the piano's clash
  (it now tracks the true chords) but did NOT demote it from the lead role —
  point again if it still fights the synth.
- **rise_up vs rise_down are no longer a clean A/B**: rise_down is pinned as
  you loved it (only the trim), rise_up carries every live fix — the pair now
  differs by much more than the up/down device.

## Open (deliberate, measured, waiting)

- cluster-arp cross rules → your catalog labels decide. Same family, now
  explicit: the r7 bell crossed onto the happy/snow card (your "shouldn't be
  applied as a copy to every happy song"), the E-pedal-vs-maj7 rub on the
  bright cross, and cross_holiday's harmony-synth chromaticism against a
  crossed pedal — all "which devices may cross onto which vibes" questions.
- r6's transcribed piano ROLLS render as separate staccato 16th voices (a
  binder limitation — the roll needs held voices); that's part of why that
  card's piano reads "offbeat". Recorded, needs its own binder work.
- songs.html still has NO snare anywhere (mid-band default) — one round, ~27
  songs' drums + HQ re-render, when you say go.
- r2 "disco not snow": that's a serving-label question — the catalog card for
  the r2 stack is where to say what it should serve.
- tailOff conflict still unsettled; r26 chordcam verdicts still unimported.

**Nothing committed.**
