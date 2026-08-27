// audition/videolab.html — the VIDEO TECHNIQUE LAB (D69).
//
// Ethan: "take everything you learned from the videos ... then generate some
// music using what you learned and ill give feedback via boxes nd keep/kill,
// experimenting with combinations or such."
//
// Ten cards, three kinds of experiment:
//   FAITHFUL     the technique played the way its video plays it
//   TRANSPLANT   a video device applied to OUR material (kept exemplars,
//                our instruments)
//   COMBINATION  two or more video devices composed
// Every card names its techniques and sources; export uses the derived
// format (page 'videolab') so import-verdicts.mjs lands verdicts unchanged.
// Deterministic: no randomness anywhere.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure } from '../src/binder/bind.js';
import { PROGRESSIONS_VIDEOS } from '../src/lib/progressions-videos.js';
import { FIGURATIONS_VIDEOS } from '../src/lib/figurations-videos.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const V = PROGRESSIONS_VIDEOS;
const F = FIGURATIONS_VIDEOS;
const ctxOf = (entry, key, barsPerChord = 1) => ({
  harmony: renderProgression(entry, key), barsPerChord, key,
});
// D76: binder warnings surface at build time — the undershadow "weird" bars
// were a default-interval fallback (b7 over a plain triad) that had been
// warning into the void for four rounds.
const FIG_WARNINGS = new Set();
const fig = (entry, ctx, opts) => {
  const b = bindFigure(entry, ctx, '4/4', { sound: 'piano', ...opts });
  for (const w of b.warnings ?? []) FIG_WARNINGS.add(`[${entry.name ?? '?'}] ${w}`);
  return b.expr;
};

const cards = [];
function card(c) { cards.push(c); }

// ---------------------------------------------------------------------------
// 1. REVISION — the two G#m9 chords he liked, vamped. (Round 1 killed the
// Tyler melt card — "this doesn't sound good and doesn't make sense" — so
// vid_tyler_loop is banned and the sus-melt dyad stays unvindicated in the
// library. This slot answers his gsharp note instead: "I liked the first
// two, the third and fourth chords didn't sound good".)
// ---------------------------------------------------------------------------
{
  // Round 2: "this sounds good but also im looking for variations and
  // add-ons (so that it becomes a 4-chord progression). also add a melody
  // and more layering because this is a valid combo." The two added chords
  // come from colors he has KEPT (the aquatic ladder's bVI^9 and its
  // v-as-minor7) — never the D#7/A9 he faulted twice. The melody is an
  // authored 4-bar phrase in his own grammar: held notes, no re-strikes
  // (bar boundaries and the loop seam included), the b3->9 sigh he liked,
  // a v-root landing that steps back up into the loop.
  // Round 3: "last chord sounds slightly incorrect. also add a melody -
  // not just a loop but a full song with progression!" Two fixes and a
  // graduation: (1) the "slightly incorrect" was REAL and located — the
  // pad's R.5.9 put E# (the 9th of D#m7) over the v chord, a note foreign
  // to G# minor; the pad now stacks R.5.7, whose 7ths are diatonic on all
  // four chords. (2) The card is a SONG now: A A' B A over 16 bars — the
  // vamp twice (the melody's answer varied the second time), a B section
  // on bIII^7 (B^7, new but fully diatonic), the theme's return. One
  // concatenated 16-bar harmony, no masks on the harmony itself (D63).
  // The round-4 verify pass found the E# was never only the pad's: the
  // CLIMB's 9th token also sounds E# on every D#m7 bar — the chord itself
  // makes standard color tokens non-diatonic. So the fourth chord becomes
  // bVII7 (F#7): every 7th and 9th any layer renders on it is diatonic,
  // and bVII7 -> i is the aeolian cadence — no dominant, his aquatic rule.
  // Round 4: "the chord progression sound weird because it keeps going
  // upwards which sounds like it's building up when that's the whole loop.
  // so last two chords in both chord progressions sound weird." He heard a
  // BINDER BUG, precisely: the walking-root rule (nearest candidate to the
  // previous root) climbs +5+3+2+2 = +12 on the G#-C#-E-F# cycle — one full
  // octave per pass, forever. The fix is twofold: (1) both progressions are
  // reshaped to ARCH — the last two chords come DOWN (verse: E^9 -> B^7 ->
  // home, roots 56 61 64 59 56; bridge: iv9 bVI^9 v7 bIII^7, peak then fall)
  // so net drift is zero by construction; (2) every layer binds with
  // loopRoots (D76), the engine guard that folds any octave-drifted root
  // back into register. B^7 (bIII^7) and D#m7 (v7) are diatonic, no
  // dominant; the climb never sees D#m7 (masked off in the bridge), so its
  // 9th token cannot land E# (the round-4 lesson). The melody survives the
  // reharm unchanged: every held pitch re-checks as a chord tone or
  // diatonic color on the new chords.
  const vamp4 = { degrees: '0:m9 5:m9 8:^9 3:^7', numerals: null };
  const bSec = { degrees: '5:m9 8:^9 7:m7 3:^7', numerals: null };
  const vSyms = renderProgression(vamp4, 'G#:minor');
  const bSyms = renderProgression(bSec, 'G#:minor');
  const ctx = { harmony: [...vSyms, ...vSyms, ...bSyms, ...vSyms], barsPerChord: 1, key: 'G#:minor' };
  const climb = `${fig(F.vid_climb_block_restrike, ctx, { octave: 3, loopRoots: true, fx: '.gain(0.42).room(0.45).clip(0.85)' })}.mask("<1@8 0@4 1@4>")`;
  // hand-written 16-bar melody (the bars:4-figure trap from the round-3
  // verify pass): A phrase, its varied answer, a higher B phrase ending on
  // the section climax, the theme's return; all notes held to the next,
  // no neighbour re-strikes, every pitch diatonic to G# minor
  const melody = `note("<[F#5@3 A#5] [G#5@2 E5 D#5] [B5@2 G#5@2] [F#5@3 D#5] [F#5@3 A#5] [G#5@2 E5 D#5] [B5@3 C#6] [A#5@2 G#5 D#5] [D#6@2 A#5@2] [B5@2 E5@2] [F#5@2 G#5@2] [F#6@3 D#6] [F#5@3 A#5] [G#5@2 E5 D#5] [B5@2 G#5@2] [F#5@3 D#5]>").s("piano").gain(0.7).room(0.5).clip(1.1)`;
  const pad = fig({ name: 'vamp-pad', bars: 1, onsets: ['0'], figure: ['R.5.7+'], accents: [0.6], legato: true },
    ctx, { sound: 'gm_string_ensemble_1', octave: 3, loopRoots: true, fx: '.gain(0.28).room(0.55).clip(1.3)' });
  const bass = fig({ name: 'root', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.7], legato: true },
    ctx, { octave: 2, loopRoots: true, fx: '.gain(0.55).room(0.2)' });
  const mix = `stack(${melody}, ${climb}, ${pad}, ${bass})`;
  card({
    name: 'vl_gsharp_vamp', kind: 'SONG',
    title: 'G#m9 vamp — the song',
    techniques: ['A A′ B A form over 16 bars', 'i9-iv9-bVI^9-bIII^7 verse — an ARCH: the last two chords come down home', 'bridge: iv9 bVI^9 v7 bIII^7 (peak then fall, no dominant)', 'loop-locked walking roots (D76 — the octave-per-pass spiral is gone)', 'held-note melody with varied answer + B climax'],
    sources: ['igexport-DceNMCmuYZV (G#m9 reel)', 'igexport-DZKQMVQsj79 (the kept colors)', 'his round-4 note'],
    key: 'G#:minor', bpm: 80, degrees: vamp4.degrees, base: 'vid_gsharp_climb', family: 'minor',
    symbols: [...vSyms, '|', ...bSyms], totalBars: 16,
    mix,
    solos: { _melody: melody, _climb: climb, _pad: pad, _bass: bass },
    note: 'You heard a real engine bug: the walking bass rule climbs an OCTAVE per pass on this chord cycle (G#-C#-E-F# ascends +12 total), so the whole song spiralled upward — "building up when that\'s the whole loop", exactly. Fixed twice over: the progressions now ARCH (verse ends E^9 -> B^7 falling home; bridge peaks then falls through v7 to B^7), and the binder folds any drifted root back into register. Same melody — every note still lands a chord tone.',
  });
}

