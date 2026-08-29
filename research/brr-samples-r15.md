<!-- SNES BRR sample QC (NSMB desert + "scary" pack), 2026-08-28, round 15 -->

# BRR Sample QC — NSMB Desert Voices + Scary Pack
*(motif-engine research notes. 24 wavs decoded from BRR at 32kHz/mono/int16, 0.037–0.49s each. Every number below is measured: peak/clip from sample counts cross-checked against ffprobe astats (flat-factor>0 agreed on exactly the 10 files flagged); f0 from normalized autocorrelation AND 16x-zero-padded FFT peak tables with harmonic-alignment scoring (both methods reported; disagreements resolved by which candidate's harmonic series covers the peak energy); end behavior from 2–3ms tail-window RMS vs the file's max window. Scripts: scratchpad `r15/analysis/brr-qc.py`, `brr-peaks.py`.)*

---

## 0. Headline findings (measured, not assumed)

- **The three "4th *" samples are DUAL-PITCH: two harmonic series a perfect fourth apart (ratio 4:3) baked into one sample.** 4th Oboe = 529.5Hz + 707Hz (c5+11c + f5+21c); 4th Strings = 521Hz + 697.5Hz (c5−7c + f5−1c); 4th Guitar = 106.5Hz + 142.6Hz (~a2−56c + ~cs3+49c). NSMB gets its parallel-fourths color *from the sample itself* — one keyed note plays a P4 dyad. Engine equivalent: figure token `R.~5` on any voice.
- **10 of 24 files carry decoder rail-clipping** (|sample| = 32767/32768; astats flat-factor > 0): Bell(72 smp), Sitar(4), AngelicalChoir(9), DistortedGuitar1–4(54/178/60/47), KickDrum(33), SnareDrum(116), SquareWave(4). For the DistortedGuitars this is plausibly the intended timbre; for Bell/Sitar/Choir it is decode gain hitting the int16 rail.
- **Loop points did not survive the decode.** 8 files end abruptly at high level (tail ≥ 68% of max RMS — Flute ends at 99.9%): they are raw loop chunks, unusable as instruments until loop offsets are recovered from the .brr headers. 10 files decay enough to work as one-shots now (some want a 3–5ms packaging fade — tails sit −11 to −18dB, which still clicks raw).
- **Absolute tuning is nominal-rate tuning only.** The SNES plays BRR at arbitrary engine-set rates; these f0s describe the 32kHz decode — which is exactly what a pack keyNote needs for repitching, but it is NOT "the pitch NSMB plays them at". Several land ~50c between note names (see §3).

---

## 1. QC table — NSMB desert voices (13)

f0 column = resolved fundamental (method noted when autocorr/FFT disagreed). tail = last-2ms RMS below the loudest 2ms window.

| File | durS | peak dBFS | clip smp | f0 (Hz) | keyNote (cents) | end / tail | periodicity | timbre |
|---|---|---|---|---|---|---|---|---|
| Sitar | 0.277 | **0.0** | **4** | 698 | **f5** (−1c) | decay-ish, −18.6dB (fade) | 0.91 | bright jawari buzz — harmonics 4/5/8 dominate (2795/3491/5588Hz), true sitar sparkle |
| Tabla | 0.081 | −6.1 | 0 | 306.8 (mode) | ds4 (−24c) | decay-ish, −11.6dB (**fade needed**) | 0.92 | tight tabla stroke ("tin/na"), ring at h2/h3 (614/918Hz), skin resonance |
| Low Drum | 0.238 | −7.2 | 0 | 94 | fs2/g2 seam (+28/−37c) | decay-ish, −13.3dB (fade) | 0.82 | deep hand-drum "doum" — dholak/floor-tom body, dark (centroid 750Hz) |
| Bah | 0.174 | −6.0 | 0 | 656–664 | **e5** (−8c) | decays, −25.4dB — clean one-shot | 0.93 | THE NSMB "BAH!" stab — brassy shout, split 2nd harmonic (1305/1331Hz = baked ensemble detune) |
| Oboe | 0.050 | −6.1 | 0 | 525.5 | c5 (+9c) | **loop-cut** (90% RMS) | 0.94 | nasal single oboe sustain |
| 4th Oboe | 0.052 | −10.0 | 0 | 529.5 + 707 | c5+f5 dyad | **loop-cut** (68%) | 0.85 | double-reed P4 dyad — the snake-charmer color |
| 4th Strings | 0.135 | −6.0 | 0 | 521 + 697.5 | c5+f5 dyad | **loop-cut** (82%) | 0.91 | bright saw-ish string section, P4 dyad |
| 4th Guitar | 0.109 | −6.1 | 0 | 106.5 + 142.6 | ~a2+~d3 dyad (±~50c) | **loop-cut** (96%) | — | muted nasal pluck pair, low P4 chug |
| Ensemble | 0.231 | −6.1 | 0 | 393.5 | g4 (+7c) | **loop-cut** (91%) | 0.96 | orchestral unison sustain — weak fundamental, energy at h2/h3/h4 (785/1181/1571Hz) |
| Flute | 0.267 | −7.9 | 0 | 1048.5 | c6 (+3c) | **loop-cut** (99.9%) | 0.98 | breathy recorder-ish flute sustain |
| Bass | 0.093 | −6.1 | 0 | 66.6 | c2 (+31c) | **loop-cut** (96%) | — | round bass, textbook harmonic series (score 0.98 — h1..h8 all present) |
| Kalimba | 0.075 | −8.8 | 0 | 264→254 (glide) | c4 (+19c→−51c) | decays, −20.2dB | 0.73→0.86 | soft thumb-piano pluck, near-pure tone (one peak = 100%, rest ≤7%) |
| Bell | 0.141 | **0.0** | **72** | inharmonic | n/a (see §3) | natural decay, −33.2dB | 0.43 | glassy strike — partials 2967/6905/10294Hz, DC −596; clipped attack |

## 2. QC table — scary pack (11)

| File | durS | peak dBFS | clip smp | f0 (Hz) | keyNote (cents) | end / tail | periodicity | timbre |
|---|---|---|---|---|---|---|---|---|
| Laugh | 0.338 | −8.2 | 0 | ~2120 cluster | unpitched | decays, −17.8dB (fade) | 0.35 | high witch-cackle burst — dense 1.9–3.4kHz cluster, DC +419 |
| AngelicalChoir | 0.487 | **0.0** | **9** | 650/765/957 cluster | unpitched cluster | decays-ish, −14.5dB (fade) | 0.15 | breathy shimmering ghost-choir formant — three NON-harmonic peaks (a chord/cluster, not one note), centroid 8.8kHz |
| Bass1 | 0.146 | −9.9 | 0 | 73.9 | **d2** (+11c) | decays, −17.9dB (fade) | 0.81 | round plucked synth bass, strong h3 |
| Bass2 | 0.158 | −9.2 | 0 | 92.3 (+62Hz ghost) | fs2 (−4c) | decays, −26.1dB — clean | 0.83 | grittier bass; 138Hz fifth partial + unexplained 62Hz component (§3) |
| KickDrum | 0.359 | **0.0** | **33** | ~111 thump | unpitched | decays, −18.3dB | 0.26 | crunchy lo-fi SNES kick — thump + broadband grit |
| SnareDrum | 0.365 | **0.0** | **116** | noise | unpitched | true silence (last 8 smp = 0) | 0.19 | clipped noise snare, long rattle tail |
| DistortedGuitar1 | 0.061 | **0.0** | **54** | inharmonic | unpitched | decays, −16dB | 0.32 | short dissonant chord stab, DC −1113 |
| DistortedGuitar2 | 0.172 | **0.0** | **178** | ~61 rumble | ~b1-ish | decays, −13dB | 0.12 | low chug — the most-clipped file, DC −845 |
| DistortedGuitar3 | 0.296 | **0.0** | **60** | inharmonic | unpitched | decays, −16dB | 0.07 | midrange dissonant smear cluster |
| DistortedGuitar4 | 0.123 | **0.0** | **47** | inharmonic | unpitched | decays, −13dB | 0.14 | mid chord stab |
| SquareWave | 0.037 | 0.0 | 4 | 1140 (h3 at 3419 confirms) | cs6 (+48c) | **loop-cut** (54%) | 0.34 | raw chip square blip + decode noise floor |

---

## 3. Pitch-resolution notes (where the two methods disagreed)

- **Ensemble**: FFT peak said g5 (785Hz) but autocorr said g4 (393.5, periodicity 0.96) — and EVERY spectral peak (785/1181/1571/2361/3148/3936) is an integer harmonic of 393.5. Fundamental is weak, f0 = **g4**. Same resolution pattern for Tabla (mode 306.8 with energy at h2/h3) and Bah (656 with energy at h2/h3).
- **Sitar**: HPS initially said c7 (2095 = 3×698). Peak-alignment score: 698Hz covers 67% of peak energy as h1/h3/h4/h5/h8 → **f5**.
- **Bass**: first-pass autocorr blew up (parabolic-refine artifact on a 74ms body); FFT series is immaculate → **c2+31c**.
- **Kalimba**: pitch GLIDES — windowed autocorr: first half 264.5Hz (c4+19c, ac-peak 0.58), second half 254.0Hz (c4−51c, ac-peak 0.86). Perceived pitch tracks the attack → call it **c4**, but it straddles ~70c. Whether the glide is in the source or a decode artifact is unknown.
- **Bell**: an early harmonic-product estimate (989Hz/b5) is NOT corroborated by any real spectral peak (strongest actual partials 2967/6905/10294Hz, non-integer ratios) — classic inharmonic bell. Treat as **unpitched** sparkle.
- **Bass2**: 92.3Hz series (h: 92/138≈fifth?/214…) plus a 62Hz component that fits no series (92/62 = 1.48 ≈ 3/2 — possibly a baked root+fifth layer like the "4th" samples, possibly BRR noise). Primary = fs2−4c; dyad status UNRESOLVED.
- **Tuning offsets**: many files sit +2..+31c sharp of A440 and four sit near the ±50c seam (4th Guitar both notes, Low Drum, Kalimba sustain, SquareWave). The pack format has no cents/`tune` field — repitching from these keyNotes carries up to ~half-semitone error on those four.

---

## 4. Engine-law relevance (confirm / extend / contradict)

- **CONFIRMS desert law**: the NSMB desert voice set is literally sitar (lead) + tabla + low hand drum (the iqa' floor) + marimba-adjacent kalimba/bell — matching sitar/shanai/oboe leads + hand-drum iqa' + marimba ostinato (D93). The Bah stab confirms a stab-stamp voice exists in the reference palette.
- **EXTENDS**: the "4th" dual-pitch samples show NSMB bakes **parallel perfect fourths into the timbre itself** (oboe, strings, guitar variants all at 4:3). Engine-ready equivalent without any sample: figure token **`R.~5`** on the acc/stab voice. This is a cheap way to get the NSMB dyad color on existing synth voices — no new sample needed.
- **CONFIRMS horror dosing doctrine**: the "scary" pack is timbral, not harmonic — clipped/distorted guitars, a detuned non-harmonic choir cluster, lo-fi clipped drums, one cackle. Dissonance lives in TIMBRE over whatever floor the song plays — exactly the one-harmonic-device / rest-is-timbre budget (D93 horror lanes).
- **No contradictions measured.**

---

## 5. Proposed sample-pack rows

Precedent: hx_ (Ethan's horror pack) / vc_ (VCSL/VSCO). New prefixes `nsmb_` / `sc_`; srcs assume the wavs move to `audios/snes-brr/{nsmb,scary}/`. Blast-radius: envOnly gating happens at the INSTRUMENTS layer (desert-only / horror-only), and unclicked pack entries never enter retrieval pools — adding these rows re-rolls nothing.

**Tier 1 — propose now (one-shot-ready, QC-clean enough):**

```js
const BN = (f) => `audios/snes-brr/nsmb/${f}`;
const BS = (f) => `audios/snes-brr/scary/${f}`;

// desert (gate envOnly: desert at INSTRUMENTS)
nsmb_tabla: { kind: 'hit', durS: 0.08, srcs: [BN('Tabla.wav')], note: 'NSMB tabla stroke, ds4-24c mode ring — the tak beside nsmb_lowdrum; tail -11.6dB, bake 3-5ms fade at pack build' },
nsmb_lowdrum: { kind: 'hit', durS: 0.24, srcs: [BN('Low Drum.wav')], note: 'NSMB deep hand drum ~94Hz (fs2/g2 seam) — the dum; tail -13dB, 3ms fade' },
nsmb_bah: { kind: 'oneshot', durS: 0.17, keyNote: 'e5', srcs: [BN('Bah.wav')], note: 'THE NSMB "bah" stab, e5-8c, baked ensemble detune; decays clean (-25dB tail) — A-start stamp / stab material' },
nsmb_sitar: { kind: 'pitched', dir: 'audios/snes-brr/nsmb-sitar', match: /^sitar-/, note: 'rename Sitar.wav -> sitar-f5.wav (measured f5-1c); 0.28s pluck one-shot per note — short melody notes only until BRR loop point recovered; 4-smp rail clip in attack (buzz reads as jawari)' },
nsmb_kalimba: { kind: 'oneshot', durS: 0.075, keyNote: 'c4', srcs: [BN('Kalimba.wav')], note: 'thumb-piano pluck c4 (glides +19c->-51c — ±50c risk); marimba-ostinato-adjacent color' },

// horror (gate envOnly: horror)
sc_laugh: { kind: 'oneshot', durS: 0.34, srcs: [BS('Laugh.wav')], note: 'witch-cackle burst — sparse sting like hx_crow; 3ms fade' },
sc_choir_shimmer: { kind: 'oneshot', durS: 0.49, srcs: [BS('AngelicalChoir.wav')], note: 'ghost-choir formant cluster (650/765/957Hz non-harmonic — unpitched); clipped 9 smp, DC +474 — high-pass + fade at build; manor-lane glint' },
```

**Tier 2 — usable, weaker case (hold unless a vibe asks):** `nsmb_bell` (oneshot, natural decay but 72-smp clipped attack; competes with vc_zill), `sc_kick`/`sc_snare` (clipped lo-fi SNES drums — a deliberate crunch tier), `sc_bass1` (d2+11c, decays — could serve as a plucked horror bass one-shot), `sc_distgtr1-4` (clipped stab cluster — catacombs stinger material if Ethan wants grit).

**Hold — NOT packable until BRR loop offsets are recovered** (raw loop chunks, tails at 68–99.9% RMS = hard click): Flute, Oboe, 4th Oboe, 4th Strings, 4th Guitar, Ensemble, Bass, SquareWave, plus sustained (non-pluck) use of Sitar/Bass1/Bass2. With loop points these become real sustaining instruments (sfz `loop_mode=loop_continuous` on the HQ tier); without them, nothing.

---

## 6. UNCERTAINTIES (surfaced, not resolved)

1. **LICENSING (the big one)**: these are BRR rips of Nintendo-copyrighted recordings (NSMB / original compositions) hosted on SMWC. Fine as LOCAL audition references — but `build-sample-pack.mjs` emits `audition/sample-pack.js` as **committed** mp3 data-URIs (hx_ precedent). Adding these rows as-is would commit Nintendo audio to the repo. Needs Ethan's call: keep them out of the committed pack (local-only build flag), or accept the risk. Do NOT merge Tier 1 before this is decided.
2. **Loop offsets**: the decode discarded BRR loop headers. To sustain any "hold" file we need the original .brr files (or the decoder's loop report) — the loop-start lives in the BRR/AMK header. Without it, §5's hold list is hard-blocked.
3. **Absolute pitch is decode-rate pitch**: 32kHz is the nominal DSP rate; in-game each note plays at an engine-set rate. keyNotes above are correct for repitching the decoded file, but four files sit ~±50c off any note name (4th Guitar, Low Drum, Kalimba sustain, SquareWave) and the pack format has no cents field — repitch error up to a quarter-tone there.
4. **Kalimba glide** (c4+19c → c4−51c over 75ms): real source behavior vs decode artifact — unverified.
5. **Bass2's 62Hz component**: fits no harmonic series of the 92.3Hz primary (ratio ≈ 3/2 below); baked fifth layer or BRR noise — unresolved.
6. **AngelicalChoir cluster**: three non-harmonic peaks could be a recorded CHORD; no single keyNote is honest. Proposed as unpitched.
7. **Clipping provenance**: rail-clamp could be (a) the original SNES sample already hot, or (b) decoder gain choice. If (b), a re-decode at lower gain would clean Bell/Sitar/Choir. Can't distinguish from the wavs alone.
8. **DC offsets** up to −1113 (DistortedGuitar1) / −845 (DG2) / −596 (Bell) / +474 (Choir) / +419 (Laugh): recommend a high-pass (~20Hz) at pack build; not yet applied anywhere.
9. **Tabla is ONE articulation** (one stroke, no round-robins, no dum/tak pair within itself). An iqa' needs distinct dum+tak: proposed pairing is nsmb_lowdrum (dum) + nsmb_tabla (tak) — musically plausible, unheard by Ethan's ear.
10. **"Scary" pack game provenance** unverified (filenames only — no game metadata in the wavs).

*Scripts + raw JSON: scratchpad `r15/analysis/{brr-qc.py, qc.json, brr-peaks.py, peaks.txt}`.*
