# Melody grammar — the r33 study (reels + every MIDI library vs the engine)

His brief, verbatim: *"also the melody generation has been ass, too much
dissonance overall and some seemingly really short notes and offbeats. i want
you to learn from all the resources we have (the reels AS WELL as the midi
libraries) and learn. go over everything deeply."*

Four measurement agents profiled melody practice in four separated populations,
a synthesis ranked the engine's gaps, and two adversarial verifiers re-measured
both sides (engine-side IN THE MIX, reference-side on DISJOINT samples with the
canonical picker). **Numbers below are the post-verification ones.** Where the
first-pass number was refuted or corrected it is struck through in-line.

## Populations

| population | files | notes | source |
|---|---|---|---|
| chip corpus | 354 of the pinned 400 (audios/vgmusic) + 168 independent (vgmusic-full, zero overlap) | 96k + 60k | melody-ness scored per track (splitHands' pick DISAGREES on 56% of files — its committed melody-profiles ride the wrong line half the time; noted for anyone reusing `melody-profiles-vgmusic.js`) |
| modern hand-imports | 26 (audios/manual-r22) | 4.8k | the D102 population split reappears on every metric |
| reels + reference MIDIs | 8 transcribed reels (layer-patterns rows) + get_proto/contra/Sburban | 3.9k | reel melody-role rows characterized from transcription |
| HIS endorsED set | 31 Cottonwood (filename labels!), 41 Miraleste, 4 piano-refs, 20+80 Undertale | 20k+ | "love the melody" files treated as GOLD |

## The engine's outliers (in-mix, re-baselined by the verify pass)

| metric | engine (songs.html leads, IN MIX) | reference band | verdict |
|---|---|---|---|
| stepwise motion | **16.3%** (solo-measured 12.5% — the synthesis fell into the measure-in-the-mix trap itself) | 28–57% (chip-canonical 28.2%, UT 43.2%) | outlier LOW ~2–3x |
| large leaps (>P5) | **18.9%** | reference MEDIANS 1.7–6.5% (pooled uncurated chip 15.6%) | outlier vs every median 3x+ |
| NCT rate | ~2% | 25–52% in every population | outlier LOW — the melody never leaves the chord at all |
| NCT step-resolution | 8.3% | 41–52% canonical | 5–6x gap (D101/D102's acc finding holds for the melody) |
| strong-beat chord-tone GRADIENT | flat ~97% everywhere | +6 to +17 points strong-vs-overall in EVERY population | the gradient, not an absolute corridor, is the reference shape |
| odd-16th onset share | **29.9%** in-mix (2 songs ≥74%; 13 ≥50%; 12 of 47 songs have ZERO beat-1 lead onsets) | 10–27% pooled (method-sensitive ±4–8 pts; 2–8% of reference FILES do exceed 50% — a hard per-song ban would refuse endorsed material like UT Confession at 92%) | outlier at the tail |
| short notes in bar's FINAL 16th slot | lead **32.3%**, companion **70.7%** (5.2x / 11.3x uniform) | 2.6–7.5% everywhere (uniform = 6.25%) | **the strongest claim in the whole study: the D118 shape exists in NO reference population.** |

## The grammar of melodies he loves (gold transcriptions, annotated)

- **Air_Voyage** ("love the melody… adventury"): LONG — lower-neighbor 16th —
  return — LONG landing, restated at three pitch levels over a tonic pedal.
  46% thirds, no 16th runs, 56% silence.
- **eveningnighttown**: two notes a bar, chordal skeleton; every NCT is a
  suspension resolved DOWN by step, pre-sounded by a same-pitch 16th
  anticipation (the signature pickup device).
- **rs1_bt2** (Romancing SaGa): the long leaning wrong-note ON the chord change,
  resolving late — *the corpus puts its dissonance at maximum metric weight and
  maximum duration with a guaranteed stepwise exit, never as a stray final
  16th* (the exact inverse of D118).
- **a-bsq / Rug_Ride**: freeze the rhythm cell, transform the pitch (ladder /
  reharmonization), climax = highest-and-longest note at once.
- Reels: **frozen-pitch cells dominate where harmonic rhythm is fast** (r3, r7)
  — "with harmony moving that fast, a melody that re-pitched would have no
  shape left"; chord-tone skeleton + approach notes at moderate speed (r4);
  melody enters in the texture's hole.
- Cross-population: **the rhythm cell is the identity, pitch is the variable**
  (73–82% rhythm-cell reuse vs 17–28% pitch reuse; ~4 distinct cells/8 bars).

## Laws shipped in r33 (all gated `r33()` = ruleFresh(33) && !nicheLane)

- **L2 — merge, don't drop** (`bind.js` minNote filter): the ≤3-onset-bar
  final-16th case now MERGES into the held predecessor; `noJitter` (and with it
  minNoteLast + the new flags) became the DEFAULT for fresh songs.
- **L3 — the grid law** (`gridSnapMelodyEntry`, bind.js): an odd-16th melody
  onset survives only as a pickup/run pair (next onset within a 16th); others
  snap down one 16th to the 8th grid, dropping (=merging) on collision.
  Triplets pass untouched (a different grid, not a displacement). Applied to
  the lead and every derived copy (companion/octave/handoff/arranged layers via
  leadOpts threading — the r29 lesson).
- **L4 — the melody consults the sounding chord** (`opts.subBarChords`,
  bind.js): per-onset chord resolution against the chordBeats timeline; phrase
  centers and cadence grammar stay on the downbeat chord (the verify pass's
  trap warning).
- **L1 (first mechanism) — skeleton-and-tissue** (`opts.tissue`, bind.js):
  (a) leap budget — ONE >P5 leap per phrase, further ones fold by octaves;
  (b) a weak note outside the span of its two neighbours (a 2nd–4th apart)
  re-pitches onto the supply ladder strictly BETWEEN them — a passing tone
  bracketed by step on both sides BY CONSTRUCTION (D102's both-sides law).
  The supply ladder is key-aware, so the r32 s4/s7 refutation does not reach
  this path; targets are the verifier-softened ones (stepwise ≥~30%, not 40).

## Verified-but-deferred (measured, waiting for their own round)

- **L5 — loop-origin drift: MECHANISM REFUTED, rate unexplained.** The claim:
  all 14 non-div-4-loop songs show ~39.5% apparent NCT vs *exactly* 0.0% on
  div-4 songs, the melody "one chord behind its bed". The clean 0.0% was
  flagged as the doctrine's bug-until-proven shape, and an independent probe
  (scratch l5-probe.mjs) killed the mechanism: on vs_triumphant_boss, NCT is
  46.4% at shift 0 and NO cyclic origin shift drops it below 34.5% — if a
  drifted origin were the cause, some shift would collapse it. The probe also
  exposed why both measurements are untrustworthy: the naive bar→symbol modulo
  timeline ignores r27's UNEVEN CHORD LENGTHS, so the "chord at bar N" both
  agents used may simply be wrong. Before anyone acts here, the timeline must
  come from the engine's own allocation (or the sounding accompaniment), not a
  modulo. The 14-song list is real; everything else is open.
- **Cell-level grid enforcement** (L3's second half): gridSnap fixes
  realization; the retrieval pool still contains cells that START at slot 3
  every bar. Enforcing ≤25% odd-16th at retrieval needs a device escape
  (endorsed references break a hard ban 2–8% of the time).
- **Rhythm-cell identity** (freeze rhythm / transform pitch as the VARIATION
  mechanism): recorded, not built — the statement-variation machinery re-seeds
  the walk instead of transforming a frozen cell.
- **The appoggiatura device** (long leaning downbeat NCT resolving down):
  recorded from rs1_bt2/SM3DW; nothing writes it yet.

## Corrections the verify pass forced (honesty ledger)

- All three engine headline numbers first reproduced only on UNMASKED SOLOS
  (odd-16th "39.3%" → 29.9% in-mix; stepwise "12.5%" → 16.3%; the "5 songs at
  74–100%" list was a solo artefact — 2 songs in the mix). Direction survived
  everywhere; magnitudes shrank.
- Reference stepwise/resolution were curated-high: canonical-picker numbers are
  28.2%/41.1% (chip), so L1's original ≥40%/≥45% targets demanded parity with
  the best population and were softened.
- "All off-grid in refs is swing/triplets, never jitter" is too absolute
  (9/143 chip + 1/59 UT files exceed 50% odd-16th; some are declared-meter
  artifacts inflating the reference pool itself).
- `melodyProfile`'s committed numbers ride `splitHands`' pick, which a
  melody-ness score contradicts on ~half the corpus — treat
  `src/lib/melody-profiles-vgmusic.js` as measuring "some prominent line",
  not "the melody".