// ---------------------------------------------------------------------------
// 2. FAITHFUL — the G#m9 octave climb, block restrikes + walk-down tags.
// ---------------------------------------------------------------------------
{
  const ctx = ctxOf(V.vid_gsharp_climb, 'G#:minor');
  const climb = fig(F.vid_climb_block_restrike, ctx, { octave: 3, fx: '.gain(0.62).room(0.45).clip(0.85)' });
  card({
    name: 'vl_gsharp_climb', kind: 'FAITHFUL',
    title: 'G#m9 terraced climb',
    techniques: ['block-restrike octave climb', '9-under-b3 crunch cluster', 'post-climb walk-down tag'],
    sources: ['igexport-DceNMCmuYZV (G#m9 reel)'],
    key: 'G#:minor', bpm: 80, degrees: V.vid_gsharp_climb.degrees, base: 'vid_gsharp_climb', family: 'minor',
    symbols: ctx.harmony, totalBars: 8,
    mix: climb,
    solos: { _climb: climb },
    note: 'Solo piano like the source: the whole rootless cluster restruck one octave higher per beat, released between strikes, two walk-down 8ths on beat 4.',
  });
}

// ---------------------------------------------------------------------------
// 3. FAITHFUL+COMBINATION — the bronik build: fixed cell, moving bass.
// The climb NEVER changes (static Cm); the bass walks 1-b7-b6-5 under it —
// the reharm happens in the listener. Bell tag two octaves up, every 2 bars.
// ---------------------------------------------------------------------------
{
  const ctxStatic = { harmony: ['Cm'], barsPerChord: 1, key: 'C:minor' };
  // Round 3: "I can't hear low notes at all now" — worse, not better,
  // which convicts the INSTRUMENT: the gm_synth_bass_1 soundfont is
  // unreliable below C2 in the browser player (the harness can't hear
  // that). The fix is a basic waveform, which always sounds: a sawtooth
  // low-passed into a synth bass. Saw has dense harmonics, so it reads on
  // any speaker at any pitch.
  const climb = fig(F.vid_climb_bronik_add9, ctxStatic, { sound: 'gm_lead_1_square', octave: 4, fx: '.gain(0.2).lpf(1500).room(0.3).clip(0.7)' });
  const bass = `note("<c2 bb1 ab1 g1>").s("sawtooth").lpf(700).gain(0.85).clip(1.05)`;
  const bell = fig({ name: 'bell-tag', bars: 2, onsets: ['3/4', '7/8'], figure: ['R++', '9++'], accents: [0.6, 0.55], legato: false }, ctxStatic, { sound: 'gm_celesta', octave: 4, fx: '.gain(0.18).room(0.5)' });
  const mix = `stack(${climb}, ${bass}, ${bell})`;
  card({
    name: 'vl_bronik_build', kind: 'FAITHFUL',
    title: 'bronik build — fixed cell over a walking bass',
    techniques: ['1-9-b3-5 octave climb', 'fixed upper cell / moving bass reharm', 'octave-height layer echo', 'bell walk-up tag'],
    sources: ['sr 13-25-13 (@bronikbeats Impossible)'],
    key: 'C:minor', bpm: 102, degrees: V.vid_bronik_descent.degrees, base: 'vid_bronik_descent', family: 'minor',
    symbols: ['Cm(add9)', 'Cm/Bb', 'Abmaj7#11', 'G(b13)'], totalBars: 8,
    mix,
    solos: { _climb: climb, _bass: bass, _bell: bell },
    note: 'The arp literally never changes — only the bass moves (C Bb Ab G), so the same eight notes re-name themselves four ways. Round-3 fix: the bass is now a low-passed SAWTOOTH — the soundfont bass goes quiet below C2 in the browser, a raw waveform cannot.',
  });
}

