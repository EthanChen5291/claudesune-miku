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
const fig = (entry, ctx, opts) => bindFigure(entry, ctx, '4/4', { sound: 'piano', ...opts }).expr;

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
  const syms = renderProgression(V.vid_gsharp_climb, 'G#:minor').slice(0, 2);
  const ctx = { harmony: syms, barsPerChord: 1, key: 'G#:minor' };
  const climb = fig(F.vid_climb_block_restrike, ctx, { octave: 3, fx: '.gain(0.62).room(0.45).clip(0.85)' });
  card({
    name: 'vl_gsharp_vamp', kind: 'REVISION',
    title: 'G#m9 vamp — just the two chords he liked',
    techniques: ['block-restrike octave climb', 'i9–iv9 two-chord vamp'],
    sources: ['igexport-DceNMCmuYZV (G#m9 reel)', 'his round-1 note on vl_gsharp_climb'],
    key: 'G#:minor', bpm: 80, degrees: '0:m9 5:m9', base: 'vid_gsharp_climb', family: 'minor',
    symbols: syms, totalBars: 8,
    mix: climb,
    solos: { _climb: climb },
    note: 'Round 1 on the kept climb: "I liked the first two, the third and fourth chords didn\'t sound good." Same terraced climb and tags, but the harmony never leaves the i9–iv9 pair.',
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
  // Round 1: "I can barely hear the low notes while the high notes are
  // extremely loud" — a square wave reads far louder than its gain, and the
  // celesta tag was voiced at C7. Rebalanced: bass way up, square down, the
  // bell an octave lower and softer.
  const climb = fig(F.vid_climb_bronik_add9, ctxStatic, { sound: 'gm_lead_1_square', octave: 4, fx: '.gain(0.28).room(0.3).clip(0.7)' });
  const bass = `note("<c2 bb1 ab1 g1>").s("gm_synth_bass_1").gain(0.9).clip(1.1)`;
  const bell = fig({ name: 'bell-tag', bars: 2, onsets: ['3/4', '7/8'], figure: ['R++', '9++'], accents: [0.6, 0.55], legato: false }, ctxStatic, { sound: 'gm_celesta', octave: 4, fx: '.gain(0.26).room(0.5)' });
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
    note: 'The arp literally never changes — only the bass moves (C Bb Ab G), so the same eight notes re-name themselves four ways. Rebalanced after round 1: bass up, square and bell down, bell dropped an octave.',
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
  const T = 16;
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
  const allSyms = [...symsA, ...symsA, ...symsB, ...symsA, ...symsA];
  const ctx = { harmony: allSyms, barsPerChord: 1, key: 'Ab:minor' };
  const lift = `.add(note("<0@10 -11@6>"))`;
  const gripX = `${fig(grip, ctx, { octave: 3, fx: '.gain(0.58).room(0.4).clip(1.2)' })}${lift}`;
  const bassX = `${fig(bassF, ctx, { octave: 2, fx: '.gain(0.52)' })}${lift}`;
  const mix = `stack(${gripX}, ${bassX})`;
  const gA = gripX, gB = bassX, gC = mix;
  card({
    name: 'vl_elevator', kind: 'COMBINATION',
    title: 'The dominant elevator — one grip, two keys',
    techniques: ['m7(11) quartal grip', 'chromatic altered-dominant elevator (modulation, not color)', 'planing at song scale'],
    sources: ['igexport-Db-2YGCvU68 (pixel-font modulation reel)'],
    key: 'Ab:minor → A:minor', bpm: 86, degrees: V.vid_pixel_abm.degrees, base: 'vid_pixel_abm', family: 'minor',
    symbols: [...symsA, '|', ...symsB, '|', ...symsC], totalBars: T,
    mix,
    solos: { _grip: gA, _bass: gB },
    note: 'Six bars of the Abm grip, then C7b13-D7b13-Eb7alt-E7 climbing, then the SAME six bars a semitone up — departure and arrival are one theme, so only the key changes. The elevator is the only place the corpus allows frequent AND altered dominants.',
  });
}

// ---------------------------------------------------------------------------
// 6. TRANSPLANT — the arp under-shadow on OUR water harmony.
// "add a note below every arp note" over ut_once_upon_a_time_p3 (the D67
// calm-water base he kept the harmony of).
// ---------------------------------------------------------------------------
{
  const ctx = { harmony: renderProgression({ degrees: '0 2 5:^7 0:7', numerals: null }, 'C:major'), barsPerChord: 1, key: 'C:major' };
  // Round 1: "the left hand needs some work - it doesn't match that well.
  // overall idea is good" — the static R.5 block sat still under a moving
  // waterfall. Now the left hand rocks root → fifth in halves under the
  // pedal, so both hands move at related rates; more room on both (his
  // aquatic rule: water wants reverb and damper).
  const shadow = fig(F.vid_arp_undershadow, ctx, { octave: 4, fx: '.gain(0.55).room(0.6).clip(1.4)' });
  const bass = fig({ name: 'rock', bars: 1, onsets: ['0', '1/2'], figure: ['R', '5'], accents: [0.62, 0.5], legato: true }, ctx, { octave: 2, fx: '.gain(0.48).room(0.6).clip(1.5)' });
  card({
    name: 'vl_undershadow_water', kind: 'TRANSPLANT',
    title: 'Under-shadowed arp on the water harmony',
    techniques: ['arp under-shadow (dyad waterfall)', 'root+5th frame'],
    sources: ['sr 13-26-56 (arp trick)', 'our ut_once_upon_a_time_p3 (your kept water harmony)'],
    key: 'C:major', bpm: 60, degrees: '0 2 5:^7 0:7', base: 'ut_once_upon_a_time_p3', family: 'major',
    symbols: ctx.harmony, totalBars: 8,
    mix: `stack(${shadow}, ${bass})`,
    solos: { _shadow: shadow, _bass: bass },
    note: 'The robotic-arp fix applied to our own material: every note of the descending waterfall carries a chord-tone shadow, pairs inverting as it falls. Round-1 fix: the left hand now rocks root-to-fifth in halves instead of one static block, deeper pedal on both hands.',
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
  const symsA = renderProgression(V.vid_citypop_ab_minor, 'Ab:minor');
  const symsB = renderProgression(V.vid_citypop_ab_major, 'Ab:major');
  const T = 6;
  const rot = (a) => [...a.slice(1), a[0]];
  // Round 1: "it shouldn't just always be chromatic leadup … sounds like a
  // piano exercise since it's so uniform … there shouldn't be a fall after
  // every chord, the rhythm of the chords should be altered a bit." So: ONE
  // pickup per phrase, into the landing only, and a DIFFERENT pickup per
  // phrase (two-note sigh in the minor half, the four-8th climb in the
  // major half); the bell rings only after the two landings; and the V bar
  // re-strikes a higher rotation at the and-of-2 so the chord rhythm itself
  // varies. Every mask is period 6 = the cycle, so nothing drifts (D63).
  const shell = { name: 'shell', bars: 1, onsets: ['0'], figure: ['R.R+'], accents: [0.7], legato: true };
  const shellHi = { name: 'shell-hi', bars: 1, onsets: ['0'], figure: ['3+.5+.7+.9+'], accents: [0.68], legato: true };
  const reStrike = { name: 'restrike', bars: 1, onsets: ['5/8'], figure: ['5+.7+.9+.3++'], accents: [0.5], legato: false };
  const sigh = { name: 'sigh-in', bars: 1, onsets: ['3/4', '7/8'], figure: ['7', 'R+'], accents: [0.5, 0.58], legato: false };
  const climbIn = { name: 'climb-in', bars: 1, onsets: ['1/2', '5/8', '3/4', '7/8'], figure: ['5', '6', '7', 'R+'], accents: [0.55, 0.58, 0.62, 0.66], legato: false };
  const bellTag = { name: 'nine-bell', bars: 1, onsets: ['1/8'], figure: ['9++'], accents: [0.6], legato: false };
  const seg = (entryF, syms, key, m, opts) =>
    `${fig(entryF, { harmony: syms, barsPerChord: 1, key }, opts)}.mask("<${m}>")`;
  const parts = [];
  for (const [syms, key, m, vBar, pk] of [
    [symsA, 'Ab:minor', '1@3 0@3', '0 1 0 0 0 0', sigh],
    [symsB, 'Ab:major', '0@3 1@3', '0 0 0 0 1 0', climbIn],
  ]) {
    parts.push(seg(shell, syms, key, m, { octave: 2, fx: '.gain(0.52).room(0.35).clip(1.3)' }));
    parts.push(seg(shellHi, syms, key, m, { octave: 3, fx: '.gain(0.5).room(0.4).clip(1.3)' }));
    parts.push(seg(reStrike, syms, key, vBar, { octave: 3, fx: '.gain(0.38).room(0.4).clip(1.1)' }));
    parts.push(seg(pk, rot(syms), key, vBar, { octave: 4, fx: '.gain(0.42).room(0.35).clip(0.9)' }));
  }
  parts.push(seg(bellTag, symsA, 'Ab:minor', '0 0 1 0 0 0', { octave: 4, fx: '.gain(0.4).room(0.55)' }));
  parts.push(seg(bellTag, symsB, 'Ab:major', '0 0 0 0 0 1', { octave: 4, fx: '.gain(0.4).room(0.55)' }));
  const mix = `stack(${parts.join(', ')})`;
  card({
    name: 'vl_citypop_pair', kind: 'COMBINATION',
    title: 'City-pop cadence pair — enter early, decorate late',
    techniques: ['iv9-V-i / iv9-V-I mode-flip answer', 'climb-into pickup announcing the NEXT chord', '9th-in-octaves bell tag after the landing'],
    sources: ['igexport-DYcEDDITmvV (City Pop Type Piano Chords)'],
    key: 'Ab:minor / Ab:major', bpm: 103, degrees: V.vid_citypop_ab_minor.degrees, base: 'vid_citypop_ab_minor', family: 'minor',
    symbols: [...symsA, '|', ...symsB], totalBars: T,
    mix,
    solos: { _pickups: `stack(${parts[3]}, ${parts[7]})`, _restrikes: `stack(${parts[2]}, ${parts[6]})`, _bells: `stack(${parts[8]}, ${parts[9]})` },
    note: 'Round-1 fixes applied: one pickup per phrase (a two-note sigh into the minor landing, the four-8th climb into the major one — both bound to the rotated harmony so they spell the coming chord), the bell only after the two landings, and the V bar re-strikes a higher rotation mid-bar so the chord rhythm varies.',
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
// 10. FAITHFUL — the gospel turnaround with roll-in shells: every chord
// arrives as root + naked high color note, inner voices rolling in after.
// ---------------------------------------------------------------------------
{
  // Round 1: "third chord and fourth chord and fifth chord don't fit in.
  // sounds weird" — that was the eye-read 8:m9 5:m 3:m7 run. Replaced with
  // the diatonic gospel bridge (vi9 then iii7), which also puts the passing
  // dim where it belongs (iii → biii°7 → …) and squares the phrase from 9
  // bars to 8. The unfaulted tail is untouched. REVISION, no longer a
  // faithful eye-read of the video.
  const gospelV2 = { degrees: '5:^7 7:7 9:m9 4:m7 3:o7 1:m9 7:7 0:^7', numerals: null };
  const ctx = { harmony: renderProgression(gospelV2, 'Db:major'), barsPerChord: 1, key: 'Db:major' };
  const rollin = fig({
    name: 'roll-in', bars: 1,
    onsets: ['0', '1/4', '3/8', '1/2'],
    figure: ['R.7++', '3+', '5+', '9+'],
    accents: [0.75, 0.55, 0.55, 0.6], legato: true,
  }, ctx, { octave: 2, fx: '.gain(0.55).room(0.5).clip(1.4)' });
  card({
    name: 'vl_gospel_rollin', kind: 'REVISION',
    title: 'Gospel turnaround, chords as questions',
    techniques: ['roll-in shells (root + naked color note first)', 'IV-V-vi-iii turnaround with passing dim'],
    sources: ['igexport-DbOexm8RS5a (Db gospel)', 'his round-1 note'],
    key: 'Db:major', bpm: 66, degrees: gospelV2.degrees, base: 'vid_damn_gospel', family: 'major',
    symbols: ctx.harmony, totalBars: 8,
    mix: rollin,
    solos: { _rollin: rollin },
    note: 'Round 1: chords 3-5 "don\'t fit in" — replaced with the diatonic vi9 and iii7, phrase squared to 8 bars, everything he didn\'t fault untouched. Each chord still opens as bass root + naked 7th, then the 3rd, 5th, 9th roll in one at a time.',
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
  const haps = hapsByLabel(ev, 0, 16).get('p').haps;
  const byBar = Array.from({ length: 16 }, () => []);
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