// ---------------------------------------------------------------------------
// 3b. VARIANT — bronik with "more complex variations" (his round-4 keep note).
// The kept card is untouched; this one grows it to 16 bars in four passes:
// the octave echo breathes in and out (passes 2 and 4), and pass 3 walks a
// NEW bass line (Ab F Eb G) under the same never-changing cell, so the reharm
// trick happens twice — the second time through chords the first pass never
// named. All still one cell; the variation is entirely underneath it.
// ---------------------------------------------------------------------------
{
  const ctxStatic = { harmony: ['Cm'], barsPerChord: 1, key: 'C:minor' };
  const climb = fig(F.vid_climb_bronik_add9, ctxStatic, { sound: 'gm_lead_1_square', octave: 4, fx: '.gain(0.2).lpf(1500).room(0.3).clip(0.7)' });
  const echo = `${fig(F.vid_climb_bronik_add9, ctxStatic, { sound: 'gm_lead_1_square', octave: 5, fx: '.gain(0.11).lpf(2200).room(0.5).clip(0.7)' })}.mask("<0@4 1@4 0@4 1@4>")`;
  const bass = `note("<c2 bb1 ab1 g1 c2 bb1 ab1 g1 ab1 f1 eb1 g1 c2 bb1 ab1 g1>").s("sawtooth").lpf(700).gain(0.85).clip(1.05)`;
  const bell = fig({ name: 'bell-tag', bars: 2, onsets: ['3/4', '7/8'], figure: ['R++', '9++'], accents: [0.6, 0.55], legato: false }, ctxStatic, { sound: 'gm_celesta', octave: 4, fx: '.gain(0.18).room(0.5)' });
  const mix = `stack(${climb}, ${echo}, ${bass}, ${bell})`;
  card({
    name: 'vl_bronik_var', kind: 'VARIANT',
    title: 'bronik build — deeper variations',
    techniques: ['16 bars, four passes of the fixed cell', 'octave echo breathing in/out (passes 2 and 4)', 'pass 3: a SECOND bass walk (Ab F Eb G) renames the cell again — Ab^7#11, F13, Eb^7(13), G(b13)', 'bell walk-up tag throughout'],
    sources: ['sr 13-25-13 (@bronikbeats Impossible)', 'his round-4 keep note'],
    key: 'C:minor', bpm: 102, degrees: V.vid_bronik_descent.degrees, base: 'vid_bronik_descent', family: 'minor',
    symbols: ['Cm(add9)', 'Cm/Bb', 'Abmaj7#11', 'G(b13)', '|', 'Abmaj7#11', 'F13', 'Eb^7(13)', 'G(b13)'], totalBars: 16,
    mix,
    solos: { _climb: climb, _echo: echo, _bass: bass, _bell: bell },
    note: 'Your keep, grown: the kept 8 bars are passes 1-2 (the octave echo now enters on pass 2), then pass 3 drops a NEW bass walk — Ab F Eb G — under the unchanged cell, so the same eight notes get four MORE names (F13, an Eb^7 with the cell as its 13th), and pass 4 comes home with the echo still ringing. The kept card itself is untouched.',
  });
}

// ---------------------------------------------------------------------------
// 4. FAITHFUL — the aquatic quintal ladder (the water-vibe candidate).
// ---------------------------------------------------------------------------
{
  const ctx = ctxOf(V.vid_aquatic_ladder, 'F#:minor', 2);
  const ladder = fig(F.vid_ladder_quintal, ctx, { octave: 2, fx: '.gain(0.6).room(0.6).clip(1.3)' });
  card({
    name: 'vl_aquatic_ladder', kind: 'FAITHFUL',
    title: 'Aquatic quintal ladder',
    techniques: ['stacked-5ths ladder (1-5-9)', '9-under-b3 blur slide', 'figure bar + pedal hold bar', 'no cadential V'],
    sources: ['igexport-DZKQMVQsj79 (Aquatic Ambience cover)'],
    key: 'F#:minor', bpm: 141, degrees: V.vid_aquatic_ladder.degrees, base: 'vid_aquatic_ladder', family: 'minor',
    symbols: ctx.harmony, totalBars: 20,
    mix: ladder,
    solos: { _ladder: ladder },
    note: 'One voice + pedal: the ladder climbs bar 1, bar 2 is the wash. i-bVI-iv-iv-v with the iv recolored on repeat. THE candidate texture for our water vibe.',
  });
}

// ---------------------------------------------------------------------------
// 5. COMBINATION — the modulation elevator: Abm loop → four altered
// dominants climbing → the same grip in A minor. A modulating mini-song.
// ---------------------------------------------------------------------------
{
  const grip = { name: 'm11-grip', bars: 1, onsets: ['0'], figure: ['R.7+.3+.4+.5+'], accents: [0.72], legato: true };
  const bassF = { name: 'root', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.7], legato: true };
  // ONE concatenated harmony — no masks, so nothing can phase-drift when the
  // loop repeats (the D63 lesson): A x2, the elevator, C x2 = 22 absolute
  // symbols; keys only decided the spelling at render time.
  const symsA = renderProgression(V.vid_pixel_abm, 'Ab:minor');
  const symsB = renderProgression(V.vid_pixel_elevator, 'Ab:minor');
  // Round 1: "the last section sounded kinda strange" — the arrival was the
  // video's third section, NEW music in the new key, so the ear got a
  // modulation AND unfamiliar material at once. Now the elevator lands on
  // the SAME theme a semitone up: the modulation is the event, the material
  // stays familiar.
  const symsC = renderProgression(V.vid_pixel_abm, 'A:minor');
  const T = 17;
  // The verify pass measured the A-minor arrival landing +13 (octave +
  // semitone) on its first two bars and +1 on the rest — the binder's
  // register choice is voice-led through the whole 16-chord list, so
  // rendering the arrival chords in place cannot guarantee the theme's own
  // register. Instead the arrival slots carry the DEPARTURE theme verbatim
  // and a patterned add lifts bars 11-16. The binder renders those repeat
  // bars +12 (its ref keeps walking up through the climb), so the lift is
  // -11: measured net +1, asserted below at build time. The add pattern's
  // period is 16 = the harmony period, so nothing drifts (D63). symsC
  // still names what SOUNDS (the lifted chords) for the card display.
  // Round 3: "the last section sounded kinda strange" arrived a THIRD time
  // (twice could have been a stale note-box; three is a verdict). Best
  // theory: the register was fixed, so what remains strange is the SEAM —
  // the loop fell from A minor straight back down to Ab minor with no
  // preparation. A 17th bar closes the cycle: one held Eb7, the V of Ab
  // minor, pulling home before the loop restarts. Lift pattern widened to
  // period 17 to match (D63).
  const allSyms = [...symsA, ...symsA, ...symsB, ...symsA, ...symsA, 'Eb7'];
  const ctx = { harmony: allSyms, barsPerChord: 1, key: 'Ab:minor' };
  const lift = `.add(note("<0@10 -11@6 0>"))`;
  // the quartal grip's 3+4 cluster is the card's SOUND mid-loop, but on
  // the turnaround bar it put G against Ab a semitone apart at the top of
  // the register (the round-4 verify pass measured midis 79,80 adjacent) —
  // bar 17 gets a plain R.3.7 shell instead: a clean dominant pulling home
  const shell17 = { name: 'turn-shell', bars: 1, onsets: ['0'], figure: ['R.3+.7+'], accents: [0.66], legato: true };
  const gripX = `stack(${fig(grip, ctx, { octave: 3, fx: '.gain(0.58).room(0.4).clip(1.2)' })}.mask("<1@16 0>"), ${fig(shell17, ctx, { octave: 3, fx: '.gain(0.55).room(0.45).clip(1.2)' })}.mask("<0@16 1>"))${lift}`;
  const bassX = `${fig(bassF, ctx, { octave: 2, fx: '.gain(0.52)' })}${lift}`;
  const mix = `stack(${gripX}, ${bassX})`;
  const gA = gripX, gB = bassX, gC = mix;
  card({
    name: 'vl_elevator', kind: 'COMBINATION',
    title: 'The dominant elevator — one grip, two keys',
    techniques: ['m7(11) quartal grip', 'chromatic altered-dominant elevator (modulation, not color)', 'planing at song scale'],
    sources: ['igexport-Db-2YGCvU68 (pixel-font modulation reel)'],
    key: 'Ab:minor → A:minor', bpm: 86, degrees: V.vid_pixel_abm.degrees, base: 'vid_pixel_abm', family: 'minor',
    symbols: [...symsA, '|', ...symsB, '|', ...symsC, '|', 'Eb7'], totalBars: T,
    mix,
    solos: { _grip: gA, _bass: gB },
    note: 'Six bars of the Abm grip, C7-D7-Eb7-E7 climbing, the SAME six bars a semitone up — and now a 17th bar: one held Eb7 pulling the loop home to Ab minor, so the wrap is prepared instead of falling a semitone cold. If the last section STILL sounds strange, say which bars.',
  });
}

// ---------------------------------------------------------------------------
// 6. TRANSPLANT — the arp under-shadow on OUR water harmony.
// "add a note below every arp note" over ut_once_upon_a_time_p3 (the D67
// calm-water base he kept the harmony of).
// ---------------------------------------------------------------------------
{
  const ctx = { harmony: renderProgression({ degrees: '0 2 5:^7 0:7', numerals: null }, 'C:major'), barsPerChord: 1, key: 'C:major' };
  // Round 3: "still worse - it doesn't match that well, too funky" — the
  // trajectory is unambiguous now: every round that ADDED left-hand motion
  // made it worse (block -> rock -> rise). So the left hand does the least
  // a left hand can do: one held root per bar, deep in the pedal, nothing
  // else. The waterfall IS the harmony; the bass only names it.
  // Round 4: "the first chord left hand and second left hand are weird,
  // moreover the second right hand is also kinda weird" — bars 1-2 exactly,
  // and MEASURED: the C and D chords are plain triads, so the figure's 7
  // token hits the binder's default-interval fallback (b7 = 10 semis). Bar 1
  // sounded Bb — foreign to C major — as an octave DYAD ('7+.7', the lowest
  // waterfall voice, i.e. what reads as left hand); bar 2 sounded C natural
  // grinding against D major's F#. Bars 3-4 have real 7ths, hence "the third
  // chord works". The triad bars now run a 6-for-7 waterfall (A over C = C6,
  // B over D = D6 — both diatonic, the warm added-sixth sound); the seventh
  // chords keep the original figure. Masks are period 4 = the loop (D63).
  const undershadow6 = { ...F.vid_arp_undershadow, name: 'arp-undershadow-6', figure: ['R++.R+', '6+.6', '5+.9', '3+.R+', '9.5+', 'R+.3+', '6.9', '5.R+'] };
  const shadowTriads = `${fig(undershadow6, ctx, { octave: 4, fx: '.gain(0.55).room(0.6).clip(1.4)' })}.mask("<1 1 0 0>")`;
  const shadowSevenths = `${fig(F.vid_arp_undershadow, ctx, { octave: 4, fx: '.gain(0.55).room(0.6).clip(1.4)' })}.mask("<0 0 1 1>")`;
  const shadow = `stack(${shadowTriads}, ${shadowSevenths})`;
  const bass = fig({ name: 'root-hold', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.55], legato: true }, ctx, { octave: 2, fx: '.gain(0.42).room(0.65).clip(1.6)' });
  card({
    name: 'vl_undershadow_water', kind: 'TRANSPLANT',
    title: 'Under-shadowed arp on the water harmony',
    techniques: ['arp under-shadow (dyad waterfall)', '6-for-7 waterfall on the triad bars (the fallback b7 was the "weird")', 'minimum left hand: one held root per bar'],
    sources: ['sr 13-26-56 (arp trick)', 'our ut_once_upon_a_time_p3 (your kept water harmony)'],
    key: 'C:major', bpm: 60, degrees: '0 2 5:^7 0:7', base: 'ut_once_upon_a_time_p3', family: 'major',
    symbols: ctx.harmony, totalBars: 8,
    mix: `stack(${shadow}, ${bass})`,
    solos: { _shadow: shadow, _bass: bass },
    note: 'Bars 1-2 located and measured: C and D are plain triads, so the waterfall\'s 7th token fell back to a FLAT 7 — bar 1 rang a foreign Bb (as a low octave dyad, which is why it read as left hand), bar 2 ground C natural against D\'s F#. Bars 3-4 have real 7ths, which is why the third chord worked. The triad bars now waterfall the added SIXTH instead (C6, D6 — warm, diatonic); the left hand stays the minimum held root.',
  });
}

// ---------------------------------------------------------------------------
// 7. FAITHFUL — constant-structure planing, hand-voiced (the fixed upper
// triad CANNOT be chord-relative — that is the point of it).
// ---------------------------------------------------------------------------
{
  const upper = `note("[bb4,db5,f5]").s("piano").gain(0.5).room(0.45).clip(1.5)`;
  const bass = `note("<gb2 f2 ab2 g2 gb2 a2 db3 ab2>").s("piano").gain(0.5).room(0.3).clip(1.3)`;
  const tag = `note("[~@5 eb5@3]").s("piano").gain(0.3).room(0.5).clip(1.4)`;
  const mix = `stack(${upper}, ${bass}, ${tag})`;
  card({
    name: 'vl_planing_fixed', kind: 'FAITHFUL',
    title: 'One triad, eight names',
    techniques: ['constant-structure planing (fixed upper / walking bass)', 'the +13 major-2nd cluster tag'],
    sources: ['igexport-DaHBG7LtDab (Db constant-structure)'],
    key: 'Db:major', bpm: 66, degrees: V.vid_damn_planing.degrees, base: 'vid_damn_planing', family: 'major',
    symbols: ['F#Maj7', 'F7#5', 'DbMaj6/Ab', 'Gm7b5', 'F#Maj7', 'A-bass', 'Db/F', 'Db/Ab'], totalBars: 8,
    mix,
    solos: { _upper: upper, _bass: bass, _tag: tag },
    note: 'The Bbm triad (Bb-Db-F) is literally one held pattern; the bass walk renames it every bar. Two-thirds through each bar an Eb lands above the held Db — the major-2nd cluster that re-colors whatever is ringing.',
  });
}

// ---------------------------------------------------------------------------
// 7b. VARIANT — his substitution on the kept planing card. Round 1: "A-bass
// could also be replaced with another chord as a variant here." Bar 6's A
// bass becomes Eb: the same held Bbm triad now reads as an Ebm9 shell.
// ---------------------------------------------------------------------------
{
  const upper = `note("[bb4,db5,f5]").s("piano").gain(0.5).room(0.45).clip(1.5)`;
  const bass = `note("<gb2 f2 ab2 g2 gb2 eb2 db3 ab2>").s("piano").gain(0.5).room(0.3).clip(1.3)`;
  const tag = `note("[~@5 eb5@3]").s("piano").gain(0.3).room(0.5).clip(1.4)`;
  const mix = `stack(${upper}, ${bass}, ${tag})`;
  card({
    name: 'vl_planing_var', kind: 'VARIANT',
    title: 'One triad, eight names — his substitution',
    techniques: ['constant-structure planing (fixed upper / walking bass)', 'bass-note substitution as reharm'],
    sources: ['igexport-DaHBG7LtDab (Db constant-structure)', 'his round-1 note on vl_planing_fixed'],
    key: 'Db:major', bpm: 66, degrees: V.vid_damn_planing.degrees, base: 'vid_damn_planing', family: 'major',
    symbols: ['F#Maj7', 'F7#5', 'DbMaj6/Ab', 'Gm7b5', 'F#Maj7', 'Ebm9', 'Db/F', 'Db/Ab'], totalBars: 8,
    mix,
    solos: { _upper: upper, _bass: bass, _tag: tag },
    note: 'Identical to the kept card except bar 6: the A bass is replaced by Eb, so the unchanged Bbm triad renames itself Ebm9 instead of the chromatic A-bass rub. One bass note, a different sixth chord.',
  });
}

// ---------------------------------------------------------------------------
// 8. COMBINATION — the city-pop cadence pair with the climb-into pickup and
// the 9th bell tag. The pickup binds against the harmony ROTATED one chord
// forward, so its four 8ths announce the NEXT chord (the corpus device).
// ---------------------------------------------------------------------------
{
  // Round 3: "I like it, sounds jazzy, and I like what u did with the Ab^7
  // and the Dbm9 - turn this into a full song with progressions and
  // layers!" So: the praised pair becomes the CHORUS, and between its two
  // statements sits an 8-bar royal-road verse (IV^7 V7 iii7 vi9 — the
  // city-pop staple, all Ab major) carrying a held-note melody. One
  // concatenated 20-bar harmony; every mask is period 20 (D63). The
  // verse's chords are plain blocks + lids (calmer than the chorus); the
  // chorus keeps its verified round-3 treatments (block / lid / roll /
  // holds, one leap pickup, one bell per statement).
  // Round 4, two findings, both real: (1) "it's 6 chords and 4? where's the
  // time signature bound alignment" — the 6-bar chorus against 4-bar verses
  // broke phrase alignment. The chorus is now EIGHT bars: each 3-chord
  // phrase stretches to 4 with a breathing HOLD bar (the landed chord rings;
  // a low pedal touch + the 9th lid keep it alive — the aquatic card's kept
  // "figure bar + pedal hold bar" device). 24 bars total, everything on the
  // 4-bar grid: chorus 8, verse 8 (royal road twice), chorus 8. (2) "the
  // next ones are too dissonance" — MEASURED as the same walking-root
  // spiral the vamp had: the chorus root cycle ascends +12 per pass, so by
  // the final chorus the "octave 2" shells were sounding three octaves up,
  // crowded into the melody's register. Every layer now binds loopRoots
  // (D76); the final chorus renders identical to the first — the one he
  // called good. Ornaments: one roll, one leap pickup, one bell per chorus,
  // at phrase ends only (D74).
  const symsA = renderProgression(V.vid_citypop_ab_minor, 'Ab:minor');
  const symsB = renderProgression(V.vid_citypop_ab_major, 'Ab:major');
  const royal = renderProgression({ degrees: '5:^7 7:7 4:m7 9:m9', numerals: null }, 'Ab:major');
  const ch8 = [symsA[0], symsA[1], symsA[2], symsA[2], symsB[0], symsB[1], symsB[2], symsB[2]];
  const h24 = [...ch8, ...royal, ...royal, ...ch8];
  const rot24 = [...h24.slice(1), h24[0]];
  const T = 24;
  const ctx24 = { harmony: h24, barsPerChord: 1, key: 'Ab:major' };
  const rctx24 = { harmony: rot24, barsPerChord: 1, key: 'Ab:major' };
  const shell = { name: 'shell', bars: 1, onsets: ['0'], figure: ['R.R+'], accents: [0.7], legato: true };
  const shellHi = { name: 'shell-hi', bars: 1, onsets: ['0'], figure: ['3+.5+.7+.9+'], accents: [0.68], legato: true };
  const pedal = { name: 'hold-pedal', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.45], legato: true };
  const lid = { name: 'lid', bars: 1, onsets: ['1/2'], figure: ['9+'], accents: [0.5], legato: false };
  const roll = { name: 'roll-entry', bars: 1, onsets: ['0', '1/16', '1/8'], figure: ['R+', '3+', '5+.7+.9+'], accents: [0.6, 0.55, 0.66], legato: true };
  const leapIn = { name: 'leap-in', bars: 1, onsets: ['3/4', '7/8'], figure: ['5', 'R+'], accents: [0.5, 0.6], legato: false };
  const bellTag = { name: 'nine-bell', bars: 1, onsets: ['1/8'], figure: ['9++'], accents: [0.6], legato: false };
  const m24 = (entryF, ctxX, m, opts) =>
    `${fig(entryF, ctxX, { loopRoots: true, ...opts })}.mask("<${m}>")`;
  const loFx = { octave: 2, fx: '.gain(0.52).room(0.35).clip(1.3)' };
  const hiFx = { octave: 3, fx: '.gain(0.5).room(0.4).clip(1.3)' };
  const lidFx = { octave: 4, fx: '.gain(0.42).room(0.45)' };
  const melody = `note("<~@8 [F5@3 Eb5] [G5@2 Bb5@2] [Eb5@3 C5] [F5@2 Ab5 G5] [F5@3 Eb5] [G5@3 Db6] [C6@2 G5@2] [Ab5@3 F5] ~@8>").s("piano").gain(0.62).room(0.5).clip(1.15)`;
  const parts = [
    m24(shell, ctx24, '1 1 1 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0', loFx),
    m24(shellHi, ctx24, '1 1 1 0 0 1 1 0 1 1 1 1 1 1 1 1 1 1 1 0 0 1 1 0', hiFx),
    m24(pedal, ctx24, '0 0 0 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 1', { octave: 2, fx: '.gain(0.4).room(0.5).clip(1.5)' }),
    m24(lid, ctx24, '0 0 0 1 0 0 0 1 0 1 0 0 0 1 0 0 0 0 0 1 0 0 0 1', lidFx),
    m24(roll, ctx24, '0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0', hiFx),
    m24(leapIn, rctx24, '0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1', { octave: 4, fx: '.gain(0.42).room(0.35).clip(0.9)' }),
    m24(bellTag, ctx24, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', { octave: 4, fx: '.gain(0.4).room(0.55)' }),
    melody,
  ];
  const mix = `stack(${parts.join(', ')})`;
  card({
    name: 'vl_citypop_pair', kind: 'SONG',
    title: 'City-pop — the song',
    techniques: ['24 bars on the 4-bar grid: chorus 8 / verse 8 / chorus 8', 'chorus phrases stretched 3->4 with a breathing hold bar (pedal + 9th lid)', 'verse: royal road (IV^7 V7 iii7 vi9) with the held-note melody', 'loop-locked walking roots (D76 — the late-section register pile-up is gone)', 'ornaments one per phrase, at phrase ends (roll / leap pickup / bell)'],
    sources: ['igexport-DYcEDDITmvV (City Pop Type Piano Chords)', 'his round-4 note'],
    key: 'Ab:minor / Ab:major', bpm: 103, degrees: V.vid_citypop_ab_minor.degrees, base: 'vid_citypop_ab_minor', family: 'minor',
    symbols: [...ch8, '|', ...royal], totalBars: T,
    mix,
    solos: { _melody: melody, _shells: `stack(${parts[0]}, ${parts[1]})`, _holds: `stack(${parts[2]}, ${parts[3]})`, _roll: parts[4], _pickup: parts[5], _bell: parts[6] },
    note: 'Both your findings were real. The 6-and-4 misalignment: the chorus is now 8 bars — each 3-chord phrase gets a 4th breathing bar where the landed chord holds (low pedal + the 9th lid), so the whole form sits on the 4-bar grid: chorus 8, verse 8, chorus 8. The "too dissonance" later sections: measured, the walking roots were spiralling an octave per pass, so the final chorus was sounding three octaves above the first, crowded into the melody register — the binder now folds the walk back (D76), and the last chorus renders IDENTICAL to the first one you liked.',
  });
}

// ---------------------------------------------------------------------------
// 9. COMBINATION — K-pop/R&B pads + the two-note pickup tags on top.
// ---------------------------------------------------------------------------
{
  // Round 1: "the second chord's two notes fall sounded like it didn't align
  // … there shouldn't be a fall after every chord … also the fifth chord
  // doesn't fit in too well." Three fixes: the loop is the FIRST FOUR chords
  // (the 3:7 fifth is dropped, which also squares the odd 5-bar cycle); the
  // falls land only at the two phrase ends AND are bound to the ROTATED
  // harmony so the two notes spell the chord they fall INTO (the
  // misalignment was harmonic — a current-chord fall landing on the next
  // chord's downbeat); and the resolution bar re-strikes a higher rotation
  // at the and-of-2 so the chord rhythm is not one strike per bar
  // throughout. All masks are period 4 = the loop (D63).
  const syms4 = renderProgression(V.vid_kpop_rnb, 'D:minor').slice(0, 4);
  const ctx = { harmony: syms4, barsPerChord: 1, key: 'D:minor' };
  const rot4 = { harmony: [...syms4.slice(1), syms4[0]], barsPerChord: 1, key: 'D:minor' };
  const pads = fig({ name: 'pad', bars: 1, onsets: ['0'], figure: ['R.3+.5+.7+'], accents: [0.7], legato: true }, ctx, { octave: 2, fx: '.gain(0.55).room(0.45).clip(1.4)' });
  const restrike = `${fig({ name: 'pad-restrike', bars: 1, onsets: ['5/8'], figure: ['3+.5+.7+.9+'], accents: [0.5], legato: false }, ctx, { octave: 3, fx: '.gain(0.4).room(0.45).clip(1.1)' })}.mask("<0 0 1 0>")`;
  const tags = `${fig(F.vid_tag_two_note_pickup, rot4, { octave: 4, fx: '.gain(0.45).room(0.4)' })}.mask("<0 1 0 1>")`;
  card({
    name: 'vl_kpop_tags', kind: 'COMBINATION',
    title: 'K-pop pads with the two-note sigh',
    techniques: ['bVI-V7#5-i block pads', 'b3→9 two-note pickup at phrase ends only'],
    sources: ['igexport-DbuFbACtERO (K-Pop/R&B)', 'igexport-DbEktz0I_j8 (the tag)'],
    key: 'D:minor', bpm: 98, degrees: '8:^7 7:7 0:m7 10:m7', base: 'vid_kpop_rnb', family: 'minor',
    symbols: syms4, totalBars: 8,
    mix: `stack(${pads}, ${restrike}, ${tags})`,
    solos: { _pads: pads, _restrike: restrike, _tags: tags },
    note: 'Round-1 fixes applied: four-chord loop (the odd fifth chord is gone), the sigh only into bars 3 and 1 — and its two notes now spell the chord they land ON, which is what "didn\'t align" was — plus a soft higher re-strike on the resolution bar.',
  });
}

// ---------------------------------------------------------------------------
// 10. VARIANT — his split-bar idea on the KEPT kpop card. (The gospel card
// that lived in this slot was killed in round 2 — "everything after the
// first four sounds weird, and the first four are unappealing" — the eye-
// read failed AND the diatonic rescue failed, so vid_damn_gospel is banned
// and the roll-in device stays unvindicated in the corpus book.)
// ---------------------------------------------------------------------------
{
  // Round 3: "make this a full song with progressions and layers!" Form:
  // A A' B B A A' over 24 bars — A is the kept loop, A' ends in his
  // split bar, B is a new bridge (bIII^7 bVI^7 V7 i9 — F^7 Bb^7 A7 Dm9,
  // the r&b lament frame) carrying a held-note melody over a synth-bass
  // floor. The split bar at the end of the first A A' now ANNOUNCES the
  // bridge: its higher half-chord is F^7, the next section's opener. One
  // concatenated 24-bar harmony; split masks period 24, the per-4-bar
  // devices (sighs, restrike) keep period 4, which the 24-bar loop
  // contains exactly (D63).
  const syms4 = renderProgression(V.vid_kpop_rnb, 'D:minor').slice(0, 4);
  // labeled m7, not m9 — the pad grip is R.3.5.7, so a 9 in the symbol
  // would never sound (the round-4 verify pass measured exactly that)
  const b4 = renderProgression({ degrees: '3:^7 8:^7 7:7 0:m7', numerals: null }, 'D:minor');
  const h24 = [...syms4, ...syms4, ...b4, ...b4, ...syms4, ...syms4];
  const rot24 = [...h24.slice(1), h24[0]];
  const ctx = { harmony: h24, barsPerChord: 1, key: 'D:minor' };
  const rctx = { harmony: rot24, barsPerChord: 1, key: 'D:minor' };
  const padF = { name: 'pad', bars: 1, onsets: ['0'], figure: ['R.3+.5+.7+'], accents: [0.7], legato: true };
  const pads = `${fig(padF, ctx, { octave: 2, fx: '.gain(0.55).room(0.45).clip(1.4)' })}.mask("<1@7 0 1@15 0>")`;
  const padHalf = `${fig(padF, ctx, { octave: 2, fx: '.gain(0.55).room(0.45).clip(0.5)' })}.mask("<0@7 1 0@15 1>")`;
  // rootless A-form (5-7-9-10): his spec says the split chord is "the
  // other (HIGHER note) chord", and two rounds of measurement showed
  // root-position and 3-5-7-9 voicings topping at or below the pad's Bb4
  // on the Bb bar — the 10th on top clears the pad on both split bars
  // (D5 > Bb4 on the Bb^7 split, A5 > Bb4 on the F^7 split)
  const splitHi = `${fig({ name: 'split-hi', bars: 1, onsets: ['1/2'], figure: ['5+.7+.9+.3++'], accents: [0.62], legato: true }, rctx, { octave: 2, fx: '.gain(0.5).room(0.45).clip(0.95)' })}.mask("<0@7 1 0@15 1>")`;
  // ...and the verify pass caught that the sighs were not the only high
  // material over the melody: this re-strike stab (topping G6) also landed
  // on bridge bars 11 and 15 while the melody sang. Same rule, applied
  // consistently — it yields for the whole bridge, keeps bars 3/7/19/23.
  const restrike = `${fig({ name: 'pad-restrike', bars: 1, onsets: ['5/8'], figure: ['3+.5+.7+.9+'], accents: [0.5], legato: false }, ctx, { octave: 3, fx: '.gain(0.4).room(0.45).clip(1.1)' })}.mask("<0 0 1 0 0 0 1 0 0@8 0 0 1 0 0 0 1 0>")`;
  // Round 4 (his keep note): "when the melody comes, the high two-note fall
  // clashes with it (too high and doesn't align sound wise)". The sighs live
  // at octave 4-5 — the melody's own register — so during the bridge (bars
  // 9-16, where the melody sings) they now yield entirely; everywhere else
  // they keep their kept alternation. Ornaments yield to the melody: the
  // melody outranks every decoration (the D73 mix rule, extended).
  const tags = `${fig(F.vid_tag_two_note_pickup, rctx, { octave: 4, fx: '.gain(0.45).room(0.4)' })}.mask("<0 1 0 1 0 1 0 1 0@8 0 1 0 1 0 1 0 1>")`;
  const sub = fig({ name: 'sub', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.75], legato: true }, ctx, { sound: 'gm_synth_bass_1', octave: 2, fx: '.gain(0.8).clip(1.02)' });
  const melody = `note("<~@8 [A5@2 G5 F5] [D5@3 F5] [E5@2 C#5@2] [D5@3 A4] [A5@2 G5 F5] [G5@3 D5] [E5@2 A4 C#5] [D5] ~@8>").s("piano").gain(0.62).room(0.5).clip(1.15)`;
  const mix = `stack(${pads}, ${padHalf}, ${splitHi}, ${restrike}, ${tags}, ${sub}, ${melody})`;
  card({
    name: 'vl_kpop_split', kind: 'SONG',
    title: 'K-pop split — the song',
    techniques: ['A A′ B B A A′ over 24 bars', 'his split bar, now announcing the bridge', 'bridge: bIII^7 bVI^7 V7 i7 with held-note melody', 'synth-bass floor + b3→9 sighs that yield to the melody'],
    sources: ['igexport-DbuFbACtERO (K-Pop/R&B)', 'his round-3 note'],
    key: 'D:minor', bpm: 98, degrees: '8:^7 7:7 0:m7 10:m7', base: 'vid_kpop_rnb', family: 'minor',
    symbols: [...syms4, '|', ...b4], totalBars: 24,
    mix,
    solos: { _pads: `stack(${pads}, ${padHalf})`, _split: splitHi, _melody: melody, _sub: sub, _tags: tags, _restrike: restrike },
    note: 'From your keep note: ALL the high decorations now go SILENT for the whole bridge — the two-note sighs you named, and also a high chord re-strike the measurement pass caught ringing above the melody on two bridge bars. Where the melody rests, both keep their kept placement. Everything else is untouched.',
  });
}

// ---- every mix through the engine's own transpiler -------------------------
let checked = 0;
const CHECKS = [];
for (const c of cards) {
  CHECKS.push([c.name, 'mix', c.mix, c.bpm, c.totalBars]);
  for (const [id, expr] of Object.entries(c.solos)) CHECKS.push([c.name, id, expr, c.bpm, c.totalBars]);
}
for (const [name, tid, expr, bpm, totalBars] of CHECKS) {
  const code = `setcpm(${bpm}/4)\np: stack(${expr})`;
  const ev = await evaluateSong(code);
  const haps = hapsByLabel(ev, 0, Math.max(8, totalBars ?? 8)).get('p');
  if (!haps || haps.error || !haps.haps.length) {
    throw new Error(`${name}/${tid} produced no haps: ${haps?.error ?? 'empty'}`);
  }
  checked++;
}

// D71 verify-pass guard: the elevator's arrival must be EXACTLY the
// departure theme +1 semitone, bar for bar. Its lift compensates a binder
// register walk measured at +12 — if the binder's register logic ever
// changes, this throws instead of shipping a lurching arrival again.
{
  const c = cards.find((x) => x.name === 'vl_elevator');
  const ev = await evaluateSong(`setcpm(${c.bpm}/4)\np: stack(${c.mix})`);
  const haps = hapsByLabel(ev, 0, 17).get('p').haps;
  const byBar = Array.from({ length: 17 }, () => []);
  for (const h of haps) byBar[Math.floor(h.whole.begin)].push(h.value.note);
  for (const b of byBar) {
    if (b.some((v) => typeof v !== 'number')) throw new Error('vl_elevator guard expects numeric notes after .add()');
    b.sort((x, y) => x - y);
  }
  for (let i = 0; i < 6; i++) {
    const d = byBar[10 + i].map((v, k) => v - byBar[i][k]);
    if (d.length !== byBar[i].length || !d.every((x) => x === 1)) {
      throw new Error(`vl_elevator arrival bar ${11 + i} is not departure+1: deltas [${d}]`);
    }
  }
}

const DATA = { cards };
const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'videolab.html'), html);
console.log(`wrote audition/videolab.html — ${cards.length} technique-lab cards`);
for (const c of cards) console.log(`  ${c.name} [${c.kind}]: ${c.title} — ${c.key} @${c.bpm}`);
console.log(`  ${checked}/${CHECKS.length} exprs evaluated green through the engine's own transpiler`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
if (FIG_WARNINGS.size) {
  console.log(`  binder warnings (${FIG_WARNINGS.size}) — review each; a fallback interval can be a foreign pitch (D76):`);
  for (const w of FIG_WARNINGS) console.log(`    ${w}`);
}

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>video technique lab — audition</title>
<style>
  :root { color-scheme: dark; --bg:#14141a; --panel:#1b1b24; --line:#2b2b36; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#4c6ef5; --keep:#37b24d; --kill:#e03131; }
  * { box-sizing: border-box; }
  body { font: 13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  button { font:inherit; border-radius:6px; border:1px solid #3a3a4a; background:#1e1e28; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5a6e; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 90px; max-width:1100px; margin:0 auto; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:12px 14px; margin-bottom:12px; }
  .card.playing { border-color:var(--accent); background:#1e2438; }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.7; }
  .vibe { font-size:16px; font-weight:700; }
  .kind { font-size:11px; padding:1px 7px; border-radius:9px; border:1px solid #3a3a4a; color:var(--dim); }
  .meta { font-size:12px; color:var(--dim); margin:3px 0; }
  .sym { font-family: ui-monospace, Menlo, monospace; font-size:12.5px; margin:4px 0; }
  .tech { font-size:12px; margin:3px 0; }
  .tech span { display:inline-block; background:rgba(76,110,245,.12); border:1px solid rgba(76,110,245,.3); border-radius:9px; padding:0 8px; margin:1px 3px 1px 0; }
  select { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:3px 7px; font:inherit; }
  .acts { display:flex; gap:6px; margin-top:8px; align-items:center; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .notebox { width:100%; margin-top:7px; padding:4px 7px; font-size:12px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>video technique lab — what the 23 videos taught, played</h1>
    <span class="now" id="now">— click ▶ on a card —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">FAITHFUL = the technique as its video plays it · TRANSPLANT = a video device on OUR material · COMBINATION = devices composed · REVISION/VARIANT = your round-1 notes applied. Keep/kill judges the TECHNIQUE AS RENDERED — notes tell me which half to fix. Round 2: clear any old note that no longer applies before exporting.</span>
  </div>
</header>
<main id="cards"></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:videolab-verdicts';
const LSN = 'motif-engine:videolab-notes';
let verdicts = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let notes = {};
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
// D73 (his report: "when I try to copy json it says js error"): localStorage
// persists across rounds, and a verdict for a card this round REMOVED
// (vl_tyler_melt, killed in round 1) made the export dereference undefined.
// Stale keys are pruned on load — they were already imported the round they
// were made, and they can never re-export.
const known = {};
DATA.cards.forEach(function (c) { known[c.name] = true; });
Object.keys(verdicts).forEach(function (n) { if (!known[n]) delete verdicts[n]; });
Object.keys(notes).forEach(function (n) { if (!known[n]) delete notes[n]; });
let playing = null;
const $ = (id) => document.getElementById(id);
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };
const solo = {};

function codeFor(c) {
  const which = solo[c.name] || 'mix';
  const expr = which === 'mix' ? c.mix : c.solos[which];
  if (!expr) return null;
  return 'setcpm(' + c.bpm + '/4)\\np: stack(' + expr + ')';
}
async function play(c) {
  const code = codeFor(c);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = c.name;
  $('now').textContent = '\\u25b6 ' + c.name + ' (' + (solo[c.name] || 'mix') + ')';
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }
function esc(t) { const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

function render() {
  $('cards').innerHTML = DATA.cards.map(function (c) {
    const v = verdicts[c.name];
    const opts = ['mix'].concat(Object.keys(c.solos)).map(function (k) {
      return '<option' + ((solo[c.name] || 'mix') === k ? ' selected' : '') + '>' + k + '</option>';
    }).join('');
    return '<div class="card' + (playing === c.name ? ' playing' : '') + (v ? ' ' + v : '') + '">' +
      '<div class="row"><span class="vibe">' + esc(c.title) + '</span>' +
      '<span class="kind">' + c.kind + '</span>' +
      '<span class="dim">' + esc(c.name) + '</span>' +
      '<button data-play="' + c.name + '">\\u25b6 play</button>' +
      '<select data-solo="' + c.name + '">' + opts + '</select></div>' +
      '<div class="meta">' + esc(c.key) + ' \\u00b7 ' + c.bpm + 'bpm \\u00b7 ' + c.totalBars + ' bars \\u00b7 from: ' + esc(c.sources.join(' + ')) + '</div>' +
      '<div class="sym">' + esc(c.symbols.join(' ')) + '</div>' +
      '<div class="tech">' + c.techniques.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="meta">' + esc(c.note) + '</div>' +
      '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-n="' + c.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-n="' + c.name + '">kill</button>' +
      '</div>' +
      '<input class="notebox" data-note="' + c.name + '" placeholder="notes\\u2026 (what works, what to combine next)" value="' + esc(notes[c.name] || '') + '">' +
      '</div>';
  }).join('');
  $('tally').textContent = Object.keys(verdicts).length + '/' + DATA.cards.length + ' judged \\u00b7 ' + Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes';
  document.querySelectorAll('[data-play]').forEach(function (b) {
    b.onclick = function () { play(DATA.cards.find(function (c) { return c.name === b.dataset.play; })); };
  });
  document.querySelectorAll('[data-solo]').forEach(function (sel) {
    sel.onchange = function () {
      solo[sel.dataset.solo] = sel.value;
      if (playing === sel.dataset.solo) play(DATA.cards.find(function (c) { return c.name === sel.dataset.solo; }));
    };
  });
  document.querySelectorAll('.acts button').forEach(function (b) {
    b.onclick = function () {
      const n = b.dataset.n;
      verdicts[n] = verdicts[n] === b.dataset.v ? undefined : b.dataset.v;
      if (!verdicts[n]) delete verdicts[n];
      save(); render();
    };
  });
  document.querySelectorAll('.notebox').forEach(function (inp) {
    inp.oninput = function () { notes[inp.dataset.note] = inp.value; save(); };
    inp.onkeydown = function (ev) { ev.stopPropagation(); };
  });
}
$('stop').onclick = stop;
$('export').onclick = function () {
  const derived = {};
  Object.keys(verdicts).forEach(function (n) {
    const c = DATA.cards.find(function (x) { return x.name === n; });
    if (!c) return; // stale key from an earlier round — already imported then
    derived[n] = { verdict: verdicts[n], family: c.family, degrees: c.degrees, base: c.base };
  });
  const out = {
    page: 'videolab', generated: new Date().toISOString(),
    derived: derived,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    cards: DATA.cards.map(function (c) { return { name: c.name, kind: c.kind, techniques: c.techniques, degrees: c.degrees, base: c.base, family: c.family }; }),
  };
  navigator.clipboard.writeText(JSON.stringify(out, null, 2));
  $('export').textContent = 'copied!';
  setTimeout(function () { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') stop(); });
render();
</script>
</body>
</html>
`;
}
